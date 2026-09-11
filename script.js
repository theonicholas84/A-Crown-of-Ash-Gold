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
    hunger: 0,
    gold: 30,
    prestige: 0,
    reputation: 0,
    landHectares: 0,
    men: 0,
    talentPoints: 0,
    currentJob: null,
    activeNobleHouse: null,
    vassalHouseName: null,
    jobRankIndex: 0,
    jobExp: 0,
    currentLocation: "winterfell",
    continent: "westeros",
    stats: {
      combat: 5,
      tactics: 5,
      stewardship: 5,
      intrigue: 5,
      diplomacy: 5
    },
    inventory: {},
    unlockedTalents: [],
    traits: [],
    mercenaryCompany: null,
    lordRelation: 50,          // 0-100 hubungan dengan Lord aktif
    buildings: {},             // id -> level/count
    danyFavor: 0,              // favor khusus Daenerys (untuk inner circle)
    innerCircle: false,        // apakah jadi inti bersama Barristan dll
    marriedTo: null,           // { name, house, bonus }
    warParticipation: 0,       // berapa kali ikut perang besar
    prestigeActionsUsed: {}    // cooldown sederhana
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
  travel: {
    inProgress: false,
    destinationId: null,
    destContinent: null,
    monthsLeft: 0,
    goingHome: false
  },
  inbox: [],
  activeEvent: null,

  // NOBLE HOUSES & QUEST LINES (Westeros Great Houses + Daenerys in Essos)
  nobleHouses: [
    {
      id: "stark", name: "House Stark", region: "The North", continent: "westeros",
      sigil: "🐺 Direwolf", motto: "Winter is Coming",
      reqPrestige: 5, reqReputation: 10,
      titleOffer: "Sworn Shield of Winterfell", monthlyPay: 35,
      story: "Membantu Lord Eddard Stark menjaga kedamaian di Utara dan bertempur dalam perang menghadapi musim dingin."
    },
    {
      id: "lannister", name: "House Lannister", region: "The Westerlands", continent: "westeros",
      sigil: "🦁 Lion", motto: "Hear Me Roar!",
      reqPrestige: 8, reqReputation: -5,
      titleOffer: "Lannister Household Captain", monthlyPay: 60,
      story: "Mengabdi pada House Lannister dalam mengamankan tambang emas Casterly Rock dan membiayai pundi-pundi kerajaan."
    },
    {
      id: "velaryon", name: "House Velaryon", region: "The Crownlands", continent: "westeros",
      sigil: "🐉 Sea Seahorse", motto: "The Old, the True, the Brave",
      reqPrestige: 6, reqReputation: 5,
      titleOffer: "High Tide Fleet Warden", monthlyPay: 40,
      story: "Memimpin armada kapal laut Driftmark dan mengamankan jalur perdagangan Gullet dari bajak laut Essos."
    },
    {
      id: "baratheon", name: "House Baratheon", region: "The Crownlands", continent: "westeros",
      sigil: "👑 Crowned Stag", motto: "Ours is the Fury",
      reqPrestige: 10, reqReputation: 15,
      titleOffer: "Royal Knight of the Realm", monthlyPay: 55,
      story: "Melayani House Baratheon dalam turnamen kerajaan dan mengamankan kekuasaan King's Landing."
    },
    {
      id: "martell", name: "House Martell", region: "Dorne", continent: "westeros",
      sigil: "☀️ Red Sun and Spear", motto: "Unbowed, Unbroken, Unbent",
      reqPrestige: 7, reqReputation: 5,
      titleOffer: "Sunspear Shadow Guard", monthlyPay: 45,
      story: "Membantu Prince Doran Martell dalam intrik politik rahasia membalaskan dendam kematian Elia Martell."
    },
    {
      id: "tyrell", name: "House Tyrell", region: "The Reach", continent: "westeros",
      sigil: "🌹 Golden Rose", motto: "Growing Strong",
      reqPrestige: 6, reqReputation: 8,
      titleOffer: "Highgarden Grain Marshal", monthlyPay: 50,
      story: "Mengelola suplai pangan dan aliansi politik House Tyrell dengan kekuatan kekayaan panen Highgarden."
    },
    {
      id: "greyjoy", name: "House Greyjoy", region: "The Iron Islands", continent: "westeros",
      sigil: "🐙 Kraken", motto: "We Do Not Sow",
      reqPrestige: 6, reqReputation: -8,
      titleOffer: "Ironborn Reaver Captain", monthlyPay: 38,
      story: "Ikut dalam tradisi Ironborn merampas dan berlayar bersama armada Pyke demi membayar harga besi."
    },
    {
      id: "targaryen", name: "Daenerys Targaryen", region: "Essos (Slaver's Bay)", continent: "essos",
      sigil: "🐲 Three-Headed Dragon", motto: "Fire and Blood",
      reqPrestige: 3, reqReputation: 0,
      titleOffer: "Sworn Sword of the Queen Across the Sea", monthlyPay: 45,
      story: "Mengabdi pada Daenerys Targaryen, Ibu Naga, dalam misinya membebaskan kota-kota budak di Essos dan merebut kembali Iron Throne."
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

  // Free Companies — pilihan saat masuk karier Tentara Bayaran
  mercenaryCompanies: [
    { id: "golden_company", name: "Golden Company", motto: "Beneath the Gold, the Bitter Steel",
      desc: "Perusahaan bayaran paling legendaris dari Essos. Disiplin tinggi, bayaran mewah.",
      bonusCombat: 2, bonusTactics: 1, incomeMult: 1.25, startMen: 3, repOnJoin: 2 },
    { id: "second_sons", name: "Second Sons", motto: "We Fight for Coin",
      desc: "Sellsword klasik. Fleksibel, sering terlibat intrik politik Free Cities.",
      bonusCombat: 1, bonusIntrigue: 1, incomeMult: 1.15, startMen: 2, repOnJoin: 0 },
    { id: "windblown", name: "Windblown", motto: "The Company of the Cat",
      desc: "Perusahaan beraneka ragam dengan kapten eksentrik. Cepat bergerak, bayaran sedang.",
      bonusTactics: 2, incomeMult: 1.1, startMen: 2, repOnJoin: 1 },
    { id: "stormcrows", name: "Stormcrows", motto: "Three Heads, One Company",
      desc: "Dikenal di Slaver's Bay. Tiga kapten, gaya bertempur agresif.",
      bonusCombat: 2, incomeMult: 1.2, startMen: 4, repOnJoin: -1 },
    { id: "brave_companions", name: "Brave Companions (Bloody Mummers)", motto: "Fear and Blood",
      desc: "Ditakuti karena kekejaman. Bayaran tinggi, reputasi buruk.",
      bonusCombat: 3, incomeMult: 1.3, startMen: 3, repOnJoin: -5 },
    { id: "free_company_generic", name: "Free Company Lokal", motto: "Coin is Coin",
      desc: "Perusahaan bayaran kecil di Westeros. Mudah masuk, bayaran standar.",
      bonusCombat: 1, incomeMult: 1.0, startMen: 1, repOnJoin: 0 }
  ],

  // Traits yang bisa diperoleh dari keberhasilan
  traitDefs: [
    { id: "duelist", name: "Duelist Berpengalaman", desc: "+1 Combat permanen saat membuka. Menang duel lebih mudah.", trigger: "duel_wins" },
    { id: "battle_scarred", name: "Berbekas Luka Perang", desc: "+10 Max Health. Bertahan lebih lama di medan tempur.", trigger: "battle_wins" },
    { id: "trusted_sword", name: "Pedang Tepercaya", desc: "+2 Reputasi saat membuka. Lord lebih mudah menerima.", trigger: "house_service" },
    { id: "honest_steward", name: "Pengelola Jujur", desc: "+1 Stewardship. Pendapatan sewa +10%.", trigger: "good_scribe" },
    { id: "shadow_whisperer", name: "Bisikan Bayangan", desc: "+1 Intrigue. Peluang event rahasia meningkat.", trigger: "good_informant" },
    { id: "essos_voyager", name: "Pengelana Essos", desc: "Sudah menyeberangi Laut Sempit. +1 Diplomacy.", trigger: "essos_visit" },
    { id: "merchant_prince", name: "Pangeran Dagang", desc: "+15% Gold dari pekerjaan. Membuka lewat perdagangan sukses.", trigger: "merchant_success" },
    { id: "war_veteran", name: "Veteran Perang", desc: "+1 Tactics & +1 Combat. Dari kampanye House.", trigger: "war_campaign" },
    { id: "queens_inner", name: "Lingkaran Dalam Ratu", desc: "Dipercaya Daenerys setara Barristan. +2 Diplomacy, +1 Prestige/bulan.", trigger: "dany_inner" },
    { id: "landed_builder", name: "Pembangun Wilayah", desc: "Membangun 3 struktur. +1 Stewardship.", trigger: "builder" }
  ],

  // Bangunan yang bisa dibangun setelah punya House Vassal
  buildingDefs: [
    { id: "village", name: "Desa Petani", cost: 120, prestigeReq: 20, desc: "+3 Gold sewa/bulan, +1 Reputasi/tahun.", goldPerMonth: 3, max: 5 },
    { id: "watchtower", name: "Menara Pengawas", cost: 180, prestigeReq: 25, desc: "+1 Tactics permanen (sekali), kurangi risiko bandit.", tacticsOnce: 1, max: 2 },
    { id: "market", name: "Pasar Desa", cost: 220, prestigeReq: 30, desc: "+5 Gold/bulan, +1 Stewardship sekali.", goldPerMonth: 5, stewardshipOnce: 1, max: 2 },
    { id: "sept", name: "Sept / Kuil Kecil", cost: 150, prestigeReq: 22, desc: "+2 Reputasi saat dibangun, +1 Diplomacy sekali.", reputation: 2, diplomacyOnce: 1, max: 1 },
    { id: "barracks", name: "Barak Prajurit", cost: 280, prestigeReq: 35, desc: "Rekrut 5 prajurit gratis sekali, upkeep -10%.", freeMen: 5, max: 2 },
    { id: "keep", name: "Kastil Kecil (Keep)", cost: 600, prestigeReq: 50, desc: "+10 Gold/bulan, +5 Prestige saat dibangun, +2 Max Health/bulan regenerasi partial.", goldPerMonth: 10, prestigeOnBuild: 5, max: 1 },
    { id: "great_hall", name: "Balai Agung", cost: 400, prestigeReq: 45, desc: "Buka aksi Prestige Feast. +3 Prestige saat dibangun.", prestigeOnBuild: 3, enablesFeast: true, max: 1 }
  ],

  // House minor untuk tawaran pernikahan (ASOIAF-flavored)
  minorHouses: {
    stark: [
      { name: "House Karstark", heir: "Alys Karstark", region: "The North" },
      { name: "House Mormont", heir: "Lyanna Mormont", region: "Bear Island" },
      { name: "House Glover", heir: "Robett Glover's kin", region: "Deepwood Motte" }
    ],
    lannister: [
      { name: "House Lefford", heir: "Alysanne Lefford", region: "Golden Tooth" },
      { name: "House Crakehall", heir: "Meredyth Crakehall", region: "Crakehall" },
      { name: "House Marbrand", heir: "Addam Marbrand's cousin", region: "Ashemark" }
    ],
    tyrell: [
      { name: "House Redwyne", heir: "Desmera Redwyne", region: "The Arbor" },
      { name: "House Hightower", heir: "Lynesse Hightower", region: "Oldtown" },
      { name: "House Tarly", heir: "Talla Tarly", region: "Horn Hill" }
    ],
    baratheon: [
      { name: "House Estermont", heir: "Cassana Estermont", region: "Greenstone" },
      { name: "House Swann", heir: "Gulian Swann's kin", region: "Stonehelm" }
    ],
    martell: [
      { name: "House Dayne", heir: "Allyria Dayne", region: "Starfall" },
      { name: "House Uller", heir: "Ellaria's kin", region: "Hellholt" }
    ],
    greyjoy: [
      { name: "House Harlaw", heir: "Gwynesse Harlaw", region: "Ten Towers" },
      { name: "House Botley", heir: "Tris Botley", region: "Lordsport" }
    ],
    velaryon: [
      { name: "House Celtigar", heir: "Prudence Celtigar", region: "Claw Isle" }
    ],
    targaryen: [
      { name: "House Yronwood", heir: "Ynys Yronwood", region: "Yronwood (ally)" },
      { name: "House Tolos", heir: "Merchant-princess of Tolos", region: "Essos" }
    ]
  },

  shopItems: [
    { id: "bread", name: "Roti Garam & Ransum", cost: 5, desc: "Memulihkan 30 Hunger.", type: "food", val: 30, category: "Makanan & Minuman" },
    { id: "wine", name: "Anggur Emas Arbor", cost: 12, desc: "Memulihkan 50 Hunger & +1 Prestige.", type: "food_luxury", val: 50, category: "Makanan & Minuman" },
    { id: "medicine", name: "Ramuan Maester", cost: 15, desc: "Memulihkan 40 Health.", type: "heal", val: 40, category: "Makanan & Minuman" },
    { id: "iron_sword", name: "Pedang Besi Tempa", cost: 30, desc: "Menambah +1 Combat permanen.", type: "equip", stat: "combat", val: 1, category: "Senjata" },
    { id: "castle_sword", name: "Castle-Forged Steel Sword", cost: 75, desc: "Menambah +3 Combat permanen.", type: "equip", stat: "combat", val: 3, category: "Senjata" },
    { id: "valyrian_sword", name: "Replika Pedang Valyrian", cost: 200, desc: "Menambah +5 Combat & +2 Prestige.", type: "equip_legendary", stat: "combat", val: 5, bonusPrestige: 2, category: "Senjata" },
    { id: "padded_tunic", name: "Tunik Kain Tebal Padded", cost: 20, desc: "Armor kain dasar. Menambah +1 Tactics.", type: "equip", stat: "tactics", val: 1, category: "Zirah & Armor" },
    { id: "silk_robe", name: "Jubah Sutra Highgarden", cost: 60, desc: "Armor kain mewah. Menambah +2 Diplomacy & +1 Prestige.", type: "equip_legendary", stat: "diplomacy", val: 2, bonusPrestige: 1, category: "Zirah & Armor" },
    { id: "chainmail", name: "Baju Zirah Rantai (Chainmail)", cost: 50, desc: "Armor besi sedang. Menambah +2 Combat & +10 Max Health.", type: "equip_health", stat: "combat", val: 2, bonusHealth: 10, category: "Zirah & Armor" },
    { id: "plate_armor", name: "Armor Pelat Besi Utuh (Full Plate)", cost: 150, desc: "Armor besi berat. Menambah +4 Combat, +2 Tactics, & +20 Max Health.", type: "equip_heavy", stat: "combat", val: 4, bonusTactics: 2, bonusHealth: 20, category: "Zirah & Armor" }
  ],

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
      id: "guard", title: "City Watch (Gold Cloaks)",
      desc: "Menjaga keamanan distrik kota dan menegakkan hukum.",
      req: { stat: "combat", val: 5 }, statBoost: "combat",
      ranks: [
        { name: "Prajurit Rekrutan", income: 10, expReq: 100 },
        { name: "Patrol Officer", income: 18, expReq: 250 },
        { name: "Kapten Distrik", income: 32, expReq: 500 },
        { name: "Komandan City Watch", income: 60, expReq: 1000 }
      ]
    },
    {
      id: "blacksmith", title: "Pandai Besi Kastil",
      desc: "Menempa pedang dan baju zirah untuk kebutuhan garnisun perang.",
      req: { stat: "combat", val: 4 }, statBoost: "combat",
      ranks: [
        { name: "Magang Pandai Besi", income: 12, expReq: 100 },
        { name: "Penempa Besi Utul", income: 22, expReq: 250 },
        { name: "Master Blacksmith Kastil", income: 45, expReq: 500 }
      ]
    },
    {
      id: "scribe", title: "Administrasi Kastil",
      desc: "Mengelola pembukuan, pajak, dan cadangan gandum High Lord.",
      req: { stat: "stewardship", val: 5 }, statBoost: "stewardship",
      ranks: [
        { name: "Clerk Muda", income: 15, expReq: 120 },
        { name: "High Steward", income: 28, expReq: 300 },
        { name: "Utusan Master of Coin", income: 50, expReq: 650 }
      ]
    },
    {
      id: "informant", title: "Jaringan Bayangan",
      desc: "Menyusup ke kedai dan mengumpulkan rahasia politik.",
      req: { stat: "intrigue", val: 6 }, statBoost: "intrigue",
      ranks: [
        { name: "Informan Jalanan", income: 14, expReq: 110 },
        { name: "Agen Mata-Mata", income: 26, expReq: 280 },
        { name: "Tangan Kanan Spymaster", income: 55, expReq: 600 }
      ]
    },
    {
      id: "mercenary", title: "Tentara Bayaran (Free Company)",
      desc: "Memimpin pengawalan bersenjata di seluruh Westeros.",
      req: { stat: "combat", val: 8 }, statBoost: "tactics",
      ranks: [
        { name: "Prajurit Sellsword", income: 20, expReq: 150 },
        { name: "Letnan Kapten", income: 40, expReq: 350 },
        { name: "Jenderal Pasukan Bayaran", income: 80, expReq: 800 }
      ]
    }
  ],

  // WESTEROS LOCATIONS (dipakai juga untuk province matrix & travel)
  provinces: [
    { id: "winterfell", name: "Winterfell", owner: "House Stark (Lord Eddard)", region: "The North", tax: 20 },
    { id: "pyke", name: "Pyke", owner: "House Greyjoy (Lord Balon)", region: "The Iron Islands", tax: 14 },
    { id: "casterly_rock", name: "Casterly Rock", owner: "House Lannister (Lord Tywin)", region: "The Westerlands", tax: 35 },
    { id: "riverrun", name: "Riverrun", owner: "House Tully (Lord Hoster)", region: "The Riverlands", tax: 15 },
    { id: "eyrie", name: "The Eyrie", owner: "House Arryn (Lady Lysa)", region: "The Vale", tax: 12 },
    { id: "highgarden", name: "Highgarden", owner: "House Tyrell (Lord Mace)", region: "The Reach", tax: 30 },
    { id: "kings_landing", name: "King's Landing", owner: "The Crown (King Robert Baratheon I)", region: "The Crownlands", tax: 40 },
    { id: "sunspear", name: "Sunspear", owner: "House Martell (Prince Doran)", region: "Dorne", tax: 22 },
    { id: "driftmark", name: "Driftmark", owner: "House Velaryon (Lord Monford)", region: "The Crownlands", tax: 25 }
  ],

  // ESSOS LOCATIONS
  essosLocations: [
    { id: "pentos", name: "Pentos", desc: "Kota pelabuhan Free City tempat pengasingan Targaryen bersinggah." },
    { id: "braavos", name: "Braavos", desc: "Kota kanal dengan Titan penjaga dan kekuatan Iron Bank." },
    { id: "volantis", name: "Volantis", desc: "Kota tertua Free Cities yang dikuasai kaum bangsawan pedagang budak." },
    { id: "vaes_dothrak", name: "Vaes Dothrak", desc: "Kota suci para Khalasar Dothraki di lautan rumput." },
    { id: "astapor", name: "Astapor", desc: "Kota penghasil pasukan budak Unsullied yang tak kenal takut." },
    { id: "yunkai", name: "Yunkai", desc: "Kota kuning para pedagang budak kenikmatan." },
    { id: "meereen", name: "Meereen", desc: "Kota budak terbesar di Teluk Budak, kelak menjadi ibu kota Daenerys." },
    { id: "qarth", name: "Qarth", desc: "Kota pedagang kaya raya di gerbang Laut Jade." }
  ],

  homeRegionToLocation: {
    "The North": "winterfell",
    "The Westerlands": "casterly_rock",
    "The Crownlands": "kings_landing",
    "The Reach": "highgarden",
    "Dorne": "sunspear",
    "The Riverlands": "riverrun",
    "The Iron Islands": "pyke"
  }
};

