# 公文格式标准指南

本文档整理了 `document_generator.py` 中所有格式的定义位置，方便你改造成公司公文格式时参考。

---

## 一、字体定义

| 字体 | 定义值 | 用途 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 宋体 | `'宋体'` | 页码 | `FONT_SONGTI` | 44 |
| 仿宋_GB2312 | `'仿宋_GB2312'` | 正文、发文字号 | `FONT_FANGSONG` | 46 |
| 黑体 | `'黑体'` | 一级标题、密级 | `FONT_HEITI` | 48 |
| 楷体_GB2312 | `'楷体_GB2312'` | 二级标题、签发人姓名 | `FONT_KAITI` | 50 |
| 方正小标宋_GBK | `'方正小标宋_GBK'` | 发文机关标志、标题 | `FONT_XIAOBIAOSONG` | 52 |

---

## 二、页面格式

### 2.1 纸张和页边距

| 参数 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 页面宽度 | 21 cm | A4 纸宽度 | `_setup_page()` | 82 |
| 页面高度 | 29.7 cm | A4 纸高度 | `_setup_page()` | 84 |
| 上边距（天头） | 3.7 cm | 天头 | `_setup_page()` | 86 |
| 下边距 | 2.5 cm | 下白边 | `_setup_page()` | 88 |
| 左边距（订口） | 2.8 cm | 订口 | `_setup_page()` | 90 |
| 右边距（切口） | 2.6 cm | 切口 | `_setup_page()` | 92 |

### 2.2 默认样式（正文）

| 参数 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 字体 | 仿宋_GB2312 | 正文字体 | `_setup_styles()` | 108 |
| 字号 | 16 磅 | 3 号字 | `_setup_styles()` | 112 |
| 行间距 | 1.5 倍 | 正文行间距 | `_setup_styles()` | 114 |

---

## 三、公文元素格式

### 3.1 密级和保密期限

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 对齐方式 | 左对齐 | 左对齐 | `add_doc_classification()` | 210 |
| 字体 | 黑体 | 字体 | `add_doc_classification()` | 215 |
| 字号 | 16 磅 | 3 号字 | `add_doc_classification()` | 215 |
| 分隔符 | `'★'` | 密级和期限之间的分隔符 | `add_doc_classification()` | 205 |

### 3.2 紧急程度

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 对齐方式 | 左对齐 | 左对齐 | `add_urgency()` | 231 |
| 字体 | 黑体 | 字体 | `add_urgency()` | 236 |
| 字号 | 16 磅 | 3 号字 | `add_urgency()` | 236 |

### 3.3 签发人

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 对齐方式 | 右对齐 | 右对齐 | `add_signer()` | 309 |
| 前缀字体 | 仿宋_GB2312 | "签发人："字体 | `add_signer()` | 314 |
| 前缀字号 | 16 磅 | 3 号字 | `add_signer()` | 314 |
| 姓名字体 | 楷体_GB2312 | 签发人姓名字体 | `add_signer()` | 319 |
| 姓名字号 | 16 磅 | 3 号字 | `add_signer()` | 319 |

### 3.4 发文机关标志

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 对齐方式 | 居中 | 居中对齐 | `add_issuer_mark()` | 278 |
| 段前间距 | 0 磅 | 段前间距 | `add_issuer_mark()` | 280 |
| 段后间距 | 16 磅 | 段后间距 | `add_issuer_mark()` | 282 |
| 字体 | 方正小标宋_GBK | 字体 | `add_issuer_mark()` | 293 |
| 字号 | 26 磅 | 字号 | `add_issuer_mark()` | 293 |
| 是否加粗 | 是 | 加粗 | `add_issuer_mark()` | 293 |
| 颜色 | 红色 | 红色（FF0000） | `add_issuer_mark()` | 293 |
| 自动加"文件" | 是 | 如果没有则自动加 | `add_issuer_mark()` | 285-286 |

### 3.5 发文字号

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 对齐方式 | 居中 | 居中对齐 | `add_document_number()` | 252 |
| 段前间距 | 16 磅 | 段前间距 | `add_document_number()` | 254 |
| 段后间距 | 16 磅 | 段后间距 | `add_document_number()` | 256 |
| 字体 | 仿宋_GB2312 | 字体 | `add_document_number()` | 261 |
| 字号 | 16 磅 | 3 号字 | `add_document_number()` | 261 |

