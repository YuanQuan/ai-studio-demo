# Client Feature Brief Template

客户端非琐碎需求在编码前先形成轻量概要设计，并与 Tech Lead 沟通。文档目标是减少返工、提前发现复用和性能风险，不追求篇幅。

## 1. Goal / Scope
- 要实现什么。
- 明确不做什么。

## 2. Existing Reuse
- 可复用的 Component / Service / Manager / Utility / Config / Prefab / VFX / UI 组件。
- 若需要新增公共能力，说明为什么现有能力不能复用。

## 3. Structure
- 涉及的 Module / Component / Scene / Prefab / UI / Resource。
- 新增职责和依赖方向。

## 4. Protocol / Platform Impact
- 是否涉及当前项目网络/API/协议 Contract。
- 是否涉及目标平台 Adapter / SDK 差异。

## 5. Performance Impact
至少检查：
- Update / Timer / Event 数量与频率。
- 临时对象与 GC 分配。
- 节点数量、DrawCall、Batch、纹理/Atlas。
- Prefab/资源加载、缓存与释放。
- VFX 粒子、Shader、Overdraw、同时播放数量。
- 动画、Tween、骨骼或其他持续计算。
- 是否需要对象池、懒加载、降级策略或目标设备限制。

## 6. Logging / Debug
- 需要的中文日志与稳定模块标签/错误码。
- 是否需要接入当前项目的 UI / Component / VFX / Network / Platform Lab 或等价独立调试入口。

## 7. Tests
- 当前项目主要开发/调试环境验证。
- 本次 Task 明确涉及的目标平台差异验证。
- 本次 Task 明确要求的性能验证与关键指标。

## 8. Risks / Tech Lead Review
- 主要返工风险。
- 需要 Tech Lead 特别确认的架构、复用、平台或性能点。
