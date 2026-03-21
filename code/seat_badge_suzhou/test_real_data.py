# -*- coding: utf-8 -*-
"""
使用真实数据测试重构后的代码
"""

import os
import sys
import shutil

# 添加当前目录到 Python 路径
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
sys.path.insert(0, current_dir)

print("=" * 70)
print("使用真实数据测试苏州座位名牌生成器")
print("=" * 70)

# 配置路径
data_folder = r"E:\AISpaceX\picture-新员工照片和信息表"
excel_path = os.path.join(data_folder, "list.xlsx")
output_folder = os.path.join(current_dir, "test_output")
assets_folder = os.path.join(current_dir, "assets")
fonts_folder = os.path.join(project_root, "code", "shared", "fonts")

print(f"\n数据文件夹: {data_folder}")
print(f"Excel 文件: {excel_path}")
print(f"输出文件夹: {output_folder}")
print(f"资源文件夹: {assets_folder}")
print(f"字体文件夹: {fonts_folder}")

# 创建输出文件夹
os.makedirs(output_folder, exist_ok=True)
print(f"\n输出文件夹已创建: {output_folder}")

# 检查文件是否存在
print("\n[检查文件]")
if not os.path.exists(excel_path):
    print(f"✗ Excel 文件不存在: {excel_path}")
    sys.exit(1)
print(f"✓ Excel 文件存在")

if not os.path.exists(assets_folder):
    print(f"✗ 资源文件夹不存在: {assets_folder}")
    sys.exit(1)
print(f"✓ 资源文件夹存在，包含: {os.listdir(assets_folder)}")

if not os.path.exists(fonts_folder):
    print(f"✗ 字体文件夹不存在: {fonts_folder}")
    sys.exit(1)
print(f"✓ 字体文件夹存在，包含: {os.listdir(fonts_folder)}")

# 先查看 Excel 文件内容
print("\n[读取 Excel 文件]")
import pandas as pd
try:
    df = pd.read_excel(excel_path)
    print(f"✓ Excel 文件读取成功")
    print(f"  列名: {list(df.columns)}")
    print(f"  记录数: {len(df)}")
    print(f"\n前 3 条记录:")
    print(df.head(3))
except Exception as e:
    print(f"✗ Excel 文件读取失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 导入并测试函数
print("\n" + "=" * 70)
print("开始测试 PDF 生成...")
print("=" * 70)

from generator import generate_suzhou_seat_badge

try:
    pdf_path = generate_suzhou_seat_badge(
        excel_path=excel_path,
        photo_folder=data_folder,
        output_folder=output_folder,
        assets_folder=assets_folder,
        fonts_folder=fonts_folder
    )
    
    print("\n" + "=" * 70)
    print("✓ PDF 生成成功！")
    print("=" * 70)
    print(f"\nPDF 文件路径: {pdf_path}")
    
    if os.path.exists(pdf_path):
        file_size = os.path.getsize(pdf_path) / 1024
        print(f"文件大小: {file_size:.2f} KB")
        
        # 尝试打开 PDF
        try:
            os.startfile(pdf_path)
            print("\n已尝试打开 PDF 文件...")
        except Exception as e:
            print(f"\n无法自动打开 PDF: {e}")
            print("请手动打开查看。")
    else:
        print("✗ PDF 文件不存在！")
        
except Exception as e:
    print("\n" + "=" * 70)
    print("✗ PDF 生成失败！")
    print("=" * 70)
    print(f"\n错误信息: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
print("测试完成")
print("=" * 70)
