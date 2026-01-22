import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('INITIALIZING SYSTEM...');

  const loadingTexts = [
    'INITIALIZING SYSTEM...',
    'LOADING ASSETS...',
    'COMPILING SHADERS...',
    'GENERATING WORLD...',
    'ESTABLISHING CONNECTION...',
    'READY',
  ];

  useEffect(() => {
    const duration = 3000; // 3 seconds load time
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      const textIndex = Math.floor((newProgress / 100) * (loadingTexts.length - 1));
      setText(loadingTexts[textIndex]);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-game-bg flex flex-col items-center justify-center z-50 text-game-primary font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-4xl font-bold tracking-widest text-shadow-neon"
      >
        CODE_WORLD
      </motion.div>

      <div className="w-64 h-4 border-2 border-game-primary p-1 rounded-sm">
        <motion.div
          className="h-full bg-game-primary"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 text-sm h-6">
        {text} <span className="animate-pulse">_</span>
      </div>

      <div className="absolute bottom-10 text-xs text-gray-500">
        V 0.1.0 ALPHA
      </div>
    </div>
  );
};

export default LoadingScreen;
