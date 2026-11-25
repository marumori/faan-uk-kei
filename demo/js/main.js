// 入口：啟動 Phaser、連接 HTML UI。
import { bus } from './bus.js';
import { BootScene } from './scenes/BootScene.js';
import { HomeScene } from './scenes/HomeScene.js';
import { barStops, byId } from './world/objects.js';
import { isOpen, toast } from './ui/panel.js';
import * as V from './ui/views.js';

const $ = id => document.getElementById(id);
const root = document.documentElement;

// ---------- 設定（只係個人偏好，用 localStorage） ----------
const pref = (k, v) => { try { if (v === undefined) return localStorage.getItem('fuk-' + k); localStorage.setItem('fuk-' + k, v); } catch (_) { return null; } };
function applyPrefs() {
  const big = pref('text') === 'l';
  const reduced = pref('motion') === 'reduced' || (pref('motion') === null && matchMedia('(prefers-reduced-motion: reduce)').matches);
  root.dataset.text = big ? 'l' : '';
  root.dataset.motion = reduced ? 'reduced' : '';
  $('btnText').setAttribute('aria-pressed', big);
  $('btnMotion').setAttribute('aria-pressed', reduced);
  bus.emit('ui:motion', reduced);
}
applyPrefs();
$('btnText').onclick = () => { pref('text', root.dataset.text === 'l' ? '' : 'l'); applyPrefs(); };
$('btnMotion').onclick = () => { pref('motion', root.dataset.motion === 'reduced' ? 'full' : 'reduced'); applyPrefs(); };
$('btnShortcut').onclick = () => V.shortcutPanel();
$('btnHelp').onclick = () => V.helpPanel();
$('btnReset').onclick = () => V.resetPanel(() => { bus.emit('ui:reset'); setCurrent(null); $('zoneLabel').textContent = '客廳'; });

// ---------- 停站列 ----------
const stops = barStops();
bus.barStops = stops;
const bar = $('stopBar');
stops.forEach((o, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'stop'; b.dataset.id = o.id;
  b.setAttribute('aria-label', `${i + 1}：${o.displayName}`);
  b.innerHTML = `<span class="num" aria-hidden="true">${i + 1}</span><b aria-hidden="true">${o.glyph}</b><small aria-hidden="true">${o.displayName.split(' · ')[0]}</small>`;
  b.addEventListener('click', e => { bus.emit('ui:go', { id: o.id }); if (e.detail) b.blur(); });
  bar.append(b);
});
function setCurrent(id) { bar.querySelectorAll('.stop').forEach(b => b.setAttribute('aria-current', b.dataset.id === id)); }

// ---------- 互動提示（cue） ----------
const cue = $('cue'), cueText = $('cueText');
let cueObj = null;
cue.addEventListener('click', () => bus.emit('ui:interact'));
bus.on('scene:near', e => {
  const n = e.detail;
  if (!n || isOpen()) { if (!cue.hidden) cue.hidden = true; cueObj = null; return; }
  if (cueObj !== n.obj) { cueObj = n.obj; cueText.textContent = n.obj.interactionLabel; cue.hidden = false; }
  cue.classList.toggle('arrived', n.arrived);
  const w = cue.offsetWidth, wrapW = $('game-wrap').clientWidth;
  const x = Math.max(8, Math.min(wrapW - w - 8, n.sx - w / 2));
  const y = Math.max(52, n.sy - 64);
  cue.style.transform = `translate(${x}px,${y}px)`;
});
bus.on('scene:arrived', e => setCurrent(e.detail.id));
bus.on('scene:zone', e => { $('zoneLabel').textContent = e.detail.name; });
bus.on('scene:hint', () => toast('行近啲物件先打開得。可以撳底部嘅停站。'));
bus.on('scene:interact', e => {
  const { kind, arg } = e.detail;
  const fn = { 'moment:bed': V.bedMoment, 'moment:album': V.albumMoment, 'moment:drawer': V.drawerMoment, 'panel:family': V.familyPanel, 'panel:grave': V.gravePanel, 'panel:connectors': V.connectorsPanel }[`${kind}:${arg}`];
  fn && fn();
});

// ---------- 觸控方向掣 ----------
document.querySelectorAll('#touchpad button').forEach(b => {
  const dir = b.dataset.dir;
  b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (_) {} bus.emit('ui:move', { dir, on: true }); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, () => bus.emit('ui:move', { dir, on: false })));
});

// ---------- 入門 ----------
const door = $('door');
function enter(then) {
  door.classList.add('opening');
  const reduced = root.dataset.motion === 'reduced';
  setTimeout(() => {
    door.classList.add('leaving');
    bus.emit('ui:pause', false);
    $('game-wrap').focus({ preventScroll: true });
    setTimeout(() => { door.hidden = true; }, reduced ? 0 : 700);
    then && then();
  }, reduced ? 0 : 900);
}
$('enterWalk').onclick = () => enter(() => toast('我返嚟喇！用方向鍵行，或者撳底部嘅停站。'));
$('enterDirect').onclick = () => enter(() => V.shortcutPanel());

// ---------- Phaser ----------
window.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#3a2d25',
  scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
  render: { antialias: true },
  input: { keyboard: false },
  scene: [BootScene, HomeScene],
});

// ---------- 離線（只承諾拜山位置卡） ----------
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// 方便示範同測試
window.faanUkKei = { go: id => bus.emit('ui:go', { id }), byId };
