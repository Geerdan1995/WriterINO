# 会议名牌生成器 - 代码分析报告

> **Task 1.1 完成日期**：2026-03-20

---

## 一、HTML 结构分析

### 1.1 整体结构

```html
<div class="container">
  <h1>标题</h1>
  <div class="input-area">
    <!-- 输入区域 -->
  </div>
  <div id="previewArea" class="preview-area">
    <!-- 预览区域 -->
  </div>
</div>
```

### 1.2 输入区域组件

| 组件 | 说明 |
|-----|------|
| `#namesInput` | 姓名输入文本框，用中文顿号（、）分隔 |
| `#layoutMode` | 排版模式选择下拉框，6种模式 |
| `#mode6SubtextContainer` | 模式六底部文字输入（条件显示） |
| `#mode6Subtext` | 模式六底部文字输入框 |
| `#previewButton` | 生成预览按钮 |
| `#printButton` | 打印按钮 |
| `#pdfButton` | 保存PDF按钮 |

---

## 二、6 种排版模式详解

| 模式 | 名称 | 每页数量 | 特点 |
|-----|------|---------|------|
| **mode1** | 单行大字 | 3个/页 | A4竖排，3个名牌，带背景图片 |
| **mode2** | 中文+拼音 | 8个/页 | 2x4网格，每个名牌有中文和拼音 |
| **mode3** | 对称旋转 | 1个/页 | A4竖排，上下对称，名字旋转180度 |
| **mode4** | 带横线标记 | 1个/页 | 类似模式三，有横线和logo |
| **mode5** | 汇川书院讲师席卡 | 1个/页 | 类似模式四，有特定logo和文字 |
| **mode6** | 汇川书院学员胸贴 | 8个/页 | 类似模式二，有底部固定文字 |

### 2.1 模式一：单行大字

- 每页 3 个名牌
- 背景图片：`pic5.png`
- 两字姓名：`letter-spacing: 1em`

### 2.2 模式二：中文+拼音

- 2x4 网格布局，每页 8 个
- 水平线 3 条，垂直线 1 条
- Logo：`logo.png`
- 拼音转换：使用 pinyin-pro 库

### 2.3 模式三：对称旋转

- 每页 1 个名牌
- 上方图片：`card2.png`
- 下方图片：`pic4.png`
- 上方名字旋转 180 度
- 支持英文名字自动换行

### 2.4 模式四：带横线标记

- 每页 1 个名牌
- 横线 3 条（上、中、下）
- Logo：`logo.png`（左上角和右下角）
- 右下角 logo 旋转 180 度

### 2.5 模式五：汇川书院讲师席卡

- 每页 1 个名牌
- 横线 3 条（上、中、下）
- 横线上下有小字说明
- Logo：`acd.png`（左上角和右下角）
- 右下角 logo 旋转 180 度

### 2.6 模式六：汇川书院学员胸贴

- 2x4 网格布局，每页 8 个
- 水平线 3 条，垂直线 1 条
- Logo：`acd.png`
- 底部固定文字（用户输入）

---

## 三、CSS 样式分析

### 3.1 核心样式文件大小

- 总 CSS 行数：约 860 行

### 3.2 需要保留的自定义 CSS（无法用 Tailwind 替代）

| 样式类型 | 说明 | 原因 |
|---------|------|------|
| **毫米单位** | `210mm`、`297mm`、`99mm` 等 | Tailwind 不支持毫米单位 |
| **打印媒体查询** | `@media print` | 需要精确控制打印效果 |
| **页面打印** | `@page`、`page-break-*` | 打印分页控制 |
| **复杂动画** | `@keyframes float` | 爱心泡泡动画 |
| **特殊选择器** | `.page:not(:last-child):after` | 复杂的 CSS 选择器 |
| **渐变背景** | 复杂的渐变 | 虽然 Tailwind 支持，但复杂渐变保留更清晰 |

### 3.3 可以转换为 Tailwind 的样式

| 原 CSS | Tailwind 类 |
|-------|------------|
| `max-width: 900px` | `max-w-4xl` |
| `margin: 0 auto` | `mx-auto` |
| `padding: 24px` | `p-6` |
| `display: flex` | `flex` |
| `flex-direction: column` | `flex-col` |
| `gap: 20px` | `gap-5` |
| `background-color: #fff` | `bg-white` |
| `border-radius: 8px` | `rounded-lg` |

---

## 四、JavaScript 功能分析

### 4.1 全局变量

| 变量 | 说明 |
|-----|------|
| `layoutChanged` | 跟踪排版模式是否已切换但未预览 |
| `currentLayoutMode` | 当前选中的排版模式 |

### 4.2 核心函数列表

| 函数名 | 功能 |
|-------|------|
| `savePDF()` | 保存 PDF（实际是调用 window.print()） |
| `createHearts(element)` | 创建爱心泡泡动画效果 |
| `toPinyin(chinese)` | 中文转拼音 |
| `createMode2Card(name, pinyin)` | 创建模式二的名牌卡片 |
| `createMode6Card(name)` | 创建模式六的名牌卡片 |

