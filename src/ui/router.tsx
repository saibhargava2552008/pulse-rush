import { createContext, useContext, useEffect, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';

export type AppRoute = '/' | '/guide' | '/strategy' | '/about' | '/contact' | '/privacy' | '/terms';

export interface RouteMetadata {
  title: string;
  description: string;
  heading: string;
}

export const ROUTE_META: Record<AppRoute, RouteMetadata> = {
  '/': {
    title: 'Pulse Rush - Futuristic 3D Cyberpunk Obstacle Runner',
    description: 'Race through neon tracks, dodge obstacles, slide under barriers, and dash through laser hazards in Pulse Rush, a fast-paced 3D browser runner.',
    heading: 'Pulse Rush',
  },
  '/guide': {
    title: 'Pulse Rush Guide - Gameplay, Controls & Strategy',
    description: 'Master Pulse Rush with our comprehensive gameplay guide covering keyboard and touch controls, pulse energy management, laser phasing, and obstacle survival.',
    heading: 'Game Guide & Controls',
  },
  '/strategy': {
    title: 'Endless Runner Strategy Guide: Timing, Reflexes & Mechanics - Pulse Rush',
    description: 'Learn fundamental strategies for mastering 3D endless runner games. Explore reflex conditioning, line selection, stamina management, and jump timing.',
    heading: 'Endless Runner Strategy Guide',
  },
  '/about': {
    title: 'About Pulse Rush - 3D WebGL Runner Game & Team',
    description: 'Learn about Pulse Rush, its vision, modern WebGL Three.js architecture, and the developer behind this cyberpunk high-speed obstacle runner.',
    heading: 'About Pulse Rush',
  },
  '/contact': {
    title: 'Contact Pulse Rush - Support & Developer Feedback',
    description: 'Get in touch with the Pulse Rush development team for feedback, bug reports, and suggestions.',
    heading: 'Contact & Support',
  },
  '/privacy': {
    title: 'Privacy Policy - Pulse Rush',
    description: 'Read the Pulse Rush privacy policy regarding local gameplay storage, cookies, and advertising transparency.',
    heading: 'Privacy Policy',
  },
  '/terms': {
    title: 'Terms of Service - Pulse Rush',
    description: 'Review the terms and conditions for playing Pulse Rush.',
    heading: 'Terms of Service',
  },
};

export function normalizeRoute(path: string): AppRoute {
  let clean = path.split('?')[0].split('#')[0].trim();
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  if (clean === '/guide') return '/guide';
  if (clean === '/strategy') return '/strategy';
  if (clean === '/about') return '/about';
  if (clean === '/contact') return '/contact';
  if (clean === '/privacy') return '/privacy';
  if (clean === '/terms') return '/terms';
  return '/';
}

const ROUTE_CHANGE_EVENT = 'pulserush:routechange';

export function navigate(to: string, replace = false): void {
  const target = normalizeRoute(to);
  if (typeof window !== 'undefined') {
    if (replace) {
      window.history.replaceState({}, '', target);
    } else {
      window.history.pushState({}, '', target);
    }
    window.dispatchEvent(new CustomEvent(ROUTE_CHANGE_EVENT, { detail: target }));
  }
}

const RouteContext = createContext<AppRoute | null>(null);

export function RouteProvider({ value, children }: { value: AppRoute; children: ReactNode }) {
  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export function useRoute(): AppRoute {
  const contextRoute = useContext(RouteContext);
  const [route, setRoute] = useState<AppRoute>(() => {
    if (contextRoute) return contextRoute;
    if (typeof window !== 'undefined') {
      return normalizeRoute(window.location.pathname);
    }
    return '/';
  });

  useEffect(() => {
    if (contextRoute) {
      setRoute(contextRoute);
      return;
    }
    const onPop = () => {
      setRoute(normalizeRoute(window.location.pathname));
    };
    const onCustom = () => {
      setRoute(normalizeRoute(window.location.pathname));
    };

    window.addEventListener('popstate', onPop);
    window.addEventListener(ROUTE_CHANGE_EVENT, onCustom);

    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener(ROUTE_CHANGE_EVENT, onCustom);
    };
  }, [contextRoute]);

  return contextRoute ?? route;
}

interface LinkProps {
  to: AppRoute | string;
  className?: string;
  children: ReactNode;
  title?: string;
  onClick?: () => void;
  'aria-current'?: 'page' | undefined;
}

export function Link({ to, className, children, title, onClick, 'aria-current': ariaCurrent }: LinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    onClick?.();
    navigate(to);
  };

  return (
    <a href={to} className={className} onClick={handleClick} title={title} aria-current={ariaCurrent}>
      {children}
    </a>
  );
}
