// EquiliPrism Adaptive Difficulty Engine
// Holds state for difficulty levels, cognitive styles, and user progress metrics.

class AdaptiveEngine {
  constructor() {
    this.state = {
      difficulty: 1.0, // Ranges from 1.0 to 5.0
      cognitiveStyle: 'visualizer', // 'visualizer' | 'builder' | 'logician'
      profile: {
        country: null,
        grade: null,
        originalCountry: null,
        originalGrade: null,
        switchingUnlocked: false
      },
      completedPuzzles: {}, // Format: { 'US_G4': { math: [], science: [] } }
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

    // Load state from localStorage if available
    this.loadState();
  }

  // Persists progress
  saveState() {
    localStorage.setItem('equiliprism_adaptive_state', JSON.stringify(this.state));
    // Trigger custom event to notify components of state changes
    const event = new CustomEvent('equiliprismStateChanged', { detail: this.state });
    window.dispatchEvent(event);
  }

  loadState() {
    const saved = localStorage.getItem('equiliprism_adaptive_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) || {};
        
        // Deep merge defaults to prevent any property being undefined (e.g. cognitiveStyle)
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

        // Seed lists if max levels are set but lists are empty
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
        
        // Sync active lists if profile is set
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
    
    // Set original grade/country if not set or if updating to correct a mistake
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
    
    // Sync current active stats lists
    this.state.stats.mathLevelsCompletedList = this.state.completedPuzzles[key].math;
    this.state.stats.scienceLevelsCompletedList = this.state.completedPuzzles[key].science;
    
    // Sync single levels counters
    this.state.stats.mathLevelsCompleted = this.state.stats.mathLevelsCompletedList.length > 0
      ? Math.max(...this.state.stats.mathLevelsCompletedList) : 0;
    this.state.stats.scienceLevelsCompleted = this.state.stats.scienceLevelsCompletedList.length > 0
      ? Math.max(...this.state.stats.scienceLevelsCompletedList) : 0;
      
    this.checkSwitchingUnlock();
    this.saveState();
  }

  // Check if original grade levels are fully solved (level 75 in both math & science)
  checkSwitchingUnlock() {
    if (this.state.profile.switchingUnlocked) return;
    
    const origGrade = this.state.profile.originalGrade;
    const origCountry = this.state.profile.originalCountry;
    if (origGrade && origCountry) {
      const origKey = `${origCountry}_G${origGrade}`;
      const origData = this.state.completedPuzzles[origKey];
      if (origData) {
        // Complete when they have completed levels up to 75 (or have 75 inside completed lists)
        const mathSolved = origData.math ? Math.max(0, ...origData.math) : 0;
        const sciSolved = origData.science ? Math.max(0, ...origData.science) : 0;
        if (mathSolved >= 75 && sciSolved >= 75) {
          this.state.profile.switchingUnlocked = true;
        }
      }
    }
  }

  // Helper to determine if the user finished all 75 levels for every grade from their original grade up to Grade 12
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
      
      if (mathSolved < 100 || sciSolved < 100) {
        return false;
      }
    }
    return true;
  }

  // Adjusts the overall difficulty level dynamically, clamped [1.0, 5.0]
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

  // Sets user's style persona: builder (mechanics), visualizer (art/geometry), logician (formulas)
  setCognitiveStyle(style) {
    if (['visualizer', 'builder', 'logician'].includes(style)) {
      this.state.cognitiveStyle = style;
      this.saveState();
      return true;
    }
    return false;
  }

  // Logs a solved puzzle attempt and recalculates difficulty
  logPuzzleAttempt(labId, level, success, timeSpentSeconds, hintsUsed) {
    const history = labId === 'balance-lab' ? this.state.puzzleHistory.math : this.state.puzzleHistory.science;
    
    // Record history
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
      // Calculate difficulty changes
      let difficultyDelta = 0;
      
      // Base rewards
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

      // If solved quickly and with few hints, scale up
      if (hintsUsed === 0 && timeSpentSeconds < 45 * level) {
        difficultyDelta = 0.4;
      } else if (hintsUsed <= 1) {
        difficultyDelta = 0.2;
      }
      
      // Apply difficulty changes
      if (difficultyDelta > 0) {
        this.adjustDifficulty(difficultyDelta);
      }
    } else {
      // Failed attempts or resetting because it was too hard
      this.state.stats.streak = 0;
      
      // If they are failing or used maximum hints (e.g. 3) and spent a long time, dial down difficulty
      if (hintsUsed >= 2) {
        this.adjustDifficulty(-0.3);
      } else {
        this.adjustDifficulty(-0.1);
      }
    }

    // Sync current active stats lists to completedPuzzles dictionary
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

  unlockAllProgress() {
    if (!this.state.profile) {
      this.state.profile = { country: 'US', grade: 4, originalCountry: 'US', originalGrade: 4, switchingUnlocked: true };
    }
    
    this.state.profile.switchingUnlocked = true;
    this.state.stats.experiencePoints = 99999;
    
    const country = this.state.profile.country || 'US';
    if (!this.state.completedPuzzles) this.state.completedPuzzles = {};
    
    for (let g = -1; g <= 12; g++) {
      const key = `${country}_G${g}`;
      this.state.completedPuzzles[key] = {
        math: Array.from({ length: 100 }, (_, i) => i + 1),
        science: Array.from({ length: 100 }, (_, i) => i + 1)
      };
    }
    
    if (this.state.profile.grade !== null) {
      const key = `${country}_G${this.state.profile.grade}`;
      this.state.stats.mathLevelsCompletedList = this.state.completedPuzzles[key].math;
      this.state.stats.scienceLevelsCompletedList = this.state.completedPuzzles[key].science;
      this.state.stats.mathLevelsCompleted = 100;
      this.state.stats.scienceLevelsCompleted = 100;
    }
    
    this.saveState();
  }
}

export const adaptiveEngine = new AdaptiveEngine();
