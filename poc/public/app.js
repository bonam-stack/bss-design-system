// BSS 디자인 포털 POC 화면. 해시 라우팅 + 서버 API(/api/*). 역할은 X-Role 헤더로 보낸다.
const $ = (s, el = document) => el.querySelector(s);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fmtTime = (iso) => (iso ? new Date(iso).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "");

let S = null; // 서버 상태
let role = localGet("poc.role") || "viewer";

function localGet(k) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function localSet(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch {}
}

async function api(path, body) {
  const r = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", "X-Role": role },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

function toast(msg, err = false) {
  const t = $("#toast");
  t.textContent = msg;
  t.className = `toast show${err ? " err" : ""}`;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (t.className = "toast"), err ? 4200 : 2400);
}

// 버튼 공통 처리: 실행 → 상태 다시 읽기 → 다시 그리기
async function act(btn, fn, okMsg) {
  const host = btn?.closest("main") || document.body;
  host.classList.add("busy");
  try {
    const out = await fn();
    await load();
    if (okMsg) toast(typeof okMsg === "function" ? okMsg(out) : okMsg);
    return out;
  } catch (e) {
    toast(e.message, true);
  } finally {
    host.classList.remove("busy");
  }
}

async function load() {
  S = await api("/api/state");
  render();
}

// ---------- 공통 조각 ----------

const STEPS = {
  ds: ["requested", "working", "preview", "checked", "deploy_requested", "deployed"],
  icon: ["requested", "working", "preview", "checked", "deploy_requested", "deployed"],
  promote: ["requested", "working", "preview", "checked", "deploy_requested", "deployed"],
  ux: ["working", "preview", "checked", "deploy_requested", "deployed"],
  sb: ["working", "preview", "checked", "deploy_requested", "deployed"],
};
const STEP_LABEL = { requested: "요청", working: "작업 · 편집", preview: "미리보기", checked: "작동 확인", deploy_requested: "배포 요청", deployed: "BSS 디자인 포털 배포" };
const OWNER = { ds: "ds", icon: "ds", promote: "ds", ux: "ux", sb: "ux" };
const ROLE_NAME = { viewer: "보기", ux: "UX 담당자", ds: "DS 담당자", admin: "관리자", studio: "BSS SB Studio" };

function statusPill(st) {
  const cls = { deployed: "ok", deploy_requested: "accent", checked: "accent", preview: "warn", rejected: "bad", rolled_back: "bad" }[st] || "";
  return `<span class="pill ${cls}">${esc(S.statuses[st] || st)}</span>`;
}
const bumpPill = (b) => (b ? `<span class="pill ${b}" title="버전 자리">${b}</span>` : "");
const caseShort = (c) => ({ ds: "케이스 1", ux: "케이스 2", sb: "케이스 3", icon: "케이스 4", promote: "승격" })[c];

function steps(c) {
  const list = STEPS[c.case];
  const i = list.indexOf(c.status);
  return `<div class="steps">${list
    .map((s, k) => `<span class="step ${k < i || c.status === "deployed" ? "done" : ""} ${k === i && c.status !== "deployed" ? "now" : ""}">${STEP_LABEL[s]}</span>`)
    .join("")}</div>`;
}

