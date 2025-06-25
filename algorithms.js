// Advanced prediction algorithms for Baccarat
class PredictionAlgorithms {
    constructor() {
        this.patterns = {
            streaks: [],
            choppy: [],
            doubles: [],
            trends: [],
            cyclical: [],
            fibonacci: [],
            martingale: []
        };
        
        // Baccarat statistical constants
        this.BANKER_HOUSE_EDGE = 0.0106;
        this.PLAYER_HOUSE_EDGE = 0.0124;
        this.TIE_HOUSE_EDGE = 0.1436;
        
        // True probabilities (accounting for ties)
        this.TRUE_BANKER_PROB = 0.5068;
        this.TRUE_PLAYER_PROB = 0.4932;
        this.TRUE_TIE_PROB = 0.0954;
        
        // Pattern memory for advanced analysis
        this.patternMemory = [];
        this.shoeAnalysis = {
            penetration: 0,
            cardDistribution: {},
            tendencies: {}
        };
        
        // Bridge techniques system
        this.bridgeTechniques = new BridgeTechniques();
    }
    
    generatePrediction(history, mode = 'balanced') {
        if (history.length < 2) {
            return this.getDefaultPrediction();
        }
        
        // Advanced multi-layer analysis
        const streakAnalysis = this.analyzeAdvancedStreaks(history);
        const patternAnalysis = this.analyzeAdvancedPatterns(history);
        const trendAnalysis = this.analyzeAdvancedTrends(history);
        const mathematicalAnalysis = this.analyzeAdvancedMathematical(history);
        const roadMapAnalysis = this.analyzeAdvancedRoadMaps(history);
        const cyclicalAnalysis = this.analyzeCyclicalPatterns(history);
        const momentumAnalysis = this.analyzeMomentum(history);
        const cardCountingAnalysis = this.analyzeCardCounting(history);
        const behavioralAnalysis = this.analyzeBehavioralPatterns(history);
        const hotColdAnalysis = this.analyzeHotColdTrends(history);
        const bridgeAnalysis = this.analyzeBridgeTechniques(history);
        
        // Store pattern for future learning
        this.updatePatternMemory(history);
        
        // Combine all analyses with weighted scoring
        const combinedPrediction = this.combineAdvancedPredictions([
            { analysis: streakAnalysis, weight: this.getAnalysisWeight('streak', mode) },
            { analysis: patternAnalysis, weight: this.getAnalysisWeight('pattern', mode) },
            { analysis: trendAnalysis, weight: this.getAnalysisWeight('trend', mode) },
            { analysis: mathematicalAnalysis, weight: this.getAnalysisWeight('mathematical', mode) },
            { analysis: roadMapAnalysis, weight: this.getAnalysisWeight('roadmap', mode) },
            { analysis: cyclicalAnalysis, weight: this.getAnalysisWeight('cyclical', mode) },
            { analysis: momentumAnalysis, weight: this.getAnalysisWeight('momentum', mode) },
            { analysis: cardCountingAnalysis, weight: this.getAnalysisWeight('counting', mode) },
            { analysis: behavioralAnalysis, weight: this.getAnalysisWeight('behavioral', mode) },
            { analysis: hotColdAnalysis, weight: this.getAnalysisWeight('hotcold', mode) },
            { analysis: bridgeAnalysis, weight: this.getAnalysisWeight('bridge', mode) }
        ], mode);
        
        return combinedPrediction;
    }
    
    // Advanced streak analysis with multiple streak types
    analyzeAdvancedStreaks(history) {
        const nonTies = history.filter(h => h !== 'T');
        if (nonTies.length < 2) return this.getDefaultPrediction();
        
        const streakData = this.getDetailedStreakAnalysis(nonTies);
        const breakProbability = this.calculateAdvancedStreakBreakProbability(streakData);
        
        return this.formatPrediction(breakProbability, streakData.current, 'Advanced Streak Analysis');
    }
    
    // Enhanced pattern recognition with machine learning concepts
    analyzeAdvancedPatterns(history) {
        const patterns = this.identifyAdvancedPatterns(history);
        const neuralNetworkPrediction = this.simulateNeuralNetwork(patterns, history);
        
        return neuralNetworkPrediction;
    }
    
    // Multi-timeframe trend analysis
    analyzeAdvancedTrends(history) {
        const shortTerm = this.analyzeTrendWindow(history, 10);
        const mediumTerm = this.analyzeTrendWindow(history, 25);
        const longTerm = this.analyzeTrendWindow(history, 50);
        
        return this.combineTrendAnalysis(shortTerm, mediumTerm, longTerm);
    }
    
    // Mathematical analysis with regression and probability theory
    analyzeAdvancedMathematical(history) {
        const regressionAnalysis = this.performRegression(history);
        const probabilityAdjustment = this.calculateProbabilityAdjustment(history);
        const chiSquareTest = this.performChiSquareTest(history);
        
        return this.combineMathematicalAnalysis(regressionAnalysis, probabilityAdjustment, chiSquareTest);
    }
    
    // Enhanced road map analysis with derived road predictions
    analyzeAdvancedRoadMaps(history) {
        const roadMapPredictions = this.predictFromAllRoadMaps(history);
        const roadMapConsistency = this.analyzeRoadMapConsistency(history);
        
        return this.combineRoadMapPredictions(roadMapPredictions, roadMapConsistency);
    }
    
    // Cyclical pattern analysis
    analyzeCyclicalPatterns(history) {
        const cycles = this.detectCycles(history);
        if (cycles.length === 0) return this.getDefaultPrediction();
        
        const cyclePrediction = this.predictFromCycles(cycles, history);
        return cyclePrediction;
    }
    
    // Momentum analysis based on recent changes
    analyzeMomentum(history) {
        const momentum = this.calculateMomentum(history);
        const momentumStrength = this.calculateMomentumStrength(momentum);
        
        return this.predictFromMomentum(momentum, momentumStrength);
    }
    
    // Simplified card counting simulation
    analyzeCardCounting(history) {
        const cardCount = this.simulateCardCount(history);
        const countPrediction = this.predictFromCount(cardCount);
        
        return countPrediction;
    }
    
    // Behavioral pattern analysis
    analyzeBehavioralPatterns(history) {
        const behaviorPatterns = this.identifyBehaviorPatterns(history);
        const behaviorPrediction = this.predictFromBehavior(behaviorPatterns);
        
        return behaviorPrediction;
    }
    
    // Hot and cold trend analysis
    analyzeHotColdTrends(history) {
        const hotColdData = this.calculateHotColdTrends(history);
        const hotColdPrediction = this.predictFromHotCold(hotColdData);
        
        return hotColdPrediction;
    }
    
