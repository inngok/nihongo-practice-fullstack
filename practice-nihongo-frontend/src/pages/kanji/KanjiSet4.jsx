import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import kanjiService from '../../api/kanjiService';
import bookService from '../../api/bookService';
import flashcardService from '../../api/flashcardService';
import { useAuth } from '../../context/AuthContext';
import { message, Modal } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import KanjiCanvas from './KanjiCanvas';
import DetailedKanjiCard from './components/DetailedKanjiCard';
import KanjiVocabView from './components/KanjiVocabView';
import KanjiFlashcardView from './components/KanjiFlashcardView';
import KanjiQuizView from './components/KanjiQuizView';
import KanjiTypingView from './components/KanjiTypingView';

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
  const [vocabIndex, setVocabIndex] = useState(0);
  const typingInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

const parseExamples = (examplesStr) => {
  if (!examplesStr) return [];
  let parts = [];
  if (examplesStr.includes(';')) {
    parts = examplesStr.split(';').map(s => s.trim()).filter(Boolean);
  } else if (examplesStr.includes('\n')) {
    parts = examplesStr.split('\n').map(s => s.trim()).filter(Boolean);
  } else {
    parts = examplesStr.split('.').map(s => s.trim()).filter(Boolean);
  }

  return parts.map(s => {
    const match = s.match(/^(.*?)\((.*?)\):\s*(.*)/);
    if (match) {
      return { 
        word: match[1].trim(), 
        reading: match[2].trim(), 
        meaning: match[3].trim() 
      };
    }
    if (s.includes(':')) {
      const [word, ...rest] = s.split(':');
      return { word: word.trim(), reading: '', meaning: rest.join(':').trim() };
    }
    return { word: s.trim(), reading: '', meaning: '' };
  });
};

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

  const kanjiVocabs = React.useMemo(() => {
    let vocabs = [];
    filteredKanjis.forEach(kanji => {
       const examples = parseExamples(kanji.examples);
       vocabs.push(...examples.filter(e => e.word && e.meaning));
    });
    return vocabs;
  }, [filteredKanjis]);

  // Reset indices declarative listener
  useEffect(() => {
    setFlashcardIndex(0);
    setVocabIndex(0);
    setIsFlipped(false);
    setTypingIndex(0);
    setTypingInput('');
    setTypingFeedback(null);
    setTypingFinished(false);
    
    if (activeMode === 'quiz') generateQuiz();
  }, [activeMode, selectedPageFilter, kanjis]);

  // Keyboard navigation mapping
  useEffect(() => {
    if ((activeMode !== 'flashcard' && activeMode !== 'vocab') || (activeMode === 'flashcard' && filteredKanjis.length === 0) || (activeMode === 'vocab' && kanjiVocabs.length === 0)) return;

    const keyActions = {
      'Space': (e) => { e.preventDefault(); setIsFlipped(prev => !prev); },
      'ArrowRight': () => {
        if (activeMode === 'flashcard') handleNextFlashcard();
        else if (activeMode === 'vocab' && vocabIndex < kanjiVocabs.length - 1) { setVocabIndex(prev => prev + 1); setIsFlipped(false); }
      },
      'ArrowLeft': () => {
        if (activeMode === 'flashcard') handlePrevFlashcard();
        else if (activeMode === 'vocab' && vocabIndex > 0) { setVocabIndex(prev => prev - 1); setIsFlipped(false); }
      },
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

  const hasAnyExamples = filteredKanjis.some(k => k.examples && k.examples.trim() !== '');
  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 flex flex-col items-center pt-40 md:pt-32 pb-16 px-6 font-sans select-none">
      
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
            <button onClick={() => setActiveMode('vocab')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'vocab' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Từ vựng</button>
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
                  {filteredKanjis.map((kanji) => (
                    <DetailedKanjiCard 
                       key={kanji.id} 
                       kanji={kanji} 
                       handleOpenDetail={handleOpenDetail} 
                       handleAddFlashcard={handleAddFlashcard} 
                       addedKanjiIds={addedKanjiIds} 
                    />
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

        {/* --- VIEW 6: VOCAB STUDY VIEW --- */}
        {activeMode === 'vocab' && (
          <KanjiVocabView
            kanjiVocabs={kanjiVocabs}
            vocabIndex={vocabIndex}
            setVocabIndex={setVocabIndex}
            isFlipped={isFlipped}
            setIsFlipped={setIsFlipped}
          />
        )}


        {/* --- VIEW 2: FLASHCARD STUDY VIEW --- */}
        {activeMode === 'flashcard' && (
          <KanjiFlashcardView
            filteredKanjis={filteredKanjis}
            flashcardIndex={flashcardIndex}
            isFlipped={isFlipped}
            setIsFlipped={setIsFlipped}
            handlePrevFlashcard={handlePrevFlashcard}
            handleNextFlashcard={handleNextFlashcard}
          />
        )}

        {/* --- VIEW 3: TRẮC NGHIỆM --- */}
        {activeMode === 'quiz' && (
          <KanjiQuizView
            quizQuestions={quizQuestions}
            quizFinished={quizFinished}
            quizScore={quizScore}
            quizIndex={quizIndex}
            generateQuiz={generateQuiz}
            handleSelectQuizOption={handleSelectQuizOption}
            quizSelectedOption={quizSelectedOption}
            getQuizOptionClass={getQuizOptionClass}
          />
        )}

        {/* --- VIEW 4: GÕ PHÍM --- */}
        {activeMode === 'typing' && (
          <KanjiTypingView
            filteredKanjis={filteredKanjis}
            typingFinished={typingFinished}
            typingIndex={typingIndex}
            setTypingIndex={setTypingIndex}
            typingInput={typingInput}
            setTypingInput={setTypingInput}
            typingFeedback={typingFeedback}
            setTypingFeedback={setTypingFeedback}
            setTypingFinished={setTypingFinished}
            typingInputRef={typingInputRef}
            handleTypingSubmit={handleTypingSubmit}
            handleSkipTyping={handleSkipTyping}
          />
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
