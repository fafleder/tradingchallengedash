import React from 'react';
import { Check, X, AlertTriangle, FileText } from 'lucide-react';
import { Level } from '../types/Phase';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { useTheme } from '../contexts/ThemeContext';
import { RiskManager } from '../utils/riskManager';

interface TradeTableProps {
  levels: Level[];
  onUpdateLevel: (levelIndex: number, updates: Partial<Level>) => void;
  onToggleCompletion: (levelIndex: number) => void;
  riskWarningThreshold: number;
}

const TradeTable: React.FC<TradeTableProps> = ({ 
  levels, 
  onUpdateLevel,
  onToggleCompletion,
  riskWarningThreshold
}) => {
  const { darkMode } = useTheme();

  const strategies = ['Scalping', 'Day Trading', 'Swing Trading', 'Breakout', 'Reversal', 'Trend Following'];
  const currencyPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP'];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <tr>
            <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-10 ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Level
            </th>
            <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-32 ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Date
            </th>
            <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-28 ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Balance
            </th>
            <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-24 ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Risk %
            </th>
            <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-20 ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Lot
            </th>
            <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-20 ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Pips
            </th>
            <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-16 ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              R:R
            </th>
            <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-28 ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Target
            </th>
            <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-24 ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              P/L
            </th>
            <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-32 ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Strategy
            </th>
            <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-32 ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Pair
            </th>
            <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-20 ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Status
            </th>
            <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-8 ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Notes
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${
          darkMode 
            ? 'bg-gray-800 divide-gray-700' 
            : 'bg-white divide-gray-200'
        }`}>
          {levels.map((level, index) => {
            const warnings = RiskManager.checkRiskWarnings(level, riskWarningThreshold);
            const hasWarnings = warnings.length > 0;
            
            return (
              <tr 
                key={index} 
                className={`transition-colors ${
                  level.completed 
                    ? (darkMode ? 'bg-green-900/20' : 'bg-green-50')
                    : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
                }`}
              >
                <td className={`px-2 py-2 whitespace-nowrap text-sm font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <div className="flex items-center">
                    {level.levelNumber}
                    {hasWarnings && (
                      <div className="relative group">
                        <AlertTriangle 
                          className="h-3 w-3 ml-1 text-yellow-500 cursor-help" 
                        />
                        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap ${
                          darkMode ? 'bg-gray-900 text-white' : 'bg-black text-white'
                        }`}>
                          {warnings.join(', ')}
                          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent ${
                            darkMode ? 'border-t-gray-900' : 'border-t-black'
                          }`}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm">
                  <input
                    type="date"
                    value={level.date}
                    onChange={(e) => onUpdateLevel(index, { date: e.target.value })}
                    className={`w-full px-1 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300'
                    }`}
                  />
                </td>
                <td className={`px-2 py-2 whitespace-nowrap text-sm font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatCurrency(level.balance)}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm">
                  <div className="flex flex-col">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={level.riskPercent || ''}
                      onChange={(e) => onUpdateLevel(index, { riskPercent: parseFloat(e.target.value) || 0 })}
                      placeholder="Enter %"
                      className={`w-full px-1 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                        level.riskPercent > riskWarningThreshold
                          ? (darkMode ? 'border-yellow-500 bg-yellow-900/20' : 'border-yellow-500 bg-yellow-50')
                          : (darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300')
                      }`}
                    />
                    <span className={`text-xs mt-0.5 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatCurrency(level.riskedAmount || 0)}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={level.lotSize || 0.01}
                    onChange={(e) => onUpdateLevel(index, { lotSize: parseFloat(e.target.value) || 0.01 })}
                    placeholder="Lot"
                    className={`w-full px-1 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300'
                    }`}
                  />
                </td>
                <td className={`px-2 py-2 whitespace-nowrap text-sm ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatNumber(level.pipsToRisk || 0, 1)}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm">
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={level.rewardMultiple || ''}
                    onChange={(e) => onUpdateLevel(index, { rewardMultiple: parseFloat(e.target.value) || 0 })}
                    placeholder="R:R"
                    className={`w-full px-1 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                      level.rewardMultiple < 1
                        ? (darkMode ? 'border-yellow-500 bg-yellow-900/20' : 'border-yellow-500 bg-yellow-50')
                        : (darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300')
                    }`}
                  />
                </td>
                <td className={`px-2 py-2 whitespace-nowrap text-sm ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatCurrency(level.profitTarget || 0)}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm">
                  <input
                    type="number"
                    step="0.01"
                    value={level.pl || ''}
                    onChange={(e) => onUpdateLevel(index, { pl: parseFloat(e.target.value) || 0 })}
                    placeholder="P/L"
                    className={`w-full px-1 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                      level.pl > 0 
                        ? (darkMode ? 'border-green-500 bg-green-900/20 text-green-400' : 'border-green-300 bg-green-50 text-green-700')
                        : level.pl < 0 
                          ? (darkMode ? 'border-red-500 bg-red-900/20 text-red-400' : 'border-red-300 bg-red-50 text-red-700')
                          : (darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300')
                    }`}
                  />
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm">
                  <select
                    value={level.strategy || ''}
                    onChange={(e) => onUpdateLevel(index, { strategy: e.target.value })}
                    className={`w-full px-1 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Strategy</option>
                    {strategies.map(strategy => (
                      <option key={strategy} value={strategy}>{strategy}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm">
                  <select
                    value={level.currencyPair || ''}
                    onChange={(e) => onUpdateLevel(index, { currencyPair: e.target.value })}
                    className={`w-full px-1 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Pair</option>
                    {currencyPairs.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm">
                  <button
                    onClick={() => onToggleCompletion(index)}
                    className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded transition-colors ${
                      level.completed
                        ? (darkMode 
                            ? 'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                            : 'bg-green-100 text-green-800 hover:bg-green-200')
                        : (darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200')
                    }`}
                  >
                    {level.completed ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Done
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Mark
                      </>
                    )}
                  </button>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm">
                  <button
                    onClick={() => {
                      const notes = prompt('Enter trade notes:', level.notes || '');
                      if (notes !== null) {
                        onUpdateLevel(index, { notes });
                      }
                    }}
                    className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                      level.notes 
                        ? (darkMode ? 'text-blue-400' : 'text-blue-600')
                        : (darkMode ? 'text-gray-400' : 'text-gray-500')
                    }`}
                    title={level.notes || 'Add notes'}
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TradeTable;