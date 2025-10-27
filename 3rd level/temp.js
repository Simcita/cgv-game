
import { QuizUISystem } from './public/quiz-ui.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


export class Environment {
  constructor() {
    this.scene = new THREE.Scene();
    this.collidables = [];
    this.player = null;
    this.mixer = null;
    this.playerStartPosition = new THREE.Vector3(0, 0, 10);
    this.roomSize = 100;
    this.onQuizTrigger = null;
    this.onCorrectAnswer = null;
    this.onWrongAnswer = null;
    this.onGameWon = null;
    this.onGameLost = null;
    
    // Game state
    this.gameState = {
      attemptsRemaining: 2,
      currentStage: 0,
      hasAnsweredCurrentStage: false,
      gameOver: false,
      gameWon: false
    };
    
    // Quiz data
    this.quizzes = [
      {
        question: "What has hands but cannot clap?",
        options: ["A. A puppet", "B. A clock", "C. A mannequin", "D. A skeleton"],
        correctAnswer: 1, // Index of correct answer (B. A clock)
        clue: "Look up high where time stands still, near the face that shows the will."
      },
      {
        question: "I have a face but no eyes, hands but no fingers. What am I?",
        options: ["A. A painting", "B. A mirror", "C. A watch", "D. A statue"],
        correctAnswer: 2,
        clue: "The golden wheel that spins below, holds the secret you must know."
      }
    ];
  this.quizUI = new QuizUISystem(this);

    // Platform triggers
    this.platformTriggers = [];
    this.specialBolt = null;
    this.checkPlatformTrigger = false;
    
    // Smooth bump + ragdoll support
    this.playerVelocity = new THREE.Vector3();
    this.bumpDamping = 6;
    this.bumpMaxSpeed = 12;
    this._bumpCooldown = 0;
    this._gravity = new THREE.Vector3(0, -9.81, 0);
    // Optional physics for ragdoll via cannon-es (loaded dynamically)
    this.cannon = { CANNON: null, world: null };
    this.ragdoll = null; // { bodies: CANNON.Body[], visuals: THREE.Mesh[] }

    // Track extra colliders
    this.poles = [];
    this.bolts = [];
    this.beams = [];
    this.pipes = [];
    this.nuts = [];

    // Grounding/stepping
    this.playerVelY = 0;
    this.grounded = false;
    this.groundObject = null; // null = floor, or a platform mesh
    this.stepHeight = 0.7;    // max height we auto-step up
    this.playerRadius = 0.5;  // used for horizontal bounds checks

    this.init();
    // Attempt to load cannon-es in the background for ragdoll support
    this.initPhysics().catch(() => {/* optional */});
  }
  // === Setters ===
setOnQuizTrigger(cb) { this.onQuizTrigger = cb; }
setOnCorrectAnswer(cb) { this.onCorrectAnswer = cb; }
setOnWrongAnswer(cb) { this.onWrongAnswer = cb; }
setOnGameWon(cb) { this.onGameWon = cb; }
setOnGameLost(cb) { this.onGameLost = cb; }

// === Triggers ===
triggerQuiz(quiz, state) { if (this.onQuizTrigger) this.onQuizTrigger(quiz, state); }
triggerCorrectAnswer(clue) { if (this.onCorrectAnswer) this.onCorrectAnswer(clue); }
triggerWrongAnswer(rem) { if (this.onWrongAnswer) this.onWrongAnswer(rem); }
triggerGameWon() { if (this.onGameWon) this.onGameWon(); }
triggerGameLost() { if (this.onGameLost) this.onGameLost(); }
handleQuizAnswer(isCorrect) {
  const state = this.gameState;

  if (state.hasAnsweredCurrentStage) return; // prevent double-answering
  state.hasAnsweredCurrentStage = true;

  if (isCorrect) {
    state.currentStage++;
    if (state.currentStage >= this.quizzes.length) {
      state.gameWon = true;
      this.quizUI.showMessage("🏆 You solved all riddles!");
    } else {
      this.quizUI.showMessage("✅ Correct! Proceed to the next mechanism.");
    }
  } else {
    state.attemptsRemaining--;
    if (state.attemptsRemaining <= 0) {
      state.gameOver = true;
      this.quizUI.showMessage("💀 No attempts left. The clock stops here.");
    } else {
      this.quizUI.showMessage(`❌ Wrong! ${state.attemptsRemaining} attempts remaining.`);
    }
  }
}

