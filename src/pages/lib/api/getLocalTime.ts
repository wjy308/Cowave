import { GOOGLE_MAP_KEY } from "../constants";

// TimeZone 조건을 위한 접속한 사용자의 좌표 값 기준 시간 확인
// 구글 맵 api 활용
export const getLocalTime = async (latitude: number, longitude: number) => {
  try {
    // Google Timezone API 호출
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${Math.floor(
        Date.now() / 1000
      )}&key=${GOOGLE_MAP_KEY}`
    );
    const data = await response.json();

    if (data.status === "OK") {
      const timeZone = data.timeZoneId;
      const now = new Date();

      // `24시간제` 형식으로 변환
      const formattedTime = new Intl.DateTimeFormat("ko-KR", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // 24시간제 설정
      }).format(now);

      return formattedTime;
    }

    return "시간을 가져올 수 없음";
  } catch (error) {
    console.error("시간대 정보를 가져오는 데 실패했습니다.", error);
    return "시간을 가져올 수 없음";
  }
};
