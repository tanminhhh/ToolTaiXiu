/**
 * Model học máy động với khả năng tự điều chỉnh trọng số
 */
class PredictionModel {
  constructor() {
    this.weights = {
      cauAnalysis: 0.5,
      neural: 0.25,
      markov: 0.15,
      goldenRatio: 0.1
    };
    this.performanceHistory = [];
  }

  updateWeights(successfulModel) {
    // Cập nhật trọng số dựa trên kết quả
    const learningRate = 0.05;
    this.weights[successfulModel] += learningRate;
    
    // Chuẩn hóa các trọng số
    const total = Object.values(this.weights).reduce((a, b) => a + b);
    for (const key in this.weights) {
      this.weights[key] /= total;
    }
    
    this.performanceHistory.push({...this.weights});
  }
  
  getWeights() {
    return {...this.weights};
  }
  
  getPerformanceHistory() {
    return [...this.performanceHistory];
  }
}

// Lưu trữ trạng thái
const state = {
  sequence: [],
  activeTab: "prediction",
  chartType: "sequence",
  historyData: [],
  analyzing: false,
  showChartModal: false,
  prediction: null,
  predictionModel: new PredictionModel(),
  kubetAnalysis: null // Thêm phân tích Kubet
};

/**
 * Phân tích chuỗi và chia thành các đoạn (segments) của cùng giá trị
 */
function segmentSequence(sequence) {
  if (!sequence.length) return [];
  
  const segments = [];
  let currentValue = sequence[0];
  let currentCount = 1;
  let startIndex = 0;
  
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] === currentValue) {
      currentCount++;
    } else {
      segments.push({ value: currentValue, count: currentCount, startIndex });
      currentValue = sequence[i];
      currentCount = 1;
      startIndex = i;
    }
  }
  
  segments.push({ value: currentValue, count: currentCount, startIndex });
  return segments;
}

/**
 * Phát hiện mẫu cầu nâng cao - nhận diện nhiều loại mẫu khác nhau
 */
function detectAdvancedCauPattern(sequence, segments) {
  if (sequence.length < 3) {
    return {
      patternType: "Chưa đủ dữ liệu",
      detectedPatterns: [],
      patternScores: {},
      trend: "early",
      maturity: 0
    };
  }
  
  // Phân tích các loại mẫu
  const patterns = {};
  const detectedPatterns = [];
  
  // Đếm tần suất T và X
  const tCount = sequence.filter(v => v === "T").length;
  const xCount = sequence.filter(v => v === "X").length;
  const total = sequence.length;
  
  // Tính tỉ lệ T:X
  const tRatio = tCount / total;
  const xRatio = xCount / total;
  const ratioDeviation = Math.abs(0.5 - tRatio);
  
  // Kiểm tra tính cân bằng
  if (ratioDeviation < 0.1) {
    patterns["Cân bằng"] = 0.8 - ratioDeviation * 5; // 0.3 ~ 0.8 dựa vào độ lệch
    detectedPatterns.push("Cân bằng");
  } else if (tRatio > 0.65) {
    patterns["Thiên Tài"] = Math.min(0.95, tRatio);
    detectedPatterns.push("Thiên Tài");
  } else if (xRatio > 0.65) {
    patterns["Thiên Xỉu"] = Math.min(0.95, xRatio);
    detectedPatterns.push("Thiên Xỉu");
  }
  
  // Kiểm tra cầu dài
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    if (lastSegment.count >= 5) {
      patterns["Cầu dài"] = Math.min(0.9, 0.5 + lastSegment.count * 0.07);
      detectedPatterns.push("Cầu dài");
    } else if (lastSegment.count >= 3) {
      patterns["Cầu trung bình"] = 0.5 + lastSegment.count * 0.05;
      detectedPatterns.push("Cầu trung bình");
    }
  }
  
  // Kiểm tra mẫu xen kẽ T-X-T-X hoặc X-T-X-T
  let alternatingCount = 0;
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] !== sequence[i-1]) alternatingCount++;
  }
  
  const alternatingRatio = alternatingCount / (sequence.length - 1);
  if (alternatingRatio > 0.7) {
    patterns["Xen kẽ"] = Math.min(0.9, alternatingRatio);
    detectedPatterns.push("Xen kẽ");
  }
  
  // Kiểm tra mẫu tuần hoàn
  if (sequence.length >= 6) {
    const endSegment = sequence.slice(-3);
    let cyclicScore = 0;
    
    // Kiểm tra các chu kỳ khác nhau
    for (let cycleLength = 2; cycleLength <= 4; cycleLength++) {
      if (sequence.length < cycleLength * 2) continue;
      
      const cycle1 = sequence.slice(-cycleLength * 2, -cycleLength);
      const cycle2 = sequence.slice(-cycleLength);
      
      let matchCount = 0;
      for (let i = 0; i < cycleLength; i++) {
        if (cycle1[i] === cycle2[i]) matchCount++;
      }
      
      const cycleScore = matchCount / cycleLength;
      if (cycleScore > cyclicScore) {
        cyclicScore = cycleScore;
      }
    }
    
    if (cyclicScore > 0.7) {
      patterns["Tuần hoàn"] = cyclicScore;
      detectedPatterns.push("Tuần hoàn");
    }
  }
  
  // Xác định loại mẫu phổ biến nhất
  let mainPattern = "Ngẫu nhiên";
  let highestScore = 0;
  
  Object.entries(patterns).forEach(([pattern, score]) => {
    if (score > highestScore) {
      mainPattern = pattern;
      highestScore = score;
    }
  });
  
  // Xác định xu hướng ổn định
  let trend = "stable";
  if (sequence.length < 8) {
    trend = "early";
  } else {
    const firstHalf = sequence.slice(0, Math.floor(sequence.length / 2));
    const secondHalf = sequence.slice(Math.floor(sequence.length / 2));
    
    const firstHalfTRatio = firstHalf.filter(v => v === "T").length / firstHalf.length;
    const secondHalfTRatio = secondHalf.filter(v => v === "T").length / secondHalf.length;
    
    const trendChange = Math.abs(firstHalfTRatio - secondHalfTRatio);
    
    if (trendChange > 0.25) {
      trend = "transitioning";
    } else if (trendChange > 0.15) {
      trend = "unstable";
    }
  }
  
  // Tính độ trưởng thành của mẫu
  const maturity = Math.min(1, sequence.length / 20);
  
  return {
    patternType: mainPattern,
    detectedPatterns,
    patternScores: patterns,
    trend,
    maturity
  };
}

/**
 * Phân tích điểm bẻ cầu chi tiết
 */
function analyzeEnhancedBreakpoint(sequence, segments) {
  if (sequence.length < 3 || segments.length === 0) {
    return {
      breakProbability: 0.5,
      breakStrength: 0,
      optimalBreakPoint: false,
      fibonacciAlignment: 0
    };
  }
  
  const lastSegment = segments[segments.length - 1];
  
  // Tính xác suất bẻ cầu dựa trên chiều dài đoạn
  let breakProbability = 0.5;
  
  // Các dãy fibonacci: 1, 2, 3, 5, 8, 13...
  const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21];
  
  // Kiểm tra xem có trùng với số Fibonacci
  const isFibonacciLength = fibonacciNumbers.includes(lastSegment.count);
  
  // Tính độ gần với số Fibonacci
  let closestFibDistance = Math.min(...fibonacciNumbers.map(f => Math.abs(f - lastSegment.count)));
  const fibonacciAlignment = closestFibDistance === 0 ? 1 : 1 / (1 + closestFibDistance);
  
  if (lastSegment.count === 1) {
    // Cầu vừa đổi, khả năng lặp lại cao
    breakProbability = 0.25;
  } else if (lastSegment.count === 2) {
    // Cầu ngắn, chưa ổn định
    breakProbability = 0.35;
  } else if (lastSegment.count === 3) {
    // Cầu bắt đầu ổn định
    breakProbability = 0.47;
  } else if (lastSegment.count === 5) {
    // Fibonacci 5 - điểm bẻ cầu tốt
    breakProbability = 0.75;
  } else if (lastSegment.count === 8) {
    // Fibonacci 8 - điểm bẻ cầu rất tốt
    breakProbability = 0.85;
  } else if (lastSegment.count >= 10) {
    // Cầu quá dài, khả năng bẻ rất cao
    breakProbability = 0.9;
  } else if (isFibonacciLength) {
    // Các số Fibonacci khác
    breakProbability = 0.6 + (lastSegment.count * 0.02);
  } else {
    // Các số không phải Fibonacci
    breakProbability = 0.4 + (lastSegment.count * 0.05);
  }
  
  // Kiểm tra số đoạn trước đó
  if (segments.length >= 2) {
    const previousSegment = segments[segments.length - 2];
    
    // Nếu đoạn trước cũng dài, điều chỉnh xác suất
    if (previousSegment.count >= 5) {
      breakProbability = Math.min(0.95, breakProbability + 0.05);
    }
    
    // Nếu đoạn hiện tại dài hơn đoạn trước, tăng xác suất
    if (lastSegment.count > previousSegment.count) {
      breakProbability = Math.min(0.95, breakProbability + 0.05);
    }
  }
  
  // Phân tích thêm các mẫu lặp lại trong quá khứ
  const uniquePatterns = new Set();
  for (let i = 0; i < segments.length - 1; i++) {
    uniquePatterns.add(`${segments[i].value}-${segments[i].count}`);
  }
  
  // Nếu có nhiều mẫu đa dạng, khả năng bẻ cầu cao hơn
  const patternDiversity = uniquePatterns.size / Math.max(1, segments.length - 1);
  breakProbability = Math.min(0.95, breakProbability + patternDiversity * 0.05);
  
  // Tính độ mạnh của điểm bẻ cầu
  const breakStrength = Math.min(1, lastSegment.count / 10 + fibonacciAlignment * 0.3);
  
  // Xác định điểm bẻ cầu tối ưu
  const optimalBreakPoint = isFibonacciLength && lastSegment.count >= 5;
  
  return {
    breakProbability,
    breakStrength,
    optimalBreakPoint,
    fibonacciAlignment
  };
}

/**
 * Phân tích toàn diện cầu
 */
