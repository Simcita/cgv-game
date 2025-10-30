export class QuizUISystem {
  constructor(environment) {
    this.environment = environment;
    this.selectedAnswer = null;
    this.attemptsRemaining = 2;
    this.initUI();
    this.initClueBar();
    this.bindEnvironmentCallbacks();
    
  }
initUI() {
  this.container = document.createElement('div');
  this.container.id = 'quiz-container';
  this.container.style.position = 'fixed';
  this.container.style.top = '0';
  this.container.style.left = '0';
  this.container.style.width = '100vw';
  this.container.style.height = '100vh';
  this.container.style.background = 'rgba(0,0,0,0.7)'; // dark transparent overlay
  this.container.style.display = 'flex';
  this.container.style.flexDirection = 'column';
  this.container.style.justifyContent = 'center';
  this.container.style.alignItems = 'center';
  this.container.style.zIndex = '1000'; // on top of the 3D canvas
  this.container.style.color = '#fff';
  this.container.style.fontFamily = 'sans-serif';
  this.container.style.fontSize = '1.2rem';
  this.container.style.padding = '20px';
  this.container.style.boxSizing = 'border-box';
  this.container.style.visibility = 'hidden'; // hide initially
  document.body.appendChild(this.container);
}

initClueBar() {
  // A small persistent HUD bar to show the current clue
  this.clueBar = document.createElement('div');
  this.clueBar.id = 'clue-bar';
  this.clueBar.style.position = 'fixed';
  this.clueBar.style.bottom = '16px';
  this.clueBar.style.left = '50%';
  this.clueBar.style.transform = 'translateX(-50%)';
  this.clueBar.style.background = 'rgba(0,0,0,0.75)';
  this.clueBar.style.color = '#ffd700';
  this.clueBar.style.padding = '8px 14px';
  this.clueBar.style.borderRadius = '10px';
  this.clueBar.style.fontFamily = 'sans-serif';
  this.clueBar.style.fontSize = '1rem';
  this.clueBar.style.zIndex = '999';
  this.clueBar.style.maxWidth = '80vw';
  this.clueBar.style.textAlign = 'center';
  this.clueBar.style.display = 'none';
  document.body.appendChild(this.clueBar);
}

setClue(text) {
  if (!this.clueBar) return;
  this.clueBar.textContent = `💡 Clue: ${text}`;
  this.clueBar.style.display = 'block';
}

clearClue() {
  if (!this.clueBar) return;
  this.clueBar.textContent = '';
  this.clueBar.style.display = 'none';
}

showQuiz(quiz, state) {
  console.log('Showing quiz:', quiz);
  this.container.innerHTML = `
    <div style="
        position: relative; /* needed for X button positioning */
        background: #222;
        padding: 30px;
        border-radius: 10px;
        min-width: 300px;
        max-width: 600px;
        text-align: center;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
    ">
      <button id="quiz-close-btn" aria-label="Close quiz" title="Close" style="
        position:absolute;
        top:8px;
        right:10px;
        width:32px;
        height:32px;
        border:none;
        border-radius:16px;
        background:#444;
        color:#fff;
        cursor:pointer;
        font-weight:bold;
      ">×</button>

      <h2>🕰️ Clocktower Riddle</h2>
      <p class="question">${quiz.question}</p>
      <div class="options" style="margin: 20px 0;">
        ${quiz.options.map((opt, i) =>
          `<button data-index="${i}" class="option" style="
            display:block;
            margin:10px auto;
            padding:10px 20px;
            border:none;
            border-radius:5px;
            background:#555;
            color:white;
            cursor:pointer;
            font-size:1rem;
          ">${opt}</button>`  
        ).join('')}
      </div>
      <p class="feedback" style="min-height:20px;"></p>
      <button id="submit-btn" disabled style="
        margin-top: 10px;
        padding: 10px 20px;
        border:none;
        border-radius:5px;
        background:#28a745;
        color:white;
        cursor:pointer;
        font-size:1rem;
      ">Submit Answer</button>
    </div>
  `;

  // SHOW the modal
  this.container.style.visibility = 'visible';

  this.quiz = quiz;
  this.state = state;
  this.selectedAnswer = null;
  this.feedbackEl = this.container.querySelector('.feedback');
  this.submitBtn = this.container.querySelector('#submit-btn');

  // Option buttons
  this.container.querySelectorAll('.option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      this.selectAnswer(parseInt(e.target.dataset.index));
    });
  });

  // Submit button
  this.submitBtn.addEventListener('click', () => this.submitAnswer());

  // Close (X) button
  const closeBtn = this.container.querySelector('#quiz-close-btn');
  closeBtn.addEventListener('click', () => {
    // Allow the player to re-trigger the quiz by clearing the environment flag
    if (this.environment && typeof this.environment === 'object') {
      this.environment.hasTriggeredQuiz = false;
    }
    this.closeQuiz();
  });


}


selectAnswer(index) {
  // If an answer was already selected, reset its style
  if (this.selectedAnswer !== null) {
    const prevSelectedBtn = this.container.querySelector(`.option[data-index="${this.selectedAnswer}"]`);
    if (prevSelectedBtn) {
      prevSelectedBtn.classList.remove('selected');
      prevSelectedBtn.style.background = '#555'; // reset to default
    }
  }

  // Update selected answer
  this.selectedAnswer = index;

  // Highlight the newly selected button
  const selectedBtn = this.container.querySelector(`.option[data-index="${index}"]`);
  selectedBtn.classList.add('selected');
  selectedBtn.style.background = '#007bff'; // blue highlight

  // Enable the submit button
  this.submitBtn.disabled = false;
}


  submitAnswer() {
    this.environment.submitAnswer(this.selectedAnswer);
  }

  showClue(clue) {
    this.container.innerHTML = `
      <div style="
        position: relative;
        background: #222;
        padding: 30px;
        border-radius: 10px;
        min-width: 300px;
        max-width: 600px;
        text-align: center;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
      ">
        <h2>✅ Correct!</h2>
        <p style="opacity:0.85; margin-top:10px;">Clue for the next bolt:</p>
        <p style="margin: 10px 0 20px; font-style: italic;">"${clue}"</p>
        <button id="close-quiz-btn" style="
          margin-top: 10px;
          padding: 10px 20px;
          border:none;
          border-radius:5px;
          background:#28a745;
          color:white;
          cursor:pointer;
          font-size:1rem;
        ">Close</button>
      </div>
    `;
    const closeBtn = this.container.querySelector('#close-quiz-btn');
    closeBtn.addEventListener('click', () => {
      this.container.style.visibility = 'hidden';
      this.selectedAnswer = null;
      this.feedbackEl = null;
      this.submitBtn = null;
      this.container.innerHTML = '';
    });
  }

  showFeedback(msg, color) {
    if (!this.feedbackEl) return;
    this.feedbackEl.textContent = msg;
    this.feedbackEl.style.color = color;
  }

  showGameWon() {
  this.container.innerHTML = `
    <div style="
      background: #222;
      padding: 30px;
      border-radius: 10px;
      min-width: 300px;
      max-width: 600px;
      text-align: center;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    ">
      <h2>🏆 Victory!</h2>
      <p>You've escaped the Clocktower!</p>
      <button id="restart-btn" style="
        margin-top: 10px;
        padding: 10px 20px;
        border:none;
        border-radius:5px;
        background:#28a745;
        color:white;
        cursor:pointer;
        font-size:1rem;
      ">Play Again</button>
    </div>
  `;
  this.container.style.visibility = 'visible';

  const restartBtn = this.container.querySelector('#restart-btn');
  restartBtn.addEventListener('click', () => {
    this.container.style.visibility = 'hidden'; // hide the modal
    window.location.reload(); // or reset game state
  });
}

showGameLost() {
  this.container.innerHTML = `
    <div style="
      background: #222;
      padding: 30px;
      border-radius: 10px;
      min-width: 300px;
      max-width: 600px;
      text-align: center;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    ">
      <h2>💔 Game Over</h2>
      <p>Time has run out... Try again!</p>
      <button id="restart-btn" style="
        margin-top: 10px;
        padding: 10px 20px;
        border:none;
        border-radius:5px;
        background:#dc3545;
        color:white;
        cursor:pointer;
        font-size:1rem;
      ">Retry</button>
    </div>
  `;
  this.container.style.visibility = 'visible';

  const restartBtn = this.container.querySelector('#restart-btn');
  restartBtn.addEventListener('click', () => {
    this.container.style.visibility = 'hidden'; // hide the modal
    window.location.reload(); // or reset game state
  });
}
closeQuiz(delay = 0) {
  if (delay > 0) {
    setTimeout(() => {
      this.container.style.visibility = 'hidden';
      this.selectedAnswer = null;
      this.feedbackEl = null;
      this.submitBtn = null;
      this.container.innerHTML = ''; // optionally clear content
    }, delay);
  } else {
    this.container.style.visibility = 'hidden';
    this.selectedAnswer = null;
    this.feedbackEl = null;
    this.submitBtn = null;
    this.container.innerHTML = '';
  }
}


showMessage(msg, color = 'yellow') {
  if (!this.feedbackEl) {
    // If quiz not currently visible, create a simple floating message
    const floatingMsg = document.createElement('div');
    floatingMsg.textContent = msg;
    floatingMsg.style.position = 'fixed';
    floatingMsg.style.top = '20px';
    floatingMsg.style.left = '50%';
    floatingMsg.style.transform = 'translateX(-50%)';
    floatingMsg.style.background = 'rgba(0,0,0,0.8)';
    floatingMsg.style.color = color;
    floatingMsg.style.padding = '10px 20px';
    floatingMsg.style.borderRadius = '8px';
    floatingMsg.style.zIndex = 1000;
    document.body.appendChild(floatingMsg);
    setTimeout(() => floatingMsg.remove(), 3000);
  } else {
    this.showFeedback(msg, color);
  }
}

  bindEnvironmentCallbacks() {
    const env = this.environment;
    env.setOnQuizTrigger((quiz, state) => {
      // Player found the bolt; hide the clue until next bolt is placed
      this.clearClue();
      this.showQuiz(quiz, state);
    });
    env.setOnCorrectAnswer((clue) => {
      // Close quiz UI and update persistent clue for the next bolt
      this.closeQuiz();
      this.setClue(clue);
    });
    env.setOnWrongAnswer((attemptsLeft) => {
      this.showFeedback(`Wrong answer! ${attemptsLeft} attempts left.`, 'red');
    });
    env.setOnGameWon(() => { this.clearClue(); this.showGameWon(); });
    env.setOnGameLost(() => { this.clearClue(); this.showGameLost(); });
  }
}
