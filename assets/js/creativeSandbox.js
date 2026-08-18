import { BalanceLab } from './balance-lab.js';
import { PhotonLab } from './photon-lab.js';
export class CreativeSandbox {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.sandboxMode = 'math'; this.activeSubLab = null; this.secretXVal = 5; this.selectedCreationId = null;
    this.customLevels = JSON.parse(localStorage.getItem('equiliprism_creations') || '[]');
  }
  bindEvents() {
    this.container.querySelectorAll('.sandbox-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sandboxMode = btn.getAttribute('data-mode');
        if (this.activeSubLab && typeof this.activeSubLab.destroy === 'function') this.activeSubLab.destroy();
        this.initSandbox();
      });
    });
    if (this.sandboxMode === 'math') {
      const secretInput = this.container.querySelector('#sandbox-secret-x');
      if (secretInput) {
        secretInput.addEventListener('input', (e) => {
          this.secretXVal = parseInt(e.target.value);
          if (this.activeSubLab) {
            this.activeSubLab.secretX = this.secretXVal;
            this.activeSubLab.leftItems.forEach(i => { if (i.type === 'chest') i.value = this.secretXVal; });
            this.activeSubLab.rightItems.forEach(i => { if (i.type === 'chest') i.value = this.secretXVal; });
            this.activeSubLab.render();
          }
        });
      }
    } else {
      this.container.querySelector('#add-sandbox-laser')?.addEventListener('click', () => {
        this.activeSubLab.lasers.push({ x: 50, y: 100 + Math.random() * 150, angle: 0, color: '#ffffff' });
        this.activeSubLab.draw();
      });
      this.container.querySelector('#add-sandbox-target')?.addEventListener('click', () => {
        this.activeSubLab.targets.push({ x: 500, y: 100 + Math.random() * 150, r: 16, color: '#ffffff', hit: false });
        this.activeSubLab.draw();
      });
      this.container.querySelector('#add-sandbox-wall')?.addEventListener('click', () => {
        this.activeSubLab.obstacles.push({ x: 200 + Math.random() * 100, y: 80 + Math.random() * 100, w: 40, h: 150 });
        this.activeSubLab.draw();
      });
    }
    this.container.querySelector('#sandbox-save-btn')?.addEventListener('click', () => this.saveCreation());
    this.container.querySelector('#sandbox-import-btn')?.addEventListener('click', () => this.importCreation());
    this.container.querySelector('#sandbox-share-btn')?.addEventListener('click', () => this.shareCreation());
    this.container.querySelector('#sandbox-delete-btn')?.addEventListener('click', () => this.deleteCreation());
    this.container.querySelector('#sandbox-load-select')?.addEventListener('change', (e) => {
      if (e.target.value) this.loadCreation(e.target.value); else this.initSandbox();
    });
  }
  initSandbox() {
    if (this.sandboxMode === 'math') {
      this.activeSubLab = new BalanceLab('sandbox-workspace');
      this.activeSubLab.isCreativeMode = true; this.activeSubLab.secretX = this.secretXVal;
      this.activeSubLab.leftItems = [{ id: 'x-1', type: 'chest', value: this.secretXVal }];
      this.activeSubLab.rightItems = [{ id: 'w-1', type: 'weight', value: 1 }];
      this.activeSubLab.render();
    } else {
      this.activeSubLab = new PhotonLab('sandbox-workspace');
      this.activeSubLab.lasers = [{ x: 80, y: 200, angle: 0, color: '#ffffff' }];
      this.activeSubLab.targets = [{ x: 500, y: 200, r: 16, color: '#ffffff', hit: false }];
      this.activeSubLab.obstacles = []; this.activeSubLab.items = [];
      this.activeSubLab.render();
    }
  }
  saveCreation() {
    const name = prompt("Name your level:"); if (!name) return;
    const data = this.sandboxMode === 'math' 
      ? { mode: 'math', secretX: this.secretXVal, left: this.activeSubLab.leftItems, right: this.activeSubLab.rightItems }
      : { mode: 'science', lasers: this.activeSubLab.lasers, targets: this.activeSubLab.targets, obstacles: this.activeSubLab.obstacles };
    const creation = { id: `c-${Date.now()}`, name, timestamp: Date.now(), data };
    this.customLevels.push(creation);
    localStorage.setItem('equiliprism_creations', JSON.stringify(this.customLevels));
    alert("Saved level!"); this.render(); this.loadCreation(creation.id);
  }
  deleteCreation() {
    if (!this.selectedCreationId) return;
    this.customLevels = this.customLevels.filter(c => c.id !== this.selectedCreationId);
    localStorage.setItem('equiliprism_creations', JSON.stringify(this.customLevels));
    this.selectedCreationId = null; this.render();
  }
  shareCreation() {
    const level = this.customLevels.find(c => c.id === this.selectedCreationId);
    if (!level) return;
    const code = 'EP-' + btoa(JSON.stringify(level.data));
    navigator.clipboard.writeText(code).then(() => alert("Copied Level Code:\n" + code));
  }
  importCreation() {
    const code = prompt("Paste level code (starts with EP-):");
    if (!code || !code.startsWith('EP-')) return;
    try {
      const data = JSON.parse(atob(code.substring(3)));
      const name = prompt("Name imported level:"); if (!name) return;
      const creation = { id: `c-${Date.now()}`, name, data };
      this.customLevels.push(creation);
      localStorage.setItem('equiliprism_creations', JSON.stringify(this.customLevels));
      this.render(); this.loadCreation(creation.id);
    } catch (e) { alert("Failed to import."); }
  }
  loadCreation(id) {
    const level = this.customLevels.find(c => c.id === id); if (!level) return;
    this.selectedCreationId = id; this.sandboxMode = level.data.mode; this.render();
    if (this.sandboxMode === 'math') {
      this.secretXVal = level.data.secretX; this.activeSubLab.secretX = this.secretXVal;
      this.activeSubLab.leftItems = level.data.left || []; this.activeSubLab.rightItems = level.data.right || [];
      this.activeSubLab.render();
    } else {
      this.activeSubLab.lasers = level.data.lasers || []; this.activeSubLab.targets = level.data.targets || [];
      this.activeSubLab.obstacles = level.data.obstacles || []; this.activeSubLab.items = []; this.activeSubLab.draw();
    }
  }
  destroy() { if (this.activeSubLab) this.activeSubLab.destroy(); }
  render() {
    this.container.innerHTML = `
      <div style="display: grid; grid-template-columns: 280px 1fr; gap: 2rem;">
        <div class="glass-card">
          <h3>Sandbox Studio</h3>
          <div class="sandbox-mode-toggle">
            <button class="sandbox-toggle-btn" data-mode="math">Math</button>
            <button class="sandbox-toggle-btn" data-mode="science">Science</button>
          </div>
          <div style="margin: 1rem 0;">
            ${this.sandboxMode === 'math' ? `
              <input type="range" id="sandbox-secret-x" min="1" max="10" value="${this.secretXVal}" />
            ` : `
              <button id="add-sandbox-laser">+ Laser</button>
              <button id="add-sandbox-target">+ Sensor</button>
              <button id="add-sandbox-wall">+ Concrete Wall</button>
            `}
          </div>
          <button id="sandbox-save-btn">Save Level</button>
          <button id="sandbox-import-btn">Import Level</button>
          <button id="sandbox-share-btn">Share Code</button>
          <button id="sandbox-delete-btn">Delete Level</button>
          <select id="sandbox-load-select">
            <option value="">-- Saved Levels --</option>
            ${this.customLevels.map(c => `<option value="${c.id}" ${this.selectedCreationId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
        <div id="sandbox-workspace" style="flex:1;"></div>
      </div>
    `;
    this.initSandbox(); this.bindEvents();
  }
}
