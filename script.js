/* --------------------------------------------------------------------------
   1. GAME STATE
   -------------------------------------------------------------------------- */
const state = {
  date: { year: 298, month: 1 },
  player: {
    name: "",
    age: 18,
    gender: "Male",
    region: "",
    origin: "",
    title: "Unlanded Nobody",
    gold: 30,
    prestige: 0,
    men: 0,
    currentJob: null,
    stats: {
      combat: 5,
      tactics: 5,
      stewardship: 5,
      intrigue: 5,
      diplomacy: 5
    }
  },
  jobs: [
    {
      id: "guard",
      title: "City Watch Guard",
      desc: "Patrol the streets and keep peace in the city.",
      req: { stat: "combat", val: 5 },
      income: 12,
      prestige: 1,
      statBoost: "combat"
    },
    {
      id: "scribe",
      title: "Merchant Scribe",
      desc: "Manage ledgers, taxes, and trade accounts for local lords.",
      req: { stat: "stewardship", val: 5 },
      income: 18,
      prestige: 1,
      statBoost: "stewardship"
    },
    {
      id: "informant",
      title: "Tavern Informant",
      desc: "Gather whispers and secrets for wealthy benefactors.",
      req: { stat: "intrigue", val: 6 },
      income: 15,
      prestige: 2,
      statBoost: "intrigue"
    },
    {
      id: "mercenary",
      title: "Sellsword Escort",
      desc: "Protect caravans from bandits along the Kingsroad.",
      req: { stat: "combat", val: 8 },
      income: 25,
      prestige: 3,
      statBoost: "tactics"
    }
  ],
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
    
    const activeJobObj = state.jobs.find(j => j.id === state.player.currentJob);
    document.getElementById('res-job').innerText = activeJobObj ? activeJobObj.title : "Unemployed";
  },

  renderProfile() {
    document.getElementById('char-name').innerText = state.player.name;
    document.getElementById('char-title').innerText = state.player.title;
    document.getElementById('char-age').innerText = state.player.age;
    document.getElementById('char-gender').innerText = state.player.gender;
    document.getElementById('char-region').innerText = state.player.region;
    document.getElementById('char-origin').innerText = state.player.origin;

    document.getElementById('char-avatar').innerText = state.player.gender === "Female" ? "🗡️" : "🛡️";

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

  renderJobs() {
    const container = document.getElementById('jobs-list');
    container.innerHTML = '';

    state.jobs.forEach(job => {
      const isQualified = state.player.stats[job.req.stat] >= job.req.val;
      const isCurrent = state.player.currentJob === job.id;

      const card = document.createElement('div');
      card.className = `job-card ${isCurrent ? 'active-job' : ''}`;
      card.innerHTML = `
        <div>
          <div class="job-title">${job.title}</div>
          <div class="job-desc">${job.desc}</div>
        </div>
        <div>
          <div class="job-rewards">+${job.income} Gold/mo | +${job.prestige} Prestige | Gains ${job.statBoost.toUpperCase()}</div>
          <div class="job-req">Requirement: ${job.req.stat.toUpperCase()} ≥ ${job.req.val}</div>
        </div>
        <button class="btn-action" 
          onclick="game.selectJob('${job.id}')" 
          ${!isQualified || isCurrent ? 'disabled' : ''}>
          ${isCurrent ? 'Current Job' : isQualified ? 'Apply Job' : 'Locked'}
        </button>
      `;
      container.appendChild(card);
    });
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
  startGame(e) {
    e.preventDefault();

    // 1. Read Inputs
    state.player.name = document.getElementById('create-name').value;
    state.player.age = parseInt(document.getElementById('create-age').value);
    state.player.gender = document.getElementById('create-gender').value;
    state.player.region = document.getElementById('create-region').value;
    state.player.origin = document.getElementById('create-origin').value;

    // 2. Base Stats Assignment
    let stats = { combat: 5, tactics: 5, stewardship: 5, intrigue: 5, diplomacy: 5 };

    // Apply Background Traits
    if (state.player.origin === 'Bastard') {
      stats.intrigue += 3; stats.combat += 2; state.player.title = "Bastard wanderer";
    } else if (state.player.origin === 'Hedge Knight') {
      stats.combat += 4; stats.tactics += 2; state.player.title = "Hedge Knight";
    } else if (state.player.origin === 'Mercenary') {
      stats.tactics += 3; stats.combat += 2; state.player.men = 5; state.player.title = "Mercenary Captain";
    }

    // Apply Region Bonuses
    if (state.player.region === 'The Riverlands') stats.stewardship += 1;
    if (state.player.region === 'The North') stats.combat += 1;
    if (state.player.region === 'The Westerlands') state.player.gold += 20;
    if (state.player.region === 'Dorne') stats.intrigue += 1;
    if (state.player.region === 'The Reach') stats.diplomacy += 1;

    state.player.stats = stats;

    // 3. Close Modal & Init Game UI
    document.getElementById('creation-modal').style.display = 'none';
    
    ui.renderTopBar();
    ui.renderProfile();
    ui.renderJobs();
    ui.renderProvinces();
    
    ui.addLog(`Welcome, ${state.player.name} of ${state.player.region}. Your journey in Westeros begins!`);
  },

  selectJob(jobId) {
    const selectedJob = state.jobs.find(j => j.id === jobId);
    if (!selectedJob) return;

    state.player.currentJob = jobId;
    ui.renderTopBar();
    ui.renderJobs();
    ui.addLog(`You have taken up employment as a ${selectedJob.title}.`);
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
      state.player.age += 1; // Age increases every year
    }

    // Calculate Job Earnings & Stat Boosts
    let income = 0;
    let upkeep = Math.floor(state.player.men * 0.5);

    if (state.player.currentJob) {
      const activeJob = state.jobs.find(j => j.id === state.player.currentJob);
      if (activeJob) {
        income += activeJob.income;
        state.player.prestige += activeJob.prestige;

        // Small chance to increase attribute on turn
        if (Math.random() < 0.3 && state.player.stats[activeJob.statBoost] < 20) {
          state.player.stats[activeJob.statBoost] += 1;
          ui.addLog(`Your experience as a ${activeJob.title} increased your ${activeJob.statBoost.toUpperCase()} stat!`);
        }
      }
    }

    const netGold = income - upkeep;
    state.player.gold += netGold;

    // Render Updates & Log
    ui.renderTopBar();
    ui.renderProfile();
    ui.renderJobs();
    ui.addLog(`Month ended. Earnings: +${income} Gold, Upkeep: -${upkeep} Gold. Net: ${netGold >= 0 ? '+' : ''}${netGold} Gold.`);
  }
};
