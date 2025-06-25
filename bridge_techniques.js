// Advanced Bridge (Cầu) Recognition and Prediction System
class BridgeTechniques {
    constructor() {
        this.bridgePatterns = {
            // Các mẫu cầu phổ biến
            doubleBridge: [], // Cầu đôi
            tripleBridge: [], // Cầu ba
            longBridge: [],   // Cầu dài
            shortBridge: [],  // Cầu ngắn
            mixedBridge: []   // Cầu hỗn hợp
        };
        
        this.bridgeHistory = [];
        this.bridgeStats = {
            totalBridges: 0,
            successfulPredictions: 0,
            failedPredictions: 0,
            currentBridgeLength: 0,
            longestBridge: 0
        };
    }
    
    // Nhận diện cầu từ lịch sử
    detectBridges(history) {
        const nonTies = history.filter(h => h !== 'T');
        if (nonTies.length < 6) return null;
        
        const bridges = this.identifyBridgePatterns(nonTies);
        return {
            detected: bridges,
            currentBridge: this.getCurrentBridge(nonTies),
            prediction: this.predictNextMove(bridges, nonTies)
        };
    }
    
    // Xác định các mẫu cầu
    identifyBridgePatterns(nonTies) {
        const patterns = [];
        let i = 0;
        
        while (i < nonTies.length - 3) {
            // Tìm cầu đôi (ABAB pattern)
            if (this.isDoubleBridge(nonTies, i)) {
                const bridge = this.extractDoubleBridge(nonTies, i);
                patterns.push({
                    type: 'double',
                    start: i,
                    length: bridge.length,
                    pattern: bridge.pattern,
                    strength: bridge.strength
                });
                i += bridge.length;
            }
            // Tìm cầu ba (ABABAB pattern)  
            else if (this.isTripleBridge(nonTies, i)) {
                const bridge = this.extractTripleBridge(nonTies, i);
                patterns.push({
                    type: 'triple',
                    start: i,
                    length: bridge.length,
                    pattern: bridge.pattern,
                    strength: bridge.strength
                });
                i += bridge.length;
            }
            // Tìm cầu dài
            else if (this.isLongBridge(nonTies, i)) {
                const bridge = this.extractLongBridge(nonTies, i);
                patterns.push({
                    type: 'long',
                    start: i,
                    length: bridge.length,
                    pattern: bridge.pattern,
                    strength: bridge.strength
                });
                i += bridge.length;
            }
            else {
                i++;
            }
        }
        
        return patterns;
    }
    
    // Kiểm tra cầu đôi (ABAB)
    isDoubleBridge(sequence, start) {
        if (start + 3 >= sequence.length) return false;
        
        const a = sequence[start];
        const b = sequence[start + 1];
        const a2 = sequence[start + 2];
        const b2 = sequence[start + 3];
        
        return a !== b && a === a2 && b === b2;
    }
    
    // Trích xuất cầu đôi
    extractDoubleBridge(sequence, start) {
        const pattern = [sequence[start], sequence[start + 1]];
        let length = 4;
        let strength = 1;
        
        // Mở rộng cầu nếu pattern tiếp tục
        while (start + length + 1 < sequence.length) {
            const expectedA = pattern[0];
            const expectedB = pattern[1];
            const actualA = sequence[start + length];
            const actualB = sequence[start + length + 1];
            
            if (actualA === expectedA && actualB === expectedB) {
                length += 2;
                strength++;
            } else {
                break;
            }
        }
        
        return { pattern, length, strength };
    }
    
    // Kiểm tra cầu ba (ABABAB)
    isTripleBridge(sequence, start) {
        if (start + 5 >= sequence.length) return false;
        
        const pattern = [sequence[start], sequence[start + 1]];
        for (let i = 0; i < 6; i++) {
            if (sequence[start + i] !== pattern[i % 2]) {
                return false;
            }
        }
        return true;
    }
    
    // Trích xuất cầu ba
    extractTripleBridge(sequence, start) {
        const pattern = [sequence[start], sequence[start + 1]];
        let length = 6;
        let strength = 3;
        
        // Mở rộng cầu
        while (start + length + 1 < sequence.length) {
            const expectedA = pattern[0];
            const expectedB = pattern[1];
            const actualA = sequence[start + length];
            const actualB = sequence[start + length + 1];
            
            if (actualA === expectedA && actualB === expectedB) {
                length += 2;
                strength++;
            } else {
                break;
            }
        }
        
        return { pattern, length, strength };
    }
    
