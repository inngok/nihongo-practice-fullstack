import React from 'react';

/**
 * GrammarBulkPanel
 * Renders the AI Bulk Import tab inside GrammarAddModal.
 * Layout: left column (raw text input + AI button) | right column (preview table)
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
      <div className="flex flex-col md:flex-row gap-8 flex-grow overflow-hidden">
        {/* Left: Controls */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giáo trình</label>
              <select
                name="bookId"
                value={formData.bookId}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none"
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
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none"
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
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none"
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
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {isAiProcessing
              ? <div className="w-4 h-4 border-2 border-slate-400 border-t-white dark:border-t-black rounded-full animate-spin" />
              : 'AI PHÂN TÍCH'
            }
          </button>
        </div>

        {/* Right: Preview Table */}
        <div className="flex-grow flex flex-col gap-4 overflow-hidden">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
              Bản xem trước ({previewData.length} cấu trúc)
            </label>
            {previewData.length > 0 && (
              <div className="flex gap-4">
                <button
                  onClick={() => setPreviewData(prev => prev.map(d => ({ ...d, selected: true })))}
                  className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest"
                >
                  Chọn tất cả
                </button>
                <button
                  onClick={() => setPreviewData(prev => prev.map(d => ({ ...d, selected: false })))}
                  className="text-[10px] font-black text-slate-300 uppercase tracking-widest"
                >
                  Bỏ chọn
                </button>
              </div>
            )}
          </div>

          <div className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden overflow-y-auto shadow-inner">
            {previewData.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 w-10 text-center" />
                    <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">Cấu trúc</th>
                    <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">Ý nghĩa</th>
                    <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">Ví dụ</th>
                    <th className="p-4 w-20 font-bold text-slate-500 uppercase tracking-wider text-center">Ngày</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {previewData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white dark:hover:bg-slate-900 transition-colors">
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => {
                            const newData = [...previewData];
                            newData[idx].selected = !newData[idx].selected;
                            setPreviewData(newData);
                          }}
                          className="w-4 h-4 rounded border-slate-300 accent-black dark:accent-white"
                        />
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item.structure}
                              onChange={(e) => {
                                const newData = [...previewData];
                                newData[idx].structure = e.target.value;
                                setPreviewData(newData);
                              }}
                              className="font-bold text-slate-900 dark:text-white text-base bg-transparent border-b border-slate-200 dark:border-slate-700 hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white outline-none w-full"
                            />
                            {item.isDuplicate && (
                              <span className="text-[8px] font-black uppercase bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded border border-rose-200 whitespace-nowrap">Đã có</span>
                            )}
                          </div>
                          <div className="text-black dark:text-white font-black uppercase tracking-widest text-[10px] opacity-50">{item.level}</div>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={item.meaning}
                            onChange={(e) => {
                              const newData = [...previewData];
                              newData[idx].meaning = e.target.value;
                              setPreviewData(newData);
                            }}
                            placeholder="Ý nghĩa"
                            className="font-medium text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-slate-700 hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white outline-none w-full"
                          />
                          <input
                            type="text"
                            value={item.explanation}
                            onChange={(e) => {
                              const newData = [...previewData];
                              newData[idx].explanation = e.target.value;
                              setPreviewData(newData);
                            }}
                            placeholder="Giải thích"
                            className="text-slate-500 dark:text-slate-400 italic bg-transparent border-b border-slate-200 dark:border-slate-700 hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white outline-none w-full text-xs"
                          />
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={item.exampleSentence}
                            onChange={(e) => {
                              const newData = [...previewData];
                              newData[idx].exampleSentence = e.target.value;
                              setPreviewData(newData);
                            }}
                            placeholder="Ví dụ tiếng Nhật"
                            className="text-slate-700 dark:text-slate-300 bg-transparent border-b border-slate-200 dark:border-slate-700 hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white outline-none w-full"
                          />
                          <input
                            type="text"
                            value={item.exampleMeaning}
                            onChange={(e) => {
                              const newData = [...previewData];
                              newData[idx].exampleMeaning = e.target.value;
                              setPreviewData(newData);
                            }}
                            placeholder="Nghĩa ví dụ"
                            className="text-slate-500 dark:text-slate-400 italic text-[10px] bg-transparent border-b border-slate-200 dark:border-slate-700 hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white outline-none w-full"
                          />
                        </div>
                      </td>
                      <td className="p-4 text-center align-top">
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
                          className="w-14 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-center outline-none focus:border-black dark:focus:border-white font-bold transition-colors"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 space-y-4 py-20">
                <div className="text-6xl opacity-10 font-black italic">AI GRAMMAR</div>
                <p className="text-sm italic">Dán danh sách cấu trúc và nhấn phân tích</p>
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
            className="px-10 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all shadow-xl disabled:opacity-30"
          >
            {isSaving ? 'ĐANG LƯU...' : `LƯU (${previewData.filter(i => i.selected).length} cấu trúc)`}
          </button>
        </div>
      </div>
    </div>
  );
}
