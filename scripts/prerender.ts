import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SiteLayout } from '../src/ui/SiteLayout';
import { Menu } from '../src/ui/Menu';
import { GuidePage } from '../src/ui/pages/GuidePage';
import { StrategyPage } from '../src/ui/pages/StrategyPage';
import { AboutPage } from '../src/ui/pages/AboutPage';
import { ContactPage } from '../src/ui/pages/ContactPage';
import { PrivacyPage } from '../src/ui/pages/PrivacyPage';
import { TermsPage } from '../src/ui/pages/TermsPage';
import { RouteProvider, ROUTE_META } from '../src/ui/router';
import type { AppRoute } from '../src/ui/router';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

interface RouteConfig {
  path: AppRoute;
  component: () => ReturnType<typeof createElement>;
}

const ROUTES: RouteConfig[] = [
  {
    path: '/',
    component: () =>
      createElement(
        RouteProvider,
        { value: '/' },
        createElement(
          SiteLayout,
          { isGameMode: false },
          createElement(Menu, {
            quality: 'medium',
            onQuality: () => {},
            onPlay: () => {},
            bests: { bestTime: null, bestScore: 0, bestDist: 0 },
          }),
        ),
      ),
  },
  {
    path: '/guide',
    component: () =>
      createElement(
        RouteProvider,
        { value: '/guide' },
        createElement(SiteLayout, { isGameMode: false }, createElement(GuidePage)),
      ),
  },
  {
    path: '/strategy',
    component: () =>
      createElement(
        RouteProvider,
        { value: '/strategy' },
        createElement(SiteLayout, { isGameMode: false }, createElement(StrategyPage)),
      ),
  },
  {
    path: '/about',
    component: () =>
      createElement(
        RouteProvider,
        { value: '/about' },
        createElement(SiteLayout, { isGameMode: false }, createElement(AboutPage)),
      ),
  },
  {
    path: '/contact',
    component: () =>
      createElement(
        RouteProvider,
        { value: '/contact' },
        createElement(SiteLayout, { isGameMode: false }, createElement(ContactPage)),
      ),
  },
  {
    path: '/privacy',
    component: () =>
      createElement(
        RouteProvider,
        { value: '/privacy' },
        createElement(SiteLayout, { isGameMode: false }, createElement(PrivacyPage)),
      ),
  },
  {
    path: '/terms',
    component: () =>
      createElement(
        RouteProvider,
        { value: '/terms' },
        createElement(SiteLayout, { isGameMode: false }, createElement(TermsPage)),
      ),
  },
];

async function prerender() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`[prerender] Template not found: ${TEMPLATE_PATH}. Run vite build first.`);
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  console.log(`[prerender] Generating static HTML for ${ROUTES.length} routes...`);

  for (const route of ROUTES) {
    const meta = ROUTE_META[route.path];
    const htmlContent = renderToStaticMarkup(route.component());

    let pageHtml = template;

    const canonicalUrl = `https://pulse-rush-ten.vercel.app${route.path === '/' ? '' : route.path}`;
    const ogType = route.path === '/' ? 'website' : 'article';

    // Replace title, description, and canonical
    pageHtml = pageHtml.replace(
      /<title>.*?<\/title>/i,
      `<title>${meta.title}</title>\n    <meta name="description" content="${meta.description}" />\n    <link rel="canonical" href="${canonicalUrl}" />`,
    );

    // Update route-specific OpenGraph & Twitter tags
    pageHtml = pageHtml.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${meta.title}" />`);
    pageHtml = pageHtml.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${meta.description}" />`);
    pageHtml = pageHtml.replace(/<meta property="og:type" content=".*?" \/>/i, `<meta property="og:type" content="${ogType}" />`);
    pageHtml = pageHtml.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
    pageHtml = pageHtml.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${meta.title}" />`);
    pageHtml = pageHtml.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${meta.description}" />`);

    // Inject rendered markup into #root
    pageHtml = pageHtml.replace(
      '<div id="root"></div>',
      `<div id="root">${htmlContent}</div>`,
    );

    if (route.path === '/') {
      fs.writeFileSync(TEMPLATE_PATH, pageHtml, 'utf-8');
      console.log(`  ✓ Prerendered / -> dist/index.html`);
    } else {
      const routeDir = path.join(DIST_DIR, route.path.slice(1));
      fs.mkdirSync(routeDir, { recursive: true });
      fs.writeFileSync(path.join(routeDir, 'index.html'), pageHtml, 'utf-8');
      console.log(`  ✓ Prerendered ${route.path} -> dist${route.path}/index.html`);
    }
  }

  console.log('[prerender] All routes successfully prerendered.');
}

prerender().catch((err) => {
  console.error('[prerender] Error during prerendering:', err);
  process.exit(1);
});
