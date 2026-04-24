import React, { useState } from 'react';
import { Headset, CheckCircle, ArrowRight, Clock, AlertCircle, Target, Zap, Lightbulb, Search, Lock, BookOpen, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReadingTipsData from './ReadingTipsData';

export default function Tips() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('listening');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_TIPS_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Mật khẩu không chính xác!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full h-full min-h-screen bg-white flex flex-col items-center pt-24 md:pt-0 md:justify-center p-6 selection:bg-black selection:text-white">
        <div className="w-full max-w-sm flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8 text-black" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-slate-900">Bí Kíp Nội Bộ</h1>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Vui lòng nhập mật khẩu để tiếp tục</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu của bạn..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-6 pr-14 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-base text-slate-900 focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-slate-300 placeholder:font-medium tracking-wide"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-slate-400 hover:text-slate-900 transition-colors"
                tabIndex="-1"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {error && (
              <div className="flex items-center justify-center gap-2 text-rose-500 py-2 animate-in fade-in zoom-in-95 duration-300">
                <AlertCircle className="w-3.5 h-3.5" />
                <p className="text-[11px] font-black uppercase tracking-wider">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 transition-all active:scale-[0.98] outline-none"
            >
              Mở Khóa
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="mt-4 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase hover:text-slate-900 text-center transition-colors underline underline-offset-4"
          >
            Quay lại trang chủ
          </button>
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-in { animation: fade-in 0.5s ease-out forwards; }
          `}} />
      </div>
    );
  }

  const listeningTips = [
    {
      id: 1,
      title: "1. Hiểu yêu cầu (課題理解)",
      desc: "Xác định hành động cần thực hiện tiếp theo.",
      points: [
        { label: "Bí quyết", text: "Từ khóa “まず” (đầu tiên) là then chốt cho việc ưu tiên." },
        { label: "Kỹ thuật", text: "Tập trung vào câu mệnh lệnh, yêu cầu hoặc lời nhờ vả." },
        { label: "Lưu ý", text: "Xác nhận đối phương có thực sự đồng ý (Hai/Vâng) hay không." }
      ]
    },
    {
      id: 2,
      title: "2. Hiểu điểm chính (ポイント理解)",
      desc: "Tìm lý do, mục đích hoặc tâm trạng nhân vật.",
      points: [
        { label: "Chuẩn bị", text: "Đọc lướt 4 phương án trong 20s chuẩn bị để đoán nội dung." },
        { label: "Phân tích", text: "Tìm từ đồng nghĩa hoặc trái nghĩa với từ khóa trong đáp án." },
        { label: "Loại trừ", text: "Xác định rõ đối tượng hành động (ai đi, ai ở) để tránh bẫy." }
      ]
    },
    {
      id: 3,
      title: "3. Hiểu khái quát (概要理解)",
      desc: "Hiểu ý đồ tổng thể (Đề thi không in thông tin).",
      points: [
        { label: "Điểm chốt", text: "Nghe câu dẫn nhập “ご紹介しましょう” để tìm chủ đề chính." },
        { label: "Cảnh giác", text: "Đừng nhầm ví dụ minh họa với chủ đề bao quát của cả bài." }
      ]
    },
    {
      id: 4,
      title: "4. Diễn đạt lời nói (発話表現)",
      desc: "Chọn câu thoại đúng cho nhân vật có mũi tên.",
      points: [
        { label: "Vị trí", text: "Đặt mình vào vị trí nhân vật trong tranh để cảm nhận." },
        { label: "Phân biệt", text: "Xác định mình làm hay nhờ họ làm để chọn đúng cấu trúc." },
        { label: "Tìm tòi", text: "Học thuộc các câu giao tiếp cố định theo tình huống thực tế." }
      ]
    },
    {
      id: 5,
      title: "5. Phản xạ nhanh (即時応答)",
      desc: "Chọn câu trả lời ứng biến cho câu nói ngắn.",
      points: [
        { label: "Mục đích", text: "Xác định nhanh đây là câu hỏi, lời mời hay lời chào xã giao." },
        { label: "Ngữ pháp", text: "Chú ý Kính ngữ và cách nói tắt trong hội thoại hàng ngày." }
      ]
    }
  ];

  const keywordGroups = [
    {
      title: "Thứ tự ưu tiên",
      items: [
        { jp: "まず", vi: "Đầu tiên" },
        { jp: "その前に", vi: "Trước đó thì..." },
        { jp: "とりあえず", vi: "Trước mắt/Tạm thời" }
      ]
    },
    {
      title: "Sự thay đổi",
      items: [
        { jp: "やっぱり", vi: "Quả nhiên là..." },
        { jp: "ちょっと待って", vi: "Đợi một chút" },
        { jp: "よし、こっちに", vi: "Chốt chọn cái này" }
      ]
    },
    {
      title: "Lý do & Ý kiến",
      items: [
        { jp: "実は", vi: "Thực ra là..." },
        { jp: "っていうのは", vi: "Nghĩa là/Lý do là..." },
        { jp: "ただ", vi: "Có điều/Tuy nhiên" }
      ]
    },
    {
      title: "Đồng ý/Từ chối",
      items: [
        { jp: "そうしましょう", vi: "Làm thế đi" },
        { jp: "それはちょっと", vi: "Cái đó thì hơi..." },
        { jp: "助かります", vi: "Đồng ý nhận giúp" }
      ]
    }
  ];

  return (
    <div className="w-full h-full flex-grow bg-slate-50/30 flex flex-col items-center pt-32 md:pt-40 pb-20 px-4 md:px-8 font-sans">

      <div className="w-full max-w-4xl space-y-12">
        {/* Simple Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight italic uppercase">BÍ KÍP NỘI BỘ N3</h1>
            <p className="text-sm text-slate-400 font-medium">Chiến thuật chinh phục mọi dạng bài thi JLPT</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            Quay lại trang chủ
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl w-full max-w-md mx-auto relative z-10">
          <button
            onClick={() => setActiveTab('listening')}
            className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'listening'
              ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
          >
            Nghe Hiểu
          </button>
          <button
            onClick={() => setActiveTab('reading')}
            className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'reading'
              ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
          >
            Đọc Hiểu
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'listening' && (
          <div className="space-y-12 animate-in fade-in duration-500 pt-4">
            {/* Listening Tips - Clean Cards */}
            <div className="space-y-6">
              {listeningTips.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                    <div className="md:w-1/3 space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">{item.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.points.map((p, i) => (
                        <div key={i} className="space-y-1 p-3 bg-slate-50/50 rounded-xl border border-slate-50">
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{p.label}</span>
                          <p className="text-sm font-semibold text-slate-600 leading-snug">{p.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Keywords Section - Clean & Simple */}
            <div className="space-y-8 pt-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-black text-slate-900 uppercase">Manh mối từ khóa</h2>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {keywordGroups.map((group, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{group.title}</h4>
                    <div className="grid gap-2">
                      {group.items.map((it, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0">
                          <span className="text-base font-bold text-slate-800">{it.jp}</span>
                          <span className="text-xs font-medium text-slate-400 italic">{it.vi}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Tip - Soft Alert */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-amber-900 italic">Mẹo then chốt:</h5>
                <p className="text-sm text-amber-700 leading-relaxed font-medium">
                  Tập trung cao độ ngay sau các từ nối như <span className="font-black underline mx-1">「でも」</span> hoặc <span className="font-black underline mx-1">「ところが」</span>. Thông tin quan trọng thường nằm ngay sau đó.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reading' && (
          <div className="animate-in fade-in duration-500 pt-4">
            {/* Phần nội dung Đọc Hiểu N3 */}
            <ReadingTipsData />
          </div>
        )}

      </div>
    </div>
  );
}