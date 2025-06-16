import React, { useState } from 'react';
import { Calculator, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { RiskManager } from '../../utils/riskManager';

const RiskCalculator: React.FC = () => {
  const { darkMode } = useTheme();
  const [balance, setBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(2);
  const [stopLossPips, setStopLossPips] = useState<number>(20);
  const [pipValue, setPipValue] = useState<number>(0.10);
  const [showCalculator, setShowCalculator] = useState(false);

  const riskAmount = balance * (riskPercent / 100);
  const optimalLotSize = RiskManager.calculateOptimalPositionSize(balance, riskPercent, stopLossPips, pipValue);
  const actualRisk = optimalLotSize * stopLossPips * pipValue;

  return (
    <div className="relative">
      <button
        onClick={() => setShowCalculator(!showCalculator)}
        className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
          darkMode
            ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
        }`}
      >
        <Calculator className="h-4 w-4 mr-1" />
        Risk Calculator
      </button>

      {showCalculator && (
        <div className={`absolute right-0 top-full mt-2 w-80 rounded-lg shadow-lg border z-50 ${
          darkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="p-4">
            <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Position Size Calculator
            </h3>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Account Balance ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={balance}
                  onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Risk Percentage (%)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Stop Loss (Pips)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={stopLossPips}
                  onChange={(e) => setStopLossPips(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Pip Value ($)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={pipValue}
                  onChange={(e) => setPipValue(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Results */}
            <div className={`mt-4 p-3 rounded-md ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Calculation Results
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Risk Amount:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(riskAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Optimal Lot Size:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatNumber(optimalLotSize, 2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Actual Risk:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(actualRisk)}
                  </span>
                </div>
              </div>

              {riskPercent > 3 && (
                <div className={`mt-2 p-2 rounded-md flex items-start ${
                  darkMode ? 'bg-yellow-900/20 text-yellow-200' : 'bg-yellow-50 text-yellow-800'
                }`}>
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs">
                    High risk percentage detected. Consider reducing risk to 2% or less.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskCalculator;