/* --------------------------------------------------------------------------
   1. GAME STATE & EVENT DATABASE
   -------------------------------------------------------------------------- */
const state = {
  date: { year: 298, month: 1 },
  player: {
    name: "",
    age: 18,
    gender: "Male",
    region: "",
    origin: "",
    title: "Unlanded Wanderer",
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
  inbox: [], // Menyimpan pesan/event bergaya FM
  activeEvent: null, // Event yang sedang dibuka di modal
  jobs: [
    {
      id: "guard",
      title: "City Watch Officer",
      desc: "Patrol the urban districts and enforce sovereign law in the King's name.",
      req: { stat: "combat", val: 5 },
      income: 12,
      prestige: 1,
      statBoost: "combat"
    },
    {
      id: "scribe",
      title: "Estate Steward",
      desc: "Manage ledgers, tithes, and grain reserves for a Westerosi High Lord.",
      req: { stat: "stewardship", val: 5 },
      income: 18,
      prestige: 1,
      statBoost: "stewardship"
    },
    {
      id: "informant",
      title: "Spymaster's Whisperer",
      desc: "Infiltrate taverns and gather political secrets for the Master of Whisperers.",
      req: { stat: "intrigue", val: 6 },
      income: 15,
      prestige: 2,
      statBoost: "intrigue"
    },
    {
      id: "mercenary",
      title: "Free Company Captain",
      desc: "Lead armed escorts and sellswords along high-risk trade routes.",
      req: { stat: "combat", val: 8 },
      income: 25,
      prestige: 3,
      statBoost: "tactics"
    }
  ],
  provinces: [
    { id: 1, name: "Winterfell", owner: "House Stark (Lord Eddard)", tax: 20 },
    { id: 2, name: "Casterly Rock", owner: "House Lannister (Lord Tywin)", tax: 35 },
    { id: 3, name: "Riverrun", owner: "House Tully (Lord Hoster)", tax: 15 },
    { id: 4, name: "The Eyrie", owner: "House Arryn (Lord Jon)", tax: 12 },
    { id: 5, name: "Highgarden", owner: "House Tyrell (Lord Mace)", tax: 30 },
    { id: 6, name: "King's Landing", owner: "The Crown (King Robert Baratheon I)", tax: 40 },
    { id: 7, name: "Pentos (Essos)", owner: "Magister Illyrio Mopatis", tax: 0 }
  ]
};

/* Database Event Berdasarkan Pekerjaan & Era Baratheon/Essos */
const jobEvents = {
  guard: [
    {
      id: "g1",
      title: "Bribe Offered in Street Alley",
      type: "Job Event",
      sender: "Gold Cloak Patrol",
      desc: "A smuggler caught transporting illegal Lysene wine offers you 20 Gold pieces to look the other way.",
      choices: [
        { text: "Accept the bribe (+20 Gold, -2 Prestige)", effect: (p) => { p.gold += 20; p.prestige -= 2; return "You pocketed the gold and let the smuggler slip away."; } },
        { text: "Arrest him in King Robert's name (+3 Prestige, +1 Combat)", effect: (p) => { p.prestige += 3; p.stats.combat += 1; return "You dragged the smuggler to the dungeons. Your superiors noted your loyalty."; } }
      ]
    },
    {
      id: "g2",
      title: "Drunken Knight Brawling",
      type: "Job Event",
      sender: "Flea Bottom Watch post",
      desc: "A drunken hedge knight is threatening patrons in a local brothel, claiming he fought alongside King Robert at the Trident.",
      choices: [
        { text: "Challenge him to a duel (+1 Combat)", effect: (p) => { p.stats.combat += 1; return "You disarmed the drunken knight, earning respect from your men."; } },
        { text: "Buy him an ale to calm him down (-2 Gold, +1 Diplomacy)", effect: (p) => { p.gold -= 2; p.stats.diplomacy += 1; return "You de-escalated the situation without shedding blood."; } }
      ]
    }
  ],
  scribe: [
    {
      id: "s1",
      title: "Discrepancy in Grain Tax",
      type: "Job Event",
      sender: "High Lord's Ledger Office",
      desc: "While auditing the autumn harvest ledgers, you uncover cooked books by the local bailiff withholding 30 Gold.",
      choices: [
        { text: "Report the fraud to your Lord (+5 Prestige, +1 Stewardship)", effect: (p) => { p.prestige += 5; p.stats.stewardship += 1; return "The Lord rewarded your diligence and hanged the fraudulent bailiff."; } },
        { text: "Blackmail the bailiff for half the cut (+15 Gold, +1 Intrigue)", effect: (p) => { p.gold += 15; p.stats.intrigue += 1; return "The bailiff quietly transferred 15 Gold to your personal pouch."; } }
      ]
    }
  ],
  informant: [
    {
      id: "i1",
      title: "Whispers from Across the Narrow Sea",
      type: "Job Event",
      sender: "Varys's Little Birds",
      desc: "An Essos informant reports that Viserys Targaryen is seeking an alliance with a Dothraki Khal in Pentos.",
      choices: [
        { text: "Sell this report to the Small Council (+25 Gold, +2 Intrigue)", effect: (p) => { p.gold += 25; p.stats.intrigue += 1; return "Master Varys paid handsomely for the confirmation of Targaryen movements."; } },
        { text: "Keep the secret for future leverage (+3 Prestige, +1 Diplomacy)", effect: (p) => { p.prestige += 3; p.stats.diplomacy += 1; return "You filed the secret away. Information is power in the Great Game."; } }
      ]
    }
  ],
  mercenary: [
    {
      id: "m1",
      title: "Ambush on the Kingsroad",
      type: "Job Event",
      sender: "Scout Vanguard",
      desc: "Bandits have blocked a merchant caravan you were hired to escort through the Riverlands.",
      choices: [
        { text: "Charge directly with steel (+2 Combat, -2 Men-at-arms)", effect: (p) => { p.stats.combat += 2; p.men = Math.max(0, p.men - 2); return "You crushed the bandits, though a few of your men fell in battle."; } },
        { text: "Outflank them using tactical terrain (+2 Tactics)", effect: (p) => { p.stats.tactics += 2; return "Your flank maneuver routed the bandits without taking casualties."; } }
      ]
    }
  ]
};

/* World Events Timeline Era Baratheon & Targaryen */
const worldLoreEvents = [
  {
    triggerYear: 298,
    triggerMonth: 2,
    id: "w1",
    title: "NEWS: Targaryen Exile Alliance in Pentos",
    type: "World News",
    sender: "Merchant Galleon Captain",
    desc: "Rumors from Essos confirm that Viserys Targaryen, the 'Beggar King', and his sister Daenerys are guesting at Magister Illyrio Mopatis's estate in Pentos. A marriage alliance with Khal Drogo is rumored.",
    choices: [{ text: "Acknowledge Raven", effect: () => "You take note of the dragon siblings hiding in Essos." }]
  },
  {
    triggerYear: 298,
    triggerMonth: 5,
    id: "w2",
    title: "NEWS: Royal Progress to Winterfell",
    type: "World News",
    sender: "Crown Messenger",
    desc: "Following the sudden death of Hand of the King Jon Arryn, King Robert Baratheon I and half the court ride North to offer the position to Lord Eddard Stark.",
    choices: [{ text: "Acknowledge Raven", effect: () => "The tides of power in King's Landing are shifting." }]
  }
];

/* --------------------------------------------------------------------------
   2. UI CONTROLLER
   -------------------------------------------------------------------------- */
const ui = {
  switchTab(tabId, evt) {
    document.querySelectorAll('.tab-page').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
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
    
    const activeJob = state.jobs.find(j => j.id === state.player.currentJob);
    document.getElementById('res-job').innerText = activeJob ? activeJob.title : "Unemployed";

    // Update FM Inbox Counter
    const unreadCount = state.inbox.filter(msg => !msg.read).length;
    const badge = document.getElementById('inbox-badge');
    if (badge) {
      badge.innerText = unreadCount;
      badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
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
      let badgeClass = 'badge-mid';
      if (value < 5) badgeClass = 'badge-low';
      if (value >= 8) badgeClass = 'badge-high';

      const row = document.createElement('div');
      row.className = 'attr-row';
      row.innerHTML = `
        <span class="attr-name">${key}</span>
        <span class="attr-badge ${badgeClass}">${value}</span>
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
          <div class="job-name">${job.title}</div>
          <div class="job-desc">${job.desc}</div>
        </div>
        <div>
          <div class="job-perks">+${job.income} Gold/mo | +${job.prestige} Prestige | Trains ${job.statBoost.toUpperCase()}</div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
            Req: ${job.req.stat.toUpperCase()} ≥ ${job.req.val}
          </div>
        </div>
        <button class="v-btn" 
          onclick="game.selectJob('${job.id}')" 
          ${!isQualified || isCurrent ? 'disabled' : ''}>
          ${isCurrent ? 'Active Contract' : isQualified ? 'Sign Contract' : 'Locked'}
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
        <h4 style="color:var(--vic-gold-bright); font-family:var(--font-cinzel);">${p.name}</h4>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Ruler: ${p.owner}</div>
        <div style="font-size:0.75rem; color:var(--fm-green-accent); margin-top:4px;">Taxes: +${p.tax} Gold</div>
      `;
      grid.appendChild(card);
    });
  },

  renderInbox() {
    const container = document.getElementById('inbox-list');
    if (!container) return;
    container.innerHTML = '';

    if (state.inbox.length === 0) {
      container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:30px;">No dispatches or ravens in your inbox.</div>`;
      return;
    }

    state.inbox.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = `inbox-item ${item.read ? 'read' : 'unread'}`;
      el.onclick = () => game.openEventModal(index);
      el.innerHTML = `
        <div class="inbox-header">
          <span class="inbox-sender">${item.sender}</span>
          <span class="inbox-date">${item.date}</span>
        </div>
        <div class="inbox-title">${item.title}</div>
        <div class="inbox-type">${item.type}</div>
      `;
      container.appendChild(el);
    });
  },

  addLog(text) {
    const logBox = document.getElementById('event-log');
    if (!logBox) return;
    const entry = document.createElement('div');
    entry.className = 'log-item';
    entry.innerHTML = `
      <span class="log-date">[${state.date.year} AC, M${state.date.month}]</span> ${text}
    `;
    logBox.prepend(entry);
  }
};

