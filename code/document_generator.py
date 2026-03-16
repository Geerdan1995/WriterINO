# -*- coding: utf-8 -*-
"""
党政机关公文生成器
符合 GB/T 9704-2012《党政机关公文格式》国家标准

这个文件是公文生成的核心模块，负责创建Word文档并设置格式
"""

# 导入系统模块，用于处理系统相关的功能
import sys
# 导入io模块，用于处理输入输出编码
import io
# 导入datetime模块，用于处理日期时间
from datetime import datetime
# 导入类型提示模块，让代码更清晰
from typing import Dict, List, Optional

# 设置标准输出的编码为UTF-8，防止中文乱码
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 导入python-docx库的Document类，用于创建Word文档
from docx import Document
# 导入python-docx库的单位类，用于设置字体大小、页边距等
from docx.shared import Pt, Cm, Twips, RGBColor
# 导入文本对齐和行间距的枚举类型
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
# 导入表格对齐的枚举类型
from docx.enum.table import WD_TABLE_ALIGNMENT
# 导入XML命名空间相关的工具，用于设置中文字体
from docx.oxml.ns import qn, nsmap
# 导入XML元素创建工具
from docx.oxml import OxmlElement


class OfficialDocumentGenerator:
    """
    党政机关公文生成器类
    
    这是整个项目的核心类，负责创建Word文档并按照国家标准设置格式
    """
    
    # ========== 字体定义 ==========
    # 定义宋体字体名称，用于页码
    FONT_SONGTI = '宋体'
    # 定义仿宋_GB2312字体名称，用于正文、发文字号
    FONT_FANGSONG = '仿宋_GB2312'
    # 定义黑体字体名称，用于一级标题、密级
    FONT_HEITI = '黑体'
    # 定义楷体_GB2312字体名称，用于二级标题、签发人姓名
    FONT_KAITI = '楷体_GB2312'
    # 定义方正小标宋_GBK字体名称，用于发文机关标志、标题
    FONT_XIAOBIAOSONG = '方正小标宋_GBK'
    
    # 初始化公文生成器
    def __init__(self):
        """
        初始化公文生成器
        
        当创建这个类的实例时，会自动执行以下操作：
        1. 创建一个新的Word文档
        2. 设置页面格式（纸张大小、页边距等）
        3. 设置文档默认样式
        """
        # 创建一个新的Word文档对象
        self.doc = Document()
        # 调用方法设置页面格式
        self._setup_page()
        # 调用方法设置文档样式
        self._setup_styles()
    
    # 设置页面格式（私有方法）
    def _setup_page(self):
        """
        设置页面格式（私有方法）
        
        按照GB/T 9704-2012标准设置：
        - 纸张大小：A4 (210mm × 297mm)
        - 页边距：天头37mm、订口28mm、下白边25mm、右白边26mm
        """
        # 获取文档的第一个（也是唯一一个）节（section）
        section = self.doc.sections[0]
        # 设置页面宽度为21厘米（A4纸宽度）
        section.page_width = Cm(21)
        # 设置页面高度为29.7厘米（A4纸高度）
        section.page_height = Cm(29.7)
        # 设置上边距（天头）为3.7厘米
        section.top_margin = Cm(3.7)
        # 设置下边距为2.5厘米
        section.bottom_margin = Cm(2.5)
        # 设置左边距（订口）为2.8厘米
        section.left_margin = Cm(2.8)
        # 设置右边距（切口）为2.6厘米
        section.right_margin = Cm(2.6)
    
    # 设置文档默认样式（私有方法）
    def _setup_styles(self):
        """
        设置文档默认样式（私有方法）
        
        设置Normal（正文）样式：
        - 字体：仿宋_GB2312
        - 字号：16磅（相当于3号字）
        - 行间距：1.5倍
        """
        # 获取Normal样式（默认正文样式）
        style = self.doc.styles['Normal']
        # 设置字体名称为仿宋_GB2312
        style.font.name = self.FONT_FANGSONG
        # 设置中文字体（这一步很重要，因为Word对中文字体需要特殊处理）
        style._element.rPr.rFonts.set(qn('w:eastAsia'), self.FONT_FANGSONG)
        # 设置字体大小为16磅（3号字）
        style.font.size = Pt(16)
        # 设置行间距为1.5倍
        style.paragraph_format.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
    
    # 设置文本的字体格式（私有方法）
    def _set_run_font(self, run, font_name: str, font_size: int, bold: bool = False, color: str = '000000'):
        """
        设置文本的字体格式（私有方法）
        
        参数说明：
        - run: Word中的文本运行对象（一段文字的一部分）
        - font_name: 字体名称
        - font_size: 字体大小（磅值）
        - bold: 是否加粗（True=加粗，False=不加粗）
        - color: 字体颜色（十六进制，如'FF0000'表示红色）
        """
        # 设置字体名称
        run.font.name = font_name
        # 设置中文字体（处理中文字体的特殊要求）
        run._element.rPr.rFonts.set(qn('w:eastAsia'), font_name)
        # 设置字体大小
        run.font.size = Pt(font_size)
        # 设置是否加粗
        run.font.bold = bold
        # 如果颜色不是黑色（'000000'），则设置颜色
        if color != '000000':
            # 将十六进制颜色字符串转换为RGB颜色对象并设置
            run.font.color.rgb = RGBColor.from_string(color)
    
    # 添加一个带格式的段落（私有方法）
    def _add_paragraph_with_font(self, text: str, font_name: str, font_size: int, 
                                   alignment=WD_ALIGN_PARAGRAPH.LEFT, bold: bool = False,
                                   first_line_indent: int = 0, color: str = '000000',
                                   space_before: int = 0, space_after: int = 0):
        """
        添加一个带格式的段落（私有方法）
        
        这是一个通用方法，用于创建各种格式的段落
        
        参数说明：
        - text: 段落的文字内容
        - font_name: 字体名称
        - font_size: 字体大小（磅值）
        - alignment: 对齐方式（左对齐、居中、右对齐）
        - bold: 是否加粗
        - first_line_indent: 首行缩进（磅值，32磅约等于2个字符）
        - color: 字体颜色
        - space_before: 段前间距（磅值）
        - space_after: 段后间距（磅值）
        
        返回值：
        - 创建好的段落对象
        """
        # 在文档中添加一个新段落
        p = self.doc.add_paragraph()
        # 设置段落的对齐方式
        p.alignment = alignment
        
        # 如果设置了首行缩进，则应用首行缩进
        if first_line_indent > 0:
            p.paragraph_format.first_line_indent = Pt(first_line_indent)
        
        # 如果设置了段前间距，则应用段前间距
        if space_before > 0:
            p.paragraph_format.space_before = Pt(space_before)
        
        # 如果设置了段后间距，则应用段后间距
        if space_after > 0:
            p.paragraph_format.space_after = Pt(space_after)
        
        # 如果有文字内容，则添加文字并设置格式
        if text:
            # 在段落中添加文字（run是Word中一段文字的一部分）
            run = p.add_run(text)
            # 调用前面的方法设置字体格式
            self._set_run_font(run, font_name, font_size, bold, color)
        
        # 返回创建好的段落对象
        return p
    
    # 添加密级和保密期限
    def add_doc_classification(self, classification: str, period: str = None):
        """
        添加密级和保密期限
        
        参数说明：
        - classification: 密级（秘密/机密/绝密）
        - period: 保密期限（可选，如'1年'）
        """
        # 拼接密级和保密期限的文字
        text = classification
        # 如果提供了保密期限，则加上★和保密期限
        if period:
            text += '★' + period
        
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置左对齐
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        
        # 添加文字
        run = p.add_run(text)
        # 设置字体为黑体，16磅（3号字）
        self._set_run_font(run, self.FONT_HEITI, 16, False)
        
        # 返回段落对象
        return p
    
    # 添加紧急程度
    def add_urgency(self, urgency: str):
        """
        添加紧急程度
        
        参数说明：
        - urgency: 紧急程度（平急/加急/特急）
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置左对齐
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        
        # 添加文字
        run = p.add_run(urgency)
        # 设置字体为黑体，16磅（3号字）
        self._set_run_font(run, self.FONT_HEITI, 16, False)
        
        # 返回段落对象
        return p
    
    # 添加发文字号
    def add_document_number(self, doc_number: str):
        """
        添加发文字号
        
        参数说明：
        - doc_number: 发文字号，如"沈数据〔2026〕1号"
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置居中对齐
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        # 设置段前间距16磅
        p.paragraph_format.space_before = Pt(16)
        # 设置段后间距16磅
        p.paragraph_format.space_after = Pt(16)
        
        # 添加文字
        run = p.add_run(doc_number)
        # 设置字体为仿宋_GB2312，16磅（3号字）
        self._set_run_font(run, self.FONT_FANGSONG, 16, False)
        
        # 返回段落对象
        return p
    
    # 添加发文机关标志
    def add_issuer_mark(self, issuer: str, is_red: bool = True):
        """
        添加发文机关标志
        
        参数说明：
        - issuer: 发文机关名称，如"XXX公司"
        - is_red: 是否用红色（True=红色，False=黑色），默认红色
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置居中对齐
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        # 设置段前间距0磅
        p.paragraph_format.space_before = Pt(0)
        # 设置段后间距16磅
        p.paragraph_format.space_after = Pt(16)
        
        # 如果发文机关名称中没有"文件"二字，则自动加上
        if '文件' not in issuer:
            issuer += '文件'
        
        # 添加文字
        run = p.add_run(issuer)
        # 根据参数决定颜色，红色是'FF0000'，黑色是'000000'
        color = 'FF0000' if is_red else '000000'
        # 设置字体为方正小标宋_GBK，26磅，加粗
        self._set_run_font(run, self.FONT_XIAOBIAOSONG, 26, True, color)
        
        # 返回段落对象
        return p
    
    # 添加签发人（上行文专用，如报告、请示）
    def add_signer(self, signer_name: str):
        """
        添加签发人（上行文专用，如报告、请示）
        
        参数说明：
        - signer_name: 签发人姓名
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置右对齐
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        
        # 添加"签发人："文字
        run1 = p.add_run('签发人：')
        # 设置字体为仿宋_GB2312，16磅
        self._set_run_font(run1, self.FONT_FANGSONG, 16, False)
        
        # 添加签发人姓名
        run2 = p.add_run(signer_name)
        # 设置字体为楷体_GB2312，16磅
        self._set_run_font(run2, self.FONT_KAITI, 16, False)
        
        # 返回段落对象
        return p
    
    # 添加红色分隔线（版头分隔线）
    def add_red_separator(self):
        """
        添加红色分隔线（版头分隔线）
        
        在发文机关标志和发文字号下方添加一条红色的横线
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置居中对齐
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        # 设置段前间距8磅
        p.paragraph_format.space_before = Pt(8)
        # 设置段后间距16磅
        p.paragraph_format.space_after = Pt(16)
        
        # 添加40个"━"字符来模拟分隔线
        run = p.add_run('━' * 40)
        # 设置字体为宋体，16磅，红色
        self._set_run_font(run, self.FONT_SONGTI, 16, False, 'FF0000')
        
        # 返回段落对象
        return p
    
    # 添加公文标题
    def add_title(self, title: str):
        """
        添加公文标题
        
        参数说明：
        - title: 公文标题，如"关于开展安全生产的通知"
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置居中对齐
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        # 设置段前间距16磅
        p.paragraph_format.space_before = Pt(16)
        # 设置段后间距16磅
        p.paragraph_format.space_after = Pt(16)
        
        # 添加标题文字
        run = p.add_run(title)
        # 设置字体为方正小标宋_GBK，22磅（2号字），加粗
        self._set_run_font(run, self.FONT_XIAOBIAOSONG, 22, True)
        
        # 返回段落对象
        return p
    
    # 添加主送机关
    def add_recipient(self, recipient: str):
        """
        添加主送机关
        
        参数说明：
        - recipient: 主送机关名称，如"各部门、各子公司"
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置段后间距8磅
        p.paragraph_format.space_after = Pt(8)
        
        # 添加主送机关文字，后面加上全角冒号
        run = p.add_run(recipient + '：')
        # 设置字体为仿宋_GB2312，16磅（3号字）
        self._set_run_font(run, self.FONT_FANGSONG, 16, False)
        
        # 返回段落对象
        return p
    
    # 添加正文段落
    def add_body_paragraph(self, text: str, first_line_indent: int = 32):
        """
        添加正文段落
        
        参数说明：
        - text: 正文文字内容
        - first_line_indent: 首行缩进（磅值），默认32磅（约2个字符）
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        
        # 如果设置了首行缩进，则应用
        if first_line_indent > 0:
            p.paragraph_format.first_line_indent = Pt(first_line_indent)
        
        # 添加文字
        run = p.add_run(text)
        # 设置字体为仿宋_GB2312，16磅（3号字）
        self._set_run_font(run, self.FONT_FANGSONG, 16, False)
        
        # 返回段落对象
        return p
    
    # 添加一级标题（格式：一、）
    def add_heading_level1(self, text: str):
        """
        添加一级标题（格式：一、）
        
        参数说明：
        - text: 标题文字，如"一、工作目标"
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置首行缩进32磅（2个字符）
        p.paragraph_format.first_line_indent = Pt(32)
        # 设置段前间距8磅
        p.paragraph_format.space_before = Pt(8)
        
        # 添加文字
        run = p.add_run(text)
        # 设置字体为黑体，16磅（3号字）
        self._set_run_font(run, self.FONT_HEITI, 16, False)
        
        # 返回段落对象
        return p
    
    # 添加二级标题（格式：（一））
    def add_heading_level2(self, text: str):
        """
        添加二级标题（格式：（一））
        
        参数说明：
        - text: 标题文字，如"（一）主要内容"
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置首行缩进32磅（2个字符）
        p.paragraph_format.first_line_indent = Pt(32)
        
        # 添加文字
        run = p.add_run(text)
        # 设置字体为楷体_GB2312，16磅（3号字）
        self._set_run_font(run, self.FONT_KAITI, 16, False)
        
        # 返回段落对象
        return p
    
    # 添加三级标题（格式：1.）
    def add_heading_level3(self, text: str):
        """
        添加三级标题（格式：1.）
        
        参数说明：
        - text: 标题文字，如"1. 具体要求"
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置首行缩进32磅（2个字符）
        p.paragraph_format.first_line_indent = Pt(32)
        
        # 添加文字
        run = p.add_run(text)
        # 设置字体为仿宋_GB2312，16磅（3号字）
        self._set_run_font(run, self.FONT_FANGSONG, 16, False)
        
        # 返回段落对象
        return p
    
    # 添加附件说明
    def add_attachment_note(self, attachments: List[str]):
        """
        添加附件说明
        
        参数说明：
        - attachments: 附件名称列表，如['互联网服务信息登记表']
        """
        # 如果附件列表为空，则不做任何操作
        if not attachments:
            return
        
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置段前间距16磅
        p.paragraph_format.space_before = Pt(16)
        # 设置首行缩进32磅（2个字符）
        p.paragraph_format.first_line_indent = Pt(32)
        
        # 添加"附件："文字
        run = p.add_run('附件：')
        # 设置字体为仿宋_GB2312，16磅
        self._set_run_font(run, self.FONT_FANGSONG, 16, False)
        
        # 如果只有一个附件
        if len(attachments) == 1:
            # 直接在同一行添加附件名称
            run2 = p.add_run(attachments[0])
            # 设置字体为仿宋_GB2312，16磅
            self._set_run_font(run2, self.FONT_FANGSONG, 16, False)
        else:
            # 如果有多个附件，每个附件单独一行
            # 遍历附件列表，从1开始编号
            for i, att in enumerate(attachments, 1):
                # 添加新段落
                p2 = self.doc.add_paragraph()
                # 设置首行缩进32磅
                p2.paragraph_format.first_line_indent = Pt(32)
                # 添加编号和附件名称
                run2 = p2.add_run(f'{i}. {att}')
                # 设置字体为仿宋_GB2312，16磅
                self._set_run_font(run2, self.FONT_FANGSONG, 16, False)
    
    # 添加发文机关署名和成文日期
    def add_issuer_signature(self, issuer: str, date: str = None):
        """
        添加发文机关署名和成文日期
        
        参数说明：
        - issuer: 发文机关署名
        - date: 成文日期（可选），如"2026年3月13日"
        """
        # 添加一个空段落，用于调整间距
        self.doc.add_paragraph()
        
        # 添加发文机关署名段落
        p1 = self.doc.add_paragraph()
        # 设置右对齐
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        # 设置右缩进64磅（约4个字符）
        p1.paragraph_format.right_indent = Pt(64)
        # 添加发文机关署名文字
        run1 = p1.add_run(issuer)
        # 设置字体为仿宋_GB2312，16磅
        self._set_run_font(run1, self.FONT_FANGSONG, 16, False)
        
        # 如果提供了成文日期
        if date:
            # 添加成文日期段落
            p2 = self.doc.add_paragraph()
            # 设置右对齐
            p2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            # 设置右缩进64磅
            p2.paragraph_format.right_indent = Pt(64)
            # 添加成文日期文字
            run2 = p2.add_run(date)
            # 设置字体为仿宋_GB2312，16磅
            self._set_run_font(run2, self.FONT_FANGSONG, 16, False)
    
    # 添加附注
    def add_note(self, note: str):
        """
        添加附注
        
        参数说明：
        - note: 附注内容，如"联系人：张三，联系电话：024-12345678"
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置首行缩进32磅（2个字符）
        p.paragraph_format.first_line_indent = Pt(32)
        
        # 添加附注文字，用括号括起来
        run = p.add_run(f'（{note}）')
        # 设置字体为仿宋_GB2312，16磅
        self._set_run_font(run, self.FONT_FANGSONG, 16, False)
        
        # 返回段落对象
        return p
    
    # 添加抄送机关（版记部分）
    def add_copy_send(self, copy_to: str):
        """
        添加抄送机关（版记部分）
        
        参数说明：
        - copy_to: 抄送机关名称，如"集团各部门"
        """
        # 添加版记分隔线
        self._add_separator_line()
        
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 添加"抄送："文字
        run1 = p.add_run('抄送：')
        # 设置字体为仿宋_GB2312，14磅（4号字）
        self._set_run_font(run1, self.FONT_FANGSONG, 14, False)
        
        # 添加抄送机关名称，后面加上全角句号
        run2 = p.add_run(copy_to + '。')
        # 设置字体为仿宋_GB2312，14磅
        self._set_run_font(run2, self.FONT_FANGSONG, 14, False)
        
        # 返回段落对象
        return p
    
    # 添加印发机关和印发日期（版记部分）
    def add_print_info(self, print_org: str, print_date: str):
        """
        添加印发机关和印发日期（版记部分）
        
        参数说明：
        - print_org: 印发机关，如"集团办公室"
        - print_date: 印发日期，如"2026年3月13日"
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        
        # 添加印发机关文字
        run1 = p.add_run(print_org)
        # 设置字体为仿宋_GB2312，14磅
        self._set_run_font(run1, self.FONT_FANGSONG, 14, False)
        
        # 添加空格来分隔印发机关和印发日期
        run2 = p.add_run(' ' * 20)
        # 设置字体为仿宋_GB2312，14磅
        self._set_run_font(run2, self.FONT_FANGSONG, 14, False)
        
        # 添加印发日期，后面加上"印发"二字
        run3 = p.add_run(f'{print_date}印发')
        # 设置字体为仿宋_GB2312，14磅
        self._set_run_font(run3, self.FONT_FANGSONG, 14, False)
        
        # 添加版记末条分隔线
        self._add_separator_line()
    
    # 添加版记分隔线（私有方法）
    def _add_separator_line(self):
        """
        添加版记分隔线（私有方法）
        
        在版记部分添加横线
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置段前间距4磅
        p.paragraph_format.space_before = Pt(4)
        # 设置段后间距4磅
        p.paragraph_format.space_after = Pt(4)
        
        # 添加50个"─"字符来模拟分隔线
        run = p.add_run('─' * 50)
        # 设置字体为宋体，8磅
        self._set_run_font(run, self.FONT_SONGTI, 8, False)
    
    # 添加结尾语
    def add_closing(self, closing: str = '特此通知。'):
        """
        添加结尾语
        
        参数说明：
        - closing: 结尾语，默认是"特此通知。"
        """
        # 添加一个新段落
        p = self.doc.add_paragraph()
        # 设置首行缩进32磅（2个字符）
        p.paragraph_format.first_line_indent = Pt(32)
        
        # 添加结尾语文字
        run = p.add_run(closing)
        # 设置字体为仿宋_GB2312，16磅
        self._set_run_font(run, self.FONT_FANGSONG, 16, False)
        
        # 返回段落对象
        return p
    
    # 保存文档到文件
    def save(self, filepath: str):
        """
        保存文档到文件
        
        参数说明：
        - filepath: 保存的文件路径，如"example_notice.docx"
        
        返回值：
        - 保存的文件路径
        """
        # 调用Word文档对象的save方法保存文件
        self.doc.save(filepath)
        # 返回文件路径
        return filepath


