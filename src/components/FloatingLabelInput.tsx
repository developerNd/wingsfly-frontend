import React, { useState } from 'react';
import {
  View,
  TextInput,
  Animated,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Shadow } from 'react-native-shadow-2';

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  style,
  inputStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelPosition = new Animated.Value(value ? 1 : 0);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
    Animated.timing(labelPosition, {
      toValue: text ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const labelStyle = {
    position: 'absolute' as const,
    left: 10,
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
      outputRange: ['#999', '#625F5F'],
    }),
    fontWeight: '700' as const,
    backgroundColor: '#fff',
    paddingHorizontal: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 4],
    }),
    zIndex: 1,
  };

  return (
    <View style={{marginBottom:10}}>
        <Shadow distance={2} startColor="rgba(0,0,0,0.1)" endColor="rgba(0,0,0,0)" offset={[0, 0.25]} style={{ width: '100%' ,backgroundColor:'#ffff'}}>
    <View style={[styles.inputContainer, style]}>
      <Animated.Text style={[labelStyle]}>
        {value ? label : ''}
      </Animated.Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          inputStyle,
        ]}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={!value ? label : placeholder}
        placeholderTextColor="#625F5F"
        multiline={multiline}
      />
    </View>
    </Shadow>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    height: 56,
    position: 'relative',
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    // ...Platform.select({
    //   ios: {
    //     shadowColor: '#000',
    //     shadowOffset: {
    //       width: 0,
    //       height: 2,
    //     },
    //     shadowOpacity: 0.1,
    //     shadowRadius: 4,
    //   },
    //   android: {
    //     elevation: 3,
    //   },
    // }),
  },
  input: {
    height: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
});

export default FloatingLabelInput; 