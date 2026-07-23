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

/**
 * Extract the missing text by comparing the full sentence against
 * the quizSentence (which has '_____' as placeholder).
 *
 * Algorithm:
 *   1. Split quizSentence by '_____' → [prefix, suffix]
 *   2. Find prefix in sentence, find suffix in sentence
 *   3. The substring between them is the answer
 *
 * Falls back to cleanOption(fallbackPattern) when extraction fails.
 */
export const extractMissingText = (sentence, quizSentence, fallbackPattern) => {
  if (sentence && quizSentence && quizSentence.includes('_____')) {
    const parts = quizSentence.split(/_+/);
    if (parts.length === 2) {
      const prefix = parts[0];
      const suffix = parts[1];

      // Both prefix and suffix must match exactly
      if (prefix === '' && suffix === '') {
        // The entire sentence is the answer
        return sentence;
      }

      let startIdx = -1;
      let endIdx = -1;

      if (prefix === '') {
        startIdx = 0;
      } else if (sentence.startsWith(prefix)) {
        startIdx = prefix.length;
      }

      if (suffix === '') {
        endIdx = sentence.length;
      } else if (sentence.endsWith(suffix)) {
        endIdx = sentence.length - suffix.length;
      }

      if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
        const missing = sentence.substring(startIdx, endIdx);
        if (missing.trim()) return missing;
      }
    }
  }
  return cleanOption(fallbackPattern);
};

/**
 * Render a quiz sentence with a blank ('_____') in place of the answer.
 *
 * Priority:
 *   1. Use quizSentence from DB (the canonical blank)
 *   2. Auto-generate blank by finding the extracted missing text in sentence
 *   3. Fallback: show the sentence with a generic blank
 */
export const getQuizSentence = (sentence, quizSentence, pattern) => {
  // 1. Always prefer the DB-provided quizSentence
  if (quizSentence && quizSentence.includes('_____')) {
    return (
      <span className="whitespace-pre-wrap">
        {quizSentence.split(/_+/).map((part, index, array) => (
          <span key={index}>
            {part}
            {index < array.length - 1 && <span className="text-slate-400 dark:text-slate-500 mx-1">_____</span>}
          </span>
        ))}
      </span>
    );
  }

  // 2. Auto-generate blank from the extracted missing text
  if (sentence && pattern) {
    const missingText = extractMissingText(sentence, quizSentence, pattern);
    if (missingText && sentence.includes(missingText)) {
      const idx = sentence.indexOf(missingText);
      const before = sentence.substring(0, idx);
      const after = sentence.substring(idx + missingText.length);
      return (
        <span className="whitespace-pre-wrap">
          {before}
          <span className="text-slate-400 dark:text-slate-500 mx-1">_____</span>
          {after}
        </span>
      );
    }
  }

  // 3. Fallback
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
