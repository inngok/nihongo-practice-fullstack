import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const examModules = [
  {
    id: 'sentence-sort',
    title: "Sắp xếp câu",
    description: "Luyện tập kỹ năng sắp xếp các mảnh ghép thành một câu hoàn chỉnh (bài tập dấu sao).",
    path: "/exam-jlpt/sentence-sort",
    status: "ready"
  }
];

export default function ExamJLPT() {
  return (
    <div className="w-full h-full flex-grow bg-white flex flex-col items-center pt-24 pb-12 px-6 md:px-12 relative overflow-hidden font-sans">


      <div className="w-full max-w-7xl relative z-10 border-b border-slate-50 pb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors uppercase mb-8"
        >
          <ChevronLeft className="w-3 h-3" /> Quay lại trang chủ
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.4em] font-bold text-slate-300 uppercase">Chương trình luyện thi</span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight italic uppercase">
              Ôn thi JLPT
            </h1>
            <p className="text-slate-400 font-medium text-sm md:text-base max-w-xl italic leading-relaxed">
              Tổng hợp cấu trúc và kỹ năng làm các dạng bài đặc thù trong kỳ thi năng lực tiếng Nhật JLPT N3.
            </p>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="w-full max-w-7xl relative z-10 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {examModules.map((module) => (
            <Link
              key={module.id}
              to={module.path}
              className={`group p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border transition-all duration-500 flex flex-col items-start justify-center gap-4 md:gap-6 ${module.status === 'ready'
                ? 'bg-white border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] hover:border-slate-200'
                : 'bg-slate-50/50 border-transparent opacity-60 cursor-not-allowed'
                }`}
              onClick={(e) => module.status === 'soon' && e.preventDefault()}
            >
              <div className="space-y-3 flex-grow">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900">{module.title}</h3>
                  {module.status === 'soon' && (
                    <span className="text-[9px] font-black tracking-widest text-slate-400 border border-slate-200 px-2 py-1 rounded-full uppercase shrink-0">Sắp có</span>
                  )}
                </div>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium italic">
                  {module.description}
                </p>
              </div>

              {module.status === 'ready' && (
                <div className="mt-4 text-[10px] font-black tracking-[0.2em] text-slate-900 uppercase underline underline-offset-4 group-hover:text-slate-500 transition-colors">
                  Bắt đầu ôn tập
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
