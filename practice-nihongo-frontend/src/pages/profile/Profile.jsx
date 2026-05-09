import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, MailOutlined, KeyOutlined, TrophyOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { message, Modal } from 'antd';

export default function Profile() {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('N3');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load current values on mount
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setSelectedLevel(currentUser.jlptLevel || 'N3');
    } else {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      message.error('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận lưu thay đổi',
      content: 'Bạn có chắc chắn muốn cập nhật thông tin cá nhân và trình độ học tập mặc định của mình không?',
      okText: 'Xác nhận',
      cancelText: 'Hủy bỏ',
      okButtonProps: { className: 'bg-black text-white hover:bg-slate-800 border-black font-bold rounded-lg' },
      cancelButtonProps: { className: 'font-bold rounded-lg' },
      onOk: async () => {
        setLoading(true);
        try {
          await updateProfile(name, password || null, selectedLevel);
          setPassword('');
          setConfirmPassword('');
        } catch (err) {
          console.error(err);
          message.error(err.message || 'Cập nhật hồ sơ thất bại.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  return (
    <div className="pt-24 min-h-screen bg-white flex flex-col items-center px-6 md:px-12 font-sans select-none">
      <div className="max-w-xl w-full py-10 space-y-12">
        
        {/* Header Title Section */}
        <div className="border-b border-slate-100 pb-6">
          <span className="text-[10px] font-black tracking-[0.25em] text-slate-300 uppercase mb-2 block">
            <UserOutlined className="mr-1" /> ACCOUNT PREFERENCES
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight leading-none">
            Hồ sơ Cá nhân
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">
            Thay đổi thông tin tài khoản, đặt lại mật khẩu và cấu hình trình độ học tập mặc định của riêng bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: General Details */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase border-b border-slate-50 pb-2">
              Thông tin chung
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                  Họ và Tên
                </label>
                <div className="mt-1 relative flex items-center">
                  <span className="absolute left-4 text-slate-400 text-xs">
                    <UserOutlined />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-150 focus:border-black focus:bg-white rounded-xl text-xs font-bold text-slate-800 w-full focus:outline-none transition-all"
                    placeholder="Nhập tên của bạn"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                  Địa chỉ Email (Khóa)
                </label>
                <div className="mt-1 relative flex items-center">
                  <span className="absolute left-4 text-slate-300 text-xs">
                    <MailOutlined />
                  </span>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="pl-10 pr-4 py-3 bg-slate-100/50 border border-slate-100 rounded-xl text-xs font-bold text-slate-400 w-full cursor-not-allowed focus:outline-none"
                    placeholder="Email của bạn"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: JLPT Level Target Choice */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Trình độ mục tiêu mặc định
              </h3>
              <span className="px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase tracking-wider rounded">
                Mức độ: {selectedLevel}
              </span>
            </div>

            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
              * Hệ thống sẽ tự động ưu tiên lọc các giáo trình, sách bài tập, từ vựng và câu hỏi ngữ pháp theo trình độ này khi bạn truy cập vào các mô-đun học tập. Bạn vẫn có thể linh hoạt chuyển sang xem các cấp độ khác thông qua thanh bộ lọc ở các trang học.
            </p>

            <div className="grid grid-cols-5 gap-3 pt-2">
              {levels.map((lvl) => {
                const isSelected = selectedLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex flex-col items-center justify-center gap-1.5 border active:scale-95 ${
                      isSelected
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-slate-50 border-slate-150 hover:border-black text-slate-500 hover:text-black'
                    }`}
                  >
                    <TrophyOutlined className="text-xs" />
                    <span>{lvl}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Password Update */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase border-b border-slate-50 pb-2">
              Bảo mật & Mật khẩu (Chỉ nhập khi cần thay đổi)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                  Mật khẩu mới
                </label>
                <div className="mt-1 relative flex items-center">
                  <span className="absolute left-4 text-slate-400 text-xs">
                    <KeyOutlined />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 py-3 bg-slate-50 border border-slate-150 focus:border-black focus:bg-white rounded-xl text-xs font-bold text-slate-800 w-full focus:outline-none transition-all"
                    placeholder="Nhập mật khẩu mới"
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

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                  Xác nhận mật khẩu mới
                </label>
                <div className="mt-1 relative flex items-center">
                  <span className="absolute left-4 text-slate-400 text-xs">
                    <KeyOutlined />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 py-3 bg-slate-50 border border-slate-150 focus:border-black focus:bg-white rounded-xl text-xs font-bold text-slate-800 w-full focus:outline-none transition-all"
                    placeholder="Xác nhận lại mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-700 text-xs focus:outline-none flex items-center justify-center cursor-pointer transition-colors"
                  >
                    {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer Button */}
          <div className="pt-4 border-t border-slate-100 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-black text-white hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-widest active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-4 bg-slate-50 border border-slate-200 hover:border-black text-slate-600 hover:text-black transition-all text-xs font-black uppercase tracking-widest active:scale-95"
            >
              Hủy
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
