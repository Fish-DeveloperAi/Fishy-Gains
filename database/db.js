import * as SQLite from 'expo-sqlite';

let db = null;

export function getDb() {
  if (!db) {
    db = SQLite.openDatabaseSync('fishygains.db');
  }
  return db;
}

const DEFAULT_EXERCISES = [
  ['Barbell Bench Press', 'Chest', 'Barbell'],
  ['Incline Barbell Bench Press', 'Chest', 'Barbell'],
  ['Dumbbell Bench Press', 'Chest', 'Dumbbell'],
  ['Incline Dumbbell Press', 'Chest', 'Dumbbell'],
  ['Dumbbell Fly', 'Chest', 'Dumbbell'],
  ['Cable Crossover', 'Chest', 'Cable'],
  ['Push Up', 'Chest', 'Bodyweight'],
  ['Dips', 'Chest', 'Bodyweight'],
  ['Barbell Squat', 'Legs', 'Barbell'],
  ['Front Squat', 'Legs', 'Barbell'],
  ['Leg Press', 'Legs', 'Machine'],
  ['Romanian Deadlift', 'Legs', 'Barbell'],
  ['Leg Curl', 'Legs', 'Machine'],
  ['Leg Extension', 'Legs', 'Machine'],
  ['Walking Lunge', 'Legs', 'Dumbbell'],
  ['Bulgarian Split Squat', 'Legs', 'Dumbbell'],
  ['Standing Calf Raise', 'Legs', 'Machine'],
  ['Hip Thrust', 'Legs', 'Barbell'],
  ['Deadlift', 'Back', 'Barbell'],
  ['Sumo Deadlift', 'Back', 'Barbell'],
  ['Pull Up', 'Back', 'Bodyweight'],
  ['Chin Up', 'Back', 'Bodyweight'],
  ['Lat Pulldown', 'Back', 'Cable'],
  ['Barbell Row', 'Back', 'Barbell'],
  ['Dumbbell Row', 'Back', 'Dumbbell'],
  ['Seated Cable Row', 'Back', 'Cable'],
  ['T-Bar Row', 'Back', 'Barbell'],
  ['Face Pull', 'Back', 'Cable'],
  ['Overhead Press', 'Shoulders', 'Barbell'],
  ['Seated Dumbbell Press', 'Shoulders', 'Dumbbell'],
  ['Arnold Press', 'Shoulders', 'Dumbbell'],
  ['Lateral Raise', 'Shoulders', 'Dumbbell'],
  ['Front Raise', 'Shoulders', 'Dumbbell'],
  ['Rear Delt Fly', 'Shoulders', 'Dumbbell'],
  ['Shrug', 'Shoulders', 'Barbell'],
  ['Barbell Curl', 'Arms', 'Barbell'],
  ['Dumbbell Curl', 'Arms', 'Dumbbell'],
  ['Hammer Curl', 'Arms', 'Dumbbell'],
  ['Preacher Curl', 'Arms', 'Barbell'],
  ['Cable Curl', 'Arms', 'Cable'],
  ['Close Grip Bench Press', 'Arms', 'Barbell'],
  ['Tricep Pushdown', 'Arms', 'Cable'],
  ['Overhead Tricep Extension', 'Arms', 'Dumbbell'],
  ['Skull Crusher', 'Arms', 'Barbell'],
  ['Plank', 'Core', 'Bodyweight'],
  ['Hanging Leg Raise', 'Core', 'Bodyweight'],
  ['Cable Crunch', 'Core', 'Cable'],
  ['Russian Twist', 'Core', 'Bodyweight'],
  ['Ab Wheel Rollout', 'Core', 'Bodyweight'],
  ['Sit Up', 'Core', 'Bodyweight'],
  ['Treadmill Run', 'Cardio', 'Machine'],
  ['Stationary Bike', 'Cardio', 'Machine'],
  ['Rowing Machine', 'Cardio', 'Machine'],
  ['Jump Rope', 'Cardio', 'Bodyweight'],
];

// One-time migration that converts historical lbs values to kg.
// Tracked in the `migrations` table so it only ever runs once per install.
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
      is_custom INTEGER NOT NULL DEFAULT 0
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS routine_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      target_sets INTEGER NOT NULL DEFAULT 3,
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
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

  database.execSync(`
    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      set_index INTEGER NOT NULL DEFAULT 0,
      weight REAL NOT NULL DEFAULT 0,
      reps INTEGER NOT NULL DEFAULT 0,
      is_pr INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );
  `);

  // Body log now also tracks chest / waist / arm measurements (cm), alongside
  // weight (kg) and body fat (%).
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
    // Check if the chest column exists to prevent running this multiple times
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

  const countRow = database.getFirstSync('SELECT COUNT(*) as count FROM exercises;');
  if (countRow.count === 0) {
    DEFAULT_EXERCISES.forEach(([name, muscleGroup, category]) => {
      database.runSync(
        'INSERT INTO exercises (name, muscle_group, category, is_custom) VALUES (?, ?, ?, 0);',
        [name, muscleGroup, category]
      );
    });
  }

  runMetricMigration(database);
}

