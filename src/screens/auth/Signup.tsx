import React, { useState, useRef } from 'react';
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
import { register, getStoredGender } from '../../services/api';

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Signup = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSubmitting = useRef(false);

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    if (isSubmitting.current) {
      console.log('🔄 Signup already in progress, ignoring duplicate request');
      return;
    }

    try {
      isSubmitting.current = true;
      setLoading(true);
      setError(null);
      console.log('🔄 Starting signup process');
      await register(name, email, password, 'male');
      console.log('✅ Signup process completed');
      
      // Get the user's gender from storage
      const gender = await getStoredGender();
      console.log('✅ Retrieved user gender:', gender);
      
      // Navigate to Home screen with the user's gender
      navigation.navigate('Home', { gender: gender || 'male' });
    } catch (error: any) {
      console.error('❌ Signup process failed:', error);
      setError(error.userMessage || 'An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
      console.log('🔄 Signup process reset');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="Full Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError(null);
          }}
          autoCapitalize="words"
          editable={!loading}
        />
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
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setError(null);
          }}
          secureTextEntry
          editable={!loading}
        />
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.linkButton}
          disabled={loading}
        >
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.link}>Login</Text>
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

export default Signup; 