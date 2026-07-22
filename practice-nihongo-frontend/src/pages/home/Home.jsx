import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function Home() {
  const [quickAccess, setQuickAccess] = useState(null);
  const { currentUser, fetchWithAuth } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';

  useEffect(() => {
    // 1. Try local storage first for instant display
    try {
      const saved = localStorage.getItem('quickAccess');
      if (saved) {
        setQuickAccess(JSON.parse(saved));
      }
    } catch (e) { }

    // 2. Sync from backend to support cross-device
    if (currentUser) {
      fetchWithAuth(`${API_BASE_URL}/progress/quickAccess`)
        .then(res => res.json())
        .then(resData => {
          if (resData.data) {
            try {
              const parsed = JSON.parse(resData.data);
              setQuickAccess(parsed);
              localStorage.setItem('quickAccess', resData.data);
            } catch (e) { }
          }
        }).catch(() => { });
    }
  }, [currentUser, fetchWithAuth]);

  return (
    <div className="w-full h-full flex-grow bg-white dark:bg-slate-950 flex flex-col items-center justify-center pt-32 pb-16 md:py-24 px-4 md:px-6 font-sans relative overflow-hidden transition-colors duration-300">



      {/* Hero Section */}
      <div className="w-full max-w-4xl flex flex-col items-center text-center gap-2 md:gap-3 mb-6 md:mb-8 relative z-10">

        <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
          Luyện tiếng Nhật Online
        </h1>
        <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed mt-2 font-medium">
          Môi trường học tập chuyên sâu cho hành trình chinh phục tiếng Nhật. Tập trung vào những điều quan trọng nhất.
        </p>
      </div>

      {/* Portal Cards */}
      <div className="w-full max-w-5xl relative z-10 px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

          {/* Grammar Card */}
          <Link
            to="/grammar"
            className="group bg-white dark:bg-slate-900/60 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-850 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-500 flex flex-col items-start justify-center gap-4 md:gap-6"
          >
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Ngữ Pháp</h3>
              <p className="text-sm md:text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px]">
                Khám phá các cấu trúc và mẫu câu phức tạp với các phân tích chi tiết và khoa học.
              </p>
            </div>
            <div className="mt-4 text-[10px] font-black tracking-[0.2em] text-slate-900 dark:text-slate-100 uppercase underline underline-offset-4 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
              Bắt đầu học
            </div>
          </Link>

          {/* Vocabulary Card */}
          <Link
            to="/vocabulary"
            className="group bg-white dark:bg-slate-900/60 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-850 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-500 flex flex-col items-start justify-center gap-4 md:gap-6"
          >
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Từ Vựng</h3>
              <p className="text-sm md:text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px]">
                Mở rộng vốn từ vựng thông qua các danh sách chọn lọc và ứng dụng các từ mới.
              </p>
            </div>
            <div className="mt-4 text-[10px] font-black tracking-[0.2em] text-slate-900 dark:text-slate-100 uppercase underline underline-offset-4 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
              Bắt đầu học
            </div>
          </Link>

          {/* Kanji Card */}
          <Link
            to="/kanji"
            className="group bg-white dark:bg-slate-900/60 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-850 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-500 flex flex-col items-start justify-center gap-4 md:gap-6"
          >
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Hán Tự</h3>
              <p className="text-sm md:text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px]">
                Ghi nhớ và luyện tập cách viết, cách đọc các chữ Hán quan trọng trong kỳ thi N3.
              </p>
            </div>
            <div className="mt-2 text-[10px] font-black tracking-[0.2em] text-slate-900 dark:text-slate-100 uppercase underline underline-offset-4 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
              Bắt đầu học
            </div>
          </Link>

        </div>
      </div>

      {/* Specialty Bottom Section */}
      <div className="mt-8 md:mt-10 relative z-10 flex flex-wrap items-center justify-center gap-4 w-full">
        <Link
          to="/grammar/confusing"
          className="group px-8 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2rem] hover:bg-black dark:hover:bg-white hover:border-black dark:hover:border-white hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
        >
          <span className="text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400 group-hover:text-white dark:group-hover:text-black transition-colors">
            Phân biệt Ngữ pháp
          </span>
        </Link>
        {isAdmin && (
          <Link
            to="/ai-chat"
            className="group px-8 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2rem] hover:bg-black dark:hover:bg-white hover:border-black dark:hover:border-white hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
          >
            <span className="text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400 group-hover:text-white dark:group-hover:text-black transition-colors">
              Đàm thoại AI
            </span>
          </Link>
        )}
        <Link
          to="/exam-jlpt"
          className="group px-8 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2rem] hover:bg-black dark:hover:bg-white hover:border-black dark:hover:border-white hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
        >
          <span className="text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400 group-hover:text-white dark:group-hover:text-black transition-colors">
            Ôn thi
          </span>
        </Link>
        {currentUser && (
          <Link
            to="/my-vocab"
            className="group px-8 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2rem] hover:bg-black dark:hover:bg-white hover:border-black dark:hover:border-white hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
          >
            <span className="text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400 group-hover:text-white dark:group-hover:text-black transition-colors">
              Sổ tay
            </span>
          </Link>
        )}
        <Link
          to="/grammar/keigo"
          className="group px-8 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2rem] hover:bg-black dark:hover:bg-white hover:border-black dark:hover:border-white hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
        >
          <span className="text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400 group-hover:text-white dark:group-hover:text-black transition-colors">
            Tôn Kính Ngữ
          </span>
        </Link>
      </div>

      {/* Quick Access Floating Button */}
      {quickAccess && (
        <div className="fixed bottom-24 right-6 md:bottom-16 md:right-10 z-[100] animate-[fade-in_0.5s_ease-out,slide-in-from-bottom-4_0.5s_ease-out]">
          <Link
            to={quickAccess.url}
            className="group flex items-center gap-4 bg-white dark:bg-slate-950 border-2 border-black dark:border-white py-2.5 pl-6 pr-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-0.5">
                TIẾP TỤC HỌC
              </span>
              <span className="text-[13px] font-bold text-black dark:text-white line-clamp-1 max-w-[160px] md:max-w-[200px]">
                {quickAccess.title}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="text-white dark:text-black text-[14px] font-black leading-none">→</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}