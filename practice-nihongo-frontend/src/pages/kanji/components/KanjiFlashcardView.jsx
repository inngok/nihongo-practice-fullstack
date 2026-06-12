import React from 'react';

export default function KanjiFlashcardView({
  filteredKanjis,
  flashcardIndex,
  isFlipped,
  setIsFlipped,
  handlePrevFlashcard,
  handleNextFlashcard
}) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      {filteredKanjis.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Không có từ để ôn tập</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div 
            onClick={() => setIsFlipped(prev => !prev)}
            className="w-full max-w-md h-80 mx-auto cursor-pointer relative select-none"
            style={{ perspective: '1200px' }}
          >
            <div 
              className="w-full h-full duration-500 ease-in-out transform relative"
              style={{ 
                transformStyle: 'preserve-3d', 
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
              }}
            >
              {/* Front Face */}
              <div 
                className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none rounded-[2.5rem] flex flex-col items-center justify-center p-8"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="absolute top-6 left-6 text-xs font-black text-slate-200 dark:text-slate-800 uppercase tracking-wider">
                  KANJI
                </span>
                <span className="text-8xl font-kanji font-bold text-slate-900 dark:text-white tracking-tight">{filteredKanjis[flashcardIndex].character}</span>
                <p className="text-[9px] text-slate-300 dark:text-slate-700 font-bold uppercase tracking-[0.2em] mt-10">
                  Chạm để lật thẻ
                </p>
              </div>

              {/* Back Face */}
              <div 
                className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center"
                style={{ 
                  backfaceVisibility: 'hidden', 
                  transform: 'rotateY(180deg)' 
                }}
              >
                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">
                  ÂM HÁN VIỆT
                </span>
                <h3 className="text-4xl font-bold text-slate-950 dark:text-white uppercase tracking-wide leading-none mb-4">
                  {filteredKanjis[flashcardIndex].hanviet || 'CHƯA CÓ'}
                </h3>
                
                <div className="space-y-1.5 mb-6">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest block">Ý NGHĨA</span>
                  <p className="text-base text-slate-600 dark:text-slate-300 font-bold italic leading-relaxed">
                    {filteredKanjis[flashcardIndex].meaning || 'Chưa cập nhật'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-left text-xs">
                  <div>
                    <span className="font-black text-[9px] text-slate-400 dark:text-slate-600 uppercase tracking-widest block mb-0.5">Onyomi</span>
                    <span className="font-kanji font-bold text-slate-800 dark:text-slate-200">{filteredKanjis[flashcardIndex].onyomi || '—'}</span>
                  </div>
                  <div>
                    <span className="font-black text-[9px] text-slate-400 dark:text-slate-600 uppercase tracking-widest block mb-0.5">Kunyomi</span>
                    <span className="font-kanji font-bold text-slate-800 dark:text-slate-200">{filteredKanjis[flashcardIndex].kunyomi || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between max-w-md mx-auto">
            <button onClick={handlePrevFlashcard} className="border border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all">Trước</button>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Thẻ {flashcardIndex + 1} / {filteredKanjis.length}</span>
            <button onClick={handleNextFlashcard} className="border border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all">Sau</button>
          </div>
        </div>
      )}
    </div>
  );
}
