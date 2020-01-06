import React, { useEffect } from "react";
import FullCalendar from "@fullcalendar/react";

const ScheduleCalandar = props => {
  useEffect(() => {
    console.log(FullCalendar);
  }, []);
  return <FullCalendar />;
};

export default ScheduleCalandar;
