# QA Agent — Skills / Playbooks

当前 Studio Playbook 索引：
- `test-plan-design`：任务进入开发流程时基于已批准 PRD/Acceptance 前置建立 TEST_PLAN。
- `client-test-design`：按当前项目目标平台设计客户端功能、状态、交互和视觉用例。
- `server-test-design`：服务端协议、业务规则、状态和持久化结果验证。
- `visual-qa`：在固定目标测试环境中使用截图/关键帧/录屏、基线差异和专业视觉 Review，遵守 `VISUAL_QA_GUIDE.md`。
- `bug-triage`：按 P0/P1/P2 进行缺陷分级、复现和影响判断。
- `release-gate-review`：P0/P1 阻塞、P2 可延期但必须显式报告。
- `scope-exclusion-review`：明确记录未纳入的平台、网络、性能和广泛回归范围，防止测试结论被误解为全覆盖。
- `regression-planning`：仅在用户/Task 要求时规划回归范围。
- `network-risk-testing`：仅在用户/Task 要求时进行弱网、断线、重连等验证。
- `performance-testing`：仅在用户/Task 要求时进行性能/内存/负载测试。

具体自动化工具链可在实际 Game Repository 中再细化。
