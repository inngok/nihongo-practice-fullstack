import React from 'react';

export default function KanjiQuizView({
  quizQuestions,
  quizFinished,
  quizScore,
  quizIndex,
  generateQuiz,
  handleSelectQuizOption,
  quizSelectedOption,
  getQuizOptionClass
}) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      {quizQuestions.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cần tối thiểu 4 từ để học trắc nghiệm</p>
        </div>
      ) : quizFinished ? (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 md:p-12 text-center space-y-6 max-w-md mx-auto shadow-sm">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">KẾT QUẢ ĐẠT ĐƯỢC</h3>
          <div className="w-24 h-24 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto shadow-inner border border-slate-100 dark:border-slate-800">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-200">{quizScore}/{quizQuestions.length}</span>
          </div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">Bạn đã xuất sắc trả lời đúng {Math.round((quizScore / quizQuestions.length) * 100)}% số câu hỏi!</p>
          <button onClick={generateQuiz} className="bg-black dark:bg-white text-white dark:text-black hover:opacity-80 w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center">Luyện tập lại</button>
        </div>
      ) : (
        <div className="space-y-8 max-w-md mx-auto">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Câu hỏi {quizIndex + 1} / {quizQuestions.length}</span>
            <span className="text-slate-900 dark:text-white font-black underline decoration-slate-300">Đúng: {quizScore}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[2.5rem] p-8 text-center shadow-lg shadow-slate-100 dark:shadow-none">
            <span className="text-[10px] font-black text-slate-200 dark:text-slate-800 uppercase tracking-wider block mb-2">Hỏi chữ Hán</span>
            <span className="text-7xl font-kanji font-bold text-slate-950 dark:text-white block">{quizQuestions[quizIndex]?.kanji.character}</span>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-6">Chữ Hán trên có âm Hán Việt là gì?</p>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {quizQuestions[quizIndex]?.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectQuizOption(option)}
                disabled={quizSelectedOption !== null}
                className={`w-full py-4 px-6 rounded-2xl text-xs font-bold transition-all text-center ${getQuizOptionClass(option)}`}
              >
                <span className="uppercase tracking-wider">{option}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
