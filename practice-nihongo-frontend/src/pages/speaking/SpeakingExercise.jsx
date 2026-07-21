import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, Mic, Play, Eye, EyeOff, Volume2, Gauge } from 'lucide-react';

import { Link } from 'react-router-dom';
import { speakingData } from './speakingData';
import { speakingAlternatives } from './speakingAlternativesData';

export default function SpeakingExercise() {
  const [activeTab, setActiveTab] = useState('bamen'); // 'bamen' or 'questions'
  const [activeLessonId, setActiveLessonId] = useState(speakingData[0].lessonId);
  const activeLesson = speakingData.find(l => l.lessonId === activeLessonId);

  const [activeScenarioId, setActiveScenarioId] = useState(activeLesson.scenarios[0].id);
  const [practiceLevel, setPracticeLevel] = useState('none');
  const [revealedLines, setRevealedLines] = useState({});
  const [showHiragana, setShowHiragana] = useState({});
  const [showTranslation, setShowTranslation] = useState({});
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  useEffect(() => {
    // Preload voices so the first click uses the correct voice
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const activeScenario = activeLesson.scenarios.find(s => s.id === activeScenarioId);

  const handleLessonChange = (lessonId) => {
    const lesson = speakingData.find(l => l.lessonId === lessonId);
    setActiveLessonId(lessonId);
    setActiveScenarioId(lesson.scenarios[0].id);
    setRevealedLines({});
  };

  const handleScenarioChange = (id) => {
    setActiveScenarioId(id);
    setRevealedLines({}); // reset reveals when changing scenario
  };

  const toggleReveal = (index) => {
    setRevealedLines(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleHiragana = (index) => {
    setShowHiragana(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleTranslation = (index) => {
    setShowTranslation(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove placeholder brackets and Furigana before speaking for better pronunciation
      // Replace Kanji(hiragana) with just Kanji
      let cleanText = text.replace(/\[|\]/g, '');
      cleanText = cleanText.replace(/([\u4E00-\u9FAF\u3005]+)\([\u3040-\u309F]+\)/g, '$1');
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Try to find better Japanese voices
      const voices = window.speechSynthesis.getVoices();
      const jpVoices = voices.filter(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
      
      if (jpVoices.length > 0) {
        // Ưu tiên các giọng đọc tự nhiên (Natural/Premium/Nanami/Keita của Windows/Edge) 
        // hoặc Google Nhật Bản nếu có.
        const bestVoice = jpVoices.find(v => v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Nanami') || v.name.includes('Keita')) 
                          || jpVoices.find(v => v.name.includes('Google')) 
                          || jpVoices[0];
        utterance.voice = bestVoice;
      }

      utterance.lang = 'ja-JP';
      utterance.rate = audioSpeed;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Helper function to render text with replacements highlighted

  const parseRuby = (text, showFurigana) => {
    if (typeof text !== 'string') return text;
    const rubyParts = text.split(/([\u4E00-\u9FAF\u3005]+)\(([\u3040-\u309F]+)\)/g);
    if (rubyParts.length === 1) return text;
    return (
      <>
        {rubyParts.map((rPart, rIndex) => {
          if (rIndex % 3 === 1) {
            return showFurigana ? (
              <ruby key={rIndex}>
                {rPart}
                <rt className="text-[12px] md:text-[13px] opacity-80 font-normal pb-[2px]">{rubyParts[rIndex + 1]}</rt>
              </ruby>
            ) : (
              <span key={rIndex}>{rPart}</span>
            );
          } else if (rIndex % 3 === 2) {
            return null;
          }
          return <span key={rIndex}>{rPart}</span>;
        })}
      </>
    );
  };

  // Helper function to render text with replacements and grammar highlighted
  const renderTextWithReplacements = (text, replacements, maskKeywords, showFurigana) => {
    // Regex to match [key] or {{grammar}}
    const parts = text.split(/(\[[^\]]+\]|\{\{[^\}]+\}\})/g);

    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const key = part.slice(1, -1);
        const replacementValue = replacements[key] || part;
        return (
          <span key={index} className={`inline-block px-2 py-1 mx-1 my-1 font-bold rounded-md transition-all duration-300 shadow-sm align-middle ${maskKeywords ? 'bg-black text-transparent dark:bg-white select-none' : 'bg-slate-200 dark:bg-slate-700 text-black dark:text-white'}`}>
            {parseRuby(replacementValue, showFurigana)}
          </span>
        );
      }
      if (part.startsWith('{{') && part.endsWith('}}')) {
        const grammarValue = part.slice(2, -2);
        return (
          <span key={index} className={`inline-block px-2 py-1 mx-1 my-1 font-black rounded-md transition-all duration-300 shadow-sm align-middle ${maskKeywords ? 'bg-black text-transparent dark:bg-white select-none' : 'bg-slate-800 dark:bg-slate-200 text-white dark:text-black'}`}>
            {parseRuby(grammarValue, showFurigana)}
          </span>
        );
      }
      return <span key={index} className={showFurigana ? 'leading-loose' : ''}>{parseRuby(part, showFurigana)}</span>;
    });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] mt-20 flex-grow bg-white dark:bg-slate-950 transition-colors duration-300 pb-20 font-sans">
      <div className="pt-20 pb-6 px-6 max-w-6xl mx-auto">
        <Link
          to="/exam-jlpt"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white transition-colors uppercase mb-8 group"
        >
          <ChevronLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" /> Trở về Ôn Thi
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.4em] font-bold text-slate-400 dark:text-slate-500 uppercase">
              Luyện tập hội thoại theo tình huống (場面)
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight italic uppercase flex items-center gap-3">
              {activeLesson.title}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            {/* Speed Control */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
              <Gauge className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <select
                value={audioSpeed}
                onChange={(e) => setAudioSpeed(Number(e.target.value))}
                className="bg-transparent dark:text-white text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value={0.75}>Chậm (0.75x)</option>
                <option value={1}>Chuẩn (1.0x)</option>
              </select>
            </div>

            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-full w-fit shadow-inner">
              <button onClick={() => setPracticeLevel('none')} className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${practiceLevel === 'none' ? 'bg-white dark:bg-slate-900 shadow-sm text-black dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Đọc trơn</button>
              <button onClick={() => setPracticeLevel('keywords')} className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${practiceLevel === 'keywords' ? 'bg-white dark:bg-slate-900 shadow-sm text-black dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Nhớ từ khóa</button>
              <button onClick={() => setPracticeLevel('user')} className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${practiceLevel === 'user' ? 'bg-white dark:bg-slate-900 shadow-sm text-black dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Đóng vai</button>
              <button onClick={() => setPracticeLevel('all')} className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${practiceLevel === 'all' ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Thuộc lòng</button>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit mt-6">
          <button
            onClick={() => setActiveTab('bamen')}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'bamen' ? 'bg-white dark:bg-slate-900 shadow-sm text-black dark:text-white font-black' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Hội thoại (Bamen)
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'questions' ? 'bg-white dark:bg-slate-900 shadow-sm text-black dark:text-white font-black' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Câu hỏi luyện tập
          </button>
        </div>

        {activeTab === 'bamen' && (
          <>
            {/* Lesson Selectors */}
            <div className="mt-8 flex flex-wrap gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              {speakingData.map((lesson) => (
                <button
                  key={lesson.lessonId}
                  onClick={() => handleLessonChange(lesson.lessonId)}
                  className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-all duration-300 border-b-2 ${activeLessonId === lesson.lessonId
                      ? 'border-black dark:border-white text-black dark:text-white font-black'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                >
                  Bài {lesson.lessonId}
                </button>
              ))}
            </div>

            {/* Bamen Selectors */}
            <div className="mt-6 flex flex-wrap gap-3">
              {activeLesson.scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioChange(scenario.id)}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${activeScenarioId === scenario.id
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-black dark:hover:border-white hover:text-black dark:text-white font-black'
                    }`}
                >
                  {scenario.title}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {activeTab === 'bamen' ? (
        <div className="px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Bamen Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900/60 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] sticky top-24 transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800/50 pb-3">
                Thông tin tình huống
              </h2>
              
              {activeScenario.audioUrl && (
                <div className="mb-6">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">
                    Audio hội thoại gốc
                  </span>
                  <audio 
                    controls 
                    src={activeScenario.audioUrl} 
                    className="w-full rounded-full"
                  />
                </div>
              )}

              <div className="mb-6 space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <p 
                    className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium mb-3"
                    dangerouslySetInnerHTML={{ __html: activeScenario.jpDescription }}
                  />
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <p 
                      className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed italic"
                      dangerouslySetInnerHTML={{ __html: activeScenario.viDescription }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {activeScenario.details.map((detail, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{detail.label}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Conversation */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900/60 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] hover:border-slate-200 dark:hover:border-slate-700 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Hội thoại mẫu</h2>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
                    Vai của bạn (TÔI)
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs mt-1 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Chú thích:</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 font-bold bg-slate-200 dark:bg-slate-700 text-black dark:text-white rounded shadow-sm">Nền xám</span>
                  <span className="text-slate-500 dark:text-slate-400">Từ vựng thay đổi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 font-black bg-slate-800 dark:bg-slate-200 text-white dark:text-black rounded shadow-sm">Nền đậm</span>
                  <span className="text-slate-500 dark:text-slate-400">Ngữ pháp cố định</span>
                </div>
              </div>

              <div className="space-y-4">
                {activeLesson.baseConversation.map((baseTurn, index) => {
                  // If the active scenario overrides this specific line index, use the override
                  const turn = activeScenario.lineOverrides && activeScenario.lineOverrides[index]
                    ? activeScenario.lineOverrides[index]
                    : baseTurn;

                  const isUser = turn.isUser;
                  const isOverridden = activeScenario.lineOverrides && activeScenario.lineOverrides[index];

                  // Construct the actual string for TTS by injecting replacements and removing grammar tags
                  const actualText = turn.text.split(/(\[[^\]]+\]|\{\{[^\}]+\}\})/g).map(part => {
                    if (part.startsWith('[') && part.endsWith(']')) {
                      const key = part.slice(1, -1);
                      return activeScenario.replacements[key] || part;
                    }
                    if (part.startsWith('{{') && part.endsWith('}}')) {
                      return part.slice(2, -2); // just return the grammar text for TTS
                    }
                    return part;
                  }).join('');

                  const isHidden = (practiceLevel === 'all' || (practiceLevel === 'user' && isUser)) && !revealedLines[index];
                const maskKeywords = practiceLevel === 'keywords' && !revealedLines[index];

                  return (
                    <div key={index} className={`flex gap-4 ${isUser ? '' : 'opacity-80'}`}>
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${isUser
                            ? 'bg-black text-white dark:bg-white dark:text-black text-black dark:text-white font-black shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                          {isUser ? <User className="w-5 h-5" /> : turn.role}
                        </div>
                      </div>

                      <div className={`flex-1 p-4 rounded-2xl border transition-all duration-300 relative group ${isUser
                          ? 'bg-slate-50 dark:bg-slate-800/50 border-black dark:border-white border-2'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800/50'
                        }`}>
                        <div className={`${isHidden ? 'bg-slate-200 dark:bg-slate-700 text-transparent blur-[4px] select-none rounded-lg' : ''} transition-all duration-300`}>
                          <p className={`text-lg md:text-xl transition-all duration-300 ${showHiragana[index] ? 'leading-[2.75rem] md:leading-[3rem]' : 'leading-relaxed'} ${isUser ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                            {renderTextWithReplacements(showHiragana[index] && turn.textHiragana ? turn.textHiragana : turn.text, activeScenario.replacements, maskKeywords, showHiragana[index])}
                          </p>
                          
                          {showTranslation[index] && turn.translation && (
                            <div className="mt-3">
                              <div className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium italic px-3 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                {renderTextWithReplacements(turn.translation, activeScenario.replacementsVi || activeScenario.replacements, maskKeywords, false)}
                              </div>
                            </div>
                          )}
                        </div>

                        {isHidden && (
                          <div className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-2xl" onClick={() => toggleReveal(index)}>
                            <div className="px-4 py-2 bg-white dark:bg-slate-900/90 backdrop-blur-sm rounded-full shadow-sm border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:text-black dark:text-white font-black hover:shadow-md transition-all">
                              <Eye className="w-4 h-4" /> Bấm để hiện lời thoại
                            </div>
                          </div>
                        )}

                        {!isHidden && (
                          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                              {isUser ? 'Vai của bạn' : 'Đối thoại'}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {turn.translation && (
                                <button
                                  onClick={() => toggleTranslation(index)}
                                  className={`w-8 h-8 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:scale-110 transition-all duration-300 text-xs font-bold ${showTranslation[index] ? 'bg-black text-white dark:bg-white dark:text-black font-black' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50'}`}
                                  title="Hiện/ẩn Tiếng Việt"
                                >
                                  VN
                                </button>
                              )}
                              {turn.textHiragana && (
                                <button
                                  onClick={() => toggleHiragana(index)}
                                  className={`w-8 h-8 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:scale-110 transition-all duration-300 font-bold text-xs ${showHiragana[index] ? 'bg-black text-white dark:bg-white dark:text-black font-black' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50'}`}
                                  title="Hiện/ẩn Furigana"
                                >
                                  あ
                                </button>
                              )}
                              
                              {practiceLevel !== 'none' && isUser && (
                                <button onClick={() => toggleReveal(index)} className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center hover:bg-slate-50 dark:bg-slate-800/50 hover:scale-110 transition-all duration-300" title="Ẩn lời thoại">
                                  <EyeOff className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {!isUser && (
                          <button
                            onClick={() => speakText(actualText)}
                            className="absolute -right-3 -top-3 w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800/50 text-black dark:text-white font-black flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 max-w-4xl mx-auto mt-8 space-y-6">
          {speakingAlternatives.map((item, index) => {
            const isHidden = (practiceLevel === 'all' || practiceLevel === 'user') && !revealedLines[`alt_${index}`];
            const isHiragana = showHiragana[`alt_${index}`];
            const isTranslation = showTranslation[`alt_${index}`];

            return (
              <div key={item.id} className="bg-white dark:bg-slate-900/60 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] hover:border-slate-200 dark:hover:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 border border-black dark:border-white text-black dark:text-white text-xs font-bold rounded-full">Bài {item.lesson}</span>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    Câu {item.id}
                    {item.isExtra && (
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] uppercase tracking-wider rounded-md border border-amber-200 dark:border-amber-800/50">Mở rộng (Tham khảo)</span>
                    )}
                  </h3>
                </div>

                <div className="flex justify-between items-start mb-6 gap-4">
                  <div className="flex-1">
                    <p className="text-slate-800 dark:text-slate-200 font-bold text-lg md:text-xl leading-snug">{item.questionText}</p>
                    {isTranslation && (
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base mt-1 mb-3 italic">{item.questionTranslation}</p>
                    )}

                    {item.subQuestions && item.subQuestions.length > 0 && (
                      <div className="mt-4 bg-slate-50 dark:bg-slate-800/50/80 rounded-xl p-4 border border-slate-100 dark:border-slate-800/50">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Câu hỏi phụ phân tích</p>
                        <ul className="space-y-2">
                          {item.subQuestions.map((sq, i) => (
                            <li key={i} className="text-slate-700 dark:text-slate-300 text-sm font-medium flex gap-2 items-start">
                              <span className="text-black dark:text-white font-black mt-0.5">•</span>
                              <div>
                                <p>{sq}</p>
                                {isTranslation && (
                                  <p className="text-slate-500 dark:text-slate-400 italic mt-0.5 text-xs">{item.subQuestionsTranslation[i]}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => speakText(item.questionText)}
                    className="w-10 h-10 shrink-0 rounded-full bg-slate-50 dark:bg-slate-800/50 shadow-sm border border-slate-200 dark:border-slate-800 text-black dark:text-white font-black flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 transition-all duration-300"
                    title="Nghe câu hỏi"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50 relative group animate-in fade-in zoom-in-95 duration-300">
                    <div className={`${isHidden ? 'bg-slate-200 dark:bg-slate-700 text-transparent blur-[4px] select-none rounded-lg' : ''} transition-all duration-300`}>
                      <p className={`text-slate-800 dark:text-slate-200 text-lg md:text-xl transition-all duration-300 mb-4 min-h-[56px] ${isHiragana ? 'leading-[2.75rem] md:leading-[3rem]' : 'leading-relaxed'}`}>
                        {parseRuby(isHiragana && item.answerHiragana ? item.answerHiragana : item.answer, isHiragana)}
                      </p>

                      {isTranslation && (
                        <div className="mb-4">
                          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium italic border-l-2 border-black dark:border-white pl-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-r-lg">
                            {item.answerTranslation}
                          </p>
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-black dark:text-white font-black uppercase tracking-wider">Ngữ pháp áp dụng:</span>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.grammarUsed}</p>
                        </div>

                        {!isHidden && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => toggleTranslation(`alt_${index}`)}
                              className={`w-10 h-10 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:scale-110 transition-all duration-300 text-sm font-bold ${isTranslation ? 'bg-black text-white dark:bg-white dark:text-black text-black dark:text-white font-black' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50'}`}
                              title="Hiện/ẩn Tiếng Việt"
                            >
                              VN
                            </button>
                            <button
                              onClick={() => toggleHiragana(`alt_${index}`)}
                              className={`w-10 h-10 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:scale-110 transition-all duration-300 font-bold ${isHiragana ? 'bg-black text-white dark:bg-white dark:text-black text-black dark:text-white font-black' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50'}`}
                              title="Hiện/ẩn Furigana"
                            >
                              あ
                            </button>
                            <button
                              onClick={() => speakText(item.answer)}
                              className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 text-black dark:text-white font-black flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 transition-all duration-300"
                              title="Nghe câu trả lời"
                            >
                              <Volume2 className="w-5 h-5" />
                            </button>
                            {practiceLevel !== 'none' && (
                              <button
                                onClick={() => toggleReveal(`alt_${index}`)}
                                className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center hover:bg-slate-50 dark:bg-slate-800/50 hover:scale-110 transition-all duration-300"
                                title="Ẩn câu trả lời"
                              >
                                Bật che
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isHidden && (
                      <div className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-2xl" onClick={() => toggleReveal(`alt_${index}`)}>
                        <div className="px-4 py-2 bg-white dark:bg-slate-900/90 backdrop-blur-sm rounded-full shadow-sm border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:text-black dark:text-white font-black hover:shadow-md transition-all">
                          <Eye className="w-4 h-4" /> Bấm để hiện gợi ý
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
