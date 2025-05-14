import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Layout from '../../components/Layout';
import ProgressIndicator from '../../components/ProgressIndicator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DailyPlanFrequency'>;
type RouteType = RouteProp<RootStackParamList, 'DailyPlanNumericValue'>;

type ComparisonType = 'At Least' | 'Less than' | 'Exactly' | 'Any Value';

const FloatingLabelInput = ({ 
  label, 
  value, 
  onChangeText, 
  editable = true,
  style = {},
  placeholder = ""
}: { 
  label: string; 
  value: string; 
  onChangeText?: (text: string) => void;
  editable?: boolean;
  style?: any;
  placeholder?: string;
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

  return (
    <View style={[styles.floatingInputContainer, style]}>
      <Animated.View style={labelStyle}>
        <Animated.Text style={labelTextStyle}>{label}</Animated.Text>
      </Animated.View>
      <TextInput
        style={[
          styles.floatingInput,
          isFocused && styles.inputFocused,
          !editable && styles.inputDisabled
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={editable}
        placeholder={isFocused ? placeholder : ""}
      />
    </View>
  );
};

const DailyPlanNumericValue = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { category, taskType, gender, selectedOption } = route.params;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState<ComparisonType>('At Least');
  const [numericValue, setNumericValue] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [habit, setHabit] = useState(selectedOption || '');

  const comparisonOptions: ComparisonType[] = ['At Least', 'Less than', 'Exactly', 'Any Value'];

  const handleNext = () => {
    if (!habit.trim()) {
      Alert.alert('Required Field', 'Please enter a habit name.');
      return;
    }

    if (selectedComparison !== 'Any Value' && !numericValue.trim()) {
      Alert.alert('Required Field', 'Please enter a numeric value.');
      return;
    }

    navigation.navigate('DailyPlanFrequency', {
      category,
      taskType,
      gender,
      evaluationType: 'numeric',
      habit: habit.trim(),
      description: description.trim(),
      selectedOption,
      numeric_value: parseFloat(numericValue.trim()),
      numeric_condition: selectedComparison,
      numeric_unit: unit.trim()
    });
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
          <View style={styles.halfWidth}>
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

          {selectedComparison !== 'Any Value' && (
            <View style={styles.halfWidth}>
              <FloatingLabelInput
                label="Goal"
                value={numericValue}
                onChangeText={setNumericValue}
                placeholder="Enter value"
              />
            </View>
          )}
        </View>

        <View style={styles.unitContainer}>
          <FloatingLabelInput
            label="Unit (optional)"
            value={unit}
            onChangeText={setUnit}
            style={styles.unitInput}
          />
          <Text style={styles.unitText}>a day.</Text>
        </View>

        <Text style={styles.exampleText}>
          e.g. go running, At least 3 miles a day.
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
      </View>
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
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputFocused: {
    borderColor: '#007AFF',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  halfWidth: {
    flex: 1,
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
  },
  dropdownOption: {
    padding: 16,
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
    gap: 8,
    marginBottom: 8,
  },
  unitInput: {
    flex: 1,
  },
  unitText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
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
});

export default DailyPlanNumericValue; 