export interface ClockAdvanceResult {
  steps: number;
  discardedSec: number;
}

/**
 * 渲染帧时间 -> 固定玩法步的轻量累加器。
 * 真实世界暂停/后台时间不得补入 accumulator。
 */
export class GameplayClock {
  private accumulator = 0;
  private paused = false;

  constructor(
    readonly fixedDt: number,
    readonly maxStepsPerFrame = 4,
    readonly maxIncomingDeltaSec = 0.1,
  ) {
    if (fixedDt <= 0) throw new Error('fixedDt 必须大于 0');
    if (maxStepsPerFrame < 1) throw new Error('maxStepsPerFrame 必须至少为 1');
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    if (paused) this.accumulator = 0;
  }

  isPaused(): boolean {
    return this.paused;
  }

  reset(): void {
    this.accumulator = 0;
    this.paused = false;
  }

  advance(frameDeltaSec: number, runFixedStep: () => void): ClockAdvanceResult {
    if (this.paused) return { steps: 0, discardedSec: 0 };
    if (!Number.isFinite(frameDeltaSec) || frameDeltaSec < 0) {
      throw new Error('frameDeltaSec 必须是非负有限数');
    }

    const clamped = Math.min(frameDeltaSec, this.maxIncomingDeltaSec);
    this.accumulator += clamped;
    let steps = 0;

    while (this.accumulator + 1e-12 >= this.fixedDt && steps < this.maxStepsPerFrame) {
      this.accumulator -= this.fixedDt;
      runFixedStep();
      steps += 1;
    }

    let discardedSec = Math.max(0, frameDeltaSec - clamped);
    if (steps >= this.maxStepsPerFrame && this.accumulator >= this.fixedDt) {
      discardedSec += this.accumulator;
      this.accumulator = 0;
    }

    return { steps, discardedSec };
  }
}
