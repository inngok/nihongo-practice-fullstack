import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const weeks = [
  {
    week: 1,
    days: [1, 2, 3, 4, 5, 6]
  }
];

export default function KanjiPC8Selector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header Area */}
      <div className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-b border-slate-50 relative">
        <Link
          to="/exam-pc8"
          className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors uppercase mb-8"
        >
          <ChevronLeft className="w-3 h-3" /> Quay lại Ôn thi PC8
        </Link>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.4em] font-bold text-slate-300 uppercase">Hán tự Đông Du</span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
              Lộ trình Hán tự PC8
            </h1>
            <p className="text-slate-400 font-medium text-sm md:text-base max-w-xl italic leading-relaxed">
              Dữ liệu được chia theo Tuần và Ngày học giúp bạn ôn tập có hệ thống và hiệu quả hơn.
            </p>
          </div>
        </div>
      </div>

      {/* Selector Grid */}
      <div className="px-6 md:px-12 py-16 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {weeks.map((w) => (
          <div key={w.week} className="mb-16">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px bg-slate-100 flex-grow"></div>
              <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Tuần {w.week}</h2>
              <div className="h-px bg-slate-100 flex-grow"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {w.days.map((d) => (
                <button
                  key={d}
                  onClick={() => navigate(`/exam-pc8/kanji/study?week=${w.week}&day=${d}`)}
                  className="group relative bg-white border border-slate-100 p-8 rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] hover:border-slate-200 transition-all duration-500 flex flex-col items-center justify-center gap-1 overflow-hidden"
                >
                  <span className="block text-[8px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Ngày</span>
                  <span className="block text-4xl font-black text-slate-900 leading-none group-hover:scale-110 transition-transform duration-500">{d}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Practice All Option */}
        <div className="mt-20 p-10 md:p-12 rounded-[2.5rem] md:rounded-[3rem] bg-slate-950 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left transition-all duration-500 shadow-xl hover:shadow-2xl">
          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Ôn tập tổng hợp</h3>
            <p className="text-slate-400 text-xs font-medium">Luyện tập tất cả 205 chữ Hán tự của Week 1 cùng lúc.</p>
          </div>
          <button 
            onClick={() => navigate('/exam-pc8/kanji/study?week=1&all=true')}
            className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            Bắt đầu luyện tập
          </button>
        </div>
      </div>
    </div>
  );
}
