import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, ArrowLeft, Volume2 } from 'lucide-react';
import grammarService from '../../api/grammarService';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

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
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quizInput, setQuizInput] = useState('');
  const [quizStatus, setQuizStatus] = useState('idle'); // idle, hint, correct, incorrect, revealed
  const [mcOptions, setMcOptions] = useState([]);
  const [mcSelected, setMcSelected] = useState(null);
  const [mcChecked, setMcChecked] = useState(false);

  const activeData = useMemo(() => {
    let data = grammarData;
    if (isShuffle) return [...data].sort(() => Math.random() - 0.5);
    return data;
  }, [grammarData, isShuffle]);

  useEffect(() => {
    fetchGrammar();
  }, [targetBookId]);

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

  // Keyboard navigation for Grammar Flashcards
  useEffect(() => {
    if ((activeMode !== 'flashcard' && activeMode !== 'cards') || activeData.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
          setIsFlipped(false);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < activeData.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsFlipped(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, currentIndex, activeData, isFlipped]);

  useEffect(() => {
    if (activeMode === 'multiple_choice' && activeData[currentIndex]) {
      const correctOption = activeData[currentIndex].quiz.answer;
      const uniqueAnswers = Array.from(new Set(grammarData.map(item => item.quiz.answer)));
      let otherOptions = uniqueAnswers.filter(ans => ans !== correctOption);
      otherOptions = otherOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
      const allOptions = [correctOption, ...otherOptions].sort(() => 0.5 - Math.random());

      setMcOptions(allOptions);
      setMcSelected(null);
      setMcChecked(false);
    }
  }, [activeMode, currentIndex, activeData, grammarData]);

  useEffect(() => {
    if (activeMode !== 'multiple_choice' || mcOptions.length === 0) return;

    const handleKeyDown = (e) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (idx < mcOptions.length && !mcChecked) {
          setMcSelected(mcOptions[idx]);
          setMcChecked(true);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (mcChecked) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, mcOptions, mcSelected, mcChecked]);

  const fetchGrammar = async () => {
    try {
      const response = await grammarService.getAll();
      let data = response.data;
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
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
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

    if (!sentence || !pattern) return sentence || '';
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
    return <span className="whitespace-pre-wrap">{sentence} <span className="text-slate-400 dark:text-slate-500 mx-1">_____</span></span>;
  };

  const handleQuizSubmit = () => {
    if (quizStatus === 'correct' || quizStatus === 'revealed' || quizStatus === 'incorrect') {
      handleNext();
      return;
    }

    if (!quizInput.trim()) {
      if (quizStatus === 'idle') {
        setQuizStatus('hint');
      } else if (quizStatus === 'hint') {
        setQuizStatus('revealed');
      }
      return;
    }

    const currentAnswer = activeData[currentIndex]?.quiz?.answer || '';
    const cleanAnswer = currentAnswer.replace(/[～~]/g, '').trim().toLowerCase();
    const cleanInput = quizInput.replace(/[～~]/g, '').trim().toLowerCase();

    if (cleanInput.length > 0 && (cleanInput === cleanAnswer || cleanAnswer.includes(cleanInput))) {
      setQuizStatus('correct');
    } else {
      setQuizStatus('incorrect');
    }
  };

  const handleQuizKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuizSubmit();
    }
  };

  const handleMcSelect = (option) => {
    if (mcChecked) return;
    setMcSelected(option);
    setMcChecked(true);
  };

  const handleMcSubmit = () => {
    if (mcChecked) {
      handleNext();
    } else {
      if (mcSelected) {
        setMcChecked(true);
      }
    }
  };

  const handleResetProgress = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setQuizInput('');
    setQuizStatus('idle');
    setMcSelected(null);
    setMcChecked(false);
  };

  const handleToggleShuffle = () => {
    setIsShuffle(!isShuffle);
    setCurrentIndex(0);
    setIsFlipped(false);
    setQuizInput('');
    setQuizStatus('idle');
    setMcSelected(null);
    setMcChecked(false);
  };

  const MenuScreen = (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Selection grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-900 pb-4">
          <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">CHỌN CHẾ ĐỘ HỌC</p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">XÁO TRỘN</span>
            <button
              onClick={handleToggleShuffle}
              className={`relative w-12 h-6 rounded-full transition-all duration-500 shadow-inner ${isShuffle ? 'bg-black dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-500 shadow-sm ${isShuffle ? 'left-7 bg-white dark:bg-black' : 'left-1 bg-white dark:bg-black'}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'cards', label: 'FLASHCARD' },
            { id: 'quiz', label: 'LUYỆN TẬP' },
            { id: 'multiple_choice', label: 'TRẮC NGHIỆM' },
            { id: 'listening', label: 'NGHE ĐIỀN' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className="flex items-center justify-center py-4 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-slate-950 transition-all duration-300 hover:shadow-md active:scale-95 group"
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Integrated Grammar List Section */}
      <div id="grammar-list-section" className="space-y-8 pt-8 border-t border-slate-50 dark:border-slate-900">
        <div className="flex justify-between items-center pb-2">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white uppercase italic">DANH SÁCH NGỮ PHÁP</h2>
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">NHẤN VÀO CẤU TRÚC ĐỂ XEM CHI TIẾT VÍ DỤ</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm cấu trúc..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-b border-slate-100 dark:border-slate-800 bg-transparent outline-none font-medium text-slate-900 dark:text-white text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {activeData.filter(i => i.pattern.toLowerCase().includes(searchTerm.toLowerCase())).map((item, idx) => (
            <div
              key={item.id}
              onClick={() => toggleExpand(item.id)}
              className={`p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer select-none ${expandedId === item.id ? 'border-black dark:border-white ring-2 ring-black/5 dark:ring-white/5 shadow-lg' : 'hover:shadow-md'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-black text-slate-200 dark:text-slate-700 w-6">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold italic tracking-tight text-slate-900 dark:text-white">{item.pattern}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{item.meaning}</p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider">
                  {item.level || 'N3'}
                </div>
              </div>

              {/* Expandable Section */}
              <div className={`overflow-hidden transition-all duration-300 ${expandedId === item.id ? 'max-h-96 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-4">
                  {item.explanation && (
                    <div className="space-y-1">
                      <h4 className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Cách dùng & Giải thích</h4>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{item.explanation}</p>
                    </div>
                  )}
                  {item.exampleSentence && (
                    <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-900">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Ví dụ thực tế</h4>
                        <button
                          onClick={(e) => playAudio(e, item.exampleSentence)}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors group/audio"
                          title="Nghe phát âm"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-slate-400 group-hover/audio:text-slate-900 dark:group-hover/audio:text-white" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap">{item.exampleSentence}</p>
                      {item.exampleMeaning && (
                        <p className="text-xs italic text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{item.exampleMeaning}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleNext = () => {
    if (currentIndex < activeData.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setQuizInput('');
      setQuizStatus('idle');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
      setQuizInput('');
      setQuizStatus('idle');
    }
  };

  const FlashcardScreen = (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      {/* Top Navigation */}
      <div className="flex justify-between items-center px-2">
        <button
          onClick={() => { setActiveMode('menu'); setIsFlipped(false); }}
          className="group flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white uppercase tracking-[0.2em] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          QUAY LẠI MENU
        </button>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:inline">
            TIẾN TRÌNH: {currentIndex + 1} / {activeData.length}
          </span>
          <button
            onClick={handleToggleShuffle}
            className={`px-3 py-1 border rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isShuffle ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
          >
            XÁO TRỘN
          </button>
          <button
            onClick={handleResetProgress}
            className="px-3 py-1 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
          >
            HỌC LẠI
          </button>
        </div>
      </div>

      <div className="h-1.5 bg-slate-50 dark:bg-slate-900 w-full rounded-full overflow-hidden border border-slate-100/50 dark:border-slate-900/50">
        <div
          className="h-full bg-black dark:bg-white transition-all duration-500 rounded-full"
          style={{ width: `${((currentIndex + 1) / (activeData.length || 1)) * 100}%` }}
        />
      </div>

      <div className="perspective h-[350px] sm:h-[400px]">
        <div
          key={currentIndex}
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full h-full duration-700 preserve-3d shadow-xl rounded-[2.5rem] cursor-pointer ${isFlipped ? 'rotate-y-180' : 'hover:scale-[1.01]'}`}
        >
          <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center shadow-inner">
            <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border border-slate-100 dark:border-slate-900">
              {activeData[currentIndex]?.level || 'N3'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-955 dark:text-white mb-6 tracking-tight leading-relaxed">
              {activeData[currentIndex]?.pattern}
            </h2>
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] animate-pulse mt-4">NHẤN ĐỂ LẬT THẺ</p>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center shadow-inner">
            <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-4">
              CẤU TRÚC: {activeData[currentIndex]?.pattern}
            </span>

            <div className="h-px w-12 bg-slate-100 dark:bg-slate-800 mb-6" />

            <h3 className="text-xl sm:text-2xl font-black italic text-slate-950 dark:text-white mb-4">
              {activeData[currentIndex]?.meaning}
            </h3>

            {activeData[currentIndex]?.explanation && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                {activeData[currentIndex]?.explanation}
              </p>
            )}

            {activeData[currentIndex]?.exampleSentence && (
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 text-left w-full max-w-md">
                <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest block mb-1">VÍ DỤ</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap">{activeData[currentIndex]?.exampleSentence}</p>
                {activeData[currentIndex]?.exampleMeaning && (
                  <p className="text-[11px] italic text-slate-400 dark:text-slate-500 leading-relaxed mt-0.5 whitespace-pre-wrap">{activeData[currentIndex]?.exampleMeaning}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-between items-center gap-4 px-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-700 hover:text-black dark:text-slate-300 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" /> QUAY LẠI
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === activeData.length - 1}
          className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          TIẾP THEO <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const QuizScreen = (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      {/* Top Navigation */}
      <div className="flex justify-between items-center px-2">
        <button
          onClick={() => { setActiveMode('menu'); setQuizStatus('idle'); setQuizInput(''); }}
          className="group flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white uppercase tracking-[0.2em] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          QUAY LẠI MENU
        </button>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:inline">
            CÂU: {currentIndex + 1} / {activeData.length}
          </span>
          <button
            onClick={handleToggleShuffle}
            className={`px-3 py-1 border rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isShuffle ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
          >
            XÁO TRỘN
          </button>
          <button
            onClick={handleResetProgress}
            className="px-3 py-1 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
          >
            LÀM LẠI
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-50 dark:bg-slate-900 w-full rounded-full overflow-hidden border border-slate-100/50 dark:border-slate-900/50">
        <div
          className="h-full bg-black dark:bg-white transition-all duration-500 rounded-full"
          style={{ width: `${((currentIndex + 1) / (activeData.length || 1)) * 100}%` }}
        />
      </div>

      {/* Quiz Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
        {quizStatus === 'correct' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 animate-pulse"></div>
        )}
        {quizStatus === 'incorrect' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 animate-pulse"></div>
        )}

        <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider mb-8 inline-block border border-slate-100 dark:border-slate-900">
          ĐIỀN NGỮ PHÁP PHÙ HỢP
        </span>

        <div className="space-y-6 mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {activeData[currentIndex] && getQuizSentence(activeData[currentIndex].quiz.sentence, activeData[currentIndex].quiz.quizSentence, activeData[currentIndex].quiz.answer)}
          </h2>
          <p className="text-sm italic text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
            {activeData[currentIndex]?.quiz.translation}
          </p>
        </div>

        <div className="max-w-sm mx-auto space-y-4">
          <input
            type="text"
            value={quizInput}
            onChange={(e) => setQuizInput(e.target.value)}
            onKeyDown={handleQuizKeyDown}
            readOnly={quizStatus === 'correct' || quizStatus === 'revealed' || quizStatus === 'incorrect'}
            placeholder="Nhập ngữ pháp..."
            className={`w-full text-center px-6 py-4 bg-slate-50 dark:bg-slate-950 border-2 rounded-2xl outline-none font-bold text-lg transition-all
              ${quizStatus === 'correct' ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' :
                quizStatus === 'incorrect' ? 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30' :
                  quizStatus === 'revealed' ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30' :
                    'border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white'}`}
            autoFocus
          />

          {quizStatus === 'hint' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium animate-in fade-in">
              Gợi ý: Cấu trúc này có nghĩa là "{activeData[currentIndex]?.meaning}"
            </div>
          )}

          {(quizStatus === 'correct' || quizStatus === 'revealed' || quizStatus === 'incorrect') && (
            <div className="space-y-4 animate-in fade-in">
              <div className={`p-4 rounded-xl ${quizStatus === 'correct' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' :
                quizStatus === 'incorrect' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300' :
                  'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                }`}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">
                  {quizStatus === 'correct' ? 'CHÍNH XÁC!' : quizStatus === 'incorrect' ? 'CHƯA CHÍNH XÁC - ĐÁP ÁN' : 'ĐÁP ÁN'}
                </p>
                <p className="text-xl font-bold">{activeData[currentIndex]?.quiz.answer}</p>
                {activeData[currentIndex]?.explanation && (
                  <p className="text-xs mt-2 opacity-80">{activeData[currentIndex].explanation}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-between items-center gap-4 px-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-700 hover:text-black dark:text-slate-300 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" /> QUAY LẠI
        </button>

        <button
          onClick={handleQuizSubmit}
          className={`flex-1 py-4 text-white disabled:opacity-40 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95
            ${(quizStatus === 'correct' || quizStatus === 'revealed' || quizStatus === 'incorrect')
              ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 border border-black dark:border-white'
              : 'bg-black dark:bg-white text-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 border border-black dark:border-white'}`}
        >
          {(quizStatus === 'correct' || quizStatus === 'revealed' || quizStatus === 'incorrect') ? (
            <>TIẾP THEO <ChevronRight className="w-4 h-4" /></>
          ) : (
            'KIỂM TRA (ENTER)'
          )}
        </button>
      </div>
    </div>
  );

  const MultipleChoiceScreen = (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      {/* Top Navigation */}
      <div className="flex justify-between items-center px-2">
        <button
          onClick={() => { setActiveMode('menu'); }}
          className="group flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white uppercase tracking-[0.2em] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          QUAY LẠI MENU
        </button>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:inline">
            CÂU: {currentIndex + 1} / {activeData.length}
          </span>
          <button
            onClick={handleToggleShuffle}
            className={`px-3 py-1 border rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isShuffle ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}
          >
            XÁO TRỘN
          </button>
          <button
            onClick={handleResetProgress}
            className="px-3 py-1 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
          >
            LÀM LẠI
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-50 dark:bg-slate-900 w-full rounded-full overflow-hidden border border-slate-100/50 dark:border-slate-900/50">
        <div
          className="h-full bg-black dark:bg-white transition-all duration-500 rounded-full"
          style={{ width: `${((currentIndex + 1) / (activeData.length || 1)) * 100}%` }}
        />
      </div>

      {/* MC Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-sm relative overflow-hidden">
        {mcChecked && mcSelected === activeData[currentIndex]?.quiz.answer && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 animate-pulse"></div>
        )}
        {mcChecked && mcSelected !== activeData[currentIndex]?.quiz.answer && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 animate-pulse"></div>
        )}

        <div className="text-center mb-10">
          <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider mb-8 inline-block border border-slate-100 dark:border-slate-900">
            CHỌN ĐÁP ÁN ĐÚNG
          </span>

          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {activeData[currentIndex] && getQuizSentence(activeData[currentIndex].quiz.sentence, activeData[currentIndex].quiz.quizSentence, activeData[currentIndex].quiz.answer)}
            </h2>
            <p className="text-sm italic text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
              {activeData[currentIndex]?.quiz.translation}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          {mcOptions.map((opt, idx) => {
            const isCorrect = opt === activeData[currentIndex]?.quiz.answer;
            const isSelected = mcSelected === opt;
            let btnClass = "border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950";

            if (mcChecked) {
              if (isCorrect) {
                btnClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20";
              } else if (isSelected && !isCorrect) {
                btnClass = "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300";
              } else {
                btnClass = "border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-50";
              }
            } else if (isSelected) {
              btnClass = "border-black dark:border-white bg-slate-50 dark:bg-slate-900 text-black dark:text-white ring-2 ring-black/10 dark:ring-white/10";
            }

            return (
              <button
                key={idx}
                onClick={() => handleMcSelect(opt)}
                disabled={mcChecked}
                className={`py-4 px-6 rounded-2xl border-2 font-bold text-[15px] transition-all duration-300 ${btnClass} active:scale-95 flex items-center justify-center gap-3 relative`}
              >
                <span className="absolute left-4 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] flex items-center justify-center font-black text-slate-400">{idx + 1}</span>
                {opt}
              </button>
            );
          })}
        </div>

        {mcChecked && (
          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 animate-in fade-in text-center">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500">GIẢI THÍCH</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white mr-2">{activeData[currentIndex]?.quiz.answer}</span>
              {activeData[currentIndex]?.explanation || "Cấu trúc này có nghĩa là: " + activeData[currentIndex]?.meaning}
            </p>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-between items-center gap-4 px-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-700 hover:text-black dark:text-slate-300 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" /> QUAY LẠI
        </button>

        <button
          onClick={handleMcSubmit}
          disabled={!mcSelected && !mcChecked}
          className={`flex-1 py-4 text-white disabled:opacity-40 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95
            ${mcChecked
              ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100'
              : 'bg-black dark:bg-white text-white dark:text-black hover:bg-slate-900 dark:hover:bg-slate-100 border border-black dark:border-white'}`}
        >
          {mcChecked ? (
            <>TIẾP THEO <ChevronRight className="w-4 h-4" /></>
          ) : (
            'KIỂM TRA (ENTER)'
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-4 sm:px-6 md:px-20 pt-32 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto space-y-12">
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
              <div className="relative pl-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-black dark:bg-white rounded-full" />
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic leading-none">
                  NGỮ PHÁP
                </h1>
                <p className="text-[10px] font-black text-slate-200 dark:text-slate-800 mt-1 uppercase tracking-[0.3em]">
                  {grammarData[0]?.book?.levelLabel || ''}
                </p>
              </div>
            )}

            {/* Main Interface */}
            <div className="pt-6">
              {activeMode === 'menu' ? MenuScreen : (
                activeMode === 'flashcard' || activeMode === 'cards' ? FlashcardScreen : (
                  activeMode === 'quiz' ? QuizScreen : (
                    activeMode === 'multiple_choice' ? MultipleChoiceScreen : (
                      <div className="py-40 text-center space-y-6">
                        <p className="text-2xl font-black italic text-slate-200">CHẾ ĐỘ ĐANG CẬP NHẬT</p>
                        <button onClick={() => setActiveMode('menu')} className="px-8 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">QUAY LẠI</button>
                      </div>
                    )
                  )
                )
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
