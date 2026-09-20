# 核心玩法技术设计 v0.1

- 任务 ID：`GAME-004-CORE-TECH-DESIGN`
- 状态：`USER_APPROVED`
- 负责人：Tech Lead
- 产品输入：`CORE_GAMEPLAY_PRD_v0.1.md`（`USER_APPROVED`）
- 客户端基线：Cocos Creator + TypeScript
- 范围：仅 MVP 核心玩法；不依赖服务端、网络或数据库

## 1. 技术目标

用最小必要复杂度实现已批准的“投放 / 物理 / 合成 / 计分 / 危险线”核心循环，同时保持足够清晰的模块边界，便于后续 UI、VFX、平台 Adapter 和 QA 接入。

本设计明确拆分以下职责：
- 产品状态与渲染表现分离；
- 物理接触结果与合成决策分离；
- 合成决策与计分 / VFX 分离；
- 模拟时间与真实墙钟时间分离；
- 平台生命周期与玩法逻辑分离。

MVP **不要求**不同设备之间做到逐比特完全一致的锁步模拟，但必须保证规则语义稳定：只有同级可合成、每个源对象最多消费一次、危险线需连续 2 秒才失败、暂停/后台时间不计入模拟、不得重复计分。

## 2. 对项目架构的影响

当前继承模板默认“关键可信状态由服务端权威控制”。但已批准的 MVP 明确不依赖服务端，并且只需要本地最佳分持久化。因此本 Tech Design 提议一个游戏项目级简化方案：

- MVP 单局核心状态由客户端本地维护。
- 核心循环不实例化玩法 WebSocket、服务端 Session、MySQL 或 Redis。
- 平台 Adapter 仅在后续用于生命周期和本地存储。
- 如果未来增加在线排行、奖励等可信在线能力，必须作为新的正式功能重新设计可信模型 / 反作弊方案，不允许静默把本地结果当成可信数据。

该方案已经记录为项目 Decision `DEC-003`。如果用户批准本 Tech Design v0.1，则同时接受该项目级简化方案。

## 3. 模块边界

推荐客户端核心模块边界：

```text
core-gameplay/
├── GameplaySession          # 单局生命周期与组合根
├── GameplayClock            # 固定步长累积器 / 暂停语义
├── SpawnController          # Current/Next、aimX、投放锁
├── CatRegistry              # 活跃实体 + 稳定运行时 ID
├── PhysicsFacade            # 引擎物理体创建/查询/接触收集封装
├── MergeResolver            # 确定性候选过滤/配对/命令生成
├── ScoreSystem              # 分数 + 本局最高等级状态
├── DangerSystem             # 危险线查询 + 连续模拟时间计时
├── GameplayEvents           # 类型化领域事件 Contract
├── GameplayConfig           # 校验后不可变运行时配置
└── DebugHarness             # 随机种子、Overlay、事件日志、QA 控制
```

与本任务相邻但不属于本任务正式范围的模块：

```text
ui/
├── AimInputAdapter          # 拖动/点击映射 -> SpawnController 意图
└── HudPresenter             # 领域事件/状态 -> UI 表现
vfx/
└── GameplayVfxPresenter     # 合成/危险/Game Over 事件 -> VFX
platform/
└── PlatformLifecycleAdapter # 前后台状态 -> GameplaySession 暂停
```

### 依赖方向

`UI/Input -> GameplaySession/SpawnController -> PhysicsFacade`

`PhysicsFacade -> contact snapshots -> MergeResolver`

`MergeResolver -> entity commands -> CatRegistry/PhysicsFacade`

`MergeResolver -> GameplayEvents -> Score/HUD/VFX`

`CatRegistry/PhysicsFacade -> DangerSystem -> GameplaySession`

MergeResolver、DangerSystem 和物理领域代码不得直接调用任何平台 API。

## 4. 模拟时钟

### 4.1 固定步长基线

v0.1 技术基线采用 **1/60 秒**的玩法模拟步长。

推荐累积器行为：
- 仅在 `RUNNING` 且未被外部暂停时累积引擎帧间隔；
- 按 `1/60s` 固定步长推进模拟；
- 每个渲染帧最多补算 4 个模拟步；
- 单次输入帧间隔截断到安全上限，建议最大 100ms，避免从卡顿恢复时一次性模拟数秒物理；
- 超出补算预算的累积延迟应丢弃或归一化，不允许形成超大的追帧爆发。

