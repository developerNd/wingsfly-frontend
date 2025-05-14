import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  Modal,
  Animated,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Layout from '../../components/Layout';
import ProgressIndicator from '../../components/ProgressIndicator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Gender = 'male' | 'female';

interface SelectedOption {
  id: string;
  title: string;
  description: string;
}

interface RouteParams {
  category: string;
  taskType: string;
  gender: Gender;
  selectedOption: SelectedOption;
}

type RouteType = RouteProp<{ DailyPlanTimer: RouteParams }, 'DailyPlanTimer'>;

type ComparisonType = 'At Least' | 'Less than' | 'Exactly' | 'Any Value';

const FloatingLabelInput = ({ 
  label, 
  value, 
  onChangeText, 
  editable = true,
  style = {},
  placeholder = "",
  onPress,
}: { 
  label: string; 
  value: string; 
  onChangeText?: (text: string) => void;
  editable?: boolean;
  style?: any;
  placeholder?: string;
  onPress?: () => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = new Animated.Value(value ? 1 : 0);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    position: 'absolute' as const,
    left: 16,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -8],
    }),
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    zIndex: 1,
  };

  const labelTextStyle = {
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#999', '#666'],
    }),
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <View style={[styles.floatingInputContainer, style]}>
      <Animated.View style={labelStyle}>
        <Animated.Text style={labelTextStyle}>{label}</Animated.Text>
      </Animated.View>
      <Container 
        style={[
          styles.floatingInput,
          isFocused && styles.inputFocused,
          !editable && styles.inputDisabled
        ]}
        onPress={onPress}
      >
        {onPress ? (
          <Text style={[styles.timeText, !value && styles.placeholderText]}>
            {value || placeholder}
          </Text>
        ) : (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={editable}
            placeholder={isFocused ? placeholder : ""}
          />
        )}
      </Container>
    </View>
  );
};

