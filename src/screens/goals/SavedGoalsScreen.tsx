import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SavedGoals'>;

type Goal = {
  id: string;
  title: string;
  type: 'Long Term Goal' | 'Recurring Goal';
};

const SavedGoalsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [goals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Weight Loss Journey',
      type: 'Long Term Goal'
    },
    {
      id: '2',
      title: 'Crack UPSC Exam',
      type: 'Long Term Goal'
    },
    {
      id: '3',
      title: 'Read 10 Page Daily',
      type: 'Recurring Goal'
    },
    {
      id: '4',
      title: 'Solve Question Paper Daily',
      type: 'Recurring Goal'
    }
  ]);

  const handleGoalSelect = (goal: Goal) => {
    navigation.navigate('RecurringGoal', {
      taskType: 'recurring',
      gender: 'male',
      goalTitle: '',
      linkedGoal: goal
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Link a Goal</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Long Term Goal</Text>
          {goals.filter(goal => goal.type === 'Long Term Goal').map(goal => (
            <TouchableOpacity
              key={goal.id}
              style={styles.goalItem}
              onPress={() => handleGoalSelect(goal)}
            >
              <Text style={styles.goalTitle}>{goal.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recurring Goal</Text>
          {goals.filter(goal => goal.type === 'Recurring Goal').map(goal => (
            <TouchableOpacity
              key={goal.id}
              style={styles.goalItem}
              onPress={() => handleGoalSelect(goal)}
            >
              <Text style={styles.goalTitle}>{goal.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginTop: Platform.OS === 'ios' ? 44 : 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  doneButton: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  goalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  goalTitle: {
    fontSize: 16,
    color: '#000',
  },
});

export default SavedGoalsScreen; 