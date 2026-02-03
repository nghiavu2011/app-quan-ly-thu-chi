/**
 * Kakeibo Pro - Main App Logic
 */

// App initialization
document.addEventListener('DOMContentLoaded', function() {
  // Initialize database
  DB.init();
  
  // Check for dark mode preference
  const settings = DB.getSettings();
  if (settings.darkMode) {
    document.documentElement.classList.add('dark');
  }
  
  // Setup page-specific logic
  const currentPage = window.location.pathname.split('/').pop();
  
  switch(currentPage) {
    case 'home.html':
    case '':
      initHomePage();
      break;
    case 'quick-add.html':
      initQuickAddPage();
      break;
    case 'transactions-list.html':
      initTransactionsPage();
      break;
    case 'dashboard.html':
      initDashboardPage();
      break;
    case 'rental-units.html':
      initRoomsPage();
      break;
    case 'rental-tenants.html':
      initTenantsPage();
      break;
    case 'rental-receivables.html':
      initReceivablesPage();
      break;
    case 'settings.html':
      initSettingsPage();
      break;
  }
});

// Home Page Logic
function initHomePage() {
  // Load totals
  const totals = DB.getTotals();
  
  // Update UI with actual data
  const incomeEl = document.querySelector('.income-amount');
  const expenseEl = document.querySelector('.expense-amount');
  const balanceEl = document.querySelector('.balance-amount');
  
  if (incomeEl) incomeEl.textContent = formatCurrency(totals.income);
  if (expenseEl) expenseEl.textContent = formatCurrency(totals.expense);
  if (balanceEl) balanceEl.textContent = formatCurrency(totals.balance);
  
  // Load recent transactions
  loadRecentTransactions();
  
  // Load room stats
  loadRoomStats();
}

function loadRecentTransactions() {
  const transactions = DB.getTransactions().slice(0, 5);
  const container = document.getElementById('recent-transactions');
  
  if (!container) return;
  
  container.innerHTML = transactions.map(t => `
    <div class="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer hover:bg-gray-50" onclick="viewTransaction(${t.id})">
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center size-10 rounded-full ${t.type === 'income' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}">
          <span class="material-symbols-outlined text-[20px]">${getCategoryIcon(t.category)}</span>
        </div>
        <div>
          <p class="text-[#111418] dark:text-white font-bold text-sm">${t.description}</p>
          <p class="text-gray-500 dark:text-gray-400 text-xs">${t.category} • ${getRelativeTime(t.date)}</p>
        </div>
      </div>
      <span class="${t.type === 'income' ? 'text-green-500' : 'text-red-500'} font-bold text-sm">
        ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
      </span>
    </div>
  `).join('');
}

function loadRoomStats() {
  const rooms = DB.getRooms();
  const occupied = rooms.filter(r => r.status === 'occupied').length;
  const total = rooms.length;
  
  const statEl = document.querySelector('.room-stats');
  if (statEl) {
    statEl.innerHTML = `
      <h4 class="text-[#111418] dark:text-white text-2xl font-bold">${occupied}/${total}</h4>
      <span class="text-gray-400 text-sm font-medium">phòng đã thuê</span>
    `;
  }
  
  // Update progress bar
  const progressEl = document.querySelector('.room-progress');
  if (progressEl) {
    const percentage = (occupied / total) * 100;
    progressEl.style.width = `${percentage}%`;
  }
}

