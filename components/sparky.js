// EquiliPrism Empathetic Guide (Sparky) Component
import { adaptiveEngine } from '../hooks/adaptive-engine.js';

export class SparkyGuide {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    // Auto-detect active lab from mounting container
    if (containerId === 'balance-sparky-sidebar') {
      this.activeLab = 'balance-lab';
    } else if (containerId === 'photon-sparky-sidebar') {
      this.activeLab = 'photon-lab';
    } else {
      this.activeLab = null;
    }
    
    this.activeLevel = 1;
    this.hintIndex = 0;
    this.state = adaptiveEngine.state;
    this.dialogue = "";

    // Sparky's visual states: 'neutral' | 'happy' | 'thinking' | 'confused'
    this.mood = 'neutral';

    // Store bound listeners so they can be removed
    this.boundStateChange = (e) => {
      this.state = e.detail;
      this.updateSpeechBubble();
    };
    this.boundContextChange = (e) => {
      const { labId, level } = e.detail;
      this.activeLab = labId;
      this.activeLevel = level;
      this.hintIndex = 0;
      this.mood = 'neutral';
      this.generateContextualText();
      this.render();
    };
    this.boundSolved = () => {
      this.mood = 'happy';
      this.dialogue = this.getSuccessMessage();
      this.render();
    };
    this.boundFailed = () => {
      this.mood = 'confused';
      this.dialogue = this.getFailureMessage();
      this.render();
    };

    // Listen to changes in adaptive engine
    window.addEventListener('equiliprismStateChanged', this.boundStateChange);

    // Listen for custom events from labs to set context
    window.addEventListener('labContextChanged', this.boundContextChange);

    // Listen for events when a puzzle is solved or fails
    window.addEventListener('puzzleSolved', this.boundSolved);
    window.addEventListener('puzzleFailed', this.boundFailed);

