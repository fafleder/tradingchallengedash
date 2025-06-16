import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

interface MonthlyPerformanceChartProps {
  data: Array<{
    month: string;
    profit: number;
    trades: number;
    winRate: number;
  }>;
}

const MonthlyPerformanceChart: React.FC<MonthlyPerformanceChartProps> = ({ data }) => {
  const { darkMode } = useTheme();
  
  if (data.length === 0) {
    return (
      <div className={`rounded-lg shadow-sm border p-6 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Monthly Performance
        </h3>
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No monthly data available
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-sm border p-6 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Monthly Performance
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={darkMode ? '#374151' : '#e5e7eb'} 
            />
            <XAxis 
              dataKey="month" 
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              fontSize={12}
            />
            <YAxis 
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '6px',
                color: darkMode ? '#ffffff' : '#000000',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'profit') return [formatCurrency(value), 'Profit/Loss'];
                if (name === 'trades') return [value, 'Trades'];
                if (name === 'winRate') return [`${value.toFixed(1)}%`, 'Win Rate'];
                return [value, name];
              }}
            />
            <Bar 
              dataKey="profit" 
              fill={(entry: any) => entry.profit >= 0 ? '#10b981' : '#ef4444'}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyPerformanceChart;