import { useState, useEffect, useRef } from 'react';
import { Play, Home, RotateCcw, Eye } from 'lucide-react';

type Mode = 'home' | 'auto' | 'manual';
type GameState = 'idle' | 'running' | 'finished' | 'showingAnswer' | 'showingNumbers';

const AbacusMathSolver = () => {
  const [mode, setMode] = useState<Mode>('home');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [interval, setInterval] = useState<number>(1);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answer, setAnswer] = useState<number | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate 8 numbers ensuring sum is positive and no intermediate sum is negative
  const generateNumbers = (): number[] => {
    const result: number[] = [];
    let sum = 0;
    
    for (let i = 0; i < 8; i++) {
      let num: number;
      
      if (i === 7) {
        // Last number: ensure final sum is positive
        if (sum <= 0) {
          num = Math.floor(Math.random() * (99 - (1 - sum))) + (1 - sum);
        } else {
          num = Math.floor(Math.random() * 199) - 99;
          while (sum + num <= 0) {
            num = Math.floor(Math.random() * 199) - 99;
          }
        }
      } else {
        // For other positions: ensure intermediate sum doesn't go negative
        const minAllowed = sum >= 0 ? -99 : (1 - sum);
        const maxAllowed = 99;
        
        if (minAllowed > maxAllowed) {
          num = minAllowed;
        } else {
          num = Math.floor(Math.random() * (maxAllowed - minAllowed + 1)) + minAllowed;
          // Ensure this doesn't make sum negative
          while (sum + num < 0) {
            num = Math.floor(Math.random() * (maxAllowed - minAllowed + 1)) + minAllowed;
          }
        }
      }
      
      result.push(num);
      sum += num;
    }
    
    return result;
  };

  const startGame = () => {
    const nums = generateNumbers();
    setNumbers(nums);
    setCurrentIndex(0);
    setCurrentNumber(nums[0]);
    setGameState('running');
    setAnswer(null);
  };

  // Auto mode effect
  useEffect(() => {
    if (mode === 'auto' && gameState === 'running' && currentIndex < 8) {
      timeoutRef.current = setTimeout(() => {
        if (currentIndex < 7) {
          setCurrentIndex(prev => prev + 1);
          setCurrentNumber(numbers[currentIndex + 1]);
        } else {
          setCurrentNumber(null);
          setGameState('finished');
        }
      }, interval * 1000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [mode, gameState, currentIndex, interval, numbers]);

  const handleNext = () => {
    if (currentIndex < 7) {
      setCurrentIndex(prev => prev + 1);
      setCurrentNumber(numbers[currentIndex + 1]);
    } else {
      setCurrentNumber(null);
      setGameState('finished');
    }
  };

  const handleAnswer = () => {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    setAnswer(sum);
    setGameState('showingAnswer');
  };

  const handleReset = () => {
    setNumbers([]);
    setCurrentNumber(null);
    setCurrentIndex(0);
    setAnswer(null);
    setGameState('idle');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleHome = () => {
    handleReset();
    setMode('home');
  };

  const handleCheckAgain = () => {
    setGameState('showingNumbers');
  };

  const handleBackFromCheck = () => {
    setGameState('showingAnswer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-indigo-600 mb-6 sm:mb-8">
          Abacus Math Solver
        </h1>

        {/* Home Screen */}
        {mode === 'home' && (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">Choose your mode:</p>
            <button
              onClick={() => setMode('auto')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
            >
              Auto Mode
            </button>
            <button
              onClick={() => setMode('manual')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
            >
              Manual Mode
            </button>
          </div>
        )}

        {/* Auto Mode Setup */}
        {mode === 'auto' && gameState === 'idle' && (
          <div className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Time Interval: <span className="text-indigo-600 font-bold">{interval}s</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={interval}
                onChange={(e) => setInterval(parseFloat(e.target.value))}
                className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0s</span>
                <span>10s</span>
              </div>
            </div>
            <button
              onClick={startGame}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Play size={20} />
              Start
            </button>
            <button
              onClick={handleHome}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition duration-200"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Manual Mode Setup */}
        {mode === 'manual' && gameState === 'idle' && (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">
              Click Next to see each number
            </p>
            <button
              onClick={startGame}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Play size={20} />
              Start
            </button>
            <button
              onClick={handleHome}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition duration-200"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Game Running */}
        {gameState === 'running' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 sm:p-12 text-center shadow-lg">
              <div className="text-white text-6xl sm:text-7xl font-bold">
                {currentNumber}
              </div>
              <div className="text-indigo-100 text-sm mt-4">
                Number {currentIndex + 1} of 8
              </div>
            </div>
            {mode === 'manual' && (
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
              >
                Next
              </button>
            )}
          </div>
        )}

        {/* Finished - Show Answer Button */}
        {gameState === 'finished' && (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-2xl p-12 text-center">
              <p className="text-gray-500 text-lg">Ready to see the answer?</p>
            </div>
            <button
              onClick={handleAnswer}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
            >
              Show Answer
            </button>
          </div>
        )}

        {/* Showing Answer */}
        {gameState === 'showingAnswer' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-12 text-center shadow-lg">
              <p className="text-white text-lg mb-2">Answer:</p>
              <div className="text-white text-6xl sm:text-7xl font-bold">
                {answer}
              </div>
            </div>
            <button
              onClick={handleCheckAgain}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Eye size={20} />
              Check Again
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Reset
            </button>
            <button
              onClick={handleHome}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Home
            </button>
          </div>
        )}

        {/* Showing All Numbers */}
        {gameState === 'showingNumbers' && (
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-2xl p-6 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold text-indigo-600 mb-4 text-center">
                All Numbers:
              </h3>
              <div className="space-y-2">
                {numbers.map((num, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-xl shadow-sm text-center"
                  >
                    <span className="text-2xl font-bold text-gray-800">
                      {num > 0 ? '+' : ''}{num}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      (#{idx + 1})
                    </span>
                  </div>
                ))}
                <div className="border-t-2 border-indigo-600 pt-4 mt-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl text-center">
                    <p className="text-white text-sm mb-1">Sum:</p>
                    <p className="text-white text-3xl font-bold">{answer}</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleBackFromCheck}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition duration-200"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbacusMathSolver;