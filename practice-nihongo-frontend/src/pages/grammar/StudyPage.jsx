import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Check, Volume2, Search, X } from 'lucide-react';
import grammarService from '../../api/grammarService';

export default function StudyPage() {
  const { bookId } = useParams();
  const [searchParams] = useSearchParams();
  const targetBookId = bookId || searchParams.get('bookId');
  const navigate = useNavigate();

  const [grammarData, setGrammarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState('menu');
  const [selectedUnit, setSelectedUnit] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [completedIds, setCompletedIds] = useState([]);

  useEffect(() => {
    fetchGrammar();
  }, [targetBookId]);

  const fetchGrammar = async () => {
    try {
      const response = await grammarService.getAll();
      let data = response.data;
      if (targetBookId) {
        data = data.filter(item => item.book && String(item.book.id) === String(targetBookId));
      }
      const mapped = data.map(item => ({
        ...item,
        pattern: item.structure,
        unit: parseInt(item.week || item.unit || item.lesson || 1),
        examples: [{ jp: item.exampleSentence, vn: item.exampleMeaning }],
        quiz: { sentence: item.exampleSentence, translation: item.exampleMeaning, answer: item.structure }
      }));
      setGrammarData(mapped);
      if (mapped.length > 0) {
        const units = [...new Set(mapped.map(i => i.unit))].sort((a, b) => a - b);
        setSelectedUnit(units[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const activeData = useMemo(() => {
    let data = grammarData;
    if (isShuffle) return [...data].sort(() => Math.random() - 0.5);
    return data;
  }, [grammarData, isShuffle]);

  const MenuScreen = (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-900 pb-4">
        <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">CHỌN CHẾ ĐỘ HỌC</p>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">XÁO TRỘN</span>
          <button 
            onClick={() => setIsShuffle(!isShuffle)}
            className={`relative w-12 h-6 rounded-full transition-all duration-500 shadow-inner ${isShuffle ? 'bg-black' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-500 shadow-sm ${isShuffle ? 'left-7 bg-white' : 'left-1 bg-white'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { id: 'flashcard', label: 'GHI NHỚ' },
          { id: 'cards', label: 'FLASHCARD' },
          { id: 'quiz', label: 'LUYỆN TẬP' },
          { id: 'multiple_choice', label: 'TRẮC NGHIỆM' },
          { id: 'listening', label: 'NGHE ĐIỀN' },
          { id: 'list', label: 'DANH SÁCH' }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setActiveMode(m.id)}
            className="flex items-center justify-center py-10 px-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] hover:border-black dark:hover:border-white transition-all duration-300 hover:shadow-2xl active:scale-95"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const ListScreen = (
    <div className="space-y-8 animate-in fade-in duration-500">
       <button onClick={() => setActiveMode('menu')} className="text-[10px] font-black text-slate-400 hover:text-black transition-colors">← QUAY LẠI MENU</button>
       <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          <input 
            type="text" placeholder="Tìm kiếm cấu trúc..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-b border-slate-100 bg-transparent outline-none font-medium"
          />
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeData.filter(i => i.pattern.toLowerCase().includes(searchTerm.toLowerCase())).map((item, idx) => (
            <div key={item.id} className="flex items-center justify-between p-7 bg-white border border-slate-100 rounded-[2rem] hover:border-black transition-all">
               <div className="flex items-center gap-6">
                  <span className="text-[10px] font-black text-slate-100 w-6">{(idx+1).toString().padStart(2,'0')}</span>
                  <div>
                    <h3 className="text-xl font-bold italic tracking-tight">{item.pattern}</h3>
                    <p className="text-xs text-slate-400 font-medium">{item.meaning}</p>
                  </div>
               </div>
               <div className="px-5 py-2 bg-slate-50 rounded-full text-[9px] font-black uppercase tracking-wider">{item.meaning}</div>
            </div>
          ))}
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-6 md:px-20 py-12 transition-colors">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Top Link */}
        <button 
          onClick={() => navigate('/grammar')}
          className="group flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-black dark:hover:text-white uppercase tracking-[0.2em] transition-all mb-4"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> QUAY LẠI
        </button>

        {/* Header Section */}
        <div className="relative pl-6">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-black dark:bg-white rounded-full" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic leading-none">
            NGỮ PHÁP
          </h1>
          <p className="text-[10px] font-black text-slate-200 dark:text-slate-800 mt-1 uppercase tracking-[0.3em]">
            {grammarData[0]?.book?.levelLabel || 'LEVEL N3'}
          </p>
        </div>

        {/* Main Interface */}
        <div className="pt-6">
          {loading ? (
            <div className="py-20 flex justify-center"><div className="w-10 h-10 border-[3px] border-slate-50 border-t-black rounded-full animate-spin"></div></div>
          ) : (
            activeMode === 'menu' ? MenuScreen : (activeMode === 'list' ? ListScreen : (
              <div className="py-40 text-center space-y-6">
                <p className="text-2xl font-black italic text-slate-200">CHẾ ĐỘ ĐANG CẬP NHẬT</p>
                <button onClick={() => setActiveMode('menu')} className="px-8 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">QUAY LẠI</button>
              </div>
            ))
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
}
