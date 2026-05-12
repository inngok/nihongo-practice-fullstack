import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import kanjiService from '../../api/kanjiService';
import bookService from '../../api/bookService';
import { Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons';

export default function KanjiManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookIdParam = searchParams.get('bookId');
  
  const [kanjis, setKanjis] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [selectedBookId, setSelectedBookId] = useState(bookIdParam || '');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    character: '',
    kunyomi: '',
    onyomi: '',
    hanviet: '',
    meaning: '',
    examples: '',
    bookId: '',
    week: '',
    day: '',
    page: ''
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
  const filteredKanjis = React.useMemo(() => {
    if (!selectedBookId) return kanjis;
    return kanjis.filter(k => k.bookId?.toString() === selectedBookId.toString() || k.book?.id?.toString() === selectedBookId.toString());
  }, [kanjis, selectedBookId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [kanjiRes, bookRes] = await Promise.all([
        kanjiService.getAll(),
        bookService.getAll()
      ]);
      setKanjis(kanjiRes.data);
      setBooks(bookRes.data.filter(b => b.type && b.type.includes('KANJI')));
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
      character: '',
      kunyomi: '',
      onyomi: '',
      hanviet: '',
      meaning: '',
      examples: '',
      bookId: '',
      week: '',
      day: '',
      page: ''
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

  const openEditModal = (kanji) => {
    setFormData({
      character: kanji.character,
      kunyomi: kanji.kunyomi,
      onyomi: kanji.onyomi,
      hanviet: kanji.hanviet,
      meaning: kanji.meaning,
      examples: kanji.examples,
      bookId: kanji.book?.id || '',
      week: kanji.week || '',
      day: kanji.day || '',
      page: kanji.page || ''
    });
    setEditingId(kanji.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      book: formData.bookId ? { id: parseInt(formData.bookId) } : null
    };
    delete payload.bookId;

    try {
      if (editingId) {
        await kanjiService.update(editingId, payload);
      } else {
        await kanjiService.create(payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
      message.success(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
    } catch (err) {
      console.error(err);
      message.error('Đã có lỗi xảy ra!');
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa chữ Hán này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await kanjiService.delete(id);
          fetchData();
          message.success('Đã xóa thành công');
        } catch (err) {
          message.error('Không thể xóa dữ liệu này.');
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
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý Hán tự</h1>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">/ Kanji</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Hệ thống dữ liệu Kanji & Hán Việt chi tiết</p>
          </div>
          <button 
            onClick={openAddModal} 
            className="bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm flex items-center gap-2 self-start md:self-auto"
          >
            <PlusOutlined className="text-[10px]" />
            Thêm mới
          </button>
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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-slate-100 dark:border-slate-800 border-t-black dark:border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Hán tự</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Hán Việt</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Âm On/Kun</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ý nghĩa</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Giáo trình</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                {filteredKanjis.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors group">
                    <td className="px-6 py-5 font-bold text-slate-900 dark:text-white text-2xl leading-none">{item.character}</td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[11px] bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                        {item.hanviet}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">ON: <span className="text-slate-900 dark:text-slate-200">{item.onyomi}</span></span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">KUN: <span className="text-slate-600 dark:text-slate-300">{item.kunyomi}</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-[13px] italic">{item.meaning}</td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
                        {item.book?.title || 'Chưa phân loại'}{item.page ? ` • Trang ${item.page}` : ''}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{editingId ? 'Chỉnh sửa Hán tự' : 'Thêm Hán tự mới'}</h2>
                {selectedBookId && !editingId && (
                  <div className="mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Thêm vào: </span>
                    <span className="text-[11px] font-black text-black dark:text-white uppercase tracking-tight">
                      {books.find(b => b.id.toString() === selectedBookId.toString())?.title}
                    </span>
                  </div>
                )}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-black dark:hover:text-white transition-colors">Đóng</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Chữ Hán</label>
                  <input type="text" name="character" value={formData.character} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Âm Hán Việt</label>
                  <input type="text" name="hanviet" value={formData.hanviet} onChange={handleInputChange} required placeholder="Ví dụ: NHẤT" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl uppercase" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`space-y-2 ${selectedBookId && !editingId ? 'md:col-span-2' : ''}`}>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Ý nghĩa</label>
                  <input type="text" name="meaning" value={formData.meaning} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl" />
                </div>
                {(!selectedBookId || editingId) && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Bộ sách</label>
                    <select name="bookId" value={formData.bookId} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl">
                      <option value="" className="dark:bg-slate-950">-- Chọn --</option>
                      {books.map(b => <option key={b.id} value={b.id} className="dark:bg-slate-950">{b.title}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Âm ON</label>
                  <input type="text" name="onyomi" value={formData.onyomi} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Âm KUN</label>
                  <input type="text" name="kunyomi" value={formData.kunyomi} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Ví dụ (Một ví dụ mỗi dòng)</label>
                <textarea name="examples" value={formData.examples} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all resize-none rounded-xl" placeholder="Ví dụ: &#10;一人: một người&#10;二人: hai người"></textarea>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Bài / Tuần (1-50)</label>
                  <select name="week" value={formData.week} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl">
                    <option value="" className="dark:bg-slate-950">-- Chọn --</option>
                    {[...Array(50)].map((_, i) => <option key={i+1} value={i+1} className="dark:bg-slate-950">Bài / Tuần {i+1}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Ngày (1-7)</label>
                  <select name="day" value={formData.day} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl">
                    <option value="" className="dark:bg-slate-950">-- Chọn --</option>
                    {[...Array(7)].map((_, i) => <option key={i+1} value={i+1} className="dark:bg-slate-950">Ngày {i+1}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Số Trang</label>
                  <input type="number" name="page" value={formData.page} onChange={handleInputChange} placeholder="Ví dụ: 15" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all rounded-xl" />
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all bg-transparent">Hủy</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl shadow-black/10 dark:shadow-none">{editingId ? 'Cập nhật' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
