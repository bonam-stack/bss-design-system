// 컴포넌트 코드 AI 채팅: 디자인 시스템 담당이 말로 요청하면 Claude가 컴포넌트 TSX를 고쳐 돌려준다.
// 정적 사이트(GitHub Pages)라 서버가 없으므로, 담당이 이 브라우저에 넣은 자기 Anthropic API 키로 브라우저에서 바로 부른다.
// 키가 없으면 흉내 모드: "A를 B로 바꿔 줘"처럼 글자 바꾸기만 한다.

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

const KEY = 'bss-portal.anthropic-key';
export const getApiKey = () => {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
};
export const setApiKey = (k: string) => {
  try {
    if (k) localStorage.setItem(KEY, k);
    else localStorage.removeItem(KEY);
  } catch {
    /* 저장 못 하면 이번 화면에서만 */
  }
};

const SYSTEM = `당신은 BSS 디자인 시스템의 React 컴포넌트 파일 하나를 고치는 프런트엔드 엔지니어입니다.
사용자는 디자인 시스템 담당이며, 한국어로 고칠 점을 말합니다.

파일 규칙 (어기면 포털 미리보기에서 돌지 않습니다):
- 컴포넌트 이름과 export(export function <이름>)는 그대로 둡니다. <이름>.meta 줄도 그대로 둡니다.
- import는 'react', '../shared', '../field', './다른컴포넌트'만 씁니다. 새 패키지를 가져오지 않습니다.
- 스타일은 CSS 파일 없이 style 객체로 씁니다. 색 · 치수는 tok('토큰-이름', Figma 값)으로 디자인 토큰을 씁니다.
- 실제 입력 요소(<input> · <button> · <textarea>)와 접근성 속성은 유지합니다.
- 요청과 관계없는 부분은 바꾸지 않습니다.

답 형식:
1. 무엇을 어떻게 바꿨는지 한국어로 1~3문장.
2. 바꾼 파일 전체를 \`\`\`tsx 코드 블록 하나로. 잘라 내거나 "생략" 표시를 넣지 않습니다.
코드를 바꿀 필요가 없는 질문이면 코드 블록 없이 답만 합니다.`;

/** 답에서 ```tsx 블록과 그 앞의 설명을 나눈다 */
function split(text: string): { reply: string; source?: string } {
  const m = text.match(/```(?:tsx|typescript|ts|jsx)?\n([\s\S]*?)```/);
  if (!m) return { reply: text.trim() };
  return { reply: text.replace(m[0], '').trim() || '코드를 고쳤습니다.', source: m[1].trimEnd() + '\n' };
}

/** Claude에게 요청 (브라우저에서 바로, 사용자의 API 키) */
async function askClaude(apiKey: string, name: string, source: string, instruction: string, history: ChatTurn[]) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  try {
    const stream = client.beta.messages.stream({
      model: 'claude-opus-5-5',
      max_tokens: 64000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium' },
      system: SYSTEM,
      messages: [
        // 앞선 대화는 요청과 답의 설명만 (코드는 지금 파일 하나만 보낸다)
        ...history.map((t) => ({ role: t.role, content: t.text })),
        { role: 'user', content: `지금 파일: src/ds/components/${name}.tsx\n\`\`\`tsx\n${source}\`\`\`\n\n요청: ${instruction}` },
      ],
    });
    const msg = await stream.finalMessage();
    if (msg.stop_reason === 'refusal') return { reply: '이 요청은 처리할 수 없다는 답이 왔습니다. 요청을 바꿔 다시 시도해 주세요.' };
    const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    if (msg.stop_reason === 'max_tokens') return { reply: '답이 너무 길어 끝까지 받지 못했습니다. 요청을 나눠 주세요.' };
    return split(text);
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error('API 키가 맞지 않습니다. 키를 다시 넣어 주세요.');
    if (e instanceof Anthropic.APIConnectionError) throw new Error('Anthropic API에 연결하지 못했습니다. 인터넷 연결이나 회사 방화벽(api.anthropic.com)을 확인해 주세요.');
    if (e instanceof Anthropic.RateLimitError) throw new Error('요청이 많아 잠시 막혔습니다. 조금 뒤에 다시 보내 주세요.');
    if (e instanceof Anthropic.APIError) throw new Error(`API 오류 ${e.status ?? ''}: ${e.message}`);
    throw e;
  }
}

/** 흉내 모드: "A를 B로 바꿔 줘" · "A → B" 글자 바꾸기 */
function mock(source: string, instruction: string) {
  const unq = (x: string) => x.trim().replace(/^['"“‘]|['"”’]$/g, '').trim();
  const m = instruction.match(/^(.+?)(?:을|를)\s*(.+?)(?:으로|로)\s*(?:바꿔|변경|수정|고쳐)/) || instruction.match(/^(.+?)\s*(?:→|->)\s*(.+)$/);
  if (!m) return { reply: '흉내 모드에서는 글자 바꾸기만 할 수 있습니다. 예: "#3617CE를 #E5007E로 바꿔 줘", "Label → 이름". AI로 고치려면 위에서 Anthropic API 키를 넣어 주세요.' };
  const from = unq(m[1]);
  const to = unq(m[2]);
  const n = from ? source.split(from).length - 1 : 0;
  if (!n) return { reply: `코드에서 "${from}"을(를) 찾지 못했습니다.` };
  return { reply: `"${from}" ${n}곳을 "${to}"(으)로 바꿨습니다.`, source: source.split(from).join(to) };
}

export async function editWithChat(name: string, source: string, instruction: string, history: ChatTurn[]): Promise<{ reply: string; source?: string; mode: 'ai' | 'mock' }> {
  const key = getApiKey();
  if (!key) return { ...mock(source, instruction), mode: 'mock' };
  return { ...(await askClaude(key, name, source, instruction, history)), mode: 'ai' };
}
