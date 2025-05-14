import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  style?: any;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  style,
}) => {
  const renderStep = (stepNumber: number) => {
    const isCompleted = stepNumber < currentStep;
    const isCurrent = stepNumber === currentStep;

    return (
      <View key={stepNumber} style={styles.progressStep}>
        <View style={[
          styles.stepCircle,
          isCompleted && styles.completedStep,
          isCurrent && styles.currentStep,
        ]}>
          {isCompleted ? (
            <Icon name="check" size={16} color="#fff" />
          ) : (
            <Text style={styles.stepNumber}>{stepNumber}</Text>
          )}
        </View>
        {stepNumber < totalSteps && (
          <View style={[
            styles.stepLine,
            isCompleted && styles.completedLine,
          ]} />
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map(renderStep)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  completedStep: {
    backgroundColor: '#3F51B5',
  },
  currentStep: {
    backgroundColor: '#3F51B5',
    borderWidth: 2,
    borderColor: '#3F51B5',
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  completedLine: {
    backgroundColor: '#3F51B5',
  },
  stepNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProgressIndicator; 