// Converts every existing weight value (sets + body_logs) from lbs to kg,
// exactly once. Guarded by the `migrations` table so re-running initDatabase
// on subsequent app launches is a safe no-op.
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

// ---------- EXERCISES ----------

export function getExercises(searchTerm = '', muscleGroup = 'All') {
  const database = getDb();
  let query = 'SELECT * FROM exercises WHERE 1=1';
  const params = [];
  if (searchTerm && searchTerm.trim().length > 0) {
    query += ' AND name LIKE ?';
    params.push(`%${searchTerm.trim()}%`);
  }
  if (muscleGroup && muscleGroup !== 'All') {
    query += ' AND muscle_group = ?';
    params.push(muscleGroup);
  }
  query += ' ORDER BY name ASC';
  return database.getAllSync(query, params);
}

export function getExerciseById(id) {
  const database = getDb();
  return database.getFirstSync('SELECT * FROM exercises WHERE id = ?;', [id]);
}

export function getMuscleGroups() {
  const database = getDb();
  const rows = database.getAllSync('SELECT DISTINCT muscle_group FROM exercises ORDER BY muscle_group ASC;');
  return rows.map((r) => r.muscle_group);
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
    const exerciseCount = database.getFirstSync(
      'SELECT COUNT(*) as count FROM routine_exercises WHERE routine_id = ?;',
      [r.id]
    );
    const exercises = database.getAllSync(
      `SELECT e.muscle_group FROM routine_exercises re
       JOIN exercises e ON e.id = re.exercise_id
       WHERE re.routine_id = ? ORDER BY re.order_index ASC;`,
      [r.id]
    );
    const muscleGroups = [...new Set(exercises.map((e) => e.muscle_group))];
    return { ...r, exerciseCount: exerciseCount.count, muscleGroups };
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
  return database.getAllSync(
    `SELECT re.id as routine_exercise_id, re.order_index, re.target_sets, e.*
     FROM routine_exercises re
     JOIN exercises e ON e.id = re.exercise_id
     WHERE re.routine_id = ?
     ORDER BY re.order_index ASC;`,
    [routineId]
  );
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
    [routineId, exerciseId, nextIndex]
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
    const ex = database.getFirstSync('SELECT muscle_group FROM exercises WHERE id = ?;', [id]);
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
    `SELECT s.*, e.name as exercise_name, e.muscle_group
     FROM sets s JOIN exercises e ON e.id = s.exercise_id
     WHERE s.workout_id = ? ORDER BY s.exercise_id ASC, s.set_index ASC;`,
    [workoutId]
  );
  const grouped = {};
  setRows.forEach((row) => {
    if (!grouped[row.exercise_id]) {
      grouped[row.exercise_id] = { exerciseId: row.exercise_id, exerciseName: row.exercise_name, muscleGroup: row.muscle_group, sets: [] };
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
    [workoutId, exerciseId]
  );
}

export function addSet(workoutId, exerciseId, setIndex, weight, reps) {
  const database = getDb();
  const isPr = checkIsPr(exerciseId, weight, reps, workoutId) ? 1 : 0;
  const result = database.runSync(
    'INSERT INTO sets (workout_id, exercise_id, set_index, weight, reps, is_pr, completed) VALUES (?, ?, ?, ?, ?, ?, 1);',
    [workoutId, exerciseId, setIndex, weight, reps, isPr]
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
  let query = `SELECT MAX(weight) as maxWeight FROM sets
    WHERE exercise_id = ? AND workout_id != ?`;
  const params = [exerciseId, currentWorkoutId];
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
    [exerciseId, currentWorkoutId]
  );
  if (!lastWorkout) return [];
  return database.getAllSync(
    'SELECT * FROM sets WHERE workout_id = ? AND exercise_id = ? ORDER BY set_index ASC;',
    [lastWorkout.id, exerciseId]
  );
}

export function getExerciseHistory(exerciseId) {
  const database = getDb();
  const sets = database.getAllSync(
    `SELECT s.*, w.date as workout_date FROM sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND w.finished = 1
     ORDER BY w.date DESC;`,
    [exerciseId]
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
    [exerciseId]
  );
  const maxVolumeRow = database.getFirstSync(
    `SELECT MAX(s.weight * s.reps) as maxVolume FROM sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND w.finished = 1;`,
    [exerciseId]
  );
  const estimated1RMRow = database.getAllSync(
    `SELECT s.weight, s.reps FROM sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND w.finished = 1 AND s.reps > 0;`,
    [exerciseId]
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
    `SELECT s.*, e.name as exercise_name, w.date as workout_date FROM sets s
     JOIN exercises e ON e.id = s.exercise_id
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.is_pr = 1 AND w.finished = 1
     ORDER BY w.date DESC LIMIT ?;`,
    [limit]
  );
  return rows;
}

// ---------- BODY LOGS ----------

// Signature extended (per requirement 4) to accept the new chest/waist/arms
// measurements. weight is expected in kg, chest/waist/arms in cm. All three
// new params default to null so existing callers that only pass
// (weight, bodyFat) keep working without changes.
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