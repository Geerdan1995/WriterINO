# -*- coding: utf-8 -*-
"""
测试完整流程：读取Word文档 → 解析 → 生成新公文
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'code'))

from document_parser import parse_word_document
from document_generator import generate_document


def write_dict_to_file(content, file_path):
    """
    将字典内容写入到Python文件
    
    参数说明：
    - content: 要写入的字典
    - file_path: 目标文件路径
    """
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('# -*- coding: utf-8 -*-\n')
        f.write('"""\n')
        f.write('公文解析结果\n\n')
        f.write('这个文件存储从 Word 文档解析出来的结果\n')
        f.write('"""\n\n')
        f.write('# 解析结果\n')
        f.write('result = {\n')
        
        for key, value in content.items():
            if isinstance(value, str):
                f.write(f"    '{key}': '{value}',\n")
            elif isinstance(value, list):
                f.write(f"    '{key}': [\n")
                for item in value:
                    f.write(f"        '{item}',\n")
                f.write(f"    ],\n")
            elif value is None:
                f.write(f"    '{key}': None,\n")
            else:
                f.write(f"    '{key}': {value},\n")
        
        f.write('}\n')


if __name__ == '__main__':
    # 1. 读取并解析示例文档
    test_file = r'E:\97、新一轮AI探索\WriterINO\汇川总裁办〔2022〕1号 关于规范集团内部常用公文格式及发文审批流程的通知.docx'
    
    print('=' * 60)
    print('步骤 1/3：解析 Word 文档...')
    print('=' * 60)
    content = parse_word_document(test_file)
    
    print('\n解析结果：')
    print('-' * 60)
    for key, value in content.items():
        print(f'{key}: {value}')
    
    # 2. 将解析结果写入到 parserResult.py
    result_file = r'E:\97、新一轮AI探索\WriterINO\mod\parserResult.py'
    write_dict_to_file(content, result_file)
    
    print(f'\n解析结果已写入到：{result_file}')
    
    # 3. 调用公文生成器
    print('\n' + '=' * 60)
    print('步骤 2/3：生成格式化公文...')
    print('=' * 60)
    
    template_path = r'E:\97、新一轮AI探索\WriterINO\template\template.docx'
    output_path = generate_document('通知', content, template_path, generate_pdf=False)
    
    # 4. 完成
    print('\n' + '=' * 60)
    print('步骤 3/3：完成！')
    print('=' * 60)
    print(f'公文已生成：{output_path}')
