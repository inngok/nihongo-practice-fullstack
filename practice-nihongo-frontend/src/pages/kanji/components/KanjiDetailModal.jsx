import React from 'react';
import { Modal } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';

export default function KanjiDetailModal({
  selectedKanji,
  isDetailModalOpen,
  setIsDetailModalOpen,
  book,
  handleAddFlashcard,
  addedKanjiIds
}) {
  if (!selectedKanji) return null;

  return (
    <Modal
      open={isDetailModalOpen}
      onCancel={() => setIsDetailModalOpen(false)}
      footer={null}
      closeIcon={null}
      width={480}
      centered
      className="premium-kanji-modal"
      bodyStyle={{ padding: 0 }}
    >
      <div className="p-10 space-y-10 bg-white dark:bg-slate-950 rounded-[2.5rem]">
        {/* Header */}
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            {book ? book.title : ''} {selectedKanji.page ? `• ${selectedKanji.page}` : ''}
          </span>
          <button
            onClick={() => setIsDetailModalOpen(false)}
            className="text-[10px] font-bold text-slate-400 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors"
          >
            Đóng
          </button>
        </div>

        {/* Core Info */}
        <div className="text-center space-y-4">
          <div className="text-8xl font-kanji font-bold text-slate-900 dark:text-white select-none leading-none">
            {selectedKanji.character}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              {selectedKanji.hanviet || 'CHƯA CÓ'}
            </h3>
            <p className="text-sm text-slate-500 font-medium italic mt-2">
              {selectedKanji.meaning || 'Nghĩa chưa được cập nhật'}
            </p>
          </div>
        </div>

        {/* Readings */}
        <div className="flex justify-center gap-16 border-y border-slate-100 dark:border-slate-800 py-6">
          <div className="text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">ON</span>
            <p className="text-lg font-kanji font-bold text-slate-900 dark:text-white">{selectedKanji.onyomi || '—'}</p>
          </div>
          <div className="text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">KUN</span>
            <p className="text-lg font-kanji font-bold text-slate-900 dark:text-white">{selectedKanji.kunyomi || '—'}</p>
          </div>
        </div>

        {/* Examples */}
        <div className="text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Ví dụ</span>
          {selectedKanji.examples ? (
            <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
              {selectedKanji.examples.split(/[;\n]+/).map(line => line.trim()).filter(Boolean).map((line, idx) => (
                <p key={idx} className="text-sm text-slate-600 dark:text-slate-400 font-medium">{line}</p>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-xs italic">Chưa có ví dụ mẫu.</p>
          )}
        </div>

        {/* Action */}
        <div className="pt-2">
          <button
            onClick={() => handleAddFlashcard(selectedKanji)}
            className={`w-full py-4 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              addedKanjiIds.has(selectedKanji.id)
                ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-default'
                : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'
            }`}
          >
            {addedKanjiIds.has(selectedKanji.id) ? (
              <>
                <HeartFilled className="text-slate-400" />
                Đã lưu sổ tay
              </>
            ) : (
              <>
                <HeartOutlined />
                Lưu sổ tay
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
