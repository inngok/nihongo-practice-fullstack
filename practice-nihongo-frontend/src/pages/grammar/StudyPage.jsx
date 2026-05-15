import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Brain, CheckCircle, Layers, List, Search,
  ChevronRight, ChevronLeft, Check, RotateCcw,
  HelpCircle, MoreHorizontal, ArrowLeft, Headphones, Volume2, Target
} from 'lucide-react';

import grammarService from '../../api/grammarService';
import vocabService from '../../api/vocabService';


export default function StudyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('bookId');

  // Detect context: vocabulary or grammar based on URL
  const isVocabMode = location.pathname.startsWith('/vocabulary');

  // ... rest of state (unchanged)
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
  const [grammarData, setGrammarData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from the correct API based on context
  useEffect(() => {
    setLoading(true);
    const fetchData = isVocabMode
      ? vocabService.getAll({ bookId })
      : grammarService.getAll();

    fetchData
      .then(res => {
        let data = res.data;
        // Filter by Book ID if provided
        if (bookId) {
          data = data.filter(item => item.book && String(item.book.id) === String(bookId));
        }

        const mapped = isVocabMode
          ? data.map(item => ({
              ...item,
              pattern: item.word,
              meaning: item.meaning,
              explanation: item.reading ? `Đọc: ${item.reading}` : '',
              unit: (item.week !== undefined && item.week !== null) ? parseInt(item.week) : 1,
              examples: [{ jp: item.example, vn: item.exampleMeaning }],
              quiz: {
                sentence: item.example,
                translation: item.exampleMeaning,
                answer: item.word
              }
            }))
          : data.map(item => ({
              ...item,
              pattern: item.structure,
              unit: (item.week !== undefined && item.week !== null) ? parseInt(item.week) : 1,
              examples: [{ jp: item.exampleSentence, vn: item.exampleMeaning }],
              quiz: { 
                sentence: item.exampleSentence, 
                translation: item.exampleMeaning, 
                answer: item.structure 
              }
            }));
        setGrammarData(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookId, isVocabMode]);

  useEffect(() => {
    localStorage.setItem('mimikara_completed', JSON.stringify(completedIds));
  }, [completedIds]);

  // Compute available units dynamically based on current data
  const uniqueUnits = useMemo(() => {
    const units = Array.from(new Set(grammarData.map(item => item.unit).filter(u => u !== undefined && u !== null)));
    const sorted = units.sort((a, b) => a - b);
    return sorted.length > 0 ? sorted : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }, [grammarData]);

  // Reset selection if the previously selected unit does not exist in the new book
  useEffect(() => {
    if (selectedUnit !== 'all' && !uniqueUnits.includes(selectedUnit)) {
      setSelectedUnit('all');
    }
  }, [uniqueUnits, selectedUnit]);

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
  }, [selectedUnit, grammarData]);

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
        {uniqueUnits.map(num => (
          <button
            key={num}
            onClick={() => setSelectedUnit(num)}
            className={`px-6 py-4 border transition-all text-xs font-black ${
              selectedUnit === num 
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' 
                : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            U{num < 10 ? `0${num}` : num}
          </button>
        ))}
        <button
          onClick={() => setSelectedUnit('all')}
          className={`px-6 py-4 border transition-all text-xs font-black ${
            selectedUnit === 'all' 
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' 
              : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
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
            className="flex-1 min-w-[120px] py-5 border border-black dark:border-slate-700 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:text-slate-300 dark:hover:bg-white dark:hover:text-black transition-all flex flex-col items-center gap-2"
          >
            <m.icon className="w-5 h-5" /> {m.label}
          </button>
        ))}
      </div>
    </div>
  ), [selectedUnit, switchMode, uniqueUnits]);

  const ListScreen = useMemo(() => (
    <div className="flex flex-col gap-8 animate-in">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border-b-2 border-slate-100 dark:border-slate-800 bg-transparent focus:border-black dark:focus:border-white outline-none font-medium text-slate-900 dark:text-white"
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
              className="p-8 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] hover:border-black dark:hover:border-white transition-all cursor-pointer group bg-white dark:bg-slate-900/50"
            >
              <div className="flex justify-between mb-4">
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600">U{item.unit} • #{item.id}</span>
                {completedIds.includes(item.id) && <Check className="w-4 h-4 text-emerald-500" />}
              </div>
              <h3 className="text-2xl font-semibold italic mb-2 font-kanji text-slate-900 dark:text-white">{item.pattern}</h3>
              {item.romaji && <p className="text-[10px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-2">{item.romaji}</p>}
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm italic">{item.meaning}</p>
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
          <span className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-[10px] font-black rounded-full">UNIT {currentItem.unit}</span>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500"># {currentItem.id}</span>
        </div>
        <div className="flex-grow flex justify-center md:justify-end items-center gap-6 w-full md:w-auto">
          <span className="text-[10px] font-black text-slate-300 dark:text-slate-600">TIẾN TRÌNH: {currentIndex + 1} / {studyData.length}</span>
          <div className="h-1 bg-slate-100 dark:bg-slate-800 w-32 md:w-64 rounded-full overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white transition-all duration-500"
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
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center">
                  <h2 className="text-2xl md:text-4xl font-semibold italic whitespace-normal md:whitespace-nowrap font-kanji text-slate-900 dark:text-white">{currentItem.pattern}</h2>
                  <p className="mt-4 text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest italic decoration-slate-100 underline underline-offset-8">NHẤN ĐỂ LẬT</p>
                </div>
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-[3rem] flex flex-col items-center p-8 md:p-12 text-center overflow-hidden">
                   <div className="w-full flex-grow flex flex-col items-center justify-center overflow-y-auto no-scrollbar space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xl md:text-2xl font-black italic leading-tight text-slate-900 dark:text-white">{currentItem.meaning}</h3>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 italic font-medium px-4">{currentItem.explanation}</p>
                      </div>
                      
                      {currentItem.examples && currentItem.examples.length > 0 && (
                        <div className="w-full space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                           {currentItem.examples.map((ex, idx) => (
                             <div key={idx} className="text-left">
                               <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-snug">{ex.jp}</p>
                               <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">{ex.vn}</p>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                   
                   <div className="mt-6 pt-4 border-t border-slate-55 dark:border-slate-800 w-full flex flex-col items-center gap-2">
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">PATTERN: {currentItem.pattern}</p>
                     <div className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full text-[9px] font-black uppercase tracking-tighter shadow-lg">LẬT LẠI</div>
                   </div>
                </div>
              </div>
            </div>
          ),
          flashcard: (
            <div className="max-w-4xl mx-auto w-full space-y-8">
              <div 
                onClick={() => setIsFlipped(prev => !prev)}
                className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-[2.5rem] p-12 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all active:scale-[0.99] group relative overflow-hidden min-h-[300px] flex flex-col justify-center"
              >
                {!isFlipped ? (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <h2 className="text-3xl md:text-5xl font-semibold italic mb-6 whitespace-normal md:whitespace-nowrap font-kanji text-slate-900 dark:text-white">{currentItem.pattern}</h2>
                    <p className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.2em] animate-pulse">Nhấn để xem nghĩa / Space to flip</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <h2 className="text-xl font-semibold italic text-slate-300 dark:text-slate-500 mb-2 uppercase tracking-widest font-kanji">{currentItem.pattern}</h2>
                    <div className="h-px w-20 bg-slate-100 dark:bg-slate-800 mx-auto mb-6" />
                    <h3 className="text-3xl font-black italic text-slate-900 dark:text-white mb-4">{currentItem.meaning}</h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 italic mb-2 px-6">{currentItem.explanation}</p>
                    <p className="text-[10px] font-black text-slate-200 dark:text-slate-600 uppercase tracking-widest mt-6">Nhấn để ẩn / Space to flip back</p>
                  </div>
                )}
              </div>
              {isFlipped && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-2 px-2">Ví dụ</p>
                    {currentItem.examples?.map((ex, idx) => (
                      <div key={idx} className={`relative p-4 rounded-[1.5rem] italic ${ex.isBook ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-900 dark:text-slate-100'}`}>
                        <p className="font-bold text-sm mb-1">{ex.jp}</p>
                        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{ex.vn}</p>
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
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-full px-4 py-1.5 inline-block mx-auto mb-2 shadow-sm">
                  Gợi ý: {currentItem.isMainQuiz ? currentItem.quiz?.hint : currentItem.meaning}
                </p>
                <p className="text-slate-400 dark:text-slate-500 italic">"{currentItem.translation}"</p>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold italic leading-relaxed text-slate-900 dark:text-white">
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
                    className={`w-full py-6 px-10 rounded-full border-2 outline-none text-center text-xl font-bold transition-all shadow-xl bg-transparent ${
                      feedback === 'correct' ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/50' : 
                      feedback === 'incorrect' ? 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500' : 'border-black/5 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white'
                    }`}
                  />
                </form>
                {feedback === 'incorrect' && (
                  <p className="text-slate-500 dark:text-slate-400 font-black text-xs uppercase animate-bounce">Sai rồi! Đáp án là: {currentItem.answer}</p>
                )}
              </div>
            </div>
          ),
          listening: (
            <div className="text-center space-y-12">
              {!currentItem.sentence ? (
                <div className="py-20 italic text-slate-400 dark:text-slate-600">Không có dữ liệu ví dụ cho Unit này.</div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-6">
                    <button
                      onClick={() => playAudio(currentItem.sentence)}
                      className="w-24 h-24 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl group"
                    >
                      <Volume2 className="w-10 h-10 group-hover:animate-pulse" />
                    </button>
                    <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Phím Space để nghe lại</p>
                  </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-full px-4 py-1.5 inline-block mx-auto mb-2 shadow-sm">
                  Gợi ý: {currentItem.isMainQuiz ? currentItem.quiz?.hint : currentItem.meaning}
                </p>
                <p className="text-slate-400 dark:text-slate-500 italic">"{currentItem.translation}"</p>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold italic leading-relaxed text-slate-900 dark:text-white">
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
                  className={`w-full py-6 px-10 rounded-full border-2 outline-none text-center text-xl font-bold transition-all shadow-xl bg-transparent ${
                    feedback === 'correct' ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/50' : 
                    feedback === 'incorrect' ? 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500' : 'border-black/5 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white'
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
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-full px-4 py-1.5 inline-block mx-auto mb-2 shadow-sm">
            Gợi ý: {currentItem.isMainQuiz ? currentItem.quiz?.hint : currentItem.meaning}
          </p>
          <p className="text-slate-400 dark:text-slate-500 italic">"{currentItem.translation}"</p>
        </div>
        <h3 className="text-3xl md:text-4xl font-bold italic leading-relaxed text-slate-900 dark:text-white">
          {renderSentenceWithBlank()}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-lg mx-auto">
          {multipleChoiceOptions.map((opt, i) => {
            let btnState = "bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-black dark:hover:border-white text-slate-700 dark:text-slate-300 hover:shadow-md";
            if (feedback) {
              if (opt === currentItem.answer) {
                 btnState = "bg-slate-900 text-white dark:bg-white dark:text-black border-slate-900 dark:border-white shadow-inner scale-[0.98]";
              } else if (userInput === opt) {
                 btnState = "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-70";
              } else {
                 btnState = "bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700 opacity-30";
              }
            } else if (userInput === opt) {
               btnState = "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black";
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
          className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 disabled:opacity-30 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> TRƯỚC
        </button>
        <button
          onClick={handleSubmit}
          disabled={activeMode === 'multiple_choice' && !feedback}
          className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:shadow-none"
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
      className="min-h-screen w-full bg-white dark:bg-transparent flex flex-col items-center pt-32 px-4 md:px-12 selection:bg-black selection:text-white outline-none focus:outline-none"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-6xl mb-12 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-2">
            {grammarData[0]?.book?.levelLabel || (isVocabMode ? 'TỪ VỰNG' : 'TRÌNH ĐỘ N3')}
          </p>
          <h1 className="text-5xl font-black tracking-tighter italic dark:text-white">
            {grammarData[0]?.book?.title || (isVocabMode ? 'Từ vựng' : 'Ngữ pháp')}
          </h1>
        </div>
        <button
          onClick={() => {
            if (activeMode === 'menu') {
              navigate(isVocabMode ? '/vocabulary' : '/grammar');
            } else if (prevMode) {
              setActiveMode(prevMode);
              setPrevMode(null);
            } else {
              switchMode('menu');
            }
          }}
          className="group flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-black uppercase tracking-widest transition-all bg-transparent border-none p-0 outline-none focus:outline-none"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> {activeMode === 'menu' ? 'THOÁT' : 'QUAY LẠI'}
        </button>
      </div>

      <div className="w-full max-w-6xl flex-grow flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
            <div className="w-12 h-12 border-4 border-slate-100 dark:border-slate-800 border-t-black dark:border-t-white rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Đang đồng bộ dữ liệu...</p>
          </div>
        ) : (
          mainContent
        )}
      </div>

      {showResults && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 text-center shadow-2xl">
            <div className="w-16 h-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mx-auto absolute -top-8 left-1/2 -translate-x-1/2 rotate-3 border-4 border-white dark:border-slate-900 shadow-xl">
              <Brain className="w-8 h-8 text-white dark:text-black" />
            </div>
            <div className="mt-8 space-y-6">
              <h2 className="text-3xl font-black italic uppercase text-slate-900 dark:text-white">Hoàn thành!</h2>
              <div className="py-6 border-y border-slate-50 dark:border-slate-800">
                <div className="text-7xl font-black italic text-slate-900 dark:text-white">
                  {score} <span className="text-2xl text-slate-200 dark:text-slate-700">/ {studyData.length}</span>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 italic text-sm">{getScoreMessage(score, studyData.length)}</p>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => switchMode('quiz')} className="py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all">Thử lại</button>
                <button onClick={() => switchMode('menu')} className="py-4 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-400 rounded-2xl font-black uppercase text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all">Menu</button>
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

