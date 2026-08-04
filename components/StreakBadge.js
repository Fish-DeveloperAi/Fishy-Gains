import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function StreakBadge({ streakCount }) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  // If they have no streak, you can either hide this component or render a grayed-out 0-day pill.
  // Here we choose to show it so they are encouraged to start one.
  const isActive = streakCount > 0;

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: isActive ? 'rgba(249, 115, 22, 0.1)' : colors.card,
        borderColor: isActive ? '#f97316' : colors.background
      }
    ]}>
      <Text style={[styles.icon, !isActive && styles.iconInactive]}>🔥</Text>
      <Text style={[styles.text, { color: isActive ? '#f97316' : colors.textSecondary }]}>
        {streakCount} {streakCount === 1 ? t('day') : t('days')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start', // Keeps the badge hugging the text
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  iconInactive: {
    opacity: 0.3,
  },
  text: {
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});