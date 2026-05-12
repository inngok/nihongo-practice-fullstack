import React, { useState, useEffect } from 'react';
import vocabService from '../../api/vocabService';
import flashcardService from '../../api/flashcardService';
import vocabFolderService from '../../api/vocabFolderService';
import { Modal, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function PersonalVocab() {
  const navigate = useNavigate();
  const [personalVocabs, setPersonalVocabs] = useState([]);
  const [savedVocabs, setSavedVocabs] = useState([]);
  const [savedKanjis, setSavedKanjis] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('personal'); // 'saved-vocab' | 'saved-kanji' | 'personal'
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderFormData, setFolderFormData] = useState({ name: '', description: '', sourceUrl: '' });
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderParent, setEditingFolderParent] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { fetchWithAuth } = useAuth();
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
      const [personalRes, allSavedRes, foldersRes] = await Promise.all([
        vocabService.getPersonal().catch(() => ({ data: [] })),
        flashcardService.getAll().catch(() => ({ data: [] })),
        vocabFolderService.getMyFolders().catch(() => ({ data: [] }))
      ]);

      setPersonalVocabs(personalRes.data);
      setFolders(foldersRes.data);

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

  const handleFolderInputChange = (e) => {
    const { name, value } = e.target;
    setFolderFormData(prev => ({ ...prev, [name]: value }));
  };

  const openFolderModal = () => {
    setFolderFormData({ name: '', description: '', sourceUrl: '' });
    setEditingFolderId(null);
    setEditingFolderParent(null);
    setIsFolderModalOpen(true);
  };

  const openEditFolderModal = (folder) => {
    setFolderFormData({
      name: folder.name,
      description: folder.description || '',
      sourceUrl: folder.sourceUrl || ''
    });
    setEditingFolderId(folder.id);
    setEditingFolderParent(folder.parent ? { id: folder.parent.id } : null);
    setIsFolderModalOpen(true);
  };

  const handleFolderSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFolderId) {
        const payload = {
          ...folderFormData,
          parent: editingFolderParent
        };
        await vocabFolderService.updateFolder(editingFolderId, payload);
        message.success('Đã cập nhật mục lưu trữ');
        // Update the currentFolder state if we are currently looking at it
        if (currentFolder && currentFolder.id === editingFolderId) {
          setCurrentFolder(prev => ({
            ...prev,
            name: folderFormData.name,
            description: folderFormData.description,
            sourceUrl: folderFormData.sourceUrl
          }));
        }
      } else {
        const payload = {
          ...folderFormData,
          parent: currentFolder ? { id: currentFolder.id } : null
        };
        await vocabFolderService.createFolder(payload);
        message.success('Đã tạo mục lưu trữ');
      }
      setIsFolderModalOpen(false);
      fetchData();
    } catch (err) {
      message.error(editingFolderId ? 'Lỗi cập nhật mục' : 'Lỗi tạo mục');
    }
  };

  const handleDeleteFolder = (id) => {
    Modal.confirm({
      title: 'Xóa mục lưu trữ',
      content: 'Bạn có chắc muốn xóa mục này cùng tất cả thư mục con và từ vựng trong đó?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await vocabFolderService.deleteFolder(id);
          if (currentFolder && currentFolder.id === id) {
            setCurrentFolder(null);
          }
          fetchData();
          message.success('Đã xóa mục lưu trữ');
        } catch (err) {
          message.error('Không thể xóa');
        }
      },
    });
  };

  const handleAiAutoFill = async () => {
    if (!formData.word.trim()) {
      return message.warning('Vui lòng nhập Từ vựng trước khi nhấn AI Điền Nhanh');
    }
    setIsAiLoading(true);
    message.loading({ content: 'AI đang phân tích và soạn câu ví dụ...', key: 'ai_fill' });
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/generate-vocab?word=${encodeURIComponent(formData.word)}`);
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Không thể tải từ AI');
        throw new Error(errorText);
      }
      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        reading: data.reading || prev.reading,
        meaning: data.meaning || prev.meaning,
        example: data.example || prev.example,
        exampleMeaning: data.exampleMeaning || prev.exampleMeaning
      }));
      message.success({ content: 'Đã điền thông tin tự động từ AI!', key: 'ai_fill' });
    } catch (err) {
      message.error({ content: 'Lỗi khi gọi AI: ' + err.message, key: 'ai_fill' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        folder: currentFolder ? { id: currentFolder.id } : null
      };
      if (editingId) {
        await vocabService.update(editingId, payload);
        message.success('Cập nhật thành công');
      } else {
        await vocabService.create(payload);
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
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center pt-24 md:pt-28 pb-16 px-6 font-sans relative overflow-hidden selection:bg-slate-200 transition-colors duration-300">
      <div className="w-full max-w-5xl relative z-10">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors mb-6 md:mb-8"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> QUAY LẠI
        </button>

        {/* Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Sổ tay cá nhân
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              Tổng cộng {savedVocabs.length + savedKanjis.length + personalVocabs.length} mục đã được lưu trữ
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/flashcards')}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 px-6 md:px-8 py-3.5 rounded-2xl font-bold transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-black/10 active:scale-95"
            >
              Luyện Flashcard
            </button>
            <button
              onClick={() => {
                if (activeTab !== 'personal') setActiveTab('personal');
                openFolderModal();
              }}
              className="border border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 px-6 md:px-8 py-3.5 rounded-2xl font-bold transition-all text-[11px] uppercase tracking-widest active:scale-95"
            >
              Thêm Thư Mục
            </button>
            <button
              onClick={() => {
                if (activeTab !== 'personal') setActiveTab('personal');
                openAddModal();
              }}
              className="border border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 px-6 md:px-8 py-3.5 rounded-2xl font-bold transition-all text-[11px] uppercase tracking-widest active:scale-95"
            >
              Thêm từ mới
            </button>
          </div>
        </div>

        {/* Minimalist Switcher Tabs */}
        <div className="flex flex-wrap gap-2.5 mb-10 border-b border-slate-100 pb-4">
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
        </div>

        {/* Main Content Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-slate-100 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : (activeList.length === 0 && (activeTab !== 'personal' || folders.length === 0)) ? (
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

            {/* PERSONAL CUSTOM LIST & FOLDERS */}
            {activeTab === 'personal' && (
              <>
                {/* Folder Header/Back */}
                {currentFolder && (
                  <div className="col-span-full mb-4 flex flex-col md:flex-row md:items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
                    <div>
                      <button onClick={() => setCurrentFolder(folders.find(f => f.id === currentFolder.parent?.id) || null)} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-black mb-2 block">
                        ← Quay lại
                      </button>
                      <div className="flex items-end gap-3">
                        <span className="font-extrabold text-2xl text-slate-900">{currentFolder.name}</span>
                        {currentFolder.description && <span className="text-sm font-semibold text-slate-500 mb-1">{currentFolder.description}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditFolderModal(currentFolder)} 
                        className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-black hover:border-slate-300 transition-all shadow-sm"
                      >
                        Sửa mục
                      </button>
                      {currentFolder.sourceUrl && (
                        <a href={currentFolder.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 hover:border-blue-200 transition-all shadow-sm">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                          Nguồn / Link
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Folders List */}
                {folders
                  .filter(f => currentFolder ? f.parent?.id === currentFolder.id : !f.parent)
                  .map(folder => (
                    <div 
                      key={`folder-${folder.id}`}
                      className="group relative bg-slate-50/50 border border-slate-200 rounded-3xl p-7 flex flex-col transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md cursor-pointer"
                      onClick={() => setCurrentFolder(folder)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100">
                            <svg className="w-6 h-6 text-slate-700" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{folder.name}</h3>
                            {folder.description && <p className="text-xs text-slate-500 font-semibold mt-1">{folder.description}</p>}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditFolderModal(folder); }} 
                            className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-black transition-colors"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} 
                            className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-5 flex justify-between items-center">
                        <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                          {personalVocabs.filter(v => v.folder?.id === folder.id).length} từ vựng
                        </span>
                        {folders.filter(f => f.parent?.id === folder.id).length > 0 && (
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            + {folders.filter(f => f.parent?.id === folder.id).length} mục con
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                {/* Vocab List for Current Level */}
                {activeList
                  .filter(item => currentFolder ? item.folder?.id === currentFolder.id : !item.folder)
                  .map((item) => (
                    <div 
                      key={item.id} 
                      className="group relative bg-white border border-slate-150 rounded-3xl p-7 flex flex-col transition-all duration-300 hover:border-slate-300 hover:shadow-md"
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
              </>
            )}

          </div>
        )}
      </div>

      {/* Manual Add Custom Vocab Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6 bg-black/10 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100">
            <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center shrink-0">
              <h2 className="text-[11px] font-black text-black uppercase tracking-[0.3em]">
                {editingId ? 'Cập nhật từ vựng' : 'Thêm vào sổ tay'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-black transition-colors">Đóng</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Từ vựng</label>
                    <button
                      type="button"
                      onClick={handleAiAutoFill}
                      disabled={isAiLoading}
                      className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 disabled:opacity-40 transition-colors flex items-center gap-1"
                    >
                      <span>✨ AI Điền Nhanh</span>
                    </button>
                  </div>
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

      {/* Folder Add Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6 bg-black/10 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100">
            <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center shrink-0">
              <h2 className="text-[11px] font-black text-black uppercase tracking-[0.3em]">
                {editingFolderId ? 'Sửa Thư Mục' : (currentFolder ? 'Thêm Thư Mục Con' : 'Thêm Mục Lưu Trữ')}
              </h2>
              <button onClick={() => setIsFolderModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-black transition-colors">Đóng</button>
            </div>
            
            <form onSubmit={handleFolderSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tên Thư Mục (VD: NHK)</label>
                <input
                  type="text"
                  name="name"
                  value={folderFormData.name}
                  onChange={handleFolderInputChange}
                  required
                  placeholder="..."
                  className="w-full pb-2 bg-transparent border-b border-slate-200 focus:border-black outline-none transition-all font-bold placeholder:font-normal"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mô tả / Ngày tháng (VD: Ngày 8/5)</label>
                <input
                  type="text"
                  name="description"
                  value={folderFormData.description}
                  onChange={handleFolderInputChange}
                  placeholder="..."
                  className="w-full pb-2 bg-transparent border-b border-slate-200 focus:border-black outline-none transition-all font-medium placeholder:font-normal"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Link đính kèm (Nguồn bài báo/Web)</label>
                <input
                  type="url"
                  name="sourceUrl"
                  value={folderFormData.sourceUrl}
                  onChange={handleFolderInputChange}
                  placeholder="https://..."
                  className="w-full pb-2 bg-transparent border-b border-slate-200 focus:border-black outline-none transition-all text-sm placeholder:text-slate-200"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-black text-white rounded-xl font-black hover:bg-slate-800 transition-all text-[11px] uppercase tracking-[0.3em]"
                >
                  {editingFolderId ? 'Cập nhật Thư Mục' : 'Tạo Thư Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
