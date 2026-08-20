// Minimal adaptive engine stub used by UI widgets (Sparky, Wardrobe, etc.)
const defaultState = {
  difficulty: 1.0,
  cognitiveStyle: 'visualizer',
  profile: { country: 'US', grade: 4 },
  completedPuzzles: {},
  stats: {
    mathLevelsCompleted: 0,
    scienceLevelsCompleted: 0,
    mathLevelsCompletedList: [],
    scienceLevelsCompletedList: [],
    totalHintsUsed: 0,
    streak: 0,
    experiencePoints: 0
  },
  customSparky: { skin: 'default', headItem: null, mouthItem: null, backItem: null },
  puzzleHistory: { math: {}, science: {} }
};

const adaptiveEngine = {
  state: Object.assign({}, defaultState),

  saveState() {
    try { localStorage.setItem('equiliprism_adaptive_state', JSON.stringify(this.state)); }
    catch (e) { /* ignore */ }
    // Notify listeners
    window.dispatchEvent(new CustomEvent('equiliprismStateChanged', { detail: this.state }));
  },

  loadState() {
    try {
      const raw = localStorage.getItem('equiliprism_adaptive_state');
      if (raw) this.state = JSON.parse(raw);
    } catch (e) { /* ignore */ }
  },

  adjustDifficulty(delta) {
    this.state.difficulty = Math.max(0.1, (this.state.difficulty || 1) + delta);
    this.saveState();
  },

  resetAllProgress() {
    localStorage.removeItem('equiliprism_adaptive_state');
    this.state = Object.assign({}, defaultState);
    this.saveState();
  }
};

// initialize from storage
adaptiveEngine.loadState();

// export
export { adaptiveEngine };