import { useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import IntroPresentation from './components/IntroPresentation';
import GameInterface from './components/GameInterface';

type AppState = 'LOADING' | 'INTRO' | 'GAME';

function App() {
  const [appState, setAppState] = useState<AppState>('LOADING');

  return (
    <div className="app-container">
      {appState === 'LOADING' && (
        <LoadingScreen onComplete={() => setAppState('INTRO')} />
      )}
      {appState === 'INTRO' && (
        <IntroPresentation onComplete={() => setAppState('GAME')} />
      )}
      {appState === 'GAME' && (
        <GameInterface />
      )}
    </div>
  );
}

export default App;
