import React, { useState } from 'react';
import { Languages, ArrowRight, CornerDownRight, Copy, Check } from 'lucide-react';

export default function Translator() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-44 md:pt-32 pb-20 px-4 md:px-6 font-sans relative overflow-hidden">
      
      {/* Background Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[35vw] font-black text-slate-100 opacity-[0.03] pointer-events-none select-none leading-none z-0 whitespace-nowrap">
        翻訳
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="flex flex-col gap-12">
          {/* Header */}
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.4em] font-bold text-slate-400 uppercase">Công cụ hỗ trợ</span>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase">Dịch thuật</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input Side */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-2">
                 <span className="text-[9px] font-black tracking-widest uppercase text-slate-400 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 italic">Nhập văn bản</span>
                 <button 
                  onClick={() => setText('')}
                  className="text-[9px] font-bold text-slate-300 hover:text-red-500 transition-colors uppercase tracking-widest"
                 >
                   Xóa hết
                 </button>
               </div>
               <div className="relative group">
                 <textarea
                   value={text}
                   onChange={(e) => setText(e.target.value)}
                   placeholder="Nhập nội dung cần dịch hoặc ghi chú..."
                   className="w-full h-64 md:h-80 p-8 text-lg font-medium bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] focus:border-slate-300 focus:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] outline-none transition-all resize-none placeholder:text-slate-200"
                 />
                 <div className="absolute bottom-6 right-8 flex items-center gap-3">
                    <button 
                      onClick={handleCopy}
                      className="p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                 </div>
               </div>
            </div>

            {/* External Links / Info Side */}
            <div className="space-y-8 flex flex-col justify-center">
              <div className="p-8 md:p-10 bg-slate-50 border border-slate-100 rounded-[2.5rem] space-y-8">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 text-slate-900">
                    <Languages className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic">Gợi ý công cụ</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Sử dụng các công cụ dịch thuật hàng đầu để có kết quả chính xác nhất cho quá trình luyện tập N3.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <a 
                    href={`https://translate.google.com/?sl=ja&tl=vi&text=${encodeURIComponent(text)}&op=translate`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-black transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-[10px]">G</div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Google Translate</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </a>

                  <a 
                    href={`https://mazii.net/vi-VN/search?query=${encodeURIComponent(text)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-black transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">M</div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Từ điển Mazii</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </a>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                  <CornerDownRight className="w-4 h-4 text-slate-300" />
                  <p className="text-[10px] font-bold text-slate-400 italic">Mẹo: Nhập văn bản bên trái để tự động tạo link dịch.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
