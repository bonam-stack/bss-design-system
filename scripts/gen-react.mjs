// component.json → React 컴포넌트 (src/ds/components/<Name>.tsx) + src/ds/index.ts
//   npm run gen   (dev · build가 먼저 부른다)
// Figma 속성이 그대로 React 속성이 된다: 변형 속성은 선택지 문자열, 불리언 · 텍스트 속성은 boolean · string, SLOT은 children.
// 컴포넌트가 쓰는 아이콘 SVG도 함께 가져와, 생성된 컴포넌트 하나만 가져다 써도 그대로 그려진다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/ds/components');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const pascal = (key) => key.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)).join('');
const ident = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const q = (s) => JSON.stringify(s);
const doc = (s) => String(s).replace(/\*\//g, '* /');

const registry = readJson('components/index.json').components;
const icons = readJson('icons/icons.json');
const iconByKey = new Map(icons.icons.filter((i) => i.file).map((i) => [i.key, i]));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const made = [];
for (const key of registry) {
  const c = readJson(`components/${key}/component.json`);
  const name = pascal(key);
  const keys = new Set();
  const walk = (l) => {
    if (l.main && iconByKey.has(l.main.key)) keys.add(l.main.key);
    (l.children || []).forEach(walk);
  };
  c.variants.forEach((v) => v.layer && walk(v.layer));
  if (c.layer) walk(c.layer);
  const iconList = [...keys].sort();

  const fields = [];
  for (const p of c.props) {
    if (!ident.test(p.name) || ['children', 'className', 'style', 'overrides', 'interactive', 'onChange', 'onClick', 'id'].includes(p.name)) {
      throw new Error(`${key}: 속성 이름 "${p.name}"은 React 속성으로 쓸 수 없습니다. Figma 속성 이름을 바꿔 주세요`);
    }
    if (p.type === 'variant') {
      const opts = p.options.map(q).join(' | ');
      const bool = p.options.length === 2 && p.options.includes('true') && p.options.includes('false');
      fields.push(`  /** 변형 · 기본값 ${q(p.default)} */\n  ${p.name}?: ${opts}${bool ? ' | boolean' : ''};`);
    } else if (p.type === 'boolean') fields.push(`  /** 기본값 ${p.default} */\n  ${p.name}?: boolean;`);
    else if (p.type === 'text') fields.push(`  /** 기본값 ${q(p.default)} */\n  ${p.name}?: string;`);
    // slot은 children으로 받는다 (DsBaseProps)
  }
  const slot = c.props.find((p) => p.type === 'slot');

  const src = `// 생성 파일: scripts/gen-react.mjs (npm run gen). 직접 고치지 않는다.
// 원본: components/${key}/component.json · Figma ${c.figma.url}
import data from '../../../components/${key}/component.json';
${iconList.map((k, i) => `import icon${i} from '../../../icons/${iconByKey.get(k).file}?raw';`).join('\n')}
import { createFigmaComponent } from '../core/react';
import type { ComponentData, IconMap } from '../types';

/** ${doc(c.name)} 속성${slot ? ` · ${slot.name} 슬롯은 children` : ''} */
export interface ${name}Props {
${fields.join('\n')}
}

const icons: IconMap = {
${iconList.map((k, i) => `  ${q(k)}: { svg: icon${i}, colored: ${iconByKey.get(k).style === 'colored'} },`).join('\n')}
};

/**
 * ${doc(c.description).split('\n').join('\n * ')}
 */
export const ${name} = createFigmaComponent<${name}Props>(data as ComponentData, icons, ${q(name)});
`;
  fs.writeFileSync(path.join(OUT, `${name}.tsx`), src);
  made.push({ key, name });
}

const index = `// 생성 파일: scripts/gen-react.mjs (npm run gen). 직접 고치지 않는다.
// BSS 디자인 시스템 React 컴포넌트. components/index.json 순서.
${made.map((m) => `export { ${m.name} } from './components/${m.name}';\nexport type { ${m.name}Props } from './components/${m.name}';`).join('\n')}
export type { DsBaseProps, DsComponent } from './core/react';
export type { ComponentData, IconMap, PropValues } from './types';

${made.map((m) => `import { ${m.name} } from './components/${m.name}';`).join('\n')}

/** component.json 키 → React 컴포넌트 */
export const components = {
${made.map((m) => `  ${q(m.key)}: ${m.name},`).join('\n')}
} as const;
`;
fs.writeFileSync(path.join(ROOT, 'src/ds/index.ts'), index);
console.log(`React 컴포넌트 ${made.length}개: ${made.map((m) => m.name).join(', ')}`);
