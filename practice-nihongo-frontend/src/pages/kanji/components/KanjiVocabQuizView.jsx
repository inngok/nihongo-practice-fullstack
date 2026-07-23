import React, { useState, useEffect, useCallback } from 'react';
import VocabMultipleChoiceMode from '../../vocabulary/components/VocabMultipleChoiceMode';
import VocabResultsModal from '../../vocabulary/components/VocabResultsModal';

export default function KanjiVocabQuizView({ kanjiVocabs }) {
  const [studyData, setStudyData] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [completedIds, setCompletedIds] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

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
