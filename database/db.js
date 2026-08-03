import * as SQLite from 'expo-sqlite';
import exercisesData from '../assets/exercises.json';

let db = null;

export function getDb() {
  if (!db) {
    db = SQLite.openDatabaseSync('fishygains.db');
  }
  return db;
}

const LBS_TO_KG = 0.453592;
const METRIC_MIGRATION_NAME = 'lbs_to_kg_v1';

export function initDatabase() {
  const database = getDb();
  database.execSync('PRAGMA foreign_keys = ON;');

  database.execSync(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      category TEXT NOT NULL,
      is_custom INTEGER NOT NULL DEFAULT 0,
      image TEXT
    );
  `);

  const exerciseCols = database.getAllSync("PRAGMA table_info(exercises);");
  const hasImageCol = exerciseCols.some(col => col.name === 'image');
  if (!hasImageCol) {
    database.execSync('ALTER TABLE exercises ADD COLUMN image TEXT;');
  }

  database.execSync(`
    CREATE TABLE IF NOT EXISTS routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Foreign key for exercise_id removed to support JSON string IDs
  database.execSync(`
    CREATE TABLE IF NOT EXISTS routine_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_id INTEGER NOT NULL,
      exercise_id TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      target_sets INTEGER NOT NULL DEFAULT 3,
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_id INTEGER,
      name TEXT NOT NULL,
      date TEXT NOT NULL DEFAULT (datetime('now')),
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      notes TEXT DEFAULT '',
      finished INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE SET NULL
    );
  `);

  // Foreign key for exercise_id removed to support JSON string IDs
  database.execSync(`
    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise_id TEXT NOT NULL,
      set_index INTEGER NOT NULL DEFAULT 0,
      weight REAL NOT NULL DEFAULT 0,
      reps INTEGER NOT NULL DEFAULT 0,
      is_pr INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS body_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL DEFAULT (datetime('now')),
      weight REAL,
      body_fat REAL,
      chest REAL,
      waist REAL,
      arms REAL
    );
  `);

  const bodyLogCols = database.getAllSync("PRAGMA table_info(body_logs);");
  const hasChest = bodyLogCols.some(col => col.name === 'chest');

  if (!hasChest) {
    database.execSync('ALTER TABLE body_logs ADD COLUMN chest REAL;');
    database.execSync('ALTER TABLE body_logs ADD COLUMN waist REAL;');
    database.execSync('ALTER TABLE body_logs ADD COLUMN arms REAL;');
  }

  database.execSync(`CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine ON routine_exercises(routine_id);`);
  database.execSync(`CREATE INDEX IF NOT EXISTS idx_sets_workout ON sets(workout_id);`);
  database.execSync(`CREATE INDEX IF NOT EXISTS idx_sets_exercise ON sets(exercise_id);`);
  database.execSync(`CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);`);
  database.execSync(`CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(muscle_group);`);

  runSchemaMigration(database);
  runMetricMigration(database);
}

function runMetricMigration(database) {
  const alreadyApplied = database.getFirstSync(
    'SELECT id FROM migrations WHERE name = ?;',
    [METRIC_MIGRATION_NAME]
  );
  if (alreadyApplied) return;

  database.withTransactionSync(() => {
    database.runSync('UPDATE sets SET weight = weight * ?;', [LBS_TO_KG]);
    database.runSync('UPDATE body_logs SET weight = weight * ? WHERE weight IS NOT NULL;', [LBS_TO_KG]);
    database.runSync('INSERT INTO migrations (name) VALUES (?);', [METRIC_MIGRATION_NAME]);
  });
}

// Map specific anatomical JSON muscles to your classic broad categories
const MUSCLE_MAP = {
  'abdominals': 'Core',
  'lower back': 'Core',
  'biceps': 'Arms',
  'triceps': 'Arms',
  'forearms': 'Arms',
  'chest': 'Chest',
  'lats': 'Back',
  'middle back': 'Back',
  'traps': 'Back',
  'shoulders': 'Shoulders',
  'neck': 'Shoulders',
  'quadriceps': 'Legs',
  'hamstrings': 'Legs',
  'calves': 'Legs',
  'glutes': 'Legs',
  'adductors': 'Legs',
  'abductors': 'Legs'
};

