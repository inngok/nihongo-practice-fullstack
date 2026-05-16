import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Check, Volume2, X } from 'lucide-react';
import vocabService from '../../api/vocabService';

export default function VocabStudy() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('bookId');

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
      setCurrentIndex(0);
      setFeedback(null);
      setUserInput('');
      setIsFlipped(false);
    }
  }, [activeData, activeMode]);

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
              className="group flex items-center justify-between p-7 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all border-b border-slate-50 dark:border-slate-900 last:border-none"
            >
              <div className="flex items-center gap-10">
                <span className="text-[11px] font-black text-slate-200 dark:text-slate-800 w-6">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <div className="flex items-baseline gap-6">
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white font-kanji group-hover:translate-x-1 transition-transform">
                    {item.word}
                  </h3>
                  <span className="text-sm font-bold text-slate-300 dark:text-slate-600 italic tracking-wider">
                    {item.reading}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[11px] font-black rounded-full uppercase tracking-wider group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                  {item.meaning}
                </div>
                {completedIds.includes(item.id) && <Check className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const StudyScreen = (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center px-4">
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
          Tiến trình: {currentIndex + 1} / {studyData.length}
        </span>
        <div className="h-1 bg-slate-100 dark:bg-slate-800 w-48 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black dark:bg-white transition-all duration-500" 
            style={{ width: `${((currentIndex + 1) / (studyData.length || 1)) * 100}%` }}
          />
        </div>
      </div>

      {activeMode === 'flashcard' ? (
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="perspective h-[450px] cursor-pointer group"
        >
          <div className={`relative w-full h-full transition-all duration-700 preserve-3d shadow-2xl rounded-[3rem] ${isFlipped ? 'rotate-y-180' : 'hover:scale-[1.01]'}`}>
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center">
              <h2 className="text-7xl font-black text-slate-900 dark:text-white font-kanji mb-8">
                {studyData[currentIndex]?.word}
              </h2>
              <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em] animate-pulse">NHẤN ĐỂ LẬT</p>
            </div>
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center">
              <span className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-4">{studyData[currentIndex]?.word}</span>
              <div className="h-px w-12 bg-slate-100 dark:bg-slate-800 mb-8" />
              <h3 className="text-4xl font-black italic text-slate-900 dark:text-white mb-4">{studyData[currentIndex]?.meaning}</h3>
              <p className="text-lg font-bold text-slate-400 dark:text-slate-500 italic uppercase">{studyData[currentIndex]?.reading}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-16 text-center space-y-12 shadow-sm">
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Dịch sang tiếng Nhật</span>
            <h2 className="text-4xl font-black italic text-slate-900 dark:text-white">"{studyData[currentIndex]?.meaning}"</h2>
          </div>
          
          <input
            autoFocus
            value={userInput}
            onChange={e => !feedback && setUserInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Nhập từ vựng..."
            className={`w-full max-w-md mx-auto py-6 px-10 rounded-full border-2 text-center text-2xl font-bold transition-all ${
              feedback === 'correct' ? 'border-emerald-500 text-emerald-500 bg-emerald-50/50' :
              feedback === 'incorrect' ? 'border-rose-500 text-rose-500 bg-rose-50/50' :
              'border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white bg-transparent'
            }`}
          />
          
          {feedback === 'incorrect' && (
            <p className="text-rose-500 font-bold animate-bounce">Đáp án: {studyData[currentIndex]?.word}</p>
          )}
        </div>
      )}

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => { if (currentIndex > 0) { setCurrentIndex(prev => prev - 1); setFeedback(null); setUserInput(''); setIsFlipped(false); }}}
          disabled={currentIndex === 0}
          className="flex-1 py-5 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-black dark:hover:border-white transition-all disabled:opacity-20"
        >
          QUAY LẠI
        </button>
        <button
          onClick={handleSubmit}
          className="flex-[2] py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase shadow-2xl hover:scale-[1.02] transition-all"
        >
          {feedback || activeMode === 'flashcard' ? (currentIndex === studyData.length - 1 ? 'KẾT THÚC' : 'TIẾP THEO') : 'KIỂM TRA'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-6 md:px-20 pt-32 pb-10 transition-colors">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Bar */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/vocabulary')}
            className="group flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full text-[10px] font-black text-slate-500 hover:text-black dark:hover:text-white uppercase tracking-widest transition-all shadow-sm active:scale-95"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            QUAY LẠI TỪ VỰNG
          </button>
        </div>

        {/* Header */}
        <div className="relative pl-6">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-black dark:bg-white rounded-full" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
            TỪ VỰNG - BÀI {selectedUnit}
          </h1>
          <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 mt-0.5 uppercase tracking-widest">
            {vocabData[0]?.book?.title || 'MINA NO NIHONGO'}
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
                  onClick={() => { setSelectedUnit(unit); setActiveMode('list'); }}
                  className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${
                    selectedUnit === unit 
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
            <div className="flex items-center bg-slate-50/50 dark:bg-slate-900/50 p-1.5 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800">
              {[
                { id: 'list', label: 'DANH SÁCH' },
                { id: 'flashcard', label: 'FLASHCARD' },
                { id: 'quiz', label: 'LUYỆN TẬP' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setActiveMode(m.id)}
                  className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                    activeMode === m.id 
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
          {loading ? (
            <div className="flex justify-center py-40">
              <div className="w-10 h-10 border-[3px] border-slate-50 border-t-black rounded-full animate-spin"></div>
            </div>
          ) : (activeMode === 'list' ? ListScreen : StudyScreen)}
        </div>
      </div>

      {showResults && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-16 text-center shadow-2xl max-w-sm w-full space-y-8">
            <h2 className="text-4xl font-black italic uppercase text-slate-900 dark:text-white">HOÀN THÀNH!</h2>
            <div className="py-8 border-y border-slate-50 dark:border-slate-800 text-6xl font-black italic">
              {score} <span className="text-2xl text-slate-200 dark:text-slate-700">/ {studyData.length}</span>
            </div>
            <button 
              onClick={() => { setShowResults(false); setActiveMode('list'); }}
              className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"
            >
              QUAY LẠI DANH SÁCH
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.5s ease-out forwards; }
        .perspective { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
}
