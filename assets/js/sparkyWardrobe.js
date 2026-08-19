import { adaptiveEngine } from '../hooks/adaptive-engine.js';
const REWARDS = [
  { id: 'skin-default', name: 'Original Sparky', type: 'skin', value: 'default', req: 0, desc: 'Your cosmic companion.' },
  { id: 'item-bubble_tea', name: 'Bubble Tea', type: 'mouth', value: 'bubble_tea', req: 1, desc: 'Sweet milk tea with pearls!' },
  { id: 'skin-cat', name: 'Cute Cat', type: 'skin', value: 'cat', req: 2, desc: 'A soft orange kitty skin.' },
  { id: 'item-fish_hat', name: 'Fish Hat', type: 'head', value: 'fish_hat', req: 3, desc: 'A silly blue fish hat!' },
  { id: 'skin-dog', name: 'Playful Dog', type: 'skin', value: 'dog', req: 4, desc: 'A happy retriever puppy.' },
  { id: 'skin-panda', name: 'Sleepy Panda', type: 'skin', value: 'panda', req: 6, desc: 'A black-and-white bear.' },
  { id: 'skin-dragon', name: 'Fire Dragon', type: 'skin', value: 'dragon', req: 8, desc: 'A green dragon.' },
  { id: 'item-dragon_wings', name: 'Dragon Wings', type: 'back', value: 'dragon_wings', req: 9, desc: 'Large scaly wings.' },
  { id: 'skin-unicorn', name: 'Magic Unicorn', type: 'skin', value: 'unicorn', req: 10, desc: 'A unicorn skin.' },
  { id: 'item-rainbow_horn', name: 'Rainbow Horn', type: 'head', value: 'rainbow_horn', req: 11, desc: 'Glowing horn.' },
  { id: 'skin-phoenix', name: 'Fiery Phoenix', type: 'skin', value: 'phoenix', req: 12, desc: 'Bird of fire.' },
  { id: 'item-flame_crown', name: 'Flame Crown', type: 'head', value: 'flame_crown', req: 13, desc: 'Pure crown of fire.' },
  { id: 'item-cape', name: 'Hero Cape', type: 'back', value: 'cape', req: 15, desc: 'A red cape.' },
  { id: 'item-wizard_hat', name: 'Wizard Hat', type: 'head', value: 'wizard_hat', req: 18, desc: 'Pointed starry hat.' }
];
export class SparkyWardrobe {
  constructor(containerId) {
    this.container = document.getElementById(containerId); this.activeTab = 'all';
    this.boundStateChange = () => this.render();
    window.addEventListener('equiliprismStateChanged', this.boundStateChange);
  }
  getSparkySVG() {
    const custom = adaptiveEngine.state.customSparky || { skin: 'default', headItem: null, mouthItem: null, backItem: null };
    const skin = custom.skin || 'default', head = custom.headItem, mouth = custom.mouthItem, back = custom.backItem;
    let bodyCol = 'purple', strokeCol = 'cyan', ears = '', face = '', backSVG = '', headSVG = '', mouthSVG = '';
    if (skin === 'cat') { bodyCol = '#f59e0b'; strokeCol = '#d97706'; ears = '<polygon points="12,18 4,6 18,12" fill="#f59e0b"/>'; face = '<polygon points="30,26 27,23 33,23" fill="#f43f5e"/>'; }
    else if (skin === 'dog') { bodyCol = '#d97706'; strokeCol = '#b45309'; ears = '<path d="M 8 16 Q 0 24 6 36 Z" fill="#b45309"/>'; }
    if (back === 'dragon_wings') backSVG = '<path d="M 12 24 C -8 10 -4 42 10 32 Z" fill="#059669" class="wing-l"/>';
    else if (back === 'cape') backSVG = '<path d="M 16 26 L 4 52 L 20 48 L 44 26 Z" fill="#ef4444"/>';
    if (head === 'fish_hat') headSVG = '<ellipse cx="30" cy="8" rx="8" ry="5" fill="#3b82f6"/>';
    else if (head === 'wizard_hat') headSVG = '<polygon points="30,-10 16,12 44,12" fill="#3b82f6"/>';
    if (mouth === 'bubble_tea') mouthSVG = '<rect x="36" y="24" width="10" height="15" fill="#fbbf24"/>';
    return `
      <svg class="sparky-character" viewBox="0 0 60 60" style="width:100%; height:100%;">
        ${backSVG}
        ${ears}
        <circle cx="30" cy="30" r="18" fill="${bodyCol}" stroke="${strokeCol}" stroke-width="2"/>
        <g class="sparky-eyes eye-happy">
          <circle cx="21" cy="22" r="4" fill="#fff"/><circle cx="21" cy="22" r="2" fill="#000"/>
          <circle cx="39" cy="22" r="4" fill="#fff"/><circle cx="39" cy="22" r="2" fill="#000"/>
        </g>
        ${face}
        ${headSVG}
        ${mouthSVG}
      </svg>
    `;
  }
  getRewardIconSVG(reward) {
    return `<svg viewBox="0 0 24 24" width="40" height="40"><circle cx="12" cy="12" r="8" fill="purple"/></svg>`;
  }
  bindEvents() {
    this.container.querySelectorAll('.wardrobe-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => { this.activeTab = btn.getAttribute('data-tab'); this.render(); });
    });
    this.container.querySelectorAll('.reward-equip-btn').forEach(btn => {
      btn.addEventListener('click', () => this.toggleEquip(btn.getAttribute('data-id')));
    });
  }
  toggleEquip(rewardId) {
    const reward = REWARDS.find(r => r.id === rewardId); if (!reward) return;
    const stats = adaptiveEngine.state.stats;
    const completedList = [...new Set([...(stats.mathLevelsCompletedList || []), ...(stats.scienceLevelsCompletedList || [])])];
    if (completedList.length < reward.req) { alert(`Solve ${reward.req} puzzles to unlock!`); return; }
    const custom = adaptiveEngine.state.customSparky || { skin: 'default', headItem: null, mouthItem: null, backItem: null };
    if (reward.type === 'skin') custom.skin = reward.value;
    else if (reward.type === 'head') custom.headItem = custom.headItem === reward.value ? null : reward.value;
    else if (reward.type === 'mouth') custom.mouthItem = custom.mouthItem === reward.value ? null : reward.value;
    else if (reward.type === 'back') custom.backItem = custom.backItem === reward.value ? null : reward.value;
    adaptiveEngine.state.customSparky = custom; adaptiveEngine.saveState();
  }
  destroy() { window.removeEventListener('equiliprismStateChanged', this.boundStateChange); }
  render() {
    let totalLevelsSolved = 0;
    const completedPuzzles = adaptiveEngine.state.completedPuzzles || {};
    Object.keys(completedPuzzles).forEach(key => {
      totalLevelsSolved += [...new Set([...(completedPuzzles[key].math || []), ...(completedPuzzles[key].science || [])])].length;
    });
    const filtered = REWARDS.filter(r => this.activeTab === 'all' || r.type === this.activeTab);
    const custom = adaptiveEngine.state.customSparky || { skin: 'default', headItem: null, mouthItem: null, backItem: null };
    this.container.innerHTML = `
      <div class="wardrobe-container">
        <div class="glass-card wardrobe-preview-card">
          <h2>Sparky's Wardrobe</h2>
          <div class="wardrobe-preview-mount">${this.getSparkySVG()}</div>
          <p>Total Puzzles Solved: <strong>${totalLevelsSolved}</strong></p>
        </div>
        <div class="glass-card">
          <div class="wardrobe-tabs">
            <button class="wardrobe-tab-btn" data-tab="all">All</button>
            <button class="wardrobe-tab-btn" data-tab="skin">Skins</button>
            <button class="wardrobe-tab-btn" data-tab="head">Hats</button>
            <button class="wardrobe-tab-btn" data-tab="mouth">Items</button>
            <button class="wardrobe-tab-btn" data-tab="back">Wings</button>
          </div>
          <div class="wardrobe-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:1.2rem;">
            ${filtered.map(r => {
              const unlocked = totalLevelsSolved >= r.req;
              let equipped = false;
              if (r.type === 'skin') equipped = custom.skin === r.value;
              else if (r.type === 'head') equipped = custom.headItem === r.value;
              else if (r.type === 'mouth') equipped = custom.mouthItem === r.value;
              else if (r.type === 'back') equipped = custom.backItem === r.value;
              return `
                <div class="reward-card" style="border: 1px solid ${equipped ? 'hsl(var(--accent-pink))' : '#ccc'}; padding:1rem; text-align:center;">
                  <h4>${r.name}</h4>
                  <p>${r.desc}</p>
                  ${unlocked ? `
                    <button class="reward-equip-btn" data-id="${r.id}">${equipped ? 'Equipped ✓' : 'Equip'}</button>
                  ` : `<p>Requires ${r.req} Solved</p>`}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
    this.bindEvents();
  }
}
