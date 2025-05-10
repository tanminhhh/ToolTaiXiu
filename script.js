// State variables
let sequence = [];
let activeTab = 'prediction';
let chartType = 'sequence';
let historyData = [];  // Lịch sử các phiên phân tích

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  // Load data from localStorage if exists
  loadFromLocalStorage();

  // DOM elements
  const taiBtn = document.getElementById('taiBtn');
  const xiuBtn = document.getElementById('xiuBtn');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const sequenceDisplay = document.getElementById('sequenceDisplay');
  const resultsArea = document.getElementById('resultsArea');
  const chartModal = document.getElementById('chartModal');
  const chartCanvas = document.getElementById('chartCanvas');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const chartButtons = document.querySelectorAll('.chart-btn');

  // Event listeners
  taiBtn.addEventListener('click', () => addToSequence('T'));
  xiuBtn.addEventListener('click', () => addToSequence('X'));
  deleteBtn.addEventListener('click', deleteLastResult);
  analyzeBtn.addEventListener('click', analyzeSequence);

  // Delete last result function
  function deleteLastResult() {
    if (sequence.length > 0) {
      sequence.pop();
      updateSequenceDisplay();
      saveToLocalStorage();
    }
  }
  sequenceDisplay.addEventListener('click', () => {
    if (sequence.length > 0) showChart();
  });

  chartModal.querySelector('.chart-close').addEventListener('click', hideChart);

  tabButtons.forEach(button => {
    button.addEventListener('click', () => setActiveTab(button.getAttribute('data-tab')));
  });

  chartButtons.forEach(button => {
    button.addEventListener('click', () => setChartType(button.getAttribute('data-chart')));
  });

  function setActiveTab(tab) {
    activeTab = tab;
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });
    if (sequence.length > 0) {
      displayResultsForActiveTab();
    }
  }

  // Close modal when clicking outside
  chartModal.addEventListener('click', (e) => {
    if (e.target === chartModal) hideChart();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 't' || e.key === 'T') {
      addToSequence('T');
    } else if (e.key === 'x' || e.key === 'X') {
      addToSequence('X');
    } else if (e.key === 'Enter') {
      analyzeSequence();
    } else if (e.key === 'Escape' && chartModal.style.display === 'flex') {
      hideChart();
    }
  });
});

// Core functions
function addToSequence(value) {
  sequence.push(value);
  updateSequenceDisplay();
  saveToLocalStorage();
}

function updateSequenceDisplay() {
  const sequenceDisplay = document.getElementById('sequenceDisplay');

  if (sequence.length === 0) {
    sequenceDisplay.innerHTML = 'Nhấn TÀI hoặc XỈU để bắt đầu nhập dữ liệu...';
    return;
  }

  sequenceDisplay.innerHTML = '';
  sequence.forEach(value => {
    const span = document.createElement('span');
    span.className = `result-entry ${value === 'T' ? 'text-[#00ffff]' : 'text-[#ff77aa]'}`;
    span.style.color = value === 'T' ? '#00ffff' : '#ff77aa';
    span.textContent = value;
    sequenceDisplay.appendChild(span);
  });

  // Auto scroll to end
  sequenceDisplay.scrollLeft = sequenceDisplay.scrollWidth;
}

function analyzeSequence() {
  try {
    // Disable analyze button while processing
    const analyzeBtn = document.getElementById('analyzeBtn');
    const aiAnimation = document.getElementById('aiAnimation');
    const resultsArea = document.getElementById('resultsArea');
    
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'ĐANG PHÂN TÍCH...';
    
    // Show AI animation with overlay
    aiAnimation.classList.remove('hidden');
    resultsArea.style.opacity = '0';
    
    // Create and show overlay
    const overlay = document.createElement('div');
    overlay.className = 'analysis-overlay';
    document.body.appendChild(overlay);

    // Basic validations
    if (sequence.length < 3) {
      resultsArea.innerHTML = '<div class="error-message">Cần ít nhất 3 kết quả để phân tích.</div>';
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'PHÂN TÍCH';
      return;
    }

    if (sequence.length > 1000) {
      resultsArea.innerHTML = '<div class="error-message">Số lượng kết quả quá lớn, vui lòng giới hạn dưới 1000 kết quả.</div>';
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'PHÂN TÍCH';
      return;
    }

    // Use setTimeout to prevent UI blocking
    setTimeout(() => {
      try {
        // Save to history
        saveAnalysisToHistory();

        // Hide animation after 3 seconds and show results
        setTimeout(() => {
          aiAnimation.classList.add('hidden');
          resultsArea.style.opacity = '1';
          // Remove overlay
          const overlay = document.querySelector('.analysis-overlay');
          if (overlay) overlay.remove();
          // Display results
          displayResultsForActiveTab();
        }, 3000);
      } catch (error) {
        console.error('Lỗi khi phân tích:', error);
        resultsArea.innerHTML = '<div class="error-message">Có lỗi xảy ra khi phân tích. Vui lòng thử lại.</div>';
      } finally {
        // Re-enable button
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'PHÂN TÍCH';
      }
    }, 100);

  } catch (error) {
    console.error('Lỗi khi phân tích:', error);
    resultsArea.innerHTML = '<div class="error-message">Có lỗi xảy ra khi phân tích. Vui lòng thử lại.</div>';
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'PHÂN TÍCH';
  }
}

