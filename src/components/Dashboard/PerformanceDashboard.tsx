import React from 'react';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Award, DollarSign } from 'lucide-react';
import { PerformanceMetrics } from '../../types/Phase';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';
import { useTheme } from '../../contexts/ThemeContext';
import { AnalyticsEngine } from '../../utils/analytics';

interface PerformanceDashboardProps {
  metrics: PerformanceMetrics;
  phases?: any[];
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ metrics, phases = [] }) => {
  const { darkMode } = useTheme();
  
  const drawdownPercent = AnalyticsEngine.getDrawdownPercentage(phases);
  const consistencyScore = AnalyticsEngine.getConsistencyScore(phases);
  
  const cards = [
    {
      title: 'Total P/L',
      value: formatCurrency(metrics.totalProfitLoss),
      icon: DollarSign,
      color: metrics.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: metrics.totalProfitLoss >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Win Rate',
      value: formatPercent(metrics.winRate),
      icon: Target,
      color: metrics.winRate >= 60 ? 'text-green-600' : metrics.winRate >= 40 ? 'text-yellow-600' : 'text-red-600',
      bgColor: metrics.winRate >= 60 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Profit Factor',
      value: metrics.profitFactor === Infinity ? '∞' : formatNumber(metrics.profitFactor, 2),
      icon: TrendingUp,
      color: metrics.profitFactor >= 1.5 ? 'text-green-600' : metrics.profitFactor >= 1 ? 'text-yellow-600' : 'text-red-600',
      bgColor: metrics.profitFactor >= 1.5 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Max Drawdown',
      value: `${formatCurrency(metrics.maxDrawdown)} (${formatPercent(drawdownPercent)})`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Best Trade',
      value: formatCurrency(metrics.bestTrade),
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Consistency Score',
      value: `${formatNumber(consistencyScore, 1)}%`,
      icon: AlertTriangle,
      color: consistencyScore >= 70 ? 'text-green-600' : consistencyScore >= 50 ? 'text-yellow-600' : 'text-red-600',
      bgColor: consistencyScore >= 70 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20',
    },
  ];

  return (
    <div className={`rounded-lg shadow-sm border p-6 mb-6 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Performance Dashboard
        </h2>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Based on {metrics.totalTrades} completed trades
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 grid-responsive">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                  : `${card.bgColor} border-gray-200 hover:shadow-lg`
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {card.title}
                  </p>
                  <p className={`text-lg font-bold mt-1 text-mobile-lg ${
                    darkMode ? 'text-white' : card.color
                  }`}>
                    {card.value}
                  </p>
                </div>
                <Icon className={`h-8 w-8 ${
                  darkMode ? 'text-gray-400' : card.color
                }`} />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 grid-responsive">
        <div className={`p-4 rounded-lg border p-xs-mobile ${
          darkMode 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Trade Breakdown
          </h3>
          <div className="space-y-1 text-sm text-xs-mobile">
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Winning Trades:</span>
              <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                {metrics.winningTrades}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Losing Trades:</span>
              <span className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {metrics.losingTrades}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Average Win:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(metrics.averageWin)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Average Loss:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(metrics.averageLoss)}
              </span>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border p-xs-mobile ${
          darkMode 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Risk Metrics
          </h3>
          <div className="space-y-1 text-sm text-xs-mobile">
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Average Risk:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatPercent(metrics.averageRiskPercent)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Total Risked:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(metrics.totalRisked)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Return on Risk:</span>
              <span className={`font-medium ${
                metrics.returnOnRisk >= 0 
                  ? (darkMode ? 'text-green-400' : 'text-green-600')
                  : (darkMode ? 'text-red-400' : 'text-red-600')
              }`}>
                {formatPercent(metrics.returnOnRisk)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Drawdown %:</span>
              <span className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {formatPercent(drawdownPercent)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className={`mt-4 p-4 rounded-lg border ${
        darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
      }`}>
        <h4 className={`font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
          💡 Performance Insights
        </h4>
        <div className="space-y-1 text-sm">
          {consistencyScore >= 70 && (
            <p className={darkMode ? 'text-blue-200' : 'text-blue-700'}>
              ✅ Excellent consistency score! Your trading results show low volatility.
            </p>
          )}
          {metrics.winRate >= 60 && (
            <p className={darkMode ? 'text-blue-200' : 'text-blue-700'}>
              ✅ Strong win rate above 60%. You're selecting good trade setups.
            </p>
          )}
          {drawdownPercent > 20 && (
            <p className={darkMode ? 'text-yellow-200' : 'text-yellow-700'}>
              ⚠️ High drawdown detected. Consider reducing position sizes or improving risk management.
            </p>
          )}
          {metrics.profitFactor < 1 && (
            <p className={darkMode ? 'text-red-200' : 'text-red-700'}>
              🚨 Profit factor below 1.0. Review your strategy - you're losing more than you're making.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;