# 컴포넌트 토큰: focusRing

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| focusRing | 2327:9265 |

## 토큰 (4개: confirmed 4)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `focusRing-color-border` | `--focus-ring-color-border` | 키보드 포커스 링의 색(파랑 400)으로, 모든 상호작용 컴포넌트의 :focus-visible 링(outline-color)에 쓰며, 필드에 입력 중일 때의 테두리는 field 토큰(color-border-neutral-focus)을 쓴다. | #7FAEFF | color-border-focusRing → color-blue-400 | confirmed | O | 2327:9265 _FocusRing: #7FAEFF |  |
| `focusRing-borderWidth` | `--focus-ring-border-width` | 키보드 포커스 링의 두께(2px)로, :focus-visible 링(outline-width)에만 쓰며, 컴포넌트 테두리 두께는 각 컴포넌트의 borderWidth 토큰을 쓴다. | 2px | borderWidth-thick → borderWidth-2 | confirmed | O | 2327:9265 _FocusRing (stroke OUTSIDE): 2 |  |
| `focusRing-space-offset` | `--focus-ring-space-offset` | 키보드 포커스 링이 요소 가장자리에서 떨어지는 거리(2px)로, :focus-visible 링(outline-offset)에만 쓰며, 요소 안쪽 여백으로 쓰지 않는다. | 2px | space-2 | confirmed | O | 7225:918 _FocusRing 인스턴스: 요소보다 사방 2px 큼(모든 type·size, 예: square(button-action) xlarge 89×48 → 링 93×52): 2 |  |
| `focusRing-radius` | `--focus-ring-radius` | 모서리가 0인 요소(button-text 등)의 키보드 포커스 링 모서리(4px)로, 모서리 0 요소에만 쓰며, 자기 모서리가 있는 요소는 [컴포넌트]-[사이즈]-focusRing-radius(요소 모서리 + 2)를 쓴다. | 4px | radius-4 | confirmed | O | 2327:9265 _FocusRing: 4 |  |

## 참고

- **source**: 피그마 FocusRing 페이지 _FocusRing(2327:9265): stroke #7FAEFF 2px OUTSIDE, 모서리 4. 버튼 안 _FocusRing 인스턴스는 요소보다 사방 2px 크고 모서리는 요소 모서리 + 2
- **css**: :focus-visible { outline: var(--focus-ring-border-width) solid var(--focus-ring-color-border); outline-offset: var(--focus-ring-space-offset); } 모서리는 컴포넌트의 focusRing-radius 토큰
- **focusRingRadius**: 포커스 링 모서리: [컴포넌트]-[사이즈]-focusRing-radius는 요소 모서리 + 2(원형은 원형, 모서리 0은 focusRing-radius 4)다. Semantic을 만들지 않고 Primitive radius-[값]을 직접 참조한다. 피그마 변수가 계산식을 지원하지 않아 CSS calc 대신 토큰으로 둔다. 요소 모서리가 바뀌면 링 모서리 토큰도 함께 바꾼다
