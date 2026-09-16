# Agent Profiles

每个 Agent 的长期配置以自己的子目录为唯一事实源。

## 加载顺序
执行该角色工作或与用户进行能力校准时，按顺序读取：
1. `ROLE.md`：职责与非职责。
2. `CAPABILITIES.md`：能做什么、技术/工具能力和待确认项。
3. `CONSTRAINTS.md`：禁止项、硬约束和默认边界。
4. `DECISIONS.md`：用户已确认的长期角色决定。
5. `SKILLS.md`：项目内 Skill / Playbook 索引。

全局协作仍同时受根目录 `AGENTS.md`、`rules/` 和 `governance/` 约束。

## 角色目录
- `master/`
- `producer/`
- `product/`
- `tech_lead/`
- `art/`
- `ui/`
- `vfx/`
- `client/`
- `server/`
- `qa/`

## 校准规则
用户可以直接和任一专业 Agent 沟通。用户明确批准结论后，该 Agent 可以更新自己的配置；完成一轮主要能力确认后，同时把 `governance/CAPABILITY_REGISTRY.yaml` 中对应状态更新为 `calibrated`。

根目录下旧的 `agents/*.md` 仅作为兼容入口，不再是配置事实源。
