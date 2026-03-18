# NBOTION

The ultimate all-in-one desktop application for macOS and universal desktops. Secure, private, and fully integrated.

## Features

- **Encrypted Storage** - AES-256-GCM encryption with PBKDF2 key derivation (100,000 iterations, SHA-512). All data stays private and proprietary.
- **Workspace** - Notion-like pages with rich text editing (TipTap), databases, blocks, and full document management.
- **Messaging** - Slack-style channels, direct messages, threads, reactions, and real-time chat.
- **Project Management** - Linear/Jira-style boards with Kanban view, list view, issues, priorities, labels, and sprints.
- **Planner & Goals** - Timeline planning from 1-month to 10-year horizons. Milestones, goal tracking, and progress visualization.
- **Calendar** - Monthly calendar with events, US holidays, reminders, and alarms.
- **Health Dashboard** - Whoop integration, sleep/HRV/recovery/strain tracking, and data visualization with Recharts.
- **Integrations** - Connect Telegram, Discord, GitHub, Slack, Google Calendar, and more.
- **AI Agents** - Local AI agent framework using Qwen 2.5 3B/7B (quantized). Build custom agents with full app access, GitHub integration, DOM access, and automated PR creation.
- **Dark/Light Theme** - Beautiful dark mode by default with light mode toggle.
- **Lock Screen** - Password-protected lock screen for additional security.

## Tech Stack

- **Framework**: Electron + React 18 + TypeScript
- **Build**: Vite 5
- **Styling**: Tailwind CSS + Radix UI primitives
- **State**: Zustand
- **Editor**: TipTap (rich text with extensions)
- **Charts**: Recharts
- **Encryption**: Web Crypto API (AES-256-GCM)

## Local Setup on macOS

### Prerequisites

1. **Node.js** (v18 or later)
   ```bash
   # Install via Homebrew
   brew install node
   
   # Or use nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   nvm install 18
   nvm use 18
   ```

2. **Git**
   ```bash
   # Usually pre-installed on macOS, otherwise:
   brew install git
   ```

3. **Xcode Command Line Tools** (required for native Electron builds)
   ```bash
   xcode-select --install
   ```

### Installation

```bash
# Clone the repository
git clone https://github.com/msp40445-bot/NBOTION.git
cd NBOTION

# Install dependencies
npm install
```

### Running the App

#### Web Development Mode (Browser)
```bash
# Start the Vite dev server (opens in browser)
npm run dev
```
This starts the app at `http://localhost:5173` in your browser. Great for rapid UI development.

#### Electron Desktop Mode
```bash
# Build the frontend first
npm run build

# Start the Electron app
npm run electron:dev
```

#### Production Build
```bash
# Build for macOS
npm run electron:build

# The built .dmg / .app will be in the dist/ folder
```

### Project Structure

```
NBOTION/
├── electron/              # Electron main process
│   ├── main.ts           # Main process entry (window, IPC, storage)
│   └── preload.ts        # Preload script (secure bridge)
├── src/
│   ├── components/       # React components
│   │   ├── ai/           # AI agent builder & chat
│   │   ├── calendar/     # Calendar, events, reminders
│   │   ├── health/       # Health dashboard, Whoop
│   │   ├── integrations/ # Integration hub
│   │   ├── layout/       # Sidebar, TopBar, LockScreen
│   │   ├── messaging/    # Chat channels, messages
│   │   ├── planner/      # Goals, milestones, timelines
│   │   ├── projects/     # Kanban boards, issues
│   │   └── workspace/    # Pages, editor, databases
│   ├── lib/              # Core libraries
│   │   ├── encryption.ts # AES-256-GCM encryption
│   │   ├── storage.ts    # Encrypted storage layer
│   │   └── utils.ts      # Utility functions
│   ├── stores/           # Zustand state stores
│   │   ├── aiStore.ts
│   │   ├── appStore.ts
│   │   ├── calendarStore.ts
│   │   ├── healthStore.ts
│   │   ├── messagingStore.ts
│   │   ├── plannerStore.ts
│   │   ├── projectStore.ts
│   │   └── workspaceStore.ts
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   ├── index.css         # Global styles + Tailwind
│   └── main.tsx          # React entry point
├── index.html            # HTML entry point
├── package.json          # Dependencies & scripts
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript config
├── tsconfig.electron.json# Electron TypeScript config
└── vite.config.ts        # Vite build config
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd + B` | Bold text (in editor) |
| `Cmd + I` | Italic text (in editor) |
| `Cmd + U` | Underline text (in editor) |
| `Cmd + Shift + X` | Strikethrough (in editor) |
| `Cmd + E` | Inline code (in editor) |

### Building for Other Platforms

```bash
# Build for macOS (default)
npm run electron:build

# The electron-builder config in package.json supports:
# - macOS: .dmg, .app
# - Windows: .exe, NSIS installer
# - Linux: .AppImage, .deb
```

### Environment & Configuration

- **Theme**: Toggle between dark/light mode from the top bar
- **Encryption**: Set a password via Settings to encrypt all stored data
- **Lock Screen**: Lock the app with your encryption password for security
- **AI Models**: Agents use local Qwen 2.5 models (3B for speed, 7B Q4 for quality)

### Troubleshooting

**App won't start?**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Electron build fails on macOS?**
```bash
# Make sure Xcode CLI tools are installed
xcode-select --install

# If you get code signing errors, you can skip signing for dev:
CSC_IDENTITY_AUTO_DISCOVERY=false npm run electron:build
```

**Port 5173 already in use?**
```bash
# Kill the process using the port
lsof -ti:5173 | xargs kill -9
npm run dev
```

## License

Private & Proprietary. All rights reserved.
