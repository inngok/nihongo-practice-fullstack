import React from 'react';
import { Modal, Select } from 'antd';

export default function VocabBulkUpdateModal({
  isOpen,
  onClose,
  onUpdate,
  bulkUpdateData,
  setBulkUpdateData,
  books
}) {
  return (
    <Modal
      title={<span className="text-[10px] font-bold uppercase text-slate-400">Cập nhật giáo trình</span>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      styles={{ content: { padding: '30px', borderRadius: '20px' } }}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase text-slate-400">Sách hệ thống</label>
          <Select 
            value={bulkUpdateData.bookId} 
            onChange={v => setBulkUpdateData(p => ({ ...p, bookId: v }))} 
            className="w-full custom-select" 
            variant="borderless" 
            options={books.map(b => ({ value: b.id, label: b.title.toUpperCase() }))} 
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase text-slate-400">Bài</label>
            <input 
              type="number" 
              min="1" 
              value={bulkUpdateData.week} 
              onChange={e => { 
                let v = e.target.value; 
                if(v !== '' && parseInt(v) < 1) v = '1'; 
                setBulkUpdateData(p => ({ ...p, week: v })) 
              }} 
              className="w-full bg-transparent border-b border-slate-100 outline-none py-1.5 font-bold" 
            />
          </div>
        </div>
        <button
          onClick={onUpdate}
          className="w-full py-4 bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg"
        >CẬP NHẬT NGAY</button>
      </div>
    </Modal>
  );
}