// Helper function to safely apply the map
function getBroadCategory(primaryMuscles) {
  if (!primaryMuscles || primaryMuscles.length === 0) return 'Other';
  const anatomicalName = primaryMuscles[0].toLowerCase();
  // Return the mapped category, or capitalize the original if not found in map
  return MUSCLE_MAP[anatomicalName] || (anatomicalName.charAt(0).toUpperCase() + anatomicalName.slice(1));
}

// ---------- EXERCISES ----------

export function getExercises(searchTerm = '', muscleGroup = 'All') {
  const database = getDb();
  
  // 1. Load and format JSON exercises with the broad category mapper
  let jsonList = exercisesData.map(e => ({
    id: e.id,
    name: e.name,
    muscle_group: getBroadCategory(e.primaryMuscles),
    category: e.category || 'strength',
    is_custom: 0,
    image: e.images && e.images.length > 0 ? e.images[0] : null
  }));

  // 2. Load custom exercises from SQLite
  let dbList = database.getAllSync('SELECT * FROM exercises WHERE is_custom = 1;');
  
  // 3. Merge them
  let combined = [...jsonList, ...dbList];

  // 4. Apply filters
  if (searchTerm && searchTerm.trim().length > 0) {
    const term = searchTerm.toLowerCase().trim();
    combined = combined.filter(ex => ex.name.toLowerCase().includes(term));
  }
  if (muscleGroup && muscleGroup !== 'All') {
    combined = combined.filter(ex => ex.muscle_group.toLowerCase() === muscleGroup.toLowerCase());
  }

  combined.sort((a, b) => a.name.localeCompare(b.name));
  return combined;
}

export function getExerciseById(id) {
  // Check JSON first
  const jsonEx = exercisesData.find(e => e.id === id);
  if (jsonEx) {
    return {
      id: jsonEx.id,
      name: jsonEx.name,
      muscle_group: getBroadCategory(jsonEx.primaryMuscles),
      category: jsonEx.category || 'strength',
      is_custom: 0,
      image: jsonEx.images && jsonEx.images.length > 0 ? jsonEx.images[0] : null
    };
  }
  // Fallback to custom database exercises
  const database = getDb();
  return database.getFirstSync('SELECT * FROM exercises WHERE id = ? AND is_custom = 1;', [id]);
}

export function getMuscleGroups() {
  const groups = new Set();
  
  exercisesData.forEach(e => {
    groups.add(getBroadCategory(e.primaryMuscles));
  });
  
  const database = getDb();
  const custom = database.getAllSync('SELECT DISTINCT muscle_group FROM exercises WHERE is_custom = 1;');
  custom.forEach(r => groups.add(r.muscle_group));

  return Array.from(groups).sort();
}

export function addCustomExercise(name, muscleGroup, category) {
  const database = getDb();
  const result = database.runSync(
    'INSERT INTO exercises (name, muscle_group, category, is_custom) VALUES (?, ?, ?, 1);',
    [name, muscleGroup, category]
  );
  return result.lastInsertRowId;
}

export function deleteExercise(id) {
  const database = getDb();
  database.runSync('DELETE FROM exercises WHERE id = ? AND is_custom = 1;', [id]);
}

// ---------- ROUTINES ----------

export function getRoutines() {
  const database = getDb();
  const routines = database.getAllSync('SELECT * FROM routines ORDER BY created_at DESC;');
  return routines.map((r) => {
    const routineExercises = database.getAllSync(
      'SELECT exercise_id FROM routine_exercises WHERE routine_id = ? ORDER BY order_index ASC;',
      [r.id]
    );
    const muscleGroups = [...new Set(routineExercises.map((re) => {
      const ex = getExerciseById(re.exercise_id);
      return ex ? ex.muscle_group : 'Other';
    }))];
    return { ...r, exerciseCount: routineExercises.length, muscleGroups };
  });
}

export function getRoutineById(id) {
  const database = getDb();
  return database.getFirstSync('SELECT * FROM routines WHERE id = ?;', [id]);
}

export function createRoutine(name) {
  const database = getDb();
  const result = database.runSync('INSERT INTO routines (name) VALUES (?);', [name]);
  return result.lastInsertRowId;
}

export function renameRoutine(id, name) {
  const database = getDb();
  database.runSync('UPDATE routines SET name = ? WHERE id = ?;', [name, id]);
}

export function deleteRoutine(id) {
  const database = getDb();
  database.runSync('DELETE FROM routines WHERE id = ?;', [id]);
}

