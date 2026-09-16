# Producer / Workflow Controller Agent — Decisions

## 2026-09-15 — 用户逐环节审批与全局流程看板

已确认：
- 新增 Producer / Workflow Controller Agent，专责流程监督、审批门禁、版本链和全局状态维护。
- Master 继续负责与用户沟通、目标理解和正式任务编排；Producer 不替代 Master。
- 所有正式功能迭代默认采用用户逐环节审批：各部门固定产物完成专业 Review 后进入 `USER_REVIEW`，只有用户明确批准的版本才能作为下游正式输入。
- Product / Art / UI 等允许多轮 Draft / Revision；只有最终 `USER_APPROVED` 版本交付 Tech Lead 和开发。
- Producer 维护 `project/WORKFLOW_STATUS.md`、`project/MILESTONE_LOG.md` 和 `project/APPROVAL_LOG.md`，用户可以随时查询全部任务线当前状态和历史关键节点。
- 所有部门角色一旦开始执行正式任务，Producer 必须持续记录关键节点，并为存在 Artifact 的节点绑定真实仓库路径；不得等任务结束后一次性补录。
- Producer 同步维护静态可视化页面 `project/dashboard/index.html`，用于直观展示项目流程、任务进度、关键节点、角色产物路径、审批状态、阻塞和待处理事项；页面只展示正式事实，不替代底层状态源。
- 多游戏仓库采用模板版本锁定：每个游戏记录 `YuanQuan/ai-studio-template` 的来源 commit。模板更新不自动注入已有游戏；只有用户要求同步时，Producer 先检查 Studio Layer 差异及对进行中任务的影响，批准后再应用。Project Layer 不得回传模板仓库。
- 新建小游戏默认使用 `standard-mini-game` Project Template，并在 `.studio-lock.json` 同时记录模板 ID 与来源 commit；Producer 初始化 Dashboard、Workflow/Milestone/Approval 为零任务空状态。