# ========== 公文类型工厂函数 ==========
# 下面是针对不同公文类型的生成函数

# 创建通知类公文
def create_notice(content: Dict) -> OfficialDocumentGenerator:
    """
    创建通知类公文
    
    参数说明：
    - content: 包含公文内容的字典
    
    返回值：
    - 配置好的公文生成器对象
    """
    # 创建公文生成器实例
    gen = OfficialDocumentGenerator()
    
    # 如果有密级，则添加密级
    if content.get('classification'):
        gen.add_doc_classification(content['classification'], content.get('classification_period'))
    
    # 如果有紧急程度，则添加紧急程度
    if content.get('urgency'):
        gen.add_urgency(content['urgency'])
    
    # 添加发文机关标志
    gen.add_issuer_mark(content.get('issuer', ''))
    # 添加发文字号
    gen.add_document_number(content.get('doc_number', ''))
    
    # 如果有签发人，则添加签发人
    if content.get('signer'):
        gen.add_signer(content['signer'])
    
    # 添加红色分隔线
    gen.add_red_separator()
    
    # 添加标题
    gen.add_title(content.get('title', ''))
    # 添加主送机关
    gen.add_recipient(content.get('recipient', ''))
    
    # 遍历正文段落列表
    for para in content.get('body', []):
        # 如果段落以"一、"、"二、"等开头，则作为一级标题
        if para.startswith('一、') or para.startswith('二、') or para.startswith('三、'):
            gen.add_heading_level1(para)
        # 如果段落以"（一）"、"（二）"等开头，则作为二级标题
        elif para.startswith('（一）') or para.startswith('（二）'):
            gen.add_heading_level2(para)
        # 如果段落以"1."、"2."等开头，则作为三级标题
        elif para.startswith('1.') or para.startswith('2.') or para.startswith('3.'):
            gen.add_heading_level3(para)
        # 否则作为普通正文段落
        else:
            gen.add_body_paragraph(para)
    
    # 如果有结尾语，则添加结尾语
    if content.get('closing'):
        gen.add_closing(content['closing'])
    
    # 如果有附件，则添加附件说明
    if content.get('attachments'):
        gen.add_attachment_note(content['attachments'])
    
    # 添加发文机关署名和成文日期
    gen.add_issuer_signature(
        content.get('issuer_signature', content.get('issuer', '')),
        content.get('date', '')
    )
    
    # 如果有附注，则添加附注
    if content.get('note'):
        gen.add_note(content['note'])
    
    # 如果有抄送机关，则添加抄送机关
    if content.get('copy_to'):
        gen.add_copy_send(content['copy_to'])
    
    # 如果有印发机关，则添加印发机关和印发日期
    if content.get('print_org'):
        gen.add_print_info(
            content.get('print_org', ''),
            content.get('print_date', '')
        )
    
    # 返回配置好的公文生成器
    return gen


