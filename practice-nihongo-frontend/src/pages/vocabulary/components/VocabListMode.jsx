import React from 'react';
import { Search, Check } from 'lucide-react';

export default function VocabListMode({ activeData, searchTerm, setSearchTerm, completedIds, showHanViet }) {
  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
      <div className="relative group max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 w-5 h-5 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
        <input
          type="text"
          placeholder="Tìm kiếm từ vựng..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border-b-2 border-slate-100 dark:border-slate-800 bg-transparent focus:border-black dark:focus:border-white outline-none font-medium text-slate-900 dark:text-white transition-colors"
        />
      </div>

      <div className="flex flex-col bg-white dark:bg-slate-950/50 rounded-[2rem] overflow-hidden border border-slate-50 dark:border-slate-900 shadow-sm">
        {activeData
          .filter(i => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return true;
            return i.word.toLowerCase().includes(term) ||
              i.meaning.toLowerCase().includes(term) ||
              (i.reading && i.reading.toLowerCase().includes(term));
          })
          .map((item, idx) => (
            <div
              key={item.id}
              className={`group grid grid-cols-1 gap-4 p-5 md:p-7 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all border-b border-slate-50 dark:border-slate-900 last:border-none items-center ${
                showHanViet ? 'sm:grid-cols-[1fr_auto_1fr]' : 'sm:grid-cols-2'
              }`}
            >
              {/* Left Column: Index + Kanji + Reading */}
              <div className="flex items-center gap-4 md:gap-8 min-w-0">
                <span className="text-[11px] font-black text-slate-200 dark:text-slate-800 w-6 shrink-0">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>

                <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4 min-w-0">
                  <h3 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white font-kanji group-hover:translate-x-1 transition-transform tracking-tight truncate">
                    {item.word}
                  </h3>
                  <span className="text-xs md:text-sm font-normal text-slate-400 dark:text-slate-500 tracking-wider truncate">
                    {item.reading}
                  </span>
                </div>
              </div>

              {/* Middle Column: Han Viet */}
              {showHanViet && (
                <div className="hidden sm:flex justify-center px-4">
                  {item.hanviet ? (
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">
                      {item.hanviet}
                    </span>
                  ) : (
                    <span className="text-slate-200 dark:text-slate-800 select-none">-</span>
                  )}
                </div>
              )}

              {/* Right Column: Meaning */}
              <div className="flex items-center justify-start sm:justify-end gap-4 pl-10 sm:pl-0">
                {/* On mobile, show hanviet here if enabled */}
                {showHanViet && item.hanviet && (
                  <span className="sm:hidden text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">
                    {item.hanviet}
                  </span>
                )}
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] md:text-[11px] font-medium rounded-full uppercase tracking-wider group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all text-right break-words line-clamp-2">
                  {item.meaning}
                </div>
                {completedIds.includes(item.id) && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