// Quick Add Page Logic
function initQuickAddPage() {
  let currentAmount = '0';
  let selectedType = 'expense';
  let selectedCategory = null;
  let selectedAccount = null;
  
  // Initialize display
  updateAmountDisplay();
  
  // Load categories
  loadCategories();
  
  // Load accounts
  loadAccounts();
  
  // Type toggle
  document.querySelectorAll('input[name="transaction_type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedType = e.target.value;
      loadCategories();
    });
  });
  
  // Keypad buttons
  document.querySelectorAll('.keypad-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.textContent.trim();
      
      if (value === '⌫') {
        currentAmount = currentAmount.slice(0, -1) || '0';
      } else if (value === '000') {
        if (currentAmount !== '0') currentAmount += '000';
      } else if (/[0-9]/.test(value)) {
        if (currentAmount === '0') currentAmount = value;
        else currentAmount += value;
      }
      
      updateAmountDisplay();
    });
  });
  
  // Save button
  const saveBtn = document.querySelector('.save-transaction-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveTransaction);
  }
  
  function updateAmountDisplay() {
    const display = document.querySelector('.amount-display');
    if (display) {
      const formatted = new Intl.NumberFormat('vi-VN').format(parseInt(currentAmount));
      display.innerHTML = `${formatted} <span class="text-2xl font-medium text-gray-400">đ</span>`;
    }
  }
  
  function loadCategories() {
    const categories = DB.getCategories().filter(c => c.type === selectedType);
    const container = document.querySelector('.categories-container');
    
    if (!container) return;
    
    container.innerHTML = categories.map((cat, index) => `
      <button class="category-chip flex items-center gap-2 rounded-lg px-4 py-2.5 shrink-0 transition-all ${index === 0 ? 'bg-primary text-white shadow-md' : 'bg-surface-light dark:bg-surface-dark text-[#111418] dark:text-white'}" 
              data-id="${cat.id}" onclick="selectCategory(this, ${cat.id})">
        <span class="material-symbols-outlined text-[20px] ${index === 0 ? 'fill-current' : ''}" style="color: ${index === 0 ? 'white' : cat.color}">${cat.icon}</span>
        <span class="text-sm font-semibold whitespace-nowrap">${cat.name}</span>
      </button>
    `).join('');
    
    if (categories.length > 0) selectedCategory = categories[0];
  }
  
  function loadAccounts() {
    const accounts = DB.getAccounts();
    // Select first account by default
    if (accounts.length > 0) selectedAccount = accounts[0];
  }
  
  function saveTransaction() {
    if (!selectedCategory || !selectedAccount) {
      alert('Vui lòng chọn danh mục và tài khoản');
      return;
    }
    
    const amount = parseInt(currentAmount);
    if (amount <= 0) {
      alert('Vui lòng nhập số tiền');
      return;
    }
    
    const transaction = {
      type: selectedType,
      amount: amount,
      category: selectedCategory.name,
      account: selectedAccount.name,
      description: selectedCategory.name,
      date: new Date().toISOString()
    };
    
    DB.addTransaction(transaction);
    
    // Show success message
    showToast('Đã lưu giao dịch thành công!');
    
    // Navigate back
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 1000);
  }
}

// Transactions Page Logic
function initTransactionsPage() {
  loadAllTransactions();
  
  // Search functionality
  const searchInput = document.querySelector('input[type="text"]');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      filterTransactions(term);
    });
  }
}

function loadAllTransactions() {
  const transactions = DB.getTransactions();
  renderTransactions(transactions);
}

function renderTransactions(transactions) {
  const container = document.getElementById('transactions-list');
  if (!container) return;
  
  if (transactions.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-gray-400">
        <span class="material-symbols-outlined text-6xl mb-4">receipt_long</span>
        <p>Chưa có giao dịch nào</p>
      </div>
    `;
    return;
  }
  
  // Group by date
  const grouped = groupByDate(transactions);
  
  container.innerHTML = Object.entries(grouped).map(([date, items]) => `
    <div class="mb-4">
      <div class="sticky top-0 bg-background-light/95 dark:bg-background-dark/95 px-4 py-2 z-10">
        <h3 class="text-lg font-bold text-[#111418] dark:text-white">${date}</h3>
      </div>
      <div class="bg-white dark:bg-[#1a2634] mx-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        ${items.map(t => `
          <div class="flex items-center gap-4 p-4 justify-between border-b border-gray-50 dark:border-gray-700 last:border-0">
            <div class="flex items-center gap-4">
              <div class="${t.type === 'income' ? 'text-primary bg-primary/10' : 'text-red-500 bg-red-50 dark:bg-red-900/20'} flex items-center justify-center rounded-xl shrink-0 size-12">
                <span class="material-symbols-outlined text-[24px]">${getCategoryIcon(t.category)}</span>
              </div>
              <div class="flex flex-col justify-center">
                <p class="text-text-main dark:text-white text-base font-semibold">${t.description}</p>
                <div class="flex items-center gap-2 mt-0.5">
                  <p class="text-text-secondary dark:text-gray-400 text-sm">${t.account}</p>
                  <span class="text-text-secondary dark:text-gray-600 text-[10px]">•</span>
                  <p class="text-text-secondary dark:text-gray-400 text-sm">${formatTime(t.date)}</p>
                </div>
              </div>
            </div>
            <div class="shrink-0 flex flex-col items-end gap-1">
              <p class="${t.type === 'income' ? 'text-green-500' : 'text-red-500'} font-bold text-base">
                ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
              </p>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                ${t.type === 'income' ? 'Thu' : 'Chi'}
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function groupByDate(transactions) {
  const grouped = {};
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey;
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Hôm qua';
    } else {
      dateKey = formatDate(t.date);
    }
    
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(t);
  });
  
  return grouped;
}

