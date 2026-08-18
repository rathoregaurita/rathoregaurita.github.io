export class Videos {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedCategory = 'all';
    this.activeVideo = null;
    this.quizSubmitted = false;
    this.selectedQuizOption = null;
    this.videos = [
      {
        id: 'light-optics-1', title: 'How Do Mirrors Work?', category: 'optics', duration: '3:47', youtubeId: 'ibuD8PqVDBA', description: 'Mirrors, light waves, and reflection principles.',
        quiz: { question: 'What type of reflection occurs when light bounces off a perfectly smooth mirror?', options: ['Specular reflection', 'Diffuse reflection', 'Refraction', 'Absorption'], answer: 0, explanation: 'Specular reflection occurs on smooth surfaces, bouncing light off at the exact same angle.' }
      },
      {
        id: 'light-optics-2', title: 'How Rainbows Work', category: 'optics', duration: '4:12', youtubeId: 'Cm9ZkYTnCNE', description: 'How raindrops act like tiny prisms that bend and disperse light.',
        quiz: { question: 'Why does light bend when it enters glass or water?', options: ['It changes speed', 'It turns into sound', 'It gets absorbed', 'It gains mass'], answer: 0, explanation: 'Light refracts because it changes speed transitioning from air to glass or water.' }
      },
      {
        id: 'math-balance-1', title: 'Solving Basic Equations', category: 'math', duration: '11:15', youtubeId: 'l3XzepN03KQ', description: 'Solving linear equations using variables and balances.',
        quiz: { question: 'If you add 5 to one side of a balanced equation, what must you do to the other side?', options: ['Add 5', 'Subtract 5', 'Multiply by 5', 'Do nothing'], answer: 0, explanation: 'To maintain balance, any math operation must be identical on both sides.' }
      },
      {
        id: 'gravity-space-1', title: 'What is Gravity?', category: 'gravity', duration: '3:58', youtubeId: 'TPotAZ1KuWs', description: 'Gravity pulls mass together, holding orbits and planets.',
        quiz: { question: 'Who formulated the classical mathematical law of gravitation?', options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Marie Curie'], answer: 0, explanation: 'Sir Isaac Newton formulated the universal law of gravitation.' }
      }
    ];
    this.render();
  }
  render() {
    if (!this.container) return;
    const filtered = this.videos.filter(v => this.selectedCategory === 'all' || v.category === this.selectedCategory);
    this.container.innerHTML = `
      <div style="padding: 1.5rem; max-width: 1200px; margin: 0 auto;">
        <h1 style="text-align: center;">Educational Video Hub</h1>
        <div style="display: flex; gap: 0.8rem; justify-content: center; margin-bottom: 2rem;">
          <button class="filter-tab" data-cat="all">All Videos</button>
          <button class="filter-tab" data-cat="optics">Light & Optics</button>
          <button class="filter-tab" data-cat="math">Equations & Math</button>
          <button class="filter-tab" data-cat="gravity">Gravity</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.8rem;">
          ${filtered.map(v => `
            <div class="video-card glass-card" data-id="${v.id}" style="padding:1rem;">
              <img src="https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg" style="width:100%; border-radius:8px;" />
              <h3>${v.title}</h3>
              <p>${v.description}</p>
            </div>
          `).join('')}
        </div>
      </div>
      ${this.activeVideo ? `
        <div class="modal-overlay active" id="theater-modal" style="display:flex; align-items:center; justify-content:center; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999;">
          <div class="modal-content glass-card" style="width: 90%; max-width: 800px; position:relative; padding:2rem;">
            <button id="close-theater-btn" style="position:absolute; top:10px; right:10px;">✕</button>
            <iframe src="https://www.youtube.com/embed/${this.activeVideo.youtubeId}?autoplay=1" style="width:100%; aspect-ratio:16/9; border:none; border-radius:8px;"></iframe>
            <h3>${this.activeVideo.title}</h3>
            <div>
              <p><strong>Quiz Challenge:</strong> ${this.activeVideo.quiz.question}</p>
              ${this.activeVideo.quiz.options.map((opt, idx) => `
                <button class="quiz-option-btn" data-idx="${idx}" style="display:block; width:100%; padding:0.6rem; margin:0.3rem 0; text-align:left;">${opt}</button>
              `).join('')}
              ${this.quizSubmitted ? `<p>${this.activeVideo.quiz.explanation}</p>` : `<button id="submit-quiz-btn">Submit</button>`}
            </div>
          </div>
        </div>
      ` : ''}
    `;
    this.bindEvents();
  }
  bindEvents() {
    this.container.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => { this.selectedCategory = tab.getAttribute('data-cat'); this.render(); });
    });
    this.container.querySelectorAll('.video-card').forEach(card => {
      card.addEventListener('click', () => {
        this.activeVideo = this.videos.find(v => v.id === card.getAttribute('data-id'));
        this.quizSubmitted = false; this.selectedQuizOption = null; this.render();
      });
    });
    const closeBtn = document.getElementById('close-theater-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => { this.activeVideo = null; this.render(); });
    this.container.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this.quizSubmitted) { this.selectedQuizOption = parseInt(btn.getAttribute('data-idx')); }
      });
    });
    const submitBtn = document.getElementById('submit-quiz-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (this.selectedQuizOption !== null) { this.quizSubmitted = true; this.render(); }
      });
    }
  }
  destroy() {}
}
