import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  TextInput,
  Switch,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import { saveTempGoalData, clearTempGoalData } from '../../services/tempGoalStorage';
import { saveDailyPlan, getDailyPlans } from '../../services/api';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import TimePicker from '../../components/TimePicker';
import Layout from '../../components/Layout';
import ProgressIndicator from '../../components/ProgressIndicator';
import CustomSwitch from '../../components/CustomSwitch';

type FrequencyOption = 'every-day' | 'specific-days-week' | 'specific-days-month' | 'specific-days-year' | 'some-days-period' | 'repeat';
type ReminderType = 'dont-remind' | 'notification' | 'alarm';
type ReminderSchedule = 'always-enabled' | 'specific-days' | 'days-before';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DailyPlanSchedule'>;
type RouteType = RouteProp<RootStackParamList, 'DailyPlanSchedule'> & {
  params: {
    category: string;
    taskType: string;
    gender: 'male' | 'female';
    evaluationType: string;
    habit: string;
    description: string;
    selectedOption: string;
    frequency: FrequencyOption;
    selectedDays?: string[];
    isFlexible: boolean;
    checklist_items?: ChecklistItem[];
    numeric_value: number;
    numeric_condition: string;
    numeric_unit: string;
  };
};

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// Update the RootStackParamList to include DailyPlanConfirmation
declare global {
  namespace ReactNavigation {
    interface RootStackParamList {
      DailyPlanConfirmation: {
        category: string;
        taskType: string;
        gender: 'male' | 'female';
        evaluationType: string;
        habit: string;
        description: string;
        frequency: FrequencyOption;
        selectedDays?: string[];
        isFlexible: boolean;
        startDate: string;
        endDate: string;
        timeAndReminders: number;
        priority: string;
        blockTime: number;
        pomodoro: number;
      };
      DailyPlanSchedule: {
        category: string;
        taskType: string;
        gender: 'male' | 'female';
        evaluationType: string;
        habit: string;
        description: string;
        selectedOption: string;
        frequency: FrequencyOption;
        selectedDays?: string[];
        isFlexible: boolean;
        checklist_items?: ChecklistItem[];
        numeric_value: number;
        numeric_condition: string;
        numeric_unit: string;
      };
    }
  }
}

const PRIORITY_OPTIONS = ['Must', 'Should', 'Could', 'Would'];

type RouteParams = {
  category: string;
  taskType: string;
  gender: 'male' | 'female';
  evaluationType: string;
  habit: string;
  description: string;
  selectedOption: string;
  frequency: 'every-day' | 'specific-days-week' | 'specific-days-month' | 'specific-days-year' | 'some-days-period' | 'repeat';
  selectedDays?: string[];
  numeric_value: number;
  numeric_condition: string;
  numeric_unit: string;
  checklist_items?: any[];
};

