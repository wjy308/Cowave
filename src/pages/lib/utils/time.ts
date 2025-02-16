import { getLocalTimeWithDate } from "../api/getLocalTimeWithDate";

export async function getBaseTime(): Promise<string> {
  try {
    const { time } = await getLocalTimeWithDate(); // 현지 시간 가져오기
    const hours = parseInt(time.split(":")[0], 10); // "HH:mm" → HH 값만 추출

    // Base_time 설정
    if (hours >= 0 && hours < 3) {
      return "2300";
    } else if (hours >= 3 && hours < 6) {
      return "0200";
    } else if (hours >= 6 && hours < 9) {
      return "0500";
    } else if (hours >= 9 && hours < 12) {
      return "0800";
    } else if (hours >= 12 && hours < 15) {
      return "1100";
    } else if (hours >= 15 && hours < 18) {
      return "1400";
    } else if (hours >= 18 && hours < 21) {
      return "1700";
    } else if (hours >= 21 && hours <= 23) {
      return "2000";
    } else {
      return "2300";
    }
  } catch (error) {
    console.error("getBaseTime 오류:", error);
    return "2300"; // 기본값 설정
  }
}

export async function getBaseDateAndTime(): Promise<{
  baseDate: string;
  baseTime: string;
}> {
  const { date } = await getLocalTimeWithDate();
  let baseDate = date;
  const baseTime = await getBaseTime();

  if (baseTime === "2300") {
    // 받은 date 값을 Date 객체로 변환
    const dateObj = new Date(
      `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
    );

    // 하루 빼기
    dateObj.setDate(dateObj.getDate() - 1);

    // 새로 계산된 날짜를 'yyyyMMdd' 형식으로 포맷팅
    baseDate = `${dateObj.getFullYear()}${(dateObj.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${dateObj.getDate().toString().padStart(2, "0")}`;
  }

  return { baseDate, baseTime };
}

export function getLatestTmFc() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 월 (1월 = 0)
  const day = String(now.getDate()).padStart(2, "0"); // 일
  const hours = now.getHours();

  // 현재 시간이 06:00 이전이면, 하루 전 날짜를 사용
  if (hours < 6) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const prevYear = yesterday.getFullYear();
    const prevMonth = String(yesterday.getMonth() + 1).padStart(2, "0");
    const prevDay = String(yesterday.getDate()).padStart(2, "0");
    return `${prevYear}${prevMonth}${prevDay}0600`;
  }

  // 06:00 이후면 오늘 날짜의 0600 데이터 사용
  return `${year}${month}${day}0600`;
}
