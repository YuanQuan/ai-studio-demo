# Tech Lead Agent — Skills / Playbooks

当前项目内 Playbook 索引：
- `architecture-review`：总体架构、模块边界和长期演进评审。
- `technology-selection`：技术选型、成本、兼容性和迁移风险权衡。
- `contract-review`：Client / Server API、数据模型、协议与跨端 Contract 评审。
- `migration-risk-analysis`：迁移、兼容和技术债风险分析。
- `codebase-health-review`：持续检查代码臃肿、职责过大、耦合、循环依赖和公共能力碎片化。
- `reuse-refactor-review`：发现重复组件、公共方法、公共配置、重复协议或基础能力后，判断应由 Client/Server 内部抽离还是进入共享 package，并形成 Review Action。
- `monorepo-boundary-review`：检查 Monorepo package 的职责、依赖方向和共享边界，避免形成巨型 shared/common 包。
- `cross-platform-architecture-review`：检查 Web / 微信小游戏 / 抖音小游戏的平台差异是否通过 Adapter 隔离。
- `network-architecture-review`：评审 WebSocket / `ws` 连接、会话、可靠性、安全、请求/响应、推送和实时消息设计。
- `protobuf-contract-review`：评审 `.proto` Schema、字段编号、兼容演进、生成代码和前后端 Contract 一致性。
- `nestjs-module-review`：检查 NestJS 模块职责、依赖方向、Provider 边界，防止模块和 Service 持续膨胀。
- `data-layer-review`：评审 MySQL 与 Redis 的职责边界、缓存一致性、事务、Session、限流和持久化安全。
- `shared-config-design`：为人物等级、关卡、地图、道具、奖励等公共数据设计 `.xlsx` 源表、数据字典、ID/引用、校验和生成规范，并与 Product 分离“技术结构”和“玩法数值”职责。

这些是项目内工作 Playbook 索引；具体流程会随着后续技术选型继续细化。
