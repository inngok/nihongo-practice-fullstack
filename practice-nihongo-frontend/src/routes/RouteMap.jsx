import React, { Suspense, lazy, useState } from "react";
import { Routes, Route, Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ScrollToTopButton from "../components/layout/ScrollToTopButton";
import AdminSidebar from "../components/layout/AdminSidebar";
import GrammarAIBot from "../components/GrammarAIBot";
import { MenuOutlined } from "@ant-design/icons";


const Home = lazy(() => import("../pages/home/Home"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));

// Grammar
const Grammar = lazy(() => import("../pages/grammar/Grammar"));
const ConfusingGrammar = lazy(() => import("../pages/grammar/ConfusingGrammar"));
const KeigoPage = lazy(() => import("../pages/grammar/KeigoPage"));
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


const Tips = lazy(() => import("../pages/tips/Tips"));
const AiChat = lazy(() => import("../pages/ai-chat/AiChat"));
const Profile = lazy(() => import("../pages/profile/Profile"));
const JlptPastVocab = lazy(() => import("../pages/exam/jlpt/JlptPastVocab"));
const NewsList = lazy(() => import("../pages/news/NewsList"));
const NewsDetail = lazy(() => import("../pages/news/NewsDetail"));

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
const ConfusingGrammarManager = lazy(() => import("../pages/manage/ConfusingGrammarManager"));

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

const UserLayout = () => {
  const { pathname } = useLocation();
  const hideFooterRoutes = ['/ai-chat'];
  const shouldHideFooter = hideFooterRoutes.includes(pathname);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      {!shouldHideFooter && <ScrollToTopButton />}
      <Header />

      <main className="flex-grow flex flex-col">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <GrammarAIBot />
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative flex flex-col lg:flex-row">
      {/* Mobile Top Navbar */}
      <header className="lg:hidden h-16 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 fixed top-0 left-0 z-[1200] shadow-sm">
        <span className="text-sm font-black tracking-tighter text-slate-900 dark:text-white uppercase">
          NIHONGO ADMIN
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-700 dark:text-slate-300"
        >
          <MenuOutlined className="text-base" />
        </button>
      </header>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[1150] transition-opacity"
        />
      )}

      {/* Admin Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-[1180] w-64 transform lg:transform-none lg:sticky lg:top-0 lg:h-screen lg:block transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <AdminSidebar onClose={() => setIsOpen(false)} />
      </div>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0 pt-16 lg:pt-0">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN';
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children ? children : <Outlet />;
};

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
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
          fontFamily: "'Plus Jakarta Sans', sans-serif",
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
            <Route path="keigo" element={<KeigoPage />} />
          </Route>

          {/* Vocabulary Section */}
          <Route path="vocabulary">
            <Route index element={<Vocabulary />} />
            <Route path="study" element={<VocabStudyWrapper />} />
          </Route>
          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="my-vocab" element={<PersonalVocab />} />
          </Route>

          {/* Kanji Section */}
          <Route path="kanji">
            <Route index element={<Kanji />} />
            <Route path="study" element={<KanjiStudyWrapper />} />
            <Route path="set-4" element={<KanjiSet4 />} />
          </Route>

          {/* Exams & Study Tools */}

          <Route path="exam-jlpt">
            <Route index element={<ExamJLPT />} />
            <Route path="past-vocab" element={<JlptPastVocab />} />
          </Route>


          <Route path="tips" element={<Tips />} />
          <Route path="flashcards" element={<Flashcards />} />
          <Route path="news">
            <Route index element={<NewsList />} />
            <Route path=":id" element={<NewsDetail />} />
          </Route>
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
            <Route path="ai" element={<AiManager />} />
            <Route path="jlpt-vocab" element={<JlptPastVocabManager />} />
          </Route>
        </Route>

        {/* Direct Management Paths (accessed from Sidebar and dropdown) */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="grammar/manage" element={<GrammarManager />} />
          <Route path="grammar/confusing-manage" element={<ConfusingGrammarManager />} />
          <Route path="grammar/books" element={<BookManager />} />
          <Route path="vocabulary/manage" element={<VocabManager />} />
          <Route path="kanji/manage" element={<KanjiManager />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}

