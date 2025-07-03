import React from 'react';
import { BarChart3, Keyboard, Save, Upload, FileDown, FileSpreadsheet } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import SettingsPanel from './Settings/SettingsPanel';
import RiskCalculator from './RiskCalculator/RiskCalculator';
import NotificationSystem from './Notifications/NotificationSystem';
import { AppSettings, Phase } from '../types/Phase';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onExportData: () => void;
  onImportData: (data: any) => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
}

const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onExportPDF,
  onExportCSV,
}) => {
  const { darkMode } = useTheme();

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        onImportData(data);
      } catch (error) {
        alert('Error loading file: Invalid file format');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  };

  return (
    <header className={`border-b shadow-sm transition-colors ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-green-600" />
          <h1 className={`text-xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Trading Challenge Dashboard
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Export/Import Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onExportData}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
                darkMode
                  ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Save className="h-4 w-4 mr-1" />
              Save JSON
            </button>
            
            <button
              onClick={onExportCSV}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
                darkMode
                  ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Export CSV
            </button>
            
            <button
              onClick={onExportPDF}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
                darkMode
                  ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <FileDown className="h-4 w-4 mr-1" />
              Export PDF
            </button>
            
            <label className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors cursor-pointer ${
              darkMode
                ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}>
              <Upload className="h-4 w-4 mr-1" />
              Load File
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          <div className="h-6 border-l border-gray-300 dark:border-gray-600"></div>
          
          <div className={`hidden md:flex items-center text-xs space-x-4 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="flex items-center">
              <Keyboard className="h-3 w-3 mr-1" />
              <span>Ctrl+N: New Phase</span>
            </div>
            <div>Ctrl+S: Save</div>
            <div>Ctrl+D: Dark Mode</div>
            <div>Ctrl+E: Export</div>
          </div>
          
          <NotificationSystem 
            phases={[]} 
            settings={settings}
          />
          
          <RiskCalculator />
          
          <SettingsPanel
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onExportData={onExportData}
            onImportData={onImportData}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;