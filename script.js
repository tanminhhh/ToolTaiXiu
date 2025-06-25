// Main application controller
class BaccaratPredictor {
    constructor() {
        this.gameHistory = [];
        this.currentShoe = [];
        this.predictions = [];
        this.algorithmMode = 'balanced';
        this.roadMaps = new RoadMaps();
        this.algorithms = new PredictionAlgorithms();
        this.storage = new StorageManager();
        
        this.initializeEventListeners();
        this.loadStoredData();
        this.updateDisplay();
    }
    
    initializeEventListeners() {
        // Outcome buttons
        document.getElementById('playerBtn').addEventListener('click', () => this.addOutcome('P'));
        document.getElementById('bankerBtn').addEventListener('click', () => this.addOutcome('B'));
        document.getElementById('tieBtn').addEventListener('click', () => this.addOutcome('T'));
        
        // Control buttons
        document.getElementById('undoBtn').addEventListener('click', () => this.undoLastOutcome());
        document.getElementById('deleteLastBtn').addEventListener('click', () => this.deleteLastOutcome());
        document.getElementById('newShoe').addEventListener('click', () => this.startNewShoe());
        document.getElementById('clearHistory').addEventListener('click', () => this.clearAllHistory());
        
        // Algorithm mode selector
        document.getElementById('algorithmMode').addEventListener('change', (e) => {
            this.algorithmMode = e.target.value;
            this.updatePredictions();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') this.addOutcome('P');
            if (e.key === 'b' || e.key === 'B') this.addOutcome('B');
            if (e.key === 't' || e.key === 'T') this.addOutcome('T');
            if (e.key === 'z' && e.ctrlKey) this.undoLastOutcome();
        });
    }
    
    loadStoredData() {
        const data = this.storage.loadGameData();
        if (data) {
            this.gameHistory = data.gameHistory || [];
            this.currentShoe = data.currentShoe || [];
            this.predictions = data.predictions || [];
        }
    }
    
    saveData() {
        this.storage.saveGameData({
            gameHistory: this.gameHistory,
            currentShoe: this.currentShoe,
            predictions: this.predictions
        });
    }
    
    addOutcome(outcome) {
        // Validate current prediction before adding new outcome
        if (this.predictions.length > 0) {
            const lastPrediction = this.predictions[this.predictions.length - 1];
            if (!lastPrediction.validated) {
                lastPrediction.actual = outcome;
                lastPrediction.correct = lastPrediction.predicted === outcome;
                lastPrediction.validated = true;
            }
        }
        
        // Add new outcome
        this.currentShoe.push(outcome);
        this.gameHistory.push({
            outcome: outcome,
            timestamp: Date.now(),
            shoeNumber: this.getShoeNumber()
        });
        
        // Update road maps
        this.roadMaps.addOutcome(outcome);
        
        // Generate new prediction
        this.updatePredictions();
        
        // Update display
        this.updateDisplay();
        
        // Save data
        this.saveData();
        
        // Visual feedback
        this.highlightOutcomeButton(outcome);
    }
    
    undoLastOutcome() {
        if (this.currentShoe.length === 0) return;
        
        // Remove last outcome
        this.currentShoe.pop();
        this.gameHistory.pop();
        
        // Remove last prediction if exists
        if (this.predictions.length > 0) {
            this.predictions.pop();
        }
        
        // Update road maps
        this.roadMaps.removeLastOutcome();
        
        // Update predictions
        this.updatePredictions();
        
        // Update display
        this.updateDisplay();
        
        // Save data
        this.saveData();
    }
    
    deleteLastOutcome() {
        if (this.currentShoe.length === 0) {
            alert('Không có kết quả để xóa!');
            return;
        }
        
        const lastOutcome = this.currentShoe[this.currentShoe.length - 1];
        const outcomeName = this.getOutcomeName(lastOutcome);
        
        if (confirm(`Xóa kết quả cuối cùng: ${outcomeName}?`)) {
            this.undoLastOutcome();
        }
    }
    
    startNewShoe() {
        if (confirm('Start a new shoe? This will clear current shoe data.')) {
            this.currentShoe = [];
            this.roadMaps.reset();
            this.updatePredictions();
            this.updateDisplay();
            this.saveData();
        }
    }
    
    clearAllHistory() {
        if (confirm('Clear all history? This action cannot be undone.')) {
            this.gameHistory = [];
            this.currentShoe = [];
            this.predictions = [];
            this.roadMaps.reset();
            this.storage.clearAllData();
            this.updateDisplay();
        }
    }
    
