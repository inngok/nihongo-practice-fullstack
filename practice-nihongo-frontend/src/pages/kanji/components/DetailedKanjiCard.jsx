import React, { useState, useEffect } from 'react';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';

const parseExamples = (examplesStr) => {
  if (!examplesStr) return [];
  let parts = [];
  if (examplesStr.includes(';')) {
    parts = examplesStr.split(';').map(s => s.trim()).filter(Boolean);
  } else if (examplesStr.includes('\n')) {
    parts = examplesStr.split('\n').map(s => s.trim()).filter(Boolean);
  } else {
    parts = examplesStr.split('.').map(s => s.trim()).filter(Boolean);
  }

  return parts.map(s => {
    // Match "Word (Reading): Meaning"
    const match = s.match(/^(.*?)\((.*?)\):\s*(.*)/);
    if (match) {
      return { 
        word: match[1].trim(), 
        reading: match[2].trim(), 
        meaning: match[3].trim() 
      };
    }
    // Fallback for "Word: Meaning"
    if (s.includes(':')) {
      const [word, ...rest] = s.split(':');
      return { word: word.trim(), reading: '', meaning: rest.join(':').trim() };
    }
    return { word: s.trim(), reading: '', meaning: '' };
  });
};

export default function DetailedKanjiCard({ kanji, handleOpenDetail, handleAddFlashcard, addedKanjiIds }) {
  const examples = parseExamples(kanji.examples);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-10 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 pb-8 border-b border-slate-50 dark:border-slate-850">
        <div className="flex gap-4 sm:gap-8 items-start flex-1 min-w-0">
          <div 
            onClick={() => handleOpenDetail(kanji)}
            className="w-24 h-24 sm:w-32 sm:h-32 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer hover:border-slate-400 transition-colors"
          >
            <span className="text-5xl sm:text-7xl font-kanji font-bold text-slate-900 dark:text-white select-none">{kanji.character}</span>
          </div>

          <div className="flex-1 min-w-0 pt-1">
             <div className="flex flex-col mb-4 sm:mb-6">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1">Ý NGHĨA</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white uppercase truncate">{kanji.hanviet || 'CHƯA CÓ'}</h2>
             </div>

             <div className="flex gap-8 sm:gap-16">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest block mb-0.5 sm:mb-1">ÂM ON</span>
                  <p className="text-sm sm:text-lg font-kanji font-bold text-slate-800 dark:text-slate-200">{kanji.onyomi || '—'}</p>
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest block mb-0.5 sm:mb-1">ÂM KUN</span>
                  <p className="text-sm sm:text-lg font-kanji font-bold text-slate-800 dark:text-slate-200">{kanji.kunyomi || '—'}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto border-t sm:border-t-0 border-slate-50 dark:border-slate-800/80 pt-4 sm:pt-0 gap-6 shrink-0">
           <div 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className="text-left sm:text-right flex sm:flex-col items-center sm:items-end cursor-pointer select-none hover:opacity-80 transition-opacity gap-2 sm:gap-1"
             title={isCollapsed ? 'Mở rộng từ vựng' : 'Thu gọn từ vựng'}
           >
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">TỪ VỰNG</span>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl sm:text-4xl font-black text-slate-400 dark:text-slate-500 leading-none">{examples.length}</span>
                <span className="text-slate-300 transition-transform duration-300" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                   <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
                   </svg>
                </span>
              </div>
           </div>

           <button
              onClick={(e) => handleAddFlashcard(kanji, e)}
              className="text-slate-300 hover:text-rose-500 transition-colors p-2 bg-slate-50 dark:bg-slate-950 sm:bg-transparent rounded-xl sm:rounded-none"
            >
              {addedKanjiIds.has(kanji.id) ? (
                <HeartFilled className="text-rose-500 text-lg sm:text-xl" />
              ) : (
                <HeartOutlined className="text-lg sm:text-xl" />
              )}
            </button>
        </div>
      </div>

      {examples.length > 0 && !isCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
           {examples.map((ex, idx) => (
             <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-300 transition-all relative">
                <span className="absolute top-4 right-5 text-[9px] font-bold text-slate-200 dark:text-slate-800 tracking-widest">#{idx + 1}</span>
                <h4 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 font-kanji tracking-wide">{ex.word}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">{ex.reading}</p>
                <p className="text-base text-slate-700 dark:text-slate-300 font-bold">{ex.meaning}</p>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
