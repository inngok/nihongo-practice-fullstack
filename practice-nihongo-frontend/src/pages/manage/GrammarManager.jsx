import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import grammarService from '../../api/grammarService';
import bookService from '../../api/bookService';
import { Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function GrammarManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookIdParam = searchParams.get('bookId');
  
  const [grammars, setGrammars] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    structure: '',
    meaning: '',
    explanation: '',
    exampleSentence: '',
    exampleMeaning: '',
    level: 'N3',
    bookId: ''
  });

  const levels = ['N1', 'N2', 'N3', 'N4', 'N5'];

  useEffect(() => {
    fetchData();
    if (bookIdParam) {
      setFormData(prev => ({ ...prev, bookId: bookIdParam }));
    }
  }, [bookIdParam]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [grammarRes, bookRes] = await Promise.all([
        grammarService.getAll(),
        bookService.getAll()
      ]);
      setGrammars(grammarRes.data);
      setBooks(bookRes.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu.');
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
      structure: '',
      meaning: '',
      explanation: '',
      exampleSentence: '',
      exampleMeaning: '',
      level: 'N3',
      bookId: ''
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (grammar) => {
    setFormData({
      structure: grammar.structure,
      meaning: grammar.meaning,
      explanation: grammar.explanation,
      exampleSentence: grammar.exampleSentence,
      exampleMeaning: grammar.exampleMeaning,
      level: grammar.level,
      bookId: grammar.book?.id || ''
    });
    setEditingId(grammar.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      book: formData.bookId ? { id: parseInt(formData.bookId) } : null
    };
    delete payload.bookId; // Remove bookId from payload before sending to backend

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
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa cấu trúc này? Hành động này không thể hoàn tác.',
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
    <div className="flex-grow w-full py-8 px-10 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* Simple Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Ngữ pháp</h1>
            <p className="text-slate-400 text-[13px] font-medium">Biên tập nội dung ngữ pháp hệ thống</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/grammar/books')}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              Giáo trình
            </button>
            <button
              onClick={openAddModal}
              className="bg-black text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
            >
              <PlusOutlined className="text-[10px]" />
              Thêm mới
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-slate-100 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Cấu trúc</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Giáo trình</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Ý nghĩa</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Level</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {grammars.length > 0 ? (
                  grammars.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 font-bold text-slate-900">{item.structure}</td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                          {item.book?.title || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-500 text-[13px] italic">{item.meaning}</td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold 
                          ${item.level === 'N1' ? 'text-red-600 bg-red-50' : 
                            item.level === 'N2' ? 'text-orange-600 bg-orange-50' : 
                            item.level === 'N3' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 bg-slate-100'}`}>
                          {item.level}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(item)} 
                            className="p-2 text-slate-400 hover:text-black transition-colors"
                            title="Sửa"
                          >
                            <EditOutlined className="text-base" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
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
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-300 italic text-sm">Chưa có dữ liệu.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingId ? 'Chỉnh sửa ngữ pháp' : 'Thêm ngữ pháp mới'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-black transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Cấu trúc</label>
                  <input
                    type="text"
                    name="structure"
                    value={formData.structure}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: ~たことがある"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Giáo trình</label>
                  <select
                    name="bookId"
                    value={formData.bookId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all appearance-none"
                  >
                    <option value="">-- Chọn giáo trình --</option>
                    {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Ý nghĩa</label>
                  <input
                    type="text"
                    name="meaning"
                    value={formData.meaning}
                    onChange={handleInputChange}
                    placeholder="Ý nghĩa tiếng Việt"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all appearance-none"
                  >
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Giải thích</label>
                <textarea
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleInputChange}
                  placeholder="Cách dùng, lưu ý..."
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Câu ví dụ (JP)</label>
                  <input
                    type="text"
                    name="exampleSentence"
                    value={formData.exampleSentence}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Nghĩa ví dụ (VN)</label>
                  <input
                    type="text"
                    name="exampleMeaning"
                    value={formData.exampleMeaning}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-black text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-black/10"
                >
                  {editingId ? 'Cập nhật' : 'Lưu dữ liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
