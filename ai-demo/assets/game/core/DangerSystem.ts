import type { DangerState } from './GameplayTypes';

export interface DangerUpdateResult {
  started: boolean;
  cleared: boolean;
  gameOver: boolean;
  state: DangerState;
  elapsed: number;
}

export class DangerSystem {
  private stateValue: DangerState = 'SAFE';
  private elapsedValue = 0;

  constructor(private readonly timeoutSec: number) {
    if (timeoutSec <= 0) throw new Error('Danger timeout 必须大于 0');
  }

  reset(): void {
    this.stateValue = 'SAFE';
    this.elapsedValue = 0;
  }

  get state(): DangerState {
    return this.stateValue;
  }

  get elapsed(): number {
    return this.elapsedValue;
  }

  update(hasDangerousCat: boolean, dt: number): DangerUpdateResult {
    if (dt < 0) throw new Error('dt 不能为负数');

    if (!hasDangerousCat) {
      const cleared = this.stateValue === 'WARNING';
      this.stateValue = 'SAFE';
      this.elapsedValue = 0;
      return {
        started: false,
        cleared,
        gameOver: false,
        state: this.stateValue,
        elapsed: this.elapsedValue,
      };
    }

    const started = this.stateValue === 'SAFE';
    this.stateValue = 'WARNING';
    this.elapsedValue += dt;
    const gameOver = this.elapsedValue + 1e-9 >= this.timeoutSec;

    return {
      started,
      cleared: false,
      gameOver,
      state: this.stateValue,
      elapsed: this.elapsedValue,
    };
  }
}
