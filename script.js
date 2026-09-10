/* --------------------------------------------------------------------------
   1. GAME STATE
   -------------------------------------------------------------------------- */
const state = {
  date: { year: 298, month: 1 },
  player: {
    name: "Ser Jon Rivers",
    title: "Hedge Knight of the Riverlands",
    origin: "Bastard",
    gold: 50,
    prestige: 10,
    men: 15,
    stats: {
      combat: 8,
      tactics: 6,
      stewardship: 4,
      intrigue: 5,
      diplomacy: 3
    }
  },
  provinces: [
    { id: 1, name: "Winterfell", owner: "House Stark", tax: 20 },
    { id: 2, name: "Casterly Rock", owner: "House Lannister", tax: 35 },
    { id: 3, name: "Riverrun", owner: "House Tully", tax: 15 },
    { id: 4, name: "The Eyrie", owner: "House Arryn", tax: 12 },
    { id: 5, name: "Highgarden", owner: "House Tyrell", tax: 30 },
    { id: 6, name: "King's Landing", owner: "The Crown", tax: 40 }
  ]
};

/* --------------------------------------------------------------------------
   2. UI CONTROLLER
   -------------------------------------------------------------------------- */
const ui = {
  switchTab(tabId, evt) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    if (evt && evt.currentTarget) {
      evt.currentTarget.classList.add('active');
    }
  },

  renderTopBar() {
    document.getElementById('res-gold').innerText = state.player.gold;
    document.getElementById('res-prestige').innerText = state.player.prestige;
    document.getElementById('res-men').innerText = state.player.men;
    document.getElementById('res-date').innerText = `${state.date.year} AC, Month ${state.date.month}`;
  },

  renderProfile() {
    document.getElementById('char-name').innerText = state.player.name;
    document.getElementById('char-title').innerText = state.player.title;
    document.getElementById('char-origin').innerText = state.player.origin;

    const container = document.getElementById('attributes-list');
    container.innerHTML = '';

    for (const [key, value] of Object.entries(state.player.stats)) {
      let badgeClass = 'val-mid';
      if (value < 5) badgeClass = 'val-low';
      if (value >= 8) badgeClass = 'val-high';

      const row = document.createElement('div');
      row.className = 'stat-row';
      row.innerHTML = `
        <span class="stat-name">${key.toUpperCase()}</span>
        <span class="stat-badge ${badgeClass}">${value}</span>
      `;
      container.appendChild(row);
    }
  },

  renderProvinces() {
    const grid = document.getElementById('province-grid');
    grid.innerHTML = '';

    state.provinces.forEach(p => {
      const card = document.createElement('div');
      card.className = 'province-card';
      card.innerHTML = `
        <div>
          <h3 style="color: var(--gold-bright); font-family: var(--font-serif);">${p.name}</h3>
          <div class="province-owner">Ruler: ${p.owner}</div>
        </div>
        <div class="province-income">
          Monthly Income: +${p.tax} Gold
        </div>
      `;
      grid.appendChild(card);
    });
  },

  addLog(text) {
    const logBox = document.getElementById('event-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <span class="log-time">[${state.date.year} AC, M${state.date.month}]</span> 
      <span class="log-text">${text}</span>
    `;
    logBox.prepend(entry);
  }
};

/* --------------------------------------------------------------------------
   3. GAME LOGIC ENGINE
   -------------------------------------------------------------------------- */
const game = {
  init() {
    ui.renderTopBar();
    ui.renderProfile();
    ui.renderProvinces();
  },

  updateName(newName) {
    if (!newName) return;
    state.player.name = newName;
    ui.renderProfile();
    ui.addLog(`Changed name to ${newName}.`);
  },

  updateOrigin(newOrigin) {
    state.player.origin = newOrigin;
    
    // Adjust initial stats dynamically based on origin
    if (newOrigin === 'Bastard') {
      state.player.stats = { combat: 8, tactics: 6, stewardship: 4, intrigue: 6, diplomacy: 3 };
    } else if (newOrigin === 'Hedge Knight') {
      state.player.stats = { combat: 9, tactics: 7, stewardship: 3, intrigue: 2, diplomacy: 4 };
    } else if (newOrigin === 'Mercenary') {
      state.player.stats = { combat: 7, tactics: 8, stewardship: 5, intrigue: 4, diplomacy: 2 };
    }

    ui.renderProfile();
    ui.addLog(`Background changed to ${newOrigin}. Attributes recalculated.`);
  },

  recruitMen(amount, cost) {
    if (state.player.gold < cost) {
      ui.addLog("Not enough gold to recruit men!");
      return;
    }
    state.player.gold -= cost;
    state.player.men += amount;
    ui.renderTopBar();
    ui.addLog(`Recruited ${amount} men-at-arms for ${cost} Gold.`);
  },

  nextTurn() {
    // Advance Time
    state.date.month += 1;
    if (state.date.month > 12) {
      state.date.month = 1;
      state.date.year += 1;
    }

    // Calculate Monthly Income (Stewardship influences gold gain)
    const income = 5 + Math.floor(state.player.stats.stewardship * 1.5);
    const upkeep = Math.floor(state.player.men * 0.5);
    const netGold = income - upkeep;

    state.player.gold += netGold;

    // Render Updates & Log
    ui.renderTopBar();
    ui.addLog(`Turn ended. Gold income: +${income}, Retinue upkeep: -${upkeep}. Net: ${netGold > 0 ? '+' : ''}${netGold} Gold.`);
  }
};

// Initialize Game on Load
window.onload = () => game.init();
