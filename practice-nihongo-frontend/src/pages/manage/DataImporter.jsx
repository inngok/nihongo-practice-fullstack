import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { message } from 'antd';
import * as XLSX from 'xlsx';
import { FileExcelOutlined, ThunderboltOutlined, CopyOutlined, CheckCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '../../config';

export default function DataImporter() {
  const [dataType, setDataType] = useState('kanjis');
  const [jsonData, setJsonData] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const { fetchWithAuth } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const fileInputRef = React.useRef(null);

  const handleImport = async () => {
    if (!jsonData.trim()) {
      return messageApi.error('Vui lòng nhập dữ liệu JSON');
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

    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/${dataType}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
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
    <div className="flex-grow w-full py-12 px-6 md:px-12 bg-slate-50/30 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-10">
        {contextHolder}
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                <UploadOutlined className="text-white text-xl" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Data Importer</h1>
            </div>
            <p className="text-slate-400 text-sm font-medium pl-1">Công cụ nhập liệu thông minh cho quản trị viên</p>
          </div>

          <div className="flex gap-3">
             <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:border-black hover:text-black transition-all shadow-sm"
            >
              <FileExcelOutlined />
              Tải Excel/CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Raw Input & Options */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                1. Cấu hình loại dữ liệu
              </label>
              <div className="grid grid-cols-2 gap-3 mb-8">
                <button
                  onClick={() => setDataType('kanjis')}
                  className={`py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${dataType === 'kanjis'
                      ? 'bg-black text-white shadow-xl shadow-black/20'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                >
                  Hán Tự
                </button>
                <button
                  onClick={() => setDataType('vocabs')}
                  className={`py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${dataType === 'vocabs'
                      ? 'bg-black text-white shadow-xl shadow-black/20'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                >
                  Từ Vựng
                </button>
              </div>

              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex justify-between items-center">
                2. Nhập dữ liệu thô (AI Smart)
                <ThunderboltOutlined className="text-amber-400 animate-pulse" />
              </label>
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Dán dữ liệu lộn xộn vào đây...&#10;Ví dụ: &#10;Taberu - Ăn&#10;Gakkou (Trường học)&#10;..."
                className="w-full h-64 p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-black outline-none transition-all resize-none text-sm font-medium placeholder:text-slate-300"
              ></textarea>

              <button
                onClick={handleAISmartFormat}
                disabled={isProcessingAI || !rawInput.trim()}
                className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isProcessingAI ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <ThunderboltOutlined />
                )}
                AI Smart Format
              </button>
            </div>
          </div>

          {/* Right Panel: JSON Review & Import */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  3. Kiểm tra JSON kết quả
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setJsonData(getPlaceholder())}
                    className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                  >
                    Xem mẫu
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(jsonData);
                      messageApi.success('Đã copy vào clipboard');
                    }}
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-black flex items-center gap-1.5"
                  >
                    <CopyOutlined />
                    Copy
                  </button>
                </div>
              </div>
              
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder={getPlaceholder()}
                className="flex-grow w-full min-h-[400px] p-6 font-mono text-xs bg-slate-900 text-emerald-400 rounded-2xl border-none outline-none selection:bg-emerald-500/20 scrollbar-hide"
              ></textarea>

              <div className="mt-8 pt-8 border-t border-slate-50">
                <button
                  onClick={handleImport}
                  disabled={isLoading || !jsonData.trim()}
                  className="w-full py-5 bg-black text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex justify-center items-center gap-4"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircleOutlined className="text-lg" />
                  )}
                  {isLoading ? 'Đang thực thi...' : 'Xác nhận Import'}
                </button>
                <p className="text-center mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  Dữ liệu sẽ được lưu trực tiếp vào Database
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
