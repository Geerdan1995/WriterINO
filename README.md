# WriterINO - 企业办公自动化工具集

> 🚀 汇川技术企业办公自动化工具集，包括公文格式优化、会议名牌生成、座位名牌生成等功能

![GitHub Repo stars](https://img.shields.io/github/stars/Geerdan1995/WriterINO?style=social)
![GitHub forks](https://img.shields.io/github/forks/Geerdan1995/WriterINO?style=social)
![GitHub license](https://img.shields.io/github/license/Geerdan1995/WriterINO)
![GitHub last commit](https://img.shields.io/github/last-commit/Geerdan1995/WriterINO)

## 📋 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [使用说明](#使用说明)
- [开发指南](#开发指南)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 项目简介

**WriterINO** 是一个专为汇川技术设计的企业办公自动化 Web 应用，旨在帮助员工更高效地处理日常办公文档和铭牌生成工作。

项目将原本分散的桌面应用整合为统一的 Web 平台，提供：
- ✅ 智能公文格式识别与优化
- ✅ 6种模式的会议名牌生成
- ✅ 批量座位名牌生成（苏州/深圳双格式）
- ✅ 使用统计与数据追踪

---

## 功能特性

### 📄 1. 公文格式优化

| 特性 | 描述 |
|------|------|
| **智能识别** | 使用状态机模式自动识别公文元素 |
| **元素支持** | 集团名称、发文机关、发文字号、签发人、密级、标题、5级标题、正文、附件、日期等 |
| **自动排版** | 严格按照汇川技术公文格式规范自动排版 |
| **格式转换** | 支持 Word → PDF 自动转换 |

### 🎫 2. 会议名牌生成器

| 模式 | 描述 |
|------|------|
| 模式一 | 单行大字，A4 纸排 3 个 |
| 模式二 | 中文 + 拼音，A4 纸排 8 个 |
| 模式三 | 对称旋转，席卡样式 |
| 模式四 | 带横线标记 |
| 模式五 | 汇川书院讲师席卡 |
| 模式六 | 汇川书院学员胸贴 |

### 🪑 3. 座位名牌生成器

| 功能 | 描述 |
|------|------|
| **批量生成** | 支持批量生成员工座位名牌 |
| **双格式** | 支持苏州格式和深圳格式 |
| **照片集成** | 自动读取并嵌入员工照片 |
| **Excel 数据** | 从 Excel 读取员工信息 |

### 📊 4. 使用统计

- 总帮助人次统计
- 总节省时间统计
- 各工具使用次数统计

---

## 技术架构

### 后端技术栈

| 技术 | 版本/说明 |
|------|-----------|
| **Web 框架** | Flask (Python) |
| **Word 处理** | python-docx |
| **PDF 生成** | reportlab, pywin32 |
| **Excel 处理** | pandas, openpyxl |

### 前端技术栈

| 技术 | 版本/说明 |
|------|-----------|
| **框架** | 原生 JavaScript (SPA) |
| **样式** | Tailwind CSS |
| **图标** | Iconify |
| **拼音转换** | pinyin-pro |

---

## 快速开始

### 环境要求

- Python 3.8+
- Windows 系统（Word → PDF 转换需要 Microsoft Word）
- 现代浏览器（Chrome、Edge、Firefox 等）

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/Geerdan1995/WriterINO.git
   cd WriterINO
   ```

2. **创建虚拟环境**
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

3. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

4. **运行应用**
   ```bash
   cd web
   python app.py
   ```

5. **访问应用**
   
   打开浏览器访问：`http://localhost:5000`

---

## 项目结构

```
WriterINO/
├── code/                          # 核心业务代码
│   ├── document_parser.py        # 公文解析器
│   ├── document_generator.py     # 公文生成器
│   ├── seat_badge_suzhou/       # 苏州座位名牌生成
│   ├── seat_badge_shenzhen/     # 深圳座位名牌生成
│   └── shared/                   # 共享资源（字体等）
├── web/                           # Web 应用
│   ├── app.py                    # Flask 后端入口
│   ├── templates/                # HTML 模板
│   ├── static/                   # 静态资源
│   └── data/                     # 数据文件（统计）
├── mod/                           # 项目文档
│   ├── task.md                   # 任务清单
│   ├── identity.md               # 公文元素识别规则
│   └── solution.md               # 技术方案
├── template/                      # 公文模板
├── external_projects/            # 外部原始项目
├── files/                         # 输出文件目录
├── .gitignore
└── README.md                      # 本文件
```

---

## 使用说明

### 公文格式优化

1. 点击"公文格式优化"工具卡片
2. 上传需要优化格式的 Word 文档（.docx）
3. 点击"开始转换"按钮
4. 等待处理完成，下载优化后的 Word 和 PDF 文件

### 会议名牌生成

1. 点击"会议名牌生成"工具卡片
2. 在文本框中输入姓名（多个姓名用中文顿号、分隔）
3. 选择排版模式（模式一至模式六）
4. 点击"生成预览"查看效果
5. 确认无误后，点击"打印"或"保存 PDF"

### 座位名牌生成（苏州/深圳）

1. 点击"座位名牌生成(苏州)"或"座位名牌生成(深圳)"工具卡片
2. 准备包含 Excel 文件和员工照片的 ZIP 压缩包
3. 上传 ZIP 文件
4. 点击"开始生成"按钮
5. 等待处理完成，下载生成的 PDF 文件

---

## 开发指南

### 公文识别规则

公文识别采用**状态机**模式，详细规则请参考 [mod/identity.md](mod/identity.md)。

### 状态流转

```
INIT → FOUND_GROUP → FOUND_ISSUER → FOUND_DOC_NUMBER → 
FOUND_CLASSIFICATION → FOUND_TITLE → IN_BODY → 
FOUND_CLOSING → IN_ATTACHMENTS → FOUND_DATE → 
FOUND_MAIN_SEND → FOUND_COPY_SEND → DONE
```

### 添加新工具

1. 在 `web/app.py` 中添加新的 API 端点
2. 在 `web/static/js/main.js` 中添加前端页面渲染和逻辑
3. 在 `web/templates/` 中添加模板（如需要）
4. 更新 `TOOLS` 列表

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 致谢

- 感谢汇川技术提供的业务场景和需求
- 感谢所有为项目做出贡献的开发者

---

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 [Issue](https://github.com/Geerdan1995/WriterINO/issues)
- 发送邮件

---

**WriterINO** - 让办公更高效！🚀
