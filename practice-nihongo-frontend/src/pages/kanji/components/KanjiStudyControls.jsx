import React from 'react';

export default function KanjiStudyControls({
  filterType,
  uniqueWeeks,
  selectedWeek,
  setSelectedWeek,
  uniqueDays,
  selectedDay,
  setSelectedDay
}) {
  return (
    <div className="flex flex-col gap-6 mb-10 max-w-4xl">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[10px] font-black tracking-[0.25em] text-slate-300 dark:text-slate-700 uppercase mr-4">
          CHỌN {filterType === 'week' ? 'BÀI HỌC' : filterType === 'page' ? 'TRANG' : 'PHẦN'}
        </span>
        <button
          onClick={() => {
            setSelectedWeek('');
            setSelectedDay('');
          }}
          className={`px-4 py-2 text-[10px] font-black tracking-wider uppercase rounded-xl transition-all flex items-center justify-center shrink-0 ${
            selectedWeek === ''
              ? 'bg-slate-950 text-white dark:bg-white dark:text-black shadow-sm'
              : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
          }`}
        >
          TẤT CẢ
        </button>
        {uniqueWeeks.map(w => {
          const label = filterType === 'week' ? `BÀI ${w}` : filterType === 'page' ? `TRANG ${w}` : `PHẦN ${w}`;
          return (
            <button
              key={w}
              onClick={() => {
                setSelectedWeek(w);
                setSelectedDay('');
              }}
              className={`px-4 py-2 text-[10px] font-black tracking-wider uppercase rounded-xl transition-all flex items-center justify-center shrink-0 ${
                selectedWeek === w
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {uniqueDays.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[10px] font-black tracking-[0.25em] text-slate-300 dark:text-slate-700 uppercase mr-4">
            CHỌN NGÀY HỌC
          </span>
          <button
            onClick={() => setSelectedDay('')}
            className={`px-4 py-2 text-[10px] font-black tracking-wider uppercase rounded-xl transition-all flex items-center justify-center shrink-0 ${
              selectedDay === ''
                ? 'bg-slate-950 text-white dark:bg-white dark:text-black shadow-sm'
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
            }`}
          >
            TẤT CẢ
          </button>
          {uniqueDays.map(d => {
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-4 py-2 text-[10px] font-black tracking-wider uppercase rounded-xl transition-all flex items-center justify-center shrink-0 ${
                  selectedDay === d
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-black shadow-sm'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
                }`}
              >
                NGÀY {d}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
