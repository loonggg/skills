---
name: ink-card
description: 多风格信息长图生成器。支持四种风格：墨图（黑白漫画）、活力图（暖调深海蓝+珊瑚橘）、赤图（黑红）、杂志图（杂志排版）。当用户说"墨图"、"活力图"、"赤图"、"杂志图"、"ink-card"或需要生成信息长图时触发此 skill。
version: "1.0.0"
user_invocable: true
---

# ink-card — 多风格信息长图生成器

将文字内容转化为一张信息长图（PNG）。支持四种风格，由触发词决定：

| 触发词 | 风格 | 配色 | 宽度 |
|--------|------|------|------|
| 墨图 / 黑白图 / bw-card | 黑白漫画 | 纯黑 `#1a1a1a` + 白 | 1080px |
| 活力图 / 彩色墨图 / pop-card | 暖调漫画 | 深海蓝 `#1E3A5F` + 珊瑚橘 `#E8613C` + 米白 `#FBF8F3` | 1080px |
| 赤图 / 黑红图 / red-card | 黑红漫画 | 纯黑 `#1a1a1a` + 赤红 `#C41E1E` + 白 | 1080px |
| 杂志图 / 杂志海报 / magazine-poster | 杂志排版 | 深棕 `#2C2419` + 赤陶橘 `#C75B39` + 米白 `#FBF8F2` | 1400px |

作者：非著名程序员

## 输入

用户可以提供：
- 直接粘贴的文字内容
- URL（会自动抓取）
- 文件路径

## 执行流程

### Step 1：识别风格

从用户的触发词判断风格：

```
墨图 / 黑白图 / bw-card     → mode = "bw"
活力图 / 彩色墨图 / pop-card → mode = "pop"
赤图 / 黑红图 / red-card     → mode = "red"
杂志图 / 杂志海报 / magazine  → mode = "magazine"
```

如果用户未明确指定，默认使用"墨图"风格。

### Step 2：获取内容

- 如果用户给了 URL → 用 WebFetch 抓取内容
- 如果用户粘贴了文字 → 直接使用
- 如果用户给了文件路径 → 用 Read 读取

### Step 3：读取参考文件

按顺序读取以下文件：

1. `~/.claude/skills/ink-card/references/taste.md` — 设计品味准则
2. `~/.claude/skills/ink-card/references/mode.md` — 创作指南（核心）

根据 mode 读取对应模板：
- bw / pop / red → `~/.claude/skills/ink-card/assets/template-manga.html`
- magazine → `~/.claude/skills/ink-card/assets/template-magazine.html`

### Step 4：生成 HTML

根据 mode.md 中对应风格的指南执行：

**漫画风格（bw / pop / red）**：
1. 理解内容，选择漫画风格（大友克洋/井上雄彦/三浦建太郎/松本大洋/谷口治郎）
2. 设计画面布局
3. 写 CSS + HTML（使用对应风格的 CSS 变量）

**杂志风格（magazine）**：
1. 分析内容，选择组件组合
2. 填充杂志组件
3. 写 CSS + HTML

将完成的 HTML 写入 `/tmp/ink_card_{name}.html`，其中 `{name}` 是从内容中提取的核心概念（中文，无标点，≤20 字）。

### Step 5：自检

按 mode.md 中对应风格的自检清单逐项检查。不通过则修改后重新检查。

### Step 6：截图生成 PNG

```bash
node ~/.claude/skills/ink-card/assets/capture.js /tmp/ink_card_{name}.html ~/Downloads/{name}_{style}.png {width} 800 fullpage
```

其中 `{width}` 漫画风格为 1080，杂志风格为 1400。`{style}` 为风格名（墨图/活力图/赤图/杂志图）。

截图完成后告诉用户文件路径。

### Step 7：展示结果

用 Read 工具读取生成的 PNG 文件，展示给用户看效果。

## 依赖

- Playwright（Chromium）— 用于截图
- 模板中引用 Google Fonts（Noto Serif SC、DM Sans）
- Font Awesome 6.4.0（仅杂志风格）

首次使用需要安装依赖：
```bash
cd ~/.claude/skills/ink-card && npm install && npx playwright install chromium
```
