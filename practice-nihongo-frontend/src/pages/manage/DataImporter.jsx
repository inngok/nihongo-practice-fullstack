import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { message } from 'antd';

export default function DataImporter() {
  const [dataType, setDataType] = useState('kanjis');
  const [jsonData, setJsonData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { fetchWithAuth } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

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
      const response = await fetchWithAuth(`http://localhost:8080/api/${dataType}/bulk`, {
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

  const getPlaceholder = () => {
    if (dataType === 'kanjis') {
      return `[\n  {\n    "character": "学",\n    "kunyomi": "まな.ぶ",\n    "onyomi": "ガク",\n    "meaning": "Học",\n    "examples": "学校 (Trường học)"\n  }\n]`;
    }
    return `[\n  {\n    "word": "食べる",\n    "reading": "たべる",\n    "meaning": "Ăn",\n    "exampleSentence": "ご飯を食べる",\n    "exampleMeaning": "Ăn cơm"\n  }\n]`;
  };

  return (
    <div className="flex-grow w-full py-8 px-10 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        {contextHolder}
        
        {/* Simple Header */}
        <div className="mb-12">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Importer</h1>
          <p className="text-slate-400 text-[13px] font-medium">Nhập dữ liệu hàng loạt từ JSON (AI Generated)</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-10">

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Chọn loại dữ liệu muốn import
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setDataType('kanjis')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${dataType === 'kanjis'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
              Hán Tự (Kanji)
            </button>
            <button
              onClick={() => setDataType('vocabs')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${dataType === 'vocabs'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
              Từ Vựng (Vocab)
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex justify-between">
            <span>Dữ liệu JSON</span>
            <button
              onClick={() => setJsonData(getPlaceholder())}
              className="text-blue-500 hover:text-blue-700 normal-case"
            >
              Xem mẫu JSON
            </button>
          </label>
          <textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full h-96 p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-y"
          ></textarea>
        </div>

        <button
          onClick={handleImport}
          disabled={isLoading || !jsonData.trim()}
          className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang Import...
            </>
          ) : (
            'Import vào Database'
          )}
        </button>
      </div>
    </div>
  </div>
);
}
