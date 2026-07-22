import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Dropdown, Badge } from 'antd';
import { DownOutlined, SettingOutlined, UserOutlined, ImportOutlined, DatabaseOutlined, PieChartOutlined, FontSizeOutlined, BellOutlined, ClearOutlined, CheckCircleOutlined } from '@ant-design/icons';

const HeaderComponent = () => {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markAsRead, clearAll } = useNotifications();

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';

  const notificationDropdown = (
    <div className="w-[300px] sm:w-[340px] md:w-[400px] -mr-2 sm:mr-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-2xl p-3 sm:p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <span className="font-extrabold text-sm text-slate-900 dark:text-slate-50 uppercase tracking-wider">
          Thông báo ({unreadCount})
        </span>
        <div className="flex gap-3.5">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead} 
              className="text-[11px] font-extrabold uppercase text-slate-900 hover:text-slate-600 dark:text-slate-100 dark:hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              <CheckCircleOutlined /> Đọc hết
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={clearAll} 
              className="text-[11px] font-extrabold uppercase text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 transition-colors flex items-center gap-1"
            >
              <ClearOutlined /> Xóa hết
            </button>
          )}
        </div>
      </div>
 
      <div className="max-h-[320px] overflow-y-auto no-scrollbar flex flex-col gap-2">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-600 font-extrabold uppercase tracking-widest">
            Không có thông báo nào
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={`${notif.type}-${notif.id}`}
              onClick={() => {
                markAsRead(notif.id);
                if (notif.type === 'NEW_ARTICLE') {
                  navigate(`/news/${notif.id}`);
                }
              }}
              className={`flex gap-2.5 sm:gap-3.5 items-center p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-850/80 border border-transparent ${!notif.read ? 'bg-slate-100/40 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/40 shadow-sm' : ''}`}
            >
              {notif.imageUrl ? (
                <img 
                  src={notif.imageUrl} 
                  alt="" 
                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-xl shrink-0 border border-slate-100 dark:border-slate-800/40"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 flex items-center justify-center rounded-xl shrink-0 text-base sm:text-lg">
                  📰
                </div>
              )}
              <div className="flex-grow min-w-0">
                <h4 className={`font-kanji text-[13px] md:text-[14px] leading-normal line-clamp-2 ${!notif.read ? 'font-bold text-slate-950 dark:text-slate-50' : 'font-medium text-slate-450 dark:text-slate-500'}`}>
                  {notif.title}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 mt-1 block uppercase tracking-wider">
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(notif.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <header className="fixed top-0 z-[1000] w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-50 dark:border-slate-900 px-4 md:px-12 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 transition-all duration-500">
      <div className="flex w-full md:w-auto md:flex-1 items-center justify-between md:justify-start gap-6">
        <Link to="/" className="font-black text-xl tracking-tighter text-black dark:text-white uppercase">
          Nihongo
        </Link>

        {/* Right side controls on mobile */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="md:hidden">
            <Dropdown dropdownRender={() => notificationDropdown} trigger={['click']} placement="bottomRight">
              <div className="relative w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer text-slate-650 dark:text-slate-350 transition-all select-none shadow-sm">
                <Badge count={unreadCount} size="small" offset={[2, -2]} overflowCount={10}>
                  <BellOutlined className="text-base" />
                </Badge>
              </div>
            </Dropdown>
          </div>

          {isAdmin && (
            <Dropdown
              menu={{
                items: [
                  { key: 'dashboard', label: <Link to="/manage" className="font-bold text-slate-600">Tổng quan</Link>, icon: <PieChartOutlined /> },
                  { key: '1', label: <Link to="/grammar/manage" className="font-bold text-slate-600">Ngữ pháp</Link>, icon: <SettingOutlined /> },
                  { key: 'vocab', label: <Link to="/vocabulary/manage" className="font-bold text-slate-600">Từ vựng</Link>, icon: <DatabaseOutlined /> },
                  { key: 'kanji', label: <Link to="/kanji/manage" className="font-bold text-slate-600">Hán tự</Link>, icon: <FontSizeOutlined /> },
                  { key: 'divider', type: 'divider' },
                  { key: '3', label: <Link to="/manage/import" className="font-bold text-slate-600">Import dữ liệu</Link>, icon: <ImportOutlined /> },
                  { key: '4', label: <Link to="/grammar/books" className="font-bold text-slate-600">Bộ sách</Link>, icon: <DatabaseOutlined /> },
                  { key: 'ai', label: <Link to="/manage/ai" className="font-bold text-slate-600">Quản lý AI</Link>, icon: <PieChartOutlined /> },
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
              <Link to="/login" className="bg-black text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-[10px] font-black uppercase tracking-widest">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-4 md:gap-8 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 overflow-x-auto no-scrollbar w-full md:w-auto justify-center">
        {[
          { path: '/', label: 'Trang chủ' },
          { path: '/grammar', label: 'Ngữ pháp' },
          { path: '/vocabulary', label: 'Từ vựng' },
          { path: '/kanji', label: 'Hán tự' },
          { path: '/news', label: 'Tin tức' },
        ].map(nav => (
          <Link
            key={nav.path}
            to={nav.path}
            className={`transition-all whitespace-nowrap py-1 border-b-2 ${(nav.path === '/' && pathname === '/') || (nav.path !== '/' && (pathname === nav.path || pathname.startsWith(nav.path + '/')))
                ? 'text-black border-black dark:text-white dark:border-white font-black'
                : 'border-transparent text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white hover:border-slate-200 dark:hover:hover:border-slate-800 font-black'
              }`}
          >
            {nav.label}
          </Link>
        ))}
      </nav>

      <div className="hidden md:flex flex-1 items-center justify-end gap-4 text-xs font-bold uppercase tracking-widest">
        <Dropdown dropdownRender={() => notificationDropdown} trigger={['click']} placement="bottomRight">
          <div className="relative w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer text-slate-655 dark:text-slate-355 transition-all select-none shadow-sm">
            <Badge count={unreadCount} size="small" offset={[2, -2]} overflowCount={10}>
              <BellOutlined className="text-base" />
            </Badge>
          </div>
        </Dropdown>

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
          <Link to="/login" className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
};

export default React.memo(HeaderComponent);
