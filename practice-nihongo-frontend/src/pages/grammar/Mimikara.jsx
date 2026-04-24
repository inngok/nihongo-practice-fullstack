import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, CheckCircle, Layers, List, Search,
  ChevronRight, ChevronLeft, Check, RotateCcw,
  HelpCircle, MoreHorizontal, ArrowLeft, Headphones, Volume2, Target
} from 'lucide-react';

import { grammarData } from './data/mimikaraData';


export default function Mimikara() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState('menu');
  const [prevMode, setPrevMode] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isShuffle, setIsShuffle] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [studyData, setStudyData] = useState([]);
  const inputRef = useRef(null);
  const [touchStartPos, setTouchStartPos] = useState({ x: null, y: null });
  const [touchEndPos, setTouchEndPos] = useState({ x: null, y: null });
  const [dragOffset, setDragOffset] = useState(0);
  const [completedIds, setCompletedIds] = useState(() => {
    const saved = localStorage.getItem('mimikara_completed');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const containerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('mimikara_completed', JSON.stringify(completedIds));
  }, [completedIds]);

  // Focus management
  useEffect(() => {
    if (activeMode !== 'menu') {
      containerRef.current?.focus();
    }
  }, [activeMode, currentIndex]);

  useEffect(() => {
    if (activeMode === 'quiz' && !feedback) inputRef.current?.focus();
  }, [currentIndex, activeMode, feedback]);

  const activeData = useMemo(() => {
    if (selectedUnit === 'all') return grammarData;
    const unitNum = parseInt(selectedUnit);
    return grammarData.filter(i => i.unit === unitNum);
  }, [selectedUnit]);

  const currentItem = useMemo(() => studyData[currentIndex] || {}, [studyData, currentIndex]);

  const multipleChoiceOptions = useMemo(() => {
    if (activeMode !== 'multiple_choice') return [];
    const correct = currentItem.answer;
    if (!correct) return [];
    
    const allAnswers = Array.from(new Set(studyData.map(i => i.answer).filter(a => a && a !== correct)));
    const wrongAnswers = allAnswers.sort(() => Math.random() - 0.5).slice(0, 3);
    return [correct, ...wrongAnswers].sort(() => Math.random() - 0.5);
  }, [currentIndex, currentItem, activeMode, studyData]);

  // Score messages lookup
  const SCORE_MESSAGES = [
    { threshold: 1, message: 'Tuyệt đỉnh! Tiếp tục phát huy nhé.' },
    { threshold: 0.5, message: 'Rất tốt! Bạn đang tiến bộ rõ rệt.' },
    { threshold: 0, message: 'Đừng nản lòng! Thử lại một lần nữa bạn nhé.' },
  ];

  const getScoreMessage = useCallback((currentScore, total) => {
    const ratio = total > 0 ? currentScore / total : 0;
    return SCORE_MESSAGES.find(m => ratio >= m.threshold)?.message;
  }, []);

  const switchMode = useCallback((mode) => {
    let data = [...activeData];
    if (mode === 'quiz' || mode === 'listening' || mode === 'multiple_choice') {
      // Flatten all book examples into a single list
      const bookData = [];
      data.forEach(item => {
        item.examples?.forEach(ex => {
          if (ex.isBook && ex.blank) {
            bookData.push({
              ...item,
              sentence: ex.jp,
              translation: ex.vn,
              answer: ex.blank,
              accepts: (item.quiz?.answer === ex.blank ? item.quiz.accepts : []) || [],
              originalPattern: item.pattern
            });
          }
        });
      });

      // If it's a quiz or multiple_choice, we can also add the main quiz patterns
      if (mode === 'quiz' || mode === 'multiple_choice') {
        data.forEach(item => {
          if (item.quiz) {
            bookData.push({
              ...item,
              sentence: item.quiz.sentence,
              translation: item.quiz.translation,
              answer: item.quiz.answer,
              accepts: item.quiz.accepts || [],
              originalPattern: item.pattern,
              isMainQuiz: true
            });
          }
        });
      }

      data = bookData;
    }
    if (['quiz', 'listening', 'multiple_choice'].includes(mode) && isShuffle) data.sort(() => Math.random() - 0.5);

    setPrevMode(activeMode);
    setStudyData(data);
    setActiveMode(mode);
    setCurrentIndex(0);
    setFeedback(null);
    setUserInput('');
    setScore(0);
    setShowResults(false);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }, [activeData, isShuffle, activeMode]);

  const handleNext = useCallback(() => {
    const isLastItem = currentIndex >= studyData.length - 1;

    const actions = {
      quiz: () => isLastItem ? setShowResults(true) : null,
      multiple_choice: () => isLastItem ? setShowResults(true) : null,
      listening: () => isLastItem ? setShowResults(true) : null,
      default: () => {
        if (isLastItem) {
          if (prevMode) {
            setActiveMode(prevMode);
            setPrevMode(null);
          } else {
            switchMode('menu');
          }
        }
      }
    };

    (actions[activeMode] || actions.default)();

    if (isLastItem) return;

    const item = studyData[currentIndex];
    const isStudyMode = ['flashcard', 'cards'].includes(activeMode);

    if (isStudyMode && !completedIds.includes(item.id)) {
      setCompletedIds(prev => [...prev, item.id]);
    }

    setCurrentIndex(curr => curr + 1);
    setFeedback(null);
    setUserInput('');
    setIsFlipped(false);
    setShowHint(false);
  }, [currentIndex, studyData, activeMode, completedIds, switchMode, prevMode, setActiveMode, setPrevMode]);

  const handleSubmit = useCallback(() => {
    if (!['quiz', 'listening'].includes(activeMode)) {
      handleNext();
      return;
    }

    if (!feedback) {
      if (!userInput.trim()) return;
      
      const normalize = (str) => str.trim().toLowerCase().replace(/[〜~、。？?\.．,，]/g, '');
      const cleanInput = normalize(userInput);
      const answer = normalize(currentItem.answer);
      const accepts = (currentItem.accepts || []).map(a => normalize(a));

      const isCorrect = cleanInput === answer || accepts.includes(cleanInput);

      setFeedback(isCorrect ? 'correct' : 'incorrect');
      if (isCorrect) {
        setScore(s => s + 1);
        if (!completedIds.includes(currentItem.id)) {
          setCompletedIds(p => [...p, currentItem.id]);
        }
      }
    } else {
      handleNext();
    }
  }, [activeMode, feedback, userInput, currentItem, completedIds, handleNext]);

  const playAudio = useCallback((text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Auto-play audio and focus input
  useEffect(() => {
    if (activeMode === 'listening' && currentItem.sentence && !feedback) {
      playAudio(currentItem.sentence);
    }
    if (['quiz', 'listening'].includes(activeMode) && !feedback) {
      inputRef.current?.focus();
    }
  }, [currentIndex, activeMode, feedback, currentItem.sentence, playAudio]);

  const handleKeyDown = (e) => {
    // If we're in an input, let the form handle Enter
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeMode === 'multiple_choice' && !feedback) return; // Wait for answer
      handleSubmit();
    } else if (e.key === ' ') {
      e.preventDefault();
      if (activeMode === 'listening' && !feedback) {
        playAudio(currentItem.sentence);
      } else if (['cards', 'flashcard'].includes(activeMode)) {
        setIsFlipped(prev => !prev);
      }
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (['flashcard', 'cards'].includes(activeMode) || feedback) {
        handleNext();
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (currentIndex > 0) {
        setCurrentIndex(curr => curr - 1);
        setFeedback(null);
        setUserInput('');
        setIsFlipped(false);
        setShowHint(false);
      }
    }
  };

  const handleTouchStart = (e) => {
    setTouchEndPos({ x: null, y: null });
    setTouchStartPos({ 
      x: e.targetTouches[0].clientX, 
      y: e.targetTouches[0].clientY 
    });
  };

  const handleTouchMove = (e) => {
    const currentX = e.targetTouches[0].clientX;
    setTouchEndPos({ 
      x: currentX, 
      y: e.targetTouches[0].clientY 
    });
    if (touchStartPos.x && ['flashcard', 'cards'].includes(activeMode)) {
      setDragOffset(currentX - touchStartPos.x);
    }
  };

  const handleTouchEnd = () => {
    setDragOffset(0);
    if (!touchStartPos.x || !touchEndPos.x) return;
    
    const distanceX = touchStartPos.x - touchEndPos.x;
    const distanceY = touchStartPos.y - touchEndPos.y;
    
    // Trigger swipe if horizontal movement is > 50px and larger than vertical movement
    if (Math.abs(distanceX) > 50 && Math.abs(distanceX) > Math.abs(distanceY)) {
      if (distanceX > 0) { // Swipe Left -> Next
        if (['flashcard', 'cards'].includes(activeMode) || feedback) {
          handleNext();
        }
      } else { // Swipe Right -> Prev
        if (currentIndex > 0) {
          setCurrentIndex(curr => curr - 1);
          setFeedback(null);
          setUserInput('');
          setIsFlipped(false);
          setShowHint(false);
        }
      }
    }
  };

  // Unified renderer for sentences with blanks
  const renderSentenceWithBlank = useCallback(() => {
    if (!currentItem.sentence) return null;
    
    const blankClass = `mx-1 border-b-2 transition-colors px-2 inline-block min-w-[60px] ${
      feedback === 'correct' ? 'border-emerald-500 text-emerald-600' : 
      feedback === 'incorrect' ? 'border-red-500 text-red-600' : 'border-slate-300'
    }`;
    
    const blankContent = feedback ? currentItem.answer : (activeMode === 'multiple_choice' ? '...' : (userInput || '...'));

    // Case 1: Sentence has literal underscores
    if (/_{4,}/.test(currentItem.sentence)) {
      return currentItem.sentence.split(/_{4,}/).map((p, i, a) => (
        <React.Fragment key={i}>
          {p}
          {i < a.length - 1 && <span className={blankClass}>{blankContent}</span>}
        </React.Fragment>
      ));
    }
    
    // Case 2: Replace occurrences of 'answer' or 'pattern' in the sentence
    let patternToMatch = currentItem.answer;
    
    // If answer is not in sentence, fall back to the main pattern (ignoring common symbols)
    const normalize = (s) => (s || '').replace(/[〜~]/g, '').trim();
    if (!patternToMatch || !currentItem.sentence.includes(patternToMatch)) {
      const mainPattern = normalize(currentItem.pattern);
      if (currentItem.sentence.includes(mainPattern)) {
        patternToMatch = mainPattern;
      }
    }

    if (patternToMatch) {
      const escapedPattern = patternToMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = currentItem.sentence.split(new RegExp(`(${escapedPattern})`, 'g'));
      
      if (parts.length === 1) return currentItem.sentence;
      
      return parts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 && i % 2 !== 0 ? <span className={blankClass}>{blankContent}</span> : p}
        </React.Fragment>
      ));
    }
    
    return currentItem.sentence;
  }, [currentItem, feedback, userInput, activeMode]);

  // RENDERING COMPONENTS (Memoized for performance)
  const MenuScreen = useMemo(() => (
    <div className="flex flex-col gap-12 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
          <button
            key={num}
            onClick={() => setSelectedUnit(num)}
            className={`px-6 py-4 border ${selectedUnit === num ? 'bg-black text-white' : 'border-slate-100 text-slate-400'} text-xs font-black transition-all`}
          >
            U{num < 10 ? `0${num}` : num}
          </button>
        ))}
        <button
          onClick={() => setSelectedUnit('all')}
          className={`px-6 py-4 border ${selectedUnit === 'all' ? 'bg-black text-white' : 'border-slate-100 text-slate-400'} text-xs font-black`}
        >
          TẤT CẢ
        </button>
      </div>
      <div className="flex flex-wrap gap-4">
        {[
          { id: 'flashcard', label: 'Ghi nhớ', icon: Brain },
          { id: 'cards', label: 'Flashcard', icon: Layers },
          { id: 'quiz', label: 'Luyện tập', icon: CheckCircle },
          { id: 'multiple_choice', label: 'Trắc nghiệm', icon: Target },
          { id: 'listening', label: 'Nghe điền', icon: Headphones },
          { id: 'list', label: 'Danh sách', icon: List }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => switchMode(m.id)}
            className="flex-1 min-w-[120px] py-5 border border-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex flex-col items-center gap-2"
          >
            <m.icon className="w-5 h-5" /> {m.label}
          </button>
        ))}
      </div>
    </div>
  ), [selectedUnit, switchMode]);

  const ListScreen = useMemo(() => (
    <div className="flex flex-col gap-8 animate-in">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border-b-2 border-slate-100 focus:border-black outline-none font-medium"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeData
          .filter(i => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return true;

            const normalize = (str) => str.toLowerCase().replace(/[\s~〜、。]/g, '');
            const normalizedTerm = normalize(term);

            return (
              i.pattern.toLowerCase().includes(term) ||
              normalize(i.pattern).includes(normalizedTerm) ||
              i.meaning.toLowerCase().includes(term) ||
              (i.romaji && (
                i.romaji.toLowerCase().includes(term) ||
                normalize(i.romaji).includes(normalizedTerm)
              ))
            );
          })
          .map(item => (
            <div
              key={item.id}
              onClick={() => { setPrevMode('list'); setStudyData([item]); setActiveMode('flashcard'); setCurrentIndex(0); }}
              className="p-8 border border-slate-100 rounded-[2rem] hover:border-black transition-all cursor-pointer group"
            >
              <div className="flex justify-between mb-4">
                <span className="text-[10px] font-black text-slate-300">U{item.unit} • #{item.id}</span>
                {completedIds.includes(item.id) && <Check className="w-4 h-4 text-emerald-500" />}
              </div>
              <h3 className="text-2xl font-semibold italic mb-2 font-kanji">{item.pattern}</h3>
              {item.romaji && <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">{item.romaji}</p>}
              <p className="text-slate-500 font-bold text-sm italic">{item.meaning}</p>
            </div>
          ))}
      </div>
    </div>
  ), [activeData, searchTerm, completedIds]);

  const StudyScreen = (
    <div 
      className="flex flex-col flex-grow animate-in"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-black text-white text-[10px] font-black rounded-full">UNIT {currentItem.unit}</span>
          <span className="text-[10px] font-black text-slate-400"># {currentItem.id}</span>
        </div>
        <div className="flex-grow flex justify-center md:justify-end items-center gap-6 w-full md:w-auto">
          <span className="text-[10px] font-black text-slate-300">TIẾN TRÌNH: {currentIndex + 1} / {studyData.length}</span>
          <div className="h-1 bg-slate-100 w-32 md:w-64 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / studyData.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        {{
          cards: (
            <div 
              key={`card-${currentIndex}-${currentItem.id}`}
              onClick={() => setIsFlipped(prev => !prev)} 
              className="w-full max-w-sm aspect-[3/4] mx-auto perspective cursor-pointer group active:cursor-grabbing"
              style={{
                transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`,
                transition: dragOffset === 0 ? 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
                opacity: 1 - Math.abs(dragOffset) / 1000
              }}
            >
              <div className={`relative w-full h-full transition-all duration-700 preserve-3d shadow-2xl rounded-[3rem] ${isFlipped ? 'rotate-y-180' : 'group-hover:scale-105'}`}>
                <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-100 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center">
                  <h2 className="text-2xl md:text-4xl font-semibold italic whitespace-normal md:whitespace-nowrap font-kanji">{currentItem.pattern}</h2>
                  <p className="mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest italic decoration-slate-100 underline underline-offset-8">NHẤN ĐỂ LẬT</p>
                </div>
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white border-2 border-slate-900 text-slate-900 rounded-[3rem] flex flex-col items-center p-8 md:p-12 text-center overflow-hidden">
                   <div className="w-full flex-grow flex flex-col items-center justify-center overflow-y-auto no-scrollbar space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xl md:text-2xl font-black italic leading-tight">{currentItem.meaning}</h3>
                        <p className="text-xs md:text-sm text-slate-500 italic font-medium px-4">{currentItem.explanation}</p>
                      </div>
                      
                      {currentItem.examples && currentItem.examples.length > 0 && (
                        <div className="w-full space-y-3 pt-4 border-t border-slate-100">
                           {currentItem.examples.map((ex, idx) => (
                             <div key={idx} className="text-left">
                               <p className="text-[11px] font-bold text-slate-900 leading-snug">{ex.jp}</p>
                               <p className="text-[10px] text-slate-400 font-medium italic">{ex.vn}</p>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                   
                   <div className="mt-6 pt-4 border-t border-slate-50 w-full flex flex-col items-center gap-2">
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">PATTERN: {currentItem.pattern}</p>
                     <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-tighter shadow-lg">LẬT LẠI</div>
                   </div>
                </div>
              </div>
            </div>
          ),
          flashcard: (
            <div className="max-w-4xl mx-auto w-full space-y-8">
              <div 
                onClick={() => setIsFlipped(prev => !prev)}
                className="bg-white border-2 border-slate-900 rounded-[2.5rem] p-12 text-center cursor-pointer hover:bg-slate-100 transition-all active:scale-[0.99] group relative overflow-hidden min-h-[300px] flex flex-col justify-center"
              >
                {!isFlipped ? (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <h2 className="text-3xl md:text-5xl font-semibold italic mb-6 whitespace-normal md:whitespace-nowrap font-kanji">{currentItem.pattern}</h2>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] animate-pulse">Nhấn để xem nghĩa / Space to flip</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <h2 className="text-xl font-semibold italic text-slate-300 mb-2 uppercase tracking-widest font-kanji">{currentItem.pattern}</h2>
                    <div className="h-px w-20 bg-slate-100 mx-auto mb-6" />
                    <h3 className="text-3xl font-black italic text-black mb-4">{currentItem.meaning}</h3>
                    <p className="text-[10px] font-bold text-slate-400 italic mb-2 px-6">{currentItem.explanation}</p>
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mt-6">Nhấn để ẩn / Space to flip back</p>
                  </div>
                )}
              </div>
              {isFlipped && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-2 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 px-2">Ví dụ Mimikara</p>
                    {currentItem.examples?.map((ex, idx) => (
                      <div key={idx} className={`relative p-4 rounded-[1.5rem] italic ${ex.isBook ? 'bg-white shadow-sm' : 'text-slate-900'}`}>
                        <p className="font-bold text-sm mb-1">{ex.jp}</p>
                        <p className="text-[11px] font-medium text-slate-400">{ex.vn}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ),
          quiz: (
            <div className="text-center space-y-12">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-full px-4 py-1.5 inline-block mx-auto mb-2 shadow-sm">
                  Gợi ý: {currentItem.isMainQuiz ? currentItem.quiz?.hint : currentItem.meaning}
                </p>
                <p className="text-slate-400 italic">"{currentItem.translation}"</p>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold italic leading-relaxed">
                {renderSentenceWithBlank()}
              </h3>
              <div className="space-y-4">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                  className="w-full max-w-md mx-auto"
                >
                  <input
                    ref={inputRef}
                    value={userInput}
                    onChange={e => !feedback && setUserInput(e.target.value)}
                    placeholder="Nhập đáp án..."
                    className={`w-full py-6 px-10 rounded-full border-2 outline-none text-center text-xl font-bold transition-all shadow-xl ${
                      feedback === 'correct' ? 'border-emerald-500' : 
                      feedback === 'incorrect' ? 'border-red-500' : 'border-black/5 focus:border-black'
                    }`}
                  />
                </form>
                {feedback === 'incorrect' && (
                  <p className="text-red-500 font-black text-xs uppercase animate-bounce">Sai rồi! Đáp án là: {currentItem.answer}</p>
                )}
              </div>
            </div>
          ),
          listening: (
            <div className="text-center space-y-12">
              {!currentItem.sentence ? (
                <div className="py-20 italic text-slate-400">Không có dữ liệu ví dụ cho Unit này.</div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-6">
                    <button
                      onClick={() => playAudio(currentItem.sentence)}
                      className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl group"
                    >
                      <Volume2 className="w-10 h-10 group-hover:animate-pulse" />
                    </button>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Phím Space để nghe lại</p>
                  </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-full px-4 py-1.5 inline-block mx-auto mb-2 shadow-sm">
                  Gợi ý: {currentItem.isMainQuiz ? currentItem.quiz?.hint : currentItem.meaning}
                </p>
                <p className="text-slate-400 italic">"{currentItem.translation}"</p>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold italic leading-relaxed">
                {renderSentenceWithBlank()}
              </h3>
            
            <div className="space-y-4 w-full">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                className="w-full max-w-md mx-auto"
              >
                <input
                  ref={inputRef}
                  value={userInput}
                  onChange={e => !feedback && setUserInput(e.target.value)}
                  placeholder="Nghe và điền ngữ pháp..."
                  className={`w-full py-6 px-10 rounded-full border-2 outline-none text-center text-xl font-bold transition-all shadow-xl ${
                    feedback === 'correct' ? 'border-emerald-500' : 
                    feedback === 'incorrect' ? 'border-red-500' : 'border-black/5 focus:border-black'
                  }`}
                />
              </form>
              {feedback === 'incorrect' && (
                <div className="text-center">
                  <p className="text-red-500 font-black text-xs uppercase animate-bounce mt-4">Sai rồi! Đáp án là: {currentItem.answer}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    ),
    multiple_choice: (
      <div className="text-center space-y-12 w-full max-w-2xl mx-auto">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-full px-4 py-1.5 inline-block mx-auto mb-2 shadow-sm">
            Gợi ý: {currentItem.isMainQuiz ? currentItem.quiz?.hint : currentItem.meaning}
          </p>
          <p className="text-slate-400 italic">"{currentItem.translation}"</p>
        </div>
        <h3 className="text-3xl md:text-4xl font-bold italic leading-relaxed">
          {renderSentenceWithBlank()}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-lg mx-auto">
          {multipleChoiceOptions.map((opt, i) => {
            let btnState = "bg-white border-2 border-slate-100 hover:border-black text-slate-700 hover:shadow-md";
            if (feedback) {
              if (opt === currentItem.answer) {
                 btnState = "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-inner";
              } else if (userInput === opt) {
                 btnState = "bg-red-50 border-red-500 text-red-700 shadow-inner";
              } else {
                 btnState = "bg-slate-50 border-slate-100 text-slate-300 opacity-50";
              }
            } else if (userInput === opt) {
               btnState = "bg-black border-black text-white";
            }

            return (
              <button
                key={i}
                disabled={!!feedback}
                onClick={() => {
                  setUserInput(opt);
                  const isCorrect = opt === currentItem.answer;
                  setFeedback(isCorrect ? 'correct' : 'incorrect');
                  if (isCorrect) {
                    setScore(s => s + 1);
                    if (!completedIds.includes(currentItem.id)) {
                      setCompletedIds(p => [...p, currentItem.id]);
                    }
                  }
                }}
                className={`py-5 px-6 rounded-2xl font-bold text-lg md:text-xl transition-all text-center focus:outline-none ${btnState}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    )
  }[activeMode]}
</div>

      <div className="flex gap-4 py-10 w-full max-w-3xl mx-auto">
        <button
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
              setFeedback(null);
              setUserInput('');
              setIsFlipped(false);
              setShowHint(false);
            }
          }}
          disabled={currentIndex === 0}
          className="flex-1 py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 disabled:opacity-30 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> TRƯỚC
        </button>
        <button
          onClick={handleSubmit}
          disabled={activeMode === 'multiple_choice' && !feedback}
          className="flex-1 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
        >
          {['quiz', 'listening'].includes(activeMode) && !feedback ? (
            <>KIỂM TRA <Check className="w-4 h-4" /></>
          ) : activeMode === 'multiple_choice' && !feedback ? (
            <>CHỌN ĐÁP ÁN BÊN TRÊN</>
          ) : (
            <>{currentIndex === studyData.length - 1 ? 'HOÀN THÀNH' : 'TIẾP THEO'} <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );

  const mainContent = {
    menu: MenuScreen,
    list: ListScreen,
    flashcard: StudyScreen,
    cards: StudyScreen,
    quiz: StudyScreen,
    multiple_choice: StudyScreen,
    listening: StudyScreen
  }[activeMode];

  return (
    <div 
      ref={containerRef}
      tabIndex="0"
      className="min-h-screen w-full bg-white flex flex-col items-center pt-32 px-4 md:px-12 selection:bg-black selection:text-white outline-none focus:outline-none"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-6xl mb-12 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Mimikara Oboeru • N3</p>
          <h1 className="text-5xl font-black tracking-tighter italic">Mimikara</h1>
        </div>
        <button
          onClick={() => {
            if (activeMode === 'menu') {
              navigate('/grammar');
            } else if (prevMode) {
              setActiveMode(prevMode);
              setPrevMode(null);
            } else {
              switchMode('menu');
            }
          }}
          className="px-8 py-3 border-2 border-black text-xs font-black uppercase hover:bg-black hover:text-white transition-all"
        >
          {activeMode === 'menu' ? 'Thoát' : 'Quay lại'}
        </button>
      </div>

      <div className="w-full max-w-6xl flex-grow flex flex-col">
        {mainContent}
      </div>

      {showResults && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-10 text-center shadow-2xl">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto absolute -top-8 left-1/2 -translate-x-1/2 rotate-3 border-4 border-white">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="mt-8 space-y-6">
              <h2 className="text-3xl font-black italic uppercase">Hoàn thành!</h2>
              <div className="py-6 border-y border-slate-50">
                <div className="text-7xl font-black italic">{score} <span className="text-2xl text-slate-200">/ {studyData.length}</span></div>
              </div>
              <p className="text-slate-500 italic text-sm">{getScoreMessage(score, studyData.length)}</p>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => switchMode('quiz')} className="py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px]">Thử lại</button>
                <button onClick={() => switchMode('menu')} className="py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px]">Menu</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.4s ease-out forwards; }
        .perspective { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
}

