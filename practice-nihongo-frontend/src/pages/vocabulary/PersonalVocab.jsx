import React, { useState, useEffect } from 'react';
import personalVocabService from '../../api/personalVocabService';
import flashcardService from '../../api/flashcardService';
import vocabFolderService from '../../api/vocabFolderService';
import { Modal, message } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function PersonalVocab() {
  const navigate = useNavigate();
  const [personalVocabs, setPersonalVocabs] = useState([]);
  const [savedVocabs, setSavedVocabs] = useState([]);
  const [savedKanjis, setSavedKanjis] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('personal'); 
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
    word: '', reading: '', meaning: '', example: '', exampleMeaning: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [personalRes, allSavedRes, foldersRes] = await Promise.all([
        personalVocabService.getAll().catch(() => ({ data: [] })),
        flashcardService.getAll().catch(() => ({ data: [] })),
        vocabFolderService.getMyFolders().catch(() => ({ data: [] }))
      ]);

      setPersonalVocabs(personalRes.data);
      setFolders(foldersRes.data);

      const flashcards = allSavedRes.data;
      setSavedVocabs(flashcards.filter(fc => fc.vocab).map(fc => ({ ...fc.vocab, flashcardId: fc.id })));
      setSavedKanjis(flashcards.filter(fc => fc.kanji).map(fc => ({ ...fc.kanji, flashcardId: fc.id })));
    } catch (err) {
      message.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({ word: '', reading: '', meaning: '', example: '', exampleMeaning: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vocab) => {
    setFormData({ word: vocab.word, reading: vocab.reading, meaning: vocab.meaning, example: vocab.example, exampleMeaning: vocab.exampleMeaning });
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
    setIsFolderModalOpen(true);
  };

  const openEditFolderModal = (folder) => {
    setFolderFormData({ name: folder.name, description: folder.description || '', sourceUrl: folder.sourceUrl || '' });
    setEditingFolderId(folder.id);
    setEditingFolderParent(folder.parent ? { id: folder.parent.id } : null);
    setIsFolderModalOpen(true);
  };

  const handleFolderSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...folderFormData, parent: editingFolderId ? editingFolderParent : (currentFolder ? { id: currentFolder.id } : null) };
      if (editingFolderId) {
        await vocabFolderService.updateFolder(editingFolderId, payload);
        if (currentFolder && currentFolder.id === editingFolderId) {
          setCurrentFolder(prev => ({ ...prev, ...folderFormData }));
        }
      } else {
        await vocabFolderService.createFolder(payload);
      }
      setIsFolderModalOpen(false);
      fetchData();
      message.success('Đã lưu thư mục');
    } catch (err) { message.error('Lỗi thao tác thư mục'); }
  };

  const handleDeleteFolder = (id) => {
    Modal.confirm({
      title: 'Xóa thư mục', content: 'Tất cả nội dung bên trong sẽ bị xóa.', okText: 'Xóa', okType: 'danger', centered: true,
      onOk: async () => {
        try {
          await vocabFolderService.deleteFolder(id);
          if (currentFolder && currentFolder.id === id) setCurrentFolder(null);
          fetchData();
          message.success('Đã xóa');
        } catch (err) { message.error('Lỗi xóa'); }
      },
    });
  };

  const handleAiAutoFill = async () => {
    if (!formData.word.trim()) return message.warning('Nhập từ vựng trước');
    setIsAiLoading(true);
    message.loading({ content: 'AI đang soạn nội dung...', key: 'ai_fill' });
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/generate-vocab?word=${encodeURIComponent(formData.word)}`);
      const data = await res.json();
      setFormData(prev => ({ ...prev, reading: data.reading || prev.reading, meaning: data.meaning || prev.meaning, example: data.example || prev.example, exampleMeaning: data.exampleMeaning || prev.exampleMeaning }));
      message.success({ content: 'AI hoàn tất!', key: 'ai_fill' });
    } catch (err) { message.error({ content: 'Lỗi AI', key: 'ai_fill' }); } finally { setIsAiLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, folder: currentFolder ? { id: currentFolder.id } : null };
      if (editingId) await personalVocabService.update(editingId, payload);
      else await personalVocabService.create(payload);
      setIsModalOpen(false);
      fetchData();
      message.success('Đã lưu từ vựng');
    } catch (err) { message.error('Lỗi lưu'); }
  };

  const activeList = activeTab === 'personal' ? personalVocabs : (activeTab === 'saved-vocab' ? savedVocabs : savedKanjis);
  
  const filteredFolders = folders.filter(f => currentFolder ? f.parent?.id === currentFolder.id : !f.parent);
  const filteredVocabs = activeList.filter(item => {
    if (activeTab !== 'personal') return true;
    return currentFolder ? item.folder?.id === currentFolder.id : !item.folder;
  });

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center pt-20 pb-16 px-6 transition-colors duration-300">
      <div className="w-full max-w-5xl">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-black dark:hover:text-white transition-colors mb-8"
        >
          ← QUAY LẠI
        </button>

        {/* Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Sổ tay cá nhân</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
              {savedVocabs.length + savedKanjis.length + personalVocabs.length} MỤC ĐÃ LƯU
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/flashcards')} className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md">LUYỆN FLASHCARD</button>
            <button onClick={() => { if (activeTab !== 'personal') setActiveTab('personal'); openFolderModal(); }} className="border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">THÊM THƯ MỤC</button>
            <button onClick={() => { if (activeTab !== 'personal') setActiveTab('personal'); openAddModal(); }} className="border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">THÊM TỪ MỚI</button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 mb-8 border-b border-slate-100 dark:border-slate-900 pb-4">
          {['personal', 'saved-vocab', 'saved-kanji'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[10px] font-bold uppercase tracking-widest pb-2 px-1 transition-all relative ${
                activeTab === tab ? 'text-black dark:text-white' : 'text-slate-400'
              }`}
            >
              {tab === 'personal' ? 'Từ tự thêm' : (tab === 'saved-vocab' ? 'Từ vựng đã lưu' : 'Hán tự đã lưu')}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-slate-200 border-t-black rounded-full animate-spin"></div></div>
        ) : (
          <div className="w-full space-y-6">
            {/* Folder Navigation */}
            {activeTab === 'personal' && currentFolder && (
              <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col gap-1">
                  <button onClick={() => setCurrentFolder(currentFolder.parent)} className="text-[9px] font-bold text-slate-400 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest mb-1">← QUAY LẠI</button>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentFolder.name}</h2>
                </div>
                <button onClick={() => openEditFolderModal(currentFolder)} className="text-[10px] font-bold text-slate-400 hover:text-black dark:hover:text-white uppercase tracking-widest border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg">Sửa mục</button>
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'personal' && filteredFolders.map(folder => (
                <div key={folder.id} onClick={() => setCurrentFolder(folder)} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-black dark:hover:border-white transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center text-slate-400"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></svg></div>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); openEditFolderModal(folder); }} className="text-[9px] font-bold text-slate-300 hover:text-black dark:hover:text-white uppercase">Sửa</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="text-[9px] font-bold text-slate-300 hover:text-rose-500 uppercase">Xóa</button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{folder.name}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{personalVocabs.filter(v => v.folder?.id === folder.id).length} TỪ VỰNG</p>
                </div>
              ))}

              {filteredVocabs.map((item) => (
                <div key={activeTab === 'personal' ? item.id : item.flashcardId} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-black dark:hover:border-white transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-slate-900 dark:text-white font-kanji leading-tight">{activeTab === 'saved-kanji' ? item.character : item.word}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeTab === 'saved-kanji' ? item.hanviet : item.reading}</div>
                    </div>
                    <div className="flex gap-2">
                      {activeTab === 'personal' ? (
                        <button onClick={() => openEditModal(item)} className="text-[9px] font-bold text-slate-300 hover:text-black dark:hover:text-white uppercase">Sửa</button>
                      ) : null}
                      <button onClick={() => activeTab === 'personal' ? personalVocabService.delete(item.id).then(fetchData) : flashcardService.delete(item.flashcardId).then(fetchData)} className="text-[9px] font-bold text-slate-300 hover:text-rose-500 uppercase">Xóa</button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">{item.meaning}</p>
                  {item.example && (
                    <div className="pt-3 border-t border-slate-50 dark:border-slate-800/50">
                      <p className="text-[11px] text-slate-500 leading-relaxed">{item.example}</p>
                      <p className="text-[10px] text-slate-400 italic mt-1">{item.exampleMeaning}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFolders.length === 0 && filteredVocabs.length === 0 && (
              <div className="py-20 text-center border border-dashed border-slate-100 dark:border-slate-900 rounded-3xl">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Thư mục trống</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals remain functional but cleaner */}
      <Modal
        title={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{editingId ? 'Cập nhật từ vựng' : 'Thêm từ mới'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        styles={{ content: { borderRadius: '24px', padding: '32px' } }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1"><label className="text-[9px] font-bold uppercase text-slate-400">Từ vựng</label><button type="button" onClick={handleAiAutoFill} disabled={isAiLoading} className="text-[9px] font-bold text-black dark:text-white uppercase"><ThunderboltOutlined /> AI TỰ ĐIỀN</button></div>
              <input type="text" name="word" value={formData.word} onChange={handleInputChange} required className="w-full bg-transparent border-b border-slate-100 outline-none py-1.5 font-bold text-lg" />
            </div>
            <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400 px-1">Cách đọc</label><input type="text" name="reading" value={formData.reading} onChange={handleInputChange} required className="w-full bg-transparent border-b border-slate-100 outline-none py-1.5 font-bold text-lg" /></div>
          </div>
          <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400 px-1">Ý nghĩa</label><input type="text" name="meaning" value={formData.meaning} onChange={handleInputChange} required className="w-full bg-transparent border-b border-slate-100 outline-none py-1.5 font-bold" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400 px-1">Ví dụ</label><input type="text" name="example" value={formData.example} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-100 outline-none py-1 text-sm" /></div>
            <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400 px-1">Dịch</label><input type="text" name="exampleMeaning" value={formData.exampleMeaning} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-100 outline-none py-1 text-sm italic text-slate-400" /></div>
          </div>
          <button type="submit" className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg">LƯU VÀO SỔ TAY</button>
        </form>
      </Modal>

      <Modal
        title={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{editingFolderId ? 'Sửa thư mục' : 'Tạo thư mục'}</span>}
        open={isFolderModalOpen}
        onCancel={() => setIsFolderModalOpen(false)}
        footer={null}
        centered
        styles={{ content: { borderRadius: '24px', padding: '32px' } }}
      >
        <form onSubmit={handleFolderSubmit} className="space-y-6">
          <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400 px-1">Tên thư mục</label><input type="text" name="name" value={folderFormData.name} onChange={handleFolderInputChange} required className="w-full bg-transparent border-b border-slate-100 outline-none py-1.5 font-bold" /></div>
          <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400 px-1">Mô tả</label><input type="text" name="description" value={folderFormData.description} onChange={handleFolderInputChange} className="w-full bg-transparent border-b border-slate-100 outline-none py-1.5" /></div>
          <div className="space-y-2"><label className="text-[9px] font-bold uppercase text-slate-400 px-1">Nguồn (URL)</label><input type="url" name="sourceUrl" value={folderFormData.sourceUrl} onChange={handleFolderInputChange} className="w-full bg-transparent border-b border-slate-100 outline-none py-1.5 text-xs text-slate-400" /></div>
          <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-widest">XÁC NHẬN TẠO</button>
        </form>
      </Modal>
    </div>
  );
}
