import { audioManager } from './audioManager.js';
export class Soundtrack {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.active = false;
    this.animationFrameId = null;
    this.boundStateChange = (e) => { this.updatePlayerUI(e.detail); };
    window.addEventListener('equiliprismAudioStateChanged', this.boundStateChange);
  }
  bindEvents() {
    const playPauseBtn = this.container.querySelector('#soundtrack-play-btn');
    const prevBtn = this.container.querySelector('#soundtrack-prev-btn');
    const nextBtn = this.container.querySelector('#soundtrack-next-btn');
    const volSlider = this.container.querySelector('#soundtrack-volume-slider');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        if (audioManager.isPlaying) audioManager.pause(); else audioManager.play();
      });
    }
    if (prevBtn) prevBtn.addEventListener('click', () => audioManager.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => audioManager.next());
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        audioManager.setVolume(parseFloat(e.target.value));
      });
    }
    this.container.querySelectorAll('.playlist-row-play').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const forceRestart = (audioManager.currentTrackIdx === idx);
        audioManager.currentTrackIdx = idx;
        audioManager.play(forceRestart);
        this.render();
      });
    });
    this.container.querySelectorAll('.playlist-row-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm("Remove this custom track?")) {
          audioManager.deleteCustomTrack(btn.getAttribute('data-id'));
          this.render();
        }
      });
    });
    const addForm = this.container.querySelector('#add-custom-track-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = this.container.querySelector('#custom-title').value.trim();
        const artist = this.container.querySelector('#custom-artist').value.trim();
        const url = this.container.querySelector('#custom-url').value.trim();
        if (title && artist && url) {
          audioManager.addCustomTrack(title, artist, url);
          this.render();
        }
      });
    }
    this.initVisualizer();
  }
  initVisualizer() {
    const canvas = this.container.querySelector('#audio-visualizer-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const bufferLength = audioManager.analyser ? audioManager.analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);
    const draw = () => {
      if (!this.active) return;
      this.animationFrameId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (audioManager.isPlaying) {
        const isStream = audioManager.tracks[audioManager.currentTrackIdx].type === 'stream';
        if (isStream) {
          const time = Date.now() * 0.004;
          const barWidth = (canvas.width / bufferLength) * 1.5;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const noise = Math.sin(i * 0.3 + time) * Math.cos(i * 0.1 - time * 0.5);
            const val = Math.abs(noise) * 160 + Math.sin(time + i) * 20 + 40;
            const barHeight = (Math.max(10, Math.min(255, val)) / 255) * canvas.height * 0.8;
            ctx.fillStyle = `rgb(${Math.round(6 + (230) * (i / bufferLength))}, 180, 212)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 3, barHeight);
            x += barWidth;
          }
        } else if (audioManager.analyser) {
          audioManager.analyser.getByteFrequencyData(dataArray);
          const barWidth = (canvas.width / bufferLength) * 1.5;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
            ctx.fillStyle = `rgb(${Math.round(6 + (230) * (i / bufferLength))}, 180, 212)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 3, barHeight);
            x += barWidth;
          }
        }
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath(); ctx.moveTo(0, canvas.height - 5); ctx.lineTo(canvas.width, canvas.height - 5); ctx.stroke();
      }
    };
    draw();
  }
  updatePlayerUI(state) {
    const playBtn = this.container.querySelector('#soundtrack-play-btn');
    const record = this.container.querySelector('.record-vinyl');
    const toneArm = this.container.querySelector('.tone-arm');
    const titleEl = this.container.querySelector('#track-title-label');
    const artistEl = this.container.querySelector('#track-artist-label');
    const descEl = this.container.querySelector('#track-desc-label');
    if (playBtn) {
      playBtn.innerHTML = state.isPlaying 
        ? `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`
        : `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    }
    if (record) { if (state.isPlaying) record.classList.add('spinning'); else record.classList.remove('spinning'); }
    if (toneArm) toneArm.style.transform = state.isPlaying ? 'rotate(18deg)' : 'rotate(0deg)';
    if (titleEl) titleEl.textContent = state.track.title;
    if (artistEl) artistEl.textContent = state.isLoading ? 'Connecting...' : state.track.artist;
    if (descEl) descEl.textContent = state.isLoading ? 'Buffering stream. Please wait...' : (state.track.description || 'Custom streaming track.');
    this.container.querySelectorAll('.playlist-row-play').forEach((btn, idx) => {
      const isActive = state.currentTrackIdx === idx;
      btn.style.color = isActive ? 'hsl(var(--accent-cyan))' : 'var(--text-muted)';
      btn.innerHTML = isActive && state.isLoading ? '⏳' : (isActive && state.isPlaying ? '❚❚' : '▶');
    });
  }
  destroy() { this.active = false; if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId); window.removeEventListener('equiliprismAudioStateChanged', this.boundStateChange); }
  render() {
    this.active = true;
    const currentTrack = audioManager.tracks[audioManager.currentTrackIdx];
    this.container.innerHTML = `
      <div style="display: grid; grid-template-columns: 280px 1fr; gap: 2rem; max-width: 850px; margin: 1.5rem auto; width: 100%;">
        <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center;">
          <h2>✦ Audio Deck ✦</h2>
          <div class="record-vinyl-container" style="position: relative; width: 160px; height: 160px; margin: 0.5rem 0;">
            <div class="record-vinyl ${audioManager.isPlaying ? 'spinning' : ''}"><div class="record-center"><div class="record-label-groove"></div></div></div>
            <div class="tone-arm" style="position: absolute; top: -12px; right: 0; width: 60px; height: 90px; transform-origin: 45px 12px; transform: rotate(${audioManager.isPlaying ? '18deg' : '0deg'})">
              <svg viewBox="0 0 100 150" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="3"><path d="M 60 15 L 60 60 L 20 120"/><circle cx="60" cy="15" r="8" fill="#1e293b"/></svg>
            </div>
          </div>
          <div>
            <h3 id="track-title-label">${currentTrack.title}</h3>
            <h4 id="track-artist-label">${currentTrack.artist}</h4>
            <p id="track-desc-label">${currentTrack.description || 'Custom stream.'}</p>
          </div>
          <canvas id="audio-visualizer-canvas" width="220" height="40" style="background: rgba(0,0,0,0.2); border-radius: var(--border-radius-sm);"></canvas>
          <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
            <div style="display: flex; gap: 1rem; justify-content: center;">
              <button class="soundtrack-control-btn" id="soundtrack-prev-btn">◀◀</button>
              <button class="soundtrack-control-btn play-pause-active" id="soundtrack-play-btn">${audioManager.isPlaying ? '❚❚' : '▶'}</button>
              <button class="soundtrack-control-btn" id="soundtrack-next-btn">▶▶</button>
            </div>
            <input type="range" id="soundtrack-volume-slider" min="0" max="1" step="0.05" value="${audioManager.volume}" style="width: 100%;" />
          </div>
        </div>
        <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
          <h3>Study Playlist Customizer</h3>
          <div style="border: 1px solid var(--card-border); border-radius: var(--border-radius-sm); max-height: 240px; overflow-y: auto;">
            ${audioManager.tracks.map((t, idx) => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid var(--card-border); background: ${audioManager.currentTrackIdx === idx ? 'rgba(0,0,0,0.06)' : 'transparent'};">
                <div style="display: flex; align-items: center; gap: 0.8rem; flex: 1;">
                  <button class="playlist-row-play" data-index="${idx}">${audioManager.currentTrackIdx === idx && audioManager.isPlaying ? '❚❚' : '▶'}</button>
                  <div><span>${t.title}</span><br><small>${t.artist}</small></div>
                </div>
                ${t.id.startsWith('custom-') ? `<button class="playlist-row-delete" data-id="${t.id}">✕</button>` : ''}
              </div>
            `).join('')}
          </div>
          <form id="add-custom-track-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
            <input type="text" id="custom-title" placeholder="Song Title" required class="modal-input" />
            <input type="text" id="custom-artist" placeholder="Artist Name" required class="modal-input" />
            <input type="url" id="custom-url" placeholder="Direct MP3 Stream URL" required class="modal-input" style="grid-column: span 2;" />
            <button type="submit" class="puzzle-btn primary" style="grid-column: span 2;">Add to Playlist</button>
          </form>
        </div>
      </div>
    `;
    this.bindEvents();
  }
}
