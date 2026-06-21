import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Input, Row, Col, Typography, message, Tooltip, Space } from 'antd';
import { 
  PlayCircleFilled, PauseCircleFilled, BackwardOutlined, ForwardOutlined, 
  ReloadOutlined, EyeOutlined, EyeInvisibleOutlined, StepForwardOutlined, FlagOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

// Helper to chunk Japanese text roughly since we don't have a real tokenizer
const chunkSentence = (sentence) => {
  if (!sentence) return [];
  const parts = sentence.split('、');
  const chunks = [];
  parts.forEach((p, i) => {
    const text = i === parts.length - 1 ? p : p + '、';
    if (!text) return;
    if (text.length > 8) {
      for (let j = 0; j < text.length; j += 6) {
        chunks.push(text.slice(j, j + 6));
      }
    } else {
      chunks.push(text);
    }
  });
  return chunks;
};

export default function NewsDictationArea({ 
  article,
  initialProgress,
  onProgressChange
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInputs, setUserInputs] = useState(initialProgress?.userInputs || {});
  // showHints now stores the overall revealed state per sentence, but we also need chunk-level
  const [showHints, setShowHints] = useState(initialProgress?.showHints || {});
  const [revealedChunks, setRevealedChunks] = useState({}); // { 0: { 0: true, 1: false }, 1: ... }
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [errorsCount, setErrorsCount] = useState(0);
  const [replayCount, setReplayCount] = useState(0);

  const audioRef = useRef(null);

  useEffect(() => {
    if (initialProgress) {
      if (initialProgress.userInputs) setUserInputs(initialProgress.userInputs);
      if (initialProgress.showHints) setShowHints(initialProgress.showHints);
    }
  }, [initialProgress]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onProgressChange && (Object.keys(userInputs).length > 0 || Object.keys(showHints).length > 0)) {
        onProgressChange({ userInputs, showHints });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [userInputs, showHints, onProgressChange]);

  const sentences = useMemo(() => {
    if (!article?.contentRaw) return [];
    return article.contentRaw
      .split('。')
      .filter(s => s.trim().length > 0)
      .map(s => s.trim() + '。');
  }, [article?.contentRaw]);

  const currentSentence = sentences[currentIdx] || '';
  const currentChunks = useMemo(() => chunkSentence(currentSentence), [currentSentence]);
  const currentInput = userInputs[currentIdx] || '';
  const isFullyRevealed = showHints[currentIdx] || false;

  const handlePlayTTS = (text) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = playbackRate; 
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setReplayCount(prev => prev + 1);
  };

  const handlePlayMedia = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      handlePlayTTS(currentSentence);
    }
  };

  useEffect(() => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentIdx]);

  const handleInputChange = (e) => {
    setUserInputs({ ...userInputs, [currentIdx]: e.target.value });
  };

  const handleRevealAll = () => {
    setShowHints({ ...showHints, [currentIdx]: true });
    const allChunksRevealed = {};
    currentChunks.forEach((_, i) => {
      allChunksRevealed[i] = true;
    });
    setRevealedChunks({ ...revealedChunks, [currentIdx]: allChunksRevealed });
  };

  const handleRevealChunk = (chunkIndex) => {
    const currentSentenceChunks = revealedChunks[currentIdx] || {};
    const isRevealed = currentSentenceChunks[chunkIndex];
    
    const newSentenceChunks = { ...currentSentenceChunks, [chunkIndex]: !isRevealed };
    setRevealedChunks({ ...revealedChunks, [currentIdx]: newSentenceChunks });
    
    // If all chunks are revealed, set the whole sentence as revealed
    const allRevealed = currentChunks.every((_, i) => newSentenceChunks[i]);
    if (allRevealed) {
      setShowHints({ ...showHints, [currentIdx]: true });
    } else {
      setShowHints({ ...showHints, [currentIdx]: false });
    }
  };

  const handleNext = () => {
    if (currentIdx < sentences.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      message.success('Bạn đã hoàn thành bài luyện nghe!');
    }
  };

  const toggleSpeed = () => {
    const nextSpeed = playbackRate === 1 ? 0.75 : (playbackRate === 0.75 ? 0.5 : 1);
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  if (!sentences.length) return null;

  return (
    <div className="dictation-container py-8 px-4 md:px-8 relative rounded-[2rem] overflow-hidden mt-6" style={{
      backgroundColor: '#f0f4f8',
      backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      <Row gutter={[24, 24]} className="max-w-6xl mx-auto">
        <Col xs={24} lg={15}>
          {/* Media Player Area (mimicking the video area in Todai) */}
          <div className="bg-black rounded-xl overflow-hidden shadow-md mb-6 relative aspect-video flex items-center justify-center">
            {article.imageUrl ? (
              <>
                <img src={article.imageUrl} alt="article" className="w-full h-full object-cover opacity-60" />
                {article.audioUrl && (
                  <audio 
                    ref={audioRef}
                    src={article.audioUrl} 
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    className="absolute bottom-4 left-4 right-4 w-[calc(100%-2rem)]"
                    controls
                  />
                )}
              </>
            ) : (
              <div className="text-white flex flex-col items-center">
                <PlayCircleFilled className="text-6xl text-blue-500 mb-4 opacity-80 cursor-pointer hover:opacity-100" onClick={handlePlayMedia} />
                <span>{article.audioUrl ? "Phát Audio Gốc" : "Phát Âm Thanh AI"}</span>
              </div>
            )}
          </div>

          {/* Dictation Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-700 m-0 uppercase">Chép chính tả</h3>
            </div>
            
            <div className="p-5">


              {/* Input Area */}
              <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                  <Text className="text-xs font-medium text-slate-500 uppercase tracking-wide block">
                    Gõ những gì bạn nghe được:
                  </Text>
                  <Button 
                    size="small"
                    type="primary"
                    ghost
                    icon={<PlayCircleFilled />}
                    onClick={() => handlePlayTTS(currentSentence)}
                    className="font-bold text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                  >
                    Nghe câu này (AI)
                  </Button>
                </div>
                <Input.TextArea
                  rows={4}
                  value={currentInput}
                  onChange={handleInputChange}
                  placeholder="Gõ câu trả lời của bạn tại đây..."
                  className="text-lg font-kanji p-4 rounded-lg border-slate-300 focus:border-blue-500 shadow-inner bg-slate-50"
                />
              </div>

              {/* Hidden Chunks Row */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-3">
                  {currentChunks.map((chunk, i) => {
                    const isChunkRevealed = revealedChunks[currentIdx]?.[i] || isFullyRevealed;
                    return (
                      <div key={i} className="flex flex-col items-center">
                        <Button 
                          size="small" 
                          type="text" 
                          icon={isChunkRevealed ? <EyeOutlined className="text-slate-400" /> : <EyeInvisibleOutlined className="text-slate-400" />} 
                          onClick={() => handleRevealChunk(i)}
                          className="mb-1"
                        />
                        {isChunkRevealed ? (
                          <span className="font-kanji font-medium text-slate-800 text-lg border-b-2 border-slate-300 pb-1 px-1">
                            {chunk}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold tracking-widest px-2">
                            {Array(Math.min(chunk.length, 5)).fill('·').join(' ')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 mt-3 text-center">
                  Nhấp vào biểu tượng con mắt để hiện từ
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="large" 
                  onClick={handleRevealAll}
                  className="flex-1 bg-[#ffc107] hover:bg-[#e0a800] text-slate-900 border-none font-bold shadow-sm"
                >
                  HIỆN TẤT CẢ TỪ
                </Button>
                <Button 
                  size="large" 
                  type="primary"
                  onClick={handleNext}
                  className="flex-1 bg-[#0d6efd] hover:bg-[#0b5ed7] border-none font-bold shadow-sm"
                  icon={<StepForwardOutlined />}
                >
                  TIẾP THEO
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
                <span className="text-xs text-red-500 font-medium flex items-center gap-1 mb-1">
                  <span className="w-3 h-3 rounded-full border border-red-500 flex items-center justify-center text-[8px]">x</span> Lỗi sai
                </span>
                <span className="text-xl font-bold text-slate-800">{errorsCount}</span>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
                <span className="text-xs text-blue-500 font-medium flex items-center gap-1 mb-1">
                  <ReloadOutlined /> Lượt phát lại
                </span>
                <span className="text-xl font-bold text-slate-800">{replayCount}</span>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
                <span className="text-xs text-amber-500 font-medium flex items-center gap-1 mb-1">
                  ⚠️ Lý do
                </span>
                <span className="text-xs text-slate-600 leading-tight">
                  Hãy bắt đầu nghe và gõ câu bạn nghe được.
                </span>
              </div>
            </Col>
          </Row>
        </Col>

        {/* Right Sidebar */}
        <Col xs={24} lg={9}>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col max-h-[800px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="text-base font-bold text-slate-700 m-0 uppercase">Phiên âm</h3>
              <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                Cần ôn {sentences.length} câu
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-slate-50/50">
              {sentences.map((sentence, idx) => {
                const chunks = chunkSentence(sentence);
                const isFullyRevealed = showHints[idx];
                const sentenceRevealedChunks = revealedChunks[idx] || {};

                return (
                  <div 
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`bg-white p-4 rounded-lg border transition-all cursor-pointer shadow-sm relative ${
                      currentIdx === idx ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {currentIdx === idx && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">#{idx + 1}</span>
                      <FlagOutlined className="text-slate-300" />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {chunks.map((chunk, cIdx) => {
                        const isRevealed = isFullyRevealed || sentenceRevealedChunks[cIdx];
                        return (
                          <div key={cIdx} className="inline-block">
                            {isRevealed ? (
                              <span className="font-kanji text-[15px] text-slate-700 bg-slate-50 px-1 rounded">{chunk}</span>
                            ) : (
                              <span className="text-slate-400 tracking-[0.2em] font-bold bg-slate-50 px-2 rounded border border-slate-100">
                                {Array(Math.min(chunk.length, 5)).fill('·').join('')}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Col>
      </Row>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
          border: 2px solid #f8fafc;
        }
      `}} />
    </div>
  );
}