### 3.6 红色分隔线

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 对齐方式 | 居中 | 居中对齐 | `add_red_separator()` | 334 |
| 段前间距 | 8 磅 | 段前间距 | `add_red_separator()` | 336 |
| 段后间距 | 16 磅 | 段后间距 | `add_red_separator()` | 338 |
| 字符 | `'━' × 40` | 40 个横线 | `add_red_separator()` | 341 |
| 字体 | 宋体 | 字体 | `add_red_separator()` | 343 |
| 字号 | 16 磅 | 字号 | `add_red_separator()` | 343 |
| 颜色 | 红色 | 红色（FF0000） | `add_red_separator()` | 343 |

### 3.7 公文标题

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 对齐方式 | 居中 | 居中对齐 | `add_title()` | 359 |
| 段前间距 | 16 磅 | 段前间距 | `add_title()` | 361 |
| 段后间距 | 16 磅 | 段后间距 | `add_title()` | 363 |
| 字体 | 方正小标宋_GBK | 字体 | `add_title()` | 368 |
| 字号 | 22 磅 | 2 号字 | `add_title()` | 368 |
| 是否加粗 | 是 | 加粗 | `add_title()` | 368 |

### 3.8 主送机关

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 段后间距 | 8 磅 | 段后间距 | `add_recipient()` | 384 |
| 字体 | 仿宋_GB2312 | 字体 | `add_recipient()` | 389 |
| 字号 | 16 磅 | 3 号字 | `add_recipient()` | 389 |
| 后缀 | `'：'` | 全角冒号 | `add_recipient()` | 387 |

### 3.9 正文段落

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 首行缩进 | 32 磅 | 约 2 个字符 | `add_body_paragraph()` | 408 |
| 字体 | 仿宋_GB2312 | 字体 | `add_body_paragraph()` | 413 |
| 字号 | 16 磅 | 3 号字 | `add_body_paragraph()` | 413 |

### 3.10 一级标题（一、）

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 首行缩进 | 32 磅 | 约 2 个字符 | `add_heading_level1()` | 429 |
| 段前间距 | 8 磅 | 段前间距 | `add_heading_level1()` | 431 |
| 字体 | 黑体 | 字体 | `add_heading_level1()` | 436 |
| 字号 | 16 磅 | 3 号字 | `add_heading_level1()` | 436 |

### 3.11 二级标题（（一））

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 首行缩进 | 32 磅 | 约 2 个字符 | `add_heading_level2()` | 452 |
| 字体 | 楷体_GB2312 | 字体 | `add_heading_level2()` | 457 |
| 字号 | 16 磅 | 3 号字 | `add_heading_level2()` | 457 |

### 3.12 三级标题（1.）

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 首行缩进 | 32 磅 | 约 2 个字符 | `add_heading_level3()` | 473 |
| 字体 | 仿宋_GB2312 | 字体 | `add_heading_level3()` | 478 |
| 字号 | 16 磅 | 3 号字 | `add_heading_level3()` | 478 |

### 3.13 附件说明

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 段前间距 | 16 磅 | 段前间距 | `add_attachment_note()` | 498 |
| 首行缩进 | 32 磅 | 约 2 个字符 | `add_attachment_note()` | 500 |
| 前缀 | `'附件：'` | 前缀文字 | `add_attachment_note()` | 503 |
| 字体 | 仿宋_GB2312 | 字体 | `add_attachment_note()` | 505 |
| 字号 | 16 磅 | 字号 | `add_attachment_note()` | 505 |
| 多附件编号 | 是 | 1. 2. 3. ... | `add_attachment_note()` | 516-524 |

### 3.14 结尾语

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 首行缩进 | 32 磅 | 约 2 个字符 | `add_closing()` | 669 |
| 默认值 | `'特此通知。'` | 默认结尾语 | `add_closing()` | 659 |
| 字体 | 仿宋_GB2312 | 字体 | `add_closing()` | 674 |
| 字号 | 16 磅 | 字号 | `add_closing()` | 674 |

