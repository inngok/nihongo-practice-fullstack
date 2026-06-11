import React from 'react';
import { Search, Volume2 } from 'lucide-react';

export default function StudyMenu({
  activeData,
  isShuffle,
  handleToggleShuffle,
  setActiveMode,
  setCurrentIndex,
  uniqueLessons,
  selectedLesson,
  setSelectedLesson,
  searchTerm,
  setSearchTerm,
  toggleExpand,
  expandedId,
  playAudio
}) {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Selection grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-900 pb-3">
          <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">CHỌN CHẾ ĐỘ HỌC</p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">XÁO TRỘN</span>
            <button
              onClick={handleToggleShuffle}
              className={`relative w-12 h-6 rounded-full transition-all duration-500 shadow-inner ${isShuffle ? 'bg-black dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-500 shadow-sm ${isShuffle ? 'left-7 bg-white dark:bg-black' : 'left-1 bg-white dark:bg-black'}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'cards', label: 'FLASHCARD' },
            { id: 'quiz', label: 'LUYỆN TẬP' },
            { id: 'multiple_choice', label: 'TRẮC NGHIỆM' },
            { id: 'listening', label: 'NGHE ĐIỀN' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => {
                setActiveMode(m.id);
                setCurrentIndex(0);
              }}
              className="flex items-center justify-center py-4 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-slate-950 transition-all duration-300 hover:shadow-md active:scale-95 group"
            >
              <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Integrated Grammar List Section */}
      <div id="grammar-list-section" className="space-y-6 pt-6 border-t border-slate-50 dark:border-slate-900">
        <div className="flex justify-between items-center pb-1">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white uppercase italic">DANH SÁCH NGỮ PHÁP</h2>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">NHẤN VÀO CẤU TRÚC ĐỂ XEM CHI TIẾT VÍ DỤ</p>
          </div>
        </div>

        {uniqueLessons.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]">CHỌN BÀI HỌC</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedLesson('');
                  setCurrentIndex(0);
                }}
                className={`px-5 py-2 rounded-2xl text-[11px] font-black transition-all ${
                  selectedLesson === ''
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105' 
                    : 'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                TẤT CẢ
              </button>
              {uniqueLessons.map(lesson => (
                <button
                  key={lesson}
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setCurrentIndex(0);
                  }}
                  className={`px-5 py-2 rounded-2xl text-[11px] font-black transition-all ${
                    selectedLesson === lesson 
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105' 
                      : 'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  BÀI {lesson}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm cấu trúc..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-transparent outline-none font-medium text-slate-900 dark:text-white text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          {activeData.filter(i => i.pattern.toLowerCase().includes(searchTerm.toLowerCase())).map((item, idx) => (
            <div
              key={item.id}
              onClick={() => toggleExpand(item.id)}
              className={`p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer select-none ${expandedId === item.id ? 'border-black dark:border-white ring-2 ring-black/5 dark:ring-white/5 shadow-lg' : 'hover:shadow-md'
                }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-[200px]">
                  <span className="text-xs font-black text-slate-200 dark:text-slate-700 w-6 shrink-0 mt-1">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold italic tracking-tight text-slate-900 dark:text-white break-words">{item.pattern}</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1 break-words leading-snug">{item.meaning}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                    Bài {item.unit || 1}
                    {item.day ? ` - Ngày ${item.day}` : ''}
                  </div>
                  <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                    {item.level || 'N3'}
                  </div>
                </div>
              </div>

              {/* Expandable Section */}
              <div className={`overflow-hidden transition-all duration-300 ${expandedId === item.id ? 'max-h-96 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-4">
                  {item.explanation && (
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cách dùng & Giải thích</h4>
                      <p className="text-sm md:text-[15px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{item.explanation}</p>
                    </div>
                  )}
                  {item.exampleSentence && (() => {
                    let normalizedJp = item.exampleSentence.replace(/\\n/g, '\n');
                    normalizedJp = normalizedJp.replace(/(。|！|？)(\s*)/g, '$1\n');
                    const jpLines = normalizedJp.split('\n').map(s => s.trim()).filter(Boolean);

                    let normalizedVn = item.exampleMeaning ? item.exampleMeaning.replace(/\\n/g, '\n') : '';
                    normalizedVn = normalizedVn.replace(/(\.|!|\?)(\s+)/g, '$1\n');
                    const vnLines = normalizedVn.split('\n').map(s => s.trim()).filter(Boolean);
                    return (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ví dụ thực tế</h4>
                        <div className="space-y-2">
                          {jpLines.map((jpLine, lineIdx) => {
                            const vnLine = vnLines[lineIdx] || '';
                            return (
                              <div key={lineIdx} className="bg-slate-50/50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-900 flex items-start justify-between gap-3 group/ex">
                                <div className="space-y-1.5 flex-1">
                                  <p className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">{jpLine}</p>
                                  {vnLine && (
                                    <p className="text-xs md:text-sm italic text-slate-500 dark:text-slate-400 leading-relaxed">{vnLine}</p>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => playAudio(e, jpLine)}
                                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors group/audio shrink-0 mt-0.5"
                                  title="Nghe phát âm"
                                >
                                  <Volume2 className="w-4 h-4 text-slate-400 group-hover/audio:text-slate-900 dark:group-hover/audio:text-white" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
