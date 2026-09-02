import React, { useState, useEffect } from 'react';
import { Tabs, Spin, message, Modal, Select, Button, ConfigProvider } from 'antd';
import { ArrowLeftOutlined, SearchOutlined, CheckCircleOutlined, BulbOutlined, EditOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bookService from '../../api/bookService';

const TranslationPractice = () => {
  const [activeTab, setActiveTab] = useState('grammar');
  const [level, setLevel] = useState('N3');
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Grammars list for the selected book
  const [bookGrammars, setBookGrammars] = useState([]);
  const [selectedGrammarId, setSelectedGrammarId] = useState('random');
  
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  
  // Data for grammar mode
  const [grammarQuestion, setGrammarQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  
  // Data for paragraph mode
  const [paragraphData, setParagraphData] = useState([]); // Array of { vietnamese, japanese }
  const [paragraphInputs, setParagraphInputs] = useState([]);
  const [paragraphFeedbacks, setParagraphFeedbacks] = useState([]);
  const [evaluatingParagraph, setEvaluatingParagraph] = useState([]);
  const [showParagraphAnswers, setShowParagraphAnswers] = useState([]);

  const navigate = useNavigate();
  const { currentUser, fetchWithAuth } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';

  useEffect(() => {
    if (currentUser) {
      const loadBooks = async () => {
        try {
          const res = await bookService.getAll();
          let grammarBooks = res.data.filter(b => b.type && b.type.includes('GRAMMAR'));
          if (!isAdmin) {
            grammarBooks = grammarBooks.filter(b => {
              const isAllowed = b.allowedEmails && currentUser?.email && b.allowedEmails.split(',').map(e => e.trim()).includes(currentUser.email);
              return b.publishGrammar !== false || isAllowed;
            });
          }
          setBooks(grammarBooks);
          if (grammarBooks.length > 0) {
            setSelectedBook(grammarBooks[0].id);
          }
        } catch (error) {
          console.error("Error loading books:", error);
        }
      };
      loadBooks();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedBook && activeTab === 'grammar') {
      const loadGrammars = async () => {
        try {
          const res = await fetchWithAuth(`/api/grammars/book/${selectedBook}`);
          if (res.ok) {
            const data = await res.json();
            // Filter to only those with example sentence
            const validGrammars = data.filter(g => g.exampleMeaning && g.exampleSentence);
            setBookGrammars(validGrammars);
          }
        } catch (e) {
          console.error("Failed to load grammars");
        }
      };
      loadGrammars();
    }
  }, [selectedBook, activeTab]);

  useEffect(() => {
    if (currentUser) {
      fetchQuestion();
    }
  }, [activeTab, level, selectedBook, selectedGrammarId, currentUser]);

  const fetchQuestion = async () => {
    if (!currentUser) return;
    setLoading(true);
    setUserInput('');
    setFeedback(null);
    setShowAnswer(false);
    setParagraphData([]);
    setParagraphInputs([]);
    setParagraphFeedbacks([]);
    setShowParagraphAnswers([]);
    
    try {
      if (activeTab === 'grammar') {
        if (selectedGrammarId && selectedGrammarId !== 'random') {
           const targetGrammar = bookGrammars.find(g => g.id === selectedGrammarId);
           if (targetGrammar) {
             setGrammarQuestion(targetGrammar);
           } else {
             setGrammarQuestion(null);
           }
        } else {
          let url = `/api/grammars/random-practice?level=${level}`;
          if (selectedBook) {
            url += `&bookId=${selectedBook}`;
          }
          const response = await fetchWithAuth(url);
          if (response.ok) {
            const data = await response.json();
            setGrammarQuestion(data);
          } else {
            setGrammarQuestion(null);
          }
        }
      } else {
        const response = await fetchWithAuth(`/api/ai/translation-practice/paragraph?level=${level}`);
        if (response.ok) {
          const data = await response.text();
          try {
            const cleanData = data.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanData);
            setParagraphData(parsed);
            setParagraphInputs(new Array(parsed.length).fill(''));
            setParagraphFeedbacks(new Array(parsed.length).fill(null));
            setEvaluatingParagraph(new Array(parsed.length).fill(false));
            setShowParagraphAnswers(new Array(parsed.length).fill(false));
          } catch (e) {
            console.error("Parse paragraph error", e);
            message.error('Lỗi định dạng dữ liệu đoạn văn.');
            setParagraphData([]);
          }
        } else {
          message.error('Lỗi khi tải đoạn văn.');
          setParagraphData([]);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateGrammar = async () => {
    if (!userInput.trim()) {
      message.warning('Vui lòng nhập bản dịch của bạn!');
      return;
    }
    setEvaluating(true);
    try {
      const response = await fetchWithAuth('/api/ai/translation-practice/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: grammarQuestion?.exampleMeaning,
          userTranslation: userInput,
          targetGrammar: grammarQuestion?.structure,
          level
        })
      });

      if (response.ok) {
        const data = await response.text();
        try {
          const cleanData = data.replace(/```json/g, '').replace(/```/g, '').trim();
          setFeedback(JSON.parse(cleanData));
        } catch (e) {
          message.error('Lỗi phân tích phản hồi từ AI.');
        }
      } else {
        message.error('Không thể chấm điểm lúc này.');
      }
    } catch (error) {
      message.error('Lỗi kết nối tới server.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleEvaluateParagraph = async (index) => {
    if (!paragraphInputs[index]?.trim()) {
      message.warning('Vui lòng nhập bản dịch của bạn!');
      return;
    }

    const newEvaluating = [...evaluatingParagraph];
    newEvaluating[index] = true;
    setEvaluatingParagraph(newEvaluating);

    try {
      const response = await fetchWithAuth('/api/ai/translation-practice/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: paragraphData[index]?.vietnamese,
          userTranslation: paragraphInputs[index],
          targetGrammar: null,
          level
        })
      });

      if (response.ok) {
        const data = await response.text();
        try {
          const cleanData = data.replace(/```json/g, '').replace(/```/g, '').trim();
          const newFeedbacks = [...paragraphFeedbacks];
          newFeedbacks[index] = JSON.parse(cleanData);
          setParagraphFeedbacks(newFeedbacks);
        } catch (e) {
          message.error('Lỗi phân tích phản hồi từ AI.');
        }
      } else {
        message.error('Không thể chấm điểm lúc này.');
      }
    } catch (error) {
      message.error('Lỗi kết nối tới server.');
    } finally {
      const newEvaluating = [...evaluatingParagraph];
      newEvaluating[index] = false;
      setEvaluatingParagraph(newEvaluating);
    }
  };

  const toggleParagraphAnswer = (index) => {
    const newAnswers = [...showParagraphAnswers];
    newAnswers[index] = !newAnswers[index];
    setShowParagraphAnswers(newAnswers);
  };

  const renderFeedback = (fb, isSmall = false) => (
    <div className="mt-4 pt-4 border-t border-dashed border-slate-300 animate-[fade-in-up_0.4s_ease-out]">
      <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-4' : 'md:grid-cols-1'} gap-3 mb-3`}>
        {isAdmin && (
          <div className="col-span-1 bg-black rounded-xl p-3 flex flex-col items-center justify-center text-white">
            <span className="text-white/60 font-bold text-[10px] uppercase tracking-widest mb-1">Điểm AI</span>
            <div className={`${isSmall ? 'text-3xl' : 'text-4xl'} font-black`}>
              {fb.score}<span className="text-sm text-white/40">/10</span>
            </div>
          </div>
        )}
        <div className={`${isAdmin ? 'col-span-3' : 'col-span-1'} bg-white rounded-xl p-4 border border-slate-200`}>
          <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2">
            <CheckCircleOutlined className="text-black" /> Sửa lỗi / Đề xuất
          </span>
          <p className="text-base font-bold text-black font-kanji">{fb.correctedSentence}</p>
        </div>
      </div>
      {isAdmin && (
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <h4 className="font-bold text-slate-700 mb-1 uppercase tracking-widest text-[10px] flex items-center gap-2">
            <BulbOutlined /> Nhận xét chi tiết
          </h4>
          <p className="text-slate-600 text-sm whitespace-pre-line">{fb.feedback}</p>
        </div>
      )}
    </div>
  );

  const renderLevelSelector = () => (
    <div className="flex gap-2 mb-4">
      {['N3', 'N2', 'N1'].map(lvl => (
        <button
          key={lvl}
          onClick={() => setLevel(lvl)}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            level === lvl 
              ? 'bg-black text-white shadow-sm' 
              : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          {lvl}
        </button>
      ))}
    </div>
  );

  const renderGrammarModeSelectors = () => (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Chọn Sách Ngữ Pháp:</label>
        <Select
          value={selectedBook}
          onChange={(val) => {
            setSelectedBook(val);
            setSelectedGrammarId('random');
          }}
          className="w-full"
          options={books.map(b => ({ label: b.title, value: b.id }))}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Chọn Ngữ Pháp:</label>
        <Select
          value={selectedGrammarId}
          onChange={setSelectedGrammarId}
          className="w-full"
          options={[
            { label: '--- Chọn ngẫu nhiên ---', value: 'random' },
            ...bookGrammars.map(g => ({ label: g.structure, value: g.id }))
          ]}
          disabled={!selectedBook || bookGrammars.length === 0}
        />
      </div>
    </div>
  );

  const renderGrammarMode = () => (
    <div className="space-y-4 animate-[fade-in_0.4s_ease-out]">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h4 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Dịch câu này sang tiếng Nhật:</h4>
        <p className="text-lg md:text-xl font-bold text-black mb-4 leading-relaxed whitespace-pre-line">{grammarQuestion?.exampleMeaning}</p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-black rounded-md text-xs font-bold">
          <BulbOutlined /> Sử dụng ngữ pháp: <span className="font-kanji">{grammarQuestion?.structure}</span>
        </div>
      </div>

      <div>
        <textarea
          className="w-full min-h-[90px] p-4 bg-white border border-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black rounded-xl resize-y text-black font-kanji text-base transition-all"
          placeholder="Nhập bản dịch tiếng Nhật của bạn vào đây..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={evaluating}
        ></textarea>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button 
          onClick={() => setShowAnswer(!showAnswer)}
          className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold transition-all"
        >
          {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
        </button>
        
        {isAdmin && (
          <button 
            onClick={handleEvaluateGrammar}
            disabled={evaluating || !userInput.trim()}
            className="px-4 py-2 bg-black hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
          >
            {evaluating ? <Spin size="small" className="text-white" /> : <CheckCircleOutlined />}
            Chấm Điểm AI
          </button>
        )}
        
        <div className="flex-grow"></div>
        
        <button 
          onClick={fetchQuestion}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-all"
        >
          Đổi câu hỏi
        </button>
      </div>

      {showAnswer && (
        <div className="mt-4 p-4 bg-slate-100 border border-slate-200 rounded-xl animate-[fade-in-up_0.3s_ease-out]">
          <h4 className="text-[10px] font-bold text-black uppercase mb-1 tracking-widest">Đáp án chuẩn:</h4>
          <p className="text-lg font-bold text-black font-kanji whitespace-pre-line">{grammarQuestion?.exampleSentence}</p>
        </div>
      )}

      {feedback && renderFeedback(feedback)}
    </div>
  );

  const renderParagraphMode = () => {
    const fullVietnamese = paragraphData.map(item => item.vietnamese).join(' ');
    
    return (
      <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Đoạn văn gốc (Tiếng Việt):</h4>
            <button 
              onClick={fetchQuestion}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold transition-all"
            >
              Đổi đoạn văn
            </button>
          </div>
          <p className="text-base text-black leading-loose">{fullVietnamese}</p>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">Dịch từng câu sang tiếng Nhật:</h4>
          {paragraphData.map((item, index) => (
            <div key={index} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <p className="text-base font-bold text-black mb-3 leading-relaxed">{item.vietnamese}</p>
              <textarea
                className="w-full min-h-[60px] p-3 bg-white border border-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black rounded-lg resize-y text-black font-kanji text-sm mb-3 transition-all"
                placeholder="Dịch câu trên sang tiếng Nhật..."
                value={paragraphInputs[index]}
                onChange={(e) => {
                  const newInputs = [...paragraphInputs];
                  newInputs[index] = e.target.value;
                  setParagraphInputs(newInputs);
                }}
                disabled={evaluatingParagraph[index]}
              ></textarea>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleParagraphAnswer(index)}
                  className="px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-md text-xs font-bold transition-all"
                >
                  {showParagraphAnswers[index] ? 'Ẩn đáp án' : 'Xem đáp án'}
                </button>

                {isAdmin && (
                  <button 
                    onClick={() => handleEvaluateParagraph(index)}
                    disabled={evaluatingParagraph[index] || !paragraphInputs[index]?.trim()}
                    className="px-3 py-1.5 bg-black hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500 text-white rounded-md text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    {evaluatingParagraph[index] ? <Spin size="small" className="text-white" /> : <CheckCircleOutlined />}
                    Chấm Điểm Câu Này
                  </button>
                )}
              </div>

              {showParagraphAnswers[index] && (
                <div className="mt-3 p-3 bg-slate-100 border border-slate-200 rounded-lg animate-[fade-in-up_0.3s_ease-out]">
                  <h4 className="text-[10px] font-bold text-black uppercase mb-1 tracking-widest">Đáp án chuẩn:</h4>
                  <p className="text-base font-bold text-black font-kanji">{item.japanese}</p>
                </div>
              )}
              
              {paragraphFeedbacks[index] && renderFeedback(paragraphFeedbacks[index], true)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#000000', borderRadius: 6 } }}>
      <div className="min-h-screen bg-slate-50 pt-20 pb-10 px-4">
        <Modal
          title={null} open={!currentUser} closable={false} footer={null} centered maskClosable={false}
        >
          <div className="text-center py-5">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-xl text-black"><LoginOutlined /></div>
            <h2 className="text-xl font-bold mb-2 text-black">Cần đăng nhập</h2>
            <p className="text-slate-500 mb-5 text-sm">Bạn cần đăng nhập để có thể sử dụng tính năng luyện dịch.</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/')}>Về trang chủ</Button>
              <Button onClick={() => navigate('/login')} type="primary">Đăng nhập ngay</Button>
            </div>
          </div>
        </Modal>

        <div className="max-w-3xl mx-auto relative z-10 animate-[fade-in-up_0.5s_ease-out]">
          <button 
            onClick={() => navigate('/exam-jlpt')}
            className="mb-4 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-black transition-all"
          >
            <ArrowLeftOutlined /> Quay lại Ôn tập
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-8">
            <h1 className="text-2xl font-black text-black uppercase tracking-tight mb-1">Luyện dịch</h1>
            <p className="text-slate-500 mb-6 text-xs">Cải thiện kỹ năng dịch thuật Việt-Nhật và Nhật-Việt</p>

            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={[
                { key: 'grammar', label: 'Dịch theo ngữ pháp' },
                { key: 'paragraph', label: 'Dịch đoạn văn' }
              ]}
              className="mb-4 custom-bw-tabs"
            />

            <div>
              {activeTab === 'grammar' ? renderGrammarModeSelectors() : (
                <>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Chọn cấp độ:</h3>
                  {renderLevelSelector()}
                </>
              )}
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="py-12 flex justify-center"><Spin /></div>
              ) : (
                <>
                  {(activeTab === 'grammar' && !grammarQuestion) || (activeTab === 'paragraph' && paragraphData.length === 0) ? (
                    <div className="text-center py-10 text-slate-400 text-sm">Không có câu hỏi nào. Hãy thử đổi lựa chọn.</div>
                  ) : (
                    activeTab === 'grammar' ? renderGrammarMode() : renderParagraphMode()
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default TranslationPractice;
