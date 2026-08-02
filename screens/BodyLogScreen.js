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
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

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
  const [chestInput, setChestInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [armsInput, setArmsInput] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);
  
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
    const chest = chestInput.trim() ? parseFloat(chestInput) : null;
    const waist = waistInput.trim() ? parseFloat(waistInput) : null;
    const arms = armsInput.trim() ? parseFloat(armsInput) : null;
    
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
    
    // Updated to include the new measurements
    addBodyLog(weight, bodyFat, chest, waist, arms);
    
    setWeightInput('');
    setBodyFatInput('');
    setChestInput('');
    setWaistInput('');
    setArmsInput('');
    setModalVisible(false);
    loadLogs();
  };

  const handleDelete = (id) => {
    deleteBodyLog(id);
    loadLogs();
  };

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
                <Text style={styles.summaryValue}>{latest && latest.weight != null ? `${latest.weight} kg` : '—'}</Text>
                {weightDelta !== null && (
                  <View style={styles.deltaRow}>
                    <Ionicons
                      name={weightDelta > 0 ? 'arrow-up' : weightDelta < 0 ? 'arrow-down' : 'remove'}
                      size={12}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.deltaText}>{Math.abs(weightDelta).toFixed(1)} kg</Text>
                  </View>
                )}
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>BODY FAT</Text>
                <Text style={styles.summaryValue}>{latest && latest.body_fat != null ? `${latest.body_fat}%` : '—'}</Text>
              </View>
            </View>

            {chartLogs.filter((l) => l.weight != null).length > 1 && (
              <View style={styles.lineChartCard}>
                <LineChart
                  data={{
                    labels: chartLogs
                      .filter((l) => l.weight != null)
                      .map((l) => {
                        const d = new Date(l.date.replace(' ', 'T'));
                        return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      }),
                    datasets: [
                      {
                        data: chartLogs.filter((l) => l.weight != null).map((l) => l.weight),
                      },
                    ],
                  }}
                  width={screenWidth - 40}
                  height={220}
                  yAxisSuffix="kg"
                  withVerticalLines={false}
                  withOuterLines={false}
                  chartConfig={{
                    backgroundColor: COLORS.card,
                    backgroundGradientFrom: COLORS.card,
                    backgroundGradientTo: COLORS.card,
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(0, 210, 211, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(124, 141, 175, ${opacity})`,
                    propsForDots: {
                      r: '5',
                      strokeWidth: '2',
                      stroke: COLORS.accent,
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '4 4',
                      stroke: 'rgba(124,141,175,0.15)',
                    },
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 18,
                  }}
                />
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
        renderItem={({ item }) => {
          const isExpanded = expandedLogId === item.id;
          const displayDate = item.date ? item.date.split(' ')[0] : ''; 

          return (
            <TouchableOpacity 
              style={styles.minimalRowContainer} 
              onPress={() => setExpandedLogId(isExpanded ? null : item.id)}
              onLongPress={() => handleDelete(item.id)} 
              activeOpacity={0.6}
            >
              <View style={styles.minimalRowMain}>
                <Text style={styles.minimalRowDate}>{displayDate}</Text>
                <Text style={styles.minimalRowWeight}>{item.weight}kg</Text>
              </View>
              
              {isExpanded && (
                <View style={styles.expandedMeasurementsBox}>
                  <View style={styles.measurementItem}>
                    <Text style={styles.measurementLabel}>Chest</Text>
                    <Text style={styles.measurementValue}>
                      {item.chest ? `${item.chest} cm` : '--'}
                    </Text>
                  </View>
                  
                  <View style={styles.measurementItem}>
                    <Text style={styles.measurementLabel}>Waist</Text>
                    <Text style={styles.measurementValue}>
                      {item.waist ? `${item.waist} cm` : '--'}
                    </Text>
                  </View>
                  
                  <View style={styles.measurementItem}>
                    <Text style={styles.measurementLabel}>Arms</Text>
                    <Text style={styles.measurementValue}>
                      {item.arms ? `${item.arms} cm` : '--'}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Body Log</Text>
            
            <Text style={styles.modalInputLabel}>WEIGHT (KG)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              placeholder="e.g. 75"
              placeholderTextColor={COLORS.textSecondary}
              value={weightInput}
              onChangeText={setWeightInput}
            />
            
            <Text style={styles.modalInputLabel}>CHEST (CM)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              placeholder="Optional"
              placeholderTextColor={COLORS.textSecondary}
              value={chestInput}
              onChangeText={setChestInput}
            />

            <Text style={styles.modalInputLabel}>WAIST (CM)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              placeholder="Optional"
              placeholderTextColor={COLORS.textSecondary}
              value={waistInput}
              onChangeText={setWaistInput}
            />

            <Text style={styles.modalInputLabel}>ARMS (CM)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              placeholder="Optional"
              placeholderTextColor={COLORS.textSecondary}
              value={armsInput}
              onChangeText={setArmsInput}
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
                  setChestInput('');
                  setWaistInput('');
                  setArmsInput('');
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
  lineChartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
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
  minimalRowContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 141, 175, 0.2)', 
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  minimalRowMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minimalRowDate: {
    color: 'rgba(124, 141, 175, 0.8)', 
    fontSize: 15,
    letterSpacing: 0.5,
  },
  minimalRowWeight: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  expandedMeasurementsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    backgroundColor: 'rgba(0, 210, 211, 0.05)', 
    padding: 12,
    borderRadius: 8,
  },
  measurementItem: {
    alignItems: 'center',
    flex: 1,
  },
  measurementLabel: {
    color: 'rgba(124, 141, 175, 0.9)',
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  measurementValue: {
    color: '#00d2d3', 
    fontSize: 14,
    fontWeight: 'bold',
  },
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