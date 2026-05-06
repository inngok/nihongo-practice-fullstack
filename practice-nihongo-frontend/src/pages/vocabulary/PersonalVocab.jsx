import React, { useState, useEffect } from 'react';
import vocabService from '../../api/vocabService';
import flashcardService from '../../api/flashcardService';
import { Modal, message } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function PersonalVocab() {
  const navigate = useNavigate();
  const [personalVocabs, setPersonalVocabs] = useState([]);
  const [savedVocabs, setSavedVocabs] = useState([]);
  const [savedKanjis, setSavedKanjis] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('saved-vocab'); // 'saved-vocab' | 'saved-kanji' | 'personal'
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [personalRes, allSavedRes] = await Promise.all([
        vocabService.getPersonal().catch(() => ({ data: [] })),
        flashcardService.getAll().catch(() => ({ data: [] }))
      ]);

      setPersonalVocabs(personalRes.data);

      // Split saved flashcards into Vocab and Kanji categories
      const flashcards = allSavedRes.data;
      
      const vocabsOnly = flashcards
        .filter(fc => fc.vocab !== null && fc.vocab !== undefined)
        .map(fc => ({
          ...fc.vocab,
          flashcardId: fc.id
        }));

      const kanjisOnly = flashcards
        .filter(fc => fc.kanji !== null && fc.kanji !== undefined)
        .map(fc => ({
          ...fc.kanji,
          flashcardId: fc.id
        }));

      setSavedVocabs(vocabsOnly);
      setSavedKanjis(kanjisOnly);
    } catch (err) {
      console.error(err);
      message.error('Không thể tải dữ liệu.');
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
      fetchData();
    } catch (err) {
      message.error('Lỗi hệ thống');
    }
  };

  const handleDeletePersonal = (id) => {
    Modal.confirm({
      title: 'Xóa từ vựng',
      content: 'Bạn có chắc muốn bỏ từ này khỏi sổ tay?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await vocabService.delete(id);
          fetchData();
          message.success('Đã xóa từ tự thêm');
        } catch (err) {
          message.error('Không thể xóa');
        }
      },
    });
  };

  const handleDeleteSaved = (flashcardId) => {
    Modal.confirm({
      title: 'Xóa khỏi sổ tay',
      content: 'Bạn có chắc muốn bỏ chữ/từ này ra khỏi sổ tay ôn tập?',
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await flashcardService.delete(flashcardId);
          fetchData();
          message.success('Đã xóa khỏi sổ tay');
        } catch (err) {
          message.error('Không thể thực hiện');
        }
      },
    });
  };

  // Helper to get active dataset for rendering
  const getActiveData = () => {
    const dataMap = {
      'saved-vocab': savedVocabs,
      'saved-kanji': savedKanjis,
      'personal': personalVocabs
    };
    return dataMap[activeTab] || [];
  };

  const activeList = getActiveData();

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center pt-24 md:pt-28 pb-16 px-6 font-sans relative overflow-hidden selection:bg-slate-200">
      <div className="w-full max-w-5xl relative z-10">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors mb-6 md:mb-8 border border-slate-200 px-4 py-2 rounded-xl"
        >
          Quay lại trang chủ
        </button>

        {/* Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Sổ tay cá nhân
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Tổng cộng {savedVocabs.length + savedKanjis.length + personalVocabs.length} mục đã được lưu trữ
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/flashcards')}
              className="bg-black hover:bg-slate-800 text-white px-6 md:px-8 py-3.5 rounded-2xl font-bold transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-black/10 active:scale-95"
            >
              Luyện Flashcard
            </button>
            <button
              onClick={openAddModal}
              className="border border-slate-200 hover:border-black hover:bg-slate-50 text-slate-800 px-6 md:px-8 py-3.5 rounded-2xl font-bold transition-all text-[11px] uppercase tracking-widest active:scale-95"
            >
              Thêm từ mới
            </button>
          </div>
        </div>

        {/* Minimalist Switcher Tabs */}
        <div className="flex flex-wrap gap-2.5 mb-10 border-b border-slate-100 pb-4">
          <button
            onClick={() => setActiveTab('saved-vocab')}
            className={`text-[9px] font-black tracking-wider uppercase px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'saved-vocab'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            Từ vựng đã lưu ({savedVocabs.length})
          </button>
          <button
            onClick={() => setActiveTab('saved-kanji')}
            className={`text-[9px] font-black tracking-wider uppercase px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'saved-kanji'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            Hán tự đã lưu ({savedKanjis.length})
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`text-[9px] font-black tracking-wider uppercase px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'personal'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            Từ tự thêm ({personalVocabs.length})
          </button>
        </div>

        {/* Main Content Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-slate-100 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : activeList.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[40px]">
            <p className="text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em]">Danh sách hiện đang trống</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* SAVED VOCAB LIST */}
            {activeTab === 'saved-vocab' && activeList.map((item) => (
              <div 
                key={item.flashcardId} 
                className="group relative bg-white border border-slate-150 rounded-2xl p-7 flex flex-col transition-all duration-300 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{item.word}</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">{item.reading}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteSaved(item.flashcardId)} 
                    className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-950 transition-colors"
                  >
                    Bỏ lưu
                  </button>
                </div>
                
                <div className="pt-4 border-t border-slate-50 space-y-3">
                  <p className="text-slate-700 font-bold text-base leading-relaxed">{item.meaning}</p>
                  
                  {item.example && (
                    <div className="pt-2">
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-1">{item.example}</p>
                      <p className="text-[10px] text-slate-400 italic font-medium">{item.exampleMeaning}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* SAVED KANJI LIST */}
            {activeTab === 'saved-kanji' && activeList.map((item) => (
              <div 
                key={item.flashcardId} 
                className="group relative bg-white border border-slate-150 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-black text-slate-900 select-none">{item.character}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider leading-none">{item.hanviet || 'CHƯA CÓ'}</h3>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic truncate max-w-[120px] mt-1">{item.meaning || 'Chưa có nghĩa'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteSaved(item.flashcardId)} 
                    className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-950 transition-colors"
                  >
                    Bỏ lưu
                  </button>
                </div>
                
                <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Onyomi</span>
                    <span className="font-bold text-slate-800">{item.onyomi || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Kunyomi</span>
                    <span className="font-bold text-slate-800">{item.kunyomi || '—'}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* PERSONAL CUSTOM LIST */}
            {activeTab === 'personal' && activeList.map((item) => (
              <div 
                key={item.id} 
                className="group relative bg-white border border-slate-150 rounded-2xl p-7 flex flex-col transition-all duration-300 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{item.word}</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">{item.reading}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => openEditModal(item)} className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-black transition-colors">Sửa</button>
                    <button onClick={() => handleDeletePersonal(item.id)} className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors">Xóa</button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-50 space-y-3">
                  <p className="text-slate-700 font-bold text-base leading-relaxed">{item.meaning}</p>
                  
                  {item.example && (
                    <div className="pt-2">
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-1">{item.example}</p>
                      <p className="text-[10px] text-slate-400 italic font-medium">{item.exampleMeaning}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* Manual Add Custom Vocab Modal */}
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
