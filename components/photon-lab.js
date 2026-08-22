// EquiliPrism Photon Path Lab Component
import { adaptiveEngine } from '../hooks/adaptive-engine.js';
import { SparkyGuide } from './sparky.js';

export class PhotonLab {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    // Level & Settings
    this.currentLevel = 1;
    this.items = []; // Optical items placed by user: { id, type, x, y, angle, selected }
    this.targets = []; // Active targets: { x, y, r, color, hit }
    this.lasers = []; // Source lasers: { x, y, angle, color }
    this.obstacles = []; // Blocks: { x, y, w, h }
    this.activeTool = null; // 'mirror' | 'lens' | 'prism'
    
    // Interaction states
    this.draggedItem = null;
    this.rotatingItem = null;
    this.dragOffset = { x: 0, y: 0 };
    this.startTime = Date.now();
    this.hintsUsed = 0;

    // Canvas rendering loop
    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;

    this.rayIntersections = [];

    // Bind co-solving listener
    this.boundCoSolve = this.handleCoSolve.bind(this);
    window.addEventListener('sparkyCoSolveStep', this.boundCoSolve);

    this.boundStateChange = () => {
      this.render();
    };
    window.addEventListener('equiliprismStateChanged', this.boundStateChange);
  }

  // Set up level design based on adaptive difficulty
  initLevel() {
    this.startTime = Date.now();
    this.hintsUsed = 0;
    this.items = []; // Clear user items

    const profile = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.profile) || { country: 'US', grade: 4 };
    const grade = profile.grade !== undefined ? profile.grade : 4;
    const level = this.currentLevel; // 1 to 100

    if (grade <= 0) {
      // Preschool/Pre-K & Kindergarten: Simple targeting, no obstacles
      const laserY = 120 + (level * 25) % 180;
      const targetY = 280 - (level * 20) % 180;
      this.lasers = [{ x: 80, y: laserY, angle: 0, color: '#ffffff' }];
      this.targets = [{ x: 500, y: targetY, r: 16, color: '#ffffff', hit: false }];
      this.obstacles = [];
    } else if (grade >= 9 && level <= 10) {
      // High School introductory levels with splitters and color filters
      if (level === 1) {
        // Level 1: Flat Mirror intro
        this.lasers = [{ x: 80, y: 150, angle: 0, color: '#ffffff' }];
        this.targets = [{ x: 500, y: 300, r: 16, color: '#ffffff', hit: false }];
        this.obstacles = [{ x: 260, y: 50, w: 40, h: 200 }];
      } else if (level === 2) {
        // Level 2: Beam Splitter introduction
        this.lasers = [{ x: 80, y: 200, angle: 0, color: '#ffffff' }];
        this.targets = [
          { x: 500, y: 120, r: 16, color: '#ffffff', hit: false },
          { x: 500, y: 280, r: 16, color: '#ffffff', hit: false }
        ];
        this.obstacles = [{ x: 280, y: 150, w: 40, h: 100 }];
      } else if (level === 3) {
        // Level 3: White light split. Requires prism & mirrors
        this.lasers = [{ x: 60, y: 200, angle: 0, color: '#ffffff' }];
        this.targets = [
          { x: 520, y: 80, r: 16, color: '#ef4444', hit: false },
          { x: 520, y: 320, r: 16, color: '#3b82f6', hit: false }
        ];
        this.obstacles = [{ x: 300, y: 120, w: 40, h: 160 }];
      } else if (level === 4) {
        // Level 4: Color Filters introduction
        this.lasers = [{ x: 80, y: 200, angle: 0, color: '#ffffff' }];
        this.targets = [
          { x: 500, y: 100, r: 16, color: '#ef4444', hit: false },
          { x: 500, y: 300, r: 16, color: '#3b82f6', hit: false }
        ];
        this.obstacles = [{ x: 280, y: 150, w: 40, h: 100 }];
      } else if (level === 5) {
        // Level 5: Focus Lens intro
        this.lasers = [{ x: 80, y: 100, angle: 0.2, color: '#ffffff' }];
        this.targets = [{ x: 500, y: 300, r: 16, color: '#ffffff', hit: false }];
        this.obstacles = [
          { x: 280, y: 0, w: 40, h: 170 },
          { x: 280, y: 230, w: 40, h: 170 }
        ];
      } else if (level === 6) {
        // Level 6: Splitter + Color Filter combo
        this.lasers = [{ x: 60, y: 200, angle: 0.1, color: '#ffffff' }];
        this.targets = [
          { x: 500, y: 120, r: 16, color: '#10b981', hit: false },
          { x: 500, y: 280, r: 16, color: '#3b82f6', hit: false }
        ];
        this.obstacles = [{ x: 260, y: 150, w: 40, h: 100 }];
      } else if (level === 7) {
        // Level 7: Triple sensors matching split rays
        this.lasers = [{ x: 60, y: 200, angle: 0, color: '#ffffff' }];
        this.targets = [
          { x: 520, y: 70, r: 16, color: '#ef4444', hit: false },
          { x: 520, y: 200, r: 16, color: '#10b981', hit: false },
          { x: 520, y: 330, r: 16, color: '#3b82f6', hit: false }
        ];
        this.obstacles = [{ x: 320, y: 120, w: 30, h: 160 }];
      } else if (level === 8) {
        // Level 8: Splitter maze
        this.lasers = [{ x: 60, y: 60, angle: 0.1, color: '#ffffff' }];
        this.targets = [
          { x: 120, y: 320, r: 16, color: '#ef4444', hit: false },
          { x: 500, y: 320, r: 16, color: '#3b82f6', hit: false }
        ];
        this.obstacles = [
          { x: 240, y: 0, w: 30, h: 220 },
          { x: 380, y: 120, w: 30, h: 280 }
        ];
      } else if (level === 9) {
        // Level 9: Double filter routing
        this.lasers = [{ x: 60, y: 150, angle: 0.1, color: '#ffffff' }];
        this.targets = [
          { x: 500, y: 100, r: 16, color: '#10b981', hit: false },
          { x: 500, y: 300, r: 16, color: '#3b82f6', hit: false }
        ];
        this.obstacles = [
          { x: 280, y: 0, w: 30, h: 100 },
          { x: 280, y: 300, w: 30, h: 100 },
          { x: 280, y: 150, w: 30, h: 100 }
        ];
      } else {
        // Level 10: High School Ultimate Wave Optics Maze
        this.lasers = [{ x: 60, y: 200, angle: 0, color: '#ffffff' }];
        this.targets = [
          { x: 450, y: 50, r: 16, color: '#ef4444', hit: false },
          { x: 520, y: 200, r: 16, color: '#10b981', hit: false },
          { x: 450, y: 350, r: 16, color: '#3b82f6', hit: false }
        ];
        this.obstacles = [{ x: 200, y: 50, w: 30, h: 300 }];
      }
    } else if (level <= 10) {
      if (level === 1) {
        // Level 1: Single laser, single target. Straight path blocked, requires 1 mirror
        this.lasers = [{ x: 80, y: 150, angle: 0, color: '#ffffff' }];
        this.targets = [{ x: 500, y: 300, r: 16, color: '#ffffff', hit: false }];
        this.obstacles = [
          { x: 260, y: 50, w: 40, h: 200 } // Wall blocking direct horizontal path
        ];
      } else if (level === 2) {
        // Level 2: Maze of obstacles. Requires 2 mirrors or lenses
        this.lasers = [{ x: 50, y: 80, angle: 0.2, color: '#ffffff' }];
        this.targets = [{ x: 540, y: 120, r: 16, color: '#ffffff', hit: false }];
        this.obstacles = [
          { x: 180, y: 0, w: 30, h: 220 },
          { x: 380, y: 120, w: 30, h: 280 }
        ];
      } else if (level === 3) {
        // Level 3: White light split. Requires prism & mirrors to hit color-coded sensors
        this.lasers = [{ x: 60, y: 200, angle: 0, color: '#ffffff' }];
        this.targets = [
          { x: 520, y: 80, r: 16, color: '#ef4444', hit: false }, // Red sensor
          { x: 520, y: 320, r: 16, color: '#3b82f6', hit: false } // Blue sensor
        ];
        this.obstacles = [
          { x: 300, y: 120, w: 40, h: 160 } // Block in middle
        ];
      } else if (level === 4) {
        // Level 4: Focusing Lens introduction
        this.lasers = [{ x: 80, y: 100, angle: 0.2, color: '#ffffff' }];
        this.targets = [{ x: 500, y: 300, r: 16, color: '#ffffff', hit: false }];
        this.obstacles = [
          { x: 280, y: 0, w: 40, h: 170 },
          { x: 280, y: 230, w: 40, h: 170 }
        ];
      } else if (level === 5) {
        // Level 5: Convex Lens + Mirror combo
        this.lasers = [{ x: 80, y: 80, angle: 0, color: '#ffffff' }];
        this.targets = [{ x: 480, y: 320, r: 16, color: '#ffffff', hit: false }];
        this.obstacles = [
          { x: 220, y: 0, w: 40, h: 220 },
          { x: 360, y: 180, w: 40, h: 220 }
        ];
      } else if (level === 6) {
        // Level 6: Prism split + Red ray reflection
        this.lasers = [{ x: 60, y: 80, angle: 0.3, color: '#ffffff' }];
        this.targets = [{ x: 500, y: 340, r: 16, color: '#ef4444', hit: false }];
        this.obstacles = [
          { x: 200, y: 140, w: 100, h: 200 }
        ];
      } else if (level === 7) {
        // Level 7: Triple target sensors (Red, Green, Blue matching split rays)
        this.lasers = [{ x: 60, y: 200, angle: 0, color: '#ffffff' }];
        this.targets = [
          { x: 520, y: 70, r: 16, color: '#ef4444', hit: false },
          { x: 520, y: 200, r: 16, color: '#10b981', hit: false },
          { x: 520, y: 330, r: 16, color: '#3b82f6', hit: false }
        ];
        this.obstacles = [
          { x: 320, y: 120, w: 30, h: 160 }
        ];
      } else if (level === 8) {
        // Level 8: Focused reflection laser maze
        this.lasers = [{ x: 60, y: 60, angle: 0.1, color: '#ffffff' }];
        this.targets = [
          { x: 120, y: 320, r: 16, color: '#ef4444', hit: false },
          { x: 500, y: 320, r: 16, color: '#3b82f6', hit: false }
        ];
        this.obstacles = [
          { x: 240, y: 0, w: 30, h: 220 },
          { x: 380, y: 120, w: 30, h: 280 }
        ];
      } else if (level === 9) {
        // Level 9: Double prism chromatic routing
        this.lasers = [{ x: 60, y: 150, angle: 0.1, color: '#ffffff' }];
        this.targets = [
          { x: 500, y: 100, r: 16, color: '#10b981', hit: false },
          { x: 500, y: 300, r: 16, color: '#3b82f6', hit: false }
        ];
        this.obstacles = [
          { x: 280, y: 0, w: 30, h: 100 },
          { x: 280, y: 300, w: 30, h: 100 },
          { x: 280, y: 150, w: 30, h: 100 }
        ];
      } else {
        // Level 10: The Ultimate Prism Dispersion Maze
        this.lasers = [{ x: 60, y: 200, angle: 0, color: '#ffffff' }];
        this.targets = [
          { x: 450, y: 50, r: 16, color: '#ef4444', hit: false },
          { x: 520, y: 200, r: 16, color: '#10b981', hit: false },
          { x: 450, y: 350, r: 16, color: '#3b82f6', hit: false }
        ];
        this.obstacles = [
          { x: 200, y: 50, w: 30, h: 300 }
        ];
      }
    } else {
      // Procedural Levels 11-100
      let seed = level * 777 + grade * 31;
      const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };

      if (grade <= 0) {
        // Preschool & Kindergarten: direct reflection, no obstacles
        const laserY = 100 + Math.floor(random() * 200);
        const targetY = 100 + Math.floor(random() * 200);
        this.lasers = [{ x: 80, y: laserY, angle: 0, color: '#ffffff' }];
        this.targets = [{ x: 500, y: targetY, r: 16, color: '#ffffff', hit: false }];
        this.obstacles = [];
      }
      else if (grade <= 2) {
        // Grades 1-2: Simple reflection
        const laserY = 100 + Math.floor(random() * 200);
        const targetY = 100 + Math.floor(random() * 200);
        this.lasers = [{ x: 60, y: laserY, angle: 0, color: '#ffffff' }];
        this.targets = [{ x: 520, y: targetY, r: 16, color: '#ffffff', hit: false }];
        
        // Single central wall blocking direct path
        const wallH = 150 + Math.floor(random() * 100);
        const wallY = random() > 0.5 ? 0 : 400 - wallH;
        this.obstacles = [{ x: 260 + Math.floor(random() * 40), y: wallY, w: 35, h: wallH }];
      } 
      else if (grade <= 4) {
        // Grades 3-4: Refraction and bending with lenses
        const laserY = 80 + Math.floor(random() * 240);
        const lAngle = -0.15 + random() * 0.3;
        this.lasers = [{ x: 60, y: laserY, angle: lAngle, color: '#ffffff' }];
        
        if (level % 2 === 0) {
          this.targets = [
            { x: 520, y: 100 + Math.floor(random() * 80), r: 16, color: '#ffffff', hit: false },
            { x: 520, y: 220 + Math.floor(random() * 80), r: 16, color: '#ffffff', hit: false }
          ];
        } else {
          this.targets = [{ x: 520, y: 150 + Math.floor(random() * 100), r: 16, color: '#ffffff', hit: false }];
        }

        const wall1H = 120 + Math.floor(random() * 60);
        const wall2H = 120 + Math.floor(random() * 60);
        this.obstacles = [
          { x: 200, y: 0, w: 35, h: wall1H },
          { x: 360, y: 400 - wall2H, w: 35, h: wall2H }
        ];
      } 
      else if (grade <= 6) {
        // Grades 5-6: Prisms and splitting
        const laserY = 150 + Math.floor(random() * 100);
        this.lasers = [{ x: 60, y: laserY, angle: 0, color: '#ffffff' }];
        
        this.targets = [
          { x: 520, y: 60 + Math.floor(random() * 80), r: 16, color: '#ef4444', hit: false },
          { x: 520, y: 260 + Math.floor(random() * 80), r: 16, color: '#3b82f6', hit: false }
        ];

        const wallH = 140 + Math.floor(random() * 60);
        this.obstacles = [
          { x: 280, y: 100 + Math.floor(random() * 50), w: 40, h: wallH }
        ];
      } 
      else if (grade <= 8) {
        // Grades 7-8: Advanced multi-colored maze
        const laserY = 100 + Math.floor(random() * 200);
        const lAngle = -0.2 + random() * 0.4;
        this.lasers = [{ x: 60, y: laserY, angle: lAngle, color: '#ffffff' }];
        
        this.targets = [
          { x: 520, y: 60 + Math.floor(random() * 60), r: 16, color: '#ef4444', hit: false },
          { x: 520, y: 170 + Math.floor(random() * 60), r: 16, color: '#10b981', hit: false },
          { x: 520, y: 280 + Math.floor(random() * 60), r: 16, color: '#3b82f6', hit: false }
        ];

        this.obstacles = [
          { x: 200, y: 0, w: 30, h: 140 + Math.floor(random() * 60) },
          { x: 300, y: 180 + Math.floor(random() * 60), w: 30, h: 180 },
          { x: 400, y: 0, w: 30, h: 120 + Math.floor(random() * 60) }
        ];
      }
      else {
        // High School Grades 9-12: Advanced wave optics (beam splitters, filters, prisms)
        const laserY = 100 + Math.floor(random() * 200);
        this.lasers = [{ x: 60, y: laserY, angle: 0, color: '#ffffff' }];
        
        if (level % 3 === 0) {
          this.targets = [
            { x: 520, y: 80, r: 16, color: '#ef4444', hit: false },
            { x: 520, y: 200, r: 16, color: '#10b981', hit: false },
            { x: 520, y: 320, r: 16, color: '#3b82f6', hit: false }
          ];
        } else if (level % 3 === 1) {
          this.targets = [
            { x: 520, y: 100, r: 16, color: '#ef4444', hit: false },
            { x: 520, y: 300, r: 16, color: '#3b82f6', hit: false }
          ];
        } else {
          this.targets = [
            { x: 520, y: 150 + Math.floor(random() * 100), r: 16, color: '#10b981', hit: false }
          ];
        }

        this.obstacles = [
          { x: 220, y: 0, w: 30, h: 120 + Math.floor(random() * 80) },
          { x: 380, y: 200 - Math.floor(random() * 50), w: 30, h: 200 }
        ];
      }
    }

    // Inform Sparky
    window.dispatchEvent(new CustomEvent('labContextChanged', {
      detail: { labId: 'photon-lab', level: this.currentLevel }
    }));
  }

  // Co-solving helper: Triggered by Sparky
  handleCoSolve() {
    if (this.activeLab !== 'photon-lab') return;

    this.clearHighlights();

    const profile = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.profile) || { country: 'US', grade: 4 };
    const grade = profile.grade !== undefined ? profile.grade : 4;

    if (this.currentLevel === 1) {
      this.hintGhost = { type: 'mirror', x: 280, y: 300, angle: -Math.PI / 4 };
      this.triggerCoSolveAlert("Try placing a <strong>Flat Mirror</strong> at the glowing outline $(280, 300)$ and angling it to $-45^\\circ$ (or $315^\\circ$). Mirrors reflect light at the same angle it hits. This will bounce the laser beam down to bypass the wall!", "mirror");
    } else if (this.currentLevel === 2) {
      if (grade >= 9) {
        this.hintGhost = { type: 'splitter', x: 200, y: 200, angle: 0 };
        this.triggerCoSolveAlert("Try placing a <strong>Beam Splitter</strong> at $(200, 200)$ to split the beam into two parallel paths to hit both targets!", "splitter");
      } else {
        this.hintGhost = { type: 'mirror', x: 280, y: 280, angle: -Math.PI / 4 };
        this.triggerCoSolveAlert("Try placing a <strong>Flat Mirror</strong> in the lower pathway at $(280, 280)$ and rotating it to $-45^\\circ$. This bends the beam around the first wall so you can route it up towards the sensor!", "mirror");
      }
    } else if (this.currentLevel === 3) {
      this.hintGhost = { type: 'prism', x: 200, y: 200, angle: 0 };
      this.triggerCoSolveAlert("Try placing a <strong>Triangular Prism</strong> at $(200, 200)$ directly in the path of the white laser beam. Prisms refract wavelengths differently, splitting the white laser into distinct Red and Blue rays!", "prism");
    } else if (this.currentLevel === 4) {
      if (grade >= 9) {
        this.hintGhost = { type: 'filter-red', x: 200, y: 150, angle: 0 };
        this.triggerCoSolveAlert("Try placing a <strong>Red Filter</strong> in the upper path to filter the light so it only hits the red target!", "filter-red");
      } else {
        this.hintGhost = { type: 'lens', x: 200, y: 120, angle: 0 };
        this.triggerCoSolveAlert("Try placing a <strong>Focusing Lens</strong> at $(200, 120)$ to help route the divergent beam through the narrow opening between the two walls!", "lens");
      }
    } else if (this.currentLevel === 5) {
      this.hintGhost = { type: 'lens', x: 150, y: 80, angle: 0 };
      this.triggerCoSolveAlert("Try placing a <strong>Focusing Lens</strong> at $(150, 80)$ so the beam is aligned perfectly before you mirror-bounce it down to the target!", "lens");
    } else if (this.currentLevel === 6) {
      if (grade >= 9) {
        this.hintGhost = { type: 'splitter', x: 180, y: 200, angle: 0 };
        this.triggerCoSolveAlert("Try placing a <strong>Beam Splitter</strong> at $(180, 200)$ to split the incoming light to both green and blue channels!", "splitter");
      } else {
        this.hintGhost = { type: 'prism', x: 150, y: 110, angle: 0.1 };
        this.triggerCoSolveAlert("Try placing a <strong>Triangular Prism</strong> at $(150, 110)$ to refract and split the white light, sending the Red wave towards the bottom path!", "prism");
      }
    } else if (this.currentLevel === 7) {
      this.hintGhost = { type: 'prism', x: 180, y: 200, angle: 0 };
      this.triggerCoSolveAlert("Try placing a <strong>Triangular Prism</strong> at $(180, 200)$ directly in the center of the beam to split the white light into Red, Green, and Blue rays simultaneously!", "prism");
    } else if (this.currentLevel === 8) {
      this.hintGhost = { type: 'mirror', x: 150, y: 70, angle: -Math.PI / 4 };
      this.triggerCoSolveAlert("Try placing a <strong>Flat Mirror</strong> at $(150, 70)$ angled at $-45^\\circ$ to redirect the beam down the first segment of the maze!", "mirror");
    } else if (this.currentLevel === 9) {
      this.hintGhost = { type: 'prism', x: 180, y: 160, angle: 0 };
      this.triggerCoSolveAlert("Try placing a <strong>Triangular Prism</strong> at $(180, 160)$ to split the rays so they can bypass the central concrete dividers!", "prism");
    } else if (this.currentLevel === 10) {
      this.hintGhost = { type: 'prism', x: 140, y: 200, angle: 0 };
      this.triggerCoSolveAlert("Try placing a <strong>Triangular Prism</strong> at $(140, 200)$ to disperse the white light into three paths that can bypass the central blocker wall!", "prism");
    } else {
      if (grade <= 0) {
        this.hintGhost = { type: 'mirror', x: 280, y: 200, angle: -Math.PI / 4 };
        this.triggerCoSolveAlert("Try placing a <strong>Flat Mirror</strong> at $(280, 200)$ to bounce the laser light towards the target sensor!", "mirror");
      } else if (grade <= 2) {
        this.hintGhost = { type: 'mirror', x: 260, y: 200, angle: -Math.PI / 4 };
        this.triggerCoSolveAlert("Try placing a <strong>Flat Mirror</strong> at $(260, 200)$ to bounce the laser light around the obstacle wall!", "mirror");
      } else if (grade <= 4) {
        this.hintGhost = { type: 'lens', x: 280, y: 200, angle: 0 };
        this.triggerCoSolveAlert("Try placing a <strong>Focusing Lens</strong> at $(280, 200)$ to help bend and route the light rays through the narrow gaps!", "lens");
      } else if (grade <= 6) {
        this.hintGhost = { type: 'prism', x: 200, y: 200, angle: 0 };
        this.triggerCoSolveAlert("Try placing a <strong>Triangular Prism</strong> at $(200, 200)$ to split the white laser into distinct Red and Blue color rays!", "prism");
      } else if (grade <= 8) {
        this.hintGhost = { type: 'prism', x: 180, y: 200, angle: 0 };
        this.triggerCoSolveAlert("Try placing a <strong>Triangular Prism</strong> at $(180, 200)$ to split the rays, then use <strong>Flat Mirrors</strong> to route them to the color-coded sensors!", "prism");
      } else {
        if (level % 2 === 0) {
          this.hintGhost = { type: 'splitter', x: 180, y: 200, angle: 0 };
          this.triggerCoSolveAlert("Try placing a <strong>Beam Splitter</strong> at $(180, 200)$ to split the laser ray into two parallel beams offset by 30px!", "splitter");
        } else {
          this.hintGhost = { type: 'filter-red', x: 300, y: 200, angle: 0 };
          this.triggerCoSolveAlert("Try placing a <strong>Red Color Filter</strong> at $(300, 200)$ to select red light and absorb other frequencies!", "filter-red");
        }
      }
    }
  }

  triggerCoSolveAlert(message, type) {
    // Highlight the tool item in toolbox
    const tool = this.container.querySelector(`.tool-item[data-type="${type}"]`);
    if (tool) tool.classList.add('glow-highlight');

    // Update Sparky text
    const sparkyContainer = document.getElementById('sparky-widget-container');
    if (sparkyContainer) {
      const bubble = sparkyContainer.querySelector('.sparky-bubble');
      if (bubble) {
        bubble.innerHTML = `<span style="color: hsl(var(--accent-cyan)); font-weight: 600;">Sparky's Guide:</span> ${message}`;
      }
    }
    this.draw();
  }

  clearHighlights() {
    this.hintGhost = null;
    this.container.querySelectorAll('.glow-highlight').forEach(el => el.classList.remove('glow-highlight'));
  }

  // --- Real-time ray tracing calculations ---
  traceRays() {
    // Reset target hits
    this.targets.forEach(t => t.hit = false);

    const hasGhost = !!this.hintGhost;
    if (hasGhost) {
      this.items.push({
        id: 'ghost-temp',
        type: this.hintGhost.type,
        x: this.hintGhost.x,
        y: this.hintGhost.y,
        angle: this.hintGhost.angle,
        selected: false
      });
    }

    this.lasers.forEach(laser => {
      this.castRay(laser.x, laser.y, Math.cos(laser.angle), Math.sin(laser.angle), laser.color, 0);
    });

    if (hasGhost) {
      this.items = this.items.filter(i => i.id !== 'ghost-temp');
    }

    // Check if all targets are hit, but only verify solve if no ghost was active!
    const allHit = this.targets.every(t => t.hit);
    if (allHit && this.targets.length > 0 && !hasGhost) {
      const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
      adaptiveEngine.logPuzzleAttempt('photon-lab', this.currentLevel, true, timeSpent, this.hintsUsed);
      
      window.dispatchEvent(new CustomEvent('puzzleSolved'));
      
      setTimeout(() => {
        this.showLevelSuccessModal();
      }, 1000);
    }
  }

  // Snell's Law Vector Refraction
  // I = (dx, dy) is the incoming direction unit vector
  // N = (nx, ny) is the outward-pointing normal unit vector
  // eta is the refractive index ratio (n_from / n_to)
  refract(dx, dy, nx, ny, eta) {
    let dot = dx * nx + dy * ny;
    let actualNx = nx;
    let actualNy = ny;
    
    // If dot > 0, the ray is traveling in the same direction as the normal (exiting the medium)
    // We flip the normal to point against the ray for the standard formula
    if (dot > 0) {
      actualNx = -nx;
      actualNy = -ny;
      dot = -dot;
    }
    
    const k = 1.0 - eta * eta * (1.0 - dot * dot);
    if (k < 0.0) {
      // Total internal reflection
      return null;
    }
    
    const rx = eta * dx - (eta * dot + Math.sqrt(k)) * actualNx;
    const ry = eta * dy - (eta * dot + Math.sqrt(k)) * actualNy;
    
    // Normalize output vector
    const len = Math.hypot(rx, ry);
    return { x: rx / len, y: ry / len };
  }

  castRay(startX, startY, dx, dy, color, depth) {
    if (depth > 12) return; // Prevent infinite loops

    let closestT = Infinity;
    let hitObject = null;
    let hitPoint = { x: 0, y: 0 };
    let normal = { x: 0, y: 0 };

    // Check collision with boundary/edges
    const borderPoints = [
      this.getLineIntersection(startX, startY, dx, dy, 0, 0, 600, 0), // Top
      this.getLineIntersection(startX, startY, dx, dy, 600, 0, 600, 400), // Right
      this.getLineIntersection(startX, startY, dx, dy, 600, 400, 0, 400), // Bottom
      this.getLineIntersection(startX, startY, dx, dy, 0, 400, 0, 0) // Left
    ];

    borderPoints.forEach(p => {
      if (p && p.t > 0.001 && p.t < closestT) {
        closestT = p.t;
        hitPoint = { x: p.x, y: p.y };
        hitObject = { type: 'border' };
      }
    });

    // Check collision with Obstacle Boxes
    this.obstacles.forEach(obs => {
      const edges = [
        this.getLineIntersection(startX, startY, dx, dy, obs.x, obs.y, obs.x + obs.w, obs.y), // Top
        this.getLineIntersection(startX, startY, dx, dy, obs.x + obs.w, obs.y, obs.x + obs.w, obs.y + obs.h), // Right
        this.getLineIntersection(startX, startY, dx, dy, obs.x + obs.w, obs.y + obs.h, obs.x, obs.y + obs.h), // Bottom
        this.getLineIntersection(startX, startY, dx, dy, obs.x, obs.y + obs.h, obs.x, obs.y) // Left
      ];

      edges.forEach((p, idx) => {
        if (p && p.t > 0.001 && p.t < closestT) {
          closestT = p.t;
          hitPoint = { x: p.x, y: p.y };
          hitObject = { type: 'obstacle' };
        }
      });
    });

    // Check collision with Sensors (Targets)
    this.targets.forEach(tar => {
      const p = this.getCircleIntersection(startX, startY, dx, dy, tar.x, tar.y, tar.r);
      if (p && p.t > 0.001 && p.t < closestT) {
        closestT = p.t;
        hitPoint = { x: p.x, y: p.y };
        hitObject = { type: 'target', target: tar };
      }
    });

    // Check collision with User Devices (Mirrors, Lenses, Prisms, Splitters, Filters)
    this.items.forEach(item => {
      if (item.type === 'mirror') {
        const halfLen = 35;
        const mx1 = item.x - halfLen * Math.sin(item.angle);
        const my1 = item.y + halfLen * Math.cos(item.angle);
        const mx2 = item.x + halfLen * Math.sin(item.angle);
        const my2 = item.y - halfLen * Math.cos(item.angle);

        const p = this.getLineIntersection(startX, startY, dx, dy, mx1, my1, mx2, my2);
        if (p && p.t > 0.001 && p.t < closestT) {
          closestT = p.t;
          hitPoint = { x: p.x, y: p.y };
          hitObject = item;
          normal = { x: -Math.cos(item.angle), y: -Math.sin(item.angle) };
        }
      } else if (item.type === 'splitter') {
        const halfLen = 35;
        const mx1 = item.x - halfLen * Math.sin(item.angle);
        const my1 = item.y + halfLen * Math.cos(item.angle);
        const mx2 = item.x + halfLen * Math.sin(item.angle);
        const my2 = item.y - halfLen * Math.cos(item.angle);

        const p = this.getLineIntersection(startX, startY, dx, dy, mx1, my1, mx2, my2);
        if (p && p.t > 0.001 && p.t < closestT) {
          closestT = p.t;
          hitPoint = { x: p.x, y: p.y };
          hitObject = item;
          normal = { x: -Math.cos(item.angle), y: -Math.sin(item.angle) };
        }
      } else if (item.type === 'prism') {
        const r = 32;
        const tx1 = item.x + r * Math.cos(-Math.PI/2 + item.angle);
        const ty1 = item.y + r * Math.sin(-Math.PI/2 + item.angle);
        const tx2 = item.x + r * Math.cos(Math.PI/6 + item.angle);
        const ty2 = item.y + r * Math.sin(Math.PI/6 + item.angle);
        const tx3 = item.x + r * Math.cos(5*Math.PI/6 + item.angle);
        const ty3 = item.y + r * Math.sin(5*Math.PI/6 + item.angle);

        const edges = [
          this.getLineIntersection(startX, startY, dx, dy, tx1, ty1, tx2, ty2),
          this.getLineIntersection(startX, startY, dx, dy, tx2, ty2, tx3, ty3),
          this.getLineIntersection(startX, startY, dx, dy, tx3, ty3, tx1, ty1)
        ];

        edges.forEach((p, idx) => {
          if (p && p.t > 0.001 && p.t < closestT) {
            closestT = p.t;
            hitPoint = { x: p.x, y: p.y };
            hitObject = item;
            const sx = idx === 0 ? tx1 : (idx === 1 ? tx2 : tx3);
            const sy = idx === 0 ? ty1 : (idx === 1 ? ty2 : ty3);
            const ex = idx === 0 ? tx2 : (idx === 1 ? tx3 : tx1);
            const ey = idx === 0 ? ty2 : (idx === 1 ? ty3 : ty1);
            const mx = (sx + ex) / 2;
            const my = (sy + ey) / 2;
            let nx = mx - item.x;
            let ny = my - item.y;
            const len = Math.hypot(nx, ny);
            normal = { x: nx / len, y: ny / len };
          }
        });
      } else if (item.type === 'lens' || item.type.startsWith('filter-')) {
        const p = this.getCircleIntersection(startX, startY, dx, dy, item.x, item.y, 25);
        if (p && p.t > 0.001 && p.t < closestT) {
          closestT = p.t;
          hitPoint = { x: p.x, y: p.y };
          hitObject = item;
          const len = Math.hypot(hitPoint.x - item.x, hitPoint.y - item.y);
          normal = { x: (hitPoint.x - item.x) / len, y: (hitPoint.y - item.y) / len };
        }
      }
    });

    // Draw the traced ray segment
    if (closestT < Infinity) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(hitPoint.x, hitPoint.y);
      this.ctx.strokeStyle = color;
      
      const style = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.cognitiveStyle) || 'visualizer';
      this.ctx.lineWidth = color === '#ffffff' ? (style === 'visualizer' ? 4.5 : 3.5) : (style === 'visualizer' ? 3.5 : 2.5);
      
      // Glow shadow
      this.ctx.shadowBlur = style === 'visualizer' ? 16 : 8;
      this.ctx.shadowColor = color;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0; // Reset glow

      // Handle hit behaviors
      if (hitObject.type === 'target') {
        const targetColor = hitObject.target.color;
        if (targetColor === '#ffffff' || color === '#ffffff' || color === targetColor) {
          hitObject.target.hit = true;
        }
      } else if (hitObject.type === 'mirror') {
        const dot = dx * normal.x + dy * normal.y;
        const rx = dx - 2 * dot * normal.x;
        const ry = dy - 2 * dot * normal.y;
        
        if (style === 'logician') {
          this.rayIntersections.push({ x: hitPoint.x, y: hitPoint.y, nx: normal.x, ny: normal.y, type: 'mirror' });
        }

        this.castRay(hitPoint.x + rx * 0.05, hitPoint.y + ry * 0.05, rx, ry, color, depth + 1);
      } else if (hitObject.type === 'splitter') {
        const tx = -Math.sin(hitObject.angle);
        const ty = Math.cos(hitObject.angle);

        if (style === 'logician') {
          this.rayIntersections.push({ x: hitPoint.x, y: hitPoint.y, nx: normal.x, ny: normal.y, type: 'splitter' });
        }

        this.castRay(hitPoint.x + dx * 0.05, hitPoint.y + dy * 0.05, dx, dy, color, depth + 1);
        this.castRay(hitPoint.x + tx * 30 + dx * 0.05, hitPoint.y + ty * 30 + dy * 0.05, dx, dy, color, depth + 1);
      } else if (hitObject.type.startsWith('filter-')) {
        const filterType = hitObject.type;
        let filterColor = '';
        if (filterType === 'filter-red') filterColor = '#ef4444';
        else if (filterType === 'filter-green') filterColor = '#10b981';
        else if (filterType === 'filter-blue') filterColor = '#3b82f6';

        if (style === 'logician') {
          this.rayIntersections.push({ x: hitPoint.x, y: hitPoint.y, nx: normal.x, ny: normal.y, type: filterType });
        }

        if (color === '#ffffff' || color === filterColor) {
          this.castRay(hitPoint.x + dx * 0.05, hitPoint.y + dy * 0.05, dx, dy, filterColor, depth + 1);
        }
      } else if (hitObject.type === 'prism') {
        const dot = dx * normal.x + dy * normal.y;
        const isEntering = dot < 0;

        if (style === 'logician') {
          this.rayIntersections.push({ x: hitPoint.x, y: hitPoint.y, nx: normal.x, ny: normal.y, type: 'prism' });
        }

        if (isEntering) {
          if (color === '#ffffff') {
            const etaRed = 1.0 / 1.45;
            const refRed = this.refract(dx, dy, normal.x, normal.y, etaRed);
            if (refRed) {
              this.castRay(hitPoint.x + refRed.x * 0.5, hitPoint.y + refRed.y * 0.5, refRed.x, refRed.y, '#ef4444', depth + 1);
            }

            const etaGreen = 1.0 / 1.50;
            const refGreen = this.refract(dx, dy, normal.x, normal.y, etaGreen);
            if (refGreen) {
              this.castRay(hitPoint.x + refGreen.x * 0.5, hitPoint.y + refGreen.y * 0.5, refGreen.x, refGreen.y, '#10b981', depth + 1);
            }
            
            const etaBlue = 1.0 / 1.55;
            const refBlue = this.refract(dx, dy, normal.x, normal.y, etaBlue);
            if (refBlue) {
              this.castRay(hitPoint.x + refBlue.x * 0.5, hitPoint.y + refBlue.y * 0.5, refBlue.x, refBlue.y, '#3b82f6', depth + 1);
            }
          } else {
            const nVal = color === '#ef4444' ? 1.45 : (color === '#10b981' ? 1.50 : 1.55);
            const ref = this.refract(dx, dy, normal.x, normal.y, 1.0 / nVal);
            if (ref) {
              this.castRay(hitPoint.x + ref.x * 0.5, hitPoint.y + ref.y * 0.5, ref.x, ref.y, color, depth + 1);
            }
          }
        } else {
          const nVal = color === '#ef4444' ? 1.45 : (color === '#10b981' ? 1.50 : 1.55);
          const ref = this.refract(dx, dy, normal.x, normal.y, nVal);
          if (ref) {
            this.castRay(hitPoint.x + ref.x * 0.5, hitPoint.y + ref.y * 0.5, ref.x, ref.y, color, depth + 1);
          } else {
            const rx = dx - 2 * dot * normal.x;
            const ry = dy - 2 * dot * normal.y;
            this.castRay(hitPoint.x + rx * 0.5, hitPoint.y + ry * 0.5, rx, ry, color, depth + 1);
          }
        }
      } else if (hitObject.type === 'lens') {
        const dot = dx * normal.x + dy * normal.y;
        const isEntering = dot < 0;
        const nVal = 1.5;
        
        if (style === 'logician') {
          this.rayIntersections.push({ x: hitPoint.x, y: hitPoint.y, nx: normal.x, ny: normal.y, type: 'lens' });
        }

        if (isEntering) {
          const ref = this.refract(dx, dy, normal.x, normal.y, 1.0 / nVal);
          if (ref) {
            this.castRay(hitPoint.x + ref.x * 0.5, hitPoint.y + ref.y * 0.5, ref.x, ref.y, color, depth + 1);
          }
        } else {
          const ref = this.refract(dx, dy, normal.x, normal.y, nVal);
          if (ref) {
            this.castRay(hitPoint.x + ref.x * 0.5, hitPoint.y + ref.y * 0.5, ref.x, ref.y, color, depth + 1);
          } else {
            const rx = dx - 2 * dot * normal.x;
            const ry = dy - 2 * dot * normal.y;
            this.castRay(hitPoint.x + rx * 0.5, hitPoint.y + ry * 0.5, rx, ry, color, depth + 1);
          }
        }
      }
    }
  }

  getLineIntersection(x1, y1, dx, dy, x3, y3, x4, y4) {
    const x2 = x1 + dx;
    const y2 = y1 + dy;
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && u >= 0 && u <= 1) {
      return { t, x: x1 + t * dx, y: y1 + t * dy };
    }
    return null;
  }

  getCircleIntersection(x1, y1, dx, dy, cx, cy, r) {
    const ox = x1 - cx;
    const oy = y1 - cy;
    
    const a = dx*dx + dy*dy;
    const b = 2 * (ox*dx + oy*dy);
    const c = ox*ox + oy*oy - r*r;
    
    const disc = b*b - 4*a*c;
    if (disc < 0) return null;
    
    const t1 = (-b - Math.sqrt(disc)) / (2*a);
    const t2 = (-b + Math.sqrt(disc)) / (2*a);
    
    if (t1 > 0.001) return { t: t1, x: x1 + t1*dx, y: y1 + t1*dy };
    if (t2 > 0.001) return { t: t2, x: x1 + t2*dx, y: y1 + t2*dy };
    return null;
  }

  showLevelSuccessModal() {
    if (document.querySelector('.modal-overlay')) return;

    const isMaster = adaptiveEngine.hasCompletedAllPostOriginalGrades();
    const highest = adaptiveEngine.state.stats.scienceLevelsCompleted || 0;
    let maxLevel = 3;
    if (isMaster) {
      maxLevel = 100;
    } else if (highest >= 10) {
      maxLevel = Math.min(100, highest + 5);
    } else if (highest >= 3) {
      maxLevel = 10;
    } else if ((adaptiveEngine.state.stats.scienceLevelsCompletedList || []).length >= 3) {
      maxLevel = 10;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal-content glass-card" style="text-align: center;">
        <h2 style="font-size: 2rem; color: hsl(var(--accent-green)); margin-bottom: 1rem;">✦ Path Connected! ✦</h2>
        <p style="margin-bottom: 1.5rem; line-height: 1.6;">Awesome refraction design! All light waves hit the target nodes successfully. You've solved Level ${this.currentLevel}!</p>
        <div class="modal-buttons" style="justify-content: center;">
          ${this.currentLevel < maxLevel ? `
            <button class="puzzle-btn primary" id="next-level-btn" style="padding: 0.8rem 2rem; font-size: 1rem;">Next Puzzle</button>
          ` : `
            <button class="puzzle-btn primary" id="next-level-btn" style="padding: 0.8rem 2rem; font-size: 1rem; background: linear-gradient(to right, hsl(var(--accent-pink)), hsl(var(--accent-violet)));">Dashboard Menu</button>
          `}
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#next-level-btn').addEventListener('click', () => {
      modal.remove();
      if (this.currentLevel < maxLevel) {
        this.currentLevel++;
        this.initLevel();
        this.draw();
      } else {
        window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'dashboard' }));
      }
    });
  }

  bindCanvasEvents() {
    this.container.querySelectorAll('.tool-item').forEach(tool => {
      tool.addEventListener('click', () => {
        this.container.querySelectorAll('.tool-item').forEach(t => t.classList.remove('active'));
        this.activeTool = tool.getAttribute('data-type');
        tool.classList.add('active');
      });
    });

    this.container.querySelector('#reset-puzzle-btn').addEventListener('click', () => {
      this.initLevel();
      this.draw();
    });



    this.container.querySelectorAll('.level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentLevel = parseInt(btn.getAttribute('data-level'));
        this.initLevel();
        this.draw();
      });
    });

    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

      if (this.activeTool) {
        const newItem = {
          id: `${this.activeTool}-${Date.now()}`,
          type: this.activeTool,
          x: mouseX,
          y: mouseY,
          angle: 0,
          selected: true
        };
        this.items.forEach(i => i.selected = false);
        this.items.push(newItem);
        
        this.activeTool = null;
        this.clearHighlights();
        
        this.draggedItem = newItem;
        this.dragOffset = { x: 0, y: 0 };
        this.draw();
        return;
      }

      const selected = this.items.find(i => i.selected);
      if (selected) {
        const handleX = selected.x + 45 * Math.cos(selected.angle);
        const handleY = selected.y + 45 * Math.sin(selected.angle);
        if (Math.hypot(mouseX - handleX, mouseY - handleY) < 12) {
          this.rotatingItem = selected;
          return;
        }
      }

      let clickedItem = null;
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        if (Math.hypot(mouseX - item.x, mouseY - item.y) < 25) {
          clickedItem = item;
          break;
        }
      }

      if (clickedItem) {
        this.items.forEach(i => i.selected = false);
        clickedItem.selected = true;
        this.draggedItem = clickedItem;
        this.dragOffset = { x: mouseX - clickedItem.x, y: mouseY - clickedItem.y };
      } else {
        this.items.forEach(i => i.selected = false);
      }

      this.draw();
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

      if (this.draggedItem) {
        this.draggedItem.x = Math.max(20, Math.min(580, mouseX - this.dragOffset.x));
        this.draggedItem.y = Math.max(20, Math.min(380, mouseY - this.dragOffset.y));
        this.requestDraw();
      } else if (this.rotatingItem) {
        const dx = mouseX - this.rotatingItem.x;
        const dy = mouseY - this.rotatingItem.y;
        this.rotatingItem.angle = Math.atan2(dy, dx);
        this.requestDraw();
      }
    });

    const stopInteraction = () => {
      this.draggedItem = null;
      this.rotatingItem = null;
    };

    this.canvas.addEventListener('mouseup', stopInteraction);
    this.canvas.addEventListener('mouseleave', stopInteraction);

    const trashBtn = this.container.querySelector('#delete-selected-btn');
    if (trashBtn) {
      trashBtn.addEventListener('click', () => {
        this.items = this.items.filter(i => !i.selected);
        this.draw();
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, 600, 400);

    // 1. Draw Grid lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;
    for (let x = 40; x < 600; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, 400);
      this.ctx.stroke();
    }
    for (let y = 40; y < 400; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(600, y);
      this.ctx.stroke();
    }

    const style = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.cognitiveStyle) || 'visualizer';
    if (style === 'builder') {
      // Threaded Optical Breadboard screw grid holes
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let x = 20; x < 600; x += 20) {
        for (let y = 20; y < 400; y += 20) {
          this.ctx.beginPath();
          this.ctx.arc(x, y, 1.2, 0, 2 * Math.PI);
          this.ctx.fill();
        }
      }
    } else if (style === 'logician') {
      // Coordinate labels for formal analysis
      this.ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      this.ctx.font = '8px monospace';
      this.ctx.textBaseline = 'top';
      this.ctx.textAlign = 'left';
      for (let x = 80; x < 600; x += 80) {
        this.ctx.fillText(`x:${x}`, x + 2, 4);
      }
      for (let y = 80; y < 400; y += 80) {
        this.ctx.fillText(`y:${y}`, 4, y + 2);
      }
    }

    // 2. Draw Obstacles (Walls)
    this.ctx.fillStyle = '#1e293b';
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 2;
    this.obstacles.forEach(obs => {
      this.ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      this.ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      this.ctx.lineWidth = 1;
      for (let offset = 10; offset < obs.w + obs.h; offset += 15) {
        this.ctx.beginPath();
        this.ctx.moveTo(obs.x + Math.max(0, offset - obs.h), obs.y + Math.min(obs.h, offset));
        this.ctx.lineTo(obs.x + Math.min(obs.w, offset), obs.y + Math.max(0, offset - obs.w));
        this.ctx.stroke();
      }
    });

    // 3. Draw Lasers (Source)
    this.lasers.forEach(laser => {
      this.ctx.save();
      this.ctx.translate(laser.x, laser.y);
      this.ctx.rotate(laser.angle);
      
      this.ctx.fillStyle = '#0ea5e9';
      this.ctx.fillRect(-24, -10, 24, 20);
      
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.fillRect(0, -6, 8, 12);
      
      this.ctx.fillStyle = '#1e3a8a';
      this.ctx.fillRect(-28, -8, 4, 16);
      
      this.ctx.restore();
    });

    // 4. Trace the light beams
    this.rayIntersections = [];
    this.traceRays();

    // 5. Draw Targets (Sensors)
    this.targets.forEach(tar => {
      this.ctx.beginPath();
      this.ctx.arc(tar.x, tar.y, tar.r, 0, 2 * Math.PI);
      this.ctx.fillStyle = tar.hit ? tar.color : 'rgba(255, 255, 255, 0.03)';
      this.ctx.fill();
      this.ctx.strokeStyle = tar.color;
      this.ctx.lineWidth = 3;
      
      if (tar.hit) {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = tar.color;
      }
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      this.ctx.beginPath();
      this.ctx.arc(tar.x, tar.y, 5, 0, 2*Math.PI);
      this.ctx.fillStyle = tar.hit ? '#ffffff' : 'rgba(255, 255, 255, 0.1)';
      this.ctx.fill();
    });

    // 6. Draw User Optical Devices
    this.items.forEach(item => {
      this.ctx.save();
      this.ctx.translate(item.x, item.y);
      this.ctx.rotate(item.angle);

      if (item.type === 'mirror') {
        this.ctx.fillStyle = '#475569';
        this.ctx.fillRect(-5, -35, 10, 70);
        this.ctx.fillStyle = '#06b6d4';
        this.ctx.fillRect(1, -33, 3, 66);
      } else if (item.type === 'splitter') {
        this.ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
        this.ctx.fillRect(-8, -35, 16, 70);
        this.ctx.strokeStyle = '#06b6d4';
        this.ctx.lineWidth = 2.5;
        this.ctx.strokeRect(-8, -35, 16, 70);
        
        // Grid lines inside
        this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        this.ctx.lineWidth = 1;
        for (let val = -25; val <= 25; val += 10) {
          this.ctx.beginPath();
          this.ctx.moveTo(-8, val);
          this.ctx.lineTo(8, val);
          this.ctx.stroke();
        }
      } else if (item.type.startsWith('filter-')) {
        const filterType = item.type;
        let strokeColor = '';
        let fillStyle = '';
        if (filterType === 'filter-red') {
          strokeColor = '#ef4444';
          fillStyle = 'rgba(239, 68, 68, 0.25)';
        } else if (filterType === 'filter-green') {
          strokeColor = '#10b981';
          fillStyle = 'rgba(16, 185, 129, 0.25)';
        } else if (filterType === 'filter-blue') {
          strokeColor = '#3b82f6';
          fillStyle = 'rgba(59, 130, 246, 0.25)';
        }

        // Tinted circular filter lens
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 25, 0, 2 * Math.PI);
        this.ctx.fillStyle = fillStyle;
        this.ctx.fill();
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Metal filter rim holder
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 23, 0, 2 * Math.PI);
        this.ctx.stroke();

        // Gloss reflection line
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(-5, -5, 12, Math.PI, 1.5 * Math.PI);
        this.ctx.stroke();
      } else if (item.type === 'prism') {
        this.ctx.beginPath();
        const r = 32;
        this.ctx.moveTo(r * Math.cos(-Math.PI/2), r * Math.sin(-Math.PI/2));
        this.ctx.lineTo(r * Math.cos(Math.PI/6), r * Math.sin(Math.PI/6));
        this.ctx.lineTo(r * Math.cos(5*Math.PI/6), r * Math.sin(5*Math.PI/6));
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      } else if (item.type === 'lens') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 25, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(14, 165, 233, 0.15)';
        this.ctx.fill();
        this.ctx.strokeStyle = '#0ea5e9';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        this.ctx.beginPath();
        this.ctx.arc(-5, -5, 12, Math.PI, 1.5 * Math.PI);
        this.ctx.stroke();
      }

      if (item.selected) {
        this.ctx.strokeStyle = 'hsl(var(--accent-pink))';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([4, 4]);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 40, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.strokeStyle = 'hsl(var(--accent-pink))';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(40, 0);
        this.ctx.lineTo(48, 0);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(48, 0, 6, 0, 2*Math.PI);
        this.ctx.fillStyle = 'hsl(var(--accent-pink))';
        this.ctx.fill();
      }

      this.ctx.restore();
    });

    // 7. Draw Ghost Hint Item
    if (this.hintGhost) {
      this.ctx.save();
      this.ctx.translate(this.hintGhost.x, this.hintGhost.y);
      this.ctx.rotate(this.hintGhost.angle);
      this.ctx.globalAlpha = 0.35;
      
      this.ctx.strokeStyle = 'hsl(var(--accent-pink))';
      this.ctx.lineWidth = 2.5;
      this.ctx.setLineDash([4, 4]);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 30, 0, 2 * Math.PI);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
      
      this.ctx.fillStyle = 'hsl(var(--accent-pink))';
      this.ctx.font = 'bold 9px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText("PLACE HERE", 0, -38);

      if (this.hintGhost.type === 'mirror') {
        this.ctx.fillStyle = '#475569';
        this.ctx.fillRect(-5, -35, 10, 70);
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.fillRect(1, -33, 3, 66);
      } else if (this.hintGhost.type === 'splitter') {
        this.ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
        this.ctx.fillRect(-8, -35, 16, 70);
        this.ctx.strokeStyle = '#06b6d4';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-8, -35, 16, 70);
      } else if (this.hintGhost.type.startsWith('filter-')) {
        const filterType = this.hintGhost.type;
        let filterColor = '#ffffff';
        if (filterType === 'filter-red') filterColor = '#ef4444';
        else if (filterType === 'filter-green') filterColor = '#10b981';
        else if (filterType === 'filter-blue') filterColor = '#3b82f6';
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 25, 0, 2 * Math.PI);
        this.ctx.fillStyle = filterColor + '1a';
        this.ctx.fill();
        this.ctx.strokeStyle = filterColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      } else if (this.hintGhost.type === 'prism') {
        this.ctx.beginPath();
        const r = 32;
        this.ctx.moveTo(r * Math.cos(-Math.PI/2), r * Math.sin(-Math.PI/2));
        this.ctx.lineTo(r * Math.cos(Math.PI/6), r * Math.sin(Math.PI/6));
        this.ctx.lineTo(r * Math.cos(5*Math.PI/6), r * Math.sin(5*Math.PI/6));
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(14, 165, 233, 0.25)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.stroke();
      } else if (this.hintGhost.type === 'lens') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 25, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(14, 165, 233, 0.25)';
        this.ctx.fill();
        this.ctx.strokeStyle = '#0ea5e9';
        this.ctx.stroke();
      }

      this.ctx.restore();
    }

    // 8. Draw Logician angle incidence helper lines
    if (style === 'logician') {
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([3, 3]);
      this.rayIntersections.forEach(inter => {
        this.ctx.beginPath();
        this.ctx.moveTo(inter.x - inter.nx * 20, inter.y - inter.ny * 20);
        this.ctx.lineTo(inter.x + inter.nx * 20, inter.y + inter.ny * 20);
        this.ctx.stroke();
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '9px monospace';
        this.ctx.fillText("N", inter.x + inter.nx * 25, inter.y + inter.ny * 25);
      });
      this.ctx.restore();
    }
  }



  destroy() {
    window.removeEventListener('sparkyCoSolveStep', this.boundCoSolve);
    window.removeEventListener('equiliprismStateChanged', this.boundStateChange);
    if (this.sparky) {
      this.sparky.destroy();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  requestDraw() {
    if (this.animationFrameId) return;
    this.animationFrameId = requestAnimationFrame(() => {
      this.draw();
      this.animationFrameId = null;
    });
  }

  render() {
    this.activeLab = 'photon-lab';

    const profile = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.profile) || { country: 'US', grade: 4 };
    const grade = profile.grade !== undefined ? profile.grade : 4;
    const style = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.cognitiveStyle) || 'visualizer';
    
    let mirrorLabel = "Flat Mirror";
    let prismLabel = "Triangular Prism";
    let lensLabel = "Focusing Lens";
    let subtitle = "Guide lasers to their targets! Split white light using glass prisms and mirror reflections.";
    
    if (style === 'builder') {
      mirrorLabel = "Reflective Deflector";
      prismLabel = "Equilateral Disperser";
      lensLabel = "Plano-Convex Lens";
      subtitle = "Construct an optical circuit! Assemble reflection baffles and convex refraction units.";
    } else if (style === 'logician') {
      mirrorLabel = "Planar Reflector (n=∞)";
      prismLabel = "Dispersing Prism (n=1.5)";
      lensLabel = "Focusing Lens (f=50px)";
      subtitle = "Solve the vector trajectories using Snell's Law and angles of incidence!";
    }

    this.container.innerHTML = `
      <div class="lab-container">
        <!-- Main Optics Workspace -->
        <div class="glass-card puzzle-workspace-card">
          <div class="puzzle-header-row">
            <div class="puzzle-title">
              <h2>Photon Path Laboratory</h2>
              <p>${subtitle}</p>
            </div>
            <div class="puzzle-controls" style="display: flex; gap: 0.3rem; flex-wrap: wrap; max-height: 85px; overflow-y: auto; padding-right: 5px; max-width: 400px;">
              ${(() => {
                const isMaster = adaptiveEngine.hasCompletedAllPostOriginalGrades();
                const highest = adaptiveEngine.state.stats.scienceLevelsCompleted || 0;
                let maxLevel = 3;
                if (isMaster) {
                  maxLevel = 100;
                } else if (highest >= 10) {
                  maxLevel = Math.min(100, highest + 5);
                } else if (highest >= 3) {
                  maxLevel = 10;
                } else if ((adaptiveEngine.state.stats.scienceLevelsCompletedList || []).length >= 3) {
                  maxLevel = 10;
                }
                let html = '';
                for (let i = 1; i <= maxLevel; i++) {
                  html += `<button class="level-btn ${this.currentLevel === i ? 'active' : ''}" data-level="${i}">Lvl ${i}</button>`;
                }
                return html;
              })()}
              <button class="puzzle-btn" id="reset-puzzle-btn" style="margin-left: 0.5rem;">Reset</button>
            </div>
          </div>

          <!-- Canvas Raytracer container -->
          <div class="photon-canvas-wrapper">
            <canvas id="photon-raytrace-canvas" class="photon-canvas" width="600" height="400"></canvas>
            
            <div style="position: absolute; bottom: 8px; right: 8px; display: flex; gap: 0.5rem;">
              <button class="puzzle-btn" id="delete-selected-btn" style="background: rgba(239,68,68,0.2); border-color: #ef4444; color: #ef4444;">
                Delete Selected
              </button>
            </div>
          </div>

          <!-- Optics Tools Drawer -->
          <div style="display: flex; flex-direction: column; gap: 0.8rem;">
            <div style="text-align: center; font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">
              Select an optics device, then click on the canvas above to place it:
            </div>
            <div class="optics-toolbox">
              <div class="tool-item" data-type="mirror">
                <div class="tool-icon-wrapper">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#06b6d4" stroke-width="3"><line x1="4" y1="20" x2="20" y2="4"/></svg>
                </div>
                <div class="item-label">${mirrorLabel}</div>
              </div>
              <div class="tool-item" data-type="prism">
                <div class="tool-icon-wrapper">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#d946ef" stroke-width="2"><polygon points="12 3 2 20 22 20 12 3"/></svg>
                </div>
                <div class="item-label">${prismLabel}</div>
              </div>
              <div class="tool-item" data-type="lens">
                <div class="tool-icon-wrapper">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>
                </div>
                <div class="item-label">${lensLabel}</div>
              </div>
              ${grade >= 9 ? `
                <div class="tool-item" data-type="splitter">
                  <div class="tool-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0ea5e9" stroke-width="2">
                      <rect x="4" y="4" width="16" height="16" rx="2"/>
                      <line x1="8" y1="4" x2="8" y2="20" stroke-dasharray="2,2"/>
                      <line x1="16" y1="4" x2="16" y2="20" stroke-dasharray="2,2"/>
                    </svg>
                  </div>
                  <div class="item-label">${style === 'builder' ? 'Diffraction Splitter' : (style === 'logician' ? 'Ray Splitter (50%)' : 'Beam Splitter')}</div>
                </div>
                <div class="tool-item" data-type="filter-red">
                  <div class="tool-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ef4444" stroke-width="3">
                      <circle cx="12" cy="12" r="8" fill="rgba(239,68,68,0.2)"/>
                    </svg>
                  </div>
                  <div class="item-label">${style === 'builder' ? 'Red Pass' : (style === 'logician' ? 'λ_Red Pass' : 'Red Filter')}</div>
                </div>
                <div class="tool-item" data-type="filter-green">
                  <div class="tool-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#10b981" stroke-width="3">
                      <circle cx="12" cy="12" r="8" fill="rgba(16,185,129,0.2)"/>
                    </svg>
                  </div>
                  <div class="item-label">${style === 'builder' ? 'Green Pass' : (style === 'logician' ? 'λ_Green Pass' : 'Green Filter')}</div>
                </div>
                <div class="tool-item" data-type="filter-blue">
                  <div class="tool-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#3b82f6" stroke-width="3">
                      <circle cx="12" cy="12" r="8" fill="rgba(59,130,246,0.2)"/>
                    </svg>
                  </div>
                  <div class="item-label">${style === 'builder' ? 'Blue Pass' : (style === 'logician' ? 'λ_Blue Pass' : 'Blue Filter')}</div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Sidebar Guide -->
        <div id="photon-sparky-sidebar"></div>
      </div>
    `;

    // Initialize canvas handles
    this.canvas = this.container.querySelector('#photon-raytrace-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Run level builder
    if (this.items.length === 0) {
      this.initLevel();
    }

    // Set up sidebar guide
    if (this.sparky) {
      this.sparky.destroy();
    }
    this.sparky = new SparkyGuide('photon-sparky-sidebar');

    // Bind canvas events
    this.bindCanvasEvents();

    // Initial draw
    this.draw();
  }
}
