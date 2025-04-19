import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { updateGender } from '../../services/api';

type GenderSelectScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GenderSelect = () => {
  const navigation = useNavigation<GenderSelectScreenNavigationProp>();
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSubmitting = useRef(false);

  const handleGenderSelect = async (gender: 'male' | 'female') => {
    if (isSubmitting.current) {
      console.log('🔄 Gender selection already in progress, ignoring duplicate request');
      return;
    }

    try {
      isSubmitting.current = true;
      setLoading(true);
      setError(null);
      setSelectedGender(gender);
      
      console.log('🔄 Starting gender update process');
      await updateGender(gender);
      console.log('✅ Gender updated successfully');
      
      navigation.navigate('Welcome', { gender });
    } catch (error: any) {
      console.error('❌ Gender update failed:', error);
      setError(error.userMessage || 'Failed to save gender preference. Please try again.');
      setSelectedGender(null);
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Your Gender</Text>
        <Text style={styles.subtitle}>This will help us personalize your experience</Text>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.option,
              selectedGender === 'male' && styles.selectedOption,
              loading && styles.optionDisabled,
            ]}
            onPress={() => handleGenderSelect('male')}
            disabled={loading}
          >
            {/* <Image
              source={require('../../assets/male-icon.png')}
              style={styles.icon}
            /> */}
            <Text style={styles.optionText}>Male</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              selectedGender === 'female' && styles.selectedOption,
              loading && styles.optionDisabled,
            ]}
            onPress={() => handleGenderSelect('female')}
            disabled={loading}
          >
            {/* <Image
              source={require('../../assets/female-icon.png')}
              style={styles.icon}
            /> */}
            <Text style={styles.optionText}>Female</Text>
          </TouchableOpacity>
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  option: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    width: '45%',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default GenderSelect; 