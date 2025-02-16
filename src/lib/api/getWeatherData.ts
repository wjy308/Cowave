import {
  SERVICE_KEY,
  BASE_URL_WEATHER,
  BASE_URL_WEEKLY_WEATHER,
} from "../constants";

interface WeatherDataType {
  baseDate: string;
  baseTime: string;
  nx: string;
  ny: string;
}

interface WeeklyWeatherDataType {
  regId: string;
  tmFc: string;
}
export const getWeatherData = async ({
  baseDate,
  baseTime,
  nx,
  ny,
}: WeatherDataType) => {
  const queryParams = new URLSearchParams({
    serviceKey: SERVICE_KEY || "",
    numOfRows: String(5000), // 모든 데이터를 받기 위해
    pageNo: String(1),
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
    dataType: "JSON",
  });

  const response = await fetch(`${BASE_URL_WEATHER}?${queryParams}`);
  if (!response.ok) throw new Error("날씨 정보를 가져오는 데 실패했습니다.");
  return response.json();
};

export const getWeeklyWeatherData = async ({
  regId,
  tmFc,
}: WeeklyWeatherDataType) => {
  const queryParams = new URLSearchParams({
    serviceKey: SERVICE_KEY || "",
    pageNo: String(1),
    numOfRows: String(50),
    dataType: "JSON",
    regId: String(regId),
    tmFc: String(tmFc),
  });

  const response = await fetch(`${BASE_URL_WEEKLY_WEATHER}?${queryParams}`);

  if (!response.ok) throw new Error("날씨 정보를 가져오는 데 실패했습니다.");
  return response.json();
};
