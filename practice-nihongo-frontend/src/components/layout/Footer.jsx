import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function Footer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="w-full bg-white dark:bg-slate-950 px-6 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-50 dark:border-slate-900 mt-auto transition-colors duration-300">
      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600">
        © 2026 NIHONGO
      </div>
      
      <div className="flex items-center gap-6">
        {/* Subtle Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-300 cursor-pointer select-none"
          title={theme === 'dark' ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
        >
          {theme === 'dark' ? (
            <>
              <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.161 5.1a.75.75 0 011.06 0l1.591 1.591a.75.75 0 11-1.06 1.06L6.161 6.16a.75.75 0 010-1.06zm11.678 0a.75.75 0 010 1.06l-1.591 1.591a.75.75 0 11-1.06-1.06l1.591-1.59a.75.75 0 011.06 0zM12 6.75a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5zM2.25 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zm16.5 0a.75.75 0 01.75-.75H21.75a.75.75 0 010 1.5H19.5a.75.75 0 01-.75-.75zm-12.59 5.09a.75.75 0 011.06 0l1.591 1.591a.75.75 0 11-1.06 1.06L6.161 18.15a.75.75 0 010-1.06zm11.678 0a.75.75 0 010 1.06l-1.591 1.591a.75.75 0 11-1.06-1.06l1.591-1.591a.75.75 0 011.06 0zM12 18.75a.75.75 0 01.75.75V21.75a.75.75 0 01-1.5 0V19.5a.75.75 0 01.75-.75z" />
              </svg>
              <span className="text-[8px] font-black uppercase tracking-widest">Sáng</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5a10.503 10.503 0 016.778-9.742.75.75 0 01.819.162z" clipRule="evenodd" />
              </svg>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Tối</span>
            </>
          )}
        </button>

        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600">
          ngocng
        </div>
      </div>
    </footer>
  );
}
