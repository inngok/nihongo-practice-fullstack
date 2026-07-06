import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookService from '../../api/bookService';
import { Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import BookAddModal from './components/BookAddModal';

// Static lookup maps for premium typographical tags, eliminating conditional if-else branches in JSX
const CATEGORY_STYLES = {
  KANJI: 'bg-slate-900 text-white dark:bg-white dark:text-black border-slate-900 dark:border-white',
  GRAMMAR: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700',
  VOCABULARY: 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
};

const CATEGORY_LABELS = {
  KANJI: 'Hán Tự',
  GRAMMAR: 'Ngữ Pháp',
  VOCABULARY: 'Từ Vựng'
};

export default function BookManager() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    japaneseTitle: '',
    levelLabel: '',
    num: '',
    types: ['VOCABULARY'],
    publishGrammar: true,
    publishVocab: true,
    publishKanji: true
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getAll();
      setBooks(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách sách.');
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
      title: '',
      japaneseTitle: '',
      levelLabel: '',
      num: '',
      types: ['VOCABULARY'],
      publishGrammar: true,
      publishVocab: true,
      publishKanji: true
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    const bookTypes = book.type ? book.type.split(',') : ['VOCABULARY'];
    setFormData({
      title: book.title,
      japaneseTitle: book.japaneseTitle,
      levelLabel: book.levelLabel,
      num: book.num,
      types: bookTypes,
      publishGrammar: book.publishGrammar !== false,
      publishVocab: book.publishVocab !== false,
      publishKanji: book.publishKanji !== false
    });
    setEditingId(book.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        japaneseTitle: formData.japaneseTitle,
        levelLabel: formData.levelLabel,
        num: formData.num,
        type: formData.types.join(','),
        publishGrammar: formData.publishGrammar,
        publishVocab: formData.publishVocab,
        publishKanji: formData.publishKanji
      };

      if (editingId) {
        await bookService.update(editingId, payload);
      } else {
        await bookService.create(payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchBooks();
      message.success(editingId ? 'Cập nhật giáo trình thành công!' : 'Thêm giáo trình mới thành công!');

      // Broadcast update to other open tabs
      try {
        const channel = new BroadcastChannel('nihongo-sync-channel');
        channel.postMessage({ type: 'BOOKS_UPDATED' });
        channel.close();
      } catch (broadcastErr) {
        console.warn('Failed to broadcast sync event:', broadcastErr);
      }
    } catch (err) {
      message.error('Đã có lỗi xảy ra!');
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa giáo trình này? Tất cả dữ liệu liên quan (ngữ pháp, từ vựng) có thể bị ảnh hưởng.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await bookService.delete(id);
          fetchBooks();
          message.success('Đã xóa giáo trình');

          // Broadcast update to other open tabs
          try {
            const channel = new BroadcastChannel('nihongo-sync-channel');
            channel.postMessage({ type: 'BOOKS_UPDATED' });
            channel.close();
          } catch (broadcastErr) {
            console.warn('Failed to broadcast sync event:', broadcastErr);
          }
        } catch (err) {
          message.error('Không thể xóa giáo trình này.');
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
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý Giáo trình</h1>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">/ Textbooks</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Danh mục sách và tài liệu học tập hệ thống</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm flex items-center gap-2 self-start md:self-auto"
          >
            <PlusOutlined className="text-[10px]" />
            Thêm mới
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-slate-100 dark:border-slate-800 border-t-black dark:border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">STT</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tên giáo trình</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Phân loại</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Nhãn level</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                {books.length > 0 ? (
                  books.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors group">
                      <td className="px-6 py-5 font-bold text-slate-300 dark:text-slate-600">#{item.num}</td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900 dark:text-white leading-tight">{item.title}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">{item.japaneseTitle}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {item.type && item.type.split(',').map(t => {
                            const styleClass = CATEGORY_STYLES[t] || CATEGORY_STYLES.VOCABULARY;
                            const labelText = CATEGORY_LABELS[t] || CATEGORY_LABELS.VOCABULARY;
                            return (
                              <span key={t} className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${styleClass}`}>
                                {labelText}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                          {item.levelLabel}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-2 mr-4">
                            <button onClick={() => navigate(`/vocabulary/manage?bookId=${item.id}`)} className="text-[10px] font-bold text-slate-400 hover:text-black dark:hover:text-white uppercase tracking-tighter">Từ vựng</button>
                            <span className="text-slate-100 dark:text-slate-800">|</span>
                            <button onClick={() => navigate(`/kanji/manage?bookId=${item.id}`)} className="text-[10px] font-bold text-slate-400 hover:text-black dark:hover:text-white uppercase tracking-tighter">Hán tự</button>
                            <span className="text-slate-100 dark:text-slate-800">|</span>
                            <button onClick={() => navigate(`/grammar/manage?bookId=${item.id}`)} className="text-[10px] font-bold text-slate-400 hover:text-black dark:hover:text-white uppercase tracking-tighter">Ngữ pháp</button>
                          </div>
                          <div className="flex gap-1 border-l border-slate-100 dark:border-slate-800 pl-4">
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
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-300 dark:text-slate-600 italic text-sm">Chưa có giáo trình nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <BookAddModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
      />
    </div>
  );
}
