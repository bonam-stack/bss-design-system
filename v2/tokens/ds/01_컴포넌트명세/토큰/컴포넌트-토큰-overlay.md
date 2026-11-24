# 컴포넌트 토큰: overlay

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| alert | 7414:324 |
| dialog | 4224:36893 |
| modal | 3863:861 |
| viewerModal | 3863:862 |

## 사이즈별 값

> 컴포넌트 사이즈 단어(xlarge·medium …)와 Semantic 단계 단어(`radius-medium`, `size-icon-small` …)는 서로 다른 척도다. 값은 이름으로 짐작하지 말고 이 표나 토큰 목록에서 확인한다. 칸마다 최종 값과 거친 Semantic(없으면 Primitive 직접 참조)을 적었다.

### modal

| 사이즈 | `size-width` |
| --- | --- |
| small | 720px (Primitive) |
| medium | 960px (Primitive) |
| large | 1280px (Primitive) |

## 글자 스타일

> 컴포넌트 글자에는 Component 토큰이 없다. 피그마는 글자 레이어에 텍스트 스타일을, 코드는 Semantic 글자 변수를 그대로 쓴다. `+ tabular-nums`가 붙은 대상은 숫자 폭을 고정한다(코드 `font-variant-numeric: tabular-nums`, 피그마 `label/[크기]/tabular/[굵기]` 스타일).

| 대상 키 | 대상 | 글자 스타일 | 피그마 텍스트 스타일 | 값 (크기/줄 높이 굵기 자간) | 피그마 근거 |
| --- | --- | --- | --- | --- | --- |
| `overlay-title` | 오버레이 머리 제목 | `font-heading-20-700` | `heading/20/700` | 20px/28px 700 -0.2px | 7414:324 Alert, header, title: text style heading/20/700<br>4224:36893 header, title: text style heading/20/700<br>3863:861 header, title: text style heading/20/700<br>3863:862 header, title: text style heading/20/700 |
| `overlay-message` | 오버레이 본문 메시지(다이얼로그·알림) | `font-body-16-400` | `body/16/400` | 16px/24px 400 -0.2px | 4224:36893 message: text style body/16/400<br>7414:324 Alert, message: text style body/16/400 |
| `viewerModal-toolbar` | 뷰어 툴바 쪽 표시 | `font-label-13-500` | `label/13/500` | 13px/20px 500 -0.2px | 3865:800 type=page, currentPage·slash·totalPages: text style label/13/500 |