/* --------------------------------------------------------------------------
   EVENT DATABASE PEKERJAAN & LORE GOT
   -------------------------------------------------------------------------- */
const jobEvents = {
  guard: [
    {
      id: "g1", title: "Sogokan di Flea Bottom", type: "Event Pekerjaan", sender: "Patroli City Watch",
      desc: "Seorang penyelundup anggur Lysene menawarkan 20 Gold agar Anda pura-pura tidak melihat barang ilegalnya.",
      choices: [
        { text: "Terima sogokan (+20 Gold, -2 Prestige, -5 Reputasi)", effect: (p) => { p.gold += 20; p.prestige -= 2; p.reputation -= 5; return "Anda mengantongi emas dan membiarkan penyelundup lolos."; } },
        { text: "Tangkap atas nama Raja (+3 Prestige, +5 Reputasi, +15 EXP)", effect: (p) => { p.prestige += 3; p.reputation += 5; game.addJobExp(15); return "Penyelundup diseret ke penjara ibukota. Nama Anda disebut sebagai penjaga yang jujur."; } }
      ]
    },
    {
      id: "g2", title: "Perkelahian Kedai Minum", type: "Event Pekerjaan", sender: "Penjaga Distrik",
      desc: "Dua pedagang mabuk berkelahi hebat di kedai, mengancam memecahkan barang dagangan warga sekitar.",
      choices: [
        { text: "⚔️ DUEL — Lerai dengan kekuatan", effect: (p) => { const r = game.resolveDuel(p, 9, "Pedagang Mabuk", { winPrestige: 1, winCombat: 1, winExp: 15, loseHealth: 8 }); return r; } },
        { text: "Negosiasikan damai (+1 Diplomacy, +10 EXP)", effect: (p) => { p.stats.diplomacy += 1; game.addJobExp(10); return "Kedua pedagang berdamai berkat kata-kata Anda."; } }
      ]
    },
    {
      id: "g3", title: "Pembunuh Bayaran di Gang", type: "Event Pekerjaan", sender: "Sinyal Patroli",
      desc: "Anda menemukan seorang assassin yang sedang bersiap membunuh seorang pedagang kaya. Dia menghunus belati ke arah Anda.",
      choices: [
        { text: "⚔️ DUEL — Hadapi assassin", effect: (p) => game.resolveDuel(p, 15, "Assassin Bayaran", { winPrestige: 5, winGold: 25, winCombat: 1, winExp: 25, loseHealth: 20 }) },
        { text: "Panggil bala bantuan (+1 Tactics, +10 EXP)", effect: (p) => { p.stats.tactics += 1; game.addJobExp(10); return "Assassin kabur saat bala bantuan datang, namun Anda mendapat pujian."; } }
      ]
    }
  ],
  blacksmith: [
    {
      id: "bm1", title: "Besi Pedang Bangsawan", type: "Event Pekerjaan", sender: "Garnisun Bengkel",
      desc: "Seorang ksatria menuntut pedangnya ditempa ulang secara terburu-buru dan memberi tekanan pada Anda.",
      choices: [
        { text: "Kerjakan dengan teliti (+1 Combat, +20 EXP)", effect: (p) => { p.stats.combat += 1; game.addJobExp(20); return "Pedang buatan Anda dipuji sangat tajam!"; } },
        { text: "Pinta biaya kerja cepat (+15 Gold)", effect: (p) => { p.gold += 15; return "Ksatria membayar mahal walau sedikit bersungut-sungut."; } }
      ]
    }
  ],
  scribe: [
    {
      id: "s1", title: "Kecurangan Pajak Gandum", type: "Event Pekerjaan", sender: "Kantor Audit High Lord",
      desc: "Audit pembukuan panen menemukan manipulasi laporan oleh juru tulis lokal yang menyembunyikan 30 Gold.",
      choices: [
        { text: "Laporkan kecurangan (+5 Prestige, +5 Reputasi, +20 EXP)", effect: (p) => { p.prestige += 5; p.reputation += 5; game.addJobExp(20); game.grantTrait("honest_steward"); return "Lord memberi Anda penghargaan atas kejujuran. Trait Pengelola Jujur terbuka."; } },
        { text: "Peras juru tulis tersebut (+15 Gold)", effect: (p) => { p.gold += 15; return "Juru tulis menyerahkan 15 Gold secara diam-diam."; } }
      ]
    }
  ],
  informant: [
    {
      id: "in1", title: "Rahasia dari Kedai Pelabuhan", type: "Event Pekerjaan", sender: "Kontak Bayangan",
      desc: "Anda mendengar bisikan tentang rencana pemindahan pasukan rahasia salah satu House Agung.",
      choices: [
        { text: "Jual info ke pihak tertinggi (+25 Gold, -3 Reputasi)", effect: (p) => { p.gold += 25; p.reputation -= 3; return "Emas berpindah tangan dalam kegelapan lorong kota."; } },
        { text: "Simpan untuk Lord Anda (+2 Intrigue, +15 EXP, +2 Reputasi)", effect: (p) => { p.stats.intrigue += 2; game.addJobExp(15); game.addReputation(2, "Kesetiaan kepada Lord"); game.grantTrait("shadow_whisperer"); return "Informasi berharga tersimpan rapi. Trait Bisikan Bayangan terbuka."; } }
      ]
    }
  ],
  mercenary: [
    {
      id: "mc1", title: "Kontrak Pengawalan Karavan", type: "Event Pekerjaan", sender: "Free Company",
      desc: "Karavan pedagang membutuhkan pengawalan melewati jalur rawan perampok di Kingsroad.",
      choices: [
        { text: "Terima dan berjaga penuh (+2 Combat, +20 EXP)", effect: (p) => { p.stats.combat += 2; game.addJobExp(20); return "Karavan tiba dengan selamat berkat kewaspadaan Anda."; } },
        { text: "Ambil jalan pintas berisiko (+30 Gold, -10 Health)", effect: (p) => { p.gold += 30; p.health = Math.max(1, p.health - 10); return "Jalan pintas berhasil namun luka tergores di lengan Anda."; } }
      ]
    },
    {
      id: "mc2", title: "Ambush Perampok di Hutan", type: "Event Pekerjaan", sender: "Letnan Free Company",
      desc: "Perampok menyerang dari semak. Anda harus memimpin perlawanan atau mundur.",
      choices: [
        { text: "⚔️ Pimpin serangan balik", effect: (p) => game.resolveDuel(p, 13, "Pemimpin Perampok", { winPrestige: 4, winGold: 22, winCombat: 1, winExp: 20, loseHealth: 16 }) },
        { text: "Mundur teratur (+1 Tactics, +10 EXP)", effect: (p) => { p.stats.tactics += 1; game.addJobExp(10); return "Anda menyelamatkan sebagian karavan dengan mundur cerdas."; } }
      ]
    }
  ],
  knight_vassal: [
    {
      id: "kv1", title: "Insiden Bandit di Desa Lord", type: "Event Ksatria", sender: "Utusan Desa Lord",
      desc: "Kelompok penjarah menyerang batas tanah milik Lord Anda. Sebagai ksatria sworn, Anda diminta memimpin pasukan penumpasan.",
      choices: [
        { text: "⚔️ DUEL — Pimpin serangan depan", effect: (p) => game.resolveDuel(p, 14, "Pemimpin Bandit", { winPrestige: 10, winExp: 30, winCombat: 1, loseHealth: 14 }) },
        { text: "Gunakan taktik penyergapan (+15 EXP, +2 Tactics)", effect: (p) => { game.addJobExp(15); p.stats.tactics += 2; return "Musuh terkepung tanpa perlawanan berarti."; } }
      ]
    },
    {
      id: "kv2", title: "Turnamen Pengawal Kastil", type: "Event Ksatria", sender: "Master of Games",
      desc: "Turnamen pedang digelar untuk menghibur para bangsawan yang berkunjung ke kastil Lord Anda.",
      choices: [
        { text: "⚔️ DUEL TURNAMEN — Bertanding di arena", effect: (p) => game.resolveDuel(p, 13, "Lawanan Turnamen", { winPrestige: 8, winCombat: 2, winGold: 15, loseHealth: 12, losePrestige: 1 }) },
        { text: "Jaga keamanan arena saja (+10 Gold)", effect: (p) => { p.gold += 10; return "Turnamen berjalan aman tanpa insiden."; } }
      ]
    },
    {
      id: "kv3", title: "Tantangan Kehormatan dari Ksatria Rival", type: "Event Ksatria", sender: "Utusan Kastil",
      desc: "Seorang ksatria dari House rival menantang Anda duel publik demi kehormatan Lord Anda.",
      choices: [
        { text: "⚔️ TERIMA DUEL KEHORMATAN", effect: (p) => game.resolveDuel(p, 16, "Ksatria Rival", { winPrestige: 12, winCombat: 1, winExp: 25, loseHealth: 20, losePrestige: 5 }) },
        { text: "Tolak demi menghindari pertumpahan darah (+1 Diplomacy)", effect: (p) => { p.stats.diplomacy += 1; p.reputation -= 2; return "Beberapa orang menganggap Anda pengecut, namun Lord menghargai kebijaksanaan Anda."; } }
      ]
    }
  ]
};

