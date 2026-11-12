// 포털 업무 규칙: 케이스 1~4 + 승격, 미리보기 · 확인 · 배포 요청 · 배포 · 롤백, 기준 묶음, Studio 연계.
import { getState, save, released, nextId, notify, now, addRule, snapshotOf } from "./store.mjs";
import { convertFromUrl, diffComponent } from "./figma.mjs";
import { checkComponentFormat, checkUxPattern, checkIconName, checkSbSource, checkInstruction, allPass } from "./checks.mjs";
import { bumpVersion, maxBump, previewLabel, compareVersions } from "./version.mjs";
import { chatEdit, generateScreen } from "./ai.mjs";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const bad = (m) => new HttpError(400, m);
const deny = (m) => new HttpError(403, m);
const clone = (o) => JSON.parse(JSON.stringify(o));

export const ROLES = {
  viewer: "보기 (모두)",
  ux: "UX 담당자",
  ds: "DS 담당자",
  admin: "관리자",
};

// 케이스별 담당(미리보기 · 확인 · 챗을 하는 사람)
const OWNER = { ds: "ds", icon: "ds", promote: "ds", ux: "ux", sb: "ux" };
export const CASES = {
  ds: "케이스 1 · 토큰 · 컴포넌트 · 공통 블록",
  ux: "케이스 2 · UX 패턴",
  sb: "케이스 3 · SB 블록",
  icon: "케이스 4 · 아이콘",
  promote: "승격 · SB 블록 → 공통 블록",
};
export const STATUS = {
  requested: "요청됨",
  working: "작업 중",
  preview: "미리보기",
  checked: "확인 완료",
  deploy_requested: "배포 요청",
  deployed: "배포됨",
  rolled_back: "롤백됨",
  rejected: "반려",
};

function mustOwn(change, role) {
  if (role !== OWNER[change.case] && role !== "admin") throw deny(`${CASES[change.case]}는 ${ROLES[OWNER[change.case]]}가 처리합니다`);
}
function log(change, role, text) {
  change.log.push({ at: now(), role, text });
  change.updatedAt = now();
}
export function findChange(id) {
  const c = getState().changes.find((x) => x.id === id);
  if (!c) throw new HttpError(404, `변경 ${id}가 없습니다`);
  return c;
}
const pendingBumps = () =>
  getState()
    .changes.filter((c) => ["preview", "checked", "deploy_requested"].includes(c.status) && c.diff?.bump)
    .map((c) => c.diff.bump);

function newPreview(change) {
  const s = getState();
  s.release.previewCount += 1;
  change.previewVersion = previewLabel(s.release.current, pendingBumps().concat(change.diff?.bump || []), s.release.previewCount);
}

// ---------- 요청 · 작업 시작 ----------

export function createChange(role, body) {
  const s = getState();
  const rel = released();
  const kind = body.case;
  if (!CASES[kind] || kind === "promote") throw bad("case는 ds · ux · sb · icon 중 하나입니다");
  const c = {
    id: nextId("change", "CH"),
    case: kind,
    title: String(body.title || "").trim() || "(제목 없음)",
    detail: String(body.detail || ""),
    target: null,
    status: "requested",
    requestedBy: body.requestedBy || role,
    createdAt: now(),
    updatedAt: now(),
    base: null,
    draft: null,
    diff: null,
    checks: [],
    previewVersion: null,
    chat: [],
    log: [],
  };
  if (kind === "ds") {
    const key = body.targetKey || null;
    if (key && !rel.components[key]) throw bad(`컴포넌트 ${key}가 없습니다`);
    c.target = { type: "component", key, isNew: !key };
  } else if (kind === "icon") {
    const name = String(body.iconName || "").trim();
    const nameCheck = checkIconName(name, rel.icons.filter((i) => i.status === "ready"));
    if (!allPass(nameCheck)) throw bad(nameCheck[0].problems.join(" · "));
    c.target = { type: "icon", key: name, screens: body.screens || "", size: body.size || "16" };
  } else if (kind === "ux") {
    if (role !== "ux" && role !== "admin") {
      // 현업 · SB 작성자는 수정 요청만 남긴다
      c.target = { type: "pattern", key: body.targetKey || null };
    } else {
      const p = rel.uxPatterns[body.targetKey];
      if (!p) throw bad("고칠 UX 패턴을 고르세요");
      c.target = { type: "pattern", key: p.key };
      c.base = clone(p);
      c.draft = clone(p);
      c.status = "working";
    }
  } else if (kind === "sb") {
    const b = rel.sbBlocks[body.targetKey];
    if (!b) throw bad("고칠 SB 블록을 고르세요");
    c.target = { type: "sbBlock", key: b.id };
    if (role === "ux" || role === "admin") {
      c.base = clone(b);
      c.draft = clone(b);
      c.status = "working";
    }
  }
  log(c, role, c.status === "working" ? "편집 시작" : "요청");
  s.changes.unshift(c);
  if (c.status === "requested") notify(OWNER[kind], `새 요청: ${c.title}`, c.id);
  save();
  return c;
}

