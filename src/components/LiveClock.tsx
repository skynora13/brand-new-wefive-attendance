"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return <span>Loading date & time...</span>;
  }

  return (
    <span>
      {format(time, "EEEE, do MMMM yyyy ' | ' hh:mm:ss a")} (IST)
    </span>
  );
}
