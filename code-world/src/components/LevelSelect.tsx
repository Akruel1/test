import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { levels } from '../levels';

const LevelSelect = () => {
  const { setScreen, initializeLevel, userProgress } = useGameStore();

  const handleSelectLevel = (levelId: string) => {
    const level = levels.find(l => l.id === levelId);
    if (level) {
      initializeLevel(level);
      setScreen('game');
    }
  };

  const handleBack = () => {
    setScreen('menu');
  };

  const isLevelUnlocked = (levelId: string): boolean => {
    const level = levels.find(l => l.id === levelId);
    if (!level?.unlockRequirements) return true;
    return level.unlockRequirements.every(req => 
      userProgress.completedLevels.includes(req)
    );
  };

  const isLevelCompleted = (levelId: string): boolean => {
    return userProgress.completedLevels.includes(levelId);
  };

  return (
    <div className="fixed inset-0 bg-dark-bg flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-4xl w-full mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="text-neon-blue hover:text-white transition-colors flex items-center gap-2 font-mono"
          >
            <span>←</span>
            <span>Назад</span>
          </motion.button>

          <h1 className="font-pixel text-2xl md:text-3xl text-neon-purple neon-text-purple">
            ВЫБОР УРОВНЯ
          </h1>

          <div className="w-20" /> {/* Spacer for alignment */}
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level, index) => {
            const unlocked = isLevelUnlocked(level.id);
            const completed = isLevelCompleted(level.id);

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={unlocked ? { scale: 1.02, y: -5 } : {}}
                onClick={() => unlocked && handleSelectLevel(level.id)}
                className={`panel p-6 cursor-pointer transition-all relative overflow-hidden ${
                  unlocked
                    ? 'hover:border-neon-blue'
                    : 'opacity-50 cursor-not-allowed'
                } ${completed ? 'border-neon-green' : ''}`}
              >
                {/* Level Number */}
                <div className="absolute top-2 right-2">
                  <span className="font-pixel text-xs text-gray-500">
                    #{index + 1}
                  </span>
                </div>

                {/* Status Icon */}
                <div className="absolute top-2 left-2">
                  {completed ? (
                    <span className="text-neon-green text-xl">✓</span>
                  ) : unlocked ? (
                    <span className="text-neon-blue text-xl">○</span>
                  ) : (
                    <span className="text-gray-500 text-xl">🔒</span>
                  )}
                </div>

                {/* Level Info */}
                <div className="mt-4">
                  <h3 className={`font-pixel text-lg mb-2 ${
                    completed 
                      ? 'text-neon-green' 
                      : unlocked 
                      ? 'text-neon-blue' 
                      : 'text-gray-500'
                  }`}>
                    {level.name}
                  </h3>
                  
                  <p className="font-mono text-sm text-gray-400 mb-4 line-clamp-2">
                    {level.description}
                  </p>

                  {/* Objectives */}
                  <div className="space-y-1">
                    {level.objectives.slice(0, 3).map((obj, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-neon-purple">▸</span>
                        <span className="truncate">{obj.description}</span>
                      </div>
                    ))}
                    {level.objectives.length > 3 && (
                      <span className="text-xs text-gray-600">
                        +{level.objectives.length - 3} ещё
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover Effect */}
                {unlocked && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-neon-blue/10 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                  />
                )}

                {/* Locked Overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 bg-dark-bg/80 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-4xl">🔒</span>
                      <p className="font-mono text-xs text-gray-500 mt-2">
                        Пройди предыдущий уровень
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="font-mono text-sm text-gray-400">
            Прогресс: {' '}
            <span className="text-neon-green">
              {userProgress.completedLevels.length}
            </span>
            {' '}/{' '}
            <span className="text-neon-blue">{levels.length}</span>
            {' '}уровней пройдено
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4 max-w-md mx-auto h-2 bg-dark-panel rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${(userProgress.completedLevels.length / levels.length) * 100}%` 
              }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="h-full bg-gradient-to-r from-neon-blue to-neon-green"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-neon-blue/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-neon-purple/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-neon-purple/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-neon-blue/30" />
    </div>
  );
};

export default LevelSelect;
