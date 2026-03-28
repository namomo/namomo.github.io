import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Chip
} from '@mui/material';
import { Plus } from 'lucide-react';
import useUnitStore from '../../stores/use-unit-store';

import { AVAILABLE_CURRENCIES } from '../../constants/currencies';



const CurrencySelector = () => {
  const [open, setOpen] = useState(false);
  const { targetCurrencies, addTargetCurrency, removeTargetCurrency, baseCurrency } = useUnitStore();


  const handleToggle = (code) => {
    if (targetCurrencies.includes(code)) {
      removeTargetCurrency(code);
    } else {
      addTargetCurrency(code);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {targetCurrencies.map(code => (
          <Chip 
            key={code} 
            label={code} 
            onDelete={() => removeTargetCurrency(code)}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        ))}
        <Button 
          variant="dashed" 
          size="small" 
          startIcon={<Plus size={16} />}
          onClick={() => setOpen(true)}
          sx={{ 
            borderRadius: '16px', 
            border: '1px dashed',
            borderColor: 'primary.main',
            color: 'primary.main'
          }}
        >
          국가 추가
        </Button>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>환율 국가 추가</DialogTitle>
        <DialogContent dividers>
          <List>
            {AVAILABLE_CURRENCIES.map((curr) => {


              const isSelected = targetCurrencies.includes(curr.code);
              return (
                <ListItem key={curr.code} disablePadding>
                  <ListItemButton 
                    onClick={() => handleToggle(curr.code)}
                    selected={isSelected}
                    sx={{ borderRadius: '8px', mb: 0.5 }}
                  >
                    <ListItemText primary={curr.name} />
                  </ListItemButton>
                </ListItem>
              );
            })}

          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 600 }}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CurrencySelector;
