import type { GameplayConfig } from './GameplayConfig';
import { getLevelConfig } from './GameplayConfig';
import type { RandomSource } from './RandomSource';
import type { SpawnState } from './GameplayTypes';

export interface SpawnSnapshot {
  state: SpawnState;
  currentLevel: number;
  nextLevel: number;
  aimX: number;
  dropLockedElapsed: number;
}

export class SpawnController {
  private stateValue: SpawnState = 'AIMING';
  private currentLevelValue = 1;
  private nextLevelValue = 1;
  private aimXValue = 0;
  private dropLockedElapsedValue = 0;

  constructor(
    private readonly config: GameplayConfig,
    private readonly random: RandomSource,
  ) {}

  reset(initialAimX = 0): void {
    this.stateValue = 'AIMING';
    this.dropLockedElapsedValue = 0;
    this.aimXValue = initialAimX;
    this.currentLevelValue = this.rollDirectSpawnLevel();
    this.nextLevelValue = this.rollDirectSpawnLevel();
  }

  get state(): SpawnState {
    return this.stateValue;
  }

  get currentLevel(): number {
    return this.currentLevelValue;
  }

  get nextLevel(): number {
    return this.nextLevelValue;
  }

  get aimX(): number {
    return this.aimXValue;
  }

  get dropLockedElapsed(): number {
    return this.dropLockedElapsedValue;
  }

  snapshot(): SpawnSnapshot {
    return {
      state: this.stateValue,
      currentLevel: this.currentLevelValue,
      nextLevel: this.nextLevelValue,
      aimX: this.aimXValue,
      dropLockedElapsed: this.dropLockedElapsedValue,
    };
  }

  setAimX(requestedX: number, leftInner: number, rightInner: number, playableWidth: number): number {
    const diameter = getLevelConfig(this.config, this.currentLevelValue).diameterRatio * playableWidth;
    const radius = diameter / 2;
    const min = leftInner + radius;
    const max = rightInner - radius;
    if (min > max) throw new Error('当前猫咪尺寸大于可投放横向空间');
    this.aimXValue = Math.min(max, Math.max(min, requestedX));
    return this.aimXValue;
  }

  /**
   * 返回本次应释放的等级，并把 Next 提升为新的 Current。
   * 新 Current 在 DROP_LOCKED 期间不可再次释放。
   */
  release(): number {
    if (this.stateValue !== 'AIMING') throw new Error('当前不是 AIMING，不能释放');
    const releasedLevel = this.currentLevelValue;
    this.currentLevelValue = this.nextLevelValue;
    this.nextLevelValue = this.rollDirectSpawnLevel();
    this.stateValue = 'DROP_LOCKED';
    this.dropLockedElapsedValue = 0;
    return releasedLevel;
  }

  tick(dt: number, exclusionClear: boolean): boolean {
    if (this.stateValue !== 'DROP_LOCKED') return false;
    if (dt < 0) throw new Error('dt 不能为负数');
    this.dropLockedElapsedValue += dt;
    if (
      exclusionClear &&
      this.dropLockedElapsedValue + 1e-9 >= this.config.rules.minDropLockSec
    ) {
      this.stateValue = 'AIMING';
      return true;
    }
    return false;
  }

  forceNextLevel(level: number): void {
    if (!Number.isInteger(level) || level < 1 || level > this.config.rules.maxDirectSpawnLevel) {
      throw new Error(`调试强制 Next 仅允许 1..${this.config.rules.maxDirectSpawnLevel}`);
    }
    this.nextLevelValue = level;
  }

  private rollDirectSpawnLevel(): number {
    const rows = this.config.levels.filter(
      (row) => row.level <= this.config.rules.maxDirectSpawnLevel && row.spawnWeight > 0,
    );
    const total = rows.reduce((sum, row) => sum + row.spawnWeight, 0);
    let cursor = this.random.nextFloat01() * total;
    for (const row of rows) {
      cursor -= row.spawnWeight;
      if (cursor < 0) return row.level;
    }
    return rows[rows.length - 1].level;
  }
}