  init() {
    this.scene.background = new THREE.Color(0x8B7355);
    this.scene.fog = new THREE.Fog(0x8B7355, 80, 200);
    
    // Bright ambient light
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    
    // Strong directional light from clock face
    const clockLight = new THREE.DirectionalLight(0xfff5e1, 1.2);
    clockLight.position.set(0, 30, -45);
    clockLight.castShadow = true;
    this.scene.add(clockLight);
    
    // Bright spotlight on central mechanism
    const mechanismLight = new THREE.SpotLight(0xffd700, 1.5, 60, Math.PI / 5);
    mechanismLight.position.set(0, 40, 0);
    mechanismLight.target.position.set(0, 0, 0);
    this.scene.add(mechanismLight);
    this.scene.add(mechanismLight.target);
    
    // Warm point lights on the corners
    const cornerLight1 = new THREE.PointLight(0xffcc99, 1.2, 50);
    cornerLight1.position.set(-40, 20, -40);
    this.scene.add(cornerLight1);
    
    const cornerLight2 = new THREE.PointLight(0xffcc99, 1.2, 50);
    cornerLight2.position.set(40, 20, -40);
    this.scene.add(cornerLight2);
    
    const cornerLight3 = new THREE.PointLight(0xffcc99, 1.2, 50);
    cornerLight3.position.set(-40, 20, 40);
    this.scene.add(cornerLight3);
    
    const cornerLight4 = new THREE.PointLight(0xffcc99, 1.2, 50);
    cornerLight4.position.set(40, 20, 40);
    this.scene.add(cornerLight4);
    
    // Additional overhead lights
    const overheadLight1 = new THREE.PointLight(0xffffcc, 1, 40);
    overheadLight1.position.set(0, 35, 0);
    this.scene.add(overheadLight1);
    
    const overheadLight2 = new THREE.PointLight(0xffffcc, 0.8, 35);
    overheadLight2.position.set(20, 30, 20);
    this.scene.add(overheadLight2);
    
    const overheadLight3 = new THREE.PointLight(0xffffcc, 0.8, 35);
    overheadLight3.position.set(-20, 30, -20);
    this.scene.add(overheadLight3);
    
    this.createClocktowerWorkshop();
  }


checkPlayerNearBolt() {
    if(!this.player || !this.specialBolt || this.hasTriggeredQuiz || this.gameState.gameOver) return;
    
    const playerPos = this.player.position;
    const boltPos = this.specialBolt.position;
    
    const distance = playerPos.distanceTo(boltPos);
    
    // Trigger quiz when player is within 3 units of the bolt
    if(distance < 3 && !this.hasTriggeredQuiz) {
      this.hasTriggeredQuiz = true;
      this.triggerQuiz();
    }
  }

  triggerQuiz() {
    if(this.onQuizTrigger) {
      const currentQuiz = this.quizzes[this.gameState.currentStage];
      this.onQuizTrigger(currentQuiz, this.gameState);
    }
  }

  submitAnswer(answerIndex) {
    if(this.gameState.gameOver || this.gameState.hasAnsweredCurrentStage) return;
    
    const currentQuiz = this.quizzes[this.gameState.currentStage];
    const isCorrect = answerIndex === currentQuiz.correctAnswer;
    
    if(isCorrect) {
      this.gameState.hasAnsweredCurrentStage = true;
      this.gameState.currentStage++;
      
      if(this.gameState.currentStage >= this.quizzes.length) {
        this.gameState.gameWon = true;
        this.gameState.gameOver = true;
        if(this.onGameWon) this.onGameWon();
      } else {
        if(this.onCorrectAnswer) {
          this.onCorrectAnswer(currentQuiz.clue);
        }
        this.gameState.hasAnsweredCurrentStage = false;
        this.hasTriggeredQuiz = false;
      }
    } else {
      this.gameState.attemptsRemaining--;
      
      if(this.gameState.attemptsRemaining <= 0) {
        this.gameState.gameOver = true;
        if(this.onGameLost) this.onGameLost();
      } else {
        if(this.onWrongAnswer) {
          this.onWrongAnswer(this.gameState.attemptsRemaining);
        }
      }
    }
    
    return { isCorrect, attemptsRemaining: this.gameState.attemptsRemaining };
  }

  resetGame() {
    this.gameState = {
      attemptsRemaining: 2,
      currentStage: 0,
      hasAnsweredCurrentStage: false,
      gameOver: false,
      gameWon: false
    };
    this.hasTriggeredQuiz = false;
    if(this.player) {
      this.player.position.copy(this.playerStartPosition);
      this.playerVelocity.set(0, 0, 0);
      this.playerVelY = 0;
    }
  }

  setOnQuizTrigger(callback) { this.onQuizTrigger = callback; }
  setOnCorrectAnswer(callback) { this.onCorrectAnswer = callback; }
  setOnWrongAnswer(callback) { this.onWrongAnswer = callback; }
  setOnGameWon(callback) { this.onGameWon = callback; }
  setOnGameLost(callback) { this.onGameLost = callback; }
  
  getGameState() { return this.gameState; }




  // Optional callbacks
  setOnBump(cb) { this.onBump = cb; }
  setOnRagdollStart(cb) { this.onRagdollStart = cb; }

  getCollidables(){ return this.collidables; }
  getScene(){ return this.scene; }
  getPlayer(){ return this.player; }
  getMixer(){ return this.mixer; }
  getPlayerStartPosition(){ return this.playerStartPosition||new THREE.Vector3(0,0,10); }
}