import React, { useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import IntroPresentation from './components/IntroPresentation';
import MainLayout from './components/MainLayout';

type AppState = 'LOADING' | 'INTRO' | 'GAME';

function App() {
  const [appState, setAppState] = useState<AppState>('LOADING');

  const handleLoadingComplete = () => {
    setAppState('INTRO');
  };

  const handleIntroComplete = () => {
    setAppState('GAME');
  };

  return (
    <div className="w-full h-screen bg-game-bg text-white overflow-hidden">
      {appState === 'LOADING' && (
        <LoadingScreen onComplete={handleLoadingComplete} />
      )}
      
      {appState === 'INTRO' && (
        <IntroPresentation onComplete={handleIntroComplete} />
      )}
      
      {appState === 'GAME' && (
        <MainLayout />
      )}
    </div>
  );
}

export default App;
