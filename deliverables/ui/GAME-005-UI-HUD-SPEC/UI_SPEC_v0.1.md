# 核心玩法 UI 规格 v0.1

- Task：`GAME-005-UI-HUD-SPEC`
- 状态：`USER_APPROVED`
- Owner：UI
- 正式上游：Core Gameplay PRD v0.1、Art Direction v0.1、Core Tech Design v0.1（均 `USER_APPROVED`）

## 1. 目标

把已批准的核心玩法语义落成竖屏单手可操作的 HUD 与交互规格。UI 必须优先保证：玩家能看清当前分数、Next、投放位置、危险状态和猫咪堆叠，不让界面装饰遮挡物理玩法。

## 2. 核心页面

MVP 核心玩法阶段只定义一个主要页面：`GameplayScreen`。

页面从上到下分为：
1. 系统安全区。
2. 顶部 HUD 带：Next、Score、暂停。
3. Current 投放/瞄准区。
4. 物理棋盘主区域。
5. 底部视觉留白/设备安全区。

不在本任务中设计首页、结算页的最终页面结构；Game Over 只规定当前玩法页如何冻结和把结果交给后续结算流程。

## 3. 信息层级

优先级从高到低：
1. 猫咪实体与落点判断。
2. 危险线及 WARNING 状态。
3. 当前分数。
4. Current 的位置与可释放状态。
5. Next 预告。
6. 暂停入口。

任何 HUD 组件不得覆盖棋盘中央主要堆叠区域。

## 4. 参考布局

以 720×1280 仅作为设计坐标参考，实际实现必须响应式适配。

### 4.1 顶部 HUD
- Next 卡片：左上，约占屏宽 18%–22%。
- Score：顶部居中，使用大数字，不使用重装饰容器。
- Pause：右上，最小可点击尺寸按移动端常规安全尺寸实现，不小于视觉图标本体的交互热区。
- 顶部 HUD 必须位于平台安全区以下，不能与刘海/状态区域重叠。

### 4.2 投放区
- Current 位于棋盘顶部的固定投放高度。
- HUD 与 Current 投放区视觉分离；Next 卡不得侵入 Current 的水平可移动范围。
- Current 在 `AIMING` 时显示轻微向下投放指示线/落点参考，不画贯穿全棋盘的高对比激光线。
- `DROP_LOCKED` 时 Current/Next 队列仍可显示，但释放输入禁用，并用轻微透明度/小锁定反馈表示等待。

### 4.3 棋盘与危险线
- 棋盘为页面视觉主体，左右保持稳定边界。
- 危险线位置由 Tech 根据批准 `dangerLineRatio=0.82` 映射到棋盘，不由 UI 自行调整玩法位置。
- SAFE：危险线低对比显示，保持可见但不报警。
- WARNING：危险线转为珊瑚红并轻微呼吸；可出现简短“危险”小布签，不遮挡猫咪。
- 恢复 SAFE 后立即移除报警强化表现。

## 5. 输入与交互

### 5.1 推荐手势：按住 / 拖动 / 松手释放

移动端：
1. 玩家在棋盘投放控制区域按下手指。
2. Current 的水平目标移动到指针对应 `aimX`（经过合法边界 Clamp）。
3. 手指水平拖动时 Current 持续跟随。
4. 松手时执行 Release。

Local Web：鼠标按下、水平移动、松开使用相同语义。

选择该方案的理由：
- 单手一步完成定位与释放。
- 不需要“点一次定位、再点一次确认”的二次操作。
- 与 PRD 的“水平瞄准 + 释放”完全一致，不增加玩法规则。

### 5.2 输入区域
- 按下可以从棋盘宽度范围内开始，不要求精确点中 Current。
- UI 按钮区域（Pause 等）优先拦截，不触发投放手势。
- Pointer 在按下后移出棋盘横向范围时，`aimX` Clamp 到合法边界；松手仍可释放。
- 应用进入后台/暂停时取消当前 Pointer Gesture，不允许恢复后因旧触摸状态误释放。

### 5.3 状态规则
- `AIMING + RUNNING`：允许开始投放手势。
- `DROP_LOCKED`：不允许 Release，新输入不产生猫咪。
- 暂停：输入全部冻结。
- `GAME_OVER`：投放输入禁用，只保留后续结算流程接管。

## 6. 组件规格

### NextCard
状态：
- `normal`：显示“下一只” + 猫咪预览。
- `updating`：队列切换时允许 100–160ms 轻缩放/淡入。
- 不设计 disabled；即使 DROP_LOCKED 仍可预告 Next。

### ScoreDisplay
- 只展示当前整数分数。
- 合成后数字可做 100–180ms 轻弹性放大后回落。
- 不显示 Combo 倍率。

### PauseButton
状态：`normal / pressed / disabled`。
- `pressed`：轻微缩小至约 94%–96%。
- `disabled`：Game Over 交接后按后续页面策略处理。

### DangerLine
状态：`safe / warning`。
- safe：低对比虚线。
- warning：珊瑚红、轻呼吸，可带小布签。
- 禁止闪烁频率过高或全屏红闪。

### AimGuide
状态：`hidden / aiming / locked`。
- aiming：低对比短导向线或落点阴影。
- locked：隐藏或弱化，不暗示此时还能投放。

## 7. 视觉层级与遮挡规则

- HUD 永远在棋盘框体上方，但危险线必须位于猫咪可见层之上、VFX 大粒子之下或按效果需要受控切换。
- AimGuide 位于 Current 下方、Active Cat 后方，避免遮住猫咪表情与接触边缘。
- 合成 VFX 可以短时盖住合成点，但不得遮挡相邻猫咪超过短促时长。
- WARNING 状态不改变 Score / Next 的基本可读性。

## 8. 适配与安全区

- 设计基准：9:16。
- 允许更高长宽比设备增加顶部/底部留白，不拉伸棋盘逻辑比例。
- 顶部 HUD 使用安全区 Insets；刘海/挖孔只影响 HUD 布局，不改变物理棋盘的玩法归一化坐标。
- 横向窄屏优先缩小 HUD 间距和卡片装饰，不缩小核心数字到不可读。
- 棋盘左右边界由 Tech/Client 提供，UI 只围绕正式 playable bounds 排版。

## 9. 可访问性与可读性

- 危险状态不能只靠颜色：同时通过虚线强化、布签/呼吸节奏表达。
- Score 保持明显数字对比。
- Next 的等级差异依赖已批准猫咪轮廓/花纹，不额外使用仅颜色编码。
- 不使用快速全屏闪烁。

## 10. 对 Client 的交接语义

UI 只发出意图：
- `AimPointerBegin(x)`
- `AimPointerMove(x)`
- `AimPointerRelease(x)`
- `PauseRequested`

UI 消费核心状态/事件：Current、Next、Score、SpawnState、DangerState、DangerProgress、GameOver。

UI 不自行生成猫咪、不自行计分、不自行推进危险计时。

## 11. 当前不做
- 首页/结算页最终设计。
- 排行、分享、货币、任务、图鉴 UI。
- 商业化入口。
- 横屏模式。
- 微信/抖音平台专属按钮（除非后续平台任务要求）。

## 12. 用户审批后
批准本版本后：
- `project/UI_SPEC.md` 更新为正式 UI 基线。
- Client 可把本 UI Spec 作为正式输入实现 HUD 和 AimInputAdapter。
- QA 可建立固定视口截图点和组件状态用例。
