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
  
  // Changed to a Map to store AI generated data for multiple grammars at once
  const [newGrammarDataMap, setNewGrammarDataMap] = useState({});
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

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

  // Clear AI data map when switching lesson or book
  useEffect(() => { 
    setNewGrammarDataMap({}); 
  }, [selectedBookId, selectedLesson]);

  const handleGenerateAI = async () => {
    if (!selectedGrammar) return;
    try {
      setLoadingAi(true);
      messageApi.loading({ content: 'AI đang phân tích và sửa lại ngữ pháp...', key: 'ai-gen' });

      const responseData = await aiService.generateGrammar(selectedGrammar.structure, selectedGrammar.exampleSentence);
      let parsed;
      if (typeof responseData === 'object') {
        parsed = responseData;
      } else {
        const cleanedStr = responseData.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanedStr);
      }

      setNewGrammarDataMap(prev => ({ ...prev, [selectedGrammar.id]: parsed }));
      messageApi.success({ content: 'Đã tạo xong dữ liệu mới!', key: 'ai-gen' });
    } catch (error) {
      console.error(error);
      messageApi.error({ content: error.message || 'Lỗi khi gọi AI', key: 'ai-gen' });
    } finally {
      setLoadingAi(false);
    }
  };

  const handleBulkGenerate = async () => {
    const errorGrammars = lessonGrammars.filter(g => hasErrorPattern(g.explanation));
    
    if (errorGrammars.length === 0) {
      messageApi.success({ content: 'Tuyệt vời! Không phát hiện lỗi định dạng nào trong bài này.', key: 'ai-bulk' });
      return;
    }

    setIsBulkGenerating(true);
    setBulkProgress({ current: 0, total: errorGrammars.length });
    messageApi.loading({ content: `Đang chạy AI sửa lỗi (${errorGrammars.length} cấu trúc)...`, key: 'ai-bulk', duration: 0 });

    const newMap = { ...newGrammarDataMap };
    try {
      for (let i = 0; i < errorGrammars.length; i++) {
        const g = errorGrammars[i];
        if (newMap[g.id]) continue; // Skip if already generated

        setBulkProgress({ current: i + 1, total: errorGrammars.length });
        
        try {
          const responseData = await aiService.generateGrammar(g.structure, g.exampleSentence);
          let parsed;
          if (typeof responseData === 'object') {
            parsed = responseData;
          } else {
            const cleanedStr = responseData.replace(/```json/gi, '').replace(/```/g, '').trim();
            parsed = JSON.parse(cleanedStr);
          }
          newMap[g.id] = parsed;
          // Update state gradually so UI updates
          setNewGrammarDataMap({ ...newMap });
        } catch (err) {
          console.error(`Lỗi khi AI review ngữ pháp ${g.structure}:`, err);
          // Continue with the next one
        }

        // Add delay to prevent hitting Gemini's RPM limit (Rate Limit 429)
        // 15 requests/minute = 1 request every 4 seconds. We wait 3.5s between requests.
        if (i < errorGrammars.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3500));
        }
      }
      messageApi.success({ content: 'Hoàn tất AI Review cả bài!', key: 'ai-bulk' });
    } catch (err) {
      console.error(err);
      messageApi.error({ content: 'Lỗi quá trình xử lý hàng loạt', key: 'ai-bulk' });
    } finally {
      setIsBulkGenerating(false);
      messageApi.destroy('ai-bulk');
    }
  };

  const handleSave = async () => {
    const newGrammarData = newGrammarDataMap[selectedGrammarId];
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
      
      // Remove from map after save
      const newMap = { ...newGrammarDataMap };
      delete newMap[selectedGrammar.id];
      setNewGrammarDataMap(newMap);

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(error);
      messageApi.error('Lỗi khi lưu dữ liệu!');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSave = async () => {
    const keys = Object.keys(newGrammarDataMap);
    if (keys.length === 0) return;
    setSaving(true);
    messageApi.loading({ content: 'Đang lưu đè tất cả...', key: 'bulk-save', duration: 0 });
    try {
      await Promise.all(keys.map(id => {
        const newData = newGrammarDataMap[id];
        const oldG = lessonGrammars.find(g => g.id.toString() === id.toString());
        if (!oldG || !newData) return Promise.resolve();
        const updatePayload = {
          meaning: newData.meaning || oldG.meaning,
          explanation: newData.explanation || oldG.explanation,
          exampleSentence: newData.exampleSentence || oldG.exampleSentence,
          exampleMeaning: newData.exampleMeaning || oldG.exampleMeaning,
          quizSentence: newData.quizSentence || oldG.quizSentence,
        };
        return grammarService.update(id, updatePayload);
      }));
      messageApi.success({ content: 'Đã lưu đè toàn bộ ngữ pháp!', key: 'bulk-save' });
      setNewGrammarDataMap({});
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(error);
      messageApi.error({ content: 'Lỗi khi lưu đè hàng loạt!', key: 'bulk-save' });
    } finally {
      setSaving(false);
      messageApi.destroy('bulk-save');
    }
  };

  return (
    <Modal
      title={<span className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 dark:text-white">AI REVIEW LỖI NGỮ PHÁP CŨ</span>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
      className="custom-modal"
      zIndex={9999}
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
          newGrammarDataMap={newGrammarDataMap}
          onBulkGenerate={handleBulkGenerate}
          isBulkGenerating={isBulkGenerating}
          bulkProgress={bulkProgress}
        />
        <div className="flex-1 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden">
          <AiReviewSplitView
            selectedGrammar={selectedGrammar}
            loadingAi={loadingAi}
            saving={saving}
            newGrammarData={newGrammarDataMap[selectedGrammarId]}
            newGrammarDataMap={newGrammarDataMap}
            hasErrorPattern={hasErrorPattern}
            onGenerateAI={handleGenerateAI}
            onSave={handleSave}
            onBulkSave={handleBulkSave}
          />
        </div>
      </div>
    </Modal>
  );
}
