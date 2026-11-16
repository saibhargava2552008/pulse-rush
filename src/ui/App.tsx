import { useState } from 'react';
import type { Quality } from '../engine/quality';
import { GameScreen } from './GameScreen';
import { Menu } from './Menu';
import { loadBests, loadQuality, saveQuality } from './storage';

export function App() {
  const [screen, setScreen] = useState<'menu' | 'game'>('menu');
  const [quality, setQuality] = useState<Quality>(loadQuality);
  const [bests, setBests] = useState(loadBests);

  const changeQuality = (q: Quality) => {
    setQuality(q);
    saveQuality(q);
  };

  if (screen === 'game') {
    return (
      <GameScreen
        quality={quality}
        onExit={() => {
          setBests(loadBests());
          setScreen('menu');
        }}
      />
    );
  }
  return <Menu quality={quality} onQuality={changeQuality} onPlay={() => setScreen('game')} bests={bests} />;
}
