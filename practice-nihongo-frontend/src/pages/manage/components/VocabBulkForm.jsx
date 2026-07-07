import React, { useState } from 'react';
import { Select, message, Modal } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import vocabService from '../../../api/vocabService';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config';

export default function VocabBulkForm({ onSuccess, books, initialBookId, vocabs }) {
  const { fetchWithAuth } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const [bulkInput, setBulkInput] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(initialBookId || '');
  const [week, setWeek] = useState('');
  
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    const weekInt = week ? parseInt(week) : null;

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

    const saveProcess = async (actionType) => {
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

        if (actionType === 'OVERWRITE') {
          for (const dup of duplicates) {
            await vocabService.update(dup.existingId, {
              ...dup,
              week: weekInt,
              book: { id: bookIdInt }
            });
          }
        } else if (actionType === 'ADD_NEW') {
          for (const dup of duplicates) {
            delete dup.existingId;
            await vocabService.create({
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
        width: 500,
        title: 'Phát hiện từ vựng trùng lặp',
        content: `Có ${duplicates.length} từ đã tồn tại. Bạn muốn làm gì với những từ này?`,
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

  return (
    <>
      {contextHolder}
      <div className="p-8 space-y-8 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs font-medium">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-black dark:text-white shrink-0"><ThunderboltOutlined /></div>
          <p>Dán danh sách từ vựng thô vào ô bên trái. AI sẽ tự động dọn dẹp, phân tích và chuẩn hóa dữ liệu thành bảng hoàn chỉnh.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
          <div className="relative group h-full">
            <textarea
              value={bulkInput}
              onChange={e => setBulkInput(e.target.value)}
              placeholder="Dán dữ liệu thô vào đây (ví dụ: các từ vựng copy từ PDF, Website...)"
              className="w-full h-full p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 outline-none text-sm resize-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all custom-scrollbar placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium text-slate-700 dark:text-slate-200 leading-relaxed"
            />
          </div>

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

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-2">
          <button
            onClick={handleBulkAiProcess}
            disabled={isAiProcessing}
            className="w-full sm:w-auto min-w-[180px] px-8 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
                value={week}
                onChange={(e) => {
                  let v = e.target.value;
                  if (v !== '' && parseInt(v) < 1) v = '1';
                  setWeek(v);
                }}
                placeholder="Bài..."
                className="w-full bg-transparent outline-none text-xs font-semibold text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              />
            </div>
            <button
              disabled={isSaving}
              onClick={handleSaveBulk}
              className="w-full sm:w-auto min-w-[160px] px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'ĐANG LƯU...' : `LƯU ${previewData.filter(i => i.selected).length} TỪ`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
