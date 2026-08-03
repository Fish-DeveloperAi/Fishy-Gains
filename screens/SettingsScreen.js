import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import your custom hook
import { useTheme } from '../theme/ThemeContext';

export default function SettingsScreen({ navigation }) {
  // Grab the dynamic colors, the active theme, the setter, and the list of all THEMES
  const { colors, activeTheme, setActiveTheme, THEMES } = useTheme();
  
  // Generate styles dynamically
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
        {/* Spacer for centering */}
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>APP THEME</Text>
        
        {Object.values(THEMES).map((theme) => {
          const isActive = activeTheme === theme.id;
          
          return (
            <TouchableOpacity 
              key={theme.id}
              style={[styles.themeCard, isActive && styles.themeCardActive]}
              onPress={() => setActiveTheme(theme.id)}
              activeOpacity={0.8}
            >
              <View style={styles.themeInfo}>
                <View style={[styles.colorPreview, { backgroundColor: theme.background }]}>
                  <View style={[styles.colorDot, { backgroundColor: theme.accent }]} />
                  <View style={[styles.colorDot, { backgroundColor: theme.card }]} />
                </View>
                <Text style={styles.themeName}>{theme.name}</Text>
              </View>
              
              <Ionicons 
                name={isActive ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color={isActive ? colors.accent : colors.textSecondary} 
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// Dynamic stylesheet function
const createStyles = (COLORS) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,141,175,0.15)',
  },
  backButton: { padding: 4 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 20 },
  sectionLabel: { 
    color: COLORS.textSecondary, 
    fontSize: 12, 
    fontWeight: '700', 
    letterSpacing: 1, 
    marginBottom: 16 
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCardActive: { borderColor: COLORS.accent },
  themeInfo: { flexDirection: 'row', alignItems: 'center' },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(124,141,175,0.2)',
  },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginHorizontal: 2 },
  themeName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
});