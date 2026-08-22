// EquiliPrism Sparky Wardrobe Customizer Component
import { adaptiveEngine } from '../hooks/adaptive-engine.js';

// Reward Catalog definition
const REWARDS = [
  { id: 'skin-default', name: 'Original Sparky', type: 'skin', value: 'default', req: 0, desc: 'Your trusty cosmic companion.' },
  { id: 'item-bubble_tea', name: 'Bubble Tea', type: 'mouth', value: 'bubble_tea', req: 1, desc: 'Sweet milk tea with tapioca pearls!' },
  { id: 'skin-cat', name: 'Cute Cat', type: 'skin', value: 'cat', req: 2, desc: 'A soft orange kitty skin.' },
  { id: 'item-fish_hat', name: 'Fish Hat', type: 'head', value: 'fish_hat', req: 3, desc: 'A silly blue fish hat!' },
  { id: 'skin-dog', name: 'Playful Dog', type: 'skin', value: 'dog', req: 4, desc: 'A happy golden retriever puppy.' },
  { id: 'item-spiked_collar', name: 'Spiked Collar', type: 'mouth', value: 'spiked_collar', req: 5, desc: 'A cool leather collar with spikes.' },
  { id: 'skin-panda', name: 'Sleepy Panda', type: 'skin', value: 'panda', req: 6, desc: 'A black-and-white bamboo eater.' },
  { id: 'item-bamboo_straw', name: 'Bamboo Straw', type: 'mouth', value: 'bamboo_straw', req: 7, desc: 'A green straw to sip juices.' },
  
  // Fantasy set 1
  { id: 'skin-dragon', name: 'Fire Dragon', type: 'skin', value: 'dragon', req: 8, desc: 'A green dragon skin (Fantasy!)' },
  { id: 'item-dragon_wings', name: 'Dragon Wings', type: 'back', value: 'dragon_wings', req: 9, desc: 'Large reptilian wings (Fantasy!)' },
  { id: 'skin-unicorn', name: 'Magic Unicorn', type: 'skin', value: 'unicorn', req: 10, desc: 'A pastel unicorn skin (Fantasy!)' },
  { id: 'item-rainbow_horn', name: 'Rainbow Horn', type: 'head', value: 'rainbow_horn', req: 11, desc: 'A glowing color-cycling horn (Fantasy!)' },
  { id: 'skin-phoenix', name: 'Fiery Phoenix', type: 'skin', value: 'phoenix', req: 12, desc: 'A gold-orange bird of fire (Fantasy!)' },
  { id: 'item-flame_crown', name: 'Flame Crown', type: 'head', value: 'flame_crown', req: 13, desc: 'A crown made of pure floating fire (Fantasy!)' },
  
  // Basic & Intermediate levels
  { id: 'item-bamboo_hat', name: 'Bamboo Hat', type: 'head', value: 'bamboo_hat', req: 14, desc: 'A conical woven straw hat.' },
  { id: 'item-cape', name: 'Hero Cape', type: 'back', value: 'cape', req: 15, desc: 'A red fluttering cape.' },
  
  // New Animals & Accessories (Levels 16-75 unlocks)
  { id: 'skin-fox', name: 'Crafty Fox', type: 'skin', value: 'fox', req: 16, desc: 'A clever reddish-orange woodland fox.' },
  { id: 'item-wizard_hat', name: 'Wizard Hat', type: 'head', value: 'wizard_hat', req: 18, desc: 'A pointed starry sorcerer hat.' },
  { id: 'skin-lion', name: 'Noble Lion', type: 'skin', value: 'lion', req: 20, desc: 'The brave king of the jungle.' },
  { id: 'item-steak', name: 'Juicy Steak', type: 'mouth', value: 'steak', req: 22, desc: 'A delicious prime cut treat.' },
  { id: 'skin-monkey', name: 'Cheeky Monkey', type: 'skin', value: 'monkey', req: 24, desc: 'A playful swinging companion.' },
  { id: 'item-banana', name: 'Sweet Banana', type: 'mouth', value: 'banana', req: 26, desc: 'A fresh, ripe yellow banana.' },
  { id: 'skin-koala', name: 'Chilled Koala', type: 'skin', value: 'koala', req: 28, desc: 'A sleepy grey marsupial.' },
  { id: 'item-eucalyptus_leaf', name: 'Eucalyptus Leaf', type: 'mouth', value: 'eucalyptus_leaf', req: 30, desc: 'Fresh minty koala snacks.' },
  
  // Fantasy Set 2
  { id: 'skin-pegasus', name: 'Sky Pegasus', type: 'skin', value: 'pegasus', req: 35, desc: 'A majestic winged white stallion.' },
  { id: 'item-pegasus_wings', name: 'Pegasus Wings', type: 'back', value: 'pegasus_wings', req: 40, desc: 'Elegant white feathered wings.' },
  { id: 'skin-griffin', name: 'Golden Griffin', type: 'skin', value: 'griffin', req: 45, desc: 'Half-lion, half-eagle beast.' },
  { id: 'item-golden_feather', name: 'Golden Feather', type: 'mouth', value: 'golden_feather', req: 50, desc: 'A shimmering magical quill.' },
  { id: 'skin-wyvern', name: 'Shadow Wyvern', type: 'skin', value: 'wyvern', req: 60, desc: 'A legendary dark dragon wing.' },
  { id: 'item-wyvern_tail', name: 'Wyvern Tail', type: 'back', value: 'wyvern_tail', req: 70, desc: 'A spiky barbed dragon tail.' },
  
  // Master Space & Cyber Set (Levels 75-100 unlocks)
  { id: 'skin-alien', name: 'Cosmic Alien', type: 'skin', value: 'alien', req: 75, desc: 'A cute neon-green extra-terrestrial companion.' },
  { id: 'item-ufo', name: 'Mini UFO Probe', type: 'back', value: 'ufo', req: 80, desc: 'A tiny floating saucer following you.' },
  { id: 'skin-astronaut', name: 'Astro Suit', type: 'skin', value: 'astronaut', req: 85, desc: 'A white astronaut spacesuit skin.' },
  { id: 'item-helmet', name: 'Space Visor', type: 'head', value: 'helmet', req: 90, desc: 'A glowing cyan space helmet dome.' },
  { id: 'skin-cyborg', name: 'Robo Cyborg', type: 'skin', value: 'cyborg', req: 95, desc: 'A metallic cyborg skin with laser nodes.' },
  { id: 'item-cyber_wings', name: 'Holo Wings', type: 'back', value: 'cyber_wings', req: 98, desc: 'Neon pink holo-light wings.' },
  { id: 'skin-galaxy', name: 'Cosmic Nebula', type: 'skin', value: 'galaxy', req: 100, desc: 'A star-filled galaxy space skin.' },
  { id: 'item-galaxy_halo', name: 'Galaxy Halo', type: 'head', value: 'galaxy_halo', req: 100, desc: 'A color-cycling cosmic ring above your head.' }
];

