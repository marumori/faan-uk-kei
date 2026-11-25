// 示範資料：全部為虛構內容，不代表任何真實人物、家庭、地點或文件。
// Demo data: entirely fictional. No real people, places, records or credentials.

export const FAMILY = {
  id: 'family-demo-001',
  name: '陳家 — 示範家庭',
  members: [
    { id: 'member-demo-001', name: '陳婆婆', role: '嫲嫲', colour: '#b5523b' },
    { id: 'member-demo-002', name: '陳太', role: '媽媽', colour: '#5b8fa8' },
    { id: 'member-demo-003', name: '陳生', role: '爸爸', colour: '#6c7a4a' },
    { id: 'member-demo-004', name: '阿晴', role: '女兒', colour: '#d9a74a' },
  ],
};

// 相簿：photo_story 記錄（插圖由程式繪製，見 js/ui/illustrations.js）
export const MEMORIES = [
  {
    id: 'memory-demo-001', timestamp: '1988-09-25T19:30:00+08:00', type: 'photo_story',
    people: ['member-demo-001', 'member-demo-002'], mediaRef: 'lantern',
    title: '屋邨平台玩燈籠', caption: '1988 年中秋 · 平台',
    content: '嗰年中秋，成座大廈嘅細路都喺平台度。媽媽手上嗰個楊桃燈籠，係婆婆用玻璃紙一格格糊出嚟。',
    source: 'demo', visibility: 'family_shared', unlockAt: null,
  },
  {
    id: 'memory-demo-002', timestamp: '1997-02-07T12:00:00+08:00', type: 'photo_story',
    people: ['member-demo-001', 'member-demo-002', 'member-demo-003'], mediaRef: 'dinner',
    title: '年三十晚團年飯', caption: '1997 年 · 摺枱開飯',
    content: '一張摺枱，八個人迫埋一齊食。婆婆煲咗成日嘅湯，阿爸負責斬雞。碗筷唔夠，就借隔籬屋。',
    source: 'demo', visibility: 'family_shared', unlockAt: null,
  },
  {
    id: 'memory-demo-003', timestamp: '2009-07-12T16:00:00+08:00', type: 'photo_story',
    people: ['member-demo-004'], mediaRef: 'fan',
    title: '風扇前面唱歌', caption: '2009 年夏天 · 客廳',
    content: '阿晴三歲，最鍾意對住座地風扇唱歌，聽自己把聲變成機械人。錄音仲喺度，遲啲整理好再放上嚟。',
    source: 'demo', visibility: 'family_shared', unlockAt: null, hasAudio: true,
  },
  {
    id: 'memory-demo-004', timestamp: '2025-12-21T18:00:00+08:00', type: 'photo_story',
    people: ['member-demo-001', 'member-demo-004'], mediaRef: 'tangyuan',
    title: '冬至搓湯丸', caption: '2025 年冬至 · 飯枱',
    content: '婆婆教阿晴搓湯丸，話粉團要「軟過耳珠」。今年阿晴第一次搓到圓。',
    source: 'demo', visibility: 'family_shared', unlockAt: null,
  },
];

// 窗邊私人抽屜：預設唔分享
export const DRAWER = {
  ownerId: 'member-demo-002',
  letter: {
    id: 'letter-demo-001', title: '寫畀十年後嘅阿晴',
    body: '阿晴：\n\n你而家應該已經大個咗。媽媽想同你講，我哋屋企細，但係從來都唔覺得迫。\n你細個成日坐喺呢個窗口數對面大廈幾多盞燈。\n\n無論你去到邊，記得返屋企食飯。\n\n媽媽（示範內容）',
    visibility: 'private', unlockAt: '2036-01-01T00:00:00+08:00',
  },
  voice: { id: 'voice-demo-001', title: '語音留言（示範佔位）', length: '1:24', visibility: 'private' },
  capsule: { id: 'capsule-demo-001', title: '時間囊', note: '設定日期之後，指定家人先可以打開。示範版只係概念展示。', unlockAt: '2036-01-01T00:00:00+08:00' },
};

// 月餅盒：重要資料「索引」，唔係文件本身
export const LEGACY = [
  { id: 'legacy-demo-001', title: '平安紙（遺囑）', where: '原件存放位置：主人房床下底，紅色月餅盒。', note: '示範：只記錄位置，唔儲存文件內容。', visibility: 'private' },
  { id: 'legacy-demo-002', title: '保單資料', where: '文件袋位置索引：衣櫃上格，藍色文件袋。', note: '示範：只記錄保險公司名稱及文件位置，冇保單號碼。', visibility: 'private' },
  { id: 'legacy-demo-003', title: '龕位資料', where: '供應商及合約文件位置：書枱第二格抽屜。', note: '示範：合約副本由陳生保管。', visibility: 'family_shared' },
  { id: 'legacy-demo-004', title: '家庭重要聯絡人', where: '示範資料：家庭醫生、律師樓、管理處（全部虛構）。', note: '示範：唔包括任何真實電話或地址。', visibility: 'family_shared' },
];

// 拜祭位置卡：虛構地點
export const GRAVE = {
  id: 'grave-demo-001',
  person: '陳公（示範）',
  facility: '青嵐山紀念園（虛構）',
  location: { block: 'C 座', floor: '3 樓', row: '第 7 行', niche: '第 12 號' },
  directions: [
    '由港鐵「示範站」B 出口，轉乘專線小巴 99S（虛構路線）到總站。',
    '入閘後沿右手邊斜路行約 5 分鐘，見到大樹右轉。',
    'C 座地下搭升降機上 3 樓，出升降機向左行，第 7 行喺窗邊。',
  ],
  checklist: ['鮮花', '抹布同水', '香燭（如場地准許）', '水果', '紙巾', '雨傘 / 帽'],
  note: '全部地點及路線均為示範用虛構資料。',
};

// Connector 展示：狀態必須如實標示
export const CONNECTORS = [
  { id: 'conn-fehd', name: '食環署網上追思服務', kind: '外部服務概念', status: 'Concept', desc: '日後可提供官方網站連結，方便家人前往網上追思平台。示範版冇連接任何帳戶。' },
  { id: 'conn-iamsmart', name: '「智方便」', kind: '身份整合概念', status: 'Concept', desc: '探討日後經官方認可方式整合。示範版冇任何登入或驗證功能。' },
  { id: 'conn-photo', name: '相片匯入', kind: '本機匯入', status: 'Prototype', desc: '揀選本機相片，只喺呢部瀏覽器內預覽，唔會上載。' },
  { id: 'conn-whatsapp', name: 'WhatsApp 對話匯出', kind: '匯入概念', status: 'Concept', desc: '將用戶自行匯出嘅 TXT 檔整理成家庭回憶。示範版未有實作。' },
  { id: 'conn-scan', name: '家庭文件掃描', kind: '本機索引概念', status: 'Concept', desc: '影低文件封面，只建立「放喺邊」嘅索引，唔儲存文件內容。' },
];

export const STATUS_LABEL = {
  Concept: '概念',
  Prototype: '原型',
  'External link': '外部連結',
  Integrated: '已整合',
};
