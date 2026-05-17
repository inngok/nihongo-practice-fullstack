import React from 'react';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center pt-36 md:pt-24 pb-16 px-4 md:px-6 font-sans relative selection:bg-slate-900 selection:text-white">
      
      <div className="w-full max-w-5xl relative z-10">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-8"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          QUAY LẠI
        </button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-slate-100 pb-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 uppercase">Phân Biệt Ngữ Pháp</h1>
            <p className="text-sm text-slate-500 max-w-xl font-medium leading-relaxed">
              Tài liệu tổng hợp tinh hoa ngữ pháp N3. Phân biệt các mẫu dễ nhầm lẫn để nắm vững kiến thức trọng tâm.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
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
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fade-in 0.4s ease-out forwards; }
      `}} />
    </div>
  );
}