export function duplicateRoutine(id) {
  const database = getDb();
  const original = getRoutineById(id);
  if (!original) return null;
  const newId = createRoutine(`${original.name} Copy`);
  const exercises = database.getAllSync(
    'SELECT * FROM routine_exercises WHERE routine_id = ? ORDER BY order_index ASC;',
    [id]
  );
  exercises.forEach((ex) => {
    database.runSync(
      'INSERT INTO routine_exercises (routine_id, exercise_id, order_index, target_sets) VALUES (?, ?, ?, ?);',
      [newId, ex.exercise_id, ex.order_index, ex.target_sets]
    );
  });
  return newId;
}

export function getRoutineExercises(routineId) {
  const database = getDb();
  const rows = database.getAllSync(
    'SELECT * FROM routine_exercises WHERE routine_id = ? ORDER BY order_index ASC;',
    [routineId]
  );
  return rows.map(re => {
    const ex = getExerciseById(re.exercise_id);
    return {
      routine_exercise_id: re.id,
      order_index: re.order_index,
      target_sets: re.target_sets,
      id: ex?.id || re.exercise_id,
      name: ex?.name || 'Unknown Exercise',
      muscle_group: ex?.muscle_group || 'Other',
      category: ex?.category || 'strength',
      is_custom: ex?.is_custom || 0,
      image: ex?.image || null
    };
  });
}

export function addExerciseToRoutine(routineId, exerciseId) {
  const database = getDb();
  const maxRow = database.getFirstSync(
    'SELECT MAX(order_index) as maxIndex FROM routine_exercises WHERE routine_id = ?;',
    [routineId]
  );
  const nextIndex = (maxRow.maxIndex === null ? -1 : maxRow.maxIndex) + 1;
  database.runSync(
    'INSERT INTO routine_exercises (routine_id, exercise_id, order_index, target_sets) VALUES (?, ?, ?, 3);',
    [routineId, String(exerciseId), nextIndex]
  );
}

export function removeExerciseFromRoutine(routineExerciseId) {
  const database = getDb();
  database.runSync('DELETE FROM routine_exercises WHERE id = ?;', [routineExerciseId]);
}

export function updateRoutineExerciseTargetSets(routineExerciseId, targetSets) {
  const database = getDb();
  database.runSync('UPDATE routine_exercises SET target_sets = ? WHERE id = ?;', [targetSets, routineExerciseId]);
}

export function reorderRoutineExercises(orderedRoutineExerciseIds) {
  const database = getDb();
  orderedRoutineExerciseIds.forEach((id, index) => {
    database.runSync('UPDATE routine_exercises SET order_index = ? WHERE id = ?;', [index, id]);
  });
}

// ---------- WORKOUTS ----------

export function createWorkout(routineId, name) {
  const database = getDb();
  const result = database.runSync(
    'INSERT INTO workouts (routine_id, name, date, finished) VALUES (?, ?, datetime(\'now\'), 0);',
    [routineId, name]
  );
  return result.lastInsertRowId;
}

export function finishWorkout(workoutId, durationSeconds, notes) {
  const database = getDb();
  database.runSync(
    'UPDATE workouts SET duration_seconds = ?, notes = ?, finished = 1, date = datetime(\'now\') WHERE id = ?;',
    [durationSeconds, notes || '', workoutId]
  );
}

export function deleteWorkout(workoutId) {
  const database = getDb();
  database.runSync('DELETE FROM workouts WHERE id = ?;', [workoutId]);
}

export function getWorkoutById(workoutId) {
  const database = getDb();
  return database.getFirstSync('SELECT * FROM workouts WHERE id = ?;', [workoutId]);
}

export function getRecentWorkouts(limit = 10) {
  const database = getDb();
  const workouts = database.getAllSync(
    'SELECT * FROM workouts WHERE finished = 1 ORDER BY date DESC LIMIT ?;',
    [limit]
  );
  return workouts.map((w) => enrichWorkout(w));
}

function enrichWorkout(workout) {
  const database = getDb();
  const sets = database.getAllSync('SELECT * FROM sets WHERE workout_id = ?;', [workout.id]);
  const volume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const exerciseIds = [...new Set(sets.map((s) => s.exercise_id))];
  const muscleGroups = [];
  exerciseIds.forEach((id) => {
    const ex = getExerciseById(id);
    if (ex && !muscleGroups.includes(ex.muscle_group)) muscleGroups.push(ex.muscle_group);
  });
  return {
    ...workout,
    totalSets: sets.length,
    totalVolume: volume,
    exerciseCount: exerciseIds.length,
    muscleGroups,
    prCount: sets.filter((s) => s.is_pr === 1).length,
  };
}

