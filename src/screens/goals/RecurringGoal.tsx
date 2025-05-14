import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  // ScrollView,
  Platform,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { getStoredUser, saveRecurringGoal, saveDailyPlan } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TimePicker from '../../components/TimePicker';
import moment from 'moment';
import { getDailyPlans } from '../../services/api';
import Layout from '../../components/Layout';
import ProgressIndicator from '../../components/ProgressIndicator';
import CustomSwitch from '../../components/CustomSwitch';
import { Shadow } from 'react-native-shadow-2';
import VerticalPicker from '../../components/VerticalPicker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecurringGoal'>;
type RouteType = RouteProp<RootStackParamList, 'RecurringGoal'>;

type DefineTaskParams = {
  taskType: 'recurring' | 'daily' | 'long-term' | 'custom';
  gender: 'male' | 'female';
  goalTitle: string;
  category?: string;
  existingChecklist?: {
    items: { id: string; text: string; completed: boolean; }[];
    successCondition: 'all' | 'custom';
    customCount?: number;
    note: string;
  };
  target?: string;
  selectedUnit?: string;
  evaluationType?: 'yesno' | 'timer' | 'checklist' | 'numeric';
};

type SelectCategoryParams = {
  taskType: 'recurring' | 'custom' | 'long-term' | 'daily';
  gender: 'male' | 'female';
  goalTitle?: string;
  isFromAdd?: boolean;
  isFromDailyPlan?: boolean;
  selectedOption?: string;
  category?: string;
  checklist?: any;
  target?: string;
  selectedUnit?: string;
};

type SelectUnitParams = {
  gender?: 'male' | 'female';
  goalTitle?: string;
  category?: string;
  target?: string;
  checklist?: any;
  selectedUnit?: string;
};

type SetupGoalViewProps = {
  goalTitle: string;
  note: string;
  onGoalTitleChange: (text: string) => void;
  onNoteChange: (text: string) => void;
  onClose: () => void;
  category: string;
  onUpdateCategory: () => void;
  checklist?: any;
  onSave: (goalData: any) => void;
  target: string;
  onTargetChange: (text: string) => void;
  selectedUnit: string;
  onOpenTarget: () => void;
  onPriorityChange?: (priority: string) => void;
  repetition?: {
    isRecurring: boolean;
    selectedOption: RecurringOption;
    selectedDays: DaysState;
    timesPerDay: number;
    selectedDate: Date;
    periodicValue: number;
    periodicUnit: number;
    selectedMonth: string;
    weekOfMonth: string;
    dayOfWeek: string;
  };
  onRepetitionChange: (repetitionData: {
    isRecurring: boolean;
    selectedOption: RecurringOption;
    selectedDays: DaysState;
    timesPerDay: number;
    selectedDate: Date;
    periodicValue: number;
    periodicUnit: number;
    selectedMonth: string;
    weekOfMonth: string;
    dayOfWeek: string;
  }) => void;
  duration: {
    isAllDay: boolean;
    hours: number;
    minutes: number;
  };
  onDurationChange: (durationData: {
    isAllDay: boolean;
    hours: number;
    minutes: number;
  }) => void;
  blockTime: {
    startTime: {
      hour: number;
      minute: number;
      period: 'AM' | 'PM';
    };
    endTime: {
      hour: number;
      minute: number;
      period: 'AM' | 'PM';
    };
  } | null;
  onBlockTimeChange: (blockTimeData: {
    startTime: {
      hour: number;
      minute: number;
      period: 'AM' | 'PM';
    };
    endTime: {
      hour: number;
      minute: number;
      period: 'AM' | 'PM';
    };
  }) => void;
};

type DayType = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
type DaysState = Record<DayType, boolean>;

type RecurringOption = 'Daily' | 'Weekly' | 'Monthly' | 'Periodic' | 'One-Time' | 'Specific Days' | 'Yearly';

type FormData = {
  goalTitle: string;
  note: string;
  category: string;
  checklist: {
    items: Array<{ id: string; text: string; completed: boolean }>;
    successCondition: 'all' | 'custom';
    customCount?: number;
    note: string;
  };
  target: string;
  selectedUnit: string;
  repetition?: {
    isRecurring: boolean;
    selectedOption: RecurringOption;
    selectedDays: DaysState;
    timesPerDay: number;
    selectedDate: Date;
    periodicValue: number;
    periodicUnit: number;
    selectedMonth: string;
    weekOfMonth: string;
    dayOfWeek: string;
  };
  duration: {
    isAllDay: boolean;
    hours: number;
    minutes: number;
  };
  priority: string;

  addToCalendar: boolean;
  addReminder: boolean;
  addPomodoro: boolean;
  startTime: string;
  endTime: string;
  frequency: string;
  reminder: boolean;
  reminderTime: string;
  linkedGoalId?: string;
  blockTime: {
    startTime: {
      hour: number;
      minute: number;
      period: 'AM' | 'PM';
    };
    endTime: {
      hour: number;
      minute: number;
      period: 'AM' | 'PM';
    };
  } | null;
};

type BlockTimeType = {
  startTime: {
    hour: number;
    minute: number;
    period: 'AM' | 'PM';
  };
  endTime: {
    hour: number;
    minute: number;
    period: 'AM' | 'PM';
  };
} | null;

const FORM_DATA_KEY = '@recurring_goal_form_data';

const Calendar = ({ selectedDate, onDateSelect }: { selectedDate: Date, onDateSelect: (date: Date) => void }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateDates = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const dates: (number | null)[] = Array(firstDay).fill(null);
    
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(i);
    }

    const remainingDays = 42 - dates.length;
    dates.push(...Array(remainingDays).fill(null));

    return dates;
  };

  const isSelectedDate = (date: number) => {
    return selectedDate.getDate() === date &&
           selectedDate.getMonth() === currentMonth.getMonth() &&
           selectedDate.getFullYear() === currentMonth.getFullYear();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (date: number) => {
    onDateSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date));
  };

  return (
    <View style={styles.calendar}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Icon name="chevron-left" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.calendarMonth}>
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Text key={index} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      <View style={styles.datesContainer}>
        {generateDates().map((date, index) => (
          date ? (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateButton,
                isSelectedDate(date) && styles.selectedDateButton
              ]}
              onPress={() => handleDateSelect(date)}
            >
              <Text style={[
                styles.dateText,
                isSelectedDate(date) && styles.selectedDateText
              ]}>
                {date}
              </Text>
            </TouchableOpacity>
          ) : (
            <View key={index} style={styles.emptyDate} />
          )
        ))}
      </View>
    </View>
  );
};

interface RepetitionData {
  isRecurring: boolean;
  selectedOption: RecurringOption;
  selectedDays: DaysState;
  timesPerDay: number;
  periodicValue: number;
  periodicUnit: number;
  selectedDate: Date;
  selectedMonth: string;
  weekOfMonth: string;
  dayOfWeek: string;
}

interface RepetitionViewProps {
  onClose: () => void;
  onSave: (repetitionData: RepetitionData) => void;
  initialData?: {
    isRecurring: boolean;
    selectedOption: RecurringOption;
    selectedDays: DaysState;
    timesPerDay: number;
    periodicValue: number;
    periodicUnit: number;
    selectedDate: Date;
    selectedMonth: string;
    weekOfMonth: string;
    dayOfWeek: string;
  };
}

const emptyDaysState: DaysState = {
    Sun: false,
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false
};

