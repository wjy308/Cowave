import React, { createContext, useContext, useEffect, useState } from "react";
import { getLocalTime } from "@/lib/api/getLocalTime";

interface TimeContextType {
  currentTime: string | null;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export const TimeProvider: React.FC<{
  latitude: number;
  longitude: number;
  children: React.ReactNode;
}> = ({ latitude, longitude, children }) => {
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchTime = async () => {
      const localTime = await getLocalTime(latitude, longitude);
      setCurrentTime(localTime.slice(0, 5)); // "HH:mm:ss" 형식에서 HH:MM 값 추출
    };

    // 최초 시간 불러오기
    fetchTime();

    // 1분마다 시간 갱신
    const interval = setInterval(fetchTime, 60000);

    // 컴포넌트가 unmount 될 때 interval을 정리
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  return (
    <TimeContext.Provider value={{ currentTime }}>
      {children}
    </TimeContext.Provider>
  );
};

export const useTime = () => {
  const context = useContext(TimeContext);
  if (!context) {
    throw new Error("context 에러입니다!");
  }
  return context;
};
