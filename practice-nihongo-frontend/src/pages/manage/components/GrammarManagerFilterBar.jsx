import React from 'react';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';

export default function GrammarManagerFilterBar({
  searchTerm,
  setSearchTerm,
  setCurrentPage,
  showDuplicatesOnly,
  setShowDuplicatesOnly,
  handleCleanDuplicates,
  isCleaning,
  selectedBookId,
  setSelectedBookId,
  selectedLesson,
  setSelectedLesson,
  selectedDay,
  setSelectedDay,
  books,
  uniqueLessons,
  uniqueDays,
  filteredGrammarsLength
}) {
  return (
    <div className="flex flex-col gap-3 mb-8 p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
      {/* Row 1: Search + Duplicate controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-xs" />
          <input
            type="text"
            placeholder="Tìm cấu trúc, ý nghĩa..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-black dark:focus:border-white transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600"
          />
        </div>

        <button
          onClick={() => { setShowDuplicatesOnly(!showDuplicatesOnly); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
            showDuplicatesOnly
              ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {showDuplicatesOnly ? '✓ ' : ''}Chỉ hiện trùng
        </button>

        <button
          onClick={handleCleanDuplicates}
          disabled={isCleaning}
          className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-500 dark:hover:text-rose-400 disabled:opacity-40 whitespace-nowrap"
        >
          {isCleaning ? 'Đang dọn...' : '⌫ Dọn bản trùng'}
        </button>
      </div>

      {/* Row 2: Book + Lesson selects */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterOutlined className="text-slate-300 dark:text-slate-700 text-[11px]" />
        <select
          value={selectedBookId}
          onChange={(e) => { setSelectedBookId(e.target.value); setSelectedLesson(''); setSelectedDay(''); setCurrentPage(1); }}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-black dark:focus:border-white transition-all cursor-pointer"
        >
          <option value="">Tất cả giáo trình</option>
          {books.map(b => <option key={b.id} value={b.id.toString()}>{b.title}</option>)}
        </select>

        <select
          value={selectedLesson}
          onChange={(e) => { setSelectedLesson(e.target.value); setSelectedDay(''); setCurrentPage(1); }}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-black dark:focus:border-white transition-all cursor-pointer"
        >
          <option value="">Tất cả bài</option>
          {uniqueLessons.map(l => <option key={l} value={l.toString()}>Bài {l}</option>)}
        </select>

        <select
          value={selectedDay}
          onChange={(e) => { setSelectedDay(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-black dark:focus:border-white transition-all cursor-pointer"
        >
          <option value="">Tất cả ngày</option>
          {uniqueDays.map(d => <option key={d} value={d.toString()}>Ngày {d}</option>)}
        </select>

        {(selectedBookId || selectedLesson || selectedDay || showDuplicatesOnly || searchTerm) && (
          <button
            onClick={() => { setSelectedBookId(''); setSelectedLesson(''); setSelectedDay(''); setShowDuplicatesOnly(false); setSearchTerm(''); }}
            className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700 hover:text-red-400 dark:hover:text-red-400 transition-colors"
          >
            ✕ Xóa lọc
          </button>
        )}

        <span className="ml-auto text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">
          {filteredGrammarsLength} cấu trúc
        </span>
      </div>
    </div>
  );
}
