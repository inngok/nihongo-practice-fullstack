import React from 'react';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

export default function NewsTranslatePopup({ 
  popupPosition, 
  selectedText, 
  quickTranslation, 
  isQuickTranslating, 
  onQuickTranslate, 
  onClose 
}) {
  if (!popupPosition || !selectedText) return null;

  return (
    <div 
      className="absolute z-50 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl p-5 border border-slate-100 dark:border-slate-800 w-80 max-w-[90vw]"
      style={{ top: popupPosition.top, left: popupPosition.left, transform: 'translateX(-50%)' }}
      onPointerDown={(e) => e.stopPropagation()} 
    >
      {quickTranslation ? (
         <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
               <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Bản dịch AI</p>
               <button onClick={onClose} className="text-[10px] text-slate-400 hover:text-black dark:hover:text-white font-black uppercase tracking-widest transition-colors">Đóng</button>
            </div>
            <div className="text-slate-900 dark:text-white font-medium text-sm leading-relaxed">{quickTranslation}</div>
         </div>
      ) : (
         <div className="flex flex-col gap-4">
           <div className="flex justify-between items-start gap-2">
             <div className="text-sm font-medium text-slate-500 dark:text-slate-400 italic line-clamp-2 leading-relaxed">"{selectedText}"</div>
             <button 
               onClick={onClose} 
               className="text-slate-400 hover:text-black dark:hover:text-white transition-colors"
               title="Đóng"
             >
               <CloseOutlined />
             </button>
           </div>
           <Button 
             type="primary" 
             size="large" 
             shape="round" 
             className="bg-black dark:bg-white text-white dark:text-black border-none font-bold shadow-xl hover:-translate-y-0.5 transition-transform w-full" 
             loading={isQuickTranslating} 
             onClick={onQuickTranslate}
           >
              {isQuickTranslating ? 'Đang dịch...' : 'Dịch nhanh'}
           </Button>
         </div>
      )}
    </div>
  );
}
