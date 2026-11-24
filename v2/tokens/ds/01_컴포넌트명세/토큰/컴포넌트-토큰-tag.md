# 컴포넌트 토큰: tag

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| tag-basic | 3085:30771 |
| tag-keyword | 3085:30771 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `tag-basic-label` | 기본 태그 라벨 | `font-label-12-600` | `label/12/600` | 12px/16px 600 -0.2px | 3085:30771 type=basic (모든 tone), label: text style label/12/600 |
| `tag-keyword-label` | 키워드 태그 라벨 | `font-label-12-600` | `label/12/600` | 12px/16px 600 -0.2px | 3085:30771 type=keyword 모든 변형, label: text style label/12/600 |

## 토큰 (21개: confirmed 21)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `tag-basic-highlight-color-fg-default` | `--tag-basic-highlight-color-fg-default` | 기본 태그 브랜드 강조(highlight, 보라) 톤의 라벨 색(tBlue 700)으로, tone=highlight 기본 태그(tag-basic)에만 쓰며, 다른 톤은 tag-basic-[tone]-color-fg-default를 쓴다. | #2F15B2 | color-fg-brand-strongest-default → color-tBlue-700 | confirmed | O | 3085:30771 type=basic, tone=highlight, label: #2F15B2 |  |
| `tag-basic-info-color-fg-default` | `--tag-basic-info-color-fg-default` | 기본 태그 안내(info, 파랑) 톤의 라벨 색(blue 700)으로, tone=info 기본 태그(tag-basic)에만 쓰며, 다른 톤은 tag-basic-[tone]-color-fg-default를 쓴다. | #135BE0 | color-fg-info-strongest → color-blue-700 | confirmed | O | 3085:30771 type=basic, tone=info, label: #135BE0 |  |
| `tag-basic-success-color-fg-default` | `--tag-basic-success-color-fg-default` | 기본 태그 성공(success, 초록) 톤의 라벨 색(green 700)으로, tone=success 기본 태그(tag-basic)에만 쓰며, 다른 톤은 tag-basic-[tone]-color-fg-default를 쓴다. | #038E52 | color-fg-success-strongest → color-green-700 | confirmed | O | 3085:30771 type=basic, tone=success, label: #038E52 |  |
| `tag-basic-danger-color-fg-default` | `--tag-basic-danger-color-fg-default` | 기본 태그 위험(danger, 빨강) 톤의 라벨 색(red 600)으로, tone=danger 기본 태그(tag-basic)에만 쓰며, 다른 톤은 tag-basic-[tone]-color-fg-default를 쓴다. | #ED3B3E | color-fg-danger-strong → color-red-600 | confirmed | O | 3085:30771 type=basic, tone=danger, label: #ED3B3E |  |
| `tag-basic-neutral-color-fg-default` | `--tag-basic-neutral-color-fg-default` | 기본 태그 중립(neutral, 회색) 톤의 라벨 색(gray 700)으로, tone=neutral 기본 태그(tag-basic)에만 쓰며, 다른 톤은 tag-basic-[tone]-color-fg-default를 쓴다. | #454F59 | color-fg-neutral-strong-default → color-gray-700 | confirmed | O | 3085:30771 type=basic, tone=neutral, label: #454F59 |  |
| `tag-basic-color-bg-default` | `--tag-basic-color-bg-default` | 기본 태그(tag-basic)의 바탕 색(gray 100)으로, 모든 톤에 같게 쓰며, 톤 색은 라벨에만 쓴다. | #E8ECEF | color-bg-neutral-strong → color-gray-100 | confirmed | O | 3085:30771 type=basic (모든 tone): #E8ECEF |  |
| `tag-basic-size-height` | `--tag-basic-size-height` | 기본 태그의 높이(22px, 고정)로, tag-basic에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 22px | size-22 | confirmed | O | 3085:30771 type=basic (모든 tone): 22 |  |
| `tag-basic-space-paddingX` | `--tag-basic-space-padding-x` | 기본 태그의 좌우 안쪽 여백(8px)으로, tag-basic에만 쓴다. | 8px | space-8 | confirmed | O | 3085:30771 type=basic (모든 tone): 8 |  |
| `tag-basic-radius` | `--tag-basic-radius` | 기본 태그의 모서리(알약형)로, tag-basic에만 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 3085:30771 type=basic (모든 tone): 9999 |  |
| `tag-keyword-highlight-color-fg-default` | `--tag-keyword-highlight-color-fg-default` | 키워드 태그 highlight 톤(브랜드 강조색 보라, tBlue 600)의 라벨 색으로, tone=highlight 태그에만 쓰며, 다른 톤은 tag-keyword-[tone]-color-fg-default를 쓴다. | #3617CE | color-tBlue-600 | confirmed | O | 3085:30771 type=keyword, tone=highlight (filled·outlined), label: #3617CE |  |
| `tag-keyword-info-color-fg-default` | `--tag-keyword-info-color-fg-default` | 키워드 태그 info 톤(파랑, blue 600)의 라벨 색으로, tone=info 태그에만 쓰며, 다른 톤은 tag-keyword-[tone]-color-fg-default를 쓴다. | #2E7AFF | color-blue-600 | confirmed | O | 3085:30771 type=keyword, tone=info (filled·outlined), label: #2E7AFF |  |
| `tag-keyword-success-color-fg-default` | `--tag-keyword-success-color-fg-default` | 키워드 태그 success 톤(초록, green 700)의 라벨 색으로, tone=success 태그에만 쓰며, 다른 톤은 tag-keyword-[tone]-color-fg-default를 쓴다. | #038E52 | color-green-700 | confirmed | O | 3085:30771 type=keyword, tone=success (filled·outlined), label: #038E52 |  |
| `tag-keyword-danger-color-fg-default` | `--tag-keyword-danger-color-fg-default` | 키워드 태그 danger 톤(빨강, red 600)의 라벨 색으로, tone=danger 태그에만 쓰며, 다른 톤은 tag-keyword-[tone]-color-fg-default를 쓴다. | #ED3B3E | color-red-600 | confirmed | O | 3085:30771 type=keyword, tone=danger (filled·outlined), label: #ED3B3E |  |
| `tag-keyword-neutral-color-fg-default` | `--tag-keyword-neutral-color-fg-default` | 키워드 태그 neutral 톤(회색, gray 700)의 라벨 색으로, tone=neutral 태그에만 쓰며, 다른 톤은 tag-keyword-[tone]-color-fg-default를 쓴다. | #454F59 | color-gray-700 | confirmed | O | 3085:30771 type=keyword, tone=neutral (filled·outlined), label: #454F59 |  |
| `tag-keyword-filled-color-bg-default` | `--tag-keyword-filled-color-bg-default` | 흰 바탕 키워드 태그(filled)의 바탕 색으로, 색 있는 바탕 위에서도 태그가 보여야 할 때 쓰며, 바탕을 비우는 모양은 tag-keyword-outlined-color-bg-default를 쓴다. | #FFFFFF | color-bg-base → color-white | confirmed | O | 3085:30771 type=keyword, appearance=filled (모든 tone): #FFFFFF |  |
| `tag-keyword-outlined-color-bg-default` | `--tag-keyword-outlined-color-bg-default` | 바탕 없는 키워드 태그(outlined)의 바탕 색(투명)으로, 놓인 화면 바탕을 그대로 보일 때 쓰며, 흰 바탕이 필요하면 tag-keyword-filled-color-bg-default를 쓴다. | #00000000 | color-bg-transparent → color-transparent | confirmed | O | 3085:30771 type=keyword, appearance=outlined (모든 tone, fill 없음): #00000000 |  |
| `tag-keyword-color-border-default` | `--tag-keyword-color-border-default` | 키워드 태그의 테두리 색(gray 200)으로, 모든 톤과 filled·outlined에 같게 쓰며, 톤 색을 테두리에 쓰지 않는다. | #DCE0E5 | color-border-neutral-muted → color-gray-200 | confirmed | O | 3085:30771 type=keyword, 모든 변형: #DCE0E5 |  |
| `tag-keyword-size-height` | `--tag-keyword-size-height` | 키워드 태그의 높이(28px, 고정)로, tag-keyword에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 28px | size-28 | confirmed | O | 규칙: 4-3 우연 일치 |  |
| `tag-keyword-space-paddingX` | `--tag-keyword-space-padding-x` | 키워드 태그의 좌우 안쪽 여백(10px)으로, tag-keyword에만 쓴다. | 10px | space-10 | confirmed | O | 3085:30771 type=keyword, 모든 변형: 10 |  |
| `tag-keyword-radius` | `--tag-keyword-radius` | 키워드 태그의 모서리(알약형)로, tag-keyword에만 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 규칙: 6-4 |  |
| `tag-keyword-borderWidth` | `--tag-keyword-border-width` | 키워드 태그의 테두리 두께(1px)로, filled·outlined 모두에 쓴다. | 1px | borderWidth-thin → borderWidth-1 | confirmed | O | 3085:30771 type=keyword, 모든 변형 (INSIDE): 1 |  |

