# 컴포넌트 토큰: badge

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| badge-basic | 7261:300 |
| badge-dotted | 7261:300 |
| badge-notification | 7261:300 |
| badge-counter | 7261:300 |

## 사이즈별 값

> 컴포넌트 사이즈 단어(xlarge·medium …)와 Semantic 단계 단어(`radius-medium`, `size-icon-small` …)는 서로 다른 척도다. 값은 이름으로 짐작하지 말고 이 표나 토큰 목록에서 확인한다. 칸마다 최종 값과 거친 Semantic(없으면 Primitive 직접 참조)을 적었다.

### badge-counter

| 사이즈 | `size-height` | `size-minWidth` | `space-paddingX` | `label-font` |
| --- | --- | --- | --- | --- |
| small | 16px (Primitive) | 16px (Primitive) | 4px (Primitive) | 12px/16px 500 `font-label-12-500` |
| medium | 18px (Primitive) | 18px (Primitive) | 4px (Primitive) | 12px/16px 500 `font-label-12-500` |
| large | 20px (Primitive) | 20px (Primitive) | 6px (Primitive) | 14px/20px 500 `font-label-14-500` |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `badge-notification-label` | 알림 배지 글자(N) | `font-caption-12-500` | `caption/12/500` | 12px/16px 500 -0.2px | 7261:300 type=notification, indicator=new: text style caption/12/500 |
| `badge-basic-label` | 상태 배지 라벨 | `font-label-12-600` | `label/12/600` | 12px/16px 600 -0.2px | 7261:300 type=basic (모든 tone): text style label/12/600 |
| `badge-dotted-label` | 점 배지 라벨 | `font-label-14-600` | `label/14/600` | 14px/20px 600 -0.2px | 7261:300 type=dot (모든 tone): text style label/14/600 |
| `badge-counter-small-label` | 작은 카운트 배지(small) 숫자 | `font-label-12-500` | `label/12/500` | 12px/16px 500 -0.2px | 7261:300 type=count, size=medium·small (모든 tone·state·emphasis): text style label/12/500 |
| `badge-counter-medium-label` | 중간 카운트 배지(medium) 숫자 | `font-label-12-500` | `label/12/500` | 12px/16px 500 -0.2px | 7261:300 type=count, size=medium·small (모든 tone·state·emphasis): text style label/12/500 |
| `badge-counter-large-label` | 큰 카운트 배지(large) 숫자 | `font-label-14-500` | `label/14/500` | 14px/20px 500 -0.2px | 7261:300 type=count, size=large (모든 tone·state·emphasis): text style label/14/500 |

