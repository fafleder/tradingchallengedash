import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

interface RiskDistributionChartProps {
  data: Array<{ risk: string; count: number; }>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ data }) => {
  const { darkMode } = useTheme();
  
  if (data.length === 0 || data.every(d => d.count === 0)) {
    return (
      <div className={`rounded-lg shadow-sm border p-6 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Risk Distribution Analysis
        </h3>
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No risk data available
        </div>
      </div>
    );
  }

  const filteredData = data.filter(d => d.count > 0);
  const totalTrades = filteredData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className={`rounded-lg shadow-sm border p-6 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="mb-4">
        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Risk Distribution Analysis
        </h3>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Shows how your risk is distributed across different percentage ranges. 
          Ideal distribution should favor lower risk percentages (0-2%) for consistent growth.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ risk, count, percent }) => `${risk}: ${count} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  color: darkMode ? '#ffffff' : '#000000',
                }}
                formatter={(value: number) => [`${value} trades`, 'Count']}
              />
              <Legend 
                wrapperStyle={{
                  color: darkMode ? '#ffffff' : '#000000',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-3">
          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Risk Analysis Insights
          </h4>
          
          {filteredData.map((item, index) => {
            const percentage = (item.count / totalTrades) * 100;
            let riskLevel = '';
            let riskColor = '';
            
            if (item.risk === '0-1%') {
              riskLevel = 'Conservative';
              riskColor = darkMode ? 'text-green-400' : 'text-green-600';
            } else if (item.risk === '1-2%') {
              riskLevel = 'Moderate';
              riskColor = darkMode ? 'text-blue-400' : 'text-blue-600';
            } else if (item.risk === '2-3%') {
              riskLevel = 'Balanced';
              riskColor = darkMode ? 'text-yellow-400' : 'text-yellow-600';
            } else if (item.risk === '3-5%') {
              riskLevel = 'Aggressive';
              riskColor = darkMode ? 'text-orange-400' : 'text-orange-600';
            } else {
              riskLevel = 'High Risk';
              riskColor = darkMode ? 'text-red-400' : 'text-red-600';
            }
            
            return (
              <div key={index} className={`p-3 rounded-md ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.risk} Risk
                  </span>
                  <span className={`text-sm ${riskColor}`}>
                    {riskLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {item.count} trades ({percentage.toFixed(1)}%)
                  </span>
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${Math.max(percentage, 5)}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
              </div>
            );
          })}
          
          <div className={`mt-4 p-3 rounded-md border ${
            darkMode 
              ? 'bg-blue-900/20 border-blue-700 text-blue-200' 
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <h5 className="font-medium text-sm mb-1">💡 Risk Management Tip</h5>
            <p className="text-xs">
              Most successful traders keep 80% of their trades in the 0-2% risk range. 
              Higher risk percentages should be reserved for high-confidence setups only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDistributionChart;