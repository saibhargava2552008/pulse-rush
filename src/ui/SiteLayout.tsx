import type { ReactNode } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

interface Props {
  children: ReactNode;
  isGameMode?: boolean;
}

/**
 * Page shell around the whole app. On game mode, the canvas/HUD fills the main area.
 * On portal mode, header, scrollable content and footer are rendered cleanly across the full viewport.
 */
export function SiteLayout({ children, isGameMode = false }: Props) {
  return (
    <div className="site">
      <div className={`site-main ${isGameMode ? 'site-main--game' : 'site-main--portal'}`}>
        {!isGameMode && <Header />}
        <div className={`site-content ${isGameMode ? 'site-content--game' : 'site-content--portal'}`}>
          {children}
          {!isGameMode && <Footer />}
        </div>
      </div>
    </div>
  );
}
