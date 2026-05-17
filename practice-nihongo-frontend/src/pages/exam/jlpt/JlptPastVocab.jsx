import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';
import { Flame, Star, Search, RefreshCw, ChevronLeft, Calendar } from 'lucide-react';
import { message, Select } from 'antd';
import { Link } from 'react-router-dom';

export default function JlptPastVocab() {
  const [vocabs, setVocabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedFreq, setSelectedFreq] = useState('all');
  
  useEffect(() => {
    fetchVocabs();
  }, []);

  const fetchVocabs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/jlpt-vocabs`);
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu từ vựng JLPT');
      }
      const data = await response.json();
      setVocabs(data);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Extract all unique exam periods in reverse chronological order
  const uniquePeriods = Array.from(
    new Set(
      vocabs
        .flatMap(v => v.examHistory ? v.examHistory.split(',').map(s => s.trim()) : [])
    )
  ).sort((a, b) => {
    const [m1, y1] = a.split('/').map(Number);
    const [m2, y2] = b.split('/').map(Number);
    if (y1 !== y2) return y2 - y1;
    return m2 - m1;
  });

  const filteredVocabs = vocabs.filter(v => {
    // Search match
    const matchesSearch = v.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (v.kanji && v.kanji.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.meaning && v.meaning.toLowerCase().includes(searchTerm.toLowerCase()));
      
    // Period match
    const matchesPeriod = selectedPeriod === 'all' || 
      (v.examHistory && v.examHistory.split(',').map(s => s.trim()).includes(selectedPeriod));
      
    // Frequency match
    let matchesFreq = true;
    if (selectedFreq === 'hot') {
      matchesFreq = v.appearanceCount >= 3;
    } else if (selectedFreq === 'warm') {
      matchesFreq = v.appearanceCount >= 2;
    }
    
    return matchesSearch && matchesPeriod && matchesFreq;
  });

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 pt-24 pb-16 px-6 md:px-12 font-sans selection:bg-slate-200 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/exam-jlpt"
            className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 hover:text-slate-955 dark:hover:text-white transition-colors uppercase"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Quay lại
          </Link>
        </div>

        {/* Premium Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 mb-8">
          <div className="space-y-1.5">
            <span className="text-[9px] tracking-[0.3em] font-bold text-slate-350 dark:text-slate-500 uppercase block">Đề thi thực tế</span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight italic uppercase">
              Từ Vựng JLPT Đã Thi
            </h1>
            <p className="text-slate-400 dark:text-slate-500 font-medium text-xs md:text-sm max-w-xl italic leading-relaxed">
              Tổng hợp các từ vựng và chữ Hán đã từng xuất hiện trong đề thi JLPT thực tế.
            </p>
          </div>
          
          {/* Controls Toolbar with Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
            {/* Search Input */}
            <div className="relative flex-grow sm:flex-initial sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={15} />
              <input 
                type="text" 
                placeholder="Tìm từ vựng..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:border-slate-300 dark:focus:border-slate-700 transition-all font-medium text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            {/* Filter by Exam Period */}
            <div className="w-36">
              <Select
                placeholder="Đợt thi"
                className="w-full custom-select-small h-10"
                onChange={setSelectedPeriod}
                value={selectedPeriod}
                options={[
                  { value: 'all', label: 'Tất cả đợt thi' },
                  ...uniquePeriods.map(p => ({ value: p, label: `Kỳ thi ${p}` }))
                ]}
              />
            </div>

            {/* Filter by Frequency */}
            <div className="w-36">
              <Select
                placeholder="Mức độ"
                className="w-full custom-select-small h-10"
                onChange={setSelectedFreq}
                value={selectedFreq}
                options={[
                  { value: 'all', label: 'Tất cả mức độ' },
                  { value: 'warm', label: 'Thi ≥ 2 lần' },
                  { value: 'hot', label: 'Thi ≥ 3 lần' }
                ]}
              />
            </div>

            {/* Refresh Button */}
            <button 
              onClick={fetchVocabs}
              disabled={loading}
              className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 h-10 w-10 flex items-center justify-center"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-80 gap-3">
            <div className="w-8 h-8 border-2 border-slate-100 dark:border-slate-800 border-t-slate-900 dark:border-t-white rounded-full animate-spin"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Đang tải dữ liệu...</span>
          </div>
        ) : filteredVocabs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/10">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 flex items-center justify-center shadow-sm text-slate-400 mb-6">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">Không tìm thấy từ vựng nào</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium max-w-sm mt-2 leading-relaxed">
              {vocabs.length === 0 
                ? "Hệ thống chưa có dữ liệu từ vựng JLPT đã thi. Quản trị viên vui lòng truy cập trang Quản lý để tải lên file Excel dữ liệu." 
                : "Không khớp với bất kỳ bộ lọc hoặc từ khóa nào trong danh sách. Hãy thử điều chỉnh bộ lọc hoặc từ khóa nhé!"}
            </p>
            {vocabs.length === 0 && (
              <Link 
                to="/manage/jlpt-vocab"
                className="mt-6 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md active:scale-95"
              >
                Đi tới trang quản lý
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVocabs.map((vocab, index) => {
              const isHot = vocab.appearanceCount >= 3;
              const isWarm = vocab.appearanceCount === 2;
              
              return (
                <div 
                  key={vocab.id} 
                  className="relative group bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-850 rounded-[2rem] p-8 transition-all duration-500 flex flex-col justify-between shadow-[0_10px_40px_-15px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.06)] hover:border-slate-200 dark:hover:border-slate-800 hover:-translate-y-1"
                >
                  
                  {/* Badge Tần Suất */}
                  {vocab.appearanceCount > 1 && (
                    <div className={`absolute -top-3 -right-3 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-md transform rotate-2 group-hover:rotate-4 transition-all duration-300 ${
                      isHot 
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' 
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350 border border-slate-200/50 dark:border-slate-750'
                    }`}>
                      {isHot ? <Flame size={12} className="fill-current animate-pulse text-amber-500" /> : <Star size={12} className="fill-current text-blue-500" />}
                      Thi {vocab.appearanceCount} lần
                    </div>
                  )}

                  {/* Rank STT */}
                  <div className="text-[10px] font-bold text-slate-300 dark:text-slate-700 tracking-widest select-none mb-4 uppercase">
                    Thứ hạng #{index + 1}
                  </div>

                  {/* Content block */}
                  <div className="flex flex-col items-center text-center my-2 flex-grow justify-center">
                    {/* Hán tự / Chữ phụ */}
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block min-h-[16px]">
                      {vocab.kanji || ' '}
                    </span>
                    {/* Từ vựng chính */}
                    <h2 className="text-3xl md:text-4.5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 group-hover:scale-[1.03] transition-transform duration-300">
                      {vocab.word}
                    </h2>
                    {/* Nghĩa */}
                    <div className="inline-flex items-center justify-center px-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                      <span className="text-xs font-extrabold text-slate-650 dark:text-slate-300 uppercase tracking-wider">
                        {vocab.meaning}
                      </span>
                    </div>
                  </div>
                  
                  {/* Exam History block */}
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-850">
                    <div className="flex items-center gap-1.5 justify-center mb-3">
                      <Calendar size={11} className="text-slate-400" />
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Lịch sử đề thi</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {vocab.examHistory?.split(',').map((history, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] font-bold bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-850 px-2 py-0.5 rounded-md hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                        >
                          {history.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
