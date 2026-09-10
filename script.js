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
    hunger: 0, // 0 = kenyang, 100 = kelaparan
    gold: 30,
    prestige: 0,
    reputation: 0,
    landHectares: 0,
    men: 0,
    talentPoints: 0,
    currentJob: null,
    activeNobleHouse: null,
    vassalHouseName: null, // Jika sudah diizinkan mendirikan House Baru
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
  landMarket: {
    pricePerHectare: 25,
    rentIncomePerHectare: 2
  },
  research: {
    active: false,
    topic: null,
    progress: 0,
    totalMonths: 0
  },
  inbox: [],
  activeEvent: null,

  // NOBLE HOUSES & QUEST LINES
  nobleHouses: [
    {
      id: "stark",
      name: "House Stark",
      region: "The North",
      sigil: "🐺 Direwolf",
      motto: "Winter is Coming",
      reqPrestige: 5,
      reqReputation: 10,
      titleOffer: "Sworn Shield of Winterfell",
      monthlyPay: 35,
      story: "Membantu Lord Eddard Stark menjaga kedamaian di Utara dan bertempur dalam perang menghadapi musim dingin."
    },
    {
      id: "lannister",
      name: "House Lannister",
      region: "The Westerlands",
      sigil: "🦁 Lion",
      motto: "Hear Me Roar!",
      reqPrestige: 8,
      reqReputation: -5,
      titleOffer: "Lannister Household Captain",
      monthlyPay: 60,
      story: "Mengabdi pada House Lannister dalam mengamankan tambang emas Casterly Rock dan membiayai pundi-pundi kerajaan."
    },
    {
      id: "velaryon",
      name: "House Velaryon",
      region: "The Crownlands",
      sigil: "🐉 Sea Seahorse",
      motto: "The Old, the True, the Brave",
      reqPrestige: 6,
      reqReputation: 5,
      titleOffer: "High Tide Fleet Warden",
      monthlyPay: 40,
      story: "Memimpin armada kapal laut Driftmark dan mengamankan jalur perdagangan Gullet dari bajak laut Essos."
    },
    {
      id: "baratheon",
      name: "House Baratheon",
      region: "The Crownlands",
      sigil: "👑 Crowned Stag",
      motto: "Ours is the Fury",
      reqPrestige: 10,
      reqReputation: 15,
      titleOffer: "Royal Knight of the Realm",
      monthlyPay: 55,
      story: "Melayani House Baratheon dalam turnamen kerajaan dan mengamankan kekuasaan King's Landing."
    },
    {
      id: "martell",
      name: "House Martell",
      region: "Dorne",
      sigil: "☀️ Red Sun and Spear",
      motto: "Unbowed, Unbroken, Unbent",
      reqPrestige: 7,
      reqReputation: 5,
      titleOffer: "Sunspear Shadow Guard",
      monthlyPay: 45,
      story: "Membantu Prince Doran Martell dalam intrik politik rahasia membalaskan dendam kematian Elia Martell."
    },
    {
      id: "tyrell",
      name: "House Tyrell",
      region: "The Reach",
      sigil: "🌹 Golden Rose",
      motto: "Growing Strong",
      reqPrestige: 6,
      reqReputation: 8,
      titleOffer: "Highgarden Grain Marshal",
      monthlyPay: 50,
      story: "Mengelola suplai pangan dan aliansi politik House Tyrell dengan kekuatan kekayaan panen Highgarden."
    }
  ],

  researchTopics: [
    { id: "basic_tactics", name: "Manuskrip Perang Valyria", cost: 15, months: 3, points: 1, desc: "Mempelajari doktrin taktik militer kuno." },
    { id: "stewardship_ledgers", name: "Akuntansi Perdagangan Iron Bank", cost: 35, months: 6, points: 2, desc: "Membedah sistem keuangan dan pengelolaan tanah dari Braavos." },
    { id: "whisper_networks", name: "Jaringan Burung Kecil Varys", cost: 80, months: 12, points: 4, desc: "Menguasai taktik intrik dan mata-mata tingkat tinggi." }
  ],

  talents: [
    { id: "t1", name: "Ketahanan Fisik", cost: 1, desc: "+20 Max Health dan mengurangi laju kelaparan.", req: null },
    { id: "t3", name: "Kepemimpinan Veteran", cost: 2, desc: "Mengecilkan biaya perawatan prajurit sebesar 50%.", req: "t1" },
    { id: "t2", name: "Mata Saudagar", cost: 1, desc: "+15% Emas dari semua pekerjaan dan sewa tanah.", req: null },
    { id: "t4", name: "Negosiator Ulung", cost: 2, desc: "Melipatgandakan Prestige dari promosi atau misi.", req: "t2" },
    { id: "t5", name: "Telinga Dinding", cost: 1, desc: "+2 Intrigue dan meningkatkan peluang event rahasia.", req: null },
    { id: "t6", name: "Diplomasi Istana", cost: 2, desc: "+2 Diplomacy dan menurunkan syarat Prestige House Noble sebesar 2 Pt.", req: "t5" }
  ],

  shopItems: [
    { id: "bread", name: "Roti Garam & Ransum", cost: 5, desc: "Memulihkan 30 Hunger.", type: "food", val: 30 },
    { id: "wine", name: "Anggur Emas Arbor", cost: 12, desc: "Memulihkan 50 Hunger & +1 Prestige.", type: "food_luxury", val: 50 },
    { id: "medicine", name: "Ramuan Maester", cost: 15, desc: "Memulihkan 40 Health.", type: "heal", val: 40 },
    { id: "iron_sword", name: "Pedang Besi Tempa", cost: 30, desc: "Menambah +1 Combat permanen.", type: "equip", stat: "combat", val: 1 },
    { id: "castle_sword", name: "Castle-Forged Steel Sword", cost: 75, desc: "Menambah +3 Combat permanen.", type: "equip", stat: "combat", val: 3 },
    { id: "valyrian_sword", name: "Replika Pedang Valyrian", cost: 200, desc: "Menambah +5 Combat & +2 Prestige.", type: "equip_legendary", stat: "combat", val: 5, bonusPrestige: 2 },
    { id: "padded_tunic", name: "Tunik Kain Tebal Padded", cost: 20, desc: "Armor kain dasar. Menambah +1 Tactics.", type: "equip", stat: "tactics", val: 1 },
    { id: "silk_robe", name: "Jubah Sutra Highgarden", cost: 60, desc: "Armor kain mewah. Menambah +2 Diplomacy & +1 Prestige.", type: "equip_legendary", stat: "diplomacy", val: 2, bonusPrestige: 1 },
    { id: "chainmail", name: "Baju Zirah Rantai (Chainmail)", cost: 50, desc: "Armor besi sedang. Menambah +2 Combat & +10 Max Health.", type: "equip_health", stat: "combat", val: 2, bonusHealth: 10 },
    { id: "plate_armor", name: "Armor Pelat Besi Utuh (Full Plate)", cost: 150, desc: "Armor besi berat. Menambah +4 Combat, +2 Tactics, & +20 Max Health.", type: "equip_heavy", stat: "combat", val: 4, bonusTactics: 2, bonusHealth: 20 }
  ],

  // JOBS DATABASE (Termasuk Job Khusus Mengabdi sebagai Ksatria)
  jobs: [
    {
      id: "knight_vassal",
      title: "Ksatria Setia Lord (Sworn Knight)",
      desc: "Karier khusus pengabdian militer & proteksi langsung kepada Lord Agung Anda.",
      req: { stat: "combat", val: 0 },
      statBoost: "combat",
      ranks: [
        { name: "Ksatria Sumpah Muda", income: 35, expReq: 100 },
        { name: "Komandan Pelindung Lord", income: 55, expReq: 250 },
        { name: "Garnisun Utama & Master of Arms", income: 85, expReq: 500 },
        { name: "High Marshal of the Realm", income: 130, expReq: 1000 }
      ]
    },
    {
      id: "guard",
      title: "City Watch (Gold Cloaks)",
      desc: "Menjaga keamanan distrik kota dan menegakkan hukum.",
      req: { stat: "combat", val: 5 },
      statBoost: "combat",
      ranks: [
        { name: "Prajurit Rekrutan", income: 10, expReq: 100 },
        { name: "Patrol Officer", income: 18, expReq: 250 },
        { name: "Kapten Distrik", income: 32, expReq: 500 },
        { name: "Komandan City Watch", income: 60, expReq: 1000 }
      ]
    },
    {
      id: "blacksmith",
      title: "Pandai Besi Kastil",
      desc: "Menempa pedang dan baju zirah untuk kebutuhan garnisun perang.",
      req: { stat: "combat", val: 4 },
      statBoost: "combat",
      ranks: [
        { name: "Magang Pandai Besi", income: 12, expReq: 100 },
        { name: "Penempa Besi Utul", income: 22, expReq: 250 },
        { name: "Master Blacksmith Kastil", income: 45, expReq: 500 }
      ]
    },
    {
      id: "scribe",
      title: "Administrasi Kastil",
      desc: "Mengelola pembukuan, pajak, dan cadangan gandum High Lord.",
      req: { stat: "stewardship", val: 5 },
      statBoost: "stewardship",
      ranks: [
        { name: "Clerk Muda", income: 15, expReq: 120 },
        { name: "High Steward", income: 28, expReq: 300 },
        { name: "Utusan Master of Coin", income: 50, expReq: 650 }
      ]
    },
    {
      id: "informant",
      title: "Jaringan Bayangan",
      desc: "Menyusup ke kedai dan mengumpulkan rahasia politik.",
      req: { stat: "intrigue", val: 6 },
      statBoost: "intrigue",
      ranks: [
        { name: "Informan Jalanan", income: 14, expReq: 110 },
        { name: "Agen Mata-Mata", income: 26, expReq: 280 },
        { name: "Tangan Kanan Spymaster", income: 55, expReq: 600 }
      ]
    },
    {
      id: "mercenary",
      title: "Tentara Bayaran (Free Company)",
      desc: "Memimpin pengawalan bersenjata di seluruh Westeros.",
      req: { stat: "combat", val: 8 },
      statBoost: "tactics",
      ranks: [
        { name: "Prajurit Sellsword", income: 20, expReq: 150 },
        { name: "Letnan Kapten", income: 40, expReq: 350 },
        { name: "Jenderal Pasukan Bayaran", income: 80, expReq: 800 }
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
    { id: 7, name: "Sunspear", owner: "House Martell (Prince Doran)", tax: 22 },
    { id: 8, name: "Driftmark", owner: "House Velaryon (Lord Monford)", tax: 25 }
  ]
};

/* --------------------------------------------------------------------------
   EVENT DATABASE PEKERJAAN & LORE GOT
   -------------------------------------------------------------------------- */
const jobEvents = {
  guard: [
    {
      id: "g1",
      title: "Sogokan di Flea Bottom",
      type: "Event Pekerjaan",
      sender: "Patroli City Watch",
      desc: "Seorang penyelundup anggur Lysene menawarkan 20 Gold agar Anda pura-pura tidak melihat barang ilegalnya.",
      choices: [
        { text: "Terima sogokan (+20 Gold, -2 Prestige, -5 Reputasi)", effect: (p) => { p.gold += 20; p.prestige -= 2; p.reputation -= 5; return "Anda mengantongi emas dan membiarkan penyelundup lolos."; } },
        { text: "Tangkap atas nama Raja (+3 Prestige, +5 Reputasi, +15 EXP)", effect: (p) => { p.prestige += 3; p.reputation += 5; game.addJobExp(15); return "Penyelundup diseret ke penjara ibukota."; } }
      ]
    }
  ],
  blacksmith: [
    {
      id: "bm1",
      title: "Besi Pedang Bangsawan",
      type: "Event Pekerjaan",
      sender: "Garnisun Bengkel",
      desc: "Seorang ksatria menuntut pedangnya ditempa ulang secara terburu-buru dan memberi tekanan pada Anda.",
      choices: [
        { text: "Kerjakan dengan teliti (+1 Combat, +20 EXP)", effect: (p) => { p.stats.combat += 1; game.addJobExp(20); return "Pedang buatan Anda dipuji sangat tajam!"; } },
        { text: "Pinta biaya kerja cepat (+15 Gold)", effect: (p) => { p.gold += 15; return "Ksatria membayar mahal walau sedikit bersungut-sungut."; } }
      ]
    }
  ],
  scribe: [
    {
      id: "s1",
      title: "Kecurangan Pajak Gandum",
      type: "Event Pekerjaan",
      sender: "Kantor Audit High Lord",
      desc: "Audit pembukuan panen menemukan manipulasi laporan oleh juru tulis lokal yang menyembunyikan 30 Gold.",
      choices: [
        { text: "Laporkan kecurangan (+5 Prestige, +5 Reputasi, +20 EXP)", effect: (p) => { p.prestige += 5; p.reputation += 5; game.addJobExp(20); return "Lord memberi Anda penghargaan atas kejujuran."; } },
        { text: "Peras juru tulis tersebut (+15 Gold)", effect: (p) => { p.gold += 15; return "Juru tulis menyerahkan 15 Gold secara diam-diam."; } }
      ]
    }
  ],
  knight_vassal: [
    {
      id: "kv1",
      title: "Insiden Bandit di Desa Lord",
      type: "Event Ksatria",
      sender: "Utusan Desa Lord",
      desc: "Kelompok penjarah menyerang batas tanah milik Lord Anda. Sebagai ksatria sworn, Anda diminta memimpin pasukan penumpasan.",
      choices: [
        { text: "Pimpin serangan depan (+10 Prestige, +30 EXP, -10 Health)", effect: (p) => { p.prestige += 10; game.addJobExp(30); p.health = Math.max(1, p.health - 10); return "Anda menang dalam duel pimpinan bandit!"; } },
        { text: "Gunakan taktik penyergapan (+15 EXP, +2 Tactics)", effect: (p) => { game.addJobExp(15); p.stats.tactics += 2; return "Musuh terkepung tanpa perlawanan berarti."; } }
      ]
    }
  ]
};

// GOT TIMELINE DENGAN BATTLE OF NIGHT KING & FINAL WAR
const worldLoreEvents = [
  {
    triggerYear: 298, triggerMonth: 2, id: "w1", title: "Pernikahan Targaryen di Pentos", type: "Berita Dunia GOT",
    sender: "Utusan Kapal Dagang",
    desc: "Daenerys Targaryen dinikahkan dengan Khal Drogo di Pentos. Hadiah tiga telur naga diberikan.",
    choices: [{ text: "Pahami Pesan", effect: () => "Kekuatan kuno naga mulai tercium." }]
  },
  {
    triggerYear: 298, triggerMonth: 5, id: "w2", title: "Wafatnya Hand of the King", type: "Berita Dunia GOT",
    sender: "Merpati Grand Maester",
    desc: "Lord Jon Arryn meninggal secara misterius. King Robert Baratheon bergerak ke Utara.",
    choices: [{ text: "Pahami Pesan", effect: () => "Takdir Westeros mulai bergetar." }]
  },
  {
    triggerYear: 298, triggerMonth: 10, id: "w3", title: "Eksekusi Lord Eddard Stark", type: "Berita Dunia GOT",
    sender: "Pengumuman King's Landing",
    desc: "Eddard Stark dihukum mati atas tuduhan pengkhianatan! Perang Lima Raja (War of the Five Kings) pecah!",
    choices: [{ text: "Bersiap untuk Perang!", effect: (p) => { p.prestige += 5; return "Seluruh Westeros membara!"; } }]
  },
  {
    triggerYear: 299, triggerMonth: 4, id: "w4", title: "Pertempuran Blackwater Bay", type: "Berita Dunia GOT",
    sender: "Pengintai Armada",
    desc: "Armada Stannis Baratheon dihancurkan oleh api Wildfire Lannister di King's Landing.",
    choices: [{ text: "Cermati Taktik Perang", effect: (p) => { p.stats.tactics += 1; return "Taktik Wildfire mengejutkan dunia."; } }]
  },
  {
    triggerYear: 300, triggerMonth: 3, id: "w5", title: "Tragedi Red Wedding", type: "Berita Dunia GOT",
    sender: "Merpati Utusan Frey",
    desc: "Robb Stark dan pasukannya dibantai dalam pesta pernikahan di The Twins! House Stark runtuh sementara.",
    choices: [{ text: "Berduka / Terkejut", effect: () => "Pengkhianatan paling berdarah dalam sejarah Westeros." }]
  },
  {
    triggerYear: 303, triggerMonth: 8, id: "w6", title: "Battle of the Bastards", type: "Berita Dunia GOT",
    sender: "Ksatria Utara",
    desc: "Jon Snow dan Sansa Stark merebut kembali Winterfell dari pimpinan kejam Ramsay Bolton!",
    choices: [{ text: "Puji Kemenangan Utara", effect: (p) => { p.prestige += 5; return "Panji Wolf kembali berkibar di Winterfell!"; } }]
  },
  // PERANG LAWAN NIGHT KING
  {
    triggerYear: 305, triggerMonth: 3, id: "w7", title: "PERANG BATTLE OF WINTERFELL (NIGHT KING)", type: "PERANG BESAR WESTEROS",
    sender: "Sinyal Bahaya The Wall",
    desc: "Night King dan Armada Undead / White Walkers menembus The Wall! Perang bertahan hidup seluruh manusia meletus di Winterfell!",
    choices: [
      { text: "Kirim Pasukan Bantuan (+15 Prestige, -15 Health, +3 Combat)", effect: (p) => { p.prestige += 15; p.health = Math.max(5, p.health - 15); p.stats.combat += 3; return "Anda bertempur di garis depan Winterfell melawan kegelapan melampaui tembok!"; } },
      { text: "Bertahan di Benteng Sendiri (+5 Prestige)", effect: (p) => { p.prestige += 5; return "Anda mengirim pasokan cadangan dan bertahan."; } }
    ]
  },
  // PERANG AKHIR KING'S LANDING
  {
    triggerYear: 305, triggerMonth: 5, id: "w8", title: "PERANG AKHIR: THE BATTLE OF KING'S LANDING", type: "PERANG AKHIR TAHTA",
    sender: "Terompet Perang Terakhir",
    desc: "Daenerys Targaryen menyerang King's Landing dengan Naga Drogon untuk menggulingkan Cersei Lannister! Api naga membakar kota!",
    choices: [
      { text: "Uji Nasib di Tengah Perang (+25 Prestige, +100 Gold)", effect: (p) => { p.prestige += 25; p.gold += 100; return "Anda memimpin pasukan dalam penentuan takhta Iron Throne!"; } },
      { text: "Amankan Kekuasaan Lokal (+10 Prestige)", effect: (p) => { p.prestige += 10; return "Anda mengonsolidasikan kekuasaan wilayah sendiri."; } }
    ]
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
    document.getElementById('res-prestige').innerText = state.player.prestige;
    document.getElementById('res-reputation').innerText = state.player.reputation;
    document.getElementById('res-land').innerText = `${state.player.landHectares} Ha`;
    document.getElementById('res-talent-pts').innerText = state.player.talentPoints;
    document.getElementById('res-date').innerText = `${state.date.year} AC, M${state.date.month}`;

    const unreadCount = state.inbox.filter(msg => !msg.read).length;
    const badge = document.getElementById('inbox-badge');
    if (badge) {
      badge.innerText = unreadCount;
      badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
  },

  renderProfile() {
    document.getElementById('char-name').innerText = state.player.vassalHouseName ? `${state.player.name} of House ${state.player.vassalHouseName}` : state.player.name;
    document.getElementById('char-title').innerText = state.player.title;
    document.getElementById('char-age').innerText = state.player.age;
    document.getElementById('char-gender').innerText = state.player.gender;
    document.getElementById('char-region').innerText = state.player.region;
    document.getElementById('char-origin').innerText = state.player.origin;
    document.getElementById('char-prestige-rep').innerText = `${state.player.prestige} / ${state.player.reputation}`;
    document.getElementById('char-avatar').innerText = state.player.gender === "Female" ? "🗡️" : "🛡️";

    const healthPct = Math.max(0, Math.min(100, (state.player.health / state.player.maxHealth) * 100));
    const hungerPct = Math.max(0, Math.min(100, state.player.hunger));

    document.getElementById('bar-health').style.width = `${healthPct}%`;
    document.getElementById('bar-health-text').innerText = `${state.player.health} / ${state.player.maxHealth}`;
    
    document.getElementById('bar-hunger').style.width = `${hungerPct}%`;
    document.getElementById('bar-hunger-text').innerText = `${state.player.hunger} / 100`;

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

  renderNobleOffers() {
    const container = document.getElementById('noble-offers-list');
    container.innerHTML = '';

    state.nobleHouses.forEach(house => {
      let reqPrestigeAdj = house.reqPrestige;
      if (state.player.unlockedTalents.includes("t6")) reqPrestigeAdj -= 2;
      if (state.player.region === house.region) reqPrestigeAdj -= 1;

      const meetsPrestige = state.player.prestige >= reqPrestigeAdj;
      const meetsRep = state.player.reputation >= house.reqReputation;
      const isEligible = meetsPrestige && meetsRep;
      const isServing = state.player.activeNobleHouse === house.id;

      const card = document.createElement('div');
      card.className = `job-card ${isServing ? 'active-job' : ''}`;
      card.innerHTML = `
        <div>
          <div class="job-name">${house.sigil} ${house.name} (${house.region})</div>
          <div style="font-size:0.75rem; color:var(--vic-gold-mid); font-style:italic; margin-bottom:4px;">"${house.motto}"</div>
          <div class="job-desc">${house.story}</div>
        </div>
        <div>
          <div class="job-perks">Gelar Ksatria: ${house.titleOffer} (+${house.monthlyPay} Gold/bln)</div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
            Syarat: Prestige ≥ ${reqPrestigeAdj} | Reputasi ≥ ${house.reqReputation}
          </div>
        </div>
        <button class="v-btn" onclick="game.acceptNobleOffer('${house.id}')" ${!isEligible || isServing ? 'disabled' : ''}>
          ${isServing ? 'Mengabdi Sebagai Ksatria Sworn' : isEligible ? 'Sumpah Setia & Jadi Ksatria' : 'Syarat Belum Terpenuhi'}
        </button>
      `;
      container.appendChild(card);
    });
  },

  renderVassalHousePanel() {
    const container = document.getElementById('vassal-house-panel');
    if (!container) return;

    if (!state.player.activeNobleHouse) {
      container.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">Anda harus mengabdi terlebih dahulu kepada salah satu Lord/House Agung sebelum bisa meminta izin mendirikan House Bawahan.</p>`;
      return;
    }

    const house = state.nobleHouses.find(h => h.id === state.player.activeNobleHouse);

    if (state.player.vassalHouseName) {
      container.innerHTML = `
        <div style="background:#0d0a08; border:1px solid var(--vic-gold-mid); padding:15px; border-radius:3px;">
          <h3 style="color:var(--vic-gold-bright); font-family:var(--font-cinzel);">⚜️ House ${state.player.vassalHouseName} (Noble Vassal)</h3>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px;">House Anda berdiri secara resmi sebagai pengabdi terpercaya dari <strong>${house.name}</strong>.</p>
          <div style="margin-top:10px; font-size:0.8rem; color:var(--fm-green-accent);">Bonus Prestise Bulanan: +2 Prestige</div>
        </div>
      `;
      return;
    }

    const c1 = state.player.prestige >= 30;
    const c2 = state.player.reputation >= 25;
    const c3 = state.player.landHectares >= 10;
    const c4 = state.player.gold >= 150;
    const isReady = c1 && c2 && c3 && c4;

    container.innerHTML = `
      <div style="background:#0d0a08; border:1px solid var(--vic-mahogany-border); padding:15px; border-radius:3px;">
        <h3 style="color:var(--vic-gold-bright); font-family:var(--font-cinzel); margin-bottom:8px;">MEMINTA IZIN PENDIRIAN HOUSE BAWAHAN</h3>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px;">
          Tanyakan kepada Lord <strong>${house.name}</strong> apakah Anda diizinkan membentuk Dinasti / Banner House baru di bawah panji milik mereka.
        </p>
        <div style="font-size:0.78rem; display:flex; flex-direction:column; gap:4px; margin-bottom:15px;">
          <div>• Prestige minimal 30: <strong style="color:${c1?'#02c39a':'#ff6b6b'}">${state.player.prestige}/30</strong></div>
          <div>• Reputasi minimal 25: <strong style="color:${c2?'#02c39a':'#ff6b6b'}">${state.player.reputation}/25</strong></div>
          <div>• Memiliki minimal 10 Ha Tanah: <strong style="color:${c3?'#02c39a':'#ff6b6b'}">${state.player.landHectares}/10 Ha</strong></div>
          <div>• Kas Emas minimal 150 Gold: <strong style="color:${c4?'#02c39a':'#ff6b6b'}">${state.player.gold}/150 Gold</strong></div>
        </div>
        <div style="display:flex; gap:10px;">
          <input type="text" id="vassal-house-input" placeholder="Nama House Baru (Cth: Blackwood)" style="flex:1;" ${!isReady ? 'disabled' : ''}>
          <button class="v-btn" onclick="game.requestVassalHousePermission()" ${!isReady ? 'disabled' : ''}>Minta Izin Lord</button>
        </div>
      </div>
    `;
  },

  renderJobs() {
    const activePanel = document.getElementById('active-job-details');
    const currentJobObj = state.jobs.find(j => j.id === state.player.currentJob);

    if (!currentJobObj) {
      activePanel.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">Anda saat ini tidak memiliki kontrak pekerjaan aktif.</p>`;
    } else {
      const currentRank = currentJobObj.ranks[state.player.jobRankIndex];
      const nextRank = currentJobObj.ranks[state.player.jobRankIndex + 1];
      
      let progressPct = 100;
      let expText = "PANGKAT MAKSIMAL";

      if (nextRank) {
        progressPct = Math.min(100, (state.player.jobExp / currentRank.expReq) * 100);
        expText = `${state.player.jobExp} / ${currentRank.expReq} EXP`;
      }

      activePanel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <h3 style="color:var(--vic-gold-bright); font-family:var(--font-cinzel);">${currentJobObj.title} — ${currentRank.name}</h3>
            <div style="font-size:0.75rem; color:var(--fm-green-accent);">Gaji Bulanan: +${currentRank.income} Gold</div>
          </div>
        </div>
        <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:4px;">PROGRES PROMOSI PEKERJAAN</div>
        <div class="progress-container" style="height:20px;">
          <div class="progress-bar bg-rank" style="width: ${progressPct}%;"></div>
          <span class="progress-text">${expText}</span>
        </div>
      `;
    }

    const container = document.getElementById('jobs-list');
    container.innerHTML = '';

    state.jobs.forEach(job => {
      if (job.id === 'knight_vassal') return; // Job khusus ksatria dipisah

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
          <div class="job-perks">Pangkat Awal: ${baseRank.name} (+${baseRank.income} Gold/bln)</div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
            Syarat: ${job.req.stat.toUpperCase()} ≥ ${job.req.val}
          </div>
        </div>
        <button class="v-btn" onclick="game.selectJob('${job.id}')" ${!isQualified || isCurrent ? 'disabled' : ''}>
          ${isCurrent ? 'Kontrak Aktif' : isQualified ? 'Tanda Tangan Kontrak' : 'Terkunci'}
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
          Beli Peralatan
        </button>
      `;
      container.appendChild(card);
    });
  },

  renderLandPanel() {
    const panel = document.getElementById('land-panel');
    const price = state.landMarket.pricePerHectare;
    const rent = state.landMarket.rentIncomePerHectare;
    const totalRentIncome = state.player.landHectares * rent;

    panel.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
        <div style="background:#0d0a08; border:1px solid var(--vic-mahogany-border); padding:15px; border-radius:3px;">
          <h4 style="color:var(--vic-gold-bright); font-family:var(--font-cinzel);">MEMBELI TANAH (PER HEKTAR)</h4>
          <p style="font-size:0.8rem; color:var(--text-muted); margin:8px 0;">Harga: <strong>${price} Gold</strong> / Hektar</p>
          <p style="font-size:0.8rem; color:var(--fm-green-accent);">Hasil Sewa: +${rent} Gold / Hektar tiap bulan</p>
          <div style="display:flex; gap:10px; margin-top:12px;">
            <button class="v-btn" onclick="game.buyLand(1)">Beli 1 Hektar (${price} G)</button>
            <button class="v-btn" onclick="game.buyLand(5)">Beli 5 Hektar (${price * 5} G)</button>
          </div>
        </div>

        <div style="background:#0d0a08; border:1px solid var(--vic-mahogany-border); padding:15px; border-radius:3px;">
          <h4 style="color:var(--vic-gold-bright); font-family:var(--font-cinzel);">MENJUAL TANAH</h4>
          <p style="font-size:0.8rem; color:var(--text-muted); margin:8px 0;">Kepemilikan Saat Ini: <strong>${state.player.landHectares} Hektar</strong></p>
          <p style="font-size:0.8rem; color:var(--vic-gold-bright);">Total Pendapatan Sewa Bulanan: +${totalRentIncome} Gold</p>
          <div style="display:flex; gap:10px; margin-top:12px;">
            <button class="v-btn" onclick="game.sellLand(1)" ${state.player.landHectares < 1 ? 'disabled' : ''}>Jual 1 Hektar (+${Math.floor(price * 0.8)} G)</button>
            <button class="v-btn" onclick="game.sellLand(5)" ${state.player.landHectares < 5 ? 'disabled' : ''}>Jual 5 Hektar (+${Math.floor(price * 5 * 0.8)} G)</button>
          </div>
        </div>
      </div>
    `;
  },

  renderResearchAndTalents() {
    const rPanel = document.getElementById('research-panel');
    if (state.research.active) {
      const topic = state.researchTopics.find(t => t.id === state.research.topic);
      const pct = Math.min(100, (state.research.progress / state.research.totalMonths) * 100);
      rPanel.innerHTML = `
        <div style="font-size:0.85rem; color:var(--vic-gold-bright); margin-bottom:5px;">Riset Aktif: ${topic.name}</div>
        <div class="progress-container" style="height:18px; margin-bottom:8px;">
          <div class="progress-bar bg-research" style="width:${pct}%;"></div>
          <span class="progress-text">${state.research.progress} / ${state.research.totalMonths} Bulan</span>
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted);">Selesai akan memberikan +${topic.points} Talent Point.</div>
      `;
    } else {
      let optionsHTML = state.researchTopics.map(t => `
        <div style="background:#0d0a08; border:1px solid var(--vic-mahogany-border); padding:10px; margin-bottom:8px; border-radius:3px;">
          <div style="font-size:0.85rem; color:var(--vic-gold-bright);">${t.name} (+${t.points} TP)</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${t.desc}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
            <span style="font-size:0.75rem; color:var(--fm-green-accent);">${t.cost} Gold | ${t.months} Bulan</span>
            <button class="v-btn" onclick="game.startResearch('${t.id}')" ${state.player.gold < t.cost ? 'disabled' : ''}>Mulai Riset</button>
          </div>
        </div>
      `).join('');
      rPanel.innerHTML = optionsHTML;
    }

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
        <div class="talent-cost">${talent.cost} Talent Point</div>
        <button class="v-btn" onclick="game.unlockTalent('${talent.id}')" ${isUnlocked || !reqMet || state.player.talentPoints < talent.cost ? 'disabled' : ''}>
          ${isUnlocked ? 'Terbuka' : !reqMet ? 'Syarat Terkunci' : 'Buka Talent'}
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
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Penguasa: ${p.owner}</div>
        <div style="font-size:0.75rem; color:var(--fm-green-accent); margin-top:4px;">Pajak Bulanan: +${p.tax} Gold</div>
      `;
      grid.appendChild(card);
    });
  },

  renderInbox() {
    const container = document.getElementById('inbox-list');
    if (!container) return;
    container.innerHTML = '';

    if (state.inbox.length === 0) {
      container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:30px;">Tidak ada surat di kotak masuk Anda.</div>`;
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
      stats.intrigue += 3; stats.combat += 2; state.player.title = "Bastard of " + state.player.region; state.player.reputation -= 5;
    } else if (state.player.origin === 'Hedge Knight') {
      stats.combat += 4; stats.tactics += 2; state.player.title = "Landed Hedge Knight"; state.player.prestige += 2;
    } else if (state.player.origin === 'Mercenary') {
      stats.tactics += 3; stats.combat += 2; state.player.men = 5; state.player.title = "Mercenary Captain";
    } else if (state.player.origin === 'Merchant') {
      stats.stewardship += 4; state.player.gold += 50; state.player.title = "Merchant Heir";
    } else if (state.player.origin === 'Maester Apprentice') {
      stats.stewardship += 2; stats.intrigue += 2; state.player.talentPoints += 1; state.player.title = "Scholar Wanderer";
    }

    if (state.player.region === 'The North') stats.combat += 1;
    if (state.player.region === 'The Westerlands') state.player.gold += 20;
    if (state.player.region === 'The Crownlands') state.player.prestige += 1;
    if (state.player.region === 'The Reach') stats.diplomacy += 1;
    if (state.player.region === 'Dorne') stats.intrigue += 1;
    if (state.player.region === 'The Riverlands') stats.stewardship += 1;
    if (state.player.region === 'The Iron Islands') stats.tactics += 1;

    state.player.stats = stats;

    document.getElementById('creation-modal').remove();
    document.getElementById('game-interface').classList.remove('hidden');

    state.inbox.push({
      id: "init",
      title: "Selamat Datang di Westeros (298 AC)",
      sender: "Surat Grand Maester",
      type: "Mulai Petualangan",
      date: `${state.date.year} AC, M${state.date.month}`,
      desc: `King Robert Baratheon bertakhta di Iron Throne. Bangun reputasi Anda di ${state.player.region}, kumpulkan tanah, abdi pada House Great Westeros, dan raih kekuasaan.`,
      choices: [{ text: "Mulai Petualangan", effect: () => "Catatan sejarah Anda dimulai." }],
      read: false
    });

    ui.renderTopBar();
    ui.renderProfile();
    ui.renderNobleOffers();
    ui.renderVassalHousePanel();
    ui.renderJobs();
    ui.renderShop();
    ui.renderLandPanel();
    ui.renderResearchAndTalents();
    ui.renderProvinces();
    ui.renderInbox();

    ui.addLog(`Karir Anda dimulai di ${state.player.region} sebagai ${state.player.title}.`);
  },

  acceptNobleOffer(houseId) {
    const house = state.nobleHouses.find(h => h.id === houseId);
    if (!house) return;

    // Otomatis memutus job lama & mengalihkan ke Karir Ksatria Setia
    state.player.activeNobleHouse = house.id;
    state.player.currentJob = "knight_vassal"; 
    state.player.jobRankIndex = 0;
    state.player.jobExp = 0;
    state.player.title = house.titleOffer;
    state.player.prestige += 5;
    state.player.reputation += 5;

    ui.addLog(`SUMPAH SETIA: Anda berhenti dari job sebelumnya & resmi diangkat sebagai ${house.titleOffer} di bawah ${house.name}!`);
    ui.renderTopBar();
    ui.renderProfile();
    ui.renderNobleOffers();
    ui.renderVassalHousePanel();
    ui.renderJobs();
  },

  requestVassalHousePermission() {
    const houseNameInput = document.getElementById('vassal-house-input');
    if (!houseNameInput || !houseNameInput.value.trim()) {
      alert("Harap masukkan nama House baru Anda!");
      return;
    }

    const houseName = houseNameInput.value.trim();
    const activeHouse = state.nobleHouses.find(h => h.id === state.player.activeNobleHouse);

    // Diberi izin oleh Lord
    state.player.vassalHouseName = houseName;
    state.player.gold -= 150;
    state.player.prestige += 15;
    state.player.title = `Lord of House ${houseName} (Vassal to ${activeHouse.name})`;

    ui.addLog(`IZIN DISETUJUI: Lord ${activeHouse.name} menyetujui pendirian House ${houseName} di bawah panji mereka!`);
    ui.renderTopBar();
    ui.renderProfile();
    ui.renderVassalHousePanel();
  },

  selectJob(jobId) {
    const selectedJob = state.jobs.find(j => j.id === jobId);
    if (!selectedJob) return;

    state.player.currentJob = jobId;
    state.player.jobRankIndex = 0;
    state.player.jobExp = 0;

    ui.renderTopBar();
    ui.renderJobs();
    ui.addLog(`Kontrak ditandatangani: Bekerja sebagai ${selectedJob.title}.`);
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

        ui.addLog(`PROMOSI! Anda naik pangkat menjadi ${currentJobObj.ranks[state.player.jobRankIndex].name}! (+${prestigeBonus} Prestige)`);
      }
    }
  },

  buyLand(hectares) {
    const totalCost = hectares * state.landMarket.pricePerHectare;
    if (state.player.gold < totalCost) {
      ui.addLog("Emas tidak cukup untuk membeli tanah!");
      return;
    }

    state.player.gold -= totalCost;
    state.player.landHectares += hectares;

    ui.addLog(`Membeli ${hectares} Hektar tanah seharga ${totalCost} Gold.`);
    ui.renderTopBar();
    ui.renderLandPanel();
    ui.renderVassalHousePanel();
  },

  sellLand(hectares) {
    if (state.player.landHectares < hectares) return;

    const sellPricePerHectare = Math.floor(state.landMarket.pricePerHectare * 0.8);
    const totalRevenue = hectares * sellPricePerHectare;

    state.player.landHectares -= hectares;
    state.player.gold += totalRevenue;

    ui.addLog(`Menjual ${hectares} Hektar tanah seharga ${totalRevenue} Gold.`);
    ui.renderTopBar();
    ui.renderLandPanel();
    ui.renderVassalHousePanel();
  },

  buyItem(itemId) {
    const item = state.shopItems.find(i => i.id === itemId);
    if (!item || state.player.gold < item.cost) return;

    state.player.gold -= item.cost;

    if (item.type === "food") {
      state.player.hunger = Math.max(0, state.player.hunger - item.val);
      ui.addLog(`Memakan ${item.name}. Kelaparan berkurang ${item.val}.`);
    } else if (item.type === "food_luxury") {
      state.player.hunger = Math.max(0, state.player.hunger - item.val);
      state.player.prestige += 1;
      ui.addLog(`Nikmati ${item.name}. Kelaparan berkurang & +1 Prestige.`);
    } else if (item.type === "heal") {
      state.player.health = Math.min(state.player.maxHealth, state.player.health + item.val);
      ui.addLog(`Memakai ${item.name}. Health bertambah ${item.val}.`);
    } else if (item.type === "equip") {
      state.player.stats[item.stat] += item.val;
      ui.addLog(`Memakai ${item.name}. Permanen +${item.val} ${item.stat.toUpperCase()}.`);
    } else if (item.type === "equip_legendary") {
      state.player.stats[item.stat] += item.val;
      if (item.bonusPrestige) state.player.prestige += item.bonusPrestige;
      ui.addLog(`Memakai ${item.name}. Permanen +${item.val} ${item.stat.toUpperCase()} & +${item.bonusPrestige} Prestige!`);
    } else if (item.type === "equip_health") {
      state.player.stats[item.stat] += item.val;
      state.player.maxHealth += item.bonusHealth;
      state.player.health += item.bonusHealth;
      ui.addLog(`Memakai ${item.name}. Permanen +${item.val} Combat & +${item.bonusHealth} Max Health!`);
    } else if (item.type === "equip_heavy") {
      state.player.stats[item.stat] += item.val;
      state.player.stats.tactics += item.bonusTactics;
      state.player.maxHealth += item.bonusHealth;
      state.player.health += item.bonusHealth;
      ui.addLog(`Memakai ${item.name}. Permanen +${item.val} Combat, +${item.bonusTactics} Tactics, & +${item.bonusHealth} Max Health!`);
    }

    ui.renderTopBar();
    ui.renderProfile();
    ui.renderShop();
    ui.renderNobleOffers();
    ui.renderVassalHousePanel();
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
    ui.renderVassalHousePanel();
    ui.addLog(`Memulai riset tentang ${topic.name}.`);
  },

  unlockTalent(talentId) {
    const talent = state.talents.find(t => t.id === talentId);
    if (!talent || state.player.talentPoints < talent.cost) return;

    state.player.talentPoints -= talent.cost;
    state.player.unlockedTalents.push(talentId);

    if (talentId === "t1") {
      state.player.maxHealth += 20;
      state.player.health += 20;
    } else if (talentId === "t5") {
      state.player.stats.intrigue += 2;
    } else if (talentId === "t6") {
      state.player.stats.diplomacy += 2;
    }

    ui.renderTopBar();
    ui.renderProfile();
    ui.renderResearchAndTalents();
    ui.renderNobleOffers();
    ui.addLog(`Berhasil Membuka Talent: ${talent.name}!`);
  },

  recruitMen(amount, cost) {
    if (state.player.gold < cost) {
      ui.addLog("Emas tidak cukup untuk merekrut prajurit!");
      return;
    }
    state.player.gold -= cost;
    state.player.men += amount;
    ui.renderTopBar();
    ui.renderVassalHousePanel();
    ui.addLog(`Merekrut ${amount} prajurit.`);
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
      ui.addLog(`PESAN BARU: ${randomEvent.title}`);
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
        ui.addLog(`PERISTIWA DUNIA: ${evt.title}`);
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
      ui.addLog(`[Keputusan] ${resultText}`);
    }

    state.inbox.splice(state.activeEvent.index, 1);
    state.activeEvent = null;

    document.getElementById('event-modal-overlay').classList.add('hidden');
    ui.renderTopBar();
    ui.renderProfile();
    ui.renderJobs();
    ui.renderNobleOffers();
    ui.renderVassalHousePanel();
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
      ui.addLog("PERINGATAN: Anda kelaparan! Mengalami -20 Health tiap bulan!");
    }

    if (state.player.health <= 0) {
      alert("Karakter Anda telah meninggal dunia akibat luka dan kelaparan. Game Over!");
      location.reload();
      return;
    }

    // 2. Economy & Job Progression
    let income = 0;

    // Sewa Tanah
    let landIncome = state.player.landHectares * state.landMarket.rentIncomePerHectare;
    if (state.player.unlockedTalents.includes("t2")) landIncome = Math.floor(landIncome * 1.15);
    income += landIncome;

    // Gaji Pekerjaan Swasta / Ksatria
    if (state.player.currentJob) {
      const activeJob = state.jobs.find(j => j.id === state.player.currentJob);
      if (activeJob) {
        let currentRank = activeJob.ranks[state.player.jobRankIndex];
        let jobIncome = currentRank.income;
        if (state.player.unlockedTalents.includes("t2")) jobIncome = Math.floor(jobIncome * 1.15);
        income += jobIncome;
        game.addJobExp(20);
      }
    }

    // Pendapatan Tambahan Jika Punya House Vassal
    if (state.player.vassalHouseName) {
      state.player.prestige += 2;
    }

    // Upkeep Pasukan
    let baseUpkeep = Math.floor(state.player.men * 0.5);
    let upkeep = state.player.unlockedTalents.includes("t3") ? Math.floor(baseUpkeep * 0.5) : baseUpkeep;

    const netGold = income - upkeep;
    state.player.gold += netGold;

    // 3. Research Tick
    if (state.research.active) {
      state.research.progress += 1;
      if (state.research.progress >= state.research.totalMonths) {
        const topic = state.researchTopics.find(t => t.id === state.research.topic);
        state.player.talentPoints += topic.points;
        ui.addLog(`RISET SELESAI: Berhasil mempelajari ${topic.name}! Mendapat +${topic.points} Talent Point.`);
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
    ui.renderNobleOffers();
    ui.renderVassalHousePanel();
    ui.renderJobs();
    ui.renderShop();
    ui.renderLandPanel();
    ui.renderResearchAndTalents();
    ui.renderInbox();

    ui.addLog(`Ganti bulan. Hasil Bersih Emas: ${netGold >= 0 ? '+' : ''}${netGold} Gold.`);
  }
};
