import axios from "axios";
import { KAKAO_KEY } from "../lib/constants";

// 좌표를 입력받아 행정동 주소를 반환하는 함수
// 기상청에서 행정동 데이터를 따로 제공해주지 않지 때문에 카카오 맵으로 국내 행정동 데이터 불러옴
interface RegionData {
  address_name: string;
  code: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
  region_4depth_name?: string;
  region_type: string;
  x: number;
  y: number;
}

const getAddressFromCoords = async (
  latitude: number,
  longitude: number
): Promise<RegionData> => {
  try {
    const url = `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${longitude}&y=${latitude}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_KEY}`,
      },
    });

    const data = response.data;

    if (data.documents.length === 0) {
      throw new Error("주소 정보를 찾을 수 없습니다.");
    }

    const region: RegionData = data.documents[1] || data.documents[0];
    return region;
  } catch (error) {
    console.error("좌표 → 주소 변환 실패:", error);
    throw new Error("주소 정보를 가져올 수 없음");
  }
};

export default getAddressFromCoords;
