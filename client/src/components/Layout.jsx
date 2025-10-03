import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import HelpIcon from '@mui/icons-material/Help';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AddIcon from '@mui/icons-material/Add';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import the separated components
import Help from './Help';
import Report from './Report';
import Feedback from './Feedback';
import ContactUs from './ContactUs';

// Import the same local video file
import animeVideo from './video/animevideo.mp4';

// Samsung Galaxy A26 dimensions: 412x892 (portrait)
const drawerWidth = 280;
const mobileDrawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(2),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    position: 'relative',
    minHeight: '100vh',
    
    // Mobile responsiveness
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(1),
      marginLeft: 0,
      ...(open && {
        marginLeft: 0,
      }),
    },
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  backgroundColor: 'rgba(26, 26, 26, 0.95)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: 'none',
  
  // Mobile responsiveness
  [theme.breakpoints.down('md')]: {
    ...(open && {
      width: '100%',
      marginLeft: 0,
    }),
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
  borderBottom: 'none',
  minHeight: '64px !important',
  
  // Mobile responsiveness
  [theme.breakpoints.down('md')]: {
    minHeight: '56px !important',
  },
}));

const GlassCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '16px',
  padding: theme.spacing(2),
  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #ff6ec4, #7873f5, #4a90e2)',
    borderRadius: '16px 16px 0 0',
  },
  
  // Mobile responsiveness
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1.5),
    borderRadius: '12px',
    '&::before': {
      borderRadius: '12px 12px 0 0',
    },
  },
}));

const Layout = ({ children, title = "Dashboard" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false); // Start closed on mobile
  const [activeSection, setActiveSection] = React.useState('home');
  const [isMobile, setIsMobile] = React.useState(false);
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-close drawer on mobile when navigating
  useEffect(() => {
    if (isMobile && open) {
      setOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Video loading and error handling
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (isMobile) {
      setOpen(false); // Close drawer on mobile after selection
    }
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/', section: 'home' },
    { text: 'Add New Anime', icon: <AddIcon />, path: '/create', section: 'create' },
    { text: 'My Animes', icon: <CollectionsBookmarkIcon />, path: '/my-animes', section: 'my-animes' },
  ];

  const settingsItems = [
    { text: 'Help', icon: <HelpIcon />, section: 'help' },
    { text: 'Report', icon: <ReportProblemIcon />, section: 'report' },
    { text: 'Feedback', icon: <FeedbackIcon />, section: 'feedback' },
    { text: 'Contact Us', icon: <ContactMailIcon />, section: 'contact' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'help':
        return <Help />;

      case 'report':
        return <Report />;

      case 'feedback':
        return <Feedback />;

      case 'contact':
        return <ContactUs />;

      default:
        return children;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Video Background */}
      <video
        ref={videoRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -2,
          filter: 'brightness(0.5) contrast(1.1)',
          opacity: videoLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
        }}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={handleVideoLoad}
      >
        <source src={animeVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Video Overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(5, 2, 7, 0.8) 0%, rgba(49, 27, 146, 0.9) 100%)',
          zIndex: -1,
        }}
      />
      
      {/* Fallback Background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #6a1b9a 0%, #311b92 100%)',
          zIndex: -3,
        }}
      />

      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ minHeight: { xs: '56px', md: '64px' } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ 
              mr: 2, 
              ...(open && { display: 'none' }),
              ...(isMobile && { fontSize: '1.5rem' })
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              textAlign: 'center',
              position: isMobile ? 'static' : 'absolute',
              left: isMobile ? '0' : '50%',
              transform: isMobile ? 'none' : 'translateX(-50%)',
              background: 'linear-gradient(45deg, #ffffff, #e0e0ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
              fontSize: { xs: '1.4rem', md: '1.8rem' },
              px: { xs: 1, md: 0 },
            }}
          >
            MyAnimeVerse
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Drawer
        sx={{
          width: isMobile ? mobileDrawerWidth : drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile ? mobileDrawerWidth : drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(20px)',
            border: 'none',
            color: 'white',
            boxShadow: isMobile ? '4px 0 20px rgba(0, 0, 0, 0.3)' : 'none',
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        <DrawerHeader sx={{ 
          background: 'linear-gradient(135deg, rgba(255, 110, 196, 0.2) 0%, rgba(120, 115, 245, 0.2) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <Typography variant="h6" sx={{ 
            flexGrow: 1, 
            textAlign: 'center',
            background: 'linear-gradient(45deg, #ffffff, #e0e0ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            fontSize: { xs: '1.2rem', md: '1.4rem' },
          }}>
            MyAnimeVerse
          </Typography>
          <IconButton onClick={handleDrawerClose} sx={{ color: 'white' }}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        
        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
        
        {/* Main Navigation */}
        <List sx={{ border: 'none', py: 0 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ border: 'none' }}>
              <ListItemButton
                onClick={() => {
                  if (item.path) navigate(item.path);
                  handleSectionChange(item.section);
                }}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(120, 115, 245, 0.2)',
                    borderRight: '3px solid #7873f5',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  border: 'none',
                  py: { xs: 1, md: 1.5 },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: { xs: '40px', md: '56px' } }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    sx: { 
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      color: 'white',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    } 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', my: 1 }} />
        
        {/* Settings and Privacy Section */}
        <Typography variant="subtitle2" sx={{ 
          pl: 2, pt: 2, 
          color: 'rgba(255, 255, 255, 0.7)',
          fontWeight: 600,
          fontSize: { xs: '0.8rem', md: '0.875rem' },
        }}>
          Support
        </Typography>
        <List sx={{ border: 'none', py: 0 }}>
          {settingsItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ border: 'none' }}>
              <ListItemButton
                onClick={() => handleSectionChange(item.section)}
                selected={activeSection === item.section}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(120, 115, 245, 0.2)',
                    borderRight: '3px solid #7873f5',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  border: 'none',
                  py: { xs: 1, md: 1.5 },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: { xs: '40px', md: '56px' } }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    sx: { 
                      fontWeight: activeSection === item.section ? 600 : 400,
                      color: 'white',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    } 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', my: 1 }} />
        
        {/* Logout */}
        <List sx={{ border: 'none', py: 0 }}>
          <ListItem disablePadding sx={{ border: 'none' }}>
            <ListItemButton 
              onClick={handleLogout}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 107, 107, 0.2)',
                },
                border: 'none',
                py: { xs: 1, md: 1.5 },
              }}
            >
              <ListItemIcon sx={{ color: '#ff6b6b', minWidth: { xs: '40px', md: '56px' } }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ 
                  sx: { 
                    color: '#ff6b6b',
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                  } 
                }} 
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      
      <Main open={open}>
        <DrawerHeader />
        <Box sx={{ 
          padding: { xs: 1, md: 2 },
          opacity: videoLoaded ? 1 : 0.8,
          transition: 'opacity 0.3s ease-in-out',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}>
          {renderContent()}
        </Box>
      </Main>
    </Box>
  );
};

export default Layout;