/* --------------------------------------------------------------------------
   WORLD LORE EVENTS — Kronik Utama GOT (298-305 AC)
   -------------------------------------------------------------------------- */
const worldLoreEvents = [
  { triggerYear: 298, triggerMonth: 2, id: "w1", title: "Pernikahan Targaryen di Pentos", type: "Berita Dunia GOT", sender: "Utusan Kapal Dagang",
    desc: "Daenerys Targaryen dinikahkan dengan Khal Drogo di Pentos. Hadiah tiga telur naga diberikan kepadanya.",
    choices: [{ text: "Pahami Pesan", effect: () => "Kekuatan kuno naga mulai tercium." }] },
  { triggerYear: 298, triggerMonth: 5, id: "w2", title: "Wafatnya Hand of the King", type: "Berita Dunia GOT", sender: "Merpati Grand Maester",
    desc: "Lord Jon Arryn meninggal secara misterius. King Robert Baratheon bergerak ke Utara.",
    choices: [{ text: "Pahami Pesan", effect: () => "Takdir Westeros mulai bergetar." }] },
  { triggerYear: 298, triggerMonth: 7, id: "w2b", title: "Pertempuran Green Fork", type: "Berita Dunia GOT", sender: "Pengawal Riverlands",
    desc: "Pasukan Tywin Lannister bentrok dengan barisan depan Robb Stark di tepi Green Fork.",
    choices: [{ text: "Cermati Jalannya Perang", effect: (p) => { p.stats.tactics += 1; return "Taktik umpan pasukan mulai terlihat berbahaya."; } }] },
  { triggerYear: 298, triggerMonth: 10, id: "w3", title: "Eksekusi Lord Eddard Stark", type: "Berita Dunia GOT", sender: "Pengumuman King's Landing",
    desc: "Eddard Stark dihukum mati atas tuduhan pengkhianatan! Perang Lima Raja (War of the Five Kings) pecah!",
    choices: [{ text: "Bersiap untuk Perang!", effect: (p) => { p.prestige += 5; return "Seluruh Westeros membara!"; } }] },
  { triggerYear: 299, triggerMonth: 4, id: "w4", title: "Pertempuran Blackwater Bay", type: "Berita Dunia GOT", sender: "Pengintai Armada",
    desc: "Armada Stannis Baratheon dihancurkan oleh api Wildfire Lannister di King's Landing.",
    choices: [{ text: "Cermati Taktik Perang", effect: (p) => { p.stats.tactics += 1; return "Taktik Wildfire mengejutkan dunia."; } }] },
  { triggerYear: 299, triggerMonth: 8, id: "w4b", title: "Pembebasan Astapor", type: "Berita Dunia GOT", sender: "Pedagang Teluk Budak",
    desc: "Daenerys Targaryen membebaskan pasukan Unsullied di Astapor dan membakar para tuan budak.",
    choices: [{ text: "Pahami Pesan", effect: () => "Nama Ibu Naga mulai menggema hingga Westeros." }] },
  { triggerYear: 300, triggerMonth: 3, id: "w5", title: "Tragedi Red Wedding", type: "Berita Dunia GOT", sender: "Merpati Utusan Frey",
    desc: "Robb Stark dan pasukannya dibantai dalam pesta pernikahan di The Twins! House Stark runtuh sementara.",
    choices: [{ text: "Berduka / Terkejut", effect: () => "Pengkhianatan paling berdarah dalam sejarah Westeros." }] },
  { triggerYear: 300, triggerMonth: 6, id: "w5b", title: "Pernikahan Ungu — Kematian Raja Joffrey", type: "Berita Dunia GOT", sender: "Utusan Istana",
    desc: "Raja Joffrey Baratheon tewas keracunan di pesta pernikahannya sendiri di King's Landing.",
    choices: [{ text: "Pahami Pesan", effect: (p) => { p.reputation += 2; return "Istana dilanda kepanikan dan tuduhan saling silang."; } }] },
  { triggerYear: 300, triggerMonth: 9, id: "w5c", title: "Pengadilan Duel Oberyn Martell", type: "Berita Dunia GOT", sender: "Saksi Arena",
    desc: "Pangeran Oberyn Martell bertarung dalam duel maut melawan Ser Gregor Clegane demi membela House Martell.",
    choices: [{ text: "Saksikan Duel", effect: (p) => { p.stats.combat += 1; return "Duel berdarah itu mengubah nasib dua House sekaligus."; } }] },
  { triggerYear: 302, triggerMonth: 5, id: "w6b", title: "Pembebasan Meereen", type: "Berita Dunia GOT", sender: "Pedagang Teluk Budak",
    desc: "Daenerys Targaryen menaklukkan Meereen dan menjadikannya ibu kota sementara pemerintahannya di Essos.",
    choices: [{ text: "Pahami Pesan", effect: () => "Ratu Naga kini menguasai seluruh Teluk Budak." }] },
  { triggerYear: 303, triggerMonth: 3, id: "w6c", title: "Pertempuran Hardhome", type: "Berita Dunia GOT", sender: "Penjaga Night's Watch",
    desc: "Jon Snow menyaksikan Night King membangkitkan pasukan mati di Hardhome, di utara The Wall.",
    choices: [{ text: "Dengar Peringatan", effect: (p) => { p.stats.intrigue += 1; return "Ancaman di balik Tembok kini nyata."; } }] },
  { triggerYear: 303, triggerMonth: 8, id: "w6", title: "Battle of the Bastards", type: "Berita Dunia GOT", sender: "Ksatria Utara",
    desc: "Jon Snow dan Sansa Stark merebut kembali Winterfell dari pimpinan kejam Ramsay Bolton!",
    choices: [{ text: "Puji Kemenangan Utara", effect: (p) => { p.prestige += 5; return "Panji Wolf kembali berkibar di Winterfell!"; } }] },
  { triggerYear: 304, triggerMonth: 6, id: "w6d", title: "Kehancuran Sept of Baelor", type: "Berita Dunia GOT", sender: "Penduduk King's Landing",
    desc: "Cersei Lannister meledakkan Sept of Baelor dengan wildfire, menewaskan banyak petinggi rival politiknya.",
    choices: [{ text: "Pahami Pesan", effect: (p) => { p.reputation -= 2; return "King's Landing berduka dalam ketakutan baru."; } }] },
  { triggerYear: 305, triggerMonth: 1, id: "w6e", title: "Runtuhnya Tembok Utara", type: "PERANG BESAR WESTEROS", sender: "Sinyal Bahaya The Wall",
    desc: "Night King menunggangi naga mati dan menghancurkan The Wall di Eastwatch. Jalan menuju Selatan kini terbuka bagi para mayat hidup.",
    choices: [{ text: "Bersiap Menghadapi Kegelapan", effect: (p) => { p.stats.combat += 1; return "Seluruh Utara bersiaga penuh."; } }] },
  { triggerYear: 305, triggerMonth: 3, id: "w7", title: "PERANG BATTLE OF WINTERFELL (NIGHT KING)", type: "PERANG BESAR WESTEROS", sender: "Sinyal Bahaya Winterfell",
    desc: "Night King dan Armada Undead / White Walkers menyerang Winterfell! Perang bertahan hidup seluruh manusia meletus.",
    choices: [
      { text: "Kirim Pasukan Bantuan (+15 Prestige, -15 Health, +3 Combat)", effect: (p) => { p.prestige += 15; p.health = Math.max(5, p.health - 15); p.stats.combat += 3; return "Anda bertempur di garis depan Winterfell melawan kegelapan!"; } },
      { text: "Bertahan di Benteng Sendiri (+5 Prestige)", effect: (p) => { p.prestige += 5; return "Anda mengirim pasokan cadangan dan bertahan."; } }
    ] },
  { triggerYear: 305, triggerMonth: 4, id: "w7b", title: "Loot Train Battle di Reach", type: "Berita Dunia GOT", sender: "Pengawal Konvoi",
    desc: "Konvoi logistik Lannister yang membawa hasil rampasan dari Highgarden dihancurkan oleh serangan Dothraki dan naga.",
    choices: [{ text: "Pahami Pesan", effect: (p) => { p.stats.tactics += 1; return "Keseimbangan kekuatan perang berubah drastis."; } }] },
  { triggerYear: 305, triggerMonth: 5, id: "w8", title: "PERANG AKHIR: THE BATTLE OF KING'S LANDING", type: "PERANG AKHIR TAHTA", sender: "Terompet Perang Terakhir",
    desc: "Daenerys Targaryen menyerang King's Landing dengan Naga Drogon untuk menggulingkan Cersei Lannister! Api naga membakar kota.",
    choices: [
      { text: "Uji Nasib di Tengah Perang (+25 Prestige, +100 Gold)", effect: (p) => { p.prestige += 25; p.gold += 100; return "Anda memimpin pasukan dalam penentuan takhta Iron Throne!"; } },
      { text: "Amankan Kekuasaan Lokal (+10 Prestige)", effect: (p) => { p.prestige += 10; return "Anda mengonsolidasikan kekuasaan wilayah sendiri."; } }
    ] },
  { triggerYear: 305, triggerMonth: 6, id: "w9", title: "Dewan Penentu Raja Baru", type: "Berita Dunia GOT", sender: "Dewan Lord Westeros",
    desc: "Para Lord Westeros berkumpul di reruntuhan King's Landing untuk menentukan siapa yang layak duduk di Iron Throne.",
    choices: [{ text: "Amati Perkembangan Politik", effect: (p) => { p.stats.diplomacy += 1; return "Era baru Westeros akan segera dimulai."; } }] }
];

/* --------------------------------------------------------------------------
   HOUSE WAR CAMPAIGNS — misi perang khusus mengikuti alur cerita Lord pilihan
   -------------------------------------------------------------------------- */
