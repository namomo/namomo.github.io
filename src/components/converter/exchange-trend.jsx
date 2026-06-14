import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Tabs, 
  Tab, 
  Chip, 
  Skeleton, 
  useTheme,
  Grid,
  Divider
} from '@mui/material';
import { TrendingUp, TrendingDown, Info, Calendar } from 'lucide-react';
import useUnitStore from '../../stores/unit-store';
import { AVAILABLE_CURRENCIES } from '../../constants/currencies';

const ExchangeTrend = () => {
  const theme = useTheme();
  const {
    trendBaseCurrency,
    trendTargetCurrency,
    setTrendBaseCurrency,
    setTrendTargetCurrency,
    historicalRates,
    historicalStartDate,
    historicalEndDate,
    isHistoricalLoading,
    loadHistoricalRates
  } = useUnitStore();

  const svgRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(-1);

  // Load historical rates when trend base changes
  useEffect(() => {
    loadHistoricalRates();
  }, [trendBaseCurrency, loadHistoricalRates]);

  // Available base currencies in trend chart (major ones)
  const baseOptions = ['KRW', 'USD', 'JPY', 'EUR'];
  
  // Target currencies are major currencies excluding the current base currency
  const targetOptions = ['USD', 'JPY', 'EUR', 'KRW'].filter(c => c !== trendBaseCurrency);

  // If the target currency was changed to the same as base currency, reset to first available
  useEffect(() => {
    if (trendBaseCurrency === trendTargetCurrency) {
      setTrendTargetCurrency(targetOptions[0]);
    }
  }, [trendBaseCurrency, trendTargetCurrency, targetOptions, setTrendTargetCurrency]);

  const handleBaseChange = (event, newBase) => {
    if (newBase) {
      setTrendBaseCurrency(newBase);
    }
  };

  const handleTargetChange = (targetCode) => {
    setTrendTargetCurrency(targetCode);
  };

  // Process historical data
  const sortedDates = Object.keys(historicalRates).sort();
  const dataPoints = sortedDates.map(date => {
    const ratesForDate = historicalRates[date];
    let rateVal = ratesForDate[trendTargetCurrency];
    
    // API provides JPY relative to base.
    // If base is USD, target JPY rate is e.g. 158.55.
    // If target is JPY, we display value directly.
    return {
      date,
      formattedDate: date.substring(5).replace('-', '/'), // "05-15" -> "05/12"
      value: rateVal
    };
  }).filter(dp => dp.value !== undefined);

  // Y-Axis details
  const values = dataPoints.map(d => d.value);
  const maxVal = values.length > 0 ? Math.max(...values) : 0;
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const currentVal = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].value : 0;
  
  const valRange = maxVal - minVal;
  const margin = valRange === 0 ? (maxVal * 0.05 || 1) : valRange * 0.15;
  const yMin = minVal - margin;
  const yMax = maxVal + margin;

  // Chart boundaries
  const svgWidth = 500;
  const svgHeight = 200;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (index) => {
    if (dataPoints.length <= 1) return paddingLeft;
    return paddingLeft + (index / (dataPoints.length - 1)) * chartWidth;
  };

  const getY = (val) => {
    if (yMax === yMin) return paddingTop + chartHeight / 2;
    return paddingTop + chartHeight - ((val - yMin) / (yMax - yMin)) * chartHeight;
  };

  // Generate SVG Path
  let linePath = '';
  let areaPath = '';
  if (dataPoints.length > 1) {
    const coords = dataPoints.map((dp, i) => ({ x: getX(i), y: getY(dp.value) }));
    linePath = `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map(c => `L ${c.x} ${c.y}`).join(' ');
    areaPath = `${linePath} L ${coords[coords.length - 1].x} ${paddingTop + chartHeight} L ${coords[0].x} ${paddingTop + chartHeight} Z`;
  }

  // Hover detection
  const handleMouseMove = (e) => {
    if (!svgRef.current || dataPoints.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
    
    const fraction = (mouseX - paddingLeft) / chartWidth;
    let idx = Math.round(fraction * (dataPoints.length - 1));
    idx = Math.max(0, Math.min(dataPoints.length - 1, idx));
    
    setHoveredIdx(idx);
    setHoveredPoint(dataPoints[idx]);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setHoveredIdx(-1);
  };

  // Determine trend percentage
  const initialVal = values.length > 0 ? values[0] : 0;
  const rateDiff = currentVal - initialVal;
  const rateChangePercent = initialVal !== 0 ? (rateDiff / initialVal) * 100 : 0;
  const isUp = rateDiff >= 0;

  // Format currency representation
  const formatRate = (rate) => {
    if (rate === undefined || rate === null) return '-';
    // Small numbers (like EUR->JPY 0.006) should show more decimals
    if (rate < 1) return rate.toFixed(4);
    if (rate < 100) return rate.toFixed(2);
    return rate.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  };

  const baseSymbol = AVAILABLE_CURRENCIES.find(c => c.code === trendBaseCurrency)?.symbol || '';
  const targetSymbol = AVAILABLE_CURRENCIES.find(c => c.code === trendTargetCurrency)?.symbol || '';

  return (
    <Card 
      elevation={0}
      sx={{ 
        p: 3, 
        mt: 3, 
        borderRadius: '24px', 
        bgcolor: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
        width: '100%',
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp size={20} color={theme.palette.primary.main} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
            환율 변동 트렌드 (30일)
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f1f3f5', px: 1.5, py: 0.5, borderRadius: '12px' }}>
          <Calendar size={12} />
          {historicalStartDate ? `${historicalStartDate.replace(/-/g, '.')} ~ ${historicalEndDate.replace(/-/g, '.')}` : '데이터 조회 중'}
        </Typography>
      </Box>

      {/* Base Currency Selection */}
      <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 60 }}>
          기준 통화
        </Typography>
        <Tabs 
          value={trendBaseCurrency} 
          onChange={handleBaseChange} 
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: '36px',
            '& .MuiTab-root': {
              minHeight: '36px',
              py: 0.5,
              px: 2,
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: '12px',
              transition: 'all 0.2s',
              '&.Mui-selected': {
                color: 'primary.main',
                bgcolor: 'rgba(103, 58, 183, 0.06)'
              }
            },
            '& .MuiTabs-indicator': {
              display: 'none'
            }
          }}
        >
          {baseOptions.map(code => (
            <Tab key={code} label={code} value={code} />
          ))}
        </Tabs>
      </Box>

      {/* Target Currency Selection */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 60 }}>
          비교 대상
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {targetOptions.map(code => {
            const isSelected = trendTargetCurrency === code;
            return (
              <Chip 
                key={code}
                label={code}
                onClick={() => handleTargetChange(code)}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{ 
                  fontWeight: 700, 
                  px: 0.5, 
                  borderRadius: '12px',
                  border: isSelected ? 'none' : '1px solid rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              />
            );
          })}
        </Box>
      </Box>

      <Divider sx={{ mb: 2, opacity: 0.5 }} />

      {/* Rate Details Summary Panel */}
      {isHistoricalLoading ? (
        <Skeleton variant="rectangular" height={52} sx={{ borderRadius: '16px', mb: 3 }} />
      ) : (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2, 
            mb: 3, 
            borderRadius: '16px', 
            bgcolor: '#fcfcfd',
            border: '1px solid rgba(0,0,0,0.03)'
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>현재 환율</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="body1" component="span" sx={{ fontWeight: 700, color: 'text.secondary' }}>1 {trendBaseCurrency} =</Typography>
              {formatRate(currentVal)}
              <Typography variant="body2" component="span" sx={{ fontWeight: 700, color: 'text.secondary', ml: 0.5 }}>{trendTargetCurrency}</Typography>
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>30일 추이</Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5, 
                color: isUp ? 'success.main' : 'error.main',
                bgcolor: isUp ? 'rgba(46, 125, 50, 0.06)' : 'rgba(211, 47, 47, 0.06)',
                px: 1.5,
                py: 0.5,
                borderRadius: '20px',
                fontWeight: 700,
                fontSize: '0.85rem',
                mt: 0.5
              }}
            >
              {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {isUp ? '+' : ''}{rateChangePercent.toFixed(2)}%
            </Box>
          </Box>
        </Box>
      )}

      {/* SVG Chart Content */}
      <Box sx={{ position: 'relative', width: '100%' }}>
        {isHistoricalLoading ? (
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '16px' }} />
        ) : dataPoints.length === 0 ? (
          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fdfdfd', borderRadius: '16px', border: '1px dashed rgba(0,0,0,0.1)' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              환율 정보를 가져오지 못했습니다.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ cursor: 'crosshair', userSelect: 'none' }}>
            <svg 
              ref={svgRef}
              width="100%" 
              height={svgHeight} 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Area Gradient */}
                <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="0.2"/>
                  <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingLeft} y1={paddingTop} x2={svgWidth - paddingRight} y2={paddingTop} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
              <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight / 2} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
              <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />

              {/* Min / Max dotted guides */}
              <line 
                x1={paddingLeft} 
                y1={getY(maxVal)} 
                x2={svgWidth - paddingRight} 
                y2={getY(maxVal)} 
                stroke="#2e7d32" 
                strokeWidth="0.8" 
                strokeDasharray="3,3" 
                opacity="0.3"
              />
              <line 
                x1={paddingLeft} 
                y1={getY(minVal)} 
                x2={svgWidth - paddingRight} 
                y2={getY(minVal)} 
                stroke="#d32f2f" 
                strokeWidth="0.8" 
                strokeDasharray="3,3" 
                opacity="0.3"
              />

              {/* Axis Labels (Rates on Left Y-Axis) */}
              <text x={paddingLeft - 10} y={paddingTop + 4} textAnchor="end" fill={theme.palette.text.secondary} fontSize="10" fontWeight="600">
                {formatRate(maxVal)}
              </text>
              <text x={paddingLeft - 10} y={paddingTop + chartHeight / 2 + 4} textAnchor="end" fill={theme.palette.text.secondary} fontSize="10" fontWeight="500">
                {formatRate((maxVal + minVal) / 2)}
              </text>
              <text x={paddingLeft - 10} y={paddingTop + chartHeight + 4} textAnchor="end" fill={theme.palette.text.secondary} fontSize="10" fontWeight="600">
                {formatRate(minVal)}
              </text>

              {/* Chart Paths */}
              {dataPoints.length > 1 && (
                <>
                  {/* Filled Area */}
                  <path d={areaPath} fill="url(#chart-area-grad)" />
                  {/* Main Line */}
                  <path d={linePath} fill="none" stroke={theme.palette.primary.main} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}

              {/* Date Labels on Bottom X-Axis */}
              {dataPoints.length > 0 && (
                <>
                  <text x={getX(0)} y={svgHeight - 10} textAnchor="middle" fill={theme.palette.text.secondary} fontSize="9" fontWeight="600">
                    {dataPoints[0].formattedDate}
                  </text>
                  <text x={getX(Math.floor((dataPoints.length - 1) / 2))} y={svgHeight - 10} textAnchor="middle" fill={theme.palette.text.secondary} fontSize="9" fontWeight="500">
                    {dataPoints[Math.floor((dataPoints.length - 1) / 2)].formattedDate}
                  </text>
                  <text x={getX(dataPoints.length - 1)} y={svgHeight - 10} textAnchor="middle" fill={theme.palette.text.secondary} fontSize="9" fontWeight="600">
                    {dataPoints[dataPoints.length - 1].formattedDate}
                  </text>
                </>
              )}

              {/* Hover Interactive Components */}
              {hoveredPoint && (
                <>
                  {/* Vertical cursor line */}
                  <line 
                    x1={getX(hoveredIdx)} 
                    y1={paddingTop} 
                    x2={getX(hoveredIdx)} 
                    y2={paddingTop + chartHeight} 
                    stroke={theme.palette.primary.light} 
                    strokeWidth="1" 
                    strokeDasharray="2,2" 
                  />
                  {/* Highlighting circle point */}
                  <circle 
                    cx={getX(hoveredIdx)} 
                    cy={getY(hoveredPoint.value)} 
                    r="5" 
                    fill={theme.palette.primary.main} 
                    stroke="#ffffff" 
                    strokeWidth="2" 
                  />
                  
                  {/* Dynamic Tooltip Box inside SVG to avoid browser boundary overflows */}
                  <g transform={`translate(${getX(hoveredIdx) + (hoveredIdx > dataPoints.length / 2 ? -95 : 15)}, ${getY(hoveredPoint.value) - 10})`}>
                    <rect 
                      width="80" 
                      height="36" 
                      rx="6" 
                      fill="rgba(26, 26, 27, 0.9)" 
                      filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.15))"
                    />
                    <text x="8" y="14" fill="#ffffff" fontSize="9" fontWeight="600">
                      {hoveredPoint.date.replace(/-/g, '.')}
                    </text>
                    <text x="8" y="27" fill={theme.palette.primary.light} fontSize="10" fontWeight="800">
                      {formatRate(hoveredPoint.value)} {trendTargetCurrency}
                    </text>
                  </g>
                </>
              )}
            </svg>
          </Box>
        )}
      </Box>

      {/* Guide Info */}
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', opacity: 0.7 }}>
        <Info size={14} />
        <Typography variant="caption">
          차트 위에 마우스를 올리면 해당 일자의 세부 환율 정보를 확인할 수 있습니다.
        </Typography>
      </Box>
    </Card>
  );
};

export default ExchangeTrend;
