# Artifact Contract

本项目的多 Agent 协作必须以固定产物为主要沟通媒介。聊天用于讨论、澄清和评审；长期有效事实、正式输入和验收证据必须落到文件/资产中。

## 1. 基本规则

1. Master 创建 Task 时必须按 Owner 角色列出 Required Artifacts；不能只写“完成设计/开发”。
2. 下游 Agent 只能把已提交、通过必要专业 Review 且获得用户明确批准（`USER_APPROVED`）的上游 Artifact 当作正式输入；聊天内容、Draft 或待审批版本不能替代正式产物。
3. Artifact 必须可追溯到 Task ID，默认路径：`deliverables/<role>/<TASK_ID>/...`。
4. 同一任务的图片、表格、代码、文档必须在 Deliverable 中登记路径；禁止只在聊天中描述“已经做完”。
5. 正式产物必须保留版本链；Product/Art/UI 等允许多轮 Draft/Revision，不得覆盖历史版本。只有用户批准的最终版本可以向 Tech Lead / Client / Server / QA 正式交付。
6. 正式产物变更后，下游受影响任务必须重新检查依赖；破坏性变化由 Master 创建 Change/Review，Producer 负责重新锁定受影响门禁。

## 2. 各角色固定产物

### Product Agent
游戏立项或大型版本开始时先交付产品总纲/模块树，使用 `agents/product/PRODUCT_OUTLINE_TEMPLATE.md` 或等价结构：
- 先划分游戏大模块，再拆子模块和具体功能。
- 每个正式功能 PRD 必须能追溯到所属大模块/子模块；新增模块时同步更新总纲与 PRD 索引。

非琐碎产品/功能任务至少交付：
- `PRD.md`：尽量详细描述目标、范围、所属模块/子模块、玩家流程、规则、状态、边界、数值/内容需求、异常情况、依赖和潜在返工风险。
- `ACCEPTANCE.md` 或 PRD 内独立 Acceptance 章节：可验证验收条件。
- 必要时 `FLOW.md` / 流程图说明：跨页面、跨系统或状态复杂时必须提供。
- 已 `USER_APPROVED` 的 PRD 在开发开始后变更时，必须先提交 `CHANGE_IMPACT.md`：列出受影响模块、Artifact、配置/协议、Client/Server/QA 范围、返工风险和需要重新审批的环节，再生成新 PRD 版本。
- 存在真实取舍时记录候选方案、收益/成本/风险和推荐结论；不存在关键取舍时直接记录最优推荐，不机械制造多方案。

Product 产物是 Art/UI/Tech/Client/Server/QA 的产品语义事实源。Product 对数值设计负责，初期可先形成简单模型，后续逐步细化；公共配置表结构仍由 Tech Lead 按 `project/config/README.md` 治理。

Product 承担外部研究任务时，必须将研究文档独立存入 `project/research/`，至少记录 Research Question、Scope、Sources、Findings、Analysis、Confidence、Product Implications、Open Questions 和 Recommendation。研究资料是决策依据而不是正式需求；只有被已批准 PRD / Decision 显式引用采用后才成为下游正式输入。版权/IP/合规类研究必须标明其为初步风险评估，高风险事项需要进一步专业确认。

### Art Agent
Art Agent 同时承担项目 Art Director / 视觉总监职责。涉及视觉资产时至少交付：
- 重大主体风格/视觉体系任务必须提交 `ART_DIRECTION.md`（使用 `agents/art/ART_DIRECTION_TEMPLATE.md` 或等价结构），明确设计目标、核心关键词、设计思路/理由、参考来源、长期一致性规则和允许变化范围。
- `ART_BRIEF.md`：风格、尺寸、视角、用途、平台限制、参考方向。
- `ASSET_MANIFEST.md`：资产 ID、名称、类型、尺寸/格式、状态、用途。
- 实际视觉图稿按类型分开归档，不把不同类别混为一张总图：
  - `characters/`：人物/角色设计图。
  - `scenes/`：场景设计图。
  - `props/`：道具/装备/物件设计图。
  - `icons/`：图标/物品图等。
- UI 出现新的主体视觉方向时，Art 先提供 UI 视觉原画/视觉概念；VFX 出现新的主体视觉语言时，Art 提供视觉方向/关键参考。
- 重要最终视觉产物必须在 `ART_DIRECTION.md` / `ART_BRIEF.md` / `DESIGN_RATIONALE.md` 中说明设计思路，而不是只给图片。
- 概念稿和可集成最终资产必须标注状态，不能互相冒充。
- 视觉参考、素材来源与版权/IP/外观风险记录独立维护在 `project/art_reference/`；参考资料不等同于最终生产资产。

### UI Agent
涉及 UI 时至少交付；视觉部分必须以用户批准的 Art Direction / `project/ART_GUIDE.md` 为基线，并先通过 Art Agent 的视觉一致性 Review：
- `UI_SPEC.md`：页面结构、布局、交互、状态、适配、组件关系、资源需求。
- `COLOR_SYSTEM.md`：主色/辅色/状态色/文本色及使用规则。
- `screens/`：关键页面效果图。
- `components/`：公共组件效果图及 normal/pressed/disabled/selected/loading 等必要状态。
- 重要交互必须在文档中说明，不允许只给静态图。

