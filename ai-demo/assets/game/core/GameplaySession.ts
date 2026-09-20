import { CatRegistry } from './CatRegistry';
import { DangerSystem } from './DangerSystem';
import type { GameplayConfig } from './GameplayConfig';
import { cloneGameplayConfig, getFixedDt, validateGameplayConfig } from './GameplayConfig';
import type { RandomSource } from './RandomSource';
import { MergeResolver } from './MergeResolver';
import { ScoreSystem } from './ScoreSystem';
import { SpawnController } from './SpawnController';
import type {
  ContactPair,
  GameplayEvent,
  MergeCommand,
  RunResult,
  RunState,
  StepObservation,
  Vec2,
} from './GameplayTypes';
import type { DebugHarness } from '../debug/DebugHarness';

export interface AppliedMerge extends MergeCommand {
  resultId: number;
  scoreDelta: number;
}

export interface GameplaySnapshot {
  runId: number;
  step: number;
  runState: RunState;
  paused: boolean;
  score: number;
  highestLevel: number;
  dangerState: 'SAFE' | 'WARNING';
  dangerElapsed: number;
  spawn: ReturnType<SpawnController['snapshot']>;
  activeCatIds: number[];
  result?: RunResult;
}

/**
 * 纯领域会话，不直接依赖 Cocos Node / Collider / UI / VFX。
 * 一次固定步分成 beginFixedStep -> 物理适配层同步 merge 结果/查询危险 -> finishFixedStep，
 * 以保证危险判断使用“合成后的有效猫集合”。
 */
export class GameplaySession {
  readonly config: GameplayConfig;
  readonly registry = new CatRegistry();
  readonly spawn: SpawnController;
  readonly score: ScoreSystem;
  readonly danger: DangerSystem;
  readonly mergeResolver: MergeResolver;

  private runStateValue: RunState = 'RUNNING';
  private pausedValue = false;
  private runIdValue = 0;
  private stepValue = 0;
  private lastDroppedRuntimeIdValue?: number;
  private resultValue?: RunResult;
  private readonly events: GameplayEvent[] = [];
  private fixedStepOpen = false;

  constructor(
    config: GameplayConfig,
    random: RandomSource,
    private readonly debug?: DebugHarness,
  ) {
    this.config = cloneGameplayConfig(config);
    validateGameplayConfig(this.config);
    this.spawn = new SpawnController(this.config, random);
    this.score = new ScoreSystem(this.config);
    this.danger = new DangerSystem(this.config.rules.dangerTimeoutSec);
    this.mergeResolver = new MergeResolver(this.config.rules.maxMergeLevel);
    this.restart();
  }

  get runState(): RunState {
    return this.runStateValue;
  }

  get paused(): boolean {
    return this.pausedValue;
  }

  get stepNumber(): number {
    return this.stepValue;
  }

  get fixedDt(): number {
    return getFixedDt(this.config);
  }

  get result(): RunResult | undefined {
    return this.resultValue ? { ...this.resultValue } : undefined;
  }

  get lastDroppedRuntimeId(): number | undefined {
    return this.lastDroppedRuntimeIdValue;
  }

  setPaused(paused: boolean): void {
    this.pausedValue = paused;
    if (paused) this.debug?.log('玩法暂停：固定步、投放锁与危险计时均冻结');
  }

  restart(initialAimX = 0): void {
    this.runIdValue += 1;
    this.stepValue = 0;
    this.runStateValue = 'RUNNING';
    this.pausedValue = false;
    this.resultValue = undefined;
    this.lastDroppedRuntimeIdValue = undefined;
    this.fixedStepOpen = false;
    this.registry.reset();
    this.score.reset();
    this.danger.reset();
    this.spawn.reset(initialAimX);
    this.events.length = 0;
    this.debug?.clear();
    this.emit({ type: 'RunStarted', runId: this.runIdValue });
  }

  setAimX(requestedX: number, leftInner: number, rightInner: number, playableWidth: number): number {
    this.assertInputAllowed();
    const x = this.spawn.setAimX(requestedX, leftInner, rightInner, playableWidth);
    this.emit({ type: 'AimChanged', x });
    return x;
  }

  releaseCurrent(spawnY = 0): number {
    this.assertInputAllowed();
    if (this.spawn.state !== 'AIMING') throw new Error('当前投放仍处于 DROP_LOCKED');

    const level = this.spawn.release();
    const cat = this.registry.create(level, { x: this.spawn.aimX, y: spawnY }, this.stepValue);
    this.lastDroppedRuntimeIdValue = cat.runtimeId;
    const highest = this.score.observeLevel(level);
    this.emit({ type: 'CatReleased', runtimeId: cat.runtimeId, level, x: cat.position.x });
    if (highest !== undefined) this.emit({ type: 'HighestLevelChanged', level: highest });
    return cat.runtimeId;
  }

  forceNextLevelForDebug(level: number): void {
    this.spawn.forceNextLevel(level);
  }

