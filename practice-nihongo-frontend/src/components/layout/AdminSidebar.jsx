import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOutlined, 
  ReadOutlined, 
  FontSizeOutlined, 
  UserOutlined, 
  ImportOutlined, 
  HomeOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ onClose }) {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/', label: 'Về trang chủ' },
    { type: 'divider' },
    { path: '/manage', label: 'Tổng quan' },
    { path: '/grammar/manage', label: 'Ngữ pháp' },
    { path: '/vocabulary/manage', label: 'Từ vựng' },
    { path: '/kanji/manage', label: 'Hán tự' },
    { path: '/grammar/books', label: 'Bộ sách' },
    { path: '/manage/import', label: 'Import dữ liệu' },
    { path: '/manage/jlpt-vocab', label: 'JLPT Từ vựng' },
    { path: '/manage/ai', label: 'Quản lý AI' },
  ];

  return (
    <aside className="h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col z-[1100]">
      {/* Brand */}
      <div className="h-20 flex items-center px-8 justify-between">
        <Link to="/" className="text-lg font-black tracking-tighter flex items-center gap-2.5 text-slate-900 dark:text-white uppercase">
          NIHONGO
        </Link>
        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest"
          >
            Đóng
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-grow py-4 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {menuItems.map((item, index) => {
          if (item.type === 'divider') {
            return <div key={index} className="h-px bg-slate-50 dark:bg-slate-850 my-4 mx-4" />;
          }

          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-md shadow-slate-200 dark:shadow-none' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <span className="text-[13px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-50 dark:border-slate-800">
        <button
          onClick={() => {
            if (onClose) onClose();
            logout();
          }}
          className="w-full flex items-center px-4 py-2.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-medium text-xs tracking-tight"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