具体如何接入 Cocos 引擎回调由客户端实现决定，但玩法计时器必须和核心玩法更新使用同一个模拟时钟。

### 4.2 暂停 / 后台

当 `GameplayClock.paused = true` 时：
- 不推进物理步；
- 不增加投放锁计时；
- 不增加危险计时；
- 不进行合成结算；
- 不因为真实世界时间经过而派发玩法事件。

应用回到前台时，第一帧不得把后台停留的真实时长整体注入累积器。

## 5. 实体模型

每只生成的猫在单局内获得唯一、单调递增的 `runtimeId`。

最小运行时字段：

```ts
interface CatRuntimeState {
  runtimeId: number;
  level: number;          // 1..10
  lifecycle: 'ACTIVE' | 'PENDING_CONSUME' | 'CONSUMED';
  bodyHandle: PhysicsBodyHandle;
  spawnedAtStep: number;
}
```

规则：
- `runtimeId` 用于稳定合成候选排序和日志追踪。
- 玩法逻辑不得把渲染 Node 身份当作业务 ID。
- 被消费的猫通过固定步结束时的命令缓冲区移除，不允许直接在物理接触回调中销毁。

## 6. 物理策略

### 6.1 引擎接入

使用 Cocos Creator 内建 2D 物理能力，并统一封装在 `PhysicsFacade` 后面；应用层 / 领域层不得直接依赖引擎接触回调的触发顺序。

第一版原型推荐碰撞表示：
- 优先使用圆形或简单凸形 Fixture；
- 每只猫默认只使用一个主碰撞轮廓，除非 Art/Tech Review 证明必须使用复合碰撞体；
- 左墙、右墙和地板使用静态碰撞体；
- Current 在 `AIMING` 状态时不参与物理碰撞。

### 6.2 产品手感调优

技术层应暴露、但不擅自决定产品含义的参数：
- gravity scale / 世界重力映射；
- restitution（弹性）；
- friction（摩擦）；
- linear/angular damping（线性/角阻尼）；
- 各等级 density/mass 映射；
- 引擎支持时的休眠阈值。

PRD 给出的初始手感目标：
- 低弹性；
- 足够的摩擦和阻尼，使物体较快稳定；
- 允许滚动与小幅位移；
- 空棋盘中 L1–L3 首次触底反弹高度不超过原下落距离约 12%。

这些字段属于原型校准参数，不构成新的产品规则。

### 6.3 跨平台一致性

不承诺 Web / 微信 / 抖音上的轨迹逐比特一致，而是保证：
- 使用同一目标固定步长；
- 使用相同且通过校验的玩法配置；
- 使用完全相同的领域合成算法；
- 危险计时和投放锁均基于模拟时间；
- 分数和失败时间不得依赖渲染帧率。

QA 应验证规则语义和可接受手感容差，不要求长时间混沌物理后的坐标完全相同。

## 7. 投放 / Current / Next

`SpawnController` 负责：

```ts
type SpawnState = 'AIMING' | 'DROP_LOCKED';
```

核心状态：
- `currentLevel`
- `nextLevel`
- `aimX`
- `lastDroppedRuntimeId`
- `dropLockedElapsed`

### 7.1 随机队列

使用可注入的小型随机源接口：

```ts
interface RandomSource { nextFloat01(): number; }
```

正式运行默认可使用普通伪随机实现；Debug / QA 可注入固定 Seed 实现。

加权抽取只能读取已校验配置。v0.1 内容为 L1/L2/L3 近似等权。

队列顺序：
1. 新局分别随机出 Current 和 Next；
2. 玩家释放 Current；
3. 立即把此前 Next 提升为逻辑上的待用 Current，并随机生成新的 Next；
4. `DROP_LOCKED` 期间禁止再次释放；
5. UI 是否立即显示新的 Current 可由表现层决定，但在解锁前绝不能释放。

### 7.2 瞄准边界

`PhysicsFacade` 提供可玩区域水平边界。`SpawnController` 根据 Current 等级对应碰撞半径计算合法中心范围：

