// 各物件嘅內容同「手作互動」（moments）。全部 HTML/CSS。
import { bus } from '../bus.js';
import { openPanel, closePanel, h, toast } from './panel.js';
import { illustration } from './illustrations.js';
import * as store from '../data/store.js';
import { FAMILY, DRAWER, CONNECTORS, STATUS_LABEL } from '../data/demo-data.js';
import { barStops } from '../world/objects.js';

const reduced = () => document.documentElement.dataset.motion === 'reduced';
const wait = ms => new Promise(r => setTimeout(r, reduced() ? 0 : ms));
const member = id => FAMILY.members.find(m => m.id === id);
// 用字串頭 10 個字（YYYY-MM-DD）避免時區令日期走位
const fmtDate = v => { const s = typeof v === 'string' ? v : new Date(v).toISOString(); const [y, m, d] = s.slice(0, 10).split('-').map(Number); return `${y} 年 ${m} 月 ${d} 日`; };
const VIS = { private: '🔒 私人 · 預設唔分享', family_shared: '家人共享' };
const visTag = v => h('span', { class: `tag ${v}` }, VIS[v] || v);

// 撳住先算數嘅掣（滑鼠、觸控、鍵盤 Space/Enter 都得）
function holdButton(label, ms, onDone) {
  const b = h('button', { type: 'button', class: 'hold', 'data-autofocus': true }, h('i'), h('span', {}, label));
  let t = null, done = false;
  const start = e => { if (done || t) return; e && e.preventDefault(); b.classList.add('on'); t = setTimeout(() => { done = true; t = null; onDone(); }, reduced() ? 150 : ms); };
  const stop = () => { if (done) return; clearTimeout(t); t = null; b.classList.remove('on'); };
  b.addEventListener('pointerdown', e => { try { b.setPointerCapture(e.pointerId); } catch (_) {} start(e); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, stop));
  b.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); });
  b.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') stop(); });
  b.addEventListener('click', e => e.preventDefault());
  return b;
}

// 拖拉手勢：向某方向拖超過門檻就觸發；冇拖都可以撳旁邊個掣
function dragGesture(node, dir, onDone) {
  let sx = 0, sy = 0, active = false, fired = false;
  node.addEventListener('pointerdown', e => { active = true; sx = e.clientX; sy = e.clientY; try { node.setPointerCapture(e.pointerId); } catch (_) {} });
  node.addEventListener('pointermove', e => {
    if (!active || fired) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if ((dir === 'down' && dy > 40) || (dir === 'up' && dy < -30)) { fired = true; onDone(); }
  });
  node.addEventListener('pointerup', () => { active = false; });
}

// ================= 床 → 月餅盒 → 傳承索引 =================
export function bedMoment() {
  openPanel({
    kicker: '睡房 · 床下底', title: '蹲低睇吓床下底',
    onClose: () => { bus.emit('ui:crouch', false); bus.emit('ui:tin', false); },
    render(body, api) {
      const stage = h('div', { class: 'stage', style: 'opacity:.25' },
        h('div', { class: 'under-bed' }, h('div', { class: 'box1' }), h('div', { class: 'box2' })));
      const tin = h('div', { class: 'tin', role: 'img', 'aria-label': '紅色月餅盒' }, h('div', { class: 'tin-body' }), h('div', { class: 'paper' }), h('div', { class: 'tin-lid' }));
      stage.firstChild.append(tin);
      const say = h('p', { 'aria-live': 'polite' }, '床下底好黑，要蹲低先睇到。');
      const actions = h('div', { class: 'row', style: 'justify-content:center' });
      body.append(h('div', { class: 'moment' }, stage, say, actions));

      const step1 = holdButton('撳住蹲低', 900, async () => {
        bus.emit('ui:crouch', true);
        stage.style.transition = 'opacity .6s'; stage.style.opacity = 1;
        say.textContent = '見到喇：兩個紙皮箱，中間有個紅色月餅盒。';
        await wait(300);
        actions.replaceChildren(pullBtn);
        pullBtn.focus();
      });
      actions.append(step1);

      const pullBtn = h('button', { type: 'button', class: 'btn main' }, '拉個月餅盒出嚟（或者向下拖）');
      let pulled = false, opened = false;
      const pull = async () => {
        if (pulled) return; pulled = true;
        tin.classList.add('out'); bus.emit('ui:tin', true);
        say.textContent = '月餅盒有啲重。蓋邊仲貼住張舊膠紙。';
        await wait(500);
        actions.replaceChildren(openBtn); openBtn.focus();
      };
      pullBtn.addEventListener('click', pull);
      dragGesture(tin, 'down', pull);

      const openBtn = h('button', { type: 'button', class: 'btn main' }, '打開蓋（或者向上拖個蓋）');
      const open = async () => {
        if (!pulled || opened) return; opened = true;
        tin.classList.add('open');
        say.textContent = '入面唔係文件本身，而係一張張「喺邊度」嘅索引咭。';
        await wait(900);
        renderLegacy(body, api);
      };
      openBtn.addEventListener('click', open);
      dragGesture(tin, 'up', open);
    },
  });
}

