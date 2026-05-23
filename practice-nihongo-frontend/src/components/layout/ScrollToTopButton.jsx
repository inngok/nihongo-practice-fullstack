import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTopButton() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setScrollY(0);
  }, [pathname]);

  useEffect(() => {
    let scrollTimeout;

    const handleScroll = () => {
      setScrollY(window.pageYOffset);
      setIsScrolling(true);

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 1500); // Hide after 1.5 seconds of inactivity
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;
  const maxScrollY = scrollHeight - clientHeight;
  const canScroll = scrollHeight > clientHeight * 1.15; // Page is at least 15% longer than viewport

  // Split the actual scrollable range into upper and lower half
  const isInUpperHalf = scrollY < maxScrollY / 2;

  // Show "Down" button when in the upper half of the scrollable range (but not at the very top)
  const showDownButton = canScroll && isInUpperHalf && scrollY > 120 && (isScrolling || isHovered);
  
  // Show "Up" button when in the lower half of the scrollable range (but not at the very bottom)
  const showUpButton = canScroll && !isInUpperHalf && (maxScrollY - scrollY > 120) && (isScrolling || isHovered);

  return (
    <>
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed bottom-28 right-8 z-[1500] w-11 h-11 bg-black dark:bg-slate-900 text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10 transform ${
          showUpButton 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Scroll to Bottom Button */}
      <button
        onClick={scrollToBottom}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed bottom-28 right-8 z-[1500] w-11 h-11 bg-black dark:bg-slate-900 text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10 transform ${
          showDownButton 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
        }`}
        aria-label="Scroll to bottom"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </>
  );
}
