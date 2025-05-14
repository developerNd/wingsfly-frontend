import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { login, logout } from '../../services/api';
import { storeAuthToken, storeUserData, getAuthToken, getUserData } from '../../services/authStorage';
import { isConnectedToInternet } from '../../utils/networkUtils';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Login = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSubmitting = useRef(false);

  // Check for existing auth token on mount
  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const userData = await getUserData();

      if (token && userData) {
        // Use gender from userData instead of AsyncStorage
        if (userData.gender) {
          navigation.replace('DailyPlan', { gender: userData.gender, taskType: 'daily' });
        } else {
          // If no gender is set, navigate to gender selection
          navigation.replace('GenderSelect');
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSubmitting.current) {
      console.log('🔄 Login already in progress, ignoring duplicate request');
      return;
    }

    try {
      isSubmitting.current = true;
      setLoading(true);
      setError(null);
      console.log('🔄 Starting login process');
      
      const timeoutId = setTimeout(() => {
        if (loading) {
          setLoading(false);
          isSubmitting.current = false;
          setError('Request timed out. Please try again.');
        }
      }, 15000);

      const response = await login(email, password);
      clearTimeout(timeoutId);
      console.log('✅ Login process completed', response);

      // Check if we have the required data
      if (!response || !response.access_token) {
        throw new Error('Invalid response: Missing access token');
      }

      // Store auth token and user data
      await Promise.all([
        storeAuthToken(response.access_token),
        storeUserData(response.user || {})
      ]);
      
      // Use gender from response.user instead of AsyncStorage
      if (response.user && response.user.gender) {
        navigation.replace('DailyPlan', { gender: response.user.gender, taskType: 'daily' });
      } else {
        // If no gender is set, navigate to gender selection
        navigation.replace('GenderSelect');
      }
    } catch (error: any) {
      console.error('❌ Login process failed:', error);
      setError(error.userMessage || error.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
      console.log('🔄 Login process reset');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login');
    } catch (error) {
      // Handle error
    }
  };

  if (loading && !error) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back!</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(null);
          }}
          secureTextEntry
          editable={!loading}
        />
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          style={styles.linkButton}
          disabled={loading}
        >
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.link}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#666',
  },
  link: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default Login; 