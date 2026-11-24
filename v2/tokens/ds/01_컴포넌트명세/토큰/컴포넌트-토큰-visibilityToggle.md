# 컴포넌트 토큰: visibilityToggle

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| visibilityToggle | 4971:32701 |

## 토큰 (5개: confirmed 5)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `visibilityToggle-color-bg-default` | `--visibility-toggle-color-bg-default` | 비밀번호 보기/숨기기 토글의 바탕 색(모든 상태 투명)으로, 토글에만 쓰며, 상태는 아이콘 색(visibilityToggle-color-fg-*)으로만 표시한다. | #00000000 | color-bg-transparent → color-transparent | confirmed | O | 4971:32701 모든 변형: #00000000 |  |
| `visibilityToggle-color-fg-default` | `--visibility-toggle-color-fg-default` | 비밀번호 보기/숨기기 토글 아이콘의 기본 상태 색으로, 토글에만 쓰며, 셀렉트 화살표처럼 입력칸 안의 아이콘과 아이콘 버튼은 button-iconOnly-plain-color-fg-*를 쓴다. | #697582 | color-fg-neutral-muted-default → color-gray-600 | confirmed | O | 4971:32701 visibility=masked·unmasked, size=16·14, state=default: #697582 |  |
| `visibilityToggle-color-fg-hover` | `--visibility-toggle-color-fg-hover` | 비밀번호 보기/숨기기 토글 아이콘의 hover 상태 색으로, 토글에만 쓰며, 셀렉트 화살표처럼 입력칸 안의 아이콘과 아이콘 버튼은 button-iconOnly-plain-color-fg-*를 쓴다. | #454F59 | color-fg-neutral-muted-hover → color-gray-700 | confirmed | O | 4971:32701 visibility=masked·unmasked, size=16·14, state=hover: #454F59 |  |
| `visibilityToggle-color-fg-pressed` | `--visibility-toggle-color-fg-pressed` | 비밀번호 보기/숨기기 토글 아이콘의 pressed 상태 색으로, 토글에만 쓰며, 셀렉트 화살표처럼 입력칸 안의 아이콘과 아이콘 버튼은 button-iconOnly-plain-color-fg-*를 쓴다. | #303942 | color-fg-neutral-muted-pressed → color-gray-800 | confirmed | O | 4971:32701 visibility=masked·unmasked, size=16·14, state=pressed: #303942 |  |
| `visibilityToggle-color-fg-disabled` | `--visibility-toggle-color-fg-disabled` | 비밀번호 보기/숨기기 토글 아이콘의 비활성 상태 색으로, 토글에만 쓰며, 셀렉트 화살표처럼 입력칸 안의 아이콘과 아이콘 버튼은 button-iconOnly-plain-color-fg-*를 쓴다. | #B3B9C0 | color-fg-neutral-disabled → color-gray-400 | confirmed | O | 4971:32701 visibility=masked·unmasked, size=16·14, state=disabled: #B3B9C0 |  |

## 참고

- **source**: 피그마 ❖ PasswordField _Item/PasswordField/VisibilityToggle(4971:32701)
- **decisions**: 토글은 아이콘 버튼과 다른 passwordField 전용 항목이라 자기 토큰을 둔다. 크기는 size-icon-*, 포커스 링은 focusRing-radius를 쓴다
