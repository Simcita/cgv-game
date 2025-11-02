// Animated Credits with Adventure Theme
export function showAnimatedCredits(creditsNames = []) {
  // Remove existing credits if any
  const existing = document.getElementById('animated-credits-container');
  if (existing) existing.remove();

  const creditsContainer = document.createElement("div");
  creditsContainer.id = "animated-credits-container";
  creditsContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    overflow: hidden;
  `;

  // Stars background
  const stars = document.createElement("div");
  stars.style.cssText = `
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  `;

  // Create stars
  for (let i = 0; i < 100; i++) {
    const star = document.createElement("div");
    const size = Math.random() * 3 + 1;
    star.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: white;
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: twinkle ${Math.random() * 2 + 1}s infinite;
      animation-delay: ${Math.random() * 2}s;
    `;
    stars.appendChild(star);
  }

  // Credits roll container
  const creditsRoll = document.createElement("div");
  creditsRoll.style.cssText = `
    position: absolute;
    width: 100%;
    height: 300%;
    top: 100%;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    animation: rollUp 30s linear;
    transform-style: preserve-3d;
  `;

  // Create credit sections
  function createCreditSection(content, className, style = {}) {
    const section = document.createElement("div");
    section.className = className;
    section.style.cssText = `
      margin: 100px 0;
      text-align: center;
      color: white;
      text-shadow: 0 0 20px rgba(255,255,255,0.8);
    `;
    Object.assign(section.style, style);
    section.innerHTML = content;
    return section;
  }

  // Adventure logo
  creditsRoll.appendChild(createCreditSection(
    '<div style="font-size: 80px; color: #ffd700; text-shadow: 0 0 20px #ffd700, 0 0 40px #ffd700, 0 0 60px #ffd700, 4px 4px 8px rgba(0,0,0,0.9); animation: pulse 2s infinite;">⚔️ ADVENTURE GAME ⚔️</div>',
    'credit-logo'
  ));

  // Title
  creditsRoll.appendChild(createCreditSection(
    '<div style="font-size: 64px; font-weight: bold; margin: 40px 0; color: #ffd700; text-shadow: 0 0 10px #ffd700, 0 0 20px #ffd700, 0 0 30px #ffd700, 3px 3px 6px rgba(0,0,0,0.8); letter-spacing: 8px; text-transform: uppercase;">Credits</div>',
    'credit-title'
  ));

  // Development Team
  if (creditsNames.length > 0) {
    const teamSection = document.createElement("div");
    teamSection.style.cssText = `
      margin: 100px 0;
      text-align: center;
      color: white;
    `;
    
    const subtitle = document.createElement("div");
    subtitle.style.cssText = `
      font-size: 32px;
      margin: 60px 0 40px 0;
      color: #87ceeb;
      text-shadow: 0 0 10px #87ceeb, 2px 2px 4px rgba(0,0,0,0.8);
      letter-spacing: 4px;
    `;
    subtitle.textContent = "Development Team";
    teamSection.appendChild(subtitle);

    creditsNames.forEach((name, index) => {
      const nameDiv = document.createElement("div");
      nameDiv.style.cssText = `
        font-size: 36px;
        margin: 30px 0;
        color: #ffffff;
        text-shadow: 0 0 15px rgba(255,255,255,0.6), 2px 2px 4px rgba(0,0,0,0.8);
        letter-spacing: 3px;
        font-weight: bold;
      `;
      nameDiv.textContent = name;
      teamSection.appendChild(nameDiv);
    });

    creditsRoll.appendChild(teamSection);
  }

  // Thank you
  creditsRoll.appendChild(createCreditSection(
    '<div style="font-size: 48px; margin: 100px 0; color: #ffd700; text-shadow: 0 0 15px #ffd700, 0 0 30px #ffd700, 3px 3px 6px rgba(0,0,0,0.8); letter-spacing: 6px;">🎮 Thank You For Playing! 🎮</div>',
    'thank-you'
  ));

  creditsContainer.appendChild(stars);
  creditsContainer.appendChild(creditsRoll);

  // Add CSS animations
  if (!document.getElementById('credits-animations-style')) {
    const style = document.createElement('style');
    style.id = 'credits-animations-style';
    style.textContent = `
      @keyframes twinkle {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }
      @keyframes rollUp {
        0% {
          transform: translateY(0) rotateX(0deg);
          opacity: 1;
          filter: blur(0px);
        }
        90% {
          transform: translateY(-66.66%) rotateX(0deg);
          opacity: 1;
          filter: blur(0px);
        }
        100% {
          transform: translateY(-66.66%) rotateX(0deg);
          opacity: 0;
          filter: blur(10px);
        }
      }
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.9;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(creditsContainer);

  // Auto-remove after animation completes
  setTimeout(() => {
    if (creditsContainer.parentNode) {
      creditsContainer.parentNode.removeChild(creditsContainer);
    }
  }, 30000);

  return creditsContainer;
}

