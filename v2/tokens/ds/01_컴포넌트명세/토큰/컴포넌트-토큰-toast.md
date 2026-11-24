# 컴포넌트 토큰: toast

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| toast | 7427:238 |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `toast` | 토스트 문구 | `font-label-14-500` | `label/14/500` | 14px/20px 500 -0.2px | 7427:238 모든 status, message: text style label/14/500 |

## 토큰 (8개: confirmed 8)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `toast-color-bg-default` | `--toast-color-bg-default` | 토스트 바탕 색(어두운 반투명, grayAlpha 90)으로, 모든 status에서 같게 쓰며, 스낵바 바탕은 snackbar-color-bg-default를 쓴다. | #03182EE6 | color-bg-inverse → color-grayAlpha-90 | confirmed | O | 7427:238 모든 status, root: #03182EE6 |  |
| `toast-color-fg-default` | `--toast-color-fg-default` | 토스트 문구 색(흰색)으로, 모든 status에서 같게 쓴다. | #FFFFFF | color-fg-onInverse → color-white | confirmed | O | 7427:238 모든 status, message: #FFFFFF |  |
| `toast-radius` | `--toast-radius` | 토스트 상자의 모서리(12px)로, 토스트에만 쓴다. | 12px | radius-large → radius-12 | confirmed | O | 7427:238 모든 status, root: 12 |  |
| `toast-space-paddingX` | `--toast-space-padding-x` | 토스트 상자의 좌우 안쪽 여백(20px)으로, 토스트에만 쓴다. | 20px | space-20 | confirmed | O | 7427:238 모든 status 좌우: 20 |  |
| `toast-space-paddingY` | `--toast-space-padding-y` | 토스트 상자의 위아래 안쪽 여백(16px)으로, 토스트에만 쓴다. | 16px | space-16 | confirmed | O | 7427:238 모든 status 위아래: 16 |  |
| `toast-space-gap` | `--toast-space-gap` | 토스트 앞 아이콘과 문구 사이 간격(8px)으로, 아이콘이 있는 status(success·warning·danger·loading)에 쓴다. | 8px | space-8 | confirmed | O | 7427:238 status=success·warning·danger·loading: 8 |  |
| `toast-icon-size` | `--toast-icon-size` | 토스트 앞 아이콘(컬러 아이콘)의 너비·높이(20px)로, 토스트 아이콘에만 쓴다. | 20px | size-icon-large → size-20 | confirmed | O | 7427:238 status=success·warning·danger·loading, ColorIconSlot: 20 | TST-01, TST-02 |
| `toast-effect-blur` | `--toast-effect-blur` | 토스트 바탕 흐림 정도(20px, CSS backdrop-filter: blur)로, 토스트 바탕 뒤 화면을 흐리게 하는 데만 쓴다. | 20px | effect-blur-inverse → effect-blur-20 | confirmed | O | 7427:238 모든 status, background blur: 20 |  |

## 참고

- **source**: 피그마 ❖ Toast / Snackbar 페이지 Toast(7427:238) 적용값
- **nested**: 앞 아이콘은 ColorIconSlot(20) 컬러 아이콘이라 색 토큰이 없다. 너비는 문구 길이로 정해진다(HUG)
- **onInverse**: inverse 바탕 위 주 글자·아이콘은 Semantic color-fg-onInverse(흰색)를 쓴다(color-fg-onStrongest는 strongest 채움 위 전용). 토스트 문구·스낵바 제목·스낵바 액션 글자가 참조한다
