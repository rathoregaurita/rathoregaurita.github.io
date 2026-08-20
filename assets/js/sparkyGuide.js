import { adaptiveEngine } from '../hooks/adaptive-engine.js';
export class SparkyGuide {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeLab = containerId.includes('balance') ? 'balance-lab' : (containerId.includes('photon') ? 'photon-lab' : null);
    this.activeLevel = 1; this.hintIndex = 0; this.state = adaptiveEngine.state; this.dialogue = ""; this.mood = 'neutral';
    this.boundStateChange = (e) => { this.state = e.detail; this.updateSpeechBubble(); };
    this.boundContextChange = (e) => {
      const { labId, level } = e.detail;
      this.activeLab = labId; this.activeLevel = level; this.hintIndex = 0; this.mood = 'neutral';
      this.generateContextualText(); this.render();
    };
    this.boundSolved = () => { this.mood = 'happy'; this.dialogue = this.getSuccessMessage(); this.render(); };
    this.boundFailed = () => { this.mood = 'confused'; this.dialogue = this.getFailureMessage(); this.render(); };
    window.addEventListener('equiliprismStateChanged', this.boundStateChange);
    window.addEventListener('labContextChanged', this.boundContextChange);
    window.addEventListener('puzzleSolved', this.boundSolved);
    window.addEventListener('puzzleFailed', this.boundFailed);
    this.generateContextualText(); this.render();
  }
  destroy() {
    window.removeEventListener('equiliprismStateChanged', this.boundStateChange);
    window.removeEventListener('labContextChanged', this.boundContextChange);
    window.removeEventListener('puzzleSolved', this.boundSolved);
    window.removeEventListener('puzzleFailed', this.boundFailed);
  }
  generateContextualText() {
    const style = this.state.cognitiveStyle, profile = this.state.profile || { country: 'US', grade: 4 }, grade = profile.grade !== undefined ? profile.grade : 4;
    if (!this.activeLab) {
      this.dialogue = "Welcome to EquiliPrism! Pick a learning style below that matches how your brain likes to think. Then, let's jump into a lab!"; return;
    }
    if (this.activeLab === 'balance-lab') {
      if (grade <= 0) {
        this.dialogue = grade === -1 ? "Let's count the blocks on the right plate and balance them!" : "Solve the addition puzzle: make both sides match."; return;
      }
      if (grade >= 9) {
        this.dialogue = "Isolate chests (x) or sacks (y) to solve systems of linear equations."; return;
      }
      const mathExps = {
        visualizer: {
          1: "Symmetrically place or remove weights to keep the see-saw balanced.",
          2: "Peel off equal weights from both plates until only one chest remains.",
          3: "Balloons pull upwards (subtraction). Pop weights or balloons equally to solve."
        },
        builder: {
          1: "Think of this scale as a mechanical truss. Total load on both sides must be equal.",
          2: "Isolate crates by dismantling structures symmetrically.",
          3: "A balloon is a upward lift force. Add downward weights to balance."
        },
        logician: {
          1: "To solve x + 3 = 7, apply the inverse operation: subtract 3 from both sides.",
          2: "Subtract x from both sides to simplify 2x + 1 = x + 5.",
          3: "To solve x - 2 = 4, add 2 to both sides."
        }
      };
      this.dialogue = (mathExps[style] || mathExps.visualizer)[Math.min(3, Math.max(1, Math.floor(this.activeLevel)))];
    } else if (this.activeLab === 'photon-lab') {
      if (grade <= 0) { this.dialogue = "Aim the laser at the sensor using a flat mirror!"; return; }
      if (grade >= 9) { this.dialogue = "Use splitters and color filters to route advanced wavelengths."; return; }
      const scienceExps = {
        visualizer: {
          1: "Place a mirror on the grid to bounce the laser beam into the target node.",
          2: "Lenses refract light. Guide the bent ray around concrete barriers.",
          3: "A prism splits white light into a rainbow spectrum. Route the red wavelength."
        },
        builder: {
          1: "Mount reflectors at 45-degree coordinates to direct photon vectors.",
          2: "Angle refractors to offset paths past barricades.",
          3: "Split source lasers into distinct chromatic receptors."
        },
        logician: {
          1: "Apply mirror physics (incidence = reflection angle) to target coordinates.",
          2: "Use Snell's Law to calculate lateral ray offset through glass slabs.",
          3: "Route dispersed wavelength colors to corresponding sensors."
        }
      };
      this.dialogue = (scienceExps[style] || scienceExps.visualizer)[Math.min(3, Math.max(1, Math.floor(this.activeLevel)))];
    }
  }
  getHint() {
    this.mood = 'thinking';
    const grade = (this.state.profile || {}).grade || 4;
    let hints = [];
    if (this.activeLab === 'balance-lab') {
      hints = grade <= 0 ? ["Count weights on one plate and add same count to other.", "Make counts match."]
                            : ["Subtract equal numbers of weights from both sides.", "Put balloons on scale to pull it up (subtract)."];
    } else {
      hints = grade <= 0 ? ["Place flat mirror to bounce laser.", "Drag mirror angle handle."]
                            : ["Angle mirrors to direct the ray.", "Prisms split white lasers into colors."];
    }
    this.dialogue = hints[this.hintIndex % hints.length]; this.hintIndex++; this.render();
  }
  coSolve() {
    this.mood = 'happy'; this.dialogue = "I highlighted the next step on your workspace! Try executing it."; this.render();
    window.dispatchEvent(new CustomEvent('sparkyCoSolveStep', { detail: { labId: this.activeLab, level: this.activeLevel } }));
  }
  getSuccessMessage() {
    return ["Brilliant! You solved it!", "Awesome job!", "Double high five! Perfect!"][Math.floor(Math.random() * 3)];
  }
  getFailureMessage() { return "Oops, scale tilted or light missed! Adjust it, or click 'Solve a step with me'!"; }
  getSparkySVG() {
    const skin = (this.state.customSparky || {}).skin || 'default', head = (this.state.customSparky || {}).headItem, mouth = (this.state.customSparky || {}).mouthItem, back = (this.state.customSparky || {}).backItem;
    let eye = 'eye-neutral', mouthSVG = '<path d="M 22 30 Q 30 36 38 30" stroke="#fff" stroke-width="2.5" fill="none"/>';
    if (this.mood === 'happy') { eye = 'eye-happy'; mouthSVG = '<path d="M 20 30 Q 30 38 40 30" stroke="#fff" stroke-width="3" fill="none"/>'; }
    else if (this.mood === 'thinking') { eye = 'eye-thinking'; mouthSVG = '<line x1="24" y1="32" x2="36" y2="32" stroke="#fff" stroke-width="2.5"/>'; }
    else if (this.mood === 'confused') { eye = 'eye-confused'; mouthSVG = '<path d="M 24 33 Q 30 28 36 33" stroke="#fff" stroke-width="2.5" fill="none"/>'; }
    let bodyCol = 'purple', strokeCol = 'cyan', ears = '', face = '', backSVG = '', headSVG = '', mouthSVGItem = '';
    if (skin === 'cat') { bodyCol = '#f59e0b'; strokeCol = '#d97706'; ears = '<polygon points="12,18 4,6 18,12" fill="#f59e0b"/><polygon points="48,18 56,6 42,12" fill="#f59e0b"/>'; face = '<polygon points="30,26 27,23 33,23" fill="#f43f5e"/>'; }
    else if (skin === 'dog') { bodyCol = '#d97706'; strokeCol = '#b45309'; ears = '<path d="M 8 16 Q 0 24 6 36 Z" fill="#b45309"/>'; face = '<ellipse cx="30" cy="27" rx="5" ry="3.5" fill="#fbcfe8"/>'; }
    else if (skin === 'panda') { bodyCol = '#fff'; strokeCol = '#1e293b'; ears = '<circle cx="14" cy="14" r="6" fill="#1e293b"/>'; face = '<circle cx="30" cy="26" r="2" fill="#1e293b"/>'; }
    if (back === 'dragon_wings') backSVG = '<path d="M 12 24 C -8 10 -4 42 10 32 Z" fill="#059669" class="wing-l"/>';
    else if (back === 'cape') backSVG = '<path d="M 16 26 L 4 52 L 20 48 L 44 26 Z" fill="#ef4444"/>';
    if (head === 'fish_hat') headSVG = '<ellipse cx="30" cy="8" rx="8" ry="5" fill="#3b82f6"/>';
    else if (head === 'wizard_hat') headSVG = '<polygon points="30,-10 16,12 44,12" fill="#3b82f6"/>';
    if (mouth === 'bubble_tea') mouthSVGItem = '<rect x="36" y="24" width="10" height="15" fill="#fbbf24"/>';
    return `
      <svg class="sparky-character" viewBox="0 0 60 60" width="80" height="80">
        <circle cx="30" cy="30" r="24" fill="url(#sparkyGlow)"/>
        ${backSVG}
        ${ears}
        <circle cx="30" cy="30" r="18" fill="${bodyCol}" stroke="${strokeCol}" stroke-width="2"/>
        <g class="sparky-eyes ${eye}">
          <circle cx="21" cy="22" r="4" fill="#fff"/><circle cx="21" cy="22" r="2" fill="#000"/>
          <circle cx="39" cy="22" r="4" fill="#fff"/><circle cx="39" cy="22" r="2" fill="#000"/>
        </g>
        ${face}
        ${mouthSVG}
        ${headSVG}
        ${mouthSVGItem}
      </svg>
    `;
  }
  render() {
    this.container.innerHTML = `
      <div class="sparky-panel glass-card">
        <div class="sparky-character-area">
          <div class="sparky-avatar mood-${this.mood}" id="sparky-avatar-btn">${this.getSparkySVG()}</div>
          <div class="sparky-name">Sparky</div>
        </div>
        <div class="sparky-bubble">${this.dialogue}</div>
        <div class="sparky-actions">
          <button class="sparky-btn" id="sparky-explain-btn">Explain Goal</button>
          <button class="sparky-btn" id="sparky-hint-btn">Give Hint</button>
          ${this.activeLab ? `<button class="sparky-btn primary" id="sparky-cosolve-btn" style="background:hsl(var(--accent-pink));">Solve step with me</button>` : ''}
        </div>
      </div>
    `;
    this.container.querySelector('#sparky-avatar-btn').addEventListener('click', () => { this.mood = this.mood === 'neutral' ? 'happy' : 'neutral'; this.render(); });
    this.container.querySelector('#sparky-explain-btn').addEventListener('click', () => { this.mood = 'thinking'; this.generateContextualText(); this.render(); });
    this.container.querySelector('#sparky-hint-btn').addEventListener('click', () => this.getHint());
    if (this.activeLab) this.container.querySelector('#sparky-cosolve-btn').addEventListener('click', () => this.coSolve());
  }
  updateBubbleText(text, newMood = 'neutral') { this.dialogue = text; this.mood = newMood; this.render(); }
  updateSpeechBubble() { if (this.mood === 'neutral') { this.generateContextualText(); this.render(); } }
}