async function renderLegacy(body, api) {
  api.setTitle('紅色月餅盒 · 重要資料索引', '睡房 · 床下底');
  let list = await store.get('legacy');
  const ul = h('ul', { class: 'legacy-list' });
  const draw = () => {
    ul.replaceChildren(...list.map((it, i) => h('li', { class: `card ${it.visibility === 'private' ? 'private' : ''}` },
      h('div', { class: 'row', style: 'justify-content:space-between' }, h('h3', {}, it.title), visTag(it.visibility)),
      h('p', { class: 'where' }, it.where),
      it.note ? h('p', { class: 'note' }, it.note) : null,
      h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn', onclick: () => edit(i) }, '修改')),
    )));
  };
  const form = h('div');
  const edit = i => {
    const it = i == null ? { id: `legacy-local-${Date.now()}`, title: '', where: '', note: '', visibility: 'private' } : { ...list[i] };
    const t = h('input', { value: it.title, maxlength: 40 }), w = h('textarea', { maxlength: 160 }), n = h('input', { value: it.note || '', maxlength: 80 });
    w.value = it.where;
    const v = h('select', {}, h('option', { value: 'private' }, '私人（預設）'), h('option', { value: 'family_shared' }, '家人共享'));
    v.value = it.visibility;
    form.replaceChildren(h('div', { class: 'card' },
      h('h3', {}, i == null ? '新增索引' : '修改索引'),
      h('p', { class: 'warn' }, '只寫「放喺邊、搵邊個」。切勿輸入密碼、銀行資料、一次性密碼或文件內容。'),
      h('label', {}, '項目', t), h('label', {}, '放喺邊 / 點搵', w), h('label', {}, '備註', n), h('label', {}, '私隱設定', v),
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'btn main', onclick: async () => {
          if (!t.value.trim() || !w.value.trim()) { toast('請填寫「項目」同「放喺邊」'); return; }
          Object.assign(it, { title: t.value.trim(), where: w.value.trim(), note: n.value.trim(), visibility: v.value });
          if (i == null) list.push(it); else list[i] = it;
          await store.set('legacy', list); form.replaceChildren(); draw(); toast('已儲存喺呢部瀏覽器（示範）');
        } }, '儲存'),
        h('button', { type: 'button', class: 'btn', onclick: () => form.replaceChildren() }, '取消')),
    ));
    t.focus();
  };
  draw();
  body.replaceChildren(
    h('p', { class: 'warn', role: 'note' }, h('b', {}, '呢個係原型，唔係安全保管庫。'), ' 呢度只記錄文件「放喺邊」，唔儲存文件本身。資料只存喺呢部瀏覽器（IndexedDB），冇加密，亦唔會同步畀家人。'),
    ul, form,
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn main', 'data-autofocus': true, onclick: () => edit(null) }, '＋ 加一張索引咭')),
  );
  body.querySelector('[data-autofocus]').focus();
}

