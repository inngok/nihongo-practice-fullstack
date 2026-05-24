import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import kanjiService from '../../api/kanjiService';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function KanjiStudy() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('bookId');
  const { fetchWithAuth, currentUser } = useAuth();

  const [kanjiData, setKanjiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState('list');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isShuffle, setIsShuffle] = useState(false);

  useEffect(() => {
    if (bookId) {
      fetchKanji();
    }
  }, [bookId]);

  const fetchKanji = async () => {
    try {
      setLoading(true);
      const response = await kanjiService.getAll({ bookId });
      const data = response.data || [];
      setKanjiData(data);
      if (data.length > 0) {
        const weeks = [...new Set(data.map(i => i.week || 1))].sort((a, b) => a - b);
        setSelectedWeek(weeks[0] || 1);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching kanji:', error);
      setKanjiData([]);
      setLoading(false);
    }
  };

  const uniqueWeeks = useMemo(() => {
    if (!Array.isArray(kanjiData)) return [];
    return [...new Set(kanjiData.map(i => i.week || 1))].sort((a, b) => a - b);
  }, [kanjiData]);

  const activeData = useMemo(() => {
    if (!Array.isArray(kanjiData)) return [];
    let data = kanjiData.filter(i => (i.week || 1) === selectedWeek);
    if (isShuffle) return [...data].sort(() => Math.random() - 0.5);
    return data;
  }, [kanjiData, selectedWeek, isShuffle]);

  useEffect(() => {
    // Reset states when changing modes if needed
  }, [activeData, activeMode]);

  // Sync Progress to Backend
  const progressKey = `kanji_${bookId}_${selectedWeek}`;

  useEffect(() => {
    if (currentUser && activeData.length > 0 && bookId) {
       fetchWithAuth(`${API_BASE_URL}/progress/${progressKey}`)
         .then(res => res.json())
         .then(resData => {
            if (resData.data) {
               try {
                  const state = JSON.parse(resData.data);
                  if (state.currentIndex !== undefined && state.currentIndex < activeData.length) {
                     setCurrentIndex(state.currentIndex);
                  }
               } catch(e) {}
            }
         }).catch(() => {});
    }
  }, [bookId, selectedWeek, activeData.length, currentUser]);

  useEffect(() => {
    if (currentUser && bookId && activeMode !== 'list') {
        const state = { activeMode };
        fetchWithAuth(`${API_BASE_URL}/progress/${progressKey}`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ data: JSON.stringify(state) })
        }).catch(() => {});
    }
  }, [activeMode, bookId, selectedWeek, currentUser]);

  const ListScreen = (
    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
      <div className="relative group max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 w-5 h-5 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
        <input
          type="text"
          placeholder="Tìm kiếm hán tự..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border-b-2 border-slate-100 dark:border-slate-800 bg-transparent focus:border-black dark:focus:border-white outline-none font-medium text-slate-900 dark:text-white transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeData
          .filter(i => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return true;
            return i.character.toLowerCase().includes(term) || 
                   i.meaning.toLowerCase().includes(term) || 
                   (i.hanviet && i.hanviet.toLowerCase().includes(term));
          })
          .map((item) => (
            <div
              key={item.id}
              className="group p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] hover:border-black dark:hover:border-white transition-all shadow-sm hover:shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-6xl font-black text-slate-900 dark:text-white font-kanji">{item.character}</span>
                <span className="text-[10px] font-black text-slate-200 dark:text-slate-800 uppercase tracking-widest">#{item.id}</span>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black italic text-slate-900 dark:text-white uppercase tracking-tight">{item.hanviet}</h3>
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-500">{item.meaning}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div>
                    <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1">On-yomi</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.onyomi || '---'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1">Kun-yomi</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.kunyomi || '---'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-4 sm:px-6 md:px-20 pt-32 pb-10 transition-colors">
      {loading ? (
        <div className="flex-grow flex items-center justify-center py-40">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-black dark:border-slate-800 dark:border-t-white rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top Bar */}
          <button 
            onClick={() => navigate('/kanji')}
            className="group flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-black dark:hover:text-white uppercase tracking-widest transition-all mb-4"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> QUAY LẠI
          </button>

          {/* Header */}
          <div className="relative pl-8">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black dark:bg-white rounded-full" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
              HÁN TỰ - TUẦN {selectedWeek}
            </h1>
            <p className="text-xs font-bold text-slate-300 dark:text-slate-600 mt-1 uppercase tracking-widest">
              {kanjiData[0]?.book?.title || 'KANJI STUDY SYSTEM'}
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-t border-slate-50 dark:border-slate-900 pt-10">
            <div className="space-y-4 w-full md:w-auto">
              <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">CHỌN TUẦN HỌC</p>
              <div className="flex flex-wrap gap-2">
                {uniqueWeeks.map(week => (
                  <button
                    key={week}
                    onClick={() => { setSelectedWeek(week); setActiveMode('list'); }}
                    className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${
                      selectedWeek === week 
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105' 
                        : 'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    TUẦN {week}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center bg-slate-50/50 dark:bg-slate-900/50 p-1.5 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800 w-full sm:w-auto justify-between sm:justify-start">
              {[
                { id: 'list', label: 'DANH SÁCH' },
                { id: 'flashcard', label: 'FLASHCARD' },
                { id: 'quiz', label: 'LUYỆN TẬP' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setActiveMode(m.id)}
                  className={`flex-1 sm:flex-none px-2 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest transition-all text-center ${
                    activeMode === m.id 
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xl' 
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="pt-4 pb-20">
            {activeMode === 'list' ? ListScreen : (
               <div className="py-20 text-center italic text-slate-400">Chế độ học bài đang được cập nhật...</div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.5s ease-out forwards; }
      `}} />
    </div>
  );
}