`minAimX = leftInner + radius`

`maxAimX = rightInner - radius`

所有输入意图在真正释放前必须经过 Clamp（边界截断）。

### 7.3 投放解锁

只有以下两个条件**同时满足**时才解除投放锁：
- 自上一只释放起的模拟时间 >= 配置中的 `0.25s`；
- 上一只刚释放的猫已经完全离开投放排除带。

“完全离开”的推荐技术判断：猫咪碰撞体顶部已经低于排除带底部 Y；或者该猫已经通过合法合成被消费。若已被消费，则视为排除带条件已满足。

## 8. 接触收集与合成结算

物理回调只作为“观察结果”，不得直接执行合成和对象销毁。

### 8.1 接触快照

每个物理步内，把同一固定步中出现的接触对收集到 Set，使用稳定 Pair Key：

`pairKey = min(runtimeIdA, runtimeIdB) + ':' + max(runtimeIdA, runtimeIdB)`

候选只有同时满足以下条件才可进入合成结算：
- 两只猫均存在；
- 两者 `lifecycle == ACTIVE`；
- 等级相同；
- 等级 <= 9；
- 本固定步中接触仍有效。

### 8.2 确定性配对

合成结算阶段：
1. 从接触快照建立合法候选集合；
2. 按 `(level DESC, minId ASC, maxId ASC)` 排序；
3. 创建 `consumedThisStep: Set<runtimeId>`；
4. 按顺序遍历候选；
5. 若任一源对象已被本步占用，则跳过该候选；
6. 预占两个源对象 ID；
7. 追加一个 `MergeCommand`；
8. 完成全部配对选择后，再通过命令缓冲统一执行。

上述优先级属于技术实现细节，不改变玩家可见产品含义。稳定排序的目的只是避免合成结果依赖物理回调顺序。

### 8.3 三体 / 四体同时接触

三个同级猫 A/B/C：
- 候选集合可能包含 AB、AC、BC；
- 稳定排序只选择第一组合法 Pair；
- 这两个 ID 进入 `consumedThisStep`；
- 后续共享任一已占用 ID 的候选全部跳过；
- 第三只猫保持 `ACTIVE`。

四个同级猫在同一结算阶段可以形成两组不重叠 Pair。新生成的结果猫**不会**加入当前固定步的接触候选集合。

### 8.4 合成命令执行

每个被接受的 Pair：
- 两只源猫先标记为 `PENDING_CONSUME`；
- v0.1 结果位置取两个源物理体中心点的等权平均；
- 结果线速度可使用源速度平均值，再乘可配置阻尼系数；
- 在物理步结束后的安全阶段移除源物理体；
- 源对象标记为 `CONSUMED` 并从 Registry 移除；
- 生成一个 `level + 1` 的结果猫；
- 新猫获得新的 `runtimeId`，并记录 `spawnedAtStep = currentStep`；
- `CatMergeSucceeded` 事件只派发一次。

新生成猫从**下一个**固定模拟步开始具备再次合成资格，从而满足 PRD 的顺序连锁合成语义。

## 9. 分数与本局最高等级

`ScoreSystem` 只维护纯领域状态。

收到 `CatMergeSucceeded` 时：
- 查询 `mergeScoreByResultLevel[resultLevel]`；
- 只增加一次分数；
- 必要时更新本局最高等级；
- 派发 `ScoreChanged`，必要时再派发 `HighestLevelChanged`。

分数不得来源于 VFX、物理冲量、碰撞次数、渲染帧数或存活时间。

进入 Game Over 后，`ScoreSystem` 不再接受后续合成计分。`GameplaySession` 必须严格在当前固定步的合成与危险结算完成后，才能切换到 `GAME_OVER`。

## 10. 危险系统

配置：
- `dangerLineYNormalizedFromBottom = 0.82`
- `dangerTimeoutSec = 2.0`

运行时：

```ts
type DangerState = 'SAFE' | 'WARNING';
interface DangerRuntime {
  state: DangerState;
  continuousElapsed: number;
}
```

### 10.1 占用查询