    analyzeStreaks(history) {
        const nonTies = history.filter(h => h !== 'T');
        if (nonTies.length < 2) return this.getDefaultPrediction();
        
        const lastOutcome = nonTies[nonTies.length - 1];
        let streakLength = 1;
        
        // Count current streak
        for (let i = nonTies.length - 2; i >= 0; i--) {
            if (nonTies[i] === lastOutcome) {
                streakLength++;
            } else {
                break;
            }
        }
        
        // Analyze streak patterns
        const streakBreakProbability = this.calculateStreakBreakProbability(streakLength, lastOutcome);
        const streakContinueProbability = 1 - streakBreakProbability;
        
        const opposite = lastOutcome === 'P' ? 'B' : 'P';
        
        return {
            primary: {
                outcome: streakBreakProbability > 0.5 ? opposite : lastOutcome,
                confidence: Math.max(streakBreakProbability, streakContinueProbability) * 100
            },
            alternative: {
                outcome: streakBreakProbability > 0.5 ? lastOutcome : opposite,
                confidence: Math.min(streakBreakProbability, streakContinueProbability) * 100
            },
            reasoning: `Streak analysis: ${lastOutcome} streak of ${streakLength}`
        };
    }
    
    analyzePatterns(history) {
        const patterns = this.identifyPatterns(history);
        const mostRelevantPattern = this.findMostRelevantPattern(patterns, history);
        
        if (!mostRelevantPattern) {
            return this.getDefaultPrediction();
        }
        
        const prediction = this.predictFromPattern(mostRelevantPattern, history);
        return prediction;
    }
    
    analyzeTrends(history) {
        const nonTies = history.filter(h => h !== 'T');
        if (nonTies.length < 10) return this.getDefaultPrediction();
        
        // Analyze recent trend (last 20 hands)
        const recentHands = nonTies.slice(-20);
        const playerCount = recentHands.filter(h => h === 'P').length;
        const bankerCount = recentHands.filter(h => h === 'B').length;
        
        // Calculate trend direction
        const trendStrength = Math.abs(playerCount - bankerCount) / recentHands.length;
        const dominantSide = playerCount > bankerCount ? 'P' : 'B';
        const weakerSide = dominantSide === 'P' ? 'B' : 'P';
        
        // Trend reversal probability
        const reversalProbability = this.calculateTrendReversalProbability(trendStrength);
        
        return {
            primary: {
                outcome: reversalProbability > 0.5 ? weakerSide : dominantSide,
                confidence: Math.max(reversalProbability, 1 - reversalProbability) * 100
            },
            alternative: {
                outcome: reversalProbability > 0.5 ? dominantSide : weakerSide,
                confidence: Math.min(reversalProbability, 1 - reversalProbability) * 100
            },
            reasoning: `Trend analysis: ${dominantSide} trending with strength ${trendStrength.toFixed(2)}`
        };
    }
    
    analyzeMathematical(history) {
        const nonTies = history.filter(h => h !== 'T');
        if (nonTies.length < 5) return this.getDefaultPrediction();
        
        // Calculate probability adjustments
        const playerWins = nonTies.filter(h => h === 'P').length;
        const bankerWins = nonTies.filter(h => h === 'B').length;
        const totalNonTies = playerWins + bankerWins;
        
        // Theoretical probabilities (including house edge)
        const theoreticalBankerProb = 0.5068;
        const theoreticalPlayerProb = 0.4932;
        
        // Current observed probabilities
        const observedPlayerProb = playerWins / totalNonTies;
        const observedBankerProb = bankerWins / totalNonTies;
        
        // Deviation from theoretical
        const playerDeviation = observedPlayerProb - theoreticalPlayerProb;
        const bankerDeviation = observedBankerProb - theoreticalBankerProb;
        
        // Regression to mean tendency
        const regressionFactor = Math.min(totalNonTies / 100, 1); // Stronger regression with more data
        
        let predictedOutcome, confidence;
        if (Math.abs(playerDeviation) > Math.abs(bankerDeviation)) {
            // Player is more deviated, predict correction
            predictedOutcome = playerDeviation > 0 ? 'B' : 'P';
            confidence = Math.abs(playerDeviation) * regressionFactor * 100;
        } else {
            // Banker is more deviated, predict correction
            predictedOutcome = bankerDeviation > 0 ? 'P' : 'B';
            confidence = Math.abs(bankerDeviation) * regressionFactor * 100;
        }
        
        confidence = Math.min(confidence, 85); // Cap confidence
        
        return {
            primary: {
                outcome: predictedOutcome,
                confidence: confidence
            },
            alternative: {
                outcome: predictedOutcome === 'P' ? 'B' : 'P',
                confidence: 100 - confidence
            },
            reasoning: `Mathematical analysis: Player dev ${playerDeviation.toFixed(3)}, Banker dev ${bankerDeviation.toFixed(3)}`
        };
    }
    
    analyzeRoadMaps(history) {
        // Analyze patterns in road map formations
        const bigRoadPattern = this.analyzeBigRoadPattern(history);
        const derivedRoadConsistency = this.analyzeDerivedRoadConsistency(history);
        
        // Combine road map insights
        const roadMapPrediction = this.combineRoadMapAnalysis(bigRoadPattern, derivedRoadConsistency);
        
        return roadMapPrediction;
    }
    
    analyzeBigRoadPattern(history) {
        const nonTies = history.filter(h => h !== 'T');
        if (nonTies.length < 6) return this.getDefaultPrediction();
        
        // Look for column patterns
        const columns = this.getBigRoadColumns(nonTies);
        if (columns.length < 2) return this.getDefaultPrediction();
        
        const lastColumn = columns[columns.length - 1];
        const previousColumns = columns.slice(0, -1);
        
        // Analyze column completion tendency
        const columnCompletionPattern = this.analyzeColumnCompletion(previousColumns, lastColumn);
        
        return columnCompletionPattern;
    }
    
    getBigRoadColumns(nonTies) {
        const columns = [];
        let currentColumn = [];
        let lastOutcome = null;
        
        for (const outcome of nonTies) {
            if (outcome !== lastOutcome) {
                if (currentColumn.length > 0) {
                    columns.push([...currentColumn]);
                }
                currentColumn = [outcome];
                lastOutcome = outcome;
            } else {
                currentColumn.push(outcome);
            }
        }
        
        if (currentColumn.length > 0) {
            columns.push(currentColumn);
        }
        
        return columns;
    }
    
    analyzeColumnCompletion(previousColumns, currentColumn) {
        if (previousColumns.length === 0) return this.getDefaultPrediction();
        
        const currentOutcome = currentColumn[0];
        const currentLength = currentColumn.length;
        
        // Find similar column starts in history
        const similarColumns = previousColumns.filter(col => col[0] === currentOutcome);
        
        if (similarColumns.length === 0) {
            return this.getDefaultPrediction();
        }
        
        // Analyze continuation vs switching pattern
        const continuations = similarColumns.filter(col => col.length > currentLength).length;
        const switches = similarColumns.length - continuations;
        
        const continueProbability = continuations / similarColumns.length;
        const switchProbability = switches / similarColumns.length;
        
        const opposite = currentOutcome === 'P' ? 'B' : 'P';
        
        return {
            primary: {
                outcome: continueProbability > switchProbability ? currentOutcome : opposite,
                confidence: Math.max(continueProbability, switchProbability) * 100
            },
            alternative: {
                outcome: continueProbability > switchProbability ? opposite : currentOutcome,
                confidence: Math.min(continueProbability, switchProbability) * 100
            },
            reasoning: `Big Road column analysis: ${similarColumns.length} similar patterns found`
        };
    }
    
