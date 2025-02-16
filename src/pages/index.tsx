import WeatherCard from "@/components/WeatherCard";

export default function Home() {
  return (
    <div
      className="relative w-full h-[350px] bg-cover bg-center"
      style={{ backgroundImage: `url('/cloud.png')` }}
    >
      <div className="justify-center flex py-10"></div>
      <WeatherCard />
    </div>
  );
}
