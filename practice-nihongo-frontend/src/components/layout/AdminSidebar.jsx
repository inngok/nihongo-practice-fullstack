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

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/', label: 'User Site' },
    { type: 'divider' },
    { path: '/grammar/manage', label: 'Ngữ pháp' },
    { path: '/vocabulary/manage', label: 'Từ vựng' },
    { path: '/kanji/manage', label: 'Hán tự' },
    { path: '/grammar/books', label: 'Bộ sách' },
    { path: '/manage/users', label: 'Người dùng' },
    { path: '/manage/import', label: 'Import dữ liệu' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col z-[1100]">
      {/* Brand */}
      <div className="h-20 flex items-center px-8">
        <Link to="/" className="text-lg font-black tracking-tighter flex items-center gap-2.5 text-slate-900 uppercase">
          NIHONGO
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-grow py-4 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {menuItems.map((item, index) => {
          if (item.type === 'divider') {
            return <div key={index} className="h-px bg-slate-50 my-4 mx-4" />;
          }

          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-slate-900 text-white font-bold shadow-md shadow-slate-200' 
                  : 'text-slate-500 hover:text-black hover:bg-slate-50'
              }`}
            >
              <span className="text-[13px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-50">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-2.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-medium text-xs tracking-tight"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