# 创建报告类公文
def create_report(content: Dict) -> OfficialDocumentGenerator:
    """
    创建报告类公文
    
    参数说明：
    - content: 包含公文内容的字典
    
    返回值：
    - 配置好的公文生成器对象
    """
    # 创建公文生成器实例
    gen = OfficialDocumentGenerator()
    
    # 添加发文机关标志
    gen.add_issuer_mark(content.get('issuer', ''))
    # 添加发文字号
    gen.add_document_number(content.get('doc_number', ''))
    # 添加红色分隔线
    gen.add_red_separator()
    
    # 添加标题
    gen.add_title(content.get('title', ''))
    # 添加主送机关
    gen.add_recipient(content.get('recipient', ''))
    
    # 遍历正文段落列表
    for para in content.get('body', []):
        # 如果段落以"一、"、"二、"等开头，则作为一级标题
        if para.startswith('一、') or para.startswith('二、') or para.startswith('三、'):
            gen.add_heading_level1(para)
        # 如果段落以"（一）"、"（二）"等开头，则作为二级标题
        elif para.startswith('（一）') or para.startswith('（二）'):
            gen.add_heading_level2(para)
        # 否则作为普通正文段落
        else:
            gen.add_body_paragraph(para)
    
    # 添加报告的结尾语"特此报告。"
    gen.add_closing('特此报告。')
    
    # 添加发文机关署名和成文日期
    gen.add_issuer_signature(
        content.get('issuer_signature', content.get('issuer', '')),
        content.get('date', '')
    )
    
    # 如果有抄送机关，则添加抄送机关
    if content.get('copy_to'):
        gen.add_copy_send(content['copy_to'])
    
    # 返回配置好的公文生成器
    return gen


