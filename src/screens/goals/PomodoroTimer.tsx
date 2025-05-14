import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { updateDailyPlanChecklistItem, updateChecklistItem, updateTaskCompletionStatus } from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'PomodoroTimer'>;

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.8;

const PomodoroTimer = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { duration, title, itemId, taskId, onComplete, taskType, checklist } = route.params;
  console.log('duration', duration);
  console.log('taskType', taskType);
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
  console.log('timeLeft', timeLeft);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            clearInterval(interval);
            // Trigger completion animation
            Animated.sequence([
              Animated.spring(scaleAnim, {
                toValue: 1.2,
                useNativeDriver: true,
              }),
              Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
              }),
            ]).start();
            // Automatically complete the task when timer reaches 0
            handleComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (isRunning) {
      // Progress animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: timeLeft * 1000,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.stopAnimation();
    }
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    if (isCompleted) {
      handleComplete();
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleComplete = async () => {
    try {
      // Call the onComplete callback first to update the UI
      if (onComplete) {
        onComplete();
      }
      console.log('itemId', itemId);
      console.log('checklist', checklist);  
      console.log('handleComplete');
      // If this is a checklist item (itemId is provided), use updateDailyPlanChecklistItem
      if (itemId) {
        if (checklist) {
          await updateDailyPlanChecklistItem(taskId, itemId, true);
          console.log('checklist item completed in daily plan');
        } else {
        //   await updateChecklistItem(taskId, itemId, true);
        await updateTaskCompletionStatus(taskId, true);
          console.log('checklist item completed in checklist');
        }
      } else {
        // For regular tasks, use updateTaskCompletionStatus
        await updateTaskCompletionStatus(taskId, true);
        console.log('regular task completed');
      }
      
      // Navigate back with updated status
      navigation.navigate('DailyPlan', {
        gender: 'male', // Default value, will be overridden by existing state
        taskType: 'daily',
        refreshTasks: true,
        completedTaskId: taskId
      });
    } catch (error) {
      console.error('Error completing checklist item:', error);
      Alert.alert('Error', 'Failed to mark item as complete. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.title}>POMODORO</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.plantContainer}>
            <Image 
              source={require('../../assets/images/plant.png')}
              style={styles.plantImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.taskTitle} numberOfLines={2}>
              {title}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, isCompleted && styles.completedButton]}
            onPress={handleToggleTimer}
          >
            <Icon
              name={isCompleted ? 'check' : isRunning ? 'pause' : 'play-arrow'}
              size={32}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  plantContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantImage: {
    width: '100%',
    height: '100%',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    maxWidth: width * 0.8,
  },
  actionButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#151B73',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
});

export default PomodoroTimer; 