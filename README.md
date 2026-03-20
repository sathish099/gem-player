# Gem Player - Chess AI Agent

An Expo-based chess assistant that uses your camera to analyze a physical chess board and suggests the best moves using AI (Gemini/OpenRouter).

## Features
- **Camera Board Recognition**: Align the physical board with the on-screen grid to scan the state.
- **AI Move Suggestions**: Powered by Gemini Pro via OpenRouter.
- **Live Mode**: Periodic state updates for continuous play.
- **Visual Overlays**: Move arrows drawn directly over the camera feed.

## Setup
1.  **API Key**: Create a file named `.env` in the root directory (or use the one I created) and add your key:
    ```env
    EXPO_PUBLIC_OPENROUTER_API_KEY=your_actual_key_here
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run the App**:
    ```bash
    npx expo start
    ```

## How to Play
1.  Open the app and grant camera permissions.
2.  Align your physical chess board so it fits within the white grid on the screen.
3.  Tap **Scan** to detect the current board state.
4.  Tap **AI Move** to get a suggestion from the AI.
5.  An arrow will appear on the screen showing you the best move.
6.  Perform the move on the physical board, then scan again (or use **Live** mode).

## Tech Stack
- **React Native / Expo**
- **chess.js**: Move validation and state management.
- **TensorFlow.js**: Foundation for on-device board vision.
- **OpenRouter API**: Cloud-based Grandmaster-level AI.
- **Lucide React Native**: Beautiful iconography.