# 创建请示类公文
def create_request(content: Dict) -> OfficialDocumentGenerator:
    """
    创建请示类公文
    
    参数说明：
    - content: 包含公文内容的字典
    
    返回值：
    - 配置好的公文生成器对象
    """
    # 创建公文生成器实例
    gen = OfficialDocumentGenerator()
    
    # 添加发文机关标志
    gen.add_issuer_mark(content.get('issuer', ''))
    # 添加发文字号
    gen.add_document_number(content.get('doc_number', ''))
    
    # 如果有签发人，则添加签发人（请示作为上行文需要签发人）
    if content.get('signer'):
        gen.add_signer(content['signer'])
    
    # 添加红色分隔线
    gen.add_red_separator()
    
    # 添加标题
    gen.add_title(content.get('title', ''))
    # 添加主送机关
    gen.add_recipient(content.get('recipient', ''))
    
    # 遍历正文段落列表
    for para in content.get('body', []):
        # 如果段落以"一、"、"二、"等开头，则作为一级标题
        if para.startswith('一、') or para.startswith('二、') or para.startswith('三、'):
            gen.add_heading_level1(para)
        # 如果段落以"（一）"、"（二）"等开头，则作为二级标题
        elif para.startswith('（一）') or para.startswith('（二）'):
            gen.add_heading_level2(para)
        # 否则作为普通正文段落
        else:
            gen.add_body_paragraph(para)
    
    # 添加请示的结尾语"妥否，请批示。"
    gen.add_closing('妥否，请批示。')
    
    # 如果有附件，则添加附件说明
    if content.get('attachments'):
        gen.add_attachment_note(content['attachments'])
    
    # 添加发文机关署名和成文日期
    gen.add_issuer_signature(
        content.get('issuer_signature', content.get('issuer', '')),
        content.get('date', '')
    )
    
    # 如果有附注，则添加附注
    if content.get('note'):
        gen.add_note(content['note'])
    
    # 返回配置好的公文生成器
    return gen


