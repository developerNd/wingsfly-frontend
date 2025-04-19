import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

/**
 * Instructions for finding your local IP address:
 * 
 * Windows:
 * 1. Open Command Prompt
 * 2. Type 'ipconfig' and press Enter
 * 3. Look for 'IPv4 Address' under your active network adapter (usually 'Wireless LAN adapter Wi-Fi' or 'Ethernet adapter')
 * 
 * macOS/Linux:
 * 1. Open Terminal
 * 2. Type 'ifconfig' (macOS/Linux) or 'ip addr' (Linux) and press Enter
 * 3. Look for 'inet' followed by an IP address (usually starts with 192.168.x.x or 10.0.x.x)
 * 
 * Once you have your IP address, update it in src/config/api.ts in the realDevice field
 */

/**
 * Checks if the device is connected to the internet
 */
export const isConnectedToInternet = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected === true && netInfo.isInternetReachable !== false;
};

/**
 * Gets the device's platform-specific API URL
 * This is a helper function to get the appropriate API URL based on the platform
 */
export const getPlatformSpecificApiUrl = (): string => {
  if (Platform.OS === 'android') {
    return __DEV__ 
      ? 'http://10.0.2.2:8000/api' // Android emulator
      : 'http://192.168.150.101:8000/api'; // Replace X with your actual IP for real devices
  } else {
    return __DEV__ 
      ? 'http://localhost:8000/api' // iOS simulator
      : 'http://192.168.150.101:8000/api'; // Replace X with your actual IP for real devices
  }
};

/**
 * Gets detailed network information for debugging
 */
export const getNetworkInfo = async () => {
  const netInfo = await NetInfo.fetch();
  return {
    isConnected: netInfo.isConnected,
    isInternetReachable: netInfo.isInternetReachable,
    type: netInfo.type,
    details: netInfo.details,
  };
};

export default {
  isConnectedToInternet,
  getPlatformSpecificApiUrl,
  getNetworkInfo,
}; 