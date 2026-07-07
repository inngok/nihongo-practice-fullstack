import React, { memo } from 'react';
import { Empty, Pagination } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const VocabTable = memo(function VocabTable({
  loading,
  filteredVocabs,
  currentPage,
  pageSize,
  setCurrentPage,
  setPageSize,
  selectedIds,
  toggleSelectAll,
  toggleSelectOne,
  openEditModal,
  handleDelete,
  draggedId,
  dragOverId,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}) {
  const isDraggable = !!onDragStart;

  return (
    <div className="relative">
      {loading ? (
        <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-slate-200 border-t-black rounded-full animate-spin" /></div>
      ) : filteredVocabs.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl"><Empty description="Chưa có dữ liệu giáo trình" /></div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                {isDraggable && <th className="pl-4 py-4 w-8" title="Kéo để sắp xếp"><span className="text-slate-300">⠿</span></th>}
                <th className="pl-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredVocabs.length && filteredVocabs.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Hán tự</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Cách đọc</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Hán Việt</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ý nghĩa</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Bài</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Sách</th>
                <th className="pr-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredVocabs.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((v) => (
                <tr
                  key={v.id}
                  draggable={isDraggable}
                  onDragStart={isDraggable ? (e) => onDragStart(e, v.id) : undefined}
                  onDragOver={isDraggable ? (e) => onDragOver(e, v.id) : undefined}
                  onDrop={isDraggable ? (e) => onDrop(e, v.id) : undefined}
                  onDragEnd={isDraggable ? onDragEnd : undefined}
                  className={`transition-colors cursor-grab active:cursor-grabbing
                    ${draggedId === v.id ? 'opacity-40' : ''}
                    ${dragOverId === v.id ? 'border-t-2 border-black dark:border-white' : ''}
                    ${selectedIds.includes(v.id) ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50/50'}
                  `}
                >
                  {isDraggable && (
                    <td className="pl-4 py-4 text-slate-300 dark:text-slate-700 select-none text-lg">⠿</td>
                  )}
                  <td className="pl-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(v.id)}
                      onChange={() => toggleSelectOne(v.id)}
                      className="w-4 h-4 cursor-pointer"
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-900 dark:text-white font-kanji text-lg">
                    <div className="flex items-center gap-2">
                      {v.word}
                      {v.isDuplicate && (
                        <span className="text-[8px] font-black uppercase bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-md border border-rose-200" title="Từ này xuất hiện nhiều lần">Trùng</span>
                      )}
                      {v.publish === false && (
                        <span className="text-[8px] font-black uppercase bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-300" title="Đã bị ẩn khỏi người học">Ẩn</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-500 italic">{v.reading}</td>
                  <td className="px-4 py-4 text-xs font-bold text-slate-500 uppercase">{v.hanviet || '-'}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">{v.meaning}</td>
                  <td className="px-4 py-4 text-center text-[10px] font-bold text-slate-400">{v.week ? `BÀI ${v.week}` : '-'}</td>
                  <td className="px-4 py-4">
                    <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md uppercase">
                      {v.book?.title || '-'}
                    </span>
                  </td>
                  <td className="pr-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEditModal(v)} className="p-2 text-slate-400 hover:text-black dark:hover:text-white transition-colors" title="Sửa"><EditOutlined className="text-base" /></button>
                      <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Xóa"><DeleteOutlined className="text-base" /></button>
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
              total={filteredVocabs.length}
              onChange={(page, size) => { setCurrentPage(page); setPageSize(size); }}
              showSizeChanger
              showTotal={(total) => `Tổng số ${total} từ vựng`}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default VocabTable;
