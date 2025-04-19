import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Modal,
  Animated,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Shadow } from 'react-native-shadow-2';
import AddTaskDrawer, { TaskOption } from '../../components/AddTaskDrawer';
import { 
  getGoals, 
  getLongTermGoals, 
  getRecurringGoals, 
  getDailyPlans, 
  updateChecklistItem, 
  deleteChecklistItem, 
  updateChecklistSuccessCondition,
  updateTaskCompletionStatus // Add this new import
} from '../../services/api';
import { saveTempGoalData, getTempGoalData, clearTempGoalData, hasTempGoalData } from '../../services/tempGoalStorage';
import { format } from 'date-fns';
import { Svg, Path } from 'react-native-svg';
// SVG Icons mapping for consistent usage
const ICONS = {
  // Navigation icons
  home: 'home',
  saved: 'favorite-border',
  cart: 'shopping-cart',
  profile: 'person',
  
  // Header icons
  search: 'search',
  calendar: 'calendar-today',
  info: 'info-outline',
  
  // Task icons
  grid: 'grid-view',
  clock: 'schedule',
  reminder: 'notifications',
  check: 'check',
  more: 'more-vert',
  chevronRight: 'chevron-right',
  arrowRight: 'arrow-forward',
  
  // Action icons
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  
  // Task status icons
  checkCircle: 'check-circle',
  uncheckCircle: 'radio-button-unchecked',
  
  // Task action icons
  alarm: 'alarm',
  repeat: 'repeat',
  share: 'share',
};

const SortIcon = () => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M4 6H20M4 12H14M4 18H9" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </Svg>
  );
};
const EyeIcon = () => {
  return (
    <Svg  width="20" height="14" viewBox="0 0 20 14" fill="none">
    <Path fill-rule="evenodd" clip-rule="evenodd" d="M10.0001 0.25C7.22586 0.25 4.79699 1.91121 3.12801 3.44832C2.28012 4.22922 1.59626 5.0078 1.12442 5.5906C0.888039 5.8825 0.703679 6.1268 0.577359 6.2997C0.514169 6.3862 0.465419 6.4549 0.431869 6.5029C0.415089 6.5269 0.402099 6.5457 0.392999 6.559L0.382269 6.5747L0.379109 6.5794L0.105469 7.0132L0.378089 7.4191L0.379109 7.4206L0.382269 7.4253L0.392999 7.441C0.402099 7.4543 0.415089 7.4731 0.431869 7.4971C0.465419 7.5451 0.514169 7.6138 0.577359 7.7003C0.703679 7.8732 0.888039 8.1175 1.12442 8.4094C1.59626 8.9922 2.28012 9.7708 3.12801 10.5517C4.79699 12.0888 7.22586 13.75 10.0001 13.75C12.7743 13.75 15.2031 12.0888 16.8721 10.5517C17.72 9.7708 18.4039 8.9922 18.8757 8.4094C19.1121 8.1175 19.2964 7.8732 19.4228 7.7003C19.4859 7.6138 19.5347 7.5451 19.5682 7.4971C19.585 7.4731 19.598 7.4543 19.6071 7.441L19.6178 7.4253L19.621 7.4206L19.6224 7.4186L19.9035 7L19.622 6.5809L19.621 6.5794L19.6178 6.5747L19.6071 6.559C19.598 6.5457 19.585 6.5269 19.5682 6.5029C19.5347 6.4549 19.4859 6.3862 19.4228 6.2997C19.2964 6.1268 19.1121 5.8825 18.8757 5.5906C18.4039 5.0078 17.72 4.22922 16.8721 3.44832C15.2031 1.91121 12.7743 0.25 10.0001 0.25ZM2.29022 7.4656C2.14684 7.2885 2.02478 7.1311 1.92575 7C2.02478 6.8689 2.14684 6.7115 2.29022 6.5344C2.72924 5.9922 3.36339 5.2708 4.14419 4.55168C5.73256 3.08879 7.80369 1.75 10.0001 1.75C12.1964 1.75 14.2676 3.08879 15.8559 4.55168C16.6367 5.2708 17.2709 5.9922 17.7099 6.5344C17.8533 6.7115 17.9753 6.8689 18.0744 7C17.9753 7.1311 17.8533 7.2885 17.7099 7.4656C17.2709 8.0078 16.6367 8.7292 15.8559 9.4483C14.2676 10.9112 12.1964 12.25 10.0001 12.25C7.80369 12.25 5.73256 10.9112 4.14419 9.4483C3.36339 8.7292 2.72924 8.0078 2.29022 7.4656ZM12.25 7C12.25 8.2426 11.2427 9.25 10 9.25C8.7574 9.25 7.75005 8.2426 7.75005 7C7.75005 5.7574 8.7574 4.75 10 4.75C11.2427 4.75 12.25 5.7574 12.25 7ZM13.75 7C13.75 9.0711 12.0711 10.75 10 10.75C7.92898 10.75 6.25005 9.0711 6.25005 7C6.25005 4.92893 7.92898 3.25 10 3.25C12.0711 3.25 13.75 4.92893 13.75 7Z" fill="black"/>
    </Svg>
  );
};
const GetAllIcon = () => {
  return (
    <Svg width="24" height="18" viewBox="0 0 24 18" fill="none">
<Path d="M4 5H15" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M4 8H15" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M4 11H11" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M20 9L15.7143 14L14 12" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
</Svg>
  );
};
const TASK_TYPES = ['habit', 'recurring', 'task', 'goal-of-the-day', 'long-term', 'daily', 'custom'] as const;
type TaskType = typeof TASK_TYPES[number];

const taskTypeMap: Record<string, TaskType> = {
  'Habit': 'habit',
  'Recurring Goal': 'recurring',
  'Task': 'task',
  'Goal of the Day': 'goal-of-the-day',
  'Long Term Goal': 'long-term',
  'Daily Goal': 'daily',
  'Custom Goal': 'custom'
};

