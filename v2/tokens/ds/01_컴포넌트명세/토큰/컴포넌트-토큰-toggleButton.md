# 컴포넌트 토큰: toggleButton

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| toggleButton | 9080:257 |

## 토큰 (26개: confirmed 26)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `toggleButton-icon-size` | `--toggle-button-icon-size` | 툴바 토글 버튼 아이콘의 크기(16px)로, 툴바 토글 버튼 아이콘에만 쓴다. | 16px | size-icon-medium → size-16 | confirmed | O | 9080:257 _Item/Toolbar/ToggleButton IconSlot: 16 |  |
| `toggleButton-size` | `--toggle-button-size` | 툴바 토글 버튼의 너비·높이(36px, 정사각형)로, 툴바 토글 버튼에만 쓴다. | 36px | size-control-medium → size-36 | confirmed | O | 9080:257 _Item/Toolbar/ToggleButton 모든 상태: 36 |  |
| `toggleButton-radius` | `--toggle-button-radius` | 툴바 토글 버튼의 모서리(6px)로, 툴바 토글 버튼에만 쓴다. | 6px | radius-small → radius-6 | confirmed | O | 9080:257 _Item/Toolbar/ToggleButton 모든 상태: 6 |  |
| `toggleButton-borderWidth` | `--toggle-button-border-width` | 툴바 토글 버튼의 테두리 두께(1px, 안쪽)로, 툴바 토글 버튼에만 쓴다. | 1px | borderWidth-thin → borderWidth-1 | confirmed | O | 9080:257 _Item/Toolbar/ToggleButton stroke INSIDE: 1 |  |
| `toggleButton-focusRing-radius` | `--toggle-button-focus-ring-radius` | 툴바 토글 버튼 키보드 포커스 링의 모서리(8px, 버튼 모서리 6 + 2)로, :focus-visible 링에만 쓰고 요소 모서리가 바뀌면 함께 바꾸며, 규칙 도출값이라 Semantic 없이 Primitive를 직접 참조한다. | 8px | radius-8 | confirmed | O | 9080:257 _Item/Toolbar/ToggleButton _FocusRing: 8 |  |
| `toggleButton-color-bg-default` | `--toggle-button-color-bg-default` | 선택되지 않은 툴바 토글 버튼의 기본 상태 바탕 색으로, 툴바 토글 버튼에만 쓰며 선택된 버튼은 toggleButton-selected-*를 쓴다. | #00000000 | color-bg-transparent → color-transparent | confirmed | O | 9080:257 selection=unselected, state=default: #00000000 |  |
| `toggleButton-color-bg-hover` | `--toggle-button-color-bg-hover` | 선택되지 않은 툴바 토글 버튼의 hover 상태 바탕 색으로, 툴바 토글 버튼에만 쓰며 선택된 버튼은 toggleButton-selected-*를 쓴다. | #F8F9FB | color-bg-neutral-faint → color-gray-50 | confirmed | O | 9080:257 selection=unselected, state=hover: #F8F9FB |  |
| `toggleButton-color-bg-pressed` | `--toggle-button-color-bg-pressed` | 선택되지 않은 툴바 토글 버튼의 pressed 상태 바탕 색으로, 툴바 토글 버튼에만 쓰며 선택된 버튼은 toggleButton-selected-*를 쓴다. | #F1F3F5 | color-bg-neutral-muted → color-gray-80 | confirmed | O | 9080:257 selection=unselected, state=pressed: #F1F3F5 |  |
| `toggleButton-color-bg-disabled` | `--toggle-button-color-bg-disabled` | 선택되지 않은 툴바 토글 버튼의 비활성 상태 바탕 색으로, 툴바 토글 버튼에만 쓰며 선택된 버튼은 toggleButton-selected-*를 쓴다. | #00000000 | color-bg-transparent → color-transparent | confirmed | O | 9080:257 selection=unselected, state=disabled: #00000000 |  |
| `toggleButton-color-border-default` | `--toggle-button-color-border-default` | 선택되지 않은 툴바 토글 버튼의 테두리 색(gray 300)으로, 기본·hover·pressed·비활성 모든 상태에 같은 값을 쓰며(상태별 토큰 없음), 툴바 토글 버튼에만 쓰고, 선택된 버튼은 toggleButton-selected-*를 쓴다. | #C4C9CF | color-border-neutral-strong → color-gray-300 | confirmed | O | 9080:257 selection=unselected, 모든 상태: #C4C9CF |  |
| `toggleButton-color-fg-default` | `--toggle-button-color-fg-default` | 선택되지 않은 툴바 토글 버튼의 기본 상태 아이콘 색으로, 툴바 토글 버튼에만 쓰며 선택된 버튼은 toggleButton-selected-*를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 9080:257 selection=unselected, state=default: #1C1F23 | TGB-01 |
| `toggleButton-color-fg-hover` | `--toggle-button-color-fg-hover` | 선택되지 않은 툴바 토글 버튼의 hover 상태 아이콘 색으로, 툴바 토글 버튼에만 쓰며 선택된 버튼은 toggleButton-selected-*를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 9080:257 selection=unselected, state=hover: #1C1F23 |  |
| `toggleButton-color-fg-pressed` | `--toggle-button-color-fg-pressed` | 선택되지 않은 툴바 토글 버튼의 pressed 상태 아이콘 색으로, 툴바 토글 버튼에만 쓰며 선택된 버튼은 toggleButton-selected-*를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 9080:257 selection=unselected, state=pressed: #1C1F23 |  |
| `toggleButton-color-fg-disabled` | `--toggle-button-color-fg-disabled` | 선택되지 않은 툴바 토글 버튼의 비활성 상태 아이콘 색으로, 툴바 토글 버튼에만 쓰며 선택된 버튼은 toggleButton-selected-*를 쓴다. | #B3B9C0 | color-fg-neutral-disabled → color-gray-400 | confirmed | O | 9080:257 selection=unselected, state=disabled: #B3B9C0 |  |
| `toggleButton-selected-color-bg-default` | `--toggle-button-selected-color-bg-default` | 선택된 툴바 토글 버튼의 기본 상태 바탕 색으로, 툴바 토글 버튼에만 쓰며 선택되지 않은 버튼은 toggleButton-*를 쓴다. | #F1F2FF | color-bg-brand-faint-default → color-tBlue-50 | confirmed | O | 9080:257 selection=selected, state=default: #F1F2FF |  |
| `toggleButton-selected-color-bg-hover` | `--toggle-button-selected-color-bg-hover` | 선택된 툴바 토글 버튼의 hover 상태 바탕 색으로, 툴바 토글 버튼에만 쓰며 선택되지 않은 버튼은 toggleButton-*를 쓴다. | #E1E3FF | color-bg-brand-faint-hover → color-tBlue-80 | confirmed | O | 9080:257 selection=selected, state=hover: #E1E3FF |  |
| `toggleButton-selected-color-bg-pressed` | `--toggle-button-selected-color-bg-pressed` | 선택된 툴바 토글 버튼의 pressed 상태 바탕 색으로, 툴바 토글 버튼에만 쓰며 선택되지 않은 버튼은 toggleButton-*를 쓴다. | #D0D2FF | color-bg-brand-faint-pressed → color-tBlue-100 | confirmed | O | 9080:257 selection=selected, state=pressed: #D0D2FF |  |
| `toggleButton-selected-color-bg-disabled` | `--toggle-button-selected-color-bg-disabled` | 선택된 툴바 토글 버튼의 비활성 상태 바탕 색으로, 툴바 토글 버튼에만 쓰며 선택되지 않은 버튼은 toggleButton-*를 쓴다. | #F1F2FF | color-bg-brand-faint-default → color-tBlue-50 | confirmed | O | 9080:257 selection=selected, state=disabled: #F1F2FF |  |
| `toggleButton-selected-color-border-default` | `--toggle-button-selected-color-border-default` | 선택된 툴바 토글 버튼의 기본 상태 테두리 색으로, 툴바 토글 버튼에만 쓰며 선택되지 않은 버튼은 toggleButton-*를 쓴다. | #3617CE | color-border-brand-strong-default → color-tBlue-600 | confirmed | O | 9080:257 selection=selected, state=default: #3617CE |  |
| `toggleButton-selected-color-border-hover` | `--toggle-button-selected-color-border-hover` | 선택된 툴바 토글 버튼의 hover 상태 테두리 색으로, 툴바 토글 버튼에만 쓰며 선택되지 않은 버튼은 toggleButton-*를 쓴다. | #3617CE | color-border-brand-strong-default → color-tBlue-600 | confirmed | O | 9080:257 selection=selected, state=hover: #3617CE |  |
| `toggleButton-selected-color-border-pressed` | `--toggle-button-selected-color-border-pressed` | 선택된 툴바 토글 버튼의 pressed 상태 테두리 색으로, 툴바 토글 버튼에만 쓰며 선택되지 않은 버튼은 toggleButton-*를 쓴다. | #3617CE | color-border-brand-strong-default → color-tBlue-600 | confirmed | O | 9080:257 selection=selected, state=pressed: #3617CE |  |
| `toggleButton-selected-color-border-disabled` | `--toggle-button-selected-color-border-disabled` | 선택된 툴바 토글 버튼의 비활성 상태 테두리 색으로, 툴바 토글 버튼에만 쓰며 선택되지 않은 버튼은 toggleButton-*를 쓴다. | #B4B7FF | color-border-brand-disabled → color-tBlue-200 | confirmed | O | 9080:257 selection=selected, state=disabled: #B4B7FF |  |
| `toggleButton-selected-color-fg-default` | `--toggle-button-selected-color-fg-default` | 선택된 툴바 토글 버튼의 기본 상태 아이콘 색으로, 툴바 토글 버튼에만 쓰며 선택되지 않은 버튼은 toggleButton-*를 쓴다. | #3617CE | color-fg-brand-strong-default → color-tBlue-600 | confirmed | O | 9080:257 selection=selected, state=default: #3617CE |  |
| `toggleButton-selected-color-fg-hover` | `--toggle-button-selected-color-fg-hover` | 선택된 툴바 토글 버튼의 hover 상태 아이콘 색으로, 툴바 토글 버튼에만 쓰며 선택되지 않은 버튼은 toggleButton-*를 쓴다. | #3617CE | color-fg-brand-strong-default → color-tBlue-600 | confirmed | O | 9080:257 selection=selected, state=hover: #3617CE |  |
| `toggleButton-selected-color-fg-pressed` | `--toggle-button-selected-color-fg-pressed` | 선택된 툴바 토글 버튼의 pressed 상태 아이콘 색으로, 툴바 토글 버튼에만 쓰며 선택되지 않은 버튼은 toggleButton-*를 쓴다. | #3617CE | color-fg-brand-strong-default → color-tBlue-600 | confirmed | O | 9080:257 selection=selected, state=pressed: #3617CE |  |
| `toggleButton-selected-color-fg-disabled` | `--toggle-button-selected-color-fg-disabled` | 선택된 툴바 토글 버튼의 비활성 상태 아이콘 색으로, 툴바 토글 버튼에만 쓰며 선택되지 않은 버튼은 toggleButton-*를 쓴다. | #6268FF | color-fg-brand-disabled → color-tBlue-400 | confirmed | O | 9080:257 selection=selected, state=disabled: #6268FF |  |

## 참고

- **source**: 피그마 ❖ Toolbar 페이지 _Item/Toolbar/ToggleButton(9080:257) 적용값
