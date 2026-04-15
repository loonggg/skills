---
name: redpage-card
description: 分页观点图。将文字内容拆解为关键观点，每个观点生成一张独立的黑红漫画风格卡片。当用户说"分页观点图"、"redpage-card"或需要将内容按观点分页生成黑红漫画卡片时触发此 skill。
user_invocable: true
---

# redpage-card — 分页观点图

将文字内容拆解为关键观点，每个观点生成一张独立的黑红漫画风格卡片（1080×auto PNG）。有几个观点就生成几张，不限制数量。

**核心**：一个观点一张图。用日式漫画的视觉语言（分格、集中线、网点灰、对话泡、效果字）详解每个观点。黑红配色——纯黑做主色，赤红（`--accent`）做弹点，制造视觉张力。

**不是**一张长图，是多张独立的漫画分格卡片。

作者：非著名程序员

## 输入

用户可以提供：
- 直接粘贴的文字内容
- URL（会自动抓取）
- 文件路径

## 执行流程

### Step 1：获取内容

- 如果用户给了 URL → 用 WebFetch 抓取内容
- 如果用户粘贴了文字 → 直接使用
- 如果用户给了文件路径 → 用 Read 读取

### Step 2：读取参考文件

按顺序读取以下文件，理解创作规则：

1. `~/.claude/skills/redpage-card/references/taste.md` — 设计品味准则
2. `~/.claude/skills/redpage-card/references/mode.md` — 创作指南（核心）
3. `~/.claude/skills/redpage-card/assets/template.html` — HTML 模板

### Step 3：生成 HTML

根据 mode.md 的步骤 2-4 执行：
1. 提取所有关键观点（有几个提取几个）
2. 选择漫画风格
3. 设计画面布局
4. 写 CSS + HTML

将完成的 HTML 写入 `/tmp/redpage_{name}_{N}.html`，其中 `{name}` 是从内容中提取的核心概念（中文，无标点，≤20 字），`{N}` 为 01、02、03...

### Step 4：自检

按 mode.md 步骤 5 的清单逐项检查。不通过则修改后重新检查。

### Step 5：截图生成 PNG

逐张截图，使用 fullpage 模式（高度由内容自动撑开，不会有底部留白）：

```bash
node ~/.claude/skills/redpage-card/assets/capture.js /tmp/redpage_{name}_01.html ~/Downloads/{name}_01.png 1080 800 fullpage
node ~/.claude/skills/redpage-card/assets/capture.js /tmp/redpage_{name}_02.html ~/Downloads/{name}_02.png 1080 800 fullpage
# ... 逐张执行
```

### Step 6：展示结果

用 Read 工具读取生成的 PNG 文件，展示给用户看效果。
同时报告卡片总数和每张卡片的观点概要。

## 依赖

- Playwright（Chromium）— 用于截图
- 模板中引用 Google Fonts（Noto Serif SC、DM Sans）

首次使用需要安装依赖：
```bash
cd ~/.claude/skills/redpage-card && npm install && npx playwright install chromium
```
