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

## 3. 已有游戏同步 Studio 更新

模板职责/流程发生变化后，不自动推入所有游戏仓库。

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

## 4. 项目例外与覆盖

若某一游戏需要不同于 Studio 默认职责/流程的特殊规则，应记录在该游戏自己的项目决策中，而不是修改模板仓库来适配单个游戏。

项目事实优先级保持：
1. 用户最新明确指令。
2. Game Repository 内已批准项目决策与规格。
3. 当前 Task。
4. 当前游戏已锁定的 Studio Layer 快照。

如果需要把某个项目中验证有效的做法推广给所有未来游戏，先明确它已经从“项目经验”升级为“组织级规则”，再修改 `ai-studio-template`。

## 5. 发布边界

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

## 6. Master / Producer 责任

### Master
- 判断变更属于 Studio Layer 还是 Project Layer。
- Studio 级职责/流程变更获用户确认后，推动落地并发布到模板仓库。
- 创建新游戏仓库时使用模板仓库最新已确认版本。
- 不把单项目决策错误升级为全局组织规则。

### Producer
- 在 Game Repository 内跟踪项目任务/Artifact/审批/进度。
- 记录当前游戏使用的模板 commit。
- 执行 Studio Sync 前检查进行中任务是否受影响，并形成可见变更摘要。
- Project Layer 内容绝不回传模板仓库。

## 7. 不采用自动实时继承

默认不使用 Git submodule 或“模板 main 一更新，所有游戏自动跟着更新”的方式。

原因：职责、审批门禁或 Schema 的变化可能改变正在执行的任务含义。每款游戏必须锁定一个可追溯的 Studio 版本，升级只能通过显式 Sync + Review 完成。
