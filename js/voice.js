/**
 * Kakeibo Pro - Voice Input Module
 * Sử dụng Web Speech API để nhận dạng giọng nói tiếng Việt
 */

const VoiceInput = {
  recognition: null,
  isListening: false,
  
  // Initialize speech recognition
  init() {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return false;
    }
    
    // Create recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure
    this.recognition.lang = 'vi-VN';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    
    return true;
  },
  
  // Start listening
  start() {
    if (!this.recognition) {
      if (!this.init()) {
        alert('Trình duyệt không hỗ trợ nhập giọng nói. Vui lòng sử dụng Chrome hoặc Safari.');
        return Promise.reject('Not supported');
      }
    }
    
    return new Promise((resolve, reject) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      this.recognition.onstart = () => {
        this.isListening = true;
        updateVoiceUI('listening');
      };
      
      this.recognition.onresult = (event) => {
        interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update UI with interim results
        if (interimTranscript) {
          document.getElementById('voice-text').textContent = interimTranscript;
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        this.isListening = false;
        updateVoiceUI('error');
        
        if (event.error === 'not-allowed') {
          reject('Microphone permission denied');
        } else {
          reject(event.error);
        }
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        updateVoiceUI('idle');
        
        if (finalTranscript) {
          const parsed = this.parseCommand(finalTranscript);
          resolve(parsed);
        } else {
          reject('No speech detected');
        }
      };
      
      this.recognition.start();
    });
  },
  
  // Stop listening
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  },
  
  // Parse Vietnamese voice command
  parseCommand(text) {
    // Clean up text
    text = text.toLowerCase().trim();
    
    // Detect transaction type
    let type = 'expense';
    if (text.includes('thu') || text.includes('nhận') || text.includes('lương') || text.includes('tiền về')) {
      type = 'income';
    } else if (text.includes('chi') || text.includes('trả') || text.includes('mua') || text.includes('tiêu')) {
      type = 'expense';
    }
    
    // Extract amount
    let amount = this.extractAmount(text);
    
    // Extract category based on keywords
    let category = this.extractCategory(text, type);
    
    // Clean up description
    let description = this.cleanDescription(text);
    
    return {
      text: text,
      type: type,
      amount: amount,
      category: category,
      description: description,
      confidence: 0.8
    };
  },
  
  // Extract amount from text
  extractAmount(text) {
    // Common patterns in Vietnamese
    const patterns = [
      /(\d+)\s*(k|nghìn|ngàn)/i,           // 50k, 100 nghìn
      /(\d+)\s*(tr|triệu|củ)/i,             // 5tr, 10 triệu
      /(\d{1,3}(?:\.\d{3})+)/,               // 1.000.000
      /(\d{4,})/,                           // 1000000
      /(\d+)\s*(đ|d|đồng)/i                 // 50000 đồng
    ];
    
    for (let pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let amount = parseInt(match[1].replace(/\./g, ''));
        const unit = match[2] ? match[2].toLowerCase() : '';
        
        // Apply multipliers
        if (unit.includes('k') || unit.includes('nghìn') || unit.includes('ngàn')) {
          amount *= 1000;
        } else if (unit.includes('tr') || unit.includes('triệu') || unit.includes('củ')) {
          amount *= 1000000;
        }
        
        return amount;
      }
    }
    
    return 0;
  },
  
  // Extract category from text
  extractCategory(text, type) {
    const categories = DB.getCategories().filter(c => c.type === type);
    
    for (let cat of categories) {
      if (text.includes(cat.name.toLowerCase())) {
        return cat.name;
      }
    }
    
    // Default categories based on keywords
    if (type === 'expense') {
      if (text.includes('ăn') || text.includes('cơm') || text.includes('uống') || text.includes('cafe')) return 'Ăn uống';
      if (text.includes('xăng') || text.includes('xe') || text.includes('đi')) return 'Di chuyển';
      if (text.includes('nhà') || text.includes('trọ')) return 'Tiền nhà';
      if (text.includes('điện') || text.includes('nước') || text.includes('internet')) return 'Hóa đơn';
      if (text.includes('mua') || text.includes('shopping')) return 'Mua sắm';
    } else {
      if (text.includes('lương')) return 'Lương';
      if (text.includes('thuê') || text.includes('phòng')) return 'Tiền thuê nhà';
    }
    
    return type === 'income' ? 'Thu nhập khác' : 'Chi tiêu khác';
  },
  
  // Clean up description
  cleanDescription(text) {
    // Remove amount patterns
    let cleaned = text
      .replace(/\d+\s*(k|nghìn|ngàn|tr|triệu|củ|đ|đồng)/gi, '')
      .replace(/(thu|chi|nhận|trả)/gi, '')
      .trim();
    
    // Capitalize first letter
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
};

// UI update functions
function updateVoiceUI(state) {
  const micBtn = document.querySelector('.voice-mic-btn');
  const statusText = document.getElementById('voice-status');
  const waveBars = document.querySelectorAll('.voice-wave-bar');
  
  if (!micBtn) return;
  
  switch(state) {
    case 'listening':
      micBtn.classList.add('recording');
      if (statusText) statusText.textContent = 'Đang nghe...';
      waveBars.forEach(bar => bar.style.animationPlayState = 'running');
      break;
    case 'idle':
      micBtn.classList.remove('recording');
      if (statusText) statusText.textContent = 'Nhấn để nói';
      waveBars.forEach(bar => bar.style.animationPlayState = 'paused');
      break;
    case 'error':
      micBtn.classList.remove('recording');
      if (statusText) statusText.textContent = 'Có lỗi, thử lại';
      waveBars.forEach(bar => bar.style.animationPlayState = 'paused');
      break;
  }
}

// Handle voice input button click
async function startVoiceInput() {
  try {
    const result = await VoiceInput.start();
    
    // Fill form with parsed data
    if (result.amount > 0) {
      // Store result for confirmation
      window.voiceResult = result;
      
      // Show confirmation modal or navigate to quick-add with data
      showVoiceConfirmation(result);
    } else {
      alert('Không nhận diện được số tiền. Vui lòng thử lại.');
    }
  } catch (error) {
    console.error('Voice input error:', error);
    if (error === 'Microphone permission denied') {
      alert('Vui lòng cho phép truy cập microphone để sử dụng tính năng này.');
    }
  }
}

// Show voice confirmation UI
function showVoiceConfirmation(result) {
  // You can show a modal here or fill the quick-add form
  const confirmed = confirm(`Xác nhận giao dịch:\n\n` +
    `Loại: ${result.type === 'income' ? 'Thu' : 'Chi'}\n` +
    `Số tiền: ${formatCurrency(result.amount)}\n` +
    `Danh mục: ${result.category}\n` +
    `Mô tả: ${result.description}`);
  
  if (confirmed) {
    // Create transaction
    const transaction = {
      type: result.type,
      amount: result.amount,
      category: result.category,
      account: 'Tiền mặt', // Default
      description: result.description,
      date: new Date().toISOString()
    };
    
    DB.addTransaction(transaction);
    showToast('Đã lưu giao dịch!');
    
    // Navigate to home
    window.location.href = 'home.html';
  }
}

// Make available globally
window.VoiceInput = VoiceInput;
window.startVoiceInput = startVoiceInput;