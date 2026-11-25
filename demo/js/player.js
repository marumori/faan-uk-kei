// 角色控制：輸入、移動、碰撞、idle / walking、方向、自動行去停站。
import { BLOCKERS, ZONES, WALL, depthY, depthScale, zoneAt } from './world/layout.js';

const SPEED_X = 250;   // px / s
const SPEED_D = 0.95;  // depth / s
const RX = 20, RD = 0.05;
const CORRIDOR = 0.9;  // 前面通道，永遠暢通

export function blocked(x, d) {
  const z = zoneAt(x);
  if (x < z.x0 + WALL + RX || x > z.x1 - WALL - RX || d < 0 || d > 1) return true;
  return BLOCKERS.some(b => b.zone === z.id && x + RX > b.x0 && x - RX < b.x1 && d + RD > b.d0 && d - RD < b.d1);
}

function segmentClear(a, b) {
  const n = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, (b.d - a.d) * 300) / 8));
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    if (blocked(a.x + (b.x - a.x) * t, a.d + (b.d - a.d) * t)) return false;
  }
  return true;
}

export function planPath(from, to) {
  if (segmentClear(from, to)) return [to];
  return [{ x: from.x, d: CORRIDOR }, { x: to.x, d: CORRIDOR }, to];
}

export class Player {
  constructor(scene, x, d) {
    this.scene = scene;
    this.x = x; this.d = d;
    this.facing = 1; this.view = 'front';
    this.moving = false; this.crouching = false;
    this.path = null; this.onArrive = null;
    this.t = 0;
    this.sprite = scene.add.sprite(x, depthY(d), 'hero', 'front-0').setOrigin(0.5, 1);
    this.sync();
  }

  place(x, d) { this.x = x; this.d = d; this.path = null; this.moving = false; this.sync(); }

  walkTo(x, d, onArrive) {
    this.crouching = false;
    this.path = planPath({ x: this.x, d: this.d }, { x, d });
    this.onArrive = onArrive || null;
  }

  stop() { this.path = null; this.onArrive = null; this.moving = false; }

  face(view) { this.view = view; this.sync(); }

  setCrouch(v) { this.crouching = v; this.sync(); }

  update(dt, input) {
    this.t += dt;
    let vx = 0, vd = 0;
    if (input.x || input.d) {
      this.path = null; this.onArrive = null; this.crouching = false;
      vx = input.x * SPEED_X; vd = input.d * SPEED_D;
    } else if (this.path) {
      const p = this.path[0];
      const dx = p.x - this.x, dd = p.d - this.d;
      if (Math.abs(dx) < 3 && Math.abs(dd) < 0.012) {
        this.x = p.x; this.d = p.d; this.path.shift();
        if (!this.path.length) {
          this.path = null; this.moving = false;
          const cb = this.onArrive; this.onArrive = null; cb && cb();
        }
      } else {
        const tx = Math.abs(dx) / SPEED_X, td = Math.abs(dd) / SPEED_D, T = Math.max(tx, td, 1e-3);
        vx = dx / T; vd = dd / T;
        // 避免最後一步衝過頭
        if (Math.abs(vx * dt) > Math.abs(dx)) vx = dx / dt;
        if (Math.abs(vd * dt) > Math.abs(dd)) vd = dd / dt;
      }
    }
    const nx = this.x + vx * dt, nd = this.d + vd * dt;
    let movedX = false, movedD = false;
    if (vx && !blocked(nx, this.d)) { this.x = nx; movedX = true; }
    if (vd && !blocked(this.x, nd)) { this.d = nd; movedD = true; }
    // 手動行被家具擋住：自動滑去前面通道，唔使玩家精準走位
    if (input.x && !input.d && !movedX && !blocked(nx, CORRIDOR)) {
      const step = Math.sign(CORRIDOR - this.d) * SPEED_D * dt;
      if (step && !blocked(this.x, this.d + step)) { this.d += step; movedD = true; }
    }
    if (this.path && !movedX && !movedD && (vx || vd)) {
      // 路徑被阻：行去前面通道再試
      this.path.unshift({ x: this.x, d: CORRIDOR });
    }
    this.moving = movedX || movedD;
    if (this.moving) {
      if (Math.abs(vx) >= Math.abs(vd) * 260) { this.view = 'side'; this.facing = vx > 0 ? 1 : -1; }
      else this.view = vd < 0 ? 'back' : 'front';
    }
    this.sync();
  }

  sync() {
    const s = this.sprite, k = depthScale(this.d);
    s.x = this.x; s.y = depthY(this.d);
    let frame;
    if (this.crouching) frame = this.view === 'side' ? 'crouch-side' : 'crouch-back';
    else if (this.moving) frame = `${this.view}-${Math.floor(this.t * 8) % 4}`;
    else frame = `${this.view}-0`;
    s.setFrame(frame);
    s.setFlipX(this.view === 'side' && this.facing < 0);
    // idle 呼吸
    const breathe = !this.moving && !this.crouching && !this.scene.reducedMotion ? Math.sin(this.t * 2.4) * 0.012 : 0;
    s.setScale(k, k * (1 + breathe));
    s.setDepth(s.y + 0.5);
  }

  get zone() { return zoneAt(this.x); }
}

export { ZONES };
