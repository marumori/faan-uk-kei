// 原創程式繪圖：《屋邨日常》側面剖面屋企。冇使用任何外部圖像素材。
import { CEIL, FLOOR_BACK, FLOOR_FRONT, WALL, WORLD_H, ZONES, depthY } from './layout.js';

const C = {
  wall: 0xefe9dc, wallLow: 0xe6dfcf, skirting: 0xcdbfa5, ceil: 0xf6f3ec,
  slab: 0x8b8277, slabDark: 0x6c645a, tileA: 0xe9e2d2, tileB: 0xd8ceb9, tileLine: 0xc4b79f,
  wood: 0xb98c5e, woodDark: 0x8a6440, woodTop: 0xcfa577, ply: 0xd9bf93, plyTop: 0xe6d1aa,
  alu: 0xc5cacd, aluDark: 0x9aa1a5, red: 0xb5483f, teal: 0x5b8fa8, green: 0x6c8a5a,
  cream: 0xf7f1e3, ink: 0x3a2a22, metal: 0x9ca3a8, sofa: 0x7f8f74, sofaTop: 0x95a589,
};

const shade = (hex, k) => {
  const r = Math.min(255, Math.max(0, ((hex >> 16) & 255) * k));
  const g = Math.min(255, Math.max(0, ((hex >> 8) & 255) * k));
  const b = Math.min(255, Math.max(0, (hex & 255) * k));
  return (r << 16) | (g << 8) | b;
};

function quad(g, color, pts, alpha = 1) {
  g.fillStyle(color, alpha);
  g.fillPoints(pts.map(([x, y]) => ({ x, y })), true);
}

// 斜投影盒：正面 + 頂面
export function box(g, x0, x1, d0, d1, h, color, { lift = 0, topColor, side = true } = {}) {
  const yb = depthY(d1) - lift, yt = depthY(d0) - lift;
  const depthPx = yb - yt;
  quad(g, topColor ?? shade(color, 1.12), [[x0, yb - h], [x1, yb - h], [x1 + depthPx * 0.15, yt - h], [x0 + depthPx * 0.15, yt - h]]);
  if (side) quad(g, shade(color, 0.82), [[x1, yb - h], [x1 + depthPx * 0.15, yt - h], [x1 + depthPx * 0.15, yt], [x1, yb]]);
  g.fillStyle(color, 1); g.fillRect(x0, yb - h, x1 - x0, h);
  return { yb, yt, top: yb - h };
}

function legs(g, x0, x1, d1, h, color, w = 6) {
  const yb = depthY(d1);
  g.fillStyle(color, 1);
  g.fillRect(x0 + 4, yb - h, w, h); g.fillRect(x1 - 4 - w, yb - h, w, h);
}