    updatePredictions() {
        if (this.currentShoe.length < 2) {
            this.clearPredictionDisplay();
            return;
        }
        
        // Generate predictions using multiple algorithms
        const prediction = this.algorithms.generatePrediction(
            this.currentShoe, 
            this.algorithmMode
        );
        
        // Add to predictions history
        this.predictions.push({
            predicted: prediction.primary.outcome,
            confidence: prediction.primary.confidence,
            alternative: prediction.alternative.outcome,
            altConfidence: prediction.alternative.confidence,
            timestamp: Date.now(),
            validated: false
        });
        
        // Update display
        this.displayPredictions(prediction);
        this.updateBettingSuggestions(prediction);
    }
    
    displayPredictions(prediction) {
        const primaryElement = document.getElementById('primaryPrediction');
        const primaryConfidence = document.getElementById('primaryConfidence');
        const altElement = document.getElementById('altPrediction');
        const altConfidence = document.getElementById('altConfidence');
        const reasoningElement = document.getElementById('analysisReasoning');
        
        // Display primary prediction
        primaryElement.textContent = this.getOutcomeName(prediction.primary.outcome);
        primaryElement.className = `prediction-outcome ${prediction.primary.outcome.toLowerCase()}`;
        primaryConfidence.textContent = `${Math.round(prediction.primary.confidence)}%`;
        
        // Display alternative prediction
        altElement.textContent = this.getOutcomeName(prediction.alternative.outcome);
        altElement.className = `prediction-outcome ${prediction.alternative.outcome.toLowerCase()}`;
        altConfidence.textContent = `${Math.round(prediction.alternative.confidence)}%`;
        
        // Display reasoning
        if (reasoningElement && prediction.reasoning) {
            let reasoning = this.translateReasoning(prediction.reasoning);
            
            // Thêm thông tin bridge nếu có
            if (prediction.bridgeDetails) {
                const bridgeInfo = prediction.bridgeDetails;
                reasoning += ` | ${bridgeInfo.advice}`;
            }
            
            reasoningElement.textContent = reasoning;
        }
    }
    
    translateReasoning(reasoning) {
        const translations = {
            'Advanced multi-algorithm analysis': 'Phân tích đa thuật toán tiên tiến',
            'Insufficient data - using statistical baseline': 'Dữ liệu chưa đủ - sử dụng baseline thống kê',
            'Neural network analysis': 'Phân tích mạng neural',
            'Multi-timeframe trend analysis': 'Phân tích xu hướng đa khung thời gian',
            'Linear regression analysis': 'Phân tích hồi quy tuyến tính',
            'Combined mathematical analysis': 'Phân tích toán học kết hợp',
            'Advanced Streak Analysis': 'Phân tích chuỗi tiên tiến',
            'Big Road column analysis': 'Phân tích cột Big Road',
            'Derived road pattern analysis': 'Phân tích pattern đường phụ',
            'Combined road map analysis': 'Phân tích roadmap kết hợp',
            'Cyclical pattern': 'Mẫu tuần hoàn',
            'Momentum analysis': 'Phân tích động lượng',
            'Card count analysis': 'Phân tích đếm bài',
            'Strong alternating behavior pattern': 'Mẫu hành vi xen kẽ mạnh',
            'Hot/Cold analysis': 'Phân tích nóng/lạnh',
            'Bridge technique analysis': 'Phân tích kỹ thuật cầu',
            'Tiếp tục theo cầu': 'Tiếp tục theo cầu',
            'Chuẩn bị bẻ cầu': 'Chuẩn bị bẻ cầu',
            'Bắt đầu cầu mới': 'Bắt đầu cầu mới',
            'continue_bridge': 'Tiếp tục cầu',
            'break_bridge': 'Bẻ cầu',
            'start_bridge': 'Bắt cầu mới'
        };
        
        for (let [english, vietnamese] of Object.entries(translations)) {
            if (reasoning.includes(english)) {
                return reasoning.replace(english, vietnamese);
            }
        }
        
        return reasoning;
    }
    
