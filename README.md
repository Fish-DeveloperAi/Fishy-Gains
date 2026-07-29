# Fishy Gains 💪

A mobile workout tracker built for bodybuilders and lifters — log your sets, track progressive overload, and watch your numbers climb over time. Built with React Native (Expo) and a fully offline SQLite database, so it works in the gym with zero signal.

## Features

- **800+ exercise database** — searchable library sourced from an open, public-domain exercise dataset, filtered to weight-training equipment (barbell, dumbbell, cable, machine, bodyweight)
- **Custom exercises** — add your own lift if something's missing from the database
- **Set logging** — quick weight × reps entry per exercise, grouped into workout sessions
- **Progressive overload tracking** — automatically detects and celebrates new personal records as you log
- **1RM estimation** — calculates estimated one-rep max (Epley formula) so you can compare performance across different rep ranges
- **Rest timer** — auto-starts after each logged set, with a skip option
- **Progress charts** — visual line charts of estimated 1RM over time, per exercise
- **Workout history** — every past session with exercises, sets, and total training volume
- **Volume tracking** — total weight lifted per session (sets × reps × weight)
- **Workout routines/templates** — save routines like "Push Day" and reuse them instead of rebuilding from scratch
- **Body log** — track bodyweight and optional measurements (chest, waist, arms) with a trend chart
- **Fully offline-first** — all data lives in local SQLite on the device, no backend, no internet required

## Tech stack

- **React Native** (Expo) — cross-platform mobile framework
- **Expo SQLite** — local, offline-first relational database
- **React Navigation** — native stack navigation between screens
- **react-native-chart-kit** + **react-native-svg** — progress charts
- **Exercise data**: [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public domain / Unlicense)

## Project structure

```
fishy-gains/
├── App.js                     # Navigation setup, DB initialization
├── database/
│   └── db.js                  # SQLite schema, queries, and business logic (PRs, 1RM, volume)
├── screens/
│   ├── HomeScreen.js          # Workout history, entry point
│   ├── ExercisePickerScreen.js
│   ├── LogWorkoutScreen.js    # Set logging, PR detection, rest timer
│   ├── ExerciseHistoryScreen.js
│   ├── AddExerciseScreen.js
│   ├── RoutinesScreen.js
│   ├── EditRoutineScreen.js
│   ├── StartRoutineScreen.js
│   └── BodyLogScreen.js
├── components/
│   └── RestTimer.js
└── assets/
    └── exercises.json         # Exercise dataset
```

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org)
- [Expo Go](https://expo.dev/go) app on your phone (iOS or Android)

### Setup

```bash
git clone https://github.com/Fish-DeveloperAi/Fishy-Gains.git
cd Fishy-Gains
npm install --legacy-peer-deps
npx expo start
```

Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android) to run it live.

## How it works

- On first launch, the app seeds its local SQLite database with the exercise dataset, filtered to weight-training equipment.
- Every workout, set, routine, and body log entry is stored locally on-device — no account, no server, no sync required.
- PR detection compares each new set's estimated 1RM against your all-time best for that exercise and surfaces a celebration banner when you beat it.

## Data source & license

Exercise data is sourced from [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db), released under the Unlicense (public domain).

## Roadmap

- [ ] Social sharing / workout summary export
- [ ] Auto-chaining through full routine exercise lists
- [ ] Background-safe rest timer with notifications

## Author

Built by Amine — [GitHub](https://github.com/Fish-DeveloperAi) · aminebakhda1@gmail.com
