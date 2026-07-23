import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, Eye, Volume2, VolumeX } from 'lucide-react';

export default function VocabMultipleChoiceMode({
  studyData,
  currentIndex,
  setCurrentIndex,
  handleResetProgress,
  setShowResults,
  isShuffle,
  setIsShuffle
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showReading, setShowReading] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);

  const currentItem = studyData[currentIndex];

  const options = useMemo(() => {
    if (!currentItem || studyData.length === 0) return [];
    
    const wrongOptions = studyData.filter(item => item.id !== currentItem.id);
    const shuffledWrongPool = [...wrongOptions];
    for (let i = shuffledWrongPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledWrongPool[i], shuffledWrongPool[j]] = [shuffledWrongPool[j], shuffledWrongPool[i]];
    }
    const shuffledWrong = shuffledWrongPool.slice(0, 3);
    
    const combined = [
      {...currentItem, isCorrect: true}, 
      ...shuffledWrong.map(item => ({...item, isCorrect: false}))
    ];
    
    const shuffledCombined = [...combined];
    for (let i = shuffledCombined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCombined[i], shuffledCombined[j]] = [shuffledCombined[j], shuffledCombined[i]];
    }
    
    return shuffledCombined;
  }, [currentIndex, currentItem, studyData]);

  useEffect(() => {
    setSelectedOption(null);
    setShowReading(false);
  }, [currentIndex]);

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = currentItem.reading || currentItem.hiragana || currentItem.word;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelect = (option) => {
    if (selectedOption) return;

    setSelectedOption(option);

    setShowReading(true);
    
    if (autoPlayAudio) {
      playAudio();
    }
  };

  const handleNext = () => {
    if (currentIndex < studyData.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  if (!currentItem) return null;

  return (
    <div className="flex flex-col gap-4 sm:gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
      {/* Control Buttons */}
      <div className="flex justify-between items-center gap-4 px-2 sticky bottom-4 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md py-3 sm:py-0 rounded-2xl sm:static sm:bg-transparent sm:backdrop-blur-none shadow-sm sm:shadow-none border border-slate-100 dark:border-slate-800 sm:border-none">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setAutoPlayAudio(!autoPlayAudio)}
            className={`p-2 rounded-lg transition-all border ${autoPlayAudio ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 border-indigo-100 dark:border-indigo-900' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:text-slate-600'}`}
            title="Tự động đọc khi trả lời đúng"
          >
            {autoPlayAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest hidden sm:inline">
            Tiến trình: {currentIndex + 1} / {studyData.length}
          </span>
          <div className="h-1 bg-slate-100 dark:bg-slate-800 w-24 sm:w-48 rounded-full overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / (studyData.length || 1)) * 100}%` }}
            />
          </div>
          <button
            onClick={handleResetProgress}
            className="px-3 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-500 border border-rose-100 dark:border-rose-900 hover:bg-rose-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shrink-0"
          >
            HỌC LẠI
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-0">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">XÁO TRỘN</span>
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`relative shrink-0 w-8 sm:w-11 h-4 sm:h-6 rounded-full transition-all duration-300 ${isShuffle ? 'bg-black dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'}`}
          >
            <div className={`absolute top-0.5 sm:top-1 w-3 sm:w-4 h-3 sm:h-4 rounded-full transition-all duration-300 ${isShuffle ? 'left-[18px] sm:left-6 bg-white dark:bg-black' : 'left-0.5 sm:left-1 bg-white dark:bg-slate-400'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl sm:rounded-[3rem] p-4 sm:p-12 text-center shadow-sm">
        <div className="mb-6 sm:mb-10 space-y-2 sm:space-y-4">
          <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Chọn nghĩa đúng của từ sau</span>
          <div className="flex items-center justify-center">
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium font-kanji text-slate-900 dark:text-white select-all break-all whitespace-pre-wrap leading-tight">
                {currentItem.word}
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio();
                }}
                className={`absolute left-full top-1/2 -translate-y-1/2 ml-1 sm:ml-3 p-2 sm:p-3 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-300 ${selectedOption ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
                title="Nghe phát âm"
              >
                <Volume2 size={24} className="sm:w-7 sm:h-7" />
              </button>
            </div>
          </div>
          {currentItem.reading && (
             <div className="flex justify-center pt-2">
               <button 
                 onClick={() => setShowReading(!showReading)}
                 className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-xs sm:text-sm font-medium ${
                   showReading 
                     ? 'text-slate-500 dark:text-slate-400' 
                     : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                 }`}
               >
                 {showReading ? (
                   <span className="font-medium tracking-widest">{currentItem.reading}</span>
                 ) : (
                   <>
                     <Eye size={14} />
                     <span>Xem cách đọc</span>
                   </>
                 )}
               </button>
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {options.map((option, idx) => {
            const isSelected = selectedOption?.id === option.id;
            const isCorrectOption = option.isCorrect;
            
            let btnClass = "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-black dark:hover:border-white hover:shadow-md";
            
            if (selectedOption) {
              if (isCorrectOption) {
                btnClass = "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-lg";
              } else if (isSelected && !isCorrectOption) {
                btnClass = "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 shadow-rose-500/20";
              } else {
                btnClass = "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                disabled={!!selectedOption}
                onClick={() => handleSelect(option)}
                className={`relative p-3 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left flex flex-col justify-center min-h-[64px] sm:min-h-[100px] group ${btnClass}`}
              >
                <div className="flex items-center sm:items-start gap-3 sm:gap-4 w-full">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    selectedOption && isCorrectOption ? 'border-white dark:border-black bg-black dark:bg-white text-white dark:text-black' :
                    selectedOption && isSelected && !isCorrectOption ? 'border-rose-500 bg-rose-500 text-white' :
                    'border-slate-200 dark:border-slate-700 group-hover:border-black dark:group-hover:border-white text-slate-400 dark:text-slate-500 group-hover:text-black dark:group-hover:text-white'
                  }`}>
                    {selectedOption && isCorrectOption ? <Check size={14} className="text-white dark:text-black" /> :
                     selectedOption && isSelected && !isCorrectOption ? <X size={14} className="text-white" /> :
                     <span className="text-[9px] sm:text-[10px] font-black">{String.fromCharCode(65 + idx)}</span>}
                  </div>
                  <span className="text-sm sm:text-lg font-bold">
                    {option.meaning?.normalize('NFC')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-row gap-3 sm:gap-4 mt-2 sm:mt-4 sticky bottom-4 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md py-3 sm:py-0 rounded-2xl sm:static sm:bg-transparent sm:backdrop-blur-none shadow-sm sm:shadow-none border border-slate-100 dark:border-slate-800 sm:border-none">
        <button
          onClick={() => { 
            if (currentIndex > 0) { 
              setCurrentIndex(prev => prev - 1); 
            } 
          }}
          disabled={currentIndex === 0}
          className="flex-1 py-3.5 sm:py-5 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-black dark:hover:border-white transition-all disabled:opacity-20"
        >
          QUAY LẠI
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedOption}
          className={`flex-[2] py-3.5 sm:py-5 rounded-2xl text-[10px] font-black uppercase transition-all shadow-xl sm:shadow-2xl ${
            selectedOption 
              ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02]' 
              : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70'
          }`}
        >
          {currentIndex === studyData.length - 1 ? 'KẾT THÚC' : 'TIẾP THEO'}
        </button>
      </div>
    </div>
  );
}
