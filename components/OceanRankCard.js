import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getBigThreeStats } from '../database/db';
import { useTheme } from '../theme/ThemeContext'; // <-- 1. Import useTheme

// Map of the ranks exactly as provided in the roadmap
const OCEAN_RANKS = [
  { rank: 'Shrimp', min: 0, icon: '🦐' }, 
  { rank: 'Sardine', min: 100, icon: '🐟' },
  { rank: 'Mackerel', min: 200, icon: '🐠' },
  { rank: 'Tuna', min: 300, icon: '🐡' },
  { rank: 'Shark', min: 400, icon: '🦈' },
  { rank: 'Dolphin', min: 500, icon: '🐬' },
  { rank: 'Orca', min: 600, icon: '🐳' },
  { rank: 'Sperm Whale', min: 700, icon: '🐋' },
  { rank: 'Leviathan', min: 800, icon: '👑' },
];

export default function OceanRankCard() {
  const { colors } = useTheme(); // <-- 2. Get dynamic colors
  const styles = getStyles(colors); // <-- 3. Pass colors to style generator
  
  const [stats, setStats] = useState({ squat: 0, bench: 0, deadlift: 0, total: 0 });

  useFocusEffect(
    useCallback(() => {
      setStats(getBigThreeStats());
    }, [])
  );

  // Determine current and next rank
  let currentRank = OCEAN_RANKS[0];
  let nextRank = OCEAN_RANKS[1];

  for (let i = 0; i < OCEAN_RANKS.length; i++) {
    if (stats.total >= OCEAN_RANKS[i].min) {
      currentRank = OCEAN_RANKS[i];
      nextRank = OCEAN_RANKS[i + 1] || null; 
    } else {
      break;
    }
  }

  // Calculate progress bar percentage
  let progress = 100;
  if (nextRank) {
    const rankRange = nextRank.min - currentRank.min;
    const currentProgress = stats.total - currentRank.min;
    progress = (currentProgress / rankRange) * 100;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.headerTitle}>Ocean Rank</Text>
      
      <View style={styles.mainRankContainer}>
        <Text style={styles.rankIcon}>{currentRank.icon}</Text>
        <View style={styles.rankTextContainer}>
          <Text style={styles.rankName}>{currentRank.rank}</Text>
          <Text style={styles.totalWeight}>{stats.total} kg Total</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabelText}>Current: {currentRank.min}kg</Text>
          {nextRank ? (
            <Text style={styles.progressLabelText}>Next: {nextRank.icon} {nextRank.min}kg</Text>
          ) : (
            <Text style={styles.progressLabelText}>Max Rank Achieved!</Text>
          )}
        </View>
      </View>

      <View style={styles.breakdownContainer}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>SQUAT</Text>
          <Text style={styles.breakdownValue}>{stats.squat} kg</Text>
        </View>
        <View style={[styles.breakdownItem, styles.breakdownBorder]}>
          <Text style={styles.breakdownLabel}>BENCH</Text>
          <Text style={styles.breakdownValue}>{stats.bench} kg</Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>DEADLIFT</Text>
          <Text style={styles.breakdownValue}>{stats.deadlift} kg</Text>
        </View>
      </View>
    </View>
  );
}

// 4. Wrap styles in a function that accepts colors
const getStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.cardAlt, // Replaced static rgba border for theme compatibility
  },
  headerTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  mainRankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rankIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  rankTextContainer: {
    flex: 1,
  },
  rankName: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  totalWeight: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: colors.cardAlt,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  breakdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingVertical: 12,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.background, // Replaced static rgba border
  },
  breakdownLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  breakdownValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});