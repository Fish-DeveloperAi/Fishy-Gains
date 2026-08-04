import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const PALETTE = {
  background: '#0B1D3A',
  surface: '#162C54',
  accent: '#00D2D3',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#2A4374',
};

export default function RestTimer({ duration = 90, active, onFinish }) {
  const { t } = useLanguage();
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (active) {
      setSecondsLeft(duration);
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            onFinish && onFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [active]);

  function handleSkip() {
    clearInterval(intervalRef.current);
    setSecondsLeft(0);
    onFinish && onFinish();
  }

  if (!active || secondsLeft <= 0) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('rest')}</Text>
      <Text style={styles.timer}>{mins}:{secs.toString().padStart(2, '0')}</Text>
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>{t('skip')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: PALETTE.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  label: { 
    color: PALETTE.textMuted, 
    fontSize: 13, 
    fontWeight: 'bold', 
    textTransform: 'uppercase' 
  },
  timer: { 
    color: PALETTE.textMain, 
    fontSize: 36, 
    fontWeight: 'bold', 
    marginVertical: 4 
  },
  skipButton: { 
    marginTop: 8, 
    paddingVertical: 6, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    backgroundColor: 'rgba(0, 210, 211, 0.1)' 
  },
  skipText: { 
    color: PALETTE.accent, 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
});