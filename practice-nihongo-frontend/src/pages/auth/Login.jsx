import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { message } from 'antd';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const { login, register, verifyEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra khi đăng nhập.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await verifyEmail(email, otp);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Mã xác thực không hợp lệ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-50 opacity-50 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-rose-50 opacity-50 blur-2xl"></div>

        <div className="relative z-10">
          <h2 className="mt-2 text-center text-3xl font-black uppercase tracking-tighter text-slate-900">
            {showOtpInput ? 'Xác thực Email' : 'Chào mừng trở lại'}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">
            {showOtpInput 
              ? 'Vui lòng kiểm tra email và nhập mã xác thực (OTP)'
              : 'Đăng nhập để tiếp tục hành trình học tiếng Nhật'}
          </p>
        </div>

        {showOtpInput ? (
          <form className="mt-8 space-y-6 relative z-10" onSubmit={handleVerifyOtp}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                Mã xác thực (OTP)
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition-all text-center tracking-[1em] font-black text-2xl"
                placeholder="------"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-black hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                {isLoading ? 'Đang xác thực...' : 'Xác nhận'}
              </button>
            </div>
            <div className="mt-6 text-center text-sm font-medium text-slate-600 flex flex-col gap-3">
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  setError('');
                  try {
                    await register('User', email, password, 'N3');
                  } catch(err) {
                    setError(err.message || 'Lỗi gửi lại mã OTP');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="font-bold text-black hover:text-slate-700 transition-colors bg-transparent border-none p-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Chưa nhận được mã? Gửi lại mã
              </button>
              <button
                type="button"
                onClick={() => setShowOtpInput(false)}
                className="font-bold text-slate-500 hover:text-slate-700 transition-colors bg-transparent border-none p-0 cursor-pointer"
              >
                Quay lại đăng nhập
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium text-center border border-red-100 flex flex-col items-center gap-3">
                <span>{error}</span>
                {error.includes('chưa được xác thực') && (
                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoading(true);
                      setError('');
                      try {
                        await register('User', email, password, 'N3');
                        setShowOtpInput(true);
                      } catch(err) {
                        setError(err.message || 'Lỗi gửi lại mã OTP');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    Gửi lại mã & Xác thực ngay
                  </button>
                )}
              </div>
            )}
          
          <div className="space-y-4">
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
              <div className="relative mt-1 flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-4 pr-10 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition-all"
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-700 text-xs focus:outline-none flex items-center justify-center cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-black focus:ring-black border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 font-medium">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  message.info("Vui lòng liên hệ với Admin để được hỗ trợ cấp lại mật khẩu!");
                }}
                className="font-bold text-slate-900 hover:text-slate-700 transition-colors"
              >
                Quên mật khẩu?
              </a>
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
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm font-medium text-slate-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-black hover:text-slate-700 transition-colors">
              Đăng ký ngay
            </Link>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
