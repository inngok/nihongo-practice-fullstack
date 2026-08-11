import React from 'react';

export default function VocabResultsModal({
  score,
  total,
  activeMode,
  flashcardSubMode,
  completedIdsLength,
  handleResetProgress,
  handleStudyUnmemorized,
  setShowResults
}) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xl max-w-xs w-full space-y-6">
        <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200">Hoàn thành bài học</h2>
        
        <div className="py-4 flex items-baseline justify-center gap-1.5">
          <span className="text-6xl font-light text-slate-900 dark:text-white">{score}</span>
          <span className="text-xl font-normal text-slate-400 dark:text-slate-500">/ {total}</span>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => { 
              setShowResults(false); 
              handleResetProgress();
            }}
            className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Học lại từ đầu
          </button>

          {completedIdsLength < total && (
            <button
              onClick={handleStudyUnmemorized}
              className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              Chỉ làm lại câu sai ({total - completedIdsLength})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
