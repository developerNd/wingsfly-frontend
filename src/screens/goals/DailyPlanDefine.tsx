import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import FloatingLabelInput from '../../components/FloatingLabelInput';
import ProgressIndicator from '../../components/ProgressIndicator';
import Layout from '../../components/Layout';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DailyPlanDefine'>;
type RouteType = RouteProp<RootStackParamList, 'DailyPlanDefine'>;

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// Update navigation types to include checklist_items
declare global {
  namespace ReactNavigation {
    interface RootStackParamList {
      DailyPlanFrequency: {
        category: string;
        taskType: string;
        gender: 'male' | 'female';
        evaluationType: string;
        habit: string;
        description: string;
        selectedOption: string;
        checklist_items?: ChecklistItem[];
      };
      DailyPlanDefine: {
        category: string;
        taskType: string;
        gender: 'male' | 'female';
        evaluationType: string;
        selectedOption: string;
        checklist_items?: ChecklistItem[];
      };
    }
  }
}

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
      selectedOption,
      checklist_items: route.params.checklist_items || [],
      numeric_value: 0,
      numeric_condition: '',
      numeric_unit: ''
    });
  };

  return (
    <Layout
      title="Define Your Habit"
      onBackPress={() => navigation.goBack()}
      rightButtonText="Next"
      rightButtonDisabled={!habit.trim()}
      onRightButtonPress={handleNext}
    >
      <View style={styles.form}>
        <FloatingLabelInput
          label="Habit"
          value={habit}
          onChangeText={setHabit}
          placeholder="Enter your habit"
        />

        <FloatingLabelInput
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Add a description (optional)"
          multiline
        />
      </View>

      <ProgressIndicator currentStep={2} totalSteps={4} />
    </Layout>
  );
};

const styles = StyleSheet.create({
  form: {
    flex: 1,
    gap: 24,
  },
});

export default DailyPlanDefine; 