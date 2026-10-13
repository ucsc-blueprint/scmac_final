# Santa Cruz Mountain Art Center

React Native application using Expo SDK 52 and Firebase.

## Run in the iOS simulator

Install Xcode (including an iOS Simulator runtime), Node.js, and CocoaPods.

```sh
npm ci
npm run ios
```

The iOS command generates the native project when needed, installs CocoaPods,
builds the app, starts Metro, and launches an iOS simulator. To select a device:

```sh
npm run ios -- --device "iPhone 16 Pro"
```

After the app is installed, restart only the development server with:

```sh
npm start -- --dev-client
```

Press `i` to open the installed app on the simulator. Keep Metro running while
using the development build. Native dependency changes require `npm run ios` again.

## Android

Install Android Studio and configure an Android Virtual Device, then run:

```sh
npm run android
```

## Notes

- Firebase is configured in `firebaseConfig.js`; signing in requires an existing
  account or registering through the app.
- Remote push notifications require a physical device. Simulators skip push-token
  registration and can still run the app.
- Native projects are generated locally and ignored by Git. The existing app uses
  React Native's old architecture, explicitly retained in `app.json`.
- Use npm and `package-lock.json` for reproducible installs. `.npmrc` retains legacy
  peer resolution for the app's older third-party libraries.

## Demo UI and rollback

The visual refresh is on `main` and `codex/demo-ui`. The previous working UI is
preserved at commit `0bb20bb` on branch `codex/pre-ui-demo-0bb20bb`.
With a clean working tree, switch back with `git switch codex/pre-ui-demo-0bb20bb`, then reload the
running app by pressing `r` in the Metro terminal. No native rebuild is needed
for switching between these UI versions.
