import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AdSlot } from './AdSlot';

const render = (props: Parameters<typeof AdSlot>[0]) => renderToStaticMarkup(createElement(AdSlot, props));

describe('AdSlot', () => {
  it('renders an accessible, clearly labelled container', () => {
    const html = render({ placement: 'desktop-sidebar' });
    expect(html).toContain('<aside');
    expect(html).toContain('aria-labelledby');
    expect(html).toContain('>Advertisement</h2>');
    expect(html).toContain('data-ad-placement="desktop-sidebar"');
  });

  it('shows an empty placeholder when no ad is configured', () => {
    const html = render({ placement: 'desktop-sidebar' });
    expect(html).toContain('data-ad-state="empty"');
    expect(html).toContain('ad-slot__placeholder');
  });

  it('never injects scripts, iframes or ad content on its own', () => {
    const html = render({ placement: 'desktop-sidebar', slotId: 'example-slot' });
    expect(html).not.toMatch(/<script|<iframe|<ins|<img/i);
    expect(html).toContain('data-ad-slot="example-slot"');
  });

  it('replaces the placeholder with whatever ad unit is passed in', () => {
    const html = render({ placement: 'desktop-sidebar', children: createElement('div', { id: 'unit' }, 'unit') });
    expect(html).toContain('data-ad-state="filled"');
    expect(html).toContain('id="unit"');
    expect(html).not.toContain('ad-slot__placeholder');
  });
});
