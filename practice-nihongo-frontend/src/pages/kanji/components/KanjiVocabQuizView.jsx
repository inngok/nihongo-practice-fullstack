import React, { useState, useEffect, useCallback, useRef } from 'react';
import VocabMultipleChoiceMode from '../../vocabulary/components/VocabMultipleChoiceMode';
import VocabResultsModal from '../../vocabulary/components/VocabResultsModal';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config';

export default function KanjiVocabQuizView({ kanjiVocabs, progressKey }) {
  const { currentUser, fetchWithAuth } = useAuth();
  const actualProgressKey = progressKey ? `${progressKey}_vocab_quiz` : null;
  const isProgressLoading = useRef(false);

  const [studyData, setStudyData] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [completedIds, setCompletedIds] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showVietnameseFirst, setShowVietnameseFirst] = useState(false);

  // Restore progress from backend
  useEffect(() => {
    if (!currentUser || !actualProgressKey || !kanjiVocabs || kanjiVocabs.length < 4) return;
    
    isProgressLoading.current = true;
    fetchWithAuth(`${API_BASE_URL}/progress/${actualProgressKey}?t=${Date.now()}`)
      .then(res => res.json())
      .then(resData => {
        isProgressLoading.current = false;
        if (resData.data) {
          try {
            const state = JSON.parse(resData.data);
            if (state.currentIndex !== undefined) setCurrentIndex(state.currentIndex);
            if (state.score !== undefined) setScore(state.score);
            if (state.completedIds !== undefined) setCompletedIds(state.completedIds);
            if (state.isShuffle !== undefined) setIsShuffle(state.isShuffle);
          } catch(e) {}
        }
      }).catch(() => {
        isProgressLoading.current = false;
      });
  }, [actualProgressKey, currentUser, kanjiVocabs]);

  // Debounced save progress
  useEffect(() => {
    if (!currentUser || !actualProgressKey || !kanjiVocabs || kanjiVocabs.length < 4 || isProgressLoading.current) return;
    
    const timer = setTimeout(() => {
      if (isProgressLoading.current) return;
      const state = { currentIndex, score, completedIds, isShuffle };
      fetchWithAuth(`${API_BASE_URL}/progress/${actualProgressKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: JSON.stringify(state) })
      }).catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentIndex, score, completedIds, isShuffle, actualProgressKey, currentUser, kanjiVocabs]);

  useEffect(() => {
    if (!kanjiVocabs || kanjiVocabs.length < 4) return;
    
    // Add unique IDs to vocabs if they don't have them
    let data = kanjiVocabs.map((v, i) => ({ ...v, id: v.id || `kanji_vocab_${i}` }));
    setFullData(data);
    
    if (isShuffle) {
       data = [...data].sort(() => Math.random() - 0.5);
    }
    setStudyData(data);
  }, [kanjiVocabs, isShuffle]);

  const handleResetProgress = () => {
    setCurrentIndex(0);
    setScore(0);
    setCompletedIds([]);
    setShowResults(false);
    
    if (!fullData || fullData.length < 4) return;
    let data = [...fullData];
    if (isShuffle) {
       data = data.sort(() => Math.random() - 0.5);
    }
    setStudyData(data);
  };

  const handleCorrectAnswer = useCallback((itemId) => {
    setCompletedIds(prev => {
      if (!prev.includes(itemId)) {
        setScore(s => s + 1);
        return [...prev, itemId];
      }
      return prev;
    });
  }, []);

  const handleStudyUnmemorized = () => {
    const unmemorized = studyData.filter(item => !completedIds.includes(item.id));
    if (unmemorized.length > 0) {
      setStudyData(unmemorized);
      setCurrentIndex(0);
      setScore(0);
      setCompletedIds([]);
      setShowResults(false);
    } else {
      handleResetProgress();
    }
  };

  if (!kanjiVocabs || kanjiVocabs.length < 4) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cần tối thiểu 4 từ vựng để học trắc nghiệm</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <VocabMultipleChoiceMode
        studyData={studyData}
        fullData={fullData}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        handleResetProgress={handleResetProgress}
        setShowResults={setShowResults}
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        handleCorrectAnswer={handleCorrectAnswer}
        showVietnameseFirst={showVietnameseFirst}
        setShowVietnameseFirst={setShowVietnameseFirst}
      />

      {showResults && (
        <VocabResultsModal 
          score={score}
          total={studyData.length}
          activeMode="multiple_choice"
          completedIdsLength={completedIds.length}
          handleResetProgress={handleResetProgress}
          setShowResults={setShowResults}
          handleStudyUnmemorized={handleStudyUnmemorized}
        />
      )}
    </div>
  );
}
