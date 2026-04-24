import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookService from '../../api/bookService';

export default function BookManager() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    japaneseTitle: '',
    levelLabel: '',
    num: ''
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getAll();
      setBooks(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách sách.');
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
      title: '',
      japaneseTitle: '',
      levelLabel: '',
      num: ''
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setFormData({
      title: book.title,
      japaneseTitle: book.japaneseTitle,
      levelLabel: book.levelLabel,
      num: book.num
    });
    setEditingId(book.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await bookService.update(editingId, formData);
      } else {
        await bookService.create(formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchBooks();
    } catch (err) {
      alert('Đã có lỗi xảy ra!');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sách này? Tất cả dữ liệu liên quan có thể bị ảnh hưởng.')) {
      try {
        await bookService.delete(id);
        fetchBooks();
      } catch (err) {
        alert('Không thể xóa sách này.');
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
              onClick={() => navigate('/grammar/manage')}
              className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-4"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              Quay lại quản lý ngữ pháp
            </button>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Quản lý Giáo trình
            </h1>
          </div>
          <button
            onClick={openAddModal}
            className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-black/10 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Thêm giáo trình mới
          </button>
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
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">STT</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tên sách</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Nhãn level</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {books.length > 0 ? (
                  books.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-400">{item.num}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">{item.japaneseTitle}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                          {item.levelLabel}
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
                      Chưa có giáo trình nào.
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
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingId ? 'Chỉnh sửa giáo trình' : 'Thêm giáo trình mới'}
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">STT</label>
                  <input
                    type="text"
                    name="num"
                    value={formData.num}
                    onChange={handleInputChange}
                    placeholder="01"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Tên giáo trình</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Mimikara N3"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Tên tiếng Nhật</label>
                <input
                  type="text"
                  name="japaneseTitle"
                  value={formData.japaneseTitle}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 耳から覚える文法"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Nhãn Level (Hiển thị ở trang chủ)</label>
                <input
                  type="text"
                  name="levelLabel"
                  value={formData.levelLabel}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: TRÌNH ĐỘ N3 - N1"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                />
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