// ================= 茶几相簿 =================
export function albumMoment() {
  openPanel({
    kicker: '客廳 · 茶几', title: '陳家相簿',
    async render(body) {
      const memories = await store.get('memories');
      let idx = 0;
      const page = h('div');
      const pos = h('span', { class: 'note', 'aria-live': 'polite' });
      const prev = h('button', { type: 'button', class: 'btn', onclick: () => go(-1) }, '← 上一頁');
      const next = h('button', { type: 'button', class: 'btn main', 'data-autofocus': true, onclick: () => go(1) }, '下一頁 →');
      const go = k => { idx = (idx + k + memories.length) % memories.length; draw(); };
      const draw = () => {
        const m = memories[idx];
        const people = (m.people || []).map(id => member(id)?.name).filter(Boolean).join('、');
        page.replaceChildren(h('article', { class: 'album-page' },
          h('div', { html: illustration(m.mediaRef) }),
          h('div', { class: 'row', style: 'justify-content:space-between' }, h('p', { class: 'cap' }, m.caption || fmtDate(m.timestamp)), visTag(m.visibility)),
          h('h3', {}, m.title),
          h('p', {}, m.content),
          people ? h('p', { class: 'note' }, `相中人：${people}`) : null,
          m.hasAudio ? audioPlaceholder('阿晴唱歌錄音（示範佔位）', 18) : null,
        ));
        pos.textContent = `第 ${idx + 1} / ${memories.length} 頁`;
      };
      body.addEventListener('keydown', e => {
        if (e.target.closest('input,textarea,select')) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      });
      draw();
      const addBox = h('div');
      body.append(page, h('div', { class: 'album-nav' }, prev, pos, next), addBox,
        h('button', { type: 'button', class: 'btn', onclick: () => addForm() }, '＋ 加一段回憶'),
        h('p', { class: 'note' }, '所有相片均為原創插圖，人物同故事全屬虛構。'));
      function addForm() {
        const t = h('input', { maxlength: 30, placeholder: '例如：第一次自己煲湯' });
        const dt = h('input', { type: 'date', value: new Date().toISOString().slice(0, 10) });
        const s = h('textarea', { maxlength: 300, placeholder: '寫低發生咩事、邊個喺度。' });
        const v = h('select', {}, h('option', { value: 'family_shared' }, '家人共享'), h('option', { value: 'private' }, '私人（只有自己）'));
        addBox.replaceChildren(h('div', { class: 'card' }, h('h3', {}, '加一段回憶'),
          h('label', {}, '標題', t), h('label', {}, '日期', dt), h('label', {}, '故事', s), h('label', {}, '邊個睇到', v),
          h('div', { class: 'row' },
            h('button', { type: 'button', class: 'btn main', onclick: async () => {
              if (!t.value.trim()) { toast('請寫個標題'); return; }
              memories.push({ id: `memory-local-${Date.now()}`, timestamp: new Date(dt.value || Date.now()).toISOString(), type: 'photo_story', people: [], content: s.value.trim() || '（未寫內容）', title: t.value.trim(), caption: `${fmtDate(dt.value || Date.now())} · 新加`, mediaRef: 'note', source: 'local', visibility: v.value, unlockAt: null });
              await store.set('memories', memories);
              idx = memories.length - 1; draw(); addBox.replaceChildren(); toast('已加入相簿（只存喺呢部瀏覽器）');
            } }, '放入相簿'),
            h('button', { type: 'button', class: 'btn', onclick: () => addBox.replaceChildren() }, '取消'))));
        t.focus();
      }
    },
  });
}

