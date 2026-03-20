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

# ---------------------- 路径配置（核心！只需改这一个根目录） ----------------------
# 整个文件夹的根目录（同事解压后，只需修改这里为文件夹实际路径即可）
root_dir = r"E:\AI SpaceX\employNEW-zongbu"  # 例如：同事的路径可能是 r"D:\新员工铭牌" 或 r"./"（当前文件夹）

# 以下路径自动基于根目录生成，无需修改
# 员工信息Excel表格路径（根目录+表格名）
excel_path = os.path.join(root_dir, "BaseInformation.xlsx")
# 员工照片存放的文件夹（根目录+照片子文件夹名）
photo_folder = os.path.join(root_dir, "picture")
# 新模板背景图片路径（仍命名为top.jpg，根目录+top.jpg）
top_img_path = os.path.join(root_dir, "top.jpg")  # 关键：背景图仍为top.jpg
# PDF输出的文件夹（直接使用根目录）
output_folder = root_dir

# ---------------------- 注册中文字体（解决中文乱码，字体找不到就改这里） ----------------------
# 1. 先确认你的电脑C:\Windows\Fonts文件夹里有什么中文字体（如微软雅黑、宋体、楷体）
# 2. 替换下面的字体文件名（如msyh.ttc是微软雅黑，simsun.ttc是宋体，simkai.ttc是楷体）
# 3. 注意字体文件的扩展名是.ttc还是.ttf，必须和实际文件一致！
font_file_name = "msyh.ttc"  # 字体文件名（关键！找不到字体就换这个）
font_bold_file_name = "msyhbd.ttc"  # 粗体字体文件名（可选，用于突出显示姓名）

# 拼接字体的完整路径（系统字体一般在C:\Windows\Fonts，不用改这个路径格式）
font_path = os.path.join("C:", "Windows", "Fonts", font_file_name)
font_bold_path = os.path.join("C:", "Windows", "Fonts", font_bold_file_name)

# 注册字体（第一个参数是自定义名称，后面调用字体时用这个名称；第二个参数是字体路径）
pdfmetrics.registerFont(TTFont("Chinese", font_path))  # 常规字体，命名为"Chinese"
pdfmetrics.registerFont(TTFont("Chinese-Bold", font_bold_path))  # 粗体字体，命名为"Chinese-Bold"

# ---------------------- 生成带时间戳的PDF文件名（可修改文件名格式） ----------------------
now = datetime.now()  # 获取当前时间
# 定义PDF文件名格式："新员工座位铭牌打印-年月日时分.pdf"
# 如果想改格式（如加秒），修改strftime里的参数（%S是秒）
pdf_name = f"新员工座位铭牌打印-{now.strftime('%Y%m%d%H%M')}.pdf"
# 拼接PDF的完整输出路径
pdf_path = os.path.join(output_folder, pdf_name)

# ---------------------- 读取员工信息（表格列名变了要改这里） ----------------------
# 用pandas读取Excel表格（如果是CSV文件，换成pd.read_csv，注意加encoding="utf-8"）
df = pd.read_excel(excel_path)
# 把表格转换成字典列表（每个字典对应一行员工信息）
# 注意：字典的key必须和表格的列名完全一致！如果表格列名改了（如"姓名"改成"名字"），这里会报错，需要同步修改
employees = df.to_dict("records")

# ---------------------- 初始化PDF画布（纸张大小和方向在这里改） ----------------------
# 创建PDF画布，设置纸张为A4纵向（portrait(A4)表示纵向，landscape(A4)是横向）
# 如果需要其他纸张大小（如A5），替换A4为对应的参数（如A5）
c = canvas.Canvas(pdf_path, pagesize=portrait(A4))
# 获取A4纵向的宽和高（单位是"点"，1点≈0.35毫米）
# 纵向A4尺寸固定：宽≈595点，高≈842点
page_width, page_height = portrait(A4)

