# 📱 Tide Commander Light Chat

<div align="center">

**Lightweight Mobile Interface for Tide Commander**

*Monitor and control your AI agents from anywhere, anytime*

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/iamfisho/tide-commander-light-chat)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-000020.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~5.9.2-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack)

</div>

---

## 🎯 Overview

**Tide Commander Light Chat** is a sleek, lightweight mobile application built with React Native and Expo that brings the power of [Tide Commander](https://github.com/deivid11/tide-commander) to your fingertips. Monitor multiple AI agents, view their output in real-time, and send commands from your mobile device.

Perfect for developers who need to stay connected to their AI orchestration workflows while on the go.

## ✨ Features

### 🚀 Core Capabilities

- **Real-time Agent Monitoring** - View live status and activity of all your AI agents
- **WebSocket Communication** - Instant updates via native WebSocket connection
- **Markdown Support** - Rich text formatting for agent responses with syntax highlighting
- **Message Management**
  - Select and copy portions of text
  - Quick-copy entire messages
  - Full message history persistence
- **Smart Auto-scroll** - Intelligent scrolling that respects user interaction
- **Multi-agent Support** - Manage multiple agents simultaneously
- **Offline-first** - Graceful degradation when server is unavailable

### 💡 User Experience

- **Clean, Intuitive Interface** - Chat-style UI familiar to everyone
- **Dark/Light Compatible** - Carefully designed color palette
- **Responsive** - Smooth animations and transitions
- **Native Performance** - Built with React Native for optimal mobile experience
- **Cross-platform** - Works on both iOS and Android

### 🔧 Technical Features

- **Duplicate Message Prevention** - Robust deduplication system
- **UUID-based Message Tracking** - Reliable message identification
- **Streaming Message Updates** - Real-time content updates as agents respond
- **Connection Recovery** - Automatic reconnection with exponential backoff
- **Comprehensive Logging** - Detailed console logging for debugging

## 📸 Screenshots

<div align="center">

| Agent List | Chat Interface | Markdown Rendering |
|:----------:|:--------------:|:------------------:|
| ![Agent List](docs/screenshots/agent-list.png) | ![Chat](docs/screenshots/chat-screen.png) | ![Markdown](docs/screenshots/markdown.png) |
| View all your agents at a glance | Interactive chat interface | Rich markdown support |

</div>

> *Note: Add your own screenshots in the `docs/screenshots/` directory*

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Mobile App (Expo)               │
│  ┌───────────────────────────────────┐  │
│  │   UI Layer (React Native)         │  │
│  │  - Chat Screen                    │  │
│  │  - Agent List                     │  │
│  │  - Settings                       │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │   State Management                │  │
│  │  - AppContext (React Context)    │  │
│  │  - useAgents Hook                │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │   Network Layer                   │  │
│  │  - WebSocket Client               │  │
│  │  - REST API Client                │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼───────────────────────┘
                   │
                   │ WebSocket + HTTP
                   │
┌──────────────────▼───────────────────────┐
│       Tide Commander Server              │
│  - Agent Orchestration                   │
│  - Session Management                    │
│  - Real-time Events                      │
└──────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend Framework
- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform for universal React applications
- **TypeScript** - Type-safe JavaScript

### Navigation & UI
- **React Navigation** - Navigation library with stack navigator
- **React Native Gesture Handler** - Native gesture handling
- **React Native Markdown Display** - Markdown rendering with syntax highlighting

### State & Data
- **React Context API** - Global state management
- **AsyncStorage** - Persistent local storage
- **Axios** - HTTP client for REST API calls

### Real-time Communication
- **Native WebSocket** - Direct WebSocket implementation
- **Custom WebSocketClient** - Wrapper with reconnection logic

### Utilities
- **date-fns** - Modern date utility library
- **expo-clipboard** - Native clipboard access

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Expo Go app** (for testing on physical device) or **Android Studio/Xcode** (for emulators)
- **Tide Commander Server** running (see [Tide Commander](https://github.com/deivid11/tide-commander))

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/iamfisho/tide-commander-light-chat.git
cd tide-commander-light-chat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm start
```

This will start the Expo development server. You'll see a QR code in the terminal.

### 4. Run on Your Device

**Option A: Physical Device**
1. Install [Expo Go](https://expo.dev/client) on your iOS or Android device
2. Scan the QR code with your camera (iOS) or Expo Go app (Android)

**Option B: Emulator**
- Press `a` for Android emulator
- Press `i` for iOS simulator (macOS only)

## ⚙️ Configuration

### Server Connection

1. Open the app and navigate to **Settings**
2. Enter your Tide Commander server details:
   - **Server URL**: `http://YOUR_SERVER_IP:3000` (or your server address)
   - **Auth Token**: Your authentication token (if enabled on server)
3. Tap **Save** to connect

### Example Configuration

```typescript
{
  serverUrl: "http://192.168.1.100:3000",
  authToken: "your-auth-token-here" // optional
}
```

## 📱 Usage

### Viewing Agents

The main screen displays all your active agents with:
- Agent name and working directory
- Current status (idle, busy, error)
- Agent class icon
- Last activity timestamp

Tap any agent to open the chat interface.

### Chatting with Agents

1. **Send Commands**: Type your command in the input field and press send
2. **View Responses**: Agent responses appear in real-time with markdown formatting
3. **Copy Content**:
   - Long-press any message to select specific text
   - Tap the copy button to copy the entire message
4. **Refresh History**: Pull down to refresh or tap the refresh icon

### Message Features

- **Markdown Rendering**: Code blocks, headings, lists, and more
- **Syntax Highlighting**: Code blocks with language-specific highlighting
- **Selectable Text**: Long-press to select and copy portions of messages
- **Tool Badges**: Visual indicators when agents use tools
- **Streaming Updates**: See responses as they're generated

## 🔍 Key Components

### Agent List Screen
- Displays all available agents
- Real-time status updates
- Quick navigation to chat

### Chat Screen
- Full conversation history
- Markdown-rendered messages
- Smart auto-scroll
- Message selection and copying
- Tool usage indicators

### Settings Screen
- Server configuration
- Connection status
- Authentication setup

## 🏗️ Project Structure

```
tide-commander-light-chat/
├── src/
│   ├── api/                  # API clients
│   │   ├── client.ts         # REST API client
│   │   └── websocket.ts      # WebSocket client
│   ├── components/           # Reusable components
│   │   ├── MessageBubble.tsx # Chat message component
│   │   └── StatusBadge.tsx   # Status indicator
│   ├── contexts/             # React contexts
│   │   └── AppContext.tsx    # Global state
│   ├── hooks/                # Custom hooks
│   │   └── useAgents.ts      # Agent management logic
│   ├── screens/              # Screen components
│   │   ├── AgentListScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── types/                # TypeScript definitions
│   │   └── index.ts
│   └── utils/                # Utility functions
│       ├── colors.ts
│       └── date.ts
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🗺️ Roadmap

- [ ] **v0.2.0**
  - Push notifications for agent events
  - Agent creation from mobile
  - Dark mode toggle

- [ ] **v0.3.0**
  - Message search functionality
  - Export conversation history
  - Multi-server support

- [ ] **v0.4.0**
  - Voice commands
  - Agent performance metrics
  - Custom themes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for [Tide Commander](https://github.com/deivid11/tide-commander) by Anthropic
- Inspired by modern mobile chat interfaces
- Community feedback and contributions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/iamfisho/tide-commander-light-chat/issues)
- **Documentation**: [Wiki](https://github.com/iamfisho/tide-commander-light-chat/wiki)

---

<div align="center">

Made with ❤️ for the Tide Commander community

**[⬆ back to top](#-tide-commander-light-chat)**

</div>
