# 导入必要的库：
# pandas：用于读取Excel表格数据
# reportlab：用于生成PDF和排版（canvas是画布，pagesize定义纸张大小，ImageReader处理图片）
# pdfmetrics和TTFont：用于注册中文字体，解决中文显示问题
# datetime：获取当前时间，用于生成带时间戳的PDF文件名
# os：处理文件路径，确保不同系统路径格式兼容
import pandas as pd
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, portrait
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
import os
import sys


# ========== 纯业务逻辑函数（可被 Web 后端调用） ==========

def setup_pdf_fonts(fonts_folder):
    """配置PDF中文字体"""
    try:
        font_file = "msyh.ttc"
        font_bold_file = "msyhbd.ttc"
        
        font_path = os.path.join(fonts_folder, font_file)
        font_bold_path = os.path.join(fonts_folder, font_bold_file)
        
        if not os.path.exists(font_path):
            sys_font_path = os.path.join("C:", "Windows", "Fonts")
            font_path = os.path.join(sys_font_path, font_file)
        if not os.path.exists(font_bold_path):
            sys_font_path = os.path.join("C:", "Windows", "Fonts")
            font_bold_path = os.path.join(sys_font_path, font_bold_file)
        
        pdfmetrics.registerFont(TTFont("Chinese", font_path))
        pdfmetrics.registerFont(TTFont("Chinese-Bold", font_bold_path))
        return True
    except Exception as e:
        print(f"字体注册警告: {str(e)}")
        return False


def extract_department(org_path, department_list=None):
    """从组织全路径中提取部门信息"""
    if not isinstance(org_path, str):
        return ""
    
    if org_path.startswith("汇川集团"):
        parts = org_path.split("/")
        if "总部" in parts:
            总部索引 = parts.index("总部")
            if 总部索引 + 1 < len(parts):
                return parts[总部索引 + 1]
    else:
        if "/" in org_path:
            return org_path.split("/")[0]
    
    return org_path


def process_data_in_memory(excel_path, department_list=None):
    """
    在内存中处理Excel数据，生成员工信息列表（不生成中间文件）
    
    参数:
        excel_path: 原始Excel文件路径
        department_list: 预设部门列表（可选）
    
    返回:
        员工信息列表（dict格式）
    """
    source_df = pd.read_excel(excel_path)
    required_cols = ["姓名", "预入职工号", "岗位", "组织全路径"]
    for col in required_cols:
        if col not in source_df.columns:
            raise Exception(f"原始Excel缺少列: {col}")
    
    employees = []
    for _, row in source_df.iterrows():
        name = row["姓名"]
        emp_id = row["预入职工号"]
        position = row["岗位"]
        org_path = row["组织全路径"]
        
        department = extract_department(org_path, department_list)
        
        # 生成照片文件名
        photo_name = f"{emp_id}.jpg" if emp_id else ""
        
        employees.append({
            "姓名": name,
            "工号": emp_id,
            "岗位": position,
            "部门": department,
            "照片文件命名": photo_name
        })
    
    return employees


