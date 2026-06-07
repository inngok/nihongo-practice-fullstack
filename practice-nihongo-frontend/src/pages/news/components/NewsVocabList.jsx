import React from 'react';
import { Button } from 'antd';

export default function NewsVocabList({ vocabList, isAdmin, extracting, onExtract }) {
  if (vocabList.length === 0 && !isAdmin) return null;

  return (
    <div className="mt-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-black m-0 text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
          Từ vựng
        </h2>
        {vocabList.length === 0 && isAdmin && (
          <Button 
            type="primary" 
            onClick={onExtract} 
            loading={extracting}
            className="bg-slate-900 hover:bg-slate-800 text-white border-none rounded-full px-6 h-10 font-bold shadow-md dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white w-full sm:w-auto"
          >
            Phân tích bằng AI
          </Button>
        )}
      </div>

      {vocabList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vocabList.map((item, index) => (
            <div 
              key={index}
              className="group relative flex flex-col p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.05)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-end gap-3 mb-4">
                  <span className="font-kanji text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                    {item.word}
                  </span>
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-1">
                    {item.reading}
                  </span>
                </div>
                
                <div className="w-8 h-1 bg-slate-200 dark:bg-slate-700 mb-4 group-hover:bg-slate-800 dark:group-hover:bg-slate-300 transition-colors duration-300 rounded-full"></div>
                
                <p className="text-base font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.meaning}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-slate-700 p-10 flex flex-col items-center justify-center text-center group transition-colors duration-300 hover:border-slate-400 dark:hover:border-slate-600">
          <p className="text-slate-600 dark:text-slate-400 font-medium max-w-sm mt-2">
            Bài báo này chưa được phân tích từ vựng. Bấm "Phân tích bằng AI" để hệ thống tự động trích xuất các từ JLPT quan trọng.
          </p>
        </div>
      )}
    </div>
  );
}
