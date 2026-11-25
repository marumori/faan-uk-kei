// 互動物件登記表（data-driven）。每個物件亦係一個「停站」（stop）。
// interactionPoint = 角色停企位置；interactionRadius = 顯示提示嘅水平距離（px）。
export const OBJECTS = [
  {
    id: 'entry', sceneId: 'home', objectType: 'entrance', glyph: '門',
    displayName: '玄關', interactionLabel: '睇吓邊個返咗嚟',
    interactionRadius: 110, interactionPoint: { x: 196, d: 0.55 }, face: 'back',
    hit: { x0: 70, x1: 340, y0: 150, y1: 470 },
    contentRef: 'family', visibility: 'family_shared', enabled: true, interactionAction: 'panel:family',
  },
  {
    id: 'album', sceneId: 'home', objectType: 'coffee_table', glyph: '相',
    displayName: '茶几 · 家庭相簿', interactionLabel: '打開相簿',
    interactionRadius: 120, interactionPoint: { x: 526, d: 0.86 }, face: 'back',
    hit: { x0: 440, x1: 612, y0: 470, y1: 540 },
    contentRef: 'memories', visibility: 'family_shared', enabled: true, interactionAction: 'moment:album',
  },
  {
    id: 'router', sceneId: 'home', objectType: 'tv_cabinet', glyph: '連',
    displayName: '電視櫃 · 連接服務', interactionLabel: '連接其他服務',
    interactionRadius: 110, interactionPoint: { x: 866, d: 0.46 }, face: 'back',
    hit: { x0: 770, x1: 960, y0: 300, y1: 470 },
    contentRef: 'connectors', visibility: 'family_shared', enabled: true, interactionAction: 'panel:connectors',
  },
  {
    id: 'drawer', sceneId: 'home', objectType: 'window_drawer', glyph: '窗',
    displayName: '窗邊 · 私人抽屜', interactionLabel: '打開私人抽屜',
    interactionRadius: 120, interactionPoint: { x: 1150, d: 0.42 }, face: 'back',
    hit: { x0: 1010, x1: 1290, y0: 140, y1: 470 },
    contentRef: 'drawer', visibility: 'private', enabled: true, interactionAction: 'moment:drawer',
  },
  {
    id: 'fridge', sceneId: 'home', objectType: 'fridge', glyph: '雪',
    displayName: '雪櫃門 · 拜山位置', interactionLabel: '睇雪櫃門張紙仔',
    interactionRadius: 110, interactionPoint: { x: 1752, d: 0.5 }, face: 'back',
    hit: { x0: 1690, x1: 1812, y0: 200, y1: 470 },
    contentRef: 'grave', visibility: 'family_shared', enabled: true, interactionAction: 'panel:grave',
  },
  {
    id: 'toBedroom', sceneId: 'home', objectType: 'door', glyph: '房',
    displayName: '睡房門', interactionLabel: '入睡房',
    interactionRadius: 90, interactionPoint: { x: 1912, d: 0.2 }, face: 'back',
    hit: { x0: 1862, x1: 1962, y0: 200, y1: 450 },
    contentRef: null, visibility: 'family_shared', enabled: true, interactionAction: 'go:bedroom', inBar: false,
  },
  {
    id: 'toHome', sceneId: 'bedroom', objectType: 'door', glyph: '廳',
    displayName: '返客廳', interactionLabel: '出返客廳',
    interactionRadius: 90, interactionPoint: { x: 2510, d: 0.2 }, face: 'back',
    hit: { x0: 2460, x1: 2560, y0: 200, y1: 450 },
    contentRef: null, visibility: 'family_shared', enabled: true, interactionAction: 'go:home', inBar: false,
  },
  {
    id: 'bed', sceneId: 'bedroom', objectType: 'bed', glyph: '床',
    displayName: '床 · 床下底', interactionLabel: '蹲低睇床下底',
    interactionRadius: 160, interactionPoint: { x: 3150, d: 0.8 }, face: 'back',
    hit: { x0: 2990, x1: 3400, y0: 330, y1: 520 },
    contentRef: 'legacy', visibility: 'private', enabled: true, interactionAction: 'moment:bed',
  },
];

export const byId = id => OBJECTS.find(o => o.id === id);
export const barStops = () => OBJECTS.filter(o => o.enabled && o.inBar !== false);
export const doorOf = zoneId => OBJECTS.find(o => o.sceneId === zoneId && o.objectType === 'door');
