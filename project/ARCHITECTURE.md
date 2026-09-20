# 项目架构基线

## 状态
- 核心玩法技术设计：`USER_APPROVED`
- 批准版本：v0.1
- 正式来源：`deliverables/tech_lead/GAME-004-CORE-TECH-DESIGN/TECH_DESIGN_v0.1.md`
- 项目决策：`DEC-003` 已 `ACCEPTED`

## 平台与客户端
- 开发/调试主环境：Local Web。
- 发布目标：微信小游戏、抖音小游戏。
- 客户端：Cocos Creator 3.8.8 + TypeScript。
- Creator 版本固定为 `3.8.8`；本项目不自动跟随新版本升级。升级必须先经过兼容性影响评审并形成新的项目决策。
- 默认使用 Cocos Creator 3.8.8 自带引擎；只有确有引擎定制需求时才启用同版本官方 `cocos/cocos-engine` tag `3.8.8` 作为自定义引擎。
- 平台能力通过 WebAdapter / WeChatAdapter / DouyinAdapter 或等价明确 Adapter 隔离，核心玩法不得散落直接调用 `wx.*` / `tt.*`。

## MVP 权威模型
批准的 MVP 为单机休闲玩法：
- 单局状态、物理、合成、计分、危险线和本地最佳分由客户端本地运行。
- 核心循环不实例化 WebSocket、服务端 Session、MySQL 或 Redis。
- 当前不创建 Server 实现任务。
- 若未来增加可信排行榜、付费奖励、跨设备存档或反作弊，再通过新的 Product / Tech Change 重新设计服务端权威模型。

## 核心模块边界
```text
core-gameplay/
├── GameplaySession       # 单局生命周期与组合根
├── GameplayClock         # 固定步长与暂停语义
├── SpawnController       # Current/Next、aimX、投放锁
├── CatRegistry           # 活跃实体与 runtimeId
├── PhysicsFacade         # 物理引擎隔离层
├── MergeResolver         # 合成候选、确定性配对与命令
├── ScoreSystem           # 分数与本局最高等级
├── DangerSystem          # 危险线占用与连续计时
├── GameplayEvents        # 类型化领域事件
├── GameplayConfig        # 已校验运行时配置
└── DebugHarness          # 随机种子、覆盖层、日志与 QA 控制
```

相邻层：
```text
ui/
├── AimInputAdapter
└── HudPresenter
vfx/
└── GameplayVfxPresenter
platform/
└── PlatformLifecycleAdapter
```

UI / VFX 只能消费领域状态和事件，不得通过表现层回写核心规则。

## 模拟与时间
- 技术基线固定步长：`1/60s`。
- 单渲染帧最多补算 4 个模拟步。
- 单帧输入 delta 建议截断到 100ms 以内，避免后台/卡顿恢复时一次性追赶数秒。
- 暂停或应用进入后台时：物理、投放锁计时、危险计时、合成结算全部冻结。
- 恢复前台时不得把真实世界离开时间注入玩法计时。

## 物理边界
- 使用 Cocos Creator 内建 2D 物理能力，并通过 `PhysicsFacade` 隔离引擎 API。
- 物理 Contact Callback 只收集接触事实，不直接销毁或合成对象。
- MVP 优先使用圆形或简单凸形碰撞体。
- Current 在 AIMING 阶段不参与物理、合成和危险线检测。
- 手感目标：低弹性、允许滚动、较快稳定。

## 合成结算
- 每只猫在一局内使用唯一递增 `runtimeId`。
- 接触对使用稳定 pair key 去重。
- 候选按稳定规则排序，使用 `consumedThisStep` 保证源对象每步最多消费一次。
- 三只同级猫同时接触时只先消费一对；四只允许形成两个不重叠配对。
- 新生成结果猫从下一固定模拟步起才可继续参与合成。
- 合成对象的移除和结果生成通过 step 结束阶段的 command buffer 执行，禁止在物理回调中直接改对象生命周期。

## 投放系统
- `SpawnState = AIMING | DROP_LOCKED`。
- Current / Next 的正式随机内容来自已校验配置。
- 下一次投放同时满足：释放后经过至少 `0.25s`，且上一只猫完全离开投放排除带（或已被合法合成消费）。
- 合法 `aimX` 根据棋盘内边界与当前猫碰撞半径计算。

## 危险系统
- 危险线：棋盘自底向上约 `0.82`。
- 连续容错：`2.0s`。
- 每个固定步处理顺序：物理 → 接触快照 → 合成配对 → 应用合成 → 分数/最高等级 → 合成后危险占用 → 危险计时 → Game Over。
- 该顺序保证“合法合成救场优先于死亡判定”。

## 配置治理
Tech Lead 负责结构和校验，Product 负责已批准数值内容。

核心配置至少包含：
- `cat_level`：level、diameterRatio、spawnWeight、mergeScore 与物理调优字段。
- `gameplay_rules`：fixedStepHz、minDropLockSec、dangerLineRatio、dangerTimeoutSec、maxDirectSpawnLevel、maxMergeLevel。

人工维护配置需要时使用 `project/config/source/*.xlsx`；运行时读取经过校验/生成后的格式，不直接解析表格。

## Debug / QA 可观测性
Local Web 调试环境需支持：
- 固定随机种子；
- 强制下一只等级；
- runtimeId / level 覆盖显示；
- 碰撞体、危险线、投放排除带显示；
- fixed-step、投放锁、危险计时显示；
- 合成配对和消费事件日志；
- 调试暂停/单步（可行时）；
- 快速重开。

## 正式开发 Gate
客户端正式编码开始前至少还需要：
- UI / UX Artifact `USER_APPROVED`；
- VFX Artifact `USER_APPROVED`（涉及表现部分）；
- Client `FEATURE_BRIEF` 与 QA `TEST_PLAN` 形成开发开工包并获得用户批准。

批准的 Tech Design 不授权 Client 静默改变 Product 数值、玩法语义或 Art/UI/VFX 正式基线。