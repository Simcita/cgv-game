// Level 1 Adventure-themed Pause Menu
export function createLevel1PauseMenu({ isEnabled, onResume, onRestart } = {}) {
  let isPaused = false;
  let pauseOverlay = null;
  const canActivate = typeof isEnabled === 'function' ? isEnabled : () => true;

  function createPauseOverlay() {
    if (pauseOverlay) return pauseOverlay;

    pauseOverlay = document.createElement("div");
    pauseOverlay.id = "level1-pause-overlay";
    pauseOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.3s ease-in-out;
    `;

    const pauseContainer = document.createElement("div");
    pauseContainer.style.cssText = `
      background: linear-gradient(145deg, #f5f5dc 0%, #f0e68c 100%);
      border: 4px solid #8b6914;
      border-radius: 20px;
      padding: 40px 50px;
      box-shadow: 
        0 20px 60px rgba(0,0,0,0.4),
        inset 0 0 20px rgba(255,255,255,0.3),
        0 0 0 4px #d4af37;
      text-align: center;
      max-width: 500px;
      position: relative;
      font-family: 'Arial', sans-serif;
    `;

    // Compass decoration
    const compassDecoration = document.createElement("div");
    compassDecoration.style.cssText = `
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 80px;
      border: 6px solid #d4af37;
      border-radius: 50%;
      background: linear-gradient(135deg, #f5f5dc 0%, #f0e68c 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;

    const compassNeedle = document.createElement("div");
    compassNeedle.style.cssText = `
      width: 3px;
      height: 30px;
      background: #c0392b;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      border-radius: 2px;
    `;
    compassDecoration.appendChild(compassNeedle);

    // Decorative corners
    const cornerStyle = `
      position: absolute;
      width: 40px;
      height: 40px;
      border: 3px solid #d4af37;
      border-radius: 5px;
      background: rgba(212, 175, 55, 0.3);
    `;

    const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    corners.forEach(pos => {
      const corner = document.createElement("div");
      corner.style.cssText = cornerStyle;
      if (pos.includes('top')) corner.style.top = '-5px';
      if (pos.includes('bottom')) corner.style.bottom = '-5px';
      if (pos.includes('left')) {
        corner.style.left = '-5px';
        corner.style.borderRight = 'none';
      }
      if (pos.includes('right')) {
        corner.style.right = '-5px';
        corner.style.borderLeft = 'none';
      }
      if (pos.includes('top')) corner.style.borderBottom = 'none';
      if (pos.includes('bottom')) corner.style.borderTop = 'none';
      pauseContainer.appendChild(corner);
    });

    pauseContainer.appendChild(compassDecoration);

    // Title
    const title = document.createElement("h2");
    title.style.cssText = `
      color: #8b6914;
      font-size: 42px;
      margin: 30px 0 10px 0;
      text-shadow: 3px 3px 0px #654321, 5px 5px 10px rgba(0,0,0,0.3);
      letter-spacing: 4px;
      font-weight: bold;
    `;
    title.textContent = "⏸ PAUSED ⏸";

    // Subtitle
    const subtitle = document.createElement("p");
    subtitle.style.cssText = `
      color: #654321;
      font-size: 18px;
      margin-bottom: 30px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    `;
    subtitle.textContent = "Press 'O' to Resume";

    // Controls info
    const controlsInfo = document.createElement("div");
    controlsInfo.style.cssText = `
      background: rgba(255, 255, 255, 0.6);
      border: 2px dashed #8b6914;
      border-radius: 10px;
      padding: 20px;
      margin: 25px 0;
      text-align: left;
    `;

    const controlsTitle = document.createElement("h3");
    controlsTitle.style.cssText = `
      color: #8b6914;
      margin: 0 0 15px 0;
      font-size: 20px;
    `;
    controlsTitle.textContent = "🎮 Adventure Controls";

    const controlsList = document.createElement("div");
    controlsList.innerHTML = `
      <p style="color: #654321; margin: 8px 0; font-size: 16px;">WASD - Move</p>
      <p style="color: #654321; margin: 8px 0; font-size: 16px;">Mouse Drag - Rotate Camera</p>
      <p style="color: #654321; margin: 8px 0; font-size: 16px;">Mouse Wheel - Zoom</p>
      <p style="color: #654321; margin: 8px 0; font-size: 16px;">Space - Jump</p>
      <p style="color: #654321; margin: 8px 0; font-size: 16px;">E - Enter Portal</p>
      <p style="color: #654321; margin: 8px 0; font-size: 16px;">O - Pause/Resume</p>
    `;

    controlsInfo.appendChild(controlsTitle);
    controlsInfo.appendChild(controlsList);

    // Buttons
    const buttonContainer = document.createElement("div");

    const resumeBtn = document.createElement("button");
    resumeBtn.textContent = "▶ Resume";
    resumeBtn.style.cssText = `
      padding: 15px 35px;
      margin: 10px;
      border: none;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      text-transform: uppercase;
      letter-spacing: 2px;
      background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
      color: white;
      border: 3px solid #1e8449;
    `;
    resumeBtn.onmouseover = () => {
      resumeBtn.style.background = "linear-gradient(135deg, #229954 0%, #27ae60 100%)";
      resumeBtn.style.transform = "translateY(-2px)";
    };
    resumeBtn.onmouseout = () => {
      resumeBtn.style.background = "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)";
      resumeBtn.style.transform = "translateY(0)";
    };
    resumeBtn.onclick = () => togglePause();

    const restartBtn = document.createElement("button");
    restartBtn.textContent = "↻ Restart";
    restartBtn.style.cssText = `
      padding: 15px 35px;
      margin: 10px;
      border: none;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      text-transform: uppercase;
      letter-spacing: 2px;
      background: linear-gradient(135deg, #3498db 0%, #5dade2 100%);
      color: white;
      border: 3px solid #2874a6;
    `;
    restartBtn.onmouseover = () => {
      restartBtn.style.background = "linear-gradient(135deg, #2980b9 0%, #3498db 100%)";
      restartBtn.style.transform = "translateY(-2px)";
    };
    restartBtn.onmouseout = () => {
      restartBtn.style.background = "linear-gradient(135deg, #3498db 0%, #5dade2 100%)";
      restartBtn.style.transform = "translateY(0)";
    };
    restartBtn.onclick = () => {
      if (onRestart) onRestart();
      togglePause();
    };

    buttonContainer.appendChild(resumeBtn);
    buttonContainer.appendChild(restartBtn);

    pauseContainer.appendChild(title);
    pauseContainer.appendChild(subtitle);
    pauseContainer.appendChild(controlsInfo);
    pauseContainer.appendChild(buttonContainer);

    pauseOverlay.appendChild(pauseContainer);

    // Add CSS animation
    if (!document.getElementById('pause-menu-style')) {
      const style = document.createElement('style');
      style.id = 'pause-menu-style';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(pauseOverlay);
    return pauseOverlay;
  }

  function togglePause() {
    if (!canActivate()) return;
    
    isPaused = !isPaused;
    const overlay = createPauseOverlay();

    if (isPaused) {
      overlay.style.display = "flex";
      if (onResume) onResume(true);
    } else {
      overlay.style.display = "none";
      if (onResume) onResume(false);
    }
  }

  // Key listener for 'O' key
  function handleKeyPress(event) {
    if (event.key.toLowerCase() === "o") {
      togglePause();
    }
  }

  window.addEventListener("keydown", handleKeyPress);

  return {
    toggle: togglePause,
    isPaused: () => isPaused,
    show: () => { if (!isPaused) togglePause(); },
    hide: () => { if (isPaused) togglePause(); },
    destroy: () => {
      window.removeEventListener("keydown", handleKeyPress);
      if (pauseOverlay && pauseOverlay.parentNode) {
        pauseOverlay.parentNode.removeChild(pauseOverlay);
      }
      pauseOverlay = null;
    }
  };
}

