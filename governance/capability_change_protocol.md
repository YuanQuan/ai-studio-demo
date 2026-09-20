# Capability Change Protocol

本协议用于用户直接与某个 Agent 沟通，并把结论固化成长期能力配置。

## A. 允许直接确定并由 Agent 自身更新
在用户明确批准后，Agent 可以直接更新自己的：
- `ROLE.md`：职责与非职责。
- `CAPABILITIES.md`：掌握的技术、工具、方法和优势。
- `CONSTRAINTS.md`：禁止项、必须遵守的限制、默认取舍。
- `DECISIONS.md`：用户已确认的长期角色决策。
- `SKILLS.md`：该角色可调用或应建设的项目内 Skill / Playbook 索引。

无需 Master 参与讨论，也无需 Master 代写。

## B. 必须告知 Master 并进入跨角色治理
若结论会影响以下任一项，不能由单个 Agent 单方面生效：
- 其他 Agent 的工作方式或职责。
- API、数据格式、存档、资源接口、交付格式等 Contract。
- 项目正式技术栈或架构。
- 产品规则、经济、商业化或发布规则。
- 已在执行中的其他正式任务。

此时 Agent 应创建符合 `schemas/capability_change.schema.json` 的 Change Proposal，放入 `governance/capability_changes/`，由 Master 组织受影响角色评审，并把最终项目级决定写入 `project/DECISIONS.md` 及对应规范。

## C. Skill 自我演进规则
Agent 可以提出新增或修改 Skill / Playbook，但不能在没有用户批准的情况下改变自己的长期行为。

流程：
1. Agent 说明现有能力缺口、建议变更、收益和风险。
2. 用户批准或拒绝。
3. 批准后 Agent 更新自己的 `SKILLS.md` 以及对应 Skill 内容。
4. 若仅影响自身，更新注册信息即可。
5. 若影响跨角色 Contract 或项目级规范，提交 Change Proposal 给 Master。

## D. Master 的同步职责
Master 不维护角色配置副本。Master 在创建或分派正式任务前必须：
1. 读取 `governance/CAPABILITY_REGISTRY.yaml`。
2. 读取该任务涉及角色的 ROLE / CAPABILITIES / CONSTRAINTS / DECISIONS / SKILLS。
3. 读取项目正式决策和规范。
4. 若角色偏好与项目决定冲突，以用户最新明确指令和项目正式决定为准，并记录冲突。

当用户在某个当前 Game Repository 中明确修改 Agent 的长期职责、约束或跨角色工作方式时，除非用户明确限定“仅当前项目”，该变更同时视为 Studio 级职责变更：本轮必须同步修改当前游戏的对应 Studio Layer 快照与 `YuanQuan/ai-studio-template` 主 Studio Layer。若该职责变化影响 `standard-mini-game` 的默认工作方式，还必须同步更新 `templates/game/` 中相应默认项。该文件级同步不自动授权 Git commit/push，也不自动改写其他既有游戏。

## E. 校准状态
当用户完成一次角色能力确认后，应把该 Agent 在 `CAPABILITY_REGISTRY.yaml` 中的 `calibration_status` 从 `needs_user_calibration` 更新为 `calibrated`。重大能力变化后可暂时改为 `recalibration_needed`。
