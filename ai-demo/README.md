# Cocos Creator 客户端工程

## 引擎版本

- Cocos Creator：`3.8.8`
- 实际工程目录：`ai-demo/`
- 版本文件：`COCOS_VERSION`
- 默认使用 Creator 3.8.8 内置引擎；只有确有引擎源码修改需求时才切换到官方 `cocos-engine` tag `3.8.8`。

## 当前实现状态

本工程已经从纯 TypeScript 领域层推进到真实 Cocos Creator 3.8.8 运行时集成。

### 领域层

`assets/game/core/` 已实现：
- Current / Next 与 L1–L3 随机投放；
- 水平瞄准、0.25 秒 + 排除带双条件投放锁；
- L1–L10 稳定合成、防重复消费与连续合成；
- 分数、最高等级、Danger 2 秒、Game Over；
- Pause / Restart / 固定步；
- DebugHarness。

### Cocos 集成层

`assets/game/cocos/`：
- `GameplayBootstrap.ts`：Gameplay Scene 启动、输入、HUD、基础 VFX、Debug、暂停/重开。
- `CocosPhysicsFacade.ts`：Creator 3.8.8 Physics2D 真实适配，使用 `RigidBody2D / CircleCollider2D / BoxCollider2D`。

场景：
- `assets/scenes/Gameplay.scene`

物理采用：
- `PhysicsSystem2D.autoSimulation = false`
- 固定 `1/60s` 手动 step
- Box2D 2D Physics

## Web Desktop 构建

Creator Builder 已验证成功。

最终增量构建耗时约 20 秒，输出目录：

```text
build/web-desktop/
```

必要输出包括：
- `index.html`
- `application.js`
- `index.js`
- `cocos-js/cc.js`
- `src/settings.json`
- `assets/main/config.json`
- `assets/main/index.js`

## 自动验证

领域层严格类型检查：

```bash
node /Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/app.asar.unpacked/node_modules/typescript/bin/tsc -p tsconfig.core.json --noEmit
```

核心规则自动测试：

```bash
npx --yes tsx@4.19.2 --test tests/core-gameplay.test.ts
```

当前结果：`16/16 PASS`。

## 当前视觉边界

现在是可运行 MVP 集成原型：猫咪、HUD 和特效主要使用程序化 `Graphics / Label / Tween`，用于证明真实玩法/物理/界面链路。

正式角色 Sprite、精细 HUD 资源、完整 VFX 资产仍需要后续视觉生产与替换，不应把当前占位表现视为最终美术。
