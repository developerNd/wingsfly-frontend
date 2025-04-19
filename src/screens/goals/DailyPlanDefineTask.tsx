import React, { useState, useEffect } from 'react';
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
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const DailyPlanDefineTask = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { category: initialCategory, taskType, gender, evaluationType, selectedOption } = route.params as RouteParams;

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
  const [blockTime, setBlockTime] = useState('0');
  const [pomodoros, setPomodoros] = useState('0');
  const [priority, setPriority] = useState<'Must' | 'Important'>('Must');
  const [note, setNote] = useState('');
  const [pendingTask, setPendingTask] = useState(false);
  const [linkedGoal, setLinkedGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      
      const taskData = {
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
        duration: parseInt(blockTime),
        priority,
        block_time: parseInt(blockTime),
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

  const handleTimeChange = (type: 'start' | 'end', field: 'hour' | 'minute' | 'period', value: string | number) => {
    const timeState = type === 'start' ? tempStartTime : tempEndTime;
    const setTimeState = type === 'start' ? setTempStartTime : setTempEndTime;

    if (field === 'hour') {
      let hour = typeof value === 'string' ? parseInt(value) : value;
      if (hour > 12) hour = 12;
      if (hour < 1) hour = 1;
      setTimeState({ ...timeState, hour });
    } else if (field === 'minute') {
      let minute = typeof value === 'string' ? parseInt(value) : value;
      if (minute > 59) minute = 59;
      if (minute < 0) minute = 0;
      setTimeState({ ...timeState, minute });
    } else {
      setTimeState({ ...timeState, period: value as string });
    }
  };

  const handleTimeConfirm = () => {
    setStartTime(tempStartTime);
    setEndTime(tempEndTime);
    setBlockTime(calculateBlockTime(tempStartTime, tempEndTime).toString());
    setShowTimeModal(false);
  };

  const calculateBlockTime = (start: typeof startTime, end: typeof endTime) => {
    const startHour = start.period === 'PM' && start.hour !== 12 ? start.hour + 12 : start.hour;
    const endHour = end.period === 'PM' && end.hour !== 12 ? end.hour + 12 : end.hour;
    const startMinutes = startHour * 60 + start.minute;
    const endMinutes = endHour * 60 + end.minute;
    return Math.round((endMinutes - startMinutes) / 60);
  };

  useEffect(() => {
    if (showTimeModal) {
      setTempStartTime(startTime);
      setTempEndTime(endTime);
    }
  }, [showTimeModal]);

  const TimePickerModal = () => (
    <Modal
      visible={showTimeModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowTimeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.timeModalContent}>
          <Text style={styles.timeModalTitle}>Block Time</Text>
          <View style={styles.timePickerContainer}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Start Time</Text>
              <View style={styles.timeSelector}>
                <View style={styles.timeInputContainer}>
                  <TextInput
                    style={styles.timeInput}
                    value={tempStartTime.hour.toString().padStart(2, '0')}
                    onChangeText={(value) => handleTimeChange('start', 'hour', value)}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.timeSeparator}>:</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={tempStartTime.minute.toString().padStart(2, '0')}
                    onChangeText={(value) => handleTimeChange('start', 'minute', value)}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                <TouchableOpacity
                  style={styles.periodSelector}
                  onPress={() => handleTimeChange('start', 'period', tempStartTime.period === 'AM' ? 'PM' : 'AM')}
                >
                  <Text style={styles.periodText}>{tempStartTime.period}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>End Time</Text>
              <View style={styles.timeSelector}>
                <View style={styles.timeInputContainer}>
                  <TextInput
                    style={styles.timeInput}
                    value={tempEndTime.hour.toString().padStart(2, '0')}
                    onChangeText={(value) => handleTimeChange('end', 'hour', value)}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.timeSeparator}>:</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={tempEndTime.minute.toString().padStart(2, '0')}
                    onChangeText={(value) => handleTimeChange('end', 'minute', value)}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                <TouchableOpacity
                  style={styles.periodSelector}
                  onPress={() => handleTimeChange('end', 'period', tempEndTime.period === 'AM' ? 'PM' : 'AM')}
                >
                  <Text style={styles.periodText}>{tempEndTime.period}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.timeModalButtons}>
            <TouchableOpacity
              style={styles.timeModalButton}
              onPress={() => setShowTimeModal(false)}
            >
              <Text style={styles.timeModalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeModalButton, styles.timeModalButtonPrimary]}
              onPress={handleTimeConfirm}
            >
              <Text style={[styles.timeModalButtonText, styles.timeModalButtonTextPrimary]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Task</Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleCreateTask}
            disabled={isLoading}
          >
            <Text style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <TextInput
            style={styles.taskInput}
            placeholder="Task"
            value={task}
            onChangeText={setTask}
            placeholderTextColor="#999"
          />

          <TouchableOpacity 
            style={styles.field}
            onPress={handleCategorySelect}
          >
            <View style={styles.fieldLeft}>
              <Icon name="category" size={20} color="#666" />
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
              <Icon name="calendar-today" size={20} color="#666" />
              <Text style={styles.fieldLabel}>Date</Text>
            </View>
            <Text style={styles.fieldValue}>{formatDisplayDate(date)}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.field}
            onPress={() => setShowTimeModal(true)}
          >
            <View style={styles.fieldLeft}>
              <Icon name="access-time" size={20} color="#666" />
              <Text style={styles.fieldLabel}>block time</Text>
            </View>
            <Text style={styles.fieldValue}>{blockTime}</Text>
          </TouchableOpacity>

          <View style={styles.field}>
            <View style={styles.fieldLeft}>
              <Icon name="timer" size={20} color="#666" />
              <Text style={styles.fieldLabel}>pomodoro</Text>
            </View>
            <Text style={styles.fieldValue}>{pomodoros}</Text>
          </View>

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

          <TouchableOpacity 
            style={styles.field}
            onPress={() => setShowNoteModal(true)}
          >
            <View style={styles.fieldLeft}>
              <Icon name="note" size={20} color="#666" />
              <Text style={styles.fieldLabel}>Note</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.field}
            onPress={() => setPendingTask(!pendingTask)}
          >
            <View style={styles.fieldLeft}>
              <Icon name="pending" size={20} color="#666" />
              <Text style={styles.fieldLabel}>Pending Task</Text>
            </View>
            <View style={[styles.checkbox, pendingTask && styles.checkboxChecked]}>
              {pendingTask && <Icon name="check" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.field}>
            <View style={styles.fieldLeft}>
              <Icon name="link" size={20} color="#666" />
              <Text style={styles.fieldLabel}>Link To Goal</Text>
            </View>
            <Icon name="add" size={24} color="#666" />
          </TouchableOpacity>
        </ScrollView>

        <TimePickerModal />
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
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    ...Platform.select({
      android: {
        paddingTop: StatusBar.currentHeight,
        height: 56 + (StatusBar.currentHeight || 0),
      },
    }),
  },
  headerButton: {
    padding: 8,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  nextButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  priorityButtons: {
    flexDirection: 'row',
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
  timeModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: width - 40,
  },
  timeModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
  },
  timeInput: {
    fontSize: 20,
    color: '#000',
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 20,
    color: '#000',
    fontWeight: '600',
    marginHorizontal: 4,
  },
  periodSelector: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  periodText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  timeModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  timeModalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  timeModalButtonPrimary: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  timeModalButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeModalButtonTextPrimary: {
    color: '#fff',
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