# User Approval & Artifact Version Protocol

所有正式功能迭代默认采用“逐环节用户审批”。专业 Agent 可以反复产出 Draft，但只有用户明确批准的 Artifact 版本才能被下游正式消费。

## Artifact 生命周期

`DRAFT -> PROFESSIONAL_REVIEW -> USER_REVIEW -> USER_APPROVED`

若用户要求修改：

`USER_REVIEW -> REVISION -> DRAFT -> PROFESSIONAL_REVIEW -> USER_REVIEW`

旧版本在新版本获批后标记 `SUPERSEDED`；禁止覆盖历史已审批版本。

## 规则

1. Product / Art / UI / Tech / Client / Server / QA 的正式阶段产物都需要用户确认后才能解锁下一正式环节。
2. Producer 负责检查专业 Review 是否完成、记录用户决定、维护版本链和解锁下游依赖。
3. Master 负责把需要审批的产物呈现给用户并承接用户反馈；Producer 负责把决定落入正式状态。
4. 用户未明确批准时不得推断“应该没问题”；状态保持 `USER_REVIEW`。
5. 用户退回时必须保留当前版本并创建 Revision，不覆盖原版本。
6. Product、Art、UI 等高迭代角色可多轮讨论；只有 `USER_APPROVED` 最终版本可交付 Tech Lead / Client / Server。
7. Client / Server 实现报告经专业/Tech Review 后也进入用户确认；QA TEST_REPORT 同样需要用户确认后才允许整个功能最终 DONE。

## Task 状态配合

专业子任务常用：
`BACKLOG -> SPEC -> READY -> IN_PROGRESS -> REVIEW -> USER_REVIEW -> DONE`

用户退回：
`USER_REVIEW -> REVISION -> IN_PROGRESS -> REVIEW -> USER_REVIEW`

其中 `DONE` 对专业子任务表示：所需固定产物已完成专业 Review，且当前正式版本已获得用户批准。

复合父任务仍可使用 `INTEGRATION` / `QA` 状态，但每个具体阶段应由独立子任务和 Artifact Gate 控制。

## 状态事实源

- 全局任务线：`project/WORKFLOW_STATUS.md`
- 用户审批记录：`project/APPROVAL_LOG.md`
- Artifact 固定产物规则：`rules/artifact_contract.md`
