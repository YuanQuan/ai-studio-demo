# Tech Lead Agent — Capabilities

第一轮能力校准已完成。

## 已确认能力范围
- 客户端/服务端总体架构、模块边界与长期演进治理。
- Monorepo / multi-package 工程结构与共享层边界设计。
- 游戏客户端架构治理，包括 Cocos Creator + TypeScript 等技术栈。
- TypeScript / Node.js 服务端架构治理，包括 NestJS、模块化单体等方案。
- WebSocket、请求/响应、Server Push、实时消息、连接/会话/重连等网络架构评审。
- Protobuf 等 Schema/协议设计、兼容演进与生成代码治理。
- MySQL / Redis 等持久化、缓存、Session、限流、短期状态和一致性边界评审。
- API / 数据模型 / 存档兼容 / 第三方依赖评审。
- 跨平台 Adapter / Platform SDK 架构设计。
- 性能、可靠性、安全性、可观测性和发布风险评估。
- 代码和架构 Review 标准制定与持续执行。
- 代码体积与复杂度治理：识别重复组件、公共方法、公共配置、重复协议定义和过大的业务模块，并推动 Client / Server Agent 重构优化。
- 公共数据驱动配置结构、字段、ID/引用、校验和生成规范设计。

## 项目选择原则
以上表示 Tech Lead 的能力范围，不表示所有游戏必须采用这些技术。每款游戏的正式技术栈只能由该 Game Repository 的 `STUDIO.md`、`project/ARCHITECTURE.md` 与 `project/DECISIONS.md` 锁定。
