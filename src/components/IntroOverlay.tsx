import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Terminal, Cpu, ChevronRight } from 'lucide-react';

interface IntroOverlayProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "WELCOME TO CODE WORLD",
    description: "A virtual reality constructed entirely of logic.",
    icon: <Code2 size={64} className="text-neon-purple" />,
    color: "text-neon-purple"
  },
  {
    title: "NO CONTROLLERS",
    description: "Forget WASD. Your keyboard is your wand. Code is your spell.",
    icon: <Terminal size={64} className="text-neon-blue" />,
    color: "text-neon-blue"
  },
  {
    title: "PROGRAM YOUR DESTINY",
    description: "Solve puzzles, automate tasks, and reshape the world.",
    icon: <Cpu size={64} className="text-neon-green" />,
    color: "text-neon-green"
  }
];

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'loading' | 'slides'>('loading');
  const [progress, setProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Loading Simulation
  useEffect(() => {
    if (phase === 'loading') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase('slides'), 500);
            return 100;
          }
          return prev + Math.random() * 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center font-mono">
      <AnimatePresence mode="wait">
        {phase === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md p-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2 tracking-widest animate-pulse">
                INITIALIZING SYSTEM
              </h1>
              <div className="text-gray-500 text-sm">Loading assets... {Math.floor(progress)}%</div>
            </div>
            
            <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800">
              <div 
                className="h-full bg-neon-purple shadow-[0_0_10px_#b026ff]"
                style={{ width: `${progress}%`, transition: 'width 0.1s ease-out' }}
              />
            </div>
            
            <div className="mt-4 font-mono text-xs text-green-500 h-20 overflow-hidden opacity-50">
              {progress > 10 && <div>> Loading core modules... OK</div>}
              {progress > 30 && <div>> Initializing graphics engine... OK</div>}
              {progress > 50 && <div>> Connecting to neural interface... OK</div>}
              {progress > 80 && <div>> Decrypting world data... OK</div>}
            </div>
          </motion.div>
        )}

        {phase === 'slides' && (
          <motion.div
            key="slides"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-2xl px-4"
          >
             <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="p-6 rounded-full bg-gray-900/50 border border-gray-800 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  {slides[currentSlide].icon}
                </div>
                
                <h2 className={`text-4xl font-bold tracking-wider ${slides[currentSlide].color} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                  {slides[currentSlide].title}
                </h2>
                
                <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                  {slides[currentSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="mt-12 group relative px-8 py-3 bg-transparent border border-white/20 text-white rounded-lg overflow-hidden transition-colors hover:border-neon-purple/50"
            >
              <div className="absolute inset-0 bg-neon-purple/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-2 font-bold tracking-widest">
                {currentSlide === slides.length - 1 ? 'ENTER SYSTEM' : 'NEXT'}
                <ChevronRight size={16} />
              </span>
            </motion.button>
            
            <div className="mt-8 flex gap-2 justify-center">
              {slides.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${idx === currentSlide ? 'bg-white' : 'bg-gray-700'}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntroOverlay;
