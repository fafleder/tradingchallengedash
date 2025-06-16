import React, { useState } from 'react';
import { Search, Filter, Download, FileText } from 'lucide-react';
import { Phase, Level, TradeFilter } from '../../types/Phase';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { ExportManager } from '../../utils/exportUtils';

interface TradeJournalProps {
  phases: Phase[];
}

const TradeJournal: React.FC<TradeJournalProps> = ({ phases }) => {
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<TradeFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  const allTrades = phases.flatMap(phase => 
    phase.levels.map(level => ({
      ...level,
      phaseNumber: phase.phaseNumber,
    }))
  );

  const filteredTrades = allTrades.filter(trade => {
    const matchesSearch = !searchTerm || 
      trade.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.strategy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.currencyPair?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDateFrom = !filter.dateFrom || trade.date >= filter.dateFrom;
    const matchesDateTo = !filter.dateTo || trade.date <= filter.dateTo;
    const matchesStrategy = !filter.strategy || trade.strategy === filter.strategy;
    const matchesCurrencyPair = !filter.currencyPair || trade.currencyPair === filter.currencyPair;
    const matchesCompleted = filter.completed === undefined || trade.completed === filter.completed;
    const matchesMinPL = filter.minPL === undefined || trade.pl >= filter.minPL;
    const matchesMaxPL = filter.maxPL === undefined || trade.pl <= filter.maxPL;

    return matchesSearch && matchesDateFrom && matchesDateTo && 
           matchesStrategy && matchesCurrencyPair && matchesCompleted &&
           matchesMinPL && matchesMaxPL;
  });

  const strategies = [...new Set(allTrades.map(t => t.strategy).filter(Boolean))];
  const currencyPairs = [...new Set(allTrades.map(t => t.currencyPair).filter(Boolean))];

  const handleExportCSV = () => {
    ExportManager.exportToCSV(phases);
  };

  return (
    <div className={`rounded-lg shadow-sm border p-6 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Trade Journal
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
              darkMode
                ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </button>
          <button
            onClick={handleExportCSV}
            className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
              darkMode
                ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="Search trades by notes, strategy, or currency pair..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {showFilters && (
          <div className={`mt-4 p-4 border rounded-md ${
            darkMode
              ? 'bg-gray-700 border-gray-600'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date From
                </label>
                <input
                  type="date"
                  value={filter.dateFrom || ''}
                  onChange={(e) => setFilter({...filter, dateFrom: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                    darkMode
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date To
                </label>
                <input
                  type="date"
                  value={filter.dateTo || ''}
                  onChange={(e) => setFilter({...filter, dateTo: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                    darkMode
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Strategy
                </label>
                <select
                  value={filter.strategy || ''}
                  onChange={(e) => setFilter({...filter, strategy: e.target.value || undefined})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                    darkMode
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">All Strategies</option>
                  {strategies.map(strategy => (
                    <option key={strategy} value={strategy}>{strategy}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <select
                  value={filter.completed === undefined ? '' : filter.completed.toString()}
                  onChange={(e) => setFilter({
                    ...filter, 
                    completed: e.target.value === '' ? undefined : e.target.value === 'true'
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                    darkMode
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">All Trades</option>
                  <option value="true">Completed</option>
                  <option value="false">Pending</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trade List */}
      <div className="space-y-3">
        {filteredTrades.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No trades found matching your criteria</p>
          </div>
        ) : (
          filteredTrades.map((trade, index) => (
            <div
              key={`${trade.phaseNumber}-${trade.levelNumber}`}
              className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  : 'bg-white border-gray-200 hover:shadow-lg'
              } ${trade.completed ? (darkMode ? 'bg-gray-600' : 'bg-green-50') : ''}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      darkMode
                        ? 'bg-blue-900 text-blue-200'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      Phase {trade.phaseNumber} - Level {trade.levelNumber}
                    </span>
                    {trade.completed && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        trade.pl >= 0
                          ? (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                          : (darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                      }`}>
                        {trade.pl >= 0 ? 'Win' : 'Loss'}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className={`block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {trade.date || 'Not set'}
                      </span>
                    </div>
                    <div>
                      <span className={`block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Strategy</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {trade.strategy || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className={`block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Currency Pair</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {trade.currencyPair || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className={`block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Risk</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatPercent(trade.riskPercent)}
                      </span>
                    </div>
                  </div>
                  
                  {trade.notes && (
                    <div className="mt-3">
                      <span className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Notes</span>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {trade.notes}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    trade.completed
                      ? (trade.pl >= 0 
                          ? (darkMode ? 'text-green-400' : 'text-green-600')
                          : (darkMode ? 'text-red-400' : 'text-red-600'))
                      : (darkMode ? 'text-gray-400' : 'text-gray-500')
                  }`}>
                    {trade.completed ? formatCurrency(trade.pl) : 'Pending'}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Balance: {formatCurrency(trade.balance)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TradeJournal;