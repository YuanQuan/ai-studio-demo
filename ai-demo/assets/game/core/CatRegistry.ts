import type { CatRuntimeState, Vec2 } from './GameplayTypes';

export class CatRegistry {
  private nextRuntimeId = 1;
  private readonly cats = new Map<number, CatRuntimeState>();

  reset(): void {
    this.nextRuntimeId = 1;
    this.cats.clear();
  }

  create(level: number, position: Vec2, spawnedAtStep: number): CatRuntimeState {
    const cat: CatRuntimeState = {
      runtimeId: this.nextRuntimeId,
      level,
      lifecycle: 'ACTIVE',
      position: { ...position },
      spawnedAtStep,
    };
    this.nextRuntimeId += 1;
    this.cats.set(cat.runtimeId, cat);
    return cat;
  }

  get(runtimeId: number): CatRuntimeState | undefined {
    return this.cats.get(runtimeId);
  }

  has(runtimeId: number): boolean {
    return this.cats.has(runtimeId);
  }

  active(): CatRuntimeState[] {
    return [...this.cats.values()].filter((cat) => cat.lifecycle === 'ACTIVE');
  }

  activeIds(): number[] {
    return this.active().map((cat) => cat.runtimeId);
  }

  count(): number {
    return this.cats.size;
  }

  markPendingConsume(runtimeId: number): CatRuntimeState {
    const cat = this.require(runtimeId);
    if (cat.lifecycle !== 'ACTIVE') {
      throw new Error(`runtimeId=${runtimeId} 不是 ACTIVE，不能重复消费`);
    }
    cat.lifecycle = 'PENDING_CONSUME';
    return cat;
  }

  finalizeConsume(runtimeId: number): CatRuntimeState {
    const cat = this.require(runtimeId);
    if (cat.lifecycle !== 'PENDING_CONSUME') {
      throw new Error(`runtimeId=${runtimeId} 未处于 PENDING_CONSUME`);
    }
    cat.lifecycle = 'CONSUMED';
    this.cats.delete(runtimeId);
    return cat;
  }

  setPosition(runtimeId: number, position: Vec2): void {
    const cat = this.require(runtimeId);
    cat.position = { ...position };
  }

  private require(runtimeId: number): CatRuntimeState {
    const cat = this.cats.get(runtimeId);
    if (!cat) throw new Error(`找不到 runtimeId=${runtimeId}`);
    return cat;
  }
}