    updateGameHistory() {
        const historyContainer = document.getElementById('gameHistory');
        const handCountElement = document.getElementById('handCount');
        
        if (!historyContainer || !handCountElement) return;
        
        // Update hand count
        handCountElement.textContent = `${this.currentShoe.length} hands`;
        
        if (this.currentShoe.length === 0) {
            historyContainer.innerHTML = '<div class="history-placeholder">Chưa có dữ liệu game...</div>';
            return;
        }
        
        // Create history display with rows of outcomes
        const rowSize = 15; // Number of outcomes per row
        const rows = [];
        
        for (let i = 0; i < this.currentShoe.length; i += rowSize) {
            const rowOutcomes = this.currentShoe.slice(i, i + rowSize);
            rows.push(rowOutcomes);
        }
        
        let historyHTML = '';
        rows.forEach((row, rowIndex) => {
            historyHTML += '<div class="history-row">';
            
            row.forEach((outcome, index) => {
                const globalIndex = rowIndex * rowSize + index;
                const outcomeClass = outcome.toLowerCase();
                const symbol = this.getOutcomeSymbol(outcome);
                
                historyHTML += `
                    <div class="history-outcome ${outcomeClass}" 
                         title="Hand ${globalIndex + 1}: ${this.getOutcomeName(outcome)}"
                         data-index="${globalIndex}">
                        ${symbol}
                    </div>
                `;
            });
            
            historyHTML += '</div>';
            
            // Add separator between rows (except last row)
            if (rowIndex < rows.length - 1) {
                historyHTML += '<div class="history-separator"></div>';
            }
        });
        
        historyContainer.innerHTML = historyHTML;
        
        // Auto scroll to bottom to show recent outcomes
        historyContainer.scrollTop = historyContainer.scrollHeight;
        
        // Add click handlers for history outcomes
        this.addHistoryClickHandlers();
    }
    
    getOutcomeSymbol(outcome) {
        const symbols = { 'P': 'P', 'B': 'B', 'T': 'T' };
        return symbols[outcome] || '?';
    }
    
