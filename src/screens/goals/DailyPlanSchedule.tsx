import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import { saveTempGoalData } from '../../services/tempGoalStorage';

type FrequencyOption = 'every-day' | 'specific-days-week' | 'specific-days-month' | 'specific-days-year' | 'some-days-period' | 'repeat';
type ReminderType = 'dont-remind' | 'notification' | 'alarm';
type ReminderSchedule = 'always-enabled' | 'specific-days' | 'days-before';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DailyPlanSchedule'>;
type RouteType = RouteProp<RootStackParamList, 'DailyPlanSchedule'>;

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
      };
    }
  }
}

const PRIORITY_OPTIONS = ['Must', 'Should', 'Could', 'Would'];

const DailyPlanSchedule = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { category, taskType, gender, evaluationType, habit, description, frequency, selectedDays, isFlexible } = route.params;

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

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateSelect = (date: any) => {
    const formattedDate = moment(date).format('DD/MM/YY');
    if (activeDate === 'start') {
      setStartDate(formattedDate);
    } else {
      setEndDate(formattedDate);
      // Calculate days between start and end date
      const start = moment(startDate === 'Today' ? new Date() : startDate, 'DD/MM/YY');
      const end = moment(date);
      const days = end.diff(start, 'days');
      setDaysCount(days.toString());
    }
    setIsCalendarVisible(false);
  };

  const openCalendar = (type: 'start' | 'end') => {
    if (type === 'end' && !isEndDateEnabled) return;
    setActiveDate(type);
    setIsCalendarVisible(true);
  };

  const handleNext = async () => {
    try {
      await saveTempGoalData({
        schedule: {
          startTime: startDate,
          endTime: isEndDateEnabled ? endDate : '',
          duration: parseInt(daysCount) || 0,
          reminder: timeAndReminders > 0,
          reminderTime: selectedTime,
          reminderType: reminderType as 'dont-remind' | 'notification' | 'alarm',
          reminderSchedule: reminderSchedule as 'always-enabled' | 'specific-days' | 'days-before',
          selectedWeekDays,
          daysBeforeCount: parseInt(daysBeforeCount) || 0,
          hoursBeforeCount: hoursBeforeCount ? parseInt(hoursBeforeCount) : 0
        }
      });
      
      navigation.navigate('DailyPlanConfirmation', {
        category,
        taskType,
        gender,
        evaluationType,
        habit,
        description,
        frequency,
        selectedDays,
        isFlexible,
        startDate,
        endDate,
        timeAndReminders,
        priority,
        blockTime,
        pomodoro
      });
    } catch (error) {
      console.error('Error saving temporary data:', error);
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>What Schedule Would You Prefer?</Text>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              {/* Start Date */}
              <View style={styles.inputRow}>
                <View style={styles.iconContainer}>
                  <Icon name="event" size={24} color="#666" />
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
                  <Icon name="event" size={24} color="#666" />
                </View>
                <Text style={styles.inputLabel}>End date</Text>
                <Switch
                  value={isEndDateEnabled}
                  onValueChange={setIsEndDateEnabled}
                  style={styles.switch}
                  trackColor={{ false: '#E0E0E0', true: '#3F51B5' }}
                  thumbColor="#fff"
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
                      {endDate || '17/06/25'}
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
                  <Icon name="access-time" size={24} color="#666" />
                </View>
                <Text style={styles.inputLabel}>Time and reminders</Text>
                <TouchableOpacity 
                  style={styles.valueContainer}
                  onPress={() => setIsSimpleReminderModalVisible(true)}
                >
                  <Text style={styles.valueText}>{timeAndReminders}</Text>
                </TouchableOpacity>
              </View>

              {/* Priority */}
              <View style={[styles.inputRow, { borderBottomWidth: isPriorityDropdownVisible ? 0 : 1 }]}>
                <View style={styles.iconContainer}>
                  <Icon name="flag" size={24} color="#666" />
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
                  <Icon name="schedule" size={24} color="#666" />
                </View>
                <Text style={styles.inputLabel}>Block Time</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>{blockTime}</Text>
                </View>
              </View>

              {/* Pomodoro */}
              <View style={styles.inputRow}>
                <View style={styles.iconContainer}>
                  <Icon name="timer" size={24} color="#666" />
                </View>
                <Text style={styles.inputLabel}>Pomodoro</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>{pomodoro}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.progressIndicator}>
            <View style={styles.progressStep}>
              <View style={[styles.stepCircle, styles.completedStep]}>
                <Icon name="check" size={16} color="#fff" />
              </View>
              <View style={[styles.stepLine, styles.completedLine]} />
            </View>
            <View style={styles.progressStep}>
              <View style={[styles.stepCircle, styles.completedStep]}>
                <Icon name="check" size={16} color="#fff" />
              </View>
              <View style={[styles.stepLine, styles.completedLine]} />
            </View>
            <View style={styles.progressStep}>
              <View style={[styles.stepCircle, styles.completedStep]}>
                <Icon name="check" size={16} color="#fff" />
              </View>
              <View style={[styles.stepLine, styles.completedLine]} />
            </View>
            <View style={styles.progressStep}>
              <View style={[styles.stepCircle, styles.currentStep]}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>

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
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>
                {activeDate === 'start' ? 'Select Start Date' : 'Select End Date'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsCalendarVisible(false)}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <CalendarPicker
              onDateChange={handleDateSelect}
              selectedDayColor="#3F51B5"
              selectedDayTextColor="#fff"
              minDate={activeDate === 'end' && startDate !== 'Today' ? moment(startDate, 'DD/MM/YY').toDate() : new Date()}
              width={300}
            />
          </View>
        </View>
      </Modal>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  nextButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  nextButtonText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '400',
  },
  scrollContent: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  completedStep: {
    backgroundColor: '#3F51B5',
  },
  currentStep: {
    backgroundColor: '#3F51B5',
    borderWidth: 2,
    borderColor: '#3F51B5',
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  completedLine: {
    backgroundColor: '#3F51B5',
  },
  stepNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
    padding: 16,
    width: '90%',
    maxWidth: 400,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  endDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 66, // iconContainer width + marginRight
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    marginLeft: 66, // iconContainer width + marginRight
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
  closeText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
});

export default DailyPlanSchedule; 