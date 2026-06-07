import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Spin, Typography, Breadcrumb, Alert, Card, Switch, Button, message } from 'antd';
import { HomeOutlined, ReadOutlined, SoundOutlined, PauseCircleOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import './news.css';

const { Title, Paragraph } = Typography;

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showTranslationText, setShowTranslationText] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [vocabList, setVocabList] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [popupPosition, setPopupPosition] = useState(null);
  const [quickTranslation, setQuickTranslation] = useState('');
  const [isQuickTranslating, setIsQuickTranslating] = useState(false);
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
                const parsedList = JSON.parse(data.extractedVocab);
                const uniqueList = Array.isArray(parsedList) 
                    ? parsedList.filter((v, i, a) => a.findIndex(t => t.word === v.word) === i) 
                    : [];
                setVocabList(uniqueList);
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
                const parsedList = JSON.parse(data.extractedVocab);
                const uniqueList = Array.isArray(parsedList) 
                    ? parsedList.filter((v, i, a) => a.findIndex(t => t.word === v.word) === i) 
                    : [];
                setVocabList(uniqueList);
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
  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/news/${id}/translate`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
        setShowTranslationText(true);
        message.success('Đã dịch bài thành công!');
      } else {
        message.error('Lỗi khi yêu cầu AI dịch bài!');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ.');
    } finally {
      setTranslating(false);
    }
  };
  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      const response = await fetch(`${API_BASE_URL}/news/${id}/generate-quiz`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
        if (data.quizData) {
            setQuizList(JSON.parse(data.quizData));
            message.success('Đã tạo câu hỏi trắc nghiệm thành công!');
        }
      } else {
        message.error('Lỗi khi tạo trắc nghiệm!');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handlePointerUp = (e) => {
    // Timeout needed to let selection update natively first
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      if (text) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setPopupPosition({
          top: rect.bottom + window.scrollY + 10,
          left: rect.left + window.scrollX + (rect.width / 2)
        });
        setQuickTranslation('');
      }
    }, 10);
  };

  const handleContentClick = (e) => {
    // Prevent accidental paragraph selection on touch devices
    if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;

    // If user is selecting text, do not trigger paragraph click
    if (window.getSelection().toString().trim()) return;

    let target = e.target;
    while (target && target.tagName !== 'P' && !target.classList?.contains('nhk-article-content')) {
      target = target.parentElement;
    }

    if (target && target.tagName === 'P') {
      const text = target.innerText.trim();
      if (text) {
        const rect = target.getBoundingClientRect();
        setSelectedText(text);
        setPopupPosition({
          top: Math.min(rect.bottom + window.scrollY + 10, window.scrollY + window.innerHeight - 150),
          left: rect.left + window.scrollX + (rect.width / 2)
        });
        setQuickTranslation('');
      }
    } else {
      if (!isQuickTranslating) {
        setSelectedText('');
        setPopupPosition(null);
        setQuickTranslation('');
      }
    }
  };

  const handleQuickTranslate = async () => {
    if (!selectedText) return;
    setIsQuickTranslating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText })
      });
      if (response.ok) {
        const data = await response.text();
        setQuickTranslation(data);
      } else {
        message.error('Lỗi dịch thuật!');
      }
    } catch (error) {
      message.error('Lỗi kết nối!');
    } finally {
      setIsQuickTranslating(false);
    }
  };

  if (loading) return <div className="text-center pt-32"><Spin size="large" /></div>;
  if (!article) return <div className="p-10 pt-32 max-w-3xl mx-auto"><Alert type="error" message="Không tìm thấy bài báo" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 pt-48 md:pt-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-20">
        <Breadcrumb 
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
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          className="rounded-full font-medium text-slate-600 hover:text-indigo-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all hover:-translate-x-1 w-fit"
        >
          Quay lại danh sách
        </Button>
      </div>

      {article.imageUrl && (
        <div className="w-full mb-8 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden flex justify-center items-center p-2 shadow-md">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full max-h-[500px] object-contain rounded-lg" 
          />
        </div>
      )}

      <h1 className="font-kanji text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-8 leading-tight tracking-tight">
        {article.title}
      </h1>
      
      <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-[1.25rem] border border-slate-200/60 dark:border-slate-800 w-full sm:w-fit mb-10 max-w-full backdrop-blur-sm">
        {article.audioUrl ? (
          <audio 
            controls 
            src={article.audioUrl} 
            className="h-11 w-full sm:w-72 max-w-full rounded-xl"
          >
            Trình duyệt của bạn không hỗ trợ thẻ audio.
          </audio>
        ) : (
          <Button 
            type={isPlaying ? "primary" : "default"}
            danger={isPlaying}
            shape="round" 
            size="large"
            icon={isPlaying ? <PauseCircleOutlined /> : <SoundOutlined />}
            onClick={handlePlayAudio}
            className={`font-bold px-6 shadow-sm border-none w-full sm:w-auto ${isPlaying ? '' : 'bg-white text-slate-700 hover:text-indigo-600'}`}
          >
            {isPlaying ? "Đang đọc..." : "Nghe tự động"}
          </Button>
        )}
        
        <div className="flex items-center gap-3 pl-4 pr-3 py-1 border-l-2 border-slate-200/80 dark:border-slate-700">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Furigana</span>
          <Switch 
            checked={showFurigana} 
            onChange={setShowFurigana} 
            className={showFurigana ? "bg-indigo-500" : "bg-slate-300"}
          />
        </div>

        {article.translation && (
          <div className="flex items-center gap-3 pl-4 pr-3 py-1 border-l-2 border-slate-200/80 dark:border-slate-700">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Dịch nghĩa</span>
            <Switch 
              checked={showTranslationText} 
              onChange={setShowTranslationText} 
              className={showTranslationText ? "bg-indigo-500" : "bg-slate-300"}
            />
          </div>
        )}
      </div>
      
      <Card 
        className="shadow-xl shadow-slate-200/40 dark:shadow-none dark:bg-slate-800/80 dark:border-slate-700/80 rounded-[2rem] border-0 leading-loose nhk-article-content font-kanji text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-200 mb-8"
        onPointerUp={handlePointerUp}
        onClick={handleContentClick}
      >
        <style>
          {`
            ${!showFurigana ? '.nhk-article-content rt { display: none; }' : ''}
            .nhk-article-content p {
              padding: 0.5rem;
              margin-bottom: 0.5rem;
              border-radius: 0.75rem;
              transition: all 0.2s;
            }
            .nhk-article-content p:hover {
              background-color: rgba(99, 102, 241, 0.08); /* indigo-500 with low opacity */
              cursor: pointer;
            }
          `}
        </style>
        <div dangerouslySetInnerHTML={{ __html: article.contentWithFurigana }} />
      </Card>

      {/* Floating Translate Popup */}
      {popupPosition && selectedText && (
        <div 
          className="absolute z-50 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl p-5 border border-slate-100 dark:border-slate-800 w-80 max-w-[90vw]"
          style={{ top: popupPosition.top, left: popupPosition.left, transform: 'translateX(-50%)' }}
          onPointerDown={(e) => e.stopPropagation()} 
        >
          {quickTranslation ? (
             <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                   <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Bản dịch AI</p>
                   <button onClick={() => { setSelectedText(''); setPopupPosition(null); }} className="text-[10px] text-slate-400 hover:text-black dark:hover:text-white font-black uppercase tracking-widest transition-colors">Đóng</button>
                </div>
                <div className="text-slate-900 dark:text-white font-medium text-sm leading-relaxed">{quickTranslation}</div>
             </div>
          ) : (
             <div className="flex flex-col gap-4">
               <div className="flex justify-between items-start gap-2">
                 <div className="text-sm font-medium text-slate-500 dark:text-slate-400 italic line-clamp-2 leading-relaxed">"{selectedText}"</div>
                 <button 
                   onClick={() => { setSelectedText(''); setPopupPosition(null); }} 
                   className="text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                   title="Đóng"
                 >
                   <CloseOutlined />
                 </button>
               </div>
               <Button 
                 type="primary" 
                 size="large" 
                 shape="round" 
                 className="bg-black dark:bg-white text-white dark:text-black border-none font-bold shadow-xl hover:-translate-y-0.5 transition-transform w-full" 
                 loading={isQuickTranslating} 
                 onClick={handleQuickTranslate}
               >
                  {isQuickTranslating ? 'Đang dịch...' : 'Dịch nhanh'}
               </Button>
             </div>
          )}
        </div>
      )}

      {(article.translation || isAdmin) && (
        <div className="mb-12">
          {!article.translation && isAdmin ? (
            <Button 
              type="primary" 
              onClick={handleTranslate} 
              loading={translating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-full px-6 h-10 font-bold shadow-md w-full sm:w-auto"
            >
              Dịch bài bằng AI
            </Button>
          ) : (
            article.translation && showTranslationText && (
              <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">Bản dịch tiếng Việt</h3>
                <div className="text-base md:text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                  {article.translation}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {(vocabList.length > 0 || isAdmin) && (
        <div className="mt-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-black m-0 text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
              Từ vựng
            </h2>
            {vocabList.length === 0 && isAdmin && (
              <Button 
                type="primary" 
                onClick={handleExtractVocab} 
                loading={extracting}
                className="bg-slate-900 hover:bg-slate-800 text-white border-none rounded-full px-6 h-10 font-bold shadow-md dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white w-full sm:w-auto"
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
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-end gap-3 mb-4">
                      <span className="font-kanji text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
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
