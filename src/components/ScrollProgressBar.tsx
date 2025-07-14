import { useEffect, useState } from 'react';

const ScrollProgressBar = () => {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScroll(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div
        className="h-1.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 transition-all duration-500"
        style={{ width: `${scroll}%`, transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </div>
  );
};

export default ScrollProgressBar; 