import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import kanjiService from '../../api/kanjiService';
import bookService from '../../api/bookService';
import { Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function KanjiManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookIdParam = searchParams.get('bookId');
  
  const [kanjis, setKanjis] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchWithAuth } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalTab, setModalTab] = useState('single'); // 'single' or 'bulk'
  const [bulkInput, setBulkInput] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Filter State
  const [selectedBookId, setSelectedBookId] = useState(bookIdParam || '');
  
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
    if (!selectedBookId || selectedBookId === "") return kanjis || [];
    return (kanjis || []).filter(k => {
      const kBookId = k.bookId || k.book?.id;
      return kBookId?.toString() === selectedBookId.toString();
    });
  }, [kanjis, selectedBookId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [kanjiRes, bookRes] = await Promise.all([
        kanjiService.getAll(),
        bookService.getAll()
      ]);
      setKanjis(Array.isArray(kanjiRes.data) ? kanjiRes.data : []);
      setBooks(Array.isArray(bookRes.data) ? bookRes.data.filter(b => b.type && b.type.includes('KANJI')) : []);
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
    setModalTab('single');
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
    setModalTab('single');
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

  const handleBulkAiProcess = async () => {
    if (!bulkInput.trim()) return message.warning('Vui lòng dán nội dung cần xử lý');
    if (!selectedBookId) return message.warning('Vui lòng chọn giáo trình trước khi nhập hàng loạt');

    setIsAiProcessing(true);
    const hide = message.loading('AI đang phân tích Hán tự hàng loạt...', 0);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/generate-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: bulkInput,
          type: 'KANJI'
        })
      });
      if (!res.ok) throw new Error('AI processing failed');
      const data = await res.json();
      setPreviewData(data.map(item => ({ ...item, selected: true })));
      message.success('Đã phân tích xong Hán tự!');
    } catch (err) {
      message.error('Lỗi khi xử lý hàng loạt: ' + err.message);
    } finally {
      setIsAiProcessing(false);
      hide();
    }
  };

  const handleSaveBulk = async () => {
    const itemsToSave = previewData.filter(item => item.selected);
    if (itemsToSave.length === 0) return message.warning('Không có chữ Hán nào được chọn');

    const hide = message.loading(`Đang lưu ${itemsToSave.length} chữ Hán...`, 0);
    try {
      const payload = itemsToSave.map(item => ({
        character: item.character,
        kunyomi: item.kunyomi,
        onyomi: item.onyomi,
        hanviet: item.hanviet,
        meaning: item.meaning,
        examples: item.examples,
        book: { id: parseInt(selectedBookId) },
        week: formData.week ? parseInt(formData.week) : null,
        day: formData.day ? parseInt(formData.day) : null
      }));

      for (const item of payload) {
        await kanjiService.create(item);
      }

      message.success(`Đã lưu thành công ${itemsToSave.length} chữ Hán!`);
      setIsModalOpen(false);
      setBulkInput('');
      setPreviewData([]);
      fetchData();
    } catch (err) {
      message.error('Lỗi khi lưu dữ liệu: ' + err.message);
    } finally {
      hide();
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
          <div className="flex gap-3 self-start md:self-auto">
            <button
              onClick={() => navigate('/grammar/books')}
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm"
            >
              Giáo trình
            </button>
            <button
              onClick={openAddModal}
              className="bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-lg text-xs font-bold hover:opacity-80 transition-all shadow-xl flex items-center gap-2"
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

      {/* Unified Add/Bulk Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full ${modalTab === 'bulk' ? 'max-w-6xl' : 'max-w-lg'} rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-300 transition-all overflow-hidden`}>
            {/* Header with Tabs */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setModalTab('single')}
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all pb-1 ${modalTab === 'single' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
                >
                  {editingId ? 'CHỈNH SỬA' : 'THÊM THỦ CÔNG'}
                </button>
                {!editingId && (
                  <button 
                    onClick={() => setModalTab('bulk')}
                    className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all pb-1 ${modalTab === 'bulk' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
                  >
                    AI NHẬP HÀNG LOẠT
                  </button>
                )}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-black dark:hover:text-white transition-colors">
                Đóng
              </button>
            </div>

            {modalTab === 'single' ? (
              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto hide-scrollbar">
                 <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <div className="flex justify-between items-center px-1">
                       <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">Hán tự</label>
                       <button type="button" onClick={() => setModalTab('bulk')} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-black dark:text-white text-[9px] font-black rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase tracking-tighter flex items-center gap-1">
                         <span>✨</span> AI ĐIỀN
                       </button>
                     </div>
                     <input 
                       type="text" 
                       name="character" 
                       value={formData.character} 
                       onChange={handleInputChange} 
                       placeholder="Chữ Hán" 
                       required 
                       className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-lg outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700" 
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Hán Việt</label>
                     <input 
                       type="text" 
                       name="hanviet" 
                       value={formData.hanviet} 
                       onChange={handleInputChange} 
                       placeholder="ÂM HÁN VIỆT" 
                       required 
                       className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-lg outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700 uppercase" 
                     />
                   </div>
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

                 <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Âm ON</label>
                     <input 
                       type="text" 
                       name="onyomi" 
                       value={formData.onyomi} 
                       onChange={handleInputChange} 
                       placeholder="Onyomi" 
                       className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700" 
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Âm KUN</label>
                     <input 
                       type="text" 
                       name="kunyomi" 
                       value={formData.kunyomi} 
                       onChange={handleInputChange} 
                       placeholder="Kunyomi" 
                       className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700" 
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 px-1">Giáo trình</label>
                   <select 
                     name="bookId" 
                     value={formData.bookId} 
                     onChange={handleInputChange} 
                     className="w-full px-1 py-1 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-xs outline-none transition-all"
                   >
                     <option value="" className="dark:bg-slate-950">-- Chọn --</option>
                     {books.map(b => <option key={b.id} value={b.id} className="dark:bg-slate-950">{b.title}</option>)}
                   </select>
                 </div>

                 <div className="pt-4">
                   <button 
                     type="submit" 
                     className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:opacity-80 transition-all shadow-xl"
                   >
                     {editingId ? 'CẬP NHẬT' : 'LƯU DỮ LIỆU'}
                   </button>
                 </div>
              </form>
            ) : (
              <div className="flex-grow overflow-hidden flex flex-col p-8 gap-8">
                 <div className="flex flex-col md:flex-row gap-8 flex-grow overflow-hidden">
                    <div className="w-full md:w-1/3 flex flex-col gap-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Nội dung thô (Raw Text)</label>
                      <textarea
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        placeholder="Ví dụ: &#10;1. 食 - thực - ăn&#10;2. 行 - hành - đi&#10;3. 寝 - tẩm - ngủ"
                        className="flex-grow w-full p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all resize-none rounded-3xl text-sm leading-relaxed"
                      ></textarea>
                      <button
                        onClick={handleBulkAiProcess}
                        disabled={isAiProcessing || !bulkInput.trim()}
                        className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-30 flex items-center justify-center gap-2"
                      >
                        {isAiProcessing ? (
                          <div className="w-4 h-4 border-2 border-slate-400 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                        ) : 'AI PHÂN TÍCH'}
                      </button>
                    </div>

                    <div className="flex-grow flex flex-col gap-4 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
                          Bản xem trước ({previewData.length} chữ)
                        </label>
                        {previewData.length > 0 && (
                          <div className="flex gap-4">
                             <button onClick={() => setPreviewData(prev => prev.map(d => ({...d, selected: true})))} className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Chọn tất cả</button>
                             <button onClick={() => setPreviewData(prev => prev.map(d => ({...d, selected: false})))} className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Bỏ chọn</button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden overflow-y-auto shadow-inner">
                        {previewData.length > 0 ? (
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10 border-b border-slate-200 dark:border-slate-800">
                              <tr>
                                <th className="p-4 w-10 text-center"></th>
                                <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">Hán tự</th>
                                <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">Hán Việt</th>
                                <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">ON/KUN</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                              {previewData.map((item, idx) => (
                                <tr key={idx} className="hover:bg-white dark:hover:bg-slate-900 transition-colors">
                                  <td className="p-4 text-center">
                                    <input type="checkbox" checked={item.selected} onChange={() => {
                                        const newData = [...previewData];
                                        newData[idx].selected = !newData[idx].selected;
                                        setPreviewData(newData);
                                      }} className="w-4 h-4 rounded border-slate-300 accent-black dark:accent-white" />
                                  </td>
                                  <td className="p-4 text-center">
                                    <div className="font-bold text-slate-900 dark:text-white text-2xl">{item.character}</div>
                                    <div className="text-slate-400 italic text-[10px]">{item.meaning}</div>
                                  </td>
                                  <td className="p-4 text-center font-black text-black dark:text-white uppercase tracking-widest">{item.hanviet}</td>
                                  <td className="p-4">
                                    <div className="text-slate-700 dark:text-slate-300">ON: {item.onyomi}</div>
                                    <div className="text-slate-400 text-[10px]">KUN: {item.kunyomi}</div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 space-y-4 py-20">
                            <div className="text-6xl opacity-10 font-black italic">AI KANJI</div>
                            <p className="text-sm italic">Dán danh sách Kanji và nhấn phân tích</p>
                          </div>
                        )}
                      </div>
                    </div>
                 </div>

                 <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex gap-4">
                      <select value={selectedBookId} onChange={(e) => setSelectedBookId(e.target.value)} className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none">
                        <option value="">-- Chọn giáo trình --</option>
                        {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">HỦY</button>
                      <button onClick={handleSaveBulk} disabled={previewData.length === 0} className="px-10 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all shadow-xl disabled:opacity-30">
                        LƯU ({previewData.filter(i => i.selected).length} chữ)
                      </button>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
