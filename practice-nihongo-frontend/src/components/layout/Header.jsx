import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Dropdown, Space } from 'antd';
import { DownOutlined, SettingOutlined, UserOutlined, ImportOutlined, DatabaseOutlined } from '@ant-design/icons';

export default function Header() {
  const { pathname } = useLocation();
  const { currentUser, logout } = useAuth();

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';

  return (
    <header className="fixed top-0 z-[1000] w-full bg-white/95 backdrop-blur-sm border-b border-slate-50 px-4 md:px-12 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 transition-all duration-500">
      <div className="flex w-full md:w-auto md:flex-1 items-center justify-between md:justify-start gap-6">
        <Link to="/" className="font-black text-xl tracking-tighter text-black uppercase">
          Nihongo
        </Link>

        {isAdmin && (
          <Dropdown
            menu={{
              items: [
                { key: '1', label: <Link to="/grammar/manage" className="font-bold text-slate-600">Ngữ pháp</Link>, icon: <SettingOutlined /> },
                { key: 'vocab', label: <Link to="/vocabulary/manage" className="font-bold text-slate-600">Từ vựng</Link>, icon: <DatabaseOutlined /> },
                { key: '2', label: <Link to="/manage/users" className="font-bold text-slate-600">Người dùng</Link>, icon: <UserOutlined /> },
                { key: 'divider', type: 'divider' },
                { key: '3', label: <Link to="/manage/import" className="font-bold text-slate-600">Import dữ liệu</Link>, icon: <ImportOutlined /> },
                { key: '4', label: <Link to="/grammar/books" className="font-bold text-slate-600">Bộ sách</Link>, icon: <DatabaseOutlined /> },
              ],
              className: "p-2 rounded-2xl shadow-2xl border border-slate-50"
            }}
            trigger={['hover']}
          >
            <a onClick={(e) => e.preventDefault()} className="transition-all whitespace-nowrap py-1.5 px-4 bg-black text-white hover:bg-slate-800 rounded-xl font-bold uppercase text-[9px] tracking-widest cursor-pointer flex items-center gap-2 shadow-lg shadow-black/10">
              Quản lý
              <DownOutlined className="text-[7px]" />
            </a>
          </Dropdown>
        )}
      </div>

      <nav className="flex items-center gap-4 md:gap-8 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 overflow-x-auto no-scrollbar w-full md:w-auto justify-center">
        {[
          { path: '/', label: 'Trang chủ' },
          { path: '/grammar', label: 'Ngữ pháp' },
          { path: '/vocabulary', label: 'Từ vựng' },
          { path: '/kanji', label: 'Hán tự' },
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

      <div className="hidden md:flex flex-1 items-center justify-end gap-4 text-xs font-bold uppercase tracking-widest">
        {currentUser ? (
          <div className="flex items-center gap-4">
            <span className="text-slate-600 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-black border border-slate-200">
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:flex items-center gap-2">
                {currentUser.name}
                {isAdmin && (
                  <span className="px-1.5 py-0.5 border border-slate-200 text-slate-400 rounded text-[7px] font-black tracking-[0.2em] uppercase flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-pulse" />
                    Admin
                  </span>
                )}
              </span>
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
