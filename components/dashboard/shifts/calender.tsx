import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
interface CalendarProps {
  setSelectedDate: (date: Dayjs) => void;
  selectedDate: Dayjs | null;
}


const Calendar: React.FC<CalendarProps> = ({ setSelectedDate, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());

  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");

  const startOfCalendar = startOfMonth.startOf("week");
  const endOfCalendar = endOfMonth.endOf("week");

  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => prevDate.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => prevDate.add(1, "month"));
  };

  const handleDateClick = (date: Dayjs) => {
    setSelectedDate(date);
  };

  // Create an array of dates from startOfCalendar to endOfCalendar
  const datesArray = Array.from(
    { length: endOfCalendar.diff(startOfCalendar, "day") + 1 },
    (_, i) => startOfCalendar.add(i, "day")
  );

  const renderDaysOfWeek = () =>
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
      <div
        key={day}
        className={`py-2 sm:py-3.5 border-r border-indigo-200 bg-indigo-50 flex items-center justify-center text-xs sm:text-sm font-medium text-indigo-600 ${
          index === 0 ? "rounded-tl-lg" : ""
        } ${index === 6 ? "rounded-tr-lg" : ""}`}
      >
        {day}
      </div>
    ));

  const renderDates = () =>
    datesArray.map((day) => {
      const isCurrentMonth = day.month() === currentDate.month();
      
      const isSelected = selectedDate && day.isSame(selectedDate, "day");
      const isToday = day.isSame(dayjs(), "day");

      return (
        <div
          key={day.toString()}
          onClick={() => handleDateClick(day)}
          className={`flex aspect-square items-center justify-center p-2 sm:p-3.5 cursor-pointer border-r border-b border-indigo-200 transition-all duration-300 ${
            isCurrentMonth ? "bg-white" : "bg-gray-50"
          } ${isSelected ? "bg-gray-200" : ""}`}
        >
          <span
            className={`text-xs sm:text-sm font-semibold flex items-center justify-center w-6 h-6 rounded-full ${
              isToday
                ? "bg-indigo-600 text-white"
                : isCurrentMonth
                ? "text-gray-900"
                : "text-gray-400"
            }`}
          >
            {day.date()}
          </span>
        </div>
      );
    });

  return (
    <div className="col-span-12 xl:col-span-7">
      <div className="bg-gradient-to-b from-white/25 to-white xl:bg-white rounded-lg p-6 shadow-md">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center w-full justify-between">
           
              <button
                onClick={handlePrevMonth}
                className="text-indigo-600 p-1 rounded transition duration-300 hover:bg-indigo-600 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M10.0002 11.9999L6 7.99971L10.0025 3.99719"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <h5 className="text-xl font-semibold  text-gray-900 ">
              {currentDate.format("MMMM YYYY")}
            </h5>
              <button
                onClick={handleNextMonth}
                className="text-indigo-600 p-1 rounded transition duration-300 hover:bg-indigo-600 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M6.00236 3.99707L10.0025 7.99723L6 11.9998"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
          </div>
        </div>
        <div className="border border-indigo-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 border-b border-indigo-200">
            {renderDaysOfWeek()}
          </div>
          <div className="grid grid-cols-7">{renderDates()}</div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
