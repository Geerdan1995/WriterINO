# -*- coding: utf-8 -*-
"""
演示如何调用重构后的函数
"""

import os
import sys

# 添加当前目录到 Python 路径
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
sys.path.insert(0, current_dir)

print("=" * 60)
print("演示：调用重构后的函数")
print("=" * 60)

# 导入函数
from generator import (
    generate_suzhou_seat_badge,
    setup_pdf_fonts,
    extract_department,
)

print("\n[1] 测试 extract_department 函数...")
test_cases = [
    "汇川集团/总部/流程数据与IT部",
    "人力资源部/招聘组",
    "汇川集团/总部/研发管理部/架构组",
]

for org_path in test_cases:
    dept = extract_department(org_path)
    print(f"  输入: {org_path}")
    print(f"  输出: {dept}")
    print()

print("[2] 测试 setup_pdf_fonts 函数...")
fonts_folder = os.path.join(project_root, "code", "shared", "fonts")
try:
    result = setup_pdf_fonts(fonts_folder)
    print(f"  字体注册结果: {result}")
except Exception as e:
    print(f"  字体注册异常（这在没有 GUI 时是正常的）: {e}")

print("\n[3] 函数参数示例...")
assets_folder = os.path.join(current_dir, "assets")
print(f"  assets_folder: {assets_folder}")
print(f"  fonts_folder: {fonts_folder}")

print("\n" + "=" * 60)
print("函数调用演示完成！")
print("=" * 60)
print("\n注意：完整的 PDF 生成需要：")
print("  1. 包含员工信息的 Excel 文件")
print("  2. 员工照片文件夹")
print("  3. 输出文件夹")
print("\nWeb 后端调用示例：")
print("""
from code.seat_badge_suzhou.generator import generate_suzhou_seat_badge

pdf_path = generate_suzhou_seat_badge(
    excel_path="/path/to/员工信息.xlsx",
    photo_folder="/path/to/photos",
    output_folder="/path/to/output",
    assets_folder="/path/to/code/seat_badge_suzhou/assets",
    fonts_folder="/path/to/code/shared/fonts"
)
""")
