import React, { useState, useEffect } from 'react';

const QuizUISystem = ({ environment }) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showClue, setShowClue] = useState(false);
  const [clueText, setClueText] = useState('');
  const [showWrongAnswer, setShowWrongAnswer] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(2);
  const [showGameWon, setShowGameWon] = useState(false);
  const [showGameLost, setShowGameLost] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Setup environment callbacks
  useEffect(() => {
    if (!environment) return;

    // Quiz Trigger Callback
    environment.setOnQuizTrigger((quiz, state) => {
      setCurrentQuiz(quiz);
      setGameState(state);
      setShowQuiz(true);
      setSelectedAnswer(null);
      setFeedback('');
      setShowWrongAnswer(false);
    });

    // Correct Answer Callback
    environment.setOnCorrectAnswer((clue) => {
      setFeedback('Correct! 🎉');
      setTimeout(() => {
        setShowQuiz(false);
        setClueText(clue);
        setShowClue(true);
      }, 1500);
    });

    // Wrong Answer Callback
    environment.setOnWrongAnswer((attemptsLeft) => {
      setAttemptsRemaining(attemptsLeft);
      setFeedback(`Wrong answer! ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`);
      setShowWrongAnswer(true);
      setTimeout(() => {
        setShowWrongAnswer(false);
        if (attemptsLeft > 0) {
          setSelectedAnswer(null);
          setFeedback('');
        }
      }, 2500);
    });

    // Game Won Callback
    environment.setOnGameWon(() => {
      setShowQuiz(false);
      setShowClue(false);
      setShowGameWon(true);
    });

    // Game Lost Callback
    environment.setOnGameLost(() => {
      setShowQuiz(false);
      setShowClue(false);
      setShowGameLost(true);
    });

  }, [environment]);

  const handleAnswerSelect = (index) => {
    if (showWrongAnswer || !environment) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || showWrongAnswer || !environment) return;
    
    // Call environment's submitAnswer method
    environment.submitAnswer(selectedAnswer);
  };

  const handleCloseClue = () => {
    setShowClue(false);
    setClueText('');
  };

  const handleRestart = () => {
    setShowGameWon(false);
    setShowGameLost(false);
    setAttemptsRemaining(2);
    setSelectedAnswer(null);
    setFeedback('');
    setShowWrongAnswer(false);
    
    // Reset game state in environment if method exists
    if (environment && environment.resetGame) {
      environment.resetGame();
    } else {
      // Reload page as fallback
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Quiz Modal */}
      {showQuiz && currentQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center pointer-events-auto z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 rounded-lg shadow-2xl max-w-2xl w-full mx-4 border-4 border-amber-600 animate-scaleIn">
            {/* Header */}
            <div className="bg-amber-950 p-6 rounded-t-lg border-b-4 border-amber-600">
              <h2 className="text-3xl font-bold text-amber-100 text-center mb-2">
                🕰️ Clocktower Riddle
              </h2>
              <div className="flex justify-between text-amber-200 text-sm">
                <span>Stage {(gameState?.currentStage || 0) + 1}</span>
                <span className="font-bold">Attempts: {attemptsRemaining}/2</span>
              </div>
            </div>

            {/* Question */}
            <div className="p-8">
              <p className="text-2xl text-amber-50 mb-6 text-center font-serif italic">
                "{currentQuiz.question}"
              </p>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuiz.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showWrongAnswer}
                    className={`w-full p-4 rounded-lg text-left text-lg font-medium transition-all transform ${
                      selectedAnswer === index
                        ? 'bg-amber-500 text-white shadow-lg scale-105'
                        : 'bg-amber-100 text-amber-900 hover:bg-amber-200 hover:scale-102'
                    } ${showWrongAnswer ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`text-center text-xl font-bold mb-4 animate-bounce ${
                  feedback.includes('Correct') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {feedback}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || showWrongAnswer}
                className={`w-full py-4 rounded-lg text-xl font-bold transition-all ${
                  selectedAnswer === null || showWrongAnswer
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-500 transform hover:scale-105 shadow-lg active:scale-95'
                }`}
              >
                {showWrongAnswer ? 'Please wait...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clue Modal */}
      {showClue && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center pointer-events-auto z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-lg shadow-2xl max-w-xl w-full mx-4 border-4 border-green-600 animate-pulse">
            <div className="p-8 text-center">
              <div className="text-6xl mb-4 animate-bounce">🔍</div>
              <h2 className="text-3xl font-bold text-green-100 mb-4">Clue Found!</h2>
              <div className="bg-green-950 p-6 rounded-lg border-2 border-green-600 mb-6">
                <p className="text-xl text-green-50 font-serif italic leading-relaxed">
                  "{clueText}"
                </p>
              </div>
              <button
                onClick={handleCloseClue}
                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg active:scale-95"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Won Modal */}
      {showGameWon && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center pointer-events-auto z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-600 rounded-lg shadow-2xl max-w-2xl w-full mx-4 border-4 border-yellow-400">
            <div className="p-12 text-center">
              <div className="text-8xl mb-6 animate-bounce">🏆</div>
              <h2 className="text-5xl font-bold text-yellow-50 mb-4 animate-pulse">Victory!</h2>
              <p className="text-2xl text-yellow-100 mb-6">
                You've escaped the Clocktower!
              </p>
              <div className="bg-yellow-900 bg-opacity-50 p-6 rounded-lg mb-8">
                <p className="text-xl text-yellow-50 leading-relaxed">
                  Your sharp mind has solved the mysteries of time itself.
                  The clocktower's secrets are yours!
                </p>
              </div>
              <button
                onClick={handleRestart}
                className="bg-yellow-700 hover:bg-yellow-600 text-white px-10 py-4 rounded-lg text-xl font-bold transition-all transform hover:scale-105 shadow-lg active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Lost Modal */}
      {showGameLost && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center pointer-events-auto z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-lg shadow-2xl max-w-2xl w-full mx-4 border-4 border-red-600">
            <div className="p-12 text-center">
              <div className="text-8xl mb-6">💔</div>
              <h2 className="text-5xl font-bold text-red-100 mb-4">Game Over</h2>
              <p className="text-2xl text-red-200 mb-6">
                You've run out of attempts...
              </p>
              <div className="bg-red-950 bg-opacity-50 p-6 rounded-lg mb-8">
                <p className="text-xl text-red-100 leading-relaxed">
                  The clocktower's mysteries remain unsolved.
                  Time has run out, but you can always try again!
                </p>
              </div>
              <button
                onClick={handleRestart}
                className="bg-red-700 hover:bg-red-600 text-white px-10 py-4 rounded-lg text-xl font-bold transition-all transform hover:scale-105 shadow-lg active:scale-95"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Overlay (Only show if no modals are open) */}
      {!showQuiz && !showClue && !showGameWon && !showGameLost && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-lg pointer-events-auto z-40 max-w-md text-center">
          <p className="text-sm">
            🎮 Follow the <span className="text-orange-400 font-bold">glowing orange bolt</span> to begin your escape!
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default QuizUISystem;