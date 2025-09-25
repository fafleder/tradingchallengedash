import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Target, Activity, BarChart3, Clock, Eye, EyeOff } from 'lucide-react';
import { Phase } from '../../types/Phase';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';
import { AnalyticsEngine } from '../../utils/analytics';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, LineChart, Line, Tooltip } from 'recharts';

interface TradingDashboardProps {
  phases: Phase[];
}

const TradingDashboard: React.FC<TradingDashboardProps> = ({ phases }) => {
  const { darkMode } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showBalance, setShowBalance] = useState(true);

  // Calculate comprehensive metrics
  const allTrades = phases.flatMap(phase => 
    phase.levels.filter(level => level.completed && level.date)
  );

  const metrics = AnalyticsEngine.calculatePerformanceMetrics(phases);
  const equityCurve = AnalyticsEngine.getEquityCurve(phases);
  const monthlyPerformance = AnalyticsEngine.getMonthlyPerformance(phases);

  // Calculate current balance
  const currentBalance = phases.reduce((total, phase) => {
    return total + phase.initialCapital + phase.levels
      .filter(l => l.completed)
      .reduce((sum, l) => sum + l.pl, 0);
  }, 0);

  // Calculate daily P&L data
  const dailyPnL = useMemo(() => {
    const dailyData: { [key: string]: number } = {};
    
    allTrades.forEach(trade => {
      const date = trade.date;
      if (!dailyData[date]) {
        dailyData[date] = 0;
      }
      dailyData[date] += trade.pl;
    });

    return Object.entries(dailyData)
      .map(([date, pnl]) => ({ date, pnl }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days
  }, [allTrades]);

  // Calculate win rate
  const winRate = allTrades.length > 0 
    ? (allTrades.filter(t => t.pl > 0).length / allTrades.length) * 100 
    : 0;

  // Calculate profit factor
  const totalWins = allTrades.filter(t => t.pl > 0).reduce((sum, t) => sum + t.pl, 0);
  const totalLosses = Math.abs(allTrades.filter(t => t.pl < 0).reduce((sum, t) => sum + t.pl, 0));
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;

  // Calculate average win/loss
  const avgWin = allTrades.filter(t => t.pl > 0).length > 0 
    ? totalWins / allTrades.filter(t => t.pl > 0).length 
    : 0;
  const avgLoss = allTrades.filter(t => t.pl < 0).length > 0 
    ? totalLosses / allTrades.filter(t => t.pl < 0).length 
    : 0;

  // Generate calendar data
  const generateCalendarData = () => {
    const year = selectedYear;
    const month = selectedMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // Create daily P&L map
    const dailyPnLMap: { [key: string]: number } = {};
    allTrades.forEach(trade => {
      const dateKey = trade.date;
      if (!dailyPnLMap[dateKey]) {
        dailyPnLMap[dateKey] = 0;
      }
      dailyPnLMap[dateKey] += trade.pl;
    });
    
    while (current <= lastDay || current.getDay() !== 0) {
      const dateStr = current.toISOString().split('T')[0];
      const pnl = dailyPnLMap[dateStr] || 0;
      
      days.push({
        date: new Date(current),
        dateStr,
        pnl,
        isCurrentMonth: current.getMonth() === month,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        hasData: pnl !== 0
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarData();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Recent trades (last 10)
  const recentTrades = allTrades
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Weekly performance data
  const weeklyData = useMemo(() => {
    const weeks: { [key: string]: { trades: number; pnl: number; week: string } } = {};
    
    allTrades.forEach(trade => {
      const date = new Date(trade.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { 
          trades: 0, 
          pnl: 0, 
          week: `Week ${Math.ceil(date.getDate() / 7)}` 
        };
      }
      
      weeks[weekKey].trades++;
      weeks[weekKey].pnl += trade.pl;
    });

    return Object.values(weeks).slice(-5); // Last 5 weeks
  }, [allTrades]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Top Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {/* Net P&L */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Net P&L</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
          <div className={`text-2xl font-bold ${
            metrics.totalProfitLoss >= 0 
              ? 'text-green-500' 
              : 'text-red-500'
          }`}>
            {showBalance ? formatCurrency(metrics.totalProfitLoss) : '••••••'}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Balance
          </div>
        </div>

        {/* Trade Win % */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Trade Win %</div>
          <div className="text-2xl font-bold text-white">
            {winRate.toFixed(2)}%
          </div>
          <div className="flex items-center mt-2">
            <div className={`w-12 h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${Math.min(winRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Profit Factor */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Profit Factor</div>
          <div className="text-2xl font-bold text-white">
            {profitFactor === 999 ? '∞' : profitFactor.toFixed(2)}
          </div>
          <div className="flex items-center mt-2">
            <div className={`w-12 h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.min((profitFactor / 3) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Avg Win/Loss Trade */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Win/Loss Trade</div>
          <div className="text-2xl font-bold text-white">
            {avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : '∞'}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Ratio
          </div>
        </div>

        {/* Current Streak */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Streak</div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">W</span>
            </div>
            <div className="text-xl font-bold text-white">3</div>
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Wins
          </div>
        </div>

        {/* Trades */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Trades</div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mb-1">
                <span className="text-white text-xs font-bold">{metrics.winningTrades}</span>
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Wins</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center mb-1">
                <span className="text-white text-xs font-bold">{metrics.losingTrades}</span>
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Losses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Net Cumulative P&L */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Daily net cumulative P&L
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurve}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Equity']}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#equityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Net Daily P&L */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Net daily P&L
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyPnL}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Daily P&L']}
                  />
                  <Bar 
                    dataKey="pnl" 
                    fill={(entry: any) => entry.pnl >= 0 ? '#10b981' : '#ef4444'}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calendar View */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {monthNames[selectedMonth]} {selectedYear}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (selectedMonth === 0) {
                      setSelectedMonth(11);
                      setSelectedYear(selectedYear - 1);
                    } else {
                      setSelectedMonth(selectedMonth - 1);
                    }
                  }}
                  className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  ←
                </button>
                <button
                  onClick={() => {
                    if (selectedMonth === 11) {
                      setSelectedMonth(0);
                      setSelectedYear(selectedYear + 1);
                    } else {
                      setSelectedMonth(selectedMonth + 1);
                    }
                  }}
                  className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  →
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className={`p-2 text-center text-xs font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`relative p-2 h-16 border rounded text-center ${
                    day.isCurrentMonth 
                      ? (darkMode ? 'border-gray-600' : 'border-gray-200')
                      : (darkMode ? 'border-gray-700 opacity-50' : 'border-gray-100 opacity-50')
                  } ${
                    day.isToday ? 'ring-2 ring-blue-500' : ''
                  } ${
                    day.hasData 
                      ? (day.pnl >= 0 ? 'bg-green-500/20' : 'bg-red-500/20')
                      : ''
                  }`}
                >
                  <div className={`text-sm ${
                    day.isCurrentMonth 
                      ? (darkMode ? 'text-white' : 'text-gray-900')
                      : (darkMode ? 'text-gray-500' : 'text-gray-400')
                  }`}>
                    {day.date.getDate()}
                  </div>
                  {day.hasData && (
                    <div className={`text-xs font-bold ${
                      day.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatCurrency(day.pnl)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Monthly Stats */}
            <div className="mt-4 grid grid-cols-5 gap-4 text-center">
              {weeklyData.map((week, index) => (
                <div key={index} className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {week.week}
                  </div>
                  <div className={`text-sm font-bold ${
                    week.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatCurrency(week.pnl)}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {week.trades} trades
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Recent Trades & Performance */}
        <div className="space-y-6">
          {/* Recent Trades */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent trades
              </h3>
              <button className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
                Open positions
              </button>
            </div>

            <div className="space-y-3">
              {recentTrades.map((trade, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      trade.pl >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {trade.currencyPair || 'Unknown'}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(trade.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${
                    trade.pl >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatCurrency(trade.pl)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trade Time Performance */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Trade time performance
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <XAxis 
                    dataKey="week" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;