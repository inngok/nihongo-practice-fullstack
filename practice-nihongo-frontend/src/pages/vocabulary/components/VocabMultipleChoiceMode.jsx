import React, { useState, useEffect, useMemo } from 'react';
import { Check, X } from 'lucide-react';

export default function VocabMultipleChoiceMode({
  studyData,
  currentIndex,
  setCurrentIndex,
  handleResetProgress,
  setShowResults
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const currentItem = studyData[currentIndex];

  const options = useMemo(() => {
    if (!currentItem || studyData.length === 0) return [];
    
    const wrongOptions = studyData.filter(item => item.id !== currentItem.id);
    const shuffledWrong = [...wrongOptions].sort(() => Math.random() - 0.5).slice(0, 3);
    
    const combined = [
      {...currentItem, isCorrect: true}, 
      ...shuffledWrong.map(item => ({...item, isCorrect: false}))
    ];
    
    return combined.sort(() => Math.random() - 0.5);
  }, [currentIndex, currentItem, studyData]);

  useEffect(() => {
    setSelectedOption(null);
    setIsCorrect(null);
  }, [currentIndex]);

  const handleSelect = (option) => {
    if (selectedOption) return;

    setSelectedOption(option);
    setIsCorrect(option.isCorrect);
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
      {/* Progress Bar */}
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            Tiến trình: {currentIndex + 1} / {studyData.length}
          </span>
          <div className="h-1 bg-slate-100 dark:bg-slate-800 w-32 sm:w-48 rounded-full overflow-hidden">
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

      <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl sm:rounded-[3rem] p-4 sm:p-12 text-center shadow-sm">
        <div className="mb-6 sm:mb-10 space-y-2 sm:space-y-4">
          <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Chọn nghĩa đúng của từ sau</span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black italic text-slate-900 dark:text-white select-all break-all whitespace-pre-wrap leading-tight">
            {currentItem.word}
          </h2>
          {currentItem.reading && (
             <p className="text-sm sm:text-base font-normal text-slate-400 dark:text-slate-500 italic uppercase tracking-widest">
               {currentItem.reading}
             </p>
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
                    'border-slate-200 dark:border-slate-700 group-hover:border-black dark:group-hover:border-white text-transparent group-hover:text-black dark:group-hover:text-white'
                  }`}>
                    {selectedOption && isCorrectOption ? <Check size={14} className="text-white dark:text-black" /> :
                     selectedOption && isSelected && !isCorrectOption ? <X size={14} className="text-white" /> :
                     <span className="text-[9px] sm:text-[10px] font-black">{String.fromCharCode(65 + idx)}</span>}
                  </div>
                  <span className="text-sm sm:text-lg font-bold">
                    {option.meaning}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-row gap-3 sm:gap-4 mt-2 sm:mt-4">
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
