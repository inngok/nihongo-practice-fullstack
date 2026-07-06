import React from 'react';

export default function VocabQuizMode({
  studyData,
  currentIndex,
  handleResetProgress,
  userInput,
  setUserInput,
  feedback,
  setFeedback,
  handleSubmit,
  setShowResults,
  setCurrentIndex
}) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            Tiến trình: {currentIndex + 1} / {studyData.length}
          </span>
          <div className="h-1 bg-slate-100 dark:bg-slate-800 w-32 sm:w-48 rounded-full overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / (studyData.length || 1)) * 100}%` }}
            />
          </div>
          <button
            onClick={handleResetProgress}
            className="px-3 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-500 border border-rose-100 dark:border-rose-900 hover:bg-rose-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
          >
            HỌC LẠI
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-6 sm:p-16 text-center space-y-6 sm:space-y-12 shadow-sm">
        <div className="space-y-4">
          <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Dịch sang tiếng Nhật</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black italic text-slate-900 dark:text-white select-all break-all whitespace-pre-wrap leading-tight">
            "{studyData[currentIndex]?.meaning}"
          </h2>
        </div>

        <input
          autoFocus
          value={userInput}
          onChange={e => !feedback && setUserInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Nhập từ vựng..."
          className={`w-full max-w-md mx-auto py-3 sm:py-6 px-6 sm:px-10 rounded-full border-2 text-center text-lg sm:text-2xl font-bold transition-all ${feedback === 'correct' ? 'border-emerald-500 text-emerald-500 bg-emerald-50/50' :
            feedback === 'incorrect' ? 'border-rose-500 text-rose-500 bg-rose-50/50' :
              'border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white bg-transparent'
            }`}
        />

        {feedback === 'incorrect' && (
          <p className="text-rose-500 font-bold animate-bounce">
            Đáp án: {studyData[currentIndex]?.word} {studyData[currentIndex]?.reading ? `(${studyData[currentIndex]?.reading})` : ''}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8 sticky bottom-4 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md p-3 sm:py-0 rounded-2xl sm:static sm:bg-transparent sm:backdrop-blur-none shadow-sm sm:shadow-none border border-slate-100 dark:border-slate-800 sm:border-none">
        <button
          onClick={() => { 
            if (currentIndex > 0) { 
              setCurrentIndex(prev => prev - 1); 
              setFeedback(null); 
              setUserInput(''); 
            } 
          }}
          disabled={currentIndex === 0}
          className="flex-1 py-5 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-black dark:hover:border-white transition-all disabled:opacity-20"
        >
          QUAY LẠI
        </button>
        <button
          onClick={handleSubmit}
          className="flex-[2] py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase shadow-2xl hover:scale-[1.02] transition-all"
        >
          {feedback ? (currentIndex === studyData.length - 1 ? 'KẾT THÚC' : 'TIẾP THEO') : 'KIỂM TRA'}
        </button>
      </div>
    </div>
  );
}
