# UI 规格基线

## 状态
- 当前批准版本：`GAME-005-UI-HUD-SPEC` / v0.1 / `USER_APPROVED`
- 正式 Artifact：`deliverables/ui/GAME-005-UI-HUD-SPEC/UI_SPEC_v0.1.md`
- 视觉概念：
  - `deliverables/ui/GAME-005-UI-HUD-SPEC/screens/GAMEPLAY_HUD_v0.1.svg`
  - `deliverables/ui/GAME-005-UI-HUD-SPEC/components/HUD_COMPONENT_STATES_v0.1.svg`

## 核心玩法页面
MVP 当前只锁定 `GameplayScreen`：顶部安全区、Next/Score/Pause HUD、Current 投放区、物理棋盘、底部安全留白。

## 输入基线
- 推荐并已批准：**按住 / 拖动水平瞄准 / 松手释放**。
- Local Web 使用鼠标按下、移动、松开保持同一语义。
- UI 按钮区域优先拦截，不触发投放。
- `AIMING + RUNNING` 才允许开始投放；`DROP_LOCKED`、暂停、`GAME_OVER` 禁止释放。
- 进入后台或暂停时必须取消当前 Pointer Gesture，避免恢复后误释放。

## HUD 基线
- Next：左上。
- Score：顶部居中，优先大数字可读性。
- Pause：右上。
- 危险线：位置由核心玩法配置 `dangerLineRatio=0.82` 决定，UI 只负责表现。
- SAFE：低对比可见；WARNING：珊瑚红 + 呼吸 + 非纯颜色提示。
- HUD 不覆盖棋盘中央堆叠区域。

## 适配
- 设计基准：9:16。
- 顶部 HUD 遵守平台安全区 Insets。
- 更高长宽比设备增加上下留白，不拉伸核心棋盘逻辑比例。
- 棋盘 playable bounds 由 Client/Tech 提供，UI 围绕其排版。

## 视觉
UI 必须遵循 `project/ART_GUIDE.md`：圆角、浅底深字、大留白、低装饰密度；危险红仅用于警告/失败语义。

## 变更规则
本文件只索引当前批准 UI 基线。若交互、信息层级、安全区规则或关键组件状态发生实质变化，必须产生新的 UI Artifact 版本并重新审批。