import { Platform } from 'react-native';

// Simple configuration with a single URL that works for both emulator and real devices
// const API_URL = Platform.OS === 'android' 
//   ? 'http://10.0.2.2:8000/api'  // Android emulator
//   : 'http://localhost:8000/api'; // iOS simulator or real device
const API_URL = 'https://wingsflybackend.aiwhatsapp.in/api';
// const API_URL = 'http://192.168.150.100:8000/api';
// Log the API URL when it's accessed
export const getApiUrl = () => {
  console.log('🌐 Using API URL:', API_URL);
  return API_URL;
};

export default { API_URL }; 