    // Kiểm tra cầu dài
    isLongBridge(sequence, start) {
        if (start + 7 >= sequence.length) return false;
        
        const pattern = [sequence[start], sequence[start + 1]];
        let consecutiveMatches = 0;
        
        for (let i = 0; i < 8; i++) {
            if (sequence[start + i] === pattern[i % 2]) {
                consecutiveMatches++;
            } else {
                break;
            }
        }
        
        return consecutiveMatches >= 8;
    }
    
    // Trích xuất cầu dài
    extractLongBridge(sequence, start) {
        const pattern = [sequence[start], sequence[start + 1]];
        let length = 0;
        
        while (start + length < sequence.length && 
               sequence[start + length] === pattern[length % 2]) {
            length++;
        }
        
        const strength = Math.floor(length / 2);
        return { pattern, length, strength };
    }
    
    // Lấy cầu hiện tại
    getCurrentBridge(nonTies) {
        if (nonTies.length < 4) return null;
        
        const recent = nonTies.slice(-10); // Lấy 10 kết quả gần nhất
        const bridges = this.identifyBridgePatterns(recent);
        
        if (bridges.length === 0) return null;
        
        const lastBridge = bridges[bridges.length - 1];
        const bridgeEnd = lastBridge.start + lastBridge.length;
        
        // Kiểm tra xem cầu có đang tiếp tục không
        if (bridgeEnd >= recent.length - 2) {
            return {
                type: lastBridge.type,
                pattern: lastBridge.pattern,
                currentLength: lastBridge.length,
                expectedNext: lastBridge.pattern[(recent.length - lastBridge.start) % lastBridge.pattern.length],
                confidence: this.calculateBridgeConfidence(lastBridge)
            };
        }
        
        return null;
    }
    
    // Dự đoán nước đi tiếp theo
    predictNextMove(bridges, nonTies) {
        const currentBridge = this.getCurrentBridge(nonTies);
        
        if (!currentBridge) {
            return this.predictNewBridge(nonTies);
        }
        
        return this.predictBridgeContinuation(currentBridge, nonTies);
    }
    
    // Dự đoán tiếp tục cầu
    predictBridgeContinuation(bridge, nonTies) {
        const nextExpected = bridge.expectedNext;
        const confidence = bridge.confidence;
        
        // Phân tích khả năng bẻ cầu
        const breakProbability = this.calculateBridgeBreakProbability(bridge, nonTies);
        
        if (breakProbability > 30) {
            return {
                action: 'break_bridge',
                prediction: nextExpected === 'P' ? 'B' : 'P',
                confidence: breakProbability,
                reasoning: `Khả năng bẻ cầu ${bridge.type} cao (${Math.round(breakProbability)}%)`
            };
        }
        
        return {
            action: 'continue_bridge',
            prediction: nextExpected,
            confidence: confidence,
            reasoning: `Tiếp tục cầu ${bridge.type} - pattern ${bridge.pattern.join('')}`
        };
    }
    
    // Dự đoán cầu mới
    predictNewBridge(nonTies) {
        if (nonTies.length < 2) return null;
        
        const recent = nonTies.slice(-6);
        const lastTwo = recent.slice(-2);
        
        // Kiểm tra khả năng tạo cầu mới
        if (lastTwo[0] !== lastTwo[1]) {
            const newBridgeProbability = this.calculateNewBridgeProbability(recent);
            
            if (newBridgeProbability > 40) {
                return {
                    action: 'start_bridge',
                    prediction: lastTwo[0], // Lặp lại pattern
                    confidence: newBridgeProbability,
                    reasoning: `Khả năng tạo cầu mới với pattern ${lastTwo.join('')}`
                };
            }
        }
        
        return {
            action: 'wait',
            prediction: null,
            confidence: 0,
            reasoning: 'Chờ tín hiệu cầu rõ ràng hơn'
        };
    }
    
    // Tính toán độ tin cậy của cầu
    calculateBridgeConfidence(bridge) {
        let confidence = 50; // Base confidence
        
        // Tăng confidence theo độ dài
        confidence += Math.min(bridge.currentLength * 5, 30);
        
        // Tăng confidence theo loại cầu
        switch (bridge.type) {
            case 'triple':
                confidence += 15;
                break;
            case 'long':
                confidence += 20;
                break;
            case 'double':
                confidence += 10;
                break;
        }
        
        return Math.min(confidence, 85);
    }
    
    // Tính toán khả năng bẻ cầu
    calculateBridgeBreakProbability(bridge, nonTies) {
        let breakProb = 0;
        
        // Cầu càng dài càng dễ bị bẻ
        breakProb += Math.min(bridge.currentLength * 2, 25);
        
        // Phân tích xu hướng gần đây
        const recent = nonTies.slice(-5);
        const volatility = this.calculateVolatility(recent);
        breakProb += volatility * 20;
        
        // Kiểm tra pattern đảo ngược
        const reversalSignals = this.detectReversalSignals(nonTies);
        breakProb += reversalSignals * 15;
        
        return Math.min(breakProb, 80);
    }
    