export function startWork(role, id) {
  const c = findChange(id);
  mustOwn(c, role);
  if (c.status !== "requested") throw bad("요청 상태에서만 시작할 수 있습니다");
  const rel = released();
  if (c.case === "ux") {
    const p = rel.uxPatterns[c.target.key];
    if (!p) throw bad("요청에 패턴이 지정되지 않았습니다. 새 변경으로 편집을 시작해 주세요");
    c.base = clone(p);
    c.draft = clone(p);
  }
  if (c.case === "sb") {
    c.base = clone(rel.sbBlocks[c.target.key]);
    c.draft = clone(c.base);
  }
  c.status = "working";
  log(c, role, c.case === "ds" || c.case === "icon" || c.case === "promote" ? "디자인 작업 시작 (UI팀 피그마 제작)" : "편집 시작");
  save();
  return c;
}

export function reject(role, id, reason) {
  const c = findChange(id);
  mustOwn(c, role);
  if (["deployed", "rolled_back"].includes(c.status)) throw bad("이미 배포된 변경입니다");
  c.status = "rejected";
  log(c, role, `반려: ${reason || "-"}`);
  notify(c.requestedBy, `반려됨: ${c.title}`, c.id);
  save();
  return c;
}

// ---------- 소스 넣기 → 미리보기 ----------

// 케이스 1 · 4 · 승격: 피그마 주소 → 변환 → 형식 · 키 자동 확인 → 미리보기
export async function convertFigma(role, id, url) {
  const c = findChange(id);
  mustOwn(c, role);
  if (!["working", "preview", "checked"].includes(c.status)) throw bad("작업 중 · 미리보기 상태에서 변환합니다");
  const rel = released();
  const expect = { icon: "icon", promote: "block" }[c.case] || "component";
  const hint = c.case === "promote" ? c.draft.name : c.target.key;
  const conv = await convertFromUrl(url, { expect, released: rel, hint });
  const r = conv.result;
  c.source = { figmaUrl: url, mode: conv.mode, convertedAt: now() };

  if (c.case === "icon") {
    if (r.kind !== "icon") throw bad("아이콘 노드가 아닙니다");
    if (r.name !== c.target.key) throw bad(`피그마 이름(${r.name})이 요청한 이름(${c.target.key})과 다릅니다. 같은 이름으로 그려 주세요`);
    c.draft = { name: r.name, style: r.style, key: r.key, nodeId: r.nodeId, svg: r.svg, status: "ready", group: "Requested" };
    c.checks = [...checkIconName(r.name, rel.icons.filter((i) => i.status === "ready")), { name: "키", pass: !!r.key, detail: r.key ? "" : "key 없음", problems: r.key ? [] : ["figma key가 없습니다"] }];
    c.diff = { bump: "MINOR", lines: [`아이콘 추가: ${r.name}`] };
  } else if (c.case === "promote") {
    if (r.kind !== "component") throw bad("컴포넌트 노드가 아닙니다");
    c.draft = { ...c.draft, figma: r.figma, components: c.draft.components, name: c.draft.name };
    c.checks = [{ name: "키", pass: !!r.figma.componentKey, detail: "", problems: r.figma.componentKey ? [] : ["componentKey가 없습니다"] }];
    c.diff = { bump: "MINOR", lines: [`공통 블록 승격: ${c.draft.name} (${c.draft.from})`] };
  } else {
    if (r.kind !== "component") throw bad("컴포넌트 노드가 아닙니다");
    const prevKey = c.target.key || r.key;
    const prev = rel.components[prevKey] || null;
    if (c.target.key && r.key !== c.target.key && r.figma.nodeId !== prev?.figma.nodeId) throw bad(`요청한 ${c.target.key}가 아닌 ${r.key} 노드입니다`);
    if (!c.target.key && prev) throw bad(`${r.key}는 이미 있는 컴포넌트입니다. 수정 요청으로 올려 주세요`);
    // 피그마에 없는 포털 쪽 칸(정책 문구 · 토큰 연결)은 운영 값을 이어받는다
    const draft = { ...r, key: prevKey, guideLead: prev?.guideLead || "", tokens: r.tokens.length ? r.tokens : prev?.tokens || [] };
    delete draft.kind;
    c.target.key = prevKey;
    c.base = prev ? clone(prev) : null;
    c.draft = draft;
    c.checks = checkComponentFormat(draft, rel.components);
    c.diff = diffComponent(prev, draft);
  }
  advanceToPreview(c, role, `피그마 변환 (${conv.mode === "live" ? "Figma REST API" : "흉내 모드"})`);
  save();
  return c;
}

