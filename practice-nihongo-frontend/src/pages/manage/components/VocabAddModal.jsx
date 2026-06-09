import React, { useState, useEffect } from 'react';
import { Modal, Select, message } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { createPortal } from 'react-dom';
import vocabService from '../../../api/vocabService';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config';

export default function VocabAddModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingVocab, 
  books, 
  initialBookId,
  vocabs 
}) {
  const { fetchWithAuth } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const [modalTab, setModalTab] = useState('single');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Single Add State
  const [formData, setFormData] = useState({
    word: '', reading: '', meaning: '', example: '', exampleMeaning: '', bookId: '', week: '', day: ''
  });

  // Bulk Add State
  const [bulkInput, setBulkInput] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingVocab) {
        setFormData({
          word: editingVocab.word,
          reading: editingVocab.reading,
          meaning: editingVocab.meaning,
          example: editingVocab.example,
          exampleMeaning: editingVocab.exampleMeaning,
          bookId: editingVocab.book?.id || '',
          week: editingVocab.week || '',
          day: editingVocab.day || ''
        });
        setModalTab('single');
      } else {
        setFormData({
          word: '', reading: '', meaning: '', example: '', exampleMeaning: '', bookId: initialBookId || '', week: '', day: ''
        });
        setSelectedBookId(initialBookId || '');
        setBulkInput('');
        setPreviewData([]);
        setModalTab('single');
      }
    }
  }, [isOpen, editingVocab, initialBookId]);

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
      setFormData(p => ({ ...p, reading: data.reading || p.reading, meaning: data.meaning || p.meaning, example: data.example || p.example, exampleMeaning: data.exampleMeaning || p.exampleMeaning }));
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
          content: 'Từ này đã có trong bài. Bạn muốn ghi đè dữ liệu mới không?',
          okText: 'Ghi đè',
          cancelText: 'Hủy',
          onOk: async () => {
            try {
              await vocabService.update(exists.id, payload);
              onSuccess();
              messageApi.success('Đã ghi đè thành công!');
            } catch (err) {
              messageApi.error('Lỗi lưu dữ liệu!');
            }
          }
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

  const handleBulkAiProcess = async () => {
    if (!bulkInput.trim()) return messageApi.warning('Vui lòng dán nội dung');
    setIsAiProcessing(true);
    const hide = messageApi.loading('AI đang xử lý danh sách giáo trình...', 0);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/generate-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bulkInput, type: 'VOCABULARY' })
      });
      const data = await res.json();
      setPreviewData(data.map(item => ({ ...item, selected: true })));
      messageApi.success('AI đã xử lý xong!');
    } catch (err) {
      messageApi.error('AI lỗi!');
    } finally {
      setIsAiProcessing(false);
      hide();
    }
  };

  const handleSaveBulk = async () => {
    const items = previewData.filter(i => i.selected);
    if (!items.length || !selectedBookId) return messageApi.warning('Vui lòng chọn giáo trình và ít nhất 1 từ vựng');

    const bookIdInt = parseInt(selectedBookId);
    const weekInt = formData.week ? parseInt(formData.week) : null;

    const duplicates = [];
    const newItems = [];

    items.forEach(itm => {
      const exists = vocabs.find(v =>
        v.word?.trim() === itm.word?.trim() &&
        (v.book?.id === bookIdInt || v.bookId === bookIdInt) &&
        v.week === weekInt
      );
      if (exists) {
        duplicates.push({ ...itm, existingId: exists.id });
      } else {
        newItems.push(itm);
      }
    });

    const saveProcess = async (shouldOverwrite) => {
      setIsSaving(true);
      const hide = messageApi.loading('Đang lưu dữ liệu...', 0);
      try {
        for (const itm of newItems) {
          await vocabService.create({
            ...itm,
            week: weekInt,
            book: { id: bookIdInt }
          });
        }

        if (shouldOverwrite) {
          for (const dup of duplicates) {
            await vocabService.update(dup.existingId, {
              ...dup,
              week: weekInt,
              book: { id: bookIdInt }
            });
          }
        }
        messageApi.success('Đã lưu hệ thống!');
        onSuccess();
      } catch (e) {
        messageApi.error('Lỗi khi lưu!');
      } finally {
        setIsSaving(false);
        hide();
      }
    };

    if (duplicates.length > 0) {
      Modal.confirm({
        zIndex: 100000,
        title: 'Phát hiện từ vựng trùng lặp',
        content: `Có ${duplicates.length} từ đã tồn tại. Ghi đè mới hay bỏ qua?`,
        okText: 'Ghi đè (Overwrite)',
        cancelText: 'Giữ nguyên (Skip)',
        onOk: () => saveProcess(true),
        onCancel: () => saveProcess(false)
      });
    } else {
      saveProcess(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 dark:bg-black/80 overflow-y-auto">
      {contextHolder}
      <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full ${modalTab === 'bulk' ? 'max-w-6xl' : 'max-w-lg'} rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-300 transition-all overflow-hidden`}>
        {/* Header with Tabs */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setModalTab('single')}
              className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all pb-1 ${modalTab === 'single' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
            >
              {editingVocab ? 'CHỈNH SỬA' : 'THÊM THỦ CÔNG'}
            </button>
            {!editingVocab && (
              <button
                onClick={() => setModalTab('bulk')}
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all pb-1 ${modalTab === 'bulk' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
              >
                AI NHẬP HÀNG LOẠT
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-black dark:hover:text-white transition-colors">
            Đóng
          </button>
        </div>

        {modalTab === 'single' ? (
          <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto hide-scrollbar">
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
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Ý nghĩa</label>
              <input type="text" name="meaning" value={formData.meaning} onChange={handleInputChange} required className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-lg outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700" />
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
        ) : (
          <div className="p-8 space-y-8 bg-white dark:bg-slate-950">
            {/* Information Header */}
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs font-medium">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-black dark:text-white shrink-0"><ThunderboltOutlined /></div>
              <p>Dán danh sách từ vựng thô vào ô bên trái. AI sẽ tự động dọn dẹp, phân tích và chuẩn hóa dữ liệu thành bảng hoàn chỉnh.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
              {/* Left: Input Textarea */}
              <div className="relative group h-full">
                <textarea
                  value={bulkInput}
                  onChange={e => setBulkInput(e.target.value)}
                  placeholder="Dán dữ liệu thô vào đây (ví dụ: các từ vựng copy từ PDF, Website...)"
                  className="w-full h-full p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 outline-none text-sm resize-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all custom-scrollbar placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium text-slate-700 dark:text-slate-200 leading-relaxed"
                />
              </div>

              {/* Right: Preview Area */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-y-auto border border-slate-200/60 dark:border-slate-800 custom-scrollbar h-full relative">
                {previewData.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 shadow-sm border-b border-slate-200/60 dark:border-slate-800 z-10">
                      <tr>
                        <th className="p-4 w-12 text-center"><input type="checkbox" onChange={(e) => setPreviewData(d => d.map(item => ({ ...item, selected: e.target.checked })))} checked={previewData.every(i => i.selected)} className="w-4 h-4 cursor-pointer rounded-sm" /></th>
                        <th className="p-4 text-left font-bold uppercase tracking-widest text-[10px] text-slate-400">Từ vựng</th>
                        <th className="p-4 text-left font-bold uppercase tracking-widest text-[10px] text-slate-400">Ý nghĩa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {previewData.map((item, idx) => (
                        <tr key={idx} className={`transition-colors ${item.selected ? 'bg-white dark:bg-slate-800/30' : 'opacity-40 grayscale'}`}>
                          <td className="p-4 text-center"><input type="checkbox" checked={item.selected} onChange={() => { const d = [...previewData]; d[idx].selected = !d[idx].selected; setPreviewData(d); }} className="w-4 h-4 cursor-pointer rounded-sm" /></td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white font-kanji text-base">{item.word}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{item.meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 space-y-4">
                    <div className="w-16 h-16 rounded-full border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-white/50 dark:bg-black/20">
                      <ThunderboltOutlined className="text-2xl opacity-50" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Bản xem trước dữ liệu</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-2">
              <button
                onClick={handleBulkAiProcess}
                disabled={isAiProcessing}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isAiProcessing ? <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" /> : <ThunderboltOutlined />}
                {isAiProcessing ? 'ĐANG PHÂN TÍCH...' : 'AI PHÂN TÍCH'}
              </button>

              <div className="flex w-full sm:w-auto items-center gap-3 bg-slate-50 dark:bg-slate-900/80 p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <div className="w-48 pl-3">
                  <Select
                    value={selectedBookId}
                    onChange={v => setSelectedBookId(v)}
                    className="w-full custom-select"
                    variant="borderless"
                    popupClassName="custom-select-popup" dropdownClassName="custom-select-popup"
                    placeholder="Chọn giáo trình..."
                    options={books.map(b => ({ value: b.id.toString(), label: b.title }))}
                  />
                </div>
                <div className="w-20 border-l border-slate-200/60 dark:border-slate-800 pl-3">
                  <input
                    type="number"
                    min="1"
                    name="week"
                    value={formData.week}
                    onChange={handleInputChange}
                    placeholder="Bài..."
                    className="w-full bg-transparent outline-none text-xs font-semibold text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                  />
                </div>
                <button
                  disabled={isSaving}
                  onClick={handleSaveBulk}
                  className="w-full sm:w-auto px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'ĐANG LƯU...' : 'LƯU DỮ LIỆU'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
