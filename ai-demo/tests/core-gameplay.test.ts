import test from 'node:test';
import assert from 'node:assert/strict';

import {
  cloneGameplayConfig,
  DEFAULT_GAMEPLAY_CONFIG,
  validateGameplayConfig,
} from '../assets/game/core/GameplayConfig';
import { GameplayClock } from '../assets/game/core/GameplayClock';
import { GameplaySession } from '../assets/game/core/GameplaySession';
import { GameplayRuntime } from '../assets/game/core/GameplayRuntime';
import type { ContactPair, Vec2 } from '../assets/game/core/GameplayTypes';
import type { PhysicsCatDescriptor, PhysicsFacade } from '../assets/game/physics/PhysicsFacade';
import { SeededRandom, SequenceRandom } from '../assets/game/core/RandomSource';
import { DebugHarness } from '../assets/game/debug/DebugHarness';

function makeSession(values = [0.05, 0.45, 0.85, 0.15, 0.55, 0.95]) {
  return new GameplaySession(cloneGameplayConfig(), new SequenceRandom(values));
}

function runSteps(
  session: GameplaySession,
  count: number,
  dangerousCatIds: number[] = [],
  spawnExclusionClear = true,
): void {
  for (let index = 0; index < count; index += 1) {
    session.runFixedStep({ contacts: [], dangerousCatIds, spawnExclusionClear });
  }
}

test('配置基线通过校验，L1-L3 可直接投放且 L4-L10 权重为 0', () => {
  const config = cloneGameplayConfig(DEFAULT_GAMEPLAY_CONFIG);
  assert.doesNotThrow(() => validateGameplayConfig(config));
  assert.deepEqual(
    config.levels.filter((row) => row.spawnWeight > 0).map((row) => row.level),
    [1, 2, 3],
  );
  assert.equal(config.rules.minDropLockSec, 0.25);
  assert.equal(config.rules.dangerLineRatio, 0.82);
  assert.equal(config.rules.dangerTimeoutSec, 2);
});

test('AC-01/02：固定 Seed 可复现 Current/Next，直接投放只出现 L1-L3', () => {
  const a = new GameplaySession(cloneGameplayConfig(), new SeededRandom(12345));
  const b = new GameplaySession(cloneGameplayConfig(), new SeededRandom(12345));
  assert.deepEqual(a.spawn.snapshot(), b.spawn.snapshot());

  const observed: number[] = [];
  for (let round = 0; round < 30; round += 1) {
    observed.push(a.spawn.currentLevel, a.spawn.nextLevel);
    a.releaseCurrent();
    runSteps(a, 15, [], true);
  }
  assert.ok(observed.every((level) => level >= 1 && level <= 3));
});

test('AC-03：aimX 会根据 Current 碰撞直径限制在左右边界内', () => {
  const session = makeSession([0.01, 0.01]); // L1
  const left = session.setAimX(-100, 0, 100, 100);
  const right = session.setAimX(1000, 0, 100, 100);
  assert.equal(left, 4.5);
  assert.equal(right, 95.5);
});

test('AC-04：投放解锁同时要求 >=0.25s 与离开排除带', () => {
  const session = makeSession();
  session.releaseCurrent();
  runSteps(session, 14, [], true);
  assert.equal(session.spawn.state, 'DROP_LOCKED');
  runSteps(session, 1, [], true);
  assert.equal(session.spawn.state, 'AIMING');

  session.releaseCurrent();
  runSteps(session, 30, [], false);
  assert.equal(session.spawn.state, 'DROP_LOCKED');
  runSteps(session, 1, [], true);
  assert.equal(session.spawn.state, 'AIMING');
});