function performEnhancedCauAnalysis(sequence) {
  if (sequence.length < 3) {
    return {
      prediction: null,
      confidence: 0,
      streakLength: 0,
      breakProbability: 0.5,
      patternType: "Chưa đủ dữ liệu",
      patternTrend: "early",
      detailedAnalysis: {
        oscillationRate: 0,
        streakQuality: 0,
        breakStrength: 0,
        patternStrength: 0,
        optimalBreakPoint: false,
        fibonacciAlignment: 0,
        xingXangIndex: 0,
        adaptability: 0,
        dominantValue: null,
        patternMaturity: 0
      },
      patterns: {
        detectedPatterns: [],
        patternScores: {}
      }
    };
  }
  
  // Phân đoạn chuỗi
  const segments = segmentSequence(sequence);
  
  // Phân tích mẫu cầu
  const patternAnalysis = detectAdvancedCauPattern(sequence, segments);
  
  // Phân tích điểm bẻ cầu
  const breakpointAnalysis = analyzeEnhancedBreakpoint(sequence, segments);
  
  // Lấy thông tin đoạn hiện tại
  const currentSegment = segments[segments.length - 1];
  const currentValue = currentSegment.value;
  const oppositeValue = currentValue === "T" ? "X" : "T";
  
  // Tính tỉ lệ dao động
  let oscillationCount = 0;
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] !== sequence[i-1]) {
      oscillationCount++;
    }
  }
  const oscillationRate = oscillationCount / (sequence.length - 1);
  
  // Tính chỉ số xen kẽ
  const xingXangIndex = oscillationRate > 0.7 ? oscillationRate : 
    oscillationRate > 0.5 ? 0.5 + (oscillationRate - 0.5) * 2 : oscillationRate;
  
  // Xác định giá trị chiếm ưu thế
  const tCount = sequence.filter(v => v === "T").length;
  const xCount = sequence.filter(v => v === "X").length;
  let dominantValue = null;
  
  if (tCount > xCount && tCount / sequence.length > 0.6) {
    dominantValue = "T";
  } else if (xCount > tCount && xCount / sequence.length > 0.6) {
    dominantValue = "X";
  }
  
  // Tính độ thích ứng của mẫu
  const adaptability = Math.min(1, patternAnalysis.detectedPatterns.length * 0.2);
  
  // Phân tích để đưa ra dự đoán
  let prediction = null;
  let confidence = 0;
  
  // Logic dự đoán nâng cao
  if (breakpointAnalysis.breakProbability > 0.7 && currentSegment.count >= 3) {
    // Khả năng cao sẽ bẻ cầu
    prediction = oppositeValue;
    confidence = breakpointAnalysis.breakProbability;
  } else if (patternAnalysis.patternType === "Xen kẽ" && patternAnalysis.patternScores["Xen kẽ"] > 0.7) {
    // Mẫu xen kẽ mạnh
    prediction = oppositeValue;
    confidence = patternAnalysis.patternScores["Xen kẽ"];
  } else if (patternAnalysis.patternType === "Tuần hoàn" && patternAnalysis.patternScores["Tuần hoàn"] > 0.7) {
    // Dự đoán dựa trên mẫu tuần hoàn
    // Tìm chu kỳ và dự đoán giá trị tiếp theo
    for (let cycleLength = 2; cycleLength <= 4; cycleLength++) {
      if (sequence.length < cycleLength * 2) continue;
      
      const cycle1 = sequence.slice(-cycleLength * 2, -cycleLength);
      const cycle2 = sequence.slice(-cycleLength);
      
      let matchCount = 0;
      for (let i = 0; i < cycleLength; i++) {
        if (cycle1[i] === cycle2[i]) matchCount++;
      }
      
      const cycleScore = matchCount / cycleLength;
      if (cycleScore > 0.7) {
        // Lấy vị trí tiếp theo trong chu kỳ
        const nextCycleIndex = 0; // Vị trí đầu tiên của chu kỳ mới
        prediction = cycle1[nextCycleIndex];
        confidence = cycleScore;
        break;
      }
    }
  } else if (patternAnalysis.patternType === "Thiên Tài" && patternAnalysis.patternScores["Thiên Tài"] > 0.7) {
    // Xu hướng mạnh thiên về Tài
    prediction = "T";
    confidence = patternAnalysis.patternScores["Thiên Tài"];
  } else if (patternAnalysis.patternType === "Thiên Xỉu" && patternAnalysis.patternScores["Thiên Xỉu"] > 0.7) {
    // Xu hướng mạnh thiên về Xỉu
    prediction = "X";
    confidence = patternAnalysis.patternScores["Thiên Xỉu"];
  } else if (currentSegment.count <= 2) {
    // Cầu ngắn, khả năng tiếp tục cao
    prediction = currentValue;
    confidence = 0.5 + currentSegment.count * 0.05;
  } else {
    // Phân tích tổng hợp khi không có mẫu rõ ràng
    // Ưu tiên theo cầu hiện tại với điều chỉnh dựa vào độ mạnh của mẫu
    prediction = breakpointAnalysis.breakProbability > 0.5 ? oppositeValue : currentValue;
    confidence = Math.abs(breakpointAnalysis.breakProbability - 0.5) * 2;
  }
  
  // Tính chất lượng cầu hiện tại
  const streakQuality = breakpointAnalysis.fibonacciAlignment * 0.5 + 
    (currentSegment.count / 10) * 0.5;
  
  // Tính độ mạnh của mẫu
  const patternStrength = Object.values(patternAnalysis.patternScores).length > 0 
    ? Math.max(...Object.values(patternAnalysis.patternScores))
    : 0;
  
  return {
    prediction,
    confidence: Math.min(0.95, confidence),
    streakLength: currentSegment.count,
    breakProbability: breakpointAnalysis.breakProbability,
    patternType: patternAnalysis.patternType,
    patternTrend: patternAnalysis.trend,
    detailedAnalysis: {
      oscillationRate,
      streakQuality,
      breakStrength: breakpointAnalysis.breakStrength,
      patternStrength,
      optimalBreakPoint: breakpointAnalysis.optimalBreakPoint,
      fibonacciAlignment: breakpointAnalysis.fibonacciAlignment,
      xingXangIndex,
      adaptability,
      dominantValue,
      patternMaturity: patternAnalysis.maturity
    },
    patterns: {
      detectedPatterns: patternAnalysis.detectedPatterns,
      patternScores: patternAnalysis.patternScores
    }
  };
}

/**
 * Tính entropy của chuỗi - đo lường sự ngẫu nhiên
 */
function calculateSequenceEntropy(sequence) {
  if (sequence.length < 2) return 1.0;
  
  // Tính phân phối các cặp kế tiếp
  const pairCounts = {};
  const totalPairs = sequence.length - 1;
  
  for (let i = 0; i < totalPairs; i++) {
    const pair = `${sequence[i]}${sequence[i+1]}`;
    pairCounts[pair] = (pairCounts[pair] || 0) + 1;
  }
  
  // Tính entropy
  let entropy = 0;
  for (const pair in pairCounts) {
    const probability = pairCounts[pair] / totalPairs;
    entropy -= probability * Math.log2(probability);
  }
  
  // Chuẩn hóa về 0-1
  return Math.min(1, entropy / 2);
}

/**
 * Kiểm tra tính ngẫu nhiên tiên tiến cho chuỗi
 * Sử dụng các kiểm định thống kê chuẩn để đánh giá tính ngẫu nhiên
 */
function advancedRandomnessTests(sequence) {
  if (sequence.length < 10) {
    return {
      isRandom: true,
      zScore: 0,
      pairDistribution: {},
      confidence: 0,
      analysis: "Chưa đủ dữ liệu để kiểm tra tính ngẫu nhiên"
    };
  }
  
  // Đếm số lượng T và X
  const tCount = sequence.filter(v => v === "T").length;
  const xCount = sequence.length - tCount;
  
  // Kiểm tra runs test (kiểm tra các chuỗi liên tiếp)
  let runs = 1;
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] !== sequence[i-1]) runs++;
  }
  
  const n = sequence.length;
  const expectedRuns = (2 * tCount * xCount) / n + 1;
  const runsVariance = (2 * tCount * xCount * (2 * tCount * xCount - n)) / (n * n * (n - 1));
  const zScore = (runs - expectedRuns) / Math.sqrt(runsVariance);
  
  // Kiểm tra serial test (kiểm tra các cặp kề nhau)
  let pairs = {};
  for (let i = 0; i < n - 1; i++) {
    const pair = sequence[i] + sequence[i+1];
    pairs[pair] = (pairs[pair] || 0) + 1;
  }
  
  // Phân tích tính đồng đều của các cặp
  const pairValues = Object.values(pairs);
  const pairMean = pairValues.reduce((a, b) => a + b, 0) / pairValues.length;
  const pairVariance = pairValues.reduce((a, b) => a + Math.pow(b - pairMean, 2), 0) / pairValues.length;
  const pairCoefficientOfVariation = Math.sqrt(pairVariance) / pairMean;
  
  // Phân tích tỷ lệ T/X
  const proportionBalance = Math.abs(0.5 - (tCount / n));
  
  // Kết luận về tính ngẫu nhiên
  // Nếu |zScore| < 1.96, chúng ta có thể nói với độ tin cậy 95% rằng chuỗi có tính ngẫu nhiên
  const isRandom = Math.abs(zScore) < 1.96;
  
  // Mức độ tin cậy
  let confidence = 0;
  if (Math.abs(zScore) < 1) {
    confidence = 0.9; // Rất có thể ngẫu nhiên
  } else if (Math.abs(zScore) < 1.96) {
    confidence = 0.7; // Có thể ngẫu nhiên
  } else if (Math.abs(zScore) < 2.58) {
    confidence = 0.3; // Có thể không ngẫu nhiên
  } else {
    confidence = 0.1; // Rất có thể không ngẫu nhiên
  }
  
  // Điều chỉnh độ tin cậy dựa trên các yếu tố khác
  if (proportionBalance > 0.2) {
    confidence *= 0.8; // Giảm độ tin cậy nếu tỷ lệ T/X mất cân bằng
  }
  
  if (pairCoefficientOfVariation > 0.5) {
    confidence *= 0.8; // Giảm độ tin cậy nếu phân phối cặp không đồng đều
  }
  
  // Phân tích chi tiết
  let analysis = "";
  if (isRandom) {
    if (Math.abs(zScore) < 1) {
      analysis = "Chuỗi có tính ngẫu nhiên cao.";
    } else {
      analysis = "Chuỗi có khả năng ngẫu nhiên, nhưng cần thêm dữ liệu để chắc chắn.";
    }
  } else {
    if (runs < expectedRuns) {
      analysis = "Chuỗi có xu hướng lặp lại (ít thay đổi giữa T và X).";
    } else {
      analysis = "Chuỗi có xu hướng xen kẽ (nhiều thay đổi giữa T và X).";
    }
  }
  
  return {
    isRandom,
    zScore,
    pairDistribution: pairs,
    confidence,
    analysis,
    proportionBalance,
    expectedRuns,
    actualRuns: runs
  };
}

