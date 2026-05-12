import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Dropdown, Space } from 'antd';
import { DownOutlined, SettingOutlined, UserOutlined, ImportOutlined, DatabaseOutlined, PieChartOutlined } from '@ant-design/icons';

export default function Header() {
  const pathname = useLocation().pathname;
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';

  const themeToggleBtn = (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-sm shrink-0"
      aria-label="Toggle Theme"
      title={theme === 'dark' ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
    >
      {theme === 'dark' ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m1.414 1.414a5 5 0 117.071 7.071 5 5 0 01-7.071-7.071z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );

  return (
    <header className="fixed top-0 z-[1000] w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-50 dark:border-slate-900 px-4 md:px-12 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 transition-all duration-500">
      <div className="flex w-full md:w-auto md:flex-1 items-center justify-between md:justify-start gap-6">
        <Link to="/" className="font-black text-xl tracking-tighter text-black dark:text-white uppercase">
          Nihongo
        </Link>

        {/* Right side controls on mobile */}
        <div className="flex items-center gap-3 md:gap-6">
          {themeToggleBtn}
          {isAdmin && (
            <Dropdown
              menu={{
                items: [
                  { key: 'dashboard', label: <Link to="/manage" className="font-bold text-slate-600">Tổng quan</Link>, icon: <PieChartOutlined /> },
                  { key: '1', label: <Link to="/grammar/manage" className="font-bold text-slate-600">Ngữ pháp</Link>, icon: <SettingOutlined /> },
                  { key: 'vocab', label: <Link to="/vocabulary/manage" className="font-bold text-slate-600">Từ vựng</Link>, icon: <DatabaseOutlined /> },
                  { key: '2', label: <Link to="/manage/users" className="font-bold text-slate-600">Người dùng</Link>, icon: <UserOutlined /> },
                  { key: 'divider', type: 'divider' },
                  { key: '3', label: <Link to="/manage/import" className="font-bold text-slate-600">Import dữ liệu</Link>, icon: <ImportOutlined /> },
                  { key: '4', label: <Link to="/grammar/books" className="font-bold text-slate-600">Bộ sách</Link>, icon: <DatabaseOutlined /> },
                ],
                className: "p-2 rounded-2xl shadow-2xl border border-slate-50"
              }}
              trigger={['hover', 'click']}
            >
              <a onClick={(e) => e.preventDefault()} className="transition-all whitespace-nowrap py-1.5 px-3 md:px-4 bg-black text-white hover:bg-slate-800 rounded-xl font-bold uppercase text-[9px] tracking-widest cursor-pointer flex items-center gap-1.5 shadow-lg shadow-black/10">
                Quản lý
                <DownOutlined className="text-[7px]" />
              </a>
            </Dropdown>
          )}

          {/* Auth controls for mobile */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser ? (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'profile',
                      label: (
                        <div className="px-3 py-2 flex flex-col gap-0.5 border-b border-slate-50 min-w-[140px]">
                          <span className="font-extrabold text-slate-800 text-xs">{currentUser.name}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {isAdmin ? 'Quản trị viên' : 'Học viên'}
                          </span>
                        </div>
                      )
                    },
                    {
                      key: 'profile-link',
                      label: (
                        <Link to="/profile" className="w-full text-left font-bold text-slate-600 hover:text-black text-xs py-1 transition-colors block">
                          Hồ sơ của tôi
                        </Link>
                      ),
                      icon: <UserOutlined className="text-slate-400 text-xs" />
                    },
                    {
                      key: 'logout',
                      label: (
                        <button onClick={logout} className="w-full text-left font-bold text-slate-600 hover:text-black text-xs py-1 transition-colors">
                          Đăng xuất
                        </button>
                      ),
                      icon: <ImportOutlined className="text-slate-400 text-xs" />
                    }
                  ],
                  className: "p-1.5 rounded-2xl shadow-xl border border-slate-100/50 bg-white"
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center cursor-pointer text-xs font-black uppercase tracking-wider shadow-sm transition-all duration-300 select-none">
                  {currentUser.name?.charAt(0).toUpperCase()}
                </div>
              </Dropdown>
            ) : (
              <>
                <Link to="/login" className="text-slate-400 hover:text-black transition-colors text-[10px] font-black uppercase tracking-widest py-1 px-2">
                  Đăng nhập
                </Link>
                <Link to="/register" className="bg-black text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-[10px] font-black uppercase tracking-widest">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-4 md:gap-8 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-550 overflow-x-auto no-scrollbar w-full md:w-auto justify-center">
        {[
          { path: '/', label: 'Trang chủ' },
          { path: '/grammar', label: 'Ngữ pháp' },
          { path: '/vocabulary', label: 'Từ vựng' },
          { path: '/kanji', label: 'Hán tự' },
          ...(currentUser ? [
            { path: '/my-vocab', label: 'Sổ tay' }
          ] : []),
        ].map(nav => (
          <Link
            key={nav.path}
            to={nav.path}
            className={`transition-all whitespace-nowrap py-1 border-b-2 ${(nav.path === '/' && pathname === '/') || (nav.path !== '/' && (pathname === nav.path || pathname.startsWith(nav.path + '/')))
                ? 'text-black border-black dark:text-white dark:border-white'
                : 'border-transparent hover:text-black dark:hover:text-white hover:border-slate-200 dark:hover:border-slate-800'
              }`}
          >
            {nav.label}
          </Link>
        ))}
      </nav>

      <div className="hidden md:flex flex-1 items-center justify-end gap-4 text-xs font-bold uppercase tracking-widest">
        {themeToggleBtn}
        {currentUser ? (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'profile',
                  label: (
                    <div className="px-3 py-2 flex flex-col gap-0.5 border-b border-slate-50 min-w-[150px]">
                      <span className="font-extrabold text-slate-800 text-xs">{currentUser.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        {isAdmin ? 'Quản trị viên' : 'Học viên'}
                      </span>
                    </div>
                  )
                },
                {
                  key: 'profile-link',
                  label: (
                    <Link to="/profile" className="w-full text-left font-bold text-slate-600 hover:text-black text-xs py-1 transition-colors block">
                      Hồ sơ của tôi
                    </Link>
                  ),
                  icon: <UserOutlined className="text-slate-400 text-xs" />
                },
                {
                  key: 'logout',
                  label: (
                    <button onClick={logout} className="w-full text-left font-bold text-slate-600 hover:text-black text-xs py-1 transition-colors">
                      Đăng xuất
                    </button>
                  ),
                  icon: <ImportOutlined className="text-slate-400 text-xs" />
                }
              ],
              className: "p-1.5 rounded-2xl shadow-xl border border-slate-100/50 bg-white"
            }}
            trigger={['click', 'hover']}
            placement="bottomRight"
          >
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 flex items-center justify-center cursor-pointer text-xs font-black uppercase tracking-wider shadow-sm transition-all duration-300 select-none">
              {currentUser.name?.charAt(0).toUpperCase()}
            </div>
          </Dropdown>
        ) : (
          <>
            <Link to="/login" className="text-slate-400 hover:text-black dark:hover:text-white transition-colors">
              Đăng nhập
            </Link>
            <Link to="/register" className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
