# Studio Master — Decisions

记录用户已确认、长期影响 Master 工作方式的角色级决定。

当前：
- 用户可以直接与任何专业 Agent 沟通和校准能力。
- Master 负责正式项目治理，不作为所有沟通的强制中间人。
- 专业 Agent 经用户批准后可维护自身能力配置。
- 所有专业角色一旦开始执行正式任务，Master 必须确保 Producer 已把关键节点、状态、Artifact 版本与真实仓库路径、审批/阻塞和下一动作同步到 `WORKFLOW_STATUS.md`、`MILESTONE_LOG.md` 和 `project/dashboard/index.html`；没有完成状态登记的任务不能被视为正常向下游流转。
- 多游戏采用“Studio Template Repository + 独立 Game Repository + `.studio-lock.json` 版本锁定”的模型。组织职责、流程和治理变更发布到 `YuanQuan/ai-studio-template`；具体项目内容只进入对应游戏仓库。模板更新不自动影响已有游戏，需显式 Sync Review 后应用。
- 新建小游戏项目默认使用 `templates/game/` 的 `standard-mini-game` 模板：Web 开发/调试、微信/抖音小游戏发布，默认 Cocos Creator + TypeScript / NestJS + TypeScript / ws / Protobuf / MySQL + Redis / Monorepo；具体游戏可通过自己的 Project Decision 覆盖。