### VFX Agent
特效允许以轻量描述为主；视觉方向必须以用户批准的 Art Direction / `project/ART_GUIDE.md` 为基线，并先通过 Art Agent 的视觉一致性 Review，至少交付：
- `VFX_SPEC.md`：触发事件、时序、层级、位置、持续时间、表现描述、资源需求、性能等级和低端机降级建议。
- 如有参考图/序列帧/预览视频，登记在 Deliverable；非必要不强制制作重型演示。

### Tech Lead Agent
技术/跨模块任务至少交付相应产物：
- `TECH_DESIGN.md`：模块边界、依赖方向、公共能力、协议/数据影响、性能/安全/迁移风险。
- `REVIEW.md`：架构或 Code Review 结论、问题和 Review Action。
- 需要公共数据驱动时设计正式配置表及数据字典，见 `project/config/README.md`。

Tech Lead 负责公共配置的结构、字段类型、ID/引用、约束、校验和生成规范；Product 负责玩法含义、平衡目标和数值内容。不得由技术角色擅自决定玩法数值，也不得由产品角色随意破坏配置结构。

### Client Agent
非琐碎客户端任务至少交付：
- 编码前 `FEATURE_BRIEF.md`：使用 `agents/client/FEATURE_BRIEF_TEMPLATE.md`。
- 实现代码与必要测试。
- `IMPLEMENTATION_REPORT.md`：变更范围、复用点、验证结果、性能影响、已知风险。
- UI/VFX/资源相关功能必须说明性能验证与独立 Lab/调试入口（适用时）。

### Server Agent
非琐碎服务端任务至少交付：
- 编码前 `FEATURE_BRIEF.md`：使用 `agents/server/FEATURE_BRIEF_TEMPLATE.md`。
- 实现代码、Migration/Protocol 变更与必要测试。
- `IMPLEMENTATION_REPORT.md`：变更范围、数据/缓存/协议影响、验证结果、回滚/迁移说明、已知风险。

### QA Agent
正式功能按适用范围交付：
- 正式编码前先提交 `TEST_PLAN.md`，与相关 Client/Server `FEATURE_BRIEF.md` 组成开发开工包并一起通过用户审批；其中明确未来 Client、Server、Visual QA、目标平台/环境、证据要求和显式不测试项。
- `CLIENT_TEST_CASES.md`：客户端用例，必须可追溯到已批准 PRD/Acceptance；UI/VFX 相关用例同时引用批准视觉 Artifact。
- `SERVER_TEST_CASES.md`：Server 用例，覆盖任务涉及的协议/接口、业务规则、状态和必要持久化结果。
- Visual QA 证据：固定目标测试环境的截图、差异图、VFX 关键帧/短录屏和相应专业 Review 结论，遵守 `agents/qa/VISUAL_QA_GUIDE.md`。
- `TEST_REPORT.md`：执行结果、测试平台/环境、通过/失败/阻塞统计、P0/P1/P2 缺陷、明确未测试范围和质量结论。
- `bug_reports/`：每个正式缺陷包含复现步骤、期望/实际、环境、P0/P1/P2、证据和验证结果。
- 大批量测试用例可另外使用 `.xlsx`，但必须保留 Task/需求可追溯字段。
- 平台、网络/弱网、性能和广泛回归是否纳入测试由当前 Game Repository / Task 明确；QA 不得自行扩大范围，未测试项必须在 TEST_PLAN / TEST_REPORT 中明确。

### Master Agent
正式复合任务至少维护：
- Task Packets / dependency graph。
- 上游/下游 Artifact 依赖关系。
- 最终 `MASTER_SUMMARY.md` 或等价汇总：完成项、关键决策、未决风险、QA 结论。

### Producer / Workflow Controller Agent
流程控制至少维护：
- `project/WORKFLOW_STATUS.md`：所有任务线当前阶段、Owner、Artifact 版本、专业 Review、用户审批、阻塞和下一动作。
- `project/APPROVAL_LOG.md`：用户批准/退回/废弃的具体 Artifact 版本记录。
- 必要的流程异常报告：漏审批、错版本引用、依赖未满足、任务长期停滞。

## 3. Artifact Gate

典型依赖门禁：

`Product PRD -> Tech/UI/Art -> Tech Design/Config + Visual Specs -> Client/Server -> QA -> Master`

- Product Artifact 未获得用户批准：Art/UI/Tech/Client/Server/QA 不得把它作为正式需求输入。
- Art/UI Artifact 未获得用户批准：依赖对应视觉实现的 Client 任务不得进入正式视觉实现。
- Tech Design/Contract/Config 未获得用户批准：受影响 Client/Server 任务不得绕过它自创结构。
- Client/Server 实现与 Implementation Report 未通过专业/Tech Review 和用户确认：QA 不得进入最终正式验证。
- TEST_CASES/TEST_REPORT 缺失或 TEST_REPORT 未获用户确认：功能不得最终 DONE。
- 所有审批与版本规则见 `rules/approval_protocol.md`。

## 4. 文件格式原则

- 规则/规格/设计：优先 Markdown，便于版本控制和 Agent 阅读。
- 视觉稿：PNG/WebP/JPG 等可查看格式；源文件如存在可一并登记。
- 公共配置：`.xlsx` 为主要人工设计/维护格式，必须有数据字典和校验规则；运行时格式由工具生成，不手工维护多份事实源。
- 协议：`.proto` 是网络 Contract 事实源。
- 代码：通过正式仓库文件和测试作为实现证据。
