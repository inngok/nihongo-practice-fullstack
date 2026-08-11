import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import grammarService from '../../api/grammarService';
import bookService from '../../api/bookService';
import { Modal, message, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined, ThunderboltOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { createPortal } from 'react-dom';
import GrammarAddModal from './components/GrammarAddModal';
import GrammarBulkUpdateModal from './components/GrammarBulkUpdateModal';
import GrammarManagerTable from './components/GrammarManagerTable';
import GrammarManagerFilterBar from './components/GrammarManagerFilterBar';
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
  const [editingGrammar, setEditingGrammar] = useState(null);
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const { fetchWithAuth } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  // Filter State
  const [selectedBookId, setSelectedBookId] = useState(bookIdParam || '');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({ week: '', day: '', bookId: '' });

  // Drag-and-drop reorder state
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [manualOrder, setManualOrder] = useState([]); // array of IDs in display order
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);



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
        if (event.data && (event.data.type === 'BOOKS_UPDATED' || event.data.type === 'DATA_CHANGED')) {
          fetchData();
        }
      };
    } catch (err) {
      console.warn('BroadcastChannel failed to initialize:', err);
    }

    const handleGlobalDataChanged = () => fetchData();
    window.addEventListener('GLOBAL_DATA_CHANGED', handleGlobalDataChanged);

    return () => {
      if (channel) {
        channel.close();
      }
      window.removeEventListener('GLOBAL_DATA_CHANGED', handleGlobalDataChanged);
    };
  }, [bookIdParam]);



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
    if (selectedDay && selectedDay !== "") {
      data = data.filter(g => g.day?.toString() === selectedDay.toString());
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
  }, [grammars, selectedBookId, selectedLesson, selectedDay, searchTerm, showDuplicatesOnly]);

  // Apply manual order to filtered grammars
  const orderedGrammars = React.useMemo(() => {
    if (manualOrder.length === 0) return filteredGrammars;
    const idToGrammar = Object.fromEntries(filteredGrammars.map(g => [g.id, g]));
    const ordered = manualOrder.map(id => idToGrammar[id]).filter(Boolean);
    // append any items not yet in manualOrder (e.g. newly loaded)
    const inOrder = new Set(manualOrder);
    const rest = filteredGrammars.filter(g => !inOrder.has(g.id));
    return [...ordered, ...rest];
  }, [manualOrder, filteredGrammars]);

  // Reset manual order when filters change
  React.useEffect(() => {
    setManualOrder(filteredGrammars.map(g => g.id));
    setHasUnsavedOrder(false);
  }, [filteredGrammars.length, selectedBookId, selectedLesson, selectedDay, searchTerm, showDuplicatesOnly]);

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

  const uniqueDays = React.useMemo(() => {
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
    const days = new Set();
    data.forEach(g => {
      if (g.day) days.add(g.day);
    });
    return Array.from(days).sort((a, b) => a - b);
  }, [grammars, selectedBookId, selectedLesson]);

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

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggedId) setDragOverId(id);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    setManualOrder(prev => {
      const arr = [...prev];
      const fromIdx = arr.indexOf(draggedId);
      const toIdx = arr.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, draggedId);
      return arr;
    });
    setHasUnsavedOrder(true);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      await Promise.all(
        manualOrder.map((id, index) =>
          grammarService.update(id, { sortOrder: index + 1 })
        )
      );
      messageApi.success('Đã lưu thứ tự thành công!');
      setHasUnsavedOrder(false);
    } catch (err) {
      messageApi.error('Lỗi khi lưu thứ tự!');
    } finally {
      setIsSavingOrder(false);
    }
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
          level: bulkUpdateData.level || undefined,
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


  const openAddModal = () => {
    setEditingGrammar(null);
    setIsModalOpen(true);
  };

  const openEditModal = (grammar) => {
    setEditingGrammar(grammar);
    setIsModalOpen(true);
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
    if (selectedDay && selectedDay !== "") {
      data = data.filter(g => g.day?.toString() === selectedDay.toString());
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

  const handleTogglePublish = async (grammar) => {
    try {
      await grammarService.update(grammar.id, { publish: grammar.publish === false ? true : false });
      message.success(grammar.publish === false ? 'Đã hiện ngữ pháp' : 'Đã ẩn ngữ pháp');
      fetchData();
    } catch (err) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
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

        <GrammarManagerFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setCurrentPage={setCurrentPage}
          showDuplicatesOnly={showDuplicatesOnly}
          setShowDuplicatesOnly={setShowDuplicatesOnly}
          handleCleanDuplicates={handleCleanDuplicates}
          isCleaning={isCleaning}
          selectedBookId={selectedBookId}
          setSelectedBookId={setSelectedBookId}
          selectedLesson={selectedLesson}
          setSelectedLesson={setSelectedLesson}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          books={books}
          uniqueLessons={uniqueLessons}
          uniqueDays={uniqueDays}
          filteredGrammarsLength={filteredGrammars.length}
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-slate-100 dark:border-slate-800 border-t-black dark:border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          <GrammarManagerTable
            orderedGrammars={orderedGrammars}
            filteredGrammars={filteredGrammars}
            currentPage={currentPage}
            pageSize={pageSize}
            setCurrentPage={setCurrentPage}
            setPageSize={setPageSize}
            selectedIds={selectedIds}
            handleSelectAll={handleSelectAll}
            handleSelectItem={handleSelectItem}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleDragEnd={handleDragEnd}
            draggedId={draggedId}
            dragOverId={dragOverId}
            openEditModal={openEditModal}
            handleDelete={handleDelete}
            handleTogglePublish={handleTogglePublish}
          />


        )}
      </div>

      {/* Floating Save Order Bar */}
      {hasUnsavedOrder && (
        <div className="fixed bottom-10 right-10 z-[500] animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Chưa lưu thứ tự</span>
            <button
              onClick={() => { setManualOrder(filteredGrammars.map(g => g.id)); setHasUnsavedOrder(false); }}
              className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700 hover:text-slate-500 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveOrder}
              disabled={isSavingOrder}
              className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-80 transition-all disabled:opacity-50"
            >
              {isSavingOrder ? 'Đang lưu...' : 'Lưu thứ tự'}
            </button>
          </div>
        </div>
      )}

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

      <GrammarBulkUpdateModal
        isOpen={isBulkUpdateOpen}
        onClose={() => setIsBulkUpdateOpen(false)}
        onUpdate={handleBulkUpdate}
        bulkUpdateData={bulkUpdateData}
        setBulkUpdateData={setBulkUpdateData}
        books={books}
        selectedCount={selectedIds.length}
      />

      <GrammarAddModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        books={books}
        initialData={editingGrammar}
        defaultBookId={selectedBookId}
        existingGrammars={grammars}
      />
    </div>
  );
}
