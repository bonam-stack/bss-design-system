// 흉내(mock) 모드: 키 없이 흐름을 돌려 보기 위한 규칙 기반 결과. 서버와 공유용 브라우저 버전이 같이 쓴다.

export function mockChat({ editable, locked, message }) {
  const lockedHit = locked.find((l) => message.includes(l));
  if (lockedHit || /토큰|variant|변형|props|속성/.test(message))
    return { reply: `${lockedHit || "토큰 · 변형 · 속성"}은 피그마에서 온 칸이라 챗으로 고칠 수 없습니다. 피그마에서 고친 뒤 주소를 다시 변환해 주세요.`, edits: [] };
  // "<칸>을/를 <값>(으)로 바꿔" 형태만 알아듣는다
  const m = message.match(/(.+?)[을를]\s*["“]?(.+?)["”]?\s*(?:으로|로)\s*(?:바꿔|수정|변경)/);
  const add = message.match(/(do|dont|규칙)\s*(?:규칙)?\s*추가[:：]?\s*(.+)/i);
  if (add && Object.keys(editable).some((f) => f.startsWith("add-rule"))) {
    const kind = /dont/i.test(add[1]) ? "dont" : /do/i.test(add[1]) ? "do" : "rule";
    return { reply: `${kind} 규칙을 추가했습니다. 번호는 저장할 때 붙습니다. (흉내 모드)`, edits: [{ field: `add-rule:${kind}`, value: add[2].trim() }] };
  }
  if (m) {
    const want = m[1].trim();
    const field = Object.keys(editable).find((f) => f === want || want.includes(f) || (want.includes("설명") && f === "description") || (want.includes("정책") && f === "guideLead") || (want.includes("이름") && f === "name"));
    if (field) return { reply: `${field}을(를) 고쳤습니다. (흉내 모드라 "<칸>을 <값>으로 바꿔 줘" 형태만 알아듣습니다)`, edits: [{ field, value: m[2].trim() }] };
  }
  return {
    reply: `흉내 모드라 "<칸>을 <값>으로 바꿔 줘" 형태만 처리합니다. 고칠 수 있는 칸: ${Object.keys(editable).join(", ") || "없음"}`,
    edits: [],
  };
}

// 흉내 모드: 요청 문장의 낱말로 컴포넌트를 고른다
export function mockScreen({ bundle, request, feedback }) {
  const has = (k) => bundle.components.some((c) => c.key === k);
  const els = [];
  let n = 1;
  const id = () => `E${String(n++).padStart(2, "0")}`;
  const text = `${request.title} ${request.description}`;
  const fieldWords = [...text.matchAll(/([가-힣A-Za-z]+)\s*(?:입력|필드|조건)/g)].map((m) => m[1]).slice(0, 4);
  if (has("text-field"))
    for (const w of fieldWords.length ? fieldWords : ["검색어"])
      els.push({ id: id(), area: "조회 조건", block: null, component: "text-field", props: [{ name: "placeholder", value: w }, { name: "size", value: "medium" }], tokens: [], icon: null, note: `${w} 입력` });
  if (/메모|내용|사유/.test(text) && has("text-area"))
    els.push({ id: id(), area: "입력", block: null, component: "text-area", props: [], tokens: [], icon: null, note: "긴 글 입력" });
  if (/동의|선택|체크/.test(text) && has("checkbox"))
    els.push({ id: id(), area: "입력", block: null, component: "checkbox", props: [], tokens: [], icon: null, note: "선택" });
  for (const b of bundle.commonBlocks) if (text.includes(b.name)) els.push({ id: id(), area: "본문", block: b.id, component: null, props: [], tokens: [], icon: null, note: b.name });
  for (const b of bundle.sbBlocks) if (text.includes(b.name)) els.push({ id: id(), area: "본문", block: b.id, component: null, props: [], tokens: [], icon: null, note: `${b.name} (SB 블록 재사용)` });
  const newSb = [];
  if (/목록|리스트|표|테이블/.test(text) && !bundle.sbBlocks.some((b) => text.includes(b.name))) {
    newSb.push({
      id: "NEW-1",
      name: "결과 목록",
      purpose: "조회 결과를 표로 보여 줌 (공통 블록 없음)",
      source:
        '<div style="border:1px solid var(--color-gray-200);border-radius:8px;padding:12px"><div style="font-weight:700;margin-bottom:8px">결과 목록</div><div style="color:var(--color-gray-500)">컬럼1 · 컬럼2 · 컬럼3</div></div>',
    });
    els.push({ id: id(), area: "목록", block: "NEW-1", component: null, props: [], tokens: [], icon: null, note: "결과 목록 (새 SB 블록)" });
  }
  const iconWord = text.match(/([A-Z][A-Za-z]+)\s*아이콘/);
  if (has("button"))
    els.push({
      id: id(),
      area: "하단 버튼",
      block: null,
      component: "button",
      props: [
        { name: "label", value: /저장/.test(text) ? "저장" : "조회" },
        { name: "type", value: "action" },
        { name: "showLeadingIcon", value: iconWord ? "true" : "false" },
      ],
      tokens: [],
      icon: iconWord ? iconWord[1] : null,
      note: "실행 버튼",
    });
  const review = bundle.uxRules.filter((r) => /button|text-field|INPUT/i.test(r.id)).slice(0, 3).map((r) => ({ ruleId: r.id, verdict: "do", note: "흉내 모드: 관련 규칙으로 표시" }));
  return { title: request.title, elements: els, newSbBlocks: newSb, review, ...(feedback ? { regenerated: true } : {}) };
}
