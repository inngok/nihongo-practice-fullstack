import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import vocabService from '../../api/vocabService';
import bookService from '../../api/bookService';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import VocabAddModal from './components/VocabAddModal';
import VocabBulkUpdateModal from './components/VocabBulkUpdateModal';
import { createPortal } from 'react-dom';
import { Modal, message, Select, Empty, Pagination } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  ThunderboltOutlined,
  SearchOutlined
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
    z-index: 999999 !important;
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
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);

  const [selectedBookId, setSelectedBookId] = useState(bookIdParam || '');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState(null);
  const [isCleaning, setIsCleaning] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({ week: '', day: '', bookId: '' });
  const [messageApi, contextHolder] = message.useMessage();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    fetchData();
    if (bookIdParam) setSelectedBookId(bookIdParam);
    const channel = new BroadcastChannel('nihongo-sync-channel');
    channel.onmessage = (e) => (e.data?.type === 'BOOKS_UPDATED' || e.data?.type === 'DATA_CHANGED') && fetchData();
    
    const handleGlobalDataChanged = () => fetchData();
    window.addEventListener('GLOBAL_DATA_CHANGED', handleGlobalDataChanged);
    
    return () => {
      channel.close();
      window.removeEventListener('GLOBAL_DATA_CHANGED', handleGlobalDataChanged);
    };
  }, [bookIdParam]);

  const filteredVocabs = React.useMemo(() => {
    let data = Array.isArray(vocabs) ? vocabs : [];
    if (selectedBookId) {
      data = data.filter(v => (v.bookId || v.book?.id)?.toString() === selectedBookId.toString());
    }
    if (selectedLesson) {
      data = data.filter(v => v.week?.toString() === selectedLesson.toString());
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      data = data.filter(v => v.word?.toLowerCase().includes(s) || v.reading?.toLowerCase().includes(s) || v.meaning?.toLowerCase().includes(s));
    }

    // Đếm số lần xuất hiện của từ vựng theo từng BÀI (bookId + week) để tìm từ trùng lặp trong cùng 1 bài
    const wordCounts = {};
    data.forEach(v => {
      if (v.word) {
        const w = v.word.trim();
        const bookId = v.bookId || v.book?.id || 'none';
        const week = v.week || 'none';
        const key = `${bookId}_${week}_${w}`;
        wordCounts[key] = (wordCounts[key] || 0) + 1;
      }
    });

    const wordSeen = {};

    let result = data.map(v => {
      let isDuplicate = false;
      let isSecondaryDuplicate = false;

      if (v.word) {
        const w = v.word.trim();
        const bookId = v.bookId || v.book?.id || 'none';
        const week = v.week || 'none';
        const key = `${bookId}_${week}_${w}`;

        isDuplicate = wordCounts[key] > 1;

        if (isDuplicate) {
          if (wordSeen[key]) {
            isSecondaryDuplicate = true;
          } else {
            wordSeen[key] = true;
          }
        }
      }

      return {
        ...v,
        isDuplicate,
        isSecondaryDuplicate
      };
    });

    if (showDuplicatesOnly) {
      // Chỉ hiện các từ lặp ở vị trí thứ 2 trở đi, giữ lại bản gốc
      result = result.filter(v => v.isSecondaryDuplicate);
    }

    return result;
  }, [vocabs, selectedBookId, selectedLesson, searchTerm, showDuplicatesOnly]);

  const uniqueLessons = React.useMemo(() => {
    let data = Array.isArray(vocabs) ? vocabs : [];
    if (selectedBookId) {
      data = data.filter(v => (v.bookId || v.book?.id)?.toString() === selectedBookId.toString());
    }
    const lessons = new Set();
    data.forEach(v => {
      if (v.week) lessons.add(v.week);
    });
    return Array.from(lessons).sort((a, b) => a - b);
  }, [vocabs, selectedBookId]);

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

  const openAddModal = () => {
    setEditingVocab(null);
    setIsModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingVocab(v);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      zIndex: 100000,
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

  const handleCleanDuplicates = () => {
    let data = Array.isArray(vocabs) ? vocabs : [];
    if (selectedBookId) {
      data = data.filter(v => (v.bookId || v.book?.id)?.toString() === selectedBookId.toString());
    }
    if (selectedLesson) {
      data = data.filter(v => v.week?.toString() === selectedLesson.toString());
    }

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

    if (duplicateIds.length === 0) {
      return messageApi.info('Không tìm thấy từ vựng trùng lặp nào.');
    }

    Modal.confirm({
      zIndex: 100000,
      title: 'Dọn dẹp từ vựng trùng lặp',
      content: `Phát hiện ${duplicateIds.length} bản sao bị trùng. Bạn có muốn xóa tự động tất cả các bản copy và chỉ giữ lại 1 bản gốc không?`,
      okText: 'Dọn dẹp ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setIsCleaning(true);
        const hide = messageApi.loading(`Đang dọn dẹp ${duplicateIds.length} bản trùng...`, 0);
        try {
          for (const id of duplicateIds) {
            await vocabService.delete(id);
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

  const toggleSelectOne = (id) => setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === filteredVocabs.length ? [] : filteredVocabs.map(v => v.id));

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
      fetchData();
    } catch (e) {
      messageApi.error('Lỗi!');
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
              popupClassName="custom-select-popup" dropdownClassName="custom-select-popup"
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
              popupClassName="custom-select-popup" dropdownClassName="custom-select-popup"
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
                  {filteredVocabs.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((v) => (
                    <tr key={v.id} className={`transition-colors ${selectedIds.includes(v.id) ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                      <td className="pl-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(v.id)}
                          onChange={() => toggleSelectOne(v.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-900 dark:text-white font-kanji text-lg">
                        <div className="flex items-center gap-2">
                          {v.word}
                          {v.isDuplicate && (
                            <span className="text-[8px] font-black uppercase bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-md border border-rose-200" title="Từ này xuất hiện nhiều lần">Trùng</span>
                          )}
                        </div>
                      </td>
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

              <div className="flex justify-end p-6 border-t border-slate-100 dark:border-slate-800">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredVocabs.length}
                  onChange={(page, size) => { setCurrentPage(page); setPageSize(size); }}
                  showSizeChanger
                  showTotal={(total) => `Tổng số ${total} từ vựng`}
                />
              </div>
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
                      zIndex: 100000,
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

        <VocabAddModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchData(); }}
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
