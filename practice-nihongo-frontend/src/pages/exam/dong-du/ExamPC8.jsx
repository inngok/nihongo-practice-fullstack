import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ClipboardList, FileText, CheckCircle, ShieldCheck } from 'lucide-react';

const examModules = [
  {
    id: 'kanji-pc8',
    title: "Hán tự PC8",
    description: "Tổng hợp hán tự và âm hán việt cấp độ PC8.",
    icon: <CheckCircle className="w-6 h-6" />,
    path: "/exam-pc8/kanji",
    status: "ready"
  },
  {
    id: 'vocab-test',
    title: "Từ vựng PC8",
    description: "Hệ thống câu hỏi trắc nghiệm từ vựng theo chương trình PC8.",
    icon: <CheckCircle className="w-6 h-6" />,
    path: "/exam-pc8/vocab-test",
    status: "soon"
  },
  {
    id: 'grammar-focus',
    title: "Ngữ pháp PC8",
    description: "Tổng hợp các điểm ngữ pháp quan trọng trong cấp độ PC8.",
    icon: <FileText className="w-6 h-6" />,
    path: "/exam-pc8/grammar",
    status: "soon"
  }
];

export default function ExamPC8() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Area */}
      <div className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-b border-slate-50 relative overflow-hidden">


        <Link
          to="/dong-du"
          className="relative z-10 inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors uppercase mb-8"
        >
          <ChevronLeft className="w-3 h-3" /> Quay lại Đông Du
        </Link>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.4em] font-bold text-slate-300 uppercase">Chương trình đặc biệt</span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
              Ôn thi PC8
            </h1>
            <p className="text-slate-400 font-medium text-sm md:text-base max-w-xl italic leading-relaxed">
              Nội dung ôn luyện chuyên sâu cho kỳ thi Phổ cập 8 (PC8).
            </p>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
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
                    <span className="text-[9px] font-black tracking-widest text-slate-400 border border-slate-200 px-2 py-1 rounded-full uppercase">Sắp có</span>
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
