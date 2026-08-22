// EquiliPrism Soundtrack Player Component
import { audioManager } from '../hooks/audio-manager.js?v=2';

export class Soundtrack {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.active = false;
    this.animationFrameId = null;
    
    // Bind state changes to re-render player stats
    this.boundStateChange = (e) => {
      this.updatePlayerUI(e.detail);
    };
    window.addEventListener('equiliprismAudioStateChanged', this.boundStateChange);
  }

  bindEvents() {
    const playPauseBtn = this.container.querySelector('#soundtrack-play-btn');
    const prevBtn = this.container.querySelector('#soundtrack-prev-btn');
    const nextBtn = this.container.querySelector('#soundtrack-next-btn');
    const volSlider = this.container.querySelector('#soundtrack-volume-slider');

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        if (audioManager.isPlaying) {
          audioManager.pause();
        } else {
          audioManager.play();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        audioManager.prev();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        audioManager.next();
      });
    }

    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        audioManager.setVolume(val);
      });
    }

    // Playlist row interactions
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
        const id = btn.getAttribute('data-id');
        if (confirm("Are you sure you want to remove this custom track from your playlist?")) {
          audioManager.deleteCustomTrack(id);
          this.render();
        }
      });
    });

    // Add custom track form handler
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

    // Initialize visualizer canvas loop
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
          // Simulate beautiful wave data
          const time = Date.now() * 0.004;
          const barWidth = (canvas.width / bufferLength) * 1.5;
          let x = 0;
          
          for (let i = 0; i < bufferLength; i++) {
            const noise = Math.sin(i * 0.3 + time) * Math.cos(i * 0.1 - time * 0.5);
            const val = Math.abs(noise) * 160 + Math.sin(time + i) * 20 + 40;
            const barHeight = (Math.max(10, Math.min(255, val)) / 255) * canvas.height * 0.8;
            
            const percent = i / bufferLength;
            const r = Math.round(6 + (236 - 6) * percent);
            const g = Math.round(182 + (72 - 182) * percent);
            const b = Math.round(212 + (153 - 212) * percent);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 3, barHeight);
            x += barWidth;
          }
        } else if (audioManager.analyser) {
          audioManager.analyser.getByteFrequencyData(dataArray);

          const barWidth = (canvas.width / bufferLength) * 1.5;
          let barHeight;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

            const percent = i / bufferLength;
            const r = Math.round(6 + (236 - 6) * percent);
            const g = Math.round(182 + (72 - 182) * percent);
            const b = Math.round(212 + (153 - 212) * percent);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 3, barHeight);

            x += barWidth;
          }
        }
      } else {
        // Idle soft neon line in center
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 5);
        ctx.lineTo(canvas.width, canvas.height - 5);
        ctx.stroke();
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

    if (record) {
      if (state.isPlaying) {
        record.classList.add('spinning');
      } else {
        record.classList.remove('spinning');
      }
    }

    if (toneArm) {
      toneArm.style.transform = state.isPlaying ? 'rotate(18deg)' : 'rotate(0deg)';
    }

    if (titleEl) titleEl.textContent = state.track.title;
    if (artistEl) {
      if (state.isLoading) {
        artistEl.innerHTML = `<span class="pulse-loading-text" style="color: hsl(var(--accent-cyan)); font-weight: 700;">Connecting...</span>`;
      } else {
        artistEl.textContent = state.track.artist;
      }
    }
    if (descEl) {
      if (state.isLoading) {
        descEl.innerHTML = `<span class="pulse-loading-text" style="color: var(--text-muted); font-size: 0.72rem;">Buffering audio stream from host. Please wait...</span>`;
      } else {
        descEl.textContent = state.track.description || 'Custom user-added stream track.';
      }
    }

    // Refresh playlist row highlights
    this.container.querySelectorAll('.playlist-row-play').forEach((btn, idx) => {
      const isThisActive = state.currentTrackIdx === idx;
      btn.style.color = isThisActive ? 'hsl(var(--accent-cyan))' : 'var(--text-muted)';
      if (isThisActive && state.isLoading) {
        btn.innerHTML = `<span class="spin-loader" style="font-size: 0.8rem;">⏳</span>`;
      } else {
        btn.innerHTML = isThisActive && state.isPlaying ? '❚❚' : '▶';
      }
    });
  }

  destroy() {
    this.active = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('equiliprismAudioStateChanged', this.boundStateChange);
  }

  render() {
    this.active = true;
    const currentTrack = audioManager.tracks[audioManager.currentTrackIdx];
    const isPlaying = audioManager.isPlaying;
    const isLoading = audioManager.isLoading;

    this.container.innerHTML = `
      <style>
      @keyframes pulse-loading {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }
      @keyframes spin-hourglass {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .pulse-loading-text {
        animation: pulse-loading 1.2s ease-in-out infinite;
      }
      .spin-loader {
        display: inline-block;
        animation: spin-hourglass 1.5s linear infinite;
      }
      </style>
      <div style="display: grid; grid-template-columns: 280px 1fr; gap: 2rem; max-width: 850px; margin: 1.5rem auto; width: 100%;">
        
        <!-- Left Panel: Vinyl Player -->
        <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; text-align: center; justify-content: center; max-height: 600px;">
          <div>
            <h2 style="font-size: 1.6rem; font-weight: 800; background: linear-gradient(135deg, hsl(var(--accent-pink)), hsl(var(--accent-cyan))); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.2rem;">✦ Audio Deck ✦</h2>
            <p style="font-size: 0.78rem; color: var(--text-muted);">Calm ambient workspace music</p>
          </div>

          <!-- Vinyl Record Container -->
          <div class="record-vinyl-container" style="position: relative; width: 160px; height: 160px; filter: drop-shadow(0 10px 25px rgba(0,0,0,0.45)); margin: 0.5rem 0;">
            <div class="record-vinyl ${isPlaying ? 'spinning' : ''}">
              <div class="record-center" style="top: 35%; left: 35%; width: 30%; height: 30%;">
                <div class="record-label-groove"></div>
              </div>
            </div>
            <!-- Tone arm decoration -->
            <div class="tone-arm" style="position: absolute; top: -12px; right: 0; width: 60px; height: 90px; transform-origin: 45px 12px; transform: rotate(${isPlaying ? '18deg' : '0deg'}); transition: transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1); pointer-events: none; z-index: 10;">
              <svg viewBox="0 0 100 150" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="3">
                <path d="M 60 15 L 60 60 L 20 120" stroke-linecap="round"/>
                <rect x="15" y="115" width="10" height="20" rx="2" fill="rgba(255,255,255,0.9)" stroke="none"/>
                <circle cx="60" cy="15" r="8" fill="#1e293b" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
              </svg>
            </div>
          </div>

          <!-- Track metadata -->
          <div style="min-height: 80px; max-width: 240px;">
            <h3 id="track-title-label" style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.2rem; color: var(--text-main); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${currentTrack.title}</h3>
            <h4 id="track-artist-label" style="font-size: 0.85rem; font-weight: 600; color: hsl(var(--accent-cyan)); margin-bottom: 0.5rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${isLoading ? `<span class="pulse-loading-text">Connecting...</span>` : currentTrack.artist}
            </h4>
            <p id="track-desc-label" style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.4; max-height: 40px; overflow-y: auto;">
              ${isLoading ? `<span class="pulse-loading-text">Buffering audio stream from host. Please wait...</span>` : (currentTrack.description || 'Custom user-added stream track.')}
            </p>
          </div>

          <!-- Canvas Audio Wave Visualizer -->
          <canvas id="audio-visualizer-canvas" width="220" height="40" style="background: rgba(0,0,0,0.2); border-radius: var(--border-radius-sm); border: 1px solid var(--card-border); max-width: 100%;"></canvas>

          <!-- Player Controls -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; width: 100%;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <button class="soundtrack-control-btn" id="soundtrack-prev-btn" title="Previous Track" style="width: 38px; height: 38px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
              <button class="soundtrack-control-btn play-pause-active" id="soundtrack-play-btn" title="Play / Pause" style="width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, hsl(var(--accent-pink)), hsl(var(--accent-violet))); color: #fff; box-shadow: 0 6px 20px rgba(236,72,153,0.3); border: none; cursor: pointer; transition: transform 0.15s ease;">
                ${isPlaying 
                  ? `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`
                  : `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`}
              </button>
              <button class="soundtrack-control-btn" id="soundtrack-next-btn" title="Next Track" style="width: 38px; height: 38px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 18l8.5-6L6 6zm9-12v12h2V6z"/></svg>
              </button>
            </div>

            <!-- Volume Slider -->
            <div style="display: flex; align-items: center; gap: 0.5rem; width: 100%;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--text-muted)" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke-linecap="round"/></svg>
              <input type="range" id="soundtrack-volume-slider" min="0" max="1" step="0.05" value="${audioManager.volume}" style="flex: 1; cursor: pointer; height: 3px; background: rgba(255,255,255,0.1); border-radius: 1px; outline: none;" />
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--text-muted)" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke-linecap="round"/></svg>
            </div>
          </div>
        </div>

        <!-- Right Panel: Playlist Builder -->
        <div class="glass-card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; max-height: 600px; overflow-y: auto;">
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 0.3rem;">Study Playlist Customizer</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Manage your tracks and queue up custom streaming MP3 urls to listen in the background.</p>
          </div>

          <!-- Playlist Table -->
          <div style="border: 1px solid var(--card-border); border-radius: var(--border-radius-sm); overflow: hidden; background: rgba(0,0,0,0.15);">
            <div style="max-height: 240px; overflow-y: auto;">
              ${audioManager.tracks.map((t, idx) => {
                const isActive = audioManager.currentTrackIdx === idx;
                const isCustom = t.id.startsWith('custom-');
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid var(--card-border); background: ${isActive ? 'rgba(147, 51, 234, 0.08)' : 'transparent'}; transition: background 0.15s ease;">
                    <div style="display: flex; align-items: center; gap: 0.8rem; flex: 1; min-width: 0;">
                      <button class="playlist-row-play" data-index="${idx}" style="background: none; border: none; color: ${isActive ? 'hsl(var(--accent-cyan))' : 'var(--text-muted)'}; cursor: pointer; font-size: 1rem; padding: 0.2rem; display: flex; align-items: center; justify-content: center; transition: color 0.15s ease;">
                        ${isActive && isLoading ? `<span class="spin-loader" style="font-size: 0.8rem;">⏳</span>` : (isActive && isPlaying ? '❚❚' : '▶')}
                      </button>
                      <div style="min-width: 0; display: flex; flex-direction: column;">
                        <span style="font-size: 0.85rem; font-weight: 700; color: ${isActive ? 'hsl(var(--accent-cyan))' : 'var(--text-main)'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.title}</span>
                        <span style="font-size: 0.72rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.artist} ${isCustom ? '(Custom)' : ''}</span>
                      </div>
                    </div>
                    
                    ${isCustom ? `
                      <button class="playlist-row-delete" data-id="${t.id}" style="background: none; border: none; color: rgba(239,68,68,0.6); cursor: pointer; padding: 0.3rem; display: flex; align-items: center; font-size: 0.8rem;" title="Delete custom track">
                        ✕
                      </button>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Add custom audio track form -->
          <div style="border-top: 1px solid var(--card-border); padding-top: 1.2rem; display: flex; flex-direction: column; gap: 0.8rem;">
            <h4 style="font-size: 0.92rem; font-weight: 700;">+ Add Custom Stream Track</h4>
            
            <form id="add-custom-track-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
              <input type="text" id="custom-title" placeholder="Song Title" required class="modal-input" style="padding: 0.55rem; font-size: 0.82rem;" />
              <input type="text" id="custom-artist" placeholder="Artist Name" required class="modal-input" style="padding: 0.55rem; font-size: 0.82rem;" />
              <input type="url" id="custom-url" placeholder="Direct MP3 Audio Stream URL" required class="modal-input" style="grid-column: span 2; padding: 0.55rem; font-size: 0.82rem;" />
              
              <button type="submit" class="puzzle-btn primary" style="grid-column: span 2; padding: 0.6rem; font-size: 0.85rem; justify-content: center; background: hsl(var(--accent-green));">
                Add to Playlist
              </button>
            </form>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
  }
}
