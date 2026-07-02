import React, { useEffect } from 'react';
import { 
  Paper, 
  Box, 
  TextField, 
  Typography, 
  Skeleton, 
  InputAdornment, 
  Divider,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { ArrowLeftRight, TrendingUp, Globe } from 'lucide-react';
import useUnitStore from '../../stores/unit-store';
import CurrencySelector from './currency-selector';
import { AVAILABLE_CURRENCIES } from '../../constants/currencies';
import ExchangeTrend from './exchange-trend';

const MainCard = () => {
  const { 
    selectedCategory, 
    usValue, 
    krValue, 
    setUsValue, 
    setKrValue, 
    exchangeRate,
    multiExchangeRates,
    isRateLoading,
    initialize,
    baseAmount,
    setBaseAmount,
    targetCurrencies,
    baseCurrency,
    setBaseCurrency,
    updateTime
  } = useUnitStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const renderNormalLayout = () => (
    <>
      {/* US Input */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 600, color: 'text.secondary' }}>
          미국 단위 ({selectedCategory.usUnit})
        </Typography>
        <TextField
          fullWidth
          value={usValue}
          onChange={(e) => setUsValue(e.target.value)}
          type="number"
          variant="outlined"
          placeholder="0.00"
          InputProps={{
            startAdornment: selectedCategory.usPrefix && (
              <InputAdornment position="start">
                <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>{selectedCategory.usPrefix}</Typography>
              </InputAdornment>
            ),
            endAdornment: selectedCategory.usSuffix && (
              <InputAdornment position="end">
                <Typography sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '1rem' }}>{selectedCategory.usSuffix}</Typography>
              </InputAdornment>
            ),
            sx: { 
              borderRadius: '16px',
              fontSize: '1.8rem',
              fontWeight: 800,
              bgcolor: '#fcfcfd',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0,0,0,0.08)'
              }
            }
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: -1, position: 'relative' }}>
        <Box sx={{ 
          p: 0.5,
          color: 'primary.main',
          display: 'flex',
          bgcolor: '#ffffff',
          zIndex: 1,
          opacity: 0.8
        }}>
          <ArrowLeftRight size={24} strokeWidth={1.5} />
        </Box>
      </Box>

      {/* KR Input */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 600, color: 'text.secondary' }}>
          한국 단위 ({selectedCategory.krUnit})
        </Typography>
        <TextField
          fullWidth
          value={krValue}
          onChange={(e) => setKrValue(e.target.value)}
          type="number"
          variant="outlined"
          placeholder="0.00"
          InputProps={{
            startAdornment: selectedCategory.krPrefix && (
              <InputAdornment position="start">
                <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>{selectedCategory.krPrefix}</Typography>
              </InputAdornment>
            ),
            endAdornment: selectedCategory.krSuffix && (
              <InputAdornment position="end">
                <Typography sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '1rem' }}>{selectedCategory.krSuffix}</Typography>
              </InputAdornment>
            ),
            sx: { 
              borderRadius: '16px',
              fontSize: '1.8rem',
              fontWeight: 800,
              bgcolor: '#fcfcfd',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0,0,0,0.08)'
              }
            }
          }}
        />
      </Box>
    </>
  );

  const renderMultiLayout = () => {
    const currentBase = AVAILABLE_CURRENCIES.find(c => c.code === baseCurrency);
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Base Input & Currency Selector */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <FormControl variant="outlined" sx={{ minWidth: 100 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 600, color: 'text.secondary' }}>
              기준
            </Typography>
            <Select
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value)}
              sx={{ borderRadius: '16px', bgcolor: '#fcfcfd', fontWeight: 700 }}
            >
              {AVAILABLE_CURRENCIES.map(c => (
                <MenuItem key={c.code} value={c.code}>{c.code}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, ml: 1, fontWeight: 600, color: 'text.secondary' }}>
              금액 ({baseCurrency})
            </Typography>
            <TextField
              fullWidth
              value={baseAmount}
              onChange={(e) => setBaseAmount(e.target.value)}
              type="number"
              variant="outlined"
              placeholder="0.00"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>{currentBase?.symbol}</Typography>
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: '16px',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  bgcolor: '#fcfcfd',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0,0,0,0.08)'
                  }
                }
              }}
            />
          </Box>
        </Box>

        <Divider>
          <Globe size={20} color="rgba(0, 0, 0, 0.2)" />
        </Divider>

        {/* Target Results */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {targetCurrencies.map(code => {
            const rate = code === baseCurrency ? 1 : multiExchangeRates[code];
            const converted = baseAmount ? (parseFloat(baseAmount) * (rate || 0)).toFixed(2) : '0.00';
            return (
              <Box 
                key={code}
                sx={{ 
                  p: 2, 
                  borderRadius: '16px', 
                  bgcolor: '#f8f9fa', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  border: '1px solid rgba(0,0,0,0.03)'
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{code}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{Number(converted).toLocaleString()}</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                  1 {baseCurrency} = {rate ? rate.toFixed(4) : '-'} {code}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <CurrencySelector />
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: '24px', 
          bgcolor: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          width: '100%'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {selectedCategory.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', bgcolor: 'rgba(0,0,0,0.03)', px: 1.5, py: 0.5, borderRadius: '20px' }}>
            <TrendingUp size={14} />
            {isRateLoading ? (
              <Skeleton width={80} />
            ) : (
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                1 USD = {exchangeRate.toLocaleString()} KRW
              </Typography>
            )}
          </Box>
        </Box>

        {selectedCategory.id === 'currency' ? renderMultiLayout() : renderNormalLayout()}

        <Box sx={{ mt: 2, p: 2, borderRadius: '16px', bgcolor: 'rgba(103, 58, 183, 0.04)', border: '1px dashed rgba(103, 58, 183, 0.2)' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            실시간 환율({updateTime})과 국제 표준 규격이 자동으로 적용되었습니다.
          </Typography>
        </Box>
      </Paper>
      
      {selectedCategory.id === 'currency' && <ExchangeTrend />}
    </Box>
  );
};

export default MainCard;
