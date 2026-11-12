// 정적 빌드용 저장: 빌드할 때 만든 1.0.0 시드를 담고, 진행 상태는 이 브라우저의 localStorage에 둔다.
// 저장이 막힌 환경(사생활 보호 창 등)에서는 메모리에서만 돈다.
import SEED from "virtual:seed";

const KEY = "bss-portal-poc.state.v1";

export function seed() {
  const s = JSON.parse(JSON.stringify(SEED));
  const at = new Date().toISOString();
  s.seededAt = at;
  s.release.history[0].at = at;
  return s;
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function persist(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 용량이 모자라면 오래된 스냅숏부터 줄여 다시 시도
    try {
      const keep = new Set(state.release.history.slice(0, 3).map((h) => h.version));
      keep.add(state.release.current);
      for (const v of Object.keys(state.release.snapshots)) if (!keep.has(v)) delete state.release.snapshots[v];
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }
}
