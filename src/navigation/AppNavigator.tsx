import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Welcome from '../screens/welcome/Welcome';
import Home from '../screens/home/Home';
import DailyPlan from '../screens/goals/DailyPlan';
import SelectCategory from '../screens/goals/SelectCategory';
import LongTermGoal from '../screens/goals/LongTermGoal';
import RecurringGoal from '../screens/goals/RecurringGoal';
import CustomGoal from '../screens/goals/CustomGoal';
import EvaluateProgress from '../screens/goals/longterm/EvaluateProgress';
import DefineHabit from '../screens/goals/longterm/DefineHabit';
import HabitFrequency from '../screens/goals/longterm/HabitFrequency';
import Login from '../screens/auth/Login';
import Signup from '../screens/auth/Signup';
import GenderSelect from '../screens/auth/GenderSelect';
import AddRecurringGoal from '../screens/goals/AddRecurringGoal';
import DefineTask from '../screens/goals/DefineTask';
import SelectUnit from '../screens/goals/SelectUnit';
import DailyPlanEvaluation from '../screens/goals/DailyPlanEvaluation';
import DailyPlanDefine from '../screens/goals/DailyPlanDefine';
import DailyPlanSchedule from '../screens/goals/DailyPlanSchedule';
import DailyPlanFrequency from '../screens/goals/DailyPlanFrequency';
// import DailyPlanConfirmation from '../screens/goals/DailyPlanConfirmation';
import SavedGoalsScreen from '../screens/goals/SavedGoalsScreen';
import DailyPlanDefineTask from '../screens/goals/DailyPlanDefineTask';
import Checklist from '../screens/goals/Checklist';
import DailyPlanNumericValue from '../screens/goals/DailyPlanNumericValue';
import DailyPlanTimer from '../screens/goals/DailyPlanTimer';
import PomodoroTimer from '../screens/goals/PomodoroTimer';

