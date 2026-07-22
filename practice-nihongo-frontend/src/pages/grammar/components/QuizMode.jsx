import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import ExplanationText from '../../../components/ExplanationText';

export default function QuizMode({
  activeData,
  currentIndex,
  setActiveMode,
  isShuffle,
  handleToggleShuffle,
  handleResetProgress,
  handlePrev,
  handleNext,
  getQuizSentence
}) {
  const [quizInput, setQuizInput] = useState('');
  const [quizStatus, setQuizStatus] = useState('idle'); // idle, hint, correct, incorrect, revealed

  useEffect(() => {
    setQuizInput('');
    setQuizStatus('idle');
  }, [currentIndex]);

  const handleQuizSubmit = () => {
    if (quizStatus === 'correct' || quizStatus === 'revealed' || quizStatus === 'incorrect') {
      handleNext();
      return;
    }

    if (!quizInput.trim()) {
      if (quizStatus === 'idle') {
        setQuizStatus('hint');
      } else if (quizStatus === 'hint') {
        setQuizStatus('revealed');
      }
      return;
    }

    const currentAnswer = activeData[currentIndex]?.quiz?.answer || '';
    const cleanAnswer = currentAnswer.replace(/[～~]/g, '').trim().toLowerCase();
    const cleanInput = quizInput.replace(/[～~]/g, '').trim().toLowerCase();

    if (cleanInput.length > 0 && (cleanInput === cleanAnswer || cleanAnswer.includes(cleanInput))) {
      setQuizStatus('correct');
    } else {
      setQuizStatus('incorrect');
    }
  };

  const handleQuizKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuizSubmit();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto pb-24 sm:pb-0">
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
              setQuizInput('');
              setQuizStatus('idle');
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

      {/* Quiz Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
        {quizStatus === 'correct' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 animate-pulse"></div>
        )}
        {quizStatus === 'incorrect' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 animate-pulse"></div>
        )}

        <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider mb-8 inline-block border border-slate-100 dark:border-slate-900">
          ĐIỀN NGỮ PHÁP PHÙ HỢP
        </span>

        <div className="space-y-6 mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {activeData[currentIndex] && getQuizSentence(activeData[currentIndex].quiz.sentence, activeData[currentIndex].quiz.quizSentence, activeData[currentIndex].quiz.answer)}
          </h2>
        </div>

        <div className="max-w-sm mx-auto space-y-4">
          <input
            type="text"
            value={quizInput}
            onChange={(e) => setQuizInput(e.target.value)}
            onKeyDown={handleQuizKeyDown}
            readOnly={quizStatus === 'correct' || quizStatus === 'revealed' || quizStatus === 'incorrect'}
            placeholder="Nhập ngữ pháp..."
            className={`w-full text-center px-6 py-4 bg-slate-50 dark:bg-slate-950 border-2 rounded-2xl outline-none font-bold text-lg transition-all
              ${quizStatus === 'correct' ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' :
                quizStatus === 'incorrect' ? 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30' :
                  quizStatus === 'revealed' ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30' :
                    'border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white'}`}
            autoFocus
          />

          {quizStatus === 'hint' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium animate-in fade-in">
              Gợi ý: Cấu trúc này có nghĩa là "{activeData[currentIndex]?.meaning}"
            </div>
          )}

          {(quizStatus === 'correct' || quizStatus === 'revealed' || quizStatus === 'incorrect') && (
            <div className="space-y-4 animate-in fade-in">
              <div className={`p-4 rounded-xl ${quizStatus === 'correct' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' :
                quizStatus === 'incorrect' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300' :
                  'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                }`}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">
                  {quizStatus === 'correct' ? 'CHÍNH XÁC!' : quizStatus === 'incorrect' ? 'CHƯA CHÍNH XÁC - ĐÁP ÁN' : 'ĐÁP ÁN'}
                </p>
                <p className="text-xl font-bold">{activeData[currentIndex]?.quiz.answer}</p>
                {activeData[currentIndex]?.quiz.translation && (
                  <p className="text-xs mt-2 font-medium italic opacity-90 border-t border-slate-100/10 dark:border-slate-800/20 pt-2">Dịch: {activeData[currentIndex].quiz.translation}</p>
                )}
                {activeData[currentIndex]?.explanation && (
                  <ExplanationText text={activeData[currentIndex].explanation} className="text-xs mt-2 opacity-80" />
                )}
              </div>
            </div>
          )}
        </div>
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
          onClick={handleQuizSubmit}
          className={`flex-1 py-4 text-white disabled:opacity-40 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95
            ${(quizStatus === 'correct' || quizStatus === 'revealed' || quizStatus === 'incorrect')
              ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 border border-black dark:border-white'
              : 'bg-black dark:bg-white text-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 border border-black dark:border-white'}`}
        >
          {(quizStatus === 'correct' || quizStatus === 'revealed' || quizStatus === 'incorrect') ? (
            <>TIẾP THEO <ChevronRight className="w-4 h-4" /></>
          ) : (
            'KIỂM TRA (ENTER)'
          )}
        </button>
      </div>
    </div>
  );
}
