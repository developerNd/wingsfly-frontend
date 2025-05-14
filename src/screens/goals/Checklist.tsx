import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Platform,
  Alert,
  Modal,
  Pressable,
  Animated,
  PanResponder,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from '../../components/Layout';
import { Shadow } from 'react-native-shadow-2';
import Svg, { Path } from 'react-native-svg';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  evaluationType?: 'yesno' | 'timer';
  duration?: {
    hours: number;
    minutes: number;
  };
  usePomodoro?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'Checklist'>;

const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: '1', text: '', completed: false },
  { id: '2', text: '', completed: false }
];

// Update navigation types to include checklist_items
declare global {
  namespace ReactNavigation {
    interface RootStackParamList {
      Checklist: {
        items?: ChecklistItem[];
        successCondition?: 'all' | 'custom';
        customCount?: number;
        note?: string;
        category?: string;
        taskType?: string;
        gender?: 'male' | 'female';
        selectedOption?: string;
      };
      RecurringGoal: {
        taskType: 'recurring';
        gender: 'male' | 'female';
        goalTitle: string;
        category?: string;
        selectedUnit?: string;
        target?: string;
        checklist?: {
          items: { id: string; text: string; completed: boolean; }[];
          successCondition: 'all' | 'custom';
          customCount?: number;
          note: string;
        };
        linkedGoal?: any;
      };
      DailyPlanDefine: {
        category: string;
        taskType: string;
        gender: 'male' | 'female';
        evaluationType: string;
        selectedOption: string;
        checklist_items?: ChecklistItem[];
        checklist?: {
          items: ChecklistItem[];
          successCondition: 'all' | 'custom';
          customCount?: number;
          note: string;
        };
      };
      DailyPlanDefineTask: {
        category: string;
        taskType: string;
        gender: 'male' | 'female';
        evaluationType: string;
        selectedOption: string;
        checklist_items?: ChecklistItem[];
        checklist?: {
          items: ChecklistItem[];
          successCondition: 'all' | 'custom';
          customCount?: number;
          note: string;
        };
      };
    }
  }
}

