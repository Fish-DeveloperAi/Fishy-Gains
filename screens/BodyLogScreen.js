import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getBodyLogs, addBodyLog, deleteBodyLog } from '../database/db';

const COLORS = {
  background: '#0B1D3A',
  card: '#12274D',
  cardAlt: '#162C54',
  accent: '#00D2D3',
  textPrimary: '#FFFFFF',
  textSecondary: '#7C8DAF',
  danger: '#FF5C5C',
};

function formatDate(dateString) {
  const d = new Date(dateString.replace(' ', 'T'));
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function BodyLogScreen() {
  const [logs, setLogs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [bodyFatInput, setBodyFatInput] = useState('');

  const loadLogs = useCallback(() => {
    setLogs(getBodyLogs());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs])
  );

  const latest = logs[0];
  const previous = logs[1];
  const weightDelta = latest && previous && latest.weight != null && previous.weight != null
    ? latest.weight - previous.weight
    : null;

  const handleAddLog = () => {
    const weight = weightInput.trim() ? parseFloat(weightInput) : null;
    const bodyFat = bodyFatInput.trim() ? parseFloat(bodyFatInput) : null;
    if (weight === null && bodyFat === null) {
      Alert.alert('Enter a Value', 'Please enter a weight or body fat percentage.');
      return;
    }
    if (weight !== null && (isNaN(weight) || weight <= 0)) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight.');
      return;
    }
    if (bodyFat !== null && (isNaN(bodyFat) || bodyFat < 0 || bodyFat > 100)) {
      Alert.alert('Invalid Body Fat', 'Please enter a valid percentage between 0 and 100.');
      return;
    }
    addBodyLog(weight, bodyFat);
    setWeightInput('');
    setBodyFatInput('');
    setModalVisible(false);
    loadLogs();
  };

  const handleDelete = (id) => {
    deleteBodyLog(id);
    loadLogs();
  };

  const maxWeight = Math.max(1, ...logs.filter((l) => l.weight != null).map((l) => l.weight));
  const minWeight = Math.min(maxWeight, ...logs.filter((l) => l.weight != null).map((l) => l.weight));
  const range = Math.max(1, maxWeight - minWeight);
  const chartLogs = logs.slice(0, 10).reverse();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={logs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>CURRENT WEIGHT</Text>
                <Text style={styles.summaryValue}>{latest && latest.weight != null ? `${latest.weight} lb` : '—'}</Text>
                {weightDelta !== null && (
                  <View style={styles.deltaRow}>
                    <Ionicons
                      name={weightDelta > 0 ? 'arrow-up' : weightDelta < 0 ? 'arrow-down' : 'remove'}
                      size={12}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.deltaText}>{Math.abs(weightDelta).toFixed(1)} lb</Text>
                  </View>
                )}
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>BODY FAT</Text>
                <Text style={styles.summaryValue}>{latest && latest.body_fat != null ? `${latest.body_fat}%` : '—'}</Text>
              </View>
            </View>

            {chartLogs.filter((l) => l.weight != null).length > 1 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartLabel}>WEIGHT TREND</Text>
                <View style={styles.chartRow}>
                  {chartLogs.map((log, idx) => {
                    if (log.weight == null) return <View key={idx} style={styles.chartCol} />;
                    const heightPct = ((log.weight - minWeight) / range) * 60 + 10;
                    return (
                      <View key={idx} style={styles.chartCol}>
                        <View style={[styles.chartBar, { height: heightPct }]} />
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle" size={20} color={COLORS.accent} />
              <Text style={styles.addButtonText}>Log Entry</Text>
            </TouchableOpacity>

            <Text style={styles.sectionLabel}>HISTORY</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="body-outline" size={36} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>No entries yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.logRow} onLongPress={() => handleDelete(item.id)} activeOpacity={0.7}>
            <Text style={styles.logDate}>{formatDate(item.date)}</Text>
            <View style={styles.logValues}>
              {item.weight != null && <Text style={styles.logValueText}>{item.weight} lb</Text>}
              {item.body_fat != null && <Text style={styles.logValueTextSecondary}>{item.body_fat}%</Text>}
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Body Log</Text>
            <Text style={styles.modalInputLabel}>WEIGHT (LB)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              placeholder="e.g. 175"
              placeholderTextColor={COLORS.textSecondary}
              value={weightInput}
              onChangeText={setWeightInput}
            />
            <Text style={styles.modalInputLabel}>BODY FAT %</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              placeholder="Optional"
              placeholderTextColor={COLORS.textSecondary}
              value={bodyFatInput}
              onChangeText={setBodyFatInput}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setWeightInput('');
                  setBodyFatInput('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveButton} onPress={handleAddLog}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: 20, paddingBottom: 40 },
  summaryRow: { flexDirection: 'row', marginBottom: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginRight: 10,
  },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  summaryValue: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800', marginTop: 6 },
  deltaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  deltaText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginLeft: 4 },
  chartCard: { backgroundColor: COLORS.card, borderRadius: 18, padding: 16, marginBottom: 16 },
  chartLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 14 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', height: 70, justifyContent: 'space-between' },
  chartCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 70 },
  chartBar: { width: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,210,211,0.3)',
    borderStyle: 'dashed',
  },
  addButtonText: { color: COLORS.accent, fontWeight: '700', fontSize: 14, marginLeft: 8 },
  sectionLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyStateText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 10 },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  logDate: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },
  logValues: { flexDirection: 'row' },
  logValueText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', marginLeft: 14 },
  logValueTextSecondary: { color: COLORS.accent, fontSize: 13, fontWeight: '700', marginLeft: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalCard: { width: '100%', backgroundColor: COLORS.cardAlt, borderRadius: 22, padding: 22 },
  modalTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 16 },
  modalInputLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6, marginTop: 10 },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  modalButtonRow: { flexDirection: 'row', marginTop: 20 },
  modalCancelButton: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 14, marginRight: 8 },
  modalCancelText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 15 },
  modalSaveButton: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 14, backgroundColor: COLORS.accent, marginLeft: 8 },
  modalSaveText: { color: '#0B1D3A', fontWeight: '800', fontSize: 15 },
});