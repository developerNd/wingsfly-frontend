import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

interface VerticalPickerProps {
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  itemHeight?: number;
  style?: any;
  /** Show the horizontal line above the selected value (default: true) */
  showTopLine?: boolean;
  /** Show the horizontal line below the selected value (default: true) */
  showBottomLine?: boolean;
}

const VerticalPicker: React.FC<VerticalPickerProps> = ({
  options,
  selectedValue,
  onValueChange,
  itemHeight = 32,
  style,
  showTopLine = true,
  showBottomLine = true,
}) => {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const index = options.indexOf(selectedValue);
    setTimeout(() => {
      if (scrollRef.current && index >= 0) {
        scrollRef.current.scrollTo({ y: index * itemHeight, animated: false });
      }
    }, 100);
  }, [selectedValue, options, itemHeight]);

  const handleScrollEnd = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    if (index >= 0 && index < options.length) {
      onValueChange(options[index]);
    }
  };

  return (
    <View style={[{ height: itemHeight * 2, position: 'relative' }, style]}>
      {/* Top and bottom lines for selected value (optional) */}
      {showTopLine && <View style={[styles.line, { top: itemHeight / 2 }]} />}
      {showBottomLine && <View style={[styles.line, { top: itemHeight * 1.5 }]} />}
      <ScrollView
        ref={scrollRef}
        style={{ height: itemHeight * 2 }}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
      >
        <View style={{ height: itemHeight / 2 }} />
        {options.map((option) => (
          <View
            key={option}
            style={{ height: itemHeight, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={[
              styles.pickerValue,
              selectedValue === option && [
                styles.selectedValue,
                { lineHeight: itemHeight }
              ]
            ]}>
              {option}
            </Text>
          </View>
        ))}
        <View style={{ height: itemHeight / 2 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerValue: {
    fontSize: 16,
    color: '#333',
  },
  selectedValue: {
    color: '#151B73',
    fontWeight: 'bold',
    fontSize: 16,
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#BDBDBD',
    zIndex: 10,
  },
});

export default VerticalPicker;