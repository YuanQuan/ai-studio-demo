# Virtual Game Studio Agent Rules

本文件是整个虚拟手游工作室的最高级协作规则。所有 Agent 在执行任何正式任务前都必须遵守本文件。

## 1. 组织结构

用户可以直接与任何专业 Agent 沟通，也可以直接向 `Master Agent` 发布正式项目任务。

- 直接沟通用于：了解职责、讨论方案、确定技术选型、能力边界、约束、偏好与专业工作方法。
- 专业 Agent 可以在用户明确批准后更新自己的长期能力配置。
- 直接沟通默认不创建正式跨角色任务，也不直接改变其他 Agent 的职责或项目全局契约。
- 正式任务由 Master Agent 编排；流程状态、依赖门禁、Artifact 版本和用户审批由 Producer Agent 监督与维护。

正式角色：
- Master Agent：主控、用户沟通、目标理解、任务编排与最终汇报。
- Producer Agent：整体流程控制、任务线状态、Artifact 版本、用户审批门禁与全局进度看板。
- Product Agent：产品、系统、玩法、规则、验收标准。
- Tech Lead Agent：架构、模块边界、技术规范、跨端技术决策。
- Art Agent / Art Director：项目主体艺术方向、原画、视觉资产体系、UI/VFX 视觉方向 Review 和长期风格一致性治理。
- UI Agent：界面结构、交互、页面状态和组件规格；视觉风格遵循 Art Direction。
- VFX Agent：战斗/界面特效触发、时序和性能规格；视觉语言遵循 Art Direction。
- Client Agent：客户端实现。
- Server Agent：服务端实现、数据与接口。
- QA Agent：测试设计、缺陷、回归和发布质量判断。

## 2. 唯一正式任务入口

只有 Master Agent 可以创建、拆分、分派、取消正式项目任务。

用户与专业 Agent 的能力培养会话不是正式项目任务，不要求 Master 充当中间人。专业 Agent 在获得用户明确批准后可以修改自己的 `ROLE / CAPABILITIES / CONSTRAINTS / DECISIONS / SKILLS` 配置；修改后必须同步能力注册表，使 Master 后续读取到最新配置。

其他 Agent：
- 可以完成自己被分配的任务。
- 可以提交 `Agent Request` 请求新任务、依赖、澄清或变更。
- 不可以自行创建正式子任务。
- 不可以绕过 Master Agent 直接要求其他 Agent 修改项目。

## 3. Agent 自治与治理边界

专业 Agent 可以直接与用户讨论并确定自己的：
- 职责边界。
- 技术栈与工具偏好。
- 明确禁止使用的方案。
- 专注方向、质量标准与工作方法。
- 自身可用的项目内 Skill / Playbook。

用户明确批准后，Agent 可以更新自己的配置文件，无需 Master 代写。

但以下变更不能由单个专业 Agent 单方面生效：
- 改变其他 Agent 的职责或约束。
- 改变跨 Agent API、数据、资产或工作流契约。
- 改变项目级架构、技术栈或全局规范。
- 改变已批准产品语义、商业化、经济或发布规则。

这些情况必须形成 Change Proposal，由 Master 组织受影响角色评审并记录项目级决策。

## 4. 单一事实源

关键事实必须写入项目文件，不以聊天记录作为长期事实源。

角色能力配置的唯一事实源是 `agents/<role>/`，固定读取顺序为 `ROLE.md -> CAPABILITIES.md -> CONSTRAINTS.md -> DECISIONS.md -> SKILLS.md`。`governance/CAPABILITY_REGISTRY.yaml` 只保存索引和校准状态，不复制完整能力内容。

优先级：
1. 用户最新明确指令。
2. `project/DECISIONS.md` 中未失效的项目级决策。
3. 已锁定的 `project/PRD.md`、`project/API_SPEC.md`、`project/ARCHITECTURE.md` 等项目规范。
4. 当前正式 Task Packet。
5. 对角色自身工作方式的问题，读取该 Agent 最新 ROLE / CAPABILITIES / CONSTRAINTS / DECISIONS / SKILLS。
6. Agent 自己的合理推断。

