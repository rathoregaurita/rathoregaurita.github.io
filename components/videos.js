// EquiliPrism Educational Video Hub Component
export class Videos {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.active = true;
    this.selectedCategory = 'all';
    this.activeVideo = null;
    this.quizSubmitted = false;
    this.selectedQuizOption = null;

    this.videos = [
      {
        id: 'light-optics-1',
        title: 'How Do Mirrors Work?',
        category: 'optics',
        duration: '3:47',
        youtubeId: 'ibuD8PqVDBA',
        description: 'Ever wondered how you see your reflection? Jessi and Squeaks explain the science of mirrors, light, and reflection!',
        quiz: {
          question: 'What type of reflection occurs when light bounces off a perfectly smooth mirror?',
          options: ['Specular reflection', 'Diffuse reflection', 'Refraction', 'Absorption'],
          answer: 0,
          explanation: 'Specular reflection occurs on smooth surfaces like mirrors, where light rays bounce off at the exact same angle they arrived, creating a clear image.'
        }
      },
      {
        id: 'light-optics-2',
        title: 'How Rainbows Work',
        category: 'optics',
        duration: '4:12',
        youtubeId: 'Cm9ZkYTnCNE',
        description: 'Learn how raindrops act like tiny prisms that bend (refract) and separate light into a beautiful rainbow!',
        quiz: {
          question: 'Why does light bend when it enters glass or water?',
          options: ['It changes speed', 'It turns into sound', 'It gets absorbed', 'It gains mass'],
          answer: 0,
          explanation: 'Light bends (refracts) because it changes speed when transitioning from one medium (like air) into another (like water or glass).'
        }
      },
      {
        id: 'math-balance-1',
        title: 'Solving Basic Equations',
        category: 'math',
        duration: '11:15',
        youtubeId: 'l3XzepN03KQ',
        description: 'Learn the balance method for solving simple equations and how to isolate variables to find unknown values.',
        quiz: {
          question: 'If you add 5 to one side of a balanced equation, what must you do to the other side to keep it balanced?',
          options: ['Add 5', 'Subtract 5', 'Multiply by 5', 'Do nothing'],
          answer: 0,
          explanation: 'To keep an equation balanced, any operation performed on one side must be identically performed on the other side.'
        }
      },
      {
        id: 'math-balance-2',
        title: 'What Is Algebra?',
        category: 'math',
        duration: '7:16',
        youtubeId: 'NybHckSEQBI',
        description: 'A fun visual introduction to what algebra is, how letters represent unknown numbers, and the difference between variables and constants.',
        quiz: {
          question: 'In the equation x + 3 = 8, what represents the variable?',
          options: ['x', '3', '8', '='],
          answer: 0,
          explanation: 'The letter x represents the variable, which is an unknown value that can change or be solved for.'
        }
      },
      {
        id: 'gravity-space-1',
        title: 'What is Gravity?',
        category: 'gravity',
        duration: '3:58',
        youtubeId: 'TPotAZ1KuWs',
        description: 'Join Sabrina to learn what gravity is, how it keeps our feet on the ground, and why mass is so important!',
        quiz: {
          question: 'Who formulated the classical mathematical law of universal gravitation after observing a falling apple?',
          options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Marie Curie'],
          answer: 0,
          explanation: 'Sir Isaac Newton formulated the classical law of universal gravitation in the 17th century.'
        }
      },
      {
        id: 'gravity-space-2',
        title: "Earth's Orbit",
        category: 'gravity',
        duration: '4:12',
        youtubeId: 'gWy2-o9uwrc',
        description: 'Discover how gravity acts like an invisible tether, keeping the Earth in orbit around the Sun and preventing it from flying into deep space.',
        quiz: {
          question: 'What keeps a planet orbiting the Sun instead of falling straight in?',
          options: ['Its forward speed balances gravity', 'It is tied with a cable', 'Magnetic shields', 'Solar winds'],
          answer: 0,
          explanation: 'A planet stays in orbit because its forward velocity balances the downward pull of gravity, causing it to fall around the Sun in a stable loop.'
        }
      }
    ];

