// 풍향을 각도에 맞는 아이콘으로 변환하는 함수
export default function getWindDirectionIcon(degree: number): string {
  if (degree >= 337.5 || degree < 22.5) return "⬆️"; // 북쪽
  if (degree >= 22.5 && degree < 67.5) return "↗️"; // 북동쪽
  if (degree >= 67.5 && degree < 112.5) return "➡️"; // 동쪽
  if (degree >= 112.5 && degree < 157.5) return "↘️"; // 남동쪽
  if (degree >= 157.5 && degree < 202.5) return "⬇️"; // 남쪽
  if (degree >= 202.5 && degree < 247.5) return "↙️"; // 남서쪽
  if (degree >= 247.5 && degree < 292.5) return "⬅️"; // 서쪽
  if (degree >= 292.5 && degree < 337.5) return "↖️"; // 북서쪽
  return "❓"; // 알 수 없음
}
