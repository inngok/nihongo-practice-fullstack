import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import vocabService from '../../api/vocabService';
import bookService from '../../api/bookService';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import VocabAddModal from './components/VocabAddModal';
import VocabBulkUpdateModal from './components/VocabBulkUpdateModal';
import VocabTable from './components/VocabTable';
import { createPortal } from 'react-dom';
import { Modal, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined, ThunderboltOutlined, SearchOutlined } from '@ant-design/icons';

const customStyles = `
  .custom-select .ant-select-selector { padding: 0 !important; background: transparent !important; }
  .custom-select-popup { padding: 8px !important; border-radius: 12px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important; border: 1px solid #e2e8f0 !important; z-index: 999999 !important; }
  .dark .custom-select-popup { background-color: #0f172a !important; border-color: #1e293b !important; }
  .custom-select-popup .ant-select-item-option-selected { background-color: #000 !important; color: #fff !important; border-radius: 6px !important; }
  .dark .custom-select-popup .ant-select-item-option-selected { background-color: #fff !important; color: #000 !important; }
  .custom-select-popup .ant-select-item { border-radius: 6px !important; margin-bottom: 2px !important; padding: 8px 12px !important; }
`;

export default function VocabManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookIdParam = searchParams.get('bookId');
  const { fetchWithAuth } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const messageApiRef = React.useRef(messageApi);
  React.useEffect(() => { messageApiRef.current = messageApi; }, [messageApi]);

  const [vocabs, setVocabs] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(bookIdParam || '');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({ week: '', bookId: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Drag-and-drop reorder state
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [manualOrder, setManualOrder] = useState([]);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const fetchData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const [vRes, bRes] = await Promise.all([
        vocabService.getAll({ includePersonal: false }),
        bookService.getAll()
      ]);
      const systemVocabs = (Array.isArray(vRes.data) ? vRes.data : []).filter(v => v.book != null);
      setVocabs(systemVocabs);
      setBooks(Array.isArray(bRes.data) ? bRes.data.filter(b => b.type?.includes('VOCABULARY')) : []);
    } catch (err) {
      messageApiRef.current.error('Lỗi tải dữ liệu giáo trình');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []); // stable - no deps that cause re-creation

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
    if (bookIdParam) setSelectedBookId(bookIdParam);
    const channel = new BroadcastChannel('nihongo-sync-channel');
    channel.onmessage = (e) => (e.data?.type === 'BOOKS_UPDATED' || e.data?.type === 'DATA_CHANGED') && fetchData(true);
    const handleGlobalDataChanged = () => fetchData(true);
    window.addEventListener('GLOBAL_DATA_CHANGED', handleGlobalDataChanged);
    return () => {
      channel.close();
      window.removeEventListener('GLOBAL_DATA_CHANGED', handleGlobalDataChanged);
    };
  }, [bookIdParam]); // fetchData is stable (no deps), safe to omit

  const filteredVocabs = useMemo(() => {
    let data = Array.isArray(vocabs) ? vocabs : [];
    if (selectedBookId) data = data.filter(v => (v.bookId || v.book?.id)?.toString() === selectedBookId.toString());
    if (selectedLesson) data = data.filter(v => v.week?.toString() === selectedLesson.toString());
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      data = data.filter(v => v.word?.toLowerCase().includes(s) || v.reading?.toLowerCase().includes(s) || v.meaning?.toLowerCase().includes(s));
    }

    const wordCounts = {};
    data.forEach(v => {
      if (v.word) {
        const key = `${v.bookId || v.book?.id || 'none'}_${v.week || 'none'}_${v.word.trim()}`;
        wordCounts[key] = (wordCounts[key] || 0) + 1;
      }
    });

    const wordSeen = {};
    let result = data.map(v => {
      let isDuplicate = false;
      let isSecondaryDuplicate = false;
      if (v.word) {
        const key = `${v.bookId || v.book?.id || 'none'}_${v.week || 'none'}_${v.word.trim()}`;
        isDuplicate = wordCounts[key] > 1;
        if (isDuplicate) {
          if (wordSeen[key]) isSecondaryDuplicate = true;
          else wordSeen[key] = true;
        }
      }
      return { ...v, isDuplicate, isSecondaryDuplicate };
    });

    if (showDuplicatesOnly) result = result.filter(v => v.isSecondaryDuplicate);

    // apply sortOrder for stable display (admin-defined order)
    result = [...result].sort((a, b) => {
      const sa = a.sortOrder != null ? a.sortOrder : (a.id || 0);
      const sb = b.sortOrder != null ? b.sortOrder : (b.id || 0);
      return sa - sb;
    });
    return result;
  }, [vocabs, selectedBookId, selectedLesson, searchTerm, showDuplicatesOnly]);

  // Apply manual drag order on top
  const orderedVocabs = useMemo(() => {
    if (manualOrder.length === 0) return filteredVocabs;
    const idToVocab = Object.fromEntries(filteredVocabs.map(v => [v.id, v]));
    const ordered = manualOrder.map(id => idToVocab[id]).filter(Boolean);
    const inOrder = new Set(manualOrder);
    const rest = filteredVocabs.filter(v => !inOrder.has(v.id));
    return [...ordered, ...rest];
  }, [manualOrder, filteredVocabs]);

  // Reset manual order when filters change
  React.useEffect(() => {
    setManualOrder(filteredVocabs.map(v => v.id));
    setHasUnsavedOrder(false);
  }, [filteredVocabs.length, selectedBookId, selectedLesson, showDuplicatesOnly]);

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (id !== draggedId) setDragOverId(id);
  };
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) { setDraggedId(null); setDragOverId(null); return; }
    setManualOrder(prev => {
      const arr = [...prev];
      const from = arr.indexOf(draggedId);
      const to = arr.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      arr.splice(from, 1);
      arr.splice(to, 0, draggedId);
      return arr;
    });
    setHasUnsavedOrder(true);
    setDraggedId(null);
    setDragOverId(null);
  };
  const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      await Promise.all(manualOrder.map((id, index) => vocabService.update(id, { sortOrder: index + 1 })));
      messageApiRef.current.success('Đã lưu thứ tự thành công!');
      setHasUnsavedOrder(false);
      fetchData(true);
    } catch {
      messageApiRef.current.error('Lỗi khi lưu thứ tự!');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const uniqueLessons = useMemo(() => {
    let data = Array.isArray(vocabs) ? vocabs : [];
    if (selectedBookId) data = data.filter(v => (v.bookId || v.book?.id)?.toString() === selectedBookId.toString());
    const lessons = new Set();
    data.forEach(v => { if (v.week) lessons.add(v.week); });
    return Array.from(lessons).sort((a, b) => a - b);
  }, [vocabs, selectedBookId]);

  const openAddModal = useCallback(() => { setEditingVocab(null); setIsModalOpen(true); }, []);
  const openEditModal = useCallback((v) => { setEditingVocab(v); setIsModalOpen(true); }, []);

  const handleDelete = useCallback((id) => {
    Modal.confirm({
      zIndex: 100000,
      title: 'Xác nhận xóa hệ thống',
      content: 'Từ vựng này sẽ bị xóa khỏi giáo trình chung.',
      okText: 'Xóa', okType: 'danger', centered: true,
      onOk: async () => {
        try {
          await vocabService.delete(id);
          fetchData(true);
          messageApiRef.current.success('Đã xóa');
        } catch { messageApiRef.current.error('Lỗi xóa!'); }
      },
    });
  }, [fetchData]);

  const handleCleanDuplicates = useCallback(() => {
    let data = Array.isArray(vocabs) ? vocabs : [];
    if (selectedBookId) data = data.filter(v => (v.bookId || v.book?.id)?.toString() === selectedBookId.toString());
    if (selectedLesson) data = data.filter(v => v.week?.toString() === selectedLesson.toString());

    const vCounts = {};
    data.forEach(v => {
      if (v.word) {
        const key = `${v.bookId || v.book?.id || 'none'}_${v.week || 'none'}_${v.word.trim()}`;
        vCounts[key] = (vCounts[key] || 0) + 1;
      }
    });

    const vSeen = {};
    const duplicateIds = [];
    data.forEach(v => {
      if (v.word) {
        const key = `${v.bookId || v.book?.id || 'none'}_${v.week || 'none'}_${v.word.trim()}`;
        if (vCounts[key] > 1) {
          if (vSeen[key]) duplicateIds.push(v.id);
          else vSeen[key] = true;
        }
      }
    });

    if (duplicateIds.length === 0) return messageApiRef.current.info('Không tìm thấy từ vựng trùng lặp nào.');

    Modal.confirm({
      zIndex: 100000,
      title: 'Dọn dẹp từ vựng trùng lặp',
      content: `Phát hiện ${duplicateIds.length} bản sao bị trùng. Bạn có muốn xóa tự động tất cả các bản copy và chỉ giữ lại 1 bản gốc không?`,
      okText: 'Dọn dẹp ngay', okType: 'danger', cancelText: 'Hủy',
      onOk: async () => {
        setIsCleaning(true);
        const hide = messageApiRef.current.loading(`Đang dọn dẹp ${duplicateIds.length} bản trùng...`, 0);
        try {
          for (const id of duplicateIds) await vocabService.delete(id);
          messageApiRef.current.success(`Đã xóa sạch ${duplicateIds.length} bản trùng!`);
          fetchData(true);
        } catch {
          messageApiRef.current.error('Lỗi khi dọn dẹp trùng lặp!');
        } finally {
          setIsCleaning(false);
          hide();
        }
      }
    });
  }, [vocabs, selectedBookId, selectedLesson, fetchData]);

  const toggleSelectOne = useCallback((id) => {
    setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => prev.length === filteredVocabs.length ? [] : filteredVocabs.map(v => v.id));
  }, [filteredVocabs]);

  const handleBulkUpdate = async () => {
    try {
      for (const id of selectedIds) {
        await vocabService.update(id, {
          week: bulkUpdateData.week || undefined,
          book: bulkUpdateData.bookId ? { id: parseInt(bulkUpdateData.bookId) } : undefined
        });
      }
      messageApi.success('Đã cập nhật hệ thống!');
      setIsBulkUpdateOpen(false);
      setSelectedIds([]);
      fetchData(true);
    } catch {
      messageApi.error('Lỗi!');
    }
  };

  const handleBulkAiHanviet = useCallback(async () => {
    const selectedVocabs = filteredVocabs.filter(v => selectedIds.includes(v.id) && v.word);
    if (selectedVocabs.length === 0) return messageApiRef.current.warning('Không có từ vựng nào hợp lệ để xử lý.');

    const hide = messageApiRef.current.loading(`AI đang phân tích Hán Việt cho ${selectedVocabs.length} từ...`, 0);
    try {
      const batchSize = 50;
      for (let i = 0; i < selectedVocabs.length; i += batchSize) {
        const batch = selectedVocabs.slice(i, i + batchSize);
        const res = await fetchWithAuth(`${API_BASE_URL}/ai/extract-hanviet-bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ words: batch.map(v => v.word) })
        });
        let data = await res.json();
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch { data = {}; }
        }
        for (const v of batch) {
          const hanviet = data[v.word];
          if (hanviet != null && hanviet !== '[Lỗi AI]') {
            await vocabService.update(v.id, {
              ...v,
              hanviet,
              book: v.book ? { id: v.book.id } : undefined
            });
          }
        }
      }
      messageApiRef.current.success('Đã cập nhật xong Hán Việt cho các từ đã chọn!');
      setSelectedIds([]);
      fetchData(true);
    } catch {
      messageApiRef.current.error('Lỗi kết nối đến AI!');
    } finally {
      hide();
    }
  }, [filteredVocabs, selectedIds, fetchData, fetchWithAuth]);

  return (
    <div className="flex-grow w-full py-8 px-6 md:px-10 bg-white dark:bg-slate-950 min-h-screen">
      <style>{customStyles}</style>
      {contextHolder}
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý Từ vựng</h1>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">/ Vocab</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Cập nhật kho từ vựng giáo trình hệ thống</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-lg text-xs font-bold hover:opacity-80 transition-all shadow-xl flex items-center gap-2 self-start md:self-auto"
          >
            <PlusOutlined className="text-[10px]" /> Thêm mới
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
          <div className="flex-grow flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            <SearchOutlined className="text-slate-400" />
            <input
              type="text"
              placeholder="Tìm trong danh sách bài học..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none outline-none w-full text-sm placeholder:text-slate-300"
            />
          </div>

          <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-2 px-4 border-l border-slate-200 dark:border-slate-800 min-w-[240px]">
            <FilterOutlined className="text-slate-400 text-xs" />
            <Select
              value={selectedBookId}
              onChange={v => { setSelectedBookId(v); setSelectedLesson(''); setCurrentPage(1); }}
              className="flex-grow custom-select text-sm font-semibold"
              variant="borderless"
              popupClassName="custom-select-popup"
              placeholder="Chọn sách học"
              options={[{ value: '', label: 'Tất cả giáo trình' }, ...books.map(b => ({ value: b.id.toString(), label: b.title }))]}
            />
          </div>

          <div className="flex items-center gap-2 px-4 border-l border-slate-200 dark:border-slate-800 min-w-[140px]">
            <Select
              value={selectedLesson}
              onChange={v => { setSelectedLesson(v); setCurrentPage(1); }}
              className="flex-grow custom-select text-sm font-semibold"
              variant="borderless"
              popupClassName="custom-select-popup"
              placeholder="Chọn bài"
              options={[{ value: '', label: 'Tất cả bài' }, ...uniqueLessons.map(l => ({ value: l.toString(), label: `Bài ${l}` }))]}
            />
          </div>

          {(selectedBookId || selectedLesson || showDuplicatesOnly) && (
            <button
              onClick={() => { setSelectedBookId(''); setSelectedLesson(''); setShowDuplicatesOnly(false); }}
              className="px-3 py-1.5 text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors"
            >
              Xóa lọc
            </button>
          )}
        </div>

        <VocabTable
          loading={loading}
          filteredVocabs={orderedVocabs}
          currentPage={currentPage}
          pageSize={pageSize}
          setCurrentPage={setCurrentPage}
          setPageSize={setPageSize}
          selectedIds={selectedIds}
          toggleSelectAll={toggleSelectAll}
          toggleSelectOne={toggleSelectOne}
          openEditModal={openEditModal}
          handleDelete={handleDelete}
          draggedId={draggedId}
          dragOverId={dragOverId}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        />

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
                  onClick={handleBulkAiHanviet}
                  className="text-[10px] font-semibold uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 text-indigo-500"
                >
                  <ThunderboltOutlined className="text-xs" /> Thêm Hán Việt (AI)
                </button>
                <button
                  onClick={() => setIsBulkUpdateOpen(true)}
                  className="text-[10px] font-semibold uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 text-slate-500"
                >
                  <EditOutlined className="text-xs" /> Sửa nhanh
                </button>
                <button
                  onClick={() => {
                    Modal.confirm({
                      zIndex: 100000,
                      title: 'Xóa hệ thống',
                      content: `Xóa ${selectedIds.length} từ khỏi giáo trình chung?`,
                      okText: 'XÓA', okType: 'danger', centered: true,
                      onOk: async () => {
                        for (const id of selectedIds) await vocabService.delete(id);
                        setSelectedIds([]);
                        fetchData(true);
                        messageApi.success('Đã xóa sạch!');
                      }
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

        {/* Floating Save Order Bar */}
        {hasUnsavedOrder && (
          <div className="fixed bottom-10 right-10 z-[500] animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Chưa lưu thứ tự</span>
              <button
                onClick={() => { setManualOrder(filteredVocabs.map(v => v.id)); setHasUnsavedOrder(false); }}
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

        <VocabAddModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchData(true); }}
          editingVocab={editingVocab}
          books={books}
          initialBookId={selectedBookId}
          vocabs={vocabs}
        />

        <VocabBulkUpdateModal
          isOpen={isBulkUpdateOpen}
          onClose={() => setIsBulkUpdateOpen(false)}
          onUpdate={handleBulkUpdate}
          bulkUpdateData={bulkUpdateData}
          setBulkUpdateData={setBulkUpdateData}
          books={books}
        />
      </div>
    </div>
  );
}
