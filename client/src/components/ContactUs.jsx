import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import ContactMailIcon from '@mui/icons-material/ContactMail';

const GlassCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '16px',
  padding: theme.spacing(2),
  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  [theme.breakpoints.up('sm')]: {
    borderRadius: '20px',
    padding: theme.spacing(3),
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #7873f5, #8a85ff)',
    borderRadius: '16px 16px 0 0',
    [theme.breakpoints.up('sm')]: {
      height: '4px',
      borderRadius: '20px 20px 0 0',
    },
  },
}));

const ContactUs = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage('Thank you for contacting us! We\'ll get back to you within 24 hours.');
      setMessage('');
    }, 2000);
  };

  return (
    <GlassCard>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: isMobile ? 2 : 3,
        flexDirection: isMobile ? 'column' : 'row',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        <ContactMailIcon sx={{ 
          fontSize: isMobile ? 28 : 32, 
          color: '#7873f5', 
          mr: isMobile ? 0 : 2,
          mb: isMobile ? 1 : 0
        }} />
        <Typography variant="h4" sx={{ 
          color: 'white', 
          fontWeight: 600,
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          fontSize: isMobile ? '1.75rem' : '2.125rem'
        }}>
          Contact Us
        </Typography>
      </Box>

      <Box sx={{ mb: isMobile ? 3 : 4 }}>
        <Typography variant="body1" sx={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          mb: 2,
          fontSize: isMobile ? '0.9rem' : '1rem',
          lineHeight: 1.6,
          textAlign: isMobile ? 'center' : 'left'
        }}>
          Have questions or need support? We're here to help! Send us a message and we'll respond as soon as possible.
        </Typography>
        
        <Box sx={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          p: isMobile ? 1.5 : 2, 
          borderRadius: '8px', 
          mt: 2 
        }}>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: isMobile ? '0.8rem' : '0.875rem',
            lineHeight: 1.5
          }}>
            <strong>Email:</strong> support@myanimeverse.com<br />
            <strong>Response Time:</strong> Usually within 24 hours<br />
            <strong>Working Hours:</strong> Monday - Friday, 9AM - 6PM
          </Typography>
        </Box>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ 
          mb: 3, 
          background: 'rgba(76, 175, 80, 0.2)', 
          color: 'white',
          fontSize: isMobile ? '0.8rem' : '0.875rem',
          '& .MuiAlert-message': {
            padding: isMobile ? '4px 0' : '8px 0'
          }
        }}>
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Your message to us"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          rows={isMobile ? 3 : 4}
          fullWidth
          required
          sx={{
            mb: isMobile ? 2 : 3,
            '& .MuiOutlinedInput-root': {
              color: 'white',
              fontSize: isMobile ? '14px' : '16px',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#7873f5',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: isMobile ? '14px' : '16px',
            },
            '& .MuiInputBase-input': {
              fontSize: isMobile ? '14px' : '16px',
            },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start' }}>
          <Button 
            type="submit"
            variant="contained" 
            disabled={loading || !message.trim()}
            sx={{ 
              background: 'linear-gradient(135deg, #7873f5 0%, #8a85ff 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8a85ff 0%, #9b96ff 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(120, 115, 245, 0.6)',
              },
              fontSize: isMobile ? '1rem' : '1.1rem',
              padding: isMobile ? '10px 24px' : '12px 30px',
              minWidth: isMobile ? '140px' : 'auto',
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? '280px' : 'none'
            }}
            size={isMobile ? "medium" : "large"}
          >
            {loading ? (
              <CircularProgress size={isMobile ? 20 : 24} sx={{ color: 'white' }} />
            ) : (
              'Send Message'
            )}
          </Button>
        </Box>
      </form>

      {/* Additional contact information for mobile */}
      {isMobile && (
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.75rem',
            textAlign: 'center'
          }}>
            Need immediate assistance? Email us directly at support@myanimeverse.com
          </Typography>
        </Box>
      )}
    </GlassCard>
  );
};

export default ContactUs;