function audioPlaceholder(label, secs) {
  const bar = h('i'), btn = h('button', { type: 'button', class: 'btn' }, '▶ 播放');
  let t = null, p = 0;
  btn.addEventListener('click', () => {
    if (t) { clearInterval(t); t = null; btn.textContent = '▶ 播放'; return; }
    btn.textContent = '❚❚ 暫停';
    t = setInterval(() => { p = Math.min(100, p + 100 / (secs * 5)); bar.style.width = p + '%'; if (p >= 100) { clearInterval(t); t = null; p = 0; btn.textContent = '▶ 再播'; } }, 200);
  });
  return h('div', { class: 'audio' }, btn, h('div', { style: 'flex:1;display:grid;gap:.2rem' }, h('span', { class: 'note' }, `${label} · 模擬播放，冇真實錄音`), h('div', { class: 'bar' }, bar)));
}

// ================= 窗邊私人抽屜 =================
export function drawerMoment() {
  openPanel({
    kicker: '窗邊 · 私人抽屜', title: '媽媽嘅抽屜',
    render(body) {
      const stage = h('div', { class: 'stage drawer-stage' }, h('div', { class: 'drawer-box' }), h('div', { class: 'envelope' }));
      const say = h('p', { 'aria-live': 'polite' }, '呢個抽屜屬於陳太。家人行過見到，但係唔會自動睇到入面嘅嘢。');
      const area = h('div', { class: 'row', style: 'justify-content:center' });
      body.append(h('div', { class: 'moment' }, stage, h('span', { class: 'tag private' }, VIS.private), say, area));
      area.append(holdButton('撳住拉開抽屜', 800, async () => {
        stage.classList.add('open');
        await wait(900);
        renderDrawer(body);
      }));
    },
  });
}

function renderDrawer(body) {
  const { letter, voice, capsule } = DRAWER;
  const shareBox = h('div');
  body.replaceChildren(
    h('p', { class: 'warn' }, h('b', {}, '🔒 私人內容：'), '只有擁有人（陳太）睇到，預設唔會分享畀家人。家人嘅身份、頭像或者喺屋企出現，都唔代表有權限。'),
    h('article', { class: 'card private' },
      h('div', { class: 'row', style: 'justify-content:space-between' }, h('h3', {}, letter.title), visTag(letter.visibility)),
      h('p', { class: 'letter' }, letter.body),
      h('p', { class: 'note' }, `時間囊設定：${fmtDate(letter.unlockAt)} 先可以畀阿晴打開（示範概念）。`)),
    h('div', { class: 'card private' }, h('div', { class: 'row', style: 'justify-content:space-between' }, h('h3', {}, voice.title), visTag(voice.visibility)), audioPlaceholder(`長度 ${voice.length}`, 12)),
    h('div', { class: 'card private' }, h('h3', {}, `⏳ ${capsule.title}`), h('p', {}, capsule.note), h('p', { class: 'note' }, `示範解鎖日期：${fmtDate(capsule.unlockAt)}`)),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn', 'data-autofocus': true, onclick: () => shareChooser(shareBox) }, '我想分享畀……')),
    shareBox,
  );
  body.querySelector('[data-autofocus]').focus();
}

function shareChooser(box) {
  const boxes = FAMILY.members.filter(m => m.id !== DRAWER.ownerId).map(m => h('label', { class: 'check' }, h('input', { type: 'checkbox', value: m.id }), `${m.name}（${m.role}）`));
  box.replaceChildren(h('div', { class: 'card' }, h('h3', {}, '明確揀選分享對象'),
    h('p', { class: 'note' }, '分享一定要逐個揀、逐次確認。冇揀 = 冇分享。'), ...boxes,
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn main', onclick: () => {
      const n = box.querySelectorAll('input:checked').length;
      box.replaceChildren(h('p', { class: 'note', role: 'status' }, n ? `示範：已模擬揀選 ${n} 位家人。原型冇真實分享或傳送。` : '冇揀任何人，內容保持私人。'));
    } }, '確認'), h('button', { type: 'button', class: 'btn', onclick: () => box.replaceChildren() }, '取消'))));
  box.querySelector('input')?.focus();
}

