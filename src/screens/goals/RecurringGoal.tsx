import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Switch,
  Keyboard,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Slider from '@react-native-community/slider';
import { getStoredUser, saveRecurringGoal } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

type RecurringOption = 'Daily' | 'Weekly' | 'Monthly' | 'Specific Days' | 'Periodic' | 'Yearly';

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
  color: string;
  addToCalendar: boolean;
  addReminder: boolean;
  addPomodoro: boolean;
  startTime: string;
  endTime: string;
  frequency: string;
  reminder: boolean;
  reminderTime: string;
  linkedGoalId?: string;
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

type RepetitionViewProps = {
  onClose: () => void;
  onSave: (repetitionData: {
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
  initialData?: {
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
};

const RepetitionView = ({ onClose, onSave, initialData }: RepetitionViewProps) => {
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring ?? true);
  const [selectedOption, setSelectedOption] = useState<RecurringOption>(initialData?.selectedOption ?? 'Daily');
  const [selectedDays, setSelectedDays] = useState<DaysState>(initialData?.selectedDays ?? {
    Sun: true,
    Mon: true,
    Tue: true,
    Wed: true,
    Thu: true,
    Fri: true,
    Sat: true
  });
  const [timesPerDay, setTimesPerDay] = useState(initialData?.timesPerDay ?? 10);
  const [selectedDate, setSelectedDate] = useState(initialData?.selectedDate ?? new Date());
  const [periodicValue, setPeriodicValue] = useState(initialData?.periodicValue ?? 1);
  const [periodicUnit, setPeriodicUnit] = useState(initialData?.periodicUnit ?? 2);
  const [selectedMonth, setSelectedMonth] = useState(initialData?.selectedMonth ?? '');
  const [weekOfMonth, setWeekOfMonth] = useState(initialData?.weekOfMonth ?? '1st');
  const [dayOfWeek, setDayOfWeek] = useState(initialData?.dayOfWeek ?? 'Day');

  const handleDayToggle = (day: DayType) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleSave = () => {
    onSave({
      isRecurring,
      selectedOption,
      selectedDays,
      timesPerDay,
      selectedDate,
      periodicValue,
      periodicUnit,
      selectedMonth,
      weekOfMonth,
      dayOfWeek
    });
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
                      isSelected && styles.checkedCheckbox
                    ]}
                    onPress={() => handleDayToggle(day as DayType)}
                  >
                    {isSelected && <Icon name="check" size={18} color="#FFFFFF" />}
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
                      isSelected && styles.checkedCheckbox
                    ]}
                    onPress={() => handleDayToggle(day as DayType)}
                  >
                    {isSelected && <Icon name="check" size={18} color="#FFFFFF" />}
                  </TouchableOpacity>
                </View>
              ))}
            </View> */}
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10}}>
            
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.numberInput}
                  keyboardType="numeric"
                  value={timesPerDay.toString()}
                  onChangeText={(text) => setTimesPerDay(parseInt(text) || 0)}
                />
                <Text style={styles.inputLabel}> Per Day</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.numberInput}
                  keyboardType="numeric"
                  value={timesPerDay.toString()}
                  onChangeText={(text) => setTimesPerDay(parseInt(text) || 0)}
                />
                <Text style={styles.inputLabel}>Week</Text>
              </View>
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
              <View style={styles.weekDaysHeader}>
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
              </View>
              <View style={styles.monthsContainer}>
                {[
                  ['Jan', 'Feb', 'Mar', 'Apr'],
                  ['May', 'Jun', 'Jul', 'Aug'],
                  ['Sep', 'Oct', 'Nov', 'Dec']
                ].map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.monthRow}>
                    {row.map((month) => (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.monthButton,
                          selectedMonth === month && styles.selectedMonthButton
                        ]}
                        onPress={() => setSelectedMonth(month)}
                      >
                        <Text style={[
                          styles.monthButtonText,
                          selectedMonth === month && styles.selectedMonthButtonText
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
                  <View style={styles.yearlyInputWrapper}>
                    <Text style={styles.yearlyInputValue}>2nd</Text>
                  </View>
                </View>
                <View style={styles.yearlyInputRow}>
                  <Text style={styles.yearlyInputLabel}>Week of month</Text>
                  <View style={styles.yearlyInputWrapper}>
                    <Text style={styles.yearlyInputValue}>Day</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.everyContainer}>
              <View style={styles.everyRow}>
                <Text style={styles.everyLabel}>Every</Text>
                <TextInput
                  style={styles.everyInput}
                  keyboardType="numeric"
                  value="1"
                />
                <Text style={styles.everyLabel}>Year</Text>
              </View>
            </View>
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
      </View>
    );
  };

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
      {isRecurring ? renderRecurringOptions() : <OneTimeView />}
    </View>
  );
};