### 3.15 发文机关署名和成文日期

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 对齐方式 | 右对齐 | 右对齐 | `add_issuer_signature()` | 541, 554 |
| 右缩进 | 64 磅 | 约 4 个字符 | `add_issuer_signature()` | 543, 556 |
| 字体 | 仿宋_GB2312 | 字体 | `add_issuer_signature()` | 547, 560 |
| 字号 | 16 磅 | 字号 | `add_issuer_signature()` | 547, 560 |
| 前置空段落 | 是 | 一个空段落 | `add_issuer_signature()` | 536 |

### 3.16 附注

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 首行缩进 | 32 磅 | 约 2 个字符 | `add_note()` | 573 |
| 括号 | `'（）'` | 全角括号 | `add_note()` | 576 |
| 字体 | 仿宋_GB2312 | 字体 | `add_note()` | 578 |
| 字号 | 16 磅 | 字号 | `add_note()` | 578 |

### 3.17 抄送机关

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 前缀 | `'抄送：'` | 前缀文字 | `add_copy_send()` | 597 |
| 后缀 | `'。'` | 全角句号 | `add_copy_send()` | 602 |
| 字体 | 仿宋_GB2312 | 字体 | `add_copy_send()` | 599, 604 |
| 字号 | 14 磅 | 4 号字 | `add_copy_send()` | 599, 604 |

### 3.18 印发机关和印发日期

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 分隔空格 | 20 个 | 分隔两部分 | `add_print_info()` | 627 |
| 后缀 | `'印发'` | 后缀文字 | `add_print_info()` | 632 |
| 字体 | 仿宋_GB2312 | 字体 | `add_print_info()` | 624, 629, 634 |
| 字号 | 14 磅 | 4 号字 | `add_print_info()` | 624, 629, 634 |

### 3.19 版记分隔线

| 属性 | 当前值 | 说明 | 定义位置 | 行号 |
|------|--------|------|---------|------|
| 段前间距 | 4 磅 | 段前间距 | `_add_separator_line()` | 649 |
| 段后间距 | 4 磅 | 段后间距 | `_add_separator_line()` | 651 |
| 字符 | `'─' × 50` | 50 个横线 | `_add_separator_line()` | 654 |
| 字体 | 宋体 | 字体 | `_add_separator_line()` | 656 |
| 字号 | 8 磅 | 字号 | `_add_separator_line()` | 656 |

---

## 四、各公文类型结尾语

| 公文类型 | 结尾语 | 定义位置 |
|---------|--------|---------|
| 通知 | `'特此通知。'` | `create_notice()` - 可自定义 |
| 报告 | `'特此报告。'` | `create_report()` - 第 825 行 |
| 请示 | `'妥否，请批示。'` | `create_request()` - 第 885 行 |
| 函 | `'请予研究函复。'` | `create_letter()` - 第 936 行 |
| 纪要 | （无） | `create_minutes()` |

---

## 五、公文类型映射

| 公文类型 | 生成函数 | 定义位置 | 行号 |
|---------|---------|---------|------|
| 通知 | `create_notice` | `DOCUMENT_TYPES` | 1022 |
| 报告 | `create_report` | `DOCUMENT_TYPES` | 1023 |
| 请示 | `create_request` | `DOCUMENT_TYPES` | 1024 |
| 函 | `create_letter` | `DOCUMENT_TYPES` | 1025 |
| 纪要 | `create_minutes` | `DOCUMENT_TYPES` | 1026 |

---

## 六、修改指南

### 6.1 修改字体

**位置**：第 42-52 行

```python
# 修改前
FONT_SONGTI = '宋体'
FONT_FANGSONG = '仿宋_GB2312'
FONT_HEITI = '黑体'
FONT_KAITI = '楷体_GB2312'
FONT_XIAOBIAOSONG = '方正小标宋_GBK'

# 修改后（例如改成公司字体）
FONT_SONGTI = '微软雅黑'
FONT_FANGSONG = '微软雅黑'
FONT_HEITI = '微软雅黑 Bold'
```

---

### 6.2 修改页面格式

**位置**：`_setup_page()` 方法，第 71-94 行

```python
def _setup_page(self):
    section = self.doc.sections[0]
    section.page_width = Cm(21)      # ← 修改页面宽度
    section.page_height = Cm(29.7)   # ← 修改页面高度
    section.top_margin = Cm(3.7)      # ← 修改上边距
    section.bottom_margin = Cm(2.5)   # ← 修改下边距
    section.left_margin = Cm(2.8)     # ← 修改左边距
    section.right_margin = Cm(2.6)    # ← 修改右边距
```

