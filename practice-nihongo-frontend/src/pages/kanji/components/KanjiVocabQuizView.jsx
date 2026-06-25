import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, Eye } from 'lucide-react';

export default function KanjiVocabQuizView({ kanjiVocabs }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showReading, setShowReading] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Generate quiz questions once when kanjiVocabs change
  const questions = useMemo(() => {
    if (!kanjiVocabs || kanjiVocabs.length < 4) return [];
    
    // Shuffle all vocabs
    const shuffledVocabs = [...kanjiVocabs].sort(() => Math.random() - 0.5);
    // Take all questions
    const selectedQuestions = shuffledVocabs;
    
    return selectedQuestions.map(vocab => {
      const wrongOptions = kanjiVocabs.filter(v => v.word !== vocab.word);
      const shuffledWrong = [...wrongOptions].sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [
        { ...vocab, isCorrect: true },
        ...shuffledWrong.map(v => ({ ...v, isCorrect: false }))
      ].sort(() => Math.random() - 0.5);
      
      return {
        vocab,
        options
      };
    });
  }, [kanjiVocabs]);

  // Reset state on new question
  useEffect(() => {
    setSelectedOption(null);
    setIsCorrect(null);
    setShowReading(false);
  }, [currentIndex]);

  const handleSelect = (option) => {
    if (selectedOption) return;
    
    setSelectedOption(option);
    setIsCorrect(option.isCorrect);
    if (option.isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setScore(0);
    setQuizFinished(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowReading(false);
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cần tối thiểu 4 từ vựng để học trắc nghiệm</p>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 md:p-12 text-center space-y-6 max-w-md mx-auto shadow-sm animate-in fade-in">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">KẾT QUẢ ĐẠT ĐƯỢC</h3>
          <div className="w-24 h-24 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto shadow-inner border border-slate-100 dark:border-slate-800">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-200">{score}/{questions.length}</span>
          </div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
            Bạn đã trả lời đúng {Math.round((score / questions.length) * 100)}% số câu hỏi!
          </p>
          <button 
            onClick={handleReset} 
            className="bg-black dark:bg-white text-white dark:text-black hover:opacity-80 w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center"
          >
            Luyện tập lại
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="flex flex-col gap-4 sm:gap-8 animate-in fade-in duration-500 w-full">
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              Tiến trình: {currentIndex + 1} / {questions.length}
            </span>
            <div className="h-1 bg-slate-100 dark:bg-slate-800 w-32 sm:w-48 rounded-full overflow-hidden">
              <div
                className="h-full bg-black dark:bg-white transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-slate-900 dark:text-white text-[10px] font-black underline decoration-slate-300 uppercase tracking-widest hidden sm:inline">
              Đúng: {score}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl sm:rounded-[3rem] p-4 sm:p-12 text-center shadow-sm">
          <div className="mb-6 sm:mb-10 space-y-2 sm:space-y-4">
            <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Chọn nghĩa đúng của từ sau</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black italic text-slate-900 dark:text-white select-all break-all whitespace-pre-wrap leading-tight">
              {currentQuestion.vocab.word}
            </h2>
            {currentQuestion.vocab.reading && (
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
                    <span className="italic uppercase tracking-widest">{currentQuestion.vocab.reading}</span>
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
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption?.word === option.word;
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
            onClick={handleNext}
            disabled={!selectedOption}
            className={`w-full py-3.5 sm:py-5 rounded-2xl text-[10px] font-black uppercase transition-all shadow-xl sm:shadow-2xl ${
              selectedOption 
                ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02]' 
                : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70'
            }`}
          >
            {currentIndex === questions.length - 1 ? 'KẾT THÚC' : 'TIẾP THEO'}
          </button>
        </div>
      </div>
    </div>
  );
}
