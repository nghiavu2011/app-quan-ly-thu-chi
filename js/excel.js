/**
 * Kakeibo Pro - Excel Import/Export Utility
 * Uses SheetJS (xlsx) library
 */

// Load SheetJS from CDN
const sheetJSScript = document.createElement('script');
sheetJSScript.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
sheetJSScript.async = true;
sheetJSScript.onload = function() {
  console.log('SheetJS loaded successfully');
};
document.head.appendChild(sheetJSScript);

const ExcelUtil = {
  // Export transactions to Excel
  exportTransactions() {
    const transactions = DB.getTransactions();
    
    // Format data for Excel
    const data = transactions.map(t => ({
      'Ngày': new Date(t.date).toLocaleDateString('vi-VN'),
      'Loại': t.type === 'income' ? 'Thu' : 'Chi',
      'Danh mục': t.category,
      'Số tiền': t.amount,
      'Tài khoản': t.account,
      'Mô tả': t.description
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 12 },  // Ngày
      { wch: 8 },   // Loại
      { wch: 15 },  // Danh mục
      { wch: 15 },  // Số tiền
      { wch: 15 },  // Tài khoản
      { wch: 30 }   // Mô tả
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Giao dịch');

    // Generate file
    const fileName = `Kakeibo_Giao_Dich_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    return true;
  },

  // Import transactions from Excel
  async importTransactions(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first worksheet
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          // Convert to app format
          const transactions = jsonData.map(row => {
            const dateParts = row['Ngày'].split('/');
            const isoDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]).toISOString();
            
            return {
              id: Date.now() + Math.random(),
              type: row['Loại'] === 'Thu' ? 'income' : 'expense',
              amount: parseFloat(row['Số tiền']) || 0,
              category: row['Danh mục'] || 'Khác',
              account: row['Tài khoản'] || 'Tiền mặt',
              description: row['Mô tả'] || row['Danh mục'],
              date: isoDate,
              createdAt: new Date().toISOString()
            };
          });
          
          // Filter valid transactions
          const validTransactions = transactions.filter(t => t.amount > 0);
          
          // Save to database
          const existing = DB.getTransactions();
          const combined = [...validTransactions, ...existing];
          DB.save(DB.KEYS.TRANSACTIONS, combined);
          
          resolve({
            success: true,
            imported: validTransactions.length,
            total: jsonData.length
          });
        } catch (error) {
          reject({ success: false, error: error.message });
        }
      };
      
      reader.onerror = () => {
        reject({ success: false, error: 'File read error' });
      };
      
      reader.readAsArrayBuffer(file);
    });
  },

  // Export rooms data
  exportRooms() {
    const rooms = DB.getRooms();
    
    const data = rooms.map(r => ({
      'Phòng': r.name,
      'Tầng': r.floor,
      'Giá thuê': r.price,
      'Trạng thái': r.status === 'occupied' ? 'Đang thuê' : 'Trống',
      'Người thuê': r.tenant || '',
      'Hạn đóng': r.dueDate || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 12 }, { wch: 8 }, { wch: 15 },
      { wch: 12 }, { wch: 20 }, { wch: 12 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Phòng');
    
    const fileName = `Kakeibo_Phong_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },

  // Export full report
  exportFullReport() {
    const wb = XLSX.utils.book_new();
    
    // Transactions sheet
    const transactions = DB.getTransactions().map(t => ({
      'Ngày': new Date(t.date).toLocaleDateString('vi-VN'),
      'Loại': t.type === 'income' ? 'Thu' : 'Chi',
      'Danh mục': t.category,
      'Số tiền': t.amount,
      'Tài khoản': t.account,
      'Mô tả': t.description
    }));
    
    if (transactions.length > 0) {
      const ws1 = XLSX.utils.json_to_sheet(transactions);
      XLSX.utils.book_append_sheet(wb, ws1, 'Giao dịch');
    }
    
    // Rooms sheet
    const rooms = DB.getRooms().map(r => ({
      'Phòng': r.name,
      'Tầng': r.floor,
      'Giá thuê': r.price,
      'Trạng thái': r.status === 'occupied' ? 'Đang thuê' : 'Trống',
      'Người thuê': r.tenant || ''
    }));
    
    if (rooms.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(rooms);
      XLSX.utils.book_append_sheet(wb, ws2, 'Phòng');
    }
    
    // Tenants sheet
    const tenants = DB.getTenants().map(t => ({
      'Tên': t.name,
      'SĐT': t.phone,
      'Phòng': t.room,
      'Bắt đầu': t.startDate,
      'Kết thúc': t.endDate,
      'Trạng thái': t.status === 'active' ? 'Đang thuê' : 'Sắp hết hạn'
    }));
    
    if (tenants.length > 0) {
      const ws3 = XLSX.utils.json_to_sheet(tenants);
      XLSX.utils.book_append_sheet(wb, ws3, 'Khách thuê');
    }
    
    // Summary sheet
    const totals = DB.getTotals();
    const summary = [
      { 'Chỉ tiêu': 'Tổng thu', 'Giá trị': totals.income },
      { 'Chỉ tiêu': 'Tổng chi', 'Giá trị': totals.expense },
      { 'Chỉ tiêu': 'Số dư', 'Giá trị': totals.balance },
      { 'Chỉ tiêu': 'Số phòng', 'Giá trị': DB.getRooms().length },
      { 'Chỉ tiêu': 'Phòng đã thuê', 'Giá trị': DB.getRooms().filter(r => r.status === 'occupied').length },
      { 'Chỉ tiêu': 'Số khách thuê', 'Giá trị': DB.getTenants().length }
    ];
    
    const ws4 = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, ws4, 'Tổng quan');
    
    // Save file
    const fileName = `Kakeibo_Bao_Cao_Full_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },

  // Download template
  downloadTemplate() {
    // Create sample data
    const sampleData = [
      {
        'Ngày': '25/10/2023',
        'Loại': 'Thu',
        'Danh mục': 'Tiền thuê nhà',
        'Số tiền': 4500000,
        'Tài khoản': 'Momo',
        'Mô tả': 'Thu tiền phòng 101'
      },
      {
        'Ngày': '24/10/2023',
        'Loại': 'Chi',
        'Danh mục': 'Ăn uống',
        'Số tiền': 150000,
        'Tài khoản': 'Tiền mặt',
        'Mô tả': 'Cơm trưa'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 12 }, { wch: 8 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 30 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mẫu nhập liệu');
    
    // Add instructions sheet
    const instructions = [
      { 'Hướng dẫn': 'Cột Ngày: Định dạng DD/MM/YYYY (vd: 25/10/2023)' },
      { 'Hướng dẫn': 'Cột Loại: Nhập "Thu" hoặc "Chi"' },
      { 'Hướng dẫn': 'Cột Số tiền: Chỉ nhập số, không có dấu phân cách' },
      { 'Hướng dẫn': 'Cột Danh mục: Tự do nhập hoặc chọn từ danh sách' }
    ];
    const ws2 = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, ws2, 'Hướng dẫn');
    
    XLSX.writeFile(wb, 'Kakeibo_Mau_Nhap_Lieu.xlsx');
  }
};

// Make available globally
window.ExcelUtil = ExcelUtil;

// Quick export functions for UI
function exportToExcel() {
  if (typeof XLSX === 'undefined') {
    alert('Đang tải thư viện Excel, vui lòng thử lại sau 2 giây');
    return;
  }
  ExcelUtil.exportTransactions();
  showToast('Đã xuất file Excel!');
}

function exportFullReport() {
  if (typeof XLSX === 'undefined') {
    alert('Đang tải thư viện Excel, vui lòng thử lại sau 2 giây');
    return;
  }
  ExcelUtil.exportFullReport();
  showToast('Đã xuất báo cáo đầy đủ!');
}

function downloadTemplate() {
  if (typeof XLSX === 'undefined') {
    alert('Đang tải thư viện Excel, vui lòng thử lại sau 2 giây');
    return;
  }
  ExcelUtil.downloadTemplate();
  showToast('Đã tải mẫu nhập liệu!');
}

// Import handler
async function handleExcelImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (typeof XLSX === 'undefined') {
    alert('Đang tải thư viện, vui lòng thử lại sau 2 giây');
    return;
  }
  
  try {
    showToast('Đang nhập dữ liệu...');
    const result = await ExcelUtil.importTransactions(file);
    
    if (result.success) {
      showToast(`Đã nhập ${result.imported} giao dịch thành công!`);
      setTimeout(() => location.reload(), 1500);
    } else {
      alert('Lỗi: ' + result.error);
    }
  } catch (error) {
    alert('Lỗi nhập file: ' + error.message);
  }
}