import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightButtonText?: string;
  rightButtonDisabled?: boolean;
  onBackPress?: () => void;
  onRightButtonPress?: () => void;
  style?: any;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  rightButtonText,
  rightButtonDisabled = false,
  onBackPress,
  onRightButtonPress,
  style,
}) => {
  return (
    <View style={[styles.header, style]}>
      {showBackButton ? (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Svg width="11" height="20" viewBox="0 0 11 20" fill="none">
            <Path d="M10.62 0.990281C10.5039 0.873873 10.366 0.781516 10.2141 0.7185C10.0622 0.655484 9.89942 0.623047 9.735 0.623047C9.57058 0.623047 9.40778 0.655484 9.25592 0.7185C9.10406 0.781516 8.96612 0.873873 8.85 0.990281L0.540003 9.30028C0.447299 9.3928 0.373752 9.50268 0.32357 9.62366C0.273389 9.74463 0.247559 9.87431 0.247559 10.0053C0.247559 10.1362 0.273389 10.2659 0.32357 10.3869C0.373752 10.5079 0.447299 10.6178 0.540003 10.7103L8.85 19.0203C9.34 19.5103 10.13 19.5103 10.62 19.0203C11.11 18.5303 11.11 17.7403 10.62 17.2503L3.38 10.0003L10.63 2.75028C11.11 2.27028 11.11 1.47028 10.62 0.990281Z" fill="#3B3B3B"/>
          </Svg>
        </TouchableOpacity>
      ) : (
        <View style={styles.backButton} />
      )}
      
      <Text style={styles.headerTitle}>{title}</Text>
      
      {rightButtonText ? (
        <TouchableOpacity 
          style={[styles.nextButton, rightButtonDisabled && styles.nextButtonDisabled]}
          onPress={onRightButtonPress}
          disabled={rightButtonDisabled}
        >
          <Text style={[styles.nextButtonText, rightButtonDisabled && styles.nextButtonTextDisabled]}>
            {rightButtonText}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.nextButton} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B3B3B',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  nextButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '700',
  },
  nextButtonTextDisabled: {
    color: '#999',
  },
});

export default Header; 