/* --------------------------------------------------------------------------
   1. GAME STATE & DATABASE
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
    health: 100,
    maxHealth: 100,
    hunger: 0, // 0 = kenyang, 100 = kelaparan parah
    gold: 30,
    prestige: 0,
    men: 0,
    talentPoints: 0,
    currentJob: null,
    jobRankIndex: 0,
    jobExp: 0,
    stats: {
      combat: 5,
      tactics: 5,
      stewardship: 5,
      intrigue: 5,
      diplomacy: 5
    },
    inventory: {},
    unlockedTalents: []
  },
  research: {
    active: false,
    topic: null,
    progress: 0,
    totalMonths: 0
  },
  inbox: [],
  activeEvent: null,

  // RESEARCH OPTIONS
  researchTopics: [
    { id: "basic_tactics", name: "Ancient Warfare Scrolls", cost: 15, months: 3, points: 1, desc: "Study Valyrian military doctrines." },
    { id: "stewardship_ledgers", name: "Iron Bank Trade Accounting", cost: 35, months: 6, points: 2, desc: "Examine complex economic ledgers from Braavos." },
    { id: "whisper_networks", name: "Varys' Little Birds Secrets", cost: 80, months: 12, points: 4, desc: "Master intricate espionage tactics." }
  ],

  // TALENT TREE
  talents: [
    { id: "t1", name: "Toughness", cost: 1, desc: "+20 Max Health and reduces hunger gain.", req: null },
    { id: "t2", name: "Merchant's Eye", cost: 1, desc: "+10% Gold Income from all jobs.", req: null },
    { id: "t3", name: "Veteran Leadership", cost: 2, desc: "Reduces troop upkeep cost by 50%.", req: "t1" },
    { id: "t4", name: "Master Negotiator", cost: 2, desc: "Doubles Prestige gained from promotions.", req: "t2" }
  ],

  // SHOP DATABASE
  shopItems: [
    { id: "bread", name: "Salted Bread & Rations", cost: 5, desc: "Restores 30 Hunger.", type: "food", val: 30 },
    { id: "wine", name: "Arbor Gold Wine", cost: 12, desc: "Restores 50 Hunger & +1 Prestige.", type: "food_luxury", val: 50 },
    { id: "p医学", name: "Maester's Poultice", cost: 15, desc: "Restores 40 Health.", type: "heal", val: 40 },
    { id: "sword", name: "Castle-Forged Steel", cost: 50, desc: "Permanently adds +2 Combat.", type: "equip", stat: "combat", val: 2 }
  ],

  // JOBS WITH RANKS & PROGRESSION
  jobs: [
    {
      id: "guard",
      title: "City Watch",
      desc: "Patrol urban districts and enforce sovereign law.",
      req: { stat: "combat", val: 5 },
      statBoost: "combat",
      ranks: [
        { name: "Recruit Gold Cloak", income: 10, expReq: 100 },
        { name: "Patrol Officer", income: 18, expReq: 250 },
        { name: "District Captain", income: 32, expReq: 500 },
        { name: "Commander of the Watch", income: 60, expReq: 1000 }
      ]
    },
    {
      id: "scribe",
      title: "Estate Administration",
      desc: "Manage ledgers, tithes, and grain reserves for High Lords.",
      req: { stat: "stewardship", val: 5 },
      statBoost: "stewardship",
      ranks: [
        { name: "Junior Clerk", income: 15, expReq: 120 },
        { name: "High Steward", income: 28, expReq: 300 },
        { name: "Master of Coin Delegate", income: 50, expReq: 650 }
      ]
    },
    {
      id: "informant",
      title: "Shadow Network",
      desc: "Infiltrate taverns and gather political secrets.",
      req: { stat: "intrigue", val: 6 },
      statBoost: "intrigue",
      ranks: [
        { name: "Street Whisperer", income: 14, expReq: 110 },
        { name: "Eavesdropper Agent", income: 26, expReq: 280 },
        { name: "Spymaster's Chief Hand", income: 55, expReq: 600 }
      ]
    },
    {
      id: "mercenary",
      title: "Free Company",
      desc: "Lead armed escorts and sellswords across Westeros.",
      req: { stat: "combat", val: 8 },
      statBoost: "tactics",
      ranks: [
        { name: "Sellsword Vanguard", income: 20, expReq: 150 },
        { name: "Lieutenant Captain", income: 40, expReq: 350 },
        { name: "General of the Company", income: 80, expReq: 800 }
      ]
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

/* GAME OF THRONES EVENT DATABASE */
const jobEvents = {
  guard: [
    {
      id: "g1",
      title: "Bribe Offered in Flea Bottom",
      type: "Job Event",
      sender: "Gold Cloak Patrol",
      desc: "A smuggler caught transporting illegal Lysene wine offers 20 Gold pieces to look the other way.",
      choices: [
        { text: "Accept the bribe (+20 Gold, -2 Prestige)", effect: (p) => { p.gold += 20; p.prestige -= 2; return "You pocketed the gold and let the smuggler slip away."; } },
        { text: "Arrest him in King Robert's name (+3 Prestige, +15 Job EXP)", effect: (p) => { p.prestige += 3; game.addJobExp(15); return "You dragged the smuggler to the dungeons."; } }
      ]
    }
  ],
  scribe: [
    {
      id: "s1",
      title: "Discrepancy in Grain Tax",
      type: "Job Event",
      sender: "High Lord's Ledger Office",
      desc: "Auditing harvest ledgers reveals cooked books by the local bailiff withholding 30 Gold.",
      choices: [
        { text: "Report the fraud (+5 Prestige, +20 Job EXP)", effect: (p) => { p.prestige += 5; game.addJobExp(20); return "The Lord rewarded your diligence."; } },
        { text: "Blackmail the bailiff (+15 Gold)", effect: (p) => { p.gold += 15; return "The bailiff quietly transferred 15 Gold to your pouch."; } }
      ]
    }
  ],
  informant: [
    {
      id: "i1",
      title: "Whispers from Pentos",
      type: "Job Event",
      sender: "Varys's Little Birds",
      desc: "An Essos informant reports Viserys Targaryen seeks an alliance with a Dothraki Khal.",
      choices: [
        { text: "Sell report to Small Council (+25 Gold, +15 Job EXP)", effect: (p) => { p.gold += 25; game.addJobExp(15); return "Master Varys paid handsomely for the confirmation."; } },
        { text: "Keep the secret (+3 Prestige)", effect: (p) => { p.prestige += 3; return "Information is power in the Great Game."; } }
      ]
    }
  ],
  mercenary: [
    {
      id: "m1",
      title: "Ambush on the Kingsroad",
      type: "Job Event",
      sender: "Scout Vanguard",
      desc: "Bandits have blocked a merchant caravan you were hired to escort.",
      choices: [
        { text: "Charge directly (+2 Combat, -10 Health, +25 Job EXP)", effect: (p) => { p.stats.combat += 2; p.health = Math.max(0, p.health - 10); game.addJobExp(25); return "You crushed the bandits but suffered light wounds."; } },
        { text: "Outflank them (+2 Tactics, +15 Job EXP)", effect: (p) => { p.stats.tactics += 2; game.addJobExp(15); return "Your flank maneuver routed the bandits cleanly."; } }
      ]
    }
  ]
};