function checksBlock(checks) {
  if (!checks?.length) return `<p class="muted small">아직 자동 확인 전입니다.</p>`;
  return `<div class="checks">${checks
    .map(
      (c) => `<div class="check"><span class="pill ${c.pass ? "ok" : "bad"}">${c.pass ? "통과" : "미달"}</span><div><b>${esc(c.name)}</b> <span class="muted small">${esc(c.detail || "")}</span>${
        c.problems?.length ? `<ul>${c.problems.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""
      }</div></div>`
    )
    .join("")}</div>`;
}

function changeTable(list, empty = "없습니다") {
  if (!list.length) return `<div class="empty">${empty}</div>`;
  return `<div class="table-wrap"><table><thead><tr><th>번호</th><th>구분</th><th>제목</th><th>상태</th><th>버전 자리</th><th>요청</th><th>갱신</th></tr></thead><tbody>${list
    .map(
      (c) => `<tr class="click" data-href="#change/${c.id}"><td class="mono">${c.id}</td><td>${caseShort(c.case)}</td><td>${esc(c.title)}</td><td>${statusPill(c.status)}</td><td>${bumpPill(c.diff?.bump)}</td><td>${ROLE_NAME[c.requestedBy] || c.requestedBy}</td><td class="small muted">${fmtTime(c.updatedAt)}</td></tr>`
    )
    .join("")}</tbody></table></div>`;
}

const iconSrc = (i) => (i.file ? `/ds/icons/${i.file}` : `/api/icons/${encodeURIComponent(i.name)}`);

// ---------- 메뉴 (IA 안) ----------

function nav() {
  const mine = (r) => S.changes.filter((c) => OWNER[c.case] === r && !["deployed", "rejected", "rolled_back"].includes(c.status)).length;
  const deployQ = S.changes.filter((c) => c.status === "deploy_requested").length;
  const review = S.storyboards.filter((s) => s.needsReview).length;
  const unread = S.notifications.length;
  const cnt = (n) => (n ? `<span class="count">${n}</span>` : "");
  const area = (title, who, allowed, links) =>
    `<div class="nav-group ${allowed ? "" : "locked"}"><div class="nav-title"><span>${title}</span><span class="who">${who}</span></div>${links
      .map(([h, label, n]) => (allowed ? `<a href="#${h}" data-route="${h}">${label}${cnt(n)}</a>` : `<a aria-disabled="true" title="${who} 역할에서 열립니다">${label}</a>`))
      .join("")}</div>`;
  $("#sidebar").innerHTML = [
    area("보기", "모두", true, [
      ["home", "홈", unread],
      ["baseline", "기준"],
      ["sblib", "SB library"],
      ["myreq", "내 요청"],
    ]),
    area("UX 편집", "UX 담당자", role === "ux" || role === "admin", [
      ["ux-edit", "기준 편집"],
      ["ux-mine", "내 변경 · 미리보기 챗", mine("ux")],
    ]),
    area("DS 작업", "DS 담당자", role === "ds" || role === "admin", [["ds-req", "디자인 요청 · 소스 변환", mine("ds")]]),
    area("관리자", "관리자", role === "admin", [
      ["deploy", "운영 서버 배포", deployQ],
      ["review", "재검수 대상 SB", review],
      ["admin", "권한 · 초기화"],
    ]),
    area("BSS SB Studio", "연계 시뮬레이터", true, [
      ["studio", "Storyboard 그리기"],
      ["bundle", "기준 묶음 (API)"],
    ]),
  ].join("");
  const cur = location.hash.slice(1).split("/")[0] || "home";
  for (const a of $("#sidebar").querySelectorAll("a[data-route]")) a.classList.toggle("active", a.dataset.route === cur);
}

function header() {
  const r = S.release;
  $("#ver").innerHTML = `운영 <b>${r.current}</b>${r.preparing ? ` · 준비 <b>${r.preparing}</b> <span class="muted">(미리보기 ${r.previewCount}회)</span>` : ""}`;
  const m = (k, label) => `<span class="pill ${S.modes[k] === "live" ? "ok" : "warn"}" title="${S.modes[k] === "live" ? "실제 API 연결" : "키가 없어 흉내 모드"}">${label} ${S.modes[k] === "live" ? "연결" : "흉내"}</span>`;
  $("#modes").innerHTML = m("figma", "Figma") + m("ai", "AI");
  $("#role").value = role;
}

// ---------- 화면들 ----------

const views = {};

views.home = () => {
  const r = S.release;
  const open = S.changes.filter((c) => !["deployed", "rejected", "rolled_back"].includes(c.status));
  const by = (st) => open.filter((c) => c.status === st).length;
  return `
  <h1>BSS 디자인 포털</h1>
  <p class="lead">DS library(토큰 · 컴포넌트 · 공통 블록)와 UX 패턴을 하나로 묶고, 확인된 버전만 BSS SB Studio에 내준다.</p>
  <div class="cards">
    <div class="card"><div class="muted small">운영 서버 버전</div><div class="stat">${r.current}</div><div class="small muted">Studio는 이 버전만 읽습니다</div></div>
    <div class="card"><div class="muted small">준비 중</div><div class="stat">${r.preparing || "-"}</div><div class="small muted">미리보기 ${r.previewCount}회</div></div>
    <div class="card"><div class="muted small">진행 중 변경</div><div class="stat">${open.length}</div><div class="small muted">요청 ${by("requested")} · 작업 ${by("working")} · 미리보기 ${by("preview")} · 배포 요청 ${by("deploy_requested")}</div></div>
    <div class="card"><div class="muted small">Storyboard</div><div class="stat">${S.storyboards.length}</div><div class="small muted">재검수 ${S.storyboards.filter((s) => s.needsReview).length} · 더미 아이콘 남음 ${S.storyboards.filter((s) => s.dummyIcons.length).length}</div></div>
  </div>
  <h2>흐름</h2>
  <div class="flow">
    <div><b>01 기준 원천</b>피그마 DS library · 포털 UX 패턴</div>
    <div><b>02 소스 변환 · 미리보기</b>형식 · 키 자동 확인, 챗으로 수정</div>
    <div><b>03 배포</b>관리자가 정기 · 수동 배포, 롤백</div>
    <div><b>04 운영 서버</b>버전 · 변경 노트</div>
    <div><b>05 Studio</b>기준 묶음 → 그리기 → 검사 4종 → 화면 지시서</div>
  </div>
  <h2>알림 <span class="muted small">${ROLE_NAME[role]}</span></h2>
  ${
    S.notifications.length
      ? `<div class="table-wrap"><table><tbody>${S.notifications
          .map((n) => `<tr class="${n.ref?.startsWith("CH-") ? "click" : ""}" ${n.ref?.startsWith("CH-") ? `data-href="#change/${n.ref}"` : ""}><td class="small muted">${fmtTime(n.at)}</td><td>${esc(n.text)}</td><td class="small muted">${ROLE_NAME[n.to] || n.to}</td></tr>`)
          .join("")}</tbody></table></div>`
      : `<div class="empty">알림이 없습니다</div>`
  }
  <h2>버전 목록 · 변경 노트</h2>
  ${r.history
    .map(
      (h) => `<div class="card"><div class="row"><b class="mono">${h.version}</b><span class="pill">${h.mode}</span>${bumpPill(h.bump)}<span class="muted small">${fmtTime(h.at)}${h.from ? ` · ${h.from}에서` : ""}</span></div>
      ${h.reason ? `<p class="small" style="margin-top:6px">사유: ${esc(h.reason)}</p>` : ""}
      ${
        h.notes?.length
          ? `<ul class="log" style="margin-top:6px">${h.notes.map((n) => `<li><a href="#change/${n.changeId}">${n.changeId}</a> ${esc(n.title)} ${bumpPill(n.bump)} — ${esc(n.what.join(" · "))} <span class="muted">(${esc(n.impact)})</span></li>`).join("")}</ul>`
          : ""
      }</div>`
    )
    .join("")}`;
};

views.baseline = (tab = "components") => {
  const b = S.baseline;
  const tabs = [
    ["components", `컴포넌트 ${b.components.length}`],
    ["ux", `UX 패턴 · 규칙 ${b.uxPatterns.length}`],
    ["blocks", `공통 블록 ${b.commonBlocks.length}`],
    ["icons", `아이콘 ${b.icons.length}`],
  ];
  let body = "";
  if (tab === "components")
    body = `<div class="table-wrap"><table><thead><tr><th>컴포넌트</th><th>속성</th><th>변형</th><th>피그마</th><th></th></tr></thead><tbody>${b.components
      .map(
        (c) => `<tr><td><b>${esc(c.name)}</b><div class="small muted mono">${c.key}</div></td><td class="small">${c.props.map((p) => `${esc(p.name)}${p.options ? `<span class="muted">(${p.options.length})</span>` : ""}`).join(", ")}</td><td>${c.variants}</td><td><a href="${esc(c.figma.url)}" target="_blank" rel="noopener" class="small">노드 ${esc(c.figma.nodeId)}</a></td><td><button class="btn sm" data-req-comp="${c.key}">수정 요청</button></td></tr>`
      )
      .join("")}</tbody></table></div>
      <div class="row" style="margin-top:10px"><button class="btn" data-req-new>새 컴포넌트 요청</button><a class="small" href="/ds/" target="_blank" rel="noopener">컴포넌트 문서 사이트 열기 ↗</a></div>`;
  if (tab === "ux")
    body = b.uxPatterns
      .map(
        (p) => `<div class="card"><div class="row"><b>${esc(p.name)}</b><span class="pill">${p.scope === "pattern" ? "UX 패턴 · 레이아웃 규칙" : "컴포넌트 사용 정책"}</span><span class="muted small">${p.rules.length}개 규칙</span><div class="grow"></div>${
          role === "ux" || role === "admin" ? `<button class="btn sm" data-ux-edit="${p.key}">편집</button>` : `<button class="btn sm" data-ux-req="${p.key}">수정 요청</button>`
        }</div>
        <p class="small muted" style="margin-top:6px">${esc(p.description)}</p>
        <div class="rules">${p.rules.map((r) => `<div class="rule"><span class="mono">${r.id}</span><span class="kind-${r.kind}">${r.kind}</span><span>${esc(r.text)}</span></div>`).join("")}</div></div>`
      )
      .join("");
  if (tab === "blocks")
    body = b.commonBlocks.length
      ? b.commonBlocks
          .map((cb) => `<div class="card"><div class="row"><b>${esc(cb.name)}</b><span class="mono small">${cb.id}</span><span class="pill ok">${esc(cb.promotedIn)} 승격</span><span class="muted small">${esc(cb.from)}에서</span></div><p class="small">${esc(cb.description)}</p>${previewFrame(cb.source)}</div>`)
          .join("")
      : `<div class="empty">아직 공통 블록이 없습니다. SB 블록이 여러 Storyboard에서 쓰이면 2단 심사를 거쳐 여기로 올라옵니다.</div>`;
  if (tab === "icons")
    body = `<div class="icons">${b.icons
      .map((i) => `<div class="icon"><img src="${iconSrc(i)}" alt="" loading="lazy"><span>${esc(i.name)}</span><span class="muted">${esc(i.style)}</span></div>`)
      .join("")}</div><p class="small muted" style="margin-top:10px">새 아이콘 추가는 MINOR, 기존 아이콘 수정 · 삭제는 케이스 1(MAJOR)로 갑니다.</p>`;
  return `<h1>기준</h1><p class="lead">운영 서버 ${S.release.current} 기준입니다. 토큰 ${b.tokenCount}개는 피그마 변수에서 읽어 둔 값입니다.</p>
  <div class="tabs">${tabs.map(([k, l]) => `<a href="#baseline/${k}" class="${k === tab ? "active" : ""}">${l}</a>`).join("")}</div>${body}`;
};

function previewFrame(source) {
  const doc = `<!doctype html><link rel="stylesheet" href="/api/tokens.css"><style>body{font:14px/1.5 system-ui,sans-serif;margin:12px;color:#1c1f23}</style>${source || ""}`;
  return `<iframe class="preview" sandbox="allow-same-origin" srcdoc="${esc(doc)}" title="미리보기"></iframe>`;
}

