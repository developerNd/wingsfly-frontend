import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveDailyPlan } from '../../services/api';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_TYPES,
  EVALUATION_TYPES,
} from '../../config/constants';
import DatePickerModal from '../../components/DatePickerModal';
import PrioritySelector from '../../components/PrioritySelector';
import CategorySelector from '../../components/CategorySelector';
import Layout from '../../components/Layout';
import ProgressIndicator from '../../components/ProgressIndicator';
import FloatingLabelInput from '../../components/FloatingLabelInput';
import Svg, { Path } from 'react-native-svg';
import { Shadow } from 'react-native-shadow-2';

type RootStackParamList = {
  SelectCategory: {
    taskType: string;
    gender: string;
    isFromAdd: boolean;
    isFromDailyPlan: boolean;
    selectedOption: string;
  };
  DailyPlan: undefined;
};

type RouteParams = {
  category: string;
  taskType: string;
  gender: string;
  evaluationType: string;
  selectedOption: string;
  checklist?: {
    items: Array<{
      id: string;
      text: string;
      completed: boolean;
    }>;
    successCondition: 'all' | 'custom';
    customCount?: number;
    note: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const DailyPlanDefineTask = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { category: initialCategory, taskType, gender, evaluationType, selectedOption } = route.params as RouteParams;

  console.log('📋 Received route params in DailyPlanDefineTask:', route.params);
  console.log('📋 Checklist data in route params:', (route.params as RouteParams).checklist);

  // States for form fields
  const [task, setTask] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [startTime, setStartTime] = useState({ hour: 22, minute: 35, period: 'PM' });
  const [endTime, setEndTime] = useState({ hour: 22, minute: 35, period: 'PM' });
  const [tempStartTime, setTempStartTime] = useState({ hour: 22, minute: 35, period: 'PM' });
  const [tempEndTime, setTempEndTime] = useState({ hour: 22, minute: 35, period: 'PM' });
  const [blockTime, setBlockTime] = useState(0);
  const [pomodoros, setPomodoros] = useState('0');
  const [priority, setPriority] = useState<'Must' | 'Important'>('Must');
  const [note, setNote] = useState('');
  const [pendingTask, setPendingTask] = useState(false);
  const [linkedGoal, setLinkedGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add new refs for scroll views
  const startHourScrollRef = useRef<ScrollView>(null);
  const startMinuteScrollRef = useRef<ScrollView>(null);
  const startAmPmScrollRef = useRef<ScrollView>(null);
  const endHourScrollRef = useRef<ScrollView>(null);
  const endMinuteScrollRef = useRef<ScrollView>(null);
  const endAmPmScrollRef = useRef<ScrollView>(null);

  // Add new state for scroll positions
  const [startHourScrollY, setStartHourScrollY] = useState(0);
  const [startMinuteScrollY, setStartMinuteScrollY] = useState(0);
  const [startAmPmScrollY, setStartAmPmScrollY] = useState(0);
  const [endHourScrollY, setEndHourScrollY] = useState(0);
  const [endMinuteScrollY, setEndMinuteScrollY] = useState(0);
  const [endAmPmScrollY, setEndAmPmScrollY] = useState(0);
  const [isBlockTimeModalVisible, setIsBlockTimeModalVisible] = useState(false);
  const [blockStartTime, setBlockStartTime] = useState('');
  const [blockEndTime, setBlockEndTime] = useState('');
  const [blockStartHour, setBlockStartHour] = useState('09');
  const [blockStartMinute, setBlockStartMinute] = useState('00');
  const [blockStartAmPm, setBlockStartAmPm] = useState('AM');
  const [blockEndHour, setBlockEndHour] = useState('05');
  const [blockEndMinute, setBlockEndMinute] = useState('00');
  const [blockEndAmPm, setBlockEndAmPm] = useState('PM');
  // Generate options for time picker
  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const amPmOptions = ['AM', 'PM'];

  // Update category when route params change
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  // Handle date selection
  const handleDateSelect = () => {
    setShowDatePicker(true);
  };

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDisplayDate = (date: Date) => {
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    }
    return format(date, 'MMM dd, yyyy');
  };

  // Handle category selection by navigating to SelectCategory
  const handleCategorySelect = () => {
    navigation.navigate('SelectCategory', {
      taskType,
      gender,
      isFromAdd: false,
      isFromDailyPlan: true,
      selectedOption: category
    });
  };

  // Handle priority selection
  const handlePrioritySelect = (selectedPriority: string) => {
    setPriority(selectedPriority as 'Must' | 'Important');
  };

  // Toggle pending task
  const togglePendingTask = () => {
    setPendingTask(!pendingTask);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Work & Career':
        return 'work';
      case 'Health & Wellness':
        return 'fitness-center';
      case 'Love & Relationship':
        return 'favorite';
      case 'Money & Finances':
        return 'account-balance';
      case 'Spirituality & Faith':
        return 'self-improvement';
      case 'Personal & Growth':
        return 'school';
      case 'Other Goals':
        return 'more-horiz';
      case 'Create a category':
        return 'add-circle';
      case 'Work and Career':
        return 'work';
      case 'Health and Fitness':
        return 'fitness-center';
      case 'Personal Development':
        return 'school';
      case 'Family and Relationships':
        return 'people';
      case 'Finance':
        return 'account-balance';
      case 'Recreation and Hobbies':
        return 'sports-esports';
      case 'Home and Environment':
        return 'home';
      default:
        return 'category';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Work & Career':
      case 'Work and Career':
        return '#FF725C';
      case 'Health & Wellness':
      case 'Health and Fitness':
        return '#4CAF50';
      case 'Love & Relationship':
      case 'Family and Relationships':
        return '#FF4081';
      case 'Money & Finances':
      case 'Finance':
        return '#FFC107';
      case 'Spirituality & Faith':
        return '#9C27B0';
      case 'Personal & Growth':
      case 'Personal Development':
        return '#2196F3';
      case 'Other Goals':
        return '#607D8B';
      case 'Create a category':
        return '#E0E0E0';
      case 'Recreation and Hobbies':
        return '#00BCD4';
      case 'Home and Environment':
        return '#8BC34A';
      default:
        return '#757575';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Must':
        return '#FF4B4B';
      case 'Important':
        return '#2196F3';
      case 'Optional':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  // Handle task creation
  const handleCreateTask = async () => {
    if (!task.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    try {
      setIsLoading(true);
      
      const taskData: any = {
        category,
        task_type: taskType,
        gender,
        evaluation_type: evaluationType,
        habit: task.trim(),
        description: note.trim() || '',
        frequency: null, // Since this is a daily task
        selected_days: [],  // Not needed for daily tasks
        is_flexible: false, // Default to false for tasks
        start_date: format(date, 'yyyy-MM-dd'),
        end_date: format(date, 'yyyy-MM-dd'),
        duration: blockTime,
        priority,
        block_time: blockTime,
        block_start_time: blockStartTime,
        block_end_time: blockEndTime,
        pomodoro: parseInt(pomodoros),
        reminder: false, // Default to false, can be made configurable
        reminder_time: '12:00', // Default value
        reminder_type: 'notification',
        reminder_schedule: 'always-enabled',
        selected_week_days: [],
        days_before_count: 0,
        hours_before_count: 0,
        status: 'active',
        completion_status: 'pending',
        is_pending: pendingTask,
        linked_goal: linkedGoal,
        type: taskType
      };

      // Add checklist data if it exists
      const routeParams = route.params as RouteParams;
      if (routeParams.checklist) {
        console.log('📋 Checklist data being sent to API:', routeParams.checklist);
        taskData.checklist = routeParams.checklist;
      }

      console.log('Sending task data:', taskData);
      const response = await saveDailyPlan(taskData);
      
      // Check for successful response (status 201 for creation)
      if (response?.status === 201 || response?.message === "Daily plan created successfully") {
        Alert.alert(
          'Success',
          'Task created successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.reset({
                index: 0,
                routes: [{ name: 'DailyPlan' }],
              })
            }
          ]
        );
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || error?.message || 'Failed to create task. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle scroll and select the centered value
  const handleScroll = (
    scrollY: number,
    options: string[],
    setter: (value: string) => void,
    itemHeight: number = 40
  ) => {
    // Calculate which item is closest to the center
    const itemIndex = Math.round(scrollY / itemHeight);
    
    // Ensure the index is within bounds
    if (itemIndex >= 0 && itemIndex < options.length) {
      setter(options[itemIndex]);
    }
    console.log(itemIndex);
  };

  // Add useEffect to initialize scroll positions when modal opens
  useEffect(() => {
    if (isBlockTimeModalVisible) {
      // Calculate initial scroll positions based on current values
      const startHourIndex = hourOptions.indexOf(blockStartHour);
      const startMinuteIndex = minuteOptions.indexOf(blockStartMinute);
      const startAmPmIndex = amPmOptions.indexOf(blockStartAmPm);
      const endHourIndex = hourOptions.indexOf(blockEndHour);
      const endMinuteIndex = minuteOptions.indexOf(blockEndMinute);
      const endAmPmIndex = amPmOptions.indexOf(blockEndAmPm);
      
      // Set initial scroll positions
      if (startHourIndex >= 0) setStartHourScrollY(startHourIndex * 40);
      if (startMinuteIndex >= 0) setStartMinuteScrollY(startMinuteIndex * 40);
      if (startAmPmIndex >= 0) setStartAmPmScrollY(startAmPmIndex * 40);
      if (endHourIndex >= 0) setEndHourScrollY(endHourIndex * 40);
      if (endMinuteIndex >= 0) setEndMinuteScrollY(endMinuteIndex * 40);
      if (endAmPmIndex >= 0) setEndAmPmScrollY(endAmPmIndex * 40);
      
      // Scroll to the correct positions
      setTimeout(() => {
        if (startHourScrollRef.current) {
          startHourScrollRef.current.scrollTo({ y: startHourIndex * 40, animated: false });
        }
        if (startMinuteScrollRef.current) {
          startMinuteScrollRef.current.scrollTo({ y: startMinuteIndex * 40, animated: false });
        }
        if (startAmPmScrollRef.current) {
          startAmPmScrollRef.current.scrollTo({ y: startAmPmIndex * 40, animated: false });
        }
        if (endHourScrollRef.current) {
          endHourScrollRef.current.scrollTo({ y: endHourIndex * 40, animated: false });
        }
        if (endMinuteScrollRef.current) {
          endMinuteScrollRef.current.scrollTo({ y: endMinuteIndex * 40, animated: false });
        }
        if (endAmPmScrollRef.current) {
          endAmPmScrollRef.current.scrollTo({ y: endAmPmIndex * 40, animated: false });
        }
      }, 100);
    }
  }, [isBlockTimeModalVisible]);

  // Update TimePickerModal component
  const TimePickerModal = () => (
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
         <View style={styles.timePickerContainer}>
           <View style={styles.timePickerColumn}>
             <Text style={styles.timePickerLabel}>Hour</Text>
             <View style={styles.timePickerWrapper}>
               <View style={styles.timePickerSelectionIndicator} />
               <ScrollView 
                 ref={startHourScrollRef}
                 style={styles.timePickerScroll}
                 showsVerticalScrollIndicator={false}
                 snapToInterval={40}
                 decelerationRate="fast"
                 contentContainerStyle={styles.timePickerContent}
                 onScroll={(event) => {
                   const y = event.nativeEvent.contentOffset.y;
                   setStartHourScrollY(y);
                   handleScroll(y, hourOptions, setBlockStartHour);
                 }}
                 onMomentumScrollEnd={() => {
                   console.log('Start hour scroll end');
                 }}
               >
                 {hourOptions.map((hour) => (
                   <View
                     key={`start-hour-${hour}`}
                     style={[
                       styles.timePickerOption,
                       blockStartHour === hour && styles.selectedTimeOption
                     ]}
                   >
                     <Text style={[
                       styles.timePickerOptionText,
                       blockStartHour === hour && styles.selectedTimeOptionText
                     ]}>{hour}</Text>
                   </View>
                 ))}
               </ScrollView>
             </View>
           </View>
           
           <View style={styles.timePickerColumn}>
             <Text style={styles.timePickerLabel}>Minute</Text>
             <View style={styles.timePickerWrapper}>
               <View style={styles.timePickerSelectionIndicator} />
               <ScrollView 
                 ref={startMinuteScrollRef}
                 style={styles.timePickerScroll}
                 showsVerticalScrollIndicator={false}
                 snapToInterval={40}
                 decelerationRate="fast"
                 contentContainerStyle={styles.timePickerContent}
                 onScroll={(event) => {
                   const y = event.nativeEvent.contentOffset.y;
                   setStartMinuteScrollY(y);
                   handleScroll(y, minuteOptions, setBlockStartMinute);
                 }}
                 onMomentumScrollEnd={() => {
                   console.log('Start minute scroll end');
                 }}
               >
                 {minuteOptions.map((minute) => (
                   <View
                     key={`start-minute-${minute}`}
                     style={[
                       styles.timePickerOption,
                       blockStartMinute === minute && styles.selectedTimeOption
                     ]}
                   >
                     <Text style={[
                       styles.timePickerOptionText,
                       blockStartMinute === minute && styles.selectedTimeOptionText
                     ]}>{minute}</Text>
                   </View>
                 ))}
               </ScrollView>
             </View>
           </View>
           
           <View style={styles.timePickerColumn}>
             <Text style={styles.timePickerLabel}>AM/PM</Text>
             <View style={styles.timePickerWrapper}>
               <View style={styles.timePickerSelectionIndicator} />
               <ScrollView 
                 ref={startAmPmScrollRef}
                 style={styles.timePickerScroll}
                 showsVerticalScrollIndicator={false}
                 snapToInterval={40}
                 decelerationRate="fast"
                 contentContainerStyle={styles.timePickerContent}
                 onScroll={(event) => {
                   const y = event.nativeEvent.contentOffset.y;
                   setStartAmPmScrollY(y);
                   handleScroll(y, amPmOptions, setBlockStartAmPm);
                 }}
                 onMomentumScrollEnd={() => {
                   console.log('Start AM/PM scroll end');
                 }}
               >
                 {amPmOptions.map((amPm) => (
                   <View
                     key={`start-ampm-${amPm}`}
                     style={[
                       styles.timePickerOption,
                       blockStartAmPm === amPm && styles.selectedTimeOption
                     ]}
                   >
                     <Text style={[
                       styles.timePickerOptionText,
                       blockStartAmPm === amPm && styles.selectedTimeOptionText
                     ]}>{amPm}</Text>
                   </View>
                 ))}
               </ScrollView>
             </View>
           </View>
         </View>
       </View>
       
       <View style={styles.blockTimeSection}>
         <Text style={styles.blockTimeSectionTitle}>End Time</Text>
         <View style={styles.timePickerContainer}>
           <View style={styles.timePickerColumn}>
             <Text style={styles.timePickerLabel}>Hour</Text>
             <View style={styles.timePickerWrapper}>
               <View style={styles.timePickerSelectionIndicator} />
               <ScrollView 
                 ref={endHourScrollRef}
                 style={styles.timePickerScroll}
                 showsVerticalScrollIndicator={false}
                 snapToInterval={40}
                 decelerationRate="fast"
                 contentContainerStyle={styles.timePickerContent}
                 onScroll={(event) => {
                   const y = event.nativeEvent.contentOffset.y;
                   setEndHourScrollY(y);
                   handleScroll(y, hourOptions, setBlockEndHour);
                 }}
                 onMomentumScrollEnd={() => {
                   console.log('End hour scroll end');
                 }}
               >
                 {hourOptions.map((hour) => (
                   <View
                     key={`end-hour-${hour}`}
                     style={[
                       styles.timePickerOption,
                       blockEndHour === hour && styles.selectedTimeOption
                     ]}
                   >
                     <Text style={[
                       styles.timePickerOptionText,
                       blockEndHour === hour && styles.selectedTimeOptionText
                     ]}>{hour}</Text>
                   </View>
                 ))}
               </ScrollView>
             </View>
           </View>
           
           <View style={styles.timePickerColumn}>
             <Text style={styles.timePickerLabel}>Minute</Text>
             <View style={styles.timePickerWrapper}>
               <View style={styles.timePickerSelectionIndicator} />
               <ScrollView 
                 ref={endMinuteScrollRef}
                 style={styles.timePickerScroll}
                 showsVerticalScrollIndicator={false}
                 snapToInterval={40}
                 decelerationRate="fast"
                 contentContainerStyle={styles.timePickerContent}
                 onScroll={(event) => {
                   const y = event.nativeEvent.contentOffset.y;
                   setEndMinuteScrollY(y);
                   handleScroll(y, minuteOptions, setBlockEndMinute);
                 }}
                 onMomentumScrollEnd={() => {
                   console.log('End minute scroll end');
                 }}
               >
                 {minuteOptions.map((minute) => (
                   <View
                     key={`end-minute-${minute}`}
                     style={[
                       styles.timePickerOption,
                       blockEndMinute === minute && styles.selectedTimeOption
                     ]}
                   >
                     <Text style={[
                       styles.timePickerOptionText,
                       blockEndMinute === minute && styles.selectedTimeOptionText
                     ]}>{minute}</Text>
                   </View>
                 ))}
               </ScrollView>
             </View>
           </View>
           
           <View style={styles.timePickerColumn}>
             <Text style={styles.timePickerLabel}>AM/PM</Text>
             <View style={styles.timePickerWrapper}>
               <View style={styles.timePickerSelectionIndicator} />
               <ScrollView 
                 ref={endAmPmScrollRef}
                 style={styles.timePickerScroll}
                 showsVerticalScrollIndicator={false}
                 snapToInterval={40}
                 decelerationRate="fast"
                 contentContainerStyle={styles.timePickerContent}
                 onScroll={(event) => {
                   const y = event.nativeEvent.contentOffset.y;
                   setEndAmPmScrollY(y);
                   handleScroll(y, amPmOptions, setBlockEndAmPm);
                 }}
                 onMomentumScrollEnd={() => {
                   console.log('End AM/PM scroll end');
                 }}
               >
                 {amPmOptions.map((amPm) => (
                   <View
                     key={`end-ampm-${amPm}`}
                     style={[
                       styles.timePickerOption,
                       blockEndAmPm === amPm && styles.selectedTimeOption
                     ]}
                   >
                     <Text style={[
                       styles.timePickerOptionText,
                       blockEndAmPm === amPm && styles.selectedTimeOptionText
                     ]}>{amPm}</Text>
                   </View>
                 ))}
               </ScrollView>
             </View>
           </View>
         </View>
       </View>

       <View style={styles.blockTimeSummary}>
         <Text style={styles.blockTimeSummaryText}>
           {blockTime > 0 
             ? `You will block ${blockTime.toFixed(1)} hours for this task.`
             : 'Select start and end time to block time for this task.'}
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
           onPress={handleTimeSelect}
         >
           <Text style={[styles.blockTimeModalButtonText, styles.blockTimeModalConfirmText]}>CONFIRM</Text>
         </TouchableOpacity>
       </View>
     </View>
   </View>
 </View>
</Modal>
  );
  const handleTimeSelect = () => {
    console.log('handleTimeSelect');
    // Format times to match h:i A format (e.g., "9:30 AM" or "2:45 PM")
    const formatTimeToAPI = (hour: string, minute: string, period: string) => {
      // Convert hour to 12-hour format
      let hourNum = parseInt(hour);
      if (period === 'PM' && hourNum !== 12) {
        hourNum += 12;
      } else if (period === 'AM' && hourNum === 12) {
        hourNum = 0;
      }
      
      // Format the time as h:i A
      const formattedHour = (hourNum % 12 || 12).toString(); // Convert to 12-hour format
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      
      return `${formattedHour}:${minute} ${ampm}`;
    };

    const startTimeFormatted = formatTimeToAPI(blockStartHour, blockStartMinute, blockStartAmPm);
    const endTimeFormatted = formatTimeToAPI(blockEndHour, blockEndMinute, blockEndAmPm);
    
    // Log the formatted times for debugging
    console.log('Formatted start time:', startTimeFormatted);
    console.log('Formatted end time:', endTimeFormatted);
    
    setBlockStartTime(startTimeFormatted);
    setBlockEndTime(endTimeFormatted);
    setBlockTime(1); // Set to 1 to indicate time has been selected
    setIsBlockTimeModalVisible(false);
  };

  const handleTimeConfirm = () => {
    const calculatedTime = calculateBlockTime(tempStartTime, tempEndTime);
    if (calculatedTime <= 0) {
      Alert.alert('Invalid Time', 'End time must be after start time');
      return;
    }
    setStartTime(tempStartTime);
    setEndTime(tempEndTime);
    setBlockTime(calculatedTime);
    setShowTimeModal(false);
  };

  const calculateBlockTime = (start: typeof startTime, end: typeof endTime) => {
    // Convert start time to minutes since midnight
    let startMinutes = start.hour * 60 + start.minute;
    if (start.period === 'PM' && start.hour !== 12) {
      startMinutes += 12 * 60;
    } else if (start.period === 'AM' && start.hour === 12) {
      startMinutes = start.minute;
    }

    // Convert end time to minutes since midnight
    let endMinutes = end.hour * 60 + end.minute;
    if (end.period === 'PM' && end.hour !== 12) {
      endMinutes += 12 * 60;
    } else if (end.period === 'AM' && end.hour === 12) {
      endMinutes = end.minute;
    }

    // If end time is before start time, add 24 hours to end time
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    // Calculate difference in hours, rounded to nearest 0.5
    const diffHours = (endMinutes - startMinutes) / 60;
    return Math.round(diffHours * 2) / 2;
  };

  const formatTime = (time: typeof startTime) => {
    const hour = time.hour.toString().padStart(2, '0');
    const minute = time.minute.toString().padStart(2, '0');
    return `${hour}:${minute} ${time.period}`;
  };

  const NoteModal = () => (
    <Modal
      visible={showNoteModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowNoteModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.noteModalContent}>
          <Text style={styles.noteModalTitle}>Note</Text>
          <TextInput
            style={styles.noteInput}
            multiline
            value={note}
            onChangeText={setNote}
            placeholder="Enter note..."
          />
          <View style={styles.noteModalButtons}>
            <TouchableOpacity 
              style={styles.noteModalButton} 
              onPress={() => setShowNoteModal(false)}
            >
              <Text style={styles.noteModalButtonText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.noteModalButton, styles.noteModalButtonPrimary]}
              onPress={() => setShowNoteModal(false)}
            >
              <Text style={[styles.noteModalButtonText, styles.noteModalButtonTextPrimary]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Layout
      title="New Task"
      rightButtonText="Next"
      rightButtonDisabled={isLoading}
      onRightButtonPress={handleCreateTask}
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView style={styles.content}>
        {/* <TextInput
          style={styles.taskInput}
          placeholder="Task"
          value={task}
          onChangeText={setTask}
          placeholderTextColor="#999"
        /> */}
        <FloatingLabelInput
          label="Task"
          value={task}
          onChangeText={setTask}
          placeholder="Task"
        />
        <TouchableOpacity 
          style={styles.field}
          onPress={handleCategorySelect}
        >
          <View style={styles.fieldLeft}>
          <Svg width="18" height="19" viewBox="0 0 18 19" fill="none">
<Path d="M9.0001 3.20809L11.2084 6.66642H6.7501L9.0001 3.20809ZM9.0001 0.833085C8.85695 0.839229 8.71749 0.880437 8.59398 0.953088C8.47047 1.02574 8.3667 1.12761 8.29177 1.24975L4.50011 7.08309C4.43737 7.21303 4.40479 7.35546 4.40479 7.49975C4.40479 7.64405 4.43737 7.78648 4.50011 7.91642C4.56873 8.04405 4.67107 8.15039 4.79597 8.22386C4.92087 8.29733 5.06354 8.33511 5.20844 8.33309H12.7501C12.8933 8.32694 13.0327 8.28573 13.1562 8.21308C13.2797 8.14043 13.3835 8.03856 13.4584 7.91642C13.5408 7.79308 13.5848 7.64808 13.5848 7.49975C13.5848 7.35142 13.5408 7.20642 13.4584 7.08309L9.70844 1.24975C9.63981 1.12212 9.53747 1.01578 9.41257 0.94231C9.28767 0.868839 9.145 0.831058 9.0001 0.833085Z" fill="#646464"/>
<Path d="M16.9167 17.916H11.0833C10.8623 17.916 10.6504 17.8282 10.4941 17.6719C10.3378 17.5157 10.25 17.3037 10.25 17.0827V11.2493C10.25 11.0283 10.3378 10.8164 10.4941 10.6601C10.6504 10.5038 10.8623 10.416 11.0833 10.416H16.9167C17.1377 10.416 17.3496 10.5038 17.5059 10.6601C17.6622 10.8164 17.75 11.0283 17.75 11.2493V17.0827C17.75 17.3037 17.6622 17.5157 17.5059 17.6719C17.3496 17.8282 17.1377 17.916 16.9167 17.916ZM11.9167 16.2493H16.0833V12.0827H11.9167V16.2493Z" fill="#646464"/>
<Path d="M4.41667 11.6667C4.91112 11.6667 5.39447 11.8133 5.80559 12.088C6.21672 12.3627 6.53715 12.7531 6.72637 13.21C6.91559 13.6668 6.96509 14.1694 6.86863 14.6544C6.77217 15.1393 6.53407 15.5848 6.18443 15.9344C5.8348 16.2841 5.38935 16.5222 4.90439 16.6186C4.41944 16.7151 3.91677 16.6656 3.45996 16.4764C3.00314 16.2871 2.6127 15.9667 2.33799 15.5556C2.06329 15.1445 1.91667 14.6611 1.91667 14.1667C1.91667 13.5036 2.18006 12.8677 2.6489 12.3989C3.11774 11.9301 3.75363 11.6667 4.41667 11.6667ZM4.41667 10C3.59258 10 2.787 10.2444 2.10179 10.7022C1.41659 11.16 0.882536 11.8108 0.56717 12.5722C0.251805 13.3335 0.169291 14.1713 0.330063 14.9795C0.490835 15.7878 0.887671 16.5302 1.47039 17.1129C2.05311 17.6957 2.79554 18.0925 3.60379 18.2533C4.41205 18.414 5.24982 18.3315 6.01118 18.0162C6.77254 17.7008 7.42328 17.1667 7.88112 16.4815C8.33896 15.7963 8.58333 14.9908 8.58333 14.1667C8.58333 13.6195 8.47556 13.0777 8.26616 12.5722C8.05677 12.0666 7.74986 11.6073 7.36294 11.2204C6.97603 10.8335 6.5167 10.5266 6.01118 10.3172C5.50566 10.1078 4.96384 10 4.41667 10Z" fill="#646464"/>
</Svg>
            <Text style={styles.fieldLabel}>Category</Text>
          </View>
          <View style={styles.fieldRight}>
            <Text style={styles.fieldValue}>{category}</Text>
            <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category) }]}>
              <Text style={styles.categoryIconText}>C</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.field}
          onPress={handleDateSelect}
        >
          <View style={styles.fieldLeft}>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
