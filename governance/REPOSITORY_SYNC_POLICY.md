# Studio Template / Game Repository Sync Policy

## 目标

将“可复用的虚拟游戏工作室组织能力”与“某一款具体游戏的项目事实”彻底分离。

- Studio Template Repository：`YuanQuan/ai-studio-template`
- Game Repository：每款游戏一个独立 GitHub 仓库

模板仓库只保存可跨游戏复用的组织、职责、流程、Schema、Playbook 与项目骨架；具体游戏需求、技术选型、资产、代码、任务状态、审批记录和项目决策只能进入对应 Game Repository。

## 1. 两层模型

### Studio Layer — 可同步

以下路径属于 Studio Layer，可从模板仓库同步到游戏仓库：

- `AGENTS.md`
- `agents/`
- `rules/`
- `schemas/`
- `governance/`

这些内容描述组织结构、职责边界、工作流、Artifact Contract、审批门禁、通用角色能力和结构化协议。

### Project Layer — 项目私有

以下路径属于 Project Layer，不允许回传到 `ai-studio-template`：

- `STUDIO.md`
- `project/`
- `tasks/`
- `deliverables/`
- `client/`
- `server/`
- `tests/`
- 具体游戏资产、配置、源代码、PRD、研究、技术决策、测试报告和审批历史

模板仓库在 `templates/game/` 提供标准小游戏 Project Template。它可以保存明确标注为“模板默认值”的小游戏技术基线、空白文档结构、Dashboard、QA 默认范围与目录初始化清单，但不能保存任何具体游戏已经填写的玩法、数值、视觉、任务、审批、Bug、资产或项目决策历史。

当前默认模板 ID 为 `standard-mini-game`，目标为本地 Web 开发/调试 + 微信小游戏 + 抖音小游戏发布；默认技术基线见 `templates/game/STUDIO.md` 与 `templates/game/PROJECT_TEMPLATE_MANIFEST.yaml`。

## 2. 新游戏创建

创建一款新小游戏时：

1. 读取 `YuanQuan/ai-studio-template` 的最新 `main` commit。
2. 将当前 Studio Layer 复制进新 Game Repository。
3. 默认使用 `standard-mini-game`，将 `templates/game/` 展开为该游戏初始 Project Layer，并按 `PROJECT_TEMPLATE_MANIFEST.yaml` 创建空目录。
4. 在游戏仓库根目录写入 `.studio-lock.json`，记录模板来源和精确 commit。
5. 从此以后该游戏独立演进；模板仓库的后续变化不会自动改变正在开发中的游戏。

推荐 `.studio-lock.json`：

```json
{
  "source": "YuanQuan/ai-studio-template",
  "template": "standard-mini-game",
  "template_path": "templates/game",
  "commit": "<template-commit-sha>",
  "synced_at": "<ISO-8601>",
  "mode": "pinned"
}
```

## 3. 推荐本地工作区布局

允许把独立 Game Repository 放在 Studio Template 本地工作目录的子目录中，但 Git 仓库必须保持完全独立。例如：

```text
ai-studio-template/              # Studio Template Repository
├── agents/
├── rules/
├── governance/
├── templates/
└── ai-studio-demo/              # 独立 Game Repository（自身拥有 .git）
    ├── STUDIO.md
    ├── project/
    ├── tasks/
    ├── deliverables/
    ├── client/
    ├── server/
    └── tests/
```

工作边界：
- 角色职责、组织能力、Workflow、Artifact Contract、Schema、标准小游戏模板等 Studio Layer 修改在父目录进行。
- 具体游戏的 PRD、研究、美术、UI/VFX、技术设计、源码、测试、任务、审批、Dashboard 等 Project Layer 修改只在对应游戏子目录进行。
- 父仓库必须通过本地 exclude 或等价方式忽略嵌套 Game Repository，禁止把子仓库内容加入 Studio Template commit。
- 子仓库保留自己的 `origin`、commit history 和 `.studio-lock.json`，不得把父仓库当作其 Git history。
- 普通 Studio Layer 后续升级仍按显式 Sync Review 执行，不能因为目录嵌套而自动继承父目录变化；用户在当前游戏中明确发起的流程/职责/治理修改按第 4.1 节执行双同步。

## 4. 已有游戏同步 Studio 更新

模板职责/流程发生变化后，不自动推入所有游戏仓库。

### 4.1 当前游戏中的组织级规则变更：默认双同步

当用户正在某个 Game Repository 中工作，并明确要求修改以下任一组织级内容时：Workflow、Agent 职责/约束、审批/Artifact Gate、Artifact Contract、用户审批文档格式/语言规范、跨角色治理、Studio/Game 仓库同步规则，除非用户明确说明“仅当前项目”，否则该指令默认同时授权本轮进行两处文件级同步：

1. 更新当前 Game Repository 中对应的 Studio Layer 快照与必要的项目模板配置；
2. 更新 `YuanQuan/ai-studio-template` 的主 Studio Layer，以及 `templates/game/` 中受影响的标准小游戏默认模板。

这样当前项目立即使用新规则，未来新游戏也会从最新模板继承。其他已经存在、但未参与本次变更的 Game Repository 仍保持各自 pinned 版本，不自动改写。

该“双同步”只授权文件内容修改，不扩大为 Git 授权。若模板仓库尚未产生新的 commit，不得伪造 `.studio-lock.json` 的 commit；锁文件只在用户另行授权并实际形成可引用模板 commit 后更新。

### 4.2 普通已有游戏升级

