import React from 'react';

/**
 * GrammarBulkPanel
 * Renders the AI Bulk Import tab inside GrammarAddModal.
 * Layout: left column (raw text input + AI button) | right column (preview cards)
 */
export default function GrammarBulkPanel({
  formData,
  handleInputChange,
  books,
  bulkInput,
  setBulkInput,
  isAiProcessing,
  handleBulkAiProcess,
  previewData,
  setPreviewData,
  handleSaveBulk,
  isSaving,
  onClose,
}) {
  return (
    <div className="flex-grow overflow-hidden flex flex-col p-8 gap-8">
      <div className="flex flex-col lg:flex-row gap-8 flex-grow overflow-hidden">
        {/* Left: Controls */}
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giáo trình</label>
              <select
                name="bookId"
                value={formData.bookId}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-black dark:focus:border-white transition-colors"
              >
                <option value="">-- Chọn --</option>
                {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </div>
            <div className="w-16 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tuần</label>
              <input
                type="number"
                min="1"
                name="week"
                value={formData.week}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-center outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>
            <div className="w-16 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày</label>
              <input
                type="number"
                min="1"
                name="day"
                value={formData.day}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-center outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-grow">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
              Nội dung thô (Raw Text)
            </label>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={"Ví dụ: \n1. ~たことがある\n2. ~ほうがいい\n3. ~なければならない"}
              className="flex-grow w-full p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/10 focus:border-black text-slate-900 dark:text-white outline-none transition-all resize-none rounded-3xl text-sm leading-relaxed"
            />
          </div>

          <button
            onClick={handleBulkAiProcess}
            disabled={isAiProcessing || !bulkInput.trim()}
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-30 flex items-center justify-center gap-2 hover:opacity-80"
          >
            {isAiProcessing
              ? <div className="w-4 h-4 border-2 border-slate-400 border-t-white dark:border-t-black rounded-full animate-spin" />
              : 'AI PHÂN TÍCH'
            }
          </button>
        </div>

        {/* Right: Preview Cards */}
        <div className="flex-grow flex flex-col gap-4 overflow-hidden bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
            <label className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
              Bản xem trước ({previewData.length} cấu trúc)
            </label>
            {previewData.length > 0 && (
              <div className="flex gap-4">
                <button
                  onClick={() => setPreviewData(prev => prev.map(d => ({ ...d, selected: true })))}
                  className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest hover:opacity-70 transition-opacity"
                >
                  Chọn tất cả
                </button>
                <button
                  onClick={() => setPreviewData(prev => prev.map(d => ({ ...d, selected: false })))}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  Bỏ chọn
                </button>
              </div>
            )}
          </div>

          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
            {previewData.length > 0 ? (
              <div className="space-y-6">
                {previewData.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-6 border rounded-2xl transition-all duration-300 bg-white dark:bg-slate-900 ${
                      item.selected 
                        ? 'border-slate-300 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none' 
                        : 'border-slate-200 dark:border-slate-800 opacity-60 scale-[0.98]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-start gap-4 flex-1 w-full">
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => {
                              const newData = [...previewData];
                              newData[idx].selected = !newData[idx].selected;
                              setPreviewData(newData);
                            }}
                            className="w-5 h-5 rounded-md border-slate-300 accent-black dark:accent-white cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.structure}
                            onChange={(e) => {
                              const newData = [...previewData];
                              newData[idx].structure = e.target.value;
                              setPreviewData(newData);
                            }}
                            className="font-black text-2xl text-slate-900 dark:text-white bg-transparent border-b-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-black dark:focus:border-white outline-none w-full transition-colors pb-1"
                            placeholder="Cấu trúc ngữ pháp"
                          />
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.level}</span>
                            {item.isDuplicate && (
                              <span className="text-[9px] font-black uppercase tracking-widest bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200">Đã tồn tại</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày</span>
                        <input
                          type="number"
                          min="1"
                          value={item.day ?? 1}
                          onChange={(e) => {
                            const newData = [...previewData];
                            const val = parseInt(e.target.value);
                            newData[idx] = { ...newData[idx], day: isNaN(val) || val < 1 ? 1 : val };
                            setPreviewData(newData);
                          }}
                          className="w-14 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center font-bold outline-none focus:border-black dark:focus:border-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="space-y-5">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ý nghĩa (Meaning)</label>
                        <input
                          type="text"
                          value={item.meaning}
                          onChange={(e) => {
                            const newData = [...previewData];
                            newData[idx].meaning = e.target.value;
                            setPreviewData(newData);
                          }}
                          placeholder="Nhập ý nghĩa tiếng Việt..."
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-slate-900 transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Giải thích chi tiết (Explanation)</label>
                        <textarea
                          value={item.explanation}
                          onChange={(e) => {
                            const newData = [...previewData];
                            newData[idx].explanation = e.target.value;
                            setPreviewData(newData);
                          }}
                          placeholder="Nhập giải thích ngữ pháp (hỗ trợ markdown)..."
                          rows={3}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-400 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-slate-900 transition-all resize-y"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        <div>
                          <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-2">Câu ví dụ (Tiếng Nhật)</label>
                          <textarea
                            value={item.exampleSentence}
                            onChange={(e) => {
                              const newData = [...previewData];
                              newData[idx].exampleSentence = e.target.value;
                              setPreviewData(newData);
                            }}
                            placeholder="Ví dụ tiếng Nhật..."
                            rows={2}
                            className="w-full px-4 py-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 transition-all resize-y"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">Dịch nghĩa ví dụ (Tiếng Việt)</label>
                          <textarea
                            value={item.exampleMeaning}
                            onChange={(e) => {
                              const newData = [...previewData];
                              newData[idx].exampleMeaning = e.target.value;
                              setPreviewData(newData);
                            }}
                            placeholder="Nghĩa của câu ví dụ..."
                            rows={2}
                            className="w-full px-4 py-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-amber-500 transition-all resize-y"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 space-y-4">
                <div className="text-6xl opacity-10 font-black italic">AI GRAMMAR</div>
                <p className="text-sm italic font-medium">Dán danh sách cấu trúc và nhấn phân tích để bắt đầu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="px-8 py-3 font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
          >
            HỦY
          </button>
          <button
            onClick={handleSaveBulk}
            disabled={previewData.length === 0 || !formData.bookId || isSaving}
            className="px-10 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all shadow-xl disabled:opacity-30 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-3 h-3 border-2 border-slate-400 border-t-white dark:border-t-black rounded-full animate-spin" />
                ĐANG LƯU...
              </>
            ) : (
              `LƯU (${previewData.filter(i => i.selected).length} CẤU TRÚC)`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
