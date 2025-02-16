export default function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation이 지원되지 않는 브라우저입니다."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      (error) => {
        if (error.code === 1) {
          alert("위치 정보 제공을 허용해야 현재 위치를 확인할 수 있습니다!");
        }
        reject(
          new Error(` 위치 정보를 가져오는 데 실패했습니다: ${error.message}`)
        );
      },
      {
        enableHighAccuracy: true, // GPS 정밀도 향상
        maximumAge: 0, // 항상 최신 위치 가져오기
      }
    );
  });
}
