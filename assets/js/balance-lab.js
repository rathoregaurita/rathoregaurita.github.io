export class BalanceLab {
  constructor(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this.isCreativeMode = false;
    this.secretX = 5;
    this.leftItems = [];
    this.rightItems = [];
  }

  render() {
    this.container.innerHTML = `\
      <div style="padding:1rem;">\
        <h3>Balance Lab (stub)</h3>\
        <p>Creative Mode: ${this.isCreativeMode}</p>\
        <p>Secret x: ${this.secretX}</p>\
        <div style="display:flex; gap:1rem;">\
          <div style="flex:1; border:1px dashed rgba(255,255,255,0.06); padding:0.6rem;">Left items: ${this.leftItems.length}</div>\
          <div style="flex:1; border:1px dashed rgba(255,255,255,0.06); padding:0.6rem;">Right items: ${this.rightItems.length}</div>\
        </div>\
      </div>`;
  }

  draw() { this.render(); }
  destroy() {}
}