views.sblib = () => {
  const list = S.baseline.sbBlocks;
  return `<h1>SB library</h1>
  <p class="lead">BSS SB Studio가 공통 블록 · 컴포넌트로 만들 수 없을 때 만든 1회성 · 설계용 블록입니다. 포털에서 소스로 고치고, ${S.promoteMinUsage}곳 이상에서 쓰이면 승격 후보가 됩니다.</p>
  ${
    list.length
      ? list
          .map((b) => {
            const stage = b.promotion?.stage;
            const cand = (b.usage || []).length >= S.promoteMinUsage;
            return `<div class="card"><div class="row"><b>${esc(b.name)}</b><span class="mono small">${b.id}</span><span class="pill">${(b.usage || []).length}곳 사용</span>${
              stage ? `<span class="pill ${stage === "promoted" ? "ok" : stage === "declined" ? "bad" : "accent"}">${{ "sb-approved": "1단 통과 · UI팀 디자인 중", promoted: `공통 블록 ${b.promotion.to}`, declined: "승격 안 함" }[stage]}</span>` : cand ? `<span class="pill warn">승격 후보</span>` : ""
            }<div class="grow"></div>${
              role === "ux" || role === "admin"
                ? `<button class="btn sm" data-sb-edit="${b.id}">소스 편집</button>${!stage && cand ? `<button class="btn sm primary" data-sb-promote="${b.id}">1단 심사 통과 (SB팀 표준)</button><button class="btn sm" data-sb-decline="${b.id}">승격 안 함</button>` : ""}`
                : ""
            }</div>
            <p class="small muted" style="margin-top:6px">${esc(b.purpose)} · 만든 곳 ${esc(b.createdBy || "-")} · 사용: ${(b.usage || []).join(", ") || "-"}</p>
            ${previewFrame(b.source)}</div>`;
          })
          .join("")
      : `<div class="empty">아직 SB 블록이 없습니다. Studio에서 Storyboard를 그리면 필요한 블록이 여기 등록됩니다.</div>`
  }`;
};

views.myreq = () => {
  const mine = S.changes.filter((c) => c.requestedBy === role || (role === "viewer" && c.requestedBy === "studio"));
  const comps = S.baseline.components.map((c) => `<option value="${c.key}">${esc(c.name)}</option>`).join("");
  const pats = S.baseline.uxPatterns.map((p) => `<option value="${p.key}">${esc(p.name)}</option>`).join("");
  return `<h1>내 요청</h1><p class="lead">요청한 컴포넌트 · 아이콘 · UX 패턴 수정의 상태를 봅니다. 디자인 요청은 DS 담당자가, UX 패턴 요청은 UX 담당자가 처리합니다.</p>
  ${changeTable(mine, "요청한 것이 없습니다")}
  <h2>새 요청</h2>
  <div class="card"><form id="reqForm">
    <div class="grid2">
      <label class="field">구분<select name="kind">
        <option value="ds-new">케이스 1 · 새 컴포넌트</option>
        <option value="ds-mod">케이스 1 · 컴포넌트 수정</option>
        <option value="icon">케이스 4 · 아이콘 신규</option>
        <option value="ux">케이스 2 · UX 패턴 수정 요청</option>
      </select></label>
      <label class="field">제목<input name="title" required placeholder="예: 필터 칩 컴포넌트 추가"></label>
    </div>
    <div class="grid2">
      <label class="field">대상 컴포넌트 (수정)<select name="comp">${comps}</select></label>
      <label class="field">대상 UX 패턴 (UX 요청)<select name="pat">${pats}</select></label>
    </div>
    <div class="grid2">
      <label class="field">아이콘 이름 (PascalCase)<input name="icon" placeholder="예: Upload"></label>
      <label class="field">사용 화면 · 크기<input name="screens" placeholder="예: 고객 조회 · 16"></label>
    </div>
    <label class="field">내용<textarea name="detail" placeholder="왜 필요한지, 어디서 쓰는지"></textarea></label>
    <button class="btn primary">요청 보내기</button>
  </form></div>`;
};

views["ux-edit"] = () =>
  `<h1>기준 편집</h1><p class="lead">UX 패턴 · 레이아웃 규칙은 피그마가 아니라 포털에서 고칩니다. 저장하면 Do/Don't 규칙에 번호가 자동으로 붙고, 한 번 붙은 번호는 내용을 고쳐도 바뀌지 않습니다.</p>
  <div class="table-wrap"><table><thead><tr><th>패턴</th><th>종류</th><th>규칙</th><th></th></tr></thead><tbody>${S.baseline.uxPatterns
    .map((p) => `<tr><td><b>${esc(p.name)}</b></td><td>${p.scope === "pattern" ? "UX 패턴" : "컴포넌트 정책"}</td><td>${p.rules.length}</td><td><button class="btn sm" data-ux-edit="${p.key}">편집 시작</button></td></tr>`)
    .join("")}</tbody></table></div>`;

views["ux-mine"] = () => {
  const list = S.changes.filter((c) => OWNER[c.case] === "ux");
  return `<h1>내 변경</h1><p class="lead">UX 패턴 · SB 블록 편집 → 저장(자동 확인) → 미리보기 → 미리보기 챗으로 수정 → 작동 확인 → 배포 요청.</p>${changeTable(list)}`;
};

