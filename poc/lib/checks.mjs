// 자동 확인 두 가지.
// 1) 변환 자동 확인 (포털): 소스 변환마다 형식이 맞는지, 컴포넌트 키가 빠지거나 겹친 곳이 없는지.
// 2) 자동 검사 4종 (Studio): 화면 지시서의 컴포넌트 속성값 · 요소 ID · 규칙 번호 · 토큰.

const ok = (name, detail = "") => ({ name, pass: true, detail, problems: [] });
const fail = (name, problems) => ({ name, pass: false, detail: `${problems.length}건`, problems });

// ---------- 1) 변환 자동 확인 ----------

export function checkComponentFormat(comp, others = {}) {
  const results = [];
  const p1 = [];
  if (!comp || typeof comp !== "object") return [fail("형식", ["컴포넌트 데이터가 없습니다"])];
  if (!/^[a-z0-9-]+$/.test(comp.key || "")) p1.push("key는 영문 소문자 · 숫자 · -만 씁니다");
  if (!comp.name) p1.push("name이 없습니다");
  if (!Array.isArray(comp.props)) p1.push("props가 배열이 아닙니다");
  else
    comp.props.forEach((p, i) => {
      if (!p.name) p1.push(`props[${i}] 이름이 없습니다`);
      if (!["boolean", "text", "variant", "instance"].includes(p.type)) p1.push(`props.${p.name} 타입(${p.type})을 알 수 없습니다`);
      if (p.type === "variant" && !(p.options || []).length) p1.push(`props.${p.name} 선택지(options)가 없습니다`);
    });
  results.push(p1.length ? fail("형식", p1) : ok("형식", `props ${comp.props.length}개`));

  const p2 = [];
  if (!comp.figma?.componentKey) p2.push("figma.componentKey가 없습니다");
  const seen = new Set();
  for (const v of comp.variants || []) {
    if (!v.key) p2.push(`변형 ${v.nodeId} key가 없습니다`);
    else if (seen.has(v.key)) p2.push(`변형 key ${v.key}가 겹칩니다`);
    seen.add(v.key);
  }
  for (const [k, o] of Object.entries(others)) {
    if (k === comp.key) continue;
    if (o.figma?.componentKey && o.figma.componentKey === comp.figma?.componentKey) p2.push(`componentKey가 ${k}와 겹칩니다`);
  }
  results.push(p2.length ? fail("키", p2) : ok("키", `변형 ${(comp.variants || []).length}개`));

  // 변형 props 값이 선택지 안에 있는지
  const p3 = [];
  const opts = Object.fromEntries((comp.props || []).filter((p) => p.type === "variant").map((p) => [p.name, p.options || []]));
  for (const v of comp.variants || []) {
    for (const [k, val] of Object.entries(v.props || {})) {
      if (opts[k] && !opts[k].includes(val)) p3.push(`변형 ${v.nodeId}: ${k}=${val}는 선택지에 없습니다`);
    }
  }
  results.push(p3.length ? fail("변형 조합", p3) : ok("변형 조합"));
  return results;
}

export function checkUxPattern(pattern) {
  const p = [];
  const ids = new Set();
  for (const r of pattern.rules) {
    if (!/^UX-[A-Z0-9-]+-\d{2,}$/.test(r.id)) p.push(`규칙 번호 형식이 아닙니다: ${r.id}`);
    if (ids.has(r.id)) p.push(`규칙 번호가 겹칩니다: ${r.id}`);
    ids.add(r.id);
    if (!r.text?.trim()) p.push(`${r.id} 내용이 비었습니다`);
    if (!["rule", "do", "dont"].includes(r.kind)) p.push(`${r.id} 종류(${r.kind})를 알 수 없습니다`);
  }
  return [p.length ? fail("형식 · 규칙 번호", p) : ok("형식 · 규칙 번호", `규칙 ${pattern.rules.length}개`)];
}

export function checkIconName(name, icons) {
  const p = [];
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) p.push("이름은 영문 PascalCase로 씁니다 (예: ArrowRight)");
  if (icons.some((i) => i.name === name && i.status === "ready")) p.push(`${name} 아이콘이 이미 있습니다`);
  return [p.length ? fail("이름 · 중복", p) : ok("이름 · 중복")];
}

