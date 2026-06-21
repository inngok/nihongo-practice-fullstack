import React from 'react';
import { Modal, Select } from 'antd';

export default function KanjiBulkUpdateModal({
  isOpen,
  onClose,
  onUpdate,
  selectedCount,
  bulkUpdateData,
  setBulkUpdateData,
  books
}) {
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
          <Select
            value={bulkUpdateData.bookId}
            onChange={(value) => setBulkUpdateData(prev => ({ ...prev, bookId: value }))}
            placeholder="Chọn giáo trình mới"
            className="w-full custom-select-bulk"
            variant="borderless"
            classNames={{
              popup: 'custom-select-popup'
            }}
            style={{ borderBottom: '1px solid #f1f5f9' }}
            options={[
              { value: '', label: '-- Giữ nguyên --' },
              ...books.map(b => ({ value: b.id, label: b.title }))
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Chuyển sang bài số</label>
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
            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cập nhật trang số</label>
            <input
              type="number"
              min="1"
              value={bulkUpdateData.page}
              onChange={(e) => { let v = e.target.value; if(v !== '' && parseInt(v) < 1) v = '1'; setBulkUpdateData(prev => ({ ...prev, page: v })) }}
              placeholder="VD: 120, 121..."
              className="w-full px-1 py-2 bg-transparent border-b border-slate-100 dark:border-slate-800 outline-none focus:border-black dark:focus:border-white transition-all text-sm font-medium"
            />
          </div>
        </div>
        <p className="text-[9px] text-slate-300 italic">* Bỏ trống nếu không muốn thay đổi trường đó</p>
      </div>
    </Modal>
  );
}
