import React from 'react';
import { Check, X } from 'lucide-react';

export default function VocabFlashcardMode({
  studyData,
  currentIndex,
  setCurrentIndex,
  flashcardSubMode,
  setFlashcardSubMode,
  isFlipped,
  setIsFlipped,
  handleResetProgress,
  showVietnameseFirst,
  handleSwipe,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  cardStyle,
  swipeDirection,
  setShowResults
}) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
      {/* Mode Indicator Bar */}
      <div className="flex justify-between items-center px-4 flex-wrap gap-4">
        <div className="bg-slate-50/80 dark:bg-slate-900/60 p-1 rounded-2xl flex border border-slate-100 dark:border-slate-800 shadow-inner">
          <button
            onClick={() => { setFlashcardSubMode('classic'); setIsFlipped(false); }}
            className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${flashcardSubMode === 'classic'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            CỔ ĐIỂN
          </button>
          <button
            onClick={() => { setFlashcardSubMode('memorize'); setIsFlipped(false); }}
            className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${flashcardSubMode === 'memorize'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            GHI NHỚ (QUẸT THẺ)
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            Tiến trình: {currentIndex + 1} / {studyData.length}
          </span>
          <div className="h-1 bg-slate-100 dark:bg-slate-800 w-24 rounded-full overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / (studyData.length || 1)) * 100}%` }}
            />
          </div>
          <button
            onClick={handleResetProgress}
            className="px-3 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-500 border border-rose-100 dark:border-rose-900 hover:bg-rose-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
          >
            HỌC LẠI
          </button>
        </div>
      </div>

      {flashcardSubMode === 'memorize' ? (
        /* MEMORIZE (SWIPE CARD) MODE */
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="perspective h-[380px] sm:h-[450px] cursor-grab active:cursor-grabbing select-none relative"
          style={{ touchAction: 'none' }}
        >
          <div
            key={currentIndex}
            style={cardStyle}
            className={`relative w-full h-full duration-700 preserve-3d shadow-2xl rounded-[3rem] transition-shadow ${swipeDirection === 'right' ? 'shadow-emerald-200/50 dark:shadow-emerald-950/20' :
              swipeDirection === 'left' ? 'shadow-rose-200/50 dark:shadow-rose-950/20' : ''
              } ${isFlipped ? 'rotate-y-180' : ''}`}
          >
            {/* Front Face */}
            <div className={`absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 rounded-[3rem] flex flex-col items-center justify-center p-6 sm:p-12 text-center transition-colors duration-300 ${swipeDirection === 'right' ? 'border-emerald-500 bg-emerald-50/5' :
              swipeDirection === 'left' ? 'border-rose-500 bg-rose-50/5' :
                'border-slate-100 dark:border-slate-800'
              }`}>
              {/* Swipe Status Badges */}
              {swipeDirection === 'right' && (
                <div className="absolute top-8 right-8 border-4 border-emerald-500 text-emerald-500 text-xs font-black uppercase px-4 py-1.5 rounded-xl tracking-widest rotate-12 scale-110 animate-in fade-in duration-200">
                  ĐÃ NHỚ
                </div>
              )}
              {swipeDirection === 'left' && (
                <div className="absolute top-8 left-8 border-4 border-rose-500 text-rose-500 text-xs font-black uppercase px-4 py-1.5 rounded-xl tracking-widest -rotate-12 scale-110 animate-in fade-in duration-200">
                  CHƯA THUỘC
                </div>
              )}

              <h2 className={`font-medium mb-6 sm:mb-8 select-all break-all whitespace-pre-wrap leading-tight ${showVietnameseFirst ? 'text-2xl sm:text-3xl md:text-5xl italic text-slate-900 dark:text-white' : 'text-4xl sm:text-5xl md:text-7xl font-kanji text-slate-900 dark:text-white'}`}>
                {showVietnameseFirst ? studyData[currentIndex]?.meaning : studyData[currentIndex]?.word}
              </h2>
              <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em]">NHẤN ĐỂ LẬT HOẶC QUẸT</p>

              <div className="flex gap-4 sm:gap-16 mt-8 sm:mt-12 text-slate-300 dark:text-slate-700 flex-wrap justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[10px] font-black">←</span>
                  <span className="text-[9px] font-black tracking-widest">TRÁI: CHƯA THUỘC</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black tracking-widest">PHẢI: ĐÃ NHỚ</span>
                  <span className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[10px] font-black">→</span>
                </div>
              </div>
            </div>

            {/* Back Face */}
            <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-slate-900 border-2 rounded-[3rem] flex flex-col items-center justify-center p-6 sm:p-12 text-center transition-colors duration-300 ${swipeDirection === 'right' ? 'border-emerald-500 bg-emerald-50/5' :
              swipeDirection === 'left' ? 'border-rose-500 bg-rose-50/5' :
                'border-slate-100 dark:border-slate-800'
              }`}>
              {/* Swipe Status Badges on Back Face */}
              {swipeDirection === 'right' && (
                <div className="absolute top-8 right-8 border-4 border-emerald-500 text-emerald-500 text-xs font-black uppercase px-4 py-1.5 rounded-xl tracking-widest rotate-12 scale-110 animate-in fade-in duration-200">
                  ĐÃ NHỚ
                </div>
              )}
              {swipeDirection === 'left' && (
                <div className="absolute top-8 left-8 border-4 border-rose-500 text-rose-500 text-xs font-black uppercase px-4 py-1.5 rounded-xl tracking-widest -rotate-12 scale-110 animate-in fade-in duration-200">
                  CHƯA THUỘC
                </div>
              )}

              <span className="text-[10px] font-normal text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-4">
                {showVietnameseFirst ? studyData[currentIndex]?.meaning : studyData[currentIndex]?.word}
              </span>
              <div className="h-px w-12 bg-slate-100 dark:bg-slate-800 mb-8" />
              <h3 className={`font-medium text-slate-900 dark:text-white mb-4 ${showVietnameseFirst ? 'text-3xl sm:text-4xl md:text-5xl font-kanji' : 'text-2xl sm:text-3xl md:text-4xl italic'}`}>
                {showVietnameseFirst ? studyData[currentIndex]?.word : studyData[currentIndex]?.meaning}
              </h3>
              <p className="text-sm sm:text-base md:text-lg font-normal text-slate-400 dark:text-slate-500 italic uppercase">
                {studyData[currentIndex]?.reading}
              </p>

              {(studyData[currentIndex]?.example || studyData[currentIndex]?.exampleMeaning) && (
                <div className="mt-6 flex flex-col items-center gap-1.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl w-full max-w-sm animate-in fade-in">
                  <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">Từ vựng / Ví dụ</span>
                  {studyData[currentIndex]?.example && (
                    <p className="text-base sm:text-lg font-kanji font-medium text-slate-800 dark:text-slate-200">
                      {studyData[currentIndex]?.example}
                    </p>
                  )}
                  {studyData[currentIndex]?.exampleMeaning && (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic text-center">
                      {studyData[currentIndex]?.exampleMeaning}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* CLASSIC FLASHCARD MODE */
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="perspective h-[380px] sm:h-[450px] cursor-pointer group"
        >
          <div key={currentIndex} className={`relative w-full h-full transition-all duration-700 preserve-3d shadow-2xl rounded-[3rem] ${isFlipped ? 'rotate-y-180' : 'hover:scale-[1.01]'}`}>
            {/* Front Face */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-6 sm:p-12 text-center">
              <h2 className={`font-medium mb-6 sm:mb-8 select-all break-all whitespace-pre-wrap leading-tight ${showVietnameseFirst ? 'text-2xl sm:text-3xl md:text-5xl italic text-slate-900 dark:text-white' : 'text-4xl sm:text-5xl md:text-7xl font-kanji text-slate-900 dark:text-white'}`}>
                {showVietnameseFirst ? studyData[currentIndex]?.meaning : studyData[currentIndex]?.word}
              </h2>
              <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em] animate-pulse">NHẤN ĐỂ LẬT THẺ</p>
            </div>

            {/* Back Face */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-6 sm:p-12 text-center">
              <span className="text-[10px] font-normal text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-4">
                {showVietnameseFirst ? studyData[currentIndex]?.meaning : studyData[currentIndex]?.word}
              </span>
              <div className="h-px w-12 bg-slate-100 dark:bg-slate-800 mb-8" />
              <h3 className={`font-medium text-slate-900 dark:text-white mb-4 ${showVietnameseFirst ? 'text-3xl sm:text-4xl md:text-5xl font-kanji' : 'text-2xl sm:text-3xl md:text-4xl italic'}`}>
                {showVietnameseFirst ? studyData[currentIndex]?.word : studyData[currentIndex]?.meaning}
              </h3>
              <p className="text-sm sm:text-base md:text-lg font-normal text-slate-400 dark:text-slate-500 italic uppercase">
                {studyData[currentIndex]?.reading}
              </p>

              {(studyData[currentIndex]?.example || studyData[currentIndex]?.exampleMeaning) && (
                <div className="mt-6 flex flex-col items-center gap-1.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl w-full max-w-sm animate-in fade-in">
                  <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">Từ vựng / Ví dụ</span>
                  {studyData[currentIndex]?.example && (
                    <p className="text-base sm:text-lg font-kanji font-medium text-slate-800 dark:text-slate-200">
                      {studyData[currentIndex]?.example}
                    </p>
                  )}
                  {studyData[currentIndex]?.exampleMeaning && (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic text-center">
                      {studyData[currentIndex]?.exampleMeaning}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {flashcardSubMode === 'memorize' ? (
        <div className="flex justify-center gap-6 mt-8">
          <button
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 rounded-full border border-rose-100 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-500 hover:text-white text-rose-500 flex items-center justify-center transition-all duration-300 shadow-md active:scale-95 shrink-0"
            title="Chưa thuộc (Quẹt trái / Phím mũi tên ←)"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex-1 max-w-xs py-5 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-black dark:hover:border-white transition-all text-center"
            title="Lật thẻ (Phím Space / Mũi tên ↓)"
          >
            LẬT THẺ
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 rounded-full border border-emerald-100 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-500 hover:text-white text-emerald-500 flex items-center justify-center transition-all duration-300 shadow-md active:scale-95 shrink-0"
            title="Đã nhớ (Quẹt phải / Phím mũi tên →)"
          >
            <Check className="w-6 h-6" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => { if (currentIndex > 0) { setCurrentIndex(prev => prev - 1); setIsFlipped(false); } }}
            disabled={currentIndex === 0}
            className="flex-1 py-5 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-black dark:hover:border-white transition-all disabled:opacity-20"
            title="Quay lại (Phím mũi tên ←)"
          >
            QUAY LẠI
          </button>
          <button
            onClick={() => {
              if (currentIndex < studyData.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setIsFlipped(false);
              } else {
                setShowResults(true);
              }
            }}
            className="flex-[2] py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase shadow-2xl hover:scale-[1.02] transition-all"
            title="Tiếp theo (Phím mũi tên →)"
          >
            {currentIndex === studyData.length - 1 ? 'KẾT THÚC' : 'TIẾP THEO'}
          </button>
        </div>
      )}
    </div>
  );
}