views["ds-req"] = () => {
  const list = S.changes.filter((c) => OWNER[c.case] === "ds");
  return `<h1>디자인 요청</h1><p class="lead">블록 승격 · 아이콘 제작 · 컴포넌트 · 공통 블록 수정 요청입니다. 요청됨 → 디자인 작업(피그마) → 피그마 주소 변환 · 미리보기 → 작동 확인 → 배포 요청. BSS 디자인 포털에 배포되면 자동으로 완료됩니다.</p>${changeTable(list)}
  <div class="row" style="margin-top:12px"><button class="btn" data-req-new>새 컴포넌트 작업 만들기</button></div>`;
};

views.deploy = () => {
  const q = S.changes.filter((c) => c.status === "deploy_requested");
  const last = S.release.history[0];
  return `<h1>운영 서버 배포</h1><p class="lead">미리보기로 확인된 변경을 BSS 디자인 포털(운영 서버)에 배포합니다. 정기 배포는 대기 중인 건을 묶어서, 수동 배포는 긴급 수정 · 아이콘 추가처럼 고른 건만 사유와 함께 배포합니다. 급해도 PATCH로 정하지 않습니다.</p>
  <h2>배포 대기 ${q.length}건</h2>
  ${
    q.length
      ? `<div class="table-wrap"><table><thead><tr><th></th><th>번호</th><th>구분</th><th>제목</th><th>변경 요약</th><th>버전 자리</th></tr></thead><tbody>${q
          .map((c) => `<tr><td><input type="checkbox" name="dep" value="${c.id}" aria-label="${c.id} 선택"></td><td class="mono"><a href="#change/${c.id}">${c.id}</a></td><td>${caseShort(c.case)}</td><td>${esc(c.title)}</td><td class="small">${esc(c.deploySummary)}</td><td>${bumpPill(c.diff.bump)}</td></tr>`)
          .join("")}</tbody></table></div>
      <div class="row" style="margin-top:12px"><button class="btn primary" id="deployRegular">정기 배포 (전체 ${q.length}건)</button><input id="manualReason" placeholder="수동 배포 사유" class="grow"><button class="btn" id="deployManual">고른 건 수동 배포</button></div>`
      : `<div class="empty">배포 요청이 없습니다</div>`
  }
  <h2>롤백</h2>
  <div class="card"><p>지금 운영 서버: <b class="mono">${S.release.current}</b> (${last.mode}${last.from ? `, ${last.from}에서` : ""})</p>
  <div class="row"><input id="rbReason" placeholder="롤백 사유" class="grow"><button class="btn danger" id="rollback" ${last.mode === "구축" || last.mode === "롤백" ? "disabled" : ""}>${last.from ? `${last.from}(으)로 되돌리기` : "되돌릴 버전 없음"}</button></div></div>`;
};

views.review = () => {
  const list = S.storyboards.filter((s) => s.needsReview);
  return `<h1>재검수 대상 SB</h1><p class="lead">규칙 · 버전 변경(MAJOR)의 영향을 받는 Storyboard입니다. Studio에서 현재 버전으로 다시 검사해야 개발 핸드오프할 수 있습니다.</p>
  ${
    list.length
      ? `<div class="table-wrap"><table><thead><tr><th>Storyboard</th><th>기반 버전</th><th>이유</th><th></th></tr></thead><tbody>${list
          .map((s) => `<tr><td><a href="#studio/${s.id}">${esc(s.title)}</a> <span class="mono small muted">${s.id}</span></td><td class="mono">${s.baseVersion} → ${s.needsReview.version}</td><td class="small">${esc(s.needsReview.reason)}</td><td><button class="btn sm" data-recheck="${s.id}">재검수</button></td></tr>`)
          .join("")}</tbody></table></div>`
      : `<div class="empty">재검수 대상이 없습니다</div>`
  }`;
};

views.admin = () => `<h1>권한 · 초기화</h1>
  <p class="lead">POC는 로그인 없이 위쪽 역할 선택으로 권한을 바꿉니다. 서버는 요청마다 역할을 확인합니다.</p>
  <div class="table-wrap"><table><thead><tr><th>역할</th><th>하는 일</th></tr></thead><tbody>
  <tr><td>보기 (모두)</td><td>기준 · SB library · 버전 보기, 컴포넌트 · 아이콘 · UX 패턴 수정 요청</td></tr>
  <tr><td>UX 담당자</td><td>UX 패턴 · 레이아웃 규칙 편집, SB 블록 소스 편집, 미리보기 챗, 배포 요청, 승격 1단 심사</td></tr>
  <tr><td>DS 담당자</td><td>디자인 요청 처리, 피그마 주소 변환, 미리보기 챗, 배포 요청, 승격 2단(UI팀 디자인)</td></tr>
  <tr><td>관리자</td><td>운영 서버 정기 · 수동 배포, 롤백, 재검수 대상 확인</td></tr>
  </tbody></table></div>
  <h2>데이터 초기화</h2><div class="card"><p>저장소의 컴포넌트 · 패턴 · 아이콘 JSON으로 1.0.0부터 다시 시작합니다. 진행 중인 변경과 Storyboard는 모두 지워집니다.</p><button class="btn danger" id="resetAll">초기화</button></div>`;

// ---------- 변경 상세 ----------

