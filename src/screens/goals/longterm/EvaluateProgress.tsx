import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/AppNavigator';

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
    icon: 'pin',
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EvaluateProgress'>;

const EvaluateProgress = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'EvaluateProgress'>>();
  const { category, taskType } = route.params;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

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
        <Text style={styles.headerTitle}>How do you want to evaluate{'\n'}your progress?</Text>
        <TouchableOpacity 
          style={[
            styles.nextButton,
            !selectedOption && styles.nextButtonDisabled
          ]}
          disabled={!selectedOption}
          onPress={() => {
            if (selectedOption) {
              navigation.navigate('DefineHabit', {
                category,
                taskType,
                evaluationType: selectedOption,
              });
            }
          }}
        >
          <Text style={[
            styles.nextButtonText,
            !selectedOption && styles.nextButtonTextDisabled
          ]}>Next</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {evaluationOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              selectedOption === option.id && styles.selectedCard
            ]}
            onPress={() => setSelectedOption(option.id)}
          >
            <View style={styles.optionRow}>
              <Text style={styles.withText}>With</Text>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Icon 
                name={selectedOption === option.id ? 'radio-button-checked' : 'radio-button-unchecked'} 
                size={20} 
                color={selectedOption === option.id ? '#007AFF' : '#999'} 
                style={styles.radioIcon}
              />
            </View>
            <Text style={styles.optionDescription}>{option.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    marginBottom: 4,
  },
  withText: {
    fontSize: 17,
    color: '#000',
    marginRight: 4,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  radioIcon: {
    marginLeft: 8,
  },
  optionDescription: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
    marginLeft: 36,
  },
});

export default EvaluateProgress; 