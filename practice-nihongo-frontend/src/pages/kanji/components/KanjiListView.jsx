import React from 'react';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import DetailedKanjiCard from './DetailedKanjiCard';

export default function KanjiListView({
  searchQuery,
  setSearchQuery,
  loading,
  hasAnyExamples,
  filteredKanjis,
  handleOpenDetail,
  handleAddFlashcard,
  addedKanjiIds
}) {
  return (
    <>
      <div className="relative w-full max-w-md mb-10">
        <input
          type="text"
          placeholder="Tìm nhanh chữ Hán, âm Hán Việt, ý nghĩa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-5 py-3 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-slate-300 dark:focus:border-slate-700 focus:bg-white dark:focus:bg-slate-900 transition-all text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 border-3 border-slate-100 border-t-black rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang tải...</p>
        </div>
      ) : hasAnyExamples ? (
         <div className="flex flex-col">
            {filteredKanjis.map((kanji) => (
              <DetailedKanjiCard 
                 key={kanji.id} 
                 kanji={kanji} 
                 handleOpenDetail={handleOpenDetail} 
                 handleAddFlashcard={handleAddFlashcard} 
                 addedKanjiIds={addedKanjiIds} 
              />
            ))}
         </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredKanjis.map((kanji, index) => (
            <div
              key={kanji.id}
              onClick={() => handleOpenDetail(kanji)}
              className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xl hover:-translate-y-1 rounded-3xl p-6 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer h-52 shadow-sm"
            >
              <span className="absolute top-4 left-4 text-[9px] font-black text-slate-200 dark:text-slate-800 uppercase tracking-widest">
                {String(index + 1).padStart(2, '0')}
              </span>
              <button
                onClick={(e) => handleAddFlashcard(kanji, e)}
                className="absolute top-3 right-3 p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-300 dark:text-slate-700 hover:text-rose-500 rounded-full transition-all duration-300 scale-90 group-hover:scale-100 z-10"
                title="Lưu vào Sổ tay ôn tập"
              >
                {addedKanjiIds.has(kanji.id) ? (
                  <HeartFilled className="text-rose-500 text-xs" />
                ) : (
                  <HeartOutlined className="text-xs text-slate-300 hover:text-rose-400 transition-colors" />
                )}
              </button>
              <div className="my-3 text-center">
                <h2 className="text-5xl font-kanji font-bold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300 select-none">
                  {kanji.character}
                </h2>
              </div>
              <div className="w-full text-center space-y-1.5 pt-3 mt-auto border-t border-slate-50 dark:border-slate-850">
                <span className="inline-block font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                  {kanji.hanviet || 'CHƯA CÓ'}
                </span>
                <p className="text-slate-400 text-[10px] font-medium truncate max-w-full italic px-1">
                  {kanji.meaning || 'Chưa có nghĩa'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredKanjis.length === 0 && !loading && (
        <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Danh sách trống</p>
        </div>
      )}
    </>
  );
}
