# 컴포넌트 토큰: datePicker

> DS 토큰 원본에서 생성한 문서다. 직접 고치지 않고, 변경이 필요하면 DS에 요청한다.

## 컴포넌트

| 컴포넌트 | 피그마 컴포넌트 세트 |
| --- | --- |
| datePicker | 5711:15939 |

## 토큰 (1개: confirmed 1)

| 토큰 | CSS | 설명 | 값 | 참조 | 상태 | 운영 | 피그마 근거 | 미결 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `datePicker-space-offset` | `--date-picker-space-offset` | 날짜 필드와 그 아래에 띄우는 달력 사이 거리(4px)로, datePicker에만 쓰며, 달력이 위로 열리면 아래쪽에 두고, 달력을 따로 둘 때는 쓰지 않는다. | 4px | space-4 | confirmed | O | 5711:15939 mode=date·dateTime·dateRange·dateTimeRange, DateField–Calendar: 4 |  |

## 참고

- **source**: 피그마 ❖ DatePicker(5711:15937)
- **decisions**: 필드–달력 사이 4px를 datePicker-space-offset으로 둔다
