// EquiliPrism Root Application Controller
import { adaptiveEngine } from './hooks/adaptive-engine.js';
import { Dashboard } from './components/dashboard.js';
import { BalanceLab } from './components/balance-lab.js';
import { PhotonLab } from './components/photon-lab.js';
import { CreativeSandbox } from './components/sandbox.js';
import { ConceptStudio } from './components/explainers.js';
import { SparkyGuide } from './components/sparky.js';
import { SparkyWardrobe } from './components/wardrobe.js';
import { Videos } from './components/videos.js';
import { Bugs } from './components/bugs.js';

class App {
  constructor() {
    this.activeTab = 'dashboard';
    this.activeComponent = null;
    
    // Cycle themes: space-dark -> light -> cyber -> sunset -> ocean -> space-dark
    this.themes = ['theme-space-dark', 'theme-light', 'theme-cyber', 'theme-sunset', 'theme-ocean'];
    
    const savedTheme = localStorage.getItem('equiliprism_active_theme') || 'theme-space-dark';
    this.activeThemeIdx = this.themes.indexOf(savedTheme);
    if (this.activeThemeIdx === -1) this.activeThemeIdx = 0;
    
    // Apply initial theme
    document.body.classList.remove('theme-light', 'theme-cyber', 'theme-space-dark', 'theme-sunset', 'theme-ocean');
    document.body.classList.add(this.themes[this.activeThemeIdx]);

    // Elements
    this.appView = document.getElementById('app-view');
    this.navButtons = document.querySelectorAll('#main-nav .nav-btn');
    this.diffValEl = document.getElementById('global-difficulty-val');
    this.styleValEl = document.getElementById('global-style-val');
    this.curriculumValEl = document.getElementById('global-curriculum-val');

    this.init();
  }

