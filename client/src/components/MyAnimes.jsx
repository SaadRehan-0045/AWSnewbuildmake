// components/MyAnimes.jsx
import { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Box, 
  Typography, 
  TextField,
  InputAdornment,
  styled,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Edit, 
  Delete,
  Close
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Layout from './Layout.jsx';

// Helper function to get JWT token
const getAuthToken = () => {
  return localStorage.getItem('authToken'); // or sessionStorage.getItem('authToken')
};

// Styled Components for Posts - UPDATED FOR BETTER MOBILE FIT
const GlassCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '16px',
  padding: theme.spacing(2),
  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  marginBottom: '20px',
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
  [theme.breakpoints.up('md')]: {
    borderRadius: '20px',
    padding: theme.spacing(3),
    marginBottom: '30px',
    '&::before': {
      height: '4px',
      borderRadius: '20px 20px 0 0',
    },
  },
}));

// UPDATED PostContainer for better mobile fit
const PostContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(15px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  height: '300px', // Reduced height for better mobile fit
  width: '100%',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 15px 35px rgba(120, 115, 245, 0.3)',
    borderColor: 'rgba(120, 115, 245, 0.5)',
    background: 'rgba(255, 255, 255, 0.15)',
  },
  [theme.breakpoints.up('sm')]: {
    height: '330px',
    borderRadius: '14px',
  },
  [theme.breakpoints.up('md')]: {
    height: '360px',
    borderRadius: '16px',
  },
}));

// UPDATED PostImage height for better proportions
const PostImage = styled('img')(({ theme }) => ({
  width: '100%',
  objectFit: 'cover',
  height: '110px', // Reduced height
  minHeight: '110px',
  flexShrink: 0,
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  [theme.breakpoints.up('sm')]: {
    height: '120px',
  },
  [theme.breakpoints.up('md')]: {
    height: '130px',
  },
}));

// UPDATED PostContent with less padding for mobile
const PostContent = styled(Box)(({ theme }) => ({
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  width: '100%',
  overflow: 'hidden',
  [theme.breakpoints.up('sm')]: {
    padding: '12px',
  },
  [theme.breakpoints.up('md')]: {
    padding: '14px',
  },
}));

const PostText = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '9px', // Slightly smaller
  marginBottom: '3px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  lineHeight: '1.2',
  [theme.breakpoints.up('sm')]: {
    fontSize: '10px',
    marginBottom: '4px',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '11px',
    marginBottom: '5px',
  },
}));

const PostHeading = styled(Typography)(({ theme }) => ({
  fontSize: '13px', // Slightly smaller
  fontWeight: '700',
  marginBottom: '5px',
  lineHeight: '1.2',
  color: 'white',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  width: '100%',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  [theme.breakpoints.up('sm')]: {
    fontSize: '14px',
    marginBottom: '6px',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '15px',
    marginBottom: '7px',
  },
}));

const PostDetails = styled(Typography)(({ theme }) => ({
  fontSize: '10px', // Slightly smaller
  lineHeight: '1.4',
  color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: '6px',
  flexGrow: 1,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  [theme.breakpoints.up('sm')]: {
    fontSize: '11px',
    marginBottom: '8px',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '12px',
    marginBottom: '10px',
  },
}));

const GenreChip = styled(Chip)(({ theme }) => ({
  margin: '1px',
  fontSize: '8px', // Smaller for mobile
  height: '16px',
  backgroundColor: 'rgba(120, 115, 245, 0.2)',
  color: 'white',
  border: '1px solid rgba(120, 115, 245, 0.5)',
  '& .MuiChip-label': {
    padding: '0 4px',
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '9px',
    height: '18px',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '10px',
    height: '20px',
    '& .MuiChip-label': {
      padding: '0 6px',
    },
  },
}));

