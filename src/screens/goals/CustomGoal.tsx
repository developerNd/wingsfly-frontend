import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const CustomGoal = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="rgba(171, 126, 175, 1)"
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Custom Goal</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.mainContent}>
              <Text style={styles.title}>Create Custom Goal</Text>
              <Text style={styles.description}>
                Design your personalized goal with custom parameters and tracking methods.
              </Text>

              {/* Goal Type Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Goal Type</Text>
                {/* Add goal type selection components here */}
              </View>

              {/* Goal Details Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Goal Details</Text>
                {/* Add custom goal details components here */}
              </View>

              {/* Tracking Method Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tracking Method</Text>
                {/* Add tracking method components here */}
              </View>

              {/* Timeline Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Timeline</Text>
                {/* Add timeline components here */}
              </View>

              {/* Notifications Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                {/* Add notification settings components here */}
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(171, 126, 175, 1)',
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContent: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
});

export default CustomGoal; 