  /**
   * 固定步第一阶段：基于本帧接触快照稳定选择并应用领域合成。
   * 返回结果供 PhysicsFacade 删除源 Body、创建结果 Body，然后再查询 post-merge danger。
   */
  beginFixedStep(contacts: ContactPair[]): AppliedMerge[] {
    if (this.fixedStepOpen) throw new Error('上一个固定步尚未 finishFixedStep');
    if (this.pausedValue || this.runStateValue !== 'RUNNING') return [];

    this.fixedStepOpen = true;
    this.stepValue += 1;
    const resolution = this.mergeResolver.resolve(this.registry, contacts);
    const applied: AppliedMerge[] = [];

    for (const command of resolution.selectedCommands) {
      this.registry.markPendingConsume(command.sourceA);
      this.registry.markPendingConsume(command.sourceB);
      this.registry.finalizeConsume(command.sourceA);
      this.registry.finalizeConsume(command.sourceB);

      const resultCat = this.registry.create(
        command.resultLevel,
        command.resultPosition,
        this.stepValue,
      );
      const scoreChange = this.score.applyMergeResult(command.resultLevel);
      const merge: AppliedMerge = {
        ...command,
        resultPosition: { ...command.resultPosition },
        resultId: resultCat.runtimeId,
        scoreDelta: scoreChange.delta,
      };
      applied.push(merge);

      this.emit({
        type: 'CatMergeSucceeded',
        sourceIds: [command.sourceA, command.sourceB],
        sourceLevel: command.sourceLevel,
        resultId: resultCat.runtimeId,
        resultLevel: command.resultLevel,
        scoreDelta: scoreChange.delta,
        position: { ...command.resultPosition },
      });
      this.emit({ type: 'ScoreChanged', score: scoreChange.score, delta: scoreChange.delta });
      if (scoreChange.highestLevelChanged !== undefined) {
        this.emit({ type: 'HighestLevelChanged', level: scoreChange.highestLevelChanged });
      }
    }

    this.debug?.recordMerge({
      step: this.stepValue,
      candidates: resolution.eligibleCandidates,
      selected: resolution.selectedCommands,
      consumedIds: resolution.consumedSourceIds,
    });

    return applied;
  }

  /**
   * 固定步第二阶段。dangerousCatIds 必须来自合成命令已经同步到物理世界后的查询。
   */
  finishFixedStep(dangerousCatIds: number[], spawnExclusionClear: boolean): void {
    if (this.pausedValue || this.runStateValue !== 'RUNNING') {
      this.fixedStepOpen = false;
      return;
    }
    if (!this.fixedStepOpen) throw new Error('必须先 beginFixedStep');

    const lastDropConsumed =
      this.lastDroppedRuntimeIdValue !== undefined && !this.registry.has(this.lastDroppedRuntimeIdValue);
    const unlocked = this.spawn.tick(this.fixedDt, spawnExclusionClear || lastDropConsumed);
    if (unlocked) this.emit({ type: 'SpawnUnlocked' });

    const hasDangerousCat = dangerousCatIds.some((id) => this.registry.has(id));
    const dangerUpdate = this.danger.update(hasDangerousCat, this.fixedDt);
    if (dangerUpdate.started) this.emit({ type: 'DangerStarted' });
    if (dangerUpdate.cleared) this.emit({ type: 'DangerCleared' });
    if (dangerUpdate.state === 'WARNING') {
      this.emit({
        type: 'DangerProgress',
        elapsed: dangerUpdate.elapsed,
        timeout: this.config.rules.dangerTimeoutSec,
      });
    }

    if (dangerUpdate.gameOver) {
      this.runStateValue = 'GAME_OVER';
      this.score.freeze();
      this.resultValue = {
        finalScore: this.score.score,
        highestLevel: this.score.highestLevel,
        reason: 'DANGER_TIMEOUT',
      };
      this.emit({ type: 'GameOver', result: { ...this.resultValue } });
    }

    this.debug?.recordStep({
      step: this.stepValue,
      activeCatIds: this.registry.activeIds(),
      spawnState: this.spawn.state,
      dropLockedElapsed: this.spawn.dropLockedElapsed,
      dangerState: this.danger.state,
      dangerElapsed: this.danger.elapsed,
    });
    this.fixedStepOpen = false;
  }

  /** 纯逻辑测试/无引擎 Harness 的便捷入口；dangerousCatIds 视为 post-merge 查询结果。 */
  runFixedStep(observation: StepObservation): AppliedMerge[] {
    const applied = this.beginFixedStep(observation.contacts);
    this.finishFixedStep(observation.dangerousCatIds, observation.spawnExclusionClear);
    return applied;
  }

  setCatPositionForDebug(runtimeId: number, position: Vec2): void {
    this.registry.setPosition(runtimeId, position);
  }

  snapshot(): GameplaySnapshot {
    return {
      runId: this.runIdValue,
      step: this.stepValue,
      runState: this.runStateValue,
      paused: this.pausedValue,
      score: this.score.score,
      highestLevel: this.score.highestLevel,
      dangerState: this.danger.state,
      dangerElapsed: this.danger.elapsed,
      spawn: this.spawn.snapshot(),
      activeCatIds: this.registry.activeIds(),
      ...(this.resultValue ? { result: { ...this.resultValue } } : {}),
    };
  }

  drainEvents(): GameplayEvent[] {
    return this.events.splice(0, this.events.length);
  }

  peekEvents(): readonly GameplayEvent[] {
    return this.events;
  }

  private assertInputAllowed(): void {
    if (this.runStateValue !== 'RUNNING') throw new Error('GAME_OVER 后不接受投放输入');
    if (this.pausedValue) throw new Error('暂停期间不接受投放输入');
  }

  private emit(event: GameplayEvent): void {
    this.events.push(event);
  }
}
