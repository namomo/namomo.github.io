import React, { useState } from 'react'
import { 
  Box, 
  Container, 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  GlobalStyles,
  IconButton,
  useMediaQuery
} from '@mui/material'
import { Menu as MenuIcon } from 'lucide-react'
import Sidebar from './components/layout/Sidebar'
import MainCard from './components/converter/MainCard'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#673ab7', // Deep Purple
      light: '#9575cd',
      dark: '#512da8',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1b',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: '"Pretendard", "Inter", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{
        body: {
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
        }
      }} />
      
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar 
          open={isMobile ? mobileOpen : true} 
          onClose={handleDrawerToggle}
          variant={isMobile ? 'temporary' : 'permanent'}
        />

        {/* Main Content */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 2, md: 4 },
            width: { md: `calc(100% - 280px)` },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {isMobile && (
            <Box sx={{ alignSelf: 'flex-start', mb: 2 }}>
              <IconButton onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            </Box>
          )}
          
          <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 8 } }}>
            <MainCard />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
