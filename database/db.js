import * as SQLite from 'expo-sqlite';
import exercisesData from '../assets/exercises.json';

const db = SQLite.openDatabaseSync('gym.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT,
      name TEXT NOT NULL,
      category TEXT,
      equipment TEXT,
      primary_muscle TEXT,
      instructions TEXT,
      image_url TEXT
    );
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER,
      exercise_id INTEGER,
      weight REAL,
      reps INTEGER,
      FOREIGN KEY (workout_id) REFERENCES workouts (id),
      FOREIGN KEY (exercise_id) REFERENCES exercises (id)
    );
    CREATE TABLE IF NOT EXISTS routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS routine_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_id INTEGER,
      exercise_id INTEGER,
      exercise_order INTEGER,
      FOREIGN KEY (routine_id) REFERENCES routines (id),
      FOREIGN KEY (exercise_id) REFERENCES exercises (id)
    );
    CREATE TABLE IF NOT EXISTS body_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      weight REAL,
      chest REAL,
      waist REAL,
      arms REAL
    );
  `);
}

export function seedExercises() {
  const result = db.getFirstSync('SELECT COUNT(*) as count FROM exercises');
  if (result.count > 0) return;

  const relevantEquipment = ['barbell', 'dumbbell', 'cable', 'body only', 'machine', 'kettlebells', 'e-z curl bar'];

  const filtered = exercisesData.filter(ex =>
    ex.equipment && relevantEquipment.includes(ex.equipment.toLowerCase())
  );

  filtered.forEach(ex => {
    const imageUrl = ex.images && ex.images[0]
      ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${ex.images[0]}`
      : null;

    db.runSync(
      `INSERT INTO exercises (external_id, name, category, equipment, primary_muscle, instructions, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ex.id,
        ex.name,
        ex.category,
        ex.equipment,
        ex.primaryMuscles ? ex.primaryMuscles.join(', ') : null,
        ex.instructions ? ex.instructions.join(' ') : null,
        imageUrl,
      ]
    );
  });
}

export function getAllExercises() {
  return db.getAllSync('SELECT * FROM exercises ORDER BY name ASC');
}

export function searchExercises(query) {
  return db.getAllSync(
    'SELECT * FROM exercises WHERE name LIKE ? ORDER BY name ASC LIMIT 100',
    [`%${query}%`]
  );
}

export function createWorkout() {
  const today = new Date().toISOString().split('T')[0];
  const result = db.runSync('INSERT INTO workouts (date) VALUES (?)', [today]);
  return result.lastInsertRowId;
}

export function insertSet(workoutId, exerciseId, weight, reps) {
  db.runSync(
    'INSERT INTO sets (workout_id, exercise_id, weight, reps) VALUES (?, ?, ?, ?)',
    [workoutId, exerciseId, weight, reps]
  );
}

export function getSetsForWorkoutExercise(workoutId, exerciseId) {
  return db.getAllSync(
    'SELECT * FROM sets WHERE workout_id = ? AND exercise_id = ? ORDER BY id ASC',
    [workoutId, exerciseId]
  );
}

export function getAllWorkouts() {
  return db.getAllSync('SELECT * FROM workouts ORDER BY id DESC');
}

export function getExercisesForWorkout(workoutId) {
  return db.getAllSync(
    `SELECT DISTINCT exercises.id, exercises.name
     FROM sets
     JOIN exercises ON sets.exercise_id = exercises.id
     WHERE sets.workout_id = ?`,
    [workoutId]
  );
}

export function getHistoryForExercise(exerciseId) {
  return db.getAllSync(
    `SELECT sets.weight, sets.reps, workouts.date
     FROM sets
     JOIN workouts ON sets.workout_id = workouts.id
     WHERE sets.exercise_id = ?
     ORDER BY workouts.date ASC, sets.id ASC`,
    [exerciseId]
  );
}

export function estimate1RM(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function getBestSetForExercise(exerciseId) {
  return db.getFirstSync(
    `SELECT weight, reps FROM sets WHERE exercise_id = ? ORDER BY weight DESC LIMIT 1`,
    [exerciseId]
  );
}

export function addCustomExercise(name, category, equipment, primaryMuscle) {
  const result = db.runSync(
    `INSERT INTO exercises (external_id, name, category, equipment, primary_muscle, instructions, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [null, name, category || 'strength', equipment || 'other', primaryMuscle || 'other', null, null]
  );
  return result.lastInsertRowId;
}

export function resetExercises() {
  db.execSync('DROP TABLE IF EXISTS exercises;');
  db.execSync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT,
      name TEXT NOT NULL,
      category TEXT,
      equipment TEXT,
      primary_muscle TEXT,
      instructions TEXT,
      image_url TEXT
    );
  `);
}

export function getVolumeForWorkout(workoutId) {
  const result = db.getFirstSync(
    `SELECT SUM(weight * reps) as totalVolume, COUNT(*) as totalSets
     FROM sets
     WHERE workout_id = ?`,
    [workoutId]
  );
  return {
    totalVolume: result.totalVolume || 0,
    totalSets: result.totalSets || 0,
  };
}

export function getAllRoutines() {
  return db.getAllSync('SELECT * FROM routines ORDER BY id DESC');
}

export function createRoutine(name) {
  const result = db.runSync('INSERT INTO routines (name) VALUES (?)', [name]);
  return result.lastInsertRowId;
}

export function addExerciseToRoutine(routineId, exerciseId, order) {
  db.runSync(
    'INSERT INTO routine_exercises (routine_id, exercise_id, exercise_order) VALUES (?, ?, ?)',
    [routineId, exerciseId, order]
  );
}

export function getExercisesForRoutine(routineId) {
  return db.getAllSync(
    `SELECT exercises.* FROM routine_exercises
     JOIN exercises ON routine_exercises.exercise_id = exercises.id
     WHERE routine_exercises.routine_id = ?
     ORDER BY routine_exercises.exercise_order ASC`,
    [routineId]
  );
}

export function deleteRoutine(routineId) {
  db.execSync(`DELETE FROM routine_exercises WHERE routine_id = ${routineId};`);
  db.execSync(`DELETE FROM routines WHERE id = ${routineId};`);
}

export function addBodyLog(weight, chest, waist, arms) {
  const today = new Date().toISOString().split('T')[0];
  db.runSync(
    'INSERT INTO body_logs (date, weight, chest, waist, arms) VALUES (?, ?, ?, ?, ?)',
    [today, weight || null, chest || null, waist || null, arms || null]
  );
}

export function getAllBodyLogs() {
  return db.getAllSync('SELECT * FROM body_logs ORDER BY date ASC');
}

// --- NEW FUNCTION TO GENERATE SHAREABLE CARD DATA ---
export function getWorkoutSummary(workoutId) {
  const result = db.getFirstSync(
    `SELECT 
       SUM(weight * reps) as totalVolume, 
       COUNT(DISTINCT exercise_id) as exercisesCompleted
     FROM sets 
     WHERE workout_id = ?`,
    [workoutId]
  );

  const workout = db.getFirstSync(`SELECT date FROM workouts WHERE id = ?`, [workoutId]);

  return {
    title: 'Workout Summary', // Add a 'title' column to workouts table in the future if you want custom names
    totalVolumeKg: result.totalVolume || 0,
    exercisesCompleted: result.exercisesCompleted || 0,
    date: workout ? workout.date : new Date().toLocaleDateString()
  };
}

export default db;