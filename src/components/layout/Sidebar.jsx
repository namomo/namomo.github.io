import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import * as LucideIcons from 'lucide-react';
import { Layers, X } from 'lucide-react';
import useUnitStore from '../../stores/use-unit-store';

const Sidebar = ({ open, onClose, variant = 'permanent' }) => {
  const { categories, selectedCategory, setSelectedCategory } = useUnitStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Layers size={28} color={theme.palette.primary.main} />
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
          UnitBridge
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
            <X size={20} />
          </IconButton>
        )}
      </Box>
      
      <Divider sx={{ mx: 2, opacity: 0.5 }} />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="overline" sx={{ px: 2, color: 'text.secondary', fontWeight: 700 }}>
          Categories
        </Typography>
        <List sx={{ mt: 1 }}>
          {categories.map((cat) => {
            const IconComponent = LucideIcons[cat.icon];
            const isSelected = selectedCategory.id === cat.id;
            
            return (
              <ListItem key={cat.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  selected={isSelected}
                  onClick={() => {
                    setSelectedCategory(cat);
                    if (isMobile) onClose();
                  }}
                  sx={{
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(103, 58, 183, 0.08)',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    },
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {IconComponent && <IconComponent size={20} />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={cat.name} 
                    primaryTypographyProps={{ 
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: '0.95rem'
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ mt: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          © 2026 UnitBridge
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
          v{__APP_VERSION__}
        </Typography>
      </Box>

    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          bgcolor: '#ffffff',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