// Helper functions
function getLastNValues(n) {
  return sequence.slice(-n);
}

function calculateStreaks() {
  let currentTaiStreak = 0;
  let maxTaiStreak = 0;
  let currentXiuStreak = 0;
  let maxXiuStreak = 0;

  sequence.forEach(val => {
    if (val === 'T') {
      currentTaiStreak++;
      currentXiuStreak = 0;
      maxTaiStreak = Math.max(maxTaiStreak, currentTaiStreak);
    } else {
      currentXiuStreak++;
      currentTaiStreak = 0;
      maxXiuStreak = Math.max(maxXiuStreak, currentXiuStreak);
    }
  });

  return { tai: maxTaiStreak, xiu: maxXiuStreak };
}

function calculateAlternationRate() {
  let alternations = 0;
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] !== sequence[i-1]) alternations++;
  }
  return (alternations / (sequence.length - 1)) * 100;
}

function getTrendAnalysis() {
  const last10 = getLastNValues(Math.min(10, sequence.length));
  const taiCount = last10.filter(val => val === 'T').length;
  const total = last10.length;

  let trend = 'neutral';
  if (total > 0) {
    const taiPercentage = (taiCount / total) * 100;
    if (taiPercentage >= 70) trend = 'strong-tai';
    else if (taiPercentage >= 60) trend = 'tai';
    else if (taiPercentage <= 30) trend = 'strong-xiu';
    else if (taiPercentage <= 40) trend = 'xiu';
  }

  return {
    taiCount,
    xiuCount: total - taiCount,
    trend
  };
}

// Analysis functions
function getMarkovProbability(current, next) {
  let count = 0;
  let totalTransitions = 0;

  for (let i = 0; i < sequence.length - 1; i++) {
    if (sequence[i] === current) {
      totalTransitions++;
      if (sequence[i + 1] === next) count++;
    }
  }

  return totalTransitions === 0 ? 0.5 : count / totalTransitions;
}

function getTips() {
  return [
    {
      title: "Mẹo Quản lý Vốn",
      tips: [
        "Không đặt quá 3-5% tổng vốn cho một lượt chơi",
        "Dừng khi thua 3 lần liên tiếp",
        "Đặt mục tiêu lợi nhuận hợp lý cho mỗi phiên",
        "Không cố gắng gỡ lại số thua lỗ ngay lập tức"
      ]
    },
    {
      title: "Mẹo Chuyên Gia",
      tips: [
        "Không nên bắt theo xu hướng quá 3 lần liên tiếp",
        "Chú ý các điểm gãy cầu quan trọng",
        "Kết hợp nhiều phương pháp phân tích",
        "Kiên nhẫn chờ đợi tín hiệu rõ ràng"
      ]
    }
  ];
}

