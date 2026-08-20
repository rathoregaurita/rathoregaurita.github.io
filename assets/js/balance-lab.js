import { adaptiveEngine } from '../hooks/adaptive-engine.js';
export class BalanceLab {
  constructor(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this.isCreativeMode = false;
    this.secretX = 5;
    this.leftItems = [];
    this.rightItems = [];
    this.dragging = null; // {side, id}
    this.init();
  }

  init() {
    // seed with a couple of items for demo
    if (!this.leftItems.length && !this.rightItems.length) {
      this.leftItems.push({ id: 'x-1', type: 'chest', value: this.secretX });
      this.rightItems.push({ id: 'w-1', type: 'weight', value: 1 });
    }
    this.render();
  }

  addWeight(side, type = 'weight', value = 1) {
    const id = `${side}-${Date.now()}`;
    const item = { id, type, value };
    if (side === 'left') this.leftItems.push(item);
    else this.rightItems.push(item);
    this.render();
  }

  removeItem(side, id) {
    if (side === 'left') this.leftItems = this.leftItems.filter(i => i.id !== id);
    else this.rightItems = this.rightItems.filter(i => i.id !== id);
    this.render();
  }

  moveItem(fromSide, toSide, id) {
    const arrFrom = fromSide === 'left' ? this.leftItems : this.rightItems;
    const arrTo = toSide === 'left' ? this.leftItems : this.rightItems;
    const idx = arrFrom.findIndex(i => i.id === id);
    if (idx === -1) return;
    const [itm] = arrFrom.splice(idx, 1);
    arrTo.push(itm);
    this.render();
  }

  total(side) {
    const arr = side === 'left' ? this.leftItems : this.rightItems;
    return arr.reduce((s, i) => s + (i.type === 'chest' ? (i.value === undefined ? this.secretX : i.value) : i.value), 0);
  }

  renderScaleSVG() {
    const leftTotal = this.total('left');
    const rightTotal = this.total('right');
    const tilt = Math.max(-18, Math.min(18, (rightTotal - leftTotal) * 2));
    return `
      <svg id="scale-svg" width="100%" height="220" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#020617" flood-opacity="0.6"/></filter>
        </defs>
        <rect x="0" y="0" width="600" height="220" fill="none"/>
        <g transform="translate(300,110)">
          <rect x="-6" y="-70" width="12" height="140" fill="rgba(255,255,255,0.03)"/>
          <g transform="rotate(${tilt})" style="transition:transform 300ms ease">
            <rect x="-220" y="-6" width="440" height="12" rx="6" fill="linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))" stroke="rgba(255,255,255,0.03)"/>
            <g transform="translate(-190,60)">
              <g id="left-plate">
                <ellipse cx="120" cy="20" rx="120" ry="18" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.03)"/>
              </g>
              <g id="right-plate" transform="translate(220,0)">
                <ellipse cx="120" cy="20" rx="120" ry="18" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.03)"/>
              </g>
              <text x="60" y="18" text-anchor="middle" fill="#e6eef8" font-size="12">Left: ${leftTotal}</text>
              <text x="320" y="18" text-anchor="middle" fill="#e6eef8" font-size="12">Right: ${rightTotal}</text>
            </g>
          </g>
        </g>
      </svg>
    `;
  }

