// Minimal SPA bootstrap for EquiliPrism
// - Wires top navigation buttons (.nav-btn)
// - Lazy-loads page modules from assets/js
// - Initializes Sparky widget and some global inits

const ROUTES = {
  dashboard: { render: (container) => {
    container.innerHTML = `
      <div style="max-width:1100px;margin:2rem auto;">
        <h1>Welcome to EquiliPrism</h1>
        <p style="color:var(--text-muted);">Interactive math & science puzzles. Use the left navigation to open a lab or tool.</p>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-top:1.2rem;">
          <div class="glass-card" style="padding:1rem;"><h3>Get Started</h3><p>Pick a lab from the left.</p></div>
          <div class="glass-card" style="padding:1rem;"><h3>Wardrobe</h3><p>Customize Sparky's look.</p></div>
          <div class="glass-card" style="padding:1rem;"><h3>Audio Deck</h3><p>Play study tracks & manage playlist.</p></div>
        </div>
      </div>
    `;
  }},
  'balance-lab': { path: 'assets/js/creativeSandbox.js', className: 'CreativeSandbox' },
  'photon-lab': { path: 'assets/js/creativeSandbox.js', className: 'CreativeSandbox' },
  'sandbox': { path: 'assets/js/creativeSandbox.js', className: 'CreativeSandbox' },
  'explainers': { path: 'assets/js/sparkyGuide.js', className: 'SparkyGuide' },
  'wardrobe': { path: 'assets/js/sparkyWardrobe.js', className: 'SparkyWardrobe' },
  'videos': { path: 'assets/js/videos.js', className: 'Videos' },
  'bugs': { path: 'assets/js/bugs.js', className: 'Bugs' },
  'soundtrack': { path: 'assets/js/soundtrack.js', className: 'Soundtrack' }
};

let currentInstance = null;

function queryId(id) { return document.getElementById(id); }

async function loadRoute(target) {
  const container = queryId('app-view');
  if (!container) return;
  // destroy previous
  if (currentInstance && typeof currentInstance.destroy === 'function') {
    try { currentInstance.destroy(); } catch (e) { console.warn('destroy failed', e); }
  }
  container.innerHTML = '';
  const route = ROUTES[target] || ROUTES.dashboard;
  if (route.render) {
    route.render(container);
    currentInstance = { destroy: () => {} };
    return;
  }
  try {
    const mod = await import(`./${route.path}`);
    const Cls = mod[route.className] || mod.default;
    if (typeof Cls === 'function') {
      // create a wrapper container inside #app-view
      const mount = document.createElement('div'); mount.id = `${target}-mount`; container.appendChild(mount);
      // instantiate
      currentInstance = new Cls(mount.id);
      if (typeof currentInstance.render === 'function') currentInstance.render();
    } else {
      container.innerHTML = `<pre style="padding:1rem;">Module loaded but did not export ${route.className}</pre>`;
      currentInstance = { destroy: () => {} };
    }
  } catch (e) {
    console.error('Failed to load route', target, e);
    container.innerHTML = `<div style="padding:2rem; color:var(--text-muted)">Failed to load <strong>${target}</strong>: ${e.message}</div>`;
    currentInstance = { destroy: () => {} };
  }
}

function setActiveNav(button) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (button) button.classList.add('active');
}

function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = btn.getAttribute('data-target');
      setActiveNav(btn);
      // small delay to allow active style to show
      loadRoute(target);
    });
  });
}

async function initSparkyWidget() {
  const mountId = 'sparky-widget-container';
  const mount = document.getElementById(mountId);
  if (!mount) return;
  try {
    const mod = await import('./assets/js/sparkyGuide.js');
    const Sparky = mod.SparkyGuide || mod.default;
    if (typeof Sparky === 'function') {
      const instance = new Sparky(mountId);
      if (typeof instance.render === 'function') instance.render();
      // expose for debugging
      window.sparkyWidget = instance;
    }
  } catch (e) { console.warn('Sparky widget failed to init', e); }
}

function hydrateNavFromHash() {
  const hash = location.hash.replace('#','');
  if (!hash) return 'dashboard';
  // allow linking like #wardrobe
  return hash;
}

function initApp() {
  initNav();
  initSparkyWidget();
  const initial = hydrateNavFromHash() || 'dashboard';
  // find button matching initial
  const btn = document.querySelector(`.nav-btn[data-target="${initial}"]`);
  if (btn) setActiveNav(btn);
  loadRoute(initial);
  // allow back/forward
  window.addEventListener('hashchange', () => {
    const t = hydrateNavFromHash();
    const b = document.querySelector(`.nav-btn[data-target="${t}"]`);
    if (b) setActiveNav(b);
    loadRoute(t);
  });
}

// wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
