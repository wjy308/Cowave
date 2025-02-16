export default function getAddressFromCoords(
  latitude: number,
  longitude: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.kakao || !window.kakao.maps) {
      reject("카카오 맵 API가 로드되지 않았습니다.");
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    const coord = new window.kakao.maps.LatLng(latitude, longitude);

    geocoder.coord2Address(
      coord.getLng(),
      coord.getLat(),
      (result, status: number) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const address = result[0]?.address?.region_3depth_name; // 행정동 정보 추출
          resolve(address || "알 수 없음");
        } else {
          reject("주소를 가져오는 데 실패했습니다.");
        }
      }
    );
  });
}