## 참고

- **group**: tag 그룹은 tag-basic(기본 태그)·tag-keyword(키워드 태그)다. 그룹 공통 토큰은 없다
- **source**: 피그마 ❖ Tag 페이지 Tag 3085:30771(15변형: type=basic × tone 5(appearance filled만), type=keyword × appearance filled·outlined × tone 5)
- **tone**: tone = 피그마 tone highlight·info·success·danger·neutral(보라 tBlue 600·파랑 blue 600·초록 green 700·빨강 red 600·회색 gray 700). 코드에서는 [data-tone="highlight"] 등. Badge와 같은 tone 값을 쓴다(피그마 11169:3, warning·attention은 필요할 때 추가)
- **figmaProps**: 피그마 속성은 appearance(filled·outlined)와 tone이다. appearance는 배경 유무라 Badge의 emphasis와 다른 축이어서 이름을 맞추지 않는다. type(basic·keyword) 속성이 생겼고 basic은 appearance=filled만 있다
- **basic**: Tag type=basic은 높이 24·좌우 여백 8·알약형 모서리·바탕 gray 100·테두리 없음이고 라벨은 label/12/600이다. 라벨 색은 배지 basic 글자와 같은 값이라 같은 Semantic(color-fg-brand-strongest-default 등)을 쓰고, 바탕은 color-bg-neutral-strong을 쓴다. keyword와 tone 색이 다른 것은 highlight(tBlue 700 vs 600)·info(blue 700 vs 600)뿐이다
