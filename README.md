# Just Divide - Kid Mode 🐱➗

![Status](https://img.shields.io/badge/Status-Completed-success) ![Engine](https://img.shields.io/badge/Engine-Phaser_3.60-blue) ![Deployment](https://img.shields.io/badge/Deployment-Vercel-black)

> **Play the Live Demo:** [https://femina-assignment-azure.vercel.app/](https://femina-assignment-azure.vercel.app/)

---

### 📝 Note to the Reviewer
**Context:** I am submitting this assignment during my active semester exams. Additionally, due to severe network instability in my area over the last 24 hours, I faced significant challenges downloading heavy assets (specifically the device-specific background variations) and sourcing exact fonts.

**My Focus:** Given these constraints, I prioritized **Core Engineering** over pixel-perfect asset integration. I focused my efforts on:
1.  **Robust Game Logic:** Ensuring the math and merge rules are bug-free.
2.  **Responsive Architecture:** Writing a custom layout engine rather than relying on simple scaling.
3.  **Complex Math:** Solving the "World vs. Local" coordinate problems inherent in Phaser Containers.

---

## 🎨 Project Overview

This project is a faithful recreation of the **"Just Divide - Kid Mode"** design specification. It acts as an interactive educational puzzle to help children understand factors and division.

**Compliance with Requirements:**
* ✅ **Framework:** Built entirely in **Phaser 3** (Vanilla JS) with no external libraries.
* ✅ **Responsive Design:** Custom layout engine adapts to 1440x1024 (Desktop) and Mobile Portrait.
* ✅ **Visual Hierarchy:** Implemented the "Cat Header," "Turquoise Grid," and "Orange Action Panel."
* ✅ **Gameplay:** Full implementation of Merge Rules (Equal/Divisible), Queue, Keep Slot, and Trash mechanics.

---

## 🛠 Technical Deep Dive

To ensure this project was not just "functional" but also "architecturally sound," I made specific engineering decisions:

### 1. Custom Responsive Engine (`Phaser.Scale.RESIZE`)
Instead of using a basic `FIT` scale mode which leaves black bars, I utilized `RESIZE`. I wrote a custom `handleResize()` observer that detects the device aspect ratio:
* **Landscape Mode:** The traditional layout with the Board on the left and Action Panel on the right.
* **Portrait Mode:** A vertical stack layout where the Board sits at the top and the Action Panel anchors to the bottom for thumb accessibility.

### 2. Component-Based Architecture
To maintain a clean folder structure, I utilized **Phaser Containers** to group logical components (`boardContainer`, `sidebarContainer`).
* **The Benefit:** This allows the entire game board to be animated, scaled, or repositioned as a single unit during resize events, rather than recalculating `x/y` coordinates for 16 individual tiles every frame.

### 3. The "Container Coordinate" Solution (Key Challenge)
A significant technical hurdle in Phaser is that Drop Zones require **World Coordinates**, but objects inside a Container use **Local Coordinates**.
* **The Problem:** When the board is scaled down to `0.6x` for mobile, the visual position of a tile no longer matches the logic position of the drop zone.
* **The Solution:** I implemented a matrix transformation helper (`updateZoneCoordinates`). This calculates the exact Global World Space bounds of the local zones in real-time. This ensures the drag-and-drop experience is buttery smooth on any screen size.

---

## ⚠️ Known Limitations & Trade-offs

Due to the strict time and network constraints mentioned above, the following trade-offs were made:

1.  **Background Asset Optimization:** The game currently utilizes a single scalable background asset. While the code logic exists to swap between `Desktop`, `Tablet`, and `Mobile` specific background textures, I was unable to retrieve the high-resolution variations due to network failures. I opted for a unified "Cover" scaling strategy to ensure no black bars appear.
2.  **Asset Fidelity:** Code-generated graphics (Phaser Graphics) were used for buttons and panels to approximate the design, rather than using the specific heavy PNG assets.

---

## 🚀 Future Roadmap

With full connectivity and post-exam availability, I would immediately implement:

1.  **Asset Integration:** Fully integrating the device-specific background images and high-fidelity UI sprites.
2.  **Juice:** Adding particle effects (confetti) on successful merges.
3.  **Audio:** Implementing SFX for tile placement and background music.
4.  **Undo System:** Implementing the `Z` key History Stack to allow move reversals.

---

## 📦 Tech Stack

* **Core Engine:** Phaser 3.60
* **Language:** JavaScript (ES6)
* **Build/Deploy:** Vercel