function filterTransactions(term) {
  const transactions = DB.getTransactions().filter(t => 
    t.description.toLowerCase().includes(term) ||
    t.category.toLowerCase().includes(term)
  );
  renderTransactions(transactions);
}

// Dashboard Page Logic
function initDashboardPage() {
  const totals = DB.getTotals();
  
  // Update KPI cards
  document.querySelectorAll('.kpi-income').forEach(el => {
    el.textContent = formatCurrency(totals.income);
  });
  
  document.querySelectorAll('.kpi-expense').forEach(el => {
    el.textContent = formatCurrency(totals.expense);
  });
  
  document.querySelectorAll('.kpi-balance').forEach(el => {
    el.textContent = formatCurrency(totals.balance);
  });
  
  // Generate monthly chart data
  generateMonthlyChart();
  
  // Generate expense breakdown
  generateExpenseBreakdown();
}

function generateMonthlyChart() {
  const transactions = DB.getTransactions();
  const monthlyData = {};
  
  // Group by month
  transactions.forEach(t => {
    const date = new Date(t.date);
    const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    if (!monthlyData[key]) {
      monthlyData[key] = { income: 0, expense: 0 };
    }
    
    if (t.type === 'income') {
      monthlyData[key].income += t.amount;
    } else {
      monthlyData[key].expense += t.amount;
    }
  });
  
  // TODO: Render chart with actual data
}

function generateExpenseBreakdown() {
  const transactions = DB.getTransactions().filter(t => t.type === 'expense');
  const categoryTotals = {};
  
  transactions.forEach(t => {
    if (!categoryTotals[t.category]) categoryTotals[t.category] = 0;
    categoryTotals[t.category] += t.amount;
  });
  
  // TODO: Render pie chart with actual data
}

// Rooms Page Logic
function initRoomsPage() {
  loadRoomsList();
}

function loadRoomsList() {
  const rooms = DB.getRooms();
  const container = document.getElementById('rooms-list');
  
  if (!container) return;
  
  container.innerHTML = rooms.map(room => `
    <article class="flex flex-col bg-white dark:bg-[#1a2634] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
      <div class="p-4">
        <div class="flex justify-between items-start mb-3">
          <div class="flex gap-3">
            <div class="bg-center bg-no-repeat bg-cover rounded-lg w-16 h-16 shrink-0 bg-gray-200" style='background-image: url("${room.image}")'></div>
            <div>
              <h3 class="text-lg font-bold text-[#111418] dark:text-white leading-tight">${room.name}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${room.floor === 1 ? 'Tầng 1' : 'Tầng 2'}</p>
            </div>
          </div>
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${room.status === 'occupied' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}">
            <span class="w-1.5 h-1.5 rounded-full ${room.status === 'occupied' ? 'bg-primary' : 'bg-gray-400'} mr-1.5"></span>
            ${room.status === 'occupied' ? 'Đang thuê' : 'Trống'}
          </span>
        </div>
        <div class="flex justify-between items-end mb-4">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Giá thuê</p>
            <p class="text-lg font-bold text-[#111418] dark:text-white">${formatCurrency(room.price)}<span class="text-sm font-normal text-gray-500 dark:text-gray-400">/tháng</span></p>
          </div>
          ${room.tenant ? `
            <div class="text-right">
              <p class="text-xs text-gray-500 dark:text-gray-400">Người thuê: ${room.tenant}</p>
              ${room.dueDate ? `<p class="text-xs text-orange-500 mt-1">Hạn: ${room.dueDate}</p>` : ''}
            </div>
          ` : ''}
        </div>
        <button class="w-full flex cursor-pointer items-center justify-center rounded-lg h-10 ${room.status === 'occupied' ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200' : 'bg-primary/10 hover:bg-primary/20 text-primary'} gap-2 px-4 text-sm font-bold transition-colors" onclick="${room.status === 'occupied' ? `addRoomTransaction(${room.id})` : `createContract(${room.id})`}">
          <span class="material-symbols-outlined text-[20px]">${room.status === 'occupied' ? 'add_circle' : 'contract_edit'}</span>
          <span>${room.status === 'occupied' ? 'Thêm giao dịch' : 'Tạo hợp đồng'}</span>
        </button>
      </div>
    </article>
  `).join('');
}