    this.generateContextualText();
    this.render();
  }

  destroy() {
    window.removeEventListener('equiliprismStateChanged', this.boundStateChange);
    window.removeEventListener('labContextChanged', this.boundContextChange);
    window.removeEventListener('puzzleSolved', this.boundSolved);
    window.removeEventListener('puzzleFailed', this.boundFailed);
  }

  // Generate encouraging explanations tailored to the active lab and user's learning style
  generateContextualText() {
    const style = this.state.cognitiveStyle;
    const profile = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.profile) || { country: 'US', grade: 4 };
    const grade = profile.grade !== undefined ? profile.grade : 4;
    
    if (!this.activeLab) {
      this.dialogue = "Welcome to EquiliPrism! Pick a learning style below that matches how your brain likes to think. Then, let's jump into a lab!";
      return;
    }

    if (this.activeLab === 'balance-lab') {
      if (grade <= 0) {
        if (grade === -1) {
          this.dialogue = "Let's count the blocks on the right plate and place the exact same number of blocks on the left plate to make the see-saw balance!";
        } else {
          this.dialogue = "Let's solve the addition puzzle! Add enough blocks to the left plate so that the total blocks on the left match the right side.";
        }
        return;
      }
      if (grade >= 9) {
        this.dialogue = "We are solving systems of equations with two variables: Chests ($x$) and Sacks ($y$). Balance the see-saw and isolate either a single chest or a single sack to find its value!";
        return;
      }

      const mathExps = {
        visualizer: {
          1: "We want to balance this see-saw! Imagine we want both sides to look identical. What block can we place or take away to make the heights match?",
          2: "Now we have mystery chests on both sides. Think of it as balancing two plates. Let's peel off equal layers from both plates until only one chest is left!",
          3: "This see-saw has helium balloons pulling things up (negative weights) and heavy chests dragging them down. Let's balance them by popping items equally!"
        },
        builder: {
          1: "Think of this scale as a mechanical load truss. For the scale to remain static, the total load on the left structural joint must equal the load on the right. What weight is missing?",
          2: "We have multiple unknown crates ($x$) placed on our platform joints. To isolate a crate, let's dismantle the structure symmetrically. Remove crates or blocks from both sides in equal steps.",
          3: "Negative balloons act like lift pistons pulling upwards. Let's calculate the net forces. You can cancel out a lift balloon on one side by adding an equal downward load!"
        },
        logician: {
          1: "This balance scale is a physical equivalence relation: $A = B$. If we have $x + 3 = 7$, our goal is to isolate the variable $x$ by applying inverse operations.",
          2: "We have variables on both sides, like $2x + 1 = x + 5$. Subtract $x$ from both sides first to simplify the system, maintaining the equivalence invariant.",
          3: "Balloons represent negative coefficients, e.g., $x - 2 = 4$. To eliminate a subtraction of 2, apply the inverse operation: add 2 to both sides."
        }
      };
      const expSet = mathExps[style] || mathExps.visualizer;
      const levelKey = Math.min(3, Math.max(1, Math.floor(this.activeLevel)));
      this.dialogue = expSet[levelKey];
    } else if (this.activeLab === 'photon-lab') {
      if (grade <= 0) {
        this.dialogue = "Let's aim the laser beam directly at the sensor using a flat mirror! Adjust the mirror's angle so the light bounces straight onto the target.";
        return;
      }
      if (grade >= 9) {
        this.dialogue = "We are working with advanced wave optics! Use the Beam Splitter to split one ray into two parallel beams, or place Color Filters to block out unwanted wavelengths.";
        return;
      }

      const scienceExps = {
        visualizer: {
          1: "Look at that beautiful laser beam! Let's bounce it like a rubber ball off a flat mirror. Try placing a mirror to redirect the light onto the glowing node.",
          2: "Light bends when it passes through dense things like glass blocks! See how it refracts? Let's use that bend to aim the beam around the blocking walls.",
          3: "A triangular glass prism separates white light into a rainbow! Each color splits because it travels at a slightly different speed. Let's catch the red beam!"
        },
        builder: {
          1: "We need to construct a light conduit. Position a reflective reflector unit at a 45-degree angle to route the vector path of the photons into the target socket.",
          2: "A glass lens acts as a refractive beam-bender. When the beam enters a prism or block, the change in medium slows it down. Place refraction plates to navigate the barriers.",
          3: "A dispersion prism splits white source light into individual wavelengths (red, green, blue). Set up separate target collectors to capture the separated light rays!"
        },
        logician: {
          1: "The angle of incidence equals the angle of reflection ($\\theta_i = \\theta_r$). Place a mirror plane to satisfy the intersection coordinate that connects the source vector to the target.",
          2: "Snell's Law tells us $n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2)$. The glass slab causes a parallel offset in the ray's trajectory. Calculate the displacement to bypass the obstacle.",
          3: "Different wavelengths \\lambda have varying refractive indices $n(\\lambda)$, causing angular dispersion. Route the separated color rays to their corresponding chromatic sensors."
        }
      };
      const expSet = scienceExps[style] || scienceExps.visualizer;
      const levelKey = Math.min(3, Math.max(1, Math.floor(this.activeLevel)));
      this.dialogue = expSet[levelKey];
    }
  }

  // Get active hints based on current lab
  getHint() {
    this.mood = 'thinking';
    const profile = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.profile) || { country: 'US', grade: 4 };
    const grade = profile.grade !== undefined ? profile.grade : 4;
    
    let activeHints = [];
    if (this.activeLab === 'balance-lab') {
      if (grade <= 0) {
        activeHints = [
          "Try counting the weights on one plate and adding exactly that many to the other side.",
          "To balance the see-saw, both sides must have the same total number of blocks.",
          "If the scale is tilted down, try adding blocks to the side that is higher!"
        ];
      } else if (grade >= 9) {
        activeHints = [
          "We want to isolate either a single chest (x) or a single sack (y) on one side of the scale.",
          "If you have sacks on both sides, try subtracting them from both plates to simplify.",
          "Remember, if both plates have sacks and chests, simplify the see-saw symmetrically!"
        ];
      } else {
        activeHints = [
          "What happens if we take away the same number of weights from both sides?",
          "If you have blocks on both sides, try taking them off until only chests are on one side.",
          "Remember, putting a balloon on the scale pulls it up. It acts like subtraction!"
        ];
      }
    } else if (this.activeLab === 'photon-lab') {
      if (grade <= 0) {
        activeHints = [
          "Try placing a flat mirror on the board to reflect the light.",
          "Make sure the laser ray path bounces off the mirror and hits the target sensor directly.",
          "You can rotate the mirror by clicking on it and dragging the handle."
        ];
      } else if (grade >= 9) {
        activeHints = [
          "The Beam Splitter creates two parallel light paths separated by 30 pixels.",
          "Color Filters only allow light of their matching color to pass through.",
          "If you have a white laser, use a glass prism to split it, and then filters to select the correct rays!"
        ];
      } else {
        activeHints = [
          "Light travels in straight lines until it hits something. Try placing a mirror first to redirect it.",
          "A mirror reflections angle matches the incoming beam angle. Rotate it to tweak the beam's direction.",
          "White light is made of many colors. Prisms split them. Make sure the split red ray hits the red targets!"
        ];
      }
    } else {
      activeHints = ["Try placing items on the workspace and observe what happens!"];
    }

    const hint = activeHints[this.hintIndex % activeHints.length];
    this.hintIndex++;
    this.dialogue = hint;
    this.render();
  }

  // Empathetic helper co-solve option
  coSolve() {
    this.mood = 'happy';
    this.dialogue = "I have highlighted what to do next on your workspace and explained the reason below! Try performing this step yourself.";
    this.render();

    // Dispatch a custom event for the active lab to perform a step
    const event = new CustomEvent('sparkyCoSolveStep', { 
      detail: { 
        labId: this.activeLab, 
        level: this.activeLevel 
      } 
    });
    window.dispatchEvent(event);
  }

  getSuccessMessage() {
    const messages = [
      "Brilliant! You figured it out your own way!",
      "Spectacular! That was a super creative solution!",
      "Awesome! You see how the parts fit together? Onwards!",
      "Double high five! That was fantastic problem solving!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  getFailureMessage() {
    return "Oops, that balance scale tilted or the light missed! No worries at all—that's how we learn. Let's try adjusting it, or click 'Help me with a step' and we can look at it together!";
  }



  // Renders Sparky's SVG character with customizable skins and stackable items
  getSparkySVG() {
    const custom = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.customSparky) || { skin: 'default', headItem: null, mouthItem: null, backItem: null };
    const skin = custom.skin || 'default';
    const headItem = custom.headItem;
    const mouthItem = custom.mouthItem;
    const backItem = custom.backItem;

    let eyeClass = 'eye-neutral';
    let mouthSVG = '<path d="M 22 30 Q 30 36 38 30" stroke="#fff" stroke-width="2.5" fill="none"/>';
    
    if (this.mood === 'happy') {
      eyeClass = 'eye-happy';
      mouthSVG = '<path d="M 20 30 Q 30 38 40 30" stroke="#fff" stroke-width="3" fill="none"/>';
    } else if (this.mood === 'thinking') {
      eyeClass = 'eye-thinking';
      mouthSVG = '<line x1="24" y1="32" x2="36" y2="32" stroke="#fff" stroke-width="2.5"/>';
    } else if (this.mood === 'confused') {
      eyeClass = 'eye-confused';
      mouthSVG = '<path d="M 24 33 Q 30 28 36 33" stroke="#fff" stroke-width="2.5" fill="none"/>';
    }

    // Determine colors and structural SVG paths based on skin
    let skinBodyColor = 'hsl(263, 85%, 65%)'; // Default purple
    let skinStrokeColor = 'hsl(190, 95%, 48%)'; // Default cyan
    let earSVG = '';
    let faceSVG = '';
    
    if (skin === 'cat') {
      skinBodyColor = '#f59e0b'; // Cat orange
      skinStrokeColor = '#d97706';
      earSVG = `
        <!-- Cat ears -->
        <polygon points="12,18 4,6 18,12" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
        <polygon points="13,16 7,8 17,12" fill="#fca5a5" />
        <polygon points="48,18 56,6 42,12" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
        <polygon points="47,16 53,8 43,12" fill="#fca5a5" />
      `;
      faceSVG = `
        <!-- Whiskers -->
        <line x1="12" y1="28" x2="4" y2="26" stroke="#fff" stroke-width="1.5"/>
        <line x1="12" y1="31" x2="3" y2="31" stroke="#fff" stroke-width="1.5"/>
        <line x1="48" y1="28" x2="56" y2="26" stroke="#fff" stroke-width="1.5"/>
        <line x1="48" y1="31" x2="57" y2="31" stroke="#fff" stroke-width="1.5"/>
        <!-- Pink nose -->
        <polygon points="30,26 27,23 33,23" fill="#f43f5e" />
      `;
    } else if (skin === 'dog') {
      skinBodyColor = '#d97706'; // Dog golden/brown
      skinStrokeColor = '#b45309';
      earSVG = `
        <!-- Floppy dog ears -->
        <path d="M 8 16 Q 0 24 6 36 Q 16 38 14 22 Z" fill="#b45309" stroke="#78350f" stroke-width="1"/>
        <path d="M 52 16 Q 60 24 54 36 Q 44 38 46 22 Z" fill="#b45309" stroke="#78350f" stroke-width="1"/>
      `;
      faceSVG = `
        <!-- Dog snout & nose -->
        <ellipse cx="30" cy="27" rx="5" ry="3.5" fill="#fbcfe8" />
        <ellipse cx="30" cy="25" rx="3.5" ry="2" fill="#1e293b" />
        <!-- Tongue hanging out if happy -->
        ${this.mood === 'happy' ? '<path d="M 28 30 C 28 36 32 36 32 30 Z" fill="#ef4444"/>' : ''}
      `;
    } else if (skin === 'panda') {
      skinBodyColor = '#ffffff'; // White main face
      skinStrokeColor = '#1e293b';
      earSVG = `
        <!-- Black panda ears -->
        <circle cx="14" cy="14" r="6.5" fill="#1e293b"/>
        <circle cx="46" cy="14" r="6.5" fill="#1e293b"/>
      `;
      faceSVG = `
        <!-- Panda black eyes patches -->
        <ellipse cx="21" cy="22" rx="5.5" ry="6.5" fill="#1e293b" transform="rotate(-10 21 22)"/>
        <ellipse cx="39" cy="22" rx="5.5" ry="6.5" fill="#1e293b" transform="rotate(10 39 22)"/>
        <circle cx="30" cy="26" r="2" fill="#1e293b"/>
      `;
    } else if (skin === 'dragon') {
      skinBodyColor = '#10b981'; // Green dragon
      skinStrokeColor = '#047857';
      earSVG = `
        <!-- Dragon horns -->
        <path d="M 16 14 Q 8 6 12 0 Q 18 6 18 12 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
        <path d="M 44 14 Q 52 6 48 0 Q 42 6 42 12 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
        <!-- Cheek spikes -->
        <polygon points="12,30 3,32 10,36" fill="#10b981" stroke="#047857" stroke-width="1.5"/>
        <polygon points="48,30 57,32 50,36" fill="#10b981" stroke="#047857" stroke-width="1.5"/>
      `;
      faceSVG = `
        <!-- Nostrils -->
        <circle cx="27" cy="26" r="1" fill="#047857"/>
        <circle cx="33" cy="26" r="1" fill="#047857"/>
      `;
    } else if (skin === 'unicorn') {
      skinBodyColor = '#f5f3ff'; // Pastel purple/white
      skinStrokeColor = '#c084fc';
      earSVG = `
        <!-- Unicorn ears -->
        <polygon points="14,14 8,4 20,10" fill="#f5f3ff" stroke="#c084fc" stroke-width="1.5"/>
        <polygon points="46,14 52,4 40,10" fill="#f5f3ff" stroke="#c084fc" stroke-width="1.5"/>
        <!-- Colorful mane -->
        <path d="M 12 12 Q 2 24 8 36" fill="none" stroke="#f472b6" stroke-width="4" stroke-linecap="round"/>
        <path d="M 48 12 Q 58 24 52 36" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
      `;
      faceSVG = `
        <!-- Default gold horn if no head item overrides it -->
        ${!headItem ? `
          <polygon points="30,12 27,2 33,2" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
          <line x1="30" y1="12" x2="30" y2="2" stroke="#fff" stroke-width="0.5"/>
        ` : ''}
        <circle cx="30" cy="26" r="1.5" fill="#c084fc" opacity="0.6"/>
      `;
    } else if (skin === 'phoenix') {
      skinBodyColor = '#f97316'; // Fiery orange
      skinStrokeColor = '#ea580c';
      earSVG = `
        <!-- Fiery crest feathers -->
        <path d="M 30 10 C 24 -2 36 -2 30 10 Z" fill="#ef4444" stroke="#ea580c" stroke-width="1"/>
        <path d="M 26 12 C 16 2 28 2 26 12 Z" fill="#fbbf24" stroke="#ea580c" stroke-width="1"/>
        <path d="M 34 12 C 44 2 32 2 34 12 Z" fill="#fbbf24" stroke="#ea580c" stroke-width="1"/>
      `;
      faceSVG = `
        <!-- Small yellow bird beak -->
        <polygon points="30,24 27,28 33,28" fill="#fbbf24" stroke="#ea580c" stroke-width="1"/>
      `;
    } else if (skin === 'fox') {
      skinBodyColor = '#f97316';
      skinStrokeColor = '#c2410c';
      earSVG = `
        <polygon points="12,18 4,6 18,12" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
        <polygon points="13,16 9,10 17,12" fill="#fff" />
        <polygon points="48,18 56,6 42,12" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
        <polygon points="47,16 51,10 43,12" fill="#fff" />
      `;
      faceSVG = `
        <ellipse cx="30" cy="28" rx="6" ry="4" fill="#fff" />
        <polygon points="30,29 27,26 33,26" fill="#1e293b" />
      `;
    } else if (skin === 'lion') {
      skinBodyColor = '#fbbf24';
      skinStrokeColor = '#d97706';
      earSVG = `
        <circle cx="30" cy="30" r="22" fill="#b45309" stroke="#78350f" stroke-width="1.5" />
        <circle cx="14" cy="18" r="5" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
        <circle cx="46" cy="18" r="5" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
      `;
      faceSVG = `
        <polygon points="30,27 27,24 33,24" fill="#1e293b" />
      `;
    } else if (skin === 'monkey') {
      skinBodyColor = '#854d0e';
      skinStrokeColor = '#713f12';
      earSVG = `
        <circle cx="11" cy="26" r="6" fill="#854d0e" stroke="#713f12" stroke-width="1.5"/>
        <circle cx="11" cy="26" r="3.5" fill="#fbcfe8" />
        <circle cx="49" cy="26" r="6" fill="#854d0e" stroke="#713f12" stroke-width="1.5"/>
        <circle cx="49" cy="26" r="3.5" fill="#fbcfe8" />
      `;
      faceSVG = `
        <ellipse cx="25" cy="26" rx="6" ry="6" fill="#fbcfe8" />
        <ellipse cx="35" cy="26" rx="6" ry="6" fill="#fbcfe8" />
        <ellipse cx="30" cy="30" rx="8" ry="6" fill="#fbcfe8" />
        <circle cx="30" cy="27" r="1.5" fill="#713f12" />
      `;
    } else if (skin === 'koala') {
      skinBodyColor = '#94a3b8';
      skinStrokeColor = '#64748b';
      earSVG = `
        <circle cx="12" cy="16" r="8" fill="#94a3b8" stroke="#64748b" stroke-width="1.5"/>
        <circle cx="12" cy="16" r="5" fill="#f1f5f9" />
        <circle cx="48" cy="16" r="8" fill="#94a3b8" stroke="#64748b" stroke-width="1.5"/>
        <circle cx="48" cy="16" r="5" fill="#f1f5f9" />
      `;
      faceSVG = `
        <ellipse cx="30" cy="26" rx="3.5" ry="6" fill="#1e293b" />
      `;
    } else if (skin === 'pegasus') {
      skinBodyColor = '#f8fafc';
      skinStrokeColor = '#cbd5e1';
      earSVG = `
        <polygon points="14,14 8,4 20,10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <polygon points="46,14 52,4 40,10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <path d="M 12 12 Q 2 24 8 36" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
        <path d="M 48 12 Q 58 24 52 36" fill="none" stroke="#a78bfa" stroke-width="4" stroke-linecap="round"/>
      `;
      faceSVG = `
        <circle cx="30" cy="26" r="1.5" fill="#cbd5e1" opacity="0.6"/>
      `;
    } else if (skin === 'griffin') {
      skinBodyColor = '#f59e0b';
      skinStrokeColor = '#d97706';
      earSVG = `
        <path d="M 16 14 Q 8 6 12 0 Q 18 6 18 12 Z" fill="#f59e0b" stroke="#d97706" stroke-width="1.5"/>
        <path d="M 44 14 Q 52 6 48 0 Q 42 6 42 12 Z" fill="#f59e0b" stroke="#d97706" stroke-width="1.5"/>
        <path d="M 30 10 C 24 -2 36 -2 30 10 Z" fill="#d97706" stroke="#b45309" stroke-width="1"/>
      `;
      faceSVG = `
        <polygon points="30,24 26,29 34,29" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
      `;
    } else if (skin === 'wyvern') {
      skinBodyColor = '#475569';
      skinStrokeColor = '#1e293b';
      earSVG = `
        <polygon points="14,14 4,2 18,10" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
        <polygon points="46,14 56,2 42,10" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
        <polygon points="12,30 3,32 10,36" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
        <polygon points="48,30 57,32 50,36" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
      `;
      faceSVG = `
        <circle cx="27" cy="26" r="1.2" fill="#1e293b"/>
        <circle cx="33" cy="26" r="1.2" fill="#1e293b"/>
      `;
    } else if (skin === 'alien') {
      skinBodyColor = '#22c55e';
      skinStrokeColor = '#15803d';
      earSVG = `
        <line x1="20" y1="12" x2="14" y2="2" stroke="#15803d" stroke-width="2"/>
        <circle cx="14" cy="2" r="3" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
        <line x1="40" y1="12" x2="46" y2="2" stroke="#15803d" stroke-width="2"/>
        <circle cx="46" cy="2" r="3" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
      `;
      faceSVG = `
        <ellipse cx="21" cy="22" rx="5.5" ry="7.5" fill="#1e293b" transform="rotate(-15 21 22)"/>
        <ellipse cx="39" cy="22" rx="5.5" ry="7.5" fill="#1e293b" transform="rotate(15 39 22)"/>
        <circle cx="23" cy="19" r="1.5" fill="#fff"/>
        <circle cx="37" cy="19" r="1.5" fill="#fff"/>
      `;
    } else if (skin === 'astronaut') {
      skinBodyColor = '#f1f5f9';
      skinStrokeColor = '#94a3b8';
      earSVG = `
        <rect x="6" y="16" width="6" height="12" rx="2" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1"/>
        <rect x="48" y="16" width="6" height="12" rx="2" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1"/>
      `;
      faceSVG = `
        <path d="M 12 14 A 20 20 0 0 1 48 14 L 46 36 A 20 20 0 0 1 14 36 Z" fill="none" stroke="#60a5fa" stroke-width="1.5" opacity="0.45"/>
      `;
    } else if (skin === 'cyborg') {
      skinBodyColor = '#cbd5e1';
      skinStrokeColor = '#475569';
      earSVG = `
        <rect x="8" y="14" width="5" height="14" fill="#64748b" stroke="#334155" stroke-width="1"/>
        <circle cx="10" cy="14" r="2" fill="#ef4444"/>
        <rect x="47" y="14" width="5" height="14" fill="#64748b" stroke="#334155" stroke-width="1"/>
      `;
      faceSVG = `
        <line x1="30" y1="12" x2="30" y2="44" stroke="#475569" stroke-width="1" stroke-dasharray="2 2"/>
        <path d="M 12 24 L 28 24 L 28 12" fill="none" stroke="#475569" stroke-width="1"/>
        <circle cx="21" cy="22" r="5" fill="#ef4444" opacity="0.3"/>
        <circle cx="21" cy="22" r="2.2" fill="#ef4444"/>
      `;
    } else if (skin === 'galaxy') {
      skinBodyColor = '#0f172a';
      skinStrokeColor = '#6366f1';
      earSVG = `
        <circle cx="12" cy="16" r="6" fill="#a855f7" opacity="0.7"/>
        <circle cx="48" cy="16" r="6" fill="#ec4899" opacity="0.7"/>
      `;
      faceSVG = `
        <polygon points="30,8 31,10 33,10 31,11 32,13 30,12 28,13 29,11 27,10 29,10" fill="#fff" opacity="0.95"/>
        <circle cx="18" cy="30" r="0.8" fill="#fff"/>
        <circle cx="42" cy="30" r="0.8" fill="#fff"/>
        <circle cx="30" cy="34" r="1.2" fill="#fbbf24"/>
      `;
    }

    // Stackable Items Drawing
    let headItemSVG = '';
    let mouthItemSVG = '';
    let backItemSVG = '';

    // 1. Back Item
    if (backItem === 'dragon_wings') {
      backItemSVG = `
        <!-- Dragon wings behind Sparky -->
        <g stroke="#047857" stroke-width="1.5">
          <!-- Left Wing -->
          <path d="M 12 24 C -8 10 -4 42 10 32 Z" fill="#059669" class="wing-l" />
          <!-- Right Wing -->
          <path d="M 48 24 C 68 10 64 42 50 32 Z" fill="#059669" class="wing-r" />
        </g>
      `;
    } else if (backItem === 'phoenix_tail') {
      backItemSVG = `
        <!-- Phoenix tail / wings behind Sparky -->
        <g stroke="#ea580c" stroke-width="1.5">
          <!-- Left Fiery wing -->
          <path d="M 12 26 C -6 20 -2 50 10 34 Z" fill="#f97316" class="wing-l" />
          <path d="M 12 26 C -2 24 0 42 10 32 Z" fill="#facc15" class="wing-l" />
          <!-- Right Fiery wing -->
          <path d="M 48 26 C 66 20 62 50 50 34 Z" fill="#f97316" class="wing-r" />
          <path d="M 48 26 C 50 24 48 42 50 32 Z" fill="#facc15" class="wing-r" />
        </g>
      `;
    } else if (backItem === 'cape') {
      backItemSVG = `
        <!-- Hero Cape -->
        <path d="M 16 26 L 4 52 L 20 48 L 30 46 L 40 48 L 56 52 L 44 26 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5" class="wing-l" />
      `;
    } else if (backItem === 'pegasus_wings') {
      backItemSVG = `
        <g stroke="#cbd5e1" stroke-width="1.5">
          <path d="M 12 24 C -10 6 -4 44 10 32 Z" fill="#f8fafc" class="wing-l" />
          <line x1="2" y1="16" x2="8" y2="28" stroke="#cbd5e1" stroke-width="1" class="wing-l" />
          <path d="M 48 24 C 70 6 64 44 50 32 Z" fill="#f8fafc" class="wing-r" />
          <line x1="58" y1="16" x2="52" y2="28" stroke="#cbd5e1" stroke-width="1" class="wing-r" />
        </g>
      `;
    } else if (backItem === 'wyvern_tail') {
      backItemSVG = `
        <path d="M 30 46 Q 30 56 18 54 Q 10 52 12 46 Q 14 42 22 46 Q 28 50 28 46" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        <polygon points="12,46 6,42 8,48" fill="#ef4444" />
      `;
    } else if (backItem === 'ufo') {
      backItemSVG = `
        <g class="wing-l">
          <ellipse cx="6" cy="34" rx="8" ry="3.5" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
          <ellipse cx="6" cy="31" rx="4.5" ry="3" fill="#22d3ee" opacity="0.8"/>
        </g>
        <g class="wing-r">
          <ellipse cx="54" cy="34" rx="8" ry="3.5" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
          <ellipse cx="54" cy="31" rx="4.5" ry="3" fill="#22d3ee" opacity="0.8"/>
        </g>
      `;
    } else if (backItem === 'cyber_wings') {
      backItemSVG = `
        <g stroke="#ff00ff" stroke-width="2" class="wing-l" style="filter: drop-shadow(0 0 4px rgba(255, 0, 255, 0.85));">
          <line x1="12" y1="24" x2="-6" y2="12" />
          <line x1="12" y1="24" x2="-10" y2="24" />
          <line x1="12" y1="24" x2="-4" y2="34" />
        </g>
        <g stroke="#ff00ff" stroke-width="2" class="wing-r" style="filter: drop-shadow(0 0 4px rgba(255, 0, 255, 0.85));">
          <line x1="48" y1="24" x2="66" y2="12" />
          <line x1="48" y1="24" x2="70" y2="24" />
          <line x1="48" y1="24" x2="64" y2="34" />
        </g>
      `;
    }

    // 2. Head Item
    if (headItem === 'fish_hat') {
      headItemSVG = `
        <!-- Fish Hat -->
        <g transform="translate(14, -6)">
          <ellipse cx="16" cy="14" rx="14" ry="9" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
          <polygon points="2,14 -4,9 -4,19" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
          <circle cx="24" cy="11" r="2" fill="#fff"/>
          <circle cx="24" cy="11" r="0.8" fill="#000"/>
        </g>
      `;
    } else if (headItem === 'bamboo_hat') {
      headItemSVG = `
        <!-- Conical Bamboo Hat -->
        <polygon points="30,-4 8,14 52,14" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
        <line x1="30" y1="-4" x2="22" y2="14" stroke="#ca8a04" stroke-width="1"/>
        <line x1="30" y1="-4" x2="38" y2="14" stroke="#ca8a04" stroke-width="1"/>
      `;
    } else if (headItem === 'rainbow_horn') {
      headItemSVG = `
        <!-- Rainbow Glowing Horn -->
        <g class="glow-rainbow">
          <polygon points="30,12 26,-2 34,-2" fill="url(#rainbowHornGrad)" stroke="#a855f7" stroke-width="1.5"/>
        </g>
      `;
    } else if (headItem === 'flame_crown') {
      headItemSVG = `
        <!-- Crown of fire -->
        <g stroke="#f97316" stroke-width="1">
          <polygon points="20,12 22,2 26,10 30,-2 34,10 38,2 40,12" fill="#ef4444"/>
          <polygon points="22,12 25,6 27,11 30,3 33,11 35,6 38,12" fill="#fbbf24"/>
        </g>
      `;
    } else if (headItem === 'wizard_hat') {
      headItemSVG = `
        <polygon points="30,-12 12,12 48,12" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
        <ellipse cx="30" cy="12" rx="20" ry="3" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
        <polygon points="30,0 29,3 32,1 30,0" fill="#facc15"/>
        <polygon points="24,6 23,8 25,7 24,6" fill="#facc15"/>
        <polygon points="36,6 35,8 37,7 36,6" fill="#facc15"/>
      `;
    } else if (headItem === 'helmet') {
      headItemSVG = `
        <!-- Astro space helmet glass bubble -->
        <circle cx="30" cy="22" r="23" fill="rgba(6, 182, 212, 0.12)" stroke="#22d3ee" stroke-width="1.5" style="filter: drop-shadow(0 0 3px rgba(6, 182, 212, 0.4));"/>
        <path d="M 12 14 Q 30 4 48 14" fill="none" stroke="#fff" stroke-width="1" opacity="0.5"/>
      `;
    } else if (headItem === 'galaxy_halo') {
      headItemSVG = `
        <!-- Floating color cycling halo ring -->
        <ellipse cx="30" cy="-6" rx="16" ry="3.5" fill="none" stroke="#a855f7" stroke-width="2" style="filter: drop-shadow(0 0 4px #ec4899); transform: rotate(-5deg); transform-origin: 30px -6px;"/>
        <circle cx="16" cy="-8" r="2.2" fill="#f472b6"/>
        <circle cx="44" cy="-4" r="1.2" fill="#38bdf8"/>
      `;
    }

    // 3. Mouth/Neck Item
    if (mouthItem === 'fish_bone') {
      mouthItemSVG = `
        <!-- Fish Bone in mouth -->
        <g transform="translate(18, 30)">
          <line x1="0" y1="0" x2="24" y2="0" stroke="#cbd5e1" stroke-width="2"/>
          <line x1="6" y1="-5" x2="6" y2="5" stroke="#cbd5e1" stroke-width="1.5"/>
          <line x1="12" y1="-7" x2="12" y2="7" stroke="#cbd5e1" stroke-width="1.5"/>
          <line x1="18" y1="-5" x2="18" y2="5" stroke="#cbd5e1" stroke-width="1.5"/>
          <polygon points="24,0 29,-4 29,4" fill="#cbd5e1"/>
        </g>
      `;
    } else if (mouthItem === 'spiked_collar') {
      mouthItemSVG = `
        <!-- Spiked Collar -->
        <path d="M 16 38 Q 30 46 44 38 L 42 42 Q 30 50 18 42 Z" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
        <polygon points="20,41 20,46 22,42" fill="#cbd5e1" />
        <polygon points="25,43 25,48 27,44" fill="#cbd5e1" />
        <polygon points="30,44 30,49 32,45" fill="#cbd5e1" />
        <polygon points="35,43 35,48 37,44" fill="#cbd5e1" />
        <polygon points="40,41 40,46 42,42" fill="#cbd5e1" />
      `;
    } else if (mouthItem === 'bamboo_straw') {
      mouthItemSVG = `
        <!-- Bamboo green straw -->
        <line x1="30" y1="31" x2="16" y2="44" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
        <line x1="18" y1="42" x2="14" y2="48" stroke="#15803d" stroke-width="2"/>
      `;
    } else if (mouthItem === 'bubble_tea') {
      mouthItemSVG = `
        <!-- Bubble tea cup -->
        <g transform="translate(36, 24)">
          <rect x="0" y="4" width="12" height="18" rx="2" fill="rgba(251, 191, 36, 0.4)" stroke="#d97706" stroke-width="1.5"/>
          <line x1="6" y1="-2" x2="6" y2="12" stroke="#ec4899" stroke-width="2.5"/>
          <!-- Boba pearls -->
          <circle cx="3" cy="18" r="1" fill="#000"/>
          <circle cx="6" cy="19" r="1" fill="#000"/>
          <circle cx="9" cy="18" r="1" fill="#000"/>
        </g>
      `;
    } else if (mouthItem === 'steak') {
      mouthItemSVG = `
        <g transform="translate(18, 30)">
          <rect x="2" y="-2" width="16" height="8" rx="3" fill="#ea580c" stroke="#b91c1c" stroke-width="1"/>
          <circle cx="6" cy="2" r="1.5" fill="#fca5a5"/>
          <line x1="-2" y1="2" x2="2" y2="2" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="18" y1="2" x2="22" y2="2" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
        </g>
      `;
    } else if (mouthItem === 'banana') {
      mouthItemSVG = `
        <g transform="translate(16, 28)">
          <path d="M 0 10 Q 10 16 20 8 Q 14 6 0 10" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
          <polygon points="20,8 24,6 22,10" fill="#fef08a"/>
        </g>
      `;
    } else if (mouthItem === 'eucalyptus_leaf') {
      mouthItemSVG = `
        <g transform="translate(18, 32)">
          <path d="M 0 4 Q 8 -2 16 2 Q 8 8 0 4" fill="#047857" stroke="#065f46" stroke-width="1"/>
          <line x1="0" y1="4" x2="16" y2="2" stroke="#065f46" stroke-width="1"/>
        </g>
      `;
    } else if (mouthItem === 'golden_feather') {
      mouthItemSVG = `
        <g transform="translate(16, 32)">
          <path d="M 0 2 Q 10 -6 20 0 Q 10 8 0 2" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
          <line x1="0" y1="2" x2="20" y2="0" stroke="#d97706" stroke-width="1"/>
        </g>
      `;
    }

    return `
      <svg class="sparky-character" viewBox="0 0 60 60" width="80" height="80">
        <defs>
          <radialGradient id="sparkyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#a78bfa" stop-opacity="1"/>
            <stop offset="100%" stop-color="#6d28d9" stop-opacity="0.3"/>
          </radialGradient>
          <linearGradient id="rainbowHornGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ef4444"/>
            <stop offset="33%" stop-color="#3b82f6"/>
            <stop offset="66%" stop-color="#22c55e"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
        </defs>
        
        <!-- Hover Glow shadow -->
        <circle cx="30" cy="30" r="24" fill="url(#sparkyGlow)"/>

        <!-- Back Item -->
        ${backItemSVG}

        <!-- Antenna (only if default skin) -->
        ${skin === 'default' ? `
          <polygon points="30,4 33,10 27,10" fill="#f59e0b" />
          <line x1="30" y1="10" x2="30" y2="15" stroke="#f59e0b" stroke-width="2"/>
        ` : ''}

        <!-- Ear items for skins -->
        ${earSVG}

        <!-- Main Body (Floating soft sphere) -->
        <circle cx="30" cy="30" r="18" fill="${skinBodyColor}" stroke="${skinStrokeColor}" stroke-width="2"/>

        <!-- Expressive Eyes -->
        <g class="sparky-eyes ${eyeClass}">
          <!-- Left Eye -->
          <circle cx="21" cy="22" r="4" fill="${skin === 'wyvern' ? '#ef4444' : '#fff'}"/>
          <circle class="pupil" cx="21" cy="22" r="2" fill="${skin === 'wyvern' ? '#fff' : '#000'}"/>
          
          <!-- Right Eye -->
          <circle cx="39" cy="22" r="4" fill="${skin === 'wyvern' ? '#ef4444' : '#fff'}"/>
          <circle class="pupil" cx="39" cy="22" r="2" fill="${skin === 'wyvern' ? '#fff' : '#000'}"/>
        </g>

        <!-- Face Details / Nose / Snout -->
        ${faceSVG}

        <!-- Mouth -->
        ${mouthSVG}

        <!-- Head Item -->
        ${headItemSVG}

        <!-- Mouth/Neck Item -->
        ${mouthItemSVG}

        <!-- Cheeks (pink blush) -->
        <circle cx="16" cy="27" r="2.5" fill="#ec4899" opacity="0.6"/>
        <circle cx="44" cy="27" r="2.5" fill="#ec4899" opacity="0.6"/>
      </svg>
    `;
  }

  render() {
    this.container.innerHTML = `
      <div class="sparky-panel glass-card">
        <div class="sparky-character-area">
          <div class="sparky-avatar mood-${this.mood}" id="sparky-avatar-btn">
            ${this.getSparkySVG()}
          </div>
          <div class="sparky-name">Sparky</div>
        </div>

        <div class="sparky-bubble">
          ${this.dialogue}
        </div>

        <div class="sparky-actions">
          <button class="sparky-btn" id="sparky-explain-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Explain the Goal
          </button>
          <button class="sparky-btn" id="sparky-hint-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
            Give a Hint
          </button>
          ${this.activeLab ? `
            <button class="sparky-btn primary" id="sparky-cosolve-btn" style="background: hsl(var(--accent-pink));">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Solve a step with me!
            </button>
          ` : ''}
        </div>
      </div>
    `;

    // Add event listeners
    this.container.querySelector('#sparky-avatar-btn').addEventListener('click', () => {
      this.mood = this.mood === 'neutral' ? 'happy' : 'neutral';
      this.render();
    });

    this.container.querySelector('#sparky-explain-btn').addEventListener('click', () => {
      this.mood = 'thinking';
      this.generateContextualText();
      this.render();
    });

    this.container.querySelector('#sparky-hint-btn').addEventListener('click', () => {
      this.getHint();
    });

    if (this.activeLab) {
      this.container.querySelector('#sparky-cosolve-btn').addEventListener('click', () => {
        this.coSolve();
      });
    }
  }

  // Utility to let components update speech bubble directly
  updateBubbleText(text, newMood = 'neutral') {
    this.dialogue = text;
    this.mood = newMood;
    this.render();
  }

  updateSpeechBubble() {
    // If not in middle of user interaction, refresh dialogue based on style changes
    if (this.mood === 'neutral') {
      this.generateContextualText();
      this.render();
    }
  }
}
