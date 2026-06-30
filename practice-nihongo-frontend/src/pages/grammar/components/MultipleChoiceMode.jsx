import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

export default function MultipleChoiceMode({
  activeData,
  grammarData,
  currentIndex,
  setActiveMode,
  isShuffle,
  handleToggleShuffle,
  handleResetProgress,
  handlePrev,
  handleNext,
  getQuizSentence
}) {
  const [mcOptions, setMcOptions] = useState([]);
  const [mcSelected, setMcSelected] = useState(null);
  const [mcChecked, setMcChecked] = useState(false);

  useEffect(() => {
    if (activeData[currentIndex]) {
      const correctOption = activeData[currentIndex]?.quiz.answer;
      if (!correctOption) return;

      const uniqueAnswers = Array.from(new Set(grammarData.map(item => item.quiz?.answer).filter(Boolean)));
      let otherOptions = uniqueAnswers.filter(ans => ans !== correctOption);
      otherOptions = otherOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
      const allOptions = [correctOption, ...otherOptions].sort(() => 0.5 - Math.random());

      setMcOptions(allOptions);
      setMcSelected(null);
      setMcChecked(false);
    }
  }, [currentIndex, activeData, grammarData]);

  useEffect(() => {
    if (mcOptions.length === 0) return;

    const handleKeyDown = (e) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (idx < mcOptions.length && !mcChecked) {
          setMcSelected(mcOptions[idx]);
          setMcChecked(true);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (mcChecked) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mcOptions, mcSelected, mcChecked, handleNext]);

  const handleMcSelect = (option) => {
    if (mcChecked) return;
    setMcSelected(option);
    setMcChecked(true);
  };

  const handleMcSubmit = () => {
    if (mcChecked) {
      handleNext();
    } else {
      if (mcSelected) {
        setMcChecked(true);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto pb-24 sm:pb-0">
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
            CÂU: {currentIndex + 1} / {activeData.length}
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
              setMcSelected(null);
              setMcChecked(false);
            }}
            className="px-3 py-1 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
          >
            LÀM LẠI
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-50 dark:bg-slate-900 w-full rounded-full overflow-hidden border border-slate-100/50 dark:border-slate-900/50">
        <div
          className="h-full bg-black dark:bg-white transition-all duration-500 rounded-full"
          style={{ width: `${((currentIndex + 1) / (activeData.length || 1)) * 100}%` }}
        />
      </div>

      {/* MC Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-12 shadow-sm relative overflow-hidden">
        {mcChecked && mcSelected === activeData[currentIndex]?.quiz.answer && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 animate-pulse"></div>
        )}
        {mcChecked && mcSelected !== activeData[currentIndex]?.quiz.answer && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 animate-pulse"></div>
        )}

        <div className="text-center mb-6 sm:mb-10">
          <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider mb-4 sm:mb-8 inline-block border border-slate-100 dark:border-slate-900">
            CHỌN ĐÁP ÁN ĐÚNG
          </span>

          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {activeData[currentIndex] && getQuizSentence(activeData[currentIndex].quiz.sentence, activeData[currentIndex].quiz.quizSentence, activeData[currentIndex].quiz.answer)}
            </h2>
            {mcChecked && (
              <p className="text-sm italic text-slate-500 dark:text-slate-400 whitespace-pre-wrap animate-in fade-in">
                {activeData[currentIndex]?.quiz.translation}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {mcOptions.map((opt, idx) => {
            const isCorrect = opt === activeData[currentIndex]?.quiz.answer;
            const isSelected = mcSelected === opt;
            let btnClass = "border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950";

            if (mcChecked) {
              if (isCorrect) {
                btnClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20";
              } else if (isSelected && !isCorrect) {
                btnClass = "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300";
              } else {
                btnClass = "border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-50";
              }
            } else if (isSelected) {
              btnClass = "border-black dark:border-white bg-slate-50 dark:bg-slate-900 text-black dark:text-white ring-2 ring-black/10 dark:ring-white/10";
            }

            return (
              <button
                key={idx}
                onClick={() => handleMcSelect(opt)}
                disabled={mcChecked}
                className={`py-3 sm:py-4 pr-4 pl-12 sm:px-12 rounded-xl sm:rounded-2xl border-2 font-bold text-sm sm:text-[15px] transition-all duration-300 ${btnClass} active:scale-95 flex items-center justify-start sm:justify-center relative min-h-[3.5rem]`}
              >
                <span className="absolute left-3 sm:left-4 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] flex items-center justify-center font-black text-slate-400 shrink-0">{idx + 1}</span>
                <span className="text-left sm:text-center leading-snug break-words w-full">{opt}</span>
              </button>
            );
          })}
        </div>

        {mcChecked && (
          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 animate-in fade-in text-center">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500">GIẢI THÍCH</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white mr-2">{activeData[currentIndex]?.quiz.answer}</span>
              {activeData[currentIndex]?.explanation || "Cấu trúc này có nghĩa là: " + activeData[currentIndex]?.meaning}
            </p>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-between items-center gap-4 px-2 sticky bottom-4 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md py-3 sm:py-0 rounded-2xl sm:static sm:bg-transparent sm:backdrop-blur-none shadow-sm sm:shadow-none border border-slate-100 dark:border-slate-800 sm:border-none">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-700 hover:text-black dark:text-slate-300 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" /> QUAY LẠI
        </button>

        <button
          onClick={handleMcSubmit}
          disabled={!mcSelected && !mcChecked}
          className={`flex-1 py-4 text-white disabled:opacity-40 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95
            ${mcChecked
              ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100'
              : 'bg-black dark:bg-white text-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 border border-black dark:border-white'}`}
        >
          {mcChecked ? (
            <>TIẾP THEO <ChevronRight className="w-4 h-4" /></>
          ) : (
            'KIỂM TRA (ENTER)'
          )}
        </button>
      </div>
    </div>
  );
}
