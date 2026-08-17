class AdaptiveEngine {
  constructor() {
    this.state = {
      difficulty: 1.0, 
      cognitiveStyle: 'visualizer', 
      profile: {
        country: null,
        grade: null,
        originalCountry: null,
        originalGrade: null,
        switchingUnlocked: false
      },
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
      customSparky: {
        skin: 'default',
        headItem: null,
        mouthItem: null,
        backItem: null
      },
      puzzleHistory: {
        math: {},
        science: {}
      }
    };
    this.loadState();
  }
  saveState() {
    localStorage.setItem('equiliprism_adaptive_state', JSON.stringify(this.state));
    const event = new CustomEvent('equiliprismStateChanged', { detail: this.state });
    window.dispatchEvent(event);
  }
  loadState() {
    const saved = localStorage.getItem('equiliprism_adaptive_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) || {};
        this.state = {
          difficulty: parsed.difficulty !== undefined ? parseFloat(parsed.difficulty) : 1.0,
          cognitiveStyle: parsed.cognitiveStyle || 'visualizer',
          profile: Object.assign({
            country: null,
            grade: null,
            originalCountry: null,
            originalGrade: null,
            switchingUnlocked: false
          }, parsed.profile || {}),
          completedPuzzles: parsed.completedPuzzles || {},
          stats: Object.assign({
            mathLevelsCompleted: 0,
            scienceLevelsCompleted: 0,
            mathLevelsCompletedList: [],
            scienceLevelsCompletedList: [],
            totalHintsUsed: 0,
            streak: 0,
            experiencePoints: 0
          }, parsed.stats || {}),
          customSparky: Object.assign({
            skin: 'default',
            headItem: null,
            mouthItem: null,
            backItem: null
          }, parsed.customSparky || {}),
          puzzleHistory: Object.assign({
            math: {},
            science: {}
          }, parsed.puzzleHistory || {})
        };
        if (this.state.stats.mathLevelsCompleted > 0 && this.state.stats.mathLevelsCompletedList.length === 0) {
          for (let i = 1; i <= this.state.stats.mathLevelsCompleted; i++) {
            this.state.stats.mathLevelsCompletedList.push(i);
          }
        }
        if (this.state.stats.scienceLevelsCompleted > 0 && this.state.stats.scienceLevelsCompletedList.length === 0) {
          for (let i = 1; i <= this.state.stats.scienceLevelsCompleted; i++) {
            this.state.stats.scienceLevelsCompletedList.push(i);
          }
        }
        if (this.state.profile.country && this.state.profile.grade) {
          const key = `${this.state.profile.country}_G${this.state.profile.grade}`;
          if (!this.state.completedPuzzles[key]) {
            this.state.completedPuzzles[key] = {
              math: this.state.stats.mathLevelsCompletedList,
              science: this.state.stats.scienceLevelsCompletedList
            };
          }
          this.state.stats.mathLevelsCompletedList = this.state.completedPuzzles[key].math;
          this.state.stats.scienceLevelsCompletedList = this.state.completedPuzzles[key].science;
          this.state.stats.mathLevelsCompleted = this.state.stats.mathLevelsCompletedList.length > 0
            ? Math.max(...this.state.stats.mathLevelsCompletedList) : 0;
          this.state.stats.scienceLevelsCompleted = this.state.stats.scienceLevelsCompletedList.length > 0
            ? Math.max(...this.state.stats.scienceLevelsCompletedList) : 0;
        }
      } catch (e) {
        console.error('Error loading saved state:', e);
      }
    }
  }
  setProfile(country, grade, updateOriginal = false) {
    if (!this.state.profile) {
      this.state.profile = { country: null, grade: null, originalCountry: null, originalGrade: null, switchingUnlocked: false };
    }
    if (!this.state.profile.originalGrade || updateOriginal) {
      this.state.profile.originalGrade = parseInt(grade);
      this.state.profile.originalCountry = country;
    }
    this.state.profile.country = country;
    this.state.profile.grade = parseInt(grade);
    const key = `${country}_G${grade}`;
    if (!this.state.completedPuzzles) this.state.completedPuzzles = {};
    if (!this.state.completedPuzzles[key]) {
      this.state.completedPuzzles[key] = { math: [], science: [] };
    }
    this.state.stats.mathLevelsCompletedList = this.state.completedPuzzles[key].math;
    this.state.stats.scienceLevelsCompletedList = this.state.completedPuzzles[key].science;
    this.state.stats.mathLevelsCompleted = this.state.stats.mathLevelsCompletedList.length > 0
      ? Math.max(...this.state.stats.mathLevelsCompletedList) : 0;
    this.state.stats.scienceLevelsCompleted = this.state.stats.scienceLevelsCompletedList.length > 0
      ? Math.max(...this.state.stats.scienceLevelsCompletedList) : 0;
    this.checkSwitchingUnlock();
    this.saveState();
  }
  checkSwitchingUnlock() {
    if (this.state.profile.switchingUnlocked) return;
    const origGrade = this.state.profile.originalGrade;
    const origCountry = this.state.profile.originalCountry;
    if (origGrade && origCountry) {
      const origKey = `${origCountry}_G${origGrade}`;
      const origData = this.state.completedPuzzles[origKey];
      if (origData) {
        const mathSolved = origData.math ? Math.max(0, ...origData.math) : 0;
        const sciSolved = origData.science ? Math.max(0, ...origData.science) : 0;
        if (mathSolved >= 75 && sciSolved >= 75) {
          this.state.profile.switchingUnlocked = true;
        }
      }
    }
  }
  hasCompletedAllPostOriginalGrades() {
    if (!this.state.profile || !this.state.profile.originalGrade) return false;
    const country = this.state.profile.country || 'US';
    const originalGrade = this.state.profile.originalGrade;
    for (let g = originalGrade; g <= 12; g++) {
      const key = `${country}_G${g}`;
      const data = this.state.completedPuzzles[key];
      if (!data) return false;
      const mathSolved = data.math ? Math.max(0, ...data.math) : 0;
      const sciSolved = data.science ? Math.max(0, ...data.science) : 0;
      if (mathSolved < 75 || sciSolved < 75) {
        return false;
      }
    }
    return true;
  }
  adjustDifficulty(delta) {
    const oldDiff = this.state.difficulty;
    let newDiff = Math.round((oldDiff + delta) * 10) / 10;
    newDiff = Math.max(1.0, Math.min(5.0, newDiff));
    if (newDiff !== oldDiff) {
      this.state.difficulty = newDiff;
      this.saveState();
      return true;
    }
    return false;
  }
  setCognitiveStyle(style) {
    if (['visualizer', 'builder', 'logician'].includes(style)) {
      this.state.cognitiveStyle = style;
      this.saveState();
      return true;
    }
    return false;
  }
  logPuzzleAttempt(labId, level, success, timeSpentSeconds, hintsUsed) {
    const history = labId === 'balance-lab' ? this.state.puzzleHistory.math : this.state.puzzleHistory.science;
    if (!history[level]) {
      history[level] = [];
    }
    history[level].push({
      success,
      timeSpent: timeSpentSeconds,
      hintsUsed,
      timestamp: Date.now()
    });
    this.state.stats.totalHintsUsed += hintsUsed;
    if (success) {
      let difficultyDelta = 0;
      this.state.stats.streak += 1;
      this.state.stats.experiencePoints += Math.round(100 * level);
      if (!this.state.stats.mathLevelsCompletedList) this.state.stats.mathLevelsCompletedList = [];
      if (!this.state.stats.scienceLevelsCompletedList) this.state.stats.scienceLevelsCompletedList = [];
      if (labId === 'balance-lab') {
        this.state.stats.mathLevelsCompleted = Math.max(this.state.stats.mathLevelsCompleted, level);
        if (!this.state.stats.mathLevelsCompletedList.includes(level)) {
          this.state.stats.mathLevelsCompletedList.push(level);
        }
      } else {
        this.state.stats.scienceLevelsCompleted = Math.max(this.state.stats.scienceLevelsCompleted, level);
        if (!this.state.stats.scienceLevelsCompletedList.includes(level)) {
          this.state.stats.scienceLevelsCompletedList.push(level);
        }
      }
      if (hintsUsed === 0 && timeSpentSeconds < 45 * level) {
        difficultyDelta = 0.4;
      } else if (hintsUsed <= 1) {
        difficultyDelta = 0.2;
      }
      if (difficultyDelta > 0) {
        this.adjustDifficulty(difficultyDelta);
      }
    } else {
      this.state.stats.streak = 0;
      if (hintsUsed >= 2) {
        this.adjustDifficulty(-0.3);
      } else {
        this.adjustDifficulty(-0.1);
      }
    }
    if (this.state.profile && this.state.profile.country && this.state.profile.grade) {
      const key = `${this.state.profile.country}_G${this.state.profile.grade}`;
      if (!this.state.completedPuzzles) this.state.completedPuzzles = {};
      this.state.completedPuzzles[key] = {
        math: this.state.stats.mathLevelsCompletedList,
        science: this.state.stats.scienceLevelsCompletedList
      };
      this.checkSwitchingUnlock();
    }
    this.saveState();
  }
  resetAllProgress() {
    localStorage.removeItem('equiliprism_adaptive_state');
    this.state = {
      difficulty: 1.0,
      cognitiveStyle: 'visualizer',
      profile: {
        country: null,
        grade: null,
        originalCountry: null,
        originalGrade: null,
        switchingUnlocked: false
      },
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
      customSparky: {
        skin: 'default',
        headItem: null,
        mouthItem: null,
        backItem: null
      },
      puzzleHistory: {
        math: {},
        science: {}
      }
    };
    this.saveState();
  }
}
export const adaptiveEngine = new AdaptiveEngine();
