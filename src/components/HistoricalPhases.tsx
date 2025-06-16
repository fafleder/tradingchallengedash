import React, { useState } from 'react';
import { ChevronDown, ChevronUp, History } from 'lucide-react';
import { Phase } from '../types/Phase';
import { formatCurrency } from '../utils/formatters';

interface HistoricalPhasesProps {
  phases: Phase[];
}

const HistoricalPhases: React.FC<HistoricalPhasesProps> = ({ phases }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (phases.length === 0) return null;
  
  const getTotalProfitLoss = (phase: Phase): number => {
    return phase.levels.reduce((total, level) => {
      return level.completed ? total + level.pl : total;
    }, 0);
  };
  
  const getTotalPhasesProfitLoss = (): number => {
    return phases.reduce((total, phase) => {
      return total + getTotalProfitLoss(phase);
    }, 0);
  };
  
  return (
    <div className="bg-gray-100 rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <History className="h-5 w-5 mr-2 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-800">Historical Phases</h3>
          <span className="ml-2 text-sm text-gray-500">({phases.length})</span>
        </div>
        
        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium">
            Total P/L: <span className={getTotalPhasesProfitLoss() >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(getTotalPhasesProfitLoss())}
            </span>
          </span>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 space-y-3">
          {phases.map((phase, index) => (
            <div 
              key={index}
              className="bg-white rounded p-3 border border-gray-200 flex flex-wrap justify-between items-center gap-y-2"
            >
              <div>
                <span className="font-medium">Phase {phase.phaseNumber}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({phase.levels.filter(l => l.completed).length}/{phase.levels.length} levels)
                </span>
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <div>
                  <span className="text-gray-600">Initial: </span>
                  <span className="font-medium">{formatCurrency(phase.initialCapital)}</span>
                </div>
                
                <div>
                  <span className="text-gray-600">Final: </span>
                  <span className="font-medium">
                    {formatCurrency(phase.initialCapital + getTotalProfitLoss(phase))}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-600">P/L: </span>
                  <span className={`font-medium ${getTotalProfitLoss(phase) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(getTotalProfitLoss(phase))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoricalPhases;