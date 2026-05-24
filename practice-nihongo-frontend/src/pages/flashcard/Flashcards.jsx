import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import flashcardService from '../../api/flashcardService';

export default function Flashcards() {
  const navigate = useNavigate();
  
  // 'due' = spaced repetition due cards, 'all' = entire bookmarked collection
  const [viewType, setViewType] = useState('due');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalCollectionCount, setTotalCollectionCount] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchCards();
  }, [viewType]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const [dueRes, allRes] = await Promise.all([
        flashcardService.getDue().catch(() => ({ data: [] })),
        flashcardService.getAll().catch(() => ({ data: [] }))
      ]);
      
      setTotalCollectionCount(allRes.data.length);
      setSessionCount(dueRes.data.length);

      const activeData = viewType === 'due' ? dueRes.data : allRes.data;
      setCards(activeData);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
      messageApi.error('Không thể tải danh sách thẻ!');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (rating) => {
    if (currentIndex >= cards.length) return;
    const currentCard = cards[currentIndex];

    try {
      await flashcardService.review(currentCard.id, rating);
      
      if (rating < 3) {
        messageApi.open({
          type: 'info',
          content: 'Thẻ này sẽ hiển thị lại ở cuối buổi học để ôn tập!',
          duration: 1.5,
        });
        
        // Append copy to end so they can retry
        setCards(prevCards => [...prevCards, currentCard]);
      } else {
        messageApi.open({
          type: 'success',
          content: rating === 4 ? 'Đã nhớ từ cực tốt!' : 'Tuyệt vời!',
          duration: 1,
        });
      }

      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);

    } catch (error) {
      console.error('Review failed:', error);
      messageApi.error('Có lỗi xảy ra khi lưu đánh giá!');
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await flashcardService.delete(cardId);
      messageApi.success('Đã xóa thẻ khỏi sổ tay ôn tập!');
      fetchCards(); // Instantly update counts and decks
    } catch (error) {
      console.error('Delete card failed:', error);
      messageApi.error('Xóa thẻ thất bại!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-3 border-slate-100 border-t-black rounded-full animate-spin mx-auto"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đang tải sổ tay ôn tập...</p>
        </div>
      </div>
    );
  }

  const isFinished = currentIndex >= cards.length;
  const currentCard = !isFinished ? cards[currentIndex] : null;
  const isKanji = currentCard ? !!currentCard.kanji : false;
  const itemData = currentCard ? (isKanji ? currentCard.kanji : currentCard.vocab) : null;

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center pt-24 pb-16 px-6 font-sans selection:bg-slate-200 select-none">
      {contextHolder}
      
      <div className="w-full max-w-2xl flex flex-col items-center">
        
        {/* Navigation & Tab Selection Row */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
          <button
            onClick={() => navigate('/')}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors border border-slate-200/60 hover:border-black px-4 py-2 rounded-xl"
          >
            Quay lại trang chủ
          </button>
          
          {/* Spacing-Free Capsule Swapper for Spaced Repetition Mode vs All Saved Collection */}
          <div className="bg-slate-50/70 p-1 rounded-2xl flex items-center border border-slate-150 shadow-inner">
            <button
              onClick={() => setViewType('due')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                viewType === 'due'
                  ? 'bg-black text-white shadow-md'
                  : 'text-slate-400 hover:text-black'
              }`}
            >
              Cần ôn tập ({sessionCount})
            </button>
            <button
              onClick={() => setViewType('all')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                viewType === 'all'
                  ? 'bg-black text-white shadow-md'
                  : 'text-slate-400 hover:text-black'
              }`}
            >
              Tất cả sổ tay ({totalCollectionCount})
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {!isFinished && cards.length > 0 && (
          <div className="w-full h-1 bg-slate-100 rounded-full mb-10 overflow-hidden">
            <div 
              className="h-full bg-slate-950 transition-all duration-300"
              style={{ width: `${(currentIndex / cards.length) * 100}%` }}
            ></div>
          </div>
        )}

        {isFinished ? (
          /* ALL COMPLETED STATE */
          <div className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 md:p-12 text-center shadow-sm space-y-6 max-w-lg mx-auto">
            <h1 className="text-3xl font-black text-slate-950 uppercase tracking-tight">HOÀN THÀNH BUỔI HỌC</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider max-w-sm mx-auto leading-relaxed">
              {viewType === 'due' 
                ? 'Bạn đã hoàn thành tất cả các thẻ ôn tập giãn cách đến hạn hôm nay rồi! Bộ não của bạn đang nhớ cực kỳ sâu!'
                : 'Bạn đã lật xem qua toàn bộ danh sách thẻ yêu thích đã lưu trong sổ tay cá nhân rồi nhé!'}
            </p>

            <div className="bg-white border border-slate-150 rounded-2xl p-6 max-w-sm mx-auto grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Số lượng</p>
                <p className="text-2xl font-black text-slate-800">{cards.length} thẻ</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Phân loại</p>
                <p className="text-base font-black text-indigo-600 uppercase">
                  {viewType === 'due' ? 'Ôn tập SRS' : 'Xem toàn bộ'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 max-w-sm mx-auto">
              <button
                onClick={() => navigate('/vocabulary')}
                className="flex-1 py-4 bg-black hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                Học Từ Vựng
              </button>
              <button
                onClick={() => navigate('/kanji')}
                className="flex-1 py-4 bg-white border border-slate-200 hover:border-black text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                Học Hán Tự
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE FLASHCARD SESSION */
          <div className="w-full flex flex-col items-center">
            
            {/* Header info about the current card */}
            <div className="w-full flex justify-between items-center mb-4 px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                {isKanji ? 'Hán Tự' : 'Từ Vựng'} • {itemData?.book?.title || 'Giáo trình'}
              </span>
              <button
                onClick={() => handleDeleteCard(currentCard.id)}
                className="text-[10px] text-slate-400 hover:text-rose-600 font-black uppercase tracking-wider transition-colors"
                title="Xóa khỏi sổ tay ôn tập"
              >
                Xóa thẻ khỏi sổ tay
              </button>
            </div>

            {/* Flashcard Flip Wrapper */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[380px] cursor-pointer mb-10"
              style={{ perspective: '1200px', WebkitPerspective: '1200px' }}
            >
              <div 
                className="relative w-full h-full min-h-[380px] duration-500 transform ease-in-out"
                style={{ 
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                
                {/* FRONT SIDE */}
                <div 
                  className="absolute inset-0 w-full h-full min-h-[380px] bg-white border border-slate-150 rounded-[2.5rem] p-8 flex flex-col items-center justify-center shadow-lg shadow-slate-100 hover:border-slate-300 transition-all"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <div className="text-center space-y-6">
                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-normal select-none">
                      {isKanji ? itemData?.character : itemData?.word}
                    </h2>
                    
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest select-none">
                      Chạm vào thẻ để lật mặt sau
                    </p>
                  </div>
                </div>

                {/* BACK SIDE */}
                <div 
                  className="absolute inset-0 w-full h-full min-h-[380px] bg-white border border-slate-150 rounded-[2.5rem] p-8 flex flex-col items-center justify-center shadow-lg shadow-slate-100 overflow-y-auto"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    WebkitTransform: 'rotateY(180deg)'
                  }}
                >
                  
                  {isKanji ? (
                    /* Kanji Back rendering */
                    <div className="w-full text-center space-y-6">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider">Hán tự: {itemData?.character}</span>
                        <h2 className="text-4xl font-extrabold text-slate-950 uppercase tracking-wider leading-none">{itemData?.hanviet || 'Chưa có Hán Việt'}</h2>
                        <p className="text-base font-bold text-slate-500 italic leading-relaxed">{itemData?.meaning}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4 border-t border-slate-100 text-left">
                        <div>
                          <p className="text-[9px] font-black text-slate-450 uppercase tracking-widest mb-0.5">Kunyomi</p>
                          <p className="text-sm font-bold text-slate-800">{itemData?.kunyomi || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-450 uppercase tracking-widest mb-0.5">Onyomi</p>
                          <p className="text-sm font-bold text-slate-800">{itemData?.onyomi || '-'}</p>
                        </div>
                      </div>

                      {itemData?.examples && (
                        <div className="pt-4 border-t border-slate-100 max-w-md mx-auto text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ví dụ câu</p>
                          <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 text-left space-y-2">
                            {itemData.examples.split(/[;\n]+/).map(line => line.trim()).filter(Boolean).map((line, idx) => (
                              <div key={idx} className="flex gap-2 items-start text-xs font-semibold text-slate-700">
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 flex-shrink-0"></span>
                                <p>{line}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Vocabulary Back rendering */
                    <div className="w-full text-center space-y-6">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Từ vựng: {itemData?.word}</span>
                        <h2 className="text-4xl font-extrabold text-slate-950 leading-none tracking-wide">{itemData?.reading}</h2>
                        <p className="text-base font-bold text-indigo-600 bg-indigo-50/50 px-5 py-1.5 rounded-full inline-block mt-2">
                          {itemData?.meaning}
                        </p>
                      </div>

                      {(itemData?.example || itemData?.exampleMeaning) && (
                        <div className="pt-5 border-t border-slate-100 max-w-md mx-auto space-y-2 text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ví dụ</p>
                          <p className="text-sm font-bold text-slate-800 leading-relaxed">
                            {itemData?.example}
                          </p>
                          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                            {itemData?.exampleMeaning}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="w-full transition-all">
              {!isFlipped ? (
                /* Unflipped State: Show prompt to Flip */
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-5 bg-black hover:bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] flex items-center justify-center"
                >
                  Lật thẻ xem đáp án
                </button>
              ) : (
                /* Flipped State: Show SM-2 Rating scores */
                <div className="space-y-4 w-full animate-slide-up">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center mb-1">
                    Bạn hãy tự đánh giá mức độ nhớ của từ này nhé:
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    {/* AGAIN BUTTON (Score 1) */}
                    <button
                      onClick={() => handleReview(1)}
                      className="flex flex-col items-center justify-center gap-1 p-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-700 rounded-xl transition-all active:scale-95"
                    >
                      <span className="text-xs font-black uppercase tracking-wider">Quên</span>
                      <span className="text-[8px] font-bold text-rose-500/70 uppercase tracking-tight">Học lại</span>
                    </button>

                    {/* HARD BUTTON (Score 2) */}
                    <button
                      onClick={() => handleReview(2)}
                      className="flex flex-col items-center justify-center gap-1 p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-150 text-amber-750 rounded-xl transition-all active:scale-95"
                    >
                      <span className="text-xs font-black uppercase tracking-wider">Khó</span>
                      <span className="text-[8px] font-bold text-amber-500/70 uppercase tracking-tight">Vài ngày</span>
                    </button>

                    {/* GOOD BUTTON (Score 3) */}
                    <button
                      onClick={() => handleReview(3)}
                      className="flex flex-col items-center justify-center gap-1 p-3.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 rounded-xl transition-all active:scale-95"
                    >
                      <span className="text-xs font-black uppercase tracking-wider">Nhớ</span>
                      <span className="text-[8px] font-bold text-indigo-550/70 uppercase tracking-tight">Nhắc sau</span>
                    </button>

                    {/* EASY BUTTON (Score 4) */}
                    <button
                      onClick={() => handleReview(4)}
                      className="flex flex-col items-center justify-center gap-1 p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 text-emerald-700 rounded-xl transition-all active:scale-95"
                    >
                      <span className="text-xs font-black uppercase tracking-wider">Dễ</span>
                      <span className="text-[8px] font-bold text-emerald-550/70 uppercase tracking-tight">Lâu lắm</span>
                    </button>

                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
