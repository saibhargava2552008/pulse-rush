import type { InputState } from '../simulation/types';

export interface TouchState {
  move: number;
  jump: boolean;
  slide: boolean;
  dash: boolean;
}

const GAME_KEYS = new Set(['KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'ShiftLeft', 'ShiftRight', 'KeyE']);

/** Merges keyboard and touch into the single normalised InputState the simulation consumes. */
export class InputHub {
  readonly touch: TouchState = { move: 0, jump: false, slide: false, dash: false };
  private keys = new Set<string>();
  private out: InputState = { move: 0, jump: false, slide: false, dash: false };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (GAME_KEYS.has(e.code)) e.preventDefault();
    this.keys.add(e.code);
  };
  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
  };
  private onBlur = (): void => this.clear();

  attach(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }

  clear(): void {
    this.keys.clear();
    this.touch.move = 0;
    this.touch.jump = this.touch.slide = this.touch.dash = false;
  }

  read(): InputState {
    const k = this.keys;
    const left = k.has('KeyA') || k.has('ArrowLeft');
    const right = k.has('KeyD') || k.has('ArrowRight');
    const t = this.touch;
    this.out.move = Math.max(-1, Math.min(1, (right ? 1 : 0) - (left ? 1 : 0) + t.move));
    this.out.jump = k.has('Space') || k.has('ArrowUp') || t.jump;
    this.out.slide = k.has('ShiftLeft') || k.has('ShiftRight') || k.has('ArrowDown') || t.slide;
    this.out.dash = k.has('KeyE') || t.dash;
    return this.out;
  }
}
