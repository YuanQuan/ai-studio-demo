# 工作流状态

Producer 是当前所有正式任务线状态的事实源。

## 组织维护阻塞（不改变下方游戏任务门禁）

2026-09-24：工作流 v2 为 `PARTIAL_BLOCKED`。部分 QA 职责与协议已写入，但顶层入口、自主调优策略、当前游戏 QA 约束同步及部分回退被工具拦截。模板与游戏仍有未完成差异，不能视为新流程已启用。详情：`governance/IMPLEMENTATION_STATUS.md`；恢复入口：`project/SESSION_STATE.md`。Dashboard 已展示该阻塞。下方 GAME-010 仍待原用户审批，本轮未补记任何游戏测试通过。

## 汇总
- 活跃正式任务线：1
- 等待用户审批：1
- 阻塞：0
- 已完成正式任务线：9

## 任务线
| 任务线 | 阶段 | Owner | 当前 Artifact | 版本 | 专业评审 / 验证 | 用户审批 | 阻塞 | 下一动作 |
|---|---|---|---|---|---|---|---|---|
| `GAME-001-PRODUCT-OUTLINE` 产品总纲与模块树 | DONE | Product | Product Outline | v0.1 | PASS | `USER_APPROVED` | 无 | 已锁定 |
| `GAME-002-CORE-GAMEPLAY-PRD` 核心玩法 PRD | DONE | Product | Core Gameplay PRD + Flow | v0.1 | PASS | `USER_APPROVED` | 无 | 已锁定 |
| `GAME-003-ART-DIRECTION` 主体美术方向 | DONE | Art | Art Direction + 概念稿 | v0.1 | Art Review PASS | `USER_APPROVED` | 无 | Art Guide 基线 |
| `GAME-004-CORE-TECH-DESIGN` 核心技术设计 | DONE | Tech Lead | Tech Design + Review | v0.1 | Tech Review PASS | `USER_APPROVED` | 无 | Architecture 基线 |
| `GAME-005-UI-HUD-SPEC` HUD / 交互 UI 规格 | DONE | UI | UI Spec + Color + SVG | v0.1 | UI/Art Review PASS | `USER_APPROVED` | 无 | UI 基线 |
| `GAME-006-VFX-SPEC` 核心玩法 VFX 规格 | DONE | VFX | VFX Spec | v0.1 | VFX/Art Review PASS | `USER_APPROVED` | 无 | VFX 基线 |
| `GAME-007-CLIENT-CORE-FEATURE-BRIEF` 客户端开工概要 | DONE | Client | Feature Brief | v0.1 | Client/Tech Review PASS | `USER_APPROVED` | 无 | 编码 Gate 已完成 |
| `GAME-008-QA-CORE-TEST-PLAN` QA 测试计划 | DONE | QA | Test Plan | v0.1 | QA self-check PASS | `USER_APPROVED` | 无 | QA 基线 |
| `GAME-009-CLIENT-CORE-IMPLEMENTATION` 核心玩法领域实现 | DONE | Client | TypeScript Domain + Implementation Report | v0.1 | strict PASS；16/16 tests PASS；Tech Review PASS | `USER_APPROVED` | 无 | 已锁定领域层 |
| `GAME-010-COCOS-ENVIRONMENT-SETUP` Creator 3.8.8 工程与运行时集成 | USER_REVIEW | Client | `ai-demo/` + Cocos Integration Report + Tech Review | v0.1 | Creator Builder PASS；Web 构建 PASS；Tech Review `PASS WITH MANUAL RUNTIME CHECK` | PENDING | 无 | 用户在真实 Creator/浏览器按冒烟清单确认画面、输入与物理手感；批准后进入正式 QA 执行 |

## 当前审批 Gate

### `GAME-010-COCOS-ENVIRONMENT-SETUP` v0.1

已经真实完成：
- Cocos Creator 3.8.8 工程首开与资源数据库初始化；
- 当前实际 Creator 工程：`ai-demo/`；
- `Gameplay.scene`；
- `GameplayBootstrap`；
- 真实 `PhysicsSystem2D / RigidBody2D / CircleCollider2D / BoxCollider2D` 接线；
- 手动 `1/60s` 固定物理步；
- 按住/拖动/松手投放；
- Score / Next / Pause / Danger / Game Over HUD；
- 合成基础 VFX；
- Danger Line / Spawn Exclusion / step / timer Debug；
- Web Desktop Builder 完成；
- 最终增量构建约 20 秒；
- 领域 strict 检查 PASS；
- 核心自动测试 16/16 PASS。

正式审批文档：
- `deliverables/client/GAME-010-COCOS-ENVIRONMENT-SETUP/IMPLEMENTATION_REPORT_v0.1.md`
- `deliverables/client/GAME-010-COCOS-ENVIRONMENT-SETUP/TECH_REVIEW_v0.1.md`
- `deliverables/client/GAME-010-COCOS-ENVIRONMENT-SETUP/RUNTIME_SMOKE_CHECKLIST_v0.1.md`

## 需要用户人工体验确认的内容

自动构建与 HTTP 资源加载已经通过，但当前自动化环境的无头 Chrome 受 macOS GPU / DisplayLink 限制，不能替代真实显示器下的视觉与手感体验。

请在 Creator 3.8.8 中打开：

`ai-demo/assets/scenes/Gameplay.scene`

然后使用浏览器预览，重点确认：
1. 页面正常进入 Gameplay；
2. 按住/拖动/松手可以投放；
3. 猫咪真实下落、碰撞、堆叠；
4. 同级合成与加分可见；
5. 危险线、Pause、Game Over、Restart 行为正常。

详细步骤见 `RUNTIME_SMOKE_CHECKLIST_v0.1.md`。

## 当前视觉边界

当前为**可运行 MVP 集成原型**，使用程序化 Graphics / Label / Tween 验证玩法、Physics、HUD 和 VFX 链路。正式猫咪 Sprite、精细 HUD、完整 VFX 资产仍需后续视觉生产与替换，不属于本 Gate 的“最终美术完成”。

## 下一步

如果用户确认当前真实预览可运行并批准 v0.1：
- `GAME-010` -> DONE；
- 创建并立即执行正式 QA 任务；
- QA 按已批准 `tests/TEST_PLAN.md` 生成 `CLIENT_TEST_CASES.md`、执行核心功能与 Visual QA，直到下一个 `USER_REVIEW`。

## 连续执行检查

Producer continuity check：**PASS** —— `GAME-009` 已 DONE，`GAME-010` 已实际执行到 `USER_REVIEW`；当前无 `READY`、无证据 `IN_PROGRESS` 或未记录阻塞。
