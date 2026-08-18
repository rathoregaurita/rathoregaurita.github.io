class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.currentTrackIdx = 0;
    this.volume = 0.5;
    this.tracks = [
      { id: 'morning-glow', title: 'Morning Glow', artist: 'Ambient Synth', type: 'synth' },
      { id: 'soft-horizon', title: 'Soft Horizon', artist: 'EquiliPrism Synth', type: 'synth' },
      { id: 'peaceful-forest', title: 'Peaceful Forest', artist: 'Ambient Synth', type: 'synth' },
      { id: 'midnight-ocean', title: 'Midnight Ocean', artist: 'Dreamy Chimes', type: 'synth' },
      { id: 'little-star', title: 'Little Star Chimes', artist: 'EquiliPrism Synth', type: 'synth' }
    ];
    try {
      const customTracks = JSON.parse(localStorage.getItem('equiliprism_custom_tracks') || '[]');
      const unwanted = ['minecraft', 'sweden', 'c418', 'mincraft'];
      const filteredTracks = customTracks.filter(t => {
        const title = (t.title || '').toLowerCase();
        const artist = (t.artist || '').toLowerCase();
        return !unwanted.some(word => title.includes(word) || artist.includes(word));
      });
      if (filteredTracks.length !== customTracks.length) {
        localStorage.setItem('equiliprism_custom_tracks', JSON.stringify(filteredTracks));
      }
      this.tracks = [...this.tracks, ...filteredTracks];
    } catch (e) {
      console.error("Error loading custom tracks:", e);
    }
    this.synthInterval = null;
    this.streamAudio = null;
    this.activeOscillators = [];
    this.isLoading = false;
    this.currentPlayingTrackId = null;
  }
  init() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 64;
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
  }
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
    if (this.streamAudio) {
      this.streamAudio.volume = this.volume;
    }
    this.triggerUpdate();
  }
  play(forceRestart = false) {
    this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.isPlaying = true;
    this.isLoading = false;
    const track = this.tracks[this.currentTrackIdx];
    if (track.type === 'stream') {
      if (this.streamAudio && this.currentPlayingTrackId === track.id && !forceRestart) {
        this.streamAudio.volume = this.volume;
        this.streamAudio.play().catch(e => this.playStream(track.url));
      } else {
        this.stopPlayback(true);
        this.playStream(track.url);
      }
    } else {
      this.stopPlayback(true);
      this.playSynth(track.id);
    }
    this.triggerUpdate();
  }
  pause() {
    this.isPlaying = false;
    if (this.streamAudio) this.streamAudio.pause();
    if (this.synthInterval) { clearInterval(this.synthInterval); this.synthInterval = null; }
    if (this.activeOscillators.length > 0) {
      this.activeOscillators.forEach(osc => { try { osc.stop(); } catch(e) {} });
      this.activeOscillators = [];
    }
    this.triggerUpdate();
  }
  next() {
    this.currentTrackIdx = (this.currentTrackIdx + 1) % this.tracks.length;
    if (this.isPlaying) this.play(); else this.triggerUpdate();
  }
  prev() {
    this.currentTrackIdx = (this.currentTrackIdx - 1 + this.tracks.length) % this.tracks.length;
    if (this.isPlaying) this.play(); else this.triggerUpdate();
  }
  stopPlayback(forceDestroy = false) {
    if (this.streamAudio && forceDestroy) {
      this.streamAudio.pause();
      this.streamAudio = null;
      this.currentPlayingTrackId = null;
    }
    if (this.synthInterval) { clearInterval(this.synthInterval); this.synthInterval = null; }
    if (this.activeOscillators.length > 0) {
      this.activeOscillators.forEach(osc => { try { osc.stop(); } catch(e) {} });
      this.activeOscillators = [];
    }
  }
  playStream(url) {
    this.isLoading = true;
    this.triggerUpdate();
    const track = this.tracks[this.currentTrackIdx];
    this.currentPlayingTrackId = track ? track.id : null;
    this.streamAudio = new Audio();
    this.streamAudio.src = url;
    this.streamAudio.volume = this.volume;
    let hasStarted = false;
    const fallbackTimeout = setTimeout(() => {
      if (!hasStarted && this.isPlaying) {
        this.isLoading = false;
        this.triggerStreamFallback();
      }
    }, 12000);
    this.streamAudio.addEventListener('playing', () => {
      hasStarted = true;
      this.isLoading = false;
      clearTimeout(fallbackTimeout);
      this.triggerUpdate();
    });
    this.streamAudio.addEventListener('ended', () => { if (this.isPlaying) this.next(); });
    this.streamAudio.play().catch(e => {
      this.isLoading = false;
      clearTimeout(fallbackTimeout);
      this.triggerStreamFallback();
    });
  }
  triggerStreamFallback() {
    this.stopPlayback(true);
    const fallbackIdx = this.tracks.findIndex(t => t.type === 'synth');
    this.currentTrackIdx = fallbackIdx !== -1 ? fallbackIdx : 0;
    this.playSynth(this.tracks[this.currentTrackIdx].id);
    this.triggerUpdate();
  }
  playSynth(type) {
    this.currentPlayingTrackId = type;
    let chordIndex = 0, chordsPlayed = 0, chords = [];
    if (type === 'soft-horizon') {
      chords = [[60, 64, 67, 71], [65, 69, 72, 76], [67, 71, 74, 76], [69, 72, 76, 79]];
    } else if (type === 'little-star') {
      chords = [[60, 64, 67, 72], [65, 69, 72, 77], [67, 71, 74, 79], [60, 64, 67, 72]];
    } else if (type === 'peaceful-forest') {
      chords = [[48, 60, 64, 67, 71, 74], [53, 65, 69, 72, 76, 79], [55, 67, 71, 74, 78, 81]];
    } else if (type === 'midnight-ocean') {
      chords = [[56, 68, 72, 75, 79], [53, 65, 68, 72, 75], [49, 61, 65, 68, 72]];
    } else {
      chords = [[62, 66, 69, 73], [67, 71, 74, 78], [69, 73, 76, 79]];
    }
    const playChord = () => {
      if (!this.isPlaying || !this.audioCtx) return;
      if (chordsPlayed >= 12) { this.next(); return; }
      const chord = chords[chordIndex];
      chordIndex = (chordIndex + 1) % chords.length;
      chordsPlayed++;
      const now = this.audioCtx.currentTime;
      chord.forEach((note, idx) => {
        const freq = 440 * Math.pow(2, (note - 69) / 12);
        const osc = this.audioCtx.createOscillator();
        const nodeGain = this.audioCtx.createGain();
        let attack = 2.0 + idx * 0.4, decay = 7.0 + idx * 0.4, waveType = idx === 0 ? 'triangle' : 'sine', vol = 0.12;
        if (type === 'little-star') { attack = 0.05 + idx * 0.05; decay = 3.0 + idx * 0.3; waveType = 'sine'; vol = 0.08; }
        else if (type === 'midnight-ocean') { attack = 3.0 + idx * 0.2; decay = 8.0 + idx * 0.3; waveType = 'sine'; vol = 0.10; }
        osc.type = waveType;
        osc.frequency.setValueAtTime(freq, now);
        nodeGain.gain.setValueAtTime(0, now);
        nodeGain.gain.linearRampToValueAtTime(vol, now + attack);
        nodeGain.gain.exponentialRampToValueAtTime(0.001, now + decay);
        osc.connect(nodeGain);
        nodeGain.connect(this.gainNode);
        this.activeOscillators.push(osc);
        osc.onended = () => {
          this.activeOscillators = this.activeOscillators.filter(o => o !== osc);
          try { osc.disconnect(); nodeGain.disconnect(); } catch (e) {}
        };
        osc.start(now);
        osc.stop(now + 8.0);
      });
    };
    playChord();
    this.synthInterval = setInterval(playChord, 6500);
  }
  addCustomTrack(title, artist, url) {
    const newTrack = { id: `custom-${Date.now()}`, title, artist, url, description: 'Custom user-added stream track.', type: 'stream' };
    this.tracks.push(newTrack);
    const customOnly = this.tracks.filter(t => t.id.startsWith('custom-'));
    localStorage.setItem('equiliprism_custom_tracks', JSON.stringify(customOnly));
    this.triggerUpdate();
    return newTrack;
  }
  deleteCustomTrack(id) {
    const idx = this.tracks.findIndex(t => t.id === id);
    if (idx !== -1) {
      if (this.currentTrackIdx === idx) { this.stopPlayback(); this.isPlaying = false; }
      this.tracks.splice(idx, 1);
      if (this.currentTrackIdx >= this.tracks.length) this.currentTrackIdx = 0;
      const customOnly = this.tracks.filter(t => t.id.startsWith('custom-'));
      localStorage.setItem('equiliprism_custom_tracks', JSON.stringify(customOnly));
      this.triggerUpdate();
    }
  }
  triggerUpdate() {
    window.dispatchEvent(new CustomEvent('equiliprismAudioStateChanged', { detail: {
      isPlaying: this.isPlaying, isLoading: this.isLoading, currentTrackIdx: this.currentTrackIdx, volume: this.volume, track: this.tracks[this.currentTrackIdx]
    }}));
  }
}
export const audioManager = new AudioManager();
window.equiliprismAudio = audioManager;
