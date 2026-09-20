# Tech Lead 实现评审 v0.1 — 核心玩法领域层

- Task：`GAME-009-CLIENT-CORE-IMPLEMENTATION`
- 评审对象：`client/assets/game/`、`client/tests/core-gameplay.test.ts`、`IMPLEMENTATION_REPORT_v0.1.md`
- 结论：**PASS — 可进入用户审批；不等同于 Cocos 可玩版本完成**

## 1. 总体结论

当前实现符合已批准 Core Tech Design 的核心边界：玩法语义与引擎/表现隔离，接触回调不直接执行业务合成，合成配对稳定且防重复消费，危险线使用 post-merge 对象集合，暂停与计时依赖固定玩法步而非真实时间。

本轮完成的是**领域逻辑实现阶段**。由于仓库没有 Cocos Creator 工程骨架且当前机器未发现 Cocos Creator 环境，真实 Scene / Physics / HUD / VFX 接线尚未验证，因此不得把本评审结论解释为“首个可玩 Cocos 原型已经完成”。

## 2. 检查结果

| 检查项 | 结果 | 说明 |
|---|---|---|
| 模块职责 | PASS | Config / Spawn / Registry / Merge / Score / Danger / Session / Runtime / Adapter Contract 分离，没有巨大无边界 Manager。 |
| 产品语义一致性 | PASS | AC-01～AC-14 可由领域层验证的规则均有自动测试。 |
| 合成确定性 | PASS | Pair 去重 + 稳定排序 + `consumedThisStep`，不依赖 Physics callback 顺序。 |
| 三体/四体 | PASS | 三体只选一对；四体可选两个不重叠 Pair；结果下一固定步继续合成。 |
| Danger 时序 | PASS | `beginFixedStep -> 物理同步 merge -> post-merge danger query -> finishFixedStep`，满足救场优先。 |
| 实体位置 | PASS | 评审过程中发现并修复 Physics Body 当前坐标未回写 Registry 的风险；已有回归测试。 |
| 配置治理 | PASS | 批准数值集中在 GameplayConfig，包含校验；未把 Product 数值散落到业务逻辑。 |
| 时间/暂停 | PASS | 固定步时钟有追赶上限；暂停后不推进固定步、danger、drop lock。 |
| 平台边界 | PASS | 领域层无 `wx.*` / `tt.*` / `cc.*` 直接依赖；平台/输入/表现均为 Adapter Contract。 |
| Debug/QA | PASS WITH FOLLOW-UP | Seed、强制 Next、ID、Pair、timer 数据能力已具备；Collider/DangerLine overlay 需 Cocos 集成后实现。 |
| 自动测试 | PASS | 16/16 PASS。 |
| TypeScript 类型检查 | PASS | TypeScript 5.6.3 严格检查通过。 |
| Cocos 真实运行 | NOT TESTED | 当前不存在可用 Cocos Creator 工程/CLI/App，不伪造通过结论。 |

## 3. 代码健康 Review

- 没有发现 `TODO` / `FIXME` 遗留。
- 没有新增 `GameManager`、`CommonUtils` 等聚合所有职责的结构。
- `GameplaySession` 当前约 300 行，作为核心组合根仍可接受；后续 UI、Meta、资源、平台功能不得继续直接堆入该类。
- `GameplayRuntime` 负责领域与 PhysicsFacade 编排，职责清楚。
- 测试文件较长但按 Acceptance 顺序组织，目前便于需求追溯；后续 Cocos 集成测试应拆到独立文件，不继续扩大单一领域测试文件。

## 4. 本轮发现并已关闭的问题

### 问题：合成结果位置可能使用旧 Registry 坐标

风险：Physics Body 下落/滚动后，如果领域 Registry 没有同步当前物理位置，合成结果位置会错误地使用生成时坐标。

处理：`GameplayRuntime.fixedStep()` 在物理步后、合成结算前回读 Active Cat 的 `PhysicsFacade.getCatPosition()` 并更新 Registry。

验证：新增 PhysicsFacade Contract 测试，源 Body 位于 `(10,4)` 和 `(30,8)` 时，合成结果创建于 `(20,6)`；测试通过。

## 5. 必须保留的后续 Review Action

在 Cocos 集成阶段必须继续检查：
1. Contact Callback 只能收集 Pair，不直接 Destroy / Spawn / Score。
2. Cocos 物理世界同步 merge 后才能查询危险线。
3. Collider 与批准视觉轮廓不能产生明显公平性错觉。
4. 固定步/Physics API 的实际接线必须用锁定的 Cocos Creator 版本验证。
5. HUD 手势暂停/后台时必须取消旧 Pointer Gesture。
6. VFX 不得反向驱动领域状态。
7. Debug overlay 必须补齐 Collider / Danger Line / Exclusion Band 可视化后才能进入正式场景 QA。

## 6. Gate 判断

- 当前领域实现：**专业 Review PASS**。
- 可进入：`USER_REVIEW`。
- 不可进入：最终 QA / 功能 DONE。
- 用户批准本实现包后，下一阶段应进行 Cocos Creator 工程初始化与真实引擎集成；当前环境缺少 Cocos Creator 是该阶段的真实前置条件。