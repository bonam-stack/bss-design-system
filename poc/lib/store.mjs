// 포털 상태. 저장 방식(서버 파일 · 브라우저 localStorage)은 persist 모듈이 정한다.
import { seed, load, persist } from "./persist.mjs";
export { addRule } from "./rules.mjs";

const now = () => new Date().toISOString();

// 기준(배포 단위). 운영 서버의 버전마다 이 묶음을 스냅숏으로 남긴다.
export function snapshotOf(baseline) {
  return JSON.parse(JSON.stringify(baseline));
}

let state = null;

export function getState() {
  if (state) return state;
  state = load();
  if (!state) {
    state = seed();
    save();
  }
  return state;
}

export function save() {
  persist(state);
}

export function reset() {
  state = seed();
  save();
  return state;
}

// 운영 서버(배포된) 기준
export function released() {
  const s = getState();
  return s.release.snapshots[s.release.current];
}

export function nextId(kind, prefix) {
  const s = getState();
  const n = s.seq[kind]++;
  return `${prefix}-${String(n).padStart(4, "0")}`;
}

export function notify(to, text, ref) {
  const s = getState();
  s.notifications.unshift({ id: s.seq.notice++, to, text, ref: ref || null, at: now(), read: false });
}

export { now };

