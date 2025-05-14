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
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Layout from '../../components/Layout';
import ProgressIndicator from '../../components/ProgressIndicator';
import CustomSwitch from '../../components/CustomSwitch';

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

// FlexibleOption component for reuse
const FlexibleOption = ({ enabled, onPress }: { enabled: boolean; onPress: () => void }) => (
  <TouchableOpacity style={styles.flexibleRow} onPress={onPress} activeOpacity={0.7}>
    <View style={{ flex: 1 }}>
      <Text style={styles.flexibleLabel}>Flexible</Text>
      <Text style={styles.flexibleSubText}>It will be shown each day until completed</Text>
    </View>
    {enabled && (
      <Icon name="check-circle" size={22} color="#BFE3D2" />
    )}
    {!enabled && (
      <Icon name="radio-button-unchecked" size={22} color="#BDBDBD" />
    )}
  </TouchableOpacity>
);

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 3;
const PADDING_HEIGHT = (ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2));

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
  const [pickerMonthIndex, setPickerMonthIndex] = useState(0);
  const [pickerDay, setPickerDay] = useState(1);
  const [daysCount, setDaysCount] = useState('1');
  const [periodType, setPeriodType] = useState('WEEK');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  const monthScrollRef = useRef<ScrollView>(null);
  const dayScrollRef = useRef<ScrollView>(null);

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
    const month = months[pickerMonthIndex];
    const day = pickerDay;
    if (!selectedYearDates.some(date => date.month === month && date.day === String(day))) {
      setSelectedYearDates([...selectedYearDates, { month, day: String(day) }]);
    }
    setIsDatePickerVisible(false);
  };

  const handleDeleteYearDate = (index: number) => {
    setSelectedYearDates(selectedYearDates.filter((_, i) => i !== index));
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

  const renderDatePickerModal = () => (
    <Modal
      visible={isDatePickerVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setIsDatePickerVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerModal}>
          <Text style={styles.datePickerTitle}>Select a date</Text>
          <View style={styles.pickerRow}>
            {/* Month Picker */}
            <View style={styles.pickerColWithLines}>
              {/* Top line for selected value */}
              <View style={[styles.pickerLine, { top: ITEM_HEIGHT }]} />
              {/* Bottom line for selected value */}
              <View style={[styles.pickerLine, { top: ITEM_HEIGHT * 2 }]} />
              <ScrollView
                style={styles.pickerCol}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentOffset={{ y: pickerMonthIndex * ITEM_HEIGHT, x: 0 }}
                onMomentumScrollEnd={e => {
                  const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                  setPickerMonthIndex(idx);
                  if (pickerDay > daysInMonth[idx]) setPickerDay(1);
                }}
              >
                <View style={{ height: PADDING_HEIGHT }} />
                {months.map((m, i) => (
                  <View key={m} style={[styles.pickerItem, pickerMonthIndex === i && styles.pickerItemSelected]}>
                    <Text style={[styles.pickerText, pickerMonthIndex === i && styles.pickerTextSelected]}>{m}</Text>
                  </View>
                ))}
                <View style={{ height: PADDING_HEIGHT }} />
              </ScrollView>
            </View>
            {/* Day Picker */}
            <View style={styles.pickerColWithLines}>
              {/* Top line for selected value */}
              <View style={[styles.pickerLine, { top: ITEM_HEIGHT }]} />
              {/* Bottom line for selected value */}
              <View style={[styles.pickerLine, { top: ITEM_HEIGHT * 2 }]} />
              <ScrollView
                style={styles.pickerCol}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentOffset={{ y: (pickerDay - 1) * ITEM_HEIGHT, x: 0 }}
                onMomentumScrollEnd={e => {
                  const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT) + 1;
                  setPickerDay(idx);
                }}
              >
                <View style={{ height: PADDING_HEIGHT }} />
                {Array.from({ length: daysInMonth[pickerMonthIndex] }, (_, i) => i + 1).map(day => (
                  <View key={day} style={[styles.pickerItem, pickerDay === day && styles.pickerItemSelected]}>
                    <Text style={[styles.pickerText, pickerDay === day && styles.pickerTextSelected]}>{day}</Text>
                  </View>
                ))}
                <View style={{ height: PADDING_HEIGHT }} />
              </ScrollView>
            </View>
          </View>
          <View style={styles.datePickerActionsRow}>
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

  return (
    <Layout
      title="How Often Do You Want To Do It?"
      onBackPress={() => navigation.goBack()}
      rightButtonText="Next"
      onRightButtonPress={handleNext}
    >
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ gap: 16 }}>
          {/* Every Day */}
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setSelectedFrequency('every-day')}
            activeOpacity={0.7}
          >
            <Icon
              name={selectedFrequency === 'every-day' ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={22}
              color={selectedFrequency === 'every-day' ? '#3F51B5' : '#BDBDBD'}
            />
            <Text style={styles.radioLabel}>Every Day</Text>
          </TouchableOpacity>

          {/* Specific days of the week */}
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setSelectedFrequency('specific-days-week')}
            activeOpacity={0.7}
          >
            <Icon
              name={selectedFrequency === 'specific-days-week' ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={22}
              color={selectedFrequency === 'specific-days-week' ? '#3F51B5' : '#BDBDBD'}
            />
            <Text style={styles.radioLabel}>Specific days of the week</Text>
          </TouchableOpacity>
          {selectedFrequency === 'specific-days-week' && (
            <>
              <View style={styles.weekRowWrap}>
                {daysOfWeek.map((day, idx) => (
                  <TouchableOpacity
                    key={day.name}
                    style={styles.dayCheckRow}
                    onPress={() => handleDayToggle(idx)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={day.selected ? 'check-box' : 'check-box-outline-blank'}
                      size={22}
                      color={day.selected ? '#232A6E' : '#BDBDBD'}
                    />
                    <Text style={[styles.dayCheckLabel, day.selected && styles.dayCheckLabelSelected]}>{day.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <FlexibleOption enabled={isFlexible} onPress={() => setIsFlexible(!isFlexible)} />
            </>
          )}

          {/* Specific days of the month */}
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setSelectedFrequency('specific-days-month')}
            activeOpacity={0.7}
          >
            <Icon
              name={selectedFrequency === 'specific-days-month' ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={22}
              color={selectedFrequency === 'specific-days-month' ? '#3F51B5' : '#BDBDBD'}
            />
            <Text style={styles.radioLabel}>Specific days of the month</Text>
          </TouchableOpacity>
          {selectedFrequency === 'specific-days-month' && (
            <>
              <View style={styles.monthCalendarContainer}>
                {renderMonthCalendar()}
              </View>
              <Text style={styles.selectDayText}>Select at least one day</Text>
              <FlexibleOption enabled={isFlexible} onPress={() => setIsFlexible(!isFlexible)} />
              <View style={styles.useDayOfWeekContainer}>
                <Text style={styles.useDayOfWeekText}>Use day of the week</Text>
                <CustomSwitch value={useDayOfWeek} onValueChange={setUseDayOfWeek} />
              </View>
            </>
          )}

          {/* Specific days of the year */}
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setSelectedFrequency('specific-days-year')}
            activeOpacity={0.7}
          >
            <Icon
              name={selectedFrequency === 'specific-days-year' ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={22}
              color={selectedFrequency === 'specific-days-year' ? '#3F51B5' : '#BDBDBD'}
            />
            <Text style={styles.radioLabel}>Specific days of the year</Text>
          </TouchableOpacity>
          {selectedFrequency === 'specific-days-year' && (
            <View style={styles.yearDatesContainer}>
              <View style={styles.selectedDatesRow}>
                {selectedYearDates.length === 0 ? (
                  <View style={styles.selectedDateBoxRow}>
                    <View style={styles.emptyDateBox}>
                      <Text style={styles.emptyDateText}>Select at least one day</Text>
                    </View>
                    <TouchableOpacity style={styles.addDateButtonBox} onPress={() => setIsDatePickerVisible(true)}>
                      <Icon name="add" size={28} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {selectedYearDates.map((date, index) => (
                      <View key={index} style={styles.selectedDateBox}>
                        <Text style={styles.selectedDateText}>{`${date.month} ${date.day}`}</Text>
                        <TouchableOpacity onPress={() => handleDeleteYearDate(index)}>
                          <Icon name="delete" size={20} color="#9E9E9E" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity style={styles.addDateButtonBox} onPress={() => setIsDatePickerVisible(true)}>
                      <Icon name="add" size={28} color="#fff" />
                    </TouchableOpacity>
                  </>
                )}
                <FlexibleOption enabled={isFlexible} onPress={() => setIsFlexible(!isFlexible)} />
              </View>
              {renderDatePickerModal()}
            </View>
          )}

          {/* Some days per period */}
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setSelectedFrequency('some-days-period')}
            activeOpacity={0.7}
          >
            <Icon
              name={selectedFrequency === 'some-days-period' ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={22}
              color={selectedFrequency === 'some-days-period' ? '#3F51B5' : '#BDBDBD'}
            />
            <Text style={styles.radioLabel}>Some days per period</Text>
          </TouchableOpacity>
          {renderSomeDaysPerPeriod()}

          {/* Repeat */}
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setSelectedFrequency('repeat')}
            activeOpacity={0.7}
          >
            <Icon
              name={selectedFrequency === 'repeat' ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={22}
              color={selectedFrequency === 'repeat' ? '#3F51B5' : '#BDBDBD'}
            />
            <Text style={styles.radioLabel}>Repeat</Text>
          </TouchableOpacity>
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
              <FlexibleOption enabled={isFlexible} onPress={() => setIsFlexible(!isFlexible)} />
              <View style={styles.alternateDaysContainer}>
                <Text style={styles.alternateDaysText}>Alternate Days</Text>
                <CustomSwitch value={useDayOfWeek} onValueChange={setUseDayOfWeek} />
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <ProgressIndicator currentStep={3} totalSteps={4} />
    </Layout>
  );
};

const styles = StyleSheet.create({

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
    // marginLeft: 8,
  },
  flexibleCheckbox: {
    marginLeft: 8,
  },
  monthCalendarContainer: {
    marginTop: 16,
    paddingHorizontal: 30,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  monthDay: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 8,
  },
  selectedMonthDay: {
    backgroundColor: '#151B73',
  },
  monthDayText: {
    fontSize: 14,
    color: '#818181',
  },
  selectedMonthDayText: {
    color: '#fff',
  },
  selectDayText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
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
    marginTop: 0,
    // paddingHorizontal: 16,
    paddingVertical: 8,
  },
  useDayOfWeekText: {
    fontSize: 16,
    color: '#747474',
  },
  yearDatesContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    flex: 1,
  },
  selectedDatesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
    flex: 1,
  },
  selectedDateBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
    flex: 1,
  },
  emptyDateBox: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 160,
    flex: 1,
  },
  emptyDateText: {
    color: '#A0A0A0',
    fontSize: 16,
    fontWeight: '400',
  },
  selectedDateBox: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginRight: 0,
    minWidth: 120,
    gap: 12,
    flex: 1,
  },
  selectedDateText: {
    color: '#A0A0A0',
    fontSize: 16,
    fontWeight: '400',
    marginRight: 8,
    flex: 1,
  },
  addDateButtonBox: {
    width: 48,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#151B73',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: Dimensions.get('window').width * 0.8,
    alignSelf: 'center',
    alignItems: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 16,
  },
  pickerCol: {
    width: 100,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemSelected: {},
  pickerText: {
    fontSize: 16,
    color: '#BDBDBD',
  },
  pickerTextSelected: {
    color: '#232A6E',
    fontWeight: 'bold',
    fontSize: 18,
  },
  datePickerTitle: {
    fontSize: 18,
    color: '#232A6E',
    fontWeight: '600',
    marginBottom: 8,
  },
  datePickerActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 70,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  selectedDatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  someDaysContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    
    
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F6F6',
    gap: 12,
  },
  numberInputContainer: {
    width: 28,
    height: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberInput: {
    fontSize: 16,
     fontWeight: '700',
    color: '#00000',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
    // borderBottomColor
    borderBottomWidth: 1,
    borderBottomColor: '#868686'
  },
  daysPerText: {
    fontSize: 16,
    color: '#868686',
    fontWeight: '700'
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
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: '#F6F6F6',
    paddingVertical: 8
  },
  repeatText: {
    fontSize: 16,
    color: '#868686',
    // fontWeight: '700'
  },
  alternateDaysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 0,
    // paddingHorizontal: 16,
    paddingVertical: 8,
  },
  alternateDaysText: {
    fontSize: 16,
    color: '#333',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: 0,
    gap: 10,
  },
  radioLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '400',
  },
  weekRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginVertical: 8,
    // marginLeft: 32,
    
  },
  dayBox: {
    minWidth: 70,
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayBoxSelected: {
    backgroundColor: '#232A6E',
    borderColor: '#232A6E',
  },
  dayBoxText: {
    color: '#232A6E',
    fontWeight: '400',
    fontSize: 15,
  },
  dayBoxTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  flexibleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginLeft: 32,
    marginTop: 2,
    marginBottom: 8,
    gap: 10,
  },
  flexibleLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
  },
  dayCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    // marginLeft: 32,
    gap: 10,
    marginRight: 10,
  },
  dayCheckLabel: {
    fontSize: 15,
    color: '#747474',
    fontWeight: '400',
  },
  dayCheckLabelSelected: {
    color: '#232A6E',
    fontWeight: '700',
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
  pickerColWithLines: {
    width: 100,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  pickerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#BDBDBD',
    zIndex: 2,
  },
});

export default DailyPlanFrequency; 
