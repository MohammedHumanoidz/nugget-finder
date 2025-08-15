import { useState, useMemo } from 'react';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayNumber: number;
  dateString: string; // YYYY-MM-DD format
}

export interface UseCalendarProps {
  initialDate?: Date;
}

export function useCalendar({ initialDate = new Date() }: UseCalendarProps = {}) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Navigation functions
  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToPrevMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get current month/year display string
  const currentMonthYear = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(currentDate);
  }, [currentDate]);

    // Helper function to format date to YYYY-MM-DD
    const formatDateToString = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

  // Generate calendar days for the current view
  const calendarDays = useMemo((): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of the month and what day of week it starts on
    const firstDayOfMonth = new Date(year, month, 1);
    const startDate = new Date(firstDayOfMonth);
    
    // Go back to the start of the week (Sunday = 0)
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // Calculate how many days we need to show (6 weeks = 42 days)
    const days: CalendarDay[] = [];
    const today = new Date();
    const todayString = formatDateToString(today);
    
    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = currentDay.getMonth() === month;
      const dateString = formatDateToString(currentDay);
      const isToday = dateString === todayString;
      
      days.push({
        date: currentDay,
        isCurrentMonth,
        isToday,
        dayNumber: currentDay.getDate(),
        dateString
      });
    }
    
    return days;
  }, [currentDate]);

  // Check if a date is selected
  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return formatDateToString(date) === formatDateToString(selectedDate);
  };

  return {
    // State
    currentDate,
    selectedDate,
    currentMonthYear,
    calendarDays,
    
    // Actions
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    setSelectedDate,
    
    // Utilities
    formatDateToString,
    isDateSelected
  };
}