// ================= 玄關：家人 =================
export function familyPanel() {
  openPanel({
    kicker: '玄關', title: FAMILY.name,
    render(body) {
      const status = ['喺屋企', '返緊工', '喺屋企', '返緊學'];
      body.append(
        h('p', {}, '拖鞋擺喺門口，就知邊個返咗嚟。'),
        h('div', { class: 'members' }, FAMILY.members.map((m, i) => h('div', { class: 'member' }, h('i', { style: `background:${m.colour}` }), h('div', {}, h('b', {}, `${m.name}（${m.role}）`), h('p', { class: 'note' }, `示範狀態：${status[i]}`))))),
        h('p', { class: 'warn' }, '全部人物虛構。示範版冇真實帳戶、登入或多人同步。家人出現喺屋企，唔代表可以睇其他人嘅私人物件。'),
        h('button', { type: 'button', class: 'btn main', 'data-autofocus': true, onclick: () => closePanel() }, '入屋'),
      );
    },
  });
}

// ================= 雪櫃門：拜山位置卡 =================
export function gravePanel() {
  openPanel({
    kicker: '雪櫃門 · 家庭工具', title: '拜山位置卡',
    async render(body) {
      const g = await store.get('grave');
      const savedAt = await store.get('graveSavedAt');
      const status = h('p', { class: 'note', role: 'status' });
      const showStatus = (s) => { status.textContent = (navigator.onLine ? '而家有網絡。' : '而家離線中，顯示緊已儲存嘅資料。') + (s ? ` 已儲存離線版：${new Date(s).toLocaleString('zh-HK')}` : ' 未儲存離線版。'); };
      showStatus(savedAt);
      const L = g.location;
      body.append(
        h('div', { class: 'row' }, h('span', { class: 'tag status' }, '示範資料 · 虛構地點'), h('span', { class: 'tag family_shared' }, '家人共享')),
        h('div', { class: 'card' },
          h('h3', {}, g.person),
          h('dl', { class: 'dl' }, h('dt', {}, '地點'), h('dd', {}, g.facility), h('dt', {}, '座數'), h('dd', {}, L.block), h('dt', {}, '樓層'), h('dd', {}, L.floor), h('dt', {}, '行數'), h('dd', {}, L.row), h('dt', {}, '龕位'), h('dd', {}, L.niche))),
        h('div', { class: 'card' }, h('h3', {}, '點樣去'), h('ol', { class: 'steps' }, g.directions.map(d => h('li', {}, d)))),
        h('div', { class: 'card' }, h('h3', {}, '拜山要帶'), ...g.checklist.map(c => h('label', { class: 'check' }, h('input', { type: 'checkbox' }), c))),
        h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn main', 'data-autofocus': true, onclick: async () => {
            const now = new Date().toISOString();
            await store.set('graveSavedAt', now);
            const ok = await cacheReady();
            showStatus(now);
            toast(ok ? '已儲存：冇網絡都開到呢張卡' : '已儲存資料；離線快取未準備好，請重新載入一次');
          } }, '儲存離線版'),
          h('button', { type: 'button', class: 'btn', disabled: true, title: '示範版冇真實地圖連結' }, '開地圖（需要網絡 · 示範版不可用）')),
        status,
        h('p', { class: 'note' }, g.note),
      );
    },
  });
}

async function cacheReady() {
  try {
    if (!('serviceWorker' in navigator)) return false;
    const reg = await navigator.serviceWorker.ready;
    return !!reg.active;
  } catch (_) { return false; }
}

