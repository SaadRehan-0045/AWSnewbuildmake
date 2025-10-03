import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AddCircleOutline,
  Visibility,
  Edit,
  Delete,
  Comment,
  Security,
  Group
} from '@mui/icons-material';

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '16px',
  padding: theme.spacing(2),
  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
  color: 'white',
  [theme.breakpoints.up('sm')]: {
    borderRadius: '20px',
    padding: theme.spacing(4),
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
  },
}));

const Help = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <GlassCard>
      <Typography variant="h4" gutterBottom sx={{ 
        color: 'white', 
        fontWeight: 600,
        textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        mb: isMobile ? 2 : 4,
        fontSize: isMobile ? '1.5rem' : '2.125rem',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        Help & Support Center
      </Typography>

      <Box sx={{ mb: isMobile ? 3 : 4 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          color: '#7873f5', 
          mb: isMobile ? 1 : 2,
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}>
          Welcome to MyAnimeVerse!
        </Typography>
        <Typography variant="body1" sx={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          mb: isMobile ? 2 : 3, 
          lineHeight: 1.6,
          fontSize: isMobile ? '0.9rem' : '1rem',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          MyAnimeVerse is your ultimate platform for sharing and discovering anime content. 
          Connect with the anime community, share your favorite shows, and engage with other fans.
        </Typography>
      </Box>

      <Box sx={{ mb: isMobile ? 3 : 4 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          color: '#7873f5', 
          mb: isMobile ? 1 : 2,
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}>
          Getting Started
        </Typography>
        <List sx={{ py: 0 }}>
          <ListItem sx={{ px: 0, alignItems: 'flex-start', mb: isMobile ? 1 : 2 }}>
            <ListItemIcon sx={{ color: '#ff6ec4', minWidth: isMobile ? 32 : 40, mt: 0.5 }}>
              <AddCircleOutline fontSize={isMobile ? "small" : "medium"} />
            </ListItemIcon>
            <ListItemText 
              primary="Create an Account"
              secondary="Sign up with Google or create a new account to start sharing anime content"
              primaryTypographyProps={{ 
                sx: { 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  mb: 0.5
                } 
              }}
              secondaryTypographyProps={{ 
                sx: { 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  lineHeight: 1.4
                } 
              }}
            />
          </ListItem>
          
          <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
            <ListItemIcon sx={{ color: '#ff6ec4', minWidth: isMobile ? 32 : 40, mt: 0.5 }}>
              <AddCircleOutline fontSize={isMobile ? "small" : "medium"} />
            </ListItemIcon>
            <ListItemText 
              primary="Add Anime Content"
              secondary="Once registered, you can add new anime posts with details, images, and download links"
              primaryTypographyProps={{ 
                sx: { 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  mb: 0.5
                } 
              }}
              secondaryTypographyProps={{ 
                sx: { 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  lineHeight: 1.4
                } 
              }}
            />
          </ListItem>
        </List>
      </Box>

      <Box sx={{ mb: isMobile ? 3 : 4 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          color: '#7873f5', 
          mb: isMobile ? 1 : 2,
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}>
          Content Management
        </Typography>
        <List sx={{ py: 0 }}>
          <ListItem sx={{ px: 0, alignItems: 'flex-start', mb: isMobile ? 1 : 2 }}>
            <ListItemIcon sx={{ color: '#4a90e2', minWidth: isMobile ? 32 : 40, mt: 0.5 }}>
              <Visibility fontSize={isMobile ? "small" : "medium"} />
            </ListItemIcon>
            <ListItemText 
              primary="View Community Content"
              secondary="Browse through anime posts shared by the entire community"
              primaryTypographyProps={{ 
                sx: { 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  mb: 0.5
                } 
              }}
              secondaryTypographyProps={{ 
                sx: { 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  lineHeight: 1.4
                } 
              }}
            />
          </ListItem>
          
          <ListItem sx={{ px: 0, alignItems: 'flex-start', mb: isMobile ? 1 : 2 }}>
            <ListItemIcon sx={{ color: '#4a90e2', minWidth: isMobile ? 32 : 40, mt: 0.5 }}>
              <Edit fontSize={isMobile ? "small" : "medium"} />
            </ListItemIcon>
            <ListItemText 
              primary="Update Your Posts"
              secondary="Edit and update your anime posts anytime to keep information current"
              primaryTypographyProps={{ 
                sx: { 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  mb: 0.5
                } 
              }}
              secondaryTypographyProps={{ 
                sx: { 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  lineHeight: 1.4
                } 
              }}
            />
          </ListItem>
          
          <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
            <ListItemIcon sx={{ color: '#ff6b6b', minWidth: isMobile ? 32 : 40, mt: 0.5 }}>
              <Delete fontSize={isMobile ? "small" : "medium"} />
            </ListItemIcon>
            <ListItemText 
              primary="Delete Posts"
              secondary="Remove your anime posts if they're no longer relevant or available"
              primaryTypographyProps={{ 
                sx: { 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  mb: 0.5
                } 
              }}
              secondaryTypographyProps={{ 
                sx: { 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  lineHeight: 1.4
                } 
              }}
            />
          </ListItem>
        </List>
      </Box>

      <Box sx={{ mb: isMobile ? 3 : 4 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          color: '#7873f5', 
          mb: isMobile ? 1 : 2,
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}>
          Community Features
        </Typography>
        <List sx={{ py: 0 }}>
          <ListItem sx={{ px: 0, alignItems: 'flex-start', mb: isMobile ? 1 : 2 }}>
            <ListItemIcon sx={{ color: '#4cd964', minWidth: isMobile ? 32 : 40, mt: 0.5 }}>
              <Comment fontSize={isMobile ? "small" : "medium"} />
            </ListItemIcon>
            <ListItemText 
              primary="Comments & Interactions"
              secondary="Engage with other users by commenting on their anime posts"
              primaryTypographyProps={{ 
                sx: { 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  mb: 0.5
                } 
              }}
              secondaryTypographyProps={{ 
                sx: { 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  lineHeight: 1.4
                } 
              }}
            />
          </ListItem>
          
          <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
            <ListItemIcon sx={{ color: '#4cd964', minWidth: isMobile ? 32 : 40, mt: 0.5 }}>
              <Group fontSize={isMobile ? "small" : "medium"} />
            </ListItemIcon>
            <ListItemText 
              primary="Community Guidelines"
              secondary="Respect other users and follow community guidelines for a positive experience"
              primaryTypographyProps={{ 
                sx: { 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  mb: 0.5
                } 
              }}
              secondaryTypographyProps={{ 
                sx: { 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  lineHeight: 1.4
                } 
              }}
            />
          </ListItem>
        </List>
      </Box>

      <Box sx={{ mb: isMobile ? 3 : 4 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          color: '#7873f5', 
          mb: isMobile ? 1 : 2,
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}>
          Security & Privacy
        </Typography>
        <List sx={{ py: 0 }}>
          <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
            <ListItemIcon sx={{ color: '#ffd700', minWidth: isMobile ? 32 : 40, mt: 0.5 }}>
              <Security fontSize={isMobile ? "small" : "medium"} />
            </ListItemIcon>
            <ListItemText 
              primary="Account Security"
              secondary="Your account information is secure. Use strong passwords and enable 2FA if available"
              primaryTypographyProps={{ 
                sx: { 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  mb: 0.5
                } 
              }}
              secondaryTypographyProps={{ 
                sx: { 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  lineHeight: 1.4
                } 
              }}
            />
          </ListItem>
        </List>
      </Box>

      <Box sx={{ 
        mt: isMobile ? 3 : 4, 
        p: isMobile ? 2 : 3, 
        background: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: '8px',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        <Typography variant="body2" sx={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          fontStyle: 'italic',
          fontSize: isMobile ? '0.8rem' : '0.875rem',
          lineHeight: 1.4
        }}>
          Need more help? Contact our support team through the Contact Us section or report any issues you encounter.
        </Typography>
      </Box>
    </GlassCard>
  );
};

export default Help;