# Strength Fitness Tracker

**A comprehensive web application for tracking strength training, cardio, and diverse workout routines.**

Built by **Faith Rider** | [Demo Video](#demo) | [Live Application](https://ui-project-1-ten.vercel.app/) | [Source Code](https://github.com/faithrider/UI-project-1)

---

## Project Overview

My Strength Fitness Tracker is a modern web application designed for fitness enthusiasts who want a clean, efficient way to log and track their workouts. This application focuses on providing a polished user experience with flexible exercise tracking, visual progress insights, and a customizable interface that adapts to user preferences.

### Key Features
- **Hybrid Exercise Support**: Track strength training (sets/reps/weight), cardio (duration/intensity), and other activities (descriptions), without needing to use different apps.
- **Smart Organization**: Weekly workout views with intuitive navigation and editing
- **Visual Progress**: Exercise type distribution charts and weekly progress tracking
- **Personal Goals**: Set individual fitness targets including weight goals, distance targets, and consistency metrics
- **Three Custom Themes**: Professional design system with dark, light, and warm color schemes
- **Comprehensive Statistics**: Session counts, goal tracking, and progress visualization

---

## Design Process

### Research & Interviewing
I wanted to understand how people currently approach journaling or tracking their workouts, and what makes a tracker feel useful versus overwhelming. I was also looking for insights about which features they find essential and which can be left out.

#### Questions I Asked
- What information feels most important to record for strength training?
- Do you currently track your workouts or activities? If so, how?
- What does "success" mean to you in your fitness goals?

**Key Insights from User Interviews:**
- Users wanted flexibility to track different exercise types in one workout
- Visual progress feedback was highly valued
- Customization options were important for long-term engagement
- Simple, clean interfaces performed better than feature-heavy alternatives

### Sketching & Wireframing
Early design exploration focused on layout and information hierarchy:

![Original Design](img/og-design.png)
![Midpoint Iteration](img/midpoint1.png)
![Another Midpoint Iteration](img/midpoint2.png)
![Final Sketch](img/final-sketch.png)

**Design Iterations:**
1. **Initial Concept**: Single-page form-focused design
2. **First Iteration**: Added tabbed navigation between entry, history, and overview
3. **Final Design**: Clean header navigation with dedicated views for each major function

### User Feedback Integration
User testing revealed key improvements:
- **Navigation**: Users preferred persistent header navigation over tabs
- **Exercise Types**: Mixed workouts needed better visual differentiation
- **Goals**: Personal goal setting was requested as a priority feature
- **Themes**: Multiple color schemes fit to light/dark mode preference

### Mock User Profile

Name: Alex Morgan
Age: 24
Background: College student, works out 3–4 times per week, tracks workouts inconsistently in phone notes.
Goals: Wants to improve strength in major lifts, keep better track of progress, and stay consistent week-to-week.
How they use the app:
- Logs workouts immediately after finishing them.
- Tracks sets/reps/weight for main exercises, checks the warmup box, and occasionally adds notes/photos.
- Looks back weekly to see how many sessions they completed.
- Uses the weekly sessions goal feature to stay on track.
- Switches themes occasionally to match their mood.

---

## Interface Design

### Main Navigation
![Header navigation showing user info and view switcher](img/header.png)

The header provides constant access to all major functions while displaying personalized user information including days active and total workouts logged.

### Workout Entry Form
![Entry form with hybrid exercise type selection](img/entry-form.png)

**Key Features:**
- **Exercise Type Selection**: Per-exercise dropdown supporting strength, cardio, and other activities
- **Dynamic Fields**: Form adapts based on exercise type selection
- **Validation**: Real-time feedback ensures complete entries
- **Warmup Tracking**: Optional warmup completion badges
- **Notes & Photos**: Rich context for workout sessions

### History & Editing
![Weekly workout history with inline editing](img/history.png)

**Workout History Features:**
- **Weekly Organization**: Accordion-style week navigation
- **Color-Coded Exercises**: Visual distinction between strength, cardio, and other exercises
- **Inline Editing**: Complete workout modification without modal dialogs
- **Mixed Workout Indicators**: Special badges for workouts with multiple exercise types

### Progress Overview
![Statistics dashboard with pie chart and goals](img/overview.png)

**Analytics Dashboard:**
- **Current Week Progress**: Real-time tracking against weekly goals
- **Exercise Distribution**: Interactive pie chart showing workout balance
- **Personal Goals**: Individual target setting for weight, distance, consistency, and performance
- **Historical Trends**: 8-week progression visualization

### Theme Customization
![Tundra theme](img/tundra.png)
![Cocoa theme](img/cocoa.png)
![Sunset theme (with popup)](img/sunset.png)

**Three Theme Options:**
- **Tundra (Default)**: Clean light theme optimized for readability
- **Cocoa**: Warm dark theme with rich browns and golds
- **Sunset**: Vibrant orange theme with high contrast

---

## Technical Implementation

### Technology Stack
- **Frontend Framework**: Svelte for framing the project
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Vanilla CSS with CSS custom properties for theming
- **Data Persistence**: Browser localStorage with structured data management

### Architecture Overview
```
src/
├── routes/
│   ├── +layout.svelte      # App shell and theme management
│   └── +page.svelte        # Main application router
├── lib/
│   ├── Header.svelte       # Navigation and user info
│   ├── EntryForm.svelte    # Workout entry interface
│   ├── EntryList.svelte    # History and editing
│   ├── Modal.svelte        # Pop-up alerts
│   ├── Overview.svelte     # Statistics and goals
│   ├── Settings.svelte     # Customization options
│   └── stores.js           # Data management and API
├── app.css                 # Global styles and theme system
└── app.html                # Base template
```

### Data Management
**Store Architecture:**
```javascript
// Reactive data stores
export const entries = writable([]);
export const weeklyGoal = writable(3);
export const userGoals = writable({
  weightGoal: null,
  monthlyDistanceGoal: null,
  consistencyGoal: 80,
  strengthPRGoal: null,
  cardioTimeGoal: null
});
```

**Workout Data Structure:**
```javascript
{
  id: "timestamp",
  date: "2025-09-22",
  workoutType: "Push (Chest, Shoulders, Triceps)",
  exercises: [
    {
      type: "strength",
      name: "Bench Press",
      sets: 4,
      reps: 8,
      weight: 185
    },
    {
      type: "cardio", 
      name: "Running",
      duration: "30 minutes",
      intensity: "Moderate"
    }
  ],
  warmupCompleted: true,
  notes: "Great session, felt strong",
  photo: null
}
```

### Key Implementation Details

**Reactive Data Flow:**
- Svelte 5 runes (`$state`, `$derived`) for optimal reactivity
- Centralized store management with localStorage persistence
- Real-time UI updates across all components

**Theme System:**
- CSS custom properties for consistent theming
- Dynamic theme switching via body class manipulation
- Persistent theme selection across sessions

**Form Handling:**
- Per-exercise type validation and field management
- Dynamic form structure based on exercise selection
- Comprehensive error handling and user feedback

---

## Use of AI in Development

**AI Tools Utilized:**
- **GitHub Copilot**: Code inline autocomplete, and debugging
- **ChatGPT**: Problem-solving consultation and abstracted idea generation

**Strengths Observed:**
- **Code Patterns**: Helpful for generating consistent Svelte component patterns when babysat
- **Problem Solving**: Effective for debugging CSS layout and reactivity issues

**Limitations Encountered:**
- **Context Awareness**: AI likes to introduce complex solutions, without accounting for architecture changes (for example, if I was confused on why there was a simple type error, AI would immediately suggest using typescript without actually solving the underlaying problem).
- **Design Decisions**: UI/UX choices required human judgment and user feedback. AI alone cannot—or atleast, should not—fully create an application as it's not based on what best for a human.

---

## Possible Future Development

### Planned Enhancements
**Phase 1: Enhanced Tracking**
- Progress photos with before/after comparisons over time
- Body measurements tracking integration
- More robust goal tracking options

**Phase 2: Program Management**
- Workout template creation and sharing
- Progressive overload recommendations
- Workout program following (5/3/1, Starting Strength, etc.)
- Calendar integration for workout scheduling

**Phase 3: Mobile App Interface**
- Linked interface with mobile application
- Ability to download from the app store
- Export functionality (PDF reports, CSV data)

### Attempted Features
**Advanced CSS**: Explored various interesting CSS animations, but opted to keep it simpler for speed in both page loading and development time.

**Robust Charting**: Investigated Chart.js integration but opted for custom SVG implementation for better theme integration and smaller bundle size.

---

## Demo Video

[🎥 **Watch 3-Minute Demo Video**](link-to-video)

---

## Links

### [**Live Application**](https://ui-project-1-ten.vercel.app/)
Experience the full application with demo data pre-loaded.

### [**Source Code on GitHub**](https://github.com/faithrider/UI-project-1)
Complete source code with development setup instructions.

---
## Development Setup

### Local Development
```bash

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm run preview
```

---

*This project demonstrates modern web development practices with a focus on user experience, clean architecture, and intuitive design.*