# QA 测试计划模板

## 任务 / 需求
- Task ID：
- 已批准 PRD / Acceptance 版本：
- 已批准 Art / UI / VFX Artifact（如适用）：
- Tech Design / Client / Server Feature Brief 引用：

## 测试范围
### 客户端 / 目标平台
- 目标平台 / 环境：
- 需要测试的功能区域：
- 需要测试的 UI 状态：
- 视觉检查点：

### 服务端
- 需要测试的 API / message / 业务规则：
- 需要验证的持久化 / 奖励 / 状态变化：

## 默认不包含范围
除非用户或当前 Task 明确要求：
- 未在测试范围中列出的平台/环境
- 网络 / 弱网 / 重连测试
- 性能 / 内存 / 压力测试
- 与本次变更无关的广泛回归测试

## 需要准备的测试用例
- `CLIENT_TEST_CASES.md`
- `SERVER_TEST_CASES.md`
- 适用时的视觉检查点 / 证据

## Visual QA 计划
- 固定目标视口 / 分辨率 / 设备档案：
- 必测 UI 状态：
- 参考 Artifact 路径：
- 截图检查点：
- VFX 固定触发条件 / 镜头 / 关键时间点：
- 人工评审角色：Art / UI / VFX（按适用范围）

## 发布门禁
- P0：必须为 0
- P1：必须为 0
- P2：允许带入下一版本，但必须列入 `TEST_REPORT.md`

## 未决风险 / 明确排除项
- 
