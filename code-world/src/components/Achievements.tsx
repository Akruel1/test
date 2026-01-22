import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import type { Achievement } from '../types';

// Default achievements
const defaultAchievements: Achievement[] = [
  {
    id: 'first-code',
    name: 'Первые Шаги',
    description: 'Запусти свой первый код',
    icon: '🚀',
    unlocked: false,
    rarity: 'common',
  },
  {
    id: 'first-move',
    name: 'Движение - Жизнь',
    description: 'Успешно перемести персонажа',
    icon: '🏃',
    unlocked: false,
    rarity: 'common',
  },
  {
    id: 'collector',
    name: 'Коллекционер',
    description: 'Собери 10 монет',
    icon: '💰',
    unlocked: false,
    rarity: 'common',
  },
  {
    id: 'level-1-complete',
    name: 'Пробуждение',
    description: 'Пройди первый уровень',
    icon: '🌟',
    unlocked: false,
    rarity: 'common',
  },
  {
    id: 'loop-master',
    name: 'Мастер Циклов',
    description: 'Используй цикл для решения задачи',
    icon: '🔄',
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: 'function-wizard',
    name: 'Волшебник Функций',
    description: 'Создай и используй свою функцию',
    icon: '✨',
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: 'no-errors',
    name: 'Чистый Код',
    description: 'Пройди уровень без единой ошибки',
    icon: '💎',
    unlocked: false,
    rarity: 'epic',
  },
  {
    id: 'speedrunner',
    name: 'Скоростной Кодер',
    description: 'Пройди уровень менее чем за 5 команд',
    icon: '⚡',
    unlocked: false,
    rarity: 'epic',
  },
  {
    id: 'polyglot',
    name: 'Полиглот',
    description: 'Пройди уровень на разных языках',
    icon: '🌐',
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: 'all-levels',
    name: 'Легенда CodeWorld',
    description: 'Пройди все уровни',
    icon: '👑',
    unlocked: false,
    rarity: 'legendary',
  },
  {
    id: '100-executions',
    name: 'Упорство',
    description: 'Запусти код 100 раз',
    icon: '🔥',
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: 'secret-master',
    name: '???',
    description: 'Найди секретную команду',
    icon: '🎭',
    unlocked: false,
    rarity: 'legendary',
  },
];

const AchievementsScreen = () => {
  const { setScreen, userProgress } = useGameStore();

  // Merge saved achievements with defaults
  const achievements = defaultAchievements.map(defaultAch => {
    const saved = userProgress.achievements.find(a => a.id === defaultAch.id);
    return saved || defaultAch;
  });

  const handleBack = () => {
    setScreen('menu');
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-500';
      case 'rare': return 'text-blue-400 border-blue-500';
      case 'epic': return 'text-purple-400 border-purple-500';
      case 'legendary': return 'text-yellow-400 border-yellow-500';
    }
  };

  const getRarityBg = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-500/10';
      case 'rare': return 'from-blue-500/10';
      case 'epic': return 'from-purple-500/10';
      case 'legendary': return 'from-yellow-500/10';
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="fixed inset-0 bg-dark-bg flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-4xl w-full mx-4 h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
            ДОСТИЖЕНИЯ
          </h1>

          <div className="font-mono text-sm">
            <span className="text-neon-green">{unlockedCount}</span>
            <span className="text-gray-500"> / {totalCount}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-dark-panel rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green"
            />
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`panel p-4 relative overflow-hidden ${
                  achievement.unlocked 
                    ? '' 
                    : 'opacity-60 grayscale'
                }`}
              >
                {/* Background gradient based on rarity */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getRarityBg(achievement.rarity)} to-transparent`} />
                
                <div className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div className={`text-4xl p-3 rounded-lg bg-dark-bg border ${
                    achievement.unlocked 
                      ? getRarityColor(achievement.rarity).split(' ')[1]
                      : 'border-gray-700'
                  }`}>
                    {achievement.unlocked ? achievement.icon : '🔒'}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-pixel text-sm ${
                        achievement.unlocked 
                          ? getRarityColor(achievement.rarity).split(' ')[0]
                          : 'text-gray-500'
                      }`}>
                        {achievement.name}
                      </h3>
                      
                      {/* Rarity badge */}
                      <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                        getRarityColor(achievement.rarity)
                      } border`}>
                        {achievement.rarity}
                      </span>
                    </div>
                    
                    <p className="font-mono text-xs text-gray-400">
                      {achievement.description}
                    </p>

                    {/* Unlock date */}
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="font-mono text-xs text-gray-600 mt-2">
                        Получено: {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Unlocked shine effect */}
                {achievement.unlocked && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                    animate={{ translateX: ['0%', '200%'] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      repeatDelay: 5,
                      ease: 'linear' 
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-4 border-t border-dark-border"
        >
          <div className="flex justify-center gap-8 text-xs font-mono text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-gray-500/30 border border-gray-500" />
              <span>Обычное</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500" />
              <span>Редкое</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500" />
              <span>Эпическое</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500" />
              <span>Легендарное</span>
            </div>
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

export default AchievementsScreen;
