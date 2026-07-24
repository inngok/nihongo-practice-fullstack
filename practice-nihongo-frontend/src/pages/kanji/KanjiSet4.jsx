import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import kanjiService from '../../api/kanjiService';
import bookService from '../../api/bookService';
import flashcardService from '../../api/flashcardService';
import { useAuth } from '../../context/AuthContext';
import { message, Modal } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import KanjiCanvas from './KanjiCanvas';
import KanjiListView from './components/KanjiListView';
import KanjiDetailModal from './components/KanjiDetailModal';
import KanjiVocabView from './components/KanjiVocabView';
import KanjiFlashcardView from './components/KanjiFlashcardView';
import KanjiQuizView from './components/KanjiQuizView';
import KanjiVocabQuizView from './components/KanjiVocabQuizView';
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

  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [vocabIndex, setVocabIndex] = useState(0);

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
          .some(field => field?.toLowerCase().includes(query)) ||
        (k.character && query.includes(k.character.toLowerCase()))
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
  }, [activeMode, flashcardIndex, vocabIndex, filteredKanjis, kanjiVocabs]);

  const handlePrevFlashcard = () => {
    if (filteredKanjis.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => setFlashcardIndex(prev => (prev - 1 + filteredKanjis.length) % filteredKanjis.length), 150);
  };

  const handleNextFlashcard = () => {
    if (filteredKanjis.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => setFlashcardIndex(prev => (prev + 1) % filteredKanjis.length), 150);
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
        </div>

        {/* Dynamic Page Pills Grid */}
        <div className="flex flex-wrap items-center gap-2.5 mb-10 max-w-4xl">
          <span className="text-[10px] font-black tracking-[0.25em] text-slate-300 dark:text-slate-700 uppercase mr-4">
            {formattedBookCode}
          </span>
          <button
            onClick={() => setSelectedPageFilter('all')}
            className={`w-10 h-10 text-[9px] font-black tracking-wider uppercase rounded-full transition-all flex items-center justify-center shrink-0 ${
              selectedPageFilter === 'all'
                ? 'bg-slate-950 text-white dark:bg-white dark:text-black shadow-sm'
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
            }`}
          >
            ALL
          </button>
          {uniquePages.map(p => {
            const [type, val] = p.split('_');
            const label = val;
            return (
              <button
                key={p}
                onClick={() => setSelectedPageFilter(p)}
                className={`w-10 h-10 text-[10px] font-black tracking-wider uppercase rounded-full transition-all flex items-center justify-center shrink-0 ${
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
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-12 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight md:leading-tight lg:leading-tight">
              <span className="mr-3">{book ? book.title : 'Đang tải...'}</span>
              <span className="text-base font-medium text-slate-400 dark:text-slate-600 whitespace-nowrap inline-block">({kanjis.length} chữ)</span>
            </h1>
          </div>

          {/* Premium Capsule Mode Switcher */}
          <div className="bg-slate-50/70 dark:bg-slate-900/50 p-1.5 rounded-2xl flex flex-wrap items-center border border-slate-100/50 dark:border-slate-800/50 self-start shadow-inner gap-1 max-w-full">
            <button onClick={() => setActiveMode('list')} className={`px-4 md:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeMode === 'list' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Danh sách</button>
            <button onClick={() => setActiveMode('flashcard')} className={`px-4 md:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeMode === 'flashcard' || activeMode === 'vocab' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Flashcard</button>
            <button onClick={() => setActiveMode('quiz')} className={`px-4 md:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeMode === 'quiz' || activeMode === 'vocab_quiz' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Trắc nghiệm</button>
            <button onClick={() => setActiveMode('typing')} className={`px-4 md:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeMode === 'typing' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Gõ phím</button>
            <button onClick={() => setActiveMode('drawing')} className={`px-4 md:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeMode === 'drawing' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white'}`}>Luyện viết</button>
          </div>
        </div>

        {/* --- VIEW 1: DANH SÁCH (TYPOGRAPHIC GRID) --- */}
        {activeMode === 'list' && (
          <KanjiListView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            loading={loading}
            hasAnyExamples={hasAnyExamples}
            filteredKanjis={filteredKanjis}
            handleOpenDetail={handleOpenDetail}
            handleAddFlashcard={handleAddFlashcard}
            addedKanjiIds={addedKanjiIds}
          />
        )}

        {/* --- VIEW 2 & 6: FLASHCARD & VOCAB SUB-SWITCHER --- */}
        {(activeMode === 'flashcard' || activeMode === 'vocab') && (
          <div className="flex justify-center mb-6 animate-fadeIn">
            <div className="bg-slate-100/80 p-1 rounded-2xl flex items-center border border-slate-200/40 shadow-inner">
              <button
                onClick={() => setActiveMode('flashcard')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeMode === 'flashcard'
                    ? 'bg-white text-slate-900 shadow-md border border-slate-200/10'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                Flashcard Hán tự
              </button>
              <button
                onClick={() => setActiveMode('vocab')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeMode === 'vocab'
                    ? 'bg-white text-slate-900 shadow-md border border-slate-200/10'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                Flashcard Từ vựng
              </button>
            </div>
          </div>
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
        {(activeMode === 'quiz' || activeMode === 'vocab_quiz') && (
          <div className="flex justify-center mb-6 animate-fadeIn">
            <div className="bg-slate-100/80 p-1 rounded-2xl flex items-center border border-slate-200/40 shadow-inner">
              <button
                onClick={() => setActiveMode('quiz')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeMode === 'quiz'
                    ? 'bg-white text-slate-900 shadow-md border border-slate-200/10'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                Trắc nghiệm Hán tự
              </button>
              <button
                onClick={() => setActiveMode('vocab_quiz')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeMode === 'vocab_quiz'
                    ? 'bg-white text-slate-900 shadow-md border border-slate-200/10'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                Trắc nghiệm Từ vựng
              </button>
            </div>
          </div>
        )}

        {activeMode === 'quiz' && (
          <KanjiQuizView filteredKanjis={filteredKanjis} />
        )}

        {/* --- VIEW 7: TRẮC NGHIỆM TỪ VỰNG --- */}
        {activeMode === 'vocab_quiz' && (
          <KanjiVocabQuizView
            kanjiVocabs={kanjiVocabs}
          />
        )}

        {/* --- VIEW 4: GÕ PHÍM --- */}
        {activeMode === 'typing' && (
          <KanjiTypingView filteredKanjis={filteredKanjis} />
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
      <KanjiDetailModal
        selectedKanji={selectedKanji}
        isDetailModalOpen={isDetailModalOpen}
        setIsDetailModalOpen={setIsDetailModalOpen}
        book={book}
        handleAddFlashcard={handleAddFlashcard}
        addedKanjiIds={addedKanjiIds}
      />

    </div>
  );
}
