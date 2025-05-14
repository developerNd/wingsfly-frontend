import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  Animated,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  Image,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  updateTaskCompletionStatus,
  updateDailyPlanChecklistItem
} from '../../services/api';
import { saveTempGoalData, getTempGoalData, clearTempGoalData, hasTempGoalData } from '../../services/tempGoalStorage';
import { format } from 'date-fns';
import { Svg, Path, G, Defs, ClipPath, Rect, Filter, FeFlood, FeColorMatrix, FeOffset, FeGaussianBlur, FeComposite, FeBlend } from 'react-native-svg';
import { login, getStoredGender, logout } from '../../services/api';
// SVG Icons mapping for consistent usage
const ICONS = {
  // Navigation icons
  home: 'home',
  saved: 'favorite-border',
  cart: 'shopping-cart',
  profile: 'person',
  
  // Header icons
  search: 'search',
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
<path d="M6 1V5M12 1V5" stroke="#4F4F4F" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.2222 3H2.77778C1.79594 3 1 3.74619 1 4.66667V16.3333C1 17.2538 1.79594 18 2.77778 18H15.2222C16.2041 18 17 17.2538 17 16.3333V4.66667C17 3.74619 16.2041 3 15.2222 3Z" stroke="#4F4F4F" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1 7H17M5.44444 10.5H5.45333M9 10.5H9.00889M12.5556 10.5H12.5644M5.44444 14H5.45333M9 14H9.00889M12.5556 14H12.5644" stroke="#4F4F4F" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
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
  logout: 'logout',
  lock: 'lock',
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
<Path d="M20 9L15.7143 14L14 12" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</Svg>
  );
};
const TASK_TYPES = ['habit', 'recurring', 'task', 'goal-of-the-day', 'long-term', 'daily', 'custom'] as const;
type TaskType = typeof TASK_TYPES[number];



interface Goal {
  id: string;
  title?: string;
  habit?: string;
  type: 'Long Term Goal' | 'Recurring Goal' | 'Daily Goal';
  description?: string;
  progress?: number;
  dueDate?: string;
  start_date?: string;
  end_date?: string;
  evaluation_type?: string;
  isCompleted?: boolean;
  block_time?: {
    start_time: string;
    end_time: string;
  };
  checklist?: {
    items: {
      id: string;
      text: string;
      completed: boolean;
      evaluationType?: 'yesno' | 'timer';
      duration?: {
        hours: number;
        minutes: number;
      };
      usePomodoro?: boolean;
    }[];
    successCondition: string;
    note: string | null;
  };
  category?: string;
  task_type?: string;
  gender?: string;
  frequency?: string;
  selected_days?: any[];
  is_flexible?: boolean;
  duration?: number;
  priority?: string;
  pomodoro?: number;
  checklist_items?: {
    id: string;
    text: string;
    completed: boolean;
    evaluationType?: 'yesno' | 'timer';
    duration?: {
      hours: number;
      minutes: number;
    };
    usePomodoro?: boolean;
  }[];
  numeric_value?: string;
  numeric_condition?: string;
  numeric_unit?: string;
}

interface Task {
  id: number;
  title: string;
  time: string | undefined;
  date: string;
  rawDate: string; // Add this for date filtering
  type: TaskType;
  task_type: string;
  priority: 'Must' | 'Important';
  isCompleted: boolean;
  hasReminder: boolean;
  color: string;
  icon: string;
  rightIcon: string;
  linkedGoal?: Goal;
}


// Add back the RootStackParamList type
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
  Login: undefined;
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

