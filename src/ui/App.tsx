import { useState } from 'react';
import type { Quality } from '../engine/quality';
import { GameScreen } from './GameScreen';
import { Menu } from './Menu';
import { SiteLayout } from './SiteLayout';
import { loadBests, loadQuality, saveQuality } from './storage';
import { useRoute } from './router';
import { GuidePage } from './pages/GuidePage';
import { StrategyPage } from './pages/StrategyPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

export function App() {
  const route = useRoute();
  const [screen, setScreen] = useState<'menu' | 'game'>('menu');
  const [quality, setQuality] = useState<Quality>(loadQuality);
  const [bests, setBests] = useState(loadBests);

  const changeQuality = (q: Quality) => {
    setQuality(q);
    saveQuality(q);
  };

  const isGameActive = route === '/' && screen === 'game';

  const renderView = () => {
    switch (route) {
      case '/guide':
        return <GuidePage />;
      case '/strategy':
        return <StrategyPage />;
      case '/about':
        return <AboutPage />;
      case '/contact':
        return <ContactPage />;
      case '/privacy':
        return <PrivacyPage />;
      case '/terms':
        return <TermsPage />;
      case '/':
      default:
        return screen === 'game' ? (
          <GameScreen
            quality={quality}
            onExit={() => {
              setBests(loadBests());
              setScreen('menu');
            }}
          />
        ) : (
          <Menu
            quality={quality}
            onQuality={changeQuality}
            onPlay={() => setScreen('game')}
            bests={bests}
          />
        );
    }
  };

  return (
    <SiteLayout isGameMode={isGameActive}>
      {renderView()}
    </SiteLayout>
  );
}
