import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons'; 

const PALETTE = {
  background: '#0B1D3A',
  surface: '#162C54',
  accent: '#00D2D3',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#2A4374',
};

const ShareableWorkoutCard = ({
  workoutTitle,
  totalVolume,
  duration,
  exercisesCompleted,
  date,
}) => {
  const cardRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (isSharing) return;

    try {
      setIsSharing(true);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          'Sharing not available',
          'Sharing isn’t supported on this device.'
        );
        return;
      }

      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your workout',
        UTI: 'public.png',
      });
    } catch (error) {
      console.error('Error sharing workout card:', error);
      Alert.alert('Something went wrong', 'Could not generate the share image.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* This View is what gets captured — nothing outside it should appear in the screenshot */}
      <View ref={cardRef} collapsable={false} style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>FISHY GAINS</Text>
          <Text style={styles.date}>{date || new Date().toLocaleDateString()}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {workoutTitle}
        </Text>

        <View style={styles.divider} />

        <View style={styles.statsGrid}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{totalVolume}</Text>
            <Text style={styles.statLabel}>TOTAL VOLUME (kg)</Text>
          </View>

          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{duration}</Text>
            <Text style={styles.statLabel}>DURATION</Text>
          </View>

          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{exercisesCompleted}</Text>
            <Text style={styles.statLabel}>EXERCISES</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.dot} />
          <Text style={styles.footerText}>Logged with Fishy Gains</Text>
        </View>
      </View>

      {/* Outside the ref — will NOT appear in the screenshot */}
      <TouchableOpacity
        style={styles.shareButton}
        onPress={handleShare}
        disabled={isSharing}
        activeOpacity={0.8}
      >
        {isSharing ? (
          <ActivityIndicator color="#0B1D3A" />
        ) : (
          <>
            <Ionicons name="share-social" size={18} color="#0B1D3A" style={{ marginRight: 8 }} />
            <Text style={styles.shareButtonText}>Share Workout</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: '100%',
  },
  card: {
    width: 340,
    borderRadius: 24,
    backgroundColor: PALETTE.background, // Deep navy background for the final image
    padding: 24,
    borderWidth: 1,
    borderColor: PALETTE.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brand: {
    color: PALETTE.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  date: {
    color: PALETTE.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: PALETTE.textMain,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
    lineHeight: 32,
  },
  divider: {
    height: 1,
    backgroundColor: PALETTE.border,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBlock: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statValue: {
    color: PALETTE.textMain,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: PALETTE.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETTE.accent,
    marginRight: 8,
  },
  footerText: {
    color: PALETTE.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  shareButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.accent, // Solid cyan for the CTA button
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    width: 340,
  },
  shareButtonText: {
    color: '#0B1D3A', // Dark navy text for contrast against the cyan button
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ShareableWorkoutCard;