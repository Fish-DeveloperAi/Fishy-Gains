import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { initDatabase } from './database/db';

import HomeScreen from './screens/HomeScreen';
import RoutinesScreen from './screens/RoutinesScreen';
import EditRoutineScreen from './screens/EditRoutineScreen';
import StartRoutineScreen from './screens/StartRoutineScreen';
import ExercisePickerScreen from './screens/ExercisePickerScreen';
import AddExerciseScreen from './screens/AddExerciseScreen';
import LogWorkoutScreen from './screens/LogWorkoutScreen';
import FinishWorkoutScreen from './screens/FinishWorkoutScreen';
import BodyLogScreen from './screens/BodyLogScreen';
import ExerciseHistoryScreen from './screens/ExerciseHistoryScreen';

const Stack = createNativeStackNavigator();

export const COLORS = {
  background: '#0B1D3A',
  card: '#12274D',
  cardAlt: '#162C54',
  accent: '#00D2D3',
  textPrimary: '#FFFFFF',
  textSecondary: '#7C8DAF',
  danger: '#FF5C5C',
};

const NavTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.background,
    text: COLORS.textPrimary,
    border: COLORS.background,
    primary: COLORS.accent,
  },
};

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.background },
  headerTintColor: COLORS.textPrimary,
  headerTitleStyle: { fontWeight: '700', fontSize: 17 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: COLORS.background },
  headerBackTitleVisible: false,
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      initDatabase();
      setReady(true);
    } catch (e) {
      setError(e && e.message ? e.message : 'Failed to initialize database');
    }
  }, []);

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="warning-outline" size={48} color={COLORS.danger} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={NavTheme}>
        <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Fishy Gains' }} />
          <Stack.Screen name="Routines" component={RoutinesScreen} options={{ title: 'Routines' }} />
          <Stack.Screen name="EditRoutine" component={EditRoutineScreen} options={{ title: 'Edit Routine' }} />
          <Stack.Screen name="StartRoutine" component={StartRoutineScreen} options={{ title: 'Routine Preview' }} />
          <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} options={{ title: 'Add Exercise', presentation: 'modal' }} />
          <Stack.Screen name="AddExercise" component={AddExerciseScreen} options={{ title: 'New Exercise', presentation: 'modal' }} />
          <Stack.Screen name="LogWorkout" component={LogWorkoutScreen} options={{ title: 'Workout', headerBackVisible: false, gestureEnabled: false }} />
          <Stack.Screen name="FinishWorkout" component={FinishWorkoutScreen} options={{ title: 'Workout Complete', headerBackVisible: false, gestureEnabled: false }} />
          <Stack.Screen name="BodyLog" component={BodyLogScreen} options={{ title: 'Body Tracking' }} />
          <Stack.Screen name="ExerciseHistory" component={ExerciseHistoryScreen} options={{ title: 'Exercise History' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  errorMessage: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});