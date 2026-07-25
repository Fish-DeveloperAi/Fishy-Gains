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
  // Epley formula
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function getBestSetForExercise(exerciseId) {
  return db.getFirstSync(
    `SELECT weight, reps FROM sets WHERE exercise_id = ? ORDER BY weight DESC LIMIT 1`,
    [exerciseId]
  );
}

export default db;