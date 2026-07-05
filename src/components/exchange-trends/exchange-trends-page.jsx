import React, { useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography,
  useTheme,
} from '@mui/material';
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';
import { AVAILABLE_CURRENCIES, TREND_CURRENCY_CODES } from '../../constants/currencies';
import useUnitStore from '../../stores/unit-store';

const CHART_WIDTH = 760;
const CHART_HEIGHT = 280;
const PADDING = {
  top: 28,
  right: 24,
  bottom: 34,
  left: 58,
};

const SERIES_COLORS = {
  KRW: '#673ab7',
  USD: '#1976d2',
  JPY: '#2e7d32',
  CNY: '#d32f2f',
  EUR: '#ed6c02',
  GBP: '#6d4c41',
};

const RANGE_OPTIONS = [
  { days: 30, label: '1개월', groupLabel: '일별' },
  { days: 90, label: '3개월', groupLabel: '일별' },
  { days: 180, label: '6개월', groupLabel: '일별' },
  { days: 365, label: '1년', groupLabel: '주별' },
  { days: 365 * 3, label: '3년', groupLabel: '월별' },
  { days: 365 * 5, label: '5년', groupLabel: '월별' },
];

const BASE_QUOTE_UNITS = {
  KRW: 1000,
  JPY: 100,
};

const getCurrency = (code) => AVAILABLE_CURRENCIES.find(currency => currency.code === code);
const getBaseQuoteUnit = (code) => BASE_QUOTE_UNITS[code] || 1;
const scaleRate = (value, multiplier) => (
  value === undefined || value === null ? null : value * multiplier
);
const formatDateLabel = (date) => date.replace(/-/g, '.');
const formatAxisDate = (date) => date.substring(2).replace(/-/g, '/');

const formatRate = (value) => {
  if (value === undefined || value === null) return '-';
  if (value < 0.01) return value.toFixed(6);
  if (value < 1) return value.toFixed(4);
  if (value < 100) return value.toFixed(2);
  return value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
};