views.change = (id) => {
  const c = S.changes.find((x) => x.id === id);
  if (!c) return `<div class="empty">변경 ${esc(id)}가 없습니다</div>`;
  const own = role === OWNER[c.case] || role === "admin";
  const editable = own && ["working", "preview", "checked"].includes(c.status);
  const sec = [];
  sec.push(`<div class="row"><span class="pill">${esc(S.cases[c.case])}</span>${statusPill(c.status)}${bumpPill(c.diff?.bump)}${c.previewVersion ? `<span class="pill warn mono">${c.previewVersion}</span>` : ""}${c.deployedIn ? `<span class="pill ok mono">${c.deployedIn}</span>` : ""}</div>
  <h1 style="margin-top:10px">${esc(c.title)}</h1><p class="muted small">${c.id} · ${ROLE_NAME[c.requestedBy] || c.requestedBy} 요청 · 담당 ${ROLE_NAME[OWNER[c.case]]}${c.target?.key ? ` · 대상 <span class="mono">${esc(c.target.key)}</span>` : ""}</p>
  ${c.detail ? `<p>${esc(c.detail)}</p>` : ""}${steps(c)}`);

  if (!own && !["deployed", "rejected", "rolled_back"].includes(c.status)) sec.push(`<div class="card small muted">${ROLE_NAME[OWNER[c.case]]} 역할로 바꾸면 이 변경을 처리할 수 있습니다.</div>`);

  if (c.status === "requested" && own)
    sec.push(`<div class="card"><h3 style="margin-top:0">요청 처리</h3><p class="small muted">${c.case === "ux" ? "포털에서 UX 패턴을 편집합니다." : "UI팀이 피그마에서 제작 · 수정한 뒤, 그 피그마 주소를 넣어 변환합니다."}</p><div class="row"><button class="btn primary" data-start="${c.id}">작업 시작</button><input id="rejReason" placeholder="반려 사유"><button class="btn danger" data-reject="${c.id}">반려</button></div></div>`);

  // 소스 넣기
  if (editable) {
    if (["ds", "icon", "promote"].includes(c.case)) {
      const samples = sampleUrls(c);
      sec.push(`<div class="card"><h3 style="margin-top:0">01 피그마 주소 넣기 · 소스 변환</h3>
      <p class="small muted">포털이 Figma REST API로 노드를 읽어 정해진 형식으로 바꾸고, 형식 · 키를 자동 확인합니다. 같은 주소면 항상 같은 결과가 나옵니다.${S.modes.figma === "mock" ? " 지금은 FIGMA_TOKEN이 없어 흉내 모드입니다." : ""}</p>
      <div class="row"><input id="figmaUrl" class="grow" placeholder="https://www.figma.com/design/<파일>?node-id=<노드>" value="${esc(c.source?.figmaUrl || samples[0]?.[1] || "")}"><button class="btn primary" data-convert="${c.id}">변환 · 미리보기</button></div>
      ${samples.length ? `<p class="small muted" style="margin-top:8px">예시: ${samples.map(([l, u]) => `<a href="#" data-sample="${esc(u)}">${esc(l)}</a>`).join(" · ")}</p>` : ""}</div>`);
    } else if (c.case === "ux") sec.push(uxEditor(c));
    else if (c.case === "sb") sec.push(sbEditor(c));
  }

  // 자동 확인 · 바뀐 점
  if (c.checks?.length || c.diff)
    sec.push(`<div class="grid2"><div class="card"><h3 style="margin-top:0">자동 확인</h3>${checksBlock(c.checks)}</div>
    <div class="card"><h3 style="margin-top:0">운영 대비 바뀐 점 ${bumpPill(c.diff?.bump)}</h3>${c.diff ? `<ul class="log">${c.diff.lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : ""}
    <p class="small muted" style="margin-top:8px">MAJOR = 기존 것을 고치거나 삭제(이미 만든 SB 재검수) · MINOR = 추가 · PATCH = 설명 · 오탈자</p></div></div>`);

  // 미리보기
  if (c.draft && c.status !== "requested") sec.push(`<div class="card"><h3 style="margin-top:0">미리보기 ${c.previewVersion ? `<span class="mono small muted">${c.previewVersion}</span>` : ""}</h3>${draftPreview(c)}</div>`);

  // 챗
  if (["preview", "checked"].includes(c.status) || c.chat.length) {
    const canChat = own && ["preview", "checked"].includes(c.status);
    sec.push(`<div class="card"><h3 style="margin-top:0">미리보기 챗 <span class="pill ${S.modes.ai === "live" ? "ok" : "warn"}">${S.modes.ai === "live" ? "Claude" : "흉내 모드"}</span></h3>
    <p class="small muted">말로 요청하면 AI가 소스를 고치고 미리보기가 바로 갱신됩니다. 고칠 수 있는 곳: ${c.case === "sb" ? "SB 블록 소스 · 이름 · 용도" : c.case === "ux" ? "설명 · 규칙 문구 · 규칙 추가" : "설명 · 정책 문구"}. 막아 둔 곳: 토큰 값 · variants · props 등 피그마에서 온 칸.</p>
    ${c.chat.length ? `<div class="chat" id="chatLog">${c.chat.map((m) => `<div class="msg ${m.from}">${esc(m.text)}</div>`).join("")}</div>` : ""}
    ${canChat ? `<form class="row" id="chatForm" data-id="${c.id}"><input name="m" class="grow" placeholder="${chatHint(c)}" autocomplete="off"><button class="btn primary">보내기</button></form>` : ""}</div>`);
  }

  // 확인 · 배포 요청
  if (own && c.status === "preview")
    sec.push(`<div class="card row"><div class="grow"><b>02 작동 확인</b><div class="small muted">미리보기로 작동을 확인했으면 확인 완료로 넘깁니다. 이상이 있으면 미리보기 챗으로 다시 고칩니다.</div></div><button class="btn primary" data-checked="${c.id}" ${c.checks.every((x) => x.pass) ? "" : "disabled"}>작동 확인 완료</button></div>`);
  if (own && c.status === "checked")
    sec.push(`<div class="card"><b>03 배포 요청</b><div class="small muted" style="margin-bottom:8px">확인이 끝난 건을 변경 요약과 함께 관리자에게 넘깁니다.</div><div class="row"><input id="depSummary" class="grow" value="${esc(c.diff.lines.join(" · "))}"><button class="btn primary" data-reqdeploy="${c.id}">배포 요청</button></div></div>`);

  sec.push(`<h2>이력</h2><ul class="log">${c.log.map((l) => `<li>${fmtTime(l.at)} · ${ROLE_NAME[l.role] || l.role} · ${esc(l.text)}</li>`).join("")}</ul>`);
  return sec.join("");
};

function sampleUrls(c) {
  const out = [];
  const fk = "WcoI745J38TaON7iCKcutW";
  if (c.case === "ds") {
    const comp = S.baseline.components.find((x) => x.key === c.target?.key);
    if (comp) out.push([`${comp.name} 노드`, comp.figma.url]);
    else if (S.modes.figma === "mock") out.push(["Chip 예시 (흉내)", `https://www.figma.com/design/${fk}/Lib?node-id=9000-1`]);
  }
  if (c.case === "icon" && S.modes.figma === "mock") out.push(["아이콘 노드 (흉내)", `https://www.figma.com/design/${fk}/Icons?node-id=9100-${c.id.replace(/\D/g, "")}`]);
  if (c.case === "promote" && S.modes.figma === "mock") out.push(["공통 블록 노드 (흉내)", `https://www.figma.com/design/${fk}/Blocks?node-id=9200-${c.id.replace(/\D/g, "")}`]);
  return out;
}

function chatHint(c) {
  if (S.modes.ai === "live") return c.case === "sb" ? "예: 목록이 비었을 때 안내 문구를 넣어 줘" : "예: 설명을 더 짧게 다듬어 줘";
  return c.case === "ux" ? "예: do 규칙 추가: 잠긴 이유를 버튼 옆에 적습니다" : "예: 설명을 필터 칩으로 바꿔 줘";
}

