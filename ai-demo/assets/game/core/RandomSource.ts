export interface RandomSource {
  nextFloat01(): number;
}

/**
 * 轻量可重复 RNG，仅用于本地玩法随机与 QA 复现。
 * 不用于安全/加密场景。
 */
export class SeededRandom implements RandomSource {
  private state: number;

  constructor(seed: number) {
    const normalized = Math.trunc(seed) >>> 0;
    this.state = normalized === 0 ? 0x6d2b79f5 : normalized;
  }

  nextFloat01(): number {
    // Mulberry32
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return result;
  }
}

export class MathRandomSource implements RandomSource {
  nextFloat01(): number {
    return Math.random();
  }
}

export class SequenceRandom implements RandomSource {
  private index = 0;

  constructor(private readonly values: number[]) {
    if (values.length === 0) throw new Error('SequenceRandom 至少需要一个值');
    if (values.some((value) => value < 0 || value >= 1 || !Number.isFinite(value))) {
      throw new Error('SequenceRandom 的值必须位于 [0,1)');
    }
  }

  nextFloat01(): number {
    const value = this.values[this.index % this.values.length];
    this.index += 1;
    return value;
  }
}
