---
name: html-slideshow-to-pptx
description: "将网页 HTML 幻灯片转换为 PPTX 演示文档。自动解析 HTML 中的幻灯片结构、样式和布局，生成符合 html2pptx 规范的幻灯片，然后转换为高清 PPTX。当用户说'网页转PPTX'、'HTML转PPTX'、'HTML幻灯片转PPT'、'把网页转成PPT'、'web to pptx'、'slideshow to pptx'，或提供了一个 HTML 文件并要求转换为 PPTX/PowerPoint 时触发此 skill。即使用户没有明确说'转PPTX'，只要意图是把网页幻灯片变成PPT演示文稿就应该使用。"
---

# Web Slideshow to PPTX Converter

将网页 HTML 幻灯片（ slideshow ）转换为 PowerPoint 演示文档。核心流程：解析源 HTML → 提取设计与内容 → 创建 html2pptx 兼容的 HTML 幻灯片 → 生成 PPTX。

## 前置条件

本 skill 自带 `html2pptx.js` 转换库，无需依赖其他 skill。

需要 `pptxgenjs`、`sharp`、`playwright` npm 包。如果工作区没有，先安装：
```bash
cd workspace && npm install pptxgenjs sharp playwright
```

## 完整工作流

### Step 1: 读取并分析源 HTML

读取用户提供的 HTML 文件，识别以下信息：

1. **幻灯片结构**：slides 是如何分割的（class="slide" 的 div、section 标签、id="slide-N" 等）
2. **色彩体系**：背景色、文字色、强调色（从 CSS 变量或具体样式中提取）
3. **字体**：使用了哪些字体（后续需要映射到 web-safe 字体）
4. **布局模式**：每张幻灯片的布局类型（居中标题、分栏、卡片、终端、图表等）
5. **SVG / 图表**：哪些幻灯片包含 SVG 内联图形或 CSS 渐变

把分析结果记在心里，这些信息决定了后续所有步骤。

### Step 2: 创建工作目录

```bash
mkdir -p workspace/slides workspace/assets
```

- `slides/` — 存放 html2pptx 兼容的 HTML 幻灯片文件（slide1.html, slide2.html, ...）
- `assets/` — 存放从 SVG/渐变光栅化的 PNG 图片

### Step 3: 光栅化矢量资源

SVG 内联图形和 CSS 渐变无法被 html2pptx 直接识别，必须先转成 PNG 图片。

使用 Sharp 将 SVG 转为 PNG：

```javascript
const sharp = require('sharp');

async function svgToPng(svgString, outputPath, width, height) {
  await sharp(Buffer.from(svgString)).resize(width, height).png().toFile(outputPath);
}
```

常见需要光栅化的元素：
- 内联 `<svg>` 图形（流程图、架构图、图标等）→ 提取 SVG 字符串，转 PNG
- CSS `linear-gradient` / `radial-gradient` 背景 → 生成对应 SVG 渐变，转 PNG
- 复杂的纯 CSS 装饰图形 → 用 SVG 重绘，转 PNG

将生成的 PNG 保存到 `workspace/assets/` 目录，后续在 HTML 幻灯片中用 `<img>` 引用。

**技巧**：可以写一个临时的 `build-assets.js` 脚本批量处理所有 SVG 资源，然后运行它。

### Step 4: 逐张创建 HTML 幻灯片

这是最关键的一步。为源 HTML 中的每一张幻灯片，创建一个独立的、符合 html2pptx 规范的 HTML 文件。

#### 每张幻灯片的 HTML 模板

```html
<!DOCTYPE html>
<html>
<head>
<style>
html { background: #背景色; }
* { box-sizing: border-box; }
h1, h2, h3, p { margin: 0; }
body {
  width: 720pt; height: 405pt; margin: 0; padding: 0;
  background: #背景色;
  font-family: Arial, sans-serif;
  color: #文字色;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
/* 其他样式 */
</style>
</head>
<body>
  <!-- 幻灯片内容 -->
</body>
</html>
```

#### html2pptx 的硬性约束

这些规则必须严格遵守，否则转换会失败：

1. **尺寸**：body 必须是 `width: 720pt; height: 405pt`（16:9）
2. **字体**：只使用 web-safe 字体（Arial, Helvetica, Times New Roman, Georgia, Courier New, Verdana, Tahoma, Trebuchet MS, Impact）。原始字体需映射到最接近的 web-safe 字体
3. **所有文字必须在 `<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>` 标签内**：
   - `<div>` 或 `<span>` 中的纯文字不会出现在 PPTX 中
   - 如果需要带背景的文字容器：用 `<div>` 做容器设背景，内部用 `<p>` 包裹文字
4. **背景、边框、阴影只对 `<div>` 有效**：
   - `<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>` 不能有 background/border/box-shadow
   - 如需带背景色的文字块：`<div style="background: xxx;"><p>文字</p></div>`
