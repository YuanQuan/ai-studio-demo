import { getLevelConfig } from './GameplayConfig';
import type { AppliedMerge, GameplaySession } from './GameplaySession';
import type { PhysicsCatDescriptor, PhysicsFacade } from '../physics/PhysicsFacade';

/**
 * 核心领域层与实际物理引擎之间的编排器。
 * Cocos 适配器只需实现 PhysicsFacade；本类保持无 cc.* 依赖。
 */
export class GameplayRuntime {
  constructor(
    readonly session: GameplaySession,
    readonly physics: PhysicsFacade,
  ) {}

  setPaused(paused: boolean): void {
    this.session.setPaused(paused);
    this.physics.pause(paused);
  }

  restart(initialAimX = 0): void {
    this.physics.reset();
    this.session.restart(initialAimX);
  }

  releaseCurrent(spawnY = 0): number {
    const runtimeId = this.session.releaseCurrent(spawnY);
    const cat = this.session.registry.get(runtimeId);
    if (!cat) throw new Error(`释放后找不到 runtimeId=${runtimeId}`);
    this.physics.createCat(this.toPhysicsDescriptor(cat.runtimeId));
    return runtimeId;
  }

  fixedStep(): AppliedMerge[] {
    if (this.session.paused || this.session.runState !== 'RUNNING') return [];

    const contacts = this.physics.stepAndCollectContacts(this.session.fixedDt);

    // 物理步后先把真实 Body 中心同步回领域 Registry，合成结果位置才会基于当前接触位置，
    // 而不是猫咪刚生成时的旧坐标。
    for (const cat of this.session.registry.active()) {
      const position = this.physics.getCatPosition(cat.runtimeId);
      if (position) this.session.registry.setPosition(cat.runtimeId, position);
    }

    const merges = this.session.beginFixedStep(contacts);

    for (const merge of merges) {
      // 领域配对已经锁定后才改变物理对象，避免 Contact Callback 顺序污染业务决策。
      this.physics.removeCat(merge.sourceA);
      this.physics.removeCat(merge.sourceB);
      this.physics.createCat(this.toPhysicsDescriptor(merge.resultId));
    }

    // 必须在上面的 remove/create 完成后再查询危险状态，保证“合成救场优先于死亡”。
    const dangerousCatIds = this.physics.queryDangerousCatIds(
      this.session.config.rules.dangerLineRatio,
    );
    const spawnExclusionClear = this.physics.isSpawnExclusionClear(
      this.session.lastDroppedRuntimeId,
    );
    this.session.finishFixedStep(dangerousCatIds, spawnExclusionClear);
    return merges;
  }

  private toPhysicsDescriptor(runtimeId: number): PhysicsCatDescriptor {
    const cat = this.session.registry.get(runtimeId);
    if (!cat) throw new Error(`找不到 runtimeId=${runtimeId}`);
    const config = getLevelConfig(this.session.config, cat.level);
    return {
      runtimeId: cat.runtimeId,
      level: cat.level,
      position: { ...cat.position },
      diameterRatio: config.diameterRatio,
      massScale: config.massScale,
      restitution: config.restitution,
      friction: config.friction,
      linearDamping: config.linearDamping,
      angularDamping: config.angularDamping,
    };
  }
}
