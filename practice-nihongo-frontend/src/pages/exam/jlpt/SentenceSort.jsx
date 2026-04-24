import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sentenceSortData } from '../data/sentenceSortData';

export default function SentenceSort() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState([null, null, null, null]);
  const [isChecked, setIsChecked] = useState(false);
  
  const currentQ = useMemo(() => sentenceSortData[currentIndex], [currentIndex]);
  
  // Tránh vòng lặp if rườm rà, dùng toán tử && và map 
  const handleSelectOption = useCallback((opt) => {
    !isChecked && setSelectedSlots(prev => {
      const firstEmptyIdx = prev.indexOf(null);
      return firstEmptyIdx !== -1 
        ? prev.map((slot, i) => (i === firstEmptyIdx ? opt : slot)) 
        : prev;
    });
  }, [isChecked]);

  const handleRemoveSlot = useCallback((idx) => {
    !isChecked && setSelectedSlots(prev => prev.map((slot, i) => (i === idx ? null : slot)));
  }, [isChecked]);
  
  const handleCheck = useCallback(() => {
    !selectedSlots.includes(null) && setIsChecked(true);
  }, [selectedSlots]);

  const resetState = useCallback(() => {
    setSelectedSlots([null, null, null, null]);
    setIsChecked(false);
  }, []);

  const handleNext = useCallback(() => {
    const isLast = currentIndex === sentenceSortData.length - 1;
    isLast && alert("Bạn đã hoàn thành bài tập Dấu Sao!");
    setCurrentIndex(prev => (prev + 1) % sentenceSortData.length);
    resetState();
  }, [currentIndex, resetState]);

  const handleJump = useCallback((idx) => {
    setCurrentIndex(idx);
    resetState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetState]);

  // Đánh giá nhanh
  const isCorrect = isChecked && selectedSlots[2]?.id === currentQ.correctStar;
  const isPerfect = isChecked && selectedSlots.map(s => s?.id).join('') === currentQ.correctOrder.join('');

  // Memo hóa phép nối chuỗi tĩnh
  const completedSentence = useMemo(() => 
    currentQ.context + 
    currentQ.correctOrder.map(id => currentQ.options.find(o => o.id === id).text).join(' ') + 
    currentQ.suffix, 
  [currentQ]);

  // Design pattern Object Literal (từ điển) thay vì dùng cả nùi if/else ở JSX
  const resultStatus = isPerfect ? 'perfect' : isCorrect ? 'correct' : 'wrong';

  const styles = useMemo(() => ({
    perfect: {
      border: 'border-emerald-500 bg-emerald-50',
      icon: <CheckCircle className="w-8 h-8 text-emerald-500" />,
      titleColor: 'text-emerald-900',
      title: 'Chính xác hoàn toàn!',
      textColor: 'text-emerald-700',
      btn: 'bg-emerald-600 text-white hover:bg-emerald-700'
    },
    correct: {
      border: 'border-amber-500 bg-amber-50',
      icon: <CheckCircle className="w-8 h-8 text-amber-500" />,
      titleColor: 'text-amber-900',
      title: 'Đúng vị trí sao!',
      textColor: 'text-amber-700',
      btn: 'bg-amber-600 text-white hover:bg-amber-700'
    },
    wrong: {
      border: 'border-rose-500 bg-rose-50',
      icon: <XCircle className="w-8 h-8 text-rose-500" />,
      titleColor: 'text-rose-900',
      title: 'Chưa chính xác',
      textColor: 'text-rose-700',
      btn: 'bg-rose-600 text-white hover:bg-rose-700'
    }
  }), []);

  const activeStyle = styles[resultStatus] || {};

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-100 p-4 md:p-6 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <Link to="/exam-jlpt" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest transition-colors">
          <ChevronLeft className="w-4 h-4" /> Thoát
        </Link>
        <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase bg-slate-50 px-3 py-1.5 rounded-full">
          Câu {currentIndex + 1} / {sentenceSortData.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full p-4 md:p-8 gap-8 items-start shrink-0">
        
        {/* Khung bài tập */}
        <div className="flex-1 w-full flex flex-col shrink-0">
          
          <div className="mb-8 p-6 md:p-10 bg-slate-50 border border-slate-100 rounded-[2.5rem] shadow-sm leading-relaxed overflow-hidden">
             <p className="text-xl md:text-2xl font-bold text-slate-800 whitespace-pre-wrap leading-relaxed">
                {currentQ.context}
             </p>
             
             <div className="flex flex-wrap items-center gap-3 my-8">
                {[0, 1, 2, 3].map((idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleRemoveSlot(idx)}
                    className={`relative flex items-center justify-center min-w-[80px] h-12 md:h-14 px-4 rounded-xl font-bold cursor-pointer transition-all ${
                      selectedSlots[idx] 
                        ? 'bg-black text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] active:scale-95' 
                        : 'bg-white border-2 border-dashed border-slate-300 hover:border-slate-400'
                    } ${idx === 2 && !selectedSlots[idx] ? 'ring-2 ring-amber-400 ring-offset-4 ring-offset-slate-50' : ''}`}
                  >
                    {selectedSlots[idx] ? (
                      <span className="text-sm md:text-base">{selectedSlots[idx].text}</span>
                    ) : (
                      idx === 2 ? <span className="text-amber-400 text-xl drop-shadow-sm">★</span> : <span className="text-slate-300">___</span>
                    )}
                  </div>
                ))}
             </div>
             
             <p className="text-xl md:text-2xl font-bold text-slate-800 whitespace-pre-wrap leading-relaxed">
                {currentQ.suffix}
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {currentQ.options.map(opt => {
              const isSelected = selectedSlots.some(s => s?.id === opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isSelected || isChecked}
                  className={`p-5 rounded-2xl font-bold text-left transition-all border-2 flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-slate-50 border-transparent text-slate-300 pointer-events-none' 
                      : 'bg-white border-slate-100 text-slate-700 hover:border-black hover:shadow-lg active:scale-95'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${isSelected ? 'bg-slate-100 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                    {opt.id}
                  </div>
                  <span className="text-sm md:text-base">{opt.text}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-auto pt-6">
            {!isChecked ? (
              <button
                onClick={handleCheck}
                disabled={selectedSlots.includes(null)}
                className="w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all
                disabled:bg-slate-50 disabled:text-slate-300
                bg-black text-white hover:bg-slate-900 active:scale-95 hover:shadow-xl"
              >
                Kiểm tra
              </button>
            ) : (
              <div className={`p-6 md:p-8 border-2 rounded-[2rem] space-y-4 animate-in slide-in-from-bottom-2 duration-300 ${activeStyle.border}`}>
                <div className="flex items-center gap-3">
                   {activeStyle.icon}
                   <h4 className={`text-xl font-black uppercase tracking-tight ${activeStyle.titleColor}`}>
                      {activeStyle.title}
                   </h4>
                </div>
                <p className={`text-sm font-bold opacity-80 ${activeStyle.textColor}`}>
                  Thứ tự ghép đúng: <span className="text-black font-black mx-1">{currentQ.correctOrder.join(' - ')}</span> 
                  (Vị trí ★ là <span className="text-black font-black">{currentQ.correctStar}</span>)
                </p>

                <div className="mt-4 p-4 bg-white/60 rounded-xl space-y-2 border border-black/5">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Câu hoàn chỉnh:</p>
                  <p className="text-base md:text-lg font-bold text-slate-800 leading-relaxed">
                    {completedSentence}
                  </p>
                  {currentQ.meaning && (
                    <div className="pt-3 mt-3 border-t border-black/5">
                       <p className="text-sm font-medium text-slate-600 whitespace-pre-wrap leading-relaxed">
                          <span className="font-black text-xs uppercase tracking-wider text-slate-400 block mb-1">Dịch nghĩa:</span> 
                          {currentQ.meaning}
                       </p>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleNext}
                  className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 mt-6 transition-all shadow-md active:scale-95 ${activeStyle.btn}`}
                >
                  Câu tiếp theo <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 lg:sticky lg:top-24 mb-10 lg:mb-0">
           <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-black"></div>
             Mục lục câu hỏi
           </h3>
           <div className="grid grid-cols-5 gap-2 md:gap-3">
             {sentenceSortData.map((_, idx) => (
               <button
                 key={idx}
                 onClick={() => handleJump(idx)}
                 className={`w-full aspect-square rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                   currentIndex === idx 
                     ? 'bg-black text-white shadow-md scale-105'
                     : 'bg-white border border-slate-200 text-slate-400 hover:border-black hover:text-black hover:shadow-sm'
                 }`}
               >
                 {idx + 1}
               </button>
             ))}
           </div>
        </div>
        
      </div>
    </div>
  )
}