# ---------------------- 铭牌布局核心参数（布局乱了主要改这里） ----------------------
# 新增：背景图与纸张左右边缘的距离（左右距离相同，单位：点）
bg_margin = 35  # 可调整（如30、50等）
# 新增：第一个背景图距离纸张上边缘的距离（单位：点）
bg_top_margin = 30  # 可调整（如40、60等）
# 新增：背景图高度（手动调整，单位：点，不再依赖比例）
bg_height = 260  # 可自定义（如250、300等，直接控制背景图高度）
# 背景图宽度（基于左右边距计算，保持左右留白均匀）
bg_width = page_width - 2 * bg_margin
# 铭牌高度与背景图高度一致（确保布局匹配）
badge_height = bg_height  # 关键：铭牌高度=背景图高度
# 姓名、工号、部门、岗位向上向下移动的距离控制
downLengh = 10
# 姓名、工号、部门、岗位向左向右移动的距离控制
rightLengh = 10
# 颜色参数：控制工号/部门/岗位文字深浅（0=纯黑，1=纯白，建议值0.1-0.3）
text_color = 0.2  # 只需修改这里，即可统一调整非姓名文字的颜色深浅

# ---------------------- 循环生成每个员工的铭牌（逐个元素调整） ----------------------
for i, emp in enumerate(employees):
    # 计算当前铭牌在页面中的位置（垂直方向）
    # i%3表示"第几个铭牌"（0=第一个，1=第二个，2=第三个）
    # y_top是当前铭牌的顶部坐标（从上往下排，考虑bg_top_margin）
    y_top = page_height - bg_top_margin - (i % 3) * badge_height  # 基于bg_top_margin和badge_height计算
    y_bottom = y_top - badge_height  # 铭牌底部坐标（顶部-高度）


    # ---------- 绘制新模板背景图（手动控制宽度和高度，不保持原比例） ----------
    # 读取背景图（仍为top.jpg）
    bg_img = ImageReader(top_img_path)
    # 绘制背景图：x=bg_margin（左边缘距离），y=y_bottom（背景图底部与铭牌底部对齐）
    # width=bg_width（基于左右边距的宽度），height=bg_height（手动设置的高度）
    # 取消preserveAspectRatio参数，允许拉伸/压缩以匹配设置的宽高
    c.drawImage(bg_img, bg_margin, y_bottom, width=bg_width, height=bg_height)

    # ---------- 插入员工照片（基于新背景图位置调整坐标） ----------
    # 拼接员工照片的完整路径（照片文件夹+表格里的"照片文件命名"）
    photo_path = os.path.join(photo_folder, emp["照片文件命名"])
    # 检查照片是否存在，不存在则使用默认bird.jpg并打印提示
    if not os.path.exists(photo_path):
        default_photo_path = os.path.join(root_dir, "bird.jpg")
        photo_path = default_photo_path
        print(f"{emp['姓名']}的照片未找到，已使用默认照片替换！")
    # 读取照片
    photo = ImageReader(photo_path)
    # 绘制照片：x=bg_margin + 40（背景图左边缘+40点，根据实际照片区域调整）
    # y=y_bottom + 45（距离铭牌底部45点，根据实际照片区域调整）
    # width=150, height=150：照片宽高（根据实际照片区域调整）
    c.drawImage(photo, bg_margin + 40, y_bottom + 45, width=150, height=150)


    # ---------- 排版文字：姓名（基于新背景图位置调整坐标） ----------
    # 设置字体：用注册的粗体字体"Chinese-Bold"，字号32（根据实际文字区域调整）
    c.setFont("Chinese-Bold", 32)  
    # 显式设置姓名颜色为纯黑（避免继承其他文字的颜色设置，确保所有姓名颜色一致）
    c.setFillColorRGB(0, 0, 0)  
    # 计算姓名居中x坐标（背景图内姓名区域的左右范围）
    # 背景图左边缘为bg_margin，假设姓名区域在背景图内x=160位置（需根据实际调整）
    name = emp["姓名"]
    name_width = c.stringWidth(name, "Chinese-Bold", 32)  # 计算姓名宽度
    name_x = bg_margin + 190 + (140 - name_width) / 2  # 居中x坐标（bg_margin+160是区域左起点，140是区域宽度）
    # 绘制文字：y坐标根据实际姓名区域调整（示例：距离铭牌底部160点，减去downLengh控制上下）
    c.drawString(bg_margin + 220 + rightLengh, y_bottom + 160 - downLengh, emp["姓名"])

    # ---------- 排版文字：工号（基于新背景图位置调整坐标） ----------
    # 标签部分：加粗+统一颜色参数（text_color）
    c.setFont("Chinese-Bold", 17)  # 标签用粗体
    c.setFillColorRGB(text_color, text_color, text_color)  # 引用颜色参数（控制深浅）
    c.drawString(bg_margin + 220 + rightLengh, y_bottom + 80 + 50 - downLengh, "工号: ")  # 冒号后加空格留间距
    # 内容部分：常规字体+同标签颜色（继承text_color）
    c.setFont("Chinese", 17)  # 内容用常规字体
    c.drawString(
        # 计算内容起始x坐标：标签起始位置 + 标签宽度（确保内容紧跟标签）
        bg_margin + 220 + rightLengh + c.stringWidth("工号: ", "Chinese-Bold", 17),
        y_bottom + 80 + 50 - downLengh,  # 与标签y坐标一致，保持同一行
        str(emp["工号"])  # 强制转换为字符串，避免类型错误
    )

    # ---------- 排版文字：部门（基于新背景图位置调整坐标） ----------
    # 标签部分：加粗+统一颜色参数（text_color）
    c.setFont("Chinese-Bold", 17)  # 标签用粗体
    c.setFillColorRGB(text_color, text_color, text_color)  # 引用颜色参数
    c.drawString(bg_margin + 220 + rightLengh, y_bottom + 50 + 50 - downLengh, "部门: ")  # 冒号后加空格留间距
    # 内容部分：常规字体+同标签颜色
    c.setFont("Chinese", 17)  # 内容用常规字体
    c.drawString(
        # 计算内容起始x坐标：标签起始位置 + 标签宽度
        bg_margin + 220 + rightLengh + c.stringWidth("部门: ", "Chinese-Bold", 17),
        y_bottom + 50 + 50 - downLengh,  # 与标签y坐标一致
        str(emp["部门"])  # 强制转换为字符串
    )

    # ---------- 排版文字：岗位（基于新背景图位置调整坐标） ----------
    # 标签部分：加粗+统一颜色参数（text_color）
    c.setFont("Chinese-Bold", 17)  # 标签用粗体
    c.setFillColorRGB(text_color, text_color, text_color)  # 引用颜色参数
    c.drawString(bg_margin + 220 + rightLengh, y_bottom + 20 + 50 - downLengh, "岗位: ")  # 冒号后加空格留间距
    # 内容部分：常规字体+同标签颜色
    c.setFont("Chinese", 17)  # 内容用常规字体
    c.drawString(
        # 计算内容起始x坐标：标签起始位置 + 标签宽度
        bg_margin + 220 + rightLengh + c.stringWidth("岗位: ", "Chinese-Bold", 17),
        y_bottom + 20 + 50 - downLengh,  # 与标签y坐标一致
        str(emp["岗位"])  # 强制转换为字符串
    )


    # ---------- 分页逻辑（每页放3个，满了就新建一页） ----------
    # (i+1) % 3 == 0：判断是否是第3、6、9...个员工
    # i != len(employees)-1：最后一个员工不新建空白页
    # 如果想每页放4个，把3改成4；放2个改成2
    if (i + 1) % 3 == 0 and i != len(employees)-1:
        c.showPage()  # 新建一页

# ---------------------- 保存PDF文件 ----------------------
c.save()  # 完成所有绘制，保存文件
# 打印生成成功的提示，显示PDF的保存路径
print(f"PDF生成成功！路径：{pdf_path}")
