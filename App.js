import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { initDatabase } from './database/db';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

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
import WorkoutSummaryScreen from './screens/WorkoutSummaryScreen';
import SettingsScreen from './screens/SettingsScreen'; // <-- Added Settings Screen

const Stack = createNativeStackNavigator();

// 1. We extract the actual navigation and app logic into a child component
// so it can consume the useTheme() hook from the ThemeProvider.
function MainApp() {
  const { colors } = useTheme();
  
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

  // 2. Navigation theme dynamically pulls from context
  const NavTheme = {
    ...DefaultTheme,
    dark: true,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.background,
      text: colors.textPrimary,
      border: colors.background,
      primary: colors.accent,
    },
  };

  // 3. Screen options dynamically pull from context
  const screenOptions = {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: { fontWeight: '700', fontSize: 17 },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
    headerBackButtonDisplayMode: 'minimal',
  };

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="warning-outline" size={48} color={colors.danger} />
        <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Something went wrong</Text>
        <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={NavTheme}>
        <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={({ navigation }) => ({ 
              title: 'Fishy Gains',
              headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                  <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              )
            })} 
          />
          <Stack.Screen name="Routines" component={RoutinesScreen} options={{ title: 'Routines' }} />
          <Stack.Screen name="EditRoutine" component={EditRoutineScreen} options={{ title: 'Edit Routine' }} />
          <Stack.Screen name="StartRoutine" component={StartRoutineScreen} options={{ title: 'Routine Preview' }} />
          <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} options={{ title: 'Add Exercise', presentation: 'modal' }} />
          <Stack.Screen name="AddExercise" component={AddExerciseScreen} options={{ title: 'New Exercise', presentation: 'modal' }} />
          <Stack.Screen name="LogWorkout" component={LogWorkoutScreen} options={{ title: 'Workout', headerBackVisible: false, gestureEnabled: false }} />
          <Stack.Screen name="FinishWorkout" component={FinishWorkoutScreen} options={{ title: 'Workout Complete', headerBackVisible: false, gestureEnabled: false }} />
          <Stack.Screen name="BodyLog" component={BodyLogScreen} options={{ title: 'Body Tracking' }} />
          <Stack.Screen name="ExerciseHistory" component={ExerciseHistoryScreen} options={{ title: 'Exercise History' }} />
          <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} options={{ title: 'Workout Summary' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false}} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// 4. The root App component now simply provides the Theme context to everything inside it
export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});