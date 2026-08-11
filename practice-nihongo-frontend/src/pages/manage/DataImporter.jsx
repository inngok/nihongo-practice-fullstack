import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { message, Select } from 'antd';
// XLSX được lazy import khi cần — không ảnh hưởng bundle chính
import { API_BASE_URL } from '../../config';
import DataImporterDuplicateModal from './components/DataImporterDuplicateModal';

export default function DataImporter() {
  const [dataType, setDataType] = useState('kanjis');
  const [jsonData, setJsonData] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const { fetchWithAuth } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const fileInputRef = React.useRef(null);
  const aiFileInputRef = React.useRef(null);
  const abortControllerRef = React.useRef(null);
  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);
  const [duplicateItems, setDuplicateItems] = useState([]);
  const [nonDuplicateItems, setNonDuplicateItems] = useState([]);
  const [aiUsage, setAiUsage] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  const fetchAiUsage = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/dashboard/stats`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.aiUsage) {
          setAiUsage(data.aiUsage);
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI usage stats:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchAiUsage();

    // Listen for window focus to auto-refresh the book list (e.g., if a book was added in another tab)
    const handleWindowFocus = () => {
      fetchBooks();
      fetchAiUsage();
    };

    // Listen for real-time cross-tab synchronization messages
    let channel;
    try {
      channel = new BroadcastChannel('nihongo-sync-channel');
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'BOOKS_UPDATED') {
          fetchBooks();
        }
      };
    } catch (err) {
      console.warn('BroadcastChannel failed to initialize:', err);
    }

    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      if (channel) {
        channel.close();
      }
    };
  }, []);

  // Reset selected textbook when toggling import data categories (Kanji vs Vocab)
  useEffect(() => {
    setSelectedBook(null);
  }, [dataType]);

  const fetchBooks = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/books`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  };

  const proceedImport = async (dataToImport, successMessage) => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/${dataType}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToImport),
      });

      if (!response.ok) {
        throw new Error(`Server trả về lỗi: ${response.status}`);
      }

      messageApi.success(successMessage);
      setJsonData(''); // Clear after success
    } catch (error) {
      messageApi.error(`Lỗi khi import: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeepOld = async () => {
    setDuplicateModalVisible(false);
    if (nonDuplicateItems.length === 0) {
      messageApi.info('Tất cả bản ghi đều trùng khớp và đã được giữ nguyên (không import thêm).');
      return;
    }
    await proceedImport(
      nonDuplicateItems,
      `Đã giữ lại ${duplicateItems.length} bản ghi cũ. Import thành công ${nonDuplicateItems.length} bản ghi mới!`
    );
  };

  const handleOverwriteNew = async () => {
    setDuplicateModalVisible(false);
    
    // For both vocabs and kanjis, map existingId into the item's id property so JPA performs updates
    const updatedDuplicates = duplicateItems.map(item => {
      const { existingId, ...rest } = item;
      return {
        ...rest,
        id: existingId
      };
    });

    const combinedData = [...nonDuplicateItems, ...updatedDuplicates];
    await proceedImport(
      combinedData,
      `Đã cập nhật đè ${duplicateItems.length} bản ghi trùng và import thêm ${nonDuplicateItems.length} bản ghi mới thành công!`
    );
  };

  const handleAddNew = async () => {
    setDuplicateModalVisible(false);
    
    // Remove existingId from duplicates so they are treated as new
    const updatedDuplicates = duplicateItems.map(item => {
      const { existingId, ...rest } = item;
      return rest;
    });

    const combinedData = [...nonDuplicateItems, ...updatedDuplicates];
    await proceedImport(
      combinedData,
      `Đã thêm mới ${duplicateItems.length} bản ghi trùng và import thêm ${nonDuplicateItems.length} bản ghi mới thành công!`
    );
  };

  const handleImport = async () => {
    if (!jsonData.trim()) {
      return messageApi.error('Vui lòng nhập dữ liệu JSON');
    }

    if (!selectedBook) {
      return messageApi.error('Vui lòng chọn giáo trình trước khi Import');
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonData);
      if (!Array.isArray(parsedData)) {
        throw new Error('Dữ liệu phải là một mảng (Array) các object');
      }
    } catch (e) {
      return messageApi.error(`Lỗi JSON: ${e.message}`);
    }

    // Normalize alternative keys (e.g., map 'kanji' -> 'character', 'hano' -> 'hanviet')
    const normalizedData = parsedData.map(item => {
      const normalized = { ...item };
      
      if (item.kanji && !item.character) {
        normalized.character = item.kanji;
      }
      
      if (item.hano && !item.hanviet) {
        normalized.hanviet = item.hano;
      } else if (item.han_viet && !item.hanviet) {
        normalized.hanviet = item.han_viet;
      } else if (item.hanViet && !item.hanviet) {
        normalized.hanviet = item.hanViet;
      }
      
      if (item.trang && !item.page) {
        normalized.page = parseInt(item.trang);
      } else if (item.trang_so && !item.page) {
        normalized.page = parseInt(item.trang_so);
      } else if (item.trangso && !item.page) {
        normalized.page = parseInt(item.trangso);
      }

      // Map 'lesson' or 'bài' to 'week' for DB storage
      if ((item.lesson || item.bai || item.bài || item.lesson_number) && !item.week) {
        normalized.week = parseInt(item.lesson || item.bai || item.bài || item.lesson_number);
      }
      
      return normalized;
    });

    // Filter out invalid items (e.g., empty rows from CSV/Excel)
    const validData = normalizedData.filter(item => {
      if (dataType === 'kanjis') {
        return item.character && String(item.character).trim() !== '';
      } else {
        return item.word && String(item.word).trim() !== '';
      }
    });

    if (validData.length === 0) {
      return messageApi.error('Không tìm thấy bản ghi hợp lệ nào chứa Chữ Hán hoặc Từ Vựng!');
    }

    // Inject selected book and week into each item
    const finalData = validData.map(item => ({
      ...item,
      book: { id: selectedBook },
      ...(selectedWeek ? { week: parseInt(selectedWeek) } : {})
    }));

    setIsLoading(true);

    // Fast check for duplicates within the current book
    let existingItems = [];
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/${dataType}?bookId=${selectedBook}`);
      if (response.ok) {
        existingItems = await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch existing items for duplicate check:', error);
      // Fallback: Proceed with bulk import directly
      await proceedImport(finalData, `Import thành công ${finalData.length} bản ghi vào ${dataType}!`);
      return;
    }

    const existingMap = new Map();
    existingItems.forEach(item => {
      const key = dataType === 'kanjis' ? item.character : item.word;
      if (key) {
        existingMap.set(String(key).trim(), item);
      }
    });

    const duplicates = [];
    const nonDuplicates = [];

    finalData.forEach(item => {
      const key = dataType === 'kanjis' ? item.character : item.word;
      const existing = existingMap.get(String(key).trim());
      if (existing) {
        duplicates.push({
          ...item,
          existingId: existing.id
        });
      } else {
        nonDuplicates.push(item);
      }
    });

    if (duplicates.length > 0) {
      setDuplicateItems(duplicates);
      setNonDuplicateItems(nonDuplicates);
      setDuplicateModalVisible(true);
      setIsLoading(false);
    } else {
      await proceedImport(finalData, `Import thành công ${finalData.length} bản ghi vào ${dataType}!`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const XLSX = await import('xlsx');
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          return messageApi.warning('File không có dữ liệu');
        }

        setJsonData(JSON.stringify(data, null, 2));
        messageApi.success(`Đã đọc ${data.length} dòng từ file. Ấn Import để lưu vào Database nhé!`);
      } catch (err) {
        messageApi.error('Lỗi khi đọc file: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const downloadTemplate = () => {
    let headers = '';
    let filename = '';
    if (dataType === 'kanjis') {
      headers = 'character,kunyomi,onyomi,hanviet,meaning,examples,lesson\n';
      headers += '一,ひと.つ,イチ,NHẤT,một,"一人 (ひとり): một người\\n一日 (ついたch): ngày mùng một",1\n';
      filename = 'kanji_template_lesson.csv';
    } else {
      headers = 'word,reading,hanviet,meaning,example,exampleMeaning,lesson\n';
      headers += '食べる,たべる,THỰC,Ăn,ご飯を食べる,Ăn cơm,1\n';
      filename = 'vocab_template_lesson.csv';
    }

    // Add UTF-8 Byte Order Mark (BOM) so Excel can read Vietnamese & Japanese characters perfectly
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), headers], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      messageApi.success('Đã tải xuống file mẫu chuẩn thành công!');
    }
  };

  const handleCancelAI = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleAIFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessingAI(true);
    messageApi.loading({ content: 'AI đang đọc và giải mã cấu trúc file...', key: 'ai_file_load' });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const XLSX = await import('xlsx');
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawDataArray = XLSX.utils.sheet_to_json(ws);
        
        if (rawDataArray.length === 0) {
          messageApi.destroy('ai_file_load');
          setIsProcessingAI(false);
          abortControllerRef.current = null;
          return messageApi.warning('File tải lên không có dữ liệu');
        }

        const rawDataString = JSON.stringify(rawDataArray, null, 2);

        const response = await fetchWithAuth(`${API_BASE_URL}/ai/format-import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rawData: rawDataString,
            type: dataType
          }),
          signal: controller.signal
        });

        if (!response.ok) {
          const errorMsg = await response.text();
          throw new Error(errorMsg || `Server error: ${response.status}`);
        }

        const formattedJson = await response.text();
        setJsonData(formattedJson);
        messageApi.success({ content: `AI đã chuẩn hóa thành công ${rawDataArray.length} dòng dữ liệu!`, key: 'ai_file_load', duration: 4 });
        fetchAiUsage();
      } catch (err) {
        if (err.name === 'AbortError') {
          messageApi.info({ content: 'Đã hủy tiến trình AI theo yêu cầu.', key: 'ai_file_load', duration: 3 });
        } else {
          console.error(err);
          messageApi.error({ content: 'Lỗi khi AI chuẩn hóa file: ' + err.message, key: 'ai_file_load', duration: 4 });
        }
      } finally {
        setIsProcessingAI(false);
        abortControllerRef.current = null;
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleAISmartFormat = async () => {
    if (!rawInput.trim()) {
      return messageApi.warning('Vui lòng nhập dữ liệu thô vào ô phía trên');
    }

    setIsProcessingAI(true);
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/ai/format-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawData: rawInput,
          type: dataType
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || `Server error: ${response.status}`);
      }

      const formattedJson = await response.text();
      setJsonData(formattedJson);
      messageApi.success('AI đã xử lý xong! Bạn vui lòng kiểm tra lại JSON bên dưới rồi nhấn Import nhé.');
      fetchAiUsage();
    } catch (err) {
      if (err.name === 'AbortError') {
        messageApi.info('Đã hủy tiến trình AI theo yêu cầu.');
      } else {
        console.error(err);
        messageApi.error('Lỗi khi xử lý AI: ' + err.message);
      }
    } finally {
      setIsProcessingAI(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent flex flex-col items-center pt-24 pb-16 px-6 font-sans selection:bg-slate-200 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-5xl">
        {contextHolder}
        
        {/* Minimalist Monochrome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý Dữ liệu</h1>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">/ Data Import</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Tự động chuẩn hóa cấu trúc dữ liệu thô bằng AI</p>
          </div>
          
          {/* Connection Status Box */}
          <div className="flex gap-4 items-center bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-5 py-2.5 self-start md:self-auto shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Trạng thái AI</span>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${aiUsage?.isKeyConfigured ? 'bg-slate-900 dark:bg-white animate-pulse' : 'bg-slate-400 dark:bg-slate-600'}`}></span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  {aiUsage ? `Còn lại: ${aiUsage.remaining} / ${aiUsage.limit} lượt` : 'Engine Ready'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Configuration & Input */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
                1. Cấu hình & Dữ liệu thô
              </h2>
              
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setDataType('kanjis')}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${dataType === 'kanjis'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  Hán Tự
                </button>
                <button
                  onClick={() => setDataType('vocabs')}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${dataType === 'vocabs'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  Từ Vựng
                </button>
              </div>

              <div className="space-y-4">
                <textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="Dán dữ liệu thô vào đây... (Ví dụ: Taberu - Ăn)"
                  className="w-full h-48 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:border-slate-400 dark:focus:border-slate-600 outline-none transition-all resize-none text-sm font-medium"
                ></textarea>
                
                {isProcessingAI ? (
                  <button
                    onClick={handleCancelAI}
                    className="w-full py-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white dark:hover:bg-red-500 hover:border-red-500 transition-all flex items-center justify-center gap-2 animate-pulse"
                  >
                    <span>Dừng xử lý (Cancel)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleAISmartFormat}
                    disabled={!rawInput.trim()}
                    className="w-full py-4 bg-white dark:bg-transparent border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-white hover:border-slate-700 dark:hover:border-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all disabled:opacity-30 flex items-center justify-center"
                  >
                    Xử lý bằng AI
                  </button>
                )}
              </div>
            </div>

            {/* Guide & Template Download */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Chuẩn bị File nguồn:</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Bạn nên dùng file định dạng có các tiêu đề cột đúng tiêu chuẩn.</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center"
              >
                <span>Tải File Mẫu Chuẩn</span>
              </button>
            </div>

            {/* Upload Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Standard Import */}
              <button
                onClick={() => fileInputRef.current.click()}
                className="group flex flex-col items-center justify-center gap-1 p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white rounded-2xl font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <span className="text-xs uppercase tracking-widest mt-2">Import File Chuẩn</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 normal-case font-normal font-sans mb-2">Đúng tên các cột tiêu chuẩn</span>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />
              </button>

              {/* Option 2: AI Smart Import */}
              <button
                onClick={() => aiFileInputRef.current.click()}
                disabled={isProcessingAI}
                className="group flex flex-col items-center justify-center gap-1 p-6 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-900 dark:hover:border-white rounded-2xl font-bold transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
              >
                <span className="text-xs uppercase tracking-widest flex items-center mt-2">File Bừa (AI Tự Xử)</span>
                <span className="text-[9px] text-indigo-400 dark:text-indigo-500 normal-case font-normal font-sans mb-2">File lộn xộn, AI tự nắn</span>
                <input type="file" ref={aiFileInputRef} onChange={handleAIFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />
              </button>
            </div>
          </div>

          {/* Review & Import */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                2. Kiểm tra & Lưu trữ
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded transition-all ${viewMode === 'table' ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Bảng
                </button>
                <button
                  onClick={() => setViewMode('json')}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded transition-all ${viewMode === 'json' ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  JSON
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(jsonData);
                    messageApi.success('Đã copy JSON');
                  }}
                  className="px-3 py-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white"
                >
                  Copy JSON
                </button>
              </div>
            </div>
            
            {viewMode === 'json' ? (
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder="Kết quả JSON sẽ hiện ở đây..."
                className="flex-grow w-full min-h-[350px] p-5 font-mono text-xs bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-100 dark:border-slate-800 outline-none focus:border-slate-300 dark:focus:border-slate-600 transition-all"
              ></textarea>
            ) : (
              <div className="flex-grow w-full min-h-[350px] overflow-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                {(() => {
                  if (!jsonData.trim()) {
                    return <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium">Chưa có dữ liệu</div>;
                  }
                  try {
                    const parsed = JSON.parse(jsonData);
                    if (!Array.isArray(parsed) || parsed.length === 0) return <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium">Không có bản ghi nào.</div>;
                    
                    const keys = Array.from(new Set(parsed.flatMap(Object.keys)));
                    
                    return (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-900/80 sticky top-0 z-10">
                          <tr>
                            <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-slate-500 border-b border-slate-200 dark:border-slate-800">STT</th>
                            {keys.map(k => (
                              <th key={k} className="p-3 font-bold uppercase tracking-wider text-[10px] text-slate-500 border-b border-slate-200 dark:border-slate-800">{k}</th>
                            ))}
                            <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-slate-500 border-b border-slate-200 dark:border-slate-800 text-center">Xóa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsed.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                              <td className="p-3 text-slate-500 font-medium">{idx + 1}</td>
                              {keys.map(k => (
                                <td key={k} className="p-2">
                                  <input 
                                    type="text"
                                    value={item[k] !== undefined && item[k] !== null ? item[k] : ''}
                                    onChange={(e) => {
                                      const newParsed = [...parsed];
                                      newParsed[idx][k] = e.target.value;
                                      setJsonData(JSON.stringify(newParsed, null, 2));
                                    }}
                                    className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-400 dark:hover:border-slate-700 dark:focus:border-slate-500 p-1.5 rounded outline-none transition-colors text-slate-700 dark:text-slate-300"
                                  />
                                </td>
                              ))}
                              <td className="p-2 text-center">
                                <button
                                  onClick={() => {
                                    const newParsed = parsed.filter((_, i) => i !== idx);
                                    setJsonData(JSON.stringify(newParsed, null, 2));
                                  }}
                                  className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                                >
                                  ×
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  } catch (e) {
                    return <div className="p-8 text-center text-red-500 font-medium">Lỗi phân tích JSON. Vui lòng chuyển sang tab JSON để sửa.</div>;
                  }
                })()}
              </div>
            )}

            <div className="mt-8 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Select
                    showSearch
                    placeholder="Chọn giáo trình..."
                    className="w-full h-12"
                    onChange={setSelectedBook}
                    onFocus={fetchBooks}
                    value={selectedBook}
                    options={books
                      .filter(book => {
                        if (!book.type) return false;
                        return dataType === 'kanjis' ? book.type.includes('KANJI') : book.type.includes('VOCABULARY');
                      })
                      .map(book => ({ value: book.id, label: book.title }))}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </div>
                <div className="col-span-1">
                  <Select
                    placeholder="Bài học (Tùy chọn)"
                    className="w-full h-12"
                    onChange={setSelectedWeek}
                    value={selectedWeek}
                    allowClear
                    options={Array.from({length: 50}, (_, i) => ({ value: i + 1, label: `Bài ${i + 1}` }))}
                  />
                </div>
              </div>

              <button
                onClick={handleImport}
                disabled={isLoading || !jsonData.trim()}
                className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-slate-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex justify-center items-center animate-all"
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                )}
                {isLoading ? 'Đang thực thi...' : 'Xác nhận Import'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Duplicate Alert Modal */}
      <DataImporterDuplicateModal
        isOpen={duplicateModalVisible}
        dataType={dataType}
        duplicateItems={duplicateItems}
        nonDuplicateItems={nonDuplicateItems}
        onKeepOld={handleKeepOld}
        onOverwriteNew={handleOverwriteNew}
        onAddNew={handleAddNew}
        onClose={() => setDuplicateModalVisible(false)}
      />
    </div>
  );
}