export function getWorkoutDetail(workoutId) {
  const database = getDb();
  const workout = getWorkoutById(workoutId);
  if (!workout) return null;
  
  const setRows = database.getAllSync(
    'SELECT * FROM sets WHERE workout_id = ? ORDER BY exercise_id ASC, set_index ASC;',
    [workoutId]
  );
  
  const grouped = {};
  setRows.forEach((row) => {
    if (!grouped[row.exercise_id]) {
      const ex = getExerciseById(row.exercise_id);
      grouped[row.exercise_id] = { 
        exerciseId: row.exercise_id, 
        exerciseName: ex?.name || 'Unknown', 
        muscleGroup: ex?.muscle_group || 'Other', 
        sets: [] 
      };
    }
    grouped[row.exercise_id].sets.push(row);
  });
  
  const enriched = enrichWorkout(workout);
  return { ...enriched, exercises: Object.values(grouped) };
}

// ---------- STATS ----------

export function getWorkoutStats() {
  const database = getDb();
  const totalWorkouts = database.getFirstSync('SELECT COUNT(*) as count FROM workouts WHERE finished = 1;');
  const totalVolumeRow = database.getFirstSync(
    `SELECT SUM(s.weight * s.reps) as total FROM sets s
     JOIN workouts w ON w.id = s.workout_id WHERE w.finished = 1;`
  );
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().slice(0, 19).replace('T', ' ');
  const thisWeek = database.getFirstSync(
    "SELECT COUNT(*) as count FROM workouts WHERE finished = 1 AND date >= ?;",
    [weekStartStr]
  );
  return {
    totalWorkouts: totalWorkouts.count,
    totalVolume: totalVolumeRow.total || 0,
    workoutsThisWeek: thisWeek.count,
  };
}

export function getWeeklyActivity() {
  const database = getDb();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    const dStr = d.toISOString().slice(0, 19).replace('T', ' ');
    const nextStr = nextDay.toISOString().slice(0, 19).replace('T', ' ');
    const row = database.getFirstSync(
      'SELECT COUNT(*) as count FROM workouts WHERE finished = 1 AND date >= ? AND date < ?;',
      [dStr, nextStr]
    );
    days.push({
      label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
      date: d,
      count: row.count,
    });
  }
  return days;
}

