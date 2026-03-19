# 工具类网页前端开发规范文档

本文档基于参考页面风格，整理了可直接落地的前端开发规范，包含布局、色彩、排版、组件、交互等核心内容，可直接复制保存、导入项目使用。

# 一、布局规范

## 1. 整体结构

采用三栏固定布局，适配桌面端为主，响应式可后续扩展，基础HTML结构如下：

```html
<!-- 基础布局结构 -->
<div class="layout-container">
  <aside class="sidebar"> <!-- 左侧导航栏 --> </aside>
  <header class="header"> <!-- 顶部通栏 --> </header>
  <main class="main-content"> <!-- 右侧主内容区 --> </main>
</div>
```

## 2. 尺寸与定位规范

- **侧边栏（sidebar）**：固定宽度 240px，position: fixed 左对齐，高度 100vh，不随页面滚动，z-index 与顶部栏一致（建议 z-index: 10）。

- **顶部栏（header）**：高度 64px，position: fixed 顶部通栏，left: 240px，right: 0，z-index: 10，层级高于主内容区，避免被遮挡。

- **主内容区（main-content）**：margin-left: 240px，padding-top: 80px（为顶部栏预留16px间距），整体内边距 padding: 80px 24px 24px，内容采用网格布局（grid），适配多列展示。

# 二、视觉与色彩规范

## 1. 视觉风格核心要求

- **圆角统一**：所有可交互元素（卡片、按钮、搜索框、图标容器）圆角值统一为 8px-12px，推荐使用 10px，保持视觉一致性。

- **层级区分**：卡片默认样式：background: #fff，box-shadow: 0 1px 3px rgba(0,0,0,0.08)；hover 时样式：box-shadow: 0 4px 12px rgba(0,0,0,0.12)，轻微上浮 transform: translateY(-2px)，提升交互质感。

- **留白规范**：卡片间距 16px，模块间距 32px，组件内边距 20px，页面整体留白充足，避免拥挤，提升阅读与操作舒适度。

## 2. 色彩变量规范（可直接复制到CSS中使用）

```css
:root {
  /* 基底色：保证页面基础可读性 */
  --color-bg: #ffffff; /* 页面背景色 */
  --color-text-primary: #333333; /* 主文本色 */
  --color-text-secondary: #666666; /* 次要文本色 */
  --color-border: #f0f0f0; /* 边框/分割线色 */

  /* 品牌色：强化品牌识别，不滥用 */
  --color-brand: #6378e8; /* 主品牌色（浅蓝紫），用于导航选中、品牌标识 */
  --color-brand-light: #f0f2ff; /* 品牌浅色系，用于导航选中背景 */

  /* 功能色：区分功能，提升识别效率 */
  --color-tag-privilege: #ff4d4f; /* 权益卡标签色（红色） */
  --color-tag-new: #ff9100; /* 新品/限免标签色（橙色） */
  --color-tool-blue: #4080ff; /* 工具图标色（蓝色，如PDF类工具） */
  --color-tool-red: #ff5252; /* 工具图标色（红色，如视频类工具） */
  --color-tool-green: #36b37e; /* 工具图标色（绿色，如表格类工具） */
  --color-tool-orange: #ff8c00; /* 工具图标色（橙色，如图片类工具） */
}
```

# 三、排版规范

## 1. 字体与行高基础规范

- 全局字体：font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

- 基础字号：14px，基础行高：1.5，保证网页阅读舒适度。

## 2. 文本层级规范（清晰区分主次，提升阅读效率）

|文本层级|字号|字重|颜色|用途|
|---|---|---|---|---|
|主标题|16px|500-600|--color-text-primary|工具名称、页面分区标题（如“最新工具”）|
|辅助文本|13px|400|--color-text-secondary|工具功能描述、次要说明信息|
|标签文本|12px|500|白色|权益卡、NEW、限免等功能标签|
# 四、核心组件规范（可直接复制使用）

## 1. 工具卡片（Tool Card）

核心组件，统一样式，适配所有工具展示，HTML+CSS如下：

```html
<!-- 工具卡片HTML -->
<div class="tool-card">
  <div class="tool-icon" style="background-color: var(--color-tool-blue);">
    <!-- 工具图标（可插入svg或img） -->
  </div>
  <h3 class="tool-title">PDF转Word</h3>
  <p class="tool-desc">PDF转Word是一款高效的文档处理工具，快速转换，保留原格式</p>
  <span class="tag tag-privilege">权益卡</span>
</div>
```

