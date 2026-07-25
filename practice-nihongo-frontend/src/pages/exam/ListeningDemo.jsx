import React, { useState, useEffect } from 'react';
import ListeningPlayer from '../../components/ListeningPlayer';
import { useNavigate } from 'react-router-dom';
import { listeningData } from '../../data/listeningData';
import { ChevronRight, Music } from 'lucide-react';

export default function ListeningDemo() {
  const navigate = useNavigate();
  
  const [scriptData, setScriptData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState(listeningData[0].tracks[0]);

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

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 uppercase italic">
              Luyện Nghe
            </h1>
            <p className="text-slate-500 text-sm">JPD326 - Nghe hiểu trung cấp</p>
          </div>

          <div className="space-y-6">
            {listeningData.map((lessonGroup, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-4">
                  {lessonGroup.lesson}
                </h3>
                <div className="space-y-2">
                  {lessonGroup.tracks.map(track => (
                    <button
                      key={track.id}
                      onClick={() => setSelectedTrack(track)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                        selectedTrack.id === track.id
                          ? 'bg-black text-white shadow-lg scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Music size={18} className={selectedTrack.id === track.id ? 'opacity-100' : 'opacity-40'} />
                        <span className="font-bold">{track.title}</span>
                      </div>
                      <ChevronRight size={18} className={selectedTrack.id === track.id ? 'opacity-100' : 'opacity-20'} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải: Trình phát Audio và Script */}
        <div className="w-full lg:w-2/3 flex flex-col">
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
