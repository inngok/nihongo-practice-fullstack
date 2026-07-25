import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Type, Languages } from 'lucide-react';

export default function ListeningPlayer({ audioSrc, scriptData = [] }) {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [showFurigana, setShowFurigana] = useState(false);
  const [showVietnamese, setShowVietnamese] = useState(false);

  // Toggle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Reset when src changes
  useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [audioSrc]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 overflow-hidden flex flex-col h-[600px] md:h-[800px] relative shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-300">
      
      {/* Native Audio Element (Hidden) */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header / Player Controls */}
      <div className="p-6 md:p-8 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/60 relative z-10 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 flex items-center justify-center">
              <Volume2 size={18} />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Listening</span>
          </div>
          <span className="text-xs font-semibold font-mono text-slate-400 dark:text-slate-500 tracking-wider">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative group mb-8">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-slate-900 dark:accent-white transition-all group-hover:h-2 touch-none"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="w-20" /> {/* Spacer to balance toggles */}
          
          <div className="flex items-center gap-6">
            <button
              onClick={handleReplay}
              className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Nghe lại từ đầu"
            >
              <RotateCcw size={22} />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-14 h-14 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:scale-105 transition-transform duration-200 shadow-md"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
          </div>
          
          {/* Toggles */}
          <div className="flex items-center gap-2 w-20 justify-end">
            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all text-sm font-medium ${showFurigana ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
              title="Bật/Tắt Furigana"
            >
              <Type size={16} />
            </button>
            <button
              onClick={() => setShowVietnamese(!showVietnamese)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all text-sm font-medium ${showVietnamese ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
              title="Bật/Tắt Dịch Tiếng Việt"
            >
              <Languages size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Script Area */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-8 sm:p-12 bg-white dark:bg-slate-950 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {scriptData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
            <p className="font-medium text-sm tracking-wide">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-16">
            {scriptData.map((line) => (
              <div 
                key={line.id} 
                className="flex flex-col gap-2 pb-6 border-b border-slate-100 dark:border-slate-800/50 last:border-0 last:pb-0"
              >
                {/* Japanese with Furigana */}
                <div className="text-[1.15rem] sm:text-[1.3rem] leading-[2.5] tracking-wide font-medium text-slate-800 dark:text-slate-200">
                  {renderFurigana(line.japanese, showFurigana)}
                </div>
                {/* Vietnamese Translation */}
                {line.vietnamese && showVietnamese && (
                  <div className="text-[0.95rem] sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed mt-1 animate-in fade-in slide-in-from-top-1 duration-300">
                    {line.vietnamese}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to render Furigana from Kanji[furigana] format
function renderFurigana(text, showFurigana) {
  if (!text) return null;
  // Match 1 or more kanji characters followed by [...]
  const regex = /([\u4e00-\u9faf]+)\[([^\]]+)\]/g;
  
  const elements = [];
  let lastIndex = 0;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
    }
    
    // Add the furigana ruby
    elements.push(
      <ruby key={`ruby-${match.index}`} className="mx-[1px]" style={{ rubyPosition: 'over' }}>
        <span>{match[1]}</span>
        <rt className={`relative -top-[3px] text-[0.65em] text-slate-500 font-normal select-none tracking-normal transition-opacity duration-200 ${showFurigana ? 'opacity-100' : 'opacity-0'}`}>
          {match[2]}
        </rt>
      </ruby>
    );
    
    lastIndex = regex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }
  
  return elements;
}
