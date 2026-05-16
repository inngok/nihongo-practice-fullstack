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
      setVocabs(Array.isArray(vRes.data) ? vRes.data : []);
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
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Quản lý Giáo trình</h1>
            <p className="text-slate-400 text-sm mt-1">Dành cho việc biên soạn nội dung học tập chung</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={openAddModal}
              className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
            >
              <PlusOutlined /> THÊM TỪ HỆ THỐNG
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
                          <button onClick={() => openEditModal(v)} className="p-2 text-slate-300 hover:text-black dark:hover:text-white transition-colors"><EditOutlined /></button>
                          <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><DeleteOutlined /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Floating Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[500]">
            <div className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-8 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Đã chọn: {selectedIds.length} mục hệ thống</span>
              <div className="flex items-center gap-6 border-l border-white/20 pl-6">
                <button onClick={() => setIsBulkUpdateOpen(true)} className="text-[10px] font-bold uppercase tracking-widest hover:underline transition-all">Sửa nhanh</button>
                <button onClick={() => { 
                  Modal.confirm({ 
                    title: 'Xóa hệ thống', content: `Xóa ${selectedIds.length} từ khỏi giáo trình chung?`, okText: 'XÓA', okType: 'danger', centered: true,
                    onOk: async () => { for (const id of selectedIds) await vocabService.delete(id); setSelectedIds([]); fetchData(); messageApi.success('Đã xóa sạch!'); }
                  });
                }} className="text-[10px] font-bold uppercase tracking-widest text-red-400">Xóa hết</button>
                <button onClick={() => setSelectedIds([])} className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hủy</button>
              </div>
            </div>
          </div>
        )}

        {/* Unified Entry Modal */}
        <Modal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={modalTab === 'bulk' ? 1000 : 500}
          centered
          styles={{ content: { padding: 0, borderRadius: '24px', overflow: 'hidden' } }}
        >
          <div className="flex flex-col">
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <div className="flex gap-6">
                <button onClick={() => setModalTab('single')} className={`text-[10px] font-bold uppercase tracking-widest ${modalTab === 'single' ? 'text-black dark:text-white' : 'text-slate-400'}`}>{editingId ? 'SỬA TỪ HỆ THỐNG' : 'THÊM THỦ CÔNG'}</button>
                {!editingId && <button onClick={() => setModalTab('bulk')} className={`text-[10px] font-bold uppercase tracking-widest ${modalTab === 'bulk' ? 'text-black dark:text-white' : 'text-slate-400'}`}>AI BULK IMPORT</button>}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-black"><CloseOutlined /></button>
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
                <button type="submit" className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest mt-4">LƯU VÀO GIÁO TRÌNH</button>
              </form>
            ) : (
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-8 h-[400px]">
                  <textarea value={bulkInput} onChange={e => setBulkInput(e.target.value)} placeholder="Dán danh sách giáo trình..." className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 outline-none text-sm resize-none" />
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-xl overflow-y-auto border border-slate-100">
                    {previewData.length > 0 ? (
                      <table className="w-full text-[10px]">
                        <tbody className="divide-y divide-slate-100">
                          {previewData.map((item, idx) => (
                            <tr key={idx}><td className="p-3"><input type="checkbox" checked={item.selected} onChange={() => { const d = [...previewData]; d[idx].selected = !d[idx].selected; setPreviewData(d); }} /></td><td className="p-3 font-bold">{item.word}</td><td className="p-3">{item.meaning}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <div className="h-full flex items-center justify-center text-slate-300 text-xs italic">Xem trước giáo trình hệ thống</div>}
                  </div>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <button onClick={handleBulkAiProcess} disabled={isAiProcessing} className="px-8 py-3 bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">{isAiProcessing ? 'ĐANG PHÂN TÍCH...' : 'AI PHÂN TÍCH'}</button>
                  <div className="flex items-center gap-4">
                    <Select value={selectedBookId} onChange={v => setSelectedBookId(v)} className="w-48 custom-select" placeholder="Chọn sách" options={books.map(b => ({ value: b.id.toString(), label: b.title.toUpperCase() }))} />
                    <button 
                      onClick={async () => {
                        const items = previewData.filter(i => i.selected); if (!items.length || !selectedBookId) return messageApi.warning('Kiểm tra dữ liệu');
                        try { for (const itm of items) await vocabService.create({ ...itm, book: { id: parseInt(selectedBookId) } }); messageApi.success('Đã lưu hệ thống!'); setIsModalOpen(false); fetchData(); } catch (e) { messageApi.error('Lỗi!'); }
                      }} 
                      className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest"
                    >LƯU TẤT CẢ</button>
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
              <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400">Bài</label><input type="number" value={bulkUpdateData.week} onChange={e => setBulkUpdateData(p => ({...p, week: e.target.value}))} className="w-full bg-transparent border-b border-slate-100 outline-none py-1.5 font-bold" /></div>
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
