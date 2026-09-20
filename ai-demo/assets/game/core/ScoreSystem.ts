import type { GameplayConfig } from './GameplayConfig';
import { getLevelConfig } from './GameplayConfig';

export interface ScoreChange {
  score: number;
  delta: number;
  highestLevelChanged?: number;
}

export class ScoreSystem {
  private scoreValue = 0;
  private highestLevelValue = 0;
  private frozen = false;

  constructor(private readonly config: GameplayConfig) {}

  reset(): void {
    this.scoreValue = 0;
    this.highestLevelValue = 0;
    this.frozen = false;
  }

  get score(): number {
    return this.scoreValue;
  }

  get highestLevel(): number {
    return this.highestLevelValue;
  }

  isFrozen(): boolean {
    return this.frozen;
  }

  observeLevel(level: number): number | undefined {
    if (level <= this.highestLevelValue) return undefined;
    this.highestLevelValue = level;
    return level;
  }

  applyMergeResult(resultLevel: number): ScoreChange {
    if (this.frozen) return { score: this.scoreValue, delta: 0 };
    const row = getLevelConfig(this.config, resultLevel);
    const delta = row.mergeScore;
    this.scoreValue += delta;
    const highestLevelChanged = this.observeLevel(resultLevel);
    return {
      score: this.scoreValue,
      delta,
      ...(highestLevelChanged ? { highestLevelChanged } : {}),
    };
  }

  freeze(): void {
    this.frozen = true;
  }
}
