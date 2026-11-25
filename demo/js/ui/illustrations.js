// 相簿插圖：原創 SVG，代替真實相片（示範用）
const wrap = (bg, inner, label) => `<svg viewBox="0 0 320 200" role="img" aria-label="${label}"><rect width="320" height="200" fill="${bg}"/>${inner}</svg>`;

const ART = {
  lantern: () => wrap('#22304f', `
    <rect x="0" y="120" width="320" height="80" fill="#3a3f52"/>
    ${[20, 80, 250].map((x, i) => `<rect x="${x}" y="${30 + i * 10}" width="50" height="${150 - i * 10}" fill="#2b3148"/>`).join('')}
    ${[30, 42, 92, 104, 260, 272].map((x, i) => `<rect x="${x}" y="${50 + (i % 3) * 22}" width="7" height="8" fill="#ffdf9e"/>`).join('')}
    <circle cx="270" cy="30" r="16" fill="#fff4c4"/>
    <line x1="150" y1="40" x2="150" y2="70" stroke="#8a6440" stroke-width="3"/>
    <path d="M150 70 l26 22 -26 22 -26 -22z" fill="#f2b84b" stroke="#d9862e" stroke-width="3"/>
    <path d="M150 70 v44 M124 92 h52" stroke="#d9862e" stroke-width="2"/>
    <circle cx="150" cy="92" r="30" fill="#ffd27a" opacity=".25"/>
    <rect x="118" y="130" width="22" height="50" rx="8" fill="#c06a4f"/><circle cx="129" cy="122" r="11" fill="#f1c9a2"/>
    <rect x="160" y="140" width="16" height="40" rx="6" fill="#5b8fa8"/><circle cx="168" cy="133" r="9" fill="#f1c9a2"/>`, '中秋平台玩燈籠插圖'),
  dinner: () => wrap('#efe2c8', `
    <rect x="0" y="0" width="320" height="110" fill="#f6eedf"/>
    <rect x="40" y="20" width="60" height="70" fill="#fff" stroke="#b5483f" stroke-width="3"/>
    <ellipse cx="160" cy="140" rx="120" ry="40" fill="#e3d6b8" stroke="#a8977a" stroke-width="3"/>
    ${[[110, 130], [160, 122], [210, 130], [135, 152], [190, 152]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="18" ry="7" fill="#fff" stroke="#c9b48a"/>`).join('')}
    <rect x="150" y="96" width="22" height="26" rx="4" fill="#b5523b"/>
    ${[[60, 90], [260, 90], [40, 140], [280, 140]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="13" fill="#f1c9a2"/><rect x="${x - 14}" y="${y + 12}" width="28" height="34" rx="9" fill="${['#5b8fa8', '#c06a4f', '#6c7a4a', '#d9a74a'][i]}"/>`).join('')}`, '團年飯插圖'),
  fan: () => wrap('#f3ead9', `
    <rect x="0" y="140" width="320" height="60" fill="#d8ceb9"/>
    <rect x="186" y="80" width="6" height="90" fill="#9aa1a5"/><ellipse cx="189" cy="170" rx="28" ry="7" fill="#9aa1a5"/>
    <circle cx="189" cy="70" r="36" fill="#dfe6e8" stroke="#9aa1a5" stroke-width="3"/>
    ${[0, 2.09, 4.19].map(a => `<ellipse cx="${189 + Math.cos(a) * 15}" cy="${70 + Math.sin(a) * 15}" rx="15" ry="8" fill="#7fb2c8"/>`).join('')}
    <rect x="96" y="120" width="30" height="42" rx="10" fill="#d9a74a"/><circle cx="111" cy="106" r="16" fill="#f1c9a2"/>
    <path d="M128 100 q14 -8 30 0 M128 92 q18 -12 36 0" stroke="#a8332c" stroke-width="3" fill="none"/>
    <text x="20" y="40" font-size="14" fill="#8a6440">♪ 啊——</text>`, '風扇前唱歌插圖'),
  tangyuan: () => wrap('#f4e9d6', `
    <ellipse cx="160" cy="130" rx="90" ry="30" fill="#e3d6b8"/>
    <path d="M90 120 q70 70 140 0z" fill="#fff" stroke="#c9b48a" stroke-width="3"/>
    ${[[130, 118], [158, 114], [186, 118], [145, 128], [172, 128]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="11" fill="${i % 2 ? '#f6c1c8' : '#fffaf0'}" stroke="#e0cdb0"/>`).join('')}
    <circle cx="60" cy="60" r="16" fill="#f1c9a2"/><rect x="44" y="76" width="32" height="44" rx="10" fill="#b5523b"/>
    <circle cx="262" cy="70" r="13" fill="#f1c9a2"/><rect x="249" y="83" width="26" height="36" rx="9" fill="#d9a74a"/>`, '冬至搓湯丸插圖'),
  note: () => wrap('#fffaf0', `
    <rect x="70" y="30" width="180" height="140" rx="6" fill="#fff4b8" stroke="#e0cd7a" stroke-width="3"/>
    <circle cx="160" cy="34" r="8" fill="#b5483f"/>
    ${[0, 1, 2, 3, 4].map(i => `<rect x="92" y="${66 + i * 20}" width="${136 - (i % 2) * 30}" height="4" fill="#c9b48a"/>`).join('')}`, '新回憶便條插圖'),
};

export const illustration = ref => (ART[ref] || ART.note)();
