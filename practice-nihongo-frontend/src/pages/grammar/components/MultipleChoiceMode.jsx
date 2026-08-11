import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import ExplanationText from '../../../components/ExplanationText';
import { extractMissingText, getQuizSentence } from '../utils/grammarHelpers';

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
}) {
  const [mcOptions, setMcOptions] = useState([]);
  const [mcSelected, setMcSelected] = useState(null);
  const [mcChecked, setMcChecked] = useState(false);

  // Pre-compute all possible answers from the full grammar data set
  const allAnswers = useMemo(() => {
    const answers = [];
    grammarData.forEach(item => {
      if (!item.quiz?.answer) return;
      const sentences = (item.quiz.sentence || '').split('\n').map(s => s.trim()).filter(Boolean);
      const quizSentences = (item.quiz.quizSentence || '').split('\n').map(s => s.trim()).filter(Boolean);

      if (quizSentences.length > 0) {
        quizSentences.forEach((qs, i) => {
          // Match quiz sentence to its full sentence
          const parts = qs.split(/_+/).map(p => p.trim()).filter(Boolean);
          let matched = '';
          if (parts.length > 0) {
            const matchIdx = sentences.findIndex(s => {
              let lastIdx = 0;
              for (const part of parts) {
                const currentIdx = s.indexOf(part, lastIdx);
                if (currentIdx === -1) return false;
                lastIdx = currentIdx + part.length;
              }
              return true;
            });
            if (matchIdx !== -1) matched = sentences[matchIdx];
          }
          const answer = extractMissingText(matched, qs, item.quiz.answer);
          if (answer) answers.push(answer);
        });
      } else if (sentences.length > 0) {
        sentences.forEach(s => {
          const answer = extractMissingText(s, '', item.quiz.answer);
          if (answer) answers.push(answer);
        });
      }
    });
    return [...new Set(answers)];
  }, [grammarData]);

  // Get the correct answer for the current question
  const getCorrectAnswer = () => {
    const item = activeData[currentIndex];
    if (!item?.quiz) return '';
    return extractMissingText(item.quiz.sentence, item.quiz.quizSentence, item.quiz.answer);
  };

  useEffect(() => {
    if (activeData[currentIndex]) {
      const correctAnswer = getCorrectAnswer();
      if (!correctAnswer) return;

      // Pick distractors with similar length to the correct answer
      const correctLen = correctAnswer.length;
      let pool = allAnswers.filter(a => a !== correctAnswer);
      
      // Try progressively wider length ranges until we have at least 3
      let wrongOptions = [];
      for (let tolerance = 2; tolerance <= correctLen + 5; tolerance++) {
        wrongOptions = pool.filter(a => Math.abs(a.length - correctLen) <= tolerance);
        if (wrongOptions.length >= 3) break;
      }
      if (wrongOptions.length < 3) wrongOptions = pool;
      wrongOptions = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);

      const allOptions = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random());

      setMcOptions(allOptions);
      setMcSelected(null);
      setMcChecked(false);
    }
  }, [currentIndex, activeData, allAnswers]);

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

  const correctAnswer = getCorrectAnswer();
  const isCorrectSelected = mcChecked && mcSelected === correctAnswer;
  const isWrongSelected = mcChecked && mcSelected !== correctAnswer;
  const currentItem = activeData[currentIndex];

  return (
    <div className="space-y-4 sm:space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto pb-32">
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
        {isCorrectSelected && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 animate-pulse"></div>
        )}
        {isWrongSelected && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 animate-pulse"></div>
        )}

        <div className="text-center mb-6 sm:mb-10">
          <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider mb-4 sm:mb-8 inline-block border border-slate-100 dark:border-slate-900">
            CHỌN ĐÁP ÁN ĐÚNG
          </span>

          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentItem && getQuizSentence(currentItem.quiz.sentence, currentItem.quiz.quizSentence, currentItem.quiz.answer)}
            </h2>
            {mcChecked && (
              <p className="text-sm italic text-slate-500 dark:text-slate-400 whitespace-pre-wrap animate-in fade-in">
                {currentItem?.quiz.translation}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {mcOptions.map((opt, idx) => {
            const isCorrect = opt === correctAnswer;
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
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500">GIẢI THÍCH</p>
            <div className="space-y-2">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{correctAnswer}</p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Cấu trúc: {currentItem?.pattern || currentItem?.quiz.answer}</p>
              {currentItem?.meaning && (
                <p className="text-xs text-slate-500 dark:text-slate-400">Nghĩa: {currentItem.meaning}</p>
              )}
              {currentItem?.explanation && (
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                  <ExplanationText text={currentItem.explanation} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-between items-center gap-4 px-4 sticky bottom-4 sm:bottom-8 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl py-3 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 hover:text-black dark:text-slate-300 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> QUAY LẠI
        </button>

        <button
          onClick={handleMcSubmit}
          disabled={!mcSelected && !mcChecked}
          className={`flex-1 py-4 text-white disabled:opacity-40 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95
            ${mcChecked
              ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100'
              : 'bg-black dark:bg-white text-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 border border-black dark:border-white'}`}
        >
          {mcChecked ? (
            <>TIẾP THEO (ENTER) <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /></>
          ) : (
            'KIỂM TRA (ENTER)'
          )}
        </button>
      </div>
    </div>
  );
}
