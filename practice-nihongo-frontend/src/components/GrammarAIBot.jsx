import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

const GrammarAIBot = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Chào bạn! Mình là trợ lý AI ngữ pháp tiếng Nhật. Bạn muốn hỏi về cấu trúc ngữ pháp nào?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await apiClient.post('/ai/grammar-chat', {
        history: messages,
        userMessage: userMessage
      });

      const aiResponseText = response.data;
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponseText }]);
    } catch (error) {
      console.error('Lỗi khi gọi AI:', error);
      setMessages(prev => [...prev, { sender: 'ai', text: 'Xin lỗi, đã có lỗi xảy ra hoặc server quá tải. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 sm:bottom-6 left-4 sm:left-6 w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:bg-black dark:hover:bg-slate-200 transition-all z-[9999] hover:scale-105 active:scale-95 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        title="Trợ lý AI Ngữ pháp"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-4 sm:bottom-6 left-4 sm:left-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[600px] max-h-[calc(100dvh-6rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 transform origin-bottom-left z-[9999] border border-slate-200 dark:border-slate-800 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-4 rounded-t-2xl flex justify-between items-center shadow-md border-b border-slate-800 dark:border-slate-900">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">AI Ngữ pháp</h3>
              <p className="text-xs text-slate-300 dark:text-slate-400">Giải thích dễ hiểu & ngắn gọn</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 rounded-br-sm' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm'
              }`}>
                {msg.sender === 'ai' ? (
                  <div className="prose prose-sm prose-slate dark:prose-invert max-w-none ai-markdown">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-sm p-3 shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-slate-900 dark:text-slate-300" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Đang suy nghĩ...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-b-2xl border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về ngữ pháp (ví dụ: phân biệt は và が)..."
              className="flex-1 max-h-32 min-h-[44px] p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/50 dark:focus:ring-white/50 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-black dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-shrink-0 flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GrammarAIBot;
