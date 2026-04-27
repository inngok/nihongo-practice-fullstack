import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { pathname } = useLocation();
  const { currentUser, logout } = useAuth();

  return (
    <header className="fixed top-0 z-[1000] w-full bg-white/95 backdrop-blur-sm border-b border-slate-50 px-4 md:px-12 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
      <div className="flex w-full md:w-auto items-center justify-between">
        <Link to="/" className="font-black text-xl tracking-tighter text-black uppercase">
          Nihongo
        </Link>
        <div className="md:hidden flex items-center">
          {/* Mobile menu button could go here, but keeping it text-only for now */}
        </div>
      </div>

      <nav className="flex items-center gap-4 md:gap-8 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 overflow-x-auto no-scrollbar w-full md:w-auto justify-center md:justify-start">
        {[
          { path: '/', label: 'Trang chủ' },
          { path: '/grammar', label: 'Ngữ pháp' },
          { path: '/vocabulary', label: 'Từ vựng' },
          { path: '/kanji', label: 'Hán tự' },
          { path: '/grammar/manage', label: 'Quản lý' }
        ].map(nav => (
          <Link
            key={nav.path}
            to={nav.path}
            className={`transition-all whitespace-nowrap py-1 border-b-2 ${(nav.path === '/' && pathname === '/') || (nav.path !== '/' && pathname.startsWith(nav.path))
                ? 'text-black border-black'
                : 'border-transparent hover:text-black hover:border-slate-200'
              }`}
          >
            {nav.label}
          </Link>
        ))}
      </nav>

      <div className="hidden md:flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
        {currentUser ? (
          <div className="flex items-center gap-4">
            <span className="text-slate-600 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-black border border-slate-200">
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:block">{currentUser.name}</span>
            </span>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-black transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="text-slate-400 hover:text-black transition-colors">
              Đăng nhập
            </Link>
            <Link to="/register" className="bg-black text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors">
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
