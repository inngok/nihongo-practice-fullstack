import React from 'react';
import { Modal } from 'antd';

export default function GrammarBulkUpdateModal({
  isOpen,
  onClose,
  onUpdate,
  bulkUpdateData,
  setBulkUpdateData,
  books,
  selectedCount
}) {
  const levels = ['N1', 'N2', 'N3', 'N4', 'N5'];

  return (
    <Modal
      title={<span className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 dark:text-white">CẬP NHẬT HÀNG LOẠT ({selectedCount})</span>}
      open={isOpen}
      onCancel={onClose}
      onOk={onUpdate}
      okText="CẬP NHẬT"
      cancelText="HỦY"
      centered
      className="custom-modal"
      okButtonProps={{ className: 'bg-black dark:bg-white text-white dark:text-black font-semibold text-[10px] rounded-lg' }}
      cancelButtonProps={{ className: 'font-semibold text-[10px] rounded-lg' }}
    >
      <div className="py-6 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Thay đổi giáo trình</label>
          <select
            value={bulkUpdateData.bookId}
            onChange={(e) => setBulkUpdateData(prev => ({ ...prev, bookId: e.target.value }))}
            className="w-full px-1 py-2 bg-transparent border-b border-slate-100 dark:border-slate-800 outline-none focus:border-black dark:focus:border-white transition-all text-sm font-medium"
          >
            <option value="">-- Giữ nguyên --</option>
            {books.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Tuần</label>
              <input
                type="number"
                min="1"
                value={bulkUpdateData.week}
                onChange={(e) => { let v = e.target.value; if(v !== '' && parseInt(v) < 1) v = '1'; setBulkUpdateData(prev => ({ ...prev, week: v })) }}
                placeholder="VD: 1, 2..."
                className="w-full px-1 py-2 bg-transparent border-b border-slate-100 dark:border-slate-800 outline-none focus:border-black dark:focus:border-white transition-all text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Ngày</label>
              <input
                type="number"
                min="1"
                value={bulkUpdateData.day}
                onChange={(e) => { let v = e.target.value; if(v !== '' && parseInt(v) < 1) v = '1'; setBulkUpdateData(prev => ({ ...prev, day: v })) }}
                placeholder="VD: 1, 2..."
                className="w-full px-1 py-2 bg-transparent border-b border-slate-100 dark:border-slate-800 outline-none focus:border-black dark:focus:border-white transition-all text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cấp độ (Level)</label>
              <select
                value={bulkUpdateData.level || ''}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, level: e.target.value }))}
                className="w-full px-1 py-2 bg-transparent border-b border-slate-100 dark:border-slate-800 outline-none focus:border-black dark:focus:border-white transition-all text-sm font-medium"
              >
                <option value="">-- Giữ nguyên --</option>
                {levels.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <p className="text-[9px] text-slate-300 italic">* Bỏ trống nếu không muốn thay đổi trường đó</p>
      </div>
    </Modal>
  );
}
