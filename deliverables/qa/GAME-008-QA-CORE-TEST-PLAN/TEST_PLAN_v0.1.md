# 核心玩法 QA 测试计划 v0.1

- Task：`GAME-008-QA-CORE-TEST-PLAN`
- 状态：`USER_APPROVED`
- Owner：QA
- 正式需求：Core Gameplay PRD v0.1（AC-01～AC-14）
- 正式视觉基线：Art Direction v0.1 / `project/ART_GUIDE.md`
- 正式技术基线：Core Tech Design v0.1 / `project/ARCHITECTURE.md`
- 配套开工概要：Client Feature Brief v0.1

## 1. 测试目标

验证首个可玩版本严格实现已批准的“投放 + 物理堆叠 + 同级合成 + 计分 + 危险线”核心循环，并证明：
- 不会重复消费/重复计分；
- 2 秒危险规则不受帧率、暂停或后台真实时间影响；
- 三体/四体与连续合成行为可追溯；
- Current/Next、投放锁与边界规则符合 PRD；
- 视觉实现不造成明显碰撞体误导。

## 2. 正式执行环境

### 首轮必须执行
- Local Web。
- 固定测试视口至少包含一个 9:16 基准档；建议首轮使用 720×1280 CSS 参考视口，并记录 DPR/浏览器版本。
- 使用可设置 RNG Seed 的 DebugHarness。

### 当前默认不执行
除非后续 Task/用户明确要求：
- 微信小游戏真机专项测试。
- 抖音小游戏真机专项测试。
- 网络、弱网、断线、重连测试（MVP 无网络玩法）。
- Server/API/数据库测试（MVP 无 Server 实现）。
- 正式性能/内存/负载专项测试。
- 与本功能无关的广泛回归。

这些范围不是“永远不测”，而是当前开工包的显式排除项。

## 3. 需求追溯范围

| PRD AC | 主要测试主题 |
|---|---|
| AC-01 | 新局初始化、Current/Next、分数/危险状态清零 |
| AC-02 | L1–L3 投放池、无 L4+ 直接投放、可重复等级 |
| AC-03 | 最左/最右 aimX 合法边界、释放后不可直接操控 |
| AC-04 | 0.25s + 排除带双条件投放锁 |
| AC-05 | L1–L9 同级合成、异级不合成 |
| AC-06 | L9→L10、L10 不再升级/计分 |
| AC-07 | 三体同时接触只先合法消费一对 |
| AC-08 | 连续合成逐级发生、无 Combo 倍率 |
| AC-09 | 分值表、非合成行为不计分 |
| AC-10 | WARNING 可恢复、回线下计时清零 |
| AC-11 | 临界合成救场优先于死亡 |
| AC-12 | 连续越线 2 秒 Game Over，结果快照正确 |
| AC-13 | 暂停/后台冻结物理与危险计时 |
| AC-14 | Restart 完整重置本局状态 |

## 4. 功能测试重点

### Spawn / Input
- Seed 固定后验证 Current/Next 队列可重复。
- 强制 L1/L2/L3 分别测试左右 aim 边界。
- 在 0.25 秒已到但上一只仍在排除带时不得释放。
- 上一只已离开排除带但 0.25 秒未到时不得释放。
- 上一只在排除带中被合法合成消费时，排除带条件视为满足，但仍受 0.25 秒最小锁约束。

### Merge
必须构造：
- 两只同级普通合成。
- 异级持续接触。
- 三只同级近同时接触。
- 四只同级可形成两个配对。
- 两个结果猫下一 fixed step 再继续合成。
- L10 + L10。

证据至少记录 runtimeId、候选 pair、最终消费 pair、score delta。

### Score
- 每种 L1+L1 至 L9+L9 分值至少有数据驱动验证。
- 验证普通碰撞、投放、时间流逝不直接加分。
- 验证同一源对象不会因多 contact 重复加分。