    analyzeDerivedRoadConsistency(history) {
        // Simplified derived road analysis
        // In a full implementation, this would analyze Big Eye, Small Road, and Cockroach Road patterns
        return this.getDefaultPrediction();
    }
    
    combineRoadMapAnalysis(bigRoadPattern, derivedRoadConsistency) {
        // Weight big road pattern more heavily for now
        return bigRoadPattern;
    }
    
    combinePredictions(predictions, mode) {
        const validPredictions = predictions.filter(p => p.primary && p.alternative);
        if (validPredictions.length === 0) return this.getDefaultPrediction();
        
        // Weight predictions based on mode
        const weights = this.getModeWeights(mode);
        
        // Calculate weighted scores for each outcome
        const scores = { P: 0, B: 0, T: 0 };
        let totalWeight = 0;
        
        validPredictions.forEach((prediction, index) => {
            const weight = weights[index] || 1;
            const primaryOutcome = prediction.primary.outcome;
            const altOutcome = prediction.alternative.outcome;
            
            scores[primaryOutcome] += (prediction.primary.confidence / 100) * weight;
            scores[altOutcome] += (prediction.alternative.confidence / 100) * weight;
            totalWeight += weight;
        });
        
        // Normalize scores
        Object.keys(scores).forEach(outcome => {
            scores[outcome] = scores[outcome] / totalWeight * 100;
        });
        
        // Find top two predictions
        const sortedOutcomes = Object.entries(scores)
            .sort(([,a], [,b]) => b - a)
            .filter(([outcome]) => outcome !== 'T'); // Exclude ties for main predictions
        
        const primaryOutcome = sortedOutcomes[0][0];
        const primaryConfidence = sortedOutcomes[0][1];
        const altOutcome = sortedOutcomes[1][0];
        const altConfidence = sortedOutcomes[1][1];
        
        return {
            primary: {
                outcome: primaryOutcome,
                confidence: Math.min(primaryConfidence, 95) // Cap confidence
            },
            alternative: {
                outcome: altOutcome,
                confidence: Math.min(altConfidence, 95)
            },
            reasoning: `Combined analysis using ${validPredictions.length} algorithms`
        };
    }
    
    getModeWeights(mode) {
        switch (mode) {
            case 'conservative':
                return [1.5, 1.2, 0.8, 1.3, 1.0]; // Favor streak and mathematical analysis
            case 'aggressive':
                return [1.0, 1.5, 1.3, 0.8, 1.2]; // Favor pattern and trend analysis
            case 'balanced':
            default:
                return [1.0, 1.0, 1.0, 1.0, 1.0]; // Equal weighting
        }
    }
    
    calculateStreakBreakProbability(streakLength, outcome) {
        // Empirical probabilities based on Baccarat statistics
        const baseBreakProbability = outcome === 'B' ? 0.4932 : 0.5068;
        
        // Streak length factor (longer streaks more likely to break)
        const streakFactor = Math.min(streakLength * 0.1, 0.4);
        
        return Math.min(baseBreakProbability + streakFactor, 0.85);
    }
    
    calculateTrendReversalProbability(trendStrength) {
        // Stronger trends have higher reversal probability due to regression to mean
        return Math.min(0.3 + (trendStrength * 0.5), 0.8);
    }
    
    identifyPatterns(history) {
        const patterns = [];
        const nonTies = history.filter(h => h !== 'T');
        
        // Look for repeating sequences
        for (let length = 2; length <= Math.min(8, Math.floor(nonTies.length / 3)); length++) {
            for (let start = 0; start <= nonTies.length - length * 2; start++) {
                const pattern = nonTies.slice(start, start + length);
                const occurrences = this.findPatternOccurrences(nonTies, pattern);
                
                if (occurrences.length >= 2) {
                    patterns.push({
                        sequence: pattern,
                        occurrences: occurrences,
                        strength: occurrences.length,
                        length: length
                    });
                }
            }
        }
        
        return patterns;
    }
    