test('AC-05：同级 L1-L9 合成，异级接触不合成', () => {
  const session = makeSession();
  const a = session.registry.create(1, { x: 0, y: 0 }, 0);
  const b = session.registry.create(1, { x: 2, y: 0 }, 0);
  const merges = session.runFixedStep({
    contacts: [{ a: a.runtimeId, b: b.runtimeId }],
    dangerousCatIds: [],
    spawnExclusionClear: true,
  });
  assert.equal(merges.length, 1);
  assert.equal(merges[0].resultLevel, 2);
  assert.equal(session.score.score, 10);
  assert.deepEqual(session.registry.active().map((cat) => cat.level), [2]);

  const c = session.registry.create(1, { x: 0, y: 0 }, session.stepNumber);
  const d = session.registry.create(2, { x: 0, y: 0 }, session.stepNumber);
  const scoreBefore = session.score.score;
  const noMerge = session.runFixedStep({
    contacts: [{ a: c.runtimeId, b: d.runtimeId }],
    dangerousCatIds: [],
    spawnExclusionClear: true,
  });
  assert.equal(noMerge.length, 0);
  assert.equal(session.score.score, scoreBefore);
});

test('AC-06：L9+L9 生成 L10 并计分；L10+L10 不生成 L11', () => {
  const session = makeSession();
  const a = session.registry.create(9, { x: 0, y: 0 }, 0);
  const b = session.registry.create(9, { x: 0, y: 0 }, 0);
  const first = session.runFixedStep({
    contacts: [{ a: a.runtimeId, b: b.runtimeId }],
    dangerousCatIds: [],
    spawnExclusionClear: true,
  });
  assert.equal(first[0].resultLevel, 10);
  assert.equal(session.score.score, 2560);

  const existingL10 = session.registry.active().find((cat) => cat.level === 10)!;
  const secondL10 = session.registry.create(10, { x: 0, y: 0 }, session.stepNumber);
  const second = session.runFixedStep({
    contacts: [{ a: existingL10.runtimeId, b: secondL10.runtimeId }],
    dangerousCatIds: [],
    spawnExclusionClear: true,
  });
  assert.equal(second.length, 0);
  assert.equal(session.score.score, 2560);
  assert.equal(session.registry.active().filter((cat) => cat.level === 10).length, 2);
});

test('AC-07：三只同级近同时接触只消费一对，并留下第三只', () => {
  const debug = new DebugHarness();
  const session = new GameplaySession(cloneGameplayConfig(), new SequenceRandom([0.1]), debug);
  const a = session.registry.create(3, { x: 0, y: 0 }, 0);
  const b = session.registry.create(3, { x: 1, y: 0 }, 0);
  const c = session.registry.create(3, { x: 2, y: 0 }, 0);
  const merges = session.runFixedStep({
    contacts: [
      { a: a.runtimeId, b: b.runtimeId },
      { a: a.runtimeId, b: c.runtimeId },
      { a: b.runtimeId, b: c.runtimeId },
    ],
    dangerousCatIds: [],
    spawnExclusionClear: true,
  });
  assert.equal(merges.length, 1);
  assert.deepEqual(merges[0].sourceA, a.runtimeId);
  assert.deepEqual(merges[0].sourceB, b.runtimeId);
  assert.deepEqual(
    session.registry.active().map((cat) => cat.level).sort((x, y) => x - y),
    [3, 4],
  );
  assert.equal(debug.getMergeRecords()[0].candidates.length, 3);
  assert.equal(debug.getMergeRecords()[0].selected.length, 1);
});

test('AC-08：四体可形成两次独立合成，结果从下一固定步开始继续连锁', () => {
  const session = makeSession();
  const cats = [0, 1, 2, 3].map((x) => session.registry.create(1, { x, y: 0 }, 0));
  const first = session.runFixedStep({
    contacts: [
      { a: cats[0].runtimeId, b: cats[1].runtimeId },
      { a: cats[2].runtimeId, b: cats[3].runtimeId },
    ],
    dangerousCatIds: [],
    spawnExclusionClear: true,
  });
  assert.equal(first.length, 2);
  assert.equal(session.score.score, 20);
  const results = session.registry.active().filter((cat) => cat.level === 2);
  assert.equal(results.length, 2);

  const second = session.runFixedStep({
    contacts: [{ a: results[0].runtimeId, b: results[1].runtimeId }],
    dangerousCatIds: [],
    spawnExclusionClear: true,
  });
  assert.equal(second.length, 1);
  assert.equal(second[0].resultLevel, 3);
  assert.equal(session.score.score, 40);
});

