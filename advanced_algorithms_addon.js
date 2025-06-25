// Advanced Algorithm Extensions for Baccarat Predictor
// These methods are added to the main PredictionAlgorithms class

// Missing methods implementation for the advanced algorithms
const AdvancedAlgorithmExtensions = {
    
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
        const currentOutcome = lastColumn[0].outcome;
        const columnLength = lastColumn.length;
        
        // Analyze column completion patterns
        const similarColumns = columns.slice(0, -1).filter(col => 
            col[0].outcome === currentOutcome && col.length >= columnLength
        );
        
        if (similarColumns.length === 0) return this.getDefaultPrediction();
        
        const continueCount = similarColumns.filter(col => col.length > columnLength).length;
        const switchCount = similarColumns.length - continueCount;
        
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
        // Simplified Big Eye Road generation
        const columns = this.getBigRoadColumns(nonTies);
        const bigEyeRoad = [];
        
        for (let i = 1; i < columns.length; i++) {
            const currentCol = columns[i];
            const prevCol = columns[i - 1];
            const twoPrevCol = i >= 2 ? columns[i - 2] : null;
            
            for (let j = 0; j < currentCol.length; j++) {
                let mark;
                if (j === 0) {
                    // First entry comparison
                    mark = (prevCol.length === 1) === (twoPrevCol && twoPrevCol.length === 1) ? 'R' : 'B';
                } else {
                    // Subsequent entries
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
        
        return {
            primary: {
                outcome: redPrediction ? 'R' : 'B',
                confidence: Math.max(confidence, 50)
            },
            alternative: {
                outcome: redPrediction ? 'B' : 'R',
                confidence: 100 - Math.max(confidence, 50)
            },
            reasoning: 'Derived road pattern analysis'
        };
    },
    
    // Cyclical pattern detection
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
    
    // Momentum calculation
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
    
    // Card counting simulation
    simulateCardCount: function(history) {
        // Simplified card counting based on outcomes
        const nonTies = history.filter(h => h !== 'T');
        let count = 0;
        
        nonTies.forEach(outcome => {
            if (outcome === 'P') count += 1;  // Player favorable
            else count -= 1;  // Banker favorable
        });
        
        return {
            count: count,
            trueCount: nonTies.length > 0 ? count / Math.floor(nonTies.length / 10) : 0,
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
    
    // Behavioral patterns
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
        // Detect if outcomes tend to cluster together
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
        
        const strength = Math.max(avgClusterSize.P, avgClusterSize.B) / 5; // Normalize
        return { strength, type: 'clustering', avgClusterSize };
    },
    
    predictFromBehavior: function(behaviorPatterns) {
        const { alternating, doubling, clustering } = behaviorPatterns;
        
        if (alternating.strength > 0.7) {
            // Strong alternating pattern
            const lastOutcome = this.getLastNonTie();
            const nextOutcome = lastOutcome === 'P' ? 'B' : 'P';
            return {
                primary: { outcome: nextOutcome, confidence: alternating.strength * 100 },
                alternative: { outcome: lastOutcome, confidence: (1 - alternating.strength) * 100 },
                reasoning: 'Strong alternating behavior pattern'
            };
        }
        
        if (doubling.strength > 0.5) {
            // Doubling pattern detected
            const lastOutcome = this.getLastNonTie();
            return {
                primary: { outcome: lastOutcome, confidence: doubling.strength * 80 },
                alternative: { outcome: lastOutcome === 'P' ? 'B' : 'P', confidence: (1 - doubling.strength) * 80 },
                reasoning: 'Doubling behavior pattern'
            };
        }
        
        return this.getDefaultPrediction();
    },
    
    // Hot/Cold analysis
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
        
        // Predict against the hot side (regression to mean)
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
    
    // Helper methods
    arraysEqual: function(a, b) {
        return a.length === b.length && a.every((val, index) => val === b[index]);
    },
    
    calculatePatternSignificance: function(pattern, count, totalLength) {
        const expectedOccurrences = totalLength / Math.pow(2, pattern.length);
        const significance = count / expectedOccurrences;
        return significance * pattern.length; // Weight by pattern length
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
        
        // Look at what follows this pattern
        const followers = occurrences
            .map(pos => history[pos + pattern.sequence.length])
            .filter(outcome => outcome && outcome !== 'T');
        
        if (followers.length === 0) return 'P';
        
        const pCount = followers.filter(f => f === 'P').length;
        const bCount = followers.filter(f => f === 'B').length;
        
        return pCount > bCount ? 'P' : 'B';
    },
    
    // Analysis weight system
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
    
    // Advanced prediction combination
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
        
        // Normalize scores
        if (totalWeight > 0) {
            scores.P = (scores.P / totalWeight) * 100;
            scores.B = (scores.B / totalWeight) * 100;
        }
        
        // Apply mode-specific adjustments
        if (mode === 'conservative') {
            // Reduce extreme predictions
            scores.P = Math.min(scores.P, 85);
            scores.B = Math.min(scores.B, 85);
        } else if (mode === 'aggressive') {
            // Amplify strong predictions
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
};

// Export for integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedAlgorithmExtensions;
}