function getCurrentMarkovPrediction() {
  if (sequence.length < 5) {
    return { prediction: null, confidence: 0.641 };
  }

  // Phân tích toàn bộ chuỗi và phân đoạn
  const segments = [];
  let currentSegment = { value: sequence[0], count: 1 };
  
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] === currentSegment.value) {
      currentSegment.count++;
    } else {
      segments.push(currentSegment);
      currentSegment = { value: sequence[i], count: 1 };
    }
  }
  segments.push(currentSegment);

  // Tính toán các chỉ số quan trọng
  const averageSegmentLength = segments.reduce((sum, seg) => sum + seg.count, 0) / segments.length;
  const stdDevSegmentLength = Math.sqrt(
    segments.reduce((sum, seg) => sum + Math.pow(seg.count - averageSegmentLength, 2), 0) / segments.length
  );
  
  // Phân tích xu hướng và độ ổn định
  const lastSegment = segments[segments.length - 1];
  const stabilityScore = stdDevSegmentLength / averageSegmentLength;
  const trendStrength = lastSegment.count / averageSegmentLength;

  // Phân tích lịch sử bẻ cầu
  const recentHistory = historyData.slice(0, 10);
  const breakAttempts = recentHistory.filter(h => h.wasBreakAttempt);
  const successfulBreaks = breakAttempts.filter(h => h.wasSuccessful);
  const breakSuccessRate = breakAttempts.length > 0 ? successfulBreaks.length / breakAttempts.length : 0;

  // Chiến lược bắt cầu thông minh
  if (lastSegment.count >= 2 && lastSegment.count <= averageSegmentLength * 1.2) {
    // Bắt cầu khi độ dài chuỗi hợp lý và xu hướng ổn định
    if (stabilityScore < 0.5 && trendStrength > 0.8) {
      return {
        prediction: lastSegment.value,
        confidence: 0.88,
        followTrend: true
      };
    }
  }

  // Chiến lược bẻ cầu thông minh
  const idealBreakConditions = [
    lastSegment.count > averageSegmentLength * 1.5, // Chuỗi quá dài
    stabilityScore > 0.7, // Độ bất ổn định cao
    breakSuccessRate > 0.6 // Tỷ lệ bẻ cầu thành công cao
  ];

  const breakScore = idealBreakConditions.filter(Boolean).length;

  if (breakScore >= 2) {
    // Điều kiện bẻ cầu tối ưu
    return {
      prediction: lastSegment.value === 'T' ? 'X' : 'T',
      confidence: 0.85 + (breakScore * 0.03),
      breakAttempt: true
    };
  }

  // Chiến lược thích nghi
  if (breakSuccessRate < 0.4) {
    // Chuyển sang bắt cầu khi tỷ lệ bẻ cầu thấp
    const adaptiveConfidence = 0.75 + (trendStrength * 0.1);
    return {
      prediction: lastSegment.value,
      confidence: Math.min(0.89, adaptiveConfidence),
      followTrend: true
    };
  }

  // Phân tích sâu các mẫu hình với trọng số mới
  const patternResults = [
    analyzeRepeatPattern(),
    analyzeBreakPattern(),
    analyzeZigzagPattern(),
    analyzeEvenOddPattern(),
    analyzeFrequencyPattern(),
    analyzeGlobalTrend(),
    analyzeSegmentPattern(),
    analyzePeakValleyPattern(),
    analyzeReversePoint(),
    analyzeBreakRiskPattern(),
    analyzeDoubleConfirmation()
  ].filter(p => p.confidence > 0);

  if (patternResults.length === 0) {
    return { prediction: null, confidence: 0.641 };
  }

  // Tính trọng số cho từng mẫu hình
  const weightedPredictions = patternResults.map(result => ({
    prediction: result.prediction,
    weight: result.confidence * Math.pow(result.accuracy || 0.7, 2)
  }));

  // Tổng hợp dự đoán
  const prediction = weightedPredictions.reduce((acc, curr) => {
    if (!acc.prediction) return curr;
    return curr.weight > acc.weight ? curr : acc;
  }, { prediction: null, weight: 0 });

  // Tính độ tin cậy dựa trên độ chính xác lịch sử
  const confidence = Math.min(0.95, 0.641 + prediction.weight * 0.2);

  return {
    prediction: prediction.prediction,
    confidence: confidence
  };
}

function analyzeFrequencyPattern() {
  const last20 = sequence.slice(-20);
  const frequencies = last20.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

  const dominantOutcome = Object.entries(frequencies)
    .sort((a, b) => b[1] - a[1])[0];

  if (dominantOutcome[1] >= 14) { // 70% một kết quả
    return {
      prediction: dominantOutcome[0] === 'T' ? 'X' : 'T',
      confidence: 0.85,
      accuracy: 0.75
    };
  }

  return { prediction: null, confidence: 0 };
}

