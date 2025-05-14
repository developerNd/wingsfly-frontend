import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({ value, onValueChange }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={[styles.customSwitch, value ? styles.customSwitchEnabled : styles.customSwitchDisabled]}
    >
      <View style={[styles.switchTrack, value ? styles.switchTrackEnabled : styles.switchTrackDisabled]}>
        <Animated.View
          style={[
            styles.switchThumb,
            value ? styles.switchThumbEnabled : styles.switchThumbDisabled,
            { left: value ? 22 : 2 },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  customSwitch: {
    // width: 44,
    // height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    // borderColor: '#232A6E',
    // backgroundColor: '#fff',
    // justifyContent: 'center',
    // padding: 0,
  },
  customSwitchEnabled: {
    borderColor: '#232A6E',
  },
  customSwitchDisabled: {
    borderColor: '#CAC9C9',
  },
  switchTrack: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CAC9C9',
    position: 'relative',
    justifyContent: 'center',
  },
  switchTrackEnabled: {
    backgroundColor: '#FFFFFF',
  },
  switchTrackDisabled: {
    backgroundColor: '#CAC9C9',
  },
  switchThumb: {
    position: 'absolute',
    // top: 2,
    // bottom: 2,
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    zIndex: 2,
  },
  switchThumbEnabled: {
    right: 1,
    backgroundColor: '#232A6E',
  },
  switchThumbDisabled: {
    left: 1,
  },
});

export default CustomSwitch; 