```css
/* 工具卡片CSS */
.tool-card {
  width: 100%;
  padding: 20px;
  border-radius: 10px;
  background: var(--color-bg);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
}
.tool-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}
.tool-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: white; /* 图标颜色，与背景色对比 */
}
.tool-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}
.tool-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
.tag {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}
.tag-privilege { background: var(--color-tag-privilege); } /* 权益卡标签 */
.tag-new { background: var(--color-tag-new); } /* 新品/限免标签 */
```

## 2. 侧边栏导航（Sidebar Nav）

全局导航组件，状态区分清晰，HTML+CSS如下：

```html
<!-- 侧边栏导航HTML -->
<nav class="sidebar-nav">
  <a class="nav-item active" href="#">
    <i class="icon"></i> <!-- 导航图标 -->
    <span>全部工具</span>
  </a>
  <a class="nav-item" href="#">
    <i class="icon"></i>
    <span>图片工具</span>
  </a>
  <a class="nav-item" href="#">
    <i class="icon"></i>
    <span>文档工具</span>
  </a>
  <a class="nav-item" href="#">
    <i class="icon"></i>
    <span>视频工具</span>
  </a>
  <!-- 更多导航项可按需添加 -->
</nav>
```

```css
/* 侧边栏导航CSS */
.sidebar-nav {
  width: 100%;
  padding-top: 20px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 14px;
}
.nav-item.active {
  background: var(--color-brand-light);
  color: var(--color-brand);
  font-weight: 500;
}
.nav-item:hover:not(.active) {
  background: #f5f5f5;
}
.icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## 3. 顶部搜索框（Search Bar）

核心功能组件，视觉简洁，HTML+CSS如下：

```html
<!-- 顶部搜索框HTML -->
<div class="search-bar">
  <i class="search-icon"></i> <!-- 搜索图标 -->
  <input type="text" placeholder="搜索工具（如PDF转Word）" />
</div>
```

```css
/* 顶部搜索框CSS */
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f5f5;
  border-radius: 24px;
  padding: 0 16px;
  height: 40px;
  flex: 1;
  max-width: 600px; /* 限制最大宽度，避免过宽 */
}
.search-bar .search-icon {
  color: var(--color-text-secondary);
  width: 16px;
  height: 16px;
}
.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: var(--color-text-primary);
}
.search-bar input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.8;
}
```

# 五、交互规范

- **过渡动画统一**：所有交互元素（卡片、导航、按钮）的hover、点击、切换效果，统一使用 transition: all 0.2s ease，保证动画流畅，视觉统一。

- **点击反馈**：可点击元素（工具卡片、导航项、按钮）点击时，添加轻微缩小效果 transform: scale(0.98)，松开后恢复原状，反馈明确，提升交互手感。

- **状态区分清晰**：导航选中态、标签、按钮等，必须用颜色/背景色明确区分，避免仅靠文字提示，降低用户识别成本。

- **滚动交互**：侧边栏、顶部栏固定，主内容区正常滚动；滚动时，顶部栏可添加轻微阴影（box-shadow: 0 2px 8px rgba(0,0,0,0.08)），提升层级感。

# 六、信息优先级规范

页面布局严格遵循“用户找工具、用工具”的核心需求，按优先级排序，确保操作路径最短：

1. **最高优先级**：顶部搜索框，占据顶部栏核心区域，视觉最突出，满足用户“精准找特定工具”的最高频需求，一步直达。

2. **次高优先级**：“最新工具”“最热工具”分区，前置展示在主内容区顶部，分区标题加粗，优先推荐高频使用、新上线的工具，降低用户查找成本。

3. **常规优先级**：全量工具卡片，采用网格布局均匀分布，覆盖所有工具品类，满足用户“浏览查找”的需求。

4. **最低优先级**：用户中心、反馈、共建、版权信息等辅助功能，放置在页面右上角（用户中心）、右下角（反馈）或页面底部（版权），弱化视觉，不干扰核心操作。

# 补充说明

1. 本文档所有代码可直接复制到项目中使用，只需根据实际工具图标、导航项、工具名称调整内容即可；

2. 响应式适配可后续扩展，建议移动端隐藏侧边栏，改为顶部下拉导航，保持核心功能（搜索、工具卡片）不变；

3. 可根据实际品牌色，调整 :root 中的品牌色变量，保持整体风格统一。
> （注：文档部分内容可能由 AI 生成）