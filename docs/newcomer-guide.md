# Newcomer Guide

Welcome to the project! This short guide introduces the overall structure of the codebase and highlights key concepts to help you get started quickly.

## General Structure

- **App Entry & Navigation**
  - `App.js` sets up the React Navigation stack with screens like `Login`, `Signup`, `Events`, `AdminEvents`, and `Profile`. It also handles push-notification setup when the app loads.

- **Firebase Configuration**
  - `firebaseConfig.js` initializes Firebase services (Firestore, Authentication, and Storage) and exports them for other modules to use.

- **Push Notifications**
  - `expoPushNotifications.js` registers the device for Expo push notifications. It requests permissions and creates an Android channel if necessary.

- **API Helpers (in `pages/api/` directory)**
  - `event.js` manages creating/editing events, scheduling reminders, and sending push notifications.
  - `users.js` includes authentication helpers and utilities to load the current user or store the device's notification token.

- **UI Components**
  - `components/NavBar.js` renders the bottom navigation bar. It checks whether the user is an admin to show extra links such as "Volunteers".

- **Screens (in `pages/` directory)**
  - `events.js` lists upcoming events with filters and navigation to individual event pages.
  - `signup.js` collects user details and interests before creating a user in Firebase Auth.
  - `waiver.js` stores emergency contact information in Firestore when the user accepts the waiver.
  - `profile.js` allows users to edit personal info, manage interests, and drop from events.
  - `notifications.js` displays push notifications retrieved from Firestore.
  - Admin-only screens live under `pages/admin/` for creating, editing, and viewing events, managing volunteers, and reviewing archived events.

## Important Concepts

1. **Firebase Integration**
   - Firestore, Auth, and Storage are initialized in `firebaseConfig.js`. Many modules import these directly.
2. **Push Notifications**
   - The device's Expo notification token is registered on startup and stored in the user's document. Event reminders are scheduled in `pages/api/event.js`.
3. **Admin vs. Regular Users**
   - Screens check if the logged-in user is an admin to show different navigation options and event management features.
4. **Events & Shifts**
   - Events store shift IDs referencing separate `shifts` documents. Users sign up for shifts, and reminders are scheduled accordingly.
5. **Data Flow**
   - Screens fetch data from Firestore on mount or when focused. Updates are written back to Firestore directly from the UI.

## Next Steps to Explore

- Review the Firestore schema for events, shifts, users, waivers, and notifications.
- Explore the admin-specific pages under `pages/admin/` to understand event creation and volunteer management.
- Examine `expoPushNotifications.js` and `pages/api/event.js` to see how notifications are registered and scheduled.
- Study `Login.js`, `Signup.js`, and `Waiver.js` to follow the user onboarding flow.
- Consider how error cases are handled throughout the screens and API helper functions.

We hope this overview helps you get comfortable with the project. Happy coding!
