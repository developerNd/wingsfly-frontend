import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/AppNavigator';

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DefineHabit'>;

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelPosition = new Animated.Value(value || isFocused ? 1 : 0);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(labelPosition, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(labelPosition, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    position: 'absolute' as const,
    left: 0,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [multiline ? 16 : 18, -8],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: ['#999', '#666'],
    }),
    backgroundColor: '#fff',
    paddingHorizontal: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 4],
    }),
  };

  return (
    <View style={styles.inputContainer}>
      <Animated.Text style={[labelStyle]}>
        {value || isFocused ? label : ''}
      </Animated.Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          isFocused && styles.inputFocused,
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={!isFocused ? label : placeholder}
        placeholderTextColor="#999"
        multiline={multiline}
      />
    </View>
  );
};

const DefineHabit = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'DefineHabit'>>();
  const [habit, setHabit] = useState('');
  const [description, setDescription] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Define Your Habit</Text>
        <TouchableOpacity 
          style={[
            styles.nextButton,
            !habit && styles.nextButtonDisabled
          ]}
          disabled={!habit}
          onPress={() => {
            if (habit) {
              navigation.navigate('HabitFrequency', {
                ...route.params,
                habit,
                description,
              });
            }
          }}
        >
          <Text style={[
            styles.nextButtonText,
            !habit && styles.nextButtonTextDisabled
          ]}>Next</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FloatingLabelInput
          label="Habit"
          value={habit}
          onChangeText={setHabit}
          placeholder="e.g. Go to sleep early"
        />
        <View style={styles.spacer} />
        <FloatingLabelInput
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      <View style={styles.progressIndicator}>
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressDotInactive]} />
        <View style={[styles.progressDot, styles.progressDotInactive]} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  nextButton: {
    padding: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
  },
  multilineInput: {
    height: 100,
    paddingTop: 16,
    paddingBottom: 16,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: '#007AFF',
  },
  spacer: {
    height: 16,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
    gap: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  progressDotInactive: {
    backgroundColor: '#E5E5E5',
  },
});

export default DefineHabit; 