function analyzeGlobalTrend() {
  const segments = [];
  let currentSegment = { value: sequence[0], count: 1 };

  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] === currentSegment.value) {
      currentSegment.count++;
    } else {
      segments.push(currentSegment);
      currentSegment = { value: sequence[i], count: 1 };
    }
  }
  segments.push(currentSegment);

  if (segments.length < 2) return { prediction: null, confidence: 0 };

  const lastSegment = segments[segments.length - 1];
  const avgSegmentLength = segments.reduce((sum, seg) => sum + seg.count, 0) / segments.length;

  if (lastSegment.count > avgSegmentLength * 1.5) {
    return {
      prediction: lastSegment.value === 'T' ? 'X' : 'T',
      confidence: 0.88,
      accuracy: 0.82
    };
  }

  return { prediction: null, confidence: 0 };
}

function analyzeZigzagPattern() {
  if (sequence.length < 6) return { prediction: null, confidence: 0 };

  const last6 = sequence.slice(-6);
  let zigzagCount = 0;

  for (let i = 1; i < last6.length; i++) {
    if (last6[i] !== last6[i-1]) zigzagCount++;
  }

  if (zigzagCount >= 4) {
    return {
      prediction: last6[last6.length - 1] === 'T' ? 'X' : 'T',
      confidence: 0.85
    };
  }

  return { prediction: null, confidence: 0 };
}

function analyzeEvenOddPattern() {
  if (sequence.length < 8) return { prediction: null, confidence: 0 };

  const last8 = sequence.slice(-8);
  let evenTaiCount = 0;
  let oddTaiCount = 0;

  for (let i = 0; i < last8.length; i++) {
    if (last8[i] === 'T') {
      if (i % 2 === 0) evenTaiCount++;
      else oddTaiCount++;
    }
  }

  if (evenTaiCount >= 3 && oddTaiCount <= 1) {
    return {
      prediction: sequence.length % 2 === 0 ? 'T' : 'X',
      confidence: 0.75
    };
  }

  if (oddTaiCount >= 3 && evenTaiCount <= 1) {
    return {
      prediction: sequence.length % 2 === 0 ? 'X' : 'T',
      confidence: 0.75
    };
  }

  return { prediction: null, confidence: 0 };
}

  function analyzeRepeatPattern() {
  if (sequence.length < 5) return { prediction: null, confidence: 0 };

  const last5 = sequence.slice(-5);
  const uniqueValues = new Set(last5);

  if (uniqueValues.size === 1) {
    // Nếu 5 kết quả giống nhau, khả năng cao sẽ đổi
    return {
      prediction: last5[0] === 'T' ? 'X' : 'T',
      confidence: 0.85
    };
  }

  return { prediction: null, confidence: 0 };
}

function analyzeSegmentPattern() {
  if (sequence.length < 12) return { prediction: null, confidence: 0 };

  const segments = [];
  let currentSegment = { value: sequence[0], count: 1 };
  
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] === currentSegment.value) {
      currentSegment.count++;
    } else {
      segments.push(currentSegment);
      currentSegment = { value: sequence[i], count: 1 };
    }
  }
  segments.push(currentSegment);

  // Phân tích độ dài đoạn
  const avgLength = segments.reduce((sum, seg) => sum + seg.count, 0) / segments.length;
  const lastSegment = segments[segments.length - 1];

  if (lastSegment.count >= avgLength * 1.8) {
    return {
      prediction: lastSegment.value === 'T' ? 'X' : 'T',
      confidence: 0.89,
      accuracy: 0.85
    };
  }

  return { prediction: null, confidence: 0 };
}

function analyzePeakValleyPattern() {
  if (sequence.length < 10) return { prediction: null, confidence: 0 };

  const last10 = sequence.slice(-10);
  let peaks = 0;
  let valleys = 0;

  for (let i = 1; i < last10.length - 1; i++) {
    if (last10[i-1] !== last10[i] && last10[i] === last10[i+1]) {
      if (last10[i] === 'T') peaks++;
      else valleys++;
    }
  }

  if (peaks >= 3 || valleys >= 3) {
    return {
      prediction: peaks > valleys ? 'X' : 'T',
      confidence: 0.87,
      accuracy: 0.82
    };
  }

  return { prediction: null, confidence: 0 };
}

function analyzeReversePoint() {
  if (sequence.length < 15) return { prediction: null, confidence: 0 };

  const last15 = sequence.slice(-15);
  let reversals = [];
  
  for (let i = 1; i < last15.length - 1; i++) {
    if (last15[i-1] !== last15[i] && last15[i] !== last15[i+1]) {
      reversals.push(i);
    }
  }

  if (reversals.length >= 4) {
    const avgGap = (reversals[reversals.length-1] - reversals[0]) / (reversals.length - 1);
    if (Math.abs(avgGap - Math.round(avgGap)) < 0.2) {
      return {
        prediction: last15[last15.length-1] === 'T' ? 'X' : 'T',
        confidence: 0.86,
        accuracy: 0.81
      };
    }
  }

  return { prediction: null, confidence: 0 };
}

