// 포털 화면 공통 상태: 지금 역할, 편집 칸 열림 상태, 알림(토스트), 목차.
import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import * as P from './store';
import type { EditType, Role } from './store';

export interface UiState {
  /** 규칙 검색어 */
  q: string;
  /** 규칙 종류 필터 */
  kd: string;
  /** 지금 줄 편집 중인 규칙 */
  editRule: string | null;
  /** 지금 열린 편집 칸 키 (item:<code> · figma:<key> · guide:<key>) */
  edit: string | null;
}
export const emptyUi: UiState = { q: '', kd: '', editRule: null, edit: null };

/** 설명 편집 모드에서 고친 글 (아직 초안이 아님) */
export interface PendingText {
  scopeKey: string;
  scopeName: string;
  path: string;
  label: string;
  /** 원래 글 */
  before: string;
  value: string;
  /** 페이지 설명처럼 다른 초안으로 저장하는 글 */
  onSave?: (v: string) => unknown;
}

export interface TocItem {
  id: string;
  label: string;
  sub: boolean;
}

export interface PortalCtx {
  role: Role;
  setRole: (r: Role) => void;
  ui: UiState;
  setUi: Dispatch<SetStateAction<UiState>>;
  toast: (msg: string) => void;
  /** 설명 편집 모드: 켜면 고칠 수 있는 글이 모두 입력칸이 된다 */
  textEdit: boolean;
  setTextEdit: (on: boolean) => void;
  pending: Record<string, PendingText>;
  setPending: Dispatch<SetStateAction<Record<string, PendingText>>>;
  toc: { title: string; items: TocItem[] };
}

export const Ctx = createContext<PortalCtx>(null as unknown as PortalCtx);

export function usePortal() {
  const c = useContext(Ctx);
  const isEditor = c.role !== 'viewer';
  const can = (type: EditType) => c.role === P.EDITOR[type];
  /** 포털 동작 실행: 성공하면 알림 · 이동, 실패하면 이유를 알림 */
  async function act<T>(fn: () => T | Promise<T>, ok?: string | ((x: T) => string), go?: string | ((x: T) => string)): Promise<T | null> {
    document.body.classList.add('busy');
    try {
      const out = await fn();
      const hash = typeof go === 'function' ? go(out) : go;
      if (hash && location.hash !== hash) location.hash = hash;
      if (ok) c.toast(typeof ok === 'function' ? ok(out) : ok);
      return out;
    } catch (e) {
      c.toast((e as Error).message);
      return null;
    } finally {
      document.body.classList.remove('busy');
    }
  }
  const toggleEdit = (k: string) => c.setUi((u) => ({ ...u, edit: u.edit === k ? null : k }));
  const closeEdit = () => c.setUi((u) => ({ ...u, edit: null, editRule: null }));
  return { ...c, isEditor, can, act, toggleEdit, closeEdit };
}