export function getWorkoutStreak() {
  const database = getDb();
  const rows = database.getAllSync(
    "SELECT DISTINCT date(date) as day FROM workouts WHERE finished = 1 ORDER BY day DESC;"
  );
  if (rows.length === 0) return 0;
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  const dateSet = new Set(rows.map((r) => r.day));
  for (;;) {
    const dayStr = cursor.toISOString().slice(0, 10);
    if (dateSet.has(dayStr)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (streak === 0) {
      cursor.setDate(cursor.getDate() - 1);
      const prevStr = cursor.toISOString().slice(0, 10);
      if (dateSet.has(prevStr)) {
        continue;
      }
      break;
    } else {
      break;
    }
  }
  return streak;
}

// ---------- SETS ----------

export function getSetsForWorkoutExercise(workoutId, exerciseId) {
  const database = getDb();
  return database.getAllSync(
    'SELECT * FROM sets WHERE workout_id = ? AND exercise_id = ? ORDER BY set_index ASC;',
    [workoutId, String(exerciseId)]
  );
}

export function addSet(workoutId, exerciseId, setIndex, weight, reps) {
  const database = getDb();
  const isPr = checkIsPr(exerciseId, weight, reps, workoutId) ? 1 : 0;
  const result = database.runSync(
    'INSERT INTO sets (workout_id, exercise_id, set_index, weight, reps, is_pr, completed) VALUES (?, ?, ?, ?, ?, ?, 1);',
    [workoutId, String(exerciseId), setIndex, weight, reps, isPr]
  );
  return result.lastInsertRowId;
}

export function updateSet(setId, weight, reps) {
  const database = getDb();
  const setRow = database.getFirstSync('SELECT * FROM sets WHERE id = ?;', [setId]);
  if (!setRow) return;
  const isPr = checkIsPr(setRow.exercise_id, weight, reps, setRow.workout_id, setId) ? 1 : 0;
  database.runSync('UPDATE sets SET weight = ?, reps = ?, is_pr = ? WHERE id = ?;', [weight, reps, isPr, setId]);
}

export function deleteSet(setId) {
  const database = getDb();
  database.runSync('DELETE FROM sets WHERE id = ?;', [setId]);
}

function checkIsPr(exerciseId, weight, reps, currentWorkoutId, excludeSetId = null) {
  const database = getDb();
  let query = `SELECT MAX(weight) as maxWeight FROM sets WHERE exercise_id = ? AND workout_id != ?`;
  const params = [String(exerciseId), currentWorkoutId];
  if (excludeSetId) {
    query += ' AND id != ?';
    params.push(excludeSetId);
  }
  const row = database.getFirstSync(query, params);
  const previousMax = row.maxWeight || 0;
  return weight > 0 && weight > previousMax;
}

export function getPreviousPerformance(exerciseId, currentWorkoutId) {
  const database = getDb();
  const lastWorkout = database.getFirstSync(
    `SELECT DISTINCT w.id, w.date FROM sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND w.id != ? AND w.finished = 1
     ORDER BY w.date DESC LIMIT 1;`,
    [String(exerciseId), currentWorkoutId]
  );
  if (!lastWorkout) return [];
  return database.getAllSync(
    'SELECT * FROM sets WHERE workout_id = ? AND exercise_id = ? ORDER BY set_index ASC;',
    [lastWorkout.id, String(exerciseId)]
  );
}

export function getExerciseHistory(exerciseId) {
  const database = getDb();
  const sets = database.getAllSync(
    `SELECT s.*, w.date as workout_date FROM sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND w.finished = 1
     ORDER BY w.date DESC;`,
    [String(exerciseId)]
  );
  const grouped = {};
  sets.forEach((s) => {
    const key = s.workout_id;
    if (!grouped[key]) {
      grouped[key] = { workoutId: s.workout_id, date: s.workout_date, sets: [] };
    }
    grouped[key].sets.push(s);
  });
  return Object.values(grouped);
}

export function getExercisePRs(exerciseId) {
  const database = getDb();
  const maxWeightRow = database.getFirstSync(
    `SELECT s.weight, s.reps, w.date FROM sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND w.finished = 1
     ORDER BY s.weight DESC, w.date DESC LIMIT 1;`,
    [String(exerciseId)]
  );
  const maxVolumeRow = database.getFirstSync(
    `SELECT MAX(s.weight * s.reps) as maxVolume FROM sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND w.finished = 1;`,
    [String(exerciseId)]
  );
  const estimated1RMRow = database.getAllSync(
    `SELECT s.weight, s.reps FROM sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND w.finished = 1 AND s.reps > 0;`,
    [String(exerciseId)]
  );
  let best1RM = 0;
  estimated1RMRow.forEach((s) => {
    const est = s.weight * (1 + s.reps / 30);
    if (est > best1RM) best1RM = est;
  });
  return {
    maxWeight: maxWeightRow ? maxWeightRow.weight : 0,
    maxWeightReps: maxWeightRow ? maxWeightRow.reps : 0,
    maxVolume: maxVolumeRow ? maxVolumeRow.maxVolume || 0 : 0,
    estimated1RM: Math.round(best1RM),
  };
}

export function getRecentPRs(limit = 5) {
  const database = getDb();
  const rows = database.getAllSync(
    `SELECT s.*, w.date as workout_date FROM sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.is_pr = 1 AND w.finished = 1
     ORDER BY w.date DESC LIMIT ?;`,
    [limit]
  );
  return rows.map(r => {
    const ex = getExerciseById(r.exercise_id);
    return { ...r, exercise_name: ex?.name || 'Unknown' };
  });
}

// ---------- BODY LOGS ----------

export function addBodyLog(weight, bodyFat, chest = null, waist = null, arms = null) {
  const database = getDb();
  const result = database.runSync(
    `INSERT INTO body_logs (date, weight, body_fat, chest, waist, arms)
     VALUES (datetime('now'), ?, ?, ?, ?, ?);`,
    [weight, bodyFat, chest, waist, arms]
  );
  return result.lastInsertRowId;
}

export function getBodyLogs() {
  const database = getDb();
  return database.getAllSync('SELECT * FROM body_logs ORDER BY date DESC;');
}

export function deleteBodyLog(id) {
  const database = getDb();
  database.runSync('DELETE FROM body_logs WHERE id = ?;', [id]);
}

// ---------- OCEAN RANK SYSTEM ----------

export function getBigThreeStats() {
  const database = getDb();
  
  // 1. Identify Exercise IDs for the Big Three
  // We look for standard barbell movements to avoid counting bodyweight or machine variations
  const squatIds = [];
  const benchIds = [];
  const deadliftIds = [];

  // Search JSON data
  exercisesData.forEach(e => {
    const name = e.name.toLowerCase();
    if (name.includes('barbell squat')) squatIds.push(e.id);
    if (name.includes('barbell bench press')) benchIds.push(e.id);
    if (name.includes('barbell deadlift')) deadliftIds.push(e.id);
  });

  // Search custom SQLite exercises
  const customEx = database.getAllSync('SELECT id, name FROM exercises WHERE is_custom = 1;');
  customEx.forEach(e => {
    const name = e.name.toLowerCase();
    if (name.includes('squat') && !name.includes('split') && !name.includes('hack')) squatIds.push(e.id);
    if (name.includes('bench press') && !name.includes('dumbbell')) benchIds.push(e.id);
    if (name.includes('deadlift') && !name.includes('romanian')) deadliftIds.push(e.id);
  });

  // 2. Helper to fetch the max weight logged for a set of IDs
  const getMaxWeight = (ids) => {
    if (ids.length === 0) return 0;
    const placeholders = ids.map(() => '?').join(',');
    // We only count completed sets
    const query = `
      SELECT MAX(weight) as maxWeight 
      FROM sets 
      WHERE exercise_id IN (${placeholders}) AND completed = 1;
    `;
    const row = database.getFirstSync(query, ids.map(String));
    return row?.maxWeight || 0;
  };

  // 3. Calculate maxes and total
  const squat = getMaxWeight(squatIds);
  const bench = getMaxWeight(benchIds);
  const deadlift = getMaxWeight(deadliftIds);
  
  return {
    squat,
    bench,
    deadlift,
    total: squat + bench + deadlift
  };
}



const SCHEMA_MIGRATION_NAME = 'drop_exercise_fk_v1';

function runSchemaMigration(database) {
  // Check if we already migrated this user
  const alreadyApplied = database.getFirstSync(
    'SELECT id FROM migrations WHERE name = ?;',
    [SCHEMA_MIGRATION_NAME]
  );
  if (alreadyApplied) return;

  // 1. Temporarily disable foreign keys so we can safely drop tables
  database.execSync('PRAGMA foreign_keys = OFF;');

  database.withTransactionSync(() => {
    // 2. Rebuild routine_exercises WITHOUT the exercise_id foreign key constraint
    database.execSync(`
      CREATE TABLE IF NOT EXISTS routine_exercises_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routine_id INTEGER NOT NULL,
        exercise_id TEXT NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        target_sets INTEGER NOT NULL DEFAULT 3,
        FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
      );
    `);
    
    // Copy the user's data over, drop the old table, and rename the new one
    database.execSync('INSERT INTO routine_exercises_new SELECT * FROM routine_exercises;');
    database.execSync('DROP TABLE routine_exercises;');
    database.execSync('ALTER TABLE routine_exercises_new RENAME TO routine_exercises;');

    // 3. Rebuild sets WITHOUT the exercise_id foreign key constraint
    database.execSync(`
      CREATE TABLE IF NOT EXISTS sets_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        exercise_id TEXT NOT NULL,
        set_index INTEGER NOT NULL DEFAULT 0,
        weight REAL NOT NULL DEFAULT 0,
        reps INTEGER NOT NULL DEFAULT 0,
        is_pr INTEGER NOT NULL DEFAULT 0,
        completed INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
      );
    `);
    
    // Copy data, drop old, rename new
    database.execSync('INSERT INTO sets_new SELECT * FROM sets;');
    database.execSync('DROP TABLE sets;');
    database.execSync('ALTER TABLE sets_new RENAME TO sets;');

    // 4. Mark migration as complete so it never runs again
    database.runSync('INSERT INTO migrations (name) VALUES (?);', [SCHEMA_MIGRATION_NAME]);
  });

  // 5. Re-enable foreign keys to protect the rest of the database
  database.execSync('PRAGMA foreign_keys = ON;');
}