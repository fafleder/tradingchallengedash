import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { Shield, AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface RiskDistributionChartProps {
  data: Array<{ risk: string; count: number; }>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
const GRADIENT_COLORS = [
  { start: '#10b981', end: '#059669' },
  { start: '#3b82f6', end: '#2563eb' },
  { start: '#f59e0b', end: '#d97706' },
  { start: '#ef4444', end: '#dc2626' },
  { start: '#8b5cf6', end: '#7c3aed' },
];

const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ data }) => {
  const { darkMode } = useTheme();
  
  if (data.length === 0 || data.every(d => d.count === 0)) {
    return (
      <div className={`rounded-xl shadow-lg border p-8 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-xl ${
            darkMode ? 'bg-orange-900/30' : 'bg-orange-100'
          }`}>
            <Shield className={`h-6 w-6 ${
              darkMode ? 'text-orange-400' : 'text-orange-600'
            }`} />
          </div>
          <h3 className={`text-xl font-bold ml-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Risk Distribution Analysis
          </h3>
        </div>
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Shield className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No risk data available</p>
          <p className="text-sm mt-2">Start trading to analyze your risk patterns</p>
        </div>
      </div>
    );
  }

  const filteredData = data.filter(d => d.count > 0);
  const totalTrades = filteredData.reduce((sum, d) => sum + d.count, 0);

  // Calculate risk score
  const calculateRiskScore = () => {
    let score = 0;
    filteredData.forEach(item => {
      const percentage = (item.count / totalTrades) * 100;
      if (item.risk === '0-1%') score += percentage * 1;
      else if (item.risk === '1-2%') score += percentage * 2;
      else if (item.risk === '2-3%') score += percentage * 3;
      else if (item.risk === '3-5%') score += percentage * 4;
      else score += percentage * 5;
    });
    return score / 100;
  };

  const riskScore = calculateRiskScore();
  const getRiskLevel = (score: number) => {
    if (score <= 1.5) return { level: 'Conservative', color: 'green', icon: CheckCircle };
    if (score <= 2.5) return { level: 'Moderate', color: 'blue', icon: Target };
    if (score <= 3.5) return { level: 'Balanced', color: 'yellow', icon: AlertTriangle };
    return { level: 'Aggressive', color: 'red', icon: AlertTriangle };
  };

  const riskAssessment = getRiskLevel(riskScore);
  const RiskIcon = riskAssessment.icon;

  // Enhanced data for bar chart
  const enhancedData = filteredData.map((item, index) => ({
    ...item,
    percentage: (item.count / totalTrades) * 100,
    color: COLORS[index % COLORS.length],
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
            riskAssessment.color === 'green' 
              ? (darkMode ? 'bg-green-900/30' : 'bg-green-100')
              : riskAssessment.color === 'blue'
                ? (darkMode ? 'bg-blue-900/30' : 'bg-blue-100')
                : riskAssessment.color === 'yellow'
                  ? (darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100')
                  : (darkMode ? 'bg-red-900/30' : 'bg-red-100')
          }`}>
            <RiskIcon className={`h-6 w-6 ${
              riskAssessment.color === 'green' 
                ? (darkMode ? 'text-green-400' : 'text-green-600')
                : riskAssessment.color === 'blue'
                  ? (darkMode ? 'text-blue-400' : 'text-blue-600')
                  : riskAssessment.color === 'yellow'
                    ? (darkMode ? 'text-yellow-400' : 'text-yellow-600')
                    : (darkMode ? 'text-red-400' : 'text-red-600')
            }`} />
          </div>
          <div className="ml-4">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Risk Distribution Analysis
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Portfolio risk assessment and distribution patterns
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            riskAssessment.color === 'green' 
              ? (darkMode ? 'text-green-400' : 'text-green-600')
              : riskAssessment.color === 'blue'
                ? (darkMode ? 'text-blue-400' : 'text-blue-600')
                : riskAssessment.color === 'yellow'
                  ? (darkMode ? 'text-yellow-400' : 'text-yellow-600')
                  : (darkMode ? 'text-red-400' : 'text-red-600')
          }`}>
            {riskAssessment.level}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Risk Score: {riskScore.toFixed(1)}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="space-y-4">
          <h4 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Distribution Overview
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {GRADIENT_COLORS.map((gradient, index) => (
                    <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={gradient.start} />
                      <stop offset="100%" stopColor={gradient.end} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ risk, count, percent }) => `${risk}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="count"
                  stroke={darkMode ? '#374151' : '#ffffff'}
                  strokeWidth={2}
                >
                  {filteredData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#gradient-${index % GRADIENT_COLORS.length})`} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    color: darkMode ? '#ffffff' : '#000000',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [`${value} trades`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Bar Chart and Insights */}
        <div className="space-y-6">
          <h4 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Risk Breakdown
          </h4>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enhancedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  {GRADIENT_COLORS.map((gradient, index) => (
                    <linearGradient key={index} id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gradient.start} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={gradient.end} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeOpacity={0.5} />
                <XAxis 
                  dataKey="risk" 
                  stroke={darkMode ? '#9ca3af' : '#6b7280'} 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke={darkMode ? '#9ca3af' : '#6b7280'} 
                  fontSize={12}
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
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {enhancedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#barGradient-${index % GRADIENT_COLORS.length})`} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Insights */}
          <div className="space-y-3">
            {filteredData.map((item, index) => {
              const percentage = (item.count / totalTrades) * 100;
              let riskLevel = '';
              let riskColor = '';
              let recommendation = '';
              
              if (item.risk === '0-1%') {
                riskLevel = 'Conservative';
                riskColor = darkMode ? 'text-green-400' : 'text-green-600';
                recommendation = 'Excellent risk management';
              } else if (item.risk === '1-2%') {
                riskLevel = 'Moderate';
                riskColor = darkMode ? 'text-blue-400' : 'text-blue-600';
                recommendation = 'Good balance of risk and reward';
              } else if (item.risk === '2-3%') {
                riskLevel = 'Balanced';
                riskColor = darkMode ? 'text-yellow-400' : 'text-yellow-600';
                recommendation = 'Moderate risk, monitor closely';
              } else if (item.risk === '3-5%') {
                riskLevel = 'Aggressive';
                riskColor = darkMode ? 'text-orange-400' : 'text-orange-600';
                recommendation = 'High risk, use sparingly';
              } else {
                riskLevel = 'High Risk';
                riskColor = darkMode ? 'text-red-400' : 'text-red-600';
                recommendation = 'Dangerous risk level';
              }
              
              return (
                <div key={index} className={`p-4 rounded-xl border ${
                  darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.risk} Risk
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${riskColor}`}>
                      {riskLevel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {item.count} trades ({percentage.toFixed(1)}%)
                    </span>
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${Math.max(percentage * 2, 10)}px`,
                        backgroundColor: COLORS[index % COLORS.length],
                        opacity: 0.7
                      }}
                    />
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {recommendation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk Management Tip */}
      <div className={`mt-8 p-6 rounded-xl border ${
        darkMode 
          ? 'bg-blue-900/20 border-blue-700/30' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-start">
          <div className={`p-2 rounded-lg mr-4 ${
            darkMode ? 'bg-blue-800/50' : 'bg-blue-100'
          }`}>
            <Shield className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <h5 className={`font-medium text-sm mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
              💡 Risk Management Insights
            </h5>
            <div className={`text-sm space-y-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              <p>• Optimal risk distribution: 80% in 0-2% range for consistent growth</p>
              <p>• Your current risk score: {riskScore.toFixed(1)} ({riskAssessment.level})</p>
              <p>• Higher risk percentages should be reserved for high-confidence setups only</p>
              {riskScore > 2.5 && (
                <p className={`font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  ⚠️ Consider reducing average position sizes to improve risk management
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDistributionChart;