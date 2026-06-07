import React, { useState } from 'react';
import { Card, Button, Input } from 'antd';

export default function NewsDictationArea({ 
  articleContent,
  dictationText,
  setDictationText,
  showOriginalInDictation,
  setShowOriginalInDictation 
}) {

  return (
    <Card className="shadow-xl shadow-slate-200/40 dark:shadow-none dark:bg-slate-800/80 dark:border-slate-700/80 rounded-[2rem] border-0 mb-8 p-4">
      <div className="mb-6">
        <h3 className="text-lg font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-4 flex items-center justify-between">
          <span>Khu vực chép chính tả</span>
          <div className="flex gap-2">
            <Button 
              onClick={() => setDictationText('')}
              type="text"
              danger
              shape="round"
              disabled={!dictationText}
            >
              Xóa trắng
            </Button>
            <Button 
              onClick={() => setShowOriginalInDictation(!showOriginalInDictation)}
              type="dashed"
              shape="round"
            >
              {showOriginalInDictation ? 'Ẩn bản gốc' : 'Xem bản gốc để đối chiếu'}
            </Button>
          </div>
        </h3>
        <Input.TextArea
          rows={8}
          value={dictationText}
          onChange={(e) => setDictationText(e.target.value)}
          placeholder="Nghe audio và gõ lại tiếng Nhật vào đây..."
          className="text-lg font-kanji p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
        />
      </div>
      
      {showOriginalInDictation && (
        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Bản gốc</h4>
          <div 
            className="leading-loose nhk-article-content font-kanji text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-200"
            dangerouslySetInnerHTML={{ __html: articleContent }} 
          />
        </div>
      )}
    </Card>
  );
}
