# 客户端核心玩法开工概要 v0.1

- Task：`GAME-007-CLIENT-CORE-FEATURE-BRIEF`
- 状态：`USER_APPROVED`
- Owner：Client
- 正式上游：Core Gameplay PRD v0.1、Core Tech Design v0.1、Art Direction v0.1
- 并行待审批：UI Spec v0.1、VFX Spec v0.1

## 1. 目标 / 范围

首个可玩客户端版本实现已批准的单局核心循环：
- Current / Next 随机队列。
- 水平瞄准与释放。
- 2D物理下落、碰撞、滚动和堆叠。
- L1–L10 同级合成与连续合成。
- 分数、本局最高等级。
- 危险线、2秒连续警告与 Game Over。
- 暂停/后台冻结。
- Local Web DebugHarness 与 QA 可观测性。
- 在 UI/VFX 获批后接入 HUD、输入与核心特效。

本轮正式编码不包含：
- Server / WebSocket / MySQL / Redis。
- 登录、云存档、排行榜、社交、广告、付费、图鉴、养成。
- 首页/结算页完整产品流程。
- 微信/抖音真机专项适配与测试（只保留平台 Adapter 边界）。

## 2. 现有能力复用

当前 `client/` 尚未形成具体游戏代码基线，因此首版不假设已有可复用业务 Manager。

优先复用：
- Cocos Creator 场景、Node、Component、2D Physics、Tween / Animation 基础能力。
- 当前项目既定 Platform Adapter 架构原则。
- Tech Design 已定义的 `GameplaySession / GameplayClock / SpawnController / PhysicsFacade / MergeResolver / ScoreSystem / DangerSystem / GameplayEvents / GameplayConfig / DebugHarness` 边界。

不创建无边界 `GameManager` / `CommonUtils` 聚合所有职责。

## 3. 建议工程结构

首版建议在 `client/` 的实际 Cocos 工程中按职责组织：

```text
assets/game/
├── core/
│   ├── GameplaySession.ts
│   ├── GameplayClock.ts
│   ├── SpawnController.ts
│   ├── CatRegistry.ts
│   ├── MergeResolver.ts
│   ├── ScoreSystem.ts
│   ├── DangerSystem.ts
│   ├── GameplayEvents.ts
│   └── GameplayConfig.ts
├── physics/
│   └── PhysicsFacade.ts
├── presentation/
│   ├── CatView.ts
│   ├── HudPresenter.ts
│   └── GameplayVfxPresenter.ts
├── input/
│   └── AimInputAdapter.ts
├── debug/
│   └── DebugHarness.ts
└── platform/
    └── PlatformLifecycleAdapter.ts
```

最终目录可根据 Cocos 工程初始化方式微调，但职责边界不能退化为单个巨大 Manager。

## 4. 场景与节点建议

核心玩法 Scene 建议只保留可理解的层级：

```text
GameplayScene
├── BackgroundLayer
├── PlayfieldRoot
│   ├── Walls
│   ├── CatRoot
│   ├── AimGuideRoot
│   └── VfxRoot
├── HudRoot
├── DebugRoot
└── SystemRoot
```

- `CatRoot` 只承载运行时猫咪 View/Physics Node。
- `HudRoot` 不拥有核心分数/危险状态，只显示 Presenter 提供的数据。
- `DebugRoot` Release 构建可整体禁用。

## 5. 核心实现原则

### 物理
- 通过 `PhysicsFacade` 封装 Cocos 2D Physics。
- Contact Callback 只记录接触对，禁止在回调里直接 Destroy / Spawn / Score。
- 每固定步结束后由 `MergeResolver` 处理稳定配对，再统一应用 command buffer。

### 实体生命周期
- 每只猫分配唯一 `runtimeId`。
- 生命周期至少区分 `ACTIVE / PENDING_CONSUME / CONSUMED`。
- View Node 不是业务 ID。

