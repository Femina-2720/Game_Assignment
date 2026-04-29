# Just Divide 🐱➗

![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge) ![Engine](https://img.shields.io/badge/Engine-Phaser_3.60-blue?style=for-the-badge) ![Language](https://img.shields.io/badge/Language-JavaScript_(ES6)-yellow?style=for-the-badge) ![Deployment](https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge)

> **🎮 Play the Live Game:** [Just Divide on Vercel](https://femina-assignment-azure.vercel.app/)

---

## 🎨 Project Overview

**Just Divide** is an interactive, logic-based puzzle game built entirely from scratch using the **Phaser 3** framework. Designed to make mathematics visually engaging, the game challenges players to strategically place numbered tiles on a 4x4 grid to clear the board through division and matching. 

It combines the addictive nature of grid-based puzzle games (like 2048 or Threes) with educational mechanics, requiring players to think critically about factors, multiples, and spatial arrangement.

## ✨ Core Gameplay Mechanics

*   **Smart Merging:** 
    *   *Equality:* Placing two identical numbers next to each other causes them to vanish, clearing space on the board.
    *   *Division:* Placing a larger number next to a smaller factor (e.g., 10 next to 2) divides the larger number, combining them into a new tile (5).
*   **The Keep Slot:** A strategic holding area where players can stash a tile for later use, allowing for advanced planning and combo setups.
*   **Dynamic Queue:** A preview system that shows the current active tile and the upcoming tile so players can strategize their next moves.
*   **Trash System:** A limited resource (starting at 10) that allows players to discard unwanted tiles to save their grid from filling up.
*   **Progressive Difficulty:** As the player's score increases, the level advances, introducing a wider pool of numbers and granting bonus trash uses.

## 🛠 Engineering & Architecture

Building this game required solving several complex state management and rendering challenges native to HTML5 Canvas game development.

### 1. Component-Based Container Architecture
To maintain a clean and scalable codebase, the game UI is built using **Phaser Containers**. Elements like the grid, the sidebar, and the tile sprites are grouped logically. This allows entire sections of the game to be animated, scaled, or repositioned as single units during gameplay or resize events, drastically reducing the overhead of calculating `x/y` coordinates for individual sprites every frame.

### 2. Global vs. Local Coordinate Resolution
A significant technical hurdle in Phaser is handling Drag-and-Drop DropZones inside Containers. While DropZones require **World (Global) Coordinates**, objects inside a Container operate on **Local Coordinates**. 
*   **The Solution:** I implemented a custom transformation logic to accurately calculate the exact Global World Space bounds of the local zones in real-time. This ensures that the drag-and-drop experience remains highly responsive and buttery smooth, regardless of the screen scale.

### 3. Asynchronous Animation Queues
When tiles merge, the game relies on a Promise-based animation system (`async/await` wrapping Phaser Tweens). This ensures that grid state updates, score calculations, and new tile spawns are perfectly synchronized with the visual vanishing/combining animations, preventing game-breaking race conditions.

## 📂 Project Structure

```text
femina-2720-game_development/
├── index.html             # Entry point
├── style.css              # Base styling and font imports
├── game.js                # Phaser configuration and initialization
├── assets/                # Game sprites, backgrounds, and UI elements
└── scenes/
    ├── BootScene.js       # Asset preloading and loading screen
    ├── GameScene.js       # Core gameplay loop, physics, and input handling
    ├── PauseScene.js      # Overlay scene for pausing the game state
    └── UIScene.js         # Heads-Up Display (HUD) and event listening
```

## 💻 Local Setup & Development

If you want to run the game locally to explore the code:

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd femina-2720-game_development
```

### 2. Serve the files
Because Phaser relies on XHR requests to load assets (images, audio), you cannot simply double-click the `index.html` file. You must serve it over a local web server.

If you have Node.js installed, you can use `serve`:
```bash
npx serve .
```
Alternatively, if you use Python:
```bash
python3 -m http.server 8000
```

### 3. Play
Open your browser and navigate to `http://localhost:3000` (or whichever port your local server provides).

## 🚀 Tech Stack

*   **Core Engine:** Phaser 3.60
*   **Language:** JavaScript (ES6+)
*   **Web Technologies:** HTML5 Canvas, CSS3
*   **Deployment:** Vercel

---
*Designed and Engineered by Femina.*