const OneTimeView = () => {
  const [selectedQuickDate, setSelectedQuickDate] = useState('Today');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleQuickDateSelect = (option: string) => {
    setSelectedQuickDate(option);
    
    const today = new Date();
    switch (option) {
      case 'Today':
        setSelectedDate(today);
        break;
      case 'Tomorrow':
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        setSelectedDate(tomorrow);
        break;
      case 'Someday':
        // Keep current selected date for calendar selection
        break;
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedQuickDate('Someday');
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
  const [startHour, setStartHour] = useState(initialData?.startTime?.hour?.toString() ?? '12');
  const [startMinute, setStartMinute] = useState(initialData?.startTime?.minute?.toString().padStart(2, '0') ?? '00');
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>(initialData?.startTime?.period ?? 'AM');
  const [endHour, setEndHour] = useState(initialData?.endTime?.hour?.toString() ?? '12');
  const [endMinute, setEndMinute] = useState(initialData?.endTime?.minute?.toString().padStart(2, '0') ?? '00');
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>(initialData?.endTime?.period ?? 'PM');

  const handleMinuteChange = (value: string, setMinute: (value: string) => void) => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Handle empty input
    if (numericValue === '') {
      setMinute('00');
      return;
    }

    // Convert to number and validate
    const num = parseInt(numericValue);
    if (num >= 0 && num <= 59) {
      // Pad with leading zero if single digit
      setMinute(num.toString().padStart(2, '0'));
    } else if (num > 59) {
      setMinute('59');
    }
  };

  const handleSave = () => {
    // Ensure minutes are properly formatted before saving
    const formatMinute = (min: string) => {
      const num = parseInt(min) || 0;
      return Math.min(Math.max(num, 0), 59).toString().padStart(2, '0');
    };

    onSave({
      startTime: {
        hour: parseInt(startHour) || 12,
        minute: parseInt(formatMinute(startMinute)),
        period: startPeriod
      },
      endTime: {
        hour: parseInt(endHour) || 12,
        minute: parseInt(formatMinute(endMinute)),
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

      <View style={styles.timeContainer}>
        <View style={styles.timeSection}>
          <Text style={styles.timeLabel}>Start Time</Text>
          <View style={styles.timePickerRow}>
            <View style={styles.durationInputContainer}>
              <TextInput
                style={styles.durationInput}
                keyboardType="numeric"
                value={startHour}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  if (num >= 1 && num <= 12) {
                    setStartHour(text);
                  }
                }}
                maxLength={2}
              />
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.durationInputContainer}>
              <TextInput
                style={styles.durationInput}
                keyboardType="numeric"
                value={startMinute}
                onChangeText={(text) => handleMinuteChange(text, setStartMinute)}
                maxLength={2}
              />
            </View>
            <View style={styles.periodContainer}>
              <TouchableOpacity
                style={[styles.periodButton, startPeriod === 'AM' && styles.selectedPeriodButton]}
                onPress={() => setStartPeriod('AM')}
              >
                <Text style={[styles.periodText, startPeriod === 'AM' && styles.selectedPeriodText]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, startPeriod === 'PM' && styles.selectedPeriodButton]}
                onPress={() => setStartPeriod('PM')}
              >
                <Text style={[styles.periodText, startPeriod === 'PM' && styles.selectedPeriodText]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.timeDivider} />

        <View style={styles.timeSection}>
          <Text style={styles.timeLabel}>End Time</Text>
          <View style={styles.timePickerRow}>
            <View style={styles.durationInputContainer}>
              <TextInput
                style={styles.durationInput}
                keyboardType="numeric"
                value={endHour}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  if (num >= 1 && num <= 12) {
                    setEndHour(text);
                  }
                }}
                maxLength={2}
              />
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.durationInputContainer}>
              <TextInput
                style={styles.durationInput}
                keyboardType="numeric"
                value={endMinute}
                onChangeText={(text) => handleMinuteChange(text, setEndMinute)}
                maxLength={2}
              />
            </View>
            <View style={styles.periodContainer}>
              <TouchableOpacity
                style={[styles.periodButton, endPeriod === 'AM' && styles.selectedPeriodButton]}
                onPress={() => setEndPeriod('AM')}
              >
                <Text style={[styles.periodText, endPeriod === 'AM' && styles.selectedPeriodText]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, endPeriod === 'PM' && styles.selectedPeriodButton]}
                onPress={() => setEndPeriod('PM')}
              >
                <Text style={[styles.periodText, endPeriod === 'PM' && styles.selectedPeriodText]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
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

const TimeScroller = ({ 
  values, 
  selectedValue, 
  onValueChange 
}: { 
  values: number[] | string[], 
  selectedValue: number | string,
  onValueChange: (value: number | string) => void 
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [mounted, setMounted] = useState(false);
  const itemHeight = 40;

  useEffect(() => {
    if (mounted && scrollViewRef.current) {
      const selectedIndex = values.findIndex(v => v === selectedValue);
      if (selectedIndex !== -1) {
        scrollViewRef.current.scrollTo({
          y: selectedIndex * itemHeight,
          animated: false
        });
      }
    }
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    if (index >= 0 && index < values.length) {
      onValueChange(values[index]);
    }
  };

  const renderItem = (value: number | string) => {
    const isSelected = value === selectedValue;
    return (
      <View key={value} style={[styles.timeOption, { height: itemHeight }]}>
        <Text style={[
          styles.timeText,
          isSelected && styles.selectedTimeText
        ]}>
          {typeof value === 'number' ? value.toString().padStart(2, '0') : value}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.timeScrollerContainer}>
      <View style={styles.timeHighlight} />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        style={styles.timeScroller}
        contentContainerStyle={{
          paddingVertical: itemHeight
        }}
      >
        {values.map(renderItem)}
      </ScrollView>
    </View>
  );
};

const DurationView = ({ onClose, onSave, initialData }: DurationViewProps) => {
  const [isAllDay, setIsAllDay] = useState(initialData?.isAllDay ?? false);
  const [hours, setHours] = useState(initialData?.hours?.toString() ?? '0');
  const [minutes, setMinutes] = useState(initialData?.minutes?.toString() ?? '0');

  const handleSave = () => {
    onSave({
      isAllDay,
      hours: parseInt(hours) || 0,
      minutes: parseInt(minutes) || 0
    });
    onClose();
  };

  return (
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
          <Switch
            value={isAllDay}
            onValueChange={setIsAllDay}
            trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
          />
        </View>
        {!isAllDay && (
          <View style={styles.durationPickerRow}>
            <View style={styles.durationInputContainer}>
              <TextInput
                style={styles.durationInput}
                keyboardType="numeric"
                value={hours}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  if (num >= 0 && num <= 23) {
                    setHours(text);
                  }
                }}
                maxLength={2}
              />
              <Text style={styles.timeUnitText}>hour</Text>
            </View>
            <View style={styles.durationInputContainer}>
              <TextInput
                style={styles.durationInput}
                keyboardType="numeric"
                value={minutes}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  if (num >= 0 && num <= 59) {
                    setMinutes(text);
                  }
                }}
                maxLength={2}
              />
              <Text style={styles.timeUnitText}>min</Text>
            </View>
          </View>
        )}
      </View>
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
  repetition,
  onRepetitionChange,
  duration,
  onDurationChange,
  blockTime,
  onBlockTimeChange
}: SetupGoalViewProps) => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const [showTarget, setShowTarget] = useState(false);
  const [showRepetition, setShowRepetition] = useState(false);
  const [showBlockTime, setShowBlockTime] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [addReminder, setAddReminder] = useState(false);
  const [addPomodoro, setAddPomodoro] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLinkGoal, setShowLinkGoal] = useState(false);
  const [linkedGoalId, setLinkedGoalId] = useState<string | undefined>();

  const colors = [
    '#FF4B4B', '#FF8A3D', '#FFD43D', '#4CAF50', '#2196F3', '#3F51B5',
    '#3F51B5', '#E91E63', '#9C27B0', '#795548', '#607D8B', '#9E9E9E'
  ];

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
    navigation.navigate('DefineTask', {
      taskType: 'recurring',
      gender: route.params.gender || 'male',
      goalTitle: goalTitle || '',
      existingChecklist: checklist || undefined,
      category: category
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
        color: selectedColor,
        addToCalendar,
        addReminder,
        addPomodoro,
        linkedGoalId
      };
      
      console.log('Saving goal data:', JSON.stringify(goalData, null, 2));
      
      // Call the onSave function passed from parent
      await onSave(goalData);
      
      // Navigate back or to another screen
      navigation.goBack();
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
    minutes: number;
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

  const ColorView = () => (
    <View style={styles.whiteCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Color</Text>
        <TouchableOpacity onPress={() => setShowColor(false)}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.colorGrid}>
        {colors.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColorButton
            ]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={returnToHome}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Recurring Goal</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.headerButton}>Done</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.setupContent}>
        <TextInput
          style={styles.titleInput}
          value={goalTitle}
          onChangeText={onGoalTitleChange}
          placeholder="Enter Goal Title"
          placeholderTextColor="#666"
        />
        
        <TouchableOpacity 
          style={styles.sectionButton}
          onPress={onUpdateCategory}
        >
          <Text style={styles.sectionButtonText}>
            {category ? `Category: ${category}` : 'Select Category'}
          </Text>
          <Icon name="edit" size={24} color="#999" />
        </TouchableOpacity>

        <TextInput
          style={styles.noteInput}
          placeholder="Enter Note"
          value={note}
          onChangeText={onNoteChange}
          placeholderTextColor="#666"
          multiline
        />
        
        <TouchableOpacity 
          style={styles.sectionButton}
          onPress={handleOpenChecklist}
        >
          <Text style={styles.sectionButtonText}>
            Checklist
          </Text>
          <Icon name="add" size={24} color="#999" />
        </TouchableOpacity>
        
        {showTarget ? (
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
        ) : (
          <TouchableOpacity 
            style={styles.sectionButton}
            onPress={() => setShowTarget(true)}
          >
            <Text style={styles.sectionButtonText}>Target</Text>
            <Icon name="add" size={24} color="#999" />
          </TouchableOpacity>
        )}

        {showRepetition ? (
          <RepetitionView 
            onClose={() => setShowRepetition(false)} 
            onSave={handleRepetitionSave}
            initialData={repetition}
          />
        ) : (
          <TouchableOpacity 
            style={styles.sectionButton}
            onPress={() => setShowRepetition(true)}
          >
            <Text style={styles.sectionButtonText}>Repetition</Text>
            <Icon name="add" size={24} color="#999" />
          </TouchableOpacity>
        )}

        {showBlockTime ? (
          <BlockTimeView 
            onClose={() => setShowBlockTime(false)} 
            onSave={handleBlockTimeSave}
            initialData={blockTime}
          />
        ) : (
          <TouchableOpacity 
            style={styles.sectionButton}
            onPress={() => setShowBlockTime(true)}
          >
            <Text style={styles.sectionButtonText}>Block Time</Text>
            <Icon name="add" size={24} color="#999" />
          </TouchableOpacity>
        )}

        {showDuration ? (
          <DurationView 
            onClose={() => setShowDuration(false)} 
            onSave={handleDurationSave}
            initialData={duration}
          />
        ) : (
          <TouchableOpacity 
            style={styles.sectionButton}
            onPress={() => setShowDuration(true)}
          >
            <Text style={styles.sectionButtonText}>Duration</Text>
            <Icon name="add" size={24} color="#999" />
          </TouchableOpacity>
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
                onPress={() => setSelectedPriority('Must')}
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
                onPress={() => setSelectedPriority('Important')}
              >
                <Text style={[
                  styles.priorityButtonText,
                  selectedPriority === 'Important' && styles.selectedPriorityText
                ]}>Important</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.sectionButton}
            onPress={() => setShowPriority(true)}
          >
            <Text style={styles.sectionButtonText}>Priority</Text>
            <Icon name="add" size={24} color="#999" />
          </TouchableOpacity>
        )}

        {showColor ? (
          <ColorView />
        ) : (
          <TouchableOpacity 
            style={styles.sectionButton}
            onPress={() => setShowColor(true)}
          >
            <Text style={styles.sectionButtonText}>Color</Text>
            <Icon name="add" size={24} color="#999" />
          </TouchableOpacity>
        )}


           <TouchableOpacity 
           style={styles.sectionButton}
           onPress={() => navigation.navigate('SavedGoals')}
         >

           <Text style={styles.sectionButtonText}>Link to Goal</Text>
             <Icon name="add" size={24} color="#999" />
         </TouchableOpacity>
        

        <View style={styles.switchSection}>
          <Text style={styles.switchText}>Add a Reminder</Text>
          <Switch
            value={addReminder}
            onValueChange={setAddReminder}
            trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
            ios_backgroundColor="#E5E5E5"
          />
        </View>

        <View style={styles.switchSection}>
          <Text style={styles.switchText}>Add to Google Calendar</Text>
          <Switch
            value={addToCalendar}
            onValueChange={setAddToCalendar}
            trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
            ios_backgroundColor="#E5E5E5"
          />
        </View>

        <TouchableOpacity style={styles.calendarSelect}>
          <Text style={styles.calendarSelectText}>Select Calendar</Text>
        </TouchableOpacity>

        <View style={styles.switchSection}>
          <Text style={styles.switchText}>Add Pomodoro</Text>
          <Switch
            value={addPomodoro}
            onValueChange={setAddPomodoro}
            trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
            ios_backgroundColor="#E5E5E5"
          />
        </View>

       
      </ScrollView>
    </View>
  );
};

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
    color: '',
    addToCalendar: false,
    addReminder: false,
    addPomodoro: false,
    startTime: '09:00',
    endTime: '17:00',
    frequency: 'daily',
    reminder: false,
    reminderTime: '09:00'
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
        console.log('Attempting to save form data:', JSON.stringify(formData, null, 2));
        const currentData = await AsyncStorage.getItem(FORM_DATA_KEY);
        const parsedCurrentData = currentData ? JSON.parse(currentData) : null;
        
        console.log('Current data in storage:', JSON.stringify(parsedCurrentData, null, 2));
        
        // Only save if the data has actually changed
        if (JSON.stringify(parsedCurrentData) !== JSON.stringify(formData)) {
          console.log('Data has changed, saving to AsyncStorage');
          await AsyncStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
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
  }, [formData]);

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
          if (parsedData.color) updatedData.color = parsedData.color;
          
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
            ...updates
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
    console.log('Opening checklist with current data:', JSON.stringify(formData.checklist, null, 2));
    navigation.navigate('DefineTask', {
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
      target: formData.target || undefined
    });
  };

  const handleSaveGoal = async (goalData: FormData) => {
    try {
      setIsSaving(true);
      console.log('Saving recurring goal with data:', JSON.stringify({
        ...goalData,
        blockTime
      }, null, 2));
      
      // Ensure we're using the most up-to-date checklist data
      const updatedGoalData = {
        ...goalData,
        checklist: formData.checklist
      };
      
      // Process repetition data based on whether it's one-time or recurring
      if (updatedGoalData.repetition) {
        if (!updatedGoalData.repetition.isRecurring) {
          // For one-time goals, only keep the selectedDate
          updatedGoalData.repetition = {
            isRecurring: false,
            selectedDate: updatedGoalData.repetition.selectedDate
          };
        } else {
          // For recurring goals, keep only the relevant data based on selectedOption
          const { isRecurring, selectedOption, selectedDate } = updatedGoalData.repetition;
          const processedRepetition: any = { isRecurring, selectedOption, selectedDate };
          
          switch (selectedOption) {
            case 'Daily':
              processedRepetition.selectedDays = updatedGoalData.repetition.selectedDays;
              processedRepetition.timesPerDay = updatedGoalData.repetition.timesPerDay;
              break;
            case 'Weekly':
              processedRepetition.selectedDays = updatedGoalData.repetition.selectedDays;
              processedRepetition.timesPerDay = updatedGoalData.repetition.timesPerDay;
              break;
            case 'Monthly':
              processedRepetition.periodicValue = updatedGoalData.repetition.periodicValue;
              processedRepetition.periodicUnit = updatedGoalData.repetition.periodicUnit;
              break;
            case 'Specific Days':
              processedRepetition.selectedDays = updatedGoalData.repetition.selectedDays;
              break;
            case 'Periodic':
              processedRepetition.periodicValue = updatedGoalData.repetition.periodicValue;
              processedRepetition.periodicUnit = updatedGoalData.repetition.periodicUnit;
              break;
            case 'Yearly':
              processedRepetition.selectedMonth = updatedGoalData.repetition.selectedMonth;
              processedRepetition.weekOfMonth = updatedGoalData.repetition.weekOfMonth;
              processedRepetition.dayOfWeek = updatedGoalData.repetition.dayOfWeek;
              break;
          }
          
          updatedGoalData.repetition = processedRepetition;
        }
      }
      
      // Call the API to save the recurring goal
      console.log('Saving recurring goal:', JSON.stringify(updatedGoalData, null, 2));
      
      // Call the API to save the recurring goal
      await saveRecurringGoal(updatedGoalData);
      
      // Clear the saved form data after successful save
      await AsyncStorage.removeItem(FORM_DATA_KEY);
      console.log('Form data cleared from AsyncStorage after successful save');
      
      Alert.alert('Success', 'Recurring goal saved successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving recurring goal:', error);
      Alert.alert('Error', 'Failed to save recurring goal. Please try again.');
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

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff"
      />
      <SafeAreaView style={styles.safeArea}>
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
          repetition={formData.repetition}
          onRepetitionChange={handleRepetitionChange}
          duration={formData.duration}
          onDurationChange={handleDurationChange}
          blockTime={blockTime}
          onBlockTimeChange={setBlockTime}
        />
      </SafeAreaView>
    </View>
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
  },
  titleInput: {
    fontSize: 17,
    color: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 12,
    borderColor:'rgba(167, 167, 167, 1)',
    borderWidth: .3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        // elevation: 2,
        
      },
    }),
  },
  noteInput: {
    fontSize: 17,
    color: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    minHeight: 40,
    borderRadius: 12,
     borderColor:'rgba(167, 167, 167, 1)',
    borderWidth: .3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        // elevation: 2,
      },
    }),
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
     borderColor:'rgba(167, 167, 167, 1)',
    borderWidth: .3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        // elevation: 2,
      },
    }),
  },
  sectionButtonText: {
    fontSize: 17,
    color: '#000',
  },
  whiteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 2,
    marginVertical: 16,
    position: 'relative',
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
    bottom: -2,
    left: '15%',
    right: '15%',
    height: 2,
    backgroundColor: '#007AFF',
    borderRadius: 1,
  },
  toggleText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#007AFF',
  },
  repetitionOptions: {
    marginTop: 16,
  },
  recurringContainer: {
    flex: 1,
  },
  optionsContainer: {
    padding: 16,
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
    marginTop: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  numberInput: {
    width: 60,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#151B73',
    textAlign: 'center',
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 4,
  },
  checkedCheckbox: {
    backgroundColor: '#151B73',
  },
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
    marginTop: 24,
    paddingHorizontal: 16,
  },
  yearlyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  yearlyInputLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 16,
    minWidth: 100,
  },
  yearlyInputWrapper: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#151B73',
    paddingBottom: 4,
  },
  yearlyInputValue: {
    fontSize: 16,
    color: '#333',
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
  },
  everyLabel: {
    fontSize: 14,
    color: '#666',
  },
  everyInput: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    padding: 0,
    height: 32,
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
    textAlign: 'center',
    flex: 1,
  },
  weekDayCheckbox: {
    alignItems: 'center',
  },
  timeContainer: {
    paddingHorizontal: 16,
  },
  timeSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F5',
    borderRadius: 8,
    padding: 8,
    height: 120,
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
  timePickerColumn: {
    height: 120,
    width: 45,
    marginHorizontal: 2,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  timePickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  timePickerText: {
    fontSize: 22,
    color: '#333',
    fontWeight: '400',
  },
  selectedTimePickerText: {
    color: '#333',
    fontWeight: '600',
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
    paddingHorizontal: 16,
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
    marginBottom: 8,
     borderColor:'rgba(167, 167, 167, 1)',
    borderWidth: .3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        // elevation: 2,
      },
    }),
  },
  switchText: {
    fontSize: 17,
    color: '#000',
  },
  calendarSelect: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
     borderColor:'rgba(167, 167, 167, 1)',
    borderWidth: .3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        // elevation: 2,
      },
    }),
  },
  calendarSelectText: {
    fontSize: 17,
    color: '#999',
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
    padding: 16,
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
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
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
  },
  monthDayBox: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
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
    paddingHorizontal: 16,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
});

export default RecurringGoal; 