/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { getLatestTmFc } from "../lib/utils/time";

interface WeeklyWeatherProps {
  weeklyWeather: object;
  regionName: string;
}

interface Day {
  date: string;
  minTemp: number;
  maxTemp: number;
}

export default function WeeklyWeather({
  weeklyWeather,
  regionName,
}: WeeklyWeatherProps) {
  const [regionCode, setRegionCode] = useState("");
  const [extraWeather, setExtraWeather] = useState(null);
  useEffect(() => {
    const fetchRegionCode = async () => {
      try {
        const response = await fetch("/regionCode.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as string[][];

        for (const row of jsonData) {
          const regionA = row[0]; // A열 (지역명)
          const regionB = row[1]; // B열 (코드)

          if (
            regionA &&
            regionB &&
            regionName.includes(regionA.replace(/\(.*?\)/g, ""))
          ) {
            setRegionCode(regionB);
            break;
          }
        }
      } catch (error) {
        console.error("엑셀 파일 읽기 실패:", error);
      }
    };

    fetchRegionCode();
  }, [regionName]);

  useEffect(() => {
    if (!regionCode) return;

    async function fetchWeeklyWeather() {
      try {
        const params = new URLSearchParams({
          regId: regionCode,
          tmFc: getLatestTmFc(),
        });
        const response = await fetch(`/api/weeklyWeather?${params}`);
        const data = await response.json();
        setExtraWeather(data.response.body.items.item[0]); // 첫 번째 아이템 저장
      } catch (error) {
        console.error("주간 날씨 데이터 가져오기 실패:", error);
      }
    }
    fetchWeeklyWeather();
  }, [regionCode]);

  return (
    <div className="w-full p-4 bg-blue-50">
      <span className="block text-lg font-semibold mb-2">📅 주간 날씨</span>

      {/* 데이터를 5개씩 나눔 */}
      {chunkArray(
        [
          ...formatWeeklyWeather(weeklyWeather),
          ...generateExtraWeather(extraWeather),
        ],
        5
      ).map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-between gap-4 mb-4">
          {row.map((day: Day, index) => (
            <div
              key={index}
              className="flex flex-col items-center w-1/5 p-4 bg-white rounded-xl shadow-md"
            >
              <p className="text-lg font-bold">{day.date}</p>
              <p className="text-sm text-gray-600">
                📉최저온도: {day.minTemp}℃
              </p>
              <p className="test-sm text-gray-600">
                📈최고온도: {day.maxTemp}℃
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// 배열을 5개씩 나누는 함수
function chunkArray(array: any[], size: number): any[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

// weeklyWeather 날짜 포맷 변경 함수
function formatWeeklyWeather(weeklyWeather: any) {
  return weeklyWeather.slice(0, 4).map((day: { date: string }) => ({
    ...day,
    date: formatDate(day.date), // 날짜 변환 적용
  }));
}

// "20250216" → "2월 16일" 형식으로 변환하는 함수
function formatDate(dateString: string) {
  if (!dateString || dateString.length !== 8) return dateString;
  const month = parseInt(dateString.substring(4, 6), 10);
  const day = parseInt(dateString.substring(6, 8), 10);
  return `${month}월 ${day}일`;
}

//5일 이후 데이터 추가
function generateExtraWeather(extraWeather: { [x: string]: any } | null) {
  if (!extraWeather) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 5);

  return Array.from({ length: 6 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const formattedDate = `${date.getMonth() + 1}월 ${date.getDate()}일`;

    return {
      date: formattedDate,
      minTemp: extraWeather[`taMin${i + 5}`], // taMin5부터 시작
      maxTemp: extraWeather[`taMax${i + 5}`], // taMax5부터 시작
    };
  });
}
