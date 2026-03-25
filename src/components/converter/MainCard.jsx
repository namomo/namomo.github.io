import React, { useEffect } from 'react';
import { Paper, Box, TextField, Typography, Skeleton, InputAdornment } from '@mui/material';
import { ArrowLeftRight, TrendingUp } from 'lucide-react';
import useUnitStore from '../../stores/use-unit-store';

const MainCard = () => {
  const { 
    selectedCategory, 
    usValue, 
    krValue, 
    setUsValue, 
    setKrValue, 
    exchangeRate,
    isRateLoading,
    initialize 
  } = useUnitStore();

  useEffect(() => {
    initialize();
  }, []);

  return (
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
        maxWidth: '600px',
        width: '100%',
        margin: '0 auto'
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
            <Typography variant="caption" sx={{ fontWeight: 600 }}>1 USD = {exchangeRate.toLocaleString()} KRW</Typography>
          )}
        </Box>
      </Box>

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
          bgcolor: '#ffffff', // 커버 효과를 위해 배경색 유지하되 원형/그림자 제거
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

      <Box sx={{ mt: 2, p: 2, borderRadius: '16px', bgcolor: 'rgba(103, 58, 183, 0.04)', border: '1px dashed rgba(103, 58, 183, 0.2)' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          실시간 환율과 국제 표준 규격이 자동으로 적용되었습니다.
        </Typography>
      </Box>
    </Paper>
  );
};

export default MainCard;
