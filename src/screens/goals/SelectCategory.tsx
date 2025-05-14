import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Shadow } from 'react-native-shadow-2';
import Layout from '../../components/Layout';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 16px padding on each side, 16px gap

interface Category {
  id: number;
  title: string;
  image: any;
  color: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelectCategory'>;
type RouteType = RouteProp<RootStackParamList, 'SelectCategory'>;

// Extend the taskType to include all possible values
type ExtendedTaskType = 'habit' | 'goal-of-the-day' | 'task' | 'recurringTask' | 'long-term' | 'recurring' | 'daily' | 'custom';

const SelectCategory = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { taskType, gender, goalTitle, isFromAdd, isFromDailyPlan, selectedOption } = route.params;
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const getCategoryImage = (categoryName: string) => {
    if (gender === 'male') {
      switch (categoryName) {
        case 'Work & Career':
          return require('../../assets/images/category-male/work-career.jpeg');
        case 'Health & Wellness':
          return require('../../assets/images/category-male/health-wellness.jpeg');
        case 'Love & Relationship':
          return require('../../assets/images/category-male/love-relationship.jpeg');
        case 'Money & Finances':
          return require('../../assets/images/category-male/money.jpeg');
        case 'Spirituality & Faith':
          return require('../../assets/images/category-male/spirtuality-faith.jpeg');
        case 'Personal & Growth':
          return require('../../assets/images/category-male/personal-growth.jpeg');
        case 'Other Goals':
          return require('../../assets/images/category-male/other-goals.jpeg');
        case 'Create a category':
          return require('../../assets/images/category-male/create-category.jpeg');
        default:
          return require('../../assets/images/category-male/other-goals.jpeg');
      }
    } else {
      switch (categoryName) {
        case 'Work & Career':
          return require('../../assets/images/category-female/work-career.jpeg');
        case 'Health & Wellness':
          return require('../../assets/images/category-female/health-wellness.jpeg');
        case 'Love & Relationship':
          return require('../../assets/images/category-female/love-family.jpeg');
        case 'Money & Finances':
          return require('../../assets/images/category-female/money.jpeg');
        case 'Spirituality & Faith':
          return require('../../assets/images/category-female/spirtuality-faith.jpeg');
        case 'Personal & Growth':
          return require('../../assets/images/category-female/personal-growth.jpeg');
        case 'Other Goals':
          return require('../../assets/images/category-female/other-goals.jpeg');
        case 'Create a category':
          return require('../../assets/images/category-female/create-category.jpeg');
        default:
          return require('../../assets/images/category-female/other-goals.jpeg');
      }
    }
  };

  const categories: Category[] = [
    {
      id: 1,
      title: 'Work & Career',
      image: getCategoryImage('Work & Career'),
      color: '#FF725C',
    },
    {
      id: 2,
      title: 'Health & Wellness',
      image: getCategoryImage('Health & Wellness'),
      color: '#4CAF50',
    },
    {
      id: 3,
      title: 'Love & Relationship',
      image: getCategoryImage('Love & Relationship'),
      color: '#FF4081',
    },
    {
      id: 4,
      title: 'Money & Finances',
      image: getCategoryImage('Money & Finances'),
      color: '#FFC107',
    },
    {
      id: 5,
      title: 'Spirituality & Faith',
      image: getCategoryImage('Spirituality & Faith'),
      color: '#9C27B0',
    },
    {
      id: 6,
      title: 'Personal & Growth',
      image: getCategoryImage('Personal & Growth'),
      color: '#2196F3',
    },
    {
      id: 7,
      title: 'Other Goals',
      image: getCategoryImage('Other Goals'),
      color: '#607D8B',
    },
    {
      id: 8,
      title: 'Create a category',
      image: getCategoryImage('Create a category'),
      color: '#E0E0E0',
    },
  ];

  interface CategoryCardProps {
    title: string;
    image: any;
    onPress: () => void;
    isCreateNew?: boolean;
    isSelected?: boolean;
  }