// ---------- 房間外殼 ----------
function shell(scene, zone, opts) {
  const g = scene.add.graphics().setDepth(-1000);
  const { x0, x1 } = zone;
  // 後牆
  g.fillStyle(C.wall, 1); g.fillRect(x0, CEIL, x1 - x0, FLOOR_BACK - CEIL);
  g.fillStyle(C.wallLow, 1); g.fillRect(x0, 330, x1 - x0, FLOOR_BACK - 330);
  g.fillStyle(C.skirting, 1); g.fillRect(x0, FLOOR_BACK - 10, x1 - x0, 10);
  g.lineStyle(2, 0xd7cdb9, 1); g.lineBetween(x0, 330, x1, 330);
  // 牆身微污跡（住咗好耐嘅感覺）
  for (let i = 0; i < 26; i++) {
    const px = x0 + ((i * 977) % (x1 - x0)), py = CEIL + 30 + ((i * 431) % 240);
    g.fillStyle(0x000000, 0.025); g.fillEllipse(px, py, 40 + (i % 5) * 12, 18 + (i % 3) * 8);
  }
  // 地磚（透視）
  const cx = (x0 + x1) / 2, rows = 3;
  for (let r = 0; r < rows; r++) {
    const ya = FLOOR_BACK + (FLOOR_FRONT - FLOOR_BACK) * (r / rows);
    const yb = FLOOR_BACK + (FLOOR_FRONT - FLOOR_BACK) * ((r + 1) / rows);
    const ka = 0.9 + 0.1 * (r / rows), kb = 0.9 + 0.1 * ((r + 1) / rows);
    const tile = opts.tile ?? 58;
    for (let x = x0 - 200, i = 0; x < x1 + 200; x += tile, i++) {
      const p = (xx, k) => cx + (xx - cx) * k;
      quad(g, (i + r) % 2 ? opts.tileA ?? C.tileA : opts.tileB ?? C.tileB,
        [[p(x, ka), ya], [p(x + tile, ka), ya], [p(x + tile, kb), yb], [p(x, kb), yb]]);
    }
    g.lineStyle(1, C.tileLine, 0.6); g.lineBetween(x0, yb, x1, yb);
  }
  // 牆外遮蓋（唔好畫出牆外嘅地磚）
  g.fillStyle(0x3a2d25, 1); g.fillRect(x0 - WALL - 200, CEIL, 200, WORLD_H); g.fillRect(x1 + WALL, CEIL, 200, WORLD_H);
  // 地台切面 + 天花切面
  g.fillStyle(C.slab, 1); g.fillRect(x0 - WALL, FLOOR_FRONT, x1 - x0 + WALL * 2, WORLD_H - FLOOR_FRONT);
  g.fillStyle(C.slabDark, 1); g.fillRect(x0 - WALL, FLOOR_FRONT, x1 - x0 + WALL * 2, 6);
  g.fillStyle(C.slab, 1); g.fillRect(x0 - WALL, 0, x1 - x0 + WALL * 2, CEIL);
  g.fillStyle(C.ceil, 1); g.fillRect(x0, CEIL - 6, x1 - x0, 6);
  // 側牆切面
  [x0 - WALL, x1].forEach(wx => { g.fillStyle(C.slab, 1); g.fillRect(wx, 0, WALL, WORLD_H); g.fillStyle(C.slabDark, 1); g.fillRect(wx + WALL / 2 - 1, 0, 2, WORLD_H); });
  // 光管
  g.fillStyle(0xffffff, 1); g.fillRoundedRect(cx - 90, CEIL + 4, 180, 10, 4);
  g.fillStyle(0xfff7da, 0.12); g.fillTriangle(cx - 90, CEIL + 14, cx + 90, CEIL + 14, cx + 300, FLOOR_BACK);
  g.fillTriangle(cx - 90, CEIL + 14, cx - 300, FLOOR_BACK, cx + 300, FLOOR_BACK);
  return g;
}

// ---------- 牆上物件 ----------
function frontDoor(g, x) {
  // 木門 + 鐵閘
  g.fillStyle(0x7a5236, 1); g.fillRect(x, 170, 130, FLOOR_BACK - 170);
  g.fillStyle(0x8f6443, 1); g.fillRect(x + 10, 182, 110, FLOOR_BACK - 192);
  g.fillStyle(0xd6b15e, 1); g.fillCircle(x + 110, 320, 6);
  g.fillStyle(0xf7f1e3, 1); g.fillRect(x + 42, 214, 46, 30); // 揮春位置留白（唔寫字）
  g.lineStyle(3, C.aluDark, 0.9);
  for (let i = 0; i <= 8; i++) g.lineBetween(x - 8 + i * 18, 166, x - 8 + i * 18, FLOOR_BACK - 2);
  g.lineBetween(x - 8, 166, x + 136, 166); g.lineBetween(x - 8, 300, x + 136, 300);
  // 門牌
  g.fillStyle(0x2e5a74, 1); g.fillRoundedRect(x + 140, 200, 46, 28, 4);
  g.fillStyle(0xffffff, 1); g.fillRect(x + 150, 210, 26, 4); g.fillRect(x + 150, 218, 18, 4);
}

