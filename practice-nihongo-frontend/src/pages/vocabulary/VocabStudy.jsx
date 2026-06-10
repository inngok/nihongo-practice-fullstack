import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Check, X, Cpu, Loader2, Bot, ChevronRight, ChevronLeft } from 'lucide-react';
import vocabService from '../../api/vocabService';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import VocabListMode from './components/VocabListMode';
import VocabFlashcardMode from './components/VocabFlashcardMode';
import VocabQuizMode from './components/VocabQuizMode';

export default function VocabStudy() {
  const navigate = useNavigate();
  const isTouching = useRef(false);
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('bookId');
  const unitParam = searchParams.get('unit');
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
  const [showVietnameseFirst, setShowVietnameseFirst] = useState(false);
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
      if (showResults) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
        return;
      }
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (flashcardSubMode === 'memorize') return handleSwipe('left');
        
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
          setIsFlipped(false);
        }
        return;
      }
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (flashcardSubMode === 'memorize') return handleSwipe('right');
        
        if (currentIndex < studyData.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsFlipped(false);
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
        
      if (stored.some(i => i.id === vocabItem.id)) return;
      
      stored.push({
        ...vocabItem,
        reviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      localStorage.setItem('vocab_review_failed', JSON.stringify(stored));
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

      if (data.length === 0) return setLoading(false);

      const units = [...new Set(data.map(i => parseInt(i.week ?? i.unit ?? i.lesson ?? 1)))].sort((a, b) => a - b);
      const parsedUnit = parseInt(unitParam);
      setSelectedUnit(units.includes(parsedUnit) ? parsedUnit : units[0]);
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
    if (!activeData.length || !bookId) return;

    const bookTitle = vocabData[0]?.book?.title || 'Từ vựng';
    const quickAccessData = {
      title: `Từ vựng ${bookTitle} - Bài ${selectedUnit}`,
      url: `/vocabulary/study?bookId=${bookId}&unit=${selectedUnit}`
    };
    
    localStorage.setItem('quickAccess', JSON.stringify(quickAccessData));
    
    if (!currentUser) return;
    
    fetchWithAuth(`${API_BASE_URL}/progress/quickAccess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: JSON.stringify(quickAccessData) })
    }).catch(() => {});
  }, [bookId, selectedUnit, activeData, vocabData, currentUser, fetchWithAuth]);

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
    if (!currentUser || activeData.length === 0 || !bookId) return;
    
    fetchWithAuth(`${API_BASE_URL}/progress/${progressKey}`)
      .then(res => res.json())
      .then(resData => {
        if (!resData.data) return;
        try {
          const state = JSON.parse(resData.data);
          if (state.currentIndex !== undefined && state.currentIndex < activeData.length) {
            setCurrentIndex(state.currentIndex);
          }
        } catch (e) { }
      }).catch(() => { });
  }, [bookId, selectedUnit, activeData.length, currentUser]);

  useEffect(() => {
    if (!currentUser || !bookId || activeMode === 'list') return;
    
    const state = { currentIndex, activeMode };
    fetchWithAuth(`${API_BASE_URL}/progress/${progressKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: JSON.stringify(state) })
    }).catch(() => { });
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
    isTouching.current = true;
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

    setTimeout(() => {
      isTouching.current = false;
    }, 500);
  };

  const handleMouseDown = (e) => {
    if (activeMode !== 'flashcard' || isTouching.current) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragOffsetX(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || activeMode !== 'flashcard' || isTouching.current) return;
    const deltaX = e.clientX - dragStartX;
    setDragOffsetX(deltaX);
    if (deltaX > 40) setSwipeDirection('right');
    else if (deltaX < -40) setSwipeDirection('left');
    else setSwipeDirection(null);
  };

  const handleMouseUp = () => {
    if (!isDragging || activeMode !== 'flashcard' || isTouching.current) return;
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



  const rotateDeg = dragOffsetX * 0.04;
  // If the card is flipped 180deg Y, we must negate translation & rotation to match visual dragging direction
  const xOffset = isFlipped ? -dragOffsetX : dragOffsetX;
  const rDeg = isFlipped ? -rotateDeg : rotateDeg;
  const cardStyle = {
    transform: `translateX(${xOffset}px) rotate(${rDeg}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`,
    WebkitTransform: `translateX(${xOffset}px) rotate(${rDeg}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`,
    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    WebkitTransition: isDragging ? 'none' : '-webkit-transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  };



  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-4 sm:px-6 md:px-20 pt-40 md:pt-32 pb-10 transition-colors">
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
            <div className="mb-8 md:mb-10">
              <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block mb-3">HỌC TẬP & LUYỆN TẬP</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                  TỪ VỰNG - BÀI {selectedUnit}
                </h1>
                {vocabData[0]?.book?.title && (
                  <span className="hidden sm:inline text-slate-300 dark:text-slate-700 text-lg">|</span>
                )}
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-none">
                  {vocabData[0]?.book?.title || ''}
                </span>
                <span className="px-2.5 py-1 bg-slate-950 text-white dark:bg-white dark:text-black rounded-lg text-[9px] font-black tracking-widest uppercase shadow-sm self-start sm:self-auto">
                  {vocabData[0]?.book?.levelLabel || 'N3'}
                </span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-t border-slate-50 dark:border-slate-900 pt-10">
              <div className="space-y-4 w-full md:w-auto">
                <div className="flex justify-between items-center w-full">
                  <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">CHỌN BÀI HỌC</p>
                  <div className="flex items-center gap-4 md:hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-300">XÁO TRỘN</span>
                      <button onClick={() => setIsShuffle(!isShuffle)} className={`w-8 h-4 rounded-full ${isShuffle ? 'bg-black' : 'bg-slate-200'} relative transition-colors`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isShuffle ? 'left-[18px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                    {activeMode === 'flashcard' && (
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-300">VIỆT → NHẬT</span>
                        <button onClick={() => { setShowVietnameseFirst(!showVietnameseFirst); setIsFlipped(false); }} className={`w-8 h-4 rounded-full ${showVietnameseFirst ? 'bg-black' : 'bg-slate-200'} relative transition-colors`}>
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${showVietnameseFirst ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                    )}
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
                <div className="hidden md:flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">XÁO TRỘN</span>
                    <button
                      onClick={() => setIsShuffle(!isShuffle)}
                      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${isShuffle ? 'bg-black dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${isShuffle ? 'left-6 bg-white dark:bg-black' : 'left-1 bg-white dark:bg-slate-400'}`} />
                    </button>
                  </div>
                  {activeMode === 'flashcard' && (
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">VIỆT → NHẬT</span>
                      <button
                        onClick={() => { setShowVietnameseFirst(!showVietnameseFirst); setIsFlipped(false); }}
                        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${showVietnameseFirst ? 'bg-black dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${showVietnameseFirst ? 'left-6 bg-white dark:bg-black' : 'left-1 bg-white dark:bg-slate-400'}`} />
                      </button>
                    </div>
                  )}
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
              {activeMode === 'list' && (
                <VocabListMode 
                  activeData={activeData}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  completedIds={completedIds}
                />
              )}
              {activeMode === 'flashcard' && (
                <VocabFlashcardMode
                  studyData={studyData}
                  currentIndex={currentIndex}
                  setCurrentIndex={setCurrentIndex}
                  flashcardSubMode={flashcardSubMode}
                  setFlashcardSubMode={setFlashcardSubMode}
                  isFlipped={isFlipped}
                  setIsFlipped={setIsFlipped}
                  handleResetProgress={handleResetProgress}
                  showVietnameseFirst={showVietnameseFirst}
                  handleSwipe={handleSwipe}
                  handleMouseDown={handleMouseDown}
                  handleMouseMove={handleMouseMove}
                  handleMouseUp={handleMouseUp}
                  handleTouchStart={handleTouchStart}
                  handleTouchMove={handleTouchMove}
                  handleTouchEnd={handleTouchEnd}
                  cardStyle={cardStyle}
                  swipeDirection={swipeDirection}
                  setShowResults={setShowResults}
                />
              )}
              {activeMode === 'quiz' && (
                <VocabQuizMode
                  studyData={studyData}
                  currentIndex={currentIndex}
                  setCurrentIndex={setCurrentIndex}
                  handleResetProgress={handleResetProgress}
                  userInput={userInput}
                  setUserInput={setUserInput}
                  feedback={feedback}
                  setFeedback={setFeedback}
                  handleSubmit={handleSubmit}
                  setShowResults={setShowResults}
                />
              )}
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
        .preserve-3d { 
          transform-style: preserve-3d; 
          -webkit-transform-style: preserve-3d;
        }
        .backface-hidden { 
          backface-visibility: hidden; 
          -webkit-backface-visibility: hidden;
        }
        .perspective *, .preserve-3d * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .rotate-y-180 { 
          transform: rotateY(180deg); 
          -webkit-transform: rotateY(180deg);
        }
      `}} />
    </div>
  );
}