const TimePicker = ({
  visible,
  onClose,
  onSave,
  initialTime = { hours: '00', minutes: '00', seconds: '00' }
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (time: { hours: string; minutes: string; seconds: string }) => void;
  initialTime?: { hours: string; minutes: string; seconds: string };
}) => {
  const [hours, setHours] = useState(initialTime.hours);
  const [minutes, setMinutes] = useState(initialTime.minutes);
  const [seconds, setSeconds] = useState(initialTime.seconds);

  const generateTimeValues = (max: number) => {
    return Array.from({ length: max }, (_, i) => i.toString().padStart(2, '0'));
  };

  const handleSave = () => {
    onSave({ hours, minutes, seconds });
    onClose();
  };

  const TimeScrollPicker = ({ value, onChange, label, maxValue }: { 
    value: string; 
    onChange: (value: string) => void; 
    label: string;
    maxValue: number;
  }) => {
    const scrollViewRef = React.useRef<ScrollView>(null);
    const timeValues = generateTimeValues(maxValue);
    
    React.useEffect(() => {
      // Scroll to initial value
      const index = timeValues.indexOf(value);
      if (index !== -1 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: index * 40, animated: false });
      }
    }, []);

    return (
      <View style={styles.timeInputContainer}>
        <View style={styles.selectionOverlay}>
          <View style={styles.selectionLine} />
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={styles.timePickerScroll}
          showsVerticalScrollIndicator={false}
          snapToInterval={40}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => {
            const selectedIndex = Math.round(e.nativeEvent.contentOffset.y / 40);
            const selectedValue = timeValues[selectedIndex];
            onChange(selectedValue);
          }}
        >
          <View style={styles.paddingView} />
          {timeValues.map((timeValue) => (
            <View
              key={timeValue}
              style={[
                styles.timePickerItem,
                timeValue === value && styles.selectedTimePickerItem
              ]}
            >
              <Text style={[
                styles.timePickerItemText,
                timeValue === value && styles.selectedTimePickerItemText
              ]}>
                {timeValue}
              </Text>
            </View>
          ))}
          <View style={styles.paddingView} />
        </ScrollView>
        <Text style={styles.timeLabel}>{label}</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Goal</Text>
          <View style={styles.timePickerContainer}>
            <TimeScrollPicker value={hours} onChange={setHours} label="Hours" maxValue={13} />
            <Text style={styles.timeSeparator}>:</Text>
            <TimeScrollPicker value={minutes} onChange={setMinutes} label="Minutes" maxValue={60} />
            <Text style={styles.timeSeparator}>:</Text>
            <TimeScrollPicker value={seconds} onChange={setSeconds} label="Seconds" maxValue={60} />
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>CLOSE</Text>
            </TouchableOpacity>
            <View style={styles.modalButtonSpacer} />
            <TouchableOpacity style={styles.modalButton}>
              <Icon name="refresh" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DailyPlanTimer: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { category, taskType, gender, selectedOption } = route.params;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState<ComparisonType>('At Least');
  const [timeValue, setTimeValue] = useState('');
  const [description, setDescription] = useState('');
  const [habit, setHabit] = useState<string>(selectedOption?.title || '');
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>(selectedOption?.title || '');

  const comparisonOptions: ComparisonType[] = ['At Least', 'Less than', 'Exactly', 'Any Value'];

  const handleNext = () => {
    // Convert time value (HH:MM:SS) to minutes
    const [hours, minutes, seconds] = timeValue.split(':').map(Number);
    const totalMinutes = (hours * 60) + minutes + Math.round(seconds / 60);
    
    console.log('🕒 Time conversion:', {
      originalTime: timeValue,
      hours,
      minutes,
      seconds,
      totalMinutes
    });

    const navigationParams = {
      category,
      taskType,
      gender,
      evaluationType: 'timer',
      habit: habit,
      description,
      selectedOption: selectedOption.title,
      numeric_condition: selectedComparison,
      numeric_value: totalMinutes,
      numeric_unit: 'minutes'
    };

    console.log('🚀 Navigation params:', navigationParams);

    navigation.navigate('DailyPlanFrequency', navigationParams);
  };

  const formatTime = (time: { hours: string; minutes: string; seconds: string }) => {
    return `${time.hours}:${time.minutes}:${time.seconds}`;
  };

  const handleTimeSelect = (time: { hours: string; minutes: string; seconds: string }) => {
    setTimeValue(formatTime(time));
  };

  const handleHabitChange = (text: string) => {
    setHabit(text);
  };

  const handleTimeChange = (text: string) => {
    setSelectedTime(text);
  };

  return (
    <Layout
      title={`Define Your ${taskType === 'habit' ? 'Habit' : 'Task'}`}
      rightButtonText="Next"
      onRightButtonPress={handleNext}
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.content}>
        <FloatingLabelInput
          label={taskType === 'habit' ? 'Habit' : 'Task'}
          value={habit}
          onChangeText={setHabit}
          placeholder={`Enter your ${taskType === 'habit' ? 'habit' : 'task'}`}
        />

        <View style={styles.row}>
          <View style={{ width: '100%' }}>
            <TouchableOpacity
              style={[styles.comparisonButton, isDropdownOpen && styles.comparisonButtonActive]}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Text style={styles.comparisonButtonText}>{selectedComparison}</Text>
              <Icon
                name={isDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={24}
                color="#000"
              />
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownContainer}>
                {comparisonOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownOption,
                      selectedComparison === option && styles.selectedDropdownOption,
                    ]}
                    onPress={() => {
                      setSelectedComparison(option);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* {selectedComparison !== 'Any Value' && ( */}
          <View style={[styles.unitContainer, { display: 'flex', alignItems: 'center', gap: 12 }]}>
            <View style={styles.halfWidth}>
              <FloatingLabelInput
                label="Time"
                value={timeValue}
                placeholder="00:00:00"
                onPress={() => setIsTimePickerVisible(true)}
              />
            </View>
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <Text style={styles.unitText}>a day.</Text>
            </View>
          </View>
          {/* )} */}
        </View>

        

        <Text style={styles.exampleText}>
          e.g. study for the exam, At least 2 chapters a day.
        </Text>

        <FloatingLabelInput
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          style={styles.descriptionInput}
        />

        <TouchableOpacity style={styles.linkToGoalButton}>
          <Text style={styles.linkToGoalText}>Link To Goal</Text>
          <Icon name="add" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.dateTimeContainer}>
          <View style={styles.dateContainer}>
            <Icon name="calendar-today" size={20} color="#666" />
            <Text style={styles.dateText}>Date</Text>
            <TouchableOpacity style={styles.todayButton}>
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeContainer}>
            <Icon name="access-time" size={20} color="#666" />
            <Text style={styles.timeInputText}>block time</Text>
            <Text style={styles.timeValue}>0</Text>
          </View>
        </View>
      </View>

      <TimePicker
        visible={isTimePickerVisible}
        onClose={() => setIsTimePickerVisible(false)}
        onSave={handleTimeSelect}
        initialTime={
          timeValue
            ? {
                hours: timeValue.split(':')[0],
                minutes: timeValue.split(':')[1],
                seconds: timeValue.split(':')[2],
              }
            : { hours: '00', minutes: '00', seconds: '00' }
        }
      />
      
      <ProgressIndicator currentStep={2} totalSteps={4} />
    </Layout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  floatingInputContainer: {
    height: 56,
    position: 'relative',
    marginBottom: 8,
  },
  floatingInput: {
    height: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#000',
    padding: 0,
  },
  timeText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  inputFocused: {
    borderColor: '#007AFF',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
  },
  row: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 8,
    position: 'relative',
  },
  halfWidth: {
    width: '50%',
    alignSelf: 'flex-start',
  },
  comparisonButton: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    width: '100%',
  },
  comparisonButtonActive: {
    borderColor: '#007AFF',
  },
  comparisonButtonText: {
    fontSize: 16,
    color: '#000',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    zIndex: 1000,
    elevation: 3,
    width: '100%',
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedDropdownOption: {
    backgroundColor: '#F5F5F5',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#000',
  },
  unitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  unitText: {
    fontSize: 16,
    color: '#666',
  },
  inputTime: {
    fontSize: 16,
    color: '#000',
  },
  timeInputText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  descriptionInput: {
    height: 80,
  },
  linkToGoalButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  linkToGoalText: {
    fontSize: 16,
    color: '#000',
  },
  dateTimeContainer: {
    gap: 16,
    marginTop: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  todayButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  todayButtonText: {
    fontSize: 14,
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeValue: {
    fontSize: 16,
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    height: 200,
  },
  timeInputContainer: {
    alignItems: 'center',
    height: 200,
    position: 'relative',
  },
  timePickerScroll: {
    height: 200,
    width: 60,
  },
  paddingView: {
    height: 80, // This creates space for 2 items above and below the selected item
  },
  timePickerItem: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTimePickerItem: {
    backgroundColor: 'transparent',
  },
  timePickerItemText: {
    fontSize: 20,
    color: '#666',
  },
  selectedTimePickerItemText: {
    color: '#000',
    fontSize: 24,
    fontWeight: '600',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  selectionLine: {
    width: '100%',
    height: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
  },
  modalButton: {
    padding: 8,
  },
  modalButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalButtonSpacer: {
    flex: 1,
  },
  timeSeparator: {
    fontSize: 24,
    color: '#000',
    marginTop: 8,
  },
});

export default DailyPlanTimer; 