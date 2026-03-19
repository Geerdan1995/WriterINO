# 汇帮忙 Web 应用实现计划

&gt; **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标**：构建"汇帮忙"Web 应用，包含首页、工具页面和后端 API

**架构**：
- 后端：Flask 应用，提供工具页面路由和文件上传/处理 API
- 前端：Tailwind CSS 样式 + Iconify 图标 + 原生 JavaScript 交互
- 数据存储：简单 JSON 文件存储（使用次数、累计帮助人次、累计节省时间）

**技术栈**：
- 后端：Flask, python-docx
- 前端：Tailwind CSS, Iconify
- 部署：Gunicorn + Nginx（Linux）

---

## 文件结构

### 新建文件
- `web/app.py` - Flask 主应用
- `web/templates/base.html` - 基础模板（顶部搜索栏、侧边栏）
- `web/templates/index.html` - 首页（工具卡片）
- `web/templates/tool_document.html` - 公文格式优化页面
- `web/templates/tool_meeting_badge.html` - 会议名牌生成页面（预留）
- `web/templates/tool_seat_badge.html` - 座位名牌生成页面（预留）
- `web/static/css/style.css` - 自定义 CSS（预留）
- `web/static/js/main.js` - 前端交互逻辑
- `web/data/stats.json` - 统计数据存储

### 现有文件（无需修改）
- `code/document_generator.py` - 公文生成器
- `code/document_parser.py` - 公文解析器

---

## 任务分解

### Task 1: 项目目录结构初始化

**Files:**
- Create: `web/` 目录
- Create: `web/templates/` 目录
- Create: `web/static/` 目录
- Create: `web/static/css/` 目录
- Create: `web/static/js/` 目录
- Create: `web/data/` 目录

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p web/templates
mkdir -p web/static/css
mkdir -p web/static/js
mkdir -p web/data
```

- [ ] **Step 2: 初始化 stats.json**

```json
{
  "total_helps": 0,
  "total_minutes_saved": 0,
  "tools": {
    "document": {
      "uses": 0,
      "minutes_per_use": 22
    },
    "meeting_badge": {
      "uses": 0,
      "minutes_per_use": 0
    },
    "seat_badge": {
      "uses": 0,
      "minutes_per_use": 0
    }
  }
}
```

保存到 `web/data/stats.json`

---

### Task 2: Flask 应用基础框架

**Files:**
- Create: `web/app.py`

- [ ] **Step 1: 编写 Flask 应用基础代码**

```python
# -*- coding: utf-8 -*-
"""
汇帮忙 Web 应用
"""

import os
import json
from flask import Flask, render_template, request, send_file, jsonify
from werkzeug.utils import secure_filename

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'code'))
from document_parser import parse_word_document
from document_generator import generate_document

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), '..', 'files')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# 确保上传目录存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# 统计数据文件路径
STATS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'stats.json')

def load_stats():
    """加载统计数据"""
    if os.path.exists(STATS_FILE):
        with open(STATS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        "total_helps": 0,
        "total_minutes_saved": 0,
        "tools": {
            "document": {"uses": 0, "minutes_per_use": 22},
            "meeting_badge": {"uses": 0, "minutes_per_use": 0},
            "seat_badge": {"uses": 0, "minutes_per_use": 0}
        }
    }

