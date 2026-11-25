// HomeScene：屋企場景、鏡頭、輸入、停站（stops）邏輯。UI 透過 bus 溝通。
import { bus } from '../bus.js';
import { WORLD_H, WALL, ZONES, depthY, yToDepth, zoneAt } from '../world/layout.js';
import { OBJECTS, byId, doorOf } from '../world/objects.js';
import { buildHome, buildBedroom, skyFor } from '../world/art.js';
import { Player } from '../player.js';

const SETTLE_RANGE = 150;
const MOVE_KEYS = {
  ArrowLeft: 'L', a: 'L', A: 'L', ArrowRight: 'R', d: 'R', D: 'R',
  ArrowUp: 'U', w: 'U', W: 'U', ArrowDown: 'D', s: 'D', S: 'D',
};

export class HomeScene extends Phaser.Scene {
  constructor() { super('HomeScene'); }

  create() {
    this.paused = true; // 未入門前唔郁得
    this.reducedMotion = document.documentElement.dataset.motion === 'reduced';
    this.held = new Set();
    this.keyWalking = false;
    this.near = null;
    this.arrivedAt = null;

    const sky = skyFor(new Date().getHours());
    this.items = { ...buildHome(this, sky), ...buildBedroom(this, sky) };
    if (sky.tintA) this.add.rectangle(0, 0, 4000, WORLD_H, sky.tint, sky.tintA).setOrigin(0).setDepth(5000).setBlendMode(Phaser.BlendModes.MULTIPLY);

    // 床下月餅盒（拉出嚟之後顯示喺床前）
    const tin = this.add.graphics();
    tin.fillStyle(0xa8332c, 1); tin.fillRoundedRect(-32, -26, 64, 26, 5);
    tin.fillStyle(0xd6b15e, 1); tin.fillRect(-32, -26, 64, 5);
    tin.fillStyle(0xd6b15e, 1); tin.fillCircle(0, -13, 6);
    this.tinOut = tin.setPosition(3182, depthY(0.72)).setDepth(depthY(0.72)).setVisible(false);

    this.player = new Player(this, 196, 0.62);
    this.zone = ZONES.home;
    this.fitCamera();
    this.scale.on('resize', () => this.fitCamera());

    this.bindKeys();
    this.input.on('pointerdown', p => this.onPointer(p));

    bus.on('ui:go', e => this.goStop(e.detail.id, e.detail));
    bus.on('ui:interact', () => this.interact());
    bus.on('ui:pause', e => this.setPaused(e.detail));
    bus.on('ui:crouch', e => this.player.setCrouch(e.detail));
    bus.on('ui:tin', e => { this.tinOut.setVisible(e.detail); this.items.tinUnder.setVisible(!e.detail); });
    bus.on('ui:motion', e => { this.reducedMotion = e.detail; });
    bus.on('ui:reset', () => this.resetWorld());
    bus.on('ui:move', e => this.setHeld(e.detail.dir, e.detail.on));
    bus.on('ui:panel', e => this.panelShift(e.detail));
    bus.emit('scene:ready');
  }

  // ---------- 鏡頭 ----------
  fitCamera() {
    const cam = this.cameras.main, w = this.scale.width, h = this.scale.height;
    const zoom = Math.min(h / WORLD_H, w / 640);
    cam.setZoom(zoom);
    this.setZoneBounds(this.zone);
    cam.startFollow(this.player.sprite, true, 0.1, 0.1, 0, 120);
  }

  setZoneBounds(z) {
    const pad = WALL + 30, extra = this.shifted ? 800 : 0;
    this.cameras.main.setBounds(z.x0 - pad, 0, z.x1 - z.x0 + pad * 2 + extra, WORLD_H);
  }

  // 面板喺右邊打開時，將角色推去畫面左半邊，等觀眾仍然見到佢
  panelShift(on) {
    const cam = this.cameras.main, w = this.scale.width;
    this.shifted = on && w > 760;
    const panelW = Math.min(600, w);
    cam.setFollowOffset(this.shifted ? -panelW / 2 / cam.zoom : 0, 0);
    this.setZoneBounds(this.zone);
  }