// UPDATED Action buttons container - COMPACT FOR MOBILE
const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '6px',
  padding: '8px 10px', // Reduced padding
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  minHeight: '50px', // Reduced height
  alignItems: 'center',
  [theme.breakpoints.up('sm')]: {
    gap: '8px',
    padding: '10px 12px',
    minHeight: '55px',
  },
  [theme.breakpoints.up('md')]: {
    gap: '10px',
    padding: '12px 14px',
    minHeight: '60px',
  },
}));

// UPDATED Button styles - COMPACT BUT TAPPABLE
const ActionButton = styled(Button)(({ theme, ismobile }) => ({
  flex: 1,
  minHeight: ismobile === 'true' ? '36px' : '32px', // More compact but still tappable
  minWidth: 'auto',
  fontSize: ismobile === 'true' ? '11px' : '10px', // Smaller font
  fontWeight: 600,
  borderRadius: '6px',
  textTransform: 'none',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  padding: ismobile === 'true' ? '6px 4px' : '4px 3px',
  
  '& .MuiButton-startIcon': {
    margin: 0,
    marginRight: '2px',
    '& > *': {
      fontSize: ismobile === 'true' ? '14px' : '13px', // Smaller icons
    }
  },
  
  '&:active': {
    transform: 'scale(0.98)',
  },
  
  [theme.breakpoints.up('sm')]: {
    minHeight: '34px',
    fontSize: '11px',
    padding: '6px 5px',
    gap: '4px',
    '& .MuiButton-startIcon > *': {
      fontSize: '14px',
    }
  },
  
  [theme.breakpoints.up('md')]: {
    minHeight: '36px',
    fontSize: '12px',
    padding: '8px 6px',
    gap: '6px',
    '& .MuiButton-startIcon > *': {
      fontSize: '15px',
    }
  },
}));

const EditButton = styled(ActionButton)(({ theme, ismobile }) => ({
  color: 'white',
  border: '1.5px solid rgba(120, 115, 245, 0.6)',
  background: 'rgba(120, 115, 245, 0.15)',
  
  '&:hover': {
    borderColor: 'rgba(120, 115, 245, 0.9)',
    backgroundColor: 'rgba(120, 115, 245, 0.25)',
  },
  
  '&:disabled': {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.4)',
  },
}));

const DeleteButton = styled(ActionButton)(({ theme, ismobile }) => ({
  color: '#ff6b6b',
  border: '1.5px solid rgba(255, 107, 107, 0.6)',
  background: 'rgba(255, 107, 107, 0.15)',
  
  '&:hover': {
    borderColor: '#ff6b6b',
    backgroundColor: 'rgba(255, 107, 107, 0.25)',
  },
  
  '&:disabled': {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.4)',
  },
}));

// Search Bar Styled Component
const SearchContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto 20px auto', // Reduced margin
  padding: '0 8px',
  [theme.breakpoints.up('sm')]: {
    margin: '0 auto 25px auto',
    padding: '0 10px',
  },
  [theme.breakpoints.up('md')]: {
    margin: '0 auto 30px auto',
    padding: '0 12px',
  },
}));

// Styled TextField for search
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    borderRadius: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    fontSize: '14px',
    height: '44px',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(120, 115, 245, 0.8)',
      borderWidth: '2px',
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '15px',
      height: '46px',
      borderRadius: '22px',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '16px',
      height: '48px',
      borderRadius: '24px',
    },
  },
}));

