# 项目决策记录

本文件只记录当前 Game Repository 的项目级决策，不得复制其他游戏的决策历史。

## 条目格式
- Decision ID：
- 日期：
- 状态：`PROPOSED` / `ACCEPTED` / `SUPERSEDED`
- 范围：
- 决策：
- 理由：
- 受影响 Artifact / 角色：
- 迁移 / 回滚说明：

## 决策

### DEC-006 — Cocos Creator 版本固定为 3.8.8
- Decision ID：DEC-006
- 日期：2026-09-17
- 状态：`ACCEPTED`
- 范围：客户端引擎版本 / 新游戏模板默认技术基线
- 决策：当前游戏正式固定使用 `Cocos Creator 3.8.8 + TypeScript`。后续由 `standard-mini-game` 模板创建的 Cocos 新游戏也默认固定到 3.8.8，不自动跟随 Creator 新版本升级。默认优先使用 Creator 3.8.8 内置引擎；只有存在明确引擎定制需求时才使用官方 `cocos/cocos-engine` tag `3.8.8` 自定义引擎源码。
- 理由：3.8.8 是官方 3.8 系列正式稳定发布，与当前 2D Physics、Web、微信小游戏、抖音小游戏需求匹配；固定版本可以避免项目迭代过程中因编辑器/API/构建链自动变化造成返工。
- 受影响 Artifact / 角色：`STUDIO.md`、`project/ARCHITECTURE.md`、Client、Tech Lead、`templates/game/STUDIO.md`、`templates/game/PROJECT_TEMPLATE_MANIFEST.yaml`、`templates/game/project/ARCHITECTURE.md`。
- 迁移 / 回滚说明：未来升级 Creator 必须单独形成版本升级影响评审和项目决策。该决定不要求把完整 Cocos Engine 源码提交到游戏仓库；本地自定义引擎目录应作为可重建工具依赖处理。

### DEC-005 — 用户审批文档默认使用中文
- Decision ID：DEC-005
- 日期：2026-09-17
- 状态：`ACCEPTED`
- 范围：Artifact Contract / 用户审批文档 / Studio 交付规范
- 决策：凡需要用户阅读、评审或明确批准的文档型 Artifact，标题、章节、正文、表格说明、风险、结论、建议和审批说明默认尽量使用中文。代码、接口/字段名、文件路径、固定状态枚举、协议/库/产品专有名词可保留英文；如英文术语会影响理解，应优先补充中文含义。只有用户明确要求其他语言时才切换。
- 理由：用户需要直接阅读和审批正式产物。统一使用中文可以减少理解成本，同时保留必要技术标识，避免因强制翻译代码和协议名造成歧义。
- 受影响 Artifact / 角色：所有需要用户审批的 Product / Art / UI / VFX / Tech / Client / Server / QA 文档；`AGENTS.md`；`rules/artifact_contract.md`；人工审批文档模板；当前 `GAME-003` / `GAME-004` 待审批文档。
- 迁移 / 回滚说明：本规则已同步到当前游戏 Studio 快照、主 `ai-studio-template` Studio Layer 和 `standard-mini-game` 模板。已 `USER_APPROVED` 的历史 Artifact 不因语言规范直接覆写，避免破坏审批版本追溯；当前仍处于 `USER_REVIEW` 的文档直接中文化。该文件级同步不授权 Git commit/push。

### DEC-004 — 组织级流程、职责与交付规范默认双同步
- Decision ID：DEC-004
- 日期：2026-09-16
- 状态：`ACCEPTED`
- 范围：Studio 治理同步 / 当前游戏集成
- 决策：当用户在当前游戏中明确修改 Workflow、Agent 职责/约束、审批/Artifact Gate、Artifact Contract、用户审批文档格式/语言规范、跨角色治理或 Studio/Game 同步规则时，除非用户明确说明“仅当前项目”，否则默认视为 Studio 级规则变更。同一执行轮必须同步更新当前游戏的 Studio Layer 快照、主 `YuanQuan/ai-studio-template` Studio Layer，以及受影响的 `templates/game/` 默认模板，使未来新游戏直接继承。其他既有游戏继续保持各自 pinned 版本，除非另行同步。
- 理由：流程、职责和通用交付规范不应在每个新游戏中重复发现和手工修复，同时其他正在开发的旧游戏仍需要受控升级。
- 受影响 Artifact / 角色：Master、Producer、`AGENTS.md`、`rules/`、`agents/`、`governance/`、`STUDIO.md`、`YuanQuan/ai-studio-template`、`templates/game/`。
- 迁移 / 回滚说明：该授权仅覆盖文件级同步，不包含 Git commit/push，也不允许在模板尚未产生真实 commit 前伪造新的 `.studio-lock.json` commit。