### Danger
- 单猫短时越线 <2s 后回落：SAFE + timer=0。
- 多猫越线时，只要仍有一只越线计时持续。
- 全部回落后 timer 清零。
- 接近 2s 时发生合法合成并清空危险区域：不得 Game Over。
- 连续达到 2s 且仍越线：Game Over。
- Game Over 后投放与新增计分关闭。

### Pause / Background
- WARNING 期间暂停 3s：恢复后 dangerElapsed 不应增加这 3s。
- DROP_LOCKED 期间暂停：dropLockedElapsed 不应按真实时间跳增。
- 后台恢复首帧不得产生大 delta 导致瞬间死亡/物理爆炸。

### Restart
- 清空所有 Active Cat、待处理合成、VFX残留、输入手势。
- score/highest/danger/queue 重置。
- 本地 Best Score 不属于核心重置对象。

## 5. Debug 可观测性 Gate

正式 QA 前 DebugHarness 至少要能看到/控制：
- RNG Seed。
- 强制 Next Level。
- runtimeId + level。
- Collider。
- Danger Line。
- Spawn Exclusion Band。
- fixed step 计数。
- dropLockElapsed。
- dangerElapsed。
- Merge candidate / selected pair / consumed IDs 日志。
- Restart。

缺少用于证明 AC-07/AC-11/AC-13 的关键可观测性时，QA 可判定对应验证 `BLOCKED`，不能靠肉眼猜测通过。

## 6. Visual QA

### 当前正式基线
- `project/ART_GUIDE.md`。
- 10级猫咪、棋盘和HUD方向的已批准 Art 概念。

### 待绑定基线
`GAME-005-UI-HUD-SPEC` 与 `GAME-006-VFX-SPEC` 获得 `USER_APPROVED` 后，将其路径加入正式视觉检查点，不提前把当前 Draft 当作批准基线。

### 首批视觉检查
- 猫咪可见轮廓与 Collider 是否明显错位。
- 危险线是否始终可见且不遮挡核心信息。
- WARNING 是否同时有颜色外的状态提示。
- HUD 是否侵入投放区或主要堆叠区。
- 合成 VFX 是否短促、是否遮挡邻近猫咪。
- 多次连续合成是否造成粒子/飘字严重堆叠。

证据：固定视口截图；VFX节奏使用关键帧/短录屏。

## 7. 后续正式测试产物
正式编码开始后准备：
- `CLIENT_TEST_CASES.md`：逐条可执行用例，追溯 AC / Task。
- Visual QA 截图、差异图、关键帧/短录屏。
- `bug_reports/`：P0/P1/P2 缺陷。
- `TEST_REPORT.md`：最终执行结果与质量结论。

当前 MVP 无 Server 范围，因此不创建 `SERVER_TEST_CASES.md`；若后续加入 Server 功能，再单独创建。

## 8. 严重级别与流程 Gate
- **P0**：无法启动/核心循环无法执行/严重数据或运行崩溃；必须阻塞。
- **P1**：核心行为不符合已批准 PRD，例如重复合成、错误计分、危险线错误、暂停计时错误；必须阻塞。
- **P2**：功能语义正确但存在尺寸、颜色、间距、轻微视觉偏差等；允许带入下一版，但必须在 Test Report 明确列出。

正式功能完成要求 P0=0、P1=0；P2 是否延期由最终质量评审记录。

## 9. 开工 Gate
正式客户端编码需：
- Client `FEATURE_BRIEF_v0.1` 用户批准。
- 本 `TEST_PLAN_v0.1` 用户批准。
- Core PRD / Tech Design 已批准（已满足）。

UI/VFX 正式视觉实现还需对应规格用户批准。

## 10. 风险
- 物理是混沌系统，不以长时间轨迹像素级一致作为跨平台通过标准；验证规则语义和可接受手感。
- 若没有固定 Seed 和运行时 ID 日志，三体/连锁问题难以复现，因此 DebugHarness 是正式 QA 前置条件。
- 首轮仅 Web 不能代表微信/抖音真机最终性能，发布前如进入这些平台必须另开平台专项测试范围。