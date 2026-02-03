import pandas as pd
import openpyxl
import json

def analyze_excel(file_path):
    """Phân tích cấu trúc file Excel"""
    print(f"\n{'='*80}")
    print(f"PHÂN TÍCH FILE: {file_path}")
    print(f"{'='*80}\n")
    
    # Đọc tất cả các sheet
    xl_file = pd.ExcelFile(file_path)
    
    print(f"📋 Tổng số sheet: {len(xl_file.sheet_names)}\n")
    
    analysis = {}
    
    for sheet_name in xl_file.sheet_names:
        print(f"\n{'─'*80}")
        print(f"📄 SHEET: {sheet_name}")
        print(f"{'─'*80}")
        
        # Đọc sheet
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        
        # Thông tin cơ bản
        print(f"\n✓ Số dòng: {len(df)}")
        print(f"✓ Số cột: {len(df.columns)}")
        print(f"\n✓ Tên các cột:")
        for i, col in enumerate(df.columns, 1):
            print(f"   {i:2d}. {col}")
        
        # Hiển thị 3 dòng đầu tiên
        print(f"\n✓ 3 dòng dữ liệu đầu tiên:")
        print(df.head(3).to_string(index=False))
        
        # Kiểu dữ liệu
        print(f"\n✓ Kiểu dữ liệu của các cột:")
        for col, dtype in df.dtypes.items():
            print(f"   • {col}: {dtype}")
        
        # Lưu vào analysis
        analysis[sheet_name] = {
            'rows': len(df),
            'columns': list(df.columns),
            'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()},
            'sample_data': df.head(5).to_dict('records')
        }
    
    return analysis

# Phân tích file Thu Chi Gia Đình
file1 = r"C:\Users\NMteam\.gemini\antigravity\scratch\real_estate_scoring\sql\App Thu Chi Gia Dinh\Kakeibo 25_7.xlsx"
analysis1 = analyze_excel(file1)

# Phân tích file Hoạch Toán Thuê Nhà
file2 = r"C:\Users\NMteam\.gemini\antigravity\scratch\real_estate_scoring\sql\App Thu Chi Gia Dinh\Togohub 25_6.xlsx"
analysis2 = analyze_excel(file2)

# Lưu kết quả phân tích ra file JSON
output = {
    'thu_chi_gia_dinh': analysis1,
    'hoach_toan_thue_nha': analysis2
}

with open('excel_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2, default=str)

print(f"\n{'='*80}")
print("✅ Đã lưu kết quả phân tích vào file: excel_analysis.json")
print(f"{'='*80}\n")
