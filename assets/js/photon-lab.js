export class PhotonLab {
  constructor(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this.lasers = [];
    this.targets = [];
    this.obstacles = [];
    this.items = [];
  }

  draw() {
    this.container.innerHTML = `\
      <div style="padding:1rem;">\
        <h3>Photon Lab (stub)</h3>\
        <p>Lasers: ${this.lasers.length} · Targets: ${this.targets.length} · Obstacles: ${this.obstacles.length}</p>\
        <div style="width:100%; height:240px; background:linear-gradient(90deg,#07121b,#0b1f2b); border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--text-muted);">\
          Simulation canvas placeholder\
        </div>\
      </div>`;
  }

  render() { this.draw(); }
  destroy() {}
}