// 케이스 2 · 3: 포털 편집 저장 → (규칙 번호 자동 부여) → 자동 확인 → 미리보기
export function saveEdit(role, id, body) {
  const c = findChange(id);
  mustOwn(c, role);
  if (!["working", "preview", "checked"].includes(c.status)) throw bad("작업 중 · 미리보기 상태에서 편집합니다");
  if (c.case === "ux") applyUxEdits(c, body);
  else if (c.case === "sb") {
    for (const f of ["name", "purpose", "source"]) if (typeof body[f] === "string") c.draft[f] = body[f];
  } else throw bad("이 케이스는 피그마에서 고친 뒤 주소로 변환합니다");
  recheckDraft(c);
  advanceToPreview(c, role, "편집 저장");
  save();
  return c;
}

function applyUxEdits(c, body) {
  const p = c.draft;
  if (typeof body.description === "string") p.description = body.description;
  for (const r of body.rules || []) {
    const cur = p.rules.find((x) => x.id === r.id);
    if (!cur) continue;
    if (r.remove) p.rules = p.rules.filter((x) => x.id !== r.id);
    else {
      if (typeof r.text === "string") cur.text = r.text;
      if (r.kind) cur.kind = r.kind;
    }
  }
  for (const r of body.addRules || []) if (r.text?.trim()) addRule(p, r.kind || "rule", r.text.trim());
}

function uxDiff(prev, next) {
  const lines = [];
  let bump = null;
  const o = ["PATCH", "MINOR", "MAJOR"];
  const up = (b) => {
    if (!bump || o.indexOf(b) > o.indexOf(bump)) bump = b;
  };
  const pr = Object.fromEntries(prev.rules.map((r) => [r.id, r]));
  const nr = Object.fromEntries(next.rules.map((r) => [r.id, r]));
  for (const id of Object.keys(pr)) if (!nr[id]) (lines.push(`규칙 삭제: ${id}`), up("MAJOR"));
  for (const id of Object.keys(nr)) if (!pr[id]) (lines.push(`규칙 추가: ${id} (${nr[id].kind})`), up("MINOR"));
  for (const id of Object.keys(nr))
    if (pr[id] && (pr[id].text !== nr[id].text || pr[id].kind !== nr[id].kind)) (lines.push(`규칙 수정: ${id}`), up("MAJOR"));
  if (prev.description !== next.description) (lines.push("설명 수정"), up("PATCH"));
  return { bump: bump || "PATCH", lines: lines.length ? lines : ["바뀐 점 없음"] };
}

function recheckDraft(c) {
  const s = getState();
  const rel = released();
  if (c.case === "ux") {
    c.checks = checkUxPattern(c.draft);
    c.diff = uxDiff(c.base, c.draft);
  } else if (c.case === "sb") {
    c.checks = checkSbSource(c.draft.source || "", s.tokens);
    const lines = [];
    if (c.base.source !== c.draft.source) lines.push("소스 수정");
    if (c.base.name !== c.draft.name) lines.push(`이름 ${c.base.name} → ${c.draft.name}`);
    if (c.base.purpose !== c.draft.purpose) lines.push("용도 설명 수정");
    // SB 블록 소스를 바꾸면 이미 그 블록을 쓴 Storyboard 모양이 바뀐다
    c.diff = { bump: c.base.source !== c.draft.source ? "MAJOR" : "PATCH", lines: lines.length ? lines : ["바뀐 점 없음"] };
  } else if (c.case === "ds") {
    c.checks = checkComponentFormat(c.draft, rel.components);
    c.diff = diffComponent(c.base, c.draft);
  }
}

