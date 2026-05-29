# Black Forest

> *"Something walks between the trees. And it knows you're there."*

**Black Forest** is an interactive psychological horror narrative game built with Ionic + Angular. You play as Daniel, a man who has just moved with his partner to a remote village surrounded by forest. What begins as a quiet life quickly spirals into mystery, impossible choices, and a presence that cannot be ignored.

Every decision matters. Every indicator counts. There are no right answers.

---

## Screenshots

| Main Menu | Intro | Settings |
|:-:|:-:|:-:|
| <img width="300" height="600" alt="localhost_8100_home(iPhone 14 Pro Max)" src="https://github.com/user-attachments/assets/b9e788cb-adf5-4496-870c-e2797374fea5" /> | <img width="300" height="600" alt="localhost_8100_home(iPhone 14 Pro Max) (2)" src="https://github.com/user-attachments/assets/08c54a44-6e7c-4e1a-9958-e105ba98c00c" /> | <img width="300" height="600" alt="localhost_8100_home(iPhone 14 Pro Max) (1)" src="https://github.com/user-attachments/assets/40df91b5-f3e1-446c-803d-bca75a2e4e8b" /> |

| History | Tutorial | Information |
|:-:|:-:|:-:|
| <img width="300" height="600" alt="localhost_8100_home(iPhone 14 Pro Max) (3)" src="https://github.com/user-attachments/assets/3dc203a5-781a-4a7d-b0bd-c37e29c56744" /> | <img width="300" height="600" alt="localhost_8100_home(iPhone 14 Pro Max) (4)" src="https://github.com/user-attachments/assets/e4210c5b-6494-4e5a-80cb-3e8ff2de5620" /> | <img width="300" height="600" alt="localhost_8100_home(iPhone 14 Pro Max) (5)" src="https://github.com/user-attachments/assets/9cdd7235-c44d-4aef-8994-9914f98519e5" /> |

---

## Features

### Branching Narrative
- Story divided into chapters with **multiple routes** based on player decisions
- From Chapter 3 onward, the story splits into completely different paths (`chapter-3a`, `chapter-3b`) depending on key choices made in Chapter 2
- Narrative text written in second person with **dynamic variants** based on player state

### Dynamic Indicator System
Four indicators that evolve throughout the story:

| Indicator | Description |
|-----------|-------------|
| 🔵 **Information** | Knowledge accumulated about the mystery |
| 🔴 **Stress** | The protagonist's mental pressure |
| 🟢 **Safety** | Physical wellbeing and sense of environmental control |
| 🟣 **Control** | Composure and ability to make rational decisions |

Indicators affect which options are available, what text is displayed, and how the character reacts.

### Regulation Actions
In safe zones, when stress exceeds 40%, the player can use narrative actions to calm down:
- *"Close your eyes and breathe slowly"*
- *"Think about Jane. Something good"*
- *"Listen to the surroundings. Just listen"*

Each action has a cost in other indicators and can only be used once per scene.

### Information Journal
A system of unlockable entries discovered through decisions. Each entry is a puzzle piece — not a direct answer.

### Audio System
- Heartbeat sounds that reinforce tension
- Ambient music differentiated between menu and gameplay
- Configurable volume from the settings screen

### Immersive UI/UX
- Fixed viewport with no external scroll — feels like a game, not a webpage
- Narrative window with internal scroll and reading gradient
- Decision modal with entrance animation and blurred overlay
- Visual feedback for indicator changes (animated circular icons)
- Toast notifications for positive events
- Contextual tutorial available throughout Chapter 1

---

## Tech Stack

| Technology | Version | Usage |
|------------|---------|-------|
| **Angular** | 20 | Core framework, standalone components |
| **Ionic Framework** | 8 | UI components, navigation, modals |
| **Capacitor** | 8 | Native Android build |
| **TypeScript** | 5.9 | Static typing |
| **SCSS** | — | Styles with reusable variables and mixins |
| **RxJS** | 7.8 | Reactive state with BehaviorSubject |
| **localStorage** | — | Save game persistence |

### Architecture Highlights
- **Standalone Components** (Angular 20, no NgModules)
- **Service-based separation of concerns**: `GameStateService`, `StoryService`, `RegulationService`, `AudioService`, `SettingsService`, `InfoDatabaseService`
- **JSON-driven storytelling**: all narrative content lives in JSON files — no hardcoded story logic
- **Indicators as state machine**: decisions modify numeric values that unlock or block future options

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Ionic CLI: `npm install -g @ionic/cli`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/black-forest.git
cd black-forest/bosque-oscuro

