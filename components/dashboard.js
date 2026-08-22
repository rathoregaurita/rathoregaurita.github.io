// EquiliPrism Dashboard Component
import { adaptiveEngine } from '../hooks/adaptive-engine.js';

export class Dashboard {
  constructor(containerId, onNavigateCallback) {
    this.container = document.getElementById(containerId);
    this.onNavigate = onNavigateCallback;
    this.state = adaptiveEngine.state;

    // Listen to global changes
    this.boundStateChange = (e) => {
      this.state = e.detail;
      this.render();
    };
    window.addEventListener('equiliprismStateChanged', this.boundStateChange);
  }

  // Bind UI interactions
  bindEvents() {
    // Learning Style Picker
    const cards = this.container.querySelectorAll('.persona-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const style = card.getAttribute('data-style');
        adaptiveEngine.setCognitiveStyle(style);
      });
    });

    // Enter Labs Buttons
    const enterButtons = this.container.querySelectorAll('.enter-btn, .lab-preview-card');
    enterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = btn.closest('[data-target]')?.getAttribute('data-target');
        if (target) {
          this.onNavigate(target);
        }
        e.stopPropagation();
      });
    });

    // Launch Sandbox Button
    const sandboxBtn = this.container.querySelector('#dashboard-sandbox-launch');
    if (sandboxBtn) {
      sandboxBtn.addEventListener('click', () => {
        this.onNavigate('sandbox');
      });
    }

    // Reset Progress Button
    const resetBtn = this.container.querySelector('#reset-progress-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset all progress? This clears your difficulty level and XP!")) {
          adaptiveEngine.resetAllProgress();
        }
      });
    }



    // Grade Switcher Dropdown Change
    const gradeSwitcher = this.container.querySelector('#grade-switcher');
    if (gradeSwitcher) {
      gradeSwitcher.addEventListener('change', (e) => {
        const newGrade = parseInt(e.target.value);
        const country = this.state.profile.country || 'US';
        adaptiveEngine.setProfile(country, newGrade);
      });
    }

    // Country Switcher Dropdown Change
    const countrySwitcher = this.container.querySelector('#country-switcher');
    if (countrySwitcher) {
      countrySwitcher.addEventListener('change', (e) => {
        const newCountry = e.target.value;
        const grade = this.state.profile.grade || 1;
        adaptiveEngine.setProfile(newCountry, grade, true);
      });
    }

    // Theme Switcher Dropdown Change
    const themeSwitcher = this.container.querySelector('#dashboard-theme-switcher');
    if (themeSwitcher) {
      themeSwitcher.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        if (window.equiliprismApp) {
          window.equiliprismApp.setTheme(newTheme);
        }
      });
    }

  }

  // Calculate difficulty display
  getDiffDotsHTML(level) {
    let dots = '';
    for (let i = 1; i <= 5; i++) {
      dots += `<span class="diff-dot ${i <= level ? 'active' : ''}"></span>`;
    }
    return dots;
  }

  getStyleDescription() {
    switch (this.state.cognitiveStyle) {
      case 'builder':
        return "You like physical models, structures, and building components to see how things connect!";
      case 'logician':
        return "You think in patterns, symbols, formulas, and step-by-step logic rules!";
      case 'visualizer':
      default:
        return "You love shapes, colors, see-saws, drawing beams, and visualizing physical paths!";
    }
  }

  getCurriculumDetails(country, grade) {
    const isPreK = (grade === -1);
    const isK = (grade === 0);
    const isHighSchool = (grade >= 9);
    
    let gradeText = "";
    let mathFocus = "";
    let sciFocus = "";
    let ksLabel = "";

    if (isPreK) {
      gradeText = "Preschool / Pre-K";
      mathFocus = "foundational visual counting and physical scale balances";
      sciFocus = "basic light wave reflections and angle pathways";
      ksLabel = "Foundation Stage";
    } else if (isK) {
      gradeText = "Kindergarten";
      mathFocus = "simple weights addition and equivalence structures";
      sciFocus = "direct laser target paths";
      ksLabel = "Foundation Stage";
    } else if (isHighSchool) {
      gradeText = `Grade ${grade} (High School)`;
      mathFocus = "systems of linear equations and multi-variable scale balances (Chests $x$ and Sacks $y$)";
      sciFocus = "wave mechanics, beam splitters (diffraction gratings), and color filters";
      ksLabel = "Key Stage 4 / GCSE";
    } else {
      gradeText = `Grade ${grade}`;
      mathFocus = "algebraic variables and see-saw balancing equations";
      sciFocus = "light wave physics, lens refraction, and prism dispersion";
      ksLabel = grade <= 2 ? 'Key Stage 1' : (grade <= 6 ? 'Key Stage 2' : 'Key Stage 3');
    }

    const curricula = {
      US: {
        name: `US Common Core State Standards (${gradeText})`,
        description: `Aligned to US Common Core standards. Math focuses on ${mathFocus}. Science covers Next Gen Science Standards (NGSS) for ${sciFocus}.`
      },
      UK: {
        name: `UK National Curriculum (${ksLabel})`,
        description: `Aligned to UK EYFS / National Curriculum for ${gradeText}. Math covers ${mathFocus}. Science covers ${sciFocus}.`
      },
      CA: {
        name: `Canada Ontario Curriculum (${gradeText})`,
        description: `Aligned to Ontario curriculum standards. Math focuses on ${mathFocus}. Science covers physical properties of ${sciFocus}.`
      },
      IN: {
        name: `India CBSE / NCERT Syllabus (${gradeText})`,
        description: `Aligned to CBSE curriculum guidelines. Math covers ${mathFocus}. Science covers ray diagrams, reflection, and ${sciFocus}.`
      }
    };
    return curricula[country] || { name: `Standard Global Curriculum (${gradeText})`, description: `Dynamic ${mathFocus} and ${sciFocus} mechanics.` };
  }

  destroy() {
    window.removeEventListener('equiliprismStateChanged', this.boundStateChange);
  }

  render() {
    const mathHighest = this.state.stats.mathLevelsCompleted || 0;
    const scienceHighest = this.state.stats.scienceLevelsCompleted || 0;

    let mathMax = 3;
    if (mathHighest >= 10) mathMax = 75;
    else if (mathHighest >= 3) mathMax = 10;
    else if ((this.state.stats.mathLevelsCompletedList || []).length >= 3) mathMax = 10;

    let scienceMax = 3;
    if (scienceHighest >= 10) scienceMax = 75;
    else if (scienceHighest >= 3) scienceMax = 10;
    else if ((this.state.stats.scienceLevelsCompletedList || []).length >= 3) scienceMax = 10;

    const totalProgressPercent = Math.min(100, Math.round(((mathHighest + scienceHighest) / (mathMax + scienceMax)) * 100));
    const mathPercent = Math.min(100, Math.round((mathHighest / mathMax) * 100));
    const sciencePercent = Math.min(100, Math.round((scienceHighest / scienceMax) * 100));

    const country = this.state.profile.country || 'US';
    const grade = this.state.profile.grade || 1;
    const originalGrade = this.state.profile.originalGrade || 1;
    const originalCountry = this.state.profile.originalCountry || 'US';
    const originalKey = `${originalCountry}_G${originalGrade}`;
    const originalData = this.state.completedPuzzles[originalKey] || { math: [], science: [] };
    const originalMathHighest = originalData.math ? (originalData.math.length > 0 ? Math.max(...originalData.math) : 0) : 0;
    const originalSciHighest = originalData.science ? (originalData.science.length > 0 ? Math.max(...originalData.science) : 0) : 0;

    const isSwitcherUnlocked = (this.state.profile.switchingUnlocked || (originalMathHighest >= 75 && originalSciHighest >= 75));
    const isMasterGraduate = adaptiveEngine.hasCompletedAllPostOriginalGrades();
    const currDetails = this.getCurriculumDetails(country, grade);
    const activeTheme = localStorage.getItem('equiliprism_active_theme') || 'theme-space-dark';

    this.container.innerHTML = `
      <div class="dashboard-grid">
        <!-- Left: Core Profile & Labs -->
        <div class="dashboard-main-panel">
          <!-- Welcome Banner -->
          <div class="glass-card welcome-banner" style="margin-bottom: 2rem;">
            <div class="welcome-text">
              <h2>Ready to Explore, Curious Spark?</h2>
              <p>EquiliPrism adapts to how your mind works. Try solving challenges below. If you're doing great, puzzles will grow with you. If you get stuck, Sparky will hop in to help!</p>
            </div>
          </div>

          ${isMasterGraduate ? `
            <!-- Master Graduate Trophy Card -->
            <div class="glass-card master-trophy-card" style="margin-bottom: 2rem; background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(236,72,153,0.15)); border: 2px solid hsl(var(--accent-amber), 0.7); border-radius: var(--border-radius-lg); padding: 1.5rem; display: flex; gap: 1.2rem; align-items: center; box-shadow: 0 8px 32px rgba(251,191,36,0.15);">
              <div style="font-size: 3rem; filter: drop-shadow(0 0 10px rgba(251,191,36,0.4));">🏆</div>
              <div>
                <h3 style="color: hsl(var(--accent-amber)); font-size: 1.3rem; font-weight: 800; margin-bottom: 0.3rem; text-shadow: 0 0 10px rgba(251,191,36,0.3);">✦ Master Curriculum Graduate! ✦</h3>
                <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-main);">
                  Outstanding learning adventure! You completed all 75 levels of every grade from your starting <strong>Grade ${originalGrade}</strong> all the way up to <strong>Grade 8</strong>!
                </p>
                <p style="font-size: 0.82rem; font-weight: 700; color: hsl(var(--accent-green)); margin-top: 0.5rem; display: flex; align-items: center; gap: 0.3rem;">
                  <span>✨</span> <span>Master Mode Activated: Free level selection is now unlocked across all grades!</span>
                </p>
              </div>
            </div>
          ` : ''}

          <!-- Cognitive Style Selection -->
          <div class="persona-picker-section">
            <h3 class="section-title">Select Your Learning Style</h3>
            <div class="persona-options">
              <!-- Visualizer -->
              <div class="persona-card ${this.state.cognitiveStyle === 'visualizer' ? 'active' : ''}" data-style="visualizer">
                <div class="active-glow-indicator"></div>
                <div class="persona-icon">🎨</div>
                <h3>The Visualizer</h3>
                <p>Learn using colors, geometry, see-saws, and mental diagrams.</p>
              </div>
              
              <!-- Builder -->
              <div class="persona-card ${this.state.cognitiveStyle === 'builder' ? 'active' : ''}" data-style="builder">
                <div class="active-glow-indicator"></div>
                <div class="persona-icon">⚙️</div>
                <h3>The Builder</h3>
                <p>Learn using parts, mechanical loads, physics blocks, and assemblies.</p>
              </div>

              <!-- Logician -->
              <div class="persona-card ${this.state.cognitiveStyle === 'logician' ? 'active' : ''}" data-style="logician">
                <div class="active-glow-indicator"></div>
                <div class="persona-icon">🔢</div>
                <h3>The Logician</h3>
                <p>Learn using mathematical relations, formulas, balance rules, and patterns.</p>
              </div>
            </div>
          </div>

          <!-- Labs Section -->
          <div class="labs-selector-section">
            <h3 class="section-title">Active Learning Labs</h3>
            <div class="lab-cards-container">
              <!-- Math Lab -->
              <div class="glass-card lab-preview-card math" data-target="balance-lab">
                <span class="lab-tag">Mathematics</span>
                <h3>Balance Scale Lab</h3>
                <p>Discover algebra visually by balancing weights, chests, and balloons. Explore equations in your own style of thinking.</p>
                <div class="lab-meta">
                  <div class="lab-difficulty-bar">
                    ${this.getDiffDotsHTML(Math.ceil(this.state.difficulty))}
                  </div>
                  <button class="enter-btn">Open Lab</button>
                </div>
              </div>

              <!-- Science Lab -->
              <div class="glass-card lab-preview-card science" data-target="photon-lab">
                <span class="lab-tag">Optics & Physics</span>
                <h3>Photon Path Lab</h3>
                <p>Redirect laser beams using reflective mirrors, light-bending lenses, and rainbow prisms. Light up sensors using wave mechanics.</p>
                <div class="lab-meta">
                  <div class="lab-difficulty-bar">
                    ${this.getDiffDotsHTML(Math.ceil(this.state.difficulty))}
                  </div>
                  <button class="enter-btn">Open Lab</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Curriculum Switcher & Progress -->
        <div class="dashboard-sidebar">
          <!-- Curriculum Profile Card -->
          <div class="glass-card curriculum-profile-card" style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem;">
              <div>
                <h3 style="font-size: 1.25rem; font-weight: 800;">Curriculum Profile</h3>
                <p style="font-size: 0.8rem; color: var(--text-muted);">${currDetails.name}</p>
              </div>
              <span class="logo-icon" style="font-size: 1.4rem;">✦</span>
            </div>
            
            <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 1rem;">
              ${currDetails.description}
            </p>

            <div style="border-top: 1px solid var(--card-border); padding-top: 1rem;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 0.4rem;">
                Switch Country / Syllabus:
              </label>
              <select id="country-switcher" style="width: 100%; padding: 0.55rem; background: rgba(255,255,255,0.05); border: 1px solid var(--card-border); color: var(--text-main); border-radius: var(--border-radius-sm); font-family: inherit; font-size: 0.85rem; outline: none; cursor: pointer; margin-bottom: 0.8rem;">
                <option value="US" ${country === 'US' ? 'selected' : ''} style="background: var(--bg-color);">United States (Common Core)</option>
                <option value="UK" ${country === 'UK' ? 'selected' : ''} style="background: var(--bg-color);">United Kingdom (National Curriculum)</option>
                <option value="CA" ${country === 'CA' ? 'selected' : ''} style="background: var(--bg-color);">Canada (Ontario Curriculum)</option>
                <option value="IN" ${country === 'IN' ? 'selected' : ''} style="background: var(--bg-color);">India (CBSE Syllabus)</option>
              </select>

              <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 0.4rem;">
                Switch Grade Level:
              </label>
              
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <select id="grade-switcher" style="flex: 1; padding: 0.55rem; background: rgba(255,255,255,0.05); border: 1px solid var(--card-border); color: var(--text-main); border-radius: var(--border-radius-sm); font-family: inherit; font-size: 0.85rem; outline: none; cursor: pointer;">
                  ${[-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => {
                    let label = `Grade ${g}`;
                    if (g === -1) label = "Preschool / Pre-K";
                    if (g === 0) label = "Kindergarten";
                    return `<option value="${g}" ${g === parseInt(grade) ? 'selected' : ''} style="background: var(--bg-color);">${label}</option>`;
                  }).join('')}
                </select>
              </div>
              <p style="font-size: 0.72rem; color: hsl(var(--accent-green)); margin-top: 0.4rem; font-weight: 600;">
                All grade levels are 100% free and unlocked! switching is enabled! 🎉
              </p>
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); display: block; margin-top: 0.8rem; margin-bottom: 0.4rem;">
                Switch Theme Mode:
              </label>
              <select id="dashboard-theme-switcher" style="width: 100%; padding: 0.55rem; background: rgba(255,255,255,0.05); border: 1px solid var(--card-border); color: var(--text-main); border-radius: var(--border-radius-sm); font-family: inherit; font-size: 0.85rem; outline: none; cursor: pointer;">
                <option value="theme-space-dark" ${activeTheme === 'theme-space-dark' ? 'selected' : ''} style="background: var(--bg-color);">🌌 Dark Mode</option>
                <option value="theme-light" ${activeTheme === 'theme-light' ? 'selected' : ''} style="background: var(--bg-color);">☀️ Light Mode</option>
                <option value="theme-cyber" ${activeTheme === 'theme-cyber' ? 'selected' : ''} style="background: var(--bg-color);">⚡ Neon Mode</option>
                <option value="theme-sunset" ${activeTheme === 'theme-sunset' ? 'selected' : ''} style="background: var(--bg-color);">🌅 Sunset Mode</option>
                <option value="theme-ocean" ${activeTheme === 'theme-ocean' ? 'selected' : ''} style="background: var(--bg-color);">🌊 Ocean Mode</option>
              </select>

            </div>
          </div>

          <div class="glass-card analytics-card">
            <div class="analytics-header">
              <h3>Your Progress</h3>
              <p>Adapting active learning style: <strong>${this.state.cognitiveStyle.toUpperCase()}</strong></p>
            </div>

            <div class="progress-stats">
              <!-- XP Stat -->
              <div class="stat-item">
                <div class="stat-label-row">
                  <span class="stat-title">Experience Points</span>
                  <span class="stat-val" style="color: hsl(var(--accent-pink));">${this.state.stats.experiencePoints} XP</span>
                </div>
                <div class="progress-track">
                  <div class="progress-bar-fill" style="width: ${Math.min(100, (this.state.stats.experiencePoints % 1000) / 10)}%; background: hsl(var(--accent-pink));"></div>
                </div>
              </div>

              <!-- Active Streak -->
              <div class="stat-item">
                <div class="stat-label-row">
                  <span class="stat-title">Correct Streak</span>
                  <span class="stat-val" style="color: hsl(var(--accent-green));">🔥 ${this.state.stats.streak} Level Streak</span>
                </div>
              </div>

              <!-- Math Level completion -->
              <div class="stat-item math">
                <div class="stat-label-row">
                  <span class="stat-title">Math Lab Completed</span>
                  <span class="stat-val">${mathHighest} / ${mathMax} Levels</span>
                </div>
                <div class="progress-track">
                  <div class="progress-bar-fill" style="width: ${mathPercent}%;"></div>
                </div>
              </div>

              <!-- Science level completion -->
              <div class="stat-item science">
                <div class="stat-label-row">
                  <span class="stat-title">Science Lab Completed</span>
                  <span class="stat-val">${scienceHighest} / ${scienceMax} Levels</span>
                </div>
                <div class="progress-track">
                  <div class="progress-bar-fill" style="width: ${sciencePercent}%;"></div>
                </div>
              </div>
            </div>

            <!-- Pitch for Sandbox -->
            <div class="creative-sandbox-pitch">
              <h4>Encourage Creativity!</h4>
              <p>Finished the levels or want to design your own puzzles? Sandbox mode lets you build custom levels from scratch and test them!</p>
              <button class="sandbox-launch-btn" id="dashboard-sandbox-launch">Launch Sandbox Creator</button>
            </div>


            <button class="sparky-btn" id="reset-progress-btn" style="border-color: rgba(239, 68, 68, 0.3); color: #ef4444; margin-top: 0.8rem; width: 100%;">
              Reset All Progress
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }
}
