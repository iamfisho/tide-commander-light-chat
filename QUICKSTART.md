# ⚡ Quick Start Guide

Get Tide Mobile running in 5 minutes!

## Step 1: Install Dependencies (2 min)

```bash
cd e:/Projects/tide-mobile
npm install
```

## Step 2: Setup Tide Commander Server (1 min)

In your Tide Commander directory:

```bash
# Enable network access
echo "LISTEN_ALL_INTERFACES=1" >> .env

# Start the server
tide-commander start
```

## Step 3: Get Your Server IP (30 sec)

```bash
# Windows
ipconfig

# Look for "IPv4 Address" like: 192.168.1.100
```

## Step 4: Run the App (1 min)

### Android (Recommended)

```bash
# Open Android Studio and start an emulator first
# OR connect your Android phone via USB with USB Debugging enabled

npm run android
```

### iOS (macOS only)

```bash
cd ios && pod install && cd ..
npm run ios
```

## Step 5: Connect to Server (30 sec)

1. In the app, tap the ⚙️ Settings icon
2. Enter Server URL: `http://YOUR_IP:5174` (e.g., `http://192.168.1.100:5174`)
3. Tap "Test Connection" ✅
4. Tap "Save Settings"
5. Go back to see your agents! 🎉

---

## Troubleshooting

### Can't connect to server?
- ✅ Phone and computer on same WiFi?
- ✅ Tide Commander running with `LISTEN_ALL_INTERFACES=1`?
- ✅ Firewall allowing port 5174?
- ✅ Try `http://YOUR_IP:5174` in phone's browser

### Android build failed?
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Metro bundler issues?
```bash
npm start -- --reset-cache
```

### Need more help?
See [SETUP.md](SETUP.md) for detailed instructions.

---

## What's Next?

- 📝 Send commands to your agents
- 👀 Watch real-time responses
- 🔄 Pull to refresh agent list
- ⚙️ Customize settings

**Enjoy using Tide Mobile!** 🌊📱