def generate_shenzhen_seat_badge(excel_path, photo_folder, output_folder, assets_folder, fonts_folder):
    """
    生成深圳座位名牌的主函数（可被 Web 后端调用）
    
    参数:
        excel_path: Excel文件路径（包含员工信息）
        photo_folder: 员工照片文件夹路径
        output_folder: 输出文件夹路径
        assets_folder: 资源文件夹路径（包含 top.jpg, bird.jpg）
        fonts_folder: 字体文件夹路径（包含 msyh.ttc, msyhbd.ttc）
    
    返回:
        生成的 PDF 文件路径
    """
    setup_pdf_fonts(fonts_folder)
    
    top_img_path = os.path.join(assets_folder, "top.jpg")
    default_photo_path = os.path.join(assets_folder, "bird.jpg")
    
    if not os.path.exists(top_img_path):
        raise Exception(f"未找到top.jpg")
    if not os.path.exists(excel_path):
        raise Exception(f"未找到Excel文件")
    
    # 在内存中处理数据，不生成中间文件
    employees = process_data_in_memory(excel_path)
    if not employees:
        raise Exception("未找到员工信息")
    
    timestamp = datetime.now().strftime("%Y%m%d%H%M")
    pdf_name = f"新员工座位铭牌打印-{timestamp}.pdf"
    pdf_path = os.path.join(output_folder, pdf_name)
    
    c = canvas.Canvas(pdf_path, pagesize=portrait(A4))
    page_width, page_height = portrait(A4)
    
    bg_margin = 35
    bg_top_margin = 30
    bg_height = 260
    bg_width = page_width - 2 * bg_margin
    badge_height = bg_height
    downLengh = 10
    rightLengh = 10
    text_color = 0.2
    
    for i, emp in enumerate(employees):
        y_top = page_height - bg_top_margin - (i % 3) * badge_height
        y_bottom = y_top - badge_height
        
        bg_img = ImageReader(top_img_path)
        c.drawImage(bg_img, bg_margin, y_bottom, width=bg_width, height=bg_height)
        
        photo_path = os.path.join(photo_folder, emp["照片文件命名"])
        if not os.path.exists(photo_path):
            if os.path.exists(default_photo_path):
                photo_path = default_photo_path
                print(f"{emp['姓名']}的照片未找到，已使用默认照片替换！")
            else:
                continue
        
        photo = ImageReader(photo_path)
        c.drawImage(photo, bg_margin + 40, y_bottom + 45, width=150, height=150)
        
        c.setFont("Chinese-Bold", 32)
        c.setFillColorRGB(0, 0, 0)
        c.drawString(bg_margin + 220 + rightLengh, y_bottom + 160 - downLengh, emp["姓名"])
        
        c.setFont("Chinese-Bold", 17)
        c.setFillColorRGB(text_color, text_color, text_color)
        c.drawString(bg_margin + 220 + rightLengh, y_bottom + 80 + 50 - downLengh, "工号: ")
        c.setFont("Chinese", 17)
        c.drawString(
            bg_margin + 220 + rightLengh + c.stringWidth("工号: ", "Chinese-Bold", 17),
            y_bottom + 80 + 50 - downLengh,
            str(emp["工号"])
        )
        
        c.setFont("Chinese-Bold", 17)
        c.setFillColorRGB(text_color, text_color, text_color)
        c.drawString(bg_margin + 220 + rightLengh, y_bottom + 50 + 50 - downLengh, "部门: ")
        c.setFont("Chinese", 17)
        c.drawString(
            bg_margin + 220 + rightLengh + c.stringWidth("部门: ", "Chinese-Bold", 17),
            y_bottom + 50 + 50 - downLengh,
            str(emp["部门"])
        )
        
        c.setFont("Chinese-Bold", 17)
        c.setFillColorRGB(text_color, text_color, text_color)
        c.drawString(bg_margin + 220 + rightLengh, y_bottom + 20 + 50 - downLengh, "岗位: ")
        c.setFont("Chinese", 17)
        c.drawString(
            bg_margin + 220 + rightLengh + c.stringWidth("岗位: ", "Chinese-Bold", 17),
            y_bottom + 20 + 50 - downLengh,
            str(emp["岗位"])
        )
        
        if (i + 1) % 3 == 0 and i != len(employees) - 1:
            c.showPage()
    
    c.save()
    return pdf_path


# ========== 以下为保留原有功能的代码 ==========