function advanceToPreview(c, role, what) {
  const passed = allPass(c.checks);
  if (passed) {
    c.status = "preview";
    newPreview(c);
    log(c, role, `${what} → 자동 확인 통과 → 미리보기 ${c.previewVersion}`);
  } else {
    c.status = "working";
    log(c, role, `${what} → 자동 확인 미달, 반영을 멈춤`);
    notify(OWNER[c.case], `자동 확인 미달: ${c.title}`, c.id);
  }
}

// ---------- 미리보기 챗 ----------

function chatFields(c) {
  if (c.case === "ds") return { editable: { description: c.draft.description, guideLead: c.draft.guideLead }, locked: ["tokens", "variants", "props", "figma"] };
  if (c.case === "sb") return { editable: { name: c.draft.name, purpose: c.draft.purpose, source: c.draft.source }, locked: ["id", "usage"] };
  if (c.case === "ux") {
    const ed = { description: c.draft.description, "add-rule:do": "", "add-rule:dont": "", "add-rule:rule": "" };
    for (const r of c.draft.rules) ed[`rule:${r.id}`] = r.text;
    return { editable: ed, locked: ["규칙 번호"] };
  }
  if (c.case === "promote") return { editable: { name: c.draft.name, description: c.draft.description || "" }, locked: ["figma", "components"] };
  return { editable: {}, locked: ["아이콘은 피그마에서만 고칩니다"] };
}

export async function chat(role, id, message) {
  const c = findChange(id);
  mustOwn(c, role);
  if (!["preview", "checked"].includes(c.status)) throw bad("챗 수정은 소스로 1차 확인(미리보기)이 끝난 뒤에 엽니다");
  const { editable, locked } = chatFields(c);
  c.chat.push({ at: now(), from: "user", role, text: message });
  const out = await chatEdit({ caseName: CASES[c.case], draft: c.draft, editable, locked, history: c.chat, message });
  const applied = [];
  const refused = [];
  for (const e of out.edits || []) {
    if (!(e.field in editable)) {
      refused.push(e.field);
      continue;
    }
    if (c.case === "ux") {
      if (e.field.startsWith("add-rule:")) {
        const r = addRule(c.draft, e.field.split(":")[1], e.value);
        applied.push(`${r.id} 추가`);
      } else if (e.field.startsWith("rule:")) {
        const r = c.draft.rules.find((x) => x.id === e.field.slice(5));
        r.text = e.value;
        applied.push(`${r.id} 수정`);
      } else {
        c.draft[e.field] = e.value;
        applied.push(e.field);
      }
    } else {
      c.draft[e.field] = e.value;
      applied.push(e.field);
    }
  }
  c.chat.push({ at: now(), from: "ai", text: out.reply + (refused.length ? ` (막아 둔 칸이라 적용 안 함: ${refused.join(", ")})` : "") });
  if (applied.length) {
    if (c.case !== "promote") recheckDraft(c);
    if (allPass(c.checks)) {
      c.status = "preview";
      newPreview(c);
      log(c, role, `챗 수정 (${applied.join(", ")}) → 미리보기 ${c.previewVersion}`);
    } else {
      c.status = "preview";
      log(c, role, `챗 수정 (${applied.join(", ")}) → 자동 확인 미달, 챗으로 다시`);
    }
  }
  save();
  return c;
}

// ---------- 확인 · 배포 요청 ----------

export function markChecked(role, id) {
  const c = findChange(id);
  mustOwn(c, role);
  if (c.status !== "preview") throw bad("미리보기 상태에서 확인합니다");
  if (!allPass(c.checks)) throw bad("자동 확인을 통과해야 확인할 수 있습니다");
  c.status = "checked";
  log(c, role, "미리보기로 작동 확인");
  save();
  return c;
}

export function requestDeploy(role, id, summary) {
  const c = findChange(id);
  mustOwn(c, role);
  if (c.status !== "checked") throw bad("확인이 끝난 건만 배포 요청합니다");
  c.status = "deploy_requested";
  c.deploySummary = summary || c.diff.lines.join(" · ");
  log(c, role, `배포 요청: ${c.deploySummary}`);
  notify("admin", `배포 요청: ${c.title} (${c.diff.bump})`, c.id);
  save();
  return c;
}

