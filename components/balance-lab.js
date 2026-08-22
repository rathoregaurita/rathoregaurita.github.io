// EquiliPrism Balance Scale Lab Component
import { adaptiveEngine } from '../hooks/adaptive-engine.js';
import { SparkyGuide } from './sparky.js';

export class BalanceLab {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    // Initial State
    this.currentLevel = 1;
    this.secretX = 4; // Secret value of x
    this.leftItems = [];  // Array of { id, type, value }
    this.rightItems = []; // Array of { id, type, value }
    this.startTime = Date.now();
    this.hintsUsed = 0;
    this.isCreativeMode = false;

    // Track dragging state
    this.draggedType = null;
    this.draggedValue = 0;

    // Listen to Sparky co-solving events
    this.boundCoSolve = this.handleCoSolve.bind(this);
    window.addEventListener('sparkyCoSolveStep', this.boundCoSolve);

    this.boundStateChange = () => {
      this.render();
    };
    window.addEventListener('equiliprismStateChanged', this.boundStateChange);
  }

  initLevel() {
    this.startTime = Date.now();
    this.hintsUsed = 0;
    
    const profile = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.profile) || { country: 'US', grade: 4 };
    const grade = profile.grade !== undefined ? profile.grade : 4;
    const level = this.currentLevel; // 1 to 100
    
    const scaleFactor = Math.floor((level - 1) / 10) + 1; // Scales constants with levels (1 to 8)
    
    // Choose secret values for x and y
    this.secretX = Math.max(2, Math.min(10, Math.floor(Math.random() * 4) + 2 + Math.floor(scaleFactor / 2))); // 2 to 10
    this.secretY = Math.max(2, Math.min(8, this.secretX - 2));
    if (this.secretY < 2 || this.secretY === this.secretX) {
      this.secretY = this.secretX + 2;
    }
    
    let leftChests = 0;
    let rightChests = 0;
    let leftSacks = 0;
    let rightSacks = 0;
    let leftWeights = 0;
    let rightWeights = 0;
    let leftBalloons = 0;
    let rightBalloons = 0;
    
    if (grade === -1) {
      // Preschool / Pre-K: Counting scale (Age 4-5)
      // Right side has weights, left starts empty. Child must count and place same number on left.
      const targetCount = Math.floor(Math.random() * 4) + 2; // 2 to 5
      leftWeights = 0;
      rightWeights = targetCount;
      this.secretX = 0;
      this.secretY = 0;
    }
    else if (grade === 0) {
      // Kindergarten: Visual addition (Age 5-6)
      // Right side has C, left has A. User must add B to left (A + B = C).
      const A = Math.floor(Math.random() * 3) + 1; // 1 to 3
      const B = Math.floor(Math.random() * 3) + 1; // 1 to 3
      leftWeights = A;
      rightWeights = A + B;
      this.secretX = 0;
      this.secretY = 0;
    }
    else if (grade <= 2) {
      // Grades 1-2: Basic Arithmetic (A + B = C)
      // Left side starts with A, right side has A + B. User must add B to left.
      const A = Math.max(1, Math.min(10, Math.floor(Math.random() * 4) + scaleFactor));
      const B = Math.max(1, Math.min(10, Math.floor(Math.random() * 4) + scaleFactor));
      
      leftWeights = A;
      rightWeights = A + B;
      this.secretX = 0;
      this.secretY = 0;
    } 
    else if (grade <= 4) {
      // Grades 3-4: Single-Step Algebra (x + A = B or Ax = B)
      const isMultiplication = (level % 2 === 0);
      if (isMultiplication) {
        // Ax = B
        const A = Math.max(2, Math.min(4, Math.floor(Math.random() * 2) + 2)); 
        const B = A * this.secretX;
        
        leftChests = A;
        rightWeights = B;
      } else {
        // x + A = B
        const A = Math.max(1, Math.min(15, Math.floor(Math.random() * 5) + scaleFactor));
        const B = this.secretX + A;
        
        leftChests = 1;
        leftWeights = A;
        rightWeights = B;
      }
    } 
    else if (grade <= 6) {
      // Grades 5-6: Two-Step Algebra (Ax + B = C or Ax - B = C)
      const isSubtraction = (level % 2 === 0);
      const A = Math.max(1, Math.min(3, Math.floor(Math.random() * 2) + 1));
      
      if (isSubtraction) {
        // Ax - B = C -> Ax + (-B) = C (Balloons)
        const B = Math.max(1, Math.min(5, Math.floor(Math.random() * 3) + 1));
        const C = A * this.secretX - B;
        
        if (C > 0) {
          leftChests = A;
          leftBalloons = B;
          rightWeights = C;
        } else {
          // Fallback to addition
          const fallbackB = 1;
          const fallbackC = A * this.secretX + fallbackB;
          leftChests = A;
          leftWeights = fallbackB;
          rightWeights = fallbackC;
        }
      } else {
        // Ax + B = C
        const B = Math.max(1, Math.min(10, Math.floor(Math.random() * 4) + scaleFactor));
        const C = A * this.secretX + B;
        
        leftChests = A;
        leftWeights = B;
        rightWeights = C;
      }
    } 
    else if (grade <= 8) {
      // Grades 7-8: Variables on both sides, negative constants (Ax - B = Cx + D)
      const leftCount = Math.max(2, Math.min(4, Math.floor(Math.random() * 2) + 2)); 
      const rightCount = leftCount - 1; 
      
      const isSubtraction = (level % 2 === 0);
      if (isSubtraction) {
        const B = Math.max(1, Math.min(4, Math.floor(Math.random() * 2) + 1));
        const D = (leftCount - rightCount) * this.secretX - B;
        
        if (D > 0) {
          leftChests = leftCount;
          leftBalloons = B;
          rightChests = rightCount;
          rightWeights = D;
        } else {
          const fallbackB = Math.max(1, Math.min(4, Math.floor(Math.random() * 2) + 1));
          const fallbackD = (leftCount - rightCount) * this.secretX + fallbackB;
          leftChests = leftCount;
          leftWeights = fallbackB;
          rightChests = rightCount;
          rightWeights = fallbackD;
        }
      } else {
        const B = Math.max(1, Math.min(5, Math.floor(Math.random() * 3) + 1));
        const D = (leftCount - rightCount) * this.secretX + B;
        
        leftChests = leftCount;
        leftWeights = B;
        rightChests = rightCount;
        rightWeights = D;
      }
    }
    else {
      // High School Grades 9-12: Systems of Equations (Chests and Sacks)
      let leftC = 0, rightC = 0;
      let leftS = 0, rightS = 0;
      let leftW = 0, rightW = 0;
      let leftB = 0, rightB = 0;
      
      const HSGrade = grade;
      if (HSGrade === 9) {
        // x + y + A = B
        const A = Math.floor(Math.random() * 3) + 1; // 1 to 3
        leftC = 1;
        leftS = 1;
        leftW = A;
        rightW = this.secretX + this.secretY + A;
      } else if (HSGrade === 10) {
        // 2x + y + A = x + y + B -> x + A = B -> B = secretX + A
        const A = Math.floor(Math.random() * 3) + 1;
        leftC = 2;
        leftS = 1;
        leftW = A;
        rightC = 1;
        rightS = 1;
        rightW = this.secretX + A;
      } else if (HSGrade === 11) {
        // 2x + 2y - B = C -> 2x + 2y + (negative balloon) = C
        const B = Math.floor(Math.random() * 2) + 1; // 1 to 2
        const C = 2 * this.secretX + 2 * this.secretY - B;
        leftC = 2;
        leftS = 2;
        leftB = B;
        rightW = C;
      } else {
        // Grade 12: Ax + By - C = Dx + Ey + F
        // 2x + 3y - 2 = x + y + D -> X + 2*Y - 2 = D -> D = secretX + 2*secretY - 2
        const D = this.secretX + 2 * this.secretY - 2;
        leftC = 2;
        leftS = 3;
        leftB = 2;
        rightC = 1;
        rightS = 1;
        rightW = D;
      }
      
      leftChests = leftC; leftSacks = leftS; leftWeights = leftW; leftBalloons = leftB;
      rightChests = rightC; rightSacks = rightS; rightWeights = rightW; rightBalloons = rightB;
    }
    
    // Map to scale arrays
    this.leftItems = [
      ...Array.from({ length: leftChests }, (_, i) => ({ id: `x-l-${i}-${Date.now()}`, type: 'chest', value: this.secretX })),
      ...Array.from({ length: leftSacks }, (_, i) => ({ id: `y-l-${i}-${Date.now()}`, type: 'sack', value: this.secretY })),
      ...Array.from({ length: leftWeights }, (_, i) => ({ id: `w-l-${i}-${Date.now()}`, type: 'weight', value: 1 })),
      ...Array.from({ length: leftBalloons }, (_, i) => ({ id: `b-l-${i}-${Date.now()}`, type: 'balloon', value: -1 }))
    ];
    this.rightItems = [
      ...Array.from({ length: rightChests }, (_, i) => ({ id: `x-r-${i}-${Date.now()}`, type: 'chest', value: this.secretX })),
      ...Array.from({ length: rightSacks }, (_, i) => ({ id: `y-r-${i}-${Date.now()}`, type: 'sack', value: this.secretY })),
      ...Array.from({ length: rightWeights }, (_, i) => ({ id: `w-r-${i}-${Date.now()}`, type: 'weight', value: 1 })),
      ...Array.from({ length: rightBalloons }, (_, i) => ({ id: `b-r-${i}-${Date.now()}`, type: 'balloon', value: -1 }))
    ];
    
    // Inform Sparky about context change
    window.dispatchEvent(new CustomEvent('labContextChanged', {
      detail: { labId: 'balance-lab', level: this.currentLevel }
    }));
  }

  // Calculate sum of weights on a side
  getSideWeight(items) {
    return items.reduce((sum, item) => sum + item.value, 0);
  }

  // Checks if the puzzle is balanced and solved correctly
  checkWinCondition() {
    const profile = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.profile) || { country: 'US', grade: 4 };
    const grade = profile.grade !== undefined ? profile.grade : 4;
    const leftW = this.getSideWeight(this.leftItems);
    const rightW = this.getSideWeight(this.rightItems);

    if (leftW === rightW) {
      // We are balanced!
      
      // 1. Early years (grade <= 2): Simply making them balance it (and left plate is not empty)
      if (grade <= 2) {
        if (this.leftItems.length > 0) {
          const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
          adaptiveEngine.logPuzzleAttempt('balance-lab', this.currentLevel, true, timeSpent, this.hintsUsed);
          window.dispatchEvent(new CustomEvent('puzzleSolved'));
          setTimeout(() => {
            this.showLevelSuccessModal();
          }, 1200);
        }
        return;
      }

      // 2. High School (grade >= 9): Isolate Chest (x) or Sack (y)
      if (grade >= 9) {
        const leftChests = this.leftItems.filter(i => i.type === 'chest').length;
        const rightChests = this.rightItems.filter(i => i.type === 'chest').length;
        const leftSacks = this.leftItems.filter(i => i.type === 'sack').length;
        const rightSacks = this.rightItems.filter(i => i.type === 'sack').length;
        const leftWeights = this.leftItems.filter(i => i.type === 'weight').length;
        const rightWeights = this.rightItems.filter(i => i.type === 'weight').length;
        const leftBalloons = this.leftItems.filter(i => i.type === 'balloon').length;
        const rightBalloons = this.rightItems.filter(i => i.type === 'balloon').length;

        const xLeftIsolated = (leftChests === 1 && leftSacks === 0 && leftWeights === 0 && leftBalloons === 0 && rightChests === 0);
        const xRightIsolated = (rightChests === 1 && rightSacks === 0 && rightWeights === 0 && rightBalloons === 0 && leftChests === 0);
        
        const yLeftIsolated = (leftSacks === 1 && leftChests === 0 && leftWeights === 0 && leftBalloons === 0 && rightSacks === 0);
        const yRightIsolated = (rightSacks === 1 && rightChests === 0 && rightWeights === 0 && rightBalloons === 0 && leftSacks === 0);

        if (xLeftIsolated || xRightIsolated || yLeftIsolated || yRightIsolated) {
          const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
          adaptiveEngine.logPuzzleAttempt('balance-lab', this.currentLevel, true, timeSpent, this.hintsUsed);
          window.dispatchEvent(new CustomEvent('puzzleSolved'));
          setTimeout(() => {
            this.showLevelSuccessModal();
          }, 1200);
        }
        return;
      }

      // 3. Middle school (grade 3-8): Isolate Chest (x)
      const leftChests = this.leftItems.filter(i => i.type === 'chest');
      const rightChests = this.rightItems.filter(i => i.type === 'chest');
      const leftWeights = this.leftItems.filter(i => i.type === 'weight');
      const rightWeights = this.rightItems.filter(i => i.type === 'weight');
      const leftBalloons = this.leftItems.filter(i => i.type === 'balloon');
      const rightBalloons = this.rightItems.filter(i => i.type === 'balloon');

      const leftIsolated = leftChests.length === 1 && rightChests.length === 0 && leftWeights.length === 0 && leftBalloons.length === 0;
      const rightIsolated = rightChests.length === 1 && leftChests.length === 0 && rightWeights.length === 0 && rightBalloons.length === 0;

      if (leftIsolated || rightIsolated) {
        const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
        adaptiveEngine.logPuzzleAttempt('balance-lab', this.currentLevel, true, timeSpent, this.hintsUsed);
        window.dispatchEvent(new CustomEvent('puzzleSolved'));
        setTimeout(() => {
          this.showLevelSuccessModal();
        }, 1200);
      }
    }
  }

  showLevelSuccessModal() {
    const isMaster = adaptiveEngine.hasCompletedAllPostOriginalGrades();
    const highest = adaptiveEngine.state.stats.mathLevelsCompleted || 0;
    let maxLevel = 3;
    if (isMaster) {
      maxLevel = 100;
    } else if (highest >= 10) {
      maxLevel = Math.min(100, highest + 5);
    } else if (highest >= 3) {
      maxLevel = 10;
    } else if ((adaptiveEngine.state.stats.mathLevelsCompletedList || []).length >= 3) {
      maxLevel = 10;
    }

    const profile = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.profile) || { country: 'US', grade: 4 };
    const grade = profile.grade !== undefined ? profile.grade : 4;
    
    let successMessage = "";
    if (grade <= 2) {
      successMessage = "You successfully balanced the scale! Excellent job counting and matching the blocks.";
    } else if (grade >= 9) {
      const leftSacks = this.leftItems.filter(i => i.type === 'sack').length;
      const rightSacks = this.rightItems.filter(i => i.type === 'sack').length;
      const isSackIsolated = (leftSacks === 1 && this.leftItems.length === 1) || (rightSacks === 1 && this.rightItems.length === 1);
      if (isSackIsolated) {
        successMessage = `You successfully isolated the sack! Through balancing, you proved that the sack's weight value is exactly <strong>${this.secretY}</strong>.`;
      } else {
        successMessage = `You successfully isolated the mystery chest! Through balancing, you proved that the chest's weight value is exactly <strong>${this.secretX}</strong>.`;
      }
    } else {
      successMessage = `You successfully isolated the mystery chest! Through balancing, you proved that the chest's weight value is exactly <strong>${this.secretX}</strong>.`;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal-content glass-card" style="text-align: center;">
        <h2 style="font-size: 2rem; color: hsl(var(--accent-green)); margin-bottom: 1rem;">✦ Balanced & Solved! ✦</h2>
        <p style="margin-bottom: 1.5rem; line-height: 1.6;">${successMessage}</p>
        <div class="modal-buttons" style="justify-content: center;">
          ${this.currentLevel < maxLevel ? `
            <button class="puzzle-btn primary" id="next-level-btn" style="padding: 0.8rem 2rem; font-size: 1rem;">Go to Level ${this.currentLevel + 1}</button>
          ` : `
            <button class="puzzle-btn primary" id="next-level-btn" style="padding: 0.8rem 2rem; font-size: 1rem; background: linear-gradient(to right, hsl(var(--accent-pink)), hsl(var(--accent-violet)));">Return to Dashboard</button>
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
        this.render();
      } else {
        // Go back to dashboard
        window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'dashboard' }));
      }
    });
  }

  // Co-solving helper: Triggered by Sparky
  handleCoSolve() {
    if (this.activeLab !== 'balance-lab') return;

    // Determine the smart step
    const leftChests = this.leftItems.filter(i => i.type === 'chest').length;
    const rightChests = this.rightItems.filter(i => i.type === 'chest').length;
    const leftWeights = this.leftItems.filter(i => i.type === 'weight').length;
    const rightWeights = this.rightItems.filter(i => i.type === 'weight').length;
    const leftBalloons = this.leftItems.filter(i => i.type === 'balloon').length;
    const rightBalloons = this.rightItems.filter(i => i.type === 'balloon').length;

    // Step 1: Highlight common chests on both sides
    if (leftChests > 0 && rightChests > 0) {
      this.highlightSvgItems(
        'chest',
        'chest',
        '#op-sub-chest',
        "We have mystery chests on both plates! Let's simplify the see-saw. Subtract 1 chest ($x$) from both sides (click the <strong>-1 Chest (x)</strong> button below)."
      );
      return;
    }

    // Step 2: Highlight balloon cancellation
    if (leftBalloons > 0 || rightBalloons > 0) {
      const side = leftBalloons > 0 ? 'left' : 'right';
      this.highlightSvgItems(
        side === 'left' ? 'balloon' : null,
        side === 'right' ? 'balloon' : null,
        '#op-add-weight',
        `A helium balloon pulls its plate upwards, which acts like subtraction ($-1$ kg). Let's cancel it by adding a solid weight block. Click the <strong>+1 Weight</strong> button to add weight to both sides!`
      );
      return;
    }

    // Step 3: Highlight common weights on both sides
    if (leftWeights > 0 && rightWeights > 0) {
      this.highlightSvgItems(
        'weight',
        'weight',
        '#op-sub-weight',
        "We have weight blocks on both plates. Subtracting 1 weight block from both sides keeps the scale perfectly balanced. Click the <strong>-1 Weight</strong> button."
      );
      return;
    }

    // Default suggestion if no common elements
    const sparkyContainer = document.getElementById('sparky-widget-container');
    if (sparkyContainer) {
      const bubble = sparkyContainer.querySelector('.sparky-bubble');
      if (bubble) {
        bubble.innerHTML = `<span style="color: hsl(var(--accent-cyan)); font-weight: 600;">Sparky:</span> You are so close! Try adding or removing items so that only a single mystery chest ($x$) is left on one side of the scale.`;
      }
    }
  }

  highlightSvgItems(leftType, rightType, buttonSelector, explanation) {
    this.clearHighlights();

    // Glow matching items on SVG plates
    if (leftType) {
      const item = this.leftItems.find(i => i.type === leftType);
      if (item) {
        const group = this.container.querySelector(`[data-id="${item.id}"]`);
        if (group) {
          const rect = group.querySelector('rect') || group.querySelector('ellipse');
          if (rect) rect.classList.add('svg-glow-highlight');
        }
      }
    }

    if (rightType) {
      const item = this.rightItems.find(i => i.type === rightType);
      if (item) {
        const group = this.container.querySelector(`[data-id="${item.id}"]`);
        if (group) {
          const rect = group.querySelector('rect') || group.querySelector('ellipse');
          if (rect) rect.classList.add('svg-glow-highlight');
        }
      }
    }

    // Glow action button
    if (buttonSelector) {
      const btn = this.container.querySelector(buttonSelector);
      if (btn) btn.classList.add('glow-highlight');
    }

    // Update Sparky text
    const sparkyContainer = document.getElementById('sparky-widget-container');
    if (sparkyContainer) {
      const bubble = sparkyContainer.querySelector('.sparky-bubble');
      if (bubble) {
        bubble.innerHTML = `<span style="color: hsl(var(--accent-cyan)); font-weight: 600;">Sparky's Guide:</span> ${explanation}`;
      }
    }
  }

  clearHighlights() {
    this.container.querySelectorAll('.svg-glow-highlight').forEach(el => el.classList.remove('svg-glow-highlight'));
    this.container.querySelectorAll('.glow-highlight').forEach(el => el.classList.remove('glow-highlight'));
  }


  // --- HTML Renders & Interactions ---
  bindEvents() {
    // Inventory dragging
    const draggables = this.container.querySelectorAll('.inventory-item');
    draggables.forEach(drag => {
      drag.addEventListener('dragstart', (e) => {
        this.draggedType = drag.getAttribute('data-type');
        this.draggedValue = this.draggedType === 'chest' ? this.secretX : (this.draggedType === 'sack' ? this.secretY : (this.draggedType === 'balloon' ? -1 : 1));
        e.dataTransfer.setData('text/plain', this.draggedType);
      });
    });

    // Drop zones on scales
    const leftDrop = this.container.querySelector('#left-plate-dropzone');
    const rightDrop = this.container.querySelector('#right-plate-dropzone');

    [leftDrop, rightDrop].forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        
        const side = zone.id === 'left-plate-dropzone' ? 'left' : 'right';
        const newItem = {
          id: `${this.draggedType}-${Date.now()}`,
          type: this.draggedType,
          value: this.draggedValue
        };

        if (side === 'left') {
          this.leftItems.push(newItem);
        } else {
          this.rightItems.push(newItem);
        }
        
        this.render();
        this.checkWinCondition();
      });
    });

    // Clear items click handlers
    this.container.querySelectorAll('.clear-plate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const side = btn.getAttribute('data-side');
        if (side === 'left') this.leftItems = [];
        else this.rightItems = [];
        this.render();
      });
    });

    // Remove single item from scale on click
    this.container.querySelectorAll('.svg-element').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        if (id) {
          this.leftItems = this.leftItems.filter(i => i.id !== id);
          this.rightItems = this.rightItems.filter(i => i.id !== id);
          this.render();
          this.checkWinCondition();
        }
      });
    });

    // Symbolic Action buttons
    const addWeightBtn = this.container.querySelector('#op-add-weight');
    const subWeightBtn = this.container.querySelector('#op-sub-weight');
    const addChestBtn = this.container.querySelector('#op-add-chest');
    const subChestBtn = this.container.querySelector('#op-sub-chest');

    if (addWeightBtn) {
      addWeightBtn.addEventListener('click', () => {
        this.leftItems.push({ id: `w-l-${Date.now()}`, type: 'weight', value: 1 });
        this.rightItems.push({ id: `w-r-${Date.now()}`, type: 'weight', value: 1 });
        this.render();
        this.checkWinCondition();
      });
    }

    if (subWeightBtn) {
      subWeightBtn.addEventListener('click', () => {
        // Subtract from both sides if possible
        const lIdx = this.leftItems.findIndex(i => i.type === 'weight');
        const rIdx = this.rightItems.findIndex(i => i.type === 'weight');
        if (lIdx !== -1 && rIdx !== -1) {
          this.leftItems.splice(lIdx, 1);
          this.rightItems.splice(rIdx, 1);
          this.render();
          this.checkWinCondition();
        } else {
          alert("Cannot subtract weight! Must have at least 1 weight block on both plates.");
        }
      });
    }

    if (addChestBtn) {
      addChestBtn.addEventListener('click', () => {
        this.leftItems.push({ id: `x-l-${Date.now()}`, type: 'chest', value: this.secretX });
        this.rightItems.push({ id: `x-r-${Date.now()}`, type: 'chest', value: this.secretX });
        this.render();
        this.checkWinCondition();
      });
    }

    if (subChestBtn) {
      subChestBtn.addEventListener('click', () => {
        const lIdx = this.leftItems.findIndex(i => i.type === 'chest');
        const rIdx = this.rightItems.findIndex(i => i.type === 'chest');
        if (lIdx !== -1 && rIdx !== -1) {
          this.leftItems.splice(lIdx, 1);
          this.rightItems.splice(rIdx, 1);
          this.render();
          this.checkWinCondition();
        } else {
          alert("Cannot subtract chest! Must have at least 1 mystery chest on both plates.");
        }
      });
    }

    const addSackBtn = this.container.querySelector('#op-add-sack');
    const subSackBtn = this.container.querySelector('#op-sub-sack');

    if (addSackBtn) {
      addSackBtn.addEventListener('click', () => {
        this.leftItems.push({ id: `y-l-${Date.now()}`, type: 'sack', value: this.secretY });
        this.rightItems.push({ id: `y-r-${Date.now()}`, type: 'sack', value: this.secretY });
        this.render();
        this.checkWinCondition();
      });
    }

    if (subSackBtn) {
      subSackBtn.addEventListener('click', () => {
        const lIdx = this.leftItems.findIndex(i => i.type === 'sack');
        const rIdx = this.rightItems.findIndex(i => i.type === 'sack');
        if (lIdx !== -1 && rIdx !== -1) {
          this.leftItems.splice(lIdx, 1);
          this.rightItems.splice(rIdx, 1);
          this.render();
          this.checkWinCondition();
        } else {
          alert("Cannot subtract sack! Must have at least 1 sack on both plates.");
        }
      });
    }

    // Reset puzzle button
    this.container.querySelector('#reset-puzzle-btn').addEventListener('click', () => {
      this.initLevel();
      this.render();
    });

    // Level navigation in puzzle header
    this.container.querySelectorAll('.level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentLevel = parseInt(btn.getAttribute('data-level'));
        this.initLevel();
        this.render();
      });
    });

    const solveStepsBtn = this.container.querySelector('#balance-solve-steps-btn');
    if (solveStepsBtn) {
      solveStepsBtn.addEventListener('click', () => {
        this.showAlgebraSteps();
      });
    }
  }

  // Draw blocks inside SVG plates
  drawSideItems(items, startX, plateY, sideId) {
    let html = '';
    const spacing = 28;
    const rowLimit = 5;
    const style = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.cognitiveStyle) || 'visualizer';

    items.forEach((item, index) => {
      const col = index % rowLimit;
      const row = Math.floor(index / rowLimit);
      
      const x = startX - 50 + col * spacing;
      const y = plateY - 18 - row * spacing;

      if (item.type === 'chest') {
        if (style === 'builder') {
          html += `
            <g class="svg-element chest-block" data-id="${item.id}" transform="translate(${x}, ${y})">
              <!-- Wooden Cargo Crate -->
              <rect width="24" height="24" rx="2" fill="#d97706" stroke="#78350f" stroke-width="1.5"/>
              <rect x="0" y="0" width="5" height="5" fill="#4b5563"/>
              <rect x="19" y="0" width="5" height="5" fill="#4b5563"/>
              <rect x="0" y="19" width="5" height="5" fill="#4b5563"/>
              <rect x="19" y="19" width="5" height="5" fill="#4b5563"/>
              <line x1="4" y1="4" x2="20" y2="20" stroke="#78350f" stroke-width="1.5"/>
              <text x="12" y="16" fill="#fff" font-family="sans-serif" font-weight="900" font-size="12" text-anchor="middle">x</text>
            </g>
          `;
        } else if (style === 'logician') {
          html += `
            <g class="svg-element chest-block" data-id="${item.id}" transform="translate(${x}, ${y})">
              <!-- Neon variable card -->
              <rect width="24" height="24" rx="4" fill="rgba(6, 182, 212, 0.15)" stroke="#06b6d4" stroke-width="2" style="filter: drop-shadow(0 0 3px rgba(6, 182, 212, 0.5));"/>
              <text x="12" y="17" fill="#22d3ee" font-family="monospace" font-weight="700" font-size="14" text-anchor="middle">x</text>
            </g>
          `;
        } else {
          html += `
            <g class="svg-element chest-block" data-id="${item.id}" transform="translate(${x}, ${y})">
              <rect width="24" height="24" rx="4" fill="url(#chestGrad)" stroke="#6d28d9" stroke-width="1.5"/>
              <text x="12" y="17" fill="#fff" font-family="sans-serif" font-weight="800" font-size="14" text-anchor="middle">x</text>
            </g>
          `;
        }
      } else if (item.type === 'sack') {
        if (style === 'builder') {
          html += `
            <g class="svg-element sack-block" data-id="${item.id}" transform="translate(${x}, ${y - 4})">
              <!-- Heavy Burlap Sandbag -->
              <path d="M 4 20 C 4 10 8 6 12 6 C 16 6 20 10 20 20 C 20 26 17 27 12 27 C 7 27 4 26 4 20 Z" fill="#b45309" stroke="#78350f" stroke-width="1.5"/>
              <line x1="8" y1="10" x2="16" y2="10" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>
              <text x="12" y="20" fill="#fff" font-family="sans-serif" font-weight="800" font-size="11" text-anchor="middle">y</text>
            </g>
          `;
        } else if (style === 'logician') {
          html += `
            <g class="svg-element sack-block" data-id="${item.id}" transform="translate(${x}, ${y})">
              <!-- Neon variable card y -->
              <rect width="24" height="24" rx="4" fill="rgba(236, 72, 153, 0.15)" stroke="#ec4899" stroke-width="2" style="filter: drop-shadow(0 0 3px rgba(236, 72, 153, 0.5));"/>
              <text x="12" y="17" fill="#f472b6" font-family="monospace" font-weight="700" font-size="14" text-anchor="middle">y</text>
            </g>
          `;
        } else {
          html += `
            <g class="svg-element sack-block" data-id="${item.id}" transform="translate(${x}, ${y - 4})">
              <path d="M 4 20 C 4 10 8 4 12 4 C 16 4 20 10 20 20 C 20 26 18 28 12 28 C 6 28 4 26 4 20 Z" fill="url(#sackGrad)" stroke="#78350f" stroke-width="1.5"/>
              <path d="M 8 8 Q 12 6 16 8" stroke="#fef08a" stroke-width="2" stroke-linecap="round" fill="none"/>
              <text x="12" y="20" fill="#fff" font-family="sans-serif" font-weight="800" font-size="12" text-anchor="middle">y</text>
            </g>
          `;
        }
      } else if (item.type === 'weight') {
        if (style === 'builder') {
          html += `
            <g class="svg-element weight-block" data-id="${item.id}" transform="translate(${x}, ${y})">
              <!-- Steel Load Block -->
              <rect width="24" height="24" rx="2" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
              <circle cx="3" cy="3" r="1.2" fill="#cbd5e1"/>
              <circle cx="21" cy="3" r="1.2" fill="#cbd5e1"/>
              <circle cx="3" cy="21" r="1.2" fill="#cbd5e1"/>
              <circle cx="21" cy="21" r="1.2" fill="#cbd5e1"/>
              <text x="12" y="16" fill="#fff" font-family="sans-serif" font-weight="800" font-size="11" text-anchor="middle">1</text>
            </g>
          `;
        } else if (style === 'logician') {
          html += `
            <g class="svg-element weight-block" data-id="${item.id}" transform="translate(${x}, ${y})">
              <!-- Neon constant block -->
              <rect width="24" height="24" rx="4" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="2" style="filter: drop-shadow(0 0 3px rgba(16, 185, 129, 0.5));"/>
              <text x="12" y="16" fill="#34d399" font-family="monospace" font-weight="700" font-size="10" text-anchor="middle">+1</text>
            </g>
          `;
        } else {
          html += `
            <g class="svg-element weight-block" data-id="${item.id}" transform="translate(${x}, ${y})">
              <rect width="24" height="24" rx="4" fill="url(#weightGrad)" stroke="#f59e0b" stroke-width="1.5"/>
              <text x="12" y="16" fill="#fff" font-family="sans-serif" font-weight="700" font-size="11" text-anchor="middle">1</text>
            </g>
          `;
        }
      } else if (item.type === 'balloon') {
        if (style === 'builder') {
          html += `
            <g class="svg-element balloon-block" data-id="${item.id}" transform="translate(${x}, ${y - 10})">
              <!-- Industrial Lift Balloon -->
              <line x1="12" y1="20" x2="12" y2="35" stroke="#475569" stroke-width="1.2"/>
              <ellipse cx="12" cy="10" rx="9" ry="11" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
              <line x1="6" y1="10" x2="18" y2="10" stroke="#ca8a04" stroke-width="1.5"/>
              <text x="12" y="13" fill="#000" font-family="sans-serif" font-weight="900" font-size="9" text-anchor="middle">-1</text>
            </g>
          `;
        } else if (style === 'logician') {
          html += `
            <g class="svg-element balloon-block" data-id="${item.id}" transform="translate(${x}, ${y})">
              <!-- Neon negative constant block -->
              <rect width="24" height="24" rx="4" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="2" style="filter: drop-shadow(0 0 3px rgba(239, 68, 68, 0.5));"/>
              <text x="12" y="16" fill="#f87171" font-family="monospace" font-weight="700" font-size="10" text-anchor="middle">-1</text>
            </g>
          `;
        } else {
          html += `
            <g class="svg-element balloon-block" data-id="${item.id}" transform="translate(${x}, ${y - 10})">
              <line x1="12" y1="20" x2="12" y2="35" stroke="#ef4444" stroke-dasharray="2 2" stroke-width="1"/>
              <ellipse cx="12" cy="10" rx="9" ry="12" fill="url(#balloonGrad)" stroke="#f43f5e" stroke-width="1"/>
              <text x="12" y="14" fill="#fff" font-family="sans-serif" font-weight="700" font-size="10" text-anchor="middle">-1</text>
            </g>
          `;
        }
      }
    });

    return html;
  }

  getFormalEquationString() {
    const formatSide = (items) => {
      const chests = items.filter(i => i.type === 'chest').length;
      const sacks = items.filter(i => i.type === 'sack').length;
      const weights = items.filter(i => i.type === 'weight').length;
      const balloons = items.filter(i => i.type === 'balloon').length;
      
      const netConst = weights - balloons;
      
      let parts = [];
      if (chests > 0) {
        parts.push(chests === 1 ? 'x' : `${chests}x`);
      }
      if (sacks > 0) {
        parts.push(sacks === 1 ? 'y' : `${sacks}y`);
      }
      if (netConst !== 0) {
        const sign = netConst > 0 ? '+' : '-';
        const val = Math.abs(netConst);
        if (parts.length === 0) {
          parts.push(netConst > 0 ? `${val}` : `-${val}`);
        } else {
          parts.push(`${sign} ${val}`);
        }
      }
      
      if (parts.length === 0) return '0';
      return parts.join(' ');
    };
    
    return `${formatSide(this.leftItems)} = ${formatSide(this.rightItems)}`;
  }

  render() {
    this.activeLab = 'balance-lab';
    
    // Auto-initialize level if items lists are empty
    if (this.leftItems.length === 0 && this.rightItems.length === 0 && !this.isCreativeMode) {
      this.initLevel();
    }
    
    const leftW = this.getSideWeight(this.leftItems);
    const rightW = this.getSideWeight(this.rightItems);

    // Compute balance scale physical tilt
    // Rotates scale beam based on weight difference. Clamped between -12deg and +12deg.
    let angle = 0;
    const diff = rightW - leftW;
    if (diff !== 0) {
      angle = Math.max(-12, Math.min(12, diff * 1.5));
    }
    
    // Scale hanger offsets
    // Left goes down when angle is negative (left heavier)
    const angleRad = (angle * Math.PI) / 180;
    const hangerLeftY = 180 + 150 * Math.sin(angleRad);
    const hangerRightY = 180 - 150 * Math.sin(angleRad);

    const style = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.cognitiveStyle) || 'visualizer';
    const profile = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.profile) || { country: 'US', grade: 4 };
    const grade = profile.grade !== undefined ? profile.grade : 4;
    const isEarly = (grade <= 2);
    const isHighSchool = (grade >= 9);
    
    let chestLabel = "Mystery Chest (x)";
    let weightLabel = "1 kg Weight";
    let balloonLabel = "Helium Balloon (-1)";
    
    let chestGradStart = '#8b5cf6', chestGradEnd = '#ec4899';
    let weightGradStart = '#fbbf24', weightGradEnd = '#d97706';
    let balloonGradStart = '#f87171', balloonGradEnd = '#ef4444';
    
    let subtitle = "Explore algebra equations. Balance both sides to discover the chest value!";
    let eqLabelHTML = '';
    
    if (grade === -1) {
      subtitle = "Count the blocks on the right plate, and drag the same number of blocks to the left plate!";
      eqLabelHTML = `
        <div class="formal-equation" style="font-family: inherit; font-size: 0.92rem; color: hsl(var(--accent-pink)); font-weight: 600; text-align: center; margin-top: 0.3rem;">
          Goal: Place weights on the left side until left equals right!
        </div>
      `;
    } else if (grade === 0) {
      subtitle = "Add the missing blocks to the left plate to make the scale balance!";
      eqLabelHTML = `
        <div class="formal-equation" style="font-family: inherit; font-size: 0.92rem; color: hsl(var(--accent-pink)); font-weight: 600; text-align: center; margin-top: 0.3rem;">
          Goal: Place weights on the left side until left equals right!
        </div>
      `;
    } else if (grade <= 2) {
      subtitle = "Add weights to the left plate until the see-saw scale is balanced!";
      eqLabelHTML = `
        <div class="formal-equation" style="font-family: inherit; font-size: 0.92rem; color: hsl(var(--accent-pink)); font-weight: 600; text-align: center; margin-top: 0.3rem;">
          Goal: Place weights on the left side until left equals right!
        </div>
      `;
    } else if (isHighSchool) {
      if (style === 'builder') {
        chestLabel = "Cargo Box (x)";
        weightLabel = "1 kg Load Block";
        balloonLabel = "Lift Balloon (-1)";
        chestGradStart = '#ea580c'; chestGradEnd = '#9a3412';
        weightGradStart = '#64748b'; weightGradEnd = '#334155';
        balloonGradStart = '#eab308'; balloonGradEnd = '#ca8a04';
        subtitle = "Balance the multi-load cargo system to isolate the structural mass ($x$) or weight container ($y$)!";
        eqLabelHTML = `
          <div class="formal-equation" style="font-family: inherit; font-size: 0.92rem; color: hsl(var(--accent-amber)); font-weight: 600; text-align: center; margin-top: 0.3rem;">
            Total Load: Left Side = ${leftW} kg | Right Side = ${rightW} kg
          </div>
        `;
      } else if (style === 'logician') {
        chestLabel = "Variable [x]";
        weightLabel = "Constant [+1]";
        balloonLabel = "Constant [-1]";
        chestGradStart = '#06b6d4'; chestGradEnd = '#3b82f6';
        weightGradStart = '#10b981'; weightGradEnd = '#047857';
        balloonGradStart = '#f43f5e'; balloonGradEnd = '#be123c';
        subtitle = "Solve the system of equations by isolating variable $x$ or $y$ using balancing operations!";
        eqLabelHTML = `
          <div class="formal-equation" style="font-family: monospace; font-size: 1.05rem; color: hsl(var(--accent-cyan)); font-weight: 700; text-align: center; margin-top: 0.3rem;">
            Equation: ${this.getFormalEquationString()}
          </div>
        `;
      } else {
        subtitle = "Isolate one of the variable mystery shapes ($x$ or $y$) on one side to solve the systems of equations!";
        eqLabelHTML = `
          <div class="formal-equation" style="font-family: inherit; font-size: 0.92rem; color: hsl(var(--accent-pink)); font-weight: 600; text-align: center; margin-top: 0.3rem;">
            See-Saw State: ${leftW === rightW ? 'Perfectly Balanced! 🌟' : (leftW > rightW ? 'Tilted Left ↙' : 'Tilted Right ↘')}
          </div>
        `;
      }
    } else {
      if (style === 'builder') {
        chestLabel = "Cargo Box (x)";
        weightLabel = "1 kg Load Block";
        balloonLabel = "Lift Balloon (-1)";
        
        chestGradStart = '#ea580c'; chestGradEnd = '#9a3412';
        weightGradStart = '#64748b'; weightGradEnd = '#334155';
        balloonGradStart = '#eab308'; balloonGradEnd = '#ca8a04';
        
        subtitle = "Balance the mechanical truss weights to calculate the mystery cargo load!";
        eqLabelHTML = `
          <div class="formal-equation" style="font-family: inherit; font-size: 0.92rem; color: hsl(var(--accent-amber)); font-weight: 600; text-align: center; margin-top: 0.3rem;">
            Total Load: Left Side = ${leftW} kg | Right Side = ${rightW} kg
          </div>
        `;
      } else if (style === 'logician') {
        chestLabel = "Variable [x]";
        weightLabel = "Constant [+1]";
        balloonLabel = "Constant [-1]";
        
        chestGradStart = '#06b6d4'; chestGradEnd = '#3b82f6';
        weightGradStart = '#10b981'; weightGradEnd = '#047857';
        balloonGradStart = '#f43f5e'; balloonGradEnd = '#be123c';
        
        subtitle = "Solve the equivalence equation using balancing operations!";
        eqLabelHTML = `
          <div class="formal-equation" style="font-family: monospace; font-size: 1.05rem; color: hsl(var(--accent-cyan)); font-weight: 700; text-align: center; margin-top: 0.3rem;">
            Equation: ${this.getFormalEquationString()}
          </div>
        `;
      } else {
        eqLabelHTML = `
          <div class="formal-equation" style="font-family: inherit; font-size: 0.92rem; color: hsl(var(--accent-pink)); font-weight: 600; text-align: center; margin-top: 0.3rem;">
            See-Saw State: ${leftW === rightW ? 'Perfectly Balanced! 🌟' : (leftW > rightW ? 'Tilted Left ↙' : 'Tilted Right ↘')}
          </div>
        `;
      }
    }

    let beamHTML = '';
    let leftPlateHTML = '';
    let rightPlateHTML = '';
    
    if (style === 'builder') {
      beamHTML = `
        <!-- Main girder -->
        <rect x="120" y="96" width="360" height="8" rx="2" fill="#374151" stroke="#4b5563" stroke-width="1.5"/>
        <line x1="200" y1="96" x2="200" y2="104" stroke="#9ca3af" stroke-width="1.5"/>
        <line x1="300" y1="90" x2="300" y2="110" stroke="#9ca3af" stroke-width="2"/>
        <line x1="400" y1="96" x2="400" y2="104" stroke="#9ca3af" stroke-width="1.5"/>
        <line x1="120" y1="96" x2="200" y2="104" stroke="#4b5563" stroke-width="1"/>
        <line x1="200" y1="104" x2="300" y2="96" stroke="#4b5563" stroke-width="1"/>
        <line x1="300" y1="96" x2="400" y2="104" stroke="#4b5563" stroke-width="1"/>
        <line x1="400" y1="104" x2="480" y2="96" stroke="#4b5563" stroke-width="1"/>
      `;
      leftPlateHTML = `
        <line x1="120" y1="100" x2="80" y2="240" stroke="#4b5563" stroke-width="2.5" stroke-dasharray="1 3" stroke-linecap="round"/>
        <line x1="120" y1="100" x2="160" y2="240" stroke="#4b5563" stroke-width="2.5" stroke-dasharray="1 3" stroke-linecap="round"/>
        <path d="M 70 240 L 170 240 L 155 255 L 85 255 Z" fill="#4b5563" stroke="#1e293b" stroke-width="2"/>
        <line x1="85" y1="245" x2="155" y2="245" stroke="#374151" stroke-width="1"/>
        <line x1="80" y1="250" x2="160" y2="250" stroke="#374151" stroke-width="1"/>
      `;
      rightPlateHTML = `
        <line x1="480" y1="100" x2="440" y2="240" stroke="#4b5563" stroke-width="2.5" stroke-dasharray="1 3" stroke-linecap="round"/>
        <line x1="480" y1="100" x2="520" y2="240" stroke="#4b5563" stroke-width="2.5" stroke-dasharray="1 3" stroke-linecap="round"/>
        <path d="M 430 240 L 530 240 L 515 255 L 445 255 Z" fill="#4b5563" stroke="#1e293b" stroke-width="2"/>
        <line x1="445" y1="245" x2="515" y2="245" stroke="#374151" stroke-width="1"/>
        <line x1="440" y1="250" x2="520" y2="250" stroke="#374151" stroke-width="1"/>
      `;
    } else if (style === 'logician') {
      beamHTML = `
        <line x1="120" y1="100" x2="480" y2="100" stroke="#06b6d4" stroke-width="4.5" stroke-linecap="round" style="filter: drop-shadow(0 0 5px rgba(6, 182, 212, 0.85));"/>
      `;
      leftPlateHTML = `
        <line x1="120" y1="100" x2="80" y2="240" stroke="#0891b2" stroke-width="1.5" style="filter: drop-shadow(0 0 3px rgba(8, 145, 178, 0.6));"/>
        <line x1="120" y1="100" x2="160" y2="240" stroke="#0891b2" stroke-width="1.5" style="filter: drop-shadow(0 0 3px rgba(8, 145, 178, 0.6));"/>
        <path d="M 70 240 L 170 240 L 155 255 L 85 255 Z" fill="rgba(6, 182, 212, 0.1)" stroke="#06b6d4" stroke-width="2" style="filter: drop-shadow(0 0 3px rgba(6, 182, 212, 0.4));"/>
      `;
      rightPlateHTML = `
        <line x1="480" y1="100" x2="440" y2="240" stroke="#0891b2" stroke-width="1.5" style="filter: drop-shadow(0 0 3px rgba(8, 145, 178, 0.6));"/>
        <line x1="480" y1="100" x2="520" y2="240" stroke="#0891b2" stroke-width="1.5" style="filter: drop-shadow(0 0 3px rgba(8, 145, 178, 0.6));"/>
        <path d="M 430 240 L 530 240 L 515 255 L 445 255 Z" fill="rgba(6, 182, 212, 0.1)" stroke="#06b6d4" stroke-width="2" style="filter: drop-shadow(0 0 3px rgba(6, 182, 212, 0.4));"/>
      `;
    } else {
      beamHTML = `
        <line x1="120" y1="100" x2="480" y2="100" stroke="#4b5563" stroke-width="6" stroke-linecap="round"/>
      `;
      leftPlateHTML = `
        <line x1="120" y1="100" x2="80" y2="240" stroke="#9ca3af" stroke-width="2"/>
        <line x1="120" y1="100" x2="160" y2="240" stroke="#9ca3af" stroke-width="2"/>
        <path d="M 70 240 L 170 240 L 155 255 L 85 255 Z" fill="#6b7280" stroke="#4b5563" stroke-width="2"/>
      `;
      rightPlateHTML = `
        <line x1="480" y1="100" x2="440" y2="240" stroke="#9ca3af" stroke-width="2"/>
        <line x1="480" y1="100" x2="520" y2="240" stroke="#9ca3af" stroke-width="2"/>
        <path d="M 430 240 L 530 240 L 515 255 L 445 255 Z" fill="#6b7280" stroke="#4b5563" stroke-width="2"/>
      `;
    }

    this.container.innerHTML = `
      <div class="lab-container">
        <!-- Main Scale Workspace -->
        <div class="glass-card puzzle-workspace-card">
          <div class="puzzle-header-row">
            <div class="puzzle-title">
              <h2>Balance Scale Laboratory</h2>
              <p>${subtitle}</p>
            </div>
            <div class="puzzle-controls" style="display: flex; gap: 0.3rem; flex-wrap: wrap; max-height: 85px; overflow-y: auto; padding-right: 5px; max-width: 400px;">
              ${(() => {
                const isMaster = adaptiveEngine.hasCompletedAllPostOriginalGrades();
                const highest = adaptiveEngine.state.stats.mathLevelsCompleted || 0;
                let maxLevel = 3;
                if (isMaster) {
                  maxLevel = 100;
                } else if (highest >= 10) {
                  maxLevel = Math.min(100, highest + 5);
                } else if (highest >= 3) {
                  maxLevel = 10;
                } else if ((adaptiveEngine.state.stats.mathLevelsCompletedList || []).length >= 3) {
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

          <!-- Mathematical Equation Display -->
          <div style="display: flex; flex-direction: column; align-items: center; margin: 0.5rem 0; gap: 0.3rem;">
            <div class="equation-display">
              <span class="eq-left">${leftW} kg</span>
              <span class="eq-equal">${leftW === rightW ? '＝' : '≠'}</span>
              <span class="eq-right">${rightW} kg</span>
            </div>
            ${eqLabelHTML}
          </div>

          <!-- Scale Graphic Container -->
          <div class="balance-scale-wrapper">
            <svg class="balance-svg" viewBox="0 0 600 350">
              <defs>
                <!-- Color Gradients -->
                <linearGradient id="weightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="${weightGradStart}"/>
                  <stop offset="100%" stop-color="${weightGradEnd}"/>
                </linearGradient>
                <linearGradient id="chestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="${chestGradStart}"/>
                  <stop offset="100%" stop-color="${chestGradEnd}"/>
                </linearGradient>
                <linearGradient id="sackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#b45309"/>
                  <stop offset="100%" stop-color="#78350f"/>
                </linearGradient>
                <linearGradient id="balloonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="${balloonGradStart}"/>
                  <stop offset="100%" stop-color="${balloonGradEnd}"/>
                </linearGradient>
                <linearGradient id="standGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#374151"/>
                  <stop offset="100%" stop-color="#111827"/>
                </linearGradient>
              </defs>

              <!-- Central Vertical Stand -->
              <rect x="292" y="100" width="16" height="200" rx="4" fill="url(#standGrad)"/>
              <ellipse cx="300" cy="300" rx="40" ry="12" fill="url(#standGrad)"/>

              <!-- Central Pivot Point -->
              <circle cx="300" cy="100" r="8" fill="#4b5563" stroke="#9ca3af" stroke-width="2"/>

              <!-- Moving Scale Parts (Rotated) -->
              <g style="transform: rotate(${angle}deg); transform-origin: 300px 100px; transition: transform 0.5s ease-out;">
                <!-- Main Balance Beam Line -->
                ${beamHTML}
                
                <!-- Left Plate, Strings, & Dropzone -->
                ${leftPlateHTML}
                <rect id="left-plate-dropzone" class="dropzone" x="70" y="200" width="100" height="40" rx="4"/>

                <!-- Right Plate, Strings, & Dropzone -->
                ${rightPlateHTML}
                <rect id="right-plate-dropzone" class="dropzone" x="430" y="200" width="100" height="40" rx="4"/>
                
                <!-- Items sitting inside scale plates (they rotate with scale) -->
                <g id="left-items-group">
                  ${this.drawSideItems(this.leftItems, 120, 240, 'left')}
                </g>
                <g id="right-items-group">
                  ${this.drawSideItems(this.rightItems, 480, 240, 'right')}
                </g>
              </g>
            </svg>

            <button class="clear-plate-btn" data-side="left" style="position: absolute; bottom: 8px; left: 8px; font-size: 0.75rem; background: rgba(239, 68, 68, 0.15); border: none; color: #f87171; padding: 0.4rem 0.8rem; border-radius: 5px; cursor: pointer;">Clear Left</button>
            <button class="clear-plate-btn" data-side="right" style="position: absolute; bottom: 8px; right: 8px; font-size: 0.75rem; background: rgba(239, 68, 68, 0.15); border: none; color: #f87171; padding: 0.4rem 0.8rem; border-radius: 5px; cursor: pointer;">Clear Right</button>
          </div>

          <!-- Bottom Panel: Drag items & Symbolic solver -->
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <!-- Drag Palette -->
            <div style="text-align: center; font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">
              Grabbing Drag-and-Drop Elements:
            </div>
            <div class="inventory-bar">
              ${isHighSchool ? `
                <div class="inventory-item" draggable="true" data-type="chest">
                  <div class="item-visual chest">x</div>
                  <div class="item-label">${chestLabel}</div>
                </div>
                <div class="inventory-item" draggable="true" data-type="sack">
                  <div class="item-visual sack" style="background: #b45309; border-radius: 4px; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; font-weight: bold; color: white;">y</div>
                  <div class="item-label">Sack (y)</div>
                </div>
              ` : (!isEarly ? `
                <div class="inventory-item" draggable="true" data-type="chest">
                  <div class="item-visual chest">x</div>
                  <div class="item-label">${chestLabel}</div>
                </div>
              ` : '')}
              <div class="inventory-item" draggable="true" data-type="weight">
                <div class="item-visual weight">1</div>
                <div class="item-label">${weightLabel}</div>
              </div>
              ${!isEarly ? `
                <div class="inventory-item" draggable="true" data-type="balloon">
                  <div class="item-visual balloon">-1</div>
                  <div class="item-label">${balloonLabel}</div>
                </div>
              ` : ''}
            </div>

            ${!isEarly ? `
              <!-- Symbolic Operator Panel -->
              <div style="text-align: center; font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">
                Solve symbolically (Applies to both sides simultaneously):
              </div>
              <div class="algebraic-actions">
                <button class="puzzle-btn" id="op-add-weight">+1 Weight</button>
                <button class="puzzle-btn" id="op-sub-weight">-1 Weight</button>
                <button class="puzzle-btn" id="op-add-chest">+1 Chest (x)</button>
                <button class="puzzle-btn" id="op-sub-chest">-1 Chest (x)</button>
                ${isHighSchool ? `
                  <button class="puzzle-btn" id="op-add-sack" style="background: rgba(180, 83, 9, 0.2); border-color: rgba(180, 83, 9, 0.4); color: #f59e0b;">+1 Sack (y)</button>
                  <button class="puzzle-btn" id="op-sub-sack" style="background: rgba(180, 83, 9, 0.2); border-color: rgba(180, 83, 9, 0.4); color: #f59e0b;">-1 Sack (y)</button>
                ` : ''}
              </div>
              <button class="puzzle-btn" id="balance-solve-steps-btn" style="background: rgba(14, 165, 233, 0.15); border-color: rgba(14, 165, 233, 0.4); color: #38bdf8; margin-top: 0.5rem; justify-content: center; width: 100%;">📊 Show Step-by-Step Algebra Solver</button>
            ` : ''}
          </div>
        </div>

        <!-- Sidebar: Sparky Guide Panel -->
        <div id="balance-sparky-sidebar"></div>
      </div>
    `;

    // Render Sparky inside the lab panel sidebar as well
    if (this.sparky) {
      this.sparky.destroy();
    }
    this.sparky = new SparkyGuide('balance-sparky-sidebar');

    this.bindEvents();
  }

  showAlgebraSteps() {
    // Check if there is already a modal
    if (document.querySelector('.modal-overlay')) return;

    const lc = this.leftItems.filter(i => i.type === 'chest').length;
    const rc = this.rightItems.filter(i => i.type === 'chest').length;
    const ls = this.leftItems.filter(i => i.type === 'sack').length;
    const rs = this.rightItems.filter(i => i.type === 'sack').length;
    const lw = this.leftItems.filter(i => i.type === 'weight').length - this.leftItems.filter(i => i.type === 'balloon').length;
    const rw = this.rightItems.filter(i => i.type === 'weight').length - this.rightItems.filter(i => i.type === 'balloon').length;

    const formatExpression = (c, s, w) => {
      let parts = [];
      if (c > 0) parts.push(c === 1 ? 'x' : `${c}x`);
      if (s > 0) parts.push(s === 1 ? 'y' : `${s}y`);
      if (w !== 0) {
        if (parts.length === 0) {
          parts.push(`${w}`);
        } else {
          parts.push(w > 0 ? `+ ${w}` : `- ${Math.abs(w)}`);
        }
      }
      return parts.length === 0 ? '0' : parts.join(' ');
    };

    let steps = [];
    let curLc = lc, curRc = rc, curLs = ls, curRs = rs, curLw = lw, curRw = rw;

    const addStep = (title, leftExpr, rightExpr, explanation) => {
      steps.push({ title, leftExpr, rightExpr, explanation });
    };

    // Starting equation
    addStep("Original Equation", formatExpression(curLc, curLs, curLw), formatExpression(curRc, curRs, curRw), "This is the current algebraic representation of the items on the see-saw scale.");

    // Step 1: Handle variable y substitution if in high school grade
    const profile = (adaptiveEngine && adaptiveEngine.state && adaptiveEngine.state.profile) || { grade: 4 };
    if (profile.grade >= 9 && (curLs > 0 || curRs > 0)) {
      const relExplanation = `Sacks (y) are known to weigh exactly 2 kg less than Chests (x) on this level. We substitute <b>y = x - 2</b> into the equation.`;
      
      // Substitute y = x - 2
      const subLeftLc = curLc + curLs;
      const subLeftLw = curLw - 2 * curLs;
      const subRightRc = curRc + curRs;
      const subRightRw = curRw - 2 * curRs;

      let subLeftStr = '';
      if (curLs > 0) {
        subLeftStr = curLc > 0 ? `${curLc}x + ${curLs}(x - 2)` : `${curLs}(x - 2)`;
        if (curLw !== 0) subLeftStr += curLw > 0 ? ` + ${curLw}` : ` - ${Math.abs(curLw)}`;
      } else {
        subLeftStr = formatExpression(curLc, 0, curLw);
      }

      let subRightStr = '';
      if (curRs > 0) {
        subRightStr = curRc > 0 ? `${curRc}x + ${curRs}(x - 2)` : `${curRs}(x - 2)`;
        if (curRw !== 0) subRightStr += curRw > 0 ? ` + ${curRw}` : ` - ${Math.abs(curRw)}`;
      } else {
        subRightStr = formatExpression(curRc, 0, curRw);
      }

      addStep("Variable Substitution", subLeftStr, subRightStr, relExplanation);

      curLc = subLeftLc;
      curLw = subLeftLw;
      curRc = subRightRc;
      curRw = subRightRw;
      curLs = 0;
      curRs = 0;

      addStep("Simplify Substitution", formatExpression(curLc, 0, curLw), formatExpression(curRc, 0, curRw), "Expand the brackets and combine like terms.");
    }

    // Step 2: Simplify variable x by subtracting smaller coefficient from both sides
    if (curLc > 0 && curRc > 0) {
      const subX = Math.min(curLc, curRc);
      curLc -= subX;
      curRc -= subX;
      addStep("Subtract Variables", formatExpression(curLc, 0, curLw), formatExpression(curRc, 0, curRw), `Subtract ${subX === 1 ? 'x' : `${subX}x`} from both sides of the see-saw to simplify variables.`);
    }

    // Step 3: Simplify constants
    if (curLw !== 0 && curRw !== 0) {
      if (curLc > 0) {
        const subW = curLw;
        curLw -= subW;
        curRw -= subW;
        addStep("Isolate Variable Term", formatExpression(curLc, 0, curLw), formatExpression(curRc, 0, curRw), `Subtract ${subW} from both sides to isolate the variable term.`);
      } else if (curRc > 0) {
        const subW = curRw;
        curLw -= subW;
        curRw -= subW;
        addStep("Isolate Variable Term", formatExpression(curLc, 0, curLw), formatExpression(curRc, 0, curRw), `Subtract ${subW} from both sides to isolate the variable term.`);
      }
    }

    // Step 4: Divide by coefficient if coefficient > 1
    const activeCoef = curLc > 0 ? curLc : curRc;
    const activeConst = curLc > 0 ? curRw : curLw;
    if (activeCoef > 1) {
      const finalVal = activeConst / activeCoef;
      addStep("Divide to Solve", curLc > 0 ? "x" : `${activeConst} / ${activeCoef}`, curLc > 0 ? `${activeConst} / ${activeCoef}` : "x", `Divide both sides by ${activeCoef} to find the final value of x.`);
      curLc = curLc > 0 ? 1 : 0;
      curRc = curRc > 0 ? 1 : 0;
      curLw = curLc > 0 ? 0 : finalVal;
      curRw = curLc > 0 ? finalVal : 0;
    }

    // Final balance solution
    addStep("Solution Achieved", curLc > 0 ? "x" : `${curLw}`, curLc > 0 ? `${curRw}` : "x", `The solution is <b>x = ${this.secretX} kg</b>.`);

    // Build steps HTML list
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    
    let stepsHTML = '';
    steps.forEach((s, index) => {
      stepsHTML += `
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--card-border); border-radius: var(--border-radius-sm); padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.4rem;">
            <span style="font-weight: 700; color: hsl(var(--accent-cyan)); font-size: 0.9rem;">Step ${index + 1}: ${s.title}</span>
            <span style="font-family: monospace; font-size: 1.05rem; font-weight: 700; color: #fff;">${s.leftExpr} = ${s.rightExpr}</span>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; margin: 0;">${s.explanation}</p>
        </div>
      `;
    });

    modal.innerHTML = `
      <div class="modal-content glass-card" style="max-width: 550px; max-height: 80vh; overflow-y: auto; display: flex; flex-direction: column; gap: 1.2rem;">
        <h3 style="margin: 0; font-size: 1.2rem; font-weight: 800; text-align: center; color: #fff;">📊 Step-by-Step Algebraic Solver</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin: 0;">
          This visualizer converts the see-saw scale items into formal algebra and solves it step-by-step.
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 0.8rem; overflow-y: auto; max-height: 50vh; padding-right: 5px;">
          ${stepsHTML}
        </div>
        
        <button class="puzzle-btn primary" id="close-solve-steps-btn" style="justify-content: center; width: 100%;">Close Visualizer</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#close-solve-steps-btn').addEventListener('click', () => {
      modal.remove();
    });
  }

  destroy() {
    window.removeEventListener('sparkyCoSolveStep', this.boundCoSolve);
    window.removeEventListener('equiliprismStateChanged', this.boundStateChange);
    if (this.sparky) {
      this.sparky.destroy();
    }
  }
}
