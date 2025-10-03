import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress, Rating, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import FeedbackIcon from '@mui/icons-material/Feedback';

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
    background: 'linear-gradient(90deg, #4cd964, #5de876)',
    borderRadius: '16px 16px 0 0',
    [theme.breakpoints.up('sm')]: {
      height: '4px',
      borderRadius: '20px 20px 0 0',
    },
  },
}));

const Feedback = () => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setMessage('Thank you for your valuable feedback! We appreciate your input.');
      setFeedback('');
      setRating(0);
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
        <FeedbackIcon sx={{ 
          fontSize: isMobile ? 28 : 32, 
          color: '#4cd964', 
          mr: isMobile ? 0 : 2,
          mb: isMobile ? 1 : 0
        }} />
        <Typography variant="h4" sx={{ 
          color: 'white', 
          fontWeight: 600,
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          fontSize: isMobile ? '1.75rem' : '2.125rem'
        }}>
          Share Your Feedback
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ 
        color: 'rgba(255, 255, 255, 0.8)', 
        mb: isMobile ? 3 : 4,
        fontSize: isMobile ? '0.9rem' : '1rem',
        lineHeight: 1.6,
        textAlign: isMobile ? 'center' : 'left'
      }}>
        We'd love to hear your thoughts! Your feedback helps us improve MyAnimeVerse for everyone.
      </Typography>

      {message && (
        <Alert severity="success" sx={{ 
          mb: 3, 
          background: 'rgba(76, 175, 80, 0.2)', 
          color: 'white',
          fontSize: isMobile ? '0.8rem' : '0.875rem',
          '& .MuiAlert-message': {
            padding: isMobile ? '4px 0' : '8px 0'
          }
        }}>
          {message}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: isMobile ? 2 : 3 }}>
          <Typography component="legend" sx={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            mb: 1,
            fontSize: isMobile ? '0.9rem' : '1rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            How would you rate your experience?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <Rating
              name="feedback-rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              size={isMobile ? "medium" : "large"}
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#4cd964',
                },
                '& .MuiRating-iconHover': {
                  color: '#5de876',
                },
                '& .MuiRating-icon': {
                  fontSize: isMobile ? '2rem' : '2.5rem',
                  margin: theme.spacing(0, 0.5)
                }
              }}
            />
          </Box>
        </Box>

        <TextField
          label="Your feedback or suggestions"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
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
                borderColor: '#4cd964',
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
            disabled={loading || !feedback.trim()}
            sx={{ 
              background: 'linear-gradient(135deg, #4cd964 0%, #5de876 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5de876 0%, #6ef886 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(76, 217, 100, 0.6)',
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
              isMobile ? 'Submit' : 'Submit Feedback'
            )}
          </Button>
        </Box>
      </form>

      {/* Additional guidance for mobile users */}
      {isMobile && (
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.75rem',
            textAlign: 'center',
            lineHeight: 1.4
          }}>
            💡 Tip: Be specific about what you love or what we can improve!
          </Typography>
        </Box>
      )}
    </GlassCard>
  );
};

export default Feedback;