// ---------- 배포 · 롤백 (관리자) ----------

export function deploy(role, { mode, ids, reason }) {
  if (role !== "admin") throw deny("BSS 디자인 포털(운영 서버) 배포는 관리자가 합니다");
  const s = getState();
  let list = s.changes.filter((c) => c.status === "deploy_requested");
  if (mode === "manual") {
    if (!reason?.trim()) throw bad("수동 배포는 사유를 남깁니다");
    list = list.filter((c) => (ids || []).includes(c.id));
  } else mode = "regular";
  if (!list.length) throw bad("배포할 요청이 없습니다");

  const prevVersion = s.release.current;
  const bump = maxBump(list.map((c) => c.diff.bump));
  const version = bumpVersion(prevVersion, bump);
  const base = snapshotOf(released());
  const notes = [];
  for (const c of list) {
    applyChange(base, c, version);
    c.status = "deployed";
    c.deployedIn = version;
    log(c, role, `BSS 디자인 포털 ${version} 배포 (${mode === "manual" ? "수동" : "정기"})`);
    notes.push({ changeId: c.id, case: c.case, title: c.title, bump: c.diff.bump, what: c.diff.lines, impact: c.diff.bump === "MAJOR" ? "이미 만든 SB 재검수" : "영향 없음" });
    notify(c.requestedBy, `배포 완료: ${c.title} → ${version}`, c.id);
    if (OWNER[c.case] !== c.requestedBy) notify(OWNER[c.case], `배포 완료: ${c.title} → ${version}`, c.id);
  }
  s.release.snapshots[version] = base;
  s.release.current = version;
  s.release.previewCount = 0;
  s.release.history.unshift({ version, from: prevVersion, at: now(), mode: mode === "manual" ? "수동" : "정기", reason: reason || "", bump, notes });
  // 미리보기 중인 다른 변경은 새 버전 기준으로 다시 붙는다
  for (const c of s.changes) if (["preview", "checked", "deploy_requested"].includes(c.status)) c.previewVersion = null;
  afterDeploy(list, version);
  // 스냅숏은 최근 10개만 남긴다
  const keep = new Set(s.release.history.slice(0, 10).map((h) => h.version));
  for (const v of Object.keys(s.release.snapshots)) if (!keep.has(v)) delete s.release.snapshots[v];
  save();
  return s.release.history[0];
}

function applyChange(base, c, version) {
  if (c.case === "ds") base.components[c.target.key] = clone(c.draft);
  else if (c.case === "ux") base.uxPatterns[c.target.key] = clone(c.draft);
  else if (c.case === "sb") base.sbBlocks[c.target.key] = { ...clone(c.draft), usage: base.sbBlocks[c.target.key]?.usage || [], updatedIn: version };
  else if (c.case === "icon") {
    base.icons = base.icons.filter((i) => i.name !== c.draft.name);
    base.icons.push(clone(c.draft));
  } else if (c.case === "promote") {
    base.commonBlocks[c.draft.id] = { ...clone(c.draft), promotedIn: version };
    if (base.sbBlocks[c.draft.from]) base.sbBlocks[c.draft.from].promotion = { stage: "promoted", to: c.draft.id, version };
  }
}

// 배포 뒤 처리: MAJOR → 재검수 표시, 아이콘 → 더미 교체 · 알림
function afterDeploy(list, version) {
  const s = getState();
  for (const c of list) {
    if (c.case === "icon") {
      for (const st of s.storyboards) {
        if (st.dummyIcons.includes(c.draft.name)) {
          st.dummyIcons = st.dummyIcons.filter((n) => n !== c.draft.name);
          st.log.push({ at: now(), text: `더미 아이콘 ${c.draft.name} 자동 교체 (${version})` });
          notify("studio", `아이콘 교체 완료: ${c.draft.name} → ${st.title}`, st.id);
        }
      }
    }
    if (c.diff.bump !== "MAJOR") continue;
    for (const st of s.storyboards) {
      if (compareVersions(st.baseVersion, version) >= 0) continue;
      if (!usesTarget(st, c)) continue;
      st.needsReview = { version, changeId: c.id, reason: `${c.title} (${c.diff.lines.join(" · ")})` };
      st.log.push({ at: now(), text: `재검수 대상: ${c.title} → ${version}` });
    }
  }
}