/**
 * Phát hiện và đánh giá các mẫu Fibonacci trong chuỗi
 */
function detectFibonacciPatterns(sequence) {
  if (sequence.length < 3) {
    return { alignmentScore: 0, segments: [] };
  }
  
  // Dãy Fibonacci đầu
  const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21];
  
  // Phân đoạn chuỗi
  const segments = [];
  let currentValue = sequence[0];
  let currentLength = 1;
  
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] === currentValue) {
      currentLength++;
    } else {
      const isFibonacci = fibonacciNumbers.includes(currentLength);
      segments.push({ value: currentValue, length: currentLength, isFibonacci });
      currentValue = sequence[i];
      currentLength = 1;
    }
  }
  
  // Thêm đoạn cuối cùng
  const isFibonacci = fibonacciNumbers.includes(currentLength);
  segments.push({ value: currentValue, length: currentLength, isFibonacci });
  
  // Tính điểm phù hợp với Fibonacci
  const fibSegments = segments.filter(s => s.isFibonacci).length;
  const alignmentScore = segments.length > 0 ? fibSegments / segments.length : 0;
  
  return { alignmentScore, segments };
}

/**
 * Dự đoán dựa trên tỉ lệ vàng và các hằng số toán học
 */
function goldenRatioPrediction(sequence) {
  if (sequence.length < 5) {
    return { prediction: null, confidence: 0 };
  }
  
  // Tỉ lệ vàng phi = 1.618...
  const phi = 1.618033988749895;
  
  // Phân đoạn chuỗi
  let segments = [];
  let currentValue = sequence[0];
  let currentLength = 1;
  
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] === currentValue) {
      currentLength++;
    } else {
      segments.push({ value: currentValue, length: currentLength });
      currentValue = sequence[i];
      currentLength = 1;
    }
  }
  
  segments.push({ value: currentValue, length: currentLength });
  
  // Tính độ lệch của các đoạn với bội số của phi
  let totalDeviation = 0;
  let phiAlignedSegments = 0;
  
  segments.forEach(segment => {
    // Tìm bội số gần nhất của phi
    const closestPhiMultiple = Math.round(segment.length / phi) * phi;
    const deviation = Math.abs(segment.length - closestPhiMultiple) / closestPhiMultiple;
    
    if (deviation < 0.2) {
      phiAlignedSegments++;
    }
    
    totalDeviation += deviation;
  });
  
  // Tính điểm phù hợp với tỉ lệ vàng
  const phiAlignmentScore = segments.length > 0 
    ? phiAlignedSegments / segments.length 
    : 0;
  
  // Dự đoán dựa trên đoạn cuối cùng
  const lastSegment = segments[segments.length - 1];
  
  // Tính tỉ lệ đoạn hiện tại so với bội số phi tiếp theo
  const nextPhiMultiple = Math.ceil(lastSegment.length / phi) * phi;
  const currentRatio = lastSegment.length / nextPhiMultiple;
  
  let prediction = null;
  let confidence = 0;
  
  if (currentRatio > 0.8) {
    // Nếu đã gần với bội số phi tiếp theo, khả năng đổi giá trị cao
    prediction = lastSegment.value === "T" ? "X" : "T";
    confidence = Math.min(0.9, 0.5 + phiAlignmentScore * 0.4);
  } else if (phiAlignmentScore > 0.4) {
    // Nếu chuỗi thường phù hợp với tỉ lệ vàng, dự đoán tiếp tục cùng giá trị
    prediction = lastSegment.value;
    confidence = 0.5 + (1 - currentRatio) * 0.3;
  } else {
    // Không có mẫu rõ ràng
    prediction = lastSegment.value; // Giả định tiếp tục giá trị hiện tại
    confidence = 0.5;
  }
  
  return { prediction, confidence };
}

/**
 * Mô phỏng neural network cho dự đoán
 */
