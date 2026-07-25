import { View, Text, StyleSheet } from 'react-native';

export default function LogWorkoutScreen() {
  return (
    <View style={styles.container}>
      <Text>This is where we'll log sets — coming next.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});