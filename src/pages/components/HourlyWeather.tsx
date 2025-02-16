import React, { useEffect, useRef, useState } from "react";
import { getLocalTime } from "../lib/api/getLocalTime";
import getCurrentLocation from "../lib/utils/getCurrentLocation";

interface ForecastData {
  time: string;
  TMP: string; // 기온
  POP: string; // 강수확률
  PCP: string; // 강수량
  REH: string; // 습도
  SKY: string; // 하늘 상태 코드
}

interface HourlyForecastProps {
  data: ForecastData[];
}

export default function HourlyWeather({ data }: HourlyForecastProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  let isMouseDown = false;
  let startX = 0;
  let scrollLeft = 0;
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    const fetchLocalTime = async () => {
      const { latitude, longitude } = await getCurrentLocation();
      const localTime = await getLocalTime(latitude, longitude);
      setCurrentTime(parseInt(localTime.slice(0, 2), 10)); // "HH:mm:ss" 형식에서 HH 값 추출
    };
    fetchLocalTime();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDown = true;
    startX = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
  };

  const handleMouseLeave = () => {
    isMouseDown = false;
  };

  const handleMouseUp = () => {
    isMouseDown = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1; // 조정 비율
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current && data.length > 0 && currentTime !== null) {
      const closestHour = data.find(
        (weather) => parseInt(weather.time.slice(0, 2)) >= currentTime
      );
      if (closestHour) {
        const index = data.indexOf(closestHour);
        const scrollPosition =
          (index / data.length) * scrollContainerRef.current.scrollWidth * 0.8; // 30% 지점
        scrollContainerRef.current.scrollLeft = scrollPosition;
        setHighlightedIndex(index); // 현재 시간에 해당하는 인덱스 하이라이트
      }
    }
  }, [data, currentTime]);

  return (
    <div className="py-10 items-center flex flex-col justify-center bg-blue-50">
      <h3 className=" text-[25px]">시간별 예보</h3>
      <div
        className="flex w-[80%] space-x-4 py-2 overflow-x-auto scrollbar-hide "
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {data.map((weather, index) => (
          <div
            key={index}
            className={` min-w-[80px] flex flex-col items-center p-3 rounded-lg shadow-md ${
              highlightedIndex === index ? "bg-blue-300" : "bg-white"
            }`}
          >
            <span className="text-sm font-semibold">
              {formatTime(weather.time)}시
            </span>
            <span className="text-xl">{getSkyStatus(weather.SKY)}</span>
            <span className="text-lg font-bold">{weather.TMP}℃</span>
            <span className="text-sm text-blue-600">{weather.POP}%</span>
            <span className="text-sm text-gray-500">
              {weather.PCP === "강수없음" ? "0" : weather.PCP}mm
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 하늘 상태 코드 변환 함수
function getSkyStatus(skyCode: string) {
  const skyMap: Record<string, string> = {
    맑음: "☀️",
    "구름 많음": "⛅",
    흐림: "☁️",
  };
  return skyMap[skyCode] || "❓";
}

// 시간 포맷 함수 (1300 -> 13)
function formatTime(time: string) {
  return time.slice(0, 2); // 시간의 첫 두 자리를 반환
}
