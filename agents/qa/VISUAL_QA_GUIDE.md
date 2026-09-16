# Visual QA Guide

Visual QA 的目标不是用自动像素差异代替专业判断，而是让 UI/VFX 实现与已批准视觉产物之间有可重复、可追溯的技术证据。

## UI
1. 以用户已批准的 `UI_SPEC.md`、`COLOR_SYSTEM.md`、页面/组件效果图和 `project/ART_GUIDE.md` 为事实源。
2. 在当前项目批准的目标测试环境中固定 viewport/分辨率、DPR/缩放、语言、字体资源和测试数据，打开指定 UI Lab / 页面状态。
3. 对 normal / pressed / disabled / selected / loading / empty / error 等要求状态截取截图。
4. 对截图做基线叠加或差异图，用来发现位置、尺寸、颜色、缺失元素等偏差；允许为抗锯齿、字体渲染等建立合理容差或忽略区域。
5. 自动差异只负责“发现变化”，最终视觉是否接受仍以批准稿和 Art/UI Review 为准。

## VFX
1. 以已批准 `VFX_SPEC.md`、Art Direction 和参考效果为事实源。
2. 在当前项目批准的 VFX Lab / 测试环境中使用固定镜头、固定背景、固定角色/目标位置、固定触发条件；可控制时尽量固定随机种子。
3. 对关键时间点（例如触发、峰值、结束）截图，并保留短录屏用于检查时序、层级、遮挡、颜色和整体观感。
4. 粒子随机性较高时，不做严格逐像素判定；使用关键帧、包围范围、持续时间、主要颜色/层级和人工 Review 组合判断。

## Evidence
视觉测试证据随 QA Deliverable 保存，至少登记：
- Reference artifact/version
- Target environment / viewport / DPR or device profile
- Screenshot / video path
- Difference / finding
- Severity (P0/P1/P2)
- Review result

## Severity default
- 关键视觉状态/效果缺失或明显偏离已批准产品/视觉要求：建议 P1，待用户最终确认该边界。
- 字号、间距、大小、颜色、局部对齐等不影响功能和主体体验的细节：P2。
