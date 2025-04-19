import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface TaskOption {
  id: number;
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
}

interface AddTaskDrawerProps {
  onClose: () => void;
  onSelect: (option: TaskOption) => void;
  isVisible: boolean;
}

const taskOptions: TaskOption[] = [
  {
    id: 1,
    title: 'Habit',
    subtitle: 'Something you want to do regularly',
    icon: 'repeat',
    color: '#9C27B0',
  },
  {
    id: 2,
    title: 'Recurring Task',
    subtitle: 'Activity that repeats over time',
    icon: 'event-repeat',
    color: '#FF4081',
  },
  {
    id: 3,
    title: 'Task',
    subtitle: 'One time activity or todo',
    icon: 'check-circle',
    color: '#4CAF50',
  },
  {
    id: 4,
    title: 'Goal of the Day',
    subtitle: 'Target you want to achieve today',
    icon: 'flag',
    color: '#2196F3',
  },
];

const AddTaskDrawer: React.FC<AddTaskDrawerProps> = ({ onClose, onSelect }) => {
  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <ScrollView style={styles.content}>
        {taskOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionButton}
            onPress={() => onSelect(option)}
          >
            <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
              <Icon name={option.icon} size={24} color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{option.title}</Text>
              {option.subtitle && (
                <Text style={styles.subtitle}>{option.subtitle}</Text>
              )}
            </View>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 24,
    minHeight: 300,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default AddTaskDrawer; 