function neuralNetworkEmulation(sequence) {
  if (sequence.length < 5) {
    return { prediction: null, confidence: 0 };
  }
  
  // Đặc trưng dùng cho mô hình
  const lastValue = sequence[sequence.length - 1];
  const secondLastValue = sequence.length > 1 ? sequence[sequence.length - 2] : null;
  
  // Tính tỷ lệ T và X
  const tCount = sequence.filter(v => v === "T").length;
  const xCount = sequence.length - tCount;
  
  // Tính trọng số mô hình
  const weightLastValue = 0.4;
  const weightSecondLastValue = 0.2;
  const weightTXRatio = 0.3;
  const weightTrend = 0.1;
  
  // Đếm streak hiện tại
  let currentStreak = 1;
  for (let i = sequence.length - 2; i >= 0; i--) {
    if (sequence[i] === lastValue) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Tính xu hướng dựa trên nửa sau của chuỗi
  const halfLength = Math.floor(sequence.length / 2);
  const recentSequence = sequence.slice(-halfLength);
  const recentTCount = recentSequence.filter(v => v === "T").length;
  const recentTRatio = recentTCount / recentSequence.length;
  
  // Điểm cho mỗi giá trị
  let tScore = 0;
  let xScore = 0;
  
  // Trọng số cho giá trị cuối
  if (lastValue === "T") {
    // Nếu giá trị hiện tại là T, điểm cho giá trị tiếp theo
    const streakFactor = Math.min(1, currentStreak / 8); // Streak càng dài, khả năng đổi càng cao
    tScore += weightLastValue * (1 - streakFactor);
    xScore += weightLastValue * streakFactor;
  } else {
    // Nếu giá trị hiện tại là X
    const streakFactor = Math.min(1, currentStreak / 8);
    xScore += weightLastValue * (1 - streakFactor);
    tScore += weightLastValue * streakFactor;
  }
  
  // Trọng số cho giá trị thứ hai
  if (secondLastValue === "T") {
    // Nếu giá trị thứ hai là T, ảnh hưởng đến giá trị tiếp theo
    tScore += weightSecondLastValue * 0.4;
    xScore += weightSecondLastValue * 0.6;
  } else if (secondLastValue === "X") {
    // Nếu giá trị thứ hai là X
    xScore += weightSecondLastValue * 0.4;
    tScore += weightSecondLastValue * 0.6;
  }
  
  // Trọng số cho tỷ lệ T/X
  const tRatio = tCount / sequence.length;
  tScore += weightTXRatio * tRatio;
  xScore += weightTXRatio * (1 - tRatio);
  
  // Trọng số cho xu hướng
  tScore += weightTrend * recentTRatio;
  xScore += weightTrend * (1 - recentTRatio);
  
  // Dự đoán và độ tin cậy
  const prediction = tScore > xScore ? "T" : "X";
  const confidence = Math.abs(tScore - xScore);
  
  return { prediction, confidence: Math.min(0.95, confidence * 2) };
}

/**
 * Phân tích chuyên nghiệp theo quy luật Kubet
 * Áp dụng các phương pháp phân tích theo quy luật đặc thù của Tài Xỉu 
 * và các kỹ thuật bắt cầu, bẻ cầu chuyên nghiệp
 */
function kubetProfessionalAnalysis(sequence) {
  if (sequence.length < 8) {
    return {
      prediction: null,
      confidence: 0,
      signalStrength: 0,
      breakPointQuality: 0,
      patternType: "Chưa đủ dữ liệu",
      bestStrategy: "Chờ thêm dữ liệu"
    };
  }
  
  // Phân tích cầu và phân đoạn
  const segments = segmentSequence(sequence);
  
  // Phân tích các quy luật đặc thù của Kubet
  
  // 1. Quy luật "bẻ cầu 3" - bẻ cầu sau 3 lần xuất hiện liên tiếp
  let be3Rule = false;
  if (segments.length > 0 && segments[segments.length - 1].count === 3) {
    be3Rule = true;
  }
  
  // 2. Quy luật "8 phiên" - sau 8 phiên, xác suất bẻ cầu tăng cao
  let rule8Sessions = false;
  if (segments.length > 0 && segments[segments.length - 1].count >= 8) {
    rule8Sessions = true;
  }
  
  // 3. Quy luật "Fibonacci" - cầu thường bẻ tại các số Fibonacci (1,2,3,5,8,13,21)
  const fibNumbers = [1, 2, 3, 5, 8, 13, 21];
  let fibonacciRule = false;
  if (segments.length > 0 && fibNumbers.includes(segments[segments.length - 1].count)) {
    fibonacciRule = true;
  }
  
  // 4. Quy luật "Xen kẽ" - phát hiện mẫu TXTXTX hoặc XTXTXT
  let alternatingPattern = false;
  let alternatingScore = 0;
  if (sequence.length >= 6) {
    let alternatingCount = 0;
    for (let i = 1; i < 6; i++) {
      if (sequence[sequence.length-i] !== sequence[sequence.length-i-1]) {
        alternatingCount++;
      }
    }
    alternatingScore = alternatingCount / 5;
    if (alternatingScore > 0.8) {
      alternatingPattern = true;
    }
  }
  
  // 5. Quy luật "Kéo theo" - 2 cầu giống nhau xuất hiện liên tiếp
  let followingPattern = false;
  if (segments.length >= 4) {
    const lastTwoSegments = segments.slice(-2);
    if (lastTwoSegments[0].count === lastTwoSegments[1].count) {
      followingPattern = true;
    }
  }
  
  // 6. Quy luật "Vàng" - tỉ lệ vàng 1.618
  let goldenRatioMatch = false;
  if (segments.length >= 3) {
    const ratios = [];
    for (let i = 1; i < segments.length; i++) {
      ratios.push(segments[i].count / Math.max(1, segments[i-1].count));
    }
    
    // Kiểm tra có tỉ lệ nào gần với 1.618 không
    const goldenRatio = 1.618;
    const closeToGolden = ratios.some(ratio => Math.abs(ratio - goldenRatio) < 0.2);
    if (closeToGolden) {
      goldenRatioMatch = true;
    }
  }
  
  // Tính điểm tín hiệu dựa trên số quy luật khớp
  const rules = [be3Rule, rule8Sessions, fibonacciRule, alternatingPattern, followingPattern, goldenRatioMatch];
  const matchedRules = rules.filter(rule => rule).length;
  const signalStrength = Math.min(0.95, matchedRules / 6 + 0.3);
  
  // Xác định chiến lược tốt nhất
  let bestStrategy = "Theo cầu";
  let prediction = null;
  let confidence = 0.5;
  const currentValue = sequence[sequence.length - 1];
  const oppositeValue = currentValue === "T" ? "X" : "T";
  
  // Đánh giá chất lượng điểm bẻ cầu
  let breakPointQuality = 0;
  
  // Quyết định dự đoán
  if (be3Rule || rule8Sessions || fibonacciRule) {
    // Nếu có các dấu hiệu bẻ cầu mạnh
    prediction = oppositeValue;
    bestStrategy = "Bẻ cầu";
    breakPointQuality = Math.min(0.95, 0.5 + (matchedRules / 6) * 0.5);
    confidence = Math.min(0.9, 0.6 + matchedRules * 0.07);
  } else if (alternatingPattern) {
    // Nếu có mẫu xen kẽ rõ ràng
    prediction = sequence[sequence.length - 1] === sequence[sequence.length - 2] ? oppositeValue : currentValue;
    bestStrategy = "Theo mẫu xen kẽ";
    confidence = 0.5 + alternatingScore * 0.4;
  } else if (followingPattern || goldenRatioMatch) {
    // Nếu có mẫu kéo theo hoặc tỉ lệ vàng
    if (segments.length > 0 && segments[segments.length - 1].count < 2) {
      prediction = currentValue; // Tiếp tục theo cầu nếu cầu mới bắt đầu
      bestStrategy = "Theo cầu ngắn";
      confidence = 0.6;
    } else {
      prediction = matchedRules >= 2 ? oppositeValue : currentValue;
      bestStrategy = matchedRules >= 2 ? "Bẻ cầu" : "Theo cầu";
      confidence = 0.5 + matchedRules * 0.08;
    }
  } else {
    // Không có mẫu rõ ràng, quyết định dựa trên chiều dài cầu hiện tại
    const currentStreakLength = segments.length > 0 ? segments[segments.length - 1].count : 0;
    
    if (currentStreakLength <= 2) {
      prediction = currentValue; // Cầu ngắn thì tiếp tục theo
      bestStrategy = "Theo cầu ngắn";
      confidence = 0.55 + currentStreakLength * 0.05;
    } else if (currentStreakLength >= 6) {
      prediction = oppositeValue; // Cầu dài thì bẻ
      bestStrategy = "Bẻ cầu dài";
      confidence = 0.6 + Math.min(0.3, (currentStreakLength - 5) * 0.05);
    } else {
      // Phân tích thêm dựa trên lịch sử gần đây
      const recentBehavior = analyzeRecentPattern(sequence.slice(-10));
      prediction = recentBehavior.prediction;
      confidence = recentBehavior.confidence;
      bestStrategy = recentBehavior.strategy;
    }
  }
  
  // Xác định loại mẫu
  let patternType = "Không xác định";
  if (be3Rule) patternType = "Quy luật Bẻ 3";
  else if (rule8Sessions) patternType = "Quy luật 8 phiên";
  else if (fibonacciRule) patternType = "Quy luật Fibonacci";
  else if (alternatingPattern) patternType = "Mẫu xen kẽ";
  else if (followingPattern) patternType = "Mẫu kéo theo";
  else if (goldenRatioMatch) patternType = "Tỉ lệ vàng";
  
  return {
    prediction,
    confidence,
    signalStrength,
    breakPointQuality,
    patternType,
    bestStrategy,
    matchedRules,
    totalRules: rules.length,
    detailedRules: {
      be3Rule,
      rule8Sessions,
      fibonacciRule,
      alternatingPattern,
      followingPattern,
      goldenRatioMatch
    }
  };
}

/**
 * Phân tích mẫu gần đây cho Kubet
 */
function analyzeRecentPattern(recentSequence) {
  if (recentSequence.length < 5) {
    return { prediction: null, confidence: 0.5, strategy: "Chờ thêm dữ liệu" };
  }
  
  // Đếm số lần xuất hiện của T và X
  const tCount = recentSequence.filter(v => v === "T").length;
  const xCount = recentSequence.length - tCount;
  
  // Tính tỉ lệ
  const tRatio = tCount / recentSequence.length;
  
  // Xác định xu hướng
  const currentValue = recentSequence[recentSequence.length - 1];
  const oppositeValue = currentValue === "T" ? "X" : "T";
  
  if (Math.abs(tRatio - 0.5) > 0.3) {
    // Có xu hướng rõ rệt
    const dominantValue = tRatio > 0.5 ? "T" : "X";
    const prediction = dominantValue;
    const confidence = 0.5 + Math.abs(tRatio - 0.5) * 0.6;
    return { 
      prediction, 
      confidence, 
      strategy: `Theo xu hướng ${dominantValue === "T" ? "Tài" : "Xỉu"}`
    };
  } else {
    // Khá cân bằng, xem xét chuỗi gần nhất
    const lastThree = recentSequence.slice(-3);
    if (lastThree.every(v => v === lastThree[0])) {
      // 3 giá trị giống nhau liên tiếp, khả năng cao sẽ đổi
      return { 
        prediction: oppositeValue, 
        confidence: 0.65, 
        strategy: "Bẻ cầu sau 3 lần" 
      };
    } else {
      // Không có mẫu rõ ràng
      return { 
        prediction: currentValue, 
        confidence: 0.52, 
        strategy: "Theo cầu hiện tại" 
      };
    }
  }
}

/**
 * Mô phỏng randomization từ nhiễu lượng tử
 */
function quantumNoiseModel(sequence) {
  if (sequence.length < 3) {
    return { prediction: null, confidence: 0, noiseLevel: 1 };
  }
  
  // Tính entropy làm chỉ số nhiễu
  const entropy = calculateSequenceEntropy(sequence);
  
  // Mức độ nhiễu lượng tử (giả lập) - càng cao càng ngẫu nhiên
  const quantumNoiseLevel = entropy;
  
  // Tính tần suất xuất hiện T/X
  const tCount = sequence.filter(v => v === "T").length;
  const tRatio = tCount / sequence.length;
  
  // Yếu tố nhiễu ảnh hưởng đến dự đoán
  let prediction;
  let confidence;
  
  if (quantumNoiseLevel > 0.7) {
    // Nhiễu cao, gần như ngẫu nhiên hoàn toàn
    prediction = Math.random() < 0.5 ? "T" : "X";
    confidence = 0.5 + (Math.random() * 0.1); // 0.5-0.6
  } else {
    // Nhiễu thấp, dùng tỉ lệ T/X để dự đoán
    const randomFactor = Math.random() * 0.2; // 0-0.2
    
    if (tRatio > 0.55) {
      // Thiên về T
      prediction = Math.random() < 0.3 ? "X" : "T";
      confidence = 0.5 + (tRatio - 0.5) + randomFactor;
    } else if (tRatio < 0.45) {
      // Thiên về X
      prediction = Math.random() < 0.3 ? "T" : "X";
      confidence = 0.5 + (0.5 - tRatio) + randomFactor;
    } else {
      // Cân bằng
      prediction = Math.random() < 0.5 ? "T" : "X";
      confidence = 0.5 + randomFactor;
    }
  }
  
  return {
    prediction,
    confidence: Math.min(0.75, confidence), // Giới hạn confidence của mô hình này
    noiseLevel: quantumNoiseLevel
  };
}

/**
 * Mô hình Markov Chain nâng cao cho dự đoán Tài Xỉu và Kubet
 * Sử dụng phương pháp ma trận chuyển trạng thái với trọng số thời gian
 */
function markovChainPrediction(sequence) {
  if (sequence.length < 3) return { prediction: null, confidence: 0 };

  // Xây dựng ma trận chuyển đổi với trọng số thời gian (càng gần hiện tại càng quan trọng)
  const transitions = { T: { T: 0, X: 0 }, X: { T: 0, X: 0 } };
  const weights = { T: { T: 0, X: 0 }, X: { T: 0, X: 0 } };
  
  for (let i = 0; i < sequence.length - 1; i++) {
    const current = sequence[i];
    const next = sequence[i + 1];
    const timeWeight = 1 + (i / sequence.length); // Trọng số thời gian
    transitions[current][next]++;
    weights[current][next] += timeWeight;
  }

  // Tính xác suất chuyển đổi
  const lastValue = sequence[sequence.length - 1];
  const totalTransitions = transitions[lastValue].T + transitions[lastValue].X;
  
  if (totalTransitions === 0) return { prediction: null, confidence: 0 };

  // Tính xác suất có trọng số
  const weightedTProb = weights[lastValue].T / (weights[lastValue].T + weights[lastValue].X);
  const weightedXProb = weights[lastValue].X / (weights[lastValue].T + weights[lastValue].X);
  
  // Tính xác suất thông thường
  const simpleTProb = transitions[lastValue].T / totalTransitions;
  const simpleXProb = transitions[lastValue].X / totalTransitions;
  
  // Kết hợp hai phương pháp (70% trọng số thời gian, 30% đếm thông thường)
  const combinedTProb = weightedTProb * 0.7 + simpleTProb * 0.3;
  const combinedXProb = weightedXProb * 0.7 + simpleXProb * 0.3;
  
  // Phân tích các chuỗi gần đây để điều chỉnh thêm
  let recentCorrectness = 0;
  if (sequence.length >= 6) {
    const recent = sequence.slice(-6);
    for (let i = 0; i < recent.length - 2; i++) {
      const pred = recent[i+1] === recent[i] ? recent[i] : (recent[i] === "T" ? "X" : "T");
      const actual = recent[i+2];
      if (pred === actual) recentCorrectness++;
    }
    recentCorrectness = recentCorrectness / 4; // Chuẩn hóa về 0-1
  }
  
  // Điều chỉnh độ tin cậy dựa trên độ chính xác gần đây
  const confidenceModifier = sequence.length > 10 ? 0.1 + recentCorrectness * 0.2 : 0;
  
  // Tăng độ tin cậy nếu xác suất quá chênh lệch
  const probabilityGap = Math.abs(combinedTProb - combinedXProb);
  const gapBonus = probabilityGap > 0.3 ? probabilityGap * 0.2 : 0;
  
  return {
    prediction: combinedTProb > combinedXProb ? "T" : "X",
    confidence: Math.min(0.95, Math.max(combinedTProb, combinedXProb) + confidenceModifier + gapBonus),
    stateTransitions: transitions,
    recentAccuracy: recentCorrectness,
    timeWeightedProbability: { T: weightedTProb, X: weightedXProb }
  };
}

/**
 * Thuật toán tổng hợp - kết hợp kết quả từ nhiều mô hình
 */
function getUltraPrecisePrediction(sequence) {
  if (sequence.length < 5) {
    return { prediction: null, confidence: 0 };
  }
  
  // Thu thập dự đoán từ các mô hình khác nhau
  const neuralPrediction = neuralNetworkEmulation(sequence);
  const goldenRatioPrediction2 = goldenRatioPrediction(sequence);
  const quantumPrediction = quantumNoiseModel(sequence);
  const cauAnalysis = performEnhancedCauAnalysis(sequence);
  const markovPrediction = markovChainPrediction(sequence);
  
  // Kết hợp dự đoán với trọng số
  const predictions = [
    { 
      model: 'neural', 
      prediction: neuralPrediction.prediction, 
      confidence: neuralPrediction.confidence,
      weight: 0.2
    },
    { 
      model: 'goldenRatio', 
      prediction: goldenRatioPrediction2.prediction, 
      confidence: goldenRatioPrediction2.confidence,
      weight: 0.1
    },
    { 
      model: 'quantum', 
      prediction: quantumPrediction.prediction, 
      confidence: quantumPrediction.confidence,
      weight: 0.05
    },
    {
      model: 'cauAnalysis',
      prediction: cauAnalysis.prediction,
      confidence: cauAnalysis.confidence,
      weight: 0.5
    },
    {
      model: 'markov',
      prediction: markovPrediction.prediction,
      confidence: markovPrediction.confidence,
      weight: 0.15
    }
  ];
  
  // Thống kê dự đoán
  const tVotes = predictions
    .filter(p => p.prediction === "T")
    .reduce((sum, p) => sum + p.confidence * p.weight, 0);
    
  const xVotes = predictions
    .filter(p => p.prediction === "X")
    .reduce((sum, p) => sum + p.confidence * p.weight, 0);
  
  // Quyết định dự đoán cuối cùng
  let finalPrediction = null;
  let finalConfidence = 0;
  
  if (tVotes > xVotes) {
    finalPrediction = "T";
    finalConfidence = Math.min(0.95, 0.5 + ((tVotes - xVotes) / (tVotes + xVotes)) * 0.5);
  } else if (xVotes > tVotes) {
    finalPrediction = "X";
    finalConfidence = Math.min(0.95, 0.5 + ((xVotes - tVotes) / (tVotes + xVotes)) * 0.5);
  }
  
  // Điều chỉnh dựa vào entropy
  const entropy = calculateSequenceEntropy(sequence);
  if (entropy > 0.8) {
    // Chuỗi rất ngẫu nhiên, giảm độ tin cậy
    finalConfidence = Math.max(0.5, finalConfidence * 0.8);
  }
  
  return {
    prediction: finalPrediction,
    confidence: finalConfidence,
    modelDetails: predictions
  };
}

/**
 * Cải tiến thuật toán tổng hợp cho Tài Xỉu và Kubet với hiệu suất lịch sử
 * Áp dụng các kỹ thuật học máy nâng cao và phân tích cầu Tài Xỉu đặc thù
 */
function getEnhancedPrediction(sequence) {
  if (sequence.length < 5) {
    return { prediction: null, confidence: 0 };
  }

  // Thu thập dự đoán từ tất cả mô hình với mô hình nâng cao cho Tài Xỉu
  const models = [
    { name: 'kubet', func: kubetProfessionalAnalysis, weight: 2.0 },
    { name: 'cauAnalysis', func: performEnhancedCauAnalysis, weight: 0.45 },
    { name: 'neural', func: neuralNetworkEmulation, weight: 0.20 },
    { name: 'markov', func: markovChainPrediction, weight: 0.25 },
    { name: 'goldenRatio', func: goldenRatioPrediction, weight: 0.10 }
  ];

  // Phân tích đặc thù theo quy luật cầu Tài Xỉu
  const segments = segmentSequence(sequence);
  const breakpointAnalysis = analyzeEnhancedBreakpoint(sequence, segments);
  
  // Phân tích theo kiểu Kubet (tạm bỏ qua nếu chưa được định nghĩa)
  let kubetAnalysisResult = { signalStrength: 0 };
  if (typeof kubetProfessionalAnalysis === 'function') {
    kubetAnalysisResult = kubetProfessionalAnalysis(sequence);
  }
  
  // Tính toán dynamic weights dựa trên hiệu suất lịch sử
  if (state.historyData.length > 10) {
    const modelPerformance = {};
    const recentHistory = state.historyData.slice(-20); // Chỉ xét 20 kết quả gần nhất
    
    // Đánh giá hiệu suất từng mô hình trong lịch sử
    models.forEach(model => {
      // Đếm tổng số dự đoán đúng với trọng số thời gian (càng gần đây càng quan trọng)
      let weightedCorrect = 0;
      let weightedTotal = 0;
      
      recentHistory.forEach((item, index) => {
        const timeWeight = 0.5 + (index / recentHistory.length) * 0.5; // 0.5 đến 1.0
        
        if (item.prediction && item.prediction.model === model.name) {
          weightedTotal += timeWeight;
          if (item.wasSuccessful) {
            weightedCorrect += timeWeight;
          }
        }
      });
      
      modelPerformance[model.name] = weightedTotal > 0 
        ? weightedCorrect / weightedTotal 
        : model.weight;
    });

    // Normalize weights với bonus cho mô hình hiệu quả nhất
    const bestModel = Object.entries(modelPerformance).reduce(
      (best, [model, perf]) => perf > best.perf ? {model, perf} : best, 
      {model: null, perf: 0}
    );
    
    // Tăng cường mô hình tốt nhất
    if (bestModel.model && bestModel.perf > 0.6) {
      modelPerformance[bestModel.model] *= 1.2; // Bonus 20% cho mô hình tốt nhất
    }
    
    // Chuẩn hóa
    const totalPerformance = Object.values(modelPerformance).reduce((a, b) => a + b, 0);
    models.forEach(model => {
      model.weight = modelPerformance[model.name] / totalPerformance;
    });
  }

  // Điều chỉnh mô hình theo điểm bẻ cầu tối ưu
  if (breakpointAnalysis.optimalBreakPoint) {
    // Tăng trọng số cho phân tích cầu khi đến điểm bẻ cầu tối ưu
    const totalOtherWeights = models.reduce((sum, model) => 
      model.name !== 'cauAnalysis' ? sum + model.weight : sum, 0);
    
    // Lấy 70% trọng số cho cauAnalysis và 30% cho các mô hình còn lại
    models.find(m => m.name === 'cauAnalysis').weight = 0.7;
    
    // Phân phối lại 30% cho các mô hình còn lại theo tỉ lệ
    models.forEach(model => {
      if (model.name !== 'cauAnalysis') {
        model.weight = (model.weight / totalOtherWeights) * 0.3;
      }
    });
  }

  // Thu thập và kết hợp dự đoán với cơ chế bỏ phiếu nâng cao
  let tScore = 0, xScore = 0;
  const predictions = [];

  models.forEach(model => {
    // Bỏ qua model kubetTrend nếu chưa được định nghĩa
    if (model.name === 'kubetTrend' && typeof kubetTrendAnalysis !== 'function') {
      return;
    }
    
    const result = model.func(sequence);
    if (result && result.prediction) {
      // Điều chỉnh độ tin cậy dựa trên phân tích Kubet khi dùng mô hình đặc biệt
      let adjustedConfidence = result.confidence;
      
      // Kiểm tra xem biến kubetAnalysisResult có tồn tại không
      if (model.name === 'kubetTrend' && typeof kubetAnalysisResult !== 'undefined' && kubetAnalysisResult.signalStrength > 0.7) {
        adjustedConfidence = Math.min(0.95, adjustedConfidence * 1.2);
      }
      
      // Áp dụng phạt cho dự đoán mâu thuẫn với xu hướng chung
      if (tScore > xScore * 2 && result.prediction === 'X') {
        adjustedConfidence *= 0.8;
      } else if (xScore > tScore * 2 && result.prediction === 'T') {
        adjustedConfidence *= 0.8;
      }
      
      predictions.push({
        model: model.name,
        prediction: result.prediction,
        confidence: adjustedConfidence,
        weight: model.weight
      });

      if (result.prediction === 'T') {
        tScore += adjustedConfidence * model.weight;
      } else {
        xScore += adjustedConfidence * model.weight;
      }
    }
  });

  // Quyết định dự đoán cuối cùng
  const finalPrediction = tScore > xScore ? 'T' : 'X';
  const confidenceDiff = Math.abs(tScore - xScore);
  const baseConfidence = Math.max(tScore, xScore);
  
  // Điều chỉnh confidence dựa trên entropy và độ đồng thuận
  const entropy = calculateSequenceEntropy(sequence);
  const consensus = predictions.filter(p => p.prediction === finalPrediction).length / predictions.length;
  
  const adjustedConfidence = baseConfidence * 
    (1 - entropy * 0.3) * 
    (0.7 + consensus * 0.3);

  return {
    prediction: finalPrediction,
    confidence: Math.min(0.95, adjustedConfidence),
    modelDetails: predictions
  };
}

/**
 * Phân tích theo khung thời gian
 */
function analyzeTimePatterns(sequence, timestamps) {
  if (!timestamps || timestamps.length !== sequence.length) {
    return { timeInsights: null };
  }

  const hourlyPatterns = {};
  const dailyPatterns = {};
  
  // Phân tích theo giờ và ngày
  for (let i = 0; i < sequence.length; i++) {
    const date = new Date(timestamps[i]);
    const hour = date.getHours();
    const day = date.getDay();
    
    if (!hourlyPatterns[hour]) {
      hourlyPatterns[hour] = { T: 0, X: 0 };
    }
    hourlyPatterns[hour][sequence[i]]++;
    
    if (!dailyPatterns[day]) {
      dailyPatterns[day] = { T: 0, X: 0 };
    }
    dailyPatterns[day][sequence[i]]++;
  }

  return { hourlyPatterns, dailyPatterns };
}

// -------------- UI FUNCTIONS --------------

// Format percentage
function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

// Update prediction display
function updatePredictionDisplay() {
  const predictionValue = document.getElementById('prediction-value');
  const confidenceValue = document.getElementById('confidence-value');
  const confidenceBar = document.getElementById('confidence-bar');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  // Hide loading indicator
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
  
  if (!state.prediction || state.prediction.prediction === null) {
    predictionValue.textContent = '--';
    predictionValue.className = 'prediction-result';
    confidenceValue.textContent = '--';
    confidenceBar.style.width = '0%';
    return;
  }
  
  predictionValue.textContent = state.prediction.prediction === 'T' ? 'TÀI' : 'XỈU';
  
  // Apply class for color styling
  predictionValue.className = 'prediction-result ' + (state.prediction.prediction === 'T' ? 'tai' : 'xiu');
  
  confidenceValue.textContent = formatPercent(state.prediction.confidence);
  confidenceBar.style.width = formatPercent(state.prediction.confidence);
}

// Update sequence display
function updateSequenceDisplay() {
  const display = document.getElementById('sequence-display');
  display.innerHTML = '';
  
  state.sequence.forEach(value => {
    const item = document.createElement('div');
    item.className = `sequence-item ${value}`;
    item.textContent = value;
    display.appendChild(item);
  });
}

/**
 * Cập nhật giao diện phân tích Kubet
 * Hiển thị kết quả phân tích quy luật đặc thù Kubet
 */
function updateKubetAnalysis() {
  // Lấy các phần tử cần cập nhật
  const kubetPrediction = document.getElementById('kubet-prediction');
  const kubetConfidence = document.getElementById('kubet-confidence');
  const kubetSignalFill = document.getElementById('kubet-signal-fill');
  const kubetStrategy = document.getElementById('kubet-strategy');
  const kubetExplanation = document.getElementById('kubet-explanation');
  
  // Các quy luật Kubet
  const ruleBe3 = document.getElementById('rule-be3');
  const rule8Sessions = document.getElementById('rule-8sessions');
  const ruleFibonacci = document.getElementById('rule-fibonacci');
  const ruleAlternating = document.getElementById('rule-alternating');
  const ruleFollowing = document.getElementById('rule-following');
  const ruleGolden = document.getElementById('rule-golden');
  
  // Kiểm tra đủ dữ liệu
  if (!state.kubetAnalysis || state.sequence.length < 8) {
    kubetPrediction.textContent = "--";
    kubetConfidence.textContent = "--";
    kubetSignalFill.style.width = "0%";
    kubetStrategy.textContent = "Chờ thêm dữ liệu (cần ít nhất 8 kết quả)";
    kubetExplanation.textContent = "Chưa có đủ dữ liệu để phân tích cầu Kubet. Nhập ít nhất 8 kết quả để kích hoạt phân tích chuyên sâu.";
    
    // Reset tất cả các quy luật
    ruleBe3.classList.remove('active');
    rule8Sessions.classList.remove('active');
    ruleFibonacci.classList.remove('active');
    ruleAlternating.classList.remove('active');
    ruleFollowing.classList.remove('active');
    ruleGolden.classList.remove('active');
    
    // Cập nhật trạng thái
    ruleBe3.querySelector('.rule-status').textContent = "Không kích hoạt";
    rule8Sessions.querySelector('.rule-status').textContent = "Không kích hoạt";
    ruleFibonacci.querySelector('.rule-status').textContent = "Không kích hoạt";
    ruleAlternating.querySelector('.rule-status').textContent = "Không kích hoạt";
    ruleFollowing.querySelector('.rule-status').textContent = "Không kích hoạt";
    ruleGolden.querySelector('.rule-status').textContent = "Không kích hoạt";
    
    return;
  }
  
  // Cập nhật dự đoán
  if (state.kubetAnalysis.prediction) {
    kubetPrediction.textContent = state.kubetAnalysis.prediction;
    kubetPrediction.className = 'signal-prediction';
    kubetPrediction.classList.add(state.kubetAnalysis.prediction === 'T' ? 'tai' : 'xiu');
  } else {
    kubetPrediction.textContent = "--";
    kubetPrediction.className = 'signal-prediction';
  }
  
  // Cập nhật độ tin cậy
  const confidencePercent = Math.round(state.kubetAnalysis.confidence * 100);
  kubetConfidence.textContent = confidencePercent + "%";
  kubetSignalFill.style.width = confidencePercent + "%";
  
  // Cập nhật chiến lược
  kubetStrategy.textContent = state.kubetAnalysis.bestStrategy || "Đang phân tích";
  
  // Cập nhật giải thích
  let explanationText = `<strong>Loại mẫu:</strong> ${state.kubetAnalysis.patternType}<br>`;
  explanationText += `<strong>Chiến lược tốt nhất:</strong> ${state.kubetAnalysis.bestStrategy}<br>`;
  explanationText += `<strong>Độ mạnh tín hiệu:</strong> ${Math.round(state.kubetAnalysis.signalStrength * 100)}%<br>`;
  
  if (state.kubetAnalysis.breakPointQuality > 0) {
    explanationText += `<strong>Chất lượng điểm bẻ cầu:</strong> ${Math.round(state.kubetAnalysis.breakPointQuality * 100)}%<br>`;
  }
  
  explanationText += `<strong>Số quy luật phát hiện:</strong> ${state.kubetAnalysis.matchedRules || 0}/${state.kubetAnalysis.totalRules || 6}<br><br>`;
  
  // Thêm phân tích chi tiết
  const segments = segmentSequence(state.sequence);
  if (segments.length > 0) {
    const currentSegment = segments[segments.length - 1];
    explanationText += `<strong>Cầu hiện tại:</strong> ${currentSegment.value === "T" ? "Tài" : "Xỉu"} (${currentSegment.count} lần liên tiếp)<br>`;
  }
  
  kubetExplanation.innerHTML = explanationText;
  
  // Cập nhật trạng thái các quy luật
  if (state.kubetAnalysis.detailedRules) {
    // Quy luật Bẻ 3
    if (state.kubetAnalysis.detailedRules.be3Rule) {
      ruleBe3.classList.add('active');
      ruleBe3.querySelector('.rule-status').textContent = "Kích hoạt";
    } else {
      ruleBe3.classList.remove('active');
      ruleBe3.querySelector('.rule-status').textContent = "Không kích hoạt";
    }
    
    // Quy luật 8 phiên
    if (state.kubetAnalysis.detailedRules.rule8Sessions) {
      rule8Sessions.classList.add('active');
      rule8Sessions.querySelector('.rule-status').textContent = "Kích hoạt";
    } else {
      rule8Sessions.classList.remove('active');
      rule8Sessions.querySelector('.rule-status').textContent = "Không kích hoạt";
    }
    
    // Quy luật Fibonacci
    if (state.kubetAnalysis.detailedRules.fibonacciRule) {
      ruleFibonacci.classList.add('active');
      ruleFibonacci.querySelector('.rule-status').textContent = "Kích hoạt";
    } else {
      ruleFibonacci.classList.remove('active');
      ruleFibonacci.querySelector('.rule-status').textContent = "Không kích hoạt";
    }
    
    // Mẫu xen kẽ
    if (state.kubetAnalysis.detailedRules.alternatingPattern) {
      ruleAlternating.classList.add('active');
      ruleAlternating.querySelector('.rule-status').textContent = "Kích hoạt";
    } else {
      ruleAlternating.classList.remove('active');
      ruleAlternating.querySelector('.rule-status').textContent = "Không kích hoạt";
    }
    
    // Mẫu kéo theo
    if (state.kubetAnalysis.detailedRules.followingPattern) {
      ruleFollowing.classList.add('active');
      ruleFollowing.querySelector('.rule-status').textContent = "Kích hoạt";
    } else {
      ruleFollowing.classList.remove('active');
      ruleFollowing.querySelector('.rule-status').textContent = "Không kích hoạt";
    }
    
    // Tỉ lệ vàng
    if (state.kubetAnalysis.detailedRules.goldenRatioMatch) {
      ruleGolden.classList.add('active');
      ruleGolden.querySelector('.rule-status').textContent = "Kích hoạt";
    } else {
      ruleGolden.classList.remove('active');
      ruleGolden.querySelector('.rule-status').textContent = "Không kích hoạt";
    }
  }
}

// Update stats display
function updateStats() {
  const total = state.sequence.length;
  const taiCount = state.sequence.filter(v => v === 'T').length;
  const xiuCount = state.sequence.filter(v => v === 'X').length;
  
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-tai-count').textContent = taiCount;
  document.getElementById('stat-xiu-count').textContent = xiuCount;
  
  if (total > 0) {
    document.getElementById('stat-tai-ratio').textContent = formatPercent(taiCount / total);
    document.getElementById('stat-xiu-ratio').textContent = formatPercent(xiuCount / total);
    
    // Calculate current streak
    let currentStreak = 1;
    const lastValue = state.sequence[state.sequence.length - 1];
    for (let i = state.sequence.length - 2; i >= 0; i--) {
      if (state.sequence[i] === lastValue) {
        currentStreak++;
      } else {
        break;
      }
    }
    document.getElementById('stat-current-streak').textContent = currentStreak;
    
    // Calculate longest streak
    const segments = segmentSequence(state.sequence);
    const longestStreak = segments.reduce((max, segment) => Math.max(max, segment.count), 0);
    document.getElementById('stat-longest-streak').textContent = longestStreak;
    
    // Calculate prediction accuracy if we have history
    if (state.historyData.length > 0) {
      const predictionsWithResult = state.historyData.filter(item => 
        item.prediction && item.prediction.prediction !== null
      );
      
      if (predictionsWithResult.length > 0) {
        const successfulPredictions = predictionsWithResult.filter(item => item.wasSuccessful).length;
        const accuracy = successfulPredictions / predictionsWithResult.length;
        document.getElementById('stat-accuracy').textContent = formatPercent(accuracy);
      } else {
        document.getElementById('stat-accuracy').textContent = '--';
      }
    } else {
      document.getElementById('stat-accuracy').textContent = '--';
    }
    
    // Kiểm tra tính ngẫu nhiên nếu có đủ dữ liệu
    if (total >= 10) {
      const randomnessAnalysis = advancedRandomnessTests(state.sequence);
      
      // Cập nhật thông tin về tính ngẫu nhiên nếu có phần tử UI tương ứng
      const randomnessElement = document.getElementById('randomness-analysis');
      if (randomnessElement) {
        let randomnessClass = randomnessAnalysis.isRandom ? 'text-success' : 'text-danger';
        
        randomnessElement.innerHTML = `
          <div class="mb-4"><strong>Tính ngẫu nhiên:</strong> 
            <span class="${randomnessClass}">
              ${randomnessAnalysis.isRandom ? 'Ngẫu nhiên' : 'Không ngẫu nhiên'}
            </span>
            (${formatPercent(randomnessAnalysis.confidence)} độ tin cậy)
          </div>
          <div class="mb-4"><strong>Phân tích:</strong> ${randomnessAnalysis.analysis}</div>
          <div><strong>Z-score:</strong> ${randomnessAnalysis.zScore.toFixed(2)}</div>
        `;
      }
      
      // Cập nhật biểu đồ phân phối cặp nếu có
      // (phần này sẽ được triển khai trong phiên bản tương lai với thư viện biểu đồ)
    }
  } else {
    document.getElementById('stat-tai-ratio').textContent = '--';
    document.getElementById('stat-xiu-ratio').textContent = '--';
    document.getElementById('stat-current-streak').textContent = '0';
    document.getElementById('stat-longest-streak').textContent = '0';
    document.getElementById('stat-accuracy').textContent = '--';
    
    // Xóa phân tích tính ngẫu nhiên nếu không có dữ liệu
    const randomnessElement = document.getElementById('randomness-analysis');
    if (randomnessElement) {
      randomnessElement.innerHTML = 'Chưa có đủ dữ liệu để phân tích tính ngẫu nhiên.';
    }
  }
}

// Update cau analysis display
function updateCauAnalysis() {
  const cauDetails = document.getElementById('cau-details');
  const breakpointDetails = document.getElementById('breakpoint-details');
  
  if (state.sequence.length < 3) {
    cauDetails.textContent = 'Chưa có đủ dữ liệu để phân tích cầu.';
    breakpointDetails.textContent = 'Chưa có đủ dữ liệu để phân tích bẻ cầu.';
    return;
  }
  
  const analysisResult = performEnhancedCauAnalysis(state.sequence);
  
  // Update cau details
  cauDetails.innerHTML = `
    <div class="mb-4"><strong>Loại mẫu:</strong> ${analysisResult.patternType}</div>
    <div class="mb-4"><strong>Chiều dài cầu hiện tại:</strong> ${analysisResult.streakLength}</div>
    <div class="mb-4"><strong>Xu hướng:</strong> ${
      analysisResult.patternTrend === 'stable' ? 'Ổn định' : 
      analysisResult.patternTrend === 'unstable' ? 'Không ổn định' : 
      analysisResult.patternTrend === 'transitioning' ? 'Đang chuyển đổi' : 'Mới hình thành'
    }</div>
    <div><strong>Mẫu đã phát hiện:</strong> ${
      analysisResult.patterns.detectedPatterns.length > 0 
        ? analysisResult.patterns.detectedPatterns.join(', ') 
        : 'Chưa phát hiện mẫu rõ ràng'
    }</div>
  `;
  
  // Update breakpoint details
  breakpointDetails.innerHTML = `
    <div class="mb-4"><strong>Xác suất bẻ cầu:</strong> <span style="color: var(--primary); font-weight: 600;">${formatPercent(analysisResult.breakProbability)}</span></div>
    <div class="mb-4"><strong>Độ mạnh bẻ cầu:</strong> ${formatPercent(analysisResult.detailedAnalysis.breakStrength)}</div>
    <div class="mb-4"><strong>Điểm bẻ cầu tối ưu:</strong> ${
      analysisResult.detailedAnalysis.optimalBreakPoint 
        ? '<span style="color: var(--primary); font-weight: 600;">Có</span>' 
        : 'Không'
    }</div>
    <div class="mb-4"><strong>Giá trị chiếm ưu thế:</strong> ${
      analysisResult.detailedAnalysis.dominantValue === 'T' ? 'Tài' : 
      analysisResult.detailedAnalysis.dominantValue === 'X' ? 'Xỉu' : 'Không có'
    }</div>
    <div><strong>Độ phù hợp Fibonacci:</strong> ${formatPercent(analysisResult.detailedAnalysis.fibonacciAlignment)}</div>
  `;
}

// Update pattern analysis
function updatePatternAnalysis() {
  const patternDescription = document.getElementById('pattern-description');
  const recommendationText = document.getElementById('recommendation-text');
  
  if (state.sequence.length < 5) {
    patternDescription.textContent = 'Chưa có đủ dữ liệu để phân tích mẫu. Cần ít nhất 5 kết quả.';
    recommendationText.textContent = 'Chưa có đủ dữ liệu để đưa ra khuyến nghị.';
    return;
  }
  
  const segments = segmentSequence(state.sequence);
  const patternAnalysis = detectAdvancedCauPattern(state.sequence, segments);
  
  // Pattern description
  let description = `<div class="mb-4"><strong>Mẫu chính:</strong> ${patternAnalysis.patternType}</div>`;
  
  if (patternAnalysis.detectedPatterns.length > 0) {
    description += `<div class="mb-4"><strong>Các mẫu phát hiện:</strong></div><ul style="list-style: none; padding-left: 0.5rem;">`;
    patternAnalysis.detectedPatterns.forEach(pattern => {
      const score = patternAnalysis.patternScores[pattern];
      description += `<li class="mb-1">• ${pattern} <span style="font-weight: 600;">(độ mạnh: ${formatPercent(score)})</span></li>`;
    });
    description += '</ul>';
  }
  
  // Additional statistics
  const tCount = state.sequence.filter(v => v === 'T').length;
  const xCount = state.sequence.filter(v => v === 'X').length;
  const tRatio = tCount / state.sequence.length;
  
  description += `
    <div class="mb-4 mt-3"><strong>Tỷ lệ Tài/Xỉu:</strong> ${formatPercent(tRatio)} / ${formatPercent(1-tRatio)}</div>
    <div><strong>Độ trưởng thành của mẫu:</strong> ${formatPercent(patternAnalysis.maturity)}</div>
  `;
  
  patternDescription.innerHTML = description;
  
  // Recommendation
  let recommendation = '';
  
  if (patternAnalysis.patternType === 'Cầu dài') {
    recommendation = `Cầu đang chạy tương đối dài. <strong>Cân nhắc việc bẻ cầu</strong> khi đạt đến số Fibonacci tiếp theo (3, 5, 8, 13).`;
  } else if (patternAnalysis.patternType === 'Xen kẽ') {
    recommendation = `Mẫu xen kẽ rõ ràng. <strong>Nên đặt ngược với kết quả gần nhất</strong>.`;
  } else if (patternAnalysis.patternType === 'Tuần hoàn') {
    recommendation = `Mẫu tuần hoàn đang xuất hiện. <strong>Dự đoán dựa trên chu kỳ đã phát hiện</strong>.`;
  } else if (patternAnalysis.patternType === 'Thiên Tài') {
    recommendation = `Chuỗi đang thiên về Tài. <strong>Nên đặt theo Tài</strong> nhưng chú ý các dấu hiệu bẻ cầu.`;
  } else if (patternAnalysis.patternType === 'Thiên Xỉu') {
    recommendation = `Chuỗi đang thiên về Xỉu. <strong>Nên đặt theo Xỉu</strong> nhưng chú ý các dấu hiệu bẻ cầu.`;
  } else if (patternAnalysis.patternType === 'Cân bằng') {
    recommendation = `Chuỗi khá cân bằng giữa Tài và Xỉu. <strong>Nên tập trung vào việc phát hiện các mẫu ngắn</strong>.`;
  } else {
    recommendation = `Chưa phát hiện mẫu rõ ràng. <strong>Dựa vào thuật toán dự đoán chính</strong> và cẩn thận với việc đặt cược.`;
  }
  
  recommendationText.innerHTML = recommendation;
}

// Analyze the sequence
function analyzeSequence() {
  if (state.sequence.length < 3) {
    state.prediction = { prediction: null, confidence: 0 };
    updatePredictionDisplay();
    return;
  }

  state.analyzing = true;
  
  // Show loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'inline-block';
  }
  
  // Phân tích Kubet
  try {
    const kubetAnalysis = kubetProfessionalAnalysis(state.sequence);
    state.kubetAnalysis = kubetAnalysis;
  } catch (e) {
    console.error("Lỗi khi phân tích Kubet:", e);
    state.kubetAnalysis = { 
      prediction: null,
      confidence: 0,
      signalStrength: 0,
      patternType: "Chưa xác định",
      bestStrategy: "Đang phân tích"
    };
  }
  
  // Simulate a slight delay for analysis
  setTimeout(() => {
    try {
      // Sử dụng mô hình học máy động để dự đoán
      const modelWeights = state.predictionModel.getWeights();
      
      // Tạo một đối tượng để theo dõi kết quả từ từng mô hình
      const modelResults = {
        cauAnalysis: performEnhancedCauAnalysis(state.sequence),
        neural: neuralNetworkEmulation(state.sequence),
        markov: markovChainPrediction(state.sequence),
        goldenRatio: goldenRatioPrediction(state.sequence)
      };
      
      // Tính điểm cho mỗi lựa chọn (T/X) dựa trên trọng số động
      let tScore = 0, xScore = 0;
      const modelPredictions = [];
      
      for (const [model, result] of Object.entries(modelResults)) {
        if (result.prediction) {
          const weight = modelWeights[model] || 0.1; // Giá trị mặc định nếu không có trọng số
          
          modelPredictions.push({
            model,
            prediction: result.prediction,
            confidence: result.confidence,
            weight
          });
          
          if (result.prediction === 'T') {
            tScore += result.confidence * weight;
          } else if (result.prediction === 'X') {
            xScore += result.confidence * weight;
          }
        }
      }
      
      // Quyết định dự đoán cuối cùng
      let finalPrediction = null;
      let finalConfidence = 0;
      let winningModel = null;
      
      if (tScore > xScore) {
        finalPrediction = "T";
        finalConfidence = Math.min(0.95, 0.5 + ((tScore - xScore) / Math.max(0.1, tScore + xScore)) * 0.5);
        // Tìm mô hình có đóng góp lớn nhất cho dự đoán T
        winningModel = Object.entries(modelResults)
          .filter(([_, result]) => result.prediction === 'T')
          .sort(([a, resultA], [b, resultB]) => 
            (resultB.confidence * modelWeights[b]) - (resultA.confidence * modelWeights[a])
          )[0]?.[0];
      } else if (xScore > tScore) {
        finalPrediction = "X";
        finalConfidence = Math.min(0.95, 0.5 + ((xScore - tScore) / Math.max(0.1, tScore + xScore)) * 0.5);
        // Tìm mô hình có đóng góp lớn nhất cho dự đoán X
        winningModel = Object.entries(modelResults)
          .filter(([_, result]) => result.prediction === 'X')
          .sort(([a, resultA], [b, resultB]) => 
            (resultB.confidence * modelWeights[b]) - (resultA.confidence * modelWeights[a])
          )[0]?.[0];
      }
      
      // Điều chỉnh dựa vào entropy
      const entropy = calculateSequenceEntropy(state.sequence);
      if (entropy > 0.8) {
        // Chuỗi rất ngẫu nhiên, giảm độ tin cậy
        finalConfidence = Math.max(0.5, finalConfidence * 0.8);
      }
      
      // Lưu kết quả vào state
      state.prediction = {
        prediction: finalPrediction,
        confidence: finalConfidence,
        model: winningModel,
        modelPredictions
      };
      
      // Update displays
      updatePredictionDisplay();
      updateCauAnalysis();
      updatePatternAnalysis();
    } catch (error) {
      console.error("Error analyzing sequence:", error);
      state.prediction = { prediction: null, confidence: 0 };
      updatePredictionDisplay();
    } finally {
      state.analyzing = false;
      
      // Cập nhật giao diện
      updatePredictionDisplay();
      updateStats();
      updateCauAnalysis();
      updatePatternAnalysis();
      updateKubetAnalysis();
    }
  }, 500);
}

