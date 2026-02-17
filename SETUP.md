# 🚀 Setup Guide for Tide Mobile

This guide will help you set up the development environment for Tide Mobile.

## Prerequisites

### 1. Install Node.js
Download and install Node.js 18 or higher from [nodejs.org](https://nodejs.org/)

```bash
node --version  # Should be 18.x or higher
```

### 2. Install React Native CLI

```bash
npm install -g react-native-cli
```

### 3. Platform-Specific Setup

#### Android Setup

1. **Install Java Development Kit (JDK) 17**
   - Download from [Oracle JDK](https://www.oracle.com/java/technologies/downloads/)
   - Or use OpenJDK: `choco install openjdk17` (Windows with Chocolatey)

2. **Install Android Studio**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - During installation, make sure to install:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device (AVD)

3. **Configure Environment Variables**

   **Windows:**
   ```powershell
   # Add to System Environment Variables
   ANDROID_HOME=C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk

   # Add to PATH
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

   **macOS/Linux:**
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

4. **Create Android Virtual Device (AVD)**
   - Open Android Studio
   - Go to Tools → AVD Manager
   - Click "Create Virtual Device"
   - Select a device (e.g., Pixel 5)
   - Download and select a system image (API 33 recommended)
   - Click Finish

#### iOS Setup (macOS only)

1. **Install Xcode**
   - Download from Mac App Store
   - Open Xcode and accept license agreement
   - Install Xcode Command Line Tools:
     ```bash
     xcode-select --install
     ```

2. **Install CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

## Project Setup

### 1. Clone and Install

```bash
# If starting fresh
cd e:/Projects/tide-mobile
npm install
```

### 2. Install iOS Dependencies (macOS only)

```bash
cd ios
pod install
cd ..
```

### 3. Initialize React Native

If this is a completely fresh project, you may need to initialize the Android/iOS native directories:

```bash
# Initialize Android
npx react-native init TideMobile --template react-native-template-typescript --directory .

# This will create android/ and ios/ folders if they don't exist
```

**Note:** If you already have the `src/` folder with all the TypeScript code, you can merge it after initialization.

### 4. Link Assets (if using custom fonts or icons)

```bash
npx react-native-asset
```

## Running the App

### Start Metro Bundler

In one terminal:
```bash
npm start
```

### Run on Android

In another terminal:

**With Emulator:**
```bash
# Make sure emulator is running first
npm run android
```

**With Physical Device:**
1. Enable Developer Options on your Android phone
2. Enable USB Debugging
3. Connect via USB
4. Run `adb devices` to verify connection
5. Run `npm run android`

### Run on iOS (macOS only)

```bash
npm run ios
```

Or open `ios/TideMobile.xcworkspace` in Xcode and click Run.

## Troubleshooting

### Android Issues

**Error: SDK location not found**
```bash
# Create local.properties in android/ folder
echo "sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk" > android/local.properties
# (Use forward slashes on macOS/Linux)
```

**Error: Could not connect to development server**
```bash
# Reverse the port
adb reverse tcp:8081 tcp:8081
```

**Build fails with "Execution failed for task ':app:installDebug'"**
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

### iOS Issues

**Error: Could not find iPhone simulator**
```bash
# List available simulators
xcrun simctl list devices

# Boot a specific simulator
xcrun simctl boot "iPhone 15"
```

**Error: No bundle URL present**
```bash
# Reset Metro bundler
npm start -- --reset-cache
```

**CocoaPods errors**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Metro Bundler Issues

**Port 8081 already in use**
```bash
# Kill the process
npx react-native start --port 8082

# Or find and kill the process manually
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8081 | xargs kill -9
```

**Cache issues**
```bash
# Clear Metro cache
npm start -- --reset-cache

# Clear npm cache
npm cache clean --force

# Clear all caches
rm -rf node_modules
rm package-lock.json
npm install
```

## Connecting to Tide Commander

### 1. Start Tide Commander with Network Access

```bash
cd path/to/tide-commander
echo "LISTEN_ALL_INTERFACES=1" >> .env
tide-commander start
```

### 2. Find Your Computer's IP

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**macOS/Linux:**
```bash
ifconfig
# or
ip addr show
# Look for inet address (usually 192.168.x.x)
```

### 3. Configure in App

1. Open Tide Mobile
2. Tap Settings (⚙️)
3. Enter Server URL: `http://YOUR_IP:5174`
4. Tap "Test Connection"
5. Save

### 4. Network Troubleshooting

**Can't connect to server:**
- Make sure phone and computer are on same WiFi
- Check firewall settings (allow port 5174)
- Try accessing `http://YOUR_IP:5174` in phone's browser
- Verify Tide Commander is running with `LISTEN_ALL_INTERFACES=1`

## Development Tips

### Hot Reload
- Press `r` in Metro terminal to reload
- Press `d` to open developer menu
- Shake device to open developer menu

### Debug Menu
- Android: Shake device or press `Ctrl+M` (emulator)
- iOS: Shake device or press `Cmd+D` (simulator)

### Chrome DevTools
1. Open debug menu
2. Select "Debug JS Remotely"
3. Chrome will open with debugging tools

### React Native Debugger (Recommended)
```bash
# Install standalone app
brew install --cask react-native-debugger  # macOS
# Or download from GitHub releases

# Enable it in debug menu
```

### VS Code Extensions (Recommended)
- React Native Tools
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter

## Building for Production

### Android APK

```bash
cd android
./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

### iOS Archive (macOS only)

1. Open `ios/TideMobile.xcworkspace` in Xcode
2. Select "Any iOS Device" as target
3. Product → Archive
4. Follow distribution steps

## Next Steps

Once you have the app running:
1. ✅ Configure server connection in Settings
2. ✅ Test connection to Tide Commander
3. ✅ View your agents in the list
4. ✅ Open a chat and send a command
5. ✅ Watch real-time updates!

For more help, see [README.md](README.md) or join the [Discord](https://discord.gg/MymXXDCvf).
