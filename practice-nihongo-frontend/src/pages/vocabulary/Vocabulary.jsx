import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookService from '../../api/bookService';

export default function Vocabulary() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookService.getAll()
      .then(res => setBooks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);


  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center pt-24 md:pt-28 pb-16 px-6 font-sans relative overflow-hidden selection:bg-slate-200">

      <div className="w-full max-w-5xl relative z-10">

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-6 md:mb-8"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Quay lại
        </button>

        {/* Title Section */}
        <div className="mb-10 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Từ vựng
          </h1>
          <p className="text-sm md:text-base text-slate-500 max-w-xl leading-relaxed">
            Học từ vựng theo giáo trình N3 hiệu quả nhất.
          </p>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/vocabulary/soumatome?bookId=${book.id}`)}
                className="group relative bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 hover:border-slate-400 hover:shadow-md hover:-translate-y-1 cursor-pointer"
              >
                {/* Top Row */}
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-300">{book.num || '00'}</span>
                    <span className="text-[9px] font-bold tracking-widest px-2 py-1 bg-slate-50 text-slate-400 rounded-md uppercase">
                      LEVEL
                    </span>
                  </div>
                  {/* Arrow Icon xuất hiện khi hover */}
                  <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>

                {/* Center Content */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{book.title}</h3>
                  <p className="text-slate-500 text-sm font-medium">{book.japaneseTitle}</p>
                </div>

                {/* Bottom Label */}
                <div className="pt-5 border-t border-slate-100 mt-auto">
                  <span className="text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase">
                    {book.levelLabel}
                  </span>
                </div>
              </div>
            ))}

            {books.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-slate-400 font-medium italic">Chưa có giáo trình từ vựng nào.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}