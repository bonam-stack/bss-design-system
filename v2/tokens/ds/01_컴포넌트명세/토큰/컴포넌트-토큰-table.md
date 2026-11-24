# 컴포넌트 토큰: table

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| table-gridHeader | 9264:9962 |
| table-formHeader | 5088:6298 |
| table-gridCell | 9264:10041 |
| table-gridCell (칸 글자 Item/GridCell/Text) | 9264:10031 |
| table-formCell | 5220:1324 |
| table-formCell (칸 글자 Item/TableCell/Text) | 5088:6327 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `table-cell` | 표 칸 글자 | `font-label-14-400` | `label/14/400` | 14px/20px 400 -0.2px | 9264:10041 칸 안 Item/GridCell/Text(9264:10031): text style label/14/400<br>5220:1324 칸 안 Item/TableCell/Text(5088:6327): text style label/14/400 |
| `table-gridHeader-label` | 그리드 머리 칸 제목 | `font-label-14-600` | `label/14/600` | 14px/20px 600 -0.2px | 9264:9962 content=text, label: text style label/14/600 |
| `table-formHeader-subLabel` | 표 머리 칸 둘째 줄 보조 글자 | `font-label-13-400` | `label/13/400` | 13px/20px 400 -0.2px | 5088:6298 secondLabel: text style label/13/400 |
| `table-formHeader-label` | 표 머리 칸 제목 | `font-label-14-500` | `label/14/500` | 14px/20px 500 -0.2px | 5088:6298 label: text style label/14/500 |

