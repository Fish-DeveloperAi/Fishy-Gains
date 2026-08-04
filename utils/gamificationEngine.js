import { ACHIEVEMENTS_DATA } from '../constants/achievements';

/**
 * Compares current user stats against the achievements list.
 * @param {Object} userStats - The user's updated stats after a workout.
 * @param {Array} unlockedIds - Array of string IDs the user already owns.
 * @returns {Array} newlyUnlocked - Array of full achievement objects just unlocked.
 */
export const evaluateAchievements = (userStats, unlockedIds) => {
  const newlyUnlocked = [];

  ACHIEVEMENTS_DATA.forEach((achievement) => {
    // Skip if they already have it
    if (unlockedIds.includes(achievement.id)) return;

    let isUnlocked = false;

    // Check conditions dynamically based on type
    switch (achievement.type) {
      case 'total_workouts':
        isUnlocked = userStats.totalWorkouts >= achievement.threshold;
        break;
      case 'daily_streak':
        isUnlocked = userStats.currentStreak >= achievement.threshold;
        break;
      case 'weekly_streak':
        isUnlocked = userStats.weeklyStreak >= achievement.threshold;
        break;
      case 'session_volume':
        isUnlocked = userStats.latestSessionVolume >= achievement.threshold;
        break;
      case 'lifetime_volume':
        isUnlocked = userStats.lifetimeVolume >= achievement.threshold;
        break;
      case 'lifetime_sets':
        isUnlocked = userStats.lifetimeSets >= achievement.threshold;
        break;
      case 'max_deadlift':
        isUnlocked = userStats.maxDeadlift >= achievement.threshold;
        break;
      case 'max_squat':
        isUnlocked = userStats.maxSquat >= achievement.threshold;
        break;
      case 'max_bench':
        isUnlocked = userStats.maxBench >= achievement.threshold;
        break;
      case 'rank':
        // Assuming rank is an array of strings in order, or a simple string match
        // For simplicity, requiring exact match or a hierarchy logic
        isUnlocked = userStats.rank === achievement.threshold;
        break;
      default:
        break;
    }

    if (isUnlocked) {
      newlyUnlocked.push(achievement);
    }
  });

  return newlyUnlocked;
};