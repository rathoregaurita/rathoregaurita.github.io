// EquiliPrism Concept Studio (Interactive Explainers) Component

export class ConceptStudio {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeExplainer = 'balance'; // 'balance' | 'refraction'
    this.currentSlide = 0;
    
    // Interactive state for Refraction slider
    this.refractiveIndex = 1.5; // Glass default
  }

  bindEvents() {
    // Switch between explainer topics
    this.container.querySelectorAll('.explainer-item').forEach(item => {
      item.addEventListener('click', () => {
        this.container.querySelectorAll('.explainer-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.activeExplainer = item.getAttribute('data-type');
        this.currentSlide = 0;
        this.renderViewer();
      });
    });

    // Handle slide controls
    const prevBtn = this.container.querySelector('#prev-slide-btn');
    const nextBtn = this.container.querySelector('#next-slide-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentSlide > 0) {
          this.currentSlide--;
          this.renderViewer();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const maxSlides = this.activeExplainer === 'balance' ? 3 : 3;
        if (this.currentSlide < maxSlides) {
          this.currentSlide++;
          this.renderViewer();
        }
      });
    }
  }

  // Refraction slider binder
  bindRefractionEvents() {
    const slider = this.container.querySelector('#refraction-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        this.refractiveIndex = parseFloat(e.target.value);
        this.container.querySelector('#refraction-idx-lbl').textContent = this.refractiveIndex.toFixed(2);
        this.drawRefractionAnimation();
      });
    }
  }

  drawRefractionAnimation() {
    const svg = this.container.querySelector('.explainer-svg-canvas');
    if (!svg) return;

    // Laser starts at (50, 150) moving at an angle towards glass boundary at x=250
    const startX = 50;
    const startY = 150;
    const boundaryX = 250;
    const exitX = 400;

    // Angle of incidence = 10 degrees (keeps beam within SVG height)
    const incidentAngle = 10 * Math.PI / 180;
    
    // In air, n1 = 1.0. Glass, n2 = refractiveIndex
    // n1 * sin(t1) = n2 * sin(t2) => sin(t2) = sin(t1) / n2
    const sinT2 = Math.sin(incidentAngle) / this.refractiveIndex;
    const refractedAngle = Math.asin(sinT2);

    // Calculate intersection points
    // Line 1: from Laser (50, 150) to boundary (250, y1)
    const y1 = startY + (boundaryX - startX) * Math.tan(incidentAngle);
    
    // Line 2: inside glass from (250, y1) to exit (400, y2)
    const y2 = y1 + (exitX - boundaryX) * Math.tan(refractedAngle);

    // Line 3: exiting glass, parallel to incident beam (since exit boundary is parallel)
    const finalX = 580;
    const y3 = y2 + (finalX - exitX) * Math.tan(incidentAngle);

    // Update laser beams lines in SVG
    const beam1 = svg.querySelector('#ray-incident');
    const beam2 = svg.querySelector('#ray-refracted');
    const beam3 = svg.querySelector('#ray-exit');
    const normalLine = svg.querySelector('#refraction-normal');

    if (normalLine) {
      normalLine.setAttribute('y1', y1);
      normalLine.setAttribute('y2', y1);
    }

    if (beam1 && beam2 && beam3) {
      beam1.setAttribute('x2', boundaryX);
      beam1.setAttribute('y2', y1);

      beam2.setAttribute('x1', boundaryX);
      beam2.setAttribute('y1', y1);
      beam2.setAttribute('x2', exitX);
      beam2.setAttribute('y2', y2);

      beam3.setAttribute('x1', exitX);
      beam3.setAttribute('y1', y2);
      beam3.setAttribute('x2', finalX);
      beam3.setAttribute('y2', y3);
    }
  }

  // Generate SVG code for slides
  getSlidesHTML() {
    if (this.activeExplainer === 'balance') {
      const slides = [
        // Slide 1
        {
          title: "1. The Balancing Scale Rules",
          desc: "Algebra is just like balancing a see-saw. The scale shows $x + 2 = 6$. Left has 1 mystery chest ($x$) and 2 weights. Right has 6 weights. To discover what's inside the chest, we must keep the see-saw perfectly straight!",
          svg: `
            <svg class="explainer-svg-canvas" viewBox="0 0 500 250">
              <rect x="240" y="100" width="10" height="120" fill="#4b5563"/>
              <ellipse cx="245" cy="220" rx="30" ry="10" fill="#4b5563"/>
              <line x1="100" y1="100" x2="390" y2="100" stroke="#4b5563" stroke-width="4"/>
              
              <!-- Left Plate -->
              <path d="M 60 180 L 140 180 L 130 190 L 70 190 Z" fill="#6b7280"/>
              <line x1="100" y1="100" x2="60" y2="180" stroke="#9ca3af"/>
              <line x1="100" y1="100" x2="140" y2="180" stroke="#9ca3af"/>
              
              <!-- Left items (1 chest, 2 weights) -->
              <rect x="70" y="156" width="24" height="24" rx="3" fill="#8b5cf6"/>
              <text x="82" y="172" fill="#fff" font-weight="bold" font-size="12" text-anchor="middle">x</text>
              <rect x="100" y="156" width="20" height="20" rx="3" fill="#fbbf24"/>
              <rect x="120" y="156" width="20" height="20" rx="3" fill="#fbbf24"/>

              <!-- Right Plate -->
              <path d="M 310 180 L 390 180 L 380 190 L 320 190 Z" fill="#6b7280"/>
              <line x1="350" y1="100" x2="310" y2="180" stroke="#9ca3af"/>
              <line x1="350" y1="100" x2="390" y2="180" stroke="#9ca3af"/>
              
              <!-- Right items (6 weights) -->
              <rect x="315" y="156" width="20" height="20" rx="3" fill="#fbbf24"/>
              <rect x="338" y="156" width="20" height="20" rx="3" fill="#fbbf24"/>
              <rect x="360" y="156" width="20" height="20" rx="3" fill="#fbbf24"/>
              <rect x="315" y="132" width="20" height="20" rx="3" fill="#fbbf24"/>
              <rect x="338" y="132" width="20" height="20" rx="3" fill="#fbbf24"/>
              <rect x="360" y="132" width="20" height="20" rx="3" fill="#fbbf24"/>
            </svg>
          `
        },
        // Slide 2
        {
          title: "2. The Golden Rule: Do Symmetrically",
          desc: "How do we get the chest alone? We must remove the 2 weight blocks from the left side. BUT if we only remove them from the left, the see-saw will tilt heavily to the right! Click Next to see how we handle this.",
          svg: `
            <svg class="explainer-svg-canvas" viewBox="0 0 500 250">
              <!-- Tilting scale (unbalanced because left weights are gone, right has 6) -->
              <rect x="240" y="100" width="10" height="120" fill="#4b5563"/>
              <ellipse cx="245" cy="220" rx="30" ry="10" fill="#4b5563"/>
              
              <!-- Rotated beam -->
              <g style="transform: rotate(10deg); transform-origin: 245px 100px;">
                <line x1="100" y1="100" x2="390" y2="100" stroke="#4b5563" stroke-width="4"/>
                
                <!-- Left Plate (high) -->
                <path d="M 60 180 L 140 180 L 130 190 L 70 190 Z" fill="#6b7280"/>
                <line x1="100" y1="100" x2="60" y2="180" stroke="#9ca3af"/>
                <line x1="100" y1="100" x2="140" y2="180" stroke="#9ca3af"/>
                <rect x="88" y="156" width="24" height="24" rx="3" fill="#8b5cf6"/>
                <text x="100" y="172" fill="#fff" font-weight="bold" font-size="12" text-anchor="middle">x</text>

                <!-- Right Plate (low) -->
                <path d="M 310 180 L 390 180 L 380 190 L 320 190 Z" fill="#6b7280"/>
                <line x1="350" y1="100" x2="310" y2="180" stroke="#9ca3af"/>
                <line x1="350" y1="100" x2="390" y2="180" stroke="#9ca3af"/>
                <rect x="315" y="156" width="20" height="20" rx="3" fill="#fbbf24"/>
                <rect x="338" y="156" width="20" height="20" rx="3" fill="#fbbf24"/>
                <rect x="360" y="156" width="20" height="20" rx="3" fill="#fbbf24"/>
                <rect x="315" y="132" width="20" height="20" rx="3" fill="#fbbf24"/>
                <rect x="338" y="132" width="20" height="20" rx="3" fill="#fbbf24"/>
                <rect x="360" y="132" width="20" height="20" rx="3" fill="#fbbf24"/>
              </g>
              <!-- Arrow showing tilt -->
              <path d="M 120 220 Q 240 240 360 220" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 4"/>
              <text x="245" y="245" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="middle">Unbalanced! x ≠ 6</text>
            </svg>
          `
        },
        // Slide 3
        {
          title: "3. Subtracting from Both Sides",
          desc: "To keep the balance scale perfectly flat, we must perform the exact same operation on both sides! Let's subtract 2 weights from BOTH plates: $(x + 2) - 2 = 6 - 2$. The balance scale remains straight!",
          svg: `
            <svg class="explainer-svg-canvas" viewBox="0 0 500 250">
              <rect x="240" y="100" width="10" height="120" fill="#4b5563"/>
              <ellipse cx="245" cy="220" rx="30" ry="10" fill="#4b5563"/>
              <line x1="100" y1="100" x2="390" y2="100" stroke="#4b5563" stroke-width="4"/>
              
              <!-- Left Plate -->
              <path d="M 60 180 L 140 180 L 130 190 L 70 190 Z" fill="#6b7280"/>
              <line x1="100" y1="100" x2="60" y2="180" stroke="#9ca3af"/>
              <line x1="100" y1="100" x2="140" y2="180" stroke="#9ca3af"/>
              <rect x="88" y="156" width="24" height="24" rx="3" fill="#8b5cf6"/>
              <text x="100" y="172" fill="#fff" font-weight="bold" font-size="12" text-anchor="middle">x</text>
              
              <!-- Falling weights animation effect -->
              <g opacity="0.3" transform="translate(0, 30)">
                <rect x="70" y="110" width="20" height="20" rx="3" fill="#fbbf24"/>
                <rect x="120" y="110" width="20" height="20" rx="3" fill="#fbbf24"/>
                <line x1="80" y1="100" x2="80" y2="130" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow)"/>
              </g>

              <!-- Right Plate -->
              <path d="M 310 180 L 390 180 L 380 190 L 320 190 Z" fill="#6b7280"/>
              <line x1="350" y1="100" x2="310" y2="180" stroke="#9ca3af"/>
              <line x1="350" y1="100" x2="390" y2="180" stroke="#9ca3af"/>
              <rect x="315" y="156" width="20" height="20" rx="3" fill="#fbbf24"/>
              <rect x="338" y="156" width="20" height="20" rx="3" fill="#fbbf24"/>
              <rect x="360" y="156" width="20" height="20" rx="3" fill="#fbbf24"/>
              <rect x="338" y="132" width="20" height="20" rx="3" fill="#fbbf24"/>

              <!-- Removed weights showing fading on right -->
              <g opacity="0.3" transform="translate(0, 30)">
                <rect x="315" y="110" width="20" height="20" rx="3" fill="#fbbf24"/>
                <rect x="360" y="110" width="20" height="20" rx="3" fill="#fbbf24"/>
              </g>
            </svg>
          `
        },
        // Slide 4
        {
          title: "4. The Solution",
          desc: "Look! By doing the same subtraction to both sides, we isolated the chest. The scale remains perfectly flat, showing us: $x = 4$. Congratulations! You solved the algebraic equation by thinking in balance!",
          svg: `
            <svg class="explainer-svg-canvas" viewBox="0 0 500 250">
              <rect x="240" y="100" width="10" height="120" fill="#4b5563"/>
              <ellipse cx="245" cy="220" rx="30" ry="10" fill="#4b5563"/>
              <line x1="100" y1="100" x2="390" y2="100" stroke="#4b5563" stroke-width="4"/>
              
              <!-- Left Plate -->
              <path d="M 60 180 L 140 180 L 130 190 L 70 190 Z" fill="#6b7280"/>
              <line x1="100" y1="100" x2="60" y2="180" stroke="#9ca3af"/>
              <line x1="100" y1="100" x2="140" y2="180" stroke="#9ca3af"/>
              <rect x="88" y="156" width="24" height="24" rx="3" fill="#8b5cf6"/>
              <text x="100" y="172" fill="#fff" font-weight="bold" font-size="12" text-anchor="middle">x</text>

              <!-- Right Plate -->
              <path d="M 310 180 L 390 180 L 380 190 L 320 190 Z" fill="#6b7280"/>
              <line x1="350" y1="100" x2="310" y2="180" stroke="#9ca3af"/>
              <line x1="350" y1="100" x2="390" y2="180" stroke="#9ca3af"/>
              <rect x="315" y="156" width="20" height="20" rx="3" fill="#fbbf24"/>
              <rect x="338" y="156" width="20" height="20" rx="3" fill="#fbbf24"/>
              <rect x="360" y="156" width="20" height="20" rx="3" fill="#fbbf24"/>
              <rect x="338" y="132" width="20" height="20" rx="3" fill="#fbbf24"/>
              
              <!-- Balanced text check -->
              <circle cx="245" cy="100" r="12" fill="#22c55e" opacity="0.3"/>
              <text x="245" y="104" fill="#22c55e" font-size="12" font-weight="bold" text-anchor="middle">✓</text>
            </svg>
          `
        }
      ];
      return slides[this.currentSlide];
    } else {
      const slides = [
        // Slide 1
        {
          title: "1. What is Light Refraction?",
          desc: "Light travels as waves. In empty space, it moves in a straight line. But when it enters a dense material like glass or water, it slows down! This speed change bends the beam. Try dragging the slider below to change refraction index and observe the bend angle!",
          svg: `
            <svg class="explainer-svg-canvas" viewBox="0 0 600 250">
              <defs>
                <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#0ea5e9"/>
                  <stop offset="100%" stop-color="#3b82f6"/>
                </linearGradient>
                <radialGradient id="beamGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#00ffff" stop-opacity="1"/>
                  <stop offset="100%" stop-color="#00ffff" stop-opacity="0"/>
                </radialGradient>
              </defs>
              
              <!-- Draw Glass Plate -->
              <rect x="250" y="30" width="150" height="190" fill="rgba(14, 165, 233, 0.12)" stroke="rgba(14, 165, 233, 0.3)" stroke-width="2"/>
              <text x="325" y="50" fill="rgba(255, 255, 255, 0.4)" font-size="10" font-weight="600" text-anchor="middle">GLASS MEDIUM</text>
              <text x="100" y="50" fill="rgba(255, 255, 255, 0.4)" font-size="10" font-weight="600" text-anchor="middle">AIR</text>

              <!-- Normal line -->
              <line id="refraction-normal" x1="200" y1="120" x2="450" y2="120" stroke="rgba(255, 255, 255, 0.15)" stroke-dasharray="4 4" stroke-width="1.5"/>
              <text x="210" y="115" fill="rgba(255, 255, 255, 0.3)" font-size="9">Normal Axis</text>

              <!-- Incident light ray -->
              <line id="ray-incident" x1="50" y1="150" x2="250" y2="150" stroke="#00ffcc" stroke-width="3" />
              <!-- Refracted light ray -->
              <line id="ray-refracted" x1="250" y1="150" x2="400" y2="150" stroke="#00ffcc" stroke-width="3" />
              <!-- Exited light ray -->
              <line id="ray-exit" x1="400" y1="150" x2="580" y2="150" stroke="#00ffcc" stroke-width="3" />

              <!-- Laser emitter -->
              <rect x="20" y="138" width="30" height="24" rx="4" fill="#1e293b" stroke="#475569"/>
              <circle cx="50" cy="150" r="4" fill="#00ffcc"/>
            </svg>
          `,
          interactiveControls: `
            <div style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
              <span style="font-size: 0.85rem; font-weight: 600;">Glass Refractive Index (n):</span>
              <input type="range" id="refraction-slider" min="1.0" max="2.4" step="0.05" value="${this.refractiveIndex}" style="flex: 1; cursor: pointer;"/>
              <span id="refraction-idx-lbl" style="font-family: monospace; font-weight: bold; color: hsl(var(--accent-cyan)); min-width: 35px;">${this.refractiveIndex.toFixed(2)}</span>
            </div>
          `
        },
        // Slide 2
        {
          title: "2. How Prisms Split Light",
          desc: "White light isn't a single color; it's a blend of all the colors of the rainbow together! When white light passes into a triangular glass prism, the glass slows down each color by a slightly different amount. Red light slows down the least, and Blue light slows down the most!",
          svg: `
            <svg class="explainer-svg-canvas" viewBox="0 0 500 250">
              <!-- Prism Triangle -->
              <polygon points="250,50 170,190 330,190" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.3)" stroke-width="2"/>
              
              <!-- Incoming White Ray -->
              <line x1="50" y1="120" x2="210" y2="120" stroke="#ffffff" stroke-width="4.5"/>
              
              <!-- Split Rays inside prism -->
              <!-- Red ray inside -->
              <line x1="210" y1="120" x2="280" y2="135" stroke="#ef4444" stroke-width="2"/>
              <!-- Blue ray inside -->
              <line x1="210" y1="120" x2="270" y2="155" stroke="#3b82f6" stroke-width="2"/>

              <!-- Exit Rays fanning out -->
              <!-- Red exit -->
              <line x1="280" y1="135" x2="450" y2="120" stroke="#ef4444" stroke-width="2.5"/>
              <text x="460" y="124" fill="#ef4444" font-size="10" font-weight="bold">Red</text>

              <!-- Yellow exit -->
              <line x1="275" y1="145" x2="450" y2="155" stroke="#eab308" stroke-width="2"/>
              
              <!-- Blue exit -->
              <line x1="270" y1="155" x2="450" y2="190" stroke="#3b82f6" stroke-width="2.5"/>
              <text x="460" y="194" fill="#3b82f6" font-size="10" font-weight="bold">Blue</text>

              <!-- Emitter -->
              <rect x="20" y="108" width="30" height="24" rx="4" fill="#1e293b"/>
            </svg>
          `
        },
        // Slide 3
        {
          title: "3. Wavelength and Speed",
          desc: "This separation of light is called **dispersion**. Because different wavelengths (colors) have different refractive speeds in glass, they exit the prism at different angles. This forms a beautiful rainbow spectrum! In the Photon Lab, you will use this very mechanism to route color beams to sensors.",
          svg: `
            <svg class="explainer-svg-canvas" viewBox="0 0 500 250">
              <!-- Rainbow spectrum gradient strip -->
              <defs>
                <linearGradient id="rainbow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#ef4444"/>
                  <stop offset="20%" stop-color="#f97316"/>
                  <stop offset="40%" stop-color="#eab308"/>
                  <stop offset="60%" stop-color="#22c55e"/>
                  <stop offset="80%" stop-color="#3b82f6"/>
                  <stop offset="100%" stop-color="#a855f7"/>
                </linearGradient>
              </defs>
              <rect x="240" y="30" width="60" height="190" fill="url(#rainbow)" rx="4"/>
              
              <!-- Light waves visualization -->
              <!-- Long Red Wave -->
              <path d="M 50 60 Q 75 40 100 60 T 150 60 T 200 60" fill="none" stroke="#ef4444" stroke-width="3"/>
              <text x="50" y="90" fill="#ef4444" font-size="10" font-weight="bold">Long Wavelength (Low Energy/Less Bend)</text>

              <!-- Short Blue Wave -->
              <path d="M 50 160 Q 62.5 145 75 160 T 100 160 T 125 160 T 150 160 T 175 160 T 200 160" fill="none" stroke="#3b82f6" stroke-width="2"/>
              <text x="50" y="190" fill="#3b82f6" font-size="10" font-weight="bold">Short Wavelength (High Energy/More Bend)</text>
            </svg>
          `
        }
      ];
      return slides[this.currentSlide];
    }
  }

  renderViewer() {
    const viewer = this.container.querySelector('#explainer-viewer-mount');
    if (!viewer) return;

    const slideData = this.getSlidesHTML();
    const maxSlides = this.activeExplainer === 'balance' ? 3 : 2;

    viewer.innerHTML = `
      <div class="glass-card explainer-viewer-card">
        <h3>${slideData.title}</h3>
        <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; min-height: 70px;">
          ${slideData.desc}
        </p>

        <div class="explainer-animation-container">
          ${slideData.svg}
        </div>

        ${slideData.interactiveControls || ''}

        <div class="explainer-controls-row">
          <div style="font-size: 0.85rem; color: var(--text-muted);">
            Slide <strong>${this.currentSlide + 1}</strong> of <strong>${maxSlides + 1}</strong>
          </div>
          <div class="playback-controls">
            <button class="puzzle-btn" id="prev-slide-btn" ${this.currentSlide === 0 ? 'disabled style="opacity: 0.5; cursor: default;"' : ''}>
              &larr; Prev
            </button>
            <button class="puzzle-btn primary" id="next-slide-btn" ${this.currentSlide === maxSlides ? 'disabled style="opacity: 0.5; cursor: default;"' : ''}>
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    `;

    // Re-bind controls inside slides
    this.bindEvents();

    if (this.activeExplainer === 'refraction' && this.currentSlide === 0) {
      this.bindRefractionEvents();
      this.drawRefractionAnimation();
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="explainers-grid">
        <!-- Left: Topics Menu -->
        <div class="glass-card explainer-list-card">
          <h3>Concept Studio</h3>
          <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.8rem;">
            Explore the core math and science ideas behind the puzzle labs through interactive stories.
          </p>

          <div class="explainer-item ${this.activeExplainer === 'balance' ? 'active' : ''}" data-type="balance">
            <h4>Symmetry & Equations</h4>
            <p>How the balance scale stays equal (Algebra foundation)</p>
          </div>

          <div class="explainer-item ${this.activeExplainer === 'refraction' ? 'active' : ''}" data-type="refraction">
            <h4>Bending & Splitting Light</h4>
            <p>Refraction, Snell's law, and glass prisms (Optics physics)</p>
          </div>
        </div>

        <!-- Right: Slide Viewer -->
        <div id="explainer-viewer-mount" style="display: flex; flex-direction: column; flex: 1;"></div>
      </div>
    `;

    this.renderViewer();
  }
}
