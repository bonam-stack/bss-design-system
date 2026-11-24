# 컴포넌트 토큰: fieldLabel

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| fieldLabel | 9944:178 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `fieldLabel` | 항목명 글자 | `font-label-14-500` | `label/14/500` | 14px/20px 500 -0.2px | 9944:178 모든 변형, label: text style label/14/500 |

## 토큰 (5개: confirmed 5)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `fieldLabel-color-fg-default` | `--field-label-color-fg-default` | 필드 위 항목명 글자의 기본 색(gray 900)으로, 피그마 Label emphasis=strong에 쓰며, 회색 항목명(emphasis=subtle)은 fieldLabel-subtle-color-fg-default, 필수 표시 별표는 fieldLabel-icon-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 9944:178 emphasis=strong, label: #1C1F23 | LBL-04 |
| `fieldLabel-subtle-color-fg-default` | `--field-label-subtle-color-fg-default` | 회색 항목명 글자 색(gray 600)으로, 피그마 Label emphasis=subtle([data-emphasis=subtle])에만 쓰며, 기본 항목명은 fieldLabel-color-fg-default를 쓴다. 필수 표시 별표 색은 바뀌지 않는다. | #697582 | color-fg-neutral-muted-default → color-gray-600 | confirmed | O | 9944:178 emphasis=subtle, label: #697582 | LBL-04 |
| `fieldLabel-icon-color-fg-default` | `--field-label-icon-color-fg-default` | 항목명 뒤 필수 표시 별표 아이콘 색(red 600)으로, showRequired일 때 별표에만 쓰며, 두 emphasis 모두 같다. 오류 도움말(helperText-color-fg-error)과 같은 Semantic을 쓴다. 항목명 글자는 fieldLabel-color-fg-default를 쓴다. | #ED3B3E | color-fg-danger-strong → color-red-600 | confirmed | O | 9944:178 emphasis=strong, requiredMark/Icon/Line/Asterisk: #ED3B3E<br>9944:178 emphasis=subtle, requiredMark/Icon/Line/Asterisk: #ED3B3E | LBL-01, LBL-02, LBL-03 |
| `fieldLabel-icon-size` | `--field-label-icon-size` | 항목명 뒤 필수 표시 별표 아이콘의 크기(12px)로, fieldLabel 별표에만 쓴다. | 12px | size-icon-xsmall → size-12 | confirmed | O | 9944:178 모든 변형, requiredMark/IconSlot: 12 | LBL-02 |
| `fieldLabel-space-gap` | `--field-label-space-gap` | 항목명 글자와 필수 표시 별표 사이 간격(2px)으로, fieldLabel에만 쓴다. | 2px | space-2 | confirmed | O | 9944:178 모든 변형, 루트 itemSpacing: 2 |  |

## 참고

- **source**: 피그마 ❖ Label(9944:57) Components 세트 Label(9944:178) 적용값
- **naming**: label은 부품 단어·글자 분류 단어라 컴포넌트 이름으로 쓸 수 없어 fieldLabel로 둔다. 별표는 기존 부품 단어 icon을 쓴다
- **variants**: 피그마 emphasis=strong은 기본이라 변형 구간을 비우고, emphasis=subtle은 변형 subtle(badge-counter와 같은 단어, [data-emphasis="subtle"])로 둔다. 바뀌는 것은 항목명 글자 색뿐이다
- **requiredMark**: 별표 자리(requiredMark, 12×20)는 아이콘 크기와 줄 높이로 정해져 토큰을 두지 않는다
- **requiredColor**: 필수 별표 색은 오류 도움말(helperText 글자·아이콘)과 같은 color-fg-danger-strong(red 600)을 쓴다. 표 머리 칸 필수 표시도 같은 별표(table-formHeader-icon-*, 같은 Semantic)를 쓴다
