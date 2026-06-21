import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import VocabSingleForm from './VocabSingleForm';
import VocabBulkForm from './VocabBulkForm';

export default function VocabAddModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingVocab, 
  books, 
  initialBookId,
  vocabs 
}) {
  const [modalTab, setModalTab] = useState('single');

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
          <VocabSingleForm 
             onSuccess={onSuccess} 
             editingVocab={editingVocab} 
             books={books} 
             initialBookId={initialBookId} 
             vocabs={vocabs} 
          />
        ) : (
          <VocabBulkForm 
             onSuccess={onSuccess} 
             books={books} 
             initialBookId={initialBookId} 
             vocabs={vocabs} 
          />
        )}
      </div>
    </div>,
    document.body
  );
}
