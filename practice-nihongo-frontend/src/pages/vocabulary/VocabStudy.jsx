import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Check, X, Cpu, Loader2, Bot, ChevronRight, ChevronLeft } from 'lucide-react';
import vocabService from '../../api/vocabService';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function VocabStudy() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('bookId');
  const { fetchWithAuth, currentUser } = useAuth();

  const [vocabData, setVocabData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState('list');
  const [selectedUnit, setSelectedUnit] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [completedIds, setCompletedIds] = useState([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [studyData, setStudyData] = useState([]);

  // Swipe Card States
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [flashcardSubMode, setFlashcardSubMode] = useState('classic'); // 'classic' | 'memorize'

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';

  // Keyboard navigation for Flashcards
  useEffect(() => {
    if (activeMode !== 'flashcard' || studyData.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (flashcardSubMode === 'memorize') {
          handleSwipe('left');
        } else {
          if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
          }
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (flashcardSubMode === 'memorize') {
          handleSwipe('right');
        } else {
          if (currentIndex < studyData.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, flashcardSubMode, currentIndex, studyData, isFlipped]);

  const addToLocalReview = (vocabItem) => {
    try {
      const stored = localStorage.getItem('vocab_review_failed')
        ? JSON.parse(localStorage.getItem('vocab_review_failed'))
        : [];
      if (!stored.some(i => i.id === vocabItem.id)) {
        stored.push({
          ...vocabItem,
          reviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
        localStorage.setItem('vocab_review_failed', JSON.stringify(stored));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (bookId) {
      fetchVocab();
    }
  }, [bookId]);

  const fetchVocab = async () => {
    try {
      setLoading(true);
      const response = await vocabService.getAll({ bookId });
      const data = response.data || [];
      setVocabData(data);

      if (data.length > 0) {
        const units = [...new Set(data.map(i => {
          const val = i.week ?? i.unit ?? i.lesson ?? 1;
          return parseInt(val);
        }))].sort((a, b) => a - b);
        setSelectedUnit(units[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vocab:', error);
      setVocabData([]);
      setLoading(false);
    }
  };

  const uniqueUnits = useMemo(() => {
    if (!Array.isArray(vocabData)) return [];
    return [...new Set(vocabData.map(i => {
      const val = i.week ?? i.unit ?? i.lesson ?? 1;
      return parseInt(val);
    }))].sort((a, b) => a - b);
  }, [vocabData]);

  const activeData = useMemo(() => {
    if (!Array.isArray(vocabData)) return [];
    let data = vocabData.filter(i => {
      const val = i.week ?? i.unit ?? i.lesson ?? 1;
      return parseInt(val) === parseInt(selectedUnit);
    });
    if (isShuffle) return [...data].sort(() => Math.random() - 0.5);
    return data;
  }, [vocabData, selectedUnit, isShuffle]);

  useEffect(() => {
    if (activeMode !== 'list') {
      setStudyData(activeData);
      setFeedback(null);
      setUserInput('');
      setIsFlipped(false);
    }
  }, [activeData, activeMode]);


  // Sync Progress to Backend
  const progressKey = `vocab_${bookId}_${selectedUnit}`;

  useEffect(() => {
    if (currentUser && activeData.length > 0 && bookId) {
      fetchWithAuth(`${API_BASE_URL}/progress/${progressKey}`)
        .then(res => res.json())
        .then(resData => {
          if (resData.data) {
            try {
              const state = JSON.parse(resData.data);
              if (state.currentIndex !== undefined && state.currentIndex < activeData.length) {
                setCurrentIndex(state.currentIndex);
              }
            } catch (e) { }
          }
        }).catch(() => { });
    }
  }, [bookId, selectedUnit, activeData.length, currentUser]);

  useEffect(() => {
    if (currentUser && bookId && activeMode !== 'list') {
      const state = { currentIndex, activeMode };
      fetchWithAuth(`${API_BASE_URL}/progress/${progressKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: JSON.stringify(state) })
      }).catch(() => { });
    }
  }, [currentIndex, activeMode, bookId, selectedUnit, currentUser]);

  useEffect(() => {
    if (studyData.length > 0 && currentIndex >= studyData.length) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [studyData.length, currentIndex]);

  const handleSubmit = () => {
    if (feedback || activeMode === 'flashcard') {
      if (currentIndex < studyData.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setFeedback(null);
        setUserInput('');
        setIsFlipped(false);
      } else {
        setShowResults(true);
      }
      return;
    }

    const currentItem = studyData[currentIndex];
    const isCorrect = userInput.trim().toLowerCase() === currentItem.word.toLowerCase() ||
      userInput.trim() === currentItem.reading ||
      userInput.trim() === currentItem.meaning;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback('correct');
      if (!completedIds.includes(currentItem.id)) {
        setCompletedIds(prev => [...prev, currentItem.id]);
      }
    } else {
      setFeedback('incorrect');
    }
  };

  const handleSwipe = (direction) => {
    if (!studyData[currentIndex]) return;
    const currentItem = studyData[currentIndex];

    if (direction === 'right') {
      setScore(prev => prev + 1);
      if (!completedIds.includes(currentItem.id)) {
        setCompletedIds(prev => [...prev, currentItem.id]);
      }
    } else if (direction === 'left') {
      addToLocalReview(currentItem);
    }

    setDragOffsetX(direction === 'right' ? 500 : -500);
    setTimeout(() => {
      if (currentIndex < studyData.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setDragOffsetX(0);
        setSwipeDirection(null);
        setIsFlipped(false);
      } else {
        setShowResults(true);
      }
    }, 200);
  };

  const handleResetProgress = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore(0);
    setFeedback(null);
    setUserInput('');
    setCompletedIds([]);
  };


  const handleTouchStart = (e) => {
    if (activeMode !== 'flashcard') return;
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setDragOffsetX(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || activeMode !== 'flashcard') return;
    const clientX = e.touches[0].clientX;
    const deltaX = clientX - dragStartX;
    setDragOffsetX(deltaX);
    if (deltaX > 40) setSwipeDirection('right');
    else if (deltaX < -40) setSwipeDirection('left');
    else setSwipeDirection(null);
  };

  const handleTouchEnd = () => {
    if (!isDragging || activeMode !== 'flashcard') return;
    setIsDragging(false);

    if (dragOffsetX > 120) {
      handleSwipe('right');
    } else if (dragOffsetX < -120) {
      handleSwipe('left');
    } else {
      if (Math.abs(dragOffsetX) < 20) {
        setIsFlipped(prev => !prev);
      }
      setDragOffsetX(0);
      setSwipeDirection(null);
    }
  };

  const handleMouseDown = (e) => {
    if (activeMode !== 'flashcard') return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragOffsetX(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || activeMode !== 'flashcard') return;
    const deltaX = e.clientX - dragStartX;
    setDragOffsetX(deltaX);
    if (deltaX > 40) setSwipeDirection('right');
    else if (deltaX < -40) setSwipeDirection('left');
    else setSwipeDirection(null);
  };

  const handleMouseUp = () => {
    if (!isDragging || activeMode !== 'flashcard') return;
    setIsDragging(false);

    if (dragOffsetX > 120) {
      handleSwipe('right');
    } else if (dragOffsetX < -120) {
      handleSwipe('left');
    } else {
      if (Math.abs(dragOffsetX) < 20) {
        setIsFlipped(prev => !prev);
      }
      setDragOffsetX(0);
      setSwipeDirection(null);
    }
  };

  const ListScreen = (
    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
      <div className="relative group max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 w-5 h-5 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
        <input
          type="text"
          placeholder="Tìm kiếm từ vựng..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border-b-2 border-slate-100 dark:border-slate-800 bg-transparent focus:border-black dark:focus:border-white outline-none font-medium text-slate-900 dark:text-white transition-colors"
        />
      </div>

      <div className="flex flex-col bg-white dark:bg-slate-950/50 rounded-[2rem] overflow-hidden border border-slate-50 dark:border-slate-900 shadow-sm">
        {activeData
          .filter(i => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return true;
            return i.word.toLowerCase().includes(term) ||
              i.meaning.toLowerCase().includes(term) ||
              (i.reading && i.reading.toLowerCase().includes(term));
          })
          .map((item, idx) => (
            <div
              key={item.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-7 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all border-b border-slate-50 dark:border-slate-900 last:border-none gap-4"
            >
              <div className="flex items-center gap-4 md:gap-10">
                <span className="text-[11px] font-black text-slate-200 dark:text-slate-800 w-6 shrink-0">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                  <h3 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white font-kanji group-hover:translate-x-1 transition-transform tracking-tight whitespace-nowrap">
                    {item.word}
                  </h3>
                  <span className="text-xs md:text-sm font-normal text-slate-400 dark:text-slate-500 tracking-wider whitespace-nowrap">
                    {item.reading}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-10 sm:pl-0">
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] md:text-[11px] font-medium rounded-full uppercase tracking-wider group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                  {item.meaning}
                </div>
                {completedIds.includes(item.id) && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const rotateDeg = dragOffsetX * 0.04;
  const cardStyle = {
    transform: `translateX(${dragOffsetX}px) rotate(${rotateDeg}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`,
    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  };

  const StudyScreen = (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
      {/* Mode Indicator Bar */}
      {activeMode === 'flashcard' && (
        <div className="flex justify-between items-center px-4 flex-wrap gap-4">
          <div className="bg-slate-50/80 dark:bg-slate-900/60 p-1 rounded-2xl flex border border-slate-100 dark:border-slate-800 shadow-inner">
            <button
              onClick={() => { setFlashcardSubMode('classic'); setIsFlipped(false); }}
              className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${flashcardSubMode === 'classic'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              CỔ ĐIỂN
            </button>
            <button
              onClick={() => { setFlashcardSubMode('memorize'); setIsFlipped(false); }}
              className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${flashcardSubMode === 'memorize'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              GHI NHỚ (QUẸT THẺ)
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              Tiến trình: {currentIndex + 1} / {studyData.length}
            </span>
            <div className="h-1 bg-slate-100 dark:bg-slate-800 w-24 rounded-full overflow-hidden">
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
      )}

      {activeMode !== 'flashcard' && (
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
      )}

      {activeMode === 'flashcard' ? (
        flashcardSubMode === 'memorize' ? (
          /* MEMORIZE (SWIPE CARD) MODE */
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="perspective h-[380px] sm:h-[450px] cursor-grab active:cursor-grabbing select-none relative"
            style={{ touchAction: 'none' }}
          >
            <div
              key={currentIndex}
              style={cardStyle}
              className={`relative w-full h-full duration-700 preserve-3d shadow-2xl rounded-[3rem] transition-shadow ${swipeDirection === 'right' ? 'shadow-emerald-200/50 dark:shadow-emerald-950/20' :
                swipeDirection === 'left' ? 'shadow-rose-200/50 dark:shadow-rose-950/20' : ''
                } ${isFlipped ? 'rotate-y-180' : ''}`}
            >
              {/* Front Face */}
              <div className={`absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 rounded-[3rem] flex flex-col items-center justify-center p-6 sm:p-12 text-center transition-colors duration-300 ${swipeDirection === 'right' ? 'border-emerald-500 bg-emerald-50/5' :
                swipeDirection === 'left' ? 'border-rose-500 bg-rose-50/5' :
                  'border-slate-100 dark:border-slate-800'
                }`}>
                {/* Swipe Status Badges */}
                {swipeDirection === 'right' && (
                  <div className="absolute top-8 right-8 border-4 border-emerald-500 text-emerald-500 text-xs font-black uppercase px-4 py-1.5 rounded-xl tracking-widest rotate-12 scale-110 animate-in fade-in duration-200">
                    ĐÃ NHỚ
                  </div>
                )}
                {swipeDirection === 'left' && (
                  <div className="absolute top-8 left-8 border-4 border-rose-500 text-rose-500 text-xs font-black uppercase px-4 py-1.5 rounded-xl tracking-widest -rotate-12 scale-110 animate-in fade-in duration-200">
                    CHƯA THUỘC
                  </div>
                )}

                <h2 className="text-4xl sm:text-5xl md:text-7xl font-medium text-slate-900 dark:text-white font-kanji mb-6 sm:mb-8 select-all break-all whitespace-pre-wrap leading-tight">
                  {studyData[currentIndex]?.word}
                </h2>
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em]">NHẤN ĐỂ LẬT HOẶC QUẸT</p>

                <div className="flex gap-4 sm:gap-16 mt-8 sm:mt-12 text-slate-300 dark:text-slate-700 flex-wrap justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[10px] font-black">←</span>
                    <span className="text-[9px] font-black tracking-widest">TRÁI: CHƯA THUỘC</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black tracking-widest">PHẢI: ĐÃ NHỚ</span>
                    <span className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[10px] font-black">→</span>
                  </div>
                </div>
              </div>

              {/* Back Face */}
              <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-slate-900 border-2 rounded-[3rem] flex flex-col items-center justify-center p-6 sm:p-12 text-center transition-colors duration-300 ${swipeDirection === 'right' ? 'border-emerald-500 bg-emerald-50/5' :
                swipeDirection === 'left' ? 'border-rose-500 bg-rose-50/5' :
                  'border-slate-100 dark:border-slate-800'
                }`}>
                <span className="text-[10px] font-normal text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-4">{studyData[currentIndex]?.word}</span>
                <div className="h-px w-12 bg-slate-100 dark:bg-slate-800 mb-8" />
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-medium italic text-slate-900 dark:text-white mb-4">{studyData[currentIndex]?.meaning}</h3>
                <p className="text-sm sm:text-base md:text-lg font-normal text-slate-400 dark:text-slate-500 italic uppercase">{studyData[currentIndex]?.reading}</p>
              </div>
            </div>
          </div>
        ) : (
          /* CLASSIC FLASHCARD MODE */
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="perspective h-[380px] sm:h-[450px] cursor-pointer group"
          >
            <div key={currentIndex} className={`relative w-full h-full transition-all duration-700 preserve-3d shadow-2xl rounded-[3rem] ${isFlipped ? 'rotate-y-180' : 'hover:scale-[1.01]'}`}>
              {/* Front Face */}
              <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-6 sm:p-12 text-center">
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-medium text-slate-900 dark:text-white font-kanji mb-6 sm:mb-8 select-all break-all whitespace-pre-wrap leading-tight">
                  {studyData[currentIndex]?.word}
                </h2>
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em] animate-pulse">NHẤN ĐỂ LẬT THẺ</p>
              </div>

              {/* Back Face */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-6 sm:p-12 text-center">
                <span className="text-[10px] font-normal text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-4">{studyData[currentIndex]?.word}</span>
                <div className="h-px w-12 bg-slate-100 dark:bg-slate-800 mb-8" />
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-medium italic text-slate-900 dark:text-white mb-4">{studyData[currentIndex]?.meaning}</h3>
                <p className="text-sm sm:text-base md:text-lg font-normal text-slate-400 dark:text-slate-500 italic uppercase">{studyData[currentIndex]?.reading}</p>
              </div>
            </div>
          </div>
        )
      ) : activeMode === 'quiz' ? (
        /* QUIZ MODE */
        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-6 sm:p-16 text-center space-y-6 sm:space-y-12 shadow-sm">
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Dịch sang tiếng Nhật</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black italic text-slate-900 dark:text-white select-all break-all whitespace-pre-wrap leading-tight">"{studyData[currentIndex]?.meaning}"</h2>
          </div>

          <input
            autoFocus
            value={userInput}
            onChange={e => !feedback && setUserInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Nhập từ vựng..."
            className={`w-full max-w-md mx-auto py-3 sm:py-6 px-6 sm:px-10 rounded-full border-2 text-center text-lg sm:text-2xl font-bold transition-all ${feedback === 'correct' ? 'border-emerald-500 text-emerald-500 bg-emerald-50/50' :
              feedback === 'incorrect' ? 'border-rose-500 text-rose-500 bg-rose-50/50' :
                'border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white bg-transparent'
              }`}
          />

          {feedback === 'incorrect' && (
            <p className="text-rose-500 font-bold animate-bounce">Đáp án: {studyData[currentIndex]?.word}</p>
          )}
        </div>
      ) : null}

      {activeMode === 'flashcard' ? (
        flashcardSubMode === 'memorize' ? (
          <div className="flex justify-center gap-6 mt-8">
            <button
              onClick={() => handleSwipe('left')}
              className="w-16 h-16 rounded-full border border-rose-100 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-500 hover:text-white text-rose-500 flex items-center justify-center transition-all duration-300 shadow-md active:scale-95 shrink-0"
              title="Chưa thuộc (Quẹt trái / Phím mũi tên ←)"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex-1 max-w-xs py-5 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-black dark:hover:border-white transition-all text-center"
              title="Lật thẻ (Phím mũi tên ↓)"
            >
              LẬT THẺ
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className="w-16 h-16 rounded-full border border-emerald-100 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-500 hover:text-white text-emerald-500 flex items-center justify-center transition-all duration-300 shadow-md active:scale-95 shrink-0"
              title="Đã nhớ (Quẹt phải / Phím mũi tên →)"
            >
              <Check className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={() => { if (currentIndex > 0) { setCurrentIndex(prev => prev - 1); setIsFlipped(false); } }}
              disabled={currentIndex === 0}
              className="flex-1 py-5 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-black dark:hover:border-white transition-all disabled:opacity-20"
              title="Quay lại (Phím mũi tên ←)"
            >
              QUAY LẠI
            </button>
            <button
              onClick={() => {
                if (currentIndex < studyData.length - 1) {
                  setCurrentIndex(prev => prev + 1);
                  setIsFlipped(false);
                } else {
                  setShowResults(true);
                }
              }}
              className="flex-[2] py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase shadow-2xl hover:scale-[1.02] transition-all"
              title="Tiếp theo (Phím mũi tên →)"
            >
              {currentIndex === studyData.length - 1 ? 'KẾT THÚC' : 'TIẾP THEO'}
            </button>
          </div>
        )
      ) : activeMode === 'quiz' ? (
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => { if (currentIndex > 0) { setCurrentIndex(prev => prev - 1); setFeedback(null); setUserInput(''); } }}
            disabled={currentIndex === 0}
            className="flex-1 py-5 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-black dark:hover:border-white transition-all disabled:opacity-20"
          >
            QUAY LẠI
          </button>
          <button
            onClick={handleSubmit}
            className="flex-[2] py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase shadow-2xl hover:scale-[1.02] transition-all"
          >
            {feedback ? (currentIndex === studyData.length - 1 ? 'KẾT THÚC' : 'TIẾP THEO') : 'KIỂM TRA'}
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-4 sm:px-6 md:px-20 pt-32 pb-10 transition-colors">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Bar */}
        <button
          onClick={() => navigate('/vocabulary')}
          className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 md:mb-8"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          QUAY LẠI
        </button>

        {loading ? (
          <div className="flex justify-center py-40">
            <div className="w-10 h-10 border-[3px] border-slate-50 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-black dark:bg-white rounded-full" />
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                TỪ VỰNG - BÀI {selectedUnit}
              </h1>
              <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 mt-0.5 uppercase tracking-widest">
                {vocabData[0]?.book?.title || ''}
              </p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-t border-slate-50 dark:border-slate-900 pt-10">
              <div className="space-y-4 w-full md:w-auto">
                <div className="flex justify-between items-center w-full">
                  <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">CHỌN BÀI HỌC</p>
                  <div className="flex items-center gap-3 md:hidden">
                    <span className="text-[9px] font-black text-slate-300">XÁO TRỘN</span>
                    <button onClick={() => setIsShuffle(!isShuffle)} className={`w-8 h-4 rounded-full ${isShuffle ? 'bg-black' : 'bg-slate-200'} relative transition-colors`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isShuffle ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueUnits.map(unit => (
                    <button
                      key={unit}
                      onClick={() => {
                        setSelectedUnit(unit);
                        setCurrentIndex(0);
                        setIsFlipped(false);
                      }}
                      className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${selectedUnit === unit
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105'
                        : 'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      BÀI {unit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">XÁO TRỘN</span>
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 ${isShuffle ? 'bg-black dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${isShuffle ? 'left-6 bg-white dark:bg-black' : 'left-1 bg-white dark:bg-slate-400'}`} />
                  </button>
                </div>
                <div className="flex items-center bg-slate-50/50 dark:bg-slate-900/50 p-1 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800 w-full sm:w-auto justify-between sm:justify-start">
                  {[
                    { id: 'list', label: 'Danh sách' },
                    { id: 'flashcard', label: 'Flashcard' },
                    { id: 'quiz', label: 'Luyện tập' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setActiveMode(m.id)}
                      className={`flex-1 sm:flex-none px-2 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest transition-all text-center ${activeMode === m.id
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xl'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="pt-4 pb-20">
              {activeMode === 'list' ? ListScreen : StudyScreen}
            </div>
          </>
        )}
      </div>

      {showResults && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xl max-w-xs w-full space-y-6">
            <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200">Hoàn thành bài học</h2>
            
            <div className="py-4 flex items-baseline justify-center gap-1.5">
              <span className="text-6xl font-light text-slate-900 dark:text-white">{score}</span>
              <span className="text-xl font-normal text-slate-400 dark:text-slate-500">/ {studyData.length}</span>
            </div>
            
            <button
              onClick={() => { 
                setShowResults(false); 
                setActiveMode('flashcard'); 
                handleResetProgress();
              }}
              className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Học lại từ đầu
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        .animate-in { animation: fade-in 0.5s ease-out forwards; }
        .perspective { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { 
          backface-visibility: hidden; 
          -webkit-backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);
        }
        .perspective *, .preserve-3d * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
}