// SB 블록 소스: 토큰만 쓰는지(색 hex 금지), 스크립트가 없는지
export function checkSbSource(source, tokens) {
  const res = [];
  const p1 = [];
  if (/<script/i.test(source)) p1.push("script는 넣을 수 없습니다");
  if (!source.trim()) p1.push("소스가 비었습니다");
  res.push(p1.length ? fail("형식", p1) : ok("형식"));
  const p2 = [];
  const hex = source.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  for (const h of new Set(hex)) p2.push(`색 값 ${h} 대신 토큰을 씁니다`);
  for (const m of source.matchAll(/var\((--[a-z0-9-]+)\)/g)) if (!tokens[m[1]]) p2.push(`토큰 ${m[1]}이 없습니다`);
  res.push(p2.length ? fail("토큰", p2) : ok("토큰"));
  return res;
}

// ---------- 2) 자동 검사 4종 ----------

export function checkInstruction(ins, bundle) {
  const comps = Object.fromEntries(bundle.components.map((c) => [c.key, c]));
  const blockIds = new Set([...bundle.commonBlocks.map((b) => b.id), ...bundle.sbBlocks.map((b) => b.id), ...(ins.newSbBlocks || []).map((b) => b.id)]);
  const ruleIds = new Set(bundle.uxRules.map((r) => r.id));
  const tokenNames = new Set(bundle.tokens.map((t) => t.name));
  const els = ins.elements || [];

  // 속성값
  const pa = [];
  for (const e of els) {
    if (!e.component) continue;
    const c = comps[e.component];
    if (!c) {
      pa.push(`${e.id}: 컴포넌트 ${e.component}는 이 화면 묶음에 없습니다`);
      continue;
    }
    for (const { name, value } of e.props || []) {
      const def = c.props.find((p) => p.name === name);
      if (!def) pa.push(`${e.id}: ${c.key}에 ${name} 속성이 없습니다`);
      else if (def.type === "variant" && !def.options.includes(value)) pa.push(`${e.id}: ${name}=${value}는 선택지(${def.options.join(", ")})에 없습니다`);
      else if (def.type === "boolean" && !["true", "false"].includes(String(value))) pa.push(`${e.id}: ${name}는 true/false입니다`);
    }
  }

  // 요소 ID
  const pi = [];
  const seen = new Set();
  for (const e of els) {
    if (!e.id) pi.push("ID 없는 요소가 있습니다");
    else if (seen.has(e.id)) pi.push(`요소 ID ${e.id}가 겹칩니다`);
    seen.add(e.id);
    if (e.block && !blockIds.has(e.block)) pi.push(`${e.id}: 블록 ${e.block}이 없습니다`);
    if (!e.block && !e.component) pi.push(`${e.id}: 공통 블록 · SB 블록 · 컴포넌트 중 하나를 써야 합니다`);
  }

  // 규칙
  const pr = [];
  for (const r of ins.review || []) if (!ruleIds.has(r.ruleId)) pr.push(`규칙 번호 ${r.ruleId}가 없습니다`);
  if (!(ins.review || []).length) pr.push("검수 근거(규칙 번호)가 없습니다");

  // 토큰
  const pt = [];
  for (const e of els) {
    for (const { prop, token } of e.tokens || []) {
      if (!tokenNames.has(token)) pt.push(`${e.id}: ${prop}에 쓴 ${token}은 쓸 수 있는 토큰이 아닙니다`);
    }
  }
  for (const b of ins.newSbBlocks || []) {
    for (const h of new Set(b.source?.match(/#[0-9a-fA-F]{3,8}\b/g) || [])) pt.push(`${b.id}: 색 값 ${h} 대신 토큰을 씁니다`);
  }

  return [
    pa.length ? fail("속성값", pa) : ok("속성값"),
    pi.length ? fail("요소 ID", pi) : ok("요소 ID"),
    pr.length ? fail("규칙", pr) : ok("규칙", `${(ins.review || []).length}건`),
    pt.length ? fail("토큰", pt) : ok("토큰"),
  ];
}

export const allPass = (results) => results.every((r) => r.pass);
