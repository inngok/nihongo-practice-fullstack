import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import bookService from '../../api/bookService';
import { useAuth } from '../../context/AuthContext';

export default function Kanji() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'admin';


  const filteredBooks = useMemo(() => {
    if (!Array.isArray(books)) return [];
    return books.filter(book => {
      if (!isAdmin && book.publishKanji === false) return false;
      
      if (isAdmin) return true;

      if (!currentUser) return true;
      const bookLevel = (book.levelLabel || '').toUpperCase();
      const bookTitle = (book.title || '').toUpperCase();
      const bookJpTitle = (book.japaneseTitle || '').toUpperCase();
      const targetLvl = (currentUser.jlptLevel || 'N3').toUpperCase();
      return bookLevel.includes(targetLvl) || bookTitle.includes(targetLvl) || bookJpTitle.includes(targetLvl);
    });
  }, [books, currentUser, isAdmin]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    bookService.getAll()
      .then(res => {
        if (isMounted) {
          const data = Array.isArray(res.data) ? res.data : [];
          const kanjiBooks = data.filter(book => book.type && book.type.includes('KANJI'));
          setBooks(kanjiBooks);
        }
      })
      .catch(err => {
        console.error('Fetch Kanji Books error:', err);
        if (isMounted) setBooks([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);


  return (
    <div className="min-h-screen w-full bg-transparent flex flex-col items-center pt-36 md:pt-28 pb-16 px-6 font-sans relative overflow-hidden selection:bg-slate-200 dark:selection:bg-slate-800">

      <div className="w-full max-w-5xl relative z-10">

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 md:mb-10"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          QUAY LẠI
        </button>

        {/* Title Section */}
        <div className="mb-12 md:mb-16">
          <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block mb-3">LỘ TRÌNH HÁN TỰ</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 uppercase">
            Hán tự
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Rèn luyện kỹ năng đọc và viết Hán tự theo lộ trình từ cơ bản đến nâng cao cho trình độ N3.
          </p>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-800 border-t-black dark:border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/kanji/set-4?bookId=${book.id}`)}
                className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-sm border border-slate-100 dark:border-slate-800/80 rounded-3xl p-8 flex flex-col justify-between transition-all duration-350 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
              >
                {/* Top Row */}
                <div className="flex justify-between items-center mb-10">
                  <div className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                    BOOK {book.num || '01'}
                  </div>
                  <div className="w-8 h-8 rounded-full border border-slate-100 dark:border-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-slate-700 group-hover:border-slate-300 dark:group-hover:text-slate-300 dark:group-hover:border-slate-700 transition-all duration-300">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>

                {/* Center Content */}
                <div className="mb-8">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                    {book.title}
                  </h3>
                  <p className="font-kanji text-slate-400 dark:text-slate-500 text-xs tracking-wide leading-relaxed">
                    {book.japaneseTitle}
                  </p>
                </div>

                {/* Bottom Label */}
                <div className="pt-6 border-t border-slate-50 dark:border-slate-800/60 mt-auto flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-slate-950 text-white dark:bg-white dark:text-black rounded-lg text-[9px] font-black tracking-widest uppercase shadow-sm">
                    {book.levelLabel}
                  </span>
                  <span className="text-[9px] font-black tracking-wider text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white uppercase transition-colors">
                    Bắt đầu học →
                  </span>
                </div>
              </div>
            ))}

            {filteredBooks.length === 0 && (
              <div className="col-span-full py-24 text-center border border-dashed border-slate-200 dark:border-slate-800/60 rounded-3xl bg-slate-50/20 dark:bg-slate-900/10">
                <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs italic">Chưa có giáo trình Hán tự nào.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}