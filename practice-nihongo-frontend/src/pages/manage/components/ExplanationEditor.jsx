import React, { useState } from 'react';
import { message } from 'antd';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config';
import ExplanationText from '../../../components/ExplanationText';

export default function ExplanationEditor({ value, onChange }) {
  const { fetchWithAuth } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const handleAiFormat = async () => {
    if (!value?.trim()) return message.warning('Vui lòng nhập nội dung cần định dạng');
    setIsProcessing(true);
    const hide = message.loading('AI đang định dạng cú pháp...', 0);
    
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/format-explanation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value })
      });
      
      if (!res.ok) throw new Error('Lỗi gọi AI');
      let data = await res.text();
      
      let formatted = data || '';
      // Remove any markdown block syntax if AI accidentally returned it
      formatted = formatted.replace(/```(json|markdown)?[\s\S]*?\n/gi, '').replace(/```/g, '');
      
      onChange({ target: { name: 'explanation', value: formatted.trim() } });
      message.success('Đã định dạng xong!');
      setShowPreview(true);
    } catch (err) {
      console.error(err);
      message.error('Lỗi: ' + err.message);
    } finally {
      setIsProcessing(false);
      hide();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">Giải thích</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-black rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-tighter"
          >
            {showPreview ? 'Sửa văn bản thô (Raw)' : 'Xem Preview (Mượt)'}
          </button>
          <button
            type="button"
            onClick={handleAiFormat}
            disabled={isProcessing}
            className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[9px] font-black rounded-full hover:bg-blue-600 hover:text-white transition-all uppercase tracking-tighter flex items-center justify-center disabled:opacity-50"
          >
            AI Định Dạng Lại
          </button>
        </div>
      </div>
      
      {!showPreview && (
        <div className="relative animate-in fade-in zoom-in duration-300">
          <textarea
            name="explanation"
            value={value}
            onChange={onChange}
            rows="6"
            placeholder="Dán văn bản thường vào đây rồi bấm 'AI Định Dạng Lại'..."
            className="w-full px-3 py-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-400 font-mono"
          />
        </div>
      )}

      {showPreview && (
        <div className="mt-2 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[120px] animate-in fade-in zoom-in duration-300">
          {!value ? (
            <div className="text-slate-400 text-xs italic text-center mt-8">Chưa có nội dung giải thích</div>
          ) : (
            <ExplanationText text={value} />
          )}
        </div>
      )}
    </div>
  );
}