  const CategoryCard: React.FC<CategoryCardProps> = ({ 
      title, 
      image, 
      onPress, 
      isCreateNew,
      isSelected 
    }) => (
    <Shadow distance={2} 
              startColor="rgba(0,0,0,0.1)"
              endColor="rgba(0,0,0,0)" 
              offset={[0, 0.25]} 
    >

   
    <TouchableOpacity 
      style={[
        styles.categoryCard,
        isCreateNew && styles.createNewCard,
        isSelected && styles.selectedCard
      ]} 
      onPress={onPress}
    >
      <Image source={image} style={styles.categoryImage} resizeMode="cover" />
      <Text style={styles.categoryTitle}>{title}</Text>
    </TouchableOpacity>
    </Shadow>
  );

  const handleCategorySelection = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleNext = () => {
    if (!selectedCategory) {
      console.error('No category selected');
      return;
    }

    const { taskType, gender, goalTitle, isFromAdd, isFromDailyPlan, selectedOption } = route.params;

    // All task types from DailyPlan should go through DailyPlanEvaluation
    if (isFromDailyPlan) {
      navigation.navigate('DailyPlanEvaluation', {
        category: selectedCategory.title,
        taskType,
        gender,
        selectedOption: selectedOption || ''
      });
      return;
    }

    // If we're updating a category from RecurringGoal, go back with the new category
    if (isFromAdd) {
      navigation.navigate('RecurringGoal', {
        category: selectedCategory.title,
        taskType: 'recurring',
        gender,
        goalTitle: goalTitle || ''
      });
      return;
    }

    // Map task types to their corresponding navigation types
    let mappedTaskType: 'daily' | 'recurring' | 'long-term' | 'custom';
    switch (taskType as ExtendedTaskType) {
      case 'habit':
      case 'goal-of-the-day':
      case 'task':
      case 'recurringTask':
        mappedTaskType = 'daily';
        break;
      case 'recurring':
        mappedTaskType = 'recurring';
        break;
      case 'long-term':
        mappedTaskType = 'long-term';
        break;
      case 'custom':
        mappedTaskType = 'custom';
        break;
      default:
        console.error('Invalid task type:', taskType);
        return;
    }

    switch (mappedTaskType) {
      case 'daily':
        navigation.navigate('DailyPlanEvaluation', {
          category: selectedCategory.title,
          taskType: 'daily',
          gender,
          selectedOption: selectedOption || ''
        });
        break;
      case 'recurring':
        navigation.navigate('AddRecurringGoal', {
          category: selectedCategory.title,
          gender,
          taskType: 'recurring',
          goalTitle: goalTitle || ''
        });
        break;
      case 'long-term':
        navigation.navigate('LongTermGoal', {
          category: selectedCategory.title,
          gender,
          taskType: 'long-term'
        });
        break;
      case 'custom':
        navigation.navigate('CustomGoal', {
          category: selectedCategory.title,
          gender,
          taskType: 'custom'
        });
        break;
    }
  };

  return (
    <Layout
      title="Select Category"
      onBackPress={() => navigation.goBack()}
      rightButtonText="Next"
      rightButtonDisabled={!selectedCategory}
      onRightButtonPress={handleNext}
    >
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      >
        {categories.slice(0, -1).map((category) => (
          <CategoryCard
            key={category.id}
            title={category.title}
            image={category.image}
            onPress={() => handleCategorySelection(category)}
            isSelected={selectedCategory?.id === category.id}
          />
        ))}
        <CategoryCard
          title="Create a Category"
          image={categories[categories.length - 1].image}
          onPress={() => {/* Handle create category */}}
          isCreateNew={true}
        />
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    // height: 56,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  scrollContent: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 1,
  },
  categoryCard: {
    width: (Dimensions.get('window').width - 48) / 2,
    height: (Dimensions.get('window').width - 48) / 2,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  createNewCard: {
    // borderWidth: 1,
    // borderColor: '#007AFF',
    // borderStyle: 'dashed',
    backgroundColor: '#fff',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 14,
    padding: 6,
    borderRadius: 6,
    width: '92%',
    borderWidth: 0.2,
    borderColor: 'rgba(83, 83, 83, 1)',
    borderStyle: 'solid',
  },
  nextButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
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
  selectedCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
});

export default SelectCategory; 