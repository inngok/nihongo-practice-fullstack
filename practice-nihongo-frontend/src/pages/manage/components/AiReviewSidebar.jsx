import React from 'react';
import { Tooltip } from 'antd';

/**
 * AiReviewSidebar
 * Left panel: book/lesson selectors + scrollable grammar list with error flags.
 */
export default function AiReviewSidebar({
  books,
  selectedBookId,
  setSelectedBookId,
  uniqueLessons,
  selectedLesson,
  setSelectedLesson,
  lessonGrammars,
  selectedGrammarId,
  setSelectedGrammarId,
  hasErrorPattern,
}) {
  return (
    <div className="w-1/4 min-w-[250px] border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5 flex flex-col h-full">
      {/* Filters */}
      <div className="space-y-3 mb-4">
        <select
          value={selectedBookId}
          onChange={(e) => { setSelectedBookId(e.target.value); setSelectedLesson(''); setSelectedGrammarId(''); }}
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-black dark:focus:border-white transition-all"
        >
          <option value="">Tất cả giáo trình</option>
          {books.map(b => <option key={b.id} value={b.id.toString()}>{b.title}</option>)}
        </select>
        <select
          value={selectedLesson}
          onChange={(e) => { setSelectedLesson(e.target.value); setSelectedGrammarId(''); }}
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-black dark:focus:border-white transition-all"
        >
          <option value="">Chọn Bài (Lesson)</option>
          {uniqueLessons.map(l => <option key={l} value={l.toString()}>Bài {l}</option>)}
        </select>
      </div>

      {/* Grammar list */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 pb-4">
        {lessonGrammars.length === 0 ? (
          <p className="text-xs text-center text-slate-400 mt-4 italic">Không có dữ liệu</p>
        ) : (
          lessonGrammars.map(g => {
            const isError = hasErrorPattern(g.explanation);
            const isSelected = selectedGrammarId === g.id.toString();
            return (
              <div
                key={g.id}
                onClick={() => setSelectedGrammarId(g.id.toString())}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-black dark:border-white bg-black dark:bg-white'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-sm font-black ${isSelected ? 'text-white dark:text-black' : 'text-slate-700 dark:text-slate-200'}`}>
                    {g.structure}
                  </span>
                  {isError && (
                    <Tooltip title="Nghi ngờ có lỗi (+な) hoặc (+だ)">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 animate-pulse" />
                    </Tooltip>
                  )}
                </div>
                <div className={`text-[10px] truncate mt-1 font-medium ${isSelected ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'}`}>
                  {g.meaning}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
