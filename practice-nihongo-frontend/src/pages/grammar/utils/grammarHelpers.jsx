import React from 'react';

export const cleanOption = (text) => {
  if (!text) return '';
  let cleaned = text;

  if (cleaned.includes('+')) {
    cleaned = cleaned.split('+').pop();
  } else if (cleaned.includes('＋')) {
    cleaned = cleaned.split('＋').pop();
  }

  cleaned = cleaned.replace(/[A-Za-z\(\)（）～~〜〰【】\[\]\s\-]/g, '');

  if (cleaned.includes('/')) {
    cleaned = cleaned.split('/')[0];
  } else if (cleaned.includes('／')) {
    cleaned = cleaned.split('／')[0];
  } else if (cleaned.includes('・')) {
    cleaned = cleaned.split('・')[0];
  }

  return cleaned.trim() || text;
};

export const getQuizSentence = (sentence, quizSentence, pattern) => {
  // 1. Auto-generate the blank to perfectly match the cleaned option
  if (sentence && pattern) {
    const cleanPattern = cleanOption(pattern);
    if (cleanPattern && sentence.includes(cleanPattern)) {
      const parts = sentence.split(cleanPattern);
      return (
        <span className="whitespace-pre-wrap">
          {parts[0]}
          <span className="text-slate-400 dark:text-slate-500 mx-1">_____</span>
          {parts.slice(1).join(cleanPattern)}
        </span>
      );
    }
  }

  // 2. Fallback to DB provided quizSentence
  if (quizSentence && quizSentence.includes("_____")) {
    return (
      <span className="whitespace-pre-wrap">
        {quizSentence.split("_____").map((part, index, array) => (
          <span key={index}>
            {part}
            {index < array.length - 1 && <span className="text-slate-400 dark:text-slate-500 mx-1">_____</span>}
          </span>
        ))}
      </span>
    );
  }

  return <span className="whitespace-pre-wrap">{sentence || ''} <span className="text-slate-400 dark:text-slate-500 mx-1">_____</span></span>;
};

export const prepareActiveData = (grammarData, selectedLesson, activeMode, isShuffle) => {
  let data = grammarData;
  if (selectedLesson) {
    data = data.filter(item => item.unit && item.unit.toString() === selectedLesson.toString());
  }

  data = [...data].sort((a, b) => {
    const unitA = parseInt(a.unit) || 0;
    const unitB = parseInt(b.unit) || 0;
    if (unitA !== unitB) return unitA - unitB;
    // respect curriculum sortOrder first, fall back to day
    const sortA = a.sortOrder != null ? a.sortOrder : (parseInt(a.day) || 0);
    const sortB = b.sortOrder != null ? b.sortOrder : (parseInt(b.day) || 0);
    return sortA - sortB;
  });

  if (activeMode === 'quiz' || activeMode === 'multiple_choice' || activeMode === 'listening') {
    const flattened = [];
    data.forEach(item => {
      const sentences = (item.quiz?.sentence || '').split('\n').map(s => s.trim()).filter(Boolean);
      const quizSentences = (item.quiz?.quizSentence || '').split('\n').map(s => s.trim()).filter(Boolean);
      const translations = (item.quiz?.translation || '').split('\n').map(s => s.trim()).filter(Boolean);
      
      if (quizSentences.length > 0) {
        quizSentences.forEach((qSentence, idx) => {
          let matchedTranslation = '';
          let matchedSentence = '';
          
          const parts = qSentence.split(/_+/).map(p => p.trim()).filter(Boolean);
          if (parts.length > 0) {
            const matchIdx = sentences.findIndex(s => {
              let lastIdx = 0;
              for (const part of parts) {
                const currentIdx = s.indexOf(part, lastIdx);
                if (currentIdx === -1) return false;
                lastIdx = currentIdx + part.length;
              }
              return true;
            });
            
            if (matchIdx !== -1) {
              matchedTranslation = translations[matchIdx] || '';
              matchedSentence = sentences[matchIdx] || '';
            }
          }
          
          flattened.push({
            ...item,
            id: `${item.id}_q_${idx}`,
            quiz: {
              ...item.quiz,
              sentence: matchedSentence || qSentence.replace(/_+/g, '...'),
              quizSentence: qSentence,
              translation: matchedTranslation
            }
          });
        });
      } else if (sentences.length > 0) {
        sentences.forEach((sentence, idx) => {
          flattened.push({
            ...item,
            id: `${item.id}_${idx}`,
            quiz: {
              ...item.quiz,
              sentence: sentence,
              quizSentence: '',
              translation: translations[idx] || ''
            }
          });
        });
      } else {
        flattened.push(item);
      }
    });
    data = flattened;
  }

  if (isShuffle) return [...data].sort(() => Math.random() - 0.5);
  return data;
};