// ================= 電視櫃：Connector 展示 =================
export function connectorsPanel() {
  openPanel({
    kicker: '電視櫃 · 路由器', title: '連接其他服務',
    render(body) {
      body.append(
        h('p', {}, '返屋企唔會重新建立所有服務，而係逐步連接家庭已經用緊嘅平台。'),
        h('p', { class: 'warn' }, h('b', {}, '目前冇任何帳戶已連接。'), ' 以下係概念展示，狀態如實標示。'),
        ...CONNECTORS.map(c => {
          const card = h('div', { class: 'card' },
            h('div', { class: 'row', style: 'justify-content:space-between' }, h('h3', {}, c.name), h('span', { class: `tag status ${c.status}` }, `${STATUS_LABEL[c.status]} · ${c.status}`)),
            h('p', { class: 'note' }, c.kind), h('p', {}, c.desc));
          if (c.id === 'conn-photo') {
            const preview = h('div', { class: 'row' });
            const input = h('input', { type: 'file', accept: 'image/*', multiple: true, 'aria-label': '揀本機相片預覽' });
            input.addEventListener('change', () => {
              preview.replaceChildren(...[...input.files].slice(0, 6).map(f => h('img', { src: URL.createObjectURL(f), alt: f.name, style: 'width:88px;height:88px;object-fit:cover;border-radius:8px' })));
              toast('只喺呢部瀏覽器預覽，冇上載、冇儲存');
            });
            card.append(h('label', {}, '試吓揀相（只會本機預覽）', input), preview);
          } else {
            card.append(h('button', { type: 'button', class: 'btn', disabled: true }, '未連接 · 概念'));
          }
          return card;
        }),
        h('p', { class: 'note' }, '日後實作只會用官方批准嘅 API、用戶同意嘅匯入、官方連結或者合作夥伴認可嘅方法。'),
      );
      body.querySelector('h3')?.setAttribute('tabindex', '-1');
    },
  });
}

// ================= 簡易選單 / 說明 / 重設 =================
export function shortcutPanel() {
  openPanel({
    kicker: '簡易選單', title: '想睇邊樣？',
    render(body) {
      body.append(
        h('p', {}, '撳一下，角色會自己行過去打開。唔使控制方向。'),
        h('div', { class: 'shortcut-grid' }, barStops().map((o, i) => h('button', { type: 'button', 'data-autofocus': i === 0 || null, onclick: () => { closePanel(); bus.emit('ui:go', { id: o.id, then: 'interact' }); } },
          h('b', {}, o.glyph), h('span', {}, o.displayName)))),
      );
    },
  });
}

export function helpPanel() {
  openPanel({
    kicker: '操作說明', title: '點樣玩',
    render(body) {
      body.append(h('div', { class: 'card' }, h('h3', {}, '電腦'), h('ul', {},
        h('li', {}, 'WASD 或方向鍵：行（上下 = 行近牆 / 行近你）'),
        h('li', {}, '放手：角色會自動行去最近嘅物件'),
        h('li', {}, 'E 或 Enter：打開附近嘅物件'),
        h('li', {}, '1 至 6：直接行去底部嘅停站'),
        h('li', {}, 'Esc：關閉面板'))),
        h('div', { class: 'card' }, h('h3', {}, '手機 / 平板'), h('ul', {},
          h('li', {}, '撳畫面任何位置：行過去'), h('li', {}, '撳物件：行過去並顯示提示'), h('li', {}, '右下角方向掣：慢慢行'), h('li', {}, '撳啡色提示掣：打開'))),
        h('div', { class: 'card' }, h('h3', {}, '長者 / 簡易模式'), h('p', {}, '撳上面「簡易選單」，揀一樣嘢，角色會自己行過去打開。「大字」可以放大全部文字。')),
        h('button', { type: 'button', class: 'btn main', 'data-autofocus': true, onclick: () => closePanel() }, '明白'));
    },
  });
}

export function resetPanel(onReset) {
  openPanel({
    kicker: '示範工具', title: '重設示範？',
    render(body) {
      body.append(h('p', {}, '會清除喺呢部瀏覽器新加或者修改過嘅回憶同索引，返回最初嘅示範資料，角色返去門口。'),
        h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn main', 'data-autofocus': true, onclick: async () => { await store.reset(); closePanel(); onReset(); toast('已重設示範'); } }, '確認重設'),
          h('button', { type: 'button', class: 'btn', onclick: () => closePanel() }, '取消')));
    },
  });
}
