import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import kanjiService from '../../api/kanjiService';
import bookService from '../../api/bookService';
import { Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function KanjiManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookIdParam = searchParams.get('bookId');
  
  const [kanjis, setKanjis] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    character: '',
    kunyomi: '',
    onyomi: '',
    hanviet: '',
    meaning: '',
    examples: '',
    bookId: '',
    week: '',
    day: ''
  });

  useEffect(() => {
    fetchData();
    if (bookIdParam) {
      setFormData(prev => ({ ...prev, bookId: bookIdParam }));
    }
  }, [bookIdParam]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [kanjiRes, bookRes] = await Promise.all([
        kanjiService.getAll(),
        bookService.getAll()
      ]);
      setKanjis(kanjiRes.data);
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
      character: '',
      kunyomi: '',
      onyomi: '',
      hanviet: '',
      meaning: '',
      examples: '',
      bookId: '',
      week: '',
      day: ''
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
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
      day: kanji.day || ''
    });
    setEditingId(kanji.id);
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
      message.success(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
    } catch (err) {
      message.error('Đã có lỗi xảy ra!');
      console.error(err);
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
          message.success('Đã xóa thành công');
        } catch (err) {
          message.error('Không thể xóa dữ liệu này.');
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Hán tự</h1>
            <p className="text-slate-400 text-[13px] font-medium">Hệ thống dữ liệu Kanji & Hán Việt</p>
          </div>
          <button 
            onClick={openAddModal} 
            className="bg-black text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
          >
            <PlusOutlined className="text-[10px]" />
            Thêm mới
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-slate-100 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Hán tự</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Hán Việt</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Âm On/Kun</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Ý nghĩa</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {kanjis.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 font-bold text-slate-900 text-2xl leading-none">{item.character}</td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-slate-700 uppercase tracking-widest text-[11px] bg-slate-50 px-2 py-1 rounded">
                        {item.hanviet}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ON: <span className="text-slate-900">{item.onyomi}</span></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">KUN: <span className="text-slate-600">{item.kunyomi}</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-500 text-[13px] italic">{item.meaning}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Chỉnh sửa Hán tự' : 'Thêm Hán tự mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-black transition-colors">Đóng</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chữ Hán</label>
                  <input type="text" name="character" value={formData.character} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Âm Hán Việt</label>
                  <input type="text" name="hanviet" value={formData.hanviet} onChange={handleInputChange} required placeholder="Ví dụ: NHẤT" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none uppercase" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bộ sách</label>
                  <select name="bookId" value={formData.bookId} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    <option value="">-- Chọn --</option>
                    {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ý nghĩa</label>
                  <input type="text" name="meaning" value={formData.meaning} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Âm ON</label>
                  <input type="text" name="onyomi" value={formData.onyomi} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Âm KUN</label>
                  <input type="text" name="kunyomi" value={formData.kunyomi} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ví dụ (Một ví dụ mỗi dòng)</label>
                <textarea name="examples" value={formData.examples} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" placeholder="Ví dụ: &#10;一人: một người&#10;二人: hai người"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tuần</label>
                  <input type="number" name="week" value={formData.week} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày</label>
                  <input type="number" name="day" value={formData.day} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-bold">Hủy</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-black text-white rounded-2xl font-bold">{editingId ? 'Cập nhật' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
