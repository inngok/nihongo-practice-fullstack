import React from 'react';

export default function VocabStudyHeader({ selectedUnit, vocabData }) {
  return (
    <div className="mb-8 md:mb-10">
      <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block mb-3">HỌC TẬP & LUYỆN TẬP</span>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
          TỪ VỰNG - BÀI {selectedUnit}
        </h1>
        {vocabData[0]?.book?.title && (
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700 text-lg">|</span>
        )}
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-none">
          {vocabData[0]?.book?.title || ''}
        </span>
        <span className="px-2.5 py-1 bg-slate-950 text-white dark:bg-white dark:text-black rounded-lg text-[9px] font-black tracking-widest uppercase shadow-sm self-start sm:self-auto">
          {vocabData[0]?.book?.levelLabel || 'N3'}
        </span>
      </div>
    </div>
  );
}