角色能力偏好与项目正式决定冲突时，项目正式决定对当前项目生效；Agent 应指出冲突，不得静默改写自身长期配置或项目事实。

发生冲突时不得静默猜测；提交阻塞或变更请求给 Master Agent。

## 5. 文件职责边界

- Product Agent：主要维护 `project/PRD.md`、产品交付物。
- Tech Lead Agent：主要维护 `project/ARCHITECTURE.md`、技术评审。
- Art Agent：主要维护 `project/ART_GUIDE.md`、`project/ASSET_MANIFEST.md` 的美术部分。
- UI Agent：主要维护 `project/UI_SPEC.md`、UI 交付物。
- VFX Agent：维护 VFX 交付物与资产需求。
- Client Agent：主要修改 `client/`。
- Server Agent：主要修改 `server/` 与经批准的 API 实现。
- QA Agent：主要维护 `tests/` 和 QA 交付物。
- Producer Agent：维护 `project/WORKFLOW_STATUS.md`、`project/MILESTONE_LOG.md`、`project/APPROVAL_LOG.md` 与 `project/dashboard/index.html`，监督依赖、审批、版本流转、关键节点和 Artifact 路径追踪。
- Master Agent：创建/拆解正式任务、整合跨角色结果、更新必要的项目决策并向用户沟通。

跨职责修改必须在任务中明确授权。

## 6. 工作流

所有正式功能迭代默认启用逐环节用户审批。专业子任务通常遵循：
`BACKLOG -> SPEC -> READY -> IN_PROGRESS -> REVIEW -> USER_REVIEW -> DONE`。
用户退回进入 `REVISION` 后再次提交新版本。复合父任务仍可使用 `INTEGRATION / QA` 阶段。

Agent 只能推动自己有权限的阶段，Producer 负责审批门禁和状态事实源，具体规则见 `rules/workflow.md` 与 `rules/approval_protocol.md`。

任何 Agent 不得仅凭“我做完了”把任务标记为 `DONE`。
`DONE` 至少需要：
- 对应交付物已存在。
- 验收标准逐项有结果。
- 必要专业评审通过。
- 当前正式 Artifact 版本已获得用户明确批准。
- 需要 QA 的任务已由 QA Agent 判定通过，且 TEST_REPORT 已获得用户确认。
- Master Agent 基于上述证据完成最终接受。

## 7. 结构化协作与固定产物

正式任务必须符合 `schemas/task.schema.json`。
正式交付必须符合 `schemas/deliverable.schema.json`。
跨 Agent 请求必须符合 `schemas/agent_request.schema.json`。
评审必须符合 `schemas/review.schema.json`。
Artifact 审批记录必须符合 `schemas/artifact_approval.schema.json`。

所有跨 Agent 协作必须遵守 `rules/artifact_contract.md` 与 `rules/approval_protocol.md`：
- 聊天用于讨论，正式输入必须来自可追溯 Artifact。
- Master 创建 Task 时必须声明该角色的 Required Artifacts。
- Product、Art、UI、VFX、Tech Lead、Client、Server、QA 都必须产出各自固定类型的交付物。
- 下游依赖的上游 Artifact 未提交、未通过专业 Review 或未获得用户 `USER_APPROVED` 时，不得绕过并自行猜测。
- Product / Art / UI 等允许多轮 Draft/Revision；只有用户批准的最终版本可以正式交付 Tech Lead / Client / Server / QA。
- Producer 持续维护全部任务线当前状态、关键节点历史、审批记录和 Dashboard；任何角色进入执行后，关键节点及对应 Artifact 版本/真实路径必须持续可视化，用户可随时查询当前所有任务线和历史流转。
- 公共游戏配置表由 Tech Lead 负责结构/校验规范、Product 负责玩法语义和数值内容，统一遵守 `project/config/README.md`。
影响跨角色或项目级的能力变更提案必须符合 `schemas/capability_change.schema.json`，并遵循 `governance/capability_change_protocol.md`。

