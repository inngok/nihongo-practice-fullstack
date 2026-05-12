import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import vocabService from '../../api/vocabService';
import bookService from '../../api/bookService';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons';

export default function VocabManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookIdParam = searchParams.get('bookId');
  const { fetchWithAuth } = useAuth();
  
  const [vocabs, setVocabs] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Filter State
  const [selectedBookId, setSelectedBookId] = useState(bookIdParam || '');
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    word: '',
    reading: '',
    meaning: '',
    example: '',
    exampleMeaning: '',
    bookId: '',
    week: '',
    day: ''
  });

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

  // Filtered List
  const filteredVocabs = React.useMemo(() => {
    if (!selectedBookId) return vocabs;
    return vocabs.filter(v => v.bookId?.toString() === selectedBookId.toString() || v.book?.id?.toString() === selectedBookId.toString());
  }, [vocabs, selectedBookId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vocabRes, bookRes] = await Promise.all([
        vocabService.getAll(),
        bookService.getAll()
      ]);
      setVocabs(vocabRes.data);
      setBooks(bookRes.data.filter(b => b.type && b.type.includes('VOCABULARY')));
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
      word: '',
      reading: '',
      meaning: '',
      example: '',
      exampleMeaning: '',
      bookId: '',
      week: '',
      day: ''
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

  const openEditModal = (vocab) => {
    setFormData({
      word: vocab.word,
      reading: vocab.reading,
      meaning: vocab.meaning,
      example: vocab.example,
      exampleMeaning: vocab.exampleMeaning,
      bookId: vocab.book?.id || '',
      week: vocab.week || '',
      day: vocab.day || ''
    });
    setEditingId(vocab.id);
    setIsModalOpen(true);
  };

  const handleAiAutoFill = async () => {
    if (!formData.word.trim()) {
      return message.warning('Vui lòng nhập Từ vựng trước khi nhấn AI Điền Nhanh');
    }
    setIsAiLoading(true);
    message.loading({ content: 'AI đang phân tích và soạn câu ví dụ...', key: 'ai_fill' });
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/generate-vocab?word=${encodeURIComponent(formData.word)}`);
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Không thể tải từ AI');
        throw new Error(errorText);
      }
      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        reading: data.reading || prev.reading,
        meaning: data.meaning || prev.meaning,
        example: data.example || prev.example,
        exampleMeaning: data.exampleMeaning || prev.exampleMeaning
      }));
      message.success({ content: 'Đã điền thông tin tự động từ AI!', key: 'ai_fill' });
    } catch (err) {
      message.error({ content: 'Lỗi khi gọi AI: ' + err.message, key: 'ai_fill' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      book: formData.bookId ? { id: parseInt(formData.bookId) } : null,
      week: formData.week ? parseInt(formData.week) : null,
      day: formData.day ? parseInt(formData.day) : null
    };
    delete payload.bookId;

    try {
      if (editingId) {
        await vocabService.update(editingId, payload);
      } else {
        await vocabService.create(payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
      message.success(editingId ? 'Cập nhật từ vựng thành công!' : 'Thêm từ vựng mới thành công!');
    } catch (err) {
      message.error('Đã có lỗi xảy ra!');
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa từ vựng này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await vocabService.delete(id);
          fetchData();
          message.success('Đã xóa từ vựng');
        } catch (err) {
          message.error('Không thể xóa từ vựng này.');
          console.error(err);
        }
      },
    });
  };

  const handleDeleteAll = () => {
    const bookTitle = selectedBookId 
      ? books.find(b => b.id.toString() === selectedBookId.toString())?.title || 'sách này'
      : 'tất cả hệ thống';

    Modal.confirm({
      title: 'Xác nhận Xóa Hàng Loạt ⚠️',
      content: `Bạn có chắc chắn muốn xóa toàn bộ từ vựng thuộc ${bookTitle}? Hành động này KHÔNG THỂ khôi phục!`,
      okText: 'Tôi đồng ý, Xóa tất cả',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const url = selectedBookId 
            ? `/vocabs/all?bookId=${selectedBookId}` 
            : '/vocabs/all';
          const res = await fetchWithAuth(`${API_BASE_URL}${url}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Không thể xóa hàng loạt');
          
          fetchData();
          message.success('Đã xóa sạch toàn bộ từ vựng thành công!');
        } catch (err) {
          message.error('Gặp lỗi khi xóa hàng loạt: ' + err.message);
          console.error(err);
        }
      }
    });
  };

  return (
    <div className="flex-grow w-full py-8 px-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100 bg-transparent">
      <div className="max-w-7xl mx-auto">
        
        {/* Minimalist Monochrome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý Từ vựng</h1>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">/ Vocabulary</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Cập nhật kho từ vựng giáo trình hệ thống</p>
          </div>
          <div className="flex gap-3 self-start md:self-auto">
            {vocabs.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                <DeleteOutlined className="text-[10px]" />
                {selectedBookId ? 'Xóa sách này' : 'Xóa tất cả'}
              </button>
            )}
            <button
              onClick={() => navigate('/grammar/books')}
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm bg-white dark:bg-slate-900"
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
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Từ vựng</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Cách đọc</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ý nghĩa</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Bài học</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Giáo trình</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                {filteredVocabs.length > 0 ? (
                  filteredVocabs.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{item.word}</div>
                      </td>
                      <td className="px-6 py-5 text-slate-500 dark:text-slate-400 font-medium italic text-sm">{item.reading}</td>
                      <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-[13px] italic">{item.meaning}</td>
                      <td className="px-6 py-5">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                          T{item.week || '-'} / N{item.day || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
                          {item.book?.title || 'Chưa phân loại'}
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
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-300 dark:text-slate-600 italic text-sm">Chưa có dữ liệu.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-auto">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {editingId ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}
              </h2>
              {selectedBookId && !editingId && (
                <div className="mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Thêm vào: </span>
                  <span className="text-[11px] font-black text-black dark:text-white uppercase tracking-tight">
                    {books.find(b => b.id.toString() === selectedBookId.toString())?.title}
                  </span>
                </div>
              )}
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
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Từ vựng</label>
                    <button
                      type="button"
                      onClick={handleAiAutoFill}
                      disabled={isAiLoading}
                      className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-40 transition-colors flex items-center gap-1"
                    >
                      <span>✨ AI Điền Nhanh</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    name="word"
                    value={formData.word}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 食べる"
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all text-lg font-bold rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Cách đọc (Hiragana)</label>
                  <input
                    type="text"
                    name="reading"
                    value={formData.reading}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: たべる"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`space-y-2 ${selectedBookId && !editingId ? 'md:col-span-2' : ''}`}>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Ý nghĩa (VN)</label>
                  <input
                    type="text"
                    name="meaning"
                    value={formData.meaning}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Ăn"
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
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Bài / Tuần (1-50)</label>
                  <select
                    name="week"
                    value={formData.week}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl"
                  >
                    <option value="" className="dark:bg-slate-950">-- Không chọn --</option>
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
                    <option value="" className="dark:bg-slate-950">-- Không chọn --</option>
                    {[...Array(7)].map((_, i) => (
                      <option key={i + 1} value={i + 1} className="dark:bg-slate-950">Ngày {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Câu ví dụ (JP)</label>
                <textarea
                  name="example"
                  value={formData.example}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: ご飯uを食べる"
                  rows="2"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all resize-none rounded-xl"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Nghĩa ví dụ (VN)</label>
                <textarea
                  name="exampleMeaning"
                  value={formData.exampleMeaning}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Ăn cơm"
                  rows="2"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all resize-none rounded-xl"
                ></textarea>
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