    this.render();
  }

  render() {
    if (!this.container) return;

    const filtered = this.videos.filter(v => 
      this.selectedCategory === 'all' || v.category === this.selectedCategory
    );

    let html = `
      <div class="explainers-container" style="padding: 1.5rem; max-width: 1200px; margin: 0 auto; animation: fadeIn 0.4s ease-out;">
        <!-- Header Section -->
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="font-size: 2.2rem; font-weight: 800; background: linear-gradient(to right, hsl(var(--accent-pink)), hsl(var(--accent-violet))); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem;">
            Educational Video Hub
          </h1>
          <p style="color: var(--text-muted); font-size: 0.95rem;">
            Explore amazing scientific concepts and test your knowledge with interactive quizzes!
          </p>
        </div>

        <!-- Filter Navigation -->
        <div style="display: flex; justify-content: center; gap: 0.8rem; margin-bottom: 2.5rem; flex-wrap: wrap;">
          <button class="filter-tab ${this.selectedCategory === 'all' ? 'active' : ''}" data-cat="all" style="padding: 0.5rem 1.2rem; border-radius: var(--border-radius-md); font-family: inherit; font-size: 0.85rem; font-weight: 700; cursor: pointer; border: 1px solid var(--card-border); background: ${this.selectedCategory === 'all' ? 'linear-gradient(135deg, hsl(var(--accent-pink)), hsl(var(--accent-violet)))' : 'rgba(255,255,255,0.05)'}; color: var(--text-main); transition: all 0.2s;">
            🎥 All Videos
          </button>
          <button class="filter-tab ${this.selectedCategory === 'optics' ? 'active' : ''}" data-cat="optics" style="padding: 0.5rem 1.2rem; border-radius: var(--border-radius-md); font-family: inherit; font-size: 0.85rem; font-weight: 700; cursor: pointer; border: 1px solid var(--card-border); background: ${this.selectedCategory === 'optics' ? 'linear-gradient(135deg, hsl(var(--accent-pink)), hsl(var(--accent-violet)))' : 'rgba(255,255,255,0.05)'}; color: var(--text-main); transition: all 0.2s;">
            ☀️ Light & Optics
          </button>
          <button class="filter-tab ${this.selectedCategory === 'math' ? 'active' : ''}" data-cat="math" style="padding: 0.5rem 1.2rem; border-radius: var(--border-radius-md); font-family: inherit; font-size: 0.85rem; font-weight: 700; cursor: pointer; border: 1px solid var(--card-border); background: ${this.selectedCategory === 'math' ? 'linear-gradient(135deg, hsl(var(--accent-pink)), hsl(var(--accent-violet)))' : 'rgba(255,255,255,0.05)'}; color: var(--text-main); transition: all 0.2s;">
            🧮 Equations & Math
          </button>
          <button class="filter-tab ${this.selectedCategory === 'gravity' ? 'active' : ''}" data-cat="gravity" style="padding: 0.5rem 1.2rem; border-radius: var(--border-radius-md); font-family: inherit; font-size: 0.85rem; font-weight: 700; cursor: pointer; border: 1px solid var(--card-border); background: ${this.selectedCategory === 'gravity' ? 'linear-gradient(135deg, hsl(var(--accent-pink)), hsl(var(--accent-violet)))' : 'rgba(255,255,255,0.05)'}; color: var(--text-main); transition: all 0.2s;">
            🌍 Gravity & Orbits
          </button>
        </div>

        <!-- Video Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.8rem;">
          ${filtered.map(v => `
            <div class="video-card glass-card" data-id="${v.id}" style="border: 1px solid var(--card-border); border-radius: var(--border-radius-lg); overflow: hidden; cursor: pointer; display: flex; flex-direction: column; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: rgba(255,255,255,0.02); height: 100%;">
              <!-- Thumbnail -->
              <div style="position: relative; width: 100%; aspect-ratio: 16/9; background: #000; overflow: hidden;">
                <img src="https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg" alt="${v.title}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8; transition: transform 0.4s ease;" class="thumb-img" />
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;" class="overlay">
                  <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, hsl(var(--accent-pink)), hsl(var(--accent-violet))); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: transform 0.2s ease;" class="play-btn">
                    <span style="color: #fff; font-size: 1.2rem; margin-left: 3px;">▶</span>
                  </div>
                </div>
                <span style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.75); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700; color: #fff;">
                  ${v.duration}
                </span>
              </div>

              <!-- Content Info -->
              <div style="padding: 1.2rem; flex-grow: 1; display: flex; flex-direction: column; gap: 0.6rem;">
                <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: hsl(var(--accent-pink)); letter-spacing: 0.05em;">
                  ${v.category === 'optics' ? 'Optics' : v.category === 'math' ? 'Algebra' : 'Gravity & Space'}
                </span>
                <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin: 0; line-height: 1.35;">
                  ${v.title}
                </h3>
                <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.45; margin: 0; flex-grow: 1;">
                  ${v.description}
                </p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Theater Mode Modal Overlay -->
      ${this.activeVideo ? `
        <div class="modal-overlay active" id="theater-modal" style="display: flex; align-items: center; justify-content: center; z-index: 10000; animation: fadeIn 0.3s ease-out;">
          <div class="modal-content glass-card" style="width: 90%; max-width: 900px; max-height: 90vh; overflow-y: auto; padding: 1.5rem; border-radius: var(--border-radius-lg); position: relative; border: 1px solid var(--card-border); background: rgba(15, 12, 28, 0.95); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            <!-- Close Button -->
            <button id="close-theater-btn" style="position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--card-border); background: rgba(255,255,255,0.05); color: var(--text-main); font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
              &times;
            </button>

            <!-- Video Player Frame -->
            <div style="position: relative; width: 100%; aspect-ratio: 16/9; background: #000; border-radius: var(--border-radius-md); overflow: hidden; margin-top: 1rem; border: 1px solid var(--card-border);">
              <iframe src="https://www.youtube.com/embed/${this.activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top:0; left:0; width:100%; height:100%;"></iframe>
            </div>

            <!-- YouTube Redirection Fallback Button -->
            <div style="margin-top: 0.8rem; display: flex; justify-content: flex-end;">
              <a href="https://www.youtube.com/watch?v=${this.activeVideo.youtubeId}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 1rem; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: var(--border-radius-sm); color: #f87171; font-size: 0.82rem; font-weight: 700; text-decoration: none; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.25)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.15)'">
                📺 Watch directly on YouTube ↗
              </a>
            </div>

            <!-- Video Context Details -->
            <div style="margin-top: 1.5rem; border-bottom: 1px solid var(--card-border); padding-bottom: 1rem; margin-bottom: 1.5rem;">
              <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.4rem;">
                ${this.activeVideo.title}
              </h2>
              <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin: 0;">
                ${this.activeVideo.description}
              </p>
            </div>

            <!-- Video Learning Quiz -->
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--card-border); border-radius: var(--border-radius-md); padding: 1.2rem;">
              <h4 style="margin: 0 0 0.8rem 0; font-size: 1rem; color: hsl(var(--accent-pink)); font-weight: 800; display: flex; align-items: center; gap: 0.4rem;">
                ⚡ Concept Check Challenge
              </h4>
              <p style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 1rem;">
                ${this.activeVideo.quiz.question}
              </p>

              <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1rem;">
                ${this.activeVideo.quiz.options.map((opt, idx) => {
                  let btnBg = 'rgba(255,255,255,0.03)';
                  let btnBorder = 'var(--card-border)';
                  let cursorStyle = 'pointer';

                  if (this.quizSubmitted) {
                    cursorStyle = 'default';
                    if (idx === this.activeVideo.quiz.answer) {
                      btnBg = 'rgba(16, 185, 129, 0.15)'; // Green Correct
                      btnBorder = 'rgba(16, 185, 129, 0.4)';
                    } else if (idx === this.selectedQuizOption) {
                      btnBg = 'rgba(239, 68, 68, 0.15)'; // Red Incorrect
                      btnBorder = 'rgba(239, 68, 68, 0.4)';
                    }
                  } else if (this.selectedQuizOption === idx) {
                    btnBg = 'rgba(147, 51, 234, 0.15)'; // Active Purple Selection
                    btnBorder = 'rgba(147, 51, 234, 0.5)';
                  }

                  return `
                    <button class="quiz-option-btn" data-idx="${idx}" style="text-align: left; padding: 0.8rem; font-family: inherit; font-size: 0.88rem; color: var(--text-main); border: 1px solid ${btnBorder}; background: ${btnBg}; border-radius: var(--border-radius-sm); cursor: ${cursorStyle}; transition: all 0.2s;" ${this.quizSubmitted ? 'disabled' : ''}>
                      <span style="font-weight:800; color: ${this.selectedQuizOption === idx ? 'hsl(var(--accent-violet))' : 'var(--text-muted)'}; margin-right: 0.5rem;">
                        ${String.fromCharCode(65 + idx)}.
                      </span>
                      ${opt}
                    </button>
                  `;
                }).join('')}
              </div>

              <!-- Submit / Feedback Block -->
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
                <div>
                  ${this.quizSubmitted ? `
                    <div style="font-size: 0.88rem; line-height: 1.45; color: ${this.selectedQuizOption === this.activeVideo.quiz.answer ? '#10b981' : '#ef4444'}; font-weight: 700; margin-bottom: 0.3rem;">
                      ${this.selectedQuizOption === this.activeVideo.quiz.answer ? '🎉 Correct Answer!' : '❌ Incorrect, try reading the explanation below:'}
                    </div>
                    <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">
                      ${this.activeVideo.quiz.explanation}
                    </div>
                  ` : ''}
                </div>

                ${!this.quizSubmitted ? `
                  <button id="submit-quiz-btn" style="padding: 0.6rem 1.5rem; font-family: inherit; font-size: 0.85rem; font-weight: 700; border-radius: var(--border-radius-sm); border: none; background: linear-gradient(to right, hsl(var(--accent-pink)), hsl(var(--accent-violet))); color: #fff; cursor: ${this.selectedQuizOption !== null ? 'pointer' : 'not-allowed'}; opacity: ${this.selectedQuizOption !== null ? '1' : '0.5'}; transition: all 0.2s;" ${this.selectedQuizOption !== null ? '' : 'disabled'}>
                    Check Answer
                  </button>
                ` : `
                  <button id="reset-quiz-btn" style="padding: 0.6rem 1.2rem; font-family: inherit; font-size: 0.82rem; font-weight: 700; border-radius: var(--border-radius-sm); border: 1px solid var(--card-border); background: rgba(255,255,255,0.05); color: var(--text-main); cursor: pointer; transition: all 0.2s;">
                    Try Again
                  </button>
                `}
              </div>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    this.container.innerHTML = html;
    this.bindEvents();
  }

  bindEvents() {
    // 1. Category filter click handlers
    this.container.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.selectedCategory = tab.getAttribute('data-cat');
        this.render();
      });
    });

    // 2. Video card hover scaling visual styles
    this.container.querySelectorAll('.video-card').forEach(card => {
      const img = card.querySelector('.thumb-img');
      const play = card.querySelector('.play-btn');
      
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
        card.style.boxShadow = '0 10px 25px rgba(147, 51, 234, 0.15)';
        card.style.borderColor = 'rgba(147, 51, 234, 0.3)';
        if (img) img.style.transform = 'scale(1.05)';
        if (play) play.style.transform = 'scale(1.15)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
        card.style.borderColor = 'var(--card-border)';
        if (img) img.style.transform = 'scale(1)';
        if (play) play.style.transform = 'scale(1)';
      });

      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const video = this.videos.find(v => v.id === id);
        if (video) {
          this.activeVideo = video;
          this.quizSubmitted = false;
          this.selectedQuizOption = null;
          this.render();
        }
      });
    });

    // 3. Modal close click handler
    const closeBtn = document.getElementById('close-theater-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.activeVideo = null;
        this.render();
      });
    }

    const modalOverlay = document.getElementById('theater-modal');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'theater-modal') {
          this.activeVideo = null;
          this.render();
        }
      });
    }

    // 4. Quiz Option buttons click handler
    this.container.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.quizSubmitted) return;
        const idx = parseInt(btn.getAttribute('data-idx'));
        this.selectedQuizOption = idx;
        this.render();
      });
    });

    // 5. Submit Quiz button click
    const submitBtn = document.getElementById('submit-quiz-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (this.selectedQuizOption !== null) {
          this.quizSubmitted = true;
          this.render();
        }
      });
    }

    // 6. Reset Quiz / Try Again button click
    const resetBtn = document.getElementById('reset-quiz-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.quizSubmitted = false;
        this.selectedQuizOption = null;
        this.render();
      });
    }
  }

  destroy() {
    this.active = false;
  }
}
