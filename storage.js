// Local Storage Management for Baccarat Predictor
class StorageManager {
    constructor() {
        this.storageKey = 'baccaratPredictorData';
        this.historyKey = 'baccaratHistory';
        this.settingsKey = 'baccaratSettings';
        this.performanceKey = 'baccaratPerformance';
    }
    
    saveGameData(data) {
        try {
            const timestamp = Date.now();
            const dataWithTimestamp = {
                ...data,
                lastUpdated: timestamp,
                version: '1.0'
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(dataWithTimestamp));
            return true;
        } catch (error) {
            console.error('Failed to save game data:', error);
            return false;
        }
    }
    
    loadGameData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return null;
            
            const parsedData = JSON.parse(data);
            
            // Validate data structure
            if (this.validateGameData(parsedData)) {
                return parsedData;
            } else {
                console.warn('Invalid game data format, clearing storage');
                this.clearGameData();
                return null;
            }
        } catch (error) {
            console.error('Failed to load game data:', error);
            return null;
        }
    }
    
    validateGameData(data) {
        if (!data || typeof data !== 'object') return false;
        
        // Check required properties
        const requiredProps = ['gameHistory', 'currentShoe', 'predictions'];
        for (const prop of requiredProps) {
            if (!Array.isArray(data[prop])) {
                return false;
            }
        }
        
        // Validate game history entries
        if (data.gameHistory.length > 0) {
            const sampleEntry = data.gameHistory[0];
            if (!sampleEntry.outcome || !sampleEntry.timestamp) {
                return false;
            }
        }
        
        return true;
    }
    
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }
    
    loadSettings() {
        try {
            const settings = localStorage.getItem(this.settingsKey);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.getDefaultSettings();
        }
    }
    
    getDefaultSettings() {
        return {
            algorithmMode: 'balanced',
            autoSave: true,
            showConfidence: true,
            soundEnabled: false,
            theme: 'dark'
        };
    }
    
    savePerformanceData(performanceData) {
        try {
            const existingData = this.loadPerformanceData();
            const updatedData = {
                ...existingData,
                ...performanceData,
                lastUpdated: Date.now()
            };
            
            localStorage.setItem(this.performanceKey, JSON.stringify(updatedData));
            return true;
        } catch (error) {
            console.error('Failed to save performance data:', error);
            return false;
        }
    }
    
    loadPerformanceData() {
        try {
            const data = localStorage.getItem(this.performanceKey);
            return data ? JSON.parse(data) : this.getDefaultPerformanceData();
        } catch (error) {
            console.error('Failed to load performance data:', error);
            return this.getDefaultPerformanceData();
        }
    }
    
    getDefaultPerformanceData() {
        return {
            totalPredictions: 0,
            correctPredictions: 0,
            accuracyRate: 0,
            bestStreak: 0,
            currentStreak: 0,
            predictionHistory: [],
            modePerformance: {
                balanced: { correct: 0, total: 0 },
                conservative: { correct: 0, total: 0 },
                aggressive: { correct: 0, total: 0 }
            }
        };
    }
    
    saveShoeHistory(shoeData) {
        try {
            const existingHistory = this.loadShoeHistory();
            const updatedHistory = [...existingHistory, {
                ...shoeData,
                timestamp: Date.now(),
                shoeId: this.generateShoeId()
            }];
            
            // Keep only last 50 shoes to prevent storage bloat
            const trimmedHistory = updatedHistory.slice(-50);
            
            localStorage.setItem(this.historyKey, JSON.stringify(trimmedHistory));
            return true;
        } catch (error) {
            console.error('Failed to save shoe history:', error);
            return false;
        }
    }
    
    loadShoeHistory() {
        try {
            const history = localStorage.getItem(this.historyKey);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Failed to load shoe history:', error);
            return [];
        }
    }
    
    generateShoeId() {
        return `shoe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    exportData() {
        try {
            const gameData = this.loadGameData();
            const settings = this.loadSettings();
            const performance = this.loadPerformanceData();
            const shoeHistory = this.loadShoeHistory();
            
            const exportData = {
                gameData,
                settings,
                performance,
                shoeHistory,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Failed to export data:', error);
            return null;
        }
    }
    
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validate import data
            if (!this.validateImportData(data)) {
                throw new Error('Invalid import data format');
            }
            
            // Import each section
            if (data.gameData) {
                this.saveGameData(data.gameData);
            }
            
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            
            if (data.performance) {
                this.savePerformanceData(data.performance);
            }
            
            if (data.shoeHistory) {
                localStorage.setItem(this.historyKey, JSON.stringify(data.shoeHistory));
            }
            
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
    
    validateImportData(data) {
        if (!data || typeof data !== 'object') return false;
        
        // Check version compatibility
        if (data.version && data.version !== '1.0') {
            console.warn('Import data version mismatch');
        }
        
        // Validate each section if present
        if (data.gameData && !this.validateGameData(data.gameData)) {
            return false;
        }
        
        return true;
    }
    
    clearGameData() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to clear game data:', error);
            return false;
        }
    }
    
    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.historyKey);
            localStorage.removeItem(this.settingsKey);
            localStorage.removeItem(this.performanceKey);
            return true;
        } catch (error) {
            console.error('Failed to clear all data:', error);
            return false;
        }
    }
    
    getStorageUsage() {
        try {
            let totalSize = 0;
            const keys = [this.storageKey, this.historyKey, this.settingsKey, this.performanceKey];
            
            keys.forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    totalSize += data.length;
                }
            });
            
            return {
                totalBytes: totalSize,
                totalKB: (totalSize / 1024).toFixed(2),
                breakdown: {
                    gameData: this.getItemSize(this.storageKey),
                    history: this.getItemSize(this.historyKey),
                    settings: this.getItemSize(this.settingsKey),
                    performance: this.getItemSize(this.performanceKey)
                }
            };
        } catch (error) {
            console.error('Failed to get storage usage:', error);
            return null;
        }
    }
    
    getItemSize(key) {
        const data = localStorage.getItem(key);
        return data ? data.length : 0;
    }
    
    // Backup and restore functionality
    createBackup() {
        const backup = {
            data: this.exportData(),
            timestamp: Date.now(),
            version: '1.0'
        };
        
        return JSON.stringify(backup);
    }
    
    restoreFromBackup(backupData) {
        try {
            const backup = JSON.parse(backupData);
            
            if (!backup.data) {
                throw new Error('Invalid backup format');
            }
            
            return this.importData(backup.data);
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            return false;
        }
    }
    
    // Auto-save functionality
    enableAutoSave(interval = 30000) { // 30 seconds default
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            if (window.baccaratPredictor) {
                const gameData = {
                    gameHistory: window.baccaratPredictor.gameHistory,
                    currentShoe: window.baccaratPredictor.currentShoe,
                    predictions: window.baccaratPredictor.predictions
                };
                
                this.saveGameData(gameData);
            }
        }, interval);
    }
    
    disableAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
}
