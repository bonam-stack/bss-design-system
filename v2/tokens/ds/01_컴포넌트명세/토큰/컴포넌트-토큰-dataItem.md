# 컴포넌트 토큰: dataItem

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| dataItem | 8466:1835 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `dataItem-value` | 데이터 항목의 값 글자 | `font-label-14-600` | `label/14/600` | 14px/20px 600 -0.2px | 8466:1835 value: label/14/600 |
| `dataItem-label` | 데이터 항목의 레이블 | `font-label-14-400` | `label/14/400` | 14px/20px 400 -0.2px | 8466:1835 label: label/14/400 |

## 토큰 (3개: confirmed 3)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `dataItem-value-color-fg-default` | `--data-item-value-color-fg-default` | 데이터 항목의 값 글자 색(가장 진한 회색)으로, 레이블·값 한 쌍에서 값 글자에만 쓰며, 레이블은 dataItem-label-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 8466:1835 value: #1C1F23 |  |
| `dataItem-label-color-fg-default` | `--data-item-label-color-fg-default` | 데이터 항목의 레이블 글자 색(흐린 회색)으로, 레이블·값 한 쌍에서 레이블에만 쓰며, 값 글자는 dataItem-value-color-fg-default를 쓴다. | #697582 | color-fg-neutral-muted-default → color-gray-600 | confirmed | O | 8466:1835 label: #697582 | DI-02 |
| `dataItem-space-gap` | `--data-item-space-gap` | 데이터 항목의 레이블과 값 사이 간격(12px, 가로)으로, 데이터 항목 안에만 쓴다. | 12px | space-12 | confirmed | O | 8466:1835 label·value 사이: 12 | DI-01, DI-03 |

## 참고

- **source**: 피그마 ❖ List 페이지 DataItem(8466:1835) 적용값
- **valuePart**: 값 글자 색은 부품 value를 붙인 dataItem-value-color-fg-default를 써 레이블(label)과 짝을 맞춘다
