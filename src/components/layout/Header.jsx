import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Layers } from 'lucide-react';

const Header = () => {
  return (
    <Box component="header" sx={{ py: 4, mb: 2 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Layers size={32} color="#bb86fc" />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            UnitBridge
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" sx={{ textAlign: 'center', mt: 1, opacity: 0.7 }}>
          단위와 환율을 넘어, 가치를 잇다
        </Typography>
      </Container>
    </Box>
  );
};

export default Header;
