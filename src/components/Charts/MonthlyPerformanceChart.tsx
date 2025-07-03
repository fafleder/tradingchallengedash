import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/formatters';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

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
      <div className={`rounded-xl shadow-lg border p-8 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-xl ${
            darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
          }`}>
            <Calendar className={`h-6 w-6 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <h3 className={`text-xl font-bold ml-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Monthly Performance
          </h3>
        </div>
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No monthly data available</p>
          <p className="text-sm mt-2">Complete trades to see monthly breakdown</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalProfit = data.reduce((sum, d) => sum + d.profit, 0);
  const profitableMonths = data.filter(d => d.profit > 0).length;
  const bestMonth = data.reduce((best, current) => current.profit > best.profit ? current : best);
  const worstMonth = data.reduce((worst, current) => current.profit < worst.profit ? current : worst);

  // Calculate Y-axis domain to show both positive and negative values clearly
  const profits = data.map(d => d.profit);
  const maxProfit = Math.max(...profits, 0);
  const minProfit = Math.min(...profits, 0);
  const range = maxProfit - minProfit;
  const padding = range * 0.3;
  
  const yAxisDomain = [
    minProfit - padding,
    maxProfit + padding
  ];

  // Enhanced data with colors and gradients
  const enhancedData = data.map((item, index) => ({
    ...item,
    displayMonth: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    barColor: item.profit >= 0 ? '#10b981' : '#ef4444',
    intensity: Math.abs(item.profit) / Math.max(...profits.map(p => Math.abs(p))),
  }));

  return (
    <div className={`rounded-xl shadow-lg border p-8 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl ${
            totalProfit >= 0 
              ? (darkMode ? 'bg-green-900/30' : 'bg-green-100')
              : (darkMode ? 'bg-red-900/30' : 'bg-red-100')
          }`}>
            <Calendar className={`h-6 w-6 ${
              totalProfit >= 0 
                ? (darkMode ? 'text-green-400' : 'text-green-600')
                : (darkMode ? 'text-red-400' : 'text-red-600')
            }`} />
          </div>
          <div className="ml-4">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Monthly Performance
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {profitableMonths}/{data.length} profitable months
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            totalProfit >= 0 
              ? (darkMode ? 'text-green-400' : 'text-green-600')
              : (darkMode ? 'text-red-400' : 'text-red-600')
          }`}>
            {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total YTD
          </div>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={enhancedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.4}/>
              </linearGradient>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={darkMode ? '#374151' : '#e5e7eb'} 
              strokeOpacity={0.5}
            />
            <XAxis 
              dataKey="displayMonth" 
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              fontSize={11}
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              fontSize={11}
              tickFormatter={(value) => formatCurrency(value)}
              domain={yAxisDomain}
              tick={{ fontSize: 10 }}
              width={80}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine 
              y={0} 
              stroke={darkMode ? '#6b7280' : '#9ca3af'} 
              strokeDasharray="2 2" 
              strokeWidth={2} 
              strokeOpacity={0.7}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '12px',
                color: darkMode ? '#ffffff' : '#000000',
                fontSize: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
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
              radius={[4, 4, 0, 0]}
              stroke={darkMode ? '#374151' : '#e5e7eb'}
              strokeWidth={1}
            >
              {enhancedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.profit >= 0 ? 'url(#profitGradient)' : 'url(#lossGradient)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl ${
          darkMode ? 'bg-green-900/20 border border-green-700/30' : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                Best Month
              </div>
              <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                {formatCurrency(bestMonth.profit)}
              </div>
              <div className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                {new Date(bestMonth.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            <TrendingUp className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </div>

        <div className={`p-4 rounded-xl ${
          darkMode ? 'bg-red-900/20 border border-red-700/30' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                Worst Month
              </div>
              <div className={`text-lg font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {formatCurrency(worstMonth.profit)}
              </div>
              <div className={`text-xs ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                {new Date(worstMonth.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            <TrendingDown className={`h-8 w-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>
        </div>
      </div>
      
      <div className={`mt-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
        Monthly breakdown with gradient bars and performance insights
      </div>
    </div>
  );
};

export default MonthlyPerformanceChart;