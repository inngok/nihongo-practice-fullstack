import React from 'react';

export default function KanjiVocabView({
  kanjiVocabs,
  vocabIndex,
  setVocabIndex,
  isFlipped,
  setIsFlipped
}) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      {kanjiVocabs.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
          <p className="text-slate-300 dark:text-slate-700 font-black text-[10px] uppercase tracking-[0.3em]">Không có từ vựng để ôn tập</p>
          <p className="text-slate-400 text-xs mt-2 italic">Thêm từ vựng vào phần "examples" của từng Hán tự</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">

          {/* Progress Header */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] whitespace-nowrap">
              {vocabIndex + 1} <span className="text-slate-200 dark:text-slate-800">/</span> {kanjiVocabs.length}
            </span>
            <div className="flex-1 h-0.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-black dark:bg-white rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((vocabIndex + 1) / kanjiVocabs.length) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest whitespace-nowrap">
              TỪ VỰNG
            </span>
          </div>

          {/* Flashcard */}
          <div
            onClick={() => setIsFlipped(prev => !prev)}
            className="w-full h-[360px] cursor-pointer relative select-none"
            style={{ perspective: '1200px' }}
          >
            <div
              className="w-full h-full transition-transform duration-500 ease-in-out relative"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front Face */}
              <div
                className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-100/50 dark:shadow-none rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="absolute top-7 left-7 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.25em]">
                  TỪ VỰNG HÁN TỰ
                </span>

                {/* Main vocab word */}
                <h2 className="text-7xl sm:text-8xl font-kanji font-bold text-slate-900 dark:text-white mb-4 leading-none">
                  {kanjiVocabs[vocabIndex].word}
                </h2>

                {/* Reading hint */}
                {kanjiVocabs[vocabIndex].reading && (
                  <p className="text-lg text-slate-400 dark:text-slate-500 font-bold tracking-widest">
                    {kanjiVocabs[vocabIndex].reading}
                  </p>
                )}

                <div className="absolute bottom-7 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                  <p className="text-[9px] text-slate-300 dark:text-slate-600 font-black uppercase tracking-[0.25em]">
                    NHẤN ĐỂ XEM NGHĨA
                  </p>
                  <div className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Back Face */}
              <div
                className="absolute inset-0 bg-black dark:bg-white border border-black dark:border-white shadow-2xl shadow-black/20 dark:shadow-none rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <span className="absolute top-7 right-7 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">
                  Ý NGHĨA
                </span>

                {/* Word echo on back */}
                <p className="text-slate-500 dark:text-slate-400 font-kanji text-2xl mb-4 font-bold">
                  {kanjiVocabs[vocabIndex].word}
                </p>

                {/* Main meaning */}
                <h3 className="text-3xl sm:text-4xl font-bold text-white dark:text-black leading-snug mb-4">
                  {kanjiVocabs[vocabIndex].meaning}
                </h3>

                {/* Reading on back */}
                {kanjiVocabs[vocabIndex].reading && (
                  <div className="mt-2 px-5 py-2 bg-slate-800 dark:bg-slate-100 rounded-full border border-slate-700 dark:border-slate-200">
                    <p className="text-sm text-slate-300 dark:text-slate-600 font-bold tracking-widest">
                      {kanjiVocabs[vocabIndex].reading}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between max-w-md mx-auto pt-2">
            <button
              onClick={() => { if (vocabIndex > 0) { setVocabIndex(prev => prev - 1); setIsFlipped(false); } }}
              disabled={vocabIndex === 0}
              className="border border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              ← Trước
            </button>

            <button
              onClick={() => setIsFlipped(prev => !prev)}
              className="px-6 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all"
            >
              Lật thẻ
            </button>

            <button
              onClick={() => { if (vocabIndex < kanjiVocabs.length - 1) { setVocabIndex(prev => prev + 1); setIsFlipped(false); } }}
              disabled={vocabIndex === kanjiVocabs.length - 1}
              className="border border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Sau →
            </button>
          </div>

          {/* Dot Pagination (max 12 shown) */}
          {kanjiVocabs.length <= 20 && (
            <div className="flex justify-center gap-1.5 flex-wrap">
              {kanjiVocabs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setVocabIndex(i); setIsFlipped(false); }}
                  className={`transition-all rounded-full ${i === vocabIndex ? 'w-6 h-2 bg-black dark:bg-white' : 'w-2 h-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-500'}`}
                />
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
