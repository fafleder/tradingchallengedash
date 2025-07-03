import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, defs, linearGradient, stop } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, Activity } from 'lucide-react';

interface EquityCurveChartProps {
  data: Array<{ date: string; equity: number; }>;
}

const EquityCurveChart: React.FC<EquityCurveChartProps> = ({ data }) => {
  const { darkMode } = useTheme();
  
  if (data.length === 0) {
    return (
      <div className={`rounded-xl shadow-lg border p-8 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-xl ${
            darkMode ? 'bg-green-900/30' : 'bg-green-100'
          }`}>
            <TrendingUp className={`h-6 w-6 ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`} />
          </div>
          <h3 className={`text-xl font-bold ml-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Equity Growth Curve
          </h3>
        </div>
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No trade data available</p>
          <p className="text-sm mt-2">Start trading to see your equity curve</p>
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
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        growth: currentEquity - data[0].equity,
        growthPercent: ((currentEquity - data[0].equity) / data[0].equity) * 100
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

  const totalGrowth = dailyData[dailyData.length - 1]?.growth || 0;
  const totalGrowthPercent = dailyData[dailyData.length - 1]?.growthPercent || 0;

  return (
    <div className={`rounded-xl shadow-lg border p-8 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl ${
            totalGrowth >= 0 
              ? (darkMode ? 'bg-green-900/30' : 'bg-green-100')
              : (darkMode ? 'bg-red-900/30' : 'bg-red-100')
          }`}>
            <TrendingUp className={`h-6 w-6 ${
              totalGrowth >= 0 
                ? (darkMode ? 'text-green-400' : 'text-green-600')
                : (darkMode ? 'text-red-400' : 'text-red-600')
            }`} />
          </div>
          <div className="ml-4">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Equity Growth Curve
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Portfolio performance over time
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            totalGrowth >= 0 
              ? (darkMode ? 'text-green-400' : 'text-green-600')
              : (darkMode ? 'text-red-400' : 'text-red-600')
          }`}>
            {totalGrowth >= 0 ? '+' : ''}{formatCurrency(totalGrowth)}
          </div>
          <div className={`text-sm ${
            totalGrowthPercent >= 0 
              ? (darkMode ? 'text-green-400' : 'text-green-600')
              : (darkMode ? 'text-red-400' : 'text-red-600')
          }`}>
            {totalGrowthPercent >= 0 ? '+' : ''}{totalGrowthPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={totalGrowth >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={totalGrowth >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={darkMode ? '#374151' : '#e5e7eb'} 
              strokeOpacity={0.5}
            />
            <XAxis 
              dataKey="displayDate" 
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              fontSize={12}
              interval="preserveStartEnd"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value)}
              domain={yAxisDomain}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '12px',
                color: darkMode ? '#ffffff' : '#000000',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'equity') return [formatCurrency(value), 'Portfolio Value'];
                return [value, name];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              fill="url(#equityGradient)"
              dot={false}
              activeDot={{ 
                r: 8, 
                fill: totalGrowth >= 0 ? '#10b981' : '#ef4444', 
                strokeWidth: 3, 
                stroke: '#ffffff',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
              }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className={`mt-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
        Real-time portfolio growth with gradient visualization showing performance trends
      </div>
    </div>
  );
};

export default EquityCurveChart;