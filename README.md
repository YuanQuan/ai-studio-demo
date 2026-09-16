# ai-studio-demo

这是基于 `YuanQuan/ai-studio-template` 的 `standard-mini-game` 初始化出的独立小游戏项目仓库。当前 Studio Layer 版本锁定在 `.studio-lock.json`，本仓库后续只保存这款游戏的 Project Layer 与锁定的 Studio 快照。

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

## 当前初始化状态
- GitHub：`YuanQuan/ai-studio-demo`
- Template：`standard-mini-game`
- Studio 版本：见 `.studio-lock.json`
- Product / Decisions / Workflow / Approval / Milestone / Dashboard：保持新项目空状态
- 第一条正式工作从 Product 总纲 / 模块树开始，再进入 Artifact / User Approval 流程。

## 不允许继承的内容
新游戏不得继承其他游戏的：PRD、数值、美术风格、实际素材、业务协议消息、任务历史、审批历史、Bug、玩家数据、密钥或具体项目 Decision。
