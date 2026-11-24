# 컴포넌트 토큰: skeleton

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| skeleton | 9037:18 |

## 사이즈별 값

> 컴포넌트 사이즈 단어(xlarge·medium …)와 Semantic 단계 단어(`radius-medium`, `size-icon-small` …)는 서로 다른 척도다. 값은 이름으로 짐작하지 말고 이 표나 토큰 목록에서 확인한다. 칸마다 최종 값과 거친 Semantic(없으면 Primitive 직접 참조)을 적었다.

### skeleton

| 사이즈 | `radius` |
| --- | --- |
| full | 9999px `radius-full` |

## 토큰 (3개: confirmed 3)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `skeleton-color-bg-default` | `--skeleton-color-bg-default` | 스켈레톤 자리 표시 채움 색으로, 모든 모양(사각·원·알약)에 같게 쓴다. | #E8ECEF | color-bg-neutral-strong → color-gray-100 | confirmed | O | 9037:18 모든 변형: #E8ECEF |  |
| `skeleton-radius` | `--skeleton-radius` | 스켈레톤 사각(rectangle, 기본) 모양의 모서리로, 글줄·이미지·카드 자리에 쓰며, 실제 콘텐츠 모서리가 다르면 인스턴스에서 그 반경 토큰으로 바꾼다. | 4px | radius-xsmall → radius-4 | confirmed | O | 9037:18 shape=rectangle: 4 |  |
| `skeleton-full-radius` | `--skeleton-full-radius` | 스켈레톤 원(circle)·알약(capsule) 모양의 모서리(끝이 둥근 모양)로, 아바타·아이콘 자리(원, 너비=높이)와 칩·태그·버튼 자리(알약)에 쓰며, 사각 모양은 skeleton-radius를 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 9037:18 shape=circle: 9999<br>9037:18 shape=capsule: 9999 |  |

## 참고

- **source**: 피그마 ❖ Skeleton 페이지 Skeleton(9037:18) 적용값
- **nested**: 크기(너비·높이)는 인스턴스에서 정해 토큰을 만들지 않는다. 그라데이션 띠(움직임)는 피그마에 생기면 그때 토큰을 제안한다
