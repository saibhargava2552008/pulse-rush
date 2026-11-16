import { useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { AdSlot } from './AdSlot';

/**
 * The ad sidebar only exists on wide screens with a mouse-style pointer. Touch devices
 * (phones and tablets) keep the whole screen for the game and its on-screen controls.
 * This is the single source of truth for the breakpoint: below it the sidebar is not
 * rendered at all, rather than being hidden with CSS, so nothing loads into a hidden slot.
 */
export const DESKTOP_AD_QUERY = '(min-width: 1100px) and (hover: hover) and (pointer: fine)';

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(DESKTOP_AD_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

const getSnapshot = (): boolean => window.matchMedia(DESKTOP_AD_QUERY).matches;

/**
 * Page shell around the whole app. The game (or menu) fills the main area; on desktop a
 * fixed-width column to its right holds the ad slot. The two are siblings in a flex row, so
 * the slot can never overlap the game canvas, HUD, overlays or touch controls.
 */
export function SiteLayout({ children }: { children: ReactNode }) {
  const showAds = useSyncExternalStore(subscribe, getSnapshot);

  return (
    <div className={showAds ? 'site site--ads' : 'site'}>
      <div className="site-main">{children}</div>
      {showAds && (
        <div className="site-ads">
          <AdSlot placement="desktop-sidebar" />
        </div>
      )}
    </div>
  );
}