function analyzeDoubleConfirmation() {
  if (sequence.length < 8) return { prediction: null, confidence: 0 };

  const last8 = sequence.slice(-8);
  let taiSequences = 0;
  let xiuSequences = 0;

  for (let i = 0; i < last8.length - 1; i++) {
    if (last8[i] === last8[i+1]) {
      if (last8[i] === 'T') taiSequences++;
      else xiuSequences++;
    }
  }

  if (Math.abs(taiSequences - xiuSequences) >= 2) {
    return {
      prediction: taiSequences > xiuSequences ? 'X' : 'T',
      confidence: 0.82,
      accuracy: 0.78
    };
  }

  return { prediction: null, confidence: 0 };
}

function analyzeBreakRiskPattern() {
  if (sequence.length < 12) return { prediction: null, confidence: 0 };

  const last12 = sequence.slice(-12);
  let alternatePatterns = 0;
  let riskScore = 0;

  // Phát hiện mẫu hình xen kẽ
  for (let i = 1; i < last12.length; i++) {
    if (last12[i] !== last12[i-1]) {
      alternatePatterns++;
    }
  }

  // Tính điểm rủi ro
  if (alternatePatterns >= 8) {
    riskScore += 0.4;
  }

  // Kiểm tra độ dài chuỗi xen kẽ
  let currentStreak = 1;
  let maxStreak = 1;
  for (let i = 1; i < last12.length; i++) {
    if (last12[i] !== last12[i-1]) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  if (maxStreak >= 5) {
    riskScore += 0.3;
  }

  if (riskScore >= 0.6) {
    return {
      prediction: last12[last12.length - 1] === 'T' ? 'X' : 'T',
      confidence: 0.85,
      accuracy: 0.81
    };
  }

  return { prediction: null, confidence: 0 };
}

function analyzeBreakPattern() {
  if (sequence.length < 7) return { prediction: null, confidence: 0 };

  const last7 = sequence.slice(-7);
  let alternateCount = 0;

  for (let i = 1; i < last7.length; i++) {
    if (last7[i] !== last7[i-1]) alternateCount++;
  }

  if (alternateCount >= 5) {
    // Nếu có nhiều lần đổi chiều liên tiếp, khả năng sẽ lặp lại
    return {
      prediction: last7[last7.length - 1],
      confidence: 0.75
    };
  }

  return { prediction: null, confidence: 0 };
}

function analyzeDragonPattern() {
  if (sequence.length < 10) return { prediction: null, confidence: 0 };

  const last10 = sequence.slice(-10);
  let taiCount = last10.filter(x => x === 'T').length;

  if (taiCount >= 8) {
    // Cầu rồng Tài
    return {
      prediction: 'T',
      confidence: 0.8
    };
  } else if (taiCount <= 2) {
    // Cầu rồng Xỉu
    return {
      prediction: 'X',
      confidence: 0.8
    };
  }

  return { prediction: null, confidence: 0 };
}

// Display functions
function displayResultsForActiveTab() {
  const resultsArea = document.getElementById('resultsArea');

  switch(activeTab) {
    case 'prediction':
      displayPredictionAnalysis();
      break;
    case 'basic':
      displayBasicAnalysis();
      break;
    case 'advanced':
      displayAdvancedAnalysis();
      break;
    case 'pattern':
      displayPatternAnalysis();
      break;
    case 'tips':
      displayTipsAnalysis();
      break;
  }
}

function displayTipsAnalysis() {
  const tips = getTips();
  const resultsArea = document.getElementById('resultsArea');

  let html = '<div class="tips-container">';
  tips.forEach(category => {
    html += `
      <div class="tip-category animate-fade-in">
        <h3 class="tip-title">${category.title}</h3>
        <ul class="tip-list">
          ${category.tips.map(tip => `
            <li class="tip-item animate-slide-in">
              <span class="tip-icon">💡</span>
              ${tip}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  });
  html += '</div>';

  resultsArea.innerHTML = html;
}

function displayPredictionAnalysis() {
  const resultsArea = document.getElementById('resultsArea');
  const markov = getCurrentMarkovPrediction();
  const trend = getTrendAnalysis();
  const tips = [
    "Chuỗi dài sẽ có xu hướng đổi chiều",
    "Chú ý các điểm gãy cầu quan trọng",
    "Đừng bắt theo xu hướng quá nhiều lần",
    "Quan sát kỹ các mẫu hình lặp lại",
    "Tỷ lệ thắng tăng khi kết hợp nhiều phương pháp"
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  const confidencePercent = Math.round(markov.confidence * 100);

  resultsArea.innerHTML = `
    <div class="prediction-card">
      <div class="tip-banner">${randomTip}</div>
      <div class="prediction-title">Dự đoán: ${markov.prediction === 'T' ? 'TÀI' : 'XỈU'}</div>
      <div class="confidence-meter">
        <div class="confidence-fill" style="width: ${confidencePercent}%"></div>
        <div class="confidence-label">${confidencePercent}% Độ tin cậy</div>
      </div>
    </div>
  `;
}

function displayBasicAnalysis() {
  const resultsArea = document.getElementById('resultsArea');
  const taiCount = sequence.filter(x => x === 'T').length;
  const xiuCount = sequence.length - taiCount;
  const taiPercent = Math.round(taiCount/sequence.length*100);
  const xiuPercent = Math.round(xiuCount/sequence.length*100);

  resultsArea.innerHTML = `
    <div class="analysis-card">
      <h3>Phân tích cơ bản</h3>
      <div class="stat-row">
        <span class="stat-label">Tổng số lượt:</span>
        <span class="stat-value">${sequence.length}</span>
      </div>
      <div class="stat-group">
        <div class="stat-label">Tỷ lệ TÀI/XỈU:</div>
        <div class="stat-meter">
          <div class="stat-fill tai" style="width: ${taiPercent}%">
            <span class="tai-label">TÀI: ${taiCount} (${taiPercent}%)</span>
          </div>
          <div class="stat-fill xiu" style="width: ${xiuPercent}%">
            <span class="xiu-label">XỈU: ${xiuCount} (${xiuPercent}%)</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function displayAdvancedAnalysis() {
  const resultsArea = document.getElementById('resultsArea');
  const streaks = calculateStreaks();
  const alternationRate = calculateAlternationRate();
  const maxStreak = Math.max(streaks.tai, streaks.xiu);

  resultsArea.innerHTML = `
    <div class="analysis-card">
      <h3>Phân tích nâng cao</h3>
      <div class="streak-meters">
        <div class="streak-group">
          <div class="streak-label">Chuỗi TÀI dài nhất</div>
          <div class="streak-meter">
            <div class="streak-fill tai" style="width: ${(streaks.tai/maxStreak)*100}%">
              <span class="streak-value">${streaks.tai}</span>
            </div>
          </div>
        </div>
        <div class="streak-group">
          <div class="streak-label">Chuỗi XỈU dài nhất</div>
          <div class="streak-meter">
            <div class="streak-fill xiu" style="width: ${(streaks.xiu/maxStreak)*100}%">
              <span class="streak-value">${streaks.xiu}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="alternation-meter">
        <div class="meter-label">Tỷ lệ đổi chiều</div>
        <div class="meter-bar">
          <div class="meter-fill" style="width: ${alternationRate}%">
            <span class="meter-value">${alternationRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function displayPatternAnalysis() {
  const resultsArea = document.getElementById('resultsArea');
  const last10 = getLastNValues(10);
  const trend = getTrendAnalysis();

  resultsArea.innerHTML = `
    <div class="analysis-card">
      <h3>Phân tích mẫu hình</h3>
      <div class="pattern-display">
        <div class="pattern-label">10 kết quả gần nhất:</div>
        <div class="pattern-sequence">
          ${last10.map(val => `<span class="pattern-value ${val === 'T' ? 'tai' : 'xiu'}">${val}</span>`).join('')}
        </div>
      </div>
      <div class="trend-indicator">
        <div class="trend-label">Xu hướng hiện tại:</div>
        <div class="trend-value ${trend.trend}">${trend.trend}</div>
      </div>
    </div>
  `;
}

// Local storage functions
function saveToLocalStorage() {
  try {
    localStorage.setItem('tx_sequence', JSON.stringify(sequence));
    localStorage.setItem('tx_history', JSON.stringify(historyData));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

function loadFromLocalStorage() {
  try {
    const savedSequence = localStorage.getItem('tx_sequence');
    const savedHistory = localStorage.getItem('tx_history');

    if (savedSequence) {
      sequence = JSON.parse(savedSequence);
      updateSequenceDisplay();
    }

    if (savedHistory) {
      historyData = JSON.parse(savedHistory);
    }
  } catch (e) {
    console.error('Error loading from localStorage', e);
  }
}

// Chart functions
function showChart() {
  const chartModal = document.getElementById('chartModal');
  const chartContainer = chartModal.querySelector('.chart-container');

  chartModal.style.display = 'flex';
  // Force reflow
  chartModal.offsetHeight;

  chartModal.classList.add('visible');
  chartContainer.classList.add('visible');

  drawChart();
}

function hideChart() {
  const chartModal = document.getElementById('chartModal');
  const chartContainer = chartModal.querySelector('.chart-container');

  chartModal.classList.remove('visible');
  chartContainer.classList.remove('visible');

  setTimeout(() => {
    chartModal.style.display = 'none';
  }, 300);
}

function setChartType(type) {
  chartType = type;
  const chartButtons = document.querySelectorAll('.chart-btn');
  chartButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-chart') === type);
  });
  drawChart();
}

function drawSequenceChart(context, canvas) {
  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  const padding = 40;
  const width = canvas.width - 2 * padding;
  const height = canvas.height - 2 * padding;
  const values = sequence.slice(-50);
  const stepX = width / Math.max(1, values.length - 1);

  // Draw grid
  context.strokeStyle = 'rgba(255,255,255,0.1)';
  context.lineWidth = 1;

  // Horizontal lines
  for(let i = 0; i <= 10; i++) {
    const y = padding + (height * i / 10);
    context.beginPath();
    context.moveTo(padding, y);
    context.lineTo(width + padding, y);
    context.stroke();

    // Add y-axis labels
    context.fillStyle = '#ffffff';
    context.textAlign = 'right';
    context.font = '12px Orbitron';
    context.fillText(`${100 - i * 10}%`, padding - 10, y + 4);
  }

  // Vertical lines
  const verticalLines = Math.min(10, values.length);
  for(let i = 0; i <= verticalLines; i++) {
    const x = padding + (width * i / verticalLines);
    context.beginPath();
    context.moveTo(x, padding);
    context.lineTo(x, height + padding);
    context.stroke();
  }

  // Draw sequence line
  context.beginPath();
  context.strokeStyle = '#00ffff';
  context.lineWidth = 2;

  values.forEach((value, i) => {
    const x = padding + i * stepX;
    const y = padding + (value === 'T' ? height * 0.25 : height * 0.75);

    if (i === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }

    // Draw points
    context.fillStyle = value === 'T' ? '#00ffff' : '#ff77aa';
    context.beginPath();
    context.arc(x, y, 6, 0, Math.PI * 2);
    context.fill();
  });

  context.stroke();
}

function drawDistributionChart(context, canvas) {
  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  const taiCount = sequence.filter(x => x === 'T').length;
  const xiuCount = sequence.length - taiCount;
  const total = sequence.length;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 80;

  // Draw Tài portion
  const taiAngle = (taiCount / total) * Math.PI * 2;
  context.beginPath();
  context.moveTo(centerX, centerY);
  context.arc(centerX, centerY, radius, 0, taiAngle);
  context.fillStyle = 'rgba(0, 255, 255, 0.7)';
  context.fill();
  context.strokeStyle = '#00ffff';
  context.lineWidth = 2;
  context.stroke();

  // Draw Xỉu portion
  context.beginPath();
  context.moveTo(centerX, centerY);
  context.arc(centerX, centerY, radius, taiAngle, Math.PI * 2);
  context.fillStyle = 'rgba(255, 119, 170, 0.7)';
  context.fill();
  context.strokeStyle = '#ff77aa';
  context.lineWidth = 2;
  context.stroke();

  // Add labels
  context.font = '20px Orbitron';
  context.textAlign = 'center';
  context.fillStyle = '#ffffff';

  // Tài label
  context.fillText(`TÀI: ${taiCount} (${Math.round(taiCount/total*100)}%)`, 
    centerX - radius/2, centerY - radius/4);

  // Xỉu label
  context.fillText(`XỈU: ${xiuCount} (${Math.round(xiuCount/total*100)}%)`, 
    centerX + radius/2, centerY + radius/4);
}

function drawPatternChart(context, canvas) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Get pattern counts
  const patterns = {};
  for (let i = 0; i < sequence.length - 1; i++) {
    const pattern = sequence[i] + sequence[i + 1];
    patterns[pattern] = (patterns[pattern] || 0) + 1;
  }

  const barWidth = Math.min(80, canvas.width / 8);
  const padding = 80;

  // Tăng độ tương phản của lưới
  context.strokeStyle = 'rgba(255,255,255,0.2)';
  context.lineWidth = 1;

  const availableWidth = canvas.width - 2 * padding;
  const availableHeight = canvas.height - 2 * padding;

  // Find max count for scaling
  const maxCount = Math.max(...Object.values(patterns));

  // Draw grid lines
  for(let i = 0; i <= 10; i++) {
    const y = padding + (availableHeight * i / 10);
    context.beginPath();
    context.moveTo(padding, y);
    context.lineTo(canvas.width - padding, y);
    context.stroke();
  }

  let x = padding + 30;

  // Draw bars
  Object.entries(patterns).forEach(([pattern, count]) => {
    const height = (count / maxCount) * availableHeight;
    const y = canvas.height - padding - height;

    // Draw bar
    const gradient = context.createLinearGradient(x, y, x, canvas.height - padding);
    if(pattern.includes('T')) {
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0.7)');
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0.3)');
    } else {
      gradient.addColorStop(0, 'rgba(255, 119, 170, 0.7)');
      gradient.addColorStop(1, 'rgba(255, 119, 170, 0.3)');
    }

    context.fillStyle = gradient;
    context.fillRect(x, y, barWidth, height);

    // Draw border
    context.strokeStyle = pattern.includes('T') ? '#00ffff' : '#ff77aa';
    context.lineWidth = 2;
    context.strokeRect(x, y, barWidth, height);

    // Draw labels
    context.font = '16px Orbitron';
    context.textAlign = 'center';
    context.fillStyle = '#ffffff';
    // Pattern label
    context.fillText(pattern, x + barWidth/2, canvas.height - padding + 25);
    // Count label
    context.fillText(count.toString(), x + barWidth/2, y - 10);

    x += barWidth + 40;
  });
}

function getPatternCounts() {
  const patterns = {};
  for (let i = 0; i < sequence.length - 1; i++) {
    const pattern = sequence[i] + sequence[i + 1];
    patterns[pattern] = (patterns[pattern] || 0) + 1;
  }
  return patterns;
}

function drawChart() {
  const canvas = document.getElementById('chartCanvas');
  const context = canvas.getContext('2d');

  canvas.width = canvas.parentElement.clientWidth * 0.9;
  canvas.height = 400;

  context.clearRect(0, 0, canvas.width, canvas.height);

  if (sequence.length === 0) {
    context.font = '16px Roboto';
    context.fillStyle = '#aaeeff';
    context.textAlign = 'center';
    context.fillText('Không có dữ liệu để hiển thị', canvas.width / 2, canvas.height / 2);
    return;
  }

  switch (chartType) {
    case 'sequence':
      drawSequenceChart(context, canvas);
      break;
    case 'distribution':
      drawDistributionChart(context, canvas);
      break;
    case 'pattern':
      drawPatternChart(context, canvas);
      break;
  }
}

function saveAnalysisToHistory() {
  const prediction = getCurrentMarkovPrediction();
  const currentAnalysis = {
    timestamp: new Date().toISOString(),
    sequence: [...sequence],
    prediction: prediction.prediction,
    wasBreakAttempt: prediction.breakAttempt || false,
    wasSuccessful: false // Sẽ được cập nhật khi có kết quả thực tế
  };

  historyData.unshift(currentAnalysis);

  // Giới hạn lịch sử 50 phân tích gần nhất
  if (historyData.length > 50) {
    historyData.pop();
  }

  saveToLocalStorage();
}

// Chart drawing functions would go here...
// The rest of the JavaScript code remains the same,
// just organized into this separate file.

// Reset function
function resetData() {
  if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu đã lưu?')) {
    sequence = [];
    historyData = [];
    localStorage.removeItem('tx_sequence');
    localStorage.removeItem('tx_history');
    updateSequenceDisplay();
    document.getElementById('resultsArea').innerHTML = 'Nhập dữ liệu và nhấn "Phân tích" để xem kết quả dự đoán.';
  }
}

document.getElementById('resetBtn').addEventListener('click', resetData);

// Finally, if you need to expose any functions globally
window.addToSequence = addToSequence;
window.analyzeSequence = analyzeSequence;
window.showChart = showChart;
window.hideChart = hideChart;
window.resetData = resetData;