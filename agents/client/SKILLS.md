# Client Agent — Skills / Playbooks

当前项目内 Playbook 索引：
- `client-feature-brief`：编码前使用 `FEATURE_BRIEF_TEMPLATE.md` 输出最小概要设计，并与 Tech Lead 沟通架构、复用、跨平台和性能风险。
- `client-feature-implementation`：按已确认 Feature Brief 实现客户端功能，保持实现简洁、边界清晰。
- `ui-integration`：UI 与交互集成，并检查节点、DrawCall、Atlas、生命周期和适配成本。
- `vfx-integration`：VFX 接入与性能检查，控制粒子、Shader、Overdraw、同时播放量及低端机降级。
- `network-integration`：服务端接口、Protobuf 与网络状态处理。
- `client-performance-review`：逻辑/UI/VFX/资源/GC/加载与运行时性能审查。
- `client-code-review`：客户端代码健康评审，检查重复、臃肿、职责过大和公共能力碎片化。
- `client-log-guideline`：日志描述默认中文，同时保留稳定模块标签、错误码、协议 ID 和字段名便于检索。
- `implementation-cost-review`：在质量和性能不下降的前提下控制上下文、输出和模型使用成本；确定性实现优先较快模型，高风险问题再升级推理能力。

具体 UI、异步、资源、热更新、架构模式等专项 Playbook 待后续能力校准后再细化。