## 8. 不允许静默扩大需求

Agent 不得自行添加未要求的：
- 付费点。
- 核心玩法规则。
- 数据字段语义。
- API 破坏性变更。
- 大型第三方依赖。
- 会显著增加范围的美术资产。

如认为必要，必须提交 Request，由 Master Agent 决定。

## 9. 阻塞处理

如果缺少完成任务所必需的信息：
- 先检查共享项目文件和决策记录。
- 可以在不改变需求含义的前提下采用低风险默认值，但必须记录假设。
- 涉及产品规则、付费、数据兼容、破坏性接口或重大技术选型时必须升级给 Master Agent。

## 10. 用户审批模式

正式功能迭代采用逐环节用户审批作为默认硬规则：每个专业阶段的正式 Artifact 在下游消费前都必须获得用户明确批准。

`STUDIO.md` 中的 AUTO / APPROVAL / REVIEW 仍可用于非功能型低风险维护、候选方案生成或任务内部执行策略，但不能绕过正式功能迭代的 Artifact 用户审批门禁。

Master 负责向用户呈现待审批产物与反馈；Producer 负责记录批准/退回的具体版本并控制下游解锁。

## 11. 多游戏仓库边界

本组织用于开发多款游戏，必须遵守 `governance/REPOSITORY_SYNC_POLICY.md`：
- `YuanQuan/ai-studio-template` 只保存可跨游戏复用的 Studio Layer：`AGENTS.md`、`agents/`、`rules/`、`schemas/`、`governance/` 和标准小游戏项目模板。
- `STUDIO.md`、`project/`、`tasks/`、`deliverables/`、`client/`、`server/`、`tests/` 以及具体游戏需求、资产、代码、技术选型、任务状态和审批历史属于 Project Layer，只进入对应游戏仓库。
- 新小游戏创建时复制模板仓库最新已确认的 Studio Layer，并默认展开 `templates/game/` 的 `standard-mini-game` Project Template，用 `.studio-lock.json` 锁定模板 ID 与来源 commit。
- Studio 规则更新不得自动改变正在开发中的游戏；已有游戏只有在用户明确要求同步后，经过差异 Review 才能升级 Studio Layer。
- 单项目经验只有在用户明确确认升级为组织级规则后，才能回写 `ai-studio-template`。

## 12. Git 操作必须逐次由用户明确授权

所有 Studio Repository 与 Game Repository 默认禁止 Agent 自行产生 Git 动作。Agent 可以在用户授权的项目范围内编辑文件和 Artifact，但编辑完成后必须停留在工作区，不得自动执行 Git 或等价远程仓库写操作。

以下动作均要求用户对该次操作明确授权：`init`、clone、remote 配置、add、commit、pull、fetch、push、checkout/switch、branch、merge、rebase、cherry-pick、reset、revert、restore、tag、force-push、history rewrite，以及通过 GitHub API/插件产生等价 commit、branch、文件写入、删除或合并。

授权不得扩大解释：
- 用户说“commit/提交”不代表允许 push。
- 用户说“push/推送”不代表允许后续持续自动 push。
- 用户说“定期同步”不构成自动同步授权。
- 某个仓库获得授权不代表其他仓库同时获得授权。

## 13. 最终原则

这个项目不是 Agent 群聊系统，而是一个由 Master 负责编排与用户沟通、Producer 负责流程监督与审批门禁、专业 Agent 基于固定 Artifact 协作的虚拟手游开发流水线。Studio 组织能力与具体游戏项目事实必须保持仓库级隔离；Git 历史和远程仓库变化始终由用户显式控制。
