import React, { useState, useMemo, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { dekiruData } from './data';
import { List, Brain, CheckCircle } from 'lucide-react';

// --- Sub-components ---

const WordList = memo(({ words }) => (
  <div className="w-full border-t border-slate-100 pt-8 animate-in fade-in duration-700">
    <div className="grid grid-cols-1 gap-1">
      {words.map((word, index) => (
        <div key={index} className="group flex flex-col md:flex-row md:items-center py-4 px-4 hover:bg-slate-50 transition-all rounded-2xl border border-transparent hover:border-slate-100">
          <div className="w-10 text-[10px] font-black text-slate-200 group-hover:text-slate-400 mb-2 md:mb-0">{(index + 1).toString().padStart(2, '0')}</div>
          <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-8 items-center">
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-slate-900 leading-tight font-kanji">{word.kanji}</span>
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
));

const FlashcardSection = memo(({ words, cardIndex, isFlipped, setIsFlipped, nextCard, prevCard }) => {
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  if (!words.length) return null;

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(0);
  };
  const handleTouchMove = (e) => {
    const currentX = e.targetTouches[0].clientX;
    setTouchEndX(currentX);
    if (touchStartX) {
      setDragOffset(currentX - touchStartX);
    }
  };
  const handleTouchEnd = () => {
    setDragOffset(0);
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 80) nextCard();
    else if (distance < -80) prevCard();
    setTouchStartX(0);
    setTouchEndX(0);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 py-12"
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}>
      <div className="w-full flex justify-between items-center mb-10 px-4">
        <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Tiến trình: {cardIndex + 1} / {words.length}</span>
        <div className="h-1 bg-slate-100 w-64 rounded-full overflow-hidden">
          <div className="h-full bg-black transition-all" style={{ width: `${((cardIndex + 1) / words.length) * 100}%` }}></div>
        </div>
      </div>
      <div 
        className="group perspective w-full aspect-[9/11] sm:aspect-[16/10] md:max-h-[400px] cursor-pointer" 
        style={{
          transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`,
          transition: dragOffset === 0 ? 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-500 preserve-3d shadow-xl rounded-[2.5rem] md:rounded-[3rem] ${isFlipped ? 'rotate-y-180' : ''}`}>
          <div className="absolute inset-0 backface-hidden bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[3rem] flex flex-col items-center justify-center p-8 md:p-12 text-center">
            <div className="text-6xl md:text-8xl font-semibold text-slate-900 leading-tight italic font-kanji">{words[cardIndex].kanji}</div>
            <div className="mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest italic decoration-slate-100 underline underline-offset-8">NHẤN ĐỂ LẬT</div>
          </div>
          <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-950 text-slate-950 rounded-[2.5rem] md:rounded-[3rem] rotate-y-180 flex flex-col items-center justify-center p-8 md:p-12 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Nghĩa tiếng Việt</div>
            <div className="text-3xl md:text-5xl font-black italic leading-tight mb-4">"{words[cardIndex].meaning}"</div>
            <div className="text-xl font-semibold text-slate-400 uppercase tracking-widest font-kanji">{words[cardIndex].kana}</div>
          </div>
        </div>
      </div>
      <div className="mt-12 flex gap-4">
        <button onClick={prevCard} disabled={cardIndex === 0} className={`px-8 py-3 rounded-2xl border text-[10px] font-black uppercase transition-all ${cardIndex === 0 ? 'opacity-10' : 'hover:bg-slate-50'}`}>TRƯỚC</button>
        <button onClick={nextCard} disabled={cardIndex === words.length - 1} className={`px-12 py-3 rounded-2xl bg-black text-white text-[10px] font-black uppercase transition-all ${cardIndex === words.length - 1 ? 'opacity-10' : 'hover:scale-105 active:scale-95'}`}>TIẾP</button>
      </div>
    </div>
  );
});

const QuizSection = memo(({ quizData, quizIndex, quizType, userInput, setUserInput, feedback, checkAnswer, nextQuiz, showHint, setShowHint, inputRef, score }) => {
  if (!quizData.length) return null;
  const currentWord = quizData[quizIndex];

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-12 duration-700 py-12">
      <div className="w-full flex justify-between mb-12">
        <div className="flex flex-col"><span className="text-[10px] font-black text-slate-300 uppercase">CÂU HỎI</span><span className="font-black">{quizIndex + 1}/{quizData.length}</span></div>
        <div className="flex flex-col items-end"><span className="text-[10px] font-black text-slate-300 uppercase">ĐÚNG</span><span className="font-black text-emerald-600">{score}</span></div>
      </div>
      <div className="text-center w-full space-y-16">
        <div className="space-y-4">
          {quizType === 'jp-to-vn' ? (
            <>
              <div className="text-6xl md:text-8xl font-semibold text-slate-900 leading-tight italic font-kanji">{currentWord.kanji}</div>
              <div className="text-2xl font-semibold text-slate-300 italic uppercase tracking-widest font-kanji">{currentWord.kana}</div>
            </>
          ) : (
            <div className="text-4xl md:text-6xl font-black text-slate-900 leading-tight italic">"{currentWord.meaning}"</div>
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
                Gợi ý: {quizType === 'jp-to-vn' ? currentWord.meaning.substring(0, 2) : currentWord.kana.substring(0, 2)}...
              </div>
            )}
            {feedback === 'incorrect' && (
              <div className="bg-emerald-50 p-6 rounded-2xl text-center shadow-inner">
                <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">ĐÁP ÁN ĐÚNG</p>
                {quizType === 'jp-to-vn' ? (
                  <p className="text-3xl font-black text-emerald-700 italic">"{currentWord.meaning}"</p>
                ) : (
                  <div className="flex flex-col">
                    <p className="text-3xl font-black text-emerald-700 italic">{currentWord.kanji}</p>
                    <p className="text-lg font-bold text-emerald-600">{currentWord.kana}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const ResultsModal = memo(({ score, total, onRestart, onBack, onClose, quizType }) => (
  <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 sm:p-4 animate-in fade-in duration-300">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-[0_30px_100px_-10px_rgba(0,0,0,0.3)] p-8 md:p-10 text-center animate-in zoom-in duration-300">
      <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto shadow-2xl absolute -top-8 left-1/2 -translate-x-1/2 rotate-3 border-4 border-white">
        <Brain className="w-8 h-8 text-white" />
      </div>
      <div className="mt-8 space-y-6">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Hoàn thành!</h2>
        <div className="py-6 border-y border-slate-50">
          <div className="text-7xl font-black text-slate-950 tracking-tighter italic">{score}<span className="text-2xl font-black text-slate-200 italic align-top ml-1">/ {total}</span></div>
        </div>
        <p className="text-slate-500 text-[13px] font-medium italic leading-relaxed px-2">
          {score === total ? 'Tuyệt đỉnh! Bạn đã chinh phục hoàn toàn bài học này.' : score > total / 2 ? 'Rất tốt! Hãy tiếp tục phát huy nhé.' : 'Đừng nản lòng! Hãy ôn lại và thử sức một lần nữa nhé.'}
        </p>
        <div className="grid grid-cols-1 gap-3 pt-2">
          <button onClick={() => onRestart(quizType)} className="w-full py-4 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"><CheckCircle className="w-4 h-4" /> Luyện tập lại</button>
          <button onClick={onBack} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"><List className="w-4 h-4" /> Danh sách</button>
        </div>
      </div>
    </div>
  </div>
));

// --- Main Component ---

export default function DekiruVocab() {
  const navigate = useNavigate();
  
  // High-level State
  const [activeSection, setActiveSection] = useState(dekiruData[0].id);
  const [activeLesson, setActiveLesson] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'flashcard', 'quiz'

  // View Specific State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizData, setQuizData] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [quizType, setQuizType] = useState('jp-to-vn');
  const [isShuffle, setIsShuffle] = useState(true);
  const [showResults, setShowResults] = useState(false);
  
  const inputRef = useRef(null);

  // Memoized Data
  const currentSection = useMemo(() => dekiruData.find(s => s.id === activeSection) || dekiruData[0], [activeSection]);
  
  const currentWords = useMemo(() => {
    if (currentSection.lessons) {
      const lesson = currentSection.lessons.find(l => l.id === activeLesson) || currentSection.lessons[0];
      return lesson.words;
    }
    return currentSection.words || [];
  }, [currentSection, activeLesson]);

  // Initial lesson setup
  useEffect(() => {
    if (currentSection.lessons && !activeLesson) {
      setActiveLesson(currentSection.lessons[0].id);
    }
  }, [currentSection, activeLesson]);

  // View state resets
  const resetView = useCallback((mode) => {
    setViewMode(mode);
    setCardIndex(0);
    setIsFlipped(false);
    setUserInput('');
    setFeedback(null);
    setShowHint(false);
    setShowResults(false);
  }, []);

  // Actions
  const startQuiz = useCallback((type = 'jp-to-vn') => {
    const data = isShuffle ? [...currentWords].sort(() => Math.random() - 0.5) : [...currentWords];
    setQuizData(data);
    setQuizIndex(0);
    setScore(0);
    setUserInput('');
    setFeedback(null);
    setShowHint(false);
    setQuizType(type);
    setViewMode('quiz');
    setShowResults(false);
  }, [currentWords, isShuffle]);

  const nextCard = useCallback(() => {
    if (cardIndex < currentWords.length - 1) {
      setCardIndex(i => i + 1);
      setIsFlipped(false);
    }
  }, [cardIndex, currentWords.length]);

  const prevCard = useCallback(() => {
    if (cardIndex > 0) {
      setCardIndex(i => i - 1);
      setIsFlipped(false);
    }
  }, [cardIndex]);

  const checkAnswer = useCallback(() => {
    if (feedback) return;
    const currentWord = quizData[quizIndex];
    if (!currentWord) return;
    
    const input = userInput.toLowerCase().trim();
    let isCorrect = false;

    if (quizType === 'jp-to-vn') {
      const answer = currentWord.meaning.toLowerCase().trim();
      const accepts = (currentWord.accepts || []).map(a => a.toLowerCase().trim());
      isCorrect = input === answer || accepts.includes(input);
    } else {
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
  }, [feedback, quizData, quizIndex, userInput, quizType]);

  const nextQuiz = useCallback(() => {
    if (quizIndex < quizData.length - 1) {
      setQuizIndex(i => i + 1);
      setUserInput('');
      setFeedback(null);
      setShowHint(false);
    } else {
      setShowResults(true);
    }
  }, [quizData.length, quizIndex]);

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
      } else if (viewMode === 'quiz' && feedback) {
        if (e.key === 'Enter') nextQuiz();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [viewMode, cardIndex, feedback, userInput, nextCard, prevCard, checkAnswer, nextQuiz]);

  // Auto focus input
  useEffect(() => {
    if (viewMode === 'quiz' && !feedback) {
      inputRef.current?.focus();
    }
  }, [quizIndex, viewMode, feedback]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-52 md:pt-40 pb-20 px-4 md:px-6 font-sans relative overflow-hidden text-slate-900">
      
      {/* Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black text-slate-100 opacity-[0.03] pointer-events-none select-none leading-none z-0 whitespace-nowrap uppercase">
        DEKIRU
      </div>

      <div className="w-full max-w-5xl relative z-10">
        
        {/* Navigation Header */}
        <div className="mb-12">
          <button
            onClick={() => viewMode === 'list' ? navigate('/vocabulary') : resetView('list')}
            className="px-6 py-2 border-2 border-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all mb-8 shadow-sm"
          >
            {viewMode === 'list' ? 'Quay lại' : 'Thoát luyện tập'}
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6 flex-grow">
              
              {/* Section Switcher */}
              <div className="flex flex-col gap-4">
                <span className="text-slate-300 font-bold text-[10px] tracking-[0.3em] uppercase">Chọn chuyên mục</span>
                <div className="flex gap-2 flex-wrap">
                  {dekiruData.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setActiveSection(s.id); setActiveLesson(s.lessons?.[0].id || null); resetView('list'); }}
                      className={`px-4 py-1.5 border ${activeSection === s.id ? 'bg-black text-white border-black shadow-md' : 'border-slate-100 text-slate-400 hover:border-black hover:text-black'} text-[10px] font-bold transition-all rounded-lg uppercase`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Section */}
              <div className="border-l-4 border-black pl-6 py-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
                  {currentSection.title} {currentSection.lessons && activeLesson && `- ${currentSection.lessons.find(l => l.id === activeLesson)?.title}`}
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">{currentSection.japanese}</p>
              </div>

              {/* Lesson Switcher */}
              {currentSection.lessons && (
                <div className="flex flex-col gap-4 mt-6">
                  <span className="text-slate-300 font-bold text-[10px] tracking-[0.3em] uppercase">Chọn bài học</span>
                  <div className="flex gap-2 flex-wrap">
                    {currentSection.lessons.map(l => (
                      <button
                        key={l.id}
                        onClick={() => { setActiveLesson(l.id); resetView('list'); }}
                        className={`px-4 py-1.5 border-2 ${activeLesson === l.id ? 'bg-slate-900 text-white border-black' : 'border-slate-50 text-slate-400 hover:border-slate-200'} text-[9px] font-black transition-all rounded-xl uppercase tracking-widest`}
                      >
                        {l.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 items-start md:items-end">
              <div className="flex flex-col md:flex-row items-center gap-4">
                
                {/* Shuffle - Quiz Only */}
                {viewMode === 'quiz' && (
                  <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2">Xáo trộn</span>
                    <button onClick={() => setIsShuffle(!isShuffle)} className={`relative w-10 h-5 rounded-full transition-colors ${isShuffle ? 'bg-black' : 'bg-slate-200'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isShuffle ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                )}

                {/* Mode Switcher */}
                <div className="flex bg-slate-50 p-1 rounded-full border border-slate-100">
                  {['list', 'flashcard', 'quiz'].map(m => (
                    <button 
                      key={m} 
                      onClick={() => resetView(m)} 
                      className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${viewMode === m ? 'bg-black text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {m === 'list' ? 'Danh sách' : m === 'flashcard' ? 'Flashcard' : 'Luyện tập'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz Sub-menu */}
              {viewMode === 'quiz' && (
                <div className="flex bg-white p-1 rounded-xl border border-dotted border-slate-200 animate-in fade-in duration-300">
                  {['jp-to-vn', 'vn-to-jp'].map(t => (
                    <button 
                      key={t}
                      onClick={() => startQuiz(t)} 
                      className={`px-4 py-1.5 rounded-lg text-[9px] font-black tracking-tighter transition-all ${quizType === t ? 'bg-slate-100 text-black' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {t === 'jp-to-vn' ? 'NHẬT - VIỆT' : 'VIỆT - NHẬT'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic View Rendering */}
        {viewMode === 'list' && <WordList words={currentWords} />}
        {viewMode === 'flashcard' && (
          <FlashcardSection 
            words={currentWords} 
            cardIndex={cardIndex} 
            isFlipped={isFlipped} 
            setIsFlipped={setIsFlipped} 
            nextCard={nextCard} 
            prevCard={prevCard} 
          />
        )}
        {viewMode === 'quiz' && (
          <QuizSection 
            quizData={quizData} 
            quizIndex={quizIndex} 
            quizType={quizType}
            userInput={userInput}
            setUserInput={setUserInput}
            feedback={feedback}
            checkAnswer={checkAnswer}
            nextQuiz={nextQuiz}
            showHint={showHint}
            setShowHint={setShowHint}
            inputRef={inputRef}
            score={score}
          />
        )}

        {/* Results */}
        {showResults && (
          <ResultsModal 
            score={score} 
            total={quizData.length} 
            onRestart={startQuiz} 
            onBack={() => resetView('list')} 
            onClose={() => setShowResults(false)}
            quizType={quizType}
          />
        )}

      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .perspective { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}
