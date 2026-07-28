import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function RestTimer({ duration = 90, active, onFinish }) {
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
      <Text style={styles.label}>Rest</Text>
      <Text style={styles.timer}>{mins}:{secs.toString().padStart(2, '0')}</Text>
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  label: { color: '#aaa', fontSize: 13 },
  timer: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 4 },
  skipButton: { marginTop: 6 },
  skipText: { color: '#FFD700', fontSize: 14, fontWeight: '600' },
});