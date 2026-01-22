import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import LoadingScreen from './components/LoadingScreen';
import IntroPresentation from './components/IntroPresentation';
import MainMenu from './components/MainMenu';
import LevelSelect from './components/LevelSelect';
import Achievements from './components/Achievements';
import GameLayout from './components/GameLayout';

function App() {
  const { screen, setScreen, userProgress } = useGameStore();

  // Check if first visit (runs once on mount)
  useEffect(() => {
    const hasVisited = localStorage.getItem('code-world-visited');
    if (hasVisited) {
      // Skip intro if returning user
      localStorage.setItem('code-world-skip-intro', 'true');
    }
  }, []);

  const handleLoadingComplete = () => {
    const skipIntro = localStorage.getItem('code-world-skip-intro');
    if (skipIntro || userProgress.totalCodeExecutions > 0) {
      setScreen('menu');
    } else {
      setScreen('intro');
    }
  };

  const handleIntroComplete = () => {
    localStorage.setItem('code-world-visited', 'true');
    setScreen('menu');
  };

  return (
    <div className="w-full h-full">
      <AnimatePresence mode="wait">
        {screen === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingScreen onComplete={handleLoadingComplete} />
          </motion.div>
        )}

        {screen === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <IntroPresentation onComplete={handleIntroComplete} />
          </motion.div>
        )}

        {screen === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MainMenu />
          </motion.div>
        )}

        {screen === 'levelSelect' && (
          <motion.div
            key="levelSelect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LevelSelect />
          </motion.div>
        )}

        {screen === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Achievements />
          </motion.div>
        )}

        {screen === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GameLayout />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
