# 公文解析功能实现方案

## 📋 目录
- [整体流程](#整体流程)
- [文件读取方案](#文件读取方案)
- [模块设计](#模块设计)
- [识别状态机](#识别状态机)
- [输出格式](#输出格式)
- [测试方案](#测试方案)

---

## 整体流程

```
用户上传Word文档 → 读取并解析 → 智能识别各元素 → 生成content字典 → 调用generate_document → 输出格式化公文
```

---

## 文件读取方案

| 项目 | 方案 |
|------|------|
| **路径设置** | 不设固定路径，做成函数参数 |
| **读取库** | 继续使用 `python-docx`（已在用） |
| **预处理** | 过滤空行、过滤纯空格行 |

---

## 模块设计

在 `code/` 目录下新建文件 `document_parser.py`，包含以下内容：

### 函数/类列表

| 函数/类 | 功能 |
|---------|------|
| `parse_word_document(file_path)` | 主入口，读取Word并返回content字典 |
| `_filter_paragraphs(paragraphs)` | 过滤空行 |
| `_recognize_elements(paragraphs)` | 按顺序识别所有元素 |
| `_is_group_name(text)` | 判断是否集团名称 |
| `_is_issuer_mark(text)` | 判断是否发文机关标志 |
| `_is_doc_number(text)` | 判断是否发文字号 |
| `_is_signer(text)` | 判断是否签发人 |
| `_is_separator(text)` | 判断是否分隔线 |
| `_is_classification(text)` | 判断是否密级 |
| `_is_title(text)` | 判断是否公文标题 |
| `_is_heading_level1(text)` | 判断是否一级标题 |
| `_is_heading_level2(text)` | 判断是否二级标题 |
| `_is_heading_level3(text)` | 判断是否三级标题 |
| `_is_heading_level4(text)` | 判断是否四级标题 |
| `_is_heading_level5(text)` | 判断是否五级标题 |
| `_is_closing(text)` | 判断是否结尾语 |
| `_is_attachment(text)` | 判断是否附件说明 |
| `_is_date(text)` | 判断是否成文日期 |
| `_is_main_send(text)` | 判断是否主送机关 |
| `_is_copy_send(text)` | 判断是否抄送机关 |
| `_is_print_info(text)` | 判断是否印发机关/日期 |

---

## 识别状态机

为了准确识别，使用**状态机**的方式：

| 状态 | 说明 |
|------|------|
| `INIT` | 初始状态，找集团名称 |
| `FOUND_GROUP` | 找到集团名称，找发文机关标志 |
| `FOUND_ISSUER` | 找到发文机关标志，找发文字号 |
| `FOUND_DOC_NUMBER` | 找到发文字号，找分隔线 |
| `FOUND_SEPARATOR` | 找密级 |
| `FOUND_CLASSIFICATION` | 找公文标题 |
| `FOUND_TITLE` | 进入正文区域（标题+正文交替） |
| `IN_BODY` | 正文区域 |
| `FOUND_CLOSING` | 找到结尾语，找附件说明 |
| `IN_ATTACHMENTS` | 附件区域 |
| `FOUND_DATE` | 找到成文日期，找主送机关 |
| `FOUND_MAIN_SEND` | 找抄送机关（可选） |
| `FOUND_COPY_SEND` | 找印发机关/日期 |
| `DONE` | 完成 |

---

## 输出格式

识别完成后，输出的 `content` 字典格式与现有的 `generate_document` 函数完全兼容：

```python
{
    'classification': '内部公开',
    'group': '汇川技术',
    'signer': '吴泳铭',          # 可选
    'issuer': '事业群办公室',
    'doc_number': '阿里集团〔2025〕6号',
    'title': '关于成立...的通知',
    'body': [...],              # 正文列表
    'closing': '特此通知。',
    'attachments': [...],        # 可选
    'date': '2025年3月16日',
    'main_send': '各事业群、各部门',
    'copy_to': '集团董事局',     # 可选
    'print_org': '集团总裁办公室',
    'print_date': '2025年3月16日'
}
```

---

## 测试方案

### 测试文件
使用示例文档进行测试：
```
e:\97、新一轮AI探索\WriterINO\汇川总裁办〔2022〕1号 关于规范集团内部常用公文格式及发文审批流程的通知.docx
```

### 测试步骤
1. 读取示例文档
2. 调用 `parse_word_document()` 函数
3. 验证输出的 `content` 字典是否正确
4. 将 `content` 传递给 `generate_document()` 函数
5. 检查生成的公文格式是否正确

---

## 识别规则补充

### 公文标题识别特殊规则

**重要：公文标题可能跨多行，需要拼接！**

| 规则 | 说明 |
|------|------|
| **开始标志** | 以"关于"开头 |
| **结束标志** | 以"的通知"、"的公示"或"的通报"结尾 |
| **拼接方式** | 将从"关于"开始到结束标志之间的所有行拼接起来 |

**示例：**
```
第1行：关于规范集团内部常用公文格式及
第2行：发文审批流程的通知
↓
拼接为：关于规范集团内部常用公文格式及发文审批流程的通知
```

---

## 识别规则参考

详细的识别规则请参考 `identity.md` 文件。
