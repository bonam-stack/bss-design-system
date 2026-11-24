# 컴포넌트 토큰: progressBar

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| progressBar | 8980:137 |

## 토큰 (7개: confirmed 7)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `progressBar-size-height` | `--progress-bar-size-height` | 진행 막대(트랙)의 높이(8px)로, progressBar에만 쓴다. | 8px | size-8 | confirmed | O | 8980:137 모든 변형, track: 8 | PRB-03 |
| `progressBar-radius` | `--progress-bar-radius` | 진행 막대 트랙과 채움 막대의 모서리(완전히 둥근 끝)로, progressBar에만 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 8980:137 모든 변형, track·indicator: 9999 |  |
| `progressBar-track-color-bg-default` | `--progress-bar-track-color-bg-default` | 진행 막대 트랙(채워지지 않은 바탕) 색으로, 모든 상태에서 같다. | #F1F3F5 | color-bg-neutral-muted → color-gray-80 | confirmed | O | 8980:137 모든 변형, track: #F1F3F5 |  |
| `progressBar-indicator-color-bg-default` | `--progress-bar-indicator-color-bg-default` | 진행 중 채움 막대 색으로, 기본 상태에 쓰며 완료는 progressBar-completed-indicator-color-bg-default를 쓴다. | #3617CE | color-bg-brand-strongest-default → color-tBlue-600 | confirmed | O | 8980:137 status=default, indicator: #3617CE | PRB-01 |
| `progressBar-indicator-color-bg-error` | `--progress-bar-indicator-color-bg-error` | 오류 상태 채움 막대 색으로, 진행이 실패했을 때 쓴다. | #ED3B3E | color-bg-danger-strongest → color-red-600 | confirmed | O | 8980:137 status=error, indicator: #ED3B3E |  |
| `progressBar-indicator-color-bg-disabled` | `--progress-bar-indicator-color-bg-disabled` | 멈춤·비활성 상태 채움 막대 색으로, 진행이 멈췄거나 비활성일 때 쓴다(피그마 status=stopped). | #DCE0E5 | color-bg-neutral-stronger-disabled → color-gray-200 | confirmed | O | 8980:137 status=stopped, indicator: #DCE0E5 |  |
| `progressBar-completed-indicator-color-bg-default` | `--progress-bar-completed-indicator-color-bg-default` | 완료(100%) 상태 채움 막대 색으로, 진행이 끝났을 때 쓰며 진행 중은 progressBar-indicator-color-bg-default를 쓴다. | #00A058 | color-bg-success-strongest → color-green-600 | confirmed | O | 8980:137 value=100, status=completed, indicator: #00A058 | PRB-02 |

## 참고

- **source**: 피그마 ❖ Progress Bar 페이지 ProgressBar(8980:137) 적용값
- **nested**: 너비는 놓이는 영역을 채우고(FILL), 채움 막대 너비는 진행률로 정해져 토큰을 만들지 않았다. 진행률 0%에서는 채움 막대를 숨긴다
