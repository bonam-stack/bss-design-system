// Claude 연동: 미리보기 챗 수정 · Studio 화면 생성(UI 블록 대응 + 그리기 검수).
// ANTHROPIC_API_KEY가 없으면 흉내(mock) 모드로 규칙 기반 결과를 돌려준다.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";

const MODEL = process.env.POC_MODEL || "claude-opus-5-5";
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
export const aiMode = () => (client ? "live" : "mock");

async function ask({ system, user, schema, effort = "medium", maxTokens = 16000 }) {
  const res = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: maxTokens,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    messages: [{ role: "user", content: user }],
    output_config: { effort, format: betaZodOutputFormat(schema) },
  });
  if (res.stop_reason === "refusal") throw new Error("AI가 이 요청을 처리하지 않았습니다 (refusal)");
  if (res.stop_reason === "max_tokens") throw new Error("AI 응답이 길이 제한에 걸렸습니다");
  if (!res.parsed_output) throw new Error("AI 응답을 형식대로 읽지 못했습니다");
  return res.parsed_output;
}

// ---------- 미리보기 챗 ----------

export const ChatSchema = z.object({
  reply: z.string().describe("담당자에게 보여 줄 한국어 답. 무엇을 고쳤는지, 못 고친 것은 왜인지"),
  edits: z
    .array(
      z.object({
        field: z.string().describe("고칠 칸. editable 목록에 있는 이름만"),
        value: z.string().describe("새 값 전체"),
      })
    )
    .describe("고칠 것이 없으면 빈 배열"),
});

/**
 * draft: 지금 미리보기의 소스, editable: {field: 현재값}, locked: 막아 둔 칸 이름
 */
export async function chatEdit({ caseName, draft, editable, locked, history, message }) {
  if (!client) return mockChat({ editable, locked, message });
  const system = [
    "너는 BSS 디자인 포털의 미리보기 챗이다. 담당자가 말로 요청하면 소스의 허용된 칸만 고친다.",
    "규칙:",
    "- edits의 field는 editable 목록의 이름만 쓴다. 칸 전체 값을 value에 넣는다.",
    "- 토큰 값 · variants · props · figma key 등 피그마에서 온 칸(locked)은 고치지 않는다. 요청받으면 피그마에서 고쳐야 한다고 답한다.",
    "- SB 블록 소스(HTML)는 색 · 간격에 hex 대신 var(--토큰) 을 쓰고 script를 넣지 않는다.",
    "- 규칙 추가는 field 'add-rule:do' | 'add-rule:dont' | 'add-rule:rule' 로, 규칙 수정은 'rule:<규칙 번호>' 로 한다. 번호는 포털이 붙인다.",
    "- 답은 짧은 한국어 평서문.",
  ].join("\n");
  const user = JSON.stringify({ case: caseName, draft, editable, locked, recentChat: history.slice(-6), request: message }, null, 1);
  return ask({ system, user, schema: ChatSchema, effort: "medium" });
}

function mockChat({ editable, locked, message }) {
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
    if (field) return { reply: `${field}을(를) 고쳤습니다. (흉내 모드: ANTHROPIC_API_KEY를 설정하면 자유롭게 요청할 수 있습니다)`, edits: [{ field, value: m[2].trim() }] };
  }
  return {
    reply: `흉내 모드라 "<칸>을 <값>으로 바꿔 줘" 형태만 처리합니다. 고칠 수 있는 칸: ${Object.keys(editable).join(", ") || "없음"}`,
    edits: [],
  };
}

// ---------- Studio 화면 생성 ----------

export const ScreenSchema = z.object({
  title: z.string(),
  elements: z
    .array(
      z.object({
        id: z.string().describe("화면 안에서 고유한 요소 ID, 예: E01"),
        area: z.string().describe("놓이는 영역, 예: 조회 조건 · 목록 · 하단 버튼"),
        block: z.string().nullable().describe("공통 블록 ID 또는 SB 블록 ID. 컴포넌트만 놓으면 null"),
        component: z.string().nullable().describe("컴포넌트 key. 블록만 놓으면 null"),
        props: z.array(z.object({ name: z.string(), value: z.string() })),
        tokens: z.array(z.object({ prop: z.string(), token: z.string() })).describe("값 대신 토큰 이름"),
        icon: z.string().nullable().describe("아이콘 이름. 묶음에 없으면 규칙대로 새 이름을 짓는다"),
        note: z.string(),
      })
    ),
  newSbBlocks: z
    .array(z.object({ id: z.string().describe("NEW-1 처럼"), name: z.string(), purpose: z.string(), source: z.string().describe("HTML. 색은 var(--토큰)") }))
    .describe("공통 블록 · 컴포넌트로 만들 수 없는 부분만"),
  review: z
    .array(z.object({ ruleId: z.string(), verdict: z.enum(["do", "dont"]), note: z.string() }))
    .describe("그리기 검수: 이 화면에 적용되는 UX 규칙 번호별 판정과 근거"),
});

export async function generateScreen({ bundle, request, feedback }) {
  if (!client) return mockScreen({ bundle, request, feedback });
  const system = [
    "너는 BSS SB Studio의 화면 생성 에이전트다. 받은 기준 묶음 안의 재료만 써서 Storyboard 화면 지시서를 만든다.",
    "순서: 레이아웃 규칙에 맞춰 공통 블록 → 컴포넌트 순서로 고르고, 둘 다로 만들 수 없을 때만 newSbBlocks에 SB 블록을 만든다.",
    "- component는 묶음의 key, props는 묶음에 있는 이름과 선택지 값만 쓴다. boolean은 'true'/'false'.",
    "- 색 · 간격 등 스타일은 tokens에 묶음의 토큰 이름으로만 적는다. hex 값을 쓰지 않는다.",
    "- 묶음에 없는 아이콘이 필요하면 PascalCase 영문 이름을 지어 icon에 넣는다 (더미로 처리된다).",
    "- review에는 이 화면과 관련된 uxRules 번호만 넣고, 지켰으면 do, 어겼으면 dont와 이유를 적는다.",
    feedback ? `이전 결과가 자동 검사에서 떨어졌다. 다음 문제를 고쳐 다시 만든다:\n${feedback}` : "",
  ].join("\n");
  const user = JSON.stringify({ request, bundle }, null, 0);
  return ask({ system, user, schema: ScreenSchema, effort: "high", maxTokens: 32000 });
}

// 흉내 모드: 요청 문장의 낱말로 컴포넌트를 고른다
function mockScreen({ bundle, request, feedback }) {
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