    addHistoryClickHandlers() {
        const historyOutcomes = document.querySelectorAll('.history-outcome');
        
        historyOutcomes.forEach(outcome => {
            outcome.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const outcomeValue = this.currentShoe[index];
                
                // Highlight the clicked outcome temporarily
                e.target.style.transform = 'scale(1.3)';
                e.target.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.8)';
                
                setTimeout(() => {
                    e.target.style.transform = '';
                    e.target.style.boxShadow = '';
                }, 500);
                
                // Ask if user wants to delete this specific outcome
                if (confirm(`Xóa hand ${index + 1}: ${this.getOutcomeName(outcomeValue)}?`)) {
                    this.deleteOutcomeAtIndex(index);
                }
            });
        });
    }
    
    updateBettingSuggestions(prediction) {
        const recommendedBetElement = document.getElementById('recommendedBet');
        const riskLevelElement = document.getElementById('riskLevel');
        const unitSizeElement = document.getElementById('unitSize');
        const strategyElement = document.getElementById('strategy');
        
        const suggestions = this.algorithms.generateBettingSuggestions(
            prediction, 
            this.currentShoe,
            this.algorithmMode
        );
        
        if (recommendedBetElement) recommendedBetElement.textContent = suggestions.recommendedBet;
        if (riskLevelElement) riskLevelElement.textContent = suggestions.riskLevel;
        if (unitSizeElement) unitSizeElement.textContent = suggestions.unitSize;
        if (strategyElement) strategyElement.textContent = suggestions.strategy;
    }
    
    updateDisplay() {
        this.updateStatistics();
        this.updateRoadMaps();
        this.updatePerformanceMetrics();
        this.updateGameHistory();
    }
    
    updateStatistics() {
        const stats = this.calculateShoeStatistics();
        
        const elements = {
            'totalHands': stats.totalHands,
            'playerWins': stats.playerWins,
            'bankerWins': stats.bankerWins,
            'ties': stats.ties,
            'currentStreak': stats.currentStreak,
            'longestStreak': stats.longestStreak
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
    
    updateRoadMaps() {
        // Update Big Road
        this.roadMaps.renderBigRoad(document.getElementById('bigRoad'));
        
        // Update Bead Plate
        this.roadMaps.renderBeadPlate(document.getElementById('beadPlate'));
        
        // Update Derived Roads
        this.roadMaps.renderBigEyeRoad(document.getElementById('bigEyeRoad'));
        this.roadMaps.renderSmallRoad(document.getElementById('smallRoad'));
        this.roadMaps.renderCockroachRoad(document.getElementById('cockroachRoad'));
    }
    
    updatePerformanceMetrics() {
        const validatedPredictions = this.predictions.filter(p => p.validated);
        const correctPredictions = validatedPredictions.filter(p => p.correct);
        const recent10 = validatedPredictions.slice(-10);
        const recent10Correct = recent10.filter(p => p.correct);
        
        document.getElementById('predictionsMade').textContent = validatedPredictions.length;
        document.getElementById('correctPredictions').textContent = correctPredictions.length;
        
        const accuracy = validatedPredictions.length > 0 
            ? (correctPredictions.length / validatedPredictions.length * 100).toFixed(1)
            : '0.0';
        document.getElementById('accuracyRate').textContent = `${accuracy}%`;
        
        const recent10Accuracy = recent10.length > 0
            ? (recent10Correct.length / recent10.length * 100).toFixed(1)
            : '0.0';
        document.getElementById('recent10Accuracy').textContent = `${recent10Accuracy}%`;
    }
    
    calculateShoeStatistics() {
        const nonTies = this.currentShoe.filter(outcome => outcome !== 'T');
        const playerWins = this.currentShoe.filter(outcome => outcome === 'P').length;
        const bankerWins = this.currentShoe.filter(outcome => outcome === 'B').length;
        const ties = this.currentShoe.filter(outcome => outcome === 'T').length;
        
        // Calculate streaks
        let currentStreak = '';
        let currentStreakCount = 0;
        let longestStreak = '';
        let longestStreakCount = 0;
        
        if (nonTies.length > 0) {
            const lastOutcome = nonTies[nonTies.length - 1];
            let count = 0;
            
            // Count current streak
            for (let i = nonTies.length - 1; i >= 0; i--) {
                if (nonTies[i] === lastOutcome) {
                    count++;
                } else {
                    break;
                }
            }
            
            currentStreak = `${this.getOutcomeName(lastOutcome)} ${count}`;
            currentStreakCount = count;
            
            // Find longest streak
            let maxCount = 0;
            let maxOutcome = '';
            let tempCount = 1;
            let tempOutcome = nonTies[0];
            
            for (let i = 1; i < nonTies.length; i++) {
                if (nonTies[i] === tempOutcome) {
                    tempCount++;
                } else {
                    if (tempCount > maxCount) {
                        maxCount = tempCount;
                        maxOutcome = tempOutcome;
                    }
                    tempCount = 1;
                    tempOutcome = nonTies[i];
                }
            }
            
            if (tempCount > maxCount) {
                maxCount = tempCount;
                maxOutcome = tempOutcome;
            }
            
            longestStreak = maxCount > 0 ? `${this.getOutcomeName(maxOutcome)} ${maxCount}` : '-';
        } else {
            currentStreak = '-';
            longestStreak = '-';
        }
        
        return {
            totalHands: this.currentShoe.length,
            playerWins,
            bankerWins,
            ties,
            currentStreak,
            longestStreak
        };
    }
    
    clearPredictionDisplay() {
        document.getElementById('primaryPrediction').textContent = '-';
        document.getElementById('primaryConfidence').textContent = '0%';
        document.getElementById('altPrediction').textContent = '-';
        document.getElementById('altConfidence').textContent = '0%';
        
        const suggestionsElement = document.getElementById('bettingSuggestions');
        suggestionsElement.innerHTML = `
            <div class="suggestion-item">
                <span class="suggestion-label">Recommended Bet:</span>
                <span class="suggestion-value">Chờ pattern rõ ràng</span>
            </div>
            <div class="suggestion-item">
                <span class="suggestion-label">Risk Level:</span>
                <span class="suggestion-value">-</span>
            </div>
            <div class="suggestion-item">
                <span class="suggestion-label">Unit Size:</span>
                <span class="suggestion-value">-</span>
            </div>
        `;
    }
    
    highlightOutcomeButton(outcome) {
        const buttonMap = { 'P': 'playerBtn', 'B': 'bankerBtn', 'T': 'tieBtn' };
        const button = document.getElementById(buttonMap[outcome]);
        
        button.classList.add('highlight');
        setTimeout(() => button.classList.remove('highlight'), 1000);
    }
    
    getOutcomeName(outcome) {
        const names = { 'P': 'Player', 'B': 'Banker', 'T': 'Tie' };
        return names[outcome] || 'Unknown';
    }
    
    getShoeNumber() {
        // Simple shoe numbering based on total hands
        return Math.floor(this.gameHistory.length / 80) + 1;
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.baccaratPredictor = new BaccaratPredictor();
});
