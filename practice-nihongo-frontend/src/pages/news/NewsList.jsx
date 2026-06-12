import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, Spin, Typography, Tag, Space, Alert, Button, message, Pagination, Input, Select } from 'antd';
import { CalendarOutlined, ReadOutlined, ArrowRightOutlined, SyncOutlined, CheckCircleOutlined, FormOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

const { Title, Paragraph, Text } = Typography;

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [crawling, setCrawling] = useState(false);
  const [crawlingHistory, setCrawlingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const pageSize = 12;
  const { currentUser, fetchWithAuth } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';
  const [readStatuses, setReadStatuses] = useState({});
  const [noteStatuses, setNoteStatuses] = useState({});

  useEffect(() => {
    if (currentUser) {
      fetchWithAuth(`${API_BASE_URL}/progress/by-prefix?prefix=news_read_&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
           if (!Array.isArray(data)) return;
           const map = {};
           data.forEach(item => {
             const newsId = item.progressKey.replace('news_read_', '');
             const val = String(item.progressData).replace(/['"]/g, '');
             map[newsId] = val === 'true';
           });
           setReadStatuses(map);
        })
        .catch(err => console.error(err));

      fetchWithAuth(`${API_BASE_URL}/progress/by-prefix?prefix=news_note_&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
           if (!Array.isArray(data)) return;
           const map = {};
           data.forEach(item => {
             const newsId = item.progressKey.replace('news_note_', '');
             map[newsId] = !!item.progressData;
           });
           setNoteStatuses(map);
        })
        .catch(err => console.error(err));
    }
  }, [currentUser, fetchWithAuth]);

  const fetchNews = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/news`)
      .then(res => res.json())
      .then(data => {
        setNews(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Không thể tải danh sách bài báo');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleCrawl = async () => {
    setCrawling(true);
    try {
      const response = await fetch(`${API_BASE_URL}/news/crawl`, { method: 'POST' });
      if (response.ok) {
        message.success('Đang lấy tin mới, hệ thống sẽ tự tải lại...');
        // Refresh list after a delay
        setTimeout(() => {
          fetchNews();
        }, 3000);
      } else {
        message.error('Lỗi khi yêu cầu crawl tin tức!');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ.');
    } finally {
      setCrawling(false);
    }
  };

  const handleCrawlHistory = async () => {
    setCrawlingHistory(true);
    try {
      const response = await fetch(`${API_BASE_URL}/news/crawl-history?pages=5`, { method: 'POST' });
      if (response.ok) {
        message.success('Đang lấy 5 trang báo cũ chạy ngầm. Quá trình này có thể tốn vài phút!');
      } else {
        message.error('Lỗi khi yêu cầu lấy báo cũ!');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ.');
    } finally {
      setCrawlingHistory(false);
    }
  };



  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-950 pt-24">
      <Spin size="large" />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto p-10 pt-32 mt-10">
      <Alert type="error" message={error} description="Đã có lỗi xảy ra khi kết nối máy chủ." showIcon />
    </div>
  );

  const filteredNews = news.filter(article => {
    if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    const isRead = currentUser && readStatuses[article.id];
    if (filterStatus === 'unread' && isRead) return false;
    if (filterStatus === 'read' && !isRead) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Báo Nhật Mỗi Ngày
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-xl font-medium">
              Tin tức cập nhật tự động từ NHK News mỗi ngày.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {isAdmin && (
              <>
                <Button
                  type="default"
                  icon={<SyncOutlined spin={crawlingHistory} />}
                  onClick={handleCrawlHistory}
                  loading={crawlingHistory}
                  className="rounded-full px-6 h-10 font-bold border-slate-300 text-slate-700 hover:text-indigo-600 hover:border-indigo-600 shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  Lấy báo cũ (5 trang)
                </Button>
                <Button
                  type="primary"
                  icon={<SyncOutlined spin={crawling} />}
                  onClick={handleCrawl}
                  loading={crawling}
                  className="bg-slate-900 hover:bg-slate-800 text-white border-none rounded-full px-6 h-10 font-bold shadow-md flex items-center justify-center gap-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white w-full sm:w-auto"
                >
                  Cập nhật tin mới
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Input 
            prefix={<SearchOutlined className="text-slate-400 mr-1" />} 
            placeholder="Tìm kiếm bài báo..." 
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setSearchParams({ page: 1 }); }}
            className="rounded-[1rem] h-12 flex-1 shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
          <Select
            value={filterStatus}
            onChange={val => { setFilterStatus(val); setSearchParams({ page: 1 }); }}
            className="w-full sm:w-48 h-12 rounded-[1rem] [&>.ant-select-selector]:rounded-[1rem] [&>.ant-select-selector]:h-12 [&>.ant-select-selector]:items-center shadow-sm"
            options={[
              { value: 'all', label: 'Tất cả bài báo' },
              { value: 'unread', label: 'Chưa đọc' },
              { value: 'read', label: 'Đã đọc' },
            ]}
          />
        </div>

        {filteredNews.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
            <ReadOutlined className="text-5xl text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Không tìm thấy bài báo nào</h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredNews.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(article => {
                const isRead = currentUser && readStatuses[article.id];
                const hasNote = currentUser && noteStatuses[article.id];

                return (
                <Link to={`/news/${article.id}`} key={article.id} className="group flex">
                  <div className="flex flex-col w-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500">
                    <div className="relative h-56 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                      {article.imageUrl ? (
                        <img
                          alt={article.title}
                          src={article.imageUrl}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ReadOutlined className="text-5xl text-slate-400 dark:text-slate-600" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        <span className="bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm w-fit">
                          N4 - N3
                        </span>
                        {hasNote && (
                          <span className="bg-amber-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 w-fit">
                            <FormOutlined /> Có ghi chú
                          </span>
                        )}
                      </div>
                      {isRead && (
                        <div className="absolute top-6 right-[-36px] w-[150px] bg-emerald-500 text-white text-[10px] font-black tracking-widest py-1.5 text-center shadow-lg rotate-45 flex items-center justify-center gap-1 z-10 pointer-events-none">
                          <CheckCircleOutlined className="text-[10px]" /> ĐÃ ĐỌC
                        </div>
                      )}
                    </div>

                    <div className="p-6 md:p-8 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 mb-3">
                        <CalendarOutlined />
                        <span>{new Date(article.publishedAt).toLocaleDateString('vi-VN')}</span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug line-clamp-3 mb-6 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {article.title}
                      </h3>

                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] font-black tracking-widest uppercase text-slate-400 group-hover:text-indigo-500 transition-colors">
                          Đọc bài báo
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                          <ArrowRightOutlined className="text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )})}
            </div>

            {filteredNews.length > pageSize && (
              <div className="flex justify-center mt-12 mb-8">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredNews.length}
                  onChange={(page) => {
                    setSearchParams({ page });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  showSizeChanger={false}
                  className="custom-pagination"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
