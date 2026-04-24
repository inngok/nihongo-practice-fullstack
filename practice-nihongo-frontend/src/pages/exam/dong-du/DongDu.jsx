import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const programs = [
  {
    id: 'pc7',
    title: "Phổ cập 7",
    description: "Bộ câu hỏi luyện tập và kiến thức trọng tâm cho kỳ thi Phổ cập 7.",
    path: "/exam-pc7",
    status: "ready"
  },
  {
    id: 'pc8',
    title: "Phổ cập 8",
    description: "Lộ trình ôn luyện và các dạng bài tập thực tế cho kỳ thi Phổ cập 8.",
    path: "/exam-pc8",
    status: "ready"
  }
];

export default function DongDu() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Area */}
      <div className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-b border-slate-50">


        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors uppercase mb-8"
        >
          <ChevronLeft className="w-3 h-3" /> Quay lại trang chủ
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.4em] font-bold text-slate-300 uppercase">Chương trình học</span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
              Đông Du
            </h1>
            <p className="text-slate-400 font-medium text-sm md:text-base max-w-xl leading-relaxed">
              Các khóa học và ôn thi theo chương trình Đông Du, tập trung vào kỹ năng và kiến thức thực tiễn.
            </p>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.map((program) => (
            <Link
              key={program.id}
              to={program.path}
              className={`group p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border transition-all duration-500 flex flex-col items-start justify-center gap-4 md:gap-6 ${program.status === 'ready'
                ? 'bg-white border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] hover:border-slate-200'
                : 'bg-slate-50/50 border-transparent opacity-60 cursor-not-allowed'
                }`}
              onClick={(e) => program.status === 'soon' && e.preventDefault()}
            >
              <div className="space-y-3 flex-grow">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900">{program.title}</h3>
                  {program.status === 'soon' && (
                    <span className="text-[9px] font-black tracking-widest text-slate-400 border border-slate-200 px-2 py-1 rounded-full uppercase">Sắp có</span>
                  )}
                </div>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium italic">
                  {program.description}
                </p>
              </div>

              {program.status === 'ready' && (
                <div className="mt-4 text-[10px] font-black tracking-[0.2em] text-slate-900 uppercase underline underline-offset-4 group-hover:text-slate-500 transition-colors">
                  Bắt đầu học
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
