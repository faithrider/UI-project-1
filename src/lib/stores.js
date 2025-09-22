import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_PREFIX = "swtracker:"

// Demo workouts to populate the app on first run
// Using realistic data so users can see what a filled tracker looks like
const mockEntries = [
  {
    id: "1",
    date: "2025-09-24",
    workoutType: "Push (Chest, Shoulders, Triceps)",
    exercises: [
      { name: "Bench Press", type: "strength", sets: 4, reps: 8, weight: 185 },
      { name: "Shoulder Press", type: "strength", sets: 3, reps: 10, weight: 135 },
    ],
    warmupCompleted: true,
    notes: "up 10lbs from last week. left shoulder still tight but better after bench",
    photo: null,
  },
  {
    id: "2",
    date: "2025-09-22",
    workoutType: "Cardio",
    exercises: [
      { name: "Running", type: "cardio", duration: "30 minutes", intensity: "Moderate" },
      { name: "Plank Hold", type: "other", description: "3 sets of 60 seconds, focused on core stability and breathing" },
    ],
    warmupCompleted: true,
    notes: "track laps. planks getting easier (barely)",
    photo: null,
  },
  {
    id: "3",
    date: "2025-09-19",
    workoutType: "Full Body",
    exercises: [
      { name: "Squats", type: "strength", sets: 4, reps: 10, weight: 205 },
      { name: "Cycling", type: "cardio", duration: "20 minutes", intensity: "High" },
      { name: "Yoga Flow", type: "other", description: "15-minute flexibility and mobility routine focusing on hip openers and spinal twists" },
    ],
    warmupCompleted: true,
    notes: "good mix today. squats felt solid, bike was brutal after",
    photo: null,
  },
  {
    id: "4",
    date: "2025-09-13",
    workoutType: "Push (Chest, Shoulders, Triceps)",
    exercises: [
      { name: "Overhead Press", type: "strength", sets: 3, reps: 6, weight: 95 },
      { name: "Tricep Dips", type: "strength", sets: 3, reps: 12, weight: 0 },
    ],
    warmupCompleted: true,
    notes: "shoulders still sore from monday. took it easier",
    photo: null,
  },
  {
    id: "5",
    date: "2025-09-07",
    workoutType: "Pull (Back, Biceps)",
    exercises: [
      { name: "Pull-ups", type: "strength", sets: 3, reps: 8, weight: 0 },
      { name: "Lat Pull-Downs", type: "strength", sets: 3, reps: 10, weight: 140 },
      { name: "Rowing Machine", type: "cardio", duration: "15 minutes", intensity: "Moderate" },
    ],
    warmupCompleted: true,
    notes: "two med bands for pullups. did rolling hills on rower",
    photo: null,
  },
  {
    id: "6",
    date: "2025-09-05",
    workoutType: "Legs (Quads, Hamstrings, Glutes)",
    exercises: [
      { name: "Romanian Deadlift", type: "strength", sets: 3, reps: 12, weight: 135 },
      { name: "Bulgarian Split Squats", type: "strength", sets: 3, reps: 8, weight: 40 },
    ],
    warmupCompleted: true,
    notes: "RDL form getting better (deeper). left side on split squats still weaker",
    photo: null,
  },
  {
    id: "7",
    date: "2025-09-03",
    workoutType: "Other",
    exercises: [
      { name: "Walking", type: "cardio", duration: "45 minutes", intensity: "Low" },
      { name: "Stretching Routine", type: "other", description: "Full body stretching session with emphasis on tight areas from previous workouts" },
    ],
    warmupCompleted: false,
    notes: "rest day walk. everything sore from yesterday",
    photo: null,
  },
  {
    id: "8",
    date: "2025-09-02",
    workoutType: "Cardio",
    exercises: [
      { name: "Burpees", type: "other", description: "4 sets of 10 reps - full body functional movement" },
      { name: "Jump Rope", type: "cardio", duration: "10 minutes", intensity: "High" },
      { name: "Push-ups", type: "strength", sets: 3, reps: 15, weight: 0 },
    ],
    warmupCompleted: true,
    notes: "gym was packed, didn't want to wait for machines",
    photo: null,
  },
  {
    id: "9",
    date: "2025-09-01",
    workoutType: "Pull (Back, Biceps)",
    exercises: [
      { name: "Chin-Ups", type: "strength", sets: 3, reps: 8, weight: 0 },
      { name: "Lat Pull-Downs", type: "strength", sets: 3, reps: 12, weight: 0 },
    ],
    warmupCompleted: true,
    notes: "gym was packed, didn't want to wait for machines",
    photo: null,
  },
  {
    id: "10",
    date: "2025-08-29",
    workoutType: "Cardio",
    exercises: [
      { name: "Cycle", type: "cardio", duration: "45 minutes", intensity: "Low" },
    ],
    warmupCompleted: true,
    notes: "incline 3",
    photo: null,
  },
]

// Main app state
export const entries = writable([]);
export const weeklyGoal = writable(3);

// Personal goals - keeping these optional since not everyone sets specific targets
export const userGoals = writable({
  weightGoal: null,
  monthlyDistanceGoal: null,
  consistencyGoal: 80,       // default to 80% consistency
  strengthPRGoal: null,
  cardioTimeGoal: null
});

// Load saved data on app start
function initWorkoutStore() {
  if (!browser) return; // SSR safety
  
  // Try to load existing workouts, fall back to demo data
  const stored = localStorage.getItem(STORAGE_PREFIX + "entries")
  if (stored) {
    entries.set(JSON.parse(stored))
  } else {
    entries.set(mockEntries)
    saveEntries()
  }

  // Load user preferences
  const goal = localStorage.getItem(STORAGE_PREFIX + "weeklyGoal")
  if (goal) {
    weeklyGoal.set(Number.parseInt(goal))
  }

  const storedGoals = localStorage.getItem(STORAGE_PREFIX + "userGoals")
  if (storedGoals) {
    userGoals.set(JSON.parse(storedGoals))
  }
}

