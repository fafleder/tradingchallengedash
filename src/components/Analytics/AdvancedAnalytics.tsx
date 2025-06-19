import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, TrendingUp, Target, Award, AlertCircle } from 'lucide-react';
import { Phase } from '../../types/Phase';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface AdvancedAnalyticsProps {
  phases: Phase[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ phases }) => {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'patterns' | 'time' | 'strategy' | 'goals'>('patterns');

  const allTrades = phases.flatMap(phase => 
    phase.levels.filter(level => level.completed && level.date)
  );

  // Pattern recognition - moved to top
  const getPatternAnalysis = () => {
    const patterns = {
      consecutiveWins: 0,
      consecutiveLosses: 0,
      bestWinStreak: 0,
      worstLossStreak: 0,
      recoveryRate: 0,
      breakoutSuccess: 0,
    };

    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let lossesFollowedByWins = 0;
    let totalLosses = 0;

    allTrades.forEach((trade, index) => {
      if (trade.pl > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
        
        // Check if this win follows a loss
        if (index > 0 && allTrades[index - 1].pl < 0) {
          lossesFollowedByWins++;
        }
      } else if (trade.pl < 0) {
        currentLossStreak++;
        currentWinStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
        totalLosses++;
      }
    });

    patterns.bestWinStreak = maxWinStreak;
    patterns.worstLossStreak = maxLossStreak;
    patterns.recoveryRate = totalLosses > 0 ? (lossesFollowedByWins / totalLosses) * 100 : 0;

    return patterns;
  };

  // Time-based analysis
  const getTimeAnalysis = () => {
    const dayOfWeekData: { [key: string]: { trades: number; profit: number; winRate: number } } = {
      'Monday': { trades: 0, profit: 0, winRate: 0 },
      'Tuesday': { trades: 0, profit: 0, winRate: 0 },
      'Wednesday': { trades: 0, profit: 0, winRate: 0 },
      'Thursday': { trades: 0, profit: 0, winRate: 0 },
      'Friday': { trades: 0, profit: 0, winRate: 0 },
      'Saturday': { trades: 0, profit: 0, winRate: 0 },
      'Sunday': { trades: 0, profit: 0, winRate: 0 },
    };

    const hourlyData: { [key: number]: { trades: number; profit: number; wins: number } } = {};

    allTrades.forEach(trade => {
      const date = new Date(trade.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

      // Day of week analysis
      dayOfWeekData[dayName].trades++;
      dayOfWeekData[dayName].profit += trade.pl;

      // Hourly analysis (if entry time is available)
      if (trade.entryTime) {
        const entryHour = parseInt(trade.entryTime.split(':')[0]);
        if (!hourlyData[entryHour]) {
          hourlyData[entryHour] = { trades: 0, profit: 0, wins: 0 };
        }
        hourlyData[entryHour].trades++;
        hourlyData[entryHour].profit += trade.pl;
        if (trade.pl > 0) hourlyData[entryHour].wins++;
      }
    });

    // Calculate win rates
    Object.keys(dayOfWeekData).forEach(day => {
      const wins = allTrades.filter(t => {
        const dayName = new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' });
        return dayName === day && t.pl > 0;
      }).length;
      dayOfWeekData[day].winRate = dayOfWeekData[day].trades > 0 ? (wins / dayOfWeekData[day].trades) * 100 : 0;
    });

    return {
      dayOfWeek: Object.entries(dayOfWeekData).map(([day, data]) => ({
        day: day.substring(0, 3), // Shortened for better display
        fullDay: day,
        ...data
      })),
      hourly: Object.entries(hourlyData).map(([hour, data]) => ({
        hour: parseInt(hour),
        ...data,
        winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0
      })).sort((a, b) => a.hour - b.hour)
    };
  };

  // Strategy correlation analysis
  const getStrategyAnalysis = () => {
    const strategyData: { [key: string]: { trades: number; profit: number; wins: number; avgRisk: number } } = {};

    allTrades.forEach(trade => {
      const strategy = trade.strategy || 'Unknown';
      if (!strategyData[strategy]) {
        strategyData[strategy] = { trades: 0, profit: 0, wins: 0, avgRisk: 0 };
      }
      strategyData[strategy].trades++;
      strategyData[strategy].profit += trade.pl;
      strategyData[strategy].avgRisk += trade.riskPercent;
      if (trade.pl > 0) strategyData[strategy].wins++;
    });

    return Object.entries(strategyData).map(([strategy, data]) => ({
      strategy,
      trades: data.trades,
      profit: data.profit,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      avgRisk: data.trades > 0 ? data.avgRisk / data.trades : 0,
      profitPerTrade: data.trades > 0 ? data.profit / data.trades : 0
    })).sort((a, b) => b.profit - a.profit);
  };

  // Goal tracking analysis
  const getGoalAnalysis = () => {
    const goals = phases.filter(p => p.goalTarget).map(phase => {
      const currentBalance = phase.initialCapital + phase.levels
        .filter(l => l.completed)
        .reduce((sum, l) => sum + l.pl, 0);
      
      const progress = phase.goalTarget ? (currentBalance / phase.goalTarget) * 100 : 0;
      const remainingAmount = phase.goalTarget ? phase.goalTarget - currentBalance : 0;
      
      return {
        phase: phase.phaseNumber,
        target: phase.goalTarget || 0,
        current: currentBalance,
        progress,
        remainingAmount,
        isAchieved: progress >= 100
      };
    });

    return goals;
  };

  const patternAnalysis = getPatternAnalysis();
  const timeAnalysis = getTimeAnalysis();
  const strategyAnalysis = getStrategyAnalysis();
  const goalAnalysis = getGoalAnalysis();

  const tabs = [
    { id: 'patterns' as const, label: 'Pattern Recognition', icon: TrendingUp },
    { id: 'time' as const, label: 'Time Analysis', icon: Clock },
    { id: 'strategy' as const, label: 'Strategy Performance', icon: Target },
    { id: 'goals' as const, label: 'Goal Tracking', icon: Award },
  ];

  return (
    <div className={`rounded-lg shadow-sm border p-6 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Advanced Analytics
      </h2>

      {/* Pattern Recognition - Always visible at top */}
      <div className="mb-6">
        <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Pattern Recognition
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-green-700'}`}>
                  Best Win Streak
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-green-900'}`}>
                  {patternAnalysis.bestWinStreak}
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-red-700'}`}>
                  Worst Loss Streak
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-red-900'}`}>
                  {patternAnalysis.worstLossStreak}
                </p>
              </div>
              <AlertCircle className={`h-8 w-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                  Recovery Rate
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-blue-900'}`}>
                  {patternAnalysis.recoveryRate.toFixed(1)}%
                </p>
              </div>
              <Target className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Time Analysis Tab */}
      {activeTab === 'time' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Day of Week Performance
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeAnalysis.dayOfWeek}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis 
                      dataKey="day" 
                      stroke={darkMode ? '#9ca3af' : '#6b7280'} 
                      fontSize={12}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        color: darkMode ? '#ffffff' : '#000000',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'profit') return [formatCurrency(value), 'Profit'];
                        if (name === 'winRate') return [`${value.toFixed(1)}%`, 'Win Rate'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => timeAnalysis.dayOfWeek.find(d => d.day === label)?.fullDay || label}
                    />
                    <Bar dataKey="profit" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {timeAnalysis.hourly.length > 0 && (
              <div>
                <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Hourly Performance
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeAnalysis.hourly}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="hour" stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                      <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                          border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '6px',
                          color: darkMode ? '#ffffff' : '#000000',
                        }}
                      />
                      <Line type="monotone" dataKey="winRate" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Best performing times */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Performance Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Best Trading Day:</span>
                <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {timeAnalysis.dayOfWeek.reduce((best, day) => 
                    day.winRate > best.winRate ? day : best
                  ).fullDay}
                </span>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Most Profitable Day:</span>
                <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {timeAnalysis.dayOfWeek.reduce((best, day) => 
                    day.profit > best.profit ? day : best
                  ).fullDay}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategy Analysis Tab */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Strategy Performance Comparison
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strategyAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="strategy" stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        color: darkMode ? '#ffffff' : '#000000',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'profit') return [formatCurrency(value), 'Total Profit'];
                        if (name === 'winRate') return [`${value.toFixed(1)}%`, 'Win Rate'];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="winRate" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Strategy Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={strategyAnalysis}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ strategy, trades }) => `${strategy}: ${trades}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="trades"
                    >
                      {strategyAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Strategy details */}
          <div className="space-y-3">
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Strategy Details
            </h4>
            {strategyAnalysis.map((strategy, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {strategy.strategy}
                  </h5>
                  <span className={`text-sm px-2 py-1 rounded ${
                    strategy.profit >= 0
                      ? (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                      : (darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                  }`}>
                    {formatCurrency(strategy.profit)}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Trades:</span>
                    <span className={`ml-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {strategy.trades}
                    </span>
                  </div>
                  <div>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Win Rate:</span>
                    <span className={`ml-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {strategy.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Avg Risk:</span>
                    <span className={`ml-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {strategy.avgRisk.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Profit/Trade:</span>
                    <span className={`ml-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(strategy.profitPerTrade)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Tracking Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          {goalAnalysis.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No goals set yet</p>
              <p className="text-sm">Set goal targets when creating new phases to track your progress</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goalAnalysis.map((goal, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Phase {goal.phase} Goal
                    </h4>
                    {goal.isAchieved && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      }`}>
                        Achieved! 🎉
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Target:</span>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(goal.target)}
                      </p>
                    </div>
                    <div>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current:</span>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(goal.current)}
                      </p>
                    </div>
                    <div>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remaining:</span>
                      <p className={`font-medium ${
                        goal.remainingAmount <= 0 
                          ? (darkMode ? 'text-green-400' : 'text-green-600')
                          : (darkMode ? 'text-white' : 'text-gray-900')
                      }`}>
                        {goal.remainingAmount <= 0 ? 'Goal Achieved!' : formatCurrency(goal.remainingAmount)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {Math.min(goal.progress, 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          goal.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalytics;