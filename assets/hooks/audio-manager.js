// Minimal audio manager stub so Soundtrack can interact with a predictable API.
// Not a real audio player — just enough surface area for the UI to run.
class AudioManager {
  constructor() {
    this.tracks = [
      { id: 't1', title: 'Focus Track', artist: 'EquiliPrism', url: '', description: 'Focus music', type: 'stream' },
      { id: 't2', title: 'Calm Ambience', artist: 'EquiliPrism', url: '', description: 'Relaxed pad', type: 'stream' }
    ];
    this.currentTrackIdx = 0;
    this.isPlaying = false;
    this.isLoading = false;
    this.volume = 0.7;
    this.analyser = null; // optional: set to an AudioContext analyser if you wire real audio
  }

  play(forceRestart = false) {
    this.isPlaying = true;
    this.isLoading = false;
    this.triggerUpdate();
  }

  pause() {
    this.isPlaying = false;
    this.triggerUpdate();
  }

  prev() {
    this.currentTrackIdx = Math.max(0, this.currentTrackIdx - 1);
    this.play();
  }

  next() {
    this.currentTrackIdx = (this.currentTrackIdx + 1) % this.tracks.length;
    this.play();
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this.triggerUpdate();
  }

  addCustomTrack(title, artist, url) {
    const newTrack = { id: `custom-${Date.now()}`, title, artist, url, description: 'Custom user-added stream track.', type: 'stream' };
    this.tracks.push(newTrack);
    try { localStorage.setItem('equiliprism_custom_tracks', JSON.stringify(this.tracks.filter(t => t.id && t.id.startsWith('custom-')))); } catch(e) {}
    this.triggerUpdate();
    return newTrack;
  }

  deleteCustomTrack(id) {
    const idx = this.tracks.findIndex(t => t.id === id);
    if (idx !== -1) {
      if (this.currentTrackIdx === idx) this.pause();
      this.tracks.splice(idx, 1);
      if (this.currentTrackIdx >= this.tracks.length) this.currentTrackIdx = 0;
      this.triggerUpdate();
    }
  }

  triggerUpdate() {
    window.dispatchEvent(new CustomEvent('equiliprismAudioStateChanged', {
      detail: {
        isPlaying: this.isPlaying,
        isLoading: this.isLoading,
        currentTrackIdx: this.currentTrackIdx,
        volume: this.volume,
        track: this.tracks[this.currentTrackIdx] || {}
      }
    }));
  }
}

export const audioManager = new AudioManager();
window.equiliprismAudio = audioManager;
