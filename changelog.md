# 更新日志

本文档根据 `main` 分支的 Git 提交历史整理。项目目前没有正式版本标签，因此按提交日期归纳功能、体验和工程结构的变化；括号内为对应的短提交哈希。

## 2026-09-16：工程化与目录重构

### 构建与部署

- 引入 Vanilla Vite 多页面构建流程，为首页、Still We Sail 和 Island Leap 配置独立入口；加入开发、构建、预览和部署命令，并固定 Vite、Wrangler 及 Node.js 版本要求。（`3778ca5`）
- 构建产物改为输出到 `dist/`，Cloudflare Wrangler 相应改为部署该目录；同时保留三张 Open Graph 图片的固定公开路径。（`3778ca5`）
- 将原 `public/` 下的首页、两个游戏目录和图片整体提升到项目根目录，并同步更新 Vite 与 README 中的路径。（`1513117`）

### 前端代码整理

- 将两个游戏的内联 JavaScript 分离为各自的 `game.js`，保持原有游戏逻辑不变。（`8118d4a`）
- 将两个游戏的内联 CSS 分离为各自的 `style.css`。（`11c0575`）
- 展开并统一 Island Leap 的 CSS 格式，同时整理文件结尾格式。（`0bbb78f`）

## 2026-09-15：界面修复

- 调整两个游戏顶部 HUD 的安全区、间距和分数位置，避免返回首页按钮与分数区域重叠，并改善横竖屏显示。（`bfdec1a`）

## 2026-09-09：项目说明与联系信息

- 在 README 中加入项目预览图片。（`c7c9047`）
- 将首页联系邮箱由 `paul@catholic.mt` 更新为 `paul@game.catholic.mt`。（`8d93eed`）

## 2026-09-08：音效、导航与持续关卡

- 为 Island Leap 加入起跳、落地、完美落点、落水和游戏结束等音效。（`6928ca0`）
- 分别为 Island Leap 和 Still We Sail 增加返回游戏首页的入口。（`d941d30`、`a8b3fb0`）
- 将两个游戏的返回按钮文案由 “GAMES” 统一为 “HOME”。（`c509b33`）
- 为 Island Leap 增加音效开关及相应的无障碍状态。（`74df481`；合并记录 `7efae21`）
- 重构 Island Leap 的平台生成逻辑，使关卡能够随着玩家前进持续生成，而非受固定平台数量限制。（`abf32b4`；合并记录 `ca6d84c`）

## 2026-09-07：项目创建与双游戏成形

### Still We Sail

- 创建仓库及基础 README。（`b91cb57`）
- 实现初版 Still We Sail：Canvas 像素画面、障碍物、跳跃、计分、本地最佳成绩和音效开关，并加入初始 Cloudflare Wrangler 配置。（`7bbfe52`）
- 加入站点 URL 与 Open Graph 分享图片元数据。（`1943f6a`）
- 完善手机横竖屏布局、安全区、旋转提示和触控交互，禁止游戏区域的默认触摸及长按行为。（`4326dac`）
- 加入 Google AdSense 站点标识。（`8a31de1`）

### Island Leap

- 新增 Island Leap，并将 Still We Sail 移至独立目录，形成双游戏结构；同时为两个游戏加入各自的分享图片。（`72a725b`）
- 改进 Island Leap 的移动端布局和全屏显示。（`58a502c`）
- 加入手机按住蓄力、松手跳跃的触控操作。（`0c40ac4`）
- 优化竖屏下的等距投影、镜头位置、HUD 和安全区适配。（`4167fe4`）
- 完成 Island Leap v4 重构，确立等距岛屿、蓄力跳跃、完美落点加分和本地最佳成绩等核心玩法。（`987e6ba`）

### 首页与项目配置

- 新建双游戏导航首页，以卡片形式展示 Still We Sail 和 Island Leap。（`bc81bdb`）
- 为新首页补回 Google AdSense 站点标识。（`c150049`）
- 加入 Phaser 依赖、锁文件及 `node_modules/` 忽略规则。（`53de8b8`）
- 重构首页视觉样式和响应式布局。（`c140cff`）
- 添加首页 Open Graph 图片，并将文件名统一为 `og-image.png`。（`cdd51ab`、`a999fb7`）
- 将站点标题从 “St. Paul Games” 更新为 “On Paul's way to Malta”。（`d2821ce`）