当用户明确要求某个游戏“同步最新 Studio 配置”时：

1. 比较该游戏 `.studio-lock.json` 的 commit 与模板最新 commit。
2. 只计算 Studio Layer 的差异。
3. 生成 `STUDIO_SYNC_REVIEW.md` 或等价变更摘要，列出：
   - 新增/修改/删除的角色职责；
   - Workflow / Approval / Artifact Gate 变化；
   - Schema 兼容性变化；
   - 对当前进行中 Task 的潜在影响。
4. 由用户确认是否应用。
5. 应用后更新 Studio Layer 文件与 `.studio-lock.json`。
6. Project Layer 永远不因 Studio Sync 被自动覆盖。

## 5. 项目例外与覆盖

若某一游戏需要不同于 Studio 默认职责/流程的特殊规则，用户应明确说明该变更“仅当前项目”；此时记录在该游戏自己的项目决策中，不回写模板仓库。

若用户没有给出“仅当前项目”限定，而是直接修改流程、角色职责/约束、审批门禁、Artifact Contract、审批文档格式/语言规范或治理方式，则按第 4.1 节视为组织级变更，同时更新当前项目与主模板。玩法、数值、技术选型、视觉风格等项目事实不因本规则自动升级为组织默认。

项目事实优先级保持：
1. 用户最新明确指令。
2. Game Repository 内已批准项目决策与规格。
3. 当前 Task。
4. 当前游戏已锁定的 Studio Layer 快照。

如果需要把某个项目中验证有效的做法推广给所有未来游戏，先明确它已经从“项目经验”升级为“组织级规则”，再修改 `ai-studio-template`。

## 6. 发布边界

向 `YuanQuan/ai-studio-template` 发布时使用白名单原则：

允许发布：
- Studio Layer；
- `templates/game/` 中的标准小游戏项目骨架、模板默认技术基线、空状态 Dashboard/日志、目录初始化清单；
- `docs/` 中的组织/流程说明。

禁止发布：
- 任何已填写的具体 PRD / Game Design / Art / UI / VFX / Tech Design；
- 当前游戏 Architecture / API / DB / Zone / 数值等正式决定；
- 当前任务、进度、Milestone、Approval、Bug、Test Report；
- 游戏源码、真实资产、运行配置和环境信息。

## 7. Master / Producer 责任

### Master
- 判断变更属于 Studio Layer 还是 Project Layer；用户对流程、职责/约束、审批门禁、Artifact Contract、审批文档格式/语言规范与治理方式的明确修改，默认按第 4.1 节作为组织级双同步，除非用户明确限定仅当前项目。
- 对组织级流程/职责/交付规范变更，在同一执行轮同时修改当前 Game Repository 对应 Studio 快照、主 `ai-studio-template` Studio Layer 与受影响的 `templates/game/` 默认项；文件同步完成不等于获得 Git commit/push 授权。
- 创建新游戏仓库时使用模板仓库最新已确认版本。
- 不把玩法、数值、技术选型、视觉等单项目决策错误升级为全局组织规则。

### Producer
- 在 Game Repository 内跟踪项目任务/Artifact/审批/进度。
- 记录当前游戏使用的模板 commit。
- 执行普通 Studio Sync 前检查进行中任务是否受影响，并形成可见变更摘要。
- 第 4.1 节触发时，校验当前游戏 Studio 快照、主 Studio Layer 与受影响的 `templates/game/` 默认项均已同步更新；模板尚无真实新 commit 时不得提前改写 `.studio-lock.json`。
- Project Layer 内容绝不回传模板仓库。

## 8. Git 操作授权边界

所有 Studio Repository 和 Game Repository 默认禁止 Agent 自行产生任何 Git 动作。文件编辑完成不代表允许进入 Git 历史或远程仓库。

只有用户明确下达对应 Git 指令后，Agent 才能执行该次明确授权范围内的操作，包括但不限于：
- `git init` / clone / remote 配置；
- `git add` / commit；
- pull / fetch / push；
- checkout / switch / branch；
- merge / rebase / cherry-pick；
- reset / revert / restore；
- tag / force-push / history rewrite；
- 通过 GitHub API、插件或其他方式产生等价的远程 commit、branch、file write、merge 或删除。

默认工作方式：
- Agent 可以直接编辑用户授权范围内的项目文件与 Artifact。
- 编辑后保持工作区状态，不自动 add、commit、push 或同步远端。
- 不把“定期同步”“仓库已连接”“之前允许过一次 push”解释为持续 Git 授权。
- 用户说“提交”只授权 commit，不自动包含 push；说“推送”才授权 push；说“拉取/同步远端”才授权 pull/fetch 等对应动作。
- 需要执行破坏性 Git 操作时，即使用户要求 Git 操作，也必须严格按其明确范围执行，不扩展到其他仓库。

该规则适用于 Master、Producer 和所有专业 Agent，以及父 Studio Repository 和所有 Game Repository。

## 9. 不采用自动实时继承

默认不使用 Git submodule 或“模板 main 一更新，所有游戏自动跟着更新”的方式。

原因：职责、审批门禁、Artifact Contract 或 Schema 的变化可能改变正在执行的任务含义。每款游戏必须锁定一个可追溯的 Studio 版本。第 4.1 节是唯一的当前项目即时同步例外：它基于用户正在当前游戏中明确修改组织级流程/职责/交付规范的授权，只同步当前游戏与主模板；其他既有游戏仍需显式 Sync + Review。
