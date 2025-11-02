// Level 3 Clock-themed Pause Menu
export function createLevel3PauseMenu({ isEnabled, onResume, onRestart } = {}) {
  let isPaused = false;
  let pauseOverlay = null;
  const canActivate = typeof isEnabled === 'function' ? isEnabled : () => true;

  function createPauseOverlay() {
    if (pauseOverlay) return pauseOverlay;

    pauseOverlay = document.createElement("div");
    pauseOverlay.id = "level3-pause-overlay";
    pauseOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(6px);
      animation: fadeIn 0.3s ease-in-out;
    `;

    const pauseContainer = document.createElement("div");
    pauseContainer.style.cssText = `
      background: linear-gradient(145deg, #8b7355 0%, #6b5d4f 100%);
      border: 6px solid #d4af37;
      border-radius: 50%;
      width: 500px;
      height: 500px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-shadow: 
        0 0 60px rgba(212, 175, 55, 0.6),
        inset 0 0 40px rgba(0,0,0,0.3),
        0 0 0 8px #8b7355;
      position: relative;
      font-family: 'Arial', sans-serif;
    `;

    // Clock face
    const clockFace = document.createElement("div");
    clockFace.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
    `;

    // Clock markers
    const clockMarkers = document.createElement("div");
    clockMarkers.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
    `;

    // Create hour markers
    for (let i = 0; i < 12; i++) {
      const marker = document.createElement("div");
      const angle = (i * 30) - 90;
      const radius = 200;
      const x = 250 + radius * Math.cos(angle * Math.PI / 180);
      const y = 250 + radius * Math.sin(angle * Math.PI / 180);
      
      marker.style.cssText = `
        position: absolute;
        width: 6px;
        height: 40px;
        background: #d4af37;
        border-radius: 2px;
        left: ${x}px;
        top: ${y}px;
        transform: translate(-50%, -50%) rotate(${angle + 90}deg);
      `;
      clockMarkers.appendChild(marker);
    }

    // Clock hands
    const clockHands = document.createElement("div");
    clockHands.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    `;

    const hourHand = document.createElement("div");
    hourHand.style.cssText = `
      position: absolute;
      width: 8px;
      height: 100px;
      background: #c0392b;
      border-radius: 3px;
      transform-origin: bottom center;
      left: 50%;
      bottom: 50%;
      transform: translateX(-50%) rotate(90deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      animation: tickHour 43200s linear infinite;
    `;

    const minuteHand = document.createElement("div");
    minuteHand.style.cssText = `
      position: absolute;
      width: 5px;
      height: 140px;
      background: #d4af37;
      border-radius: 3px;
      transform-origin: bottom center;
      left: 50%;
      bottom: 50%;
      transform: translateX(-50%) rotate(180deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      animation: tickMinute 3600s linear infinite;
    `;

    const centerDot = document.createElement("div");
    centerDot.style.cssText = `
      position: absolute;
      width: 20px;
      height: 20px;
      background: #d4af37;
      border-radius: 50%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.8);
      z-index: 10;
    `;

    clockHands.appendChild(hourHand);
    clockHands.appendChild(minuteHand);
    clockHands.appendChild(centerDot);

    clockFace.appendChild(clockMarkers);
    clockFace.appendChild(clockHands);

    pauseContainer.appendChild(clockFace);

    // Menu content
    const menuContent = document.createElement("div");
    menuContent.style.cssText = `
      position: relative;
      z-index: 5;
      text-align: center;
      padding: 40px;
    `;

    const title = document.createElement("h2");
    title.style.cssText = `
      color: #d4af37;
      font-size: 36px;
      margin: 20px 0 10px 0;
      text-shadow: 
        2px 2px 0px #8b6914,
        0 0 20px rgba(212, 175, 55, 0.8);
      letter-spacing: 3px;
      font-weight: bold;
    `;
    title.textContent = "🕐 PAUSED 🕐";

    const subtitle = document.createElement("p");
    subtitle.style.cssText = `
      color: #f5f5dc;
      font-size: 16px;
      margin-bottom: 25px;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
    `;
    subtitle.textContent = "Time Stands Still";

    // Controls info
    const controlsInfo = document.createElement("div");
    controlsInfo.style.cssText = `
      background: rgba(0, 0, 0, 0.4);
      border: 2px solid #d4af37;
      border-radius: 15px;
      padding: 15px;
      margin: 20px 0;
      text-align: left;
      backdrop-filter: blur(5px);
    `;

    const controlsTitle = document.createElement("h3");
    controlsTitle.style.cssText = `
      color: #d4af37;
      margin: 0 0 10px 0;
      font-size: 18px;
      text-align: center;
    `;
    controlsTitle.textContent = "⏰ Clocktower Controls";

    const controlsList = document.createElement("div");
    controlsList.innerHTML = `
      <p style="color: #f5f5dc; margin: 6px 0; font-size: 14px;">WASD - Move</p>
      <p style="color: #f5f5dc; margin: 6px 0; font-size: 14px;">Mouse Drag - Rotate Camera</p>
      <p style="color: #f5f5dc; margin: 6px 0; font-size: 14px;">Mouse Wheel - Zoom</p>
      <p style="color: #f5f5dc; margin: 6px 0; font-size: 14px;">Space - Jump</p>
      <p style="color: #f5f5dc; margin: 6px 0; font-size: 14px;">O - Pause/Resume</p>
    `;

    controlsInfo.appendChild(controlsTitle);
    controlsInfo.appendChild(controlsList);

    // Buttons
    const buttonContainer = document.createElement("div");

    const resumeBtn = document.createElement("button");
    resumeBtn.textContent = "▶ Resume";
    resumeBtn.style.cssText = `
      padding: 12px 30px;
      margin: 8px;
      border: none;
      border-radius: 25px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
      color: white;
      border: 2px solid #1e8449;
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
      padding: 12px 30px;
      margin: 8px;
      border: none;
      border-radius: 25px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      background: linear-gradient(135deg, #3498db 0%, #5dade2 100%);
      color: white;
      border: 2px solid #2874a6;
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

    menuContent.appendChild(title);
    menuContent.appendChild(subtitle);
    menuContent.appendChild(controlsInfo);
    menuContent.appendChild(buttonContainer);

    pauseContainer.appendChild(menuContent);

    // Add CSS animations
    if (!document.getElementById('level3-pause-style')) {
      const style = document.createElement('style');
      style.id = 'level3-pause-style';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes tickHour {
          0% { transform: translateX(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(360deg); }
        }
        @keyframes tickMinute {
          0% { transform: translateX(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(360deg); }
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

