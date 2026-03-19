# -*- coding: utf-8 -*-
"""
公文解析器

这个模块负责从Word文档中读取内容，并智能识别各个公文元素
"""

import re
from docx import Document


class DocumentParser:
    """
    公文解析器类
    
    负责读取Word文档并识别各个公文元素
    """
    
    # 状态定义
    STATE_INIT = 'INIT'
    STATE_FOUND_GROUP = 'FOUND_GROUP'
    STATE_FOUND_ISSUER = 'FOUND_ISSUER'
    STATE_FOUND_DOC_NUMBER = 'FOUND_DOC_NUMBER'
    STATE_FOUND_CLASSIFICATION = 'FOUND_CLASSIFICATION'
    STATE_IN_TITLE = 'IN_TITLE'
    STATE_FOUND_TITLE = 'FOUND_TITLE'
    STATE_IN_BODY = 'IN_BODY'
    STATE_FOUND_CLOSING = 'FOUND_CLOSING'
    STATE_IN_ATTACHMENTS = 'IN_ATTACHMENTS'
    STATE_FOUND_DATE = 'FOUND_DATE'
    STATE_FOUND_MAIN_SEND = 'FOUND_MAIN_SEND'
    STATE_FOUND_COPY_SEND = 'FOUND_COPY_SEND'
    STATE_DONE = 'DONE'
    
    def __init__(self):
        """
        初始化解析器
        """
        self.state = self.STATE_INIT
        self.result = {
            'classification': '',
            'group': '汇川技术',
            'signer': None,
            'issuer': '',
            'doc_number': '',
            'title': '',
            'body': [],
            'closing': '',
            'attachments': [],
            'date': '',
            'main_send': '',
            'copy_to': None,
            'print_org': '',
            'print_date': ''
        }
        self.title_buffer = []
        self.in_attachment_mode = False
    
    @staticmethod
    def _filter_paragraphs(paragraphs):
        """
        过滤空行和纯空格行
        
        参数说明：
        - paragraphs: Word文档的段落列表
        
        返回值：
        - 过滤后的文本列表
        """
        texts = []
        for para in paragraphs:
            text = para.text.strip()
            if text:
                texts.append(text)
        return texts
    
    @staticmethod
    def _is_group_name(text):
        """
        判断是否是集团名称
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是集团名称
        """
        return text == '汇川技术'
    
    @staticmethod
    def _is_issuer_mark(text):
        """
        判断是否是发文机关标志
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是发文机关标志
        """
        return text.endswith('文件') and len(text) > 2
    
    @staticmethod
    def _is_doc_number(text):
        """
        判断是否是发文字号
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是发文字号
        """
        return '〔' in text and '〕' in text
    
    @staticmethod
    def _is_signer(text):
        """
        判断是否是签发人
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是签发人
        """
        return text.startswith('签发人：')
    
    @staticmethod
    def _is_classification(text):
        """
        判断是否是密级
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是密级
        """
        return text.startswith('【密级：')
    
    @staticmethod
    def _is_title_start(text):
        """
        判断是否是公文标题的开始
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是公文标题开始
        """
        return text.startswith('关于')
    
    @staticmethod
    def _is_title_end(text):
        """
        判断是否是公文标题的结束
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是公文标题结束
        """
        return text.endswith('的通知') or text.endswith('的通报') or text.endswith('的公示')
    
    @staticmethod
    def _is_heading_level1(text):
        """
        判断是否是一级标题
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是一级标题
        """
        return bool(re.match(r'^[一二三四五六七八九十百]+、', text))
    
    @staticmethod
    def _is_heading_level2(text):
        """
        判断是否是二级标题
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是二级标题
        """
        return bool(re.match(r'^（[一二三四五六七八九十百]+）', text))
    
    @staticmethod
    def _is_heading_level3(text):
        """
        判断是否是三级标题
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是三级标题
        """
        return bool(re.match(r'^\d+[.．]', text))
    
    @staticmethod
    def _is_heading_level4(text):
        """
        判断是否是四级标题
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是四级标题
        """
        return bool(re.match(r'^（\d+）', text))
    
    @staticmethod
    def _is_heading_level5(text):
        """
        判断是否是五级标题
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是五级标题
        """
        return bool(re.match(r'^[①-⑳]', text))
    
    @staticmethod
    def _is_closing(text):
        """
        判断是否是结尾语
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是结尾语
        """
        return text in ['特此通知。', '特此通报。', '特此公示。']
    
    @staticmethod
    def _is_attachment_start(text):
        """
        判断是否是附件说明的开始
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是附件说明开始
        """
        return text.startswith('附件：')
    
    @staticmethod
    def _is_chinese_date(text):
        """
        判断是否是中文日期格式（成文日期）
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是中文日期
        """
        chinese_date_chars = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '年', '月', '日']
        return all(c in chinese_date_chars or c.isspace() for c in text) and '年' in text and '月' in text and '日' in text
    
    @staticmethod
    def _is_main_send(text):
        """
        判断是否是主送机关
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是主送机关
        """
        return text.startswith('主送：')
    
    @staticmethod
    def _is_copy_send(text):
        """
        判断是否是抄送机关
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是抄送机关
        """
        return text.startswith('抄送：')
    
    @staticmethod
    def _is_print_info(text):
        """
        判断是否是印发机关和日期
        
        参数说明：
        - text: 段落文本
        
        返回值：
        - 是否是印发信息
        """
        return '印发' in text and ('年' in text or '月' in text or '日' in text)
    
    def _extract_classification(self, text):
        """
        从密级文本中提取密级内容
        
        参数说明：
        - text: 密级文本，如【密级：内部公开】
        
        返回值：
        - 密级内容，如内部公开
        """
        match = re.search(r'【密级：(.+?)】', text)
        if match:
            return match.group(1)
        return ''
    
    def _extract_signer(self, text):
        """
        从签发人文本中提取姓名
        
        参数说明：
        - text: 签发人文本，如签发人：吴泳铭
        
        返回值：
        - 签发人姓名，如吴泳铭
        """
        return text.replace('签发人：', '').strip()
    
    def _extract_main_send(self, text):
        """
        从主送机关文本中提取内容
        
        参数说明：
        - text: 主送机关文本，如主送：汇川全员
        
        返回值：
        - 主送机关内容
        """
        return text.replace('主送：', '').strip()
    
    def _extract_copy_send(self, text):
        """
        从抄送机关文本中提取内容
        
        参数说明：
        - text: 抄送机关文本，如抄送：朱兴明总裁。
        
        返回值：
        - 抄送机关内容（去掉末尾的句号）
        """
        content = text.replace('抄送：', '').strip()
        if content.endswith('。'):
            content = content[:-1]
        return content
    
    def _extract_print_info(self, text):
        """
        从印发信息文本中提取印发机关和日期
        
        参数说明：
        - text: 印发信息文本，如汇川技术总裁办    2022年7月27日印发
        
        返回值：
        - (印发机关, 印发日期)
        """
        parts = text.split('印发')[0].strip()
        if '    ' in parts:
            org, date = parts.split('    ', 1)
        else:
            org = parts
            date = ''
        return org.strip(), date.strip()
    
    def _extract_attachment(self, text):
        """
        从附件说明文本中提取附件名称
        
        参数说明：
        - text: 附件说明文本
        
        返回值：
        - 附件名称
        """
        if text.startswith('附件：'):
            text = text[3:].strip()
        elif re.match(r'^\d+\.', text):
            text = re.sub(r'^\d+\.\s*', '', text).strip()
        return text
    
    def _parse_paragraphs(self, texts):
        """
        解析段落列表，识别各个元素
        
        参数说明：
        - texts: 过滤后的段落文本列表
        
        返回值：
        - 识别结果字典
        """
        self.state = self.STATE_INIT
        
        for i, text in enumerate(texts):
            
            if self.state == self.STATE_INIT:
                if self._is_group_name(text):
                    self.state = self.STATE_FOUND_GROUP
                    continue
            
            elif self.state == self.STATE_FOUND_GROUP:
                if self._is_issuer_mark(text):
                    self.result['issuer'] = text.replace('文件', '', 1).strip()
                    self.state = self.STATE_FOUND_ISSUER
                    continue
            
            elif self.state == self.STATE_FOUND_ISSUER:
                if self._is_doc_number(text):
                    if self._is_signer(text):
                        doc_number_part = text.split('签发人：')[0].strip()
                        signer_part = text.split('签发人：')[1].strip()
                        self.result['doc_number'] = doc_number_part
                        self.result['signer'] = signer_part
                    else:
                        self.result['doc_number'] = text
                    self.state = self.STATE_FOUND_DOC_NUMBER
                    continue
                elif self._is_signer(text):
                    self.result['signer'] = self._extract_signer(text)
                    continue
            
            elif self.state == self.STATE_FOUND_DOC_NUMBER:
                if self._is_classification(text):
                    self.result['classification'] = self._extract_classification(text)
                    self.state = self.STATE_FOUND_CLASSIFICATION
                    continue
                elif self._is_title_start(text):
                    self.title_buffer.append(text)
                    if self._is_title_end(text):
                        self.result['title'] = ''.join(self.title_buffer)
                        self.title_buffer = []
                        self.state = self.STATE_FOUND_TITLE
                    else:
                        self.state = self.STATE_IN_TITLE
                    continue
            
            elif self.state == self.STATE_FOUND_CLASSIFICATION:
                if self._is_title_start(text):
                    self.title_buffer.append(text)
                    if self._is_title_end(text):
                        self.result['title'] = ''.join(self.title_buffer)
                        self.title_buffer = []
                        self.state = self.STATE_FOUND_TITLE
                    else:
                        self.state = self.STATE_IN_TITLE
                    continue
            
            elif self.state == self.STATE_IN_TITLE:
                self.title_buffer.append(text)
                if self._is_title_end(text):
                    self.result['title'] = ''.join(self.title_buffer)
                    self.title_buffer = []
                    self.state = self.STATE_FOUND_TITLE
                continue
            
            elif self.state == self.STATE_FOUND_TITLE or self.state == self.STATE_IN_BODY:
                if self._is_attachment_start(text):
                    self.in_attachment_mode = True
                    att_name = self._extract_attachment(text)
                    if att_name:
                        self.result['attachments'].append(att_name)
                    self.state = self.STATE_IN_ATTACHMENTS
                    continue
                elif self._is_closing(text):
                    self.result['closing'] = text
                    self.state = self.STATE_FOUND_CLOSING
                    continue
                elif self._is_heading_level1(text):
                    self.result['body'].append(text)
                    self.state = self.STATE_IN_BODY
                elif self._is_heading_level2(text):
                    self.result['body'].append(text)
                    self.state = self.STATE_IN_BODY
                elif self._is_heading_level3(text):
                    self.result['body'].append(text)
                    self.state = self.STATE_IN_BODY
                elif self._is_heading_level4(text):
                    self.result['body'].append(text)
                    self.state = self.STATE_IN_BODY
                elif self._is_heading_level5(text):
                    self.result['body'].append(text)
                    self.state = self.STATE_IN_BODY
                else:
                    self.result['body'].append(text)
                    self.state = self.STATE_IN_BODY
                continue
            
            elif self.state == self.STATE_FOUND_CLOSING:
                if self._is_attachment_start(text):
                    self.in_attachment_mode = True
                    att_name = self._extract_attachment(text)
                    if att_name:
                        self.result['attachments'].append(att_name)
                    self.state = self.STATE_IN_ATTACHMENTS
                    continue
                elif self._is_chinese_date(text):
                    self.result['date'] = text
                    self.state = self.STATE_FOUND_DATE
                    continue
            
            elif self.state == self.STATE_IN_ATTACHMENTS:
                if self._is_closing(text):
                    self.result['closing'] = text
                    self.state = self.STATE_FOUND_CLOSING
                    self.in_attachment_mode = False
                    continue
                elif self._is_chinese_date(text):
                    self.result['date'] = text
                    self.state = self.STATE_FOUND_DATE
                    self.in_attachment_mode = False
                    continue
                elif self._is_heading_level3(text) and self.in_attachment_mode:
                    att_name = self._extract_attachment(text)
                    if att_name:
                        self.result['attachments'].append(att_name)
                    continue
                elif self._is_main_send(text):
                    self.result['main_send'] = self._extract_main_send(text)
                    self.state = self.STATE_FOUND_MAIN_SEND
                    self.in_attachment_mode = False
                    continue
            
            elif self.state == self.STATE_FOUND_DATE:
                if self._is_main_send(text):
                    self.result['main_send'] = self._extract_main_send(text)
                    self.state = self.STATE_FOUND_MAIN_SEND
                    continue
            
            elif self.state == self.STATE_FOUND_MAIN_SEND:
                if self._is_copy_send(text):
                    self.result['copy_to'] = self._extract_copy_send(text)
                    self.state = self.STATE_FOUND_COPY_SEND
                    continue
                elif self._is_print_info(text):
                    org, date = self._extract_print_info(text)
                    self.result['print_org'] = org
                    self.result['print_date'] = date
                    self.state = self.STATE_DONE
                    continue
            
            elif self.state == self.STATE_FOUND_COPY_SEND:
                if self._is_print_info(text):
                    org, date = self._extract_print_info(text)
                    self.result['print_org'] = org
                    self.result['print_date'] = date
                    self.state = self.STATE_DONE
                    continue
        
        return self.result
    
    def parse(self, file_path):
        """
        解析Word文档
        
        参数说明：
        - file_path: Word文档路径
        
        返回值：
        - 识别结果字典
        """
        doc = Document(file_path)
        texts = self._filter_paragraphs(doc.paragraphs)
        return self._parse_paragraphs(texts)


def parse_word_document(file_path):
    """
    解析Word文档的主入口函数
    
    参数说明：
    - file_path: Word文档路径
    
    返回值：
    - 识别结果字典，格式与generate_document所需的content字典一致
    """
    parser = DocumentParser()
    return parser.parse(file_path)


if __name__ == '__main__':
    test_file = r'E:\97、新一轮AI探索\WriterINO\汇川总裁办〔2022〕1号 关于规范集团内部常用公文格式及发文审批流程的通知.docx'
    result = parse_word_document(test_file)
    
    print('=' * 50)
    print('解析结果：')
    print('=' * 50)
    for key, value in result.items():
        print(f'{key}: {value}')
    print('=' * 50)
