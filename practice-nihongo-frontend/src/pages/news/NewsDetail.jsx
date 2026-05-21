import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spin, Typography, Breadcrumb, Alert, Card, Switch, Button } from 'antd';
import { HomeOutlined, ReadOutlined, SoundOutlined, PauseCircleOutlined } from '@ant-design/icons';
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
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/news/${id}`)
      .then(res => res.json())
      .then(data => {
        setArticle(data);
        if (data.audioUrl) {
          const newAudio = new Audio(data.audioUrl);
          newAudio.onended = () => setIsPlaying(false);
          setAudio(newAudio);
        }
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });

    return () => {
      window.speechSynthesis.cancel();
      setAudio(prev => {
         if(prev) {
             prev.pause();
             prev.src = "";
         }
         return null;
      });
    };
  }, [id]);

  const handlePlayAudio = () => {
    if (isPlaying) {
      if (audio) {
        audio.pause();
      } else {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    if (audio) {
       audio.play();
       setIsPlaying(true);
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

  if (loading) return <div className="text-center pt-32"><Spin size="large" /></div>;
  if (!article) return <div className="p-10 pt-32 max-w-3xl mx-auto"><Alert type="error" message="Không tìm thấy bài báo" /></div>;

  return (
    <div className="max-w-3xl mx-auto p-6 pt-28">
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item href="/"><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item href="/news"><ReadOutlined /> Tin tức</Breadcrumb.Item>
        <Breadcrumb.Item>Chi tiết</Breadcrumb.Item>
      </Breadcrumb>

      {article.imageUrl && (
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full rounded-xl shadow-md mb-8 max-h-[400px] object-cover" 
        />
      )}

      <Title level={2} className="dark:text-white mb-4">{article.title}</Title>
      
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 w-fit mb-6 max-w-full">
        <Button 
          type={isPlaying ? "primary" : "default"}
          danger={isPlaying}
          shape="round" 
          icon={isPlaying ? <PauseCircleOutlined /> : <SoundOutlined />}
          onClick={handlePlayAudio}
          className="font-bold mr-2"
        >
          {isPlaying ? "Dừng" : "Nghe"}
        </Button>
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
      <Card className="shadow-sm dark:bg-slate-800 dark:border-slate-700 text-lg leading-relaxed nhk-article-content">
        <style>
          {`
            ${!showFurigana ? '.nhk-article-content rt { display: none; }' : ''}
          `}
        </style>
        <div dangerouslySetInnerHTML={{ __html: article.contentWithFurigana }} />
      </Card>
      
      <div className="mt-8 text-center text-slate-500">
        <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
          Đọc nguồn gốc trên NHK Easy
        </a>
      </div>
    </div>
  );
}