const RepetitionView = ({ onClose, onSave, initialData, onRepetitionChange }: RepetitionViewProps & { onRepetitionChange?: (data: RepetitionData) => void }) => {
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring ?? false);
  const [selectedOption, setSelectedOption] = useState<RecurringOption>(initialData?.selectedOption ?? 'One-Time');
  const [selectedDays, setSelectedDays] = useState<DaysState>(initialData?.selectedDays ?? emptyDaysState);
  const [timesPerDay, setTimesPerDay] = useState(initialData?.timesPerDay ?? 10);
  const [selectedDate, setSelectedDate] = useState(initialData?.selectedDate ?? new Date());
  const [periodicValue, setPeriodicValue] = useState(initialData?.periodicValue ?? 1);
  const [periodicUnit, setPeriodicUnit] = useState(initialData?.periodicUnit ?? 2);
  const [selectedMonth, setSelectedMonth] = useState(initialData?.selectedMonth ?? '');
  const [weekOfMonth, setWeekOfMonth] = useState(initialData?.weekOfMonth ?? '1st');
  const [dayOfWeek, setDayOfWeek] = useState(initialData?.dayOfWeek ?? 'Day');

  // Picker logic for yearly input
  const weekOfMonthOptions = ['1st', '2nd', '3rd', '4th', 'Last'];
  const dayOfWeekOptions = ['Day', 'Week of month'];
  const pickerItemHeight = 32;
  // const weekOfMonthRef = useRef<ScrollView>(null);
  // const dayOfWeekRef = useRef<ScrollView>(null);

  // useEffect(() => {
  //   const weekIndex = weekOfMonthOptions.indexOf(weekOfMonth);
  //   const dayIndex = dayOfWeekOptions.indexOf(dayOfWeek);
  //   setTimeout(() => {
  //     if (weekOfMonthRef.current && weekIndex >= 0) {
  //       weekOfMonthRef.current.scrollTo({ y: weekIndex * pickerItemHeight, animated: false });
  //     }
  //     if (dayOfWeekRef.current && dayIndex >= 0) {
  //       dayOfWeekRef.current.scrollTo({ y: dayIndex * pickerItemHeight, animated: false });
  //     }
  //   }, 100);
  // }, [weekOfMonth, dayOfWeek]);

  // const handleWeekOfMonthScrollEnd = (event: any) => {
  //   const y = event.nativeEvent.contentOffset.y;
  //   const index = Math.round(y / pickerItemHeight);
  //   if (index >= 0 && index < weekOfMonthOptions.length) {
  //     setWeekOfMonth(weekOfMonthOptions[index]);
  //   }
  // };
  // const handleDayOfWeekScrollEnd = (event: any) => {
  //   const y = event.nativeEvent.contentOffset.y;
  //   const index = Math.round(y / pickerItemHeight);
  //   if (index >= 0 && index < dayOfWeekOptions.length) {
  //     setDayOfWeek(dayOfWeekOptions[index]);
  //   }
  // };

  const handleDayToggle = (day: DayType) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleSave = () => {
    let repetitionData: RepetitionData = {
      isRecurring,
      selectedOption: isRecurring ? selectedOption : 'One-Time',
      selectedDays: isRecurring ? selectedDays : emptyDaysState,
      timesPerDay: isRecurring ? timesPerDay : 0,
      periodicValue: isRecurring ? periodicValue : 0,
      periodicUnit: isRecurring ? periodicUnit : 0,
      selectedDate,
      selectedMonth: isRecurring ? selectedMonth : '',
      weekOfMonth: isRecurring ? weekOfMonth : '1st',
      dayOfWeek: isRecurring ? dayOfWeek : 'Day',
    };

    onSave(repetitionData);
    onClose();
  };

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const renderRecurringOptions = () => {
    const options: RecurringOption[] = ['Daily', 'Weekly', 'Monthly', 'Specific Days', 'Periodic', 'Yearly'];
    
    return (
      <View style={styles.optionsContainer}>
        <View style={styles.optionsGrid}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                selectedOption === option && styles.selectedOptionButton
              ]}
              onPress={() => setSelectedOption(option)}
            >
              <Text style={[
                styles.optionButtonText,
                selectedOption === option && styles.selectedOptionButtonText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedOption === 'Daily' && (
          <View style={styles.contentContainer}>
          <View style={styles.weekDaysRow}>
              {Object.entries(selectedDays).map(([day, isSelected]) => (
                <View key={day} style={styles.dayColumn}>
                  <Text style={styles.dayText}>{day}</Text>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      // isSelected && styles.checkedCheckbox
                    ]}
                    onPress={() => handleDayToggle(day as DayType)}
                  >
                    {isSelected && <Icon name="check" size={16} color="#6A6565" />}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.numberInput}
                keyboardType="numeric"
                value={timesPerDay.toString()}
                onChangeText={(text) => setTimesPerDay(parseInt(text) || 0)}
              />
              <Text style={styles.inputLabel}>Time Per Day</Text>
            </View>
          </View>
        )}

        {selectedOption === 'Weekly' && (
          <View style={styles.contentContainer}>
            {/* <View style={styles.weekDaysRow}>
              {Object.entries(selectedDays).map(([day, isSelected]) => (
                <View key={day} style={styles.dayColumn}>
                  <Text style={styles.dayText}>{day}</Text>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      // isSelected && styles.checkedCheckbox
                    ]}
                    onPress={() => handleDayToggle(day as DayType)}
                  >
                    {isSelected && <Icon name="check" size={16} color="#6A6565" />}
                  </TouchableOpacity>
                </View>
              ))}
            </View> */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.numberInput}
                keyboardType="numeric"
                value={timesPerDay.toString()}
                onChangeText={(text) => setTimesPerDay(parseInt(text) || 0)}
              />
              <Text style={styles.inputLabel}>Per Days</Text>
              <TextInput
                style={styles.numberInput}
                keyboardType="numeric"
                value={timesPerDay.toString()}
                onChangeText={(text) => setTimesPerDay(parseInt(text) || 0)}
              />
               <Text style={styles.inputLabel}> Week</Text>
            </View>
          </View>
        )}

        {selectedOption === 'Monthly' && (
          <View style={styles.contentContainer}>
            {/* <View style={styles.monthDaysHeader}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Text key={index} style={styles.monthDayHeaderText}>{day}</Text>
              ))}
            </View> */}
            <View style={styles.monthDaysGrid}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.monthDayBox,
                    selectedDate.getDate() === day && styles.selectedMonthDayBox
                  ]}
                  onPress={() => setSelectedDate(new Date(selectedDate.setDate(day)))}
                >
                  <Text style={[
                    styles.monthDayText,
                    selectedDate.getDate() === day && styles.selectedMonthDayText
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
              {/* Add empty boxes to complete the grid */}
              {Array.from({ length: 4 }, (_, i) => (
                <View key={`empty-${i}`} style={styles.monthDayBox} />
              ))}
            </View>
            <View style={styles.monthlyInputContainer}>
              <Text style={styles.inputLabel}>Every</Text>
              <View style={styles.monthlyNumberInputContainer}>
                <TextInput
                  style={styles.monthlyNumberInput}
                  keyboardType="numeric"
                  value={periodicValue.toString()}
                  onChangeText={(text) => setPeriodicValue(parseInt(text) || 1)}
                />
              </View>
              <Text style={styles.inputLabel}>Month</Text>
            </View>
          </View>
        )}

        {selectedOption === 'Yearly' && (
          <>
            <View style={styles.contentContainer}>
              {/* <View style={styles.weekDaysHeader}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <Text key={index} style={styles.weekDayLabel}>{day}</Text>
                ))}
              </View>
              <View style={styles.weekDaysRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={styles.weekDayCheckbox}
                    onPress={() => handleDayToggle(day as DayType)}
                  >
                    <View style={styles.checkbox} />
                  </TouchableOpacity>
                ))}
              </View> */}
              <View style={styles.weekDaysRow}>
                {Object.entries(selectedDays).map(([day, isSelected]) => (
                  <View key={day} style={styles.dayColumn}>
                    <Text style={styles.dayText}>{day}</Text>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        // isSelected && styles.checkedCheckbox
                      ]}
                      onPress={() => handleDayToggle(day as DayType)}
                    >
                      {isSelected && <Icon name="check" size={16} color="#6A6565" />}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View style={styles.monthsContainer}>
                {[
                  ['Jan', 'Feb', 'Mar', 'Apr'],
                  ['May', 'Jun', 'Jul', 'Aug'],
                  ['Sep', 'Oct', 'Nov', 'Dec']
                ].map((row, rowIndex) => (
                  <View key={rowIndex} style={[
                    styles.monthRowTable,
                    rowIndex === 2 && { borderBottomWidth: 0 }
                  ]}>
                    {row.map((month, monthIndex) => (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.monthButtonTable,
                          monthIndex === 3 && { borderRightWidth: 0 },
                          selectedMonth === month && styles.selectedMonthButtonTable
                        ]}
                        onPress={() => setSelectedMonth(month)}
                      >
                        <Text style={[
                          styles.monthButtonText,
                          selectedMonth === month && styles.selectedMonthButtonTextTable
                        ]}>
                          {month}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
              <View style={styles.yearlyInputsContainer}>
                <View style={styles.yearlyInputRow}>
                  <Text style={styles.yearlyInputLabel}>On</Text>
                </View>
                <View style={styles.yearlyInputRow}>
                  <View style={styles.yearlyInputWrapper}>
                    <VerticalPicker
                      options={weekOfMonthOptions}
                      selectedValue={weekOfMonth}
                      onValueChange={setWeekOfMonth}
                      itemHeight={pickerItemHeight}
                    />
                  </View>
                </View>
                {/* <View style={styles.yearlyInputRow}>
                  <Text style={styles.yearlyInputLabel}>Week of month</Text>
                </View> */}
                <View style={styles.yearlyInputRow}>
                  <View style={styles.yearlyInputWrapper}>
                    <VerticalPicker
                      options={dayOfWeekOptions}
                      selectedValue={dayOfWeek}
                      onValueChange={setDayOfWeek}
                      itemHeight={pickerItemHeight}
                    />
                  </View>
                </View>
                {/* <View style={styles.yearlyInputRow}>
                  <Text style={styles.yearlyInputLabel}>Day of week</Text>
                </View> */}
              </View>
            </View>
            {/* <View style={styles.everyContainer}>
              <View style={styles.everyRow}>
                <Text style={styles.everyLabel}>Every</Text>
                <TextInput
                  style={styles.everyInput}
                  keyboardType="numeric"
                  value="1"
                />
                <Text style={styles.everyLabel}>Year</Text>
              </View>
            </View> */}
          </>
        )}

        {selectedOption === 'Periodic' && (
          <View style={styles.contentContainer}>
            <View style={styles.everyRow}>
              <Text style={styles.everyLabel}>Every</Text>
              <TextInput
                style={styles.everyInput}
                keyboardType="numeric"
                value={periodicValue.toString()}
                onChangeText={(text) => setPeriodicValue(parseInt(text) || 1)}
              />
              <Text style={styles.everyLabel}>Month</Text>
            </View>
          </View>
        )}
        {selectedOption === 'Specific Days' && (
          <View style={styles.contentContainer}>
            <View style={styles.everyRow}>
              <Text style={styles.everyLabel}>Every</Text>
              <TextInput
                style={styles.everyInput}
                keyboardType="numeric"
                value={periodicValue.toString()}
                onChangeText={(text) => setPeriodicValue(parseInt(text) || 1)}
              />
              <Text style={styles.everyLabel}>Month</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Notify parent of changes to repetition state
  useEffect(() => {
    if (onRepetitionChange) {
      onRepetitionChange({
        isRecurring,
        selectedOption,
        selectedDays,
        timesPerDay,
        periodicValue,
        periodicUnit,
        selectedDate,
        selectedMonth,
        weekOfMonth,
        dayOfWeek,
      });
    }
  }, [isRecurring, selectedOption, selectedDays, timesPerDay, periodicValue, periodicUnit, selectedDate, selectedMonth, weekOfMonth, dayOfWeek]);

  return (
    <View style={styles.whiteCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Repetition</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, !isRecurring && styles.toggleButtonActive]}
          onPress={() => setIsRecurring(false)}
        >
          <Text style={[styles.toggleText, !isRecurring && styles.toggleTextActive]}>One-Time</Text>
          {!isRecurring && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, isRecurring && styles.toggleButtonActive]}
          onPress={() => setIsRecurring(true)}
        >
          <Text style={[styles.toggleText, isRecurring && styles.toggleTextActive]}>Recurring</Text>
          {isRecurring && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>
      {isRecurring ? renderRecurringOptions() : <OneTimeView onDateChange={(date) => setSelectedDate(date)} />}
    </View>
  );
};

const OneTimeView = ({ onDateChange }: { onDateChange: (date: Date) => void }) => {
  const [selectedQuickDate, setSelectedQuickDate] = useState('Today');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleQuickDateSelect = (option: string) => {
    setSelectedQuickDate(option);
    
    const today = new Date();
    let newDate = today;
    
    switch (option) {
      case 'Today':
        newDate = today;
        break;
      case 'Tomorrow':
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        newDate = tomorrow;
        break;
      case 'Someday':
        // Keep current selected date for calendar selection
        break;
    }
    
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedQuickDate('Someday');
    onDateChange(date);
  };

  return (
    <View style={styles.oneTimeContainer}>
      <View style={styles.quickDateContainer}>
        {['Today', 'Tomorrow', 'Someday'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.quickDateButton,
              selectedQuickDate === option && styles.selectedQuickDateButton
            ]}
            onPress={() => handleQuickDateSelect(option)}
          >
            <Text style={[
              styles.quickDateText,
              selectedQuickDate === option && styles.selectedQuickDateText
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.calendarWrapper}>
        <Calendar 
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
      </View>
    </View>
  );
};

type BlockTimeViewProps = {
  onClose: () => void;
  onSave: (blockTimeData: {
    startTime: {
      hour: number;
      minute: number;
      period: 'AM' | 'PM';
    };
    endTime: {
      hour: number;
      minute: number;
      period: 'AM' | 'PM';
    };
  }) => void;
  initialData?: {
    startTime: {
      hour: number;
      minute: number;
      period: 'AM' | 'PM';
    };
    endTime: {
      hour: number;
      minute: number;
      period: 'AM' | 'PM';
    };
  } | null;
};

const BlockTimeView = ({ onClose, onSave, initialData }: BlockTimeViewProps) => {
  const [startHour, setStartHour] = useState(initialData?.startTime?.hour?.toString().padStart(2, '0') ?? '12');
  const [startMinute, setStartMinute] = useState(initialData?.startTime?.minute?.toString().padStart(2, '0') ?? '00');
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>(initialData?.startTime?.period ?? 'AM');
  const [endHour, setEndHour] = useState(initialData?.endTime?.hour?.toString().padStart(2, '0') ?? '12');
  const [endMinute, setEndMinute] = useState(initialData?.endTime?.minute?.toString().padStart(2, '0') ?? '00');
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>(initialData?.endTime?.period ?? 'PM');
  const [isEndTimeEnabled, setIsEndTimeEnabled] = useState(false);

  // Create handlers for AM/PM changes that properly type cast the input
  const handleStartPeriodChange = (value: string) => {
    if (value === 'AM' || value === 'PM') {
      setStartPeriod(value);
    }
  };

  const handleEndPeriodChange = (value: string) => {
    if (value === 'AM' || value === 'PM') {
      setEndPeriod(value);
    }
  };

  const handleSave = () => {
    onSave({
      startTime: {
        hour: parseInt(startHour),
        minute: parseInt(startMinute),
        period: startPeriod
      },
      endTime: {
        hour: parseInt(endHour),
        minute: parseInt(endMinute),
        period: endPeriod
      }
    });
    onClose();
  };

  // Memoized options for pickers
  const hourOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')), []);
  const minuteOptions = useMemo(() => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), []);
  const ampmOptions = useMemo(() => ['AM', 'PM'], []);
  const pickerHeight = 36;

  return (
    <View style={{marginBottom:10}}>
      <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
        <View style={styles.whiteCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Block Time</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'column', gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.timeLabel}>Start Time</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.timeLabel}>End Time</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Start Time Custom Picker */}
              <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
                <VerticalPicker
                  options={hourOptions}
                  selectedValue={startHour}
                  onValueChange={setStartHour}
                  itemHeight={pickerHeight}
                  style={{ width: 40 }}
                />
                <Text style={{ fontSize: 18, marginHorizontal: 2 }}>:</Text>
                <VerticalPicker
                  options={minuteOptions}
                  selectedValue={startMinute}
                  onValueChange={setStartMinute}
                  itemHeight={pickerHeight}
                  style={{ width: 40 }}
                />
                <VerticalPicker
                  options={ampmOptions}
                  selectedValue={startPeriod}
                  onValueChange={v => setStartPeriod(v as 'AM' | 'PM')}
                  itemHeight={pickerHeight}
                  style={{ width: 40 }}
                />
              </View>
              {/* End Time Custom Picker */}
              <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
                <VerticalPicker
                  options={hourOptions}
                  selectedValue={endHour}
                  onValueChange={setEndHour}
                  itemHeight={pickerHeight}
                  style={{ width: 40 }}
                />
                <Text style={{ fontSize: 18, marginHorizontal: 2 }}>:</Text>
                <VerticalPicker
                  options={minuteOptions}
                  selectedValue={endMinute}
                  onValueChange={setEndMinute}
                  itemHeight={pickerHeight}
                  style={{ width: 40 }}
                />
                <VerticalPicker
                  options={ampmOptions}
                  selectedValue={endPeriod}
                  onValueChange={v => setEndPeriod(v as 'AM' | 'PM')}
                  itemHeight={pickerHeight}
                  style={{ width: 40 }}
                />
              </View>
            </View>
          </View>
        </View>
      </Shadow>
    </View>
  );
};

type DurationViewProps = {
  onClose: () => void;
  onSave: (durationData: {
    isAllDay: boolean;
    hours: number;
    minutes: number;
  }) => void;
  initialData?: {
    isAllDay: boolean;
    hours: number;
    minutes: number;
  };
};

const DurationView = ({ onClose, onSave, initialData }: DurationViewProps) => {
  const [isAllDay, setIsAllDay] = useState(initialData?.isAllDay ?? false);
  const [hours, setHours] = useState(initialData?.hours?.toString() ?? '0');
  const [minutes, setMinutes] = useState(initialData?.minutes?.toString() ?? '0');

  // Prepare options for pickers
  const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), []);
  const minuteOptions = useMemo(() => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), []);
  const pickerHeight = 40;

  const handleSave = () => {
    onSave({
      isAllDay,
      hours: parseInt(hours) || 0,
      minutes: parseInt(minutes) || 0
    });
    onClose();
  };

  return (
    <View style={{marginBottom:10, marginTop:10}}>
      <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
        <View style={styles.whiteCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Duration</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.durationContainer}>
            <View style={styles.allDayOption}>
              <Text style={styles.optionText}>All Day</Text>
              <CustomSwitch value={isAllDay} onValueChange={setIsAllDay} />
            </View>
            {!isAllDay && (
              <View style={styles.durationPickerRow}>
                <View style={styles.durationInputContainer}>
                  <VerticalPicker
                    options={hourOptions}
                    selectedValue={hours.padStart(2, '0')}
                    onValueChange={setHours}
                    itemHeight={pickerHeight}
                    style={{ width: 50 }}
                  />
                  <Text style={styles.timeUnitText}>hour</Text>
                </View>
                <View style={styles.durationInputContainer}>
                  <VerticalPicker
                    options={minuteOptions}
                    selectedValue={minutes.padStart(2, '0')}
                    onValueChange={setMinutes}
                    itemHeight={pickerHeight}
                    style={{ width: 50 }}
                  />
                  <Text style={styles.timeUnitText}>min</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Shadow>
    </View>
  );
};

const SetupGoalView = ({ 
  goalTitle, 
  note, 
  onGoalTitleChange, 
  onNoteChange, 
  onClose,
  category,
  onUpdateCategory,
  checklist,
  onSave,
  target,
  onTargetChange,
  selectedUnit,
  onOpenTarget,
  onPriorityChange = () => {},
  repetition,
  onRepetitionChange,
  duration,
  onDurationChange,
  blockTime,
  onBlockTimeChange
}: SetupGoalViewProps) => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { evaluationType } = route.params;
  const [showTarget, setShowTarget] = useState(false);
  const [showRepetition, setShowRepetition] = useState(false);
  const [showBlockTime, setShowBlockTime] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('Important'); // Set default to Important
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [addReminder, setAddReminder] = useState(false);
  const [addPomodoro, setAddPomodoro] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLinkGoal, setShowLinkGoal] = useState(false);
  const [linkedGoalId, setLinkedGoalId] = useState<string | undefined>();
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  // --- New state for Frequency/Every logic ---
  const [showFrequency, setShowFrequency] = useState(false);
  const [frequency, setFrequency] = useState<any>(null);
  const [showEvery, setShowEvery] = useState(false);
  const [every, setEvery] = useState<any>(null);

  const returnToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleUpdateCategory = () => {
    navigation.navigate('SelectCategory', {
      taskType: 'recurring',
      gender: route.params.gender || 'male',
      goalTitle: goalTitle || '',
      isFromAdd: true,
      selectedOption: category || undefined
    });
  };

  const handleOpenChecklist = () => {
    navigation.navigate('Checklist', {
      items: checklist?.items || [],
      successCondition: checklist?.successCondition || 'all',
      customCount: checklist?.customCount || 0,
      note: checklist?.note || '',
      taskType: 'recurring',
      gender: route.params.gender || 'male',
      goalTitle: goalTitle || '',
      existingChecklist: checklist || undefined,
      category: category,
      evaluationType: evaluationType
    });
  };

  const handleOpenTarget = () => {
    navigation.navigate('SelectUnit', {
      gender: route.params.gender || 'male',
      goalTitle: goalTitle || '',
      category: category || undefined,
      target: target || undefined
    });
  };

  const handleSave = async () => {
    if (!goalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    try {
      setIsSaving(true);
      
      // Get user data for gender
      const user = await getStoredUser();
      const gender = user?.gender || route.params?.gender || 'male';
      
      // Prepare goal data
      const goalData = {
        title: goalTitle,
        note: note,
        category: category,
        checklist: checklist,
        target: target,
        selectedUnit: selectedUnit,
        blockTime: blockTime,
        gender: gender,
        repetition: repetition,
        duration: duration,
        priority: selectedPriority,
      
        addToCalendar,
        addReminder,
        addPomodoro,
        linkedGoalId,
        evaluationType: evaluationType
      };
      
      console.log('Saving goal data:', JSON.stringify(goalData, null, 2));
      
      // Call the onSave function passed from parent
      await onSave(goalData);
      
      // Navigate back or to another screen
      // navigation.goBack();
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRepetitionSave = (repetitionData: {
    isRecurring: boolean;
    selectedOption: RecurringOption;
    selectedDays: DaysState;
    timesPerDay: number;
    selectedDate: Date;
    periodicValue: number;
    periodicUnit: number;
    selectedMonth: string;
    weekOfMonth: string;
    dayOfWeek: string;
  }) => {
    onRepetitionChange(repetitionData);
    setShowRepetition(false);
  };

  const handleDurationSave = (durationData: {
    isAllDay: boolean;
    hours: number;
    minutes: number
  }) => {
    onDurationChange(durationData);
    setShowDuration(false);
  };

  const handleBlockTimeSave = (blockTimeData: {
    startTime: {
      hour: number;
      minute: number;
      period: 'AM' | 'PM';
    };
    endTime: {
      hour: number;
      minute: number;
      period: 'AM' | 'PM';
    };
  }) => {
    onBlockTimeChange(blockTimeData);
    setShowBlockTime(false);
  };

  useEffect(() => {
    // Notify parent of default priority when component mounts
    onPriorityChange('Important');
  }, []); // Empty dependency array means this runs once on mount

  // Handlers for Frequency/Every
  const handleFrequencySave = (data: any) => {
    setFrequency(data);
    setShowFrequency(false);
  };
  const handleEverySave = (data: any) => {
    setEvery(data);
    setShowEvery(false);
  };

  // Determine if FrequencyView or EveryView should be shown based on repetition.selectedOption
  useEffect(() => {
    if (repetition && repetition.selectedOption) {
      const freqOptions = ['Weekly', 'Monthly', 'Specific Days', 'Periodic', 'Yearly'];
      if (freqOptions.includes(repetition.selectedOption)) {
        setShowFrequency(true);
      } else {
        setShowFrequency(false);
      }
      if (repetition.selectedOption === 'Yearly') {
        setShowEvery(true);
      } else {
        setShowEvery(false);
      }
    } else {
      setShowFrequency(false);
      setShowEvery(false);
    }
  }, [repetition && repetition.selectedOption]);

  // Remove the custom header and wrap content in Layout
  return (
    <Layout
      title="Set Recurring  Task"
      onBackPress={onClose}
      rightButtonText="Done"
      rightButtonDisabled={false}
      onRightButtonPress={handleSave}
    >
      <ScrollView style={styles.setupContent}>
        <View style={{marginBottom:10, marginTop:10}}>
          <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
              <TextInput
                style={styles.titleInput}
                value={goalTitle}
                onChangeText={onGoalTitleChange}
                placeholder="Enter Title"
                placeholderTextColor="#666"
              />
          </Shadow>
        </View>
        
        <View style={{marginBottom:10}}>
            <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
              <TouchableOpacity 
                style={styles.sectionButton}
                // onPress={onUpdateCategory}
              >
                <Text style={styles.sectionButtonText}>
                  {category ? `Category: ${category}` : 'Select Category'}
                </Text>
                {/* <Icon name="edit" size={24} color="#999" /> */}
              </TouchableOpacity>
            </Shadow>
        </View>
        <View style={{marginBottom:10}}>
            <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
              <TextInput
                style={styles.noteInput}
                placeholder="Enter Note"
                value={note}
                onChangeText={onNoteChange}
                placeholderTextColor="#666"
                multiline
              />
            </Shadow>
        </View>
        {evaluationType === 'checklist' && (
          <View style={{marginBottom:10}}>
            <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
            <TouchableOpacity 
              style={styles.sectionButton}
              onPress={handleOpenChecklist}
            >
              <Text style={styles.sectionButtonText}>
                Checklist
              </Text>
              <Icon name="add" size={24} color="#999" />
            </TouchableOpacity>
          </Shadow>
          </View>
        )}
        
        {showTarget ? (
           <View style={{marginBottom:10,}}>
              <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
                    <View style={styles.whiteCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Target</Text>
                    <TouchableOpacity onPress={() => setShowTarget(false)}>
                      <Text style={styles.doneButton}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.targetInputContainer}>
                    <TextInput
                      style={styles.targetInput}
                      placeholder="Enter Target"
                      placeholderTextColor="#666"
                      value={target}
                      onChangeText={onTargetChange}
                    />
                    <TouchableOpacity 
                      style={styles.setUnitButton}
                      onPress={onOpenTarget}
                    >
                      <Text style={styles.setUnitText}>
                        {selectedUnit || 'Set Unit'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Shadow>
          </View>
        ) : (
            <View style={{marginBottom:10}}>
              <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
                <TouchableOpacity 
                  style={styles.sectionButton}
                  onPress={() => setShowTarget(true)}
                >
                  <Text style={styles.sectionButtonText}>Target</Text>
                  <Icon name="add" size={24} color="#999" />
                </TouchableOpacity>
              </Shadow>
          </View>
        )}

        {showRepetition ? (
         <View style={{marginBottom:10}}>
              <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>  
          <RepetitionView 
            onClose={() => setShowRepetition(false)} 
            onSave={handleRepetitionSave}
            initialData={repetition}
            onRepetitionChange={onRepetitionChange}
          />
          </Shadow>
          </View>
        ) : (
          <View style={{marginBottom:10}}>
            <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
              <TouchableOpacity 
                style={styles.sectionButton}
                onPress={() => setShowRepetition(true)}
            >
              <Text style={styles.sectionButtonText}>Repetition</Text>
              <Icon name="add" size={24} color="#999" />
            </TouchableOpacity>
          </Shadow>
          </View>
        )}
        {showEvery && (
          <EveryView 
            onClose={() => setShowEvery(false)} 
            onSave={handleEverySave}
            initialData={every}
          />
        )}
        {showFrequency && (
          <FrequencyView 
            onClose={() => setShowFrequency(false)} 
            onSave={handleFrequencySave}
            initialData={frequency}
          />
        )}

        {showBlockTime ? (
          // (repetition?.isRecurring ? (
          //   <RecurringBlockTimeView
          //     onClose={() => setShowBlockTime(false)}
          //     onSave={handleBlockTimeSave}
          //     initialData={blockTime}
          //   />
          // ) : (
            <BlockTimeView
              onClose={() => setShowBlockTime(false)}
              onSave={handleBlockTimeSave}
              initialData={blockTime}
            />
          // ))
        ) : (
          <View style={{marginBottom:10}}>
            <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
              <TouchableOpacity 
                style={styles.sectionButton}
                onPress={() => setShowBlockTime(true)}
            >
              <Text style={styles.sectionButtonText}>Block Time</Text>
              <Icon name="add" size={24} color="#999" />
            </TouchableOpacity>
          </Shadow>
          </View>
        )}

        {evaluationType === 'timer' && (
          <>
            {showDuration ? (
              <DurationView 
                onClose={() => setShowDuration(false)} 
                onSave={handleDurationSave}
                initialData={duration}
              />
            ) : (
              <View style={{marginBottom:10}}>
                <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
                  <TouchableOpacity 
                    style={styles.sectionButton}
                    onPress={() => setShowDuration(true)}
                >
                  <Text style={styles.sectionButtonText}>Duration</Text>
                  <Icon name="add" size={24} color="#999" />
                </TouchableOpacity>
              </Shadow>
              </View>
            )}
          </>
        )}

        {showPriority ? (
          <View style={styles.whiteCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Priority</Text>
              <TouchableOpacity onPress={() => setShowPriority(false)}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.priorityContainer}>
              <TouchableOpacity 
                style={[
                  styles.priorityButton,
                  selectedPriority === 'Must' && styles.selectedPriorityButton
                ]}
                onPress={() => {
                  setSelectedPriority('Must');
                  onPriorityChange('Must');
                }}
              >
                <Text style={[
                  styles.priorityButtonText,
                  selectedPriority === 'Must' && styles.selectedPriorityText
                ]}>Must</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.priorityButton,
                  selectedPriority === 'Important' && styles.selectedPriorityButton
                ]}
                onPress={() => {
                  setSelectedPriority('Important');
                  onPriorityChange('Important');
                }}
              >
                <Text style={[
                  styles.priorityButtonText,
                  selectedPriority === 'Important' && styles.selectedPriorityText
                ]}>Important</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{marginBottom:10}}>
            <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
              <TouchableOpacity 
                style={styles.sectionButton}
              onPress={() => setShowPriority(true)}
            >
              <Text style={styles.sectionButtonText}>Priority: {selectedPriority}</Text>
              <TouchableOpacity
              
              onPress={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
            >
              {/* <Text style={styles.periodText}>{selectedPriority}</Text> */}
              <Icon 
                name={isPriorityDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                size={24} 
                color="#333"
              />
            </TouchableOpacity>
            </TouchableOpacity>
          </Shadow>
          </View>
        )}

        <View style={{marginBottom:10}}>
        <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
          <TouchableOpacity 
            style={styles.sectionButton}
            onPress={() => navigation.navigate('SavedGoals')}
          >
          <Text style={styles.sectionButtonText}>Link to Goal</Text>
            <Icon name="add" size={24} color="#999" />
          </TouchableOpacity>
        </Shadow>
        </View>

        <View style={{marginBottom:10}}>
        <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
          <View style={styles.switchSection}>
            <Text style={styles.switchText}>Add a Reminder</Text>
            {/* <Switch
              value={addReminder}
              onValueChange={setAddReminder}
              trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
              ios_backgroundColor="#E5E5E5"
            /> */}
            <CustomSwitch value={addReminder} onValueChange={setAddReminder} />
          </View>
        </Shadow>
        </View>
        <View style={{marginBottom:10}}>
        <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
          <View style={styles.switchSection}>
            <Text style={styles.switchText}>Add to Google Calendar</Text>
            {/* <Switch
              value={addToCalendar}
              onValueChange={setAddToCalendar}
              trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
              ios_backgroundColor="#E5E5E5"
            /> */}
            <CustomSwitch value={addToCalendar} onValueChange={setAddToCalendar} />
          </View>
        </Shadow>
        </View>
        {evaluationType === 'timer' && (
          <View style={{marginBottom:10}}>
            <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={styles.shadow}>
              <View style={styles.switchSection}>
              <Text style={styles.switchText}>Add Pomodoro</Text>
              {/* <Switch
                value={addPomodoro}
                onValueChange={setAddPomodoro}
                trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
                ios_backgroundColor="#E5E5E5"
              /> */}
              <CustomSwitch value={addPomodoro} onValueChange={setAddPomodoro} />
            </View>
          </Shadow>
          </View>
        )}
      </ScrollView>
      <ProgressIndicator currentStep={2} totalSteps={5} />
    </Layout>
  );
};

// Add this interface near the top of the file with other interfaces
interface DailyPlan {
  id: number;
  habit: string;
  block_time?: {
    start_time: string;
    end_time?: string | null;
  };
}

const RecurringGoal = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  
  const [formData, setFormData] = useState<FormData>({
    goalTitle: route.params?.goalTitle || '',
    note: '',
    category: route.params?.category || '',
    checklist: route.params?.checklist || {
      items: [],
      successCondition: 'all',
      customCount: 0,
      note: ''
    },
    target: route.params?.target || '',
    selectedUnit: route.params?.selectedUnit || '',
    duration: {
      isAllDay: false,
      hours: 0,
      minutes: 0
    },
    priority: '',

    addToCalendar: false,
    addReminder: false,
    addPomodoro: false,
    startTime: '09:00',
    endTime: '17:00',
    frequency: 'daily',
    reminder: false,
    reminderTime: '09:00',
    blockTime: null,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [blockTime, setBlockTime] = useState<BlockTimeType>(null);

  // Load saved form data when component mounts
  useEffect(() => {
    console.log('Component mounted, loading saved form data');
    loadSavedFormData();
  }, []);

  // Save form data whenever it changes, but only if it's a meaningful change
  useEffect(() => {
    const saveData = async () => {
      try {
        const dataToSave = { ...formData, blockTime };
        console.log('Attempting to save form data:', JSON.stringify(dataToSave, null, 2));
        const currentData = await AsyncStorage.getItem(FORM_DATA_KEY);
        const parsedCurrentData = currentData ? JSON.parse(currentData) : null;
        
        console.log('Current data in storage:', JSON.stringify(parsedCurrentData, null, 2));
        
        // Only save if the data has actually changed
        if (JSON.stringify(parsedCurrentData) !== JSON.stringify(dataToSave)) {
          console.log('Data has changed, saving to AsyncStorage');
          await AsyncStorage.setItem(FORM_DATA_KEY, JSON.stringify(dataToSave));
          console.log('Data saved successfully');
        } else {
          console.log('No changes detected, skipping save');
        }
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    };
    
    // Only save if we have a checklist with items
    if (formData.checklist && formData.checklist.items && formData.checklist.items.length > 0) {
      saveData();
    }
    console.log('formData updated:', JSON.stringify(formData, null, 2));
  }, [formData, blockTime]);

  // Load saved form data from AsyncStorage
  const loadSavedFormData = async () => {
    try {
      console.log('Loading saved form data from AsyncStorage');
      const savedData = await AsyncStorage.getItem(FORM_DATA_KEY);
      console.log('Raw saved data:', savedData);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData) as Partial<FormData>;
        console.log('Parsed saved data:', JSON.stringify(parsedData, null, 2));
        
        setFormData(prevData => {
          console.log('Previous form data:', JSON.stringify(prevData, null, 2));
          const updatedData = { ...prevData };
          
          // Handle checklist separately - only update if the current checklist is empty
          if (parsedData.checklist) {
            console.log('Checking checklist data');
            console.log('Previous checklist:', JSON.stringify(prevData.checklist, null, 2));
            console.log('Saved checklist data:', JSON.stringify(parsedData.checklist, null, 2));
            
            // Only update checklist if current checklist is empty
            if (!prevData.checklist.items.length) {
              console.log('Updating checklist with saved data');
              updatedData.checklist = {
                ...prevData.checklist,
                ...parsedData.checklist,
                items: parsedData.checklist.items || prevData.checklist.items,
                successCondition: parsedData.checklist.successCondition || prevData.checklist.successCondition,
                customCount: parsedData.checklist.customCount || prevData.checklist.customCount,
                note: parsedData.checklist.note || prevData.checklist.note
              };
            } else {
              console.log('Keeping current checklist as it already has items');
            }
            
            console.log('Final checklist:', JSON.stringify(updatedData.checklist, null, 2));
          }

          // Handle other fields
          if (parsedData.goalTitle) updatedData.goalTitle = parsedData.goalTitle;
          if (parsedData.note) updatedData.note = parsedData.note;
          if (parsedData.category) updatedData.category = parsedData.category;
          if (parsedData.target) updatedData.target = parsedData.target;
          if (parsedData.selectedUnit) updatedData.selectedUnit = parsedData.selectedUnit;
          if (parsedData.blockTime) {
            updatedData.blockTime = parsedData.blockTime;
            setBlockTime(parsedData.blockTime as BlockTimeType);
          }
          console.log('Final updated form data:', JSON.stringify(updatedData, null, 2));
          return updatedData;
        });
      } else {
        console.log('No saved data found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
  };

  // Update form data when returning from other screens
  useEffect(() => {
    if (route.params) {
      console.log('Route params received:', JSON.stringify(route.params, null, 2));
      const updates: Partial<FormData> = {};
      
      if (route.params.category) {
        updates.category = route.params.category;
      }
      
      if (route.params.checklist) {
        console.log('Checklist data in route params:', JSON.stringify(route.params.checklist, null, 2));
        updates.checklist = {
          ...formData.checklist,
          ...route.params.checklist,
          items: route.params.checklist.items || formData.checklist.items,
          successCondition: route.params.checklist.successCondition || formData.checklist.successCondition,
          customCount: route.params.checklist.customCount || formData.checklist.customCount,
          note: route.params.checklist.note || formData.checklist.note
        };
        console.log('Updated checklist from route params:', JSON.stringify(updates.checklist, null, 2));
      }
      
      if (route.params.target) {
        updates.target = route.params.target;
      }
      
      if (route.params.selectedUnit) {
        updates.selectedUnit = route.params.selectedUnit;
      }
      
      if (route.params.goalTitle) {
        updates.goalTitle = route.params.goalTitle;
      }

      if (route.params.linkedGoal) {
        const linkedGoal = route.params.linkedGoal;
        updates.linkedGoalId = linkedGoal.id;
        if (!updates.note) {
          updates.note = `Linked to: ${linkedGoal.title}`;
        }
      }
      
      // Only update if there are actual changes
      if (Object.keys(updates).length > 0) {
        console.log('Updating form data with route params:', JSON.stringify(updates, null, 2));
        setFormData(prevData => {
          const newData = {
            ...prevData,
            ...updates,
            blockTime: prevData.blockTime // always preserve previous blockTime
          };
          console.log('New form data after route params update:', JSON.stringify(newData, null, 2));
          return newData;
        });
      } else {
        console.log('No updates needed from route params');
      }
    }
  }, [route.params]);

  const handleUpdateCategory = () => {
    navigation.navigate('SelectCategory', {
      taskType: 'recurring',
      gender: route.params.gender || 'male',
      goalTitle: formData.goalTitle || '',
      isFromAdd: true,
      selectedOption: formData.category || undefined
    });
  };

  const handleOpenChecklist = () => {
    navigation.navigate('Checklist', {
      items: formData.checklist?.items || [],
      successCondition: formData.checklist?.successCondition || 'all',
      customCount: formData.checklist?.customCount || 0,
      note: formData.checklist?.note || '',
      taskType: 'recurring',
      gender: route.params.gender || 'male',
      goalTitle: formData.goalTitle || '',
      existingChecklist: formData.checklist || undefined,
      category: formData.category
    });
  };

  const handleOpenTarget = () => {
    navigation.navigate('SelectUnit', {
      gender: route.params.gender || 'male',
      goalTitle: formData.goalTitle || '',
      category: formData.category || undefined,
      target: formData.target || undefined,
      evaluationType: route.params.evaluationType || undefined,
      // blockTime: blockTime
    });
  };

  const handleSaveGoal = async (goalData: FormData) => {
    try {
      setIsSaving(true);

      // Get the start date for conflict checking
      const startDateMoment = goalData.repetition?.selectedDate || moment();
      const formattedStartDate = moment(startDateMoment).format('YYYY-MM-DD');

      // Format block time for API
      let formattedBlockTime = null;
      if (blockTime && blockTime.startTime) {
        const formatTimeForAPI = (time: { hour: number; minute: number; period: 'AM' | 'PM' }) => {
          const hour = time.hour.toString().padStart(2, '0');
          const minute = time.minute.toString().padStart(2, '0');
          return `${hour}:${minute} ${time.period}`;
        };

        formattedBlockTime = {
          block_start_time: formatTimeForAPI(blockTime.startTime),
          block_end_time: blockTime.endTime ? formatTimeForAPI(blockTime.endTime) : null
        };
      }

      console.log('Saving daily plan with data:', JSON.stringify({
        ...goalData,
        ...formattedBlockTime
      }, null, 2));

      // Only check conflicts if block time is set
      if (blockTime && blockTime.startTime) {
        // Convert block times to 24-hour format for comparison
        const startHour = parseInt(blockTime.startTime.hour.toString());
        let startHour24 = startHour;
        if (blockTime.startTime.period === 'PM' && startHour !== 12) {
          startHour24 = startHour + 12;
        } else if (blockTime.startTime.period === 'AM' && startHour === 12) {
          startHour24 = 0;
        }
        const newStartTime = `${startHour24.toString().padStart(2, '0')}:${blockTime.startTime.minute.toString().padStart(2, '0')}`;

        let newEndTime = '';
        if (blockTime.endTime) {
          const endHour = parseInt(blockTime.endTime.hour.toString());
          let endHour24 = endHour;
          if (blockTime.endTime.period === 'PM' && endHour !== 12) {
            endHour24 = endHour + 12;
          } else if (blockTime.endTime.period === 'AM' && endHour === 12) {
            endHour24 = 0;
          }
          newEndTime = `${endHour24.toString().padStart(2, '0')}:${blockTime.endTime.minute.toString().padStart(2, '0')}`;
        }

        // Fetch existing plans for the date
        const existingPlansResponse = await getDailyPlans({ date: formattedStartDate });
        const existingPlans = existingPlansResponse?.data?.data || [];
        console.log('Existing plans:', existingPlans);

        // Check for conflicts with existing plans
        const hasConflict = existingPlans.some((plan: DailyPlan) => {
          if (!plan.block_time?.start_time) {
            console.log('Plan has no start time:', plan);
            return false;
          }

          // Handle case where time might be an object
          const getTimeString = (time: any): string | null => {
            if (!time) return null;
            if (typeof time === 'string') return time;
            if (typeof time === 'object' && time.hour !== undefined && time.minute !== undefined && time.period !== undefined) {
              const hour = time.hour.toString().padStart(2, '0');
              const minute = time.minute.toString().padStart(2, '0');
              return `${hour}:${minute} ${time.period}`;
            }
            console.log('Unrecognized time format:', time);
            return null;
          };

          const existingStartTimeStr = getTimeString(plan.block_time.start_time);
          const existingEndTimeStr = getTimeString(plan.block_time.end_time) || existingStartTimeStr;

          if (!existingStartTimeStr) {
            console.log('Could not parse start time:', plan.block_time.start_time);
            return false;
          }

          console.log('Checking conflict with plan:', {
            existingStartTime: existingStartTimeStr,
            existingEndTime: existingEndTimeStr,
            newStartTime,
            newEndTime,
            planId: plan.id,
            habit: plan.habit,
            block_time: plan.block_time
          });

          try {
            // If the time is already in 24-hour format (HH:mm)
            if (existingStartTimeStr.match(/^\d{2}:\d{2}$/)) {
              const existingStartTime24 = existingStartTimeStr;
              const existingEndTime24 = existingEndTimeStr || existingStartTimeStr;

              console.log('Times in 24h format:', {
                existingStartTime24,
                existingEndTime24,
                newStartTime,
                newEndTime
              });

              // If the new plan has an end time, check for overlap
              if (newEndTime) {
                const isConflict = (
                  (newStartTime >= existingStartTime24 && newStartTime < existingEndTime24) ||
                  (newEndTime > existingStartTime24 && newEndTime <= existingEndTime24) ||
                  (newStartTime <= existingStartTime24 && newEndTime >= existingEndTime24)
                );
                console.log('Conflict check result:', isConflict);
                return isConflict;
              } else {
                // If no end time, just check if the start time falls within any existing time block
                const isConflict = newStartTime >= existingStartTime24 && newStartTime < existingEndTime24;
                console.log('Conflict check result (no end time):', isConflict);
                return isConflict;
              }
            }
            // If the time is in 12-hour format (HH:mm AM/PM)
            else if (existingStartTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)) {
              const startTimeMatch = existingStartTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
              if (!startTimeMatch) {
                console.log('Could not parse existing start time format:', existingStartTimeStr);
                return false;
              }

              const [, existingStartHour, existingStartMinute, existingStartAmPm] = startTimeMatch;
              let existingStartHour24 = parseInt(existingStartHour);
              if (existingStartAmPm.toUpperCase() === 'PM' && existingStartHour24 !== 12) {
                existingStartHour24 += 12;
              } else if (existingStartAmPm.toUpperCase() === 'AM' && existingStartHour24 === 12) {
                existingStartHour24 = 0;
              }
              const existingStartTime24 = `${existingStartHour24.toString().padStart(2, '0')}:${existingStartMinute}`;

              let existingEndTime24 = existingStartTime24;
              if (existingEndTimeStr && existingEndTimeStr !== existingStartTimeStr) {
                const endTimeMatch = existingEndTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                if (endTimeMatch) {
                  const [, existingEndHour, existingEndMinute, existingEndAmPm] = endTimeMatch;
                  let existingEndHour24 = parseInt(existingEndHour);
                  if (existingEndAmPm.toUpperCase() === 'PM' && existingEndHour24 !== 12) {
                    existingEndHour24 += 12;
                  } else if (existingEndAmPm.toUpperCase() === 'AM' && existingEndHour24 === 12) {
                    existingEndHour24 = 0;
                  }
                  existingEndTime24 = `${existingEndHour24.toString().padStart(2, '0')}:${existingEndMinute}`;
                }
              }

              console.log('Converted times for comparison:', {
                existingStartTime24,
                existingEndTime24,
                newStartTime,
                newEndTime
              });

              // If the new plan has an end time, check for overlap
              if (newEndTime) {
                const isConflict = (
                  (newStartTime >= existingStartTime24 && newStartTime < existingEndTime24) ||
                  (newEndTime > existingStartTime24 && newEndTime <= existingEndTime24) ||
                  (newStartTime <= existingStartTime24 && newEndTime >= existingEndTime24)
                );
                console.log('Conflict check result:', isConflict);
                return isConflict;
              } else {
                // If no end time, just check if the start time falls within any existing time block
                const isConflict = newStartTime >= existingStartTime24 && newStartTime < existingEndTime24;
                console.log('Conflict check result (no end time):', isConflict);
                return isConflict;
              }
            } else {
              console.log('Unrecognized time format:', existingStartTimeStr);
              return false;
            }
          } catch (error) {
            console.error('Error checking time conflict:', error, {
              existingStartTime: existingStartTimeStr,
              existingEndTime: existingEndTimeStr,
              newStartTime,
              newEndTime
            });
            return false;
          }
        });

        if (hasConflict) {
          Alert.alert(
            'Time Slot Conflict',
            'This time slot is already blocked by another task. Please choose a different time.',
            [{ text: 'OK' }]
          );
          setIsSaving(false);
          return;
        }
      }

      // Ensure we're using the most up-to-date checklist data
      const updatedPlanData = {
        ...goalData,
        ...formattedBlockTime,
        checklist: formData.checklist,
        task_type: route.params.taskType,
        start_date: formattedStartDate,
        priority: formData.priority,
        status: 'pending',
        evaluation_type: route.params.evaluationType || 'checklist',
        duration: (goalData.duration?.hours || 0) * 60 + (goalData.duration?.minutes || 0)
      };
      
      // Process repetition data based on whether it's one-time or recurring
      if (updatedPlanData.repetition) {
        if (!updatedPlanData.repetition.isRecurring) {
          // For one-time tasks, create a new repetition object with all required properties
          const oneTimeRepetition = {
            isRecurring: false,
            selectedOption: 'One-Time' as RecurringOption,
            selectedDays: {
              Sun: false,
              Mon: false,
              Tue: false,
              Wed: false,
              Thu: false,
              Fri: false,
              Sat: false
            },
            timesPerDay: 1,
            selectedDate: updatedPlanData.repetition.selectedDate,
            periodicValue: 1,
            periodicUnit: 1,
            selectedMonth: '',
            weekOfMonth: '',
            dayOfWeek: ''
          };
          
          updatedPlanData.repetition = oneTimeRepetition;
        } else {
          // For recurring tasks, keep only the relevant data based on selectedOption
          const { isRecurring, selectedOption, selectedDate } = updatedPlanData.repetition;
          const processedRepetition: any = { isRecurring, selectedOption, selectedDate };
          
          switch (selectedOption) {
            case 'Daily':
              processedRepetition.selectedDays = updatedPlanData.repetition.selectedDays;
              processedRepetition.timesPerDay = updatedPlanData.repetition.timesPerDay;
              break;
            case 'Weekly':
              processedRepetition.selectedDays = updatedPlanData.repetition.selectedDays;
              processedRepetition.timesPerDay = updatedPlanData.repetition.timesPerDay;
              break;
            case 'Monthly':
              processedRepetition.periodicValue = updatedPlanData.repetition.periodicValue;
              processedRepetition.periodicUnit = updatedPlanData.repetition.periodicUnit;
              break;
            case 'Specific Days':
              processedRepetition.selectedDays = updatedPlanData.repetition.selectedDays;
              break;
            case 'Periodic':
              processedRepetition.periodicValue = updatedPlanData.repetition.periodicValue;
              processedRepetition.periodicUnit = updatedPlanData.repetition.periodicUnit;
              break;
            case 'Yearly':
              processedRepetition.selectedMonth = updatedPlanData.repetition.selectedMonth;
              processedRepetition.weekOfMonth = updatedPlanData.repetition.weekOfMonth;
              processedRepetition.dayOfWeek = updatedPlanData.repetition.dayOfWeek;
              break;
          }
          
          updatedPlanData.repetition = processedRepetition;
        }
      }
      
      // Call the API to save the daily plan
      console.log('Saving daily plan:', JSON.stringify(updatedPlanData, null, 2));
      
      await saveDailyPlan(updatedPlanData);
      
      // Clear the saved form data after successful save
      await AsyncStorage.removeItem(FORM_DATA_KEY);
      console.log('Form data cleared from AsyncStorage after successful save');
      
      Alert.alert('Success', 'Task saved successfully!');
      
      // Reset navigation stack and navigate to DailyPlan
      navigation.reset({
        index: 0,
        routes: [{ name: 'DailyPlan' }],
      });
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper functions to update form data
  const updateFormData = (field: keyof FormData, value: any) => {
    console.log(`Updating form data field '${field}' with value:`, JSON.stringify(value, null, 2));
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [field]: value
      };
      console.log('Updated form data:', JSON.stringify(newData, null, 2));
      return newData;
    });
  };

  const handleRepetitionChange = (repetitionData: FormData['repetition']) => {
    updateFormData('repetition', repetitionData);
  };

  const handleDurationChange = (durationData: {
    isAllDay: boolean;
    hours: number;
    minutes: number;
  }) => {
    updateFormData('duration', durationData);
  };

  // Add this handler to keep blockTime and formData.blockTime in sync
  const handleBlockTimeChange = (blockTimeData: BlockTimeType) => {
    setBlockTime(blockTimeData);
    setFormData(prev => ({
      ...prev,
      blockTime: blockTimeData
    }));
  };

  return (
        <SetupGoalView
          goalTitle={formData.goalTitle}
          note={formData.note}
          onGoalTitleChange={(text) => updateFormData('goalTitle', text)}
          onNoteChange={(text) => updateFormData('note', text)}
          onClose={() => navigation.goBack()}
          category={formData.category}
          onUpdateCategory={handleUpdateCategory}
          checklist={formData.checklist}
          onSave={handleSaveGoal}
          target={formData.target}
          onTargetChange={(text) => updateFormData('target', text)}
          selectedUnit={formData.selectedUnit}
          onOpenTarget={handleOpenTarget}
          onPriorityChange={(priority) => updateFormData('priority', priority)}
          repetition={formData.repetition}
          onRepetitionChange={handleRepetitionChange}
          duration={formData.duration}
          onDurationChange={handleDurationChange}
          blockTime={blockTime}
          onBlockTimeChange={handleBlockTimeChange}
        />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerButton: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '400',
  },
  setupContent: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
    paddingTop: 0
    
  },
  shadow:{
    width: '100%'
  },
  titleInput: {
    fontSize: 17,
    color: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    // marginTop: 10,
    // marginBottom: 8,
    borderRadius: 12,
    // borderColor:'rgba(167, 167, 167, 1)',
    // borderWidth: .3,
  },
  noteInput: {
    fontSize: 17,
    color: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    minHeight: 40,
    borderRadius: 12,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    // marginBottom: 8,
    //  borderColor:'rgba(167, 167, 167, 1)',
    // borderWidth: .3,
  },
  sectionButtonText: {
    fontSize: 17,
    color: '#000',
  },
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    // marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  doneButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  targetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 8,
  },
  setUnitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  setUnitText: {
    color: '#666',
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    // backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 2,
    marginVertical: 16,
    position: 'relative',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E5E5',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    position: 'relative',
  },
  toggleButtonActive: {
    backgroundColor: 'transparent',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#151B73',
    borderRadius: 1,
  },
  toggleText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#151B73',
  },
  repetitionOptions: {
    marginTop: 16,
  },
  recurringContainer: {
    flex: 1,
  },
  optionsContainer: {
    // padding: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    height: 45,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedOptionButton: {
    backgroundColor: '#151B73',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedOptionButtonText: {
    color: '#FFFFFF',
  },
  contentContainer: {
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  numberInput: {
    width: 60,
    height: 40,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#575757',
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 25,
  },
  inputLabel: {
    fontSize: 14,
    color: '#575656',
    fontWeight: '500',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 10,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 5,
  },
  dayText: {
    fontSize: 14,
    color: '#6A6565',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#6A6565',
    borderRadius: 6,
  },
  // checkedCheckbox: {
  //   backgroundColor: '#151B73',
  // },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  monthButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  selectedMonthButton: {
    backgroundColor: '#151B73',
  },
  monthButtonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedMonthButtonText: {
    color: '#FFFFFF',
  },
  yearlyInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 24,
    // paddingHorizontal: 16,
  },
  yearlyInputRow: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    marginBottom: 0,
  },
  yearlyInputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  yearlyInputWrapper: {
    width: 60,
    // height: 100,
    // backgroundColor: 'blue',
    // borderBottomWidth: 1,
    // borderBottomColor: '#151B73',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 0,
    // Add vertical scroll for picker
  },
  yearlyInputValue: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  everyContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 24,
  },
  everyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 10,
    marginTop: 10,
  },
  everyLabel: {
    fontSize: 14,
    color: '#666',
  },
  everyInput: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
    // height: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#575757',
    borderTopWidth: 1,
    borderTopColor: '#575757',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  weekDayLabel: {
    fontSize: 14,
    color: '#666',
    // textAlign: 'center',
    // justifyContent: 'center',
    flex: 1,
  },
  weekDayCheckbox: {
    alignItems: 'center',
  },
  timeContainer: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 16,
  },
  timePickerSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  timeSection: {
    marginBottom: 20,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
  },
  endTimeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  endTimeToggleLabel: {
    fontSize: 17,
    color: '#000',
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  timeScrollerContainer: {
    width: 60,
    height: 120,
    overflow: 'hidden',
    position: 'relative',
  },
  timeHighlight: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 40,
    marginTop: -20,
    backgroundColor: '#F0F0F0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    zIndex: 1,
  },
  timeScroller: {
    height: 120,
  },
  timeOption: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 20,
    color: '#333',
  },
  selectedTimeText: {
    color: '#151B73',
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 24,
    color: '#333',
    marginHorizontal: 4,
  },
  timeDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 1,
  },
  pickerHighlight: {
    position: 'absolute',
    width: '100%',
    height: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    top: '50%',
    marginTop: -20,
  },
  periodPickerColumn: {
    width: 55,
    marginLeft: 8,
  },
  periodPickerText: {
    fontSize: 18,
    color: '#333',
  },
  durationContainer: {
    marginTop: 8,
    // paddingHorizontal: 16,
  },
  allDayOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeUnitText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 2,
  },
  durationPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  priorityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedPriorityButton: {
    backgroundColor: '#E3F2FD',
  },
  selectedPriorityText: {
    color: '#007AFF',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorButton: {
    borderColor: '#007AFF',
  },
  switchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  switchText: {
    fontSize: 17,
    color: '#000',
  },
  optionText: {
    fontSize: 17,
    color: '#000',
  },
  sectionContent: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
  },
  checklistPreview: {
    marginTop: 8,
    paddingLeft: 8,
  },
  checklistItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  successCondition: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  quickDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  quickDateButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
  },
  selectedQuickDateButton: {
    backgroundColor: '#151B73',
  },
  quickDateText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedQuickDateText: {
    color: '#FFFFFF',
  },
  calendarWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  oneTimeContainer: {
    // padding: 16,
  },
  calendar: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 16,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F2552',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  datesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  dateButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDateButton: {
    backgroundColor: '#151B73',
    borderRadius: 20,

  },
  emptyDate: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dateText: {
    color: '#333',
    fontSize: 14,
  },
  selectedDateText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  monthDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  monthDayHeaderText: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  monthDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  monthDayBox: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E9E9E9',
    backgroundColor: '#FFFFFF',
  },
  selectedMonthDayBox: {
    backgroundColor: '#151B73',
  },
  monthDayText: {
    fontSize: 14,
    color: '#333',
  },
  selectedMonthDayText: {
    color: '#FFFFFF',
  },
  monthlyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 10,
    gap: 8,
  },
  monthlyNumberInputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#151B73',
    width: 40,
    alignItems: 'center',
  },
  monthlyNumberInput: {
    width: 40,
    height: 40,
    textAlign: 'center',
    fontSize: 16,
    padding: 0,
  },
  monthsContainer: {
    // paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E9E9E9',
    // borderRadius: 8,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // borderBottomWidth: 1,
    // borderBottomColor: '#E9E9E9',
    marginBottom: 12
  },
  monthRowTable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E9',
  },
  monthButtonTable: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E9E9E9',
  },
  selectedMonthButtonTable: {
    backgroundColor: '#151B73',
  },
  monthButtonTextTable: {
    fontSize: 14,
    color: '#333',
  },
  selectedMonthButtonTextTable: {
    color: '#FFFFFF',
  },
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationInput: {
    width: 40,
    height: 40,
    fontSize: 16,
    textAlign: 'center',
    padding: 0,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#151B73',
    paddingBottom: 4,
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  periodButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  selectedPeriodButton: {
    backgroundColor: '#151B73',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
  },
  selectedPeriodText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  goalsList: {
    maxHeight: 400,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  selectedGoalItem: {
    backgroundColor: '#F0F8FF',
  },
  goalTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  goalType: {
    fontSize: 14,
    color: '#666',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  linkButtonText: {
    fontSize: 16,
    color: '#000',
  },
  timePickerSelectionIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 40,
    marginTop: -20,
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    zIndex: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
});

// --- Placeholders for FrequencyView and EveryView ---
const FrequencyView = ({ onClose, onSave, initialData }: any) => (
   <View style={{marginBottom:10}}>
      <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset=
      {[0, 0.25]} style={styles.shadow}>
        <TouchableOpacity 
          style={styles.sectionButton}
          // onPress={() => setShowEvery(true)}
        >
          <Text style={styles.sectionButtonText}>Frequency</Text>
          <Text style={styles.sectionButtonText}>1 Time Per day</Text>
          
        </TouchableOpacity>
      </Shadow>
    </View>
);
const EveryView = ({ onClose, onSave, initialData }: any) => (
   <View style={{marginBottom:10}}>
      <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset=
      {[0, 0.25]} style={styles.shadow}>
        <TouchableOpacity 
          style={styles.sectionButton}
          // onPress={() => setShowEvery(true)}
      >
        <Text style={styles.sectionButtonText}>Every</Text>
        <Text style={styles.sectionButtonText}>Year</Text>
        
      </TouchableOpacity>
    </Shadow>
    </View>
);

// RecurringBlockTimeView: for recurring tasks, always show both pickers side by side, no toggle
const RecurringBlockTimeView = ({
  onClose,
  onSave,
  initialData
}: BlockTimeViewProps) => {
  const [startHour, setStartHour] = useState(initialData?.startTime?.hour?.toString().padStart(2, '0') ?? '12');
  const [startMinute, setStartMinute] = useState(initialData?.startTime?.minute?.toString().padStart(2, '0') ?? '00');
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>(initialData?.startTime?.period ?? 'AM');
  const [endHour, setEndHour] = useState(initialData?.endTime?.hour?.toString().padStart(2, '0') ?? '12');
  const [endMinute, setEndMinute] = useState(initialData?.endTime?.minute?.toString().padStart(2, '0') ?? '00');
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>(initialData?.endTime?.period ?? 'PM');

  const handleSave = () => {
    onSave({
      startTime: {
        hour: parseInt(startHour),
        minute: parseInt(startMinute),
        period: startPeriod
      },
      endTime: {
        hour: parseInt(endHour),
        minute: parseInt(endMinute),
        period: endPeriod
      }
    });
    onClose();
  };

  return (
    <View style={styles.whiteCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Block Time</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'column', gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.timeLabel}>Start Time</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.timeLabel}>End Time</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Start Time Picker */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <TimePicker
              hour={startHour}
              minute={startMinute}
              amPm={startPeriod}
              onHourChange={setStartHour}
              onMinuteChange={setStartMinute}
              onAmPmChange={v => setStartPeriod(v as 'AM' | 'PM')}
            />
          </View>
          {/* End Time Picker */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <TimePicker
              hour={endHour}
              minute={endMinute}
              amPm={endPeriod}
              onHourChange={setEndHour}
              onMinuteChange={setEndMinute}
              onAmPmChange={v => setEndPeriod(v as 'AM' | 'PM')}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default RecurringGoal; 