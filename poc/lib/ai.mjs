// Claude 연동: 미리보기 챗 수정 · Studio 화면 생성(UI 블록 대응 + 그리기 검수).
// ANTHROPIC_API_KEY가 없으면 흉내(mock) 모드로 규칙 기반 결과를 돌려준다.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import { mockChat, mockScreen } from "./ai.mock.mjs";

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

