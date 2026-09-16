# Server Feature Brief Template

服务端非琐碎需求在编码前先形成轻量概要设计，并与 Tech Lead 沟通。文档目标是减少返工，不追求篇幅。

## 1. Objective
- 要解决什么问题。
- 用户/业务结果是什么。

## 2. Scope
- 本次包含什么。
- 明确不包含什么。

## 3. Existing Reuse
- 可直接复用的 Module / Service / Repository / Protocol / Config / Utility。
- 是否存在重复实现风险。

## 4. Proposed Design
- 涉及的当前项目 Module / Service / Repository / Runtime Component。
- 关键调用链与职责边界。
- 是否影响当前项目已定义的服务/数据域边界。

## 5. Data & Cache
- 当前项目持久化模型/表/字段/索引变化。
- 缓存 Key / TTL / 在线态策略变化。
- 一致性与失败恢复方式。

## 6. Protocol / API
- 新增/修改的当前项目 API / message / schema。
- 兼容性、幂等、超时与重试语义。

## 7. Risk
- 并发、一致性、安全、性能、迁移、兼容风险。
- 需要 Tech Lead 特别确认的点。

## 8. Test / Rollback
- 最小验证用例。
- 数据迁移或回滚方式（如适用）。

## Writing Rule
- 默认控制在能说明关键设计的最短篇幅。
- 小需求可删除不适用章节。
- 不复制已有 Architecture / API Spec；用引用代替重复描述。
