# 资产清单 v0.1 — 美术方向概念稿

- 任务：`GAME-003-ART-DIRECTION`
- 包状态：`CONCEPT / USER_APPROVAL_REQUIRED`
- 下列资产均为概念稿，不是可直接投入运行时的最终生产资产。

| 资产 ID | 名称 | 类型 | 路径 | 概念尺寸 | 状态 | 用途 |
|---|---|---|---|---:|---|---|
| ART-CAT-TIERS-001 | 10 级猫咪体系概念 | 角色概念对照板 | `characters/CAT_TIER_SYSTEM_CONCEPT_v0.1.svg` | 1600×900 | CONCEPT | 审查 L1–L10 等级层次、轮廓、配色和装饰预算 |
| ART-SCENE-001 | 棋盘氛围概念 | 场景 / 棋盘概念 | `scenes/PLAYFIELD_MOOD_v0.1.svg` | 720×1280 | CONCEPT | 审查竖屏构图、软垫盒语言、背景信息密度和危险线层级 |
| ART-UI-001 | HUD 视觉方向 | UI 视觉概念 | `ui_concept/HUD_VISUAL_DIRECTION_v0.1.svg` | 720×1280 | CONCEPT | 审查 HUD 卡片语言、分数 / Next 层级和危险状态表现 |

## 批准后的后续生产候选

以下内容**尚未创建**，不得在任何报告中描述为现有资产：

| 候选 ID | 类别 | 预期输出 | 启动条件 |
|---|---|---|---|
| CAT-L01 … CAT-L10 | 角色运行时 Sprite | 透明 Sprite / Atlas 可用导出 | Art Direction + Tech 碰撞约束 + 用户批准后 |
| SCENE-BG-001 | 场景 | 运行时背景 | UI 安全区 / 布局对齐后 |
| SCENE-BOX-001 | 场景 / 道具 | 运行时玩法容器框与墙体 | Tech 锁定棋盘尺寸后 |
| UI-HUD-* | UI | 运行时 HUD 组件 | UI Spec 获批后 |
| VFX-MERGE-* | VFX | 运行时合成表现 | VFX Spec 获批后 |
| VFX-DANGER-* | VFX | 运行时危险警告表现 | VFX Spec 获批后 |

## 命名与来源规则

- 最终资产即使展示名称发生变化，也应保留稳定的语义 ID。
- 概念 SVG 作为历史评审 Artifact 保留，不得被生产导出文件覆盖。
- 最终运行时文件必须记录来源和状态，并作为新的 Manifest 条目登记。
- 后续若引入外部来源素材，必须单独记录在 `project/art_reference/`，不得在没有来源与授权记录的情况下静默变成最终生产资产。
