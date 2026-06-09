import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import kanjiService from '../../api/kanjiService';
import bookService from '../../api/bookService';
import { Modal, message, Select, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import KanjiAddModal from './components/KanjiAddModal';

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
  const [editingKanji, setEditingKanji] = useState(null);
  
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Filter State
  const [selectedBookId, setSelectedBookId] = useState(bookIdParam || '');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({ week: '', page: '', bookId: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);



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
    let data = kanjis || [];
    if (selectedBookId && selectedBookId !== "") {
      data = data.filter(k => {
        const kBookId = k.bookId || k.book?.id;
        return kBookId?.toString() === selectedBookId.toString();
      });
    }
    if (selectedLesson && selectedLesson !== "") {
      data = data.filter(k => k.week?.toString() === selectedLesson.toString());
    }
    // Duplicate detection for Kanji
    const kanjiCounts = {};
    data.forEach(k => {
      if (k.character) {
        const char = k.character.trim();
        const bookId = k.bookId || k.book?.id || 'none';
        const week = k.week || 'none';
        const key = `${bookId}_${week}_${char}`;
        kanjiCounts[key] = (kanjiCounts[key] || 0) + 1;
      }
    });

    const kanjiSeen = {};
    let result = data.map(k => {
      let isDuplicate = false;
      let isSecondaryDuplicate = false;

      if (k.character) {
        const char = k.character.trim();
        const bookId = k.bookId || k.book?.id || 'none';
        const week = k.week || 'none';
        const key = `${bookId}_${week}_${char}`;

        isDuplicate = kanjiCounts[key] > 1;

        if (isDuplicate) {
          if (kanjiSeen[key]) {
            isSecondaryDuplicate = true;
          } else {
            kanjiSeen[key] = true;
          }
        }
      }
      return { ...k, isDuplicate, isSecondaryDuplicate };
    });

    if (showDuplicatesOnly) {
      result = result.filter(k => k.isSecondaryDuplicate);
    }

    return result;
  }, [kanjis, selectedBookId, selectedLesson, showDuplicatesOnly]);

  const uniqueLessons = React.useMemo(() => {
    let data = kanjis || [];
    if (selectedBookId && selectedBookId !== "") {
      data = data.filter(k => {
        const kBookId = k.bookId || k.book?.id;
        return kBookId?.toString() === selectedBookId.toString();
      });
    }
    const lessons = new Set();
    data.forEach(k => {
      if (k.week) lessons.add(k.week);
    });
    return Array.from(lessons).sort((a, b) => a - b);
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

  const handleCleanDuplicates = () => {
    // Find all items that are secondary duplicates in the CURRENT selected book/lesson view
    // We compute this from the raw kanjis without the showDuplicatesOnly filter
    let data = kanjis || [];
    if (selectedBookId && selectedBookId !== "") {
      data = data.filter(k => (k.bookId || k.book?.id)?.toString() === selectedBookId.toString());
    }
    if (selectedLesson && selectedLesson !== "") {
      data = data.filter(k => k.week?.toString() === selectedLesson.toString());
    }

    const kCounts = {};
    data.forEach(k => {
      if (k.character) {
        const key = `${k.bookId || k.book?.id || 'none'}_${k.week || 'none'}_${k.character.trim()}`;
        kCounts[key] = (kCounts[key] || 0) + 1;
      }
    });

    const kSeen = {};
    const duplicateIds = [];
    data.forEach(k => {
      if (k.character) {
        const key = `${k.bookId || k.book?.id || 'none'}_${k.week || 'none'}_${k.character.trim()}`;
        if (kCounts[key] > 1) {
          if (kSeen[key]) duplicateIds.push(k.id);
          else kSeen[key] = true;
        }
      }
    });

    if (duplicateIds.length === 0) {
      return messageApi.info('Không tìm thấy chữ Hán trùng lặp nào.');
    }

    Modal.confirm({
      title: 'Dọn dẹp chữ Hán trùng lặp',
      content: `Phát hiện ${duplicateIds.length} chữ Hán bị trùng lặp. Bạn có muốn tự động xóa các bản copy và chỉ giữ lại 1 bản gốc không?`,
      okText: 'Xóa bản trùng',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setIsCleaning(true);
        const hide = messageApi.loading(`Đang dọn dẹp ${duplicateIds.length} bản trùng...`, 0);
        try {
          for (const id of duplicateIds) {
            await kanjiService.delete(id);
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

  const openAddModal = () => {
    setEditingKanji(null);
    setIsModalOpen(true);
  };

  const openEditModal = (kanji) => {
    setEditingKanji(kanji);
    setIsModalOpen(true);
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
        <div className="flex flex-wrap gap-4 mb-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl items-center">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <FilterOutlined className="text-sm" />
            <span className="text-sm font-semibold">Bộ lọc:</span>
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
          {(selectedBookId || selectedLesson || showDuplicatesOnly) && (
            <button
              onClick={() => { setSelectedBookId(''); setSelectedLesson(''); setShowDuplicatesOnly(false); }}
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
                {filteredKanjis.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item) => (
                  <tr key={item.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors group ${selectedIds.includes(item.id) ? 'bg-slate-50/80 dark:bg-slate-850/50' : ''}`}>
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 text-black dark:text-white focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-900 dark:text-white text-2xl leading-none">
                      <div className="flex items-center gap-3">
                        {item.character}
                        {item.isDuplicate && (
                          <span className="text-[9px] font-black uppercase bg-rose-100 text-rose-600 px-2 py-1 rounded-md border border-rose-200 tracking-widest" title="Chữ Hán này bị lặp lại">Trùng</span>
                        )}
                      </div>
                    </td>
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
            <div className="flex justify-end p-6 border-t border-slate-100 dark:border-slate-800">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredKanjis.length}
                onChange={(page, size) => { setCurrentPage(page); setPageSize(size); }}
                showSizeChanger
                showTotal={(total) => `Tổng số ${total} Hán tự`}
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
                onChange={(e) => { let v = e.target.value; if(v !== '' && parseInt(v) < 1) v = '1'; setBulkUpdateData(prev => ({ ...prev, week: v })) }}
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
                onChange={(e) => { let v = e.target.value; if(v !== '' && parseInt(v) < 1) v = '1'; setBulkUpdateData(prev => ({ ...prev, page: v })) }}
                placeholder="VD: 120, 121..."
                className="w-full px-1 py-2 bg-transparent border-b border-slate-100 dark:border-slate-800 outline-none focus:border-black dark:focus:border-white transition-all text-sm font-medium"
              />
            </div>
          </div>
          <p className="text-[9px] text-slate-300 italic">* Bỏ trống nếu không muốn thay đổi trường đó</p>
        </div>
      </Modal>

      {/* Kanji Add Modal Extracted Component */}
      <KanjiAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { setIsModalOpen(false); fetchData(); }}
        editingKanji={editingKanji}
        books={books}
        initialBookId={selectedBookId}
        kanjis={kanjis}
      />
    </div>
  );
}