    findPatternOccurrences(history, pattern) {
        const occurrences = [];
        
        for (let i = 0; i <= history.length - pattern.length; i++) {
            let match = true;
            for (let j = 0; j < pattern.length; j++) {
                if (history[i + j] !== pattern[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                occurrences.push(i);
            }
        }
        
        return occurrences;
    }
    
    findMostRelevantPattern(patterns, history) {
        if (patterns.length === 0) return null;
        
        // Score patterns based on recency and strength
        const scoredPatterns = patterns.map(pattern => {
            const lastOccurrence = Math.max(...pattern.occurrences);
            const recencyScore = (lastOccurrence / history.length) * 100;
            const strengthScore = pattern.strength * 20;
            const lengthScore = pattern.length * 10;
            
            return {
                ...pattern,
                score: recencyScore + strengthScore + lengthScore
            };
        });
        
        return scoredPatterns.sort((a, b) => b.score - a.score)[0];
    }
    
    predictFromPattern(pattern, history) {
        const nonTies = history.filter(h => h !== 'T');
        const lastOccurrence = Math.max(...pattern.occurrences);
        const patternEnd = lastOccurrence + pattern.length;
        
        // Check if current position might be continuation of pattern
        const currentPosition = nonTies.length;
        const patternPosition = (currentPosition - lastOccurrence - pattern.length) % pattern.length;
        
        if (patternPosition >= 0 && patternPosition < pattern.length) {
            const predictedOutcome = pattern.sequence[patternPosition];
            const confidence = Math.min(pattern.strength * 15, 80);
            
            return {
                primary: {
                    outcome: predictedOutcome,
                    confidence: confidence
                },
                alternative: {
                    outcome: predictedOutcome === 'P' ? 'B' : 'P',
                    confidence: 100 - confidence
                },
                reasoning: `Pattern analysis: Found ${pattern.strength} occurrences of sequence`
            };
        }
        
        return this.getDefaultPrediction();
    }
    
    generateBettingSuggestions(prediction, history, mode) {
        const confidence = prediction.primary.confidence;
        const outcome = prediction.primary.outcome;
        
        // Risk assessment
        let riskLevel, unitSize, strategy;
        
        if (confidence >= 70) {
            riskLevel = mode === 'conservative' ? 'Medium' : 'High';
            unitSize = mode === 'conservative' ? '2-3 units' : '3-5 units';
            strategy = 'Strong Signal Betting';
        } else if (confidence >= 55) {
            riskLevel = 'Medium';
            unitSize = mode === 'aggressive' ? '2-3 units' : '1-2 units';
            strategy = 'Moderate Signal Betting';
        } else {
            riskLevel = 'Low';
            unitSize = '1 unit';
            strategy = 'Wait for Better Signal';
        }
        
        // Adjust for streak situations
        const nonTies = history.filter(h => h !== 'T');
        if (nonTies.length >= 3) {
            const lastOutcome = nonTies[nonTies.length - 1];
            let streakLength = 1;
            
            for (let i = nonTies.length - 2; i >= 0; i--) {
                if (nonTies[i] === lastOutcome) {
                    streakLength++;
                } else {
                    break;
                }
            }
            
            if (streakLength >= 4) {
                strategy += ' (Streak Break)';
                if (mode === 'conservative') {
                    unitSize = '1 unit';
                    riskLevel = 'Low';
                }
            }
        }
        
        return {
            recommendedBet: confidence >= 50 ? this.getOutcomeName(outcome) : 'Wait',
            riskLevel,
            unitSize,
            strategy
        };
    }
    
    getOutcomeName(outcome) {
        const names = { 'P': 'Player', 'B': 'Banker', 'T': 'Tie' };
        return names[outcome] || 'Unknown';
    }
    
    // Advanced analysis implementation methods
    getDetailedStreakAnalysis(nonTies) {
        const current = nonTies[nonTies.length - 1];
        let streakLength = 1;
        let totalStreaks = { P: [], B: [] };
        let currentStreak = 1;
        let lastOutcome = nonTies[0];
        
        // Count current streak
        for (let i = nonTies.length - 2; i >= 0; i--) {
            if (nonTies[i] === current) {
                streakLength++;
            } else {
                break;
            }
        }
        
        // Analyze all streaks
        for (let i = 1; i < nonTies.length; i++) {
            if (nonTies[i] === lastOutcome) {
                currentStreak++;
            } else {
                totalStreaks[lastOutcome].push(currentStreak);
                currentStreak = 1;
                lastOutcome = nonTies[i];
            }
        }
        totalStreaks[lastOutcome].push(currentStreak);
        
        return {
            current: current,
            length: streakLength,
            allStreaks: totalStreaks,
            averageStreaks: {
                P: totalStreaks.P.length > 0 ? totalStreaks.P.reduce((a, b) => a + b, 0) / totalStreaks.P.length : 0,
                B: totalStreaks.B.length > 0 ? totalStreaks.B.reduce((a, b) => a + b, 0) / totalStreaks.B.length : 0
            }
        };
    }
    
    calculateAdvancedStreakBreakProbability(streakData) {
        const { current, length, averageStreaks } = streakData;
        const baseProb = current === 'B' ? this.TRUE_PLAYER_PROB : this.TRUE_BANKER_PROB;
        
        // Streak length factor (exponential decay)
        const streakFactor = 1 - Math.exp(-length / 3);
        
        // Average streak comparison
        const avgComparison = length > averageStreaks[current] ? 0.2 : 0;
        
        // Fibonacci-like progression for very long streaks
        const fibonacciFactor = length > 7 ? Math.min(0.3, (length - 7) * 0.05) : 0;
        
        return Math.min(baseProb + streakFactor + avgComparison + fibonacciFactor, 0.9);
    }
    
    identifyAdvancedPatterns(history) {
        const patterns = [];
        const nonTies = history.filter(h => h !== 'T');
        
        // Multi-length pattern detection
        for (let len = 2; len <= Math.min(12, Math.floor(nonTies.length / 2)); len++) {
            const patternMap = new Map();
            
            for (let i = 0; i <= nonTies.length - len; i++) {
                const pattern = nonTies.slice(i, i + len).join('');
                patternMap.set(pattern, (patternMap.get(pattern) || 0) + 1);
            }
            
            // Find significant patterns
            for (let [pattern, count] of patternMap) {
                if (count >= 2) {
                    const significance = this.calculatePatternSignificance(pattern, count, nonTies.length);
                    patterns.push({
                        sequence: pattern.split(''),
                        occurrences: count,
                        length: len,
                        significance: significance,
                        lastSeen: this.findLastOccurrence(nonTies, pattern.split(''))
                    });
                }
            }
        }
        
        return patterns.sort((a, b) => b.significance - a.significance);
    }
    
    simulateNeuralNetwork(patterns, history) {
        if (patterns.length === 0) return this.getDefaultPrediction();
        
        const weights = this.calculateNeuralWeights(patterns, history);
        const prediction = this.neuralNetworkPredict(weights, patterns);
        
        return prediction;
    }
    
    calculateNeuralWeights(patterns, history) {
        const weights = { P: 0, B: 0 };
        
        patterns.forEach(pattern => {
            const nextOutcome = this.predictNextFromPattern(pattern, history);
            const weight = pattern.significance * (1 - (Date.now() - pattern.lastSeen) / 1000000);
            
            if (nextOutcome === 'P') weights.P += weight;
            else if (nextOutcome === 'B') weights.B += weight;
        });
        
        return weights;
    }
    
    neuralNetworkPredict(weights, patterns) {
        const total = weights.P + weights.B;
        if (total === 0) return this.getDefaultPrediction();
        
        const pProb = weights.P / total;
        const bProb = weights.B / total;
        
        return {
            primary: {
                outcome: pProb > bProb ? 'P' : 'B',
                confidence: Math.max(pProb, bProb) * 100
            },
            alternative: {
                outcome: pProb > bProb ? 'B' : 'P',
                confidence: Math.min(pProb, bProb) * 100
            },
            reasoning: `Neural network analysis from ${patterns.length} patterns`
        };
    }
    
    analyzeTrendWindow(history, windowSize) {
        const nonTies = history.filter(h => h !== 'T');
        if (nonTies.length < windowSize) return { trend: 'neutral', strength: 0 };
        
        const window = nonTies.slice(-windowSize);
        const pCount = window.filter(h => h === 'P').length;
        const bCount = window.filter(h => h === 'B').length;
        
        const strength = Math.abs(pCount - bCount) / windowSize;
        const trend = pCount > bCount ? 'P' : 'B';
        
        return { trend, strength, window: windowSize };
    }
    
    combineTrendAnalysis(shortTerm, mediumTerm, longTerm) {
        const trends = [shortTerm, mediumTerm, longTerm];
        const weights = [0.5, 0.3, 0.2]; // Weight recent trends more heavily
        
        let pScore = 0, bScore = 0;
        
        trends.forEach((trend, index) => {
            const weight = weights[index] * trend.strength;
            if (trend.trend === 'P') pScore += weight;
            else bScore += weight;
        });
        
        const total = pScore + bScore;
        if (total === 0) return this.getDefaultPrediction();
        
        return {
            primary: {
                outcome: pScore > bScore ? 'P' : 'B',
                confidence: Math.max(pScore, bScore) / total * 100
            },
            alternative: {
                outcome: pScore > bScore ? 'B' : 'P',
                confidence: Math.min(pScore, bScore) / total * 100
            },
            reasoning: 'Multi-timeframe trend analysis'
        };
    }
    
    performRegression(history) {
        const nonTies = history.filter(h => h !== 'T');
        if (nonTies.length < 10) return this.getDefaultPrediction();
        
        const y = nonTies.map(h => h === 'P' ? 1 : 0);
        const x = Array.from({length: nonTies.length}, (_, i) => i);
        
        const regression = this.linearRegression(x, y);
        const nextPrediction = regression.slope * nonTies.length + regression.intercept;
        
        return {
            primary: {
                outcome: nextPrediction > 0.5 ? 'P' : 'B',
                confidence: Math.abs(nextPrediction - 0.5) * 200
            },
            alternative: {
                outcome: nextPrediction > 0.5 ? 'B' : 'P',
                confidence: 100 - Math.abs(nextPrediction - 0.5) * 200
            },
            reasoning: 'Linear regression analysis'
        };
    }
    
    linearRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return { slope, intercept };
    }
    
    calculateProbabilityAdjustment(history) {
        const nonTies = history.filter(h => h !== 'T');
        const pCount = nonTies.filter(h => h === 'P').length;
        const bCount = nonTies.filter(h => h === 'B').length;
        
        const observedPProb = pCount / nonTies.length;
        const observedBProb = bCount / nonTies.length;
        
        const pDeviation = observedPProb - this.TRUE_PLAYER_PROB;
        const bDeviation = observedBProb - this.TRUE_BANKER_PROB;
        
        // Regression to mean
        const regressionStrength = Math.min(nonTies.length / 100, 1);
        
        return {
            predictedOutcome: Math.abs(pDeviation) > Math.abs(bDeviation) 
                ? (pDeviation > 0 ? 'B' : 'P')
                : (bDeviation > 0 ? 'P' : 'B'),
            confidence: Math.max(Math.abs(pDeviation), Math.abs(bDeviation)) * regressionStrength * 100
        };
    }
    
    performChiSquareTest(history) {
        const nonTies = history.filter(h => h !== 'T');
        if (nonTies.length < 20) return { isSignificant: false, confidence: 0 };
        
        const observed = {
            P: nonTies.filter(h => h === 'P').length,
            B: nonTies.filter(h => h === 'B').length
        };
        
        const expected = {
            P: nonTies.length * this.TRUE_PLAYER_PROB,
            B: nonTies.length * this.TRUE_BANKER_PROB
        };
        
        const chiSquare = Math.pow(observed.P - expected.P, 2) / expected.P +
                         Math.pow(observed.B - expected.B, 2) / expected.B;
        
        const isSignificant = chiSquare > 3.84; // 95% confidence level
        
        return {
            isSignificant,
            confidence: isSignificant ? Math.min(chiSquare * 10, 80) : 0,
            favoredOutcome: observed.P > expected.P ? 'B' : 'P' // Opposite due to regression
        };
    }
    
    combineMathematicalAnalysis(regression, probability, chiSquare) {
        const analyses = [regression, probability];
        const weights = [0.4, 0.6];
        
        let pScore = 0, bScore = 0;
        
        analyses.forEach((analysis, index) => {
            if (analysis.primary) {
                const weight = weights[index];
                if (analysis.primary.outcome === 'P') pScore += weight * analysis.primary.confidence;
                else bScore += weight * analysis.primary.confidence;
            }
        });
        
        // Apply chi-square adjustment
        if (chiSquare.isSignificant) {
            if (chiSquare.favoredOutcome === 'P') pScore += chiSquare.confidence * 0.3;
            else bScore += chiSquare.confidence * 0.3;
        }
        
        const total = pScore + bScore;
        if (total === 0) return this.getDefaultPrediction();
        
        return {
            primary: {
                outcome: pScore > bScore ? 'P' : 'B',
                confidence: Math.max(pScore, bScore) / total * 100
            },
            alternative: {
                outcome: pScore > bScore ? 'B' : 'P',
                confidence: Math.min(pScore, bScore) / total * 100
            },
            reasoning: 'Combined mathematical analysis'
        };
    }
    
    // Additional helper methods
    formatPrediction(breakProbability, currentOutcome, reasoning) {
        const opposite = currentOutcome === 'P' ? 'B' : 'P';
        
        return {
            primary: {
                outcome: breakProbability > 0.5 ? opposite : currentOutcome,
                confidence: Math.max(breakProbability, 1 - breakProbability) * 100
            },
            alternative: {
                outcome: breakProbability > 0.5 ? currentOutcome : opposite,
                confidence: Math.min(breakProbability, 1 - breakProbability) * 100
            },
            reasoning: reasoning
        };
    }
    
    updatePatternMemory(history) {
        const recent = history.slice(-10);
        this.patternMemory.push({
            pattern: recent,
            timestamp: Date.now(),
            context: this.analyzeContext(history)
        });
        
        // Keep only recent patterns
        if (this.patternMemory.length > 100) {
            this.patternMemory = this.patternMemory.slice(-100);
        }
    }
    
    analyzeContext(history) {
        return {
            shoePosition: history.length,
            recentTrend: this.getRecentTrend(history),
            volatility: this.calculateVolatility(history)
        };
    }
    
    getRecentTrend(history) {
        const recent = history.filter(h => h !== 'T').slice(-10);
        if (recent.length < 5) return 'neutral';
        
        const pCount = recent.filter(h => h === 'P').length;
        const bCount = recent.filter(h => h === 'B').length;
        
        if (pCount > bCount * 1.5) return 'player';
        if (bCount > pCount * 1.5) return 'banker';
        return 'neutral';
    }
    
    calculateVolatility(history) {
        const nonTies = history.filter(h => h !== 'T');
        if (nonTies.length < 10) return 0;
        
        let switches = 0;
        for (let i = 1; i < nonTies.length; i++) {
            if (nonTies[i] !== nonTies[i-1]) switches++;
        }
        
        return switches / (nonTies.length - 1);
    }
    
    // Add missing advanced method implementations
    
    analyzeRoadMapConsistency(history) {
        if (history.length < 15) return this.getDefaultPrediction();
        
        const roadMaps = {
            bigEye: this.generateBigEyeRoad(history.filter(h => h !== 'T')),
            small: this.generateSmallRoad(history.filter(h => h !== 'T')),
            cockroach: this.generateCockroachRoad(history.filter(h => h !== 'T'))
        };
        
        let consistentPredictions = { P: 0, B: 0 };
        
        Object.values(roadMaps).forEach(road => {
            if (road.length >= 5) {
                const recent = road.slice(-3);
                const redCount = recent.filter(r => r === 'R').length;
                if (redCount >= 2) consistentPredictions.P++;
                else consistentPredictions.B++;
            }
        });
        
        const total = consistentPredictions.P + consistentPredictions.B;
        if (total === 0) return this.getDefaultPrediction();
        
        const pProb = consistentPredictions.P / total;
        const confidence = Math.abs(pProb - 0.5) * 200;
        
        return {
            primary: {
                outcome: pProb > 0.5 ? 'P' : 'B',
                confidence: Math.max(confidence, 50)
            },
            alternative: {
                outcome: pProb > 0.5 ? 'B' : 'P',
                confidence: 100 - Math.max(confidence, 50)
            },
            reasoning: 'Road map consistency analysis'
        };
    }
    
    combineRoadMapPredictions(roadMapPredictions, consistency) {
        const predictions = Object.values(roadMapPredictions).filter(p => p.primary);
        if (predictions.length === 0) return consistency || this.getDefaultPrediction();
        
        let pScore = 0, bScore = 0;
        predictions.forEach(pred => {
            if (pred.primary.outcome === 'P') pScore += pred.primary.confidence;
            else if (pred.primary.outcome === 'B') bScore += pred.primary.confidence;
        });
        
        if (consistency && consistency.primary) {
            if (consistency.primary.outcome === 'P') pScore += consistency.primary.confidence * 0.5;
            else bScore += consistency.primary.confidence * 0.5;
        }
        
        const total = pScore + bScore;
        if (total === 0) return this.getDefaultPrediction();
        
        return {
            primary: {
                outcome: pScore > bScore ? 'P' : 'B',
                confidence: Math.max(pScore, bScore) / total * 100
            },
            alternative: {
                outcome: pScore > bScore ? 'B' : 'P',
                confidence: Math.min(pScore, bScore) / total * 100
            },
            reasoning: 'Combined road map analysis'
        };
    }
    
    // Phân tích kỹ thuật cầu nâng cao
    analyzeBridgeTechniques(history) {
        if (history.length < 6) return this.getDefaultPrediction();
        
        try {
            const analysis = this.bridgeTechniques.generateBridgeAnalysis(history);
            
            if (analysis.status !== 'analysis_complete' || !analysis.prediction) {
                return this.getDefaultPrediction();
            }
            
            const pred = analysis.prediction;
            if (!pred.prediction) {
                return this.getDefaultPrediction();
            }
            
            // Tăng cường độ tin cậy dựa trên context
            let confidence = pred.confidence || 50;
            confidence = this.enhanceBridgeConfidence(confidence, analysis, history);
            confidence = Math.min(confidence, 88);
            
            const outcome = pred.prediction;
            const reasoning = pred.reasoning || 'Bridge technique analysis';
            
            return {
                primary: {
                    outcome: outcome,
                    confidence: confidence
                },
                alternative: {
                    outcome: outcome === 'P' ? 'B' : 'P',
                    confidence: 100 - confidence
                },
                reasoning: reasoning,
                bridgeDetails: {
                    action: pred.action,
                    currentBridge: analysis.currentBridge,
                    advice: analysis.advice
                }
            };
        } catch (error) {
            console.warn('Bridge analysis error:', error);
            return this.getDefaultPrediction();
        }
    }
    
    // Tăng cường độ tin cậy cho bridge analysis
    enhanceBridgeConfidence(baseConfidence, analysis, history) {
        let enhanced = baseConfidence;
        
        // Tăng confidence nếu có nhiều bridge patterns
        if (analysis.bridges && analysis.bridges.length > 1) {
            enhanced += 8;
        }
        
        // Tăng confidence nếu có confirmations từ analyses khác
        const confirmations = this.getBridgeConfirmations(history);
        enhanced += confirmations * 5;
        
        // Tăng confidence cho long bridges
        if (analysis.currentBridge && analysis.currentBridge.currentLength > 6) {
            enhanced += 10;
        }
        
        return enhanced;
    }
    
    // Lấy confirmations từ các phân tích khác
    getBridgeConfirmations(history) {
        let confirmations = 0;
        
        // Kiểm tra streak consistency
        const streaks = this.analyzeStreaks(history);
        if (streaks.primary && streaks.primary.confidence > 60) {
            confirmations++;
        }
        
        // Kiểm tra trend alignment
        const trends = this.analyzeTrends(history);
        if (trends.primary && trends.primary.confidence > 60) {
            confirmations++;
        }
        
        return confirmations;
    }
    
    getDefaultPrediction() {
        return {
            primary: {
                outcome: 'B', // Slight statistical edge
                confidence: 50.68
            },
            alternative: {
                outcome: 'P',
                confidence: 49.32
            },
            reasoning: 'Insufficient data - using statistical baseline'
        };
    }
}

// Extend the PredictionAlgorithms class with advanced methods
Object.assign(PredictionAlgorithms.prototype, {
    // Road map analysis methods
    predictFromAllRoadMaps: function(history) {
        const nonTies = history.filter(h => h !== 'T');
        if (nonTies.length < 8) return this.getDefaultPrediction();
        
        const roadMapPredictions = {
            bigRoad: this.predictFromBigRoadContinuation(nonTies),
            bigEye: this.predictFromDerivedRoadPattern(this.generateBigEyeRoad(nonTies)),
            small: this.predictFromDerivedRoadPattern(this.generateSmallRoad(nonTies)),
            cockroach: this.predictFromDerivedRoadPattern(this.generateCockroachRoad(nonTies))
        };
        
        return this.combineRoadMapPredictions(roadMapPredictions);
    },
    
    predictFromBigRoadContinuation: function(nonTies) {
        const columns = this.getBigRoadColumns(nonTies);
        if (columns.length < 2) return this.getDefaultPrediction();
        
        const lastColumn = columns[columns.length - 1];
        const currentOutcome = lastColumn[0];
        const columnLength = lastColumn.length;
        
        const similarColumns = columns.slice(0, -1).filter(col => 
            col[0] === currentOutcome && col.length >= columnLength
        );
        
        if (similarColumns.length === 0) return this.getDefaultPrediction();
        
        const continueCount = similarColumns.filter(col => col.length > columnLength).length;
        const continueProbability = continueCount / similarColumns.length;
        const opposite = currentOutcome === 'P' ? 'B' : 'P';
        
        return {
            primary: {
                outcome: continueProbability > 0.5 ? currentOutcome : opposite,
                confidence: Math.max(continueProbability, 1 - continueProbability) * 100
            },
            alternative: {
                outcome: continueProbability > 0.5 ? opposite : currentOutcome,
                confidence: Math.min(continueProbability, 1 - continueProbability) * 100
            },
            reasoning: `Big Road column analysis: ${similarColumns.length} similar patterns`
        };
    },
    
    generateBigEyeRoad: function(nonTies) {
        const columns = this.getBigRoadColumns(nonTies);
        const bigEyeRoad = [];
        
        for (let i = 1; i < columns.length; i++) {
            const currentCol = columns[i];
            const prevCol = columns[i - 1];
            const twoPrevCol = i >= 2 ? columns[i - 2] : null;
            
            for (let j = 0; j < currentCol.length; j++) {
                let mark;
                if (j === 0) {
                    mark = (prevCol.length === 1) === (twoPrevCol && twoPrevCol.length === 1) ? 'R' : 'B';
                } else {
                    mark = (prevCol[j] !== undefined) === (prevCol[j - 1] !== undefined) ? 'R' : 'B';
                }
                bigEyeRoad.push(mark);
            }
        }
        
        return bigEyeRoad;
    },
    
    generateSmallRoad: function(nonTies) {
        const columns = this.getBigRoadColumns(nonTies);
        const smallRoad = [];
        
        for (let i = 2; i < columns.length; i++) {
            const currentCol = columns[i];
            const twoBackCol = columns[i - 2];
            const threeBackCol = i >= 3 ? columns[i - 3] : null;
            
            for (let j = 0; j < currentCol.length; j++) {
                let mark;
                if (j === 0) {
                    mark = (twoBackCol.length === 1) === (threeBackCol && threeBackCol.length === 1) ? 'R' : 'B';
                } else {
                    mark = (twoBackCol[j] !== undefined) === (twoBackCol[j - 1] !== undefined) ? 'R' : 'B';
                }
                smallRoad.push(mark);
            }
        }
        
        return smallRoad;
    },
    
    generateCockroachRoad: function(nonTies) {
        const columns = this.getBigRoadColumns(nonTies);
        const cockroachRoad = [];
        
        for (let i = 3; i < columns.length; i++) {
            const currentCol = columns[i];
            const threeBackCol = columns[i - 3];
            const fourBackCol = i >= 4 ? columns[i - 4] : null;
            
            for (let j = 0; j < currentCol.length; j++) {
                let mark;
                if (j === 0) {
                    mark = (threeBackCol.length === 1) === (fourBackCol && fourBackCol.length === 1) ? 'R' : 'B';
                } else {
                    mark = (threeBackCol[j] !== undefined) === (threeBackCol[j - 1] !== undefined) ? 'R' : 'B';
                }
                cockroachRoad.push(mark);
            }
        }
        
        return cockroachRoad;
    },
    
    predictFromDerivedRoadPattern: function(derivedRoad) {
        if (derivedRoad.length < 5) return this.getDefaultPrediction();
        
        const recent = derivedRoad.slice(-5);
        const redCount = recent.filter(mark => mark === 'R').length;
        const blueCount = recent.filter(mark => mark === 'B').length;
        
        const redPrediction = redCount > blueCount;
        const confidence = Math.abs(redCount - blueCount) / recent.length * 100;
        
        const nextOutcome = redPrediction ? 'P' : 'B';
        
        return {
            primary: {
                outcome: nextOutcome,
                confidence: Math.max(confidence, 50)
            },
            alternative: {
                outcome: nextOutcome === 'P' ? 'B' : 'P',
                confidence: 100 - Math.max(confidence, 50)
            },
            reasoning: 'Derived road pattern analysis'
        };
    },
    
    detectCycles: function(history) {
        const nonTies = history.filter(h => h !== 'T');
        const cycles = [];
        
        for (let cycleLength = 3; cycleLength <= Math.min(20, Math.floor(nonTies.length / 3)); cycleLength++) {
            const patterns = this.findCyclicalPatterns(nonTies, cycleLength);
            cycles.push(...patterns);
        }
        
        return cycles.sort((a, b) => b.strength - a.strength);
    },
    
    findCyclicalPatterns: function(nonTies, cycleLength) {
        const patterns = [];
        
        for (let start = 0; start <= nonTies.length - cycleLength * 2; start++) {
            const pattern = nonTies.slice(start, start + cycleLength);
            let matches = 0;
            
            for (let i = start + cycleLength; i <= nonTies.length - cycleLength; i += cycleLength) {
                const segment = nonTies.slice(i, i + cycleLength);
                if (this.arraysEqual(pattern, segment)) {
                    matches++;
                }
            }
            
            if (matches >= 2) {
                patterns.push({
                    pattern: pattern,
                    cycleLength: cycleLength,
                    matches: matches,
                    strength: matches * cycleLength,
                    lastPosition: start + (matches + 1) * cycleLength
                });
            }
        }
        
        return patterns;
    },
    
    predictFromCycles: function(cycles, history) {
        if (cycles.length === 0) return this.getDefaultPrediction();
        
        const strongestCycle = cycles[0];
        const nonTies = history.filter(h => h !== 'T');
        const currentPosition = nonTies.length;
        const cyclePosition = currentPosition % strongestCycle.cycleLength;
        
        if (cyclePosition < strongestCycle.pattern.length) {
            const predictedOutcome = strongestCycle.pattern[cyclePosition];
            const confidence = Math.min(strongestCycle.strength * 5, 85);
            
            return {
                primary: {
                    outcome: predictedOutcome,
                    confidence: confidence
                },
                alternative: {
                    outcome: predictedOutcome === 'P' ? 'B' : 'P',
                    confidence: 100 - confidence
                },
                reasoning: `Cyclical pattern (${strongestCycle.cycleLength}-cycle)`
            };
        }
        
        return this.getDefaultPrediction();
    },
    
    calculateMomentum: function(history) {
        const nonTies = history.filter(h => h !== 'T');
        if (nonTies.length < 10) return { direction: 'neutral', strength: 0 };
        
        const recent = nonTies.slice(-10);
        const weights = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.0];
        
        let playerMomentum = 0;
        let bankerMomentum = 0;
        
        recent.forEach((outcome, index) => {
            const weight = weights[index];
            if (outcome === 'P') playerMomentum += weight;
            else bankerMomentum += weight;
        });
        
        const totalMomentum = playerMomentum + bankerMomentum;
        const direction = playerMomentum > bankerMomentum ? 'P' : 'B';
        const strength = Math.abs(playerMomentum - bankerMomentum) / totalMomentum;
        
        return { direction, strength, playerMomentum, bankerMomentum };
    },
    
    calculateMomentumStrength: function(momentum) {
        return Math.min(momentum.strength * 2, 1);
    },
    
    predictFromMomentum: function(momentum, strength) {
        if (strength < 0.1) return this.getDefaultPrediction();
        
        const confidence = strength * 100;
        const opposite = momentum.direction === 'P' ? 'B' : 'P';
        
        return {
            primary: {
                outcome: momentum.direction,
                confidence: confidence
            },
            alternative: {
                outcome: opposite,
                confidence: 100 - confidence
            },
            reasoning: `Momentum analysis (${(strength * 100).toFixed(1)}% strength)`
        };
    },
    
    simulateCardCount: function(history) {
        const nonTies = history.filter(h => h !== 'T');
        let count = 0;
        
        nonTies.forEach(outcome => {
            if (outcome === 'P') count += 1;
            else count -= 1;
        });
        
        return {
            count: count,
            trueCount: nonTies.length > 0 ? count / Math.floor(nonTies.length / 10 + 1) : 0,
            favorability: count > 0 ? 'P' : 'B'
        };
    },
    
    predictFromCount: function(cardCount) {
        if (Math.abs(cardCount.trueCount) < 1) return this.getDefaultPrediction();
        
        const confidence = Math.min(Math.abs(cardCount.trueCount) * 20, 75);
        const opposite = cardCount.favorability === 'P' ? 'B' : 'P';
        
        return {
            primary: {
                outcome: cardCount.favorability,
                confidence: confidence
            },
            alternative: {
                outcome: opposite,
                confidence: 100 - confidence
            },
            reasoning: `Card count analysis (${cardCount.trueCount.toFixed(1)})`
        };
    },
    
    identifyBehaviorPatterns: function(history) {
        const nonTies = history.filter(h => h !== 'T');
        const patterns = {
            alternating: this.detectAlternatingPattern(nonTies),
            doubling: this.detectDoublingPattern(nonTies),
            clustering: this.detectClusteringPattern(nonTies)
        };
        
        return patterns;
    },
    
    detectAlternatingPattern: function(nonTies) {
        if (nonTies.length < 6) return { strength: 0 };
        
        let alternations = 0;
        for (let i = 1; i < nonTies.length; i++) {
            if (nonTies[i] !== nonTies[i - 1]) alternations++;
        }
        
        const strength = alternations / (nonTies.length - 1);
        return { strength, type: 'alternating' };
    },
    
    detectDoublingPattern: function(nonTies) {
        const doubles = [];
        let currentCount = 1;
        let lastOutcome = nonTies[0];
        
        for (let i = 1; i < nonTies.length; i++) {
            if (nonTies[i] === lastOutcome) {
                currentCount++;
            } else {
                if (currentCount === 2) doubles.push(lastOutcome);
                currentCount = 1;
                lastOutcome = nonTies[i];
            }
        }
        
        const strength = doubles.length / Math.floor(nonTies.length / 2);
        return { strength, type: 'doubling', doubles };
    },
    
    detectClusteringPattern: function(nonTies) {
        const clusters = { P: [], B: [] };
        let currentCluster = 1;
        let lastOutcome = nonTies[0];
        
        for (let i = 1; i < nonTies.length; i++) {
            if (nonTies[i] === lastOutcome) {
                currentCluster++;
            } else {
                clusters[lastOutcome].push(currentCluster);
                currentCluster = 1;
                lastOutcome = nonTies[i];
            }
        }
        clusters[lastOutcome].push(currentCluster);
        
        const avgClusterSize = {
            P: clusters.P.length > 0 ? clusters.P.reduce((a, b) => a + b, 0) / clusters.P.length : 0,
            B: clusters.B.length > 0 ? clusters.B.reduce((a, b) => a + b, 0) / clusters.B.length : 0
        };
        
        const strength = Math.max(avgClusterSize.P, avgClusterSize.B) / 5;
        return { strength, type: 'clustering', avgClusterSize };
    },
    
    predictFromBehavior: function(behaviorPatterns) {
        const { alternating, doubling, clustering } = behaviorPatterns;
        
        if (alternating.strength > 0.7) {
            return {
                primary: { outcome: 'P', confidence: alternating.strength * 100 },
                alternative: { outcome: 'B', confidence: (1 - alternating.strength) * 100 },
                reasoning: 'Strong alternating behavior pattern'
            };
        }
        
        return this.getDefaultPrediction();
    },
    
    calculateHotColdTrends: function(history) {
        const nonTies = history.filter(h => h !== 'T');
        const recentWindow = Math.min(20, nonTies.length);
        const recent = nonTies.slice(-recentWindow);
        
        const pCount = recent.filter(h => h === 'P').length;
        const bCount = recent.filter(h => h === 'B').length;
        
        const pHeat = pCount / recentWindow;
        const bHeat = bCount / recentWindow;
        
        return {
            playerHeat: pHeat,
            bankerHeat: bHeat,
            hotSide: pHeat > bHeat ? 'P' : 'B',
            coldSide: pHeat > bHeat ? 'B' : 'P',
            heatDifference: Math.abs(pHeat - bHeat)
        };
    },
    
    predictFromHotCold: function(hotColdData) {
        if (hotColdData.heatDifference < 0.2) return this.getDefaultPrediction();
        
        const confidence = hotColdData.heatDifference * 100;
        
        return {
            primary: {
                outcome: hotColdData.coldSide,
                confidence: confidence
            },
            alternative: {
                outcome: hotColdData.hotSide,
                confidence: 100 - confidence
            },
            reasoning: `Hot/Cold analysis: ${hotColdData.hotSide} is hot`
        };
    },
    
    arraysEqual: function(a, b) {
        return a.length === b.length && a.every((val, index) => val === b[index]);
    },
    
    calculatePatternSignificance: function(pattern, count, totalLength) {
        const expectedOccurrences = totalLength / Math.pow(2, pattern.length);
        const significance = count / expectedOccurrences;
        return significance * pattern.length;
    },
    
    findLastOccurrence: function(history, pattern) {
        for (let i = history.length - pattern.length; i >= 0; i--) {
            if (this.arraysEqual(history.slice(i, i + pattern.length), pattern)) {
                return i;
            }
        }
        return -1;
    },
    
    predictNextFromPattern: function(pattern, history) {
        const occurrences = this.findPatternOccurrences(history, pattern.sequence);
        if (occurrences.length === 0) return 'P';
        
        const followers = occurrences
            .map(pos => history[pos + pattern.sequence.length])
            .filter(outcome => outcome && outcome !== 'T');
        
        if (followers.length === 0) return 'P';
        
        const pCount = followers.filter(f => f === 'P').length;
        const bCount = followers.filter(f => f === 'B').length;
        
        return pCount > bCount ? 'P' : 'B';
    },
    
    getAnalysisWeight: function(analysisType, mode) {
        const weights = {
            conservative: {
                streak: 1.8, pattern: 1.0, trend: 0.8, mathematical: 1.5, roadmap: 1.2,
                cyclical: 0.6, momentum: 0.7, counting: 1.0, behavioral: 0.8, hotcold: 0.9
            },
            aggressive: {
                streak: 1.0, pattern: 1.8, trend: 1.5, mathematical: 0.8, roadmap: 1.0,
                cyclical: 1.4, momentum: 1.6, counting: 1.2, behavioral: 1.3, hotcold: 1.1
            },
            balanced: {
                streak: 1.2, pattern: 1.2, trend: 1.0, mathematical: 1.0, roadmap: 1.0,
                cyclical: 1.0, momentum: 1.0, counting: 1.0, behavioral: 1.0, hotcold: 1.0
            }
        };
        
        return weights[mode][analysisType] || 1.0;
    },
    
    combineAdvancedPredictions: function(analyses, mode) {
        const validAnalyses = analyses.filter(a => a.analysis.primary && a.analysis.alternative);
        if (validAnalyses.length === 0) return this.getDefaultPrediction();
        
        const scores = { P: 0, B: 0 };
        let totalWeight = 0;
        
        validAnalyses.forEach(({ analysis, weight }) => {
            const primaryOutcome = analysis.primary.outcome;
            const altOutcome = analysis.alternative.outcome;
            
            if (primaryOutcome === 'P' || primaryOutcome === 'B') {
                scores[primaryOutcome] += (analysis.primary.confidence / 100) * weight;
            }
            if (altOutcome === 'P' || altOutcome === 'B') {
                scores[altOutcome] += (analysis.alternative.confidence / 100) * weight;
            }
            totalWeight += weight;
        });
        
        if (totalWeight > 0) {
            scores.P = (scores.P / totalWeight) * 100;
            scores.B = (scores.B / totalWeight) * 100;
        }
        
        if (mode === 'conservative') {
            scores.P = Math.min(scores.P, 85);
            scores.B = Math.min(scores.B, 85);
        } else if (mode === 'aggressive') {
            if (scores.P > scores.B) {
                scores.P = Math.min(scores.P * 1.1, 95);
            } else {
                scores.B = Math.min(scores.B * 1.1, 95);
            }
        }
        
        const primaryOutcome = scores.P > scores.B ? 'P' : 'B';
        const primaryConfidence = Math.max(scores.P, scores.B);
        const altOutcome = primaryOutcome === 'P' ? 'B' : 'P';
        const altConfidence = Math.min(scores.P, scores.B);
        
        return {
            primary: {
                outcome: primaryOutcome,
                confidence: Math.min(primaryConfidence, 95)
            },
            alternative: {
                outcome: altOutcome,
                confidence: Math.max(altConfidence, 5)
            },
            reasoning: `Advanced multi-algorithm analysis (${validAnalyses.length} methods)`
        };
    }
});
