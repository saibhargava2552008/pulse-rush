import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TouchState } from '../engine/input';

const RADIUS = 56;
const DEADZONE = 0.12;

interface Props {
  getTouch: () => TouchState | undefined;
}

export function TouchControls({ getTouch }: Props) {
  const ring = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const active = useRef<{ id: number; x: number } | null>(null);

  const reset = () => {
    active.current = null;
    const t = getTouch();
    if (t) t.move = 0;
    if (ring.current) ring.current.style.display = 'none';
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (active.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    active.current = { id: e.pointerId, x: e.clientX };
    const r = e.currentTarget.getBoundingClientRect();
    if (ring.current) {
      ring.current.style.display = 'block';
      ring.current.style.left = `${e.clientX - r.left}px`;
      ring.current.style.top = `${e.clientY - r.top}px`;
    }
    if (thumb.current) thumb.current.style.transform = 'translate(-50%, -50%)';
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const a = active.current;
    if (!a || a.id !== e.pointerId) return;
    const dx = e.clientX - a.x;
    let v = Math.max(-1, Math.min(1, dx / RADIUS));
    if (Math.abs(v) < DEADZONE) v = 0;
    const t = getTouch();
    if (t) t.move = v;
    if (thumb.current) {
      const px = Math.max(-RADIUS, Math.min(RADIUS, dx));
      thumb.current.style.transform = `translate(calc(-50% + ${px}px), -50%)`;
    }
  };

  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (active.current && active.current.id === e.pointerId) reset();
  };

  return (
    <div className="touch" onContextMenu={(e) => e.preventDefault()}>
      <div className="touch-zone" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <div className="touch-ring" ref={ring}>
          <div className="touch-thumb" ref={thumb} />
        </div>
        <span className="touch-hint">Drag to steer</span>
      </div>
      <ActionButton className="t-jump" label="Jump" field="jump" getTouch={getTouch} />
      <ActionButton className="t-slide" label="Slide" field="slide" getTouch={getTouch} />
      <ActionButton className="t-dash" label="Dash" field="dash" getTouch={getTouch} />
    </div>
  );
}

function ActionButton({
  className, label, field, getTouch,
}: {
  className: string;
  label: string;
  field: 'jump' | 'slide' | 'dash';
  getTouch: () => TouchState | undefined;
}) {
  const set = (v: boolean) => {
    const t = getTouch();
    if (t) t[field] = v;
  };
  return (
    <div
      className={`tbtn ${className}`}
      role="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        set(true);
      }}
      onPointerUp={() => set(false)}
      onPointerCancel={() => set(false)}
      onLostPointerCapture={() => set(false)}
    >
      {label}
    </div>
  );
}