<Path d="M1.6665 9.99967C1.6665 6.85697 1.6665 5.28563 2.64281 4.30932C3.61913 3.33301 5.19047 3.33301 8.33317 3.33301H11.6665C14.8092 3.33301 16.3806 3.33301 17.3568 4.30932C18.3332 5.28563 18.3332 6.85697 18.3332 9.99967V11.6663C18.3332 14.809 18.3332 16.3804 17.3568 17.3567C16.3806 18.333 14.8092 18.333 11.6665 18.333H8.33317C5.19047 18.333 3.61913 18.333 2.64281 17.3567C1.6665 16.3804 1.6665 14.809 1.6665 11.6663V9.99967Z" stroke="#646464" stroke-width="1.5"/>
<Path d="M5.8335 3.33301V2.08301" stroke="#646464" stroke-width="1.5" stroke-linecap="round"/>
<Path d="M14.1665 3.33301V2.08301" stroke="#646464" stroke-width="1.5" stroke-linecap="round"/>
<Path d="M14.25 15.5C14.9404 15.5 15.5 14.9404 15.5 14.25C15.5 13.5596 14.9404 13 14.25 13C13.5596 13 13 13.5596 13 14.25C13 14.9404 13.5596 15.5 14.25 15.5Z" stroke="#646464" stroke-width="1.5"/>
<Path d="M2.0835 7.5H17.9168" stroke="#646464" stroke-width="1.5" stroke-linecap="round"/>
</Svg>
            <Text style={styles.fieldLabel}>Date</Text>
          </View>
          <Text style={styles.fieldValue}>{formatDisplayDate(date)}</Text>
        </TouchableOpacity>

        <View style={styles.inputRow}>
          <View style={styles.iconContainer}>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