const houseWarEvents = {
  stark: [
    { triggerYear: 298, triggerMonth: 11, id: "hw-stark-1", title: "PANGGILAN PERANG: Berbaris Bersama Robb Stark", type: "Panggilan Perang", sender: "Kastelan Winterfell",
      desc: "Robb Stark menyatakan perang atas eksekusi ayahnya. Sebagai ksatria sumpah Stark, Anda dipanggil ikut berbaris ke selatan.",
      choices: [
        { text: "⚔️ MAJU KE GARIS DEPAN (Duel & Pertempuran)", effect: (p) => {
          if (p.men >= 5) return game.resolveBattle(p, 18, "Pasukan Lannister", { winPrestige: 15, winGold: 30, winCombat: 1 });
          return game.resolveDuel(p, 15, "Kapten Lannister", { winPrestige: 12, winExp: 30, winCombat: 1, loseHealth: 18 });
        } },
        { text: "Jaga logistik pasukan (+15 EXP, +1 Stewardship)", effect: (p) => { game.addJobExp(15); p.stats.stewardship += 1; return "Pasokan pasukan Utara tetap terjaga berkat kerja Anda."; } }
      ] },
    { triggerYear: 299, triggerMonth: 1, id: "hw-stark-2", title: "Pertempuran Whispering Wood", type: "Panggilan Perang", sender: "Perwira Stark",
      desc: "Pasukan Stark menyergap barisan Jaime Lannister di hutan pada malam hari.", 
      choices: [{ text: "Ikut Penyergapan Malam (+2 Combat, +20 EXP)", effect: (p) => { p.stats.combat += 2; game.addJobExp(20); return "Penyergapan berhasil menahan Jaime Lannister!"; } }] },
    { triggerYear: 300, triggerMonth: 3, id: "hw-stark-3", title: "MALAPETAKA: Anda di The Twins", type: "Krisis Perang", sender: "Kabar dari The Twins",
      desc: "Anda turut hadir dalam pernikahan di The Twins ketika House Frey berkhianat dan membantai rombongan Stark.",
      choices: [
        { text: "Lari menyelamatkan diri (-10 Reputasi, tetap hidup)", effect: (p) => { p.reputation -= 10; return "Anda berhasil kabur di tengah kekacauan berdarah, namun dihantui rasa bersalah."; } },
        { text: "Bertarung membela tuan Anda (-40 Health, +20 Prestige)", effect: (p) => { p.health = Math.max(1, p.health - 40); p.prestige += 20; return "Anda nyaris tewas namun dikenang sebagai ksatria paling setia House Stark."; } }
      ] },
    { triggerYear: 303, triggerMonth: 8, id: "hw-stark-4", title: "PANGGILAN PERANG: Battle of the Bastards", type: "Panggilan Perang", sender: "Jon Snow",
      desc: "Jon Snow memanggil semua ksatria setia Stark untuk merebut kembali Winterfell dari Ramsay Bolton.",
      choices: [{ text: "Bertempur di Barisan Depan (+20 Prestige, +40 EXP, -20 Health)", effect: (p) => { p.prestige += 20; game.addJobExp(40); p.health = Math.max(1, p.health - 20); return "Winterfell kembali ke tangan House Stark berkat pengorbanan Anda!"; } }] }
  ],
  lannister: [
    { triggerYear: 299, triggerMonth: 4, id: "hw-lan-1", title: "PANGGILAN PERANG: Pertahankan King's Landing", type: "Panggilan Perang", sender: "Tywin Lannister",
      desc: "Armada Stannis Baratheon mendekati King's Landing. Anda diperintahkan bertahan di tembok kota bersama pasukan Lannister.",
      choices: [
        { text: "Bertahan di Garis Tembok (+15 Prestige, +30 EXP, -15 Health)", effect: (p) => { p.prestige += 15; game.addJobExp(30); p.health = Math.max(1, p.health - 15); return "Kota berhasil dipertahankan berkat api wildfire dan keberanian Anda."; } },
        { text: "Amankan Istana Merah (+10 Gold, +15 EXP)", effect: (p) => { p.gold += 10; game.addJobExp(15); return "Anda menjaga keluarga kerajaan tetap aman selama pertempuran."; } }
      ] },
    { triggerYear: 302, triggerMonth: 10, id: "hw-lan-2", title: "Ekspedisi Perampasan Highgarden", type: "Panggilan Perang", sender: "Jenderal Lannister",
      desc: "Cersei memerintahkan penyerbuan untuk merampas kekayaan panen dan emas House Tyrell di Highgarden.",
      choices: [{ text: "Ikut Serbuan (+25 Gold, +1 Combat)", effect: (p) => { p.gold += 25; p.stats.combat += 1; return "Highgarden dijarah, kas kerajaan kembali terisi."; } }] },
    { triggerYear: 305, triggerMonth: 5, id: "hw-lan-3", title: "KEPUTUSAN AKHIR: Bertahan atau Membelot?", type: "Krisis Perang", sender: "Ratu Cersei Lannister",
      desc: "Naga Daenerys menyerang King's Landing. Cersei menuntut kesetiaan terakhir Anda saat kota mulai terbakar.",
      choices: [
        { text: "Tetap Setia pada Cersei (-30 Health, +15 Prestige jika selamat)", effect: (p) => { p.health = Math.max(1, p.health - 30); p.prestige += 15; return "Anda bertahan hingga akhir di tengah reruntuhan King's Landing."; } },
        { text: "Membelot dan Menyerah (-15 Reputasi, tetap hidup)", effect: (p) => { p.reputation -= 15; return "Anda melarikan diri sebelum kota jatuh sepenuhnya."; } }
      ] }
  ],
  baratheon: [
    { triggerYear: 299, triggerMonth: 4, id: "hw-bar-1", title: "PANGGILAN PERANG: Armada Stannis Menyerang", type: "Panggilan Perang", sender: "Stannis Baratheon",
      desc: "Stannis Baratheon memimpin armadanya menyerbu Blackwater Bay untuk merebut Iron Throne.",
      choices: [{ text: "Ikut Serangan Laut (+15 Prestige, -20 Health)", effect: (p) => { p.prestige += 15; p.health = Math.max(1, p.health - 20); return "Armada hancur oleh wildfire, namun keberanian Anda dicatat sejarah."; } }] },
    { triggerYear: 303, triggerMonth: 1, id: "hw-bar-2", title: "Pawai Panjang ke Utara", type: "Panggilan Perang", sender: "Perwira Baratheon",
      desc: "Stannis memimpin pasukannya berbaris jauh ke Utara demi membantu pertahanan melawan ancaman di balik Tembok.",
      choices: [{ text: "Bertahan dalam Perjalanan (+1 Tactics, +20 EXP)", effect: (p) => { p.stats.tactics += 1; game.addJobExp(20); return "Pasukan bertahan melewati badai salju yang mematikan."; } }] }
  ],
  martell: [
    { triggerYear: 300, triggerMonth: 9, id: "hw-mar-1", title: "PANGGILAN PERANG: Balas Dendam Oberyn", type: "Panggilan Perang", sender: "Pangeran Doran Martell",
      desc: "Setelah kematian Oberyn, House Martell diam-diam menyiapkan rencana balas dendam terhadap House Lannister.",
      choices: [{ text: "Ikut Rencana Rahasia (+2 Intrigue, +15 Prestige)", effect: (p) => { p.stats.intrigue += 2; p.prestige += 15; return "Rencana rahasia House Martell mulai bergerak dalam kegelapan."; } }] },
    { triggerYear: 302, triggerMonth: 6, id: "hw-mar-2", title: "Aliansi dengan Ratu Naga", type: "Panggilan Perang", sender: "Utusan Dorne",
      desc: "House Martell mempertimbangkan aliansi dengan Daenerys Targaryen demi menjatuhkan Lannister bersama-sama.",
      choices: [{ text: "Dukung Aliansi (+1 Diplomacy, +10 Prestige)", effect: (p) => { p.stats.diplomacy += 1; p.prestige += 10; return "Dorne kini condong mendukung Ratu Naga dari seberang lautan."; } }] }
  ],
  tyrell: [
    { triggerYear: 302, triggerMonth: 10, id: "hw-tyr-1", title: "PANGGILAN PERANG: Pertahankan Highgarden", type: "Panggilan Perang", sender: "Lady Olenna Tyrell",
      desc: "Pasukan Lannister bergerak menyerbu Highgarden untuk merampas kekayaan House Tyrell.",
      choices: [
        { text: "Pertahankan Kastil (-20 Health, +15 Prestige)", effect: (p) => { p.health = Math.max(1, p.health - 20); p.prestige += 15; return "Anda bertarung sengit demi mempertahankan Highgarden."; } },
        { text: "Bantu Evakuasi Warga (+2 Stewardship, +10 Reputasi)", effect: (p) => { p.stats.stewardship += 2; p.reputation += 10; return "Banyak nyawa warga terselamatkan berkat tindakan cepat Anda."; } }
      ] }
  ],
  greyjoy: [
    { triggerYear: 299, triggerMonth: 6, id: "hw-grey-1", title: "PANGGILAN PERANG: Serbuan Pantai Utara", type: "Panggilan Perang", sender: "Kapten Ironborn",
      desc: "Armada Ironborn menyerang garis pantai Utara selagi House Stark sibuk berperang jauh dari rumah.",
      choices: [{ text: "Ikut Serbuan Pesisir (+20 Gold, +1 Combat)", effect: (p) => { p.gold += 20; p.stats.combat += 1; return "Rampasan pesisir menambah kekayaan armada Pyke."; } }] }
  ],
  velaryon: [
    { triggerYear: 299, triggerMonth: 3, id: "hw-vel-1", title: "PANGGILAN PERANG: Blokade Blackwater", type: "Panggilan Perang", sender: "Laksamana Velaryon",
      desc: "Armada Velaryon diperintahkan memblokade Blackwater Bay untuk mencegah pasokan musuh memasuki King's Landing.",
      choices: [{ text: "Pimpin Blokade Laut (+1 Tactics, +15 Prestige)", effect: (p) => { p.stats.tactics += 1; p.prestige += 15; return "Blokade laut berjalan sukses menahan bantuan musuh."; } }] }
  ],
  targaryen: [
    { triggerYear: 299, triggerMonth: 8, id: "hw-dae-1", title: "PANGGILAN: Pembebasan Astapor", type: "Kampanye Essos", sender: "Ser Jorah Mormont",
      desc: "Daenerys memerintahkan penyerangan terhadap para tuan budak di Astapor. Ser Jorah meminta Anda di garis depan bersama Unsullied yang baru dibebaskan.",
      choices: [
        { text: "⚔️ Maju bersama Unsullied", effect: (p) => {
          p.prestige += 12; p.stats.combat += 1; p.danyFavor = (p.danyFavor||0) + 8; p.warParticipation = (p.warParticipation||0)+1;
          game.addReputation(3, "Pembebasan Astapor");
          return "Astapor jatuh. Ratu mengingat keberanian Anda di depan dinding kota.";
        }},
        { text: "Amankan warga sipil (+1 Diplomacy, +favor)", effect: (p) => {
          p.stats.diplomacy += 1; p.danyFavor = (p.danyFavor||0) + 10;
          return "Anda melindungi orang-orang kecil. Missandei menyampaikan pujian Ratu kepada Anda.";
        }}
      ] },
    { triggerYear: 299, triggerMonth: 11, id: "hw-dae-1b", title: "Audiensi dengan Ratu Naga", type: "Istana Essos", sender: "Missandei",
      desc: "Setelah Astapor, Daenerys memanggil para sworn sword-nya. Ia menatap Anda dan bertanya apa yang membuat seseorang layak memimpin.",
      choices: [
        { text: "Jawab dengan kejujuran (+favor besar, +2 Diplomacy)", effect: (p) => {
          p.danyFavor = (p.danyFavor||0) + 15; p.stats.diplomacy += 2; p.prestige += 5;
          return "Ratu tersenyum tipis. 'Anda berbicara seperti orang yang pernah lapar,' katanya.";
        }},
        { text: "Tawarkan sumpah seumur hidup (+favor, +Prestige)", effect: (p) => {
          p.danyFavor = (p.danyFavor||0) + 12; p.prestige += 8;
          return "Sumpah Anda diterima. Ser Jorah mengangguk hormat dari samping tahta.";
        }}
      ] },
    { triggerYear: 300, triggerMonth: 1, id: "hw-dae-2", title: "Penaklukan Yunkai", type: "Kampanye Essos", sender: "Daario Naharis",
      desc: "Yunkai dikepung. Daario menantang Anda membuktikan nilai di medan tempur, sementara Ratu menunggu hasilnya.",
      choices: [
        { text: "⚔️ Pimpin serangan gerbang", effect: (p) => {
          const r = game.resolveDuel(p, 14, "Kapten Yunkai", { winPrestige: 10, winCombat: 1, winExp: 25, loseHealth: 16 });
          p.danyFavor = (p.danyFavor||0) + 6; p.warParticipation = (p.warParticipation||0)+1;
          return r + " Yunkai menyerah. Nama Anda disebut di tenda Ratu.";
        }},
        { text: "Negosiasi penyerahan (+Diplomacy, +favor)", effect: (p) => {
          p.stats.diplomacy += 2; p.danyFavor = (p.danyFavor||0) + 8; game.addJobExp(15);
          return "Anda membantu menyusun syarat penyerahan. Darah lebih sedikit tertumpah.";
        }}
      ] },
    { triggerYear: 300, triggerMonth: 6, id: "hw-dae-2b", title: "Ser Barristan Selmy Bergabung", type: "Istana Essos", sender: "Ser Barristan the Bold",
      desc: "Seorang ksatria tua membuka helmnya di depan Ratu: Ser Barristan Selmy, mantan Lord Commander Kingsguard. Ia menawarkan sumpah. Ratu meminta pendapat Anda.",
      choices: [
        { text: "Dukung penerimaan Barristan (+favor, +Prestige)", effect: (p) => {
          p.danyFavor = (p.danyFavor||0) + 10; p.prestige += 6; p.stats.diplomacy += 1;
          return "Barristan diterima. Ia memandang Anda sebagai rekan yang layak dihormati.";
        }},
        { text: "Desak ujian kesetiaan dulu (+Intrigue)", effect: (p) => {
          p.stats.intrigue += 1; p.danyFavor = (p.danyFavor||0) + 4;
          return "Ratu menguji Barristan. Ia lulus. Hubungan Anda dengan sang ksatria tua tetap formal.";
        }}
      ] },
    { triggerYear: 302, triggerMonth: 5, id: "hw-dae-3", title: "PERANG: Perebutan Meereen", type: "Kampanye Essos", sender: "Daenerys Targaryen",
      desc: "Gerbang Meereen. Ratu menunggangi Drogon di langit. Barristan memimpin serangan darat dan meminta Anda di sisinya.",
      choices: [
        { text: "⚔️ Serbu bersama Barristan", effect: (p) => {
          let msg;
          if (p.men >= 5) msg = game.resolveBattle(p, 20, "Garnisun Meereen", { winPrestige: 20, winGold: 40, winCombat: 1 });
          else msg = game.resolveDuel(p, 16, "Kapten Garnisun Meereen", { winPrestige: 18, winExp: 30, winCombat: 1, loseHealth: 18 });
          p.danyFavor = (p.danyFavor||0) + 15; p.warParticipation = (p.warParticipation||0)+1;
          game.addReputation(4, "Penaklukan Meereen");
          return msg + " Meereen jatuh. Ratu berdiri di puncak piramida.";
        }},
        { text: "Amankan rantai & logistik (+Stewardship)", effect: (p) => {
          p.stats.stewardship += 2; p.danyFavor = (p.danyFavor||0) + 8; game.addJobExp(20);
          return "Pasokan aman. Barristan memuji disiplin Anda di belakang garis.";
        }}
      ] },
    { triggerYear: 302, triggerMonth: 8, id: "hw-dae-3b", title: "Undangan Lingkaran Dalam", type: "Istana Essos", sender: "Daenerys Targaryen",
      desc: "Di ruang peta Meereen, Ratu, Barristan, Missandei, dan Grey Worm membahas pemerintahan. Jika favor Anda cukup tinggi, Ratu menawarkan kursi di lingkaran dalamnya.",
      choices: [
        { text: "Terima — jadi bagian inti Ratu (syarat favor ≥ 40)", effect: (p) => {
          if ((p.danyFavor||0) < 40) return "Ratu mengangguk sopan, namun kursi itu belum untuk Anda. Tingkatkan jasa dulu.";
          p.innerCircle = true; p.title = "Advisor & Sworn Sword of the Queen";
          p.prestige += 15; p.stats.diplomacy += 2; game.grantTrait("queens_inner");
          game.addReputation(8, "Diangkat ke Lingkaran Dalam Ratu");
          return "Barristan menepuk bahu Anda. 'Selamat datang di sisi Ratu yang sejati.' Anda kini setara penasihat inti.";
        }},
        { text: "Tetap di garis militer saja", effect: (p) => {
          p.stats.combat += 1; p.danyFavor = (p.danyFavor||0) + 5;
          return "Anda memilih medan tempur. Ratu menghormati pilihan itu.";
        }}
      ] },
    { triggerYear: 303, triggerMonth: 4, id: "hw-dae-3c", title: "Konspirasi Sons of the Harpy", type: "Intrik Meereen", sender: "Grey Worm",
      desc: "Pembunuhan malam hari menarget pejabat Ratu. Grey Worm meminta bantuan menyelidiki atau memburu para Harpy.",
      choices: [
        { text: "Burui di lorong malam (+Intrigue, +favor)", effect: (p) => {
          p.stats.intrigue += 2; p.danyFavor = (p.danyFavor||0) + 8; game.addJobExp(15);
          return "Beberapa topeng Harpy jatuh. Kota sedikit lebih aman.";
        }},
        { text: "Jaga Barristan & Ratu secara langsung", effect: (p) => {
          p.prestige += 5; p.danyFavor = (p.danyFavor||0) + 10;
          return "Tidak ada pisau yang mendekati Ratu malam itu. Barristan menghormati kewaspadaan Anda.";
        }}
      ] },
    { triggerYear: 305, triggerMonth: 2, id: "hw-dae-4a", title: "Rapat Perang: Menuju Westeros", type: "Kampanye Essos", sender: "Tyrion Lannister (Hand)",
      desc: "Armada siap. Tyrion, Barristan, dan Ratu merencanakan pendaratan. Sebagai bagian dari lingkaran (atau sworn sword senior), Anda diminta suara.",
      choices: [
        { text: "Dukung pendaratan di Dragonstone", effect: (p) => {
          p.stats.tactics += 1; p.danyFavor = (p.danyFavor||0) + 6; p.prestige += 5;
          return "Rencana disetujui. Naga akan menyentuh batu leluhur Targaryen terlebih dulu.";
        }},
        { text: "Desak aliansi Utara dulu (+Diplomacy)", effect: (p) => {
          p.stats.diplomacy += 1; p.danyFavor = (p.danyFavor||0) + 5;
          return "Tyrion mengangguk. Diplomasi ke Utara akan dicoba bersamaan dengan armada.";
        }}
      ] },
    { triggerYear: 305, triggerMonth: 5, id: "hw-dae-4", title: "PERANG AKHIR: Serangan King's Landing", type: "Kampanye Essos", sender: "Daenerys Targaryen",
      desc: "Langit merah di atas ibukota. Drogon meraung. Ratu memberi Anda kehormatan memimpin satu sayap serangan darat bersama Barristan (atau sisa loyalis).",
      choices: [
        { text: "⚔️ Pimpin sayap serangan", effect: (p) => {
          let msg;
          if (p.men >= 8) msg = game.resolveBattle(p, 25, "Pasukan Cersei", { winPrestige: 30, winGold: 100, winCombat: 2 });
          else msg = game.resolveDuel(p, 18, "Ksatria Lannister", { winPrestige: 25, winGold: 60, winCombat: 1, loseHealth: 22 });
          p.danyFavor = (p.danyFavor||0) + 20; p.warParticipation = (p.warParticipation||0)+1;
          p.prestige += 10; game.addReputation(6, "Pertempuran King's Landing");
          if (p.innerCircle) p.title = "Lord Commander of the Queen's Guard";
          return msg + " Kota jatuh. Sejarah mencatat nama Anda di sisi Ratu Naga.";
        }},
        { text: "Amankan warga & tahan penjarahan", effect: (p) => {
          p.stats.diplomacy += 2; p.reputation += 10; p.danyFavor = (p.danyFavor||0) + 12;
          return "Anda menahan pasukan dari pembantaian. Beberapa akan mengingat belas kasihan itu.";
        }}
      ] }
  ]
};

