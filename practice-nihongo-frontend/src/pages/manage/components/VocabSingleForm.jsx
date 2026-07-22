import React, { useState, useEffect } from 'react';
import { Modal, Select, message } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import vocabService from '../../../api/vocabService';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config';

export default function VocabSingleForm({ onSuccess, editingVocab, books, initialBookId, vocabs }) {
  const { fetchWithAuth } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    word: '', reading: '', meaning: '', hanviet: '', example: '', exampleMeaning: '', bookId: '', week: '', day: ''
  });

  useEffect(() => {
    if (editingVocab) {
      setFormData({
        word: editingVocab.word,
        reading: editingVocab.reading,
        meaning: editingVocab.meaning,
        hanviet: editingVocab.hanviet || '',
        example: editingVocab.example,
        exampleMeaning: editingVocab.exampleMeaning,
        bookId: editingVocab.book?.id || '',
        week: editingVocab.week || '',
        day: editingVocab.day || ''
      });
    } else {
      setFormData({
        word: '', reading: '', meaning: '', hanviet: '', example: '', exampleMeaning: '', bookId: initialBookId || '', week: '', day: ''
      });
    }
  }, [editingVocab, initialBookId]);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if ((name === 'week' || name === 'day' || name === 'page') && value !== '' && parseInt(value) < 1) value = '1';
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAiAutoFill = async () => {
    if (!formData.word.trim()) return messageApi.warning('Vui lòng nhập Từ vựng');
    setIsAiLoading(true);
    messageApi.loading({ content: 'AI đang phân tích...', key: 'ai_fill' });
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/generate-vocab?word=${encodeURIComponent(formData.word)}`);
      const data = await res.json();
      setFormData(p => ({ 
        ...p, 
        reading: p.reading ? p.reading : (data.reading || ''), 
        meaning: p.meaning ? p.meaning : (data.meaning || ''), 
        hanviet: p.hanviet ? p.hanviet : (data.hanviet || ''),
        example: p.example ? p.example : (data.example || ''), 
        exampleMeaning: p.exampleMeaning ? p.exampleMeaning : (data.exampleMeaning || '') 
      }));
      messageApi.success({ content: 'AI hoàn tất!', key: 'ai_fill' });
    } catch (err) {
      messageApi.error({ content: 'Lỗi AI!', key: 'ai_fill' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookId) return messageApi.warning('Vui lòng chọn giáo trình');
    const payload = {
      ...formData,
      book: { id: parseInt(formData.bookId) },
      week: formData.week ? parseInt(formData.week) : null,
      day: formData.day ? parseInt(formData.day) : null
    };
    delete payload.bookId;

    if (!editingVocab) {
      const exists = vocabs.find(v =>
        v.word?.trim() === formData.word?.trim() &&
        (v.book?.id === parseInt(formData.bookId) || v.bookId === parseInt(formData.bookId)) &&
        v.week === (formData.week ? parseInt(formData.week) : null)
      );
      if (exists) {
        Modal.confirm({
          zIndex: 100000,
          title: 'Từ vựng đã tồn tại',
          content: 'Từ này đã có trong bài. Bạn muốn làm gì?',
          footer: () => (
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => Modal.destroyAll()} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Hủy</button>
              <button onClick={async () => {
                Modal.destroyAll();
                try {
                  await vocabService.create(payload);
                  onSuccess();
                  messageApi.success('Đã thêm mới!');
                } catch(e) {
                  messageApi.error('Lỗi lưu dữ liệu!');
                }
              }} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors">Vẫn thêm (Cho phép trùng)</button>
              <button onClick={async () => {
                Modal.destroyAll();
                try {
                  await vocabService.update(exists.id, payload);
                  onSuccess();
                  messageApi.success('Đã ghi đè thành công!');
                } catch(e) {
                  messageApi.error('Lỗi lưu dữ liệu!');
                }
              }} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 rounded-lg text-xs font-bold transition-opacity">Ghi đè</button>
            </div>
          )
        });
        return;
      }
    }

    try {
      if (editingVocab) await vocabService.update(editingVocab.id, payload);
      else await vocabService.create(payload);
      onSuccess();
      messageApi.success('Đã lưu vào giáo trình hệ thống!');
    } catch (err) {
      messageApi.error('Lỗi lưu dữ liệu!');
    }
  };

  return (
    <>
      {contextHolder}
      <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">Từ vựng</label>
              <button type="button" onClick={handleAiAutoFill} disabled={isAiLoading} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-black dark:text-white text-[9px] font-black rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase tracking-tighter flex items-center gap-1 disabled:opacity-50">
                <ThunderboltOutlined className="text-[10px]" /> AI ĐIỀN
              </button>
            </div>
            <input type="text" name="word" value={formData.word} onChange={handleInputChange} required className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-lg outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Cách đọc</label>
            <input type="text" name="reading" value={formData.reading} onChange={handleInputChange} required className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-lg outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Ý nghĩa</label>
            <input type="text" name="meaning" value={formData.meaning} onChange={handleInputChange} required className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-lg outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Âm Hán Việt</label>
            <input type="text" name="hanviet" value={formData.hanviet} onChange={handleInputChange} className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-lg outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Ví dụ (JP)</label>
            <input type="text" name="example" value={formData.example} onChange={handleInputChange} className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Dịch ví dụ</label>
            <input type="text" name="exampleMeaning" value={formData.exampleMeaning} onChange={handleInputChange} className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm italic outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-widest text-slate-400 px-1 block">Giáo trình</label>
            <Select value={formData.bookId} onChange={v => setFormData(p => ({ ...p, bookId: v }))} className="w-full custom-select-form" variant="borderless" popupClassName="custom-select-popup" dropdownClassName="custom-select-popup" style={{ borderBottom: '1px solid #f1f5f9' }} options={books.map(b => ({ value: b.id.toString(), label: b.title }))} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-widest text-slate-400 px-1">Bài số (Week)</label>
            <input type="number" min="1" name="week" value={formData.week} onChange={handleInputChange} placeholder="VD: 1, 2..." className="w-full px-1 py-1 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-xs outline-none transition-all" />
          </div>
        </div>
        <div className="pt-4">
          <button type="submit" className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:opacity-80 transition-all shadow-xl">
            {editingVocab ? 'CẬP NHẬT' : 'LƯU DỮ LIỆU'}
          </button>
        </div>
      </form>
    </>
  );
}
