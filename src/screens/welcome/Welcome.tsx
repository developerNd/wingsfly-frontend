import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';

// Import SVG files
import Land from '../../assets/svg/welcome/land.svg';
import MalePerson from '../../assets/svg/welcome/male-person.svg';
import FemalePerson from '../../assets/svg/welcome/female-person.svg';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
type WelcomeScreenRouteProp = RouteProp<RootStackParamList, 'Welcome'>;

const Welcome = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const route = useRoute<WelcomeScreenRouteProp>();
  const isDarkMode = useColorScheme() === 'dark';
  const { gender } = route.params;

  const handleGetStarted = () => {
    navigation.navigate('Home', { gender });
  };

  const PersonIcon = gender === 'male' ? MalePerson : FemalePerson;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#1E0F2D', '#3353A1', '#201135']}
        style={styles.gradient}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.heading}>
              {/* Welcome{gender === 'male' ? ' Sir' : ' Ma\'am'}! */}
              Plan your goals easiest way possible.
            </Text>
            <Text style={styles.subheading}>
            Find interesting methods, designs & create plan utmost detail for your goals.
            </Text>
          </View>

          <View style={styles.illustrationContainer}>
            {/* Background Mountains */}
            <Land style={styles.backgroundMountains} width="100%" height="100%" preserveAspectRatio="xMidYMax meet" />
            
            {/* Gender-specific person with flag */}
            <PersonIcon style={styles.person} preserveAspectRatio="xMidYMax meet" />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonText}>Get Started Now</Text>
            </View>
            <View style={styles.buttonIconContainer}>
              <Icon name="arrow-forward" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  textContainer: {
    marginTop: 40,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  subheading: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
  illustrationContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  backgroundMountains: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    width: '100%',
    height: 'auto',
  },
  person: {
    position: 'absolute',
    bottom: 200,
    right: 50
  },
  button: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: 'rgba(89, 70, 148, 0.52)',
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
    marginTop: 40,
    justifyContent: 'space-between',
  },
  buttonTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonIconContainer: {
    backgroundColor: 'rgba(130, 111, 186, 0.88)',
    borderRadius: 50,
    padding: 20,
  },
});

export default Welcome; 