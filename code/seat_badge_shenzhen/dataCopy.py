import os
import pandas as pd

# 定义文件路径
source_folder = r"E:\AI SpaceX\employNEW-zongbu\picture"
target_file = r"E:\AI SpaceX\employNEW-zongbu\BaseInformation.xlsx"

# 公司部门列表
department_list = [
    "流程数据与IT部", "人力资源部", "电梯产品事业部", "研发管理部", 
    "集成供应链管理部", "总裁办公室A", "总裁办公室B", "黄秘办公室", 
    "审计部", "知识产权与法务中心", "汇川书院", "财经管理部", 
    "质量管理部", "公司变革项目群", "总部派驻中心", "产品竞争力中心", 
    "数字化事业部", "技术服务中心", "战略与投资发展部", "全球工业自动化BG"
]

def find_excel_file(folder):
    """查找文件夹中唯一的Excel文件"""
    excel_files = []
    for file in os.listdir(folder):
        if file.endswith(('.xlsx', '.xls')) and not file.startswith('~$'):  # 排除临时文件
            excel_files.append(os.path.join(folder, file))
    
    if len(excel_files) != 1:
        raise Exception(f"在{folder}中找到{len(excel_files)}个Excel文件，预期为1个")
    
    return excel_files[0]

def extract_department(org_path):
    """从组织全路径中提取部门信息"""
    if not isinstance(org_path, str):
        return ""
    
    # 处理汇川集团开头的情况
    if org_path.startswith("汇川集团"):
        parts = org_path.split("/")
        # 查找"总部"后的部分（修复缩进错误，避免变量未定义）
        if "总部" in parts:
            总部_index = parts.index("总部")
            if 总部_index + 1 < len(parts):  # 仅在"总部"存在时执行
                return parts[总部_index + 1]
    # 处理直接以部门开头的情况
    else:
        if "/" in org_path:
            return org_path.split("/")[0]
    
    # 如果以上都不匹配，返回整个路径作为 fallback
    return org_path

def main():
    try:
        # 找到源Excel文件
        source_file = find_excel_file(source_folder)
        print(f"找到源Excel文件: {source_file}")
        
        # 读取源Excel文件（pandas自动将第一行识别为表头，数据从第二行开始）
        source_df = pd.read_excel(source_file)
        
        # 检查必要的列是否存在
        required_columns = ["姓名", "预入职工号", "岗位", "组织全路径"]
        for col in required_columns:
            if col not in source_df.columns:
                raise Exception(f"源Excel文件中缺少必要的列: {col}")
        
        # 提取需要的数据（遍历所有数据行，包括表头下的第一行）
        result_data = []
        for idx, row in source_df.iterrows():  # 移除iloc[1:]，保留所有数据行
            name = row["姓名"]
            employee_id = row["预入职工号"]
            position = row["岗位"]
            org_path = row["组织全路径"]
            
            # 提取部门信息
            department = extract_department(org_path)
            
            # 检查部门是否在列表中
            if department not in department_list:
                print(f'员工“{name}”的部门信息未提取正确，请查看！')
            
            result_data.append({
                "姓名": name,
                "工号": employee_id,
                "岗位": position,
                "部门": department
            })
        
        # 创建结果DataFrame
        result_df = pd.DataFrame(result_data)
        
        # 获取数据行数
        row_count = len(result_data)
        
        # 读取目标Excel并写入数据
        try:
            target_df = pd.read_excel(target_file)
            # 确保目标文件有正确的列
            target_columns = ["姓名", "工号", "岗位", "部门"]
            for col in target_columns:
                if col not in target_df.columns:
                    raise Exception(f"目标Excel文件中缺少必要的列: {col}")
        except FileNotFoundError:
            raise Exception(f"未找到目标文件: {target_file}")
        
        # 拼接数据（保留表头，添加新数据）
        new_target_df = pd.DataFrame(columns=target_df.columns)
        new_target_df = pd.concat([new_target_df, result_df], ignore_index=True)
        
        # 写入目标文件
        with pd.ExcelWriter(target_file, engine='openpyxl', mode='w') as writer:
            new_target_df.to_excel(writer, index=False)
        
        # 优化提示信息，显示数据行数
        print(f"检索到{row_count}行数据，所有数据行均已复制，请知悉！")
    
    except Exception as e:
        print(f"发生错误: {str(e)}")

if __name__ == "__main__":
    main()
