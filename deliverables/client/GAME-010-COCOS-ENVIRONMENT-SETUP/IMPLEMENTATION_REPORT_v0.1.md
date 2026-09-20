# Cocos Creator 3.8.8 工程集成实现报告 v0.1

- Task：`GAME-010-COCOS-ENVIRONMENT-SETUP`
- 当前状态：`USER_REVIEW`
- Owner：Client
- Creator：`3.8.8`
- 当前实际工程目录：`ai-demo/`
- 上游：GAME-009 客户端领域实现 v0.1（`USER_APPROVED`）

## 1. 本轮实际完成

本轮已从“纯 TypeScript 领域实现”推进到真实 Cocos Creator 3.8.8 工程集成：

- 用户已安装并成功首开 Creator 3.8.8，工程资源数据库生成正常。
- 实际 Creator 工程目录确认为 `ai-demo/`；原领域代码完整保留在 `ai-demo/assets/game/`。
- 创建 `assets/scenes/Gameplay.scene`，使用 Creator 3.8.8 合法 Scene 序列化格式和 Canvas/Camera。
- 创建 `GameplayBootstrap` 并合法挂载到 Gameplay Scene。
- 创建真实 `CocosPhysicsFacade`：
  - `PhysicsSystem2D.autoSimulation = false`；
  - 由批准的 `1/60s` 固定步手动 `step()`；
  - 动态猫咪使用 `RigidBody2D + CircleCollider2D`；
  - 地板/侧墙使用静态 `BoxCollider2D`；
  - Contact Callback 只维护接触 Pair，不直接执行业务合成。
- 真实接入 Current / Next、按住/拖动/松手投放、Pause、Restart。
- HUD 已运行时接线：Score、Next、危险提示、暂停、输入提示、Debug 信息。
- VFX 已运行时接线：合成轻弹、高光、加分反馈、危险线状态变化、Game Over 遮罩。
- Debug 已接线：危险线、投放排除带、step、Spawn State、危险计时、Active Cat 数量。
- 角色首版使用程序化 `Graphics` 生成圆润猫咪占位视觉，Collider 与视觉主体保持接近。
- Creator 引擎模块按 MVP 裁剪，仅保留主要 2D / Graphics / UI / Tween / Box2D / WebGL / Custom Pipeline 能力。
- 已完成 Web Desktop 构建。

## 2. 关键实现文件

```text
ai-demo/
├── assets/
│   ├── scenes/Gameplay.scene
│   └── game/
│       ├── core/                 # 已批准领域层
│       └── cocos/
│           ├── GameplayBootstrap.ts
│           └── CocosPhysicsFacade.ts
├── settings/v2/packages/engine.json
├── tests/core-gameplay.test.ts
├── tsconfig.core.json
└── build/web-desktop/            # Creator 构建产物，Git 忽略
```

## 3. 重要问题与修复

### 3.1 Scene 脚本 Class ID

第一次 Builder 校验发现 Scene 中自定义组件使用了完整 UUID，Creator Scene 实际要求压缩 Class ID。

已修正：
- Script UUID：`7e1c1b7a-6b0b-4f11-9d9d-27d64b93a221`
- Scene Class ID：`7e1c1t6awtPEZ2dJ9ZLk6Ih`

后续 Builder 已正常识别并输出：`Register GameplayBootstrap`。

### 3.2 Playfield 局部坐标与 Collider worldAABB

Tech Review 发现 Creator 标准 Canvas 存在世界坐标偏移，而危险线与投放排除带使用 Playfield 局部坐标。如果直接拿 `worldAABB` 与局部阈值比较，会导致危险线和投放解锁错误。

已修复为：
- 将危险线局部 Y 转换为 Playfield 世界 Y 后再与 Collider `worldAABB` 比较；
- 投放排除带同样转换到世界坐标。

### 3.3 同帧多固定步下的幽灵碰撞

