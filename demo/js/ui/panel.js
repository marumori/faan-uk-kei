// 面板管理：開 / 關、Esc、焦點鎖定、暫停場景輸入。
import { bus } from '../bus.js';

const el = document.getElementById('panel');
const body = document.getElementById('panelBody');
const titleEl = document.getElementById('panelTitle');
const kickerEl = document.getElementById('panelKicker');
const closeBtn = document.getElementById('panelClose');
let onCloseFn = null;
let returnFocus = null;

const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

export function isOpen() { return !el.hidden; }

export function openPanel({ kicker = '', title, render, onClose }) {
  if (isOpen()) closePanel(true);
  returnFocus = document.activeElement;
  kickerEl.textContent = kicker;
  titleEl.textContent = title;
  body.replaceChildren();
  onCloseFn = onClose || null;
  el.hidden = false;
  bus.emit('ui:pause', true);
  bus.emit('ui:panel', true);
  render(body, { setTitle: (t, k) => { titleEl.textContent = t; if (k !== undefined) kickerEl.textContent = k; }, close: closePanel });
  requestAnimationFrame(() => (body.querySelector('[data-autofocus]') || closeBtn).focus());
}

export function closePanel(silent) {
  if (!isOpen()) return;
  el.hidden = true;
  body.replaceChildren();
  const fn = onCloseFn; onCloseFn = null;
  fn && fn();
  bus.emit('ui:panel', false);
  if (!silent) {
    bus.emit('ui:pause', false);
    const wrap = document.getElementById('game-wrap');
    (returnFocus && document.contains(returnFocus) && returnFocus !== document.body ? returnFocus : wrap).focus({ preventScroll: true });
  }
}

closeBtn.addEventListener('click', () => closePanel());
el.addEventListener('pointerdown', e => { if (e.target === el) closePanel(); });
document.addEventListener('keydown', e => {
  if (!isOpen()) return;
  if (e.key === 'Escape') { e.preventDefault(); closePanel(); return; }
  if (e.key === 'Tab') {
    const f = [...el.querySelectorAll(FOCUSABLE)].filter(n => n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// 細小 DOM 工具
export function h(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'html') n.innerHTML = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) n.append(c instanceof Node ? c : document.createTextNode(c));
  return n;
}

let toastT;
export function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
}