test('AC-09：每一级合成分值严格来自批准配置', () => {
  const expected = new Map([
    [1, 10],
    [2, 20],
    [3, 40],
    [4, 80],
    [5, 160],
    [6, 320],
    [7, 640],
    [8, 1280],
    [9, 2560],
  ]);
  for (const [sourceLevel, score] of expected) {
    const session = makeSession();
    const a = session.registry.create(sourceLevel, { x: 0, y: 0 }, 0);
    const b = session.registry.create(sourceLevel, { x: 0, y: 0 }, 0);
    session.runFixedStep({
      contacts: [{ a: a.runtimeId, b: b.runtimeId }],
      dangerousCatIds: [],
      spawnExclusionClear: true,
    });
    assert.equal(session.score.score, score, `L${sourceLevel}+L${sourceLevel}`);
  }
});

test('AC-10：危险警告在 2 秒前回落会清零并恢复 SAFE', () => {
  const session = makeSession();
  const cat = session.registry.create(1, { x: 0, y: 0 }, 0);
  runSteps(session, 60, [cat.runtimeId], true);
  assert.equal(session.danger.state, 'WARNING');
  assert.ok(session.danger.elapsed > 0.99 && session.danger.elapsed < 1.01);
  runSteps(session, 1, [], true);
  assert.equal(session.danger.state, 'SAFE');
  assert.equal(session.danger.elapsed, 0);
});

test('AC-11：接近 2 秒时本步合成清空危险对象，合成救场优先于死亡', () => {
  const session = makeSession();
  const a = session.registry.create(1, { x: 0, y: 0 }, 0);
  const b = session.registry.create(1, { x: 0, y: 0 }, 0);
  runSteps(session, 119, [a.runtimeId, b.runtimeId], true);
  assert.equal(session.runState, 'RUNNING');
  assert.equal(session.danger.state, 'WARNING');

  const merges = session.runFixedStep({
    contacts: [{ a: a.runtimeId, b: b.runtimeId }],
    // danger IDs 是合成同步到物理世界后的 post-merge 查询结果，因此为空。
    dangerousCatIds: [],
    spawnExclusionClear: true,
  });
  assert.equal(merges.length, 1);
  assert.equal(session.runState, 'RUNNING');
  assert.equal(session.danger.state, 'SAFE');
  assert.equal(session.danger.elapsed, 0);
});

test('AC-12：连续越线达到 2 秒后 Game Over，结果冻结并拒绝新投放', () => {
  const session = makeSession();
  const cat = session.registry.create(2, { x: 0, y: 0 }, 0);
  runSteps(session, 120, [cat.runtimeId], true);
  assert.equal(session.runState, 'GAME_OVER');
  assert.equal(session.result?.reason, 'DANGER_TIMEOUT');
  assert.equal(session.result?.finalScore, 0);
  assert.throws(() => session.releaseCurrent(), /GAME_OVER/);
});

test('AC-13：暂停期间固定步、危险计时和投放锁均不推进', () => {
  const session = makeSession();
  const cat = session.registry.create(1, { x: 0, y: 0 }, 0);
  session.releaseCurrent();
  runSteps(session, 5, [cat.runtimeId], false);
  const before = session.snapshot();

  session.setPaused(true);
  runSteps(session, 180, [cat.runtimeId], true);
  const paused = session.snapshot();
  assert.equal(paused.step, before.step);
  assert.equal(paused.dangerElapsed, before.dangerElapsed);
  assert.equal(paused.spawn.dropLockedElapsed, before.spawn.dropLockedElapsed);

  session.setPaused(false);
  runSteps(session, 1, [cat.runtimeId], true);
  assert.equal(session.stepNumber, before.step + 1);
});

test('AC-14：Restart 清空本局实体、分数、危险状态并重新生成队列', () => {
  const session = makeSession();
  const a = session.registry.create(1, { x: 0, y: 0 }, 0);
  const b = session.registry.create(1, { x: 0, y: 0 }, 0);
  session.runFixedStep({
    contacts: [{ a: a.runtimeId, b: b.runtimeId }],
    dangerousCatIds: [],
    spawnExclusionClear: true,
  });
  assert.equal(session.score.score, 10);
  session.restart();
  const state = session.snapshot();
  assert.equal(state.activeCatIds.length, 0);
  assert.equal(state.score, 0);
  assert.equal(state.highestLevel, 0);
  assert.equal(state.dangerState, 'SAFE');
  assert.equal(state.dangerElapsed, 0);
  assert.equal(state.spawn.state, 'AIMING');
  assert.ok(state.spawn.currentLevel >= 1 && state.spawn.currentLevel <= 3);
  assert.ok(state.spawn.nextLevel >= 1 && state.spawn.nextLevel <= 3);
});