// Add a value to the sequence
function addToSequence(value) {
  state.sequence.push(value);
  
  // Khởi tạo state.kubetAnalysis nếu chưa có
  if (!state.kubetAnalysis) {
    state.kubetAnalysis = {
      prediction: null,
      confidence: 0,
      signalStrength: 0,
      patternType: "Chưa xác định",
      bestStrategy: "Đang phân tích",
      detailedRules: {
        be3Rule: false,
        rule8Sessions: false,
        fibonacciRule: false,
        alternatingPattern: false,
        followingPattern: false,
        goldenRatioMatch: false
      }
    };
  }
  
  // Update history with new entry
  const wasBreakAttempt = state.prediction !== null && 
    state.prediction.prediction !== null && 
    state.prediction.prediction !== value;
  
  const wasSuccessful = state.prediction !== null && 
    state.prediction.prediction !== null && 
    state.prediction.prediction === value;
  
  // Cập nhật trọng số mô hình nếu có dự đoán thành công
  if (wasSuccessful && state.prediction && state.prediction.model) {
    // Cập nhật trọng số của mô hình đã dự đoán đúng
    state.predictionModel.updateWeights(state.prediction.model);
    
    console.log("Mô hình dự đoán thành công:", state.prediction.model);
    console.log("Trọng số mới:", state.predictionModel.getWeights());
  }
  
  const historyItem = {
    timestamp: new Date(),
    sequence: [...state.sequence],
    prediction: state.prediction || { prediction: null, confidence: 0 },
    wasBreakAttempt,
    wasSuccessful
  };
  
  state.historyData.push(historyItem);
  
  // Update UI
  updateSequenceDisplay();
  updateStats();
  
  // Automatically analyze after adding to sequence
  analyzeSequence();
  
  // Save to localStorage
  saveToLocalStorage();
}