  renderItemList(side) {
    const items = side === 'left' ? this.leftItems : this.rightItems;
    return `
      <div class="item-list" data-side="${side}" style="display:flex;flex-direction:column;gap:0.4rem">
        ${items.map(i => `<div draggable="true" class="draggable-item" data-id="${i.id}" data-type="${i.type}" style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem;border-radius:8px;background:linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005));border:1px solid rgba(255,255,255,0.02);">
            <div><strong>${i.type}</strong> ${i.type==='chest'?`(x=${i.value===undefined?this.secretX:i.value})`:`(${i.value})`}</div>
            <div style="display:flex;gap:0.4rem"><button class="move-btn" data-id="${i.id}" data-side="${side}" data-action="move">Move</button><button class="remove-item-btn" data-id="${i.id}" data-side="${side}">✕</button></div>
          </div>`).join('')}
      </div>
    `;
  }

  bindEvents() {
    // add buttons
    this.container.querySelectorAll('.add-left-weight')?.forEach(btn => btn.addEventListener('click', () => this.addWeight('left', 'weight', 1)));
    this.container.querySelectorAll('.add-right-weight')?.forEach(btn => btn.addEventListener('click', () => this.addWeight('right', 'weight', 1)));
    this.container.querySelectorAll('.add-left-chest')?.forEach(btn => btn.addEventListener('click', () => this.addWeight('left', 'chest', this.secretX)));
    this.container.querySelectorAll('.add-right-chest')?.forEach(btn => btn.addEventListener('click', () => this.addWeight('right', 'chest', this.secretX)));

    // remove
    this.container.querySelectorAll('.remove-item-btn').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id'); const side = btn.getAttribute('data-side'); this.removeItem(side, id);
    }));

    // move buttons (simple UI to move between plates)
    this.container.querySelectorAll('.move-btn').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id'); const side = btn.getAttribute('data-side'); const toSide = side === 'left' ? 'right' : 'left'; this.moveItem(side, toSide, id);
    }));

    // drag & drop between lists
    const lists = this.container.querySelectorAll('.item-list');
    lists.forEach(list => {
      list.addEventListener('dragstart', (e) => {
        const el = e.target.closest('.draggable-item'); if (!el) return; e.dataTransfer.setData('text/plain', el.getAttribute('data-id'));
      });
      list.addEventListener('dragover', (e) => { e.preventDefault(); });
      list.addEventListener('drop', (e) => {
        e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); const toSide = list.getAttribute('data-side');
        // find fromSide
        const fromSide = this.leftItems.find(i => i.id === id) ? 'left' : (this.rightItems.find(i => i.id === id) ? 'right' : null);
        if (fromSide && fromSide !== toSide) this.moveItem(fromSide, toSide, id);
      });
    });

    // secret input
    const secretInput = this.container.querySelector('#secret-x-input');
    if (secretInput) secretInput.addEventListener('input', (e) => { this.secretX = parseInt(e.target.value || '1'); this.render(); });

    // solve button
    const solveBtn = this.container.querySelector('#solve-for-x-btn');
    if (solveBtn) solveBtn.addEventListener('click', () => {
      const leftChests = this.leftItems.filter(i => i.type === 'chest');
      const rightChests = this.rightItems.filter(i => i.type === 'chest');
      const leftFixed = this.leftItems.filter(i => i.type !== 'chest').reduce((s, i) => s + i.value, 0);
      const rightFixed = this.rightItems.filter(i => i.type !== 'chest').reduce((s, i) => s + i.value, 0);
      const a = leftChests.length; const b = rightChests.length;
      if (a - b === 0) { alert('Cannot solve: variable cancels out.'); return; }
      const x = (rightFixed - leftFixed) / (a - b);
      alert('Solved x = ' + x.toFixed(2));
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="glass-card">
        <h2>Balance Lab</h2>
        <div style="display:flex;gap:1rem;align-items:flex-start">
          <div style="flex:1">${this.renderScaleSVG()}</div>
          <div style="width:360px;">
            <div style="margin-bottom:0.6rem"><label class="small">Secret variable x:</label><input id="secret-x-input" type="number" min="1" max="50" value="${this.secretX}" style="width:100%;padding:0.5rem;border-radius:6px;background:transparent;border:1px solid var(--card-border);color:var(--text-main)"/></div>
            <div style="display:flex;gap:0.5rem;margin-bottom:0.8rem">
              <button class="add-left-chest puzzle-btn">Add Chest (x) left</button>
              <button class="add-right-chest puzzle-btn">Add Chest (x) right</button>
            </div>
            <div style="display:flex;gap:0.5rem;margin-bottom:0.8rem">
              <button class="add-left-weight puzzle-btn">+1 left</button>
              <button class="add-right-weight puzzle-btn">+1 right</button>
            </div>
            <div style="margin-bottom:0.8rem"><button id="solve-for-x-btn" class="puzzle-btn primary">Solve for x</button></div>
            <h4>Left Plate</h4>
            ${this.renderItemList('left')}
            <h4 style="margin-top:0.8rem">Right Plate</h4>
            ${this.renderItemList('right')}
          </div>
        </div>
      </div>
    `;
    this.bindEvents();
  }

  destroy() { /* no persistent listeners */ }
}