// Persistence helpers
function saveEntries() {
  if (!browser) return;
  localStorage.setItem(STORAGE_PREFIX + "entries", JSON.stringify(get(entries)))
}

function saveWeeklyGoal() {
  if (!browser) return;
  localStorage.setItem(STORAGE_PREFIX + "weeklyGoal", get(weeklyGoal).toString())
}

function saveUserGoals() {
  if (!browser) return;
  localStorage.setItem(STORAGE_PREFIX + "userGoals", JSON.stringify(get(userGoals)))
}

// Main API for workout data management
export const workoutStore = {
  entries,
  weeklyGoal,
  userGoals,
  
  init: initWorkoutStore,

  addEntry(entry) {
    entry.id = Date.now().toString()
    if (!entry.date) {
      entry.date = new Date().toISOString().split("T")[0]
    }
    entries.update(currentEntries => [entry, ...currentEntries])
    saveEntries()
  },

  updateEntry(id, updatedEntry) {
    entries.update(currentEntries => {
      const index = currentEntries.findIndex((e) => e.id === id)
      if (index !== -1) {
        currentEntries[index] = { ...currentEntries[index], ...updatedEntry }
      }
      return currentEntries
    })
    saveEntries()
  },

  deleteEntry(id) {
    entries.update(currentEntries => currentEntries.filter((e) => e.id !== id))
    saveEntries()
  },

  // Group workouts by week for the history view
  getEntriesByWeek() {
    const currentEntries = get(entries)
    const weeks = {}
    currentEntries.forEach((entry) => {
      const date = new Date(entry.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Sunday start
      const weekKey = weekStart.toISOString().split("T")[0]

      if (!weeks[weekKey]) {
        weeks[weekKey] = []
      }
      weeks[weekKey].push(entry)
    })
    return weeks
  },

  setWeeklyGoal(goal) {
    weeklyGoal.set(goal)
    saveWeeklyGoal()
  },

  updateUserGoals(goals) {
    userGoals.update(current => ({ ...current, ...goals }))
    saveUserGoals()
  },

  setUserGoal(goalType, value) {
    userGoals.update(current => ({ ...current, [goalType]: value }))
    saveUserGoals()
  },

  // Nuclear option - wipe everything and start fresh
  clearAllData() {
    if (!browser) return;
    
    localStorage.removeItem(STORAGE_PREFIX + "entries")
    localStorage.removeItem(STORAGE_PREFIX + "weeklyGoal")
    localStorage.removeItem(STORAGE_PREFIX + "userGoals")
    localStorage.removeItem(STORAGE_PREFIX + "theme")
    localStorage.removeItem(STORAGE_PREFIX + "features")
    
    // Back to demo data
    entries.set(mockEntries)
    weeklyGoal.set(3)
    userGoals.set({
      weightGoal: null,
      monthlyDistanceGoal: null,
      consistencyGoal: 80,
      strengthPRGoal: null,
      cardioTimeGoal: null
    })
    theme.set("tundra")
    enabledFeatures.set({
      notes: true,
      warmup: true,
      photo: true,
    })
    saveEntries()
    saveWeeklyGoal()
    saveUserGoals()
    saveTheme()
    saveFeatures()
  }
}

// UI settings
export const theme = writable("tundra");
export const enabledFeatures = writable({
  notes: true,
  warmup: true,
  photo: true,
});

// Modal management
export const modal = writable(null);

export const modalService = {
  show(title, message, options = {}) {
    return new Promise((resolve) => {
      modal.set({
        title,
        message,
        showConfirm: options.showConfirm || false,
        confirmText: options.confirmText || 'Yes',
        cancelText: options.cancelText || 'Cancel',
        onConfirm: () => {
          modal.set(null);
          resolve(true);
        },
        onCancel: () => {
          modal.set(null);
          resolve(false);
        }
      });
    });
  },
  
  alert(title, message) {
    return this.show(title, message, { showConfirm: false });
  },
  
  confirm(title, message) {
    return this.show(title, message, { showConfirm: true });
  },
  
  hide() {
    modal.set(null);
  }
};

function initSettingsStore() {
  if (!browser) return;
  
  const storedTheme = localStorage.getItem(STORAGE_PREFIX + "theme")
  if (storedTheme) {
    theme.set(storedTheme)
  }

  const features = localStorage.getItem(STORAGE_PREFIX + "features")
  if (features) {
    enabledFeatures.set(JSON.parse(features))
  }
}

function saveTheme() {
  if (!browser) return;
  localStorage.setItem(STORAGE_PREFIX + "theme", get(theme))
}

function saveFeatures() {
  if (!browser) return;
  localStorage.setItem(STORAGE_PREFIX + "features", JSON.stringify(get(enabledFeatures)))
}

// Settings API
export const settingsStore = {
  theme,
  enabledFeatures,
  
  init: initSettingsStore,

  setTheme(newTheme) {
    theme.set(newTheme)
    saveTheme()
  },

  getTheme() {
    return get(theme)
  },

  toggleFeature(feature) {
    enabledFeatures.update(currentFeatures => {
      const updated = { ...currentFeatures }
      updated[feature] = !updated[feature]
      return updated
    })
    saveFeatures()
  },

  isFeatureEnabled(feature) {
    return get(enabledFeatures)[feature]
  }
}

// Bootstrap both data and settings
export function initStores() {
  initWorkoutStore()
  initSettingsStore()
}