---

### 6.3 修改标题格式

**位置**：`add_title()` 方法，第 348-371 行

```python
def add_title(self, title: str):
    p = self.doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(16)   # ← 修改段前间距
    p.paragraph_format.space_after = Pt(16)    # ← 修改段后间距
    
    run = p.add_run(title)
    # ← 修改字体、字号、加粗
    self._set_run_font(run, self.FONT_XIAOBIAOSONG, 22, True)
```

---

### 6.4 修改正文格式

**位置**：`_setup_styles()` 方法，第 95-114 行

```python
def _setup_styles(self):
    style = self.doc.styles['Normal']
    style.font.name = self.FONT_FANGSONG           # ← 修改字体
    style._element.rPr.rFonts.set(qn('w:eastAsia'), self.FONT_FANGSONG)
    style.font.size = Pt(16)                        # ← 修改字号
    style.paragraph_format.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE  # ← 修改行间距
```

---

### 6.5 修改发文机关标志

**位置**：`add_issuer_mark()` 方法，第 266-296 行

```python
def add_issuer_mark(self, issuer: str, is_red: bool = True):
    p = self.doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)    # ← 修改段前间距
    p.paragraph_format.space_after = Pt(16)     # ← 修改段后间距
    
    # 注释掉这行就不会自动加"文件"二字
    # if '文件' not in issuer:
    #     issuer += '文件'
    
    run = p.add_run(issuer)
    color = 'FF0000' if is_red else '000000'  # ← 修改颜色
    # ← 修改字体、字号、加粗
    self._set_run_font(run, self.FONT_XIAOBIAOSONG, 26, True, color)
```

---

## 七、快速索引

| 想要修改 | 找这个方法 | 行号 |
|---------|-----------|------|
| 字体定义 | 类属性 | 42-52 |
| 页面格式 | `_setup_page()` | 71-94 |
| 默认样式（正文） | `_setup_styles()` | 95-114 |
| 密级和保密期限 | `add_doc_classification()` | 192-218 |
| 紧急程度 | `add_urgency()` | 220-239 |
| 签发人 | `add_signer()` | 298-322 |
| 发文机关标志 | `add_issuer_mark()` | 266-296 |
| 发文字号 | `add_document_number()` | 241-264 |
| 红色分隔线 | `add_red_separator()` | 324-346 |
| 公文标题 | `add_title()` | 348-371 |
| 主送机关 | `add_recipient()` | 373-392 |
| 正文段落 | `add_body_paragraph()` | 394-416 |
| 一级标题 | `add_heading_level1()` | 418-439 |
| 二级标题 | `add_heading_level2()` | 441-460 |
| 三级标题 | `add_heading_level3()` | 462-481 |
| 附件说明 | `add_attachment_note()` | 483-525 |
| 结尾语 | `add_closing()` | 658-677 |
| 署名和日期 | `add_issuer_signature()` | 526-561 |
| 附注 | `add_note()` | 562-581 |
| 抄送机关 | `add_copy_send()` | 583-607 |
| 印发机关和日期 | `add_print_info()` | 609-637 |
| 版记分隔线 | `_add_separator_line()` | 639-657 |

---

## 八、注意事项

1. **字号换算**：
   - 16 磅 ≈ 3 号字
   - 22 磅 ≈ 2 号字
   - 32 磅 ≈ 2 个字符（首行缩进）

2. **颜色格式**：
   - 红色：`'FF0000'`
   - 黑色：`'000000'`

3. **对齐方式**：
   - 左对齐：`WD_ALIGN_PARAGRAPH.LEFT`
   - 居中：`WD_ALIGN_PARAGRAPH.CENTER`
   - 右对齐：`WD_ALIGN_PARAGRAPH.RIGHT`

4. **行间距**：
   - 1.5 倍：`WD_LINE_SPACING.ONE_POINT_FIVE`
   - 单倍：`WD_LINE_SPACING.SINGLE`
   - 双倍：`WD_LINE_SPACING.DOUBLE`

---

祝改造顺利！🎉
