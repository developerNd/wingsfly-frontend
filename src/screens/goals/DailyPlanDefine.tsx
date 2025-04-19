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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DailyPlanDefine'>;
type RouteType = RouteProp<RootStackParamList, 'DailyPlanDefine'>;

const DailyPlanDefine = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { category, taskType, gender, evaluationType, selectedOption } = route.params;

  const [habit, setHabit] = useState(selectedOption || '');
  const [description, setDescription] = useState('');

  const handleNext = () => {
    if (!habit.trim()) {
      // Show error or alert that habit is required
      return;
    }

    // Navigate to the frequency selection screen
    navigation.navigate('DailyPlanFrequency', {
      category,
      taskType,
      gender,
      evaluationType,
      habit,
      description: description.trim(),
      selectedOption
    });
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
            <Text style={styles.headerTitle}>Define Your Habit</Text>
            <TouchableOpacity 
              style={[styles.nextButton, !habit.trim() && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!habit.trim()}
            >
              <Text style={[styles.nextButtonText, !habit.trim() && styles.nextButtonTextDisabled]}>
                Next
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Habit</Text>
              <TextInput
                style={styles.input}
                value={habit}
                onChangeText={setHabit}
                placeholder="e.g. Go to sleep early"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add notes about your habit"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.progressIndicator}>
            <View style={styles.progressStep}>
              <View style={[styles.stepCircle, styles.completedStep]}>
                <Icon name="check" size={16} color="#fff" />
              </View>
              <View style={[styles.stepLine, styles.completedLine]} />
            </View>
            <View style={styles.progressStep}>
              <View style={[styles.stepCircle, styles.currentStep]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepLine} />
            </View>
            <View style={styles.progressStep}>
              <View style={styles.stepCircle}>
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
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#999',
  },
  form: {
    flex: 1,
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
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
});

export default DailyPlanDefine; 