def generate_original():
    """保留原有脚本功能（硬编码路径版本）"""
    root_dir = r"E:\AI SpaceX\employNEW-zongbu"
    excel_path = os.path.join(root_dir, "BaseInformation.xlsx")
    photo_folder = os.path.join(root_dir, "picture")
    top_img_path = os.path.join(root_dir, "top.jpg")
    output_folder = root_dir
    
    font_file_name = "msyh.ttc"
    font_bold_file_name = "msyhbd.ttc"
    font_path = os.path.join("C:", "Windows", "Fonts", font_file_name)
    font_bold_path = os.path.join("C:", "Windows", "Fonts", font_bold_file_name)
    
    pdfmetrics.registerFont(TTFont("Chinese", font_path))
    pdfmetrics.registerFont(TTFont("Chinese-Bold", font_bold_path))
    
    now = datetime.now()
    pdf_name = f"新员工座位铭牌打印-{now.strftime('%Y%m%d%H%M')}.pdf"
    pdf_path = os.path.join(output_folder, pdf_name)
    
    df = pd.read_excel(excel_path)
    employees = df.to_dict("records")
    
    c = canvas.Canvas(pdf_path, pagesize=portrait(A4))
    page_width, page_height = portrait(A4)
    
    bg_margin = 35
    bg_top_margin = 30
    bg_height = 260
    bg_width = page_width - 2 * bg_margin
    badge_height = bg_height
    downLengh = 10
    rightLengh = 10
    text_color = 0.2
    
    for i, emp in enumerate(employees):
        y_top = page_height - bg_top_margin - (i % 3) * badge_height
        y_bottom = y_top - badge_height
        
        bg_img = ImageReader(top_img_path)
        c.drawImage(bg_img, bg_margin, y_bottom, width=bg_width, height=bg_height)
        
        photo_path = os.path.join(photo_folder, emp["照片文件命名"])
        if not os.path.exists(photo_path):
            default_photo_path = os.path.join(root_dir, "bird.jpg")
            photo_path = default_photo_path
            print(f"{emp['姓名']}的照片未找到，已使用默认照片替换！")
        
        photo = ImageReader(photo_path)
        c.drawImage(photo, bg_margin + 40, y_bottom + 45, width=150, height=150)
        
        c.setFont("Chinese-Bold", 32)
        c.setFillColorRGB(0, 0, 0)
        c.drawString(bg_margin + 220 + rightLengh, y_bottom + 160 - downLengh, emp["姓名"])
        
        c.setFont("Chinese-Bold", 17)
        c.setFillColorRGB(text_color, text_color, text_color)
        c.drawString(bg_margin + 220 + rightLengh, y_bottom + 80 + 50 - downLengh, "工号: ")
        c.setFont("Chinese", 17)
        c.drawString(
            bg_margin + 220 + rightLengh + c.stringWidth("工号: ", "Chinese-Bold", 17),
            y_bottom + 80 + 50 - downLengh,
            str(emp["工号"])
        )
        
        c.setFont("Chinese-Bold", 17)
        c.setFillColorRGB(text_color, text_color, text_color)
        c.drawString(bg_margin + 220 + rightLengh, y_bottom + 50 + 50 - downLengh, "部门: ")
        c.setFont("Chinese", 17)
        c.drawString(
            bg_margin + 220 + rightLengh + c.stringWidth("部门: ", "Chinese-Bold", 17),
            y_bottom + 50 + 50 - downLengh,
            str(emp["部门"])
        )
        
        c.setFont("Chinese-Bold", 17)
        c.setFillColorRGB(text_color, text_color, text_color)
        c.drawString(bg_margin + 220 + rightLengh, y_bottom + 20 + 50 - downLengh, "岗位: ")
        c.setFont("Chinese", 17)
        c.drawString(
            bg_margin + 220 + rightLengh + c.stringWidth("岗位: ", "Chinese-Bold", 17),
            y_bottom + 20 + 50 - downLengh,
            str(emp["岗位"])
        )
        
        if (i + 1) % 3 == 0 and i != len(employees) - 1:
            c.showPage()
    
    c.save()
    print(f"PDF生成成功！路径：{pdf_path}")


# 程序入口（当直接运行该脚本时执行）
if __name__ == "__main__":
    generate_original()