### 4.3 事件监听器

| 元素 | 事件 | 功能 |
|-----|------|------|
| `#printButton` | click | 打印，带爱心动画 |
| `#pdfButton` | click | 保存 PDF，带爱心动画 |
| `#layoutMode` | change | 切换模式，显示/隐藏模式六输入框 |
| `#previewButton` | click | 生成预览，带爱心动画 |
| `#namesInput` | focus/blur | 输入框焦点效果 |

### 4.4 预览生成逻辑（核心）

```javascript
if (layoutMode === 'mode1') {
  // 模式一：每页3个大字名牌
} else if (layoutMode === 'mode2') {
  // 模式二：网格布局，每页8个名牌
} else if (layoutMode === 'mode3') {
  // 模式三：对称旋转
} else if (layoutMode === 'mode4') {
  // 模式四：带横线标记
} else if (layoutMode === 'mode5') {
  // 模式五：汇川书院讲师席卡
} else if (layoutMode === 'mode6') {
  // 模式六：汇川书院学员胸贴
}
```

### 4.5 拼音转换库

- **库名**：pinyin-pro
- **版本**：3.18.6
- **CDN**：`https://unpkg.com/pinyin-pro@3.18.6/dist/index.js`
- **配置**：
  - `toneType: 'none'` - 不带声调
  - `type: 'array'` - 返回数组
  - `separator: ' '` - 空格分隔
- **后处理**：每个拼音首字母大写

---

## 五、图片资源清单

| 图片文件名 | 使用模式 | 用途 |
|-----------|---------|------|
| `pic5.png` | mode1 | 背景图片 |
| `card2.png` | mode3 | 上方图片 |
| `pic4.png` | mode3 | 下方图片 |
| `logo.png` | mode2, mode4 | Logo |
| `acd.png` | mode5, mode6 | Logo |
| `pixar-lamp.svg` | 标题 | 皮克斯小跳灯图标 |

---

## 六、必须保留的功能

### 6.1 核心功能（100% 保留）

- [x] 6 种排版模式
- [x] 姓名输入（顿号分隔）
- [x] 拼音转换（pinyin-pro）
- [x] 两字姓名特殊处理
- [x] 英文姓名自动换行
- [x] 打印功能
- [x] 保存 PDF 功能
- [x] 模式六底部文字输入

### 6.2 交互效果（100% 保留）

- [x] 爱心泡泡动画（按钮点击时）
- [x] 按钮缩放效果
- [x] 输入框焦点效果
- [x] 模式切换提示（未预览时）

### 6.3 打印控制（100% 保留）

- [x] A4 纸张尺寸（210mm x 297mm）
- [x] 打印边距控制
- [x] 分页控制
- [x] 隐藏输入区域（打印时）
- [x] 移除爱心泡泡（打印时）

---

## 七、可以优化的地方

### 7.1 代码优化建议

| 优化项 | 说明 |
|-------|------|
| **CSS 模块化** | 将不同模式的 CSS 分开 |
| **JS 模块化** | 将预览生成逻辑拆分为单独函数 |
| **错误处理** | 增加更多的错误提示 |
| **输入验证** | 更严格的输入验证 |

---

## 八、整合到 Web 应用的注意事项

### 8.1 图片路径调整

所有图片路径需要改为 Flask 静态路径：

| 原路径 | 新路径 |
|-------|--------|
| `pic5.png` | `/static/assets/meeting_badge/pic5.png` |
| `card2.png` | `/static/assets/meeting_badge/card2.png` |
| `pic4.png` | `/static/assets/meeting_badge/pic4.png` |
| `logo.png` | `/static/assets/meeting_badge/logo.png` |
| `acd.png` | `/static/assets/meeting_badge/acd.png` |
| `pixar-lamp.svg` | `/static/assets/meeting_badge/pixar-lamp.svg` |

### 8.2 外部库加载

pinyin-pro 库需要在 base.html 中加载：

```html
<script src="https://unpkg.com/pinyin-pro@3.18.6/dist/index.js"></script>
```

### 8.3 统计集成

- 打印或保存 PDF 成功后，调用 API 更新使用次数
- 每次使用按 10 分钟计算

---

## 九、验收标准

### Task 1.1 验收通过标准

- [x] 已阅读完整的 index.html 文件
- [x] 已分析 HTML 结构
- [x] 已分析 6 种模式的特点
- [x] 已分析 CSS 样式
- [x] 已分析 JavaScript 功能
- [x] 已列出图片资源清单
- [x] 已明确必须保留的功能
- [x] 已制定整合注意事项
- [x] 已生成本分析报告文档

---

## 十、下一步建议

### Task 1.2 可以开始了

基于本分析报告，可以开始：
1. 创建会议名牌页面 HTML 结构
2. 在 base.html 中添加自定义 CSS
3. 在 main.js 中迁移 JavaScript 逻辑
