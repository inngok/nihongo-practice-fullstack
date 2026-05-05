import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { message, Select } from 'antd';
import * as XLSX from 'xlsx';
import { FileExcelOutlined, ThunderboltOutlined, CopyOutlined, CheckCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '../../config';

export default function DataImporter() {
  const [dataType, setDataType] = useState('kanjis');
  const [jsonData, setJsonData] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const { fetchWithAuth } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchBooks();
  }, []);

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

    // Inject selected book into each item
    const finalData = parsedData.map(item => ({
      ...item,
      book: { id: selectedBook }
    }));

    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/${dataType}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        throw new Error(`Server trả về lỗi: ${response.status}`);
      }

      messageApi.success(`Import thành công ${parsedData.length} bản ghi vào ${dataType}!`);
      setJsonData(''); // Clear after success
    } catch (error) {
      messageApi.error(`Lỗi khi import: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
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

  const handleAISmartFormat = async () => {
    if (!rawInput.trim()) {
      return messageApi.warning('Vui lòng nhập dữ liệu thô vào ô phía trên');
    }

    setIsProcessingAI(true);
    
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
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || `Server error: ${response.status}`);
      }

      const formattedJson = await response.text();
      setJsonData(formattedJson);
      messageApi.success('AI đã xử lý xong! Bác kiểm tra lại JSON bên dưới rồi nhấn Import nhé.');
    } catch (err) {
      console.error(err);
      messageApi.error('Lỗi khi xử lý AI: ' + err.message);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const getPlaceholder = () => {
    if (dataType === 'kanjis') {
      return `[\n  {\n    "character": "学",\n    "kunyomi": "まな.ぶ",\n    "onyomi": "ガク",\n    "meaning": "Học",\n    "examples": "学校 (Trường học)"\n  }\n]`;
    }
    return `[\n  {\n    "word": "食べる",\n    "reading": "たべる",\n    "meaning": "Ăn",\n    "exampleSentence": "ご飯을食べる",\n    "exampleMeaning": "Ăn cơm"\n  }\n]`;
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center pt-24 pb-16 px-6 font-sans selection:bg-slate-200">
      <div className="w-full max-w-5xl">
        {contextHolder}
        
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Quản lý dữ liệu
          </h1>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
            Sử dụng AI để chuẩn hóa và nạp dữ liệu nhanh chóng vào hệ thống.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Configuration & Input */}
          <div className="space-y-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-8">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6">
                1. Cấu hình & Dữ liệu thô
              </h2>
              
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setDataType('kanjis')}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${dataType === 'kanjis'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                >
                  Hán Tự
                </button>
                <button
                  onClick={() => setDataType('vocabs')}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${dataType === 'vocabs'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
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
                  className="w-full h-48 p-5 bg-slate-50 border border-slate-100 rounded-xl focus:border-slate-400 outline-none transition-all resize-none text-sm font-medium"
                ></textarea>
                
                <button
                  onClick={handleAISmartFormat}
                  disabled={isProcessingAI || !rawInput.trim()}
                  className="w-full py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                >
                  <ThunderboltOutlined />
                  {isProcessingAI ? 'Đang xử lý...' : 'Xử lý bằng AI'}
                </button>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current.click()}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:border-slate-400 hover:text-slate-900 transition-all"
            >
              <FileExcelOutlined />
              Tải file Excel / CSV
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />
            </button>
          </div>

          {/* Review & Import */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                2. Kiểm tra & Lưu trữ
              </h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(jsonData);
                  messageApi.success('Đã copy JSON');
                }}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 flex items-center gap-1.5"
              >
                <CopyOutlined />
                Copy JSON
              </button>
            </div>
            
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder="Kết quả JSON sẽ hiện ở đây..."
              className="flex-grow w-full min-h-[350px] p-5 font-mono text-xs bg-slate-50 text-slate-600 rounded-xl border border-slate-100 outline-none focus:border-slate-300 transition-all"
            ></textarea>

            <div className="mt-8 space-y-4">
              <Select
                showSearch
                placeholder="Chọn giáo trình..."
                className="w-full h-12"
                onChange={setSelectedBook}
                value={selectedBook}
                options={books.map(book => ({ value: book.id, label: book.title }))}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />

              <button
                onClick={handleImport}
                disabled={isLoading || !jsonData.trim()}
                className="w-full py-5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed flex justify-center items-center gap-3"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <CheckCircleOutlined className="text-base" />
                )}
                {isLoading ? 'Đang thực thi...' : 'Xác nhận Import'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
