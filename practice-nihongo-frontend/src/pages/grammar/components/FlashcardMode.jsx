import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

export default function FlashcardMode({
  activeData,
  currentIndex,
  setActiveMode,
  isShuffle,
  handleToggleShuffle,
  handleResetProgress,
  handlePrev,
  handleNext
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  useEffect(() => {
    if (activeData.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          handlePrev();
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < activeData.length - 1) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, activeData, handlePrev, handleNext]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      {/* Top Navigation */}
      <div className="flex justify-between items-center px-2">
        <button
          onClick={() => setActiveMode('menu')}
          className="group flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white uppercase tracking-[0.2em] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          QUAY LẠI MENU
        </button>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:inline">
            TIẾN TRÌNH: {currentIndex + 1} / {activeData.length}
          </span>
          <button
            onClick={handleToggleShuffle}
            className={`px-3 py-1 border rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isShuffle ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
          >
            XÁO TRỘN
          </button>
          <button
            onClick={() => {
              handleResetProgress();
              setIsFlipped(false);
            }}
            className="px-3 py-1 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
          >
            HỌC LẠI
          </button>
        </div>
      </div>

      <div className="h-1.5 bg-slate-50 dark:bg-slate-900 w-full rounded-full overflow-hidden border border-slate-100/50 dark:border-slate-900/50">
        <div
          className="h-full bg-black dark:bg-white transition-all duration-500 rounded-full"
          style={{ width: `${((currentIndex + 1) / (activeData.length || 1)) * 100}%` }}
        />
      </div>

      <div className="perspective h-[380px] sm:h-[420px]">
        <div
          key={currentIndex}
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full h-full duration-700 preserve-3d shadow-xl rounded-[2.5rem] cursor-pointer ${isFlipped ? 'rotate-y-180' : 'hover:scale-[1.01]'}`}
        >
          <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-5 sm:p-8 text-center shadow-inner">
            <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border border-slate-100 dark:border-slate-900">
              {activeData[currentIndex]?.level || 'N3'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-955 dark:text-white mb-6 tracking-tight leading-relaxed">
              {activeData[currentIndex]?.pattern}
            </h2>
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] animate-pulse mt-4">NHẤN ĐỂ LẬT THẺ</p>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-start sm:justify-center p-5 sm:p-8 text-center shadow-inner overflow-y-auto py-8 sm:py-8">
            <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-4">
              CẤU TRÚC: {activeData[currentIndex]?.pattern}
            </span>

            <div className="h-px w-12 bg-slate-100 dark:bg-slate-800 mb-6" />

            <h3 className="text-xl sm:text-2xl font-black italic text-slate-950 dark:text-white mb-4">
              {activeData[currentIndex]?.meaning}
            </h3>

            {activeData[currentIndex]?.explanation && (
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed whitespace-pre-line">
                {activeData[currentIndex]?.explanation}
              </p>
            )}

            {activeData[currentIndex]?.exampleSentence && (() => {
               let normalizedJp = activeData[currentIndex].exampleSentence.replace(/\\n/g, '\n');
               normalizedJp = normalizedJp.replace(/(。|！|？)(\s*)/g, '$1\n');
               const jpLines = normalizedJp.split('\n').map(s => s.trim()).filter(Boolean);

               let normalizedVn = activeData[currentIndex].exampleMeaning ? activeData[currentIndex].exampleMeaning.replace(/\\n/g, '\n') : '';
               normalizedVn = normalizedVn.replace(/(\.|!|\?)(\s+)/g, '$1\n');
               const vnLines = normalizedVn.split('\n').map(s => s.trim()).filter(Boolean);
               return (
                 <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 text-left w-full max-w-md space-y-2">
                   <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest block mb-1">VÍ DỤ</span>
                   <div className="space-y-2">
                     {jpLines.map((jpLine, lineIdx) => {
                       const vnLine = vnLines[lineIdx] || '';
                       return (
                         <div key={lineIdx} className="space-y-0.5 border-l-2 border-slate-200 dark:border-slate-800 pl-2">
                           <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">{jpLine}</p>
                           {vnLine && (
                             <p className="text-xs italic text-slate-400 dark:text-slate-500 leading-relaxed">{vnLine}</p>
                           )}
                         </div>
                       );
                     })}
                   </div>
                 </div>
               );
             })()}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-between items-center gap-4 px-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-700 hover:text-black dark:text-slate-300 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" /> QUAY LẠI
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === activeData.length - 1}
          className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          TIẾP THEO <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
