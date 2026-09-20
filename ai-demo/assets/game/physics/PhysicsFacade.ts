import type { ContactPair, Vec2 } from '../core/GameplayTypes';

/**
 * Cocos 2D Physics 与核心玩法之间的最小 Contract。
 * 当前仓库尚未初始化 Cocos Creator 工程，因此这里只锁定接口，不虚报引擎实现。
 */
export interface PhysicsCatDescriptor {
  runtimeId: number;
  level: number;
  position: Vec2;
  diameterRatio: number;
  massScale: number;
  restitution: number;
  friction: number;
  linearDamping: number;
  angularDamping: number;
}

export interface PhysicsFacade {
  createCat(descriptor: PhysicsCatDescriptor): void;
  removeCat(runtimeId: number): void;
  setCatPosition?(runtimeId: number, position: Vec2): void;
  getCatPosition(runtimeId: number): Vec2 | undefined;

  /**
   * 第一阶段：推进一次固定物理步，只返回接触观察。
   * Contact Callback 只能收集 pair，禁止直接合成、销毁业务对象或计分。
   */
  stepAndCollectContacts(fixedDt: number): ContactPair[];

  /**
   * 第二阶段：核心层已经应用合成命令，适配层也已经删除源 Body / 创建结果 Body 后再调用。
   * 这样危险线判断天然使用 post-merge 有效对象集合。
   */
  queryDangerousCatIds(dangerLineRatio: number): number[];

  /** 上一只释放猫是否已经完全离开顶部投放排除带；对象已被合法消费时返回 true。 */
  isSpawnExclusionClear(lastDroppedRuntimeId?: number): boolean;

  pause(paused: boolean): void;
  reset(): void;
}