`Node.destroy()` 是延迟销毁。当前 GameplayClock 单渲染帧最多可追赶 4 个固定步，如果仅调用 destroy，已合成猫可能在后续同帧物理步仍产生碰撞响应。

已修复：移除猫时立即：
1. `collider.enabled = false`；
2. `body.enabled = false`；
3. `node.active = false`；
4. 再调用 `destroy()`。

## 4. 自动验证

### 4.1 领域层

- TypeScript strict 检查：**PASS**。
- 核心玩法自动测试：**16 / 16 PASS**。

领域测试继续独立使用 `ai-demo/tsconfig.core.json`，避免 Creator 自带引擎声明文件影响纯领域验证。

### 4.2 Creator 项目脚本 / Scene

Builder 结果：
- `Gameplay.scene` 被识别为唯一构建场景；
- `GameplayBootstrap` 正常注册；
- `CocosPhysicsFacade` 正常进入 bundle；
- 最新构建日志没有 `Missing class`、脚本解析失败或模块解析失败。

### 4.3 Web Desktop 构建

首次裁剪后引擎构建：
- `build Task (web-desktop) Finished in (4 min 1 s)`。

后续缓存命中后的最终增量构建：
- `build Task (web-desktop) Finished in (20 s)`。

最终构建产物已确认存在：
- `index.html`
- `application.js`
- `index.js`
- `cocos-js/cc.js`
- `src/settings.json`
- `assets/main/config.json`
- `assets/main/index.js`

Creator CLI 壳层最终返回码为 `36`，但 Builder 日志明确完成构建且全部最终产物存在。因此验收依据采用 Builder Task 与产物，不把 Electron/CLI 壳层返回码单独解释为项目构建失败。

## 5. Web 启动烟测

通过本地 HTTP 服务使用 Chrome 无头模式访问构建：
- `/`、`style.css`、`polyfills.bundle.js`、`system.bundle.js`、`import-map.json`、`application.js`、`cc.js`、`settings.json` 均返回 HTTP 200；
- DOM 创建了 `GameCanvas`；
- 没有发现项目脚本加载路径 404。

限制：当前 macOS 无头 Chrome 环境初始化 GPU 时出现 GL / `CVDisplayLink` 环境错误，因此无头环境不能替代真实 GPU 的最终玩法画面与手感确认。该限制属于自动视觉验证环境，而不是 Creator Builder 或项目脚本失败。

## 6. 当前运行时表现

当前是可运行集成原型，不是最终生产视觉：
- 猫咪用程序化 Graphics 画圆润主体、耳朵、简单脸部；
- Current / Next 有颜色预览；
- Score / Danger / Pause 已接入；
- 合成有轻量缩放、高光和 `+分数`；
- 危险线 SAFE/WARNING 有状态色变化；
- Game Over 有遮罩并支持点击重开；
- 投放排除带作为 Debug 虚线显示。

这符合本阶段“先证明真实引擎链路”的目标；正式角色 Sprite、精细 HUD 资源、完整视觉节奏仍属于后续视觉生产和打磨。

## 7. 当前未完成 / 不声明完成

- 微信小游戏构建与真机验证。
- 抖音小游戏构建与真机验证。
- 正式生产级角色 Sprite / Atlas。
- 最终 UI 资源与字体细节。
- 完整 VFX 粒子资产、危险线呼吸细节和性能档位。
- 正式 QA 全量用例执行与 TEST_REPORT。
- 真机性能专项。

## 8. 用户审批重点

本轮请重点确认：
1. 当前 Cocos Creator 3.8.8 工程与 Web 构建链是否接受作为正式客户端工程基线；
2. Gameplay Scene 的基础布局是否可继续作为 MVP 原型；
3. 投放/物理/合成/HUD/VFX 的真实引擎接线方向是否批准进入正式 QA 与后续视觉资产替换。

人工体验检查见：`RUNTIME_SMOKE_CHECKLIST_v0.1.md`。
