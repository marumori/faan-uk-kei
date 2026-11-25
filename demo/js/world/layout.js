// 側面剖面屋企：世界座標。x = 左右，depth = 0（貼牆）至 1（最近觀眾）。
export const WORLD_H = 600;
export const CEIL = 64;
export const FLOOR_BACK = 438;   // depth 0 的地面 y
export const FLOOR_FRONT = 548;  // depth 1 的地面 y
export const WALL = 26;          // 側牆厚度

export const depthY = d => FLOOR_BACK + d * (FLOOR_FRONT - FLOOR_BACK);
export const depthScale = d => 0.9 + d * 0.12;
export const yToDepth = y => Math.max(0, Math.min(1, (y - FLOOR_BACK) / (FLOOR_FRONT - FLOOR_BACK)));

export const ZONES = {
  home: { id: 'home', name: '客廳', x0: 0, x1: 2000, door: 'toBedroom' },
  bedroom: { id: 'bedroom', name: '睡房', x0: 2400, x1: 3480, door: 'toHome' },
};

export const zoneAt = x => (x >= ZONES.bedroom.x0 ? ZONES.bedroom : ZONES.home);

// 阻擋區（家具、牆）：{zone, x0, x1, d0, d1}
export const BLOCKERS = [
  // 客廳
  { zone: 'home', name: '鞋櫃', x0: 236, x1: 336, d0: 0, d1: 0.26 },
  { zone: 'home', name: '梳化', x0: 392, x1: 652, d0: 0, d1: 0.34 },
  { zone: 'home', name: '茶几', x0: 452, x1: 600, d0: 0.46, d1: 0.7 },
  { zone: 'home', name: '風扇', x0: 690, x1: 744, d0: 0.18, d1: 0.36 },
  { zone: 'home', name: '電視櫃', x0: 770, x1: 960, d0: 0, d1: 0.24 },
  { zone: 'home', name: '窗邊矮櫃', x0: 1076, x1: 1226, d0: 0, d1: 0.22 },
  { zone: 'home', name: '摺枱', x0: 1420, x1: 1590, d0: 0.3, d1: 0.6 },
  { zone: 'home', name: '雪櫃', x0: 1690, x1: 1812, d0: 0, d1: 0.3 },
  // 睡房
  { zone: 'bedroom', name: '衣櫃', x0: 2620, x1: 2800, d0: 0, d1: 0.26 },
  { zone: 'bedroom', name: '床', x0: 3000, x1: 3392, d0: 0.04, d1: 0.62 },
  { zone: 'bedroom', name: '床頭櫃', x0: 3400, x1: 3460, d0: 0, d1: 0.24 },
];
