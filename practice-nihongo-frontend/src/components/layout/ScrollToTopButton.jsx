import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { pathname } = useLocation();

  // 1. Auto scroll to top on route change (Legacy ScrollToTop functionality)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // 2. Toggle visibility of floating button when scrolling
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-10 right-10 z-[1500] w-14 h-14 bg-black text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-in slide-in-from-bottom duration-500 border-2 border-white/20"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
