import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, Award, Plus, Settings, Trash2, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Phase } from '../../types/Phase';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: 'profit' | 'consistency' | 'risk' | 'growth' | 'winrate' | 'drawdown' | 'streak' | 'monthly';
  isCompleted: boolean;
  createdAt: Date;
  isEditable: boolean;
}

interface GoalTrackerProps {
  phases: Phase[];
  onGoalsChange?: (goals: Goal[]) => void;
  savedGoals?: Goal[];
}

const GoalTracker: React.FC<GoalTrackerProps> = ({ phases, onGoalsChange, savedGoals = [] }) => {
  const { darkMode } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Reach $50,000 Portfolio',
      description: 'Build portfolio to $50,000 through consistent trading',
      targetAmount: 50000,
      currentAmount: 0,
      deadline: '2024-12-31',
      category: 'growth',
      isCompleted: false,
      createdAt: new Date(),
      isEditable: false,
    },
    {
      id: '2',
      title: 'Maintain 70% Win Rate',
      description: 'Achieve and maintain a 70% win rate over 100 trades',
      targetAmount: 70,
      currentAmount: 0,
      category: 'winrate',
      isCompleted: false,
      createdAt: new Date(),
      isEditable: false,
    },
    {
      id: '3',
      title: 'Keep Drawdown Under 10%',
      description: 'Maintain maximum drawdown below 10% of initial capital',
      targetAmount: 10,
      currentAmount: 0,
      category: 'drawdown',
      isCompleted: false,
      createdAt: new Date(),
      isEditable: false,
    },
    {
      id: '4',
      title: 'Achieve 5-Trade Win Streak',
      description: 'Get 5 consecutive winning trades',
      targetAmount: 5,
      currentAmount: 0,
      category: 'streak',
      isCompleted: false,
      createdAt: new Date(),
      isEditable: false,
    },
    {
      id: '5',
      title: 'Monthly Profit Target',
      description: 'Achieve $5,000 profit this month',
      targetAmount: 5000,
      currentAmount: 0,
      category: 'monthly',
      isCompleted: false,
      createdAt: new Date(),
      isEditable: false,
    },
    {
      id: '6',
      title: 'Risk Management Excellence',
      description: 'Keep average risk per trade below 2%',
      targetAmount: 2,
      currentAmount: 0,
      category: 'risk',
      isCompleted: false,
      createdAt: new Date(),
      isEditable: false,
    },
    {
      id: '7',
      title: 'Consistency Champion',
      description: 'Maintain 80% consistency score over 50 trades',
      targetAmount: 80,
      currentAmount: 0,
      category: 'consistency',
      isCompleted: false,
      createdAt: new Date(),
      isEditable: false,
    },
    {
      id: '8',
      title: 'Profit Factor Excellence',
      description: 'Achieve profit factor above 2.0',
      targetAmount: 2,
      currentAmount: 0,
      category: 'profit',
      isCompleted: false,
      createdAt: new Date(),
      isEditable: false,
    },
  ]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: 0,
    deadline: '',
    category: 'profit' as Goal['category'],
  });

  // Load saved goals on mount
  useEffect(() => {
    if (savedGoals.length > 0) {
      setGoals(savedGoals);
    }
  }, []);

  // Save goals when they change
  useEffect(() => {
    onGoalsChange?.(goals);
  }, [goals, onGoalsChange]);

  // Calculate current metrics from phases
  const calculateCurrentMetrics = () => {
    const allTrades = phases.flatMap(phase => phase.levels.filter(l => l.completed));
    const totalPL = allTrades.reduce((sum, trade) => sum + trade.pl, 0);
    const winningTrades = allTrades.filter(trade => trade.pl > 0).length;
    const winRate = allTrades.length > 0 ? (winningTrades / allTrades.length) * 100 : 0;
    
    // Calculate current win streak
    let currentWinStreak = 0;
    for (let i = allTrades.length - 1; i >= 0; i--) {
      if (allTrades[i].pl > 0) {
        currentWinStreak++;
      } else {
        break;
      }
    }

    // Calculate max drawdown percentage
    const initialCapital = phases.length > 0 ? phases[0].initialCapital : 0;
    let maxDrawdown = 0;
    let peak = initialCapital;
    let runningBalance = initialCapital;
    
    for (const trade of allTrades) {
      runningBalance += trade.pl;
      if (runningBalance > peak) {
        peak = runningBalance;
      }
      const drawdown = ((peak - runningBalance) / initialCapital) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // Calculate monthly profit
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyTrades = allTrades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear;
    });
    const monthlyProfit = monthlyTrades.reduce((sum, trade) => sum + trade.pl, 0);

    // Calculate average risk
    const avgRisk = allTrades.length > 0 
      ? allTrades.reduce((sum, trade) => sum + trade.riskPercent, 0) / allTrades.length 
      : 0;

    // Calculate profit factor
    const totalWins = allTrades.filter(t => t.pl > 0).reduce((sum, t) => sum + t.pl, 0);
    const totalLosses = Math.abs(allTrades.filter(t => t.pl < 0).reduce((sum, t) => sum + t.pl, 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

    // Calculate consistency score (simplified)
    const returns = allTrades.map(trade => trade.pl);
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 100 - (stdDev / Math.abs(mean)) * 100);
    
    return {
      totalPL,
      winRate,
      totalTrades: allTrades.length,
      currentWinStreak,
      maxDrawdownPercent: maxDrawdown,
      monthlyProfit,
      avgRisk,
      profitFactor: profitFactor === Infinity ? 999 : profitFactor,
      consistencyScore: isNaN(consistencyScore) ? 0 : Math.min(100, consistencyScore),
    };
  };

  const metrics = calculateCurrentMetrics();

  // Update goal progress based on current metrics
  const updateGoalProgress = (goal: Goal): Goal => {
    let currentAmount = goal.currentAmount;
    
    switch (goal.category) {
      case 'profit':
        currentAmount = metrics.profitFactor;
        break;
      case 'growth':
        currentAmount = metrics.totalPL;
        break;
      case 'consistency':
      case 'winrate':
        currentAmount = metrics.winRate;
        break;
      case 'drawdown':
        currentAmount = metrics.maxDrawdownPercent;
        // For drawdown, goal is achieved when current is BELOW target
        return {
          ...goal,
          currentAmount,
          isCompleted: currentAmount <= goal.targetAmount,
        };
      case 'streak':
        currentAmount = metrics.currentWinStreak;
        break;
      case 'monthly':
        currentAmount = metrics.monthlyProfit;
        break;
      case 'risk':
        currentAmount = metrics.avgRisk;
        // For risk, goal is achieved when current is BELOW target
        return {
          ...goal,
          currentAmount,
          isCompleted: currentAmount <= goal.targetAmount,
        };
      default:
        break;
    }
    
    return {
      ...goal,
      currentAmount,
      isCompleted: currentAmount >= goal.targetAmount,
    };
  };

  const updatedGoals = goals.map(updateGoalProgress);

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount) return;
    
    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      currentAmount: 0,
      isCompleted: false,
      createdAt: new Date(),
      isEditable: true,
    };
    
    setGoals([...goals, goal]);
    setNewGoal({
      title: '',
      description: '',
      targetAmount: 0,
      deadline: '',
      category: 'profit',
    });
    setShowAddGoal(false);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const handleEditGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  };

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'profit':
      case 'growth':
      case 'monthly':
        return <TrendingUp className="h-5 w-5" />;
      case 'consistency':
      case 'winrate':
        return <Target className="h-5 w-5" />;
      case 'risk':
      case 'drawdown':
        return <Award className="h-5 w-5" />;
      case 'streak':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'profit':
      case 'growth':
      case 'monthly':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'consistency':
      case 'winrate':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'risk':
      case 'drawdown':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'streak':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Close editing when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingGoal && !(event.target as Element).closest('.goal-edit-form')) {
        setEditingGoal(null);
      }
      if (showAddGoal && !(event.target as Element).closest('.add-goal-modal')) {
        setShowAddGoal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingGoal, showAddGoal]);

  return (
    <div className={`rounded-lg shadow-sm border p-6 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Goal Tracker
          </h2>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your trading goals and monitor progress across all phases
          </p>
        </div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Goal
        </button>
      </div>

      {/* Current Performance Summary */}
      <div className={`mb-6 p-4 rounded-lg ${
        darkMode ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Current Performance Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total P/L:</span>
            <span className={`ml-1 font-medium ${
              metrics.totalPL >= 0 
                ? (darkMode ? 'text-green-400' : 'text-green-600')
                : (darkMode ? 'text-red-400' : 'text-red-600')
            }`}>
              {formatCurrency(metrics.totalPL)}
            </span>
          </div>
          <div>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Win Rate:</span>
            <span className={`ml-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {metrics.winRate.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Win Streak:</span>
            <span className={`ml-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {metrics.currentWinStreak}
            </span>
          </div>
          <div>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Drawdown:</span>
            <span className={`ml-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {metrics.maxDrawdownPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {updatedGoals.map((goal) => {
          const progress = goal.category === 'drawdown' || goal.category === 'risk'
            ? goal.targetAmount > 0 ? Math.max(0, 100 - (goal.currentAmount / goal.targetAmount) * 100) : 0
            : goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !goal.isCompleted;
          
          return (
            <div
              key={goal.id}
              className={`p-4 rounded-lg border transition-all ${
                goal.isCompleted
                  ? (darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
                  : isOverdue
                    ? (darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')
                    : (darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')
              }`}
            >
              {editingGoal === goal.id ? (
                <div className="goal-edit-form space-y-3">
                  <input
                    type="text"
                    value={goal.title}
                    onChange={(e) => handleEditGoal(goal.id, { title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                      darkMode
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <textarea
                    value={goal.description}
                    onChange={(e) => handleEditGoal(goal.id, { description: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                      darkMode
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={goal.targetAmount}
                      onChange={(e) => handleEditGoal(goal.id, { targetAmount: parseFloat(e.target.value) || 0 })}
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                        darkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <input
                      type="date"
                      value={goal.deadline || ''}
                      onChange={(e) => handleEditGoal(goal.id, { deadline: e.target.value })}
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                        darkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingGoal(null)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        darkMode
                          ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setEditingGoal(null)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${getCategoryColor(goal.category)}`}>
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div>
                        <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {goal.title}
                        </h3>
                        {goal.isCompleted && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ✅ Completed!
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingGoal(goal.id)}
                        className={`p-1 rounded-full transition-colors ${
                          darkMode
                            ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-600'
                            : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'
                        }`}
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className={`p-1 rounded-full transition-colors ${
                          darkMode
                            ? 'text-gray-400 hover:text-red-400 hover:bg-gray-600'
                            : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {goal.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {goal.category === 'consistency' || goal.category === 'winrate' || goal.category === 'drawdown' || goal.category === 'risk'
                          ? `${goal.currentAmount.toFixed(1)}% / ${goal.targetAmount}%`
                          : `${formatCurrency(goal.currentAmount)} / ${formatCurrency(goal.targetAmount)}`
                        }
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          goal.isCompleted 
                            ? 'bg-green-500' 
                            : progress > 75 
                              ? 'bg-blue-500' 
                              : 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {Math.min(progress, 100).toFixed(1)}% complete
                      </span>
                      {goal.deadline && (
                        <span className={`${
                          isOverdue 
                            ? 'text-red-500' 
                            : (darkMode ? 'text-gray-400' : 'text-gray-500')
                        }`}>
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`add-goal-modal rounded-lg shadow-lg max-w-md w-full p-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Add New Goal
              </h3>
              <button
                onClick={() => setShowAddGoal(false)}
                className={`p-1 rounded-full transition-colors ${
                  darkMode
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., Reach $10,000 profit"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                  placeholder="Describe your goal..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Target Amount
                  </label>
                  <input
                    type="number"
                    value={newGoal.targetAmount || ''}
                    onChange={(e) => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value) || 0})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="10000"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Category
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value as Goal['category']})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="profit">Profit Factor</option>
                    <option value="growth">Portfolio Growth</option>
                    <option value="consistency">Consistency</option>
                    <option value="risk">Risk Management</option>
                    <option value="winrate">Win Rate</option>
                    <option value="drawdown">Drawdown</option>
                    <option value="streak">Win Streak</option>
                    <option value="monthly">Monthly Target</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddGoal(false)}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Celebrations */}
      {updatedGoals.some(goal => goal.isCompleted) && (
        <div className={`mt-6 p-4 rounded-lg border ${
          darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
        }`}>
          <h4 className={`font-medium mb-2 ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
            🎉 Congratulations!
          </h4>
          <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-700'}`}>
            You've completed {updatedGoals.filter(g => g.isCompleted).length} goal(s)! 
            Keep up the excellent work!
          </p>
        </div>
      )}
    </div>
  );
};

export default GoalTracker;