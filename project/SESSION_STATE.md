# 当前项目会话恢复索引

记录日期：2026-09-24。此文件是人工维护的恢复索引，不是 Task、审批或测试结果的事实源，也不代表已经实现自动恢复。

## 优先读取

1. `governance/IMPLEMENTATION_STATUS.md`：本轮工作流修改被工具拦截后的真实文件状态与未完成项。
2. `project/DECISIONS.md`：已有项目决定。
3. `project/WORKFLOW_STATUS.md` 与 `project/APPROVAL_LOG.md`：实际任务与批准记录。
4. `tasks/active/GAME-010-COCOS-ENVIRONMENT-SETUP.json` 及所引用的当前 Artifact。

## 项目门禁（本次读取时）

GAME-001 至 GAME-009 在既有状态表中为 DONE；GAME-010 为 USER_REVIEW。此记录没有重新测试，也没有重新批准这些任务。

GAME-010 仍需用户按原运行冒烟清单确认真实画面、输入与物理手感；当前环境的自动结果不代替该确认。该门禁未因本轮组织调整解锁。

正式引用：
- `deliverables/client/GAME-010-COCOS-ENVIRONMENT-SETUP/IMPLEMENTATION_REPORT_v0.1.md`
- `deliverables/client/GAME-010-COCOS-ENVIRONMENT-SETUP/TECH_REVIEW_v0.1.md`
- `deliverables/client/GAME-010-COCOS-ENVIRONMENT-SETUP/RUNTIME_SMOKE_CHECKLIST_v0.1.md`
- `tests/TEST_PLAN.md`：已有批准计划，不覆盖或回填新性能结果。

## 组织调整状态

用户已经批准实施两阶段 QA、持续调优、跨会话恢复及模板回流的修改方案，但工具多次拦截写入，当前为 PARTIAL_BLOCKED。

已保存 `rules/qa_protocol.md`、`rules/session_protocol.md`，并更新本项目 QA ROLE；当前 QA CONSTRAINTS 仍旧版，其他配套尚未完成。当前项目 session_protocol 的未激活标注写入也被拦截，该文件不能被视为已启用的完整流程。

自主调优授权文件未创建；现有权限和逐项审批仍然有效。AGENTS 入口、Schema、检查工具、性能预算、发布矩阵和模板配置均未完成升级。详细差异与哈希见治理实施记录。

## 下一动作

先解决工具侧写入阻塞并核对实际文件，再恢复这项组织改造，不能继续制造新的规则分叉或绕过拒绝。已授权的方案不需要重复猜测；实际写入和验证仍需完成。

待配套完成后，在 GAME-010 原审批门禁之后，为下一 QA 任务创建功能性能补充计划，并按原有游戏 Artifact 审批规则处理；不能在本轮宣称功能性能或上线测试已经通过。

本轮未修改游戏代码、需求、已批准测试计划、任务状态、审批历史或 .studio-lock.json；未执行 Git 操作。不同会话恢复时应重新读取真实状态，而非仅依赖本索引。