export type Goal = {
  id: string;
  title: string;
  type: 'Long Term Goal' | 'Recurring Goal' | 'Daily Goal';
  description?: string;
  progress?: number;
  dueDate?: string;
};

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  GenderSelect: undefined;
  Welcome: { gender: 'male' | 'female' };
  Home: { gender: 'male' | 'female' };
  AddRecurringGoal: {
    gender: 'male' | 'female';
    category?: string;
    taskType: 'recurring';
    goalTitle?: string;
    isFromAdd?: boolean;
    evaluationType?: string;
  };
  DailyPlan: {
    gender: 'male' | 'female';
    taskType: 'daily';
    refreshTasks?: boolean;
    completedTaskId?: string;
  };
  SelectCategory: { 
    taskType: 'long-term' | 'recurring' | 'daily' | 'custom'; 
    gender: 'male' | 'female';
    goalTitle?: string;
    isFromAdd?: boolean;
    isFromDailyPlan?: boolean;
    selectedOption?: string;
  };
  LongTermGoal: { 
    category: string; 
    gender: 'male' | 'female';
    taskType: 'long-term';
  };
  RecurringGoal: {
    taskType: 'recurring';
    gender: 'male' | 'female';
    goalTitle: string;
    category?: string;
    selectedUnit?: string;
    target?: string;
    checklist?: {
      items: Array<{ id: string; text: string; completed: boolean }>;
      successCondition: 'all' | 'custom';
      customCount?: number;
      note: string;
    };
    linkedGoal?: Goal;
    evaluationType?: string;
  };
  CustomGoal: { 
    category: string; 
    gender: 'male' | 'female';
    taskType: 'custom';
  };
  EvaluateProgress: { 
    category: string; 
    taskType: 'long-term' | 'recurring' | 'daily' | 'custom'; 
    gender: 'male' | 'female' 
  };
  DefineHabit: {
    category: string;
    taskType: string;
    evaluationType: string;
  };
  HabitFrequency: {
    category: string;
    taskType: string;
    evaluationType: string;
    habit: string;
    description?: string;
  };
  DefineTask: {
    taskType: 'recurring' | 'daily' | 'long-term' | 'custom';
    gender: 'male' | 'female';
    goalTitle: string;
    category?: string;
    existingChecklist?: {
      items: Array<{ id: string; text: string; completed: boolean }>;
      successCondition: 'all' | 'custom';
      customCount?: number;
      note: string;
    };
    blockTime?: {
      startTime: {
        hour: number;
        minute: number;
        period: 'AM' | 'PM';
      },
      endTime: {
        hour: number;
        minute: number;
        period: 'AM' | 'PM';
      };
    };
  };
  SelectUnit: {
    gender?: 'male' | 'female';
    goalTitle?: string;
    category?: string;
    target?: string;
    evaluationType?: string;
    blockTime?: {
      startTime: {
        hour: number;
        minute: number;
        period: 'AM' | 'PM';
      },
      endTime: {
        hour: number;
        minute: number;
        period: 'AM' | 'PM';
      };
    };
  };
  SavedGoals: undefined;
  DailyPlanEvaluation: {
    category: string;
    taskType: string;
    gender: 'male' | 'female';
    selectedOption: string;
  };
  DailyPlanDefine: {
    category: string;
    taskType: string;
    gender: 'male' | 'female';
    evaluationType: string;
    selectedOption: string;
    checklist?: {
      items: Array<{ id: string; text: string; completed: boolean }>;
      successCondition: 'all' | 'custom';
      customCount?: number;
      note: string;
    };
    checklist_items?: Array<{ id: string; text: string; completed: boolean }>;
  };
  DailyPlanSchedule: {
    category: string;
    taskType: string;
    gender: 'male' | 'female';
    evaluationType: string;
    habit: string;
    description: string;
    selectedOption: string;
    frequency: 'every-day' | 'specific-days-week' | 'specific-days-month' | 'specific-days-year' | 'some-days-period' | 'repeat';
    selectedDays?: string[];
    isFlexible: boolean;
    checklist_items?: Array<{ id: string; text: string; completed: boolean }>;
    numeric_value: number;
    numeric_condition: string;
    numeric_unit: string;
  };
  DailyPlanFrequency: {
    category: string;
    taskType: string;
    gender: 'male' | 'female';
    evaluationType: string;
    habit: string;
    description: string;
    selectedOption: string;
    checklist_items?: Array<{ id: string; text: string; completed: boolean }>;
    numeric_value: number;
    numeric_condition: string;
    numeric_unit: string;
  };
  DailyPlanConfirmation: {
    category: string;
    taskType: string;
    gender: 'male' | 'female';
    evaluationType: string;
    habit: string;
    description: string;
    frequency: 'every-day' | 'specific-days-week' | 'specific-days-month' | 'specific-days-year' | 'some-days-period' | 'repeat';
    selectedDays?: string[];
    isFlexible: boolean;
    startDate: string;
    endDate: string;
    timeAndReminders: number;
    priority: string;
    blockTime: number;
    pomodoro: number;
  };
  DailyPlanDefineTask: {
    category: string;
    taskType: string;
    gender: 'male' | 'female';
    evaluationType: string;
    selectedOption: string;
    checklist?: {
      items: Array<{ id: string; text: string; completed: boolean }>;
      successCondition: 'all' | 'custom';
      customCount?: number;
      note: string;
    };
  };
  Checklist: {
    items: Array<{
      id: string;
      text: string;
      completed: boolean;
    }>;
    successCondition: 'all' | 'custom';
    customCount: number;
    note: string;
    selectedOption?: string;
    category?: string;
    taskType?: string;
    gender?: 'male' | 'female';
    evaluationType?: string;
    goalTitle?: string;
    existingChecklist?: {
      items: Array<{ id: string; text: string; completed: boolean }>;
      successCondition: 'all' | 'custom';
      customCount?: number;
      note: string;
    };
  };
  DailyPlanNumericValue: {
    category: string;
    taskType: string;
    gender: 'male' | 'female';
    selectedOption: string;
    habit?: string;
    description?: string;
    evaluationType?: string;
  };
  DailyPlanTimer: {
    category: string;
    taskType: string;
    gender: 'male' | 'female';
    selectedOption: string;
    timeValue?: string;
    evaluationType?: string;
  };
  PomodoroTimer: {
    duration: number;
    title: string;
    itemId: string;
    taskId: string;
    taskType: string;
    checklist: boolean;
    onComplete: () => void;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="GenderSelect" component={GenderSelect} />
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="AddRecurringGoal" component={AddRecurringGoal} />
        <Stack.Screen name="DailyPlan" component={DailyPlan} />
        <Stack.Screen name="SelectCategory" component={SelectCategory} />
        <Stack.Screen name="LongTermGoal" component={LongTermGoal} />
        <Stack.Screen name="RecurringGoal" component={RecurringGoal} />
        <Stack.Screen name="CustomGoal" component={CustomGoal} />
        <Stack.Screen name="EvaluateProgress" component={EvaluateProgress} />
        <Stack.Screen name="DefineHabit" component={DefineHabit} />
        <Stack.Screen name="HabitFrequency" component={HabitFrequency} />
        <Stack.Screen name="DefineTask" component={DefineTask} />
        <Stack.Screen name="SelectUnit" component={SelectUnit} />
        <Stack.Screen name="SavedGoals" component={SavedGoalsScreen} />
        <Stack.Screen name="DailyPlanEvaluation" component={DailyPlanEvaluation} />
        <Stack.Screen name="DailyPlanDefine" component={DailyPlanDefine} />
        <Stack.Screen name="DailyPlanNumericValue" component={DailyPlanNumericValue} />
        <Stack.Screen name="DailyPlanSchedule" component={DailyPlanSchedule} />
        <Stack.Screen name="DailyPlanFrequency" component={DailyPlanFrequency} />
        {/* <Stack.Screen name="DailyPlanConfirmation" component={DailyPlanConfirmation} /> */}
        <Stack.Screen name="DailyPlanDefineTask" component={DailyPlanDefineTask} />
        <Stack.Screen
          name="Checklist"
          component={Checklist}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="DailyPlanTimer" component={DailyPlanTimer} />
        <Stack.Screen name="PomodoroTimer" component={PomodoroTimer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 