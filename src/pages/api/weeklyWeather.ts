import { getWeeklyWeatherData } from "../lib/api/getWeatherData";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "GET 요청이 아닙니다." });
  }

  try {
    const { regId, tmFc } = req.query;

    // 쿼리 파라미터가 string 타입이 아닐 경우, 오류를 반환
    if (typeof regId !== "string" || typeof tmFc !== "string") {
      return res.status(400).json({ error: "Invalid query parameters." });
    }

    const data = await getWeeklyWeatherData({ regId, tmFc });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error });
  }
}
