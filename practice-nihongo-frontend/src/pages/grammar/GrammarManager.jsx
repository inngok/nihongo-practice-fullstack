import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import grammarService from '../../api/grammarService';
import bookService from '../../api/bookService';

export default function GrammarManager() {
  const navigate = useNavigate();
  const [grammars, setGrammars] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    structure: '',
    meaning: '',
    explanation: '',
    exampleSentence: '',
    exampleMeaning: '',
    level: 'N3',
    bookId: ''
  });

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [grammarRes, bookRes] = await Promise.all([
        grammarService.getAll(),
        bookService.getAll()
      ]);
      setGrammars(grammarRes.data);
      setBooks(bookRes.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      structure: '',
      meaning: '',
      explanation: '',
      exampleSentence: '',
      exampleMeaning: '',
      level: 'N3',
      bookId: ''
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (grammar) => {
    setFormData({
      structure: grammar.structure,
      meaning: grammar.meaning,
      explanation: grammar.explanation,
      exampleSentence: grammar.exampleSentence,
      exampleMeaning: grammar.exampleMeaning,
      level: grammar.level,
      bookId: grammar.book?.id || ''
    });
    setEditingId(grammar.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      book: formData.bookId ? { id: parseInt(formData.bookId) } : null
    };
    delete payload.bookId; // Remove bookId from payload before sending to backend

    try {
      if (editingId) {
        await grammarService.update(editingId, payload);
      } else {
        await grammarService.create(payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert('Đã có lỗi xảy ra!');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cấu trúc này?')) {
      try {
        await grammarService.delete(id);
        fetchData();
      } catch (err) {
        alert('Không thể xóa cấu trúc này.');
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center pt-24 md:pt-28 pb-16 px-6 font-sans">
      <div className="w-full max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <button
              onClick={() => navigate('/grammar')}
              className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-4"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              Quay lại
            </button>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Quản lý ngữ pháp
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/grammar/books')}
              className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              Quản lý giáo trình
            </button>
            <button
              onClick={openAddModal}
              className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-black/10 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Thêm ngữ pháp mới
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl text-center font-medium">
            {error}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Cấu trúc</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Giáo trình</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ý nghĩa</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Level</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {grammars.length > 0 ? (
                  grammars.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900">{item.structure}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                          {item.book?.title || 'Chưa phân loại'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-slate-600 text-sm line-clamp-1">{item.meaning}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase 
                          ${item.level === 'N1' ? 'bg-red-50 text-red-600' : 
                            item.level === 'N2' ? 'bg-orange-50 text-orange-600' : 
                            item.level === 'N3' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                          {item.level}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(item)}
                            className="p-2 text-slate-400 hover:text-black transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">
                      Chưa có dữ liệu ngữ pháp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingId ? 'Chỉnh sửa ngữ pháp' : 'Thêm ngữ pháp mới'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-black transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Cấu trúc</label>
                  <input
                    type="text"
                    name="structure"
                    value={formData.structure}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: ~たことがある"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Giáo trình</label>
                  <select
                    name="bookId"
                    value={formData.bookId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all appearance-none"
                  >
                    <option value="">-- Chọn giáo trình --</option>
                    {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Ý nghĩa</label>
                  <input
                    type="text"
                    name="meaning"
                    value={formData.meaning}
                    onChange={handleInputChange}
                    placeholder="Ý nghĩa tiếng Việt"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all appearance-none"
                  >
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Giải thích</label>
                <textarea
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleInputChange}
                  placeholder="Cách dùng, lưu ý..."
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Câu ví dụ (JP)</label>
                  <input
                    type="text"
                    name="exampleSentence"
                    value={formData.exampleSentence}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Nghĩa ví dụ (VN)</label>
                  <input
                    type="text"
                    name="exampleMeaning"
                    value={formData.exampleMeaning}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-black text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-black/10"
                >
                  {editingId ? 'Cập nhật' : 'Lưu dữ liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
