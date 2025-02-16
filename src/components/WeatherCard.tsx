/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import getCurrentLocation from "@/lib/utils/getCurrentLocation";
import latLonToGrid from "@/lib/utils/latLonToGrid";
import { getBaseDateAndTime } from "@/lib/utils/time";
import HourlyWeather from "./HourlyWeather";
import getWindDirectionIcon from "@/lib/utils/getWindDirectionIcon";
import WeeklyWeather from "./WeeklyWeather";
import getAddressFromCoords from "@/pages/api/getAddressFromCoords";
import { useTime } from "@/context/timeContext";
import { getLocalTimeWithDate } from "@/lib/api/getLocalTimeWithDate";
import Link from "next/link";

declare global {
  interface Window {
    kakao: any;
  }
}

interface WeatherItem {
  category: string | undefined;
  fcstValue: string | number;
  fcstTime: string;
}

interface NowWeather {
  temperature: string | number;
  humidity: string | number;
  sky: string;
  minTemp: string | number;
  maxTemp: string | number;
  windDirection: string | number;
  windSpeed: string | number;
}

const getSkyStatus = (code: string) => {
  const skyTypes: Record<string, string> = {
    "1": "맑음",
    "3": "구름 많음",
    "4": "흐림",
  };
  return skyTypes[code] || "알 수 없음";
};

function convertToRoundedTime(time: string): string {
  // 'HHMM' 형식에서 분 부분을 '00'으로 변경
  const hours = time.slice(0, 2); // 시간 부분 추출
  return `${hours}00`; // "HH00" 형식으로 반환
}