interface Goal {
  id: string;
  title: string;
  type: 'Long Term Goal' | 'Recurring Goal' | 'Daily Goal';
  description?: string;
  progress?: number;
  dueDate?: string;
  start_date?: string;
  evaluationType?: string;
  isCompleted?: boolean;
  checklist?: {
    items: {
      id: string;
      text: string;
      completed: boolean;
    }[];
    successCondition: string;
    note: string | null;
  };
}

interface Task {
  id: number;
  title: string;
  time: string;
  date: string;
  rawDate: string; // Add this for date filtering
  type: TaskType;
  priority: 'Must' | 'Important';
  isCompleted: boolean;
  hasReminder: boolean;
  color: string;
  icon: string;
  rightIcon: string;
  linkedGoal?: Goal;
}

type RootStackParamList = {
  SelectCategory: {
    taskType: string;
    gender: string;
    isFromAdd: boolean;
    selectedOption?: string;
    isFromDailyPlan?: boolean;
  };
  DailyPlanEvaluation: {
    taskType: string;
    gender: string;
    category: string;
  };
  SavedGoals: undefined;
};

interface AddTaskDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (option: TaskOption) => void;
}

interface RecurringTaskDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  task: Task;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'No date';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const DailyPlan = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedDate, setSelectedDate] = useState(18);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 7 }, (_, i) => 15 + i);
  
  // State for goals and loading
  const [savedGoals, setSavedGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [selectedRecurringTask, setSelectedRecurringTask] = useState<Task | null>(null);
  const [isRecurringDrawerVisible, setIsRecurringDrawerVisible] = useState(false);
  const recurringSlideAnim = React.useRef(new Animated.Value(0)).current;
  const [checkedItems, setCheckedItems] = useState<number[]>([2]);
  const [showDeleteIcons, setShowDeleteIcons] = useState(false);
  const [successConditionModal, setSuccessConditionModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'all' | 'custom'>('all');
  const [customValue, setCustomValue] = useState('1');
  const [buttonGroup, setButtonGroup] = useState(true);
  const [showSortingModal, setShowSortingModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Add checklist items state
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, title: 'Long Term Goal Screen', completed: false },
    { id: 2, title: 'Recurring Goal', completed: true },
    { id: 3, title: 'Plan Your Day Screen', completed: false },
    { id: 4, title: 'Numbering on Screen for Dikesh Sir', completed: false },
    { id: 5, title: 'Custom Goal Services', completed: false },
    { id: 6, title: 'Check Missing Details Of Screen', completed: false },
  ]);

  const sortingOptions = {
    'To-do list order criteria': [
      { id: 'priority', label: 'By priority' },
      { id: 'time', label: 'By time' },
    ],
    'Habits section order criteria': [
      { id: 'priority', label: 'By priority' },
      { id: 'time', label: 'By time' },
     
    ],
    'Recurring tasks section order criteria': [
      { id: 'priority', label: 'By priority' },
      { id: 'time', label: 'By time' },
   
    ],
    'Checklist sorting criteria': [
      { id: 'priority', label: 'By priority' },
      { id: 'alphabetical', label: 'Alphabetical' },
      { id: 'creation_date', label: 'Creation date' },
    ],
  };

  const handleSectionPress = (sectionKey: string) => {
    setExpandedSection(expandedSection === sectionKey ? null : sectionKey);
  };

  // Check for existing temporary goal data when component mounts
  useEffect(() => {
    const checkTempData = async () => {
      const hasData = await hasTempGoalData();
      setIsCreatingGoal(hasData);
    };
    checkTempData();
  }, []);

  // Function to handle saving temporary goal data
  const handleSaveTempData = async (data: any) => {
    try {
      await saveTempGoalData(data);
      setIsCreatingGoal(true);
    } catch (error) {
      console.error('Error saving temporary goal data:', error);
    }
  };

  // Function to handle clearing temporary goal data
  const handleClearTempData = async () => {
    try {
      await clearTempGoalData();
      setIsCreatingGoal(false);
    } catch (error) {
      console.error('Error clearing temporary goal data:', error);
    }
  };

  // Function to handle navigation to SelectCategory
  const handleNavigateToSelectCategory = (taskType: 'habit' | 'recurring' | 'task' | 'goal-of-the-day' | 'long-term' | 'daily' | 'custom') => {
    handleSaveTempData({ taskType });
    navigation.navigate('SelectCategory', {
      taskType,
      gender: 'male', // This should be dynamic based on user data
      isFromAdd: true,
      isFromDailyPlan: true
    });
  };

  // Fetch goals for selected date
  useEffect(() => {
    const fetchGoalsForDate = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Format date for API
        const selectedDateObj = new Date(2024, 2, selectedDate); // March 2024
        const formattedDate = format(selectedDateObj, 'yyyy-MM-dd');
        
        // Fetch goals for the selected date
        const [recurringGoalsResponse, dailyPlanResponse] = await Promise.all([
          getRecurringGoals({
            date: formattedDate,
            includeFlexible: true, // Include goals with flexible timing
            includeRepetitive: true // Include repeating goals that fall on this date
          }),
          getDailyPlans({
            date: formattedDate
          })
        ]);
        
        // Map the responses to goals
        const allGoals: Goal[] = [
          ...((recurringGoalsResponse?.data?.data || []).map((goal: { id: string; title: string; type?: string; description?: string; progress?: number; dueDate?: string }) => ({
            ...goal,
            type: 'Recurring Goal' as const
          }))),
          ...((dailyPlanResponse?.data?.data || []).map((goal: { id: string; habit: string; description?: string; start_date?: string; end_date?: string; isCompleted?: boolean }) => ({
            id: goal.id,
            title: goal.habit,
            description: goal.description,
            dueDate: goal.start_date,
            type: 'Daily Goal' as const,
            isCompleted: goal.isCompleted ?? false
          })))
        ];
        
        setSavedGoals(allGoals);
        console.log('🔍 Goals for date', formattedDate, ':', JSON.stringify(allGoals, null, 2));
      } catch (err: any) {
        console.error('Error fetching goals:', err);
        setError('Failed to load goals. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGoalsForDate();
  }, [selectedDate]); // Re-fetch when selected date changes

  // Convert goals to tasks for display
  useEffect(() => {
    const mappedTasks: Task[] = savedGoals.map((goal, index) => {
      // Format the date for display
      const rawDate = goal.dueDate || goal.start_date;
      let displayDate = 'No date';
      if (rawDate) {
        try {
          displayDate = format(new Date(rawDate), 'MMM dd, yyyy');
        } catch (error) {
          console.error('Error formatting date:', rawDate, error);
        }
      }

      // Determine the task type based on the goal type
      const taskType = goal.type === 'Daily Goal' ? 'daily' as const : 
                      goal.type === 'Recurring Goal' ? 'recurring' as const : 'task' as const;
      
      // Determine priority and color
      const priority = goal.type === 'Daily Goal' ? 'Must' as const : 'Important' as const;
      const color = goal.type === 'Daily Goal' ? '#8FB681' : 
                   goal.type === 'Recurring Goal' ? '#464DB0' : '#FF9F43';
      
      // Check completion status
      let isCompleted = false;
      if (goal.type === 'Recurring Goal' && goal.checklist?.items && goal.checklist.successCondition) {
        const completedItemsCount = goal.checklist.items.filter(item => item.completed).length;
        isCompleted = goal.checklist.successCondition === 'all'
          ? completedItemsCount === goal.checklist.items.length
          : completedItemsCount >= Number(goal.checklist.successCondition);
      } else if (goal.type === 'Daily Goal') {
        isCompleted = goal.isCompleted || false;
      }
      
      // Determine right icon
      const rightIcon = isCompleted ? ICONS.checkCircle :
                       taskType === 'recurring' ? ICONS.arrowRight :
                       goal.evaluationType === 'yesno' ? ICONS.add :
                       goal.evaluationType === 'Count' ? ICONS.repeat :
                       ICONS.alarm;

      return {
        id: index + 1,
        title: goal.title,
        time: '09:00 AM',
        date: displayDate,
        rawDate: rawDate || '',
        type: taskType,
        priority: priority,
        isCompleted: isCompleted,
        hasReminder: false,
        color: color,
        icon: ICONS.grid,
        rightIcon: rightIcon,
        linkedGoal: goal
      };
    });
    
    setTasks(mappedTasks);
  }, [savedGoals]);

  const showDrawer = () => {
    setIsDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsDrawerVisible(false);
    });
  };

  const handleSelectTask = (option: TaskOption) => {
    const taskTypeMap: Record<string, 'habit' | 'recurring' | 'task' | 'goal-of-the-day' | 'long-term' | 'daily' | 'custom'> = {
      'Habit': 'habit',
      'Recurring Goal': 'recurring',
      'Task': 'task',
      'Goal of the Day': 'goal-of-the-day',
      'Long Term Goal': 'long-term',
      'Daily Goal': 'daily',
      'Custom Goal': 'custom'
    };
    
    const taskType = taskTypeMap[option.title] || 'task';
    handleNavigateToSelectCategory(taskType as 'habit' | 'recurring' | 'task' | 'goal-of-the-day' | 'long-term' | 'daily' | 'custom');
  };

  const navigateToSavedGoals = () => {
    navigation.navigate('SavedGoals');
  };

  const handleAddTask = (taskOption: TaskOption) => {
    const newTask: Task = {
      id: tasks.length + 1,
      title: taskOption.title,
      time: '09:00 AM',
      date: 'No date',
      rawDate: '',
      type: 'task',
      priority: 'Must',
      isCompleted: false,
      hasReminder: false,
      color: '#8FB681',
      icon: ICONS.grid,
      rightIcon: ICONS.alarm,
      linkedGoal: undefined
    };
    setTasks([...tasks, newTask]);
    setIsDrawerVisible(false);
  };

  const showRecurringDrawer = (task: Task) => {
    // Initialize checklist if it doesn't exist
    if (task.linkedGoal && !task.linkedGoal.checklist) {
      task.linkedGoal.checklist = {
        items: [],
        successCondition: '',
        note: null,
      };
    }
    setSelectedRecurringTask(task);
    setIsRecurringDrawerVisible(true);
    Animated.timing(recurringSlideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideRecurringDrawer = () => {
    Animated.timing(recurringSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsRecurringDrawerVisible(false);
      setSelectedRecurringTask(null);
    });
  };

  // Update function to handle checklist item toggle
  const handleChecklistItemToggle = async (itemId: string) => {
    if (!selectedRecurringTask?.linkedGoal?.checklist?.items) return;
    
    try {
      const item = selectedRecurringTask.linkedGoal.checklist.items.find(i => i.id === itemId);
      if (!item) return;

      const newCompletedState = !item.completed;

      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === selectedRecurringTask.id && task.linkedGoal?.checklist?.items) {
            // Update the items first
            const updatedItems = task.linkedGoal.checklist.items.map(item => 
              item.id === itemId ? { ...item, completed: newCompletedState } : item
            );

            // Calculate if task should be marked as completed
            const completedItemsCount = updatedItems.filter(item => item.completed).length;
            const successCondition = task.linkedGoal.checklist.successCondition;
            
            // Check if task meets success condition
            const isTaskCompleted = successCondition === 'all' 
              ? completedItemsCount === updatedItems.length // All items must be completed
              : completedItemsCount >= Number(successCondition); // At least N items completed

            console.log('Success check:', {
              completedCount: completedItemsCount,
              successCondition,
              isCompleted: isTaskCompleted
            });

            const updatedGoal: Goal = {
              ...task.linkedGoal,
              checklist: {
                ...task.linkedGoal.checklist,
                items: updatedItems
              }
            };

            return { 
              ...task, 
              linkedGoal: updatedGoal,
              isCompleted: isTaskCompleted,
              rightIcon: isTaskCompleted ? ICONS.checkCircle : ICONS.arrowRight
            };
          }
          return task;
        })
      );

      // Make API call
      await updateChecklistItem(selectedRecurringTask.linkedGoal.id, itemId, newCompletedState);
      
      // Update the selectedRecurringTask state to reflect the change
      setSelectedRecurringTask(prevTask => {
        if (!prevTask?.linkedGoal?.checklist?.items) return prevTask;
        
        // Update the items first
        const updatedItems = prevTask.linkedGoal.checklist.items.map(item => 
          item.id === itemId ? { ...item, completed: newCompletedState } : item
        );

        // Calculate if task should be marked as completed
        const completedItemsCount = updatedItems.filter(item => item.completed).length;
        const successCondition = prevTask.linkedGoal.checklist.successCondition;
        
        // Check if task meets success condition
        const isTaskCompleted = successCondition === 'all' 
          ? completedItemsCount === updatedItems.length // All items must be completed
          : completedItemsCount >= Number(successCondition); // At least N items completed

        const updatedTask: Task = {
          ...prevTask,
          linkedGoal: {
            ...prevTask.linkedGoal,
            checklist: {
              ...prevTask.linkedGoal.checklist,
              items: updatedItems
            }
          },
          isCompleted: isTaskCompleted,
          rightIcon: isTaskCompleted ? ICONS.checkCircle : ICONS.arrowRight
        };
        return updatedTask;
      });
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      // Revert optimistic update on error
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === selectedRecurringTask.id && task.linkedGoal?.checklist?.items) {
            const updatedGoal: Goal = {
              ...task.linkedGoal,
              checklist: {
                ...task.linkedGoal.checklist,
                items: task.linkedGoal.checklist.items.map(item => 
                  item.id === itemId ? { ...item, completed: !item.completed } : item
                )
              }
            };
            return { ...task, linkedGoal: updatedGoal };
          }
          return task;
        })
      );
    }
  };

  // Update function to handle deleting checklist item
  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!selectedRecurringTask?.linkedGoal?.checklist?.items) return;
    
    try {
      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === selectedRecurringTask.id && task.linkedGoal?.checklist?.items) {
            const updatedGoal: Goal = {
              ...task.linkedGoal,
              checklist: {
                ...task.linkedGoal.checklist,
                items: task.linkedGoal.checklist.items.filter(item => item.id !== itemId)
              }
            };
            return { ...task, linkedGoal: updatedGoal };
          }
          return task;
        })
      );

      // Make API call
      await deleteChecklistItem(selectedRecurringTask.linkedGoal.id, itemId);
      
      // Update selectedRecurringTask state
      setSelectedRecurringTask(prevTask => {
        if (!prevTask?.linkedGoal?.checklist?.items) return prevTask;
        return {
          ...prevTask,
          linkedGoal: {
            ...prevTask.linkedGoal,
            checklist: {
              ...prevTask.linkedGoal.checklist,
              items: prevTask.linkedGoal.checklist.items.filter(item => item.id !== itemId)
            }
          }
        };
      });
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      // Revert optimistic update on error
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === selectedRecurringTask.id && task.linkedGoal?.checklist?.items) {
            const updatedGoal: Goal = {
              ...task.linkedGoal,
              checklist: {
                ...task.linkedGoal.checklist,
                items: [...task.linkedGoal.checklist.items]
              }
            };
            return { ...task, linkedGoal: updatedGoal };
          }
          return task;
        })
      );
    }
  };

  const handleSuccessConditionUpdate = async () => {
    if (!selectedRecurringTask?.linkedGoal?.checklist) return;

    try {
      // Set success condition based on selection
      const successCondition = selectedOption === 'all' 
        ? 'all' 
        : Number(customValue); // Convert to number for custom value

      // Validate custom value if selected
      if (selectedOption === 'custom') {
        const numValue = Number(customValue);
        if (isNaN(numValue) || numValue < 1) {
          Alert.alert('Invalid Value', 'Please enter a valid number greater than 0');
          return;
        }
      }

      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === selectedRecurringTask.id && task.linkedGoal?.checklist) {
            const updatedGoal: Goal = {
              ...task.linkedGoal,
              checklist: {
                ...task.linkedGoal.checklist,
                successCondition: successCondition.toString() // Convert to string for storage
              }
            };
            return { ...task, linkedGoal: updatedGoal };
          }
          return task;
        })
      );

      // Make API call to update success condition
      await updateChecklistSuccessCondition(
        selectedRecurringTask.linkedGoal.id,
        successCondition.toString() // Convert to string for API call
      );

      // Update selectedRecurringTask state
      setSelectedRecurringTask(prevTask => {
        if (!prevTask?.linkedGoal?.checklist) return prevTask;
        return {
          ...prevTask,
          linkedGoal: {
            ...prevTask.linkedGoal,
            checklist: {
              ...prevTask.linkedGoal.checklist,
              successCondition: successCondition.toString() // Convert to string for storage
            }
          }
        };
      });

      setSuccessConditionModal(false);
    } catch (error) {
      console.error('Error updating success condition:', error);
      // Revert optimistic update on error
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === selectedRecurringTask.id && task.linkedGoal?.checklist) {
            const updatedGoal: Goal = {
              ...task.linkedGoal,
              checklist: {
                ...task.linkedGoal.checklist,
                successCondition: task.linkedGoal.checklist.successCondition
              }
            };
            return { ...task, linkedGoal: updatedGoal };
          }
          return task;
        })
      );
      Alert.alert('Error', 'Failed to update success condition. Please try again.');
    }
  };

  const toggleDeleteIcons = (event: any) => {
    event.stopPropagation();
    setButtonGroup(!buttonGroup);
    setShowDeleteIcons(!showDeleteIcons);
  };

  const handleAllItemsPress = () => {
    setSuccessConditionModal(true);
  };

  // Add function to handle adding new checklist item
  const handleAddChecklistItem = () => {
    if (!selectedRecurringTask?.linkedGoal?.checklist?.items) return;
    
    const newItem = {
      id: Date.now().toString(),
      text: 'New Item',
      completed: false
    };

    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === selectedRecurringTask.id && task.linkedGoal?.checklist?.items) {
          const updatedGoal: Goal = {
            ...task.linkedGoal,
            checklist: {
              ...task.linkedGoal.checklist,
              items: [...task.linkedGoal.checklist.items, newItem]
            }
          };
          return { ...task, linkedGoal: updatedGoal };
        }
        return task;
      })
    );
  };

  // Add this new function after the handleChecklistItemToggle function
  const handleTaskCompletion = async (task: Task) => {
    const newCompletedState = !task.isCompleted;
    
    try {
      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(t => {
          if (t.id === task.id) {
            return {
              ...t,
              isCompleted: newCompletedState,
              rightIcon: newCompletedState ? ICONS.checkCircle : 
                        t.type === 'recurring' ? ICONS.arrowRight :
                        t.linkedGoal?.evaluationType === 'yesno' ? ICONS.add :
                        t.linkedGoal?.evaluationType === 'Count' ? ICONS.repeat :
                        ICONS.alarm
            };
          }
          return t;
        })
      );

      // Make API call to update task completion status
      if (task.linkedGoal) {
        await updateTaskCompletionStatus(task.linkedGoal.id, newCompletedState);
        console.log('Task completion status updated successfully:', {
          taskId: task.linkedGoal.id,
          completed: newCompletedState
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      setTasks(prevTasks => 
        prevTasks.map(t => {
          if (t.id === task.id) {
            return {
              ...t,
              isCompleted: !newCompletedState, // Revert to previous state
              rightIcon: !newCompletedState ? ICONS.checkCircle : 
                        t.type === 'recurring' ? ICONS.arrowRight :
                        t.linkedGoal?.evaluationType === 'yesno' ? ICONS.add :
                        t.linkedGoal?.evaluationType === 'Count' ? ICONS.repeat :
                        ICONS.alarm
            };
          }
          return t;
        })
      );
      
      console.error('Error updating task completion status:', error);
      Alert.alert(
        'Error',
        'Failed to update task completion status. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff"
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/images/logo.png')} 
                  style={styles.logoImage}
                />
              </View>
              <Text style={styles.headerTitle}>WingsFly</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="search" size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="calendar-today" size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="info-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Calendar Strip */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.calendarStrip}
              contentContainerStyle={styles.calendarStripContent}
            >
              {days.map((day, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.dateItem,
                    dates[index] === selectedDate && styles.selectedDateItem
                  ]}
                  onPress={() => setSelectedDate(dates[index])}
                >
                  <View style={[styles.dayTop, dates[index] === selectedDate && styles.selectedDayTop]}>
                    <Text style={[
                      styles.dayText,
                      dates[index] === selectedDate && styles.selectedDayText
                    ]}>{day}</Text>
                  </View>
                  <View style={[styles.dayBottom, dates[index] === selectedDate && styles.selectedDayBottom]}>
                    <Text style={[
                      styles.dateText,
                      dates[index] === selectedDate && styles.selectedDateText
                    ]}>{dates[index]}</Text>
                  </View>
                
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Quote Card */}
            <View style={styles.quoteCardContainer}>
              <Shadow  distance={4} 
                      startColor="rgba(0,0,0,0.1)"
                      endColor="rgba(0,0,0,0)" 
                      offset={[0, 2]} 
              >
                <View style={styles.quoteCard}>
                  <Text style={styles.quoteTitle}>Today's Quote</Text>
                  <Text style={styles.quoteText}>
                    "You must do the things, you think you cannot do."
                  </Text>
                  <View style={styles.quoteLine} />
                </View>
              </Shadow>
            </View>


            {/* Tasks List */}
            <View style={styles.tasksList}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3F51B5" />
                  <Text style={styles.loadingText}>Loading tasks...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Icon name="error-outline" size={24} color="#FF4B4B" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : tasks.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="assignment" size={48} color="#999" />
                  <Text style={styles.emptyText}>No tasks available</Text>
                  <TouchableOpacity style={styles.addGoalButton} onPress={showDrawer}>
                    <Text style={styles.addGoalButtonText}>Add a Task</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                tasks.map((task) => (
                  <TouchableOpacity 
                    key={task.id} 
                    style={styles.taskItem}
                    onPress={() => {
                      if (task.type === 'recurring') {
                        showRecurringDrawer(task);
                      }
                    }}
                  >
                    <View style={styles.taskLeft}>
                      <View style={[styles.taskIconContainer, { backgroundColor: task.color }]}>
                        <Icon name={task.icon} size={16} color="#fff" />
                      </View>
                      <View style={styles.taskInfo}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <View style={styles.taskMeta}>
                          <View style={styles.timeContainer}>
                            <Icon name="schedule" size={12} color="rgba(21, 27, 115, 1)" />
                            <Text style={styles.taskTime}>{task.time}</Text>
                          </View>
                          <View>
                            <Text style={styles.taskDate}>{task.date}</Text>
                          </View>
                          <View style={styles.dividerLine} />
                          <Text style={styles.taskType}>{task.type}</Text>
                          <View style={styles.dividerLine} />
                          <Text style={[
                            styles.taskPriority,
                            { color: task.priority === 'Must' ? '#FF4B4B' : '#2196F3' }
                          ]}>{task.priority}</Text>
                          {task.linkedGoal && (
                            <View style={styles.linkedGoalContainer}>
                              <Icon name="link" size={14} color="#999" />
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    <View style={styles.taskRight}>
                      <TouchableOpacity 
                        onPress={() => handleTaskCompletion(task)}
                        style={task.isCompleted ? styles.checkContainer : styles.uncheckedContainer}
                      >
                        <Icon 
                          name={task.isCompleted ? ICONS.checkCircle : task.rightIcon} 
                          size={20} 
                          color={task.isCompleted ? "rgba(21, 27, 115, 1)" : "#000"} 
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>

          {/* Add Task FAB */}
          <TouchableOpacity 
            style={styles.fab}
            onPress={showDrawer}
          >
            <Icon name="add" size={24} color="white" />
          </TouchableOpacity>

          {/* Bottom Navigation */}
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.bottomNavItem}>
              <Icon name="home" size={24} color="#3F51B5" />
              <Text style={[styles.bottomNavText, styles.bottomNavActive]}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomNavItem} onPress={navigateToSavedGoals}>
              <Icon name="favorite-border" size={24} color="#666" />
              <Text style={styles.bottomNavText}>Saved</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomNavItem}>
              <Icon name="shopping-cart" size={24} color="#666" />
              <Text style={styles.bottomNavText}>Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomNavItem}>
              <View style={styles.profilePic}>
                <Text style={styles.profileText}>A</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom Drawer Modal */}
      <Modal
        visible={isDrawerVisible}
        transparent
        animationType="none"
        onRequestClose={hideDrawer}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideDrawer}
        >
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <AddTaskDrawer
              isVisible={isDrawerVisible}
              onClose={() => setIsDrawerVisible(false)}
              onSelect={handleSelectTask}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* WingsFly Screen Management Modal */}
      <Modal
        visible={isRecurringDrawerVisible}
        transparent
        animationType="none"
        onRequestClose={hideRecurringDrawer}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideRecurringDrawer}
        >
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                transform: [
                  {
                    translateY: recurringSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
              style={styles.recurringDrawerContent}
            >
              <View style={styles.recurringDrawerHeader}>
                <Text style={styles.recurringDrawerTitle}>
                  {selectedRecurringTask?.title || 'WingsFly Screen Management'}
                </Text>
                <View style={styles.dateCircle}>
                  <Icon name="schedule" size={20} color="#fff" />
                </View>
              </View>

              <Text style={styles.dateText}>27/03/25</Text>

              <View style={styles.screenList}>
                {selectedRecurringTask?.linkedGoal?.checklist?.items && selectedRecurringTask.linkedGoal.checklist.items.length > 0 ? (
                  selectedRecurringTask.linkedGoal.checklist.items.map((item, index) => (
                    <View key={item.id} style={styles.screenItem}>
                      <View style={styles.screenItemLeft}>
                        <Text style={styles.screenNumber}>{index + 1}.</Text>
                        <Text style={styles.screenTitle}>{item.text}</Text>
                      </View>
                      {showDeleteIcons ? (
                        <TouchableOpacity 
                          onPress={() => handleDeleteChecklistItem(item.id)}
                          style={styles.deleteButton}
                        >
                          <Icon name="delete-outline" size={24} color="#666" />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity 
                          onPress={() => handleChecklistItemToggle(item.id)}
                          style={[styles.checkbox]}
                        >
                          <Icon 
                            name={item.completed ? "check-box" : "check-box-outline-blank"} 
                            size={24} 
                            color={item.completed ? "#4CAF50" : "#666"} 
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyChecklist}>
                    <Text style={styles.emptyChecklistText}>No checklist items available</Text>
                  </View>
                )}
              </View>

              <View style={styles.bottomActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.actionButtonLight]}
                  onPress={toggleDeleteIcons}
                >
                  <Icon name="format-list-bulleted" size={20} color="#000" />
                </TouchableOpacity>
               
                {buttonGroup ? (
                  <View style={[styles.actionButton, styles.actionButtonLight]}>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => setShowSortingModal(true)}
                    >
                      <Text style={styles.actionButtonText}>
                        <SortIcon />
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => {/* Handle eye icon press */}}
                    >
                      <EyeIcon />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.actionButtonLight]}
                    onPress={handleAllItemsPress}
                  >
                    <GetAllIcon />
                    <Text style={styles.actionButtonText}>All Item</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  onPress={handleAddChecklistItem}
                >
                  <Icon name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* All Items Popup Modal */}
      <Modal
        visible={successConditionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessConditionModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSuccessConditionModal(false)}
        >
          <View style={styles.allItemsPopup}>
            <Text style={styles.popupTitle}>Success condition</Text>
            
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setSelectedOption('all')}
              >
                <View style={styles.radioButton}>
                  {selectedOption === 'all' && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioText}>All items</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setSelectedOption('custom')}
              >
                <View style={styles.radioButton}>
                  {selectedOption === 'custom' && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioText}>Custom</Text>
              </TouchableOpacity>

              {selectedOption === 'custom' && (
                <View style={styles.customInputContainer}>
                  <TextInput
                    style={styles.customInput}
                    value={customValue}
                    onChangeText={(text) => {
                      // Only allow positive numbers
                      const numValue = text.replace(/[^0-9]/g, '');
                      setCustomValue(numValue);
                    }}
                    keyboardType="numeric"
                    placeholder="1"
                    defaultValue="1"
                  />
                  <Text style={styles.customInputLabel}>item(s)</Text>
                </View>
              )}
            </View>

            <View style={styles.popupButtons}>
              <TouchableOpacity 
                style={styles.popupButton}
                onPress={() => setSuccessConditionModal(false)}
              >
                <Text style={styles.popupButtonText}>CLOSE</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.popupButton, styles.popupButtonPrimary]}
                onPress={handleSuccessConditionUpdate}
              >
                <Text style={[styles.popupButtonText, styles.popupButtonTextPrimary]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sorting Options Modal */}
      <Modal
        visible={showSortingModal}
        animationType="slide"
        onRequestClose={() => setShowSortingModal(false)}
      >
        <SafeAreaView style={styles.sortingModalContainer}>
          <View style={styles.sortingModalHeader}>
            <TouchableOpacity 
              onPress={() => setShowSortingModal(false)}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.sortingModalTitle}>Sorting options</Text>
          </View>

          <ScrollView style={styles.sortingModalContent}>
            {Object.entries(sortingOptions).map(([sectionKey, options]) => (
              <View key={sectionKey} style={styles.sortingSection}>
                <TouchableOpacity
                  style={styles.sortingSectionHeader}
                  onPress={() => handleSectionPress(sectionKey)}
                >
                  <View style={styles.sortingSectionLeft}>
                    {sectionKey === 'To-do list order criteria' && (

                      <Svg  width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path d="M23 13.3098C22.1201 17.7142 18.8026 21.8613 14.1477 22.7879C11.8774 23.2405 9.52236 22.9646 7.41786 21.9994C5.31335 21.0342 3.5667 19.4289 2.42659 17.4122C1.28648 15.3954 0.811042 13.07 1.06797 10.7671C1.3249 8.46412 2.3011 6.301 3.85757 4.58574C7.05003 1.0658 12.4406 0.0968499 16.8404 1.85858" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <Path d="M8.04077 11.5479L12.4405 15.9522L22.9999 4.50098" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </Svg>
                    )}
                    {sectionKey === 'Habits section order criteria' && (
                      // <Icon name="emoji-events" size={24} color="#E91E63" style={styles.sectionIcon} />
                      <Svg width="24" height="22" viewBox="0 0 24 22" fill="none">
                  <Path d="M23.1907 1.40847C22.6926 0.909528 21.998 0.5987 21.2369 0.599122H19.9742H19.3338H4.66622H4.02619H2.76319C2.00245 0.5987 1.30744 0.909528 0.809391 1.40847C0.310453 1.90651 -0.000374661 2.60157 3.38933e-07 3.36226V4.80948C3.38933e-07 6.59059 1.08436 8.19217 2.73802 8.85358L2.76272 8.86333L5.63419 9.74303C5.77702 9.92809 5.92753 10.1093 6.09553 10.2824C7.16198 11.3791 8.19858 12.1156 8.91281 12.7134C9.27009 13.011 9.5422 13.2732 9.70162 13.4963C9.78225 13.6075 9.8355 13.7069 9.8692 13.7986C9.90248 13.8907 9.91823 13.9751 9.91823 14.0736C9.91823 15.4637 9.91823 14.6604 9.91823 16.0505C9.91823 16.3379 9.87769 16.5848 9.81033 16.7886C9.70758 17.0952 9.55148 17.3028 9.35962 17.4444C9.16603 17.5843 8.92472 17.6678 8.60231 17.6691C7.45275 17.6691 7.44164 17.6691 7.4408 17.6691H6.80034V21.4006H17.1996V17.6691H16.5591C16.5591 17.6691 16.5476 17.6691 15.398 17.6691C15.1831 17.6691 15.0036 17.6303 14.8514 17.5647C14.6241 17.4645 14.448 17.3075 14.3094 17.0636C14.1729 16.8202 14.0817 16.4824 14.0817 16.0505C14.0817 14.6604 14.0817 15.4637 14.0817 14.0736C14.0821 13.9751 14.0979 13.8907 14.1307 13.7986C14.1883 13.6396 14.3124 13.4502 14.5238 13.2289C14.8381 12.8963 15.3345 12.51 15.9263 12.0388C16.5182 11.566 17.2043 11.0027 17.9044 10.2824C18.0724 10.1093 18.2234 9.92809 18.3658 9.74303L21.2377 8.86333L21.262 8.85358C22.916 8.19217 24 6.59059 24 4.80948V3.36226C24.0004 2.60157 23.69 1.90651 23.1907 1.40847ZM3.19678 7.65747C2.03869 7.18628 1.28053 6.061 1.28053 4.80948V3.36226C1.28091 2.95122 1.44553 2.58409 1.71459 2.31414C1.98534 2.04465 2.35163 1.88007 2.76314 1.87961H4.02403C4.02272 2.17768 4.02098 2.47614 4.02098 2.77295C4.02188 4.14597 4.053 5.50028 4.32333 6.78123C4.42055 7.24 4.55058 7.68906 4.72116 8.12439L3.19678 7.65747ZM18.4243 6.51597C18.3058 7.07547 18.139 7.59522 17.9062 8.0732C17.6734 8.5517 17.3758 8.98914 16.9865 9.38997C16.0087 10.3967 15.0433 11.0837 14.2664 11.731C13.8784 12.0563 13.533 12.3723 13.2609 12.7458C13.1257 12.9326 13.0102 13.1356 12.9283 13.359C12.8465 13.5816 12.8009 13.8246 12.8012 14.0736C12.8012 15.4637 12.8012 14.6604 12.8012 16.0505C12.8012 16.4581 12.8584 16.841 12.9744 17.1911C13.1471 17.7156 13.4588 18.1676 13.8856 18.4785C14.3112 18.7906 14.8404 18.9513 15.3981 18.9497C15.6075 18.9497 15.7785 18.9497 15.9192 18.9497V20.1202H8.08088V18.9497C8.22159 18.9497 8.39259 18.9497 8.60236 18.9497C8.97464 18.9501 9.33281 18.8801 9.65728 18.7399C10.1451 18.5301 10.5472 18.1578 10.8077 17.6888C11.07 17.2197 11.1988 16.6611 11.1988 16.0505C11.1988 14.6605 11.1988 15.4637 11.1988 14.0737C11.1992 13.8247 11.1536 13.5816 11.0717 13.359C10.9276 12.9667 10.685 12.6422 10.404 12.3463C9.97922 11.9024 9.45389 11.5037 8.87273 11.0385C8.29195 10.5746 7.65492 10.0501 7.01358 9.39001C6.62428 8.98919 6.32667 8.5517 6.09384 8.07325C5.74505 7.3569 5.54377 6.54372 5.43291 5.64958C5.32163 4.75665 5.30161 3.78657 5.30161 2.773C5.30161 2.47876 5.30288 2.18031 5.30456 1.87965H18.6959C18.6968 2.18031 18.6985 2.47872 18.6985 2.773C18.6993 4.12468 18.6614 5.39837 18.4243 6.51597ZM22.7199 4.80948C22.7199 6.061 21.9613 7.18628 20.8032 7.65747L19.278 8.12434C19.5679 7.38583 19.7385 6.60676 19.8379 5.80768C19.9602 4.82181 19.9785 3.8027 19.979 2.7729C19.979 2.47614 19.9773 2.17764 19.976 1.87956H21.2369C21.6484 1.88003 22.0151 2.04456 22.2854 2.31409C22.5545 2.584 22.7195 2.9507 22.7199 3.36222V4.80948Z" fill="black"/>
                      </Svg>
                    )}
                    {sectionKey === 'Recurring tasks section order criteria' && (
                      <Icon name="repeat" size={24} color="#000000" style={styles.sectionIcon} />
                    )}
                    {sectionKey === 'Checklist sorting criteria' && (
                      <Icon name="checklist" size={24} color="#000000" style={styles.sectionIcon} />
                    )}
                    <Text style={styles.sortingSectionTitle}>{sectionKey}</Text>
                  </View>
                  <Icon 
                    name={expandedSection === sectionKey ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={24} 
                    color="#000" 
                  />
                </TouchableOpacity>

                {expandedSection === sectionKey && (
                  <View style={styles.sortingOptions}>
                    {options.map((option, index) => (
                      <TouchableOpacity 
                        key={option.id}
                        style={[
                          styles.sortingOption,
                          index === 0 && styles.selectedSortingOption
                        ]}
                      >
                        <Text style={styles.sortingOptionText}>{option.label}</Text>
                        {index === 0 && (
                          <Text style={styles.sortingOptionSubtext}>
                            {index === 0 ? 'First' : 'Second'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => handleSectionPress(sectionKey)}
                    >
                      <Text style={styles.closeButtonText}>CLOSE</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden', // Add this to ensure the image respects the container's borderRadius
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  logoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  calendarStrip: {
    paddingVertical: 12,
  },
  calendarStripContent: {
    paddingHorizontal: 16,
  },
  dayTop: {
    backgroundColor: 'rgba(244, 244, 244, 1)',
    alignItems: 'center',
    width: 45,
    height: 67,
    borderRadius: 16,
    paddingTop: 7
  },
  dayBottom: {
    backgroundColor: 'rgba(233, 233, 233, 1)',
    color: 'rgba(99, 99, 99, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 45,
    height: 40,
    borderRadius: 16,
    marginTop: -40
  },
  selectedDayTop: {
    backgroundColor: 'rgba(70, 77, 176, 1)',
  },
  selectedDayBottom: {
    backgroundColor: 'rgba(21, 27, 115, 1)',
  },
  dateItem: {
    marginRight: 10,
  },
  selectedDateItem: {},
  dayText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedDayText: {
    color: '#fff',
  },
  selectedDateText: {
    color: '#fff',
  },
  quoteCardContainer: {
    margin: 16,
  },
  quoteCard: {
    padding: 16,
    paddingBottom: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden'
  },
  quoteTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 16,
  },
  quoteLine: {
    height: 5,
    width: '45%',
    backgroundColor: '#3F51B5',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0
  },
  tasksList: {
    paddingTop: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(218, 216, 216, 1)',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    color: '#000',
    marginBottom: 4,
    fontWeight: '600',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(228, 230, 255, 1)',
    padding: 4,
    borderRadius: 4,
    color: 'rgba(21, 27, 115, 1)',
  },
  taskTime: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  taskDate: {
    fontSize: 13,
    color: '#999',
    marginLeft: 4,
  },
  dividerLine: {
    width: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  taskType: {
    fontSize: 13,
    color: '#999',
  },
  taskPriority: {
    fontSize: 13,
    fontWeight: '500',
  },
  linkedGoalContainer: {
    marginLeft: 8,
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkContainer: {
    width: 25,
    height: 25,
    borderRadius: 50,
    backgroundColor: 'rgba(228, 230, 255, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1
  },
  uncheckedContainer: {
    width: 25,
    height: 25,
    borderRadius: 50,
    borderWidth: 2,
    backgroundColor: 'rgba(231, 231, 231, 1)',
    borderColor: 'rgba(231, 231, 231, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  bottomNavItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  bottomNavActive: {
    color: '#3F51B5',
  },
  profilePic: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recurringDrawerContent: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  recurringDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recurringDrawerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#151B73',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenList: {
    marginBottom: 24,
  },
  screenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  screenItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  screenNumber: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  screenTitle: {
    fontSize: 14,
    color: '#333',
  },
  checkbox: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    marginTop: 'auto',
  },
  actionButton: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  actionButtonLight: {
    backgroundColor: '#F4F4F4',
  },
  actionButtonPrimary: {
    backgroundColor: '#151B73',
    marginLeft: 'auto',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#FF4B4B',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addGoalButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#3F51B5',
    borderRadius: 4,
  },
  addGoalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  allItemsPopup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: '50%',
  },
  popupTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  radioGroup: {
    marginBottom: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E91E63',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E91E63',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 32,
    marginTop: 8,
  },
  customInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#E91E63',
    width: 40,
    fontSize: 16,
    padding: 4,
    marginRight: 8,
    textAlign: 'center',
  },
  customInputLabel: {
    fontSize: 16,
    color: '#666',
  },
  popupButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  popupButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  popupButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  popupButtonPrimary: {
    backgroundColor: 'transparent',
  },
  popupButtonTextPrimary: {
    color: '#E91E63',
  },
  sortingModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sortingModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  sortingModalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  sortingModalContent: {
    flex: 1,
  },
  sortingSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sortingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sortingSectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 12,
  },
  sortingSectionTitle: {
    fontSize: 16,
    color: '#000',
  },
  sortingOptions: {
    backgroundColor: '#fff',
    padding: 16,
  },
  sortingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  selectedSortingOption: {
    backgroundColor: '#F5F5F5',
  },
  sortingOptionText: {
    fontSize: 16,
    color: '#000',
  },
  sortingOptionSubtext: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  closeButtonText: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: '500',
  },
  emptyChecklist: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChecklistText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default DailyPlan; 