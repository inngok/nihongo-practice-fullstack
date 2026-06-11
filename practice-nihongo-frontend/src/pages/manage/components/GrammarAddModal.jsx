import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ThunderboltOutlined } from '@ant-design/icons';
import { message } from 'antd';
import grammarService from '../../../api/grammarService';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config';

export default function GrammarAddModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  books, 
  initialData, 
  defaultBookId,
  existingGrammars = []
}) {
  const [modalTab, setModalTab] = useState('single');
  const [bulkInput, setBulkInput] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { fetchWithAuth } = useAuth();
  
  const [formData, setFormData] = useState({
    structure: '',
    meaning: '',
    explanation: '',
    exampleSentence: '',
    exampleMeaning: '',
    quizSentence: '',
    level: 'N3',
    bookId: '',
    week: 1,
    day: 1,
    publish: true
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          structure: initialData.structure,
          meaning: initialData.meaning,
          explanation: initialData.explanation,
          exampleSentence: initialData.exampleSentence,
          exampleMeaning: initialData.exampleMeaning,
          quizSentence: initialData.quizSentence || '',
          level: initialData.level,
          bookId: initialData.book?.id || '',
          week: initialData.week || 1,
          day: initialData.day || 1,
          publish: initialData.publish !== false
        });
        setModalTab('single');
      } else {
        setFormData({
          structure: '',
          meaning: '',
          explanation: '',
          exampleSentence: '',
          exampleMeaning: '',
          quizSentence: '',
          level: 'N3',
          bookId: defaultBookId || '',
          week: 1,
          day: 1,
          publish: true
        });
        setModalTab('single');
      }
      setBulkInput('');
      setPreviewData([]);
    }
  }, [isOpen, initialData, defaultBookId]);

  useEffect(() => {
    if (formData.bookId && !initialData) {
      const selectedBook = books.find(b => b.id.toString() === formData.bookId.toString());
      if (selectedBook && selectedBook.levelLabel) {
        setFormData(prev => ({ ...prev, level: selectedBook.levelLabel }));
      }
    }
  }, [formData.bookId, books, initialData]);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if ((name === 'week' || name === 'day' || name === 'page') && value !== '' && parseInt(value) < 1) value = '1';
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAiAutoFill = async () => {
    if (!formData.structure.trim()) return message.warning('Vui lòng nhập cấu trúc ngữ pháp trước!');

    setIsAiProcessing(true);
    const hide = message.loading('AI đang phân tích ngữ pháp...', 0);

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/ai/generate-grammar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structure: formData.structure,
          existingSentence: formData.exampleSentence || ''
        })
      }); 
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();

      setFormData(prev => ({
        ...prev,
        meaning: data.meaning || prev.meaning,
        explanation: data.explanation || prev.explanation,
        exampleSentence: data.exampleSentence || prev.exampleSentence,
        exampleMeaning: data.exampleMeaning || prev.exampleMeaning,
        quizSentence: data.quizSentence || prev.quizSentence
      }));

      message.success('AI đã điền xong!');
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi gọi AI: ' + err.message);
    } finally {
      hide();
      setIsAiProcessing(false);
    }
  };

  const handleBulkAiProcess = async () => {
    if (!bulkInput.trim()) return message.warning('Vui lòng dán nội dung cần xử lý');
    if (!formData.bookId) return message.warning('Vui lòng chọn giáo trình trước khi phân tích hàng loạt');

    setIsAiProcessing(true);
    const hide = message.loading('AI đang phân tích ngữ pháp hàng loạt...', 0);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/generate-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: bulkInput,
          type: 'GRAMMAR'
        })
      });
      if (!res.ok) throw new Error('AI processing failed');
      const data = await res.json();
      
      const mappedData = data.map(item => {
        let isDuplicate = false;
        if (existingGrammars && formData.bookId) {
           isDuplicate = existingGrammars.some(g => 
              (g.bookId?.toString() === formData.bookId.toString() || g.book?.id?.toString() === formData.bookId.toString()) && 
              g.structure.trim() === item.structure.trim()
           );
        }
        return { ...item, selected: !isDuplicate, isDuplicate };
      });
      
      setPreviewData(mappedData);
      message.success('Đã phân tích xong Ngữ pháp!');
    } catch (err) {
      message.error('Lỗi khi xử lý hàng loạt: ' + err.message);
    } finally {
      setIsAiProcessing(false);
      hide();
    }
  };

  const handleSaveBulk = async () => {
    const itemsToSave = previewData.filter(item => item.selected);
    if (itemsToSave.length === 0) return message.warning('Không có cấu trúc nào được chọn');

    setIsSaving(true);
    const hide = message.loading(`Đang lưu ${itemsToSave.length} cấu trúc ngữ pháp...`, 0);
    try {
      const payload = itemsToSave.map(item => ({
        structure: item.structure,
        meaning: item.meaning,
        explanation: item.explanation,
        exampleSentence: item.exampleSentence,
        exampleMeaning: item.exampleMeaning,
        quizSentence: item.quizSentence,
        level: item.level || 'N3',
        book: { id: parseInt(formData.bookId) },
        week: formData.week ? parseInt(formData.week) : null,
        day: formData.day ? parseInt(formData.day) : null
      }));

      for (const item of payload) {
        await grammarService.create(item);
      }

      message.success(`Đã lưu thành công ${itemsToSave.length} cấu trúc!`);
      onSuccess();
      onClose();
    } catch (err) {
      message.error('Lỗi khi lưu dữ liệu: ' + err.message);
    } finally {
      setIsSaving(false);
      hide();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      book: formData.bookId ? { id: parseInt(formData.bookId) } : null
    };
    delete payload.bookId;

    setIsSaving(true);
    try {
      if (initialData) {
        await grammarService.update(initialData.id, payload);
      } else {
        await grammarService.create(payload);
      }
      message.success(initialData ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      message.error('Đã có lỗi xảy ra!');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 dark:bg-black/80 overflow-y-auto">
      <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full ${modalTab === 'bulk' ? 'max-w-6xl' : 'max-w-lg'} rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-300 transition-all overflow-hidden`}>
        {/* Header with Tabs */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setModalTab('single')}
              className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all pb-1 ${modalTab === 'single' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
            >
              {initialData ? 'CHỈNH SỬA' : 'THÊM THỦ CÔNG'}
            </button>
            {!initialData && (
              <button
                onClick={() => setModalTab('bulk')}
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all pb-1 ${modalTab === 'bulk' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
              >
                AI NHẬP HÀNG LOẠT
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-black dark:hover:text-white transition-colors">
            Đóng
          </button>
        </div>

        {modalTab === 'single' ? (
          <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto hide-scrollbar">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">Cấu trúc</label>
                  <button type="button" onClick={handleAiAutoFill} disabled={isAiProcessing} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-black dark:text-white text-[9px] font-black rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase tracking-tighter flex items-center gap-1 disabled:opacity-50">
                    <ThunderboltOutlined className="text-[10px]" /> AI ĐIỀN
                  </button>
                </div>
                <input
                  type="text"
                  name="structure"
                  value={formData.structure}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: ~たことがある"
                  required
                  className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-lg outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
                />
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
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Giải thích</label>
              <textarea
                name="explanation"
                value={formData.explanation}
                onChange={handleInputChange}
                rows="2"
                placeholder="Cách dùng cấu trúc này..."
                className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all resize-none placeholder:text-slate-200 dark:placeholder:text-slate-700"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Ví dụ (JP)</label>
                <input
                  type="text"
                  name="exampleSentence"
                  value={formData.exampleSentence}
                  onChange={handleInputChange}
                  placeholder="..."
                  className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Dịch nghĩa</label>
                <input
                  type="text"
                  name="exampleMeaning"
                  value={formData.exampleMeaning}
                  onChange={handleInputChange}
                  placeholder="..."
                  className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 px-1">Câu hỏi Trắc nghiệm (Đục lỗ bằng '_____')</label>
              <input
                type="text"
                name="quizSentence"
                value={formData.quizSentence}
                onChange={handleInputChange}
                placeholder="Ví dụ: 山々に_____いて (dùng 5 dấu gạch dưới)"
                className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 px-1">Giáo trình</label>
              <select
                name="bookId"
                value={formData.bookId}
                onChange={handleInputChange}
                required
                className="w-full px-1 py-1 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-xs outline-none transition-all"
              >
                <option value="" className="dark:bg-slate-950">-- Chọn --</option>
                {books.map(b => <option key={b.id} value={b.id} className="dark:bg-slate-950">{b.title}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 px-1">Tuần (Week)</label>
                <input
                  type="number"
                  name="week"
                  min="1"
                  value={formData.week}
                  onChange={handleInputChange}
                  className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 px-1">Ngày (Day)</label>
                <input
                  type="number"
                  name="day"
                  min="1"
                  value={formData.day}
                  onChange={handleInputChange}
                  className="w-full px-1 py-1.5 bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-black dark:focus:border-white text-slate-900 dark:text-white text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:opacity-80 transition-all shadow-xl disabled:opacity-50"
              >
                {isSaving ? 'ĐANG LƯU...' : (initialData ? 'CẬP NHẬT' : 'LƯU DỮ LIỆU')}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex-grow overflow-hidden flex flex-col p-8 gap-8">
            <div className="flex flex-col md:flex-row gap-8 flex-grow overflow-hidden">
              <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giáo trình</label>
                    <select
                      name="bookId"
                      value={formData.bookId}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none"
                    >
                      <option value="">-- Chọn --</option>
                      {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                    </select>
                  </div>
                  <div className="w-16 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tuần</label>
                    <input type="number" min="1" name="week" value={formData.week} onChange={handleInputChange} className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none" />
                  </div>
                  <div className="w-16 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày</label>
                    <input type="number" min="1" name="day" value={formData.day} onChange={handleInputChange} className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 flex-grow">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Nội dung thô (Raw Text)</label>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Ví dụ: &#10;1. ~たことがある&#10;2. ~ほうがいい&#10;3. ~なければならない"
                  className="flex-grow w-full p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-black/10 focus:border-black text-slate-900 dark:text-white outline-none transition-all resize-none rounded-3xl text-sm leading-relaxed"
                ></textarea>
                </div>
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
                    Bản xem trước ({previewData.length} cấu trúc)
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
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">Cấu trúc</th>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">Ý nghĩa</th>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-center">Ví dụ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {previewData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-white dark:hover:bg-slate-900 transition-colors">
                            <td className="p-4 text-center">
                              <input type="checkbox" checked={item.selected} onChange={() => {
                                const newData = [...previewData];
                                newData[idx].selected = !newData[idx].selected;
                                setPreviewData(newData);
                              }} className="w-4 h-4 rounded border-slate-300 accent-black dark:accent-white" />
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-slate-900 dark:text-white text-base">{item.structure}</div>
                                {item.isDuplicate && (
                                  <span className="text-[8px] font-black uppercase bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded border border-rose-200">Đã có</span>
                                )}
                              </div>
                              <div className="text-black dark:text-white font-black uppercase tracking-widest text-[10px] opacity-50">{item.level}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-slate-900 dark:text-white">{item.meaning}</div>
                              <div className="text-slate-400 italic line-clamp-1">{item.explanation}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-slate-700 dark:text-slate-300 line-clamp-1">{item.exampleSentence}</div>
                              <div className="text-slate-400 text-[10px] line-clamp-1 italic">{item.exampleMeaning}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 space-y-4 py-20">
                      <div className="text-6xl opacity-10 font-black italic">AI GRAMMAR</div>
                      <p className="text-sm italic">Dán danh sách cấu trúc và nhấn phân tích</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-4">
                <button onClick={onClose} className="px-8 py-3 font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">HỦY</button>
                <button onClick={handleSaveBulk} disabled={previewData.length === 0 || !formData.bookId || isSaving} className="px-10 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all shadow-xl disabled:opacity-30">
                  {isSaving ? 'ĐANG LƯU...' : `LƯU (${previewData.filter(i => i.selected).length} cấu trúc)`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  , document.body);
}
