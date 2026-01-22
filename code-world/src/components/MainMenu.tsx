import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { levels } from '../levels';

const MainMenu = () => {
  const { setScreen, initializeLevel, userProgress } = useGameStore();

  // Generate particles with stable positions
  const particles = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: (i * 17 + 23) % 100,
      top: (i * 13 + 7) % 100,
      duration: 2 + (i % 3),
      delay: (i * 0.07) % 2,
    })),
  []);

  const handleStartGame = () => {
    // Load first level or continue from last
    const levelToLoad = levels.find(l => l.id === userProgress.currentLevel) || levels[0];
    initializeLevel(levelToLoad);
    setScreen('game');
  };

  const handleLevelSelect = () => {
    setScreen('levelSelect');
  };

  const handleAchievements = () => {
    setScreen('achievements');
  };

  return (
    <div className="fixed inset-0 bg-dark-bg flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1 h-1 bg-neon-blue rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Decorative code rain */}
      <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-neon-blue/20 to-transparent" />
      <div className="absolute right-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-neon-purple/20 to-transparent" />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-12"
        >
          <h1 className="font-pixel text-5xl md:text-7xl text-neon-blue neon-text mb-2">
            CODE
          </h1>
          <h1 className="font-pixel text-5xl md:text-7xl text-neon-purple neon-text-purple">
            WORLD
          </h1>
          <p className="font-mono text-sm text-gray-400 mt-4">
            Программируй. Играй. Учись.
          </p>
        </motion.div>

        {/* Pixel Art Character */}
        <motion.div
          className="mb-8 flex justify-center"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-24 h-24 relative">
            <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
              <rect x="5" y="1" width="6" height="6" fill="#00f3ff" />
              <rect x="6" y="3" width="2" height="2" fill="#0a0a0f" />
              <rect x="10" y="3" width="2" height="2" fill="#0a0a0f" />
              <rect x="4" y="7" width="8" height="5" fill="#b14aed" />
              <rect x="2" y="7" width="2" height="4" fill="#b14aed" />
              <rect x="12" y="7" width="2" height="4" fill="#b14aed" />
              <rect x="5" y="12" width="2" height="4" fill="#00f3ff" />
              <rect x="9" y="12" width="2" height="4" fill="#00f3ff" />
            </svg>
            <div className="absolute inset-0 blur-xl bg-neon-blue/30" />
          </div>
        </motion.div>

        {/* Menu Buttons */}
        <div className="space-y-4 max-w-xs mx-auto">
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartGame}
            className="btn-neon w-full"
          >
            {userProgress.completedLevels.length > 0 ? 'ПРОДОЛЖИТЬ' : 'НОВАЯ ИГРА'}
          </motion.button>

          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLevelSelect}
            className="btn-neon w-full"
          >
            ВЫБОР УРОВНЯ
          </motion.button>

          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAchievements}
            className="btn-neon w-full"
          >
            ДОСТИЖЕНИЯ
          </motion.button>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-xs text-gray-500 font-mono"
        >
          <div className="flex justify-center gap-8">
            <div>
              <span className="text-neon-blue">{userProgress.completedLevels.length}</span>
              <span className="ml-1">уровней</span>
            </div>
            <div>
              <span className="text-neon-purple">{userProgress.totalCodeExecutions}</span>
              <span className="ml-1">запусков</span>
            </div>
          </div>
        </motion.div>

        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1 }}
          className="mt-8 text-xs text-gray-600 font-mono"
        >
          v1.0.0 | © 2024 CodeWorld
        </motion.p>
      </motion.div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-20 h-20 border-l-2 border-t-2 border-neon-blue/30" />
      <div className="absolute top-4 right-4 w-20 h-20 border-r-2 border-t-2 border-neon-purple/30" />
      <div className="absolute bottom-4 left-4 w-20 h-20 border-l-2 border-b-2 border-neon-purple/30" />
      <div className="absolute bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-neon-blue/30" />
    </div>
  );
};

export default MainMenu;
