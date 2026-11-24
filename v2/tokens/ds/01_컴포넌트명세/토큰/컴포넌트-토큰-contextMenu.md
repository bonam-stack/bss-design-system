# 컴포넌트 토큰: contextMenu

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| contextMenu | 8487:11530 |
| contextMenu (메뉴 항목 _Item/ContextMenu/MenuItem) | 8487:11462 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `contextMenu-menuItem` | 컨텍스트 메뉴 항목 라벨 | `font-label-14-600` | `label/14/600` | 14px/20px 600 -0.2px | 8487:11462 모든 변형, label: text style label/14/600 |
| `contextMenu-subLabel` | 컨텍스트 메뉴 항목 설명 | `font-caption-12-400` | `caption/12/400` | 12px/16px 400 -0.2px | 8487:11462 모든 변형, description: text style caption/12/400 |

## 토큰 (26개: confirmed 26)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `contextMenu-color-bg-default` | `--context-menu-color-bg-default` | 컨텍스트 메뉴 상자의 바탕 색(흰색)으로, 메뉴 상자에만 쓰며, 항목 바탕은 contextMenu-menuItem-color-bg-*를 쓴다. | #FFFFFF | color-bg-base → color-white | confirmed | O | 8487:11530 ContextMenu: #FFFFFF |  |
| `contextMenu-color-border-default` | `--context-menu-color-border-default` | 컨텍스트 메뉴 상자 테두리 색(gray 300, 안쪽 1px)으로, 메뉴 상자에만 쓴다. | #C4C9CF | color-border-neutral-strong → color-gray-300 | confirmed | O | 8487:11530 ContextMenu 상자 stroke INSIDE: #C4C9CF |  |
| `contextMenu-space-paddingX` | `--context-menu-space-padding-x` | 컨텍스트 메뉴 상자의 좌우 안쪽 여백(8px)으로, 메뉴 상자에만 쓰며, 위아래 여백은 contextMenu-space-paddingY(같은 8px)를 쓴다. | 8px | space-8 | confirmed | O | 8487:11530 ContextMenu: 8 |  |
| `contextMenu-space-paddingY` | `--context-menu-space-padding-y` | 컨텍스트 메뉴 상자의 위아래 안쪽 여백(8px)으로, 메뉴 상자에만 쓰며, 좌우 여백은 contextMenu-space-paddingX(같은 8px)를 쓴다. | 8px | space-8 | confirmed | O | 8487:11530 ContextMenu: 8 |  |
| `contextMenu-space-gap` | `--context-menu-space-gap` | 컨텍스트 메뉴에서 항목 사이 간격(8px)으로, 항목 위 구분선과 항목 사이에도 같은 값을 쓰며, 항목 안 라벨과 설명 사이는 contextMenu-menuItem-space-gap을 쓴다. | 8px | space-8 | confirmed | O | 8487:11530 content 슬롯 항목 사이, _Item/ContextMenu/MenuItem topLine과 itemBox 사이(8487:11462): 8 | CTX-02 |
| `contextMenu-radius` | `--context-menu-radius` | 컨텍스트 메뉴 상자의 모서리(6px)로, 메뉴 상자에만 쓰며, 항목 모서리는 contextMenu-menuItem-radius를 쓴다. | 6px | radius-small → radius-6 | confirmed | O | 8487:11530 ContextMenu: 6 |  |
| `contextMenu-borderWidth` | `--context-menu-border-width` | 컨텍스트 메뉴 상자 테두리 두께(1px, 안쪽)로, 메뉴 상자에만 쓴다. | 1px | borderWidth-thin → borderWidth-1 | confirmed | O | 8487:11530 ContextMenu 상자 stroke INSIDE: 1 |  |
| `contextMenu-shadow` | `--context-menu-shadow` | 컨텍스트 메뉴 상자의 그림자(small)로, 메뉴 상자에만 쓴다. | 0px 2px 12px 0px #0000003D | shadow-small | confirmed | O | 8487:11530 ContextMenu: shadow/small |  |
| `contextMenu-size-width` | `--context-menu-size-width` | 컨텍스트 메뉴 상자의 너비(274px, 고정)로, 메뉴 상자에만 쓰며, 항목은 상자 안쪽 너비를 채운다. | 274px | size-274 | confirmed | O | 8487:11530 ContextMenu, 너비 고정: 274 |  |
| `contextMenu-menuItem-color-bg-default` | `--context-menu-menu-item-color-bg-default` | 컨텍스트 메뉴 항목의 default 상태 바탕 색으로, 메뉴 항목에만 쓴다. | #00000000 | color-bg-transparent → color-transparent | confirmed | O | 8487:11462 state=default, itemBox: #00000000 | CTX-01 |
| `contextMenu-menuItem-color-bg-hover` | `--context-menu-menu-item-color-bg-hover` | 컨텍스트 메뉴 항목의 hover 상태 바탕 색으로, 메뉴 항목에만 쓴다. | #F8F9FB | color-bg-neutral-faint → color-gray-50 | confirmed | O | 8487:11462 state=hover, itemBox: #F8F9FB |  |
| `contextMenu-menuItem-color-bg-pressed` | `--context-menu-menu-item-color-bg-pressed` | 컨텍스트 메뉴 항목의 pressed 상태 바탕 색으로, 메뉴 항목에만 쓴다. | #F1F3F5 | color-bg-neutral-muted → color-gray-80 | confirmed | O | 8487:11462 state=pressed, itemBox: #F1F3F5 |  |
| `contextMenu-menuItem-color-bg-disabled` | `--context-menu-menu-item-color-bg-disabled` | 컨텍스트 메뉴 항목의 disabled 상태 바탕 색으로, 메뉴 항목에만 쓴다. | #00000000 | color-bg-transparent → color-transparent | confirmed | O | 8487:11462 state=disabled, itemBox: #00000000 |  |
| `contextMenu-menuItem-color-fg-default` | `--context-menu-menu-item-color-fg-default` | 컨텍스트 메뉴 항목 라벨의 default 상태 글자 색으로, 항목 라벨에만 쓰며, 설명 글자는 contextMenu-subLabel-color-fg-*를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 8487:11462 state=default, label: #1C1F23 |  |
| `contextMenu-menuItem-color-fg-hover` | `--context-menu-menu-item-color-fg-hover` | 컨텍스트 메뉴 항목 라벨의 hover 상태 글자 색으로, 항목 라벨에만 쓰며, 설명 글자는 contextMenu-subLabel-color-fg-*를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 8487:11462 state=hover, label: #1C1F23 |  |
| `contextMenu-menuItem-color-fg-pressed` | `--context-menu-menu-item-color-fg-pressed` | 컨텍스트 메뉴 항목 라벨의 pressed 상태 글자 색으로, 항목 라벨에만 쓰며, 설명 글자는 contextMenu-subLabel-color-fg-*를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 8487:11462 state=pressed, label: #1C1F23 |  |
| `contextMenu-menuItem-color-fg-disabled` | `--context-menu-menu-item-color-fg-disabled` | 컨텍스트 메뉴 항목 라벨의 disabled 상태 글자 색으로, 항목 라벨에만 쓰며, 설명 글자는 contextMenu-subLabel-color-fg-*를 쓴다. | #B3B9C0 | color-fg-neutral-disabled → color-gray-400 | confirmed | O | 8487:11462 state=disabled, label: #B3B9C0 |  |
| `contextMenu-menuItem-space-paddingX` | `--context-menu-menu-item-space-padding-x` | 컨텍스트 메뉴 항목의 좌우 안쪽 여백(12px)으로, 메뉴 항목에만 쓰며, 위아래 여백은 contextMenu-menuItem-space-paddingY(8px)를 쓴다. | 12px | space-12 | confirmed | O | 8487:11462 모든 변형, itemBox: 12 |  |
| `contextMenu-menuItem-space-paddingY` | `--context-menu-menu-item-space-padding-y` | 컨텍스트 메뉴 항목의 위아래 안쪽 여백(8px)으로, 메뉴 항목에만 쓰며, 좌우 여백은 contextMenu-menuItem-space-paddingX(12px)를 쓴다. | 8px | space-8 | confirmed | O | 8487:11462 모든 변형, itemBox: 8 |  |
| `contextMenu-menuItem-space-gap` | `--context-menu-menu-item-space-gap` | 컨텍스트 메뉴 항목 안 라벨과 설명 사이 간격(2px)으로, 메뉴 항목 안에만 쓰며, 항목 사이는 contextMenu-space-gap을 쓴다. | 2px | space-2 | confirmed | O | 8487:11462 모든 변형, itemBox: 2 |  |
| `contextMenu-menuItem-radius` | `--context-menu-menu-item-radius` | 컨텍스트 메뉴 항목의 모서리(6px, 메뉴 상자 모서리와 같음)로, 메뉴 항목의 바탕(hover·pressed)에만 쓴다. | 6px | radius-small → radius-6 | confirmed | O | 8487:11462 모든 변형, itemBox: 6 |  |
| `contextMenu-menuItem-focusRing-radius` | `--context-menu-menu-item-focus-ring-radius` | 컨텍스트 메뉴 항목 키보드 포커스 링의 모서리(8px, 항목 모서리 6 + 2)로, 메뉴 항목의 :focus-visible 링에만 쓰며, 규칙 도출값이라 Semantic 없이 Primitive를 직접 참조한다. | 8px | radius-8 | confirmed | O | 8487:11462 모든 변형(showFocus), _FocusRing: 8 |  |
| `contextMenu-subLabel-color-fg-default` | `--context-menu-sub-label-color-fg-default` | 컨텍스트 메뉴 항목 설명(라벨 아래 둘째 줄)의 기본 상태 글자 색으로, 항목 설명에만 쓰며, 항목 라벨은 contextMenu-menuItem-color-fg-*를 쓴다. | #697582 | color-fg-neutral-muted-default → color-gray-600 | confirmed | O | 8487:11462 state=default, description: #697582 |  |
| `contextMenu-subLabel-color-fg-hover` | `--context-menu-sub-label-color-fg-hover` | 컨텍스트 메뉴 항목 설명의 hover 상태 글자 색으로, 항목 설명에만 쓰며, 기본 상태와 같은 색(gray 600)이다. | #697582 | color-fg-neutral-muted-default → color-gray-600 | confirmed | O | 8487:11462 state=hover, description: #697582 |  |
| `contextMenu-subLabel-color-fg-pressed` | `--context-menu-sub-label-color-fg-pressed` | 컨텍스트 메뉴 항목 설명의 pressed 상태 글자 색으로, 항목 설명에만 쓰며, 기본 상태와 같은 색(gray 600)이다. | #697582 | color-fg-neutral-muted-default → color-gray-600 | confirmed | O | 8487:11462 state=pressed, description: #697582 |  |
| `contextMenu-subLabel-color-fg-disabled` | `--context-menu-sub-label-color-fg-disabled` | 컨텍스트 메뉴 항목 설명의 비활성 글자 색으로, 비활성 항목 설명에만 쓴다. | #B3B9C0 | color-fg-neutral-disabled → color-gray-400 | confirmed | O | 8487:11462 state=disabled, description: #B3B9C0 |  |

## 참고

- **source**: 피그마 ❖ ContextMenu Components 섹션(8487:11458) ContextMenu(8487:11530)·_Item/ContextMenu/MenuItem(8487:11462) 적용값
- **focusRingRadius**: 항목 링 모서리는 항목 모서리 6 + 2 = 8이다. 링 색·두께는 다른 컴포넌트와 같이 focusRing/color/border·focusRing/borderWidth에 연결한다
