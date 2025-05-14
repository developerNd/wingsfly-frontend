import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
//   ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

interface TimePickerProps {
  hour: string;
  minute: string;
  amPm: string;
  onHourChange: (hour: string) => void;
  onMinuteChange: (minute: string) => void;
  onAmPmChange: (amPm: string) => void;
  hourOptions?: string[];
  minuteOptions?: string[];
  amPmOptions?: string[];
  itemHeight?: number;
  containerStyle?: any;
  columnStyle?: any;
  labelStyle?: any;
  optionStyle?: any;
  selectedOptionStyle?: any;
  optionTextStyle?: any;
  selectedOptionTextStyle?: any;
  selectionIndicatorStyle?: any;
}

const TimePicker: React.FC<TimePickerProps> = ({
  hour,
  minute,
  amPm,
  onHourChange,
  onMinuteChange,
  onAmPmChange,
  hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')),
  minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')),
  amPmOptions = ['AM', 'PM'],
  itemHeight = 40,
  containerStyle,
  columnStyle,
  labelStyle,
  optionStyle,
  selectedOptionStyle,
  optionTextStyle,
  selectedOptionTextStyle,
  selectionIndicatorStyle,
}) => {
  // Refs for scroll views
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const amPmScrollRef = useRef<ScrollView>(null);
  
  // State to track if scrolling is in progress
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Timeout refs to clear previous timeouts
  const hourTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minuteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const amPmTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to handle scroll and select the centered value
  const handleScroll = (
    scrollY: number,
    options: string[],
    setter: (value: string) => void,
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
  ) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout to update the value after scrolling stops
    timeoutRef.current = setTimeout(() => {
      // Calculate which item is closest to the center
      const itemIndex = Math.round(scrollY / itemHeight);
      
      // Ensure the index is within bounds
      if (itemIndex >= 0 && itemIndex < options.length) {
        setter(options[itemIndex]);
      }
    }, 150); // Debounce time
  };
  
  // Function to handle scroll end
  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    options: string[],
    setter: (value: string) => void
  ) => {
    const y = event.nativeEvent.contentOffset.y;
    const itemIndex = Math.round(y / itemHeight);
    
    // Ensure the index is within bounds
    if (itemIndex >= 0 && itemIndex < options.length) {
      setter(options[itemIndex]);
    }
  };

  // Initialize scroll positions when component mounts
  useEffect(() => {
    // Calculate initial scroll positions based on current values
    const hourIndex = hourOptions.indexOf(hour);
    const minuteIndex = minuteOptions.indexOf(minute);
    const amPmIndex = amPmOptions.indexOf(amPm);
    
    // Scroll to the correct positions
    setTimeout(() => {
      if (hourScrollRef.current && hourIndex >= 0) {
        hourScrollRef.current.scrollTo({ y: hourIndex * itemHeight, animated: false });
      }
      if (minuteScrollRef.current && minuteIndex >= 0) {
        minuteScrollRef.current.scrollTo({ y: minuteIndex * itemHeight, animated: false });
      }
      if (amPmScrollRef.current && amPmIndex >= 0) {
        amPmScrollRef.current.scrollTo({ y: amPmIndex * itemHeight, animated: false });
      }
    }, 100);
  }, []); // Empty dependency array means this runs once when component mounts

  return (
    <View style={[styles.timePickerContainer, containerStyle]}>
      <View style={[styles.timePickerColumn, columnStyle]}>
        <Text style={[styles.timePickerLabel, labelStyle]}>Hour</Text>
        <View style={styles.timePickerWrapper}>
          <View style={[styles.timePickerSelectionIndicator, selectionIndicatorStyle]} />
          <ScrollView 
            ref={hourScrollRef}
            style={styles.timePickerScroll}
            showsVerticalScrollIndicator={false}
            snapToInterval={itemHeight}
            decelerationRate="fast"
            contentContainerStyle={styles.timePickerContent}
            onScrollBeginDrag={() => setIsScrolling(true)}
            onScrollEndDrag={() => setIsScrolling(false)}
            onMomentumScrollEnd={(event) => handleScrollEnd(event, hourOptions, onHourChange)}
            onScroll={(event) => {
              const y = event.nativeEvent.contentOffset.y;
              handleScroll(y, hourOptions, onHourChange, hourTimeoutRef);
            }}
          >
            {hourOptions.map((hourOption) => (
              <View
                key={`hour-${hourOption}`}
                style={[
                  styles.timePickerOption,
                  optionStyle,
                  hourOption === hour && styles.selectedTimeOption,
                  hourOption === hour && selectedOptionStyle
                ]}
              >
                <Text style={[
                  styles.timePickerOptionText,
                  optionTextStyle,
                  hourOption === hour && styles.selectedTimeOptionText,
                  hourOption === hour && selectedOptionTextStyle
                ]}>{hourOption}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
      
      <View style={[styles.timePickerColumn, columnStyle]}>
        <Text style={[styles.timePickerLabel, labelStyle]}>Minute</Text>
        <View style={styles.timePickerWrapper}>
          <View style={[styles.timePickerSelectionIndicator, selectionIndicatorStyle]} />
          <ScrollView 
            ref={minuteScrollRef}
            style={styles.timePickerScroll}
            showsVerticalScrollIndicator={false}
            snapToInterval={itemHeight}
            decelerationRate="fast"
            contentContainerStyle={styles.timePickerContent}
            onScrollBeginDrag={() => setIsScrolling(true)}
            onScrollEndDrag={() => setIsScrolling(false)}
            onMomentumScrollEnd={(event) => handleScrollEnd(event, minuteOptions, onMinuteChange)}
            onScroll={(event) => {
              const y = event.nativeEvent.contentOffset.y;
              handleScroll(y, minuteOptions, onMinuteChange, minuteTimeoutRef);
            }}
          >
            {minuteOptions.map((minuteOption) => (
              <View
                key={`minute-${minuteOption}`}
                style={[
                  styles.timePickerOption,
                  optionStyle,
                  minuteOption === minute && styles.selectedTimeOption,
                  minuteOption === minute && selectedOptionStyle
                ]}
              >
                <Text style={[
                  styles.timePickerOptionText,
                  optionTextStyle,
                  minuteOption === minute && styles.selectedTimeOptionText,
                  minuteOption === minute && selectedOptionTextStyle
                ]}>{minuteOption}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
      
      <View style={[styles.timePickerColumn, columnStyle]}>
        <Text style={[styles.timePickerLabel, labelStyle]}>AM/PM</Text>
        <View style={styles.timePickerWrapper}>
          <View style={[styles.timePickerSelectionIndicator, selectionIndicatorStyle]} />
          <ScrollView 
            ref={amPmScrollRef}
            style={styles.timePickerScroll}
            showsVerticalScrollIndicator={false}
            snapToInterval={itemHeight}
            decelerationRate="fast"
            contentContainerStyle={styles.timePickerContent}
            onScrollBeginDrag={() => setIsScrolling(true)}
            onScrollEndDrag={() => setIsScrolling(false)}
            onMomentumScrollEnd={(event) => handleScrollEnd(event, amPmOptions, onAmPmChange)}
            onScroll={(event) => {
              const y = event.nativeEvent.contentOffset.y;
              handleScroll(y, amPmOptions, onAmPmChange, amPmTimeoutRef);
            }}
          >
            {amPmOptions.map((amPmOption) => (
              <View
                key={`ampm-${amPmOption}`}
                style={[
                  styles.timePickerOption,
                  optionStyle,
                  amPmOption === amPm && styles.selectedTimeOption,
                  amPmOption === amPm && selectedOptionStyle
                ]}
              >
                <Text style={[
                  styles.timePickerOptionText,
                  optionTextStyle,
                  amPmOption === amPm && styles.selectedTimeOptionText,
                  amPmOption === amPm && selectedOptionTextStyle
                ]}>{amPmOption}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  timePickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  timePickerWrapper: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  timePickerSelectionIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 40,
    marginTop: -20,
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    zIndex: 1,
  },
  timePickerScroll: {
    height: 120,
    width: '100%',
  },
  timePickerContent: {
    paddingVertical: 40,
  },
  timePickerOption: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTimeOption: {
    backgroundColor: 'transparent',
  },
  timePickerOptionText: {
    fontSize: 16,
    color: '#666',
  },
  selectedTimeOptionText: {
    color: '#3F51B5',
    fontWeight: '600',
    fontSize: 18,
  },
});

export default TimePicker; 