## 토큰 (37개: confirmed 37)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `table-cell-color-bg-default` | `--table-cell-color-bg-default` | 표 칸(table-gridCell·table-formCell)의 기본 상태 바탕 색으로, 표 본문 칸에만 쓰며, 선택·강조 칸은 table-selected-cell-·table-attention-cell-color-bg-default를 쓴다(조합은 비활성, 오류, 선택, 강조, hover, 기본 순으로 앞의 것을 쓴다). | #FFFFFF | color-bg-base → color-white | confirmed | O | 9264:10041 variants=none, state=default, invalid=false: #FFFFFF<br>5220:1324 상태 없음(기본): #FFFFFF |  |
| `table-cell-color-bg-hover` | `--table-cell-color-bg-hover` | 표 칸(table-gridCell·table-formCell)의 hover 상태 바탕 색으로, 표 본문 칸에만 쓰며, 선택·강조 칸은 table-selected-cell-·table-attention-cell-color-bg-default를 쓴다(조합은 비활성, 오류, 선택, 강조, hover, 기본 순으로 앞의 것을 쓴다). | #F8F9FB | color-bg-neutral-faint → color-gray-50 | confirmed | O | 9264:10041 variants=none, state=hover, invalid=false: #F8F9FB |  |
| `table-cell-color-bg-error` | `--table-cell-color-bg-error` | 표 칸(table-gridCell·table-formCell)의 오류 상태(invalid=true) 바탕 색으로, 표 본문 칸에만 쓰며, 선택·강조 칸은 table-selected-cell-·table-attention-cell-color-bg-default를 쓴다(조합은 비활성, 오류, 선택, 강조, hover, 기본 순으로 앞의 것을 쓴다). | #FFE9E9 | color-bg-danger-faint → color-red-50 | confirmed | O | 9264:10041 invalid=true, state=default·hover·selected (모든 variants): #FFE9E9 |  |
| `table-cell-color-bg-disabled` | `--table-cell-color-bg-disabled` | 표 칸(table-gridCell·table-formCell)의 비활성 상태 바탕 색으로, 표 본문 칸에만 쓰며, 선택·강조 칸은 table-selected-cell-·table-attention-cell-color-bg-default를 쓴다(조합은 비활성, 오류, 선택, 강조, hover, 기본 순으로 앞의 것을 쓴다). | #E8ECEF | color-bg-neutral-disabled → color-gray-100 | confirmed | O | 9264:10041 state=disabled (모든 variants·invalid): #E8ECEF |  |
| `table-cell-color-fg-default` | `--table-cell-color-fg-default` | 표 칸 안 글자와 목록 점의 색으로, 표 본문 칸의 글자 부품(Item/GridCell/Text·Item/TableCell/Text)에 쓰며, 머리 칸 글자는 table-header-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 9264:10041 칸 안 Item/GridCell/Text(9264:10031) type=plain·bullet: #1C1F23<br>5220:1324 칸 안 Item/TableCell/Text(5088:6327) type=bullet: #1C1F23 |  |
| `table-bullet-color-bg-default` | `--table-bullet-color-bg-default` | 표 칸 글자 앞 글머리 점(type=bullet)의 채움 색으로, 글머리 점에만 쓰며, 칸 글자 색은 table-cell-color-fg-default, 표 머리 필수 표시 별표는 table-formHeader-icon-color-fg-default를 쓴다. | #1C1F23 | color-bg-neutral-strongest-default → color-gray-900 | confirmed | O | 9264:10031 type=bullet, ellipse: #1C1F23<br>5088:6327 type=bullet, ellipse: #1C1F23 |  |
| `table-bullet-size` | `--table-bullet-size` | 표 칸 글머리 점의 너비·높이(3px)로, 글머리 점에만 쓰며, 상태를 알리는 점 크기에는 size-dot-*을 쓴다. | 3px | size-bullet-small → size-3 | confirmed | O | 9264:10031 type=bullet, ellipse: 3<br>5088:6327 type=bullet, ellipse: 3 |  |
| `table-bullet-radius` | `--table-bullet-radius` | 표 칸 글머리 점을 동그랗게 만드는 모서리로, 글머리 점에만 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 9264:10031 type=bullet, ellipse: 9999<br>5088:6327 type=bullet, ellipse: 9999 |  |
| `table-bullet-space-gap` | `--table-bullet-space-gap` | 표·그리드 셀 글머리 목록(type=bullet)에서 점과 글자 사이 가로 간격(4px)으로, 셀 글머리 목록에만 쓴다. | 4px | space-4 | confirmed | O | 5088:6327 Item/TableCell/Text·Item/GridCell/Text type=bullet 가로 간격(dot–text): 4 |  |
| `table-selected-cell-color-bg-default` | `--table-selected-cell-color-bg-default` | 선택된 표 칸(행 선택 등)의 바탕 색(옅은 브랜드)으로, [aria-selected=true] 칸에만 쓰며, 조합은 비활성, 오류, 선택, 강조, hover, 기본 순으로 앞의 것을 쓰므로 선택된 칸은 hover여도 이 값을 쓴다. | #F1F2FF | color-bg-brand-faint-default → color-tBlue-50 | confirmed | O | 9264:10041 state=selected, invalid=false (모든 variants): #F1F2FF |  |
| `table-attention-cell-color-bg-default` | `--table-attention-cell-color-bg-default` | 강조(attention) 표 칸의 바탕 색(옅은 노랑)으로, 강조(피그마 importance=attention) 칸의 기본·hover에 쓰며, 오류 칸은 table-cell-color-bg-error를 쓴다. | #FFF7DC | color-bg-attention-faint → color-yellow-50 | confirmed | O | 9264:10041 importance=attention, state=default·hover, invalid=false: #FFF7DC |  |
| `table-header-color-fg-default` | `--table-header-color-fg-default` | 표 머리 칸(table-gridHeader·table-formHeader)의 제목 글자 색으로, 머리 칸 제목에만 쓰며, table-formHeader 둘째 줄 글자는 table-formHeader-subLabel-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 9264:9962 content=text, label: #1C1F23<br>5088:6298 label: #1C1F23 |  |
| `table-borderWidth` | `--table-border-width` | 표 머리 칸·본문 칸 테두리와 구분선 두께(1px)로, 표의 모든 칸에 쓴다. | 1px | borderWidth-thin → borderWidth-1 | confirmed | O | 9264:9962 모든 변형: 1<br>5088:6298 전체: 1<br>9264:10041 모든 변형: 1<br>5220:1324 모든 변형: 1 |  |
| `table-gridHeader-color-bg-default` | `--table-grid-header-color-bg-default` | 그리드 머리 칸의 바탕 색(gray 80)으로, table-gridHeader에만 쓰며, 표(table-formHeader) 머리 칸은 더 옅은 table-formHeader-color-bg-default를 쓴다. | #F1F3F5 | color-bg-neutral-muted → color-gray-80 | confirmed | O | 9264:9962 모든 변형: #F1F3F5 |  |
| `table-gridHeader-color-border-default` | `--table-grid-header-color-border-default` | 그리드 머리 칸 위·아래 테두리 색(gray 300)으로, table-gridHeader에만 쓰며, 그리드 칸 구분선은 table-gridCell-color-border-default를 쓴다. | #C4C9CF | color-border-neutral-strong → color-gray-300 | confirmed | O | 9264:9962 모든 변형, 위·아래 테두리: #C4C9CF |  |
| `table-gridHeader-size-minHeight` | `--table-grid-header-size-min-height` | 그리드 머리 칸(table-gridHeader)의 최소 높이(40px, 내용이 많으면 늘어남)로, table-gridHeader에만 쓴다. | 40px | size-40 | confirmed | O | 9264:9962 모든 변형, minHeight: 40 |  |
| `table-gridHeader-space-paddingX` | `--table-grid-header-space-padding-x` | 그리드 머리 칸(table-gridHeader)의 좌우 안쪽 여백(12px)으로, table-gridHeader에 쓰며, showLeadingSpace·showTrailingSpace를 켜면 같은 값만큼 빈 칸이 더 붙는다. | 12px | space-12 | confirmed | O | 9264:9962 모든 변형: 12 |  |
| `table-gridHeader-space-paddingY` | `--table-grid-header-space-padding-y` | 그리드 머리 칸(table-gridHeader)의 위아래 안쪽 여백(8px)으로, table-gridHeader에만 쓴다. | 8px | space-8 | confirmed | O | 9264:9962 모든 변형: 8 |  |
| `table-gridHeader-space-gap` | `--table-grid-header-space-gap` | 그리드 머리 칸 제목과 정렬 아이콘 버튼 사이 간격(4px)으로, table-gridHeader에만 쓴다. | 4px | space-4 | confirmed | O | 9264:9962 content=text, labelRow: 4 |  |
| `table-formHeader-color-bg-default` | `--table-form-header-color-bg-default` | 표 머리 칸의 바탕 색(gray 50)으로, table-formHeader에만 쓰며, 그리드 머리 칸은 table-gridHeader-color-bg-default를 쓴다. | #F8F9FB | color-bg-neutral-faint → color-gray-50 | confirmed | O | 5088:6298 전체: #F8F9FB |  |
| `table-formHeader-color-border-default` | `--table-form-header-color-border-default` | 표 머리 칸 오른쪽·아래 테두리 색(gray 100)으로, table-formHeader에만 쓴다. | #E8ECEF | color-border-neutral-faint → color-gray-100 | confirmed | O | 5088:6298 전체, 오른쪽·아래 테두리: #E8ECEF |  |
| `table-formHeader-subLabel-color-fg-default` | `--table-form-header-sub-label-color-fg-default` | 표 머리 칸 둘째 줄 보조 글자(단위·부연 설명) 색으로, table-formHeader 둘째 줄에만 쓰며, 첫째 줄 제목은 table-header-color-fg-default를 쓴다. | #454F59 | color-fg-neutral-strong-default → color-gray-700 | confirmed | O | 5088:6298 secondLabel: #454F59 |  |
| `table-formHeader-icon-color-fg-default` | `--table-form-header-icon-color-fg-default` | 표 머리 칸 필수 표시 별표 아이콘 색(red 600)으로, showRequired일 때 별표에만 쓰며, 항목명 별표(fieldLabel-icon-color-fg-default)·오류 도움말과 같은 Semantic을 쓴다. 머리 칸 제목 글자는 table-header-color-fg-default를 쓴다. | #ED3B3E | color-fg-danger-strong → color-red-600 | confirmed | O | 5088:6298 TableHeader requiredMark IconSlot/Icon/Line/Asterisk: #ED3B3E |  |
| `table-formHeader-icon-size` | `--table-form-header-icon-size` | 표 머리 칸 필수 표시 별표 아이콘의 크기(12px)로, table-formHeader 별표에만 쓴다. | 12px | size-icon-xsmall → size-12 | confirmed | O | 5088:6298 TableHeader requiredMark IconSlot 11937:1622: 12 |  |
| `table-formHeader-icon-space-gap` | `--table-form-header-icon-space-gap` | 표 머리 칸(table-formHeader)에서 제목 묶음(글자·필수 표시)과 정보 아이콘 버튼 사이 가로 간격(4px)으로, 정보 버튼을 켠(showInfo) 표 머리 칸에만 쓰며 글자와 필수 표시 사이는 table-formHeader-space-gap을 쓴다. | 4px | space-4 | confirmed | O | 5088:6298 labelRow 가로 간격(labelBox–정보 Button): 4 |  |
| `table-formHeader-size-minHeight` | `--table-form-header-size-min-height` | 표 머리 칸(table-formHeader)의 최소 높이(56px, 둘째 줄이 있으면 늘어남)로, table-formHeader에만 쓴다. | 56px | size-56 | confirmed | O | 5088:6298 전체, minHeight: 56 |  |
| `table-formHeader-space-paddingX` | `--table-form-header-space-padding-x` | 표 머리 칸(table-formHeader)의 좌우 안쪽 여백(12px)으로, table-formHeader에만 쓴다. | 12px | space-12 | confirmed | O | 5088:6298 전체: 12 |  |
| `table-formHeader-space-paddingY` | `--table-form-header-space-padding-y` | 표 머리 칸(table-formHeader)의 위아래 안쪽 여백(12px)으로, table-formHeader에만 쓴다. | 12px | space-12 | confirmed | O | 5088:6298 전체: 12 |  |
| `table-formHeader-space-gap` | `--table-form-header-space-gap` | 표 머리 칸 글자와 필수 표시 별표 사이 간격(2px)으로, table-formHeader에만 쓴다. | 2px | space-2 | confirmed | O | 5088:6298 labelRow·secondLabelRow: 2 |  |
| `table-gridCell-size-minHeight` | `--table-grid-cell-size-min-height` | 그리드 칸(table-gridCell)의 최소 높이(40px, 내용이 많으면 늘어남)로, table-gridCell에만 쓴다. | 40px | size-40 | confirmed | O | 9264:10041 모든 변형, minHeight: 40 |  |
| `table-gridCell-color-border-default` | `--table-grid-cell-color-border-default` | 그리드 칸(table-gridCell) 아래 구분선 색(gray 200, 모든 상태 같음)으로, table-gridCell에만 쓰며, 입력·조회 표 칸(table-formCell) 선은 table-formCell-color-border-default를 쓴다. | #DCE0E5 | color-border-neutral-muted → color-gray-200 | confirmed | O | 9264:10041 모든 상태, 아래 테두리: #DCE0E5 |  |
| `table-gridCell-space-paddingX` | `--table-grid-cell-space-padding-x` | 그리드 칸(table-gridCell)의 좌우 안쪽 여백(12px)으로, table-gridCell에 쓰며, showLeadingSpace·showTrailingSpace를 켜면 같은 값만큼 빈 칸이 더 붙는다. | 12px | space-12 | confirmed | O | 9264:10041 모든 변형: 12 |  |
| `table-gridCell-space-paddingY` | `--table-grid-cell-space-padding-y` | 그리드 칸(table-gridCell)의 위아래 안쪽 여백(4px)으로, table-gridCell에만 쓴다. | 4px | space-4 | confirmed | O | 9264:10041 모든 변형: 4 |  |
| `table-formCell-color-border-default` | `--table-form-cell-color-border-default` | 입력·조회 표 칸(table-formCell) 아래 구분선 색(gray 100)으로, table-formCell에만 쓰며, 그리드 칸 선은 table-gridCell-color-border-default, 머리 칸 선은 table-gridHeader·table-formHeader 토큰을 쓴다. | #E8ECEF | color-border-neutral-faint → color-gray-100 | confirmed | O | 5220:1324 아래 테두리: #E8ECEF |  |
| `table-formCell-size-minHeight` | `--table-form-cell-size-min-height` | 표 칸(table-formCell)의 최소 높이(56px, 내용이 많으면 늘어남)로, table-formCell에만 쓴다. | 56px | size-56 | confirmed | O | 5220:1324 모든 변형, minHeight: 56 |  |
| `table-formCell-space-paddingX` | `--table-form-cell-space-padding-x` | 표 칸(table-formCell)의 좌우 안쪽 여백(12px)으로, table-formCell에만 쓴다. | 12px | space-12 | confirmed | O | 5220:1324 모든 변형: 12 |  |
| `table-formCell-space-paddingY` | `--table-form-cell-space-padding-y` | 표 칸(table-formCell)의 위아래 안쪽 여백(12px)으로, table-formCell에만 쓴다. | 12px | space-12 | confirmed | O | 5220:1324 모든 변형: 12 |  |

