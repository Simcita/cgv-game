// 1st level/level1Enemies.js
import * as THREE from "three"

export class Level1Enemies {
  constructor(scene, player) {
    this.scene = scene
    this.player = player
    this.frogs = []
    this.crocodiles = []
    this.book = null
    this.gameState = 'playing' // 'playing', 'paused', 'won', 'lost'
    this.quizActive = false
    this.currentQuestion = null
    this.quizAttempts = 0
    this.hintTimer = 0
    this.hintInterval = 15 // Show hint every 15 seconds
  }

  // Create a frog mesh
  createFrog() {
    const frogGroup = new THREE.Group()
    
    // Body
    const bodyGeo = new THREE.SphereGeometry(0.4, 16, 16)
    bodyGeo.scale(1, 0.6, 1.3)
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x2d5016,
      roughness: 0.8
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.castShadow = true
    body.receiveShadow = true
    frogGroup.add(body)

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.15, 12, 12)
    const eyeMat = new THREE.MeshStandardMaterial({ 
      color: 0xffff00,
      emissive: 0x444400
    })
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.18, 0.2, 0.3)
    leftEye.castShadow = true
    frogGroup.add(leftEye)
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.18, 0.2, 0.3)
    rightEye.castShadow = true
    frogGroup.add(rightEye)

    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.08, 8, 8)
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 })
    
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat)
    leftPupil.position.set(-0.18, 0.2, 0.42)
    frogGroup.add(leftPupil)
    
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat)
    rightPupil.position.set(0.18, 0.2, 0.42)
    frogGroup.add(rightPupil)

    // Danger glow
    const glowGeo = new THREE.SphereGeometry(0.6, 16, 16)
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    frogGroup.add(glow)
    frogGroup.userData.glow = glow

    return frogGroup
  }

  // Create a crocodile mesh
  createCrocodile() {
    const crocGroup = new THREE.Group()
    
    // Body
    const bodyGeo = new THREE.BoxGeometry(1.5, 0.4, 0.6)
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x2d4a2a,
      roughness: 0.9
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.castShadow = true
    crocGroup.add(body)

    // Head
    const headGeo = new THREE.BoxGeometry(0.8, 0.3, 0.5)
    const head = new THREE.Mesh(headGeo, bodyMat)
    head.position.set(1, 0, 0)
    head.castShadow = true
    crocGroup.add(head)

    // Snout
    const snoutGeo = new THREE.BoxGeometry(0.4, 0.15, 0.4)
    const snout = new THREE.Mesh(snoutGeo, bodyMat)
    snout.position.set(1.5, -0.05, 0)
    snout.castShadow = true
    crocGroup.add(snout)

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8)
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff0000 })
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(1.2, 0.15, -0.15)
    crocGroup.add(leftEye)
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(1.2, 0.15, 0.15)
    crocGroup.add(rightEye)

    // Tail
    const tailGeo = new THREE.BoxGeometry(0.8, 0.2, 0.3)
    const tail = new THREE.Mesh(tailGeo, bodyMat)
    tail.position.set(-1, 0, 0)
    tail.rotation.z = 0.1
    crocGroup.add(tail)
    crocGroup.userData.tail = tail

    // Danger glow
    const glowGeo = new THREE.BoxGeometry(2, 0.8, 1)
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    crocGroup.add(glow)
    crocGroup.userData.glow = glow

    return crocGroup
  }

  // Spawn frogs around the level
  spawnFrogs(count = 4) {
    for (let i = 0; i < count; i++) {
      const frog = this.createFrog()
      
      const angle = (i / count) * Math.PI * 2
      const distance = 15 + Math.random() * 10
      
      frog.position.set(
        Math.cos(angle) * distance,
        0.4,
        Math.sin(angle) * distance
      )
      
      frog.userData.speed = 0.8 + Math.random() * 0.4
      frog.userData.hopTimer = Math.random() * 2
      frog.userData.isHopping = false
      frog.userData.catchRadius = 1.5
      
      this.scene.add(frog)
      this.frogs.push(frog)
    }
    console.log(`🐸 Spawned ${count} frogs`)
  }

  // Spawn crocodiles around the level
  spawnCrocodiles(count = 3) {
    for (let i = 0; i < count; i++) {
      const croc = this.createCrocodile()
      
      const angle = ((i + 0.5) / count) * Math.PI * 2
      const distance = 20 + Math.random() * 10
      
      croc.position.set(
        Math.cos(angle) * distance,
        0.2,
        Math.sin(angle) * distance
      )
      
      croc.userData.speed = 0.5 + Math.random() * 0.3
      croc.userData.crawlPhase = Math.random() * Math.PI * 2
      croc.userData.catchRadius = 2
      
      this.scene.add(croc)
      this.crocodiles.push(croc)
    }
    console.log(`🐊 Spawned ${count} crocodiles`)
  }

  // Create the hidden book
  createBook() {
    const bookGroup = new THREE.Group()
    
    // Book body
    const bookGeo = new THREE.BoxGeometry(0.6, 0.8, 0.1)
    const bookMat = new THREE.MeshStandardMaterial({ 
      color: 0x8b4513,
      roughness: 0.8
    })
    const bookBody = new THREE.Mesh(bookGeo, bookMat)
    bookBody.castShadow = true
    bookGroup.add(bookBody)

    // Book pages (white edge)
    const pagesGeo = new THREE.BoxGeometry(0.55, 0.75, 0.12)
    const pagesMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
    const pages = new THREE.Mesh(pagesGeo, pagesMat)
    bookGroup.add(pages)

    // Glow effect
    const glowGeo = new THREE.BoxGeometry(1, 1.2, 0.4)
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    bookGroup.add(glow)
    bookGroup.userData.glow = glow

    // Random hidden position
    const randomX = (Math.random() - 0.5) * 80
    const randomZ = (Math.random() - 0.5) * 80
    bookGroup.position.set(randomX, 1.5, randomZ)
    bookGroup.rotation.set(Math.PI / 2, 0, Math.random() * Math.PI)
    
    // Floating animation data
    bookGroup.userData.startY = 1.5
    bookGroup.userData.floatOffset = Math.random() * Math.PI * 2
    
    this.scene.add(bookGroup)
    this.book = bookGroup
    
    console.log(`📖 Book hidden at (${randomX.toFixed(1)}, ${randomZ.toFixed(1)})`)
  }

  // Update frogs AI - hopping and chasing
  updateFrogs(delta) {
    if (!this.player || this.gameState !== 'playing') return

    const playerPos = this.player.position

    this.frogs.forEach(frog => {
      const frogPos = frog.position
      const distance = new THREE.Vector2(
        frogPos.x - playerPos.x,
        frogPos.z - playerPos.z
      ).length()
      
      // Check if frog caught the player
      if (distance < frog.userData.catchRadius) {
        this.onPlayerCaught('frog')
        return
      }

      // Pulse the glow based on distance
      const glowIntensity = Math.max(0.1, 1 - distance / 20)
      frog.userData.glow.material.opacity = glowIntensity * 0.3
      
      // Direction to player
      const direction = new THREE.Vector3()
        .subVectors(playerPos, frogPos)
        .normalize()
      
      // Hop animation timer
      frog.userData.hopTimer -= delta
      
      if (frog.userData.hopTimer <= 0) {
        frog.userData.isHopping = true
        frog.userData.hopTimer = 1.2 + Math.random() * 0.8
      }
      
      if (frog.userData.isHopping) {
        // Move frog towards player
        const moveSpeed = frog.userData.speed * delta * 3
        frog.position.x += direction.x * moveSpeed
        frog.position.z += direction.z * moveSpeed
        
        // Hopping animation
        const hopPhase = (frog.userData.hopTimer % 0.5) / 0.5
        frog.position.y = 0.4 + Math.sin(hopPhase * Math.PI) * 0.3
        
        // Rotate to face player
        frog.rotation.y = Math.atan2(direction.x, direction.z)
        
        if (hopPhase > 0.9) {
          frog.userData.isHopping = false
        }
      } else {
        frog.position.y = THREE.MathUtils.lerp(frog.position.y, 0.4, delta * 5)
      }
    })
  }

  // Update crocodiles AI - crawling and chasing
  updateCrocodiles(delta) {
    if (!this.player || this.gameState !== 'playing') return

    const playerPos = this.player.position

    this.crocodiles.forEach(croc => {
      const crocPos = croc.position
      const distance = new THREE.Vector2(
        crocPos.x - playerPos.x,
        crocPos.z - playerPos.z
      ).length()
      
      // Check if crocodile caught the player
      if (distance < croc.userData.catchRadius) {
        this.onPlayerCaught('crocodile')
        return
      }

      // Pulse the glow based on distance
      const glowIntensity = Math.max(0.1, 1 - distance / 25)
      croc.userData.glow.material.opacity = glowIntensity * 0.3
      
      // Direction to player
      const direction = new THREE.Vector3()
        .subVectors(playerPos, crocPos)
        .normalize()
      
      // Crawling movement
      const moveSpeed = croc.userData.speed * delta * 2
      croc.position.x += direction.x * moveSpeed
      croc.position.z += direction.z * moveSpeed
      
      // Crawling animation
      croc.userData.crawlPhase += delta * 3
      const crawlBob = Math.sin(croc.userData.crawlPhase) * 0.05
      croc.position.y = 0.2 + crawlBob
      
      // Body sway
      croc.rotation.z = Math.sin(croc.userData.crawlPhase) * 0.05
      
      // Tail wag
      if (croc.userData.tail) {
        croc.userData.tail.rotation.y = Math.sin(croc.userData.crawlPhase * 2) * 0.3
      }
      
      // Face player
      croc.rotation.y = Math.atan2(direction.x, direction.z)
    })
  }

  // Update book floating animation
  updateBook(delta) {
    if (!this.book || !this.player || this.gameState !== 'playing') return

    const time = Date.now() * 0.001
    this.book.position.y = this.book.userData.startY + 
      Math.sin(time * 2 + this.book.userData.floatOffset) * 0.2
    
    this.book.rotation.y += delta * 0.5
    
    const glowPulse = 0.15 + Math.sin(time * 3) * 0.1
    this.book.userData.glow.material.opacity = glowPulse

    const distance = this.book.position.distanceTo(this.player.position)
    if (distance < 2) {
      this.onBookFound()
    }
  }

  // Update hint system
  updateHints(delta) {
    if (this.gameState !== 'playing' || !this.book || !this.player) return

    this.hintTimer += delta

    if (this.hintTimer >= this.hintInterval) {
      this.hintTimer = 0
      this.showHint()
    }
  }

  // Show directional hint
  showHint() {
    const distance = this.player.position.distanceTo(this.book.position)
    const direction = new THREE.Vector3()
      .subVectors(this.book.position, this.player.position)
      .normalize()

    let hintText = ''
    let directionText = ''

    // Direction hints
    if (Math.abs(direction.x) > Math.abs(direction.z)) {
      directionText = direction.x > 0 ? 'east' : 'west'
    } else {
      directionText = direction.z > 0 ? 'south' : 'north'
    }

    // Distance hints
    if (distance > 40) {
      hintText = `📖 The book is very far to the ${directionText}...`
    } else if (distance > 20) {
      hintText = `📖 The book is somewhere ${directionText}...`
    } else if (distance > 10) {
      hintText = `📖 You're getting closer! Look ${directionText}!`
    } else {
      hintText = `📖 The book is very close! It's glowing nearby!`
    }

    this.displayMessage(hintText, 3000)
  }

  // Display temporary message
  displayMessage(text, duration = 3000) {
    const existingMsg = document.getElementById('hint-message')
    if (existingMsg) existingMsg.remove()

    const msg = document.createElement('div')
    msg.id = 'hint-message'
    msg.textContent = text
    msg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 30px;
      border-radius: 10px;
      font-size: 18px;
      z-index: 999;
      pointer-events: none;
    `

    document.body.appendChild(msg)

    setTimeout(() => {
      if (msg.parentNode) msg.remove()
    }, duration)
  }

  // Book found - start quiz
  onBookFound() {
    if (this.quizActive) return
    
    console.log('📖 Book found! Starting quiz...')
    this.quizActive = true
    this.quizAttempts = 0
    
    this.showQuiz()
  }

  // Show quiz overlay
  showQuiz() {
    const quizOverlay = document.createElement('div')
    quizOverlay.id = 'quiz-overlay'
    quizOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `

    const quizBox = document.createElement('div')
    quizBox.style.cssText = `
      background: white;
      padding: 40px;
      border-radius: 15px;
      max-width: 600px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    `

    const questions = [
      {
        question: 'What do plants need to grow?',
        answers: ['Only water', 'Sunlight, water, and air', 'Just soil', 'Nothing'],
        correct: 1
      },
      {
        question: 'Which of these is a living thing?',
        answers: ['Rock', 'Tree', 'Cloud', 'River'],
        correct: 1
      },
      {
        question: 'What is the largest planet in our solar system?',
        answers: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
        correct: 2
      },
      {
        question: 'What do bees collect from flowers?',
        answers: ['Water', 'Nectar', 'Leaves', 'Seeds'],
        correct: 1
      },
      {
        question: 'How many legs does a spider have?',
        answers: ['6', '8', '10', '12'],
        correct: 1
      }
    ]

    this.currentQuestion = questions[Math.floor(Math.random() * questions.length)]

    quizBox.innerHTML = `
      <h2 style="color: #8b4513; margin-top: 0; font-size: 28px; text-align: center;">
        📖 Book Quiz! (Attempt ${this.quizAttempts + 1}/2)
      </h2>
      <p style="font-size: 18px; color: #333; margin: 20px 0; line-height: 1.6;">
        ${this.currentQuestion.question}
      </p>
      <div id="quiz-answers"></div>
    `

    const answersDiv = quizBox.querySelector('#quiz-answers')
    
    this.currentQuestion.answers.forEach((answer, index) => {
      const button = document.createElement('button')
      button.textContent = answer
      button.style.cssText = `
        display: block;
        width: 100%;
        margin: 10px 0;
        padding: 15px;
        font-size: 16px;
        cursor: pointer;
        border: 2px solid #8b4513;
        border-radius: 8px;
        background: white;
        transition: all 0.3s;
      `

      button.addEventListener('mouseenter', () => {
        button.style.background = '#f5e6d3'
        button.style.transform = 'scale(1.02)'
      })

      button.addEventListener('mouseleave', () => {
        button.style.background = 'white'
        button.style.transform = 'scale(1)'
      })

      button.addEventListener('click', () => {
        this.checkAnswer(index, quizOverlay)
      })

      answersDiv.appendChild(button)
    })

    quizOverlay.appendChild(quizBox)
    document.body.appendChild(quizOverlay)
  }

  // Check quiz answer
  checkAnswer(selectedIndex, overlay) {
    if (selectedIndex === this.currentQuestion.correct) {
      this.onWin(overlay)
    } else {
      this.quizAttempts++
      
      if (this.quizAttempts >= 2) {
        // Failed after 2 attempts
        overlay.querySelector('div').innerHTML = `
          <h2 style="color: #d32f2f; margin-top: 0; font-size: 28px; text-align: center;">
            ❌ Quiz Failed!
          </h2>
          <p style="font-size: 18px; color: #333; margin: 20px 0; text-align: center;">
            You used both attempts. Try again!
          </p>
          <button id="retry-btn" style="
            display: block;
            width: 100%;
            margin: 20px auto 0;
            padding: 15px;
            font-size: 18px;
            cursor: pointer;
            border: none;
            border-radius: 8px;
            background: #d32f2f;
            color: white;
            font-weight: bold;
          ">Restart Level</button>
        `

        document.getElementById('retry-btn').addEventListener('click', () => {
          this.resetGame()
          overlay.remove()
        })
      } else {
        // One more attempt
        overlay.querySelector('div').innerHTML = `
          <h2 style="color: #ff9800; margin-top: 0; font-size: 28px; text-align: center;">
            ❌ Wrong Answer!
          </h2>
          <p style="font-size: 18px; color: #333; margin: 20px 0; text-align: center;">
            You have 1 more attempt. Try again!
          </p>
          <button id="retry-quiz-btn" style="
            display: block;
            width: 100%;
            margin: 20px auto 0;
            padding: 15px;
            font-size: 18px;
            cursor: pointer;
            border: none;
            border-radius: 8px;
            background: #ff9800;
            color: white;
            font-weight: bold;
          ">Try Again</button>
        `

        document.getElementById('retry-quiz-btn').addEventListener('click', () => {
          overlay.remove()
          this.showQuiz()
        })
      }
    }
  }

  // Player won
  onWin(overlay) {
    this.gameState = 'won'
    console.log('🎉 Player wins!')
    
    overlay.querySelector('div').innerHTML = `
      <h2 style="color: #4CAF50; margin-top: 0; font-size: 36px; text-align: center;">
        🎉 CORRECT! 🎉
      </h2>
      <p style="font-size: 20px; color: #333; margin: 20px 0; text-align: center;">
        You found the book and answered correctly!
      </p>
      <button id="next-level-btn" style="
        display: block;
        width: 100%;
        margin: 10px auto;
        padding: 15px;
        font-size: 18px;
        cursor: pointer;
        border: none;
        border-radius: 8px;
        background: #4CAF50;
        color: white;
        font-weight: bold;
      ">Go to Level 2</button>
      <button id="play-again-btn" style="
        display: block;
        width: 100%;
        margin: 10px auto 0;
        padding: 15px;
        font-size: 18px;
        cursor: pointer;
        border: none;
        border-radius: 8px;
        background: #2196F3;
        color: white;
        font-weight: bold;
      ">Play Level 1 Again</button>
    `

    document.getElementById('next-level-btn').addEventListener('click', () => {
      overlay.remove()
      // Trigger level 2 load
      window.dispatchEvent(new CustomEvent('loadLevel', { detail: { level: 2 } }))
    })

    document.getElementById('play-again-btn').addEventListener('click', () => {
      this.resetGame()
      overlay.remove()
    })
  }

  // Player caught by enemy
  onPlayerCaught(enemyType) {
    if (this.gameState !== 'playing') return
    
    this.gameState = 'lost'
    const emoji = enemyType === 'frog' ? '🐸' : '🐊'
    console.log(`${emoji} Player caught!`)
    
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `

    overlay.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #d32f2f 0%, #f44336 100%);
        padding: 40px;
        border-radius: 15px;
        max-width: 500px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        color: white;
        text-align: center;
      ">
        <h2 style="margin-top: 0; font-size: 36px;">
          ${emoji} CAUGHT! ${emoji}
        </h2>
        <p style="font-size: 20px; margin: 20px 0;">
          A ${enemyType} caught you!
        </p>
        <button id="retry-btn" style="
          display: block;
          width: 100%;
          margin: 20px auto 0;
          padding: 15px;
          font-size: 18px;
          cursor: pointer;
          border: none;
          border-radius: 8px;
          background: white;
          color: #d32f2f;
          font-weight: bold;
        ">Restart Level</button>
      </div>
    `

    document.body.appendChild(overlay)

    document.getElementById('retry-btn').addEventListener('click', () => {
      this.resetGame()
      overlay.remove()
    })
  }

  // Show pause screen
  showPauseScreen() {
    const overlay = document.createElement('div')
    overlay.id = 'pause-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `

    overlay.innerHTML = `
      <div style="
        background: white;
        padding: 40px;
        border-radius: 15px;
        max-width: 400px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        text-align: center;
      ">
        <h2 style="margin-top: 0; font-size: 32px; color: #333;">
          ⏸️ PAUSED
        </h2>
        <button id="resume-btn" style="
          display: block;
          width: 100%;
          margin: 15px auto;
          padding: 15px;
          font-size: 18px;
          cursor: pointer;
          border: none;
          border-radius: 8px;
          background: #4CAF50;
          color: white;
          font-weight: bold;
        ">Resume</button>
        <button id="restart-pause-btn" style="
          display: block;
          width: 100%;
          margin: 15px auto;
          padding: 15px;
          font-size: 18px;
          cursor: pointer;
          border: none;
          border-radius: 8px;
          background: #ff9800;
          color: white;
          font-weight: bold;
        ">Restart Level</button>
      </div>
    `

    document.body.appendChild(overlay)

    document.getElementById('resume-btn').addEventListener('click', () => {
      this.gameState = 'playing'
      overlay.remove()
    })

    document.getElementById('restart-pause-btn').addEventListener('click', () => {
      this.resetGame()
      overlay.remove()
    })
  }

  // Toggle pause
  togglePause() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused'
      this.showPauseScreen()
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing'
      const overlay = document.getElementById('pause-overlay')
      if (overlay) overlay.remove()
    }
  }

  // Reset game
  resetGame() {
    console.log('🔄 Resetting game...')
    
    this.gameState = 'playing'
    this.quizActive = false
    this.currentQuestion = null
    this.quizAttempts = 0
    this.hintTimer = 0

    // Remove old book
    if (this.book) {
      this.scene.remove(this.book)
      this.book = null
    }

    // Remove old frogs
    this.frogs.forEach(frog => this.scene.remove(frog))
    this.frogs = []

    // Remove old crocodiles
    this.crocodiles.forEach(croc => this.scene.remove(croc))
    this.crocodiles = []

    // Respawn everything
    this.createBook()
    this.spawnFrogs(4)
    this.spawnCrocodiles(3)

    // Reset player position
    if (this.player) {
      this.player.position.set(0, 0, 0)
    }

    console.log('✅ Game reset complete!')
  }

  // Clean up all enemies and book
  dispose() {
    // Remove frogs
    this.frogs.forEach(frog => {
      this.scene.remove(frog)
    })
    this.frogs = []

    // Remove crocodiles
    this.crocodiles.forEach(croc => {
      this.scene.remove(croc)
    })
    this.crocodiles = []

    // Remove book
    if (this.book) {
      this.scene.remove(this.book)
      this.book = null
    }

    // Remove any overlays
    const overlays = document.querySelectorAll('#quiz-overlay, #pause-overlay, #hint-message')
    overlays.forEach(o => o.remove())
  }

  // Main update loop
  update(delta) {
    if (this.gameState === 'playing') {
      this.updateFrogs(delta)
      this.updateCrocodiles(delta)
      this.updateBook(delta)
      this.updateHints(delta)
    }
  }

  // Getters
  getGameState() {
    return this.gameState
  }

  setGameState(state) {
    this.gameState = state
  }

  getAllEnemies() {
    return [...this.frogs, ...this.crocodiles]
  }

  getBook() {
    return this.book
  }
}