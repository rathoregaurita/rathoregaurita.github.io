// EquiliPrism Bug Reporting Lounge Component
export class Bugs {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.active = true;
    this.reports = [];
    this.submitted = false;
    this.fetchReports();
  }

  async fetchReports() {
    try {
      const res = await fetch('/api/bugs');
      if (res.ok) {
        this.reports = await res.json();
      } else {
        throw new Error('API server returned error');
      }
    } catch (e) {
      console.warn('API error, falling back to LocalStorage:', e);
      this.reports = this.loadLocalStorageReports();
    }
    if (this.active) this.render();
  }

  loadLocalStorageReports() {
    try {
      const stored = localStorage.getItem('equiliprism_bug_reports');
      return stored ? JSON.parse(stored) : [
        {
          id: 'demo-1',
          name: 'Demo Student',
          component: 'Videos Hub',
          title: 'Video loading latency',
          description: 'The mirrors video took about 3 seconds to render the iframe overlay.',
          severity: 'low',
          status: 'fixed',
          date: '2026-07-01'
        }
      ];
    } catch (e) {
      return [];
    }
  }

  saveLocalStorageReports() {
    try {
      localStorage.setItem('equiliprism_bug_reports', JSON.stringify(this.reports));
    } catch (e) {
      console.error('Failed to save bug reports to local storage:', e);
    }
  }

  render() {
    if (!this.container) return;

    let html = `
      <div class="bugs-container" style="padding: 1.5rem; max-width: 1100px; margin: 0 auto; animation: fadeIn 0.4s ease-out; display: grid; grid-template-columns: 1fr; gap: 2rem;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 1rem; grid-column: 1 / -1;">
          <h1 style="font-size: 2.2rem; font-weight: 800; background: linear-gradient(to right, hsl(var(--accent-pink)), hsl(var(--accent-violet))); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.6rem;">
            <span>🐜</span> Bug Reporting Hub
          </h1>
          <p style="color: var(--text-muted); font-size: 0.95rem;">
            Found a mistake, typo, or something broken? Send a report directly to your AI pair programmer!
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem;" class="bugs-grid-layout">
          <!-- Left: Report Form -->
          <div class="glass-card" style="border: 1px solid var(--card-border); border-radius: var(--border-radius-lg); padding: 1.8rem; background: rgba(255, 255, 255, 0.02);">
            <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
              ✉️ Send Bug Report to AI Assistant
            </h2>

            ${this.submitted ? `
              <div style="text-align: center; padding: 2rem 1rem; animation: scaleIn 0.3s ease-out;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📬</div>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #10b981; margin-bottom: 0.5rem;">Sent to Antigravity!</h3>
                <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.5; margin-bottom: 1.5rem;">
                  Thank you! Your report has been written directly to the workspace file <code>bug_reports.json</code>. Your AI coding assistant will review it on their next turn!
                </p>
                <button id="file-another-btn" style="padding: 0.6rem 1.5rem; font-family: inherit; font-size: 0.85rem; font-weight: 700; border-radius: var(--border-radius-sm); border: 1px solid var(--card-border); background: rgba(255,255,255,0.05); color: var(--text-main); cursor: pointer; transition: all 0.2s;">
                  Send Another Bug
                </button>
              </div>
            ` : `
              <form id="bug-report-form" style="display: flex; flex-direction: column; gap: 1.2rem;">
                <!-- Reporter Name -->
                <div>
                  <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">Your Name / Username:</label>
                  <input type="text" id="bug-reporter-name" required placeholder="e.g. Alex" style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid var(--card-border); color: var(--text-main); border-radius: var(--border-radius-sm); font-family: inherit; font-size: 0.9rem; outline: none;" />
                </div>

                <!-- Component Selection -->
                <div>
                  <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">Where did the issue occur?</label>
                  <select id="bug-component" required style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid var(--card-border); color: var(--text-main); border-radius: var(--border-radius-sm); font-family: inherit; font-size: 0.9rem; outline: none; cursor: pointer;">
                    <option value="" disabled selected style="background: var(--bg-color);">-- Select Component --</option>
                    <option value="Dashboard" style="background: var(--bg-color);">Dashboard Overview</option>
                    <option value="Balance Lab" style="background: var(--bg-color);">Balance Lab (Equations)</option>
                    <option value="Photon Lab" style="background: var(--bg-color);">Photon Lab (Optics)</option>
                    <option value="Videos Hub" style="background: var(--bg-color);">Educational Videos Hub</option>
                    <option value="Sandbox" style="background: var(--bg-color);">Creative Sandbox</option>
                    <option value="Wardrobe" style="background: var(--bg-color);">Sparky's Wardrobe</option>
                    <option value="General" style="background: var(--bg-color);">General App Layout / Other</option>
                  </select>
                </div>

                <!-- Bug Title -->
                <div>
                  <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">Short Summary of the Bug:</label>
                  <input type="text" id="bug-title" required placeholder="e.g. Seesaw doesn't tip when adding weights" style="width: 100%; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--card-border); color: var(--text-main); border-radius: var(--border-radius-sm); font-family: inherit; font-size: 0.9rem; outline: none;" />
                </div>

                <!-- Description -->
                <div>
                  <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">Detailed Steps to Reproduce:</label>
                  <textarea id="bug-description" required rows="4" placeholder="What were you doing? What did you expect to happen? What actually happened?" style="width: 100%; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--card-border); color: var(--text-main); border-radius: var(--border-radius-sm); font-family: inherit; font-size: 0.9rem; outline: none; resize: vertical; line-height: 1.45;"></textarea>
                </div>

                <!-- Severity Selector -->
                <div>
                  <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">How severe is the issue?</label>
                  <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
                    <label class="severity-pill" style="flex: 1; min-width: 80px; border: 1px solid var(--card-border); border-radius: var(--border-radius-sm); padding: 0.5rem; text-align: center; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.3rem; font-size: 0.8rem; font-weight: 700; background: rgba(255,255,255,0.02); transition: all 0.2s;">
                      <input type="radio" name="severity" value="low" checked style="margin: 0; cursor: pointer;" />
                      🟢 Low
                    </label>
                    <label class="severity-pill" style="flex: 1; min-width: 80px; border: 1px solid var(--card-border); border-radius: var(--border-radius-sm); padding: 0.5rem; text-align: center; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.3rem; font-size: 0.8rem; font-weight: 700; background: rgba(255,255,255,0.02); transition: all 0.2s;">
                      <input type="radio" name="severity" value="medium" style="margin: 0; cursor: pointer;" />
                      🟡 Medium
                    </label>
                    <label class="severity-pill" style="flex: 1; min-width: 80px; border: 1px solid var(--card-border); border-radius: var(--border-radius-sm); padding: 0.5rem; text-align: center; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.3rem; font-size: 0.8rem; font-weight: 700; background: rgba(255,255,255,0.02); transition: all 0.2s;">
                      <input type="radio" name="severity" value="high" style="margin: 0; cursor: pointer;" />
                      🔴 High
                    </label>
                  </div>
                </div>

                <!-- Submit Button -->
                <button type="submit" style="margin-top: 0.5rem; padding: 0.8rem 1.8rem; font-family: inherit; font-size: 0.9rem; font-weight: 800; border-radius: var(--border-radius-sm); border: none; background: linear-gradient(to right, hsl(var(--accent-pink)), hsl(var(--accent-violet))); color: #fff; cursor: pointer; box-shadow: 0 4px 15px rgba(236,72,153,0.25); transition: transform 0.2s ease, box-shadow 0.2s;">
                  Send to AI Assistant
                </button>
              </form>
            `}
          </div>

          <!-- Right: Reported History -->
          <div style="display: flex; flex-direction: column; gap: 1.2rem;">
            <div class="glass-card" style="border: 1px solid var(--card-border); border-radius: var(--border-radius-lg); padding: 1.5rem; background: rgba(255, 255, 255, 0.02); flex-grow: 1; display: flex; flex-direction: column; max-height: 580px; overflow-y: auto;">
              <h2 style="font-size: 1.2rem; font-weight: 800; color: var(--text-main); margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
                📋 AI Review Inbox (${this.reports.length})
              </h2>

              <div style="display: flex; flex-direction: column; gap: 1rem; flex-grow: 1;" id="bug-reports-list">
                ${this.reports.length === 0 ? `
                  <div style="text-align: center; color: var(--text-muted); font-size: 0.88rem; padding: 3rem 1rem; border: 1px dashed var(--card-border); border-radius: var(--border-radius-md);">
                    Inbox empty. Submit a bug to see it here!
                  </div>
                ` : this.reports.map(r => {
                  let sevBg = 'rgba(16, 185, 129, 0.1)';
                  let sevColor = '#10b981';
                  if (r.severity === 'medium') {
                    sevBg = 'rgba(245, 158, 11, 0.1)';
                    sevColor = '#f59e0b';
                  } else if (r.severity === 'high') {
                    sevBg = 'rgba(239, 68, 68, 0.1)';
                    sevColor = '#ef4444';
                  }

                  let statusBg = 'rgba(147, 51, 234, 0.1)';
                  let statusColor = 'hsl(var(--accent-violet))';
                  let statusText = '🕒 Received';
                  if (r.status === 'fixed') {
                    statusBg = 'rgba(16, 185, 129, 0.15)';
                    statusColor = '#10b981';
                    statusText = '✓ Fixed';
                  } else if (r.status === 'review') {
                    statusBg = 'rgba(59, 130, 246, 0.1)';
                    statusColor = '#3b82f6';
                    statusText = '🔍 Reviewing';
                  }

                  return `
                    <div style="border: 1px solid var(--card-border); border-radius: var(--border-radius-md); padding: 1rem; position: relative; background: rgba(255,255,255,0.01); display: flex; flex-direction: column; gap: 0.5rem;">
                      <!-- Delete Button -->
                      <button class="delete-report-btn" data-id="${r.id}" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem; transition: color 0.2s;" title="Remove Report">
                        &times;
                      </button>

                      <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                        <span style="font-size: 0.72rem; font-weight: 800; background: ${sevBg}; color: ${sevColor}; padding: 0.15rem 0.4rem; border-radius: 4px; text-transform: uppercase;">
                          ${r.severity} Priority
                        </span>
                        <span style="font-size: 0.72rem; font-weight: 800; background: rgba(255,255,255,0.05); color: var(--text-main); padding: 0.15rem 0.4rem; border-radius: 4px;">
                          ${r.component}
                        </span>
                        <span style="font-size: 0.72rem; font-weight: 800; background: ${statusBg}; color: ${statusColor}; padding: 0.15rem 0.4rem; border-radius: 4px;">
                          ${statusText}
                        </span>
                      </div>

                      <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin: 0; padding-right: 20px;">
                        ${r.title}
                      </h3>
                      <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0; line-height: 1.4;">
                        ${r.description}
                      </p>
                      <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-top: 0.4rem; border-top: 1px dashed var(--card-border); padding-top: 0.4rem;">
                        <span>By: ${r.name}</span>
                        <span>Date: ${r.date}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    this.container.innerHTML = html;
    this.bindEvents();
  }

  bindEvents() {
    // 1. Submit form handler
    const form = document.getElementById('bug-report-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameVal = document.getElementById('bug-reporter-name').value.trim();
        const componentVal = document.getElementById('bug-component').value;
        const titleVal = document.getElementById('bug-title').value.trim();
        const descVal = document.getElementById('bug-description').value.trim();
        const severityVal = form.querySelector('input[name="severity"]:checked').value;

        const id = 'rep-' + Date.now();
        const newReport = {
          id: id,
          name: nameVal || 'Anonymous',
          component: componentVal,
          title: titleVal,
          description: descVal,
          severity: severityVal,
          status: 'received',
          date: new Date().toISOString().split('T')[0]
        };

        try {
          const res = await fetch('/api/bugs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newReport)
          });
          if (!res.ok) throw new Error('API post failed');
          this.submitted = true;
          await this.fetchReports();
        } catch (err) {
          console.warn('API submit failed, saving locally:', err);
          this.reports.unshift(newReport);
          this.saveLocalStorageReports();
          this.submitted = true;
          this.render();
        }
      });
    }

    // 2. File another report button
    const fileAnotherBtn = document.getElementById('file-another-btn');
    if (fileAnotherBtn) {
      fileAnotherBtn.addEventListener('click', () => {
        this.submitted = false;
        this.render();
      });
    }

    // 3. Delete report buttons
    this.container.querySelectorAll('.delete-report-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          const res = await fetch(`/api/bugs/delete?id=${id}`, {
            method: 'POST'
          });
          if (!res.ok) throw new Error('API delete failed');
          await this.fetchReports();
        } catch (err) {
          console.warn('API delete failed, deleting locally:', err);
          this.reports = this.reports.filter(r => r.id !== id);
          this.saveLocalStorageReports();
          this.render();
        }
      });
    });

    // 4. Style pill selections (adds visual active borders on radios)
    const pills = this.container.querySelectorAll('.severity-pill');
    pills.forEach(pill => {
      const radio = pill.querySelector('input');
      
      // highlight active selected severity pill
      if (radio && radio.checked) {
        pill.style.borderColor = 'hsl(var(--accent-pink))';
        pill.style.background = 'rgba(236,72,153,0.05)';
      }

      pill.addEventListener('click', () => {
        pills.forEach(p => {
          p.style.borderColor = 'var(--card-border)';
          p.style.background = 'rgba(255,255,255,0.02)';
        });
        if (radio) {
          radio.checked = true;
          pill.style.borderColor = 'hsl(var(--accent-pink))';
          pill.style.background = 'rgba(236,72,153,0.05)';
        }
      });
    });
  }

  destroy() {
    this.active = false;
  }
}
