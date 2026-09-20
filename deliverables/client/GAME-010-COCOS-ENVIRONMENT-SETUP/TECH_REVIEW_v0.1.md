# Tech Lead Review v0.1 — Cocos Creator 3.8.8 真实工程集成

- Task：`GAME-010-COCOS-ENVIRONMENT-SETUP`
- Review 对象：Creator 工程、Physics2D / Gameplay / HUD / VFX 接线、Web Desktop 构建
- 结论：**PASS WITH MANUAL RUNTIME CHECK**

## 1. 评审结论

当前实现已经满足从纯领域层进入真实 Cocos Creator 3.8.8 工程的技术条件：
- Creator 版本明确锁定为 3.8.8；
- Gameplay Scene 与自定义 Component 可被 Builder 正常识别；
- Physics2D 使用手动固定步，与批准的 `1/60s` 技术设计一致；
- Contact Callback 不直接修改领域状态；
- HUD / VFX 通过表现层消费状态和事件；
- Web Desktop Builder 已完成并产出完整启动文件；
- 核心领域自动测试仍保持 16/16 PASS。

未发现需要阻止进入用户评审的架构问题。

## 2. 本轮发现并已修复的问题

### Scene Class ID
第一次 Scene 使用完整 UUID 作为自定义组件类型，Creator 报 `Missing class`。已按 3.8.8 Class ID 压缩格式修复，后续 Builder 正常注册 `GameplayBootstrap`。

### 世界/局部坐标混用
`worldAABB` 与局部危险线阈值不能直接比较。已在 PhysicsFacade 中转换为同一世界坐标系。

### 延迟 destroy 的幽灵碰撞
在一个渲染帧连续执行多个固定步时，仅调用 `Node.destroy()` 可能让旧物理体残留到后续 step。已在 destroy 前立即禁用 Collider / RigidBody / Node。

## 3. 架构检查

| 检查项 | 结论 | 说明 |
|---|---|---|
| Creator 版本 | PASS | 固定 3.8.8，与 Studio / 当前项目基线一致 |
| Domain 与 Cocos 隔离 | PASS | 领域层继续不直接引用 `cc.*` |
| Physics 回调边界 | PASS | 回调只维护接触 Pair |
| 固定步 | PASS | `autoSimulation=false`，手动 1/60 step |
| 合成后危险判定 | PASS | 继续保持 post-merge danger 顺序 |
| 生命周期 | PASS | 合成移除对象立即停用物理组件 |
| HUD 输入边界 | PASS | UI 只提交瞄准/释放/暂停意图 |
| VFX 业务隔离 | PASS | 特效不改变玩法状态 |
| 模块体积 | PASS | 已裁剪未使用 Creator 模块 |
| Web 构建 | PASS | 最终增量构建 20 秒完成，必要文件齐全 |
| 无头视觉烟测 | PARTIAL | HTTP/脚本加载通过；无头 GPU 环境不能替代真实显示器体验 |

## 4. 非阻塞风险

1. 当前视觉为程序化原型，不是最终 Art 生产资产。
2. Physics 参数还需要真实手感调优，特别是弹性、摩擦、阻尼与不同等级堆叠稳定性。
3. 无头 Chrome 因 macOS GPU / DisplayLink 限制无法完成真实视觉交互验收；应在 Creator 正常预览窗口做一次人工冒烟。
4. 微信/抖音平台构建不属于本阶段已验证范围。
5. 后续正式 QA 前应补充更完整的可视 Collider Overlay、固定 Seed 操作入口和可重复场景控制。

## 5. 下一 Gate

建议当前包进入 `USER_REVIEW`。

用户确认本版本后：
- `GAME-010` 可进入 DONE；
- 创建正式 QA 执行任务，按已批准 `TEST_PLAN` 生成/执行 `CLIENT_TEST_CASES`；
- 并行或随后进入正式美术 Sprite / UI / VFX 生产资产替换与视觉 QA。

用户审批前，不把当前构建视为最终质量完成版本。
