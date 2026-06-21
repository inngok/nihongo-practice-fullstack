import React from 'react';

export default function DataImporterDuplicateModal({
  isOpen,
  dataType,
  duplicateItems,
  nonDuplicateItems,
  onKeepOld,
  onOverwriteNew,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-all animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 transform scale-100 transition-all animate-scale-in">
        {/* Icon & Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Phát hiện dữ liệu trùng</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Có <span className="font-bold text-slate-700 dark:text-slate-300">{duplicateItems.length}</span> bản ghi đã tồn tại trong giáo trình này.</p>
          </div>
        </div>

        {/* Content Detail */}
        <div className="bg-slate-50/50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Bản ghi mới (chưa có):</span>
            <span className="text-slate-900 dark:text-white">{nonDuplicateItems.length}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Bản ghi trùng (đã có):</span>
            <span className="text-slate-900 dark:text-white text-slate-900 dark:text-white font-bold">{duplicateItems.length}</span>
          </div>
          
          {/* Short preview of some duplicates */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Bản ghi trùng tiêu biểu:</span>
            <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 select-none">
              {duplicateItems.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-2.5 py-1">
                  <span className="font-bold">{dataType === 'kanjis' ? item.character : item.word}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">{item.meaning}</span>
                </div>
              ))}
              {duplicateItems.length > 5 && (
                <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium py-1">
                  và {duplicateItems.length - 5} bản ghi khác...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={onKeepOld}
            className="w-full py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            1. Giữ cái cũ (Bỏ qua {duplicateItems.length} bản trùng)
          </button>
          <button
            onClick={onOverwriteNew}
            className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-slate-100 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-slate-900/10 dark:shadow-none"
          >
            2. Theo cái mới (Ghi đè {duplicateItems.length} bản trùng)
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-white dark:bg-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            Hủy bỏ (Cancel)
          </button>
        </div>
      </div>
    </div>
  );
}
