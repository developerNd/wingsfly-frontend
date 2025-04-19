import React, { useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'AddRecurringGoal'>;

const AddRecurringGoal = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { gender } = route.params || { gender: 'male' }; // Default to male if not provided
  const [goalTitle, setGoalTitle] = React.useState('');
  const inputRef = useRef<TextInput | null>(null);

  const handleNext = () => {
    if (goalTitle.trim()) {
      navigation.navigate('RecurringGoal', { 
        taskType: 'recurring',
        gender,
        goalTitle,
        category: route.params?.category || ''
      });
    }
  };

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
            <Text style={styles.headerTitle}>Add Recurring Goall</Text>
            <TouchableOpacity onPress={handleNext}>
              <Text style={[
                styles.headerButton,
                !goalTitle.trim() && styles.headerButtonDisabled
              ]}>Next</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Add Recurring Goal"
                value={goalTitle}
                onChangeText={setGoalTitle}
                placeholderTextColor="#666"
                autoCapitalize="sentences"
              />
              <Icon 
                name="add" 
                size={24} 
                color="#666" 
                style={styles.inputIcon}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerButton: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '400',
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  inputContainer: {
    padding: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    borderColor: 'rgba(206, 206, 206, 1)',
    borderStyle: 'solid',
    borderWidth: 1
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  inputIcon: {
    marginRight: 4,
  },
});

export default AddRecurringGoal; 