declare module 'react-native-calendar-picker' {
  import { ComponentType } from 'react';
  
  interface CalendarPickerProps {
    selectedStartDate?: Date;
    selectedEndDate?: Date;
    minDate?: Date;
    maxDate?: Date;
    width?: number;
    height?: number;
    selectedDayColor?: string;
    selectedDayTextColor?: string;
    onDateChange: (date: Date) => void;
    [key: string]: any;
  }

  const CalendarPicker: ComponentType<CalendarPickerProps>;
  export default CalendarPicker;
} 