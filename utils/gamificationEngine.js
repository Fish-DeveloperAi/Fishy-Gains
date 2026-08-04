import { ACHIEVEMENTS_DATA } from '../constants/achievements';
import { getRankIndex } from '../constants/ranks';

/**
 * Evaluates a completed workout against all locked achievements.
 *
 * @param {Object} workout - The current completed workout (volume, duration in
 *                           minutes, timestamp, exercises[]).
 * @param {Object} stats   - The user's lifetime stats from SQLite.
 * @param {Array<string>} currentUnlockedIds - Already unlocked achievement IDs.
 * @returns {Array<Object>} - The full achievement objects that were just
 *                            unlocked (the modal needs id, icon, title,
 *                            description and rarity, not just the id).
 *
 * Backwards compatible: callers that pass only (stats, unlockedIds) still work,
 * because the stats object also carries the session fields.
 */
export const evaluateAchievements = (workout = {}, stats = {}, currentUnlockedIds = []) => {
  // --- Argument normalisation -------------------------------------------
  // Older call sites used evaluateAchievements(stats, unlockedIds).
  let safeWorkout = workout || {};
  let safeStats = stats || {};
  let safeUnlockedIds = currentUnlockedIds || [];

  if (Array.isArray(stats)) {
    safeUnlockedIds = stats;
    safeStats = safeWorkout;
  }
  if (!Array.isArray(safeUnlockedIds)) safeUnlockedIds = [];

  const newlyUnlocked = [];

  // Session values may live on either object depending on the caller.
  const sessionVolume =
    safeWorkout.volume ??
    safeWorkout.totalVolume ??
    safeStats.sessionVolume ??
    safeStats.latestSessionVolume ??
    0;

  const sessionDuration = safeWorkout.duration ?? safeStats.duration ?? 0; // minutes

  const sessionExercises = (() => {
    const source = safeWorkout.exercises || safeStats.exercises || [];
    if (!Array.isArray(source)) return [];
    // Accepts both [{ name }] / [{ exerciseName }] and plain string arrays.
    return source
      .map((ex) => (typeof ex === 'string' ? ex : ex?.name || ex?.exerciseName || ''))
      .filter(Boolean)
      .map((name) => name.toLowerCase());
  })();

  const sessionTimestamp = safeWorkout.timestamp || safeWorkout.date || safeStats.timestamp;

  ACHIEVEMENTS_DATA.forEach((achievement) => {
    if (safeUnlockedIds.includes(achievement.id)) return;

    let isUnlocked = false;

    switch (achievement.type) {
      // -------------------------
      // WORKOUTS
      // -------------------------
      case 'total_workouts':
        isUnlocked = (safeStats.totalWorkouts || 0) >= achievement.threshold;
        break;

      // -------------------------
      // STREAKS
      // -------------------------
      case 'daily_streak':
        // The DB exposes this as `currentStreak`; accept both spellings.
        isUnlocked =
          (safeStats.dailyStreak ?? safeStats.currentStreak ?? 0) >= achievement.threshold;
        break;

      case 'weekly_streak':
        isUnlocked = (safeStats.weeklyStreak || 0) >= achievement.threshold;
        break;

      // -------------------------
      // VOLUME & ENDURANCE
      // -------------------------
      case 'session_volume':
        isUnlocked = sessionVolume >= achievement.threshold;
        break;

      case 'lifetime_volume':
        isUnlocked = (safeStats.lifetimeVolume || 0) >= achievement.threshold;
        break;

      case 'lifetime_sets':
        isUnlocked = (safeStats.lifetimeSets || 0) >= achievement.threshold;
        break;

      // -------------------------
      // STRENGTH (Max Lifts)
      // -------------------------
      case 'max_deadlift':
        isUnlocked = (safeStats.maxDeadlift || 0) >= achievement.threshold;
        break;

      case 'max_squat':
        isUnlocked = (safeStats.maxSquat || 0) >= achievement.threshold;
        break;

      case 'max_bench':
        isUnlocked = (safeStats.maxBench || 0) >= achievement.threshold;
        break;

      // -------------------------
      // RANKS
      // -------------------------
      case 'rank': {
        // Compare positions in the ladder instead of exact equality, otherwise
        // a user who jumps straight past "Shark" never unlocks Apex Predator.
        const requiredIndex = getRankIndex(achievement.threshold);
        const currentIndex = getRankIndex(safeStats.rank);
        isUnlocked = requiredIndex >= 0 && currentIndex >= requiredIndex;
        break;
      }

      // -------------------------
      // EARLY BIRD (Dawn Surfer)
      // -------------------------
      case 'early_bird': {
        // Braces added: `const` inside a bare case leaked into sibling cases
        // and threw "Cannot access before initialization" at runtime.
        const rawTimestamp = sessionTimestamp || Date.now();
        const normalizedTimestamp =
          typeof rawTimestamp === 'string' ? rawTimestamp.replace(' ', 'T') : rawTimestamp;
        const workoutDate = new Date(normalizedTimestamp);
        isUnlocked = !Number.isNaN(workoutDate.getTime()) && workoutDate.getHours() < 6;
        break;
      }

      // -------------------------
      // DURATION (Deep Sea Diver) - threshold is in minutes
      // -------------------------
      case 'duration':
        isUnlocked = sessionDuration >= achievement.threshold;
        break;

      // -------------------------
      // COMBO (Trident Master)
      // -------------------------
      case 'combo_big_three': {
        const hasSquat = sessionExercises.some((name) => name.includes('squat'));
        const hasBench = sessionExercises.some((name) => name.includes('bench'));
        const hasDeadlift = sessionExercises.some((name) => name.includes('deadlift'));
        isUnlocked = hasSquat && hasBench && hasDeadlift;
        break;
      }

      default:
        break;
    }

    if (isUnlocked) {
      newlyUnlocked.push(achievement);
    }
  });

  return newlyUnlocked;
};

export default evaluateAchievements;
