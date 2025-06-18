import React from 'react';
import { BarChart3, Keyboard } from 'lucide-react';
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
}

const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
}) => {
  const { darkMode } = useTheme();

  return (
    <header className={`border-b shadow-sm transition-colors ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-green-600" />
          <h1 className={`text-xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Trading Challenge Dashboard
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
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