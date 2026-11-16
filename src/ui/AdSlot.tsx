import { useId } from 'react';
import type { ReactNode } from 'react';

/**
 * Named page placements for display advertising. Add a name here when a new
 * on-page slot is introduced, so every placement is declared in one place.
 */
export type AdPlacement = 'desktop-sidebar';

interface Props {
  /** Which on-page placement this slot represents (used for styling hooks and, later, reporting). */
  placement: AdPlacement;
  /**
   * Optional identifier for the slot at the ad network. Only recorded on the container
   * as a data attribute; this component never reads it to load anything.
   */
  slotId?: string;
  /**
   * A future ad unit goes here (for example an AdSense display component). When omitted, the
   * slot shows an empty placeholder. Nothing is ever rendered in its place automatically.
   */
  children?: ReactNode;
  className?: string;
}

/**
 * Reusable container for a *display* ad placement on the web page around the game.
 *
 * Scope and boundaries:
 * - It is a layout container only. It loads no scripts, contains no publisher IDs and
 *   renders no advertisement of its own. It cannot create impressions or clicks.
 * - It is intended for page display placements (e.g. Google AdSense display units).
 *   Google H5 Games Ads is a different, separate integration: it works through in-game
 *   break points (interstitial / rewarded) driven from game flow, not through a page
 *   container, so it should live in its own module and must not be wired through this component.
 * - It is deliberately isolated from the game: it imports nothing from `engine/` or
 *   `simulation/`, and the game imports nothing from it.
 *
 * The frame reserves a fixed 300px-wide area with a stable minimum height so that an ad
 * loading later does not shift the layout around the game.
 */
export function AdSlot({ placement, slotId, children, className }: Props) {
  const headingId = useId();
  const hasAd = children !== undefined && children !== null && children !== false;

  return (
    <aside
      className={['ad-slot', className].filter(Boolean).join(' ')}
      aria-labelledby={headingId}
      data-ad-placement={placement}
      data-ad-slot={slotId}
      data-ad-state={hasAd ? 'filled' : 'empty'}
    >
      <h2 id={headingId} className="ad-slot__label">Advertisement</h2>
      <div className="ad-slot__frame">
        {hasAd ? (
          children
        ) : (
          <div className="ad-slot__placeholder" aria-hidden="true">
            <span>Ad space</span>
          </div>
        )}
      </div>
    </aside>
  );
}
