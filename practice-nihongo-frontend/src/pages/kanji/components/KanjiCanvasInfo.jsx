import React from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

export default function KanjiCanvasInfo({
  currentKanji,
  currentIndex,
  total,
  addedKanjiIds,
  onAddFlashcard,
  handlePrev,
  handleNext
}) {
  return (
    <div className="lg:col-span-6 flex flex-col h-full justify-between gap-6 self-stretch">
      {/* Details Card */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-8 md:p-10 space-y-6 flex-grow shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase bg-white border border-slate-100 px-3 py-1 rounded-full">
            KANJI PRACTICE {currentKanji.page ? `• TRANG ${currentKanji.page}` : ''}
          </span>
          <span className="text-xs font-black text-slate-300">
            {currentIndex + 1} / {total}
          </span>
        </div>

        {/* Title Block */}
        <div className="flex items-center gap-6 pt-2 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 bg-white border border-slate-150 rounded-2xl flex items-center justify-center shadow-inner text-4xl font-black text-slate-900 select-none">
            {currentKanji.character}
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">HÁN VIỆT</span>
            <h2 className="text-2xl font-black text-slate-950 uppercase tracking-wide leading-normal">
              {currentKanji.hanviet || 'CHƯA CÓ'}
            </h2>
            <p className="text-sm text-slate-500 font-bold italic">
              {currentKanji.meaning || 'Nghĩa chưa có'}
            </p>
          </div>
        </div>

        {/* Readings Table */}
        <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-100 text-xs">
          <div className="space-y-1">
            <span className="font-black text-[9px] text-slate-400 uppercase tracking-widest block">Onyomi (Âm On)</span>
            <span className="font-bold text-slate-900">{currentKanji.onyomi || '—'}</span>
          </div>
          <div className="space-y-1">
            <span className="font-black text-[9px] text-slate-400 uppercase tracking-widest block">Kunyomi (Âm Kun)</span>
            <span className="font-bold text-slate-700">{currentKanji.kunyomi || '—'}</span>
          </div>
        </div>

        {/* Examples block */}
        <div className="space-y-2">
          <span className="font-black text-[9px] text-slate-400 uppercase tracking-widest block">Từ vựng & Ví dụ ghép</span>
          {currentKanji.examples ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 max-h-[140px] overflow-y-auto space-y-2.5 scrollbar-thin">
              {currentKanji.examples.split(/[;\n]+/).map(l => l.trim()).filter(Boolean).map((line, idx) => (
                <div key={idx} className="flex gap-2.5 items-start text-xs">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-slate-600 font-semibold leading-relaxed">{line}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-white border border-dashed border-slate-150 rounded-2xl">
              <p className="text-slate-400 text-[10px] font-medium italic">Chưa có ví dụ mẫu.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions Row */}
      <div className="space-y-4">
        {/* Quick Bookmark Button */}
        <button
          onClick={() => onAddFlashcard(currentKanji)}
          className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
            addedKanjiIds.has(currentKanji.id)
              ? 'bg-rose-50 text-rose-500 border border-rose-100 shadow-rose-500/5 cursor-default'
              : 'bg-black text-white hover:bg-slate-800 shadow-black/5'
          }`}
        >
          {addedKanjiIds.has(currentKanji.id) ? (
            <>Đã lưu Sổ tay ôn tập</>
          ) : (
            <>Lưu vào Sổ tay ôn tập</>
          )}
        </button>

        {/* Navigation Slider Bar */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-150 rounded-2xl p-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-10 h-10 border border-slate-200 hover:border-black disabled:border-slate-150 disabled:opacity-40 disabled:hover:border-slate-150 rounded-xl flex items-center justify-center transition-all hover:bg-white text-slate-800"
          >
            <LeftOutlined style={{ fontSize: '10px', fontWeight: 'bold' }} />
          </button>

          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">
            Chữ Hán {currentIndex + 1} / {total}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex === total - 1}
            className="w-10 h-10 border border-slate-200 hover:border-black disabled:border-slate-150 disabled:opacity-40 disabled:hover:border-slate-150 rounded-xl flex items-center justify-center transition-all hover:bg-white text-slate-800"
          >
            <RightOutlined style={{ fontSize: '10px', fontWeight: 'bold' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
