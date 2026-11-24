# 컴포넌트 토큰: steps

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| steps | 7885:17522 |
| 조합: Steps (steps) | 7885:17523 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `steps-indicator` | 단계 표시 동그라미 안 번호 | `font-label-12-600` | `label/12/600` | 12px/16px 600 -0.2px | 7885:17522 status=upcoming·current, number: text style label/12/600 |

## 토큰 (12개: confirmed 12)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `steps-indicator-size` | `--steps-indicator-size` | 단계 표시 동그라미의 크기(가로·세로 20px)로, 모든 상태의 동그라미에 쓴다. | 20px | size-20 | confirmed | O | 7885:17522 모든 변형, indicator: 20 | STP-02, STP-04 |
| `steps-indicator-radius` | `--steps-indicator-radius` | 단계 표시 동그라미의 모서리(원형)로, 모든 상태의 동그라미에 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 7885:17522 모든 변형, indicator: 9999 |  |
| `steps-icon-size` | `--steps-icon-size` | 단계 표시에서 완료 단계 동그라미 안 체크 아이콘의 크기(14px)로, 완료 단계 아이콘에만 쓴다. | 14px | size-icon-small → size-14 | confirmed | O | 7885:17522 status=completed, IconSlot: 14 |  |
| `steps-connector-color-border-default` | `--steps-connector-color-border-default` | 단계 표시에서 단계와 단계 사이를 잇는 선의 색으로, 모든 상태의 연결선에 쓴다. | #E8ECEF | color-border-neutral-faint → color-gray-100 | confirmed | O | 7885:17522 모든 변형, connector: #E8ECEF |  |
| `steps-connector-borderWidth` | `--steps-connector-border-width` | 단계 표시 연결선의 두께(1.5px)로, 연결선에만 쓰며, 1.5는 Semantic이 없어 Primitive를 직접 참조한다. | 1.5px | borderWidth-1p5 | confirmed | O | 7885:17522 모든 변형, connector: 1.5 |  |
| `steps-connector-size-width` | `--steps-connector-size-width` | 단계 표시 연결선의 길이(12px)로, 동그라미 오른쪽에 붙는 연결선에만 쓰며(마지막 단계는 연결선 없음, showConnector 끔), 연결선 길이에 맞는 Semantic이 없어 Primitive를 직접 참조한다. | 12px | size-12 | confirmed | O | 7885:17522 모든 변형, connector: 12 | STP-03 |
| `steps-upcoming-indicator-color-bg-default` | `--steps-upcoming-indicator-color-bg-default` | 단계 표시에서 다음 단계(upcoming, 아직 진행하지 않은 단계) 동그라미의 바탕 색으로, 다음 단계 동그라미에만 쓰며, 현재 단계는 steps-current-indicator-color-bg-default, 완료 단계는 steps-completed-indicator-color-bg-default를 쓴다. | #E8ECEF | color-bg-neutral-strong → color-gray-100 | confirmed | O | 7885:17522 status=upcoming, indicator: #E8ECEF | STP-01 |
| `steps-upcoming-indicator-color-fg-default` | `--steps-upcoming-indicator-color-fg-default` | 단계 표시에서 다음 단계(upcoming) 동그라미 안 번호 글자 색으로, 다음 단계 번호에만 쓴다. | #697582 | color-fg-neutral-muted-default → color-gray-600 | confirmed | O | 7885:17522 status=upcoming, number: #697582 |  |
| `steps-current-indicator-color-bg-default` | `--steps-current-indicator-color-bg-default` | 단계 표시에서 현재 단계(current, aria-current 값 step) 동그라미의 바탕 색(브랜드)으로, 현재 단계에만 쓴다. | #3617CE | color-bg-brand-strongest-default → color-tBlue-600 | confirmed | O | 7885:17522 status=current, indicator: #3617CE |  |
| `steps-current-indicator-color-fg-default` | `--steps-current-indicator-color-fg-default` | 단계 표시에서 현재 단계(current) 동그라미 안 번호 글자 색(흰색)으로, 현재 단계 번호에만 쓴다. | #FFFFFF | color-fg-onStrongest → color-white | confirmed | O | 7885:17522 status=current, number: #FFFFFF |  |
| `steps-completed-indicator-color-bg-default` | `--steps-completed-indicator-color-bg-default` | 단계 표시에서 완료 단계(completed) 동그라미의 바탕 색(성공 초록)으로, 완료 단계에만 쓴다. | #1AB46E | color-bg-success-stronger → color-green-500 | confirmed | O | 7885:17522 status=completed, indicator: #1AB46E |  |
| `steps-completed-indicator-color-fg-default` | `--steps-completed-indicator-color-fg-default` | 단계 표시에서 완료 단계(completed) 동그라미 안 체크 아이콘 색(흰색)으로, 완료 단계 아이콘에만 쓴다. | #FFFFFF | color-fg-onStrongest → color-white | confirmed | O | 7885:17522 status=completed, IconSlot Check: #FFFFFF |  |

## 참고

- **source**: 피그마 ❖ Steps 페이지 _Item/Steps/Step(7885:17522)·Steps(7885:17523) 적용값
- **stateMap**: 피그마 status 이름을 그대로 변형으로 쓴다: upcoming([data-status="upcoming"]), current([aria-current="step"]), completed([data-status="completed"]). 모든 단계 항목에 셋 중 하나가 붙는다
- **connectorWidth**: 연결선(connector)은 피그마 벡터 선이라 길이 12를 너비로 두고 steps/connector/size/width 배리어블에 연결한다(색·두께도 연결)
