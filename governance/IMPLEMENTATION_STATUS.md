# 工作流 v2 实施与恢复记录

状态：PARTIAL_BLOCKED。用户已批准实施；尚未完整落地，不是等待用户重复确认。最后记录日期：2026-09-24。

## 本轮真实完成

- 新增 rules/qa_protocol.md：功能测试含适用性能；上线测试包含真机、多平台、实际弱网；区分阶段、目标版本、证据、发布就绪和旧计划迁移。主模板与当前游戏均已保存，且均标记 PARTIAL_NOT_RELEASED。
- 新增 rules/session_protocol.md：保存会话启动、按需读取、关键节点落盘、单写者与版本恢复设计。主模板已标记 DRAFT_NOT_ACTIVATED；当前游戏副本的同一状态标注写入被拦截，因此两份存在这一头部差异。恢复工具与自动入口尚未实现。
- 主模板及当前游戏 agents/qa/ROLE.md 已更新且内容一致。
- 仅主模板 agents/qa/CONSTRAINTS.md 更新成功。当前游戏该文件仍为旧版；同步被拦截，随后回退主模板的尝试也被拦截。不要声称已经回滚或同步完成。

## 被工具拦截的动作

工具返回：因 OpenAI 无法确定请求的安全状态，已拦截此工具调用。

- 创建 governance/CONTINUOUS_IMPROVEMENT_POLICY.md：未写入。
- 修改主模板 AGENTS.md 接入新入口和 Schema：未应用；主模板与当前游戏 AGENTS.md 仍保持旧内容且一致。
- 修改当前游戏 agents/qa/CONSTRAINTS.md：未应用。
- 回退主模板 agents/qa/CONSTRAINTS.md：未应用。
- 给当前游戏 rules/session_protocol.md 增加未激活标注：未应用。

最终尝试的只读批量核验（文件一致性、任务 JSON 状态、HTML 路径检查）也被工具安全检查拦截，该核验没有运行。先前成功执行的 read / diff / shasum 结果仍有效，但不能据此声称最终全量校验通过。

未换用其他工具、脚本或路径绕过以上拦截。

## 尚未实施

自主调优授权、跨会话自动入口、版本注册、Schema v2、执行与回归校验器、QA 其余配置及测试计划模板、STUDIO/项目模板默认值、完成定义、完整两阶段 QA 看板及自动生成、经验回流和可验证回退机制。现有用户审批及 Git 边界未改变。

当前游戏已额外保存 project/SESSION_STATE.md，并在现有 Dashboard、WORKFLOW_STATUS 与 MILESTONE_LOG 中记录本轮组织维护阻塞；这些是状态记录，不代表整套自动流程已经实现。

QA 协议与现有 STUDIO 默认值、部分角色配置尚未对齐，因此不能把本次工作作为已验证的新模板版本，也不宜据此创建新游戏。

## 已执行的只读核验

用 DevSpace read、diff -q 和 shasum 检查文件。未执行 Git 命令；未执行游戏功能、性能、真机、多平台或弱网测试；未声称 Schema/流程测试通过。

已观察摘要：
- agents/qa/ROLE.md：51f5127ff76e17a8f42333849ccb23e1a3fb289d04d2053777af6a31f95002c1
- 主模板 agents/qa/CONSTRAINTS.md：450e06555f52df75af41e4961e700dc52368f8dec44f6b078af65c58b959faf9
- 当前游戏对应 CONSTRAINTS.md：2c0f819ddc180379c5d01982faa6fd4e39f5f51f62662b9559854ed310ed880c
- 两份 AGENTS.md：f578975dcc4e262b25889fb63db6fbe2a04001888ecf375adb925a8199a4b104

这些是检查时的内容摘要，不是 Git commit。后续会话必须重新核对，不能覆盖其他会话的新修改。

## 下一会话的恢复重点

先读取本记录和实际文件，确认工具侧拦截是否已经解决，再决定如何安全地完成一致性更新。不要反复重试被拒绝的动作、改用其他工具绕过限制，或把用户已批准的方案当作已完成的文件变更。

保留已有项目需求、代码、已批准计划、任务和审批；从真实任务门禁恢复，不能因组织规则修改就把未验证的游戏工作标记通过。具体项目恢复索引保存在其 project/SESSION_STATE.md（若写入成功）。