const DailyPlanSchedule = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { category, taskType, gender, evaluationType, habit, description, frequency, selectedDays, isFlexible } = route.params;
  const [isSaving, setIsSaving] = useState(false);

  const [startDate, setStartDate] = useState('Today');
  const [endDate, setEndDate] = useState('');
  const [timeAndReminders, setTimeAndReminders] = useState(0);
  const [priority, setPriority] = useState('Must');
  const [blockTime, setBlockTime] = useState(0);
  const [pomodoro, setPomodoro] = useState(0);
  const [daysCount, setDaysCount] = useState('60');
  const [isEndDateEnabled, setIsEndDateEnabled] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [activeDate, setActiveDate] = useState<'start' | 'end'>('start');
  const [isPriorityDropdownVisible, setIsPriorityDropdownVisible] = useState(false);
  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [reminderType, setReminderType] = useState<ReminderType>('notification');
  const [reminderSchedule, setReminderSchedule] = useState<ReminderSchedule>('always-enabled');
  const [daysBeforeCount, setDaysBeforeCount] = useState('2');
  const [hoursBeforeCount, setHoursBeforeCount] = useState('');
  const [selectedWeekDays, setSelectedWeekDays] = useState<string[]>([]);
  const [isSimpleReminderModalVisible, setIsSimpleReminderModalVisible] = useState(false);
  const [isBlockTimeModalVisible, setIsBlockTimeModalVisible] = useState(false);
  const [blockStartTime, setBlockStartTime] = useState('');
  const [blockEndTime, setBlockEndTime] = useState('');
  const [isEndTimeEnabled, setIsEndTimeEnabled] = useState(false);
  const [blockStartHour, setBlockStartHour] = useState('09');
  const [blockStartMinute, setBlockStartMinute] = useState('00');
  const [blockStartAmPm, setBlockStartAmPm] = useState('AM');
  const [blockEndHour, setBlockEndHour] = useState('05');
  const [blockEndMinute, setBlockEndMinute] = useState('00');
  const [blockEndAmPm, setBlockEndAmPm] = useState('PM');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(moment());

  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const amPmOptions = ['AM', 'PM'];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateSelect = (date: any) => {
    setSelectedCalendarDate(moment(date));
  };

  const handleCalendarConfirm = () => {
    const momentDate = selectedCalendarDate;
    
    if (activeDate === 'start') {
        setStartDate(momentDate.format('ddd, MMM D'));
    } else {
        const formattedEndDate = momentDate.format('YYYY-MM-DD');
        setEndDate(formattedEndDate);
        
        const startMoment = startDate === 'Today' ? moment() : moment(startDate, 'ddd, MMM D');
        const days = momentDate.diff(startMoment, 'days');
        setDaysCount(days.toString());
    }
    setIsCalendarVisible(false);
  };

  const openCalendar = (type: 'start' | 'end') => {
    if (type === 'end' && !isEndDateEnabled) return;
    setActiveDate(type);
    setIsCalendarVisible(true);
  };

  const handleTimeSelect = () => {
    const startTimeFormatted = `${blockStartHour}:${blockStartMinute} ${blockStartAmPm}`;
    const endTimeFormatted = `${blockEndHour}:${blockEndMinute} ${blockEndAmPm}`;
    
    setBlockStartTime(startTimeFormatted);
    setBlockEndTime(endTimeFormatted);
    setBlockTime(1); // Set to 1 to indicate time has been selected
    setIsBlockTimeModalVisible(false);
  };

  const handleNext = async () => {

    if (blockTime === 0 && blockStartTime === '') {
      Alert.alert('Required Field', 'Please set a start time for your goal.');
      return;
    }

    try {
      // First, fetch existing plans for the selected date to check for conflicts
      const formattedStartDate = startDate === 'Today' 
        ? moment().format('YYYY-MM-DD') 
        : moment(startDate, 'DD-MM-YY').format('YYYY-MM-DD');
      
      console.log('Formatted Start Date:', formattedStartDate);
      
      const existingPlansResponse = await getDailyPlans({ date: formattedStartDate });
      console.log('Existing Plans Response:', existingPlansResponse);
      
      const existingPlans = existingPlansResponse?.data?.data || [];
      console.log('Existing Plans:', existingPlans);

      // Convert the new plan's time to 24-hour format for comparison
      const startHour = parseInt(blockStartHour);
      let startHour24 = startHour;
      if (blockStartAmPm === 'PM' && startHour !== 12) {
        startHour24 = startHour + 12;
      } else if (blockStartAmPm === 'AM' && startHour === 12) {
        startHour24 = 0;
      }
      const newStartTime = `${startHour24.toString().padStart(2, '0')}:${blockStartMinute}`;
      console.log('New Start Time (24h):', newStartTime);

      let newEndTime = '';
      if (isEndTimeEnabled && blockEndTime) {
        const endHour = parseInt(blockEndHour);
        let endHour24 = endHour;
        if (blockEndAmPm === 'PM' && endHour !== 12) {
          endHour24 = endHour + 12;
        } else if (blockEndAmPm === 'AM' && endHour === 12) {
          endHour24 = 0;
        }
        newEndTime = `${endHour24.toString().padStart(2, '0')}:${blockEndMinute}`;
        console.log('New End Time (24h):', newEndTime);
      }

      // Check for conflicts with existing plans
      const hasConflict = existingPlans.some((plan: { 
        id: number;
        habit: string;
        block_time: { 
          start_time: string; 
          end_time: string | null 
        } 
      }) => {
        if (!plan.block_time?.start_time) return false;

        // Convert existing plan's time to 24-hour format
        const existingStartTime = plan.block_time.start_time;
        const existingEndTime = plan.block_time.end_time || existingStartTime;
        
        console.log('Checking conflict with plan:', {
          existingStartTime,
          existingEndTime,
          newStartTime,
          newEndTime,
          planId: plan.id,
          habit: plan.habit
        });

        // Check if existingStartTime is a string before trying to match
        if (typeof existingStartTime !== 'string') {
          console.log('Existing start time is not a string:', existingStartTime);
          return false;
        }

        // Convert existing times to 24-hour format for comparison
        const startTimeMatch = existingStartTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!startTimeMatch) {
          console.log('Could not parse existing start time format:', existingStartTime);
          return false;
        }
        
        const [, existingStartHour, existingStartMinute, existingStartAmPm] = startTimeMatch;
        let existingStartHour24 = parseInt(existingStartHour);
        if (existingStartAmPm === 'PM' && existingStartHour24 !== 12) {
          existingStartHour24 += 12;
        } else if (existingStartAmPm === 'AM' && existingStartHour24 === 12) {
          existingStartHour24 = 0;
        }
        const existingStartTime24 = `${existingStartHour24.toString().padStart(2, '0')}:${existingStartMinute}`;

        let existingEndTime24 = existingStartTime24;
        if (existingEndTime && typeof existingEndTime === 'string') {
          const endTimeMatch = existingEndTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (endTimeMatch) {
            const [, existingEndHour, existingEndMinute, existingEndAmPm] = endTimeMatch;
            let existingEndHour24 = parseInt(existingEndHour);
            if (existingEndAmPm === 'PM' && existingEndHour24 !== 12) {
              existingEndHour24 += 12;
            } else if (existingEndAmPm === 'AM' && existingEndHour24 === 12) {
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
      });

      console.log('Final conflict result:', hasConflict);

      if (hasConflict) {
        Alert.alert(
          'Time Slot Conflict',
          'This time slot is already blocked by another task. Please choose a different time.',
          [{ text: 'OK' }]
        );
        return;
      }

      const commonData = {
        category,
        task_type: taskType,
        gender,
        evaluation_type: evaluationType,
        habit,
        description: description || '',
        frequency,
        selected_days: selectedDays || [],
        is_flexible: isFlexible,
        duration: evaluationType === 'timer' ? route.params.numeric_value : (parseInt(daysCount) || 0),
        priority,
        block_time: blockTime,
        pomodoro,
        reminder: timeAndReminders > 0,
        reminder_time: selectedTime,
        reminder_type: reminderType as 'dont-remind' | 'notification' | 'alarm',
        reminder_schedule: reminderSchedule as 'always-enabled' | 'specific-days' | 'days-before',
        selected_week_days: selectedWeekDays,
        days_before_count: parseInt(daysBeforeCount) || 0,
        hours_before_count: hoursBeforeCount ? parseInt(hoursBeforeCount) : 0
      };

      const goalData = {
        ...commonData,
        start_date: formattedStartDate,
        end_date: endDate,
        block_start_time: blockStartTime || null,
        block_end_time: blockEndTime || null,
        checklist_items: route.params.checklist_items || [],
        numeric_value: route.params.numeric_value,
        numeric_condition: route.params.numeric_condition,
        numeric_unit: route.params.numeric_unit
      };

      setIsSaving(true);
      
      // Save the goal data
      await saveDailyPlan(goalData);
      
      // Clear temporary data
      await clearTempGoalData();
      
      // Navigate to the home screen
      navigation.navigate('DailyPlan', { gender, taskType: 'daily' });
    } catch (error) {
        console.error('Error saving goal:', error);
        Alert.alert('Error', 'Failed to save goal. Please try again.');
    } finally {
        setIsSaving(false);
    }
  };

  const handlePrioritySelect = (value: string) => {
    setPriority(value);
    setIsPriorityDropdownVisible(false);
  };

  const handleWeekDayToggle = (day: string) => {
    setSelectedWeekDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleReminderConfirm = async () => {
    try {
      await saveTempGoalData({
        schedule: {
          reminder: true,
          reminderTime: selectedTime,
          reminderType: reminderType as 'dont-remind' | 'notification' | 'alarm',
          reminderSchedule: reminderSchedule as 'always-enabled' | 'specific-days' | 'days-before',
          selectedWeekDays,
          daysBeforeCount: parseInt(daysBeforeCount) || 0,
          hoursBeforeCount: hoursBeforeCount ? parseInt(hoursBeforeCount) : 0
        }
      });
      
      setTimeAndReminders(prev => prev + 1);
      setIsReminderModalVisible(false);
    } catch (error) {
      console.error('Error saving reminder data:', error);
    }
  };

  const handleBlockTimeConfirm = () => {
    // Convert 12-hour format to 24-hour format for calculation
    const startHour = parseInt(blockStartHour);
    let startHour24 = startHour;
    
    if (blockStartAmPm === 'PM' && startHour !== 12) {
      startHour24 = startHour + 12;
    } else if (blockStartAmPm === 'AM' && startHour === 12) {
      startHour24 = 0;
    }
    
    const startTime24 = `${startHour24.toString().padStart(2, '0')}:${blockStartMinute}`;
    setBlockStartTime(`${blockStartHour}:${blockStartMinute} ${blockStartAmPm}`);
    
    if (isEndTimeEnabled) {
      const endHour = parseInt(blockEndHour);
      let endHour24 = endHour;
      
      if (blockEndAmPm === 'PM' && endHour !== 12) {
        endHour24 = endHour + 12;
      } else if (blockEndAmPm === 'AM' && endHour === 12) {
        endHour24 = 0;
      }
      
      const endTime24 = `${endHour24.toString().padStart(2, '0')}:${blockEndMinute}`;
      setBlockEndTime(`${blockEndHour}:${blockEndMinute} ${blockEndAmPm}`);
      
      // Calculate the difference in hours between start and end time
      const start = moment(startTime24, 'HH:mm');
      const end = moment(endTime24, 'HH:mm');
      
      // Handle case where end time is on the next day
      if (end.isBefore(start)) {
        end.add(1, 'days');
      }
      
      const diffHours = end.diff(start, 'hours', true);
      setBlockTime(diffHours);
    } else {
      setBlockEndTime('');
      setBlockTime(0); // No block time when only start time is selected
    }
    
    setIsBlockTimeModalVisible(false);
  };

  // Add useEffect to initialize scroll positions when modal opens
  useEffect(() => {
    if (isBlockTimeModalVisible) {
      // Reset scroll positions when modal opens
      // No need to reset scroll positions anymore since we're using the TimePicker component
    }
  }, [isBlockTimeModalVisible]);

  return (
    <Layout
      title="What Schedule Would You Prefer?"
      onBackPress={() => navigation.goBack()}
      rightButtonText={isSaving ? undefined : 'Next'}
      rightButtonDisabled={isSaving}
      onRightButtonPress={handleNext}
    >
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Start Date */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              {/* <Icon name="event" size={24} color="#666" /> */}
              <Svg  width="25" height="25" viewBox="0 0 20 20" fill="none">
                <Path d="M1.66675 10C1.66675 6.85734 1.66675 5.286 2.64306 4.30968C3.61937 3.33337 5.19071 3.33337 8.33341 3.33337H11.6667C14.8094 3.33337 16.3808 3.33337 17.3571 4.30968C18.3334 5.286 18.3334 6.85734 18.3334 10V11.6667C18.3334 14.8094 18.3334 16.3808 17.3571 17.357C16.3808 18.3334 14.8094 18.3334 11.6667 18.3334H8.33341C5.19071 18.3334 3.61937 18.3334 2.64306 17.357C1.66675 16.3808 1.66675 14.8094 1.66675 11.6667V10Z" stroke="#646464" stroke-width="1.5"/>
                <Path d="M5.83325 3.33337V2.08337" stroke="#646464" stroke-width="1.5" stroke-linecap="round"/>
                <Path d="M14.1667 3.33337V2.08337" stroke="#646464" stroke-width="1.5" stroke-linecap="round"/>
                <Path d="M5.82495 12.5C6.51531 12.5 7.07495 11.9404 7.07495 11.25C7.07495 10.5596 6.51531 10 5.82495 10C5.1346 10 4.57495 10.5596 4.57495 11.25C4.57495 11.9404 5.1346 12.5 5.82495 12.5Z" stroke="#646464" stroke-width="1.5"/>
                <Path d="M2.08325 7.5H17.9166" stroke="#646464" stroke-width="1.5" stroke-linecap="round"/>
              </Svg>
            </View>
            <Text style={styles.inputLabel}>Start date</Text>
            <TouchableOpacity 
              style={styles.valueContainer}
              onPress={() => openCalendar('start')}
            >
              <Text style={styles.valueText}>{startDate}</Text>
            </TouchableOpacity>
          </View>

          {/* End Date Toggle */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <Svg width="25" height="25" viewBox="0 0 20 20" fill="none">
                <Path d="M1.66675 10C1.66675 6.85734 1.66675 5.286 2.64306 4.30968C3.61937 3.33337 5.19071 3.33337 8.33341 3.33337H11.6667C14.8094 3.33337 16.3808 3.33337 17.3571 4.30968C18.3334 5.286 18.3334 6.85734 18.3334 10V11.6667C18.3334 14.8094 18.3334 16.3808 17.3571 17.357C16.3808 18.3334 14.8094 18.3334 11.6667 18.3334H8.33341C5.19071 18.3334 3.61937 18.3334 2.64306 17.357C1.66675 16.3808 1.66675 14.8094 1.66675 11.6667V10Z" stroke="#646464" stroke-width="1.5"/>
                <Path d="M5.83325 3.33337V2.08337" stroke="#646464" stroke-width="1.5" stroke-linecap="round"/>
                <Path d="M14.1667 3.33337V2.08337" stroke="#646464" stroke-width="1.5" stroke-linecap="round"/>
                <Path d="M14.25 15.5C14.9404 15.5 15.5 14.9404 15.5 14.25C15.5 13.5596 14.9404 13 14.25 13C13.5596 13 13 13.5596 13 14.25C13 14.9404 13.5596 15.5 14.25 15.5Z" stroke="#646464" stroke-width="1.5"/>
                <Path d="M2.08325 7.5H17.9166" stroke="#646464" stroke-width="1.5" stroke-linecap="round"/>
              </Svg>
            </View>
            <Text style={styles.inputLabel}>End date</Text>
            <CustomSwitch
              value={isEndDateEnabled}
              onValueChange={setIsEndDateEnabled}
            />
          </View>

          {/* End Date Input (shown when enabled) */}
          {isEndDateEnabled && (
            <View style={styles.endDateRow}>
              <TouchableOpacity 
                style={styles.endDateInput}
                onPress={() => openCalendar('end')}
              >
                <Text style={styles.valueText}>
                  {endDate || '2025-06-1'}
                </Text>
              </TouchableOpacity>
              <View style={styles.daysContainer}>
                <TextInput
                  style={styles.daysInput}
                  value={daysCount}
                  onChangeText={setDaysCount}
                  keyboardType="numeric"
                />
                <Text style={styles.daysText}>Days.</Text>
              </View>
            </View>
          )}

          {/* Time and Reminders */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              {/* <Icon name="access-time" size={24} color="#666" /> */}
              <Svg  width="20" height="20" viewBox="0 0 20 20" fill="none">
                <Path fill-rule="evenodd" clip-rule="evenodd" d="M14.25 14H5.75V8C5.75 5.334 7.875 4 9.99893 4H10.0011C12.125 4 14.25 5.334 14.25 8V14ZM11.0625 17C11.0625 17.552 10.5865 18 10 18C9.4135 18 8.9375 17.552 8.9375 17V16H11.0625V17ZM17.4375 14C16.851 14 16.375 13.552 16.375 13V8C16.375 4.447 13.859 2.47498 11.0625 2.07898V1C11.0625 0.448 10.5865 0 10 0C9.4135 0 8.9375 0.448 8.9375 1V2.07898C6.141 2.47498 3.625 4.447 3.625 8V13C3.625 13.552 3.149 14 2.5625 14C1.976 14 1.5 14.448 1.5 15C1.5 15.552 1.976 16 2.5625 16H6.8125V17C6.8125 18.657 8.23944 20 10 20C11.7606 20 13.1875 18.657 13.1875 17V16H17.4375C18.024 16 18.5 15.552 18.5 15C18.5 14.448 18.024 14 17.4375 14Z" fill="#646464"/>
              </Svg>
            </View>
            <Text style={styles.inputLabel}>Time and reminders</Text>
            <TouchableOpacity 
              style={styles.valueContainerCircular}
              onPress={() => setIsSimpleReminderModalVisible(true)}
            >
              <Text style={styles.valueTextCircular}>{timeAndReminders}</Text>
            </TouchableOpacity>
          </View>

          {/* Priority */}
          <View style={[styles.inputRow, { borderBottomWidth: isPriorityDropdownVisible ? 0 : 0 }]}>
            <View style={styles.iconContainer}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <G clip-path="url(#clip0_537_1522)">
                <Path d="M13.2812 1.86182C10.1562 1.86182 9.32312 -0.0131836 5.365 -0.0131836C2.8125 -0.0131836 1.25 1.91432 1.25 1.91432V19.3881C1.25 19.7331 1.53 20.0131 1.875 20.0131C2.22 20.0131 2.5 19.7331 2.5 19.3881V11.4218C3.15937 10.9968 4.06937 10.6118 5.20875 10.6118C9.16687 10.6118 10.3125 12.4868 13.4375 12.4868C16.5625 12.4868 18.75 10.6118 18.75 10.6118V-0.0131836C18.75 -0.0131836 16.4062 1.86182 13.2812 1.86182ZM17.5 9.97494C16.7937 10.4356 15.2975 11.2368 13.4375 11.2368C12.2087 11.2368 11.37 10.8993 10.3081 10.4724C9.01375 9.95244 7.54625 9.36182 5.20875 9.36182C4.14062 9.36182 3.23438 9.63057 2.5 9.98994V2.42244C2.97063 1.99432 3.99625 1.23682 5.365 1.23682C7.20312 1.23682 8.23812 1.68307 9.33375 2.15494C10.425 2.62494 11.5538 3.11182 13.2812 3.11182C14.9462 3.11182 16.4087 2.65119 17.5 2.15619V9.97432V9.97494Z" fill="#646464"/>
              </G>
              <Defs>
                <ClipPath id="clip0_537_1522">
                  <Rect width="20" height="20" fill="white"/>
                </ClipPath>
              </Defs>
            </Svg>
            </View>
            <Text style={styles.inputLabel}>Priority</Text>
            <TouchableOpacity 
              style={styles.valueContainer}
              onPress={() => setIsPriorityDropdownVisible(!isPriorityDropdownVisible)}
            >
              <Text style={styles.valueText}>{priority}</Text>
              <Icon 
                name={isPriorityDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {/* Priority Dropdown */}
          {isPriorityDropdownVisible && (
            <View style={styles.dropdownContainer}>
              {PRIORITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownOption,
                    priority === option && styles.selectedDropdownOption
                  ]}
                  onPress={() => handlePrioritySelect(option)}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    priority === option && styles.selectedDropdownOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Block Time */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <G clip-path="url(#clip0_903_2365)">
              <Path d="M6.25303 16.4897L5.00439 18.7427" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <Path d="M13.7468 16.4897L14.9955 18.7427" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <Path d="M9.99995 17.4938C14.1384 17.4938 17.4933 14.1389 17.4933 10.0004C17.4933 5.86197 14.1384 2.50708 9.99995 2.50708C5.86148 2.50708 2.50659 5.86197 2.50659 10.0004C2.50659 14.1389 5.86148 17.4938 9.99995 17.4938Z" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <Path d="M2.7574 8.00298C2.18212 7.5718 1.74304 6.98421 1.49256 6.31032C1.24208 5.63644 1.19078 4.90471 1.34477 4.20246C1.49876 3.50022 1.85154 2.8571 2.36101 2.34986C2.87049 1.84262 3.51515 1.49266 4.21807 1.34176C4.92099 1.19086 5.65248 1.24538 6.32526 1.49882C6.99803 1.75226 7.58369 2.19392 8.01234 2.77108" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <Path d="M10 2.50719L10 1.2583" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <Path d="M10 6.25391V10.0006" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <Path d="M10 10.0005L12.6493 12.6498" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <Path d="M17.2427 8.00298C17.818 7.5718 18.2571 6.98421 18.5076 6.31032C18.7581 5.63644 18.8094 4.90471 18.6554 4.20246C18.5014 3.50022 18.1486 2.8571 17.6391 2.34986C17.1296 1.84262 16.485 1.49266 15.7821 1.34176C15.0792 1.19086 14.3477 1.24538 13.6749 1.49882C13.0021 1.75226 12.4164 2.19392 11.9878 2.77108" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </G>
              <Defs>
                <ClipPath id="clip0_903_2365">
                  <Rect width="20" height="20" fill="white"/>
                </ClipPath>
              </Defs>
            </Svg>
            </View>
            <Text style={styles.inputLabel}>Block Time*</Text>
            <TouchableOpacity 
              style={styles.valueContainer}
              onPress={() => setIsBlockTimeModalVisible(true)}
            >
              <Text style={styles.valueText}>
                {blockStartTime 
                  ? (blockEndTime 
                      ? `${blockStartTime} - ${blockEndTime}` 
                      : blockStartTime)
                  : 'Set Time'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pomodoro */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <Icon name="timer" size={24} color="#666" />
            </View>
            <Text style={styles.inputLabel}>Pomodoro</Text>
            <TouchableOpacity 
              style={styles.valueContainerCircular}
              onPress={() => {
                // Show numeric keyboard
                Alert.prompt(
                  'Set Pomodoro',
                  'Enter number of pomodoros',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel'
                    },
                    {
                      text: 'OK',
                      onPress: value => {
                        const numValue = parseInt(value || '0');
                        if (!isNaN(numValue) && numValue >= 0) {
                          setPomodoro(numValue);
                        }
                      }
                    }
                  ],
                  'plain-text',
                  pomodoro.toString(),
                  'number-pad'
                );
              }}
            >
              <TextInput 
                style={styles.pomodoroInput}
                value={pomodoro.toString()}
                onChangeText={(value) => {
                  const numValue = parseInt(value || '0');
                  if (!isNaN(numValue) && numValue >= 0) {
                    setPomodoro(numValue);
                  }
                }}
                keyboardType="number-pad"
                editable={true}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <ProgressIndicator currentStep={4} totalSteps={4} />

      {/* Simple Reminder Modal */}
      <Modal
        visible={isSimpleReminderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSimpleReminderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.simpleReminderContainer}>
            <Text style={styles.simpleReminderTitle}>Time and Reminder</Text>

            <View style={styles.noReminderContent}>
              <View style={styles.bellIconCircle}>
                <Icon name="notifications-none" size={28} color="#FF9F43" />
              </View>
              <Text style={styles.noReminderText}>No reminder for this activity</Text>
            </View>

            <TouchableOpacity 
              style={styles.newReminderButton}
              onPress={() => {
                setIsSimpleReminderModalVisible(false);
                setIsReminderModalVisible(true);
              }}
            >
              <Icon name="add-circle-outline" size={20} color="#3F51B5" />
              <Text style={styles.newReminderText}>NEW REMINDER</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsSimpleReminderModalVisible(false)}
            >
              <Text style={styles.closeText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time and Reminders */}
      <Modal
        visible={isReminderModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsReminderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reminderContainer}>
            <Text style={styles.reminderTitle}>New reminder</Text>
            
            {/* Time Display */}
            <Text style={styles.timeDisplay}>{selectedTime}</Text>
            <Text style={styles.reminderSubtitle}>New reminder</Text>

            {/* Reminder Type Selection */}
            <View style={styles.reminderTypeContainer}>
              <TouchableOpacity 
                style={[
                  styles.reminderTypeOption,
                  reminderType === 'dont-remind' && styles.selectedReminderType
                ]}
                onPress={() => setReminderType('dont-remind')}
              >
                <Icon name="notifications-off" size={24} color={reminderType === 'dont-remind' ? '#3F51B5' : '#666'} />
                <Text style={[
                  styles.reminderTypeText,
                  reminderType === 'dont-remind' && styles.selectedReminderTypeText
                ]}>Don't remind</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.reminderTypeOption,
                  reminderType === 'notification' && styles.selectedReminderType
                ]}
                onPress={() => setReminderType('notification')}
              >
                <Icon name="notifications" size={24} color={reminderType === 'notification' ? '#3F51B5' : '#666'} />
                <Text style={[
                  styles.reminderTypeText,
                  reminderType === 'notification' && styles.selectedReminderTypeText
                ]}>Notification</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.reminderTypeOption,
                  reminderType === 'alarm' && styles.selectedReminderType
                ]}
                onPress={() => setReminderType('alarm')}
              >
                <Icon name="alarm" size={24} color={reminderType === 'alarm' ? '#3F51B5' : '#666'} />
                <Text style={[
                  styles.reminderTypeText,
                  reminderType === 'alarm' && styles.selectedReminderTypeText
                ]}>Alarm</Text>
              </TouchableOpacity>
            </View>

            {/* Reminder Schedule */}
            <View style={styles.scheduleContainer}>
              <Text style={styles.scheduleTitle}>Reminder Schedule</Text>

              <TouchableOpacity 
                style={styles.scheduleOption}
                onPress={() => setReminderSchedule('always-enabled')}
              >
                <View style={styles.radioButton}>
                  <View style={reminderSchedule === 'always-enabled' ? styles.radioButtonSelected : undefined} />
                </View>
                <Text style={styles.scheduleOptionText}>Always enabled</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.scheduleOption}
                onPress={() => setReminderSchedule('specific-days')}
              >
                <View style={styles.radioButton}>
                  <View style={reminderSchedule === 'specific-days' ? styles.radioButtonSelected : undefined} />
                </View>
                <Text style={styles.scheduleOptionText}>Specific days of the week</Text>
              </TouchableOpacity>

              {reminderSchedule === 'specific-days' && (
                <View style={styles.weekDaysContainer}>
                  {weekDays.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.weekDayButton,
                        selectedWeekDays.includes(day) && styles.selectedWeekDay
                      ]}
                      onPress={() => handleWeekDayToggle(day)}
                    >
                      <Text style={[
                        styles.weekDayText,
                        selectedWeekDays.includes(day) && styles.selectedWeekDayText
                      ]}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity 
                style={styles.scheduleOption}
                onPress={() => setReminderSchedule('days-before')}
              >
                <View style={styles.radioButton}>
                  <View style={reminderSchedule === 'days-before' ? styles.radioButtonSelected : undefined} />
                </View>
                <Text style={styles.scheduleOptionText}>Days before</Text>
              </TouchableOpacity>

              {reminderSchedule === 'days-before' && (
                <View style={styles.beforeInputsContainer}>
                  <View style={styles.beforeInput}>
                    <TextInput
                      style={styles.beforeInputText}
                      value={daysBeforeCount}
                      onChangeText={setDaysBeforeCount}
                      keyboardType="numeric"
                    />
                    <Text style={styles.beforeInputLabel}>Days Before</Text>
                  </View>
                  <View style={styles.beforeInput}>
                    <TextInput
                      style={styles.beforeInputText}
                      value={hoursBeforeCount}
                      onChangeText={setHoursBeforeCount}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                    <Text style={styles.beforeInputLabel}>Hour Before</Text>
                  </View>
                </View>
              )}
            </View>

            <Text style={styles.reminderNote}>
              {reminderSchedule === 'specific-days' 
                ? 'The reminder will only be activated if the activity is also scheduled for the day.'
                : 'The reminder will be activated daily until the activity date.'}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setIsReminderModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={handleReminderConfirm}
              >
                <Text style={[styles.modalButtonText, styles.confirmText]}>CONFIRM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <Modal
        visible={isCalendarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCalendarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeaderWrapper}>
              <Text style={styles.calendarYear}>{selectedCalendarDate.format('YYYY')}</Text>
              <Text style={styles.calendarSelectedDate}>{selectedCalendarDate.format('ddd, MMM D')}</Text>
            </View>
            {/* <View style={styles.monthNavContainer}>
              <Text style={styles.monthNavText}>{selectedCalendarDate.format('MMMM YYYY')}</Text>
            </View> */}
            <CalendarPicker
              onDateChange={handleDateSelect}
              onMonthChange={(date: Date) => {
                setSelectedCalendarDate(moment(date));
              }}
              selectedDayColor="#3F51B5"
              selectedDayTextStyle={{ color: '#fff' }}
              minDate={
                activeDate === 'end' && startDate !== 'Today' 
                  ? moment(startDate, 'ddd, MMM D').add(1, 'day').toDate()
                  : new Date()
              }
              maxDate={moment().add(5, 'years').toDate()}
              width={300}
              selectedStartDate={selectedCalendarDate.toDate()}
              dayLabelsWrapper={{
                borderTopWidth: 0,
                borderBottomWidth: 0,
              }}
              monthTitleStyle={{
                fontSize: 14,
                color: '#000',
                textAlign: 'center',
                width: '100%',
                marginTop: 12,
                marginBottom: 12,
              }}
              yearTitleStyle={{
                display: 'none'
              }}
              textStyle={{
                color: '#000',
                fontSize: 14,
              }}
              previousComponent={
                <Icon name="chevron-left" size={24} color="#000" />
              }
              nextComponent={
                <Icon name="chevron-right" size={24} color="#000" />
              }
              headerWrapperStyle={{
                paddingTop: 12,
                paddingBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              disabledDates={(date: Date) => {
                if (activeDate === 'end' && startDate !== 'Today') {
                  const startMoment = moment(startDate, 'ddd, MMM D');
                  return moment(date).isSameOrBefore(startMoment, 'day');
                }
                return false;
              }}
              allowRangeSelection={false}
              initialDate={
                activeDate === 'end' && startDate !== 'Today'
                  ? moment(startDate, 'ddd, MMM D').toDate()
                  : undefined
              }
            />
            <View style={styles.calendarActions}>
              <TouchableOpacity 
                style={styles.calendarButton} 
                onPress={() => setIsCalendarVisible(false)}
              >
                <Text style={styles.calendarButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.calendarButton}
                onPress={handleCalendarConfirm}
              >
                <Text style={[styles.calendarButtonText, styles.calendarButtonTextPrimary]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Block Time Modal */}
      <Modal
        visible={isBlockTimeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsBlockTimeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.blockTimeModalContainer}>
            <View style={styles.blockTimeModalHeader}>
              <Text style={styles.blockTimeModalTitle}>Block Time</Text>
              <TouchableOpacity 
                style={styles.blockTimeModalCloseButton}
                onPress={() => setIsBlockTimeModalVisible(false)}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.blockTimeContent}>
              <View style={styles.blockTimeSection}>
                <Text style={styles.blockTimeSectionTitle}>Start Time</Text>
                <TimePicker
                  key={`start-time-${isBlockTimeModalVisible}`}
                  hour={blockStartHour}
                  minute={blockStartMinute}
                  amPm={blockStartAmPm}
                  onHourChange={setBlockStartHour}
                  onMinuteChange={setBlockStartMinute}
                  onAmPmChange={setBlockStartAmPm}
                />
              </View>

              {/* End Time Toggle */}
              <View style={styles.endTimeToggleContainer}>
                <Text style={styles.endTimeToggleLabel}>End Time</Text>
                <Switch
                  value={isEndTimeEnabled}
                  onValueChange={setIsEndTimeEnabled}
                  style={styles.switch}
                  trackColor={{ false: '#E0E0E0', true: '#3F51B5' }}
                  thumbColor="#fff"
                />
              </View>
              
              {/* End Time Section */}
              {isEndTimeEnabled && (
                <View style={styles.blockTimeSection}>
                  <Text style={styles.blockTimeSectionTitle}>End Time</Text>
                  <TimePicker
                    key={`end-time-${isBlockTimeModalVisible}`}
                    hour={blockEndHour}
                    minute={blockEndMinute}
                    amPm={blockEndAmPm}
                    onHourChange={setBlockEndHour}
                    onMinuteChange={setBlockEndMinute}
                    onAmPmChange={setBlockEndAmPm}
                  />
                </View>
              )}

              <View style={styles.blockTimeSummary}>
                <Text style={styles.blockTimeSummaryText}>
                  {isEndTimeEnabled 
                    ? (blockTime > 0 
                        ? `You will block ${blockTime.toFixed(1)} hours for this task.`
                        : 'Select start and end time to block time for this task.')
                    : 'You will start this task at the selected time.'}
                </Text>
              </View>

              <View style={styles.blockTimeModalActions}>
                <TouchableOpacity 
                  style={styles.blockTimeModalButton}
                  onPress={() => setIsBlockTimeModalVisible(false)}
                >
                  <Text style={styles.blockTimeModalButtonText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.blockTimeModalButton, styles.blockTimeModalConfirmButton]}
                  onPress={handleBlockTimeConfirm}
                >
                  <Text style={[styles.blockTimeModalButtonText, styles.blockTimeModalConfirmText]}>CONFIRM</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  scrollContent: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 8,
    paddingTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0',
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  inputLabel: {
    flex: 1,
    fontSize: 17,
    color: '#000',
    fontWeight: '400',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    justifyContent: 'flex-end',
  },
  valueContainerCircular: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  valueTextCircular: {
    fontSize: 16,
    color: '#000',
    // marginRight: 4,
  },
  valueText: {
    fontSize: 17,
    color: '#000',
    marginRight: 4,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 0,
    width: 320,
    overflow: 'hidden',
  },
  calendarHeaderWrapper: {
    backgroundColor: '#1A237E',
    padding: 16,
  },
  calendarYear: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  calendarSelectedDate: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 16,
  },
  monthNavContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  monthNavText: {
    fontSize: 14,
    color: '#000',
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  calendarButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  calendarButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  calendarButtonTextPrimary: {
    color: '#3F51B5',
  },
  reminderContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '90%',
    marginTop: 'auto',
  },
  reminderTitle: {
    fontSize: 17,
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  timeDisplay: {
    fontSize: 40,
    color: '#000',
    textAlign: 'center',
    fontWeight: '300',
  },
  reminderSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  reminderTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  reminderTypeOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  selectedReminderType: {
    backgroundColor: '#E8EAF6',
  },
  reminderTypeText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  selectedReminderTypeText: {
    color: '#3F51B5',
  },
  scheduleContainer: {
    marginBottom: 24,
  },
  scheduleTitle: {
    fontSize: 17,
    color: '#000',
    marginBottom: 16,
  },
  scheduleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3F51B5',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3F51B5',
  },
  scheduleOptionText: {
    fontSize: 15,
    color: '#000',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  weekDayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  selectedWeekDay: {
    backgroundColor: '#3F51B5',
  },
  weekDayText: {
    fontSize: 13,
    color: '#666',
  },
  selectedWeekDayText: {
    color: '#fff',
  },
  beforeInputsContainer: {
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  beforeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  beforeInputText: {
    width: 60,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#000',
    marginRight: 12,
    textAlign: 'center',
  },
  beforeInputLabel: {
    fontSize: 15,
    color: '#666',
  },
  reminderNote: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalButtonText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  confirmText: {
    color: '#3F51B5',
  },
  simpleReminderContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  simpleReminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 24,
  },
  noReminderContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bellIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  noReminderText: {
    fontSize: 15,
    color: '#666',
  },
  newReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: 16,
  },
  newReminderText: {
    fontSize: 15,
    color: '#3F51B5',
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  blockTimeModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    alignSelf: 'center',
  },
  blockTimeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  blockTimeModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  blockTimeModalCloseButton: {
    padding: 4,
  },
  blockTimeContent: {
    padding: 20,
  },
  blockTimeSection: {
    marginBottom: 20,
  },
  blockTimeSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  timePickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  timePickerWrapper: {
    height: 120,
    width: '100%',
    position: 'relative',
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
  },
  timePickerScroll: {
    height: 120,
    width: '100%',
  },
  timePickerContent: {
    paddingVertical: 40,
  },
  timePickerOption: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTimeOption: {
    backgroundColor: 'transparent',
  },
  timePickerOptionText: {
    fontSize: 16,
    color: '#666',
  },
  selectedTimeOptionText: {
    color: '#3F51B5',
    fontWeight: '600',
    fontSize: 18,
  },
  blockTimeSummary: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  blockTimeSummaryText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },
  blockTimeModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  blockTimeModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  blockTimeModalConfirmButton: {
    backgroundColor: '#3F51B5',
  },
  blockTimeModalButtonText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  blockTimeModalConfirmText: {
    color: '#fff',
  },
  endTimeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  endTimeToggleLabel: {
    fontSize: 17,
    color: '#000',
    fontWeight: '500',
  },
  endDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0',
    gap: 12,
  },
  endDateInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  daysInput: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    width: 60,
    textAlign: 'center',
    fontSize: 17,
    color: '#000',
  },
  daysText: {
    fontSize: 17,
    color: '#666',
  },
  dropdownContainer: {
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginLeft: 66,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedDropdownOption: {
    backgroundColor: '#E8EAF6',
  },
  dropdownOptionText: {
    fontSize: 17,
    color: '#000',
  },
  selectedDropdownOptionText: {
    color: '#3F51B5',
    fontWeight: '500',
  },
  pomodoroInput: {
    fontSize: 16,
    color: '#000',
    // minWidth: 40,
    textAlign: 'center',
    padding: 0,
  },
});

export default DailyPlanSchedule; 