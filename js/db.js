/**
 * Kakeibo Pro - Database Service
 * Sử dụng LocalStorage để lưu trữ dữ liệu local
 */

const DB = {
  // Keys for localStorage
  KEYS: {
    TRANSACTIONS: 'kakeibo_transactions',
    ROOMS: 'kakeibo_rooms',
    TENANTS: 'kakeibo_tenants',
    SETTINGS: 'kakeibo_settings',
    ACCOUNTS: 'kakeibo_accounts',
    CATEGORIES: 'kakeibo_categories'
  },

  // Initialize database with default data
  init() {
    if (!localStorage.getItem(this.KEYS.TRANSACTIONS)) {
      this.setDefaults();
    }
  },

  // Set default data
  setDefaults() {
    // Default accounts
    const defaultAccounts = [
      { id: 1, name: 'Tiền mặt', type: 'cash', balance: 5000000, icon: 'payments' },
      { id: 2, name: 'Vietcombank', type: 'bank', balance: 15000000, icon: 'account_balance' },
      { id: 3, name: 'Momo', type: 'ewallet', balance: 2000000, icon: 'smartphone' }
    ];

    // Default categories
    const defaultCategories = [
      { id: 1, name: 'Ăn uống', type: 'expense', icon: 'restaurant', color: '#EF4444' },
      { id: 2, name: 'Di chuyển', type: 'expense', icon: 'directions_car', color: '#3B82F6' },
      { id: 3, name: 'Tiền nhà', type: 'expense', icon: 'home', color: '#8B5CF6' },
      { id: 4, name: 'Hóa đơn', type: 'expense', icon: 'receipt_long', color: '#F59E0B' },
      { id: 5, name: 'Mua sắm', type: 'expense', icon: 'shopping_cart', color: '#EC4899' },
      { id: 6, name: 'Giải trí', type: 'expense', icon: 'movie', color: '#10B981' },
      { id: 7, name: 'Lương', type: 'income', icon: 'payments', color: '#22C55E' },
      { id: 8, name: 'Thu nhập khác', type: 'income', icon: 'trending_up', color: '#136dec' },
      { id: 9, name: 'Tiền thuê nhà', type: 'income', icon: 'apartment', color: '#F97316' }
    ];

    // Sample transactions
    const sampleTransactions = [
      {
        id: 1,
        type: 'income',
        amount: 15000000,
        category: 'Lương',
        account: 'Vietcombank',
        description: 'Lương tháng 10',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        type: 'expense',
        amount: 500000,
        category: 'Ăn uống',
        account: 'Tiền mặt',
        description: 'Siêu thị VinMart',
        date: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        type: 'income',
        amount: 4500000,
        category: 'Tiền thuê nhà',
        account: 'Momo',
        description: 'Thu tiền phòng P101',
        date: new Date(Date.now() - 172800000).toISOString(),
        createdAt: new Date().toISOString()
      }
    ];

    // Sample rooms
    const sampleRooms = [
      {
        id: 1,
        name: 'Phòng 101',
        floor: 1,
        price: 4500000,
        status: 'occupied',
        tenant: 'Nguyễn Văn A',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
        dueDate: '05/11/2023'
      },
      {
        id: 2,
        name: 'Phòng 102',
        floor: 1,
        price: 4800000,
        status: 'vacant',
        tenant: null,
        image: 'https://images.unsplash.com/photo-1502005229766-5283522613be?w=400',
        dueDate: null
      },
      {
        id: 3,
        name: 'Phòng 201',
        floor: 2,
        price: 5200000,
        status: 'occupied',
        tenant: 'Trần Thị B',
        image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400',
        dueDate: '15/12/2023'
      }
    ];

    // Sample tenants
    const sampleTenants = [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        phone: '0912345678',
        room: 'Phòng 101',
        startDate: '2023-05-01',
        endDate: '2024-05-01',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'
      },
      {
        id: 2,
        name: 'Trần Thị B',
        phone: '0987654321',
        room: 'Phòng 201',
        startDate: '2023-06-15',
        endDate: '2024-02-15',
        status: 'ending-soon',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'
      },
      {
        id: 3,
        name: 'Lê Hoàng C',
        phone: '0909123456',
        room: 'Phòng 301',
        startDate: '2023-08-10',
        endDate: '2024-08-10',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200'
      }
    ];

    this.save(this.KEYS.ACCOUNTS, defaultAccounts);
    this.save(this.KEYS.CATEGORIES, defaultCategories);
    this.save(this.KEYS.TRANSACTIONS, sampleTransactions);
    this.save(this.KEYS.ROOMS, sampleRooms);
    this.save(this.KEYS.TENANTS, sampleTenants);
  },

  // Generic save method
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // Generic get method
  get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  // Transactions
  getTransactions() {
    return this.get(this.KEYS.TRANSACTIONS);
  },

  addTransaction(transaction) {
    const transactions = this.getTransactions();
    transaction.id = Date.now();
    transaction.createdAt = new Date().toISOString();
    transactions.unshift(transaction);
    this.save(this.KEYS.TRANSACTIONS, transactions);
    return transaction;
  },

  deleteTransaction(id) {
    const transactions = this.getTransactions().filter(t => t.id !== id);
    this.save(this.KEYS.TRANSACTIONS, transactions);
  },

  // Calculate totals
  getTotals() {
    const transactions = this.getTransactions();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    let income = 0, expense = 0;
    
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
      }
    });
    
    return {
      income,
      expense,
      balance: income - expense
    };
  },

  // Rooms
  getRooms() {
    return this.get(this.KEYS.ROOMS);
  },

  addRoom(room) {
    const rooms = this.getRooms();
    room.id = Date.now();
    rooms.push(room);
    this.save(this.KEYS.ROOMS, rooms);
    return room;
  },

  updateRoom(id, updates) {
    const rooms = this.getRooms().map(r => 
      r.id === id ? { ...r, ...updates } : r
    );
    this.save(this.KEYS.ROOMS, rooms);
  },

  // Tenants
  getTenants() {
    return this.get(this.KEYS.TENANTS);
  },

  addTenant(tenant) {
    const tenants = this.getTenants();
    tenant.id = Date.now();
    tenants.push(tenant);
    this.save(this.KEYS.TENANTS, tenants);
    return tenant;
  },

  // Categories
  getCategories() {
    return this.get(this.KEYS.CATEGORIES);
  },

  // Accounts
  getAccounts() {
    return this.get(this.KEYS.ACCOUNTS);
  },

  // Settings
  getSettings() {
    const settings = localStorage.getItem(this.KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : { 
      darkMode: false, 
      largeText: false,
      currency: 'VND'
    };
  },

  saveSettings(settings) {
    this.save(this.KEYS.SETTINGS, settings);
  },

  // Export all data
  exportAll() {
    return {
      transactions: this.getTransactions(),
      rooms: this.getRooms(),
      tenants: this.getTenants(),
      accounts: this.getAccounts(),
      categories: this.getCategories(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString()
    };
  },

  // Import data
  importAll(data) {
    if (data.transactions) this.save(this.KEYS.TRANSACTIONS, data.transactions);
    if (data.rooms) this.save(this.KEYS.ROOMS, data.rooms);
    if (data.tenants) this.save(this.KEYS.TENANTS, data.tenants);
    if (data.accounts) this.save(this.KEYS.ACCOUNTS, data.accounts);
    if (data.categories) this.save(this.KEYS.CATEGORIES, data.categories);
    if (data.settings) this.save(this.KEYS.SETTINGS, data.settings);
  },

  // Clear all data
  clearAll() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};

// Initialize on load
DB.init();

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Get relative time
function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return formatDate(dateString);
}

// Export for use in other files
window.DB = DB;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.getRelativeTime = getRelativeTime;