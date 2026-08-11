import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { message, Select, Modal } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '../../config';
import { CheckCircle } from 'lucide-react';

export default function JlptPastVocabManager() {
  const [examMonth, setExamMonth] = useState('7');
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [level, setLevel] = useState('N3');
  const [jsonData, setJsonData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [bulkInput, setBulkInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const { fetchWithAuth } = useAuth();

  const handleBulkAiProcess = async () => {
    if (!bulkInput.trim()) return messageApi.warning('Vui lòng dán nội dung từ vựng thô');
    setIsAiProcessing(true);
    const hide = messageApi.loading('AI đang xử lý danh sách từ vựng...', 0);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/generate-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bulkInput, type: 'VOCABULARY' })
      });
      
      if (!res.ok) {
        throw new Error(`Server lỗi: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Map AI general vocabulary format { word, reading, meaning }
      // to JLPT format { word, kanji (acts as reading), meaning }
      const mappedData = data.map(item => ({
        word: item.word || '',
        kanji: item.reading || item.hanviet || '', // prioritize reading, fallback to hanviet if it's kanji
        meaning: item.meaning || ''
      })).filter(item => item.word); // remove empty entries
      
      if (mappedData.length === 0) {
        return messageApi.error('Không tìm thấy từ vựng nào hợp lệ.');
      }

      setJsonData(mappedData);
      messageApi.success(`AI đã phân tích xong ${mappedData.length} từ vựng!`);
    } catch (err) {
      messageApi.error('Lỗi khi AI phân tích: ' + err.message);
    } finally {
      setIsAiProcessing(false);
      hide();
    }
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

  const handleDeleteImport = () => {
    if (!examMonth || !examYear) {
        return messageApi.error('Vui lòng chọn tháng và điền năm thi (VD: Tháng 7, Năm 2024)');
    }
    const period = `${examMonth}/${examYear}`;
    
    Modal.confirm({
      title: 'Xác nhận Hoàn tác Import',
      content: `Bạn có chắc chắn muốn HOÀN TÁC (xóa) toàn bộ dữ liệu import của đợt thi ${period} (Cấp độ ${level}) không? Hành động này không thể phục hồi.`,
      okText: 'Xóa dữ liệu',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setIsLoading(true);
        try {
          const response = await fetchWithAuth(`${API_BASE_URL}/jlpt-vocabs/import?examPeriod=${period}&level=${level}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errData = await response.text();
            throw new Error(errData || `Server lỗi: ${response.status}`);
          }

          messageApi.success(`Đã xóa thành công toàn bộ dữ liệu của đợt thi ${period} (${level})!`);
        } catch (error) {
          messageApi.error(`Lỗi khi xóa: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    });
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

            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
                    <ThunderboltOutlined className="text-amber-500" />
                    2. AI Phân Tích Dữ Liệu
                </h2>

                <div className="flex-grow flex flex-col gap-4">
                    <textarea
                        value={bulkInput}
                        onChange={e => setBulkInput(e.target.value)}
                        placeholder="Dán dữ liệu thô vào đây (ví dụ: copy từ PDF, Web... AI sẽ tự động tách cột Cách đọc, Ý nghĩa)."
                        className="w-full h-32 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm resize-none focus:ring-1 focus:ring-slate-400 transition-all custom-scrollbar placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
                    />
                    
                    <button
                        onClick={handleBulkAiProcess}
                        disabled={isAiProcessing || !bulkInput.trim()}
                        className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isAiProcessing ? <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <ThunderboltOutlined />}
                        {isAiProcessing ? 'ĐANG PHÂN TÍCH...' : 'AI XỬ LÝ NHANH'}
                    </button>
                </div>

                {jsonData.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl">
                        <CheckCircle size={18} />
                        <span>Đã tải {jsonData.length} từ vựng sẵn sàng import.</span>
                    </div>
                )}
            </div>
        </div>

        {jsonData.length > 0 && (
          <div className="mt-8 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 overflow-hidden flex flex-col max-h-[500px]">
             <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex justify-between items-center shrink-0">
                <span>3. Bản Xem Trước Dữ Liệu ({jsonData.length} từ)</span>
             </h2>
             <div className="overflow-y-auto custom-scrollbar flex-grow border border-slate-100 dark:border-slate-800 rounded-xl">
               <table className="w-full text-left border-collapse text-xs">
                 <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 border-b border-slate-200 dark:border-slate-800">
                   <tr>
                     <th className="py-4 px-4 font-bold text-slate-500 uppercase tracking-wider text-center w-12">#</th>
                     <th className="py-4 px-4 font-bold text-slate-500 uppercase tracking-wider">Từ vựng (Kanji)</th>
                     <th className="py-4 px-4 font-bold text-slate-500 uppercase tracking-wider">Cách đọc</th>
                     <th className="py-4 px-4 font-bold text-slate-500 uppercase tracking-wider">Ý nghĩa</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-transparent">
                   {jsonData.map((item, idx) => (
                     <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors">
                       <td className="py-4 px-4 text-center font-bold text-slate-300">{idx + 1}</td>
                       <td className="py-4 px-4 font-bold text-slate-900 dark:text-white text-base font-kanji">{item.word}</td>
                       <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">{item.kanji}</td>
                       <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{item.meaning}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

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