# 创建函类公文
def create_letter(content: Dict) -> OfficialDocumentGenerator:
    """
    创建函类公文
    
    参数说明：
    - content: 包含公文内容的字典
    
    返回值：
    - 配置好的公文生成器对象
    """
    # 创建公文生成器实例
    gen = OfficialDocumentGenerator()
    
    # 添加发文机关标志
    gen.add_issuer_mark(content.get('issuer', ''))
    # 添加发文字号
    gen.add_document_number(content.get('doc_number', ''))
    # 添加红色分隔线
    gen.add_red_separator()
    
    # 添加标题
    gen.add_title(content.get('title', ''))
    # 添加主送机关
    gen.add_recipient(content.get('recipient', ''))
    
    # 遍历正文段落列表，全部作为普通正文段落
    for para in content.get('body', []):
        gen.add_body_paragraph(para)
    
    # 添加函的结尾语"请予研究函复。"
    gen.add_closing('请予研究函复。')
    
    # 添加发文机关署名和成文日期
    gen.add_issuer_signature(
        content.get('issuer_signature', content.get('issuer', '')),
        content.get('date', '')
    )
    
    # 如果有附注，则添加附注
    if content.get('note'):
        gen.add_note(content['note'])
    
    # 返回配置好的公文生成器
    return gen


