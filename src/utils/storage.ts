import { AppState } from '../types/Phase';

export class StorageManager {
  private static LOCAL_STORAGE_KEY = 'trading-challenge-data';
  
  /**
   * Save current state to localStorage
   */
  static saveToLocalStorage(state: AppState): void {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
  
  /**
   * Load state from localStorage
   */
  static loadFromLocalStorage(): AppState | null {
    try {
      const savedData = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData) as AppState;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return null;
  }
  
  /**
   * Save state to a downloadable file
   */
  static saveToFile(state: AppState): void {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trading-challenge-data.json';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error saving to file:', error);
      alert('Error saving to file: ' + error);
    }
  }
}