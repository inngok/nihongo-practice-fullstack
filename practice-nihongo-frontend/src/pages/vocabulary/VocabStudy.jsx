import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Check, X, Cpu, Loader2, Bot, ChevronRight, ChevronLeft } from 'lucide-react';
import vocabService from '../../api/vocabService';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
const VocabListMode = React.lazy(() => import('./components/VocabListMode'));
const VocabFlashcardMode = React.lazy(() => import('./components/VocabFlashcardMode'));
const VocabQuizMode = React.lazy(() => import('./components/VocabQuizMode'));
const VocabMultipleChoiceMode = React.lazy(() => import('./components/VocabMultipleChoiceMode'));
const VocabResultsModal = React.lazy(() => import('./components/VocabResultsModal'));

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
  const [showHanViet, setShowHanViet] = useState(false);
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
      
      if (e.key === 'ArrowDown' || e.code === 'Space') {
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

  useEffect(() => {
    const handleDataChanged = () => {
      if (bookId) fetchVocab(true); // true = background refresh
    };
    window.addEventListener('GLOBAL_DATA_CHANGED', handleDataChanged);
    return () => window.removeEventListener('GLOBAL_DATA_CHANGED', handleDataChanged);
  }, [bookId]);

  const fetchVocab = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const response = await vocabService.getAll({ bookId });
      let data = response.data || [];
      
      const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin' || currentUser?.role === 'ROLE_ADMIN';
      if (!isAdmin) {
        data = data.filter(item => item.publish !== false);
      }

      setVocabData(data);

      if (data.length === 0) {
        if (!isBackground) setLoading(false);
        return;
      }

      const units = [...new Set(data.map(i => parseInt(i.week ?? i.unit ?? i.lesson ?? 1)))].sort((a, b) => a - b);
      const parsedUnit = parseInt(unitParam);
      setSelectedUnit(units.includes(parsedUnit) ? parsedUnit : units[0]);
      if (!isBackground) setLoading(false);
    } catch (error) {
      console.error('Error fetching vocab:', error);
      setVocabData([]);
      if (!isBackground) setLoading(false);
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
    // sort by sortOrder (admin-defined), fall back to id (insertion order)
    data = [...data].sort((a, b) => {
      const sa = a.sortOrder != null ? a.sortOrder : (a.id || 0);
      const sb = b.sortOrder != null ? b.sortOrder : (b.id || 0);
      return sa - sb;
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
    
    // fire-and-forget, no need to track
    fetch(`${API_BASE_URL}/progress/quickAccess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
      body: JSON.stringify({ data: JSON.stringify(quickAccessData) })
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, selectedUnit, currentUser]);

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
    
    // debounce: only save progress 2s after the user stops changing state
    const timer = setTimeout(() => {
      const state = { currentIndex, activeMode };
      fetchWithAuth(`${API_BASE_URL}/progress/${progressKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: JSON.stringify(state) })
      }).catch(() => { });
    }, 2000);
    
    return () => clearTimeout(timer);
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
      setFeedback('correct');
      handleCorrectAnswer(currentItem.id);
    } else {
      setFeedback('incorrect');
    }
  };

  const handleCorrectAnswer = useCallback((itemId) => {
    setCompletedIds(prev => {
      if (!prev.includes(itemId)) {
        setScore(s => s + 1);
        return [...prev, itemId];
      }
      return prev;
    });
  }, []);

  const handleSwipe = (direction) => {
    if (!studyData[currentIndex]) return;
    const currentItem = studyData[currentIndex];

    if (direction === 'right') {
      handleCorrectAnswer(currentItem.id);
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
    setStudyData(activeData);
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

                <div className="flex items-center bg-slate-50/50 dark:bg-slate-900/50 p-1 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800 w-full sm:w-auto justify-between sm:justify-start">
                  {[
                    { id: 'list', label: 'Danh sách' },
                    { id: 'flashcard', label: 'Flashcard' },
                    { id: 'multiple_choice', label: 'Trắc nghiệm' },
                    { id: 'quiz', label: 'Luyện tập' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setActiveMode(m.id)}
                      className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap text-center ${activeMode === m.id
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
              <React.Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-300" size={32} /></div>}>
              {activeMode === 'list' && (
                <VocabListMode 
                  activeData={activeData}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  completedIds={completedIds}
                  showHanViet={showHanViet}
                  setShowHanViet={setShowHanViet}
                  isShuffle={isShuffle}
                  setIsShuffle={setIsShuffle}
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
                  setShowVietnameseFirst={setShowVietnameseFirst}
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
                  showHanViet={showHanViet}
                  setShowHanViet={setShowHanViet}
                  isShuffle={isShuffle}
                  setIsShuffle={setIsShuffle}
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
                  isShuffle={isShuffle}
                  setIsShuffle={setIsShuffle}
                />
              )}
              {activeMode === 'multiple_choice' && (
                <VocabMultipleChoiceMode
                  studyData={studyData}
                  fullData={activeData}
                  currentIndex={currentIndex}
                  setCurrentIndex={setCurrentIndex}
                  handleResetProgress={handleResetProgress}
                  setShowResults={setShowResults}
                  isShuffle={isShuffle}
                  setIsShuffle={setIsShuffle}
                  handleCorrectAnswer={handleCorrectAnswer}
                  showVietnameseFirst={showVietnameseFirst}
                  setShowVietnameseFirst={setShowVietnameseFirst}
                />
              )}
              </React.Suspense>
            </div>
          </>
        )}
      </div>

      {showResults && (
        <VocabResultsModal 
          score={score}
          total={studyData.length}
          activeMode={activeMode}
          flashcardSubMode={flashcardSubMode}
          completedIdsLength={completedIds.length}
          handleResetProgress={handleResetProgress}
          setShowResults={setShowResults}
          handleStudyUnmemorized={() => {
            const unmemorized = studyData.filter(item => !completedIds.includes(item.id));
            if (unmemorized.length > 0) {
              setStudyData(unmemorized);
              setCurrentIndex(0);
              setIsFlipped(false);
              setScore(0);
              setCompletedIds([]);
              setShowResults(false);
            } else {
              handleResetProgress();
              setShowResults(false);
            }
          }}
        />
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