每个固定步的合成命令执行完成后：
- 只查询 `ACTIVE` 猫咪；
- 如果猫咪 Collider / AABB 顶部高于配置危险线，则视为越线；
- Current / `AIMING` 预览不作为活跃物理实体注册进 `CatRegistry`，因此自然排除在危险检测之外。

### 10.2 计时更新

若没有任何 Active Cat 越线：
- 状态 -> `SAFE`；
- `continuousElapsed = 0`。

若至少一只越线：
- 首次进入 `WARNING` 时派发 `DangerStarted`；
- `continuousElapsed += fixedDt`；
- UI 如有需要，可使用节流后的 `DangerProgress` 或派生状态；
- 当 elapsed >= timeout，并且合成结算后仍存在越线猫时，请求进入 `GAME_OVER`。

### 10.3 固定步执行顺序

每个模拟步严格按以下顺序：
1. 推进物理；
2. 完成接触快照；
3. 收集 / 排序 / 结算合法合成 Pair；
4. 执行合成命令缓冲；
5. 派发并处理分数 / 最高等级领域事件；
6. 基于合成后的 Active 集合计算危险线占用；
7. 增加或清零危险计时；
8. 若到达超时条件，则 `GameplaySession -> GAME_OVER`；
9. 发布本固定步的表现层事件。

这个顺序就是“**合成救场优先于死亡判定**”的技术保证。

## 11. 单局 Session 状态

```ts
type RunState = 'RUNNING' | 'GAME_OVER';
```

`GameplaySession` 负责状态切换，并拒绝不合法命令。

进入 Game Over 时：
- 先设置状态，使新的投放意图立即被拒绝；
- 禁止后续新增合成计分；
- MVP 为保持表现一致，可以立即冻结物理；
- 派发不可变的结算快照：

```ts
interface RunResult {
  finalScore: number;
  highestLevel: number;
  reason: 'DANGER_TIMEOUT';
}
```

Restart 时重新构建或完整清理所有“单局级”系统。正式运行默认重新随机 Seed；只有 `DebugHarness` 明确固定 Seed 时才保留可重复随机序列。

## 12. 玩法领域事件

推荐类型化领域事件：

```ts
RunStarted { runId }
CatReleased { runtimeId, level, x }
SpawnUnlocked {}
CatMergeSucceeded { sourceIds, sourceLevel, resultId, resultLevel, scoreDelta, position }
ScoreChanged { score, delta }
HighestLevelChanged { level }
DangerStarted {}
DangerCleared {}
DangerProgress { elapsed, timeout }
GameOver { reason, finalScore, highestLevel }
```

表现层订阅者只能单向消费这些事件。UI / VFX 不得通过事件处理逻辑反向修改核心玩法状态。

## 13. 玩法配置 Contract

Tech 负责结构，Product 负责已批准数值内容。

推荐概念表拆分如下。

### `cat_level`
| 字段 | 类型 | 规则 |
|---|---|---|
| `level` | int | 唯一，1..10 |
| `diameterRatio` | float | >0，严格递增 |
| `spawnWeight` | float | >=0；v0.1 只有 L1–L3 >0 |
| `mergeScore` | int | 按结果等级配置分数；L1 可为 0 / 不适用 |
| `massScale` | float | >0；技术调优 |
| `restitution` | float | 0..1；技术调优 |
| `friction` | float | >=0；技术调优 |
| `linearDamping` | float | >=0；技术调优 |
| `angularDamping` | float | >=0；技术调优 |

### `gameplay_rules`
| 字段 | 类型 | 规则 |
|---|---|---|
| `fixedStepHz` | int | v0.1 技术默认值 60 |
| `minDropLockSec` | float | 已批准产品值 0.25 |
| `dangerLineRatio` | float | 已批准产品值 0..1；v0.1 = 0.82 |
| `dangerTimeoutSec` | float | 已批准产品值 2.0 |
| `maxDirectSpawnLevel` | int | 已批准产品值 3 |
| `maxMergeLevel` | int | 已批准产品值 10 |

正式人工维护表创建后仍以 `.xlsx` 存放于 `project/config/source/`。运行时应消费经过校验和生成的格式，不允许游戏运行时直接解析 Spreadsheet。

