// 場景同 HTML UI 之間嘅細小事件匯流排
const target = new EventTarget();
export const bus = {
  on(type, fn) { target.addEventListener(type, fn); return () => target.removeEventListener(type, fn); },
  emit(type, detail) { target.dispatchEvent(new CustomEvent(type, { detail })); },
  barStops: [],
};
