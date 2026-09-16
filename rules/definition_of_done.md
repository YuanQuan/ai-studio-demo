# Definition of Done

一个正式功能只有同时满足以下条件，Master Agent 才能标记为 `DONE`：

1. 需求范围与 Acceptance Criteria 已明确，并存在正式 Product Artifact（适用时）。
2. `rules/artifact_contract.md` 要求的所有必要专业交付物均已存在、可追溯、通过必要专业 Review，并且当前正式版本已获得用户明确批准；聊天内容不能替代缺失产物。
3. 实现与已锁定的 Product / Architecture / API / UI / Art / VFX / Config 规格一致。
4. 代码或资产集成完成，没有用 Mock 冒充正式结果。
5. 每条 Acceptance Criteria 都有验证结果和证据。
6. 本次测试范围内 P0/P1 缺陷已关闭；P2 可以延期到下一版本，但必须在 `TEST_REPORT.md` 和任务跟踪中明确保留。
7. QA 给出 `PASS`，并在 `TEST_REPORT.md` 明确列出测试范围与未测试项；正式测试报告已获得用户确认。如明确不需要 QA，也必须由 Master 说明原因并获得用户接受。
8. 新产生的长期有效事实已经写回 `project/` 或 `project/DECISIONS.md`。
9. 任务、交付物和测试报告之间可以通过 ID 追溯。
10. Producer 已确认所有必需 Artifact Gate / 用户审批门禁完成，`WORKFLOW_STATUS.md` 与 `APPROVAL_LOG.md` 一致；Master Agent 已完成最终验收并准备好向用户说明结果。

## 不属于 DONE 的情况

- “代码写完了但没运行”。
- “界面看起来差不多但交互状态没定义”。
- “服务端接口写了但客户端和服务端字段没对齐”。
- “测试报告没有说明实际覆盖范围，导致未测试的平台/网络/性能/回归被误解为已经通过”。
- “Agent 在聊天里说完成，但仓库没有交付物或证据”。
- “原画/UI 只描述了效果但没有对应图稿/效果图（任务需要视觉产物时）”。
- “程序写完代码但缺少要求的 Feature Brief / Implementation Report / Tech Review”。
- “QA 口头说通过但没有 TEST_PLAN、适用的 CLIENT_TEST_CASES / SERVER_TEST_CASES、必要视觉证据或 TEST_REPORT”。
- “公共配置只存在代码常量或聊天表格，没有正式 xlsx 源表/数据字典（任务需要配置驱动时）”。
- “专业 Review 已通过，但用户尚未确认当前 Artifact 版本”。
- “产品/美术/UI 仍处于 Draft/Revision，却被 Tech Lead 或开发当成最终输入”。
- “用户批准的是 v2，但下游继续引用已被 Superseded 的 v1”。
