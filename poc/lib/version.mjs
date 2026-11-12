// 버전 번호: MAJOR.MINOR.PATCH (덱 부록 · 버전 관리)
// MAJOR = 기존 것을 고치거나 삭제 (이미 만든 SB 재검수), MINOR = 새로 추가 · 공통 블록 승격, PATCH = 설명 · 오탈자만
export const BUMP_ORDER = ["PATCH", "MINOR", "MAJOR"];

export function maxBump(bumps) {
  let best = -1;
  for (const b of bumps) best = Math.max(best, BUMP_ORDER.indexOf(b));
  return best < 0 ? null : BUMP_ORDER[best];
}

export function bumpVersion(v, bump) {
  const [ma, mi, pa] = v.split(".").map(Number);
  if (bump === "MAJOR") return `${ma + 1}.0.0`;
  if (bump === "MINOR") return `${ma}.${mi + 1}.0`;
  return `${ma}.${mi}.${pa + 1}`;
}

// 미리보기 표기: 1.4.0-preview.3 (1.4.0 = 준비 중인 버전, 3 = 미리보기 횟수)
export function previewLabel(current, pendingBumps, previewCount) {
  const b = maxBump(pendingBumps) || "PATCH";
  return `${bumpVersion(current, b)}-preview.${previewCount}`;
}

export function compareVersions(a, b) {
  const pa = a.split(/[.-]/).map((x) => Number(x) || 0);
  const pb = b.split(/[.-]/).map((x) => Number(x) || 0);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
}
