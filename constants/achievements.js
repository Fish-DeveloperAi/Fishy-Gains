export const ACHIEVEMENTS_DATA = [
  // Consistency & Workouts
  { id: 'first_splash', title: 'First Splash', icon: '🌊', description: 'Complete your first workout.', type: 'total_workouts', threshold: 1 },
  { id: 'hooked', title: 'Hooked', icon: '🎣', description: 'Complete 10 workouts.', type: 'total_workouts', threshold: 10 },
  { id: 'school_of_fish', title: 'School of Fish', icon: '🐟', description: 'Complete 50 workouts.', type: 'total_workouts', threshold: 50 },
  { id: 'ocean_veteran', title: 'Ocean Veteran', icon: '🌊', description: 'Complete 100 workouts.', type: 'total_workouts', threshold: 100 },
  
  // Streaks
  { id: 'unstoppable_current', title: 'Unstoppable Current', icon: '🔥', description: 'Reach a 7-day workout streak.', type: 'daily_streak', threshold: 7 },
  { id: 'tidal_force', title: 'Tidal Force', icon: '🌊', description: 'Reach a 30-day workout streak.', type: 'daily_streak', threshold: 30 },
  { id: 'consistency_pays', title: 'Consistency Pays', icon: '📅', description: 'Complete at least one workout every week for 8 consecutive weeks.', type: 'weekly_streak', threshold: 8 },
  
  // Volume & Sets
  { id: 'heavy_catch', title: 'Heavy Catch', icon: '⚓', description: 'Lift 10,000 kg total workout volume in a single session.', type: 'session_volume', threshold: 10000 },
  { id: 'volume_monster', title: 'Volume Monster', icon: '💪', description: 'Lift 1,000,000 kg lifetime volume.', type: 'lifetime_volume', threshold: 1000000 },
  { id: 'century_club', title: 'Century Club', icon: '💯', description: 'Log 1000 completed sets.', type: 'lifetime_sets', threshold: 1000 },
  
  // Strength Milestones
  { id: 'kraken_grip', title: 'Kraken Grip', icon: '🐙', description: 'Deadlift 200 kg (or user-defined milestone).', type: 'max_deadlift', threshold: 200 },
  { id: 'steel_fins', title: 'Steel Fins', icon: '🦈', description: 'Squat 180 kg (or milestone).', type: 'max_squat', threshold: 180 },
  { id: 'chest_of_the_sea', title: 'Chest of the Sea', icon: '🐋', description: 'Bench Press 100 kg (or milestone).', type: 'max_bench', threshold: 100 },
  
  // Ranks
  { id: 'apex_predator', title: 'Apex Predator', icon: '🦈', description: 'Reach Shark Rank.', type: 'rank', threshold: 'Shark' },
  { id: 'leviathan', title: 'Leviathan', icon: '👑', description: 'Reach Leviathan Rank.', type: 'rank', threshold: 'Leviathan' },
];