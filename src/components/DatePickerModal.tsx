import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerModalProps {
  isVisible: boolean;
  date: Date;
  onClose: () => void;
  onDateChange: (date: Date) => void;
}

const DatePickerModal = ({
  isVisible,
  date,
  onClose,
  onDateChange,
}: DatePickerModalProps) => {
  if (Platform.OS === 'android') {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onDateChange(date);
                onClose();
              }}
            >
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                onDateChange(selectedDate);
              }
            }}
            minimumDate={new Date()}
            style={styles.datePicker}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  doneButton: {
    fontSize: 16,
    color: '#3F51B5',
    fontWeight: '500',
  },
  datePicker: {
    backgroundColor: '#fff',
  },
});

export default DatePickerModal; 