# 创建纪要类公文
def create_minutes(content: Dict) -> OfficialDocumentGenerator:
    """
    创建纪要类公文
    
    参数说明：
    - content: 包含公文内容的字典
    
    返回值：
    - 配置好的公文生成器对象
    """
    # 创建公文生成器实例
    gen = OfficialDocumentGenerator()
    
    # 添加纪要标题（会议名称+纪要）
    p = gen.doc.add_paragraph()
    # 设置居中对齐
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    # 添加标题文字
    run = p.add_run(content.get('meeting_name', '') + '纪要')
    # 设置字体为方正小标宋_GBK，26磅，加粗，红色
    gen._set_run_font(run, gen.FONT_XIAOBIAOSONG, 26, True, 'FF0000')
    
    # 添加会议时间和地点
    gen.add_body_paragraph(content.get('time_location', ''))
    # 添加会议概述
    gen.add_body_paragraph(content.get('overview', ''))
    
    # 如果有出席人员
    if content.get('attendees'):
        # 添加新段落
        p = gen.doc.add_paragraph()
        # 添加"出席："文字
        run1 = p.add_run('出席：')
        # 设置字体为黑体，16磅
        gen._set_run_font(run1, gen.FONT_HEITI, 16, False)
        # 添加出席人员名单
        run2 = p.add_run(content['attendees'])
        # 设置字体为仿宋_GB2312，16磅
        gen._set_run_font(run2, gen.FONT_FANGSONG, 16, False)
    
    # 如果有请假人员
    if content.get('absent'):
        # 添加新段落
        p = gen.doc.add_paragraph()
        # 添加"请假："文字
        run1 = p.add_run('请假：')
        # 设置字体为黑体，16磅
        gen._set_run_font(run1, gen.FONT_HEITI, 16, False)
        # 添加请假人员名单
        run2 = p.add_run(content['absent'])
        # 设置字体为仿宋_GB2312，16磅
        gen._set_run_font(run2, gen.FONT_FANGSONG, 16, False)
    
    # 遍历正文段落列表
    for para in content.get('body', []):
        # 如果段落以"一、"、"二、"等开头，则作为一级标题
        if para.startswith('一、') or para.startswith('二、'):
            gen.add_heading_level1(para)
        # 否则作为普通正文段落
        else:
            gen.add_body_paragraph(para)
    
    # 返回配置好的公文生成器
    return gen


