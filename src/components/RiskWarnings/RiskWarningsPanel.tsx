import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface RiskWarningsPanelProps {
  warnings: string[];
  show: boolean;
}

const RiskWarningsPanel: React.FC<RiskWarningsPanelProps> = ({ warnings, show }) => {
  const { darkMode } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!show || warnings.length === 0 || dismissed) {
    return null;
  }

  return (
    <div className={`mx-4 rounded-lg border transition-all ${
      darkMode 
        ? 'bg-yellow-900/20 border-yellow-700' 
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <AlertTriangle className={`h-5 w-5 mr-2 ${
            darkMode ? 'text-yellow-400' : 'text-yellow-600'
          }`} />
          <h4 className={`font-medium text-sm ${
            darkMode ? 'text-yellow-200' : 'text-yellow-800'
          }`}>
            Risk Management Alerts ({warnings.length})
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className={`p-1 rounded transition-colors ${
              darkMode 
                ? 'hover:bg-yellow-800 text-yellow-300' 
                : 'hover:bg-yellow-200 text-yellow-700'
            }`}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            className={`p-1 rounded transition-colors ${
              darkMode 
                ? 'hover:bg-yellow-800 text-yellow-300' 
                : 'hover:bg-yellow-200 text-yellow-700'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="px-3 pb-3">
          <ul className={`text-xs space-y-1 ${
            darkMode ? 'text-yellow-200' : 'text-yellow-800'
          }`}>
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RiskWarningsPanel;