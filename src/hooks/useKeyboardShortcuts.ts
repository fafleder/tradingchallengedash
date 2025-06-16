import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface KeyboardShortcuts {
  onNewPhase?: () => void;
  onSave?: () => void;
  onExportData?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  const { toggleDarkMode } = useTheme();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      // Ctrl/Cmd + N - New Phase
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        shortcuts.onNewPhase?.();
      }

      // Ctrl/Cmd + S - Save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        shortcuts.onSave?.();
      }

      // Ctrl/Cmd + D - Toggle Dark Mode
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        toggleDarkMode();
      }

      // Ctrl/Cmd + E - Export Data
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        shortcuts.onExportData?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, toggleDarkMode]);
};