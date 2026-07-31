import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import LogWorkoutScreen from './screens/LogWorkoutScreen';
import { initDatabase, resetExercises, seedExercises } from './database/db';
import ExercisePickerScreen from './screens/ExercisePickerScreen';
import ExerciseHistoryScreen from './screens/ExerciseHistoryScreen';
import AddExerciseScreen from './screens/AddExerciseScreen';
import RoutinesScreen from './screens/RoutinesScreen';
import EditRoutineScreen from './screens/EditRoutineScreen';
import StartRoutineScreen from './screens/StartRoutineScreen';
import BodyLogScreen from './screens/BodyLogScreen';

const Stack = createNativeStackNavigator();

const PALETTE = {
  background: '#0B1D3A', // Deep oceanic navy
  surface: '#162C54',    // Lighter navy for header/cards
  accent: '#00D2D3',     // Vibrant cyan from the fish's bicep
  textMain: '#F8FAFC',   // Crisp white
  border: '#2A4374',     // Subtle border
};

const theme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: PALETTE.accent,
    background: PALETTE.background,
    card: PALETTE.surface,
    text: PALETTE.textMain,
    border: PALETTE.border,
    notification: PALETTE.accent,
  },
};

export default function App() {
  useEffect(() => {
    initDatabase();
    seedExercises();
  }, []);

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="light" backgroundColor={PALETTE.background} />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          contentStyle: { backgroundColor: PALETTE.background },
          headerStyle: { backgroundColor: PALETTE.surface },
          headerTintColor: PALETTE.accent,
          headerTitleStyle: { color: PALETTE.textMain, fontWeight: 'bold' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LogWorkout" component={LogWorkoutScreen} options={{ title: 'Log Workout' }} />
        <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} options={{ title: 'Choose Exercise' }} />
        <Stack.Screen name="ExerciseHistory" component={ExerciseHistoryScreen} options={{ title: 'Progress' }} />
        <Stack.Screen name="AddExercise" component={AddExerciseScreen} options={{ title: 'New Exercise' }} />
        <Stack.Screen name="Routines" component={RoutinesScreen} options={{ title: 'My Routines' }} />
        <Stack.Screen name="EditRoutine" component={EditRoutineScreen} options={{ title: 'Edit Routine' }} />
        <Stack.Screen name="StartRoutine" component={StartRoutineScreen} options={{ title: 'Start Routine' }} />
        <Stack.Screen name="BodyLog" component={BodyLogScreen} options={{ title: 'Body Log' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}