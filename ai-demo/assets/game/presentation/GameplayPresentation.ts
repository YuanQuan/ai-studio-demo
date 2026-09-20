import type { GameplayEvent } from '../core/GameplayTypes';
import type { GameplaySnapshot } from '../core/GameplaySession';

export interface HudPresenter {
  render(snapshot: GameplaySnapshot): void;
  dispose(): void;
}

export interface GameplayVfxPresenter {
  /** VFX 只消费领域事件，不得修改核心玩法状态。 */
  handle(event: GameplayEvent): void;
  setPaused(paused: boolean): void;
  clearRunEffects(): void;
  dispose(): void;
}

export interface CatViewPresenter {
  createCat(runtimeId: number, level: number): void;
  removeCat(runtimeId: number): void;
  setVisibleLevel(runtimeId: number, level: number): void;
  dispose(): void;
}