<Path d="M6.25303 16.4893L5.00439 18.7422" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M13.7471 16.4893L14.9957 18.7422" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M10.0002 17.4936C14.1387 17.4936 17.4936 14.1387 17.4936 10.0002C17.4936 5.86173 14.1387 2.50684 10.0002 2.50684C5.86173 2.50684 2.50684 5.86173 2.50684 10.0002C2.50684 14.1387 5.86173 17.4936 10.0002 17.4936Z" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M2.7574 8.0025C2.18212 7.57131 1.74304 6.98372 1.49256 6.30983C1.24208 5.63595 1.19078 4.90422 1.34477 4.20198C1.49876 3.49973 1.85154 2.85661 2.36101 2.34937C2.87049 1.84213 3.51515 1.49218 4.21807 1.34128C4.92099 1.19037 5.65248 1.2449 6.32526 1.49833C6.99803 1.75177 7.58369 2.19343 8.01234 2.77059" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M10 2.5067L10 1.25781" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M10 6.25391V10.0006" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M10 10L12.6493 12.6493" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M17.2427 8.0025C17.818 7.57131 18.2571 6.98372 18.5076 6.30983C18.7581 5.63595 18.8094 4.90422 18.6554 4.20198C18.5014 3.49973 18.1486 2.85661 17.6391 2.34937C17.1296 1.84213 16.485 1.49218 15.7821 1.34128C15.0792 1.19037 14.3477 1.2449 13.6749 1.49833C13.0021 1.75177 12.4164 2.19343 11.9878 2.77059" stroke="#646464" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</Svg>
          </View>
          <Text style={styles.inputLabel}>Block Time*</Text>
          <TouchableOpacity 
            style={styles.valueContainer}
            onPress={() => setIsBlockTimeModalVisible(true)}
          >
            <Text style={styles.valueText}>
              {blockTime > 0 
                ? `${blockStartHour}:${blockStartMinute} ${blockStartAmPm} - ${blockEndHour}:${blockEndMinute} ${blockEndAmPm}` 
                : 'Set Time'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <View style={styles.fieldLeft}>
            <Icon name="timer" size={20} color="#666" />
            <Text style={styles.fieldLabel}>pomodoro</Text>
          </View>
          <Text style={styles.fieldValue}>{pomodoros}</Text>
        </View>

        <View style={{marginBottom:10}}>
          <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={{ width: '100%' }}>
            <View style={styles.priorityContainer}>
              <Text style={styles.fieldLabel}>Priority</Text>
              <View style={styles.priorityButtons}>
                <TouchableOpacity 
                  style={[
                    styles.priorityButton,
                    priority === 'Must' && styles.priorityButtonSelected,
                    { backgroundColor: priority === 'Must' ? '#FFE5E5' : 'transparent' }
                  ]}
                  onPress={() => setPriority('Must')}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    priority === 'Must' && { color: '#FF4B4B' }
                  ]}>Must</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.priorityButton,
                    priority === 'Important' && styles.priorityButtonSelected,
                    { backgroundColor: priority === 'Important' ? '#FFF3E5' : 'transparent' }
                  ]}
                  onPress={() => setPriority('Important')}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    priority === 'Important' && { color: '#FF9F43' }
                  ]}>Important</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Shadow>
        </View>
        <TouchableOpacity 
          style={styles.field}
          onPress={() => setShowNoteModal(true)}
        >
          <View style={styles.fieldLeft}>
          <Svg width="18" height="16" viewBox="0 0 18 16" fill="none">
            <Path d="M5.66667 7.16634H5.675M9 7.16634H9.00833M12.3333 7.16634H12.3417M16.5 14.6663L13.7297 13.2812C13.5197 13.1762 13.4147 13.1237 13.3047 13.0867C13.207 13.0538 13.1064 13.0301 13.0043 13.0158C12.8893 12.9997 12.7719 12.9997 12.5372 12.9997H4.16667C3.23324 12.9997 2.76653 12.9997 2.41002 12.818C2.09641 12.6583 1.84144 12.4033 1.68166 12.0897C1.5 11.7332 1.5 11.2664 1.5 10.333V3.99967C1.5 3.06625 1.5 2.59954 1.68166 2.24302C1.84144 1.92942 2.09641 1.67445 2.41002 1.51467C2.76653 1.33301 3.23325 1.33301 4.16667 1.33301H13.8333C14.7667 1.33301 15.2335 1.33301 15.59 1.51467C15.9036 1.67445 16.1586 1.92942 16.3183 2.24302C16.5 2.59954 16.5 3.06626 16.5 3.99967V14.6663Z" stroke="#646464" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </Svg>
            <Text style={styles.fieldLabel}>Note</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.field}
          onPress={() => setPendingTask(!pendingTask)}
        >
          <View style={styles.fieldLeft}>
            <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <Path d="M15.1875 1.59375H11.9062V0.34375C11.9062 0.257812 11.8359 0.1875 11.75 0.1875H10.6562C10.5703 0.1875 10.5 0.257812 10.5 0.34375V1.59375H5.5V0.34375C5.5 0.257812 5.42969 0.1875 5.34375 0.1875H4.25C4.16406 0.1875 4.09375 0.257812 4.09375 0.34375V1.59375H0.8125C0.466797 1.59375 0.1875 1.87305 0.1875 2.21875V15.1875C0.1875 15.5332 0.466797 15.8125 0.8125 15.8125H15.1875C15.5332 15.8125 15.8125 15.5332 15.8125 15.1875V2.21875C15.8125 1.87305 15.5332 1.59375 15.1875 1.59375ZM14.4062 14.4062H1.59375V3H4.09375V3.9375C4.09375 4.02344 4.16406 4.09375 4.25 4.09375H5.34375C5.42969 4.09375 5.5 4.02344 5.5 3.9375V3H10.5V3.9375C10.5 4.02344 10.5703 4.09375 10.6562 4.09375H11.75C11.8359 4.09375 11.9062 4.02344 11.9062 3.9375V3H14.4062V14.4062ZM11.4375 6.20312H10.3594C10.2598 6.20312 10.1641 6.25195 10.1055 6.33203L7.1582 10.3906L5.89453 8.65234C5.83594 8.57227 5.74219 8.52344 5.64062 8.52344H4.5625C4.43555 8.52344 4.36133 8.66797 4.43555 8.77148L6.9043 12.1699C6.93349 12.2099 6.9717 12.2424 7.01582 12.2648C7.05994 12.2872 7.10872 12.2989 7.1582 12.2989C7.20769 12.2989 7.25647 12.2872 7.30059 12.2648C7.34471 12.2424 7.38292 12.2099 7.41211 12.1699L11.5645 6.45312C11.6387 6.34766 11.5645 6.20312 11.4375 6.20312Z" fill="#646464"/>
            </Svg>
            <Text style={styles.fieldLabel}>Pending Task</Text>
          </View>
          <View style={[styles.checkbox, pendingTask && styles.checkboxChecked]}>
            {pendingTask && <Icon name="check" size={16} color="#fff" />}
          </View>
        </TouchableOpacity>
        <View style={{marginBottom:10}}>
        <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={{ width: '100%' ,backgroundColor:'#ffff', borderRadius:8, paddingHorizontal: 16}}>
        <TouchableOpacity style={styles.field}>
          <View style={styles.fieldLeft}>
            {/* <Icon name="link" size={20} color="#666" /> */}
            <Text style={styles.fieldLabel}>Link To Goal</Text>
          </View>
          <Icon name="add" size={24} color="#666" />
        </TouchableOpacity>
        </Shadow>
        </View>
      </ScrollView>

      <NoteModal />

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

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
                <View style={styles.timePickerContainer}>
                  <View style={styles.timePickerColumn}>
                    <Text style={styles.timePickerLabel}>Hour</Text>
                    <View style={styles.timePickerWrapper}>
                      <View style={styles.timePickerSelectionIndicator} />
                      <ScrollView 
                        ref={startHourScrollRef}
                        style={styles.timePickerScroll}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={40}
                        decelerationRate="fast"
                        contentContainerStyle={styles.timePickerContent}
                        onScroll={(event) => {
                          const y = event.nativeEvent.contentOffset.y;
                          setStartHourScrollY(y);
                          handleScroll(y, hourOptions, setBlockStartHour);
                        }}
                        onMomentumScrollEnd={() => {
                          console.log('Start hour scroll end');
                        }}
                      >
                        {hourOptions.map((hour) => (
                          <View
                            key={`start-hour-${hour}`}
                            style={[
                              styles.timePickerOption,
                              blockStartHour === hour && styles.selectedTimeOption
                            ]}
                          >
                            <Text style={[
                              styles.timePickerOptionText,
                              blockStartHour === hour && styles.selectedTimeOptionText
                            ]}>{hour}</Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                  
                  <View style={styles.timePickerColumn}>
                    <Text style={styles.timePickerLabel}>Minute</Text>
                    <View style={styles.timePickerWrapper}>
                      <View style={styles.timePickerSelectionIndicator} />
                      <ScrollView 
                        ref={startMinuteScrollRef}
                        style={styles.timePickerScroll}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={40}
                        decelerationRate="fast"
                        contentContainerStyle={styles.timePickerContent}
                        onScroll={(event) => {
                          const y = event.nativeEvent.contentOffset.y;
                          setStartMinuteScrollY(y);
                          handleScroll(y, minuteOptions, setBlockStartMinute);
                        }}
                        onMomentumScrollEnd={() => {
                          console.log('Start minute scroll end');
                        }}
                      >
                        {minuteOptions.map((minute) => (
                          <View
                            key={`start-minute-${minute}`}
                            style={[
                              styles.timePickerOption,
                              blockStartMinute === minute && styles.selectedTimeOption
                            ]}
                          >
                            <Text style={[
                              styles.timePickerOptionText,
                              blockStartMinute === minute && styles.selectedTimeOptionText
                            ]}>{minute}</Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                  
                  <View style={styles.timePickerColumn}>
                    <Text style={styles.timePickerLabel}>AM/PM</Text>
                    <View style={styles.timePickerWrapper}>
                      <View style={styles.timePickerSelectionIndicator} />
                      <ScrollView 
                        ref={startAmPmScrollRef}
                        style={styles.timePickerScroll}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={40}
                        decelerationRate="fast"
                        contentContainerStyle={styles.timePickerContent}
                        onScroll={(event) => {
                          const y = event.nativeEvent.contentOffset.y;
                          setStartAmPmScrollY(y);
                          handleScroll(y, amPmOptions, setBlockStartAmPm);
                        }}
                        onMomentumScrollEnd={() => {
                          console.log('Start AM/PM scroll end');
                        }}
                      >
                        {amPmOptions.map((amPm) => (
                          <View
                            key={`start-ampm-${amPm}`}
                            style={[
                              styles.timePickerOption,
                              blockStartAmPm === amPm && styles.selectedTimeOption
                            ]}
                          >
                            <Text style={[
                              styles.timePickerOptionText,
                              blockStartAmPm === amPm && styles.selectedTimeOptionText
                            ]}>{amPm}</Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.blockTimeSection}>
                <Text style={styles.blockTimeSectionTitle}>End Time</Text>
                <View style={styles.timePickerContainer}>
                  <View style={styles.timePickerColumn}>
                    <Text style={styles.timePickerLabel}>Hour</Text>
                    <View style={styles.timePickerWrapper}>
                      <View style={styles.timePickerSelectionIndicator} />
                      <ScrollView 
                        ref={endHourScrollRef}
                        style={styles.timePickerScroll}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={40}
                        decelerationRate="fast"
                        contentContainerStyle={styles.timePickerContent}
                        onScroll={(event) => {
                          const y = event.nativeEvent.contentOffset.y;
                          setEndHourScrollY(y);
                          handleScroll(y, hourOptions, setBlockEndHour);
                        }}
                        onMomentumScrollEnd={() => {
                          console.log('End hour scroll end');
                        }}
                      >
                        {hourOptions.map((hour) => (
                          <View
                            key={`end-hour-${hour}`}
                            style={[
                              styles.timePickerOption,
                              blockEndHour === hour && styles.selectedTimeOption
                            ]}
                          >
                            <Text style={[
                              styles.timePickerOptionText,
                              blockEndHour === hour && styles.selectedTimeOptionText
                            ]}>{hour}</Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                  
                  <View style={styles.timePickerColumn}>
                    <Text style={styles.timePickerLabel}>Minute</Text>
                    <View style={styles.timePickerWrapper}>
                      <View style={styles.timePickerSelectionIndicator} />
                      <ScrollView 
                        ref={endMinuteScrollRef}
                        style={styles.timePickerScroll}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={40}
                        decelerationRate="fast"
                        contentContainerStyle={styles.timePickerContent}
                        onScroll={(event) => {
                          const y = event.nativeEvent.contentOffset.y;
                          setEndMinuteScrollY(y);
                          handleScroll(y, minuteOptions, setBlockEndMinute);
                        }}
                        onMomentumScrollEnd={() => {
                          console.log('End minute scroll end');
                        }}
                      >
                        {minuteOptions.map((minute) => (
                          <View
                            key={`end-minute-${minute}`}
                            style={[
                              styles.timePickerOption,
                              blockEndMinute === minute && styles.selectedTimeOption
                            ]}
                          >
                            <Text style={[
                              styles.timePickerOptionText,
                              blockEndMinute === minute && styles.selectedTimeOptionText
                            ]}>{minute}</Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                  
                  <View style={styles.timePickerColumn}>
                    <Text style={styles.timePickerLabel}>AM/PM</Text>
                    <View style={styles.timePickerWrapper}>
                      <View style={styles.timePickerSelectionIndicator} />
                      <ScrollView 
                        ref={endAmPmScrollRef}
                        style={styles.timePickerScroll}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={40}
                        decelerationRate="fast"
                        contentContainerStyle={styles.timePickerContent}
                        onScroll={(event) => {
                          const y = event.nativeEvent.contentOffset.y;
                          setEndAmPmScrollY(y);
                          handleScroll(y, amPmOptions, setBlockEndAmPm);
                        }}
                        onMomentumScrollEnd={() => {
                          console.log('End AM/PM scroll end');
                        }}
                      >
                        {amPmOptions.map((amPm) => (
                          <View
                            key={`end-ampm-${amPm}`}
                            style={[
                              styles.timePickerOption,
                              blockEndAmPm === amPm && styles.selectedTimeOption
                            ]}
                          >
                            <Text style={[
                              styles.timePickerOptionText,
                              blockEndAmPm === amPm && styles.selectedTimeOptionText
                            ]}>{amPm}</Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.blockTimeSummary}>
                <Text style={styles.blockTimeSummaryText}>
                  {blockTime > 0 
                    ? `You will block ${blockTime.toFixed(1)} hours for this task.`
                    : 'Select start and end time to block time for this task.'}
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
                  onPress={handleTimeSelect}
                >
                  <Text style={[styles.blockTimeModalButtonText, styles.blockTimeModalConfirmText]}>CONFIRM</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <ProgressIndicator currentStep={2} totalSteps={2} />
    </Layout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  taskInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#000',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0',
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fieldRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    color: '#333',
  },
  fieldValue: {
    fontSize: 16,
    color: '#666',
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
  valueText: {
    fontSize: 17,
    color: '#000',
    marginRight: 4,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  priorityContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  priorityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  priorityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  priorityButtonSelected: {
    borderColor: 'transparent',
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockTimeModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: width - 40,
    padding: 20,
  },
  blockTimeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  timeDisplay: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  blockTimeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  requiredText: {
    fontSize: 14,
    color: '#FF4B4B',
  },
  requiredField: {
    borderColor: '#FF4B4B',
  },
  requiredLabel: {
    color: '#FF4B4B',
  },
  noteModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: width - 40,
  },
  noteModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
  },
  noteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  noteModalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  noteModalButtonPrimary: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  noteModalButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  noteModalButtonTextPrimary: {
    color: '#fff',
  },
});

export default DailyPlanDefineTask; 