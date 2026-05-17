import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeftOutlined, SendOutlined, MessageOutlined, BulbOutlined, ThunderboltOutlined, LockOutlined } from '@ant-design/icons';
import { message } from 'antd';

const SCENARIOS = [
  {
    id: "casual_friend",
    num: "01",
    title: "Trò chuyện thân mật",
    subTitle: "Kenji (Bạn thân)",
    desc: "Tán gẫu tự do, nói về cuối tuần, sở thích bằng văn phong suồng sã của giới trẻ Nhật Bản (Kougotai).",
    firstMsg: "お疲れ！最近どう？週末何する予定？",
    firstMsgTranslation: "Chào cậu! Dạo này thế nào rồi? Cuối tuần này cậu có kế hoạch gì chưa?",
    initialSuggestions: [
      { text: "お疲れ！最近はバイトで忙しいよ。", translation: "Chào cậu! Dạo này tớ bận làm thêm quá." },
      { text: "特に予定ないから、一緒にどこか行かない？", translation: "Tớ chưa có kế hoạch gì cả, hay tụi mình đi đâu chơi đi?" },
      { text: "週末は家でゆっくり映画を見るつもり！", translation: "Cuối tuần tớ định ở nhà thảnh thơi xem phim thôi!" }
    ]
  },
  {
    id: "ramen_shop",
    num: "02",
    title: "Gọi món quán Ramen",
    subTitle: "Tenin (Nhân viên quán)",
    desc: "Vào vai thực khách gọi món mì Ramen, chọn độ mềm của mì, toppings và thực hiện thanh toán.",
    firstMsg: "いらっしゃいませ！ご注文はお決まりですか？麺のかたさはどうなさいますか？",
    firstMsgTranslation: "Chào mừng quý khách! Quý khách đã quyết định chọn món chưa ạ? Quý khách muốn độ cứng của mì thế nào ạ?",
    initialSuggestions: [
      { text: "はい、醤油ラーメンを一つお願いします。", translation: "Vâng, cho tôi một bát mì Shoyu Ramen." },
      { text: "麺はかためでお願いします！", translation: "Cho tôi mì sợi cứng nhé!" },
      { text: "トッピングにチャーシューを追加してください。", translation: "Vui lòng thêm thịt xá xíu làm topping." }
    ]
  },
  {
    id: "hotel_reception",
    num: "03",
    title: "Nhận phòng Khách sạn",
    subTitle: "Receptionist (Lễ tân)",
    desc: "Thực hiện các thủ tục check-in, hỏi dịch vụ phòng, gửi hành lý bằng kính ngữ Nhật Bản (Keigo).",
    firstMsg: "いらっしゃいませ。京都グランドホテルへようこそ。本日ご宿泊のご予約でお間違いないでしょうか？",
    firstMsgTranslation: "Chào mừng quý khách đến với khách sạn Kyoto Grand Hotel. Quý khách đã đặt phòng lưu trú hôm nay đúng không ạ?",
    initialSuggestions: [
      { text: "はい、グエンという名前で予約しております。", translation: "Vâng, tôi đặt phòng dưới tên Nguyen." },
      { text: "チェックインをお願いします。パスポートはこちらです。", translation: "Vui lòng làm thủ tục check-in cho tôi. Hộ chiếu của tôi đây ạ." },
      { text: "荷物を部屋まで運んでいただけますか？", translation: "Anh/chị có thể chuyển giúp hành lý lên phòng cho tôi không?" }
    ]
  },
  {
    id: "asking_directions",
    num: "04",
    title: "Hỏi đường ở Shibuya",
    subTitle: "Passerby (Người qua đường)",
    desc: "Luyện tập hỏi đường đi bộ ra ga Shibuya, siêu thị hoặc quán cafe gần nhất bằng các câu nói lịch sự thường ngày.",
    firstMsg: "こんにちは！何かお困りですか？どちらに行きたいんでしょうか？",
    firstMsgTranslation: "Xin chào! Bạn đang gặp khó khăn gì ạ? Bạn muốn đi đến địa điểm nào vậy?",
    initialSuggestions: [
      { text: "すみません、渋谷駅へはどう行けばいいですか？", translation: "Xin lỗi, làm thế nào để đi đến ga Shibuya vậy ạ?" },
      { text: "この近くにコンビニはありますか？", translation: "Gần đây có cửa hàng tiện lợi nào không ạ?" },
      { text: "まっすぐ行って、右に曲がればいいですか？", translation: "Tôi cứ đi thẳng rồi rẽ phải đúng không ạ?" }
    ]
  },
  {
    id: "parttime_interview",
    num: "05",
    title: "Phỏng vấn xin việc",
    subTitle: "Manager (Quản lý cửa hàng)",
    desc: "Mô phỏng phỏng vấn xin việc làm thêm (Baito) tại cửa hàng tiện lợi Nhật Bản. Trả lời về ca làm và năng lực.",
    firstMsg: "それでは面接を始めますね。まずは簡単に自己紹介と、週に何回くらいシフトに入れるか教えてください。",
    firstMsgTranslation: "Vậy chúng ta bắt đầu phỏng vấn nhé. Trước tiên bạn hãy giới thiệu bản thân ngắn gọn và cho biết một tuần bạn có thể đăng ký làm mấy ca làm nhé.",
    initialSuggestions: [
      { text: "はじめまして、グエンと申します。週に3日、月水金に入れます。", translation: "Rất vui được gặp anh, tôi tên là Nguyen. Tôi có thể làm 1 tuần 3 buổi vào thứ 2, 4, 6." },
      { text: "コンビニでのアルバイト経験が1年あります。", translation: "Tôi đã có 1 năm kinh nghiệm làm thêm ở cửa hàng tiện lợi." },
      { text: "日本語はN3レベルですが、一生懸命頑張ります！", translation: "Tiếng Nhật của tôi ở trình độ N3, nhưng tôi sẽ cố gắng hết sức!" }
    ]
  }
];

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
        <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col justify-center overflow-y-auto">
          
          {/* Header Title Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black tracking-[0.25em] text-slate-300 uppercase mb-2 block">
                <ThunderboltOutlined className="mr-1" /> LUYỆN PHẢN XẠ THỜI GIAN THỰC
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight leading-none flex flex-wrap items-center gap-4">
                Đàm thoại Giao tiếp AI
                <span className="px-3 py-1 bg-red-50 text-red-500 border border-red-100 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Chưa hoàn thiện
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium max-w-sm md:text-right">
              Nhập vai vào các tình huống thực tế thường ngày của người Nhật Bản để kiểm tra chính tả, trợ từ và phản xạ giao tiếp tự nhiên.
            </p>
          </div>

          {/* Minimalist Typographic Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SCENARIOS.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => handleStartScenario(scenario)}
                className="group relative bg-white border border-slate-100 hover:border-black rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer h-60 shadow-sm"
              >
                {/* Numeral Prefix Label */}
                <span className="absolute top-6 left-8 text-[10px] font-black text-slate-200 group-hover:text-black uppercase tracking-widest transition-colors">
                  SCENARIO {scenario.num}
                </span>

                {/* Subtitle Badge right-aligned */}
                <div className="flex justify-end mb-4">
                  <span className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-wider">
                    {scenario.subTitle}
                  </span>
                </div>

                <div className="my-2">
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:scale-[1.01] transition-transform duration-300">
                    {scenario.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-1.5">
                    {scenario.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-black transition-colors">
                  <span>Bắt đầu đàm thoại</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
          {showFeedbackPane && (
            <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:w-80 bg-white border border-slate-100 rounded-none lg:rounded-[2.5rem] flex flex-col overflow-hidden h-full shadow-sm animate-in slide-in-from-bottom duration-300">
              <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-2">
                  <MessageOutlined className="text-sm" />
                  <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                    Phân tích của Trợ lý
                  </h3>
                </div>
                <button 
                  onClick={() => setShowFeedbackPane(false)}
                  className="lg:hidden w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {latestFeedback ? (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <BulbOutlined /> Gợi ý Ngữ pháp & Văn phong:
                      </h4>
                      <p className="text-[11px] font-bold text-slate-600 leading-relaxed whitespace-pre-line">
                        {latestFeedback}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">💡 Mẹo</p>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                        Hãy chọn các phím gợi ý bên dưới khung chat để học thêm nhiều cách trả lời tự nhiên của người bản xứ nhé!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-3 text-lg shadow-inner">
                      💬
                    </div>
                    <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Hệ thống phân tích</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed mt-1.5">
                      Khi cuộc hội thoại diễn ra, AI sẽ phát hiện lỗi sai ngữ pháp, trợ từ và sửa lại cho đúng văn phong tại đây!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
