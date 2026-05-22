import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spin, Typography, Breadcrumb, Alert, Card, Switch, Button, message } from 'antd';
import { HomeOutlined, ReadOutlined, SoundOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
// Tùy chỉnh CSS để hiển thị ruby/furigana đẹp hơn
import './news.css';

const { Title, Paragraph } = Typography;

export default function NewsDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFurigana, setShowFurigana] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [vocabList, setVocabList] = useState([]);
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';

  useEffect(() => {
    const controller = new AbortController();
    
    fetch(`${API_BASE_URL}/news/${id}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setArticle(data);
        if (data.extractedVocab) {
            try {
                setVocabList(JSON.parse(data.extractedVocab));
            } catch (e) {
                console.error("Lỗi parse vocab:", e);
            }
        }
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
      window.speechSynthesis.cancel();
    };
  }, [id]);

  const handlePlayAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!article || !article.contentRaw) return;

    const utterance = new SpeechSynthesisUtterance(article.contentRaw);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9; 

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.cancel(); 
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleExtractVocab = async () => {
    setExtracting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/news/${id}/extract-vocab`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
        if (data.extractedVocab) {
            try {
                setVocabList(JSON.parse(data.extractedVocab));
                message.success('Đã trích xuất từ vựng thành công!');
            } catch (e) {
                message.error('Lỗi khi đọc dữ liệu từ AI.');
            }
        }
      } else {
        message.error('Lỗi khi yêu cầu AI trích xuất!');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ.');
    } finally {
      setExtracting(false);
    }
  };

  if (loading) return <div className="text-center pt-32"><Spin size="large" /></div>;
  if (!article) return <div className="p-10 pt-32 max-w-3xl mx-auto"><Alert type="error" message="Không tìm thấy bài báo" /></div>;

  return (
    <div className="max-w-3xl mx-auto p-6 pt-28">
      <Breadcrumb 
        className="mb-6"
        items={[
          {
            href: '/',
            title: <HomeOutlined />,
          },
          {
            href: '/news',
            title: <><ReadOutlined /> Tin tức</>,
          },
          {
            title: 'Chi tiết',
          },
        ]}
      />

      {article.imageUrl && (
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full rounded-xl shadow-md mb-8 max-h-[400px] object-cover" 
        />
      )}

      <Title level={2} className="dark:text-white mb-4">{article.title}</Title>
      
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 w-fit mb-6 max-w-full">
        {article.audioUrl ? (
          <audio 
            controls 
            src={article.audioUrl} 
            className="h-10 w-full sm:w-64 max-w-full mr-2 rounded-lg"
          >
            Trình duyệt của bạn không hỗ trợ thẻ audio.
          </audio>
        ) : (
          <Button 
            type={isPlaying ? "primary" : "default"}
            danger={isPlaying}
            shape="round" 
            icon={isPlaying ? <PauseCircleOutlined /> : <SoundOutlined />}
            onClick={handlePlayAudio}
            className="font-bold mr-2"
          >
            {isPlaying ? "Dừng" : "Đọc tự động"}
          </Button>
        )}
        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 border-l border-slate-200 dark:border-slate-600 pl-3">Furigana</span>
        <Switch 
          checked={showFurigana} 
          onChange={setShowFurigana} 
          checkedChildren="Bật" 
          unCheckedChildren="Tắt"
          className={showFurigana ? "bg-indigo-500" : "bg-slate-300"}
        />
      </div>
      
      {/* Hiển thị HTML nội dung đã cào về có chứa các thẻ <ruby> (Furigana) */}
      <Card className="shadow-sm dark:bg-slate-800 dark:border-slate-700 leading-relaxed nhk-article-content text-lg">
        <style>
          {`
            ${!showFurigana ? '.nhk-article-content rt { display: none; }' : ''}
          `}
        </style>
        <div dangerouslySetInnerHTML={{ __html: article.contentWithFurigana }} />
      </Card>

      {/* Phần Từ vựng AI */}
      {(vocabList.length > 0 || isAdmin) && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <Title level={3} className="m-0 dark:text-white flex items-center gap-2">
              Gợi ý từ vựng từ AI
            </Title>
            {vocabList.length === 0 && isAdmin && (
              <Button 
                type="primary" 
                onClick={handleExtractVocab} 
                loading={extracting}
                className="bg-slate-900 hover:bg-slate-800 text-white border-none rounded-full px-6 h-10 font-bold shadow-md dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Phân tích bằng AI
              </Button>
            )}
          </div>

          {vocabList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vocabList.map((item, index) => (
                <div 
                  key={index}
                  className="group relative flex flex-col p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.05)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Decorative background element */}
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-end gap-3 mb-4">
                      <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                        {item.word}
                      </span>
                      <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-1">
                        {item.reading}
                      </span>
                    </div>
                    
                    <div className="w-8 h-1 bg-slate-200 dark:bg-slate-700 mb-4 group-hover:bg-slate-800 dark:group-hover:bg-slate-300 transition-colors duration-300 rounded-full"></div>
                    
                    <p className="text-base font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.meaning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-slate-700 p-10 flex flex-col items-center justify-center text-center group transition-colors duration-300 hover:border-slate-400 dark:hover:border-slate-600">
              <p className="text-slate-600 dark:text-slate-400 font-medium max-w-sm mt-2">
                Bài báo này chưa được phân tích từ vựng. Bấm "Phân tích bằng AI" để hệ thống tự động trích xuất các từ JLPT quan trọng.
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 text-center text-slate-500">
        <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
          Đọc nguồn gốc trên NHK Easy
        </a>
      </div>
    </div>
  );
}
