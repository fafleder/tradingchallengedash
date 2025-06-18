import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, TrendingUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Phase } from '../../types/Phase';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationSystemProps {
  phases: Phase[];
  settings: { notifications: boolean };
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ phases, settings }) => {
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  // Generate notifications based on trading activity
  useEffect(() => {
    if (!settings.notifications) return;

    const newNotifications: Notification[] = [];

    phases.forEach(phase => {
      const completedTrades = phase.levels.filter(l => l.completed);
      const recentTrades = completedTrades.slice(-5);
      
      // Check for win streaks
      let currentWinStreak = 0;
      for (let i = recentTrades.length - 1; i >= 0; i--) {
        if (recentTrades[i].pl > 0) {
          currentWinStreak++;
        } else {
          break;
        }
      }

      if (currentWinStreak >= 3) {
        newNotifications.push({
          id: `win-streak-${phase.phaseNumber}-${Date.now()}`,
          type: 'achievement',
          title: '🔥 Win Streak!',
          message: `You're on a ${currentWinStreak} trade winning streak in Phase ${phase.phaseNumber}!`,
          timestamp: new Date(),
          read: false,
        });
      }

      // Check for loss streaks
      let currentLossStreak = 0;
      for (let i = recentTrades.length - 1; i >= 0; i--) {
        if (recentTrades[i].pl < 0) {
          currentLossStreak++;
        } else {
          break;
        }
      }

      if (currentLossStreak >= 3) {
        newNotifications.push({
          id: `loss-streak-${phase.phaseNumber}-${Date.now()}`,
          type: 'warning',
          title: '⚠️ Loss Streak Alert',
          message: `You have ${currentLossStreak} consecutive losses in Phase ${phase.phaseNumber}. Consider reviewing your strategy.`,
          timestamp: new Date(),
          read: false,
        });
      }

      // Check for goal achievements
      if (phase.goalTarget) {
        const currentBalance = phase.initialCapital + completedTrades.reduce((sum, t) => sum + t.pl, 0);
        const progress = (currentBalance / phase.goalTarget) * 100;
        
        if (progress >= 100) {
          newNotifications.push({
            id: `goal-achieved-${phase.phaseNumber}-${Date.now()}`,
            type: 'achievement',
            title: '🎉 Goal Achieved!',
            message: `Congratulations! You've reached your goal for Phase ${phase.phaseNumber}!`,
            timestamp: new Date(),
            read: false,
          });
        } else if (progress >= 75 && progress < 100) {
          newNotifications.push({
            id: `goal-progress-${phase.phaseNumber}-${Date.now()}`,
            type: 'info',
            title: '🎯 Almost There!',
            message: `You're ${progress.toFixed(1)}% towards your Phase ${phase.phaseNumber} goal!`,
            timestamp: new Date(),
            read: false,
          });
        }
      }

      // Check for high risk trades
      const highRiskTrades = recentTrades.filter(t => t.riskPercent > 5);
      if (highRiskTrades.length > 0) {
        newNotifications.push({
          id: `high-risk-${phase.phaseNumber}-${Date.now()}`,
          type: 'warning',
          title: '🚨 High Risk Alert',
          message: `You have ${highRiskTrades.length} recent trades with >5% risk in Phase ${phase.phaseNumber}.`,
          timestamp: new Date(),
          read: false,
        });
      }
    });

    // Only add notifications that don't already exist
    const existingIds = notifications.map(n => n.id);
    const uniqueNewNotifications = newNotifications.filter(n => !existingIds.includes(n.id));
    
    if (uniqueNewNotifications.length > 0) {
      setNotifications(prev => [...uniqueNewNotifications, ...prev].slice(0, 50)); // Keep only latest 50
    }
  }, [phases, settings.notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'achievement':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  if (!settings.notifications) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`relative p-2 rounded-full transition-colors ${
          darkMode
            ? 'text-gray-400 hover:text-white hover:bg-gray-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className={`absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-lg shadow-lg border z-50 ${
          darkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`p-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 transition-colors ${
                    !notification.read 
                      ? (darkMode ? 'bg-gray-700' : 'bg-blue-50')
                      : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className={`ml-2 p-1 rounded-full transition-colors ${
                        darkMode
                          ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;