const worldLoreEvents = [
  {
    triggerYear: 298,
    triggerMonth: 2,
    id: "w1",
    title: "Targaryen Alliance in Pentos",
    type: "World Event",
    sender: "Merchant Galleon Raven",
    desc: "Daenerys Targaryen has been wed to Khal Drogo of the Dothraki in Pentos. Magister Illyrio gift three petrified dragon eggs.",
    choices: [{ text: "Acknowledge Raven", effect: () => "The dragon family gathers power across the Narrow Sea." }]
  },
  {
    triggerYear: 298,
    triggerMonth: 5,
    id: "w2",
    title: "Hand of the King Passes Away",
    type: "World Event",
    sender: "Grand Maester Pycelle",
    desc: "Lord Jon Arryn, Hand of the King, has suddenly died of a mysterious fever. King Robert rides North to Winterfell.",
    choices: [{ text: "Acknowledge Raven", effect: () => "Dark clouds gather over the realm." }]
  },
  {
    triggerYear: 298,
    triggerMonth: 10,
    id: "w3",
    title: "Execution of Eddard Stark",
    type: "World Event",
    sender: "King's Landing Town Crier",
    desc: "Lord Eddard Stark has been executed for treason at the Great Sept of Baelor by order of King Joffrey Baratheon! War is imminent!",
    choices: [{ text: "Prepare for War!", effect: (p) => { p.prestige += 5; return "Westeros plunges into the War of the Five Kings!"; } }]
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
    document.getElementById('res-health-val').innerText = `${state.player.health}/${state.player.maxHealth}`;
    document.getElementById('res-hunger-val').innerText = `${state.player.hunger}/100`;
    document.getElementById('res-gold').innerText = state.player.gold;
    document.getElementById('res-talent-pts').innerText = state.player.talentPoints;
    document.getElementById('res-men').innerText = state.player.men;
    document.getElementById('res-date').innerText = `${state.date.year} AC, M${state.date.month}`;

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

    // Update Progress Bars
    const healthPct = Math.max(0, Math.min(100, (state.player.health / state.player.maxHealth) * 100));
    const hungerPct = Math.max(0, Math.min(100, state.player.hunger));

    document.getElementById('bar-health').style.width = `${healthPct}%`;
    document.getElementById('bar-health-text').innerText = `${state.player.health} / ${state.player.maxHealth}`;
    
    document.getElementById('bar-hunger').style.width = `${hungerPct}%`;
    document.getElementById('bar-hunger-text').innerText = `${state.player.hunger} / 100`;

    // Render Stats
    const container = document.getElementById('attributes-list');
    container.innerHTML = '';
    for (const [key, value] of Object.entries(state.player.stats)) {
      let badgeClass = value < 5 ? 'badge-low' : value >= 8 ? 'badge-high' : 'badge-mid';
      const row = document.createElement('div');
      row.className = 'attr-row';
      row.innerHTML = `<span class="attr-name">${key}</span><span class="attr-badge ${badgeClass}">${value}</span>`;
      container.appendChild(row);
    }
  },

  renderJobs() {
    // Current Active Job Panel
    const activePanel = document.getElementById('active-job-details');
    const currentJobObj = state.jobs.find(j => j.id === state.player.currentJob);

    if (!currentJobObj) {
      activePanel.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">You are currently unemployed. Select a contract below to start earning gold and experience.</p>`;
    } else {
      const currentRank = currentJobObj.ranks[state.player.jobRankIndex];
      const nextRank = currentJobObj.ranks[state.player.jobRankIndex + 1];
      
      let progressPct = 100;
      let expText = "MAX RANK REACHED";

      if (nextRank) {
        progressPct = Math.min(100, (state.player.jobExp / currentRank.expReq) * 100);
        expText = `${state.player.jobExp} / ${currentRank.expReq} EXP`;
      }

      activePanel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <h3 style="color:var(--vic-gold-bright); font-family:var(--font-cinzel);">${currentJobObj.title} — ${currentRank.name}</h3>
            <div style="font-size:0.75rem; color:var(--fm-green-accent);">Monthly Pay: +${currentRank.income} Gold</div>
          </div>
        </div>
        <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:4px;">PROMOTION PROGRESS</div>
        <div class="progress-container" style="height:20px;">
          <div class="progress-bar bg-rank" style="width: ${progressPct}%;"></div>
          <span class="progress-text">${expText}</span>
        </div>
      `;
    }

    // Available Jobs List
    const container = document.getElementById('jobs-list');
    container.innerHTML = '';

    state.jobs.forEach(job => {
      const isQualified = state.player.stats[job.req.stat] >= job.req.val;
      const isCurrent = state.player.currentJob === job.id;
      const baseRank = job.ranks[0];

      const card = document.createElement('div');
      card.className = `job-card ${isCurrent ? 'active-job' : ''}`;
      card.innerHTML = `
        <div>
          <div class="job-name">${job.title}</div>
          <div class="job-desc">${job.desc}</div>
        </div>
        <div>
          <div class="job-perks">Entry Rank: ${baseRank.name} (+${baseRank.income} Gold/mo)</div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
            Req: ${job.req.stat.toUpperCase()} ≥ ${job.req.val}
          </div>
        </div>
        <button class="v-btn" onclick="game.selectJob('${job.id}')" ${!isQualified || isCurrent ? 'disabled' : ''}>
          ${isCurrent ? 'Current Contract' : isQualified ? 'Sign Contract' : 'Locked'}
        </button>
      `;
      container.appendChild(card);
    });
  },

  renderShop() {
    const container = document.getElementById('shop-list');
    container.innerHTML = '';

    state.shopItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'shop-card';
      card.innerHTML = `
        <div>
          <div class="item-name">${item.name}</div>
          <div class="item-desc">${item.desc}</div>
        </div>
        <div class="item-price">${item.cost} Gold</div>
        <button class="v-btn" onclick="game.buyItem('${item.id}')" ${state.player.gold < item.cost ? 'disabled' : ''}>
          Buy Item
        </button>
      `;
      container.appendChild(card);
    });
  },

  renderResearchAndTalents() {
    // Research Panel
    const rPanel = document.getElementById('research-panel');
    if (state.research.active) {
      const topic = state.researchTopics.find(t => t.id === state.research.topic);
      const pct = Math.min(100, (state.research.progress / state.research.totalMonths) * 100);
      rPanel.innerHTML = `
        <div style="font-size:0.85rem; color:var(--vic-gold-bright); margin-bottom:5px;">Currently Researching: ${topic.name}</div>
        <div class="progress-container" style="height:18px; margin-bottom:8px;">
          <div class="progress-bar bg-research" style="width:${pct}%;"></div>
          <span class="progress-text">${state.research.progress} / ${state.research.totalMonths} Months</span>
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted);">Completing will grant +${topic.points} Talent Points.</div>
      `;
    } else {
      let optionsHTML = state.researchTopics.map(t => `
        <div style="background:#0d0a08; border:1px solid var(--vic-mahogany-border); padding:10px; margin-bottom:8px; border-radius:3px;">
          <div style="font-size:0.85rem; color:var(--vic-gold-bright);">${t.name} (+${t.points} TP)</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${t.desc}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
            <span style="font-size:0.75rem; color:var(--fm-green-accent);">${t.cost} Gold | ${t.months} Months</span>
            <button class="v-btn" onclick="game.startResearch('${t.id}')" ${state.player.gold < t.cost ? 'disabled' : ''}>Start Research</button>
          </div>
        </div>
      `).join('');
      rPanel.innerHTML = optionsHTML;
    }

    // Talent Tree
    const tContainer = document.getElementById('talent-list');
    tContainer.innerHTML = '';

    state.talents.forEach(talent => {
      const isUnlocked = state.player.unlockedTalents.includes(talent.id);
      const reqMet = !talent.req || state.player.unlockedTalents.includes(talent.req);

      const card = document.createElement('div');
      card.className = `talent-card ${isUnlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <div>
          <div class="talent-name">${talent.name} ${isUnlocked ? '✓' : ''}</div>
          <div class="talent-desc">${talent.desc}</div>
        </div>
        <div class="talent-cost">${talent.cost} Talent Point(s)</div>
        <button class="v-btn" onclick="game.unlockTalent('${talent.id}')" ${isUnlocked || !reqMet || state.player.talentPoints < talent.cost ? 'disabled' : ''}>
          ${isUnlocked ? 'Unlocked' : !reqMet ? 'Req Locked' : 'Unlock Talent'}
        </button>
      `;
      tContainer.appendChild(card);
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
    entry.innerHTML = `<span class="log-date">[${state.date.year} AC, M${state.date.month}]</span> ${text}`;
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

    document.getElementById('creation-modal').remove();
    document.getElementById('game-interface').classList.remove('hidden');

    state.inbox.push({
      id: "init",
      title: "Welcome to Westeros (298 AC)",
      sender: "Grand Maester's Dispatch",
      type: "Chronicle Start",
      date: `${state.date.year} AC, M${state.date.month}`,
      desc: `King Robert Baratheon sits on the Iron Throne. Secure a position, maintain your health, research lost archives, and advance your noble house.`,
      choices: [{ text: "Begin Journey", effect: () => "Your chronicle begins." }],
      read: false
    });

    ui.renderTopBar();
    ui.renderProfile();
    ui.renderJobs();
    ui.renderShop();
    ui.renderResearchAndTalents();
    ui.renderProvinces();
    ui.renderInbox();

    ui.addLog(`Welcome, ${state.player.name} of ${state.player.region}.`);
  },

  selectJob(jobId) {
    const selectedJob = state.jobs.find(j => j.id === jobId);
    if (!selectedJob) return;

    state.player.currentJob = jobId;
    state.player.jobRankIndex = 0;
    state.player.jobExp = 0;

    ui.renderTopBar();
    ui.renderJobs();
    ui.addLog(`Contract signed: You are now serving in the ${selectedJob.title}.`);
  },

  addJobExp(amount) {
    if (!state.player.currentJob) return;
    const currentJobObj = state.jobs.find(j => j.id === state.player.currentJob);
    const currentRank = currentJobObj.ranks[state.player.jobRankIndex];

    state.player.jobExp += amount;

    if (currentRank && state.player.jobExp >= currentRank.expReq) {
      if (state.player.jobRankIndex < currentJobObj.ranks.length - 1) {
        state.player.jobRankIndex += 1;
        state.player.jobExp = 0;
        
        let prestigeBonus = state.player.unlockedTalents.includes("t4") ? 10 : 5;
        state.player.prestige += prestigeBonus;

        ui.addLog(`PROMOTION! You have been promoted to ${currentJobObj.ranks[state.player.jobRankIndex].name}! (+${prestigeBonus} Prestige)`);
      }
    }
  },

  buyItem(itemId) {
    const item = state.shopItems.find(i => i.id === itemId);
    if (!item || state.player.gold < item.cost) return;

    state.player.gold -= item.cost;

    if (item.type === "food") {
      state.player.hunger = Math.max(0, state.player.hunger - item.val);
      ui.addLog(`Consumed ${item.name}. Hunger reduced by ${item.val}.`);
    } else if (item.type === "food_luxury") {
      state.player.hunger = Math.max(0, state.player.hunger - item.val);
      state.player.prestige += 1;
      ui.addLog(`Enjoyed ${item.name}. Hunger reduced and gained +1 Prestige.`);
    } else if (item.type === "heal") {
      state.player.health = Math.min(state.player.maxHealth, state.player.health + item.val);
      ui.addLog(`Used ${item.name}. Health restored by ${item.val}.`);
    } else if (item.type === "equip") {
      state.player.stats[item.stat] += item.val;
      ui.addLog(`Equipped ${item.name}. Permanently gained +${item.val} ${item.stat.toUpperCase()}.`);
    }

    ui.renderTopBar();
    ui.renderProfile();
    ui.renderShop();
  },

  startResearch(topicId) {
    const topic = state.researchTopics.find(t => t.id === topicId);
    if (!topic || state.player.gold < topic.cost) return;

    state.player.gold -= topic.cost;
    state.research.active = true;
    state.research.topic = topicId;
    state.research.progress = 0;
    state.research.totalMonths = topic.months;

    ui.renderTopBar();
    ui.renderResearchAndTalents();
    ui.addLog(`Started research on ${topic.name}.`);
  },

  unlockTalent(talentId) {
    const talent = state.talents.find(t => t.id === talentId);
    if (!talent || state.player.talentPoints < talent.cost) return;

    state.player.talentPoints -= talent.cost;
    state.player.unlockedTalents.push(talentId);

    if (talentId === "t1") {
      state.player.maxHealth += 20;
      state.player.health += 20;
    }

    ui.renderTopBar();
    ui.renderProfile();
    ui.renderResearchAndTalents();
    ui.addLog(`Unlocked Talent: ${talent.name}!`);
  },

  recruitMen(amount, cost) {
    if (state.player.gold < cost) {
      ui.addLog("Insufficient gold to muster men-at-arms!");
      return;
    }
    state.player.gold -= cost;
    state.player.men += amount;
    ui.renderTopBar();
    ui.addLog(`Mustered ${amount} men-at-arms.`);
  },

  triggerRandomJobEvent() {
    if (!state.player.currentJob) return;
    const availableEvents = jobEvents[state.player.currentJob];
    if (!availableEvents || availableEvents.length === 0) return;

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
        ui.addLog(`WORLD EVENT: ${evt.title}`);
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

    state.inbox.splice(state.activeEvent.index, 1);
    state.activeEvent = null;

    document.getElementById('event-modal-overlay').classList.add('hidden');
    ui.renderTopBar();
    ui.renderProfile();
    ui.renderJobs();
    ui.renderInbox();
  },

  nextTurn() {
    // Advance Date
    state.date.month += 1;
    if (state.date.month > 12) {
      state.date.month = 1;
      state.date.year += 1;
      state.player.age += 1;
    }

    // 1. Hunger & Health Tick
    let hungerRate = state.player.unlockedTalents.includes("t1") ? 10 : 15;
    state.player.hunger = Math.min(100, state.player.hunger + hungerRate);

    if (state.player.hunger >= 100) {
      state.player.health = Math.max(0, state.player.health - 20);
      ui.addLog("WARNING: You are starving! Suffering -20 Health per month!");
    }

    if (state.player.health <= 0) {
      alert("Your character has succumbed to wounds and starvation. Game Over!");
      location.reload();
      return;
    }

    // 2. Economy & Job Progression
    let income = 0;
    let baseUpkeep = Math.floor(state.player.men * 0.5);
    let upkeep = state.player.unlockedTalents.includes("t3") ? Math.floor(baseUpkeep * 0.5) : baseUpkeep;

    if (state.player.currentJob) {
      const activeJob = state.jobs.find(j => j.id === state.player.currentJob);
      if (activeJob) {
        let currentRank = activeJob.ranks[state.player.jobRankIndex];
        let jobIncome = currentRank.income;

        if (state.player.unlockedTalents.includes("t2")) {
          jobIncome = Math.floor(jobIncome * 1.1);
        }

        income += jobIncome;
        game.addJobExp(20); // Base EXP per turn
      }
    }

    const netGold = income - upkeep;
    state.player.gold += netGold;

    // 3. Research Tick
    if (state.research.active) {
      state.research.progress += 1;
      if (state.research.progress >= state.research.totalMonths) {
        const topic = state.researchTopics.find(t => t.id === state.research.topic);
        state.player.talentPoints += topic.points;
        ui.addLog(`RESEARCH COMPLETE: Finished studying ${topic.name}! Gained +${topic.points} Talent Points.`);
        state.research.active = false;
        state.research.topic = null;
      }
    }

    // 4. Events
    game.triggerRandomJobEvent();
    game.checkWorldLoreEvents();

    // Render Refresh
    ui.renderTopBar();
    ui.renderProfile();
    ui.renderJobs();
    ui.renderShop();
    ui.renderResearchAndTalents();
    ui.renderInbox();

    ui.addLog(`Turn ended. Net Gold: ${netGold >= 0 ? '+' : ''}${netGold} G.`);
  }
};
