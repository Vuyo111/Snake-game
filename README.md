# Snake Game

A classic, browser-based Snake game built with JavaScript, HTML, and CSS.

##  Live Demo

Try the game here:  
**https://vuyo111.github.io/Snake-game/**

##  Overview

Play the timeless Snake game where you control a continuously growing snake. Your goal? Navigate the playing field, eat food to grow longer, and avoid running into the walls or yourself. Simple in concept, endlessly addictive in practice!

##  Features

- One game mode: **Classic Snake**
- Movement via **Arrow Keys** 
- **Score display** updates in real time
- **Game Over** when the snake collides with itself or the boundary
- Optionally:
  - Toggle borders on
  - Adjustable speed levels 

##  How to Play

1. Open the game in your browser.
2. Use **Arrow Keys (← ↑ → ↓)** to direct the snake.
3. Eat the food that appears to increase your score and length.
4. Keep going—don’t run into the walls or your own tail.
5. Game ends upon collision—then try again to beat your score!

##  Installation (Optional – for local play or development)

1. Clone the repo:
   ```bash
   git clone https://github.com/vuyo111/Snake-game.git
   
   2. Navigate to the project folder:
cd Snake-game

Open index.html in your browser:
Double-click the file, or
Run a local server (e.g., python -m http.server), then visit http://localhost:8000

Technologies
HTML: Structure of the interface (canvas, score, messages)
CSS: Styling for game visuals and layout
JavaScript: Game loop, controls, logic, collision detection, scoring

Customization Ideas
Want to enhance the game? Consider adding:
Speed selection before starting
Border toggle to switch between wall and no-wall modes
Pause / Resume functionality (e.g., press P or ESC)
High score tracking using browser 

localStorage
Mobile support with touch controls or on-screen buttons

Troubleshooting
Game won’t load or the canvas is blank: Ensure your browser supports HTML5.
Controls not working: Click on the window or canvas to focus before using arrow keys.
Score doesn’t increment: Check the console for JavaScript errors (F12 to open developer tools).

License
This project is open-source and available under the MIT License. Feel free to fork, modify, and share!
