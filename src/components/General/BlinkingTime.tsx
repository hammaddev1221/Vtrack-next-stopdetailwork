import React, { useState, useEffect } from "react";
import moment from "moment-timezone"
const BlinkingTime = ({ timezone, dateFormat,timeFormat }: any) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      let currentTime;

      if (timezone) {
        currentTime = 
        moment(new Date())
        .tz(timezone)
        .format(dateFormat+" "+timeFormat)       

      } else {
        currentTime =   moment(new Date())        
        .format(dateFormat+" "+timeFormat)   
      }

      setTime(currentTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [timezone]);

  return <p>{time}</p>;
};

export default BlinkingTime;