const formatPercent = (value) => {
  if (!Number.isFinite(value)) return '0.00%';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const buildSeries = (historicalRates, targetCodes) => {
  const dates = Object.keys(historicalRates).sort();

  return targetCodes.map((code) => {
    const points = dates
      .map(date => ({
        date,
        value: historicalRates[date]?.[code],
      }))
      .filter(point => point.value !== undefined);

    const first = points[0]?.value;
    const current = points[points.length - 1]?.value;
    const values = points.map(point => point.value);
    const changes = first
      ? points.map(point => ({
          ...point,
          change: ((point.value - first) / first) * 100,
        }))
      : [];

    return {
      code,
      points,
      changes,
      first,
      current,
      min: values.length ? Math.min(...values) : null,
      max: values.length ? Math.max(...values) : null,
      changePercent: first && current ? ((current - first) / first) * 100 : 0,
    };
  });
};

const ExchangeTrendsPage = () => {
  const theme = useTheme();
  const {
    trendBaseCurrency,
    setTrendBaseCurrency,
    historicalRangeDays,
    setHistoricalRangeDays,
    historicalRates,
    historicalStartDate,
    historicalEndDate,
    isHistoricalLoading,
    loadHistoricalRates,
  } = useUnitStore();

  useEffect(() => {
    if (!historicalStartDate && !isHistoricalLoading) {
      loadHistoricalRates();
    }
  }, [historicalStartDate, isHistoricalLoading, loadHistoricalRates]);

  const targetCodes = useMemo(
    () => TREND_CURRENCY_CODES.filter(code => code !== trendBaseCurrency),
    [trendBaseCurrency]
  );

  const series = useMemo(
    () => buildSeries(historicalRates, targetCodes),
    [historicalRates, targetCodes]
  );

  const allChanges = series.flatMap(item => item.changes.map(point => point.change));
  const minChange = allChanges.length ? Math.min(...allChanges) : -1;
  const maxChange = allChanges.length ? Math.max(...allChanges) : 1;
  const changeRange = maxChange - minChange || 1;
  const chartMin = minChange - changeRange * 0.15;
  const chartMax = maxChange + changeRange * 0.15;
  const chartWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const chartHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const dateCount = Object.keys(historicalRates).length;

  const getX = (index, total) => {
    if (total <= 1) return PADDING.left;
    return PADDING.left + (index / (total - 1)) * chartWidth;
  };

  const getY = (change) => (
    PADDING.top + chartHeight - ((change - chartMin) / (chartMax - chartMin)) * chartHeight
  );

  const baseCurrency = getCurrency(trendBaseCurrency);
  const baseQuoteUnit = getBaseQuoteUnit(trendBaseCurrency);
  const selectedRange = RANGE_OPTIONS.find(option => option.days === historicalRangeDays) || RANGE_OPTIONS[0];

  return (
    <Box sx={{ width: '100%', maxWidth: 1040, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '24px',
          bgcolor: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, flexWrap: 'wrap', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', p: 1.25, borderRadius: '14px', bgcolor: 'primary.main', color: '#fff' }}>
              <Activity size={22} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                환율 변동
              </Typography>
              <Typography variant="body2" color="text.secondary">
                주요 통화의 {selectedRange.label} 변동률 비교
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel id="trend-base-currency-label">기준 화폐</InputLabel>
              <Select
                labelId="trend-base-currency-label"
                label="기준 화폐"
                value={trendBaseCurrency}
                onChange={(event) => setTrendBaseCurrency(event.target.value)}
                sx={{ borderRadius: '16px', fontWeight: 700 }}
              >
                {TREND_CURRENCY_CODES.map(code => (
                  <MenuItem key={code} value={code}>
                    {getCurrency(code)?.symbol} {code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel id="trend-range-label">기간</InputLabel>
              <Select
                labelId="trend-range-label"
                label="기간"
                value={historicalRangeDays}
                onChange={(event) => setHistoricalRangeDays(Number(event.target.value))}
                sx={{ borderRadius: '16px', fontWeight: 700 }}
              >
                {RANGE_OPTIONS.map(option => (
                  <MenuItem key={option.days} value={option.days}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          <Chip label={`기준: ${baseCurrency?.name || trendBaseCurrency}`} color="primary" variant="outlined" />
          <Chip label={`표시 단위: ${baseQuoteUnit.toLocaleString()} ${trendBaseCurrency}`} variant="outlined" />
          <Chip label={`표현: ${selectedRange.groupLabel}`} variant="outlined" />
          <Chip
            label={historicalStartDate ? `${formatDateLabel(historicalStartDate)} ~ ${formatDateLabel(historicalEndDate)}` : `최근 ${selectedRange.label}`}
            variant="outlined"
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {isHistoricalLoading ? (
          <Skeleton variant="rectangular" height={CHART_HEIGHT} sx={{ borderRadius: '18px' }} />
        ) : allChanges.length === 0 ? (
          <Box sx={{ height: CHART_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(0,0,0,0.14)', borderRadius: '18px' }}>
            <Typography color="text.secondary">환율 변동 정보를 가져오지 못했습니다.</Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img">
              <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={PADDING.top + chartHeight} stroke="rgba(0,0,0,0.1)" />
              <line x1={PADDING.left} y1={PADDING.top + chartHeight} x2={CHART_WIDTH - PADDING.right} y2={PADDING.top + chartHeight} stroke="rgba(0,0,0,0.1)" />
              {[chartMax, (chartMax + chartMin) / 2, chartMin].map((tick) => (
                <React.Fragment key={tick}>
                  <line x1={PADDING.left} y1={getY(tick)} x2={CHART_WIDTH - PADDING.right} y2={getY(tick)} stroke="rgba(0,0,0,0.04)" />
                  <text x={PADDING.left - 10} y={getY(tick) + 4} textAnchor="end" fontSize="11" fontWeight="600" fill={theme.palette.text.secondary}>
                    {formatPercent(tick)}
                  </text>
                </React.Fragment>
              ))}
              <line x1={PADDING.left} y1={getY(0)} x2={CHART_WIDTH - PADDING.right} y2={getY(0)} stroke="rgba(0,0,0,0.2)" strokeDasharray="4,4" />

              {series.map((item) => {
                if (item.changes.length < 2) return null;
                const path = item.changes
                  .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index, item.changes.length)} ${getY(point.change)}`)
                  .join(' ');

                return (
                  <path
                    key={item.code}
                    d={path}
                    fill="none"
                    stroke={SERIES_COLORS[item.code]}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}

              {dateCount > 0 && (
                <>
                  <text x={PADDING.left} y={CHART_HEIGHT - 10} fontSize="11" fontWeight="600" fill={theme.palette.text.secondary} textAnchor="middle">
                    {formatAxisDate(historicalStartDate)}
                  </text>
                  <text x={CHART_WIDTH - PADDING.right} y={CHART_HEIGHT - 10} fontSize="11" fontWeight="600" fill={theme.palette.text.secondary} textAnchor="middle">
                    {formatAxisDate(historicalEndDate)}
                  </text>
                </>
              )}
            </svg>
          </Box>
        )}
      </Card>

      <Grid container spacing={2}>
        {series.map((item) => {
          const isUp = item.changePercent >= 0;
          return (
            <Grid item xs={12} sm={6} md={4} key={item.code}>
              <Card
                elevation={0}
                sx={{
                  p: 2.5,
                  height: '100%',
                  borderRadius: '18px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  bgcolor: '#ffffff',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {getCurrency(item.code)?.name}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: SERIES_COLORS[item.code] }}>
                      {item.code}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    icon={isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    label={formatPercent(item.changePercent)}
                    color={isUp ? 'success' : 'error'}
                    variant="outlined"
                    sx={{ fontWeight: 800 }}
                  />
                </Box>
                {isHistoricalLoading ? (
                  <Skeleton height={80} />
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {baseQuoteUnit.toLocaleString()} {trendBaseCurrency} =
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
                      {formatRate(scaleRate(item.current, baseQuoteUnit))} {item.code}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">최저</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{formatRate(scaleRate(item.min, baseQuoteUnit))}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">최고</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{formatRate(scaleRate(item.max, baseQuoteUnit))}</Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ExchangeTrendsPage;
