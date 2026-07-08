import React from 'react';
import { MessageOutlined, BulbOutlined } from '@ant-design/icons';

export default function AiFeedbackPanel({ showFeedbackPane, setShowFeedbackPane, latestFeedback }) {
  if (!showFeedbackPane) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:w-80 bg-white border border-slate-100 rounded-none lg:rounded-[2.5rem] flex flex-col overflow-hidden h-full shadow-sm animate-in slide-in-from-bottom duration-300">
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-2">
          <MessageOutlined className="text-sm" />
          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
            Phân tích của Trợ lý
          </h3>
        </div>
        <button 
          onClick={() => setShowFeedbackPane(false)}
          className="lg:hidden w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 text-xs font-bold"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {latestFeedback ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <BulbOutlined /> Gợi ý Ngữ pháp & Văn phong:
              </h4>
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed whitespace-pre-line">
                {latestFeedback}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">💡 Mẹo</p>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                Hãy chọn các phím gợi ý bên dưới khung chat để học thêm nhiều cách trả lời tự nhiên của người bản xứ nhé!
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-3 text-lg shadow-inner">
              💬
            </div>
            <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Hệ thống phân tích</h4>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed mt-1.5">
              Khi cuộc hội thoại diễn ra, AI sẽ phát hiện lỗi sai ngữ pháp, trợ từ và sửa lại cho đúng văn phong tại đây!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
