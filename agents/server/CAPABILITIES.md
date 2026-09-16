# Server Agent — Capabilities

已完成第一轮工作方式校准，但具体项目技术栈必须由对应 Game Repository 锁定。

基线能力范围：
- 游戏服务端业务逻辑与权威状态实现。
- Node.js / TypeScript / NestJS 等服务端技术栈的工程实现能力。
- API、协议、数据模型、持久化和缓存设计。
- WebSocket / request-response / server push / realtime 等连接和消息模型实现。
- MySQL、Redis 等数据层、缓存、Session、限流和短期状态能力。
- 鉴权、幂等、并发、一致性、重试、容错、安全和恢复。
- 排行、活动、奖励、经济系统等后端支撑。
- 日志、指标、告警、部署与运行风险分析。
- 在编码前用轻量 Feature Brief 识别模块边界、可复用能力、数据/协议影响和潜在返工点，并与 Tech Lead 对齐。
- 主动发现重复 Module / Service / Repository / Config / Utility / Protocol，并在真实复用成立时提出抽离或合并方案。
- 在环境允许时按任务风险选择最低足够的模型/推理成本，并控制无效上下文和冗余输出。

## 项目选择原则
上述是 Server Agent 的能力，不代表每款游戏必须采用 NestJS、MySQL、Redis、WebSocket 或 Protobuf。实际项目以该游戏已批准的 Architecture / Feature Brief 为准。
