import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import grammarService from '../../api/grammarService';
import bookService from '../../api/bookService';
import { Modal, message, Select, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined, ThunderboltOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { createPortal } from 'react-dom';

const customSelectStyles = `
  .custom-select .ant-select-selector {
    padding: 0 !important;
  }
  .custom-select-popup {
    padding: 8px !important;
    border-radius: 16px !important;
    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1) !important;
    border: 1px solid #f1f5f9 !important;
    z-index: 999999 !important;
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

export default function GrammarManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookIdParam = searchParams.get('bookId');

  const [grammars, setGrammars] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalTab, setModalTab] = useState('single'); // 'single' or 'bulk'
  const [bulkInput, setBulkInput] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const { fetchWithAuth } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  // Filter State
  const [selectedBookId, setSelectedBookId] = useState(bookIdParam || '');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({ week: '', day: '', bookId: '' });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Form State
  const [formData, setFormData] = useState({
    structure: '',
    meaning: '',
    explanation: '',
    exampleSentence: '',
    exampleMeaning: '',
    level: 'N3',
    bookId: '',
    week: 1,
    day: 1,
    publish: true
  });

  const levelStyles = {
    N1: 'text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 font-black',
    N2: 'text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 font-bold',
    N3: 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 font-semibold',
    N4: 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800',
    N5: 'text-slate-400 dark:text-slate-500 bg-transparent border border-slate-100 dark:border-slate-800',
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
    let data = grammars || [];
    if (selectedBookId && selectedBookId !== "") {
      data = data.filter(g => {
        const gBookId = g.bookId || g.book?.id;
        return gBookId?.toString() === selectedBookId.toString();
      });
    }
    if (selectedLesson && selectedLesson !== "") {
      data = data.filter(g => g.week?.toString() === selectedLesson.toString());
    }

    if (searchTerm && searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      data = data.filter(g => 
        (g.structure && g.structure.toLowerCase().includes(lowerSearch)) ||
        (g.meaning && g.meaning.toLowerCase().includes(lowerSearch))
      );
    }

    // Duplicate detection
    const structureCounts = {};
    data.forEach(g => {
      if (g.structure) {
        const s = g.structure.trim();
        const bookId = g.bookId || g.book?.id || 'none';
        const key = `${bookId}_${s}`;
        structureCounts[key] = (structureCounts[key] || 0) + 1;
      }
    });

    const structureSeen = {};

    let result = data.map(g => {
      let isDuplicate = false;
      let isSecondaryDuplicate = false;

      if (g.structure) {
        const s = g.structure.trim();
        const bookId = g.bookId || g.book?.id || 'none';
        const key = `${bookId}_${s}`;

        isDuplicate = structureCounts[key] > 1;

        if (isDuplicate) {
          if (structureSeen[key]) {
            isSecondaryDuplicate = true;
          } else {
            structureSeen[key] = true;
          }
        }
      }

      return {
        ...g,
        isDuplicate,
        isSecondaryDuplicate
      };
    });

    if (showDuplicatesOnly) {
      result = result.filter(g => g.isSecondaryDuplicate);
    }

    return result;
  }, [grammars, selectedBookId, selectedLesson, showDuplicatesOnly]);

  const uniqueLessons = React.useMemo(() => {
    let data = grammars || [];
    if (selectedBookId && selectedBookId !== "") {
      data = data.filter(g => {
        const gBookId = g.bookId || g.book?.id;
        return gBookId?.toString() === selectedBookId.toString();
      });
    }
    const lessons = new Set();
    data.forEach(g => {
      if (g.week) lessons.add(g.week);
    });
    return Array.from(lessons).sort((a, b) => a - b);
  }, [grammars, selectedBookId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [grammarSettled, bookSettled] = await Promise.allSettled([
        grammarService.getAll(),
        bookService.getAll()
      ]);

      const grammarData = grammarSettled.status === 'fulfilled' ? grammarSettled.value.data : [];
      const booksData = bookSettled.status === 'fulfilled' ? bookSettled.value.data : [];

      setGrammars(Array.isArray(grammarData) ? grammarData : []);
      setBooks(Array.isArray(booksData) ? booksData.filter(b => b.type && b.type.includes('GRAMMAR')) : []);
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
      setSelectedIds(filteredGrammars.map(g => g.id));
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
      content: `Bạn có chắc chắn muốn xóa ${selectedIds.length} cấu trúc ngữ pháp đã chọn?`,
      okText: 'Xóa hàng loạt',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await Promise.all(selectedIds.map(id => grammarService.delete(id)));
          message.success(`Đã xóa ${selectedIds.length} cấu trúc`);
          setSelectedIds([]);
          fetchData();
        } catch (err) {
          message.error('Có lỗi xảy ra khi xóa hàng loạt');
        }
      }
    });
  };

  const handleBulkUpdate = async () => {
    try {
      await Promise.all(selectedIds.map(id =>
        grammarService.update(id, {
          week: bulkUpdateData.week || undefined,
          day: bulkUpdateData.day || undefined,
          book: bulkUpdateData.bookId ? { id: parseInt(bulkUpdateData.bookId) } : undefined
        })
      ));
      message.success('Đã cập nhật hàng loạt thành công');
      setIsBulkUpdateOpen(false);
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      message.error('Lỗi khi cập nhật hàng loạt');
    }
  };


  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if ((name === 'week' || name === 'day' || name === 'page') && value !== '' && parseInt(value) < 1) value = '1';
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      structure: '',
      meaning: '',
      explanation: '',
      exampleSentence: '',
      exampleMeaning: '',
      quizSentence: '',
      level: 'N3',
      bookId: '',
      week: 1,
      day: 1,
      publish: true
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

  const handleAiAutoFill = async () => {
    if (!formData.structure.trim()) return message.warning('Vui lòng nhập cấu trúc ngữ pháp trước!');

    setIsAiProcessing(true);
    const hide = message.loading('AI đang phân tích ngữ pháp...', 0);

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/ai/generate-grammar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structure: formData.structure,
          existingSentence: formData.exampleSentence || ''
        })
      }); if (!response.ok) throw new Error('API Error');
      const data = await response.json();

      setFormData(prev => ({
        ...prev,
        meaning: data.meaning || prev.meaning,
        explanation: data.explanation || prev.explanation,
        exampleSentence: data.exampleSentence || prev.exampleSentence,
        exampleMeaning: data.exampleMeaning || prev.exampleMeaning,
        quizSentence: data.quizSentence || prev.quizSentence
      }));

      message.success('AI đã điền xong!');
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi gọi AI: ' + err.message);
    } finally {
      hide();
      setIsAiProcessing(false);
    }
  };

  const handleBulkAiProcess = async () => {
    if (!bulkInput.trim()) return message.warning('Vui lòng dán nội dung cần xử lý');
    if (!selectedBookId) return message.warning('Vui lòng chọn giáo trình trước khi nhập hàng loạt');

    setIsAiProcessing(true);
    const hide = message.loading('AI đang phân tích ngữ pháp hàng loạt...', 0);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/generate-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: bulkInput,
          type: 'GRAMMAR'
        })
      });
      if (!res.ok) throw new Error('AI processing failed');
      const data = await res.json();
      setPreviewData(data.map(item => ({ ...item, selected: true })));
      message.success('Đã phân tích xong Ngữ pháp!');
    } catch (err) {
      message.error('Lỗi khi xử lý hàng loạt: ' + err.message);
    } finally {
      setIsAiProcessing(false);
      hide();
    }
  };

  const handleSaveBulk = async () => {
    const itemsToSave = previewData.filter(item => item.selected);
    if (itemsToSave.length === 0) return message.warning('Không có cấu trúc nào được chọn');

    setIsSaving(true);
    const hide = message.loading(`Đang lưu ${itemsToSave.length} cấu trúc ngữ pháp...`, 0);
    try {
      const payload = itemsToSave.map(item => ({
        structure: item.structure,
        meaning: item.meaning,
        explanation: item.explanation,
        exampleSentence: item.exampleSentence,
        exampleMeaning: item.exampleMeaning,
        quizSentence: item.quizSentence,
        level: item.level || 'N3',
        book: { id: parseInt(selectedBookId) },
        week: formData.week ? parseInt(formData.week) : null,
        day: formData.day ? parseInt(formData.day) : null
      }));

      for (const item of payload) {
        await grammarService.create(item);
      }

      message.success(`Đã lưu thành công ${itemsToSave.length} cấu trúc!`);
      setIsModalOpen(false);
      setBulkInput('');
      setPreviewData([]);
      fetchData();
    } catch (err) {
      message.error('Lỗi khi lưu dữ liệu: ' + err.message);
    } finally {
      setIsSaving(false);
      hide();
    }
  };

  const openEditModal = (grammar) => {
    setFormData({
      structure: grammar.structure,
      meaning: grammar.meaning,
      explanation: grammar.explanation,
      exampleSentence: grammar.exampleSentence,
      exampleMeaning: grammar.exampleMeaning,
      quizSentence: grammar.quizSentence || '',
      level: grammar.level,
      bookId: grammar.book?.id || '',
      week: grammar.week || 1,
      day: grammar.day || 1,
      publish: grammar.publish !== false
    });
    setEditingId(grammar.id);
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

    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAll = () => {
    const bookTitle = selectedBookId
      ? books.find(b => b.id.toString() === selectedBookId.toString())?.title || 'sách này'
      : 'tất cả hệ thống';

    Modal.confirm({
      title: 'Xác nhận Xóa Hàng Loạt ⚠️',
      content: `Bạn có chắc chắn muốn xóa toàn bộ ngữ pháp thuộc ${bookTitle}? Hành động này KHÔNG THỂ khôi phục!`,
      okText: 'Tôi đồng ý, Xóa tất cả',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await grammarService.deleteAll(selectedBookId);
          fetchData();
          message.success('Đã xóa sạch toàn bộ ngữ pháp thành công!');
        } catch (err) {
          message.error('Gặp lỗi khi xóa hàng loạt: ' + err.message);
          console.error(err);
        }
      }
    });
  };

  const handleCleanDuplicates = () => {
    let data = grammars || [];
    if (selectedBookId && selectedBookId !== "") {
      data = data.filter(g => (g.bookId || g.book?.id)?.toString() === selectedBookId.toString());
    }
    if (selectedLesson && selectedLesson !== "") {
      data = data.filter(g => g.week?.toString() === selectedLesson.toString());
    }

    const gCounts = {};
    data.forEach(g => {
      if (g.structure) {
        const key = `${g.bookId || g.book?.id || 'none'}_${g.structure.trim()}`;
        gCounts[key] = (gCounts[key] || 0) + 1;
      }
    });

    const gSeen = {};
    const duplicateIds = [];
    data.forEach(g => {
      if (g.structure) {
        const key = `${g.bookId || g.book?.id || 'none'}_${g.structure.trim()}`;
        if (gCounts[key] > 1) {
          if (gSeen[key]) duplicateIds.push(g.id);
          else gSeen[key] = true;
        }
      }
    });

    if (duplicateIds.length === 0) {
      return messageApi.info('Không tìm thấy ngữ pháp trùng lặp nào.');
    }

    Modal.confirm({
      title: 'Dọn dẹp ngữ pháp trùng lặp',
      content: `Phát hiện ${duplicateIds.length} bản sao bị trùng. Bạn có muốn xóa tự động các bản copy và chỉ giữ lại 1 bản gốc không?`,
      okText: 'Dọn dẹp ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setIsCleaning(true);
        const hide = messageApi.loading(`Đang dọn dẹp ${duplicateIds.length} bản trùng...`, 0);
        try {
          for (const id of duplicateIds) {
            await grammarService.delete(id);
          }
          messageApi.success(`Đã xóa sạch ${duplicateIds.length} bản trùng!`);
          fetchData();
        } catch (err) {
          messageApi.error('Lỗi khi dọn dẹp trùng lặp!');
        } finally {
          setIsCleaning(false);
          hide();
        }
      }
    });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa cấu trúc này?',
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
      <style>{customSelectStyles}</style>
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý Ngữ pháp</h1>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">/ Grammar</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Cập nhật kho ngữ pháp giáo trình hệ thống</p>
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

        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 min-w-[120px]">
            <FilterOutlined className="text-sm" />
            <span className="text-sm font-semibold">Bộ lọc nhanh:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm cấu trúc, ý nghĩa..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 transition-all text-slate-700 dark:text-slate-200 placeholder-slate-400"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchOutlined />
              </div>
            </div>
            <button
              onClick={() => { setShowDuplicatesOnly(!showDuplicatesOnly); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${showDuplicatesOnly ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/30 dark:border-rose-800' : 'bg-transparent border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'}`}
            >
              Chỉ hiện bản trùng
            </button>
            <button
              onClick={handleCleanDuplicates}
              disabled={isCleaning}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-colors border bg-rose-500 text-white hover:bg-rose-600 border-rose-500 shadow-sm"
            >
              {isCleaning ? 'Đang dọn dẹp...' : 'Dọn dẹp bản trùng'}
            </button>
          </div>

          <Select
            value={selectedBookId}
            onChange={(value) => { setSelectedBookId(value); setSelectedLesson(''); setCurrentPage(1); }}
            placeholder="Tất cả giáo trình"
            className="w-72 custom-select text-sm font-semibold"
            variant="borderless"
            classNames={{
              popup: 'custom-select-popup'
            }}
            options={[
              { value: '', label: 'Tất cả giáo trình' },
              ...books.map(b => ({ value: b.id.toString(), label: b.title }))
            ]}
          />
          <Select
            value={selectedLesson}
            onChange={(value) => { setSelectedLesson(value); setCurrentPage(1); }}
            placeholder="Tất cả bài"
            className="w-40 custom-select text-sm font-semibold"
            variant="borderless"
            classNames={{
              popup: 'custom-select-popup'
            }}
            options={[
              { value: '', label: 'Tất cả bài' },
              ...uniqueLessons.map(l => ({ value: l.toString(), label: `Bài ${l}` }))
            ]}
          />
          {(selectedBookId || selectedLesson || showDuplicatesOnly || searchTerm) && (
            <button
              onClick={() => { setSelectedBookId(''); setSelectedLesson(''); setShowDuplicatesOnly(false); setSearchTerm(''); }}
              className="px-3 py-1.5 text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors"
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
                      checked={selectedIds.length === filteredGrammars.length && filteredGrammars.length > 0}
                      className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 text-black dark:text-white focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Cấu trúc</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ý nghĩa</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Sách</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Level</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Bài học</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                {filteredGrammars.length > 0 ? (
                  filteredGrammars.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item) => (
                    <tr key={item.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors group ${selectedIds.includes(item.id) ? 'bg-slate-50/80 dark:bg-slate-850/50' : ''}`}>
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 text-black dark:text-white focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight leading-none">{item.structure}</span>
                          {item.isDuplicate && (
                            <span className="text-[9px] font-black uppercase bg-rose-100 text-rose-600 px-2 py-1 rounded-md border border-rose-200 tracking-widest" title="Ngữ pháp này bị lặp lại">Trùng</span>
                          )}
                          {item.publish === false && (
                            <span className="text-[8px] font-black uppercase bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-300" title="Đã bị ẩn khỏi người học">Ẩn</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-[13px] italic">{item.meaning}</td>
                      <td className="px-6 py-5">
                        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                          {item.book?.title || 'Không rõ'}
                        </span>
                      </td>
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
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-300 dark:text-slate-600 italic text-sm">Chưa có dữ liệu.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {filteredGrammars.length > 0 && (
              <div className="flex justify-end p-6 border-t border-slate-100 dark:border-slate-800">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredGrammars.length}
                  onChange={(page, size) => { setCurrentPage(page); setPageSize(size); }}
                  showSizeChanger
                  showTotal={(total) => `Tổng số ${total} cấu trúc`}
                />
              </div>
            )}
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
            <select
              value={bulkUpdateData.bookId}
              onChange={(e) => setBulkUpdateData(prev => ({ ...prev, bookId: e.target.value }))}
              className="w-full px-1 py-2 bg-transparent border-b border-slate-100 dark:border-slate-800 outline-none focus:border-black dark:focus:border-white transition-all text-sm font-medium"
            >
              <option value="">-- Giữ nguyên --</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Tuần</label>
                <input
                  type="number"
                  min="1"
                  value={bulkUpdateData.week}
                  onChange={(e) => { let v = e.target.value; if(v !== '' && parseInt(v) < 1) v = '1'; setBulkUpdateData(prev => ({ ...prev, week: v })) }}
                  placeholder="VD: 1, 2..."
                  className="w-full px-1 py-2 bg-transparent border-b border-slate-100 dark:border-slate-800 outline-none focus:border-black dark:focus:border-white transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Ngày</label>
                <input
                  type="number"
                  min="1"
                  value={bulkUpdateData.day}
                  onChange={(e) => { let v = e.target.value; if(v !== '' && parseInt(v) < 1) v = '1'; setBulkUpdateData(prev => ({ ...prev, day: v })) }}
                  placeholder="VD: 1, 2..."
                  className="w-full px-1 py-2 bg-transparent border-b border-slate-100 dark:border-slate-800 outline-none focus:border-black dark:focus:border-white transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>
          <p className="text-[9px] text-slate-300 italic">* Bỏ trống nếu không muốn thay đổi trường đó</p>
        </div>
      </Modal>

      {/* Unified Add/Bulk Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 dark:bg-black/80 overflow-y-auto">
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
              <button onClick={() => setIsModalOpen(false)} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-black dark:hover:text-white transition-colors">
                Đóng
              </button>
            </div>

            {modalTab === 'single' ? (
              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto hide-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">Cấu trúc</label>
                      <button type="button" onClick={handleAiAutoFill} disabled={isAiProcessing} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-black dark:text-white text-[9px] font-black rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase tracking-tighter flex items-center gap-1 disabled:opacity-50">
                        <ThunderboltOutlined className="text-[10px]" /> AI ĐIỀN
                      </button>
                    </div>
                    <input
                      type="text"
                      name="structure"
                      value={formData.structure}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: ~たことがある"
                      required
                      className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-lg outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
                    />
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
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Giải thích</label>
                  <textarea
                    name="explanation"
                    value={formData.explanation}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Cách dùng cấu trúc này..."
                    className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all resize-none placeholder:text-slate-200 dark:placeholder:text-slate-700"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Ví dụ (JP)</label>
                    <input
                      type="text"
                      name="exampleSentence"
                      value={formData.exampleSentence}
                      onChange={handleInputChange}
                      placeholder="..."
                      className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Dịch nghĩa</label>
                    <input
                      type="text"
                      name="exampleMeaning"
                      value={formData.exampleMeaning}
                      onChange={handleInputChange}
                      placeholder="..."
                      className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Câu hỏi Trắc nghiệm (Đục lỗ bằng '_____')</label>
                  <input
                    type="text"
                    name="quizSentence"
                    value={formData.quizSentence}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 山々に_____いて (dùng 5 dấu gạch dưới)"
                    className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 px-1">Giáo trình</label>
                  <select
                    name="bookId"
                    value={formData.bookId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-1 py-1 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-xs outline-none transition-all"
                  >
                    <option value="" className="dark:bg-slate-950">-- Chọn --</option>
                    {books.map(b => <option key={b.id} value={b.id} className="dark:bg-slate-950">{b.title}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 px-1">Tuần (Week)</label>
                    <input
                      type="number"
                      name="week"
                      min="1"
                      value={formData.week}
                      onChange={handleInputChange}
                      className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 px-1">Ngày (Day)</label>
                    <input
                      type="number"
                      name="day"
                      min="1"
                      value={formData.day}
                      onChange={handleInputChange}
                      className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:opacity-80 transition-all shadow-xl disabled:opacity-50"
                  >
                    {isSaving ? 'ĐANG LƯU...' : (editingId ? 'CẬP NHẬT' : 'LƯU DỮ LIỆU')}
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
                      placeholder="Ví dụ: &#10;1. ~たことがある&#10;2. ~ほうがいい&#10;3. ~なければならない"
                      className="flex-grow w-full p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/10 focus:border-black text-slate-900 dark:text-white outline-none transition-all resize-none rounded-3xl text-sm leading-relaxed"
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
                        Bản xem trước ({previewData.length} cấu trúc)
                      </label>
                      {previewData.length > 0 && (
                        <div className="flex gap-4">
                          <button onClick={() => setPreviewData(prev => prev.map(d => ({ ...d, selected: true })))} className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Chọn tất cả</button>
                          <button onClick={() => setPreviewData(prev => prev.map(d => ({ ...d, selected: false })))} className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Bỏ chọn</button>
                        </div>
                      )}
                    </div>

                    <div className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden overflow-y-auto shadow-inner">
                      {previewData.length > 0 ? (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="p-4 w-10 text-center"></th>
                              <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">Cấu trúc</th>
                              <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">Ý nghĩa</th>
                              <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">Ví dụ</th>
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
                                <td className="p-4">
                                  <div className="font-bold text-slate-900 dark:text-white text-base">{item.structure}</div>
                                  <div className="text-black dark:text-white font-black uppercase tracking-widest text-[10px] opacity-50">{item.level}</div>
                                </td>
                                <td className="p-4">
                                  <div className="font-medium text-slate-900 dark:text-white">{item.meaning}</div>
                                  <div className="text-slate-400 italic line-clamp-1">{item.explanation}</div>
                                </td>
                                <td className="p-4">
                                  <div className="text-slate-700 dark:text-slate-300 line-clamp-1">{item.exampleSentence}</div>
                                  <div className="text-slate-400 text-[10px] line-clamp-1 italic">{item.exampleMeaning}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 space-y-4 py-20">
                          <div className="text-6xl opacity-10 font-black italic">AI GRAMMAR</div>
                          <p className="text-sm italic">Dán danh sách cấu trúc và nhấn phân tích</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                      className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <option value="">-- Chọn giáo trình --</option>
                      {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                    </select>

                    <div className="flex items-center gap-2 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-950">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bài (Week):</span>
                      <input
                        type="number"
                        min="1"
                        value={formData.week}
                        onChange={(e) => { let v = e.target.value; if(v !== '' && parseInt(v) < 1) v = '1'; setFormData(prev => ({ ...prev, week: v })) }}
                        className="w-12 bg-transparent outline-none text-xs font-bold text-center text-slate-700 dark:text-slate-300"
                      />
                    </div>

                    <div className="flex items-center gap-2 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-950">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ngày (Day):</span>
                      <input
                        type="number"
                        min="1"
                        value={formData.day}
                        onChange={(e) => { let v = e.target.value; if(v !== '' && parseInt(v) < 1) v = '1'; setFormData(prev => ({ ...prev, day: v })) }}
                        className="w-12 bg-transparent outline-none text-xs font-bold text-center text-slate-700 dark:text-slate-300"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">HỦY</button>
                    <button onClick={handleSaveBulk} disabled={previewData.length === 0 || !selectedBookId || isSaving} className="px-10 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all shadow-xl disabled:opacity-30">
                      {isSaving ? 'ĐANG LƯU...' : `LƯU (${previewData.filter(i => i.selected).length} cấu trúc)`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        , document.body)}
    </div>
  );
}
