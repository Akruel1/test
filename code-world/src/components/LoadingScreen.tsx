import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Инициализация системы');
  const showParticles = true;

  const loadingStages = [
    'Инициализация системы',
    'Загрузка игрового мира',
    'Подготовка компилятора',
    'Синхронизация реальности',
    'Активация ИИ-систем',
    'Запуск виртуальной среды',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 15 + 5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const stageIndex = Math.min(
      Math.floor((progress / 100) * loadingStages.length),
      loadingStages.length - 1
    );
    setLoadingText(loadingStages[stageIndex]);
  }, [progress]);

  // Generate particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 5,
    size: 2 + Math.random() * 4,
  }));

  return (
    <div className="fixed inset-0 bg-dark-bg flex items-center justify-center overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Floating Particles */}
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-neon-blue opacity-60"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                bottom: -20,
              }}
              animate={{
                y: [0, -window.innerHeight - 100],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}

      {/* Scanlines Effect */}
      <div className="absolute inset-0 scanlines pointer-events-none opacity-20" />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h1 className="font-pixel text-4xl md:text-6xl text-neon-blue neon-text">
            CODE
          </h1>
          <h1 className="font-pixel text-4xl md:text-6xl text-neon-purple neon-text-purple -mt-2">
            WORLD
          </h1>
        </motion.div>

        {/* Pixel Art Character Animation */}
        <motion.div
          className="mb-8 relative"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-16 h-16 relative">
            {/* Simple pixel art character */}
            <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
              {/* Head */}
              <rect x="5" y="1" width="6" height="6" fill="#00f3ff" />
              {/* Eyes */}
              <rect x="6" y="3" width="2" height="2" fill="#0a0a0f" />
              <rect x="10" y="3" width="2" height="2" fill="#0a0a0f" />
              {/* Body */}
              <rect x="4" y="7" width="8" height="5" fill="#b14aed" />
              {/* Arms */}
              <rect x="2" y="7" width="2" height="4" fill="#b14aed" />
              <rect x="12" y="7" width="2" height="4" fill="#b14aed" />
              {/* Legs */}
              <rect x="5" y="12" width="2" height="4" fill="#00f3ff" />
              <rect x="9" y="12" width="2" height="4" fill="#00f3ff" />
            </svg>
            
            {/* Glow effect */}
            <div className="absolute inset-0 blur-lg bg-neon-blue opacity-30" />
          </div>
        </motion.div>

        {/* Loading Bar Container */}
        <div className="w-80 md:w-96 mb-6">
          <div className="pixel-border bg-dark-panel p-1 relative overflow-hidden">
            {/* Progress Bar */}
            <motion.div
              className="h-6 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated stripes */}
              <div 
                className="h-full w-full opacity-30"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
                  animation: 'loading-stripe 1s linear infinite',
                }}
              />
            </motion.div>

            {/* Percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-pixel text-xs text-white drop-shadow-lg">
                {Math.floor(progress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <motion.p
          key={loadingText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="font-mono text-sm text-neon-blue/80"
        >
          {loadingText}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            _
          </motion.span>
        </motion.p>

        {/* Decorative Code Snippets */}
        <div className="absolute -left-20 top-1/4 opacity-20 font-mono text-xs text-neon-green hidden md:block">
          <pre>{`function init() {
  loadWorld();
  startEngine();
}`}</pre>
        </div>
        <div className="absolute -right-20 bottom-1/4 opacity-20 font-mono text-xs text-neon-purple hidden md:block">
          <pre>{`while (true) {
  render();
  update();
}`}</pre>
        </div>
      </motion.div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-neon-blue/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-neon-blue/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-neon-blue/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-neon-blue/30" />

      <style>{`
        @keyframes loading-stripe {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
