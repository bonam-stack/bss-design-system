# 컴포넌트 토큰: helperText

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| helperText | 2359:22437 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `helperText` | 도움말 메시지와 글자 수 | `font-caption-12-400` | `caption/12/400` | 12px/16px 400 -0.2px | 2359:22437 모든 상태, text·count: text style caption/12/400 |

## 토큰 (8개: confirmed 8)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `helperText-color-fg-default` | `--helper-text-color-fg-default` | 도움말 메시지 글자와 앞 아이콘의 기본 색(gray 600)으로, 필드 아래 도움말에 쓰며, 오류일 때는 helperText-color-fg-error를 쓴다. | #697582 | color-fg-neutral-muted-default → color-gray-600 | confirmed | O | 2359:22437 state=default, text: #697582 |  |
| `helperText-color-fg-error` | `--helper-text-color-fg-error` | 오류 메시지 글자와 앞 아이콘 색(빨강)으로, 입력 오류일 때 도움말에 쓰며, 글자 수의 현재 숫자는 helperText-count-color-fg-error를 쓴다. | #ED3B3E | color-fg-danger-strong → color-red-600 | confirmed | O | 2359:22437 state=error, text: #ED3B3E |  |
| `helperText-count-color-fg-default` | `--helper-text-count-color-fg-default` | 도움말 오른쪽 글자 수(「현재 / 최대」)의 기본 색(gray 600)으로, 글자 수 전체에 쓰며, 오류일 때도 「/」와 최대 글자 수는 이 색을 유지한다. | #697582 | color-fg-neutral-muted-default → color-gray-600 | confirmed | O | 2336:22072 state=default, count·/·max: #697582<br>2336:22072 state=error, /·max: #697582 |  |
| `helperText-count-color-fg-error` | `--helper-text-count-color-fg-error` | 글자 수가 넘었을 때 현재 글자 수 숫자의 색(빨강)으로, 오류 상태의 현재 숫자에만 쓰며, 「/」와 최대 글자 수는 helperText-count-color-fg-default를 쓴다. | #ED3B3E | color-fg-danger-strong → color-red-600 | confirmed | O | 2336:22072 state=error, count: #ED3B3E |  |
| `helperText-count-space-gap` | `--helper-text-count-space-gap` | 글자 수 안 「현재」, 「/」, 「최대」 사이 간격(2px)으로, helperText 글자 수에만 쓴다. | 2px | space-2 | confirmed | O | 2336:22072 모든 상태: 2 |  |
| `helperText-icon-size` | `--helper-text-icon-size` | 도움말 앞 아이콘의 크기(12px)로, helperText 아이콘에만 쓴다. | 12px | size-icon-xsmall → size-12 | confirmed | O | 2359:22437 모든 상태, IconSlot: 12 |  |
| `helperText-icon-space-paddingTop` | `--helper-text-icon-space-padding-top` | 도움말 앞 아이콘 칸의 위쪽 여백(2px)으로, 12px 아이콘을 16px 글자 줄 가운데에 맞추며, helperText 아이콘에만 쓴다. | 2px | space-2 | confirmed | O | 2359:22437 모든 상태, icon 프레임 위쪽: 2 |  |
| `helperText-space-gap` | `--helper-text-space-gap` | 도움말 메시지와 오른쪽 글자 수 사이 간격(4px)으로, helperText에만 쓴다. | 4px | space-4 | confirmed | O | 2359:22437 helperGroup: 4 |  |

## 참고

- **source**: 피그마 ❖ HelperText Components. 라이브러리용 컴포넌트 페이지의 예시_HelperText(3083:4408)는 템플릿 예시라 뺐다
- **iconGap**: 앞 아이콘과 메시지 사이 간격 0은 의도한 값이라 토큰을 만들지 않는다
- **fieldHelper**: 도움말 색의 원본은 helperText다. 필드 상자와 도움말 사이 간격([필드]-helper-space-gap)은 field 그룹에 둔다
