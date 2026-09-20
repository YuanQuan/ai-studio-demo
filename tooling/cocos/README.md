# Cocos Creator 3.8.8 工程环境

## 固定版本

- Cocos Creator：`3.8.8`
- Cocos Engine 官方仓库：`https://github.com/cocos/cocos-engine.git`
- Engine tag：`3.8.8`
- Engine commit：`411f98df047c25902f93440d4b22925c2fb65461`
- 原生 external（仅未来原生平台自定义引擎需要）：`cocos-engine-external v3.8.8-2`

当前项目和 `standard-mini-game` 新游戏模板都固定到 3.8.8。升级必须单独做兼容性影响评审并形成项目决策。

## 默认策略：使用 Creator 3.8.8 内置引擎

本项目默认不要求把完整 Cocos Engine 源码提交进游戏仓库。安装 Cocos Creator 3.8.8 后，优先使用它自带的同版本引擎即可。

这样做的好处：
- 避免每个游戏仓库重复保存大体积引擎源码；
- 避免游戏代码与引擎 Git 历史混在一起；
- 版本仍由 `client/COCOS_VERSION`、`STUDIO.md`、`project/ARCHITECTURE.md` 明确锁定；
- 只有确实需要修改引擎内部实现时才切换到自定义引擎。

## 可选：拉取官方 3.8.8 自定义引擎源码

项目提供：

`tooling/cocos/bootstrap-cocos-engine.sh`

运行：

```bash
bash tooling/cocos/bootstrap-cocos-engine.sh
```

默认拉到：

`.cocos/engine/3.8.8/cocos-engine`

该目录是可重建的本地工具依赖，已设计为不进入项目版本库。

如确实需要安装自定义引擎 npm 依赖：

```bash
INSTALL_ENGINE_DEPS=1 bash tooling/cocos/bootstrap-cocos-engine.sh
```

Cocos Engine 3.8.8 的 `package.json` 要求 Node.js `>=18.0.0`。当前开发机已检测到 Node.js 20.6.0，满足该要求。

## Creator 编辑器仍是必需条件

仅拉取 `cocos-engine` 源码不能替代 Cocos Creator 编辑器。要真正完成本项目的 Cocos 工程初始化、Scene/Prefab/Physics 接线和 Web 构建，需要：

1. 安装 Cocos Dashboard；
2. 通过 Dashboard 安装 Cocos Creator 3.8.8；
3. 用 3.8.8 创建/打开 `client/` 的 Creator 工程；
4. 默认使用内置引擎；如果后续确需自定义引擎，在 Creator 的引擎管理器中指向 `.cocos/engine/3.8.8/cocos-engine`；
5. 建立 Gameplay Scene、Prefab、Collider 和 Physics2D 接线；
6. 执行 Local Web 构建并按 QA Test Plan 验证。

## 当前环境状态

当前开发机尚未发现 Cocos Dashboard / Cocos Creator 3.8.8 App，因此：
- TypeScript 核心领域逻辑可以继续开发和自动测试；
- Creator Scene / Prefab / Physics / HUD / VFX 真实集成和 Web 构建当前不能被可靠验证；
- 不应通过编写未经 Creator 实际加载验证的 `cc.*` 代码冒充完成工程部署。
