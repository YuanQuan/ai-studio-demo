# Task Protocol

所有正式工作都由 Master Agent 创建 Task Packet。Task 文件必须符合 `schemas/task.schema.json`。

## 最小字段

- `id`：稳定唯一 ID。
- `title`：任务名称。
- `type`：feature / bug / design / tech / art / ui / vfx / test / refactor / integration / coordination。
- `owner`：负责 Agent。
- `parent`：父任务 ID，可为空。
- `objective`：要达到的结果，而不是执行动作堆砌。
- `inputs`：必须读取的文件或交付物。
- `deliverables`：必须产生的文件、代码或报告。
- `acceptance`：可验证的完成条件。
- `dependencies`：前置任务。
- `status`：工作流状态。
- `approval`：AUTO / APPROVAL / REVIEW。

## Master 拆解原则

1. 按职责和依赖拆，不按“每个 Agent 都必须有活”拆。
2. 一个任务尽量只有一个直接 Owner。
3. 跨角色依赖写进 `dependencies`，不要只写在自然语言里。
4. 能并行的任务才并行；共享同一文件且容易冲突时优先串行。
5. 任务范围改变时更新 Task 或创建 Change Request，禁止静默漂移。
6. 每个正式任务必须根据 `rules/artifact_contract.md` 明确 Required Artifacts，不能只写模糊的“设计/开发完成”。
7. 下游任务依赖上游正式产物时，必须把具体 Artifact 路径与已批准版本写入 `inputs`；依赖产物未达到 `USER_APPROVED` 时不得进入 READY。
8. 公共配置表需求必须拆出 Tech Lead 配置结构/校验职责与 Product 数值/语义职责，避免单一角色同时决定技术结构和玩法数值。
9. Master 创建任务线后必须让 Producer 登记到 `project/WORKFLOW_STATUS.md`；任何 Owner 从 READY 进入 IN_PROGRESS 前，Producer 必须建立当前 Milestone 与 Artifact 路径占位，并在后续每个关键节点同步更新 `WORKFLOW_STATUS.md`、`project/MILESTONE_LOG.md` 和 `project/dashboard/index.html`。每个专业阶段都必须声明用户审批门禁和下一解锁条件。
10. Product / Art / UI 等高迭代任务允许多轮 Draft/Revision，但 Task 的正式输出必须指向最终用户批准版本。
11. Client / Server 功能任务准备进入正式编码前，Master/Producer 同步解锁 QA 测试计划任务；QA 的 `TEST_PLAN.md` 与相关 Client/Server `FEATURE_BRIEF.md` 组成同一“开发开工包”，一起提交用户审批。只有开发设计与测试计划都 `USER_APPROVED` 后才进入正式编码；QA 同时明确 Client/Web / Server 用例范围、Visual QA 证据需求和默认不测试项。

## Owner 执行协议

开始前：
1. 读取 Task 的全部 inputs。
2. 检查依赖是否满足。
3. 检查自己是否有对应文件权限。

完成时：
1. 按 `rules/artifact_contract.md` 提交该角色要求的正式 Artifact，并在 Deliverable 中登记路径。
2. 对每条 Acceptance 给出 `PASS / FAIL / NOT_TESTED` 与证据。
3. 列出假设、风险和未完成项。
4. 检查是否产生需要下游消费的新规格/图稿/配置/设计文档，并明确其版本和依赖关系。
5. 将任务申请推进到 REVIEW，而非直接 DONE；专业 Review 通过后由 Producer 推进到 USER_REVIEW，用户明确批准后才能 DONE/解锁下游。
6. 用户退回时保留当前版本，进入 REVISION 并提交新版本，禁止覆盖历史已审批或已评审版本。