// Individual Post Component - OPTIMIZED FOR MOBILE GRID
const Post = ({ post, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const url = post.picture ? `http://localhost:8080/file/${post.picture}` : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=752&q=80';
  
  const addEllipsis = (str, limit) => {
    return str && str.length > limit ? str.substring(0, limit) + '...' : str;
  };

  const handlePostClick = () => {
    navigate(`/details/${post.postId}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit(post);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(post);
  };

  return (
    <PostContainer>
      <PostImage 
        src={url} 
        alt="post" 
        onClick={handlePostClick}
        style={{ cursor: 'pointer' }}
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixid=MnwxMjA3fDB8MHxwa90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=752&q=80';
        }}
      />
      
      <PostContent onClick={handlePostClick} style={{ cursor: 'pointer' }}>
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            mb: 0.5, // Reduced margin
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 0.5 : 0
          }}>
            <PostText>{post.category || 'Anime'}</PostText>
            {post.genres && post.genres.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: isMobile ? 'flex-start' : 'flex-end',
                maxWidth: isMobile ? '100%' : '60%',
                gap: '2px'
              }}>
                {post.genres.slice(0, isMobile ? 1 : 2).map((genre, index) => (
                  <GenreChip 
                    key={index} 
                    label={genre} 
                    size="small"
                    variant="outlined"
                  />
                ))}
                {post.genres.length > (isMobile ? 1 : 2) && (
                  <GenreChip 
                    label={`+${post.genres.length - (isMobile ? 1 : 2)}`} 
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            )}
          </Box>
          <PostHeading title={post.title}>
            {addEllipsis(post.title, isMobile ? 20 : 25)}
          </PostHeading>
          <PostDetails>
            {addEllipsis(post.description, isMobile ? 50 : 70)}
          </PostDetails>
        </Box>
      </PostContent>

      {/* COMPACT ACTION BUTTONS */}
      <ActionButtons>
        <EditButton
          variant="outlined"
          ismobile={isMobile.toString()}
          startIcon={<Edit />}
          onClick={handleEditClick}
        >
          Edit
        </EditButton>
        
        <DeleteButton
          variant="outlined"
          ismobile={isMobile.toString()}
          startIcon={<Delete />}
          onClick={handleDeleteClick}
        >
          Delete
        </DeleteButton>
      </ActionButtons>
    </PostContainer>
  );
};

// Posts Component - UPDATED GRID FOR BETTER MOBILE FIT
const MyPosts = ({ searchQuery }) => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [processing, setProcessing] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchPosts = useCallback(async () => {
    try {
      if (isLoading) return;
      if (!isAuthenticated) {
        setPosts([]);
        setFilteredPosts([]);
        setLoading(false);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        showSnackbar('Please login to view your posts', 'error');
        return;
      }

      const response = await axios.get('http://localhost:8080/my-posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setPosts(response.data.posts);
        setFilteredPosts(response.data.posts);
      } else {
        showSnackbar('Error fetching your posts', 'error');
      }
      
    } catch (error) {
      console.error("Error fetching user posts:", error);
      if (error.response?.status === 401) {
        showSnackbar('Please login to view your posts', 'error');
        // Optional: Redirect to login page or clear token
        localStorage.removeItem('authToken');
      } else {
        showSnackbar('Error fetching your posts', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, isLoading]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleEdit = (post) => {
    if (post && post.postId) {
      navigate(`/update/${post.postId}`);
    } else {
      showSnackbar('Cannot edit post: Missing post information', 'error');
    }
  };

  const handleDelete = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    
    setProcessing(true);
    try {
      const token = getAuthToken();
      const response = await axios.delete(`http://localhost:8080/posts/${postToDelete.postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        showSnackbar('Post deleted successfully', 'success');
        await fetchPosts();
      } else {
        showSnackbar('Failed to delete post', 'error');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      if (error.response?.status === 401) {
        showSnackbar('Your session has expired. Please login again.', 'error');
        localStorage.removeItem('authToken');
      } else {
        showSnackbar('Error deleting post', 'error');
      }
    } finally {
      setProcessing(false);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  if (loading) {
    return (
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Grid>
    );
  }

  return (
    <>
      {filteredPosts && filteredPosts.length > 0 ? (
        filteredPosts.map(post => (
          <Grid item xs={6} sm={4} md={3} lg={2.4} key={post.postId || post._id}
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              padding: isMobile ? '4px' : '8px' // Reduced padding
            }}
          >
            <Box sx={{ 
              width: '100%', 
              maxWidth: isMobile ? '140px' : '220px', // Adjusted max width
              minWidth: isMobile ? '120px' : 'auto'
            }}>
              <Post post={post} onEdit={handleEdit} onDelete={handleDelete} />
            </Box>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Box sx={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            margin: '20px auto', 
            fontSize: isMobile ? '13px' : '15px',
            textAlign: 'center',
            width: '100%',
            padding: isMobile ? '12px' : '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
          }}>
            {searchQuery ? `No anime found for "${searchQuery}"` : 'You haven\'t posted any anime yet. Start by adding your first anime!'}
          </Box>
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={cancelDelete}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            m: isMobile ? 0 : 2,
            ...(isMobile && { height: '100%', borderRadius: 0 }),
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          background: 'rgba(255, 255, 255, 0.1)',
          fontSize: isMobile ? '1rem' : '1.2rem',
          py: isMobile ? 1.5 : 2.5
        }}>
          Delete Post
          <IconButton
            aria-label="close"
            onClick={cancelDelete}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: isMobile ? 1.5 : 2 }}>
          <Typography sx={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            mt: 1,
            fontSize: isMobile ? '13px' : '15px'
          }}>
            Are you sure you want to delete the post "{postToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: isMobile ? 1.5 : 2,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1.5 : 1
        }}>
          <Button 
            onClick={cancelDelete} 
            disabled={processing}
            sx={{ 
              color: 'white',
              width: isMobile ? '100%' : 'auto',
              fontSize: isMobile ? '13px' : '15px',
              minHeight: isMobile ? '42px' : 'auto',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
            }}
            size={isMobile ? 'medium' : 'small'}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={16} /> : <Delete />}
            sx={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #c44569 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #ff7b7b 0%, #d45579 100%)' },
              width: isMobile ? '100%' : 'auto',
              fontSize: isMobile ? '13px' : '15px',
              minHeight: isMobile ? '42px' : 'auto',
            }}
            size={isMobile ? 'medium' : 'small'}
          >
            {processing ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Main MyAnimes Component
const MyAnimes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isLoading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Layout title="My Animes">
      <Box sx={{ 
        width: '100%', 
        padding: isMobile ? '8px' : '16px', // Reduced padding
        maxWidth: '1800px',
        margin: '0 auto',
        boxSizing: 'border-box',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <GlassCard sx={{ textAlign: 'center', mb: isMobile ? 2 : 3 }}>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: '800',
            color: 'white',
            margin: 0,
            fontSize: isMobile ? '1.1rem' : { xs: '1.3rem', md: '1.8rem' },
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          }}>
            My Animes
          </Typography>
          <Typography variant="body1" sx={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            mt: 0.5,
            fontSize: isMobile ? '0.8rem' : '0.9rem'
          }}>
            Manage your anime collection
          </Typography>
        </GlassCard>

        {/* Show content if authenticated */}
        {isAuthenticated && !isLoading ? (
          <>
            {/* Search Bar */}
            <SearchContainer>
              <StyledTextField
                fullWidth
                variant="outlined"
                placeholder="Search your animes by name..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: isMobile ? '18px' : '20px'
                      }} />
                    </InputAdornment>
                  ),
                }}
              />
            </SearchContainer>

            {/* Grid container with adjusted spacing */}
            <Box sx={{ 
              width: '100%',
              padding: isMobile ? '0 2px' : '0 6px' // Reduced padding
            }}>
              <Grid 
                container 
                spacing={isMobile ? 0.5 : 2} // Reduced spacing
                sx={{
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}
              >
                <MyPosts searchQuery={searchQuery} />
              </Grid>
            </Box>
          </>
        ) : (
          <>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <CircularProgress sx={{ color: 'white' }} />
              </Box>
            ) : (
              <GlassCard sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: isMobile ? '0.9rem' : '1.1rem'
                }}>
                  Please log in to view your anime posts.
                </Typography>
              </GlassCard>
            )}
          </>
        )}
      </Box>
    </Layout>
  );
};

export default MyAnimes;