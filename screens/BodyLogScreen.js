import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { addBodyLog, getAllBodyLogs } from '../database/db';

const PALETTE = {
  background: '#0B1D3A',
  surface: '#162C54',
  accent: '#00D2D3',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#2A4374',
};

export default function BodyLogScreen() {
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [arms, setArms] = useState('');
  const [logs, setLogs] = useState([]);

  useFocusEffect(
    useCallback(() => { setLogs(getAllBodyLogs()); }, [])
  );

  function handleSave() {
    if (!weight) return;
    addBodyLog(parseFloat(weight), chest ? parseFloat(chest) : null, waist ? parseFloat(waist) : null, arms ? parseFloat(arms) : null);
    setWeight(''); setChest(''); setWaist(''); setArms('');
    setLogs(getAllBodyLogs());
  }

  const weightData = logs.filter((l) => l.weight != null).map((l) => l.weight);
  const weightLabels = logs.filter((l) => l.weight != null).map((l) => l.date.slice(5));
  const hasEnoughData = weightData.length >= 2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Body Log</Text>

      <View style={styles.inputCard}>
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="Weight (kg)" placeholderTextColor={PALETTE.textMuted} keyboardType="numeric" value={weight} onChangeText={setWeight} />
          <TextInput style={styles.input} placeholder="Chest (cm)" placeholderTextColor={PALETTE.textMuted} keyboardType="numeric" value={chest} onChangeText={setChest} />
        </View>
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="Waist (cm)" placeholderTextColor={PALETTE.textMuted} keyboardType="numeric" value={waist} onChangeText={setWaist} />
          <TextInput style={styles.input} placeholder="Arms (cm)" placeholderTextColor={PALETTE.textMuted} keyboardType="numeric" value={arms} onChangeText={setArms} />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Log Today's Stats</Text>
        </TouchableOpacity>
      </View>

      {hasEnoughData && (
        <View style={styles.chartContainer}>
          <LineChart
            data={{ labels: weightLabels, datasets: [{ data: weightData }] }}
            width={Dimensions.get('window').width - 40}
            height={200}
            yAxisSuffix="kg"
            chartConfig={{
              backgroundColor: PALETTE.surface,
              backgroundGradientFrom: PALETTE.surface,
              backgroundGradientTo: PALETTE.surface,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 210, 211, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(248, 250, 252, ${opacity})`,
              propsForDots: { r: '4', strokeWidth: '2', stroke: PALETTE.accent },
            }}
            bezier
            style={{ borderRadius: 12 }}
          />
        </View>
      )}

      <FlatList
        style={{ marginTop: 10 }}
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
  container: { flex: 1, padding: 20, backgroundColor: PALETTE.background },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: PALETTE.textMain },
  
  inputCard: { backgroundColor: PALETTE.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: PALETTE.border, marginBottom: 20 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: PALETTE.border, borderRadius: 10, padding: 12, backgroundColor: PALETTE.background, color: PALETTE.textMain, fontWeight: '600' },
  
  saveButton: { backgroundColor: PALETTE.accent, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#0B1D3A', fontWeight: 'bold', fontSize: 15 },
  
  chartContainer: { backgroundColor: PALETTE.surface, borderRadius: 16, padding: 10, borderWidth: 1, borderColor: PALETTE.border, alignItems: 'center', marginBottom: 10 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: PALETTE.border },
  rowDate: { color: PALETTE.textMuted, fontSize: 15 },
  rowValue: { fontWeight: 'bold', color: PALETTE.textMain, fontSize: 15 },
  
  emptyText: { color: PALETTE.textMuted, textAlign: 'center', marginTop: 20 },
});