// Delete the last result
function deleteLastResult() {
  if (state.sequence.length > 0) {
    state.sequence.pop();
    state.historyData.pop();
    
    // Update UI
    updateSequenceDisplay();
    updateStats();
    
    // Re-analyze
    analyzeSequence();
    
    // Save to localStorage
    saveToLocalStorage();
  }
}

// Clear all results
function clearAllResults() {
  state.sequence = [];
  state.historyData = [];
  state.prediction = null;
  
  // Update UI
  updateSequenceDisplay();
  updateStats();
  updatePredictionDisplay();
  updateCauAnalysis();
  updatePatternAnalysis();
  
  // Save to localStorage
  saveToLocalStorage();
}

// Toggle chart modal
function toggleChartModal() {
  state.showChartModal = !state.showChartModal;
  const modal = document.getElementById('chart-modal');
  
  if (state.showChartModal) {
    modal.classList.add('show');
  } else {
    modal.classList.remove('show');
  }
}

// Switch tabs
function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Update active tab in UI
  const tabItems = document.querySelectorAll('#analysis-tabs .tab-item');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabItems.forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  tabContents.forEach(content => {
    if (content.id === `tab-${tabId}`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
  
  // If switching to cau analysis, update the display
  if (tabId === 'cauanalysis') {
    updateCauAnalysis();
  } else if (tabId === 'patterns') {
    updatePatternAnalysis();
  }
}

// Switch chart type
function switchChartType(chartType) {
  state.chartType = chartType;
  
  // Update active chart tab in modal
  const chartTabs = document.querySelectorAll('#chart-tabs .tab-item');
  chartTabs.forEach(item => {
    if (item.getAttribute('data-tab') === chartType) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Update chart description
  const chartDetails = document.getElementById('chart-details');
  
  switch (chartType) {
    case 'sequence':
      chartDetails.textContent = 'Biểu đồ chuỗi hiển thị toàn bộ chuỗi kết quả theo thời gian.';
      break;
    case 'markov':
      chartDetails.textContent = 'Biểu đồ Markov hiển thị xác suất chuyển đổi giữa các trạng thái Tài/Xỉu.';
      break;
    case 'pattern':
      chartDetails.textContent = 'Biểu đồ mẫu hiển thị các mẫu lặp lại đã phát hiện trong chuỗi.';
      break;
    case 'distribution':
      chartDetails.textContent = 'Biểu đồ phân phối hiển thị tỷ lệ xuất hiện của Tài/Xỉu.';
      break;
    case 'heatmap':
      chartDetails.textContent = 'Biểu đồ heatmap hiển thị mật độ xuất hiện của các kết quả theo thời gian.';
      break;
    default:
      chartDetails.textContent = 'Chọn biểu đồ để xem chi tiết phân tích.';
  }
}

// Save to localStorage
function saveToLocalStorage() {
  try {
    const dataToSave = {
      sequence: state.sequence,
      historyData: state.historyData,
      predictionModel: {
        weights: state.predictionModel.weights,
        performanceHistory: state.predictionModel.performanceHistory
      }
    };
    localStorage.setItem('taixiuPredictionData', JSON.stringify(dataToSave));
    console.log("Đã lưu dữ liệu và mô hình vào localStorage");
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

// Load from localStorage
function loadFromLocalStorage() {
  try {
    console.log("Đang tải dữ liệu từ localStorage...");
    const savedData = localStorage.getItem('taixiuPredictionData');
    
    if (!savedData) {
      console.log("Không tìm thấy dữ liệu trong localStorage");
      return;
    }
    
    const parsedData = JSON.parse(savedData);
    
    // Restore dates from strings
    const historyWithDates = parsedData.historyData.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
    
    state.sequence = parsedData.sequence;
    state.historyData = historyWithDates;
    
    // Phục hồi mô hình dự đoán nếu có
    if (parsedData.predictionModel) {
      if (parsedData.predictionModel.weights) {
        state.predictionModel.weights = parsedData.predictionModel.weights;
      }
      
      if (parsedData.predictionModel.performanceHistory) {
        state.predictionModel.performanceHistory = parsedData.predictionModel.performanceHistory;
      }
      
      console.log("Đã phục hồi mô hình dự đoán với trọng số:", state.predictionModel.weights);
    }
    
    // Update UI
    updateSequenceDisplay();
    updateStats();
    
    // Re-analyze the loaded sequence
    analyzeSequence();
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

// Initialize the app
function initApp() {
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Attach event listeners
  document.getElementById('tai-btn').addEventListener('click', () => addToSequence('T'));
  document.getElementById('xiu-btn').addEventListener('click', () => addToSequence('X'));
  document.getElementById('delete-last').addEventListener('click', deleteLastResult);
  document.getElementById('clear-all').addEventListener('click', clearAllResults);
  document.getElementById('show-chart-modal').addEventListener('click', toggleChartModal);
  document.getElementById('close-modal').addEventListener('click', toggleChartModal);
  
  // Tab switching
  document.querySelectorAll('#analysis-tabs .tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.getAttribute('data-tab'));
    });
  });
  
  // Chart type switching
  document.querySelectorAll('#chart-tabs .tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      switchChartType(tab.getAttribute('data-tab'));
    });
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 't' || e.key === 'T') {
      addToSequence('T');
    } else if (e.key === 'x' || e.key === 'X') {
      addToSequence('X');
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      deleteLastResult();
    } else if (e.key === 'Escape') {
      if (state.showChartModal) {
        toggleChartModal();
      }
    }
  });
  
  // Add click event to close modal when clicking outside
  const modal = document.getElementById('chart-modal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      toggleChartModal();
    }
  });
  
  // Load saved data
  loadFromLocalStorage();
}

// Initialize when the page is loaded
document.addEventListener('DOMContentLoaded', initApp);