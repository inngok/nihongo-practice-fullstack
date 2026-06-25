import React from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Pagination } from 'antd';

export default function KanjiManagerTable({
  orderedKanjis,
  currentPage,
  pageSize,
  setCurrentPage,
  setPageSize,
  selectedIds,
  handleSelectAll,
  handleSelectItem,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  draggedId,
  dragOverId,
  openEditModal,
  handleDelete
}) {
  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <th className="px-4 py-4 w-8 text-center">
              <span className="text-[9px] font-black text-slate-200 dark:text-slate-800 uppercase tracking-widest">#</span>
            </th>
            <th className="px-6 py-4 w-10">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedIds.length === orderedKanjis.length && orderedKanjis.length > 0}
                className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 text-black dark:text-white focus:ring-0 cursor-pointer"
              />
            </th>
            <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Hán tự</th>
            <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Hán Việt</th>
            <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Âm ON/KUN</th>
            <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Ý nghĩa</th>
            <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">Bài</th>
            <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Giáo trình</th>
            <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
          {orderedKanjis.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item) => (
            <tr 
              key={item.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
              className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors group ${
                  draggedId === item.id ? 'opacity-40' : ''
                } ${
                  dragOverId === item.id ? 'border-t-2 border-black dark:border-white bg-slate-50/80 dark:bg-slate-850/50' : ''
                } ${selectedIds.includes(item.id) ? 'bg-slate-50/80 dark:bg-slate-850/50' : ''}`}>
              {/* Drag Handle */}
              <td className="px-4 py-5 text-center w-8">
                <span
                  className="cursor-grab active:cursor-grabbing text-slate-200 dark:text-slate-700 hover:text-slate-400 dark:hover:text-slate-500 transition-colors select-none text-base leading-none"
                  title="Kéo để sắp xếp thứ tự"
                >
                  ⠿
                </span>
              </td>
              <td className="px-6 py-5">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 text-black dark:text-white focus:ring-0 cursor-pointer"
                />
              </td>
              <td className="px-6 py-5 font-bold text-slate-900 dark:text-white text-2xl leading-none">
                <div className="flex items-center gap-3">
                  {item.character}
                  {item.isDuplicate && (
                    <span className="text-[9px] font-black uppercase bg-rose-100 text-rose-600 px-2 py-1 rounded-md border border-rose-200 tracking-widest" title="Chữ Hán này bị lặp lại">Trùng</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-5">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[11px] bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                  {item.hanviet}
                </span>
              </td>
              <td className="px-6 py-5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">ON: <span className="text-slate-900 dark:text-slate-200">{item.onyomi}</span></span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">KUN: <span className="text-slate-600 dark:text-slate-300">{item.kunyomi}</span></span>
                </div>
              </td>
              <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-[13px] italic">{item.meaning}</td>
              <td className="px-6 py-5 text-center">
                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                  {item.week ? `Bài ${item.week}` : '-'}
                </div>
              </td>
              <td className="px-6 py-5">
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
                  {item.book?.title || 'Chưa phân loại'}{item.page ? ` • Trang ${item.page}` : ''}
                </span>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex justify-end gap-1 transition-opacity">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                    title="Sửa"
                  >
                    <EditOutlined className="text-base" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Xóa"
                  >
                    <DeleteOutlined className="text-base" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end p-6 border-t border-slate-100 dark:border-slate-800">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={orderedKanjis.length}
          onChange={(page, size) => { setCurrentPage(page); setPageSize(size); }}
          showSizeChanger
          showTotal={(total) => `Tổng số ${total} Hán tự`}
        />
      </div>
    </div>
  );
}
