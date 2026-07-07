import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, ArrowLeft, Volume2, ChevronDown } from 'lucide-react';
import grammarService from '../../api/grammarService';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import StudyMenu from './components/StudyMenu';
import FlashcardMode from './components/FlashcardMode';
import QuizMode from './components/QuizMode';
import MultipleChoiceMode from './components/MultipleChoiceMode';

export default function StudyPage() {
  const { bookId } = useParams();
  const [searchParams] = useSearchParams();
  const targetBookId = bookId || searchParams.get('bookId');
  const navigate = useNavigate();
  const { fetchWithAuth, currentUser } = useAuth();

  const [grammarData, setGrammarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState('menu');
  const [expandedId, setExpandedId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const unitParam = searchParams.get('unit');
  const [selectedLesson, setSelectedLesson] = useState(unitParam || '');

  const uniqueLessons = useMemo(() => {
    const lessons = new Set();
    grammarData.forEach(g => {
      if (g.unit) lessons.add(g.unit);
    });
    return Array.from(lessons).sort((a, b) => a - b);
  }, [grammarData]);

  const activeData = useMemo(() => {
    let data = grammarData;
    if (selectedLesson) {
      data = data.filter(item => item.unit && item.unit.toString() === selectedLesson.toString());
    }

    data = [...data].sort((a, b) => {
      const unitA = parseInt(a.unit) || 0;
      const unitB = parseInt(b.unit) || 0;
      if (unitA !== unitB) return unitA - unitB;
      // respect curriculum sortOrder first, fall back to day
      const sortA = a.sortOrder != null ? a.sortOrder : (parseInt(a.day) || 0);
      const sortB = b.sortOrder != null ? b.sortOrder : (parseInt(b.day) || 0);
      return sortA - sortB;
    });

    if (activeMode === 'quiz' || activeMode === 'multiple_choice' || activeMode === 'listening') {
      const flattened = [];
      data.forEach(item => {
        const sentences = (item.quiz?.sentence || '').split('\n').map(s => s.trim()).filter(Boolean);
        const quizSentences = (item.quiz?.quizSentence || '').split('\n').map(s => s.trim()).filter(Boolean);
        const translations = (item.quiz?.translation || '').split('\n').map(s => s.trim()).filter(Boolean);
        
        if (quizSentences.length > 0) {
          quizSentences.forEach((qSentence, idx) => {
            let matchedTranslation = '';
            let matchedSentence = '';
            
            const parts = qSentence.split(/_+/).map(p => p.trim()).filter(Boolean);
            if (parts.length > 0) {
              const matchIdx = sentences.findIndex(s => {
                let lastIdx = 0;
                for (const part of parts) {
                  const currentIdx = s.indexOf(part, lastIdx);
                  if (currentIdx === -1) return false;
                  lastIdx = currentIdx + part.length;
                }
                return true;
              });
              
              if (matchIdx !== -1) {
                matchedTranslation = translations[matchIdx] || '';
                matchedSentence = sentences[matchIdx] || '';
              }
            }
            
            flattened.push({
              ...item,
              id: `${item.id}_q_${idx}`,
              quiz: {
                ...item.quiz,
                sentence: matchedSentence || qSentence.replace(/_+/g, '...'),
                quizSentence: qSentence,
                translation: matchedTranslation
              }
            });
          });
        } else if (sentences.length > 0) {
          sentences.forEach((sentence, idx) => {
            flattened.push({
              ...item,
              id: `${item.id}_${idx}`,
              quiz: {
                ...item.quiz,
                sentence: sentence,
                quizSentence: '',
                translation: translations[idx] || ''
              }
            });
          });
        } else {
          flattened.push(item);
        }
      });
      data = flattened;
    }

    if (isShuffle) return [...data].sort(() => Math.random() - 0.5);
    return data;
  }, [grammarData, isShuffle, selectedLesson, activeMode]);

  useEffect(() => {
    fetchGrammar();
  }, [targetBookId]);



  useEffect(() => {
    if (activeData.length > 0 && targetBookId) {
      const bookTitle = grammarData[0]?.book?.title || 'Ngữ pháp';
      const quickAccessData = {
        title: `Ngữ pháp ${bookTitle}${selectedLesson ? ` - Bài ${selectedLesson}` : ''}`,
        url: `/grammar/study?bookId=${targetBookId}${selectedLesson ? `&unit=${selectedLesson}` : ''}`
      };

      localStorage.setItem('quickAccess', JSON.stringify(quickAccessData));
      
      if (currentUser) {
        fetchWithAuth(`${API_BASE_URL}/progress/quickAccess`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: JSON.stringify(quickAccessData) })
        }).catch(() => {});
      }
    }
  }, [targetBookId, selectedLesson, activeData, grammarData, currentUser, fetchWithAuth]);

  // Sync Progress to Backend
  const progressKey = `grammar_${targetBookId}`;

  useEffect(() => {
    if (currentUser && activeData.length > 0 && targetBookId) {
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
  }, [targetBookId, activeData.length, currentUser]);

  useEffect(() => {
    if (currentUser && targetBookId && activeMode !== 'menu' && activeMode !== 'list') {
      const state = { currentIndex, activeMode };
      fetchWithAuth(`${API_BASE_URL}/progress/${progressKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: JSON.stringify(state) })
      }).catch(() => { });
    }
  }, [currentIndex, activeMode, targetBookId, currentUser]);


  useEffect(() => {
    const handleDataChanged = () => fetchGrammar(true);
    window.addEventListener('GLOBAL_DATA_CHANGED', handleDataChanged);
    return () => window.removeEventListener('GLOBAL_DATA_CHANGED', handleDataChanged);
  }, [targetBookId]);

  const fetchGrammar = async (isBackground = false) => {
    try {
      // Don't show loading spinner for background syncs
      if (!isBackground) setLoading(true);
      const response = await grammarService.getAll();
      let data = response.data;
      
      const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'ROLE_ADMIN';
      if (!isAdmin) {
        data = data.filter(item => item.publish !== false && (!item.book || item.book.publishGrammar !== false));
      }

      if (targetBookId) {
        data = data.filter(item => item.book && String(item.book.id) === String(targetBookId));
      }
      const mapped = data.map(item => ({
        ...item,
        pattern: item.structure,
        unit: parseInt(item.week || item.unit || item.lesson || 1),
        examples: [{ jp: item.exampleSentence, vn: item.exampleMeaning }],
        quiz: { sentence: item.exampleSentence, quizSentence: item.quizSentence, translation: item.exampleMeaning, answer: item.structure }
      }));
      setGrammarData(mapped);
      if (!isBackground) setLoading(false);
    } catch (error) {
      console.error(error);
      if (!isBackground) setLoading(false);
    }
  };

  const toggleExpand = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const playAudio = (e, text) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getQuizSentence = (sentence, quizSentence, pattern) => {
    // Prioritize auto-generating the blank to preserve the verb stem
    if (sentence && pattern) {
      const options = pattern.split(/[/／]/);
      for (let opt of options) {
        let cleanPattern = opt.replace(/[A-Za-z\+＋\(\)（）～~【】\[\]\s\-]/g, '').trim();

        if (cleanPattern && cleanPattern.length > 0 && sentence.includes(cleanPattern)) {
          const parts = sentence.split(cleanPattern);
          return (
            <span className="whitespace-pre-wrap">
              {parts[0]}
              <span className="text-slate-400 dark:text-slate-500 mx-1">_____</span>
              {parts.slice(1).join(cleanPattern)}
            </span>
          );
        }
      }
    }

    // Fallback to DB provided quizSentence if pattern matching fails
    if (quizSentence && quizSentence.includes("_____")) {
      return (
        <span className="whitespace-pre-wrap">
          {quizSentence.split("_____").map((part, index, array) => (
            <span key={index}>
              {part}
              {index < array.length - 1 && <span className="text-slate-400 dark:text-slate-500 mx-1">_____</span>}
            </span>
          ))}
        </span>
      );
    }

    return <span className="whitespace-pre-wrap">{sentence || ''} <span className="text-slate-400 dark:text-slate-500 mx-1">_____</span></span>;
  };

  const handleResetProgress = () => {
    setCurrentIndex(0);
  };

  const handleToggleShuffle = () => {
    setIsShuffle(!isShuffle);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (currentIndex < activeData.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };



  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-4 sm:px-6 md:px-20 pt-40 md:pt-32 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Bar */}
        {activeMode === 'menu' && (
          <button
            onClick={() => navigate('/grammar')}
            className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 md:mb-8"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            QUAY LẠI
          </button>
        )}

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-[3px] border-slate-50 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Header Section */}
            {activeMode === 'menu' && (
              <div className="mb-8 md:mb-10">
                <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block mb-3">HỌC TẬP & LUYỆN TẬP</span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                    NGỮ PHÁP
                  </h1>
                  {grammarData[0]?.book?.title && (
                    <span className="hidden sm:inline text-slate-300 dark:text-slate-700 text-lg">|</span>
                  )}
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-none">
                    {grammarData[0]?.book?.title || ''}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-950 text-white dark:bg-white dark:text-black rounded-lg text-[9px] font-black tracking-widest uppercase shadow-sm self-start sm:self-auto">
                    {grammarData[0]?.book?.levelLabel || 'N3'}
                  </span>
                </div>
              </div>
            )}

            {/* Main Interface */}
            <div className="pt-6">
              {activeMode === 'menu' ? (
                <StudyMenu
                  activeData={activeData}
                  isShuffle={isShuffle}
                  handleToggleShuffle={handleToggleShuffle}
                  setActiveMode={setActiveMode}
                  setCurrentIndex={setCurrentIndex}
                  uniqueLessons={uniqueLessons}
                  selectedLesson={selectedLesson}
                  setSelectedLesson={setSelectedLesson}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  toggleExpand={toggleExpand}
                  expandedId={expandedId}
                  playAudio={playAudio}
                />
              ) : activeMode === 'flashcard' || activeMode === 'cards' ? (
                <FlashcardMode
                  activeData={activeData}
                  currentIndex={currentIndex}
                  setActiveMode={setActiveMode}
                  isShuffle={isShuffle}
                  handleToggleShuffle={handleToggleShuffle}
                  handleResetProgress={handleResetProgress}
                  handlePrev={handlePrev}
                  handleNext={handleNext}
                />
              ) : activeMode === 'quiz' ? (
                <QuizMode
                  activeData={activeData}
                  currentIndex={currentIndex}
                  setActiveMode={setActiveMode}
                  isShuffle={isShuffle}
                  handleToggleShuffle={handleToggleShuffle}
                  handleResetProgress={handleResetProgress}
                  handlePrev={handlePrev}
                  handleNext={handleNext}
                  getQuizSentence={getQuizSentence}
                />
              ) : activeMode === 'multiple_choice' ? (
                <MultipleChoiceMode
                  activeData={activeData}
                  grammarData={grammarData}
                  currentIndex={currentIndex}
                  setActiveMode={setActiveMode}
                  isShuffle={isShuffle}
                  handleToggleShuffle={handleToggleShuffle}
                  handleResetProgress={handleResetProgress}
                  handlePrev={handlePrev}
                  handleNext={handleNext}
                  getQuizSentence={getQuizSentence}
                />
              ) : (
                <div className="py-40 text-center space-y-6">
                  <p className="text-2xl font-black italic text-slate-200">CHẾ ĐỘ ĐANG CẬP NHẬT</p>
                  <button onClick={() => setActiveMode('menu')} className="px-8 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">QUAY LẠI</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .perspective { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
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