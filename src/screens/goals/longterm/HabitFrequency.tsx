import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/AppNavigator';

interface FrequencyOption {
  id: string;
  title: string;
}

interface WeekDay {
  id: string;
  name: string;
}

interface YearlyDate {
  month: string;
  day: number;
}

const weekDays: WeekDay[] = [
  { id: 'monday', name: 'Monday' },
  { id: 'tuesday', name: 'Tuesday' },
  { id: 'wednesday', name: 'Wednesday' },
  { id: 'thursday', name: 'Thursday' },
  { id: 'friday', name: 'Friday' },
  { id: 'saturday', name: 'Saturday' },
  { id: 'sunday', name: 'Sunday' },
];

const frequencyOptions: FrequencyOption[] = [
  {
    id: 'everyday',
    title: 'Every Day',
  },
  {
    id: 'specific_days_week',
    title: 'Specific days of the week',
  },
  {
    id: 'specific_days_month',
    title: 'Specific days of the month',
  },
  {
    id: 'specific_days_year',
    title: 'Specific days of the year',
  },
  {
    id: 'some_days_period',
    title: 'Some days per period',
  },
  {
    id: 'repeat',
    title: 'Repeat',
  },
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const periodOptions = ['WEEK', 'MONTH', 'YEAR'];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'HabitFrequency'>;

const HabitFrequency = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'HabitFrequency'>>();
  const { category, taskType, evaluationType, habit, description } = route.params;
  const [selectedOption, setSelectedOption] = useState<string>('everyday');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [isFlexible, setIsFlexible] = useState(false);
  const [useDayOfWeek, setUseDayOfWeek] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYearlyDates, setSelectedYearlyDates] = useState<YearlyDate[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedDay, setSelectedDay] = useState('1');
  const [daysCount, setDaysCount] = useState('1');
  const [selectedPeriod, setSelectedPeriod] = useState('WEEK');
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [repeatDays, setRepeatDays] = useState('2');

  const generateMonthDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    return days;
  };

  const monthDays = generateMonthDays();

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const toggleDate = (date: number) => {
    setSelectedDates(prev =>
      prev.includes(date)
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const renderWeekDayOptions = () => (
    <View style={styles.weekDaysContainer}>
      <View style={styles.weekDaysGrid}>
        <View style={styles.weekDayRow}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleDay('monday')}
          >
            <Icon 
              name={selectedDays.includes('monday') ? 'check-box' : 'check-box-outline-blank'} 
              size={24} 
              color={selectedDays.includes('monday') ? '#007AFF' : '#999'} 
            />
            <Text style={styles.weekDayText}>Monday</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleDay('tuesday')}
          >
            <Icon 
              name={selectedDays.includes('tuesday') ? 'check-box-outline-blank' : 'check-box-outline-blank'} 
              size={24} 
              color="#999" 
            />
            <Text style={styles.weekDayText}>Tuesday</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleDay('wednesday')}
          >
            <Icon 
              name={selectedDays.includes('wednesday') ? 'check-box-outline-blank' : 'check-box-outline-blank'} 
              size={24} 
              color="#999" 
            />
            <Text style={styles.weekDayText}>Wednesday</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.weekDayRow}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleDay('thursday')}
          >
            <Icon 
              name={selectedDays.includes('thursday') ? 'check-box-outline-blank' : 'check-box-outline-blank'} 
              size={24} 
              color="#999" 
            />
            <Text style={styles.weekDayText}>Thursday</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleDay('friday')}
          >
            <Icon 
              name={selectedDays.includes('friday') ? 'check-box-outline-blank' : 'check-box-outline-blank'} 
              size={24} 
              color="#999" 
            />
            <Text style={styles.weekDayText}>Friday</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleDay('saturday')}
          >
            <Icon 
              name={selectedDays.includes('saturday') ? 'check-box-outline-blank' : 'check-box-outline-blank'} 
              size={24} 
              color="#999" 
            />
            <Text style={styles.weekDayText}>Saturday</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.weekDayRow}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleDay('sunday')}
          >
            <Icon 
              name={selectedDays.includes('sunday') ? 'check-box-outline-blank' : 'check-box-outline-blank'} 
              size={24} 
              color="#999" 
            />
            <Text style={styles.weekDayText}>Sunday</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.flexibleOption}
        onPress={() => setIsFlexible(!isFlexible)}
      >
        <View style={styles.flexibleContent}>
          <View>
            <Text style={styles.flexibleText}>Flexible</Text>
            <Text style={styles.flexibleSubtext}>It will be shown each day until completed</Text>
          </View>
          <Icon 
            name={isFlexible ? 'check-box' : 'check-box-outline-blank'} 
            size={24} 
            color={isFlexible ? '#007AFF' : '#999'} 
          />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderMonthDayOptions = () => (
    <View style={styles.monthDaysContainer}>
      <View style={styles.monthGrid}>
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dateButton,
              selectedDates.includes(day) && styles.selectedDateButton
            ]}
            onPress={() => toggleDate(day)}
          >
            <Text style={[
              styles.dateButtonText,
              selectedDates.includes(day) && styles.selectedDateButtonText
            ]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.dateButton, { width: 48 }]}
          onPress={() => toggleDate(32)} // Special case for "Last"
        >
          <Text style={styles.dateButtonText}>Last</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.selectHintText}>Select at least one day</Text>
      <TouchableOpacity 
        style={styles.flexibleOption}
        onPress={() => setIsFlexible(!isFlexible)}
      >
        <View style={styles.flexibleContent}>
          <View>
            <Text style={styles.flexibleText}>Flexible</Text>
            <Text style={styles.flexibleSubtext}>It will be shown each day until completed</Text>
          </View>
          <Icon 
            name={isFlexible ? 'check-box' : 'check-box-outline-blank'} 
            size={24} 
            color={isFlexible ? '#007AFF' : '#999'} 
          />
        </View>
      </TouchableOpacity>
      <View style={styles.dayOfWeekOption}>
        <Text style={styles.dayOfWeekText}>Use day of the week</Text>
        <Switch
          value={useDayOfWeek}
          onValueChange={setUseDayOfWeek}
          trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
          thumbColor="#fff"
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
      </View>
    </View>
  );

  const renderYearlyDatePicker = () => (
    <Modal
      visible={showDatePicker}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select a date</Text>
          <View style={styles.datePickerContainer}>
            <View style={styles.pickerColumn}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {months.map((month) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.pickerItem,
                      selectedMonth === month && styles.selectedPickerItem
                    ]}
                    onPress={() => setSelectedMonth(month)}
                  >
                    <Text style={[
                      styles.pickerText,
                      selectedMonth === month && styles.selectedPickerText
                    ]}>
                      {month}
                    </Text>
                    <Text style={styles.pickerValue}>{selectedDay}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.pickerDivider} />
            <View style={styles.pickerColumn}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.pickerItem,
                      selectedDay === day && styles.selectedPickerItem
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={[
                      styles.pickerText,
                      selectedDay === day && styles.selectedPickerText
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setSelectedYearlyDates([...selectedYearlyDates, { 
                  month: selectedMonth, 
                  day: parseInt(selectedDay) 
                }]);
                setShowDatePicker(false);
              }}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderYearlyOptions = () => (
    <View style={styles.yearlyContainer}>
      {selectedYearlyDates.map((date, index) => (
        <View key={index} style={styles.selectedDateRow}>
          <Text style={styles.selectedDateText}>{`${date.month} ${date.day}`}</Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedYearlyDates(selectedYearlyDates.filter((_, i) => i !== index));
            }}
          >
            <Icon name="delete-outline" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      ))}
      {selectedYearlyDates.length === 0 && (
        <Text style={styles.selectHintText}>Select at least one day</Text>
      )}
      <TouchableOpacity
        style={styles.addDateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Icon name="add" size={24} color="#007AFF" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.flexibleOption}
        onPress={() => setIsFlexible(!isFlexible)}
      >
        <View style={styles.flexibleContent}>
          <View>
            <Text style={styles.flexibleText}>Flexible</Text>
            <Text style={styles.flexibleSubtext}>It will be shown each day until completed</Text>
          </View>
          <Icon 
            name={isFlexible ? 'check-box' : 'check-box-outline-blank'} 
            size={24} 
            color={isFlexible ? '#007AFF' : '#999'} 
          />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderPeriodPicker = () => (
    <Modal
      visible={showPeriodPicker}
      transparent={true}
      animationType="fade"
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1}
        onPress={() => setShowPeriodPicker(false)}
      >
        <View style={[
          styles.periodPickerContent,
          {
            position: 'absolute',
            top: 220, // Position below the select button
            right: 16,
            left: undefined,
            width: 120,
          }
        ]}>
          {periodOptions.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodOption,
                selectedPeriod === period && styles.selectedPeriodOption
              ]}
              onPress={() => {
                setSelectedPeriod(period);
                setShowPeriodPicker(false);
              }}
            >
              <Text style={[
                styles.periodOptionText,
                selectedPeriod === period && styles.selectedPeriodText
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderSomeDaysPerPeriod = () => (
    <View style={styles.periodContainer}>
      <View style={styles.periodInputRow}>
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
          style={styles.periodSelectorButton}
          onPress={() => setShowPeriodPicker(true)}
        >
          <Text style={styles.periodSelectorText}>{selectedPeriod}</Text>
          <Icon name="keyboard-arrow-down" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRepeatOption = () => (
    <View style={styles.repeatContainer}>
      <View style={styles.repeatInputRow}>
        <Text style={styles.everyText}>Every</Text>
        <View style={styles.numberInputContainer}>
          <TextInput
            style={styles.numberInput}
            value={repeatDays}
            onChangeText={setRepeatDays}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
        <Text style={styles.daysText}>Days</Text>
      </View>

      <TouchableOpacity 
        style={styles.flexibleOption}
        onPress={() => setIsFlexible(!isFlexible)}
      >
        <View style={styles.flexibleContent}>
          <View>
            <Text style={styles.flexibleText}>Flexible</Text>
            <Text style={styles.flexibleSubtext}>It will be shown each day until completed</Text>
          </View>
          <Icon 
            name={isFlexible ? 'check-box' : 'check-box-outline-blank'} 
            size={24} 
            color={isFlexible ? '#007AFF' : '#999'} 
          />
        </View>
      </TouchableOpacity>

      <View style={styles.dayOfWeekOption}>
        <Text style={styles.dayOfWeekText}>Alternate Days</Text>
        <Switch
          value={useDayOfWeek}
          onValueChange={setUseDayOfWeek}
          trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
          thumbColor="#fff"
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How Often Do You Want To{'\n'}Do It?</Text>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={() => {
            // Navigate to next screen with all parameters
            console.log('Selected frequency:', selectedOption);
          }}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {frequencyOptions.map((option) => (
          <React.Fragment key={option.id}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedOption === option.id && styles.selectedCard
              ]}
              onPress={() => setSelectedOption(option.id)}
            >
              <View style={styles.optionRow}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Icon 
                  name={selectedOption === option.id ? 'radio-button-checked' : 'radio-button-unchecked'} 
                  size={20} 
                  color={selectedOption === option.id ? '#007AFF' : '#999'} 
                  style={styles.radioIcon}
                />
              </View>
            </TouchableOpacity>
            {selectedOption === option.id && option.id === 'specific_days_week' && renderWeekDayOptions()}
            {selectedOption === option.id && option.id === 'specific_days_month' && renderMonthDayOptions()}
            {selectedOption === option.id && option.id === 'specific_days_year' && renderYearlyOptions()}
            {selectedOption === option.id && option.id === 'some_days_period' && renderSomeDaysPerPeriod()}
            {selectedOption === option.id && option.id === 'repeat' && renderRepeatOption()}
          </React.Fragment>
        ))}
      </ScrollView>

      {renderYearlyDatePicker()}
      {renderPeriodPicker()}

      <View style={styles.progressIndicator}>
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressDotInactive]} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  nextButton: {
    padding: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#F8F9FF',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTitle: {
    fontSize: 17,
    color: '#000',
    flex: 1,
  },
  radioIcon: {
    marginLeft: 8,
  },
  weekDaysContainer: {
    marginTop: 8,
    gap: 16,
  },
  weekDaysGrid: {
    gap: 16,
  },
  weekDayRow: {
    flexDirection: 'row',
    gap: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  weekDayText: {
    fontSize: 17,
    color: '#000',
  },
  monthDaysContainer: {
    marginTop: 16,
    gap: 16,
    paddingHorizontal: 16,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  dateButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(241, 241, 241, 1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    // elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedDateButton: {
    backgroundColor: '#007AFF',
  },
  dateButtonText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  selectedDateButtonText: {
    color: '#fff',
  },
  selectHintText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  flexibleOption: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
  },
  flexibleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexibleText: {
    fontSize: 17,
    color: '#000',
    marginBottom: 4,
  },
  flexibleSubtext: {
    fontSize: 13,
    color: '#999',
  },
  dayOfWeekOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
  },
  dayOfWeekText: {
    fontSize: 17,
    color: '#000',
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
    gap: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  progressDotInactive: {
    backgroundColor: '#E5E5E5',
  },
  yearlyContainer: {
    marginTop: 16,
    gap: 16,
    paddingHorizontal: 16,
  },
  selectedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
  },
  selectedDateText: {
    fontSize: 17,
    color: '#000',
  },
  addDateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePickerContainer: {
    flexDirection: 'row',
    height: 200,
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 10,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedPickerItem: {
    backgroundColor: '#F8F8F8',
  },
  pickerText: {
    fontSize: 17,
    color: '#000',
  },
  pickerValue: {
    fontSize: 17,
    color: '#999',
  },
  selectedPickerText: {
    color: '#007AFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  modalButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  okButtonText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  periodContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  periodInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numberInputContainer: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  numberInput: {
    fontSize: 17,
    color: '#000',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
  },
  daysPerText: {
    fontSize: 17,
    color: '#000',
  },
  periodSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  periodSelectorText: {
    fontSize: 17,
    color: '#000',
    marginRight: 4,
  },
  periodPickerContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  periodOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedPeriodOption: {
    backgroundColor: '#F8F8F8',
  },
  periodOptionText: {
    fontSize: 17,
    color: '#000',
  },
  selectedPeriodText: {
    color: '#007AFF',
  },
  repeatContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  repeatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
  },
  everyText: {
    fontSize: 17,
    color: '#000',
  },
  daysText: {
    fontSize: 17,
    color: '#000',
  },
});

export default HabitFrequency; 