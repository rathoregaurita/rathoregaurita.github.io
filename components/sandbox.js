// EquiliPrism Creative Sandbox Component
import { BalanceLab } from './balance-lab.js';
import { PhotonLab } from './photon-lab.js';

export class CreativeSandbox {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.sandboxMode = 'math'; // 'math' | 'science'
    this.activeSubLab = null;
    this.secretXVal = 5;
    this.selectedCreationId = null;

    // Load list of custom creations
    this.customLevels = JSON.parse(localStorage.getItem('equiliprism_creations') || '[]');
  }

  bindEvents() {
    // Mode toggles
    this.container.querySelectorAll('.sandbox-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.sandbox-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.sandboxMode = btn.getAttribute('data-mode');
        
        // Clean up previous sub-lab event listeners before initializing a new one
        if (this.activeSubLab && typeof this.activeSubLab.destroy === 'function') {
          this.activeSubLab.destroy();
        }
        
        this.initSandbox();
      });
    });

    // Math specific edits
    if (this.sandboxMode === 'math') {
      const secretInput = this.container.querySelector('#sandbox-secret-x');
      if (secretInput) {
        secretInput.addEventListener('input', (e) => {
          this.secretXVal = parseInt(e.target.value);
          this.container.querySelector('#secret-x-val-lbl').textContent = this.secretXVal;
          if (this.activeSubLab) {
            this.activeSubLab.secretX = this.secretXVal;
            // Update chest values on scale
            this.activeSubLab.leftItems.forEach(i => { if (i.type === 'chest') i.value = this.secretXVal; });
            this.activeSubLab.rightItems.forEach(i => { if (i.type === 'chest') i.value = this.secretXVal; });
            this.activeSubLab.render();
          }
        });
      }
    }

    // Science specific edits: click on canvas to add lasers/targets in Design Mode
    if (this.sandboxMode === 'science') {
      const addLaserBtn = this.container.querySelector('#add-sandbox-laser');
      const addTargetBtn = this.container.querySelector('#add-sandbox-target');
      const addWallBtn = this.container.querySelector('#add-sandbox-wall');

      if (addLaserBtn) {
        addLaserBtn.addEventListener('click', () => {
          this.activeSubLab.lasers.push({
            x: 50,
            y: 80 + Math.random() * 200,
            angle: 0,
            color: '#ffffff'
          });
          this.activeSubLab.draw();
        });
      }

      if (addTargetBtn) {
        addTargetBtn.addEventListener('click', () => {
          const colors = ['#ffffff', '#ef4444', '#3b82f6'];
          const randColor = colors[Math.floor(Math.random() * colors.length)];
          this.activeSubLab.targets.push({
            x: 500,
            y: 80 + Math.random() * 200,
            r: 16,
            color: randColor,
            hit: false
          });
          this.activeSubLab.draw();
        });
      }

      if (addWallBtn) {
        addWallBtn.addEventListener('click', () => {
          this.activeSubLab.obstacles.push({
            x: 200 + Math.random() * 100,
            y: 50 + Math.random() * 100,
            w: 40,
            h: 150
          });
          this.activeSubLab.draw();
        });
      }
    }

    // Save, Import, Load, Share, and Delete Buttons
    const saveBtn = this.container.querySelector('#sandbox-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveCreation();
      });
    }

    const importBtn = this.container.querySelector('#sandbox-import-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        this.importCreation();
      });
    }

    const loadSelect = this.container.querySelector('#sandbox-load-select');
    if (loadSelect) {
      loadSelect.addEventListener('change', (e) => {
        const id = e.target.value;
        this.selectedCreationId = id || null;
        if (id) {
          this.loadCreation(id);
        } else {
          this.initSandbox();
        }
      });
    }

    const shareBtn = this.container.querySelector('#sandbox-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.shareCreation();
      });
    }

    const deleteBtn = this.container.querySelector('#sandbox-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        this.deleteCreation();
      });
    }
  }

  initSandbox() {
    const sandboxArea = this.container.querySelector('#sandbox-workspace');
    if (this.sandboxMode === 'math') {
      this.activeSubLab = new BalanceLab('sandbox-workspace');
      this.activeSubLab.isCreativeMode = true;
      this.activeSubLab.secretX = this.secretXVal;
      this.activeSubLab.leftItems = [{ id: 'x-1', type: 'chest', value: this.secretXVal }];
      this.activeSubLab.rightItems = [{ id: 'w-1', type: 'weight', value: 1 }];
      this.activeSubLab.render();
      
      // Override level selection from rendering, as it's sandbox
      const header = sandboxArea.querySelector('.puzzle-header-row');
      if (header) {
        header.innerHTML = `
          <div class="puzzle-title">
            <h2>Creative Math Playground</h2>
            <p>Design your own balance equation. Place chests and weights, set a secret value, and test it!</p>
          </div>
        `;
      }
    } else {
      this.activeSubLab = new PhotonLab('sandbox-workspace');
      this.activeSubLab.lasers = [{ x: 80, y: 200, angle: 0, color: '#ffffff' }];
      this.activeSubLab.targets = [{ x: 500, y: 200, r: 16, color: '#ffffff', hit: false }];
      this.activeSubLab.obstacles = [];
      this.activeSubLab.items = [];
      this.activeSubLab.render();

      const header = sandboxArea.querySelector('.puzzle-header-row');
      if (header) {
        header.innerHTML = `
          <div class="puzzle-title">
            <h2>Creative Optics Playground</h2>
            <p>Build your own obstacle course! Place lasers, walls, and target sensors anywhere. Then solve it!</p>
          </div>
        `;
      }
    }
  }

  saveCreation() {
    const name = prompt("Name your puzzle creation:");
    if (!name) return;

    let data = {};
    if (this.sandboxMode === 'math') {
      data = {
        mode: 'math',
        secretX: this.secretXVal,
        left: this.activeSubLab.leftItems,
        right: this.activeSubLab.rightItems
      };
    } else {
      data = {
        mode: 'science',
        lasers: this.activeSubLab.lasers,
        targets: this.activeSubLab.targets,
        obstacles: this.activeSubLab.obstacles
      };
    }

    const creation = {
      id: `c-${Date.now()}`,
      name,
      timestamp: Date.now(),
      data
    };

    this.customLevels.push(creation);
    localStorage.setItem('equiliprism_creations', JSON.stringify(this.customLevels));
    this.selectedCreationId = creation.id;
    alert(`Creation "${name}" saved successfully!`);
    this.render();
    this.loadCreation(creation.id);
  }

  deleteCreation() {
    const id = this.selectedCreationId;
    if (!id) {
      alert("Please select a custom level first!");
      return;
    }
    const level = this.customLevels.find(c => c.id === id);
    if (!level) return;
    if (confirm(`Are you sure you want to delete "${level.name}"?`)) {
      this.customLevels = this.customLevels.filter(c => c.id !== id);
      localStorage.setItem('equiliprism_creations', JSON.stringify(this.customLevels));
      this.selectedCreationId = null;
      alert(`Creation "${level.name}" deleted.`);
      this.render();
    }
  }

  shareCreation() {
    const id = this.selectedCreationId;
    if (!id) {
      alert("Please select a saved custom level first!");
      return;
    }
    const level = this.customLevels.find(c => c.id === id);
    if (!level) return;
    
    try {
      const code = btoa(unescape(encodeURIComponent(JSON.stringify(level.data))));
      const fullCode = `EP-${code}`;
      
      navigator.clipboard.writeText(fullCode).then(() => {
        alert(`Level code copied to clipboard! Share it with your friends:\n\n${fullCode}`);
      }).catch(() => {
        prompt("Copy this level sharing code:", fullCode);
      });
    } catch (e) {
      alert("Failed to generate sharing code: " + e.message);
    }
  }

  importCreation() {
    const code = prompt("Paste your level sharing code (starts with 'EP-'):");
    if (!code) return;
    if (!code.startsWith('EP-')) {
      alert("Invalid sharing code! Make sure it starts with 'EP-'.");
      return;
    }
    try {
      const dataStr = decodeURIComponent(escape(atob(code.substring(3))));
      const data = JSON.parse(dataStr);
      
      const name = prompt("Name this imported level:");
      if (!name) return;
      
      const creation = {
        id: `c-${Date.now()}`,
        name,
        timestamp: Date.now(),
        data
      };
      
      this.customLevels.push(creation);
      localStorage.setItem('equiliprism_creations', JSON.stringify(this.customLevels));
      this.selectedCreationId = creation.id;
      alert(`Level "${name}" imported successfully!`);
      this.render();
      this.loadCreation(creation.id);
    } catch (e) {
      alert("Error parsing level code. Please make sure the code is copied correctly.");
    }
  }

  loadCreation(id) {
    const level = this.customLevels.find(c => c.id === id);
    if (!level) return;

    this.selectedCreationId = id;
    this.sandboxMode = level.data.mode === 'math' ? 'math' : 'science';
    this.render();

    if (this.sandboxMode === 'math') {
      this.secretXVal = level.data.secretX;
      this.activeSubLab.secretX = this.secretXVal;
      this.activeSubLab.leftItems = level.data.left || [];
      this.activeSubLab.rightItems = level.data.right || [];
      this.activeSubLab.render();
      
      const secretInput = this.container.querySelector('#sandbox-secret-x');
      if (secretInput) {
        secretInput.value = this.secretXVal;
        this.container.querySelector('#secret-x-val-lbl').textContent = this.secretXVal;
      }
    } else {
      this.activeSubLab.lasers = level.data.lasers || [];
      this.activeSubLab.targets = level.data.targets || [];
      this.activeSubLab.obstacles = level.data.obstacles || [];
      this.activeSubLab.items = [];
      this.activeSubLab.draw();
    }
  }

  destroy() {
    if (this.activeSubLab && typeof this.activeSubLab.destroy === 'function') {
      this.activeSubLab.destroy();
    }
  }

  render() {
    this.container.innerHTML = `
      <div style="display: grid; grid-template-columns: 280px 1fr; gap: 2rem; flex: 1;">
        <!-- Left Sandbox Toolbox Panel -->
        <div class="glass-card sandbox-sidebar" style="max-height: 700px; overflow-y: auto;">
          <h3>Sandbox Studio</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.5rem;">
            Design customized math see-saws or laser courses. Set challenges for yourself or friends!
          </p>

          <!-- Mode selector toggles -->
          <div class="sandbox-mode-toggle">
            <button class="sandbox-toggle-btn ${this.sandboxMode === 'math' ? 'active' : ''}" data-mode="math">Math Scale</button>
            <button class="sandbox-toggle-btn ${this.sandboxMode === 'science' ? 'active' : ''}" data-mode="science">Optics Laser</button>
          </div>

          <hr style="border: none; border-top: 1px solid var(--card-border); margin: 0.5rem 0;" />

          <!-- Dynamic Configuration Controls -->
          <div id="sandbox-config-controls" style="display: flex; flex-direction: column; gap: 1.2rem;">
            ${this.sandboxMode === 'math' ? `
              <!-- Math Sandbox Controls -->
              <div>
                <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 0.4rem;">Secret Value of X (${this.secretXVal} kg):</label>
                <input type="range" id="sandbox-secret-x" min="1" max="10" value="${this.secretXVal}" style="width: 100%; cursor: pointer;" />
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
                  <span>1 kg</span>
                  <span id="secret-x-val-lbl" style="font-weight: 800; color: hsl(var(--accent-pink));">${this.secretXVal}</span>
                  <span>10 kg</span>
                </div>
              </div>
              <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">
                Adjusting the slider sets how heavy the mystery chest is. Test how weights react when you drag block items onto the scale!
              </p>
            ` : `
              <!-- Science Sandbox Controls -->
              <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                <h4 style="font-size: 0.88rem; font-weight: 700;">Place Map Elements:</h4>
                <button class="sparky-btn" id="add-sandbox-laser">+ Add White Laser</button>
                <button class="sparky-btn" id="add-sandbox-target">+ Add Light Sensor</button>
                <button class="sparky-btn" id="add-sandbox-wall">+ Add Concrete Wall</button>
                
                <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; margin-top: 0.5rem;">
                  Drag placed map elements inside the grid coordinates. Switch tools below the canvas to reflect and solve it!
                </p>
              </div>
            `}
          </div>

          <hr style="border: none; border-top: 1px solid var(--card-border); margin: 0.5rem 0;" />

          <!-- Save/Load/Import/Export items -->
          <div style="display: flex; flex-direction: column; gap: 0.8rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;">
              <button class="puzzle-btn primary" id="sandbox-save-btn" style="width: 100%; justify-content: center; background: hsl(var(--accent-green));">
                Save
              </button>
              <button class="puzzle-btn" id="sandbox-import-btn" style="width: 100%; justify-content: center; background: rgba(255,255,255,0.05); color: var(--text-main);">
                Import
              </button>
            </div>
            
            <div>
              <label style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Load Saved Level:</label>
              <div style="display: flex; gap: 0.4rem;">
                <select id="sandbox-load-select" class="modal-input" style="flex: 1; font-size: 0.82rem; padding: 0.5rem; background: rgba(255,255,255,0.05); border: 1px solid var(--card-border); color: var(--text-main);">
                  <option value="">-- Choose Level --</option>
                  ${this.customLevels.map(c => `<option value="${c.id}" ${this.selectedCreationId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
                <button class="puzzle-btn" id="sandbox-share-btn" style="background: rgba(6, 182, 212, 0.15); color: #22d3ee; border: none; padding: 0.5rem; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: var(--border-radius-sm);" title="Copy level sharing code">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </button>
                <button class="puzzle-btn" id="sandbox-delete-btn" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: none; padding: 0.5rem; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: var(--border-radius-sm);" title="Delete selected creation">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sandbox Workspace -->
        <div id="sandbox-workspace" style="display: flex; flex-direction: column; flex: 1;"></div>
      </div>
    `;

    // Initialize Active Sub Lab (Math scale vs. Science lasers)
    this.initSandbox();

    this.bindEvents();
  }
}