// Tenants Page Logic
function initTenantsPage() {
  loadTenantsList();
}

function loadTenantsList() {
  const tenants = DB.getTenants();
  const container = document.getElementById('tenants-list');
  
  if (!container) return;
  
  container.innerHTML = tenants.map(tenant => `
    <div class="group relative flex flex-col gap-3 rounded-xl bg-white dark:bg-[#1a2634] p-4 shadow-sm transition-all active:scale-[0.99] mb-3 cursor-pointer">
      <div class="flex items-start justify-between">
        <div class="flex gap-4">
          <div class="relative h-14 w-14 shrink-0 rounded-full bg-cover bg-center" style='background-image: url("${tenant.avatar}")'></div>
          <div class="flex flex-col justify-center">
            <p class="text-lg font-bold text-[#111418] dark:text-white leading-tight">${tenant.name}</p>
            <div class="mt-1 flex items-center gap-2">
              <span class="rounded bg-primary/10 dark:bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary tracking-wide">${tenant.room}</span>
            </div>
          </div>
        </div>
        <div class="flex shrink-0 flex-col items-end gap-1">
          <span class="inline-flex items-center gap-1 rounded-full ${tenant.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'} px-2 py-1 text-xs font-semibold">
            <span class="material-symbols-outlined text-[14px]">${tenant.status === 'active' ? 'check_circle' : 'warning'}</span>
            ${tenant.status === 'active' ? 'Đang thuê' : 'Sắp hết hạn'}
          </span>
        </div>
      </div>
      <div class="border-t border-gray-100 dark:border-gray-700 pt-3">
        <div class="flex items-center gap-2 text-sm text-[#617289] dark:text-[#94a3b8]">
          <span class="material-symbols-outlined text-[18px]">date_range</span>
          <span>${formatDate(tenant.startDate)} - ${formatDate(tenant.endDate)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Receivables Page Logic
function initReceivablesPage() {
  loadReceivablesList();
  updateReceivablesStats();
}

function loadReceivablesList() {
  const rooms = DB.getRooms().filter(r => r.status === 'occupied');
  const container = document.getElementById('receivables-list');
  
  if (!container) return;
  
  const totalRent = rooms.reduce((sum, r) => sum + r.price, 0);
  
  container.innerHTML = rooms.map(room => `
    <div class="group relative flex flex-col gap-4 rounded-xl bg-white dark:bg-white/5 p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-4">
          <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 border border-gray-100 dark:border-gray-600" style='background-image: url("${room.image}")'></div>
          <div class="flex flex-col">
            <p class="text-[#111418] dark:text-white text-base font-bold">${room.tenant}</p>
            <p class="text-[#617289] dark:text-gray-400 text-sm">${room.name}</p>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <p class="text-[#111418] dark:text-white text-base font-bold">${formatCurrency(room.price)}</p>
          <span class="inline-flex items-center rounded-full bg-red-50 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-medium text-red-600 mt-1">
            Chưa thu
          </span>
        </div>
      </div>
      <div class="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
        <p class="text-xs text-gray-500">Hạn nộp: ${room.dueDate || '05/11/2023'}</p>
        <button class="flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-dark text-white h-9 px-4 text-sm font-medium transition-colors" onclick="sendReminder('${room.tenant}')">
          <span class="material-symbols-outlined text-[18px]">notifications_active</span>
          Gửi nhắc nhở
        </button>
      </div>
    </div>
  `).join('');
}

function updateReceivablesStats() {
  const rooms = DB.getRooms().filter(r => r.status === 'occupied');
  const total = rooms.reduce((sum, r) => sum + r.price, 0);
  const collected = 0; // TODO: Calculate from transactions
  
  const totalEl = document.querySelector('.total-receivable');
  const remainingEl = document.querySelector('.remaining-receivable');
  
  if (totalEl) totalEl.textContent = formatCurrency(total);
  if (remainingEl) remainingEl.textContent = formatCurrency(total - collected);
}

// Settings Page Logic
function initSettingsPage() {
  // Load current settings
  const settings = DB.getSettings();
  
  // Dark mode toggle
  const darkModeToggle = document.querySelector('input[type="checkbox"][value="dark"]');
  if (darkModeToggle) {
    darkModeToggle.checked = settings.darkMode;
    darkModeToggle.addEventListener('change', (e) => {
      settings.darkMode = e.target.checked;
      DB.saveSettings(settings);
      
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }
  
  // Large text toggle
  const largeTextToggle = document.querySelector('input[type="checkbox"][value="large"]');
  if (largeTextToggle) {
    largeTextToggle.checked = settings.largeText;
    largeTextToggle.addEventListener('change', (e) => {
      settings.largeText = e.target.checked;
      DB.saveSettings(settings);
      
      if (settings.largeText) {
        document.body.classList.add('text-lg');
      } else {
        document.body.classList.remove('text-lg');
      }
    });
  }
  
  // Export button
  const exportBtn = document.querySelector('.export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }
  
  // Import button
  const importBtn = document.querySelector('.import-btn');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      document.getElementById('import-file').click();
    });
  }
  
  // Import file input
  const importFile = document.getElementById('import-file');
  if (importFile) {
    importFile.addEventListener('change', importData);
  }
}

// Export/Import Functions
function exportData() {
  const data = DB.exportAll();
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `kakeibo-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  showToast('Đã xuất dữ liệu thành công!');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      DB.importAll(data);
      showToast('Đã nhập dữ liệu thành công!');
      
      // Reload page to reflect new data
      setTimeout(() => location.reload(), 1000);
    } catch (err) {
      alert('Lỗi: File không hợp lệ');
    }
  };
  reader.readAsText(file);
}

