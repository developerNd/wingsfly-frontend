import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

export const storeAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing auth token:', error);
    throw error;
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing auth token:', error);
    throw error;
  }
};

export const storeUserData = async (userData: any) => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
    throw error;
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Error removing user data:', error);
    throw error;
  }
};

export const clearAuthData = async () => {
  try {
    await Promise.all([
      removeAuthToken(),
      removeUserData()
    ]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
}; 