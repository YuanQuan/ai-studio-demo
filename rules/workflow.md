# Workflow

## 标准状态

复合父任务可使用：`BACKLOG -> SPEC -> READY -> IN_PROGRESS -> REVIEW -> INTEGRATION -> QA -> DONE`。

专业子任务默认使用用户审批门禁：`BACKLOG -> SPEC -> READY -> IN_PROGRESS -> REVIEW -> USER_REVIEW -> DONE`。

用户退回时：`USER_REVIEW -> REVISION -> IN_PROGRESS -> REVIEW -> USER_REVIEW`。

允许的异常状态：`BLOCKED`、`CANCELLED`。

## 状态含义

- `BACKLOG`：已记录但尚未形成可执行规格。
- `SPEC`：正在明确产品/技术/视觉规格与验收标准。
- `READY`：输入、依赖和验收标准足够，可以开始。
- `IN_PROGRESS`：Owner 正在执行。
- `REVIEW`：Owner 已提交交付物，等待专业 Review。
- `USER_REVIEW`：专业 Review 已通过，等待用户确认当前 Artifact 版本。
- `REVISION`：用户或专业 Review 要求修改，Owner 正在准备新版本；旧版本必须保留可追溯。
- `INTEGRATION`：多个已获用户批准的交付物正在合并、联调或接入。
- `QA`：进入正式验证与回归。
- `DONE`：满足 Definition of Done。
- `BLOCKED`：存在无法继续的必要依赖或决策。
- `CANCELLED`：由 Master 根据用户或项目决策取消。

## 权限

- Master：负责创建/拆解正式任务、与用户沟通和跨角色编排，不绕过 Producer 的审批门禁。
- Producer：负责校验依赖、Artifact 版本和用户审批，维护 `WORKFLOW_STATUS.md`、`MILESTONE_LOG.md`、`APPROVAL_LOG.md` 与 Dashboard；可在证据完整时执行 `REVIEW -> USER_REVIEW`、用户批准后的 `USER_REVIEW -> DONE`，以及用户退回后的 `USER_REVIEW -> REVISION`。
- 专业 Owner：可将自己的 `READY -> IN_PROGRESS -> REVIEW`；返工时按 `REVISION -> IN_PROGRESS -> REVIEW`；遇阻塞可申请 `BLOCKED`。
- QA：提交测试结论和正式测试产物；TEST_REPORT 同样需进入用户审批门禁。

## 连续执行到下一 Gate

当用户明确授权继续当前正式流程后，默认采用“连续执行到下一 Gate”模式：

- Master 必须在同一执行周期继续推进所有已授权、依赖满足且无真实阻塞的任务，直到出现 `USER_REVIEW`、必须由用户决定的重大事项、明确 `BLOCKED`，或任务已 `DONE`。
- 创建 Task、解锁依赖、进入 `READY`、进入 `IN_PROGRESS`、更新 Dashboard 或说明下一步计划，都不是合法停止点。
- `IN_PROGRESS` 只表示 Owner 已在本轮实际开始生产/验证 Required Artifact；不得用作“以后会继续”的占位状态。未开始执行时保持 `READY`。
- Producer 在每次准备结束本轮已授权推进前必须执行 continuity check：所有开放任务必须处于 `USER_REVIEW`、`DONE`、有具体原因的 `BLOCKED`，或有本轮真实产出证据且因工具/会话边界无法再推进；发现无阻塞的空转 `READY/IN_PROGRESS` 时必须通知 Master 继续执行。
- 该规则不允许绕过用户审批门禁；它只禁止在两个 Gate 之间无故停顿。

## 规则

1. 没有 Acceptance Criteria 的任务不得进入 READY。
2. 依赖未完成或所依赖 Artifact 尚未 `USER_APPROVED` 时不得进入 READY/IN_PROGRESS，除非 Task 明确是与其无关的可并行准备工作。
3. REVIEW 不等于完成；专业 Review 通过后仍需进入 USER_REVIEW。
4. 用户没有明确批准时，Producer 不得推断通过，也不得解锁下游正式任务。
5. 用户退回必须产生新 Revision，不能覆盖历史审批版本。
6. QA FAIL 必须产生缺陷或返工任务，然后回到相应实现阶段。
7. 涉及多个 Agent 的父任务，只有关键子任务均满足完成条件和用户审批条件后才能 DONE。
8. 任何专业 Owner 进入 `IN_PROGRESS` 时，Producer 必须记录 `TASK_STARTED`；该状态必须同时对应本轮真实执行证据。之后 Draft、Review、用户审批、Handoff、Blocked/Unblocked、实现完成、QA、Done 等关键节点必须追加到 `project/MILESTONE_LOG.md` 并同步 Dashboard，存在 Artifact 时必须记录真实仓库路径。
9. 用户已授权继续且下一个 Gate 尚未到达时，Master/Producer 不得以“任务已创建”“任务已启动”或“等待稍后继续”为由结束流程更新。
10. 详细审批与版本规则见 `rules/approval_protocol.md`。
