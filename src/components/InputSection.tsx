import React, { useState, useRef } from 'react';
import { Plus, DollarSign, Target, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AppSettings } from '../types/Phase';

interface InputSectionProps {
  onStartNewPhase: (initialCapital: number, levelsPerPhase: number, goalTarget?: number) => void;
  settings: AppSettings;
  offlineStack?: number;
}

const InputSection: React.FC<InputSectionProps> = ({ 
  onStartNewPhase, 
  settings,
  offlineStack = 0
}) => {
  const { darkMode } = useTheme();
  const [initialCapital, setInitialCapital] = useState<string>('');
  const [levelsPerPhase, setLevelsPerPhase] = useState<string>('');
  const [flipTarget, setFlipTarget] = useState<string>('2'); // Default 2x flip
  const [cycleType, setCycleType] = useState<'micro' | 'small'>('micro');

  const handleStartNewPhase = () => {
    const capital = parseFloat(initialCapital);
    const levels = parseInt(levelsPerPhase);
    const target = parseFloat(flipTarget);

    if (isNaN(capital) || capital <= 0) {
      alert('Please enter a valid initial capital amount.');
      return;
    }

    // Validate micro capital rules
    if (cycleType === 'micro' && (capital < 20 || capital > 50)) {
      alert('Micro cycles must be between $20-$50 for proper risk management.');
      return;
    }

    if (cycleType === 'small' && capital < 100) {
      alert('Small cycles require minimum $100 capital.');
      return;
    }

    if (isNaN(levels) || levels <= 0) {
      alert('Please enter a valid number of levels per phase.');
      return;
    }

    if (target < 2 || target > 5) {
      alert('Flip target should be between 2x and 5x for realistic goals.');
      return;
    }

    const goalAmount = capital * target;
    onStartNewPhase(capital, levels, goalAmount);
    setInitialCapital('');
    setLevelsPerPhase('');
    setFlipTarget('2');
  };

  const getRecommendedCapital = () => {
    if (offlineStack >= 200) return 'Prop Challenge Ready! ($150-$200)';
    if (offlineStack >= 100) return 'Small Cycle Ready ($100)';
    if (offlineStack >= 50) return 'Enhanced Micro ($50)';
    return 'Standard Micro ($20-$50)';
  };

  return (
    <div className={`rounded-lg shadow-sm border p-6 mb-6 transition-all hover:shadow-md ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Start New Flip Cycle
        </h3>
        <div className={`text-sm px-3 py-1 rounded-full ${
          darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
        }`}>
          Stack: ${offlineStack.toFixed(0)} • {getRecommendedCapital()}
        </div>
      </div>

      {/* Cycle Type Selection */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Cycle Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCycleType('micro')}
            className={`p-3 rounded-lg border text-left transition-all ${
              cycleType === 'micro'
                ? (darkMode ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50')
                : (darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white')
            }`}
          >
            <div className="flex items-center mb-1">
              <Zap className="h-4 w-4 mr-2 text-orange-500" />
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Micro Flip
              </span>
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              $20-$50 • High Risk • Fast Flips
            </div>
          </button>
          <button
            type="button"
            onClick={() => setCycleType('small')}
            className={`p-3 rounded-lg border text-left transition-all ${
              cycleType === 'small'
                ? (darkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50')
                : (darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white')
            }`}
          >
            <div className="flex items-center mb-1">
              <Target className="h-4 w-4 mr-2 text-blue-500" />
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Small Stack
              </span>
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              $100+ • Controlled Risk • Bigger Flips
            </div>
          </button>
        </div>
      </div>

      {/* Quick Capital Buttons */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Quick Start Options
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[20, 50, 100, 200].map(amount => (
            <button
              key={amount}
              type="button"
              onClick={() => setInitialCapital(amount.toString())}
              disabled={cycleType === 'micro' && amount > 50}
              className={`p-2 text-sm rounded-md border transition-colors ${
                initialCapital === amount.toString()
                  ? (darkMode ? 'border-green-500 bg-green-900/20 text-green-400' : 'border-green-500 bg-green-50 text-green-700')
                  : (darkMode ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50')
              } ${(cycleType === 'micro' && amount > 50) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              ${amount}
            </button>
          ))}
        </div>
      </h3>
      
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="flex-1">
          <label htmlFor="initialCapital" className={`block text-sm font-medium mb-1 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Starting Capital ($) {cycleType === 'micro' ? '($20-$50)' : '($100+)'}
          </label>
          <input
            type="number"
            id="initialCapital" 
            min={cycleType === 'micro' ? "20" : "100"}
            max={cycleType === 'micro' ? "50" : "1000"}
            step="0.01"
            value={initialCapital}
            onChange={(e) => setInitialCapital(e.target.value)}
            placeholder={cycleType === 'micro' ? "20-50" : "100+"}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'border-gray-300 placeholder-gray-500'
            }`}
          />
        </div>
        
        <div className="flex-1">
          <label htmlFor="flipTarget" className={`block text-sm font-medium mb-1 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Flip Target (Multiplier)
          </label>
          <select
            id="flipTarget"
            value={flipTarget}
            onChange={(e) => setFlipTarget(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'border-gray-300 placeholder-gray-500'
            }`}
          >
            <option value="2">2x (Double)</option>
            <option value="3">3x (Triple)</option>
            <option value="4">4x (Quadruple)</option>
            <option value="5">5x (Quintuple)</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label htmlFor="levelsPerPhase" className={`block text-sm font-medium mb-1 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Max Trades
          </label>
          <input
            type="number"
            id="levelsPerPhase"
            min="5"
            max="20"
            value={levelsPerPhase}
            onChange={(e) => setLevelsPerPhase(e.target.value)}
            placeholder="10-15"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'border-gray-300 placeholder-gray-500'
            }`}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleStartNewPhase}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Zap className="h-4 w-4 mr-2" />
            Start Flip Cycle
          </button>
        </div>
      </div>

      {/* Cycle Rules Reminder */}
      <div className={`mt-4 p-3 rounded-lg border ${
        darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
          <strong>Cycle Rules:</strong> Max $2 SL • 3 trades/day limit • 3 losses = stop • 
          {flipTarget}x target = ${initialCapital ? (parseFloat(initialCapital) * parseFloat(flipTarget)).toFixed(0) : '0'}
        </div>
      </div>
    </div>
  );
};

export default InputSection;