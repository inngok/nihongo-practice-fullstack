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
const GrammarStudy = lazy(() => import("../pages/grammar/StudyPage"));
const VocabStudy = lazy(() => import("../pages/vocabulary/VocabStudy"));
const KanjiStudy = lazy(() => import("../pages/kanji/KanjiStudy"));

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
const AiChat = lazy(() => import("../pages/ai-chat/AiChat"));
const Profile = lazy(() => import("../pages/profile/Profile"));
const JlptPastVocab = lazy(() => import("../pages/exam/jlpt/JlptPastVocab"));

// Admin Management
const Dashboard = lazy(() => import("../pages/manage/Dashboard"));
const GrammarManager = lazy(() => import("../pages/manage/GrammarManager"));
const BookManager = lazy(() => import("../pages/manage/BookManager"));
const VocabManager = lazy(() => import("../pages/manage/VocabManager"));
const KanjiManager = lazy(() => import("../pages/manage/KanjiManager"));
const DataImporter = lazy(() => import("../pages/manage/DataImporter"));
const UserManager = lazy(() => import("../pages/manage/UserManager"));
const AiManager = lazy(() => import("../pages/manage/AiManager"));
const JlptPastVocabManager = lazy(() => import("../pages/manage/JlptPastVocabManager"));

// --- Layout & Route Wrappers ---

const GrammarStudyWrapper = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const bookId = searchParams.get('bookId') || '';
  return <GrammarStudy key={`grammar-${bookId}`} />;
};

const VocabStudyWrapper = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const bookId = searchParams.get('bookId') || '';
  return <VocabStudy key={`vocab-${bookId}`} />;
};

const KanjiStudyWrapper = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const bookId = searchParams.get('bookId') || '';
  return <KanjiStudy key={`kanji-${bookId}`} />;
};

const PageLoader = () => (
  <div className="min-h-[calc(100vh-80px)] mt-20 flex items-center justify-center bg-white dark:bg-transparent">
    <div className="w-6 h-6 border-2 border-slate-100 border-t-black rounded-full animate-spin"></div>
  </div>
);

const UserLayout = () => (
  <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
    <ScrollToTopButton />
    <Header />

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
  <div className="min-h-[calc(100vh-80px)] mt-20 flex-grow flex items-center justify-center bg-white dark:bg-transparent text-slate-500 dark:text-slate-400 font-bold text-lg">
    <div className="text-center space-y-4">
      <div>Trang đang phát triển</div>
    </div>
  </div>
);

import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "../context/ThemeContext";

// --- Main Router ---

export default function RouteMap() {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          fontFamily: "Inter, sans-serif",
          ...(isDark ? {
            colorBgBase: '#020617', // Slate 950
            colorBgContainer: '#0f172a', // Slate 900
            colorBorder: '#1e293b', // Slate 800
          } : {})
        }
      }}
    >
      <Routes>
      {/* Public & User Routes */}
      <Route element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Grammar Section */}
        <Route path="grammar">
          <Route index element={<Grammar />} />
          <Route path="study" element={<GrammarStudyWrapper />} />
          <Route path="confusing" element={<ConfusingGrammar />} />
        </Route>

        {/* Vocabulary Section */}
        <Route path="vocabulary">
          <Route index element={<Vocabulary />} />
          <Route path="study" element={<VocabStudyWrapper />} />
        </Route>
        <Route path="my-vocab" element={<PersonalVocab />} />

        {/* Kanji Section */}
        <Route path="kanji">
          <Route index element={<Kanji />} />
          <Route path="study" element={<KanjiStudyWrapper />} />
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
          <Route path="past-vocab" element={<JlptPastVocab />} />
        </Route>

        <Route path="translator" element={<Translator />} />
        <Route path="tips" element={<Tips />} />
        <Route path="flashcards" element={<Flashcards />} />
        <Route path="ai-chat" element={<AiChat />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Fallback />} />
      </Route>

      {/* Admin Management Routes */}
      <Route path="manage" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManager />} />
          <Route path="import" element={<DataImporter />} />
          {/* Legacy/Deep paths for management */}
          <Route path="grammar" element={<GrammarManager />} />
          <Route path="books" element={<BookManager />} />
          <Route path="vocabulary" element={<VocabManager />} />
          <Route path="kanji" element={<KanjiManager />} />
          <Route path="ai" element={<AiManager />} />
          <Route path="jlpt-vocab" element={<JlptPastVocabManager />} />
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
  </ConfigProvider>
  );
}

