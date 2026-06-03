# moji — 墨迹手绘风格信息图生成器

将文字内容转化为墨迹手绘风格的信息插图（PNG）。16:9 画幅，纯白背景，黑色手绘线条，墨迹 IP 角色参与核心动作，稀疏中文标注。

作者：非著名程序员

## 触发方式

用户发送"墨迹图"或"墨迹插图"加上要图解的文字内容。

## 输入

用户可以提供：
- 直接粘贴的文字内容
- URL（会自动抓取）
- 文件路径

## 执行流程

### Step 1：读取参考文件

按顺序读取以下文件：

1. `~/.claude/skills/moji/references/style-dna.md` — 风格 DNA（视觉规范）
2. `~/.claude/skills/moji/references/moji-ip.md` — 墨迹 IP 规范
3. `~/.claude/skills/moji/references/composition-patterns.md` — 构图模式库
4. `~/.claude/skills/moji/references/qa-checklist.md` — 自检清单

### Step 2：消化内容，选择构图

1. 理解用户内容的核心结构
2. 从 composition-patterns.md 中选择最合适的构图类型
3. 为每个核心概念发明一个**全新隐喻**（禁止复用示例）
4. 设计墨迹在场景中的动作（必须是核心动作的执行者，不是吉祥物）

### Step 3：生成 HTML

用 HTML + CSS + SVG 绘制信息图。使用以下技术手段模拟手绘风格：

**画布**：
- 16:9 比例，宽度 2560px，高度 1440px（SVG viewBox 为 1280x720，通过缩放实现 2K 高清）
- 纯白背景 `#FFFFFF`
- 无圆角，无阴影，无渐变背景

**线条风格**：
- SVG 路径使用 `stroke-linecap="round"` `stroke-linejoin="round"`
- 线条粗细 2-3px，主结构线可加粗至 4px
- 路径节点加入微小偏移模拟手绘抖动
- 箭头用 SVG 手绘三角形

**色彩规范**：
- 黑色 `#1a1a1a`：主体结构线、文字
- 橙色 `#E8613C`：主流程、箭头、关键流动
- 红色 `#C0392B`：警告、问题、关键结果
- 蓝色 `#3D7EA6`（可选）：次要注释

**墨迹 IP（SVG 绘制）**：
- 黑色实心不规则椭圆身体
- 两个白色小圆点眼睛（无表情）
- 两条细线腿
- 在场景中执行核心动作（搬运、拉扯、按压、被卡住等）

**中文标注**：
- 5-8 个标注，每个 2-8 字
- 用手写风格的中文字体（`font-family: 'Noto Serif SC', serif`）
- 小字号 14-18px
- 放在结构旁边，用细线连接

**留白**：
- 主体占比 40-60%
- 留白 ≥35%
- 四周留出足够边距

将完成的 HTML 写入 `/tmp/moji_{name}.html`，其中 `{name}` 是核心概念（中文，无标点，≤15 字）。

### Step 4：自检

按 qa-checklist.md 逐项检查。不通过则修改后重新检查。

核心检查项：
- [ ] 16:9 比例
- [ ] 纯白干净背景
- [ ] 墨迹在场且执行核心动作
- [ ] 全新隐喻（非复用示例）
- [ ] 荒诞/有趣/有创意
- [ ] 主体 < 60%
- [ ] 只表达一个核心结构
- [ ] 中文标注短且可读
- [ ] 颜色使用正确（黑/橙/红/蓝）
- [ ] 无左上角标题、无 PPT 感、无可爱吉祥物

### Step 5：截图生成 PNG

```bash
node ~/.claude/skills/moji/assets/capture.js /tmp/moji_{name}.html ~/Downloads/moji_{name}.png 2560 1440 viewport
```

注意：使用 `viewport` 模式（不是 fullpage），因为画布固定为 2560×1440。HTML 中 SVG 设置 `width="2560" height="1440" viewBox="0 0 1280 720"`，通过 viewBox 缩放实现高清。

截图完成后告诉用户文件路径。

### Step 6：展示结果

用 Read 工具读取生成的 PNG 文件，展示给用户看效果。

## 依赖

- Playwright（Chromium）— 内置 `assets/capture.js` 截图
- Google Fonts（Noto Serif SC）

首次使用需安装依赖：
```bash
cd ~/.claude/skills/moji && npm install && npx playwright install chromium
```
