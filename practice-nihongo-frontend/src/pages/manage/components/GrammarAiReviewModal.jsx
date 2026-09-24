import React, { useState, useEffect, useMemo } from 'react';
import { Modal, message } from 'antd';
import aiService from '../../../api/aiService';
import grammarService from '../../../api/grammarService';
import AiReviewSidebar from './AiReviewSidebar';
import AiReviewSplitView from './AiReviewSplitView';

const ERROR_PATTERNS = ['(+な)', '(+だ)', '~~な~~', '(な)', '(だ)'];

function hasErrorPattern(text) {
  if (!text) return false;
  return ERROR_PATTERNS.some(p => text.includes(p));
}

export default function GrammarAiReviewModal({
  isOpen,
  onClose,
  grammars,
  books,
  onUpdate
}) {
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedGrammarId, setSelectedGrammarId] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newGrammarData, setNewGrammarData] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const uniqueLessons = useMemo(() => {
    let data = grammars || [];
    if (selectedBookId) {
      data = data.filter(g => (g.bookId || g.book?.id)?.toString() === selectedBookId.toString());
    }
    const lessons = new Set();
    data.forEach(g => { if (g.week) lessons.add(g.week); });
    return Array.from(lessons).sort((a, b) => a - b);
  }, [grammars, selectedBookId]);

  const lessonGrammars = useMemo(() => {
    let data = grammars || [];
    if (selectedBookId) {
      data = data.filter(g => (g.bookId || g.book?.id)?.toString() === selectedBookId.toString());
    }
    if (selectedLesson) {
      data = data.filter(g => g.week?.toString() === selectedLesson.toString());
    }
    return data;
  }, [grammars, selectedBookId, selectedLesson]);

  const selectedGrammar = useMemo(
    () => lessonGrammars.find(g => g.id.toString() === selectedGrammarId.toString()),
    [lessonGrammars, selectedGrammarId]
  );

  // Reset AI result when switching grammar
  useEffect(() => { setNewGrammarData(null); }, [selectedGrammarId]);

  const handleGenerateAI = async () => {
    if (!selectedGrammar) return;
    try {
      setLoadingAi(true);
      messageApi.loading({ content: 'AI đang phân tích và sửa lại ngữ pháp...', key: 'ai-gen' });

      const jsonString = await aiService.generateGrammar(selectedGrammar.structure, selectedGrammar.exampleSentence);
      const cleanedStr = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedStr);

      setNewGrammarData(parsed);
      messageApi.success({ content: 'Đã tạo xong dữ liệu mới!', key: 'ai-gen' });
    } catch (error) {
      console.error(error);
      messageApi.error({ content: error.message || 'Lỗi khi gọi AI', key: 'ai-gen' });
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSave = async () => {
    if (!selectedGrammar || !newGrammarData) return;
    try {
      setSaving(true);
      const updatePayload = {
        meaning: newGrammarData.meaning || selectedGrammar.meaning,
        explanation: newGrammarData.explanation || selectedGrammar.explanation,
        exampleSentence: newGrammarData.exampleSentence || selectedGrammar.exampleSentence,
        exampleMeaning: newGrammarData.exampleMeaning || selectedGrammar.exampleMeaning,
        quizSentence: newGrammarData.quizSentence || selectedGrammar.quizSentence,
      };
      await grammarService.update(selectedGrammar.id, updatePayload);
      messageApi.success('Đã lưu đè ngữ pháp thành công!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(error);
      messageApi.error('Lỗi khi lưu dữ liệu!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={<span className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 dark:text-white">✨ AI REVIEW LỖI NGỮ PHÁP CŨ</span>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
      className="custom-modal"
    >
      {contextHolder}
      <div className="flex h-[70vh] border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden mt-4">
        <AiReviewSidebar
          books={books}
          selectedBookId={selectedBookId}
          setSelectedBookId={setSelectedBookId}
          uniqueLessons={uniqueLessons}
          selectedLesson={selectedLesson}
          setSelectedLesson={setSelectedLesson}
          lessonGrammars={lessonGrammars}
          selectedGrammarId={selectedGrammarId}
          setSelectedGrammarId={setSelectedGrammarId}
          hasErrorPattern={hasErrorPattern}
        />
        <div className="flex-1 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden">
          <AiReviewSplitView
            selectedGrammar={selectedGrammar}
            loadingAi={loadingAi}
            saving={saving}
            newGrammarData={newGrammarData}
            hasErrorPattern={hasErrorPattern}
            onGenerateAI={handleGenerateAI}
            onSave={handleSave}
          />
        </div>
      </div>
    </Modal>
  );
}
