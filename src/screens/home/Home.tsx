import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';

// Import SVG files directly
import LongTermGoalMale from '../../assets/images/home-male/long-term-goal.svg';
import RecurringGoalMale from '../../assets/images/home-male/recurring-goal.svg';
import PlanDayMale from '../../assets/images/home-male/plan-day.svg';
import LongTermGoalFemale from '../../assets/images/home-female/long-term-goal.svg';
import RecurringGoalFemale from '../../assets/images/home-female/recurring-goal.svg';
import PlanDayFemale from '../../assets/images/home-female/plan-day.svg';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

interface GoalCardProps {
  title: string;
  description: string;
  imageSource: any;
  onPress: () => void;
  gender: 'male' | 'female';
}

const GoalCard: React.FC<GoalCardProps> = ({ title, description, imageSource: ImageSource, onPress, gender }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardImageContainer}>
      <ImageSource width="100%" height="100%" />
    </View>
    <View style={styles.cardContent}>
      <View style={styles.cardContentBottom}>
      </View>
      <View style={styles.cardContentBottomText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const gender = route.params?.gender || 'male'; // Default to male if not specified

  // Define image paths based on gender
  const getImageSource = (imageName: string) => {
    if (gender === 'male') {
      switch(imageName) {
        case 'long-term-goal':
          return LongTermGoalMale;
        case 'recurring-goal':
          return RecurringGoalMale;
        case 'plan-day':
          return PlanDayMale;
        default:
          return PlanDayMale;
      }
    } else {
      switch(imageName) {
        case 'long-term-goal':
          return LongTermGoalFemale;
        case 'recurring-goal':
          return RecurringGoalFemale;
        case 'plan-day':
          return PlanDayFemale;
        default:
          return PlanDayFemale;
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#ffff"
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.gradient}>
          <View style={styles.header}>
            {/* <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="black" />
            </TouchableOpacity> */}
            <Text style={styles.headerTitle}>Set Your First Goal</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <GoalCard
              title="Set Long-Term Goal"
              description="Define your target, identity milestones, and create an action plan"
              imageSource={getImageSource('long-term-goal')}
              onPress={() => navigation.navigate('SelectCategory', { taskType: 'long-term', gender })}
              gender={gender}
            />
            
            <GoalCard
              title="Set Recurring Goal"
              description="Create a routine and set schedule"
              imageSource={getImageSource('recurring-goal')}
              onPress={() => navigation.navigate('SelectCategory', { taskType: 'recurring', 
                gender })}
              gender={gender}
            />
            
            <GoalCard
              title="Plan Your Day"
              description="Create Today's To Do List"
              imageSource={getImageSource('plan-day')}
              onPress={() => navigation.navigate('DailyPlan', { taskType: 'daily', gender })}
              gender={gender}
            />

            <GoalCard
              title="Custom Goal"
              description="Set personalized targets tailored to your need"
              imageSource={getImageSource('plan-day')} // Using plan-day as placeholder
              onPress={() => navigation.navigate('SelectCategory', { taskType: 'custom', gender })}
              gender={gender}
            />
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
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  card: {
    height: 200,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 10,
  },
  cardImageContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    marginTop: 'auto',
  },
  cardContentBottom:{
    backgroundColor: 'background: rgba(21, 27, 115, 1)',
    height: 50,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden'
  },
  cardContentBottomText: {
    position: 'absolute',
    width: '96%',
    padding: 5,
    bottom: 10,
    left: '2%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});

export default Home; 