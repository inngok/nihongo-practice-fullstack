import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Settings2, Volume2 } from 'lucide-react';

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
  setShowResults,
  showHanViet,
  setShowHanViet,
  setShowVietnameseFirst,
  isShuffle,
  setIsShuffle
}) {
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);

  const playAudio = (customText = null) => {
    const currentItem = studyData[currentIndex];
    if (!currentItem) return;
    const text = customText || currentItem.reading || currentItem.hiragana || currentItem.word;
    if (!text) return;
    
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ja&q=${encodeURIComponent(text)}`;
      const audio = new Audio(url);
      audio.playbackRate = 0.85;
      
      audio.play().catch(e => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'ja-JP';
          utterance.rate = 0.85;
          const voices = window.speechSynthesis.getVoices();
          const jaVoice = voices.find(v => v.lang === 'ja-JP' && (v.name.includes('Google') || v.name.includes('Premium')));
          if (jaVoice) utterance.voice = jaVoice;
          window.speechSynthesis.speak(utterance);
        }
      });
    } catch (error) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.85;
        const voices = window.speechSynthesis.getVoices();
        const jaVoice = voices.find(v => v.lang === 'ja-JP' && (v.name.includes('Google') || v.name.includes('Premium')));
        if (jaVoice) utterance.voice = jaVoice;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  useEffect(() => {
    if (autoPlayAudio) {
      if (!showVietnameseFirst && !isFlipped) {
        playAudio();
      } else if (showVietnameseFirst && isFlipped) {
        playAudio();
      }
    }
  }, [currentIndex, isFlipped, showVietnameseFirst, autoPlayAudio]);

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

      {/* Settings button - replaces the open toggle row */}
      {(() => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [open, setOpen] = useState(false);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const ref = useRef(null);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
          document.addEventListener('mousedown', handler);
          return () => document.removeEventListener('mousedown', handler);
        }, []);
        const Toggle = ({ label, value, onChange }) => (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">{label}</span>
            <button
              onClick={onChange}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-all duration-300 ${value ? 'bg-slate-800 dark:bg-slate-200' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${value ? 'left-6 bg-white dark:bg-slate-900' : 'left-1 bg-white dark:bg-slate-400'}`} />
            </button>
          </div>
        );
        return (
          <div className="flex justify-end px-4" ref={ref}>
            <div className="relative">
              <button
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  open
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              >
                <Settings2 size={13} />
                Cài đặt
              </button>
              {open && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-4 flex flex-col gap-4 z-50">
                  <Toggle label="Tự động đọc" value={autoPlayAudio} onChange={() => setAutoPlayAudio(!autoPlayAudio)} />
                  <Toggle label="Xáo trộn" value={isShuffle} onChange={() => setIsShuffle(!isShuffle)} />
                  <Toggle label="Hán Việt" value={showHanViet} onChange={() => setShowHanViet(!showHanViet)} />
                  <Toggle label="Việt → Nhật" value={showVietnameseFirst} onChange={() => { setShowVietnameseFirst(!showVietnameseFirst); setIsFlipped(false); }} />
                </div>
              )}
            </div>
          </div>
        );
      })()}

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

              <div className="relative flex items-center justify-center mb-6 sm:mb-8">
                <h2 className={`font-medium select-all break-all whitespace-pre-wrap leading-tight ${showVietnameseFirst ? 'text-2xl sm:text-3xl md:text-5xl italic text-slate-900 dark:text-white' : 'text-4xl sm:text-5xl md:text-7xl font-kanji text-slate-900 dark:text-white'}`}>
                  {showVietnameseFirst ? studyData[currentIndex]?.meaning : studyData[currentIndex]?.word}
                </h2>
                {!showVietnameseFirst && (
                  <button
                    onClick={(e) => { e.stopPropagation(); playAudio(); }}
                    className="absolute left-full ml-2 sm:ml-4 p-2 sm:p-3 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-300"
                    title="Nghe phát âm"
                  >
                    <Volume2 size={24} className="sm:w-6 sm:h-6" />
                  </button>
                )}
              </div>
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
              <div className="relative flex items-center justify-center mb-4">
                <h3 className={`font-medium text-slate-900 dark:text-white ${showVietnameseFirst ? 'text-3xl sm:text-4xl md:text-5xl font-kanji' : 'text-2xl sm:text-3xl md:text-4xl italic'}`}>
                  {showVietnameseFirst ? studyData[currentIndex]?.word : studyData[currentIndex]?.meaning}
                </h3>
                {showVietnameseFirst && (
                  <button
                    onClick={(e) => { e.stopPropagation(); playAudio(); }}
                    className="absolute left-full ml-2 sm:ml-4 p-2 sm:p-3 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-300"
                    title="Nghe phát âm"
                  >
                    <Volume2 size={24} className="sm:w-6 sm:h-6" />
                  </button>
                )}
              </div>
              <p className="text-sm sm:text-base md:text-lg font-normal text-slate-400 dark:text-slate-500 tracking-wider">
                {studyData[currentIndex]?.reading}
              </p>
              {showHanViet && studyData[currentIndex]?.hanviet && (
                <div className="mt-6 px-4 py-1.5 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-[0.2em] border border-slate-200 dark:border-slate-800">
                  {studyData[currentIndex]?.hanviet}
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
          <div key={currentIndex} className={`relative w-full h-full transition-all duration-700 preserve-3d shadow-2xl rounded-[3rem] ${isFlipped ? 'rotate-y-180' : 'hover:-translate-y-1 hover:shadow-3xl'}`}>
            {/* Front Face — challenge side, no hanviet hint here */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-6 sm:p-12 text-center">
              <div className="relative flex items-center justify-center mb-6 sm:mb-8">
                <h2 className={`font-medium select-all break-all whitespace-pre-wrap leading-tight ${showVietnameseFirst ? 'text-2xl sm:text-3xl md:text-5xl italic text-slate-900 dark:text-white' : 'text-4xl sm:text-5xl md:text-7xl font-kanji text-slate-900 dark:text-white'}`}>
                  {showVietnameseFirst ? studyData[currentIndex]?.meaning : studyData[currentIndex]?.word}
                </h2>
                {!showVietnameseFirst && (
                  <button
                    onClick={(e) => { e.stopPropagation(); playAudio(); }}
                    className="absolute left-full ml-2 sm:ml-4 p-2 sm:p-3 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-300"
                    title="Nghe phát âm"
                  >
                    <Volume2 size={24} className="sm:w-6 sm:h-6" />
                  </button>
                )}
              </div>
              <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em] animate-pulse">NHẤN ĐỂ LẬT THẺ</p>
            </div>

            {/* Back Face */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-6 sm:p-12 text-center">
              <span className="text-[10px] font-normal text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-4">
                {showVietnameseFirst ? studyData[currentIndex]?.meaning : studyData[currentIndex]?.word}
              </span>
              <div className="h-px w-12 bg-slate-100 dark:bg-slate-800 mb-8" />
              <div className="relative flex items-center justify-center mb-4">
                <h3 className={`font-medium text-slate-900 dark:text-white ${showVietnameseFirst ? 'text-3xl sm:text-4xl md:text-5xl font-kanji' : 'text-2xl sm:text-3xl md:text-4xl italic'}`}>
                  {showVietnameseFirst ? studyData[currentIndex]?.word : studyData[currentIndex]?.meaning}
                </h3>
                {showVietnameseFirst && (
                  <button
                    onClick={(e) => { e.stopPropagation(); playAudio(); }}
                    className="absolute left-full ml-2 sm:ml-4 p-2 sm:p-3 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-300"
                    title="Nghe phát âm"
                  >
                    <Volume2 size={24} className="sm:w-6 sm:h-6" />
                  </button>
                )}
              </div>
              <p className="text-sm sm:text-base md:text-lg font-normal text-slate-400 dark:text-slate-500 tracking-wider">
                {studyData[currentIndex]?.reading}
              </p>
              {showHanViet && studyData[currentIndex]?.hanviet && (
                <div className="mt-6 px-4 py-1.5 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-[0.2em] border border-slate-200 dark:border-slate-800">
                  {studyData[currentIndex]?.hanviet}
                </div>
              )}


            </div>
          </div>
        </div>
      )}

      {flashcardSubMode === 'memorize' ? (
        <div className="flex justify-center gap-6 mt-8 sticky bottom-4 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md py-3 sm:py-0 rounded-2xl sm:static sm:bg-transparent sm:backdrop-blur-none shadow-sm sm:shadow-none border border-slate-100 dark:border-slate-800 sm:border-none">
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
        <div className="flex flex-col sm:flex-row gap-4 mt-8 sticky bottom-4 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md p-3 sm:py-0 rounded-2xl sm:static sm:bg-transparent sm:backdrop-blur-none shadow-sm sm:shadow-none border border-slate-100 dark:border-slate-800 sm:border-none">
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