function usesTarget(st, c) {
  const els = st.instruction?.elements || [];
  if (c.case === "ds") return els.some((e) => e.component === c.target.key);
  if (c.case === "sb") return els.some((e) => e.block === c.target.key);
  if (c.case === "ux") {
    const ids = new Set(c.base.rules.map((r) => r.id));
    return (st.instruction?.review || []).some((r) => ids.has(r.ruleId)) || st.bundleRuleIds?.some((id) => ids.has(id));
  }
  return false;
}

export function rollback(role, reason) {
  if (role !== "admin") throw deny("롤백은 관리자가 합니다");
  const s = getState();
  const [last, prev] = s.release.history;
  if (!prev || last.mode === "구축") throw bad("되돌릴 버전이 없습니다");
  if (!s.release.snapshots[last.from]) throw bad(`${last.from} 스냅숏이 없습니다`);
  const target = last.from;
  s.release.current = target;
  s.release.history.unshift({ version: target, from: last.version, at: now(), mode: "롤백", reason: reason || "", bump: null, notes: [] });
  for (const n of last.notes || []) {
    const c = s.changes.find((x) => x.id === n.changeId);
    if (c) {
      c.status = "rolled_back";
      log(c, role, `${last.version} 롤백으로 운영 서버에서 빠짐`);
    }
  }
  save();
  return s.release.history[0];
}

// ---------- 승격 (케이스 3 → 공통 블록) ----------

export const PROMOTE_MIN_USAGE = 2;

export function promoteReview(role, sbId, approve, note) {
  const rel = released();
  const b = rel.sbBlocks[sbId];
  if (!b) throw new HttpError(404, `SB 블록 ${sbId}가 없습니다`);
  const stage = b.promotion?.stage || null;
  if (!stage) {
    if ((b.usage || []).length < PROMOTE_MIN_USAGE) throw bad(`여러 Storyboard에서 쓰여야 승격 후보가 됩니다 (지금 ${b.usage.length}곳)`);
    if (role !== "ux" && role !== "admin") throw deny("1단 심사(SB팀 표준)는 UX 담당자가 합니다");
    b.promotion = approve ? { stage: "sb-approved", note, at: now() } : { stage: "declined", note, at: now() };
    if (approve) {
      // 2단 심사: UI팀 디자인 → DS 담당자에게 승격 요청
      const s = getState();
      const c = {
        id: nextId("change", "CH"),
        case: "promote",
        title: `블록 승격: ${b.name}`,
        detail: `${sbId} · ${b.usage.length}개 Storyboard에서 사용. ${note || ""}`,
        target: { type: "commonBlock", key: `CB-${sbId.replace(/^SB-/, "")}` },
        status: "requested",
        requestedBy: role,
        createdAt: now(),
        updatedAt: now(),
        base: null,
        draft: { id: `CB-${sbId.replace(/^SB-/, "")}`, name: b.name, description: b.purpose, from: sbId, source: b.source, components: [] },
        diff: null,
        checks: [],
        previewVersion: null,
        chat: [],
        log: [{ at: now(), role, text: "1단 심사(SB팀 표준) 통과 → UI팀 디자인 요청" }],
      };
      s.changes.unshift(c);
      b.promotion.changeId = c.id;
      notify("ds", `승격 요청: ${b.name}`, c.id);
    }
  } else throw bad(`이미 심사한 블록입니다 (${stage})`);
  save();
  return b;
}

// ---------- 기준 묶음 (포털 → Studio) ----------

