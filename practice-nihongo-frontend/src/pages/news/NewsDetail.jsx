import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Spin, Typography, Breadcrumb, Alert, Card, Switch, Button, message, Input } from 'antd';
import { HomeOutlined, ReadOutlined, SoundOutlined, PauseCircleOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import './news.css';
import NewsDictationArea from './components/NewsDictationArea';
import NewsVocabList from './components/NewsVocabList';
import NewsTranslatePopup from './components/NewsTranslatePopup';
import { CheckCircleOutlined, FormOutlined } from '@ant-design/icons';
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
  const [dictationMode, setDictationMode] = useState(false);
  const [dictationText, setDictationText] = useState('');
  const [showOriginalInDictation, setShowOriginalInDictation] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [dictationProgress, setDictationProgress] = useState(null);
  const { currentUser, fetchWithAuth } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';

  useEffect(() => {
    if (currentUser && id) {
      fetchWithAuth(`${API_BASE_URL}/progress/news_read_${id}?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          const val = String(data.data).replace(/['"]/g, '');
          if (val === 'true') setIsRead(true);
        })
        .catch(err => console.error(err));

      fetchWithAuth(`${API_BASE_URL}/progress/news_dict_${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            try {
              setDictationProgress(JSON.parse(data.data));
            } catch (e) { }
          }
        })
        .catch(err => console.error(err));
    }
  }, [currentUser, id, fetchWithAuth]);

  const handleToggleRead = (checked) => {
    setIsRead(checked);
    if (currentUser) {
      if (checked) {
        fetchWithAuth(`${API_BASE_URL}/progress/news_read_${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: 'true' }),
          keepalive: true
        }).then(() => message.success('Đã đánh dấu là đã đọc!'));
      } else {
        fetchWithAuth(`${API_BASE_URL}/progress/news_read_${id}`, {
          method: 'DELETE',
          keepalive: true
        });
      }
    }
  };

  const handleSaveDictationProgress = (progressData) => {
    if (currentUser && id) {
      fetchWithAuth(`${API_BASE_URL}/progress/news_dict_${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: JSON.stringify(progressData) })
      }).catch(err => console.error("Lỗi lưu tiến độ chép chính tả:", err));
    }
  };

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



        {!dictationMode && (
          <>
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


          </>
        )}

        {dictationMode && (
          <div className="flex items-center gap-3 pl-4 pr-3 py-1 border-l-2 border-slate-200/80 dark:border-slate-700">
            <Button
              type="primary"
              danger
              shape="round"
              icon={<CloseOutlined />}
              onClick={() => setDictationMode(false)}
              className="font-bold shadow-sm"
            >
              Thoát luyện nghe
            </Button>
          </div>
        )}
      </div>

      {dictationMode ? (
        <NewsDictationArea
          article={article}
          initialProgress={dictationProgress}
          onProgressChange={handleSaveDictationProgress}
        />
      ) : (
        <>
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
          <NewsTranslatePopup
            popupPosition={popupPosition}
            selectedText={selectedText}
            quickTranslation={quickTranslation}
            isQuickTranslating={isQuickTranslating}
            onQuickTranslate={handleQuickTranslate}
            onClose={() => { setSelectedText(''); setPopupPosition(null); }}
          />

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

          <div className="flex flex-col items-center justify-center my-8 bg-slate-50 dark:bg-slate-900/30 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
            <h4 className="text-slate-600 dark:text-slate-400 font-medium mb-3">Bạn đã hoàn thành bài viết này?</h4>
            <Button 
              size="large"
              shape="round"
              type={isRead ? "primary" : "default"}
              onClick={() => handleToggleRead(!isRead)}
              icon={<CheckCircleOutlined />}
              className={`font-bold px-8 h-12 shadow-sm transition-all ${isRead ? 'bg-emerald-500 hover:bg-emerald-600 border-none' : 'text-slate-700 hover:text-emerald-600 hover:border-emerald-500'}`}
            >
              {isRead ? "Đã đánh dấu đọc xong" : "Đánh dấu đã đọc"}
            </Button>
          </div>

          <NewsVocabList
            vocabList={vocabList}
            isAdmin={isAdmin}
            extracting={extracting}
            onExtract={handleExtractVocab}
          />

          {isAdmin && (
            <div className="flex justify-center mt-12 mb-8">
              <Button
                onClick={() => setDictationMode(true)}
                className="border-slate-800 text-slate-800 hover:!border-slate-800 hover:!bg-slate-800 hover:!text-white px-6 font-bold uppercase tracking-wider transition-colors rounded"
              >
                Luyện nghe chép bài báo này
              </Button>
            </div>
          )}

        </>
      )}

    </div>
  );
}