  init() {
    // 1. Set up Navigation Click handlers
    this.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        this.navigateTo(target);
      });
    });



    // 3. Listen for internal SPA navigation events
    window.addEventListener('navigateToTab', (e) => {
      this.navigateTo(e.detail);
    });

    // 4. Listen for adaptive engine changes to update header state
    window.addEventListener('equiliprismStateChanged', (e) => {
      this.updateHeader(e.detail);
      
      // Auto-open onboarding if profile is cleared (e.g. on Reset Progress)
      const profile = e.detail.profile;
      if (!profile || !profile.country || !profile.grade) {
        const onboardingModal = document.getElementById('onboarding-modal');
        if (onboardingModal && !onboardingModal.classList.contains('active')) {
          onboardingModal.classList.add('active');
        }
      }
    });



    // 5. Initialize the global Sparky floating guide widget
    this.sparkyWidget = new SparkyGuide('sparky-widget-container');

    // 6. Bind Onboarding Modal submit handler
    const onboardingModal = document.getElementById('onboarding-modal');
    const onboardingForm = document.getElementById('onboarding-form');
    if (onboardingForm) {
      onboardingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const country = document.getElementById('onboarding-country').value;
        const grade = document.getElementById('onboarding-grade').value;
        const style = document.getElementById('onboarding-style').value;
        const theme = document.getElementById('onboarding-theme').value;
        if (country && grade && style && theme) {
          adaptiveEngine.setProfile(country, grade);
          adaptiveEngine.setCognitiveStyle(style);
          this.setTheme(theme);
          if (onboardingModal) onboardingModal.classList.remove('active');
          // Reload the current view to render appropriate grade level questions and styling
          this.navigateTo(this.activeTab);
        }
      });
    }

    // 6b. Bind Curriculum Indicator click to open onboarding modal (pre-filled with active state)
    const curriculumIndicator = document.getElementById('curriculum-indicator');
    if (curriculumIndicator) {
      curriculumIndicator.addEventListener('click', () => {
        const countrySelect = document.getElementById('onboarding-country');
        const gradeSelect = document.getElementById('onboarding-grade');
        const styleSelect = document.getElementById('onboarding-style');
        const themeSelect = document.getElementById('onboarding-theme');
        const profileState = adaptiveEngine.state.profile || {};
        
        if (countrySelect && profileState.country) {
          countrySelect.value = profileState.country;
        }
        if (gradeSelect && profileState.grade !== undefined && profileState.grade !== null) {
          gradeSelect.value = profileState.grade;
        }
        if (styleSelect && adaptiveEngine.state.cognitiveStyle) {
          styleSelect.value = adaptiveEngine.state.cognitiveStyle;
        }
        if (themeSelect) {
          themeSelect.value = localStorage.getItem('equiliprism_active_theme') || 'theme-space-dark';
        }
        
        if (onboardingModal) {
          onboardingModal.classList.add('active');
        }
      });
    }

    // Check if profile needs onboarding
    const profile = adaptiveEngine.state.profile;
    if (!profile || !profile.country || !profile.grade) {
      if (onboardingModal) {
        onboardingModal.classList.add('active');
      }
    }

    // 7. Draw active headers and default tab
    this.updateHeader(adaptiveEngine.state);
    this.navigateTo(this.activeTab);
  }

  // Handle SPA component switching
  navigateTo(tabId) {
    // Clean up previous active component
    if (this.activeComponent && typeof this.activeComponent.destroy === 'function') {
      this.activeComponent.destroy();
    }

    this.activeTab = tabId;

    // Update nav button active classes
    this.navButtons.forEach(btn => {
      if (btn.getAttribute('data-target') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Render corresponding component
    this.appView.innerHTML = '<div class="loading-spinner">Loading Playground...</div>';
    
    // Smooth transition entry
    this.appView.style.opacity = 0;
    this.appView.style.transform = 'translateY(8px)';

    setTimeout(() => {
      switch (tabId) {
        case 'dashboard':
          this.activeComponent = new Dashboard('app-view', this.navigateTo.bind(this));
          break;
        case 'balance-lab':
          this.activeComponent = new BalanceLab('app-view');
          break;
        case 'photon-lab':
          this.activeComponent = new PhotonLab('app-view');
          break;
        case 'sandbox':
          this.activeComponent = new CreativeSandbox('app-view');
          break;
        case 'explainers':
          this.activeComponent = new ConceptStudio('app-view');
          break;
        case 'wardrobe':
          this.activeComponent = new SparkyWardrobe('app-view');
          break;
        case 'videos':
          this.activeComponent = new Videos('app-view');
          break;
        case 'bugs':
          this.activeComponent = new Bugs('app-view');
          break;
        default:
          this.navigateTo('dashboard');
          return;
      }
      
      this.activeComponent.render();
      
      this.appView.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      this.appView.style.opacity = 1;
      this.appView.style.transform = 'translateY(0)';
    }, 150);
  }

  // Set active theme and update UI elements
  setTheme(themeName) {
    if (!this.themes.includes(themeName)) return;

    // Remove old theme classes
    document.body.classList.remove('theme-light', 'theme-cyber', 'theme-space-dark', 'theme-sunset', 'theme-ocean');
    document.body.classList.add(themeName);

    this.activeThemeIdx = this.themes.indexOf(themeName);
    localStorage.setItem('equiliprism_active_theme', themeName);

    // Sync dashboard theme dropdown if it exists on page
    const dashboardSwitcher = document.getElementById('dashboard-theme-switcher');
    if (dashboardSwitcher) {
      dashboardSwitcher.value = themeName;
    }
  }

  // Update header status indicators
  updateHeader(state) {
    if (this.diffValEl) {
      this.diffValEl.textContent = state.difficulty.toFixed(1);
    }
    if (this.styleValEl) {
      this.styleValEl.textContent = state.cognitiveStyle.charAt(0).toUpperCase() + state.cognitiveStyle.slice(1);
      
      // Update color class based on style
      const badge = document.getElementById('style-indicator');
      if (badge) {
        badge.className = `status-badge style-badge ${state.cognitiveStyle}`;
      }
    }
    if (this.curriculumValEl && state.profile) {
      const country = state.profile.country || '-';
      const grade = state.profile.grade !== null && state.profile.grade !== undefined ? `Grade ${state.profile.grade}` : '-';
      this.curriculumValEl.textContent = `${country} - ${grade}`;
    }
  }
}

// Instantiate on document load, checking if DOM is already ready to prevent module race conditions
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.equiliprismApp = new App();
  });
} else {
  window.equiliprismApp = new App();
}