/* --------------------------------------------------------------------------
   3. GAME ENGINE
   -------------------------------------------------------------------------- */
const game = {
  startGame(e) {
    e.preventDefault();

    state.player.name = document.getElementById('create-name').value;
    state.player.age = parseInt(document.getElementById('create-age').value);
    state.player.gender = document.getElementById('create-gender').value;
    state.player.region = document.getElementById('create-region').value;
    state.player.origin = document.getElementById('create-origin').value;

    let stats = { combat: 5, tactics: 5, stewardship: 5, intrigue: 5, diplomacy: 5 };

    if (state.player.origin === 'Bastard') {
      stats.intrigue += 3; stats.combat += 2; state.player.title = "Bastard Wanderer";
    } else if (state.player.origin === 'Hedge Knight') {
      stats.combat += 4; stats.tactics += 2; state.player.title = "Hedge Knight";
    } else if (state.player.origin === 'Mercenary') {
      stats.tactics += 3; stats.combat += 2; state.player.men = 5; state.player.title = "Mercenary Captain";
    }

    if (state.player.region === 'The Riverlands') stats.stewardship += 1;
    if (state.player.region === 'The North') stats.combat += 1;
    if (state.player.region === 'The Westerlands') state.player.gold += 20;
    if (state.player.region === 'Dorne') stats.intrigue += 1;
    if (state.player.region === 'The Reach') stats.diplomacy += 1;

    state.player.stats = stats;

    const modal = document.getElementById('creation-modal');
    modal.remove();

    document.getElementById('game-interface').classList.remove('hidden');

    // Initial Inbox Welcome
    state.inbox.push({
      id: "init",
      title: "Welcome to Westeros (298 AC)",
      sender: "Grand Maester's Dispatch",
      type: "Chronicle Start",
      date: `${state.date.year} AC, M${state.date.month}`,
      desc: `King Robert Baratheon sat on the Iron Throne in King's Landing. Across the Narrow Sea in Pentos, the exiled Targaryen siblings Dany and Viserys lie in hiding under Magister Illyrio's protection. Choose your contract wisely to rise in stature.`,
      choices: [{ text: "Begin Journey", effect: () => "Your story begins." }],
      read: false
    });

    ui.renderTopBar();
    ui.renderProfile();
    ui.renderJobs();
    ui.renderProvinces();
    ui.renderInbox();
    
    ui.addLog(`Welcome, ${state.player.name} of ${state.player.region}. Your chronicle begins.`);
  },

  selectJob(jobId) {
    const selectedJob = state.jobs.find(j => j.id === jobId);
    if (!selectedJob) return;

    state.player.currentJob = jobId;
    ui.renderTopBar();
    ui.renderJobs();
    ui.addLog(`Contract signed: You are now serving as a ${selectedJob.title}.`);
  },

  recruitMen(amount, cost) {
    if (state.player.gold < cost) {
      ui.addLog("Insufficient treasury to muster men-at-arms!");
      return;
    }
    state.player.gold -= cost;
    state.player.men += amount;
    ui.renderTopBar();
    ui.addLog(`Mustered ${amount} men-at-arms into your retinue.`);
  },

  triggerRandomJobEvent() {
    if (!state.player.currentJob) return;

    const availableEvents = jobEvents[state.player.currentJob];
    if (!availableEvents || availableEvents.length === 0) return;

    // 50% chance memicu event per turn
    if (Math.random() < 0.50) {
      const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
      
      state.inbox.unshift({
        ...randomEvent,
        date: `${state.date.year} AC, M${state.date.month}`,
        read: false
      });
      
      ui.addLog(`NEW DISPATCH: ${randomEvent.title}`);
    }
  },

  checkWorldLoreEvents() {
    worldLoreEvents.forEach(evt => {
      if (evt.triggerYear === state.date.year && evt.triggerMonth === state.date.month) {
        state.inbox.unshift({
          ...evt,
          date: `${state.date.year} AC, M${state.date.month}`,
          read: false
        });
        ui.addLog(`WORLD NEWS: ${evt.title}`);
      }
    });
  },

  openEventModal(index) {
    const evtData = state.inbox[index];
    if (!evtData) return;

    evtData.read = true;
    state.activeEvent = { ...evtData, index };

    document.getElementById('modal-event-sender').innerText = evtData.sender;
    document.getElementById('modal-event-title').innerText = evtData.title;
    document.getElementById('modal-event-desc').innerText = evtData.desc;

    const choicesBox = document.getElementById('modal-event-choices');
    choicesBox.innerHTML = '';

    evtData.choices.forEach((choice, cIdx) => {
      const btn = document.createElement('button');
      btn.className = 'v-btn choice-btn';
      btn.innerText = choice.text;
      btn.onclick = () => game.resolveEventChoice(cIdx);
      choicesBox.appendChild(btn);
    });

    document.getElementById('event-modal-overlay').classList.remove('hidden');
    ui.renderTopBar();
    ui.renderInbox();
  },

  resolveEventChoice(choiceIndex) {
    if (!state.activeEvent) return;

    const choice = state.activeEvent.choices[choiceIndex];
    if (choice && typeof choice.effect === 'function') {
      const resultText = choice.effect(state.player);
      ui.addLog(`[Decision] ${resultText}`);
    }

    // Hapus event dari inbox setelah selesai diputuskan
    state.inbox.splice(state.activeEvent.index, 1);
    state.activeEvent = null;

    document.getElementById('event-modal-overlay').classList.add('hidden');
    
    ui.renderTopBar();
    ui.renderProfile();
    ui.renderInbox();
  },

  nextTurn() {
    state.date.month += 1;
    if (state.date.month > 12) {
      state.date.month = 1;
      state.date.year += 1;
      state.player.age += 1;
    }

    let income = 0;
    let upkeep = Math.floor(state.player.men * 0.5);

    if (state.player.currentJob) {
      const activeJob = state.jobs.find(j => j.id === state.player.currentJob);
      if (activeJob) {
        income += activeJob.income;
        state.player.prestige += activeJob.prestige;

        if (Math.random() < 0.35 && state.player.stats[activeJob.statBoost] < 20) {
          state.player.stats[activeJob.statBoost] += 1;
          ui.addLog(`Active service increased your ${activeJob.statBoost.toUpperCase()} attribute!`);
        }
      }
    }

    const netGold = income - upkeep;
    state.player.gold += netGold;

    // Trigger Event Acak & Lore
    game.triggerRandomJobEvent();
    game.checkWorldLoreEvents();

    ui.renderTopBar();
    ui.renderProfile();
    ui.renderJobs();
    ui.renderInbox();
    ui.addLog(`Turn ended. Revenue: +${income} G, Upkeep: -${upkeep} G (Net: ${netGold >= 0 ? '+' : ''}${netGold} G).`);
  }
};
