import React, { Suspense, lazy } from "react";
import { Routes, Route, Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ScrollToTopButton from "../components/layout/ScrollToTopButton";
import AdminSidebar from "../components/layout/AdminSidebar";

// --- Lazy Loading Components ---

// Base & Auth
const Home = lazy(() => import("../pages/home/Home"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));

// Grammar
const Grammar = lazy(() => import("../pages/grammar/Grammar"));
const ConfusingGrammar = lazy(() => import("../pages/grammar/ConfusingGrammar"));

// Vocabulary
const Vocabulary = lazy(() => import("../pages/vocabulary/Vocabulary"));
const PersonalVocab = lazy(() => import("../pages/vocabulary/PersonalVocab"));

// Kanji
const Kanji = lazy(() => import("../pages/kanji/Kanji"));
const KanjiSet4 = lazy(() => import("../pages/kanji/KanjiSet4"));

// Flashcards
const Flashcards = lazy(() => import("../pages/flashcard/Flashcards"));


// Exams & Specialized
const ExamJLPT = lazy(() => import("../pages/exam/jlpt/ExamJLPT"));
const SentenceSort = lazy(() => import("../pages/exam/jlpt/SentenceSort"));
const DongDu = lazy(() => import("../pages/exam/dong-du/DongDu"));
const ExamPC7 = lazy(() => import("../pages/exam/dong-du/ExamPC7"));
const ExamPC8 = lazy(() => import("../pages/exam/dong-du/ExamPC8"));
const ExamVocab = lazy(() => import("../pages/exam/components/ExamVocab"));
const KanjiPC8Selector = lazy(() => import("../pages/exam/dong-du/KanjiPC8Selector"));
const Translator = lazy(() => import("../pages/translator/Translator"));
const Tips = lazy(() => import("../pages/tips/Tips"));

// Admin Management
const GrammarManager = lazy(() => import("../pages/manage/GrammarManager"));
const BookManager = lazy(() => import("../pages/manage/BookManager"));
const VocabManager = lazy(() => import("../pages/manage/VocabManager"));
const KanjiManager = lazy(() => import("../pages/manage/KanjiManager"));
const DataImporter = lazy(() => import("../pages/manage/DataImporter"));
const UserManager = lazy(() => import("../pages/manage/UserManager"));

// --- Layout & Route Wrappers ---

const PageLoader = () => (
  <div className="min-h-[calc(100vh-80px)] mt-20 flex items-center justify-center bg-white">
    <div className="w-6 h-6 border-2 border-slate-100 border-t-black rounded-full animate-spin"></div>
  </div>
);

const UserLayout = () => (
  <div className="flex flex-col min-h-screen bg-white relative">
    <ScrollToTopButton />
    <Header />

    {/* Slogan Badge */}
    <div className="fixed right-6 top-24 z-[1001] hidden lg:block pointer-events-none select-none">
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

const AdminLayout = () => (
  <div className="flex min-h-screen bg-white relative">
    <AdminSidebar />
    <main className="flex-grow flex flex-col ml-64 min-w-0">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
  </div>
);

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN';
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children ? children : <Outlet />;
};

const Fallback = () => (
  <div className="min-h-[calc(100vh-80px)] mt-20 flex-grow flex items-center justify-center bg-white text-slate-500 font-bold text-lg">
    <div className="text-center space-y-4">
      <div>Trang đang phát triển</div>
    </div>
  </div>
);

// --- Main Router ---

export default function RouteMap() {
  return (
    <Routes>
      {/* Public & User Routes */}
      <Route element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Grammar Section */}
        <Route path="grammar">
          <Route index element={<Grammar />} />
          <Route path="confusing" element={<ConfusingGrammar />} />
        </Route>

        {/* Vocabulary Section */}
        <Route path="vocabulary">
          <Route index element={<Vocabulary />} />
        </Route>
        <Route path="my-vocab" element={<PersonalVocab />} />

        {/* Kanji Section */}
        <Route path="kanji">
          <Route index element={<Kanji />} />
          <Route path="set-4" element={<KanjiSet4 />} />
        </Route>

        {/* Exams & Study Tools */}
        <Route path="dong-du" element={<DongDu />} />
        <Route path="exam-pc7">
          <Route index element={<ExamPC7 />} />
          <Route path="vocab-comprehensive" element={<ExamVocab type="comprehensive" />} />
          <Route path="kanji-comprehensive" element={<ExamVocab type="kanji-comprehensive" />} />
        </Route>
        <Route path="exam-pc8">
          <Route index element={<ExamPC8 />} />
          <Route path="kanji" element={<KanjiPC8Selector />} />
          <Route path="kanji/study" element={<ExamVocab type="kanji-pc8" />} />
        </Route>
        <Route path="exam-jlpt">
          <Route index element={<ExamJLPT />} />
          <Route path="sentence-sort" element={<SentenceSort />} />
        </Route>

        <Route path="translator" element={<Translator />} />
        <Route path="tips" element={<Tips />} />
        <Route path="flashcards" element={<Flashcards />} />
        <Route path="*" element={<Fallback />} />
      </Route>

      {/* Admin Management Routes */}
      <Route path="manage" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="users" element={<UserManager />} />
          <Route path="import" element={<DataImporter />} />
          {/* Legacy/Deep paths for management */}
          <Route path="grammar" element={<GrammarManager />} />
          <Route path="books" element={<BookManager />} />
          <Route path="vocabulary" element={<VocabManager />} />
          <Route path="kanji" element={<KanjiManager />} />
        </Route>
      </Route>

      {/* Map legacy/specific management paths to the new structure if needed, 
          but here we just use the grouped approach. 
          The user previously had /grammar/manage etc. Let's keep those for compatibility but group them. */}
      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="grammar/manage" element={<GrammarManager />} />
        <Route path="grammar/books" element={<BookManager />} />
        <Route path="vocabulary/manage" element={<VocabManager />} />
        <Route path="kanji/manage" element={<KanjiManager />} />
      </Route>
    </Routes>
  );
}

