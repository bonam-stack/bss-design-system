// 서버용 저장: 처음 실행하면 저장소의 기준 JSON(components · patterns · icons · tokens)을
// 1.0.0으로 일괄 이관하고(seed), 이후 상태는 poc/data/state.json 하나에 저장한다.
// (문서 사이트의 BSS 디자인 포털은 site/portal/store.js가 브라우저에서 따로 관리한다.)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addRule } from "./rules.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const POC_DIR = path.resolve(HERE, "..");
export const REPO_DIR = path.resolve(POC_DIR, "..");
const DATA_DIR = process.env.POC_DATA_DIR || path.join(POC_DIR, "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(REPO_DIR, p), "utf8"));
const now = () => new Date().toISOString();

// ---------- 저장소 → 포털 형식 ----------

function loadComponents() {
  const { components } = readJson("components/index.json");
  const out = {};
  for (const key of components) {
    const c = readJson(`components/${key}/component.json`);
    let guide = null;
    const gp = path.join(REPO_DIR, `components/${key}/guide.json`);
    if (fs.existsSync(gp)) guide = JSON.parse(fs.readFileSync(gp, "utf8")).policy || null;
    out[key] = {
      key,
      name: c.name,
      description: c.description || "",
      figma: {
        fileKey: c.figma.fileKey,
        nodeId: c.figma.nodeId,
        componentKey: c.figma.componentKey,
        url: c.figma.url,
      },
      props: c.props.map((p) => ({
        name: p.name,
        type: p.type,
        default: p.default,
        ...(p.options ? { options: p.options } : {}),
      })),
      variants: (c.variants || []).map((v) => ({ nodeId: v.nodeId, key: v.key, props: v.props })),
      tokens: (c.tokens || []).map((t) => t.css).filter(Boolean),
      guideLead: guide?.lead || "",
    };
  }
  return out;
}

// UX 규칙: 컴포넌트 가이드 정책 + 패턴 가이드에서 rules · do · dont를 모아 번호를 붙인다.
function loadUxPatterns(components) {
  const patterns = {};
  const { guides } = readJson("components/guides.json");
  for (const key of guides) {
    const gp = path.join(REPO_DIR, `components/${key}/guide.json`);
    if (!fs.existsSync(gp)) continue;
    const pol = JSON.parse(fs.readFileSync(gp, "utf8")).policy;
    if (!pol) continue;
    const rules = [];
    for (const r of pol.rules || []) rules.push({ kind: "rule", text: `${r.name}: ${r.desc}` });
    for (const d of pol.do || []) rules.push({ kind: "do", text: typeof d === "string" ? d : d.text });
    for (const d of pol.dont || []) rules.push({ kind: "dont", text: typeof d === "string" ? d : d.text });
    patterns[key] = {
      key,
      name: components[key]?.name || key,
      scope: "component",
      description: pol.lead || "",
      when: pol.when || null,
      rules: [],
      nextNo: 1,
    };
    for (const r of rules) addRule(patterns[key], r.kind, r.text);
  }
  const { patterns: pkeys } = readJson("patterns/index.json");
  for (const key of pkeys) {
    const p = readJson(`patterns/${key}/pattern.json`);
    patterns[`pattern-${key}`] = {
      key: `pattern-${key}`,
      name: `${p.name} 패턴`,
      scope: "pattern",
      description: (p.overview || "").split("\n")[0],
      components: p.components || [],
      rules: [],
      nextNo: 1,
    };
    // 패턴 가이드의 유형 고르기 · 간격 규격을 규칙으로
    const pat = patterns[`pattern-${key}`];
    for (const t of p.types?.rows || []) {
      const lines = (t.desc || "").split("\n");
      addRule(pat, "rule", `${t.name}: ${(lines[1] || lines[0]).trim()}`);
    }
    const typeName = Object.fromEntries((p.types?.rows || []).map((t) => [t.figure, t.name]));
    const part = { lbl: "라벨", sel: "입력", opt1: "조건", opt2: "다음 조건", f1: "입력 칸", f2: "다음 입력 칸", gs: "묶음 안 칸", gf: "다음 칸", ps: "상위 입력", dg: "하위 입력" };
    for (const ex of p.spec?.examples || []) {
      for (const g of ex.gaps || [])
        addRule(pat, "rule", `${typeName[ex.figure] || ex.figure} 간격: ${part[g.from] || g.from}과 ${part[g.to] || g.to} 사이 ${g.value}px${g.center ? " (가운데 구분선)" : ""}`);
    }
  }
  return patterns;
}


function loadIcons() {
  const { icons } = readJson("icons/icons.json");
  return icons.map((i) => ({
    name: i.name,
    style: i.style,
    group: i.group,
    file: i.file,
    key: i.key,
    nodeId: i.nodeId,
    status: "ready",
  }));
}

function loadTokens() {
  const { tokens } = readJson("tokens/variables.json");
  const out = {};
  for (const [name, t] of Object.entries(tokens)) {
    out[name] = { collection: t.collection, type: t.type, value: t.value, key: t.key, ...(t.ref ? { ref: t.ref } : {}) };
  }
  return out;
}

export function seed() {
  const components = loadComponents();
  const baseline = {
    components,
    commonBlocks: {},
    uxPatterns: loadUxPatterns(components),
    sbBlocks: {},
    icons: loadIcons(),
  };
  const v = "1.0.0";
  return {
    schema: 1,
    seededAt: now(),
    tokens: loadTokens(),
    release: {
      current: v,
      previewCount: 0,
      history: [
        {
          version: v,
          at: now(),
          mode: "구축",
          reason: "피그마 DS library · UX 패턴 가이드 일괄 이관",
          notes: [],
        },
      ],
      snapshots: { [v]: JSON.parse(JSON.stringify(baseline)) },
    },
    // 작업 중인 기준. 미리보기 · 확인 · 배포 요청 상태의 변경이 여기서 만들어진다.
    changes: [],
    storyboards: [],
    notifications: [],
    seq: { change: 1, sb: 1, storyboard: 1, notice: 1 },
  };
}

// ---------- 읽기 · 쓰기 ----------

export function load() {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  return null;
}

export function persist(state) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = STATE_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(state, null, 1));
  fs.renameSync(tmp, STATE_FILE);
}
