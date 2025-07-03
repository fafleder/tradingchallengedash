import React from 'react';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Award, DollarSign, Activity, Zap } from 'lucide-react';
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
      color: metrics.totalProfitLoss >= 0 ? 'green' : 'red',
      gradient: metrics.totalProfitLoss >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600',
      change: metrics.totalProfitLoss >= 0 ? '+' : '',
      subtitle: 'Portfolio Performance',
    },
    {
      title: 'Win Rate',
      value: formatPercent(metrics.winRate),
      icon: Target,
      color: metrics.winRate >= 60 ? 'green' : metrics.winRate >= 40 ? 'yellow' : 'red',
      gradient: metrics.winRate >= 60 ? 'from-green-500 to-emerald-600' : 'from-yellow-500 to-orange-600',
      subtitle: `${metrics.winningTrades}/${metrics.totalTrades} trades`,
    },
    {
      title: 'Profit Factor',
      value: metrics.profitFactor === Infinity ? '∞' : formatNumber(metrics.profitFactor, 2),
      icon: TrendingUp,
      color: metrics.profitFactor >= 1.5 ? 'green' : metrics.profitFactor >= 1 ? 'yellow' : 'red',
      gradient: metrics.profitFactor >= 1.5 ? 'from-green-500 to-emerald-600' : 'from-yellow-500 to-orange-600',
      subtitle: 'Risk-Reward Efficiency',
    },
    {
      title: 'Max Drawdown',
      value: `${formatCurrency(metrics.maxDrawdown)}`,
      subValue: `(${formatPercent(drawdownPercent)})`,
      icon: TrendingDown,
      color: 'red',
      gradient: 'from-red-500 to-rose-600',
      subtitle: 'Maximum Loss Period',
    },
    {
      title: 'Best Trade',
      value: formatCurrency(metrics.bestTrade),
      icon: Award,
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      subtitle: 'Highest Single Profit',
    },
    {
      title: 'Consistency Score',
      value: `${formatNumber(consistencyScore, 1)}%`,
      icon: Activity,
      color: consistencyScore >= 70 ? 'green' : consistencyScore >= 50 ? 'yellow' : 'red',
      gradient: consistencyScore >= 70 ? 'from-green-500 to-emerald-600' : 'from-yellow-500 to-orange-600',
      subtitle: 'Performance Stability',
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: darkMode ? 'bg-green-900/20' : 'bg-green-50',
          border: darkMode ? 'border-green-700/30' : 'border-green-200',
          text: darkMode ? 'text-green-400' : 'text-green-600',
          icon: darkMode ? 'text-green-400' : 'text-green-600',
        };
      case 'yellow':
        return {
          bg: darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50',
          border: darkMode ? 'border-yellow-700/30' : 'border-yellow-200',
          text: darkMode ? 'text-yellow-400' : 'text-yellow-600',
          icon: darkMode ? 'text-yellow-400' : 'text-yellow-600',
        };
      case 'red':
        return {
          bg: darkMode ? 'bg-red-900/20' : 'bg-red-50',
          border: darkMode ? 'border-red-700/30' : 'border-red-200',
          text: darkMode ? 'text-red-400' : 'text-red-600',
          icon: darkMode ? 'text-red-400' : 'text-red-600',
        };
      default:
        return {
          bg: darkMode ? 'bg-gray-700' : 'bg-gray-50',
          border: darkMode ? 'border-gray-600' : 'border-gray-200',
          text: darkMode ? 'text-white' : 'text-gray-900',
          icon: darkMode ? 'text-gray-400' : 'text-gray-600',
        };
    }
  };

  return (
    <div className={`rounded-xl shadow-lg border p-8 mb-8 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl ${
            darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
          }`}>
            <Zap className={`h-6 w-6 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <div className="ml-4">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Performance Dashboard
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Comprehensive trading analytics based on {metrics.totalTrades} completed trades
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const colorClasses = getColorClasses(card.color);
          
          return (
            <div
              key={index}
              className={`relative p-6 rounded-xl border transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                colorClasses.bg
              } ${colorClasses.border} group overflow-hidden`}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    darkMode ? 'bg-gray-800/50' : 'bg-white/80'
                  } backdrop-blur-sm`}>
                    <Icon className={`h-6 w-6 ${colorClasses.icon}`} />
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${colorClasses.text}`}>
                      {card.change}{card.value}
                    </div>
                    {card.subValue && (
                      <div className={`text-sm ${colorClasses.text} opacity-75`}>
                        {card.subValue}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className={`font-semibold text-lg ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {card.title}
                  </h3>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Breakdown */}
        <div className={`p-6 rounded-xl border ${
          darkMode 
            ? 'bg-gray-700/50 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className={`font-semibold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Trade Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Winning Trades:</span>
              <div className="flex items-center">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mr-3">
                  <div 
                    className="h-2 bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(metrics.winningTrades / metrics.totalTrades) * 100}%` }}
                  />
                </div>
                <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {metrics.winningTrades}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Losing Trades:</span>
              <div className="flex items-center">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mr-3">
                  <div 
                    className="h-2 bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${(metrics.losingTrades / metrics.totalTrades) * 100}%` }}
                  />
                </div>
                <span className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {metrics.losingTrades}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Average Win:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(metrics.averageWin)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Average Loss:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(metrics.averageLoss)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Risk Metrics */}
        <div className={`p-6 rounded-xl border ${
          darkMode 
            ? 'bg-gray-700/50 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className={`font-semibold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Risk Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Average Risk:</span>
              <div className="flex items-center">
                <div className={`w-16 h-2 rounded-full mr-3 ${
                  metrics.averageRiskPercent <= 2 ? 'bg-green-200' : 'bg-yellow-200'
                }`}>
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      metrics.averageRiskPercent <= 2 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(metrics.averageRiskPercent * 20, 100)}%` }}
                  />
                </div>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatPercent(metrics.averageRiskPercent)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Total Risked:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(metrics.totalRisked)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Return on Risk:</span>
              <span className={`font-medium ${
                metrics.returnOnRisk >= 0 
                  ? (darkMode ? 'text-green-400' : 'text-green-600')
                  : (darkMode ? 'text-red-400' : 'text-red-600')
              }`}>
                {formatPercent(metrics.returnOnRisk)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Drawdown %:</span>
              <span className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {formatPercent(drawdownPercent)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className={`mt-8 p-6 rounded-xl border ${
        darkMode ? 'bg-blue-900/20 border-blue-700/30' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-start">
          <div className={`p-3 rounded-xl mr-4 ${
            darkMode ? 'bg-blue-800/50' : 'bg-blue-100'
          }`}>
            <AlertTriangle className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div className="flex-1">
            <h4 className={`font-semibold text-lg mb-3 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
              💡 Performance Insights & Recommendations
            </h4>
            <div className={`space-y-2 text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              {consistencyScore >= 70 && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <p>✅ Excellent consistency score! Your trading results show low volatility and stable performance.</p>
                </div>
              )}
              {metrics.winRate >= 60 && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <p>✅ Strong win rate above 60%. You're demonstrating good trade selection and entry timing.</p>
                </div>
              )}
              {metrics.profitFactor >= 1.5 && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <p>✅ Excellent profit factor above 1.5. Your winners significantly outweigh your losers.</p>
                </div>
              )}
              {drawdownPercent > 20 && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
                  <p>⚠️ High drawdown detected ({drawdownPercent.toFixed(1)}%). Consider reducing position sizes or improving risk management.</p>
                </div>
              )}
              {metrics.profitFactor < 1 && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3" />
                  <p>🚨 Profit factor below 1.0. Review your strategy - you're losing more than you're making on average.</p>
                </div>
              )}
              {metrics.averageRiskPercent > 3 && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                  <p>⚠️ Average risk per trade is high ({metrics.averageRiskPercent.toFixed(1)}%). Consider reducing position sizes for better capital preservation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;