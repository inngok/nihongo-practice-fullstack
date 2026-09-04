import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, RefreshCw, Star } from 'lucide-react';

export default function StarQuizMode({
  activeData,
  currentIndex,
  setActiveMode,
  isShuffle,
  handleToggleShuffle,
  handleResetProgress,
  handlePrev,
  handleNext
}) {
  const [correctChunks, setCorrectChunks] = useState([]);
  const [shuffledChunks, setShuffledChunks] = useState([]);
  const [slots, setSlots] = useState([null, null, null, null]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const currentItem = activeData[currentIndex];

  useEffect(() => {
    setupQuiz();
  }, [currentIndex, activeData]);

  const setupQuiz = () => {
    setSlots([null, null, null, null]);
    setIsCorrect(null);
    setErrorMsg('');

    if (!currentItem || !currentItem.exampleSentence) {
      setErrorMsg('Không có câu ví dụ để tạo bài tập.');
      return;
    }

    // Extract first Japanese sentence
    let sentence = currentItem.exampleSentence.split('\n')[0].replace(/(。|！|？)$/, '').trim();
    
    // Segment using Intl.Segmenter
    try {
      const segmenter = new Intl.Segmenter('ja-JP', { granularity: 'word' });
      const segments = Array.from(segmenter.segment(sentence))
                            .map(s => s.segment)
                            .filter(s => s.trim().length > 0);

      if (segments.length < 4) {
        setErrorMsg('Câu ví dụ quá ngắn (dưới 4 từ), không thể tạo bài tập điền sao.');
        return;
      }

      const chunks = ['', '', '', ''];
      const baseSize = Math.floor(segments.length / 4);
      const extra = segments.length % 4;
      
      let currentIdx = 0;
      for (let i = 0; i < 4; i++) {
        const take = baseSize + (i < extra ? 1 : 0);
        chunks[i] = segments.slice(currentIdx, currentIdx + take).join('');
        currentIdx += take;
      }

      const chunkObjs = chunks.map((text, idx) => ({ id: idx, text }));
      setCorrectChunks(chunkObjs);

      // Shuffle
      const shuffled = [...chunkObjs].sort(() => Math.random() - 0.5);
      setShuffledChunks(shuffled);
    } catch (err) {
      console.error('Segmenter error:', err);
      setErrorMsg('Trình duyệt của bạn không hỗ trợ chia từ tiếng Nhật (Intl.Segmenter).');
    }
  };

  const handleSelectChunk = (chunk) => {
    if (isCorrect === true) return; // locked if already correct

    const emptyIdx = slots.findIndex(s => s === null);
    if (emptyIdx !== -1) {
      const newSlots = [...slots];
      newSlots[emptyIdx] = chunk;
      setSlots(newSlots);

      // Evaluate if full
      if (emptyIdx === 3) {
        evaluate(newSlots);
      }
    }
  };

  const handleUnselectSlot = (index) => {
    if (isCorrect === true) return;
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
    setIsCorrect(null);
  };

  const evaluate = (currentSlots) => {
    const isOk = currentSlots.every((slot, idx) => slot.id === idx);
    setIsCorrect(isOk);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto pb-24 sm:pb-0">
      {/* Top Navigation */}
      <div className="flex justify-between items-center px-2">
        <button
          onClick={() => setActiveMode('menu')}
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
            onClick={() => {
              handleResetProgress();
              setupQuiz();
            }}
            className="px-3 py-1 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> LÀM LẠI
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

      {/* Main Quiz Area */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-xl min-h-[400px] flex flex-col relative overflow-hidden">
        
        {/* Grammar Badge */}
        <div className="flex justify-center mb-6">
           <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider border border-slate-100 dark:border-slate-900">
             CẤU TRÚC: {currentItem?.pattern}
           </span>
        </div>

        {errorMsg ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-full flex items-center justify-center mb-2">
               <Star className="w-8 h-8 opacity-50" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">{errorMsg}</h3>
             <p className="text-sm text-slate-500">Hãy nhấn BỎ QUA để sang câu tiếp theo.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center">
            {/* Question (Vietnamese meaning) */}
            <div className="text-center mb-10 max-w-xl">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Ý NGHĨA CÂU</p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                "{currentItem?.exampleMeaning?.split('\n')[0]}"
              </h2>
            </div>

            {/* Answer Slots */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-12 w-full">
              {slots.map((slot, idx) => (
                <div 
                  key={idx} 
                  onClick={() => slot && handleUnselectSlot(idx)}
                  className={`relative flex flex-col items-center justify-end w-[70px] sm:w-[90px] h-[50px] border-b-[3px] transition-all cursor-pointer group
                    ${!slot ? 'border-slate-200 dark:border-slate-700 hover:border-slate-400' : 
                      (isCorrect === true ? 'border-emerald-500' : isCorrect === false ? 'border-rose-500' : 'border-black dark:border-white')
                    }
                  `}
                >
                  {/* Slot Number / Star */}
                  {!slot && (
                    <div className="absolute inset-0 flex items-center justify-center -translate-y-2">
                       {idx === 2 ? (
                         <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                       ) : (
                         <span className="text-slate-200 dark:text-slate-800 font-black text-xl">{idx + 1}</span>
                       )}
                    </div>
                  )}

                  {/* Filled Content */}
                  {slot && (
                    <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base pb-2 break-all text-center leading-tight group-hover:opacity-60 transition-opacity">
                      {slot.text}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Choices */}
            <div className="w-full flex flex-wrap justify-center gap-3 sm:gap-4 mt-auto">
              {shuffledChunks.map((chunk, idx) => {
                const isSelected = slots.some(s => s?.id === chunk.id);
                return (
                  <button
                    key={idx}
                    disabled={isSelected || isCorrect === true}
                    onClick={() => handleSelectChunk(chunk)}
                    className={`px-5 py-3 sm:py-4 rounded-2xl text-sm sm:text-base font-bold transition-all border-2
                      ${isSelected 
                        ? 'bg-slate-50 border-slate-100 text-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-700 opacity-50 scale-95' 
                        : 'bg-white border-slate-200 text-slate-800 hover:border-black hover:shadow-md dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:hover:border-white hover:-translate-y-1'
                      }
                    `}
                  >
                    {chunk.text}
                  </button>
                );
              })}
            </div>

            {/* Evaluation Result */}
            <div className={`mt-8 h-12 flex items-center justify-center transition-all duration-300 ${isCorrect !== null ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              {isCorrect === true ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest text-sm bg-emerald-50 dark:bg-emerald-950/30 px-6 py-2 rounded-full border border-emerald-100 dark:border-emerald-900">
                   <Star className="w-5 h-5 fill-emerald-500" /> CHÍNH XÁC!
                </div>
              ) : isCorrect === false ? (
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black uppercase tracking-widest text-sm bg-rose-50 dark:bg-rose-950/30 px-6 py-2 rounded-full border border-rose-100 dark:border-rose-900">
                   <RefreshCw className="w-5 h-5" /> CHƯA ĐÚNG, HÃY THỬ LẠI!
                </div>
              ) : null}
            </div>

          </div>
        )}
      </div>

      {/* Bottom Control Buttons */}
      <div className="flex justify-between items-center gap-4 px-2 sticky bottom-4 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md py-3 sm:py-0 rounded-2xl sm:static sm:bg-transparent sm:backdrop-blur-none shadow-sm sm:shadow-none border border-slate-100 dark:border-slate-800 sm:border-none">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-700 hover:text-black dark:text-slate-300 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          QUAY LẠI
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === activeData.length - 1}
          className={`flex-1 py-4 text-white dark:text-black disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95
            ${isCorrect === true ? 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-400 dark:hover:bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-black dark:bg-white hover:bg-slate-900 dark:hover:bg-slate-100'}
          `}
        >
          {errorMsg ? 'BỎ QUA' : 'TIẾP THEO'} <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