function windowGrille(g, x0, x1, y0, y1, sky) {
  g.fillStyle(sky.top, 1); g.fillRect(x0, y0, x1 - x0, (y1 - y0) / 2);
  g.fillStyle(sky.bottom, 1); g.fillRect(x0, y0 + (y1 - y0) / 2, x1 - x0, (y1 - y0) / 2);
  // 對面大廈
  for (let b = 0; b < 4; b++) {
    const bx = x0 + 8 + b * ((x1 - x0) / 4), bw = (x1 - x0) / 4 - 14, bt = y0 + 30 + (b % 2) * 26;
    g.fillStyle(sky.building, 1); g.fillRect(bx, bt, bw, y1 - bt);
    for (let wy = bt + 10; wy < y1 - 8; wy += 16) for (let wx = bx + 6; wx < bx + bw - 8; wx += 14) {
      const on = ((wx * 7 + wy * 13 + b) % 5) < (sky.night ? 2 : 0);
      g.fillStyle(on ? 0xffde9e : sky.windowCol, 1); g.fillRect(wx, wy, 7, 8);
    }
  }
  // 鋁窗框 + 窗花
  g.lineStyle(8, C.alu, 1); g.strokeRect(x0, y0, x1 - x0, y1 - y0);
  g.lineStyle(5, C.alu, 1); g.lineBetween((x0 + x1) / 2, y0, (x0 + x1) / 2, y1);
  g.lineStyle(3, C.aluDark, 1);
  for (let x = x0 + 22; x < x1; x += 22) g.lineBetween(x, y0, x, y1);
  g.lineBetween(x0, (y0 + y1) / 2, x1, (y0 + y1) / 2);
  // 窗台
  g.fillStyle(0xd5cbb8, 1); g.fillRect(x0 - 14, y1, x1 - x0 + 28, 10);
}

function frame(g, x, y, w, h, inner) {
  g.fillStyle(0x6f4b31, 1); g.fillRect(x - 4, y - 4, w + 8, h + 8);
  g.fillStyle(inner, 1); g.fillRect(x, y, w, h);
  g.fillStyle(0xffffff, 0.25); g.fillRect(x, y, w, h / 3);
}

function calendar(g, x, y) {
  g.fillStyle(0xffffff, 1); g.fillRect(x, y, 54, 70);
  g.fillStyle(C.red, 1); g.fillRect(x, y, 54, 16);
  g.fillStyle(0x333333, 1); g.fillRect(x + 14, y + 26, 26, 20);
  g.fillStyle(0xcccccc, 1); for (let i = 0; i < 3; i++) g.fillRect(x + 8, y + 52 + i * 5, 38, 2);
}

export function skyFor(hour) {
  const night = hour < 6 || hour >= 19, dusk = (hour >= 17 && hour < 19) || (hour >= 6 && hour < 8);
  if (night) return { night, top: 0x1d2742, bottom: 0x39456a, building: 0x232a3e, windowCol: 0x161b2b, tint: 0x203060, tintA: 0.14 };
  if (dusk) return { night: false, top: 0x7a90bf, bottom: 0xf0b98e, building: 0x8c8d9c, windowCol: 0x5a5d6e, tint: 0xff9a50, tintA: 0.07 };
  return { night: false, top: 0x8fc0e2, bottom: 0xd8ebf2, building: 0xa3adb7, windowCol: 0x6d7a86, tint: 0xffffff, tintA: 0 };
}

// ---------- 家具（獨立圖層，按深度排序） ----------
function layer(scene, depth) { return scene.add.graphics().setDepth(depth); }

