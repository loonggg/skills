# 创作指南

## 核心信条

**一张图讲完一个故事。** 用漫画或杂志的视觉语言做信息图，通过分格、色彩对比和排版节奏构建视觉层次。

## 步骤 1：读取模板

根据用户选择的风格读取对应模板：

- **墨图 / 活力图 / 赤图** → `~/.claude/skills/ink-card/assets/template-manga.html`
  - 提供字体、SVG 滤镜（inkgrain/halftone/roughen）、署名栏
  - 插槽：`{{CUSTOM_CSS}}`、`{{CONTENT_HTML}}`、`{{SOURCE_LINE}}`

- **杂志图** → `~/.claude/skills/ink-card/assets/template-magazine.html`
  - 提供字体、SVG 纹理、完整组件 CSS、Font Awesome
  - 内容直接在 `<body>` 内的 `.magazine-container` 中生成

## 步骤 2：理解内容，选择风格

### 2.1 提取叙事要素

从内容中提取：
- **核心命题**：这段内容在说什么？
- **3-7 个关键观点**：可以变成"区块"的概念
- **观点之间的关系**：因果/对比/递进/并列
- **情绪弧线**：从什么到什么？
- **一个视觉锚点**：最有画面感的那个概念

### 2.2 漫画风格选择（bw / pop / red 适用）

| 风格 | 视觉特征 | 触发信号 |
|------|---------|---------|
| **大友克洋 — 精密废墟** | 极细线条密集排列、灰阶丰富 | 技术/系统/架构 |
| **井上雄彦 — 水墨留白** | 大面积留白、墨色渐变 | 哲学/沉思/人文 |
| **三浦建太郎 — 暗黑压迫** | 大面积深色、极高对比 | 冲突/困境/挣扎 |
| **松本大洋 — 生猛粗线** | 粗细不均线条、不规则构图 | 突破/创意/运动 |
| **谷口治郎 — 静谧精描** | 克制线条、安静灰阶 | 观察/日常/细节 |

### 2.3 内容密度判断

| 内容体量 | 核心观点数 | 画面特征 |
|---------|----------|---------|
| 少（< 500 字） | 1-3 个 | 大面积留白 + 2-3 个大区块，留白 ≥ 40% |
| 中（500-1500 字） | 3-5 个 | 有结构的分格布局，留白 20-40% |
| 多（> 1500 字） | 5-7+ 个 | 密集分格，多区块，留白 ≤ 20% |

**始终是一张图。** 内容再多也不拆分。

## 步骤 3：设计画面

### 3.1 漫画元素工具箱（bw / pop / red）

#### 分格系统
```css
.panel {
  border: 3px solid var(--ink);
  background: var(--white);
  padding: 28px 32px;
  position: relative;
  overflow: hidden;
}
```

#### 集中线
```css
.focus-lines::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-conic-gradient(var(--ink) 0deg 0.5deg, transparent 0.5deg 5deg) center/100% 100%;
  opacity: 0.06;
  pointer-events: none;
}
```

#### 墨色浓淡
```css
.ink-wash {
  background: linear-gradient(135deg, var(--ink) 0%, rgba(26,26,26,0.6) 20%, rgba(26,26,26,0.15) 50%, transparent 70%);
}
```
注意：pop 风格用 `rgba(30,58,95,...)` 替代。

#### 对话泡
```css
.speech-bubble {
  background: var(--white);
  border: 2.5px solid var(--ink);
  border-radius: 20px;
  padding: 16px 22px;
  font: 700 32px/1.4 var(--serif);
}
```

#### 网点灰
```css
.screentone {
  background-image: radial-gradient(circle, var(--ink) 1px, transparent 1px);
  background-size: 5px 5px;
  opacity: 0.15;
}
```

#### 拟声词 / 效果字
```css
.sfx {
  font: 900 80px/1 var(--serif);
  color: var(--ink);
  transform: rotate(-8deg) skewX(-5deg);
  letter-spacing: -3px;
}
```

#### 反白 + 弹点强调
```css
.reversed { background: var(--ink); color: var(--white); padding: 4px 16px; }
.accent { color: var(--accent); font-weight: 900; }
```

### 3.2 杂志组件（magazine 适用）

