// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   Platform,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../../navigation/AppNavigator';
// import { saveDailyPlan, saveRecurringGoal } from '../../services/api';
// import { getTempGoalData, clearTempGoalData } from '../../services/tempGoalStorage';

// type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DailyPlanConfirmation'>;
// type RouteType = RouteProp<RootStackParamList, 'DailyPlanConfirmation'>;

// const DailyPlanConfirmation = () => {
//   const navigation = useNavigation<NavigationProp>();
//   const route = useRoute<RouteType>();
//   const [isSaving, setIsSaving] = useState(false);
//   const {
//     category,
//     taskType,
//     gender,
//     evaluationType,
//     habit,
//     description,
//     frequency,
//     selectedDays,
//     isFlexible,
//     startDate,
//     endDate,
//     timeAndReminders,
//     priority,
//     blockTime,
//     pomodoro,
//   } = route.params;

//   const handleConfirm = async () => {
//     try {
//       setIsSaving(true);
      
//       // Get the temporary data from storage
//       const tempData = await getTempGoalData();
      
//       // Convert "Today" to actual date string if needed
//       const formattedStartDate = startDate === 'Today' 
//         ? new Date().toISOString().split('T')[0] 
//         : startDate;
      
//       // Prepare the goal data for saving
//       const goalData = {
//         category: category,
//         task_type: taskType,
//         gender: gender,
//         evaluation_type: evaluationType,
//         habit: habit,
//         description: description || '',
//         frequency: frequency,
//         selected_days: selectedDays || [],
//         is_flexible: isFlexible,
//         start_date: formattedStartDate,
//         end_date: endDate || null,
//         duration: tempData?.schedule?.duration || 0,
//         priority: priority,
//         block_time: blockTime,
//         pomodoro: pomodoro,
//         reminder: timeAndReminders > 0,
//         reminder_time: tempData?.schedule?.reminderTime || '12:00',
//         reminder_type: tempData?.schedule?.reminderType || 'notification',
//         reminder_schedule: tempData?.schedule?.reminderSchedule || 'always-enabled',
//         selected_week_days: tempData?.schedule?.selectedWeekDays || [],
//         days_before_count: tempData?.schedule?.daysBeforeCount || 0,
//         hours_before_count: tempData?.schedule?.hoursBeforeCount || 0
//       };
      
//       // Save the goal data
//       await saveDailyPlan(goalData);
      
//       // Clear temporary data
//       await clearTempGoalData();
      
//       // Navigate to the home screen or wherever appropriate
//       navigation.navigate('Home', { gender });
//     } catch (error) {
//       console.error('Error saving goal:', error);
//       Alert.alert('Error', 'Failed to save goal. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.content}>
//           <View style={styles.header}>
//             <TouchableOpacity onPress={() => navigation.goBack()}>
//               <Icon name="arrow-back" size={24} color="black" />
//             </TouchableOpacity>
//             <Text style={styles.headerTitle}>Confirm Your Plan</Text>
//             <TouchableOpacity 
//               style={styles.confirmButton}
//               onPress={handleConfirm}
//               disabled={isSaving}
//             >
//               {isSaving ? (
//                 <ActivityIndicator size="small" color="#007AFF" />
//               ) : (
//                 <Text style={styles.confirmButtonText}>Confirm</Text>
//               )}
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={styles.scrollContent}>
//             <View style={styles.summaryContainer}>
//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Habit</Text>
//                 <Text style={styles.summaryValue}>{habit}</Text>
//               </View>

//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Description</Text>
//                 <Text style={styles.summaryValue}>{description}</Text>
//               </View>

//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Frequency</Text>
//                 <Text style={styles.summaryValue}>
//                   {frequency.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
//                 </Text>
//               </View>

//               {selectedDays && selectedDays.length > 0 && (
//                 <View style={styles.summaryItem}>
//                   <Text style={styles.summaryLabel}>Selected Days</Text>
//                   <Text style={styles.summaryValue}>{selectedDays.join(', ')}</Text>
//                 </View>
//               )}

//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Flexible</Text>
//                 <Text style={styles.summaryValue}>{isFlexible ? 'Yes' : 'No'}</Text>
//               </View>

//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Start Date</Text>
//                 <Text style={styles.summaryValue}>{startDate}</Text>
//               </View>

//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>End Date</Text>
//                 <Text style={styles.summaryValue}>{endDate || 'No end date'}</Text>
//               </View>

//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Time and Reminders</Text>
//                 <Text style={styles.summaryValue}>{timeAndReminders}</Text>
//               </View>

//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Priority</Text>
//                 <Text style={styles.summaryValue}>{priority}</Text>
//               </View>

//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Block Time</Text>
//                 <Text style={styles.summaryValue}>{blockTime}</Text>
//               </View>

//               <View style={styles.summaryItem}>
//                 <Text style={styles.summaryLabel}>Pomodoro</Text>
//                 <Text style={styles.summaryValue}>{pomodoro}</Text>
//               </View>
//             </View>
//           </ScrollView>

//           <View style={styles.progressIndicator}>
//             <View style={styles.dot} />
//             <View style={styles.dot} />
//             <View style={styles.dot} />
//             <View style={[styles.dot, styles.activeDot]} />
//           </View>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   safeArea: {
//     flex: 1,
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 24,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#000',
//     flex: 1,
//     textAlign: 'center',
//     marginHorizontal: 16,
//   },
//   confirmButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//   },
//   confirmButtonText: {
//     fontSize: 16,
//     color: '#007AFF',
//     fontWeight: '600',
//   },
//   scrollContent: {
//     flex: 1,
//   },
//   summaryContainer: {
//     gap: 16,
//     paddingBottom: 24,
//   },
//   summaryItem: {
//     backgroundColor: '#F5F5F5',
//     borderRadius: 12,
//     padding: 16,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 4,
//   },
//   summaryValue: {
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '500',
//   },
//   progressIndicator: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 8,
//     marginTop: 24,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#E0E0E0',
//   },
//   activeDot: {
//     backgroundColor: '#3F51B5',
//     width: 16,
//   },
// });

// export default DailyPlanConfirmation; 