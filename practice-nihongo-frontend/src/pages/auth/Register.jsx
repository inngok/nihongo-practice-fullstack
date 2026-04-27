import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp');
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra khi đăng ký.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 -ml-8 -mt-8 w-32 h-32 rounded-full bg-emerald-50 opacity-50 blur-2xl"></div>
        <div className="absolute bottom-0 right-0 -mr-8 -mb-8 w-32 h-32 rounded-full bg-amber-50 opacity-50 blur-2xl"></div>

        <div className="relative z-10">
          <h2 className="mt-2 text-center text-3xl font-black uppercase tracking-tighter text-slate-900">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">
            Bắt đầu hành trình chinh phục tiếng Nhật ngay hôm nay
          </p>
        </div>

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                Họ và Tên
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition-all"
                placeholder="Nhập tên của bạn"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition-all"
                placeholder="Nhập email của bạn"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition-all"
                placeholder="Tạo mật khẩu"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition-all"
                placeholder="Nhập lại mật khẩu"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-black hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Đăng ký'
              )}
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm font-medium text-slate-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-black hover:text-slate-700 transition-colors">
              Đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