### DEC-003 — MVP 核心玩法采用客户端本地权威简化
- Decision ID：DEC-003
- 日期：2026-09-16
- 状态：`ACCEPTED`
- 范围：MVP 核心玩法架构 / 权威模型
- 决策：在已经批准的 MVP 范围内，单局状态、合成/计分/危险线逻辑和本地最佳分流程全部在客户端本地运行，不实例化玩法 WebSocket、服务端 Session、MySQL 或 Redis。继承模板中的服务端权威能力保留给未来真正需要可信在线状态的功能。批准 `GAME-004-CORE-TECH-DESIGN` v0.1 时，同时接受本项目级简化方案。
- 理由：Product Outline v0.1 与 Core Gameplay PRD v0.1 都明确排除了 MVP 的服务端权威玩法。为当前核心循环保留未使用的服务端基础设施只会增加成本和耦合，并不能服务已经批准的需求。
- 受影响 Artifact / 角色：`STUDIO.md` 中的权威模型解释；Tech Design 获批后更新的 `project/ARCHITECTURE.md`；Tech Lead；Client；Server（MVP 不创建实现任务）；QA。
- 迁移 / 回滚说明：目前尚未开始正式实现，因此没有运行时迁移成本。如果未来排行榜、付费奖励、跨设备存档或反作弊要求需要可信结果，应创建新的 Product / Tech Change 和权威模型设计，不得静默信任历史本地成绩。

### DEC-002 — 用户授权继续后持续执行到下一个审批 Gate
- Decision ID：DEC-002
- 日期：2026-09-16
- 状态：`ACCEPTED`
- 范围：Master 编排 / Producer 流程控制
- 决策：用户授权项目继续后，Master 必须立即执行所有已授权、依赖满足且不存在真实阻塞的工作，直到到达下一次明确的 `USER_REVIEW`、确实需要用户输入的重大决策、已记录的 `BLOCKED` 或 `DONE`。仅创建/解锁任务不是合法停止点。只有 Owner 在当前执行周期已经实际开始产出或验证 Artifact 时，任务才能进入 `IN_PROGRESS`。Producer 在结束本次执行前必须进行 continuity check，不得留下无产出证据的 `READY/IN_PROGRESS` 占位任务。
- 理由：ChatGPT 不会在后台异步继续项目工作。之前 Art/Tech 任务被创建并标记为 `IN_PROGRESS`，但没有实际生成 Artifact，Dashboard 因而错误表现为“正在进行”。本规则让流程状态与真实执行一致，并把已授权工作推进到真正有意义的用户 Gate。
- 受影响 Artifact / 角色：Master、Producer、所有专业任务线；`STUDIO.md`；`project/WORKFLOW_STATUS.md`；`project/MILESTONE_LOG.md`；Dashboard 状态语义。
- 迁移 / 回滚说明：已有但没有执行证据的 `IN_PROGRESS` 任务应立即继续执行并产出 Artifact，或退回 `READY/BLOCKED` 并记录原因。该规则后续已由用户明确提升为 Studio 级治理，并同步到当前游戏快照、主 Studio Layer 和 `standard-mini-game` 模板。

### DEC-001 — Producer Dashboard 从当前项目目录查看 Artifact
- Decision ID：DEC-001
- 日期：2026-09-16
- 状态：`ACCEPTED`
- 范围：Producer Dashboard UX / Artifact 可追溯性
- 决策：`project/dashboard/index.html` 中展示的每个 Artifact 必须从当前项目目录解析，而不是从 GitHub/raw 等远端读取。Markdown / 文本 / JSON / 图片 / PDF 等适合的 Artifact 应尽量提供页面内预览，并保留项目相对路径用于追溯。“打开”入口同样使用当前项目相对 URL。
- 理由：用户需要直接从 Producer Dashboard 查看工作区最新产物，包括尚未 commit/push 的 Artifact。远端 `main` 可能滞后，新生成的本地文件还会稳定返回 HTTP 404。
- 受影响 Artifact / 角色：Producer；`project/dashboard/index.html`；后续所有引用 Product / Art / UI / VFX / Tech / Client / Server / QA Artifact 的 Dashboard 快照。
- 迁移 / 回滚说明：Dashboard 的预览 / 打开操作从 `project/dashboard/` 使用项目相对路径。如果浏览器 `file://` 安全策略阻止 `fetch` 本地文件，应通过项目本地静态 HTTP 服务打开 Dashboard；不得退回 GitHub 远端作为预览数据源。
