import { describe, expect, it } from 'vitest';
import { normalizeRoute, ROUTE_META } from './router';

describe('router', () => {
  it('normalizes valid route paths', () => {
    expect(normalizeRoute('/')).toBe('/');
    expect(normalizeRoute('/guide')).toBe('/guide');
    expect(normalizeRoute('/strategy')).toBe('/strategy');
    expect(normalizeRoute('/about')).toBe('/about');
    expect(normalizeRoute('/contact')).toBe('/contact');
    expect(normalizeRoute('/privacy')).toBe('/privacy');
    expect(normalizeRoute('/terms')).toBe('/terms');
  });

  it('strips trailing slashes correctly', () => {
    expect(normalizeRoute('/guide/')).toBe('/guide');
    expect(normalizeRoute('/strategy/')).toBe('/strategy');
    expect(normalizeRoute('/about/')).toBe('/about');
    expect(normalizeRoute('/contact/')).toBe('/contact');
    expect(normalizeRoute('/privacy/')).toBe('/privacy');
    expect(normalizeRoute('/terms/')).toBe('/terms');
    expect(normalizeRoute('/')).toBe('/');
  });

  it('strips query parameters and hashes', () => {
    expect(normalizeRoute('/guide?ref=homepage')).toBe('/guide');
    expect(normalizeRoute('/strategy?tier=advanced')).toBe('/strategy');
    expect(normalizeRoute('/about#team')).toBe('/about');
    expect(normalizeRoute('/terms?v=2026#section1')).toBe('/terms');
  });

  it('falls back to / for unknown routes', () => {
    expect(normalizeRoute('/unknown-page')).toBe('/');
    expect(normalizeRoute('/404')).toBe('/');
    expect(normalizeRoute('/random/subpath')).toBe('/');
  });

  it('has valid metadata declared for every route', () => {
    const routes = ['/', '/guide', '/strategy', '/about', '/contact', '/privacy', '/terms'] as const;
    for (const r of routes) {
      expect(ROUTE_META[r]).toBeDefined();
      expect(ROUTE_META[r].title.length).toBeGreaterThan(10);
      expect(ROUTE_META[r].description.length).toBeGreaterThan(20);
      expect(ROUTE_META[r].heading.length).toBeGreaterThan(0);
    }
  });
});
