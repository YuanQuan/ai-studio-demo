# 核心玩法客户端领域逻辑实现报告 v0.1

- Task：`GAME-009-CLIENT-CORE-IMPLEMENTATION`
- 当前状态：`USER_REVIEW`
- Owner：Client
- 上游批准：Core Gameplay PRD v0.1、Core Tech Design v0.1、UI v0.1、VFX v0.1、Client Feature Brief v0.1、QA Test Plan v0.1

## 1. 本轮实际完成范围

本轮已经完成**可独立类型检查与自动测试的 TypeScript 核心玩法领域层**，不是仅写设计文档。

代码位置：`client/assets/game/`。

已实现：
- L1–L10 集中配置与校验。
- L1–L3 加权随机投放、固定 Seed、Current / Next。
- aimX 合法边界 Clamp。
- 0.25 秒 + 投放排除带双条件解锁。
- 唯一 `runtimeId` 与实体生命周期。
- 物理接触快照去重、稳定 Pair 排序、`consumedThisStep` 防重复消费。
- L1–L9 同级合成、L10 终点、三体/四体、下一固定步连续合成。
- 合成计分与本局最高等级。
- SAFE / WARNING、连续 2 秒 Danger Timer、合成救场优先、Game Over 结果冻结。
- 暂停/后台语义：玩法固定步、危险计时与投放锁全部冻结。
- Restart 完整重置。
- 固定步时钟与每渲染帧最大追赶步数。
- DebugHarness：固定步、Active ID、候选/最终合成 Pair、消费 ID、危险/投放锁计时记录。
- Physics / Input / HUD / VFX / Platform Lifecycle 明确 Adapter Contract。

## 2. 主要文件

### 核心领域
- `client/assets/game/core/GameplayConfig.ts`
- `client/assets/game/core/RandomSource.ts`
- `client/assets/game/core/CatRegistry.ts`
- `client/assets/game/core/MergeResolver.ts`
- `client/assets/game/core/ScoreSystem.ts`
- `client/assets/game/core/DangerSystem.ts`
- `client/assets/game/core/SpawnController.ts`
- `client/assets/game/core/GameplayClock.ts`
- `client/assets/game/core/GameplaySession.ts`
- `client/assets/game/core/GameplayRuntime.ts`
- `client/assets/game/core/GameplayTypes.ts`

### 适配 Contract
- `client/assets/game/physics/PhysicsFacade.ts`
- `client/assets/game/input/AimInputAdapter.ts`
- `client/assets/game/presentation/GameplayPresentation.ts`
- `client/assets/game/platform/PlatformLifecycleAdapter.ts`
- `client/assets/game/debug/DebugHarness.ts`

### 自动验证
- `client/tests/core-gameplay.test.ts`
- `client/tsconfig.json`

## 3. 实现中的关键技术决定

### 3.1 物理回调不直接执行业务合成

Physics 层只收集 `ContactPair`。`MergeResolver` 在固定步结束后：
1. 去重接触 Pair；
2. 过滤同级、ACTIVE、L1–L9；
3. 按 `level DESC, minId ASC, maxId ASC` 稳定排序；
4. 使用 `consumedThisStep` 保证同一源对象最多消费一次；
5. 统一应用合成命令。

因此不依赖 Cocos Contact Callback 的回调顺序。

### 3.2 固定步拆成两个领域阶段

为了严格实现“合成救场优先于死亡”，`GameplaySession` 将一次固定步拆成：

1. `beginFixedStep(contacts)`：稳定合成并产出结果对象；
2. Physics Adapter 删除源 Body / 创建结果 Body；
3. Physics Adapter 查询 **post-merge** 危险对象；
4. `finishFixedStep(...)`：更新投放锁、Danger Timer、Game Over。

这避免使用已经被合成消费的旧对象判定失败。

### 3.3 物理位置必须回写领域 Registry

实现 Review 时发现：如果 Physics Body 已经滚动/下落，但 Registry 仍保留生成时坐标，合成结果会出现在旧位置。

