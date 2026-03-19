# -*- coding: utf-8 -*-
"""
汇帮忙 Web 应用
"""

import os
import sys
import json
from flask import Flask, render_template, request, send_file, jsonify
from werkzeug.utils import secure_filename

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'code'))
from document_parser import parse_word_document
from document_generator import generate_document

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), '..', 'files')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

STATS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'stats.json')

def load_stats():
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
    with open(STATS_FILE, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

def increment_tool_usage(tool_id):
    stats = load_stats()
    stats["tools"][tool_id]["uses"] += 1
    stats["total_helps"] += 1
    stats["total_minutes_saved"] += stats["tools"][tool_id]["minutes_per_use"]
    save_stats(stats)
    return stats

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

CATEGORIES = ["全部", "公文工具", "铭牌工具"]

@app.route('/')
def index():
    return render_template('base.html')

@app.route('/tool/<tool_id>')
def tool_page(tool_id):
    return render_template('base.html')

@app.route('/api/document/convert', methods=['POST'])
def convert_document():
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
            output_result = generate_document('通知', content, template_path, generate_pdf=True)
            
            stats = increment_tool_usage("document")
            
            word_filename = os.path.basename(output_result['word_path'])
            pdf_filename = None
            if output_result['pdf_path']:
                pdf_filename = os.path.basename(output_result['pdf_path'])
            
            return jsonify({
                "success": True,
                "word_file": word_filename,
                "pdf_file": pdf_filename,
                "stats": stats
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/tools')
def get_tools():
    stats = load_stats()
    return jsonify({
        "tools": TOOLS,
        "categories": CATEGORIES,
        "stats": stats
    })

@app.route('/api/tool/<tool_id>')
def get_tool_detail(tool_id):
    tool = next((t for t in TOOLS if t["id"] == tool_id), None)
    if not tool:
        return jsonify({"error": "工具不存在"}), 404
    stats = load_stats()
    return jsonify({
        "tool": tool,
        "stats": stats
    })

@app.route('/download/<filename>')
def download_file(filename):
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename), as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
