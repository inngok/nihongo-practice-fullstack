import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  BookOutlined, 
  ReadOutlined, 
  FontSizeOutlined, 
  UserOutlined, 
  ImportOutlined, 
  PieChartOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { message } from 'antd';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (showSuccess = false) => {
    try {
      if (showSuccess) setRefreshing(true);
      const response = await apiClient.get('/dashboard/stats');
      setStats(response.data);
      if (showSuccess) message.success('Đã làm mới số liệu hệ thống!');
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      message.error('Không thể tải số liệu thống kê hệ thống');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-grow w-full py-8 px-10 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-100 border-t-black rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Đang nạp dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  const aiUsage = stats?.aiUsage || {
    used: 0,
    success: 0,
    fail: 0,
    limit: 1500,
    remaining: 1500,
    rpmLimit: 15,
    isKeyConfigured: false
  };

  const usedPercent = Math.min(100, Math.round((aiUsage.used / aiUsage.limit) * 100)) || 0;

  return (
    <div className="flex-grow w-full py-8 px-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100 bg-transparent">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Minimalist Monochrome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Bảng điều khiển</h1>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">/ Dashboard</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Tổng quan số liệu và quản lý hiệu năng AI hệ thống</p>
          </div>
          
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
          >
            <SyncOutlined className={`text-[10px] ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới số liệu
          </button>
        </div>

        {/* 4 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Card: Books */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Giáo trình</span>
              <BookOutlined className="text-base text-slate-800 dark:text-slate-200" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats?.booksCount || 0}</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Bộ sách được tải lên</p>
            </div>
          </div>

          {/* Card: Vocabs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Từ vựng</span>
              <ReadOutlined className="text-base text-slate-800 dark:text-slate-200" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats?.vocabsCount || 0}</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Từ trong cơ sở dữ liệu</p>
            </div>
          </div>

          {/* Card: Kanji */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Hán tự</span>
              <FontSizeOutlined className="text-base text-slate-800 dark:text-slate-200" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats?.kanjisCount || 0}</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Chữ Kanji đang hoạt động</p>
            </div>
          </div>

          {/* Card: Grammar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Ngữ pháp</span>
              <PieChartOutlined className="text-base text-slate-800 dark:text-slate-200" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats?.grammarCount || 0}</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Cấu trúc được biên soạn</p>
            </div>
          </div>

          {/* Card: Users */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Người dùng</span>
              <UserOutlined className="text-base text-slate-800 dark:text-slate-200" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats?.usersCount || 0}</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Tài khoản thành viên</p>
            </div>
          </div>
        </div>

        {/* AI Quota and Quick Links Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Block: AI Quota Analytics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between pb-4 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ThunderboltOutlined className="text-slate-800 dark:text-yellow-400 text-lg" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Tài nguyên AI (Gemini Flash)</h3>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                aiUsage.isKeyConfigured 
                  ? 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700' 
                  : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${aiUsage.isKeyConfigured ? 'bg-slate-500' : 'bg-red-500 animate-pulse'}`}></span>
                {aiUsage.isKeyConfigured ? 'API Key Active' : 'Chưa cấu hình API Key'}
              </span>
            </div>

            {/* Quota Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-end text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Hạn mức sử dụng ngày hôm nay</span>
                <span className="text-slate-900 dark:text-white font-bold">{aiUsage.used} / {aiUsage.limit} Yêu cầu</span>
              </div>
              <div className="w-full h-2.5 bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                <div 
                  style={{ width: `${usedPercent}%` }} 
                  className="h-full bg-slate-900 dark:bg-white transition-all duration-500"
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                <span>Đã dùng {usedPercent}%</span>
                <span>Hạn mức còn lại: {aiUsage.remaining} cuộc gọi</span>
              </div>
            </div>

            {/* AI Call Stats breakdown */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
              <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Tổng số yêu cầu</span>
                <span className="text-base font-black text-slate-800 dark:text-white">{aiUsage.used}</span>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Xử lý thành công</span>
                <span className="text-base font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <CheckCircleOutlined className="text-slate-500 text-xs" />
                  {aiUsage.success}
                </span>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Xử lý thất bại</span>
                <span className="text-base font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  {aiUsage.fail > 0 ? (
                    <>
                      <CloseCircleOutlined className="text-red-500 text-xs animate-pulse" />
                      <span className="text-red-600 dark:text-red-400 font-black">{aiUsage.fail}</span>
                    </>
                  ) : (
                    <>
                      <CloseCircleOutlined className="text-slate-400 text-xs" />
                      0
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* AI limit specification details */}
            <div className="bg-slate-50/30 dark:bg-slate-950/30 border border-slate-100/80 dark:border-slate-800 rounded-xl p-4 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-1.5 font-medium">
              <p className="font-bold text-slate-700 dark:text-slate-300">📌 Thông tin hạn mức API Gemini 1.5 Flash:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Giới hạn tốc độ:</strong> Tối đa <span className="font-bold text-slate-700 dark:text-slate-300">15 RPM</span> (yêu cầu một phút). Tránh click gửi dồn dập liên tục.</li>
                <li><strong>Hạn mức ngày:</strong> Tối đa <span className="font-bold text-slate-700 dark:text-slate-300">1,500 RPD</span> (yêu cầu một ngày). Đảm bảo dư dả cho các thao tác chuẩn hóa và nạp dữ liệu cá nhân.</li>
                <li><strong>Cơ chế tự động:</strong> Trong trường hợp đạt giới hạn, hệ thống tự động lưu giữ và ngắt tạm thời để tránh xung đột Key.</li>
              </ul>
            </div>
          </div>

          {/* Right Block: System shortcuts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-50 dark:border-slate-800">
                <ImportOutlined className="text-slate-800 dark:text-white text-lg" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Lối tắt Hệ thống</h3>
              </div>
              
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/manage/import')}
                  className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">AI Smart Importer</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Trích xuất và nạp dữ liệu học</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-black dark:group-hover:text-white transition-all">→</span>
                </button>

                <button 
                  onClick={() => navigate('/grammar/books')}
                  className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Quản lý Giáo trình</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Cấu hình danh mục sách học</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-black dark:group-hover:text-white transition-all">→</span>
                </button>

                <button 
                  onClick={() => navigate('/vocabulary/manage')}
                  className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Quản lý Từ vựng</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Cập nhật kho từ giáo trình</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-black dark:group-hover:text-white transition-all">→</span>
                </button>

                <button 
                  onClick={() => navigate('/kanji/manage')}
                  className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Quản lý Hán tự</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Biên soạn bộ từ Kanji</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-black dark:group-hover:text-white transition-all">→</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium leading-relaxed">
              💻 Nihongo Practice System Control Panel<br/>
              Phiên bản: <span className="font-bold text-slate-600 dark:text-slate-300">v2.1.0 (Stable)</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