function uxEditor(c) {
  const p = c.draft;
  return `<div class="card"><h3 style="margin-top:0">01 포털에서 편집</h3>
  <form id="uxForm" data-id="${c.id}">
    <label class="field">설명<textarea name="description">${esc(p.description)}</textarea></label>
    <div class="small muted" style="margin-bottom:6px">규칙 (번호는 고정, 새 규칙은 저장할 때 번호가 붙습니다)</div>
    ${p.rules
      .map(
        (r) => `<div class="rule-edit" data-rule="${r.id}"><span class="mono small">${r.id}</span><select name="kind"><option ${r.kind === "rule" ? "selected" : ""}>rule</option><option ${r.kind === "do" ? "selected" : ""}>do</option><option ${r.kind === "dont" ? "selected" : ""}>dont</option></select><input type="text" name="text" value="${esc(r.text)}" aria-label="${r.id} 내용"><label class="small"><input type="checkbox" name="remove"> 삭제</label></div>`
      )
      .join("")}
    <div class="rule-edit" data-new><span class="small muted">새 규칙</span><select name="kind"><option>do</option><option>dont</option><option>rule</option></select><input type="text" name="text" placeholder="새 Do/Don't 규칙" aria-label="새 규칙"><span></span></div>
    <button class="btn primary">저장 · 미리보기</button>
  </form></div>`;
}

function sbEditor(c) {
  const b = c.draft;
  return `<div class="card"><h3 style="margin-top:0">01 소스 직접 수정</h3>
  <form id="sbForm" data-id="${c.id}">
    <div class="grid2"><label class="field">이름<input name="name" value="${esc(b.name)}"></label><label class="field">용도<input name="purpose" value="${esc(b.purpose)}"></label></div>
    <label class="field">소스 (HTML · 색과 간격은 var(--토큰))<textarea class="code" name="source">${esc(b.source)}</textarea></label>
    <button class="btn primary">저장 · 자동 검사 · 미리보기</button>
  </form></div>`;
}

function draftPreview(c) {
  const d = c.draft;
  if (c.case === "ds")
    return `<p><b>${esc(d.name)}</b> <span class="mono small muted">${esc(d.key)} · ${esc(d.figma?.componentKey || "")}</span></p>
    <p class="small">${esc(d.description)}</p>${d.guideLead ? `<p class="small muted">정책: ${esc(d.guideLead)}</p>` : ""}
    <div class="table-wrap"><table><thead><tr><th>속성</th><th>타입</th><th>기본값</th><th>선택지</th></tr></thead><tbody>${d.props
      .map((p) => `<tr><td>${esc(p.name)}</td><td>${p.type}</td><td>${esc(p.default)}</td><td class="small">${esc((p.options || []).join(", "))}</td></tr>`)
      .join("")}</tbody></table></div><p class="small muted" style="margin-top:6px">변형 ${d.variants.length}개 · 토큰 ${d.tokens.length}개</p>`;
  if (c.case === "icon") return `<div class="icons"><div class="icon"><img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(d.svg || "")}" alt=""><span>${esc(d.name)}</span><span class="muted mono">${esc((d.key || "").slice(0, 10))}</span></div></div>`;
  if (c.case === "ux") {
    const before = Object.fromEntries((c.base?.rules || []).map((r) => [r.id, r]));
    return `<p class="small">${esc(d.description)}</p><div class="rules">${d.rules
      .map((r) => {
        const tag = !before[r.id] ? `<span class="pill MINOR">추가</span>` : before[r.id].text !== r.text || before[r.id].kind !== r.kind ? `<span class="pill MAJOR">수정</span>` : "";
        return `<div class="rule"><span class="mono">${r.id} ${tag}</span><span class="kind-${r.kind}">${r.kind}</span><span>${esc(r.text)}</span></div>`;
      })
      .join("")}${(c.base?.rules || []).filter((r) => !d.rules.find((x) => x.id === r.id)).map((r) => `<div class="rule"><span class="mono">${r.id} <span class="pill MAJOR">삭제</span></span><span></span><s>${esc(r.text)}</s></div>`).join("")}</div>`;
  }
  return `<p><b>${esc(d.name)}</b> <span class="small muted">${esc(d.purpose || d.description || "")}</span></p>${previewFrame(d.source)}`;
}

// ---------- Studio ----------

views.studio = (id) => {
  if (id) return storyboardView(id);
  return `<h1>BSS SB Studio <span class="pill">연계 시뮬레이터</span></h1>
  <p class="lead">Studio는 포털 운영 서버의 기준 묶음만 읽습니다. 작업을 시작할 때 읽은 버전(${S.release.current})을 끝까지 쓰고, 공통 블록 → 컴포넌트 순서로 고른 뒤 없으면 SB 블록을 만듭니다. 생성할 때마다 자동 검사 4종을 하고, 미달이면 1회 다시 만듭니다.</p>
  <div class="card"><form id="studioForm">
    <div class="grid2"><label class="field">화면 이름<input name="title" required placeholder="예: 고객 조회"></label>
    <label class="field">화면 유형<select name="screenType"><option>조회</option><option>입력 · 등록</option><option>상세</option></select></label></div>
    <label class="field">화면 설명 (AI에 주는 요청)<textarea name="description" placeholder="예: 고객명 입력, 생년월일 입력으로 조회하고 결과 목록을 보여 준다. 조회 버튼에 Upload 아이콘."></textarea></label>
    <div class="row"><button class="btn primary">기준 묶음 받아 그리기</button><span class="small muted">AI ${S.modes.ai === "live" ? "Claude 연결" : "흉내 모드 (ANTHROPIC_API_KEY 없음)"}</span></div>
  </form></div>
  <h2>Storyboard</h2>
  ${
    S.storyboards.length
      ? `<div class="table-wrap"><table><thead><tr><th>번호</th><th>화면</th><th>기반 버전</th><th>검사</th><th>상태</th></tr></thead><tbody>${S.storyboards
          .map(
            (s) => `<tr class="click" data-href="#studio/${s.id}"><td class="mono">${s.id}</td><td>${esc(s.title)}</td><td class="mono">${s.baseVersion}</td><td>${s.checks.every((c) => c.pass) ? `<span class="pill ok">4종 통과</span>` : `<span class="pill bad">미달</span>`} <span class="small muted">생성 ${s.attempts.length}회</span></td><td>${
              s.handedOffAt ? `<span class="pill ok">핸드오프</span>` : s.needsReview ? `<span class="pill bad">재검수 대상</span>` : s.dummyIcons.length ? `<span class="pill warn">더미 아이콘 ${s.dummyIcons.length}</span>` : `<span class="pill accent">핸드오프 가능</span>`
            }</td></tr>`
          )
          .join("")}</tbody></table></div>`
      : `<div class="empty">아직 그린 화면이 없습니다</div>`
  }`;
};

