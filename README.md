
# EdTech Fun Game (React + Capacitor Mobile App)

Welcome to EdTech Fun Game! This application is an educational game designed for kids, featuring Multiple Choice Quizzes (MCQ) and Reading Aloud practice with audio recording and evaluation (via API). It's built with React, TypeScript, Tailwind CSS, shadcn/ui, and packaged for mobile using Capacitor.

## Features

*   Interactive Main Menu
*   Multiple Choice Question (MCQ) Module
*   Audio Recording for Reading Aloud Practice (converts to WAV)
*   (Planned) API integration for evaluating reading and MCQ answers
*   Consistent background image across all screens
*   Mobile-ready using Capacitor for Android (and potentially iOS)

## Tech Stack

*   **Frontend:**
    *   React
    *   TypeScript
    *   Vite (Build Tool)
    *   Tailwind CSS (Styling)
    *   shadcn/ui (UI Components)
*   **Mobile Packaging:**
    *   Capacitor
*   **Audio Processing:**
    *   `MediaRecorder` API
    *   `audiobuffer-to-wav` (for WAV conversion)
*   **(Planned) Backend/API:** (Details to be added by the backend team)

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js and npm (or yarn):** [Download Node.js](https://nodejs.org/) (npm is included)
*   **Git:** [Download Git](https://git-scm.com/)
*   **A code editor:** We recommend [VS Code](https://code.visualstudio.com/)
*   **For Android Development:**
    *   **Android Studio:** [Download Android Studio](https://developer.android.com/studio)
    *   Android SDK (Installable via Android Studio's SDK Manager)
*   **For iOS Development (Requires macOS):**
    *   **Xcode:** Download from the Mac App Store
    *   **CocoaPods:** Run `sudo gem install cocoapods`

## Getting Started

Follow these steps to get the project up and running on your local machine.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd edtech-game # Or your project's directory name
```

### 2. Install Dependencies

Install the project's web dependencies:

```bash
npm install
# or
# yarn install
```

### 3. Setup Environment Variables (If Any)

If your project requires environment variables (e.g., API keys, backend URLs), create a `.env` file in the root of the project:

```env
# .env
VITE_API_BASE_URL=your_api_base_url_here
# Add other environment variables as needed
```
*(Currently, this project uses mock APIs, so this step might not be immediately necessary but is good practice for future API integration.)*

### 4. Running the Web App (for Development)

To run the application in your browser for development:

```bash
npm run dev
# or
# yarn dev
```
This will typically start a development server on `http://localhost:5173` (or another port).

## Building and Running as a Mobile App (Using Capacitor)

### 1. Install Capacitor CLI and Core (if not already done by cloning)

If you cloned a fresh repository that didn't have these, you might need:
```bash
npm install @capacitor/core @capacitor/cli
```

### 2. Initialize Capacitor (if not already done)

If the project doesn't have a `capacitor.config.ts` file, you might need to initialize Capacitor:
```bash
npx cap init
```
Follow the prompts for App Name and App ID. Ensure the `webDir` in `capacitor.config.ts` is set to `"dist"` (for Vite).

### 3. Add Native Platforms

*   **For Android:**
    ```bash
    npm install @capacitor/android
    npx cap add android
    ```
*   **For iOS (on macOS):**
    ```bash
    npm install @capacitor/ios
    npx cap add ios
    ```

### 4. Build the Web App

Create a production build of your React application:

```bash
npm run build
```

### 5. Sync Web Assets with Native Projects

Copy the web build to your native projects:

```bash
npx cap sync
```
*(Run this command every time you make changes to the web app and want to update the native version.)*

### 6. Configure Native Project Permissions

**Crucial for Microphone Access!**

*   **Android (`android/app/src/main/AndroidManifest.xml`):**
    Ensure the following permission is present:
    ```xml
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" /> <!-- If your app needs internet -->
    ```
*   **iOS (`ios/App/App/Info.plist`):**
    Add the `NSMicrophoneUsageDescription` key with a reason:
    ```xml
    <key>NSMicrophoneUsageDescription</key>
    <string>This app needs microphone access to record your reading for practice and evaluation.</string>
    ```

### 7. Open and Run in Native IDEs

*   **For Android:**
    1. Open the Android project in Android Studio:
       ```bash
       npx cap open android
       ```
    2. Wait for Gradle to sync.
    3. Ensure you have an Android SDK platform installed via Android Studio's SDK Manager (File > Settings > System Settings > Android SDK). If Android Studio reports "Unable to continue until an Android SDK is specified," set the correct SDK path there.
    4. Select an emulator or connect a physical device.
    5. Click the "Run" button.
    6. **Grant microphone permission** when the app prompts you.

*   **For iOS (on macOS):**
    1. Open the iOS project in Xcode:
       ```bash
       npx cap open ios
       ```
    2. Select a simulator or connect a physical device.
    3. Configure signing with your Apple Developer account if running on a physical device.
    4. Click the "Play" (Run) button.
    5. **Grant microphone permission** when the app prompts you.

### Live Reload on Device (Optional, for faster development iteration)

1.  Start your web development server: `npm run dev`.
2.  Find your computer's local IP address (e.g., `192.168.1.100`).
3.  Update `capacitor.config.ts`:
    ```typescript
    // capacitor.config.ts
    // ...
    server: {
      url: 'http://YOUR_COMPUTER_IP:YOUR_DEV_SERVER_PORT', // e.g., 'http://192.168.1.100:5173'
      cleartext: true // For Android if using http
    }
    // ...
    ```
4.  Run `npx cap sync`.
5.  Run the app from Android Studio or Xcode. Changes in your web code should now reflect live in the mobile app.
    *Remember to remove or comment out the `server` config for production builds.*

## Project Structure

```
.
├── public/                 # Static assets (images, fonts, etc.)
├── src/
│   ├── App.tsx             # Main application component, routing logic
│   ├── components/         # Reusable UI components (AudioRecorder, shadcn/ui)
│   ├── screens/            # Top-level screen components (MainMenu, MCQ, Audio)
│   ├── services/           # API interaction logic (currently mock)
│   ├── styles/             # Global CSS, Tailwind base
│   ├── interface/          # TypeScript interfaces for API requests/responses
│   ├── lib/                # Utility functions
│   └── main.tsx            # Application entry point
├── android/                # Native Android project (generated by Capacitor)
├── ios/                    # Native iOS project (generated by Capacitor)
├── capacitor.config.ts     # Capacitor configuration
├── package.json            # Project dependencies and scripts
└── ...                     # Other config files (vite, tsconfig, etc.)
```

## Available Scripts

In the project directory, you can run:

*   `npm run dev`: Runs the app in development mode (web).
*   `npm run build`: Builds the app for production (web).
*   `npm run lint`: Lints the code (if ESLint is configured).
*   `npm run preview`: Serves the production build locally (web).

## Contributing

(Add guidelines for contributing if this is a collaborative project.)

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

(Specify your project's license, e.g., MIT, Apache 2.0, or proprietary.)

---

This README provides a comprehensive guide for setting up and running your project.
```

**Key things to customize in this README:**

*   **`<your-repository-url>`:** Replace with the actual URL of your Git repository.
*   **Project Name:** If "EdTech Fun Game" isn't the final name, update it.
*   **App ID in Capacitor Config:** Remind users to check/set their unique App ID.
*   **API Details:** Once you have a real backend, add information about its setup or how to connect to it.
*   **Environment Variables:** If you add more, document them.
*   **Contributing and License:** Fill these sections out appropriately.
*   **Specifics of `shadcn/ui` installation:** While `npm install` handles dependencies, users might need to run `npx shadcn-ui@latest add <component>` if they want to modify or add new shadcn components directly. You could mention this if relevant.

This README should give anyone (including your future self) a good starting point to get the project running.