def save_stats(stats):
    """保存统计数据"""
    with open(STATS_FILE, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

def increment_tool_usage(tool_id):
    """增加工具使用次数"""
    stats = load_stats()
    stats["tools"][tool_id]["uses"] += 1
    stats["total_helps"] += 1
    stats["total_minutes_saved"] += stats["tools"][tool_id]["minutes_per_use"]
    save_stats(stats)
    return stats

# 工具列表
TOOLS = [
    {
        "id": "document",
        "name": "公文格式优化",
        "description": "上传Word文档，自动优化公文格式",
        "icon": "📄",
        "category": "公文工具"
    },
    {
        "id": "meeting_badge",
        "name": "会议名牌生成",
        "description": "输入姓名，生成会议名牌PDF",
        "icon": "🎫",
        "category": "铭牌工具"
    },
    {
        "id": "seat_badge",
        "name": "座位名牌生成",
        "description": "根据照片和表格，生成座位名牌PDF",
        "icon": "🪑",
        "category": "铭牌工具"
    }
]

# 分类列表
CATEGORIES = ["全部", "公文工具", "铭牌工具"]

@app.route('/')
def index():
    """首页 - 工具卡片列表"""
    stats = load_stats()
    return render_template('index.html', tools=TOOLS, categories=CATEGORIES, stats=stats)

@app.route('/tool/&lt;tool_id&gt;')
def tool_page(tool_id):
    """工具详情页"""
    tool = next((t for t in TOOLS if t["id"] == tool_id), None)
    if not tool:
        return "工具不存在", 404
    stats = load_stats()
    return render_template(f'tool_{tool_id}.html', tool=tool, stats=stats)

@app.route('/api/document/convert', methods=['POST'])
def convert_document():
    """公文格式转换 API"""
    if 'file' not in request.files:
        return jsonify({"error": "没有上传文件"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "没有选择文件"}), 400
    
    if file:
        filename = secure_filename(file.filename)
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(input_path)
        
        try:
            content = parse_word_document(input_path)
            template_path = os.path.join(os.path.dirname(__file__), '..', 'template', 'template.docx')
            output_path = generate_document('通知', content, template_path, generate_pdf=False)
            
            stats = increment_tool_usage("document")
            
            output_filename = os.path.basename(output_path)
            return jsonify({
                "success": True,
                "output_file": output_filename,
                "stats": stats
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/download/&lt;filename&gt;')
def download_file(filename):
    """下载生成的文件"""
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename), as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
```

---

### Task 3: 基础模板（base.html）

**Files:**
- Create: `web/templates/base.html`

- [ ] **Step 1: 编写基础模板**

```html
&lt;!DOCTYPE html&gt;
&lt;html lang="zh-CN"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
    &lt;title&gt;汇帮忙 - 一个能帮上小忙的工具箱&lt;/title&gt;
    &lt;script src="https://cdn.tailwindcss.com"&gt;&lt;/script&gt;
    &lt;script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;body class="bg-gray-50 min-h-screen"&gt;
    
    &lt;!-- 顶部搜索栏 --&gt;
    &lt;header class="bg-white shadow-sm border-b border-gray-200"&gt;
        &lt;div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between"&gt;
            &lt;!-- Logo 和品牌名 --&gt;
            &lt;div class="flex items-center space-x-3"&gt;
                &lt;div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"&gt;
                    &lt;span class="text-white text-xl font-bold"&gt;汇&lt;/span&gt;
                &lt;/div&gt;
                &lt;div&gt;
                    &lt;h1 class="text-xl font-bold text-gray-900"&gt;汇帮忙&lt;/h1&gt;
                    &lt;p class="text-sm text-gray-500"&gt;一个能帮上小忙的工具箱&lt;/p&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            
            &lt;!-- 搜索框 --&gt;
            &lt;div class="flex-1 max-w-xl mx-8"&gt;
                &lt;div class="relative"&gt;
                    &lt;input type="text" id="searchInput" 
                           placeholder="搜索工具..." 
                           class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"&gt;
                    &lt;div class="absolute left-3 top-2.5 text-gray-400"&gt;
                        &lt;iconify-icon icon="mdi:magnify" width="20" height="20"&gt;&lt;/iconify-icon&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            
            &lt;!-- 统计信息 --&gt;
            &lt;div class="text-right"&gt;
                &lt;p class="text-sm text-gray-600"&gt;
                    汇帮忙工具已累计帮助 
                    &lt;span class="font-bold text-blue-600" id="totalHelps"&gt;{{ stats.total_helps }}&lt;/span&gt; 人次
                &lt;/p&gt;
                &lt;p class="text-xs text-gray-500"&gt;
                    节省 &lt;span class="font-bold" id="totalMinutes"&gt;{{ stats.total_minutes_saved }}&lt;/span&gt; 分钟
                &lt;/p&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/header&gt;
    
    &lt;div class="flex max-w-7xl mx-auto"&gt;
        &lt;!-- 侧边栏 --&gt;
        &lt;aside class="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200 p-4"&gt;
            &lt;nav class="space-y-1"&gt;
                {% for category in categories %}
                &lt;button class="category-btn w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors {% if loop.first %}bg-blue-50 text-blue-600{% else %}text-gray-700{% endif %}"
                        data-category="{{ category }}"&gt;
                    &lt;div class="flex items-center space-x-2"&gt;
                        {% if category == '全部' %}
                        &lt;iconify-icon icon="mdi:apps" width="20" height="20"&gt;&lt;/iconify-icon&gt;
                        {% elif category == '公文工具' %}
                        &lt;iconify-icon icon="mdi:file-document" width="20" height="20"&gt;&lt;/iconify-icon&gt;
                        {% elif category == '铭牌工具' %}
                        &lt;iconify-icon icon="mdi:ticket-percent" width="20" height="20"&gt;&lt;/iconify-icon&gt;
                        {% endif %}
                        &lt;span&gt;{{ category }}&lt;/span&gt;
                    &lt;/div&gt;
                &lt;/button&gt;
                {% endfor %}
            &lt;/nav&gt;
        &lt;/aside&gt;
        
        &lt;!-- 主内容区域 --&gt;
        &lt;main class="flex-1 p-6"&gt;
            {% block content %}{% endblock %}
        &lt;/main&gt;
    &lt;/div&gt;
    
    &lt;script src="/static/js/main.js"&gt;&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;
```

---

### Task 4: 首页模板（index.html）

**Files:**
- Create: `web/templates/index.html`

- [ ] **Step 1: 编写首页模板**

```html
{% extends "base.html" %}

{% block content %}
&lt;div class="space-y-6"&gt;
    &lt;h2 class="text-2xl font-bold text-gray-900"&gt;全部工具&lt;/h2&gt;
    
    &lt;div id="toolGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"&gt;
        {% for tool in tools %}
        &lt;a href="/tool/{{ tool.id }}" 
           class="tool-card group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
           data-category="{{ tool.category }}"&gt;
            &lt;div class="flex items-start space-x-4"&gt;
                &lt;div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"&gt;
                    {{ tool.icon }}
                &lt;/div&gt;
                &lt;div class="flex-1"&gt;
                    &lt;h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"&gt;
                        {{ tool.name }}
                    &lt;/h3&gt;
                    &lt;p class="text-sm text-gray-500 mt-1"&gt;
                        {{ tool.description }}
                    &lt;/p&gt;
                    &lt;div class="flex items-center mt-2 text-xs text-gray-400"&gt;
                        &lt;iconify-icon icon="mdi:timer-outline" width="14" height="14" class="mr-1"&gt;&lt;/iconify-icon&gt;
                        &lt;span&gt;已使用 {{ stats.tools[tool.id].uses }} 次&lt;/span&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/a&gt;
        {% endfor %}
    &lt;/div&gt;
&lt;/div&gt;
{% endblock %}
```

---

### Task 5: 公文格式优化页面（tool_document.html）

**Files:**
- Create: `web/templates/tool_document.html`

- [ ] **Step 1: 编写公文格式优化页面**

```html
{% extends "base.html" %}

{% block content %}
&lt;div class="max-w-3xl mx-auto space-y-6"&gt;
    &lt;!-- 返回按钮 --&gt;
    &lt;a href="/" class="inline-flex items-center text-blue-600 hover:text-blue-700"&gt;
        &lt;iconify-icon icon="mdi:arrow-left" width="20" height="20" class="mr-1"&gt;&lt;/iconify-icon&gt;
        返回首页
    &lt;/a&gt;
    
    &lt;!-- 工具信息 --&gt;
    &lt;div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"&gt;
        &lt;div class="flex items-center space-x-4"&gt;
            &lt;div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-3xl"&gt;
                {{ tool.icon }}
            &lt;/div&gt;
            &lt;div&gt;
                &lt;h1 class="text-2xl font-bold text-gray-900"&gt;{{ tool.name }}&lt;/h1&gt;
                &lt;p class="text-gray-500"&gt;{{ tool.description }}&lt;/p&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    
    &lt;!-- 文件上传区域 --&gt;
    &lt;div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"&gt;
        &lt;div class="text-center"&gt;
            &lt;div id="uploadArea" 
                 class="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-blue-400 transition-colors cursor-pointer"&gt;
                &lt;div id="uploadPrompt" class="space-y-4"&gt;
                    &lt;div class="text-5xl"&gt;
                        &lt;iconify-icon icon="mdi:upload" class="mx-auto text-gray-400" width="64" height="64"&gt;&lt;/iconify-icon&gt;
                    &lt;/div&gt;
                    &lt;div&gt;
                        &lt;p class="text-gray-600"&gt;将文件拖拽到此处&lt;/p&gt;
                        &lt;p class="text-gray-400 text-sm mt-1"&gt;或者&lt;/p&gt;
                    &lt;/div&gt;
                    &lt;input type="file" id="fileInput" accept=".docx" class="hidden"&gt;
                    &lt;button id="uploadBtn" 
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"&gt;
                        点击上传文件（小于20M）
                    &lt;/button&gt;
                &lt;/div&gt;
                
                &lt;div id="fileInfo" class="hidden space-y-4"&gt;
                    &lt;div class="text-5xl"&gt;
                        &lt;iconify-icon icon="mdi:file-document" class="mx-auto text-blue-500" width="64" height="64"&gt;&lt;/iconify-icon&gt;
                    &lt;/div&gt;
                    &lt;p id="fileName" class="text-gray-900 font-medium"&gt;&lt;/p&gt;
                    &lt;button id="resetBtn" 
                            class="px-4 py-2 text-gray-600 hover:text-gray-800"&gt;
                        重新上传
                    &lt;/button&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            
            &lt;!-- 状态和按钮 --&gt;
            &lt;div class="mt-6 space-y-4"&gt;
                &lt;div id="statusText" class="text-center text-gray-600 h-6"&gt;&lt;/div&gt;
                
                &lt;div class="flex justify-center space-x-4"&gt;
                    &lt;button id="convertBtn" 
                            disabled
                            class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"&gt;
                        开始转换
                    &lt;/button&gt;
                    
                    &lt;a id="downloadBtn" 
                       href="#" 
                       class="hidden px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"&gt;
                        点击下载
                    &lt;/a&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    
    &lt;!-- 工具介绍及使用方法 --&gt;
    &lt;div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"&gt;
        &lt;h2 class="text-lg font-semibold text-gray-900 mb-4"&gt;工具介绍及使用方法&lt;/h2&gt;
        &lt;div class="space-y-4 text-gray-600"&gt;
            &lt;p&gt;公文格式优化是一款便捷的公文格式处理工具，支持将Word文档自动识别并优化为标准公文格式。&lt;/p&gt;
            &lt;ol class="list-decimal list-inside space-y-2"&gt;
                &lt;li&gt;点击"上传"按钮，选择需要优化格式的Word文档。&lt;/li&gt;
                &lt;li&gt;确认文件已上传后，点击"开始转换"按钮。&lt;/li&gt;
                &lt;li&gt;等待格式优化完成，状态显示"已完成请下载"。&lt;/li&gt;
                &lt;li&gt;点击"点击下载"按钮，将优化后的公文保存到您的设备。&lt;/li&gt;
            &lt;/ol&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;
{% endblock %}
```

---

### Task 6: 前端 JavaScript（main.js）

**Files:**
- Create: `web/static/js/main.js`

- [ ] **Step 1: 编写前端交互逻辑**

```javascript
document.addEventListener('DOMContentLoaded', function() {
    initHomePage();
    initDocumentToolPage();
});

function initHomePage() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');
    const searchInput = document.getElementById('searchInput');
    
    if (categoryBtns.length === 0) return;
    
    categoryBtns.forEach(btn =&gt; {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            categoryBtns.forEach(b =&gt; {
                b.classList.remove('bg-blue-50', 'text-blue-600');
                b.classList.add('text-gray-700');
            });
            this.classList.remove('text-gray-700');
            this.classList.add('bg-blue-50', 'text-blue-600');
            
            toolCards.forEach(card =&gt; {
                if (category === '全部' || card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            toolCards.forEach(card =&gt; {
                const name = card.querySelector('h3').textContent.toLowerCase();
                const desc = card.querySelector('p').textContent.toLowerCase();
                if (name.includes(query) || desc.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

function initDocumentToolPage() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const resetBtn = document.getElementById('resetBtn');
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusText = document.getElementById('statusText');
    
    if (!uploadArea) return;
    
    let selectedFile = null;
    
    uploadBtn.addEventListener('click', () =&gt; fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) =&gt; {
        e.preventDefault();
        uploadArea.classList.add('border-blue-400');
    });
    
    uploadArea.addEventListener('dragleave', () =&gt; {
        uploadArea.classList.remove('border-blue-400');
    });
    
    uploadArea.addEventListener('drop', (e) =&gt; {
        e.preventDefault();
        uploadArea.classList.remove('border-blue-400');
        const files = e.dataTransfer.files;
        if (files.length &gt; 0) {
            handleFileSelect(files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) =&gt; {
        if (e.target.files.length &gt; 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    function handleFileSelect(file) {
        if (!file.name.endsWith('.docx')) {
            alert('请上传 .docx 格式的文件！');
            return;
        }
        selectedFile = file;
        fileName.textContent = file.name;
        uploadPrompt.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        convertBtn.disabled = false;
    }
    
    resetBtn.addEventListener('click', () =&gt; {
        selectedFile = null;
        fileInput.value = '';
        uploadPrompt.classList.remove('hidden');
        fileInfo.classList.add('hidden');
        convertBtn.disabled = true;
        convertBtn.classList.remove('hidden');
        downloadBtn.classList.add('hidden');
        statusText.textContent = '';
    });
    
    convertBtn.addEventListener('click', async () =&gt; {
        if (!selectedFile) return;
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        convertBtn.disabled = true;
        convertBtn.textContent = '转换中，无法点击';
        statusText.textContent = '正在转换格式...';
        
        try {
            const response = await fetch('/api/document/convert', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                statusText.textContent = '已完成请下载';
                convertBtn.classList.add('hidden');
                downloadBtn.classList.remove('hidden');
                downloadBtn.href = '/download/' + result.output_file;
                
                if (result.stats) {
                    document.getElementById('totalHelps').textContent = result.stats.total_helps;
                    document.getElementById('totalMinutes').textContent = result.stats.total_minutes_saved;
                }
            } else {
                alert('转换失败：' + (result.error || '未知错误'));
                statusText.textContent = '';
                convertBtn.disabled = false;
                convertBtn.textContent = '开始转换';
            }
        } catch (error) {
            alert('网络错误，请重试');
            statusText.textContent = '';
            convertBtn.disabled = false;
            convertBtn.textContent = '开始转换';
        }
    });
}
```

---

### Task 7: 预留页面模板

**Files:**
- Create: `web/templates/tool_meeting_badge.html`
- Create: `web/templates/tool_seat_badge.html`

- [ ] **Step 1: 创建会议名牌页面（预留）**

```html
{% extends "base.html" %}

{% block content %}
&lt;div class="max-w-3xl mx-auto space-y-6"&gt;
    &lt;a href="/" class="inline-flex items-center text-blue-600 hover:text-blue-700"&gt;
        &lt;iconify-icon icon="mdi:arrow-left" width="20" height="20" class="mr-1"&gt;&lt;/iconify-icon&gt;
        返回首页
    &lt;/a&gt;
    
    &lt;div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"&gt;
        &lt;div class="flex items-center space-x-4"&gt;
            &lt;div class="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center text-3xl"&gt;
                {{ tool.icon }}
            &lt;/div&gt;
            &lt;div&gt;
                &lt;h1 class="text-2xl font-bold text-gray-900"&gt;{{ tool.name }}&lt;/h1&gt;
                &lt;p class="text-gray-500"&gt;{{ tool.description }}&lt;/p&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    
    &lt;div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"&gt;
        &lt;p class="text-gray-500"&gt;功能开发中，敬请期待...&lt;/p&gt;
    &lt;/div&gt;
&lt;/div&gt;
{% endblock %}
```

- [ ] **Step 2: 创建座位名牌页面（预留）**

```html
{% extends "base.html" %}

{% block content %}
&lt;div class="max-w-3xl mx-auto space-y-6"&gt;
    &lt;a href="/" class="inline-flex items-center text-blue-600 hover:text-blue-700"&gt;
        &lt;iconify-icon icon="mdi:arrow-left" width="20" height="20" class="mr-1"&gt;&lt;/iconify-icon&gt;
        返回首页
    &lt;/a&gt;
    
    &lt;div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"&gt;
        &lt;div class="flex items-center space-x-4"&gt;
            &lt;div class="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center text-3xl"&gt;
                {{ tool.icon }}
            &lt;/div&gt;
            &lt;div&gt;
                &lt;h1 class="text-2xl font-bold text-gray-900"&gt;{{ tool.name }}&lt;/h1&gt;
                &lt;p class="text-gray-500"&gt;{{ tool.description }}&lt;/p&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    
    &lt;div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"&gt;
        &lt;p class="text-gray-500"&gt;功能开发中，敬请期待...&lt;/p&gt;
    &lt;/div&gt;
&lt;/div&gt;
{% endblock %}
```

---

### Task 8: 测试 Flask 应用

**Files:**
- Test: `web/app.py`

- [ ] **Step 1: 运行 Flask 应用**

```bash
cd web
python app.py
```

- [ ] **Step 2: 访问首页**

打开浏览器访问 `http://localhost:5000`，检查：
- 顶部搜索栏和统计信息是否显示
- 侧边栏分类是否正常
- 工具卡片是否显示
- 搜索功能是否工作
- 分类筛选是否工作

- [ ] **Step 3: 测试公文格式优化工具**

1. 点击"公文格式优化"卡片
2. 上传一个 .docx 文件
3. 点击"开始转换"
4. 检查生成的文件是否可以下载
5. 检查统计数据是否更新

---

## 执行选项

计划完成并保存到 `mod/web-implementation-plan.md`。

**两个执行选项：**

**1. Subagent-Driven (推荐)** - 我为每个任务分派一个新的子 agent，在任务之间进行审查，快速迭代

**2. Inline Execution** - 在此会话中使用 executing-plans 执行任务，批量执行并带有审查检查点

**您选择哪种方式？**
