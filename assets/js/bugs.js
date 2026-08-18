export class Bugs {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.active = true; this.reports = []; this.submitted = false;
    this.fetchReports();
  }
  async fetchReports() {
    try {
      const res = await fetch('/api/bugs');
      if (res.ok) this.reports = await res.json(); else throw new Error();
    } catch (e) {
      this.reports = this.loadLocalStorageReports();
    }
    if (this.active) this.render();
  }
  loadLocalStorageReports() {
    const stored = localStorage.getItem('equiliprism_bug_reports');
    return stored ? JSON.parse(stored) : [{ id: 'demo-1', name: 'Demo Student', component: 'Videos', title: 'Video loading delay', description: 'mirrors video delay.', severity: 'low', status: 'fixed', date: '2026-07-01' }];
  }
  saveLocalStorageReports() { localStorage.setItem('equiliprism_bug_reports', JSON.stringify(this.reports)); }
  render() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div style="padding:1.5rem; max-width:1100px; margin:0 auto; display:grid; grid-template-columns: 1.2fr 1fr; gap:2rem;">
        <div class="glass-card">
          <h2>✉️ File Bug Report</h2>
          ${this.submitted ? `
            <p>Sent successfully to code workspace directory! Thank you!</p>
            <button id="file-another-btn">Send Another</button>
          ` : `
            <form id="bug-report-form">
              <input type="text" id="bug-reporter-name" placeholder="Reporter Name" required style="width:100%; margin-bottom:1rem;" />
              <select id="bug-component" required style="width:100%; margin-bottom:1rem;">
                <option value="Dashboard">Dashboard</option>
                <option value="Balance Lab">Balance Lab</option>
                <option value="Photon Lab">Photon Lab</option>
                <option value="Videos">Videos Hub</option>
              </select>
              <input type="text" id="bug-title" placeholder="Short Summary" required style="width:100%; margin-bottom:1rem;" />
              <textarea id="bug-description" placeholder="Description & Steps" required style="width:100%; margin-bottom:1rem;"></textarea>
              <input type="radio" name="severity" value="low" checked /> Low
              <input type="radio" name="severity" value="medium" /> Medium
              <input type="radio" name="severity" value="high" /> High
              <button type="submit" style="display:block; width:100%; margin-top:1rem;">Submit Report</button>
            </form>
          `}
        </div>
        <div class="glass-card">
          <h2>Inbox History (${this.reports.length})</h2>
          <div>
            ${this.reports.map(r => `
              <div style="border:1px solid #ccc; padding:0.8rem; margin-bottom:0.8rem; position:relative;">
                <button class="delete-report-btn" data-id="${r.id}" style="position:absolute; top:5px; right:5px;">✕</button>
                <h4>[${r.component}] ${r.title}</h4>
                <p>${r.description}</p>
                <small>${r.severity} - ${r.status} - By: ${r.name}</small>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    this.bindEvents();
  }
  bindEvents() {
    const form = document.getElementById('bug-report-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newReport = {
          id: 'rep-' + Date.now(),
          name: document.getElementById('bug-reporter-name').value.trim(),
          component: document.getElementById('bug-component').value,
          title: document.getElementById('bug-title').value.trim(),
          description: document.getElementById('bug-description').value.trim(),
          severity: form.querySelector('input[name="severity"]:checked').value,
          status: 'received',
          date: new Date().toISOString().split('T')[0]
        };
        try {
          await fetch('/api/bugs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReport) });
          this.submitted = true; await this.fetchReports();
        } catch (err) {
          this.reports.unshift(newReport); this.saveLocalStorageReports(); this.submitted = true; this.render();
        }
      });
    }
    const fileAnotherBtn = document.getElementById('file-another-btn');
    if (fileAnotherBtn) fileAnotherBtn.addEventListener('click', () => { this.submitted = false; this.render(); });
    this.container.querySelectorAll('.delete-report-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          await fetch(`/api/bugs/delete?id=${id}`, { method: 'POST' });
          await this.fetchReports();
        } catch (err) {
          this.reports = this.reports.filter(r => r.id !== id); this.saveLocalStorageReports(); this.render();
        }
      });
    });
  }
  destroy() { this.active = false; }
}