# ========== 公文类型映射字典 ==========
# 这个字典将公文类型名称映射到对应的生成函数
DOCUMENT_TYPES = {
    '通知': create_notice,      # 通知类型使用create_notice函数
    '报告': create_report,      # 报告类型使用create_report函数
    '请示': create_request,     # 请示类型使用create_request函数
    '函': create_letter,        # 函类型使用create_letter函数
    '纪要': create_minutes,     # 纪要类型使用create_minutes函数
}


# 生成党政机关公文（主入口函数）
def generate_document(doc_type: str, content: Dict, output_path: str) -> str:
    """
    生成党政机关公文（主入口函数）
    
    这是外部调用的主要函数，根据公文类型调用对应的生成函数
    
    参数说明：
    - doc_type: 公文类型（通知/报告/请示/函/纪要）
    - content: 公文内容字典
    - output_path: 输出文件路径
    
    返回值：
    - 生成的文件路径
    """
    # 检查公文类型是否支持
    if doc_type not in DOCUMENT_TYPES:
        # 如果不支持，抛出错误提示
        raise ValueError(f"不支持的公文类型: {doc_type}。支持的类型: {list(DOCUMENT_TYPES.keys())}")
    
    # 根据公文类型获取对应的生成函数
    generator = DOCUMENT_TYPES[doc_type](content)
    # 保存文档到指定路径
    generator.save(output_path)
    
    # 返回文件路径
    return output_path


