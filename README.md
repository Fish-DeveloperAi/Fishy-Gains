# 🐟 Fishy Gains 💪

**Fishy Gains** is an offline-first mobile workout tracker designed for lifters, bodybuilders, and strength athletes who want to focus on training—not internet connectivity.

Track workouts, monitor progressive overload, estimate your one-rep max, analyze long-term progress, and build reusable workout routines—all stored locally on your device with zero accounts or cloud services required.

---

##  Features

###  Extensive Exercise Library

* Browse over **800+ exercises**
* Fast search functionality
* Based on the public-domain **free-exercise-db** dataset
* Curated specifically for weight-training equipment including:

  * Barbell
  * Dumbbell
  * Cable
  * Machine
  * Bodyweight

###  Custom Exercises

Can't find your favorite variation?

Create your own exercises and seamlessly integrate them into your workouts.

---

###  Workout Logging

* Fast weight × reps logging
* Organized into workout sessions
* Edit or review previous workouts anytime
* Optimized for quick use between sets

---

###  Progressive Overload Tracking

Automatically detects new Personal Records (PRs) while logging workouts and celebrates your progress.

No manual tracking required.

---

###  Estimated 1RM

Uses the **Epley Formula** to estimate your one-rep maximum from every logged set, allowing meaningful comparisons across different rep ranges.

---

###  Smart Rest Timer

* Starts automatically after each set
* Skip option when you're ready early
* Keeps workouts flowing without distractions

---

###  Progress Analytics

Visualize your improvements with interactive charts showing:

* Estimated 1RM progression
* Long-term strength trends
* Exercise-specific history

---

###  Workout History

Every completed session is permanently stored locally, including:

* Exercises performed
* Individual sets
* Repetitions
* Weight lifted
* Total training volume

---

###  Workout Routines

Create reusable workout templates such as:

* Push Day
* Pull Day
* Legs
* Upper / Lower
* Full Body

Start an entire workout in seconds instead of rebuilding sessions every time.

---

###  Body Progress Tracking

Monitor your physical progress with:

* Bodyweight
* Chest measurements
* Waist measurements
* Arm measurements
* Historical trend charts

---

###  Shareable Workout Cards

Generate beautiful workout summary images showcasing:

* Completed workout statistics
* Personal Records
* Training volume

Share directly to your favorite social media platform.

---

###  Deep Oceanic Design

A completely custom visual identity featuring:

* Navy backgrounds (`#0B1D3A`)
* Bright cyan accents (`#00D2D3`)
* High contrast typography
* Smooth mobile-first experience

---

###  Offline First

Everything works without internet.

* No backend
* No accounts
* No subscriptions
* No cloud storage

All data is securely stored inside a local SQLite database on your device.

---

###  Ready for Production

Configured with **Expo EAS Build**, allowing direct Android APK generation for easy installation and distribution.

---

# 🛠 Tech Stack

| Category         | Technology                                   |
| ---------------- | -------------------------------------------- |
| Framework        | React Native (Expo)                          |
| Database         | Expo SQLite                                  |
| Navigation       | React Navigation                             |
| Charts           | react-native-chart-kit, react-native-svg     |
| Sharing          | react-native-view-shot, expo-sharing         |
| Exercise Dataset | free-exercise-db (Public Domain / Unlicense) |

---

#  Architecture

```text
                User
                  │
                  ▼
         React Native (Expo)
                  │
     ┌────────────┴────────────┐
     ▼                         ▼
 Workout Screens         Progress Charts
     │                         │
     └────────────┬────────────┘
                  ▼
           SQLite Database
                  │
       Workouts • PRs • Body Logs
       Exercises • Routines
```

---

#  Project Structure

```text
fishy-gains/
│
├── App.js
│
├── database/
│   └── db.js
│
├── screens/
│   ├── HomeScreen.js
│   ├── ExercisePickerScreen.js
│   ├── LogWorkoutScreen.js
│   ├── ExerciseHistoryScreen.js
│   ├── AddExerciseScreen.js
│   ├── RoutinesScreen.js
│   ├── EditRoutineScreen.js
│   ├── StartRoutineScreen.js
│   └── BodyLogScreen.js
│
├── components/
│   ├── RestTimer.js
│   └── ShareableWorkoutCard.js
│
└── assets/
    ├── exercises.json
    └── icon.png
```

---

#  Getting Started

## Prerequisites

* Node.js
* npm
* Expo Go (Android or iOS)

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Fish-DeveloperAi/Fishy-Gains.git
cd Fishy-Gains
```

Install dependencies:

```bash
npm install --legacy-peer-deps
```

Start the development server:

```bash
npx expo start
```

Open the application by scanning the QR code with:

* **Expo Go** (Android)
* **Camera App** (iOS)

---

#  How It Works

On first launch, Fishy Gains automatically initializes a local SQLite database and imports the bundled exercise dataset.

Every workout, routine, body measurement, and personal record is stored directly on your device.

When a newly logged set produces a higher estimated 1RM than your previous best, the app automatically recognizes it as a Personal Record and displays a celebration banner.

Because everything is stored locally, the application remains fully functional even without an internet connection.

---

#  Privacy

Fishy Gains is designed with privacy in mind.

* No accounts
* No analytics
* No advertisements
* No cloud synchronization
* No personal data collection

Your training data never leaves your device.

---

#  Data Source

Exercise information is provided by **free-exercise-db**, released under the **Unlicense (Public Domain)**.

---

# Roadmap

### Completed

* 800+ exercise database
* Workout routines
* Body tracking
* Progressive overload detection
* Shareable workout cards
* Deep Oceanic UI redesign
* Offline SQLite storage
* Exercise history
* Estimated 1RM calculations

### Planned

* Background-safe rest timer notifications
* Automatic progression through routine exercises
* Workout calendar
* Advanced filtering & search
* Exercise notes
* Backup & restore functionality
* Wear OS integration
* Apple Health / Google Fit support

---

# Authors

### **Amine**

GitHub: https://github.com/Fish-DeveloperAi

Mail: [aminebakhda1@gmail.com](mailto:aminebakhda1@gmail.com)

---

### **Aymen Hakkaoui**

GitHub: https://github.com/TheDeadShadow47

Mail: [aymenhakkaoui41@gmail.com](mailto:aymenhakkaoui41@gmail.com)

---

## Support

If you enjoy Fishy Gains or find it useful, consider giving the repository a **Star** on GitHub. It helps support the project and makes it easier for others to discover.

