import React from 'react';
import { useAppStore } from './store/appStore';
import { Intro } from './components/UI/Intro';
import { GameLayout } from './components/Game/GameLayout';

const App: React.FC = () => {
  const { view } = useAppStore();

  return (
    <>
      {view === 'intro' ? <Intro /> : <GameLayout />}
    </>
  );
};

export default App;
