import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="w-full h-full flex-grow bg-white flex flex-col items-center justify-center pt-32 pb-16 md:py-24 px-4 md:px-6 font-sans relative overflow-hidden">



      {/* Hero Section */}
      <div className="w-full max-w-4xl flex flex-col items-center text-center gap-2 md:gap-3 mb-6 md:mb-8 relative z-10">
        <span className="text-[10px] tracking-[0.4em] font-bold text-slate-400 uppercase">
          Trình độ N3
        </span>
        <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
          Luyện tiếng Nhật Online
        </h1>
        <p className="text-sm md:text-lg text-slate-500 max-w-lg mx-auto leading-relaxed mt-2 font-medium">
          Môi trường học tập chuyên sâu cho hành trình chinh phục tiếng Nhật. Tập trung vào những điều quan trọng nhất.
        </p>
      </div>

      {/* Portal Cards */}
      <div className="w-full max-w-5xl relative z-10 px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

        {/* Grammar Card */}
        <Link
          to="/grammar"
          className="group bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] hover:border-slate-200 transition-all duration-500 flex flex-col items-start justify-center gap-4 md:gap-6"
        >
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">Ngữ Pháp</h3>
            <p className="text-sm md:text-slate-500 leading-relaxed max-w-[280px]">
              Khám phá các cấu trúc và mẫu câu phức tạp với các phân tích chi tiết và khoa học.
            </p>
          </div>
          <div className="mt-4 text-[10px] font-black tracking-[0.2em] text-slate-900 uppercase underline underline-offset-4 group-hover:text-slate-500 transition-colors">
            Bắt đầu học
          </div>
        </Link>

        {/* Vocabulary Card */}
        <Link
          to="/vocabulary"
          className="group bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] hover:border-slate-200 transition-all duration-500 flex flex-col items-start justify-center gap-4 md:gap-6"
        >
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">Từ Vựng</h3>
            <p className="text-sm md:text-slate-500 leading-relaxed max-w-[280px]">
              Mở rộng vốn từ vựng thông qua các danh sách chọn lọc và ứng dụng các từ mới.
            </p>
          </div>
          <div className="mt-4 text-[10px] font-black tracking-[0.2em] text-slate-900 uppercase underline underline-offset-4 group-hover:text-slate-500 transition-colors">
            Bắt đầu học
          </div>
        </Link>

        {/* Kanji Card */}
        <Link
          to="/kanji"
          className="group bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] hover:border-slate-200 transition-all duration-500 flex flex-col items-start justify-center gap-4 md:gap-6"
        >
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">Hán Tự</h3>
            <p className="text-sm md:text-slate-500 leading-relaxed max-w-[280px]">
              Ghi nhớ và luyện tập cách viết, cách đọc các chữ Hán quan trọng trong kỳ thi N3.
            </p>
          </div>
          <div className="mt-2 text-[10px] font-black tracking-[0.2em] text-slate-900 uppercase underline underline-offset-4 group-hover:text-slate-500 transition-colors">
            Bắt đầu học
          </div>
        </Link>

      </div>
      </div>

      {/* Specialty Bottom Section */}
      <div className="mt-8 md:mt-10 relative z-10 flex flex-wrap items-center justify-center gap-4 w-full">
        <Link
          to="/dong-du"
          className="group px-8 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-black hover:border-black hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
        >
          <span className="text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase text-slate-500 group-hover:text-white transition-colors">
            Đông Du
          </span>
        </Link>

        <Link
          to="/exam-jlpt"
          className="group px-8 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-black hover:border-black hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
        >
          <span className="text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase text-slate-500 group-hover:text-white transition-colors">
            Ôn thi JLPT
          </span>
        </Link>

        <Link
          to="/translator"
          className="group px-8 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-black hover:border-black hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
        >
          <span className="text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase text-slate-500 group-hover:text-white transition-colors">
            Dịch
          </span>
        </Link>
        
        <Link
          to="/grammar/confusing"
          className="group px-8 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-black hover:border-black hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
        >
          <span className="text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase text-slate-500 group-hover:text-white transition-colors">
            Phân biệt
          </span>
        </Link>

        <Link
          to="/tips"
          className="group px-8 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-black hover:border-black hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
        >
          <span className="text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase text-slate-500 group-hover:text-white transition-colors">
            Bí kíp
          </span>
        </Link>
      </div>
    </div>
  );
}