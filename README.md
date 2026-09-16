# Standard Mini Game Project Template

这是 `YuanQuan/ai-studio-template` 的标准小游戏项目骨架。以后创建新的小游戏项目时，Master 默认以本目录作为 Project Layer 初始模板，并同时带入模板仓库当时最新的 Studio Layer（`AGENTS.md`、`agents/`、`rules/`、`schemas/`、`governance/`）。

## 默认定位
- 项目类型：小游戏（Mini Game）。
- 开发/调试：本地 Web。
- 发布目标：微信小游戏、抖音小游戏。
- Client：Cocos Creator + TypeScript。
- Server：Node.js + NestJS + TypeScript，模块化单体。
- Network：标准 WebSocket；Server 使用 `ws`；生产 `wss`。
- Protocol：Protobuf。
- Storage：MySQL + Redis。
- Repository：Monorepo。
- Workflow：Master 编排 + Producer 流程控制 + 逐阶段用户审批。

这些是新小游戏的默认技术基线，不代表不可修改。若具体游戏需要改变平台、技术栈、数据层、网络、测试范围或部署模型，必须在该游戏仓库的 `project/DECISIONS.md` 中形成项目级决策，不回写为模板事实，除非用户明确要求升级 Studio Template。

## 新项目初始化
1. 复制最新 Studio Layer。
2. 展开本目录到新 Game Repository 根目录。
3. 将 `.studio-lock.json.example` 复制为 `.studio-lock.json`，写入实际模板 commit。
4. 填写 `STUDIO.md` 的游戏名称和仓库地址。
5. 保持 `project/DECISIONS.md`、任务状态、审批历史、Milestone 与 Dashboard 为新项目空状态。
6. 从 Product 总纲 / 模块树开始第一条正式任务线。

## 不允许继承的内容
新游戏不得继承其他游戏的：PRD、数值、美术风格、实际素材、业务协议消息、任务历史、审批历史、Bug、玩家数据、密钥或具体项目 Decision。