export function buildHome(scene, sky) {
  const z = ZONES.home;
  const g = shell(scene, z, {});
  const wallG = scene.add.graphics().setDepth(-900);
  frontDoor(wallG, 90);
  windowGrille(wallG, 1020, 1282, 150, 318, sky);
  // 窗簾
  wallG.fillStyle(0xc9a77a, 0.92); wallG.fillRect(1000, 140, 34, 196); wallG.fillRect(1268, 140, 34, 196);
  // 梳化上面相架
  frame(wallG, 430, 196, 64, 80, 0xd9a74a); frame(wallG, 520, 214, 90, 64, 0x8fb3a0); frame(wallG, 630, 200, 46, 58, 0xc98e7a);
  calendar(wallG, 1620, 170);
  // 睡房門
  wallG.fillStyle(0x9b7350, 1); wallG.fillRect(1862, 206, 100, FLOOR_BACK - 206);
  wallG.fillStyle(0xab8360, 1); wallG.fillRect(1872, 218, 80, 90); wallG.fillRect(1872, 318, 80, 110);
  wallG.fillStyle(0xd6b15e, 1); wallG.fillCircle(1946, 330, 5);
  // 掛牆鐘
  wallG.fillStyle(0xffffff, 1); wallG.fillCircle(880, 170, 24); wallG.lineStyle(3, 0x6f4b31, 1); wallG.strokeCircle(880, 170, 24);
  wallG.lineStyle(3, 0x333333, 1); wallG.lineBetween(880, 170, 880, 154); wallG.lineBetween(880, 170, 892, 176);

  const items = {};
  // 鞋櫃 + 拖鞋
  let l = layer(scene, depthY(0.26));
  box(l, 236, 336, 0, 0.26, 96, C.ply, { topColor: C.plyTop });
  l.lineStyle(2, shade(C.ply, 0.75), 1); l.lineBetween(236, depthY(0.26) - 48, 336, depthY(0.26) - 48);
  l.fillStyle(0x4a6b8a, 1); l.fillRoundedRect(250, depthY(0.26) - 112, 30, 16, 6);
  l = layer(scene, depthY(0.6));
  [[150, 0.5, C.red], [176, 0.56, 0x4a6b8a], [212, 0.62, 0xd9a74a]].forEach(([x, d, c]) => { l.fillStyle(c, 1); l.fillEllipse(x, depthY(d), 26, 9); l.fillEllipse(x + 30, depthY(d) + 2, 26, 9); });
  // 梳化
  l = layer(scene, depthY(0.34));
  box(l, 392, 652, 0.02, 0.34, 46, C.sofa, { lift: 8, topColor: C.sofaTop });
  l.fillStyle(shade(C.sofa, 0.9), 1); l.fillRoundedRect(392, depthY(0.04) - 104, 260, 66, 10);
  l.fillStyle(C.sofa, 1); l.fillRoundedRect(380, depthY(0.34) - 78, 28, 70, 8); l.fillRoundedRect(640, depthY(0.34) - 78, 28, 70, 8);
  l.fillStyle(0xd9a74a, 1); l.fillRoundedRect(420, depthY(0.12) - 88, 44, 38, 8);
  l.fillStyle(0x3e5c46, 1); l.fillRect(400, depthY(0.34) - 8, 8, 8); l.fillRect(636, depthY(0.34) - 8, 8, 8);
  // 茶几 + 相簿
  l = layer(scene, depthY(0.7));
  legs(l, 452, 600, 0.7, 40, C.woodDark);
  const tt = box(l, 452, 600, 0.46, 0.7, 10, C.wood, { lift: 40, topColor: C.woodTop });
  items.albumBook = scene.add.graphics().setDepth(depthY(0.7) + 0.1);
  items.albumBook.fillStyle(0x8a3b33, 1); items.albumBook.fillRect(500, tt.top - 12, 54, 12);
  items.albumBook.fillStyle(0xf7f1e3, 1); items.albumBook.fillRect(500, tt.top - 14, 52, 3);
  l.fillStyle(0xffffff, 1); l.fillRoundedRect(466, tt.top - 10, 18, 10, 3); // 茶杯
  // 地風扇
  l = layer(scene, depthY(0.36));
  l.fillStyle(0x9aa1a5, 1); l.fillEllipse(717, depthY(0.34), 50, 12); l.fillRect(714, depthY(0.34) - 86, 6, 86);
  l.fillStyle(0xdfe6e8, 1); l.fillCircle(717, depthY(0.34) - 108, 30);
  l.lineStyle(2, 0x9aa1a5, 1); l.strokeCircle(717, depthY(0.34) - 108, 30); l.strokeCircle(717, depthY(0.34) - 108, 20);
  items.fanBlades = scene.add.graphics().setDepth(depthY(0.36) + 0.1).setPosition(717, depthY(0.34) - 108);
  items.fanBlades.fillStyle(0x7fb2c8, 0.85);
  for (let i = 0; i < 3; i++) { const a = i * 2.094; items.fanBlades.fillEllipse(Math.cos(a) * 13, Math.sin(a) * 13, 22, 12); }
  // 電視櫃 + 電視 + 路由器
  l = layer(scene, depthY(0.24));
  box(l, 770, 960, 0, 0.24, 54, C.ply, { topColor: C.plyTop });
  l.lineStyle(2, shade(C.ply, 0.75), 1); l.lineBetween(865, depthY(0.24) - 54, 865, depthY(0.24));
  l.fillStyle(0x23282b, 1); l.fillRoundedRect(796, depthY(0.08) - 140, 140, 82, 6);
  l.fillStyle(0x3b4a52, 1); l.fillRect(802, depthY(0.08) - 134, 128, 70);
  l.fillStyle(0x23282b, 1); l.fillRect(858, depthY(0.08) - 58, 16, 6);
  l.fillStyle(0xf4f4f4, 1); l.fillRoundedRect(904, depthY(0.18) - 72, 40, 14, 4);
  l.fillRect(910, depthY(0.18) - 90, 3, 18); l.fillRect(934, depthY(0.18) - 90, 3, 18);
  items.routerLed = scene.add.graphics().setDepth(depthY(0.24) + 0.1);
  items.routerLed.fillStyle(0x45d07a, 1); items.routerLed.fillCircle(914, depthY(0.18) - 65, 2.5); items.routerLed.fillCircle(922, depthY(0.18) - 65, 2.5);
  // 窗邊矮櫃（私人抽屜）+ 盆栽
  l = layer(scene, depthY(0.22));
  box(l, 1076, 1226, 0, 0.22, 82, 0x9b6b43, { topColor: 0xb58257 });
  items.drawerFront = scene.add.graphics().setDepth(depthY(0.22) + 0.1);
  items.drawerFront.fillStyle(0x8a5d39, 1); items.drawerFront.fillRect(1090, depthY(0.22) - 70, 122, 28);
  items.drawerFront.fillStyle(0xd6b15e, 1); items.drawerFront.fillRect(1140, depthY(0.22) - 58, 22, 5);
  l.lineStyle(2, 0x7a522f, 1); l.strokeRect(1090, depthY(0.22) - 36, 122, 28);
  l.fillStyle(0xb5674a, 1); l.fillRect(1192, depthY(0.12) - 106, 24, 22);
  l.fillStyle(C.green, 1); l.fillCircle(1196, depthY(0.12) - 114, 10); l.fillCircle(1210, depthY(0.12) - 118, 12); l.fillCircle(1203, depthY(0.12) - 128, 9);
  // 摺枱 + 膠凳
  l = layer(scene, depthY(0.6));
  legs(l, 1420, 1590, 0.6, 62, 0x8d9499, 5);
  const dt = box(l, 1420, 1590, 0.3, 0.6, 6, 0xe3d6b8, { lift: 62, topColor: 0xefe4c9 });
  l.fillStyle(0xffffff, 1); l.fillEllipse(1470, dt.top - 4, 34, 8); l.fillEllipse(1540, dt.top - 4, 34, 8);
  l.fillStyle(0xb5523b, 1); l.fillRect(1500, dt.top - 26, 22, 22); // 保溫壺
  [[1400, 0.64], [1606, 0.5]].forEach(([x, d]) => { l.fillStyle(C.red, 1); l.fillRect(x - 18, depthY(d) - 40, 36, 8); l.fillRect(x - 14, depthY(d) - 32, 5, 32); l.fillRect(x + 9, depthY(d) - 32, 5, 32); });
  // 雪櫃（有紙仔同磁石）
  l = layer(scene, depthY(0.3));
  box(l, 1690, 1812, 0, 0.3, 236, 0xf0eee6, { topColor: 0xfaf9f4 });
  l.lineStyle(2, 0xcfcbc0, 1); l.lineBetween(1690, depthY(0.3) - 150, 1812, depthY(0.3) - 150);
  l.fillStyle(0xbfbab0, 1); l.fillRect(1700, depthY(0.3) - 210, 5, 40); l.fillRect(1700, depthY(0.3) - 130, 5, 50);
  items.fridgeNote = scene.add.graphics().setDepth(depthY(0.3) + 0.1);
  const fy = depthY(0.3);
  items.fridgeNote.fillStyle(0xfff4b8, 1); items.fridgeNote.fillRect(1730, fy - 220, 44, 50);
  items.fridgeNote.fillStyle(C.red, 1); items.fridgeNote.fillCircle(1752, fy - 220, 6);
  items.fridgeNote.fillStyle(0x7a6a50, 1); for (let i = 0; i < 4; i++) items.fridgeNote.fillRect(1736, fy - 206 + i * 9, 32 - (i % 2) * 8, 2);
  l.fillStyle(0xffffff, 1); l.fillRect(1756, fy - 120, 36, 44); l.fillStyle(0x5b8fa8, 1); l.fillCircle(1774, fy - 120, 5);
  l.fillStyle(0xd9a74a, 1); l.fillCircle(1712, fy - 98, 6); l.fillStyle(C.green, 1); l.fillCircle(1726, fy - 60, 6);
  return items;
}

