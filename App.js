import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { initDatabase } from './database/db';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { GamificationProvider } from './context/GamificationContext'; 
import { LanguageProvider, useLanguage } from './context/LanguageContext';

import HomeScreen from './screens/HomeScreen';
import RoutinesScreen from './screens/RoutinesScreen';
import EditRoutineScreen from './screens/EditRoutineScreen';
import StartRoutineScreen from './screens/StartRoutineScreen';
import ExercisePickerScreen from './screens/ExercisePickerScreen';
import AddExerciseScreen from './screens/AddExerciseScreen';
import LogWorkoutScreen from './screens/LogWorkoutScreen';
import FinishWorkoutScreen from './screens/FinishWorkoutScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import BodyLogScreen from './screens/BodyLogScreen';
import ExerciseHistoryScreen from './screens/ExerciseHistoryScreen';
import WorkoutSummaryScreen from './screens/WorkoutSummaryScreen';
import SettingsScreen from './screens/SettingsScreen'; 
import ThemePickerScreen from './screens/ThemePickerScreen';

const Stack = createNativeStackNavigator();

function MainApp() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  // `t` is kept in a ref so switching language never re-runs the database
  // initialisation (the effect used to list `t` as a dependency).
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    try {
      initDatabase();
      setReady(true);
    } catch (e) {
      setError(e && e.message ? e.message : tRef.current('failedToInitDb'));
    }
  }, []);

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
        <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>{t('somethingWentWrong')}</Text>
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
          <Stack.Screen name="Routines" component={RoutinesScreen} options={{ title: t('routinesTitle') }} />
          <Stack.Screen name="EditRoutine" component={EditRoutineScreen} options={{ title: t('editRoutine') }} />
          <Stack.Screen name="StartRoutine" component={StartRoutineScreen} options={{ title: t('routinePreview') }} />
          <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} options={{ title: t('addExercise'), presentation: 'modal' }} />
          <Stack.Screen name="AddExercise" component={AddExerciseScreen} options={{ title: t('newExerciseTitle'), presentation: 'modal' }} />
          <Stack.Screen name="LogWorkout" component={LogWorkoutScreen} options={{ title: t('workoutTitle'), headerBackVisible: false, gestureEnabled: false }} />
          <Stack.Screen name="FinishWorkout" component={FinishWorkoutScreen} options={{ title: t('workoutComplete'), headerBackVisible: false, gestureEnabled: false }} />
          <Stack.Screen name="BodyLog" component={BodyLogScreen} options={{ title: t('bodyTracking') }} />
          <Stack.Screen name="ExerciseHistory" component={ExerciseHistoryScreen} options={{ title: t('exerciseHistoryTitle') }} />
          <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} options={{ title: t('workoutSummary') }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false}} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ title: t('trophyCase') }} />
          <Stack.Screen name="ThemePickerScreen" component={ThemePickerScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <GamificationProvider>
          <MainApp />
        </GamificationProvider>
      </LanguageProvider>
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