# Install dependencies
npm install

# Start the development server
ionic serve
```

The app will be available at `http://localhost:8100`

### Android Build

```bash
# Production build
ionic build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

---

## Project Structure

```
bosque-oscuro/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   ├── scene.model.ts              # Types: Scene, Choice, TextVariant
│   │   │   │   ├── player-state.model.ts       # PlayerState, indicators, defaults
│   │   │   │   └── regulation-action.model.ts  # Regulation action types
│   │   │   └── services/
│   │   │       ├── game-state.service.ts       # Player state, effects, localStorage
│   │   │       ├── story.service.ts            # JSON loading, choice evaluation
│   │   │       ├── regulation.service.ts       # Calm actions in safe zones
│   │   │       ├── audio.service.ts            # Heartbeat and ambient music
│   │   │       ├── settings.service.ts         # Volume, preferences
│   │   │       └── info-database.service.ts    # Journal entry definitions
│   │   └── pages/
│   │       ├── home/        # Main menu — new game / continue
│   │       ├── intro/       # Introduction screen with audio notice
│   │       ├── scene/       # Game engine: text, decisions, indicators
│   │       └── settings/    # Volume, language
│   └── assets/
│       ├── story/
│       │   ├── chapters.json       # Chapter manifest (auto-loaded)
│       │   ├── chapter-1.json      # Chapter 1: The first day (scenes 100–136)
│       │   ├── chapter-2.json      # Chapter 2: What moves in the dark (scenes 200–223)
│       │   ├── chapter-3a.json     # Chapter 3A: Silence route (scenes 300–349)
│       │   ├── chapter-3b.json     # Chapter 3B: Confrontation route (scenes 350–399)
│       │   └── ...
│       └── audio/
│           ├── dragon-studio-heartbeat-sound-372448.mp3
│           └── tunetank-dark-space-ambient-348870.mp3
└── android/                        # Native Android project (Capacitor)
```

---

## Chapter System

The story uses an ID range system to manage multiple branching routes:

| Chapter | ID Range | Description |
|---------|----------|-------------|
| 1 | 100 – 199 | The first day in Oakhurst |
| 2 | 200 – 299 | The night and its secrets |
| 3A | 300 – 349 | Silence route (from decision 221) |
| 3B | 350 – 399 | Confrontation route (from decision 222) |
| 4+ | 400+ | Upcoming chapters |

Adding a new chapter is as simple as creating a JSON file and registering it in `chapters.json`. The `StoryService` loads it automatically.

---

## How to Play

1. **New Game** — start from Chapter 1
2. **Read** the narrative text at your own pace
3. **Decide** when the action button appears
4. **Watch** how your indicators shift with each choice
5. **Check** the journal (📖) to review discovered information
6. **Regulate** your stress in safe zones when it exceeds 40%
7. **Continue** — your progress is saved automatically

> The tutorial (?) is available throughout all of Chapter 1.

---

## Roadmap

- [ ] **Full i18n support** — complete English localization
- [ ] **Adaptive music** — soundtrack shifts based on player indicators
- [ ] **Haptic feedback** — tactile response at critical moments (Capacitor Haptics already installed)
- [ ] **Chapter summary screen** — review decisions and consequences at the end of each chapter
- [ ] **Unique scene illustrations** — custom artwork for key scenes
- [ ] **Achievements system** — unlockable milestones
- [ ] **Chapters 4 and 5** — continuation of the main story
- [ ] **App Store / Play Store release**

---

## Credits

**Development & Writing**: Hernán Martinez

**State:**
This project is under active development. The story is being built little by little. I will keep you updated.

**Audio**:
- *Heartbeat Sound* — Dragon Studio (via Pixabay)
- *Dark Space Ambient* — Tunetank (via Pixabay)

**Built with**:
- [Ionic Framework](https://ionicframework.com/)
- [Angular](https://angular.dev/)
- [Capacitor](https://capacitorjs.com/)
- [Ionicons](https://ionic.io/ionicons)

---

<div align="center">
  <sub>Built with Angular 20 + Ionic 8 · Mobile-first · JSON-driven storytelling</sub>
</div>
