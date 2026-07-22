import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { message, Select } from 'antd';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../../config';
import { UploadCloud, CheckCircle } from 'lucide-react';

export default function JlptPastVocabManager() {
  const [examMonth, setExamMonth] = useState('7');
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [level, setLevel] = useState('N3');
  const [jsonData, setJsonData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const fileInputRef = useRef(null);
  const { fetchWithAuth } = useAuth();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Tự động nhận diện Tháng & Năm từ tên file
    const fileStr = file.name.toLowerCase();
    const yearMatch = fileStr.match(/20\d{2}/);
    if (yearMatch) setExamYear(yearMatch[0]);

    if (/(\bt12\b|\bthang ?12\b|\btháng ?12\b|\b12\b|_12_|-12-|12-|-12|_12)/.test(fileStr)) {
       setExamMonth('12');
    } else if (/(\bt0?7\b|\bthang ?0?7\b|\btháng ?0?7\b|\b0?7\b|_0?7_|-0?7-|0?7-|-0?7|_0?7)/.test(fileStr)) {
       setExamMonth('7');
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
        
        if (data.length === 0) {
          return messageApi.warning('File không có dữ liệu');
        }

        // Standardize headers to support Vietnamese & English forms & trailing spaces
        const normalizedData = data.map(rawItem => {
            const item = {};
            const values = []; // for fallback
            for (let k in rawItem) {
               if (rawItem[k] !== undefined && rawItem[k] !== null && String(rawItem[k]).trim() !== '') {
                   values.push(rawItem[k]);
               }
               const cleanKey = k.replace(/[\s_]+/g, '').toLowerCase();
               item[cleanKey] = rawItem[k];
            }
            
            let word = item['từvựng'] || item['tuvung'] || item['character'] || item['word'] || item['kanji'] || item['từ'] || item['vocab'] || item['vocabulary'] || item['chữ'] || '';
            let kanji = item['hántự'] || item['hantu'] || item['cáchđọc'] || item['reading'] || item['âmđọc'] || item['hiragana'] || item['phiênâm'] || item['cáchđọc'] || '';
            let meaning = item['ýnghĩa'] || item['nghĩatiếngviệt'] || item['nghĩa'] || item['meaning'] || item['nghia'] || item['tiếngviệt'] || '';
            
            // Tự động nhận diện nếu không khớp bất kỳ cột nào nhưng có dữ liệu (ít nhất 2 cột)
            if (!word && !kanji && !meaning && values.length >= 2) {
                word = values[0] || '';
                if (values.length >= 3) {
                    kanji = values[1] || '';
                    meaning = values[2] || '';
                } else {
                    meaning = values[1] || '';
                }
            }

            // Nếu word (Kanji) trống nhưng có cách đọc (từ chỉ có Hiragana), lấy luôn cách đọc làm word
            const finalWord = String(word).trim() || String(kanji).trim();
            const finalKanji = String(kanji).trim();
            
            return { 
                word: finalWord, 
                kanji: finalKanji, 
                meaning: String(meaning).trim() 
            };
        }).filter(item => item.word);

        if (normalizedData.length === 0) {
            return messageApi.error('Không tìm thấy cột hợp lệ (ví dụ: KANJI hoặc Từ vựng) trong file.');
        }

        setJsonData(normalizedData);
        messageApi.success(`Đã đọc ${normalizedData.length} từ vựng từ file!`);
      } catch (err) {
        messageApi.error('Lỗi khi đọc file: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!examMonth || !examYear) {
        return messageApi.error('Vui lòng chọn tháng và điền năm thi (VD: Tháng 7, Năm 2024)');
    }
    if (jsonData.length === 0) {
        return messageApi.error('Vui lòng upload file dữ liệu');
    }

    const period = `${examMonth}/${examYear}`;

    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/jlpt-vocabs/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            examPeriod: period,
            level: level,
            vocabs: jsonData
        }),
      });

      if (!response.ok) {
        throw new Error(`Server lỗi: ${response.status}`);
      }

      messageApi.success(`Import thành công ${jsonData.length} từ vựng cho đợt thi ${period}!`);
      setJsonData([]);
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImport = async () => {
    if (!examMonth || !examYear) {
        return messageApi.error('Vui lòng chọn tháng và điền năm thi (VD: Tháng 7, Năm 2024)');
    }
    const period = `${examMonth}/${examYear}`;
    
    if (!window.confirm(`Bạn có chắc chắn muốn HOÀN TÁC (xóa) toàn bộ dữ liệu import của đợt thi ${period} (${level}) không?`)) {
        return;
    }

    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/jlpt-vocabs/import?examPeriod=${period}&level=${level}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Server lỗi: ${response.status}`);
      }

      messageApi.success(`Đã xóa thành công toàn bộ dữ liệu của đợt thi ${period} (${level})!`);
    } catch (error) {
      messageApi.error(`Lỗi khi xóa: ${error.message}`);
    } finally {
      setIsLoading(false);
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
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">/ JLPT Từ Vựng</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Tự động hóa cập nhật tần suất xuất hiện từ vựng trong đề thi JLPT thực tế.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
                    1. Chọn Đợt Thi
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-450 mb-2">Cấp độ (Level)</label>
                        <Select
                            placeholder="Cấp độ"
                            className="w-full h-12 custom-select"
                            onChange={setLevel}
                            value={level}
                            options={[
                                { value: 'N1', label: 'N1' },
                                { value: 'N2', label: 'N2' },
                                { value: 'N3', label: 'N3' },
                                { value: 'N4', label: 'N4' },
                                { value: 'N5', label: 'N5' }
                            ]}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-450 mb-2">Tháng thi</label>
                        <Select
                            placeholder="Tháng"
                            className="w-full h-12 custom-select"
                            onChange={setExamMonth}
                            value={examMonth}
                            options={[
                                { value: '7', label: 'Tháng 7 (T7)' },
                                { value: '12', label: 'Tháng 12 (T12)' }
                            ]}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-450 mb-2">Năm thi</label>
                        <input
                            type="number"
                            placeholder="VD: 2024"
                            className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-all font-medium text-sm text-slate-900 dark:text-white"
                            onChange={(e) => setExamYear(e.target.value)}
                            value={examYear}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
                    2. Tải File Excel/CSV
                </h2>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 flex flex-col items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 transition-all group shadow-sm active:scale-95"
                >
                    <UploadCloud size={24} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                    <span className="font-bold text-xs uppercase tracking-widest text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white mt-2">Upload File Dữ Liệu</span>
                    <span className="text-[9px] font-medium text-slate-400 normal-case font-sans">Hỗ trợ .xlsx, .csv (cột: KANJI, CÁCH ĐỌC, Ý NGHĨA)</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />

                {jsonData.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl">
                        <CheckCircle size={18} />
                        <span>Đã tải {jsonData.length} từ vựng sẵn sàng import.</span>
                    </div>
                )}
            </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
            <button
                onClick={handleImport}
                disabled={isLoading || jsonData.length === 0 || !examMonth || !examYear || !level}
                className="flex-1 py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-slate-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex justify-center items-center animate-all"
            >
                {isLoading && (
                    <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin mr-3"></div>
                )}
                {isLoading ? 'Đang Xử Lý...' : 'Xác nhận Import'}
            </button>
            <button
                onClick={handleDeleteImport}
                disabled={isLoading || !examMonth || !examYear || !level}
                className="md:w-64 py-5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-red-100 dark:hover:bg-red-900/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex justify-center items-center"
            >
                Hoàn tác (Xóa) Import
            </button>
        </div>

      </div>
    </div>
  );
}
