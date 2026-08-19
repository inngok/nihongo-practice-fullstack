import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';

export default function VocabMatchingMode({ studyData, setShowResults, handleResetProgress }) {
  const BOARD_SIZE = 5;

  const [unmatchedData, setUnmatchedData] = useState([]);
  const [currentBoard, setCurrentBoard] = useState([]);
  const [shuffledLeft, setShuffledLeft] = useState([]);
  const [shuffledRight, setShuffledRight] = useState([]);

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [errorIds, setErrorIds] = useState([]);

  // Initialize
  useEffect(() => {
    if (studyData && studyData.length > 0) {
      const shuffled = [...studyData].sort(() => Math.random() - 0.5);
      setUnmatchedData(shuffled);
      setCurrentBoard([]);
      setMatchedPairs([]);
      setSelectedLeft(null);
      setSelectedRight(null);
      setErrorIds([]);
    }
  }, [studyData]);

  // Load board
  useEffect(() => {
    if (unmatchedData.length > 0 && currentBoard.length === 0) {
      const nextChunk = unmatchedData.slice(0, BOARD_SIZE);
      setCurrentBoard(nextChunk);

      const leftItems = nextChunk
        .map(item => ({ id: item.id, text: item.word || item.reading, reading: item.word ? item.reading : null }))
        .sort(() => Math.random() - 0.5);

      const rightItems = nextChunk
        .map(item => ({ id: item.id, text: item.meaning }))
        .sort(() => Math.random() - 0.5);

      setShuffledLeft(leftItems);
      setShuffledRight(rightItems);
    } else if (unmatchedData.length === 0 && studyData.length > 0 && currentBoard.length === 0) {
      setShowResults(true);
    }
  }, [unmatchedData, currentBoard, studyData, setShowResults]);

  const handleLeftClick = (id) => {
    if (matchedPairs.includes(id) || errorIds.length > 0) return;
    setSelectedLeft(id);
    if (selectedRight) checkMatch(id, selectedRight);
  };

  const handleRightClick = (id) => {
    if (matchedPairs.includes(id) || errorIds.length > 0) return;
    setSelectedRight(id);
    if (selectedLeft) checkMatch(selectedLeft, id);
  };

  const checkMatch = (leftId, rightId) => {
    if (!leftId || !rightId) return;

    if (leftId === rightId) {
      setMatchedPairs(prev => {
        const newMatched = [...prev, leftId];
        if (newMatched.length === currentBoard.length) {
          setTimeout(() => {
            setUnmatchedData(prevData => prevData.slice(BOARD_SIZE));
            setCurrentBoard([]);
            setMatchedPairs([]);
            setSelectedLeft(null);
            setSelectedRight(null);
          }, 400);
        }
        return newMatched;
      });
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setErrorIds([leftId, rightId]);
      setTimeout(() => {
        setErrorIds([]);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500); // 0.5s highlight for error
    }
  };

  const getLeftItemClass = (id) => {
    let base = "w-full p-4 md:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 select-none flex flex-col justify-center items-center gap-1 shadow-sm font-medium ";
    if (matchedPairs.includes(id)) {
      return base + "opacity-0 pointer-events-none scale-90";
    }
    if (errorIds.includes(id) && selectedLeft === id) {
      return base + "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-600 dark:text-red-400";
    }
    if (selectedLeft === id) {
      return base + "bg-slate-100 dark:bg-slate-800 border-black dark:border-white text-black dark:text-white scale-105 shadow-md";
    }
    return base + "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md";
  };

  const getRightItemClass = (id) => {
    let base = "w-full p-4 md:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 select-none flex justify-center items-center shadow-sm font-medium ";
    if (matchedPairs.includes(id)) {
      return base + "opacity-0 pointer-events-none scale-90";
    }
    if (errorIds.includes(id) && selectedRight === id) {
      return base + "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-600 dark:text-red-400";
    }
    if (selectedRight === id) {
      return base + "bg-slate-100 dark:bg-slate-800 border-black dark:border-white text-black dark:text-white scale-105 shadow-md";
    }
    return base + "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md";
  };

  if (!studyData || studyData.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] p-4 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Nối Từ
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Ghép từ tiếng Nhật với nghĩa tiếng Việt tương ứng
            </p>
          </div>
          <button
            onClick={handleResetProgress}
            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
          >
            <RefreshCcw size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-8 relative min-h-[400px]">
          {/* Cột trái (Tiếng Nhật) */}
          <div className="flex flex-col gap-3 md:gap-4">
            {shuffledLeft.map(item => (
              <div
                key={'L' + item.id}
                onClick={() => handleLeftClick(item.id)}
                className={getLeftItemClass(item.id)}
              >
                <span className="text-lg md:text-xl font-bold">{item.text}</span>
                {item.reading && item.reading !== item.text && (
                  <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">{item.reading}</span>
                )}
              </div>
            ))}
          </div>

          {/* Cột phải (Tiếng Việt) */}
          <div className="flex flex-col gap-3 md:gap-4">
            {shuffledRight.map(item => (
              <div
                key={'R' + item.id}
                onClick={() => handleRightClick(item.id)}
                className={getRightItemClass(item.id)}
              >
                <span className="text-sm md:text-base text-center line-clamp-3">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
