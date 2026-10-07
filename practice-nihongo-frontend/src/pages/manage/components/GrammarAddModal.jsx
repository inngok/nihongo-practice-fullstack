import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { message } from 'antd';
import { Modal } from 'antd';
import grammarService from '../../../api/grammarService';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config';
import GrammarSingleForm from './GrammarSingleForm';
import GrammarBulkPanel from './GrammarBulkPanel';

export default function GrammarAddModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  books, 
  initialData, 
  defaultBookId,
  existingGrammars = []
}) {
  const [modalTab, setModalTab] = useState('single');
  const [bulkInput, setBulkInput] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { fetchWithAuth } = useAuth();
  
  const splitExamples = (jp, vn) => {
    if (!jp && !vn) return [{ sentence: '', meaning: '' }];
    const sentences = (jp || '').split('\n');
    const meanings = (vn || '').split('\n');
    const len = Math.max(sentences.length, meanings.length);
    const list = [];
    for (let i = 0; i < len; i++) {
      list.push({
        sentence: sentences[i] || '',
        meaning: meanings[i] || ''
      });
    }
    return list;
  };

  const splitQuiz = (quiz) => {
    if (!quiz) return [''];
    return quiz.split('\n');
  };

  const [examplesList, setExamplesList] = useState([{ sentence: '', meaning: '' }]);
  const [quizList, setQuizList] = useState(['']);

  const [formData, setFormData] = useState({
    structure: '',
    meaning: '',
    explanation: '',
    exampleSentence: '',
    exampleMeaning: '',
    quizSentence: '',
    level: 'N3',
    bookId: '',
    week: 1,
    day: 1,
    publish: true
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          structure: initialData.structure,
          meaning: initialData.meaning,
          explanation: initialData.explanation,
          level: initialData.level,
          bookId: initialData.book?.id || '',
          week: initialData.week || 1,
          day: initialData.day || 1,
          publish: initialData.publish !== false
        });
        setExamplesList(splitExamples(initialData.exampleSentence, initialData.exampleMeaning));
        setQuizList(splitQuiz(initialData.quizSentence));
        setModalTab('single');
      } else {
        setFormData({
          structure: '',
          meaning: '',
          explanation: '',
          level: 'N3',
          bookId: defaultBookId || '',
          week: 1,
          day: 1,
          publish: true
        });
        setExamplesList([{ sentence: '', meaning: '' }]);
        setQuizList(['']);
        setModalTab('single');
      }
      setBulkInput('');
      setPreviewData([]);
    }
  }, [isOpen, initialData, defaultBookId]);

  useEffect(() => {
    if (formData.bookId && !initialData) {
      const selectedBook = books.find(b => b.id.toString() === formData.bookId.toString());
      if (selectedBook && selectedBook.levelLabel) {
        setFormData(prev => ({ ...prev, level: selectedBook.levelLabel }));
      }
    }
  }, [formData.bookId, books, initialData]);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if ((name === 'week' || name === 'day' || name === 'page') && value !== '' && parseInt(value) < 1) value = '1';
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAiAutoFill = async () => {
    if (!formData.structure.trim()) return message.warning('Vui lòng nhập cấu trúc ngữ pháp trước!');

    setIsAiProcessing(true);
    const hide = message.loading('AI đang phân tích và chuẩn hóa lại toàn bộ...', 0);

    try {
      // Compile current form data into a single text block
      let textChunk = `Ngữ pháp: ${formData.structure}\n`;
      if (formData.meaning) textChunk += `Ý nghĩa: ${formData.meaning}\n`;
      if (formData.explanation) textChunk += `Giải thích: ${formData.explanation}\n`;
      
      const currentSentences = examplesList.filter(e => e.sentence.trim() !== '');
      if (currentSentences.length > 0) {
        textChunk += `Ví dụ:\n`;
        currentSentences.forEach((ex, idx) => {
          textChunk += `${idx + 1}. ${ex.sentence} (${ex.meaning})\n`;
        });
      }

      // Send the compiled chunk to generate-bulk to re-process and format properly
      const response = await fetchWithAuth(`${API_BASE_URL}/ai/generate-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textChunk,
          type: 'GRAMMAR'
        })
      });

      if (!response.ok) throw new Error('API Error');
      const data = await response.json();

      if (data && data.length > 0) {
        const item = data[0];
        setFormData(prev => ({
          ...prev,
          structure: item.structure || prev.structure,
          meaning: item.meaning || prev.meaning,
          explanation: item.explanation || prev.explanation,
        }));
        
        if (item.exampleSentence || item.exampleMeaning) {
          const newExamples = splitExamples(item.exampleSentence, item.exampleMeaning);
          setExamplesList(newExamples);
        }
        if (item.quizSentence) {
          setQuizList(splitQuiz(item.quizSentence));
        }
        message.success('AI đã chuẩn hóa và điền xong!');
      } else {
        message.warning('AI không tìm thấy ngữ pháp để xử lý!');
      }
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi gọi AI: ' + err.message);
    } finally {
      hide();
      setIsAiProcessing(false);
    }
  };

  const handleSmartPaste = async (text) => {
    if (!text.trim()) return message.warning('Vui lòng dán nội dung!');
    setIsAiProcessing(true);
    const hide = message.loading('AI đang đọc và điền dữ liệu...', 0);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/generate-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          type: 'GRAMMAR'
        })
      });
      if (!res.ok) throw new Error('AI failed');
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        setFormData(prev => ({
          ...prev,
          structure: item.structure || prev.structure,
          meaning: item.meaning || prev.meaning,
          explanation: item.explanation || prev.explanation,
        }));
        
        if (item.exampleSentence || item.exampleMeaning) {
          const newExamples = splitExamples(item.exampleSentence, item.exampleMeaning);
          setExamplesList(newExamples);
        }
        if (item.quizSentence) {
          setQuizList(splitQuiz(item.quizSentence));
        }
        message.success('Đã tự động điền thành công!');
      } else {
        message.warning('AI không tìm thấy ngữ pháp nào trong văn bản!');
      }
    } catch (err) {
      message.error('Lỗi khi gọi AI: ' + err.message);
    } finally {
      setIsAiProcessing(false);
      hide();
    }
  };

  const handleBulkAiProcess = async () => {
    if (!bulkInput.trim()) return message.warning('Vui lòng dán nội dung cần xử lý');
    if (!formData.bookId) return message.warning('Vui lòng chọn giáo trình trước khi phân tích hàng loạt');

    setIsAiProcessing(true);
    const hide = message.loading('AI đang phân tích ngữ pháp hàng loạt...', 0);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/generate-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: bulkInput,
          type: 'GRAMMAR'
        })
      });
      if (!res.ok) throw new Error('AI processing failed');
      const data = await res.json();
      
      const mappedData = data.map(item => {
        let isDuplicate = false;
        let existingId = null;
        if (existingGrammars && formData.bookId) {
           const existing = existingGrammars.find(g => 
              (g.bookId?.toString() === formData.bookId.toString() || g.book?.id?.toString() === formData.bookId.toString()) && 
              g.structure.trim() === item.structure.trim()
           );
           if (existing) {
             isDuplicate = true;
             existingId = existing.id;
           }
        }
        // Mỗi item được khởi tạo với day riêng (default = formData.day hiện tại)
        return { ...item, selected: !isDuplicate, isDuplicate, existingId, day: formData.day || 1 };
      });
      
      setPreviewData(mappedData);
      message.success('Đã phân tích xong Ngữ pháp!');
    } catch (err) {
      message.error('Lỗi khi xử lý hàng loạt: ' + err.message);
    } finally {
      setIsAiProcessing(false);
      hide();
    }
  };

  const handleSaveBulk = async () => {
    const itemsToSave = previewData.filter(item => item.selected);
    if (itemsToSave.length === 0) return message.warning('Không có cấu trúc nào được chọn');

    const duplicates = itemsToSave.filter(i => i.isDuplicate);
    const newItems = itemsToSave.filter(i => !i.isDuplicate);

    const saveProcess = async (actionType) => {
      setIsSaving(true);
      const hide = message.loading(`Đang lưu cấu trúc ngữ pháp...`, 0);
      try {
        // Get the global sortOrder of each item in the full newItems/duplicates list
        const allSelectedItems = itemsToSave;

        const createPayload = (item) => {
          const globalIdx = allSelectedItems.indexOf(item);
          return {
            structure: item.structure,
            meaning: item.meaning,
            explanation: item.explanation,
            exampleSentence: item.exampleSentence,
            exampleMeaning: item.exampleMeaning,
            quizSentence: item.quizSentence,
            level: item.level && item.level !== 'N3' ? item.level : (formData.bookId ? books.find(b => b.id.toString() === formData.bookId.toString())?.levelLabel || 'N3' : 'N3'),
            book: { id: parseInt(formData.bookId) },
            week: formData.week ? parseInt(formData.week) : null,
            day: item.day ? parseInt(item.day) : null,
            sortOrder: globalIdx >= 0 ? globalIdx + 1 : null
          };
        };

        for (let i = 0; i < allSelectedItems.length; i++) {
          const item = allSelectedItems[i];
          const isDup = duplicates.find(d => d.structure === item.structure);
          
          if (isDup) {
            if (actionType === 'OVERWRITE') {
              await grammarService.update(isDup.existingId, createPayload(isDup));
            } else if (actionType === 'ADD_NEW') {
              await grammarService.create(createPayload(isDup));
            }
          } else {
            await grammarService.create(createPayload(item));
          }
        }

        message.success(`Đã lưu thành công!`);
        onSuccess();
        onClose();
      } catch (err) {
        message.error('Lỗi khi lưu dữ liệu: ' + err.message);
      } finally {
        setIsSaving(false);
        hide();
      }
    };

    if (duplicates.length > 0) {
      Modal.confirm({
        zIndex: 100000,
        width: 500,
        title: 'Phát hiện Ngữ pháp trùng lặp',
        content: `Có ${duplicates.length} cấu trúc ngữ pháp đã tồn tại trong giáo trình này. Bạn muốn làm gì với những cấu trúc này?`,
        footer: () => (
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => { Modal.destroyAll(); saveProcess('SKIP'); }} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Giữ cái cũ (Skip)</button>
            <button onClick={() => { Modal.destroyAll(); saveProcess('ADD_NEW'); }} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors">Vẫn thêm (Trùng lặp)</button>
            <button onClick={() => { Modal.destroyAll(); saveProcess('OVERWRITE'); }} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 rounded-lg text-xs font-bold transition-opacity">Ghi đè (Overwrite)</button>
          </div>
        )
      });
    } else {
      saveProcess('ADD_NEW');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const exampleSentence = examplesList.map(e => e.sentence).join('\n').trim();
    const exampleMeaning = examplesList.map(e => e.meaning).join('\n').trim();
    const quizSentence = quizList.filter(q => q.trim() !== '').join('\n').trim();

    const payload = {
      ...formData,
      exampleSentence,
      exampleMeaning,
      quizSentence,
      book: formData.bookId ? { id: parseInt(formData.bookId) } : null
    };
    delete payload.bookId;

    if (!initialData) {
      const exists = existingGrammars.find(g => 
        (g.bookId?.toString() === formData.bookId.toString() || g.book?.id?.toString() === formData.bookId.toString()) && 
        g.structure.trim() === formData.structure.trim()
      );
      if (exists) {
        Modal.confirm({
          zIndex: 100000,
          title: 'Ngữ pháp đã tồn tại',
          content: 'Cấu trúc này đã có trong bài. Bạn muốn làm gì?',
          footer: () => (
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => Modal.destroyAll()} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Hủy</button>
              <button onClick={async () => {
                Modal.destroyAll();
                try {
                  await grammarService.create(payload);
                  onSuccess();
                  message.success('Đã thêm mới!');
                } catch(err) {
                  message.error('Đã có lỗi xảy ra!');
                }
              }} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors">Vẫn thêm (Cho phép trùng)</button>
              <button onClick={async () => {
                Modal.destroyAll();
                try {
                  await grammarService.update(exists.id, payload);
                  onSuccess();
                  message.success('Đã ghi đè thành công!');
                } catch(err) {
                  message.error('Đã có lỗi xảy ra!');
                }
              }} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 rounded-lg text-xs font-bold transition-opacity">Ghi đè</button>
            </div>
          )
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      if (initialData) {
        await grammarService.update(initialData.id, payload);
      } else {
        await grammarService.create(payload);
      }
      message.success(initialData ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      message.error('Đã có lỗi xảy ra!');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 dark:bg-black/80 overflow-y-auto">
      <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full ${modalTab === 'bulk' ? 'max-w-6xl' : 'max-w-lg'} rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-300 transition-all overflow-hidden`}>
        {/* Header with Tabs */}
        <div className="px-4 md:px-8 py-4 md:py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setModalTab('single')}
              className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all pb-1 ${modalTab === 'single' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
            >
              {initialData ? 'CHỈNH SỬA' : 'THÊM THỦ CÔNG'}
            </button>
            {!initialData && (
              <button
                onClick={() => setModalTab('bulk')}
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all pb-1 ${modalTab === 'bulk' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
              >
                AI NHẬP HÀNG LOẠT
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-black dark:hover:text-white transition-colors">
            Đóng
          </button>
        </div>

        {modalTab === 'single' ? (
          <GrammarSingleForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleAiAutoFill={handleAiAutoFill}
            handleSmartPaste={handleSmartPaste}
            isAiProcessing={isAiProcessing}
            examplesList={examplesList}
            setExamplesList={setExamplesList}
            quizList={quizList}
            setQuizList={setQuizList}
            books={books}
            isSaving={isSaving}
            initialData={initialData}
            onSubmit={handleSubmit}
          />
        ) : (
          <GrammarBulkPanel
            formData={formData}
            handleInputChange={handleInputChange}
            books={books}
            bulkInput={bulkInput}
            setBulkInput={setBulkInput}
            isAiProcessing={isAiProcessing}
            handleBulkAiProcess={handleBulkAiProcess}
            previewData={previewData}
            setPreviewData={setPreviewData}
            handleSaveBulk={handleSaveBulk}
            isSaving={isSaving}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  , document.body);
}
