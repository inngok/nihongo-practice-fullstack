import React from 'react';
import { EditOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Pagination } from 'antd';

const levelStyles = {
  N1: 'text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 font-black',
  N2: 'text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 font-bold',
  N3: 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 font-semibold',
  N4: 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800',
  N5: 'text-slate-400 dark:text-slate-500 bg-transparent border border-slate-100 dark:border-slate-800',
};

export default function GrammarManagerTable({
  orderedGrammars,
  filteredGrammars,
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
  handleDelete,
  handleTogglePublish
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
                checked={selectedIds.length === orderedGrammars.length && orderedGrammars.length > 0}
                className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 text-black dark:text-white focus:ring-0 cursor-pointer"
              />
            </th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Cấu trúc</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ý nghĩa</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Sách</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Level</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Bài học</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
          {orderedGrammars.length > 0 ? (
            orderedGrammars.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item) => (
              <tr
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
                className={`transition-colors group ${
                  draggedId === item.id ? 'opacity-40' : ''
                } ${
                  dragOverId === item.id ? 'border-t-2 border-black dark:border-white bg-slate-50/80 dark:bg-slate-850/50' : ''
                } ${
                  selectedIds.includes(item.id) ? 'bg-slate-50/80 dark:bg-slate-850/50' : 'hover:bg-slate-50/50 dark:hover:bg-slate-850/30'
                }`}
              >
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
                <td className="px-6 py-5 font-bold text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight leading-none">{item.structure}</span>
                    {item.isDuplicate && (
                      <span className="text-[9px] font-black uppercase bg-rose-100 text-rose-600 px-2 py-1 rounded-md border border-rose-200 tracking-widest" title="Ngữ pháp này bị lặp lại">Trùng</span>
                    )}
                    {item.publish === false && (
                      <span className="text-[8px] font-black uppercase bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-300" title="Đã bị ẩn khỏi người học">Ẩn</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-[13px] italic">{item.meaning}</td>
                <td className="px-6 py-5">
                  <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                    {item.book?.title || 'Không rõ'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${levelStyles[item.level] || levelStyles.N5}`}>
                    {item.level}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                    Tuần {item.week || '?'} · Ngày {item.day || '?'}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleTogglePublish(item)}
                      className="p-2 text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                      title={item.publish === false ? "Hiện" : "Ẩn"}
                    >
                      {item.publish === false ? <EyeInvisibleOutlined className="text-base" /> : <EyeOutlined className="text-base" />}
                    </button>
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
            ))
          ) : (
            <tr>
              <td colSpan="8" className="px-6 py-12 text-center text-slate-300 dark:text-slate-600 italic text-sm">Chưa có dữ liệu.</td>
            </tr>
          )}
        </tbody>
      </table>

      {orderedGrammars.length > 0 && (
        <div className="flex justify-end p-6 border-t border-slate-100 dark:border-slate-800">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredGrammars.length}
            onChange={(page, size) => { setCurrentPage(page); setPageSize(size); }}
            showSizeChanger
            showTotal={(total) => `Tổng số ${total} cấu trúc`}
          />
        </div>
      )}
    </div>
  );
}
