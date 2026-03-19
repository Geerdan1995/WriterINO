# -*- coding: utf-8 -*-
"""
调试脚本 - 查看Word文档的段落原始内容
"""

from docx import Document

test_file = r'E:\97、新一轮AI探索\WriterINO\汇川总裁办〔2022〕1号 关于规范集团内部常用公文格式及发文审批流程的通知.docx'

doc = Document(test_file)

print('=' * 80)
print('文档段落原始内容（包含索引）：')
print('=' * 80)
for i, para in enumerate(doc.paragraphs):
    text = para.text
    print(f'[{i:3d}] {repr(text)}')
print('=' * 80)