## 토큰 (38개: confirmed 38)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `overlay-color-bg-default` | `--overlay-color-bg-default` | 오버레이(알림·다이얼로그·모달·뷰어 모달) 상자의 바탕 색(흰색)으로, 오버레이 상자에만 쓰며, 뷰어 모달의 문서 표시 영역은 viewerModal-viewport-color-bg-default를 쓴다. | #FFFFFF | color-bg-base → color-white | confirmed | O | 7414:324 모든 변형: #FFFFFF<br>4224:36893 모든 변형: #FFFFFF<br>3863:861 모든 변형: #FFFFFF<br>3863:862 모든 변형: #FFFFFF |  |
| `overlay-backdrop-color-bg-default` | `--overlay-backdrop-color-bg-default` | 오버레이(알림·다이얼로그·모달·뷰어 모달)를 띄울 때 뒤 화면을 덮는 배경 색으로, 오버레이 뒤 전체 화면 레이어에만 쓰며, 오버레이 상자 자체의 바탕은 overlay-color-bg-default를 쓴다. | #00000099 | color-bg-backdrop → color-blackAlpha-60 | confirmed | O | 3872:1308 ❖ Modal Usage Examples 섹션 배경: #00000099<br>3872:1309 ❖ ViewerModal Usage Examples 섹션 배경: #00000099 |  |
| `overlay-title-color-fg-default` | `--overlay-title-color-fg-default` | 오버레이 머리 제목 글자 색으로, 알림·다이얼로그·모달·뷰어 모달 제목에만 쓰며, 본문 메시지 글자는 overlay-message-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 7414:324 Alert, header, title: #1C1F23<br>4224:36893 header, title: #1C1F23<br>3863:861 header, title: #1C1F23<br>3863:862 header, title: #1C1F23 |  |
| `overlay-message-color-fg-default` | `--overlay-message-color-fg-default` | 오버레이 본문 메시지 글자 색으로, 다이얼로그·알림 메시지에 쓰며, 제목은 overlay-title-color-fg-default를 쓴다. | #1C1F23 | color-fg-neutral-strongest → color-gray-900 | confirmed | O | 4224:36893 message: #1C1F23<br>7414:324 Alert, message: #1C1F23 |  |
| `overlay-radius` | `--overlay-radius` | 오버레이 상자의 모서리(16px)로, 알림·다이얼로그·모달·뷰어 모달 상자에만 쓴다. | 16px | radius-xlarge → radius-16 | confirmed | O | 7414:324 모든 변형: 16<br>4224:36893 모든 변형: 16<br>3863:861 모든 변형: 16<br>3863:862 모든 변형: 16 |  |
| `overlay-space-paddingX` | `--overlay-space-padding-x` | 오버레이 상자의 좌우 안쪽 여백(24px)으로, 알림·다이얼로그·모달·뷰어 모달에 쓰며, 위아래 여백은 overlay-space-paddingY(같은 24px)를 쓴다. | 24px | space-24 | confirmed | O | 7414:324 모든 변형: 24<br>4224:36893 모든 변형: 24<br>3863:861 모든 변형: 24<br>3863:862 모든 변형: 24 |  |
| `overlay-space-gap` | `--overlay-space-gap` | 오버레이 상자에서 본문 묶음과 아래 버튼 영역 사이 간격(24px)으로, 알림·다이얼로그·모달·뷰어 모달에 쓴다. | 24px | space-24 | confirmed | O | 7414:324 Alert, root: 24<br>4224:36893 root: 24<br>3863:861 root: 24<br>3863:862 root: 24 |  |
| `overlay-space-paddingY` | `--overlay-space-padding-y` | 오버레이 상자의 위아래 안쪽 여백(24px)으로, 알림·다이얼로그·모달·뷰어 모달에 쓰며, 좌우 여백은 overlay-space-paddingX(같은 24px)를 쓴다. | 24px | space-24 | confirmed | O | 7414:324 모든 변형 위·아래: 24<br>4224:36893 모든 변형 위·아래: 24<br>3863:861 모든 변형 위·아래: 24<br>3863:862 모든 변형 위·아래: 24 |  |
| `overlay-header-space-gap` | `--overlay-header-space-gap` | 오버레이 머리에서 제목과 닫기 버튼 사이 간격(8px)으로, 오버레이 머리에만 쓴다. | 8px | space-8 | confirmed | O | 4224:36893 header: 8<br>3863:861 header: 8<br>3863:862 header: 8 |  |
| `overlay-group-space-gap` | `--overlay-group-space-gap` | 오버레이 버튼 묶음 안 버튼 사이 간격(8px)으로, 다이얼로그 버튼 줄과 모달의 보조·주요 버튼 묶음 안에 쓰며, 모달의 두 묶음 사이는 modal-footer-space-gap을 쓴다. | 8px | space-8 | confirmed | O | 4224:36893 actionGroup: 8<br>3863:861 secondaryActions·primaryActions: 8<br>3863:862 secondaryActions·primaryActions: 8 |  |
| `alert-content-space-gap` | `--alert-content-space-gap` | 알림(alert, 확인 버튼 하나인 짧은 대화상자)의 제목과 메시지 사이 간격(8px)으로, 알림 안에만 쓰며, 다이얼로그(선택지가 여럿인 대화상자)는 dialog-content-space-gap(12px)을 쓴다. | 8px | space-8 | confirmed | O | 7414:324 Alert, contentsGroup(title·message 사이): 8 |  |
| `alert-size-width` | `--alert-size-width` | 알림(alert, 확인 버튼 하나로 사용자 확인만 받는 짧은 대화상자, 닫기 X 없음)의 너비(360px)로, 알림에만 쓰며, 선택지가 여럿이거나 닫기가 있는 대화상자는 다이얼로그(dialog-size-width)를 쓴다. | 360px | size-360 | confirmed | O | 7414:324 모든 변형: 360 |  |
| `alert-shadow` | `--alert-shadow` | 알림 상자의 그림자(medium)로, 알림 상자에만 쓴다. | 0px 2px 20px 0px #00000047 | shadow-medium | confirmed | O | 7414:324 상자: shadow/medium |  |
| `dialog-content-space-gap` | `--dialog-content-space-gap` | 다이얼로그에서 머리(제목)와 본문 메시지를 묶은 영역 안 간격(12px)으로, dialog에만 쓴다. | 12px | space-12 | confirmed | O | 4224:36893 contentGroup: 12 |  |
| `dialog-size-width` | `--dialog-size-width` | 다이얼로그 상자의 너비(360px)로, dialog에만 쓴다. | 360px | size-360 | confirmed | O | 4224:36893 기본: 360 |  |
| `dialog-header-space-gap` | `--dialog-header-space-gap` | 대화상자(dialog) 머리 영역에서 제목과 닫기 버튼 사이 가로 간격(8px)으로, dialog 머리 영역에만 쓴다. | 8px | space-8 | confirmed | O | 4224:36893 header 가로 간격(title–closeBox): 8 |  |
| `dialog-shadow` | `--dialog-shadow` | 다이얼로그 상자의 그림자(medium)로, 다이얼로그 상자에만 쓴다. | 0px 2px 20px 0px #00000047 | shadow-medium | confirmed | O | 4224:36893 상자: shadow/medium |  |
| `viewerModal-viewport-color-bg-default` | `--viewer-modal-viewport-color-bg-default` | 뷰어 모달의 문서·이미지 표시 영역 바탕 색(gray 200)으로, viewerModal 본문 영역에만 쓰며, 오버레이 상자 바탕은 overlay-color-bg-default를 쓴다. | #DCE0E5 | color-gray-200 | confirmed | O | 3863:862 contentGroup > content: #DCE0E5 |  |
| `viewerModal-toolbar-color-bg-default` | `--viewer-modal-toolbar-color-bg-default` | 뷰어 모달 위에 떠 있는 툴바(확대·회전·쪽 이동)의 반투명 흰 바탕 색으로, viewerModal 툴바에만 쓴다. | #FFFFFFCC | color-bg-translucent → color-whiteAlpha-80 | confirmed | O | 3865:800 type=actions·page: #FFFFFFCC |  |
| `viewerModal-toolbar-color-fg-default` | `--viewer-modal-toolbar-color-fg-default` | 뷰어 툴바 쪽 표시의 전체 쪽수 글자 색(gray 700)으로, 툴바 쪽 표시에 쓰며, 현재 쪽은 viewerModal-current-toolbar-color-fg-default, 「/」는 viewerModal-separator-color-fg-default를 쓴다. | #454F59 | color-fg-neutral-strong-default → color-gray-700 | confirmed | O | 3865:800 type=page, totalPages: #454F59 |  |
| `viewerModal-toolbar-radius` | `--viewer-modal-toolbar-radius` | 뷰어 툴바의 모서리(6px)로, viewerModal 툴바에만 쓴다. | 6px | radius-small → radius-6 | confirmed | O | 3865:800 type=actions·page: 6 |  |
| `viewerModal-toolbar-space-paddingX` | `--viewer-modal-toolbar-space-padding-x` | 뷰어 툴바의 좌우 안쪽 여백(12px)으로, viewerModal 툴바에만 쓴다. | 12px | space-12 | confirmed | O | 3865:800 type=actions·page: 12 |  |
| `viewerModal-toolbar-space-gap` | `--viewer-modal-toolbar-space-gap` | 뷰어 툴바 안 아이콘 버튼 사이 간격(8px)으로, viewerModal 툴바에만 쓴다. | 8px | space-8 | confirmed | O | 3865:800 type=actions toolbarGroup, type=page: 8 |  |
| `viewerModal-toolbar-shadow` | `--viewer-modal-toolbar-shadow` | 뷰어 모달 위에 떠 있는 툴바의 그림자(medium)로, 뷰어 툴바에만 쓴다. | 0px 2px 20px 0px #00000047 | shadow-medium | confirmed | O | 규칙: 6-5 |  |
| `viewerModal-toolbar-size-height` | `--viewer-modal-toolbar-size-height` | 뷰어 툴바(아이콘·쪽 표시)의 높이(44px, 고정)로, 내용은 위아래 가운데 정렬하며, viewerModal 툴바에만 쓴다. | 44px | size-44 | confirmed | O | 3865:800 type=actions·page, 높이 고정·가운데 정렬: 44 |  |
| `viewerModal-current-toolbar-color-fg-default` | `--viewer-modal-current-toolbar-color-fg-default` | 뷰어 툴바 쪽 표시의 현재 쪽 번호 글자 색(브랜드)으로, [aria-current=page] 쪽 번호에만 쓴다. | #3617CE | color-fg-brand-strong-default → color-tBlue-600 | confirmed | O | 3865:800 type=page, currentPage: #3617CE |  |
| `viewerModal-separator-color-fg-default` | `--viewer-modal-separator-color-fg-default` | 뷰어 툴바 쪽 표시에서 현재 쪽과 전체 쪽 사이 구분 기호(「/」)의 색(gray 500)으로, 이 구분 기호에만 쓴다. | #8B949E | color-fg-neutral-faint → color-gray-500 | confirmed | O | 3865:800 type=page, "/": #8B949E |  |
| `viewerModal-content-space-gap` | `--viewer-modal-content-space-gap` | 뷰어 모달에서 머리(제목)와 본문을 묶은 영역 안 간격(20px)으로, viewerModal에만 쓴다. | 20px | space-20 | confirmed | O | 3863:862 contentsGroup: 20 |  |
| `viewerModal-footer-space-gap` | `--viewer-modal-footer-space-gap` | 뷰어 모달 아래 버튼 영역에서 보조 버튼 묶음과 주요 버튼 묶음 사이 간격(16px)으로, viewerModal에만 쓰며, 묶음 안 버튼 사이는 overlay-group-space-gap을 쓴다. | 16px | space-16 | confirmed | O | 3863:862 actionsGroup: 16 |  |
| `viewerModal-size-width` | `--viewer-modal-size-width` | 뷰어 모달 상자의 너비(1280px)로, viewerModal에만 쓴다. | 1280px | size-1280 | confirmed | O | 3863:862 기본: 1280 |  |
| `viewerModal-value-space-paddingX` | `--viewer-modal-value-space-padding-x` | 보기 모달 툴바의 쪽수 칸(현재 쪽·전체 쪽 숫자 상자) 좌우 안쪽 여백(4px)으로, 쪽수 칸에만 쓰며 툴바 전체 여백은 viewerModal-toolbar-space-paddingX를 쓴다. | 4px | space-4 | confirmed | O | 3865:800 type=page, currentPageBox·totalPagesBox 좌우: 4 |  |
| `viewerModal-shadow` | `--viewer-modal-shadow` | 뷰어 모달 상자의 그림자(large, 딤 있는 팝업)로, 뷰어 모달 상자에만 쓰며, 위에 떠 있는 툴바는 viewerModal-toolbar-shadow를 쓴다. | 0px 4px 32px 0px #00000052 | shadow-large | confirmed | O | 3863:862 상자: shadow/large |  |
| `modal-content-space-gap` | `--modal-content-space-gap` | 모달에서 머리(제목)와 본문을 묶은 영역 안 간격(20px)으로, modal에만 쓴다. | 20px | space-20 | confirmed | O | 3863:861 contentsGroup: 20 |  |
| `modal-footer-space-gap` | `--modal-footer-space-gap` | 모달 아래 버튼 영역에서 보조 버튼 묶음과 주요 버튼 묶음 사이 간격(16px)으로, modal에만 쓰며, 묶음 안 버튼 사이는 overlay-group-space-gap을 쓴다. | 16px | space-16 | confirmed | O | 3863:861 actionsGroup: 16 |  |
| `modal-small-size-width` | `--modal-small-size-width` | 작은 모달(small)의 너비(720px)로, modal small에만 쓴다. | 720px | size-720 | confirmed | O | 3863:861 size=small: 720 |  |
| `modal-medium-size-width` | `--modal-medium-size-width` | 중간 모달(medium)의 너비(960px)로, modal medium에만 쓴다. | 960px | size-960 | confirmed | O | 3863:861 size=medium: 960 |  |
| `modal-large-size-width` | `--modal-large-size-width` | 큰 모달(large)의 너비(1280px)로, modal large에만 쓴다. | 1280px | size-1280 | confirmed | O | 3863:861 size=large: 1280 |  |
| `modal-shadow` | `--modal-shadow` | 모달 상자의 그림자(large, 딤 있는 팝업)로, 모달 상자에만 쓴다. | 0px 4px 32px 0px #00000052 | shadow-large | confirmed | O | 3863:861 상자: shadow/large |  |

