import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import grammarService from '../../api/grammarService';
import bookService from '../../api/bookService';
import { Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons';

export default function GrammarManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookIdParam = searchParams.get('bookId');
  
  const [grammars, setGrammars] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [selectedBookId, setSelectedBookId] = useState(bookIdParam || '');
  
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
    bookId: '',
    week: 1,
    day: 1
  });

  const levelStyles = {
    N1: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20',
    N2: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20',
    N3: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20',
    N4: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20',
    N5: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-850',
  };

  const levels = ['N1', 'N2', 'N3', 'N4', 'N5'];

  useEffect(() => {
    fetchData();
    if (bookIdParam) {
      setSelectedBookId(bookIdParam);
    }

    // Listen for real-time cross-tab synchronization messages
    let channel;
    try {
      channel = new BroadcastChannel('nihongo-sync-channel');
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'BOOKS_UPDATED') {
          fetchData();
        }
      };
    } catch (err) {
      console.warn('BroadcastChannel failed to initialize:', err);
    }

    return () => {
      if (channel) {
        channel.close();
      }
    };
  }, [bookIdParam]);

  // Auto-fill Level from Book
  useEffect(() => {
    if (formData.bookId) {
      const selectedBook = books.find(b => b.id.toString() === formData.bookId.toString());
      if (selectedBook && selectedBook.levelLabel) {
        setFormData(prev => ({ ...prev, level: selectedBook.levelLabel }));
      }
    }
  }, [formData.bookId, books]);

  // Filtered List
  const filteredGrammars = React.useMemo(() => {
    if (!selectedBookId) return grammars;
    return grammars.filter(g => g.bookId?.toString() === selectedBookId.toString() || g.book?.id?.toString() === selectedBookId.toString());
  }, [grammars, selectedBookId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [grammarRes, bookRes] = await Promise.all([
        grammarService.getAll(),
        bookService.getAll()
      ]);
      setGrammars(grammarRes.data);
      setBooks(bookRes.data.filter(b => b.type && b.type.includes('GRAMMAR')));
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
      bookId: '',
      week: 1,
      day: 1
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    if (selectedBookId) {
      setFormData(prev => ({ ...prev, bookId: selectedBookId }));
    }
    setEditingId(null);
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
      bookId: grammar.book?.id || '',
      week: grammar.week || 1,
      day: grammar.day || 1
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
      message.success(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
    } catch (err) {
      message.error('Đã có lỗi xảy ra!');
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa cấu trúc này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await grammarService.delete(id);
          fetchData();
          message.success('Xóa cấu trúc thành công');
        } catch (err) {
          message.error('Không thể xóa cấu trúc này.');
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
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý Ngữ pháp</h1>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">/ Grammar</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Biên tập nội dung ngữ pháp hệ thống chi tiết</p>
          </div>
          <div className="flex gap-3 self-start md:self-auto">
            <button
              onClick={() => navigate('/grammar/books')}
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              Giáo trình
            </button>
            <button
              onClick={openAddModal}
              className="bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm flex items-center gap-2"
            >
              <PlusOutlined className="text-[10px]" />
              Thêm mới
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-4 mb-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl items-center">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <FilterOutlined className="text-xs" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Bộ lọc nhanh:</span>
          </div>
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-black/5 outline-none transition-all"
          >
            <option value="" className="dark:bg-slate-950">-- Tất cả giáo trình --</option>
            {books.map(b => (
              <option key={b.id} value={b.id} className="dark:bg-slate-950">{b.title}</option>
            ))}
          </select>
          {selectedBookId && (
            <button 
              onClick={() => setSelectedBookId('')}
              className="text-[10px] font-bold text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 uppercase tracking-tighter transition-colors"
            >
              Xóa lọc
            </button>
          )}
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
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Cấu trúc</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ý nghĩa</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Level</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Bài học</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                {filteredGrammars.length > 0 ? (
                  filteredGrammars.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors group">
                      <td className="px-6 py-5 font-bold text-slate-900 dark:text-white">{item.structure}</td>
                      <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-[13px] italic">{item.meaning}</td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${levelStyles[item.level] || levelStyles.N5}`}>
                          {item.level}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                          Tuần {item.week || '?'} · Ngày {item.day || '?'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-300 dark:text-slate-600 italic text-sm">Chưa có dữ liệu.</td>
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
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-left">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingId ? 'Chỉnh sửa ngữ pháp' : 'Thêm ngữ pháp mới'}
                </h2>
                {selectedBookId && !editingId && (
                  <div className="mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Thêm vào: </span>
                    <span className="text-[11px] font-black text-black dark:text-white uppercase tracking-tight">
                      {books.find(b => b.id.toString() === selectedBookId.toString())?.title}
                    </span>
                  </div>
                )}
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`space-y-2 ${selectedBookId && !editingId ? 'md:col-span-2' : ''}`}>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Cấu trúc</label>
                  <input
                    type="text"
                    name="structure"
                    value={formData.structure}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: ~たことがある"
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl"
                  />
                </div>
                {(!selectedBookId || editingId) && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Giáo trình</label>
                    <select
                      name="bookId"
                      value={formData.bookId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl"
                    >
                      <option value="" className="dark:bg-slate-950">-- Chọn giáo trình --</option>
                      {books.map(b => <option key={b.id} value={b.id} className="dark:bg-slate-950">{b.title}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`space-y-2 ${selectedBookId && !editingId ? 'md:col-span-2' : ''}`}>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Ý nghĩa</label>
                  <input
                    type="text"
                    name="meaning"
                    value={formData.meaning}
                    onChange={handleInputChange}
                    placeholder="Ý nghĩa tiếng Việt"
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl"
                  />
                </div>
                {(!selectedBookId || editingId) && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Level</label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl"
                    >
                      {levels.map(l => <option key={l} value={l} className="dark:bg-slate-950">{l}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Bài / Tuần (1-50)</label>
                  <select
                    name="week"
                    value={formData.week}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl"
                  >
                    {[...Array(50)].map((_, i) => (
                      <option key={i + 1} value={i + 1} className="dark:bg-slate-950">Bài / Tuần {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Ngày (1-7)</label>
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl"
                  >
                    {[...Array(7)].map((_, i) => (
                      <option key={i + 1} value={i + 1} className="dark:bg-slate-950">Ngày {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Giải thích</label>
                <textarea
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleInputChange}
                  placeholder="Cách dùng, lưu ý..."
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all resize-none rounded-xl"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Câu ví dụ (JP)</label>
                  <input
                    type="text"
                    name="exampleSentence"
                    value={formData.exampleSentence}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Nghĩa ví dụ (VN)</label>
                  <input
                    type="text"
                    name="exampleMeaning"
                    value={formData.exampleMeaning}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl"
                  />
                </div>
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
