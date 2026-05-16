import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { 
  ThunderboltOutlined, 
  SyncOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ApiOutlined,
  KeyOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function AiManager() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { fetchWithAuth } = useAuth();

  const fetchStats = async (showSuccess = false) => {
    try {
      if (showSuccess) setRefreshing(true);
      const res = await fetchWithAuth(`${API_BASE_URL}/ai/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
      if (showSuccess) message.success('Đã làm mới dữ liệu AI!');
    } catch (err) {
      console.error(err);
      message.error('Không thể tải thống kê AI');
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
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Đang nạp dữ liệu AI...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex-grow w-full py-8 px-10 flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <CloseCircleOutlined className="text-4xl text-rose-500" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Không thể kết nối với dịch vụ AI</h2>
          <p className="text-sm text-slate-500">Vui lòng kiểm tra lại cấu hình Backend hoặc API Key.</p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs uppercase tracking-widest"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const usagePercent = stats ? Math.min(100, Math.round((stats.used / stats.limit) * 100)) : 0;

  return (
    <div className="flex-grow w-full py-8 px-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100 bg-transparent">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Sync Header with Dashboard Style */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý AI & Token</h1>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">/ AI Management</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Theo dõi hạn ngạch sử dụng Google Gemini API và tài nguyên hệ thống</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/manage')}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              Về Dashboard
            </button>
            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
            >
              <SyncOutlined className={`text-[10px] ${refreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* AI Quota Section - Same as Dashboard but more detailed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Resource Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between pb-4 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ThunderboltOutlined className="text-slate-800 dark:text-white text-lg" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Hạn mức tài nguyên (Gemini 1.5)</h3>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                stats.isKeyConfigured ? 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700' : 'bg-amber-50 text-amber-600 border border-amber-100'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${stats.isKeyConfigured ? 'bg-slate-500' : 'bg-amber-500 animate-pulse'}`}></span>
                {stats.isKeyConfigured ? 'API Key Active' : 'Chưa cấu hình API Key'}
              </span>
            </div>

            {/* Quota Progress */}
            <div className="space-y-3">
              <div className="flex justify-between items-end text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Yêu cầu đã thực hiện hôm nay</span>
                <span className="text-slate-900 dark:text-white font-black">{stats.used} / {stats.limit} RPD</span>
              </div>
              <div className="w-full h-3 bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                <div 
                  style={{ width: `${usagePercent}%` }} 
                  className={`h-full transition-all duration-700 ${usagePercent > 90 ? 'bg-red-500' : 'bg-slate-900 dark:bg-white'}`}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">
                <span>Đã tiêu thụ {usagePercent}% hạn ngạch</span>
                <span>Còn lại: {stats.remaining} yêu cầu</span>
              </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
              <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Thành công</span>
                <span className="text-xl font-black text-emerald-600 flex items-center gap-1.5">
                  <CheckCircleOutlined className="text-sm" />
                  {stats.success}
                </span>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Thất bại</span>
                <span className="text-xl font-black text-rose-600 flex items-center gap-1.5">
                  <CloseCircleOutlined className="text-sm" />
                  {stats.fail}
                </span>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Limit RPM</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{stats.rpmLimit}</span>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Pool Size</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{stats.configuredKeysCount} Key(s)</span>
              </div>
            </div>
          </div>

          {/* Configuration Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-50 dark:border-slate-800">
                <ApiOutlined className="text-slate-800 dark:text-white text-lg" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Thông tin Cấu hình</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded-lg">
                    <KeyOutlined className="text-slate-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Danh sách API Key</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">Tự động xoay vòng qua {stats.configuredKeysCount} keys</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded-lg">
                    <InfoCircleOutlined className="text-slate-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Gemini 1.5 Flash</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">Model mặc định tối ưu hiệu năng</span>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Giới hạn RPM</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Requests Per Minute. Tối đa 15 lần gọi/phút cho mỗi key. Hệ thống sẽ báo lỗi 429 nếu bạn gửi yêu cầu quá dồn dập.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Giới hạn RPD</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Requests Per Day. Giới hạn 1,500 lần gọi/ngày. Đây là giới hạn quan trọng nhất cần theo dõi để tránh dừng dịch vụ.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Token Usage</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Gemini 1.5 Flash cho phép 1M TPM. Tuy nhiên giới hạn về Request (RPD) thường sẽ đạt ngưỡng trước giới hạn Token.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
