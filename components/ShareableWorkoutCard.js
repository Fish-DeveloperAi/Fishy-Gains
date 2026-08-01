import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#0B1D3A',
  card: '#12274D',
  cardAlt: '#162C54',
  accent: '#00D2D3',
  textPrimary: '#FFFFFF',
  textSecondary: '#7C8DAF',
  danger: '#FF5C5C',
};

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs > 0) return `${hrs}h ${remMins}m`;
  return `${remMins}m`;
}

function formatDate(dateString) {
  const d = new Date(dateString.replace(' ', 'T'));
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

const ShareableWorkoutCard = React.forwardRef(function ShareableWorkoutCard(
  { workoutName, date, durationSeconds, totalVolume, totalSets, exerciseCount, prCount, muscleGroups },
  ref
) {
  return (
    <View ref={ref} collapsable={false} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Ionicons name="fish" size={22} color={COLORS.accent} />
          <Text style={styles.logoText}>FISHY GAINS</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(date)}</Text>
      </View>

      <Text style={styles.workoutTitle} numberOfLines={2}>{workoutName}</Text>

      {muscleGroups && muscleGroups.length > 0 && (
        <View style={styles.tagRow}>
          {muscleGroups.slice(0, 4).map((mg) => (
            <View key={mg} style={styles.tag}>
              <Text style={styles.tagText}>{mg}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Ionicons name="time-outline" size={20} color={COLORS.accent} />
          <Text style={styles.statValue}>{formatDuration(durationSeconds)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="barbell-outline" size={20} color={COLORS.accent} />
          <Text style={styles.statValue}>{Math.round(totalVolume).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Volume (lb)</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="layers-outline" size={20} color={COLORS.accent} />
          <Text style={styles.statValue}>{totalSets}</Text>
          <Text style={styles.statLabel}>Sets</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="body-outline" size={20} color={COLORS.accent} />
          <Text style={styles.statValue}>{exerciseCount}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
      </View>

      {prCount > 0 && (
        <View style={styles.prBanner}>
          <Ionicons name="trophy" size={18} color="#0B1D3A" />
          <Text style={styles.prBannerText}>
            {prCount} Personal Record{prCount > 1 ? 's' : ''} Crushed
          </Text>
        </View>
      )}

      <Text style={styles.footerText}>Track your gains with Fishy Gains</Text>
    </View>
  );
});

export default ShareableWorkoutCard;

const styles = StyleSheet.create({
  container: {
    width: 360,
    backgroundColor: COLORS.background,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,210,211,0.25)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: COLORS.accent,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  dateText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  workoutTitle: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
  },
  statBox: {
    width: '50%',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  prBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 10,
    marginTop: 16,
  },
  prBannerText: {
    color: '#0B1D3A',
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 8,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 18,
  },
});