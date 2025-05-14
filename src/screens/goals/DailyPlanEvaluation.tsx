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
import { Shadow } from 'react-native-shadow-2';
import YesNoIcon from '../../components/goals/YesNoIcon';
import TimerIcon from '../../components/goals/TimerIcon';
import ChecklistIcon from '../../components/goals/ChecklistIcon';
import NumericIcon from '../../components/goals/NumericIcon';
import Svg, { Path } from 'react-native-svg';
import Layout from '../../components/Layout';
import ProgressIndicator from '../../components/ProgressIndicator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList , 'DailyPlanEvaluation'>;
type RouteType = RouteProp<RootStackParamList, 'DailyPlanEvaluation'>;

type EvaluationOption = {
  id: string;
  title: string;
  description: string;
  icon: React.FC<{ size?: number; style?: any }>;
};

interface DailyPlanSchedule {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  block_time: {
    start_time: string;
    end_time: string;
  };
}

const evaluationOptions: EvaluationOption[] = [
  {
    id: 'yesno',
    title: 'Yes or No',
    description: 'Record whether you succeed with the activity or not',
    icon: YesNoIcon,
  },
  {
    id: 'timer',
    title: 'Timer',
    description: 'Establish a time value as a daily goal or limit for the habit',
    icon: TimerIcon,
  },
  {
    id: 'checklist',
    title: 'Checklist',
    description: 'Evaluate your activity based on a set of sub-items',
    icon: ChecklistIcon,
  },
  {
    id: 'numeric',
    title: 'a Numeric Value',
    description: 'Establish a time value as a daily goal or limit for the habit',
    icon: NumericIcon,
  },
];

const DailyPlanEvaluation = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { category, taskType, gender, selectedOption } = route.params;
  const [selected, setSelected] = useState<string | null>(null);

  const handleOptionSelect = (option: EvaluationOption) => {
    setSelected(option.id);
  };

  const handleNext = () => {
    const option = evaluationOptions.find((o) => o.id === selected);
    if (!option) return;
    if (taskType === 'recurring' || taskType === 'recurringTask') {
      if(option.id === 'numeric'){
        navigation.navigate('DailyPlanNumericValue', {
          category,
          taskType,
          gender,
          selectedOption,
          evaluationType: option.id
        });
      }else{
        navigation.navigate('AddRecurringGoal', {
          category,
          taskType: 'recurring',
          gender,
          goalTitle: selectedOption,
          evaluationType: option.id
        });
      }
    } else if (option.id === 'checklist') {
      navigation.navigate('Checklist', {
        items: [],
        successCondition: 'all',
        customCount: 0,
        note: '',
        selectedOption: selectedOption,
        category: category,
        taskType: taskType,
        gender: gender,
        evaluationType: option.id
      });
    } else if (option.id === 'numeric') {
      navigation.navigate('DailyPlanNumericValue', {
        category,
        taskType,
        gender,
        selectedOption,
        evaluationType: option.id
      });
    } else if (option.id === 'timer') {
      navigation.navigate('DailyPlanTimer', {
        category,
        taskType,
        gender,
        selectedOption,
        evaluationType: option.id,
      });
    } else if (taskType === 'habit') {
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
    <Layout
      title={`How do you want to evaluate your progress ${selectedOption.toLowerCase()}?`}
      onBackPress={() => navigation.goBack()}
      rightButtonText="Next"
      rightButtonDisabled={!selected}
      onRightButtonPress={handleNext}
    >
      <View style={styles.content}>
        <View style={styles.optionsContainer}>
          {evaluationOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <React.Fragment key={option.id}>
                <Shadow
                  distance={2}
                  startColor="rgba(0,0,0,0.1)"
                  endColor="rgba(0,0,0,0)"
                  offset={[0, .5]}
                  style={{ width: '100%' }}
                >
                  <TouchableOpacity
                    style={[
                      styles.optionCard,
                      selected === option.id && styles.selectedCard,
                    ]}
                    onPress={() => handleOptionSelect(option)}
                  >
                    <View style={[styles.optionHeader, { width: '100%' }]}> 
                      <Text style={styles.withText}>With</Text>
                      <Svg width="22" height="10" viewBox="0 0 22 10" fill="none">
                        <Path d="M1 9L5 5L1 1" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <Path d="M9 9L13 5L9 1" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <Path d="M17 9L21 5L17 1" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </Svg>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <IconComponent size={22} style={styles.optionIcon} />
                    </View>
                  </TouchableOpacity>
                </Shadow>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </React.Fragment>
            );
          })}
        </View>
        <ProgressIndicator currentStep={1} totalSteps={(taskType === 'task') ? 2 : 4} />
      </View>
    </Layout>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  optionsContainer: {
    flex: 1,
    gap: 16,
    width: '100%',
  },
  optionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    width: '100%'
  },
  withText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    marginRight: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginLeft: 8,
    marginRight: 8,
  },
  optionIcon: {
    marginLeft: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#000000',
    marginTop: 0,
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
  selectedCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
});

export default DailyPlanEvaluation; 