## 참고

- **source**: 피그마 ❖ Dialog·❖ Modal·❖ ViewerModal Components. 테스트 아트보드 없음
- **shadow**: 그림자: alert-shadow·dialog-shadow(→ shadow-medium), modal-shadow·viewerModal-shadow(→ shadow-large), viewerModal-toolbar-shadow(→ shadow-medium)
- **nested**: 닫기 버튼은 button-iconOnly plain large, 뷰어 툴바 버튼은 button-iconOnly plain medium, 아래 버튼은 button-action xlarge, 스크롤바는 scrollbar 토큰을 쓴다
- **height**: 모달 높이는 내용에 따라 정해져 토큰을 만들지 않았다
- **pageBox**: 툴바 쪽 번호 칸(최소 너비 20, 좌우 4)은 부품 안 부품이라 구현값으로 둔다
- **naming**: 부품 group = 버튼 묶음, content = 제목과 본문을 담은 영역, footer = 아래 버튼 영역
- **backdrop**: 모달·다이얼로그 뒤 배경은 overlay-backdrop-color-bg-default(→ color-bg-backdrop, 검정 60%)를 쓴다. 근거는 ❖ Modal·❖ ViewerModal Usage Examples 섹션 배경(3872:1308·3872:1309)이다
- **alert**: Alert(7414:324, 단일 컴포넌트)의 바탕·모서리·여백·간격·그림자·제목 색·메시지 색은 overlay 그룹 토큰을 쓴다. 제목 글자 스타일은 Dialog와 같은 heading/20/700, 메시지는 Dialog와 같은 overlay-message 글자 스타일(body/16/400)이다. Dialog와 다른 값(제목↔메시지 8, 버튼 button-action large)은 의도한 차이다. 너비는 Dialog와 같은 360이다. 버튼이 1개라 actionGroup 간격은 연결하지 않는다
