export class PhotonLab {
  constructor(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this.lasers = [];
    this.targets = [];
    this.obstacles = [];
    this.canvas = null; this.ctx = null;
    this.dragState = null; // {type:'laser'|'target', idx, offsetX, offsetY}
    this.init();
  }

  init() {
    // seed
    if (!this.lasers.length && !this.targets.length) {
      this.lasers.push({ x: 80, y: 160, angle: 0, color: '#fff' });
      this.targets.push({ x: 520, y: 160, r: 16, color: '#ffcc00', hit: false });
    }
    this.render();
  }

  addLaser(x=80,y=150,angle=0,color='#fff') { this.lasers.push({x,y,angle,color}); this.render(); }
  addTarget(x=500,y=150,r=12,color='#ffcc00'){ this.targets.push({x,y,r,color,hit:false}); this.render(); }
  addWall(x=300,y=120,w=40,h=140){ this.obstacles.push({x,y,w,h}); this.render(); }

  // trace ray with axis-aligned rectangle obstacles and reflections (limited bounces)
  traceRay(laser, maxBounces=3) {
    const segments = [];
    let px = laser.x, py = laser.y; let angle = laser.angle * Math.PI/180; let vx = Math.cos(angle), vy = Math.sin(angle);
    for (let bounce=0;bounce<=maxBounces;bounce++) {
      // find nearest intersection with obstacles or canvas bounds
      const len = 3000; const tx = px + vx*len, ty = py + vy*len;
      let nearest = {dist: Infinity, x: tx, y: ty, normal: null};
      // check targets for marking hits (not blocking)
      for (const t of this.targets) {
        const A = {x:px,y:py}, B = {x:tx,y:ty}, C = {x:t.x,y:t.y};
        const ABx = B.x-A.x, ABy=B.y-A.y; const ACx=C.x-A.x, ACy=C.y-A.y; const ab2 = ABx*ABx + ABy*ABy;
        const tProj = Math.max(0, Math.min(1, (ACx*ABx + ACy*ABy)/ab2));
        const PxI = A.x + ABx * tProj; const PyI = A.y + ABy * tProj; const dist = Math.hypot(PxI-C.x, PyI-C.y);
        if (dist <= t.r) t.hit = true;
      }
      for (const o of this.obstacles) {
        // rectangle sides
        const left = o.x - o.w/2, right = o.x + o.w/2, top = o.y - o.h/2, bottom = o.y + o.h/2;
        // parametric intersection with each side (as segment)
        const sides = [
          {x1:left,y1:top,x2:right,y2:top, nx:0, ny:-1}, // top
          {x1:right,y1:top,x2:right,y2:bottom, nx:1, ny:0},
          {x1:left,y1:bottom,x2:right,y2:bottom, nx:0, ny:1},
          {x1:left,y1:top,x2:left,y2:bottom, nx:-1, ny:0}
        ];
        for (const s of sides) {
          const denom = (s.x1 - s.x2) * (py - ty) - (s.y1 - s.y2) * (px - tx);
          if (Math.abs(denom) < 1e-6) continue;
          const t1 = ((s.x1 - px) * (py - ty) - (s.y1 - py) * (px - tx)) / denom;
          const t2 = ((s.x1 - px) * (s.y1 - s.y2) - (s.y1 - py) * (s.x1 - s.x2)) / denom;
          if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
            const ix = px + (tx-px) * t1; const iy = py + (ty-py) * t1; const dist = Math.hypot(ix - px, iy - py);
            if (dist < nearest.dist) nearest = {dist, x:ix, y:iy, normal: {nx:s.nx, ny:s.ny}};
          }
        }
      }
      if (nearest.dist === Infinity) { segments.push({x1:px,y1:py,x2:tx,y2:ty}); break; }
      // cut segment at intersection
      segments.push({x1:px,y1:py,x2:nearest.x,y2:nearest.y});
      // reflect velocity about normal
      const n = nearest.normal; const vdotn = vx*n.nx + vy*n.ny; vx = vx - 2*vdotn*n.nx; vy = vy - 2*vdotn*n.ny;
      // advance
      px = nearest.x + vx*0.5; py = nearest.y + vy*0.5; // small advance to avoid self intersection
    }
    return segments;
  }

  drawCanvas() {
    if (!this.canvas) return;
    const ctx = this.ctx; const w = this.canvas.width/this.dpr; const h = this.canvas.height/this.dpr;
    ctx.clearRect(0,0,w,h);
    // background
    ctx.fillStyle = 'rgba(255,255,255,0.01)'; ctx.fillRect(0,0,w,h);
    // obstacles
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (const o of this.obstacles) ctx.fillRect(o.x - o.w/2, o.y - o.h/2, o.w, o.h);
    // lasers and rays
    for (const l of this.lasers) {
      // draw laser head
      ctx.fillStyle = l.color; ctx.beginPath(); ctx.arc(l.x, l.y, 6, 0, Math.PI*2); ctx.fill();
      // draw direction indicator
      const ang = l.angle * Math.PI/180; ctx.strokeStyle = l.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(l.x + Math.cos(ang)*18, l.y + Math.sin(ang)*18); ctx.stroke();
      // trace
      const segs = this.traceRay(l, 4);
      ctx.strokeStyle = l.color; ctx.lineWidth = 1.5; ctx.beginPath();
      for (const s of segs) { ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2); }
      ctx.stroke();
    }
    // targets
    for (const t of this.targets) {
      ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI*2);
      ctx.fillStyle = t.hit ? 'rgba(96,165,250,0.95)' : 'rgba(255,204,0,0.85)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.stroke();
    }
  }

  bindUI() {
    this.container.querySelector('#add-laser-btn')?.addEventListener('click', ()=> this.addLaser(80 + Math.random()*40, 120 + Math.random()*120, Math.random()*360, '#fff'));
    this.container.querySelector('#add-target-btn')?.addEventListener('click', ()=> this.addTarget(300 + Math.random()*200, 100 + Math.random()*160, 12,'#ffcc00'));
    this.container.querySelector('#add-wall-btn')?.addEventListener('click', ()=> this.addWall(200+Math.random()*200,120+Math.random()*120,40,140));
    this.container.querySelector('#reset-hits-btn')?.addEventListener('click', ()=>{ this.targets.forEach(t=>t.hit=false); this.render(); });
    // pointer events for dragging
    const canvas = this.canvas; if (!canvas) return;
    canvas.style.touchAction = 'none';
    const onPointerDown = (e) => {
      const rect = canvas.getBoundingClientRect(); const x = (e.clientX - rect.left); const y = (e.clientY - rect.top);
      // find nearest laser or target within 12px
      let found = null; for (let i=0;i<this.lasers.length;i++){ const l=this.lasers[i]; if (Math.hypot(l.x-x,l.y-y)<12){ found={type:'laser',idx:i,offX:x-l.x,offY:y-l.y}; break; }}
      if (!found) for (let i=0;i<this.targets.length;i++){ const t=this.targets[i]; if (Math.hypot(t.x-x,t.y-y)<t.r+8){ found={type:'target',idx:i,offX:x-t.x,offY:y-t.y}; break; }}
      if (found) { this.dragState = found; canvas.setPointerCapture(e.pointerId); }
    };
    const onPointerMove = (e) => {
      if (!this.dragState) return; const rect = canvas.getBoundingClientRect(); const x = (e.clientX - rect.left); const y = (e.clientY - rect.top);
      if (this.dragState.type==='laser'){
        const l = this.lasers[this.dragState.idx]; l.x = x - this.dragState.offX; l.y = y - this.dragState.offY; // update angle by right-drag if ctrl
        if (e.shiftKey) { // rotate instead
          const dx = x - l.x; const dy = y - l.y; l.angle = Math.atan2(dy,dx)*180/Math.PI; }
      } else {
        const t = this.targets[this.dragState.idx]; t.x = x - this.dragState.offX; t.y = y - this.dragState.offY;
      }
      this.drawCanvas();
    };
    const onPointerUp = (e) => { if (!this.dragState) return; try{ this.canvas.releasePointerCapture(e.pointerId);}catch(_){} this.dragState=null; };
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
  }

  render() {
    this.container.innerHTML = `
      <div class="glass-card">
        <h2>Photon Lab</h2>
        <div style="display:flex;gap:1rem;align-items:flex-start">
          <div style="flex:1">
            <div style="width:100%; height:340px; border-radius:8px; overflow:hidden; background:linear-gradient(180deg,#021018,#071a2b); position:relative;">
              <canvas id="photon-canvas" width="900" height="340" style="width:100%;height:100%;display:block"></canvas>
            </div>
          </div>
          <div style="width:280px">
            <div style="display:flex;flex-direction:column;gap:0.6rem">
              <button id="add-laser-btn" class="puzzle-btn">+ Add Laser</button>
              <button id="add-target-btn" class="puzzle-btn">+ Add Target</button>
              <button id="add-wall-btn" class="puzzle-btn">+ Add Wall</button>
              <button id="reset-hits-btn" class="puzzle-btn">Reset Hits</button>
              <div class="small">Lasers: ${this.lasers.length} · Targets: ${this.targets.length} · Obstacles: ${this.obstacles.length}</div>
              <div class="small">Tip: drag lasers/targets on the canvas to reposition. Hold Shift while dragging a laser to rotate.</div>
            </div>
          </div>
        </div>
      </div>
    `;
    // setup canvas
    const canvas = this.container.querySelector('#photon-canvas');
    if (canvas) {
      this.canvas = canvas; this.ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1; this.dpr = dpr;
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; canvas.style.width = rect.width + 'px'; canvas.style.height = rect.height + 'px';
      this.ctx.setTransform(dpr,0,0,dpr,0,0);
      this.drawCanvas();
    }
    this.bindUI();
  }

  destroy() {}
}
