import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelectUnit'>;
type RouteType = RouteProp<RootStackParamList, 'SelectUnit'>;

interface UnitCategory {
  title: string;
  units: string[];
}

const unitCategories: UnitCategory[] = [
  {
    title: 'Weight',
    units: ['lbs', 'Kg'],
  },
  {
    title: 'Distance',
    units: ['Miles', 'Km'],
  },
  {
    title: 'Height',
    units: ['Ft', 'Inches', 'Cm'],
  },
  {
    title: 'Volume',
    units: ['Cups', 'Fl oz', 'Ml'],
  },
  {
    title: 'Energy',
    units: ['Kcal', 'Kj'],
  },
  {
    title: 'Time',
    units: ['Cups', 'Hours and Min', 'Mi'],
  },
  {
    title: 'Currency',
    units: ['$', '£', '€'],
  },
  {
    title: 'Other',
    units: ['%', 'Steps', 'Repetition', 'Laps', 'Write In Your Own Words'],
  },
];

const SelectUnit = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const [customUnit, setCustomUnit] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const handleUnitSelect = (unit: string) => {
    setSelectedUnit(unit);
  };

  const handleDone = () => {
    if (selectedUnit) {
      navigation.navigate('RecurringGoal', {
        selectedUnit,
        taskType: 'recurring',
        gender: route.params?.gender || 'male',
        goalTitle: route.params?.goalTitle || '',
        category: route.params?.category,
        target: route.params?.target || '',
        evaluationType: route.params?.evaluationType || undefined
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set Unit</Text>
          <TouchableOpacity 
            onPress={handleDone}
            style={[styles.doneButton, !selectedUnit && styles.doneButtonDisabled]}
            disabled={!selectedUnit}
          >
            <Text style={[styles.doneButtonText, !selectedUnit && styles.doneButtonTextDisabled]}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter Unit or select from the list below"
            value={customUnit}
            onChangeText={setCustomUnit}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.addButton}>
            <Icon name="add" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {unitCategories.map((category, index) => (
            <View key={index} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <View style={styles.unitsContainer}>
                {category.units.map((unit, unitIndex) => (
                  <TouchableOpacity
                    key={unitIndex}
                    style={styles.unitOption}
                    onPress={() => handleUnitSelect(unit)}
                  >
                    <View style={styles.radioButton}>
                      {selectedUnit === unit && <View style={styles.radioSelected} />}
                    </View>
                    <Text style={styles.unitText}>{unit}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  doneButtonDisabled: {
    opacity: 0.5,
  },
  doneButtonText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '400',
  },
  doneButtonTextDisabled: {
    color: '#999',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    marginLeft: 8,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  categorySection: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  unitsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  unitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  unitText: {
    fontSize: 16,
    color: '#333',
  },
});

export default SelectUnit; 