import React, { Suspense, lazy } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import Header from "../components/layout/Header";
import ScrollToTopButton from "../components/layout/ScrollToTopButton";
import Footer from "../components/layout/Footer";

// Lazy loading components for performance optimization
const Home = lazy(() => import("../pages/home/Home"));
const Grammar = lazy(() => import("../pages/grammar/Grammar"));
const Mimikara = lazy(() => import("../pages/grammar/Mimikara"));
const Vocabulary = lazy(() => import("../pages/vocabulary/Vocabulary"));
const Kanji = lazy(() => import("../pages/kanji/Kanji"));
const KanjiSet4 = lazy(() => import("../pages/kanji/KanjiSet4/KanjiSet4"));
const Soumatome = lazy(() => import("../pages/vocabulary/Soumatome/Soumatome"));
const ExamPC7 = lazy(() => import("../pages/exam/dong-du/ExamPC7"));
const DongDu = lazy(() => import("../pages/exam/dong-du/DongDu"));
const ExamPC8 = lazy(() => import("../pages/exam/dong-du/ExamPC8"));
const ExamJLPT = lazy(() => import("../pages/exam/jlpt/ExamJLPT"));
const SentenceSort = lazy(() => import("../pages/exam/jlpt/SentenceSort"));
const ExamVocab = lazy(() => import("../pages/exam/components/ExamVocab"));
const KanjiPC8Selector = lazy(() => import("../pages/exam/dong-du/KanjiPC8Selector"));
const TempVocabTest = lazy(() => import("../pages/exam/components/TempVocabTest"));
const TryN3 = lazy(() => import("../pages/vocabulary/TryN3/TryN3"));
const MimikaraVocab = lazy(() => import("../pages/vocabulary/MimikaraVocab/MimikaraVocab"));
const DekiruVocab = lazy(() => import("../pages/vocabulary/DekiruVocab/DekiruVocab"));
const Translator = lazy(() => import("../pages/translator/Translator"));
const Tips = lazy(() => import("../pages/tips/Tips"));
const ConfusingGrammar = lazy(() => import("../pages/grammar/ConfusingGrammar"));

const PageLoader = () => (
  <div className="min-h-[calc(100vh-80px)] mt-20 flex items-center justify-center bg-white">
    <div className="w-6 h-6 border-2 border-slate-100 border-t-black rounded-full animate-spin"></div>
  </div>
);

const Layout = () => {
  const location = useLocation();
  
  // Define paths where the global header and slogan should be hidden
  // These are usually study-intensive pages that have their own custom navigation or "Zen mode"
  const isStudyPage = 
    location.pathname === '/grammar/mimikara' ||
    location.pathname === '/vocabulary/soumatome' ||
    location.pathname === '/vocabulary/try-n3' ||
    location.pathname === '/vocabulary/mimikara' ||
    location.pathname === '/vocabulary/dekiru' ||
    location.pathname === '/kanji/set-4' ||
    location.pathname.startsWith('/exam-') ||
    location.pathname === '/dong-du' ||
    location.pathname === '/translator' ||
    location.pathname === '/grammar/confusing' ||
    location.pathname === '/tips';

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      <ScrollToTopButton />
      <Header />
      
      {/* Slogan - Top Right Corner Badge */}
      <div className="fixed right-6 top-6 z-[1001] hidden lg:block pointer-events-none select-none">
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 italic whitespace-nowrap">
            "If you can dream it, you can do it"
          </p>
        </div>
      </div>

      <main className="flex-grow flex flex-col">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

const Fallback = () => (
  <div className="min-h-[calc(100vh-80px)] mt-20 flex-grow flex items-center justify-center bg-white text-slate-500 font-bold text-lg">
    <div className="text-center space-y-4">
      <div>Trang đang phát triển</div>
    </div>
  </div>
);

export default function RouteMap() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="grammar" element={<Grammar />} />
        <Route path="grammar/mimikara" element={<Mimikara />} />
        <Route path="/vocabulary" element={<Vocabulary />} />
        <Route path="/vocabulary/soumatome" element={<Soumatome />} />
        <Route path="/vocabulary/try-n3" element={<TryN3 />} />
        <Route path="/vocabulary/mimikara" element={<MimikaraVocab />} />
        <Route path="/vocabulary/dekiru" element={<DekiruVocab />} />
        <Route path="/kanji" element={<Kanji />} />
        <Route path="/kanji/set-4" element={<KanjiSet4 />} />
        <Route path="/exam-pc7" element={<ExamPC7 />} />
        <Route path="/exam-pc7/vocab-comprehensive" element={<ExamVocab type="comprehensive" />} />
        <Route path="/exam-pc7/kanji-comprehensive" element={<ExamVocab type="kanji-comprehensive" />} />
        <Route path="/exam-pc7/goi-test" element={<TempVocabTest />} />
        <Route path="/dong-du" element={<DongDu />} />
        <Route path="/exam-pc8" element={<ExamPC8 />} />
        <Route path="/exam-pc8/kanji" element={<KanjiPC8Selector />} />
        <Route path="/exam-pc8/kanji/study" element={<ExamVocab type="kanji-pc8" />} />
        <Route path="/exam-jlpt" element={<ExamJLPT />} />
        <Route path="/exam-jlpt/sentence-sort" element={<SentenceSort />} />
        <Route path="/translator" element={<Translator />} />
        <Route path="/grammar/confusing" element={<ConfusingGrammar />} />
        <Route path="/tips" element={<Tips />} />
        <Route path="*" element={<Fallback />} />
      </Route>
    </Routes>
  );
}
