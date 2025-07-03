import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, Target, Eye, List } from 'lucide-react';
import { Phase } from '../../types/Phase';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

interface CalendarHeatmapProps {
  phases: Phase[];
}

interface DayData {
  date: string;
  pnl: number;
  trades: number;
  winRate: number;
  notes?: string;
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ phases }) => {
  const { darkMode } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Process trade data by day
  const dayData = useMemo(() => {
    const dataMap = new Map<string, DayData>();
    
    phases.forEach(phase => {
      phase.levels.filter(level => level.completed && level.date).forEach(level => {
        const dateKey = level.date;
        const existing = dataMap.get(dateKey) || {
          date: dateKey,
          pnl: 0,
          trades: 0,
          winRate: 0,
          notes: ''
        };
        
        existing.pnl += level.pl;
        existing.trades += 1;
        if (level.notes) {
          existing.notes = existing.notes ? `${existing.notes}; ${level.notes}` : level.notes;
        }
        
        dataMap.set(dateKey, existing);
      });
    });

    // Calculate win rates
    dataMap.forEach((data, dateKey) => {
      const dayTrades = phases.flatMap(phase => 
        phase.levels.filter(level => level.completed && level.date === dateKey)
      );
      const wins = dayTrades.filter(trade => trade.pl > 0).length;
      data.winRate = dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0;
    });

    return dataMap;
  }, [phases]);

  // Get color classes based on P&L
  const getHeatmapClasses = (pnl: number): string => {
    if (pnl === 0) return darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200';
    
    const maxPnl = Math.max(...Array.from(dayData.values()).map(d => Math.abs(d.pnl)));
    const intensity = Math.min(Math.abs(pnl) / maxPnl, 1);
    
    if (pnl > 0) {
      // Green for profits with varying intensity
      if (intensity > 0.8) return 'bg-green-600 border-green-500';
      if (intensity > 0.6) return 'bg-green-500 border-green-400';
      if (intensity > 0.4) return 'bg-green-400 border-green-300';
      if (intensity > 0.2) return 'bg-green-300 border-green-200';
      return 'bg-green-200 border-green-100';
    } else {
      // Red for losses with varying intensity
      if (intensity > 0.8) return 'bg-red-600 border-red-500';
      if (intensity > 0.6) return 'bg-red-500 border-red-400';
      if (intensity > 0.4) return 'bg-red-400 border-red-300';
      if (intensity > 0.2) return 'bg-red-300 border-red-200';
      return 'bg-red-200 border-red-100';
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      const dateStr = current.toISOString().split('T')[0];
      const data = dayData.get(dateStr);
      
      days.push({
        date: new Date(current),
        dateStr,
        data,
        isCurrentMonth: current.getMonth() === month,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const sortedDayData = Array.from(dayData.values()).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className={`rounded-lg shadow-sm border p-6 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Trading Calendar Heatmap
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
              darkMode
                ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            {viewMode === 'calendar' ? <List className="h-4 w-4 mr-1" /> : <Calendar className="h-4 w-4 mr-1" />}
            {viewMode === 'calendar' ? 'List View' : 'Calendar View'}
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth('prev')}
              className={`p-2 rounded-full transition-colors ${
                darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            
            <button
              onClick={() => navigateMonth('next')}
              className={`p-2 rounded-full transition-colors ${
                darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={`p-2 text-center text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const heatmapClasses = day.data ? getHeatmapClasses(day.data.pnl) : '';
              const baseClasses = day.data 
                ? heatmapClasses
                : (darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200');
              
              return (
                <div
                  key={index}
                  onClick={() => day.data && setSelectedDay(day.data)}
                  className={`relative p-2 h-20 border rounded-lg transition-all ${baseClasses} ${
                    day.isCurrentMonth ? '' : 'opacity-50'
                  } ${
                    day.data ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''
                  } ${
                    day.isToday ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    day.data && Math.abs(day.data.pnl) > 0
                      ? 'text-white'
                      : day.isCurrentMonth 
                        ? (darkMode ? 'text-white' : 'text-gray-900')
                        : (darkMode ? 'text-gray-500' : 'text-gray-400')
                  }`}>
                    {day.date.getDate()}
                  </div>
                  
                  {day.data && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="text-xs font-bold text-white">
                        {formatCurrency(day.data.pnl)}
                      </div>
                      <div className="text-xs text-white opacity-90">
                        {day.data.trades} trade{day.data.trades !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>High Loss</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-300 rounded"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Low Loss</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>No Trades</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-300 rounded"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Low Profit</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>High Profit</span>
            </div>
          </div>

          {/* Summary Stats */}
          {dayData.size > 0 && (
            <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Trading Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Trading Days:</span>
                  <span className={`ml-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {dayData.size}
                  </span>
                </div>
                <div>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Trades:</span>
                  <span className={`ml-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {Array.from(dayData.values()).reduce((sum, d) => sum + d.trades, 0)}
                  </span>
                </div>
                <div>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total P&L:</span>
                  <span className={`ml-1 font-medium ${
                    Array.from(dayData.values()).reduce((sum, d) => sum + d.pnl, 0) >= 0
                      ? (darkMode ? 'text-green-400' : 'text-green-600')
                      : (darkMode ? 'text-red-400' : 'text-red-600')
                  }`}>
                    {formatCurrency(Array.from(dayData.values()).reduce((sum, d) => sum + d.pnl, 0))}
                  </span>
                </div>
                <div>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Profitable Days:</span>
                  <span className={`ml-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {Array.from(dayData.values()).filter(d => d.pnl > 0).length}/{dayData.size}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* List View */
        <div className="space-y-3">
          {sortedDayData.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No trading data available</p>
            </div>
          ) : (
            sortedDayData.map((data, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    : 'bg-white border-gray-200 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(data.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {data.trades} trade{data.trades !== 1 ? 's' : ''} • {data.winRate.toFixed(1)}% win rate
                    </div>
                    {data.notes && (
                      <div className={`text-sm mt-2 p-2 rounded ${
                        darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-50 text-gray-700'
                      }`}>
                        {data.notes}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      data.pnl >= 0 
                        ? (darkMode ? 'text-green-400' : 'text-green-600')
                        : (darkMode ? 'text-red-400' : 'text-red-600')
                    }`}>
                      {formatCurrency(data.pnl)}
                    </div>
                    <div className="flex items-center justify-end mt-1">
                      {data.pnl >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {data.pnl >= 0 ? 'Profit' : 'Loss'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Selected Day Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-lg max-w-md w-full p-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {new Date(selectedDay.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className={`p-1 rounded-full transition-colors ${
                  darkMode
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total P&L
                  </div>
                  <div className={`text-xl font-bold ${
                    selectedDay.pnl >= 0 
                      ? (darkMode ? 'text-green-400' : 'text-green-600')
                      : (darkMode ? 'text-red-400' : 'text-red-600')
                  }`}>
                    {formatCurrency(selectedDay.pnl)}
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Trades
                  </div>
                  <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedDay.trades}
                  </div>
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Win Rate
                </div>
                <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedDay.winRate.toFixed(1)}%
                </div>
              </div>
              
              {selectedDay.notes && (
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    Notes
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedDay.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarHeatmap;