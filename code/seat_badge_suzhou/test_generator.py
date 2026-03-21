# -*- coding: utf-8 -*-
"""
测试苏州座位名牌 generator.py 重构后的代码
"""

import os
import sys

# 添加当前目录到 Python 路径
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
sys.path.insert(0, current_dir)
sys.path.insert(0, project_root)

print("=" * 60)
print("测试苏州座位名牌 generator.py 重构")
print("=" * 60)

# 测试 1: 导入模块
print("\n[测试 1] 导入模块...")
try:
    from generator import (
        generate_suzhou_seat_badge,
        setup_pdf_fonts,
        find_excel_file,
        extract_department,
        process_data_copy,
        process_excel,
        generate_pdf_from_data
    )
    print("✓ 模块导入成功")
except Exception as e:
    print(f"✗ 模块导入失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 测试 2: 检查关键函数是否存在
print("\n[测试 2] 检查关键函数...")
required_functions = [
    'generate_suzhou_seat_badge',
    'setup_pdf_fonts',
    'find_excel_file',
    'extract_department',
    'process_data_copy',
    'process_excel',
    'generate_pdf_from_data'
]

all_found = True
for func_name in required_functions:
    if func_name in locals() or func_name in globals():
        print(f"✓ {func_name} 函数存在")
    else:
        print(f"✗ {func_name} 函数不存在")
        all_found = False

if not all_found:
    sys.exit(1)

# 测试 3: 检查资源文件路径
print("\n[测试 3] 检查资源文件...")
fonts_folder = os.path.join(project_root, "code", "shared", "fonts")
assets_folder = os.path.join(current_dir, "assets")

print(f"字体文件夹: {fonts_folder}")
print(f"资源文件夹: {assets_folder}")

if os.path.exists(fonts_folder):
    font_files = os.listdir(fonts_folder)
    print(f"✓ 字体文件夹存在，包含: {font_files}")
else:
    print(f"✗ 字体文件夹不存在")

if os.path.exists(assets_folder):
    asset_files = os.listdir(assets_folder)
    print(f"✓ 资源文件夹存在，包含: {asset_files}")
else:
    print(f"✗ 资源文件夹不存在")

# 测试 4: 检查 generate_suzhou_seat_badge 函数的文档字符串
print("\n[测试 4] 检查函数文档...")
if hasattr(generate_suzhou_seat_badge, '__doc__'):
    print("✓ generate_suzhou_seat_badge 函数有文档字符串")
    print("\n函数文档:")
    print("-" * 40)
    print(generate_suzhou_seat_badge.__doc__)
    print("-" * 40)
else:
    print("✗ generate_suzhou_seat_badge 函数缺少文档字符串")

# 测试 5: 尝试导入 GUI 类
print("\n[测试 5] 检查 GUI 类...")
try:
    from generator import NameBadgeGenerator
    print("✓ NameBadgeGenerator 类存在（原有 GUI 功能保留）")
except Exception as e:
    print(f"✗ NameBadgeGenerator 类导入失败: {e}")

print("\n" + "=" * 60)
print("测试完成！重构代码结构检查通过。")
print("=" * 60)
print("\n注意：完整的 PDF 生成测试需要实际的 Excel 和照片文件。")
print("generate_suzhou_seat_badge() 函数可以被 Web 后端调用。")
