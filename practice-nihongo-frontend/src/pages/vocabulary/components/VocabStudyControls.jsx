import React from 'react';

export default function VocabStudyControls({
  uniqueUnits,
  selectedUnit,
  setSelectedUnit,
  uniqueDays,
  selectedDay,
  setSelectedDay,
  setCurrentIndex,
  setIsFlipped,
  activeMode,
  setActiveMode
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-t border-slate-50 dark:border-slate-900 pt-10">
      <div className="space-y-4 w-full md:w-auto">
        <div className="flex justify-between items-center w-full">
          <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">CHỌN BÀI HỌC</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {uniqueUnits.map(unit => (
            <button
              key={unit}
              onClick={() => {
                setSelectedUnit(unit);
                setSelectedDay('');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${selectedUnit === unit
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105'
                : 'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              BÀI {unit}
            </button>
          ))}
        </div>

        {uniqueDays.length > 0 && (
          <>
            <div className="flex justify-between items-center w-full mt-4">
              <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">CHỌN NGÀY HỌC</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedDay('');
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${selectedDay === ''
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105'
                  : 'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                TẤT CẢ
              </button>
              {uniqueDays.map(day => (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDay(day);
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${selectedDay === day
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105'
                    : 'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  NGÀY {day}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className="flex items-center bg-slate-50/50 dark:bg-slate-900/50 p-1 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          {[
            { id: 'list', label: 'Danh sách' },
            { id: 'flashcard', label: 'Flashcard' },
            { id: 'matching', label: 'Nối từ' },
            { id: 'multiple_choice', label: 'Trắc nghiệm' },
            { id: 'quiz', label: 'Luyện tập' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap text-center ${activeMode === m.id
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xl'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
