import React, { useState, useEffect } from 'react';
import ListeningPlayer from '../../components/ListeningPlayer';
import { useNavigate } from 'react-router-dom';
import { listeningData } from '../../data/listeningData';
import { ChevronRight, ChevronDown, Music } from 'lucide-react';

export default function ListeningDemo() {
  const navigate = useNavigate();
  
  const [scriptData, setScriptData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState(listeningData[0].tracks[0]);
  const [activeLesson, setActiveLesson] = useState(listeningData[0].lesson);

  const audioSrc = selectedTrack.audioSrc;
  const scriptArray = selectedTrack.script || [];

  useEffect(() => {
    setLoading(true);
    setScriptData(scriptArray);
    setLoading(false);
  }, [selectedTrack]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-16 px-4 sm:px-6 font-sans">
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Cột trái: Danh sách bài nghe */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-1.5 text-slate-500 hover:text-slate-950 dark:hover:text-white text-xs font-bold uppercase tracking-widest transition-colors mb-8 w-fit"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span> QUAY LẠI
          </button>

          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 uppercase italic">
              Luyện Nghe
            </h1>
            <p className="text-slate-500 text-sm">JPD326 - Nghe hiểu trung cấp</p>
          </div>

          {/* Lesson Tabs - Wrapped */}
          <div className="flex flex-wrap gap-2 mb-6">
            {listeningData.map((lessonGroup, idx) => {
              const isActive = activeLesson === lessonGroup.lesson;
              const lessonName = lessonGroup.lesson.split('-')[1] || lessonGroup.lesson;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveLesson(lessonGroup.lesson)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                    isActive 
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-md shadow-black/20 dark:shadow-white/20 ring-2 ring-black dark:ring-white ring-offset-2 dark:ring-offset-slate-950' 
                      : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {lessonName.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Tracks Card for Active Lesson */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800/60 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900/5 dark:bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-slate-900/10 dark:group-hover:bg-white/10"></div>
            
            <div className="space-y-2 relative z-10 max-h-[250px] lg:max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {listeningData.find(g => g.lesson === activeLesson)?.tracks.map(track => {
                const isActive = selectedTrack.id === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      setSelectedTrack(track);
                      if (window.innerWidth < 1024) {
                        document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${
                      isActive
                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-md shadow-black/20 dark:shadow-white/20 border-transparent scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-white/20 dark:bg-black/10 text-white dark:text-black' : 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-400'}`}>
                        <Music size={14} className={isActive ? 'animate-pulse' : ''} />
                      </div>
                      <span className={`font-bold ${isActive ? 'text-white dark:text-black' : ''}`}>{track.title}</span>
                    </div>
                    <ChevronRight size={16} className={`transition-transform duration-300 ${isActive ? 'opacity-100 translate-x-1' : 'opacity-30'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cột phải: Trình phát Audio và Script */}
        <div id="player-section" className="w-full lg:w-2/3 flex flex-col scroll-mt-6">
        {loading ? (
          <div className="text-center py-20 text-slate-500">Đang tải dữ liệu script...</div>
        ) : (
          <ListeningPlayer 
            audioSrc={audioSrc}
            scriptData={scriptData}
          />
        )}
        </div>
      </div>
    </div>
  );
}