export default function WeatherCard() {
  const [currentWeather, setCurrentWeather] = useState<NowWeather | undefined>(
    undefined
  );
  const [hourlyWeather, setHourlyWeather] = useState([]);
  const [weeklyWeather, setWeeklyWeather] = useState([]);
  const [location, setLocation] = useState("");
  const [regionName, setRegionName] = useState("");
  const { currentTime } = useTime();

  useEffect(() => {
    async function fetchWeather() {
      try {
        const { latitude, longitude } = await getCurrentLocation();
        const { nx, ny } = latLonToGrid(latitude, longitude);

        const { baseDate, baseTime } = await getBaseDateAndTime();
        const params = new URLSearchParams({
          baseDate,
          baseTime,
          nx: String(nx),
          ny: String(ny),
        });
        const response = await fetch(`/api/weather?${params}`);
        const data = await response.json();

        const items = data.response.body.items.item;
        const { time } = await getLocalTimeWithDate();
        const roundedTime = convertToRoundedTime(time);
        const now: NowWeather = {
          temperature:
            items.find(
              (i: WeatherItem) =>
                i.category === "TMP" && i.fcstTime === roundedTime
            )?.fcstValue || "-",
          humidity:
            items.find(
              (i: WeatherItem) =>
                i.category === "REH" && i.fcstTime === roundedTime
            )?.fcstValue || "-",
          sky: getSkyStatus(
            items.find(
              (i: WeatherItem) =>
                i.category === "SKY" && i.fcstTime === roundedTime
            )?.fcstValue || "1"
          ),
          minTemp:
            items.find((i: WeatherItem) => i.category === "TMN")?.fcstValue ||
            "-",
          maxTemp:
            items.find((i: WeatherItem) => i.category === "TMX")?.fcstValue ||
            "-",
          windDirection: items.find(
            (i: WeatherItem) =>
              i.category === "VEC" && i.fcstTime === roundedTime
          )?.fcstValue
            ? getWindDirectionIcon(
                Number(
                  items.find(
                    (i: WeatherItem) =>
                      i.category === "VEC" && i.fcstTime === roundedTime
                  )?.fcstValue
                )
              )
            : "-",
          windSpeed:
            items.find(
              (i: WeatherItem) =>
                i.category === "WSD" && i.fcstTime === roundedTime
            )?.fcstValue || "-",
        };

        setCurrentWeather(now);

        const hourly = items
          .filter((i: any) =>
            ["TMP", "POP", "PCP", "REH", "SKY"].includes(i.category)
          )
          .reduce((acc: any, item: any) => {
            const key = `${item.fcstDate}${item.fcstTime}`; // 날짜 + 시간 조합으로 구분
            if (!acc[key])
              acc[key] = { date: item.fcstDate, time: item.fcstTime };
            acc[key][item.category] =
              item.category === "SKY"
                ? getSkyStatus(item.fcstValue)
                : item.fcstValue;
            return acc;
          }, {});

        setHourlyWeather(Object.values(hourly));

        //주간 날씨
        const today = new Date();
        const todayString = `${today.getFullYear()}${String(
          today.getMonth() + 1
        ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

        const weekly = items.reduce((acc: any, item: any) => {
          const date = item.fcstDate;

          // 오늘 날짜 데이터는 제외
          if (date === todayString) return acc;

          if (!acc[date])
            acc[date] = {
              date,
              minTemp: "-",
              maxTemp: "-",
              sky08: "-",
              sky16: "-",
            };

          if (item.category === "TMN") acc[date].minTemp = item.fcstValue;
          if (item.category === "TMX") acc[date].maxTemp = item.fcstValue;
          if (item.category === "SKY" && item.fcstTime === "0600")
            acc[date].sky08 = getSkyStatus(item.fcstValue);
          if (item.category === "SKY" && item.fcstTime === "1500")
            acc[date].sky16 = getSkyStatus(item.fcstValue);

          return acc;
        }, {});

        setWeeklyWeather(Object.values(weekly)); // 가공된 데이터를 상태에 저장

        const address = await getAddressFromCoords(latitude, longitude);
        if (address.region_3depth_name) {
          setLocation(address.region_3depth_name);
          setRegionName(address.address_name);
        } else {
          setLocation(address.region_2depth_name);
          setRegionName(address.address_name);
        }
      } catch (error) {
        console.error("위치 정보를 가져오는 데 실패했습니다.", error);
      }
    }

    fetchWeather();
  }, []);

  return (
    <div>
      <div className="flex flex-col items-center mb-10 ">
        <div className="pt-5 pb-5 flex w-[45%] justify-center gap-10 text-[23px] text-white  bg-black bg-opacity-50 rounded-xl">
          <div>
            <p className="mb-2">{location}</p>
            <p>현재 시간</p>
            <p className="text-[50px] mt-[-15px] mb-4"> {currentTime}</p>
            <p>🌡️ 온도: {currentWeather?.temperature}℃</p>
          </div>

          <div>
            {currentWeather ? (
              <div className="flex align-middle flex-col">
                <p>☁️ 하늘 상태: {currentWeather.sky}</p>
                <p>💧 습도: {currentWeather.humidity}%</p>
                <p>📉 최저 온도: {currentWeather.minTemp}℃</p>
                <p>📈 최고 온도: {currentWeather.maxTemp}℃</p>
                <p>🌀 풍향: {currentWeather.windDirection}</p>
                <p>💨 풍속: {currentWeather.windSpeed} m/s</p>
              </div>
            ) : (
              <p>날씨 정보를 불러오는 중...</p>
            )}
          </div>
        </div>
      </div>
      <HourlyWeather data={hourlyWeather} />
      <WeeklyWeather weeklyWeather={weeklyWeather} regionName={regionName} />
      <div className="text-[20px]">
        <Link href={`https://www.data.go.kr/iim/api/selectAPIAcountView.do`}>
          기상청_단기예보 조회서비스 ((구)_동네예보)<br></br>
        </Link>
        <Link href={`https://www.data.go.kr/data/15059468/openapi.do`}>
          기상청_중기예보
        </Link>
        <p>사용 api: 카카오 맵 / 구글 맵</p>
      </div>
    </div>
  );
}