function storyboardView(id) {
  const s = S.storyboards.find((x) => x.id === id);
  if (!s) return `<div class="empty">${esc(id)}가 없습니다</div>`;
  const ins = s.instruction;
  const areas = {};
  for (const e of ins.elements) (areas[e.area] ||= []).push(e);
  const canHand = !s.handedOffAt && !s.dummyIcons.length && !s.needsReview && s.checks.every((c) => c.pass);
  return `<p class="small"><a href="#studio">← Storyboard 목록</a></p>
  <div class="row"><span class="pill mono">${s.id}</span><span class="pill">기준 ${s.baseVersion}</span>${s.needsReview ? `<span class="pill bad">재검수 대상 → ${s.needsReview.version}</span>` : ""}${s.handedOffAt ? `<span class="pill ok">핸드오프 ${fmtTime(s.handedOffAt)}</span>` : ""}</div>
  <h1 style="margin-top:10px">${esc(s.title)}</h1><p class="muted">${esc(s.description)}</p>
  ${s.needsReview ? `<div class="card" style="border-color:var(--bad-fg)"><b>재검수 대상</b><p class="small">${esc(s.needsReview.reason)}</p><button class="btn primary" data-recheck="${s.id}">${S.release.current} 기준으로 재검수</button></div>` : ""}
  ${s.dummyIcons.length ? `<div class="card" style="border-color:var(--warn-fg)"><b>더미 아이콘 ${s.dummyIcons.join(", ")}</b><p class="small muted">디자인시스템에 제작 요청이 올라갔습니다. BSS 디자인 포털에 배포되면 자동으로 교체되고, 그 전에는 개발 핸드오프가 막힙니다.</p></div>` : ""}
  <div class="grid2">
    <div class="card"><h3 style="margin-top:0">자동 검사 4종</h3>${checksBlock(s.checks)}
      <p class="small muted" style="margin-top:8px">${s.attempts.map((a, i) => `${i + 1}회차 ${a.pass ? "통과" : "미달"}${a.regenerated ? " (재생성)" : ""}`).join(" → ")}</p></div>
    <div class="card"><h3 style="margin-top:0">그리기 검수 (근거 규칙)</h3>${
      (ins.review || []).length
        ? `<div class="rules">${ins.review.map((r) => `<div class="rule"><span class="mono">${esc(r.ruleId)}</span><span class="kind-${r.verdict}">${r.verdict}</span><span class="small">${esc(r.note)}</span></div>`).join("")}</div>`
        : `<p class="muted small">없음</p>`
    }</div>
  </div>
  <h2>화면 구성</h2>
  <div class="wire">${Object.entries(areas)
    .map(
      ([a, els]) => `<div class="wire-area"><div class="muted">${esc(a)}</div><div class="wire-els">${els
        .map((e) => {
          const sb = e.block && e.block.startsWith("SB-");
          const cb = e.block && e.block.startsWith("CB-");
          const props = (e.props || []).map((p) => `${p.name}=${p.value}`).join(", ");
          return `<div class="wire-el ${sb ? "sb" : cb ? "cb" : ""}"><span class="mono small muted">${esc(e.id)}</span> <b>${esc(e.component || e.block)}</b>${e.icon ? ` · 아이콘 ${esc(e.icon)}${s.dummyIcons.includes(e.icon) ? " (더미)" : ""}` : ""}<div class="small muted">${esc(props || e.note)}</div></div>`;
        })
        .join("")}</div></div>`
    )
    .join("")}</div>
  <p class="small muted">실선 = 컴포넌트 · 파란 테두리 = 공통 블록 · 점선 = SB 블록</p>
  <div class="row" style="margin:16px 0"><button class="btn" data-recheck="${s.id}">현재 버전으로 다시 검사</button><button class="btn primary" data-handoff="${s.id}" ${canHand ? "" : "disabled"}>개발 핸드오프</button></div>
  <h2>화면 지시서 (출력)</h2>
  <p class="small muted">재료를 어디에 어떻게 놓을지만 적은 조립 순서표입니다. 규칙 파일은 넣지 않고 지킨 규칙 번호만 남기며, 피그마는 컴포넌트 key와 props 값으로 라이브러리 컴포넌트를 불러와 배치합니다.</p>
  <pre class="json">${esc(JSON.stringify(ins, null, 2))}</pre>
  <h3>이력</h3><ul class="log">${s.log.map((l) => `<li>${fmtTime(l.at)} · ${esc(l.text)}</li>`).join("")}</ul>`;
}

views.bundle = () => `<h1>기준 묶음 (포털 → Studio)</h1>
  <p class="lead">Studio가 화면마다 받는 입력입니다. 운영 서버 버전에서 쓸 수 있는 것만 골라 AI 입력 범위를 줄입니다. <code>GET /api/bundle?version=${S.release.current}&amp;screenType=조회</code></p>
  <div class="row" style="margin-bottom:10px"><label class="role">버전 <select id="bundleVer">${S.release.history
    .map((h) => h.version)
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((v) => `<option>${v}</option>`)
    .join("")}</select></label><button class="btn sm" id="bundleLoad">불러오기</button></div>
  <pre class="json" id="bundleOut">불러오는 중…</pre>`;

// ---------- 그리기 · 이벤트 ----------

function render() {
  header();
  nav();
  const [name, arg] = location.hash.slice(1).split("/");
  const v = views[name || "home"] || views.home;
  $("#content").innerHTML = v(arg ? decodeURIComponent(arg) : undefined);
  const chatLog = $("#chatLog");
  if (chatLog) chatLog.scrollTop = chatLog.scrollHeight;
  if (name === "bundle") loadBundle();
}

async function loadBundle() {
  const v = $("#bundleVer")?.value || S.release.current;
  try {
    const b = await api(`/api/bundle?version=${encodeURIComponent(v)}&screenType=${encodeURIComponent("조회")}`);
    const short = { ...b, tokens: `${b.tokens.length}개 (Semantic) — 예: ${b.tokens.slice(0, 3).map((t) => t.name).join(", ")}`, icons: `${b.icons.length}개` };
    $("#bundleOut").textContent = JSON.stringify(short, null, 2);
  } catch (e) {
    $("#bundleOut").textContent = e.message;
  }
}

