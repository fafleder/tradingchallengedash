import React, { useState } from 'react';
import { Target, TrendingUp, Calendar, Award, Plus, Edit2, Trash2 } from 'lucide-react';
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
  category: 'profit' | 'consistency' | 'risk' | 'growth';
  isCompleted: boolean;
  createdAt: Date;
}

interface GoalTrackerProps {
  phases: Phase[];
}

const GoalTracker: React.FC<GoalTrackerProps> = ({ phases }) => {
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
    },
    {
      id: '2',
      title: 'Maintain 70% Win Rate',
      description: 'Achieve and maintain a 70% win rate over 100 trades',
      targetAmount: 70,
      currentAmount: 0,
      category: 'consistency',
      isCompleted: false,
      createdAt: new Date(),
    },
  ]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: 0,
    deadline: '',
    category: 'profit' as Goal['category'],
  });

  // Calculate current metrics from phases
  const calculateCurrentMetrics = () => {
    const allTrades = phases.flatMap(phase => phase.levels.filter(l => l.completed));
    const totalPL = allTrades.reduce((sum, trade) => sum + trade.pl, 0);
    const winningTrades = allTrades.filter(trade => trade.pl > 0).length;
    const winRate = allTrades.length > 0 ? (winningTrades / allTrades.length) * 100 : 0;
    
    return {
      totalPL,
      winRate,
      totalTrades: allTrades.length,
    };
  };

  const metrics = calculateCurrentMetrics();

  // Update goal progress based on current metrics
  const updateGoalProgress = (goal: Goal): Goal => {
    let currentAmount = goal.currentAmount;
    
    switch (goal.category) {
      case 'profit':
      case 'growth':
        currentAmount = metrics.totalPL;
        break;
      case 'consistency':
        currentAmount = metrics.winRate;
        break;
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

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'profit':
        return <TrendingUp className="h-5 w-5" />;
      case 'consistency':
        return <Target className="h-5 w-5" />;
      case 'risk':
        return <Award className="h-5 w-5" />;
      case 'growth':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'profit':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'consistency':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'risk':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'growth':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className={`rounded-lg shadow-sm border p-6 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Goal Tracker
        </h2>
        <button
          onClick={() => setShowAddGoal(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {updatedGoals.map((goal) => {
          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
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

              <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {goal.description}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {goal.category === 'consistency' 
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
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-lg max-w-md w-full p-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Add New Goal
            </h3>
            
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
                    <option value="profit">Profit</option>
                    <option value="consistency">Consistency</option>
                    <option value="risk">Risk Management</option>
                    <option value="growth">Growth</option>
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