import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../config/api';
import { clearAuthData, getAuthToken, storeAuthToken, storeUserData } from './authStorage';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Helper function to format error messages
const formatErrorMessage = (error: any) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

// Add request interceptor to include token in headers and log requests
api.interceptors.request.use(
  async (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      headers: config.headers,
      baseURL: config.baseURL,
    });
    
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    const errorMessage = formatErrorMessage(error);
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: errorMessage,
    });
    error.userMessage = errorMessage;
    return Promise.reject(error);
  }
);

// Auth functions
export const login = async (email: string, password: string) => {
  console.log('📝 Login attempt:', { email });
  try {
    console.log('🌐 API URL:', getApiUrl());
    const response = await api.post('/login', { email, password });
    
    // Check if we have a token in the response
    if (response.data && response.data.access_token) {
      await storeAuthToken(response.data.access_token);
      console.log('✅ Token stored successfully');
      
      // Store user data including gender
      if (response.data.user) {
        await storeUserData(response.data.user);
        console.log('✅ User data stored successfully');
      }
    } else {
      console.warn('⚠️ No token in response:', response.data);
    }
    
    console.log('✅ Login successful');
    return response.data;
  } catch (error: any) {
    console.error('❌ Login failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const register = async (name: string, email: string, password: string, gender: string) => {
  console.log('📝 Register attempt:', { name, email, gender });
  try {
    console.log('🌐 API URL:', getApiUrl());
    const response = await api.post('/register', { 
      name, 
      email, 
      password,
      password_confirmation: password,
      gender 
    });
    
    // Check if we have a token in the response
    if (response.data && response.data.access_token) {
      await storeAuthToken(response.data.access_token);
      console.log('✅ Token stored successfully');
      
      // Store user data including gender
      if (response.data.user) {
        await storeUserData(response.data.user);
        console.log('✅ User data stored successfully');
      }
    } else {
      console.warn('⚠️ No token in response:', response.data);
    }
    
    console.log('✅ Register successful');
    return response.data;
  } catch (error: any) {
    console.error('❌ Register failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const logout = async () => {
  try {
    // Call your logout API endpoint here if needed
    // await api.post('/auth/logout');
    
    // Clear stored auth data
    await clearAuthData();
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

// User profile functions
export const updateGender = async (gender: string) => {
  console.log('📝 Update gender attempt:', { gender });
  try {
    const response = await api.put('/user/gender', { gender });
    
    // Update local storage with new user data
    if (response.data && response.data.user) {
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('✅ User data updated successfully');
    }
    
    console.log('✅ Gender updated successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Update gender failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const getUserProfile = async () => {
  console.log('📝 Get user profile attempt');
  try {
    const response = await api.get('/user/profile');
    
    // Update local storage with fresh user data
    if (response.data && response.data.user) {
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('✅ User data refreshed successfully');
    }
    
    console.log('✅ User profile retrieved successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get user profile failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Helper functions for local storage
export const getStoredUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting stored user:', error);
    return null;
  }
};

export const getStoredGender = async () => {
  try {
    const user = await getStoredUser();
    return user?.gender || null;
  } catch (error) {
    console.error('❌ Error getting stored gender:', error);
    return null;
  }
};

// Goals functions
export const saveGoal = async (goalData: any) => {
  console.log('📝 Save goal attempt:', { title: goalData.title, category: goalData.category });
  try {
    const response = await api.post('/goals', goalData);
    console.log('✅ Goal saved successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Save goal failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const getGoals = async (date?: string) => {
  try {
    const [recurringResponse, dailyResponse] = await Promise.all([
      axios.get(`${getApiUrl()}/recurring-goals${date ? `?date=${date}` : ''}`),
      axios.get(`${getApiUrl()}/daily-plans${date ? `?date=${date}` : ''}`)
    ]);

    return {
      recurring: recurringResponse.data.data,
      daily: dailyResponse.data.data
    };
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

export const updateGoal = async (goalId: string, goalData: any) => {
  console.log('📝 Update goal attempt:', { goalId, title: goalData.title });
  try {
    const response = await api.put(`/goals/${goalId}`, goalData);
    console.log('✅ Goal updated successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Update goal failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const deleteGoal = async (goalId: string) => {
  console.log('📝 Delete goal attempt:', { goalId });
  try {
    const response = await api.delete(`/goals/${goalId}`);
    console.log('✅ Goal deleted successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Delete goal failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Long-Term Goals functions
export const saveLongTermGoal = async (goalData: any) => {
  console.log('📝 Save long-term goal attempt:', { title: goalData.title, category: goalData.category });
  try {
    const response = await api.post('/long-term-goals', goalData);
    console.log('✅ Long-term goal saved successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Save long-term goal failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const getLongTermGoals = async () => {
  console.log('📝 Get long-term goals attempt');
  try {
    const response = await api.get('/long-term-goals');
    console.log('✅ Long-term goals retrieved successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get long-term goals failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const updateLongTermGoal = async (goalId: string, goalData: any) => {
  console.log('📝 Update long-term goal attempt:', { goalId, title: goalData.title });
  try {
    const response = await api.put(`/long-term-goals/${goalId}`, goalData);
    console.log('✅ Long-term goal updated successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Update long-term goal failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const deleteLongTermGoal = async (goalId: string) => {
  console.log('📝 Delete long-term goal attempt:', { goalId });
  try {
    const response = await api.delete(`/long-term-goals/${goalId}`);
    console.log('✅ Long-term goal deleted successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Delete long-term goal failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Recurring Goals functions
export const saveRecurringGoal = async (goalData: any) => {
  console.log('📝 Save recurring goal attempt:', { 
    title: goalData.title, 
    category: goalData.category,
    checklist: goalData.checklist ? {
      itemCount: goalData.checklist.items?.length || 0,
      successCondition: goalData.checklist.successCondition,
      customCount: goalData.checklist.customCount,
      hasNote: !!goalData.checklist.note
    } : 'No checklist data'
  });
  
  try {
    // Log the full checklist data for debugging
    if (goalData.checklist) {
      console.log('📋 Checklist data being sent to API:', JSON.stringify(goalData.checklist, null, 2));
    }
    
    const response = await api.post('/recurring-goals', goalData);
    console.log('✅ Recurring goal saved successfully');
    
    // Log the response data
    console.log('📥 API response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Save recurring goal failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
      checklist: goalData.checklist ? {
        itemCount: goalData.checklist.items?.length || 0,
        successCondition: goalData.checklist.successCondition,
        customCount: goalData.checklist.customCount,
        hasNote: !!goalData.checklist.note
      } : 'No checklist data'
    });
    throw error;
  }
};

interface GetRecurringGoalsParams {
  date: string;
  includeFlexible?: boolean;
  includeRepetitive?: boolean;
}

interface GetDailyPlansParams {
  date: string;
}

export const getRecurringGoals = async (params?: GetRecurringGoalsParams) => {
  try {
    const response = await api.get('/recurring-goals', { params });
    return response;
  } catch (error) {
    console.error('Error fetching recurring goals:', error);
    throw error;
  }
};

export const getDailyPlans = async (params?: GetDailyPlansParams) => {
  try {
    const response = await api.get('/daily-plans', { params });
    console.log('✅ Daily plans retrieved successfully');
    console.log('📥 API response:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error fetching daily plans:', error);
    throw error;
  }
};

export const updateRecurringGoal = async (goalId: string, goalData: any) => {
  console.log('📝 Update recurring goal attempt:', { goalId, title: goalData.title });
  try {
    const response = await api.put(`/recurring-goals/${goalId}`, goalData);
    console.log('✅ Recurring goal updated successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Update recurring goal failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const deleteRecurringGoal = async (goalId: string) => {
  console.log('📝 Delete recurring goal attempt:', { goalId });
  try {
    const response = await api.delete(`/recurring-goals/${goalId}`);
    console.log('✅ Recurring goal deleted successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Delete recurring goal failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Daily Plan functions
export const saveDailyPlan = async (planData: any) => {
  console.log('📝 Save daily plan attempt:', planData);
  
  // Log checklist data specifically if it exists
  if (planData.checklist) {
    console.log('📋 Checklist data in saveDailyPlan:', JSON.stringify(planData.checklist, null, 2));
  }
  
  // Ensure dates are in the correct format
  const formattedData = { ...planData };
  
  // Log time fields before any transformation
  console.log('⏰ Time fields before transformation:', {
    block_start_time: formattedData.block_start_time,
    block_end_time: formattedData.block_end_time
  });
  
  // Format start_date if it's not already in YYYY-MM-DD format
  if (formattedData.start_date && !formattedData.start_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    try {
      // Try to parse the date and format it
      const date = new Date(formattedData.start_date);
      if (!isNaN(date.getTime())) {
        formattedData.start_date = date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn('Could not parse start_date:', formattedData.start_date);
    }
  }
  
  // Format end_date if it exists and is not already in YYYY-MM-DD format
  if (formattedData.end_date && !formattedData.end_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    try {
      // Try to parse the date and format it
      const date = new Date(formattedData.end_date);
      if (!isNaN(date.getTime())) {
        formattedData.end_date = date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn('Could not parse end_date:', formattedData.end_date);
    }
  }
  
  // Log the final data being sent to the API
  console.log('📤 Final data being sent to API:', JSON.stringify(formattedData, null, 2));
  
  try {
    const response = await api.post('/daily-plans', formattedData);
    console.log('✅ Daily plan saved successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Save daily plan failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    // If there are validation errors, log them specifically
    if (error.response?.status === 422 && error.response?.data?.errors) {
      console.error('Validation errors:', JSON.stringify(error.response.data.errors, null, 2));
    }
    
    throw error;
  }
};

export const updateDailyPlan = async (planId: string, planData: any) => {
  console.log('📝 Update daily plan attempt:', { planId, title: planData.title });
  try {
    const response = await api.put(`/daily-plans/${planId}`, planData);
    console.log('✅ Daily plan updated successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Update daily plan failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const deleteDailyPlan = async (planId: string) => {
  console.log('📝 Delete daily plan attempt:', { planId });
  try {
    const response = await api.delete(`/daily-plans/${planId}`);
    console.log('✅ Daily plan deleted successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Delete daily plan failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Custom Goals functions
export const saveCustomGoal = async (goalData: any) => {
  console.log('📝 Save custom goal attempt:', { title: goalData.title, category: goalData.category });
  try {
    const response = await api.post('/custom-goals', goalData);
    console.log('✅ Custom goal saved successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Save custom goal failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const getCustomGoals = async () => {
  console.log('📝 Get custom goals attempt');
  try {
    const response = await api.get('/custom-goals');
    console.log('✅ Custom goals retrieved successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get custom goals failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const updateCustomGoal = async (goalId: string, goalData: any) => {
  console.log('📝 Update custom goal attempt:', { goalId, title: goalData.title });
  try {
    const response = await api.put(`/custom-goals/${goalId}`, goalData);
    console.log('✅ Custom goal updated successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Update custom goal failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const deleteCustomGoal = async (goalId: string) => {
  console.log('📝 Delete custom goal attempt:', { goalId });
  try {
    const response = await api.delete(`/custom-goals/${goalId}`);
    console.log('✅ Custom goal deleted successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Delete custom goal failed:', {
      message: error.userMessage || error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Update checklist item status
export const updateChecklistItem = async (goalId: string, itemId: string, completed: boolean) => {
  try {
    const response = await api.put(`/recurring-goals/${goalId}/checklist-items/${itemId}/toggle`, {
      completed
    });
    return response.data;
  } catch (error) {
    console.error('Error updating checklist item:', error);
    throw error;
  }
};

// Delete checklist item
export const deleteChecklistItem = async (goalId: string, itemId: string) => {
  try {
    const response = await api.delete(`/recurring-goals/${goalId}/checklist-items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    throw error;
  }
};

export const updateChecklistSuccessCondition = async (goalId: string, successCondition: string) => {
  try {
    const response = await api.put(`/recurring-goals/${goalId}/checklist/success-condition`, {
      successCondition
    });
    return response.data;
  } catch (error) {
    console.error('Error updating checklist success condition:', error);
    throw error;
  }
};

export const updateTaskCompletionStatus = async (taskId: string, completed: boolean) => {
  try {
    const response = await api.put(`/daily-plans/${taskId}/completion-status`, {
      completed: completed
    });
    return response.data;
  } catch (error) {
    console.error('API Error updating task completion status:', error);
    throw error;
  }
};

// Update checklist item status for daily plans
export const updateDailyPlanChecklistItem = async (planId: string, itemId: string, completed: boolean) => {
  try {
    const response = await api.put(`/daily-plans/${planId}/checklist-items/${itemId}/toggle`, {
      completed
    });
    return response.data;
  } catch (error) {
    console.error('Error updating daily plan checklist item:', error);
    throw error;
  }
};

export default api; 