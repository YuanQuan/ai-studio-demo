# 核心玩法测试计划基线

## 状态
- 当前批准版本：`GAME-008-QA-CORE-TEST-PLAN` / v0.1 / `USER_APPROVED`
- 正式 Artifact：`deliverables/qa/GAME-008-QA-CORE-TEST-PLAN/TEST_PLAN_v0.1.md`

## 首轮正式环境
- Local Web。
- 9:16 基准视口，建议 720×1280，并记录浏览器/DPR。
- 使用可设置 RNG Seed 的 DebugHarness。

## 当前必须覆盖
- PRD AC-01～AC-14。
- Current/Next 与 L1–L3 投放池。
- aimX 边界与 0.25s + 排除带双条件投放锁。
- L1–L10 同级合成、异级不合成、三体/四体、防重复消费、连续合成。
- 分值表与无额外 Combo。
- 危险线 WARNING/恢复/2 秒 Game Over/临界合成救场。
- 暂停/后台冻结。
- Restart 完整重置。
- UI/VFX 视觉实现对批准 Artifact 的一致性。

## Debug 可观测性 Gate
正式 QA 前至少提供：固定 Seed、强制 Next Level、runtimeId/level、Collider、Danger Line、Spawn Exclusion Band、fixed step、dropLockElapsed、dangerElapsed、Merge candidate/selected pair/consumed IDs 日志、Restart。

## 当前显式不测
除非后续任务明确要求：微信/抖音真机专项、网络/弱网/重连、Server/API/数据库、正式性能/内存/负载专项、与本功能无关的广泛回归。

## 后续正式 QA 产物
- `CLIENT_TEST_CASES.md`
- Visual QA 证据
- `bug_reports/`
- `TEST_REPORT.md`

## Flow Gate
P0=0、P1=0 才允许正式功能完成；P2 可延期但必须进入 Test Report。