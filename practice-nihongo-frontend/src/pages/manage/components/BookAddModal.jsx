import React from 'react';
import { message } from 'antd';

export default function BookAddModal({
  isModalOpen,
  setIsModalOpen,
  editingId,
  formData,
  setFormData,
  handleSubmit,
  handleInputChange
}) {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {editingId ? 'Chỉnh sửa giáo trình' : 'Thêm giáo trình mới'}
          </h2>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="p-2 text-slate-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">STT</label>
              <input
                type="text"
                name="num"
                value={formData.num}
                onChange={handleInputChange}
                placeholder="01"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl"
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Tên giáo trình</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ví dụ: Mimikara N3"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Tên tiếng Nhật</label>
            <input
              type="text"
              name="japaneseTitle"
              value={formData.japaneseTitle}
              onChange={handleInputChange}
              placeholder="Ví dụ: 耳から覚える文法"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Phân loại giáo trình (Chọn nhiều loại nếu sách tích hợp)</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'VOCABULARY', label: 'Từ Vựng' },
                { key: 'KANJI', label: 'Hán Tự' },
                { key: 'GRAMMAR', label: 'Ngữ Pháp' }
              ].map(item => {
                const isActive = formData.types.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      const newTypes = isActive
                        ? formData.types.filter(t => t !== item.key)
                        : [...formData.types, item.key];
                      // Ensure at least one category is checked
                      if (newTypes.length > 0) {
                        setFormData(prev => ({ ...prev, types: newTypes }));
                      } else {
                        message.warning('Giáo trình phải thuộc ít nhất một phân loại!');
                      }
                    }}
                    className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all ${
                      isActive
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Nhãn Level (Hiển thị ở trang chủ)</label>
            <select
              name="levelLabel"
              value={formData.levelLabel}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl font-bold text-xs"
            >
              <option value="" className="dark:bg-slate-950">-- Chọn level --</option>
              {['N1', 'N2', 'N3', 'N4', 'N5'].map(lvl => (
                <option key={lvl} value={lvl} className="dark:bg-slate-950">{lvl}</option>
              ))}
            </select>
          </div>

          {formData.types.includes('GRAMMAR') && (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">HIỂN THỊ NGỮ PHÁP</span>
                <span className="text-[10px] text-slate-400">Cho phép học viên xem phần ngữ pháp của sách này</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.publishGrammar} onChange={(e) => setFormData(prev => ({...prev, publishGrammar: e.target.checked}))} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-black dark:peer-checked:bg-white"></div>
              </label>
            </div>
          )}

          {formData.types.includes('VOCABULARY') && (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">HIỂN THỊ TỪ VỰNG</span>
                <span className="text-[10px] text-slate-400">Cho phép học viên xem phần từ vựng của sách này</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.publishVocab} onChange={(e) => setFormData(prev => ({...prev, publishVocab: e.target.checked}))} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-black dark:peer-checked:bg-white"></div>
              </label>
            </div>
          )}

          {formData.types.includes('KANJI') && (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">HIỂN THỊ HÁN TỰ</span>
                <span className="text-[10px] text-slate-400">Cho phép học viên xem phần hán tự của sách này</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.publishKanji} onChange={(e) => setFormData(prev => ({...prev, publishKanji: e.target.checked}))} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-black dark:peer-checked:bg-white"></div>
              </label>
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl shadow-black/10 dark:shadow-none"
            >
              {editingId ? 'Cập nhật' : 'Lưu dữ liệu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
