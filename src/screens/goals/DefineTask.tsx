import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type DefineTaskScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'DefineTask'>;
  route: RouteProp<{
    DefineTask: {
      taskType: 'recurring' | 'daily' | 'long-term' | 'custom';
      gender: 'male' | 'female';
      goalTitle: string;
      category?: string;
      existingChecklist?: {
        items: { id: string; text: string; completed: boolean; }[];
        successCondition: 'all' | 'custom';
        customCount?: number;
        note: string;
      };
    };
  }, 'DefineTask'>;
};

type TaskType = 'recurring' | 'daily' | 'long-term' | 'custom';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistData {
  items: ChecklistItem[];
  successCondition: 'all' | 'custom';
  customCount?: number;
  note: string;
}

const DefineTask: React.FC<DefineTaskScreenProps> = ({ route, navigation }) => {
  const { taskType, gender, existingChecklist } = route.params;
  console.log('DefineTask component mounted with params:', JSON.stringify(route.params, null, 2));
  
  const [taskInput, setTaskInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [successCondition, setSuccessCondition] = useState<'all' | 'custom'>('all');
  const [customCount, setCustomCount] = useState(1);
  const [note, setNote] = useState('');

  // Load existing checklist data if available
  useEffect(() => {
    console.log('DefineTask useEffect - existingChecklist:', JSON.stringify(existingChecklist, null, 2));
    if (existingChecklist) {
      console.log('Loading existing checklist data');
      setChecklist(existingChecklist.items || []);
      setSuccessCondition(existingChecklist.successCondition || 'all');
      setCustomCount(existingChecklist.customCount || 1);
      setNote(existingChecklist.note || '');
      console.log('Existing checklist data loaded:', JSON.stringify({
        items: existingChecklist.items || [],
        successCondition: existingChecklist.successCondition || 'all',
        customCount: existingChecklist.customCount || 1,
        note: existingChecklist.note || ''
      }, null, 2));
    } else {
      console.log('No existing checklist data provided');
    }
  }, [existingChecklist]);

  const handleAddItem = () => {
    if (taskInput.trim()) {
      console.log('Adding new checklist item:', taskInput.trim());
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: taskInput.trim(),
        completed: false
      };
      setChecklist(prev => {
        const newChecklist = [...prev, newItem];
        console.log('Updated checklist after adding item:', JSON.stringify(newChecklist, null, 2));
        return newChecklist;
      });
      setTaskInput('');
    }
  };

  const handleDeleteItem = (id: string) => {
    console.log('Deleting checklist item with id:', id);
    setChecklist(prev => {
      const newChecklist = prev.filter(item => item.id !== id);
      console.log('Updated checklist after deleting item:', JSON.stringify(newChecklist, null, 2));
      return newChecklist;
    });
  };

  const handleNext = () => {
    console.log('handleNext called with current checklist:', JSON.stringify(checklist, null, 2));
    
    if (checklist.length === 0) {
      console.log('Error: No checklist items added');
      Alert.alert('Error', 'Please add at least one checklist item');
      return;
    }

    const checklistData: ChecklistData = {
      items: checklist,
      successCondition,
      customCount: successCondition === 'custom' ? customCount : undefined,
      note
    };
    
    console.log('Prepared checklist data for navigation:', JSON.stringify(checklistData, null, 2));

    switch (taskType) {
      case 'recurring':
        console.log('Navigating to RecurringGoal with checklist data');
        navigation.navigate('RecurringGoal', {
          taskType: 'recurring',
          gender: route.params.gender,
          goalTitle: route.params.goalTitle,
          category: route.params.category,
          checklist: checklistData
        });
        break;
      case 'daily':
        console.log('Navigating to DailyPlan');
        navigation.navigate('DailyPlan', {
          taskType: 'daily',
          gender: route.params.gender,
          // category: ''  // Required by type definition
        });
        break;
      case 'long-term':
        console.log('Navigating to LongTermGoal');
        navigation.navigate('LongTermGoal', {
          taskType: 'long-term',
          gender: route.params.gender,
          category: ''  // Required by type definition
        });
        break;
      case 'custom':
        console.log('Navigating to CustomGoal');
        navigation.navigate('CustomGoal', {
          taskType: 'custom',
          gender: route.params.gender,
          category: ''  // Required by type definition
        });
        break;
      default:
        console.error('Invalid task type:', taskType);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Define Your Task</Text>
          <TouchableOpacity onPress={handleNext}>
            <Text style={[styles.headerButton, checklist.length === 0 && styles.headerButtonDisabled]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Task</Text>
            <View style={styles.taskInputWrapper}>
              <TextInput
                style={[styles.taskInput, isInputFocused && styles.taskInputFocused]}
                value={taskInput}
                onChangeText={setTaskInput}
                placeholder="Add a task"
                placeholderTextColor="#999"
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onSubmitEditing={handleAddItem}
                returnKeyType="done"
              />
              {(isInputFocused || taskInput.length > 0) && (
                <TouchableOpacity 
                  style={styles.addTaskButton}
                  onPress={handleAddItem}
                  disabled={taskInput.trim().length === 0}
                >
                  <Text style={[
                    styles.addTaskButtonText,
                    taskInput.trim().length === 0 && styles.addTaskButtonDisabled
                  ]}>
                    Add Task
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {checklist.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>Checklist</Text>
              {checklist.map((item, index) => (
                <View key={item.id} style={styles.checklistItem}>
                  <Text style={styles.itemText}>{item.text}</Text>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item.id)}
                  >
                    <Icon name="delete-outline" size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Success Condition</Text>
            <View style={styles.successConditionCard}>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setSuccessCondition('all')}
                >
                  <View style={styles.radio}>
                    {successCondition === 'all' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>All Items</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setSuccessCondition('custom')}
                >
                  <View style={[styles.radio, successCondition === 'custom' && styles.radioSelected]}>
                    {successCondition === 'custom' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Custom</Text>
                </TouchableOpacity>

                {successCondition === 'custom' && (
                  <View style={styles.customCountContainer}>
                    <View style={styles.customCountInputContainer}>
                      <TextInput
                        style={styles.customCountInput}
                        value={String(customCount)}
                        onChangeText={(value) => setCustomCount(Number(value) || 1)}
                        keyboardType="numeric"
                      />
                      <Text style={styles.customCountLabel}>Items (S)</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Note (optional)</Text>
            <View style={styles.noteCard}>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Get the understanding on at least 1"
                placeholderTextColor="#999"
                multiline
              />
            </View>
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerButton: {
    fontSize: 17,
    color: '#007AFF',
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  taskInputWrapper: {
    flexDirection: 'column',
    gap: 8,
  },
  taskInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  taskInputFocused: {
    borderColor: '#007AFF',
  },
  addTaskButton: {
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addTaskButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  addTaskButtonDisabled: {
    opacity: 0.5,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  successConditionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  radioGroup: {
    gap: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#151B73',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#151B73',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  customCountContainer: {
    marginTop: 8,
    paddingLeft: 36,
  },
  customCountInputContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customCountInput: {
    fontSize: 16,
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  customCountLabel: {
    fontSize: 16,
    color: '#666',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
  },
  noteInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 40,
    padding: 0,
  },
});

export default DefineTask; 