## 토큰 (66개: confirmed 66)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `badge-notification-color-bg-default` | `--badge-notification-color-bg-default` | 알림 배지(새 글 N 표시와 빨간 점)의 채움 색(빨강)으로, badge-notification에만 쓰며, 상태를 알리는 옅은 바탕 배지는 badge 토큰을 쓴다. | #EA5154 | color-bg-danger-stronger → color-red-500 | confirmed | O | 7261:300 type=notification (모든 indicator): #EA5154 |  |
| `badge-notification-color-fg-default` | `--badge-notification-color-fg-default` | 알림 배지 안 글자(N)의 색(흰색)으로, 빨강 채움 위 글자에만 쓴다. | #FFFFFF | color-fg-onStrongest → color-white | confirmed | O | 7261:300 type=notification, indicator=new: #FFFFFF |  |
| `badge-notification-size-height` | `--badge-notification-size-height` | 글자가 있는 알림 배지(type=new)의 높이(16px)로, badge-notification에만 쓰며 점 알림은 badge-notification-dot-size-*를 쓴다. | 16px | size-16 | confirmed | O | 7261:300 type=notification, indicator=new: 16 |  |
| `badge-notification-size-minWidth` | `--badge-notification-size-min-width` | 글자가 있는 알림 배지의 최소 너비(16px)로, 글자가 짧아도 원형을 유지하게 하며 글자가 길면 좌우 여백만큼 넓어진다. | 16px | size-16 | confirmed | O | 7261:300 type=notification, indicator=new: 16 |  |
| `badge-notification-space-paddingX` | `--badge-notification-space-padding-x` | 글자가 있는 알림 배지의 좌우 안쪽 여백(4px)으로, badge-notification에만 쓴다. | 4px | space-4 | confirmed | O | 7261:300 type=notification, indicator=new: 4 |  |
| `badge-notification-radius` | `--badge-notification-radius` | 알림 배지의 모서리(원형·알약형, 모든 유형)로, badge-notification에만 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 7261:300 type=notification (모든 indicator): 9999 |  |
| `badge-notification-dot-size-width` | `--badge-notification-dot-size-width` | 점 알림 배지(type=dot)의 너비(6px)로, 글자 없는 빨간 점에만 쓰며 글자가 있는 알림 배지는 badge-notification-size-*를 쓴다. | 6px | size-dot-medium → size-6 | confirmed | O | 7261:300 type=notification, indicator=dot: 6 |  |
| `badge-notification-dot-size-height` | `--badge-notification-dot-size-height` | 점 알림 배지(type=dot)의 높이(6px)로, 글자 없는 빨간 점에만 쓰며 글자가 있는 알림 배지는 badge-notification-size-*를 쓴다. | 6px | size-dot-medium → size-6 | confirmed | O | 7261:300 type=notification, indicator=dot: 6 |  |
| `badge-basic-highlight-color-bg-default` | `--badge-basic-highlight-color-bg-default` | 브랜드 강조(highlight, 보라) 상태 배지(옅은 바탕 + 진한 글자)의 바탕 색으로, tone=highlight 배지에만 쓰며, 점으로 상태를 표시하는 배지는 badge-dotted-highlight-dot-color-bg-default를 쓴다. | #E1E3FF | color-bg-brand-strong → color-tBlue-80 | confirmed | O | 7261:300 type=basic, tone=highlight: #E1E3FF |  |
| `badge-basic-highlight-color-fg-default` | `--badge-basic-highlight-color-fg-default` | 브랜드 강조(highlight, 보라) 상태 배지의 라벨·앞 아이콘 색으로, tone=highlight 배지 바탕 위에만 쓴다. | #2F15B2 | color-fg-brand-strongest-default → color-tBlue-700 | confirmed | O | 7261:300 type=basic, tone=highlight: #2F15B2 |  |
| `badge-basic-info-color-bg-default` | `--badge-basic-info-color-bg-default` | 정보 상태 배지(옅은 바탕 + 진한 글자)의 바탕 색으로, tone=info 배지에만 쓰며, 점으로 상태를 표시하는 배지는 badge-dotted-info-dot-color-bg-default를 쓴다. | #D9E9FF | color-bg-info-strong → color-blue-100 | confirmed | O | 7261:300 type=basic, tone=info: #D9E9FF |  |
| `badge-basic-info-color-fg-default` | `--badge-basic-info-color-fg-default` | 정보 상태 배지의 라벨·앞 아이콘 색으로, tone=info 배지 바탕 위에만 쓴다. | #135BE0 | color-fg-info-strongest → color-blue-700 | confirmed | O | 7261:300 type=basic, tone=info: #135BE0 |  |
| `badge-basic-success-color-bg-default` | `--badge-basic-success-color-bg-default` | 성공 상태 배지(옅은 바탕 + 진한 글자)의 바탕 색으로, tone=success 배지에만 쓰며, 점으로 상태를 표시하는 배지는 badge-dotted-success-dot-color-bg-default를 쓴다. | #C8F6E1 | color-bg-success-strong → color-green-100 | confirmed | O | 7261:300 type=basic, tone=success: #C8F6E1 |  |
| `badge-basic-success-color-fg-default` | `--badge-basic-success-color-fg-default` | 성공 상태 배지의 라벨·앞 아이콘 색으로, tone=success 배지 바탕 위에만 쓴다. | #038E52 | color-fg-success-strongest → color-green-700 | confirmed | O | 7261:300 type=basic, tone=success: #038E52 |  |
| `badge-basic-danger-color-bg-default` | `--badge-basic-danger-color-bg-default` | 위험 상태 배지(옅은 바탕 + 진한 글자)의 바탕 색으로, tone=danger 배지에만 쓰며, 점으로 상태를 표시하는 배지는 badge-dotted-danger-dot-color-bg-default를 쓴다. | #FFDCDC | color-bg-danger-strong → color-red-100 | confirmed | O | 7261:300 type=basic, tone=danger: #FFDCDC |  |
| `badge-basic-danger-color-fg-default` | `--badge-basic-danger-color-fg-default` | 위험 상태 배지의 라벨·앞 아이콘 색으로, tone=danger 배지 바탕 위에만 쓴다. | #ED3B3E | color-fg-danger-strong → color-red-600 | confirmed | O | 7261:300 type=basic, tone=danger: #ED3B3E |  |
| `badge-basic-warning-color-bg-default` | `--badge-basic-warning-color-bg-default` | 경고 상태 배지(옅은 바탕 + 진한 글자)의 바탕 색으로, tone=warning 배지에만 쓰며, 점으로 상태를 표시하는 배지는 badge-dotted-warning-dot-color-bg-default를 쓴다. | #FFE4C4 | color-bg-warning-strong → color-orange-100 | confirmed | O | 7261:300 type=basic, tone=warning: #FFE4C4 |  |
| `badge-basic-warning-color-fg-default` | `--badge-basic-warning-color-fg-default` | 경고 상태 배지의 라벨·앞 아이콘 색으로, tone=warning 배지 바탕 위에만 쓴다. | #D66400 | color-fg-warning-strongest → color-orange-800 | confirmed | O | 7261:300 type=basic, tone=warning: #D66400 |  |
| `badge-basic-attention-color-bg-default` | `--badge-basic-attention-color-bg-default` | 주의 상태 배지(옅은 바탕 + 진한 글자)의 바탕 색으로, tone=attention 배지에만 쓰며, 점으로 상태를 표시하는 배지는 badge-dotted-attention-dot-color-bg-default를 쓴다. | #FDEFC4 | color-bg-attention-strong → color-yellow-100 | confirmed | O | 7261:300 type=basic, tone=attention: #FDEFC4 |  |
| `badge-basic-attention-color-fg-default` | `--badge-basic-attention-color-fg-default` | 주의 상태 배지의 라벨·앞 아이콘 색으로, tone=attention 배지 바탕 위에만 쓴다. | #D17E28 | color-fg-attention-strongest → color-yellow-900 | confirmed | O | 7261:300 type=basic, tone=attention: #D17E28 |  |
| `badge-basic-neutral-color-bg-default` | `--badge-basic-neutral-color-bg-default` | 중립 상태 배지(옅은 바탕 + 진한 글자)의 바탕 색으로, tone=neutral 배지에만 쓰며, 점으로 상태를 표시하는 배지는 badge-dotted-neutral-dot-color-bg-default를 쓴다. | #E8ECEF | color-bg-neutral-strong → color-gray-100 | confirmed | O | 7261:300 type=basic, tone=neutral: #E8ECEF |  |
| `badge-basic-neutral-color-fg-default` | `--badge-basic-neutral-color-fg-default` | 중립 상태 배지의 라벨·앞 아이콘 색으로, tone=neutral 배지 바탕 위에만 쓴다. | #454F59 | color-fg-neutral-strong-default → color-gray-700 | confirmed | O | 7261:300 type=basic, tone=neutral: #454F59 |  |
| `badge-basic-size-height` | `--badge-basic-size-height` | 상태 배지의 높이(22px, 고정)로, badge에만 쓰며 컨트롤 높이(size-control-*)가 아니다. | 22px | size-22 | confirmed | O | 7261:300 type=basic (모든 tone): 22 |  |
| `badge-basic-space-paddingX` | `--badge-basic-space-padding-x` | 상태 배지의 좌우 안쪽 여백(8px)으로, badge에만 쓴다. | 8px | space-8 | confirmed | O | 7261:300 type=basic (모든 tone): 8 |  |
| `badge-basic-space-gap` | `--badge-basic-space-gap` | 상태 배지 앞 아이콘과 라벨 사이 간격(4px)으로, 앞 아이콘을 켤 때(showLeadingIcon)만 쓴다. | 4px | space-4 | confirmed | O | 7261:300 type=basic (모든 tone): 4 |  |
| `badge-basic-radius` | `--badge-basic-radius` | 상태 배지의 모서리(4px)로, badge에만 쓴다. | 4px | radius-xsmall → radius-4 | confirmed | O | 7261:300 type=basic (모든 tone): 4 |  |
| `badge-basic-icon-size` | `--badge-basic-icon-size` | 상태 배지 앞 아이콘의 크기(16px)로, badge 안 아이콘에만 쓴다. | 16px | size-icon-medium → size-16 | confirmed | O | 7261:300 type=basic (모든 tone): 16 |  |
| `badge-dotted-highlight-dot-color-bg-default` | `--badge-dotted-highlight-dot-color-bg-default` | 브랜드 강조(highlight, 보라) 점 배지의 점 색으로, tone=highlight 점 배지에만 쓰며, 옆 라벨은 tone과 관계없이 badge-dotted-color-fg-default를 쓴다. | #3617CE | color-bg-brand-strongest-default → color-tBlue-600 | confirmed | O | 7261:300 type=dot, tone=highlight: #3617CE |  |
| `badge-dotted-info-dot-color-bg-default` | `--badge-dotted-info-dot-color-bg-default` | 정보 점 배지의 점 색으로, tone=info 점 배지에만 쓰며, 옆 라벨은 tone과 관계없이 badge-dotted-color-fg-default를 쓴다. | #5895FF | color-bg-info-strongest → color-blue-500 | confirmed | O | 7261:300 type=dot, tone=info: #5895FF |  |
| `badge-dotted-success-dot-color-bg-default` | `--badge-dotted-success-dot-color-bg-default` | 성공 점 배지의 점 색으로, tone=success 점 배지에만 쓰며, 옆 라벨은 tone과 관계없이 badge-dotted-color-fg-default를 쓴다. | #1AB46E | color-bg-success-stronger → color-green-500 | confirmed | O | 7261:300 type=dot, tone=success: #1AB46E |  |
| `badge-dotted-danger-dot-color-bg-default` | `--badge-dotted-danger-dot-color-bg-default` | 위험 점 배지의 점 색으로, tone=danger 점 배지에만 쓰며, 옆 라벨은 tone과 관계없이 badge-dotted-color-fg-default를 쓴다. | #EA5154 | color-bg-danger-stronger → color-red-500 | confirmed | O | 7261:300 type=dot, tone=danger: #EA5154 |  |
| `badge-dotted-warning-dot-color-bg-default` | `--badge-dotted-warning-dot-color-bg-default` | 경고 점 배지의 점 색으로, tone=warning 점 배지에만 쓰며, 옆 라벨은 tone과 관계없이 badge-dotted-color-fg-default를 쓴다. | #FF9D3B | color-bg-warning-strongest → color-orange-500 | confirmed | O | 7261:300 type=dot, tone=warning: #FF9D3B |  |
| `badge-dotted-attention-dot-color-bg-default` | `--badge-dotted-attention-dot-color-bg-default` | 주의 점 배지의 점 색으로, tone=attention 점 배지에만 쓰며, 옆 라벨은 tone과 관계없이 badge-dotted-color-fg-default를 쓴다. | #F7C55C | color-bg-attention-strongest → color-yellow-500 | confirmed | O | 7261:300 type=dot, tone=attention: #F7C55C |  |
| `badge-dotted-neutral-dot-color-bg-default` | `--badge-dotted-neutral-dot-color-bg-default` | 중립 점 배지의 점 색으로, tone=neutral 점 배지에만 쓰며, 옆 라벨은 tone과 관계없이 badge-dotted-color-fg-default를 쓴다. | #8B949E | color-gray-500 | confirmed | O | 7261:300 type=dot, tone=neutral: #8B949E |  |
| `badge-dotted-color-fg-default` | `--badge-dotted-color-fg-default` | 점 배지 라벨의 글자 색(모든 tone 같음)으로, badge-dotted 라벨에만 쓰며, tone 색은 점(badge-dotted-[tone]-dot-color-bg-default)으로만 표시한다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 7261:300 type=dot (모든 tone): #1C1F23 |  |
| `badge-dotted-size-height` | `--badge-dotted-size-height` | 점 배지의 높이(20px, 고정)로, badge-dotted에만 쓴다. | 20px | size-20 | confirmed | O | 7261:300 type=dot (모든 tone): 20 |  |
| `badge-dotted-space-gap` | `--badge-dotted-space-gap` | 점 배지의 점과 라벨 사이 간격(4px)으로, badge-dotted에만 쓴다. | 4px | space-4 | confirmed | O | 7261:300 type=dot (모든 tone): 4 |  |
| `badge-dotted-dot-size-width` | `--badge-dotted-dot-size-width` | 점 배지 점의 너비(6px)로, badge-dotted 점에만 쓰며, 알림용 빨간 점은 badge-notification-dot-size-*를 쓴다. | 6px | size-dot-medium → size-6 | confirmed | O | 7261:300 type=dot (모든 tone): 6 |  |
| `badge-dotted-dot-size-height` | `--badge-dotted-dot-size-height` | 점 배지 점의 높이(6px)로, badge-dotted 점에만 쓰며, 알림용 빨간 점은 badge-notification-dot-size-*를 쓴다. | 6px | size-dot-medium → size-6 | confirmed | O | 7261:300 type=dot (모든 tone): 6 |  |
| `badge-dotted-dot-radius` | `--badge-dotted-dot-radius` | 점 배지 점의 모서리(원형)로, badge-dotted 점에만 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 7261:300 type=dot (모든 tone), dot: 9999 |  |
| `badge-counter-highlight-color-bg-default` | `--badge-counter-highlight-color-bg-default` | 브랜드 강조(highlight, 보라) 채움 카운트 배지의 기본 바탕 색으로, tone=highlight·emphasis=strong 카운트 배지에만 쓰며, 옅은 바탕 모양은 badge-counter-highlight-subtle-color-bg-default를 쓴다. | #3617CE | color-bg-brand-strongest-default → color-tBlue-600 | confirmed | O | 7261:300 type=count, tone=highlight, size=large·medium·small, state=default, emphasis=strong: #3617CE |  |
| `badge-counter-highlight-color-bg-disabled` | `--badge-counter-highlight-color-bg-disabled` | 브랜드 강조(highlight, 보라) 채움 카운트 배지의 비활성 바탕 색으로, tone=highlight·emphasis=strong 카운트 배지에만 쓰며, 옅은 바탕 모양은 badge-counter-highlight-subtle-color-bg-disabled를 쓴다. | #F1F2FF | color-bg-brand-faint-default → color-tBlue-50 | confirmed | O | 7261:300 type=count, tone=highlight, size=large·medium·small, state=disabled, emphasis=strong: #F1F2FF |  |
| `badge-counter-highlight-color-fg-default` | `--badge-counter-highlight-color-fg-default` | 브랜드 강조(highlight, 보라) 채움 카운트 배지의 기본 숫자 색으로, badge-counter-highlight-color-bg-default 위 숫자에만 쓰며, 옅은 바탕 모양은 badge-counter-highlight-subtle-color-fg-default를 쓴다. | #FFFFFF | color-fg-onStrongest → color-white | confirmed | O | 7261:300 type=count, tone=highlight, size=large·medium·small, state=default, emphasis=strong: #FFFFFF |  |
| `badge-counter-highlight-color-fg-disabled` | `--badge-counter-highlight-color-fg-disabled` | 브랜드 강조(highlight, 보라) 채움 카운트 배지의 비활성 숫자 색으로, badge-counter-highlight-color-bg-disabled 위 숫자에만 쓰며, 옅은 바탕 모양은 badge-counter-highlight-subtle-color-fg-disabled를 쓴다. | #B4B7FF | color-fg-brand-faintest → color-tBlue-200 | confirmed | O | 7261:300 type=count, tone=highlight, size=large·medium·small, state=disabled, emphasis=strong: #B4B7FF |  |
| `badge-counter-highlight-subtle-color-bg-default` | `--badge-counter-highlight-subtle-color-bg-default` | 브랜드 강조(highlight, 보라) 옅은 바탕 카운트 배지의 기본 바탕 색으로, tone=highlight·emphasis=subtle 카운트 배지에만 쓰며, 채움 모양은 badge-counter-highlight-color-bg-default를 쓴다. | #E1E3FF | color-bg-brand-strong → color-tBlue-80 | confirmed | O | 7261:300 type=count, tone=highlight, size=large·medium·small, state=default, emphasis=subtle: #E1E3FF |  |
| `badge-counter-highlight-subtle-color-bg-disabled` | `--badge-counter-highlight-subtle-color-bg-disabled` | 브랜드 강조(highlight, 보라) 옅은 바탕 카운트 배지의 비활성 바탕 색으로, tone=highlight·emphasis=subtle 카운트 배지에만 쓰며, 채움 모양은 badge-counter-highlight-color-bg-disabled를 쓴다. | #F1F2FF | color-bg-brand-faint-default → color-tBlue-50 | confirmed | O | 7261:300 type=count, tone=highlight, size=large·medium·small, state=disabled, emphasis=subtle: #F1F2FF |  |
| `badge-counter-highlight-subtle-color-fg-default` | `--badge-counter-highlight-subtle-color-fg-default` | 브랜드 강조(highlight, 보라) 옅은 바탕 카운트 배지의 기본 숫자 색으로, badge-counter-highlight-subtle-color-bg-default 위 숫자에만 쓰며, 채움 모양은 badge-counter-highlight-color-fg-default를 쓴다. | #3617CE | color-fg-brand-strong-default → color-tBlue-600 | confirmed | O | 7261:300 type=count, tone=highlight, size=large·medium·small, state=default, emphasis=subtle: #3617CE |  |
| `badge-counter-highlight-subtle-color-fg-disabled` | `--badge-counter-highlight-subtle-color-fg-disabled` | 브랜드 강조(highlight, 보라) 옅은 바탕 카운트 배지의 비활성 숫자 색으로, badge-counter-highlight-subtle-color-bg-disabled 위 숫자에만 쓰며, 채움 모양은 badge-counter-highlight-color-fg-disabled를 쓴다. | #B4B7FF | color-fg-brand-faintest → color-tBlue-200 | confirmed | O | 7261:300 type=count, tone=highlight, size=large·medium·small, state=disabled, emphasis=subtle: #B4B7FF |  |
| `badge-counter-neutral-color-bg-default` | `--badge-counter-neutral-color-bg-default` | 중립 채움 카운트 배지의 기본 바탕 색으로, tone=neutral·emphasis=strong 카운트 배지에만 쓰며, 옅은 바탕 모양은 badge-counter-neutral-subtle-color-bg-default를 쓴다. | #1C1F23 | color-bg-neutral-strongest-default → color-gray-900 | confirmed | O | 7261:300 type=count, tone=neutral, size=large·medium·small, state=default, emphasis=strong: #1C1F23 |  |
| `badge-counter-neutral-color-bg-disabled` | `--badge-counter-neutral-color-bg-disabled` | 중립 채움 카운트 배지의 비활성 바탕 색으로, tone=neutral·emphasis=strong 카운트 배지에만 쓰며, 옅은 바탕 모양은 badge-counter-neutral-subtle-color-bg-disabled를 쓴다. | #C4C9CF | color-bg-neutral-strongest-disabled → color-gray-300 | confirmed | O | 7261:300 type=count, tone=neutral, size=large·medium·small, state=disabled, emphasis=strong: #C4C9CF |  |
| `badge-counter-neutral-color-fg-default` | `--badge-counter-neutral-color-fg-default` | 중립 채움 카운트 배지의 기본 숫자 색으로, badge-counter-neutral-color-bg-default 위 숫자에만 쓰며, 옅은 바탕 모양은 badge-counter-neutral-subtle-color-fg-default를 쓴다. | #FFFFFF | color-fg-onStrongest → color-white | confirmed | O | 7261:300 type=count, tone=neutral, size=large·medium·small, state=default, emphasis=strong: #FFFFFF |  |
| `badge-counter-neutral-color-fg-disabled` | `--badge-counter-neutral-color-fg-disabled` | 중립 채움 카운트 배지의 비활성 숫자 색으로, badge-counter-neutral-color-bg-disabled 위 숫자에만 쓰며, 옅은 바탕 모양은 badge-counter-neutral-subtle-color-fg-disabled를 쓴다. | #E8ECEF | color-fg-neutral-faintest → color-gray-100 | confirmed | O | 7261:300 type=count, tone=neutral, size=large·medium·small, state=disabled, emphasis=strong: #E8ECEF |  |
| `badge-counter-neutral-subtle-color-bg-default` | `--badge-counter-neutral-subtle-color-bg-default` | 중립 옅은 바탕 카운트 배지의 기본 바탕 색으로, tone=neutral·emphasis=subtle 카운트 배지에만 쓰며, 채움 모양은 badge-counter-neutral-color-bg-default를 쓴다. | #03182E14 | color-grayAlpha-8 | confirmed | O | 7261:300 type=count, tone=neutral, size=large·medium·small, state=default, emphasis=subtle: #03182E14 |  |
| `badge-counter-neutral-subtle-color-bg-disabled` | `--badge-counter-neutral-subtle-color-bg-disabled` | 중립 옅은 바탕 카운트 배지의 비활성 바탕 색으로, tone=neutral·emphasis=subtle 카운트 배지에만 쓰며, 채움 모양은 badge-counter-neutral-color-bg-disabled를 쓴다. | #03182E0D | color-grayAlpha-5 | confirmed | O | 7261:300 type=count, tone=neutral, size=large·medium·small, state=disabled, emphasis=subtle: #03182E0D |  |
| `badge-counter-neutral-subtle-color-fg-default` | `--badge-counter-neutral-subtle-color-fg-default` | 중립 옅은 바탕 카운트 배지의 기본 숫자 색으로, badge-counter-neutral-subtle-color-bg-default 위 숫자에만 쓰며, 채움 모양은 badge-counter-neutral-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 7261:300 type=count, tone=neutral, size=large·medium·small, state=default, emphasis=subtle: #1C1F23 |  |
| `badge-counter-neutral-subtle-color-fg-disabled` | `--badge-counter-neutral-subtle-color-fg-disabled` | 중립 옅은 바탕 카운트 배지의 비활성 숫자 색으로, badge-counter-neutral-subtle-color-bg-disabled 위 숫자에만 쓰며, 채움 모양은 badge-counter-neutral-color-fg-disabled를 쓴다. | #B3B9C0 | color-fg-neutral-disabled → color-gray-400 | confirmed | O | 7261:300 type=count, tone=neutral, size=large·medium·small, state=disabled, emphasis=subtle: #B3B9C0 |  |
| `badge-counter-radius` | `--badge-counter-radius` | 카운트 배지의 모서리(원형·알약형, 모든 사이즈)로, badge-counter에만 쓴다. | 9999px | radius-full → radius-9999 | confirmed | O | 7261:300 type=count, tone=highlight·neutral, size=large·medium·small (모든 state·emphasis): 9999 |  |
| `badge-counter-small-size-height` | `--badge-counter-small-size-height` | 작은 카운트 배지(small)의 높이(16px)로, badge-counter small에만 쓰며 컨트롤 높이가 아니다. | 16px | size-16 | confirmed | O | 7261:300 type=count, tone=highlight·neutral, size=small (모든 state·emphasis): 16 |  |
| `badge-counter-small-size-minWidth` | `--badge-counter-small-size-min-width` | 작은 카운트 배지(small)의 최소 너비(16px)로, 한 자리 숫자에서 원형을 유지하며 두 자리 이상은 좌우 여백만큼 넓어진다. | 16px | size-16 | confirmed | O | 7261:300 type=count, tone=highlight·neutral, size=small (모든 state·emphasis): 16 |  |
| `badge-counter-small-space-paddingX` | `--badge-counter-small-space-padding-x` | 작은 카운트 배지(small)의 좌우 안쪽 여백(4px)으로, badge-counter small에만 쓴다. | 4px | space-4 | confirmed | O | 7261:300 type=count, tone=highlight·neutral, size=small (모든 state·emphasis): 4 |  |
| `badge-counter-medium-size-height` | `--badge-counter-medium-size-height` | 중간 카운트 배지(medium)의 높이(18px)로, badge-counter medium에만 쓰며 컨트롤 높이가 아니다. | 18px | size-18 | confirmed | O | 7261:300 type=count, tone=highlight·neutral, size=medium (모든 state·emphasis): 18 |  |
| `badge-counter-medium-size-minWidth` | `--badge-counter-medium-size-min-width` | 중간 카운트 배지(medium)의 최소 너비(18px)로, 한 자리 숫자에서 원형을 유지하며 두 자리 이상은 좌우 여백만큼 넓어진다. | 18px | size-18 | confirmed | O | 7261:300 type=count, tone=highlight·neutral, size=medium (모든 state·emphasis): 18 |  |
| `badge-counter-medium-space-paddingX` | `--badge-counter-medium-space-padding-x` | 중간 카운트 배지(medium)의 좌우 안쪽 여백(4px)으로, badge-counter medium에만 쓴다. | 4px | space-4 | confirmed | O | 7261:300 type=count, tone=highlight·neutral, size=medium (모든 state·emphasis): 4 |  |
| `badge-counter-large-size-height` | `--badge-counter-large-size-height` | 큰 카운트 배지(large)의 높이(20px)로, badge-counter large에만 쓰며 컨트롤 높이가 아니다. | 20px | size-20 | confirmed | O | 7261:300 type=count, tone=highlight·neutral, size=large (모든 state·emphasis): 20 |  |
| `badge-counter-large-size-minWidth` | `--badge-counter-large-size-min-width` | 큰 카운트 배지(large)의 최소 너비(20px)로, 한 자리 숫자에서 원형을 유지하며 두 자리 이상은 좌우 여백만큼 넓어진다. | 20px | size-20 | confirmed | O | 7261:300 type=count, tone=highlight·neutral, size=large (모든 state·emphasis): 20 |  |
| `badge-counter-large-space-paddingX` | `--badge-counter-large-space-padding-x` | 큰 카운트 배지(large)의 좌우 안쪽 여백(6px)으로, badge-counter large에만 쓴다. | 6px | space-6 | confirmed | O | 7261:300 type=count, tone=highlight·neutral, size=large (모든 state·emphasis): 6 |  |

