import React, { useState, useEffect, useRef } from 'react';
import { RefreshCcw, Check } from 'lucide-react';

export default function VocabMatchingMode({ studyData, setShowResults, handleResetProgress }) {
  const BOARD_SIZE = 5;

  const [unmatchedData, setUnmatchedData] = useState([]);
  const [currentBoard, setCurrentBoard] = useState([]);
  const [shuffledLeft, setShuffledLeft] = useState([]);
  const [shuffledRight, setShuffledRight] = useState([]);

  // connections: { [leftId_str]: rightId_str } — user's pending pairs
  const [connections, setConnections] = useState({});
  const [selectedItem, setSelectedItem] = useState(null); // { id, side: 'left' | 'right' }

  const [matchedPairs, setMatchedPairs] = useState([]); // confirmed correct ids
  const [wrongPairs, setWrongPairs] = useState([]);     // wrong leftIds (flash red)
  const [revealedCorrect, setRevealedCorrect] = useState([]); // flash green before hiding
  const [checking, setChecking] = useState(false);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const hasStarted = useRef(false); // guard: don't show results on first mount

  useEffect(() => {
    if (studyData && studyData.length > 0) {
      hasStarted.current = false;
      setUnmatchedData([...studyData].sort(() => Math.random() - 0.5));
      setCurrentBoard([]);
      setMatchedPairs([]);
      setConnections({});
      setSelectedItem(null);
      setWrongPairs([]);
      setRevealedCorrect([]);
      setTotalCompleted(0);
    }
  }, [studyData]);

  // Load next board
  useEffect(() => {
    if (unmatchedData.length > 0 && currentBoard.length === 0) {
      hasStarted.current = true;
      const chunk = unmatchedData.slice(0, BOARD_SIZE);
      setCurrentBoard(chunk);
      setShuffledLeft([...chunk].map(i => ({ id: String(i.id), text: i.word || i.reading, reading: i.word ? i.reading : null })).sort(() => Math.random() - 0.5));
      setShuffledRight([...chunk].map(i => ({ id: String(i.id), text: i.meaning })).sort(() => Math.random() - 0.5));
      setConnections({});
      setMatchedPairs([]);
      setSelectedItem(null);
      setWrongPairs([]);
      setRevealedCorrect([]);
    } else if (unmatchedData.length === 0 && studyData.length > 0 && currentBoard.length === 0 && hasStarted.current) {
      setShowResults(true);
    }
  }, [unmatchedData, currentBoard, studyData, setShowResults]);

  const pairItems = (leftId, rightId) => {
    setConnections(prev => {
      const updated = { ...prev };
      delete updated[leftId]; // detach old
      Object.keys(updated).forEach(k => { if (updated[k] === rightId) delete updated[k]; }); // detach old
      updated[leftId] = rightId;
      return updated;
    });
  };

  const handleLeftClick = (id) => {
    if (matchedPairs.includes(id) || checking) return;
    if (selectedItem?.side === 'left') {
      setSelectedItem(selectedItem.id === id ? null : { id, side: 'left' });
    } else if (selectedItem?.side === 'right') {
      pairItems(id, selectedItem.id);
      setSelectedItem(null);
    } else {
      setSelectedItem({ id, side: 'left' });
    }
  };

  const handleRightClick = (id) => {
    if (checking) return;
    if (selectedItem?.side === 'right') {
      setSelectedItem(selectedItem.id === id ? null : { id, side: 'right' });
    } else if (selectedItem?.side === 'left') {
      pairItems(selectedItem.id, id);
      setSelectedItem(null);
    } else {
      setSelectedItem({ id, side: 'right' });
    }
  };

  // How many board items still need to be paired (not matched yet)
  const remaining = currentBoard.length - matchedPairs.length;
  const pendingCount = Object.keys(connections).filter(k => !matchedPairs.includes(k)).length;
  const allConnected = remaining > 0 && pendingCount === remaining;

  const handleCheck = () => {
    if (checking || !allConnected) return;
    setChecking(true);

    const correct = [];
    const wrong = [];
    Object.entries(connections).forEach(([leftId, rightId]) => {
      if (leftId === rightId) correct.push(leftId);
      else wrong.push(leftId);
    });

    if (correct.length > 0) setRevealedCorrect(correct);
    if (wrong.length > 0) setWrongPairs(wrong);

    setTimeout(() => {
      setRevealedCorrect([]);
      setWrongPairs([]);

      setConnections(prev => {
        const u = { ...prev };
        correct.forEach(id => delete u[id]);
        wrong.forEach(id => delete u[id]);
        return u;
      });

      const newMatched = [...matchedPairs, ...correct];
      setMatchedPairs(newMatched);

      if (newMatched.length === currentBoard.length) {
        setTimeout(() => {
          setTotalCompleted(prev => prev + currentBoard.length);
          setUnmatchedData(prev => prev.slice(BOARD_SIZE));
          setCurrentBoard([]);
        }, 400);
      }
      
      setChecking(false);
    }, 1200); // 1.2s delay to show colors before fading
  };

  const getLeftState = (id) => {
    if (revealedCorrect.includes(id)) return 'correct';
    if (matchedPairs.includes(id)) return 'matched';
    if (wrongPairs.includes(id)) return 'wrong';
    if (connections[id] !== undefined) return 'connected';
    if (selectedItem?.side === 'left' && selectedItem.id === id) return 'selected';
    return 'idle';
  };

  const getRightState = (id) => {
    const leftForThis = Object.keys(connections).find(k => connections[k] === id);
    if (leftForThis && revealedCorrect.includes(leftForThis)) return 'correct';
    if (leftForThis && matchedPairs.includes(leftForThis)) return 'matched';
    if (leftForThis && wrongPairs.includes(leftForThis)) return 'wrong';
    if (leftForThis) return 'connected';
    if (selectedItem?.side === 'right' && selectedItem.id === id) return 'selected';
    return 'idle';
  };

  const leftCardClass = (state) => {
    const base = "w-full h-full min-h-[76px] rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none flex flex-col justify-center items-center gap-1 px-3 py-4 ";
    switch (state) {
      case 'matched':  return base + "opacity-0 pointer-events-none scale-90 border-transparent";
      case 'correct':  return base + "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 scale-[1.03] shadow-md z-10";
      case 'wrong':    return base + "bg-red-50 dark:bg-red-950/40 border-red-300 text-red-600 dark:text-red-400 scale-95";
      case 'connected':return base + "bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-500 text-slate-800 dark:text-slate-200";
      case 'selected': return base + "bg-slate-700 dark:bg-slate-200 border-slate-700 dark:border-slate-300 text-white dark:text-slate-900 scale-[1.03] shadow-md";
      default:         return base + "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md active:scale-95";
    }
  };

  const rightCardClass = (state) => {
    const base = "w-full h-full min-h-[76px] rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none flex justify-center items-center px-3 py-4 ";
    switch (state) {
      case 'matched':  return base + "opacity-0 pointer-events-none scale-90 border-transparent";
      case 'correct':  return base + "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 scale-[1.03] shadow-md z-10";
      case 'wrong':    return base + "bg-red-50 dark:bg-red-950/40 border-red-300 text-red-600 dark:text-red-400 scale-95";
      case 'connected':return base + "bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-500 text-slate-800 dark:text-slate-200";
      case 'selected': return base + "bg-slate-700 dark:bg-slate-200 border-slate-700 dark:border-slate-300 text-white dark:text-slate-900 scale-[1.03] shadow-md";
      default:         return base + "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md active:scale-95";
    }
  };

  const progress = studyData?.length > 0
    ? Math.round(((totalCompleted + matchedPairs.length) / studyData.length) * 100)
    : 0;

  if (!studyData || studyData.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800">

        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">Nối Từ</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Nối hết {remaining} cặp rồi bấm <strong>Kiểm tra</strong>
            </p>
          </div>
          <button
            onClick={handleResetProgress}
            className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shrink-0"
          >
            <RefreshCcw size={15} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tiến độ</span>
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">
              {totalCompleted + matchedPairs.length}/{studyData.length}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Column labels */}
        <div className="grid grid-cols-2 gap-3 md:gap-5 mb-3">
          <div className="text-center"><span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600">Tiếng Nhật</span></div>
          <div className="text-center"><span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600">Tiếng Việt</span></div>
        </div>

        {/* Grid — interleaved for equal row heights */}
        <div className="grid gap-2.5 md:gap-3" style={{ gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr' }}>
          {Array.from({ length: currentBoard.length }).map((_, i) => {
            const left = shuffledLeft[i];
            const right = shuffledRight[i];
            return (
              <React.Fragment key={i}>
                {left ? (
                  <div onClick={() => handleLeftClick(left.id)} className={leftCardClass(getLeftState(left.id))}>
                    <span className="text-base md:text-lg font-bold text-center leading-snug">{left.text}</span>
                    {left.reading && left.reading !== left.text && (
                      <span className="text-[10px] md:text-xs opacity-50 mt-0.5">{left.reading}</span>
                    )}
                  </div>
                ) : <div />}
                {right ? (
                  <div onClick={() => handleRightClick(right.id)} className={rightCardClass(getRightState(right.id))}>
                    <span className="text-xs md:text-sm text-center leading-snug line-clamp-3 font-medium">{right.text}</span>
                  </div>
                ) : <div />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Hint & Check button */}
        <div className="mt-5 flex flex-col items-center gap-3">
          {selectedItem && !allConnected && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
              {selectedItem.side === 'left' ? '→ Bây giờ chọn nghĩa bên phải' : '← Bây giờ chọn từ bên trái'}
            </p>
          )}

          {allConnected ? (
            <button
              onClick={handleCheck}
              disabled={checking}
              className="flex items-center gap-2 px-8 py-3 bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-600 dark:hover:bg-slate-300 hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
            >
              <Check size={16} strokeWidth={3} />
              Kiểm tra
            </button>
          ) : (
            <p className="text-[10px] text-slate-300 dark:text-slate-600 font-bold uppercase tracking-widest">
              {pendingCount}/{remaining} cặp đã nối
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