document.addEventListener("click", async (ev) => {
  const t = ev.target.closest("button, a, tr[data-href]");
  if (!t) return;
  const d = t.dataset;
  if (t.matches("tr[data-href]") && !ev.target.closest("a, button, input")) return (location.hash = d.href);
  if (d.sample) {
    ev.preventDefault();
    $("#figmaUrl").value = d.sample;
    return;
  }
  if (d.reqComp) return act(t, () => api("/api/changes", { case: "ds", title: `${d.reqComp} 수정`, targetKey: d.reqComp }), (c) => (location.hash = `#change/${c.id}`, `${c.id} 요청을 보냈습니다`));
  if ("reqNew" in d) {
    const title = prompt("새 컴포넌트 이름이나 요청 제목", "새 컴포넌트");
    if (title) return act(t, () => api("/api/changes", { case: "ds", title }), (c) => (location.hash = `#change/${c.id}`, `${c.id} 요청을 보냈습니다`));
    return;
  }
  if (d.uxEdit) return act(t, () => api("/api/changes", { case: "ux", title: `${d.uxEdit} 편집`, targetKey: d.uxEdit }), (c) => (location.hash = `#change/${c.id}`, "편집을 시작했습니다"));
  if (d.uxReq) {
    const detail = prompt("무엇을 고쳐야 하나요? (현업 요청 · 반복되는 예외 사례 · 신규 패턴)");
    if (detail) return act(t, () => api("/api/changes", { case: "ux", title: `${d.uxReq} 수정 요청`, targetKey: d.uxReq, detail }), "UX 담당자에게 요청을 보냈습니다");
    return;
  }
  if (d.sbEdit) return act(t, () => api("/api/changes", { case: "sb", title: `${d.sbEdit} 소스 편집`, targetKey: d.sbEdit }), (c) => (location.hash = `#change/${c.id}`, "편집을 시작했습니다"));
  if (d.sbPromote) return act(t, () => api(`/api/sb/${d.sbPromote}/promote`, { approve: true, note: prompt("심사 메모 (선택)") || "" }), "1단 심사 통과 → DS 담당자에게 승격 요청");
  if (d.sbDecline) return act(t, () => api(`/api/sb/${d.sbDecline}/promote`, { approve: false, note: prompt("이유 (선택)") || "" }), "승격하지 않기로 했습니다");
  if (d.start) return act(t, () => api(`/api/changes/${d.start}/start`, {}), "작업을 시작했습니다");
  if (d.reject) return act(t, () => api(`/api/changes/${d.reject}/reject`, { reason: $("#rejReason")?.value }), "반려했습니다");
  if (d.convert) return act(t, () => api(`/api/changes/${d.convert}/convert`, { url: $("#figmaUrl").value.trim() }), (c) => (c.status === "preview" ? `변환 · 자동 확인 통과 → ${c.previewVersion}` : "자동 확인 미달: 반영을 멈췄습니다"));
  if (d.checked) return act(t, () => api(`/api/changes/${d.checked}/check`, {}), "작동 확인 완료");
  if (d.reqdeploy) return act(t, () => api(`/api/changes/${d.reqdeploy}/request-deploy`, { summary: $("#depSummary").value }), "관리자에게 배포 요청을 보냈습니다");
  if (t.id === "deployRegular") return act(t, () => api("/api/deploy", { mode: "regular" }), (h) => `BSS 디자인 포털 ${h.version} 배포 완료`);
  if (t.id === "deployManual") {
    const ids = [...document.querySelectorAll("input[name=dep]:checked")].map((x) => x.value);
    return act(t, () => api("/api/deploy", { mode: "manual", ids, reason: $("#manualReason").value }), (h) => `수동 배포 ${h.version} 완료`);
  }
  if (t.id === "rollback") {
    if (!confirm("운영 서버를 이전 버전으로 되돌릴까요?")) return;
    return act(t, () => api("/api/rollback", { reason: $("#rbReason").value }), (h) => `${h.version}(으)로 되돌렸습니다`);
  }
  if (t.id === "resetAll") {
    if (!confirm("모든 변경과 Storyboard를 지우고 1.0.0부터 다시 시작할까요?")) return;
    return act(t, () => api("/api/reset", {}), () => ((location.hash = "#home"), "초기화했습니다"));
  }
  if (d.recheck) return act(t, () => api(`/api/studio/storyboards/${d.recheck}/recheck`, {}), (s) => (s.needsReview ? "재검수 미달" : `재검수 통과 → 기준 ${s.baseVersion}`));
  if (d.handoff) return act(t, () => api(`/api/studio/storyboards/${d.handoff}/handoff`, {}), "개발 핸드오프했습니다");
  if (t.id === "bundleLoad") return loadBundle();
  if (t.closest(".sidebar") && window.innerWidth <= 860) toggleMenu(false);
});

document.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const f = ev.target;
  const btn = f.querySelector("button");
  if (f.id === "reqForm") {
    const v = Object.fromEntries(new FormData(f));
    const body = { title: v.title, detail: v.detail };
    if (v.kind === "ds-new") Object.assign(body, { case: "ds" });
    if (v.kind === "ds-mod") Object.assign(body, { case: "ds", targetKey: v.comp });
    if (v.kind === "icon") Object.assign(body, { case: "icon", iconName: v.icon.trim(), screens: v.screens });
    if (v.kind === "ux") Object.assign(body, { case: "ux", targetKey: v.pat });
    return act(btn, () => api("/api/changes", body), (c) => `${c.id} 요청을 보냈습니다`);
  }
  if (f.id === "uxForm") {
    const rules = [...f.querySelectorAll("[data-rule]")].map((row) => ({ id: row.dataset.rule, kind: row.querySelector("[name=kind]").value, text: row.querySelector("[name=text]").value, remove: row.querySelector("[name=remove]").checked }));
    const nr = f.querySelector("[data-new]");
    const addRules = nr.querySelector("[name=text]").value.trim() ? [{ kind: nr.querySelector("[name=kind]").value, text: nr.querySelector("[name=text]").value }] : [];
    return act(btn, () => api(`/api/changes/${f.dataset.id}/edit`, { description: f.description.value, rules, addRules }), (c) => (c.status === "preview" ? `저장 · 규칙 번호 부여 → ${c.previewVersion}` : "자동 확인 미달"));
  }
  if (f.id === "sbForm") {
    const v = Object.fromEntries(new FormData(f));
    return act(btn, () => api(`/api/changes/${f.dataset.id}/edit`, v), (c) => (c.status === "preview" ? `자동 검사 통과 → ${c.previewVersion}` : "자동 검사 미달: 소스를 고쳐 주세요"));
  }
  if (f.id === "chatForm") {
    const m = f.m.value.trim();
    if (!m) return;
    return act(btn, () => api(`/api/changes/${f.dataset.id}/chat`, { message: m }));
  }
  if (f.id === "studioForm") {
    const v = Object.fromEntries(new FormData(f));
    return act(btn, () => api("/api/studio/storyboards", v), (s) => (location.hash = `#studio/${s.id}`, `${s.id} 생성 · 검사 ${s.checks.every((c) => c.pass) ? "통과" : "미달"}`));
  }
});

function toggleMenu(open) {
  const sb = $("#sidebar");
  const o = open ?? !sb.classList.contains("open");
  sb.classList.toggle("open", o);
  $("#menuBtn").setAttribute("aria-expanded", String(o));
}
$("#menuBtn").addEventListener("click", () => toggleMenu());
$("#role").addEventListener("change", (e) => {
  role = e.target.value;
  localSet("poc.role", role);
  load().catch((err) => toast(err.message, true));
});
window.addEventListener("hashchange", () => (S ? render() : null));
load().catch((e) => {
  $("#content").innerHTML = `<div class="empty">서버에 연결하지 못했습니다: ${esc(e.message)}</div>`;
});
