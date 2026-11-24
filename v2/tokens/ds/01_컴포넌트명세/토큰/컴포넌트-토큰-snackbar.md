# 컴포넌트 토큰: snackbar

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| snackbar | 7436:389 |
| snackbar (처리 현황 항목 _Item/Snackbar/Status) | 8865:404 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `snackbar-title` | 스낵바 제목 | `font-label-14-700` | `label/14/700` | 14px/20px 700 -0.2px | 7436:389 title: text style label/14/700 |
| `snackbar-label` | 스낵바 처리 현황 라벨 | `font-label-13-500` | `label/13/500` | 13px/20px 500 -0.2px | 8865:404 모든 tone, label: text style label/13/500 |
| `snackbar-count` | 스낵바 처리 현황 건수 | `font-label-14-500` | `label/14/500` | 14px/20px 500 -0.2px | 8865:404 모든 tone, count: text style label/14/500 |

## 토큰 (23개: confirmed 23)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `snackbar-info-count-color-fg-default` | `--snackbar-info-count-color-fg-default` | 스낵바 처리 현황 info 건수 숫자 색으로, 피그마 tone=info 항목의 건수에만 쓰며, 라벨은 snackbar-label-color-fg-default를 쓴다. | #7FAEFF | color-fg-info-onInverse → color-blue-400 | confirmed | O | 8865:404 tone=info, count: #7FAEFF |  |
| `snackbar-success-count-color-fg-default` | `--snackbar-success-count-color-fg-default` | 스낵바 처리 현황 success 건수 숫자 색으로, 피그마 tone=success 항목의 건수에만 쓰며, 라벨은 snackbar-label-color-fg-default를 쓴다. | #3ACF91 | color-fg-success-onInverse → color-green-400 | confirmed | O | 8865:404 tone=success, count: #3ACF91 |  |
| `snackbar-danger-count-color-fg-default` | `--snackbar-danger-count-color-fg-default` | 스낵바 처리 현황 danger 건수 숫자 색으로, 피그마 tone=danger 항목의 건수에만 쓰며, 라벨은 snackbar-label-color-fg-default를 쓴다. | #F87275 | color-fg-danger-onInverse → color-red-400 | confirmed | O | 8865:404 tone=danger, count: #F87275 |  |
| `snackbar-color-bg-default` | `--snackbar-color-bg-default` | 스낵바 바탕 색(어두운 반투명, grayAlpha 90)으로, 스낵바에만 쓰며, 토스트 바탕은 toast-color-bg-default를 쓴다. | #03182EE6 | color-bg-inverse → color-grayAlpha-90 | confirmed | O | 7436:389 root: #03182EE6 |  |
| `snackbar-radius` | `--snackbar-radius` | 스낵바 상자의 모서리(12px)로, 스낵바에만 쓴다. | 12px | radius-large → radius-12 | confirmed | O | 7436:389 root: 12 |  |
| `snackbar-space-paddingX` | `--snackbar-space-padding-x` | 스낵바 상자의 좌우 안쪽 여백(20px)으로, 스낵바에만 쓴다. | 20px | space-20 | confirmed | O | 7436:389 root 좌우: 20 |  |
| `snackbar-space-paddingY` | `--snackbar-space-padding-y` | 스낵바 상자의 위아래 안쪽 여백(16px)으로, 스낵바에만 쓴다. | 16px | space-16 | confirmed | O | 7436:389 root 위아래: 16 |  |
| `snackbar-space-gap` | `--snackbar-space-gap` | 스낵바 내용(제목·처리 현황)과 액션 영역 사이 가로 간격(40px)으로, 스낵바 루트에만 쓴다. | 40px | space-40 | confirmed | O | 7436:389 root, contentGroup–actionGroup: 40 |  |
| `snackbar-title-color-fg-default` | `--snackbar-title-color-fg-default` | 스낵바 제목 색(흰색)으로, 제목에만 쓰며, 처리 현황 라벨은 snackbar-label-color-fg-default를 쓴다. | #FFFFFF | color-fg-onInverse → color-white | confirmed | O | 7436:389 title: #FFFFFF |  |
| `snackbar-content-space-gap` | `--snackbar-content-space-gap` | 스낵바 제목과 처리 현황 줄 사이 세로 간격(2px)으로, 내용 영역 안에만 쓴다. | 2px | space-2 | confirmed | O | 7436:389 contentGroup 세로 간격: 2 |  |
| `snackbar-group-space-gap` | `--snackbar-group-space-gap` | 스낵바 처리 현황 항목 사이와 구분 점 양옆 간격(8px)으로, 처리 현황 줄 안에만 쓴다. | 8px | space-8 | confirmed | O | 7436:389 statusContent 가로 간격: 8<br>8865:404 모든 tone, separator–content: 8 |  |
| `snackbar-separator-color-bg-default` | `--snackbar-separator-color-bg-default` | 스낵바 처리 현황 항목 앞 구분 점 채움 색(gray 400)으로, showSeparator가 켜진 항목에만 쓴다. | #B3B9C0 | color-bg-neutral-onInverse → color-gray-400 | confirmed | O | 8865:404 모든 tone, separator: #B3B9C0 |  |
| `snackbar-separator-size` | `--snackbar-separator-size` | 스낵바 처리 현황 구분 점의 너비·높이(3px)로, 구분 점에만 쓴다. | 3px | size-bullet-small → size-3 | confirmed | O | 8865:404 모든 tone, separator: 3 |  |
| `snackbar-separator-radius` | `--snackbar-separator-radius` | 스낵바 처리 현황 구분 점의 모서리(원형)로, 구분 점에만 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 8865:404 모든 tone, separator: 9999 |  |
| `snackbar-label-color-fg-default` | `--snackbar-label-color-fg-default` | 스낵바 처리 현황 라벨 색(gray 300)으로, 처리 현황 라벨에만 쓰며, 건수 숫자는 snackbar-[tone]-count-color-fg-default를 쓴다. | #C4C9CF | color-fg-neutral-onInverse → color-gray-300 | confirmed | O | 8865:404 모든 tone, label: #C4C9CF |  |
| `snackbar-label-space-gap` | `--snackbar-label-space-gap` | 스낵바 처리 현황 라벨과 건수 사이 간격(4px)으로, 처리 현황 항목 안에만 쓴다. | 4px | space-4 | confirmed | O | 8865:404 모든 tone, content 가로 간격: 4 |  |
| `snackbar-actionGroup-color-bg-default` | `--snackbar-action-group-color-bg-default` | 스낵바 액션 버튼(button-inline base)의 바탕 색(투명)으로, 어두운 스낵바 바탕 위 액션 버튼에만 쓰며, 글자는 snackbar-actionGroup-color-fg-default를 쓴다. | #00000000 | color-bg-transparent → color-transparent | confirmed | O | 7436:389 actionGroup, Button 바탕(button-base 흰색을 덮어씀): #00000000 |  |
| `snackbar-actionGroup-color-border-default` | `--snackbar-action-group-color-border-default` | 스낵바 액션 버튼(button-inline base)의 테두리 색(gray 400)으로, 어두운 스낵바 바탕 위 액션 버튼에만 쓰며, 바탕은 snackbar-actionGroup-color-bg-default, 글자는 snackbar-actionGroup-color-fg-default를 쓴다. | #B3B9C0 | color-border-neutral-stronger → color-gray-400 | confirmed | O | 7436:389 actionGroup, Button 테두리: #B3B9C0 |  |
| `snackbar-actionGroup-color-fg-default` | `--snackbar-action-group-color-fg-default` | 스낵바 액션 영역의 버튼 글자와 닫기 아이콘 색(흰색)으로, 액션 버튼(button-inline base)·닫기 버튼(button-iconOnly plain)의 글자·아이콘에만 쓰며, 액션 버튼 바탕·테두리는 snackbar-actionGroup-color-bg-default·snackbar-actionGroup-color-border-default·snackbar-actionGroup-borderWidth를, 높이·여백·모서리는 각 버튼 토큰을 쓴다. | #FFFFFF | color-fg-onInverse → color-white | confirmed | O | 7436:389 actionGroup, Button 글자·닫기 아이콘: #FFFFFF | SNB-01 |
| `snackbar-actionGroup-borderWidth` | `--snackbar-action-group-border-width` | 스낵바 액션 버튼(button-inline base)의 테두리 두께(1px)로, 어두운 스낵바 바탕 위 액션 버튼에만 쓰며, 테두리 색은 snackbar-actionGroup-color-border-default를 쓴다. | 1px | borderWidth-thin → borderWidth-1 | confirmed | O | 7436:389 actionGroup, Button 테두리 두께: 1 |  |
| `snackbar-actionGroup-space-gap` | `--snackbar-action-group-space-gap` | 스낵바 액션 버튼과 닫기 버튼 사이 간격(12px)으로, 액션 영역 안에만 쓴다. | 12px | space-12 | confirmed | O | 7436:389 actionGroup 가로 간격: 12 |  |
| `snackbar-closeButton-size` | `--snackbar-close-button-size` | 스낵바 닫기 버튼 틀(closeBox)의 크기(가로·세로 20px)로, 16px 닫기 아이콘을 가운데 두는 누르는 영역에 쓰며, 아이콘 크기는 button-iconOnly-medium-icon-size를 쓴다. | 20px | size-20 | confirmed | O | 7436:389 actionGroup, closeBox 너비·높이: 20 |  |
| `snackbar-effect-blur` | `--snackbar-effect-blur` | 스낵바 바탕 흐림 정도(20px, CSS backdrop-filter: blur)로, 스낵바 바탕 뒤 화면을 흐리게 하는 데만 쓴다. | 20px | effect-blur-inverse → effect-blur-20 | confirmed | O | 7436:389 root, background blur: 20 |  |

## 참고

- **source**: 피그마 ❖ Toast / Snackbar 페이지 Snackbar(7436:389)·_Item/Snackbar/Status(8865:404) 적용값
- **nested**: 액션 버튼은 button-inline(base, large) 토큰을 쓰되 바탕은 snackbar-actionGroup-color-bg-default(투명), 글자 색은 snackbar-actionGroup-color-fg-default로 바꾼다. 테두리는 색 snackbar-actionGroup-color-border-default(gray 400, button-base 테두리와 같은 Semantic), 두께 snackbar-actionGroup-borderWidth(1px)를 쓴다. 닫기 버튼은 닫기 버튼 틀(피그마 closeBox, snackbar-closeButton-size 20) 가운데에 button-iconOnly(plain, medium) 아이콘(16)을 두며 아이콘 색만 snackbar-actionGroup-color-fg-default를 쓴다. 첫 처리 현황 항목은 showSeparator를 끈다
