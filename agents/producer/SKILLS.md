# Producer / Workflow Controller Agent — Skills / Playbooks

- `workflow-status-control`：维护任务线状态、依赖、阻塞和下一动作。
- `artifact-approval-gate`：检查 Artifact 版本、专业 Review 和用户审批，控制下游解锁。
- `revision-chain-management`：管理 Product / Art / UI 等多轮 Draft、Revision、Approved、Superseded 版本链。
- `portfolio-status-report`：从正式状态事实源汇总全部任务线，回答“当前所有任务做到哪里”。
- `milestone-traceability`：角色开工后持续记录 TASK_STARTED、Draft、Review、用户审批、Handoff、阻塞、实现完成、QA、Done 等关键节点，并对齐 Artifact 版本与真实仓库路径后同步 Dashboard。
- `static-dashboard-publish`：把 WORKFLOW_STATUS、APPROVAL_LOG、角色产物与阻塞信息同步为 `project/dashboard/index.html` 静态可视化快照，便于用户直观查看全局进度。
- `approval-audit`：检查是否存在漏审批、错用旧版本、未批准版本被下游引用等流程异常。