读取 `template-magazine.html` 中预定义的组件 CSS class：
- `.header` + `.main-title` + `.subtitle` — 标题区（左对齐，96px）
- `.content-grid` + `.observation-box` + `.main-content` — 双栏（2fr 3fr）
- `.three-column-cards` + `.card` — 三栏卡片（2fr 1fr 1fr）
- `.stats-section` + `.stat-item` — 统计数据
- `.highlight-section` / `.green-highlight` / `.red-highlight` — 颜色高亮框
- `.quote-section` — 引用区
- `.timeline` + `.timeline-item` — 时间轴
- `.two-column-equal` / `.four-column-cards` — 等宽布局
- `.full-width-content` — 全宽内容
- `.conclusion` — 结论区（深蓝黑背景）
- `.decorative-line` — 分隔线（3px 实线）

### 3.3 布局原则（所有风格通用）

- **纵向叙事流**：内容从上到下流动
- **分格制造节奏**：大格+小格+全宽条带，不是全部等大
- **留白 = 呼吸**：区块之间有疏密变化
- **至少 1 个出血格**（漫画风格）
- **至少 1 个深色区域**：制造对比和戏剧性

### 3.4 排版原则

- **字号对比极端**：标题 72px+（漫画）/ 96px（杂志）、正文 32px+、标注 20px+
- **粗体 = 重音**
- **强调色弹点 2-3 处**（pop/red/magazine），或纯黑反白（bw）
- **字号 ≥ 32px**：正文和标注都要在手机上可读

## 步骤 4：写 CSS + HTML

### 漫画风格（bw / pop / red）

所有 CSS 写入 `{{CUSTOM_CSS}}`，HTML 写入 `{{CONTENT_HTML}}`。

CSS 从零写，class 名反映内容。使用对应风格的 CSS 变量。

**核心约束**：
- 边框统一 2.5-3px，颜色 `var(--ink)`
- 至少一个纯黑/深色（`--ink`）背景区域
- 弹点色（pop 用 `--accent`，red 用 `--accent`，bw 不用）2-3 处
- 区块间用 `border-bottom: 3px solid var(--ink)` 分隔

写入：`/tmp/ink_card_{name}.html`

### 杂志风格（magazine）

直接在 template-magazine.html 的 `<body>` 内 `.magazine-container` 中生成完整 HTML。

使用模板中预定义的 class，不自行发明新 class。

**核心约束**：
- 所有颜色用 CSS 变量
- 直角边框，无圆角、无阴影
- 标题 96px 左对齐
- 区块间用 3px 实线分隔
- 赤陶橘弹点 2-3 处

写入：`/tmp/ink_card_{name}.html`

### 替换变量（漫画风格模板）

| 变量 | 内容 |
|------|------|
| `{{CUSTOM_CSS}}` | 全部 CSS |
| `{{CONTENT_HTML}}` | 全部 HTML |
| `{{SOURCE_LINE}}` | 内容来源（可选）：`<span class="info-source">来源文字</span>` |

## 步骤 5：自检

### 漫画风格（bw / pop / red）

- [ ] 一眼看上去有对应风格的调性吗？
- [ ] 有没有至少 3 个视觉区块/分格？
- [ ] 主色和底色的对比是否强烈？有没有深色背景区域？
- [ ] 弹点色是否 2-3 处？（pop/red；bw 无弹点，用反白）
- [ ] 有没有至少 1 个漫画特有元素（集中线/对话泡/效果字/网点灰/墨色渐变）？
- [ ] 区块大小是否有对比？
- [ ] 正文字号 ≥ 32px？标题 ≥ 72px？
- [ ] 是一张图而不是多张？

### 杂志风格（magazine）

- [ ] 有杂志的排版调性吗？直角边框、粗线分隔？
- [ ] 标题 96px 左对齐？
- [ ] 有没有至少 3 个不同组件？
- [ ] 所有颜色使用 CSS 变量？
- [ ] 赤陶橘弹点 2-3 处？
- [ ] 正文字号 ≥ 32px？
- [ ] 是一张图而不是多张？

## 步骤 6：截图

```bash
# 漫画风格
node ~/.claude/skills/ink-card/assets/capture.js /tmp/ink_card_{name}.html ~/Downloads/{name}_{style}.png 1080 800 fullpage

# 杂志风格
node ~/.claude/skills/ink-card/assets/capture.js /tmp/ink_card_{name}.html ~/Downloads/{name}_{style}.png 1400 800 fullpage
```
