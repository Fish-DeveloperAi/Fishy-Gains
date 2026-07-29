import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { addBodyLog, getAllBodyLogs } from '../database/db';

export default function BodyLogScreen() {
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [arms, setArms] = useState('');
  const [logs, setLogs] = useState([]);

  useFocusEffect(
    useCallback(() => {
      setLogs(getAllBodyLogs());
    }, [])
  );

  function handleSave() {
    if (!weight) return;
    addBodyLog(parseFloat(weight), chest ? parseFloat(chest) : null, waist ? parseFloat(waist) : null, arms ? parseFloat(arms) : null);
    setWeight('');
    setChest('');
    setWaist('');
    setArms('');
    setLogs(getAllBodyLogs());
  }

  const weightData = logs.filter((l) => l.weight != null).map((l) => l.weight);
  const weightLabels = logs.filter((l) => l.weight != null).map((l) => l.date.slice(5));
  const hasEnoughData = weightData.length >= 2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Body Log</Text>

      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="Weight (kg)" keyboardType="numeric" value={weight} onChangeText={setWeight} />
        <TextInput style={styles.input} placeholder="Chest (cm)" keyboardType="numeric" value={chest} onChangeText={setChest} />
      </View>
      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="Waist (cm)" keyboardType="numeric" value={waist} onChangeText={setWaist} />
        <TextInput style={styles.input} placeholder="Arms (cm)" keyboardType="numeric" value={arms} onChangeText={setArms} />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>+ Log Today's Stats</Text>
      </TouchableOpacity>

      {hasEnoughData && (
        <LineChart
          data={{ labels: weightLabels, datasets: [{ data: weightData }] }}
          width={Dimensions.get('window').width - 40}
          height={200}
          yAxisSuffix="kg"
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#000' },
          }}
          bezier
          style={{ marginVertical: 16, borderRadius: 12 }}
        />
      )}

      <FlatList
        data={[...logs].reverse()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowDate}>{item.date}</Text>
            <Text style={styles.rowValue}>{item.weight ? `${item.weight}kg` : '—'}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No entries yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10 },
  saveButton: { backgroundColor: '#000', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowDate: { color: '#777' },
  rowValue: { fontWeight: '600' },
  emptyText: { color: '#999', textAlign: 'center', marginTop: 20 },
});