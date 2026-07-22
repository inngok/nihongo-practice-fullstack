import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeftOutlined, SendOutlined, MessageOutlined, BulbOutlined, ThunderboltOutlined, LockOutlined } from '@ant-design/icons';
import { message } from 'antd';

import { SCENARIOS } from './constants';
import ScenarioSelector from './components/ScenarioSelector';
import AiFeedbackPanel from './components/AiFeedbackPanel';


export default function AiChat() {
  const { currentUser } = useAuth();
  const [activeScenario, setActiveScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showFeedbackPane, setShowFeedbackPane] = useState(true);

  const chatContainerRef = useRef(null);

  if (!currentUser) {
    return (
      <div className="pt-24 min-h-screen bg-white flex flex-col items-center justify-center px-4 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-150 rounded-[2.5rem] p-10 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-800 text-xl shadow-inner">
            <LockOutlined className="text-black" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-black text-slate-950 tracking-tight uppercase">Yêu cầu Đăng nhập</h1>
            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
              Tính năng đàm thoại AI yêu cầu tài khoản để lưu trữ các từ vựng bạn học được và hỗ trợ phân tích cấu trúc câu.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link to="/login" className="w-full py-3.5 bg-black text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-widest transition-all">
              Đăng nhập ngay
            </Link>
            <Link to="/register" className="w-full py-3.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 uppercase tracking-widest transition-all">
              Tạo tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Auto-scroll to bottom of conversation inside the chat container (never scrolls the global page)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  // Reset window scroll position to 0 on mount and state change to prevent cutoff under fixed header
  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.innerWidth < 1024) {
      setShowFeedbackPane(false);
    }
  }, [activeScenario]);

  // Start a new scenario with dynamic initial texts
  const handleStartScenario = (scenario) => {
    setActiveScenario(scenario);
    setMessages([
      {
        sender: 'ai',
        text: scenario.firstMsg,
        romaji: '',
        translation: scenario.firstMsgTranslation
      }
    ]);
    setLatestFeedback(null);
    setSuggestions(scenario.initialSuggestions || []);
  };

  // Exit current scenario
  const handleExitScenario = () => {
    setActiveScenario(null);
    setMessages([]);
    setLatestFeedback(null);
    setSuggestions([]);
  };

  const handleSelectSuggestion = (text) => {
    handleSendMessage(text);
  };

  // Send message to AI
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || loading) return;

    const updatedMessages = [...messages, { sender: 'user', text }];
    setMessages(updatedMessages);
    setInputValue('');
    setLoading(true);

    try {
      const historyPayload = updatedMessages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await apiClient.post('/ai/chat', {
        scenario: activeScenario.id,
        userMessage: text,
        history: historyPayload
      });

      const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: data.reply,
        romaji: data.romaji,
        translation: data.translation
      }]);

      setLatestFeedback(data.feedback);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("AI Chat Error:", error);
      message.error("Không thể kết nối với Trợ lý AI. Vui lòng kiểm tra lại kết nối mạng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-white flex flex-col font-sans select-none pt-36 lg:pt-24 pb-4">
      
      {/* 1. SCENARIO SELECTOR VIEW */}
      {!activeScenario ? (
        <ScenarioSelector onStartScenario={handleStartScenario} />
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-4 py-4 gap-6 overflow-hidden">
          
          {/* LEFT: MINIMALIST CHAT PANEL */}
          <div className="flex-1 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col overflow-hidden h-full shadow-sm">
            
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleExitScenario}
                  className="w-10 h-10 border border-slate-100 flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-95 text-slate-800"
                >
                  <ArrowLeftOutlined className="text-xs" />
                </button>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                    {activeScenario.title}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    ĐỐI TÁC: {activeScenario.subTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFeedbackPane(!showFeedbackPane)}
                className={`lg:hidden px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${showFeedbackPane ? 'bg-black text-white border-black' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
              >
                <BulbOutlined />
                Nhận xét
              </button>
            </div>

            {/* Conversation list */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6 space-y-5 bg-slate-50/20">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${msg.sender === 'user' ? 'bg-black text-white' : 'bg-white border border-slate-100 text-slate-800'}`}>
                    
                    {/* Main Japanese kana/kanji Text */}
                    <p className="text-xs md:text-sm font-bold tracking-wide leading-relaxed">
                      {msg.text}
                    </p>

                    {/* Meta info for AI bubble */}
                    {msg.sender === 'ai' && (
                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-[11px] font-semibold text-slate-400">
                        {msg.romaji && (
                          <p className="italic text-[10px] font-bold text-slate-400">
                            {msg.romaji}
                          </p>
                        )}
                        {msg.translation && (
                          <p className="text-[11px] text-slate-400">
                            🇻🇳 {msg.translation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2">
                  <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider animate-pulse">Kenji đang trả lời...</span>
                </div>
              )}
              
            </div>

            {/* SUGGESTED PILLS */}
            {suggestions.length > 0 && !loading && (
              <div className="px-4 py-3 md:px-8 md:py-4 bg-white border-t border-slate-50 flex flex-col gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <BulbOutlined /> Ý kiến phản hồi nhanh đề xuất (Click để gửi):
                </span>
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectSuggestion(sug.text)}
                      className="flex-shrink-0 py-2.5 px-4 rounded-xl border border-slate-100 hover:border-black bg-slate-50/50 hover:bg-white transition-all text-left max-w-xs"
                    >
                      <p className="text-[11px] font-extrabold text-slate-900 tracking-wide">{sug.text}</p>
                      <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">{sug.translation}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Footer */}
            <div className="p-3 md:p-5 bg-white border-t border-slate-50 flex gap-3 items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Nhập hội thoại tiếng Nhật của bạn vào đây..."
                disabled={loading}
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-5 py-3.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black focus:bg-white transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputValue.trim()}
                className="w-12 h-12 bg-black text-white hover:bg-slate-800 flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-black active:scale-95"
              >
                <SendOutlined className="text-xs" />
              </button>
            </div>
          </div>

          {/* RIGHT: DETAILED TUTOR COMMENTARY PANEL */}
          <AiFeedbackPanel 
            showFeedbackPane={showFeedbackPane}
            setShowFeedbackPane={setShowFeedbackPane}
            latestFeedback={latestFeedback}
          />
        </div>
      )}
    </div>
  );
}