## 참고

- **source**: 피그마 ❖ Table 페이지 Components 세트. 작업용 테이블 페이지(3792:1218)는 근거에서 뺐다
- **states**: 피그마 GridCell은 state(default·hover·selected·disabled) × invalid(false·true) × importance(none·attention)이다(field와 같은 축). invalid=true는 error 상태, selected·attention은 변형으로 본다(figmaStateMap)
- **tableCell**: table-formCell은 상태 변형이 없어 table-cell-color-bg-default·fg와 자기 선 색 table-formCell-color-border-default만 쓴다
- **focusRing**: 칸 자체는 포커스를 받지 않는다(안의 버튼·체크박스·입력이 받는다)
- **nested**: 머리 칸 정렬 아이콘 버튼은 Button(type=icon, plain, small), 체크박스는 Checkbox(medium) 토큰을 쓴다
- **listDot**: 목록 점 치수는 토큰 없이 구현값으로 둔다: 점 3×3, 점 자리 8, 간격 4
- **requiredMark**: 필수 표시는 Label(fieldLabel)과 같은 별표 아이콘(IconSlot 12 + Asterisk, red 600)이다. table-formHeader-icon-color-fg-default·icon-size를 쓰며, fieldLabel 별표와 같은 Semantic(color-fg-danger-strong, size-icon-xsmall)을 써 함께 바뀐다
