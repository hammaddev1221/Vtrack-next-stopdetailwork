import { useEffect, useState } from "react";
import { getLoginTime } from "@/utils/time";
const TimeCounter = () => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  useEffect(() => {
    const loginTime = getLoginTime();
    if (loginTime) {
      const interval = setInterval(() => {
        const elapsedTime = new Date().getTime() - loginTime;
        setCurrentTime(elapsedTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, []);
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  };
  return <div>{formatTime(currentTime)}</div>;
};
export default TimeCounter;