export function buildBundle(version, screenType) {
  const s = getState();
  const v = version || s.release.current;
  const snap = s.release.snapshots[v];
  if (!snap) throw new HttpError(404, `버전 ${v} 스냅숏이 없습니다`);
  const components = Object.values(snap.components).map((c) => ({
    key: c.key,
    name: c.name,
    componentKey: c.figma.componentKey,
    description: c.description.slice(0, 300),
    props: c.props.filter((p) => p.type !== "instance").map((p) => ({ name: p.name, type: p.type, default: p.default, ...(p.options ? { options: p.options } : {}) })),
  }));
  const keys = new Set(components.map((c) => c.key));
  const uxRules = [];
  const layoutRules = [];
  for (const p of Object.values(snap.uxPatterns)) {
    for (const r of p.rules) {
      const row = { id: r.id, kind: r.kind, text: r.text, pattern: p.name };
      if (p.scope === "pattern") layoutRules.push(row);
      if (p.scope === "pattern" || keys.has(p.key)) uxRules.push(row);
    }
  }
  const semantic = Object.entries(s.tokens)
    .filter(([, t]) => t.collection === "Semantic")
    .map(([name, t]) => ({ name, type: t.type, value: t.value }));
  return {
    portalVersion: v,
    screenType: screenType || "조회",
    layoutRules,
    commonBlocks: Object.values(snap.commonBlocks).map((b) => ({ id: b.id, name: b.name, description: b.description, components: b.components })),
    components,
    sbBlocks: Object.values(snap.sbBlocks).map((b) => ({ id: b.id, name: b.name, purpose: b.purpose })),
    tokens: semantic,
    uxRules,
    icons: snap.icons.filter((i) => i.status === "ready").map((i) => ({ name: i.name, style: i.style, key: i.key })),
  };
}

// ---------- BSS SB Studio (연계 시뮬레이터) ----------

export async function studioGenerate(body) {
  const s = getState();
  const title = String(body.title || "").trim();
  if (!title) throw bad("화면 이름을 넣어 주세요");
  const version = s.release.current; // 작업 시작 시 버전 고정 (안)
  const bundle = buildBundle(version, body.screenType);
  const request = { title, description: String(body.description || ""), screenType: bundle.screenType };
  const attempts = [];
  let ins = await generateScreen({ bundle, request });
  let checks = checkInstruction(ins, bundle);
  attempts.push({ at: now(), pass: allPass(checks), checks });
  if (!allPass(checks)) {
    // 미달 시 1회 재생성
    const feedback = checks.filter((c) => !c.pass).flatMap((c) => c.problems.map((p) => `[${c.name}] ${p}`)).join("\n");
    ins = await generateScreen({ bundle, request, feedback });
    checks = checkInstruction(ins, bundle);
    attempts.push({ at: now(), pass: allPass(checks), checks, regenerated: true });
  }

  const st = {
    id: nextId("storyboard", "STB"),
    title,
    description: request.description,
    screenType: bundle.screenType,
    baseVersion: version,
    createdAt: now(),
    instruction: null,
    attempts,
    checks,
    dummyIcons: [],
    needsReview: null,
    bundleRuleIds: bundle.uxRules.map((r) => r.id),
    log: [{ at: now(), text: `기준 묶음 ${version} 고정 · 생성 ${attempts.length}회` }],
  };

  // 새 SB 블록 → 포털 SB library에 등록, ID 바꿔 달기
  const rel = released();
  const idMap = {};
  for (const nb of ins.newSbBlocks || []) {
    const id = nextId("sb", "SB");
    idMap[nb.id] = id;
    rel.sbBlocks[id] = { id, name: nb.name, purpose: nb.purpose, source: nb.source, createdBy: st.id, createdAt: now(), usage: [], promotion: null };
    notify("ux", `신규 SB 블록 등록: ${nb.name} (${id})`, id);
  }
  for (const e of ins.elements) if (e.block && idMap[e.block]) e.block = idMap[e.block];
  ins.newSbBlocks = (ins.newSbBlocks || []).map((b) => ({ ...b, id: idMap[b.id] }));
  // 블록 사용 집계
  for (const e of ins.elements) {
    if (e.block && rel.sbBlocks[e.block] && !rel.sbBlocks[e.block].usage.includes(st.id)) rel.sbBlocks[e.block].usage.push(st.id);
  }
  // 묶음에 없는 아이콘 → 더미 + 디자인시스템 제작 요청
  const known = new Set(bundle.icons.map((i) => i.name));
  for (const e of ins.elements) {
    if (!e.icon || known.has(e.icon)) continue;
    if (!st.dummyIcons.includes(e.icon)) st.dummyIcons.push(e.icon);
    const exists = s.changes.find((c) => c.case === "icon" && c.target.key === e.icon && !["rejected", "deployed", "rolled_back"].includes(c.status));
    if (!exists && /^[A-Z][A-Za-z0-9]*$/.test(e.icon)) {
      createChange("viewer", { case: "icon", title: `아이콘 제작: ${e.icon}`, iconName: e.icon, screens: title, size: "16", requestedBy: "studio" });
    }
  }
  st.instruction = toInstruction(ins, st, bundle, checks);
  s.storyboards.unshift(st);
  save();
  return st;
}

