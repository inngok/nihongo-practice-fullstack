import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookService from '../../api/bookService';

export default function Grammar() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookService.getAll()
      .then(res => {
        setBooks(res.data);
      })
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

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-12">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                Ngữ pháp
              </h1>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed">
                Chọn giáo trình để bắt đầu lộ trình rèn luyện cấu trúc ngữ pháp Tiếng Nhật từ cơ bản đến nâng cao.
              </p>
            </div>
            <button
              onClick={() => navigate('/grammar/manage')}
              className="px-5 py-3 bg-slate-100 hover:bg-black hover:text-white text-slate-600 rounded-xl font-bold text-xs transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Quản lý ngữ pháp
            </button>
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
                onClick={() => navigate(`/grammar/mimikara?bookId=${book.id}`)}
                className="group relative bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 hover:border-slate-400 hover:shadow-md hover:-translate-y-1 cursor-pointer"
              >
                {/* Top Row */}
                <div className="flex justify-between items-center mb-10">
                  <span className="text-sm font-bold text-slate-300">{book.num || '00'}</span>
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
                 <p className="text-slate-400 font-medium italic">Chưa có giáo trình nào được tạo.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}