    // Tính toán khả năng tạo cầu mới
    calculateNewBridgeProbability(recent) {
        let probability = 30; // Base probability
        
        // Phân tích độ ổn định gần đây
        const stability = this.calculateStability(recent);
        probability += stability * 25;
        
        // Kiểm tra pattern setup
        const patternSetup = this.detectPatternSetup(recent);
        probability += patternSetup * 20;
        
        return Math.min(probability, 75);
    }
    
    // Phát hiện tín hiệu đảo ngược
    detectReversalSignals(nonTies) {
        if (nonTies.length < 5) return 0;
        
        const recent = nonTies.slice(-5);
        let reversalScore = 0;
        
        // Kiểm tra sudden change
        const beforeLast = recent.slice(0, -2);
        const lastTwo = recent.slice(-2);
        
        const beforePattern = this.getMostFrequent(beforeLast);
        const lastPattern = lastTwo[0];
        
        if (beforePattern !== lastPattern) {
            reversalScore += 0.3;
        }
        
        // Kiểm tra streak break
        let streakLength = 1;
        for (let i = recent.length - 2; i >= 0; i--) {
            if (recent[i] === recent[recent.length - 1]) {
                streakLength++;
            } else {
                break;
            }
        }
        
        if (streakLength >= 3) {
            reversalScore += 0.4;
        }
        
        return reversalScore;
    }
    
    // Phát hiện pattern setup
    detectPatternSetup(recent) {
        if (recent.length < 4) return 0;
        
        const lastFour = recent.slice(-4);
        let setupScore = 0;
        
        // Kiểm tra alternating pattern
        const isAlternating = lastFour.every((val, idx) => {
            if (idx === 0) return true;
            return val !== lastFour[idx - 1];
        });
        
        if (isAlternating) {
            setupScore += 0.5;
        }
        
        // Kiểm tra symmetry
        const firstHalf = lastFour.slice(0, 2);
        const secondHalf = lastFour.slice(2);
        
        if (JSON.stringify(firstHalf) === JSON.stringify(secondHalf)) {
            setupScore += 0.6;
        }
        
        return setupScore;
    }
    
    // Tính toán độ ổn định
    calculateStability(sequence) {
        if (sequence.length < 3) return 0;
        
        let changes = 0;
        for (let i = 1; i < sequence.length; i++) {
            if (sequence[i] !== sequence[i - 1]) {
                changes++;
            }
        }
        
        const changeRate = changes / (sequence.length - 1);
        return 1 - changeRate; // Ít thay đổi = ổn định cao
    }
    
    // Tính toán độ biến động
    calculateVolatility(sequence) {
        if (sequence.length < 3) return 0;
        
        const stability = this.calculateStability(sequence);
        return 1 - stability;
    }
    
    // Lấy giá trị xuất hiện nhiều nhất
    getMostFrequent(array) {
        const frequency = {};
        array.forEach(item => {
            frequency[item] = (frequency[item] || 0) + 1;
        });
        
        return Object.keys(frequency).reduce((a, b) => 
            frequency[a] > frequency[b] ? a : b
        );
    }
    
    // Tạo báo cáo phân tích cầu
    generateBridgeAnalysis(history) {
        const nonTies = history.filter(h => h !== 'T');
        const bridges = this.detectBridges(nonTies);
        
        if (!bridges) {
            return {
                status: 'insufficient_data',
                message: 'Cần ít nhất 6 hand để phân tích cầu'
            };
        }
        
        return {
            status: 'analysis_complete',
            bridges: bridges.detected,
            currentBridge: bridges.currentBridge,
            prediction: bridges.prediction,
            stats: this.bridgeStats,
            advice: this.generateBridgeAdvice(bridges)
        };
    }
    
    // Tạo lời khuyên về cầu
    generateBridgeAdvice(bridges) {
        if (!bridges.prediction) {
            return 'Quan sát thêm để xác định pattern cầu';
        }
        
        const pred = bridges.prediction;
        
        switch (pred.action) {
            case 'continue_bridge':
                return `Tiếp tục theo cầu - Đặt ${pred.prediction}`;
            case 'break_bridge':
                return `Chuẩn bị bẻ cầu - Đặt ${pred.prediction}`;
            case 'start_bridge':
                return `Bắt đầu cầu mới - Đặt ${pred.prediction}`;
            default:
                return 'Chờ tín hiệu rõ ràng hơn';
        }
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BridgeTechniques;
}
