import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DailyPlanEvaluation'>;
type RouteType = RouteProp<RootStackParamList, 'DailyPlanEvaluation'>;

interface EvaluationOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const evaluationOptions: EvaluationOption[] = [
  {
    id: 'yesno',
    title: 'Yes or No',
    description: 'Record whether you succeed with the activity or not',
    icon: 'check-circle',
  },
  {
    id: 'timer',
    title: 'Timer',
    description: 'Establish a time value as a daily goal or limit for the habit',
    icon: 'timer',
  },
  {
    id: 'checklist',
    title: 'Checklist',
    description: 'Evaluate your activity based on a set of sub-items',
    icon: 'checklist',
  },
  {
    id: 'numeric',
    title: 'a Numeric Value',
    description: 'Establish a time value as a daily goal or limit for the habit',
    icon: 'numbers',
  },
];

const DailyPlanEvaluation = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { category, taskType, gender, selectedOption } = route.params;

  const handleOptionSelect = (option: EvaluationOption) => {
    console.log(taskType);

    if (taskType === 'habit') {
      navigation.navigate('DailyPlanDefine', {
        category,
        taskType,
        gender,
        evaluationType: option.id,
        selectedOption
      });
    } else if (taskType === 'task') {
      navigation.navigate('DailyPlanDefineTask', {
        category,
        taskType,
        gender,
        evaluationType: option.id,
        selectedOption
      });
    }
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
            <Text style={styles.headerTitle}>How do you want to evaluate {selectedOption.toLowerCase()}?</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.optionsContainer}>
            {evaluationOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={() => handleOptionSelect(option)}
              >
                <View style={styles.optionHeader}>
                  <Text style={styles.withText}>With</Text>
                  <Icon name="chevron-right" size={20} color="#666" />
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Icon name={option.icon} size={20} color="#666" style={styles.optionIcon} />
                </View>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.progressIndicator}>
            <View style={styles.progressStep}>
              <View style={[styles.stepCircle, styles.currentStep]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepLine} />
            </View>
            <View style={styles.progressStep}>
              <View style={styles.stepCircle}>
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
    marginTop: 56,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  optionsContainer: {
    flex: 1,
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  withText: {
    fontSize: 16,
    color: '#666',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginLeft: 8,
  },
  optionIcon: {
    marginLeft: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  stepNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DailyPlanEvaluation; 