// Add a custom FlagIcon component
const FlagIcon = () => (
  <Svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <G clipPath="url(#clip0_1054_2420)">
      <G>
        <Path d="M2.0835 9.16665V5.83331M2.0835 5.83331V1.66665M2.0835 5.83331L3.11266 5.62748C3.80051 5.49042 4.51334 5.55584 5.16475 5.81581C5.87043 6.09791 6.64704 6.15054 7.38433 5.96623L7.4735 5.94415C7.6001 5.91255 7.7125 5.83953 7.79283 5.7367C7.87317 5.63387 7.91681 5.50713 7.91683 5.37665V2.30706C7.9168 2.23113 7.89948 2.1562 7.86618 2.08797C7.83288 2.01973 7.78448 1.95997 7.72464 1.91322C7.6648 1.86648 7.59511 1.83397 7.52084 1.81818C7.44657 1.80239 7.36968 1.80371 7.296 1.82206C6.61624 1.99188 5.90025 1.94319 5.24975 1.6829L5.16475 1.64915C4.51347 1.38925 3.80079 1.32383 3.11308 1.46081L2.0835 1.66665M2.0835 1.66665V0.833313" stroke="#AF0000" strokeWidth="0.7" strokeLinecap="round" />
      </G>
    </G>
    <Defs>
      <ClipPath id="clip0_1054_2420">
        <Rect width="10" height="10" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

// Checklist icon
const ChecklistIcon = () => (
  <Svg width="14" height="10" viewBox="0 0 14 10" fill="none">
    <Path d="M2.06667 7.89231L4.43333 5.52564C4.56667 5.39231 4.72222 5.32831 4.9 5.33364C5.07778 5.33897 5.23333 5.40853 5.36667 5.54231C5.48889 5.67564 5.55 5.8312 5.55 6.00898C5.55 6.18675 5.48889 6.34231 5.36667 6.47564L2.55 9.30897C2.41667 9.44231 2.26111 9.50898 2.08333 9.50898C1.90556 9.50898 1.75 9.44231 1.61667 9.30897L0.183333 7.87564C0.0611112 7.75342 0 7.59786 0 7.40897C0 7.22009 0.0611112 7.06453 0.183333 6.94231C0.305556 6.82009 0.461111 6.75898 0.65 6.75898C0.838889 6.75898 0.994444 6.82009 1.11667 6.94231L2.06667 7.89231ZM2.06667 2.55897L4.43333 0.192308C4.56667 0.0589744 4.72222 -0.00502564 4.9 0.000307692C5.07778 0.00564103 5.23333 0.0751967 5.36667 0.208975C5.48889 0.342308 5.55 0.497863 5.55 0.675641C5.55 0.853419 5.48889 1.00897 5.36667 1.14231L2.55 3.97564C2.41667 4.10897 2.26111 4.17564 2.08333 4.17564C1.90556 4.17564 1.75 4.10897 1.61667 3.97564L0.183333 2.54231C0.0611112 2.42009 0 2.26453 0 2.07564C0 1.88675 0.0611112 1.7312 0.183333 1.60897C0.305556 1.48675 0.461111 1.42564 0.65 1.42564C0.838889 1.42564 0.994444 1.48675 1.11667 1.60897L2.06667 2.55897ZM7.71667 8.44231C7.52778 8.44231 7.36956 8.37831 7.242 8.25031C7.11444 8.12231 7.05044 7.96409 7.05 7.77564C7.04956 7.5872 7.11356 7.42897 7.242 7.30097C7.37044 7.17297 7.52867 7.10897 7.71667 7.10897H12.3833C12.5722 7.10897 12.7307 7.17297 12.8587 7.30097C12.9867 7.42897 13.0504 7.5872 13.05 7.77564C13.0496 7.96409 12.9856 8.12253 12.858 8.25097C12.7304 8.37942 12.5722 8.4432 12.3833 8.44231H7.71667ZM7.71667 3.10897C7.52778 3.10897 7.36956 3.04497 7.242 2.91697C7.11444 2.78897 7.05044 2.63075 7.05 2.44231C7.04956 2.25386 7.11356 2.09564 7.242 1.96764C7.37044 1.83964 7.52867 1.77564 7.71667 1.77564H12.3833C12.5722 1.77564 12.7307 1.83964 12.8587 1.96764C12.9867 2.09564 13.0504 2.25386 13.05 2.44231C13.0496 2.63075 12.9856 2.7892 12.858 2.91764C12.7304 3.04609 12.5722 3.10986 12.3833 3.10897H7.71667Z" fill="black"/>
  </Svg>
);

// Timer icon
const TimerIcon = () => (
  <Svg  width="24" height="24" viewBox="0 0 24 24" fill="none">
  <Rect x="8.99951" y="5" width="10" height="14" fill="black"/>
  <Path d="M11.9995 0C10.4236 0 8.86322 0.310389 7.40731 0.913446C5.9514 1.5165 4.62853 2.40042 3.51423 3.51472C1.26379 5.76516 -0.000488281 8.8174 -0.000488281 12C-0.000488281 15.1826 1.26379 18.2348 3.51423 20.4853C4.62853 21.5996 5.9514 22.4835 7.40731 23.0866C8.86322 23.6896 10.4236 24 11.9995 24C15.1821 24 18.2344 22.7357 20.4848 20.4853C22.7352 18.2348 23.9995 15.1826 23.9995 12C23.9995 10.4241 23.6891 8.86371 23.0861 7.4078C22.483 5.95189 21.5991 4.62902 20.4848 3.51472C19.3705 2.40042 18.0476 1.5165 16.5917 0.913446C15.1358 0.310389 13.5754 0 11.9995 0ZM17.0395 17.04L10.7995 13.2V6H12.5995V12.24L17.9995 15.48L17.0395 17.04Z" fill="#E7E7E7"/>
  </Svg>
);

// Numeric icon
const NumericIcon = () => (
  <Svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <Path d="M5 6.1875C5 6.36984 4.92098 6.5447 4.78033 6.67364C4.63968 6.80257 4.44891 6.875 4.25 6.875C4.05109 6.875 3.86032 6.80257 3.71967 6.67364C3.57902 6.5447 3.5 6.36984 3.5 6.1875C3.5 6.00516 3.57902 5.8303 3.71967 5.70136C3.86032 5.57243 4.05109 5.5 4.25 5.5C4.44891 5.5 4.63968 5.57243 4.78033 5.70136C4.92098 5.8303 5 6.00516 5 6.1875ZM5 8.25C5 8.43234 4.92098 8.6072 4.78033 8.73614C4.63968 8.86507 4.44891 8.9375 4.25 8.9375C4.05109 8.9375 3.86032 8.86507 3.71967 8.73614C3.57902 8.6072 3.5 8.43234 3.5 8.25C3.5 8.06766 3.57902 7.8928 3.71967 7.76386C3.86032 7.63493 4.05109 7.5625 4.25 7.5625C4.44891 7.5625 4.63968 7.63493 4.78033 7.76386C4.92098 7.8928 5 8.06766 5 8.25ZM8.75 6.875C8.94891 6.875 9.13968 6.80257 9.28033 6.67364C9.42098 6.5447 9.5 6.36984 9.5 6.1875C9.5 6.00516 9.42098 5.8303 9.28033 5.70136C9.13968 5.57243 8.94891 5.5 8.75 5.5C8.55109 5.5 8.36032 5.57243 8.21967 5.70136C8.07902 5.8303 8 6.00516 8 6.1875C8 6.36984 8.07902 6.5447 8.21967 6.67364C8.36032 6.80257 8.55109 6.875 8.75 6.875ZM9.5 8.25C9.5 8.43234 9.42098 8.6072 9.28033 8.73614C9.13968 8.86507 8.94891 8.9375 8.75 8.9375C8.55109 8.9375 8.36032 8.86507 8.21967 8.73614C8.07902 8.6072 8 8.43234 8 8.25C8 8.06766 8.07902 7.8928 8.21967 7.76386C8.36032 7.63493 8.55109 7.5625 8.75 7.5625C8.94891 7.5625 9.13968 7.63493 9.28033 7.76386C9.42098 7.8928 9.5 8.06766 9.5 8.25ZM6.5 6.875C6.69891 6.875 6.88968 6.80257 7.03033 6.67364C7.17098 6.5447 7.25 6.36984 7.25 6.1875C7.25 6.00516 7.17098 5.8303 7.03033 5.70136C6.88968 5.57243 6.69891 5.5 6.5 5.5C6.30109 5.5 6.11032 5.57243 5.96967 5.70136C5.82902 5.8303 5.75 6.00516 5.75 6.1875C5.75 6.36984 5.82902 6.5447 5.96967 6.67364C6.11032 6.80257 6.30109 6.875 6.5 6.875ZM7.25 8.25C7.25 8.43234 7.17098 8.6072 7.03033 8.73614C6.88968 8.86507 6.69891 8.9375 6.5 8.9375C6.30109 8.9375 6.11032 8.86507 5.96967 8.73614C5.82902 8.6072 5.75 8.43234 5.75 8.25C5.75 8.06766 5.82902 7.8928 5.96967 7.76386C6.11032 7.63493 6.30109 7.5625 6.5 7.5625C6.69891 7.5625 6.88968 7.63493 7.03033 7.76386C7.17098 7.8928 7.25 8.06766 7.25 8.25ZM4.625 1.375C4.32663 1.375 4.04048 1.48365 3.8295 1.67705C3.61853 1.87044 3.5 2.13275 3.5 2.40625V3.09375C3.5 3.36725 3.61853 3.62956 3.8295 3.82295C4.04048 4.01635 4.32663 4.125 4.625 4.125H8.375C8.67337 4.125 8.95952 4.01635 9.1705 3.82295C9.38147 3.62956 9.5 3.36725 9.5 3.09375V2.40625C9.5 2.13275 9.38147 1.87044 9.1705 1.67705C8.95952 1.48365 8.67337 1.375 8.375 1.375H4.625ZM4.25 2.40625C4.25 2.31508 4.28951 2.22765 4.35984 2.16318C4.43016 2.09872 4.52554 2.0625 4.625 2.0625H8.375C8.47446 2.0625 8.56984 2.09872 8.64017 2.16318C8.71049 2.22765 8.75 2.31508 8.75 2.40625V3.09375C8.75 3.18492 8.71049 3.27235 8.64017 3.33682C8.56984 3.40128 8.47446 3.4375 8.375 3.4375H4.625C4.52554 3.4375 4.43016 3.40128 4.35984 3.33682C4.28951 3.27235 4.25 3.18492 4.25 3.09375V2.40625ZM11 9.28125C11 9.73709 10.8025 10.1743 10.4508 10.4966C10.0992 10.8189 9.62228 11 9.125 11H3.875C3.37772 11 2.90081 10.8189 2.54917 10.4966C2.19754 10.1743 2 9.73709 2 9.28125V1.71875C2 1.26291 2.19754 0.825738 2.54917 0.50341C2.90081 0.181082 3.37772 0 3.875 0H9.125C9.62228 0 10.0992 0.181082 10.4508 0.50341C10.8025 0.825738 11 1.26291 11 1.71875V9.28125ZM10.25 1.71875C10.25 1.44525 10.1315 1.18294 9.9205 0.989546C9.70952 0.796149 9.42337 0.6875 9.125 0.6875H3.875C3.57663 0.6875 3.29048 0.796149 3.0795 0.989546C2.86853 1.18294 2.75 1.44525 2.75 1.71875V9.28125C2.75 9.55475 2.86853 9.81706 3.0795 10.0105C3.29048 10.2038 3.57663 10.3125 3.875 10.3125H9.125C9.42337 10.3125 9.70952 10.2038 9.9205 10.0105C10.1315 9.81706 10.25 9.55475 10.25 9.28125V1.71875Z" fill="black"/>
  </Svg>
);

// Completed icon
const CompletedIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path d="M2.75 8.75L6.25 12.25L13.25 4.75" stroke="#018B5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const DailyPlan = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'DailyPlan'>>();
  
  // Get today's date information
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Calculate dates for the last 30 days and next 30 days
  const getDatesForSixtyDays = () => {
    const dates = [];
    const days = [];
    const dateStrings = []; // Store full date strings for API calls
    
    // Previous 30 days
    for (let i = 30; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(format(date, 'dd')); // Display format
      days.push(format(date, 'EEE')); // Day names
      dateStrings.push(format(date, 'yyyy-MM-dd')); // API format
    }
    
    // Today
    const today = new Date();
    dates.push(format(today, 'dd'));
    days.push(format(today, 'EEE'));
    dateStrings.push(format(today, 'yyyy-MM-dd'));
    
    // Next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(format(date, 'dd'));
      days.push(format(date, 'EEE'));
      dateStrings.push(format(date, 'yyyy-MM-dd'));
    }
    
    return { dates, days, dateStrings };
  };

  const { dates, days, dateStrings } = getDatesForSixtyDays();
  
  // Initialize selectedDate with today's date
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'dd'));
  const [selectedDateString, setSelectedDateString] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Add ref for scroll view to scroll to center on mount
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  // Function to scroll to today's date (center)
  const scrollToToday = () => {
    if (scrollViewRef.current) {
      // Calculate the center position (30 items before today)
      const itemWidth = 55; // dateItem width (45) + marginRight (10)
      const centerPosition = 30 * itemWidth;
      scrollViewRef.current.scrollTo({ x: centerPosition, animated: false });
    }
  };

  // Scroll to today when component mounts
  useEffect(() => {
    scrollToToday();
  }, []);

  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // State for goals and loading
  const [savedGoals, setSavedGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch goals for selected date
  const fetchGoalsForDate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the stored date string directly
      const formattedDate = selectedDateString;
      
      // Fetch goals for the selected date
      const [recurringGoalsResponse, dailyPlanResponse] = await Promise.all([
        getRecurringGoals({
          date: formattedDate,
          includeFlexible: true,
          includeRepetitive: true
        }),
        getDailyPlans({
          date: formattedDate
        })
      ]);
      
      // Map the responses to goals
      const allGoals: Goal[] = [
        ...((recurringGoalsResponse?.data?.data || []).map((goal: any) => ({
          ...goal,
          type: 'Recurring Goal' as const,
          block_time: goal.block_time,
          end_date: goal.end_date,
          isCompleted: goal.isCompleted === 1
        }))),
        ...((dailyPlanResponse?.data?.data || []).map((goal: any) => ({
          id: goal.id,
          title: goal.habit,
          description: goal.description,
          dueDate: goal.start_date,
          type: 'Daily Goal' as const,
          isCompleted: goal.isCompleted === true,
          block_time: goal.block_time,
          end_date: goal.end_date,
          category: goal.category,
          task_type: goal.task_type,
          gender: goal.gender,
          evaluation_type: goal.evaluation_type,
          frequency: goal.frequency,
          selected_days: goal.selected_days,
          is_flexible: goal.is_flexible,
          duration: goal.duration,
          priority: goal.priority,
          pomodoro: goal.pomodoro,
          checklist_items: goal.checklist_items,
          numeric_value: goal.numeric_value,
          numeric_condition: goal.numeric_condition,
          numeric_unit: goal.numeric_unit
        })))
      ];
      
      setSavedGoals(allGoals);
    } catch (err: any) {
      console.error('Error fetching goals:', err);
      setError('Failed to load goals. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add effect to handle task refresh
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const params = route.params as { refreshTasks?: boolean; completedTaskId?: string };
      if (params?.refreshTasks) {
        // Refresh the tasks list
        fetchGoalsForDate();
        
        // If we have a completedTaskId, update the UI optimistically
        if (params.completedTaskId) {
          setTasks(prevTasks => 
            prevTasks.map(task => {
              if (task.linkedGoal?.id === params.completedTaskId) {
                return {
                  ...task,
                  isCompleted: true,
                  rightIcon: ICONS.checkCircle
                };
              }
              return task;
            })
          );
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigation, route.params, fetchGoalsForDate]);

  // Initial fetch and date change effect
  useEffect(() => {
    fetchGoalsForDate();
  }, [selectedDate]); // Re-fetch when selected date changes

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
  const [isTaskOptionsVisible, setIsTaskOptionsVisible] = useState(false);
  const [selectedTaskForOptions, setSelectedTaskForOptions] = useState<Task | null>(null);
  const taskOptionsSlideAnim = React.useRef(new Animated.Value(0)).current;
  const [isChecklistVisible, setIsChecklistVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Goal | null>(null);
  
  // Add state for numeric input modal
  const [isNumericInputModalVisible, setIsNumericInputModalVisible] = useState(false);
  const [numericInputValue, setNumericInputValue] = useState('');
  const [selectedNumericTask, setSelectedNumericTask] = useState<Task | null>(null);
  
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



  // Function to handle navigation to SelectCategory
  const handleNavigateToSelectCategory = (taskType: 'habit' | 'recurring' | 'task' | 'goal-of-the-day' | 'long-term' | 'daily' | 'custom' | 'recurringTask') => {
    handleSaveTempData({ taskType });
    navigation.navigate('SelectCategory', {
      taskType,
      gender: 'male', // This should be dynamic based on user data
      isFromAdd: true,
      isFromDailyPlan: true
    });
  };

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
      const priority = goal.priority === 'Must' ? 'Must' as const : 'Important' as const;
      const color = goal.type === 'Daily Goal' ? '#8FB681' : 
                   goal.type === 'Recurring Goal' ? '#464DB0' : '#FF9F43';
      
      // Check completion status
      let isCompleted = false;
      if (goal.evaluation_type === 'checklist' && goal.checklist_items) {
        const completedItemsCount = goal.checklist_items.filter(item => item.completed).length;
        isCompleted = completedItemsCount === goal.checklist_items.length;
      } else if (goal.type === 'Daily Goal') {
        isCompleted = goal.isCompleted || false;
      }
      
      // Determine right icon
      const rightIcon = isCompleted ? ICONS.checkCircle :
                       taskType === 'recurring' ? ICONS.arrowRight :
                       goal.evaluation_type === 'yesno' ? ICONS.add :
                       goal.evaluation_type === 'Count' ? ICONS.repeat :
                       ICONS.alarm;

      // Format block time
      let formattedTime = '';
      if (goal.block_time) {
        if (typeof goal.block_time.start_time === 'object' && goal.block_time.start_time !== null) {
          const startTime = goal.block_time.start_time as { hour: number; minute: number; period: string };
          formattedTime = `${startTime.hour}:${String(startTime.minute).padStart(2, '0')} ${startTime.period}`;
        } else {
          formattedTime = String(goal.block_time.start_time);
        }
      }

      return {
        id: index + 1,
        title: goal.title || goal.habit,
        time: formattedTime,
        date: displayDate,
        rawDate: rawDate || '',
        type: taskType,
        task_type: goal.task_type,
        priority: priority,
        isCompleted: isCompleted,
        hasReminder: false,
        color: color,
        icon: ICONS.grid,
        rightIcon: rightIcon,
        linkedGoal: {
          ...goal,
          checklist: goal.checklist_items ? {
            items: goal.checklist_items.map(item => ({
              ...item,
              evaluationType: item.evaluationType || 'yesno',
              duration: item.duration,
              usePomodoro: item.usePomodoro
            })),
            successCondition: 'all',
            note: null
          } : undefined
        }
      } as Task;
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
    const taskTypeMap: Record<string, 'habit' | 'recurring' | 'task' | 'goal-of-the-day' | 'long-term' | 'daily' | 'custom' | 'recurringTask'> = {
      'Habit': 'habit',
      'Recurring Goal': 'recurring',
      'Task': 'task',
      'Goal of the Day': 'goal-of-the-day',
      'Long Term Goal': 'long-term',
      'Daily Goal': 'daily',
      'Custom Goal': 'custom',
      'Recurring Task': 'recurringTask'
    };
    
    const taskType = taskTypeMap[option.title] || 'task';
    handleNavigateToSelectCategory(taskType as 'habit' | 'recurring' | 'task' | 'goal-of-the-day' | 'long-term' | 'daily' | 'custom'| 'recurringTask');
  };

  const navigateToSavedGoals = () => {
    navigation.navigate('SavedGoals');
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

    const item = selectedRecurringTask.linkedGoal.checklist.items.find(i => i.id === itemId);
    if (!item) return;

    // If the item has timer evaluation type, navigate to PomodoroTimer
    if (item.evaluationType === 'timer') {
      console.log('🔍 item', item);
      const duration = (item.duration?.hours || 0) * 60 + (item.duration?.minutes || 0);
      console.log('🔍 duration', duration);
      navigation.navigate('PomodoroTimer', {
        duration: duration,
        title: item.text,
        itemId: item.id.toString(),
        taskId: selectedRecurringTask.linkedGoal.id.toString(),
        taskType: selectedRecurringTask.linkedGoal.type,
        checklist: false,
        onComplete: () => {
          // Update the UI optimistically
          setTasks(prevTasks => 
            prevTasks.map(task => {
              if (task.id === selectedRecurringTask.id && task.linkedGoal?.checklist?.items) {
                const updatedItems = task.linkedGoal.checklist.items.map(item => 
                  item.id === itemId ? { ...item, completed: true } : item
                );
                return {
                  ...task,
                  linkedGoal: {
                    ...task.linkedGoal,
                    checklist: {
                      ...task.linkedGoal.checklist,
                      items: updatedItems
                    }
                  }
                };
              }
              return task;
            })
          );
        }
      });
      return;
    }

    // For non-timer items, toggle completion as before
    const newCompletedState = !item.completed;
    
    try {
      // Update the UI optimistically
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === selectedRecurringTask.id && task.linkedGoal?.checklist?.items) {
            // Update the items first
            const updatedItems = task.linkedGoal.checklist.items.map(item => 
              item.id === itemId ? { ...item, completed: newCompletedState } : item
            );

            // Calculate if task should be marked as completed based on goal type
            let isTaskCompleted = false;
            if (task.linkedGoal.type === 'Recurring Goal' && task.linkedGoal.checklist?.successCondition) {
              const completedItemsCount = updatedItems.filter(item => item.completed).length;
              isTaskCompleted = task.linkedGoal.checklist.successCondition === 'all'
                ? completedItemsCount === updatedItems.length
                : completedItemsCount >= Number(task.linkedGoal.checklist.successCondition);
            } else if (task.linkedGoal.type === 'Daily Goal') {
              const completedItemsCount = updatedItems.filter(item => item.completed).length;
              isTaskCompleted = completedItemsCount === updatedItems.length;
            }

            console.log('Success check:', {
              goalType: task.linkedGoal.type,
              completedCount: updatedItems.filter(item => item.completed).length,
              totalItems: updatedItems.length,
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

      // Make API call based on goal type
      if (selectedRecurringTask.linkedGoal.type === 'Daily Goal') {
        await updateDailyPlanChecklistItem(selectedRecurringTask.linkedGoal.id, itemId, newCompletedState);
      } else {
        await updateChecklistItem(selectedRecurringTask.linkedGoal.id, itemId, newCompletedState);
      }
      
      // Update the selectedRecurringTask state to reflect the change
      setSelectedRecurringTask(prevTask => {
        if (!prevTask?.linkedGoal?.checklist?.items) return prevTask;
        
        // Update the items first
        const updatedItems = prevTask.linkedGoal.checklist.items.map(item => 
          item.id === itemId ? { ...item, completed: newCompletedState } : item
        );

        // Calculate if task should be marked as completed based on goal type
        let isTaskCompleted = false;
        if (prevTask.linkedGoal.type === 'Recurring Goal' && prevTask.linkedGoal.checklist?.successCondition) {
          const completedItemsCount = updatedItems.filter(item => item.completed).length;
          isTaskCompleted = prevTask.linkedGoal.checklist.successCondition === 'all'
            ? completedItemsCount === updatedItems.length
            : completedItemsCount >= Number(prevTask.linkedGoal.checklist.successCondition);
        } else if (prevTask.linkedGoal.type === 'Daily Goal') {
          const completedItemsCount = updatedItems.filter(item => item.completed).length;
          isTaskCompleted = completedItemsCount === updatedItems.length;
        }

        return {
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
    console.log('Handling task completion for:', task);
    
    // Check if the selected date is in the future
    if (isSelectedDateInFuture()) {
      Alert.alert('Cannot Update', 'You cannot update tasks for future dates.');
      return;
    }
    
    // If task has a linked goal, handle based on goal type and evaluation_type
    if (task.linkedGoal) {
      const goal = task.linkedGoal;
      
      // Handle checklist type goals
      if (goal.evaluation_type === 'checklist') {
        // If there are checklist items, show the drawer
        if (goal.checklist_items && goal.checklist_items.length > 0) {
          showRecurringDrawer(task);
          return;
        }
        
        // If no checklist items, treat it as a simple yes/no task
        const newCompletedState = !task.isCompleted;
        try {
          // Optimistically update UI
          setTasks(prevTasks => 
            prevTasks.map(t => 
              t.id === task.id 
                ? { 
                    ...t, 
                    isCompleted: newCompletedState,
                    rightIcon: newCompletedState ? ICONS.checkCircle : ICONS.arrowRight
                  } 
                : t
            )
          );

          // Make API call to update task completion status
          await updateTaskCompletionStatus(goal.id.toString(), newCompletedState);
        } catch (error) {
          console.error('Error updating task completion:', error);
          // Revert optimistic update on error
          setTasks(prevTasks =>
            prevTasks.map(t =>
              t.id === task.id
                ? {
                    ...t,
                    isCompleted: !newCompletedState,
                    rightIcon: !newCompletedState ? ICONS.checkCircle : ICONS.arrowRight
                  }
                : t
            )
          );
          Alert.alert('Error', 'Failed to update task completion status. Please try again.');
        }
        return;
      }
      
      // Handle numeric type goals
      if (goal.evaluation_type === 'numeric') {
        console.log('Numeric type goal detected');
        // Show a modal or drawer to input numeric value
        if (goal.checklist_items && goal.checklist_items.length > 0) {
          // For numeric goals, we'll show the recurring drawer which will handle numeric input
          showRecurringDrawer(task);
          return;
        }
        
        // For numeric tasks without checklist items, show a custom modal
        setSelectedNumericTask(task);
        setNumericInputValue('');
        setIsNumericInputModalVisible(true);
        return;
      }
      
      // Handle timer type goals
      if (goal.evaluation_type === 'timer') {
        const duration = goal.duration || 25; // Default to 25 minutes if no duration specified
        navigation.navigate('PomodoroTimer', {
          duration: duration,
          title: goal.title || task.title,
          itemId: task.id.toString(),
          taskId: goal.id.toString(),
          taskType: goal.type,
          checklist: false,
          onComplete: () => {
            // The completion will be handled in the PomodoroTimer component
          }
        });
        return;
      }
      
      // Handle yesno type goals
      if (goal.evaluation_type === 'yesno') {
        const newCompletedState = !task.isCompleted;
        try {
          // Optimistically update UI
          setTasks(prevTasks => 
            prevTasks.map(t => 
              t.id === task.id 
                ? { 
                    ...t, 
                    isCompleted: newCompletedState,
                    rightIcon: newCompletedState ? ICONS.checkCircle : ICONS.arrowRight
                  } 
                : t
            )
          );

          // Make API call to update task completion status
          await updateTaskCompletionStatus(goal.id.toString(), newCompletedState);
        } catch (error) {
          console.error('Error updating task completion:', error);
          // Revert optimistic update on error
          setTasks(prevTasks =>
            prevTasks.map(t =>
              t.id === task.id
                ? {
                    ...t,
                    isCompleted: !newCompletedState,
                    rightIcon: !newCompletedState ? ICONS.checkCircle : ICONS.arrowRight
                  }
                : t
            )
          );
          Alert.alert('Error', 'Failed to update task completion status. Please try again.');
        }
        return;
      }
    }

    // For regular tasks without special evaluation types
    const newCompletedState = !task.isCompleted;
    
    try {
      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id 
            ? { 
                ...t, 
                isCompleted: newCompletedState,
                rightIcon: newCompletedState ? ICONS.checkCircle : ICONS.arrowRight
              } 
            : t
        )
      );

      // Make API call to update task completion status
      await updateTaskCompletionStatus(task.id.toString(), newCompletedState);
    } catch (error) {
      console.error('Error updating task completion:', error);
      // Revert optimistic update on error
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id
            ? {
                ...t,
                isCompleted: !newCompletedState,
                rightIcon: !newCompletedState ? ICONS.checkCircle : ICONS.arrowRight
              }
            : t
        )
      );
      Alert.alert('Error', 'Failed to update task completion status. Please try again.');
    }
  };

  // Handle numeric input submission
  const handleNumericInputSubmit = async () => {
    if (!selectedNumericTask || !selectedNumericTask.linkedGoal) return;
    
    const numericValue = parseFloat(numericInputValue);
    if (isNaN(numericValue)) {
      Alert.alert('Invalid Input', 'Please enter a valid number');
      return;
    }

    const targetValue = parseFloat(selectedNumericTask.linkedGoal.numeric_value || '0');
    const condition = selectedNumericTask.linkedGoal.numeric_condition;
    const unit = selectedNumericTask.linkedGoal.numeric_unit;

    // Evaluate based on condition
    let isSuccess = false;
    switch (condition) {
      case 'At Least':
        isSuccess = numericValue >= targetValue;
        break;
      case 'At Most':
        isSuccess = numericValue <= targetValue;
        break;
      case 'Exactly':
        isSuccess = numericValue === targetValue;
        break;
      default:
        isSuccess = numericValue >= targetValue; // Default to 'At Least'
    }

    if (!isSuccess) {
      Alert.alert(
        'Evaluation Failed',
        `The value ${numericValue} ${unit} does not meet the requirement: ${condition} ${targetValue} ${unit}`
      );
      return;
    }
    
    try {
      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === selectedNumericTask.id 
            ? { 
                ...t, 
                isCompleted: true,
                rightIcon: ICONS.checkCircle
              } 
            : t
        )
      );

      // Make API call to update task completion status
      await updateTaskCompletionStatus(selectedNumericTask.linkedGoal.id.toString(), true);
      
      // Close the modal
      setIsNumericInputModalVisible(false);
      setSelectedNumericTask(null);
      setNumericInputValue('');
    } catch (error) {
      console.error('Error updating task completion:', error);
      // Revert optimistic update on error
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === selectedNumericTask.id
            ? {
                ...t,
                isCompleted: false,
                rightIcon: ICONS.arrowRight
              }
            : t
        )
      );
      Alert.alert('Error', 'Failed to update task completion status. Please try again.');
    }
  };

  const showTaskOptions = (task: Task) => {
    setSelectedTaskForOptions(task);
    setIsTaskOptionsVisible(true);
    Animated.timing(taskOptionsSlideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideTaskOptions = () => {
    Animated.timing(taskOptionsSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsTaskOptionsVisible(false);
      setSelectedTaskForOptions(null);
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const showChecklist = (task: Goal) => {
    setSelectedTask(task);
    setIsChecklistVisible(true);
  };

  const hideChecklist = () => {
    setIsChecklistVisible(false);
    setSelectedTask(null);
  };

  const renderChecklistDrawer = () => {
    if (!selectedTask?.checklist_items) return null;

    return (
      <Modal
        transparent
        visible={isChecklistVisible}
        animationType="slide"
        onRequestClose={hideChecklist}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={hideChecklist}
        >
          <View style={styles.checklistDrawer}>
            <View style={styles.checklistHeader}>
              <Text style={styles.checklistTitle}>Checklist</Text>
              <TouchableOpacity onPress={hideChecklist}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.checklistContent}>
              {selectedTask.checklist_items.map((item: ChecklistItem) => (
                <View key={item.id} style={styles.checklistItem}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      item.completed && styles.checkboxChecked,
                      item.evaluationType === 'timer' && styles.checkboxTimer
                    ]}
                    onPress={() => handleChecklistItemToggle(item.id)}
                  >
                    {item.completed ? (
                      <Icon name="check" size={20} color="#FFF" />
                    ) : item.evaluationType === 'timer' ? (
                      <Icon name="timer" size={18} color={item.completed ? "#FFF" : "#151B73"} />
                    ) : null}
                  </TouchableOpacity>
                  
                  <View style={styles.checklistItemContent}>
                    <Text style={[
                      styles.checklistItemText,
                      item.completed && styles.checklistItemTextCompleted
                    ]}>
                      {item.text}
                    </Text>
                    {item.evaluationType === 'timer' && (
                      <View style={styles.timerInfo}>
                        <Text style={styles.timerText}>
                          {item.duration?.hours}h {item.duration?.minutes}m
                        </Text>
                        {item.usePomodoro && (
                          <TouchableOpacity 
                            style={styles.pomodoroButton}
                            onPress={() => {
                              hideChecklist();
                              navigation.navigate('PomodoroTimer', {
                                duration: (item.duration?.hours || 0) * 60 + (item.duration?.minutes || 0),
                                title: item.text,
                                itemId: item.id,
                                taskId: selectedTask.id.toString(),
                                taskType: selectedTask.type,
                                checklist: true,
                                onComplete: () => {
                                  handleChecklistItemToggle(item.id);
                                }
                              });
                            }}
                          >
                            <Icon name="alarm" size={18} color="#151B73" />
                            <Text style={styles.pomodoroText}>Start Pomodoro</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderTaskOptionsDrawer = () => {
    return (
      <Modal
        transparent
        visible={isTaskOptionsVisible}
        animationType="slide"
        onRequestClose={hideTaskOptions}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideTaskOptions}
        >
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                transform: [
                  {
                    translateY: taskOptionsSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.taskOptionsDrawer}>
              <View style={styles.handle} />
              
              <View style={styles.taskOptionsHeader}>
                <Text style={styles.taskOptionsTitle}>Task Options</Text>
                <TouchableOpacity onPress={hideTaskOptions}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.taskOptionsList}>
                <TouchableOpacity style={styles.taskOption}>
                  <View style={styles.taskOptionLeft}>
                    <Icon name="edit" size={24} color="#151B73" />
                    <Text style={styles.taskOptionText}>Edit Task</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.taskOption}>
                  <View style={styles.taskOptionLeft}>
                    <Icon name="schedule" size={24} color="#151B73" />
                    <Text style={styles.taskOptionText}>Reschedule</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.taskOption}>
                  <View style={styles.taskOptionLeft}>
                    <Icon name="flag" size={24} color="#151B73" />
                    <Text style={styles.taskOptionText}>Change Priority</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.taskOption}>
                  <View style={styles.taskOptionLeft}>
                    <Icon name="notifications" size={24} color="#151B73" />
                    <Text style={styles.taskOptionText}>Set Reminder</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.taskOption, styles.deleteOption]}>
                  <View style={styles.taskOptionLeft}>
                    <Icon name="delete-outline" size={24} color="#FF4B4B" />
                    <Text style={[styles.taskOptionText, styles.deleteText]}>Delete Task</Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Add a new function to check if the selected date is in the future
  const isSelectedDateInFuture = (): boolean => {
    const selectedDateObj = new Date(selectedDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDateObj.setHours(0, 0, 0, 0);
    return selectedDateObj > today;
  };

  // Add a function to calculate completion percentage
  const calculateCompletionPercentage = (): number => {
    const selectedDateObj = new Date(selectedDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    if (selectedDateObj > today) {
      return 0;
    }
    
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    const totalTasks = tasks.length;
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const [userGender, setUserGender] = useState('male');

  // Add useEffect to fetch user gender
  useEffect(() => {
    const fetchGender = async () => {
      try {
        const gender = await getStoredGender();
        setUserGender(gender || 'male');
      } catch (error) {
        console.error('Error fetching gender:', error);
        setUserGender('male'); // Default to male if error
      }
    };
    fetchGender();
  }, []);

  // Update the onPress handler in the calendar strip
  const handleDateSelect = (index: number) => {
    setSelectedDate(dates[index]);
    setSelectedDateString(dateStrings[index]);
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return '#FFA500'; // Default to orange for 'Other Goals'
    switch (category.trim().toLowerCase()) {
      case 'work & career':
        return '#0E4C92';
      case 'health & wellness':
        return '#228B22';
      case 'love & relationship':
        return '#FF0000';
      case 'money & finances':
        return '#FFD700';
      case 'spirituality & faith':
        return '#800080';
      case 'personal & growth':
        return '#B8860B';
      case 'other goals':
        return '#FFA500';
      case 'create a category':
        return '#40E0D0';
      default:
        return '#FFA500';
    }
  };

  const getCategoryBgColor = (category?: string) => {
    if (!category) return 'rgba(255,165,0,0.15)'; // Light orange for 'Other Goals'
    switch (category.trim().toLowerCase()) {
      case 'work & career':
        return 'rgba(14,76,146,0.15)';
      case 'health & wellness':
        return 'rgba(34,139,34,0.15)';
      case 'love & relationship':
        return 'rgba(255,0,0,0.15)';
      case 'money & finances':
        return 'rgba(255,215,0,0.15)';
      case 'spirituality & faith':
        return 'rgba(128,0,128,0.15)';
      case 'personal & growth':
        return 'rgba(184,134,11,0.15)';
      case 'other goals':
        return 'rgba(255,165,0,0.15)';
      case 'create a category':
        return 'rgba(64,224,208,0.15)';
      default:
        return 'rgba(255,165,0,0.15)';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
              <Text style={styles.headerTitle}>
              <Svg width="78" height="24" viewBox="0 0 78 24" fill="none">
<Path d="M2.32031 21L0.290039 2.09375H3.98535L5.02734 14.0283L6.09082 2.09375H9.61426L10.624 14.0283L11.6338 2.09375H15.3721L13.3096 21H8.77637L7.83105 11.9014L6.92871 21H2.32031ZM16.4141 3.89844V0.697266H20.2598V3.89844H16.4141ZM16.4141 21V4.88672H20.2598V21H16.4141ZM21.7852 21V4.88672H25.6309V6.93848C25.7741 6.32259 26.0391 5.7998 26.4258 5.37012C26.8197 4.93327 27.3639 4.71484 28.0586 4.71484C29.1758 4.71484 29.985 5.05859 30.4863 5.74609C30.9948 6.43359 31.249 7.37533 31.249 8.57129V21H27.457V8.96875C27.457 8.65365 27.3926 8.36361 27.2637 8.09863C27.1348 7.8265 26.9128 7.69043 26.5977 7.69043C26.304 7.69043 26.0856 7.79427 25.9424 8.00195C25.8063 8.20247 25.7204 8.45671 25.6846 8.76465C25.6488 9.06543 25.6309 9.36621 25.6309 9.66699V21H21.7852ZM37.1035 23.793C36.3587 23.793 35.7178 23.7536 35.1807 23.6748C34.6507 23.6032 34.1745 23.4707 33.752 23.2773C33.3294 23.084 32.9069 22.8118 32.4844 22.4609L33.7842 20.2373C34.7223 20.7959 35.6605 21.0752 36.5986 21.0752C37.2145 21.0752 37.6729 20.8783 37.9736 20.4844C38.2744 20.0905 38.4248 19.5785 38.4248 18.9482V17.3691C38.1169 18.472 37.2969 19.0234 35.9648 19.0234C35.1986 19.0234 34.5791 18.8408 34.1064 18.4756C33.6338 18.1104 33.29 17.6162 33.0752 16.9932C32.8604 16.3701 32.7529 15.6755 32.7529 14.9092V9.11914C32.7529 8.2526 32.846 7.48991 33.0322 6.83105C33.2184 6.16504 33.5443 5.64583 34.0098 5.27344C34.4753 4.90104 35.127 4.71484 35.9648 4.71484C36.6738 4.71484 37.2253 4.89388 37.6191 5.25195C38.0202 5.61003 38.2887 6.09342 38.4248 6.70215V4.88672H42.3457V18.7012C42.3457 20.5273 41.9232 21.8307 41.0781 22.6113C40.2402 23.3991 38.9154 23.793 37.1035 23.793ZM37.5225 16.123C38.124 16.123 38.4248 15.5788 38.4248 14.4902V9.01172C38.4248 8.7181 38.3389 8.41732 38.167 8.10938C38.0023 7.80143 37.7731 7.64746 37.4795 7.64746C37.1071 7.64746 36.8743 7.78711 36.7812 8.06641C36.6882 8.33854 36.6416 8.65365 36.6416 9.01172V14.4902C36.6416 14.877 36.6882 15.2458 36.7812 15.5967C36.8815 15.9476 37.1286 16.123 37.5225 16.123ZM48.2646 21.1719C45.085 21.1719 43.4951 19.5605 43.4951 16.3379V15.0596H47.3623V16.9502C47.3623 17.3154 47.4339 17.6019 47.5771 17.8096C47.7204 18.0173 47.9495 18.1211 48.2646 18.1211C48.8232 18.1211 49.1025 17.7021 49.1025 16.8643C49.1025 16.1624 48.9557 15.6396 48.6621 15.2959C48.3685 14.945 48.0104 14.6084 47.5879 14.2861L45.5361 12.707C44.8916 12.2057 44.401 11.6758 44.0645 11.1172C43.7279 10.5586 43.5596 9.78158 43.5596 8.78613C43.5596 7.8623 43.778 7.09961 44.2148 6.49805C44.6589 5.89648 45.2425 5.44889 45.9658 5.15527C46.6963 4.86165 47.484 4.71484 48.3291 4.71484C51.4515 4.71484 53.0127 6.27246 53.0127 9.3877V9.68848H49.0381V9.07617C49.0381 8.75391 48.9808 8.44238 48.8662 8.1416C48.7588 7.84082 48.5439 7.69043 48.2217 7.69043C47.6774 7.69043 47.4053 7.97689 47.4053 8.5498C47.4053 9.12988 47.6344 9.58464 48.0928 9.91406L50.4775 11.6543C51.2223 12.1914 51.8454 12.8288 52.3467 13.5664C52.8551 14.304 53.1094 15.2852 53.1094 16.5098C53.1094 18.028 52.6761 19.1846 51.8096 19.9795C50.9502 20.7744 49.7686 21.1719 48.2646 21.1719ZM54.3555 21V2.09375H61.918V5.77832H58.1582V8.78613H61.7246V12.4277H58.1582V21H54.3555ZM63.0781 21V2.09375H66.9883V21H63.0781ZM68.2236 23.6855V21.2471H70.0713C70.3506 21.2471 70.4902 21.1504 70.4902 20.957C70.4902 20.8568 70.4795 20.7529 70.458 20.6455L67.9336 4.88672H71.6182L72.6924 16.7461L73.96 4.88672H77.666L74.6797 21.8379C74.5723 22.4466 74.3646 22.9049 74.0566 23.2129C73.7559 23.528 73.2581 23.6855 72.5635 23.6855H68.2236Z" fill="#363636"/>
</Svg>
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton}>
                {/* <Icon name="search" size={24} color="#000" /> */}
                <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
<Path d="M6.5 13C4.68333 13 3.146 12.3707 1.888 11.112C0.63 9.85333 0.000667196 8.316 5.29101e-07 6.5C-0.000666138 4.684 0.628667 3.14667 1.888 1.888C3.14733 0.629333 4.68467 0 6.5 0C8.31533 0 9.853 0.629333 11.113 1.888C12.373 3.14667 13.002 4.684 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L17.3 15.9C17.4833 16.0833 17.575 16.3167 17.575 16.6C17.575 16.8833 17.4833 17.1167 17.3 17.3C17.1167 17.4833 16.8833 17.575 16.6 17.575C16.3167 17.575 16.0833 17.4833 15.9 17.3L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13ZM6.5 11C7.75 11 8.81267 10.5627 9.688 9.688C10.5633 8.81333 11.0007 7.75067 11 6.5C10.9993 5.24933 10.562 4.187 9.688 3.313C8.814 2.439 7.75133 2.00133 6.5 2C5.24867 1.99867 4.18633 2.43633 3.313 3.313C2.43967 4.18967 2.002 5.252 2 6.5C1.998 7.748 2.43567 8.81067 3.313 9.688C4.19033 10.5653 5.25267 11.0027 6.5 11Z" fill="#4F4F4F"/>
</Svg>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                {/* <Icon name="calendar-today" size={24} color="#000" /> */}
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
<Path d="M6 1V5M12 1V5" stroke="#4F4F4F" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M15.2222 3H2.77778C1.79594 3 1 3.74619 1 4.66667V16.3333C1 17.2538 1.79594 18 2.77778 18H15.2222C16.2041 18 17 17.2538 17 16.3333V4.66667C17 3.74619 16.2041 3 15.2222 3Z" stroke="#4F4F4F" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M1 7H17M5.44444 10.5H5.45333M9 10.5H9.00889M12.5556 10.5H12.5644M5.44444 14H5.45333M9 14H9.00889M12.5556 14H12.5644" stroke="#4F4F4F" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
</Svg>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M12 8.75C11.31 8.75 10.75 9.31 10.75 10V10.107C10.75 10.3059 10.671 10.4967 10.5303 10.6373C10.3897 10.778 10.1989 10.857 10 10.857C9.80109 10.857 9.61032 10.778 9.46967 10.6373C9.32902 10.4967 9.25 10.3059 9.25 10.107V10C9.25 9.27065 9.53973 8.57118 10.0555 8.05546C10.5712 7.53973 11.2707 7.25 12 7.25H12.116C12.654 7.25025 13.179 7.41522 13.6204 7.72272C14.0618 8.03023 14.3985 8.46553 14.5852 8.97008C14.7718 9.47463 14.7995 10.0242 14.6645 10.545C14.5295 11.0657 14.2383 11.5327 13.83 11.883L13.06 12.543C12.9634 12.6269 12.8858 12.7304 12.8323 12.8466C12.7789 12.9628 12.7508 13.0891 12.75 13.217V13.75C12.75 13.9489 12.671 14.1397 12.5303 14.2803C12.3897 14.421 12.1989 14.5 12 14.5C11.8011 14.5 11.6103 14.421 11.4697 14.2803C11.329 14.1397 11.25 13.9489 11.25 13.75V13.217C11.25 12.52 11.554 11.858 12.083 11.405L12.854 10.745C13.0299 10.5942 13.1554 10.3931 13.2136 10.1689C13.2718 9.9446 13.26 9.70787 13.1796 9.49056C13.0992 9.27325 12.9541 9.08578 12.764 8.95338C12.5738 8.82098 12.3477 8.75 12.116 8.75H12ZM12 17C12.2652 17 12.5196 16.8946 12.7071 16.7071C12.8946 16.5196 13 16.2652 13 16C13 15.7348 12.8946 15.4804 12.7071 15.2929C12.5196 15.1054 12.2652 15 12 15C11.7348 15 11.4804 15.1054 11.2929 15.2929C11.1054 15.4804 11 15.7348 11 16C11 16.2652 11.1054 16.5196 11.2929 16.7071C11.4804 16.8946 11.7348 17 12 17Z" fill="#4F4F4F"/>
                <Path d="M3.25 12C3.25 9.67936 4.17187 7.45376 5.81282 5.81282C7.45376 4.17187 9.67936 3.25 12 3.25C14.3206 3.25 16.5462 4.17187 18.1872 5.81282C19.8281 7.45376 20.75 9.67936 20.75 12C20.75 14.3206 19.8281 16.5462 18.1872 18.1872C16.5462 19.8281 14.3206 20.75 12 20.75C9.67936 20.75 7.45376 19.8281 5.81282 18.1872C4.17187 16.5462 3.25 14.3206 3.25 12ZM12 4.75C11.0479 4.75 10.1052 4.93753 9.22554 5.30187C8.34593 5.66622 7.5467 6.20025 6.87348 6.87348C6.20025 7.5467 5.66622 8.34593 5.30187 9.22554C4.93753 10.1052 4.75 11.0479 4.75 12C4.75 12.9521 4.93753 13.8948 5.30187 14.7745C5.66622 15.6541 6.20025 16.4533 6.87348 17.1265C7.5467 17.7997 8.34593 18.3338 9.22554 18.6981C10.1052 19.0625 11.0479 19.25 12 19.25C13.9228 19.25 15.7669 18.4862 17.1265 17.1265C18.4862 15.7669 19.25 13.9228 19.25 12C19.25 10.0772 18.4862 8.23311 17.1265 6.87348C15.7669 5.51384 13.9228 4.75 12 4.75Z" fill="#4F4F4F"/>
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Calendar Strip */}
            <ScrollView 
              ref={scrollViewRef}
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
                  onPress={() => handleDateSelect(index)}
                >
                  <View style={[
                    styles.dayTop, 
                    dates[index] === selectedDate && styles.selectedDayTop
                  ]}>
                    <Text style={[
                      styles.dayText,
                      dates[index] === selectedDate && styles.selectedDayText
                    ]}>{day}</Text>
                  </View>
                  <View style={[
                    styles.dayBottom, 
                    dates[index] === selectedDate && styles.selectedDayBottom
                  ]}>
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
              <Shadow distance={4} 
                      startColor="rgba(0,0,0,0.1)"
                      endColor="rgba(0,0,0,0)" 
                      offset={[0, 1]} 
              >
                <View style={styles.quoteCard}>
                  <Text style={styles.quoteTitle}>Today's Quote</Text>
                  <Text style={styles.quoteText}>
                    "You must do the things, you think you cannot do."
                  </Text>
                  
                  {/* Progress Section */}
                  <View style={styles.progressSection}>
                    <Text style={styles.progressText}>
                      Progress {calculateCompletionPercentage()}%
                    </Text>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBackground} />
                      <View 
                        style={[
                          styles.progressBar, 
                          { 
                            width: `${calculateCompletionPercentage()}%`,
                            height: (() => {
                              const progress = calculateCompletionPercentage();
                              if (progress === 0) return 0.5;
                              if (progress <= 10) return 1;
                              if (progress <= 20) return 1.5;
                              if (progress <= 30) return 2;
                              if (progress <= 40) return 2.5;
                              if (progress <= 50) return 3;
                              if (progress <= 60) return 3.5;
                              if (progress <= 70) return 4;
                              if (progress <= 80) return 4.5;
                              if (progress <= 90) return 5;
                              return 5.5;
                            })(),
                            transform: [
                              { 
                                translateY: (() => {
                                  const progress = calculateCompletionPercentage();
                                  if (progress === 0) return -0.25;
                                  if (progress <= 10) return -0.5;
                                  if (progress <= 20) return -0.75;
                                  if (progress <= 30) return -1;
                                  if (progress <= 40) return -1.25;
                                  if (progress <= 50) return -1.5;
                                  if (progress <= 60) return -1.75;
                                  if (progress <= 70) return -2;
                                  if (progress <= 80) return -2.25;
                                  if (progress <= 90) return -2.5;
                                  return -2.75;
                                })()
                              }
                            ]
                          }
                        ]} 
                      >
                        <View 
                          style={[
                            styles.progressBarBlur,
                            {
                              top: (() => {
                                const progress = calculateCompletionPercentage();
                                if (progress <= 20) return -0.25;
                                if (progress <= 50) return -0.5;
                                if (progress <= 80) return -0.75;
                                return -1;
                              })(),
                              bottom: (() => {
                                const progress = calculateCompletionPercentage();
                                if (progress <= 20) return -0.25;
                                if (progress <= 50) return -0.5;
                                if (progress <= 80) return -0.75;
                                return -1;
                              })(),
                              opacity: (() => {
                                const progress = calculateCompletionPercentage();
                                if (progress <= 10) return 0.05;
                                if (progress <= 30) return 0.08;
                                if (progress <= 50) return 0.1;
                                if (progress <= 70) return 0.12;
                                if (progress <= 90) return 0.15;
                                return 0.18;
                              })(),
                              borderRadius: (() => {
                                const progress = calculateCompletionPercentage();
                                if (progress <= 20) return 0.5;
                                if (progress <= 50) return 1;
                                if (progress <= 80) return 1.5;
                                return 2;
                              })()
                            }
                          ]} 
                        />
                      </View>
                      <View 
                        style={[
                          styles.progressBarDot,
                          {
                            left: `${calculateCompletionPercentage()}%`,
                          }
                        ]}
                      >
                        <View style={styles.progressBarDotInner} />
                      </View>
                    </View>
                  </View>
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
                  {/* <TouchableOpacity style={styles.addGoalButton} onPress={showDrawer}>
                    <Text style={styles.addGoalButtonText}>Add a Task</Text>
                  </TouchableOpacity> */}
                </View>
              ) : (
                tasks.map((task) => (
                  <TouchableOpacity 
                    key={task.id} 
                    style={styles.taskItem}
                    onPress={() => {
                      if (task.type === 'recurring' || task.linkedGoal?.evaluation_type === 'checklist') {
                        showRecurringDrawer(task);
                      }
                    }}
                    onLongPress={() => showTaskOptions(task)}
                    delayLongPress={300}
                  >
                    <View style={styles.taskLeft}>
                      <View style={styles.taskIconContainer}>
                        <Shadow 
                          distance={3.5}
                          startColor="rgba(0, 0, 0, 0.09)"
                          endColor="rgba(0, 0, 0, 0)"
                          offset={[0, 1]}
                          style={{ borderRadius: 50 }}
                        >
                          <View style={styles.categoryImageContainer}>
                            <Image 
                              source={(() => {
                                const category = task.linkedGoal?.category?.toLowerCase() || task.type;
                                
                                if (userGender === 'female') {
                                  switch(category) {
                                    case 'work & career':
                                      return require('../../assets/images/category-female/work-career.jpeg');
                                    case 'health & wellness':
                                      return require('../../assets/images/category-female/health-wellness.jpeg');
                                    case 'love & relationship':
                                      return require('../../assets/images/category-female/love-family.jpeg');
                                    case 'money & finances':
                                      return require('../../assets/images/category-female/money.jpeg');
                                    case 'spirituality & faith':
                                      return require('../../assets/images/category-female/spirtuality-faith.jpeg');
                                    case 'personal & growth':
                                      return require('../../assets/images/category-female/personal-growth.jpeg');
                                    case 'other goals':
                                      return require('../../assets/images/category-female/other-goals.jpeg');
                                    case 'create a category':
                                      return require('../../assets/images/category-female/create-category.jpeg');
                                    default:
                                      return require('../../assets/images/category-female/other-goals.jpeg');
                                  }
                                } else {
                                  switch(category) {
                                    case 'work & career':
                                      return require('../../assets/images/category-male/work-career.jpeg');
                                    case 'health & wellness':
                                      return require('../../assets/images/category-male/health-wellness.jpeg');
                                    case 'love & relationship':
                                      return require('../../assets/images/category-male/love-relationship.jpeg');
                                    case 'money & finances':
                                      return require('../../assets/images/category-male/money.jpeg');
                                    case 'spirituality & faith':
                                      return require('../../assets/images/category-male/spirtuality-faith.jpeg');
                                    case 'personal & growth':
                                      return require('../../assets/images/category-male/personal-growth.jpeg');
                                    case 'other goals':
                                      return require('../../assets/images/category-male/other-goals.jpeg');
                                    case 'create a category':
                                      return require('../../assets/images/category-male/create-category.jpeg');
                                    default:
                                      return require('../../assets/images/category-male/other-goals.jpeg');
                                  }
                                }
                              })()}
                              style={styles.categoryImage}
                            />
                          </View>
                        </Shadow>
                      </View>
                    </View>
                    <View style={styles.taskRight}>
                      <View style={styles.taskInfo}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <View style={styles.taskMeta}>
                          <View style={[
                            styles.timeContainer,
                            {
                              backgroundColor: getCategoryBgColor(task.linkedGoal?.category),
                              borderRadius: 4,
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              alignSelf: 'flex-start',
                              height:20
                            }
                          ]}>
                            <Icon
                              name="schedule"
                              size={14}
                              color={getCategoryColor(task.linkedGoal?.category)}
                              style={{ marginRight: 2 }}
                            />
                            <Text
                              style={[
                                styles.taskTime,
                                { color: getCategoryColor(task.linkedGoal?.category), fontWeight: 'bold' }
                              ]}
                            >
                              {task.time}
                            </Text>
                          </View>
                          {/* New pill for taskType | priority | flag */}
                          <View style={{
                            backgroundColor: '#F6F6F6',
                            borderRadius: 4,
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            marginLeft: 8,
                            alignSelf: 'flex-start',
                            height:20
                          }}>
                            <Text style={{ color: '#6C6C6C', fontSize: 13, fontWeight: '500', marginRight: 4 }}>
                              {task.task_type.charAt(0).toUpperCase() + task.task_type} | {task.priority}
                            </Text>
                            <FlagIcon />
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleTaskCompletion(task)}
                        style={{
                          width: 25,
                          height: 25,
                          borderRadius: 16,
                          backgroundColor: task.isCompleted
                            ? '#BFE3D2'
                            : task.linkedGoal?.evaluation_type === 'timer'
                              ? '#F6F6F6'
                              : task.linkedGoal?.evaluation_type === 'numeric'
                                ? '#E7E7E7'
                                : task.linkedGoal?.evaluation_type === 'checklist'
                                  ? '#F6F6F6'
                                  : '#F6F6F6',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginLeft: 8,
                          borderWidth: !task.isCompleted && task.linkedGoal?.evaluation_type === 'yesno' ? 1 : 0,
                          borderColor: '#F6F6F6'
                        }}
                      >
                        {task.isCompleted ? (
                          <CompletedIcon />
                        ) : task.linkedGoal?.evaluation_type === 'checklist' ? (
                          <ChecklistIcon />
                        ) : task.linkedGoal?.evaluation_type === 'timer' ? (
                          <TimerIcon />
                        ) : task.linkedGoal?.evaluation_type === 'numeric' ? (
                          <NumericIcon />
                        ) : null}
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
            <TouchableOpacity style={styles.bottomNavItem} onPress={handleLogout}>
              <Icon name="logout" size={24} color="#666" />
              <Text style={styles.bottomNavText}>Logout</Text>
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

      {/* Checklist Item Modal */}
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
                <View style={styles.recurringDrawerHeaderLeft}>

                <Text style={styles.recurringDrawerTitle}>
                  {selectedRecurringTask?.title}
                </Text>
                <Text style={styles.draerDateText}>{selectedRecurringTask?.date}</Text>
                </View>
                <Shadow distance={4} 
                      startColor="rgba(0,0,0,0.1)"
                      endColor="rgba(0,0,0,0)" 
                      offset={[0, 2]} 
              >
                <View style={styles.categoryImageContainer}>
                  <Image source={(() => {
                    const category = selectedRecurringTask?.linkedGoal?.category?.toLowerCase() || selectedRecurringTask?.type;
                    if (userGender === 'female') {
                      switch(category) {
                        case 'work & career':
                          return require('../../assets/images/category-female/work-career.jpeg');
                        case 'health & wellness':
                          return require('../../assets/images/category-female/health-wellness.jpeg');
                        case 'love & relationship':
                          return require('../../assets/images/category-female/love-family.jpeg');
                        case 'money & finances':
                          return require('../../assets/images/category-female/money.jpeg');
                        case 'spirituality & faith':
                          return require('../../assets/images/category-female/spirtuality-faith.jpeg');
                        case 'personal & growth':
                          return require('../../assets/images/category-female/personal-growth.jpeg');
                        case 'other goals':
                          return require('../../assets/images/category-female/other-goals.jpeg');
                        case 'create a category':
                          return require('../../assets/images/category-female/create-category.jpeg');
                        default:
                          return require('../../assets/images/category-female/other-goals.jpeg');
                      }
                    } else {
                      switch(category) {
                        case 'work & career':
                          return require('../../assets/images/category-male/work-career.jpeg');
                        case 'health & wellness':
                          return require('../../assets/images/category-male/health-wellness.jpeg');
                        case 'love & relationship':
                          return require('../../assets/images/category-male/love-relationship.jpeg');
                        case 'money & finances':
                          return require('../../assets/images/category-male/money.jpeg');
                        case 'spirituality & faith':
                          return require('../../assets/images/category-male/spirtuality-faith.jpeg');
                        case 'personal & growth':
                          return require('../../assets/images/category-male/personal-growth.jpeg');
                        case 'other goals':
                          return require('../../assets/images/category-male/other-goals.jpeg');
                        case 'create a category':
                          return require('../../assets/images/category-male/create-category.jpeg');
                        default:
                          return require('../../assets/images/category-male/other-goals.jpeg');
                      }
                    }
                  })()} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
                </View>
                  </Shadow>
              </View>

              {/* <Text style={styles.dateText}>{selectedRecurringTask?.date}</Text> */}

              <View style={styles.screenList}>
                {selectedRecurringTask?.linkedGoal?.checklist?.items && selectedRecurringTask.linkedGoal.checklist.items.length > 0 ? (
                  selectedRecurringTask.linkedGoal.checklist.items.map((item, index) => (
                    <View key={item.id} style={styles.screenItem}>
                      <View style={styles.screenItemLeft}>
                        <Text style={styles.screenNumber}>{index + 1}.</Text>
                        <Text style={styles.screenTitle}>{item.text}</Text>

                        {/* <View style={styles.itemTypeIndicator}>
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
                        </View> */}
                      </View>
                      {/* Move completion checkbox to the right and use SVG icons and background logic as in main task list */}
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
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: item.completed
                            ? '#BFE3D2'
                            : (String(item.evaluationType) === 'timer' || String(item.evaluationType) === 'numeric' || String(item.evaluationType) === 'checklist')
                              ? '#E5E5E5'
                              : '#E5E5E5',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginLeft: 8,
                          borderWidth: !item.completed && String(item.evaluationType) === 'yesno' ? 1 : 0,
                          borderColor: '#E7E7E7',
                        }}
                      >
                        {item.completed ? (
                          <CompletedIcon />
                        ) : String(item.evaluationType) === 'checklist' ? (
                          <ChecklistIcon />
                        ) : String(item.evaluationType) === 'timer' ? (
                          <TimerIcon />
                        ) : String(item.evaluationType) === 'numeric' ? (
                          <NumericIcon />
                        ) : null}
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

      {/* Task Options Modal */}
      <Modal
        visible={isTaskOptionsVisible}
        transparent
        animationType="none"
        onRequestClose={hideTaskOptions}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideTaskOptions}
        >
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                transform: [
                  {
                    translateY: taskOptionsSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.taskOptionsDrawer}>
              <View style={styles.handle} />
              
              <View style={styles.taskOptionsHeader}>
                <Text style={styles.taskOptionsTitle}>Task Options</Text>
                <TouchableOpacity onPress={hideTaskOptions}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.taskOptionsList}>
                <TouchableOpacity style={styles.taskOption}>
                  <View style={styles.taskOptionLeft}>
                    <Icon name="edit" size={24} color="#151B73" />
                    <Text style={styles.taskOptionText}>Edit Task</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.taskOption}>
                  <View style={styles.taskOptionLeft}>
                    <Icon name="schedule" size={24} color="#151B73" />
                    <Text style={styles.taskOptionText}>Reschedule</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.taskOption}>
                  <View style={styles.taskOptionLeft}>
                    <Icon name="flag" size={24} color="#151B73" />
                    <Text style={styles.taskOptionText}>Change Priority</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.taskOption}>
                  <View style={styles.taskOptionLeft}>
                    <Icon name="notifications" size={24} color="#151B73" />
                    <Text style={styles.taskOptionText}>Set Reminder</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.taskOption, styles.deleteOption]}>
                  <View style={styles.taskOptionLeft}>
                    <Icon name="delete-outline" size={24} color="#FF4B4B" />
                    <Text style={[styles.taskOptionText, styles.deleteText]}>Delete Task</Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      {renderChecklistDrawer()}
      {renderTaskOptionsDrawer()}
      
      {/* Numeric Input Modal */}
      <Modal
        visible={isNumericInputModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNumericInputModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsNumericInputModalVisible(false)}
        >
          <View style={styles.numericInputModal}>
            <Text style={styles.numericInputTitle}>Enter Value</Text>
            {selectedNumericTask?.linkedGoal && (
              <View style={styles.numericTargetInfo}>
                <Text style={styles.numericTargetText}>
                  Target: {selectedNumericTask.linkedGoal.numeric_condition} {selectedNumericTask.linkedGoal.numeric_value} {selectedNumericTask.linkedGoal.numeric_unit}
                </Text>
              </View>
            )}
            <TextInput
              style={styles.numericInput}
              value={numericInputValue}
              onChangeText={setNumericInputValue}
              keyboardType="numeric"
              placeholder="Enter numeric value"
              autoFocus
            />
            <View style={styles.numericInputButtons}>
              <TouchableOpacity
                style={[styles.numericInputButton, styles.numericInputButtonCancel]}
                onPress={() => {
                  setIsNumericInputModalVisible(false);
                  setSelectedNumericTask(null);
                  setNumericInputValue('');
                }}
              >
                <Text style={styles.numericInputButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.numericInputButton, styles.numericInputButtonSubmit]}
                onPress={handleNumericInputSubmit}
              >
                <Text style={[styles.numericInputButtonText, styles.numericInputButtonTextSubmit]}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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
    width: 30,
    height: 29,
    borderRadius: 8,
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
    fontFamily: 'anton',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  iconButton: {
    // padding: 8,
    // marginLeft: 4,
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: 7,
    // justifyContent: 'center',
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
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  quoteCard: {
    padding: 16,
    paddingBottom: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
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
  progressSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#464DB0',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 4, // Fixed container height
    justifyContent: 'center',
    position: 'relative',
  },
  progressBarBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: 0.5,
    top: '50%',
    transform: [{ translateY: -0.5 }], // Center the background line
  },
  progressBar: {
    backgroundColor: '#464DB0',
    borderRadius: 1,
    alignSelf: 'flex-start',
    position: 'absolute',
    shadowColor: '#464DB0',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    top: '50%', // Center the progress bar
  },
  progressBarBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#464DB0',
    opacity: 0.15,
    borderRadius: 1,
  },
  progressBarDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#464DB0',
    position: 'absolute',
    top: '50%',
    transform: [
      { translateY: -6 }
    ],
    shadowColor: '#464DB0',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  progressBarDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -3 },
      { translateY: -3 }
    ],
  },
  tasksList: {
    paddingTop: 8,
    paddingBottom: 50,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',

  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    // flex: 1,
  },
  taskIconContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImageContainer:{
    width: 53,
    height: 53,
    borderRadius: 50,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  taskInfo: {
    alignItems:'flex-start'
  },
  taskTitle: {
    fontSize: 15,
    color: '#000',
    marginBottom: 6,
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
    justifyContent:'space-between',
    paddingBottom:12,
    gap: 12,
    flex:1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DAD8D8',
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
    bottom: 65,
    width: 53,
    height: 53,
    borderRadius: 8,
    backgroundColor: '#151B73',
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
  recurringDrawerHeaderLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  recurringDrawerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    // fontFamily: 'Inter',
  },
  draerDateText: {
    fontSize: 16,
    // fontWeight: '600',
    color: '#151B73',
    backgroundColor: '#E4E6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
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
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  taskOptionsDrawer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
  taskOptionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  taskOptionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  taskOptionsList: {
    maxHeight: 400,
  },
  taskOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  taskOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  taskOptionText: {
    fontSize: 16,
    color: '#000',
  },
  deleteOption: {
    marginTop: 8,
    borderBottomWidth: 0,
  },
  deleteText: {
    color: '#FF4B4B',
  },
  itemTypeIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginLeft: 8,
  },
  checklistDrawer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  checklistTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  checklistContent: {
    padding: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkboxChecked: {
    backgroundColor: '#151B73',
    borderColor: '#151B73',
  },
  checkboxTimer: {
    backgroundColor: '#F0F0FF',
  },
  checklistItemContent: {
    flex: 1,
  },
  checklistItemText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  checklistItemTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  timerInfo: {
    marginTop: 4,
  },
  timerText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  pomodoroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  pomodoroText: {
    fontSize: 14,
    color: '#151B73',
    marginLeft: 4,
    fontWeight: '500',
  },
  numericInputModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  numericInputTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  numericInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  numericInputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  numericInputButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  numericInputButtonCancel: {
    backgroundColor: '#f2f2f2',
  },
  numericInputButtonSubmit: {
    backgroundColor: '#3F51B5',
  },
  numericInputButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  numericInputButtonTextSubmit: {
    color: '#fff',
  },
  numericTargetInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  numericTargetText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
} as const);

export default DailyPlan; 