# ========== 示例代码 ==========
# 当直接运行这个文件时，会执行下面的示例代码
if __name__ == '__main__':
    # 定义示例公文内容
    example_content = {
        'issuer': 'XXX公司',                              # 发文机关
        'doc_number': 'XX〔2024〕1号',                   # 发文字号
        'title': '关于开展互联网服务统一管理工作的通知',  # 公文标题
        'recipient': '各部门、各子公司',                   # 主送机关
        'body': [                                         # 正文内容列表
            '为进一步规范集团互联网服务管理，加强网络安全防护，提升信息化管理水平，根据国家网络安全相关法律法规及集团信息化建设总体规划要求，集团决定对各部门、各子公司在互联网上提供的服务实施统一管理。现将有关事项通知如下：',
            '一、工作目标',
            '通过对集团各部门、各子公司互联网服务资源的全面梳理与统一管理，建立健全互联网服务管理体系，消除安全隐患，保障信息系统安全稳定运行，提升集团整体信息化管理效能。',
            '二、主要内容',
            '请各部门、各子公司配合提供以下互联网服务相关信息：',
            '（一）微信公众号',
            '包括公众号名称、账号主体、运营负责人及联系方式。',
            '（二）网站信息',
            '包括网站名称、域名、IP地址、备案号、服务器位置。',
            '三、工作要求',
            '各单位要高度重视，认真组织，确保信息收集的全面性、准确性和及时性。',
        ],
        'closing': '特此通知。',                          # 结尾语
        'attachments': ['互联网服务信息登记表'],          # 附件列表
        'issuer_signature': 'XXX公司',                   # 发文机关署名
        'date': '2024年1月15日',                         # 成文日期
        'note': '联系人：张三，联系电话：024-12345678', # 附注
        'copy_to': '集团各部门',                          # 抄送机关
        'print_org': '集团办公室',                        # 印发机关
        'print_date': '2024年1月16日'                   # 印发日期
    }
    
    # 调用generate_document函数生成通知类型的公文
    output = generate_document('通知', example_content, 'example_notice.docx')
    # 打印成功消息
    print(f"公文已生成: {output}")
