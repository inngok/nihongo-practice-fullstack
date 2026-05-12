import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookService from '../../api/bookService';
import { Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

// Static lookup maps for premium typographical tags, eliminating conditional if-else branches in JSX
const CATEGORY_STYLES = {
  KANJI: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
  GRAMMAR: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50',
  VOCABULARY: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
};

const CATEGORY_LABELS = {
  KANJI: 'Hán Tự',
  GRAMMAR: 'Ngữ Pháp',
  VOCABULARY: 'Từ Vựng'
};

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
    num: '',
    types: ['VOCABULARY']
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
      num: '',
      types: ['VOCABULARY']
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    const bookTypes = book.type ? book.type.split(',') : ['VOCABULARY'];
    setFormData({
      title: book.title,
      japaneseTitle: book.japaneseTitle,
      levelLabel: book.levelLabel,
      num: book.num,
      types: bookTypes
    });
    setEditingId(book.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        japaneseTitle: formData.japaneseTitle,
        levelLabel: formData.levelLabel,
        num: formData.num,
        type: formData.types.join(',')
      };

      if (editingId) {
        await bookService.update(editingId, payload);
      } else {
        await bookService.create(payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchBooks();
      message.success(editingId ? 'Cập nhật giáo trình thành công!' : 'Thêm giáo trình mới thành công!');

      // Broadcast update to other open tabs
      try {
        const channel = new BroadcastChannel('nihongo-sync-channel');
        channel.postMessage({ type: 'BOOKS_UPDATED' });
        channel.close();
      } catch (broadcastErr) {
        console.warn('Failed to broadcast sync event:', broadcastErr);
      }
    } catch (err) {
      message.error('Đã có lỗi xảy ra!');
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa giáo trình này? Tất cả dữ liệu liên quan (ngữ pháp, từ vựng) có thể bị ảnh hưởng.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await bookService.delete(id);
          fetchBooks();
          message.success('Đã xóa giáo trình');

          // Broadcast update to other open tabs
          try {
            const channel = new BroadcastChannel('nihongo-sync-channel');
            channel.postMessage({ type: 'BOOKS_UPDATED' });
            channel.close();
          } catch (broadcastErr) {
            console.warn('Failed to broadcast sync event:', broadcastErr);
          }
        } catch (err) {
          message.error('Không thể xóa giáo trình này.');
          console.error(err);
        }
      },
    });
  };

  return (
    <div className="flex-grow w-full py-8 px-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100 bg-transparent">
      <div className="max-w-7xl mx-auto">
        
        {/* Minimalist Monochrome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý Giáo trình</h1>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">/ Textbooks</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Danh mục sách và tài liệu học tập hệ thống</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm flex items-center gap-2 self-start md:self-auto"
          >
            <PlusOutlined className="text-[10px]" />
            Thêm mới
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-slate-100 dark:border-slate-800 border-t-black dark:border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">STT</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tên giáo trình</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Phân loại</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Nhãn level</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                {books.length > 0 ? (
                  books.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors group">
                      <td className="px-6 py-5 font-bold text-slate-300 dark:text-slate-600">#{item.num}</td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900 dark:text-white leading-tight">{item.title}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">{item.japaneseTitle}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {item.type && item.type.split(',').map(t => {
                            const styleClass = CATEGORY_STYLES[t] || CATEGORY_STYLES.VOCABULARY;
                            const labelText = CATEGORY_LABELS[t] || CATEGORY_LABELS.VOCABULARY;
                            return (
                              <span key={t} className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${styleClass}`}>
                                {labelText}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                          {item.levelLabel}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-2 mr-4">
                            <button onClick={() => navigate(`/vocabulary/manage?bookId=${item.id}`)} className="text-[10px] font-bold text-slate-400 hover:text-black dark:hover:text-white uppercase tracking-tighter">Từ vựng</button>
                            <span className="text-slate-100 dark:text-slate-800">|</span>
                            <button onClick={() => navigate(`/kanji/manage?bookId=${item.id}`)} className="text-[10px] font-bold text-slate-400 hover:text-black dark:hover:text-white uppercase tracking-tighter">Hán tự</button>
                            <span className="text-slate-100 dark:text-slate-800">|</span>
                            <button onClick={() => navigate(`/grammar/manage?bookId=${item.id}`)} className="text-[10px] font-bold text-slate-400 hover:text-black dark:hover:text-white uppercase tracking-tighter">Ngữ pháp</button>
                          </div>
                          <div className="flex gap-1 border-l border-slate-100 dark:border-slate-800 pl-4">
                            <button 
                              onClick={() => openEditModal(item)} 
                              className="p-2 text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                              title="Sửa"
                            >
                              <EditOutlined className="text-base" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)} 
                              className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              title="Xóa"
                            >
                              <DeleteOutlined className="text-base" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-300 dark:text-slate-600 italic text-sm">Chưa có giáo trình nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
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
      )}
    </div>
  );
}
