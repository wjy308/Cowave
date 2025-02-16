import { GOOGLE_MAP_KEY } from "../constants";

// TimeZone 조건을 위한 접속한 사용자의의 좌표 값 기준 날짜 확인
// 구글 맵 api 활용
export const getLocalTimeWithDate = async (): Promise<{
  date: string;
  time: string;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("브라우저가 위치 정보를 지원하지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

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

            //24시간제 시간 가져오기 (HH:mm)
            const formattedTime = new Intl.DateTimeFormat("ko-KR", {
              timeZone,
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }).format(now);

            // 날짜 가져오기 (YYYYMMDD)
            const formattedDate = new Intl.DateTimeFormat("ko-KR", {
              timeZone,
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
              .format(now)
              .replace(/[^0-9]/g, ""); // YYYY.MM.DD → YYYYMMDD 형식으로 변환

            resolve({ date: formattedDate, time: formattedTime });
          } else {
            reject("시간 정보를 가져올 수 없습니다.");
          }
        } catch (error) {
          console.error(" 시간 정보를 가져오는 데 실패했습니다.", error);
          reject("시간 정보를 가져올 수 없습니다.");
        }
      },
      (error) => {
        console.error("위치 정보를 가져오는 데 실패했습니다.", error);
        reject("위치 정보를 가져올 수 없습니다.");
      }
    );
  });
};