### 时间
- 玩法使用批准的固定步长基线 `1/60s`。
- Danger 与 Drop Lock 只能读 `GameplayClock` 模拟时间。
- 后台恢复不得把真实离开时长补进玩法。

### UI / VFX
- UI 只发操作意图并消费核心状态。
- VFX 只消费 `GameplayEvents`。
- UI/VFX 当前 Draft 不作为正式实现依据；只有对应 `USER_APPROVED` 后才能锁定正式 HUD / 特效实现。

## 6. 配置

首版应把已批准数值与技术调优项从代码常量集中到 `GameplayConfig`，包括：
- L1–L10 尺寸比例。
- L1–L3 投放权重。
- 合成分值。
- `minDropLockSec=0.25`。
- `dangerLineRatio=0.82`。
- `dangerTimeoutSec=2.0`。
- 固定步频与物理调优字段。

若正式 `.xlsx` 配置生成链尚未建立，开发原型可先使用经过校验的本地结构，但不能形成与未来 `.xlsx` 并行维护的第二套长期事实源。

## 7. 平台 / 协议影响

- 当前无网络协议和 API 变更。
- Web 为正式首轮开发/调试环境。
- PlatformLifecycleAdapter 只负责前后台/暂停通知等平台差异。
- 不在核心玩法中直接调用 `wx.*` / `tt.*`。

## 8. 性能关注

首版重点：
- 避免每个猫咪多个无必要 `update()`。
- Contact Callback 中避免频繁临时分配。
- 合成候选数组/事件结构可适度复用。
- Node/Collider 数量在 Debug 中可观察。
- VFX 同屏粒子遵循 VFX Spec 软上限。
- 不在未证明必要前引入 ECS 或复杂对象池框架。
- 如果频繁 Spawn/Destroy 在真机 profiling 中成为问题，再引入轻量 Cat Node Pool。

## 9. 日志与 Debug

Local Web DebugHarness 至少提供：
- 固定 RNG Seed。
- 强制下一只等级。
- runtimeId / level 标签。
- Collider、DangerLine、Spawn Exclusion Band 显示。
- step、dropLockElapsed、dangerElapsed 显示。
- 合成候选、最终配对、消费源 ID 日志。
- 暂停/单步（技术可行时）。
- 快速 Restart。

日志正文尽量中文，模块标签、事件名、runtimeId 等机器标识保留英文。

## 10. 测试与验证

编码完成前至少需要：
- 单元/逻辑验证：MergeResolver、ScoreSystem、DangerSystem、SpawnController 的关键纯逻辑。
- 场景验证：实际 PhysicsFacade 与 Cocos Contact 集成。
- Debug场景覆盖三体/四体、连续合成、危险线临界救场、暂停恢复。
- UI/VFX批准后增加固定 Web viewport 的视觉状态验证。

正式验证以 QA `TEST_PLAN` / 后续 Test Cases 为准。

## 11. 开工 Gate

正式编码必须同时满足：
- 本 `FEATURE_BRIEF_v0.1` 用户批准；
- QA `TEST_PLAN_v0.1` 用户批准；
- Core Tech Design 已批准（已满足）；
- Core Gameplay PRD 已批准（已满足）。

视觉正式实现还需：
- UI Spec `USER_APPROVED`；
- VFX Spec `USER_APPROVED`。

如果开工包先获批而 UI/VFX 尚未获批，Client 只能开始不依赖最终视觉的核心逻辑/Debug骨架，不得自行发明正式视觉实现。

## 12. 主要风险
- 物理接触回调顺序不可作为合成业务顺序，必须走稳定配对。
- Cat View 与 Collider 轮廓偏差会造成公平性感知问题。
- 固定步长与 Cocos 具体版本 API 接线可能需要适配，但不得改变领域 Contract。
- UI 输入和 Pause 事件处理不严谨可能产生误释放，需要在实现阶段重点回归。