const Checklist = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { items = DEFAULT_CHECKLIST_ITEMS, successCondition = 'all', customCount = 0, note = '', category = '', taskType = 'task', gender = 'male', selectedOption = '' } = route.params;

  const [taskTitle, setTaskTitle] = useState('');
  const [isTaskInputFocused, setIsTaskInputFocused] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(items);
  const [successConditionState, setSuccessConditionState] = useState<'all' | 'custom'>(successCondition);
  const [customCountState, setCustomCountState] = useState(customCount);
  const [noteState, setNoteState] = useState(note);
  
  // Bottom drawer state
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [drawerHeight] = useState(new Animated.Value(0));
  const [evaluationType, setEvaluationType] = useState<'yesno' | 'timer'>('yesno');
  const [duration, setDuration] = useState({ hours: 0, minutes: 0 });
  const [usePomodoro, setUsePomodoro] = useState(false);

  // Load saved checklist data when component mounts
  useEffect(() => {
    const loadSavedChecklistData = async () => {
      try {
        // Get the list of saved checklists
        const savedChecklists = await AsyncStorage.getItem('@saved_checklists');
        if (savedChecklists) {
          const savedChecklistsArray = JSON.parse(savedChecklists);
          
          // If there are saved checklists, load the most recent one
          if (savedChecklistsArray.length > 0) {
            const mostRecentKey = savedChecklistsArray[savedChecklistsArray.length - 1];
            const savedData = await AsyncStorage.getItem(mostRecentKey);
            
            if (savedData) {
              const parsedData = JSON.parse(savedData);
              
              // Update the checklist items with the saved data
              setChecklistItems(parsedData.items);
              setSuccessConditionState(parsedData.successCondition);
              setCustomCountState(parsedData.customCount || 0);
              setNoteState(parsedData.note || '');
            }
          }
        }
      } catch (error) {
        console.error('Error loading saved checklist data:', error);
      }
    };
    
    // Only load saved data if we're in recurring mode
    if (taskType === 'recurring') {
      loadSavedChecklistData();
    }
  }, [taskType]);

  // Ensure we have at least two blank inputs
  useEffect(() => {
    // Count how many blank inputs we have
    const blankInputs = checklistItems.filter(item => item.text.trim() === '').length;
    
    // If we have fewer than 2 blank inputs, add more
    if (blankInputs < 2) {
      const newItems = [...checklistItems];
      const itemsToAdd = 2 - blankInputs;
      
      for (let i = 0; i < itemsToAdd; i++) {
        newItems.push({
          id: Date.now().toString() + i,
          text: '',
          completed: false,
          evaluationType: 'yesno',
        });
      }
      
      setChecklistItems(newItems);
    }
  }, []);

  // Show drawer when an item is selected
  useEffect(() => {
    if (selectedItem) {
      setIsDrawerVisible(true);
      setEvaluationType(selectedItem.evaluationType || 'yesno');
      setDuration(selectedItem.duration || { hours: 0, minutes: 0 });
      setUsePomodoro(selectedItem.usePomodoro || false);
      Animated.timing(drawerHeight, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(drawerHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsDrawerVisible(false);
      });
    }
  }, [selectedItem]);

  const handleAddItem = () => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: '',
      completed: false,
      evaluationType: 'yesno',
    };
    setChecklistItems([...checklistItems, newItem]);
  };

  const handleUpdateItem = (id: string, text: string) => {
    setChecklistItems(
      checklistItems.map((item) =>
        item.id === id ? { ...item, text } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setChecklistItems(checklistItems.filter((item) => item.id !== id));
  };

  const handleLongPressItem = (item: ChecklistItem) => {
    setSelectedItem(item);
  };

  const handleCloseDrawer = () => {
    setSelectedItem(null);
  };

  const handleSaveItemConfig = () => {
    if (selectedItem) {
      setChecklistItems(
        checklistItems.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                evaluationType,
                duration: evaluationType === 'timer' ? duration : undefined,
                usePomodoro: evaluationType === 'timer' ? usePomodoro : undefined,
              }
            : item
        )
      );
      setSelectedItem(null);
    }
  };

  const handleNext = () => {
    if (taskType !== 'recurring' && !taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const filledItems = checklistItems.filter(item => item.text.trim());
    if (filledItems.length === 0) {
      Alert.alert('Error', 'Please fill at least one checklist item');
      return;
    }

    const checklistData = {
      items: filledItems,
      successCondition: successConditionState,
      customCount: successConditionState === 'custom' ? customCountState : undefined,
      note: noteState
    };

    if (taskType === 'recurring') {
      // Save the checklist data to AsyncStorage
      const saveChecklistData = async () => {
        try {
          // Create a unique key for this checklist
          const checklistKey = `@checklist_data_${Date.now()}`;
          
          // Save the checklist data
          await AsyncStorage.setItem(checklistKey, JSON.stringify(checklistData));
          
          // Save the key to a list of saved checklists
          const savedChecklists = await AsyncStorage.getItem('@saved_checklists');
          const savedChecklistsArray = savedChecklists ? JSON.parse(savedChecklists) : [];
          savedChecklistsArray.push(checklistKey);
          await AsyncStorage.setItem('@saved_checklists', JSON.stringify(savedChecklistsArray));
          
          // Go back to the previous screen with the checklist data
          navigation.navigate('RecurringGoal', {
            taskType: 'recurring',
            gender: gender as 'male' | 'female',
            goalTitle: route.params.goalTitle || '',
            category: category,
            checklist: checklistData,
            evaluationType: 'checklist'
          });
        } catch (error) {
          console.error('Error saving checklist data:', error);
          Alert.alert('Error', 'Failed to save checklist data. Please try again.');
        }
      };
      
      saveChecklistData();
    } else if (taskType === 'habit' || taskType === 'recurringTask') {
      navigation.navigate('DailyPlanDefine', {
        category,
        taskType,
        gender,
        evaluationType: 'checklist',
        selectedOption: taskTitle,
        checklist_items: filledItems
      });
    } else {
      console.log('📋 Passing checklist data to DailyPlanDefineTask:', checklistData);
      navigation.navigate('DailyPlanDefineTask', {
        category,
        taskType,
        gender,
        evaluationType: 'checklist',
        selectedOption: taskTitle,
        checklist: checklistData
      });
    }
  };

  // Bottom drawer component
  const renderBottomDrawer = () => {
    if (!isDrawerVisible) return null;

    return (
      <Modal
        transparent
        visible={isDrawerVisible}
        animationType="none"
        onRequestClose={handleCloseDrawer}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseDrawer}>
          <Animated.View
            style={[
              styles.drawer,
              {
                transform: [
                  {
                    translateY: drawerHeight.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Item Configuration</Text>
              <TouchableOpacity onPress={handleCloseDrawer}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.drawerContent}>
              <Text style={styles.drawerSubtitle}>Evaluation Type</Text>
              <View style={styles.evaluationTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.evaluationTypeButton,
                    evaluationType === 'yesno' && styles.selectedEvaluationType,
                  ]}
                  onPress={() => setEvaluationType('yesno')}
                >
                  <Icon
                    name="check-circle-outline"
                    size={24}
                    color={evaluationType === 'yesno' ? '#fff' : '#666'}
                  />
                  <Text
                    style={[
                      styles.evaluationTypeText,
                      evaluationType === 'yesno' && styles.selectedEvaluationTypeText,
                    ]}
                  >
                    Yes/No
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.evaluationTypeButton,
                    evaluationType === 'timer' && styles.selectedEvaluationType,
                  ]}
                  onPress={() => setEvaluationType('timer')}
                >
                  <Icon
                    name="timer"
                    size={24}
                    color={evaluationType === 'timer' ? '#fff' : '#666'}
                  />
                  <Text
                    style={[
                      styles.evaluationTypeText,
                      evaluationType === 'timer' && styles.selectedEvaluationTypeText,
                    ]}
                  >
                    Timer
                  </Text>
                </TouchableOpacity>
              </View>

              {evaluationType === 'timer' && (
                <View style={styles.durationContainer}>
                  <Text style={styles.drawerSubtitle}>Duration</Text>
                  <View style={styles.durationInputContainer}>
                    <View style={styles.durationInputWrapper}>
                      <TextInput
                        style={styles.durationInput}
                        value={String(duration.hours)}
                        onChangeText={(value) =>
                          setDuration({
                            ...duration,
                            hours: parseInt(value) || 0,
                          })
                        }
                        keyboardType="numeric"
                        maxLength={2}
                      />
                      <Text style={styles.durationLabel}>Hours</Text>
                    </View>
                    <View style={styles.durationInputWrapper}>
                      <TextInput
                        style={styles.durationInput}
                        value={String(duration.minutes)}
                        onChangeText={(value) =>
                          setDuration({
                            ...duration,
                            minutes: parseInt(value) || 0,
                          })
                        }
                        keyboardType="numeric"
                        maxLength={2}
                      />
                      <Text style={styles.durationLabel}>Minutes</Text>
                    </View>
                  </View>
                  <View style={styles.pomodoroContainer}>
                    <Text style={styles.pomodoroLabel}>Use Pomodoro</Text>
                    <Switch
                      value={usePomodoro}
                      onValueChange={setUsePomodoro}
                      trackColor={{ false: '#E5E5E5', true: '#151B73' }}
                      thumbColor={usePomodoro ? '#fff' : '#fff'}
                    />
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveItemConfig}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    );
  };

  return (
    <Layout
    title={`Define Your ${taskType === 'habit' ? 'Habit' : 'Task'}`}
    onBackPress={() => navigation.goBack()}
    rightButtonText="Next"
    onRightButtonPress={handleNext}
  >
    {/* <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.title}>Define Your {taskType === 'habit' ? 'Habit' : 'Task'}</Text>
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View> */}

        <ScrollView style={styles.content}>
          {taskType !== 'recurring' && (
            <View style={styles.section}>
              <Text style={styles.label}>{taskType === 'habit' ? 'Habit' : 'Task'}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, isTaskInputFocused && styles.inputFocused]}
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  placeholder={`e.g., ${taskType === 'habit' ? 'Morning routine' : 'Project planning'}`}
                  placeholderTextColor="#999"
                  onFocus={() => setIsTaskInputFocused(true)}
                  onBlur={() => setIsTaskInputFocused(false)}
                />
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Checklist</Text>
            {checklistItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.checklistItem}
                onPress={() => handleLongPressItem(item)}
                delayLongPress={500}
              >
                <View style={styles.checklistInputContainer}>
                  <Text style={styles.itemNumber}>{index + 1}. </Text>
                  <TextInput
                    style={[styles.checklistInput, { flex: 1 }]}
                    value={item.text}
                    onChangeText={(text) => handleUpdateItem(item.id, text)}
                    placeholder={`Item ${index + 1}`}
                    placeholderTextColor="#999"
                  />
                  <View style={styles.itemTypeIndicator}>
                    {item.evaluationType === 'timer' && (
                      <>
                        <Icon name="timer" size={16} color="#666" />
                        {item.usePomodoro && (
                          <Icon name="alarm" size={16} color="#666" style={{ marginLeft: 4 }} />
                        )}
                      </>
                    )}
                    {item.evaluationType === 'yesno' && (
                      <Icon name="check-circle-outline" size={16} color="#666" />
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item.id)}
                  >
                    {/* <Icon name="delete-outline" size={20} color="#999" /> */}
                    <Svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                        <Path d="M3.53348 20H12.4626C13.555 20 14.4377 19.1161 14.4377 18.0249V4.16895H1.55957V18.0249C1.55957 19.1161 2.44391 20 3.53348 20ZM11.0845 6.67844C11.0845 6.30868 11.3831 6.00722 11.7545 6.00722C12.1243 6.00722 12.4245 6.30873 12.4245 6.67844V17.4093C12.4245 17.7808 12.1243 18.081 11.7545 18.081C11.3831 18.081 11.0845 17.7808 11.0845 17.4093V6.67844ZM7.34942 6.67844C7.34942 6.30868 7.64841 6.00722 8.01941 6.00722C8.38918 6.00722 8.6894 6.30873 8.6894 6.67844V17.4093C8.6894 17.7808 8.38918 18.081 8.01941 18.081C7.64841 18.081 7.34942 17.7808 7.34942 17.4093V6.67844ZM3.61642 6.67844C3.61642 6.30868 3.91499 6.00722 4.28471 6.00722C4.65442 6.00722 4.95634 6.30873 4.95634 6.67844V17.4093C4.95634 17.7808 4.65442 18.081 4.28471 18.081C3.91494 18.081 3.61642 17.7808 3.61642 17.4093V6.67844Z" fill="#625F5F"/>
                        <Path d="M13.1676 1.05351H10.4488C10.3835 0.461873 9.88687 0 9.27926 0H6.71995C6.10899 0 5.61364 0.461873 5.54873 1.05351H2.83163C1.49922 1.05351 0.423048 2.13298 0.415527 3.46209H15.5846C15.5796 2.13303 14.5017 1.05351 13.1676 1.05351Z" fill="#625F5F"/>
                      </Svg>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.addItemButton}
              onPress={handleAddItem}
            >
              {/* <Icon name="add" size={24} color="#007AFF" /> */}
              <Text style={styles.addItemText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Success Condition</Text>
              <Shadow distance={2} 
                        startColor="rgba(0,0,0,0.1)"
                        endColor="rgba(0,0,0,0)" 
                        offset={[.2, 0.25]} 
                        style={styles.shadow}
              >
                <View style={styles.successConditionCard}>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={styles.radioButton}
                      onPress={() => setSuccessConditionState('all')}
                    >
                      <View style={styles.radio}>
                        {successConditionState === 'all' && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.radioText}>All Items</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioButton}
                      onPress={() => setSuccessConditionState('custom')}
                    >
                      <View style={[styles.radio, successConditionState === 'custom' && styles.radioSelected]}>
                        {successConditionState === 'custom' && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.radioText}>Custom</Text>
                    </TouchableOpacity>

                    {successConditionState === 'custom' && (
                      <View style={styles.customCountContainer}>
                        <View style={styles.customCountInputContainer}>
                          <TextInput
                            style={styles.customCountInput}
                            value={String(customCountState)}
                            onChangeText={(value) => setCustomCountState(Number(value) || 1)}
                            keyboardType="numeric"
                          />
                          <Text style={styles.customCountLabel}>Items (S)</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </Shadow>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Note (optional)</Text>
            {/* <View style={styles.shadowContainer}> */}
              <Shadow distance={2} 
                        startColor="rgba(0,0,0,0.1)"
                        endColor="rgba(0,0,0,0)" 
                        offset={[.2, 0.25]} 
                        style={styles.shadow}
                >
              <View style={styles.noteCard}>
                <TextInput
                  style={styles.noteInput}
                  value={noteState}
                  onChangeText={setNoteState}
                  placeholder="Get the understanding on at least 1"
                  placeholderTextColor="#999"
                  multiline
                />
              </View>
            </Shadow>
            {/* </View> */}
          </View>
        </ScrollView>
      {/* </SafeAreaView> */}
      {renderBottomDrawer()}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  nextButton: {
    padding: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    color: '#575656'
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: '#007AFF',
  },
  checklistItem: {
    marginBottom: 12,
  },
  checklistInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 10
  },
  itemNumber: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
  },
  checklistInput: {
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
  itemTypeIndicator: {
    padding: 8,
    marginRight: 4,
  },
  deleteButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    
    marginTop: 8,
  },
  addItemText: {
    marginLeft: 8,
    fontSize: 18,
    color: '#575656',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#575656',
    marginBottom: 12,
  },
  shadow: {
    // flex:1,
    width: '100%'
  },
  successConditionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
    borderColor: '#151B73',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#151B73',
  },
  radioInner: {
    width: 15,
    height: 15,
    borderRadius: 15,
    backgroundColor: '#151B73',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  customCountContainer: {
    marginTop: 8,
  },
  customCountInputContainer: {
    backgroundColor: '#E9E9E9',
    borderRadius: 8,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  customCountInput: {
    fontSize: 16,
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
    borderBottomWidth: 1,
    padding: 0,
  },
  customCountLabel: {
    fontSize: 16,
    color: '#666',
  },
  noteCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    // borderWidth: 1,
    // borderColor: '#ddd',
    padding: 12,
  },
  noteInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 40,
    padding: 0,
  },
  // Bottom drawer styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '70%',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  drawerContent: {
    paddingBottom: 16,
  },
  drawerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  evaluationTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  evaluationTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 8,
  },
  selectedEvaluationType: {
    backgroundColor: '#151B73',
  },
  evaluationTypeText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  selectedEvaluationTypeText: {
    color: '#fff',
  },
  durationContainer: {
    marginBottom: 24,
  },
  durationInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 8,
  },
  durationInput: {
    fontSize: 16,
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  durationLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#151B73',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  pomodoroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  pomodoroLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default Checklist; 