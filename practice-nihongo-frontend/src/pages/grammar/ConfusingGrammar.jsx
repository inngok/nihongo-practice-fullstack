import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Info, CheckCircle2, Gauge, BookOpen, Star, Crown, HelpCircle } from 'lucide-react';
import { keigoMasterGuide } from './data/keigoData';

const confusionData = [
  {
    pattern: '～てもいい',
    literal: '...cũng được',
    usage: 'Được phép',
    intensity: 'Cho phép',
    color: 'slate',
    description: 'Dùng khi muốn cho phép ai đó làm việc gì hoặc xin phép làm việc gì.',
    intensityValue: 40
  },
  {
    pattern: '～てはいけない',
    literal: '...thì không được',
    usage: 'Cấm',
    intensity: 'Cấm đoán tuyệt đối',
    color: 'slate',
    description: 'Dùng để đưa ra mệnh lệnh cấm đoán mạnh mẽ, thường dựa trên quy tắc hoặc đạo đức.',
    intensityValue: 100
  },
  {
    pattern: '～なければならない',
    literal: 'nếu không... thì không được',
    usage: 'Phải',
    intensity: 'Bắt buộc 100%',
    color: 'slate',
    description: 'Diễn tả nghĩa vụ hoặc sự cần thiết phải thực hiện một hành động nào đó.',
    intensityValue: 100
  },
  {
    pattern: '～なくてもいい',
    literal: 'dù không... cũng được',
    usage: 'Không cần thiết',
    intensity: 'Tự do lựa chọn',
    color: 'slate',
    description: 'Diễn tả việc không cần thiết phải làm gì, cho phép người nghe tự do lựa chọn.',
    intensityValue: 20
  },
  {
    pattern: '～たほうがいい',
    literal: 'phía đã... thì tốt',
    usage: 'Nên',
    intensity: 'Khuyên bảo mạnh',
    color: 'slate',
    description: 'Dùng để đưa ra lời khuyên mạnh mẽ hoặc cảnh báo điều gì đó nên làm.',
    intensityValue: 80
  },
  {
    pattern: '～ないほうがいい',
    literal: 'phía không... thì tốt',
    usage: 'Không nên',
    intensity: 'Khuyên bảo mạnh',
    color: 'slate',
    description: 'Dùng để đưa ra lời khuyên mạnh mẽ về việc không nên thực hiện hành động nào đó.',
    intensityValue: 80
  }
];

