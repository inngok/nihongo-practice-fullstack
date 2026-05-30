import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import kanjiService from '../../api/kanjiService';
import bookService from '../../api/bookService';
import flashcardService from '../../api/flashcardService';
import { useAuth } from '../../context/AuthContext';
import { message, Modal } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import KanjiCanvas from './KanjiCanvas';


export default function KanjiSet4() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('bookId');

  const [book, setBook] = useState(null);
  const [kanjis, setKanjis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPageFilter, setSelectedPageFilter] = useState('all');
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [addedKanjiIds, setAddedKanjiIds] = useState(new Set());

  // Active Mode: 'list' | 'flashcard' | 'quiz' | 'typing'
  const [activeMode, setActiveMode] = useState('list');

  // Mode States
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingInput, setTypingInput] = useState('');
  const [typingFeedback, setTypingFeedback] = useState(null); // 'correct' | 'incorrect' | null
  const [typingFinished, setTypingFinished] = useState(false);
  const typingInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!bookId) {
      navigate('/kanji');
      return;
    }
    fetchData();
  }, [bookId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookRes, kanjiRes, dueRes] = await Promise.all([
        bookService.getById(bookId),
        kanjiService.getAll({ bookId }),
        flashcardService.getDue().catch(() => ({ data: [] }))
      ]);
      setBook(bookRes.data);
      
      // Declarative Null-coalescing Sort: No if-else needed!
      const sortedKanjis = kanjiRes.data.sort((a, b) => {
         if (a.week !== b.week) return (a.week ?? Infinity) - (b.week ?? Infinity);
         return (a.page ?? Infinity) - (b.page ?? Infinity);
      });
      setKanjis(sortedKanjis);

      // Pre-populate Ruby-Red Hearts with active cards
      const storedIds = new Set(dueRes.data.map(fc => fc.kanji?.id).filter(Boolean));
      setAddedKanjiIds(storedIds);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Hán tự:', err);
      message.error('Không thể tải dữ liệu Hán tự.');
    } finally {
      setLoading(false);
    }
  };

  // Declarative Virtual Paging array builder
  const uniquePages = React.useMemo(() => {
    const dbWeeks = new Set(kanjis.map(k => k.week).filter(w => w !== null && w !== undefined));
    if (dbWeeks.size > 0) {
      return Array.from(dbWeeks).sort((a, b) => a - b).map(w => `week_${w}`);
    }
    const dbPages = new Set(kanjis.map(k => k.page).filter(p => p !== null && p !== undefined));
    if (dbPages.size > 0) {
      return Array.from(dbPages).sort((a, b) => a - b).map(p => `page_${p}`);
    }
    const numPages = Math.ceil(kanjis.length / 80);
    return Array.from({ length: numPages }, (_, i) => i + 1).map(p => `virtual_${p}`);
  }, [kanjis]);

  // Functional matching & clean page slice mapping
  const filteredKanjis = React.useMemo(() => {
    let result = kanjis;

    if (selectedPageFilter !== 'all') {
      const [type, valStr] = selectedPageFilter.split('_');
      const val = Number(valStr);
      if (type === 'week') {
         result = kanjis.filter(k => k.week === val);
      } else if (type === 'page') {
         result = kanjis.filter(k => k.page === val);
      } else if (type === 'virtual') {
         result = kanjis.slice((val - 1) * 80, val * 80);
      }
    }

    if (activeMode === 'list' && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(k => 
        [k.character, k.hanviet, k.meaning, k.onyomi, k.kunyomi]
          .some(field => field?.toLowerCase().includes(query))
      );
    }

    return result;
  }, [kanjis, selectedPageFilter, searchQuery, activeMode]);

  // Reset indices declarative listener
  useEffect(() => {
    setFlashcardIndex(0);
    setIsFlipped(false);
    setTypingIndex(0);
    setTypingInput('');
    setTypingFeedback(null);
    setTypingFinished(false);
    
    if (activeMode === 'quiz') generateQuiz();
  }, [activeMode, selectedPageFilter, kanjis]);

  // Keyboard navigation mapping
  useEffect(() => {
    if (activeMode !== 'flashcard' || filteredKanjis.length === 0) return;

    const keyActions = {
      'Space': (e) => { e.preventDefault(); setIsFlipped(prev => !prev); },
      'ArrowRight': () => handleNextFlashcard(),
      'ArrowLeft': () => handlePrevFlashcard(),
    };

    const handleKeyDown = (e) => keyActions[e.code]?.(e);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, flashcardIndex, filteredKanjis]);

  const normalizeText = (str) => {
    if (!str) return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
  };

  const handleNextFlashcard = () => {
    if (filteredKanjis.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => setFlashcardIndex(prev => (prev + 1) % filteredKanjis.length), 150);
  };

  const handlePrevFlashcard = () => {
    if (filteredKanjis.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => setFlashcardIndex(prev => (prev - 1 + filteredKanjis.length) % filteredKanjis.length), 150);
  };

  const generateQuiz = () => {
    if (filteredKanjis.length < 4) {
      setQuizQuestions([]);
      return;
    }
    
    const shuffledList = [...filteredKanjis].sort(() => Math.random() - 0.5);
    const questions = shuffledList.slice(0, Math.min(15, shuffledList.length)).map(kanji => {
      const incorrects = filteredKanjis
        .filter(k => k.id !== kanji.id && k.hanviet !== kanji.hanviet)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(k => k.hanviet || 'CHƯA CÓ');
      
      while (incorrects.length < 3) incorrects.push('ĐANG CẬP NHẬT');
      const options = [kanji.hanviet || 'CHƯA CÓ', ...incorrects].sort(() => Math.random() - 0.5);
      
      return {
        kanji,
        options,
        correctAnswer: kanji.hanviet || 'CHƯA CÓ',
        selectedAnswer: null,
        isCorrect: null
      };
    });
    
    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
    setQuizSelectedOption(null);
  };

  const handleSelectQuizOption = (option) => {
    if (quizSelectedOption) return;

    setQuizSelectedOption(option);
    const currentQuestion = quizQuestions[quizIndex];
    currentQuestion.selectedAnswer = option;
    
    const isCorrect = normalizeText(option) === normalizeText(currentQuestion.correctAnswer);
    currentQuestion.isCorrect = isCorrect;
    if (isCorrect) setQuizScore(prev => prev + 1);

    setTimeout(() => {
      if (quizIndex < quizQuestions.length - 1) {
        setQuizIndex(prev => prev + 1);
        setQuizSelectedOption(null);
      } else {
        setQuizFinished(true);
      }
    }, 1500);
  };

  // Declarative style selector for quiz option buttons (No nested if-else)
  const getQuizOptionClass = (option) => {
    if (quizSelectedOption === null) return "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-900 dark:text-white";
    if (option === quizQuestions[quizIndex]?.correctAnswer) return "bg-slate-900 text-white dark:bg-white dark:text-black border-slate-900 dark:border-white font-black scale-[0.98] shadow-md shadow-black/10 dark:shadow-none";
    if (option === quizSelectedOption) return "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-70";
    return "bg-slate-50/50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 text-slate-300 dark:text-slate-700 opacity-40";
  };

  const handleTypingSubmit = (e) => {
    e.preventDefault();
    if (filteredKanjis.length === 0) return;

    // If already has feedback (correct or incorrect), pressing Enter advances to the next card immediately
    if (typingFeedback !== null) {
      moveToNextTyping();
      return;
    }

    const isCorrect = normalizeText(typingInput) === normalizeText(filteredKanjis[typingIndex].hanviet);
    setTypingFeedback(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => moveToNextTyping(), 1000);
    }
  };

  const moveToNextTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setTypingInput('');
    setTypingFeedback(null);
    if (typingIndex < filteredKanjis.length - 1) {
      setTypingIndex(prev => prev + 1);
      setTimeout(() => typingInputRef.current?.focus(), 50);
    } else {
      setTypingFinished(true);
    }
  };

  const handleSkipTyping = () => {
    setTypingInput(filteredKanjis[typingIndex]?.hanviet || '');
    setTypingFeedback('incorrect');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => moveToNextTyping(), 2000);
  };

  const handleAddFlashcard = async (kanji, e) => {
    if (e) e.stopPropagation();
    try {
      await flashcardService.add(null, kanji.id);
      setAddedKanjiIds(prev => new Set([...prev, kanji.id]));
      message.success(`Đã lưu chữ Hán "${kanji.character}" vào sổ tay ôn tập!`);
    } catch (err) {
      setAddedKanjiIds(prev => new Set([...prev, kanji.id]));
      message.info('Hán tự này đã có trong Sổ tay ôn tập rồi nhé!');
    }
  };

  const handleOpenDetail = (kanji) => {
    setSelectedKanji(kanji);
    setIsDetailModalOpen(true);
  };

  const formattedBookCode = book ? `SET ${String(book.num || bookId).padStart(2, '0')}` : 'SET --';

  // Helper to parse examples string: "地形 (ちけい): địa hình" -> {word, reading, meaning}
  const parseExamples = (examplesStr) => {
    if (!examplesStr) return [];
    
    // Split by semicolon (preferred), newline, or period
    let parts = [];
    if (examplesStr.includes(';')) {
      parts = examplesStr.split(';').map(s => s.trim()).filter(Boolean);
    } else if (examplesStr.includes('\n')) {
      parts = examplesStr.split('\n').map(s => s.trim()).filter(Boolean);
    } else {
      parts = examplesStr.split('.').map(s => s.trim()).filter(Boolean);
    }

    return parts.map(s => {
      // Match "Word (Reading): Meaning"
      const match = s.match(/^(.*?)\((.*?)\):\s*(.*)/);
      if (match) {
        return { 
          word: match[1].trim(), 
          reading: match[2].trim(), 
          meaning: match[3].trim() 
        };
      }
      // Fallback for "Word: Meaning"
      if (s.includes(':')) {
        const [word, ...rest] = s.split(':');
        return { word: word.trim(), reading: '', meaning: rest.join(':').trim() };
      }
      return { word: s.trim(), reading: '', meaning: '' };
    });
  };

  const hasAnyExamples = filteredKanjis.some(k => k.examples && k.examples.trim() !== '');

  const DetailedKanjiCard = ({ kanji }) => {
    const examples = parseExamples(kanji.examples);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
      // Default to collapsed on mobile viewports
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    }, []);

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-10 shadow-sm transition-all">
        {/* Top Info Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 pb-8 border-b border-slate-50 dark:border-slate-850">
          <div className="flex gap-4 sm:gap-8 items-start flex-1 min-w-0">
            {/* Big Kanji Frame */}
            <div 
              onClick={() => handleOpenDetail(kanji)}
              className="w-24 h-24 sm:w-32 sm:h-32 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer hover:border-slate-400 transition-colors"
            >
              <span className="text-5xl sm:text-7xl font-kanji font-bold text-slate-900 dark:text-white select-none">{kanji.character}</span>
            </div>

            {/* Core Info */}
            <div className="flex-1 min-w-0 pt-1">
               <div className="flex flex-col mb-4 sm:mb-6">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1">Ý NGHĨA</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white uppercase truncate">{kanji.hanviet || 'CHƯA CÓ'}</h2>
               </div>

               <div className="flex gap-8 sm:gap-16">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest block mb-0.5 sm:mb-1">ÂM ON</span>
                    <p className="text-sm sm:text-lg font-kanji font-bold text-slate-800 dark:text-slate-200">{kanji.onyomi || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest block mb-0.5 sm:mb-1">ÂM KUN</span>
                    <p className="text-sm sm:text-lg font-kanji font-bold text-slate-800 dark:text-slate-200">{kanji.kunyomi || '—'}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* stats and save action bar */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto border-t sm:border-t-0 border-slate-50 dark:border-slate-800/80 pt-4 sm:pt-0 gap-6 shrink-0">
             <div 
               onClick={() => setIsCollapsed(!isCollapsed)}
               className="text-left sm:text-right flex sm:flex-col items-center sm:items-end cursor-pointer select-none hover:opacity-80 transition-opacity gap-2 sm:gap-1"
               title={isCollapsed ? 'Mở rộng từ vựng' : 'Thu gọn từ vựng'}
             >
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">TỪ VỰNG</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl sm:text-4xl font-black text-slate-400 dark:text-slate-500 leading-none">{examples.length}</span>
                  <span className="text-slate-300 transition-transform duration-300" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                     <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
                     </svg>
                  </span>
                </div>
             </div>

             <button
                onClick={(e) => handleAddFlashcard(kanji, e)}
                className="text-slate-300 hover:text-rose-500 transition-colors p-2 bg-slate-50 dark:bg-slate-950 sm:bg-transparent rounded-xl sm:rounded-none"
              >
                {addedKanjiIds.has(kanji.id) ? (
                  <HeartFilled className="text-rose-500 text-lg sm:text-xl" />
                ) : (
                  <HeartOutlined className="text-lg sm:text-xl" />
                )}
              </button>
          </div>
        </div>

        {/* Vocabulary Grid */}
        {examples.length > 0 && !isCollapsed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
             {examples.map((ex, idx) => (
               <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-300 transition-all relative">
                  <span className="absolute top-4 right-5 text-[9px] font-bold text-slate-200 dark:text-slate-800 tracking-widest">#{idx + 1}</span>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{ex.word}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-600 mb-2">{ex.reading}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-bold">{ex.meaning}</p>
               </div>
             ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 flex flex-col items-center pt-28 md:pt-32 pb-16 px-6 font-sans select-none">
      
      <div className="w-full max-w-6xl">
        
        {/* Quay Lại Button */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/kanji')}
            className="group flex items-center gap-1.5 text-slate-500 hover:text-slate-950 dark:hover:text-white text-xs font-bold uppercase tracking-widest transition-colors bg-transparent border-none p-0 outline-none focus:outline-none"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span> QUAY LẠI
          </button>
          
          <span className="text-[10px] font-black tracking-[0.25em] text-slate-300 dark:text-slate-700 uppercase">
            {formattedBookCode}
          </span>
        </div>

        {/* Dynamic Page Pills Grid */}
        <div className="flex flex-wrap gap-2.5 mb-10 max-w-4xl">
          <button
            onClick={() => setSelectedPageFilter('all')}
            className={`text-[9px] font-black tracking-wider uppercase px-4 py-2 rounded-lg transition-all ${
              selectedPageFilter === 'all'
                ? 'bg-slate-950 text-white dark:bg-white dark:text-black shadow-sm'
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
            }`}
          >
            Tất cả
          </button>
          {uniquePages.map(p => {
            const [type, val] = p.split('_');
            const label = type === 'week' ? `Bài ${val}` : type === 'page' ? `Trang ${val}` : `Phần ${val}`;
            return (
              <button
                key={p}
                onClick={() => setSelectedPageFilter(p)}
                className={`text-[9px] font-black tracking-wider uppercase px-4 py-2 rounded-lg transition-all ${
                  selectedPageFilter === p
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-black shadow-sm'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Header Title & Study Modes Swapper Container */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-none flex items-baseline gap-2.5">
              {book ? book.title : 'Đang tải...'}
              <span className="text-sm font-medium text-slate-300 dark:text-slate-700">({kanjis.length} chữ)</span>
            </h1>
          </div>

          {/* Premium Capsule Mode Switcher */}
          <div className="bg-slate-50/70 dark:bg-slate-900/50 p-1.5 rounded-2xl flex flex-wrap items-center border border-slate-100/50 dark:border-slate-800/50 self-start md:self-auto shadow-inner gap-y-1">
            <button onClick={() => setActiveMode('list')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'list' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Danh sách</button>
            <button onClick={() => setActiveMode('flashcard')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'flashcard' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Flashcard</button>
            <button onClick={() => setActiveMode('quiz')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'quiz' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Trắc nghiệm</button>
            <button onClick={() => setActiveMode('typing')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'typing' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Gõ phím</button>
            <button onClick={() => setActiveMode('drawing')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'drawing' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Luyện viết</button>
          </div>
        </div>

        {/* --- VIEW 1: DANH SÁCH (TYPOGRAPHIC GRID) --- */}
        {activeMode === 'list' && (
          <>
            <div className="relative w-full max-w-md mb-10">
              <input
                type="text"
                placeholder="Tìm nhanh chữ Hán, âm Hán Việt, ý nghĩa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-slate-300 dark:focus:border-slate-700 focus:bg-white dark:focus:bg-slate-900 transition-all text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-8 h-8 border-3 border-slate-100 border-t-black rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang tải...</p>
              </div>
            ) : hasAnyExamples ? (
               /* DETAILED LIST VIEW (When vocabulary exists) */
               <div className="flex flex-col">
                  {filteredKanjis.map((kanji, index) => (
                    <DetailedKanjiCard key={kanji.id} kanji={kanji} index={index} />
                  ))}
               </div>
            ) : (
              /* SIMPLE GRID VIEW (When no vocabulary) */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredKanjis.map((kanji, index) => (
                  <div
                    key={kanji.id}
                    onClick={() => handleOpenDetail(kanji)}
                    className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xl hover:-translate-y-1 rounded-3xl p-6 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer h-52 shadow-sm"
                  >
                    {/* Index leading zero badge */}
                    <span className="absolute top-4 left-4 text-[9px] font-black text-slate-200 dark:text-slate-800 uppercase tracking-widest">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Bookmark Heart Button */}
                    <button
                      onClick={(e) => handleAddFlashcard(kanji, e)}
                      className="absolute top-3 right-3 p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-300 dark:text-slate-700 hover:text-rose-500 rounded-full transition-all duration-300 scale-90 group-hover:scale-100 z-10"
                      title="Lưu vào Sổ tay ôn tập"
                    >
                      {addedKanjiIds.has(kanji.id) ? (
                        <HeartFilled className="text-rose-500 text-xs" />
                      ) : (
                        <HeartOutlined className="text-xs text-slate-300 hover:text-rose-400 transition-colors" />
                      )}
                    </button>

                    {/* Big Character block */}
                    <div className="my-3 text-center">
                      <h2 className="text-5xl font-kanji font-bold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300 select-none">
                        {kanji.character}
                      </h2>
                    </div>

                    {/* Meta Footer */}
                    <div className="w-full text-center space-y-1.5 pt-3 mt-auto border-t border-slate-50 dark:border-slate-850">
                      <span className="inline-block font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                        {kanji.hanviet || 'CHƯA CÓ'}
                      </span>
                      <p className="text-slate-400 text-[10px] font-medium truncate max-w-full italic px-1">
                        {kanji.meaning || 'Chưa có nghĩa'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredKanjis.length === 0 && !loading && (
              <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Danh sách trống</p>
              </div>
            )}
          </>
        )}

        {/* --- VIEW 2: FLASHCARD STUDY VIEW --- */}
        {activeMode === 'flashcard' && (
          <div className="max-w-2xl mx-auto py-8">
            {filteredKanjis.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Không có từ để ôn tập</p>
              </div>
            ) : (
              <div className="space-y-10">
                <div 
                  onClick={() => setIsFlipped(prev => !prev)}
                  className="w-full max-w-md h-80 mx-auto cursor-pointer relative select-none"
                  style={{ perspective: '1200px' }}
                >
                  <div 
                    className="w-full h-full duration-500 ease-in-out transform relative"
                    style={{ 
                      transformStyle: 'preserve-3d', 
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
                    }}
                  >
                    {/* Front Face */}
                    <div 
                      className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none rounded-[2.5rem] flex flex-col items-center justify-center p-8"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <span className="absolute top-6 left-6 text-xs font-black text-slate-200 dark:text-slate-800 uppercase tracking-wider">
                        KANJI
                      </span>
                      <span className="text-8xl font-kanji font-bold text-slate-900 dark:text-white tracking-tight">{filteredKanjis[flashcardIndex].character}</span>
                      <p className="text-[9px] text-slate-300 dark:text-slate-700 font-bold uppercase tracking-[0.2em] mt-10">
                        Chạm để lật thẻ
                      </p>
                    </div>

                    {/* Back Face */}
                    <div 
                      className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center"
                      style={{ 
                        backfaceVisibility: 'hidden', 
                        transform: 'rotateY(180deg)' 
                      }}
                    >
                      <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">
                        ÂM HÁN VIỆT
                      </span>
                      <h3 className="text-4xl font-bold text-slate-950 dark:text-white uppercase tracking-wide leading-none mb-4">
                        {filteredKanjis[flashcardIndex].hanviet || 'CHƯA CÓ'}
                      </h3>
                      
                      <div className="space-y-1.5 mb-6">
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest block">Ý NGHĨA</span>
                        <p className="text-base text-slate-600 dark:text-slate-300 font-bold italic leading-relaxed">
                          {filteredKanjis[flashcardIndex].meaning || 'Chưa cập nhật'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-left text-xs">
                        <div>
                          <span className="font-black text-[9px] text-slate-400 dark:text-slate-600 uppercase tracking-widest block mb-0.5">Onyomi</span>
                          <span className="font-kanji font-bold text-slate-800 dark:text-slate-200">{filteredKanjis[flashcardIndex].onyomi || '—'}</span>
                        </div>
                        <div>
                          <span className="font-black text-[9px] text-slate-400 dark:text-slate-600 uppercase tracking-widest block mb-0.5">Kunyomi</span>
                          <span className="font-kanji font-bold text-slate-800 dark:text-slate-200">{filteredKanjis[flashcardIndex].kunyomi || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between max-w-md mx-auto">
                  <button onClick={handlePrevFlashcard} className="border border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all">Trước</button>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Thẻ {flashcardIndex + 1} / {filteredKanjis.length}</span>
                  <button onClick={handleNextFlashcard} className="border border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all">Sau</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 3: TRẮC NGHIỆM --- */}
        {activeMode === 'quiz' && (
          <div className="max-w-2xl mx-auto py-8">
            {quizQuestions.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cần tối thiểu 4 từ để học trắc nghiệm</p>
              </div>
            ) : quizFinished ? (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 md:p-12 text-center space-y-6 max-w-md mx-auto shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">KẾT QUẢ ĐẠT ĐƯỢC</h3>
                <div className="w-24 h-24 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto shadow-inner border border-slate-100 dark:border-slate-800">
                  <span className="text-3xl font-black text-slate-800 dark:text-slate-200">{quizScore}/{quizQuestions.length}</span>
                </div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">Bạn đã xuất sắc trả lời đúng {Math.round((quizScore / quizQuestions.length) * 100)}% số câu hỏi!</p>
                <button onClick={generateQuiz} className="bg-black dark:bg-white text-white dark:text-black hover:opacity-80 w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center">Luyện tập lại</button>
              </div>
            ) : (
              <div className="space-y-8 max-w-md mx-auto">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Câu hỏi {quizIndex + 1} / {quizQuestions.length}</span>
                  <span className="text-slate-900 dark:text-white font-black underline decoration-slate-300">Đúng: {quizScore}</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[2.5rem] p-8 text-center shadow-lg shadow-slate-100 dark:shadow-none">
                  <span className="text-[10px] font-black text-slate-200 dark:text-slate-800 uppercase tracking-wider block mb-2">Hỏi chữ Hán</span>
                  <span className="text-7xl font-kanji font-bold text-slate-950 dark:text-white block">{quizQuestions[quizIndex]?.kanji.character}</span>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-6">Chữ Hán trên có âm Hán Việt là gì?</p>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {quizQuestions[quizIndex]?.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(option)}
                      disabled={quizSelectedOption !== null}
                      className={`w-full py-4 px-6 rounded-2xl text-xs font-bold transition-all text-center ${getQuizOptionClass(option)}`}
                    >
                      <span className="uppercase tracking-wider">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 4: GÕ PHÍM --- */}
        {activeMode === 'typing' && (
          <div className="max-w-xl mx-auto py-8">
            {filteredKanjis.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Không có từ để luyện gõ phím</p>
              </div>
            ) : typingFinished ? (
              <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 md:p-12 text-center space-y-6 max-w-md mx-auto shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">HOÀN THÀNH LUYỆN GÕ</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-relaxed">Quá xuất sắc! Bạn đã luyện gõ thành công toàn bộ danh sách {filteredKanjis.length} chữ Hán tự bài này!</p>
                <button
                  onClick={() => {
                    setTypingIndex(0);
                    setTypingInput('');
                    setTypingFeedback(null);
                    setTypingFinished(false);
                    setTimeout(() => typingInputRef.current?.focus(), 50);
                  }}
                  className="bg-black text-white hover:bg-slate-800 w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center"
                >
                  Luyện tập lại từ đầu
                </button>
              </div>
            ) : (
              <div className="space-y-8 max-w-md mx-auto">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Chữ thứ {typingIndex + 1} / {filteredKanjis.length}</span>
                  <span className="text-indigo-500">Nhập đúng âm Hán Việt</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[2.5rem] p-8 text-center shadow-lg shadow-slate-100 dark:shadow-none flex flex-col items-center">
                  <span className="text-8xl font-kanji font-bold text-slate-950 dark:text-white block mb-4 select-none">{filteredKanjis[typingIndex]?.character}</span>
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">Ý nghĩa gợi ý</span>
                  <p className="text-base text-slate-500 dark:text-slate-400 font-bold italic leading-none">{filteredKanjis[typingIndex]?.meaning || '—'}</p>
                </div>

                <form onSubmit={handleTypingSubmit} className="space-y-4">
                  <input
                    ref={typingInputRef}
                    type="text"
                    placeholder="Gõ âm Hán Việt chữ này... (ví dụ: NHAT)"
                    value={typingInput}
                    onChange={(e) => setTypingInput(e.target.value)}
                    disabled={typingFeedback === 'correct'}
                    autoFocus
                    className={`w-full py-4 px-5 rounded-2xl outline-none border transition-all text-sm font-black text-center uppercase tracking-widest ${
                      typingFeedback === 'correct'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-slate-900 dark:border-white shadow-xl scale-[0.98]'
                        : typingFeedback === 'incorrect'
                        ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-70'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-150 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 text-slate-900 dark:text-white'
                    }`}
                  />

                  <div className="flex gap-3">
                    <button type="button" onClick={handleSkipTyping} className="flex-1 py-3.5 border border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all text-slate-400 dark:text-slate-600 hover:text-black dark:hover:text-white">Bỏ qua & xem kết quả</button>
                    <button type="submit" disabled={typingFeedback === 'correct'} className="flex-1 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95">Xác nhận kết quả</button>
                  </div>
                </form>

                {typingFeedback === 'incorrect' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">❌ Nhập chưa chính xác! Gợi ý đáp án đúng: <span className="uppercase text-sm font-black text-slate-900 dark:text-white tracking-wider underline">{filteredKanjis[typingIndex]?.hanviet}</span></p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 5: LUYỆN VIẾT (KANJI CANVAS DRAWING VIEW) --- */}
        {activeMode === 'drawing' && (
          <KanjiCanvas
            kanjiList={filteredKanjis}
            addedKanjiIds={addedKanjiIds}
            onAddFlashcard={handleAddFlashcard}
            onClose={() => setActiveMode('list')}
          />
        )}

      </div>

      {/* Premium Detail Modal */}
      {selectedKanji && (
        <Modal
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          footer={null}
          closeIcon={null}
          width={480}
          centered
          className="premium-kanji-modal"
          bodyStyle={{ padding: 0 }}
        >
          <div className="p-10 space-y-10 bg-white dark:bg-slate-950 rounded-[2.5rem]">
            {/* Header */}
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                {book ? book.title : ''} {selectedKanji.page ? `• ${selectedKanji.page}` : ''}
              </span>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-[10px] font-bold text-slate-400 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors"
              >
                Đóng
              </button>
            </div>

            {/* Core Info */}
            <div className="text-center space-y-4">
              <div className="text-8xl font-kanji font-bold text-slate-900 dark:text-white select-none leading-none">
                {selectedKanji.character}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                  {selectedKanji.hanviet || 'CHƯA CÓ'}
                </h3>
                <p className="text-sm text-slate-500 font-medium italic mt-2">
                  {selectedKanji.meaning || 'Nghĩa chưa được cập nhật'}
                </p>
              </div>
            </div>

            {/* Readings */}
            <div className="flex justify-center gap-16 border-y border-slate-100 dark:border-slate-800 py-6">
              <div className="text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">ON</span>
                <p className="text-lg font-kanji font-bold text-slate-900 dark:text-white">{selectedKanji.onyomi || '—'}</p>
              </div>
              <div className="text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">KUN</span>
                <p className="text-lg font-kanji font-bold text-slate-900 dark:text-white">{selectedKanji.kunyomi || '—'}</p>
              </div>
            </div>

            {/* Examples */}
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Ví dụ</span>
              {selectedKanji.examples ? (
                <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {selectedKanji.examples.split(/[;\n]+/).map(line => line.trim()).filter(Boolean).map((line, idx) => (
                    <p key={idx} className="text-sm text-slate-600 dark:text-slate-400 font-medium">{line}</p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">Chưa có ví dụ mẫu.</p>
              )}
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                onClick={() => handleAddFlashcard(selectedKanji)}
                className={`w-full py-4 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  addedKanjiIds.has(selectedKanji.id)
                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-default'
                    : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'
                }`}
              >
                {addedKanjiIds.has(selectedKanji.id) ? (
                  <>
                    <HeartFilled className="text-slate-400" />
                    Đã lưu sổ tay
                  </>
                ) : (
                  <>
                    <HeartOutlined />
                    Lưu sổ tay
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
