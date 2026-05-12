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

  useEffect(() => {
    if (!bookId) {
      navigate('/kanji');
      return;
    }
    fetchData();
  }, [bookId]);

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
      const sortedKanjis = kanjiRes.data.sort((a, b) => (a.page ?? Infinity) - (b.page ?? Infinity));
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
    const dbPages = new Set(kanjis.map(k => k.page).filter(p => p !== null && p !== undefined));
    if (dbPages.size > 0) {
      return Array.from(dbPages).sort((a, b) => a - b);
    }
    const numPages = Math.ceil(kanjis.length / 80);
    return Array.from({ length: numPages }, (_, i) => i + 1);
  }, [kanjis]);

  // Functional matching & clean page slice mapping
  const filteredKanjis = React.useMemo(() => {
    let result = kanjis;

    if (selectedPageFilter !== 'all') {
      const pageNum = Number(selectedPageFilter);
      const hasDbPages = kanjis.some(k => k.page !== null && k.page !== undefined);
      result = hasDbPages
        ? kanjis.filter(k => k.page === pageNum)
        : kanjis.slice((pageNum - 1) * 80, pageNum * 80);
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
    if (quizSelectedOption === null) return "bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50";
    if (option === quizQuestions[quizIndex]?.correctAnswer) return "bg-emerald-50 border-emerald-500 text-emerald-800 font-extrabold shadow-sm";
    if (option === quizSelectedOption) return "bg-rose-50 border-rose-500 text-rose-800 font-extrabold shadow-sm";
    return "bg-white border-slate-100 text-slate-300 opacity-60";
  };

  const handleTypingSubmit = (e) => {
    e.preventDefault();
    if (typingFeedback !== null || filteredKanjis.length === 0) return;

    const isCorrect = normalizeText(typingInput) === normalizeText(filteredKanjis[typingIndex].hanviet);
    setTypingFeedback(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) setTimeout(() => moveToNextTyping(), 1000);
  };

  const moveToNextTyping = () => {
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
    setTimeout(() => moveToNextTyping(), 2000);
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

  const formattedBookCode = book ? `SET ${String(book.num || bookId).padStart(2, '0')}` : 'SET --';

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center pt-20 md:pt-24 pb-16 px-6 font-sans select-none">
      
      <div className="w-full max-w-6xl">
        
        {/* Quay Lại Button */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/kanji')}
            className="group flex items-center gap-1.5 text-slate-500 hover:text-slate-950 text-xs font-black uppercase tracking-widest transition-colors bg-transparent border-none p-0 outline-none focus:outline-none"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span> QUAY LẠI
          </button>
          
          <span className="text-[10px] font-black tracking-[0.25em] text-slate-300 uppercase">
            {formattedBookCode}
          </span>
        </div>

        {/* Dynamic Page Pills Grid */}
        <div className="flex flex-wrap gap-2.5 mb-10 max-w-4xl">
          <button
            onClick={() => setSelectedPageFilter('all')}
            className={`text-[9px] font-black tracking-wider uppercase px-4 py-2 rounded-lg transition-all ${
              selectedPageFilter === 'all'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            Tất cả
          </button>
          {uniquePages.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPageFilter(String(p))}
              className={`text-[9px] font-black tracking-wider uppercase px-4 py-2 rounded-lg transition-all ${
                selectedPageFilter === String(p)
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              Trang {p}
            </button>
          ))}
        </div>

        {/* Header Title & Study Modes Swapper Container */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight leading-none flex items-baseline gap-2.5">
              {book ? book.title : 'Đang tải...'}
              <span className="text-sm font-medium text-slate-300">({kanjis.length} chữ)</span>
            </h1>
          </div>

          {/* Premium Capsule Mode Switcher */}
          <div className="bg-slate-50/70 p-1.5 rounded-2xl flex flex-wrap items-center border border-slate-100/50 self-start md:self-auto shadow-inner gap-y-1">
            <button onClick={() => setActiveMode('list')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'list' ? 'bg-black text-white shadow-md' : 'text-slate-400 hover:text-black'}`}>Danh sách</button>
            <button onClick={() => setActiveMode('flashcard')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'flashcard' ? 'bg-black text-white shadow-md' : 'text-slate-400 hover:text-black'}`}>Flashcard</button>
            <button onClick={() => setActiveMode('quiz')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'quiz' ? 'bg-black text-white shadow-md' : 'text-slate-400 hover:text-black'}`}>Trắc nghiệm</button>
            <button onClick={() => setActiveMode('typing')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'typing' ? 'bg-black text-white shadow-md' : 'text-slate-400 hover:text-black'}`}>Gõ phím</button>
            <button onClick={() => setActiveMode('drawing')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'drawing' ? 'bg-black text-white shadow-md' : 'text-slate-400 hover:text-black'}`}>Luyện viết</button>
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
                className="w-full px-5 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-slate-300 focus:bg-white transition-all text-xs font-semibold"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-8 h-8 border-3 border-slate-100 border-t-black rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang tải...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredKanjis.map((kanji, index) => (
                  <div
                    key={kanji.id}
                    onClick={() => handleOpenDetail(kanji)}
                    className="group relative bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:-translate-y-1 rounded-3xl p-6 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer h-52 shadow-sm"
                  >
                    {/* Index leading zero badge */}
                    <span className="absolute top-4 left-4 text-[9px] font-black text-slate-200 uppercase tracking-widest">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Bookmark Heart Button */}
                    <button
                      onClick={(e) => handleAddFlashcard(kanji, e)}
                      className="absolute top-3 right-3 p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-full transition-all duration-300 scale-90 group-hover:scale-100 z-10"
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
                      <h2 className="text-5xl font-black text-slate-900 group-hover:scale-105 transition-transform duration-300 select-none">
                        {kanji.character}
                      </h2>
                    </div>

                    {/* Meta Footer */}
                    <div className="w-full text-center space-y-1.5 pt-3 mt-auto border-t border-slate-50">
                      <span className="inline-block font-black text-slate-800 uppercase tracking-wider text-[10px]">
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
                      className="absolute inset-0 bg-white border border-slate-150 shadow-xl shadow-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-8"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <span className="absolute top-6 left-6 text-xs font-black text-slate-200 uppercase tracking-wider">
                        KANJI
                      </span>
                      <span className="text-8xl font-black text-slate-900 tracking-tight">{filteredKanjis[flashcardIndex].character}</span>
                      <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] mt-10">
                        Chạm để lật thẻ
                      </p>
                    </div>

                    {/* Back Face */}
                    <div 
                      className="absolute inset-0 bg-white border border-slate-150 shadow-xl shadow-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center"
                      style={{ 
                        backfaceVisibility: 'hidden', 
                        transform: 'rotateY(180deg)' 
                      }}
                    >
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block mb-1">
                        ÂM HÁN VIỆT
                      </span>
                      <h3 className="text-4xl font-extrabold text-slate-950 uppercase tracking-wide leading-none mb-4">
                        {filteredKanjis[flashcardIndex].hanviet || 'CHƯA CÓ'}
                      </h3>
                      
                      <div className="space-y-1.5 mb-6">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Ý NGHĨA</span>
                        <p className="text-base text-slate-600 font-bold italic leading-relaxed">
                          {filteredKanjis[flashcardIndex].meaning || 'Chưa cập nhật'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs">
                        <div>
                          <span className="font-black text-[9px] text-slate-400 uppercase tracking-widest block mb-0.5">Onyomi</span>
                          <span className="font-bold text-slate-800">{filteredKanjis[flashcardIndex].onyomi || '—'}</span>
                        </div>
                        <div>
                          <span className="font-black text-[9px] text-slate-400 uppercase tracking-widest block mb-0.5">Kunyomi</span>
                          <span className="font-bold text-slate-800">{filteredKanjis[flashcardIndex].kunyomi || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between max-w-md mx-auto">
                  <button onClick={handlePrevFlashcard} className="border border-black hover:bg-black hover:text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all">Trước</button>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thẻ {flashcardIndex + 1} / {filteredKanjis.length}</span>
                  <button onClick={handleNextFlashcard} className="border border-black hover:bg-black hover:text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all">Sau</button>
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
              <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 md:p-12 text-center space-y-6 max-w-md mx-auto shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">KẾT QUẢ ĐẠT ĐƯỢC</h3>
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-inner border border-slate-100">
                  <span className="text-3xl font-black text-slate-800">{quizScore}/{quizQuestions.length}</span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bạn đã xuất sắc trả lời đúng {Math.round((quizScore / quizQuestions.length) * 100)}% số câu hỏi!</p>
                <button onClick={generateQuiz} className="bg-black text-white hover:bg-slate-800 w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center">Luyện tập lại</button>
              </div>
            ) : (
              <div className="space-y-8 max-w-md mx-auto">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Câu hỏi {quizIndex + 1} / {quizQuestions.length}</span>
                  <span className="text-emerald-500">Đúng: {quizScore}</span>
                </div>

                <div className="bg-white border border-slate-150 rounded-[2.5rem] p-8 text-center shadow-lg shadow-slate-100">
                  <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider block mb-2">Hỏi chữ Hán</span>
                  <span className="text-7xl font-black text-slate-950 block">{quizQuestions[quizIndex]?.kanji.character}</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">Chữ Hán trên có âm Hán Việt là gì?</p>
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

                <div className="bg-white border border-slate-150 rounded-[2.5rem] p-8 text-center shadow-lg shadow-slate-100 flex flex-col items-center">
                  <span className="text-8xl font-black text-slate-950 block mb-4 select-none">{filteredKanjis[typingIndex]?.character}</span>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Ý nghĩa gợi ý</span>
                  <p className="text-base text-slate-500 font-bold italic leading-none">{filteredKanjis[typingIndex]?.meaning || '—'}</p>
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
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-md shadow-emerald-500/5'
                        : typingFeedback === 'incorrect'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-md shadow-rose-500/5 focus:ring-2 focus:ring-rose-200'
                        : 'bg-slate-50 border-slate-150 focus:bg-white focus:ring-2 focus:ring-slate-100'
                    }`}
                  />

                  <div className="flex gap-3">
                    <button type="button" onClick={handleSkipTyping} className="flex-1 py-3.5 border border-slate-200 hover:border-black rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">Bỏ qua & xem kết quả</button>
                    <button type="submit" disabled={typingFeedback === 'correct'} className="flex-1 py-3.5 bg-black hover:bg-slate-800 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95">Xác nhận kết quả</button>
                  </div>
                </form>

                {typingFeedback === 'incorrect' && (
                  <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl text-center">
                    <p className="text-xs text-amber-800 font-bold leading-relaxed">❌ Nhập chưa chính xác! Gợi ý đáp án đúng: <span className="uppercase text-sm font-black text-slate-900 tracking-wider underline">{filteredKanjis[typingIndex]?.hanviet}</span></p>
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
          width={580}
          centered
          className="premium-kanji-modal"
          bodyStyle={{ padding: 0 }}
        >
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white">
            <div className="h-2 w-full bg-gradient-to-r from-slate-200 to-slate-900"></div>

            <div className="p-8 md:p-10 space-y-8">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase bg-slate-50 px-3 py-1 rounded-full">
                  {book ? book.title : ''} {selectedKanji.page ? `• Trang ${selectedKanji.page}` : ''}
                </span>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-xs font-bold text-slate-400 hover:text-black uppercase tracking-widest transition-colors"
                >
                  Đóng
                </button>
              </div>

              {/* Character Details */}
              <div className="flex items-center gap-8 border-b border-slate-50 pb-8">
                <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center shadow-inner">
                  <span className="text-6xl font-black text-slate-900 select-none">{selectedKanji.character}</span>
                </div>

                <div className="space-y-1.5 flex-1">
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-widest block">HÁN VIỆT</span>
                  <h3 className="text-3xl font-black text-slate-950 uppercase tracking-wider leading-none">
                    {selectedKanji.hanviet || 'CHƯA CÓ'}
                  </h3>
                  <p className="text-base text-slate-500 font-medium italic mt-1 leading-normal">
                    {selectedKanji.meaning || 'Nghĩa chưa được cập nhật'}
                  </p>
                </div>
              </div>

              {/* Readings Block */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-150 text-left">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Âm On (Onyomi)</span>
                  <p className="text-base font-bold text-slate-900">{selectedKanji.onyomi || '—'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Âm Kun (Kunyomi)</span>
                  <p className="text-base font-bold text-slate-700">{selectedKanji.kunyomi || '—'}</p>
                </div>
              </div>

              {/* Examples Block */}
              <div className="space-y-3 text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ví dụ minh họa & Từ vựng ghép</span>
                
                {selectedKanji.examples ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 max-h-[160px] overflow-y-auto space-y-3 scrollbar-thin">
                    {selectedKanji.examples.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                      <div key={idx} className="flex gap-3 items-start text-sm">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                        <p className="text-slate-700 font-medium leading-relaxed">{line}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-100 bg-slate-50/20 rounded-3xl">
                    <p className="text-slate-400 text-xs italic">Chưa có ví dụ mẫu.</p>
                  </div>
                )}
              </div>

              {/* Bookmark Save Action Button inside modal */}
              <div className="pt-2">
                <button
                  onClick={() => handleAddFlashcard(selectedKanji)}
                  className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
                    addedKanjiIds.has(selectedKanji.id)
                      ? 'bg-rose-50 text-rose-500 border border-rose-100 shadow-rose-500/5 cursor-default'
                      : 'bg-black text-white hover:bg-slate-800 shadow-black/10'
                  }`}
                >
                  {addedKanjiIds.has(selectedKanji.id) ? (
                    <>
                      <HeartFilled className="text-rose-500 text-xs" />
                      Đã lưu trong Sổ tay ôn tập ❤️
                    </>
                  ) : (
                    <>
                      <HeartOutlined className="text-rose-400 text-xs" />
                      Lưu vào Sổ tay ôn tập ❤️
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