  // ---------- 輸入 ----------
  bindKeys() {
    const typing = () => /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
    window.addEventListener('keydown', e => {
      if (this.paused || typing()) return;
      const m = MOVE_KEYS[e.key];
      if (m) { e.preventDefault(); this.setHeld(m, true); return; }
      if ((e.key === 'e' || e.key === 'E' || e.key === 'Enter') && !e.repeat) {
        if (e.key === 'Enter' && document.activeElement && document.activeElement !== document.body && document.activeElement.id !== 'game-wrap') return;
        e.preventDefault(); this.interact(); return;
      }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9) { const stop = bus.barStops?.[n - 1]; if (stop) this.goStop(stop.id); }
    });
    window.addEventListener('keyup', e => { const m = MOVE_KEYS[e.key]; if (m) this.setHeld(m, false); });
    window.addEventListener('blur', () => { this.held.clear(); this.afterKeys(); });
  }

  setHeld(dir, on) {
    if (this.paused && on) return;
    if (on) { this.held.add(dir); this.keyWalking = true; this.arrivedAt = null; }
    else { this.held.delete(dir); if (!this.held.size) this.afterKeys(); }
  }

  afterKeys() {
    if (!this.keyWalking) return;
    this.keyWalking = false;
    this.settleNearest();
  }

  // 放手之後自動「吸」去最近嘅停站
  settleNearest() {
    const p = this.player;
    let best = null, bd = Infinity;
    for (const o of OBJECTS) {
      if (!o.enabled || o.sceneId !== p.zone.id || o.objectType === 'door') continue;
      const dx = Math.abs(o.interactionPoint.x - p.x);
      if (dx < bd) { bd = dx; best = o; }
    }
    if (best && bd < SETTLE_RANGE) this.goStop(best.id);
  }

  onPointer(pointer) {
    if (this.paused) return;
    const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const hit = OBJECTS.find(o => o.enabled && wp.x >= o.hit.x0 && wp.x <= o.hit.x1 && wp.y >= o.hit.y0 && wp.y <= o.hit.y1);
    if (hit) { this.goStop(hit.id); return; }
    const z = this.player.zone;
    const x = Phaser.Math.Clamp(wp.x, z.x0 + WALL + 24, z.x1 - WALL - 24);
    const d = wp.y > 430 ? yToDepth(wp.y) : 0.75;
    this.arrivedAt = null;
    this.player.walkTo(x, d, () => {
      const near = this.nearestStop(70);
      if (near) this.goStop(near.id);
    });
  }

  nearestStop(range) {
    const p = this.player;
    let best = null, bd = range;
    for (const o of OBJECTS) {
      if (!o.enabled || o.sceneId !== p.zone.id) continue;
      const dx = Math.abs(o.interactionPoint.x - p.x);
      if (dx < bd) { bd = dx; best = o; }
    }
    return best;
  }

  // ---------- 停站 ----------
  goStop(id, opts = {}) {
    const o = byId(id);
    if (!o || this.paused && !opts.force) return;
    const p = this.player;
    this.arrivedAt = null;
    if (o.sceneId !== p.zone.id) {
      const door = doorOf(p.zone.id);
      p.walkTo(door.interactionPoint.x, door.interactionPoint.d, () => this.changeZone(o.sceneId, () => this.goStop(id, opts)));
      return;
    }
    p.walkTo(o.interactionPoint.x, o.interactionPoint.d, () => {
      p.face(o.face || 'back');
      this.arrivedAt = o.id;
      bus.emit('scene:arrived', o);
      if (opts.then === 'interact') this.interact();
    });
  }

  changeZone(zoneId, after) {
    const cam = this.cameras.main, target = ZONES[zoneId];
    const arriveDoor = doorOf(zoneId);
    const done = () => {
      this.zone = target; this.arrivedAt = null;
      this.player.place(arriveDoor.interactionPoint.x, arriveDoor.interactionPoint.d + 0.12);
      this.player.face('front');
      this.setZoneBounds(target);
      cam.centerOn(this.player.x, WORLD_H / 2);
      bus.emit('scene:zone', target);
      if (this.reducedMotion) { after && after(); return; }
      cam.fadeIn(260, 36, 28, 23);
      cam.once('camerafadeincomplete', () => after && after());
    };
    if (this.reducedMotion) { done(); return; }
    cam.fadeOut(260, 36, 28, 23);
    cam.once('camerafadeoutcomplete', done);
  }

  interact() {
    if (this.paused) return;
    const o = this.near;
    if (!o) { bus.emit('scene:hint'); return; }
    this.player.stop();
    this.player.face(o.face || 'back');
    const [kind, arg] = o.interactionAction.split(':');
    if (kind === 'go') { this.changeZone(arg, () => {}); return; }
    bus.emit('scene:interact', { obj: o, kind, arg });
  }

  setPaused(v) {
    this.paused = v;
    if (v) { this.held.clear(); this.keyWalking = false; this.player.stop(); }
  }

  resetWorld() {
    this.tinOut.setVisible(false); this.items.tinUnder.setVisible(true);
    this.player.setCrouch(false);
    if (this.player.zone.id !== 'home') {
      this.zone = ZONES.home; this.setZoneBounds(this.zone);
    }
    this.player.place(196, 0.62); this.player.face('front');
    this.cameras.main.centerOn(196, WORLD_H / 2);
  }

  // ---------- 每格更新 ----------
  update(time, delta) {
    const dt = Math.min(0.1, delta / 1000);
    const h = this.held;
    const input = this.paused ? { x: 0, d: 0 } : {
      x: (h.has('R') ? 1 : 0) - (h.has('L') ? 1 : 0),
      d: (h.has('D') ? 1 : 0) - (h.has('U') ? 1 : 0),
    };
    this.player.update(dt, input);

    // 互動範圍
    const p = this.player;
    let near = null, bd = Infinity;
    for (const o of OBJECTS) {
      if (!o.enabled || o.sceneId !== p.zone.id) continue;
      const dx = Math.abs(o.interactionPoint.x - p.x);
      if (dx < o.interactionRadius && dx < bd) { bd = dx; near = o; }
    }
    if (near !== this.near) { this.near = near; }
    const cam = this.cameras.main;
    if (near) {
      const top = near.hit.y0;
      const sx = (((near.hit.x0 + near.hit.x1) / 2) - cam.worldView.x) * cam.zoom;
      const sy = (top - cam.worldView.y) * cam.zoom;
      bus.emit('scene:near', { obj: near, sx, sy, arrived: this.arrivedAt === near.id });
    } else bus.emit('scene:near', null);

    // 小動畫
    if (!this.reducedMotion) {
      this.items.fanBlades.rotation += dt * 9;
      this.items.routerLed.alpha = Math.sin(time / 180) > 0 ? 1 : 0.3;
    }
  }
}
