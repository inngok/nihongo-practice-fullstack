import React, { useState, useEffect, useRef } from 'react';

const normalizeText = (str) => {
  if (!str) return '';
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
};

export default function KanjiTypingView({ filteredKanjis }) {
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingInput, setTypingInput] = useState('');
  const [typingFeedback, setTypingFeedback] = useState(null); // 'correct' | 'incorrect' | null
  const [typingFinished, setTypingFinished] = useState(false);
  const typingInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    setTypingIndex(0);
    setTypingInput('');
    setTypingFeedback(null);
    setTypingFinished(false);
  }, [filteredKanjis]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleTypingSubmit = (e) => {
    e.preventDefault();
    if (filteredKanjis.length === 0) return;

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

  return (
    <div className="max-w-xl mx-auto py-8">
      {filteredKanjis.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Không có từ để luyện gõ phím</p>
        </div>
      ) : typingFinished ? (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 md:p-12 text-center space-y-6 max-w-md mx-auto shadow-sm animate-in fade-in">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">HOÀN THÀNH LUYỆN GÕ</h3>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider leading-relaxed">Quá xuất sắc! Bạn đã luyện gõ thành công toàn bộ danh sách {filteredKanjis.length} chữ Hán tự bài này!</p>
          <button
            onClick={() => {
              setTypingIndex(0);
              setTypingInput('');
              setTypingFeedback(null);
              setTypingFinished(false);
              setTimeout(() => typingInputRef.current?.focus(), 50);
            }}
            className="bg-black dark:bg-white text-white dark:text-black hover:opacity-80 w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center"
          >
            Luyện tập lại từ đầu
          </button>
        </div>
      ) : (
        <div className="space-y-8 max-w-md mx-auto animate-in fade-in">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Chữ thứ {typingIndex + 1} / {filteredKanjis.length}</span>
            <span className="text-indigo-500">Nhập đúng âm Hán Việt</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 text-center shadow-sm flex flex-col items-center">
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
                  ? 'bg-slate-50 dark:bg-slate-800 border-rose-200 dark:border-rose-900 text-rose-500 dark:text-rose-400 opacity-90'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-150 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 text-slate-900 dark:text-white'
              }`}
            />

            <div className="flex gap-3">
              <button type="button" onClick={handleSkipTyping} className="flex-1 py-3.5 border border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all text-slate-400 dark:text-slate-600 hover:text-black dark:hover:text-white">Bỏ qua & xem kết quả</button>
              <button type="submit" disabled={typingFeedback === 'correct'} className="flex-1 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95">Xác nhận kết quả</button>
            </div>
          </form>

          {typingFeedback === 'incorrect' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-center animate-in slide-in-from-top-2">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">❌ Nhập chưa chính xác! Gợi ý đáp án đúng: <span className="uppercase text-sm font-black text-slate-900 dark:text-white tracking-wider underline">{filteredKanjis[typingIndex]?.hanviet}</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