5. **禁止 CSS 渐变**：`linear-gradient`, `radial-gradient` 不能用。所有渐变必须预先光栅化为 PNG 图片
6. **`<span>` 不支持 margin/padding**：行内元素的间距只能通过 font-weight, font-style, text-decoration, color 控制
7. **使用 `display: flex`**：body 上用 flex 布局，防止 margin collapse 导致溢出
8. **`box-sizing: border-box`**：全局设置，防止 padding/border 导致溢出
9. **清除默认 margin**：`h1, h2, h3, p { margin: 0; }` 防止浏览器默认 margin 造成溢出
10. **内容不能溢出 body**：所有内容必须在 720pt × 405pt 范围内

### Step 5: 运行转换

使用本 skill 自带的 `convert.js` 脚本：

```bash
SKILL_DIR=".claude/skills/html-slideshow-to-pptx"
node $SKILL_DIR/scripts/convert.js workspace/slides output.pptx --title "演示标题"
```

脚本会自动：
- 按编号顺序读取所有 slideN.html 文件
- 调用 html2pptx.js 逐张转换
- 输出最终的 PPTX 文件

### Step 6: 验证

用 `open` 命令打开生成的 PPTX 文件，让用户预览。如果发现布局问题（文字被截断、元素重叠、溢出），调整对应 HTML 的间距后重新运行转换。

## 设计还原指南

### 色彩映射

从源 HTML 的 CSS 变量或具体样式中提取色彩体系，保持一致使用：
- 背景色 → body background
- 主文字色 → color
- 强调色 → 用 `style="color: #xxx"` 在 `<span>` 上标注
- 卡片/容器背景 → 用半透明 rgba 值

### 字体映射

| 原始字体 | 映射到 |
|---------|-------|
| Inter, PingFang SC, Source Han Sans | Arial |
| Noto Serif SC, Source Han Serif | Georgia |
| Courier New, monospace | Courier New |
| 其他 sans-serif | Arial |
| 其他 serif | Georgia |

### 布局还原

源 HTML 通常使用 `vw`/`vh` 响应式单位，PPTX 中必须用固定 `pt` 值。换算参考：
- 720pt 宽 ≈ 10 英寸，405pt 高 ≈ 5.6 英寸
- 大标题：28-36pt
- 中标题：20-24pt
- 正文：12-14pt
- 小字/注释：9-11pt
- 内容左右留白：35-50pt
- 元素间距：15-25pt

### 常见幻灯片布局模式

**居中标题页**：
```html
<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; width: 100%;">
  <h1 style="font-size: 34pt; font-weight: 900; text-align: center;">标题</h1>
  <p style="font-size: 12pt; opacity: 0.5; margin-top: 30pt;">副标题</p>
</div>
```

**双栏卡片**：
```html
<div style="display: flex; gap: 16pt; width: 100%;">
  <div style="flex: 1; background: rgba(255,255,255,0.05); border-radius: 10pt; padding: 16pt; text-align: center;">
    <h2 style="font-size: 24pt; color: #强调色;">01</h2>
    <p style="font-size: 11pt; line-height: 1.8;">卡片内容</p>
  </div>
  <div style="flex: 1; ...">...</div>
</div>
```

**分屏对比（左彩色/右暗色）**：
需要 body 设为 `flex-direction: row`：
```html
<!-- body style="flex-direction: row;" -->
<div style="flex: 0 0 60%; background: #强调色; display: flex; align-items: center; justify-content: center;">
  <h1 style="font-size: 50pt; font-weight: 900;">大文字</h1>
</div>
<div style="flex: 0 0 40%; display: flex; flex-direction: column; justify-content: center; padding: 25pt;">
  <p>说明文字</p>
</div>
```

**终端窗口**：
```html
<div style="background: rgba(0,0,0,0.6); border: 1.5pt solid #边框色; border-radius: 6pt; padding: 15pt; width: 450pt;">
  <p style="font-family: 'Courier New', monospace; font-size: 11pt; line-height: 2;">$ command</p>
  <p style="font-family: 'Courier New', monospace; font-size: 11pt; opacity: 0.5;">→ output</p>
</div>
```

**大数字展示**：
```html
<div style="display: flex; align-items: center; gap: 30pt;">
  <div style="display: flex; flex-direction: column; align-items: center;">
    <h1 style="font-size: 80pt; font-weight: 900; color: #强调色;">15</h1>
    <p style="font-size: 12pt; opacity: 0.7;">分钟</p>
  </div>
  <div style="width: 1pt; height: 80pt; background: rgba(255,255,255,0.2);"></div>
  <div style="...">
    <h1 style="...">5</h1>
    <p>分钟</p>
  </div>
</div>
```

## 注意事项

1. **不要省略幻灯片**：源 HTML 有多少张幻灯片，就生成多少张 HTML 文件
2. **内容完整性**：每张幻灯片的文字内容要完整保留，宁可字号小一点也不要删减
3. **色彩一致性**：所有幻灯片使用统一的色彩体系，保持视觉连贯
4. **SVG 必须光栅化**：任何内联 SVG 图形都必须转成 PNG，html2pptx 不支持 SVG
5. **渐变必须光栅化**：CSS 渐变背景也必须转成 PNG
6. **留够安全边距**：内容不要紧贴 body 边缘，至少留 35pt 内边距
7. **先测试再批量**：可以先做 2-3 张幻灯片试转换，确认效果后再完成全部
