import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import vocabService from '../../api/vocabService';
import bookService from '../../api/bookService';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { Modal, message, Select, Empty } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FilterOutlined, 
  ThunderboltOutlined,
  SearchOutlined,
  CloseOutlined
} from '@ant-design/icons';

const customStyles = `
  .custom-select .ant-select-selector {
    padding: 0 !important;
    background: transparent !important;
  }
  .custom-select-popup {
    padding: 8px !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
    border: 1px solid #e2e8f0 !important;
  }
  .dark .custom-select-popup {
    background-color: #0f172a !important;
    border-color: #1e293b !important;
  }
  .custom-select-popup .ant-select-item-option-selected {
    background-color: #000 !important;
    color: #fff !important;
    border-radius: 6px !important;
  }
  .dark .custom-select-popup .ant-select-item-option-selected {
    background-color: #fff !important;
    color: #000 !important;
  }
  .custom-select-popup .ant-select-item {
    border-radius: 6px !important;
    margin-bottom: 2px !important;
    padding: 8px 12px !important;
  }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

export default function VocabManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookIdParam = searchParams.get('bookId');
  const { fetchWithAuth } = useAuth();
  
  const [vocabs, setVocabs] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedBookId, setSelectedBookId] = useState(bookIdParam || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalTab, setModalTab] = useState('single');
  const [bulkInput, setBulkInput] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const [formData, setFormData] = useState({
    word: '', reading: '', meaning: '', example: '', exampleMeaning: '', bookId: '', week: '', day: ''
  });
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({ week: '', day: '', bookId: '' });
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchData();
    if (bookIdParam) setSelectedBookId(bookIdParam);
    const channel = new BroadcastChannel('nihongo-sync-channel');
    channel.onmessage = (e) => e.data?.type === 'BOOKS_UPDATED' && fetchData();
    return () => channel.close();
  }, [bookIdParam]);

  const filteredVocabs = React.useMemo(() => {
    let data = Array.isArray(vocabs) ? vocabs : [];
    if (selectedBookId) {
      data = data.filter(v => (v.bookId || v.book?.id)?.toString() === selectedBookId.toString());
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      data = data.filter(v => v.word?.toLowerCase().includes(s) || v.reading?.toLowerCase().includes(s) || v.meaning?.toLowerCase().includes(s));
    }
    return data;
  }, [vocabs, selectedBookId, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Only fetch system curriculum vocabs
      const [vRes, bRes] = await Promise.all([
        vocabService.getAll({ includePersonal: false }),
        bookService.getAll()
      ]);
      
      // Strictly filter out any vocabs that don't belong to a book (personal/orphaned vocabs)
      const allVocabs = Array.isArray(vRes.data) ? vRes.data : [];
      const systemVocabs = allVocabs.filter(v => v.book != null);
      
      setVocabs(systemVocabs);
      setBooks(Array.isArray(bRes.data) ? bRes.data.filter(b => b.type?.includes('VOCABULARY')) : []);
    } catch (err) {
      messageApi.error('Lỗi tải dữ liệu giáo trình');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({ word: '', reading: '', meaning: '', example: '', exampleMeaning: '', bookId: selectedBookId || '', week: '', day: '' });
    setEditingId(null);
    setModalTab('single');
    setIsModalOpen(true);
  };

  const openEditModal = (v) => {
    setFormData({ word: v.word, reading: v.reading, meaning: v.meaning, example: v.example, exampleMeaning: v.exampleMeaning, bookId: v.book?.id || '', week: v.week || '', day: v.day || '' });
    setEditingId(v.id);
    setModalTab('single');
    setIsModalOpen(true);
  };

  const handleAiAutoFill = async () => {
    if (!formData.word.trim()) return messageApi.warning('Vui lòng nhập Từ vựng');
    setIsAiLoading(true);
    messageApi.loading({ content: 'AI đang phân tích...', key: 'ai_fill' });
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/generate-vocab?word=${encodeURIComponent(formData.word)}`);
      const data = await res.json();
      setFormData(p => ({ ...p, reading: data.reading || p.reading, meaning: data.meaning || p.meaning, example: data.example || p.example, exampleMeaning: data.exampleMeaning || p.exampleMeaning }));
      messageApi.success({ content: 'AI hoàn tất!', key: 'ai_fill' });
    } catch (err) {
      messageApi.error({ content: 'Lỗi AI!', key: 'ai_fill' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookId) return messageApi.warning('Vui lòng chọn giáo trình');
    const payload = { 
      ...formData, 
      book: { id: parseInt(formData.bookId) }, 
      week: formData.week ? parseInt(formData.week) : null, 
      day: formData.day ? parseInt(formData.day) : null 
    };
    delete payload.bookId;
    try {
      if (editingId) await vocabService.update(editingId, payload);
      else await vocabService.create(payload);
      setIsModalOpen(false);
      fetchData();
      messageApi.success('Đã lưu vào giáo trình hệ thống!');
    } catch (err) {
      messageApi.error('Lỗi lưu dữ liệu!');
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa hệ thống',
      content: 'Từ vựng này sẽ bị xóa khỏi giáo trình chung.',
      okText: 'Xóa',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          await vocabService.delete(id);
          fetchData();
          messageApi.success('Đã xóa');
        } catch (err) { messageApi.error('Lỗi xóa!'); }
      },
    });
  };

  const toggleSelectOne = (id) => setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === filteredVocabs.length ? [] : filteredVocabs.map(v => v.id));

  const handleBulkAiProcess = async () => {
    if (!bulkInput.trim()) return messageApi.warning('Vui lòng dán nội dung');
    setIsAiProcessing(true);
    const hide = messageApi.loading('AI đang xử lý danh sách giáo trình...', 0);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/generate-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bulkInput, type: 'VOCABULARY' })
      });
      const data = await res.json();
      setPreviewData(data.map(item => ({ ...item, selected: true })));
      messageApi.success('AI đã xử lý xong!');
    } catch (err) {
      messageApi.error('AI lỗi!');
    } finally {
      setIsAiProcessing(false);
      hide();
    }
  };

  return (
    <div className="flex-grow w-full py-8 px-6 md:px-10 bg-white dark:bg-slate-950 min-h-screen">
      <style>{customStyles}</style>
      {contextHolder}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Minimalist Monochrome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý Từ vựng</h1>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">/ Vocab</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Cập nhật kho từ vựng giáo trình hệ thống</p>
          </div>
          <div className="flex gap-3 self-start md:self-auto">
            {filteredVocabs.length > 0 && (
              <button
                onClick={() => {
                  Modal.confirm({
                    title: selectedBookId ? 'Xóa từ vựng theo sách' : 'Xóa tất cả từ vựng',
                    content: `Bạn có chắc muốn xóa ${filteredVocabs.length} từ vựng${selectedBookId ? ' của sách này' : ''}?`,
                    okText: 'Xóa',
                    okType: 'danger',
                    centered: true,
                    onOk: async () => {
                      for (const v of filteredVocabs) await vocabService.delete(v.id);
                      fetchData();
                      messageApi.success('Đã xóa thành công!');
                    }
                  });
                }}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-rose-600 dark:hover:text-rose-400 transition-all shadow-sm flex items-center gap-2"
              >
                <DeleteOutlined className="text-[10px]" />
                {selectedBookId ? 'Xóa sách' : 'Xóa hết'}
              </button>
            )}
            <button
              onClick={openAddModal}
              className="bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-lg text-xs font-bold hover:opacity-80 transition-all shadow-xl flex items-center gap-2"
            >
              <PlusOutlined className="text-[10px]" />
              Thêm mới
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
          <div className="flex-grow flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            <SearchOutlined className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm trong danh sách bài học..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm placeholder:text-slate-300"
            />
          </div>
          <div className="flex items-center gap-2 px-4 border-l border-slate-200 dark:border-slate-800 min-w-[240px]">
            <FilterOutlined className="text-slate-400 text-xs" />
            <Select
              value={selectedBookId}
              onChange={v => setSelectedBookId(v)}
              className="flex-grow custom-select"
              variant="borderless"
              classNames={{ popup: 'custom-select-popup' }}
              placeholder="Chọn sách học"
              options={[{ value: '', label: 'TẤT CẢ SÁCH' }, ...books.map(b => ({ value: b.id.toString(), label: b.title.toUpperCase() }))]}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="relative">
          {loading ? (
            <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-slate-200 border-t-black rounded-full animate-spin" /></div>
          ) : filteredVocabs.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl"><Empty description="Chưa có dữ liệu giáo trình" /></div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                    <th className="pl-6 py-4 w-12">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.length === filteredVocabs.length} 
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Hán tự</th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Cách đọc</th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ý nghĩa</th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Bài</th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Sách</th>
                    <th className="pr-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredVocabs.map((v) => (
                    <tr key={v.id} className={`transition-colors ${selectedIds.includes(v.id) ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                      <td className="pl-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(v.id)} 
                          onChange={() => toggleSelectOne(v.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-900 dark:text-white font-kanji text-lg">{v.word}</td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-500 italic">{v.reading}</td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">{v.meaning}</td>
                      <td className="px-4 py-4 text-center text-[10px] font-bold text-slate-400">{v.week ? `BÀI ${v.week}` : '-'}</td>
                      <td className="px-4 py-4">
                        <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md uppercase">
                          {v.book?.title || '-'}
                        </span>
                      </td>
                      <td className="pr-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEditModal(v)} className="p-2 text-slate-400 hover:text-black dark:hover:text-white transition-colors" title="Sửa"><EditOutlined className="text-base" /></button>
                          <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Xóa"><DeleteOutlined className="text-base" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Floating Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[500] animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-10 border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Đã chọn</span>
                <span className="text-lg font-medium">{selectedIds.length}</span>
              </div>
              
              <div className="h-6 w-px bg-slate-100 dark:bg-slate-800" />
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsBulkUpdateOpen(true)}
                  className="text-[10px] font-semibold uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 text-slate-500"
                >
                  <EditOutlined className="text-xs" /> Sửa nhanh
                </button>
                <button 
                  onClick={() => { 
                    Modal.confirm({ 
                      title: 'Xóa hệ thống', content: `Xóa ${selectedIds.length} từ khỏi giáo trình chung?`, okText: 'XÓA', okType: 'danger', centered: true,
                      onOk: async () => { for (const id of selectedIds) await vocabService.delete(id); setSelectedIds([]); fetchData(); messageApi.success('Đã xóa sạch!'); }
                    });
                  }}
                  className="text-[10px] font-semibold uppercase tracking-widest text-red-500/80 hover:text-red-500 transition-colors flex items-center gap-2"
                >
                  <DeleteOutlined className="text-xs" /> Xóa hàng loạt
                </button>
                <button 
                  onClick={() => setSelectedIds([])}
                  className="text-[10px] font-medium uppercase tracking-widest text-slate-300 hover:text-slate-500 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unified Entry Modal */}
        <Modal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          closeIcon={false}
          width={modalTab === 'bulk' ? 1000 : 500}
          centered
          styles={{ content: { padding: 0, borderRadius: '24px', overflow: 'hidden' } }}
        >
          <div className="flex flex-col">
            <div className="px-8 pt-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-end bg-slate-50 dark:bg-slate-900/80">
              <div className="flex gap-8">
                <button 
                  onClick={() => setModalTab('single')} 
                  className={`pb-4 text-[10px] font-bold uppercase tracking-widest transition-colors relative ${modalTab === 'single' ? 'text-black dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  {editingId ? 'SỬA TỪ HỆ THỐNG' : 'THÊM THỦ CÔNG'}
                  {modalTab === 'single' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white rounded-t-full" />}
                </button>
                {!editingId && (
                  <button 
                    onClick={() => setModalTab('bulk')} 
                    className={`pb-4 text-[10px] font-bold uppercase tracking-widest transition-colors relative ${modalTab === 'bulk' ? 'text-black dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  >
                    AI BULK IMPORT
                    {modalTab === 'bulk' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white rounded-t-full" />}
                  </button>
                )}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="pb-4 text-slate-400 hover:text-black dark:hover:text-white transition-colors"><CloseOutlined /></button>
            </div>

            {modalTab === 'single' ? (
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1"><label className="text-[9px] font-bold uppercase text-slate-400">Hán tự</label><button type="button" onClick={handleAiAutoFill} disabled={isAiLoading} className="text-[9px] font-bold text-black dark:text-white uppercase"><ThunderboltOutlined /> AI TỰ ĐIỀN</button></div>
                    <input type="text" name="word" value={formData.word} onChange={handleInputChange} required className="w-full bg-transparent border-b border-slate-200 outline-none py-1.5 text-xl font-bold" />
                  </div>
                  <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400 px-1">Cách đọc</label><input type="text" name="reading" value={formData.reading} onChange={handleInputChange} required className="w-full bg-transparent border-b border-slate-200 outline-none py-1.5 text-xl font-bold" /></div>
                </div>
                <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400 px-1">Ý nghĩa</label><input type="text" name="meaning" value={formData.meaning} onChange={handleInputChange} required className="w-full bg-transparent border-b border-slate-200 outline-none py-1.5 text-lg font-bold" /></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400 px-1">Ví dụ (JP)</label><input type="text" name="example" value={formData.example} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-200 outline-none py-1.5 text-sm" /></div>
                  <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400 px-1">Dịch ví dụ</label><input type="text" name="exampleMeaning" value={formData.exampleMeaning} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-200 outline-none py-1.5 text-sm italic text-slate-400" /></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400 px-1">Giáo trình</label><Select value={formData.bookId} onChange={v => setFormData(p => ({...p, bookId: v}))} className="w-full custom-select" variant="borderless" options={books.map(b => ({ value: b.id.toString(), label: b.title.toUpperCase() }))} /></div>
                  <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400 px-1">Bài số (Week)</label><input type="number" name="week" value={formData.week} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-200 outline-none py-1.5 text-sm font-bold text-center" /></div>
                </div>
                <button type="submit" className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest mt-4 hover:-translate-y-0.5 transition-transform shadow-md">LƯU VÀO GIÁO TRÌNH</button>
              </form>
            ) : (
              <div className="p-8 space-y-8 bg-white dark:bg-slate-950">
                {/* Information Header */}
                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs font-medium">
                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-black dark:text-white shrink-0"><ThunderboltOutlined /></div>
                   <p>Dán danh sách từ vựng thô vào ô bên trái. AI sẽ tự động dọn dẹp, phân tích và chuẩn hóa dữ liệu thành bảng hoàn chỉnh.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                  {/* Left: Input Textarea */}
                  <div className="relative group h-full">
                    <textarea 
                      value={bulkInput} 
                      onChange={e => setBulkInput(e.target.value)} 
                      placeholder="Dán dữ liệu thô vào đây (ví dụ: các từ vựng copy từ PDF, Website...)" 
                      className="w-full h-full p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 outline-none text-sm resize-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all custom-scrollbar placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium text-slate-700 dark:text-slate-200 leading-relaxed" 
                    />
                  </div>

                  {/* Right: Preview Area */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-y-auto border border-slate-200/60 dark:border-slate-800 custom-scrollbar h-full relative">
                    {previewData.length > 0 ? (
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 shadow-sm border-b border-slate-200/60 dark:border-slate-800 z-10">
                          <tr>
                            <th className="p-4 w-12 text-center"><input type="checkbox" onChange={(e) => setPreviewData(d => d.map(item => ({...item, selected: e.target.checked})))} checked={previewData.every(i => i.selected)} className="w-4 h-4 cursor-pointer rounded-sm" /></th>
                            <th className="p-4 text-left font-bold uppercase tracking-widest text-[10px] text-slate-400">Từ vựng</th>
                            <th className="p-4 text-left font-bold uppercase tracking-widest text-[10px] text-slate-400">Ý nghĩa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {previewData.map((item, idx) => (
                            <tr key={idx} className={`transition-colors ${item.selected ? 'bg-white dark:bg-slate-800/30' : 'opacity-40 grayscale'}`}>
                              <td className="p-4 text-center"><input type="checkbox" checked={item.selected} onChange={() => { const d = [...previewData]; d[idx].selected = !d[idx].selected; setPreviewData(d); }} className="w-4 h-4 cursor-pointer rounded-sm" /></td>
                              <td className="p-4 font-bold text-slate-900 dark:text-white font-kanji text-base">{item.word}</td>
                              <td className="p-4 text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{item.meaning}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 space-y-4">
                        <div className="w-16 h-16 rounded-full border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-white/50 dark:bg-black/20">
                          <ThunderboltOutlined className="text-2xl opacity-50" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Bản xem trước dữ liệu</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-2">
                  <button 
                    onClick={handleBulkAiProcess} 
                    disabled={isAiProcessing} 
                    className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isAiProcessing ? <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" /> : <ThunderboltOutlined />}
                    {isAiProcessing ? 'ĐANG PHÂN TÍCH...' : 'AI PHÂN TÍCH'}
                  </button>
                  
                  <div className="flex w-full sm:w-auto items-center gap-3 bg-slate-50 dark:bg-slate-900/80 p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                    <div className="w-48 pl-3">
                      <Select 
                        value={selectedBookId} 
                        onChange={v => setSelectedBookId(v)} 
                        className="w-full custom-select" 
                        variant="borderless" 
                        placeholder="Chọn giáo trình..." 
                        options={books.map(b => ({ value: b.id.toString(), label: b.title.toUpperCase() }))} 
                      />
                    </div>
                    <button 
                      onClick={async () => {
                        const items = previewData.filter(i => i.selected); if (!items.length || !selectedBookId) return messageApi.warning('Vui lòng chọn giáo trình và ít nhất 1 từ vựng');
                        try { for (const itm of items) await vocabService.create({ ...itm, book: { id: parseInt(selectedBookId) } }); messageApi.success('Đã lưu hệ thống!'); setIsModalOpen(false); fetchData(); setPreviewData([]); setBulkInput(''); } catch (e) { messageApi.error('Lỗi lưu dữ liệu!'); }
                      }} 
                      className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md hover:-translate-y-0.5 transition-transform"
                    >
                      LƯU TẤT CẢ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Bulk Update Modal */}
        <Modal
          title={<span className="text-[10px] font-bold uppercase text-slate-400">Cập nhật giáo trình</span>}
          open={isBulkUpdateOpen}
          onCancel={() => setIsBulkUpdateOpen(false)}
          footer={null}
          centered
          styles={{ content: { padding: '30px', borderRadius: '20px' } }}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase text-slate-400">Sách hệ thống</label>
              <Select value={bulkUpdateData.bookId} onChange={v => setBulkUpdateData(p => ({...p, bookId: v}))} className="w-full custom-select" variant="borderless" options={books.map(b => ({ value: b.id, label: b.title.toUpperCase() }))} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400">Bài</label><input type="number" min="1" value={bulkUpdateData.week} onChange={e => setBulkUpdateData(p => ({...p, week: e.target.value}))} className="w-full bg-transparent border-b border-slate-100 outline-none py-1.5 font-bold" /></div>
            </div>
            <button 
              onClick={async () => {
                try { for (const id of selectedIds) await vocabService.update(id, { week: bulkUpdateData.week || undefined, book: bulkUpdateData.bookId ? { id: parseInt(bulkUpdateData.bookId) } : undefined }); messageApi.success('Đã cập nhật hệ thống!'); setIsBulkUpdateOpen(false); setSelectedIds([]); fetchData(); } catch (e) { messageApi.error('Lỗi!'); }
              }}
              className="w-full py-4 bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg"
            >CẬP NHẬT NGAY</button>
          </div>
        </Modal>

      </div>
    </div>
  );
}