export class SparkyWardrobe {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeTab = 'all'; // 'all' | 'skin' | 'head' | 'mouth' | 'back'
    this.mood = 'happy';

    // Event listener for state changes
    this.boundStateChange = () => {
      this.render();
    };
    window.addEventListener('equiliprismStateChanged', this.boundStateChange);
  }

  // Draw Sparky Preview (replicated SVG drawing for self-containment)
  getSparkySVG() {
    const custom = adaptiveEngine.state.customSparky || { skin: 'default', headItem: null, mouthItem: null, backItem: null };
    const skin = custom.skin || 'default';
    const headItem = custom.headItem;
    const mouthItem = custom.mouthItem;
    const backItem = custom.backItem;

    let eyeClass = 'eye-happy';
    let mouthSVG = '<path d="M 20 30 Q 30 38 40 30" stroke="#fff" stroke-width="3" fill="none"/>';

    let skinBodyColor = 'hsl(263, 85%, 65%)';
    let skinStrokeColor = 'hsl(190, 95%, 48%)';
    let earSVG = '';
    let faceSVG = '';
    
    if (skin === 'cat') {
      skinBodyColor = '#f59e0b';
      skinStrokeColor = '#d97706';
      earSVG = `
        <polygon points="12,18 4,6 18,12" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
        <polygon points="13,16 7,8 17,12" fill="#fca5a5" />
        <polygon points="48,18 56,6 42,12" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
        <polygon points="47,16 53,8 43,12" fill="#fca5a5" />
      `;
      faceSVG = `
        <line x1="12" y1="28" x2="4" y2="26" stroke="#fff" stroke-width="1.5"/>
        <line x1="12" y1="31" x2="3" y2="31" stroke="#fff" stroke-width="1.5"/>
        <line x1="48" y1="28" x2="56" y2="26" stroke="#fff" stroke-width="1.5"/>
        <line x1="48" y1="31" x2="57" y2="31" stroke="#fff" stroke-width="1.5"/>
        <polygon points="30,26 27,23 33,23" fill="#f43f5e" />
      `;
    } else if (skin === 'dog') {
      skinBodyColor = '#d97706';
      skinStrokeColor = '#b45309';
      earSVG = `
        <path d="M 8 16 Q 0 24 6 36 Q 16 38 14 22 Z" fill="#b45309" stroke="#78350f" stroke-width="1"/>
        <path d="M 52 16 Q 60 24 54 36 Q 44 38 46 22 Z" fill="#b45309" stroke="#78350f" stroke-width="1"/>
      `;
      faceSVG = `
        <ellipse cx="30" cy="27" rx="5" ry="3.5" fill="#fbcfe8" />
        <ellipse cx="30" cy="25" rx="3.5" ry="2" fill="#1e293b" />
        <path d="M 28 30 C 28 36 32 36 32 30 Z" fill="#ef4444"/>
      `;
    } else if (skin === 'panda') {
      skinBodyColor = '#ffffff';
      skinStrokeColor = '#1e293b';
      earSVG = `
        <circle cx="14" cy="14" r="6.5" fill="#1e293b"/>
        <circle cx="46" cy="14" r="6.5" fill="#1e293b"/>
      `;
      faceSVG = `
        <ellipse cx="21" cy="22" rx="5.5" ry="6.5" fill="#1e293b" transform="rotate(-10 21 22)"/>
        <ellipse cx="39" cy="22" rx="5.5" ry="6.5" fill="#1e293b" transform="rotate(10 39 22)"/>
        <circle cx="30" cy="26" r="2" fill="#1e293b"/>
      `;
    } else if (skin === 'dragon') {
      skinBodyColor = '#10b981';
      skinStrokeColor = '#047857';
      earSVG = `
        <path d="M 16 14 Q 8 6 12 0 Q 18 6 18 12 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
        <path d="M 44 14 Q 52 6 48 0 Q 42 6 42 12 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
        <polygon points="12,30 3,32 10,36" fill="#10b981" stroke="#047857" stroke-width="1.5"/>
        <polygon points="48,30 57,32 50,36" fill="#10b981" stroke="#047857" stroke-width="1.5"/>
      `;
      faceSVG = `
        <circle cx="27" cy="26" r="1" fill="#047857"/>
        <circle cx="33" cy="26" r="1" fill="#047857"/>
      `;
    } else if (skin === 'unicorn') {
      skinBodyColor = '#f5f3ff';
      skinStrokeColor = '#c084fc';
      earSVG = `
        <polygon points="14,14 8,4 20,10" fill="#f5f3ff" stroke="#c084fc" stroke-width="1.5"/>
        <polygon points="46,14 52,4 40,10" fill="#f5f3ff" stroke="#c084fc" stroke-width="1.5"/>
        <path d="M 12 12 Q 2 24 8 36" fill="none" stroke="#f472b6" stroke-width="4" stroke-linecap="round"/>
        <path d="M 48 12 Q 58 24 52 36" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
      `;
      faceSVG = `
        ${!headItem ? `
          <polygon points="30,12 27,2 33,2" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
          <line x1="30" y1="12" x2="30" y2="2" stroke="#fff" stroke-width="0.5"/>
        ` : ''}
        <circle cx="30" cy="26" r="1.5" fill="#c084fc" opacity="0.6"/>
      `;
    } else if (skin === 'phoenix') {
      skinBodyColor = '#f97316';
      skinStrokeColor = '#ea580c';
      earSVG = `
        <path d="M 30 10 C 24 -2 36 -2 30 10 Z" fill="#ef4444" stroke="#ea580c" stroke-width="1"/>
        <path d="M 26 12 C 16 2 28 2 26 12 Z" fill="#fbbf24" stroke="#ea580c" stroke-width="1"/>
        <path d="M 34 12 C 44 2 32 2 34 12 Z" fill="#fbbf24" stroke="#ea580c" stroke-width="1"/>
      `;
      faceSVG = `
        <polygon points="30,24 27,28 33,28" fill="#fbbf24" stroke="#ea580c" stroke-width="1"/>
      `;
    } else if (skin === 'fox') {
      skinBodyColor = '#f97316';
      skinStrokeColor = '#c2410c';
      earSVG = `
        <polygon points="12,18 4,6 18,12" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
        <polygon points="13,16 9,10 17,12" fill="#fff" />
        <polygon points="48,18 56,6 42,12" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
        <polygon points="47,16 51,10 43,12" fill="#fff" />
      `;
      faceSVG = `
        <ellipse cx="30" cy="28" rx="6" ry="4" fill="#fff" />
        <polygon points="30,29 27,26 33,26" fill="#1e293b" />
      `;
    } else if (skin === 'lion') {
      skinBodyColor = '#fbbf24';
      skinStrokeColor = '#d97706';
      earSVG = `
        <circle cx="30" cy="30" r="22" fill="#b45309" stroke="#78350f" stroke-width="1.5" />
        <circle cx="14" cy="18" r="5" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
        <circle cx="46" cy="18" r="5" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
      `;
      faceSVG = `
        <polygon points="30,27 27,24 33,24" fill="#1e293b" />
      `;
    } else if (skin === 'monkey') {
      skinBodyColor = '#854d0e';
      skinStrokeColor = '#713f12';
      earSVG = `
        <circle cx="11" cy="26" r="6" fill="#854d0e" stroke="#713f12" stroke-width="1.5"/>
        <circle cx="11" cy="26" r="3.5" fill="#fbcfe8" />
        <circle cx="49" cy="26" r="6" fill="#854d0e" stroke="#713f12" stroke-width="1.5"/>
        <circle cx="49" cy="26" r="3.5" fill="#fbcfe8" />
      `;
      faceSVG = `
        <ellipse cx="25" cy="26" rx="6" ry="6" fill="#fbcfe8" />
        <ellipse cx="35" cy="26" rx="6" ry="6" fill="#fbcfe8" />
        <ellipse cx="30" cy="30" rx="8" ry="6" fill="#fbcfe8" />
        <circle cx="30" cy="27" r="1.5" fill="#713f12" />
      `;
    } else if (skin === 'koala') {
      skinBodyColor = '#94a3b8';
      skinStrokeColor = '#64748b';
      earSVG = `
        <circle cx="12" cy="16" r="8" fill="#94a3b8" stroke="#64748b" stroke-width="1.5"/>
        <circle cx="12" cy="16" r="5" fill="#f1f5f9" />
        <circle cx="48" cy="16" r="8" fill="#94a3b8" stroke="#64748b" stroke-width="1.5"/>
        <circle cx="48" cy="16" r="5" fill="#f1f5f9" />
      `;
      faceSVG = `
        <ellipse cx="30" cy="26" rx="3.5" ry="6" fill="#1e293b" />
      `;
    } else if (skin === 'pegasus') {
      skinBodyColor = '#f8fafc';
      skinStrokeColor = '#cbd5e1';
      earSVG = `
        <polygon points="14,14 8,4 20,10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <polygon points="46,14 52,4 40,10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <path d="M 12 12 Q 2 24 8 36" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
        <path d="M 48 12 Q 58 24 52 36" fill="none" stroke="#a78bfa" stroke-width="4" stroke-linecap="round"/>
      `;
      faceSVG = `
        <circle cx="30" cy="26" r="1.5" fill="#cbd5e1" opacity="0.6"/>
      `;
    } else if (skin === 'griffin') {
      skinBodyColor = '#f59e0b';
      skinStrokeColor = '#d97706';
      earSVG = `
        <path d="M 16 14 Q 8 6 12 0 Q 18 6 18 12 Z" fill="#f59e0b" stroke="#d97706" stroke-width="1.5"/>
        <path d="M 44 14 Q 52 6 48 0 Q 42 6 42 12 Z" fill="#f59e0b" stroke="#d97706" stroke-width="1.5"/>
        <path d="M 30 10 C 24 -2 36 -2 30 10 Z" fill="#d97706" stroke="#b45309" stroke-width="1"/>
      `;
      faceSVG = `
        <polygon points="30,24 26,29 34,29" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
      `;
    } else if (skin === 'wyvern') {
      skinBodyColor = '#475569';
      skinStrokeColor = '#1e293b';
      earSVG = `
        <polygon points="14,14 4,2 18,10" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
        <polygon points="46,14 56,2 42,10" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
        <polygon points="12,30 3,32 10,36" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
        <polygon points="48,30 57,32 50,36" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
      `;
      faceSVG = `
        <circle cx="27" cy="26" r="1.2" fill="#1e293b"/>
        <circle cx="33" cy="26" r="1.2" fill="#1e293b"/>
      `;
    } else if (skin === 'alien') {
      skinBodyColor = '#22c55e';
      skinStrokeColor = '#15803d';
      earSVG = `
        <line x1="20" y1="12" x2="14" y2="2" stroke="#15803d" stroke-width="2"/>
        <circle cx="14" cy="2" r="3" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
        <line x1="40" y1="12" x2="46" y2="2" stroke="#15803d" stroke-width="2"/>
        <circle cx="46" cy="2" r="3" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
      `;
      faceSVG = `
        <ellipse cx="21" cy="22" rx="5.5" ry="7.5" fill="#1e293b" transform="rotate(-15 21 22)"/>
        <ellipse cx="39" cy="22" rx="5.5" ry="7.5" fill="#1e293b" transform="rotate(15 39 22)"/>
        <circle cx="23" cy="19" r="1.5" fill="#fff"/>
        <circle cx="37" cy="19" r="1.5" fill="#fff"/>
      `;
    } else if (skin === 'astronaut') {
      skinBodyColor = '#f1f5f9';
      skinStrokeColor = '#94a3b8';
      earSVG = `
        <rect x="6" y="16" width="6" height="12" rx="2" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1"/>
        <rect x="48" y="16" width="6" height="12" rx="2" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1"/>
      `;
      faceSVG = `
        <path d="M 12 14 A 20 20 0 0 1 48 14 L 46 36 A 20 20 0 0 1 14 36 Z" fill="none" stroke="#60a5fa" stroke-width="1.5" opacity="0.45"/>
      `;
    } else if (skin === 'cyborg') {
      skinBodyColor = '#cbd5e1';
      skinStrokeColor = '#475569';
      earSVG = `
        <rect x="8" y="14" width="5" height="14" fill="#64748b" stroke="#334155" stroke-width="1"/>
        <circle cx="10" cy="14" r="2" fill="#ef4444"/>
        <rect x="47" y="14" width="5" height="14" fill="#64748b" stroke="#334155" stroke-width="1"/>
      `;
      faceSVG = `
        <line x1="30" y1="12" x2="30" y2="44" stroke="#475569" stroke-width="1" stroke-dasharray="2 2"/>
        <path d="M 12 24 L 28 24 L 28 12" fill="none" stroke="#475569" stroke-width="1"/>
        <circle cx="21" cy="22" r="5" fill="#ef4444" opacity="0.3"/>
        <circle cx="21" cy="22" r="2.2" fill="#ef4444"/>
      `;
    } else if (skin === 'galaxy') {
      skinBodyColor = '#0f172a';
      skinStrokeColor = '#6366f1';
      earSVG = `
        <circle cx="12" cy="16" r="6" fill="#a855f7" opacity="0.7"/>
        <circle cx="48" cy="16" r="6" fill="#ec4899" opacity="0.7"/>
      `;
      faceSVG = `
        <polygon points="30,8 31,10 33,10 31,11 32,13 30,12 28,13 29,11 27,10 29,10" fill="#fff" opacity="0.95"/>
        <circle cx="18" cy="30" r="0.8" fill="#fff"/>
        <circle cx="42" cy="30" r="0.8" fill="#fff"/>
        <circle cx="30" cy="34" r="1.2" fill="#fbbf24"/>
      `;
    }

    let headItemSVG = '';
    let mouthItemSVG = '';
    let backItemSVG = '';

    if (backItem === 'dragon_wings') {
      backItemSVG = `
        <g stroke="#047857" stroke-width="1.5">
          <path d="M 12 24 C -8 10 -4 42 10 32 Z" fill="#059669" class="wing-l" />
          <path d="M 48 24 C 68 10 64 42 50 32 Z" fill="#059669" class="wing-r" />
        </g>
      `;
    } else if (backItem === 'phoenix_tail') {
      backItemSVG = `
        <g stroke="#ea580c" stroke-width="1.5">
          <path d="M 12 26 C -6 20 -2 50 10 34 Z" fill="#f97316" class="wing-l" />
          <path d="M 12 26 C -2 24 0 42 10 32 Z" fill="#facc15" class="wing-l" />
          <path d="M 48 26 C 66 20 62 50 50 34 Z" fill="#f97316" class="wing-r" />
          <path d="M 48 26 C 50 24 48 42 50 32 Z" fill="#facc15" class="wing-r" />
        </g>
      `;
    } else if (backItem === 'cape') {
      backItemSVG = `
        <path d="M 16 26 L 4 52 L 20 48 L 30 46 L 40 48 L 56 52 L 44 26 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5" class="wing-l" />
      `;
    } else if (backItem === 'pegasus_wings') {
      backItemSVG = `
        <g stroke="#cbd5e1" stroke-width="1.5">
          <path d="M 12 24 C -10 6 -4 44 10 32 Z" fill="#f8fafc" class="wing-l" />
          <line x1="2" y1="16" x2="8" y2="28" stroke="#cbd5e1" stroke-width="1" class="wing-l" />
          <path d="M 48 24 C 70 6 64 44 50 32 Z" fill="#f8fafc" class="wing-r" />
          <line x1="58" y1="16" x2="52" y2="28" stroke="#cbd5e1" stroke-width="1" class="wing-r" />
        </g>
      `;
    } else if (backItem === 'wyvern_tail') {
      backItemSVG = `
        <path d="M 30 46 Q 30 56 18 54 Q 10 52 12 46 Q 14 42 22 46 Q 28 50 28 46" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        <polygon points="12,46 6,42 8,48" fill="#ef4444" />
      `;
    } else if (backItem === 'ufo') {
      backItemSVG = `
        <g class="wing-l">
          <ellipse cx="6" cy="34" rx="8" ry="3.5" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
          <ellipse cx="6" cy="31" rx="4.5" ry="3" fill="#22d3ee" opacity="0.8"/>
        </g>
        <g class="wing-r">
          <ellipse cx="54" cy="34" rx="8" ry="3.5" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
          <ellipse cx="54" cy="31" rx="4.5" ry="3" fill="#22d3ee" opacity="0.8"/>
        </g>
      `;
    } else if (backItem === 'cyber_wings') {
      backItemSVG = `
        <g stroke="#ff00ff" stroke-width="2" class="wing-l" style="filter: drop-shadow(0 0 4px rgba(255, 0, 255, 0.85));">
          <line x1="12" y1="24" x2="-6" y2="12" />
          <line x1="12" y1="24" x2="-10" y2="24" />
          <line x1="12" y1="24" x2="-4" y2="34" />
        </g>
        <g stroke="#ff00ff" stroke-width="2" class="wing-r" style="filter: drop-shadow(0 0 4px rgba(255, 0, 255, 0.85));">
          <line x1="48" y1="24" x2="66" y2="12" />
          <line x1="48" y1="24" x2="70" y2="24" />
          <line x1="48" y1="24" x2="64" y2="34" />
        </g>
      `;
    }

    if (headItem === 'fish_hat') {
      headItemSVG = `
        <g transform="translate(14, -6)">
          <ellipse cx="16" cy="14" rx="14" ry="9" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
          <polygon points="2,14 -4,9 -4,19" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
          <circle cx="24" cy="11" r="2" fill="#fff"/>
          <circle cx="24" cy="11" r="0.8" fill="#000"/>
        </g>
      `;
    } else if (headItem === 'bamboo_hat') {
      headItemSVG = `
        <polygon points="30,-4 8,14 52,14" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
        <line x1="30" y1="-4" x2="22" y2="14" stroke="#ca8a04" stroke-width="1"/>
        <line x1="30" y1="-4" x2="38" y2="14" stroke="#ca8a04" stroke-width="1"/>
      `;
    } else if (headItem === 'rainbow_horn') {
      headItemSVG = `
        <g class="glow-rainbow">
          <polygon points="30,12 26,-2 34,-2" fill="url(#rainbowHornGrad)" stroke="#a855f7" stroke-width="1.5"/>
        </g>
      `;
    } else if (headItem === 'flame_crown') {
      headItemSVG = `
        <g stroke="#f97316" stroke-width="1">
          <polygon points="20,12 22,2 26,10 30,-2 34,10 38,2 40,12" fill="#ef4444"/>
          <polygon points="22,12 25,6 27,11 30,3 33,11 35,6 38,12" fill="#fbbf24"/>
        </g>
      `;
    } else if (headItem === 'wizard_hat') {
      headItemSVG = `
        <polygon points="30,-12 12,12 48,12" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
        <ellipse cx="30" cy="12" rx="20" ry="3" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
        <polygon points="30,0 29,3 32,1 30,0" fill="#facc15"/>
        <polygon points="24,6 23,8 25,7 24,6" fill="#facc15"/>
        <polygon points="36,6 35,8 37,7 36,6" fill="#facc15"/>
      `;
    } else if (headItem === 'helmet') {
      headItemSVG = `
        <!-- Astro space helmet glass bubble -->
        <circle cx="30" cy="22" r="23" fill="rgba(6, 182, 212, 0.12)" stroke="#22d3ee" stroke-width="1.5" style="filter: drop-shadow(0 0 3px rgba(6, 182, 212, 0.4));"/>
        <path d="M 12 14 Q 30 4 48 14" fill="none" stroke="#fff" stroke-width="1" opacity="0.5"/>
      `;
    } else if (headItem === 'galaxy_halo') {
      headItemSVG = `
        <!-- Floating color cycling halo ring -->
        <ellipse cx="30" cy="-6" rx="16" ry="3.5" fill="none" stroke="#a855f7" stroke-width="2" style="filter: drop-shadow(0 0 4px #ec4899); transform: rotate(-5deg); transform-origin: 30px -6px;"/>
        <circle cx="16" cy="-8" r="2.2" fill="#f472b6"/>
        <circle cx="44" cy="-4" r="1.2" fill="#38bdf8"/>
      `;
    }

    if (mouthItem === 'fish_bone') {
      mouthItemSVG = `
        <g transform="translate(18, 30)">
          <line x1="0" y1="0" x2="24" y2="0" stroke="#cbd5e1" stroke-width="2"/>
          <line x1="6" y1="-5" x2="6" y2="5" stroke="#cbd5e1" stroke-width="1.5"/>
          <line x1="12" y1="-7" x2="12" y2="7" stroke="#cbd5e1" stroke-width="1.5"/>
          <line x1="18" y1="-5" x2="18" y2="5" stroke="#cbd5e1" stroke-width="1.5"/>
          <polygon points="24,0 29,-4 29,4" fill="#cbd5e1"/>
        </g>
      `;
    } else if (mouthItem === 'spiked_collar') {
      mouthItemSVG = `
        <path d="M 16 38 Q 30 46 44 38 L 42 42 Q 30 50 18 42 Z" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
        <polygon points="20,41 20,46 22,42" fill="#cbd5e1" />
        <polygon points="25,43 25,48 27,44" fill="#cbd5e1" />
        <polygon points="30,44 30,49 32,45" fill="#cbd5e1" />
        <polygon points="35,43 35,48 37,44" fill="#cbd5e1" />
        <polygon points="40,41 40,46 42,42" fill="#cbd5e1" />
      `;
    } else if (mouthItem === 'bamboo_straw') {
      mouthItemSVG = `
        <line x1="30" y1="31" x2="16" y2="44" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
        <line x1="18" y1="42" x2="14" y2="48" stroke="#15803d" stroke-width="2"/>
      `;
    } else if (mouthItem === 'bubble_tea') {
      mouthItemSVG = `
        <g transform="translate(36, 24)">
          <rect x="0" y="4" width="12" height="18" rx="2" fill="rgba(251, 191, 36, 0.4)" stroke="#d97706" stroke-width="1.5"/>
          <line x1="6" y1="-2" x2="6" y2="12" stroke="#ec4899" stroke-width="2.5"/>
          <circle cx="3" cy="18" r="1" fill="#000"/>
          <circle cx="6" cy="19" r="1" fill="#000"/>
          <circle cx="9" cy="18" r="1" fill="#000"/>
        </g>
      `;
    } else if (mouthItem === 'steak') {
      mouthItemSVG = `
        <g transform="translate(18, 30)">
          <rect x="2" y="-2" width="16" height="8" rx="3" fill="#ea580c" stroke="#b91c1c" stroke-width="1"/>
          <circle cx="6" cy="2" r="1.5" fill="#fca5a5"/>
          <line x1="-2" y1="2" x2="2" y2="2" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="18" y1="2" x2="22" y2="2" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
        </g>
      `;
    } else if (mouthItem === 'banana') {
      mouthItemSVG = `
        <g transform="translate(16, 28)">
          <path d="M 0 10 Q 10 16 20 8 Q 14 6 0 10" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
          <polygon points="20,8 24,6 22,10" fill="#fef08a"/>
        </g>
      `;
    } else if (mouthItem === 'eucalyptus_leaf') {
      mouthItemSVG = `
        <g transform="translate(18, 32)">
          <path d="M 0 4 Q 8 -2 16 2 Q 8 8 0 4" fill="#047857" stroke="#065f46" stroke-width="1"/>
          <line x1="0" y1="4" x2="16" y2="2" stroke="#065f46" stroke-width="1"/>
        </g>
      `;
    } else if (mouthItem === 'golden_feather') {
      mouthItemSVG = `
        <g transform="translate(16, 32)">
          <path d="M 0 2 Q 10 -6 20 0 Q 10 8 0 2" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
          <line x1="0" y1="2" x2="20" y2="0" stroke="#d97706" stroke-width="1"/>
        </g>
      `;
    }

    return `
      <svg class="sparky-character" viewBox="0 0 60 60" style="width: 100%; height: 100%;">
        <defs>
          <radialGradient id="sparkyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#a78bfa" stop-opacity="1"/>
            <stop offset="100%" stop-color="#6d28d9" stop-opacity="0.3"/>
          </radialGradient>
          <linearGradient id="rainbowHornGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ef4444"/>
            <stop offset="33%" stop-color="#3b82f6"/>
            <stop offset="66%" stop-color="#22c55e"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
        </defs>
        
        <circle cx="30" cy="30" r="24" fill="url(#sparkyGlow)"/>

        <!-- Back Item -->
        ${backItemSVG}

        <!-- Antenna -->
        ${skin === 'default' ? `
          <polygon points="30,4 33,10 27,10" fill="#f59e0b" />
          <line x1="30" y1="10" x2="30" y2="15" stroke="#f59e0b" stroke-width="2"/>
        ` : ''}

        <!-- Ears -->
        ${earSVG}

        <!-- Main Body -->
        <circle cx="30" cy="30" r="18" fill="${skinBodyColor}" stroke="${skinStrokeColor}" stroke-width="2"/>

        <!-- Eyes -->
        <g class="sparky-eyes ${eyeClass}">
          <circle cx="21" cy="22" r="4" fill="${skin === 'wyvern' ? '#ef4444' : '#fff'}"/>
          <circle class="pupil" cx="21" cy="22" r="2" fill="${skin === 'wyvern' ? '#fff' : '#000'}"/>
          <circle cx="39" cy="22" r="4" fill="${skin === 'wyvern' ? '#ef4444' : '#fff'}"/>
          <circle class="pupil" cx="39" cy="22" r="2" fill="${skin === 'wyvern' ? '#fff' : '#000'}"/>
        </g>

        <!-- Nose/Snout -->
        ${faceSVG}

        <!-- Mouth -->
        ${mouthSVG}

        <!-- Head Item -->
        ${headItemSVG}

        <!-- Mouth/Neck Item -->
        ${mouthItemSVG}

        <!-- Cheeks -->
        <circle cx="16" cy="27" r="2.5" fill="#ec4899" opacity="0.6"/>
        <circle cx="44" cy="27" r="2.5" fill="#ec4899" opacity="0.6"/>
      </svg>
    `;
  }

  // Get Reward Item drawing representation (as tiny icons)
  getRewardIconSVG(reward) {
    if (reward.type === 'skin') {
      let color = 'hsl(263, 85%, 65%)';
      let stroke = 'hsl(190, 95%, 48%)';
      let ears = '';
      if (reward.value === 'cat') { color = '#f59e0b'; stroke = '#d97706'; ears = '<polygon points="8,10 2,2 12,6" fill="#f59e0b"/><polygon points="16,10 22,2 12,6" fill="#f59e0b"/>'; }
      else if (reward.value === 'dog') { color = '#d97706'; stroke = '#b45309'; ears = '<path d="M 4 8 C 0 14 6 16 6 10 Z" fill="#b45309"/><path d="M 20 8 C 24 14 18 16 18 10 Z" fill="#b45309"/>'; }
      else if (reward.value === 'panda') { color = '#ffffff'; stroke = '#1e293b'; ears = '<circle cx="6" cy="6" r="4" fill="#1e293b"/><circle cx="18" cy="6" r="4" fill="#1e293b"/>'; }
      else if (reward.value === 'dragon') { color = '#10b981'; stroke = '#047857'; ears = '<path d="M 8 6 L 4 0 L 10 4 Z" fill="#fbbf24"/><path d="M 16 6 L 20 0 L 14 4 Z" fill="#fbbf24"/>'; }
      else if (reward.value === 'unicorn') { color = '#f5f3ff'; stroke = '#c084fc'; ears = '<polygon points="12,6 12,0 14,0" fill="#fbbf24"/>'; }
      else if (reward.value === 'phoenix') { color = '#f97316'; stroke = '#ea580c'; ears = '<polygon points="12,6 12,0 14,3" fill="#ef4444"/>'; }
      else if (reward.value === 'fox') { color = '#f97316'; stroke = '#c2410c'; ears = '<polygon points="8,10 2,2 12,6" fill="#f97316"/><polygon points="16,10 22,2 12,6" fill="#f97316"/>'; }
      else if (reward.value === 'lion') { color = '#fbbf24'; stroke = '#d97706'; ears = '<circle cx="12" cy="13" r="10" fill="#b45309"/>'; }
      else if (reward.value === 'monkey') { color = '#854d0e'; stroke = '#713f12'; ears = '<circle cx="5" cy="13" r="3.5" fill="#854d0e"/><circle cx="19" cy="13" r="3.5" fill="#854d0e"/>'; }
      else if (reward.value === 'koala') { color = '#94a3b8'; stroke = '#64748b'; ears = '<circle cx="5" cy="9" r="4.5" fill="#94a3b8"/><circle cx="19" cy="9" r="4.5" fill="#94a3b8"/>'; }
      else if (reward.value === 'pegasus') { color = '#f8fafc'; stroke = '#cbd5e1'; ears = '<polygon points="8,8 4,0 12,4" fill="#f8fafc"/>'; }
      else if (reward.value === 'griffin') { color = '#f59e0b'; stroke = '#d97706'; ears = '<polygon points="12,13 8,18 16,18" fill="#fbbf24"/>'; }
      else if (reward.value === 'wyvern') { color = '#475569'; stroke = '#1e293b'; ears = '<polygon points="8,8 2,2 12,6" fill="#ef4444"/>'; }
      else if (reward.value === 'alien') { color = '#22c55e'; stroke = '#15803d'; ears = '<line x1="8" y1="8" x2="4" y2="2" stroke="#15803d" stroke-width="1.5"/><circle cx="4" cy="2" r="1.5" fill="#22c55e"/><line x1="16" y1="8" x2="20" y2="2" stroke="#15803d" stroke-width="1.5"/><circle cx="20" cy="2" r="1.5" fill="#22c55e"/>'; }
      else if (reward.value === 'astronaut') { color = '#f1f5f9'; stroke = '#94a3b8'; ears = '<rect x="3" y="10" width="3" height="6" rx="1" fill="#cbd5e1"/><rect x="18" y="10" width="3" height="6" rx="1" fill="#cbd5e1"/>'; }
      else if (reward.value === 'cyborg') { color = '#cbd5e1'; stroke = '#475569'; ears = '<rect x="4" y="9" width="2" height="7" fill="#64748b"/><circle cx="5" cy="9" r="1.2" fill="#ef4444"/>'; }
      else if (reward.value === 'galaxy') { color = '#0f172a'; stroke = '#6366f1'; ears = '<circle cx="6" cy="9" r="3" fill="#a855f7"/><circle cx="18" cy="9" r="3" fill="#ec4899"/>'; }
      
      return `
        <svg viewBox="0 0 24 24" width="40" height="40">
          ${ears}
          <circle cx="12" cy="13" r="8" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
          <circle cx="9" cy="11" r="1.5" fill="${reward.value === 'wyvern' ? '#ef4444' : '#000'}"/>
          <circle cx="15" cy="11" r="1.5" fill="${reward.value === 'wyvern' ? '#ef4444' : '#000'}"/>
          <path d="M 10 14 Q 12 16 14 14" stroke="#000" stroke-width="1" fill="none"/>
        </svg>
      `;
    } else if (reward.type === 'head') {
      if (reward.value === 'fish_hat') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><ellipse cx="12" cy="12" rx="9" ry="6" fill="#3b82f6"/><polygon points="3,12 -1,8 -1,16" fill="#3b82f6"/><circle cx="17" cy="10" r="1.5" fill="#fff"/></svg>`;
      } else if (reward.value === 'bamboo_hat') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><polygon points="12,2 2,16 22,16" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/></svg>`;
      } else if (reward.value === 'rainbow_horn') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><polygon points="12,2 9,18 15,18" fill="violet" stroke="purple"/></svg>`;
      } else if (reward.value === 'flame_crown') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><path d="M 4 16 L 6 4 L 10 12 L 12 2 L 14 12 L 18 4 L 20 16 Z" fill="#ef4444" stroke="#ea580c"/></svg>`;
      } else if (reward.value === 'wizard_hat') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><polygon points="12,2 4,16 20,16" fill="#3b82f6"/><ellipse cx="12" cy="16" rx="9" ry="2" fill="#3b82f6"/></svg>`;
      } else if (reward.value === 'helmet') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><circle cx="12" cy="12" r="9" fill="rgba(6,182,212,0.15)" stroke="#22d3ee" stroke-width="1.5"/></svg>`;
      } else if (reward.value === 'galaxy_halo') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><ellipse cx="12" cy="6" rx="8" ry="2" fill="none" stroke="#a855f7" stroke-width="1.5"/><circle cx="5" cy="5" r="1" fill="#f472b6"/><circle cx="19" cy="7" r="1" fill="#38bdf8"/></svg>`;
      }
    } else if (reward.type === 'mouth') {
      if (reward.value === 'fish_bone') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><line x1="2" y1="12" x2="22" y2="12" stroke="#cbd5e1" stroke-width="2"/><line x1="7" y1="8" x2="7" y2="16" stroke="#cbd5e1"/><line x1="12" y1="6" x2="12" y2="18" stroke="#cbd5e1"/><line x1="17" y1="8" x2="17" y2="16" stroke="#cbd5e1"/></svg>`;
      } else if (reward.value === 'spiked_collar') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><rect x="4" y="10" width="16" height="4" rx="1" fill="#334155"/><polygon points="8,10 8,6 10,10" fill="#cbd5e1"/><polygon points="12,10 12,6 14,10" fill="#cbd5e1"/><polygon points="16,10 16,6 18,10" fill="#cbd5e1"/></svg>`;
      } else if (reward.value === 'bamboo_straw') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><line x1="4" y1="20" x2="20" y2="4" stroke="#22c55e" stroke-width="4" stroke-linecap="round"/></svg>`;
      } else if (reward.value === 'bubble_tea') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><rect x="6" y="6" width="12" height="16" rx="2" fill="#fbbf24" stroke="#d97706"/><line x1="12" y1="2" x2="12" y2="10" stroke="#ec4899" stroke-width="2"/><circle cx="9" cy="18" r="1" fill="#000"/><circle cx="12" cy="19" r="1" fill="#000"/><circle cx="15" cy="18" r="1" fill="#000"/></svg>`;
      } else if (reward.value === 'steak') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><rect x="4" y="8" width="16" height="8" rx="2" fill="#ea580c" stroke="#b91c1c"/></svg>`;
      } else if (reward.value === 'banana') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><path d="M 4 16 Q 12 20 20 12" stroke="#fbbf24" stroke-width="3" fill="none"/></svg>`;
      } else if (reward.value === 'eucalyptus_leaf') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><path d="M 4 12 Q 12 4 20 12 Q 12 20 4 12" fill="#047857" stroke="#065f46"/></svg>`;
      } else if (reward.value === 'golden_feather') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><path d="M 4 16 Q 12 8 20 12" stroke="#fbbf24" stroke-width="3" fill="none"/></svg>`;
      }
    } else if (reward.type === 'back') {
      if (reward.value === 'dragon_wings') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><path d="M 12 12 Q 2 2 4 18 Z" fill="#059669"/><path d="M 12 12 Q 22 2 20 18 Z" fill="#059669"/></svg>`;
      } else if (reward.value === 'phoenix_tail') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><path d="M 12 12 Q 2 4 6 22 Z" fill="#f97316"/><path d="M 12 12 Q 22 4 18 22 Z" fill="#f97316"/></svg>`;
      } else if (reward.value === 'cape') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><path d="M 6 8 L 2 22 L 12 18 L 22 22 L 18 8 Z" fill="#ef4444"/></svg>`;
      } else if (reward.value === 'pegasus_wings') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><path d="M 12 12 Q 2 2 4 18" stroke="#cbd5e1" stroke-width="2.5" fill="none"/><path d="M 12 12 Q 22 2 20 18" stroke="#cbd5e1" stroke-width="2.5" fill="none"/></svg>`;
      } else if (reward.value === 'wyvern_tail') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><path d="M 6 18 Q 12 22 18 14" stroke="#ef4444" stroke-width="3" fill="none"/></svg>`;
      } else if (reward.value === 'ufo') {
        return `<svg viewBox="0 0 24 24" width="40" height="40"><ellipse cx="12" cy="14" rx="8" ry="3.5" fill="#64748b" stroke="#334155"/><ellipse cx="12" cy="10" rx="4" ry="2.5" fill="#22d3ee"/></svg>`;
      } else if (reward.value === 'cyber_wings') {
        return `<svg viewBox="0 0 24 24" width="40" height="40" stroke="#ff00ff" stroke-width="1.5" fill="none"><line x1="8" y1="12" x2="2" y2="6"/><line x1="8" y1="12" x2="1" y2="12"/><line x1="16" y1="12" x2="22" y2="6"/><line x1="16" y1="12" x2="23" y2="12"/></svg>`;
      }
    }
    return '';
  }

  bindEvents() {
    // Tab filters click listeners
    this.container.querySelectorAll('.wardrobe-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Equip / Unequip button listeners
    this.container.querySelectorAll('.reward-equip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rewardId = btn.getAttribute('data-id');
        this.toggleEquip(rewardId);
      });
    });
  }

  toggleEquip(rewardId) {
    const reward = REWARDS.find(r => r.id === rewardId);
    if (!reward) return;

    const stats = adaptiveEngine.state.stats;
    const completedList = [...new Set([...(stats.mathLevelsCompletedList || []), ...(stats.scienceLevelsCompletedList || [])])];
    const totalLevelsSolved = completedList.length;
    if (totalLevelsSolved < reward.req) {
      alert(`Solve at least ${reward.req} puzzles to unlock this item!`);
      return;
    }

    const custom = adaptiveEngine.state.customSparky || { skin: 'default', headItem: null, mouthItem: null, backItem: null };

    if (reward.type === 'skin') {
      custom.skin = reward.value;
    } else if (reward.type === 'head') {
      custom.headItem = custom.headItem === reward.value ? null : reward.value;
    } else if (reward.type === 'mouth') {
      custom.mouthItem = custom.mouthItem === reward.value ? null : reward.value;
    } else if (reward.type === 'back') {
      custom.backItem = custom.backItem === reward.value ? null : reward.value;
    }

    adaptiveEngine.state.customSparky = custom;
    adaptiveEngine.saveState();
  }

  destroy() {
    window.removeEventListener('equiliprismStateChanged', this.boundStateChange);
  }

  render() {
    // Calculate total unique puzzles solved across all grade levels
    let totalLevelsSolved = 0;
    const completedPuzzles = adaptiveEngine.state.completedPuzzles || {};
    Object.keys(completedPuzzles).forEach(key => {
      const mathList = completedPuzzles[key].math || [];
      const sciList = completedPuzzles[key].science || [];
      const gradeSolved = [...new Set([...mathList, ...sciList])].length;
      totalLevelsSolved += gradeSolved;
    });

    // Filter rewards based on active tab
    const filteredRewards = REWARDS.filter(r => {
      if (this.activeTab === 'all') return true;
      return r.type === this.activeTab;
    });

    const custom = adaptiveEngine.state.customSparky || { skin: 'default', headItem: null, mouthItem: null, backItem: null };

    this.container.innerHTML = `
      <div class="wardrobe-container">
        <!-- Left: Large Sparky Avatar Preview -->
        <div class="glass-card wardrobe-preview-card">
          <h2>Sparky's Wardrobe</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Customize Sparky's skin and accessories! Solve puzzles in the Labs to unlock premium skins and accessories.
          </p>

          <div class="wardrobe-preview-mount">
            ${this.getSparkySVG()}
          </div>

          <div style="width: 100%;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.3rem;">
              <span>Total Puzzles Solved:</span>
              <span style="color: hsl(var(--accent-pink)); font-weight: 800;">${totalLevelsSolved}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); text-align: left; line-height: 1.4;">
              Solve puzzles in the **Balance Lab** or **Photon Lab** to build your knowledge. Customization is always 100% free.
            </div>
          </div>
        </div>

        <!-- Right: Equipable Items Catalog -->
        <div class="glass-card" style="padding: 2rem;">
          <!-- Category Tabs -->
          <div class="wardrobe-tabs">
            <button class="wardrobe-tab-btn ${this.activeTab === 'all' ? 'active' : ''}" data-tab="all">All</button>
            <button class="wardrobe-tab-btn ${this.activeTab === 'skin' ? 'active' : ''}" data-tab="skin">Skins</button>
            <button class="wardrobe-tab-btn ${this.activeTab === 'head' ? 'active' : ''}" data-tab="head">Hats / Horns</button>
            <button class="wardrobe-tab-btn ${this.activeTab === 'mouth' ? 'active' : ''}" data-tab="mouth">Drinks & Items</button>
            <button class="wardrobe-tab-btn ${this.activeTab === 'back' ? 'active' : ''}" data-tab="back">Wings & Capes</button>
          </div>

          <!-- Items Grid -->
          <div class="wardrobe-grid">
            ${filteredRewards.map(reward => {
              const isUnlocked = totalLevelsSolved >= reward.req;
              
              // Check if equipped
              let isEquipped = false;
              if (reward.type === 'skin') isEquipped = custom.skin === reward.value;
              else if (reward.type === 'head') isEquipped = custom.headItem === reward.value;
              else if (reward.type === 'mouth') isEquipped = custom.mouthItem === reward.value;
              else if (reward.type === 'back') isEquipped = custom.backItem === reward.value;

              return `
                <div class="reward-card ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}" style="${!isUnlocked ? 'opacity: 0.65;' : ''}">
                  <div class="reward-icon-wrapper" style="${!isUnlocked ? 'filter: grayscale(1) brightness(0.5);' : ''}">
                    ${this.getRewardIconSVG(reward)}
                  </div>

                  <div class="reward-name">${reward.name}</div>
                  <div class="reward-desc">${reward.desc || ''}</div>
                  
                  ${isUnlocked ? `
                    <div class="reward-status-lbl unlocked" style="color: hsl(var(--accent-green)); font-size: 0.78rem; font-weight: 700; margin-bottom: 0.6rem;">
                      Unlocked
                    </div>
                    <button class="reward-equip-btn puzzle-btn ${isEquipped ? 'secondary' : 'primary'}" data-id="${reward.id}">
                      ${isEquipped ? 'Equipped ✓' : 'Equip'}
                    </button>
                  ` : `
                    <div class="reward-status-lbl locked" style="color: hsl(var(--accent-pink)); font-size: 0.78rem; font-weight: 700; margin-bottom: 0.6rem;">
                      Locked (Lvl ${reward.req})
                    </div>
                    <button class="puzzle-btn secondary disabled" disabled style="width: 100%; justify-content: center; opacity: 0.5; cursor: not-allowed;">
                      Locked
                    </button>
                  `}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }
}
