import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import grammarService from '../../api/grammarService';
import bookService from '../../api/bookService';
import { Modal, message, Select, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined, ThunderboltOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { createPortal } from 'react-dom';
import GrammarAddModal from './components/GrammarAddModal';
import GrammarBulkUpdateModal from './components/GrammarBulkUpdateModal';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({ week: '', day: '', bookId: '' });

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
