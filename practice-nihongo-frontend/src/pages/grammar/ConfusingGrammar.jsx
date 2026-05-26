import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { message } from 'antd';

export default function ConfusingGrammar() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const res = await apiClient.get('/confusing-grammars');
      setGroups(res.data);
      if (res.data.length > 0) {
        setSelectedGroup(res.data[0]);
      }
    } catch (err) {
      console.error('Lỗi tải nhóm ngữ pháp:', err);
      message.error('Không thể tải danh sách nhóm ngữ pháp.');
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 flex flex-col items-center pt-28 md:pt-32 pb-16 px-4 md:px-6 font-sans relative selection:bg-slate-900 selection:text-white">
      
      <div className="w-full max-w-6xl relative z-10">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          QUAY LẠI HỌC TẬP
        </button>

        {/* Header Section */}
        <div className="mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block mb-3">TÀI LIỆU NÂNG CAO</span>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                Phân Biệt Ngữ Pháp
              </h1>
              <p className="text-sm text-slate-450 dark:text-slate-500 max-w-xl font-bold mt-3 leading-relaxed">
                Học sâu các mẫu cấu trúc dễ nhầm lẫn thông qua sự so sánh tương quan, sắc thái chuyên sâu và các câu ví dụ đối chiếu trực quan.
              </p>
            </div>
          </div>
        </div>

        {loadingGroups ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-8 h-8 border-3 border-slate-100 dark:border-slate-800 border-t-black dark:border-t-white rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Đang tải cơ sở dữ liệu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Side: Groups Category Navigation (col-span-4) */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-[9px] font-black text-slate-350 dark:text-slate-650 uppercase tracking-[0.2em] block mb-2">DANH SÁCH NHÓM PHÂN BIỆT</span>
              <div className="space-y-2">
                {groups.map((group) => {
                  const isActive = selectedGroup?.id === group.id;
                  return (
                    <div
                      key={group.id}
                      onClick={() => handleSelectGroup(group)}
                      className={`cursor-pointer rounded-xl p-4 border text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-950 border-slate-950 text-white dark:bg-white dark:border-white dark:text-black shadow-md'
                          : 'bg-white border-slate-100 text-slate-900 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-extrabold text-xs leading-snug">{group.title}</h3>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white dark:bg-black/10 dark:text-black'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-450'
                        }`}>
                          {group.items?.length || 0} mẫu
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Grammar Points Grid & AI Detailed Explanation (col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              {selectedGroup ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Selected Group Header */}
                  <div className="text-left pb-2">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">{selectedGroup.title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold max-w-2xl">
                      {selectedGroup.description}
                    </p>
                  </div>

                  {/* List of Grammar Items (Unified in a clean container) */}
                  <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl divide-y divide-slate-100 dark:divide-slate-850 shadow-sm">
                    {selectedGroup.items?.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
                      >
                        {/* Pattern and short meaning */}
                        <div className="flex-1 min-w-[200px]">
                          <span className="text-base font-extrabold text-slate-900 dark:text-white block mb-0.5">{item.pattern}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 italic font-bold">{item.baseMeaning}</span>
                        </div>
                        
                        {/* Nuance & Similarity Percentage */}
                        <div className="flex items-center justify-between sm:justify-end gap-6">
                          <span className="inline-block text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2.5 py-1 rounded-md uppercase tracking-wider">
                            {item.nuance}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden hidden md:block">
                              <div
                                className="h-full bg-slate-400 dark:bg-slate-550 rounded-full"
                                style={{ width: `${item.similarityPercentage || 50}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-650 min-w-[28px] text-right">
                              {item.similarityPercentage || 50}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pre-saved AI Analysis Block (if explanation or tip is present) */}
                  {(selectedGroup.explanation || selectedGroup.tip) && (
                    <div className="border-0 border-t border-slate-100 dark:border-slate-800 pt-8 mt-8 space-y-8 animate-in fade-in duration-500 text-left">
                      
                      {/* Section Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-black text-white dark:bg-white dark:text-black">
                            <span className="text-[10px] font-black">AI</span>
                          </span>
                          <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">
                            PHÂN TÍCH CHUYÊN GIA
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">DỮ LIỆU ĐÃ KIỂM DUYỆT</span>
                      </div>

                      {/* Section 1: Detailed comparison */}
                      {selectedGroup.explanation && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-black tracking-widest text-slate-450 dark:text-slate-500 uppercase">
                            SO SÁNH BẢN CHẤT & SẮC THÁI
                          </h3>
                          <div className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-semibold space-y-3 whitespace-pre-line">
                            {selectedGroup.explanation}
                          </div>
                        </div>
                      )}

                      {/* Section 2: Contrast examples */}
                      {selectedGroup.items && selectedGroup.items.some(item => item.exampleSentence) && (
                        <div className="space-y-4">
                          <h3 className="text-xs font-black tracking-widest text-slate-450 dark:text-slate-500 uppercase">
                            VÍ DỤ ĐỐI CHIẾU THỰC TẾ
                          </h3>
                          <div className="space-y-4">
                            {selectedGroup.items
                              .filter(item => item.exampleSentence)
                              .map((item, idx) => (
                                <div key={idx} className="border-l-2 border-slate-200 dark:border-slate-800 pl-4 py-1">
                                  <span className="inline-block text-[9px] font-black px-1.5 py-0.5 bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400 rounded uppercase tracking-widest mb-1.5">
                                    {item.pattern}
                                  </span>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                                    {item.exampleSentence}
                                  </p>
                                  {item.exampleRomaji && (
                                    <p className="text-[10px] text-slate-400 dark:text-slate-600 font-semibold tracking-wide italic mt-0.5">
                                      {item.exampleRomaji}
                                    </p>
                                  )}
                                  {item.exampleTranslation && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mt-1">
                                      {item.exampleTranslation}
                                    </p>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Section 3: AI Tip card */}
                      {selectedGroup.tip && (
                        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 rounded-xl p-5 flex items-start gap-4">
                          <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-black">
                            !
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">MẸO NHỚ NHANH</h4>
                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-350 font-semibold">
                              {selectedGroup.tip}
                            </p>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              ) : (
                <div className="py-32 text-center border-2 border-dashed border-slate-100 dark:border-slate-850 rounded-[2rem]">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Vui lòng chọn một nhóm để phân biệt</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fade-in 0.4s ease-out forwards; }
      `}} />
    </div>
  );
}
