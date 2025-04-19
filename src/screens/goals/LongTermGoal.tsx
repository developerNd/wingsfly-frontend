import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LongTermGoal'>;
type RoutePropType = RouteProp<RootStackParamList, 'LongTermGoal'>;

const { width } = Dimensions.get('window');

const LongTermGoal = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { category, gender } = route.params;
  const [goals, setGoals] = useState<string[]>([]);


  const getCategoryImage = () => {
    if (gender === 'male') {
      switch (category) {
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
        default:
          return require('../../assets/images/category-male/other-goals.jpeg');
      }
    } else {
      switch (category) {
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
        default:
          return require('../../assets/images/category-female/other-goals.jpeg');
      }
    }
  };

  const handleAddGoal = () => {
    setGoals([...goals, '']);
  };
  console.log('🔍 LongTermGoal', { category, gender });
  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff"
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Long Term Goal</Text>
            <TouchableOpacity>
              <Text style={styles.headerButton}>Next</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoryContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={styles.categoryCard}>
                <Image 
                  source={getCategoryImage()} 
                style={styles.categoryImage} 
                resizeMode="cover"
              />
            </View>
              <View style={styles.categoryTitleContainer}>
                <Text style={styles.categoryTitle}>{category}</Text>
              </View>
            </View>
          </View>

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {goals.map((goal, index) => (
              <View key={index} style={styles.goalInputContainer}>
                <TextInput
                  style={styles.goalInput}
                  placeholder="Enter your goal"
                  value={goal}
                  onChangeText={(text) => {
                    const newGoals = [...goals];
                    newGoals[index] = text;
                    setGoals(newGoals);
                  }}
                />
              </View>
            ))}
            <TouchableOpacity 
              style={styles.addGoalButton}
              onPress={handleAddGoal}
            >
              <Icon name="add" size={24} color="#666" />
              <Text style={styles.addGoalText}>Enter Your Long Term Goal</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
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
    height: 56,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  headerButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  categoryContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  categoryCard: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  categoryTitleContainer: {
    marginLeft: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  goalInputContainer: {
    marginBottom: 16,
  },
  goalInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  addGoalText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
});

export default LongTermGoal; 