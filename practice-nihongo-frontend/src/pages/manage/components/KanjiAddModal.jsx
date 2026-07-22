import React, { useState, useEffect } from 'react';
import { Modal, Select, message } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { createPortal } from 'react-dom';
import kanjiService from '../../../api/kanjiService';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config';

export default function KanjiAddModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingKanji, 
  books, 
  initialBookId,
  kanjis // Pass kanjis to check duplicates
}) {
  const { fetchWithAuth } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const [modalTab, setModalTab] = useState('single');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  // Single Add State
  const [formData, setFormData] = useState({
    character: '',
    kunyomi: '',
    onyomi: '',
    hanviet: '',
    meaning: '',
    examples: '',
    bookId: '',
    week: '',
    day: '',
    page: ''
  });

  // Bulk Add State
  const [bulkInput, setBulkInput] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingKanji) {
        setFormData({
          character: editingKanji.character,
          kunyomi: editingKanji.kunyomi,
          onyomi: editingKanji.onyomi,
          hanviet: editingKanji.hanviet,
          meaning: editingKanji.meaning,
          examples: editingKanji.examples,
          bookId: editingKanji.book?.id || '',
          week: editingKanji.week || '',
          day: editingKanji.day || '',
          page: editingKanji.page || ''
        });
        setModalTab('single');
      } else {
        setFormData({
          character: '',
          kunyomi: '',
          onyomi: '',
          hanviet: '',
          meaning: '',
          examples: '',
          bookId: initialBookId || '',
          week: '',
          day: '',
          page: ''
        });
        setSelectedBookId(initialBookId || '');
        setBulkInput('');
        setPreviewData([]);
        setModalTab('single');
      }
    }
  }, [isOpen, editingKanji, initialBookId]);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if ((name === 'week' || name === 'day' || name === 'page') && value !== '' && parseInt(value) < 1) value = '1';
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAiAutoFill = async () => {
    if (!formData.character.trim()) return messageApi.warning('Vui lòng nhập Hán tự trước!');

    setIsAiProcessing(true);
    const hide = messageApi.loading('AI đang phân tích Hán tự...', 0);

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/ai/generate-kanji?character=${encodeURIComponent(formData.character)}`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();

      setFormData(prev => ({
        ...prev,
        hanviet: prev.hanviet ? prev.hanviet : (data.hanviet || ''),
        meaning: prev.meaning ? prev.meaning : (data.meaning || ''),
        onyomi: prev.onyomi ? prev.onyomi : (data.onyomi || ''),
        kunyomi: prev.kunyomi ? prev.kunyomi : (data.kunyomi || '')
      }));

      messageApi.success('AI đã điền xong!');
    } catch (err) {
      console.error(err);
      messageApi.error('Lỗi khi gọi AI: ' + err.message);
    } finally {
      hide();
      setIsAiProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      book: formData.bookId ? { id: parseInt(formData.bookId) } : null,
      week: formData.week ? parseInt(formData.week) : null,
      day: formData.day ? parseInt(formData.day) : null
    };
    delete payload.bookId;

    if (!editingKanji) {
      const exists = kanjis.find(k =>
        k.character?.trim() === formData.character?.trim() &&
        (k.book?.id === parseInt(formData.bookId) || k.bookId === parseInt(formData.bookId)) &&
        k.week === (formData.week ? parseInt(formData.week) : null)
      );
      if (exists) {
        Modal.confirm({
          zIndex: 100000,
          title: 'Hán tự đã tồn tại',
          content: 'Chữ Hán này đã có trong bài. Bạn muốn làm gì?',
          footer: () => (
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => Modal.destroyAll()} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Hủy</button>
              <button onClick={async () => {
                Modal.destroyAll();
                try {
                  await kanjiService.create(payload);
                  onSuccess();
                  messageApi.success('Đã thêm mới!');
                } catch(err) {
                  messageApi.error('Đã có lỗi xảy ra!');
                }
              }} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors">Vẫn thêm (Cho phép trùng)</button>
              <button onClick={async () => {
                Modal.destroyAll();
                try {
                  await kanjiService.update(exists.id, payload);
                  onSuccess();
                  messageApi.success('Đã ghi đè thành công!');
                } catch(err) {
                  messageApi.error('Đã có lỗi xảy ra!');
                }
              }} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 rounded-lg text-xs font-bold transition-opacity">Ghi đè</button>
            </div>
          )
        });
        return;
      }
    }

    try {
      if (editingKanji) {
        await kanjiService.update(editingKanji.id, payload);
      } else {
        await kanjiService.create(payload);
      }
      onSuccess();
      messageApi.success(editingKanji ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
    } catch (err) {
      console.error('Submit Kanji error:', err);
      messageApi.error('Đã có lỗi xảy ra!');
    }
  };

  const handleBulkAiProcess = async () => {
    if (!bulkInput.trim()) return messageApi.warning('Vui lòng dán nội dung cần xử lý');
    if (!selectedBookId) return messageApi.warning('Vui lòng chọn giáo trình trước khi nhập hàng loạt');

    setIsAiProcessing(true);
    const hide = messageApi.loading('AI đang phân tích Hán tự hàng loạt...', 0);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/generate-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: bulkInput,
          type: 'KANJI'
        })
      });
      if (!res.ok) throw new Error('AI processing failed');
      const data = await res.json();
      const weekInt = formData.week ? parseInt(formData.week) : null;
      const bookIdInt = parseInt(selectedBookId);
      const mappedData = data.map(item => {
        const isDuplicate = kanjis?.some(k =>
          k.character?.trim() === item.character?.trim() &&
          (k.book?.id === bookIdInt || k.bookId === bookIdInt) &&
          (weekInt === null || k.week === weekInt)
        ) ?? false;
        return { ...item, selected: !isDuplicate, isDuplicate };
      });
      setPreviewData(mappedData);
      const dupCount = mappedData.filter(i => i.isDuplicate).length;
      if (dupCount > 0) {
        messageApi.warning(`Đã phân tích xong! Phát hiện ${dupCount} chữ Hán đã tồn tại (bỏ chọn sẵn).`);
      } else {
        messageApi.success('Đã phân tích xong Hán tự!');
      }
    } catch (err) {
      messageApi.error('Lỗi khi xử lý hàng loạt: ' + err.message);
    } finally {
      setIsAiProcessing(false);
      hide();
    }
  };

  const handleSaveBulk = async () => {
    const itemsToSave = previewData.filter(item => item.selected);
    if (itemsToSave.length === 0) return messageApi.warning('Không có chữ Hán nào được chọn');

    const bookIdInt = parseInt(selectedBookId);
    const weekInt = formData.week ? parseInt(formData.week) : null;

    const duplicates = [];
    const newItems = [];

    itemsToSave.forEach(itm => {
      const exists = kanjis.find(k =>
        k.character?.trim() === itm.character?.trim() &&
        (k.book?.id === bookIdInt || k.bookId === bookIdInt) &&
        k.week === weekInt
      );
      if (exists) {
        duplicates.push({ ...itm, existingId: exists.id });
      } else {
        newItems.push(itm);
      }
    });

    const saveProcess = async (actionType) => {
      const hide = messageApi.loading(`Đang lưu chữ Hán...`, 0);
      try {
        const allItems = itemsToSave;
        
        for (let i = 0; i < allItems.length; i++) {
          const item = allItems[i];
          const isDup = duplicates.find(d => d.character === item.character);
          
          if (isDup) {
            if (actionType === 'OVERWRITE') {
              await kanjiService.update(isDup.existingId, {
                ...isDup,
                book: { id: bookIdInt },
                week: weekInt,
                day: formData.day ? parseInt(formData.day) : null
              });
            } else if (actionType === 'ADD_NEW') {
              const { existingId, ...rest } = isDup;
              await kanjiService.create({
                ...rest,
                book: { id: bookIdInt },
                week: weekInt,
                day: formData.day ? parseInt(formData.day) : null
              });
            }
          } else {
            await kanjiService.create({
              ...item,
              book: { id: bookIdInt },
              week: weekInt,
              day: formData.day ? parseInt(formData.day) : null
            });
          }
        }

        messageApi.success(`Đã lưu thành công!`);
        onSuccess();
      } catch (err) {
        messageApi.error('Lỗi khi lưu dữ liệu: ' + err.message);
      } finally {
        hide();
      }
    };

    if (duplicates.length > 0) {
      Modal.confirm({
        zIndex: 100000,
        width: 500,
        title: 'Phát hiện Hán tự trùng lặp',
        content: `Có ${duplicates.length} Hán tự đã tồn tại trong bài học này. Bạn muốn làm gì với những chữ này?`,
        footer: () => (
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => { Modal.destroyAll(); saveProcess('SKIP'); }} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Giữ cái cũ (Skip)</button>
            <button onClick={() => { Modal.destroyAll(); saveProcess('ADD_NEW'); }} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors">Vẫn thêm (Trùng lặp)</button>
            <button onClick={() => { Modal.destroyAll(); saveProcess('OVERWRITE'); }} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 rounded-lg text-xs font-bold transition-opacity">Ghi đè (Overwrite)</button>
          </div>
        )
      });
    } else {
      saveProcess('ADD_NEW');
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
              {editingKanji ? 'CHỈNH SỬA' : 'THÊM THỦ CÔNG'}
            </button>
            {!editingKanji && (
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
          <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">Hán tự</label>
                  <button type="button" onClick={handleAiAutoFill} disabled={isAiProcessing} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-black dark:text-white text-[9px] font-black rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase tracking-tighter flex items-center gap-1 disabled:opacity-50">
                    <ThunderboltOutlined className="text-[10px]" /> AI ĐIỀN
                  </button>
                </div>
                <input
                  type="text"
                  name="character"
                  value={formData.character}
                  onChange={handleInputChange}
                  placeholder="Chữ Hán"
                  required
                  className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-lg outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Hán Việt</label>
                <input
                  type="text"
                  name="hanviet"
                  value={formData.hanviet}
                  onChange={handleInputChange}
                  placeholder="ÂM HÁN VIỆT"
                  required
                  className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-lg outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700 uppercase"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Ý nghĩa</label>
              <input
                type="text"
                name="meaning"
                value={formData.meaning}
                onChange={handleInputChange}
                placeholder="Tiếng Việt"
                required
                className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-lg outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Âm ON</label>
                <input
                  type="text"
                  name="onyomi"
                  value={formData.onyomi}
                  onChange={handleInputChange}
                  placeholder="Onyomi"
                  className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Âm KUN</label>
                <input
                  type="text"
                  name="kunyomi"
                  value={formData.kunyomi}
                  onChange={handleInputChange}
                  placeholder="Kunyomi"
                  className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-widest text-slate-400 px-1 block">Giáo trình</label>
                <Select
                  value={formData.bookId}
                  onChange={(value) => setFormData(prev => ({ ...prev, bookId: value }))}
                  placeholder="Chọn giáo trình"
                  className="w-full custom-select-form"
                  variant="borderless"
                  classNames={{
                    popup: 'custom-select-popup'
                  }}
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                  options={books.map(b => ({ value: b.id, label: b.title }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-widest text-slate-400 px-1">Bài số</label>
                <input
                  type="number"
                  name="week"
                  value={formData.week}
                  onChange={handleInputChange}
                  placeholder="VD: 1, 2..."
                  className="w-full px-1 py-1 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-xs outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:opacity-80 transition-all shadow-xl"
              >
                {editingKanji ? 'CẬP NHẬT' : 'LƯU DỮ LIỆU'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex-grow overflow-hidden flex flex-col p-8 gap-8">
            <div className="flex flex-col md:flex-row gap-8 flex-grow overflow-hidden">
              <div className="w-full md:w-1/3 flex flex-col gap-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Nội dung thô (Raw Text)</label>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Ví dụ: &#10;1. 食 - thực - ăn&#10;2. 行 - hành - đi&#10;3. 寝 - tẩm - ngủ"
                  className="flex-grow w-full p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white text-slate-900 dark:text-white outline-none transition-all resize-none rounded-3xl text-sm leading-relaxed"
                ></textarea>
                <button
                  onClick={handleBulkAiProcess}
                  disabled={isAiProcessing || !bulkInput.trim()}
                  className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  {isAiProcessing ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                  ) : 'AI PHÂN TÍCH'}
                </button>
              </div>

              <div className="flex-grow flex flex-col gap-4 overflow-hidden">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
                    Bản xem trước ({previewData.length} chữ)
                  </label>
                  {previewData.length > 0 && (
                    <div className="flex gap-4">
                      <button onClick={() => setPreviewData(prev => prev.map(d => ({ ...d, selected: true })))} className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Chọn tất cả</button>
                      <button onClick={() => setPreviewData(prev => prev.map(d => ({ ...d, selected: false })))} className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Bỏ chọn</button>
                    </div>
                  )}
                </div>

                <div className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden overflow-y-auto shadow-inner">
                  {previewData.length > 0 ? (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-4 w-10 text-center"></th>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">Hán tự</th>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">Hán Việt</th>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">ON/KUN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {previewData.map((item, idx) => (
                          <tr key={idx} className={`hover:bg-white dark:hover:bg-slate-900 transition-colors ${item.isDuplicate ? 'bg-rose-50/60 dark:bg-rose-950/20' : ''}`}>
                            <td className="p-4 text-center">
                              <input type="checkbox" checked={item.selected} onChange={() => {
                                const newData = [...previewData];
                                newData[idx].selected = !newData[idx].selected;
                                setPreviewData(newData);
                              }} className="w-4 h-4 rounded border-slate-300 accent-black dark:accent-white" />
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="font-bold text-slate-900 dark:text-white text-2xl">{item.character}</div>
                                {item.isDuplicate && (
                                  <span className="text-[8px] font-black uppercase bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded border border-rose-200 leading-tight">Đã có</span>
                                )}
                              </div>
                              <div className="text-slate-400 italic text-[10px]">{item.meaning}</div>
                            </td>
                            <td className="p-4 text-center font-black text-black dark:text-white uppercase tracking-widest">{item.hanviet}</td>
                            <td className="p-4">
                              <div className="text-slate-700 dark:text-slate-300">ON: {item.onyomi}</div>
                              <div className="text-slate-400 text-[10px]">KUN: {item.kunyomi}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 space-y-4 py-20">
                      <div className="text-6xl opacity-10 font-black italic">AI KANJI</div>
                      <p className="text-sm italic">Dán danh sách Kanji và nhấn phân tích</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <option value="">-- Chọn giáo trình --</option>
                  {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>

                <div className="flex items-center gap-2 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-950">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bài (Week):</span>
                  <input
                    type="number"
                    name="week"
                    min="1"
                    placeholder="--"
                    value={formData.week}
                    onChange={handleInputChange}
                    className="w-12 bg-transparent outline-none text-xs font-bold text-center text-slate-700 dark:text-slate-300"
                  />
                </div>

                <div className="flex items-center gap-2 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-950">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ngày (Day):</span>
                  <input
                    type="number"
                    name="day"
                    min="1"
                    placeholder="--"
                    value={formData.day}
                    onChange={handleInputChange}
                    className="w-12 bg-transparent outline-none text-xs font-bold text-center text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={onClose} className="px-8 py-3 font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">HỦY</button>
                <button onClick={handleSaveBulk} disabled={previewData.length === 0 || !selectedBookId} className="px-10 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all shadow-xl disabled:opacity-30">
                  LƯU ({previewData.filter(i => i.selected).length} chữ)
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