// 화면 지시서: 재료를 어디에 어떻게 놓을지만 적은 조립 순서표
function toInstruction(ins, st, bundle, checks) {
  const comps = Object.fromEntries(bundle.components.map((c) => [c.key, c]));
  return {
    baseVersion: st.baseVersion,
    screen: { title: ins.title || st.title, type: st.screenType },
    elements: ins.elements.map((e) => ({
      id: e.id,
      area: e.area,
      block: e.block,
      component: e.component,
      componentKey: e.component ? comps[e.component]?.componentKey || null : null,
      props: e.props,
      tokens: e.tokens,
      icon: e.icon,
      note: e.note,
    })),
    newSbBlocks: ins.newSbBlocks,
    checks: checks.map((c) => ({ name: c.name, pass: c.pass })),
    review: ins.review,
    dummyIcons: st.dummyIcons,
  };
}

// 재검수: 현재 운영 버전 묶음으로 지시서를 다시 검사
export function studioRecheck(id) {
  const s = getState();
  const st = s.storyboards.find((x) => x.id === id);
  if (!st) throw new HttpError(404, `Storyboard ${id}가 없습니다`);
  const bundle = buildBundle(s.release.current, st.screenType);
  const checks = checkInstruction(st.instruction, bundle);
  st.checks = checks;
  st.instruction.checks = checks.map((c) => ({ name: c.name, pass: c.pass }));
  if (allPass(checks)) {
    st.log.push({ at: now(), text: `${s.release.current} 기준으로 재검수 통과 (${st.baseVersion} → ${s.release.current})` });
    st.baseVersion = s.release.current;
    st.instruction.baseVersion = st.baseVersion;
    st.bundleRuleIds = bundle.uxRules.map((r) => r.id);
    st.needsReview = null;
  } else st.log.push({ at: now(), text: `${s.release.current} 기준 재검수 미달` });
  save();
  return st;
}

export function studioHandoff(id) {
  const st = getState().storyboards.find((x) => x.id === id);
  if (!st) throw new HttpError(404, `Storyboard ${id}가 없습니다`);
  if (st.dummyIcons.length) throw bad(`더미 아이콘이 남아 있어 핸드오프할 수 없습니다: ${st.dummyIcons.join(", ")}`);
  if (st.needsReview) throw bad("재검수 대상입니다. 재검수를 먼저 통과해야 합니다");
  if (!allPass(st.checks)) throw bad("자동 검사 4종을 통과해야 합니다");
  st.handedOffAt = now();
  st.log.push({ at: now(), text: "개발 핸드오프" });
  save();
  return st;
}

// ---------- 화면용 요약 ----------

export function overview(role) {
  const s = getState();
  const rel = released();
  const pend = pendingBumps();
  return {
    role,
    roles: ROLES,
    cases: CASES,
    statuses: STATUS,
    release: {
      current: s.release.current,
      preparing: pend.length ? previewLabel(s.release.current, pend, s.release.previewCount).replace(/-preview\.\d+$/, "") : null,
      previewCount: s.release.previewCount,
      history: s.release.history,
    },
    baseline: {
      components: Object.values(rel.components).map((c) => ({ key: c.key, name: c.name, description: c.description, guideLead: c.guideLead, props: c.props, variants: c.variants.length, figma: c.figma })),
      commonBlocks: Object.values(rel.commonBlocks),
      uxPatterns: Object.values(rel.uxPatterns),
      sbBlocks: Object.values(rel.sbBlocks),
      icons: rel.icons.map(({ svg, ...i }) => ({ ...i, hasSvg: !!svg })),
      tokenCount: Object.keys(s.tokens).length,
    },
    changes: s.changes,
    storyboards: s.storyboards,
    notifications: s.notifications.filter((n) => role === "admin" || n.to === role || (role === "viewer" && n.to === "studio")).slice(0, 30),
    promoteMinUsage: PROMOTE_MIN_USAGE,
  };
}

export function iconSvg(name) {
  const rel = released();
  const i = rel.icons.find((x) => x.name === name);
  return i?.svg || null;
}
