import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isThinking?: boolean;
}

export default function ChatbotPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Xin chào! Tôi là trợ lý AI chuyên về Crypto & Forex. Bạn cần tôi phân tích biểu đồ nào hay có câu hỏi gì về thị trường hôm nay?',
      isUser: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), text, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      let aiText = '';
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes('btc') || lowerText.includes('bitcoin')) {
        aiText = 'Dựa trên phân tích kỹ thuật, BTC đang nằm trong vùng kháng cự mạnh ở mốc 64,500. MACD cho thấy động lượng mua đang suy yếu. Khuyến nghị theo dõi thêm nếu giá phá vỡ mức hỗ trợ 63,000.';
      } else if (lowerText.includes('eth') || lowerText.includes('ethereum')) {
        aiText = 'Ethereum đang tích lũy quanh mốc 3,400. Mạng lưới Dencun đã hoàn tất cập nhật giúp giảm phí gas đáng kể. Xu hướng ngắn hạn là trung lập (Neutral).';
      } else {
        aiText = 'Tôi đang tổng hợp dữ liệu on-chain và phân tích. Vui lòng cho tôi biết mã giao dịch cụ thể (ví dụ: BTC, ETH) để phân tích sâu hơn.';
      }

      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: aiText, isUser: false };
      setMessages(prev => [...prev, aiMsg]);
    }, 1500); // 1.5 seconds typing simulation
  };

  return (
    <aside className="ai-panel">
      <div className="ai-header">
        <div className="ai-avatar">AI</div>
        <div className="ai-title">
          <h3>Chartix Intelligence</h3>
          <p>Online & Ready</p>
        </div>
      </div>
      
      <div className="chat-history" ref={chatContainerRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`msg ${msg.isUser ? 'user' : 'ai'}`}>
            <div className="msg-bubble">
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="msg ai">
            <div className="msg-bubble typing-indicator">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
      </div>
      
      <div className="chat-input-area">
        <div className="input-box">
          <input 
            type="text" 
            placeholder="Hỏi AI về mã giao dịch..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            autoComplete="off" 
          />
          <button 
            className="btn-send" 
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}
