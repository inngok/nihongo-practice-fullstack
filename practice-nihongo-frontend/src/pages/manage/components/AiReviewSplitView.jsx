import React from 'react';
import { LoadingOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import ExplanationText from '../../../components/ExplanationText';

/**
 * AiReviewSplitView
 * Right panel: header with action buttons + two side-by-side panels (old vs new data).
 */
export default function AiReviewSplitView({
  selectedGrammar,
  loadingAi,
  saving,
  newGrammarData,
  hasErrorPattern,
  onGenerateAI,
  onSave,
}) {
  if (!selectedGrammar) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        Hãy chọn một ngữ pháp bên trái để review
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Đang Review:</span>
          <span className="text-lg font-black text-slate-800 dark:text-white">{selectedGrammar.structure}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onGenerateAI}
            disabled={loadingAi}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm disabled:opacity-50"
          >
            {loadingAi ? <LoadingOutlined /> : <SyncOutlined />}
            Chạy AI Fix
          </button>
          <button
            onClick={onSave}
            disabled={!newGrammarData || saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all bg-black text-white dark:bg-white dark:text-black hover:opacity-80 shadow-xl disabled:opacity-50"
          >
            {saving ? <LoadingOutlined /> : <CheckCircleOutlined />}
            Lưu đè
          </button>
        </div>
      </div>

      {/* Split panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* OLD DATA */}
        <div className="w-1/2 p-6 overflow-y-auto border-r border-slate-100 dark:border-slate-800">
          <div className="mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Dữ liệu Cũ (Database)</span>
          </div>
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ý nghĩa (Meaning)</div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedGrammar.meaning}</div>
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                Giải thích (Explanation)
                {hasErrorPattern(selectedGrammar.explanation) && (
                  <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[9px]">LỖI ĐỊNH DẠNG</span>
                )}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                <ExplanationText text={selectedGrammar.explanation} className="text-sm text-slate-700 dark:text-slate-300" />
              </div>
            </div>
          </div>
        </div>

        {/* NEW DATA */}
        <div className="w-1/2 p-6 overflow-y-auto bg-emerald-50/20 dark:bg-emerald-900/5">
          <div className="mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Dữ liệu Mới (AI Sinh ra)</span>
          </div>

          {!newGrammarData && !loadingAi && (
            <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bấm "Chạy AI Fix" để xem kết quả</span>
            </div>
          )}

          {loadingAi && (
            <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
              <LoadingOutlined className="text-2xl text-slate-400 mb-3" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">AI đang phân tích...</span>
            </div>
          )}

          {newGrammarData && !loadingAi && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ý nghĩa (Meaning)</div>
                <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{newGrammarData.meaning}</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                  Giải thích (Explanation)
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[9px]">SẼ GHI ĐÈ</span>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm shadow-emerald-100 dark:shadow-none">
                  <ExplanationText text={newGrammarData.explanation} className="text-sm text-slate-700 dark:text-slate-300" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