// Helper Functions
function getCategoryIcon(category) {
  const icons = {
    'Ăn uống': 'restaurant',
    'Di chuyển': 'directions_car',
    'Tiền nhà': 'home',
    'Hóa đơn': 'receipt_long',
    'Mua sắm': 'shopping_cart',
    'Giải trí': 'movie',
    'Lương': 'payments',
    'Thu nhập khác': 'trending_up',
    'Tiền thuê nhà': 'apartment'
  };
  return icons[category] || 'payments';
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm font-medium';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function viewTransaction(id) {
  // TODO: Show transaction detail modal
  console.log('View transaction:', id);
}

function selectCategory(element, id) {
  document.querySelectorAll('.category-chip').forEach(chip => {
    chip.classList.remove('bg-primary', 'text-white', 'shadow-md');
    chip.classList.add('bg-surface-light', 'dark:bg-surface-dark', 'text-[#111418]', 'dark:text-white');
  });
  
  element.classList.remove('bg-surface-light', 'dark:bg-surface-dark', 'text-[#111418]', 'dark:text-white');
  element.classList.add('bg-primary', 'text-white', 'shadow-md');
}

function addRoomTransaction(roomId) {
  window.location.href = `quick-add.html?room=${roomId}`;
}

function createContract(roomId) {
  // TODO: Show create contract modal
  alert('Tạo hợp đồng cho phòng ' + roomId);
}

function sendReminder(tenantName) {
  showToast(`Đã gửi nhắc nhở đến ${tenantName}`);
}