export function buildBedroom(scene, sky) {
  const z = ZONES.bedroom;
  shell(scene, z, { tileA: 0xe4d6bf, tileB: 0xd6c5a8 });
  const wallG = scene.add.graphics().setDepth(-900);
  // 門
  wallG.fillStyle(0x9b7350, 1); wallG.fillRect(2460, 206, 100, FLOOR_BACK - 206);
  wallG.fillStyle(0xab8360, 1); wallG.fillRect(2470, 218, 80, 90); wallG.fillRect(2470, 318, 80, 110);
  wallG.fillStyle(0xd6b15e, 1); wallG.fillCircle(2474, 330, 5);
  windowGrille(wallG, 2850, 3010, 160, 290, sky);
  wallG.fillStyle(0xa9c3b5, 0.95); wallG.fillRect(2836, 150, 30, 160); wallG.fillRect(2996, 150, 30, 160);
  frame(wallG, 3220, 214, 70, 54, 0xd9a74a);
  const items = {};
  // 衣櫃
  let l = layer(scene, depthY(0.26));
  box(l, 2620, 2800, 0, 0.26, 300, 0x9b6b43, { topColor: 0xb58257 });
  l.lineStyle(2, 0x7a522f, 1); l.lineBetween(2710, depthY(0.26) - 300, 2710, depthY(0.26));
  l.fillStyle(0xd6b15e, 1); l.fillRect(2700, depthY(0.26) - 160, 4, 20); l.fillRect(2716, depthY(0.26) - 160, 4, 20);
  l.fillStyle(0xd8c7a0, 1); l.fillRect(2640, depthY(0.1) - 340, 60, 40); l.fillStyle(0x4a6b8a, 1); l.fillRect(2710, depthY(0.1) - 332, 54, 32);
  // 床（側面）
  l = layer(scene, depthY(0.62));
  const bx0 = 3000, bx1 = 3392, d1 = 0.62;
  const by = depthY(d1);
  l.fillStyle(0x6f4b31, 1); l.fillRect(3380, by - 190, 18, 190); // 床頭板
  l.fillStyle(0x8a6440, 1); l.fillRect(bx0, by - 70, bx1 - bx0, 20); // 床架
  l.fillStyle(0x6f4b31, 1); l.fillRect(bx0, by - 50, 12, 50); l.fillRect(bx1 - 22, by - 50, 12, 50);
  // 床下底空間
  l.fillStyle(0x2c231d, 1); l.fillRect(bx0 + 12, by - 50, bx1 - bx0 - 34, 50);
  l.fillStyle(0xc9b48a, 1); l.fillRect(3030, by - 34, 70, 34); l.fillRect(3250, by - 30, 80, 30); // 紙皮箱
  l.fillStyle(0xa78f68, 1); l.fillRect(3030, by - 34, 70, 4); l.fillRect(3250, by - 30, 80, 4);
  items.tinUnder = scene.add.graphics().setDepth(depthY(d1) + 0.1);
  items.tinUnder.fillStyle(0xa8332c, 1); items.tinUnder.fillRoundedRect(3150, by - 24, 64, 24, 4);
  items.tinUnder.fillStyle(0xd6b15e, 1); items.tinUnder.fillRect(3150, by - 24, 64, 4);
  // 床褥 + 被
  box(l, bx0, bx1 - 14, 0.06, d1, 26, 0xf2ede2, { lift: 70, topColor: 0xfbf8f1 });
  l.fillStyle(0x7fa3b8, 1); l.fillRoundedRect(bx0 - 6, by - 112, 270, 34, 10);
  l.fillStyle(0x6c93aa, 1); for (let i = 0; i < 6; i++) l.fillCircle(bx0 + 20 + i * 42, by - 96, 5);
  l.fillStyle(0xffffff, 1); l.fillRoundedRect(3300, by - 120, 70, 26, 10);
  // 床頭櫃 + 枱燈
  l = layer(scene, depthY(0.24));
  box(l, 3400, 3460, 0, 0.24, 70, 0x9b6b43, { topColor: 0xb58257 });
  l.fillStyle(0xe7d8b0, 1); l.fillTriangle(3416, depthY(0.12) - 120, 3446, depthY(0.12) - 120, 3431, depthY(0.12) - 146);
  l.fillRect(3429, depthY(0.12) - 120, 4, 34);
  // 地氈
  const rug = scene.add.graphics().setDepth(-800);
  rug.fillStyle(0xc98e7a, 0.5); rug.fillEllipse(2900, depthY(0.7), 260, 40);
  return items;
}

