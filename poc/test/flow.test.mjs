// 덱의 케이스 1~4 · 승격 · 배포 · 롤백 · Studio 연계를 흉내 모드로 끝까지 돌려 본다.
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.POC_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "bss-poc-"));
delete process.env.FIGMA_TOKEN;
delete process.env.ANTHROPIC_API_KEY;

const store = await import("../lib/store.mjs");
const portal = await import("../lib/portal.mjs");
const { checkInstruction } = await import("../lib/checks.mjs");

const FIGMA = (node) => `https://www.figma.com/design/9AioWOXVOVm5C7kdSxSEEP/Lib?node-id=${node.replace(":", "-")}`;
const ship = (role, id) => {
  portal.markChecked(role, id);
  portal.requestDeploy(role, id);
};

test("구축: 저장소 기준이 1.0.0으로 이관된다", () => {
  const s = store.getState();
  assert.equal(s.release.current, "1.0.0");
  const rel = store.released();
  assert.ok(rel.components.button);
  assert.ok(rel.uxPatterns["pattern-input"].rules[0].id.startsWith("UX-INPUT-"));
});

test("케이스 1: 새 컴포넌트 요청 → 피그마 변환 → 미리보기 → 확인 → 배포(MINOR)", async () => {
  const c = portal.createChange("viewer", { case: "ds", title: "Chip 신규" });
  assert.equal(c.status, "requested");
  assert.throws(() => portal.startWork("ux", c.id), /DS 담당자/);
  portal.startWork("ds", c.id);
  await portal.convertFigma("ds", c.id, FIGMA("9000:1"));
  assert.equal(c.status, "preview", JSON.stringify(c.checks));
  assert.match(c.previewVersion, /^1\.1\.0-preview\.\d+$/);
  assert.equal(c.diff.bump, "MINOR");
  // 챗: 피그마에서 온 칸은 막는다
  await portal.chat("ds", c.id, "variants 하나 지워 줘");
  assert.match(c.chat.at(-1).text, /피그마/);
  await portal.chat("ds", c.id, "설명을 필터 칩으로 바꿔 줘");
  assert.equal(c.draft.description, "필터 칩");
  ship("ds", c.id);
  assert.throws(() => portal.deploy("ds", {}), /관리자/);
  const h = portal.deploy("admin", {});
  assert.equal(h.version, "1.1.0");
  assert.ok(store.released().components.chip);
});

test("Studio: 기준 묶음으로 화면 생성 → 검사 4종 → 새 SB 블록 · 더미 아이콘", async () => {
  const st = await portal.studioGenerate({ title: "고객 조회", description: "고객명 입력, 생년월일 입력, 결과 목록, Rocket 아이콘 조회 버튼", screenType: "조회" });
  assert.equal(st.baseVersion, "1.1.0");
  assert.ok(st.checks.every((c) => c.pass), JSON.stringify(st.checks));
  assert.deepEqual(st.dummyIcons, ["Rocket"]);
  const sb = Object.values(store.released().sbBlocks);
  assert.equal(sb.length, 1);
  assert.throws(() => portal.studioHandoff(st.id), /더미 아이콘/);
  // 아이콘 요청이 자동으로 생겼다
  assert.ok(store.getState().changes.find((c) => c.case === "icon" && c.target.key === "Rocket"));
});

test("자동 검사 4종은 묶음에 없는 값 · 토큰 · 규칙을 잡는다", () => {
  const bundle = portal.buildBundle();
  const res = checkInstruction(
    {
      elements: [
        { id: "E1", component: "button", props: [{ name: "type", value: "giant" }], tokens: [{ prop: "color", token: "--nope" }] },
        { id: "E1", block: "SB-9999" },
      ],
      review: [{ ruleId: "UX-NOPE-01" }],
    },
    bundle
  );
  assert.deepEqual(res.map((r) => r.pass), [false, false, false, false]);
});

test("케이스 4: 아이콘 제작 → 배포 → 더미 자동 교체 → 핸드오프", async () => {
  const c = store.getState().changes.find((x) => x.case === "icon" && x.target.key === "Rocket");
  portal.startWork("ds", c.id);
  await portal.convertFigma("ds", c.id, FIGMA("9100:1"));
  assert.equal(c.status, "preview", JSON.stringify(c.checks));
  ship("ds", c.id);
  const h = portal.deploy("admin", { mode: "manual", ids: [c.id], reason: "아이콘 추가" });
  assert.equal(h.version, "1.2.0");
  assert.equal(h.mode, "수동");
  const st = store.getState().storyboards[0];
  assert.deepEqual(st.dummyIcons, []);
  portal.studioHandoff(st.id);
  assert.ok(st.handedOffAt);
});

test("케이스 2: UX 규칙 수정은 번호를 지키고 MAJOR → 재검수 대상 표시", async () => {
  const c = portal.createChange("ux", { case: "ux", title: "버튼 규칙 강화", targetKey: "button" });
  const first = c.draft.rules[0];
  portal.saveEdit("ux", c.id, { rules: [{ id: first.id, text: first.text + " 반드시 잠급니다." }], addRules: [{ kind: "do", text: "잠긴 이유를 버튼 옆에 적습니다." }] });
  assert.equal(c.status, "preview");
  assert.equal(c.draft.rules[0].id, first.id);
  assert.match(c.draft.rules.at(-1).id, /^UX-BUTTON-\d{2}$/);
  assert.equal(c.diff.bump, "MAJOR");
  ship("ux", c.id);
  const h = portal.deploy("admin", {});
  assert.equal(h.version, "2.0.0");
  const st = store.getState().storyboards[0];
  assert.ok(st.needsReview, "버튼 규칙을 읽은 Storyboard는 재검수 대상");
  portal.studioRecheck(st.id);
  assert.equal(st.needsReview, null);
  assert.equal(st.baseVersion, "2.0.0");
});

test("케이스 3 · 승격: SB 블록 소스 수정, 여러 화면에서 쓰이면 2단 심사로 공통 블록", async () => {
  const sbId = Object.keys(store.released().sbBlocks)[0];
  const c = portal.createChange("ux", { case: "sb", title: "결과 목록 수정", targetKey: sbId });
  portal.saveEdit("ux", c.id, { source: '<div style="color:#ff0000">x</div>' });
  assert.equal(c.status, "working", "hex 색은 자동 확인 미달");
  portal.saveEdit("ux", c.id, { source: '<div style="color:var(--color-gray-500)">결과 목록</div>' });
  assert.equal(c.status, "preview", JSON.stringify(c.checks));

  assert.throws(() => portal.promoteReview("ux", sbId, true), /승격 후보/);
  await portal.studioGenerate({ title: "주문 조회", description: "주문번호 입력, 결과 목록", screenType: "조회" });
  const b = store.released().sbBlocks[sbId];
  assert.equal(b.usage.length, 2);
  portal.promoteReview("ux", sbId, true, "두 화면에서 반복");
  const p = store.getState().changes.find((x) => x.case === "promote");
  portal.startWork("ds", p.id);
  await portal.convertFigma("ds", p.id, FIGMA("9200:1"));
  assert.equal(p.status, "preview", JSON.stringify(p.checks));
  ship("ds", p.id);
  const h = portal.deploy("admin", {});
  assert.equal(h.version, "2.1.0");
  assert.ok(Object.values(store.released().commonBlocks).length === 1);
});

test("롤백: 마지막 배포를 되돌린다", () => {
  const h = portal.rollback("admin", "확인용");
  assert.equal(h.version, "2.0.0");
  assert.equal(store.getState().release.current, "2.0.0");
  assert.equal(Object.values(store.released().commonBlocks).length, 0);
});