已修复：`GameplayRuntime.fixedStep()` 在物理步完成后、合成结算前，先通过 `PhysicsFacade.getCatPosition()` 回写每个 Active Cat 的当前中心坐标；自动测试已覆盖结果位置取两源当前中心平均值。

## 4. 自动验证结果

### TypeScript 严格类型检查
执行：

`npx --yes -p typescript@5.6.3 tsc -p client/tsconfig.json --noEmit`

结果：**PASS**。

说明：首次使用未固定版本的 `npx typescript` 时遇到 CLI 与本机 Node 20.6 的临时执行兼容问题；固定验证用 TypeScript 5.6.3 后正常通过。该问题不是项目源码类型错误，也没有向项目安装运行时依赖。

### 自动测试
执行：

`npx --yes tsx@4.19.2 --test client/tests/core-gameplay.test.ts`

结果：**16 / 16 PASS，0 FAIL**。

覆盖：
- 配置校验。
- AC-01 / AC-02 随机队列与直接投放池。
- AC-03 aimX 边界。
- AC-04 双条件投放锁。
- AC-05 同级/异级合成。
- AC-06 L10 终点。
- AC-07 三体防重复消费。
- AC-08 四体与下一固定步连续合成。
- AC-09 全分值表。
- AC-10 危险恢复清零。
- AC-11 临界合成救场。
- AC-12 2 秒 Game Over。
- AC-13 暂停冻结。
- AC-14 Restart。
- GameplayClock 追赶上限与后台时间不补算。
- PhysicsFacade 两阶段 Contract 与真实位置回写。

## 5. 性能与代码健康

- 核心领域无第三方运行时依赖。
- 没有新增 `GameManager` / `CommonUtils` 等无边界聚合对象。
- 领域代码不直接引用 `cc.*`、`wx.*`、`tt.*`。
- Contact Callback 预期只收集 Pair，避免在回调中分配/销毁业务对象。
- 当前实体规模较小，不提前引入 ECS 或复杂对象池。
- `GameplaySession` 是组合根/状态编排器；如果后续加入更多页面/Meta 逻辑，不允许继续向其堆积非核心职责。

## 6. Debug / QA 能力

已存在代码级 DebugHarness，可记录：
- fixed step；
- Active runtimeId；
- Spawn State / `dropLockedElapsed`；
- Danger State / `dangerElapsed`；
- Merge candidate；
- selected merge；
- consumed IDs；
- 中文诊断消息。

固定 Seed 与强制 Next Level 已由领域层支持。

Collider / Danger Line / Spawn Exclusion Band 的**可视化 overlay**仍依赖后续 Cocos Scene 接线，当前只完成数据/Contract 层。

## 7. 当前明确未完成

当前 `client/` 在开工前只有 README，本机也未发现 Cocos Creator CLI / App，因此本报告**不声明以下项目已经完成**：

- Cocos Creator 工程初始化及其版本锁定。
- `cc.*` 2D Physics 的真实 `PhysicsFacade` 实现。
- Scene / Prefab / Node / Collider 创建与 Contact Callback 接线。
- 已批准 HUD 的运行时组件。
- 已批准 VFX 的 Sprite/Tween/Particle 实现。
- Local Web 的实际 Cocos 可玩构建。
- 微信/抖音平台构建与真机验证。

这些不是被忽略的功能，而是后续引擎集成任务的真实边界。

## 8. 风险

1. Cocos Creator 的具体版本尚未在实际工程中锁定，2D Physics API 接线需以真实版本验证。
2. 领域规则已自动验证，但真实 Collider、摩擦/弹性、Sleep 与触点生命周期仍需要 Cocos 原型调优。
3. UI/VFX 当前只有批准规格和概念资产，最终运行时资源仍需实际制作/接入。
4. 首轮 QA 目前只能证明领域语义；Visual QA 与真实物理场景 QA 必须等 Cocos 集成完成。

## 9. 下一步 Gate

本实现包经用户确认后，下一阶段应创建 **Cocos Creator 工程初始化 + Physics/HUD/VFX 集成任务**。

当前机器缺少可发现的 Cocos Creator 环境，因此该阶段在真正运行/构建验证前存在环境前置条件。不得通过编写未验证的 `cc.*` 代码冒充可运行集成。