test('GameplayClock：固定步有追赶上限，暂停/后台不会补算真实时间', () => {
  const clock = new GameplayClock(1 / 60, 4, 0.1);
  let calls = 0;
  const first = clock.advance(1, () => calls++);
  assert.equal(first.steps, 4);
  assert.equal(calls, 4);
  assert.ok(first.discardedSec > 0.9);

  clock.setPaused(true);
  const paused = clock.advance(10, () => calls++);
  assert.equal(paused.steps, 0);
  assert.equal(calls, 4);
  clock.setPaused(false);
  const resumed = clock.advance(1 / 60, () => calls++);
  assert.equal(resumed.steps, 1);
  assert.equal(calls, 5);
});

class FakePhysics implements PhysicsFacade {
  readonly bodies = new Map<number, PhysicsCatDescriptor>();
  readonly operationLog: string[] = [];
  contacts: ContactPair[] = [];
  dangerousIds = new Set<number>();
  exclusionClear = true;

  createCat(descriptor: PhysicsCatDescriptor): void {
    this.operationLog.push(`create:${descriptor.runtimeId}`);
    this.bodies.set(descriptor.runtimeId, { ...descriptor, position: { ...descriptor.position } });
  }

  removeCat(runtimeId: number): void {
    this.operationLog.push(`remove:${runtimeId}`);
    this.bodies.delete(runtimeId);
  }

  getCatPosition(runtimeId: number): Vec2 | undefined {
    const body = this.bodies.get(runtimeId);
    return body ? { ...body.position } : undefined;
  }

  stepAndCollectContacts(): ContactPair[] {
    this.operationLog.push('step');
    return this.contacts.map((pair) => ({ ...pair }));
  }

  queryDangerousCatIds(): number[] {
    this.operationLog.push('queryDanger');
    return [...this.dangerousIds].filter((id) => this.bodies.has(id));
  }

  isSpawnExclusionClear(): boolean {
    return this.exclusionClear;
  }

  pause(paused: boolean): void {
    this.operationLog.push(`pause:${paused}`);
  }

  reset(): void {
    this.bodies.clear();
    this.operationLog.push('reset');
  }
}

test('PhysicsFacade 两阶段 Contract：先同步合成 Body，再查询 post-merge danger', () => {
  const session = new GameplaySession(cloneGameplayConfig(), new SequenceRandom([0.1]));
  const physics = new FakePhysics();
  const runtime = new GameplayRuntime(session, physics);

  const first = runtime.releaseCurrent();
  for (let i = 0; i < 15; i += 1) runtime.fixedStep();
  const second = runtime.releaseCurrent();

  physics.bodies.get(first)!.position = { x: 10, y: 4 };
  physics.bodies.get(second)!.position = { x: 30, y: 8 };
  physics.contacts = [{ a: first, b: second }];
  physics.dangerousIds = new Set([first, second]);
  physics.operationLog.length = 0;
  const merges = runtime.fixedStep();

  assert.equal(merges.length, 1);
  assert.equal(session.runState, 'RUNNING');
  assert.equal(session.danger.state, 'SAFE');
  const queryIndex = physics.operationLog.indexOf('queryDanger');
  assert.ok(queryIndex >= 0);
  assert.ok(physics.operationLog.indexOf(`remove:${first}`) < queryIndex);
  assert.ok(physics.operationLog.indexOf(`remove:${second}`) < queryIndex);
  assert.ok(physics.operationLog.some((entry) => entry.startsWith('create:')));
  const resultBody = physics.bodies.get(merges[0].resultId)!;
  assert.deepEqual(resultBody.position, { x: 20, y: 6 });
});
