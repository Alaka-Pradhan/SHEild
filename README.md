# 🛡️ SHEild – Smart Help & Emergency Shield for Women

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactnative.dev/)

SHEild is a cross-platform mobile app built with React Native (Expo) to empower women with real-time safety tools, emergency features, and a supportive community. The app provides quick access to SOS, live location sharing, safety checklists, and more, all wrapped in a beautiful, modern UI with dark mode support.

## ✨ Features

### 🏗️ Core Architecture
- Built with Expo Router for seamless navigation
- Theme system with light/dark mode support
- Registration-based app flow with Google OAuth
- AsyncStorage for data persistence
- Secure authentication system
- Responsive design for all screen sizes

### 🚨 Safety Features
- **SOS Functionality**: One-tap emergency button with location sharing
- **Real-time Location**: Share your live location with trusted contacts
- **Emergency Alarm**: Loud alarm to deter threats
- **Emergency SMS**: Send your location via SMS to emergency contacts
- **Evidence Camera**: Document incidents with photos
- **Helpline Numbers**: Quick access to emergency services (1091, 100, 112)
- **Safety Checklist**: Interactive safety guidelines and tips
- **Activity Log**: Track your safety-related activities
- **Safety Tips**: Rotating safety tips on the home screen
- **Activity Log**: Track recent activities and safety checks
- **Interactive Checklist**: Personal safety checklist with progress tracking
- **Haptic Feedback**: Tactile responses for key interactions

### Screens
1. **Registration Screen**: Secure onboarding with Google OAuth support
2. **Home Screen**: Dashboard with quick access to all safety features
3. **Settings Screen**: Profile management and app preferences
4. **Toolkit Screen**: Collection of safety tools and emergency contacts

## 📱 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Alaka-Pradhan/SHEild.git
   cd SHEild
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the app (Expo)**
   ```bash
   npx expo start
   ```
   - Use Expo Go, Android/iOS emulator, or the web preview to run.

4. **Run tests**
   ```bash
   npm test
   ```

5. **Lint**
   ```bash
   npm run lint
   ```

## 🗂 Project Structure

- `app/` – App entry, routing, and layout (Expo Router)
  - `(tabs)/` – Tab navigation screens
  - `_layout.tsx` – Root layout configuration
  - `+not-found.tsx` – 404 error page
- `components/` – Reusable UI components
  - `ui/` – Base UI components
  - `Collapsible.tsx` – Collapsible content component
  - `CommunityScreen.js` – Community features
  - `ExternalLink.tsx` – External link handler
- `constants/` – Application constants
  - `Colors.ts` – Theme color definitions
- `hooks/` – Custom React hooks
  - `useColorScheme.ts` – Theme management
  - `useThemeColor.ts` – Theming utilities
- `assets/` – Static assets
  - `fonts/` – Custom fonts
  - `images/` – App images and icons
  - `sounds/` – Audio files and alerts
- `styles/` – Component-specific style sheets

## 🛠 Technologies Used

### Core
- **React Native** (Expo SDK 53)
- **Expo Router** – File-based routing
- **React Navigation** – Tab and stack navigation
- **AsyncStorage** – Local data persistence

### Key Dependencies
- **@expo/vector-icons** – Icon library
- **expo-location** – GPS and location services
- **expo-camera** – Evidence photo capture
- **expo-av** – Audio playback for alarms
- **expo-sharing** – File sharing capabilities
- **react-native-maps** – Interactive maps
- **expo-haptics** – Tactile feedback
- **expo-contacts** – Emergency contacts integration
- **expo-clipboard** – Copy functionality

### UI/UX
- **React Native Reanimated** – Smooth animations
- **React Native Gesture Handler** – Touch handling
- **React Native Safe Area Context** – Safe area management

## 📝 Contribution
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change. Please:
- Branch off `main`
- Run `npm test` before opening a PR
- Keep commits small and focused

## 📄 License
This project is for educational/demo purposes. Please contact the author for production/commercial use.

---

**SHEild – Your Safety, Our Shield.**
