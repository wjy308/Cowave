import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import getCurrentLocation from "./lib/utils/getCurrentLocation";
import { TimeProvider } from "./context/timeContext";

export default function App({ Component, pageProps }: AppProps) {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    getCurrentLocation()
      .then(({ latitude, longitude }) => setLocation({ latitude, longitude }))
      .catch((error) =>
        console.error("위치 정보를 가져오는 데 실패했습니다:", error)
      );
  }, []);

  if (!location) return <div>위치 정보를 가져오는 중...</div>;

  return (
    <TimeProvider latitude={location.latitude} longitude={location.longitude}>
      <div className="font-sans">
        <Component {...pageProps} />
      </div>
    </TimeProvider>
  );
}
