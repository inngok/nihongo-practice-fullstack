import React from 'react';

export default function KanjiStudyHeader({ book, kanjis, activeMode, setActiveMode }) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-12 pb-6 border-b border-slate-100 dark:border-slate-800">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight md:leading-tight lg:leading-tight">
          <span className="mr-3">{book ? book.title : 'Đang tải...'}</span>
          <span className="text-base font-medium text-slate-400 dark:text-slate-600 whitespace-nowrap inline-block">({kanjis.length} chữ)</span>
        </h1>
      </div>

      <div className="bg-slate-50/70 dark:bg-slate-900/50 p-1.5 rounded-2xl flex flex-wrap items-center border border-slate-100/50 dark:border-slate-800/50 self-start shadow-inner gap-1 max-w-full">
        <button onClick={() => setActiveMode('list')} className={`px-4 md:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeMode === 'list' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Danh sách</button>
        <button onClick={() => setActiveMode('flashcard')} className={`px-4 md:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeMode === 'flashcard' || activeMode === 'vocab' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Flashcard</button>
        <button onClick={() => setActiveMode('quiz')} className={`px-4 md:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeMode === 'quiz' || activeMode === 'vocab_quiz' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Trắc nghiệm</button>
        <button onClick={() => setActiveMode('typing')} className={`px-4 md:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeMode === 'typing' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Gõ phím</button>
        <button onClick={() => setActiveMode('drawing')} className={`px-4 md:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeMode === 'drawing' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Luyện viết</button>
      </div>
    </div>
  );
}