## 참고

- **group**: 배지 4종(badge-basic·badge-dotted·badge-notification·badge-counter)은 badge 그룹이다. 그룹 공통 토큰은 없고, 컴포넌트마다 badge-[하위 이름]으로 시작한다
- **badge-notification.source**: 피그마 통합 세트 Badge 7261:300 type=notification(indicator=new·dot)
- **badge-notification.type**: type=new·dot은 같은 빨강을 쓴다. 유형 어휘를 만들지 않고, 점은 부품 dot의 치수로 나눴다
- **badge-basic.source**: 피그마 통합 세트 Badge 7261:300 type=basic
- **badge-basic.role**: 피그마 color → 역할: negative→danger, 나머지는 같은 이름
- **badge-basic.neutralFg**: neutral 배지 글자는 gray 700이라 color-fg-neutral-strong-default을 쓴다(다른 tone은 strongest)
- **badge-basic.icon**: 앞 아이콘(IconSlot)은 빈 자리표시자라 색이 없다. 아이콘 색은 라벨 색을 따른다
- **badge-dotted.source**: 피그마 통합 세트 Badge 7261:300 type=dot
- **badge-dotted.role**: 피그마 color → 역할: negative→danger, 나머지는 같은 이름
- **badge-counter.source**: 피그마 통합 세트 Badge 7261:300 type=count
- **badge-counter.naming**: emphasis=strong(채움)은 변형 구간을 비우고, emphasis=subtle은 subtle을 쓴다. 피그마 state 값은 default·disabled
- **badge-counter.subtleBrand**: 강조(highlight) subtle 바탕은 배지 바탕(color-bg-brand-strong, tBlue 80)과 같다
- **badge-counter.alpha**: 중립 subtle 바탕 grayAlpha 8은 Semantic이 없어 Primitive를 직접 참조한다
- **badge-counter.focusRing**: 카운트 배지는 상호작용 요소가 아니라 포커스 링 토큰이 없다
- **badge-counter.disabled**: 비활성 카운트 배지: 브랜드는 바탕 color-bg-brand-faint-default·숫자 color-fg-brand-faintest, 중립 채움은 바탕 color-bg-neutral-strongest-disabled·숫자 color-fg-neutral-faintest를 쓴다
- **tone**: 색 의미 속성 이름은 tone, 브랜드 강조 값은 highlight다(피그마 11169:3). 토큰은 badge-*-highlight-*이고(Semantic color-*-brand-*는 색의 출처라 brand를 쓴다), 선택자는 [data-tone="값"]이다
