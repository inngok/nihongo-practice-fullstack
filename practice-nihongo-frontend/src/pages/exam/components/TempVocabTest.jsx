import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight, CheckCircle, XCircle, Volume2, LayoutGrid } from 'lucide-react';
import { tempVocabTests } from '../data/tempVocabTestData';

export default function TempVocabTest() {
  const navigate = useNavigate();
  // Quản lý việc người dùng đã chọn test nào chưa
  const [activeTestId, setActiveTestId] = useState(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Màn hình chọn Bài Test (Menu)
  if (!activeTestId) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-12 font-sans selection:bg-black selection:text-white flex flex-col items-center">
        <div className="w-full max-w-4xl flex justify-between items-center mb-16">
          <button
            onClick={() => navigate('/exam-pc7')}
            className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 hover:text-black transition-colors uppercase"
          >
            <ChevronLeft className="w-4 h-4" /> THOÁT
          </button>
        </div>
        
        <div className="max-w-4xl w-full">
           <div className="mb-12">
             <h1 className="text-4xl md:text-5xl font-black italic uppercase mb-4">Danh Sách Bài Test</h1>
             <p className="text-slate-500 font-medium italic">Chọn một bài test để bắt đầu luyện tập.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {tempVocabTests.map(test => (
                <button
                  key={test.id}
                  onClick={() => setActiveTestId(test.id)}
                  className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 hover:border-black hover:shadow-2xl hover:-translate-y-1 transition-all text-left flex flex-col gap-4 group"
                >
                   {/* Đã gỡ Icon Grid */}
                   <div>
                     <h3 className="text-2xl font-black italic mb-2">{test.title}</h3>
                     <p className="text-slate-400 font-bold text-sm">{test.data.length} câu hỏi</p>
                   </div>
                </button>
             ))}
           </div>
        </div>
      </div>
    );
  }

  // --- Màn hình Đang làm Test ---
  const activeTest = tempVocabTests.find(t => t.id === activeTestId);
  const tempVocabTest = activeTest.data;

  const currentQuestion = tempVocabTest[currentIndex];
  const hasAnsweredCurrent = answers[currentIndex] !== undefined;

  // Helper to format question with styled blanks and underlines
  const formatQuestion = (text, selectedIdx = null) => {
    if (!text) return "";
    
    // Split by *keyword* for synonyms first
    const parts = text.split(/\*(.*?)\*/g);
    
    return parts.map((part, i) => {
      // Handle the synonym word (part between asterisks)
      if (i % 2 === 1) {
        return (
          <span key={i} className="underline decoration-black underline-offset-8 decoration-4 font-black">
            {part}
          </span>
        );
      }
      
      // Handle ( ) in the text parts
      if (part.includes('( )')) {
        const subparts = part.split('( )');
        return subparts.map((sp, j) => (
          <React.Fragment key={j}>
            {sp}
            {j < subparts.length - 1 && (
              <span className={`mx-2 px-6 py-2 bg-slate-50 border-2 rounded-2xl inline-flex items-center justify-center min-w-[80px] h-12 align-middle transition-all duration-500 ${selectedIdx !== undefined && currentQuestion.options[selectedIdx] ? 'border-black bg-white shadow-sm' : 'border-slate-100 border-dashed'}`}>
                {(selectedIdx !== undefined && currentQuestion.options[selectedIdx]) ? (
                  <span className="text-xl md:text-2xl font-black italic text-black animate-in zoom-in-95 duration-300">
                    {currentQuestion.options[selectedIdx]?.text}
                  </span>
                ) : (
                  <span className="text-base font-black text-slate-300 animate-pulse tracking-widest">???</span>
                )}
              </span>
            )}
          </React.Fragment>
        ));
      }
      
      return part;
    });
  };

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean up markers for speech
      const cleanText = text.replace(/\*/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelect = (idx) => {
    if (hasAnsweredCurrent) return;
    
    setAnswers(prev => ({ ...prev, [currentIndex]: idx }));

    const isCorrect = currentQuestion.answer === idx;
    const sentenceToSpeech = currentQuestion.type === 'usage' 
      ? currentQuestion.options[currentQuestion.answer].text 
      : currentQuestion.question.replace('( )', ` ${currentQuestion.options[currentQuestion.answer].text} `);
    
    if (isCorrect) {
       playAudio(sentenceToSpeech);
    }
  };

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentIndex < tempVocabTest.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let s = 0;
    tempVocabTest.forEach((q, idx) => {
      if (answers[idx] === q.answer) s += 1;
    });
    setScore(s);
    setShowResults(true);
  };

  const fullCorrectSentence = currentQuestion.type === 'usage' 
      ? currentQuestion.options[currentQuestion.answer].text 
      : currentQuestion.question.replace('( )', currentQuestion.options[currentQuestion.answer].text);

  if (showResults) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 md:px-12 font-sans flex flex-col items-center justify-center">
        <div className="max-w-xl w-full space-y-10 text-center">
          <h1 className="text-3xl font-bold uppercase tracking-widest">Kết quả</h1>
          
          <div className="p-10 bg-slate-50 border border-slate-100 rounded-3xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Điểm số</p>
            <p className="text-6xl font-bold">{score}<span className="text-2xl text-slate-300">/{tempVocabTest.length}</span></p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setActiveTestId(null);
                setCurrentIndex(0);
                setAnswers({});
                setShowResults(false);
                setScore(0);
              }}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-slate-800 transition-all"
            >
              Làm Bài Khác
            </button>
            <button
              onClick={() => navigate('/exam-pc7')}
              className="w-full py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-bold text-sm tracking-widest uppercase"
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-black selection:text-white pb-32">
      {/* Header */}
      <div className="px-6 py-6 md:px-12 flex justify-between items-center border-b border-slate-50 sticky top-0 bg-white/90 backdrop-blur-md z-40">
        <button
          onClick={() => {
            if (window.confirm('Bạn có chắc muốn thoát? Kết quả bài làm hiện tại sẽ bị hủy.')) {
              setActiveTestId(null);
              setCurrentIndex(0);
              setAnswers({});
            }
          }}
          className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 hover:text-black transition-colors uppercase"
        >
          <ChevronLeft className="w-4 h-4" /> MENU TEST
        </button>
        <div className="text-[10px] items-center gap-2 flex font-black tracking-widest text-slate-900 uppercase bg-slate-100 px-4 py-2 rounded-full">
          {activeTest.title}
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-50 h-2">
        <div
          className="h-full bg-black transition-all duration-500"
          style={{ width: `${((currentIndex) / tempVocabTest.length) * 100}%` }}
        />
      </div>

      <div className="flex-grow flex flex-col pt-8 md:pt-12 px-6 md:px-12 w-full mx-auto relative pb-12 max-w-5xl">
        <div className="text-[10px] font-black tracking-widest text-slate-400 mb-6 uppercase flex justify-between items-center">
          <span>CÂU {currentIndex + 1} / {tempVocabTest.length}</span>
          <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-slate-600">
             {currentQuestion.type === 'usage' ? 'CÁCH SỬ DỤNG TỪ' : (currentQuestion.type === 'synonym' ? 'TỪ ĐỒNG NGHĨA' : 'ĐIỀN TỪ')}
          </span>
        </div>

        <div className={`grid grid-cols-1 gap-12 w-full ${hasAnsweredCurrent ? 'lg:grid-cols-2' : ''}`}>
          {/* Question content & Options */}
          <div className="flex flex-col justify-start">
            {currentQuestion.type === 'usage' ? (
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-black italic mb-3 text-slate-900">{currentQuestion.word}</h2>
                <p className="text-slate-400 font-bold italic mb-6">Ý nghĩa: {currentQuestion.meaning}</p>
                <h3 className="text-2xl md:text-3xl font-bold leading-relaxed text-slate-800">{formatQuestion(currentQuestion.question)}</h3>
              </div>
            ) : (
              <h2 className="text-2xl md:text-3xl font-black leading-relaxed mb-8 text-slate-900">
                {formatQuestion(currentQuestion.question, answers[currentIndex])}
              </h2>
            )}

            <div className="grid grid-cols-1 gap-4 w-full">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentIndex] === idx;
                const isCorrectAnswer = currentQuestion.answer === idx;
                
                let btnStyle = 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700';
                let numStyle = 'bg-slate-100 text-slate-400';
                let meaningStyle = 'text-slate-400';

                if (hasAnsweredCurrent) {
                  if (isSelected || isCorrectAnswer) {
                     if (isCorrectAnswer) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900';
                        numStyle = 'bg-emerald-500 text-white';
                        meaningStyle = 'text-emerald-700 opacity-90';
                     } else {
                        btnStyle = 'border-rose-300 bg-rose-50 text-rose-900';
                        numStyle = 'bg-rose-400 text-white';
                        meaningStyle = 'text-rose-700 opacity-90';
                     }
                  } else {
                    btnStyle = 'border-slate-50 bg-white opacity-40 grayscale';
                    numStyle = 'bg-slate-50 text-slate-300';
                    meaningStyle = 'text-slate-500 opacity-80';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={hasAnsweredCurrent}
                    className={`w-full text-left flex flex-col p-5 md:p-6 rounded-[1.5rem] border-2 transition-all ${btnStyle} ${!hasAnsweredCurrent ? 'active:scale-[0.98]' : 'cursor-default'}`}
                  >
                    <div className="w-full flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-colors ${numStyle}`}>
                          {idx + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg md:text-xl font-bold">{opt.text}</span>
                          {hasAnsweredCurrent && opt.meaning && (
                            <span className={`text-sm font-medium italic mt-1 ${meaningStyle}`}>
                              {opt.meaning}
                            </span>
                          )}
                        </div>
                      </div>
                      {hasAnsweredCurrent && isCorrectAnswer && <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />}
                      {hasAnsweredCurrent && isSelected && !isCorrectAnswer && <XCircle className="w-6 h-6 text-rose-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Explanation Column (Desktop) or Below (Mobile) */}
          {hasAnsweredCurrent && (
            <div className="border border-slate-100 rounded-3xl overflow-hidden bg-slate-50/50 self-start h-fit lg:sticky lg:top-24">
               <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${answers[currentIndex] === currentQuestion.answer ? 'text-emerald-600' : 'text-rose-600'}`}>
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${answers[currentIndex] === currentQuestion.answer ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                       {answers[currentIndex] === currentQuestion.answer ? 'Chính xác' : 'Chưa đúng'}
                    </span>
                 </div>
                 
                 <button 
                   onClick={() => playAudio(fullCorrectSentence)}
                   className="w-10 h-10 bg-white border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm"
                 >
                   <Volume2 className="w-5 h-5" />
                 </button>
               </div>
               
               <div className="p-6 md:p-8 space-y-6 text-slate-600">
                  <div className="space-y-2">
                     <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Câu hoàn chỉnh</p>
                     <p className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed italic">
                        {(() => {
                           const target = currentQuestion.type === 'usage' ? currentQuestion.word : currentQuestion.options[currentQuestion.answer].text;
                           const parts = fullCorrectSentence.split(new RegExp(`(${target})`, 'g'));
                           return parts.map((part, i) => 
                             part === target ? (
                               <span key={i} className="text-emerald-500 border-b-2 border-emerald-500/30">
                                 {part}
                               </span>
                             ) : part
                           );
                        })()}
                     </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                     <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Giải thích</p>
                     <p className="text-sm md:text-base font-medium leading-relaxed">
                        {currentQuestion.explanation}
                     </p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Footer Cho Phép Bấm Tiếp Theo Bất Cứ Đâu (Tối ưu Mobile) */}
      {hasAnsweredCurrent && (
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-5 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-50 flex justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="w-full max-w-4xl mx-auto flex justify-end">
            <button
              onClick={handleNext}
              className="w-full md:w-auto px-6 md:px-8 py-3.5 bg-black text-white rounded-full text-[11px] md:text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2.5 shadow-xl hover:-translate-y-1"
            >
              {currentIndex === tempVocabTest.length - 1 ? 'KẾT THÚC ' + activeTest.title : 'CÂU TIẾP THEO'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
}
