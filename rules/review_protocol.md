# Review Protocol

## 目的
Review 用来确认交付物是否满足任务和项目契约，不是让 Reviewer 重新做一遍 Owner 的工作。专业 Review 通过只表示“可以提交给用户确认”，不等于下游可以自动开始。

## Reviewer 检查项
- 是否满足 Task objective。
- 是否逐条覆盖 Acceptance Criteria。
- 是否违反共享项目事实或已有决策。
- 是否引入未授权范围、依赖或破坏性变更。
- 是否留下需要 QA 或集成特别关注的风险。
- 是否提交了 `rules/artifact_contract.md` 要求的固定产物，并登记了可追溯路径。
- 上游规格、图稿、配置表、技术设计和测试用例之间是否语义一致；禁止用聊天说明代替缺失 Artifact。
- 公共配置表是否遵守 `project/config/README.md` 的结构、数据字典、引用和职责分工。

## Client / Server Code Review
正式客户端或服务端代码交付默认包含 Tech Lead 的代码健康 Review。除功能正确性外，还必须检查：
- 是否出现职责过大的模块、Manager、工具类或配置集合。
- 是否存在重复组件、重复方法、重复配置、重复协议模型或基础能力。
- 是否存在循环依赖、跨层调用或不合理的 package 依赖。
- 多模块真实复用的能力是否应该抽离到合适的公共层。
- 是否把公共能力无边界地堆入 `common` / `utils` / `shared`。
- 是否存在为单次需求提前做的过度抽象。

发现影响长期维护性的上述问题时，Tech Lead 可以返回 `CHANGES_REQUESTED`，并给 Client / Server Agent 明确的 Review Action。

## UI / VFX Visual Direction Review
UI / VFX 的视觉产物在进入 `USER_REVIEW` 前，默认必须经过 Art Agent 的视觉方向 Review：
- 是否遵守用户已批准的 `project/ART_GUIDE.md` / `ART_DIRECTION.md`。
- 色彩、材质、形状、装饰、角色/场景/UI/VFX 语言是否出现长期风格漂移。
- 是否误用了未确认参考或存在明显版权/IP/外观相似风险。
- UI Review 只评视觉方向，不替代 UI Agent 的布局、信息层级和交互职责。
- VFX Review 只评视觉方向，不替代 VFX Agent 的触发、时序、性能和实现职责。
- 若确需偏离主体 Art Direction，必须显式说明理由并重新走用户审批，不能以局部需求静默改变全局风格。

## 结论
- `APPROVED`：专业 Review 通过，可以由 Producer 推进到 `USER_REVIEW`；只有用户批准后才解锁下游。
- `CHANGES_REQUESTED`：必须返工，并列出明确问题。
- `BLOCKED`：缺少外部决策或依赖，Owner 无法自行解决。

## 规则
- Review 结论必须符合 `schemas/review.schema.json`。
- Reviewer 不得为了快速通过而静默修改 Owner 的核心交付物。
- 所有正式功能迭代的专业阶段产物在 Review 通过后仍必须进入用户审批；Producer 负责记录具体版本。
- 跨专业争议交给 Master；用户对 Artifact 的批准/退回拥有最终流程门禁权。
