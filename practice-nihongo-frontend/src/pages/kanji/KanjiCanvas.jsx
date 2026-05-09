import React, { useState, useEffect, useRef } from 'react';
import { HeartOutlined, HeartFilled, LeftOutlined, RightOutlined, EyeOutlined, EyeInvisibleOutlined, BorderOutlined, HighlightOutlined, TrophyOutlined, RedoOutlined, SafetyOutlined, EditOutlined } from '@ant-design/icons';
import { message } from 'antd';

export default function KanjiCanvas({ kanjiList, addedKanjiIds, onAddFlashcard, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentKanji = kanjiList[currentIndex];

  // SVG and Tracing Guide States
  const [strokePaths, setStrokePaths] = useState([]);
  const [strokeNumbers, setStrokeNumbers] = useState([]);
  const [svgLoading, setSvgLoading] = useState(false);
  const [svgError, setSvgError] = useState(null);

  // Toggle Controls
  const [showGuide, setShowGuide] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);
  
  // Pen styling
  const [penColor, setPenColor] = useState('#0f172a'); // slate-900 default
  const [penSize, setPenSize] = useState(5.5); // 5.5px default

  // Canvas State
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastCoords = useRef(null);
  const currentStrokePoints = useRef([]);

  // Animation States
  const [isPlaying, setIsPlaying] = useState(false);
  const [animatingIndex, setAnimatingIndex] = useState(-1);

  // --- NEW INTELLIGENT WRITING STATES ---
  // practiceMode: 'guided' (Stroke Order Verification) | 'free' (Doodle / Sketch)
  const [practiceMode, setPracticeMode] = useState('guided');
  const [completedStrokes, setCompletedStrokes] = useState([]);
  const [guideStrokeIndex, setGuideStrokeIndex] = useState(0);
  const [isCharacterCompleted, setIsCharacterCompleted] = useState(false);

  // Fetch and Parse KanjiVG SVG
  useEffect(() => {
    if (!currentKanji || !currentKanji.character) return;

    const char = currentKanji.character;
    const codePoint = char.codePointAt(0);
    const unicodeHex = codePoint.toString(16).padStart(5, '0').toLowerCase();
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${unicodeHex}.svg`;

    setSvgLoading(true);
    setSvgError(null);
    setStrokePaths([]);
    setStrokeNumbers([]);
    setIsPlaying(false);
    setAnimatingIndex(-1);

    // Reset writing progress for new character
    resetGuidedPractice();

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Không tìm thấy mẫu nét viết chữ Hán này.");
        return res.text();
      })
      .then(text => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(text, "image/svg+xml");

        // Parse paths representing strokes (ID containing '-s')
        const paths = Array.from(svgDoc.querySelectorAll('path'))
          .filter(p => p.id && p.id.includes('-s'))
          .map(p => p.getAttribute('d'))
          .filter(Boolean);

        // Parse stroke order label coordinates
        const textNodes = Array.from(svgDoc.querySelectorAll('g[id^="kvg:StrokeNumbers_"] text'));
        const numbers = textNodes.map(node => {
          const transform = node.getAttribute('transform');
          const match = transform ? transform.match(/matrix\(\s*[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)\)/) : null;
          let x = 0;
          let y = 0;
          if (match) {
            x = parseFloat(match[1]);
            y = parseFloat(match[2]);
          } else {
            x = parseFloat(node.getAttribute('x') || 0);
            y = parseFloat(node.getAttribute('y') || 0);
          }
          return {
            text: node.textContent,
            x: x - 2,
            y: y + 2
          };
        });

        setStrokePaths(paths);
        setStrokeNumbers(numbers);
      })
      .catch(err => {
        console.warn(`KanjiVG load error for "${char}":`, err.message);
        setSvgError("Mẫu viết đang được cập nhật, hãy chuyển sang chế độ Vẽ tự do nhé!");
        setPracticeMode('free'); // fallback to free mode
      })
      .finally(() => {
        setSvgLoading(false);
      });
  }, [currentIndex, currentKanji]);

  // Reset guided handwriting data
  const resetGuidedPractice = () => {
    setCompletedStrokes([]);
    setGuideStrokeIndex(0);
    setIsCharacterCompleted(false);
    clearCanvas();
  };

  // Initialize canvas
  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [penColor, penSize, currentIndex, practiceMode]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = penSize;
    ctx.strokeStyle = penColor;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Convert client coords relative to Canvas element
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Mouse / Touch handlers
  const startDrawing = (e) => {
    e.preventDefault();
    if (isCharacterCompleted && practiceMode === 'guided') return; // block further drawing if complete

    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    lastCoords.current = coords;
    currentStrokePoints.current = [coords];
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !lastCoords.current) return;

    ctx.beginPath();
    ctx.moveTo(lastCoords.current.x, lastCoords.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastCoords.current = coords;
    currentStrokePoints.current.push(coords);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastCoords.current = null;

    if (practiceMode === 'guided' && currentStrokePoints.current.length > 1) {
      validateStroke(currentStrokePoints.current);
    }
    currentStrokePoints.current = [];
  };

  // --- Real-time Handwriting Correctness Verification Engine ---
  const validateStroke = (userPoints) => {
    if (userPoints.length < 2 || strokePaths.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / 109; // KanjiVG is standard 109x109 box
    const scaleY = rect.height / 109;

    // 1. Get current expected target path from DOM
    const pathEl = document.getElementById(`guide-path-${guideStrokeIndex}`);
    if (!pathEl) {
      clearCanvas();
      return;
    }

    // 2. Sample 15 coordinates along expected path using SVG native API
    const length = pathEl.getTotalLength();
    const templatePoints = [];
    const sampleCount = 15;
    for (let j = 0; j <= sampleCount; j++) {
      const p = pathEl.getPointAtLength((j / sampleCount) * length);
      templatePoints.push({
        x: p.x * scaleX,
        y: p.y * scaleY
      });
    }

    // 3. Geometrical validation
    const distance = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    const threshold = rect.width * 0.13; // Dynamic responsive threshold (approx 42px in 320x320 box)

    const dStart = distance(userPoints[0], templatePoints[0]);
    const dEnd = distance(userPoints[userPoints.length - 1], templatePoints[templatePoints.length - 1]);

    // Reverse orientation check
    const dStartReverse = distance(userPoints[0], templatePoints[templatePoints.length - 1]);
    const dEndReverse = distance(userPoints[userPoints.length - 1], templatePoints[0]);

    if (dStartReverse < threshold && dEndReverse < threshold) {
      message.warning("Bạn viết ngược hướng bút rồi! Hãy viết từ điểm bắt đầu nét nhé.");
      clearCanvas();
      return;
    }

    if (dStart > threshold || dEnd > threshold) {
      // Wrong position or out of bounds
      clearCanvas();
      return;
    }

    // 4. Overall path correlation matching (Average minimum distance check)
    let totalMinDist = 0;
    for (const u of userPoints) {
      let minDist = Infinity;
      for (const t of templatePoints) {
        const d = distance(u, t);
        if (d < minDist) minDist = d;
      }
      totalMinDist += minDist;
    }
    const avgDist = totalMinDist / userPoints.length;

    if (avgDist < threshold) {
      // CORRECT! Keep as completed SVG vector stroke, and advance
      const nextIndex = guideStrokeIndex + 1;
      setCompletedStrokes(prev => [...prev, guideStrokeIndex]);
      setGuideStrokeIndex(nextIndex);
      clearCanvas(); // clear canvas so it renders clean SVG paths

      if (nextIndex === strokePaths.length) {
        // Character completed!
        setIsCharacterCompleted(true);
      }
    } else {
      // Incorrect path shape
      clearCanvas();
    }
  };

  // Stroke-by-Stroke Animation Player
  const playStrokeAnimation = () => {
    if (strokePaths.length === 0) return;
    clearCanvas();
    setIsPlaying(true);
    setAnimatingIndex(0);
  };

  useEffect(() => {
    if (!isPlaying || animatingIndex === -1) return;

    const timer = setTimeout(() => {
      if (animatingIndex < strokePaths.length - 1) {
        setAnimatingIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setAnimatingIndex(-1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isPlaying, animatingIndex, strokePaths]);

  // Card navigation
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < kanjiList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (!currentKanji) {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Không tìm thấy chữ Hán nào</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-6 animate-fadeIn">
      
      {/* Premium Writing Mode Switch Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100/80 p-1 rounded-2xl flex items-center border border-slate-200/40 shadow-inner">
          <button
            onClick={() => {
              setPracticeMode('guided');
              resetGuidedPractice();
            }}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              practiceMode === 'guided'
                ? 'bg-white text-slate-900 shadow-md border border-slate-200/10'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            <SafetyOutlined />
            Luyện theo nét (Có check đúng sai)
          </button>
          <button
            onClick={() => {
              setPracticeMode('free');
              clearCanvas();
            }}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              practiceMode === 'free'
                ? 'bg-white text-slate-900 shadow-md border border-slate-200/10'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            <EditOutlined />
            Vẽ tự do
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE CANVAS WRAPPER */}
        <div className="lg:col-span-6 flex flex-col items-center gap-6">
          
          {/* Main Drawing Square */}
          <div className="relative w-[320px] h-[320px] bg-white border border-slate-200 rounded-[2.5rem] shadow-lg shadow-slate-100 overflow-hidden select-none">
            
            {/* SVG Practice Book Grid Lines (田 Grid) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 109 109">
              <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="#f1f5f9" strokeDasharray="3,3" strokeWidth="0.5" />
              <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="#f1f5f9" strokeDasharray="3,3" strokeWidth="0.5" />
              <line x1="0" y1="0" x2="109" y2="109" stroke="#f8fafc" strokeDasharray="1,5" strokeWidth="0.5" />
              <line x1="109" y1="0" x2="0" y2="109" stroke="#f8fafc" strokeDasharray="1,5" strokeWidth="0.5" />
            </svg>

            {/* KanjiVG Template Layer */}
            {!svgLoading && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 109 109">
                
                {/* 1. Underlying Tracing Guides */}
                {strokePaths.map((d, idx) => (
                  <path
                    id={`guide-path-${idx}`}
                    key={`guide-${idx}`}
                    d={d}
                    fill="none"
                    stroke={
                      practiceMode === 'guided'
                        ? completedStrokes.includes(idx)
                          ? penColor // draw completed strokes in active ink color
                          : idx === guideStrokeIndex
                          ? 'rgba(79, 70, 229, 0.15)' // highlight current target stroke in faint blue
                          : 'rgba(15, 23, 42, 0.03)' // hides future strokes
                        : showGuide && !isPlaying
                        ? 'rgba(15, 23, 42, 0.07)' // free mode light gray template
                        : 'none'
                    }
                    strokeWidth={practiceMode === 'guided' && idx === guideStrokeIndex ? 8 : 6.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {/* 2. Pulsing Guided Stroke Overlay */}
                {practiceMode === 'guided' && !isCharacterCompleted && strokePaths[guideStrokeIndex] && (
                  <path
                    d={strokePaths[guideStrokeIndex]}
                    fill="none"
                    stroke="#4f46e5" // Indigo guide
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-pulse"
                    strokeDasharray="4,4"
                  />
                )}

                {/* 3. Sequential Stroke Animations Overlay */}
                {isPlaying && strokePaths.map((d, idx) => {
                  if (idx > animatingIndex) return null;
                  const isCurrent = idx === animatingIndex;

                  return (
                    <path
                      key={`anim-${idx}`}
                      d={d}
                      fill="none"
                      stroke={isCurrent ? '#4f46e5' : 'rgba(15, 23, 42, 0.4)'}
                      strokeWidth={isCurrent ? 7.5 : 5.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={200}
                      strokeDashoffset={isCurrent ? 200 : 0}
                      style={{
                        transition: isCurrent ? 'stroke-dashoffset 0.8s ease-in-out' : 'none'
                      }}
                      ref={(el) => {
                        if (el && isCurrent) {
                          el.getBoundingClientRect();
                          el.style.strokeDashoffset = '0';
                        }
                      }}
                    />
                  );
                })}

                {/* 4. Stroke Label Sequence Numbers */}
                {showNumbers && !isPlaying && strokeNumbers.map((num, idx) => {
                  // In guided mode, only show the active stroke number to avoid visual clutter!
                  const shouldShow = practiceMode === 'guided' ? idx === guideStrokeIndex : true;
                  if (!shouldShow) return null;

                  return (
                    <text
                      key={`num-${idx}`}
                      x={num.x}
                      y={num.y}
                      fill={practiceMode === 'guided' ? '#4f46e5' : '#94a3b8'}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace, sans-serif"
                      className="select-none font-black animate-bounce"
                    >
                      {num.text}
                    </text>
                  );
                })}
              </svg>
            )}

            {/* Live Hand-writing Canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 w-full h-full z-20 bg-transparent cursor-crosshair"
            />

            {/* Full Glassmorphism Success Overlay */}
            {practiceMode === 'guided' && isCharacterCompleted && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-inner border border-emerald-100">
                  <TrophyOutlined className="text-3xl" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">HOÀN THÀNH CHỮ HÁN!</h3>
                <span className="text-5xl font-black text-emerald-600 my-3 block">{currentKanji.character}</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[200px] leading-relaxed mb-6">
                  Tuyệt vời! Bạn viết đúng {strokePaths.length}/{strokePaths.length} nét chữ Hán này!
                </p>
                <div className="flex gap-2 w-full max-w-[220px]">
                  <button
                    onClick={resetGuidedPractice}
                    className="flex-1 py-2.5 border border-slate-200 hover:border-black rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 bg-white"
                  >
                    <RedoOutlined />
                    Viết lại
                  </button>
                  <button
                    onClick={() => {
                      if (currentIndex < kanjiList.length - 1) {
                        handleNext();
                      } else {
                        message.info("Bạn đã luyện tập viết hoàn thành chữ Hán cuối cùng!");
                      }
                    }}
                    className="flex-grow py-2.5 bg-black text-white hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1"
                  >
                    Chữ tiếp →
                  </button>
                </div>
              </div>
            )}

            {/* Loading Cover */}
            {svgLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-30">
                <div className="w-6 h-6 border-2 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Canvas Control Panel */}
          <div className="w-full max-w-[320px] flex flex-col gap-4">
            
            {/* Ink Style Capsule Bar */}
            <div className="flex justify-between items-center bg-slate-50/70 p-2.5 rounded-2xl border border-slate-100 shadow-inner">
              <div className="flex items-center gap-1.5">
                {[
                  { value: '#0f172a', class: 'bg-slate-900 border-slate-900' },
                  { value: '#4f46e5', class: 'bg-indigo-600 border-indigo-600' },
                  { value: '#e11d48', class: 'bg-rose-600 border-rose-600' },
                ].map(c => (
                  <button
                    key={c.value}
                    onClick={() => setPenColor(c.value)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform active:scale-95 ${c.class} ${
                      penColor === c.value ? 'scale-110 ring-2 ring-offset-2 ring-slate-300' : 'opacity-70'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1">
                {[
                  { label: 'Thanh', value: 3.5 },
                  { label: 'Vừa', value: 5.5 },
                  { label: 'Đậm', value: 8 },
                ].map(size => (
                  <button
                    key={size.value}
                    onClick={() => setPenSize(size.value)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                      penSize === size.value
                        ? 'bg-black text-white'
                        : 'text-slate-400 hover:text-black hover:bg-slate-100'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle guides */}
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={practiceMode === 'guided'}
                onClick={() => setShowGuide(prev => !prev)}
                className={`flex items-center justify-center gap-2 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  practiceMode === 'guided'
                    ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed opacity-50'
                    : showGuide
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'border-slate-150 text-slate-300'
                }`}
              >
                {showGuide ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                {showGuide ? 'Có mẫu' : 'Ẩn mẫu'}
              </button>

              <button
                onClick={() => setShowNumbers(prev => !prev)}
                className={`flex items-center justify-center gap-2 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  showNumbers ? 'bg-slate-50 border-slate-200 text-slate-800' : 'border-slate-150 text-slate-300'
                }`}
              >
                <BorderOutlined />
                {showNumbers ? 'Số nét: Có' : 'Số nét: Ẩn'}
              </button>
            </div>

            {/* Utility Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={practiceMode === 'guided' ? resetGuidedPractice : clearCanvas}
                className="py-3 border border-slate-200 hover:border-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RedoOutlined />
                {practiceMode === 'guided' ? 'Viết lại từ đầu' : 'Xóa nét vẽ'}
              </button>

              <button
                onClick={playStrokeAnimation}
                disabled={isPlaying || strokePaths.length === 0}
                className="py-3 bg-black text-white hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-black/5 flex items-center justify-center gap-1.5"
              >
                <HighlightOutlined />
                Xem nét viết
              </button>
            </div>
            
            {svgError && (
              <p className="text-[10px] font-semibold text-amber-600 text-center leading-relaxed italic mt-1 px-2">
                {svgError}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: KANJI INFO CARD & META */}
        <div className="lg:col-span-6 flex flex-col h-full justify-between gap-6 self-stretch">
          
          {/* Details Card */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-8 md:p-10 space-y-6 flex-grow shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase bg-white border border-slate-100 px-3 py-1 rounded-full">
                KANJI PRACTICE {currentKanji.page ? `• TRANG ${currentKanji.page}` : ''}
              </span>
              <span className="text-xs font-black text-slate-300">
                {currentIndex + 1} / {kanjiList.length}
              </span>
            </div>

            {/* Title Block */}
            <div className="flex items-center gap-6 pt-2 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 bg-white border border-slate-150 rounded-2xl flex items-center justify-center shadow-inner text-4xl font-black text-slate-900 select-none">
                {currentKanji.character}
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">HÁN VIỆT</span>
                <h2 className="text-2xl font-black text-slate-950 uppercase tracking-wide leading-none">
                  {currentKanji.hanviet || 'CHƯA CÓ'}
                </h2>
                <p className="text-sm text-slate-500 font-bold italic">
                  {currentKanji.meaning || 'Nghĩa chưa có'}
                </p>
              </div>
            </div>

            {/* Readings Table */}
            <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-100 text-xs">
              <div className="space-y-1">
                <span className="font-black text-[9px] text-slate-400 uppercase tracking-widest block">Onyomi (Âm On)</span>
                <span className="font-bold text-slate-900">{currentKanji.onyomi || '—'}</span>
              </div>
              <div className="space-y-1">
                <span className="font-black text-[9px] text-slate-400 uppercase tracking-widest block">Kunyomi (Âm Kun)</span>
                <span className="font-bold text-slate-700">{currentKanji.kunyomi || '—'}</span>
              </div>
            </div>

            {/* Examples block */}
            <div className="space-y-2">
              <span className="font-black text-[9px] text-slate-400 uppercase tracking-widest block">Từ vựng & Ví dụ ghép</span>
              {currentKanji.examples ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-4 max-h-[140px] overflow-y-auto space-y-2.5 scrollbar-thin">
                  {currentKanji.examples.split('\n').filter(l => l.trim() !== '').map((line, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-xs">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 flex-shrink-0" />
                      <p className="text-slate-600 font-semibold leading-relaxed">{line}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-white border border-dashed border-slate-150 rounded-2xl">
                  <p className="text-slate-400 text-[10px] font-medium italic">Chưa có ví dụ mẫu.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="space-y-4">
            
            {/* Quick Bookmark Button */}
            <button
              onClick={() => onAddFlashcard(currentKanji)}
              className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                addedKanjiIds.has(currentKanji.id)
                  ? 'bg-rose-50 text-rose-500 border border-rose-100 shadow-rose-500/5 cursor-default'
                  : 'bg-black text-white hover:bg-slate-800 shadow-black/5'
              }`}
            >
              {addedKanjiIds.has(currentKanji.id) ? (
                <>
                  <HeartFilled className="text-rose-500 text-xs animate-pulse" />
                  Đã lưu Sổ tay ôn tập ❤️
                </>
              ) : (
                <>
                  <HeartOutlined className="text-rose-400 text-xs" />
                  Lưu vào Sổ tay ôn tập ❤️
                </>
              )}
            </button>

            {/* Navigation Slider Bar */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-150 rounded-2xl p-3">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-10 h-10 border border-slate-200 hover:border-black disabled:border-slate-150 disabled:opacity-40 disabled:hover:border-slate-150 rounded-xl flex items-center justify-center transition-all hover:bg-white text-slate-800"
              >
                <LeftOutlined style={{ fontSize: '10px', fontWeight: 'bold' }} />
              </button>

              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">
                Chữ Hán {currentIndex + 1} / {kanjiList.length}
              </span>

              <button
                onClick={handleNext}
                disabled={currentIndex === kanjiList.length - 1}
                className="w-10 h-10 border border-slate-200 hover:border-black disabled:border-slate-150 disabled:opacity-40 disabled:hover:border-slate-150 rounded-xl flex items-center justify-center transition-all hover:bg-white text-slate-800"
              >
                <RightOutlined style={{ fontSize: '10px', fontWeight: 'bold' }} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
