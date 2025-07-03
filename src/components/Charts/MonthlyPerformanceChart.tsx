import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
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
      <div className={`rounded-lg shadow-sm border p-4 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Monthly Performance
        </h3>
        <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No monthly data available
        </div>
      </div>
    );
  }

  // Calculate Y-axis domain to show both positive and negative values clearly
  const profits = data.map(d => d.profit);
  const maxProfit = Math.max(...profits, 0);
  const minProfit = Math.min(...profits, 0);
  const range = maxProfit - minProfit;
  const padding = range * 0.3; // Increased padding for better visibility
  
  const yAxisDomain = [
    minProfit - padding,
    maxProfit + padding
  ];

  return (
    <div className={`rounded-lg shadow-sm border p-4 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Monthly Performance
      </h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={darkMode ? '#374151' : '#e5e7eb'} 
            />
            <XAxis 
              dataKey="month" 
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              fontSize={11}
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              fontSize={11}
              tickFormatter={(value) => formatCurrency(value)}
              domain={yAxisDomain}
              tick={{ fontSize: 10 }}
              width={80}
            />
            <ReferenceLine y={0} stroke={darkMode ? '#6b7280' : '#9ca3af'} strokeDasharray="2 2" strokeWidth={2} />
            <Tooltip 
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '6px',
                color: darkMode ? '#ffffff' : '#000000',
                fontSize: '12px',
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
            >
              {data.map((entry, index) => (
                <Bar key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Monthly profit/loss with extended Y-axis to show baseline and positive values clearly
      </div>
    </div>
  );
};

export default MonthlyPerformanceChart;