export default function ConfusingGrammar() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('confusion');

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center pt-20 md:pt-24 pb-16 px-4 md:px-6 font-sans relative selection:bg-slate-900 selection:text-white">
      
      <div className="w-full max-w-5xl relative z-10">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-8"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Quay lại
        </button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-slate-100 pb-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 uppercase">Phân Biệt & Kính Ngữ</h1>
            <p className="text-sm text-slate-500 max-w-xl font-medium leading-relaxed">
              Tài liệu tổng hợp tinh hoa ngữ pháp N3. Phân biệt các mẫu dễ nhầm lẫn và làm chủ hệ thống Kính ngữ chuyên sâu.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto">
            {['confusion', 'keigo'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                  ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab === 'confusion' ? 'Phân Biệt' : 'Kính Ngữ Master'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        {activeTab === 'confusion' ? (
          <div className="space-y-3 animate-in fade-in duration-500">
            {/* Minimal Header */}
            <div className="grid grid-cols-12 gap-4 px-6 mb-2 hidden md:grid">
              <div className="col-span-4 text-[9px] font-bold uppercase tracking-widest text-slate-400 italic">Ngữ pháp / Ý nghĩa</div>
              <div className="col-span-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">Cách sử dụng</div>
              <div className="col-span-4 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">Mức độ</div>
            </div>

            {confusionData.map((item, index) => (
              <div 
                key={index}
                className="group relative bg-white border border-slate-100 rounded-2xl p-6 hover:border-slate-300 hover:bg-slate-50/30 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  <div className="col-span-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-0.5">{item.pattern}</h3>
                    <p className="text-xs text-slate-400 italic font-medium">{item.literal}</p>
                  </div>
                  
                  <div className="col-span-4">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{item.usage}</span>
                  </div>

                  <div className="col-span-4 flex justify-end items-center gap-4">
                    <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden hidden md:block">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: `${item.intensityValue}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{item.intensityValue}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {keigoMasterGuide.sections.map((section, idx) => (
              <div key={section.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:border-slate-200 transition-all">
                <div className="p-6 border-b border-slate-50 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
                    <p className="text-xs text-slate-400 font-medium">{section.concept || section.note}</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">#{idx + 1}</span>
                </div>

                <div className="p-6 space-y-8">
                  {/* Subject Info */}
                  {section.subject && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg">
                      <span className="text-[9px] font-bold uppercase tracking-widest">Chủ ngữ: {section.subject}</span>
                    </div>
                  )}

                  {/* Rendering logic - Simple Grid */}
                  {section.categories && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {section.categories.map((cat, i) => (
                         <div key={i} className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                              {cat.type}
                            </h4>
                            {cat.rule && <div className="p-3 bg-slate-50 border-l-2 border-slate-200 text-[10px] font-bold text-slate-500 leading-relaxed rounded-r-lg">{cat.rule}</div>}
                            <div className="space-y-3">
                              {cat.structures.map((st, j) => (
                                <div key={j} className="group border-b border-slate-50 pb-3 last:border-0">
                                  <code className="text-sm font-bold text-slate-900 block mb-1">{st.pattern}</code>
                                  <p className="text-[10px] text-slate-400 font-medium italic">{st.usage}</p>
                                </div>
                              ))}
                            </div>
                         </div>
                      ))}
                    </div>
                  )}

                  {section.levels && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {section.levels.map((lv, i) => (
                        <div key={i} className={`p-5 rounded-xl border border-slate-100 ${i === 2 ? 'bg-slate-900 text-white' : 'bg-slate-50'}`}>
                          <span className="text-[9px] font-bold uppercase tracking-widest block mb-4 opacity-50">{lv.label}</span>
                          <div className="space-y-2">
                            {lv.patterns.map((p, j) => (
                              <div key={j} className="text-sm font-bold tracking-tight opacity-90">{p}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.rules && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {section.rules.map((rule, i) => (
                        <div key={i} className="space-y-3 p-5 bg-slate-50 rounded-xl border border-slate-100">
                          <code className="text-sm font-bold text-slate-900 block bg-white p-2 rounded-lg border border-slate-100">{rule.formula}</code>
                          <p className="text-xs font-bold text-slate-500 italic pl-3 border-l-2 border-slate-200">{rule.example}</p>
                          <p className="text-[9px] text-slate-400 font-medium">{rule.note}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.warning && (
                    <div className="p-4 bg-slate-900 text-white rounded-xl flex gap-3 items-start">
                      <AlertCircle className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold leading-relaxed">{section.warning}</p>
                      </div>
                    </div>
                  )}

                  {section.verbs && (
                    <div className="overflow-x-auto rounded-xl border border-slate-50">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Gốc</th>
                            <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-900 border-x border-slate-100">Tôn kính</th>
                            <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Khiêm nhường</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {section.verbs.map((v, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 text-xs font-bold text-slate-400">{v.basic}</td>
                              <td className="p-4 text-xs font-bold text-slate-900 border-x border-slate-50">{v.sonkei}</td>
                              <td className="p-4 text-xs font-medium text-slate-400 italic">{v.kenjou}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {section.errors && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {section.errors.map((err, i) => (
                        <div key={i} className="p-5 border border-slate-100 rounded-2xl space-y-3">
                          <h4 className="text-[10px] font-bold uppercase text-slate-900 tracking-wider flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                             {err.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{err.desc}</p>
                          <div className="space-y-2 pt-2 text-[10px] font-bold">
                             <div className="p-2 bg-slate-50 rounded-lg text-slate-400 line-through">{err.wrong || err.cau_sai}</div>
                             <div className="p-2 bg-slate-900 rounded-lg text-white">{err.correct || err.cau_dung}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
