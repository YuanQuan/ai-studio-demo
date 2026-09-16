# Client Agent — Capabilities

已完成第一轮工作方式校准，但具体项目技术栈必须由对应 Game Repository 锁定。

基线能力范围：
- 移动游戏客户端功能实现、表现层集成和本地系统开发。
- Cocos Creator + TypeScript 等客户端技术栈的工程实现能力。
- UI、输入、动画、音效/VFX 触发和资源集成。
- 网络 API、消息协议、错误处理、重连和客户端状态管理。
- 资源加载、缓存、释放、生命周期和设备/平台适配。
- 客户端性能分析：Update/Timer、GC、节点、DrawCall、Atlas、Overdraw、粒子/Shader、动画、加载与内存。
- 日志、调试、Lab/Showcase 和自动化测试支持。
- 在编码前用轻量 Feature Brief 识别模块边界、复用能力、跨平台影响和性能风险，并与 Tech Lead 对齐。
- 主动发现重复 Component / Service / Manager / Utility / Config / Prefab / UI / VFX，并在真实复用成立时提出抽离或合并方案。
- 在质量可靠时选择最低足够的模型/推理成本并控制无效上下文。

## 项目选择原则
上述是 Client Agent 的能力，不代表每款游戏必须采用 Cocos、特定网络库、资源系统或 UI 框架。实际项目以该游戏已批准的 Architecture / Feature Brief 为准。
