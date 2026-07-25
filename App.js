import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import LogWorkoutScreen from './screens/LogWorkoutScreen';
import { initDatabase, seedExercises } from './database/db';
import ExercisePickerScreen from './screens/ExercisePickerScreen';
import ExerciseHistoryScreen from './screens/ExerciseHistoryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
useEffect(() => {
  initDatabase();
  seedExercises();
}, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LogWorkout" component={LogWorkoutScreen} options={{ title: 'Log Workout' }} />
        <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} options={{ title: 'Choose Exercise' }} />
        <Stack.Screen name="ExerciseHistory" component={ExerciseHistoryScreen} options={{ title: 'Progress' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}