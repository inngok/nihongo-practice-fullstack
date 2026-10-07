import React, { useState } from 'react';
import ExplanationEditor from './ExplanationEditor';

/**
 * GrammarSingleForm
 * Renders the single-grammar entry form (Tab "Thêm Thủ Công" / "Chỉnh Sửa").
 * All state & handlers are owned by GrammarAddModal and passed as props.
 */
export default function GrammarSingleForm({
  formData,
  handleInputChange,
  handleAiAutoFill,
  handleSmartPaste,
  isAiProcessing,
  examplesList,
  setExamplesList,
  quizList,
  setQuizList,
  books,
  isSaving,
  initialData,
  onSubmit,
}) {
  const [pasteText, setPasteText] = useState('');

  return (
    <form onSubmit={onSubmit} className="p-4 md:p-8 space-y-6 overflow-y-auto no-scrollbar">
      {/* Smart Paste Section */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-500 block">AI ĐIỀN TỪ VĂN BẢN (SMART PASTE)</label>
            <span className="text-[9px] text-slate-400 font-medium">Dán toàn bộ nội dung ngữ pháp vào đây, AI sẽ tự phân tích và điền vào form bên dưới.</span>
          </div>
          <button
            type="button"
            onClick={() => handleSmartPaste(pasteText)}
            disabled={isAiProcessing || !pasteText.trim()}
            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-black rounded-lg hover:bg-blue-600 hover:text-white transition-all uppercase tracking-tighter disabled:opacity-50"
          >
            PHÂN TÍCH VÀ ĐIỀN
          </button>
        </div>
        <textarea
          value={pasteText}
          onChange={e => setPasteText(e.target.value)}
          placeholder="Ví dụ: ~に向けて Ý nghĩa: Hướng tới, để chuẩn bị cho... Giải thích: Chỉ phương hướng..."
          rows="3"
          className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
        />
      </div>

      {/* Structure + Meaning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">Cấu trúc</label>
            <button
              type="button"
              onClick={handleAiAutoFill}
              disabled={isAiProcessing}
              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-black dark:text-white text-[9px] font-black rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase tracking-tighter flex items-center justify-center disabled:opacity-50"
              title="Gửi toàn bộ nội dung hiện tại cho AI để tự động sửa lỗi và chuẩn hóa lại form"
            >
              AI CHUẨN HÓA LẠI
            </button>
          </div>
          <input
            type="text"
            name="structure"
            value={formData.structure}
            onChange={handleInputChange}
            placeholder="Ví dụ: ~たことがある"
            required
            className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-lg outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Ý nghĩa</label>
          <input
            type="text"
            name="meaning"
            value={formData.meaning}
            onChange={handleInputChange}
            placeholder="Tiếng Việt"
            required
            className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-lg outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
          />
        </div>
      </div>

      {/* Explanation */}
      <ExplanationEditor 
        value={formData.explanation} 
        onChange={handleInputChange} 
      />

      {/* Examples List */}
      <div className="space-y-4 border-l-2 border-slate-100 dark:border-slate-800 pl-4 py-2">
        {examplesList.map((ex, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative group">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">
                Ví dụ {index + 1} (JP)
              </label>
              <input
                type="text"
                value={ex.sentence}
                onChange={e => {
                  const newList = [...examplesList];
                  newList[index].sentence = e.target.value;
                  setExamplesList(newList);
                }}
                placeholder="..."
                className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">
                  Dịch nghĩa {index + 1}
                </label>
                {examplesList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setExamplesList(examplesList.filter((_, i) => i !== index))}
                    className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Xóa
                  </button>
                )}
              </div>
              <input
                type="text"
                value={ex.meaning}
                onChange={e => {
                  const newList = [...examplesList];
                  newList[index].meaning = e.target.value;
                  setExamplesList(newList);
                }}
                placeholder="..."
                className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setExamplesList([...examplesList, { sentence: '', meaning: '' }])}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] text-blue-500 hover:text-blue-600 transition-colors pt-2"
        >
          + THÊM VÍ DỤ
        </button>
      </div>

      {/* Quiz List */}
      <div className="space-y-4 border-l-2 border-slate-100 dark:border-slate-800 pl-4 py-2">
        {quizList.map((quiz, index) => (
          <div key={index} className="space-y-2 relative group">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">
                Câu hỏi Trắc nghiệm {index + 1} (Đục lỗ bằng '_____')
              </label>
              {quizList.length > 1 && (
                <button
                  type="button"
                  onClick={() => setQuizList(quizList.filter((_, i) => i !== index))}
                  className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Xóa
                </button>
              )}
            </div>
            <input
              type="text"
              value={quiz}
              onChange={e => {
                const newList = [...quizList];
                newList[index] = e.target.value;
                setQuizList(newList);
              }}
              placeholder="Ví dụ: 山々に_____いて (dùng 5 dấu gạch dưới)"
              className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setQuizList([...quizList, ''])}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] text-blue-500 hover:text-blue-600 transition-colors pt-2"
        >
          + THÊM CÂU HỎI
        </button>
      </div>

      {/* Book / Week / Day */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 px-1">Giáo trình</label>
        <select
          name="bookId"
          value={formData.bookId}
          onChange={handleInputChange}
          required
          className="w-full px-1 py-1 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-xs outline-none transition-all"
        >
          <option value="" className="dark:bg-slate-950">-- Chọn --</option>
          {books.map(b => <option key={b.id} value={b.id} className="dark:bg-slate-950">{b.title}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 px-1">Tuần (Week)</label>
          <input
            type="number"
            name="week"
            min="1"
            value={formData.week}
            onChange={handleInputChange}
            className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 px-1">Ngày (Day)</label>
          <input
            type="number"
            name="day"
            min="1"
            value={formData.day}
            onChange={handleInputChange}
            className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:opacity-80 transition-all shadow-xl disabled:opacity-50"
        >
          {isSaving ? 'ĐANG LƯU...' : (initialData ? 'CẬP NHẬT' : 'LƯU DỮ LIỆU')}
        </button>
      </div>
    </form>
  );
}
