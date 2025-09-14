import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, DollarSign, Calendar, Bot, Calculator, Download, FileSpreadsheet, Users, Zap, Award, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface FranchisePlanProps {
  phases: any[];
}

interface PlanConfig {
  startingCapital: number;
  winRate: number;
  targetIncome: number;
}

const FranchisePlan: React.FC<FranchisePlanProps> = ({ phases }) => {
  const { darkMode } = useTheme();
  const [config, setConfig] = useState<PlanConfig>({
    startingCapital: 100,
    winRate: 60,
    targetIncome: 1000,
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'roadmap' | 'calculator' | 'bot' | 'deliverables'>('overview');

  // Calculate plan metrics based on config
  const calculatePlanMetrics = () => {
    const { startingCapital, winRate, targetIncome } = config;
    
    // Base calculations
    const dailyRisk = 4; // 2 trades × 2% each
    const weeklyRisk = 10;
    const riskReward = 2;
    
    // Win rate multipliers
    const winRateMultiplier = winRate / 60; // Base 60%
    const expectedDailyReturn = (winRate / 100) * (riskReward * 2) - ((100 - winRate) / 100) * 2;
    
    // Account requirements for different income levels
    const incomeTargets = [
      { income: 50, accounts: 1, avgSize: 100, totalCapital: 100, weeks: Math.ceil(10 / winRateMultiplier) },
      { income: 200, accounts: 2, avgSize: 150, totalCapital: 300, weeks: Math.ceil(12 / winRateMultiplier) },
      { income: 400, accounts: 3, avgSize: 200, totalCapital: 600, weeks: Math.ceil(14 / winRateMultiplier) },
      { income: 500, accounts: 4, avgSize: 200, totalCapital: 800, weeks: Math.ceil(16 / winRateMultiplier) },
      { income: 1000, accounts: 5, avgSize: 300, totalCapital: 1500, weeks: Math.ceil(20 / winRateMultiplier) },
    ];
    
    return {
      expectedDailyReturn,
      incomeTargets,
      weeklyWithdrawal: targetIncome / 4,
      monthsToTarget: Math.ceil(incomeTargets.find(t => t.income >= targetIncome)?.weeks || 20 / 4),
    };
  };

  const metrics = calculatePlanMetrics();

  const sprintWeeks = [
    { week: 1, kpi: 'Learn SOP, back-test 30 setups, finish journal template', wr50: '–', wr60: '–', wr75: '–' },
    { week: 2, kpi: 'Go live, 2 setups/day, max 4% daily', wr50: '+4%', wr60: '+5%', wr75: '+6%' },
    { week: 4, kpi: 'First bi-weekly withdrawal', wr50: '$10*', wr60: '$13*', wr75: '$16*' },
    { week: 6, kpi: 'Account ≥ $130', wr50: '$130', wr60: '$145', wr75: '$165' },
    { week: 8, kpi: 'Savings pool ≥ $100 → open Account-2', wr50: 'done', wr60: 'done', wr75: 'done' },
    { week: 12, kpi: 'Monthly net income target', wr50: '$200', wr60: '$200', wr75: '$200' },
  ];

  const roadmapPhases = [
    { phase: 'Months 0-3', title: 'Employee Sprint', description: '1 account → prove 60% WR, hit $200/mo', color: 'blue' },
    { phase: 'Months 4-6', title: 'Scale Up', description: 'Open account #2-3, savings pool finances them → $400/mo', color: 'green' },
    { phase: 'Months 7-9', title: 'Automation', description: 'Add bot on account #1 (XAU) & #2 (BTC) → free up evening time', color: 'purple' },
    { phase: 'Months 10-12', title: 'Target Achievement', description: '5 accounts running → $1,000/mo net income', color: 'orange' },
    { phase: 'Year 2', title: 'Prop Firm Expansion', description: 'Incorporate prop-firm challenges ($5k-$25k) → $2k-$3k/mo', color: 'red' },
  ];

  const botSpecs = [
    { spec: 'Session', value: '00:00 – 10:00 NY (Asian + early London)' },
    { spec: 'Time-filter', value: 'Flat 30 min before/after high-impact news' },
    { spec: 'Entry', value: '15-min ICT OTE + fair-value-gap (FVG)' },
    { spec: 'Hard SL', value: '20 pips XAU, 200 pips BTC | TP: 2 × SL' },
    { spec: 'Max cycles', value: '1 cycle/day → bot self-disables after TP or SL' },
    { spec: 'Magic number', value: 'Per account (run 5 bots on one MT5 terminal)' },
  ];

  const deliverables = [
    {
      title: 'Excel 365 + Google Sheet',
      description: 'Drop-down selectors for capital and win-rate, auto-calculating KPIs',
      icon: FileSpreadsheet,
      color: 'green'
    },
    {
      title: 'Bot Package',
      description: '.ex5 file (MT5) + .set files for XAU & BTC + Python back-tester',
      icon: Bot,
      color: 'blue'
    },
    {
      title: '90-Day Employee Checklist',
      description: 'Weekly boxes to tick, complete implementation guide',
      icon: Calendar,
      color: 'purple'
    },
    {
      title: 'PPT Presentation',
      description: 'Walk-through showing how to copy sheet and link MT5 balance',
      icon: Award,
      color: 'orange'
    },
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: TrendingUp },
    { id: 'roadmap' as const, label: '24-Month Roadmap', icon: Calendar },
    { id: 'calculator' as const, label: 'Capital Calculator', icon: Calculator },
    { id: 'bot' as const, label: 'Bot Specifications', icon: Bot },
    { id: 'deliverables' as const, label: 'Deliverables', icon: Download },
  ];

  return (
    <div className={`rounded-lg shadow-sm border p-6 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            24-Month Franchise Expansion Plan
          </h2>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Plug-and-play system to scale from ${formatCurrency(config.startingCapital)} to ${formatCurrency(config.targetIncome)}/month
          </p>
        </div>
        
        {/* Configuration Panel */}
        <div className={`p-4 rounded-lg border ${
          darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Starting Capital
              </label>
              <select
                value={config.startingCapital}
                onChange={(e) => setConfig({...config, startingCapital: parseInt(e.target.value)})}
                className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${
                  darkMode
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={20}>$20</option>
                <option value={50}>$50</option>
                <option value={100}>$100</option>
                <option value={200}>$200</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Win Rate
              </label>
              <select
                value={config.winRate}
                onChange={(e) => setConfig({...config, winRate: parseInt(e.target.value)})}
                className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${
                  darkMode
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={50}>50% (Pessimistic)</option>
                <option value={60}>60% (Realistic)</option>
                <option value={75}>75% (Optimistic)</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Target Income
              </label>
              <select
                value={config.targetIncome}
                onChange={(e) => setConfig({...config, targetIncome: parseInt(e.target.value)})}
                className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${
                  darkMode
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={50}>$50/month</option>
                <option value={200}>$200/month</option>
                <option value={400}>$400/month</option>
                <option value={500}>$500/month</option>
                <option value={1000}>$1,000/month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                    Daily Risk Cap
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    4%
                  </p>
                </div>
                <AlertTriangle className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Weekly Cap
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    10%
                  </p>
                </div>
                <Target className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Account Stop
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    30%
                  </p>
                </div>
                <Zap className={`h-8 w-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                    R:R Ratio
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                    1:2+
                  </p>
                </div>
                <TrendingUp className={`h-8 w-8 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
            </div>
          </div>

          {/* 90-Day Sprint Table */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              90-Day "Employee" Sprint (Micro-Company Phase)
            </h3>
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${
                darkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>Week</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>KPI</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>50% WR</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>60% WR</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>75% WR</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                }`}>
                  {sprintWeeks.map((week, index) => (
                    <tr key={index}>
                      <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {week.week}
                      </td>
                      <td className={`px-4 py-4 text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {week.kpi}
                      </td>
                      <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {week.wr50}
                      </td>
                      <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {week.wr60}
                      </td>
                      <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {week.wr75}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Withdrawal & Reinvest Engine */}
          <div className={`p-6 rounded-lg border ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`font-semibold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Bi-Weekly Withdrawal & Reinvest Engine
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-green-900/20' : 'bg-green-50'
              }`}>
                <div className={`text-2xl font-bold mb-2 ${
                  darkMode ? 'text-green-400' : 'text-green-600'
                }`}>50%</div>
                <div className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                  Withdrawable (bank/USDT)
                </div>
              </div>
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
              }`}>
                <div className={`text-2xl font-bold mb-2 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>30%</div>
                <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  Compounds same account
                </div>
              </div>
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-purple-900/20' : 'bg-purple-50'
              }`}>
                <div className={`text-2xl font-bold mb-2 ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>20%</div>
                <div className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  USDT savings pool
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roadmap Tab */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            24-Month Visual Road-Map
          </h3>
          <div className="space-y-4">
            {roadmapPhases.map((phase, index) => {
              const colors = {
                blue: darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200',
                green: darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200',
                purple: darkMode ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200',
                orange: darkMode ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200',
                red: darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200',
              };
              
              return (
                <div key={index} className={`p-6 rounded-lg border ${colors[phase.color as keyof typeof colors]}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {phase.phase}: {phase.title}
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {phase.description}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      phase.color === 'blue' ? (darkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800') :
                      phase.color === 'green' ? (darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800') :
                      phase.color === 'purple' ? (darkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-800') :
                      phase.color === 'orange' ? (darkMode ? 'bg-orange-800 text-orange-200' : 'bg-orange-100 text-orange-800') :
                      (darkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800')
                    }`}>
                      Phase {index + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Capital Pathway Table (Starter → $1,000/mo income)
          </h3>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${
              darkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Monthly Income Goal</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}># Accounts</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Total Capital</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Weekly Withdrawal</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Timeline ({config.winRate}% WR)</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
              }`}>
                {metrics.incomeTargets.map((target, index) => (
                  <tr key={index} className={target.income === config.targetIncome ? 
                    (darkMode ? 'bg-green-900/20' : 'bg-green-50') : ''
                  }>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatCurrency(target.income)}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {target.accounts} × ${formatCurrency(target.avgSize)}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {formatCurrency(target.totalCapital)}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {formatCurrency(target.income / 4)}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {target.weeks} weeks
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bot Tab */}
      {activeTab === 'bot' && (
        <div className="space-y-6">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Bot Spec Sheet (Gold & BTCUSD only)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {botSpecs.map((spec, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`font-medium text-sm mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {spec.spec}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
          
          <div className={`p-6 rounded-lg border ${
            darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
          }`}>
            <h4 className={`font-semibold text-lg mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
              Code Base Included
            </h4>
            <ul className={`space-y-2 text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              <li>• .ex5 + .set files for MT5</li>
              <li>• Python back-tester (reads MT5 csv export)</li>
              <li>• Magic number system for multiple accounts</li>
              <li>• Auto-disable after TP/SL hit</li>
            </ul>
          </div>
        </div>
      )}

      {/* Deliverables Tab */}
      {activeTab === 'deliverables' && (
        <div className="space-y-6">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Ready-to-Use Deliverables
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deliverables.map((item, index) => {
              const Icon = item.icon;
              const colors = {
                green: darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200',
                blue: darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200',
                purple: darkMode ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200',
                orange: darkMode ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200',
              };
              
              return (
                <div key={index} className={`p-6 rounded-lg border ${colors[item.color as keyof typeof colors]}`}>
                  <div className="flex items-start">
                    <div className={`p-3 rounded-lg mr-4 ${
                      item.color === 'green' ? (darkMode ? 'bg-green-800' : 'bg-green-100') :
                      item.color === 'blue' ? (darkMode ? 'bg-blue-800' : 'bg-blue-100') :
                      item.color === 'purple' ? (darkMode ? 'bg-purple-800' : 'bg-purple-100') :
                      (darkMode ? 'bg-orange-800' : 'bg-orange-100')
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        item.color === 'green' ? (darkMode ? 'text-green-400' : 'text-green-600') :
                        item.color === 'blue' ? (darkMode ? 'text-blue-400' : 'text-blue-600') :
                        item.color === 'purple' ? (darkMode ? 'text-purple-400' : 'text-purple-600') :
                        (darkMode ? 'text-orange-400' : 'text-orange-600')
                      }`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.title}
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className={`p-6 rounded-lg border ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Download Complete Package
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Get all deliverables configured for your selected parameters
                </p>
              </div>
              <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Download Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchisePlan;