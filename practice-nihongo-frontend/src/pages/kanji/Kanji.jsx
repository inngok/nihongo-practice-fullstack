import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Kanji() {
  const navigate = useNavigate();

  const kanjiSets = [
    {
      id: 'kanji4',
      num: '04',
      title: 'Hán tự 4',
      japanese: 'N3 漢字',
      label: 'TRÌNH ĐỘ N3',
      path: '/kanji/set-4'
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center pt-24 md:pt-28 pb-16 px-6 font-sans relative overflow-hidden selection:bg-slate-200">

      <div className="w-full max-w-5xl relative z-10">

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-6 md:mb-8"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Quay lại
        </button>

        {/* Title Section */}
        <div className="mb-10 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Hán tự
          </h1>
          <p className="text-sm md:text-base text-slate-500 max-w-xl leading-relaxed">
            Rèn luyện kỹ năng đọc và viết Hán tự theo lộ trình từ cơ bản đến nâng cao cho trình độ N3.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {kanjiSets.map((set) => (
            <div
              key={set.id}
              onClick={() => set.path !== '#' && navigate(set.path)}
              className={`group relative bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between transition-all duration-300
                          ${set.path !== '#'
                  ? 'hover:border-slate-400 hover:shadow-md hover:-translate-y-1 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed bg-slate-50/50'}`}
            >
              {/* Top Row */}
              <div className="flex justify-between items-center mb-10">
                <span className="text-sm font-bold text-slate-300">{set.num}</span>
                {/* Arrow Icon xuất hiện khi hover */}
                {set.path !== '#' && (
                  <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                )}
              </div>

              {/* Center Content */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{set.title}</h3>
                <p className="text-slate-500 text-sm font-medium">{set.japanese}</p>
              </div>

              {/* Bottom Label */}
              <div className="pt-5 border-t border-slate-100 mt-auto">
                <span className="text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase">
                  {set.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}