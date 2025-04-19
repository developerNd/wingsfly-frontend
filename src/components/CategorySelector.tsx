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
import { TASK_CATEGORIES } from '../config/constants';

interface CategorySelectorProps {
  isVisible: boolean;
  selectedCategory: string;
  onClose: () => void;
  onSelect: (category: string) => void;
}

const CategorySelector = ({
  isVisible,
  selectedCategory,
  onClose,
  onSelect,
}: CategorySelectorProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Work and Career':
        return 'work';
      case 'Health and Fitness':
        return 'fitness-center';
      case 'Personal Development':
        return 'school';
      case 'Family and Relationships':
        return 'people';
      case 'Finance':
        return 'account-balance';
      case 'Recreation and Hobbies':
        return 'sports-esports';
      case 'Home and Environment':
        return 'home';
      default:
        return 'category';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Work and Career':
        return '#2196F3';
      case 'Health and Fitness':
        return '#4CAF50';
      case 'Personal Development':
        return '#9C27B0';
      case 'Family and Relationships':
        return '#E91E63';
      case 'Finance':
        return '#FF9800';
      case 'Recreation and Hobbies':
        return '#00BCD4';
      case 'Home and Environment':
        return '#8BC34A';
      default:
        return '#757575';
    }
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(item) }]}>
        <Icon name={getCategoryIcon(item)} size={20} color="#fff" />
      </View>
      <Text style={styles.categoryText}>{item}</Text>
      {selectedCategory === item && (
        <Icon name="check" size={20} color={getCategoryColor(item)} />
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
            <Text style={styles.headerTitle}>Select Category</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={TASK_CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryList}
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
  categoryList: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});

export default CategorySelector; 