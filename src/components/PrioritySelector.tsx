import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TASK_PRIORITIES } from '../config/constants';

interface PrioritySelectorProps {
  isVisible: boolean;
  selectedPriority: string;
  onClose: () => void;
  onSelect: (priority: string) => void;
}

const PrioritySelector = ({
  isVisible,
  selectedPriority,
  onClose,
  onSelect,
}: PrioritySelectorProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Must':
        return '#FF4B4B';
      case 'Important':
        return '#2196F3';
      case 'Optional':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const renderPriorityItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.priorityItem}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <View style={[styles.priorityIcon, { backgroundColor: getPriorityColor(item) }]}>
        <Icon name="flag" size={20} color="#fff" />
      </View>
      <Text style={styles.priorityText}>{item}</Text>
      {selectedPriority === item && (
        <Icon name="check" size={20} color={getPriorityColor(item)} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Priority</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={TASK_PRIORITIES}
            renderItem={renderPriorityItem}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.priorityList}
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
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  priorityList: {
    padding: 16,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  priorityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  priorityText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});

export default PrioritySelector; 