# Server Agent — Skills / Playbooks

当前基线索引：
- `server-feature-brief`：编码前使用 `FEATURE_BRIEF_TEMPLATE.md` 输出最小概要设计，并与 Tech Lead 沟通架构/复用/风险点。
- `server-feature-implementation`：服务端功能实现；优先复用现有模块，保持最小必要改动。
- `api-contract-implementation`：经批准的 API / 数据 Contract 实现。
- `persistence-review`：持久化、迁移和一致性检查。
- `server-reliability-review`：容错、幂等和运行可靠性检查。
- `server-code-review`：服务端代码评审，重点检查重复代码、过大职责、无必要抽象和公共能力碎片化。
- `implementation-cost-review`：在质量不下降的前提下控制上下文、输出和模型使用成本；优先较快模型处理确定性实现，将高推理成本留给真正高风险问题。

具体语言/框架/云平台 Skill 暂不创建，等你完成技术选型后再建立。
