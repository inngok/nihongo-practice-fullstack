import React, { useState, useEffect } from 'react';
import vocabService from '../../api/vocabService';
import { Modal, message, Empty } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PersonalVocab() {
  const navigate = useNavigate();
  const [vocabs, setVocabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    word: '',
    reading: '',
    meaning: '',
    example: '',
    exampleMeaning: ''
  });

  useEffect(() => {
    fetchPersonalVocabs();
  }, []);

  const fetchPersonalVocabs = async () => {
    try {
      setLoading(true);
      const response = await vocabService.getPersonal();
      setVocabs(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        message.error('Vui lòng đăng nhập lại.');
      } else {
        message.error('Không thể tải dữ liệu.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ word: '', reading: '', meaning: '', example: '', exampleMeaning: '' });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (vocab) => {
    setFormData({
      word: vocab.word,
      reading: vocab.reading,
      meaning: vocab.meaning,
      example: vocab.example,
      exampleMeaning: vocab.exampleMeaning
    });
    setEditingId(vocab.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await vocabService.update(editingId, formData);
        message.success('Cập nhật thành công');
      } else {
        await vocabService.create(formData);
        message.success('Đã thêm từ mới');
      }
      setIsModalOpen(false);
      fetchPersonalVocabs();
    } catch (err) {
      message.error('Lỗi hệ thống');
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xóa từ vựng',
      content: 'Bác có chắc muốn bỏ từ này khỏi sổ tay?',
      okText: 'Xác nhận xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await vocabService.delete(id);
          fetchPersonalVocabs();
          message.success('Đã xóa');
        } catch (err) {
          message.error('Không thể xóa');
        }
      },
    });
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center pt-24 md:pt-28 pb-16 px-6 font-sans relative overflow-hidden selection:bg-slate-200">
      <div className="w-full max-w-5xl relative z-10">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-6 md:mb-8"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Quay lại
        </button>

        {/* Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Sổ tay cá nhân
            </h1>
            <p className="text-sm md:text-base text-slate-500 max-w-xl leading-relaxed uppercase font-bold tracking-[0.1em] text-[10px]">
              {vocabs.length} từ vựng đã lưu trữ
            </p>
          </div>
          
          <button
            onClick={openAddModal}
            className="bg-black text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all text-[11px] uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95"
          >
            Thêm từ mới
          </button>
        </div>

        {/* Grid Section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : vocabs.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-slate-100 rounded-[40px]">
            <p className="text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em]">Sổ tay hiện đang trống</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vocabs.map((item) => (
              <div 
                key={item.id} 
                className="group relative bg-white border border-slate-200 rounded-2xl p-7 flex flex-col transition-all duration-300 hover:border-slate-400 hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{item.word}</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">{item.reading}</p>
                  </div>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(item)} className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-black transition-colors">Sửa</button>
                    <button onClick={() => handleDelete(item.id)} className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors">Xóa</button>
                  </div>
                </div>
                
                <div className="pt-5 border-t border-slate-50 space-y-4">
                  <p className="text-slate-700 font-bold text-base leading-relaxed">{item.meaning}</p>
                  
                  {item.example && (
                    <div className="opacity-60 group-hover:opacity-100 transition-opacity pt-2">
                      <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-1">{item.example}</p>
                      <p className="text-[10px] text-slate-400 italic font-medium">{item.exampleMeaning}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Premium Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/10 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-[11px] font-black text-black uppercase tracking-[0.3em]">
                {editingId ? 'Cập nhật từ vựng' : 'Thêm vào sổ tay'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-black transition-colors">Đóng</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Từ vựng</label>
                  <input
                    type="text"
                    name="word"
                    value={formData.word}
                    onChange={handleInputChange}
                    placeholder="Chữ Hán/Kana"
                    required
                    className="w-full pb-2 bg-transparent border-b border-slate-200 focus:border-black outline-none transition-all text-xl font-bold placeholder:font-normal placeholder:text-slate-200"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Cách đọc</label>
                  <input
                    type="text"
                    name="reading"
                    value={formData.reading}
                    onChange={handleInputChange}
                    placeholder="Hiragana"
                    className="w-full pb-2 bg-transparent border-b border-slate-200 focus:border-black outline-none transition-all font-bold placeholder:font-normal placeholder:text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ý nghĩa</label>
                <input
                  type="text"
                  name="meaning"
                  value={formData.meaning}
                  onChange={handleInputChange}
                  placeholder="Tiếng Việt"
                  required
                  className="w-full pb-2 bg-transparent border-b border-slate-200 focus:border-black outline-none transition-all font-bold placeholder:font-normal placeholder:text-slate-200"
                />
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ví dụ (JP)</label>
                  <textarea
                    name="example"
                    value={formData.example}
                    onChange={handleInputChange}
                    placeholder="..."
                    rows="1"
                    className="w-full pb-2 bg-transparent border-b border-slate-200 focus:border-black outline-none transition-all resize-none font-medium text-sm placeholder:text-slate-200"
                  ></textarea>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Dịch nghĩa</label>
                  <input
                    type="text"
                    name="exampleMeaning"
                    value={formData.exampleMeaning}
                    onChange={handleInputChange}
                    placeholder="..."
                    className="w-full pb-2 bg-transparent border-b border-slate-200 focus:border-black outline-none transition-all text-xs italic placeholder:text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-5 bg-black text-white rounded-2xl font-black hover:bg-slate-800 transition-all text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-black/10"
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
