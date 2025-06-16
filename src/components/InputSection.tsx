import React, { useState, useRef } from 'react';
import { Save, Upload, Plus, FileDown, FileSpreadsheet } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AppSettings } from '../types/Phase';

interface InputSectionProps {
  onStartNewPhase: (initialCapital: number, levelsPerPhase: number, goalTarget?: number) => void;
  onSaveToFile: () => void;
  onLoadFromFile: (data: any) => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  settings: AppSettings;
}

const InputSection: React.FC<InputSectionProps> = ({ 
  onStartNewPhase, 
  onSaveToFile,
  onLoadFromFile,
  onExportPDF,
  onExportCSV,
  settings
}) => {
  const { darkMode } = useTheme();
  const [initialCapital, setInitialCapital] = useState<string>('');
  const [levelsPerPhase, setLevelsPerPhase] = useState<string>('');
  const [goalTarget, setGoalTarget] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartNewPhase = () => {
    const capital = parseFloat(initialCapital);
    const levels = parseInt(levelsPerPhase);
    const goal = goalTarget ? parseFloat(goalTarget) : undefined;

    if (isNaN(capital) || capital <= 0) {
      alert('Please enter a valid initial capital amount.');
      return;
    }

    if (isNaN(levels) || levels <= 0) {
      alert('Please enter a valid number of levels per phase.');
      return;
    }

    if (goal && goal <= capital) {
      alert('Goal target should be greater than initial capital.');
      return;
    }

    onStartNewPhase(capital, levels, goal);
    setInitialCapital('');
    setLevelsPerPhase('');
    setGoalTarget('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        onLoadFromFile(data);
      } catch (error) {
        alert('Error loading file: Invalid file format');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`rounded-lg shadow-sm border p-6 mb-6 transition-all hover:shadow-md ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="flex-1">
          <label htmlFor="initialCapital" className={`block text-sm font-medium mb-1 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Initial Capital ($)
          </label>
          <input
            type="number"
            id="initialCapital"
            min="0"
            step="0.01"
            value={initialCapital}
            onChange={(e) => setInitialCapital(e.target.value)}
            placeholder="Enter capital"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'border-gray-300 placeholder-gray-500'
            }`}
          />
        </div>
        
        <div className="flex-1">
          <label htmlFor="levelsPerPhase" className={`block text-sm font-medium mb-1 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Levels per Phase
          </label>
          <input
            type="number"
            id="levelsPerPhase"
            min="1"
            value={levelsPerPhase}
            onChange={(e) => setLevelsPerPhase(e.target.value)}
            placeholder="Enter levels"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'border-gray-300 placeholder-gray-500'
            }`}
          />
        </div>
        
        <div className="flex-1">
          <label htmlFor="goalTarget" className={`block text-sm font-medium mb-1 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Goal Target ($) <span className="text-xs opacity-75">(Optional)</span>
          </label>
          <input
            type="number"
            id="goalTarget"
            min="0"
            step="0.01"
            value={goalTarget}
            onChange={(e) => setGoalTarget(e.target.value)}
            placeholder="Enter goal"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'border-gray-300 placeholder-gray-500'
            }`}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleStartNewPhase}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Start New Phase
          </button>
        </div>
      </div>
      
      <div className={`mt-4 pt-4 border-t flex flex-wrap gap-3 justify-end ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <button
          onClick={onSaveToFile}
          className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors ${
            darkMode
              ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
        >
          <Save className="h-4 w-4 mr-1" />
          Save JSON
        </button>
        
        <button
          onClick={onExportCSV}
          className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors ${
            darkMode
              ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
        >
          <FileSpreadsheet className="h-4 w-4 mr-1" />
          Export CSV
        </button>
        
        <button
          onClick={onExportPDF}
          className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors ${
            darkMode
              ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
        >
          <FileDown className="h-4 w-4 mr-1" />
          Export PDF
        </button>
        
        <label className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors cursor-pointer ${
          darkMode
            ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}>
          <Upload className="h-4 w-4 mr-1" />
          Load File
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default InputSection;