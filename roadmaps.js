// Baccarat Road Maps Implementation
class RoadMaps {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.history = [];
        this.bigRoad = [];
        this.beadPlate = [];
        this.bigEyeRoad = [];
        this.smallRoad = [];
        this.cockroachRoad = [];
        this.currentColumn = 0;
        this.currentRow = 0;
    }
    
    addOutcome(outcome) {
        this.history.push(outcome);
        this.updateBigRoad(outcome);
        this.updateBeadPlate(outcome);
        this.updateDerivedRoads();
    }
    
    removeLastOutcome() {
        if (this.history.length === 0) return;
        
        this.history.pop();
        this.recalculateAllRoads();
    }
    
    recalculateAllRoads() {
        this.bigRoad = [];
        this.beadPlate = [];
        this.bigEyeRoad = [];
        this.smallRoad = [];
        this.cockroachRoad = [];
        this.currentColumn = 0;
        this.currentRow = 0;
        
        this.history.forEach(outcome => {
            this.updateBigRoad(outcome);
            this.updateBeadPlate(outcome);
        });
        
        this.updateDerivedRoads();
    }
    
    updateBigRoad(outcome) {
        if (outcome === 'T') {
            // Ties are marked on the last non-tie result
            if (this.bigRoad.length > 0) {
                const lastEntry = this.bigRoad[this.bigRoad.length - 1];
                lastEntry.ties = (lastEntry.ties || 0) + 1;
            }
            return;
        }
        
        const lastEntry = this.bigRoad[this.bigRoad.length - 1];
        
        if (!lastEntry || lastEntry.outcome !== outcome) {
            // New column
            this.bigRoad.push({
                outcome: outcome,
                column: this.currentColumn++,
                row: 0,
                ties: 0
            });
        } else {
            // Continue current column
            const sameOutcomeInColumn = this.bigRoad.filter(
                entry => entry.column === lastEntry.column
            ).length;
            
            this.bigRoad.push({
                outcome: outcome,
                column: lastEntry.column,
                row: sameOutcomeInColumn,
                ties: 0
            });
        }
    }
    
    updateBeadPlate(outcome) {
        const position = this.beadPlate.length;
        const row = Math.floor(position / 6); // 6 columns in bead plate
        const col = position % 6;
        
        this.beadPlate.push({
            outcome: outcome,
            row: row,
            col: col,
            position: position
        });
    }
    
    updateDerivedRoads() {
        this.updateBigEyeRoad();
        this.updateSmallRoad();
        this.updateCockroachRoad();
    }
    
    updateBigEyeRoad() {
        // Big Eye Road rules: Compare columns starting from column 2
        this.bigEyeRoad = [];
        
        const columns = this.getBigRoadColumns();
        if (columns.length < 2) return;
        
        for (let i = 1; i < columns.length; i++) {
            const currentColumn = columns[i];
            const previousColumn = columns[i - 1];
            const twoColumnsBack = i >= 2 ? columns[i - 2] : null;
            
            for (let j = 0; j < currentColumn.length; j++) {
                let mark;
                
                if (j === 0) {
                    // First entry in column
                    if (previousColumn.length === 1) {
                        // Previous column has only one entry
                        if (twoColumnsBack && twoColumnsBack.length > 1) {
                            mark = 'B'; // Blue (different)
                        } else {
                            mark = 'R'; // Red (same)
                        }
                    } else {
                        mark = 'B'; // Blue (different)
                    }
                } else {
                    // Not first entry in column
                    const prevRowInPrevColumn = previousColumn[j - 1];
                    const currentRowInPrevColumn = previousColumn[j];
                    
                    if (prevRowInPrevColumn && currentRowInPrevColumn) {
                        mark = 'R'; // Red (same pattern)
                    } else if (prevRowInPrevColumn && !currentRowInPrevColumn) {
                        mark = 'B'; // Blue (different pattern)
                    } else {
                        mark = 'R'; // Red (same pattern)
                    }
                }
                
                this.bigEyeRoad.push({
                    mark: mark,
                    column: i - 1,
                    row: j
                });
            }
        }
    }
    
    updateSmallRoad() {
        // Small Road rules: Compare current column with column 2 positions back
        this.smallRoad = [];
        
        const columns = this.getBigRoadColumns();
        if (columns.length < 3) return;
        
        for (let i = 2; i < columns.length; i++) {
            const currentColumn = columns[i];
            const twoColumnsBack = columns[i - 2];
            
            for (let j = 0; j < currentColumn.length; j++) {
                let mark;
                
                if (j === 0) {
                    // First entry in column
                    if (twoColumnsBack.length === 1) {
                        const threeColumnsBack = i >= 3 ? columns[i - 3] : null;
                        if (threeColumnsBack && threeColumnsBack.length > 1) {
                            mark = 'B'; // Blue (different)
                        } else {
                            mark = 'R'; // Red (same)
                        }
                    } else {
                        mark = 'B'; // Blue (different)
                    }
                } else {
                    // Compare with two columns back
                    const correspondingEntry = twoColumnsBack[j];
                    const previousEntry = twoColumnsBack[j - 1];
                    
                    if (correspondingEntry && previousEntry) {
                        mark = 'R'; // Red (same pattern)
                    } else if (previousEntry && !correspondingEntry) {
                        mark = 'B'; // Blue (different pattern)
                    } else {
                        mark = 'R'; // Red (same pattern)
                    }
                }
                
                this.smallRoad.push({
                    mark: mark,
                    column: i - 2,
                    row: j
                });
            }
        }
    }
    
    updateCockroachRoad() {
        // Cockroach Road rules: Compare current column with column 3 positions back
        this.cockroachRoad = [];
        
        const columns = this.getBigRoadColumns();
        if (columns.length < 4) return;
        
        for (let i = 3; i < columns.length; i++) {
            const currentColumn = columns[i];
            const threeColumnsBack = columns[i - 3];
            
            for (let j = 0; j < currentColumn.length; j++) {
                let mark;
                
                if (j === 0) {
                    // First entry in column
                    if (threeColumnsBack.length === 1) {
                        const fourColumnsBack = i >= 4 ? columns[i - 4] : null;
                        if (fourColumnsBack && fourColumnsBack.length > 1) {
                            mark = 'B'; // Blue (different)
                        } else {
                            mark = 'R'; // Red (same)
                        }
                    } else {
                        mark = 'B'; // Blue (different)
                    }
                } else {
                    // Compare with three columns back
                    const correspondingEntry = threeColumnsBack[j];
                    const previousEntry = threeColumnsBack[j - 1];
                    
                    if (correspondingEntry && previousEntry) {
                        mark = 'R'; // Red (same pattern)
                    } else if (previousEntry && !correspondingEntry) {
                        mark = 'B'; // Blue (different pattern)  
                    } else {
                        mark = 'R'; // Red (same pattern)
                    }
                }
                
                this.cockroachRoad.push({
                    mark: mark,
                    column: i - 3,
                    row: j
                });
            }
        }
    }
    
    getBigRoadColumns() {
        const columns = [];
        const columnMap = new Map();
        
        this.bigRoad.forEach(entry => {
            if (!columnMap.has(entry.column)) {
                columnMap.set(entry.column, []);
            }
            columnMap.get(entry.column).push(entry);
        });
        
        // Convert map to array and sort by column number
        for (let [colNum, entries] of columnMap) {
            columns[colNum] = entries.sort((a, b) => a.row - b.row);
        }
        
        return columns.filter(col => col); // Remove empty slots
    }
    
    renderBigRoad(container) {
        container.innerHTML = '';
        container.style.position = 'relative';
        
        const cellSize = 25;
        const margin = 2;
        
        this.bigRoad.forEach(entry => {
            const cell = document.createElement('div');
            cell.className = `road-cell ${entry.outcome.toLowerCase()}`;
            cell.style.left = `${entry.column * (cellSize + margin) + 5}px`;
            cell.style.top = `${entry.row * (cellSize + margin) + 5}px`;
            
            // Add outcome symbol
            cell.textContent = entry.outcome;
            
            // Add tie indicator
            if (entry.ties > 0) {
                const tieIndicator = document.createElement('span');
                tieIndicator.textContent = entry.ties;
                tieIndicator.style.position = 'absolute';
                tieIndicator.style.top = '-5px';
                tieIndicator.style.right = '-5px';
                tieIndicator.style.fontSize = '8px';
                tieIndicator.style.background = '#f0932b';
                tieIndicator.style.borderRadius = '50%';
                tieIndicator.style.width = '12px';
                tieIndicator.style.height = '12px';
                tieIndicator.style.display = 'flex';
                tieIndicator.style.alignItems = 'center';
                tieIndicator.style.justifyContent = 'center';
                cell.appendChild(tieIndicator);
            }
            
            container.appendChild(cell);
        });
        
        // Set container height based on content
        const maxRow = Math.max(...this.bigRoad.map(entry => entry.row), -1);
        container.style.minHeight = `${(maxRow + 2) * (cellSize + margin)}px`;
    }
    
    renderBeadPlate(container) {
        container.innerHTML = '';
        container.style.position = 'relative';
        
        const cellSize = 20;
        const margin = 2;
        
        this.beadPlate.forEach(entry => {
            const cell = document.createElement('div');
            cell.className = `road-cell bead ${entry.outcome.toLowerCase()}`;
            cell.style.left = `${entry.col * (cellSize + margin) + 5}px`;
            cell.style.top = `${entry.row * (cellSize + margin) + 5}px`;
            cell.textContent = entry.outcome;
            
            container.appendChild(cell);
        });
        
        // Set container height
        const maxRow = Math.max(...this.beadPlate.map(entry => entry.row), -1);
        container.style.minHeight = `${(maxRow + 2) * (cellSize + margin)}px`;
    }
    
    renderDerivedRoad(roadData, container) {
        container.innerHTML = '';
        container.style.position = 'relative';
        
        const cellSize = 15;
        const margin = 1;
        
        roadData.forEach(entry => {
            const cell = document.createElement('div');
            cell.className = `road-cell derived ${entry.mark === 'R' ? 'red-dot' : 'blue-dot'}`;
            cell.style.left = `${entry.column * (cellSize + margin) + 3}px`;
            cell.style.top = `${entry.row * (cellSize + margin) + 3}px`;
            
            container.appendChild(cell);
        });
        
        // Set container height
        if (roadData.length > 0) {
            const maxRow = Math.max(...roadData.map(entry => entry.row));
            container.style.minHeight = `${(maxRow + 2) * (cellSize + margin)}px`;
        }
    }
    
    renderBigEyeRoad(container) {
        this.renderDerivedRoad(this.bigEyeRoad, container);
    }
    
    renderSmallRoad(container) {
        this.renderDerivedRoad(this.smallRoad, container);
    }
    
    renderCockroachRoad(container) {
        this.renderDerivedRoad(this.cockroachRoad, container);
    }
    
    // Analysis methods for prediction algorithms
    getLastNColumns(n) {
        const columns = this.getBigRoadColumns();
        return columns.slice(-n);
    }
    
    getStreakInfo() {
        if (this.bigRoad.length === 0) return null;
        
        const lastEntry = this.bigRoad[this.bigRoad.length - 1];
        const currentColumn = this.bigRoad.filter(entry => entry.column === lastEntry.column);
        
        return {
            outcome: lastEntry.outcome,
            length: currentColumn.length,
            column: lastEntry.column
        };
    }
    
    getColumnLengths() {
        const columns = this.getBigRoadColumns();
        return columns.map(column => column.length);
    }
    
    getDerivedRoadTrends() {
        const getLastNMarks = (road, n) => {
            return road.slice(-n).map(entry => entry.mark);
        };
        
        return {
            bigEye: getLastNMarks(this.bigEyeRoad, 5),
            small: getLastNMarks(this.smallRoad, 5),
            cockroach: getLastNMarks(this.cockroachRoad, 5)
        };
    }
}