// ---------- 角色貼圖（程式繪製） ----------
export const HERO = { w: 72, h: 128 };
const VIEWS = ['side', 'front', 'back'];

export function makeHeroTexture(scene) {
  const cols = 4, rows = 4, { w, h } = HERO;
  const tex = scene.textures.createCanvas('hero', w * cols, h * rows);
  const ctx = tex.getContext();
  VIEWS.forEach((v, r) => { for (let f = 0; f < cols; f++) drawHero(ctx, f * w, r * h, v, f, false); });
  drawHero(ctx, 0, 3 * h, 'side', 0, true);
  drawHero(ctx, w, 3 * h, 'back', 0, true);
  VIEWS.forEach((v, r) => { for (let f = 0; f < cols; f++) tex.add(`${v}-${f}`, 0, f * w, r * h, w, h); });
  tex.add('crouch-side', 0, 0, 3 * h, w, h); tex.add('crouch-back', 0, w, 3 * h, w, h);
  tex.refresh();
}

function drawHero(c, ox, oy, view, frame, crouch) {
  const { w, h } = HERO, cx = ox + w / 2, foot = oy + h - 4;
  const skin = '#f1c9a2', hair = '#2d2420', shirt = '#d36b4f', pants = '#3f4d63', slipper = '#4a6b8a';
  const step = [0, 1, 0, -1][frame];
  const lift = crouch ? 34 : 0;
  c.save();
  // 影
  c.fillStyle = 'rgba(40,25,10,.18)'; c.beginPath(); c.ellipse(cx, foot, 20, 5, 0, 0, Math.PI * 2); c.fill();
  // 腳
  c.fillStyle = pants;
  if (crouch) {
    c.fillRect(cx - 14, foot - 26, 28, 20);
  } else if (view === 'side') {
    c.save(); c.translate(cx, foot - 40); c.rotate(step * 0.35); c.fillRect(-5, 0, 10, 36); c.restore();
    c.save(); c.translate(cx, foot - 40); c.rotate(-step * 0.35); c.fillRect(-5, 0, 10, 36); c.restore();
  } else {
    c.fillRect(cx - 12, foot - 40 + Math.max(0, step) * 3, 10, 36 - Math.max(0, step) * 3);
    c.fillRect(cx + 2, foot - 40 + Math.max(0, -step) * 3, 10, 36 - Math.max(0, -step) * 3);
  }
  c.fillStyle = slipper;
  if (view === 'side' && !crouch) { c.fillRect(cx - 6 + step * 10, foot - 6, 18, 6); c.fillRect(cx - 6 - step * 10, foot - 6, 18, 6); }
  else { c.fillRect(cx - 14, foot - 6, 12, 6); c.fillRect(cx + 2, foot - 6, 12, 6); }
  // 身
  const bodyTop = foot - 86 + lift;
  c.fillStyle = shirt; roundRect(c, cx - 17, bodyTop, 34, 48, 10); c.fill();
  // 手
  c.fillStyle = shirt;
  if (view === 'side') {
    c.save(); c.translate(cx, bodyTop + 6); c.rotate(crouch ? -0.9 : -step * 0.4); roundRect(c, -5, 0, 10, 34, 5); c.fill();
    c.fillStyle = skin; c.fillRect(-4, 30, 8, 8); c.restore();
  } else {
    c.fillRect(cx - 24, bodyTop + 6, 8, 30); c.fillRect(cx + 16, bodyTop + 6, 8, 30);
    c.fillStyle = skin; c.fillRect(cx - 24, bodyTop + 34, 8, 7); c.fillRect(cx + 16, bodyTop + 34, 8, 7);
  }
  // 頭
  const hy = bodyTop - 20;
  c.fillStyle = skin; c.beginPath(); c.arc(cx, hy, 21, 0, Math.PI * 2); c.fill();
  c.fillStyle = hair;
  if (view === 'back') { c.beginPath(); c.arc(cx, hy - 1, 22, 0, Math.PI * 2); c.fill(); }
  else if (view === 'front') {
    c.beginPath(); c.arc(cx, hy - 4, 22, Math.PI, 0); c.fill(); c.fillRect(cx - 22, hy - 4, 6, 18); c.fillRect(cx + 16, hy - 4, 6, 18);
    c.fillStyle = '#2b1d16'; c.fillRect(cx - 9, hy + 2, 4, 5); c.fillRect(cx + 5, hy + 2, 4, 5);
    c.fillStyle = '#e59a86'; c.fillRect(cx - 14, hy + 9, 5, 3); c.fillRect(cx + 9, hy + 9, 5, 3);
    c.fillStyle = '#8a3b33'; c.fillRect(cx - 3, hy + 12, 6, 2);
  } else {
    c.beginPath(); c.arc(cx - 3, hy - 3, 22, Math.PI * 0.95, Math.PI * 2.05); c.fill(); c.fillRect(cx - 24, hy - 4, 14, 20);
    c.fillStyle = '#2b1d16'; c.fillRect(cx + 9, hy + 1, 4, 5);
    c.fillStyle = '#e59a86'; c.fillRect(cx + 6, hy + 9, 6, 3);
  }
  c.restore();
}

function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
