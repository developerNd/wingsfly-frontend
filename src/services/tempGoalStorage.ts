import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing temporary goal data
const TEMP_GOAL_STORAGE_KEY = 'temp_goal_data';

// Type for the temporary goal data
export type TempGoalData = {
  // Category selection data
  category?: string;
  
  // Daily plan evaluation data
  evaluation?: {
    mood?: string;
    energy?: string;
    productivity?: string;
    notes?: string;
  };
  
  // Daily plan definition data
  definition?: {
    title?: string;
    description?: string;
    priority?: string;
    category?: string;
  };
  
  // Daily plan frequency data
  frequency?: {
    type?: string;
    days?: string[];
    timesPerDay?: number;
    startDate?: string;
    endDate?: string;
  };
  
  // Daily plan schedule data
  schedule?: {
    startTime?: string;
    endTime?: string;
    duration?: number;
    reminder?: boolean;
    reminderTime?: string;
    reminderType?: 'dont-remind' | 'notification' | 'alarm';
    reminderSchedule?: 'always-enabled' | 'specific-days' | 'days-before';
    selectedWeekDays?: string[];
    daysBeforeCount?: number;
    hoursBeforeCount?: number;
  };
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Save temporary goal data to AsyncStorage
 * @param data The data to save
 */
export const saveTempGoalData = async (data: Partial<TempGoalData>): Promise<void> => {
  try {
    // Get existing data
    const existingData = await getTempGoalData();
    
    // Merge existing data with new data
    const updatedData = {
      ...existingData,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(TEMP_GOAL_STORAGE_KEY, JSON.stringify(updatedData));
    console.log('✅ Temporary goal data saved successfully');
  } catch (error) {
    console.error('❌ Error saving temporary goal data:', error);
    throw error;
  }
};

/**
 * Get temporary goal data from AsyncStorage
 * @returns The temporary goal data or null if not found
 */
export const getTempGoalData = async (): Promise<TempGoalData | null> => {
  try {
    const data = await AsyncStorage.getItem(TEMP_GOAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting temporary goal data:', error);
    return null;
  }
};

/**
 * Clear temporary goal data from AsyncStorage
 */
export const clearTempGoalData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TEMP_GOAL_STORAGE_KEY);
    console.log('✅ Temporary goal data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing temporary goal data:', error);
    throw error;
  }
};

/**
 * Check if temporary goal data exists
 * @returns True if temporary goal data exists, false otherwise
 */
export const hasTempGoalData = async (): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(TEMP_GOAL_STORAGE_KEY);
    return !!data;
  } catch (error) {
    console.error('❌ Error checking temporary goal data:', error);
    return false;
  }
}; 