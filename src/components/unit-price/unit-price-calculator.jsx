import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  TextField, 
  MenuItem, 
  Grid, 
  Divider,
  InputAdornment,
  Fade
} from '@mui/material';
import { Calculator, Tag, Package, Target } from 'lucide-react';

const UNITS = [
  { id: 'g', name: 'g', group: 'weight', factor: 1 },
  { id: 'kg', name: 'kg', group: 'weight', factor: 1000 },
  { id: 'ml', name: 'ml', group: 'volume', factor: 1 },
  { id: 'L', name: 'L', group: 'volume', factor: 1000 },
  { id: 'pcs', name: '개 (count)', group: 'count', factor: 1 },
  { id: 'box', name: '박스 (box)', group: 'count', factor: 1 },
];

const UnitPriceCalculator = () => {
  const [totalPrice, setTotalPrice] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('L');
  
  const [refQuantity, setRefQuantity] = useState('100');
  const [refUnit, setRefUnit] = useState('ml');
  
  const [result, setResult] = useState(null);

  const [lastGroup, setLastGroup] = useState(null);

  // Auto-update reference unit based on selected unit group
  useEffect(() => {
    const unitObj = UNITS.find(u => u.id === selectedUnit);
    if (!unitObj) return;

    if (unitObj.group !== lastGroup) {
      if (unitObj.group === 'weight') {
        setRefQuantity('100');
        setRefUnit('g');
      } else if (unitObj.group === 'volume') {
        setRefQuantity('100');
        setRefUnit('ml');
      } else {
        setRefQuantity('1');
        setRefUnit('pcs');
      }
      setLastGroup(unitObj.group);
    }
  }, [selectedUnit, lastGroup]);

  useEffect(() => {
    calculate();
  }, [totalPrice, totalQuantity, selectedUnit, refQuantity, refUnit]);

  const calculate = () => {
    const price = parseFloat(totalPrice);
    const qty = parseFloat(totalQuantity);
    const refQty = parseFloat(refQuantity);
    
    if (isNaN(price) || isNaN(qty) || isNaN(refQty) || qty <= 0 || refQty <= 0) {
      setResult(null);
      return;
    }

    const unitObj = UNITS.find(u => u.id === selectedUnit);
    const refUnitObj = UNITS.find(u => u.id === refUnit);

    if (!unitObj || !refUnitObj) return;

    // Convert everything to base (g/ml/pcs)
    const totalInBase = qty * unitObj.factor;
    const refInBase = refQty * refUnitObj.factor;

    const pricePerBase = price / totalInBase;
    const finalPrice = pricePerBase * refInBase;

    setResult(finalPrice);
  };

  return (
    <Fade in={true} timeout={500}>
      <Card sx={{ 
        width: '100%', 
        maxWidth: 600, 
        p: { xs: 3, md: 5 }, 
        borderRadius: 4,
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        background: 'linear-gradient(145deg, #ffffff 0%, #f9f9ff 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Accent */}
        <Box sx={{ 
          position: 'absolute', 
          top: -20, 
          right: -20, 
          width: 100, 
          height: 100, 
          borderRadius: '50%', 
          bgcolor: 'rgba(103, 58, 183, 0.05)',
          zIndex: 0
        }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 3, 
              bgcolor: 'primary.main', 
              color: 'white',
              display: 'flex'
            }}>
              <Calculator size={24} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                단위당 가격 계산기
              </Typography>
              <Typography variant="body2" color="text.secondary">
                더 합리적인 소비를 위한 단위 환산
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* 구매 정보 Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tag size={16} /> 구매 정보
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="총 가격"
                    placeholder="예: 3000"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₩</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={7} sm={4}>
                  <TextField
                    fullWidth
                    label="총 수량"
                    placeholder="예: 1.5"
                    value={totalQuantity}
                    onChange={(e) => setTotalQuantity(e.target.value)}
                    type="number"
                  />
                </Grid>
                <Grid item xs={5} sm={2}>
                  <TextField
                    select
                    fullWidth
                    label="단위"
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                  >
                    {UNITS.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* 기준 정보 Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Target size={16} /> 비교 기준
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={7} sm={9}>
                  <TextField
                    fullWidth
                    label="기준 수량"
                    placeholder="예: 100"
                    value={refQuantity}
                    onChange={(e) => setRefQuantity(e.target.value)}
                    type="number"
                  />
                </Grid>
                <Grid item xs={5} sm={3}>
                  <TextField
                    select
                    fullWidth
                    label="기준 단위"
                    value={refUnit}
                    onChange={(e) => setRefUnit(e.target.value)}
                  >
                    {UNITS.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>

            {/* 결과 Section */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ 
                p: 3, 
                borderRadius: 4, 
                bgcolor: result !== null ? 'rgba(103, 58, 183, 0.05)' : 'rgba(0,0,0,0.02)',
                border: '1px solid',
                borderColor: result !== null ? 'rgba(103, 58, 183, 0.1)' : 'transparent',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                {result !== null ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {refQuantity}{refUnit}당 가격
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>
                      ₩{result.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    가격을 계산하려면 모든 값을 입력해주세요.
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Fade>
  );
};

export default UnitPriceCalculator;
