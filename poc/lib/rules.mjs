// UX 규칙 번호 부여.
// 규칙 번호는 패턴마다 증가만 하고, 한 번 붙은 번호는 내용을 고쳐도 바뀌지 않는다.
export function addRule(pattern, kind, text) {
  const prefix = pattern.key.replace(/^pattern-/, "").toUpperCase();
  const id = `UX-${prefix}-${String(pattern.nextNo).padStart(2, "0")}`;
  pattern.nextNo += 1;
  const rule = { id, kind, text };
  pattern.rules.push(rule);
  return rule;
}
