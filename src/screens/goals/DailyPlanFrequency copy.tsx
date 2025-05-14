import React, { useState, ReactElement, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DailyPlanFrequency'>;
type RouteType = RouteProp<RootStackParamList, 'DailyPlanFrequency'>;

type FrequencyOption = 'every-day' | 'specific-days-week' | 'specific-days-month' | 'specific-days-year' | 'some-days-period' | 'repeat';

interface DayOfWeek {
  name: string;
  selected: boolean;
}

interface MonthDay {
  day: number;
  selected: boolean;
}

interface YearDate {
  month: string;
  day: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface NavigationParams {
  category: string;
  taskType: string;
  gender: 'male' | 'female';
  evaluationType: string;
  habit: string;
  description: string;
  selectedOption: string;
  frequency: FrequencyOption;
  selectedDays?: string[];
  isFlexible?: boolean;
  checklist_items?: ChecklistItem[];
  numeric_value: number;
  numeric_condition: string;
  numeric_unit: string;
}

// Update the RootStackParamList to include isFlexible and checklist_items
declare global {
  namespace ReactNavigation {
    interface RootStackParamList {
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
      DailyPlanFrequency: {
        category: string;
        taskType: string;
        gender: 'male' | 'female';
        evaluationType: string;
        habit: string;
        description: string;
        selectedOption: string;
        checklist_items?: ChecklistItem[];
        numeric_value: number;
        numeric_condition: string;
        numeric_unit: string;
      };
    }
  }
}

const DailyPlanFrequency = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { category, taskType, gender, evaluationType, habit, description, selectedOption } = route.params;

  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyOption>('every-day');
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>([
    { name: 'Monday', selected: false },
    { name: 'Tuesday', selected: false },
    { name: 'Wednesday', selected: false },
    { name: 'Thursday', selected: false },
    { name: 'Friday', selected: false },
    { name: 'Saturday', selected: false },
    { name: 'Sunday', selected: false },
  ]);
  const [isFlexible, setIsFlexible] = useState(false);
  const [monthDays, setMonthDays] = useState<MonthDay[]>([
    ...Array.from({ length: 31 }, (_, i) => ({ day: i + 1, selected: false })),
    { day: 32, selected: false } // Last day option
  ]);
  const [useDayOfWeek, setUseDayOfWeek] = useState(false);
  const [selectedYearDates, setSelectedYearDates] = useState<YearDate[]>([]);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [daysCount, setDaysCount] = useState('1');
  const [periodType, setPeriodType] = useState('WEEK');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  const months = [
    'December', 'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October', 'November'
  ];

  const monthScrollRef = useRef<ScrollView>(null);
  const dayScrollRef = useRef<ScrollView>(null);
  const itemHeight = 40;

  const periodOptions = ['WEEK', 'MONTH', 'YEAR'];

  const handleDayToggle = (index: number) => {
    const newDays = [...daysOfWeek];
    newDays[index].selected = !newDays[index].selected;
    setDaysOfWeek(newDays);
  };

  const handleMonthDayToggle = (index: number) => {
    const newDays = [...monthDays];
    newDays[index].selected = !newDays[index].selected;
    setMonthDays(newDays);
  };

  const handleAddYearDate = () => {
    if (selectedMonth && selectedDay) {
      setSelectedYearDates([...selectedYearDates, { 
        month: selectedMonth, 
        day: selectedDay 
      }]);
      setSelectedMonth('');
      setSelectedDay('');
      setIsDatePickerVisible(false);
    }
  };

  const handleDeleteYearDate = (index: number) => {
    const newDates = selectedYearDates.filter((_, i) => i !== index);
    setSelectedYearDates(newDates);
  };

  const handleNext = () => {
    if (selectedFrequency === 'specific-days-week' && !daysOfWeek.some(day => day.selected)) {
      // Show error that at least one day must be selected
      return;
    }

    if (selectedFrequency === 'specific-days-month' && !monthDays.some(day => day.selected)) {
      // Show error that at least one day must be selected
      return;
    }

    if (selectedFrequency === 'specific-days-year' && selectedYearDates.length === 0) {
      // Show error that at least one date must be selected
      return;
    }

    // Prepare selected days based on frequency type
    let selectedDays: string[] = [];
    
    if (selectedFrequency === 'specific-days-week') {
      selectedDays = daysOfWeek.filter(day => day.selected).map(day => day.name);
    } else if (selectedFrequency === 'specific-days-month') {
      selectedDays = monthDays.filter(day => day.selected).map(day => day.day.toString());
    } else if (selectedFrequency === 'specific-days-year') {
      selectedDays = selectedYearDates.map(date => `${date.month}-${date.day}`);
    } else if (selectedFrequency === 'some-days-period') {
      // For some-days-period, include the days count and period type
      selectedDays = [`${daysCount}-${periodType}`];
    } else if (selectedFrequency === 'repeat') {
      // For repeat, include the days count
      selectedDays = [daysCount];
    }

    // Navigate to the next screen with the frequency settings
    navigation.navigate('DailyPlanSchedule', {
      category,
      taskType,
      gender,
      evaluationType,
      habit,
      description,
      selectedOption,
      frequency: selectedFrequency,
      selectedDays,
      isFlexible,
      checklist_items: route.params.checklist_items,
      numeric_value: route.params.numeric_value,
      numeric_condition: route.params.numeric_condition,
      numeric_unit: route.params.numeric_unit
    });
  };

  const handleMonthScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    const month = months[index];
    if (month) {
      setSelectedMonth(month);
    }
  };

  const handleDayScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    const day = (index + 1).toString();
    if (index >= 0 && index < 31) {
      setSelectedDay(day);
    }
  };

  const renderMonthCalendar = (): ReactElement[] => {
    // Create rows for days 1-31
    const rows: ReactElement[] = [];
    let currentRow: ReactElement[] = [];

    // Render days 1-31
    for (let i = 0; i < 31; i++) {
      currentRow.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.monthDay,
            monthDays[i].selected && styles.selectedMonthDay
          ]}
          onPress={() => handleMonthDayToggle(i)}
        >
          <Text style={[
            styles.monthDayText,
            monthDays[i].selected && styles.selectedMonthDayText
          ]}>
            {i + 1}
          </Text>
        </TouchableOpacity>
      );

      if (currentRow.length === 7 || i === 30) {
        rows.push(
          <View key={`row-${rows.length}`} style={styles.monthRow}>
            {currentRow}
          </View>
        );
        currentRow = [];
      }
    }

    // Add the "Last" button in a new row
    const lastRow = (
      <View key="last-row" style={styles.monthRow}>
        <TouchableOpacity
          style={[
            styles.monthDay,
            monthDays[31].selected && styles.selectedMonthDay
          ]}
          onPress={() => handleMonthDayToggle(31)}
        >
          <Text style={[
            styles.monthDayText,
            monthDays[31].selected && styles.selectedMonthDayText
          ]}>
            Last
          </Text>
        </TouchableOpacity>
      </View>
    );

    return [...rows, lastRow];
  };

  const renderDatePicker = () => (
    <Modal
      visible={isDatePickerVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setIsDatePickerVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerContainer}>
          <Text style={styles.datePickerTitle}>Select a date</Text>
          
          <View style={styles.datePickerContent}>
            {/* Months Column */}
            <View style={styles.columnContainer}>
              <View style={styles.selectionLines}>
                <View style={[styles.selectionLine, styles.topLine]} />
                <View style={[styles.selectionLine, styles.bottomLine]} />
              </View>
              <ScrollView 
                ref={monthScrollRef}
                showsVerticalScrollIndicator={false}
                style={styles.scrollColumn}
                onScroll={handleMonthScroll}
                scrollEventThrottle={16}
                snapToInterval={itemHeight}
                decelerationRate="fast"
              >
                <View style={styles.scrollPadding} />
                {months.map((month) => (
                  <View
                    key={month}
                    style={[
                      styles.dateOption,
                      { height: itemHeight }
                    ]}
                  >
                    <Text style={[
                      styles.dateText,
                      selectedMonth === month && styles.selectedDateText
                    ]}>
                      {month}
                    </Text>
                  </View>
                ))}
                <View style={styles.scrollPadding} />
              </ScrollView>
            </View>

            {/* Days Column */}
            <View style={styles.columnContainer}>
              <View style={styles.selectionLines}>
                <View style={[styles.selectionLine, styles.topLine]} />
                <View style={[styles.selectionLine, styles.bottomLine]} />
              </View>
              <ScrollView 
                ref={dayScrollRef}
                showsVerticalScrollIndicator={false}
                style={styles.scrollColumn}
                onScroll={handleDayScroll}
                scrollEventThrottle={16}
                snapToInterval={itemHeight}
                decelerationRate="fast"
              >
                <View style={styles.scrollPadding} />
                {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map((day) => (
                  <View
                    key={day}
                    style={[
                      styles.dateOption,
                      { height: itemHeight }
                    ]}
                  >
                    <Text style={[
                      styles.dateText,
                      selectedDay === day && styles.selectedDateText
                    ]}>
                      {day}
                    </Text>
                  </View>
                ))}
                <View style={styles.scrollPadding} />
              </ScrollView>
            </View>
          </View>

          <View style={styles.datePickerActions}>
            <TouchableOpacity onPress={() => setIsDatePickerVisible(false)}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddYearDate}>
              <Text style={styles.okText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSomeDaysPerPeriod = () => {
    if (selectedFrequency !== 'some-days-period') return null;

    return (
      <View style={styles.someDaysContainer}>
        <View style={styles.inputRow}>
          <View style={styles.numberInputContainer}>
            <TextInput
              style={styles.numberInput}
              value={daysCount}
              onChangeText={setDaysCount}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
          <Text style={styles.daysPerText}>Days Per</Text>
          <TouchableOpacity
            style={styles.periodDropdown}
            onPress={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
          >
            <Text style={styles.periodText}>{periodType}</Text>
            <Icon 
              name={isPeriodDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
              size={24} 
              color="#333"
            />
          </TouchableOpacity>
        </View>
        {isPeriodDropdownOpen && (
          <View style={styles.dropdownContainer}>
            {periodOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownOption,
                  periodType === option && styles.selectedDropdownOption
                ]}
                onPress={() => {
                  setPeriodType(option);
                  setIsPeriodDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>How Often Do You Want To Do It?</Text>
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.option, selectedFrequency === 'every-day' && styles.selectedOption]}
                onPress={() => setSelectedFrequency('every-day')}
              >
                <View style={styles.radioContainer}>
                  <Icon 
                    name={selectedFrequency === 'every-day' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={24} 
                    color={selectedFrequency === 'every-day' ? '#3F51B5' : '#666'} 
                  />
                  <Text style={styles.optionText}>Every Day</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, selectedFrequency === 'specific-days-week' && styles.selectedOption]}
                onPress={() => setSelectedFrequency('specific-days-week')}
              >
                <View style={styles.radioContainer}>
                  <Icon 
                    name={selectedFrequency === 'specific-days-week' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={24} 
                    color={selectedFrequency === 'specific-days-week' ? '#3F51B5' : '#666'} 
                  />
                  <Text style={styles.optionText}>Specific days of the week</Text>
                </View>
                {selectedFrequency === 'specific-days-week' && (
                  <>
                    <View style={styles.daysContainer}>
                      {daysOfWeek.map((day, index) => (
                        <TouchableOpacity
                          key={day.name}
                          style={[styles.dayOption, day.selected && styles.selectedDay]}
                          onPress={() => handleDayToggle(index)}
                        >
                          <Text style={[styles.dayText, day.selected && styles.selectedDayText]}>
                            {day.name.slice(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.flexibleContainer}>
                      <Text style={styles.flexibleText}>Flexible</Text>
                      <Text style={styles.flexibleSubText}>It can be done each day until completed</Text>
                      <TouchableOpacity
                        style={styles.flexibleCheckbox}
                        onPress={() => setIsFlexible(!isFlexible)}
                      >
                        <Icon 
                          name={isFlexible ? 'check-box' : 'check-box-outline-blank'} 
                          size={24} 
                          color={isFlexible ? '#3F51B5' : '#666'} 
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, selectedFrequency === 'specific-days-month' && styles.selectedOption]}
                onPress={() => setSelectedFrequency('specific-days-month')}
              >
                <View style={styles.radioContainer}>
                  <Icon 
                    name={selectedFrequency === 'specific-days-month' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={24} 
                    color={selectedFrequency === 'specific-days-month' ? '#3F51B5' : '#666'} 
                  />
                  <Text style={styles.optionText}>Specific days of the month</Text>
                </View>
                {selectedFrequency === 'specific-days-month' && (
                  <>
                    <View style={styles.monthCalendarContainer}>
                      {renderMonthCalendar()}
                    </View>
                    <Text style={styles.selectDayText}>Select at least one day</Text>
                    <View style={styles.flexibleContainer}>
                      <Text style={styles.flexibleText}>Flexible</Text>
                      <Text style={styles.flexibleSubText}>It can be done each day until completed</Text>
                      <TouchableOpacity
                        style={styles.flexibleCheckbox}
                        onPress={() => setIsFlexible(!isFlexible)}
                      >
                        <Icon 
                          name={isFlexible ? 'check-box' : 'check-box-outline-blank'} 
                          size={24} 
                          color={isFlexible ? '#3F51B5' : '#666'} 
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.useDayOfWeekContainer}>
                      <Text style={styles.useDayOfWeekText}>Use day of the week</Text>
                      <Switch
                        value={useDayOfWeek}
                        onValueChange={setUseDayOfWeek}
                        trackColor={{ false: '#E0E0E0', true: '#3F51B5' }}
                        thumbColor={useDayOfWeek ? '#fff' : '#fff'}
                      />
                    </View>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, selectedFrequency === 'specific-days-year' && styles.selectedOption]}
                onPress={() => setSelectedFrequency('specific-days-year')}
              >
                <View style={styles.radioContainer}>
                  <Icon 
                    name={selectedFrequency === 'specific-days-year' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={24} 
                    color={selectedFrequency === 'specific-days-year' ? '#3F51B5' : '#666'} 
                  />
                  <Text style={styles.optionText}>Specific days of the year</Text>
                </View>
                {selectedFrequency === 'specific-days-year' && (
                  <View style={styles.yearDatesContainer}>
                    {selectedYearDates.map((date, index) => (
                      <View key={index} style={styles.selectedDateContainer}>
                        <Text style={styles.selectedDateText}>
                          {`${date.month} ${date.day}`}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleDeleteYearDate(index)}
                          style={styles.deleteDateButton}
                        >
                          <Icon name="delete-outline" size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <View style={styles.addDateRow}>
                      <Text style={styles.selectDayText}>Select at least one day</Text>
                      <TouchableOpacity
                        style={styles.addDateButton}
                        onPress={() => setIsDatePickerVisible(true)}
                      >
                        <Icon name="add" size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.flexibleContainer}>
                      <View style={styles.flexibleTextContainer}>
                        <Text style={styles.flexibleText}>Flexible</Text>
                        <Text style={styles.flexibleSubText}>
                          It will be shown each day until completed
                        </Text>
                      </View>
                      <Switch
                        value={isFlexible}
                        onValueChange={setIsFlexible}
                        trackColor={{ false: '#E0E0E0', true: '#3F51B5' }}
                        thumbColor="#fff"
                      />
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, selectedFrequency === 'some-days-period' && styles.selectedOption]}
                onPress={() => setSelectedFrequency('some-days-period')}
              >
                <View style={styles.radioContainer}>
                  <Icon 
                    name={selectedFrequency === 'some-days-period' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={24} 
                    color={selectedFrequency === 'some-days-period' ? '#3F51B5' : '#666'} 
                  />
                  <Text style={styles.optionText}>Some days per period</Text>
                </View>
                {renderSomeDaysPerPeriod()}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, selectedFrequency === 'repeat' && styles.selectedOption]}
                onPress={() => setSelectedFrequency('repeat')}
              >
                <View style={styles.radioContainer}>
                  <Icon 
                    name={selectedFrequency === 'repeat' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={24} 
                    color={selectedFrequency === 'repeat' ? '#3F51B5' : '#666'} 
                  />
                  <Text style={styles.optionText}>Repeat</Text>
                </View>
                {selectedFrequency === 'repeat' && (
                  <>
                    <View style={styles.repeatInputContainer}>
                      <Text style={styles.repeatText}>Every</Text>
                      <View style={styles.numberInputContainer}>
                        <TextInput
                          style={styles.numberInput}
                          value={daysCount}
                          onChangeText={setDaysCount}
                          keyboardType="numeric"
                          maxLength={2}
                        />
                      </View>
                      <Text style={styles.repeatText}>Days</Text>
                    </View>
                    <View style={styles.flexibleContainer}>
                      <View style={styles.flexibleTextContainer}>
                        <Text style={styles.flexibleText}>Flexible</Text>
                        <Text style={styles.flexibleSubText}>
                          It can be done each day until completed
                        </Text>
                      </View>
                      <Switch
                        value={isFlexible}
                        onValueChange={setIsFlexible}
                        trackColor={{ false: '#E0E0E0', true: '#3F51B5' }}
                        thumbColor="#fff"
                      />
                    </View>
                    <View style={styles.alternateDaysContainer}>
                      <Text style={styles.alternateDaysText}>Alternate Days</Text>
                      <Switch
                        value={useDayOfWeek}
                        onValueChange={setUseDayOfWeek}
                        trackColor={{ false: '#E0E0E0', true: '#3F51B5' }}
                        thumbColor="#fff"
                      />
                    </View>
                  </>
                )}
              </TouchableOpacity>
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
              <View style={[styles.stepCircle, styles.currentStep]}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepLine} />
            </View>
            <View style={styles.progressStep}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
      {renderDatePicker()}
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
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
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    borderColor: '#3F51B5',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  dayOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
  },
  selectedDay: {
    backgroundColor: '#3F51B5',
  },
  dayText: {
    fontSize: 14,
    color: '#666',
  },
  selectedDayText: {
    color: '#fff',
  },
  flexibleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 16,
  },
  flexibleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  flexibleTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  flexibleDescription: {
    fontSize: 14,
    color: '#666',
  },
  flexibleText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  flexibleSubText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    marginLeft: 8,
  },
  flexibleCheckbox: {
    marginLeft: 8,
  },
  monthCalendarContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  monthDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedMonthDay: {
    backgroundColor: '#3F51B5',
  },
  monthDayText: {
    fontSize: 14,
    color: '#333',
  },
  selectedMonthDayText: {
    color: '#fff',
  },
  selectDayText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
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
  useDayOfWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  useDayOfWeekText: {
    fontSize: 16,
    color: '#333',
  },
  yearDatesContainer: {
    marginTop: 16,
  },
  addDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedDateText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  deleteDateButton: {
    padding: 4,
  },
  addDateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    padding: 24,
  },
  datePickerTitle: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  datePickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 200,
    marginBottom: 24,
  },
  columnContainer: {
    flex: 1,
    position: 'relative',
    height: 200,
  },
  scrollColumn: {
    height: '100%',
  },
  dateOption: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollPadding: {
    height: 80, // This creates space for items to scroll into the selection area
  },
  selectionLines: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 48,
    marginTop: -24,
    zIndex: 1,
  },
  selectionLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  topLine: {
    top: 0,
  },
  bottomLine: {
    bottom: 0,
  },
  dateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
  },
  cancelText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  okText: {
    fontSize: 14,
    color: '#3F51B5',
    fontWeight: '500',
  },
  someDaysContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberInputContainer: {
    width: 48,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberInput: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
  },
  daysPerText: {
    fontSize: 16,
    color: '#666',
  },
  periodDropdown: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownContainer: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    padding: 12,
  },
  selectedDropdownOption: {
    backgroundColor: '#F5F5F5',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
  repeatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  repeatText: {
    fontSize: 16,
    color: '#333',
  },
  alternateDaysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  alternateDaysText: {
    fontSize: 16,
    color: '#333',
  },
});

export default DailyPlanFrequency; 