/* --------------------------------------------------------------------------
   RANDOM TRAVEL EVENTS
   -------------------------------------------------------------------------- */
const travelEvents = [
  { id: "tr1", title: "Penyergapan Bandit di Jalan", type: "Event Perjalanan", sender: "Pengawal Rombongan",
    desc: "Sekelompok bandit menghadang rombongan Anda di tengah perjalanan. Pedang sudah terhunus.",
    choices: [
      { text: "⚔️ DUEL — Lawan kepala bandit!", effect: (p) => game.resolveDuel(p, 12, "Kepala Bandit", { winPrestige: 3, winGold: 18, winCombat: 1, loseHealth: 18 }) },
      { text: "Bayar upeti jalan (-15 Gold)", effect: (p) => { p.gold = Math.max(0, p.gold - 15); return "Anda membayar upeti agar perjalanan tidak terganggu."; } },
      { text: "Coba kabur (-5 Health jika gagal)", effect: (p) => {
        if (Math.random() < 0.55) return "Anda berhasil menyelinap lewat semak dan menghindari bentrokan.";
        p.health = Math.max(1, p.health - 5);
        return "Anda tertangkap saat kabur dan mendapat beberapa luka.";
      }}
    ] },
  { id: "tr2", title: "Badai di Laut Sempit", type: "Event Perjalanan", sender: "Kapten Kapal",
    desc: "Kapal Anda diterjang badai besar saat menyeberangi Laut Sempit menuju Essos.",
    choices: [
      { text: "Bantu awak kapal (+1 Tactics)", effect: (p) => { p.stats.tactics += 1; return "Kapal berhasil selamat berkat kerja sama seluruh awak."; } },
      { text: "Berlindung di kabin (-5 Health)", effect: (p) => { p.health = Math.max(1, p.health - 5); return "Anda mabuk laut namun selamat sampai tujuan."; } }
    ] },
  { id: "tr3", title: "Pedagang Kaya di Perjalanan", type: "Event Perjalanan", sender: "Kafilah Dagang",
    desc: "Sebuah kafilah dagang menawarkan barang langka dengan harga murah selama perjalanan.",
    choices: [
      { text: "Beli barang dagangan (-10 Gold, +1 Stewardship)", effect: (p) => { p.gold = Math.max(0, p.gold - 10); p.stats.stewardship += 1; return "Anda mendapat wawasan baru dari perdagangan di jalan."; } },
      { text: "Lewati saja", effect: () => "Anda melanjutkan perjalanan tanpa singgah." }
    ] },
  { id: "tr4", title: "Tantangan Duel di Pinggir Jalan", type: "Event Perjalanan", sender: "Ksatria Pengembara",
    desc: "Seorang ksatria berbaju zirah menantang Anda duel demi kehormatan di pinggir Kingsroad. Penonton sudah berkumpul.",
    choices: [
      { text: "⚔️ TERIMA DUEL", effect: (p) => game.resolveDuel(p, 14, "Ksatria Pengembara", { winPrestige: 6, winGold: 10, winCombat: 1, loseHealth: 22, losePrestige: 2 }) },
      { text: "Tolak dengan sopan (+1 Diplomacy)", effect: (p) => { p.stats.diplomacy += 1; return "Ksatria menghormati penolakan Anda dan melanjutkan perjalanan."; } }
    ] }
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
    const troopsEl = document.getElementById('res-troops');
    if (troopsEl) troopsEl.innerText = state.player.men;
    document.getElementById('res-talent-pts').innerText = state.player.talentPoints;
    document.getElementById('res-date').innerText = `${state.date.year} AC, M${state.date.month}`;

    const locName = game.getLocationName(state.player.currentLocation) || "-";
    document.getElementById('res-location').innerText = state.travel.inProgress ? "Dalam Perjalanan..." : locName;

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

    // Traits display di inventory area
    const inv = document.getElementById('inventory-list');
    if (inv) {
      const traits = state.player.traits || [];
      let html = '';
      if (traits.length === 0) {
        html = '<span class="empty-tag">Belum ada trait — selesaikan duel, misi, atau perjalanan untuk membukanya</span>';
      } else {
        traits.forEach(tid => {
          const def = state.traitDefs.find(t => t.id === tid);
          if (def) html += `<span class="inventory-tag trait-tag" title="${def.desc}">🏅 ${def.name}</span>`;
        });
      }
      if (state.player.mercenaryCompany) {
        const co = state.mercenaryCompanies.find(c => c.id === state.player.mercenaryCompany);
        if (co) html += `<span class="inventory-tag" style="border-color:var(--fm-red-accent);">⚔️ ${co.name}</span>`;
      }
      inv.innerHTML = html;
    }
  },

  renderNobleOffers() {
    const container = document.getElementById('noble-offers-list');
    container.innerHTML = '';

    const visibleHouses = state.nobleHouses.filter(house =>
      house.continent === state.player.continent || state.player.activeNobleHouse === house.id
    );

    if (visibleHouses.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">Tidak ada House Agung yang menerima pengabdian di wilayah ini. Cobalah berpindah lokasi lewat menu Perjalanan.</p>`;
      return;
    }

    visibleHouses.forEach(house => {
      let reqPrestigeAdj = house.reqPrestige;
      if (state.player.unlockedTalents.includes("t6")) reqPrestigeAdj -= 2;
      if (state.player.region === house.region) reqPrestigeAdj -= 1;

      const meetsPrestige = state.player.prestige >= reqPrestigeAdj;
      const meetsRep = state.player.reputation >= house.reqReputation;
      const inRightPlace = house.continent === state.player.continent;
      const isEligible = meetsPrestige && meetsRep && inRightPlace;
      const isServing = state.player.activeNobleHouse === house.id;

      const card = document.createElement('div');
      card.className = `job-card ${isServing ? 'active-job' : ''} ${house.continent === 'essos' ? 'essos-job-card' : ''}`;
      card.innerHTML = `
        <div>
          <div class="job-name">${house.sigil} ${house.name} (${house.region})</div>
          <div style="font-size:0.75rem; color:var(--vic-gold-mid); font-style:italic; margin-bottom:4px;">"${house.motto}"</div>
          <div class="job-desc">${house.story}</div>
        </div>
        <div>
          <div class="job-perks">Gelar: ${house.titleOffer} (+${house.monthlyPay} Gold/bln)</div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
            Syarat: Prestige ≥ ${reqPrestigeAdj} | Reputasi ≥ ${house.reqReputation} ${!inRightPlace && !isServing ? '| Harus berada di ' + (house.continent === 'essos' ? 'Essos' : 'Westeros') : ''}
          </div>
        </div>
        <button class="v-btn" onclick="game.acceptNobleOffer('${house.id}')" ${!isEligible || isServing ? 'disabled' : ''}>
          ${isServing ? 'Mengabdi Sebagai Sworn Sword' : isEligible ? 'Sumpah Setia & Mengabdi' : 'Syarat Belum Terpenuhi'}
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
      const rel = state.player.lordRelation || 50;
      let relColor = rel >= 70 ? '#02c39a' : rel >= 40 ? '#f0c961' : '#ff6b6b';
      let relLabel = rel >= 80 ? 'Sangat Dekat' : rel >= 60 ? 'Baik' : rel >= 40 ? 'Netral' : rel >= 20 ? 'Dingin' : 'Buruk';
      const married = state.player.marriedTo
        ? `<div style="margin-top:8px;font-size:0.8rem;color:var(--vic-gold-bright);">💍 Menikah dengan ${state.player.marriedTo.name} (${state.player.marriedTo.house})</div>`
        : '';
      const danyLine = state.player.activeNobleHouse === 'targaryen'
        ? `<div style="margin-top:6px;font-size:0.78rem;color:#c4b5fd;">Favor Ratu Daenerys: <strong>${state.player.danyFavor||0}</strong>${state.player.innerCircle ? ' · 👑 LINGKARAN DALAM' : ''}</div>`
        : '';

      // Buildings list
      let bHtml = '';
      state.buildingDefs.forEach(def => {
        const owned = state.player.buildings[def.id] || 0;
        const canBuild = owned < def.max && state.player.gold >= def.cost && state.player.prestige >= def.prestigeReq;
        bHtml += `<div class="troop-stat-line" style="flex-wrap:wrap;gap:6px;">
          <span><strong>${def.name}</strong> (${owned}/${def.max}) — ${def.cost}G, Prestige≥${def.prestigeReq}<br><span style="font-size:0.72rem;color:var(--text-muted)">${def.desc}</span></span>
          <button class="v-btn" onclick="game.buildStructure('${def.id}')" ${canBuild ? '' : 'disabled'}>Bangun</button>
        </div>`;
      });

      container.innerHTML = `
        <div style="background:#0d0a08; border:1px solid var(--vic-gold-mid); padding:15px; border-radius:3px; margin-bottom:14px;">
          <h3 style="color:var(--vic-gold-bright); font-family:var(--font-cinzel);">⚜️ House ${state.player.vassalHouseName}</h3>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px;">Vassal dari <strong>${house.name}</strong></p>
          <div style="margin-top:8px; font-size:0.82rem;">Relasi dengan Lord: <strong style="color:${relColor}">${rel}/100 (${relLabel})</strong></div>
          <div style="font-size:0.8rem; color:var(--fm-green-accent); margin-top:4px;">Bonus Prestise Bulanan: +2</div>
          ${danyLine}${married}
        </div>
        <div style="background:#0d0a08; border:1px solid var(--vic-mahogany-border); padding:15px; border-radius:3px; margin-bottom:14px;">
          <h4 style="color:var(--vic-gold-bright); font-family:var(--font-cinzel); margin-bottom:10px;">🏗️ PEMBANGUNAN WILAYAH</h4>
          <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:10px;">Bangun desa, menara, pasar, hingga kastil. Membutuhkan emas & prestige.</p>
          ${bHtml}
        </div>
        <div style="background:#0d0a08; border:1px solid var(--vic-mahogany-border); padding:15px; border-radius:3px;">
          <h4 style="color:var(--vic-gold-bright); font-family:var(--font-cinzel); margin-bottom:10px;">👑 AKSI PRESTIGE</h4>
          <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:10px;">Gunakan Prestige untuk audiensi, hadiah, turnamen, atau petisi tanah.</p>
          <div class="military-action-row">
            <button class="v-btn" onclick="game.prestigeAction('audience')" ${state.player.prestige < 8 ? 'disabled' : ''}>Audiensi Lord (8 Prestige)</button>
            <button class="v-btn" onclick="game.prestigeAction('gift_lord')" ${state.player.prestige < 5 || state.player.gold < 40 ? 'disabled' : ''}>Hadiah Lord (5 Prestige + 40G)</button>
            <button class="v-btn" onclick="game.prestigeAction('tourney')" ${state.player.prestige < 12 ? 'disabled' : ''}>Turnamen Kecil (12 Prestige)</button>
            <button class="v-btn" onclick="game.prestigeAction('petition_land')" ${state.player.prestige < 20 ? 'disabled' : ''}>Petisi Tanah (20 Prestige)</button>
            <button class="v-btn" onclick="game.prestigeAction('feast')" ${state.player.prestige < 15 || !(state.player.buildings.great_hall > 0) ? 'disabled' : ''}>Feast di Balai Agung (15 Prestige)</button>
          </div>
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

      const houseTag = state.player.activeNobleHouse && currentJobObj.id === 'knight_vassal'
        ? `<span class="campaign-banner">Alur Perang: ${state.nobleHouses.find(h => h.id === state.player.activeNobleHouse).name}</span>`
        : '';
      let companyTag = '';
      let incomeDisplay = currentRank.income;
      if (currentJobObj.id === 'mercenary' && state.player.mercenaryCompany) {
        const co = state.mercenaryCompanies.find(c => c.id === state.player.mercenaryCompany);
        if (co) {
          companyTag = `<span class="campaign-banner" style="border-color:var(--fm-red-accent);background:linear-gradient(180deg,#2a0a0a,#150404);">${co.name}</span>`;
          incomeDisplay = Math.floor(currentRank.income * (co.incomeMult || 1));
        }
      }

      activePanel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <h3 style="color:var(--vic-gold-bright); font-family:var(--font-cinzel);">${currentJobObj.title} — ${currentRank.name} ${houseTag}${companyTag}</h3>
            <div style="font-size:0.75rem; color:var(--fm-green-accent);">Gaji Bulanan: +${incomeDisplay} Gold</div>
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
      if (job.id === 'knight_vassal') return;

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

    const categories = [...new Set(state.shopItems.map(i => i.category))];

    categories.forEach(cat => {
      const title = document.createElement('div');
      title.className = 'shop-category-title';
      title.style.gridColumn = '1 / -1';
      title.innerText = cat;
      container.appendChild(title);

      state.shopItems.filter(i => i.category === cat).forEach(item => {
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
      const isHere = state.player.currentLocation === p.id;
      const card = document.createElement('div');
      card.className = `province-card ${isHere ? 'active-region' : ''}`;
      card.innerHTML = `
        <h4 style="color:var(--vic-gold-bright); font-family:var(--font-cinzel);">${p.name} ${isHere ? '📍' : ''}</h4>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Penguasa: ${p.owner}</div>
        <div style="font-size:0.75rem; color:var(--fm-green-accent); margin-top:4px;">Pajak Bulanan: +${p.tax} Gold</div>
      `;
      grid.appendChild(card);
    });
  },

  renderTravel() {
    const statusPanel = document.getElementById('travel-status-panel');
    if (state.travel.inProgress) {
      statusPanel.innerHTML = `
        <div class="travel-status-active">
          <div>
            <div style="color:var(--vic-gold-bright); font-family:var(--font-cinzel); font-size:0.95rem;">Sedang dalam perjalanan menuju ${game.getLocationName(state.travel.destinationId)}</div>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">Estimasi tiba dalam ${state.travel.monthsLeft} bulan lagi.</div>
          </div>
          <div style="font-size:1.5rem;">${state.travel.destContinent === 'essos' ? '⛵' : '🐎'}</div>
        </div>
      `;
    } else {
      statusPanel.innerHTML = `
        <div style="font-size:0.85rem; color:var(--text-muted);">
          Anda saat ini berada di <strong style="color:var(--vic-gold-bright);">${game.getLocationName(state.player.currentLocation)}</strong>
          (${state.player.continent === 'essos' ? 'Essos' : 'Westeros'}).
        </div>
      `;
    }

    const westerosGrid = document.getElementById('travel-westeros-grid');
    westerosGrid.innerHTML = '';
    state.provinces.forEach(loc => {
      const isHere = state.player.currentLocation === loc.id && !state.travel.inProgress;
      const cost = game.getTravelCost('westeros');
      const card = document.createElement('div');
      card.className = `location-card ${isHere ? 'current-location' : ''}`;
      card.innerHTML = `
        <div class="location-name">${loc.name}</div>
        <div class="location-owner">${loc.owner}</div>
        <div class="location-meta">${loc.region}</div>
        ${isHere ? '<span class="here-tag">Anda di sini</span>' :
          `<button class="v-btn" onclick="game.travelTo('${loc.id}','westeros')" ${state.travel.inProgress || state.player.gold < cost.gold ? 'disabled' : ''}>Berkuda ke sini (${cost.gold}G, ${cost.months} bln)</button>`}
      `;
      westerosGrid.appendChild(card);
    });

    const essosGrid = document.getElementById('travel-essos-grid');
    essosGrid.innerHTML = '';
    state.essosLocations.forEach(loc => {
      const isHere = state.player.currentLocation === loc.id && !state.travel.inProgress;
      const cost = game.getTravelCost('essos');
      const card = document.createElement('div');
      card.className = `location-card ${isHere ? 'current-location' : ''}`;
      card.innerHTML = `
        <div class="location-name">${loc.name}</div>
        <div class="location-owner">${loc.desc}</div>
        ${isHere ? '<span class="here-tag">Anda di sini</span>' :
          `<button class="v-btn" onclick="game.travelTo('${loc.id}','essos')" ${state.travel.inProgress || state.player.gold < cost.gold ? 'disabled' : ''}>Berlayar ke sini (${cost.gold}G, ${cost.months} bln)</button>`}
      `;
      essosGrid.appendChild(card);
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
  },

  renderMilitary() {
    const dash = document.getElementById('military-dashboard');
    if (!dash) return;
    const p = state.player;
    const upkeep = p.unlockedTalents.includes('t3') ? Math.floor(p.men * 0.25) : Math.floor(p.men * 0.5);
    dash.innerHTML = `
      <div class="v-card" style="margin:0;">
        <div class="card-header">KEKUATAN PASUKAN</div>
        <div class="troop-stat-line"><span>Prajurit Aktif</span><strong class="military-color">${p.men}</strong></div>
        <div class="troop-stat-line"><span>Biaya Upkeep / Bulan</span><strong>${upkeep} Gold</strong></div>
        <div class="troop-stat-line"><span>Combat / Tactics</span><strong>${p.stats.combat} / ${p.stats.tactics}</strong></div>
        <p style="font-size:0.78rem; color:var(--text-muted); margin-top:10px;">Pasukan digunakan untuk skirmish, kampanye perang House, dan menjaga tanah. Kalahkan lawan di medan tempur untuk Prestige & Gold.</p>
        <div class="military-action-row">
          <button class="v-btn" onclick="game.recruitMen(5, 25)">Rekrut 5 Prajurit (25G)</button>
          <button class="v-btn" onclick="game.recruitMen(10, 45)">Rekrut 10 Prajurit (45G)</button>
          <button class="v-btn" onclick="game.trainTroops()" ${p.men < 1 || p.gold < 10 ? 'disabled' : ''}>Latih Pasukan (10G)</button>
        </div>
      </div>
      <div class="v-card" style="margin:0;">
        <div class="card-header">AKSI PERANG & SKIRMISH</div>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px;">Pimpin pasukan ke medan tempur kecil. Hasil ditentukan oleh jumlah prajurit + Combat & Tactics + keberuntungan dadu.</p>
        <button class="skirmish-btn" onclick="game.startSkirmish()" ${p.men < 3 || p.health < 25 ? 'disabled' : ''}>⚔️ Mulai Skirmish (min. 3 prajurit)</button>
        <div style="margin-top:14px; font-size:0.75rem; color:var(--text-muted);">
          <strong style="color:var(--vic-gold-bright);">Tips:</strong> Naikkan Combat lewat duel di event pekerjaan / perjalanan. Talent "Kepemimpinan Veteran" mengurangi upkeep 50%.
        </div>
      </div>
    `;
  },

  renderAll() {
    ui.renderTopBar();
    ui.renderProfile();
    ui.renderNobleOffers();
    ui.renderVassalHousePanel();
    ui.renderJobs();
    ui.renderShop();
    ui.renderLandPanel();
    ui.renderResearchAndTalents();
    ui.renderProvinces();
    ui.renderTravel();
    ui.renderInbox();
    ui.renderMilitary();
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
    state.player.currentLocation = state.homeRegionToLocation[state.player.region] || "winterfell";
    state.player.continent = "westeros";

    document.getElementById('creation-modal').remove();
    document.getElementById('game-interface').classList.remove('hidden');

    state.inbox.push({
      id: "init",
      title: "Selamat Datang di Westeros (298 AC)",
      sender: "Surat Grand Maester",
      type: "Mulai Petualangan",
      date: `${state.date.year} AC, M${state.date.month}`,
      desc: `King Robert Baratheon bertakhta di Iron Throne. Bangun reputasi Anda di ${state.player.region}, kumpulkan tanah, abdi pada House Great Westeros, dan raih kekuasaan. Anda juga bisa berlayar menyeberangi Laut Sempit menuju Essos jika ingin mencari peruntungan lain.`,
      choices: [{ text: "Mulai Petualangan", effect: () => "Catatan sejarah Anda dimulai." }],
      read: false
    });

    ui.renderAll();
    ui.addLog(`Karir Anda dimulai di ${game.getLocationName(state.player.currentLocation)} sebagai ${state.player.title}.`);
  },

  getLocationName(locId) {
    const w = state.provinces.find(p => p.id === locId);
    if (w) return w.name;
    const e = state.essosLocations.find(p => p.id === locId);
    if (e) return e.name;
    return locId;
  },

  getTravelCost(destContinent) {
    if (destContinent === state.player.continent) {
      return { gold: 15, months: 1 };
    }
    return { gold: 70, months: 3 };
  },

  travelTo(destId, destContinent) {
    if (state.travel.inProgress) {
      ui.addLog("Anda sedang dalam perjalanan dan tidak bisa memulai perjalanan baru.");
      return;
    }
    if (destId === state.player.currentLocation) {
      ui.addLog("Anda sudah berada di lokasi tersebut.");
      return;
    }

    const cost = game.getTravelCost(destContinent);
    if (state.player.gold < cost.gold) {
      ui.addLog("Emas tidak cukup untuk membiayai perjalanan ini.");
      return;
    }

    state.player.gold -= cost.gold;
    state.travel.inProgress = true;
    state.travel.destinationId = destId;
    state.travel.destContinent = destContinent;
    state.travel.monthsLeft = cost.months;

    ui.addLog(`Anda memulai perjalanan menuju ${game.getLocationName(destId)}. Estimasi tiba dalam ${cost.months} bulan.`);
    ui.renderAll();
  },

  processTravel() {
    if (!state.travel.inProgress) return;

    if (Math.random() < 0.35) {
      const evt = travelEvents[Math.floor(Math.random() * travelEvents.length)];
      state.inbox.unshift({ ...evt, date: `${state.date.year} AC, M${state.date.month}`, read: false });
      ui.addLog(`KEJADIAN DI PERJALANAN: ${evt.title}`);
    }

    state.travel.monthsLeft -= 1;
    if (state.travel.monthsLeft <= 0) {
      state.player.currentLocation = state.travel.destinationId;
      state.player.continent = state.travel.destContinent;
      state.travel.inProgress = false;

      ui.addLog(`Anda tiba di ${game.getLocationName(state.player.currentLocation)}.`);

      if (state.player.continent === 'essos' && !state.player.hasVisitedEssos) {
        state.player.hasVisitedEssos = true;
        game.grantTrait("essos_voyager");
        state.inbox.unshift({
          id: `essos-arrival-${Date.now()}`,
          title: "Menginjakkan Kaki di Essos",
          sender: "Kapten Kapal Dagang",
          type: "Peristiwa Perjalanan",
          date: `${state.date.year} AC, M${state.date.month}`,
          desc: "Anda kini berada di seberang Laut Sempit. Kabar tentang Daenerys Targaryen, Ibu Naga, terdengar di seluruh Free Cities. Jika berminat, Anda dapat menawarkan pengabdian kepadanya melalui menu Tawaran Great Houses (hanya muncul saat Anda berada di Essos).",
          choices: [{ text: "Pahami Situasi", effect: () => "Petualangan baru menanti di tanah asing ini. Trait Pengelana Essos terbuka." }],
          read: false
        });
      }
    }
  },

  applyAgingGrowth() {
    const p = state.player;
    const statKeys = Object.keys(p.stats);
    const pick = () => statKeys[Math.floor(Math.random() * statKeys.length)];

    if (p.age <= 30) {
      const s1 = pick();
      p.stats[s1] += 1;
      ui.addLog(`ULANG TAHUN (${p.age} tahun): Masa muda Anda berkembang pesat. +1 ${s1.toUpperCase()}.`);
    } else if (p.age <= 50) {
      if (Math.random() < 0.6) {
        const s1 = pick();
        p.stats[s1] += 1;
        ui.addLog(`ULANG TAHUN (${p.age} tahun): Pengalaman menambah kemampuan Anda. +1 ${s1.toUpperCase()}.`);
      } else {
        ui.addLog(`ULANG TAHUN (${p.age} tahun): Tidak ada perubahan berarti pada kemampuan Anda tahun ini.`);
      }
    } else {
      const decayKeys = ["combat", "tactics"];
      const growthKeys = ["stewardship", "intrigue", "diplomacy"];
      if (Math.random() < 0.5) {
        const dKey = decayKeys[Math.floor(Math.random() * decayKeys.length)];
        p.stats[dKey] = Math.max(1, p.stats[dKey] - 1);
        const gKey = growthKeys[Math.floor(Math.random() * growthKeys.length)];
        p.stats[gKey] += 1;
        ui.addLog(`ULANG TAHUN (${p.age} tahun): Usia mulai terasa. -1 ${dKey.toUpperCase()}, namun +1 ${gKey.toUpperCase()} dari kebijaksanaan.`);
      } else {
        ui.addLog(`ULANG TAHUN (${p.age} tahun): Anda menua dengan tenang tanpa perubahan besar.`);
      }
    }
  },

  acceptNobleOffer(houseId) {
    const house = state.nobleHouses.find(h => h.id === houseId);
    if (!house) return;

    if (house.continent !== state.player.continent) {
      ui.addLog(`Anda harus berada di ${house.continent === 'essos' ? 'Essos' : 'Westeros'} untuk mengabdi pada ${house.name}.`);
      return;
    }

    state.player.activeNobleHouse = house.id;
    state.player.currentJob = "knight_vassal";
    state.player.jobRankIndex = 0;
    state.player.jobExp = 0;
    state.player.mercenaryCompany = null;
    state.player.title = house.titleOffer;
    state.player.prestige += 5;
    state.player.reputation += 5;
    state.player.lordRelation = 55;
    if (house.id === "targaryen") state.player.danyFavor = (state.player.danyFavor || 0) + 5;
    game.grantTrait("trusted_sword");
    if (house.id === "targaryen") game.grantTrait("essos_voyager");

    ui.addLog(`SUMPAH SETIA: Anda berhenti dari job sebelumnya & resmi diangkat sebagai ${house.titleOffer} di bawah ${house.name}! Anda kini dapat dipanggil untuk kampanye perang mengikuti alur cerita mereka.`);
    ui.renderAll();
  },

  requestVassalHousePermission() {
    const houseNameInput = document.getElementById('vassal-house-input');
    if (!houseNameInput || !houseNameInput.value.trim()) {
      alert("Harap masukkan nama House baru Anda!");
      return;
    }

    const houseName = houseNameInput.value.trim();
    const activeHouse = state.nobleHouses.find(h => h.id === state.player.activeNobleHouse);

    state.player.vassalHouseName = houseName;
    state.player.gold -= 150;
    state.player.prestige += 15;
    state.player.title = `Lord of House ${houseName} (Vassal to ${activeHouse.name})`;

    ui.addLog(`IZIN DISETUJUI: Lord ${activeHouse.name} menyetujui pendirian House ${houseName} di atas tanah Anda!`);
    ui.renderAll();
  },

  selectJob(jobId) {
    const selectedJob = state.jobs.find(j => j.id === jobId);
    if (!selectedJob) return;

    // Jika memilih Tentara Bayaran, tampilkan pilihan Free Company dulu
    if (jobId === "mercenary") {
      game.showMercenaryCompanyPicker();
      return;
    }

    state.player.currentJob = jobId;
    state.player.jobRankIndex = 0;
    state.player.jobExp = 0;
    state.player.mercenaryCompany = null;

    ui.renderAll();
    ui.addLog(`Kontrak ditandatangani: Bekerja sebagai ${selectedJob.title}.`);
  },

  showMercenaryCompanyPicker() {
    // Pakai event modal sebagai pemilih company
    const overlay = document.getElementById('event-modal-overlay');
    document.getElementById('modal-event-sender').innerText = "FREE COMPANIES";
    document.getElementById('modal-event-title').innerText = "Pilih Perusahaan Bayaran";
    document.getElementById('modal-event-desc').innerText =
      "Beberapa Free Company membuka rekrutmen. Pilih satu yang sesuai gaya bertempur dan moral Anda. Pilihan ini memengaruhi bonus atribut, pendapatan, dan reputasi.";

    const box = document.getElementById('modal-event-choices');
    box.innerHTML = '';
    state.mercenaryCompanies.forEach(co => {
      const btn = document.createElement('button');
      btn.className = 'v-btn choice-btn';
      const bits = [];
      if (co.bonusCombat) bits.push('+' + co.bonusCombat + ' Combat');
      if (co.bonusTactics) bits.push('+' + co.bonusTactics + ' Tactics');
      if (co.bonusIntrigue) bits.push('+' + co.bonusIntrigue + ' Intrigue');
      bits.push('Pendapatan x' + co.incomeMult);
      if (co.startMen) bits.push('+' + co.startMen + ' prajurit');
      if (co.repOnJoin) bits.push((co.repOnJoin > 0 ? '+' : '') + co.repOnJoin + ' Reputasi');
      btn.innerHTML = `<strong>${co.name}</strong><br><span style="font-size:0.75rem;color:var(--text-muted)">"${co.motto}" — ${co.desc}</span><br><span style="font-size:0.72rem;color:var(--fm-green-accent)">${bits.join(' · ')}</span>`;
      btn.onclick = () => game.joinMercenaryCompany(co.id);
      box.appendChild(btn);
    });
    const cancel = document.createElement('button');
    cancel.className = 'v-btn choice-btn';
    cancel.innerText = 'Batal — kembali ke daftar pekerjaan';
    cancel.onclick = () => {
      overlay.classList.add('hidden');
    };
    box.appendChild(cancel);
    overlay.classList.remove('hidden');
  },

  joinMercenaryCompany(companyId) {
    const co = state.mercenaryCompanies.find(c => c.id === companyId);
    if (!co) return;

    state.player.currentJob = "mercenary";
    state.player.jobRankIndex = 0;
    state.player.jobExp = 0;
    state.player.mercenaryCompany = companyId;

    if (co.bonusCombat) state.player.stats.combat += co.bonusCombat;
    if (co.bonusTactics) state.player.stats.tactics += co.bonusTactics;
    if (co.bonusIntrigue) state.player.stats.intrigue += co.bonusIntrigue;
    if (co.startMen) state.player.men += co.startMen;
    if (co.repOnJoin) state.player.reputation += co.repOnJoin;

    document.getElementById('event-modal-overlay').classList.add('hidden');
    ui.renderAll();
    ui.addLog(`Anda bergabung dengan ${co.name} ("${co.motto}"). ${co.startMen ? '+' + co.startMen + ' prajurit. ' : ''}Siap menerima kontrak bayaran.`);
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
        game.addReputation(3, "Promosi jabatan");

        ui.addLog(`PROMOSI! Anda naik pangkat menjadi ${currentJobObj.ranks[state.player.jobRankIndex].name}! (+${prestigeBonus} Prestige, +3 Reputasi)`);
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
    ui.renderMilitary();
    ui.addLog(`Merekrut ${amount} prajurit.`);
  },

  /**
   * Resolve a 1v1 duel. Returns narrative string for event log / choice result.
   * enemyPower ~ 8-20 typical. rewards object keys optional:
   * winPrestige, winGold, winCombat, winExp, winTactics, loseHealth, losePrestige
   */
  resolveDuel(p, enemyPower, enemyName, rewards = {}) {
    // Trait duelist memberi sedikit keunggulan
    const duelBonus = p.traits.includes("duelist") ? 2 : 0;
    const playerBase = p.stats.combat + Math.floor(p.stats.tactics * 0.5) + duelBonus;
    const playerRoll = Math.floor(Math.random() * 10) + 1;
    const enemyRoll = Math.floor(Math.random() * 10) + 1;
    const playerTotal = playerBase + playerRoll;
    const enemyTotal = enemyPower + enemyRoll;
    const won = playerTotal >= enemyTotal;

    let dmg = 0;
    if (won) {
      dmg = Math.max(3, Math.floor(8 + (enemyTotal - playerTotal) * 0.4 + Math.random() * 6));
      p.health = Math.max(1, p.health - dmg);
      if (rewards.winPrestige) p.prestige += rewards.winPrestige;
      if (rewards.winGold) p.gold += rewards.winGold;
      if (rewards.winCombat) p.stats.combat += rewards.winCombat;
      if (rewards.winTactics) p.stats.tactics += rewards.winTactics;
      if (rewards.winExp) game.addJobExp(rewards.winExp);
      // Reputasi dari kemenangan duel
      game.addReputation(1, "Menang duel publik");
      p._duelWins = (p._duelWins || 0) + 1;
      if (p._duelWins >= 3) game.grantTrait("duelist");
      return `⚔️ DUEL MENANG vs ${enemyName}! (Anda ${playerTotal} vs ${enemyTotal}). Luka ringan -${dmg} HP. ${rewards.winPrestige ? '+' + rewards.winPrestige + ' Prestige. ' : ''}${rewards.winGold ? '+' + rewards.winGold + ' Gold. ' : ''}`;
    } else {
      dmg = rewards.loseHealth || Math.max(10, Math.floor(14 + (enemyTotal - playerTotal) * 0.6 + Math.random() * 8));
      p.health = Math.max(1, p.health - dmg);
      if (rewards.losePrestige) p.prestige = Math.max(0, p.prestige - rewards.losePrestige);
      return `⚔️ DUEL KALAH vs ${enemyName}... (Anda ${playerTotal} vs ${enemyTotal}). Luka parah -${dmg} HP. ${rewards.losePrestige ? '-' + rewards.losePrestige + ' Prestige. ' : ''}Anda masih berdiri, tapi harga kehormatan mahal.`;
    }
  },

  /**
   * Skirmish / small battle using men-at-arms. Scales with troop count.
   */
  resolveBattle(p, enemyMen, enemyName, rewards = {}) {
    const playerForce = p.men + Math.floor(p.stats.combat * 0.8) + Math.floor(p.stats.tactics * 0.6) + Math.floor(Math.random() * 8);
    const enemyForce = enemyMen + Math.floor(Math.random() * 10);
    const won = playerForce >= enemyForce;
    let menLost = 0;
    let dmg = 0;

    if (won) {
      menLost = Math.min(p.men, Math.max(0, Math.floor(enemyMen * 0.15 + Math.random() * 3)));
      dmg = Math.max(4, Math.floor(6 + Math.random() * 8));
      p.men = Math.max(0, p.men - menLost);
      p.health = Math.max(1, p.health - dmg);
      if (rewards.winPrestige) p.prestige += rewards.winPrestige;
      if (rewards.winGold) p.gold += rewards.winGold;
      if (rewards.winCombat) p.stats.combat += rewards.winCombat;
      game.addReputation(2, "Kemenangan di medan tempur");
      p._battleWins = (p._battleWins || 0) + 1;
      if (p._battleWins >= 2) game.grantTrait("battle_scarred");
      if (rewards.winPrestige && rewards.winPrestige >= 10) game.grantTrait("war_veteran");
      if (p.activeNobleHouse) game.changeLordRelation(4, "Berkontribusi dalam pertempuran untuk Lord");
      p.warParticipation = (p.warParticipation || 0) + 1;
      return `🛡️ PERTEMPURAN MENANG vs ${enemyName}! (Kekuatan ${playerForce} vs ${enemyForce}). Kehilangan ${menLost} prajurit, -${dmg} HP. ${rewards.winPrestige ? '+' + rewards.winPrestige + ' Prestige. ' : ''}${rewards.winGold ? '+' + rewards.winGold + ' Gold.' : ''}`;
    } else {
      menLost = Math.min(p.men, Math.max(1, Math.floor(p.men * 0.25 + enemyMen * 0.1)));
      dmg = Math.max(12, Math.floor(15 + Math.random() * 12));
      p.men = Math.max(0, p.men - menLost);
      p.health = Math.max(1, p.health - dmg);
      if (rewards.losePrestige) p.prestige = Math.max(0, p.prestige - rewards.losePrestige);
      return `🛡️ PERTEMPURAN KALAH vs ${enemyName}... (Kekuatan ${playerForce} vs ${enemyForce}). Kehilangan ${menLost} prajurit, -${dmg} HP. Mundur untuk bertahan hidup.`;
    }
  },

  startSkirmish() {
    if (state.player.men < 3) {
      ui.addLog("Anda butuh minimal 3 prajurit untuk memulai skirmish.");
      return;
    }
    if (state.player.health < 25) {
      ui.addLog("Kesehatan terlalu rendah untuk memimpin skirmish.");
      return;
    }
    const enemies = [
      { name: "Bandit Hutan", men: 8 + Math.floor(Math.random() * 6), prestige: 4, gold: 20 },
      { name: "Perampok Kingsroad", men: 10 + Math.floor(Math.random() * 8), prestige: 5, gold: 28 },
      { name: "Pemburu Bayaran", men: 12 + Math.floor(Math.random() * 5), prestige: 6, gold: 35 },
      { name: "Pemberontak Desa", men: 7 + Math.floor(Math.random() * 7), prestige: 3, gold: 15 }
    ];
    const foe = enemies[Math.floor(Math.random() * enemies.length)];
    const result = game.resolveBattle(state.player, foe.men, foe.name, {
      winPrestige: foe.prestige,
      winGold: foe.gold,
      winCombat: 1,
      losePrestige: 2
    });
    ui.addLog(result);
    ui.renderAll();
  },

  trainTroops() {
    if (state.player.men < 1) {
      ui.addLog("Tidak ada prajurit untuk dilatih.");
      return;
    }
    if (state.player.gold < 10) {
      ui.addLog("Butuh 10 Gold untuk sesi latihan.");
      return;
    }
    state.player.gold -= 10;
    state.player.stats.tactics += 1;
    let combatGain = false;
    if (Math.random() < 0.4) { state.player.stats.combat += 1; combatGain = true; }
    ui.addLog("Latihan selesai. Pasukan lebih disiplin (+1 Tactics" + (combatGain ? ", +1 Combat" : "") + ").");
    ui.renderAll();
  },

  /** Tambah reputasi dengan clamp & log opsional */
  addReputation(amount, reason) {
    if (!amount) return;
    state.player.reputation += amount;
    if (reason) ui.addLog(`Reputasi ${amount > 0 ? '+' : ''}${amount}: ${reason}`);
  },

  /** Buka trait jika belum dimiliki */
  grantTrait(traitId) {
    if (state.player.traits.includes(traitId)) return false;
    const def = state.traitDefs.find(t => t.id === traitId);
    if (!def) return false;
    state.player.traits.push(traitId);

    if (traitId === "duelist") state.player.stats.combat += 1;
    if (traitId === "battle_scarred") {
      state.player.maxHealth += 10;
      state.player.health += 10;
    }
    if (traitId === "trusted_sword") state.player.reputation += 2;
    if (traitId === "honest_steward") state.player.stats.stewardship += 1;
    if (traitId === "shadow_whisperer") state.player.stats.intrigue += 1;
    if (traitId === "essos_voyager") state.player.stats.diplomacy += 1;
    if (traitId === "war_veteran") {
      state.player.stats.tactics += 1;
      state.player.stats.combat += 1;
    }
    if (traitId === "queens_inner") state.player.stats.diplomacy += 2;
    if (traitId === "landed_builder") state.player.stats.stewardship += 1;

    ui.addLog(`TRAIT TERBUKA: ${def.name} — ${def.desc}`);
    return true;
  },

  changeLordRelation(delta, reason) {
    if (!state.player.activeNobleHouse) return;
    state.player.lordRelation = Math.max(0, Math.min(100, (state.player.lordRelation || 50) + delta));
    if (reason) ui.addLog(`Relasi Lord ${delta >= 0 ? '+' : ''}${delta}: ${reason} (sekarang ${state.player.lordRelation}/100)`);
  },

  buildStructure(buildingId) {
    const def = state.buildingDefs.find(b => b.id === buildingId);
    if (!def) return;
    if (!state.player.vassalHouseName) {
      ui.addLog("Anda harus memiliki House Vassal untuk membangun struktur.");
      return;
    }
    const owned = state.player.buildings[buildingId] || 0;
    if (owned >= def.max) {
      ui.addLog(`Batas maksimal ${def.name} sudah tercapai.`);
      return;
    }
    if (state.player.gold < def.cost) {
      ui.addLog("Emas tidak cukup.");
      return;
    }
    if (state.player.prestige < def.prestigeReq) {
      ui.addLog(`Butuh Prestige ≥ ${def.prestigeReq} untuk membangun ${def.name}.`);
      return;
    }
    state.player.gold -= def.cost;
    state.player.buildings[buildingId] = owned + 1;

    if (def.tacticsOnce) state.player.stats.tactics += def.tacticsOnce;
    if (def.stewardshipOnce) state.player.stats.stewardship += def.stewardshipOnce;
    if (def.diplomacyOnce) state.player.stats.diplomacy += def.diplomacyOnce;
    if (def.reputation) game.addReputation(def.reputation, `Membangun ${def.name}`);
    if (def.prestigeOnBuild) state.player.prestige += def.prestigeOnBuild;
    if (def.freeMen) state.player.men += def.freeMen;

    const totalBuildings = Object.values(state.player.buildings).reduce((a, b) => a + b, 0);
    if (totalBuildings >= 3) game.grantTrait("landed_builder");

    game.changeLordRelation(2, `Membangun ${def.name} di tanah vassal`);
    ui.addLog(`Pembangunan selesai: ${def.name} (level ${owned + 1}).`);
    ui.renderAll();
  },

  // Aksi yang membutuhkan Prestige
  prestigeAction(actionId) {
    const p = state.player;
    const actions = {
      audience: { cost: 8, name: "Minta Audiensi Lord", needLord: true },
      feast: { cost: 15, name: "Gelar Pesta / Feast", needHall: true },
      gift_lord: { cost: 5, gold: 40, name: "Hadiah untuk Lord" },
      tourney: { cost: 12, name: "Selenggarakan Turnamen Kecil", needLord: true },
      petition_land: { cost: 20, name: "Petisi Tambahan Tanah", needLord: true }
    };
    const act = actions[actionId];
    if (!act) return;
    if (p.prestige < act.cost) {
      ui.addLog(`Prestige tidak cukup (butuh ${act.cost}).`);
      return;
    }
    if (act.needLord && !p.activeNobleHouse) {
      ui.addLog("Anda harus mengabdi pada seorang Lord.");
      return;
    }
    if (act.needHall && !(p.buildings.great_hall > 0)) {
      ui.addLog("Butuh Balai Agung untuk menggelar feast.");
      return;
    }
    if (act.gold && p.gold < act.gold) {
      ui.addLog("Emas tidak cukup untuk hadiah.");
      return;
    }

    p.prestige -= act.cost;
    if (act.gold) p.gold -= act.gold;

    if (actionId === "audience") {
      const gain = 5 + Math.floor(Math.random() * 6);
      game.changeLordRelation(gain, "Audiensi pribadi");
      p.stats.diplomacy += 1;
      ui.addLog(`Audiensi berhasil. Lord mendengarkan Anda. +1 Diplomacy.`);
    } else if (actionId === "feast") {
      p.prestige += 8;
      game.addReputation(3, "Feast di Balai Agung");
      game.changeLordRelation(4, "Feast yang dihadiri bannermen");
      // chance marriage rumor
      if (Math.random() < 0.4 && !p.marriedTo) game.tryMarriageOffer();
      ui.addLog("Feast meriah. Nama House Anda semakin dikenal.");
    } else if (actionId === "gift_lord") {
      game.changeLordRelation(8, "Hadiah mewah kepada Lord");
      ui.addLog("Lord menerima hadiah dengan senyum tipis.");
    } else if (actionId === "tourney") {
      const r = game.resolveDuel(p, 12 + Math.floor(Math.random() * 5), "Lawanan Turnamen", {
        winPrestige: 10, winGold: 25, winCombat: 1, loseHealth: 12, losePrestige: 2
      });
      game.changeLordRelation(3, "Turnamen di tanah Lord");
      ui.addLog(r);
    } else if (actionId === "petition_land") {
      if (p.lordRelation >= 60) {
        p.landHectares += 3;
        game.changeLordRelation(-5, "Petisi tanah dikabulkan (Lord sedikit enggan)");
        ui.addLog("Lord mengabulkan 3 Ha tanah tambahan!");
      } else {
        game.changeLordRelation(-3, "Petisi tanah ditolak");
        ui.addLog("Lord menolak petisi. Relasi belum cukup hangat.");
      }
    }
    ui.renderAll();
  },

  tryMarriageOffer() {
    if (state.player.marriedTo) return;
    if (!state.player.activeNobleHouse) return;
    if (state.player.prestige < 25 || state.player.reputation < 15) return;

    const pool = state.minorHouses[state.player.activeNobleHouse] || state.minorHouses.stark;
    const match = pool[Math.floor(Math.random() * pool.length)];
    const genderWord = state.player.gender === "Female" ? "putra" : "putri";
    const heirName = match.heir;

    state.inbox.unshift({
      id: `marriage-${Date.now()}`,
      title: `Tawaran Pernikahan: ${match.name}`,
      sender: `Utusan ${match.name}`,
      type: "Diplomasi Pernikahan",
      date: `${state.date.year} AC, M${state.date.month}`,
      desc: `House ${match.name} dari ${match.region}, sekutu loyal Lord Anda, menawarkan pernikahan dengan ${heirName}. Aliansi ini akan memperkuat posisi politik House Anda.`,
      choices: [
        {
          text: `Terima pernikahan dengan ${heirName}`,
          effect: (p) => {
            p.marriedTo = { name: heirName, house: match.name, region: match.region };
            p.prestige += 12;
            p.reputation += 8;
            p.stats.diplomacy += 1;
            game.changeLordRelation(6, `Pernikahan aliansi dengan ${match.name}`);
            return `Anda menikah dengan ${heirName} dari ${match.name}. Banner kedua rumah berkibar bersama.`;
          }
        },
        {
          text: "Tolak dengan hormat",
          effect: (p) => {
            game.changeLordRelation(-2, "Menolak tawaran pernikahan sekutu");
            return "Utusan pergi dengan wajah formal. Pintu aliansi itu tertutup untuk saat ini.";
          }
        }
      ],
      read: false
    });
    ui.addLog(`TAWARAN PERNIKAHAN dari ${match.name} masuk kotak surat!`);
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

  checkHouseWarEvents() {
    const activeId = state.player.activeNobleHouse;
    if (!activeId) return;
    const list = houseWarEvents[activeId];
    if (!list) return;

    list.forEach(evt => {
      if (!evt._fired && evt.triggerYear === state.date.year && evt.triggerMonth === state.date.month) {
        evt._fired = true;
        state.inbox.unshift({
          ...evt,
          date: `${state.date.year} AC, M${state.date.month}`,
          read: false
        });
        ui.addLog(`PANGGILAN PERANG DARI LORD ANDA: ${evt.title}`);
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
    ui.renderAll();
  },

  nextTurn() {
    state.date.month += 1;
    if (state.date.month > 12) {
      state.date.month = 1;
      state.date.year += 1;
      state.player.age += 1;
      game.applyAgingGrowth();
    }

    if (state.travel.inProgress) {
      game.processTravel();
    }

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

    let income = 0;

    let landIncome = state.player.landHectares * state.landMarket.rentIncomePerHectare;
    if (state.player.unlockedTalents.includes("t2")) landIncome = Math.floor(landIncome * 1.15);
    if (state.player.traits.includes("honest_steward")) landIncome = Math.floor(landIncome * 1.1);
    income += landIncome;

    if (state.player.currentJob) {
      const activeJob = state.jobs.find(j => j.id === state.player.currentJob);
      if (activeJob) {
        let currentRank = activeJob.ranks[state.player.jobRankIndex];
        let jobIncome = currentRank.income;
        // Bonus Free Company
        if (state.player.currentJob === "mercenary" && state.player.mercenaryCompany) {
          const co = state.mercenaryCompanies.find(c => c.id === state.player.mercenaryCompany);
          if (co) jobIncome = Math.floor(jobIncome * (co.incomeMult || 1));
        }
        if (state.player.unlockedTalents.includes("t2")) jobIncome = Math.floor(jobIncome * 1.15);
        if (state.player.traits.includes("merchant_prince")) jobIncome = Math.floor(jobIncome * 1.15);
        if (state.player.traits.includes("honest_steward") && state.player.currentJob === "scribe") {
          jobIncome = Math.floor(jobIncome * 1.1);
        }
        income += jobIncome;
        game.addJobExp(20);
        // Reputasi kecil tiap bulan dari pekerjaan terhormat
        if (["guard", "scribe", "knight_vassal"].includes(state.player.currentJob) && Math.random() < 0.35) {
          game.addReputation(1, "Pelayanan setia di pekerjaan");
        }
      }
    }

    if (state.player.vassalHouseName) {
      state.player.prestige += 2;
      // Building monthly gold
      let buildGold = 0;
      state.buildingDefs.forEach(def => {
        const n = state.player.buildings[def.id] || 0;
        if (n && def.goldPerMonth) buildGold += def.goldPerMonth * n;
      });
      if (buildGold > 0) {
        income += buildGold;
      }
      // Keep regenerates a bit of health
      if ((state.player.buildings.keep || 0) > 0 && state.player.health < state.player.maxHealth) {
        state.player.health = Math.min(state.player.maxHealth, state.player.health + 2);
      }
    }

    if (state.player.innerCircle || state.player.traits.includes("queens_inner")) {
      state.player.prestige += 1;
      state.player.danyFavor = (state.player.danyFavor || 0) + 1;
    }

    if (state.player.marriedTo) {
      state.player.prestige += 1;
      if (Math.random() < 0.2) game.addReputation(1, "Aliansi pernikahan");
    }

    // Chance tawaran pernikahan
    if (!state.player.marriedTo && state.player.activeNobleHouse && state.player.prestige >= 28 && Math.random() < 0.08) {
      game.tryMarriageOffer();
    }

    // Lord relation slow drift toward 50 if idle, or bonus if high war participation recently handled in events
    if (state.player.activeNobleHouse && Math.random() < 0.15) {
      // small NPC "mood" fluctuation
      const mood = Math.floor(Math.random() * 5) - 2;
      if (mood !== 0) game.changeLordRelation(mood, mood > 0 ? "Lord dalam suasana baik" : "Lord sedang murung");
    }

    let baseUpkeep = Math.floor(state.player.men * 0.5);
    let upkeep = state.player.unlockedTalents.includes("t3") ? Math.floor(baseUpkeep * 0.5) : baseUpkeep;

    const netGold = income - upkeep;
    state.player.gold += netGold;

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

    game.triggerRandomJobEvent();
    game.checkWorldLoreEvents();
    game.checkHouseWarEvents();

    ui.renderAll();

    ui.addLog(`Ganti bulan. Hasil Bersih Emas: ${netGold >= 0 ? '+' : ''}${netGold} Gold.`);
  }
};
