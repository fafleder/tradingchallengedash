import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

interface EquityCurveChartProps {
  data: Array<{ date: string; equity: number; }>;
}

const EquityCurveChart: React.FC<EquityCurveChartProps> = ({ data }) => {
  const { darkMode } = useTheme();
  
  if (data.length === 0) {
    return (
      <div className={`rounded-lg shadow-sm border p-6 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Equity Curve
        </h3>
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No trade data available for equity curve
        </div>
      </div>
    );
  }

  // Create a more comprehensive dataset with daily points
  const createDailyEquityCurve = () => {
    if (data.length === 0) return [];
    
    const dailyData = [];
    const startDate = new Date(data[0].date);
    const endDate = new Date(data[data.length - 1].date);
    
    // Add 7 days buffer after last trade
    endDate.setDate(endDate.getDate() + 7);
    
    let currentEquity = data[0].equity;
    let dataIndex = 0;
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Check if there's a trade on this date
      while (dataIndex < data.length && data[dataIndex].date === dateStr) {
        currentEquity = data[dataIndex].equity;
        dataIndex++;
      }
      
      dailyData.push({
        date: dateStr,
        equity: currentEquity,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    return dailyData;
  };

  const dailyData = createDailyEquityCurve();
  
  // Calculate domain for better visualization
  const minEquity = Math.min(...dailyData.map(d => d.equity));
  const maxEquity = Math.max(...dailyData.map(d => d.equity));
  const padding = (maxEquity - minEquity) * 0.1;
  const yAxisDomain = [
    Math.max(0, minEquity - padding),
    maxEquity + padding
  ];

  return (
    <div className={`rounded-lg shadow-sm border p-6 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Equity Curve
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={darkMode ? '#374151' : '#e5e7eb'} 
            />
            <XAxis 
              dataKey="displayDate" 
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              fontSize={12}
              interval="preserveStartEnd"
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value)}
              domain={yAxisDomain}
              tick={{ fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '6px',
                color: darkMode ? '#ffffff' : '#000000',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Equity']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="equity" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Shows daily equity progression with trade points connected by continuous line
      </div>
    </div>
  );
};

export default EquityCurveChart;