校验至少必须拒绝：
- 重复或缺失等级；
- 1..10 中间存在等级断档；
- `diameterRatio` 非严格递增；
- L3 以上出现正数直接投放权重；
- 分数 / 权重 / 计时出现负数；
- 危险线超出可玩区域归一化范围；
- `maxMergeLevel` 与等级表行不一致。

## 14. Debug / QA 可观测性

`DebugHarness` 应在 Local Web 开发环境启用，并允许在 Release Build 中关闭或剔除。

必须提供的控制 / 观测能力：
- 开局前设置 RNG Seed；
- 在不修改正式配置的情况下强制下一只投放等级，用于隔离测试；
- 显示 `runtimeId + level` Overlay；
- 显示碰撞体轮廓；
- 显示危险线与投放排除带；
- 显示固定步编号、投放锁 elapsed、危险 elapsed；
- 记录合成 Pair 选择和源对象消费事件日志；
- 条件允许时支持 Debug 模式暂停 / 单步模拟；
- 提供快速 Reset / Restart。

QA 可利用这些能力证明不存在重复消费和隐藏计时漂移。

## 15. 错误处理与不变量

开发期断言：
- Active `runtimeId` 唯一；
- 已消费猫不能再次被消费；
- 合成源等级相同且 <= 9；
- `resultLevel == sourceLevel + 1`；
- Score Delta 只能来自经过校验的配置；
- 非 `AIMING` 或非 `RUNNING` 状态不得释放；
- 外部暂停时危险 elapsed 绝不能增加；
- 固定步清理完成后，不得存在引用已销毁 Physics Body 的 Active Cat。

正式环境遇到可恢复的表现层问题时，应优先安全降级并记录诊断信息，而不是直接 Hard Crash。

## 16. 性能边界

MVP 本地实体数量较小，不提前引入复杂对象池框架或迁移到 ECS。

建议的轻量优化：
- 条件允许时复用小型事件 / 候选数组；
- 不要在每次 Contact Callback 内频繁创建临时对象；
- 使用物理引擎支持的 Body Sleeping；
- 对异常高的 Active Cat 数量设置 Debug 报告 / 上限告警；
- 表现层粒子数量限制留给后续 VFX 设计。

Cat Node 对象池只有在 Client Profile 证明 Spawn/Despawn 压力真实存在后才引入，本 Tech Design 不把对象池作为强制要求。

## 17. Client 实现交接条件

正式 Client 编码开始前，仍必须通过以下流程 Gate：
- 本 Tech Design 获得 `USER_APPROVED`；
- 最终视觉实现依赖的 Art Direction 获得 `USER_APPROVED`；
- QA `TEST_PLAN` 与 Client `FEATURE_BRIEF` 组成 Artifact Contract 要求的开发开工包，并获得对应批准。

Client 原型不得静默改变已经批准的 Product 语义。如果原型证明需要修改投放权重、等级尺寸、危险线或计分，必须回到 Product，通过版本化的影响分析 / PRD Revision 处理。

## 18. 验收条件追溯

- PRD AC-01/02 -> `SpawnController` + 经过校验的加权 RNG。
- AC-03 -> 基于碰撞半径计算 `aimX` 边界。
- AC-04 -> “0.25s + 排除带”双条件解锁。
- AC-05/06 -> Contact 合法性 + 最大等级限制。
- AC-07 -> 稳定候选排序 + `consumedThisStep`。
- AC-08 -> 新结果猫从下一个固定步开始具备合成资格。
- AC-09 -> `ScoreSystem` 只响应成功合成事件。
- AC-10/11/12 -> 合成后再执行 `DangerSystem` 的固定步顺序。
- AC-13 -> `GameplayClock` 外部暂停冻结。
- AC-14 -> `GameplaySession` 完整单局重置。

## 19. 当前未决技术调优项

以下内容不阻塞 Tech Design 审批：
- 第一版可玩原型完成后的具体物理系数；
- 根据最大可直接投放 Collider 和 UI 安全区计算的排除带实际像素高度；
- 合成结果继承速度使用 0%、部分继承还是源速度平均值的手感对比；
- 最终正式 Collider 使用圆形还是根据获批 Art 轮廓使用简单凸形。

这些都属于技术调优细节；如果会改变已批准的玩法语义，必须重新进入 Product Review，不能由 Tech 或 Client 静默修改。
