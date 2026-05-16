import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import kanjiService from '../../api/kanjiService';
import bookService from '../../api/bookService';
import { Modal, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

const customSelectStyles = `
  .custom-select .ant-select-selector {
    padding: 0 !important;
  }
  .custom-select-popup {
    padding: 8px !important;
    border-radius: 16px !important;
    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1) !important;
    border: 1px solid #f1f5f9 !important;
  }
  .dark .custom-select-popup {
    background-color: #020617 !important;
    border-color: #1e293b !important;
  }
  .custom-select-popup .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
    background-color: #f8fafc !important;
    color: #000 !important;
    font-weight: 600 !important;
    border-radius: 10px !important;
  }
  .dark .custom-select-popup .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
    background-color: #1e293b !important;
    color: #fff !important;
  }
  .custom-select-popup .ant-select-item-option-active:not(.ant-select-item-option-selected) {
    background-color: #f1f5f9 !important;
    border-radius: 10px !important;
  }
  .dark .custom-select-popup .ant-select-item-option-active:not(.ant-select-item-option-selected) {
    background-color: #0f172a !important;
    border-radius: 10px !important;
  }
  .custom-select-popup .ant-select-item {
    transition: all 0.2s ease !important;
    padding: 8px 12px !important;
    margin-bottom: 2px !important;
  }
`;

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
  const [messageApi, contextHolder] = message.useMessage();

  // Filter State
  const [selectedBookId, setSelectedBookId] = useState(bookIdParam || '');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({ week: '', page: '', bookId: '' });
  
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
      const [kanjiSettled, bookSettled] = await Promise.allSettled([
        kanjiService.getAll(),
        bookService.getAll()
      ]);

      const kanjiData = kanjiSettled.status === 'fulfilled' ? kanjiSettled.value.data : [];
      const booksData = bookSettled.status === 'fulfilled' ? bookSettled.value.data : [];

      setKanjis(Array.isArray(kanjiData) ? kanjiData : []);
      setBooks(Array.isArray(booksData) ? booksData.filter(b => b.type && b.type.includes('KANJI')) : []);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu.');
      console.error('fetchData unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredKanjis.map(k => k.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    Modal.confirm({
      title: 'Xác nhận xóa hàng loạt',
      content: `Bạn có chắc chắn muốn xóa ${selectedIds.length} hán tự đã chọn?`,
      okText: 'Xóa hàng loạt',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await Promise.all(selectedIds.map(id => kanjiService.delete(id)));
          messageApi.success(`Đã xóa ${selectedIds.length} mục`);
          setSelectedIds([]);
          fetchData();
        } catch (err) {
          messageApi.error('Có lỗi xảy ra khi xóa hàng loạt');
        }
      }
    });
  };

  const handleBulkUpdate = async () => {
    try {
      await Promise.all(selectedIds.map(id => 
        kanjiService.update(id, { 
          week: bulkUpdateData.week || undefined,
          page: bulkUpdateData.page || undefined,
          book: bulkUpdateData.bookId ? { id: parseInt(bulkUpdateData.bookId) } : undefined
        })
      ));
      messageApi.success('Đã cập nhật hàng loạt thành công');
      setIsBulkUpdateOpen(false);
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      messageApi.error('Lỗi khi cập nhật hàng loạt');
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
      messageApi.success(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
    } catch (err) {
      console.error('Submit Kanji error:', err);
      messageApi.error('Đã có lỗi xảy ra!');
    }
  };

  const handleDeleteAll = () => {
    const bookTitle = selectedBookId 
      ? books.find(b => b.id.toString() === selectedBookId.toString())?.title || 'sách này'
      : 'tất cả hệ thống';

    Modal.confirm({
      title: 'Xác nhận Xóa Hàng Loạt ⚠️',
      content: `Bạn có chắc chắn muốn xóa toàn bộ Hán tự thuộc ${bookTitle}? Hành động này KHÔNG THỂ khôi phục!`,
      okText: 'Tôi đồng ý, Xóa tất cả',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await kanjiService.deleteAll(selectedBookId);
          fetchData();
          messageApi.success('Đã xóa sạch toàn bộ Hán tự thành công!');
        } catch (err) {
          messageApi.error('Gặp lỗi khi xóa hàng loạt: ' + err.message);
          console.error(err);
        }
      }
    });
  };

  const handleAiAutoFill = async () => {
    if (!formData.character.trim()) return messageApi.warning('Vui lòng nhập Hán tự trước!');
    
    setIsAiProcessing(true);
    const hide = messageApi.loading('AI đang phân tích Hán tự...', 0);
    
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/ai/generate-kanji?character=${encodeURIComponent(formData.character)}`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        hanviet: data.hanviet || prev.hanviet,
        meaning: data.meaning || prev.meaning,
        onyomi: data.onyomi || prev.onyomi,
        kunyomi: data.kunyomi || prev.kunyomi
      }));
      
      messageApi.success('AI đã điền xong!');
    } catch (err) {
      console.error(err);
      messageApi.error('Lỗi khi gọi AI: ' + err.message);
    } finally {
      hide();
      setIsAiProcessing(false);
    }
  };

  const handleBulkAiProcess = async () => {
    if (!bulkInput.trim()) return messageApi.warning('Vui lòng dán nội dung cần xử lý');
    if (!selectedBookId) return messageApi.warning('Vui lòng chọn giáo trình trước khi nhập hàng loạt');

    setIsAiProcessing(true);
    const hide = messageApi.loading('AI đang phân tích Hán tự hàng loạt...', 0);
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
      messageApi.success('Đã phân tích xong Hán tự!');
    } catch (err) {
      messageApi.error('Lỗi khi xử lý hàng loạt: ' + err.message);
    } finally {
      setIsAiProcessing(false);
      hide();
    }
  };

  const handleSaveBulk = async () => {
    const itemsToSave = previewData.filter(item => item.selected);
    if (itemsToSave.length === 0) return messageApi.warning('Không có chữ Hán nào được chọn');

    const hide = messageApi.loading(`Đang lưu ${itemsToSave.length} chữ Hán...`, 0);
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

      messageApi.success(`Đã lưu thành công ${itemsToSave.length} chữ Hán!`);
      setIsModalOpen(false);
      setBulkInput('');
      setPreviewData([]);
      fetchData();
    } catch (err) {
      messageApi.error('Lỗi khi lưu dữ liệu: ' + err.message);
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
          messageApi.success('Đã xóa thành công');
        } catch (err) {
          messageApi.error('Không thể xóa dữ liệu này.');
          console.error(err);
        }
      },
    });
  };

  return (
    <div className="flex-grow w-full py-8 px-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100 bg-transparent">
      <style>{customSelectStyles}</style>
      {contextHolder}
      <div className="max-w-7xl mx-auto">
        
        {/* Minimalist Monochrome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý Hán tự</h1>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">/ Kanji</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Cập nhật kho Hán tự giáo trình hệ thống</p>
          </div>
          <div className="flex gap-3 self-start md:self-auto">
            {filteredKanjis.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-rose-600 dark:hover:text-rose-400 transition-all shadow-sm flex items-center gap-2"
              >
                <DeleteOutlined className="text-[10px]" />
                {selectedBookId ? 'Xóa sách' : 'Xóa hết'}
              </button>
            )}
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
          <Select
            value={selectedBookId}
            onChange={(value) => setSelectedBookId(value)}
            placeholder="Tất cả giáo trình"
            className="w-72 custom-select"
            variant="borderless"
            classNames={{
              popup: 'custom-select-popup'
            }}
            style={{ fontWeight: '500', fontSize: '13px' }}
            options={[
              { value: '', label: '-- Tất cả giáo trình --' },
              ...books.map(b => ({ value: b.id.toString(), label: b.title }))
            ]}
          />
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
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={selectedIds.length === filteredKanjis.length && filteredKanjis.length > 0}
                      className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 text-black dark:text-white focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Hán tự</th>
                  <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Hán Việt</th>
                  <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Âm ON/KUN</th>
                  <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Ý nghĩa</th>
                  <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">Bài</th>
                  <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Giáo trình</th>
                  <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                {filteredKanjis.map((item) => (
                  <tr key={item.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors group ${selectedIds.includes(item.id) ? 'bg-slate-50/80 dark:bg-slate-850/50' : ''}`}>
                    <td className="px-6 py-5">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 text-black dark:text-white focus:ring-0 cursor-pointer"
                      />
                    </td>
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
                    <td className="px-6 py-5 text-center">
                      <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                        {item.week ? `Bài ${item.week}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
                        {item.book?.title || 'Chưa phân loại'}{item.page ? ` • Trang ${item.page}` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1 transition-opacity">
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
                <EditOutlined className="text-xs" /> Cập nhật nhanh
              </button>
              <button 
                onClick={handleBulkDelete}
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

      {/* Bulk Update Modal */}
      <Modal
        title={<span className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 dark:text-white">CẬP NHẬT HÀNG LOẠT ({selectedIds.length})</span>}
        open={isBulkUpdateOpen}
        onCancel={() => setIsBulkUpdateOpen(false)}
        onOk={handleBulkUpdate}
        okText="CẬP NHẬT"
        cancelText="HỦY"
        centered
        className="custom-modal"
        okButtonProps={{ className: 'bg-black dark:bg-white text-white dark:text-black font-semibold text-[10px] rounded-lg' }}
        cancelButtonProps={{ className: 'font-semibold text-[10px] rounded-lg' }}
      >
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Thay đổi giáo trình</label>
            <Select 
              value={bulkUpdateData.bookId} 
              onChange={(value) => setBulkUpdateData(prev => ({ ...prev, bookId: value }))}
              placeholder="Chọn giáo trình mới"
              className="w-full custom-select-bulk"
              variant="borderless"
              classNames={{
              popup: 'custom-select-popup'
            }}
              style={{ borderBottom: '1px solid #f1f5f9' }}
              options={[
                { value: '', label: '-- Giữ nguyên --' },
                ...books.map(b => ({ value: b.id, label: b.title }))
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Chuyển sang bài số</label>
              <input 
                type="number"
                min="1"
                value={bulkUpdateData.week}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, week: e.target.value }))}
                placeholder="VD: 1, 2..."
                className="w-full px-1 py-2 bg-transparent border-b border-slate-100 dark:border-slate-800 outline-none focus:border-black dark:focus:border-white transition-all text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cập nhật trang số</label>
              <input 
                type="number"
                min="1"
                value={bulkUpdateData.page}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, page: e.target.value }))}
                placeholder="VD: 120, 121..."
                className="w-full px-1 py-2 bg-transparent border-b border-slate-100 dark:border-slate-800 outline-none focus:border-black dark:focus:border-white transition-all text-sm font-medium"
              />
            </div>
          </div>
          <p className="text-[9px] text-slate-300 italic">* Bỏ trống nếu không muốn thay đổi trường đó</p>
        </div>
      </Modal>

      {/* Unified Add/Bulk Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md overflow-y-auto">
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
                       <button type="button" onClick={handleAiAutoFill} disabled={isAiProcessing} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-black dark:text-white text-[9px] font-black rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase tracking-tighter flex items-center gap-1 disabled:opacity-50">
                         <ThunderboltOutlined className="text-[10px]" /> AI ĐIỀN
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

                 <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <label className="text-[10px] font-medium uppercase tracking-widest text-slate-400 px-1 block">Giáo trình</label>
                     <Select 
                        value={formData.bookId} 
                        onChange={(value) => setFormData(prev => ({ ...prev, bookId: value }))}
                        placeholder="Chọn giáo trình"
                        className="w-full custom-select-form"
                        variant="borderless"
                        classNames={{
              popup: 'custom-select-popup'
            }}
                        style={{ borderBottom: '1px solid #f1f5f9' }}
                        options={books.map(b => ({ value: b.id, label: b.title }))}
                      />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-medium uppercase tracking-widest text-slate-400 px-1">Bài số</label>
                     <input 
                       type="number" 
                       name="week" 
                       value={formData.week} 
                       onChange={handleInputChange} 
                       placeholder="VD: 1, 2..." 
                       className="w-full px-1 py-1 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-xs outline-none transition-all" 
                     />
                   </div>
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
                      <button onClick={handleSaveBulk} disabled={previewData.length === 0 || !selectedBookId} className="px-10 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all shadow-xl disabled:opacity-30">
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
