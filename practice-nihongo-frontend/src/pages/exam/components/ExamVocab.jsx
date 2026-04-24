import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { examVocabData } from '../data/examData';
import { ChevronLeft, ArrowRight, List, Brain, CheckCircle, RefreshCcw } from 'lucide-react';

export default function ExamVocab({ type = 'comprehensive' }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list'); // 'list', 'flashcard', 'quiz', 'summary'

  // Flashcard State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlashcardReversed, setIsFlashcardReversed] = useState(false);

  // Quiz State
  const [quizData, setQuizData] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [quizType, setQuizType] = useState('jp-to-vn'); // 'jp-to-vn', 'vn-to-jp'
  const [isShuffle, setIsShuffle] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef(null);

  const [searchParams] = useSearchParams();
  const dayParam = searchParams.get('day');
  const weekParam = searchParams.get('week');
  const isAll = searchParams.get('all') === 'true';

  const currentData = useMemo(() => {
    const rawData = examVocabData[type] || { title: '', words: [] };
    
    if (type === 'kanji-pc8' && weekParam && !isAll) {
      const filteredWords = rawData.words.filter(w => 
        String(w.week) === String(weekParam) && String(w.day) === String(dayParam)
      );
      return {
        ...rawData,
        title: `Hán tự PC8 - Tuần ${weekParam} Ngày ${dayParam}`,
        words: filteredWords
      };
    }

    if (type === 'kanji-pc8' && isAll) {
      return {
        ...rawData,
        title: `Hán tự PC8 - Tất cả Tuần ${weekParam}`,
        words: rawData.words
      };
    }
    
    return rawData;
  }, [type, dayParam, weekParam, isAll]);

  // Actions
  const startQuiz = useCallback((type = 'jp-to-vn') => {
    const data = isShuffle ? [...currentData.words].sort(() => Math.random() - 0.5) : [...currentData.words];
    setQuizData(data);
    setQuizIndex(0);
    setScore(0);
    setUserInput('');
    setFeedback(null);
    setShowHint(false);
    setQuizType(type);
    setViewMode('quiz');
  }, [currentData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (viewMode === 'flashcard') {
        if (e.code === 'ArrowRight') nextCard();
        if (e.code === 'ArrowLeft') prevCard();
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') { 
          e.preventDefault(); 
          setIsFlipped(f => !f); 
        }
      } else if (viewMode === 'quiz' && !feedback) {
        if (e.key === 'Enter') checkAnswer();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [viewMode, cardIndex, feedback, userInput]);

  // Flashcard logic
  const nextCard = () => { if (cardIndex < currentData.words.length - 1) { setCardIndex(i => i + 1); setIsFlipped(false); } };
  const prevCard = () => { if (cardIndex > 0) { setCardIndex(i => i - 1); setIsFlipped(false); } };

  // Quiz logic
  const checkAnswer = () => {
    const currentWord = quizData[quizIndex];
    const input = userInput.toLowerCase().trim();
    
    let isCorrect = false;
    if (quizType === 'jp-to-vn') {
      const answer = currentWord.meaning.toLowerCase().trim();
      isCorrect = input === answer;
    } else {
      // vn-to-jp: Allow kanji, kana or alternative accepts
      const kanji = currentWord.kanji.toLowerCase().trim();
      const kana = currentWord.kana.toLowerCase().trim();
      const accepts = (currentWord.accepts || []).map(a => a.toLowerCase().trim());
      isCorrect = input === kanji || input === kana || accepts.includes(input);
    }

    if (isCorrect) {
      setFeedback('correct');
      setScore(s => s + 1);
    } else {
      setFeedback('incorrect');
    }
  };
  const nextQuiz = () => {
    if (quizIndex < quizData.length - 1) {
      setQuizIndex(i => i + 1);
      setUserInput('');
      setFeedback(null);
      setShowHint(false);
    } else {
      setShowResults(true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-32 md:pt-24 pb-20 px-4 md:px-6 font-sans relative overflow-hidden text-slate-900">



      <div className="w-full max-w-5xl relative z-10">

        {/* Navigation & Header */}
        <div className="mb-12">
          <button
            onClick={() => {
              if (type === 'kanji-pc8' && (dayParam || isAll)) {
                navigate('/exam-pc8/kanji');
              } else {
                navigate(type.includes('pc8') ? '/exam-pc8' : '/exam-pc7');
              }
            }}
            className="px-6 py-2 border-2 border-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all font-sans relative z-[200] cursor-pointer mb-8"
          >
            {viewMode === 'list' ? 'Quay lại' : 'Thoát luyện tập'}
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6 flex-grow">
               <div className="border-l-4 border-black pl-6 py-2 animate-in slide-in-from-left-4 duration-500">
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight">
                  {currentData.title}
                </h1>
                <p className="text-xs md:text-sm text-slate-400 font-medium italic mt-1">
                  Ôn tập tổng hợp nội dung quan trọng cho kỳ thi {type.includes('pc8') ? 'PC8' : 'PC7'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 self-start md:self-end items-start md:items-end">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Shuffle Toggle */}
                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2">Xáo trộn</span>
                  <button 
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none ${isShuffle ? 'bg-black' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isShuffle ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                {/* Mode Switcher */}
                <div className="flex bg-slate-50 p-1 rounded-full border border-slate-100 whitespace-nowrap overflow-x-auto no-scrollbar max-w-full">
                  <button onClick={() => setViewMode('list')} className={`px-5 py-2 rounded-full text-[10px] font-medium transition-all ${viewMode === 'list' ? 'bg-black text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Danh sách</button>
                  <button onClick={() => { setViewMode('flashcard'); setCardIndex(0); setIsFlipped(false); }} className={`px-5 py-2 rounded-full text-[10px] font-medium transition-all ${viewMode === 'flashcard' ? 'bg-black text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Flashcard</button>
                  <button onClick={() => setViewMode('quiz')} className={`px-5 py-2 rounded-full text-[10px] font-medium transition-all ${viewMode === 'quiz' ? 'bg-black text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Luyện tập</button>
                </div>
              </div>

              {/* Quiz Selection Sub-menu */}
              {viewMode === 'quiz' && (
                <div className="flex bg-white p-1 rounded-xl border border-dotted border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                  <button 
                    onClick={() => startQuiz('jp-to-vn')} 
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-bold transition-all ${quizType === 'jp-to-vn' ? 'bg-slate-100 text-black shadow-none' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    NHẬT - VIỆT
                  </button>
                  <button 
                    onClick={() => startQuiz('vn-to-jp')} 
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-bold transition-all ${quizType === 'vn-to-jp' ? 'bg-slate-100 text-black shadow-none' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    VIỆT - NHẬT
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STUDY VIEWS */}

        {viewMode === 'list' && (
          <div className="w-full border-t border-slate-100 pt-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 gap-1">
              {currentData.words.map((word, index) => (
                <div key={index} className="group flex flex-col md:flex-row md:items-center py-4 px-4 hover:bg-slate-50 transition-all rounded-2xl border border-transparent hover:border-slate-100">
                  <div className="w-10 text-[10px] font-black text-slate-200 group-hover:text-slate-400 mb-2 md:mb-0">{(index + 1).toString().padStart(2, '0')}</div>
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-8 items-center">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-900 leading-tight">{word.kanji}</span>
                      {word.sino && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{word.sino}</span>}
                    </div>
                    <div className="flex items-center md:justify-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">{word.kana}</span>
                    </div>
                    <div className="flex items-center md:justify-end">
                      <span className="text-sm md:text-base font-bold text-slate-600 bg-slate-50/50 group-hover:bg-white group-hover:shadow-sm px-4 py-1.5 rounded-xl border border-transparent group-hover:border-slate-100 transition-all italic">
                        {word.meaning}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'flashcard' && currentData.words.length > 0 && (
          <div className="max-w-4xl mx-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 py-12">
            <div className="w-full flex justify-between items-center mb-10 px-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Tiến trình: {cardIndex + 1} / {currentData.words.length}</span>
                <div className="h-1 bg-slate-100 w-48 md:w-64 rounded-full overflow-hidden"><div className="h-full bg-black transition-all" style={{ width: `${((cardIndex + 1) / currentData.words.length) * 100}%` }}></div></div>
              </div>
              
              <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100 shadow-sm ml-4">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2">Hiện Nghĩa Trước</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsFlashcardReversed(!isFlashcardReversed); setIsFlipped(false); }}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none ${isFlashcardReversed ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isFlashcardReversed ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
            <div className="group perspective w-full aspect-[16/10] md:max-h-[400px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
              <div className={`relative w-full h-full duration-500 preserve-3d shadow-xl rounded-[3rem] ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute inset-0 backface-hidden bg-white border border-slate-100 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center">
                  {!isFlashcardReversed ? (
                    <>
                      <div className="text-6xl md:text-8xl font-black text-slate-900 leading-tight italic">{currentData.words[cardIndex].kanji}</div>
                      <div className="mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest italic decoration-slate-100 underline underline-offset-8">NHẤN ĐỂ LẬT XEM NGHĨA</div>
                    </>
                  ) : (
                    <>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Nghĩa tiếng Việt</div>
                      <div className="text-4xl md:text-6xl font-black text-slate-900 leading-tight italic font-serif">"{currentData.words[cardIndex].meaning}"</div>
                      <div className="mt-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest italic decoration-slate-100 underline underline-offset-8">NHẤN ĐỂ LẬT XEM TỪ</div>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-950 text-slate-950 rounded-[3rem] rotate-y-180 flex flex-col items-center justify-center p-12 text-center">
                  {!isFlashcardReversed ? (
                    <>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Nghĩa tiếng Việt</div>
                      <div className="text-3xl md:text-5xl font-black italic leading-tight mb-2">"{currentData.words[cardIndex].meaning}"</div>
                      {currentData.words[cardIndex].sino && <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">({currentData.words[cardIndex].sino})</div>}
                      <div className="text-xl font-bold text-slate-400 uppercase tracking-widest font-mono">{currentData.words[cardIndex].kana}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl md:text-8xl font-black text-slate-900 leading-tight italic">{currentData.words[cardIndex].kanji}</div>
                      {currentData.words[cardIndex].sino && <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 italic">{currentData.words[cardIndex].sino}</div>}
                      <div className="text-2xl font-bold text-slate-400 uppercase tracking-widest font-mono mt-4">{currentData.words[cardIndex].kana}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-12 flex gap-4">
              <button onClick={prevCard} disabled={cardIndex === 0} className={`px-8 py-3 rounded-2xl border text-[10px] font-black uppercase transition-all ${cardIndex === 0 ? 'opacity-10' : 'hover:bg-slate-50'}`}>TRƯỚC</button>
              <button onClick={nextCard} disabled={cardIndex === currentData.words.length - 1} className={`px-12 py-3 rounded-2xl bg-black text-white text-[10px] font-black uppercase transition-all ${cardIndex === currentData.words.length - 1 ? 'opacity-10' : 'hover:scale-105 active:scale-95'}`}>TIẾP</button>
            </div>
          </div>
        )}

        {viewMode === 'quiz' && quizData.length > 0 && (
          <div className="max-w-2xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-12 duration-700 py-12">
            <div className="w-full flex justify-between mb-12">
              <div className="flex flex-col"><span className="text-[10px] font-black text-slate-300 uppercase">CÂU HỎI</span><span className="font-black">{quizIndex + 1}/{quizData.length}</span></div>
              <div className="flex flex-col items-end"><span className="text-[10px] font-black text-slate-300 uppercase">ĐÚNG</span><span className="font-black text-emerald-600">{score}</span></div>
            </div>
            <div className="text-center w-full space-y-16">
              <div className="space-y-4">
                {quizType === 'jp-to-vn' ? (
                  <>
                    <div className="text-6xl md:text-8xl font-black text-slate-900 leading-tight italic">{quizData[quizIndex].kanji}</div>
                    <div className="text-2xl font-bold text-slate-300 italic uppercase tracking-widest">{quizData[quizIndex].kana}</div>
                  </>
                ) : (
                  <div className="text-4xl md:text-6xl font-black text-slate-900 leading-tight italic">"{quizData[quizIndex].meaning}"</div>
                )}
              </div>
              <div className="space-y-6 w-full max-w-md mx-auto">
                <input 
                  ref={inputRef} 
                  disabled={!!feedback} 
                  value={userInput} 
                  onChange={e => setUserInput(e.target.value)} 
                  type="text" 
                  placeholder={quizType === 'jp-to-vn' ? "Gõ nghĩa tiếng Việt..." : "Gõ từ tiếng Nhật (Kanji/Kana)..."}
                  className={`w-full text-center py-6 text-2xl md:text-3xl font-black border-b-4 outline-none transition-all ${feedback === 'correct' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/20' : feedback === 'incorrect' ? 'border-red-500 text-red-600 bg-red-50/20' : 'border-black focus:border-slate-300'}`} 
                />
                <div className="flex flex-col gap-4">
                  {!feedback ? (
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={checkAnswer} className="py-4 bg-black text-white text-[10px] font-bold uppercase rounded-2xl hover:scale-105 transition-all">KIỂM TRA</button>
                      <button onClick={() => setShowHint(!showHint)} className="py-4 border border-slate-200 text-slate-400 text-[10px] font-bold uppercase rounded-2xl hover:border-black hover:text-black transition-colors">{showHint ? 'ẨN GỢI Ý' : 'XEM GỢI Ý'}</button>
                    </div>
                  ) : (
                    <button onClick={nextQuiz} className="py-4 bg-black text-white text-[10px] font-bold uppercase rounded-2xl animate-in zoom-in-95 duration-300">{quizIndex === quizData.length - 1 ? 'XEM KẾT QUẢ' : 'CÂU TIẾP THEO'}</button>
                  )}
                  {showHint && !feedback && (
                    <div className="bg-slate-50 p-4 rounded-xl text-xs font-bold text-slate-400 italic">
                      Gợi ý: {quizType === 'jp-to-vn' ? quizData[quizIndex].meaning.substring(0, 2) : quizData[quizIndex].kana.substring(0, 2)}...
                    </div>
                  )}
                  {feedback === 'incorrect' && (
                    <div className="bg-emerald-50 p-6 rounded-2xl text-center shadow-inner">
                      <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">ĐÁP ÁN ĐÚNG</p>
                      {quizType === 'jp-to-vn' ? (
                        <p className="text-3xl font-black text-emerald-700 italic">"{quizData[quizIndex].meaning}"</p>
                      ) : (
                        <div className="flex flex-col">
                          <p className="text-3xl font-black text-emerald-700 italic">{quizData[quizIndex].kanji}</p>
                          <p className="text-lg font-bold text-emerald-600">{quizData[quizIndex].kana}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Screen - Now a clean, centered modal popup */}
        {showResults && (
           <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 sm:p-4 animate-in fade-in duration-300">
             {/* Deep backdrop */}
             <div 
               className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
               onClick={() => setShowResults(false)}
             />
             
             {/* Compact Result Modal */}
             <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-[0_30px_100px_-10px_rgba(0,0,0,0.3)] p-8 md:p-10 text-center animate-in zoom-in duration-300">
                
                {/* Floating Icon */}
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto shadow-2xl absolute -top-8 left-1/2 -translate-x-1/2 rotate-3 border-4 border-white">
                  <Brain className="w-8 h-8 text-white" />
                </div>

                <div className="mt-8 space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Hoàn thành!</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Kết quả luyện tập của bạn</p>
                  </div>

                  <div className="py-6 border-y border-slate-50">
                    <div className="text-7xl font-black text-slate-950 tracking-tighter italic">
                      {score}
                      <span className="text-2xl font-black text-slate-200 italic align-top ml-1">/ {quizData.length || currentData.words.length}</span>
                    </div>
                  </div>

                  <p className="text-slate-500 text-[13px] font-medium italic leading-relaxed px-2">
                    {score === (quizData.length || currentData.words.length) ? 'Tuyệt đỉnh! Bạn đã chinh phục hoàn toàn bài học này.' : 
                     score > (quizData.length || currentData.words.length) / 2 ? 'Rất tốt! Hãy tiếp tục phát huy nhé.' : 
                     'Đừng nản lòng! Hãy ôn lại và thử sức một lần nữa nhé.'}
                  </p>

                  <div className="grid grid-cols-1 gap-3 pt-2">
                    <button 
                      onClick={() => {
                          setShowResults(false);
                          if (viewMode === 'quiz') startQuiz(quizType);
                          else { setCardIndex(0); setIsFlipped(false); }
                      }}
                      className="w-full py-4.5 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Luyện tập lại
                    </button>
                    <button 
                      onClick={() => {
                          setShowResults(false);
                          setViewMode('list');
                      }}
                      className="w-full py-4.5 bg-slate-50 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:text-black transition-all flex items-center justify-center gap-3"
                    >
                      <List className="w-4 h-4" />
                      Danh sách từ vựng
                    </button>
                  </div>
                </div>
             </div>
           </div>
        )}

      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .perspective { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
}
