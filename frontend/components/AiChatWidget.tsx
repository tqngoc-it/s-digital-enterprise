'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, RotateCcw, ChevronDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: 'Báo giá 3 gói dịch vụ', query: 'S-Digital có những gói dịch vụ nào và báo giá chi tiết ra sao?' },
  { label: 'Tư vấn Quảng cáo số (Ads)', query: 'Tôi muốn tư vấn dịch vụ quảng cáo Google, Facebook và TikTok tối ưu ROI' },
  { label: 'Tổ chức Giải Marathon & Chip timing', query: 'Quy trình tổ chức giải chạy marathon và hệ thống timing chip của S-Digital thế nào?' },
  { label: 'Thuê Đội ngũ Trọng tài Quốc tế', query: 'S-Digital cung cấp trọng tài cho các môn nào và có chứng chỉ gì?' },
  { label: 'Xử lý Khủng hoảng 30 phút', query: 'Dịch vụ xử lý khủng hoảng truyền thông 24/7 của S-Digital hoạt động như thế nào?' },
  { label: 'Hotline & Thông tin liên hệ', query: 'Cho tôi xin hotline, địa chỉ văn phòng và thông tin liên hệ của S-Digital' },
];

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: 'assistant',
  content: `Dạ S-Digital xin chào Quý khách! Em là **Trợ lý AI S-Digital** trực chiến 24/7.\n\nEm có thể hỗ trợ tư vấn chi tiết về:\n* **Tiếp thị số (Digital Suite):** Quảng cáo Google/Meta/TikTok tối ưu ROI, Booking 500+ KOLs, Thiết kế Website UX/SEO, Video TVC 4K & Livestream bán hàng.\n* **Truyền thông thể thao (Sports Hub):** Tổ chức giải Marathon (chip timing chuẩn AIMS), Giải bóng đá, Cung cấp 100+ trọng tài quốc tế AFC/FIBA, Học viện thể thao.\n* **Bảng giá linh hoạt:** Gói Starter (từ 15tr), Growth (từ 35tr) & Gói May đo riêng.\n* **Xử lý khủng hoảng 24/7:** Phản ứng thần tốc trong 30 phút.\n\nQuý khách đang quan tâm đến giải pháp nào ạ?`,
  timestamp: 'Vừa xong',
};

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessageId = 'msg-' + Date.now();
    const newUserMsg: Message = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const replyContent =
        data?.reply ||
        'Dạ S-Digital đã nhận được thông tin. Quý khách vui lòng gọi ngay Hotline **0826 868 979** hoặc để lại Số điện thoại để chuyên viên hỗ trợ tức thì ạ!';

      const assistantMsg: Message = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn:', err);
      const fallbackMsg: Message = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content:
          'Dạ chuyên viên S-Digital đang sẵn sàng hỗ trợ Quý khách! Vui lòng liên hệ trực tiếp Hotline **0826 868 979** hoặc để lại Số điện thoại/Email để nhận báo giá chi tiết trong 15 phút ạ.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        ...INITIAL_MESSAGE,
        id: 'init-' + Date.now(),
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');

    return (
      <div className="space-y-1.5 leading-relaxed text-sm">
        {lines.map((line, lineIdx) => {
          if (!line.trim()) {
            return <div key={lineIdx} className="h-1.5" />;
          }

          const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
          const formattedLine = isBullet ? line.trim().substring(2) : line;

          const parts = formattedLine.split(/(\*\*.*?\*\*)/g);

          const renderedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              const innerText = part.slice(2, -2);
              if (innerText.includes('0826 868 979')) {
                return (
                  <a
                    key={pIdx}
                    href="tel:0826868979"
                    className="font-bold text-[#FF5722] hover:underline inline-flex items-center"
                  >
                    <span>{innerText}</span>
                  </a>
                );
              }
              return (
                <strong key={pIdx} className="font-semibold text-slate-100">
                  {innerText}
                </strong>
              );
            }
            return <span key={pIdx}>{part}</span>;
          });

          if (isBullet) {
            return (
              <div key={lineIdx} className="flex items-start gap-2 pl-1">
                <span className="text-[#FF5722] font-bold text-xs mt-0.5">-</span>
                <div className="flex-1">{renderedLine}</div>
              </div>
            );
          }

          return <p key={lineIdx}>{renderedLine}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* 1. NÚT NỔI GÓC DƯỚI BÊN PHẢI */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {!isOpen && showTooltip && (
          <div className="mb-3 relative group hidden sm:flex items-center gap-2 bg-[#0c1222] border border-[#00E5FF]/40 text-slate-200 text-xs px-3.5 py-2 rounded-xl shadow-[0_8px_20px_rgba(0,229,255,0.2)]">
            <span>Tư vấn dịch vụ & báo giá 24/7 cùng <strong>S-Digital AI</strong></span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-slate-400 hover:text-slate-200 ml-1 p-0.5 rounded cursor-pointer"
              title="Đóng gợi ý"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#0c1222] border-b border-r border-[#00E5FF]/40 rotate-45" />
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className={`relative group flex items-center justify-center rounded-full transition-all duration-300 ${
            isOpen
              ? 'w-13 h-13 bg-slate-800 border-2 border-slate-600 shadow-xl text-slate-300 hover:text-white'
              : 'w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-[#FF5722] via-[#F4511E] to-[#FF8A65] border-2 border-[#00E5FF] text-white shadow-[0_0_30px_rgba(255,87,34,0.65)] hover:shadow-[0_0_35px_rgba(0,229,255,0.85)] hover:scale-105 active:scale-95'
          }`}
          aria-label={isOpen ? 'Thu nhỏ khung chat' : 'Mở S-Digital AI Chatbot'}
        >
          {isOpen ? (
            <ChevronDown className="w-6 h-6 transition-transform group-hover:translate-y-0.5" />
          ) : (
            <>
              {/* Radar pulse rings */}
              <span className="absolute -inset-1 rounded-full bg-[#00E5FF]/30 blur-sm animate-ping opacity-60 pointer-events-none" />
              
              {/* Icon Con Bot */}
              <Bot className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-md transition-transform group-hover:scale-110" />
              
              {/* Online status indicator */}
              <span className="absolute top-0 right-0 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#060913]" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* 2. KHUNG CHAT S-DIGITAL AI */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[590px] max-h-[82vh] flex flex-col rounded-2xl bg-[#090d18]/95 backdrop-blur-xl border border-slate-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6"
          role="dialog"
          aria-label="Khung chat S-Digital AI"
        >
          <div className="h-1 w-full bg-gradient-to-r from-[#FF5722] via-[#00E5FF] to-[#FF5722]" />

          {/* HEADER */}
          <div className="px-4 py-3.5 bg-[#0e1526] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center font-bold text-xs text-[#00E5FF]">
                AI
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm tracking-wide">S-Digital AI</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                    24/7 Online
                  </span>
                </div>
                <p className="text-xs text-slate-400">Trợ lý tư vấn giải pháp & báo giá</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Làm mới đoạn chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Thu nhỏ khung chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MESSAGE LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {messages.map((msg) => {
              const isBot = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-md ${
                      isBot
                        ? 'bg-[#131b2e] border border-slate-700/60 text-slate-200 rounded-tl-xs'
                        : 'bg-gradient-to-r from-[#FF5722] to-[#E64A19] text-white rounded-tr-xs font-normal'
                    }`}
                  >
                    {isBot ? renderFormattedText(msg.content) : <p className="leading-relaxed text-sm whitespace-pre-wrap">{msg.content}</p>}
                    <div
                      className={`text-[10px] mt-1 text-right ${
                        isBot ? 'text-slate-500' : 'text-orange-200/80'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* LOADING STATE */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#131b2e] border border-slate-700/60 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-slate-400 ml-1.5">Đang xử lý phản hồi...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* GỢI Ý CÂU HỎI NHANH VỚI CUỘN CHUỘT NGANG */}
          <div className="px-3 py-2 bg-[#0b101e] border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-400">
              <span className="font-medium text-slate-300">Gợi ý câu hỏi nhanh:</span>
              <span className="text-[10px] text-slate-500">Lăn chuột để xem thêm →</span>
            </div>
            
            <div 
              onWheel={(e) => {
                if (e.deltaY !== 0) {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
              className="flex gap-2 overflow-x-auto pb-1 select-none scrollbar-thin scrollbar-thumb-slate-700/80 scrollbar-track-slate-900/40"
            >
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt.query)}
                  disabled={isLoading}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-[#00E5FF]/60 transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT BAR */}
          <div className="p-3 bg-[#0e1526] border-t border-slate-800">
            <div className="flex items-center gap-2 bg-[#070b14] border border-slate-700 focus-within:border-[#00E5FF] rounded-xl px-3 py-1.5 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi S-Digital AI về dịch vụ, giá..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  inputValue.trim() && !isLoading
                    ? 'bg-gradient-to-r from-[#FF5722] to-[#E64A19] text-white hover:brightness-110 shadow-[0_0_10px_rgba(255,87,34,0.5)] cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
                title="Gửi tin nhắn (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between mt-2 px-1 text-[11px]">
              <span className="text-slate-400">
                Bảo mật & Trực tuyến 24/7
              </span>
              <a
                href="tel:0826868979"
                className="text-[#FF5722] hover:text-[#FF8A65] font-medium transition-colors"
              >
                Hotline: 0826 868 979
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}