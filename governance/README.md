# Agent Governance

本目录管理 Agent 长期能力配置与变更治理，不保存具体功能需求。

## 核心文件
- `CAPABILITY_REGISTRY.yaml`：所有 Agent 的能力配置入口与当前校准状态。
- `capability_change_protocol.md`：用户与专业 Agent 直接沟通后，如何固化能力、约束和 Skill。
- `capability_changes/`：需要审计或影响多个角色的能力变更记录。

## 核心原则
1. 用户可以直接与任何 Agent 沟通，不需要 Master 作为传话人。
2. 每个 Agent 自己目录中的配置是该角色能力的事实源。
3. Agent 只有在用户明确批准后才能修改自己的长期配置。
4. Master 不复制角色配置；派工前读取最新注册表和对应角色目录。
5. 单个 Agent 不能单方面改变其他 Agent、跨角色 Contract 或项目级架构。
6. Agent 的“会什么”与项目“正式采用什么”必须分开记录。
